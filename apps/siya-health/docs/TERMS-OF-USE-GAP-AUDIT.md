# Terms of Use — Pre-Rewrite Legal-Compliance Gap Audit

**Document audited:** `apps/siya-health/terms.html`  
**Live URL:** `https://siya.health/terms`  
**Audit date:** 2026-06-02  
**Scope:** Redline-style inventory of defects, cross-policy consistency, missing sections, and regulatory alignment  
**Production code modified:** None  
**Rewrite performed:** None (audit only)

---

## Executive summary

The current “Terms of Service” is **not a Terms of Use agreement**. It is a **marketing landing page** with **two policy cards totaling ~36 words** of enforceable legal text. It lacks effective date, governing law, party identification, cross-references to companion policies, and every specialty-specific telehealth section required for Siya Health’s service lines.

| Metric | Value |
|--------|------:|
| Policy body word count (enforceable text) | **~36** |
| Policy sections present | **2** |
| Policy sections expected (telehealth minimum) | **~35–45** |
| Placeholders / template artifacts identified | **18** |
| Cross-document consistency failures | **14** |
| Critical-severity issues | **22** |
| High-severity issues | **31** |
| Medium-severity issues | **24** |
| Low-severity issues | **11** |

**Verdict:** The document cannot support multi-state telehealth operations, controlled-substance care, or paid marketing until fully replaced. Treat as **deploy blocker** for legal/compliance sign-off.

---

## Audit framework note

**Siya Health Medical Compliance in Marketing SOP v1.0** was **not found** in the repository (searched `amcare-os`, `apps/siya-health/docs/`, agent transcripts). Section 6 maps issues to **inferred SOP pillars** used in `LEGAL-COMPLIANCE-GAP-ANALYSIS.md`. Re-score after SOP is committed with checklist IDs.

---

## 1. Current document — redline-style transcription

Below is the **complete enforceable policy text** as published, with inline audit annotations. Text in **bold** is published copy; annotations use `[AUDIT: …]`.

---

### Page chrome (non-policy but legally material)

| Element | Published content | Audit annotation |
|---------|-------------------|------------------|
| `<title>` | Terms of Service \| Siya Health | `[AUDIT: Naming — user/governance label is "Terms of Use"; sitewide footers also use "Terms & Conditions"]` |
| `<h1>` | Terms of Service | `[AUDIT: Same naming inconsistency]` |
| Hero lead | Terms governing use of the Siya Health website and telehealth services. | `[AUDIT: Accurate description of intent; not fulfilled by body content]` |
| Hero CTA ×2 | Book a Meet & Greet (duplicate buttons, lines 98–99) | `[AUDIT: CRITICAL — promotional CTA on legal page; no "by booking you agree" language]` |
| Trust bar | 1,000+ Adults Evaluated · Same-Week Appointments · $199 Transparent Pricing · HIPAA-Compliant | `[AUDIT: CRITICAL — unsubstantiated marketing claims on legal page; FTC/SOP violation]` |
| Footer entity | © 2026 Siya Health Inc. | `[AUDIT: Entity named in footer but absent from terms body]` |
| Footer states | California, Texas, Pennsylvania, and Florida | `[AUDIT: States in footer/marketing only — not in terms]` |
| Tracking | GTM `GTM-PLBD4TTQ`, GA `G-9WTQWHCTFT`, Google Ads `AW-17553537456` | `[AUDIT: CRITICAL — no Terms section on analytics/ads; no Cookie Policy cross-ref]` |
| Booking | `link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY` | `[AUDIT: CRITICAL — unnamed third-party PHI intake; not disclosed in terms]` |
| Chat widget | LeadConnector `69be9ab3db1480f6799cdd18` | `[AUDIT: HIGH — third-party chat not disclosed]` |

---

### Section 1 — Use of Website

> **Use of Website**
>
> This website provides information about Siya Health telehealth services. By using this site, you agree to these terms.

| Line / element | Issue |
|----------------|-------|
| Entire section (~20 words) | `[AUDIT: CRITICAL — browsewrap only; no conspicuous assent, signature, or clickwrap for clinical services]` |
| "these terms" | `[AUDIT: HIGH — no definition; only two cards; no incorporation by reference]` |
| Missing | `[MISSING: effective date, version, prior versions]` |
| Missing | `[MISSING: definitions (Site, Services, User, Patient, Provider, PHI, etc.)]` |
| Missing | `[MISSING: eligibility (age 18+, capacity, U.S. residency)]` |
| Missing | `[MISSING: account registration / credential security]` |
| Missing | `[MISSING: acceptable use / prohibited conduct]` |
| Missing | `[MISSING: intellectual property / DMCA]` |
| Missing | `[MISSING: link to Privacy Policy — see Consistency §2]` |

---

### Section 2 — Medical Services

> **Medical Services**
>
> All medical services are provided by licensed professionals. Appointment booking is handled through external secure systems.

| Line / element | Issue |
|----------------|-------|
| "licensed professionals" | `[AUDIT: HIGH — no legal entity, no professional designations (MD/DO/NP/PA), no state licensure statement]` |
| "external secure systems" | `[AUDIT: CRITICAL — functional placeholder; must name GHL/LeadConnector/yourmarketingai and data flow]` |
| Missing | `[MISSING: no physician–patient relationship until acceptance]` |
| Missing | `[MISSING: no guarantee of appointment, prescribing, or outcomes]` |
| Missing | `[MISSING: emergency / not for emergencies — only in footer, not in terms body]` |
| Missing | `[MISSING: cross-ref Telehealth Consent]` |
| Missing | `[MISSING: cross-ref Notice of Privacy Practices]` |
| Missing | `[MISSING: cross-ref Medical Disclaimer]` |
| Missing | `[MISSING: cross-ref Controlled Substance Policy]` |
| Missing | `[MISSING: fees, billing, refunds — "Cancel Anytime" marketed elsewhere, not here]` |

---

### Sections entirely absent (redline as `[MISSING]`)

```
[MISSING] 3. Parties and corporate identity (Siya Health Inc., address, contact)
[MISSING] 4. Agreement to terms; modification; notice of changes
[MISSING] 5. Privacy and HIPAA (incorporate Privacy Policy + NPP by reference)
[MISSING] 6. Telehealth services; informed consent incorporation
[MISSING] 7. Multi-state practice; patient location; provider assignment
[MISSING] 8. Scope of services by line (ADHD, weight loss, TRT, primary care)
[MISSING] 9. Prescribing and pharmacy; incorporation of Prescription Policy
[MISSING] 10. Controlled substances; Ryan Haight; PDMP; incorporation by reference
[MISSING] 11. Screening tools (ASRS) vs clinical diagnosis
[MISSING] 12. Third-party services (LegitScript, Creyos, HelloKlarity reviews, social)
[MISSING] 13. Communications (SMS/email); TCPA incorporation
[MISSING] 14. Cookies and tracking; incorporation of Cookie Policy
[MISSING] 15. Educational content / Health Guides / Blog — not medical advice
[MISSING] 16. Limitation of liability
[MISSING] 17. Disclaimer of warranties
[MISSING] 18. Indemnification
[MISSING] 19. Dispute resolution / arbitration / class waiver (if used)
[MISSING] 20. Governing law and venue (PA corp with multi-state patients)
[MISSING] 21. Severability; entire agreement; assignment
[MISSING] 22. Termination of site access
[MISSING] 23. California / state-specific addenda (CCPA, TX telehealth, etc.)
```

---

## 2. Placeholder, template artifact, and broken reference inventory

### 2A. Explicit placeholders and unresolved fields

| ID | Severity | Exact location | Finding | Recommended correction |
|----|----------|----------------|---------|------------------------|
| P-01 | **Critical** | `terms.html:119` — "external secure systems" | Unnamed third-party placeholder for booking/PHI intake | Name subprocessors (GHL/yourmarketingai.com), link Privacy Policy, describe data routing |
| P-02 | **Critical** | `terms.html:119` — "licensed professionals" | Unresolved provider entity structure | Define whether services are via Siya Health Inc., PC/PLLC, or employed/contracted clinicians per state |
| P-03 | **Critical** | `terms.html` (entire body) | No **effective date**, **version**, or **last reviewed** | Add versioned header block on all legal docs |
| P-04 | **Critical** | `terms.html` (body) | Legal entity **Siya Health Inc.** appears only in footer line 167 | Define "Siya Health," "we," corporate form, and registered address in Section 1 |
| P-05 | **High** | `terms.html:115` — "these terms" | Circular reference to undefined document | Add definitions + table of contents + incorporated policies list |
| P-06 | **High** | `terms.html:115` — browsewrap | No mechanism proving assent for clinical relationship | Clickwrap at booking + explicit "I agree to Terms" checkbox linking to `/terms` |
| P-07 | **Medium** | `terms.html:22–23` | Title/meta say "Terms of **Service**"; audit scope is "Terms of **Use**" | Standardize canonical name across site, footer, `LEGAL_LINKS`, and schema |

### 2B. Template and build artifacts (non-policy content on legal page)

| ID | Severity | Exact location | Finding | Recommended correction |
|----|----------|----------------|---------|------------------------|
| T-01 | **Critical** | `terms.html:101–106` — `hero-trust-bar` | Marketing metrics on legal page | Remove trust bar from legal template; SOP: legal pages are non-promotional |
| T-02 | **Critical** | `terms.html:97–99` — duplicate hero CTAs | Two identical "Book a Meet & Greet" buttons | Remove from legal template or replace with "Download PDF" / "Contact Legal" |
| T-03 | **High** | `terms.html:72,85,98–99,157` | Booking CTAs throughout legal page | Remove or add "subject to Terms" disclosure adjacent to CTA |
| T-04 | **High** | `terms.html:91–109` — `hero-fullwidth` marketing hero | Service-page hero pattern applied to legal doc | Use neutral legal layout (no background patient imagery required for ToU) |
| T-05 | **High** | `terms.html:4–18` | GTM + GA + Google Ads without Terms disclosure | Add Tracking/Cookies section + Cookie Policy cross-ref |
| T-06 | **High** | `terms.html:170` | LeadConnector chat widget | Disclose in Third-Party Services section |
| T-07 | **Medium** | `terms.html:171–183` — `<!-- SIYA:PROVIDER-ATTRIBUTION -->` | Build injection comment block | Harmless in production HTML; exclude from legal template |
| T-08 | **Medium** | `terms.html:111–122` — `content-grid` / two `card` layout | Webpage card UI, not legal document structure | Replace with numbered sections, TOC, print stylesheet |
| T-09 | **Low** | `terms.html:58–88` | Full marketing nav on legal page | Acceptable if consistent; add "Legal" hub link when `/legal` exists |

### 2C. Broken references, missing URLs, and mislinks

| ID | Severity | Exact location | Finding | Recommended correction |
|----|----------|----------------|---------|------------------------|
| R-01 | **Critical** | `terms.html` body | **No link to Privacy Policy** | Mandatory cross-reference in Terms § Privacy |
| R-02 | **Critical** | `terms.html:160–162` footer Legal column | Lists Privacy + Terms only; **no Notice of Privacy Practices** link | Add NPP URL when published; until then remove NPP links sitewide that falsely point to privacy policy |
| R-03 | **Critical** | Sitewide (18 pages) e.g. `adhd-care.html:614`, `weight-loss-metabolic-health.html:511` | "Notice of Privacy Practices" href → `/privacy-policy` | **Broken reference** — NPP does not exist at that URL; privacy page is not an NPP |
| R-04 | **Critical** | `data/site-standards.mjs:39` | `noticeOfPrivacy: '/privacy-policy'` | Code-level false mapping; `seo-build` propagates to redirects from `adhd.siya.health` |
| R-05 | **Critical** | `scripts/site-chrome.mjs:436` | Rewrites legacy NPP URL to `/privacy-policy` | Update when real NPP path exists |
| R-06 | **Critical** | Sitewide | **Telehealth Consent** — document does not exist; Terms does not reference | Publish `/legal/telehealth-consent`; incorporate by reference |
| R-07 | **Critical** | Sitewide | **Medical Disclaimer** — no standalone page; Terms silent | Publish and incorporate by reference |
| R-08 | **Critical** | Sitewide | **Controlled Substance Policy** — missing; Terms silent | Publish and incorporate by reference; required for ADHD stimulant line |
| R-09 | **High** | `about.html:280–283` | Card titled "Notice of Privacy Practices" links to `/privacy-policy` | Mislabel — confuses HIPAA NPP with website privacy |
| R-10 | **High** | `about.html:275–278` | "Terms & Conditions" vs `terms.html` "Terms of Service" | Normalize naming |
| R-11 | **High** | `terms.html:133` | LegitScript seal with no Terms mention of certification scope | Add Advertising Compliance / certification disclosure section |
| R-12 | **Medium** | `terms.html:24` | Canonical `/terms` — future `/legal/terms-of-use` not planned in document | Plan 301 redirect per architecture doc |

---

## 3. Cross-document consistency verification

### 3A. Companion document existence

| Document | Expected URL | Exists? | Word count | Terms references it? | Consistent with Terms? |
|----------|--------------|---------|------------|----------------------|------------------------|
| Terms of Use / Service | `/terms` | **Y** (fragment) | ~36 policy words | — | Baseline |
| Privacy Policy | `/privacy-policy` | **Y** (fragment) | ~249 total page | **No** | **Fail** — Terms silent; Privacy denies PHI while booking collects it |
| Notice of Privacy Practices | *none* (mislinked to `/privacy-policy`) | **N** | 0 | **No** | **Fail** — HIPAA NPP absent |
| Telehealth Consent | *none* | **N** | 0 | **No** | **Fail** |
| Medical Disclaimer | *none* (blog-only disclaimers) | **N** | 0 | **No** | **Fail** |
| Controlled Substance Policy | *none* | **N** | 0 | **No** | **Fail** |

### 3B. Consistency matrix (field-by-field)

| Topic | Terms says | Privacy says | NPP | Telehealth consent | Medical disclaimer | Controlled substance | Consistent? |
|-------|------------|--------------|-----|-------------------|-------------------|---------------------|-------------|
| PHI collection | Silent (implies info site) | "does not collect PHI" | N/A | N/A | N/A | N/A | **NO** — GHL booking contradicts Privacy |
| Analytics / cookies | Silent (but loads GTM) | "basic usage information" | N/A | N/A | N/A | N/A | **NO** — no cookie policy; under-disclosed |
| Licensed states | Silent | Silent | N/A | N/A | N/A | N/A | **Partial** — footer/marketing only |
| Provider licensure | "licensed professionals" | Silent | N/A | N/A | N/A | N/A | **Weak** — no state board detail |
| Booking platform | "external secure systems" | Silent | N/A | N/A | N/A | N/A | **NO** — unnamed |
| Emergency care | Footer only (911) | Footer only | N/A | N/A | Partial on blogs | N/A | **NO** — not in Terms body |
| Prescribing / CS | Silent | Silent | N/A | N/A | Educational blogs only | N/A | **NO** — ADHD stimulant services ungoverned |
| Patient relationship | Implied by "medical services" | Silent | N/A | N/A | N/A | N/A | **NO** — no "no relationship until accepted" |
| Marketing claims | Trust bar on Terms page | Trust bar on Privacy page | N/A | N/A | N/A | N/A | **NO** — legal pages carry promotional claims |
| Document naming | "Terms of Service" | "Privacy Policy" | Labeled NPP on other pages | N/A | N/A | N/A | **NO** — three different footer labels |

### 3C. Consistency failures requiring Terms-led correction

| ID | Severity | Issue | Recommended correction |
|----|----------|-------|------------------------|
| C-01 | **Critical** | Terms does not incorporate Privacy Policy by reference | Add § Privacy: "incorporates Privacy Policy at [URL]" |
| C-02 | **Critical** | Terms does not incorporate HIPAA NPP | Add § HIPAA: separate NPP URL; distinguish from website privacy |
| C-03 | **Critical** | Terms / Privacy both allow marketing trust bars claiming HIPAA compliance without NPP | Remove from legal templates; HIPAA compliance via NPP + operational BAAs |
| C-04 | **Critical** | Privacy denies PHI; Terms routes to PHI intake | Align all three: Terms describes when PHI collection begins (at booking/intake) |
| C-05 | **Critical** | 18 sitewide pages label `/privacy-policy` as NPP | Fix labels OR publish real NPP; Terms should define which document governs PHI |
| C-06 | **High** | Footer Legal block differs: Terms page has 2 links; service pages have 3 (with false NPP) | Standardize footer via `site-chrome.mjs` from `LEGAL_LINKS` |
| C-07 | **High** | No single "Legal & Compliance" index linked from Terms | Add `/legal` hub per architecture plan |
| C-08 | **High** | Telehealth Consent not incorporated | Terms § Clinical Services must require signed telehealth consent before encounter |
| C-09 | **High** | Medical Disclaimer not incorporated | Terms § Educational Content must reference Medical Disclaimer |
| C-10 | **High** | Controlled Substance Policy not incorporated | Terms § Prescribing must reference CS policy for Schedule II–IV |
| C-11 | **Medium** | `LEGAL_LINKS` in code incomplete (2 entries) | Extend to full 16-document registry |
| C-12 | **Medium** | Schema.org `WebPage` describes terms but not `TermsOfService` type | Add structured data when document is complete |
| C-13 | **Low** | Copyright year 2026 in footer; Terms has no copyright clause | Add IP/copyright section |
| C-14 | **Low** | Phone/email in footer but not in Terms contact clause | Add formal notice address |

---

## 4. Missing sections — specialty and service-line requirements

### 4A. Multi-state telehealth (CA, TX, PA, FL)

| Section | In Terms? | Severity if missing | Recommended correction |
|---------|-----------|---------------------|------------------------|
| Enumerated licensed states | **No** | **Critical** | List states; patient must be physically located in licensed state at time of visit |
| Provider assignment / covering clinicians | **No** | **High** | Explain how clinician is assigned; substitution policy |
| Telehealth modality limitations | **No** | **Critical** | Video/audio/async limits; when in-person required |
| State-specific addenda | **No** | **High** | CA telehealth consent rules; TX informed consent; FL telemedicine standards |
| Patient location verification | **No** | **High** | User attestation + clinical verification |
| Out-of-state / travel | **No** | **Medium** | Policy when patient travels |
| Technology requirements | **No** | **Medium** | Internet, device, privacy environment |
| Recording prohibition/consent | **No** | **Medium** | Session recording policy |
| Follow-up and continuity of care | **No** | **High** | Refill cadence, missed appointment policy |
| Complaints / state board contacts | **No** | **High** | CA DCA, TX TMB, PA DOS, FL DOH links |

### 4B. Adult ADHD evaluation and treatment

| Section | In Terms? | Severity | Recommended correction |
|---------|-----------|----------|------------------------|
| Screening (ASRS) ≠ diagnosis | **No** | **Critical** | Incorporate language from `/adhd-screening` screener disclaimer |
| No guarantee of ADHD diagnosis | **No** | **Critical** | Align with marketing SOP substantiation |
| No guarantee of stimulant prescription | **No** | **Critical** | Required for DEA/state board alignment |
| Evaluation components (history, collateral, safety) | **No** | **High** | Set expectations; anti "instant Rx" positioning |
| Cognitive testing (Creyos) third-party | **No** | **High** | Disclose Creyos as optional third-party tool |
| Comorbidity / referral out | **No** | **High** | When Siya cannot treat (psychosis, complex cardiology, etc.) |
| Medication management follow-up | **No** | **High** | Refill policy, monitoring, urine PDMP where applicable |
| Educational content disclaimer | **No** | **Medium** | Health Guides / blog not substitute for care |

### 4C. Controlled substance prescribing

| Section | In Terms? | Severity | Recommended correction |
|---------|-----------|----------|------------------------|
| Incorporation of Controlled Substance Policy | **No** | **Critical** | Standalone policy + Terms cross-ref |
| Ryan Haight Act / telemedicine prescribing | **No** | **Critical** | DEA registration, in-person exam exceptions per federal rule |
| Schedule II stimulant limitations | **No** | **Critical** | ADHD line-specific |
| PDMP query obligations | **No** | **High** | State-specific (TX, PA, FL, CA) |
| Refill intervals / early refill | **No** | **High** | |
| Lost/stolen medication | **No** | **Medium** | |
| No sharing / diversion | **No** | **High** | |
| Teleprescribing across state lines | **No** | **Critical** | |
| Identity verification | **No** | **High** | |

### 4D. Weight-loss services (GLP-1 / obesity medicine)

| Section | In Terms? | Severity | Recommended correction |
|---------|-----------|----------|------------------------|
| No guaranteed weight loss | **No** | **Critical** | FTC/FDA — outcomes vary |
| FDA-approved vs compounded products | **No** | **Critical** | Reference Prescription Policy; pharmacy sourcing |
| Contraindications (pregnancy, MTC, pancreatitis) | **No** | **High** | Fair balance — blogs have it; Terms/service contract needs summary |
| Lab monitoring obligations | **No** | **High** | |
| Membership / medication pricing | **No** | **High** | "$199" on Terms hero conflicts with membership model |
| Off-label use disclosure | **No** | **High** | FDA consideration |
| Discontinuation / taper | **No** | **Medium** | |

### 4E. Testosterone therapy (men's health)

| Section | In Terms? | Severity | Recommended correction |
|---------|-----------|----------|------------------------|
| FDA-approved indications vs off-label | **No** | **Critical** | |
| Contraindications (prostate, polycythemia, fertility) | **No** | **Critical** | |
| Required lab monitoring cadence | **No** | **High** | |
| No "low T" symptom quizzes as diagnosis | **No** | **High** | Marketing SOP |
| Cardiovascular risk disclosure | **No** | **High** | |
| Incorporation with Prescription Policy | **No** | **High** | |

### 4F. Primary care telehealth

| Section | In Terms? | Severity | Recommended correction |
|---------|-----------|----------|------------------------|
| Not for emergencies | **No** (footer only) | **Critical** | Prominent Terms § Emergency Exclusion |
| Not a replacement for in-person primary care | **No** | **High** | |
| Scope limits (complex chronic disease) | **No** | **High** | |
| Labs / imaging ordering and follow-up | **No** | **Medium** | Reference `/labs` pathway |
| Urgent care positioning vs ER | **No** | **High** | `/primary-urgent-care` markets urgent care — Terms must bound scope |
| Vaccination / procedure limitations | **No** | **Medium** | Telehealth cannot perform physical procedures |

---

## 5. Regulatory and SOP comparison

### 5A. FDA considerations

| Requirement | Terms status | Severity | Recommended correction |
|-------------|--------------|----------|------------------------|
| No implied FDA approval of compounded GLP-1 | **Absent** | **Critical** | § Weight Loss / Pharmacy |
| Fair balance for prescription drug services | **Absent** | **Critical** | Summarize material risks + link to service policies |
| Off-label prescribing disclosure | **Absent** | **High** | § Prescribing |
| No device/diagnostic claims for ASRS/Creyos as FDA-cleared diagnosis | **Absent** | **High** | § Screening tools |
| Testosterone product risk summary | **Absent** | **Critical** | § Men's health |

### 5B. FTC truth-in-advertising

| Requirement | Terms status | Severity | Recommended correction |
|-------------|--------------|----------|------------------------|
| No unsubstantiated claims **on legal page** | **Violated** — trust bar | **Critical** | Remove "1,000+," "Same-Week," "$199" from `terms.html` immediately |
| Endorsement/testimonial rules | **N/A on Terms** (but site has testimonials) | **High** | Terms § User content / testimonials; incorporate Advertising Compliance |
| Clear billing/subscription terms | **Absent** | **Critical** | Cross-ref Refund/Cancellation Policy |
| "HIPAA-Compliant" claim substantiation | **On trust bar** | **High** | Remove or qualify; point to NPP and security practices |
| Material connections (HelloKlarity reviews) | **Absent** | **Medium** | Third-party platforms section |

### 5C. DEA / controlled substances

| Requirement | Terms status | Severity | Recommended correction |
|-------------|--------------|----------|------------------------|
| Ryan Haight telemedicine compliance | **Absent** | **Critical** | Dedicated § + CS Policy |
| No advertising guaranteeing stimulants | **Absent** (marketing elsewhere) | **Critical** | Terms + ADHD § |
| DEA registration of prescribers | **Absent** | **High** | Representations about who may prescribe |
| Diversion / misuse prohibition | **Absent** | **High** | User obligations |

### 5D. State medical board advertising expectations

| Requirement | Terms status | Severity | Recommended correction |
|-------------|--------------|----------|------------------------|
| Truthful representation of licensure | **Absent** | **Critical** | Provider licensure §; align with credential gate |
| No deceptive urgency / outcome promises | **Violated** on hero/trust bar | **Critical** | Remove promotional elements |
| Telehealth informed consent (state-specific) | **Absent** | **Critical** | Incorporate Telehealth Consent |
| Professional entity disclosure (PA, PC, PLLC) | **Absent** | **High** | Corporate practice of medicine compliance |
| Complaint pathway to state boards | **Absent** | **High** | Patient rights § |

### 5E. Inferred Medical Compliance in Marketing SOP v1.0 pillars

| SOP pillar (inferred) | Terms compliance | Gap |
|----------------------|------------------|-----|
| Legal pages non-promotional | **Fail** | Trust bar + CTAs on Terms |
| Claim substantiation registry | **Fail** | Volume/pricing claims on Terms page |
| Physician review of marketing | **N/A** | Terms not clinically reviewed (no badge, but also no content) |
| Fair balance on Rx services | **Fail** | No Rx risk summary in Terms |
| HIPAA marketing firewall | **Fail** | HIPAA claim without NPP |
| Testimonial/endorsement compliance | **Fail** | No Terms framework; testimonials on `/membership-pricing` |
| Controlled substance advertising guardrails | **Fail** | Silent |
| Screening ≠ diagnosis | **Fail** | Not in Terms (only on screener page) |
| Third-party platform disclosure | **Fail** | Booking/chat/analytics unnamed |
| Policy cross-link completeness | **Fail** | 0 incorporated documents |

---

## 6. Master issue log

Issues are deduplicated from sections 1–5. **88 total.**

### Critical (22)

| ID | Location | Why it matters | Recommended correction |
|----|----------|--------------|------------------------|
| CR-01 | Body §1 | Browsewrap insufficient for telehealth + PHI | Implement clickwrap at intake with explicit ToU acceptance |
| CR-02 | Body | Only ~36 words — not enforceable | Full telehealth ToU draft (~3,000–6,000 words minimum) |
| CR-03 | `terms.html:119` | Unnamed booking/PHI system | Name GHL/yourmarketingai; subprocessors in Privacy + Terms |
| CR-04 | Body | No Privacy Policy incorporation | Add § with link to `/privacy-policy` (then `/legal/privacy-policy`) |
| CR-05 | Sitewide / code | NPP missing; false links to privacy policy | Publish NPP; fix 18+ pages + `site-standards.mjs` |
| CR-06 | Body | No Telehealth Consent incorporation | Publish + incorporate before clinical services |
| CR-07 | Body | No Controlled Substance Policy | Required for ADHD stimulant line |
| CR-08 | `terms.html:101–106` | Unsubstantiated marketing on legal page | Remove trust bar immediately (pre-rewrite hotfix) |
| CR-09 | `terms.html:97–99` | Booking CTA without contractual clarity | Remove or add assent language |
| CR-10 | Body | No multi-state patient location rule | Add licensed-state attestation |
| CR-11 | Body | No emergency exclusion in terms body | Add § Emergency — not for 911/988 situations |
| CR-12 | Body | No physician–patient relationship disclaimer | Add § Relationship formation at acceptance only |
| CR-13 | Body | No prescribing / pharmacy terms | Incorporate Prescription Policy |
| CR-14 | Body | ADHD: screening ≠ diagnosis | Add § referencing ASRS limitations |
| CR-15 | Body | ADHD: no guaranteed Rx | Add explicit non-guarantee |
| CR-16 | Body | Ryan Haight / DEA | Add controlled substance teleprescribing § |
| CR-17 | Body | GLP-1 / weight loss fair balance | Add obesity medicine § |
| CR-18 | Body | Testosterone risk / indication | Add men's health § |
| CR-19 | Privacy vs Terms | PHI denial vs booking intake | Reconcile across Privacy, NPP, Terms |
| CR-20 | `terms.html:4–18` | Tracking without disclosure | Cookie Policy + Terms § Analytics |
| CR-21 | Body | No governing law / dispute resolution | Add § Governing law (counsel to choose) |
| CR-22 | Body | No limitation of liability | Standard telehealth platform protection |

### High (31)

| ID | Location | Why it matters | Recommended correction |
|----|----------|--------------|------------------------|
| HI-01 | `terms.html:22,95,162` | Terms of Service vs Terms of Use vs Terms & Conditions | Pick one canonical label |
| HI-02 | Body | No effective date / version | Version header |
| HI-03 | Body | No definitions section | Add defined terms |
| HI-04 | Body | No eligibility (18+) | Add age/capacity requirements |
| HI-05 | Body | No acceptable use | Prohibit misuse, scraping, false info |
| HI-06 | Body | No IP / DMCA | Protect site content |
| HI-07 | Body | No modification/notice of changes | Explain how updates are communicated |
| HI-08 | Body | No fees/billing/refunds | Cross-ref Refund Policy; explain membership |
| HI-09 | Body | No third-party links disclaimer | LegitScript, social, HelloKlarity |
| HI-10 | `terms.html:170` | Chat widget undisclosed | Third-party services § |
| HI-11 | Footer vs body | States listed only in footer | Repeat in Terms clinical § |
| HI-12 | Body | No provider assignment logic | Explain matching/coverage |
| HI-13 | Body | No telehealth technology requirements | Patient responsibilities |
| HI-14 | Body | No follow-up/refill expectations | Clinical operations |
| HI-15 | Body | No state board complaint info | Regulatory compliance |
| HI-16 | Body | No PDMP / identity verification | CS adjunct |
| HI-17 | Body | No off-label GLP-1/TRT disclosure | FDA |
| HI-18 | Body | No primary care scope limits | Urgent care boundary |
| HI-19 | Body | No educational content disclaimer | Incorporate Medical Disclaimer |
| HI-20 | Body | No SMS/email TCPA | Incorporate Communications Consent |
| HI-21 | `about.html:280–283` | NPP card mislabels privacy page | Fix about page legal cards |
| HI-22 | Service footers | 3-link Legal block vs Terms 2-link | Unify `site-chrome.mjs` |
| HI-23 | Body | No indemnification | Standard platform term |
| HI-24 | Body | No termination of access | Account/site suspension |
| HI-25 | Body | No severability / entire agreement | Boilerplate |
| HI-26 | Body | Creyos third-party | ADHD evaluation § |
| HI-27 | Body | Comorbidity referral-out | Clinical safety |
| HI-28 | Hero | "$199" conflicts with membership pricing model | Remove; align with pricing policy |
| HI-29 | Hero | "Same-Week Appointments" operational claim | Remove from legal page |
| HI-30 | Body | No recording policy | Telehealth privacy |
| HI-31 | Body | No assignment / change of control | Corporate transactions |

### Medium (24)

| ID | Location | Why it matters | Recommended correction |
|----|----------|--------------|------------------------|
| ME-01 | `terms.html:91–109` | Marketing hero on legal page | Neutral legal template |
| ME-02 | `terms.html:58–88` | Nav pushes booking on legal page | Optional: subdued nav |
| ME-03 | Body | No account security | If portals added |
| ME-04 | Body | No international users | Geo restriction |
| ME-05 | Body | No travel/out-of-state | Multi-state edge case |
| ME-06 | Body | No lost medication CS policy | Operational |
| ME-07 | Body | No GLP-1 taper/discontinuation | Clinical |
| ME-08 | Body | No lab/imaging pathway | Primary care |
| ME-09 | Body | No vaccination/procedure limits | Scope |
| ME-10 | Body | No user-generated content | If reviews submitted |
| ME-11 | Schema | No `TermsOfService` JSON-LD | SEO/legal discovery |
| ME-12 | Body | No print/PDF version | Operations |
| ME-13 | Body | No language/accessibility clause | ADA |
| ME-14 | Body | No force majeure | Operations |
| ME-15 | Body | No survival clause | Liability sections |
| ME-16 | Body | No notice provisions (email/mail) | Contract law |
| ME-17 | `terms.html:133` | LegitScript scope unexplained | Certification § |
| ME-18 | Body | No women's health § | Service line completeness |
| ME-19 | Body | No async vs sync visit types | Telehealth model |
| ME-20 | Body | No no-show/cancellation fees | Link Refund Policy |
| ME-21 | Body | No insurance / cash-pay clarity | Membership model |
| ME-22 | Body | No research/clinical trial exclusion | Scope |
| ME-23 | Build | `SIYA:PROVIDER-ATTRIBUTION` comment | Template hygiene |
| ME-24 | Future URL | `/terms` vs `/legal/terms-of-use` | Redirect plan |

### Low (11)

| ID | Location | Why it matters | Recommended correction |
|----|----------|--------------|------------------------|
| LO-01 | `terms.html:49` | Generic WebPage schema | Enhance when complete |
| LO-02 | Footer | Copyright without Terms IP clause | Add § |
| LO-03 | Footer | Contact not in Terms | Add notice address |
| LO-04 | Meta | OG/Twitter images generic logo | Optional legal-specific |
| LO-05 | `terms.html:40–41` | Favicon preload | No action |
| LO-06 | Nav | "Start Free ADHD Assessment" on legal mobile nav | Tone consistency |
| LO-07 | Body | No headings beyond H2 | Structure when rewritten |
| LO-08 | Body | No table of contents | Add for long form |
| LO-09 | Body | No "contact legal" distinct from care@ | Role separation |
| LO-10 | Body | No Welsh/other language | N/A unless required |
| LO-11 | `terms.html:166` | Footer notice duplicates partial emergency | Consolidate in Terms body |

---

## 7. Missing-section inventory (checklist for rewrite)

Use this as the **authoritative section checklist** when counsel drafts the replacement Terms of Use. Mark each `[ ]` when drafted and `[x]` when approved.

### Core platform (required)

- [ ] 1. Introduction; parties; agreement
- [ ] 2. Definitions
- [ ] 3. Effective date; changes; notice
- [ ] 4. Eligibility; geographic restrictions
- [ ] 5. Privacy; HIPAA NPP incorporation
- [ ] 6. Cookies and tracking incorporation
- [ ] 7. Account registration and security (if applicable)
- [ ] 8. Acceptable use
- [ ] 9. Intellectual property
- [ ] 10. Third-party services and links
- [ ] 11. Communications (SMS/email) incorporation
- [ ] 12. Fees; payment; refunds incorporation
- [ ] 13. Limitation of liability
- [ ] 14. Disclaimer of warranties
- [ ] 15. Indemnification
- [ ] 16. Dispute resolution; governing law; venue
- [ ] 17. Severability; entire agreement; assignment; survival
- [ ] 18. Termination
- [ ] 19. Contact / legal notices

### Clinical / telehealth (required)

- [ ] 20. Medical Disclaimer incorporation
- [ ] 21. Telehealth Consent incorporation
- [ ] 22. No physician–patient relationship until acceptance
- [ ] 23. Multi-state practice; patient location
- [ ] 24. Telehealth limitations; technology
- [ ] 25. Emergency care exclusion (911 / 988)
- [ ] 26. Prescription Policy incorporation
- [ ] 27. Controlled Substance Policy incorporation
- [ ] 28. Provider assignment; licensure representations
- [ ] 29. Follow-up; missed appointments; termination of care
- [ ] 30. State board complaints

### Service-line addenda (required for Siya Health scope)

- [ ] 31. Adult ADHD evaluation and treatment
- [ ] 32. ASRS and screening tools ≠ diagnosis
- [ ] 33. Weight loss / obesity medicine / GLP-1
- [ ] 34. Testosterone / men's health
- [ ] 35. Primary and urgent telehealth scope limits
- [ ] 36. Women's health (if marketed)
- [ ] 37. Labs and diagnostics pathway
- [ ] 38. Educational content / Health Guides / blog

### State addenda (required)

- [ ] 39. California addendum
- [ ] 40. Texas addendum
- [ ] 41. Pennsylvania addendum
- [ ] 42. Florida addendum

**Total sections:** 42 checklist items

---

## 8. Pre-rewrite hotfixes (no full rewrite required)

These are **stopgap** corrections to reduce legal risk before counsel delivers full Terms:

| Priority | Action | File(s) |
|----------|--------|---------|
| 1 | Remove `hero-trust-bar` from Terms (and Privacy) | `terms.html`, `privacy-policy.html` |
| 2 | Remove duplicate booking CTAs from Terms hero | `terms.html:97–99` |
| 3 | Add interim banner: "These terms are being updated. For privacy questions contact care@siya.health" | `terms.html` main section |
| 4 | Stop labeling `/privacy-policy` as "Notice of Privacy Practices" sitewide | 18 HTML files + `about.html` |
| 5 | Fix `noticeOfPrivacy` in `site-standards.mjs` when NPP URL exists | `data/site-standards.mjs` |

*Hotfixes are recommended but **not implemented** in this audit per instructions.*

---

## 9. Recommended replacement architecture (Terms-specific)

| Item | Recommendation |
|------|----------------|
| Canonical URL | `/legal/terms-of-use` with 301 from `/terms` |
| Canonical name | **Terms of Use** (align footer, title, h1, `LEGAL_LINKS.terms`) |
| Source format | Versioned markdown in `data/legal-document-versions/terms-of-use.md` |
| Generator | `scripts/generate-legal-pages.mjs` — **no marketing chrome** |
| Cross-refs | Mandatory footer block: Privacy, NPP, Telehealth Consent, Medical Disclaimer, CS Policy |
| Build gate | `validate-legal-links.mjs` fails if incorporated URLs 404 |
| Assent | GHL intake checkbox → Terms + Telehealth Consent + NPP links |

---

## 10. Appendices

### Appendix A — Files examined

- `apps/siya-health/terms.html` (full file, 186 lines)
- `apps/siya-health/privacy-policy.html` (consistency)
- `apps/siya-health/data/site-standards.mjs`
- `apps/siya-health/scripts/site-chrome.mjs`
- `apps/siya-health/about.html` (legal link cards)
- `apps/siya-health/adhd-care.html`, `weight-loss-metabolic-health.html` (footer NPP mislink pattern)
- `apps/siya-health/docs/LEGAL-COMPLIANCE-GAP-ANALYSIS.md` (prior audit)

### Appendix B — Sitewide naming inventory

| Label | Where used |
|-------|------------|
| Terms of Service | `terms.html` title, h1, footer |
| Terms of Use | `about.html` link card subtitle |
| Terms & Conditions | `adhd-care.html`, `telehealth.html`, `membership-pricing.html`, `weight-loss-metabolic-health.html`, `about.html` footer |
| Terms | Provider profile footers |

### Appendix C — Word count methodology

- **Policy body:** Text inside `<main>` policy cards only (lines 114–119) = **~36 words**
- **Full page visible text:** ~256 words (includes nav, footer, marketing hero — not enforceable terms)

---

*This audit is a compliance gap analysis, not legal advice. All recommended corrections require review and approval by qualified healthcare regulatory counsel before publication.*
