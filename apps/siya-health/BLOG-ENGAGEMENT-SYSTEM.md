# Blog Engagement & SEO System

Reusable, physician-credible engagement blocks for long-form Siya Health education content.

## Goals

- Increase time on page and readability
- Strengthen internal linking and topical authority
- Support organic visibility without keyword stuffing or sensational claims

## Components

| # | Component | CSS modifier | Use when |
|---|-----------|--------------|----------|
| 1 | Key Takeaway Box | `blog-engage--takeaway` | After intro / hub links — 3–4 bullets |
| 2 | Evidence Snapshot | `blog-engage--evidence` | Trial or guideline anchors |
| 3 | Myth vs Reality | `blog-engage--myth` | 2–4 misconception pairs |
| 4 | Reddit Reality | `blog-engage--reddit` | Paraphrased patient themes (not quotes as medical advice) |
| 5 | Clinical Pearl | `blog-engage--pearl` | One actionable clinician-style tip |
| 6 | Mini Infographic | `blog-engage--infographic` | 2–3 stat tiles |
| 7 | Symptom Flowchart | `blog-engage--flowchart` | Ordered differential steps |
| 8 | Decision Tree | `blog-engage--decision` | When to seek care / labs |

All components share `.blog-engage` base styles in `styles.css` (Siya primary `#1e3a8a`, accent `#0ea5a4`).

## Authoring

### Option A — JavaScript builders

```js
import { keyTakeaway, evidenceSnapshot } from './scripts/blog-engagement-components.mjs';

const html = keyTakeaway({
  items: ['Point one with <strong>emphasis</strong>.', 'Point two.'],
});
```

### Option B — Cornerstone bundles

Pre-built copy for metabolic cornerstones lives in `CORNERSTONE_ENGAGEMENT` inside `blog-engagement-components.mjs`.

Apply to HTML:

```bash
node scripts/apply-cornerstone-engagement.mjs
```

### Option C — Manual HTML

Copy any block from an updated cornerstone article; keep `role="note"` / `aria-label` on asides.

## Cornerstone articles (engagement applied)

1. [Food Noise and GLP-1](/blog/food-noise-and-glp-1-what-it-means-and-what-helps)
2. [Insulin Resistance and Weight Loss](/blog/insulin-resistance-and-weight-loss-clinician-overview)
3. [Why Am I Always Tired?](/blog/why-am-i-always-tired-causes-when-to-see-doctor)
4. [Free Testosterone vs Total Testosterone](/blog/free-testosterone-vs-total-testosterone-what-patients-should-know)

## SEO reports

| Report | Command output |
|--------|----------------|
| `KEYWORD-MAP.md` | Keyword → URL mapping |
| `CONTENT-GAP-REPORT.md` | Covered / partial / gap |
| `ARTICLE-ENHANCEMENT-REPORT.md` | Per-article H2/FAQ/link recommendations |
| `SEO-ENGAGEMENT-OPTIMIZATION-REPORT.md` | Before/after + 90-day roadmap |

Regenerate:

```bash
node scripts/generate-seo-engagement-reports.mjs
```

Keyword data: `data/keyword-universe.mjs`

## Clinical governance

- Keep **Pending physician review** banner until `CLINICAL_REVIEW_APPROVED` in registry
- Reddit boxes are **paraphrased themes**, not treatment advice
- Evidence snapshots must cite real sources (trial name, year, journal)
- Reject SEO-only H2s listed in `ARTICLE-ENHANCEMENT-REPORT.md`

## Extending to new posts

1. Add entry to `CORNERSTONE_ENGAGEMENT` (or use builder functions inline)
2. Add markers to `INSERT_AFTER` in `apply-cornerstone-engagement.mjs`
3. Run apply script + `generate-seo-engagement-reports.mjs`
4. Run `npm run build` before deploy
