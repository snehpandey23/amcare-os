# ADHD & Controlled-Substance Compliance Audit

**Scope:** ADHD funnels, screening, medication content, provider positioning, booking, schema  
**Audit date:** 2026-06-05  
**Positioning rules:** Primary care–led ADHD; not psychiatry/psychology practice; screening ≠ diagnosis; medication/stimulants never guaranteed.

## Summary

| Severity | Count |
|----------|------:|
| Critical | 4 |
| High | 8 |
| Medium | 7 |
| Low | 4 |

**Verdict:** **FAIL** — Psychiatry/telepsychiatry positioning persists in AI indexes and provider copy; intake lacks controlled-substance policy + clickwrap; several funnels overstate diagnosis certainty.

---

## Findings

### AD-001 — `llms.txt` labels Swati as “Psychiatry / ADHD”

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `llms.txt` |
| **Line** | 30 |
| **Current text** | `Dr. Swati Pandey, MD — Psychiatry / ADHD (PA)` |
| **Recommended correction** | `Dr. Swati Pandey, MD — Primary care–led ADHD & mental health overlap (PA)` |
| **Deployment risk** | **Critical** — AI systems cite site as psychiatry practice |

### AD-002 — About page “Psychiatric depth” tagline

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `about.html` |
| **Line** | 176 |
| **Current text** | `Psychiatric depth for ADHD alongside depression, anxiety...` |
| **Recommended correction** | `Clinical depth for ADHD with depression/anxiety overlap—primary care–led telehealth, not a standalone psychiatry practice.` |
| **Deployment risk** | **High** |

### AD-003 — Blog: “ADHD telepsychiatry California”

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `blog/how-to-choose-adhd-provider-california.html` |
| **Line** | 113 |
| **Current text** | `Choosing **ADHD telepsychiatry California**-aligned care...` |
| **Recommended correction** | Replace “telepsychiatry” with “primary care–led ADHD telehealth” per positioning rules. |
| **Deployment risk** | **High** |

### AD-004 — Blog: telepsychiatry in evaluation content

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `blog/adhd-evaluation-california-online-vs-in-person.html` |
| **Line** | 126 |
| **Current text** | `...thoughtful telepsychiatry when legally/clinically appropriate.` |
| **Recommended correction** | “telehealth ADHD evaluation” / “primary care–led ADHD care” |
| **Deployment risk** | **High** |

### AD-005 — Geo pages: “local psychiatry waitlists”

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `adhd-diagnosis-texas.html`, `adhd-diagnosis-austin.html` |
| **Line** | 108 |
| **Current text** | `...local psychiatry waitlists often stretch for months.` |
| **Recommended correction** | `...specialty ADHD waitlists` or `...psychiatric specialist waitlists` (third-party comparison, not self-description) |
| **Deployment risk** | **Medium** — Contextual mention; avoid implying Siya is psychiatry |

### AD-006 — Swati provider schema: `Mental Health` specialty

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `providers/dr-swati-pandey.html` |
| **Line** | 26 (JSON-LD) |
| **Current text** | `"medicalSpecialty":["Adult ADHD","Mental Health","Primary Care"]` |
| **Recommended correction** | Prefer `Family Medicine` / `Internal Medicine` / `Primary Care` framing; avoid psychiatry-coded specialty labels on org-owned schema. |
| **Deployment risk** | **Medium** |

### AD-007 — “Free 15-Minute ADHD Consultation” CTA

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `blog/online-adhd-diagnosis-texas.html` |
| **Line** | 143 |
| **Current text** | `Book Your Free 15-Minute ADHD Consultation` |
| **Recommended correction** | `Book a Meet & Greet` + clarify not a diagnostic visit; avoid short consult framing that mirrors stimulant funnel sites. |
| **Deployment risk** | **Medium** |

### AD-008 — Funnel FAQ: “can prescribe ADHD medication when clinically appropriate”

| Field | Value |
|-------|-------|
| **Severity** | Low (conditional) |
| **File** | `blog/online-adhd-diagnosis-texas.html` |
| **Line** | 176 |
| **Current text** | `Yes. Our providers are licensed in Texas and can prescribe ADHD medication when clinically appropriate.` |
| **Recommended correction** | Add adjacent sentence: `Stimulant medications are not guaranteed; prescribing requires evaluation, DSM criteria, and ongoing monitoring.` |
| **Deployment risk** | **Medium** without stimulant non-guarantee adjacent |

### AD-009 — Geo funnel: “formal diagnosis” without stimulant caveat

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `online-adhd-test.html`, `adhd-care.html`, 10+ geo ADHD pages |
| **Line** | 135 (`online-adhd-test.html`) |
| **Current text** | `If criteria are met, you receive a formal diagnosis and a treatment plan...` |
| **Recommended correction** | Append: `Medication—including stimulants—is not guaranteed and depends on clinical judgment, state law, and medical appropriateness.` |
| **Deployment risk** | **Medium** |

### AD-010 — `adhd-care.html` FAQ implies diagnosis outcome

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `adhd-care.html` |
| **Line** | 410 |
| **Current text** | `If criteria are met, you receive a formal diagnosis and treatment plan.` |
| **Recommended correction** | Same non-guarantee language for medication/stimulants. |
| **Deployment risk** | **Medium** |

### AD-011 — No controlled-substance policy published

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | `data/legal-documents.mjs` |
| **Section** | `PLANNED_LEGAL_DOCUMENTS` only |
| **Current text** | Controlled substance policy status `planned`; no `/legal/controlled-substance-policy` |
| **Recommended correction** | Publish counsel-approved controlled-substance policy before stimulant-heavy marketing deploy; link from ADHD funnels and intake. |
| **Deployment risk** | **Critical** — DEA/state board scrutiny for telehealth stimulants |

### AD-012 — GHL booking without Terms/NPP clickwrap

| Field | Value |
|-------|-------|
| **Severity** | Critical |
| **File** | Sitewide (`link.yourmarketingai.com` widgets) |
| **Section** | Booking funnels, provider CTAs |
| **Current text** | Direct GHL form links; no recorded assent capture to `/legal/terms-of-use` or NPP |
| **Recommended correction** | Phase 3 GHL clickwrap per `INTAKE_ACCEPTANCE_SLUGS`; block deploy until intake captures assent. |
| **Deployment risk** | **Critical** |

### AD-013 — GTM/GA/Ads on ADHD funnels without cookie policy

| Field | Value |
|-------|-------|
| **Severity** | High |
| **File** | `adhd-screening.html`, `adhd-care.html`, etc. |
| **Lines** | 4–18 (GTM/gtag) |
| **Current text** | Tracking tags active; cookie policy not published |
| **Recommended correction** | Publish cookie policy + consent banner before paid ADHD acquisition deploy. |
| **Deployment risk** | **High** |

### AD-014 — Screening disclaimers present (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `adhd-screening.html` |
| **Lines** | 124, 249 |
| **Current text** | `This is a screening tool only—not a diagnosis.` |
| **Recommended correction** | None — maintain on all ASRS surfaces. |
| **Deployment risk** | N/A |

### AD-015 — `online-adhd-test.html` meta screening disclaimer (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `online-adhd-test.html` |
| **Line** | 24 |
| **Current text** | `Not a diagnosis—see if a $199 clinical evaluation...` |
| **Recommended correction** | None for meta; fix body copy (AD-009). |
| **Deployment risk** | N/A |

### AD-016 — `adhd-care.html` primary care positioning (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `adhd-care.html` |
| **Lines** | 218, 238 |
| **Current text** | `not a standalone psychiatry or psychology practice` / `primary care–led model` |
| **Recommended correction** | Replicate this language on geo funnels and provider pages. |
| **Deployment risk** | N/A |

### AD-017 — Dr. Sneh profile: no outcome guaranteed (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `providers/dr-sneh-pandey.html` |
| **Line** | 163 |
| **Current text** | `No outcome is guaranteed` |
| **Recommended correction** | Standardize across all ADHD provider profiles. |
| **Deployment risk** | N/A |

### AD-018 — Answer content warns against instant stimulant guarantees (positive)

| Field | Value |
|-------|-------|
| **Severity** | Low (positive) |
| **File** | `answers/can-adhd-be-diagnosed-online.html` |
| **Line** | 97 |
| **Current text** | `...not instant stimulant guarantees.` |
| **Recommended correction** | Mirror on geo landing pages and GHL-adjacent CTAs. |
| **Deployment risk** | N/A |

### AD-019 — `content-review-registry` assigns Swati to ADHD medication topics

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **File** | `data/content-review-registry.mjs` |
| **Line** | 14 |
| **Current text** | `adhdMedication: { primary: 'dr-swati-pandey', ...}` |
| **Recommended correction** | Ensure reviewer titles do not display as “psychiatry”; use “licensed medical provider / ADHD-CCSP”. |
| **Deployment risk** | **Medium** |

---

## Controlled-substance checklist

| Requirement | Status |
|-------------|--------|
| Screening ≠ diagnosis on ASRS pages | **PASS** |
| Stimulant non-guarantee on core service page | **PARTIAL** (adhd-care FAQ weak) |
| Controlled-substance policy live | **FAIL** |
| Telehealth consent published | **FAIL** (planned) |
| Intake clickwrap to Terms + NPP | **FAIL** |
| Primary care positioning sitewide | **FAIL** (psychiatry/telepsychiatry leaks) |
| PDMP / established relationship language in answers | **PASS** (educational) |

---

## Surfaces verified

| Surface | Status |
|---------|--------|
| Provider pages (ADHD) | **PARTIAL** |
| Provider hub | OK |
| `adhd-screening.html` | **PASS** |
| `online-adhd-test.html` | **PARTIAL** |
| Geo ADHD pages (10+) | **PARTIAL** |
| `adhd-care.html` | **PASS** (positioning) / **PARTIAL** (FAQ) |
| `membership-pricing.html` | OK |
| Health Guides / answers | **PASS** (generally cautious) |
| Blogs (ADHD) | **FAIL** (telepsychiatry framing) |
| `llms.txt` / `llms-full.txt` | **FAIL** |
| Schema FAQ on geo pages | **PARTIAL** |
| Booking (GHL) | **FAIL** (no assent) |
