# Phase 7 — Final Indexation & Crawl Health Report

**Branch:** `phase-7-indexation-remediation`  
**Generated:** 2026-06-07  
**Build:** `npm run build` — **PASS**

---

## Before / After


| Metric                                  | Before (Phase 6 exit) | After (Phase 7) |
| --------------------------------------- | --------------------- | --------------- |
| **Sitemap URLs**                        | 140                   | **139**         |
| **Vercel redirect rules**               | 33                    | **39**          |
| **Internal links → redirect sources**   | 24                    | **0**           |
| **Sitemap entries that 301 elsewhere**  | 1 (`/siya-circle`)    | **0**           |
| **Canonical → redirect source**         | 1 (`/siya-circle`)    | **0**           |
| **Broken internal links (build audit)** | 0                     | **0**           |
| **Thin evidence rows**                  | 0                     | **0**           |


---

## Step 1 — Full crawl

Inventory: `[PHASE-7-CRAWL-INVENTORY.md](./PHASE-7-CRAWL-INVENTORY.md)`  
**147 HTML routes** audited for status, canonical, indexability, sitemap presence, inbound links, redirect targets.

---

## Step 2 — P0 fixes applied

### A. Internal link remediation

- New: `data/redirect-map.mjs` — unified redirect source → canonical destination map
- New: `scripts/phase7-link-remediation.mjs` — **33 href fixes** across 28 files
- Replaced redirect-source targets:
  - `/online-adhd-test` → `/adhd-screening`
  - `/adult-adhd-diagnosis` → `/adhd-care`
  - `/adhd-treatment-online` → `/adhd-care`
- Preserved `/terms` and `/privacy-policy` in footers (legacy shells; vercel 301 to `/legal/`*)
- Updated generators: `phase5-thin-expansions.mjs`, `patch_existing_blog_seo.py`, `generate_medication_blog_posts.py`, `generate_seo_shadow_pages.py`, `california-adhd-blog-rest.mjs`, `site-chrome.mjs`

### B. Sitemap integrity

- Excluded `siya-circle.html` from sitemap (external 302)
- Redirect shells remain excluded: `terms`, `privacy-policy`, geo funnel shells, `online-adhd-test`, etc.
- **0** sitemap URLs that 301 elsewhere

### C. Canonical hygiene

- `siya-circle.html`: `noindex, nofollow`; canonical removed (external redirect shell)
- Redirect shells: `noindex, follow` + canonical → destination (unchanged from Phase 6)

### D. Redirect chains

- Audited all 39 Vercel rules — **no multi-hop chains** detected

### E. Repo-wide retired URL references

- Phase 1 retired guides/blogs: **0** orphan `href` hits
- `membership-pricing`, `visual-components`, `/public/`*: **0** patient HTML references

---

## Step 3 — Search Console alignment

Added safe 301 rules for historic/GSC URL patterns:


| Source                         | Destination                          |
| ------------------------------ | ------------------------------------ |
| `/terms-of-service`            | `/legal/terms-of-use`                |
| `/notice-of-privacy-practices` | `/legal/notice-of-privacy-practices` |
| `/blank`                       | `/`                                  |
| `/book`                        | `/book-appointment`                  |
| `/discovery-call`              | `/book-appointment`                  |
| `/meet-and-greet`              | `/book-appointment`                  |


Existing rules cover: Phase 1 retired content (16), hygiene (`/visual-components`, `/public/`*), legacy pricing/funnel URLs, blog retirements.

**Not restored:** Deleted guide/blog HTML — equity absorbed by redirect targets per Phase 1.

---

## Step 4 — Subdomain review


| Subdomain            | Status                 | Action                                                                                         |
| -------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| `adhd.siya.health`   | **Abandoned / legacy** | 0 references in built patient HTML; `site-chrome.mjs` rewrites legacy legal URLs at build time |
| `getfit.siya.health` | **No references**      | Not linked anywhere in project; no DNS changes (out of scope)                                  |


**Recommendation:** Monitor Search Console for `adhd.siya.health` impressions; consider apex-level 301 at DNS/hosting if crawl budget warrants (not modified in this sprint).

---

## Step 5 — Build validation


| Gate                               | Result              |
| ---------------------------------- | ------------------- |
| `npm run build`                    | **PASS**            |
| `phase7-validate.mjs`              | **PASS**            |
| `validate-legal-links.mjs`         | **PASS**            |
| `cannibalization-phase1-final.mjs` | **PASS**            |
| `internal-link-audit.mjs`          | 147 pages, 0 broken |


Build pipeline now includes: `phase7-link-remediation` → `phase7-validate` → `phase7-crawl-inventory` → `generate-website-inventory`.

---

## Remaining issues

### P0

*None.*

### P1


| Issue                                                  | Rationale                                              |
| ------------------------------------------------------ | ------------------------------------------------------ |
| 1 page missing canonical (`/siya-circle`)              | External redirect shell — intentional; noindex applied |
| 23 guides without evidence snapshot card               | Refs-only by design; no fabrication per scope          |
| `/answers/meet-and-greet-telehealth-expectations` slug | Content clean; URL rename deferred (no new guides)     |
| 11 near-duplicate title pairs (geo/state)              | Intentional regional variants; monitoring only         |


### P2


| Issue                             | Rationale                                     |
| --------------------------------- | --------------------------------------------- |
| 9 zero-inbound pages              | Utility/legal/intake shells — acceptable      |
| CTA repetition                    | Out of scope (conversion architecture frozen) |
| Weight-loss 450+ / 2,500+ metrics | Out of scope (provider/claims sprint)         |


---

## Files changed

### New

- `data/redirect-map.mjs`
- `scripts/phase7-crawl-inventory.mjs`
- `scripts/phase7-link-remediation.mjs`
- `scripts/phase7-validate.mjs`
- `docs/PHASE-7-CRAWL-INVENTORY.md`
- `docs/PHASE-7-FINAL-REPORT.md`

### Modified (source)

- `vercel.json` — +6 GSC/historic redirects (39 total path rules)
- `scripts/seo-build.mjs` — siya-circle sitemap exclude + external shell handling
- `scripts/validate-legal-links.mjs` — accept canonical `/legal/`* footer links
- `scripts/patch_existing_blog_seo.py`
- `scripts/generate_medication_blog_posts.py`
- `scripts/generate_seo_shadow_pages.py`
- `scripts/california-adhd-blog-rest.mjs`
- `scripts/site-chrome.mjs`
- `data/phase5-thin-expansions.mjs`
- `package.json` — phase 7 gates in build

### Modified (generated via build)

- 28+ HTML files (internal link remediation + seo-build)
- `sitemap.xml` (139 URLs)
- `data/internal-link-audit.json`
- `data/website-inventory.json`
- `docs/WEBSITE-INVENTORY.md`

---

## Architecture status

**Frozen** for SEO growth phase:

- 139 indexable sitemap URLs
- 39 Vercel redirect rules (single source of deployment truth)
- 0 internal links to redirect sources
- 0 sitemap/canonical/indexation conflicts

