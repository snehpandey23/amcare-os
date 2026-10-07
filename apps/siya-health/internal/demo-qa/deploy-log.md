# siya-health deploy log

Appended by `scripts/deploy-siya-health.sh`. Production requires `--prod`,
branch == `SIYA_HEALTH_RELEASE_BRANCH` (default `main`), and
`PROMOTE_APPROVED=<commit>` matching HEAD.

| Time (IST) | Branch | Hash | Target | Who | Result | Note |
|---|---|---|---|---|---|---|
| 2026-10-06 06:05 IST | `employer-demo-journey-prod` | `e162838c` | guard | — | ADDED | deploy-guard landed; no deploy run |
| 2026-10-06 06:40 IST | `employer-demo-journey-prod` | `71d73ea8` | check | sp | CHECK_ONLY | no --prod |
| 2026-10-06 06:40 IST | `employer-demo-journey-prod` | `71d73ea8` | production | sp | REFUSED | branch!=main (dirty mid-check; re-verified below) |
| 2026-10-06 06:39 IST | `employer-demo-journey-prod` | `c35bfae5` | production | sp | REFUSED | branch!=main |
| 2026-10-06 17:49 IST | `release/2026-10-06` | `72bb6271` | production | sp | CHECK_ONLY | gates ok |
| 2026-10-06 17:49 IST | `release/2026-10-06` | `ee3f8735` | production | sp | STARTED | Log prod-gate check-only on release/2026-10-06. |
| 2026-10-06 17:49 IST | `release/2026-10-06` | `ee3f8735` | production | sp | OK | Log prod-gate check-only on release/2026-10-06. |
| 2026-10-07 06:39 IST | `release/2026-10-07` | `c95c2dcb` | production | sp | STARTED | Merge employer-demo-journey-prod: beat-grid pacing + music-sync (~3:29). |
| 2026-10-07 06:39 IST | `release/2026-10-07` | `c95c2dcb` | production | sp | OK | Merge employer-demo-journey-prod: beat-grid pacing + music-sync (~3:29). |
| 2026-10-07 07:18 IST | `release/2026-10-07b` | `0f9d6b90` | production | sp | STARTED | Merge employer-demo-journey-prod: pacing FIX 2 (~2.81 min). |
| 2026-10-07 07:18 IST | `release/2026-10-07b` | `0f9d6b90` | production | sp | OK | Merge employer-demo-journey-prod: pacing FIX 2 (~2.81 min). |
| 2026-10-07 09:02 IST | `release/2026-10-07c` | `49abdef9` | production | sp | REFUSED | no-scroll-visible-top gate |
| 2026-10-07 09:02 IST | `release/2026-10-07c` | `c820ac08` | production | sp | STARTED | Log refused prod attempt on release/2026-10-07c (playwright missing). |
| 2026-10-07 09:02 IST | `release/2026-10-07c` | `c820ac08` | production | sp | OK | mobile top-clip root fix + no-scroll gate · dpl_EnPGkP1SEufZTJcMEKMXKzwvtya6 |
