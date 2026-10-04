# ROUND: founder phone-review (items 1–23)

Branch: `employer-demo-journey-prod` · Preview only · ONE deploy · No prod

## Transition-overlap (prerequisite) — DONE
Commit `e1424fd0`. Gate report: `transition-check-AFTER.md` — **PASS** (0 overlaps desk+phone; leave→enter state machine; per-slide timers; `computeAdvanceMs`; Back = previous slide final state).

| # | Item | Status |
|---|---|---|
| 1 | Phone controls auto-hide + tap toggle / swipe nav / hint | done (in WIP) |
| 2 | Dwell matched to content (`computeAdvanceMs`) | done |
| 3 | f-ways invisible until tap | done (transition machine) |
| 4 | f-urgent first line visible + scroll rules | done |
| 5 | Back = one step | done (verify in gates) |
| 6 | Problem order: statement→p-time→p-away→p-familiar→… | done |
| 7 | p-familiar preventable subline | done |
| 8 | p-response Access phone beats | done |
| 9 | p-whole STRESS HUB | done |
| 10 | p-coord headline top + apps + collapse | done |
| 11 | Checklist "Personalized plan" | done |
| 12 | Headings standard audit | pending list |
| 13 | Schedule one slide / one message | done |
| 14 | f-urgent care-note copy | done |
| 15 | f-whole continuity beats | done |
| 16 | Getting started one sequenced slide | done |
| 17 | Journey two pathways | done (17B screenshots + booking) |
| 18 | Outcomes charts + axes | done |
| 19 | Clinicians past tense | done |
| 20 | Cost → Why Siya cards | done |
| 21 | Privacy one slide | done |
| 22 | Welcome halo premium | done |
| 23 | Music preview A/B — **founder picked B** | done (shipped into demo bed) |

## Title + site pathway (2026-10-04)
- Dr. Pandey title: **Medical Director** confirmed. Cards: `Medical Director · Internal Medicine Physician`; short: `Dr. Pandey, Medical Director`; byline: `Dr. Sneh Pandey · Medical Director, Siya Health`. Facts + facts-audit wired.
- Journey website pathway: `homepage-top-2026-10-04.webp` (hero → Book Free Meet & Greet; no prices / no Zocdoc). Book highlight only (no mid-scroll). Care-team WebP unchanged.

## 17B screenshot refresh note
Production captures live under `employers/demo/media/site/`:
- `homepage-top-YYYY-MM-DD.webp` — hero → Book Free Meet & Greet (pathway; use `capture-homepage-top.mjs`)
- `homepage-YYYY-MM-DD.webp` / `homepage-full-…` — full-page QA refs
- `care-team-YYYY-MM-DD.webp` from `https://siya.health/providers` @ 390px

**Refresh these WebPs whenever the homepage or care team (`/providers`) page changes.** Re-run capture scripts and update `SITE_HOME` / `SITE_TEAM` paths in the prototype. No live iframes; no GTM from demo.

## 23 Music
Preview: `apps/siya-health/internal/music-preview.html`
- **A** ~108 BPM synth-keyboard lead (reference only)
- **B** ~112 BPM brighter arpeggio — **SHIPPED** into demo (`MUSIC_LEVEL=1.3`, BPM 112, sawtooth arp)

## Heading exceptions (item 12)
- `statement` / `question`: centered big-type, no left column (intentional).
- Journey: dual pathway columns; eyebrow+headline still top.
- Close: checklist layout (intentional).
