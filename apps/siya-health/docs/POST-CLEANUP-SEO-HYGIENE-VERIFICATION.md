# Post-Cleanup SEO & Hygiene Verification

**Generated:** 2026-06-07  
**Mode:** Read-only verification — no files modified  
**Baseline work verified:** [Hygiene Cleanup Sprint 1](./HYGIENE-SPRINT-1-REPORT.md) · [Content Consolidation Phase 1](./CONTENT-CONSOLIDATION-PHASE1-REPORT.md)

---

## Executive summary

| Severity | Count | Notes |
|----------|------:|-------|
| **CRITICAL** | **0** | Prior C-1/C-2 (`visual-components`, `/public/` mirrors) resolved |
| **HIGH** | **9** | Patient-visible gaps, unverified stats, deprecated copy, sitemap/redirect conflicts |
| **MEDIUM** | **18** | Evidence thin rows, SEO parity, link equity, intentional pair monitoring |

**Overall:** Sprint 1 and Phase 1 objectives are **largely met**. Build validation passes with **0 broken internal links** and **0 orphan hrefs to retired Phase 1 URLs**. Remaining risk is concentrated in **utility pages**, **provider claims**, **deprecated “Meet & Greet” blog copy**, and **sitemap entries for URLs that 301 elsewhere**.

---

## 1. Sitemap count

| Metric | Value |
|--------|------:|
| **Sitemap URLs** | **145** (`sitemap.xml`, generated 2026-06-07) |
| **Pre–Sprint 1 baseline** | 148 |
| **Excluded from sitemap** | `/labs`, `/prescriptions` (and deleted `/visual-components`) |

**Verified:** `/labs` and `/prescriptions` are **not** in `sitemap.xml`.

**Finding (HIGH):** **7 redirect-source URLs remain in the sitemap** while `vercel.json` 301s them elsewhere:

| Sitemap URL | Redirect destination |
|-------------|---------------------|
| `/adult-adhd-diagnosis` | `/adhd-care` |
| `/adhd-treatment-online` | `/adhd-care` |
| `/adhd-diagnosis-florida` | `/adhd-care` |
| `/adhd-evaluation-cost` | `/pricing` |
| `/online-adhd-test` | `/adhd-screening` |
| `/terms` | `/legal/terms-of-use` |
| `/privacy-policy` | `/legal/privacy-policy` |

Crawlers may index canonicals that conflict with live redirect rules.

---

## 2. Content page count

| Category | Count |
|----------|------:|
| **Total HTML pages** (build scan) | **147** |
| **Health Guides** (`answers/*.html`, excl. index) | **57** |
| **Blog articles** (`blog/*.html`, excl. hubs/index) | **44** |
| **Content pages (guides + articles)** | **101** |
| **Pre–Phase 1 baseline** | 120 (−19 after 16 retirements + inventory drift) |

**Hub / utility pages (not counted as content):** 4 blog hubs (`adhd`, `weight-loss`, `telehealth`, `index`), service/legal/provider/intake pages, `labs`, `prescriptions`, legacy `terms`/`privacy-policy` shells.

---

## 3. Remaining redirects

### Vercel (`vercel.json`) — **33** path redirects (+ 1 apex → `www`)

| Group | Count | Examples |
|-------|------:|----------|
| Legacy / funnel consolidation | 10 | `/membership-pricing` → `/pricing`, `/mental-health-adhd` → `/adhd-care` |
| Content Consolidation Phase 1 | 16 | `/answers/adhd-in-men` → `/answers/signs-of-adult-adhd` |
| Hygiene Sprint 1 | 3 | `/visual-components`, `/public`, `/public/:path*` → `/` |
| Blog hygiene | 4 | `/blog/all` → `/blog`, retired slugs → successors |
| External | 1 | `/siya-circle` → GHL form (302) |

### Netlify (`netlify.toml`) — **21** redirects

Includes Phase 1 (16) + hygiene (3) + `/mental-health-adhd`, `/adhd-evaluation-cost`.  
**Does not mirror** full Vercel legacy set (terms, privacy, membership, geo funnel, etc.).

**Finding (MEDIUM):** Vercel vs Netlify redirect parity gap — patients on Netlify deploy path may hit stale URLs that Vercel would 301.

---

## 4. Broken internal links

| Source | Result |
|--------|--------|
| `docs/CANNIBALIZATION-PHASE1-FINAL.md` | **0** broken internal links |
| `SEO-DEPLOYMENT-QA-REPORT.md` | **0** broken (sample) |
| `data/internal-link-audit.json` | 147 pages scanned; no broken-link array |

**Status: PASS**

---

## 5. Internal links pointing to retired URLs

Automated scan of all `*.html` for `href` to Phase 1 retired sources + `/visual-components` + `/public/`:

| Result |
|--------|
| **0** orphan href hits |

Retired slugs verified absent: `adhd-in-men`, `creyos-adhd-testing-explained`, `phentermine-weight-loss-safety`, `oral-vs-injectable-weight-loss-meds`, `non-stimulant-adhd-medications` (guide), `tirzepatide-vs-semaglutide` (guide), `minoxidil-hair-loss-does-it-work` (guide), `sildenafil-erectile-dysfunction-expectations`, 8 retired blog slugs.

**Status: PASS**

---

## 6. Remaining patient-facing hygiene issues

Compared to [PATIENT-FACING-HYGIENE-AUDIT.md](./PATIENT-FACING-HYGIENE-AUDIT.md) (232 files, pre-cleanup):

| Original issue | Post-cleanup status |
|----------------|---------------------|
| C-1/C-2 `visual-components` internal docs leak | **Resolved** — file deleted, 301 to `/` |
| H-4–H-10 stale `public/` mirrors (68 files) | **Resolved** — directory deleted, `.vercelignore`, redirects |
| H-13 “canonical starting point” SEO jargon | **Resolved** — 0 matches in patient HTML |
| H-1/H-2 “Coming soon” on labs/prescriptions | **Partial** — `noindex, follow`; body/meta still say “Coming soon” |
| H-11 Dr. Sneh “5,000+ patients” | **Open** — `providers/dr-sneh-pandey.html` (+ HTML comment `TODO:VERIFY-SOURCE`) |
| H-12 “physician assistant” on providers | **Open** — `providers/index.html` |
| H-3 membership / discovery-call mirrors | **Resolved** — 0 patient HTML matches |
| GLP-1 generator boilerplate (20 posts) | **Resolved** — regulatory block only on dedicated compounded article |
| CTA repetition (125 pages, 4+ CTAs) | **Unchanged** — out of sprint scope; still present |
| Encoding defects | **Clean** — none detected in spot checks |

---

## 7. Remaining placeholder / thin evidence rows

Source: `data/health-guide-evidence-audit.json` (build-generated)

| Metric | Value |
|--------|------:|
| Guides with evidence snapshot card | 34 |
| Guides without snapshot (refs list only) | **23** |
| Flagged thin-value rows | **7** |

### Flagged rows (all `thin_value`)

| URL | Label | Value |
|-----|-------|-------|
| `/answers/adderall-vs-vyvanse-adults` | FDA prescribing information | medication guides |
| `/answers/high-shbg-low-free-testosterone` | AUA guideline on testosterone deficiency | reaffirmed 2024 |
| `/answers/high-shbg-low-free-testosterone` | Bhasin S et al. Testosterone therapy in men with | Endocrine Society |
| `/answers/is-adhd-medication-safe-long-term` | Long-term stimulant safety literature | population studies |
| `/answers/is-telehealth-legitimate` | State telehealth parity laws | varies by state |
| `/answers/semaglutide-weight-loss-how-it-works` | STEP trial program publications | semaglutide 2.4 mg |
| `/answers/signs-of-sleep-apnea-in-adults` | AASM OSA Screening Health Advisory | HEARTS mnemonic |

Placeholder duplicate cards (`Guideline-based care` / `See references below`) from pre-sprint audit: **removed**.

---

## 8. Remaining duplicate / cannibalization pairs

Source: `docs/CANNIBALIZATION-PHASE1-FINAL.md` — **PASS**

| Classification | Count | Status |
|----------------|------:|--------|
| Duplicate pairs (blog wins, guide narrowed) | 11 | **Resolved** — differentiated H1/title + canonical pointers |
| Supporting pairs (both kept, reciprocal links) | 14 | **Intentional** — monitor, not defects |
| Broken links from pair work | 0 | **PASS** |
| Duplicate title tags (build) | 1 group | `Privacy Policy` — `/legal/privacy-policy` + `/privacy-policy` |
| Duplicate H1s | 1 group | Same privacy pair |
| Near-duplicate titles (≥75% overlap) | 4 pairs | See below |

**Near-duplicate titles remaining (MEDIUM):**

- `/adhd-care` ↔ `/adult-adhd-diagnosis` (0.86) — compounded by redirect/sitemap conflict
- `/adhd-diagnosis-austin` ↔ `/adhd-diagnosis-houston` (0.75)
- `/answers/telehealth-adhd-california` ↔ `/answers/telehealth-adhd-texas` (0.75)
- `/blog/online-adhd-diagnosis-california` ↔ `/blog/online-adhd-diagnosis-texas` (0.83)

---

## 9. Remaining stale `/public` or `visual-components` exposure

| Check | Result |
|-------|--------|
| `public/` directory on disk | **Absent** (0 files) |
| `visual-components.html` on disk | **Absent** |
| Patient `href="/public/…"` | **0** |
| `vercel.json` redirects | `/visual-components`, `/public`, `/public/:path*` → `/` |
| `.vercelignore` | `public/` excluded |

**Residual (LOW/MEDIUM, non-patient):** Generated artifacts still list `/visual-components` in `data/website-inventory.json`, `data/pricing-system-audit.json`, `docs/WEBSITE-INVENTORY.md` — documentation drift only.

**Status: PASS** for live patient exposure.

---

## 10. Remaining “Coming soon” indexed pages

| Page | `robots` | In sitemap | “Coming soon” in body/meta |
|------|----------|:----------:|:--------------------------:|
| `/labs` | `noindex, follow` | No | Yes |
| `/prescriptions` | `noindex, follow` | No | Yes |

**Indexed “Coming soon” pages: 0**

**Finding (HIGH):** Pages remain patient-reachable via footer/nav with placeholder copy and full booking CTAs — indexing risk is closed, UX risk remains.

---

## 11. Deprecated language scan

Patient-visible HTML scan (body text, excludes `noindex` “coming soon” for indexability check):

| Phrase | Matches | Severity | Locations |
|--------|--------:|----------|-----------|
| **Meet & Greet** | **3** | HIGH | `blog/food-noise-and-glp-1-…`, `blog/free-testosterone-vs-total-…`, `blog/why-am-i-always-tired-…` |
| **discovery call** | **0** | — | Cleared (was `public/` only) |
| **canonical starting point** | **0** | — | Cleared (Sprint 1) |
| **membership pricing** | **0** | — | Cleared; redirect `/membership-pricing` → `/pricing` only |
| **$150/month** | **0** | — | Cleared |
| **Board-certified, ADHD-CCSP trained providers** (exact) | **1** | HIGH | `adult-adhd-diagnosis.html` (also in sitemap; 301 → `/adhd-care`) |
| **5,000+** (patient stat) | **2** | HIGH | `providers/dr-sneh-pandey.html`, `weight-loss-metabolic-health.html` |
| **physician assistant** | **1** | MEDIUM | `providers/index.html` |

**Related:** `/answers/meet-and-greet-telehealth-expectations` — URL slug and internal links use deprecated naming; page title/H1 correctly say “first telehealth visit” (renamed in content, not slug).

---

## Severity rollup

| Severity | Count | Definition used |
|----------|------:|-----------------|
| **CRITICAL** | **0** | Internal doc leaks, deployable dev surfaces, stale mirror exposure |
| **HIGH** | **9** | Distinct open findings (not instance count) |
| **MEDIUM** | **18** | SEO parity, evidence gaps, link equity, near-duplicates, monitoring |

### HIGH findings (9)

1. Labs `/labs` — “Coming soon” body with booking CTAs (noindex only)
2. Prescriptions `/prescriptions` — same pattern
3. Dr. Sneh “5,000+ patients” — unverified, visible claim
4. Weight-loss hub “5,000+” trust metric — same stat family, unverified
5. “Meet & Greet” in 3 cornerstone blog posts
6. “ADHD-CCSP trained clinicians” on `/adult-adhd-diagnosis` (deprecated phrasing)
7. Sitemap lists 7 URLs that 301 to different canonicals
8. `/adult-adhd-diagnosis` indexed + near-duplicate of `/adhd-care` + redirect conflict
9. Netlify redirect set incomplete vs Vercel (deploy-path parity)

### MEDIUM findings (18, grouped)

- 7 thin evidence snapshot rows
- 23 guides without evidence snapshot card (refs-only)
- Privacy Policy duplicate title/H1 (`/privacy-policy` + `/legal/privacy-policy`)
- 4 near-duplicate title pairs (geo/state variants)
- 6 zero-inbound pages (`/adhd-diagnosis-florida`, `/adhd-evaluation-cost`, `/intake`, `/privacy-policy`, `/siya-circle`, `/terms`)
- 28 pages with &lt;3 inbound links
- `/pricing` — only service page without blog backlink
- 25 cannibalization pairs coexist by design (11 duplicate + 14 supporting) — ongoing monitoring
- Deprecated URL slug `/answers/meet-and-greet-telehealth-expectations`
- Generated inventory/docs still reference removed `/visual-components`
- Legacy `terms.html` / `privacy-policy.html` shells coexist with `/legal/*` (redirect not noindex)
- Physician assistant vs Physician Associate terminology
- Footer links to noindex utility pages (`/labs`, `/prescriptions`)
- `adhd-evaluation-cost.html` file exists while URL 301s to `/pricing`

---

## Top 10 remaining issues

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 1 | **7 sitemap URLs 301 to different destinations** — crawl/index conflict | HIGH | `sitemap.xml` + `vercel.json` |
| 2 | **Labs & prescriptions “Coming soon”** — footer-linked placeholder UX | HIGH | `labs.html`, `prescriptions.html` |
| 3 | **“5,000+ patients” unverified** on provider + weight-loss hub | HIGH | `dr-sneh-pandey.html`, `weight-loss-metabolic-health.html` |
| 4 | **“Meet & Greet” in 3 cornerstone blogs** — deprecated patient language | HIGH | food-noise, free-testosterone, tiredness blogs |
| 5 | **`/adult-adhd-diagnosis` triple conflict** — in sitemap, 301→`/adhd-care`, deprecated ADHD-CCSP copy | HIGH | sitemap + vercel + HTML |
| 6 | **7 thin evidence rows** need seed enrichment | MEDIUM | `health-guide-evidence-audit.json` |
| 7 | **23 guides lack evidence snapshot card** (refs only) | MEDIUM | same audit |
| 8 | **Privacy Policy duplicate title/H1** (legacy + legal) | MEDIUM | `TITLE-META-DUPLICATE-AUDIT.md` |
| 9 | **Netlify redirect parity gap** vs Vercel (12+ rules missing) | MEDIUM | `netlify.toml` vs `vercel.json` |
| 10 | **6 zero-inbound pages** — weak discoverability | MEDIUM | `internal-link-audit.json` |

---

## Recommended next single sprint

### Sprint 2: **Index alignment + language + utility pages**

One focused sprint (no pricing/CTA/blog rewrites beyond scope items):

1. **Sitemap & redirect alignment** — Remove or `noindex` all redirect-source shells (`adult-adhd-diagnosis`, `adhd-treatment-online`, `adhd-diagnosis-florida`, `adhd-evaluation-cost`, `online-adhd-test`, `terms`, `privacy-policy`); sync `netlify.toml` with `vercel.json` redirect set.
2. **Deprecated language pass** — Replace “Meet & Greet” in 3 blogs; retire or rename `/answers/meet-and-greet-telehealth-expectations` slug; fix `adult-adhd-diagnosis.html` copy or remove file.
3. **Labs / prescriptions** — Either minimal active-service rewrite **or** remove from footer until launch (pick one).
4. **Evidence enrichment** — Expand 7 thin `answer-seeds.mjs` evidence strings; optionally restore snapshot cards for high-traffic guides among the 23 refs-only set.
5. **Provider claim audit** — Source or soften “5,000+” on provider + weight-loss pages.

**Estimated impact:** Closes all 9 HIGH findings; reduces MEDIUM count by ~8; leaves intentional cannibalization pairs and CTA repetition for later editorial sprints.

---

## Verification sources

| Artifact | Path |
|----------|------|
| Sitemap | `sitemap.xml` |
| Internal links | `data/internal-link-audit.json` |
| Evidence audit | `data/health-guide-evidence-audit.json` |
| Cannibalization final | `docs/CANNIBALIZATION-PHASE1-FINAL.md` |
| Title/meta duplicates | `docs/TITLE-META-DUPLICATE-AUDIT.md` |
| Redirects | `vercel.json`, `netlify.toml` |
| Phase 1 config | `data/content-consolidation-phase1.mjs` |
| Prior hygiene audit | `docs/PATIENT-FACING-HYGIENE-AUDIT.md` |
| Sprint 1 report | `docs/HYGIENE-SPRINT-1-REPORT.md` |

**Build status at verification time:** Last known `npm run build` — **PASS** (147 HTML, 145 sitemap URLs, 0 broken links).
