# Staff portal — production vs `main` (scoring)

Last updated: **2026-09-15** (after relevance-floor cross-check surgical undeploy)

Staff production is promoted **only** via `bash scripts/deploy-staff-portal.sh` (CLI). Git push does not promote.

## Current production deployments

| Project | Deploy ID | URL alias |
|---------|-----------|-----------|
| `siya-staff-assist` | `dpl_7q7hWysjmnnjm4KTcZfsLxgSuhxf` | https://www.siyahealth.net |
| `siya-staff-auth-api` | `dpl_8ApfnturSMzoCE6DhpKgTu3yDt4Z` | https://siya-staff-auth-api.vercel.app |

Staff tree source for this promote: branch commit `f5c9dc4f` (`deploy/undeploy-relevance-floor-cross-check`, deleted after promote — SHA retained here).

## Live / `main` deltas (intentional)

`main` tip may still contain code that is **not** what production runs. Document each delta explicitly.

| Delta | In `main` tip? | Live (prod)? | Notes |
|-------|----------------|--------------|-------|
| `5ff27e77` trail + STT persistence | yes | **yes** | Keep — auditability |
| `5ff27e77` ESL / collocation grammar expansion | yes | **yes** | Keep |
| `5ff27e77` **relevance_floor_cross_check** (turn inject) + session grammar-near-floor cap | **yes** | **no** | Surgically undeployed 2026-09-15 — R heuristics must not rewrite Grammar until relevance shape bugs are fixed |
| `3674c671` typed 3+ explanation repetition → relevance | yes | **yes** | Untouched by floor undeploy |

### Why the floor piece is live-off / main-on

Code trace (Anmol typed attempt): polite short status answers (`Sure! It went through yesterday.`) can score turn R=0 via timeline mis-bucket + narrow shape whitelist + `Sure!` filler zeroing, then the floor cascade dragged Grammar ~100→67. Undeploy removes the amplifier only; relevance heuristics themselves remain (and still need a separate fix).

### Verification (2026-09-15)

- Local smokes: `verify-scoring-integrity` (floor absent; ESL + trail OK); `smoke-typed-repetition-relevance` OK
- Prod JS: `relevance_floor_cross_check` **absent**; `esl_collocation` + `transcriptVersion` + repetition copy **present**
- Live red-team: **52/52 PASS** (`REDTEAM_LIVE=1`)

## Do not

- Treat “deploy all pending” / full-tree CLI as license to re-enable the floor without an explicit “yes, ship the cross-check” checkpoint
- Merge the undeploy commit into `main` casually without deciding whether `main` should match live or keep the held code for a later deliberate re-enable
