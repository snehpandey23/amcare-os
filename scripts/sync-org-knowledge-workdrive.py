#!/usr/bin/env python3
"""
Mirror approved org knowledge into WorkDrive TrueSync SiyaOS (Mac lane).

Sources ONLY:
  - docs/siyaos-knowledge-base/** topics with status: live
  - docs/siyaos-knowledge-base/decisions/* (md + seed JSON)
  - Optional: live siya_sops from DATABASE_URL if available

Does NOT copy:
  - provisional / draft KB topics
  - legacy unaudited SiyaOS draft dumps
  - Rebecca personal Claude workspace

Run:
  python3 scripts/sync-org-knowledge-workdrive.py
"""
from __future__ import annotations

import json
import re
import shutil
from datetime import date, datetime, timezone
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
KB = REPO / "docs" / "siyaos-knowledge-base"
TRUESYNC_SIYAOS = Path.home() / (
    "Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/"
    "Common Folder/SiyaOS"
)
ROOT = TRUESYNC_SIYAOS / "Org-Knowledge-Approved"
STAMP = date.today().isoformat()

# Portal / Ask department names → folder
DEPTS = [
    "Clinical-Operations",
    "Marketing",
    "Accounts",
    "HR",
    "Compliance",
    "Technology",
    "Leadership",
]

# git module path prefix → department folder
MODULE_TO_DEPT = {
    "01-executive-vision": "Leadership",
    "04-clinical-operations": "Clinical-Operations",
    "05-marketing-os": "Marketing",
    "08-technology": "Technology",
    "09-ai-strategy": "Technology",
    "10-hr": "HR",
    "11-operations": "Clinical-Operations",
    "12-finance": "Accounts",
    "13-legal-compliance": "Compliance",
    "18-brand": "Marketing",
    "decisions": "Leadership",
}

PORTAL_DEPT_SLUG = {
    "clinical_operations": "Clinical-Operations",
    "clinical-operations": "Clinical-Operations",
    "clinical": "Clinical-Operations",
    "marketing": "Marketing",
    "accounts": "Accounts",
    "hr": "HR",
    "people": "HR",
    "compliance": "Compliance",
    "technology": "Technology",
    "tech": "Technology",
    "leadership": "Leadership",
    "finance": "Accounts",
    "operations": "Clinical-Operations",
}


def parse_frontmatter(text: str) -> dict[str, str]:
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    meta: dict[str, str] = {}
    for line in parts[1].splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        meta[k.strip()] = v.strip().strip('"').strip("'")
    return meta


def provenance_header(source: str, status: str, extra: str = "") -> str:
    lines = [
        "<!--",
        "  PROVENANCE (Org-Knowledge-Approved mirror)",
        f"  synced_at: {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ')}",
        f"  source: {source}",
        f"  trust: {status}",
        "  rule: Do not add unaudited drafts here. Promote via git KB or portal SOP review.",
        "  excluded: Rebecca personal Claude workspace (not inventoried).",
        "  lane: Mac TrueSync → Common Folder/SiyaOS/Org-Knowledge-Approved/",
    ]
    if extra:
        lines.append(f"  note: {extra}")
    lines.append("-->")
    lines.append("")
    return "\n".join(lines)


def write_text(path: Path, body: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body, encoding="utf-8")


def main() -> None:
    if not TRUESYNC_SIYAOS.is_dir():
        raise SystemExit(f"TrueSync SiyaOS root missing: {TRUESYNC_SIYAOS}")

    # Rebuild approved mirror cleanly each run (idempotent)
    if ROOT.exists():
        shutil.rmtree(ROOT)
    ROOT.mkdir(parents=True)

    for d in DEPTS:
        (ROOT / d / "01-git-kb-live").mkdir(parents=True)
        (ROOT / d / "02-portal-sops-live").mkdir(parents=True)
        (ROOT / d / "03-decisions-live").mkdir(parents=True)

    (ROOT / "00-START-HERE").mkdir(parents=True)

    uploaded: list[dict] = []

    # --- Live git KB topics ---
    for path in sorted(KB.rglob("*.md")):
        rel = path.relative_to(KB)
        parts = rel.parts
        if len(parts) < 2:
            continue
        module = parts[0]
        # topics under modules, or decisions/*.md
        if module == "decisions":
            if path.name == "README.md":
                continue
            dept = "Leadership"
            kind = "decision-md"
        elif "topics" in parts and module in MODULE_TO_DEPT:
            dept = MODULE_TO_DEPT[module]
            kind = "git-kb-topic"
        else:
            continue

        text = path.read_text(encoding="utf-8", errors="replace")
        meta = parse_frontmatter(text)
        status = meta.get("status", "")
        if kind == "git-kb-topic" and status != "live":
            continue
        # decision md files without status: treat as approved if in decisions/ (seeded founder decisions)
        if kind == "decision-md" and status and status not in ("live", "approved", ""):
            if status in ("provisional", "draft"):
                continue

        tid = meta.get("id") or path.stem
        title = meta.get("title") or path.stem
        dest_dir = ROOT / dept / ("03-decisions-live" if kind == "decision-md" else "01-git-kb-live")
        dest = dest_dir / f"{tid}.md"
        header = provenance_header(
            source=f"git:docs/siyaos-knowledge-base/{rel.as_posix()}",
            status="live-approved" if status in ("live", "", "approved") else status,
            extra=f"id={tid}; title={title}",
        )
        write_text(dest, header + text)
        uploaded.append(
            {
                "path": str(dest.relative_to(ROOT)),
                "source": f"docs/siyaos-knowledge-base/{rel.as_posix()}",
                "trust": "live-approved",
                "department": dept,
                "id": tid,
            }
        )

    # Marketing OS frozen docs (explicitly approved via decision log)
    for name in ("MARKETING-OS-v1.0.md", "MARKETING-OS-v1.1.md"):
        src = KB / "05-marketing-os" / name
        if not src.exists():
            continue
        text = src.read_text(encoding="utf-8", errors="replace")
        dest = ROOT / "Marketing" / "01-git-kb-live" / name
        header = provenance_header(
            source=f"git:docs/siyaos-knowledge-base/05-marketing-os/{name}",
            status="live-approved (Marketing OS frozen decision)",
        )
        write_text(dest, header + text)
        uploaded.append(
            {
                "path": str(dest.relative_to(ROOT)),
                "source": f"docs/siyaos-knowledge-base/05-marketing-os/{name}",
                "trust": "live-approved",
                "department": "Marketing",
                "id": name,
            }
        )

    # Decision seed JSON (canonical leadership decision log)
    seed = KB / "decisions" / "siya-decisions-seed.json"
    if seed.exists():
        raw = seed.read_text(encoding="utf-8")
        dest = ROOT / "Leadership" / "03-decisions-live" / "siya-decisions-seed.json"
        # JSON can't take HTML comment; wrap with sidecar README instead
        write_text(dest, raw)
        sidecar = ROOT / "Leadership" / "03-decisions-live" / "README-PROVENANCE.md"
        write_text(
            sidecar,
            provenance_header(
                source="git:docs/siyaos-knowledge-base/decisions/siya-decisions-seed.json",
                status="live-approved (founder decision seed)",
            )
            + "# Decision seed\n\nCanonical JSON decision log mirrored from git. Do not edit here — edit git and re-sync.\n",
        )
        uploaded.append(
            {
                "path": str(dest.relative_to(ROOT)),
                "source": "docs/siyaos-knowledge-base/decisions/siya-decisions-seed.json",
                "trust": "live-approved",
                "department": "Leadership",
                "id": "siya-decisions-seed",
            }
        )

    # Portal SOPs — try DB; otherwise leave labeled empty folders
    portal_count = 0
    portal_note = "DATABASE_URL not available in this environment — portal live SOPs not exported. Export via staff admin /memory/knowledge/sops (status=live) and place here with PROVENANCE header."
    try:
        import os

        def load_env(p: Path) -> None:
            if not p.exists():
                return
            for line in p.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                v = v.strip().strip('"').strip("'")
                if k in ("DATABASE_URL", "POSTGRES_URL") and v.startswith("postgres"):
                    os.environ[k] = v

        load_env(REPO / "integrations" / "hipaa-training-api" / ".env.local")
        load_env(REPO / ".env.local")
        url = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")
        if url and url.startswith("postgres"):
            import psycopg2

            conn = psycopg2.connect(url)
            cur = conn.cursor()
            cur.execute(
                """
                SELECT id, title, department_slug, status, body, COALESCE(ai_drafted,false),
                       created_at, updated_at
                FROM siya_sops WHERE status = 'live'
                ORDER BY department_slug, title
                """
            )
            for row in cur.fetchall():
                sid, title, slug, status, body, ai, created, updated = row
                dept = PORTAL_DEPT_SLUG.get((slug or "").lower().replace(" ", "_"), "Leadership")
                safe = re.sub(r"[^a-zA-Z0-9._-]+", "-", sid)[:80]
                dest = ROOT / dept / "02-portal-sops-live" / f"{safe}.md"
                header = provenance_header(
                    source=f"portal-postgres:siya_sops/{sid}",
                    status="live-approved (portal Knowledge SOP)",
                    extra=f"department_slug={slug}; ai_drafted={ai}; updated={updated}",
                )
                body_md = (
                    f"# {title}\n\n"
                    f"- **portal_id:** `{sid}`\n"
                    f"- **department_slug:** `{slug}`\n"
                    f"- **status:** `{status}`\n\n"
                    f"{body or ''}\n"
                )
                write_text(dest, header + body_md)
                uploaded.append(
                    {
                        "path": str(dest.relative_to(ROOT)),
                        "source": f"siya_sops:{sid}",
                        "trust": "live-approved",
                        "department": dept,
                        "id": sid,
                    }
                )
                portal_count += 1
            conn.close()
            portal_note = f"Exported {portal_count} live portal SOPs from Postgres."
    except Exception as e:
        portal_note = f"Portal SOP export skipped ({type(e).__name__}). Live git KB + decisions still mirrored."

    for d in DEPTS:
        readme = ROOT / d / "02-portal-sops-live" / "README.md"
        if not any(readme.parent.glob("*.md")) or readme.exists() and portal_count == 0:
            write_text(
                readme,
                provenance_header(
                    source="n/a",
                    status="placeholder",
                    extra="Folder reserved for portal live SOPs only",
                )
                + f"# Portal SOPs · {d.replace('-', ' ')}\n\n"
                + f"**{portal_note}**\n\n"
                + "Only `status=live` Knowledge SOPs belong here. Draft / pending_review / needs_review stay in the portal.\n",
            )

    # START HERE + root README + MANIFEST
    write_text(
        ROOT / "00-START-HERE" / "README.md",
        f"""# Org Knowledge · Approved mirror

**WorkDrive path:** `Common Folder/SiyaOS/Org-Knowledge-Approved/`  
**Lane:** Mac TrueSync (not `_API-DRY-RUN`, not cloud-only)  
**Synced:** {STAMP}

## What this is

A **clean, provenance-labeled** mirror of **already-approved** org knowledge for human browsing in WorkDrive.

## What this is NOT

- Not a dump for unaudited drafts  
- Not Rebecca's personal Claude workspace (that content is **excluded** until inventoried)  
- Not a second source of truth for Ask — Ask still reads **git live KB** + portal live SOPs  

## Trust labels

| Folder | Contents |
|--------|----------|
| `01-git-kb-live/` | `docs/siyaos-knowledge-base` topics with `status: live` |
| `02-portal-sops-live/` | Portal Knowledge SOPs with `status: live` (when export available) |
| `03-decisions-live/` | Founder decision log (git) |

Every file starts with a `PROVENANCE` comment (or sidecar for JSON).

## Departments

Clinical Operations · Marketing · Accounts · HR · Compliance · Technology · Leadership  

Matches `siya_department_leads` / Ask routing taxonomy (plus General in product, not used as a dump folder here).

## How to update

1. Edit git KB or approve a portal SOP.  
2. Re-run `python3 scripts/sync-org-knowledge-workdrive.py` from the monorepo.  
3. Do not hand-edit mirrored files in WorkDrive — they will be overwritten.
""",
    )

    write_text(
        ROOT / "README.md",
        f"""# Org-Knowledge-Approved

Mirrored {STAMP} from **amcare-os** approved sources only.

See `00-START-HERE/README.md` and `MANIFEST.md`.

**Sibling folders** under `SiyaOS/` (HR/, marketing/, clinical/, …) may still hold **legacy drafts** — those are **not** this mirror. Prefer this tree for approved content.
""",
    )

    manifest_lines = [
        f"# MANIFEST · Org-Knowledge-Approved · {STAMP}",
        "",
        f"Total files mirrored: **{len(uploaded)}**",
        "",
        f"Portal SOP note: {portal_note}",
        "",
        "| Department | Relative path | Source | Trust |",
        "|---|---|---|---|",
    ]
    for row in uploaded:
        manifest_lines.append(
            f"| {row['department']} | `{row['path']}` | `{row['source']}` | {row['trust']} |"
        )
    manifest_lines += [
        "",
        "## Explicitly excluded",
        "",
        "- Provisional git topics (leave-pto, patient-manager-request, vma-day-to-day-tasks)",
        "- Draft / pending portal SOPs",
        "- Legacy unaudited files already under other `SiyaOS/*` draft trees",
        "- Rebecca personal Claude workspace (not inventoried / not audited)",
        "",
    ]
    write_text(ROOT / "MANIFEST.md", "\n".join(manifest_lines))

    # Pointer in legacy SiyaOS README (append notice once)
    pointer = TRUESYNC_SIYAOS / "00-START-HERE" / "ORG-KNOWLEDGE-APPROVED.md"
    write_text(
        pointer,
        f"""# Org-Knowledge-Approved (new)

**Created {STAMP}** under `SiyaOS/Org-Knowledge-Approved/`.

This is the **approved-only** mirror from git live KB + decision log (+ portal live SOPs when exportable).

Legacy department folders in this WorkDrive tree may still contain drafts. For clean org truth, use **Org-Knowledge-Approved** first.

Sync script: `amcare-os/scripts/sync-org-knowledge-workdrive.py`
""",
    )

    print(json.dumps({"root": str(ROOT), "uploaded": len(uploaded), "portal_note": portal_note}, indent=2))
    by_dept: dict[str, int] = {}
    for u in uploaded:
        by_dept[u["department"]] = by_dept.get(u["department"], 0) + 1
    print("by_department", by_dept)


if __name__ == "__main__":
    main()
