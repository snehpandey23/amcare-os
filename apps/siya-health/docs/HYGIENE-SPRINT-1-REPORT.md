# Hygiene Cleanup Sprint 1 — Report

**Executed:** 2026-06-07  
**Build:** `npm run build` — **PASS**

---

## Summary

| Action | Result |
|--------|--------|
| Dev page removed from deploy | `visual-components.html` deleted + 301 to `/` |
| Stale `public/` mirrors | **68** HTML files removed; `.vercelignore` + redirects |
| Labs / prescriptions indexing | `noindex, follow`; excluded from sitemap |
| “Canonical starting point” copy | Replaced on **10** geo/funnel pages |
| Evidence snapshot placeholders | **99 → 7** flagged rows; **66** placeholder rows removed |
| Sitemap URLs | **148 → 145** (−3: labs, prescriptions, visual-components) |

**Out of scope (not touched):** pricing, providers, CTA counts, blog body content, internal link graph.

---

## 1. Remove `visual-components.html` from production

| Item | Detail |
|------|--------|
| **URL removed** | `/visual-components` |
| **File deleted** | `visual-components.html` |
| **Redirect** | `vercel.json` + `netlify.toml` → `/` (301) |
| **Sitemap** | Excluded via `SITEMAP_EXCLUDE` in `seo-build.mjs` |

---

## 2. Block stale `/public/` HTML mirrors

| Item | Detail |
|------|--------|
| **Mirrors removed** | **68** HTML files under `public/` (entire directory deleted) |
| **Deploy block** | `.vercelignore` — `public/` |
| **Redirects** | `/public`, `/public/:path*` → `/` (301) in `vercel.json` and `netlify.toml` |

Previously served stale membership, discovery-call, and geo copy per [PATIENT-FACING-HYGIENE-AUDIT.md](./PATIENT-FACING-HYGIENE-AUDIT.md).

---

## 3. Labs & prescriptions — hidden from indexing

**Approach:** Hide from indexing (not rewritten as full service pages).

| Page | URL | Change |
|------|-----|--------|
| Labs | `/labs` | `meta robots` → `noindex, follow` |
| Prescriptions | `/prescriptions` | `meta robots` → `noindex, follow` |

**Also:**
- Removed from `sitemap.xml` generation
- Fixed `seo-build.mjs` bug that had been **forcing `index, follow`** on these pages

**Note:** Footer/nav links to `/labs` and `/prescriptions` were **left unchanged** per sprint scope (no internal-link edits). Pages remain reachable but are not indexed; body still shows “Coming soon” for patients who navigate directly.

---

## 4. “Canonical starting point” → “main ADHD care page”

| Item | Detail |
|------|--------|
| **Source** | `scripts/site-chrome.mjs` — `buildAdhdFunnelBanner()` |
| **Pages updated** | 10 geo/funnel landers via `seo-build` + `applySiteChrome` |

**Updated copy:**  
`ADHD Care is our main ADHD care page for evaluation, screening, and treatment planning.`

**URLs:**
- `/adhd-diagnosis-austin`, `/adhd-diagnosis-florida`, `/adhd-diagnosis-houston`, `/adhd-diagnosis-pennsylvania`, `/adhd-diagnosis-philadelphia`, `/adhd-diagnosis-texas`
- `/adhd-treatment-online`, `/adult-adhd-diagnosis`, `/creyos-adhd-testing`, `/online-adhd-test`

---

## 5. Health Guide evidence rows

### Generator fixes (`scripts/answer-engagement-system.mjs`)

- Parse `—` / `()` / `PMID` / `FDA` / `ADA` patterns into distinct label + value
- **Skip** bare title-only lines (no citation detail)
- **Remove** fallback placeholder card (`Guideline-based care` / `See references below`)
- Empty snapshot when no substantiated rows (reference bullet list still renders)

### Audit (`scripts/audit-health-guide-evidence.mjs`)

Runs in build after answer regeneration; writes `data/health-guide-evidence-audit.json`.

| Metric | Before | After |
|--------|-------:|------:|
| Placeholder / duplicate snapshot rows | **99** | **7** |
| Guides with evidence snapshot card | 51 | **34** |
| Guides without snapshot (refs list only) | — | **23** |

### Remaining 7 flagged rows (thin value — needs seed enrichment)

| URL | Label | Value |
|-----|-------|-------|
| `/answers/adderall-vs-vyvanse-adults` | FDA prescribing information | medication guides |
| `/answers/high-shbg-low-free-testosterone` | AUA guideline on testosterone deficiency | reaffirmed 2024 |
| `/answers/high-shbg-low-free-testosterone` | Bhasin S et al. Testosterone therapy in men with | Endocrine Society |
| `/answers/is-adhd-medication-safe-long-term` | Long-term stimulant safety literature | population studies |
| `/answers/is-telehealth-legitimate` | State telehealth parity laws | varies by state |
| `/answers/semaglutide-weight-loss-how-it-works` | STEP trial program publications | semaglutide 2.4 mg |
| `/answers/signs-of-sleep-apnea-in-adults` | AASM OSA Screening Health Advisory | HEARTS mnemonic |

These use em-dash splits with short second segments; enrich `answer-seeds.mjs` evidence strings in a future sprint.

---

## Files changed

| File | Change |
|------|--------|
| `visual-components.html` | **Deleted** |
| `public/` (68 HTML) | **Deleted** |
| `.vercelignore` | **Created** — excludes `public/` |
| `vercel.json` | Redirects: `/visual-components`, `/public/*` |
| `netlify.toml` | Same redirects |
| `scripts/site-chrome.mjs` | ADHD funnel banner copy |
| `scripts/seo-build.mjs` | `SITEMAP_EXCLUDE`, `ensureNoindexUtilityPages` |
| `scripts/answer-engagement-system.mjs` | Evidence row parsing + no placeholder fallback |
| `scripts/audit-health-guide-evidence.mjs` | **New** — post-build evidence audit |
| `scripts/generate-website-inventory.mjs` | Dropped `/visual-components` from inventory |
| `package.json` | Build runs evidence audit before `seo-build` |
| `data/health-guide-evidence-audit.json` | **Generated** audit output |
| 10 geo/funnel `*.html` | Banner copy via build |
| 57 `answers/*.html` | Regenerated evidence sections |
| `labs.html`, `prescriptions.html` | `noindex` via build |
| `sitemap.xml` | 145 URLs |

---

## Build result

```
npm run build — exit 0
Evidence audit: 7 flagged rows; 23 guides without snapshot card
Wrote sitemap.xml with 145 URLs
Processed 147 HTML files for SEO tags
Cannibalization Phase 1: PASS
All deployment validations: PASS
```

---

## Remaining HIGH findings (from hygiene audit — not in sprint scope)

| ID | Issue | Status |
|----|-------|--------|
| H-1 | `visual-components.html` internal docs leak | **Resolved** (page removed) |
| H-2 / H-3 | Labs / prescriptions “Coming soon” indexed | **Mitigated** (`noindex`; body copy unchanged) |
| H-4–H-10 | Stale `public/` mirrors | **Resolved** (directory removed) |
| H-11 | Dr. Sneh “5,000+ patients” unverified stat | **Open** — providers out of scope |
| H-12 | “Physician assistant” vs “Physician Associate” on `/providers` | **Open** — providers out of scope |
| H-13 | “Canonical starting point” SEO jargon | **Resolved** |

### Recommended Sprint 2 (optional)

1. Rewrite `/labs` and `/prescriptions` as active service pages **or** remove footer links when services launch
2. Enrich 7 thin evidence seed strings in `answer-seeds.mjs`
3. Provider copy pass (H-11, H-12) when providers scope is allowed
4. Editorial meta-disclosure on 37 Health Guides (MEDIUM — hygiene audit M-2)
