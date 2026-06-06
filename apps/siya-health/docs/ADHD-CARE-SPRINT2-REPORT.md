# ADHD Care Page — Founder Audit Sprint 2 Report

**Scope:** `#how-it-works` + `#evaluation-model` only  
**Date:** June 2026

---

## 1. Files modified

| File | Changes |
|------|---------|
| `adhd-care.html` | 3-step process copy, evaluation model 2×2 cards, disclaimer rewrite |
| `styles.css` | `.evaluation-model-grid` 2×2 layout, card sizing/spacing, icon sizing, hover parity, mobile stack |
| `scripts/capture-adhd-sprint2-screenshots.mjs` | Playwright screenshot utility (unchanged) |
| `docs/adhd-sprint2-screenshots/*.png` | Desktop + mobile captures (re-generated) |

**Not modified:** Hero, trust statistics, executive function diagram, symptom cards, pricing, FAQ, provider section, testimonials, footer, booking flow, screening flow logic, analytics.

---

## 2. Before/after copy

### Section: ADHD Clarity in 3 Steps

| Element | Before | After |
|---------|--------|-------|
| H2 | ADHD Clarity in 3 Steps — Not 6 Months | **ADHD Clarity in 3 Easy Steps** |
| Lead | Simple path to answers. | **Here's what to expect.** |
| Step 1 title | Free 2‑Minute Screening | **Free ADHD Screening** |
| Step 1 body | Quick online check… | A **brief** online screening that can help determine whether a full ADHD evaluation may be worth exploring. No obligation. |
| Step 2 body | Long list: ASRS, DIVA, SWAN, Wender Utah, Creyos… | Meet virtually with one of our licensed medical providers. We review your symptoms, childhood history, daily functioning, previous treatment experiences, and any relevant records. When appropriate, validated assessment tools may be used to support the evaluation. **This is a structured clinical assessment—not just a quick online quiz.** |
| Step 3 body | Medication-centric single paragraph | You'll leave with a clearer understanding of what may be contributing to your symptoms and what your options are moving forward. Recommendations may include: lifestyle strategies, sleep optimization, therapy, coaching, medication management, additional evaluation. **Medication may be discussed when clinically appropriate but is never guaranteed.** |

### Section: How Our ADHD Evaluation Model Works

| Card | Before | After |
|------|--------|-------|
| 1 | DSM-5-TR criteria jargon | **Structured Clinical Evaluation** — established criteria + clinical judgment, not questionnaires alone |
| 2 | Named tool list (ASRS, DIVA, etc.) | **Assessment Tools When Appropriate** — complement, not replace, clinical judgment |
| 3 | Functional impairment screening | **Real-Life Impact** — work, relationships, organization, time management, everyday responsibilities |
| 4 | Severity tracking & documentation | **Documentation & Follow-Up** — treatment planning, ongoing care, progress tracking |

**Disclaimer before:** Legal-heavy primary care–led paragraph only  
**Disclaimer after:** Every evaluation is individualized. Not every patient requires the same assessments, and recommendations are tailored to personal history, symptoms, goals, and clinical findings. Retained **primary care–led model** compliance line.

---

## 3. Updated card layout

| Before | After |
|--------|-------|
| `symptoms-card-grid` → 3 columns at 900px (3+1 orphan) | **`evaluation-model-grid`** → 2×2 from 640px |
| Small generic symptom cards, no icons | **Larger cards** (32px padding), SVG icons (44px), equal height |
| Uneven visual weight | Consistent hover: border tint, shadow, `-2px` lift (matches `.flow-card` / `.symptoms-card`) |
| Mobile: awkward 3+1 | Mobile: single column stack below 640px |

3-step flow cards: left-aligned text, larger type (1rem), combined paragraphs per spec.

---

## 4. Screenshots

**Desktop (`docs/adhd-sprint2-screenshots/`):**
- `process-steps-desktop-1440.png`
- `evaluation-model-desktop-1440.png`

**Mobile:**
- `process-steps-mobile-390.png`
- `evaluation-model-mobile-390.png`

Re-capture: `npx serve -l 8877 .` → `node scripts/capture-adhd-sprint2-screenshots.mjs`

---

## 5. Compliance review notes

| Requirement | Status |
|-------------|--------|
| Screening ≠ diagnosis | Preserved in Step 2 ("not just a quick online quiz") |
| Medication not guaranteed | Explicit in Step 3 |
| Tools don't replace clinical judgment | Evaluation model card 2 + Step 2 wording |
| Primary care–led positioning | Retained in section lead + disclaimer |
| Not psychiatry practice positioning | Section lead unchanged |
| No removed legal disclosures | Pricing section (untouched) still lists tools for transparency |

**Removed from process overview only:** Named assessment acronyms (ASRS, DIVA, SWAN, Wender Utah, Creyos) — still available in pricing section below sprint scope.

---

## 6. Validation results

```
npm run build — PASS
Legal link validation — OK
Deployment hardening — OK
GHL legal acceptance — OK
```

**ASRS deep-link verification (Playwright):**

| URL | Active step | Chooser visible |
|-----|-------------|-----------------|
| `/adhd-screening?adhd=1` | 0 (intro) | false |
| `/adhd-screening?start=asrs` | 0 (intro) | false |

`asrs-screener.js` — no changes required; `shouldSkipChooser()` already handles both params.

**Manual checks:**
- No changes above `#symptoms` or below `#pricing`
- Booking + screening URLs unchanged
- No analytics attribute changes

---

## 7. 15-second comprehension test

A patient scanning Sprint 2 sections should now read:

1. **Screen** → optional free screening  
2. **Talk** → virtual visit reviewing history and daily life  
3. **Plan** → clear next steps, medication optional not promised  

Evaluation model cards answer *how* without requiring acronym literacy.
