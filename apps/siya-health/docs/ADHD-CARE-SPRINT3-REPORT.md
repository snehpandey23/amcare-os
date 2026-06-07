# ADHD Care Page — Sprint 3 Implementation Report

**Scope:** Second-half MVP (pricing through final CTA)  
**Date:** June 2026  
**Goal:** Physician-led ADHD evaluation program, not subscription telehealth

---

## 1. Files modified

| File | Changes |
|------|---------|
| `adhd-care.html` | Pricing hierarchy, trust stats, medical director block, FAQ dual CTA, Learn More cleanup, provider grid, final CTA deep-link |
| `styles.css` | Evaluation-first pricing layout, medical director section, FAQ dual CTA, provider grid |
| `data/providers.mjs` | Added Dr. Vanessa Urbina to `adhd-care` service roster |
| `scripts/site-chrome.mjs` | ADHD Learn More links, provider taglines/grid, FAQ/final CTA preservation through build |
| `scripts/capture-adhd-sprint3-screenshots.mjs` | Screenshot utility |
| `docs/adhd-sprint3-screenshots/*.png` | Desktop + mobile captures |

**Not modified:** Hero, symptoms, executive function, 3-step process, evaluation model, nav, footer, booking URLs, screening flow logic.

---

## 2. P0 implementation

| Item | Before | After |
|------|--------|-------|
| **P0-1 Pricing CTA** | Book a Meet & Greet | **Book ADHD Evaluation** (CarePatron link) |
| **P0-2 Trust stats** | 1,000+ Adults | **1,500+ served · 750+ evaluations · 4.7★ · 450+ reviews** |
| **P0-3 Screening deep-links** | Final CTA → `/adhd-screening` (chooser) | FAQ + final CTA → **`?start=asrs`** with Sprint A analytics attrs; hero retains `?adhd=1` (out of scope) |
| **P0-4 FAQ CTA** | “Talk to a clinician when you're ready” | **Still deciding?** + Book ADHD Evaluation + Free ADHD Screening + phone |

---

## 3. P1 implementation

| Item | Change |
|------|--------|
| **P1-1 Pricing hierarchy** | $199 Initial Evaluation featured with **Start Here** badge; ongoing plans under **Ongoing care options / After your evaluation** |
| **P1-2 Evaluation card** | Removed ASRS/DIVA/SWAN/Creyos list → “Validated assessment tools selected as clinically appropriate” (tool names remain in FAQ for compliance) |
| **P1-3 Medical Director** | New section: **A Message From Dr. Sneh Pandey** (~150 words, photo, ADHD-CCSP, Internal Medicine, Obesity Medicine) |
| **P1-4 Learn More** | Removed fatigue/sleep/metabolic links; ADHD-only resource cluster |
| **P1-5 Providers** | Added **Dr. Vanessa Urbina**; ADHD-focused taglines; 5-clinician grid with `about-team-grid--adhd` (excluded Derek/Wendy — not ADHD-capable per provider index) |

---

## 4. Screenshots

**Path:** `docs/adhd-sprint3-screenshots/`

| File | Section |
|------|---------|
| `pricing-desktop-1440.png` | Evaluation-first pricing |
| `pricing-mobile-390.png` | Pricing mobile |
| `medical-director-desktop-1440.png` | Dr. Sneh message |
| `medical-director-mobile-390.png` | Medical director mobile |
| `faq-cta-desktop-1440.png` | FAQ dual CTA |
| `faq-cta-mobile-390.png` | FAQ CTA mobile |
| `providers-desktop-1440.png` | 5-provider ADHD grid |
| `second-half-desktop-1440.png` | Full second half |

Re-capture: `npx serve -l 8877 .` → `node scripts/capture-adhd-sprint3-screenshots.mjs`

---

## 5. Validation results

```
npm run build — PASS
Legal link validation — OK
Deployment hardening — OK
GHL legal acceptance — OK
Booking audit — OK (645 CarePatron links)
```

**Screening deep-link check (Playwright):**
- `/adhd-screening?start=asrs` → step 0 (Free ADHD Screening intro) ✓
- Main CTAs: hero `?adhd=1`, FAQ + final `?start=asrs` ✓

**Stats audit:** No remaining 1,000+ / 500+ / 200+ on page body (footer unchanged per scope).

---

## 6. Compliance notes

- Medication-not-guaranteed language preserved in FAQ and Sprint 2 step 3
- Tool acronyms retained in FAQ $199 answer for transparency
- Medical director message: no outcome promises; whole-person care framing
- Build pipeline updated so `site-chrome.mjs` no longer overwrites ADHD FAQ/final CTAs

---

## 7. Build pipeline fix (important)

Sprint 3 changes to FAQ CTA, final screening link, Learn More, and provider grid are applied in source **and** enforced in `scripts/site-chrome.mjs` so `npm run build` does not revert them.
