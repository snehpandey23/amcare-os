# Sitewide Trust Metrics Audit

**Canonical source:** `data/homepage-trust-metrics.mjs` (homepage is authoritative)  
**Date:** 2026-07-18

## Canonical figures (homepage)

| Metric | Value |
|--------|-------|
| Patients treated | **2,200+** |
| ADHD evaluations & screenings | **1,000+** |
| Google rating | **4.8★** |
| Google reviews | **44** |
| Verified patient reviews | **600+** |

`design-system/trust-system.mjs` now imports these values so hero trust bars injected at build stay in sync.

---

## Audit findings (before alignment)

### Already aligned
- Homepage (`index.html`) trust summary + hero chips
- `trust-system.mjs` item definitions (after wiring to homepage metrics)
- Most pages only showed states / HIPAA / pricing — no volume claims

### Stale / mismatched (fixed)

| Page | Stale claim(s) | Aligned to |
|------|----------------|------------|
| `adhd-care.html` | 1,500+ adults; 4.7★; 450+ reviews; 750+ ADHD evals | 2,200+; 4.8★; 600+ reviews; 1,000+ ADHD evals/screenings |
| `weight-loss-metabolic-health.html` | 4.7★; 450+ reviews; 2,500+ metabolic evals | 4.8★; 600+ reviews; **2,200+ patients treated** (no invented metabolic-only count) |
| `adult-adhd-screening-california.html` | 750+ evals; 4.7★; 450+ reviews | 1,000+ evals/screenings; 4.8★; 600+ reviews |
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

---

## How to update figures next time

1. Edit `apps/siya-health/data/homepage-trust-metrics.mjs`
2. Update any hard-coded trust blocks on service/landing pages (search `4.7`, `450+`, `750+`, `1,500+`, `2,500+`)
3. Redeploy — `trust-system` injects follow the metrics file automatically
