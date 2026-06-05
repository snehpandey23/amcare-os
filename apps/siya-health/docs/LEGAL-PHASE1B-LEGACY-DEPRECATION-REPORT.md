# Legal Phase 1B — Legacy Legal Page Deprecation Report

Generated: 2026-06-05  
Prerequisite: Phase 1 sitewide link hardening complete (`docs/LEGAL-PHASE1-LINK-HARDENING-REPORT.md`)

## Executive summary

Legacy root legal pages `privacy-policy.html` and `terms.html` are deprecated without deletion. They are excluded from the sitemap and duplicate-title/H1 audits; marked `noindex, nofollow`; canonicalized to `/legal/*`; and given unique redirect titles. **`npm run build` now passes end-to-end.**

---

## Duplicate title / H1 metrics

| Metric | Before Phase 1B | After Phase 1B |
|--------|----------------:|---------------:|
| Duplicate title tag groups | **1** (`Privacy Policy \| Siya Health` — `privacy-policy.html` + `legal/privacy-policy/index.html`) | **0** |
| Duplicate H1 groups | **1** (`Privacy Policy` — same pair) | **0** |
| `seo-build` duplicate-title warning | **1 group** | **0** |
| Cannibalization final overall | **REVIEW** | **PASS** |

---

## Legacy pages handled

| File | Production redirect (vercel.json) | Sitemap | Robots | Canonical | Title | H1 |
|------|-----------------------------------|:-------:|--------|-----------|-------|-----|
| `privacy-policy.html` | `/privacy-policy` → `/legal/privacy-policy` | **Excluded** | `noindex, nofollow` | `https://siya.health/legal/privacy-policy` | Privacy Policy Redirect \| Siya Health | Privacy Policy has moved |
| `terms.html` | `/terms` → `/legal/terms-of-use` | **Excluded** | `noindex, nofollow` | `https://siya.health/legal/terms-of-use` | Terms of Use Redirect \| Siya Health | Terms of Use has moved |

Both pages retain on-disk HTML for local builds and include an inline redirect notice linking to the canonical `/legal/*` URL. **Lawyer-authored content was not rewritten** — only SEO deprecation metadata and a short redirect notice were applied via `seo-build`.

---

## Implementation

| File | Change |
|------|--------|
| `data/site-standards.mjs` | Added `LEGACY_LEGAL_PAGE_META` + `isLegacyLegalPage()` |
| `scripts/seo-build.mjs` | `applyLegacyLegalDeprecation()`; exclude legacy pages from sitemap + duplicate-title scan; sync OG tags on legacy pages |
| `scripts/cannibalization-phase1-final.mjs` | Skip legacy pages in duplicate title/H1 audit |

**Canonical source of truth:** `/legal/privacy-policy`, `/legal/terms-of-use` (and all other `/legal/*` registry pages).

---

## Build & QA results

| Check | Result |
|-------|--------|
| `npm run build` | **PASS** (exit 0) |
| `validate-legal-links.mjs` | **PASS** (167 HTML files) |
| Sitemap URLs | **165** (was 167; legacy root pages removed) |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |
| Cannibalization Phase 1 final | **PASS** |

---

## Constraints honored

- No lawyer-authored legal content rewritten
- No legal registry documents marked `published`
- No GHL clickwrap implementation
- No cookie banner implementation
- Legacy files not deleted (`vercel.json` redirects preserved)
- No deployment performed

---

## Verdict

| Question | Answer |
|----------|--------|
| **Safe to commit Phase 1B changes?** | **Yes** — build passes; legacy pages safely deprecated; `/legal/*` remains canonical. |
| **Safe to deploy to production?** | **No** — `/legal/*` pages are still counsel stubs. Deprecation reduces duplicate-content risk but does not satisfy compliance deploy gates (final legal text, clickwrap, cookie policy). |

---

## Recommended next steps

1. Counsel publishes final markdown → flip registry `status` to `published`.
2. Phase 2+: optionally replace legacy HTML files with minimal static redirect stubs or remove after redirect soak period.
3. Phase 3: GHL clickwrap + screening consent bridge.
