# Sprint A Implementation Report

**Status:** Implemented (homepage only)  
**Date:** June 6, 2026  
**Scope:** P0-1, P0-2, P0-3, P1-10 instrumentation — no Sprint B/C work

---

## Summary

Sprint A removes homepage decision friction and fixes the ADHD screening deep-link so “Free ADHD Screening” lands on the ASRS intro, not the multi-service chooser. GTM-ready `dataLayer` events are instrumented for a 14-day measurement window before Sprint B.

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | P0-2/P0-3: removed “Find the Right Starting Point” from hero + final CTA; P0-1: screening links → `?start=asrs`; P1-10: `data-siya-track` attributes + analytics script |
| `asrs-screener.js` | P0-1: `?start=asrs` skips chooser; P1-10: `asrs_intro_view` dataLayer event |
| `sprint-a-homepage-analytics.js` | **New** — homepage click instrumentation (P1-10) |
| `scripts/capture-sprint-a-screenshots.mjs` | **New** — after-state screenshot capture |
| `docs/sprint-a-screenshots/before/` | **New** — pre-change homepage screenshots (copied from visual audit) |
| `docs/sprint-a-screenshots/after/` | Post-change screenshots (run capture script) |
| `docs/SPRINT-A-IMPLEMENTATION-REPORT.md` | **New** — this report |

**Not changed (intentional):** `telehealth.html`, sitewide generators, Sprint B/C copy, provider photos, footer, trust section.

---

## GTM Events Added

All events push to `window.dataLayer` with `sprint: 'A'` and `page_path`. Configure **Custom Event triggers** in GTM container `GTM-PLBD4TTQ`.

| Event name | When fired | Key parameters |
|------------|------------|----------------|
| `screening_cta_click` | Click on homepage link with `data-siya-track="screening-cta-click"` | `cta_location` (`symptoms-transition`, `pathway-adhd`, `faq`), `link_url` |
| `hero_cta_primary_click` | Hero “Talk to a clinician” button | `cta_location` (`hero`), `link_url` |
| `final_cta_primary_click` | Final band “Talk to a Clinician” | `cta_location` (`final-cta`), `link_url` |
| `nav_cta_primary_click` | Header/mobile nav booking button | `cta_location` (`header-nav`, `mobile-nav`), `link_url` |
| `homepage_booking_click` | Testimonial inline booking link | `cta_location` (`testimonials-inline`), `link_url` |
| `reviews_link_click` | HelloKlarity external reviews link | `cta_location` (`testimonials`), `link_url` |
| `asrs_intro_view` | ASRS intro step shown on `/adhd-screening` | `entry_source` (`deep_link`, `chooser`, `organic_chooser`), `query_string` |

### GTM setup checklist

1. **Trigger:** Custom Event = `screening_cta_click`
2. **Trigger:** Custom Event = `hero_cta_primary_click`
3. **Trigger:** Custom Event = `final_cta_primary_click`
4. **Trigger:** Custom Event = `nav_cta_primary_click`
5. **Trigger:** Custom Event = `reviews_link_click`
6. **Trigger:** Custom Event = `asrs_intro_view`
7. **Tag:** GA4 Event tags mapping each to GA4 recommended events where applicable (`generate_lead`, `select_content`)
8. **Variable:** Data Layer Variable for `cta_location`, `entry_source`, `sprint`

### Funnel definition (GA4 Explorations)

```
screening_cta_click → page_view (/adhd-screening) → asrs_intro_view (entry_source=deep_link) → asrs_start (manual: add on Start screening button in future)
```

---

## Before / After Screenshots

| View | Before | After |
|------|--------|-------|
| Homepage hero (1440) | `docs/sprint-a-screenshots/before/homepage-hero-1440.png` | `docs/sprint-a-screenshots/after/homepage-hero-1440.png` |
| Homepage full (1440) | `docs/sprint-a-screenshots/before/homepage-full-1440.png` | `docs/sprint-a-screenshots/after/homepage-full-1440.png` |
| Homepage hero (mobile) | `docs/sprint-a-screenshots/before/homepage-hero-mobile.png` | `docs/sprint-a-screenshots/after/homepage-hero-mobile.png` |
| Final CTA band | — | `docs/sprint-a-screenshots/after/homepage-final-cta-1440.png` |
| Screening deep-link | Chooser (old behavior) | `docs/sprint-a-screenshots/after/screening-deep-link-1440.png` |

**Before source:** Copied from `docs/visual-audit-screenshots/` (pre-Sprint A state).  
**Capture after:** `npx serve -l 8877 .` then `node scripts/capture-sprint-a-screenshots.mjs`

### Visual diff (expected)

- **Hero:** Single primary button + pricing text link; no secondary “Find the Right Starting Point”
- **Final CTA:** Single “Talk to a Clinician” button
- **Screening:** `/adhd-screening?start=asrs` shows “Free ADHD Screening” intro, not “What are you looking for help with?”

---

## Measurement Dashboard Recommendations

### 1. GA4 Exploration — Sprint A Conversion Funnel

**Type:** Funnel exploration  
**Steps:**
1. `screening_cta_click` (filter: `page_path` = `/`)
2. `page_view` where `page_location` contains `adhd-screening`
3. `asrs_intro_view` where `entry_source` = `deep_link`
4. (Future) `asrs_complete` when results step instrumented

**Segment:** Compare 14 days pre-deploy vs 14 days post-deploy.

### 2. GA4 Exploration — Hero CTA concentration

**Type:** Free form  
**Dimensions:** `cta_location`, Event name  
**Metrics:** Event count, Users  
**Events:** `hero_cta_primary_click`, `nav_cta_primary_click`, `final_cta_primary_click`  
**Goal:** Confirm hero + final CTR rose after removing competing secondary CTA.

### 3. Looker Studio (or GA4 report)

| Card | Metric |
|------|--------|
| ASRS deep-link rate | `asrs_intro_view` (deep_link) / `screening_cta_click` |
| Homepage booking clicks | Sum of hero + nav + final + testimonials booking events |
| Klarity leakage | `reviews_link_click` count vs booking clicks (ratio) |
| Bounce rate | GA4 homepage bounce (standard) |

### 4. GTM Preview / Tag Assistant

Validate all 7 events fire on staging before promoting GTM workspace.

### 5. Success thresholds (14-day window)

| Metric | Target |
|--------|--------|
| `asrs_intro_view` with `deep_link` / `screening_cta_click` | ≥ 85% |
| `hero_cta_primary_click` rate vs baseline | +8–15% |
| Homepage bounce rate | −3–7% |
| `reviews_link_click` / sessions | Baseline only (decision in Sprint D+) |

### 6. Rollback triggers

| Signal | Action |
|--------|--------|
| `screening_cta_click` ↑ but `asrs_intro_view` (deep_link) flat | Debug `?start=asrs` param / JS |
| Booking clicks ↓ >15% | Revert P0-2/P0-3 secondary CTA |
| ASRS completions ↓ | Restore chooser as default |

---

## Verification Steps

```bash
cd apps/siya-health
# Local preview
npx serve -l 8877 .

# Manual checks
open http://127.0.0.1:8877/
open 'http://127.0.0.1:8877/adhd-screening?start=asrs'

# Screenshots
node scripts/capture-sprint-a-screenshots.mjs
```

- [ ] Hero shows one primary CTA only
- [ ] Final CTA shows one button only
- [ ] `/adhd-screening?start=asrs` → “Free ADHD Screening” (not chooser)
- [ ] `/adhd-screening` (no param) → chooser still shown
- [ ] GTM Preview: click hero, screening link, Klarity link — events fire

---

## Deployment verification (June 6, 2026)

| Check | Status |
|-------|--------|
| Hero: one primary CTA | PASS |
| Final CTA: one button | PASS |
| `?start=asrs` → ASRS intro | PASS |
| `/adhd-screening` → chooser | PASS |
| 7 dataLayer events | PASS |
| GTM dataLayer (preview-ready) | PASS — wire triggers in GTM workspace |
| Mobile render | PASS |

**Commits pushed:** `4a9f298`, `58dc2a9`  
**Measurement window:** See [`SPRINT-A-MEASUREMENT-WINDOW.md`](./SPRINT-A-MEASUREMENT-WINDOW.md)

---

## Document History

| Version | Notes |
|---------|-------|
| v1.1 | Deploy verification + measurement window |
| v1.0 | Sprint A implementation complete |
