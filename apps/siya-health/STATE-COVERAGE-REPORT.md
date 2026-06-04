# State Coverage Report

Generated: 2026-06-04T00:59:23.608Z

## Canonical four-state coverage

Siya Health should represent **California, Texas, Florida, and Pennsylvania** consistently (recommended order: California, Texas, Pennsylvania, and Florida).

| State | Pages mentioning (of 144) |
|-------|----------------------------------------:|
| California | 81 |
| Texas | 142 |
| Florida | 142 |
| Pennsylvania | 142 |

## Critical gaps

### Pages missing California (key page types)

- `book-appointment.html` (service)
- `labs.html` (service)
- `membership-pricing.html` (service)
- `mens-health-longevity.html` (service)
- `prescriptions.html` (service)
- `primary-urgent-care.html` (service)
- `telehealth.html` (telehealth)
- `weight-loss-metabolic-health.html` (service)

### Footers with outdated 3-state line (missing California)

**64 pages** use: _"Board-certified providers providing telehealth care across Texas, Pennsylvania, and Florida."_

Fix in `scripts/generate-answer-pages.mjs` (`footerBlock`) and `site-chrome.mjs` (`injectFooterChrome`) → include **California, Texas, Pennsylvania, and Florida**.

Sample: `index.html`, all `answers/*.html`, most `blog/*.html`.

### Footers without California (broader)

71 pages — see 3-state line above as primary issue.

### Three-state-only copy (TX/FL/PA without CA)

- `adhd-diagnosis-austin.html`
- `adhd-diagnosis-florida.html`
- `adhd-diagnosis-houston.html`
- `adhd-diagnosis-pennsylvania.html`
- `adhd-diagnosis-philadelphia.html`
- `adhd-diagnosis-texas.html`
- `adhd-evaluation-cost.html`
- `adhd-screening.html`
- `adhd-treatment-online.html`
- `adult-adhd-diagnosis.html`
- `blog/adderall-for-adhd-how-it-works.html`
- `blog/adderall-ir-vs-xr-adults.html`
- `blog/adhd-evaluation-cost-texas.html`
- `blog/adhd-medication-daily-or-as-needed-adults.html`
- `blog/adhd-medication-online-texas-telehealth.html`
- `blog/adhd-medication-side-effects-what-to-expect.html`
- `blog/adhd-treatment-houston-online.html`
- `blog/after-adhd-diagnosis-next-steps-adults.html`
- `blog/ambien-and-sleep-medications-risks-and-benefits.html`
- `blog/combining-adhd-treatment-and-weight-loss-strategies.html`
- `blog/compounded-vs-branded-glp1-medications.html`
- `blog/focalin-vs-adderall-comparison.html`
- `blog/glp1-side-effects-and-how-to-manage-them.html`
- `blog/glutathione-and-peptides-what-do-they-actually-do.html`
- `blog/how-adhd-medication-is-prescribed-online.html`
- `blog/how-mental-health-affects-weight-loss-outcomes.html`
- `blog/how-to-know-if-you-have-adhd-adult.html`
- `blog/how-to-safely-get-prescriptions-online.html`
- `blog/insomnia-treatment-options-beyond-medication.html`
- `blog/is-adhd-medication-safe-long-term.html`
- `blog/is-online-adhd-diagnosis-legit.html`
- `blog/long-term-weight-loss-medications-what-to-expect.html`
- `blog/medical-weight-loss-glp1-semaglutide-texas.html`
- `blog/medical-weight-loss-vs-dieting-what-actually-works.html`
- `blog/minoxidil-for-hair-loss-does-it-work.html`
- `blog/modafinil-for-focus-and-fatigue-is-it-safe.html`
- `blog/non-stimulant-adhd-medications-explained.html`
- `blog/oral-vs-injectable-weight-loss-medications.html`
- `blog/oral-vs-topical-minoxidil-which-is-right.html`
- `blog/phentermine-for-weight-loss-safety-and-effectiveness.html`
- `blog/semaglutide-for-weight-loss-how-it-works.html`
- `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html`
- `blog/telehealth-prescriptions-how-online-treatment-works.html`
- `blog/telehealth.html`
- `blog/tirzepatide-vs-semaglutide-which-is-better.html`
- `blog/vyvanse-vs-adderall-differences.html`
- `blog/weight-loss.html`
- `blog/when-is-testosterone-therapy-appropriate.html`
- `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html`
- `book-appointment.html`
- `creyos-adhd-testing.html`
- `labs.html`
- `membership-pricing.html`
- `mens-health-longevity.html`
- `online-adhd-test.html`
- `prescriptions.html`
- `primary-urgent-care.html`
- `providers/dr-natasha-desai.html`
- `providers/dr-swati-pandey.html`
- `telehealth.html`
- `weight-loss-metabolic-health.html`

### Outdated 3-state phrasing patterns

- `about.html`
- `adhd-care.html`
- `adhd-diagnosis-austin.html`
- `adhd-diagnosis-florida.html`
- `adhd-diagnosis-houston.html`
- `adhd-diagnosis-pennsylvania.html`
- `adhd-diagnosis-philadelphia.html`
- `adhd-diagnosis-texas.html`
- `adhd-evaluation-cost.html`
- `adhd-screening.html`
- `adhd-treatment-online.html`
- `adult-adhd-diagnosis.html`
- `answers/adderall-vs-vyvanse-adults.html`
- `answers/adhd-and-weight-loss-connection.html`
- `answers/adhd-in-men.html`
- `answers/adhd-in-women.html`
- `answers/adhd-medication-every-day.html`
- `answers/adhd-medication-side-effects.html`
- `answers/adhd-vs-anxiety.html`
- `answers/adhd-vs-burnout.html`
- `answers/asrs-adhd-screening-explained.html`
- `answers/can-adhd-be-diagnosed-online.html`
- `answers/can-adhd-cause-anxiety.html`
- `answers/can-you-get-adhd-medication-online.html`
- `answers/compounded-vs-branded-glp-1.html`
- `answers/creyos-adhd-testing-explained.html`
- `answers/ed-telehealth-legitimate.html`
- `answers/executive-dysfunction-adhd.html`
- `answers/fsa-hsa-adhd-evaluation.html`
- `answers/glp-1-nausea-management.html`
- `answers/glp-1-side-effects.html`
- `answers/high-functioning-adhd.html`
- `answers/how-long-adhd-evaluation.html`
- `answers/how-much-does-adhd-testing-cost.html`
- `answers/how-online-prescriptions-work.html`
- `answers/index.html`
- `answers/insulin-resistance-without-diabetes.html`
- `answers/is-adhd-medication-safe-long-term.html`
- `answers/is-online-adhd-diagnosis-legitimate.html`
- `answers/is-telehealth-legitimate.html`
- `answers/late-adhd-diagnosis-adults.html`
- `answers/medical-weight-loss-vs-dieting.html`
- `answers/meet-and-greet-telehealth-expectations.html`
- `answers/minoxidil-hair-loss-does-it-work.html`
- `answers/non-stimulant-adhd-medications.html`
- `answers/normal-a1c-insulin-resistance.html`
- `answers/oral-vs-injectable-weight-loss-meds.html`
- `answers/oral-vs-topical-minoxidil.html`
- `answers/phentermine-weight-loss-safety.html`
- `answers/rejection-sensitivity-adhd.html`
- `answers/screening-vs-adhd-evaluation.html`
- `answers/semaglutide-weight-loss-how-it-works.html`
- `answers/signs-of-adult-adhd.html`
- `answers/sildenafil-erectile-dysfunction-expectations.html`
- `answers/starting-adhd-medication-adults.html`
- `answers/telehealth-adhd-california.html`
- `answers/telehealth-adhd-texas.html`
- `answers/testosterone-and-adhd-overlap.html`
- `answers/time-blindness-adhd.html`
- `answers/tirzepatide-vs-semaglutide.html`
- `answers/trt-monitoring-requirements.html`
- `answers/what-does-low-testosterone-feel-like.html`
- `answers/what-included-199-adhd-evaluation.html`
- `answers/what-is-food-noise.html`
- `answers/what-is-free-testosterone.html`
- `answers/what-is-insulin-resistance.html`
- `answers/when-is-testosterone-therapy-appropriate.html`
- `answers/who-qualifies-glp-1-weight-loss.html`
- `answers/why-am-i-tired-even-after-sleeping.html`
- `blog/adderall-for-adhd-how-it-works.html`
- `blog/adderall-ir-vs-xr-adults.html`
- `blog/adhd-evaluation-cost-texas.html`
- `blog/adhd-medication-daily-or-as-needed-adults.html`
- `blog/adhd-medication-online-texas-telehealth.html`
- `blog/adhd-medication-options-for-adults.html`
- `blog/adhd-medication-side-effects-what-to-expect.html`
- `blog/adhd-symptoms-overlooked.html`
- `blog/adhd-treatment-houston-online.html`
- `blog/adhd.html`
- `blog/after-adhd-diagnosis-next-steps-adults.html`
- `blog/all.html`
- `blog/ambien-and-sleep-medications-risks-and-benefits.html`
- `blog/combining-adhd-treatment-and-weight-loss-strategies.html`
- `blog/compounded-vs-branded-glp1-medications.html`
- `blog/focalin-vs-adderall-comparison.html`
- `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html`
- `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html`
- `blog/glp1-side-effects-and-how-to-manage-them.html`
- `blog/glutathione-and-peptides-what-do-they-actually-do.html`
- `blog/how-adhd-medication-is-prescribed-online.html`
- `blog/how-mental-health-affects-weight-loss-outcomes.html`
- `blog/how-to-know-if-you-have-adhd-adult.html`
- `blog/how-to-safely-get-prescriptions-online.html`
- `blog/index.html`
- `blog/insomnia-treatment-options-beyond-medication.html`
- `blog/insulin-resistance-and-weight-loss-clinician-overview.html`
- `blog/is-adhd-medication-safe-long-term.html`
- `blog/is-online-adhd-diagnosis-legit.html`
- `blog/long-term-weight-loss-medications-what-to-expect.html`
- `blog/medical-weight-loss-glp1-semaglutide-texas.html`
- `blog/medical-weight-loss-vs-dieting-what-actually-works.html`
- `blog/minoxidil-for-hair-loss-does-it-work.html`
- `blog/modafinil-for-focus-and-fatigue-is-it-safe.html`
- `blog/non-stimulant-adhd-medications-explained.html`
- `blog/online-adhd-diagnosis-texas.html`
- `blog/oral-vs-injectable-weight-loss-medications.html`
- `blog/oral-vs-topical-minoxidil-which-is-right.html`
- `blog/phentermine-for-weight-loss-safety-and-effectiveness.html`
- `blog/semaglutide-for-weight-loss-how-it-works.html`
- `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html`
- `blog/telehealth-prescriptions-how-online-treatment-works.html`
- `blog/telehealth.html`
- `blog/tirzepatide-vs-semaglutide-which-is-better.html`
- `blog/vyvanse-vs-adderall-differences.html`
- `blog/weight-loss.html`
- `blog/when-is-testosterone-therapy-appropriate.html`
- `blog/why-am-i-always-tired-causes-when-to-see-doctor.html`
- `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html`
- `book-appointment.html`
- `creyos-adhd-testing.html`
- `index.html`
- `labs.html`
- `membership-pricing.html`
- `mens-health-longevity.html`
- `online-adhd-test.html`
- `prescriptions.html`
- `primary-urgent-care.html`
- `providers/dr-natasha-desai.html`
- `providers/dr-sneh-pandey.html`
- `providers/dr-swati-pandey.html`
- `telehealth.html`
- `weight-loss-metabolic-health.html`

## Homepage & global chrome

| Check | Status |
|-------|--------|
| index.html mentions California | Yes |
| index.html mentions all 4 states | Yes |
| telehealth.html | CA:false TX:true FL:true PA:true |

## Provider pages

| Page | CA | TX | FL | PA |
|------|:--:|:--:|:--:|:--:|
| providers/dr-natasha-desai.html | — | ✓ | ✓ | ✓ |
| providers/dr-sneh-pandey.html | ✓ | ✓ | ✓ | ✓ |
| providers/dr-swati-pandey.html | — | ✓ | ✓ | ✓ |

## Geo / state landing pages

- `adhd-diagnosis-austin.html` — CA:false (expected: geo-specific)
- `adhd-diagnosis-florida.html` — CA:false (expected: geo-specific)
- `adhd-diagnosis-houston.html` — CA:false (expected: geo-specific)
- `adhd-diagnosis-pennsylvania.html` — CA:false (expected: geo-specific)
- `adhd-diagnosis-philadelphia.html` — CA:false (expected: geo-specific)
- `adhd-diagnosis-texas.html` — CA:false (expected: geo-specific)
- `adhd-evaluation-cost.html` — CA:false (expected: geo-specific)
- `adhd-treatment-online.html` — CA:false (expected: geo-specific)
- `adult-adhd-diagnosis.html` — CA:false (expected: geo-specific)

## Recommendations

1. Standardize footer licensure line on **all** templates via `site-chrome.mjs`: "California, Texas, Pennsylvania, and Florida".
2. Add California to any service page still using TX/FL/PA-only copy.
3. Geo pages (Houston, Austin, etc.) may omit CA in body — acceptable if global footer includes all four states.
4. Re-run this script after content sprint: `node scripts/production-readiness-audit.mjs`
