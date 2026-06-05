# Legal Architecture Hardening Plan

**Goal:** Prepare infrastructure so counsel-approved documents drop in via `legal-document-versions/*.md` without another site redesign.  
**Scope:** Architecture and engineering only — **no lawyer text rewritten**.  
**Plan date:** 2026-06-02  
**Status:** Phase 0 scaffold **implemented** (registry, generator, `/legal/*` stubs, redirects). Phase 1–4 **pending**.

**Related audits:** `LEGAL-COMPLIANCE-GAP-ANALYSIS.md`, `TERMS-OF-USE-GAP-AUDIT.md`, `LEGAL-DRAFT-CONSISTENCY-AUDIT.md`, `LEGAL-ARCHITECTURE-IMPLEMENTATION-PLAN.md`

---

## 1. Executive summary

| Layer | Before | After scaffold (now) | After hardening (target) |
|-------|--------|----------------------|--------------------------|
| Legal URLs | `/terms`, `/privacy-policy` fragments | `/legal/*` stubs + 301 redirects | Counsel markdown → generated HTML |
| Registry | `LEGAL_LINKS` (3 entries, NPP bug) | `data/legal-documents.mjs` (7 docs) | Full footer + intake driven from registry |
| State availability | Hardcoded in footers/copy | `AVAILABLE_SERVICE_STATES` SSOT | Injected on all `/legal/*`; no lists in counsel body |
| Provider licenses | State chips without disclaimer | `PROVIDER_LICENSE_DISCLAIMER` defined | Chips + disclaimer on all provider surfaces |
| Sitewide links | 93 legacy hrefs; 17 false NPP | Validator warns | `site-chrome` emits unified Legal footer |
| Intake clickwrap | None | `requiresAcceptance` flags in registry | GHL config (out of repo) — **not implemented** |

---

## 2. Legal URL architecture

### 2A. Canonical URL map

| Path | Registry slug | Generator output | Legacy redirect |
|------|---------------|------------------|-----------------|
| `/legal` | *(hub)* | `legal/index.html` | — |
| `/legal/terms-of-use` | `terms-of-use` | `legal/terms-of-use/index.html` | `/terms` → 301 |
| `/legal/privacy-policy` | `privacy-policy` | `legal/privacy-policy/index.html` | `/privacy-policy` → 301 |
| `/legal/notice-of-privacy-practices` | `notice-of-privacy-practices` | `legal/notice-of-privacy-practices/index.html` | — |
| `/legal/telehealth-consent` | `telehealth-consent` | `legal/telehealth-consent/index.html` | — |
| `/legal/cookie-policy` | `cookie-policy` | `legal/cookie-policy/index.html` | — |
| `/legal/controlled-substance-policy` | `controlled-substance-policy` | `legal/controlled-substance-policy/index.html` | — |
| `/legal/prescription-policy` | `prescription-policy` | `legal/prescription-policy/index.html` | — |

**Vercel `cleanUrls: true`** serves `legal/terms-of-use/index.html` at `/legal/terms-of-use`.

### 2B. Drop-in content pipeline

```
docs/legal-drafts/          → counsel working captures (partial, not published)
legal-document-versions/    → approved {slug}.md drop-in targets
data/legal-documents.mjs    → metadata: version, effectiveDate, status, requiresAcceptance
scripts/generate-legal-pages.mjs → neutral template + injected states/disclaimer aside
scripts/seo-build.mjs       → (Phase 2) applySiteChrome on legal pages
scripts/validate-legal-links.mjs → CI gate
```

**Content injection marker:** `<!-- SIYA:LEGAL-CONTENT -->` … `<!-- /SIYA:LEGAL-CONTENT -->`

**Rule:** Counsel markdown must **not** hardcode state lists. Generator injects:

- `AVAILABLE_SERVICE_STATES` / `STATES_INLINE` from `data/site-standards.mjs`
- `PROVIDER_LICENSE_DISCLAIMER` on every `/legal/*` page

### 2C. Implemented artifacts (Phase 0)

| File | Purpose |
|------|---------|
| `data/legal-documents.mjs` | Registry (7 documents + hub metadata) |
| `data/site-standards.mjs` | `AVAILABLE_SERVICE_STATES`, `LEGAL_LINKS`, `PROVIDER_LICENSE_DISCLAIMER` |
| `scripts/generate-legal-pages.mjs` | Stub/scaffold generator |
| `scripts/validate-legal-links.mjs` | Link + page existence validator |
| `legal-document-versions/README.md` | Drop-in workflow |
| `legal/**/index.html` | Generated stubs (7 + hub) |
| `vercel.json` | 301 `/terms`, `/privacy-policy` → `/legal/*` |

---

## 3. Sitewide link audit

### 3A. Scan summary (159 HTML files, excludes `public/`)

| Pattern | Count | Severity | Action |
|---------|------:|----------|--------|
| `href="/privacy-policy"` | **93** | High | Replace with `LEGAL_LINKS.privacy` via `site-chrome` |
| `href="/terms"` | **93** | High | Replace with `LEGAL_LINKS.terms` |
| **False NPP** `href="/privacy-policy">Notice of Privacy Practices` | **17** | **Critical** | Point to `LEGAL_LINKS.noticeOfPrivacy` |
| `Terms &amp; Conditions` label | 17 | Medium | Standardize to **Terms of Use** |
| `Terms</a>` (abbreviated) | 69 | Low | Standardize label |
| `Terms of Service` | 7 | Medium | Standardize to **Terms of Use** |
| GHL booking `yourmarketingai.com` | **159** | Info | Intake — clickwrap target |
| LeadConnector `leadconnectorhq.com` | **79** | Info | Chat — Privacy subprocessors |

### 3B. False NPP files (Critical — must fix)

```
about.html
adhd-care.html
adhd-diagnosis-austin.html
adhd-diagnosis-florida.html
adhd-diagnosis-houston.html
adhd-diagnosis-pennsylvania.html
adhd-diagnosis-philadelphia.html
adhd-diagnosis-texas.html
adhd-evaluation-cost.html
adhd-treatment-online.html
adult-adhd-diagnosis.html
creyos-adhd-testing.html
index.html
membership-pricing.html
online-adhd-test.html
telehealth.html
weight-loss-metabolic-health.html
```

**Additional mislabel (not false href, wrong card title):** `about.html` link-card h4 "Notice of Privacy Practices" → `/privacy-policy`.

### 3C. Footer / nav patterns by page class

| Page class | Count | Current Legal footer | Target |
|------------|------:|---------------------|--------|
| Service / conversion (3-link footer) | 17 | Privacy + Terms + **false NPP** | Hub + Terms + Privacy + NPP (4 min) |
| Provider profiles | 8 | Privacy + Terms (2-link) | + NPP + hub link |
| Blog posts | ~60 | Privacy + Terms | Registry-driven block |
| Answers / Health Guides | ~50 | Privacy + Terms | Registry-driven block |
| Legacy legal pages | 2 | `terms.html`, `privacy-policy.html` | Deprecate after redirect cutover |
| **New legal stubs** | 8 | Self-contained | Source of truth template |

### 3D. Code paths emitting legal links

| File | Role | Modification required |
|------|------|----------------------|
| `scripts/site-chrome.mjs` | `normalizeLegalLinks()`, footer injection | **Phase 1:** `renderLegalFooter()` from `LEGAL_LINKS` + registry |
| `data/site-standards.mjs` | `LEGAL_LINKS` SSOT | ✅ Updated |
| `data/legal-documents.mjs` | Document registry | ✅ Created |
| `scripts/seo-build.mjs` | Applies `applySiteChrome` to all HTML | Wire `generate-legal-pages` before seo-build |
| `scripts/generate-provider-pages.mjs` | Provider footer | Use shared legal footer fragment |
| `scripts/generate-answer-pages.mjs` | Answer footer | Use shared legal footer fragment |
| `vercel.json` | Redirects | ✅ Legacy 301 added |
| `netlify.toml` | If used | Mirror redirects |

### 3E. Placeholders and legacy URLs to replace

| Placeholder / legacy | Occurrences | Replacement |
|--------------------|------------|-------------|
| `/terms` hardcoded | 93 files | `LEGAL_LINKS.terms` → `/legal/terms-of-use` |
| `/privacy-policy` hardcoded | 93 files | `LEGAL_LINKS.privacy` |
| NPP → `/privacy-policy` | 17 files | `LEGAL_LINKS.noticeOfPrivacy` |
| `noticeOfPrivacy: '/privacy-policy'` in code | 1 | ✅ Fixed → `/legal/notice-of-privacy-practices` |
| `adhd.siya.health` legal URLs | Rewritten in `normalizeLegalLinks` | Update rewrite targets to new `LEGAL_LINKS` |
| Lawyer draft `(insert link)` | 3 captures | Ops fills when publishing — not in HTML yet |
| `terms.html`, `privacy-policy.html` | 2 files | Retire or replace with redirect-only after cutover |

**Recommended approach:** Do **not** hand-edit 93 files. Add `injectLegalFooter(html)` in `site-chrome.mjs` that regex-replaces Legal `<h4>` blocks and false NPP anchors sitewide during `seo-build`.

---

## 4. Legal source registry

### 4A. `data/legal-documents.mjs` (implemented)

| Field | Purpose |
|-------|---------|
| `slug` | URL segment under `/legal/` |
| `title` | Canonical display name |
| `effectiveDate` | ISO date; `null` until counsel sets |
| `version` | Registry version string |
| `status` | `draft` \| `counsel_review` \| `approved` \| `published` |
| `sourceFile` | `legal-document-versions/{slug}.md` drop-in path |
| `requiresAcceptance` | Intake clickwrap required when `true` |
| `legacyPaths` | 301 sources (terms, privacy) |
| `relatedSlugs` | Hub cross-link graph |

### 4B. Intake acceptance flags (`requiresAcceptance: true`)

| Slug | Why |
|------|-----|
| `terms-of-use` | Master agreement |
| `notice-of-privacy-practices` | HIPAA acknowledgment |
| `telehealth-consent` | Clinical informed consent |

### 4C. Publish gate logic (generator)

| `status` | Generator behavior |
|----------|-------------------|
| `draft` | Stub message even if `.md` exists |
| `counsel_review` | Stub message |
| `approved` / `published` | Render `legal-document-versions/{slug}.md` |

---

## 5. Intake architecture audit

### 5A. Touchpoints map

| Touchpoint | ID / URL | Pages | Data collected | Clickwrap today |
|------------|----------|-------|----------------|-----------------|
| **GHL Meet & Greet** | `link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY` | **159** (nav CTA, heroes, CTAs) | Name, contact, clinical intake (PHI at submit) | **None observed** |
| **GHL Discovery Call** (post-ASRS) | Same form URL | `adhd-screening.html` results step | Screening context + contact | **None** |
| **LeadConnector chat** | `widgets.leadconnectorhq.com` · widget `69be9ab3db1480f6799cdd18` | **79** pages | Chat messages, possibly email/phone | **None** |
| **ADHD screening (ASRS)** | `/adhd-screening` · `asrs-screener.js` | On-site only; no server persist | Local browser scoring only | N/A (no PHI until GHL) |
| **Book appointment page** | `/book-appointment` | Dedicated page → GHL | Scheduling | **None** |

### 5B. ADHD screening flow (step diagram)

```
/adhd-screening
  Step -1: Topic chooser (ADHD | Weight loss | Telehealth)
  Step 0:  ASRS intro ("screening ≠ diagnosis" ✅ on-page)
  Steps 1–6: ASRS questions (client-side only)
  Step 7:  Results + CTA → GHL Discovery Call  ← CLICKWRAP REQUIRED (Phase 3)
```

**Screening consent gap:** No Privacy Policy / Terms acknowledgment before collecting ASRS responses (low risk — local only). **GHL handoff** is the critical consent point.

### 5C. Where clickwrap / consent acknowledgement **should** exist (not implemented)

| Stage | Required acknowledgments | Implementation surface |
|-------|-------------------------|------------------------|
| **GHL form submit** (primary) | Terms of Use + NPP + Telehealth Consent | GHL form checkboxes → `LEGAL_LINKS` URLs |
| **GHL SMS opt-in** (if enabled) | Communications Consent | GHL SMS compliance + `/legal/communications-consent` (30-day doc) |
| **LeadConnector pre-chat** (optional) | Privacy Policy + cookie notice | Widget config or pre-chat banner |
| **Cookie / analytics** (sitewide) | Cookie Policy | Banner → `LEGAL_LINKS.cookie` (blocks non-essential until consent) |
| **ADHD screening → GHL** | Terms + screening≠diagnosis + Telehealth Consent | Bridge copy on results step linking policies before external redirect |

**Registry reference:** `INTAKE_ACCEPTANCE_SLUGS` in `legal-documents.mjs`.

### 5D. GHL configuration checklist (ops — outside repo)

- [ ] Add required checkboxes with links to `/legal/terms-of-use`, `/legal/notice-of-privacy-practices`, `/legal/telehealth-consent`
- [ ] Store consent timestamp in GHL contact record
- [ ] Align form fields with Privacy subprocessors disclosure
- [ ] Document form ID `mnWpgh0IEgFvJymdZqHY` in ops runbook

---

## 6. State availability architecture

### 6A. Single source of truth

```javascript
// data/site-standards.mjs
export const AVAILABLE_SERVICE_STATES = ['California', 'Texas', 'Pennsylvania', 'Florida'];
```

**Aliases:** `LICENSED_STATES` → same array (backward compat during migration).

**Derivations:**

| Export | Use |
|--------|-----|
| `STATES_INLINE` | Prose: "California, Texas, Pennsylvania, and Florida" |
| `STATES_BULLET` | Display: "California • Texas • Pennsylvania • Florida" |
| `FOOTER_STATES_LINE` | Footer marketing line |

### 6B. Configuration-driven legal pages

`generate-legal-pages.mjs` injects on **every** `/legal/*` page:

```html
<aside class="legal-meta">
  <p><strong>Organizational service availability:</strong> {STATES_INLINE}.</p>
  <p>{PROVIDER_LICENSE_DISCLAIMER}</p>
</aside>
```

**Counsel markdown rule:** Never embed state lists in `legal-document-versions/*.md`. Reference "organizational service availability as published on the Legal Hub" if needed.

### 6C. Provider license separation

**Helper copy (SSOT):**

> Provider licenses are displayed for transparency. Service availability is determined by Siya Healthcare, PLLC operational coverage.

### 6D. Pages where provider state chips may be misinterpreted

| Page | Chip content | Misinterpretation risk | Mitigation |
|------|--------------|----------------------|------------|
| `providers/dr-sneh-pandey.html` | CA, TX, PA, FL | Low — matches org footprint | Add disclaimer below chips |
| `providers/dr-natasha-desai.html` | TX, FL | Medium — subset may imply only those states | Disclaimer |
| `providers/derek-timbs.html` | TX, **OH** | **High** — OH is **not** in `AVAILABLE_SERVICE_STATES` | Disclaimer + clarify OH = license only, not service |
| `providers/index.html` (Derek card) | TX, OH | **High** | Same |
| `providers/wendy-delgado.html` | CA | Medium | Disclaimer |
| `providers/megan-wunderlich.html` | PA | Medium | Disclaimer |
| `providers/dr-swati-pandey.html` | PA | Medium | Disclaimer |
| `providers/dr-vanessa-urbina.html` | FL | Medium | Disclaimer |
| `providers/index.html` (hub cards) | Mixed per provider | **High** for OH chip | Hub-level disclaimer |

**Provider generator:** `scripts/generate-provider-pages.mjs` — inject `PROVIDER_LICENSE_DISCLAIMER` under `provider-state-chips` on all profile pages.

**Blog content risk (not chips):** `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` prose lists TX as "primary" and PA/FL — reconcile with 4-state org footprint via `normalizeSitewideCopy`, not provider chips.

---

## 7. Risk matrix

| ID | Risk | Likelihood | Impact | Severity | Mitigation phase |
|----|------|------------|--------|----------|------------------|
| R1 | False NPP links (17 pages) | Certain | HIPAA misrouting | **Critical** | Phase 1 `site-chrome` |
| R2 | 93 legacy legal hrefs break after cutover | High | 404 / user confusion | **High** | Phase 0 redirects ✅ + Phase 1 footer |
| R3 | GHL intake without clickwrap | Certain | Regulatory / board | **Critical** | Phase 3 (GHL config) |
| R4 | GTM/GA/Ads without Cookie Policy live | Certain | CCPA/FTC | **Critical** | Phase 2 publish cookie + banner |
| R5 | Derek OH chip implies OH services | Medium | False availability | **High** | Phase 1 provider disclaimer |
| R6 | Counsel drops states into markdown | Medium | Drift from SSOT | **Medium** | Generator rule + README |
| R7 | `terms.html` / `privacy-policy.html` remain indexed | High | Duplicate content | **Medium** | Phase 2 noindex or remove files |
| R8 | Entity naming (Inc. vs PLLC) | Certain | Confusion | **Medium** | Ops + counsel (not engineering) |
| R9 | Partial lawyer drafts published early | Medium | Incomplete HIPAA/terms | **Critical** | Registry `status` gate |
| R10 | ASRS → GHL without consent bridge | High | FTC/state advertising | **High** | Phase 3 screening results copy + GHL |

---

## 8. Files requiring modification

### 8A. Completed (Phase 0)

- [x] `data/legal-documents.mjs`
- [x] `data/site-standards.mjs`
- [x] `scripts/generate-legal-pages.mjs`
- [x] `scripts/validate-legal-links.mjs`
- [x] `legal-document-versions/README.md`
- [x] `legal/**/index.html` (generated)
- [x] `vercel.json` (legacy redirects)

### 8B. Phase 1 — Link hardening (engineering)

| File | Change |
|------|--------|
| `scripts/site-chrome.mjs` | Add `renderLegalFooter()`, `fixFalseNppLinks()`, update `normalizeLegalLinks()` |
| `scripts/seo-build.mjs` | Call `generate-legal-pages.mjs` early; include `legal/` in sitemap |
| `scripts/generate-provider-pages.mjs` | Inject `PROVIDER_LICENSE_DISCLAIMER` under state chips |
| `package.json` | Add `generate-legal-pages` + `validate-legal-links` to `build` script |
| `netlify.toml` | Mirror redirects if Netlify deploy used |

### 8C. Phase 2 — Counsel drop-in (no rewrite by engineering)

| File | Change |
|------|--------|
| `legal-document-versions/*.md` | Counsel-approved bodies |
| `data/legal-documents.mjs` | Set `effectiveDate`, `version`, `status: published` |
| `docs/legal-drafts/*.md` | Archive reference only |

### 8D. Phase 3 — Intake (ops + light HTML)

| Surface | Change |
|---------|--------|
| GHL form `mnWpgh0IEgFvJymdZqHY` | Required checkboxes (ops) |
| `adhd-screening.html` results block | Policy links before GHL CTA (architecture links only) |
| Cookie consent banner | New component in `site-chrome` (pending Cookie Policy publish) |

### 8E. Phase 4 — Deprecation

| File | Change |
|------|--------|
| `terms.html` | Remove or noindex; redirect handles traffic |
| `privacy-policy.html` | Remove or noindex |
| `about.html` | Fix NPP link-card title + href |

---

## 9. Deployment sequence

```
Phase 0 — Scaffold (DONE)
├── legal-documents.mjs registry
├── AVAILABLE_SERVICE_STATES + LEGAL_LINKS + PROVIDER_LICENSE_DISCLAIMER
├── generate-legal-pages.mjs → /legal/* stubs
├── vercel.json 301 legacy paths
└── validate-legal-links.mjs (warnings baseline)

Phase 1 — Sitewide link hardening (NEXT)
├── site-chrome: unified Legal footer from registry
├── site-chrome: fix 17 false NPP anchors
├── generate-provider-pages: license disclaimer under chips
├── npm run build: wire generator + validator (fail on errors)
└── Deploy → redirects live; footers corrected

Phase 2 — Counsel drop-in
├── Complete lawyer docx → legal-document-versions/*.md
├── Set registry status → published
├── npm run build → full legal HTML
├── Retire terms.html / privacy-policy.html duplicates
└── Deploy → real policies at /legal/*

Phase 3 — Intake & tracking (parallel ops)
├── GHL clickwrap (Terms + NPP + Telehealth)
├── Cookie banner + Cookie Policy published
├── ADHD screening → GHL consent bridge
└── Communications Consent (30-day doc) + GHL SMS

Phase 4 — Validation gate
├── validate-legal-links.mjs → 0 warnings
├── validate-legal-links in CI (fail build)
├── Manual QA: every footer link, every intake path
└── Legal/compliance sign-off before paid marketing
```

### Build pipeline order (target)

```bash
node scripts/generate-legal-pages.mjs
node scripts/generate-answer-pages.mjs
node scripts/generate-provider-pages.mjs
node scripts/seo-build.mjs          # applies site-chrome legal footer
node scripts/validate-legal-links.mjs  # fail on errors
```

---

## 10. Verification checklist

| Check | Command / action | Pass criteria |
|-------|------------------|---------------|
| Legal pages exist | `node scripts/validate-legal-links.mjs` | 0 errors |
| False NPP | validator | 0 warnings |
| Legacy redirect | `curl -I https://www.siya.health/terms` | 301 → `/legal/terms-of-use` |
| Registry SSOT | grep hardcoded state lists in `legal-document-versions/` | 0 state lists in counsel md |
| OH chip | Visual QA `providers/derek-timbs.html` | Disclaimer visible |
| Intake | Manual GHL test submit | Checkboxes enforced |
| Drop-in | Add test md + `status: published` | Generator renders body |

---

## 11. What engineering must NOT do

- Rewrite counsel language in `legal-document-versions/` or `docs/legal-drafts/`
- Hardcode CA/TX/FL/PA inside legal markdown bodies
- Implement GHL clickwrap in repo (GHL admin configuration)
- Infer service states from `providers/*.html` chip data
- Publish registry `status: published` before counsel approval

---

*Architecture plan only. Counsel owns legal text. Ops owns GHL intake configuration.*
