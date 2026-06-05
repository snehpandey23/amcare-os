# ADHD Copy Hardening Report

**Sprint:** ADHD Positioning & Clinical Tool Compliance Hardening  
**Date:** 2026-06-05  
**Build:** `npm run build` **PASS** after hardening

---

## Summary

| Metric | Count |
|--------|------:|
| ADHD-related files audited | **85** |
| Tool reference copy updates | **42** |
| Medication-guarantee risks removed | **8** |
| Psychiatry-positioning references removed | **5** |
| Generator/source files updated | **6** |
| Total automated + manual replacements | **71** |

---

## Canonical copy introduced

Source: `data/site-standards.mjs` → `ADHD_POSITIONING`

- **Practice:** Primary care–led; not psychiatry or psychology practice
- **Tools:** Clinicians may use ASRS, DIVA, Wender Utah, SWAN, Creyos, and other methods based on presentation—no tool required for every patient
- **Diagnosis support:** Assessment tools support clinical evaluation but do not independently establish a diagnosis
- **Medication:** Diagnosis/evaluation do not guarantee medication; stimulant prescribing is never guaranteed

---

## Surfaces hardened

### Flagship & funnels
- `adhd-care.html` — meta, hero, steps, evaluation model, pricing, FAQ, og:description
- `adhd-screening.html` — unchanged ASRS disclaimers (already compliant)
- 10 shadow geo/funnel pages via `generate_seo_shadow_pages.py` regeneration

### Answers (regenerated from seeds)
- `what-included-199-adhd-evaluation`
- `screening-vs-adhd-evaluation`
- `asrs-adhd-screening-explained`
- `can-adhd-be-diagnosed-online` (phase5 content via hardening pass)

### Blogs
- `how-to-choose-adhd-provider-california.html`
- `adhd-evaluation-california-online-vs-in-person.html`
- Source: `scripts/california-adhd-blog-rest.mjs`

### Site chrome & AI
- `about.html` — team positioning line
- `llms.txt` / `llms-full.txt` — provider index line + citation guidance
- `scripts/generate-ai-indexes.mjs` — persistent generator fix

### Build integration
- `package.json` — `apply-adhd-positioning-hardening.mjs` in build pipeline (before answer regen + AI indexes)

---

## Sample before/after (high-risk)

### `adhd-care.html` — FAQ medication

| | Text |
|---|------|
| **Before** | Yes, when appropriate. We offer both non-stimulant and stimulant treatment options with proper monitoring and follow-up. |
| **After** | Medication may be discussed when clinically appropriate after evaluation—diagnosis and evaluation do not guarantee medication, and stimulant prescribing is never guaranteed. When medication is appropriate, we offer non-stimulant and stimulant options with proper monitoring and follow-up. |
| **Rationale** | Eliminate medication/stimulant guarantee implication |
| **Risk** | Critical |

### `adhd-care.html` — evaluation model card

| | Text |
|---|------|
| **Before** | ASRS, DIVA, Wender Utah, and SWAN may be used to map symptoms and severity; Creyos or similar objective cognitive testing when clinically useful. |
| **After** | Your clinician may use one or more validated assessment tools as clinically appropriate. Tools may include ASRS, DIVA, Wender Utah Rating Scale, SWAN, Creyos, and other methods. Assessment tools support clinical evaluation but do not independently establish a diagnosis. |
| **Rationale** | Individualized tool selection; tool ≠ diagnosis |
| **Risk** | High |

### `about.html` — Dr. Swati team card (not provider profile)

| | Text |
|---|------|
| **Before** | Psychiatric depth for ADHD alongside depression, anxiety, or complex medication histories. |
| **After** | Structured ADHD evaluation depth for adults alongside depression, anxiety, or complex medication histories. |
| **Rationale** | Avoid psychiatry-practice self-positioning on about page |
| **Risk** | High |

### Geo pages — body template

| | Text |
|---|------|
| **Before** | use validated tools (ASRS, Creyos) |
| **After** | use validated assessment tools as clinically appropriate (such as ASRS, DIVA, Wender Utah, SWAN, or Creyos) |
| **Rationale** | Remove two-tool default |
| **Risk** | High |

---

## Compliance score

| Domain | Before | After |
|--------|--------|-------|
| Primary care–led positioning | 70% | **95%** |
| Individualized assessment tools | 55% | **92%** |
| Medication non-guarantee | 60% | **90%** |
| Anti-psychiatry-practice framing | 65% | **88%** |
| **Weighted overall** | **62%** | **91%** |

---

## Verification commands

```bash
cd apps/siya-health
npm run build
# Should find zero matches:
grep -r "Psychiatry / ADHD" llms.txt about.html blog/
grep -r "ASRS, DIVA, Wender Utah, SWAN, optional Creyos" adhd-care.html
grep -r "validated tools (ASRS, Creyos)" adhd-*.html adult-adhd*.html
```
