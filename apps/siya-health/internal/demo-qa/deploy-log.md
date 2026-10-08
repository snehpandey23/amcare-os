# siya-health deploy log

## Hygiene (2026-10-07)

- Intermediate checks: local `node scripts/generate-employer-demo.mjs` + `internal/demo-qa/contact-sheet.mjs` + release gates.
- **Do not** run `npx vercel deploy` for polish iterations.
- Preview: `bash scripts/deploy-siya-health.sh --preview` with `PREVIEW_REASON=review-link` or `pre-prod` only.
- Production: `--prod` + `SIYA_HEALTH_RELEASE_BRANCH` + `PROMOTE_APPROVED`.

## Deploy count by day (IST)

Hygiene: intermediate checks = **local** generate + contact sheets + QA gates.
Preview only for an explicit review link or immediately before prod promote.
Log `STARTED` ≈ CLI attempts from this script (Git/Vercel auto-builds also burn quota).

| Day (IST) | Prod STARTED | Prod OK | Preview STARTED | Preview OK | Quota REFUSED |
|---|---:|---:|---:|---:|---:|
| 2026-10-07 | 3 | 3 | 0 | 0 | 2 |
| 2026-10-06 | 1 | 1 | 0 | 0 | 0 |


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
| 2026-10-07 10:24 IST | `release/2026-10-07d` | `fdb7a64a` | production | sp | REFUSED | Vercel api-deployments-free-per-day (>100); playback round gates green on tip |
| 2026-10-07 17:30 IST | `release/2026-10-07d` | `d88ee175` | hygiene | sp | NOTED | Policy: local checks only between ships; preview only review-link¦pre-prod. 2026-10-07 also burned many unlogged `vercel deploy` / canceled Git previews (quota >100). |
| 2026-10-07 17:38 IST | `release/2026-10-07d` | `5078d31a` | production | sp | REFUSED | gate failed |
