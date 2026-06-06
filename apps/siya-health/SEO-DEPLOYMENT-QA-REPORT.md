# SEO Deployment QA Report

Generated: 2026-06-06T06:05:59.588Z

## Summary

| Metric | Value |
|--------|------:|
| HTML pages scanned | 168 |
| Sitemap URLs | 168 |
| Pages with Meet & Greet in nav | 54 |
| Non-ADHD pages still referencing adhd-screening | 3 |
| Broken internal links (sample) | 0 |
| JSON-LD parse errors | 0 |

## Content deployed

### Cornerstone blogs

| URL | File exists | In sitemap |
|-----|:-----------:|:----------:|
| /blog/food-noise-and-glp-1-what-it-means-and-what-helps | ✓ | ✓ |
| /blog/insulin-resistance-and-weight-loss-clinician-overview | ✓ | ✓ |
| /blog/why-am-i-always-tired-causes-when-to-see-doctor | ✓ | ✓ |

### Answer pages

| Slug | Exists | Sitemap | Meet & Greet CTA | Blog backlink |
|------|:------:|:-------:|:----------------:|:-------------:|
| what-is-food-noise | ✓ | ✓ | ✓ | ✓ |
| what-is-insulin-resistance | ✓ | ✓ | ✓ | ✓ |
| insulin-resistance-without-diabetes | ✓ | ✓ | ✓ | ✓ |
| normal-a1c-insulin-resistance | ✓ | ✓ | ✓ | ✓ |
| why-am-i-tired-even-after-sleeping | ✓ | ✓ | ✓ | ✓ |

## CTA repositioning

- **Default primary CTA:** Book a Meet & Greet → `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=sysv73e4`
- **Default secondary CTA:** Explore Care Options → `#services` or service hubs
- **ADHD screening retained on:** ADHD service pages, ADHD blogs, ADHD answers, Creyos, geo diagnosis pages, `adhd-screening.html`

### Non-ADHD pages still containing `adhd-screening` (3)

- `about.html`
- `index.html`
- `providers/megan-wunderlich.html`

### All pages with any `adhd-screening` reference (57)

- `about.html`
- `adhd-care.html`
- `adhd-diagnosis-austin.html`
- `adhd-diagnosis-florida.html`
- `adhd-diagnosis-houston.html`
- `adhd-diagnosis-pennsylvania.html`
- `adhd-diagnosis-philadelphia.html`
- `adhd-diagnosis-texas.html`
- `adhd-evaluation-cost.html`
- `adhd-screening.html`
- `adhd-treatment-online.html`
- `adult-adhd-diagnosis.html`
- `answers/adderall-vs-vyvanse-adults.html`
- `answers/adhd-in-men.html`
- `answers/adhd-in-women.html`
- `answers/adhd-medication-every-day.html`
- `answers/adhd-medication-side-effects.html`
- `answers/adhd-vs-anxiety.html`
- `answers/adhd-vs-burnout.html`
- `answers/asrs-adhd-screening-explained.html`
- `answers/can-adhd-be-diagnosed-online.html`
- `answers/can-adhd-cause-anxiety.html`
- `answers/can-you-get-adhd-medication-online.html`
- `answers/creyos-adhd-testing-explained.html`
- `answers/executive-dysfunction-adhd.html`
- `answers/high-functioning-adhd.html`
- `answers/how-long-adhd-evaluation.html`
- `answers/how-much-does-adhd-testing-cost.html`
- `answers/index.html`
- `answers/is-adhd-medication-safe-long-term.html`
- `answers/is-online-adhd-diagnosis-legitimate.html`
- `answers/late-adhd-diagnosis-adults.html`
- `answers/non-stimulant-adhd-medications.html`
- `answers/rejection-sensitivity-adhd.html`
- `answers/screening-vs-adhd-evaluation.html`
- `answers/signs-of-adult-adhd.html`
- `answers/starting-adhd-medication-adults.html`
- `answers/time-blindness-adhd.html`
- `blog/adderall-for-adhd-how-it-works.html`
- `blog/adhd.html`

_…and 17 more (expected on ADHD funnels)._

## Internal link cluster (food noise ↔ insulin ↔ fatigue)

| From | To | Linked |
|------|-----|:------:|
| blog/food-noise-and-glp-1-what-it-means-and-what-helps.html | insulin-resistance-and-weight-loss-clinician-overview | ✓ |
| blog/food-noise-and-glp-1-what-it-means-and-what-helps.html | why-am-i-always-tired-causes-when-to-see-doctor | ✓ |
| blog/insulin-resistance-and-weight-loss-clinician-overview.html | food-noise-and-glp-1-what-it-means-and-what-helps | ✓ |
| blog/insulin-resistance-and-weight-loss-clinician-overview.html | why-am-i-always-tired-causes-when-to-see-doctor | ✓ |
| blog/why-am-i-always-tired-causes-when-to-see-doctor.html | food-noise-and-glp-1-what-it-means-and-what-helps | ✓ |
| blog/why-am-i-always-tired-causes-when-to-see-doctor.html | insulin-resistance-and-weight-loss-clinician-overview | ✓ |

## Service page Learn More blocks

| Page | Marker |
|------|--------|
| weight-loss-metabolic-health.html | SIYA:LEARN-MORE-WEIGHT |
| mens-health-longevity.html | SIYA:LEARN-MORE-MENS |
| telehealth.html | SIYA:LEARN-MORE-TELE |

## Schema validation

_No JSON-LD parse errors._

## Broken links (first 25)

_None detected in static HTML scan._

## Orphan pages (low inbound links, sample)

- `intake/index.html`
- `visual-components.html`

## Recommendations

1. Deploy via Netlify after merge; publish root is `apps/siya-health`.
2. Re-run this script after any manual HTML edits: `node scripts/seo-deployment-qa-report.mjs`.
3. Monitor Search Console for new cornerstone URLs indexing.
4. Review remaining `adhd-screening` references—intentional on ADHD funnels only.

## Build command

```bash
node scripts/generate-answer-pages.mjs && node scripts/internal-link-audit.mjs && node scripts/seo-build.mjs && node scripts/generate-ai-indexes.mjs && node scripts/seo-deployment-qa-report.mjs
```
