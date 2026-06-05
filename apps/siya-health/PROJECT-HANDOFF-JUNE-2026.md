# Siya Health Website — Project Handoff (June 2026)

**Repo path:** `apps/siya-health`  
**Production domain:** `https://siya.health`  
**Last validated build:** June 5, 2026 — `npm run build` **PASS**

Paste this document into a new ChatGPT session as project memory. Do not assume prior chat context.

---

# 1. Executive Summary

## Business model

Siya Health is a **multi-state telehealth practice** focused on **adult ADHD evaluation and ongoing care**, with expanding lines in **medical weight loss (GLP-1)**, **men's health / testosterone**, and **membership-style primary care**. Patient acquisition flows through:

- Free ADHD screening (ASRS) → evaluation ($199) → ongoing care / membership
- Meet & Greet discovery calls → GHL booking form
- SEO content (Health Guides, blog, geo pages) → conversion CTAs

Booking/intake runs through **GoHighLevel (GHL)** / LeadConnector widgets — not on-site PHI collection.

## Entity structure (critical)

| Entity | Role |
|--------|------|
| **Siya Health Inc.** | Administrative, marketing, website, non-clinical support |
| **Siya Healthcare, PLLC** | Clinical entity — licensed clinicians deliver medical services |

**Canonical statement (required on legal surfaces):**

> Siya Health Inc. provides administrative and non-clinical support services. Medical services are provided by Siya Healthcare, PLLC through licensed clinicians.

## Service footprint (organizational — NOT provider license union)

Siya Healthcare, PLLC offers telehealth only in:

- **California**
- **Texas**
- **Pennsylvania**
- **Florida**

Provider licenses displayed for **transparency**; they do **not** expand service geography.

## Provider roster (7)

| Provider | Role summary |
|----------|----------------|
| Dr. Sneh Pandey, MD | Medical Director — ADHD, metabolic, obesity |
| Dr. Natasha Desai, MD | Family/behavioral medicine — ADHD (TX, FL) |
| Dr. Swati Pandey, MD | ADHD + mental health overlap — PA (not psychiatry) |
| Dr. Vanessa Urbina, MD | Primary care / DPC owner — FL |
| Megan Wunderlich, FNP-C | Pittsburgh / PA — ADHD + mental health |
| Derek Timbs, FNP-BC | Men's health, obesity, fitness — **TX service only** |
| Wendy Delgado, PA-C | California — weight loss / metabolic |

## Growth goals

1. **ADHD remains primary acquisition channel** (screening → $199 evaluation → care)
2. **Weight loss / GLP-1** — second revenue line (TX, CA leads)
3. **Men's health / testosterone** — Derek-led (TX)
4. **Membership primary care** — DPC model (Vanessa Urbina in-person + telehealth expansion)
5. **Metabolic health** — insulin resistance, food noise, fatigue crossover content
6. **California expansion** — geo SEO, CA-licensed clinicians (Sneh, Wendy)

---

# 2. Current Website Status

## Production architecture

| Layer | Technology |
|-------|------------|
| Site | Static HTML + CSS + vanilla JS (no React app shell) |
| Build | Node.js scripts (`npm run build` in `package.json`) |
| Deploy | **Vercel** (`vercel.json`, `cleanUrls: true`) |
| Booking | GHL form `mnWpgh0IEgFvJymdZqHY` via `link.yourmarketingai.com` |
| Chat | LeadConnector widget `69be9ab3db1480f6799cdd18` |
| Analytics | GTM `GTM-PLBD4TTQ`, GA4 `G-9WTQWHCTFT`, Google Ads `AW-17553537456` |

**Source of truth files:**

- Providers: `data/providers.mjs`, `data/providers-additional.mjs`, `data/internal-provider-records.mjs`
- Legal registry: `data/legal-documents.mjs` → `legal-document-versions/*.md`
- Site standards: `data/site-standards.mjs`
- Chrome injection: `scripts/site-chrome.mjs` (applied by `scripts/seo-build.mjs` on every HTML file)

**⚠️ Note:** `vercel.json` `buildCommand` is **older/shorter** than `package.json` `build`. Local/CI should use `npm run build`. Align Vercel build command before production deploy.

## Latest validated metrics (June 5, 2026)

| Metric | Value |
|--------|------:|
| HTML pages | **166** |
| Sitemap URLs | **164** |
| Health Guide answer pages | **65** + index |
| Blog articles | **~60** |
| Provider pages | **7** + index |
| Broken internal links | **0** |
| JSON-LD parse errors | **0** |
| Duplicate title tags | **0** |
| Duplicate H1s | **0** |
| `npm run build` | **PASS** |
| Safe to commit (engineering) | **Yes** |
| Safe to deploy (engineering) | **Yes** — GHL ops verification still pending |

## Internal linking

- Audit: `data/internal-link-audit.json` (166 pages scanned)
- Zero-inbound pages: `/intake`, legacy `/privacy-policy`, `/terms` (redirect stubs)
- Cannibalization Phase 1 applied; cornerstone protection in place

## Provider directory

- Generated pages: `providers/*.html` via `scripts/generate-provider-pages.mjs`
- Index: `/providers`
- Entity graph: `data/entity-graph.json` (schema + reviewer ownership)
- AI indexes: `llms.txt`, `llms-full.txt`, `provider-index.json`

## Legal stack

5 published documents at `/legal/*` (see Section 5). Validators: `validate-legal-links.mjs`, `validate-deployment-hardening.mjs`, `validate-ghl-legal-acceptance.mjs`.

---

# 3. Provider Directory Status

## Architecture: `serviceStates` vs `licenseStates`

```javascript
// data/providers.mjs
providerServiceStates(provider) =
  provider.statesLicensed.filter(state => AVAILABLE_SERVICE_STATES.includes(state))
```

- **`statesLicensed`** — all licenses held (displayed on profile chips for transparency)
- **`serviceStates`** — intersection with `AVAILABLE_SERVICE_STATES` only; used in JSON-LD `areaServed`
- **Disclaimer:** `PROVIDER_LICENSE_DISCLAIMER` in `data/site-standards.mjs`

---

### Dr. Sneh Pandey, MD

| Field | Value |
|-------|-------|
| **Credentials** | MD; Board Certified **Internal Medicine (ABIM)**; **Obesity Medicine (ABOM)**; **ADHD-CCSP** |
| **Role** | **Medical Director** |
| **Positioning** | Founder-led adult ADHD + metabolic/weight overlap; primary care–led, not psychiatry |
| **License states displayed** | CA, TX, PA, FL |
| **Service states** | CA, TX, PA, FL |
| **photoStatus** | `approved` |
| **credentialStatus** | Listed from practice records; per-state verification pending |

---

### Dr. Natasha Desai, MD

| Field | Value |
|-------|-------|
| **Credentials** | MD; Family & Behavioral Medicine; **ADHD-CCSP** |
| **Positioning** | Family medicine + ADHD; anxiety/emotional dysregulation overlap — **not psychiatry practice** |
| **License states displayed** | TX, FL |
| **Service states** | TX, FL |
| **photoStatus** | `approved` |

---

### Dr. Swati Pandey, MD

| Field | Value |
|-------|-------|
| **Credentials** | MD; **ADHD-CCSP** |
| **Positioning** | ADHD + mental health overlap (depression, anxiety, complex med histories) — **explicitly NOT psychiatry positioning** |
| **License states displayed** | PA |
| **Service states** | PA |
| **photoStatus** | `approved` |

---

### Dr. Vanessa Urbina, MD

| Field | Value |
|-------|-------|
| **Credentials** | MD; Family Medicine |
| **Positioning** | **Primary care / DPC owner**; in-person clinic owner; Florida telehealth ADHD + lifestyle medicine |
| **License states displayed** | FL |
| **Service states** | FL |
| **photoStatus** | `pending` (placeholder on site) |

---

### Megan Wunderlich, FNP-C

| Field | Value |
|-------|-------|
| **Credentials** | MSN, APRN, FNP-C |
| **Positioning** | **Pittsburgh / Pennsylvania** — NP-led ADHD support, mental health, family medicine; collaborative practice |
| **License states displayed** | PA |
| **Service states** | PA |
| **photoStatus** | `pending` |
| **NPI** | 1629930532 |

---

### Derek Timbs, FNP-BC

| Field | Value |
|-------|-------|
| **Credentials** | MSN, FNP-BC |
| **Positioning** | **Men's health**, obesity, fitness-oriented metabolic care; GLP-1 + testosterone monitoring |
| **License states displayed** | TX, **OH** (Ohio = license transparency only) |
| **Service states** | **TX only** |
| **photoStatus** | `pending` |
| **NPI** | 1609886910 |

**Historical fix (do not regress):** Site previously implied Ohio service availability via Derek prose/JSON-LD. Fixed June 2026. Ohio must never appear in `serviceStates` or `areaServed`.

---

### Wendy Delgado, PA-C

| Field | Value |
|-------|-------|
| **Credentials** | PA-C; NCCPA Certified |
| **Positioning** | **California** medical weight loss / GLP-1 telehealth support |
| **License states displayed** | CA |
| **Service states** | CA |
| **photoStatus** | `pending` |
| **NPI** | 1063725059 |
| **Note** | Additional licenses may exist operationally — **not used for service expansion** on site |

---

# 4. ADHD Positioning Rules (Critical)

Canonical blocks live in `data/site-standards.mjs` → `ADHD_POSITIONING`. Enforced by `scripts/apply-adhd-positioning-hardening.mjs` + `validate-deployment-hardening.mjs`.

## Approved positioning

| Rule | Status |
|------|--------|
| Primary care–led ADHD evaluation | **Required** |
| NOT a psychiatry practice | **Required** |
| NOT a psychology practice | **Required** |
| Screening ≠ diagnosis | **Required** |
| No guaranteed diagnosis | **Required** |
| No guaranteed medication | **Required** |
| No guaranteed stimulant prescribing | **Required** |

## Approved evaluation workflow

1. Initial intake / evaluation visit
2. Objective testing when clinically required (clinician-selected)
3. Record collection and review
4. Clinical correlation of all findings
5. Diagnostic determination (if criteria met)
6. Treatment planning
7. Controlled-substance consideration **only if clinically appropriate**
8. **Follow-up prescribing visit** — controlled substances are **NOT** prescribed during the initial evaluation

Documented in `/legal/controlled-substance-treatment-agreement` → **Controlled Substance Evaluation Process** section.

## Assessment tools (individualized — no fixed battery)

Tools may include **ASRS, DIVA, Wender Utah Rating Scale, SWAN, Creyos** — clinician-selected per presentation.

**Approved language:**

- "Validated assessment tools as clinically appropriate"
- "Your clinician may use one or more validated assessment tools"
- "Assessment tools support clinical evaluation but do not independently establish a diagnosis"

**Forbidden:**

- Implying every patient receives ASRS + DIVA + Wender Utah + SWAN + Creyos
- "Complete neurocognitive battery for every patient"
- Screening tool result = diagnosis

---

# 5. Legal & Compliance Status

## Published documents (5)

| Document | URL | Source | Acceptance |
|----------|-----|--------|------------|
| Terms of Use | `/legal/terms-of-use` | Counsel markdown | Required (GHL) |
| Privacy Policy | `/legal/privacy-policy` | Counsel markdown | Acknowledgment |
| Notice of Privacy Practices | `/legal/notice-of-privacy-practices` | Counsel markdown | Required (GHL) |
| Controlled Substance Treatment Agreement | `/legal/controlled-substance-treatment-agreement` | Operations markdown | Required (ADHD CS workflows) |
| Cookie Policy | `/legal/cookie-policy` | Operations markdown | Banner acknowledgment |

**Effective date:** **October 31, 2025** (`LEGAL_EFFECTIVE_DATE` in `data/legal-documents.mjs`)

**Do not change** counsel body text in `legal-document-versions/terms-of-use.md`, `privacy-policy.md`, `notice-of-privacy-practices.md`.

## Planned (registry only — NOT published)

- Telehealth Informed Consent
- Controlled Substance Policy (separate from Treatment Agreement)
- Prescription Policy

## Cookie / tracking compliance

| Item | Implementation |
|------|----------------|
| Cookie Policy page | `/legal/cookie-policy` |
| Cookie banner | `scripts/cookie-notice.js` — non-blocking, localStorage `siya_cookie_notice_accepted` |
| GTM | `GTM-PLBD4TTQ` |
| GA4 | `G-9WTQWHCTFT` |
| Google Ads | `AW-17553537456` |
| LeadConnector/GHL | Disclosed in Cookie Policy; chat widget sitewide |
| CMP claim | **None** — site explicitly does NOT claim full consent-management platform |

## Legal architecture

```
data/legal-documents.mjs          ← registry (published vs planned)
legal-document-versions/*.md      ← counsel/ops source text
scripts/generate-legal-pages.mjs  ← generates /legal/*/index.html
data/site-standards.mjs           ← LEGAL_LINKS, entity statement, footer
scripts/site-chrome.mjs           ← footer legal links, normalization
scripts/validate-legal-links.mjs  ← CI gate
```

Entity block injected on legal hub + all published legal pages (template aside, outside counsel body).

---

# 6. GHL Compliance Status

## Site-side (engineering complete)

| Feature | File / mechanism |
|---------|----------------|
| Terms checkbox gate | `scripts/ghl-legal-acceptance.js` |
| Privacy checkbox gate | Same modal |
| NPP checkbox gate | Same modal |
| Timestamp capture | URL param `legal_acceptance_timestamp` |
| Source page capture | URL param `legal_acceptance_source` |
| Version capture | URL param `legal_document_version` |
| Boolean flags | `legal_acceptance_terms`, `_privacy`, `_npp` |
| ADHD disclaimer variant | Extended copy on ADHD funnel pages |
| Intake hub | `/intake` — on-page acceptance + GHL iframe |
| Config | `data/ghl-intake-config.mjs` |

**GHL form ID:** `mnWpgh0IEgFvJymdZqHY`  
**Booking URL:** `https://link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY`

692 GHL booking links across 159 pages — all gated after build.

## Pending (operations)

- [ ] Map hidden fields → GHL contact custom fields
- [ ] Verify persistence through workflows / pipelines / appointment automations
- [ ] LeadConnector chat widget — add Terms/Privacy/NPP checkboxes in chat funnel
- [ ] ADHD controlled-substance forms — add **Controlled Substance Treatment Agreement** checkbox in GHL (site links only today)
- [ ] End-to-end test: submit form → confirm contact record fields in GHL

**Docs:** `docs/GHL-LEGAL-ACCEPTANCE-IMPLEMENTATION-REPORT.md`, `docs/GHL-CHECKWRAP-IMPLEMENTATION-LOG.md`, `docs/GHL-LEGAL-ACCEPTANCE-AUDIT.json`

---

# 7. State Availability Rules (Critical)

## Organizational service states ONLY

```
California | Texas | Pennsylvania | Florida
```

Defined in `AVAILABLE_SERVICE_STATES` (`data/site-standards.mjs`).

## Provider licenses ≠ service geography

- Display licenses on provider chips for **credential transparency**
- `providerServiceStates()` filters to `AVAILABLE_SERVICE_STATES` only
- JSON-LD `areaServed` uses `serviceStates`, never raw license union

## Derek Timbs / Ohio (historical example)

**Wrong (fixed):** "Telehealth in Texas and Ohio" / `areaServed: Ohio`  
**Correct:** License chip shows OH; prose says **Texas service only**; `serviceStates: ["Texas"]`

Validators in `validate-deployment-hardening.mjs` enforce this.

## Wendy / additional licenses

Additional state licenses must **not** be added to `AVAILABLE_SERVICE_STATES` or marketing copy without explicit operational approval.

---

# 8. SEO & Content Status

## Health Guides (`/answers`)

- **65 answer pages** generated from `data/answer-seeds.mjs` via `scripts/generate-answer-pages.mjs`
- Nav label: **Health Guides** (URL stays `/answers` for SEO)
- Format: FAQ schema, physician-review badges, related guides, GHL CTAs

## Cornerstone service pages

- `/adhd-care` — primary ADHD hub
- `/adhd-screening` — ASRS screener (`asrs-screener.js`)
- `/weight-loss-metabolic-health`
- `/mens-health-longevity`
- `/telehealth`
- `/membership-pricing`
- `/primary-urgent-care`

## Geo / funnel pages

- State ADHD pages: TX, FL, PA, Philadelphia, Houston, Austin, etc.
- Shadow pages generated by `scripts/generate_seo_shadow_pages.py`

## Blog (`/blog`)

- **~60 articles** in clusters: ADHD, weight loss, telehealth
- Category hubs: `/blog/adhd`, `/blog/weight-loss`, `/blog/telehealth`, `/blog/all`
- Medication education posts (non-guarantee language required)

## Content clusters

| Cluster | Examples |
|---------|----------|
| ADHD | Evaluation, screening, medication education, geo diagnosis |
| Weight Loss | GLP-1, semaglutide, tirzepatide, food noise, phentermine |
| Metabolic Health | Insulin resistance, A1C, metabolic overlap |
| Hormones | Testosterone, TRT monitoring, men's health |
| Fatigue | Sleep apnea overlap, tired-after-sleeping guides |
| Telehealth | Legitimacy, prescriptions, meet-and-greet expectations |

## Authority-building strategy

1. **Provider-attributed content** — `data/entity-graph.json` reviewer ownership by topic
2. **E-E-A-T provider pages** — credentials, state scope, structured JSON-LD Physician/ProfilePage
3. **Internal linking** — service ↔ blog ↔ answers ↔ providers (audit-driven)
4. **AI discoverability** — `llms.txt`, `llms-full.txt`, structured indexes
5. **Cannibalization control** — Phase 1 duplicate-pair management; cornerstone protection
6. **California growth** — CA geo blogs, Wendy Delgado weight line, Sneh CA license

---

# 9. Remaining Open Items

## Operational

- [ ] GHL field persistence verification (see Section 6)
- [ ] Headshot replacements: Vanessa, Megan, Derek, Wendy (`photoStatus: pending`)
- [ ] Credential backfill / per-state license documentation
- [ ] Align `vercel.json` buildCommand with full `package.json` build
- [ ] Provider sign-off artifacts (testimonials marked `needsVerification: true`)
- [ ] Controlled Substance Agreement checkbox in GHL ADHD CS intake

## Marketing

- [ ] Provider authority expansion (more reviewer attribution on high-traffic guides)
- [ ] Backlink / digital PR campaign
- [ ] Local SEO (Philadelphia, Houston, Austin, CA metros)
- [ ] California patient acquisition push
- [ ] Membership program launch marketing (when ops-ready)

## Compliance

- [ ] GHL ops sign-off on clickwrap field mapping
- [ ] Counsel review of Cookie Policy + CS Treatment Agreement (operations-published)
- [ ] Planned policies still unpublished: Telehealth Consent, Prescription Policy, standalone CS Policy
- [ ] Risk acceptance if deploying before GHL ops verification complete

---

# 10. Recommended Next 30 Days

Ranked by revenue impact:

1. **Patient acquisition** — ADHD screening → evaluation funnel; paid + organic to GHL; fix any GHL workflow drop-off
2. **Provider authority expansion** — attach named clinicians to top 20 traffic pages; complete pending headshots
3. **Local SEO** — PA/TX/FL/CA geo page refresh + Google Business Profile alignment
4. **Weight loss growth** — GLP-1 content → Derek (TX) + Wendy (CA) booking paths
5. **Testosterone growth** — men's health cluster → Derek TX funnel
6. **Membership program** — `/membership-pricing` + Vanessa DPC narrative when ready
7. **Credential polish** — license verification docs, NPI consistency, photo approvals

---

# 11. Things Future Chats Must NOT Break

Hard rules — violations have caused prior compliance sprints:

| # | Rule |
|---|------|
| 1 | **Do not** reintroduce psychiatry or telepsychiatry **practice** positioning |
| 2 | **Do not** imply provider license states expand Siya service states |
| 3 | **Do not** claim stimulants or controlled substances are guaranteed |
| 4 | **Do not** claim diagnosis guarantees medication |
| 5 | **Do not** remove or weaken Inc./PLLC entity separation language |
| 6 | **Do not** alter lawyer-approved Terms, Privacy, or NPP body text |
| 7 | **Do not** change legal effective date from **October 31, 2025** without counsel |
| 8 | **Do not** replace individualized assessment language with fixed tool bundles |
| 9 | **Do not** list Ohio, New York, or other non-service states as Siya service geography |
| 10 | **Do not** claim screening tools are diagnostic |
| 11 | **Do not** state controlled substances are prescribed at initial evaluation |
| 12 | **Do not** claim the site has a full CMP unless one is actually implemented |
| 13 | **Do not** regenerate answer/provider pages before final `seo-build.mjs` in build pipeline |
| 14 | **Do not** delete `scripts/ghl-legal-acceptance.js` or bypass GHL clickwrap |

## Safe edit zones

- Marketing copy on service/blog pages (within positioning rules above)
- `data/providers-additional.mjs` prose (preserve serviceStates logic)
- Operations legal docs: CS Treatment Agreement, Cookie Policy
- SEO metadata, internal links, schema (validate with `npm run build`)

## Key commands

```bash
cd apps/siya-health
npm run build
node scripts/validate-legal-links.mjs
node scripts/validate-deployment-hardening.mjs
node scripts/validate-ghl-legal-acceptance.mjs
```

## Key report paths

- `docs/FINAL-PREDEPLOY-COMPLIANCE-REPORT.md`
- `docs/ADHD-COMPLIANCE-CHANGES.md`
- `docs/DEPLOYMENT-RISK-HARDENING-FIX-REPORT.md`
- `docs/GHL-CHECKWRAP-IMPLEMENTATION-LOG.md`
- `SEO-DEPLOYMENT-QA-REPORT.md`

---

*End of handoff document.*
