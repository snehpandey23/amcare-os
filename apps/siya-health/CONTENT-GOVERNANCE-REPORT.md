# Content Governance Report

Generated: 2026-06-04T00:55:15.417Z

## Executive summary

A **clinical review status system** now governs all blog articles and answer pages. Content defaults to **`PENDING_REVIEW`** until explicitly allowlisted in `data/content-review-registry.mjs` as **`CLINICALLY_REVIEWED`**.

| Layer | Implementation |
|-------|----------------|
| Registry | `data/content-review-registry.mjs` |
| Blog apply | `applyBlogReviewStatus()` in `seo-build.mjs` |
| Answer apply | `generate-answer-pages.mjs` + `applyAnswerReviewStatus()` in `seo-build.mjs` |
| UI block | `clinicalReviewBlock()` in `clinical-entity.mjs` |
| Nav label | **Health Guides** → `/answers` (URL unchanged) |

---

## 1. Pre-change audit (claims on site)

Before this change, educational pages displayed physician review without a formal allowlist:

| Content type | Pages with "Medically reviewed" / `reviewedBy` schema | Issue |
|--------------|--------------------------------------------------------:|-------|
| Blog articles | ~59 | Auto `pickReviewer()` by keyword |
| Answer pages | ~56 | Every seed used `reviewerSlug` + schema `reviewedBy` |

**Physician names appearing in review claims (historical):**

- Dr. Sneh Pandey — default fallback reviewer
- Dr. Natasha Desai — symptom / mental-health keyword routing
- Dr. Swati Desai — medication / GLP-1 keyword routing

These assignments were **editorial automation**, not documented sign-off.

---

## 2. Review status system

### Status values

| Status | User-facing display | Schema |
|--------|---------------------|--------|
| `PENDING_REVIEW` (default) | **Clinical Review Status** — Pending physician review. This educational content is awaiting final physician review. | No `reviewedBy` on BlogPosting / MedicalWebPage |
| `CLINICALLY_REVIEWED` | **Clinically Reviewed** — Reviewed by: [Physician] · Review date: [Date] | `reviewedBy` Physician entity included |

### How to approve content

Add an entry to `CLINICAL_REVIEW_APPROVED` in `data/content-review-registry.mjs`:

```javascript
blogs: {
  'your-blog-slug': { reviewerSlug: 'dr-sneh-pandey', reviewDate: '2026-06-15' },
},
answers: {
  'your-answer-slug': { reviewerSlug: 'dr-natasha-desai', reviewDate: '2026-06-15' },
},
```

Then run: `node scripts/generate-answer-pages.mjs && node scripts/seo-build.mjs`

---

## 3. Post-build audit (current)

| Metric | Blog articles | Answer pages |
|--------|:-------------:|:------------:|
| Total scanned | 54 | 56 |
| `PENDING_REVIEW` (pending block) | 54 | 56 |
| `CLINICALLY_REVIEWED` (reviewed block) | 0 | 0 |
| Stale "Medically reviewed" without reviewed block | 0 | 0 |
| Allowlisted in registry | 0 | 0 |
| JSON-LD with `reviewedBy` | — | — |

**Site-wide pages with `reviewedBy` in schema:** 0 (should equal clinically reviewed count only)

**Nav still showing "Answers" (not Health Guides):** 0 HTML files

---

## 4. Navigation wording

### Options evaluated

| Label | Pros | Cons | Fit for Siya |
|-------|------|------|:------------:|
| **Answers** (legacy) | Short, FAQ-like | Implies certainty; weak for unreviewed content | ★★ |
| **Health Library** | Authoritative | Sounds static/archival; less action-oriented | ★★★ |
| **Health Guides** | Physician-led, educational, pairs with "review status" | Slightly longer in nav | ★★★★★ |
| **Learn** | Minimal | Vague; not medical | ★★ |
| **Conditions & Symptoms** | SEO-descriptive | Narrow; excludes GLP-1, telehealth, labs topics | ★★ |

### Recommendation: **Health Guides**

Best match for a **physician-led virtual care** brand: signals curated education, allows pending review states, and avoids overpromising clinical certainty like "Answers."

### Implementation (this release)

- Primary nav + footer: **Health Guides** → `/answers`
- Answer hub H1: **Health guides**
- Breadcrumbs / schema: **Health Guides**
- URL `/answers` unchanged (preserve backlinks and sitemap)

### Optional phase 2

- 301 `/answers` → `/health-guides` after Search Console mapping
- Update `llms.txt` / indexes to say "health guides"

---

## 5. Cornerstone cluster (review status)

| Page | Status (default) |
|------|------------------|
| Food Noise & GLP-1 | PENDING_REVIEW |
| Insulin Resistance overview | PENDING_REVIEW |
| Why Am I Always Tired? | PENDING_REVIEW |
| Free vs Total Testosterone | PENDING_REVIEW |

Add to registry when physician sign-off is complete.

---

## 6. Files changed (governance release)

| File | Role |
|------|------|
| `data/content-review-registry.mjs` | Allowlist + status constants |
| `scripts/clinical-entity.mjs` | Review blocks + schema sync |
| `scripts/seo-build.mjs` | Apply status on blogs/answers |
| `scripts/generate-answer-pages.mjs` | Governed answer generation |
| `scripts/site-chrome.mjs` | Health Guides nav |
| `styles.css` | Pending vs reviewed styles |
| `scripts/content-governance-report.mjs` | This report |

---

## 7. Build order

```bash
node scripts/generate-answer-pages.mjs
node scripts/internal-link-audit.mjs
node scripts/seo-build.mjs
node scripts/content-governance-report.mjs
```

---

## 8. Remaining actions

1. Physician review queue: prioritize cornerstone metabolic/fatigue/hormone cluster, then high-traffic ADHD/GLP-1 URLs.
2. After each sign-off, add slug to `CLINICAL_REVIEW_APPROVED` and rebuild.
3. Quarterly audit: re-run `content-governance-report.mjs` and confirm `falseClaims` = 0.
4. Consider CMS field `reviewStatus` if moving off static HTML generation.
