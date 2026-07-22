# EOD Local Fuse — Master Prompt

```text
Locked: 2026-07-22
Model: Cloud agents create all day → Local Mac agent fuses to WorkDrive at EOD
```

## Why

- **Cloud agents** cannot see Mac TrueSync (`~/Library/CloudStorage/ZohoWorkDriveTrueSync-…`).
- **Marketing can keep shipping in parallel** on cloud agents into git (`apps/siya-health/brand/`).
- **One local Mac agent** at end of day fuses + syncs Knowledge Editorial WorkDrive + Content Tracker.

---

## Cloud agent rules (daytime)

1. Create in **Knowledge Editorial git layout only**:
   - Packs: `apps/siya-health/brand/editorial-packs/[Insight-ID]/`
   - Statics mirror: `apps/siya-health/brand/06-Statics/[Insight-ID]/` (statics)
   - Carousels ready-to-post under the pack
2. Log every asset in `apps/siya-health/brand/04-Content-Tracker/Siya-Content-Tracker.csv`
3. Follow `SIYA-STANDARDS.md` / `site-standards.mjs` for CTAs
4. Follow `EDITORIAL-TEST.md`, `INSTAGRAM-STATIC.md`, Insight IDs (never “Week 1”)
5. **Do not** invent `zoho-common/`, Desktop-only dumps, or fake WorkDrive paths
6. **Do not** claim WorkDrive sync succeeded from cloud
7. Commit + push on `cursor/*` branch; note Insight IDs in PR

---

## Local Mac agent — paste at end of day

```text
You are on my Mac with Zoho TrueSync connected (Amcare Medical Consultancy India Pvt Ltd).

Mission: EOD fuse — pull today’s cloud-agent editorial work from git and sync into live Knowledge Editorial WorkDrive. Do not reinvent. Do not create parallel folders.

1. cd to amcare-os. git fetch. Merge/pull all ready marketing branches the team lists (or main after PRs merge). Prefer branch list if given.

2. Run the fuse script:
   bash apps/siya-health/brand/scripts/eod-fuse-to-truesync.sh

3. Confirm TrueSync path updated:
   ~/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial/
   - New/updated 05-Carousels/[ID]/ and/or 06-Statics/[ID]/
   - 04-Content-Tracker CSV synced; merge new rows into Siya-Content-Tracker.xlsx if that is the live sheet

4. Print a short fuse report: Insight IDs synced, skipped, conflicts.

5. Rules:
   - Knowledge Editorial only (00/03/04/05/06)
   - No zoho-common/
   - No Founder LinkedIn unless explicitly requested
   - Company captions need ≥1 practical change
   - SIYA-STANDARDS CTAs (Talk to a Clinician / Book ADHD Evaluation / Health Guides — never Meet & Greet)
```

---

## Optional: list today’s Insight IDs

Append to the local prompt, e.g.:

```text
Today fuse at least: AD-W-02 (and any other Ready rows in 04-Content-Tracker).
```
