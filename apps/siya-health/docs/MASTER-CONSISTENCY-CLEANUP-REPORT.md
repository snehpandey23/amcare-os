# Siya Health — Master Consistency Cleanup Report

**Completed:** 2026-06-07  
**Scope:** `apps/siya-health/` — pricing, CTAs, providers, blog hygiene, build validation  
**Canonical standards:** `data/site-standards.mjs`

---

## Executive Summary

This sprint implemented the founder-approved **care-delivery pricing model** ($199 / $79 / $149), consolidated CTAs toward the three-slot system, removed off-brand blog content, fixed broken internal links, and established `site-standards.mjs` as the regression-prevention source of truth.

**Build status: PASS** — `npm run build` completes with Cannibalization Phase 1 PASS, 0 broken internal links, 164 sitemap URLs, and all deployment validations green.

The site is **launch-ready for a controlled soft launch** with known content-debt items (CTA label consolidation, geo-funnel pricing copy, full site-pruning backlog) documented below.

---

## Critical Issues Found

| Issue | Status | Notes |
|-------|--------|-------|
| Broken internal links (8 → 0) | **Fixed** | `/blog/all`, deleted blog cards, modafinil continue-reading |
| Legacy `/membership-pricing` Bronze/Silver/Gold | **Fixed** | Page deleted; `/pricing` generated; redirect in `vercel.json` |
| `$150` controlled follow-up on `/adhd-care` | **Fixed** | Normalized to **$149** |
| Wendy Delgado on ADHD/telehealth service rosters | **Fixed** | Weight loss only per `PROVIDER_CANONICAL` |
| Off-brand blog articles (modafinil, ambien, glutathione) | **Deleted** | Redirects to clinical service lines |
| `blog/all.html` hub | **Deleted** | Links → `/blog`; redirect in place |
| CTA chaos (Meet & Greet, waitlist, 66 labels) | **Partial** | `normalizeSitewideCopy()` enforces primary; 318 audit flags remain |
| Provider mention inconsistencies (206 flags) | **Partial** | Hub + roster fixes; full sitewide grep cleanup deferred |
| Brand MERGE/REWRITE backlog (98 pages) | **Open** | Audit-only recommendations not fully implemented |
| Full site-pruning (82 redirects) | **Open** | Key redirects only; inventory audit unchanged |

---

## Files Modified

### Source of truth & build pipeline

- `data/site-standards.mjs` — `PRICING`, `CTA_SYSTEM`, `PROVIDER_CANONICAL`, `REMOVED_BLOG_PATHS`, `REMOVED_BOOKING_CTA_LABELS`
- `data/providers.mjs` — Wendy removed from ADHD/telehealth rosters; Swati job title; pricing path
- `data/provider-hub-presentation.mjs` — Wendy weight-loss-only copy
- `scripts/site-chrome.mjs` — CTA/pricing/footer normalize; energy continue-reading fallbacks; dead blog path rewrite
- `scripts/generate-pricing-page.mjs` — **new** unified pricing page generator
- `scripts/generate-provider-pages.mjs` — hub CTAs: Talk to a Clinician + Explore Telehealth Care
- `scripts/seo-build.mjs` — pricing breadcrumb; removed `blog/all` references
- `package.json` — build includes pricing generator
- `vercel.json` — pricing, blog, funnel redirects

### Content pages (representative)

- `pricing.html` — **new** canonical pricing hub
- `about.html` — primary/secondary CTA alignment
- `adhd-care.html` — $149 controlled follow-up
- `blog/index.html`, `blog/adhd.html`, `blog/telehealth.html`, `blog/weight-loss.html` — hub link fixes; deleted article cards removed
- `blog/insomnia-treatment-options-beyond-medication.html` — continue-reading dead link removed
- `providers/*` — regenerated from updated data
- 160+ pages touched by `seo-build.mjs` normalize pass (footer pricing label, CTA labels, state copy)

---

## Pages Modified

| Category | Count | Key changes |
|----------|------:|-------------|
| Total HTML in sitemap | 164 | Post-cleanup indexable set |
| Service pages | 12 | CTA + footer pricing path |
| Blog hubs | 4 | `/blog/all` → `/blog`; telehealth cards pruned |
| Blog articles | 56 | Continue-reading dead paths rewritten at build |
| Health Guides | 65 | Cannibalization pointers intact |
| Provider profiles | 8 | Hub + 7 clinicians regenerated |
| Legal | 5 | Unchanged counsel sources |

---

## Redirects Added

| Source | Destination | Type |
|--------|-------------|------|
| `/membership-pricing` | `/pricing` | 301 |
| `/adhd-evaluation-cost` | `/pricing` | 301 |
| `/blog/all` | `/blog` | 301 |
| `/blog/modafinil-for-focus-and-fatigue-is-it-safe` | `/adhd-care` | 301 |
| `/blog/ambien-and-sleep-medications-risks-and-benefits` | `/blog/insomnia-treatment-options-beyond-medication` | 301 |
| `/blog/glutathione-and-peptides-what-do-they-actually-do` | `/mens-health-longevity` | 301 |
| `/mental-health-adhd` | `/adhd-care` | 301 |
| `/online-adhd-test` | `/adhd-screening` | 301 |
| `/adult-adhd-diagnosis`, `/adhd-treatment-online` | `/adhd-care` | 301 |
| `/adhd-diagnosis-florida` | `/adhd-care` | 301 |
| `/siya-circle` | GHL newsletter form | 302 |

---

## Pages Deleted

| Page | Rationale |
|------|-----------|
| `membership-pricing.html` | Replaced by `/pricing` care-delivery model |
| `blog/all.html` | Redundant with `/blog` category hub |
| `blog/modafinil-for-focus-and-fatigue-is-it-safe.html` | Off-brand wake-agent content |
| `blog/ambien-and-sleep-medications-risks-and-benefits.html` | Off-brand sleep Rx content |
| `blog/glutathione-and-peptides-what-do-they-actually-do.html` | Off-brand peptide/supplement content |

---

## Pricing / CTA / Provider / SEO / Brand Fixes

### Pricing

- **Canonical:** `/pricing` — $199 initial, $79 non-controlled, $149 controlled follow-up
- **Legacy path:** `/membership-pricing` → redirect; 0 footer links remain (was 167)
- **Post-audit:** 32 low/medium inconsistencies remain (geo ADHD funnels with vague “monthly plan”, hero $199 without breakdown on 5 pages)

### CTA system

| Slot | Label | Target |
|------|-------|--------|
| Primary | Talk to a Clinician | CarePatron booking URL |
| Secondary (context) | Book ADHD Evaluation / Start Weight Loss Evaluation / Explore Telehealth Care | Per service |
| Newsletter | Join Siya Circle | GHL form URL |

- `REMOVED_BOOKING_CTA_LABELS` strips Meet & Greet, waitlist, Bronze/Silver/Gold CTAs at build time
- **Remaining:** 318 CTA instances flagged REMOVE/CONSOLIDATE in fresh audit (duplicate main-body booking buttons, screening label variants)

### Provider consistency

- `PROVIDER_CANONICAL` added for all 7 clinicians
- Wendy Delgado: weight loss/metabolic only — removed from `adhd-care` and `telehealth` in `providers.mjs`
- Provider hub + profile pages regenerated
- **Remaining:** 206 automated flags (title variants, cross-service mentions in blog copy)

### SEO / internal links

- 0 broken internal links (was 8)
- Sitemap: 164 URLs (down from 166)
- Cannibalization Phase 1: PASS
- `REMOVED_BLOG_PATHS` rewrites dead hrefs during `seo-build`

### Brand

- Deleted 4 off-brand blog URLs; `blog/telehealth` hub pruned
- Avg mission alignment 7.7/10, brand 6.7/10 post-audit
- **Remaining:** 85 MERGE + 13 REWRITE recommendations (mostly guide↔blog overlap, not blockers)

---

## Remaining Issues

1. **CTA consolidation** — Reduce 66 unique labels to 3-slot system on service/geo pages (318 audit removals)
2. **Geo ADHD funnels** — 10 duplicate pricing surfaces; add $79/$149 follow-up copy or redirect to `/pricing`
3. **Service pages** — Weight loss, telehealth lack inline pricing tables (link to `/pricing` only)
4. **Site pruning** — Full 76–97 page target from pruning audit not executed
5. **Provider grep cleanup** — 206 consistency flags across blogs and legacy copy
6. **Brand MERGE backlog** — 85 pages flagged for content merge (non-blocking)
7. **Prior compliance audits** — Legal entity block, Derek OH availability, ADHD compliance (separate sprint)

---

## Build Validation

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** |
| Cannibalization Phase 1 final | **PASS** |
| Broken internal links | **0** |
| Sitemap URLs | **164** |
| `validate-legal-links.mjs` | **OK** |
| `validate-deployment-hardening.mjs` | **OK** |
| `validate-ghl-legal-acceptance.mjs` | **OK** |
| `validate-svg-diagrams.mjs` | **PASS** |
| `validate-diagram-assets.mjs` | **PASS** |
| `validate-root-asset-paths.mjs` | **PASS** |

### Post-cleanup audits (2026-06-07)

| Audit | Key metric |
|-------|------------|
| `audit-provider-consistency` | 206 issues (down from 181 doc baseline; expanded grep scope) |
| `audit-pricing-system` | 32 inconsistencies, 21 pages needing updates |
| `audit-cta-inventory` | 1,169 CTAs; 318 REMOVE flags |
| `audit-brand-consistency` | 7.7 mission / 6.7 brand avg; 4 DELETE, 85 MERGE, 13 REWRITE |

---

## Final Launch Readiness Score

### **82 / 100**

| Dimension | Weight | Score | Rationale |
|-----------|--------|------:|-----------|
| Build & link integrity | 25% | 25/25 | Green build, 0 broken links, validations pass |
| Pricing clarity | 20% | 17/20 | Unified `/pricing`; geo funnels still vague |
| CTA system | 15% | 10/15 | Normalize rules live; main-body duplication remains |
| Provider trust | 15% | 12/15 | Wendy/roster fixed; grep inconsistencies remain |
| Brand & content hygiene | 15% | 11/15 | Off-brand blogs removed; MERGE backlog open |
| SEO / cannibalization | 10% | 10/10 | Phase 1 PASS; sitemap clean |

**Verdict:** Safe to deploy for **controlled soft launch**. Schedule Phase 2 for CTA deduplication, geo-funnel pricing copy, and full site-pruning execution before paid acquisition scale-up.

---

## Regenerate commands

```bash
cd apps/siya-health
npm run build
node scripts/audit-provider-consistency.mjs
node scripts/audit-pricing-system.mjs
node scripts/audit-cta-inventory.mjs
node scripts/audit-brand-consistency.mjs
```
