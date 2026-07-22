# Website Audit — Execution Report (partial)

**Date:** 2026-07-19  
**Scope:** Controlled execution after approved audit — **not** the full multi-phase plan.

## Implemented this deploy

### Phase 0 — Pricing → $149
- Source of truth: `data/site-standards.mjs` `PRICING.initialEvaluation`
- `design-system/trust-system.mjs` trust headline
- Sitewide HTML/content/generators updated
- CA landing: removed fake “limited-time / regularly $199” strikethrough (both were $149 after replace)
- Report: `docs/SITEWIDE-PRICING-STANDARDIZATION-REPORT.md`
- Analytics CTA IDs (`start-199-evaluation`) intentionally unchanged
- URL slug `what-included-199-adhd-evaluation` preserved; visible copy says $149

### Phase 1 — Low-risk fixes
- Footer: `/prescriptions` + `/primary-urgent-care` (`scripts/site-chrome.mjs`)
- Telehealth FAQ links to primary care, prescriptions, labs
- ADHD Care FAQ: Creyos → `/creyos-adhd-testing`
- Pricing FAQ: Creyos inclusion answer
- About + Pricing heroes: Meet & Greet + Secure Chat (Explore Care removed from heroes)
- CTA labels: “Explore Care Options” → “View Telehealth Services” in site-standards secondary defaults
- Documented `HAND_MAINTAINED_ANSWER_SLUGS` (5 guides) in `data/answer-seeds.mjs`

### Audit docs (already on disk; not a site redesign)
- Full audit suite under `docs/` (route inventory, legal, medical queue, content audit, editorial style guide, etc.)

## Not implemented yet (deferred)
- Women’s Health full blueprint
- Labs / Prescriptions / Primary utility blueprint polish
- Sentence-level editorial rewrite batches
- Cannibalization narrowing (11 pairs)
- Photography sprint
- Blog featured-image system

## SEO / analytics preserved
- No mass redirects or deletes
- Canonical URLs unchanged
- Conversion tracking event names for evaluation CTA retained

## External follow-up (manual)
- Google Ads / directories / CarePatron / Spruce / email if still showing $199
