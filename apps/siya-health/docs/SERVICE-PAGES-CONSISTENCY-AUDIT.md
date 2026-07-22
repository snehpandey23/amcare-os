# Service Pages Consistency Audit

**Date:** 2026-07-18  
**Reference:** Homepage + ADHD Care + `SERVICE-PAGE-BLUEPRINT.md`  
**Pages:** Medical Weight Loss · Men’s Health · Telehealth  
**Status:** Desktop consistency polish deployed for review

---

## Medical Weight Loss (`weight-loss-metabolic-health.html`)

### Sections Added
- Photo + metrics trust block (`trust-metrics-adhd-human`, no count-up flicker)
- Editorial recognition cards (“Does This Sound Like You?”)
- Homepage-style 3-step How to Get Started
- Suggested Reading (6 photo cards)
- Concise physician perspective (Dr. Sneh)

### Sections Removed
- Hero support strip (bullets/chips moved into trust)
- SVG media accent illustration
- 4-step long care-roadmap
- Cornerstone hub (replaced by Suggested Reading)

### Image Updates
- Trust: `editorial-exhausted-morning.jpg`
- Recognition cards: editorial weight/energy/burnout set
- Suggested Reading thumbnails from editorial library

### Consistency Improvements
- Hero CTAs: Meet & Greet + Secure Chat (equal-height via `.page-service`)
- Body class `page-weight-loss page-service`
- FAQ moved after pricing/MD toward blueprint order
- Final CTA matches Meet & Greet + Chat

### SEO Preserved
- Title, meta, canonical, schema unchanged (content-visible H1 retained)

### Internal Links Preserved
- Blog/guide destinations kept; Suggested Reading points to existing weight articles

### Deferred Improvements
- Full pricing card layout (still uses shared pricing strip once)
- Mobile-specific polish pass
- Further trim of “why weight is complicated” density

---

## Men’s Health (`mens-health-longevity.html`)

### Sections Added
- Trust photo + metrics block
- Editorial recognition (6 cards)
- 3-step How to Get Started
- Suggested Reading (6 cards)
- Physician perspective
- Transparent header (aligned with other service heroes)

### Sections Removed
- Testosterone SVG pathway as primary “how it works”
- Emoji telehealth strip
- Cornerstone hub
- Duplicate “How we approach care” density (services grid kept as overview)

### Image Updates
- Trust: `editorial-energy-afternoon.jpg`
- Recognition: exhausted / focus / burnout / hormones / weight / finally-heard
- Hero remains `editorial-burnout-afterwork.jpg`

### Consistency Improvements
- Hero/final CTAs: Meet & Greet + Secure Chat
- Body class `page-mens-health page-service`
- Shared hover/reading/process CSS

### SEO Preserved
- Title/meta/canonical/schema unchanged

### Internal Links Preserved
- TRT / testosterone / fatigue articles and answers retained in Suggested Reading

### Deferred Improvements
- Dedicated FAQ accordion (not present; can add in follow-up)
- Mobile polish
- Optional reintroduction of testosterone diagram as a secondary education module (not hero process)

---

## Telehealth (`telehealth.html`)

### Sections Added
- Trust photo + metrics (no count-up)
- Editorial recognition (“Does This Sound Like You?”)
- 3-step How to Get Started
- Suggested Reading (6 cards)
- Physician perspective

### Sections Removed
- Hero bullet list + trust chips (decluttered first viewport)
- Standalone media-accent photo section
- Cornerstone hub
- Secondary CTA “Explore Care Options” (hero + final)

### Image Updates
- Hero → `editorial-finally-heard.jpg` (no longer ADHD consult as hero)
- Trust uses consult photo in trust block where appropriate
- Recognition cards use editorial set

### Consistency Improvements
- Body class `page-telehealth page-service`
- Hero/final CTAs: Meet & Greet + Secure Chat
- Meta description states aligned to CA · TX · PA · FL (factual)
- Chrome final-CTA normalizer updated so deploy won’t restore Explore Care

### SEO Preserved
- Title/canonical/schema pattern preserved; meta description state list corrected only

### Internal Links Preserved
- Telehealth answers/blog hub retained in Suggested Reading; services/why-choose kept as overview

### Deferred Improvements
- Why-choose card count fine-tuning
- Mobile polish
- Optional reduction of services grid density

---

## Shared / Build System

| Change | Why |
|--------|-----|
| `scripts/apply-service-pages-consistency.mjs` | Reproducible structural polish |
| `LEARN_MORE_WEIGHT/MENS/TELE` in `site-chrome.mjs` | Prevent rebuild from reverting Suggested Reading |
| `normalizeCtaHierarchy` for WL/Men’s/Tele | Final CTA stays Meet & Greet + Chat |
| `.page-service` CSS | Equal CTAs, trust contrast, 3-step grid, recognition hover |
| `trust-metrics.js` skips `trust-metrics-human` | No photo flicker on count-up |

---

## Review URLs

- https://www.siya.health/weight-loss-metabolic-health  
- https://www.siya.health/mens-health-longevity  
- https://www.siya.health/telehealth  

Blueprint for future pages: `docs/SERVICE-PAGE-BLUEPRINT.md`
