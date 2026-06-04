# Health Guides Production Fix Report

**Generated:** 2026-06-04

## Goal

User-facing: **Health Guides** · URL: **/answers** (unchanged)

## Files changed (normalizeSitewideCopy)

- Strengthened `scripts/site-chrome.mjs` (`normalizeSitewideCopy`): nav/footer `Answers` → Health Guides, breadcrumb JSON, Browse Answers, Answers Hub, etc.
- Full rebuild reapplied chrome across **147** HTML files.

## User-facing pattern scan (after normalize + build)

| Pattern | File count |
|---------|----------:|
| `>Answers</a>` | **0** |
| Clinical Answers | **0** |
| Browse clinical answers | **0** |
| Browse Answers | **0** |
| Answers Hub | **0** |
| breadcrumb `"Answers"` | **0** |

**Total HTML files scanned:** 147

## Hub & homepage verification

| Page | Nav Health Guides | Footer Health Guides | H1 |
|------|-----------------|----------------------|-----|
| `answers/index.html` | ✓ | ✓ | ✓ Health Guides |
| `index.html` | ✓ | ✓ | — |

## Build result

```
npm run build — success
- 58 answer pages regenerated
- 147 pages in internal-link-audit
- 147 sitemap URLs
- 0 broken internal links (audit)
- 0 JSON-LD errors (phase2-qa)
```

## Sitemap

**147** URLs in `sitemap.xml`

## Remaining technical "answers" (OK — not user-facing labels)

- URL paths: `/answers`, `/answers/{slug}`
- Directory: `answers/`
- Code: `ANSWER_SEEDS`, `generate-answer-pages.mjs`
- Meta prose: "short answers, evidence" in descriptions

## Acceptable marketing "Answers" (not hub labels)

- `about.html` — "Answers about ADHD"
- `blog/adhd-symptoms-overlooked.html` — "Answers without the wait"

## Categorization

| Cat | Rule |
|-----|------|
| A | Nav/footer/H1/CTAs → **Health Guides** |
| B | `/answers` URLs — keep |
| C | Code identifiers — keep |
| D | Audit `*.md` archives — keep |
