#!/usr/bin/env python3
"""Build-Out Program: folders, gap audit, placeholders, seed DB."""
from __future__ import annotations

import json
import re
import sqlite3
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

HOME = Path.home()
SIYAOS = (
    HOME
    / "Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/SiyaOS"
)
INCOMING = SIYAOS / "_incoming" / "Siya_Health_Master_Tracker.xlsx"
BUILD = SIYAOS / "Build-Out-Program"
REPO = Path("/Users/sp/amcare-os")
DOCS = REPO / "docs/siyaos-knowledge-base/build-out-program"
API_DB = REPO / "integrations/hipaa-training-api/src/database"
BRAND = REPO / "apps/siya-health/brand"
KB = REPO / "docs/siyaos-knowledge-base"
APPROVED = SIYAOS / "Org-Knowledge-Approved"

assert INCOMING.exists(), INCOMING
DOCS.mkdir(parents=True, exist_ok=True)

WORKSTREAM_FOLDERS = [
    ("Clinical SOPs", "01-Clinical-SOPs"),
    ("Operational SOPs", "02-Operational-SOPs"),
    ("HR SOPs & Policies", "03-HR-SOPs-Policies"),
    ("Telehealth SOPs", "04-Telehealth-SOPs"),
    ("Data Room Build-Out", "05-Data-Room-Build-Out"),
    ("Marketing Re-Brand", "06-Marketing-Re-Brand"),
    ("Employer Materials", "07-Employer-Materials"),
    ("Onboarding - Employees", "08-Onboarding-Employees"),
    ("Onboarding - Clinicians", "09-Onboarding-Clinicians"),
    ("Go-To-Market", "10-Go-To-Market"),
    ("Financial Audit", "11-Financial-Audit"),
    ("State Compliance Roadmap", "12-State-Compliance-Roadmap"),
]
WS_TO_FOLDER = dict(WORKSTREAM_FOLDERS)

items = json.loads((DOCS / "tracker-items.raw.json").read_text())
print(f"Loaded {len(items)} items from raw export")

corpus: list[dict] = []


def add(path: Path, title: str, layer: str, status_hint: str = "") -> None:
    corpus.append(
        {
            "path": str(path),
            "title": title,
            "layer": layer,
            "status_hint": status_hint,
            "hay": (title + " " + path.name + " " + status_hint).lower(),
        }
    )


for p in KB.rglob("*.md"):
    if "build-out-program" in str(p):
        continue
    text = p.read_text(errors="ignore")[:2000]
    m = re.search(r"^status:\s*(\w+)", text, re.M)
    st = m.group(1) if m else "unknown"
    title_m = re.search(r"^title:\s*(.+)$", text, re.M)
    title = title_m.group(1).strip() if title_m else p.stem.replace("-", " ")
    layer = "git-kb-live" if st == "live" else f"git-kb-{st}"
    add(p, title, layer, st)

for p in APPROVED.rglob("*"):
    if p.is_file() and p.suffix in {".md", ".json"}:
        add(p, p.stem.replace("-", " "), "org-knowledge-approved", "approved-mirror")

for name in [
    "BRAND-STYLE-LOCK.md",
    "MEDICAL-COMPLIANCE-MARKETING.md",
    "VISUAL-OS.md",
    "VISUAL-OS-TEMPLATES.md",
    "AGENT-BOOTSTRAP.md",
    "EDITORIAL-OS.md",
]:
    p = BRAND / name
    if p.exists():
        add(p, name.replace(".md", "").replace("-", " "), "brand-approved", "style-lock")

emp = REPO / "apps/siya-health/employers.html"
if emp.exists():
    add(emp, "employers landing page", "patient-site", "live-html")

for p in SIYAOS.rglob("*"):
    if not p.is_file():
        continue
    if "Org-Knowledge-Approved" in p.parts or "_incoming" in p.parts or "Build-Out-Program" in p.parts:
        continue
    if p.suffix.lower() not in {".md", ".pdf", ".docx"}:
        continue
    hint = "draft" if "draft" in p.name.lower() else "workdrive-siyaos"
    add(p, p.stem.replace("-", " ").replace("_", " "), "workdrive-draft", hint)

dec = REPO / "integrations/hipaa-training-api/src/decision-json-seed.generated.ts"
if dec.exists():
    add(dec, "CPOM/tax compliance decisions (seed)", "portal-decisions", "live-seed")

add(
    REPO / "apps/hipaa-training/src/app/learn/competency-exam/page.tsx",
    "HIPAA competency exam (staff portal)",
    "staff-portal",
    "live-product",
)

print(f"Corpus entries: {len(corpus)}")

OVERRIDES_PATH = DOCS / "gap-overrides.json"
OVERRIDES = json.loads(OVERRIDES_PATH.read_text())
CURATED: dict[tuple[str, str], tuple[str, list[str], str]] = {}
for ws, titles in OVERRIDES.items():
    for title, meta in titles.items():
        CURATED[(ws, title.lower().strip())] = (
            meta["gap"],
            list(meta.get("citations") or []),
            meta.get("why") or "",
        )
print(f"Loaded {len(CURATED)} curated overrides from {OVERRIDES_PATH.name}")

STOP = set("a an the for and or of to in on via vs with without".split())


def tokens(s: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9]+", (s or "").lower()) if t not in STOP and len(t) > 2]


def score_item(title: str, notes: str):
    tks = set(tokens(title) + tokens(notes or "")[:12])
    if not tks:
        return []
    scored = []
    for c in corpus:
        hay_tokens = set(tokens(c["hay"]))
        inter = tks & hay_tokens
        if len(inter) < 2:
            continue
        boost = 0
        if c["layer"] in ("git-kb-live", "org-knowledge-approved", "brand-approved"):
            boost = 2
        elif c["layer"].startswith("git-kb"):
            boost = 1
        scored.append((len(inter) + boost, c))
    scored.sort(key=lambda x: -x[0])
    return scored[:5]


def classify(item: dict):
    key = (item["workstream"], (item["title"] or "").lower().strip())
    if key in CURATED:
        gap, cites, why = CURATED[key]
        return gap, cites, why or "", "curated"

    if item["workstream"] == "Data Room Build-Out":
        title = (item["title"] or "").lower()
        if "brand" in title or "visual identity" in title:
            return "Have it", ["apps/siya-health/brand/BRAND-STYLE-LOCK.md"], "Brand system exists.", "heuristic"
        hits = score_item(item["title"], item["notes"] or "")
        if hits and hits[0][0] >= 5 and hits[0][1]["layer"] in (
            "git-kb-live",
            "brand-approved",
            "org-knowledge-approved",
        ):
            c = hits[0][1]
            return "Partial", [c["path"]], f"Related: {c['title']} ({c['layer']})", "heuristic"
        return "Missing", [], "No data-room artifact found in live/approved sources.", "heuristic"

    if item["workstream"] == "State Compliance Roadmap":
        hits = score_item(item["title"], item.get("extra") or "")
        cites = [h[1]["path"] for h in hits[:3]]
        cites = list(
            dict.fromkeys(
                cites
                + [
                    "integrations/hipaa-training-api/src/decision-json-seed.generated.ts (CPOM decisions)"
                ]
            )
        )
        return (
            "Partial",
            cites,
            "State listed on roadmap; formal completed research pack not in approved KB. CPOM → counsel (decision seed).",
            "heuristic",
        )

    if item["workstream"] == "Financial Audit":
        return "Missing", [], "No matching finance audit deliverable in live KB/approved.", "heuristic"

    if item["workstream"] == "Go-To-Market":
        hits = score_item(item["title"], item["notes"] or "")
        if hits and hits[0][0] >= 4:
            cites = [h[1]["path"] for h in hits[:3]]
            return "Partial", cites, "Related marketing/strategy material exists but GTM action not closed.", "heuristic"
        return "Missing", [], "", "heuristic"

    if item["workstream"] == "Marketing Re-Brand":
        hits = score_item(item["title"], item["notes"] or "")
        brand_hits = [h for h in hits if h[1]["layer"] == "brand-approved"]
        if brand_hits:
            return (
                "Partial",
                [h[1]["path"] for h in brand_hits[:3]],
                "Brand system related; deliverable not fully packaged.",
                "heuristic",
            )
        return "Missing", [], "", "heuristic"

    hits = score_item(item["title"], item["notes"] or "")
    if not hits:
        return "Missing", [], "No keyword matches in corpus.", "heuristic"

    top = hits[0][1]
    top_score = hits[0][0]
    cites = [h[1]["path"] for h in hits[:4]]
    live_layers = {"git-kb-live", "org-knowledge-approved", "brand-approved", "staff-portal"}
    if top["layer"] in live_layers and top_score >= 6:
        title_tok = set(tokens(item["title"]))
        corp_tok = set(tokens(top["title"]))
        if title_tok and len(title_tok & corp_tok) / max(len(title_tok), 1) >= 0.5:
            return "Have it", cites, f"Strong live/approved match: {top['title']}", "heuristic"
        return "Partial", cites, f"Related live/approved material: {top['title']}", "heuristic"

    if top["layer"].startswith("git-kb") or top["layer"] == "workdrive-draft" or top_score >= 4:
        return "Partial", cites, f"Related material ({top['layer']}): {top['title']}", "heuristic"

    return "Missing", [], "", "heuristic"


def shorten_cite(c: str) -> str:
    c = c.replace(str(REPO) + "/", "")
    c = c.replace(str(SIYAOS) + "/", "SiyaOS/")
    c = c.replace(str(APPROVED) + "/", "Org-Knowledge-Approved/")
    return c


audited = []
for item in items:
    gap, cites, why, method = classify(item)
    short_cites = [shorten_cite(c) for c in cites]
    row = {
        **item,
        "item_id": f"{WS_TO_FOLDER[item['workstream']]}-{item['sheet_row']:03d}",
        "gap_class": gap,
        "existing_ref": "; ".join(short_cites) if short_cites else None,
        "citations": short_cites,
        "audit_rationale": why,
        "audit_method": method,
        "audit_date": str(date.today()),
    }
    audited.append(row)

counts = Counter(r["gap_class"] for r in audited)
print("GAP COUNTS", dict(counts))
by_ws = defaultdict(Counter)
for r in audited:
    by_ws[r["workstream"]][r["gap_class"]] += 1

# --- Load actual Marketing / remaining titles that failed curated (fuzzy title match) ---
# Fix: some tracker titles may differ slightly — report unmatched curated intended titles
raw_titles = {(i["workstream"], i["title"]) for i in items}
curated_missing_from_sheet = [k for k in CURATED if (k[0], next((i["title"] for i in items if i["workstream"]==k[0] and i["title"].lower()==k[1]), None)) is None]
# simpler: curated keys not found
not_found = []
for (ws, tlow), _ in CURATED.items():
    if not any(i["workstream"] == ws and (i["title"] or "").lower().strip() == tlow for i in items):
        not_found.append((ws, tlow))
print(f"Curated keys not matching sheet titles: {len(not_found)}")
for x in not_found[:40]:
    print("  ", x)

README_ROOT = f"""# SiyaOS Build-Out-Program

**Status:** PLANNING / IN-PROGRESS  
**Not approved knowledge.** Do **not** treat anything here as live SOPs, policies, or Org-Knowledge-Approved content.

## Purpose

Operational workstream for Rebecca’s **Siya Health Master Tracker** ({len(audited)} checklist items across 12 workstreams).

| Layer | Role |
|-------|------|
| This folder | Placeholders, gap status, drafting workspace |
| `Org-Knowledge-Approved/` | Approved-only mirror (git live KB + decisions + portal live SOPs when exported) |
| Staff portal SOP builder | Where real SOPs get drafted → reviewed → live |

## Source tracker

`SiyaOS/_incoming/Siya_Health_Master_Tracker.xlsx`  
(also Shared with Me → *Siya Health Operational and Compliance Tracker and Checklists*)

## Gap audit

See git: `docs/siyaos-knowledge-base/build-out-program/GAP-AUDIT.md`  
Seeded rows: `tracker-items.seeded.json` + offline SQLite `build-out-tracker.sqlite`

## Workstreams

"""
for ws, folder in WORKSTREAM_FOLDERS:
    README_ROOT += f"- `{folder}/` — {ws}\n"

README_ROOT += f"""
## Rules

1. Placeholders are stubs only — **no** invented SOP body content.
2. Promoting into Org-Knowledge-Approved requires a real live artifact (git KB `status: live` or portal live SOP).
3. Owner fields stay blank until COO assigns.

_Generated {date.today()} from Master Tracker gap audit._
"""

BUILD.mkdir(parents=True, exist_ok=True)
(BUILD / "README.md").write_text(README_ROOT)

WS_README = """# {ws}

**Workstream status:** PLANNING / IN-PROGRESS  
**Not approved knowledge.**

Tracker sheet: `{ws}`  
Folder: `{folder}`

Placeholders here are checklist stubs for Missing/Partial items only.  
Have-it items are tracked in the gap audit / DB but do not get placeholder stubs.

See: `docs/siyaos-knowledge-base/build-out-program/GAP-AUDIT.md`
"""

stub_count = 0
for ws, folder in WORKSTREAM_FOLDERS:
    d = BUILD / folder
    d.mkdir(parents=True, exist_ok=True)
    (d / "README.md").write_text(WS_README.format(ws=ws, folder=folder))
    for old in d.glob("*.md"):
        if old.name != "README.md":
            old.unlink()
    for r in audited:
        if r["workstream"] != ws:
            continue
        if r["gap_class"] == "Have it":
            continue
        safe = re.sub(r"[^a-zA-Z0-9]+", "-", r["title"]).strip("-")[:80]
        fname = f"{r['sheet_row']:02d}-{safe}.md"
        notes = r.get("notes") or "_None_"
        extra_block = ""
        if r.get("extra"):
            extra_block = f"\n## Extra\n\n{r['extra']}\n"
        if r["citations"]:
            cites_block = "\n".join(f"- `{c}`" for c in r["citations"])
        else:
            cites_block = "_None found_"
        rationale = r.get("audit_rationale") or "_n/a_"
        body = f"""# {r['title']}

| Field | Value |
|-------|-------|
| **Item ID** | `{r['item_id']}` |
| **Workstream** | {r['workstream']} |
| **Category** | {r.get('category') or '—'} |
| **Priority** | {r.get('priority') or '—'} |
| **Owner** | _(unassigned)_ |
| **Tracker status** | {r.get('status') or 'Not Started'} |
| **Gap class** | **{r['gap_class']}** |
| **Label** | NOT APPROVED — PLACEHOLDER STUB ONLY |

## Do not

- Do not treat this file as an SOP, policy, or approved knowledge.
- Do not invent procedure content here.

## Notes (from tracker)

{notes}
{extra_block}
## Existing refs (gap audit)

{cites_block}

## Audit rationale

{rationale}
"""
        (d / fname).write_text(body)
        stub_count += 1
        r["placeholder_path"] = f"SiyaOS/Build-Out-Program/{folder}/{fname}"

print(f"Created Build-Out-Program with {stub_count} stubs")

(DOCS / "tracker-items.seeded.json").write_text(json.dumps(audited, indent=2))

sqlite_path = DOCS / "build-out-tracker.sqlite"
if sqlite_path.exists():
    sqlite_path.unlink()
con = sqlite3.connect(sqlite_path)
con.execute(
    """
CREATE TABLE siya_build_out_tracker_items (
  id TEXT PRIMARY KEY,
  workstream TEXT NOT NULL,
  sheet_row INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  owner TEXT,
  status TEXT,
  target_date TEXT,
  notes TEXT,
  gap_class TEXT NOT NULL CHECK (gap_class IN ('Have it','Partial','Missing')),
  existing_ref TEXT,
  placeholder_path TEXT,
  audit_rationale TEXT,
  audit_method TEXT,
  audit_date TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
"""
)
con.execute("CREATE INDEX idx_build_out_ws ON siya_build_out_tracker_items(workstream)")
con.execute("CREATE INDEX idx_build_out_gap ON siya_build_out_tracker_items(gap_class)")
for r in audited:
    con.execute(
        """INSERT INTO siya_build_out_tracker_items
        (id, workstream, sheet_row, title, category, priority, owner, status, target_date, notes,
         gap_class, existing_ref, placeholder_path, audit_rationale, audit_method, audit_date)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            r["item_id"],
            r["workstream"],
            r["sheet_row"],
            r["title"],
            r.get("category"),
            r.get("priority"),
            r.get("owner"),
            r.get("status"),
            r.get("target_date"),
            r.get("notes"),
            r["gap_class"],
            r.get("existing_ref"),
            r.get("placeholder_path"),
            r.get("audit_rationale"),
            r.get("audit_method"),
            r.get("audit_date"),
        ),
    )
con.commit()
con.close()
print("SQLite seeded", sqlite_path)

schema = """-- Siya Health Build-Out Program tracker (Rebecca Master Tracker)
-- PLANNING / IN-PROGRESS — not approved knowledge.
-- Apply when DATABASE_URL is available:
--   psql \"$DATABASE_URL\" -f build-out-tracker-schema.sql
--   psql \"$DATABASE_URL\" -f ../../../../docs/siyaos-knowledge-base/build-out-program/build-out-tracker-seed.sql

CREATE TABLE IF NOT EXISTS siya_build_out_tracker_items (
  id TEXT PRIMARY KEY,
  workstream TEXT NOT NULL,
  sheet_row INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'Not Started',
  target_date DATE,
  notes TEXT,
  gap_class TEXT NOT NULL CHECK (gap_class IN ('Have it', 'Partial', 'Missing')),
  existing_ref TEXT,
  placeholder_path TEXT,
  audit_rationale TEXT,
  audit_method TEXT,
  audit_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_build_out_tracker_workstream
  ON siya_build_out_tracker_items (workstream);
CREATE INDEX IF NOT EXISTS idx_build_out_tracker_gap
  ON siya_build_out_tracker_items (gap_class);
CREATE INDEX IF NOT EXISTS idx_build_out_tracker_priority
  ON siya_build_out_tracker_items (priority);
"""
(API_DB / "build-out-tracker-schema.sql").write_text(schema)


def sql_str(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


seed_lines = [
    "-- Seed from Siya_Health_Master_Tracker.xlsx gap audit " + str(date.today()),
    "-- Source: SiyaOS/_incoming/Siya_Health_Master_Tracker.xlsx",
    "BEGIN;",
    "DELETE FROM siya_build_out_tracker_items;",
]
for r in audited:
    seed_lines.append(
        "INSERT INTO siya_build_out_tracker_items "
        "(id, workstream, sheet_row, title, category, priority, owner, status, target_date, notes, "
        "gap_class, existing_ref, placeholder_path, audit_rationale, audit_method, audit_date) VALUES ("
        + ", ".join(
            [
                sql_str(r["item_id"]),
                sql_str(r["workstream"]),
                str(r["sheet_row"]),
                sql_str(r["title"]),
                sql_str(r.get("category")),
                sql_str(r.get("priority")),
                sql_str(r.get("owner")),
                sql_str(r.get("status")),
                "NULL",
                sql_str(r.get("notes")),
                sql_str(r["gap_class"]),
                sql_str(r.get("existing_ref")),
                sql_str(r.get("placeholder_path")),
                sql_str(r.get("audit_rationale")),
                sql_str(r.get("audit_method")),
                sql_str(r.get("audit_date")),
            ]
        )
        + ");"
    )
seed_lines.append("COMMIT;")
(DOCS / "build-out-tracker-seed.sql").write_text("\n".join(seed_lines) + "\n")

lines = []
lines.append("# Siya Health Build-Out — Gap Audit")
lines.append("")
lines.append(f"**Date:** {date.today()}  ")
lines.append("**Source tracker (readable):** `Common Folder/SiyaOS/_incoming/Siya_Health_Master_Tracker.xlsx`  ")
lines.append(
    "**Also found at:** `Shared with Me/Siya Health Operational and Compliance Tracker and Checklists/Siya_Health_Master_Tracker.xlsx`  "
)
lines.append(
    f"**Items audited:** {len(audited)} (spreadsheet row count; earlier ~149 estimate was low)  "
)
lines.append("")
lines.append("## Summary")
lines.append("")
lines.append("| Gap class | Count | % |")
lines.append("|-----------|------:|--:|")
for g in ("Have it", "Partial", "Missing"):
    n = counts[g]
    lines.append(f"| {g} | {n} | {100 * n / len(audited):.0f}% |")
lines.append("")
lines.append("### By workstream")
lines.append("")
lines.append("| Workstream | Have it | Partial | Missing | Total |")
lines.append("|------------|--------:|--------:|--------:|------:|")
for ws, folder in WORKSTREAM_FOLDERS:
    c = by_ws[ws]
    lines.append(f"| {ws} | {c['Have it']} | {c['Partial']} | {c['Missing']} | {sum(c.values())} |")
lines.append("")
lines.append("## Method")
lines.append("")
lines.append("Each tracker row was classified against:")
lines.append("")
lines.append("1. **Git live KB** (`docs/siyaos-knowledge-base/`, `status: live`)")
lines.append("2. **Org-Knowledge-Approved** WorkDrive mirror")
lines.append("3. **Brand / medical compliance** (`apps/siya-health/brand/` — Style Lock + MEDICAL-COMPLIANCE-MARKETING)")
lines.append("4. **WorkDrive SiyaOS drafts** (cited as Partial only — not approved)")
lines.append("5. **Portal decision seeds** (CPOM → counsel, not AI)")
lines.append("6. **Staff portal products** (HIPAA training, attendance) where they satisfy a checklist step")
lines.append("")
lines.append(
    "**Live `siya_sops` DB** could not be queried this pass — production `DATABASE_URL` is a Vercel secret and local env only has `[SENSITIVE]` placeholders. Citations therefore exclude portal live SOP titles. Re-run gap class for ops items once DB URL is available."
)
lines.append("")
lines.append("**Have it** = substantial approved/live artifact that fulfills the tracker ask.  ")
lines.append("**Partial** = related draft, staff-only topic, outline, or product without the full SOP/deliverable.  ")
lines.append("**Missing** = nothing material found.")
lines.append("")
lines.append("---")
lines.append("")

for ws, folder in WORKSTREAM_FOLDERS:
    lines.append(f"## {ws}")
    lines.append("")
    rows = [r for r in audited if r["workstream"] == ws]
    for r in rows:
        lines.append(f"### {r['sheet_row']}. {r['title']}")
        lines.append("")
        lines.append(f"- **Gap:** {r['gap_class']}  ")
        lines.append(f"- **Priority:** {r.get('priority') or '—'}  ")
        lines.append(f"- **ID:** `{r['item_id']}`  ")
        if r.get("placeholder_path"):
            lines.append(f"- **Placeholder:** `{r['placeholder_path']}`  ")
        if r["citations"]:
            lines.append("- **Citations:**")
            for c in r["citations"]:
                lines.append(f"  - `{c}`")
        else:
            lines.append("- **Citations:** _none_")
        if r.get("audit_rationale"):
            lines.append(f"- **Why:** {r['audit_rationale']}")
        lines.append("")

lines.append("---")
lines.append("")
lines.append("## Have-it inventory (complete list)")
lines.append("")
for r in audited:
    if r["gap_class"] != "Have it":
        continue
    lines.append(f"- **{r['workstream']}** — {r['title']}")
    for c in r["citations"]:
        lines.append(f"  - `{c}`")
lines.append("")
lines.append("## Artifacts produced this pass")
lines.append("")
lines.append("| Artifact | Path |")
lines.append("|----------|------|")
lines.append("| WorkDrive scaffold | `SiyaOS/Build-Out-Program/` (12 workstreams + stubs) |")
lines.append("| Tracker copy | `SiyaOS/_incoming/Siya_Health_Master_Tracker.xlsx` |")
lines.append("| Gap audit (this file) | `docs/siyaos-knowledge-base/build-out-program/GAP-AUDIT.md` |")
lines.append("| Seeded JSON | `docs/siyaos-knowledge-base/build-out-program/tracker-items.seeded.json` |")
lines.append("| Offline SQLite | `docs/siyaos-knowledge-base/build-out-program/build-out-tracker.sqlite` |")
lines.append("| Postgres schema | `integrations/hipaa-training-api/src/database/build-out-tracker-schema.sql` |")
lines.append("| Postgres seed SQL | `docs/siyaos-knowledge-base/build-out-program/build-out-tracker-seed.sql` |")
lines.append("")
lines.append("## Explicitly deferred")
lines.append("")
lines.append("- SOP-printer → promote-to-approved pipeline")
lines.append("- Export live portal SOPs → `Org-Knowledge-Approved/*/02-portal-sops-live/`")
lines.append("- Apply schema/seed to production Neon (blocked on pullable `DATABASE_URL`)")
lines.append("")

(DOCS / "GAP-AUDIT.md").write_text("\n".join(lines) + "\n")
(DOCS / "README.md").write_text(
    f"""# Build-Out Program (tracker + gap audit)

Companion to WorkDrive `SiyaOS/Build-Out-Program/`.

- **Gap audit:** [GAP-AUDIT.md](./GAP-AUDIT.md)
- **Seeded items:** `tracker-items.seeded.json` ({len(audited)} rows)
- **Offline DB:** `build-out-tracker.sqlite`
- **Postgres:** schema in API package; seed SQL here

Not approved knowledge.
"""
)

heur = [
    r
    for r in audited
    if r["audit_method"] == "heuristic"
    and r["workstream"]
    in ("Clinical SOPs", "Marketing Re-Brand", "Operational SOPs", "HR SOPs & Policies")
]
print(f"Heuristic in core SOP sheets: {len(heur)}")
for r in heur[:40]:
    print(f"  [{r['gap_class']}] {r['workstream']}: {r['title']}")

print("DONE", dict(counts), "stubs", stub_count)
