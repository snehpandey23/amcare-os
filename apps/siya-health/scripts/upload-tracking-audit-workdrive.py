#!/usr/bin/env python3
"""
Upload monthly tracking-audit markdown to Zoho WorkDrive.

Reuses OAuth + upload helpers from workdrive_phase3_sync.py (same secrets as
the cloud content / Phase-3 pipeline):

  ZOHO_CLIENT_ID · ZOHO_CLIENT_SECRET · ZOHO_REFRESH_TOKEN · ZOHO_ACCOUNTS_URL

Destination (cloud API lane — same tree as Phase-3 dry-run):

  Siya Knowledge Editorial / _API-DRY-RUN / 08-Tracking-Audits /

Parent resolution: sibling of WORKDRIVE_DRYRUN_04_ID (…/_API-DRY-RUN/04-Content-Tracker),
create-or-find folder named 08-Tracking-Audits, then upload the .md summary.

Usage:
  python3 apps/siya-health/scripts/upload-tracking-audit-workdrive.py \\
    --md apps/siya-health/docs/tracking-audits/2026-10.md
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "apps/siya-health/brand/scripts"))

from workdrive_phase3_sync import (  # noqa: E402
    _api_bases,
    _wd_headers,
    api_create_folder,
    api_find_child_id,
    api_upload_file,
    zoho_access_token,
)

FOLDER_NAME = "08-Tracking-Audits"
TRUE_SYNC_PATH = (
    "Common Folder/Siya Knowledge Editorial/_API-DRY-RUN/08-Tracking-Audits/"
)


def api_get_parent_id(token: str, file_id: str) -> str:
    """Return parent_id for a WorkDrive file/folder resource."""
    last_err = ""
    for base in _api_bases():
        url = f"{base}/files/{file_id}"
        req = urllib.request.Request(url, method="GET", headers=_wd_headers(token))
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                payload = json.loads(resp.read().decode())
            data = payload.get("data") or {}
            attrs = data.get("attributes") or {}
            parent = attrs.get("parent_id") or attrs.get("parentId") or ""
            if not parent:
                # relationships.parent.data.id
                rel = (data.get("relationships") or {}).get("parent") or {}
                rel_data = rel.get("data") or {}
                if isinstance(rel_data, dict):
                    parent = rel_data.get("id") or ""
            if parent:
                return str(parent)
            last_err = f"{base} no parent_id in response keys={list(attrs.keys())}"
        except urllib.error.HTTPError as e:
            last_err = f"{base} HTTP {e.code} {e.read().decode(errors='replace')[:200]}"
            continue
    raise SystemExit(f"Could not resolve parent of {file_id}: {last_err}")


def ensure_tracking_audits_folder(token: str) -> str:
    dry04 = "".join(os.environ.get("WORKDRIVE_DRYRUN_04_ID", "").split())
    if not dry04:
        raise SystemExit("Missing WORKDRIVE_DRYRUN_04_ID (same secret as Phase-3 sync)")
    # Optional override: direct folder id for 08-Tracking-Audits
    override = "".join(os.environ.get("WORKDRIVE_TRACKING_AUDIT_FOLDER_ID", "").split())
    if override:
        print(f"Using WORKDRIVE_TRACKING_AUDIT_FOLDER_ID …{override[-6:]}")
        return override
    dryrun_root = api_get_parent_id(token, dry04)
    print(f"Resolved _API-DRY-RUN root from DRYRUN_04 parent …{dryrun_root[-6:]}")
    existing = api_find_child_id(token, dryrun_root, FOLDER_NAME)
    if existing:
        print(f"Found existing {FOLDER_NAME} …{existing[-6:]}")
        return existing
    created = api_create_folder(token, dryrun_root, FOLDER_NAME)
    print(f"Created {FOLDER_NAME} …{created[-6:]}")
    return created


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--md", required=True, help="Path to tracking audit .md summary")
    args = ap.parse_args()
    md = Path(args.md).resolve()
    if not md.is_file() or md.suffix.lower() != ".md":
        raise SystemExit(f"Expected .md file, got {md}")

    token = zoho_access_token()
    folder_id = ensure_tracking_audits_folder(token)
    api_upload_file(token, folder_id, md, upload_name=md.name)
    print(f"Uploaded {md.name}")
    print(f"WorkDrive path: {TRUE_SYNC_PATH}{md.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
