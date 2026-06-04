# Blog consistency cleanup — final report

Generated: 2026-06-04

## QA gate: PASS

All automated checks passed after `npm run blog:consistency:apply` and `npm run build`.

| Check | Result |
|-------|--------|
| Sitemap URLs | **147** |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |
| Blog articles audited | **55** |
| 1 `clinical-review` block per article | **55/55** |
| 1 H1 per article | **55/55** |
| 1 `<div class="cta-band">` per article | **55/55** |
| Related Health Guides (3 links) | **55/55** |
| Continue reading | **55/55** |
| Screenshot DOM QA (5 sample pages × 2 viewports) | **PASS** |

## What changed

### Part 1 — CTA band

- Standardized **one** final exit `cta-band` on every blog article (`blog-final-cta` section).
- Unified copy: *Not sure where to start?* + Meet & Greet body; ADHD blogs use **Book ADHD Evaluation** / **Start Free Screening**.
- Removed **29** redundant `blog-provider-cta` sections (duplicate conversion blocks).
- Added `blog-cta--mid` to in-article `cta-block` elements (cornerstones already had mid CTAs).
- **Note:** Earlier audits flagged “2 cta-band” because the substring `cta-band-buttons` matched twice—not because there were two band containers.

### Part 2 — Related Health Guides

- Added or normalized **Related Health Guides** on all **55** articles (3 links each, topic-based pools).
- Placed before **Continue reading** when present, otherwise before the final CTA section.

### Scripts

- `scripts/apply-blog-consistency.mjs` — apply + reports
- `scripts/capture-blog-consistency-screenshots.mjs` — visual QA
- `scripts/blog-engagement-components.mjs` — `finalCtaBandSection()`, `relatedHealthGuides()` capped at 3

### Reports

- `CTA-BAND-DEDUPLICATION-REPORT.md`
- `RELATED-HEALTH-GUIDES-REPORT.md`
- `BLOG-CONSISTENCY-FINAL-QA.md`
- `BLOG-CONSISTENCY-SCREENSHOT-QA.md`
- Screenshots: `docs/visual-audit-screenshots/blog-consistency/`

## Remaining issues (non-blocking)

- Legacy mid-article button copy on some ADHD posts (e.g. “Book Your Free 15-Minute ADHD Consultation”) — not a duplicate band; optional copy pass later.
- Prose microcopy “Answers without the wait” is intentional wordplay, not hub labeling.
- `blog/index.html` hub still has its own marketing `cta-band` (category page, out of article scope).

## Safe to commit?

**Yes.** QA gate passed; no new medical content was added.

Suggested commit message:

```
fix: dedupe blog CTA bands and add related health guides
```

Suggested commands:

```bash
cd apps/siya-health
npm run blog:consistency:apply
npm run build
npm run blog:consistency:screenshots   # local server :8877
git add apps/siya-health
```

## Commit recommendation

Commit **only** `apps/siya-health/` on branch `seo-repositioning-metabolic-foundation` (or merge to `main` after review). Do not include unrelated monorepo changes.
