# Weight Loss Page — Founder Audit Sprint 1 Report

**Scope:** Hero + patient recognition block only  
**Page:** `/weight-loss-metabolic-health`  
**Date:** June 2026

---

## Strategic shift

| Before | After |
|--------|-------|
| Medication-first headline (GLP-1, semaglutide, etc.) | Metabolic health & weight management framing |
| GLP-1 sales page tone | Physician-led, whole-person, recognition-first |
| Sparse hero | ADHD-style structure: headline → copy → quote → CTA → trust chips |

---

## Headline options (5)

| # | Headline | Notes |
|---|----------|-------|
| **A** | Why does weight feel so much harder than it should? | Empathy-first question; strong patient recognition |
| **B** | When your appetite, energy, and weight stop making sense | **Implemented** — names core struggles without jargon |
| **C** | Weight gain is often a symptom. Not the whole story. | Clinical credibility; slightly more abstract |
| **D** | You&rsquo;re not failing. Your metabolism may need a closer look. | Non-judgmental; avoids blame |
| **E** | Cravings, fatigue, and weight that won&rsquo;t budge—there&rsquo;s usually more to the story | Long-form; good for SEO intent |

**Recommendation:** Option **B** for hero (implemented). Option **A** works well as A/B test or paid landing variant.

---

## Implemented hero copy

**H1:** When your appetite, energy, and weight stop making sense

**Primary lead:** Physician-led metabolic health and weight management—not a medication menu.

**Supporting:** Board-certified clinicians help adults understand what may be driving weight gain, cravings, and low energy. We review nutrition, movement, sleep, stress, and eating patterns—with medication considered only when clinically appropriate.

**Bullets:**
- Whole-person evaluation—not just a prescription conversation
- Support for food noise, emotional eating, and regain cycles
- HIPAA-compliant telehealth with ongoing follow-up

**Testimonial:** “For the first time, someone helped me understand why I was struggling in the first place.” — Verified weight management patient

**CTA:** Talk to a Clinician (unchanged booking destination)

**Trust bar:** Same stats (5,000+ patients, etc.) with chip-style presentation

---

## Patient recognition section

**Title:** Does any of this sound familiar?

| Card | Copy |
|------|------|
| The weight comes back | Regain after diets and programs |
| Food is always on your mind | Cravings / food noise |
| Motivation fades quickly | Momentum loss after weeks |
| Energy crashes | Afternoon fatigue |
| Stress drives eating | Emotional eating |
| Something else may be involved | Hormones, sleep, ADHD, insulin, metabolism |

Disclaimer: “Common experiences… not a diagnosis.”

---

## Files modified

| File | Changes |
|------|---------|
| `weight-loss-metabolic-health.html` | Hero rewrite, recognition grid, fade-in script |
| `styles.css` | Weight hero, trust chips, recognition spacing |
| `scripts/capture-weight-loss-sprint1-screenshots.mjs` | Screenshot utility |

**Not modified:** GLP-1 journey, program overview, pricing, providers, FAQ, footer, meta/SEO tags (Sprint 2).

---

## Screenshots

`docs/weight-loss-sprint1-screenshots/`

- `hero-desktop-1440.png`
- `hero-mobile-390.png`
- `recognition-desktop-1440.png`
- `recognition-mobile-390.png`
- `hero-first-fold-1440.png`

Re-capture: `npx serve -l 8877 .` → `node scripts/capture-weight-loss-sprint1-screenshots.mjs`

---

## Compliance notes

- No weight-loss amount promises
- No medication access guarantees
- “When clinically appropriate” retained
- Testimonial is understanding-focused, not outcome-focused
- Recognition cards explicitly not diagnostic

---

## Validation

```
npm run build — PASS (run after commit)
```

---

## Sprint 2 opportunities (not in scope)

- Meta title/description de-medication
- Program overview / “Who This Program Is For” alignment
- GLP-1 journey section copy
- Trust stats band (separate from hero chips)
