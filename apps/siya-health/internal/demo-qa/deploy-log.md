# siya-health deploy log

Appended by `scripts/deploy-siya-health.sh`. Production requires `--prod`,
branch == `SIYA_HEALTH_RELEASE_BRANCH` (default `main`), and
`PROMOTE_APPROVED=<commit>` matching HEAD.

| Time (IST) | Branch | Hash | Target | Who | Result | Note |
|---|---|---|---|---|---|---|
| 2026-10-06 06:05 IST | `employer-demo-journey-prod` | — | guard | — | ADDED | deploy-guard landed; no deploy run |
| 2026-10-06 06:03 IST | `employer-demo-journey-prod` | `debb1a07` | blocked | sp | REFUSED | dirty apps/siya-health |
| 2026-10-06 06:03 IST | `employer-demo-journey-prod` | `debb1a07` | blocked | sp | REFUSED | dirty apps/siya-health |
