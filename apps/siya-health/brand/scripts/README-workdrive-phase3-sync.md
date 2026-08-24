# Phase-3 → WorkDrive sync (DORMANT — manual upload preferred)

**Current ops (2026-08-24):** Agents leave packs in git after Phase 3. Team downloads and uploads to WorkDrive manually. Do **not** run this Action for normal packs.

GitHub Action + script that can mirror approved packs into WorkDrive **`_API-DRY-RUN/` only** — kept for a future API dry-run; workflow is dormant (`workflow_dispatch` + type `RUN-DRY-RUN`).

## Hard rules

- Config `mode` must be `test` and destination must contain `_API-DRY-RUN`.
- Does **not** write live `04/05/06/07` at the Knowledge Editorial root.
- Zoho credentials live only in **GitHub Actions secrets** (or local env for manual dry-run). Never in git, prompts, or Cloud Agent context.
- Skips (exit 0) unless **all** are true: `main` branch · `SHIP.md` (phase 3 + approved) · tracker Status matches Approved/Ready · captions + ready-to-post images present.

## Secrets (GitHub → Settings → Secrets → Actions)

| Secret | Purpose |
|---|---|
| `ZOHO_CLIENT_ID` | OAuth client |
| `ZOHO_CLIENT_SECRET` | OAuth secret |
| `ZOHO_REFRESH_TOKEN` | Refresh token with WorkDrive file scopes |
| `ZOHO_ACCOUNTS_URL` | Optional; default `https://accounts.zoho.com` |
| `WORKDRIVE_DRYRUN_04_ID` | Folder ID for `_API-DRY-RUN/04-Content-Tracker` |
| `WORKDRIVE_DRYRUN_05_ID` | Folder ID for `_API-DRY-RUN/05-Carousels` |
| `WORKDRIVE_DRYRUN_06_ID` | Folder ID for `_API-DRY-RUN/06-Statics` |
| `WORKDRIVE_DRYRUN_07_ID` | Folder ID for `_API-DRY-RUN/07-Video-Prompts` |

Get folder IDs from the WorkDrive browser URL: `.../folders/<id>`.

Until API secrets + dry-run folder IDs are set, use **FS transport** against the TrueSync path (already created):

```bash
export WORKDRIVE_DRYRUN_FS_ROOT="$HOME/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Siya Knowledge Editorial/_API-DRY-RUN"
python3 apps/siya-health/brand/scripts/workdrive_phase3_sync.py \
  --assume-main --transport fs --insight-id YOUR-ID
```

## SHIP.md example

```markdown
---
phase: 3
status: approved
insight_id: ADHD-2026-08-24-example
kind: carousel
---

Phase 3 complete. Human approved. Safe to mirror to WorkDrive dry-run.
```

## Tracker

Row in `apps/siya-health/brand/04-Content-Tracker/CLOUD-PACK-TRACKER.csv` with Status containing `Approved` or `Ready`.

## Live folders

Do **not** change config or secrets to live 04/05/06/07 until an explicit founder OK.
