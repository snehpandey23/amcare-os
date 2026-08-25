# Phase-3 → WorkDrive sync (Option 2: two lanes)

## Ship lanes (required in `SHIP.md`)

| `ship_lane` | Who | Destination |
|---|---|---|
| **`mac`** | Mac / local agent | TrueSync → existing `04` · `05-Carousels/` · `06` · `07` (tracking intact). **Action skips.** |
| **`cloud`** | Cloud agent | GitHub Action → **`_API-DRY-RUN/04–07`** only |

Missing/`unknown` on live Action = **skip** (fail closed).

```yaml
---
phase: 3
status: approved
insight_id: YOUR-ID
kind: carousel
ship_lane: mac    # or cloud
---
```

## Human gate

Phase 1–3 approvals in chat → `SHIP.md` + tracker Approved + captions on **`main`**.

## Automation

Action **Siya WorkDrive Phase-3 sync (live)** syncs **changed** packs with `ship_lane: cloud` only (skips `TEST-*` on live unless allow-test). Credentials in Actions secrets only.

## Secrets (already set)

`ZOHO_CLIENT_ID` · `ZOHO_CLIENT_SECRET` · `ZOHO_REFRESH_TOKEN` · `ZOHO_ACCOUNTS_URL`  
`WORKDRIVE_DRYRUN_04_ID` … `WORKDRIVE_DRYRUN_07_ID`

## Workflows

| Workflow | Writes to |
|---|---|
| `siya-workdrive-phase3-live.yml` | `_API-DRY-RUN/…` for **cloud** packs only |
| `siya-workdrive-phase3-fail-test.yml` | `_FAIL-TEST-ONLY/` (`WORKDRIVE_FAILTEST_*`) |
| `siya-workdrive-phase3-sync.yml` | Retired |

Hard rule: `--simulate-fail-after` refused unless `mode=fail-test`.
