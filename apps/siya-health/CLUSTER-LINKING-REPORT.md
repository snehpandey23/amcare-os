# Cluster Linking Report

Generated: 2026-06-04T00:43:03.005Z

## Summary

| Metric | Value |
|--------|------:|
| `/answers/what-is-food-noise` inbound (before) | 2 (audit snapshot) |
| `/answers/what-is-food-noise` inbound (after, HTML scan) | **18** |
| Target inbound | ≥ 8 |
| Cornerstone Continue reading passes | 4 / 4 |

## Links added (by category)

| Type | Target | Detail |
|------|--------|--------|
| continue-reading | All 4 cornerstones | Forced 2 sibling blogs + answer + service via CORNERSTONE_CONTINUE_READING |
| body | food-noise → insulin, fatigue | New paragraphs + internal-links block |
| body | insulin → fatigue, free-T | Sleep/metabolic + SHBG paragraph |
| body | free-T → food-noise, insulin, fatigue | Obesity/insulin + existing paths |
| body | fatigue → free-T | Reading path hormone branch |
| learn-more | weight-loss, mens-health, telehealth | All cornerstones + what-is-food-noise |
| inbound-boost | /answers/what-is-food-noise | 6 GLP-1/weight blogs + 7 answer related arrays |

## Pages modified (source)

- `scripts/site-chrome.mjs`
- `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html`
- `blog/insulin-resistance-and-weight-loss-clinician-overview.html`
- `blog/why-am-i-always-tired-causes-when-to-see-doctor.html`
- `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html`
- `blog/glp1-side-effects-and-how-to-manage-them.html`
- `blog/semaglutide-for-weight-loss-how-it-works.html`
- `blog/tirzepatide-vs-semaglutide-which-is-better.html`
- `blog/medical-weight-loss-glp1-semaglutide-texas.html`
- `blog/how-mental-health-affects-weight-loss-outcomes.html`
- `blog/combining-adhd-treatment-and-weight-loss-strategies.html`
- `data/answer-seeds.mjs`
- `weight-loss-metabolic-health.html`
- `mens-health-longevity.html`
- `telehealth.html`

_Post `seo-build`: all HTML pages receive updated Continue reading on cornerstone blogs._

## Cornerstone Continue reading verification

| Article | CR block | Sibling links | Answer | Service | Pass |
|---------|:--------:|:-------------:|:------:|:-------:|:----:|
| food-noise-and-glp-1-what-it-means-and-what-helps | ✓ | 3/2 | ✓ | ✓ | ✓ |
| insulin-resistance-and-weight-loss-clinician-overview | ✓ | 4/2 | ✓ | ✓ | ✓ |
| why-am-i-always-tired-causes-when-to-see-doctor | ✓ | 4/2 | ✓ | ✓ | ✓ |
| free-testosterone-vs-total-testosterone-what-patients-should-know | ✓ | 4/2 | ✓ | ✓ | ✓ |

## Body cross-link verification (cornerstone cluster)

| From | To | Linked |
|------|-----|:------:|
| food-noise-and-glp-1-what-it-means-and-what-helps | insulin-resistance-and-weight-loss-clinician-overview | ✓ |
| food-noise-and-glp-1-what-it-means-and-what-helps | why-am-i-always-tired-causes-when-to-see-doctor | ✓ |
| insulin-resistance-and-weight-loss-clinician-overview | food-noise-and-glp-1-what-it-means-and-what-helps | ✓ |
| insulin-resistance-and-weight-loss-clinician-overview | why-am-i-always-tired-causes-when-to-see-doctor | ✓ |
| insulin-resistance-and-weight-loss-clinician-overview | free-testosterone-vs-total-testosterone-what-patients-should-know | ✓ |
| why-am-i-always-tired-causes-when-to-see-doctor | insulin-resistance-and-weight-loss-clinician-overview | ✓ |
| why-am-i-always-tired-causes-when-to-see-doctor | food-noise-and-glp-1-what-it-means-and-what-helps | ✓ |
| why-am-i-always-tired-causes-when-to-see-doctor | free-testosterone-vs-total-testosterone-what-patients-should-know | ✓ |
| free-testosterone-vs-total-testosterone-what-patients-should-know | insulin-resistance-and-weight-loss-clinician-overview | ✓ |
| free-testosterone-vs-total-testosterone-what-patients-should-know | why-am-i-always-tired-causes-when-to-see-doctor | ✓ |
| free-testosterone-vs-total-testosterone-what-patients-should-know | food-noise-and-glp-1-what-it-means-and-what-helps | ✓ |

## Inbound: `/answers/what-is-food-noise`

| Source | Before (audit) | After (HTML href count) |
|--------|:--------------:|:------------------------:|
| Site-wide internal | 2 unique pages (under3Inbound) | **18** total `href` instances |

_Target met (≥8 inbound href instances)._

## Remaining weak nodes

_None critical in cornerstone cluster._



## Build order

```bash
node scripts/generate-answer-pages.mjs
node scripts/internal-link-audit.mjs
node scripts/seo-build.mjs
node scripts/cluster-linking-report.mjs
```
