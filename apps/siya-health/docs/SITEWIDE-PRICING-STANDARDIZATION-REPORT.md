# Sitewide Pricing Standardization Report

**Date:** 2026-07-19  
**Approved public price:** Initial physician evaluation **$149** (one-time)  
**Unchanged:** Follow-up $79/month (non-controlled), $149/month (controlled); Meet & Greet free; screening free; labs/meds separate.

## Source of truth

`data/site-standards.mjs` → `PRICING.initialEvaluation`  
- `amount: 149`  
- `display: '$149'`

Generators updated to read this constant where applicable (`generate-pricing-page.mjs`, `site-chrome.mjs` pricing titles).

## Pages / surfaces updated

- Core commercial pages (ADHD, Weight, Men’s, Telehealth, Women’s, Primary, Labs, Prescriptions, Pricing, Booking)
- Geo ADHD diagnosis landings
- California screening landing (promo “was $199 / now $149” removed — both are now standard $149)
- Blog + Health Guides with Siya current-price claims
- Meta titles/descriptions, FAQ schema where they stated Siya’s evaluation fee
- AI indexes / chrome title map strings

## Intentionally retained

| Item | Reason |
|------|--------|
| URL `/answers/what-included-199-adhd-evaluation` | Preserve URL; content now says $149 |
| `data-cta="start-199-evaluation"` / `click_start_199_evaluation` | Analytics event IDs unchanged |
| `ADHD_EVALUATION_199_LINK` constant name | Booking URL constant; destination unchanged |
| Controlled follow-up **$149/month** | Separate product; not initial evaluation |
| Industry comparison ranges (e.g. $500–$2,000) | Not Siya’s price |

## Operational / Ads conflicts to update manually

- Google Ads copy mentioning $199
- HelloKlarity / CarePatron / Spruce patient-facing price text
- Google Business Profile / directories / email templates / PDFs

## QA snapshot (pre-deploy)

- `$199` in `*.html` / `*.mjs` / `*.js` (excluding docs historical notes): **0** after replace
- Pricing page cards: $149 / $79 / $149 follow-up
- ADHD Care pricing strip: $149 evaluation

## Not in this pass

- Women’s Health full blueprint standardization
- Utility page redesign (labs/prescriptions)
- Cannibalization narrowing
- Photography sprint
- Mass editorial rewrite
