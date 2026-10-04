# Employer demo walkthrough tracker

Branch: `employer-demo-journey-prod` · Preview only until founder says **promote**.  
Screenshots: `internal/demo-qa/walkthrough/` (gitignored).  
Status: `done` · `in review` · `cut` · `parked` · `hold`.

## STEP 1 — Stage bugs

| # | Note | Status |
|---|------|--------|
| 1a | Welcome: remove intro gate ghost; phone one CTA | done |
| 1b | Remove unstyled Illustrative duplicate | done |
| 1c | Problem/time desk: callout above bar · “≈ 2 hours, for a 20-minute visit” | done |
| 1d | Meet Siya phone cards clean | done |
| 1e | Chapter highlight matches current slide | done |
| 1f | No founder.mp4/.vtt when showFounder=false | done |
| 1g | Clinicians body not under bar | done |

## GROUP A — Meet Siya + Care

| # | Note | Slide id(s) | Status |
|---|------|-------------|--------|
| A1 | Hub/ring + Lucide icons | `turn` | done |
| A2 | Checklist; subline: Stress, sleep, weight and focus… | `care-checklist` | done |
| A3 | Cut by founder decision — merged into A2 subline | — | **cut** |
| A4 | Clinicians stacked cards | `clinicians` | done |

## GROUP B — Problem chapter

| # | Note | Slide id(s) | Status |
|---|------|-------------|--------|
| B1 | Sound familiar? team-chat | `p-familiar` | done |
| B2 | Time away dual timeline (Ray AJMC 2015) · ≈2h vs ≈20m | `p-away` | done |
| B3 | Eyebrows: Time · Access · Continuity · Coordination | `p-time`…`p-coord` | done |
| B4 | Intro: ~30% fewer/dimmer stars; swell on converge; bell on lock | intro | done |
| Access | Day-word slot (one visible); desk-split | `p-response` | done |
| Continuity | Desk web; phone 2-col pairs; outlined specialist + stethoscope | `p-whole` | done |
| Five apps | Eyebrow Coordination; phone vertical stack | `p-coord` | done |

## GROUP C — How it works

| # | Note | Slide id(s) | Status |
|---|------|-------------|--------|
| C1 | Two ways in · message + book Dr. Pandey | `f-ways` | done |
| C2 | Real people. Not AI chat · facts chips | `f-response` | done |
| C3 | Urgent in chat · pink-eye + photo tile | `f-urgent` | done |
| C4 | Lock-screen notif one card @360 | `f-time` / `f-time-b` | done |
| C5 | Not just when they're sick · year timeline | `f-whole` | done |
| C6 | Employer invite · voluntary private link | `employer*` | done |

## GROUP D — Cost, privacy, proof

| # | Note | Slide id(s) | Status |
|---|------|-------------|--------|
| D1 | Cost conceptual · no surprise bills / free | `cost` / `cost-usual` | done |
| D2 | Outcomes dual panels · sample · never share PHI | `outcomes` | done |
| D3 | Privacy funnel | `privacy*` | done |
| D4 | Proof 2×2 from facts file | `proof` / `proof-nums` | done |
| D5 | Close · inquiry → `#inquiry-heading` | `close` | done |

## Stage layout conversion

| Slide id | Converted | Notes |
|----------|-----------|-------|
| statement | n/a | text-centered (vcenter) |
| p-familiar | yes | |
| p-time | yes | |
| p-away | yes | |
| p-response | yes | |
| p-whole | yes | |
| p-coord | yes | |
| question | n/a | text-centered |
| turn | yes | |
| care-checklist | yes | |
| care-body | cut | |
| f-time | yes | desk-split |
| f-time-a / f-time-b | phone surfaces | |
| f-ways | yes | |
| f-response | yes | |
| f-urgent | yes | |
| f-whole | yes | |
| employer | yes | |
| employer-a / b | phone | |
| journey | hold | walk surface |
| baseline | cut | folded into outcomes subline + Baseline markers |
| outcomes | yes | dual panels + baseline markers |
| clinicians | yes | |
| cost / cost-usual | yes | phone: Usual/Siya per pair |
| cost-siya | parked | |
| privacy* | yes | phone separation visual |
| proof / proof-nums | yes | |
| proof-revs | cut | no marketplace source+date in tracker |
| founder | parked | |
| close | yes | close layout |

## PARKED

| # | Note | Status |
|---|------|--------|
| P1 | Founder monologue video | parked |
| P2 | Cognitive-test vendor demo link | parked |

## Batch log

| When | Batch | Commit | Notes |
|------|-------|--------|-------|
| 2026-10-03 | Step 1 + Group A | `6d8cd737` | |
| 2026-10-04 | A3 medical-scan + Group B | `bbe8ac56` | later cut |
| 2026-10-04 | Cut A3 + B2 + problem fixes + C/D |  | `bdbfba29` | full finish run |
