# Legal Phase 1 — Sitewide Link Hardening Report

Generated: 2026-06-05  
Source of truth: `docs/LEGAL-ARCHITECTURE-HARDENING-PLAN.md` §8B–9

## Executive summary

Phase 1 engineering is **complete**. All sitewide legal footer links now resolve through `LEGAL_LINKS` / `data/legal-documents.mjs`. Legacy `/terms` and `/privacy-policy` hrefs are eliminated from generated HTML. False Notice of Privacy Practices (NPP) links are fixed. Provider license disclaimers are injected on all provider surfaces; out-of-footprint license states (e.g. Ohio on Derek Timbs) are visually distinguished.

**Legal link validation passes.** Full `npm run build` still exits non-zero due to a **pre-existing** cannibalization duplicate-title check (`privacy-policy.html` + `legal/privacy-policy/index.html`), unrelated to this phase.

---

## Link metrics (before → after)

| Metric | Before (pre-Phase 1 audit) | After (post-build) |
|--------|---------------------------:|-------------------:|
| Files with `href="/terms"` | **89** | **0** |
| Files with `href="/privacy-policy"` | **95** | **0** |
| False NPP links (NPP label → privacy URL) | **17** | **0** |
| Pages with registry `/legal/*` footer quartet | Partial / inconsistent | **167** (all footered pages) |

*Before counts measured on working tree immediately prior to Phase 1 `seo-build`; aligns with hardening plan baseline (~93 combined legacy legal hrefs, 17 false NPP).*

---

## Implementation delivered

### 1. Site-chrome legal footer (`scripts/site-chrome.mjs`)

- Added `renderLegalFooter()` using `LEGAL_LINKS`.
- `injectFooterChrome()` replaces every `<h4>Legal</h4>` block with standardized links:
  - Legal & Compliance → `/legal`
  - Terms of Use → `/legal/terms-of-use`
  - Privacy Policy → `/legal/privacy-policy`
  - Notice of Privacy Practices → `/legal/notice-of-privacy-practices`
- Expanded `normalizeLegalLinks()`:
  - `/terms` → `/legal/terms-of-use`
  - `/privacy-policy` → `/legal/privacy-policy`
  - Legacy `adhd.siya.health` legal URLs → registry targets
  - False NPP in link-cards (`about.html` and similar)
  - Label normalization: Terms & Conditions / Terms of Service → Terms of Use

### 2. Provider license disclaimer (`scripts/generate-provider-pages.mjs`)

| Surface | Disclaimer | License-only styling |
|---------|:----------:|:--------------------:|
| `providers/dr-sneh-pandey.html` | ✓ | — |
| `providers/dr-natasha-desai.html` | ✓ | — |
| `providers/dr-swati-pandey.html` | ✓ | — |
| `providers/dr-vanessa-urbina.html` | ✓ | — |
| `providers/megan-wunderlich.html` | ✓ | — |
| `providers/derek-timbs.html` | ✓ | OH chip dashed (`--license-only`) |
| `providers/wendy-delgado.html` | ✓ | — |
| `providers/index.html` (hub + 7 cards) | ✓ | Derek card OH styled |

- Hub state filter chips: **CA, TX, PA, FL only** (OH removed — not organizational service footprint).
- Hub meta description uses `STATES_INLINE` (no Ohio service implication).

### 3. Build pipeline (`package.json`)

```
generate-legal-pages → generate-answer-pages → … → generate-provider-pages → … → seo-build → validate-legal-links → …
```

### 4. Legal link validator (`scripts/validate-legal-links.mjs`)

Fails the build step on:

- Missing `/legal/*` generated pages
- `LEGAL_LINKS.noticeOfPrivacy === LEGAL_LINKS.privacy`
- False NPP anchors (same-element detection)
- Legacy `href="/terms"` or `href="/privacy-policy"` outside `legal/` stubs
- Missing standard legal footer links on pages with `<footer>` + Legal column

**Result:** `OK — all legal link checks passed.` (167 HTML files scanned)

### 5. CSS (`styles.css`)

- `.provider-state-chip--license-only` — dashed border, muted styling
- `.provider-license-disclaimer` — helper copy under chips

---

## `/legal` pages generated

| Path | Status |
|------|--------|
| `/legal` | stub (hub) |
| `/legal/terms-of-use` | stub |
| `/legal/privacy-policy` | stub |
| `/legal/notice-of-privacy-practices` | stub |
| `/legal/telehealth-consent` | stub |
| `/legal/cookie-policy` | stub |
| `/legal/controlled-substance-policy` | stub |
| `/legal/prescription-policy` | stub |

**Total:** 8 pages. Lawyer-authored content **not** rewritten; registry documents remain non-published stubs.

---

## Build & QA results

| Check | Result |
|-------|--------|
| `validate-legal-links.mjs` | **PASS** |
| `seo-deployment-qa-report.mjs` — broken internal links | **0** |
| `seo-deployment-qa-report.mjs` — JSON-LD parse errors | **0** |
| `npm run build` (full pipeline) | **FAIL** (exit 1) — cannibalization Phase 1 `REVIEW`: 1 duplicate title group (`Privacy Policy \| Siya Health` — legacy `privacy-policy.html` + `legal/privacy-policy/index.html`) |

`vercel.json` 301 redirects for `/terms` and `/privacy-policy` remain in place from Phase 0.

---

## Constraints honored

- No lawyer-drafted legal document rewrites
- No draft marked `published` in registry
- No GHL clickwrap implementation
- No cookie banner implementation
- No service availability inferred from provider license states
- No state lists hardcoded in counsel markdown

---

## Verdict

| Question | Answer |
|----------|--------|
| **Safe to commit Phase 1 link-hardening changes?** | **Yes** — engineering scope is complete; legal validator passes; no legal substance changed. |
| **Safe to deploy to production?** | **No** — `/legal/*` pages are stubs pending counsel finalization; GHL clickwrap, cookie policy, and controlled-substance policies are not live. Duplicate legacy `privacy-policy.html` / `terms.html` should be noindexed or removed in Phase 2. |

---

## Recommended next steps (Phase 2+)

1. Counsel drops finalized markdown into `legal-document-versions/`; flip registry `status` to `published`.
2. Phase 2: noindex or remove root `terms.html` / `privacy-policy.html` to resolve duplicate titles.
3. Phase 3: GHL clickwrap + screening consent bridge.
4. Phase 2: cookie policy publish + banner before GTM/GA.

---

## Files modified (Phase 1)

- `scripts/site-chrome.mjs`
- `scripts/generate-provider-pages.mjs`
- `scripts/validate-legal-links.mjs`
- `package.json`
- `styles.css`
- 167 HTML files (via `seo-build.mjs` + provider/legal generators)
