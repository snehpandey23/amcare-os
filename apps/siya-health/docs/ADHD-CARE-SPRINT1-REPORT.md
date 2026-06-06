# ADHD Care Page — Founder Audit Sprint 1 Report

**Scope:** First half only (hero → symptoms)  
**File:** `adhd-care.html` + `styles.css`  
**Date:** June 2026

---

## 1. Files changed


| File                                           | Changes                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `adhd-care.html`                               | Hero copy/structure, trust stats, symptom cards, patient context                         |
| `styles.css`                                   | Hero state line, trust meta, symptom card hover parity, diagram spacing, patient context |
| `scripts/capture-adhd-sprint1-screenshots.mjs` | Screenshot utility                                                                       |
| `docs/adhd-sprint1-screenshots/*.png`          | Mobile + desktop captures                                                                |


**Not modified:** Booking URLs, screening URL (`/adhd-screening?adhd=1`), pricing ($199), FAQ, providers, testimonials, analytics, nav, second-half sections.

---

## 2. Before/after copy

### Hero


| Element | Before                                                                              | After                                                                                 |
| ------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| H1      | Adult ADHD Diagnosis Online — Same-Week Evaluation ($199)                           | Adult ADHD Evaluation Online                                                          |
| Lead    | Single paragraph with specialty list (IM, FM, ADHD-trained) + states + no insurance | Layered: same-week line → DSM evaluation line → states block → no insurance           |
| Bullets | Same-week appointments + tools + treatment plan                                     | Tools + personalized recommendations + medication management (no duplicate same-week) |
| CTAs    | Unchanged                                                                           | Book ADHD Evaluation · Free ADHD Screening                                            |


### Trust statistics


| Metric        | Before                                                       | After                                                          |
| ------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| Headline      | Trusted by 1,000+ Adults                                     | Trusted by **1,500+** Adults (animated)                        |
| Reviews       | 4.7★ from **200+**                                           | 4.7★ from **450+**                                             |
| Evaluations   | **500+** completed                                           | **750+** completed                                             |
| Duplicate bar | Separate trust bar: 1,000+ evaluated, same-week, $199, HIPAA | **Removed** — consolidated into single stats block + meta line |


### Symptom cards ("Does This Sound Like You?")

All six cards rewritten to patient-experience language (see section 5).

### Patient context (new)

Replaced generic closing lines with journey acknowledgment + non-diagnostic evaluation note.

---

## 3. Statistics updated

Founder-provided targets applied:

- **1,500+** adults trusted
- **4.7★** average rating
- **450+** verified reviews
- **750+** ADHD evaluations completed

Pricing/HIPAA retained as subdued meta: `$199 transparent pricing · HIPAA-compliant telehealth`

---

## 4. New patient-context paragraph

> Many adults seeking ADHD evaluations describe symptoms dating back to childhood—being told they were careless, distracted, or not trying hard enough. Some have struggled through school, work, or daily responsibilities for years. Others previously received treatment but lost access because of insurance changes, relocation, provider availability, pregnancy, or life circumstances.
>
> These experiences are common. A structured evaluation—not a checklist alone—helps clarify what may be contributing.

---

## 5. Symptom card copy (after)


| Card | Title                       | Body                                                                    |
| ---- | --------------------------- | ----------------------------------------------------------------------- |
| 1    | Can't Start or Finish Tasks | You begin projects with good intentions but struggle to follow through. |
| 2    | Constant Overwhelm          | Everyday responsibilities feel harder than they should.                 |
| 3    | Forgetfulness               | Misplacing keys, wallets, appointments, and important details.          |
| 4    | Poor Focus                  | Your attention drifts even when something matters to you.               |
| 5    | Racing Thoughts             | Your mind rarely feels quiet.                                           |
| 6    | Time Blindness              | Underestimating how long things take or constantly running behind.      |


---

## 6. Hover-state changes

`.symptoms-card` updated sitewide for homepage parity:

- Solid white background + border (was translucent blur)
- Box shadow: `0 4px 20px` default
- Hover: `translateY(-2px)`, navy-tinted border, `0 10px 28px` shadow
- Flex column + equal height for grid consistency

---

## 7. Executive function diagram

- Added `.executive-function-section` padding (48px / 40px mobile)
- Diagram max-width increased to 720px
- Mobile container padding tightened
- Diagram retained unchanged

---

## 8. Screenshots

`docs/adhd-sprint1-screenshots/`:

- `hero-desktop-1440.png`
- `trust-stats-1440.png`
- `symptoms-1440.png`
- `hero-mobile-390.png`
- `symptoms-mobile-390.png`
- `first-half-mobile-full.png`

Re-capture: `npx serve -l 8877 .` then `node scripts/capture-adhd-sprint1-screenshots.mjs`

---

## 9. Validation results

```
npm run build — PASS
Legal link validation — OK
Deployment hardening — OK
GHL legal acceptance — OK
```

**Manual checks:**

- Booking URL unchanged (CarePatron)
- Screening URL unchanged (`/adhd-screening?adhd=1`)
- No changes below `#how-it-works` section
- No analytics attribute changes on page

