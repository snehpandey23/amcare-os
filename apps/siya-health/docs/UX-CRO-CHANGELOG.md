# UX / CRO Changelog

## Pass 1 — Design System Foundation (2026-06-27)

**Scope:** Foundation only. No HTML page edits. No `styles.css` import. No live visual changes.

### Created

- `design-system/tokens.css` — brand tokens extracted from `styles.css` `:root`
- `design-system/components.css` — `ds-*` BEM components (hero, CTA, FAQ, trust, pricing, etc.)
- `design-system/components.mjs` — build-time HTML render helpers
- `design-system/cta-system.mjs` — CTA slots + page-type rules (homepage, adhd, blog, provider, landing)
- `design-system/page-compositions.mjs` — section recipes per page type
- `design-system/README.md` — component registry + duplicate inventory table

### CTA system codified

| Page type | Primary | Secondary |
|-----------|---------|-----------|
| homepage | Start Secure Medical Chat → Spruce | Schedule Consultation → Carepatron |
| adhd | Take Free ADHD Screening → `/adhd-screening?adhd=1` | Start Secure Medical Chat |
| blog | Start Secure Medical Chat | Get Health Guides → Siya Circle GHL form |
| provider | Schedule Consultation | Start Secure Medical Chat |
| landing | Screening (conversion-specific walkthrough/eval preserved) | — |

### Duplicate patterns inventoried

- `cta-band`: ~70 HTML files + `site-chrome.mjs` + `blog-engagement-components.mjs`
- `faq-accordion`: 17 HTML files + inline scripts per page
- `hero-merged`: 19 HTML files
- `section-header`: 40 HTML files

### Deferred to Pass 2

- `@import` design-system CSS into `styles.css`
- Migrate `site-chrome.mjs` CTA/FAQ blocks to `components.mjs`
- Migrate `generate-provider-pages.mjs` to `renderProviderCard()`
- Replace hand-authored HTML sections with generator output

### Deferred to Pass 3 (CRO)

- Sitewide CTA normalization via `resolveCtasForPath()` in seo-build
- Retire legacy CTA labels in `blog-engagement-components.mjs` `finalCtaBandSection`
- Hero/CTA A/B overrides via composition recipes
- Landing page conversion slot experiments

### Human decisions needed

1. **Class migration strategy:** Dual-class (`hero ds-hero`) — **approved**. No hard cutover.
2. **FAQ script:** Centralize accordion JS — **done** (`scripts/faq-accordion.js` + `injectFaqAccordion()`).
3. **Newsletter label:** **Join Our Health Guide** (microcopy: weekly evidence-based health insights).
4. **Pass 2 import order:** tokens → components → legacy — **wired** at top of `styles.css`.

---

## Version 2 Architecture — conversion + trust engines (2026-06-27)

**Scope:** Platform modules only. No page HTML migration yet.

### Created

- `design-system/conversion-system.mjs` — intent-based CTA resolution (`resolveConversion`)
- `design-system/trust-system.mjs` — trust profiles + `resolveTrust()`
- `data/page-conversion-config.mjs` — per-page conversion goals (config over code)
- `design-system/class-names.mjs` — `dualClass()` for legacy + `ds-*` coexistence
- `design-system/index.mjs` — barrel exports
- `scripts/faq-accordion.js` — single FAQ accordion behavior sitewide

### Architecture (five engines)

| Engine | Module | Status |
|--------|--------|--------|
| Design System | `tokens.css`, `components.css`, `components.mjs` | Foundation |
| CTA System | `cta-system.mjs` | Slot definitions |
| Conversion System | `conversion-system.mjs` + `page-conversion-config.mjs` | **New** |
| Trust System | `trust-system.mjs` | **New** |
| Content System | `site-standards.mjs`, generators | Existing |

### Landing pages

Primary CTA = `conversionGoal` in `page-conversion-config.mjs` (not rigid screening). Example: CA ADHD Ads → screening; future men's health LP → secureChat.

### Next: Component migration (not CRO yet)

Wire `site-chrome.mjs` + generators to `components.mjs` + `resolveConversion()` / `resolveTrust()`.

---

## Component migration shipped (2026-06-27)

### site-chrome.mjs
- Nav CTAs → `renderNavCtaMarkup()` + `resolveNavCtaSlot()`
- FAQ CTAs → `renderFaqCtaInner()` + `injectFaqCtaBlocks()`
- Blog final CTA → `renderBlogFinalCtaSection()`
- Care team cards → `renderAboutTeamCard()` (homepage, about, meet-physicians)
- Telehealth final CTA → `resolveConversion()` + `renderButton()`
- Stripped inline FAQ + header scroll scripts → `faq-accordion.js` + `header-scroll.js`
- Fixed screening label normalization bug (nested "Take Take…")

### blog-engagement-components.mjs
- `finalCtaBandSection()` → delegates to `renderBlogFinalCtaSection(relPath)`

### Duplicate code removed
- `NAV_CTA_PRIMARY` / `NAV_CTA_BOOKING` / `NAV_CTA_SCREENING` constants
- `ADHD_FAQ_CTA` / `TELE_FAQ_CTA` string templates (~30 lines)
- Inline blog final CTA HTML in `normalizeCtaHierarchy` (~15 lines)
- Per-page FAQ accordion inline scripts (17+ pages)
- Per-page header scroll inline scripts (21 pages)
- Hand-built care team card HTML in 3 builders

### Components now reused
- `renderNavCtaMarkup`, `renderFaqCtaInner`, `renderBlogFinalCtaSection`
- `renderAboutTeamCard`, `renderButton`, `slotToButton`
- `resolveConversion`, `resolveNavCtaSlot`, `CTA_SLOTS`

---

## V2 RC1 — Release Candidate (2026-06-06)

### Phase 1 — Component migration (complete)
- `generate-provider-pages.mjs`: nav + index hero CTAs via `renderNavCtaMarkup`, `resolveConversion`, `renderButton` with analytics attrs
- `generate-answer-pages.mjs`: nav + final CTA via design system (`Talk to a Clinician` removed from generated answers)
- Provider profile booking buttons retain `data-provider-cta` (intentional — provider-specific CarePatron `i=` params)

### Phase 2 — Experience optimization
- Homepage hero trust bar synced from `resolveTrust()` via `injectHomepageTrust()`
- Service pages (`adhd-care`, `weight-loss`, `mens-health`, `telehealth`, `pricing`) trust metrics from `injectServiceTrust()`
- Mobile hero padding already standardized via `calc(var(--header-height) + 24px)` in `styles.css`

### Phase 3 — CTA optimization
- Newsletter microcopy: *"Weekly evidence-based health insights from Siya Health physicians."*
- `siya-circle-config.mjs` promo band updated
- Legacy CTA strings normalized at build via `normalizeSitewideCopy` (Meet & Greet, Talk to a Clinician, Join Siya Circle → Join Our Health Guide in CTAs)

### Phase 4 — Trust
- `injectHomepageTrust()` + `injectServiceTrust()` in `site-chrome.mjs`
- Google Ads LP trust strip via existing `injectLandingTrust()`

### Phase 5 — Google Ads LP
- `adult-adhd-screening-california.html` in design system; screening-first funnel preserved

### Phase 6 — Analytics
- `ctaTrackingAttrs()` emits `data-page-type`, `data-intent`, `data-conversion-goal`, `data-cta-slot`, `data-component`
- Wired through `renderButton`, `slotToButton`, `renderNavCtaMarkup`, generators

### Phase 7 — QA
- Build: PASS (148 HTML, all validators)
- No `Talk to a Clinician` in built HTML
- Answer pages: design-system final CTA with tracking attrs
- Provider index: full analytics attrs on nav + hero CTAs
- SEO: sitemap 140 URLs, Phase 7 validation PASS, 1 missing canonical (pre-existing utility page)

### Deploy
- Production deploy via `npx vercel deploy --prod --yes`

### V3 backlog (low priority)
- Migrate ~70 hand-authored `cta-band` blocks in source HTML to `renderCtaBlock()`
- Homepage hero CTA: add full analytics attrs + correct `data-siya-location`
- Answer engagement system copy still references "Talk to a Clinician" in generator source (build normalizes output)
- Provider data subtitles in `providers-additional.mjs` — update to "Schedule Consultation" wording
- Women's health page audit (if not yet in design system scope)


**Note:** This work ran in parallel with Pass 1. It changed live page output via `site-chrome.mjs` / `seo-build` but did **not** wire `design-system/` imports or `components.mjs` renderers.

### Shipped

- Mobile header: compact logo (40/48px), 56px bar, blur sticky, `scripts/header-scroll.js`
- CTA normalization: Spruce primary, Schedule Consultation secondary, ADHD screening label standardization
- `normalizeCtaUrls()` + `injectHeaderScroll()` in `site-chrome.mjs`
- Google Ads LP: redundant mid-page screening CTAs removed; header/footer chat aligned
- Homepage hero/nav/sticky → Start Secure Medical Chat
- Newsletter buttons → Get Health Guides
- `npm run build` PASS (148 HTML files)

### Still requires Pass 2

- `@import` `design-system/tokens.css` + `components.css` into `styles.css`
- Migrate `site-chrome.mjs` / generators to `components.mjs` (replace regex CTA patches)
- Retire duplicate inline header scroll scripts (~15 pages)
