# Phase-3 → WorkDrive sync (Option 2: human-gated live)

**Human gate (unchanged):** Phase 1–3 approvals in chat. Only after Phase 3 OK do we land `SHIP.md` + tracker `Approved|Ready` + captions on **`main`**.

**Automation:** GitHub Action **Siya WorkDrive Phase-3 sync (live)** syncs **changed** packs to live `04/05/06/07`. Credentials stay in Actions secrets only.

## Dry-run verification (complete 2026-08-25)

| # | Check | Result |
|---|---|---|
| 1 | API dry-run sync | PASS — Actions #5 (`e2c0b9f`) |
| 2 | API dry-run re-sync | PASS — Actions #6 |
| 3 | Mid-upload fail + rollback | PASS — Actions #7 (`be74b91`, `simulate_fail_after=1`) |

## Secrets

### Shared OAuth
`ZOHO_CLIENT_ID` · `ZOHO_CLIENT_SECRET` · `ZOHO_REFRESH_TOKEN` · `ZOHO_ACCOUNTS_URL`

### Dry-run only (`_API-DRY-RUN/`)
`WORKDRIVE_DRYRUN_04_ID` … `WORKDRIVE_DRYRUN_07_ID`

### Live (Knowledge Editorial root folders)
`WORKDRIVE_LIVE_04_ID` · `WORKDRIVE_LIVE_05_ID` · `WORKDRIVE_LIVE_06_ID` · `WORKDRIVE_LIVE_07_ID`

Get IDs from WorkDrive browser URL: `.../folders/<id>` for each of `04-Content-Tracker`, `05-Carousels`, `06-Statics`, `07-Video-Prompts` at the **live** root (not under `_API-DRY-RUN`).

Live refuses to run if a LIVE id equals the matching DRYRUN id.

## Workflows

| Workflow | When |
|---|---|
| `siya-workdrive-phase3-sync.yml` (dry-run) | Manual `RUN-DRY-RUN` only |
| `siya-workdrive-phase3-live.yml` | Push to `main` on pack/tracker paths, or manual `SYNC-LIVE` |

Live skips `TEST-*` insight IDs. Uses atomic `__SYNCING__` staging + rollback.
