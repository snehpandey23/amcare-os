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
