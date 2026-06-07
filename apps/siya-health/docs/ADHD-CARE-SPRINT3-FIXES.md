# ADHD Care Sprint 3 — Deployment Blocker Fixes

**Date:** June 2026

## All 10 fixes — confirmed

| # | Fix | Status |
|---|-----|--------|
| 1 | Trust metrics show 1,500+ / 750+ / 4.7★ / 450+ (not zero) | ✅ `trust-metrics.js` + static HTML fallbacks |
| 2 | Legacy 1,000+ / 200+ / 500+ removed from page body | ✅ `#why-choose` synced |
| 3 | Pricing CTA → Book ADHD Evaluation | ✅ |
| 4 | FAQ dual CTA (Still deciding? + both buttons) | ✅ |
| 5 | Non-ADHD Learn More links removed | ✅ ADHD-only cluster |
| 6 | Medical Director section (Dr. Sneh Pandey) | ✅ Between trust + FAQ |
| 7 | Providers: Vanessa + Wendy added | ✅ 6-clinician grid |
| 8 | Pricing hierarchy: START HERE / After Your Evaluation | ✅ |
| 9 | Pricing card: no acronym dump | ✅ Generic validated-tools line |
| 10 | Comparison softened | ✅ No “Generalists, not specialists” |

## Files modified

- `adhd-care.html`
- `trust-metrics.js`
- `data/providers.mjs`
- `scripts/site-chrome.mjs`
- `scripts/capture-adhd-sprint3-screenshots.mjs`

## Validation

```
npm run build — PASS
Playwright trust metrics: ['1,500+', '4.7★', '450+', '750+'] — no zeros
Pricing CTA: Book ADHD Evaluation
FAQ headline: Still deciding?
```

## Screenshots

`docs/adhd-sprint3-screenshots/` — trust metrics, pricing, medical director, FAQ CTA, providers
