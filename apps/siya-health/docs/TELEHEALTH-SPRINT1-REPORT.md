# Telehealth Page — Founder Audit Sprint 1 Report

**Page:** `/telehealth` (`telehealth.html`)  
**Date:** 2026-06-06  
**Goal:** Reposition from "list of virtual services" → "When you need a doctor but life doesn't stop."

---

## Build status

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** |
| Removed strings (`Find the Right Starting Point`, catalog note) | **PASS** — not present post-build |
| FAQ accordion JS | **PASS** — untouched |
| Footer / provider cards / booking URLs | **PASS** — unchanged |

---

## Before / after summary

### Hero (P0)

| | Before | After |
|---|--------|-------|
| Headline | Telehealth Care — Fast, Simple, Accessible | **Need a doctor without rearranging your entire day?** |
| Subhead | Board-certified providers. No waiting rooms… | Primary care, urgent care, refills, forms, chronic follow-up—from home |
| Bullets | — | No waiting rooms · No long drives · No insurance delays |
| States | In trust bar only | **California · Texas · Pennsylvania · Florida** (hero state line) |
| CTAs | Talk to a Clinician + Find the Right Starting Point | **Single primary CTA** |
| Trust bar | Board-Certified / Same-Week / Transparent / HIPAA | Physician-Led / Same-Week / Evening & Weekend / No Insurance Barriers |

### Recognition (P1 — added)

New section `#tele-recognition` — **What brings most patients here?** with 6 cards:

1. I just need a doctor today  
2. I need a medication refill  
3. I need forms completed  
4. I am too busy for traditional primary care  
5. I want ongoing health support  
6. I don't know where to start  

### Why Choose (P1 — rewritten)

Replaced 4 generic cards with **7 differentiators**: physician-led care, transparent pricing, same-week appointments, evening/weekend availability, no insurance barriers, ongoing support options, primary + mental + metabolic under one roof.

Removed generic "Secure & Confidential" / "Wide Scope of Care" framing.

### Service grid (P1 — reframed)

| | Before | After |
|---|--------|-------|
| Title | What We Offer | **Common reasons patients book visits** |
| Descriptions | Catalog-style (e.g. "Sinus infections, UTIs…") | Patient-situation-first (e.g. "Feeling sick and need help today?…") |

All 8 categories rewritten; icons and titles preserved.

### Removed (P0/P2)

- Hero secondary CTA: **Find the Right Starting Point**
- Final CTA secondary button: **Find the Right Starting Point**
- Info note: **Full telehealth catalog available—ask your provider…**

### Health guides (P2)

| | Before | After |
|---|--------|-------|
| Section title | Cornerstone guides: fatigue & sleep | **Health guides for common telehealth questions** |
| Focus | Fatigue/sleep only | Forms, refills, fatigue, diabetes, labs, preventive, sleep |
| Featured cards | 3 fatigue/sleep/metabolic blogs (kept) | Same SEO URLs, retagged by concern |
| Related links | Sleep-heavy | + is telehealth legit, meet & greet, online prescriptions, normal labs, brain fog |

`LEARN_MORE_TELE` in `site-chrome.mjs` updated to match (build-safe).

### CTA cleanup (P2)

| Location | Before | After |
|----------|--------|-------|
| FAQ CTA | Still have questions? / Schedule a quick call / text link | **Still not sure where to start?** / A short conversation… / **Talk to a Clinician** button |
| Final CTA | Physician-led telehealth… + secondary button | **When you need a doctor, not a runaround** / single button |

---

## Sections added

- `#tele-recognition` — patient recognition grid (6 cards)

## Sections removed

- Hero + final **Find the Right Starting Point** CTAs
- `#services` info-card catalog note

## Files changed

| File | Change |
|------|--------|
| `telehealth.html` | Hero, recognition, why-choose, services, FAQ CTA, guides, final CTA |
| `scripts/site-chrome.mjs` | `LEARN_MORE_TELE`, `TELE_FAQ_CTA`, telehealth final CTA (single button) |
| `scripts/capture-telehealth-sprint1-screenshots.mjs` | New screenshot script |
| `docs/TELEHEALTH-SPRINT1-REPORT.md` | This report |

**Not modified:** footer, provider cards, booking URLs, FAQ Q&A content, state/licensing/legal copy.

---

## Mobile review

Screenshots captured at **390×844** (3× DPR):

- Hero readable; single CTA prominent  
- Recognition grid stacks to 1 column; card text scannable  
- Why-choose grid stacks cleanly (7 cards)  
- Service grid 2-col → 1-col on narrow viewports  
- Full-page mobile scroll shows no duplicate recognition block  
- Final CTA band fits width; button full-width on mobile  

Path: `docs/telehealth-sprint1-screenshots/after/`

---

## Screenshots (after)

| File | Section |
|------|---------|
| `hero-desktop-1440.png` | Hero |
| `hero-mobile-390.png` | Hero mobile |
| `recognition-desktop-1440.png` | Patient recognition |
| `recognition-mobile-390.png` | Recognition mobile |
| `why-choose-desktop-1440.png` | Differentiators |
| `services-desktop-1440.png` | Service grid |
| `guides-desktop-1440.png` | Health guides hub |
| `faq-cta-desktop-1440.png` | FAQ CTA band |
| `final-cta-desktop-1440.png` | Final CTA |
| `final-cta-mobile-390.png` | Final CTA mobile |
| `full-page-mobile-390.png` | Full page mobile |

> **Note:** Before screenshots were not captured pre-edit (page was already partially updated in-session). Before copy is documented in the tables above.

To re-capture: `npx serve -l 8877 .` then `node scripts/capture-telehealth-sprint1-screenshots.mjs`

---

## Success test

**Target:** Patient finishes thinking *"They can probably help me"* — not *"They offer telehealth services."*

**Assessment:** PASS — hero and recognition lead with life-fit problems; service grid uses situational language; differentiators are concrete; CTAs offer one clear next step without false routing.

---

## Recommended follow-ups (not in scope)

- Meta title/description refresh to match problem-first hero (optional SEO pass)
- Dedicated answer pages for "Can telehealth prescribe antibiotics?" and "Can a doctor complete work forms virtually?" (currently routed to related guides)
