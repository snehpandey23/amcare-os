# Phase 2 Implementation Report

**Generated:** 2026-06-04  
**Scope:** Existing assets only — no new articles or answer pages.

## Pages modified

| Page | Changes |
|------|---------|
| `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Full engagement bundle, conversion L1–L5, snippets, deferred chat, clinical-review dedupe |
| `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | L1–L5 conversion, service card, snippets, cta-band → metabolic service |
| `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | L1–L5 conversion, snippets, cta-band standardized |
| `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | L1–L5 conversion, fatigue snippet table + lists |
| `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | L1–L5 conversion, T-fraction table + SHBG list |
| `weight-loss-metabolic-health.html` | Cornerstone article cards + Related Health Guides |
| `mens-health-longevity.html` | Cornerstone article cards + Related Health Guides |
| `telehealth.html` | Cornerstone article cards + Related Health Guides |
| `styles.css` | Service cards, snippet tables, health-guide blocks, cornerstone grid |
| `scripts/blog-engagement-components.mjs` | Sleep engagement + conversion helpers |
| `scripts/apply-cornerstone-engagement.mjs` | Sleep markers + unique snippet detection |
| `scripts/apply-phase2-optimization.mjs` | Phase 2 runner |
| `package.json` | `npm run phase2:apply` |

---

## Priority 1 — Sleep Apnea

| Item | Status |
|------|--------|
| Key takeaway | ✓ |
| Evidence snapshot | ✓ |
| Myth vs reality | ✓ |
| Clinical pearl | ✓ |
| Symptom flowchart | ✓ |
| Decision tree | ✓ (fixed insert; was blocked by flowchart prefix collision) |
| Duplicate clinical-review removed | ✓ (5 → 1) |
| Mid-article CTA (Meet & Greet + Explore care options) | ✓ |
| Metabolic service card + telehealth link | ✓ |
| Deferred chat widget | ✓ |

---

## Priority 2 — Insulin Resistance

| Item | Status |
|------|--------|
| Mid-article `cta-block` after decision tree | ✓ |
| `weight-loss-metabolic-health` service card | ✓ |
| CTA hierarchy aligned with Food Noise | ✓ |
| cta-band secondary → Explore care options (not answer-only) | ✓ |

---

## Priority 3 — Featured snippet optimization

| Article | Snippets implemented |
|---------|---------------------|
| Food Noise | Definition box, hunger/noise table, FAQ ordered list, fast-relief FAQ lead |
| Insulin | IR definition, normal A1C callout, weight-loss mechanism list, HOMA-IR caveat |
| Fatigue | Direct lead answer, fatigue vs sleepiness table, numbered causes, when-to-seek lead |
| Free T | Fraction table, free T definition, SHBG-high lead, SHBG symptom list |
| Sleep Apnea | Symptom ordered list, fatigue/weight/IR paragraph leads, CPAP FAQ bold lead |

---

## Priority 4 — Service page deep linking

| Service page | Cornerstone cards | Related Health Guides |
|--------------|-------------------|------------------------|
| `/weight-loss-metabolic-health` | Food noise, Insulin, Sleep apnea | 4 metabolic answers |
| `/mens-health-longevity` | Free T, Sleep apnea | 4 hormone/sleep answers |
| `/telehealth` | Fatigue, Sleep apnea, Insulin | 4 fatigue/sleep answers |

---

## Priority 5 — Conversion consistency (L1–L5)

| Layer | All 5 cornerstones |
|-------|-------------------|
| L1 Contextual service link | ✓ |
| L2 Mid-article CTA block | ✓ |
| L3 Service card | ✓ |
| L4 Related Health Guides | ✓ |
| L5 Final cta-band (Explore care options) | ✓ |

**Conversion parity achieved.**

---

## Engagement blocks added (sleep apnea)

| Block | Present |
|-------|---------|
| Key takeaway | ✓ |
| Evidence snapshot | ✓ |
| Symptom flowchart | ✓ |
| Myth vs reality | ✓ |
| Clinical pearl | ✓ |
| Decision tree | ✓ |

---

## Regenerate

```bash
cd apps/siya-health
npm run engagement:apply   # engagement only
npm run phase2:apply       # full Phase 2 (engagement + conversion + snippets + service hubs)
```

**Note:** Re-running `phase2:apply` is idempotent for most layers (`data-phase2` guards). Re-run engagement after editing markers in `apply-cornerstone-engagement.mjs`.
