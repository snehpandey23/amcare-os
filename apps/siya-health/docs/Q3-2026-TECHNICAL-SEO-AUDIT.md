# Q3 2026 Technical SEO Audit v1

**Date:** 2026-07-26  
**Scope:** `apps/siya-health` HTML (excluding node_modules/brand)

**Pages scanned:** 194


## P0 — fix this sprint

### Service pages missing FAQPage schema

**Fixed 2026-07-26 (injected from existing FAQ UI):**
- `adhd-care.html` ✅
- `telehealth.html` ✅
- `womens-health.html` ✅
- `weight-loss-metabolic-health.html` ✅
- `pricing.html` ✅

**Still open (need FAQ content + schema in Weeks 3–4):**
- `primary-urgent-care.html` — no FAQ section yet
- `mens-health-longevity.html` — no FAQ section yet
- `adhd-screening.html` — optional (tool page; CA landing has FAQPage)

**Lower priority / non-service:**
- `answers/index.html`, `blog/index.html`, `providers/index.html`, legal/*, redirect/* — skip or light touch

### FAQ UI present but no FAQPage JSON-LD

Resolved for core service pages listed above ✅

Remaining: hub index pages if desired.

### Missing meta description (2)

- `LOCAL-PREVIEW.html`
- `_preview-carepatron-circle-embed.html`

### Missing canonical (3)

- `LOCAL-PREVIEW.html`
- `_preview-carepatron-circle-embed.html`
- `siya-circle.html`

## P1 — duplicate titles (0 groups)


## P1 — duplicate H1s (1 groups)


**booking your free meet &amp; greet** (2)

- `redirect/meet-greet/index.html`
- `redirect/adhd-walkthrough/index.html`

## Missing H1 (0)


## California-related HTML paths

- `adult-adhd-screening-california.html`
- `answers/can-adhd-be-diagnosed-online.html`
- `answers/can-adhd-cause-anxiety.html`
- `answers/can-sleep-apnea-cause-fatigue.html`
- `answers/can-you-get-adhd-medication-online.html`
- `answers/telehealth-adhd-california.html`
- `blog/adhd-evaluation-california-online-vs-in-person.html`
- `blog/adhd-medication-online-california.html`
- `blog/adhd-medication-options-california.html`
- `blog/adhd-telehealth-california.html`
- `blog/adhd-testing-online-california-screening-vs-evaluation.html`
- `blog/adult-adhd-symptoms-california.html`
- `blog/adult-adhd-treatment-california-2026.html`
- `blog/how-to-choose-adhd-provider-california.html`
- `blog/online-adhd-diagnosis-california.html`

## Next audit passes (manual / GSC)

- Search Console: queries with impressions + low CTR; positions 11–20

- Broken links crawl (Screaming Frog / playwright)

- Core Web Vitals (PageSpeed Insights on home, adhd-care, primary-urgent-care, adhd-screening)

- robots.txt + sitemap.xml consistency

- Image alt text sample (hero + blog)

- Redirect chains
