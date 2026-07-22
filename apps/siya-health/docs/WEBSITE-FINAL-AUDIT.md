# Siya Health — Website Final Audit & Standardization

**Date:** 2026-07-19  
**Scope:** `apps/siya-health` production site (https://www.siya.health)  
**Benchmarks:** Homepage (`index.html`) and ADHD Care (`adhd-care.html`)  
**Nature:** Repository audit — **not** a redesign. No pages were deleted in this pass.

**Companion:** Full route-by-route table → [WEBSITE-SITEMAP-INVENTORY.md](./WEBSITE-SITEMAP-INVENTORY.md)  
**Auto inventory refresh:** [WEBSITE-INVENTORY.md](./WEBSITE-INVENTORY.md) (regenerated 2026-07-19)

---

## Executive summary

| Metric | Count |
|--------|------:|
| Public HTML on disk | **169** |
| Sitemap URLs | **156** |
| `noindex` / utility / redirect shells | **~13–14** |
| **Keep** | **150** |
| **Merge candidates** (human approval required) | **11** |
| **Redirect shells** (already 301; file cleanup later) | **8** |
| **Delete now** | **0** |

**Verdict:** The site is production-viable. Core commercial pages (Home, ADHD, Weight Loss, Men’s Health, Telehealth) are the quality bar. The highest-risk debt is **content cannibalization** (blog ↔ answers twins), **under-standardized secondary service pages**, **thin/legacy photography**, and **build scripts that can re-inject retired chrome**.

This audit **justifies** every page. Removals require a second, explicit human-approved execution pass with Search Console verification.

---

## Decision rules (applied)

A page **stays** if it is at least one of:

- Important SEO landing page  
- Commercial service page  
- Blog / article / health guide  
- Legal / compliance page  
- Physician / provider page  
- Important conversion / funnel page  
- Active campaign page  
- Necessary redirect / hop  

**Delete / redirect only after documenting why** — and after checking rankings, Ads destinations, and inbound links.

---

## Pages Kept

### Core commercial & brand (long-term)

| Route | Reason |
|-------|--------|
| `/` | Brand entry; frozen quality benchmark |
| `/adhd-care` | Primary ADHD commercial page; quality benchmark |
| `/weight-loss-metabolic-health` | Core GLP-1 / metabolic commercial page (blueprint-aligned) |
| `/mens-health-longevity` | Core men’s / hormones commercial page (blueprint-aligned) |
| `/telehealth` | Care-model + service routing page (blueprint-aligned) |
| `/adhd-screening` | Top-of-funnel conversion tool |
| `/pricing` | Commercial pricing (needs hero CTA polish; keep URL) |
| `/book-appointment` | Booking chooser |
| `/about` | Trust / mission |
| `/womens-health` | Commercial service (footer-linked; **standardize next**) |
| `/labs` | Commercial labs (thin; keep + polish) |
| `/prescriptions` | Commercial prescriptions (**orphan inbound — link, don’t delete**) |
| `/primary-urgent-care` | Commercial primary/urgent (thin; keep + polish) |
| `/creyos-adhd-testing` | Product/explainer supporting $199 evaluation |

### Geo / campaign SEO (keep + monitor)

| Route | Reason |
|-------|--------|
| `/adhd-diagnosis-texas` | State commercial SEO |
| `/adhd-diagnosis-austin` | City commercial SEO |
| `/adhd-diagnosis-houston` | City commercial SEO |
| `/adhd-diagnosis-pennsylvania` | State commercial SEO |
| `/adhd-diagnosis-philadelphia` | City commercial SEO |
| `/adult-adhd-screening-california` | CA campaign / screening landing — **do not delete** without Ads + GSC review |

California **blog** cluster (9 articles) + `/answers/telehealth-adhd-california` — keep as informational/local SEO; periodic overlap review only.

### Trust / legal / providers

| Route | Reason |
|-------|--------|
| `/providers` + 7 clinician profiles | E-E-A-T; booking paths |
| `/legal` + 5 policy pages | Compliance (canonical legal surface) |

### Educational

| Surface | Count | Reason |
|---------|------:|--------|
| `/blog` + hubs + articles | 63 | Informational SEO + internal linking |
| `/answers` (Health Guides) hub + guides | 58 | PAA / FAQ / AI-discovery layer |

### Conversion utilities (keep)

| Route | Reason |
|-------|--------|
| `/redirect/meet-greet` | CTA hop + tracking |
| `/redirect/adhd-walkthrough` | CTA hop + tracking |
| `/redirect/adhd-evaluation` | CTA hop + tracking |
| `/redirect/chat` | Secure chat hop + tracking |
| `/adhd-screening-results` | Post-screen funnel (`noindex` OK) |
| `/intake` | Intake utility |

---

## Pages Redirected

### Already live in `vercel.json` (do not remove rules)

| From | To | Notes |
|------|-----|-------|
| `/terms`, `/terms-of-service` | `/legal/terms-of-use` | Legal consolidation |
| `/privacy-policy` | `/legal/privacy-policy` | Legal consolidation |
| `/notice-of-privacy-practices` | `/legal/notice-of-privacy-practices` | Legal consolidation |
| `/membership-pricing` | `/pricing` | Rename |
| `/mental-health-adhd` | `/adhd-care` | Funnel consolidation |
| `/adult-adhd-diagnosis` | `/adhd-care` | Funnel consolidation |
| `/adhd-treatment-online` | `/adhd-care` | Funnel consolidation |
| `/adhd-diagnosis-florida` | `/adhd-care` | Root FL landing retired (city blogs remain) |
| `/online-adhd-test` | `/adhd-screening` | Duplicate screener URL |
| `/adhd-evaluation-cost` | `/pricing` | Cost → pricing |
| `/book` | `/book-appointment` | Short alias |
| `/discovery-call`, `/meet-and-greet` | `/redirect/adhd-walkthrough` | Temporary (non-permanent) |
| `/siya-circle` | External GHL form | Newsletter hop |
| Content Consolidation Phase 1 (16 URLs) | various blog/answers | See `CONTENT-CONSOLIDATION-PHASE1-REPORT.md` |
| `/blank`, `/docs/*`, `/data/*`, `/design-system/*`, `*.mjs` | `/` | Hardening non-public paths |
| Host `siya.health` | `www.siya.health` | Canonical host |

### HTML shells still on disk (redirect already works)

These are **not** recommended for blind delete until GSC + Ads confirm zero need for fallback HTML:

| Shell file | Status |
|------------|--------|
| `terms.html`, `privacy-policy.html` | ↪ Keep 301; optional later file removal |
| `adult-adhd-diagnosis.html`, `adhd-treatment-online.html`, `adhd-diagnosis-florida.html`, `adhd-evaluation-cost.html`, `online-adhd-test.html` | ↪ Same |
| `siya-circle.html` | ↪ External redirect owns traffic; HTML optional |

**Recommended next step (execution pass, not this audit):** after 30–60 days of confirming 301s in Search Console, remove shell HTML from the repo so generators cannot “revive” them as indexable pages.

---

## Pages Deleted

**None in this audit.**

Prior deletions (already executed historically): Content Consolidation Phase 1 — **16 URLs** removed with 301s (documented in `CONTENT-CONSOLIDATION-PHASE1-REPORT.md`).

### Candidates for a **future** delete/merge pass (requires approval + GSC)

| Candidate | Proposed action | Why not now |
|-----------|-----------------|-------------|
| 11 cannibalization “Duplicate” guides | Narrow in place **or** 301 → preferred blog | Guides may still rank / get AI citations |
| Exact slug twins (4 blog↔answers pairs) | Pick one owner; 301 the other | Need ranking + link-equity check |
| Legacy redirect shell HTML | Delete files only | 301s must stay forever |

---

## Sitemap inventory

**Full table (169 routes):** [WEBSITE-SITEMAP-INVENTORY.md](./WEBSITE-SITEMAP-INVENTORY.md)

Columns: Route · Purpose · Primary keyword · Type (Commercial / Informational / Trust / Utility) · Decision · Long-term? · Notes

**Tallies:** Keep 150 · Merge candidates 11 · Redirect shells 8 · Delete recommendations 0

---

## Site consistency (vs Homepage + ADHD Care)

### Aligned (service blueprint)

| Page | Status |
|------|--------|
| `/adhd-care` | Benchmark |
| `/weight-loss-metabolic-health` | Aligned |
| `/mens-health-longevity` | Aligned |
| `/telehealth` | Aligned |

Shared pattern: recognition-led hero CTAs, human trust block, “Does This Sound Like You?”, 3-step “How to Get Started”, Suggested Reading, MD message, final Meet & Greet + Chat.

### Partial / outliers (standardize next — do not redesign)

| Page | Gap |
|------|-----|
| `/womens-health` | Still cornerstone / pre-blueprint layout |
| `/primary-urgent-care` | Thin; stock hero; no blueprint stack |
| `/labs`, `/prescriptions` | Thin utility service pages |
| `/about` | Hero secondary still “Explore Care Options” |
| `/pricing` | Generated page; hero Explore Care; stock hero |
| `/book-appointment` | Functional chooser — exempt from full blueprint |
| `/adhd-screening` | Tool page — exempt |
| `/adult-adhd-screening-california` | Landing-page pattern; still has pathways |
| Homepage | Frozen; different pattern by design (pathways remain) |

### Templates standardized (already)

- `docs/SERVICE-PAGE-BLUEPRINT.md`
- Shared `.page-service` CSS
- `LEARN_MORE_*` Suggested Reading templates in `scripts/site-chrome.mjs`
- Conversion cleanup locked for ADHD (pathways / next-steps / pricing strip exceptions)

### Templates still to standardize (recommended execution)

1. Women’s Health → service blueprint  
2. Primary / Labs / Prescriptions → lighter blueprint or intentional “utility service” template  
3. About + Pricing heroes → Meet & Greet + Chat (remove Explore Care)  
4. Geo landings → shared geo template (hero + trust + FAQ + CTA)  
5. Blog article template → featured image + related reading + CTA band  

---

## Photography audit

### Reference standard

Homepage + ADHD Care editorial direction; library rules in `brand/photography/README.md` and `INVENTORY.md`.

### Seeded editorial (good)

~13 `editorial-*.jpg` assets in use on aligned service pages (recognition, trust, reading cards).

### Needs shoot / replace

| Gap | Notes |
|-----|--------|
| `family-medicine` | Empty category — hurts primary/labs |
| `mens-health` | Using burnout stand-in |
| `prevention` | Empty |
| Homepage hero | Still `hero-telehealth-main.png` (interim) |
| ADHD hero | `adhd-care.jpg` (acceptable interim; upgrade when ready) |
| Pricing / labs / prescriptions / book | Shared `telehealth-visit.png` stock |
| Blog articles | **No unique hero images**; OG defaults to logo |
| Blog hub cards | Text-only; no thumbnails |

### Do-not-reuse assets (on disk, currently unreferenced)

`care-team.png`, `doctor-office.png`, `doctor-profile.png`, `doctor-video-consult.png`, `weightloss-health.png`, `patient-telehealth.png`, `blog-hero-doctor-consultation.png` — quarantine; do not bring back.

### Images updated (this audit)

**None** — photography recommendations only. Image replacement is a separate execution sprint.

---

## Blog & Health Guides

### Keep both surfaces

- **`/blog`** — narrative / depth / local SEO articles  
- **`/answers`** — concise Health Guides (PAA / FAQ)

### Standardization gaps

| Item | Status |
|------|--------|
| Featured / hero image | Missing on most articles |
| Image ratio / category styling | Inconsistent |
| Author presentation | Partial |
| Related reading | Present via linking scripts; uneven |
| In-article editorial images | Rare — add sparingly on long pieces only |
| Exact slug collisions | 4 pairs (see merge candidates) |

### Cannibalization Duplicate pairs (blog preferred owner)

| Guide (narrow or later 301) | Preferred blog |
|-----------------------------|----------------|
| `/answers/is-online-adhd-diagnosis-legitimate` | `/blog/is-online-adhd-diagnosis-legit` |
| `/answers/adderall-vs-vyvanse-adults` | `/blog/vyvanse-vs-adderall-differences` |
| `/answers/adhd-medication-side-effects` | `/blog/adhd-medication-side-effects-what-to-expect` |
| `/answers/is-adhd-medication-safe-long-term` | `/blog/is-adhd-medication-safe-long-term` |
| `/answers/glp-1-side-effects` | `/blog/glp1-side-effects-and-how-to-manage-them` |
| `/answers/semaglutide-weight-loss-how-it-works` | `/blog/semaglutide-for-weight-loss-how-it-works` |
| `/answers/compounded-vs-branded-glp-1` | `/blog/compounded-vs-branded-glp1-medications` |
| `/answers/medical-weight-loss-vs-dieting` | `/blog/medical-weight-loss-vs-dieting-what-actually-works` |
| `/answers/when-is-testosterone-therapy-appropriate` | `/blog/when-is-testosterone-therapy-appropriate` |
| `/answers/trt-monitoring-requirements` | `/blog/when-is-testosterone-therapy-appropriate` |
| `/answers/oral-vs-topical-minoxidil` | `/blog/oral-vs-topical-minoxidil-which-is-right` |

**Preferred near-term action:** narrow guides to FAQ-shaped answers + canonical/supporting links to blog (**not** mass 301 without GSC).

---

## Internal linking improvements

### Current strengths

- Site-wide chrome + footer link most core pages  
- ADHD / blog / women / ED inbound scripts  
- Suggested Reading on aligned service pages  

### Gaps to fix (execution)

| Issue | Fix |
|-------|-----|
| `/prescriptions` inbound ≈ 0 | Add footer + telehealth/services links |
| `/primary-urgent-care` weakly linked | Link from telehealth + homepage pathways carefully |
| Geo landings not in nav/footer | Keep out of nav; add “Also serving…” from ADHD Care / state blogs |
| `/creyos-adhd-testing` deep-only | Link from ADHD Care evaluation journey + pricing FAQ |
| Duplicate Suggested Reading / Learn More variants | Prefer photo-grid Suggested Reading template sitewide |
| Orphan risk on new answer pages | Require seed → hub category + 2+ contextual links before publish |

### Broken links

Rely on build validators (`validate-cta-links.mjs`, phase7 crawl). Re-run after any redirect shell file removal.

---

## Content cleanup (recommended, not executed)

Remove or reduce on non-aligned pages:

- Duplicate pricing strips  
- Duplicate final CTA bands  
- Cornerstone hub dumps (`womens-health` still has)  
- Explore Care / View Pricing as hero secondary  
- Pathways blocks on campaign landings (CA screening)  
- Expired campaign language (verify Ads copy separately)  
- California-specific **ad** claims on non-CA pages  

Keep pages concise; do not gut FAQ/schema that supports SEO.

---

## Build system audit

### Single source of truth risk

`npm run build` regenerates/mutates many pages. Templates must match the polished HTML, or polish regresses.

### Generators that write HTML

| Script | Output |
|--------|--------|
| `generate-redirect-pages.mjs` | `/redirect/*` |
| `generate-legal-pages.mjs` | `/legal/*` |
| `generate-answer-pages.mjs` | `/answers/*` (runs twice) |
| `generate-provider-pages.mjs` | `/providers/*` |
| `generate-pricing-page.mjs` | `/pricing` |
| `generate-intake-page.mjs` | `/intake` |
| `seo-build.mjs` → `applySiteChrome` | Mutates essentially all HTML |

### Regression risks (do not reintroduce)

| Risk | Source | Mitigation |
|------|--------|------------|
| Explore Care as pricing hero secondary | `generate-pricing-page.mjs` | Update generator before next polish of pricing |
| Cornerstone hubs on weight/men’s/tele | `apply-phase2-optimization.mjs` | **Not** in default build — treat as dangerous; do not re-run without stripping injection |
| ADHD pathways / next-steps / wrong CTAs | `apply-adhd-hub-linking.mjs`, `apply-conversion-cleanup.mjs` | Already locked for ADHD — keep locks |
| Suggested Reading wiped | `site-chrome.mjs` `LEARN_MORE_*` | Keep templates synced with live HTML |
| Stale “add Explore Care” advice | `production-readiness-audit.mjs` | Update audit guidance to match blueprint |

### Answer seed drift

5 answer HTML files exist that are not in current `ANSWER_SEEDS` — keep them, but either add to seeds or document as hand-maintained so regenerators do not orphan them:

- `afternoon-energy-crash-after-lunch`  
- `food-noise-returned-on-glp-1`  
- `high-shbg-low-free-testosterone`  
- `weight-gain-after-stopping-ozempic`  
- `why-normal-labs-dont-mean-healthy`  

---

## SEO preserved

| Asset | Status |
|-------|--------|
| Clean URLs + www canonical | Intact |
| Existing 301 map | Intact — **do not prune without GSC** |
| Sitemap (156) | Intact |
| Schema / titles / canonicals on commercial pages | Untouched by this audit |
| Blog + answers indexability | Intact |
| Provider E-E-A-T pages | Intact |
| Analytics / CTA tracking attributes | Intact on aligned pages |

**Rule for future cleanup:** every removal = documented reason + 301 + internal-link rewrite + GSC URL inspection.

---

## Remaining technical debt

1. Women’s / primary / labs / prescriptions consistency  
2. Pricing + About hero CTA hierarchy (generator-safe)  
3. Prescriptions orphan inbound links  
4. 11 duplicate guide↔blog pairs (narrow, don’t mass-delete)  
5. 4 exact-slug twins (owner decision)  
6. Photography shoot gaps + blog featured images  
7. Legacy redirect shell HTML still in repo  
8. Inventory/doc drift (mitigated by regenerating inventory in this audit)  
9. Dangerous optional scripts (`phase2:apply`) that re-inject cornerstone  
10. CA screening landing still on older pattern  

---

## Future V3 ideas (**not implemented**)

Documented only — do not build in this phase:

- Full design-system V3 / visual language rewrite  
- App-like patient portal on marketing domain  
- Automated local-page factory for every US city  
- AI chat widget on every page  
- Membership / Siya Circle productization beyond current hop  
- Collapsing `/answers` into `/blog` as a single CMS  
- Removing geo landings in favor of one state page only  
- Dark-mode marketing site  
- Card-heavy dashboard homepage  

---

## Recommended execution order (after human review of this audit)

1. **Approve** Keep / Merge / Redirect decisions in the sitemap inventory  
2. Fix **internal links** to prescriptions + primary + Creyos (low risk)  
3. Update **pricing generator** + About heroes (CTA hierarchy)  
4. Standardize **women’s health** to blueprint  
5. Photography sprint (family medicine, men’s, blog heroes)  
6. Narrow cannibalization Duplicate guides (content, not deletes)  
7. After GSC check: remove legacy **shell HTML** files only  

---

## What this audit intentionally did **not** do

- Delete or merge any live indexable page  
- Redesign Homepage or ADHD Care  
- Change medical claims or pricing numbers  
- Implement V3 ideas  
- Mass image replacement  

---

## Sources used

- Live repo HTML inventory (169 files) + `sitemap.xml` (156)  
- `vercel.json` redirects  
- `docs/WEBSITE-INVENTORY.md` / `data/website-inventory.json` (refreshed)  
- `docs/CONTENT-CONSOLIDATION-PHASE1-REPORT.md`  
- `data/cannibalization-phase1.mjs`  
- `docs/SERVICE-PAGE-BLUEPRINT.md` + recent service-page polish  
- `brand/photography/INVENTORY.md`  
- Build scripts under `scripts/`  

---

*End of audit. Next freeze gate: human sign-off on sitemap inventory decisions, then a scoped execution PR.*
