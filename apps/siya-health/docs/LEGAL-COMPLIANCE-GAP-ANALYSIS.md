# Legal, Compliance, and Policy Architecture Gap Analysis

**Practice:** Siya Health — multi-state telehealth (ADHD, weight loss/obesity medicine, men's health, women's health, primary care)  
**Site audited:** `apps/siya-health/` (159 HTML URLs in sitemap; production target `https://siya.health`)  
**Audit date:** 2026-06-02  
**Auditor scope:** Policy document inventory, sitewide marketing compliance patterns, governance code review  
**Production code modified:** None (documentation only)

---

## Audit framework

### Medical Compliance in Marketing SOP v1.0

**Status: NOT FOUND in repository.** Searched `amcare-os` (including `apps/siya-health/`, `apps/siya-health-rewrite/`, agent transcripts). The SOP was referenced as an attachment but is not version-controlled.

**Interim framework used for this audit** — aligned with standard telehealth marketing compliance SOP pillars typically covering:

| SOP pillar | Audit application |
|------------|-------------------|
| Claim substantiation | Volume metrics, ratings, outcomes, provider volume claims |
| Fair balance / risk disclosure | GLP-1, stimulants, testosterone, ED meds |
| HIPAA / PHI in marketing | Privacy policy accuracy vs booking/analytics reality |
| FTC endorsements & testimonials | "Verified Patient," HelloKlarity linkage, paid/sponsored disclosure |
| FDA drug advertising | Branded/compounded GLP-1, semaglutide/tirzepatide content |
| DEA / Ryan Haight | ADHD stimulant marketing without controlled-substance policy |
| State board / telehealth | Licensed states, informed consent, patient relationship |
| Physician review of marketing | Clinical review registry, pending badges |
| Screening vs diagnosis | ASRS screener boundaries |
| Before/after restrictions | Weight-loss imagery and outcome narratives |
| Tracking consent | GTM, Google Ads, cookies without policy |
| TCPA / CAN-SPAM | Lead forms, SMS automation (GHL widget) |
| Accessibility | ADA/WCAG public statement |
| Editorial transparency | Internal docs vs public policy |

**Recommendation:** Add `docs/MEDICAL-COMPLIANCE-IN-MARKETING-SOP-v1.0.md` (or PDF in `docs/legal/`) to the repo and re-run this audit against explicit checklist IDs.

---

## Executive summary

| Metric | Finding |
|--------|---------|
| Standalone governance documents present | **2 of 16** (fragmentary Terms, fragmentary Privacy) |
| Average completeness (all 16 types) | **~14 / 100** |
| Average legal risk (inverse: higher = worse) | **~72 / 100** |
| Marketing compliance score (sitewide) | **~48 / 100** |
| Pages with physician-reviewed badge | **0** (120 pending — correct gate) |
| Pages with blog/educational disclaimer | **127** (blogs/answers strong) |
| Service/marketing pages missing medical disclaimer | **~32** (home, ADHD care, weight loss, membership, providers, etc.) |
| Cookie/tracking without Cookie Policy | **159 / 159** pages (GTM + GA + Google Ads) |
| **Deploy readiness (legal/compliance)** | **NOT SAFE** — HIPAA NPP, telehealth consent, cookie policy, and substantiated marketing claims are blocking |

---

## Sitewide marketing compliance scan

Automated pattern scan across 159 HTML files (excludes `public/` duplicate tree):

| Signal | Count | SOP concern |
|--------|------:|-------------|
| `blog-disclaimer` or educational-only language | 127 | Strong on blogs/answers; absent on conversion pages |
| Pending physician review badge | 120 | Good interim gate; no public Clinical Review Policy |
| Physician reviewed badge | 0 | Registry empty (`CLINICAL_REVIEW_APPROVED`) — appropriate |
| Footer 911 emergency line | 158 | Partial emergency disclaimer only |
| 988 crisis line | 2 | Insufficient for mental health marketing |
| HIPAA mentioned | 47 | Marketing trust bar ≠ HIPAA NPP |
| "Verified" testimonial language | 4 | FTC endorsement risk without substantiation |
| Stimulant/controlled-substance content | 77 | No standalone Controlled Substance Policy |
| GLP-1 / semaglutide content | 52 | Variable fair balance; no sitewide Rx module |
| Testosterone / TRT content | 59 | No men's-health Rx advertising policy |
| Compounded drug mentions | 28 | Needs pharmacy sourcing disclosure policy |
| Cookie Policy page | 0 | GTM on every page |
| Telehealth informed consent (standalone) | 0 | 20 pages mention consent in prose only |
| LegitScript seal | 24 | Good; needs Advertising Compliance doc linkage |

---

## Document-by-document audit

Scoring key:

- **Completeness (0–100):** Coverage vs expected telehealth practice governance document (sections, enforceability, cross-links).
- **Legal risk (0–100):** Higher = greater exposure (regulatory, litigation, board complaint). 100 = severe gap.
- **Marketing compliance (0–100):** Higher = better alignment with Medical Compliance in Marketing SOP pillars. N/A where document is purely legal infrastructure.
- **Regulatory relevance:** High / Medium / Low / N/A

| # | Document | Exists? | URL | Word count | Last updated | Completeness | Legal risk | Marketing compliance | HIPAA | FDA | FTC | DEA | State board |
|---|----------|---------|-----|------------|--------------|-------------:|------------:|---------------------:|-------|-----|-----|-----|-------------|
| 1 | Terms of Use | **Y** (partial) | `/terms` | ~256 | **Not stated** | 12 | 78 | N/A | Low | Low | Med | Low | **High** |
| 2 | Privacy Policy | **Y** (partial) | `/privacy-policy` | ~249 | **Not stated** | 15 | 85 | N/A | **High** | Low | **High** | Low | Med |
| 3 | HIPAA Notice of Privacy Practices | **N** | — (mis-mapped to `/privacy-policy` in `site-standards.mjs`) | 0 | — | 0 | **95** | N/A | **High** | N/A | Med | N/A | **High** |
| 4 | Medical Disclaimer | **Partial** | Embedded on blogs/answers only | ~40 avg | Rolling | 35 | 65 | 55 | Med | Med | Med | Low | Med |
| 5 | Telehealth Consent | **N** | — | 0 | — | 0 | **90** | 20 | **High** | Low | Low | Med | **High** |
| 6 | Controlled Substance Policy | **N** | — | 0 | — | 0 | **92** | 15 | Med | Med | Med | **High** | **High** |
| 7 | Prescription Policy | **N** | `/prescriptions` is a **marketing landing page** ("coming soon"), not a policy | ~180 (marketing) | — | 5 | 80 | 25 | Med | **High** | Med | **High** | **High** |
| 8 | Emergency Care Disclaimer | **Partial** | Footer sitewide (`footer-notice`) | ~25 | Static | 40 | 55 | 50 | Low | N/A | Low | N/A | Med |
| 9 | Patient Relationship Disclaimer | **Partial** | Buried in Terms card | ~30 | — | 10 | 70 | 40 | Med | Low | Low | Low | **High** |
| 10 | Refund / Cancellation Policy | **N** | Marketing only ("Cancel Anytime" on `/membership-pricing`) | 0 | — | 5 | 75 | 35 | Low | N/A | **High** | N/A | Med |
| 11 | Cookie Policy | **N** | — | 0 | — | 0 | **88** | N/A | Low | N/A | **High** | N/A | Low |
| 12 | SMS / Email Consent | **N** | — | 0 | — | 0 | **85** | N/A | Med | N/A | **High** | N/A | Med |
| 13 | Accessibility Statement | **N** | — | 0 | — | 0 | 60 | N/A | Low | N/A | Low | N/A | Low |
| 14 | Editorial Standards | **Internal only** | `docs/PROVIDER-PUBLISHING-MINIMUMS.md`, `data/content-review-registry.mjs` | ~1,200 (internal) | 2026-06 | 25 (public) | 50 | 45 | Low | Med | Med | Low | Med |
| 15 | Clinical Review Policy | **Internal only** | Governance in code; badge on 120 pages | 0 public | 2026-06 | 20 | 55 | 50 | Low | Med | Med | Low | Med |
| 16 | Advertising Compliance | **Partial** | LegitScript seal + blog disclaimers; no policy page | 0 | — | 15 | 70 | 40 | Med | **High** | **High** | **High** | **High** |

---

## Per-document findings

### 1. Terms of Use (`/terms`)

**Exists:** Y (webpage fragment, not governance-grade)

**Content today:** Two cards — "Use of Website" and "Medical Services" (~4 sentences total). Hero includes marketing CTAs and trust bar ("1,000+ Adults Evaluated," "$199 Transparent Pricing") inappropriate for legal pages.

**Gaps vs SOP / telehealth standard:**

- No governing law / venue
- No limitation of liability
- No intellectual property
- No dispute resolution
- No telehealth-specific terms (modality limits, state eligibility, technology failures)
- No controlled substance / prescribing limitations
- No account termination
- No third-party links (HelloKlarity, GHL booking, LegitScript)
- No effective date or version history

### 2. Privacy Policy (`/privacy-policy`)

**Exists:** Y (critically incomplete)

**Content today:** Claims "This website does not collect protected health information (PHI)" while site routes users to external booking/intake (GHL `link.yourmarketingai.com`) and runs GTM/GA/Ads. No CCPA/state privacy rights, retention, breach notification, subprocessors, or children's privacy.

**Code conflict:** `data/site-standards.mjs` maps `noticeOfPrivacy` → `/privacy-policy`, conflating website privacy with HIPAA NPP.

### 3. HIPAA Notice of Privacy Practices

**Exists:** N — **critical gap** for a covered-entity telehealth practice collecting PHI via intake.

**Required elements absent:** Uses/disclosures, patient rights (access, amendment, accounting), complaint process (OCR), effective date, covered entity contact, minimum necessary, psychotherapy notes, marketing restrictions on PHI.

### 4. Medical Disclaimer

**Exists:** Partial — strong on `/blog/*` and `/answers/*` (`blog-disclaimer`, "educational only"); **missing** on high-intent service pages:

- `/` (homepage)
- `/adhd-care`
- `/weight-loss-metabolic-health`
- `/mens-health-longevity`
- `/membership-pricing`
- `/providers/*`
- `/telehealth`

### 5. Telehealth Consent

**Exists:** N as standalone informed-consent artifact.

**Risk:** Multi-state practice (CA, TX, PA, FL per `site-standards.mjs`) requires documented telehealth consent before clinical encounter — modality limits, privacy/security, prescribing limits, follow-up obligations, recording policy.

### 6. Controlled Substance Policy

**Exists:** N — while site markets ADHD medication management and 77 pages reference stimulants/Schedule II.

**SOP flags:** Ryan Haight Act, state PDMP, in-person exam requirements, refill policies, no guaranteed prescribing language needed at policy level and linked from ADHD service pages.

### 7. Prescription Policy

**Exists:** N — `/prescriptions` is promotional ("coming soon"), not prescribing governance.

**Needed:** Eligibility, pharmacy selection, compounding stance, refusal to prescribe, transfer/refill SLAs, off-label policy, asynchronous vs synchronous requirements.

### 8. Emergency Care Disclaimer

**Exists:** Partial — footer: "For emergencies, call 911" on 158 pages.

**Gaps:** No 988/Suicide & Crisis Lifeline on mental health pages; no "not for emergency care" on primary/urgent positioning; no behavioral health crisis escalation language on ADHD/depression content.

### 9. Patient Relationship Disclaimer

**Exists:** Partial — Terms imply licensed professionals but lack:

- No physician–patient relationship formed by website use
- No guarantee of acceptance
- State-specific clinician assignment
- Continuity-of-care / records transfer

### 10. Refund / Cancellation Policy

**Exists:** N — `/membership-pricing` states "Cancel Anytime" without defining refunds, partial months, evaluation fees ($199), no-show fees, or chargeback process.

**FTC risk:** "Transparent pricing" marketing without binding refund terms.

### 11. Cookie Policy

**Exists:** N — **every page** loads GTM (`GTM-PLBD4TTQ`), GA (`G-9WTQWHCTFT`), Google Ads (`AW-17553537456`).

**Gaps:** No cookie banner, categories, opt-out, retention, third-party table, CCPA "Do Not Sell/Share."

### 12. SMS / Email Consent

**Exists:** N — booking widget and marketing automation implied; no TCPA-compliant consent language, STOP instructions, message frequency, or CAN-SPAM physical address on site.

### 13. Accessibility Statement

**Exists:** N — site has `skip-link` and some ARIA; no WCAG conformance target, feedback channel, or accommodation request path.

### 14. Editorial Standards

**Exists:** Internal (`docs/PROVIDER-PUBLISHING-MINIMUMS.md`, `PROVIDER-PAGE-E-E-A-T-REQUIREMENTS.md`).

**Public gap:** Readers cannot see sourcing standards, conflict-of-interest rules, update cadence, or AI-assistance disclosure policy (6 pages mention "generated with AI assistance" without public standard).

### 15. Clinical Review Policy

**Exists:** Internal code (`data/content-review-registry.mjs`, `scripts/content-governance-report.mjs`).

**Positive:** `CLINICAL_REVIEW_APPROVED` empty; 120 pages show "Pending physician review" — aligns with SOP physician-review gate.

**Public gap:** No page explaining review process, reviewer qualifications, or what "pending" means for patients.

### 16. Advertising Compliance

**Exists:** Partial — LegitScript seal (24 pages), educational disclaimers on content.

**Gaps:** No written advertising policy; unsubstantiated superiority/volume claims on marketing pages; testimonial section without FTC disclosures.

---

## SOP-themed marketing audit (sitewide)

### Unsubstantiated claims

| Claim | Location | Risk | SOP action |
|-------|----------|------|------------|
| "1,000+ Adults Evaluated" | `/adhd-care`, legal page heroes, multiple service pages | **High** — no citation, date, or methodology | Substantiate with auditable metric or remove |
| "4.7★" + "200+ verified reviews" | `/adhd-care` (animated counters) | **High** — FTC endorsement; source not on-page | Link primary source, date range, typical results disclaimer |
| "5,000+ patients" | `/providers/dr-sneh-pandey` (`TODO:VERIFY-SOURCE` in source) | **High** — flagged in code, live on site | Remove or verify before publish |
| "Same-Week Appointments" | Legal heroes, service pages | **Medium** — operational claim | Qualify with geography/capacity |
| "$199 Transparent Pricing" | Heroes, `/adhd-care` | **Medium** — requires Refund Policy linkage | Pair with full fee schedule + refund terms |
| "Verified Patient" testimonials | `/membership-pricing` | **High** — no compensation disclosure, typical results, or identity substantiation | FTC 16 CFR Part 255 compliance block |
| "Board-certified" (all providers) | Sitewide | **Medium** — 6/7 lack verified credentials in data layer | Align marketing with `computeCredentialStatus()` |

### Missing disclaimers

- Service/conversion pages lack universal medical disclaimer strip (blogs have it).
- GLP-1 and testosterone **service landing pages** lack fair-balance modules (blogs are stronger).
- `/adhd-screening` has good screening≠diagnosis copy; should link to Medical Disclaimer + Clinical Review Policy.

### Missing risk disclosures

- **GLP-1:** Blog corpus includes thyroid C-cell, GI, pregnancy warnings (good). Service page `/weight-loss-metabolic-health` needs condensed fair-balance with link to full policy.
- **ADHD stimulants:** Content warns against "guaranteed medication" (good) but no practice-level controlled-substance policy link.
- **Testosterone:** 59 pages — need cardiovascular, fertility, monitoring disclosures on `/mens-health-longevity`.

### Missing telehealth language

- No standalone informed consent.
- Terms do not address cross-state care, technology requirements, or limitations of virtual exam.

### Missing physician review language (public)

- Internal gate works; public-facing Clinical Review Policy missing.
- Provider pages show credential status but marketing pages don't explain review workflow.

### Testimonial compliance issues

`/membership-pricing` § Testimonials:

- "Verified experiences from real patients" — no definition of verification
- "Verified Patient" badges ×3 — no FTC disclosure (material connection, typical results, individual results vary)
- Outcome implication: "his plan has been effective and I've seen positive results"
- External reviews link to HelloKlarity without clarifying platform relationship

### Before/after compliance

- **No photographic before/after pairs found** — favorable.
- **Narrative risk:** Blog case vignettes with weight outcomes (e.g., "lost 28 pounds") — acceptable if educational, but need "not typical results" near conversion CTAs.

### Controlled substance advertising issues

- ADHD care marketed with medication management; no policy on evaluation-before-prescribing, PDMP, teleprescribing limits.
- Stimulant blog content is generally cautious; policy layer missing.

### ADHD-specific compliance issues

| Item | Status |
|------|--------|
| ASRS screening ≠ diagnosis | **Good** on `/adhd-screening` |
| Instant prescription anti-patterns | **Good** in blog corpus |
| DSM/clinical framing on `/adhd-care` | **Good** post-rewrite |
| Volume/rating claims | **Bad** — unsubstantiated |
| Controlled substance policy | **Missing** |

### GLP-1 advertising issues

| Item | Status |
|------|--------|
| Compounded vs branded education | **Good** in blogs/answers |
| Fair balance on service page | **Weak** |
| "Weight loss shots" avoidance | **Good** in educational content |
| Prescription policy for compounded stance | **Missing** |

### Testosterone advertising issues

| Item | Status |
|------|--------|
| Educational TRT content | Present (59 pages) |
| Service page fair balance | Not audited as comprehensive — likely weak |
| Policy for lab monitoring, contraindications | **Missing** |

---

## Replacement policy architecture

Goal: Move from **fragmented webpage cards** to a **versioned legal governance layer** integrated with build, footer, and marketing compliance gates — without mixing promotional trust bars into legal documents.

### URL structure (recommended)

```
/legal                          → Legal & Compliance hub (index of all policies)
/legal/terms-of-use             → Terms of Use (replaces /terms; 301 from old URL)
/legal/privacy-policy           → Website & app privacy (CCPA/CPRA)
/legal/notice-of-privacy-practices → HIPAA NPP (separate from website privacy)
/legal/medical-disclaimer
/legal/telehealth-consent
/legal/controlled-substance-policy
/legal/prescription-policy
/legal/emergency-care
/legal/patient-relationship
/legal/refunds-cancellations
/legal/cookie-policy
/legal/communications-consent   → SMS, email, autodialer (TCPA/CAN-SPAM)
/legal/accessibility
/legal/editorial-standards
/legal/clinical-review
/legal/advertising-compliance
```

**Keep marketing URLs separate:** `/prescriptions` remains a service landing page; link to `/legal/prescription-policy`.

### Data layer (single source of truth)

```
apps/siya-health/
  data/
    legal-documents.mjs       # slug, title, version, effectiveDate, lastReviewed,
                              # owner (Legal/Compliance/Clinical), sections[], regulatoryTags[]
    legal-document-versions/  # optional: markdown source per version (git-tracked)
  scripts/
    generate-legal-pages.mjs  # builds static HTML from markdown/sections
    validate-legal-links.mjs # CI: footer + sitemap + cross-links
```

Update `data/site-standards.mjs`:

```javascript
export const LEGAL_LINKS = {
  hub: '/legal',
  privacy: '/legal/privacy-policy',
  noticeOfPrivacy: '/legal/notice-of-privacy-practices', // NOT conflated
  terms: '/legal/terms-of-use',
  cookie: '/legal/cookie-policy',
  medicalDisclaimer: '/legal/medical-disclaimer',
  telehealthConsent: '/legal/telehealth-consent',
  // ...
};
```

### Template / UX rules for legal pages

1. **No marketing heroes** — remove trust bars, pricing, and booking CTAs from legal templates; use neutral legal header + last-updated + version.
2. **Table of contents** — anchor navigation for documents >800 words.
3. **Cross-link matrix** — every clinical service page footer links: Medical Disclaimer, Telehealth Consent, Emergency Care, relevant Rx policy.
4. **Print/PDF** — optional `?print=1` or static PDF generation for NPP and Telehealth Consent.
5. **Consent capture** — booking widget must checkbox-link Telehealth Consent + NPP + Communications Consent (implementation in intake platform, not static site).

### Sitewide compliance components (build-time)

| Component | Injection point | Purpose |
|-----------|-----------------|---------|
| `legalDisclaimerStrip` | Service pages, provider profiles | Short medical disclaimer + links |
| `fairBalanceModule` | ADHD, weight loss, men's health landings | Specialty risk summary |
| `testimonialComplianceBlock` | Any page with reviews | FTC disclosure boilerplate |
| `cookieConsentBanner` | All pages (until policy published) | Block non-essential cookies pre-consent |
| `emergencyBanner` | Mental health / ADHD pages | 911 + 988 |

Wire into `scripts/site-chrome.mjs` and `scripts/seo-build.mjs` with validation in `npm run build`.

### Governance workflow

```
Author (Legal/Compliance)
  → draft in legal-document-versions/*.md
  → Clinical + Marketing review (per SOP checklist IDs)
  → sign-off recorded in legal-documents.mjs (reviewer, date)
  → generate-legal-pages.mjs
  → validate-legal-links.mjs (CI gate)
  → deploy
```

### Marketing claim registry (pairs with SOP)

```
data/marketing-claims.mjs
  - claimId, text, substantiationSource, validFrom, validTo, approvedBy
```

Build fails if live HTML contains claim strings not in registry (or flagged `TODO:VERIFY-SOURCE`).

### Redirect map

| Old URL | New URL |
|---------|---------|
| `/terms` | `/legal/terms-of-use` |
| `/privacy-policy` | `/legal/privacy-policy` (and add `/legal/notice-of-privacy-practices`) |

---

## Prioritized remediation

### Critical fixes (deploy blockers)

These must be resolved before treating the site as legally safe for paid acquisition or PHI collection.

| ID | Fix | Rationale |
|----|-----|-----------|
| C1 | **Publish HIPAA Notice of Privacy Practices** at `/legal/notice-of-privacy-practices` | Covered entity requirement; current privacy page denies PHI collection inaccurately |
| C2 | **Replace Privacy Policy** — accurate description of analytics, cookies, booking subprocessors, PHI routing | CCPA + HIPAA hybrid risk; false "no PHI" statement |
| C3 | **Publish Cookie Policy + consent banner** before GTM/Ads fire | GDPR/CCPA/ePrivacy; 159 pages track without disclosure |
| C4 | **Publish Telehealth Informed Consent** + integrate into booking intake | State telehealth boards; Ryan Haight alignment |
| C5 | **Publish Controlled Substance Policy** + link from `/adhd-care` and stimulant content | DEA/state board exposure while marketing ADHD meds |
| C6 | **Remove or substantiate** "1,000+ Adults Evaluated," "4.7★ / 200+ verified reviews," "5,000+ patients" | FTC false advertising; one claim has explicit `TODO:VERIFY-SOURCE` |
| C7 | **Fix testimonial block** on `/membership-pricing` — FTC disclosures or remove "Verified" until substantiated | Endorsement guidelines |
| C8 | **Expand Terms of Use** to telehealth-grade (liability, governing law, prescribing limits, third parties) | Patient relationship and dispute risk |
| C9 | **Decouple NPP from Privacy** in `site-standards.mjs` `LEGAL_LINKS` | Architecture bug causing compliance false confidence |
| C10 | **Remove marketing trust bars from legal page templates** | SOP: legal pages must not carry promotional claims |

### High-priority fixes (30-day)

| ID | Fix | Rationale |
|----|-----|-----------|
| H1 | Publish **Prescription Policy** (compounding, eligibility, refusal) | FDA/DEA/state Rx telehealth rules |
| H2 | Publish **Refund / Cancellation Policy** matching "Cancel Anytime" / "$199" marketing | FTC pricing transparency |
| H3 | Publish **Medical Disclaimer** page + inject strip on all service/provider pages | Uniform "not medical advice" on conversion paths |
| H4 | Publish **Patient Relationship Disclaimer** | Board complaints re: website-created doctor-patient relationship |
| H5 | Publish **SMS / Email Communications Consent** (TCPA/CAN-SPAM) | GHL widget + marketing automation |
| H6 | Publish **Clinical Review Policy** (public) | Explain pending badges; SOP transparency |
| H7 | Publish **Advertising Compliance Policy** | LegitScript + paid ads governance |
| H8 | Add **988** to emergency disclaimer on ADHD/mental health pages | Safety + marketing balance |
| H9 | Add **GLP-1 fair-balance module** to `/weight-loss-metabolic-health` | FDA fair balance on service landing |
| H10 | Add **testosterone fair-balance module** to `/mens-health-longevity` | FDA/state men's health advertising |
| H11 | Implement **`/legal` hub** + expand footer Legal column (all 16 links) | Discoverability |
| H12 | Add **Marketing Claims Registry** (`data/marketing-claims.mjs`) + CI validation | Prevent recurrence of unsubstantiated metrics |
| H13 | Attach **Medical Compliance in Marketing SOP v1.0** to repo | Enables checklist-ID traceability for future audits |

### Medium-priority fixes (90-day)

| ID | Fix | Rationale |
|----|-----|-----------|
| M1 | Publish **Editorial Standards** (public) incl. AI-assistance disclosure | E-E-A-T + transparency |
| M2 | Publish **Accessibility Statement** (WCAG 2.1 AA target, contact) | ADA risk reduction |
| M3 | Publish **Emergency Care Disclaimer** as standalone (expand 911/988/urgent scope) | Primary/urgent care positioning clarity |
| M4 | Build **`generate-legal-pages.mjs`** + versioned markdown source | Sustainable governance |
| M5 | **`validate-legal-links.mjs`** in CI / `npm run build` | Prevent link rot |
| M6 | 301 redirects from legacy `/terms`, `/privacy-policy` | SEO + bookmark continuity |
| M7 | State-specific addenda (CA, TX, PA, FL) for telehealth + prescribing | Multi-state board alignment |
| M8 | Women's health disclaimer module (if/when service page expands) | Reproductive health advertising sensitivity |
| M9 | Periodic **legal audit script** (extend `content-governance-report.mjs`) | Ongoing SOP enforcement |
| M10 | PDF exports for NPP + Telehealth Consent for offline intake | Operations |

---

## Appendix A — Current legal footer inventory

Only two links today (via `site-chrome.mjs` / footer template):

- `/privacy-policy`
- `/terms`

Missing 14 document types from footer and sitemap.

## Appendix B — Positive compliance controls already in codebase

| Control | Location | Note |
|---------|----------|------|
| Clinical review allowlist empty | `data/content-review-registry.mjs` | Prevents false "reviewed" claims |
| `isReviewSignOffComplete()` gate | Same | Requires `signOffSource` + `reviewerConsent` |
| Publishing minimums | `docs/PROVIDER-PUBLISHING-MINIMUMS.md` | Credential before reviewed linkage |
| Blog disclaimers | Blog generator templates | Strong educational framing |
| ASRS screening disclaimer | `/adhd-screening` | Screening ≠ diagnosis |
| LegitScript seal | Footer | Verify certification current |
| Licensed states constant | `data/site-standards.mjs` | CA, TX, PA, FL |

## Appendix C — Files reviewed

- `terms.html`, `privacy-policy.html`, `prescriptions.html`, `membership-pricing.html`, `adhd-care.html`, `adhd-screening.html`
- `data/site-standards.mjs`, `data/content-review-registry.mjs`
- `scripts/content-governance-report.mjs`, `scripts/site-chrome.mjs`
- `docs/PROVIDER-PUBLISHING-MINIMUMS.md`
- Sitewide HTML pattern scan (159 files)

---

## Appendix D — Next steps (not in scope of this doc)

1. Legal counsel drafts policy content into `legal-document-versions/`.
2. Clinical leadership signs Telehealth Consent + Controlled Substance Policy.
3. Compliance attaches SOP v1.0 to repo; map each SOP checklist ID to Critical/High/Medium items above.
4. Re-run audit scoring after publication; target: all 16 documents ≥75 completeness, legal risk ≤30.

---

*This document is a gap analysis and architecture recommendation only. It is not legal advice. Engage licensed healthcare regulatory counsel for policy drafting and final approval.*
