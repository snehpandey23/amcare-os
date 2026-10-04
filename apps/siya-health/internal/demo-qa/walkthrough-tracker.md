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
| A1 | Hub/ring + Lucide icons (heart-pulse, scale, brain, route); phone keeps ring | `turn` | done | `wt-a1-meet-siya-*` |
| A2 | Checklist: 28px ticks, white rows, hairline dividers, personalized pill | `care-checklist` | done | `wt-a2-checklist-*` |
| A3 | Medical-scan: dark panel + structured nerves (CC0 gender-neutral silhouette) | `care-body` | in review | `wt-a3-root-cause-*` |
| A4 | Two stacked white cards: What we treat + Where clinicians practice | `clinicians` | done | `wt-a4-clinicians-*` |
| A5 | “Your team member” wording throughout | copy global | hold | — |

### A3 body silhouette source

**Source:** [Wikimedia Commons — Human silhouette gender neutral front.svg](https://commons.wikimedia.org/wiki/File:Human_silhouette_gender_neutral_front.svg)  
**License:** CC0 1.0 Universal (Public Domain Dedication)  
**Artist:** Sebastian Wallroth (based on Wallace Rule of Nines.svg)  
**Local file:** `employers/demo/media/body-silhouette-cc0.svg`  

Render: dark navy scan panel; translucent body fill + rim; structured nerves (brain/spine/ribs/arms/legs ≤60 paths); heart 1Hz + 6 vessels; grow 2.5s + pulses; labels + "Stress connects them all." Deep link: `?review=1&slide=root-cause`.

## GROUP B — Problem chapter

| # | Note | Slide id(s) | Status | Screenshot |
|---|------|-------------|--------|------------|
| B1 | Sound familiar? team-chat messages | `p-familiar` | in review | `wt-b1-familiar-*` |
| B2 | Time away bar → ≈3h vs Siya desk visit | `p-away` | in review | `wt-b2-time-away-*` |
| B3 | Eyebrows: Time · Access · Cost · Continuity | `p-time`…`p-coord` | in review | `wt-b3-*` |
| B4 | Intro: ~30% fewer/dimmer stars; swell on converge; bell on lock | intro | in review | (listen on preview) |

## GROUP C–D

| Group | Status |
|-------|--------|
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
| 2026-10-03 | Step 1 + Group A | `6d8cd737` | hash-stamped shots |
| 2026-10-04 | Group A polish | `278dfdd4` | US English, Lucide icons, A3 Health Icons CC0, A4 stacked cards |
| 2026-10-04 | A3 particle rebuild + deep link |  | CC0 silhouette; `slide=root-cause` |
| 2026-10-04 | A3 medical-scan + Group B | `bbe8ac56` | scan panel, structured nerves, B1–B4 |
