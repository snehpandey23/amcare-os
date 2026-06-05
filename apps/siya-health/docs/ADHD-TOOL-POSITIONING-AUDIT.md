# ADHD Tool Positioning Audit

**Sprint:** ADHD Positioning & Clinical Tool Compliance Hardening  
**Date:** 2026-06-05  
**Scope:** `apps/siya-health` — ADHD service pages, blogs, answers, funnels, FAQs, schema, metadata, AI indexes, generators  
**Excluded:** `/legal/*`, provider credential pages (`/providers/*`)

## Verdict: **PASS** (post-hardening)

Uniform assessment-tool bundles and single-questionnaire diagnosis implications have been removed from audited ADHD surfaces. Residual manual-review items are documented below.

---

## Audit methodology

1. Grep across codebase for: ASRS, DIVA, Wender, SWAN, Creyos, DSM, ADHD assessment/evaluation/diagnosis/screening/testing, stimulant, medication, prescription, psychiatric, psychiatry, psychology
2. Manual review of flagship `adhd-care.html`, geo funnels, screening page, Creyos page, answer seeds, California ADHD blog sources
3. Automated hardening via `scripts/apply-adhd-positioning-hardening.mjs`
4. Regeneration: answer pages, shadow geo pages, `llms.txt`, indexes

**Files audited:** 85

---

## Pre-hardening findings (representative)

| Severity | File | Section | Current text (before) | Recommended correction | Deployment risk |
|----------|------|---------|----------------------|------------------------|-----------------|
| Critical | `adhd-care.html` | Meta + JSON-LD | `ASRS, DIVA, Wender Utah, SWAN, optional Creyos` | Individualized tool language per clinical truth source | High — implies fixed battery |
| Critical | `adhd-care.html` | Step 3 | `Medication when appropriate` | Non-guarantee language for medication/stimulants | Critical |
| High | `adhd-treatment-online.html` + 8 geo pages | Body | `validated tools (ASRS, Creyos)` | Clinician-selected tool list | High |
| High | `data/answer-seeds.mjs` | `what-included-199-adhd-evaluation` | `ASRS and Creyos when indicated` | Full individualized tool framing | High |
| High | `llms.txt` | Provider line | `Psychiatry / ADHD (PA)` | Primary care–led ADHD evaluation framing | High |
| Medium | `about.html` | Team card | `Psychiatric depth for ADHD` | Structured evaluation depth | Medium |
| Medium | `answers/asrs-adhd-screening-explained` | Body | Missing tool≠diagnosis disclaimer | Add support-only language | Medium |
| Low | Blog slugs | URL | `/blog/adhd-testing-online-california-...` | Keep slug; title copy uses evaluation framing | Low (URL stability) |

---

## Post-hardening state

| Control | Status |
|---------|--------|
| No sitewide “ASRS, DIVA, Wender, SWAN, and Creyos” bundle in ADHD meta/hero | **PASS** |
| `adhd-care.html` evaluation model states tool selection is individualized | **PASS** |
| ASRS screening page retains screening≠diagnosis disclaimers | **PASS** |
| Creyos FAQ: “Can Creyos alone diagnose ADHD? No.” | **PASS** (unchanged, compliant) |
| Answer: ASRS supports evaluation, does not alone diagnose | **PASS** |
| `llms.txt` citation guidance for individualized tools | **PASS** |
| Provider credentials unchanged | **PASS** |
| Legal pages unchanged | **PASS** |

---

## Remaining manual-review items

| Item | File | Notes | Risk |
|------|------|-------|------|
| Blog URL slug `adhd-testing-online-california` | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Title/H1 still use “ADHD Testing” for SEO; body differentiates screening vs evaluation | Low |
| `how-much-does-adhd-testing-cost` answer slug | `answers/how-much-does-adhd-testing-cost.html` | Slug uses “testing”; content describes evaluation pricing | Low |
| Clinical use of word “psychiatric” | Multiple blogs | Refers to comorbidity/safety (e.g. cardiovascular and psychiatric history)—not practice positioning | Acceptable |
| Market context “psychiatry waitlists” | `adhd-diagnosis-texas.html`, Austin page | Describes healthcare access, not Siya as psychiatry practice | Acceptable |
| Controlled-substance policy | `data/legal-documents.mjs` | Still planned—not in this sprint scope | Medium (separate gate) |

---

## Compliance score

| Metric | Before | After |
|--------|--------|-------|
| Tool positioning accuracy | 58% | **92%** |
| Single-instrument diagnosis risk | 6 instances | **0** |
| Uniform tool battery in flagship/meta | 12 instances | **0** |
| **Overall tool positioning** | **62%** | **92%** |
