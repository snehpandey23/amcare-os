# Sitewide Trust Metrics Audit

**Canonical source:** `data/homepage-trust-metrics.mjs` (homepage is authoritative)  
**Date:** 2026-07-18 · **GBP re-verified:** 2026-08-08

## Canonical figures (homepage)

| Metric | Value | Source |
|--------|-------|--------|
| Patients treated | **2,200+** | Internal volume (not AggregateRating) |
| ADHD evaluations & screenings | **1,000+** | Internal volume (not AggregateRating) |
| Google rating | **4.9★** | Google Business Profile (`GOOGLE_BUSINESS_PROFILE`) |
| Google reviews | **70** | Google Business Profile |
| Verified patient reviews | **900+** | Conservative Klarity (~837) + GBP (70); Zocdoc excluded — page copy only, not AggregateRating |

`design-system/trust-system.mjs` imports these values so hero trust bars injected at build stay in sync.

### Staleness / AggregateRating

Homepage `MedicalOrganization` JSON-LD includes `aggregateRating` and GBP in `sameAs`, both driven by `GOOGLE_BUSINESS_PROFILE` in `homepage-trust-metrics.mjs`.

**This will go stale** the same way 4.8★ / 44 did unless:

1. **Manual recheck (recommended now):** Before any trust/schema ship, open the GBP Maps URL in `GOOGLE_BUSINESS_PROFILE.url`, confirm rating + count, update `ratingValue` / `reviewCount` / `lastVerified`, run site chrome / deploy.
2. **Live Places API (later):** Needs a Google Cloud project, Places API (New) or legacy Place Details, billing, and a stored `place_id`. Feasible but not wired today — no API key or Place Details client in this repo.

Prefer **documented monthly (or pre-deploy) manual recheck** until Places API is intentionally set up.

---

## Audit findings (before alignment)

### Already aligned
- Homepage (`index.html`) trust summary + hero chips
- `trust-system.mjs` item definitions (after wiring to homepage metrics)
- Most pages only showed states / HIPAA / pricing — no volume claims

### Stale / mismatched (fixed)

| Page | Stale claim(s) | Aligned to |
|------|----------------|------------|
| `adhd-care.html` | 1,500+ adults; 4.7★; 450+ reviews; 750+ ADHD evals | 2,200+; **4.9★**; **900+** verified reviews; 1,000+ ADHD evals/screenings |
| `weight-loss-metabolic-health.html` | 4.7★; 450+ reviews; 2,500+ metabolic evals | **4.9★**; **900+** reviews; **2,200+ patients treated** (no invented metabolic-only count) |
| `adult-adhd-screening-california.html` | 750+ evals; 4.7★; 450+ reviews | 1,000+ evals/screenings; **4.9★**; **900+** reviews |
| Service + LP trust bands (2026-08-08) | Hardcoded 4.8★ / 600+ (not wired to metrics) | `syncCanonicalTrustMetricsCopy()` in `site-chrome.mjs` on every chrome pass |
| `book-appointment.html` | 1,000+ Adults Evaluated | 2,200+ patients treated |
| `terms.html` | 1,000+ Adults Evaluated | 2,200+ patients treated |
| `prescriptions.html` | 1,000+ Adults Evaluated | 2,200+ patients treated |
| `labs.html` | 1,000+ Adults Evaluated | 2,200+ patients treated |
| `blog/index.html` | 1,000+ Adults Evaluated | 2,200+ patients treated |
| `privacy-policy.html` | 1,000+ Adults Evaluated | 2,200+ patients treated |
| `primary-urgent-care.html` | 1,000+ Adults Evaluated | 2,200+ patients treated |

### Intentionally not changed
- Lab/clinical numbers in medical content (e.g. “total T 450 ng/dL”) — not trust marketing metrics
- Word-count / timeout / SVG path noise matching `4.7` / `450` / `2500` in non-copy contexts
- Docs / master prompts (non-production)

### Policy note
- Do **not** invent page-specific volume claims (e.g. “2,500+ metabolic evaluations”) unless added to `homepage-trust-metrics.mjs` with owner approval.
- Prefer patients treated / ADHD evaluations / Google rating / verified reviews from the canonical file.
- **Never** put patients treated / ADHD evals / “600+ verified” into `AggregateRating` — only GBP `ratingValue` + `reviewCount`.

---

## How to update figures next time

1. Confirm live GBP at `GOOGLE_BUSINESS_PROFILE.url` in `apps/siya-health/data/homepage-trust-metrics.mjs`
2. Edit `ratingValue`, `reviewCount`, and `lastVerified` there (Google fields); edit volume claims only with owner approval
3. Run site chrome / `seo-build` — homepage trust summary + org schema refresh, and `syncCanonicalTrustMetricsCopy()` rewrites stale `4.x★` / verified-review copy on service + LP pages
4. Redeploy patient site from monorepo root with the `siya-health` Vercel project IDs (not staff portal)
