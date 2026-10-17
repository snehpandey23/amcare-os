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
| 2026-10-17 | 1 | 1 | 0 | 0 | 0 |
| 2026-10-15 | 4 | 4 | 0 | 0 | 0 |
| 2026-10-14 | 1 | 1 | 0 | 0 | 0 |
| 2026-10-13 | 1 | 1 | 0 | 0 | 0 |
| 2026-10-12 | 1 | 2 | 0 | 0 | 0 |
| 2026-10-10 | 1 | 1 | 0 | 0 | 0 |
| 2026-10-09 | 2 | 2 | 0 | 0 | 0 |
| 2026-10-08 | 1 | 1 | 0 | 0 | 0 |
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
| 2026-10-08 05:46 IST | `release/2026-10-07d` | `7939876f` | production | sp | STARTED | Pause gate screenshot flake fix; log refused prod (gate timeout). |
| 2026-10-08 05:46 IST | `release/2026-10-07d` | `7939876f` | production | sp | OK | playback pause/speed/pacing · dpl_92UZzgZAY2JXd7Mk2rUgmm29CYAE |
| 2026-10-09 07:05 IST | `release/2026-10-09` | `23fe16bb` | production | sp | STARTED | Merge employer-demo-journey-prod into release/2026-10-09. |
| 2026-10-09 07:05 IST | `release/2026-10-09` | `23fe16bb` | production | sp | OK | For you chapter + founder voiceover · dpl_ByYtasrQvcNSaA9yi4in9b4xBeLD |
| 2026-10-09 09:55 IST | `release/2026-10-09` | `63a04478` | production | sp | STARTED | Merge branch 'employer-demo-journey-prod' into release/2026-10-09 |
| 2026-10-09 09:55 IST | `release/2026-10-09` | `63a04478` | production | sp | OK | Pause, pinned subtitles, speed with voice · dpl_EyxpkRRoy62f5AsbWaeXf511gerG |
| 2026-10-10 06:23 IST | `release/2026-10-09` | `a565a34d` | production | sp | STARTED | Trim the employer demo voiceover and settle each slide after it finishes moving. |
| 2026-10-10 06:23 IST | `release/2026-10-09` | `a565a34d` | production | sp | OK | Trim the employer demo voiceover and settle each slide after it finishes moving. · day=2026-10-10 |
| 2026-10-10 18:22 IST | `release/2026-10-09` | `f98dbd32` | production | sp | REFUSED | gate failed |
| 2026-10-12 08:28 IST | `integration/2026-10-12` | `2643459e` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=2643459eeb408309d9c6637fa7f0c11ef07c7ca4 branch=integration/2026-10-12 operator=sp id=dpl_CPgUNR5631wvQkxsGwFXX1KyQURc url=https://siya-health-kh2h89bfw-snehpandey23s-projects.vercel.app |
| 2026-10-12 11:48 IST | `integration/2026-10-12` | `2643459e` | production | sp | PROMOTED | www.siya.health bound to dpl_CPgUNR5631wvQkxsGwFXX1KyQURc (was dpl_GCdSTpcD2WGhQSZaG5HVhNfW272g). Same upload; not a new deployment. sha=2643459eeb408309d9c6637fa7f0c11ef07c7ca4 operator=sp |
| 2026-10-12 16:08 IST | `integration/2026-10-12` | `974a2686` | production | sp | STARTED | Keep internal notes and legal source files off the public site. |
| 2026-10-12 16:08 IST | `integration/2026-10-12` | `974a2686` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=974a2686546d7808c678ccd50da958043af04a70 branch=integration/2026-10-12 operator=sp id=dpl_7311hvGrfC3bcubjAZNy5XN24o7w url=https://siya-health-5gtnkjgcb-snehpandey23s-projects.vercel.app |
| 2026-10-13 18:12 IST | `integration/2026-10-13-pillars` | `6321b5fd` | production | sp | STARTED | Pin related cards that the retirement backfill filled with the wrong posts. |
| 2026-10-13 18:12 IST | `integration/2026-10-13-pillars` | `6321b5fd` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=6321b5fd7a54376fc49c57f0b189afb7b9d4cec2 branch=integration/2026-10-13-pillars operator=sp id=dpl_SM9vCTAgeM47Y3XWkNUQen147MHz url=https://siya-health-bfl0cd5oq-snehpandey23s-projects.vercel.app |
| 2026-10-14 19:36 IST | `integration/2026-10-14-phase2` | `c4a75e04` | production | sp | STARTED | content(phase2): record 2026-10-14 physician sign-off for sleep, testosterone, perimenopause |
| 2026-10-14 19:36 IST | `integration/2026-10-14-phase2` | `c4a75e04` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=c4a75e04a24f21129634e2808884f85560307478 branch=integration/2026-10-14-phase2 operator=sp id=dpl_CsdKTpMeJP9o4CubZpJvoifmBNrT url=https://siya-health-9rcs16q1j-snehpandey23s-projects.vercel.app |
| 2026-10-15 11:37 IST | `integration/2026-10-15-guide-kb` | `2ef0580e` | production | sp | STARTED | content(adhd): split the leftover visit-length lines |
| 2026-10-15 11:37 IST | `integration/2026-10-15-guide-kb` | `2ef0580e` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=2ef0580e6525dd66e57ec57c67b3878c97268ec1 branch=integration/2026-10-15-guide-kb operator=sp id=dpl_3D7znPoUscbj1BP9imDkwKgLvNHn url=https://siya-health-akth630po-snehpandey23s-projects.vercel.app |
| 2026-10-15 12:50 IST | `integration/2026-10-15-guide-kb` | `0afa7377` | production | sp | STARTED | content(answers): update guide search duration snippets |
| 2026-10-15 12:50 IST | `integration/2026-10-15-guide-kb` | `0afa7377` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=0afa73779cbf98f94d181aed7291d25ca85ed7d8 branch=integration/2026-10-15-guide-kb operator=sp id=dpl_3Gk6qi1m69aSXgDcM6D1Tz2HCumK url=https://siya-health-6d5aypcgg-snehpandey23s-projects.vercel.app |
| 2026-10-15 18:33 IST | `integration/2026-10-15-guide-kb` | `a2ca754e` | production | sp | STARTED | content(adhd): repair spliced evaluation-time sentences |
| 2026-10-15 18:33 IST | `integration/2026-10-15-guide-kb` | `a2ca754e` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=a2ca754e8830eb0c84b30a0dce5f43edea360b15 branch=integration/2026-10-15-guide-kb operator=sp id=dpl_8ygp7gp6mR8adKw6qGJv5epnfve3 url=https://siya-health-1z00syonw-snehpandey23s-projects.vercel.app |
| 2026-10-15 22:25 IST | `integration/2026-10-15-guide-kb` | `11f6988a` | production | sp | STARTED | content(adhd): clarify intake forms and who conducts the visit |
| 2026-10-15 22:25 IST | `integration/2026-10-15-guide-kb` | `11f6988a` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=11f6988a06b2f2c8344bd1e3c3a6016dcfdecf51 branch=integration/2026-10-15-guide-kb operator=sp id=dpl_Fc8xtPmnXiegG1EizasoPQsN8Atk url=https://siya-health-7cfkza5an-snehpandey23s-projects.vercel.app |
| 2026-10-17 14:51 IST | `integration/2026-10-17-cognitive-site` | `f2dad621` | production | sp | STARTED | Regenerate AI indexes for cognitive-first copy |
| 2026-10-17 14:51 IST | `integration/2026-10-17-cognitive-site` | `f2dad621` | production | sp | OK | staged --skip-domain not-promoted www-unchanged sha=f2dad621d97ceb69cfcf27a6e2ed48035af6fa2c branch=integration/2026-10-17-cognitive-site operator=sp id=dpl_3tykHGYnv5cioNQNjzZTUkeJHrRp url=https://siya-health-jmi91k8ie-snehpandey23s-projects.vercel.app |
| 2026-10-17 19:27 IST | `integration/2026-10-17-cognitive-site` | `97f68631` | production | sp | REFUSED | gate failed |
