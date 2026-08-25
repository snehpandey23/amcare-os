#!/usr/bin/env python3
"""
Phase-3 → WorkDrive sync (TEST MODE by default).

Gates (all required; otherwise skip + log, exit 0):
  1. Git ref is main (GITHUB_REF / --branch / --assume-main)
  2. Pack has SHIP.md with phase: 3 and status approved
  3. CLOUD-PACK-TRACKER.csv row for that Insight ID matches Approved|Ready

Destination is hard-locked to paths/IDs under _API-DRY-RUN (test config).
Never writes live 04/05/06/07 at the Knowledge Editorial root.

Transports:
  fs  — write under WORKDRIVE_DRYRUN_FS_ROOT (TrueSync dry-run tree)
  api — Zoho WorkDrive API using GitHub Actions secrets / env
        (ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN,
         WORKDRIVE_DRYRUN_04_ID … _07_ID)

Usage:
  python3 workdrive_phase3_sync.py --config workdrive_sync_config.test.json \\
    --insight-id TEST-… --assume-main --transport fs

  python3 workdrive_phase3_sync.py --config … --discover-shipped --assume-main
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[4]
BRAND = REPO_ROOT / "apps" / "siya-health" / "brand"


def log(msg: str) -> None:
    print(msg, flush=True)


def load_config(path: Path) -> dict[str, Any]:
    cfg = json.loads(path.read_text())
    if cfg.get("mode") != "test":
        raise SystemExit("Refusing to run: config.mode must be 'test' until live is explicitly enabled.")
    if cfg.get("require_path_substring") != "_API-DRY-RUN":
        raise SystemExit("Refusing to run: test config must require_path_substring=_API-DRY-RUN")
    return cfg


def resolve_fs_root(cfg: dict[str, Any]) -> Path:
    env_key = cfg.get("fs_root_env", "WORKDRIVE_DRYRUN_FS_ROOT")
    raw = os.environ.get(env_key) or cfg.get("fs_root_default_macos", "")
    root = Path(os.path.expanduser(raw)).resolve()
    needle = cfg["require_path_substring"]
    if needle not in str(root):
        raise SystemExit(f"Refusing FS root {root}: must contain {needle!r}")
    # Extra guard: never the live Knowledge Editorial root itself
    if root.name in {"04-Content-Tracker", "05-Carousels", "06-Statics", "07-Video-Prompts"}:
        raise SystemExit(f"Refusing FS root that looks like a live folder: {root}")
    if root.name != "_API-DRY-RUN" and "_API-DRY-RUN" not in root.parts:
        raise SystemExit(f"Refusing FS root outside _API-DRY-RUN: {root}")
    return root


def current_branch(cli_branch: str | None, assume_main: bool) -> str:
    if assume_main:
        return "main"
    if cli_branch:
        return cli_branch
    ref = os.environ.get("GITHUB_REF_NAME") or os.environ.get("GITHUB_REF", "")
    if ref.startswith("refs/heads/"):
        return ref.split("/")[-1]
    if ref and "/" not in ref:
        return ref
    # local fallback
    try:
        import subprocess

        out = subprocess.check_output(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=REPO_ROOT,
            text=True,
        ).strip()
        return out
    except Exception:
        return ""


def gate_branch(branch: str) -> bool:
    if branch != "main":
        log(f"SKIP: branch is {branch!r}, not main")
        return False
    return True


def parse_ship_md(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    meta: dict[str, str] = {}
    # YAML frontmatter
    if text.startswith("---"):
        end = text.find("\n---", 3)
        block = text[3:end] if end != -1 else ""
        for line in block.splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip().lower()] = v.strip().strip('"').strip("'")
    # Also accept loose KEY: value lines
    for line in text.splitlines():
        if re.match(r"^(phase|status|insight_id|kind)\s*:", line, re.I):
            k, v = line.split(":", 1)
            meta[k.strip().lower()] = v.strip().strip('"').strip("'")
    return meta


def ship_ok(ship: dict[str, str], insight_id: str) -> bool:
    phase = str(ship.get("phase", "")).strip()
    status = str(ship.get("status", "")).strip().lower()
    sid = str(ship.get("insight_id", "")).strip()
    if phase not in {"3", "phase 3", "phase3"}:
        log(f"SKIP: SHIP.md phase={phase!r} (need 3) for {insight_id}")
        return False
    if status not in {"approved", "ready", "approved/ready"}:
        log(f"SKIP: SHIP.md status={status!r} (need approved|ready) for {insight_id}")
        return False
    if sid and sid != insight_id:
        log(f"SKIP: SHIP.md insight_id={sid!r} != folder {insight_id!r}")
        return False
    return True


def tracker_status(cfg: dict[str, Any], insight_id: str) -> str | None:
    csv_path = REPO_ROOT / cfg["tracker_csv_git"]
    if not csv_path.is_file():
        log(f"SKIP: tracker CSV missing at {csv_path}")
        return None
    with csv_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rid = (row.get("Insight ID") or "").strip()
            if rid == insight_id:
                return (row.get("Status") or "").strip()
    log(f"SKIP: no tracker row for {insight_id}")
    return None


def tracker_approved(cfg: dict[str, Any], insight_id: str) -> bool:
    status = tracker_status(cfg, insight_id)
    if status is None:
        return False
    if not re.search(cfg["approved_status_regex"], status):
        log(f"SKIP: tracker Status={status!r} not Approved/Ready for {insight_id}")
        return False
    return True


def pack_paths(insight_id: str) -> tuple[Path | None, str]:
    carousel = BRAND / "editorial-packs" / insight_id
    static = BRAND / "statics" / insight_id
    if (carousel / "SHIP.md").is_file():
        return carousel, "carousel"
    if (static / "SHIP.md").is_file():
        return static, "static"
    return None, ""


def validate_pack(cfg: dict[str, Any], pack_dir: Path, kind: str) -> bool:
    # captions required
    ok_cap = False
    for rel in cfg["required_caption_files_any"]:
        if (pack_dir / rel).is_file():
            ok_cap = True
            break
    if not ok_cap:
        log(f"SKIP: missing captions under {pack_dir.name} (need one of {cfg['required_caption_files_any']})")
        return False
    ready = pack_dir / "ready-to-post"
    if not ready.is_dir():
        log(f"SKIP: missing ready-to-post/ in {pack_dir.name}")
        return False
    pngs = list(ready.glob("*.png")) + list(ready.glob("*.jpg"))
    if not pngs:
        log(f"SKIP: no images in ready-to-post/ for {pack_dir.name}")
        return False
    return True


def discover_shipped() -> list[str]:
    ids: list[str] = []
    for base in (BRAND / "editorial-packs", BRAND / "statics"):
        if not base.is_dir():
            continue
        for d in sorted(base.iterdir()):
            if d.is_dir() and (d / "SHIP.md").is_file():
                ids.append(d.name)
    return ids


# --- FS transport ---


def fs_ensure_dirs(root: Path) -> None:
    for name in ("04-Content-Tracker", "05-Carousels", "06-Statics", "07-Video-Prompts"):
        (root / name).mkdir(parents=True, exist_ok=True)


def fs_sync_pack(root: Path, pack_dir: Path, kind: str, insight_id: str) -> list[Path]:
    written: list[Path] = []
    if kind == "carousel":
        dest = root / "05-Carousels" / insight_id
    else:
        dest = root / "06-Statics" / insight_id
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(pack_dir, dest)
    written.append(dest)

    vp = pack_dir / "video-prompt.md"
    if vp.is_file():
        dest_vp = root / "07-Video-Prompts" / f"{insight_id}-video-prompt.md"
        dest_vp.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(vp, dest_vp)
        written.append(dest_vp)

    # also mirror from brand/video-prompts if present
    alt = BRAND / "video-prompts" / f"{insight_id}-video-prompt.md"
    if alt.is_file():
        dest_vp = root / "07-Video-Prompts" / f"{insight_id}-video-prompt.md"
        shutil.copy2(alt, dest_vp)
        written.append(dest_vp)
    return written


def fs_sync_tracker(cfg: dict[str, Any], root: Path) -> Path:
    src = REPO_ROOT / cfg["tracker_csv_git"]
    dest = root / "04-Content-Tracker" / cfg["tracker_csv_dest_name"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    return dest


def count_files(path: Path) -> int:
    if not path.exists():
        return 0
    if path.is_file():
        return 1
    return sum(1 for p in path.rglob("*") if p.is_file())


# --- API transport (optional; used when secrets present) ---


def zoho_access_token() -> str:
    client_id = os.environ.get("ZOHO_CLIENT_ID", "")
    client_secret = os.environ.get("ZOHO_CLIENT_SECRET", "")
    refresh = os.environ.get("ZOHO_REFRESH_TOKEN", "")
    accounts = os.environ.get("ZOHO_ACCOUNTS_URL", "https://accounts.zoho.com").rstrip("/")
    if not (client_id and client_secret and refresh):
        raise SystemExit(
            "API transport needs ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN in env/secrets"
        )
    data = urllib.parse.urlencode(
        {
            "grant_type": "refresh_token",
            "client_id": client_id,
            "client_secret": client_secret,
            "refresh_token": refresh,
        }
    ).encode()
    req = urllib.request.Request(
        f"{accounts}/oauth/v2/token",
        data=data,
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        payload = json.loads(resp.read().decode())
    token = payload.get("access_token")
    if not token:
        raise SystemExit(f"Zoho token refresh failed: keys={list(payload.keys())}")
    return token


def api_parent_ids(cfg: dict[str, Any]) -> dict[str, str]:
    out: dict[str, str] = {}
    for folder, env_key in cfg["api"]["parent_folder_ids_from_env"].items():
        val = os.environ.get(env_key, "").strip()
        if not val:
            raise SystemExit(f"Missing env {env_key} for dry-run folder {folder}")
        # Soft check: document that IDs must be under _API-DRY-RUN; cannot verify name via API without GET
        out[folder] = val
    return out


def api_upload_file(token: str, parent_id: str, local_path: Path, upload_url: str) -> None:
    # multipart upload
    boundary = "----SiyaWorkDriveBoundary7MA4YWxkTrZu0gW"
    filename = local_path.name
    body = bytearray()
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(
        f'Content-Disposition: form-data; name="filename"\r\n\r\n{filename}\r\n'.encode()
    )
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(b'Content-Disposition: form-data; name="parent_id"\r\n\r\n')
    body.extend(f"{parent_id}\r\n".encode())
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(b'Content-Disposition: form-data; name="override-name-exist"\r\n\r\ntrue\r\n')
    body.extend(f"--{boundary}\r\n".encode())
    body.extend(
        (
            f'Content-Disposition: form-data; name="content"; filename="{filename}"\r\n'
            f"Content-Type: application/octet-stream\r\n\r\n"
        ).encode()
    )
    body.extend(local_path.read_bytes())
    body.extend(f"\r\n--{boundary}--\r\n".encode())
    url = f"{upload_url}?filename={urllib.parse.quote(filename)}&parent_id={parent_id}&override-name-exist=true"
    req = urllib.request.Request(
        url,
        data=bytes(body),
        method="POST",
        headers={
            "Authorization": f"Zoho-oauthtoken {token}",
            "Accept": "application/vnd.api+json",
            "User-Agent": "siya-workdrive-phase3-sync/1.0",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            resp.read()
    except urllib.error.HTTPError as e:
        err = e.read().decode(errors="replace")
        raise SystemExit(f"Upload failed {local_path}: HTTP {e.code} {err[:500]}") from e


def _workdrive_headers(token: str, *, json_body: bool = False) -> dict[str, str]:
    # WorkDrive is JSON:API — missing Accept → HTTP 415
    headers = {
        "Authorization": f"Zoho-oauthtoken {token}",
        "Accept": "application/vnd.api+json",
        "User-Agent": "siya-workdrive-phase3-sync/1.0",
    }
    if json_body:
        headers["Content-Type"] = "application/vnd.api+json"
    return headers


def _extract_resource_id(data: dict[str, Any]) -> str:
    raw = data.get("data")
    if isinstance(raw, dict):
        return str(raw.get("id") or "")
    if isinstance(raw, list) and raw:
        return str(raw[0].get("id") or "")
    return ""


def api_find_child_folder(token: str, parent_id: str, name: str, files_url: str) -> str:
    """Return existing child folder id under parent, or empty string."""
    q = urllib.parse.urlencode({"filter[parent_id]": parent_id})
    url = f"{files_url}?{q}"
    req = urllib.request.Request(url, method="GET", headers=_workdrive_headers(token))
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        err = e.read().decode(errors="replace")
        log(f"WARN: list children of {parent_id}: HTTP {e.code} {err[:200]}")
        return ""
    items = data.get("data") or []
    if isinstance(items, dict):
        items = [items]
    for item in items:
        attrs = item.get("attributes") or {}
        if attrs.get("name") == name and attrs.get("type") == "folder":
            return str(item.get("id") or "")
        # Some responses use is_folder / kind
        if attrs.get("name") == name and (
            attrs.get("is_folder") is True or attrs.get("resource_type") == "folder"
        ):
            return str(item.get("id") or "")
    return ""


def api_create_folder(token: str, parent_id: str, name: str, files_url: str) -> str:
    existing = api_find_child_folder(token, parent_id, name, files_url)
    if existing:
        log(f"  reuse folder {name!r} → {existing}")
        return existing

    payload = json.dumps(
        {
            "data": {
                "attributes": {"name": name, "parent_id": parent_id},
                "type": "files",
            }
        }
    ).encode()
    req = urllib.request.Request(
        files_url,
        data=payload,
        method="POST",
        headers=_workdrive_headers(token, json_body=True),
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode())
        fid = _extract_resource_id(data)
        if fid:
            return fid
        log(f"WARN: create folder {name!r}: no id in response keys={list(data.keys())}")
        return ""
    except urllib.error.HTTPError as e:
        err = e.read().decode(errors="replace")
        log(f"WARN: create folder {name!r}: HTTP {e.code} {err[:300]}")
        # Race / already exists
        return api_find_child_folder(token, parent_id, name, files_url)


def api_sync_tree(
    token: str,
    parent_id: str,
    local_dir: Path,
    files_url: str,
    upload_url: str,
    folder_cache: dict[str, str],
) -> int:
    """Upload all files under local_dir into WorkDrive parent, creating subfolders as needed."""
    count = 0
    for path in sorted(local_dir.rglob("*")):
        if not path.is_file():
            continue
        rel = path.relative_to(local_dir)
        # ensure nested folders
        cur_parent = parent_id
        for part in rel.parts[:-1]:
            key = f"{cur_parent}/{part}"
            if key not in folder_cache:
                fid = api_create_folder(token, cur_parent, part, files_url)
                if not fid:
                    raise SystemExit(
                        f"Cannot create/find WorkDrive subfolder {part} under {cur_parent}"
                    )
                folder_cache[key] = fid
            cur_parent = folder_cache[key]
        api_upload_file(token, cur_parent, path, upload_url)
        count += 1
        log(f"  uploaded {rel}")
    return count


def sync_one(
    cfg: dict[str, Any],
    insight_id: str,
    branch: str,
    transport: str,
) -> str:
    """Returns 'synced' | 'skipped'."""
    if not gate_branch(branch):
        return "skipped"

    pack_dir, kind = pack_paths(insight_id)
    if not pack_dir:
        log(f"SKIP: no SHIP.md pack folder for {insight_id}")
        return "skipped"

    ship = parse_ship_md(pack_dir / "SHIP.md")
    if not ship_ok(ship, insight_id):
        return "skipped"
    if not tracker_approved(cfg, insight_id):
        return "skipped"
    if not validate_pack(cfg, pack_dir, kind):
        return "skipped"

    log(f"SYNC: {insight_id} ({kind}) via {transport}")

    if transport == "fs":
        root = resolve_fs_root(cfg)
        fs_ensure_dirs(root)
        written = fs_sync_pack(root, pack_dir, kind, insight_id)
        tracker_dest = fs_sync_tracker(cfg, root)
        log(f"  pack → {written[0]} ({count_files(written[0])} files)")
        log(f"  tracker → {tracker_dest}")
        return "synced"

    if transport == "api":
        token = zoho_access_token()
        parents = api_parent_ids(cfg)
        upload_url = cfg["api"]["upload_url"]
        files_url = cfg["api"]["folders_url"]
        cache: dict[str, str] = {}
        # create insight folder under 05 or 06
        top_key = "05-Carousels" if kind == "carousel" else "06-Statics"
        top_id = parents[top_key]
        pack_folder_id = api_create_folder(token, top_id, insight_id, files_url)
        if not pack_folder_id:
            raise SystemExit(f"Failed to create WorkDrive folder {insight_id} under {top_key}")
        n = api_sync_tree(token, pack_folder_id, pack_dir, files_url, upload_url, cache)
        log(f"  uploaded {n} pack files to {top_key}/{insight_id}")
        vp = pack_dir / "video-prompt.md"
        if vp.is_file():
            # upload into 07 as a single file (create temp name via upload to 07 parent)
            api_upload_file(token, parents["07-Video-Prompts"], vp, upload_url)
            # rename not always available — upload uses video-prompt.md; also copy as insight-named via temp
            named = pack_dir / f"{insight_id}-video-prompt.md"
            if not named.is_file():
                shutil.copy2(vp, named)
                try:
                    api_upload_file(token, parents["07-Video-Prompts"], named, upload_url)
                finally:
                    if named.name != "video-prompt.md":
                        named.unlink(missing_ok=True)
        tracker = REPO_ROOT / cfg["tracker_csv_git"]
        api_upload_file(token, parents["04-Content-Tracker"], tracker, upload_url)
        log("  tracker CSV uploaded to 04-Content-Tracker")
        return "synced"

    raise SystemExit(f"Unknown transport {transport}")


def main() -> int:
    ap = argparse.ArgumentParser(description="Phase-3 WorkDrive sync (TEST mode)")
    ap.add_argument(
        "--config",
        default=str(Path(__file__).with_name("workdrive_sync_config.test.json")),
    )
    ap.add_argument("--insight-id", action="append", default=[])
    ap.add_argument("--discover-shipped", action="store_true")
    ap.add_argument("--branch", default=None)
    ap.add_argument("--assume-main", action="store_true")
    ap.add_argument("--transport", choices=["fs", "api"], default=None)
    args = ap.parse_args()

    cfg = load_config(Path(args.config))
    transport = args.transport or os.environ.get("WORKDRIVE_SYNC_TRANSPORT") or cfg.get("transport", "fs")
    branch = current_branch(args.branch, args.assume_main)

    log(f"workdrive_phase3_sync mode=test transport={transport} branch={branch!r}")

    ids = list(args.insight_id)
    if args.discover_shipped:
        ids.extend(discover_shipped())
    ids = sorted(set(ids))

    if not ids:
        log("SKIP: no insight IDs (pass --insight-id or --discover-shipped)")
        return 0

    synced = 0
    skipped = 0
    for iid in ids:
        result = sync_one(cfg, iid, branch, transport)
        if result == "synced":
            synced += 1
        else:
            skipped += 1

    log(f"DONE synced={synced} skipped={skipped}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
