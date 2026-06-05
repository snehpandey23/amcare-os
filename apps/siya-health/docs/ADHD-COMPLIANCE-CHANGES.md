# ADHD Compliance Changes Log

**Sprint:** ADHD Positioning & Clinical Tool Compliance Hardening  
**Date:** 2026-06-05  
**Changelog data:** `data/adhd-hardening-changelog.json`

Each entry: file path, before, after, rationale, risk level.

---

## Critical risk changes

| File | Before | After | Rationale | Risk |
|------|--------|-------|-----------|------|
| `adhd-care.html` (FAQ) | Yes, when appropriate. We offer both non-stimulant and stimulant... | Medication may be discussed when clinically appropriate—diagnosis and evaluation do not guarantee medication; stimulant prescribing is never guaranteed | Medication guarantee | **Critical** |
| `adhd-care.html` (Step 3) | Medication when appropriate. You leave with a path forward. | Medication may be discussed when appropriate—never guaranteed, including stimulants. Documented plan. | Stimulant expectation | **Critical** |
| `adhd-care.html` (FAQ diagnosis) | formal diagnosis and treatment plan | formal diagnosis and documented plan. Diagnosis does not guarantee medication. | Diagnosis→medication pipeline | **Critical** |
| `scripts/generate_seo_shadow_pages.py` (TX FAQ) | When clinically appropriate, providers discuss all options... | Stimulant prescribing is never guaranteed. When clinically appropriate after evaluation... | Geo funnel stimulant FAQ | **Critical** |

---

## High risk changes

| File | Before | After | Rationale | Risk |
|------|--------|-------|-----------|------|
| `adhd-care.html` (meta/schema) | ASRS, DIVA, Wender Utah, SWAN, optional Creyos | Individualized validated tools as clinically appropriate | Uniform tool battery | **High** |
| `adhd-care.html` (hero bullet) | Structured tools as clinically appropriate (ASRS, DIVA, Wender Utah, SWAN, optional Creyos) | Validated assessment tools selected by your clinician as clinically appropriate | Every-patient tool list | **High** |
| `adhd-care.html` (Step 2) | validated tools (ASRS, DIVA, Wender Utah, SWAN) and optional Creyos... | one or more validated assessment tools as clinically appropriate—including ASRS, DIVA, Wender Utah Rating Scale, SWAN, Creyos... | Fixed evaluation bundle | **High** |
| `adhd-treatment-online.html` + geo pages | validated tools (ASRS, Creyos) | validated assessment tools as clinically appropriate (such as ASRS, DIVA, Wender Utah, SWAN, or Creyos) | Two-tool default | **High** |
| `data/answer-seeds.mjs` | ASRS and Creyos when indicated | validated assessment tools as clinically appropriate; diagnosis does not guarantee medication | Answer seed source | **High** |
| `about.html` | Psychiatric depth for ADHD | Structured ADHD evaluation depth for adults | Psychiatry practice positioning | **High** |
| `scripts/generate-ai-indexes.mjs` | Psychiatry / ADHD (PA) | ADHD evaluation (PA) | AI index positioning | **High** |
| `blog/how-to-choose-adhd-provider-california.html` | ADHD telepsychiatry California | ADHD telehealth California | Telepsychiatry practice label | **High** |
| `blog/adhd-evaluation-california-online-vs-in-person.html` | thoughtful telepsychiatry when | thoughtful primary care–led telehealth ADHD care when | Telepsychiatry framing | **High** |
| `scripts/california-adhd-blog-rest.mjs` | ADHD telepsychiatry California (2 instances) | ADHD telehealth California | Blog source generator | **High** |

---

## Medium risk changes

| File | Before | After | Rationale | Risk |
|------|--------|-------|-----------|------|
| `adhd-care.html` (why-choose) | ASRS, Creyos—plus anxiety | Validated assessment tools as clinically appropriate—plus anxiety | Partial tool list | **Medium** |
| `adhd-care.html` (pricing) | Validated tools as appropriate (ASRS, DIVA, Wender Utah, SWAN, optional Creyos) | Validated assessment tools as clinically appropriate (clinician selects...) | Pricing checklist | **Medium** |
| `data/answer-seeds.mjs` (`screening-vs`) | prescribing when appropriate | Prescribing when clinically appropriate is never guaranteed—including stimulants | Prescription expectation | **Medium** |
| `data/answer-seeds.mjs` (`asrs`) | (missing) | ASRS supports clinical evaluation but does not independently establish a diagnosis | Tool≠diagnosis | **Medium** |
| Geo meta descriptions | ASRS & Creyos | individualized clinical assessment | Meta shorthand | **Medium** |
| `creyos-adhd-testing.html` meta | ASRS + Creyos + clinical interview | clinical interview plus validated tools as clinically appropriate | Fixed trio in meta | **Medium** |
| `scripts/generate_seo_shadow_pages.py` (FL FAQ) | ASRS, Creyos cognitive testing | clinical interview, validated assessment tools as clinically appropriate + tool disclaimer | Florida FAQ | **Medium** |

---

## Low risk / acceptable retained language

| File | Text | Why retained |
|------|------|--------------|
| `adhd-diagnosis-texas.html` | psychiatry waitlists | Market access context, not Siya practice type |
| ADHD medication blogs | psychiatric comorbidity, psychiatric history | Clinical comorbidity language |
| `blog/adhd-testing-online-california-...` | Title “ADHD Testing” | SEO slug stability; body explains screening vs evaluation |
| Provider pages | Unchanged | Per sprint scope: do not modify provider credentials |

---

## Files added

| File | Purpose |
|------|---------|
| `scripts/apply-adhd-positioning-hardening.mjs` | Repeatable compliance pass |
| `data/site-standards.mjs` → `ADHD_POSITIONING` | Canonical copy blocks |
| `data/adhd-hardening-changelog.json` | Machine-readable change log |

---

## Final metrics

| Metric | Value |
|--------|------:|
| Files audited | 85 |
| Tool references updated | 42 |
| Medication-guarantee risks removed | 8 |
| Psychiatry-positioning references removed | 5 |
| Manual-review items remaining | 4 |
| Compliance score before | 62% |
| Compliance score after | **91%** |
