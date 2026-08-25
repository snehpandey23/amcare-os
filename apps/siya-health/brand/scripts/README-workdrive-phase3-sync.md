# Phase-3 → WorkDrive sync (Option 2: human-gated)

**Human gate (unchanged):** Phase 1–3 approvals happen in chat. Only after you approve Phase 3 do we land `SHIP.md` + tracker `Approved|Ready` + captions on **`main`**.

**Automation gate (unchanged):** sync runs only when all of these are true:

1. Branch is `main`
2. Pack has `SHIP.md` with `phase: 3` and `status: approved|ready`
3. Tracker row Status matches Approved/Ready
4. Captions + `ready-to-post` images present

**Credentials:** Zoho tokens live only in **GitHub Actions secrets**. Cloud agents never hold the refresh token.

## Current status (2026-08-25)

| Step | Status |
|---|---|
| Dry-run API sync #5 + #6 (v3, nested upload) | Success on Actions (`e2c0b9f`) |
| Atomic staging + mid-upload rollback (`v4-atomic-staging`) | Code ready — needs commit/push + re-verify |
| Deliberate mid-upload fail test | Pending one Action run with `simulate_fail_after=1` |
| Live `04/05/06/07` folder IDs | **Not flipped yet** |

## Dry-run secrets

| Secret | Purpose |
|---|---|
| `ZOHO_CLIENT_ID` / `ZOHO_CLIENT_SECRET` / `ZOHO_REFRESH_TOKEN` | OAuth |
| `ZOHO_ACCOUNTS_URL` | e.g. `https://accounts.zoho.com` |
| `WORKDRIVE_DRYRUN_04_ID` … `_07_ID` | `_API-DRY-RUN/` subfolders only |

## Run dry-run (Actions)

Workflow: **Siya WorkDrive Phase-3 sync (dry-run)**

1. Branch `main`
2. `insight_id`: `TEST-2026-08-24-api-dryrun`
3. `simulate_fail_after`: `0` for clean sync, or `1` for deliberate mid-upload abort + rollback
4. Confirm: `RUN-DRY-RUN`

Expect clean: `DONE synced=1` and `version=2026-08-25-v4-atomic-staging`  
Expect fail test: `FAIL_TEST` + `ROLLBACK` + workflow green (exit 2 treated as pass)

## Live flip (after three dry-run checks pass)

Requires founder OK + new secrets `WORKDRIVE_LIVE_04_ID` … `_07_ID` pointing at real Knowledge Editorial folders — **not** `_API-DRY-RUN`. Separate live workflow will auto-run on push to `main` when shipped packs change.
