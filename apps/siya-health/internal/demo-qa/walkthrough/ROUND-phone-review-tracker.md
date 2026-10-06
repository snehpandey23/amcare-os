# ROUND: founder phone-review (items 1–23)

Branch: `employer-demo-journey-prod` · Preview only · ONE deploy · No prod

## Transition-overlap (prerequisite) — DONE
Commit `e1424fd0` (machine). Re-verified on cleanup tip — gate report: `transition-check-AFTER.md` — **PASS** (0 overlaps desk+phone; leave→enter state machine; per-slide timers; `computeAdvanceMs`; Back = previous slide final state).

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
| 12 | Headings standard audit | done (see Heading exceptions below) |
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
- **CARE THAT COVERS carousel:** base homepage-top was captured mid-transition (blank service). Demo overlays 4 settled WebP frames (`employers/demo/media/site/covers/covers-{primary-care,mental-health,adhd,sexual-health}.webp`) and crossfades ~1.2s each while Home is on screen. Capture via `capture-covers-carousel.mjs` (opacity≥0.995 only).
- **Website-team flag (do NOT fix on this branch):** live rotator uses `siya-h2-chip-settle` from opacity 0→1 (~0.65s), so a brief empty card is visible between items on siya.health. Demo intentionally avoids showing that blank.
- 17B beat order (website column): homepage (+covers cycle) → Book highlight → care team → Dr. Pandey, Medical Director → **Booking through your organization's private link**.

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

## Heading exceptions (item 12) — audited 2026-10-06 on tip
Standard (handoff): eyebrow → headline ≤2 lines → optional sub ≤2 lines → hero.

**Pass (standard eyebrow + `h2.cap`):** p-time, p-away, p-familiar, p-response, p-whole, p-coord, turn, care-checklist, f-time, f-ways, f-response, f-urgent, f-whole, employer, journey, outcomes, clinicians, cost, privacy, proof, proof-nums.

**Intentional exceptions (keep):**
- `statement` / `question`: centered big-type (`data-vcenter`), no left column; statement headline is JS-filled `#bigline`.
- `close`: checklist / next-steps layout (not desk-split); eyebrow `Siya Health` + `h2.q2`.
- `journey`: dual pathway columns (walk surface); eyebrow+headline still top; no long sub (pathways are the body).
- `founder`: parked (`showFounder=false`); no media files until video ships.
- Phone-only companions (`f-time-a/b`, `employer-a/b`, `cost-usual`/`cost-siya`, `privacy-emp`/`privacy-you`): surface splits of the parent slide; inherit parent eyebrow/headline pattern.

**Subs that wrap long on narrow phones (accepted; not copy bugs):** p-away, p-response, p-whole, turn, care-checklist, f-time, outcomes — keep as written; desk stays ≤2 lines.

No heading copy fixes required this pass.
