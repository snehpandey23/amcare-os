# Phase-3 → WorkDrive sync (Option 2: human-gated)

**Human gate:** Phase 1–3 approvals in chat → `SHIP.md` + tracker Approved + captions on **`main`**.

**Delivery target (founder choice):** fresh `_API-DRY-RUN/04–07` using existing `WORKDRIVE_DRYRUN_*_ID` secrets. No new folder IDs.

**Automation:** Action **Siya WorkDrive Phase-3 sync (live)** syncs **changed** packs (skips `TEST-*`). Credentials in Actions secrets only.

## Dry-run verification (complete 2026-08-25)

| # | Check | Result |
|---|---|---|
| 1–2 | Clean API sync ×2 | PASS — Actions #5, #6 |
| 3 | Mid-upload fail + rollback | PASS — Actions #7 |

## Secrets (already set)

`ZOHO_CLIENT_ID` · `ZOHO_CLIENT_SECRET` · `ZOHO_REFRESH_TOKEN` · `ZOHO_ACCOUNTS_URL`  
`WORKDRIVE_DRYRUN_04_ID` … `WORKDRIVE_DRYRUN_07_ID`

## Workflows

| Workflow | Writes to |
|---|---|
| `siya-workdrive-phase3-live.yml` | Working delivery tree only (`WORKDRIVE_DRYRUN_*` → `_API-DRY-RUN/…`). **No** `simulate_fail_after`. |
| `siya-workdrive-phase3-fail-test.yml` | **`_FAIL-TEST-ONLY/` only** (`WORKDRIVE_FAILTEST_*`). Mid-upload abort+rollback. Soft-skips until those secrets exist. |
| `siya-workdrive-phase3-sync.yml` | **Retired** — no longer syncs to the working tree. |

Hard rule in script: `--simulate-fail-after` refused unless `mode=fail-test`.
