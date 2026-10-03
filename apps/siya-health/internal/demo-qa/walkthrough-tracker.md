# Employer demo walkthrough tracker

Branch: `employer-demo-journey-prod` · Preview only until groups reviewed.  
Screenshots: `internal/demo-qa/walkthrough/` (gitignored); paths relative to that folder.  
Status: `done` · `in progress` · `not started` · `parked` · `hold`.

## STEP 1 — Stage bugs

| # | Note | Slide id(s) | Status | Screenshot |
|---|------|-------------|--------|------------|
| 1a | Welcome: remove intro gate ghost; phone one CTA | `welcome` | done | `wt-s1-welcome-*` |
| 1b | Remove unstyled top-left Illustrative duplicate | all | done | (absent in shots) |
| 1c | Problem/time desk: callout above bar | `p-time` | done | `wt-s1-p-time-*` |
| 1d | Meet Siya phone: all cards clean at 360/390 | `turn` | done | `wt-a1-meet-siya-390*` |
| 1e | Chapter highlight matches current slide | bar | done | (aria-current + is-done) |
| 1f | No founder.mp4/.vtt when showFounder=false | `founder` | done | (0 requests) |
| 1g | Clinicians body not under bar; no empty 8th slot | `clinicians` | done | `wt-a4-clinicians-*` |

## GROUP A — Meet Siya + Care

| # | Note | Slide id(s) | Status | Screenshot |
|---|------|-------------|--------|------------|
| A1 | Meet Siya differentiated 4 cards + hub/ring | `turn` | done | `wt-a1-meet-siya-*` |
| A2 | Whole-person checklist first-visit chart | `care-checklist` | done | `wt-a2-checklist-*` |
| A3 | Head-to-toe root-cause body map | `care-body` | done | `wt-a3-body-*` |
| A4 | Clinicians pills + practise strip | `clinicians` | done | `wt-a4-clinicians-*` |
| A5 | “Your team member” wording throughout | copy global | hold | — |

## GROUP B–D

| Group | Status |
|-------|--------|
| B Problem | hold — specs after A review |
| C How it works | hold |
| D Cost / privacy / proof | hold |

## PARKED

| # | Note | Status |
|---|------|--------|
| P1 | Founder monologue video | parked |
| P2 | Cognitive-test vendor demo link | parked |

## Batch log

| When | Batch | Commit | Notes |
|------|-------|--------|-------|
| 2026-10-03 | Step 0 tracker | `b7dc3a2b` | |
| pending | Step 1 + Group A | pending | hash-stamped shots |
