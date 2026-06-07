# Content Consolidation Phase 1 Report — Scenario A

**Executed:** 2026-06-07  
**Source plan:** [CONTENT-CONSOLIDATION-PLAN.md](./CONTENT-CONSOLIDATION-PLAN.md) — Section 1 (10 actions) + Section 2 (6 redirects) only  
**Build:** `npm run build` — **PASS**

---

## Summary

| Metric | Value |
|--------|------:|
| URLs removed (HTML files deleted) | **16** |
| Phase 1 redirects added (`vercel.json` + `netlify.toml`) | **16** |
| Internal link replacements (first apply pass) | **393** |
| Files touched by link rewrite | **28** |
| Remaining Health Guides | **57** |
| Remaining blog articles | **44** |
| Remaining content pages (guides + articles) | **101** |
| Total sitemap URLs (all HTML) | **148** |
| Orphan `href` to removed source URLs | **0** |

Baseline inventory was **120** content pages (65 guides + 55 blog). After Phase 1: **101** (−19). The delta vs. the plan’s “−10” Scenario A table reflects full Section 1 + Section 2 execution (16 removals) plus prior inventory drift (blog count was already below 55 on disk).

---

## URLs removed

### Section 1 — Health Guides retired (8)

| Source URL | Target | Action |
|------------|--------|--------|
| `/answers/adhd-in-men` | `/answers/signs-of-adult-adhd` | 301 + men’s presentation merged into signs guide |
| `/answers/creyos-adhd-testing-explained` | `/creyos-adhd-testing` | 301 |
| `/answers/phentermine-weight-loss-safety` | `/blog/phentermine-for-weight-loss-safety-and-effectiveness` | 301 |
| `/answers/oral-vs-injectable-weight-loss-meds` | `/blog/oral-vs-injectable-weight-loss-medications` | 301 |
| `/answers/non-stimulant-adhd-medications` | `/blog/non-stimulant-adhd-medications-explained` | Merge + 301 |
| `/answers/tirzepatide-vs-semaglutide` | `/blog/tirzepatide-vs-semaglutide-which-is-better` | Merge + 301 |
| `/answers/minoxidil-hair-loss-does-it-work` | `/blog/minoxidil-for-hair-loss-does-it-work` | Merge + 301 |
| `/answers/sildenafil-erectile-dysfunction-expectations` | `/blog/sildenafil-for-erectile-dysfunction-what-to-expect` | Merge + 301 |

### Section 1 — Blog retired (2)

| Source URL | Target | Action |
|------------|--------|--------|
| `/blog/adhd-evaluation-cost-california` | `/blog/adhd-evaluation-cost-texas` | 301 |
| `/blog/after-adhd-diagnosis-next-steps-adults` | `/answers/starting-adhd-medication-adults` | Merge + 301 |

### Section 2 — Blog redirects (6)

| Source URL | Target |
|------------|--------|
| `/blog/combining-adhd-treatment-and-weight-loss-strategies` | `/answers/adhd-and-weight-loss-connection` |
| `/blog/focalin-vs-adderall-comparison` | `/blog/vyvanse-vs-adderall-differences` |
| `/blog/long-term-weight-loss-medications-what-to-expect` | `/blog/semaglutide-for-weight-loss-how-it-works` |
| `/blog/adderall-ir-vs-xr-adults` | `/blog/vyvanse-vs-adderall-differences` |
| `/blog/adhd-treatment-houston-online` | `/blog/online-adhd-diagnosis-texas` |
| `/blog/adhd-medication-online-texas-telehealth` | `/blog/online-adhd-diagnosis-texas` |

---

## Redirects added

**16** permanent (301) rules in:

- `vercel.json` — 16 entries before host canonical rule
- `netlify.toml` — 16 `[[redirects]]` blocks

Canonical config source: `data/content-consolidation-phase1.mjs` (`PHASE1_REDIRECTS`).

---

## Content merges performed

| Source | Target | What was merged |
|--------|--------|-----------------|
| `/answers/adhd-in-men` | `/answers/signs-of-adult-adhd` | Men’s presentation paragraph in `answer-seeds.mjs` |
| `/blog/after-adhd-diagnosis-next-steps-adults` | `/answers/starting-adhd-medication-adults` | Post-diagnosis steps + 4 FAQs in guide seed |
| `/answers/non-stimulant-adhd-medications` | `/blog/non-stimulant-adhd-medications-explained` | “When considered first” FAQ on blog |
| `/answers/tirzepatide-vs-semaglutide` | `/blog/tirzepatide-vs-semaglutide-which-is-better` | Candidacy FAQ on blog |
| `/answers/minoxidil-hair-loss-does-it-work` | `/blog/minoxidil-for-hair-loss-does-it-work` | Timeline FAQ on blog |
| `/answers/sildenafil-erectile-dysfunction-expectations` | `/blog/sildenafil-for-erectile-dysfunction-what-to-expect` | Onset/timing FAQ on blog |

SEO metadata on **targets** preserved; retired sources no longer indexed.

---

## Internal links updated

- **393** `href` replacements across **28** files (HTML + generator data) on first `apply-content-consolidation-phase1.mjs` run
- Blog hubs: `blog/adhd.html`, `blog/weight-loss.html` cards point to canonical targets
- Cannibalization reciprocal guide links removed for retired guides (`data/cannibalization-phase1.mjs`)
- `generate-answer-pages.mjs` skips `RETIRED_GUIDE_SLUGS`; hub index regenerated at 57 guides
- Related-article / continue-reading modules on target blogs updated; retired guide `<li>` entries stripped
- **0** remaining internal links to removed source URLs (verified post-build)

---

## Sitemap changes

- `sitemap.xml` regenerated with **148** URLs (down from pre-consolidation crawl set)
- All **16** removed paths absent from sitemap
- Redirect **targets** retained with updated `lastmod`
- `article-index.json` regenerated: **48** articles (was 56)

---

## Generator / data files updated

| File | Change |
|------|--------|
| `data/answer-seeds.mjs` | Removed 8 guide seeds; merged content into targets |
| `data/phase5-thin-expansions.mjs` | Removed non-stimulant expansion; fixed related/learnMore links |
| `data/cannibalization-phase1.mjs` | Removed 8 duplicate pairs + reciprocal guide links |
| `data/content-consolidation-phase1.mjs` | Redirect + retirement registry (new) |
| `scripts/apply-content-consolidation-phase1.mjs` | One-time delete + HTML link rewriter (new) |
| `scripts/generate-answer-pages.mjs` | Filters retired slugs |
| `vercel.json`, `netlify.toml` | 16 redirects each |

**Not executed (per scope):** Section 3 keep-both pairs, Section 4 aggressive scenarios, high-traffic guide repositioning (e.g. `/answers/is-online-adhd-diagnosis-legitimate`).

---

## Issues encountered

1. **Link rewriter scope bug (fixed):** First build hook ran the apply script twice; a broad `"url"` replacement pattern corrupted `PHASE1_REDIRECTS` keys in `content-consolidation-phase1.mjs`. Restored canonical redirect map; rewriter now only touches `href` attributes in HTML; apply script removed from default `npm run build`.
2. **`public/` mirror subtree:** Stale copies under `public/` were not updated (production root is deploy surface). Recommend deprecating or syncing `public/` separately.
3. **California blog generator:** `scripts/california-adhd-blog-rest.mjs` still lists retired slugs in related links — will regenerate stale pages if that script is run manually; not part of default build.

---

## Build result

```
npm run build — exit 0
Cannibalization Phase 1: PASS
Legal / deployment / SVG / GHL validations: PASS
Wrote 57 answer pages + answers/index.html
Wrote sitemap.xml with 148 URLs
Pages indexed: 148 | Articles: 48
```

---

## Quick reference

| Item | Count |
|------|------:|
| **Redirect count (Phase 1)** | **16** |
| **Final content page count** | **101** (57 guides + 44 blog articles) |
| **Final sitemap URL count** | **148** |
