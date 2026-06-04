# Production visual audit

**Site:** https://siya.health  
**Method:** Live Chromium render (Playwright) — not source HTML audit  
**Date:** 2026-06-04T11:50:43.314Z  
**Pages sampled:** 47 (7 core + 20 blogs + 20 guides)  
**Viewports:** 1440×900, 1024×768, iPhone 15 Pro (393×852)  
**Screenshots:** `docs/visual-audit-screenshots/production-audit/{viewport}/{page-id}.png`

## Executive summary (patient trust lens)

This audit judges what a real visitor sees: duplicated medical disclaimers, stacked CTAs, and inconsistent licensing copy erode physician-grade credibility faster than minor spacing issues.

| Severity | Count |
|----------|------:|
| Critical | 0 |
| High | 67 |
| Medium | 1 |
| Low | 2 |

## Issues by category

- **Legacy copy / states:** 47
- **Duplicate CTA sections:** 20
- **Different hero heights:** 1
- **Missing alt text:** 2

## Findings

| Severity | URL | Category | Selector | Detail | Screenshot | Recommended fix | Impact |
|----------|-----|----------|----------|--------|------------|-----------------|--------|
| High | https://siya.health/ | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/home.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/adhd-care | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/adhd-care.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/weight-loss-metabolic-health | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/weight-loss.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/mens-health-longevity | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/mens-health.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/telehealth | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/telehealth.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/health-guides-hub.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog-hub.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_food-noise-and-glp-1-what-it-means-and-what-helps.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_food-noise-and-glp-1-what-it-means-and-what-helps.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/insulin-resistance-and-weight-loss-clinician-overview | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_insulin-resistance-and-weight-loss-clinician-overview.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/insulin-resistance-and-weight-loss-clinician-overview | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_insulin-resistance-and-weight-loss-clinician-overview.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/why-am-i-always-tired-causes-when-to-see-doctor | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_why-am-i-always-tired-causes-when-to-see-doctor.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/why-am-i-always-tired-causes-when-to-see-doctor | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_why-am-i-always-tired-causes-when-to-see-doctor.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/free-testosterone-vs-total-testosterone-what-patients-should-know | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_free-testosterone-vs-total-testosterone-what-patients-should-know.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/free-testosterone-vs-total-testosterone-what-patients-should-know | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_free-testosterone-vs-total-testosterone-what-patients-should-know.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/adhd-symptoms-overlooked | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_adhd-symptoms-overlooked.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/adhd-symptoms-overlooked | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_adhd-symptoms-overlooked.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/online-adhd-diagnosis-texas | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_online-adhd-diagnosis-texas.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/online-adhd-diagnosis-texas | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_online-adhd-diagnosis-texas.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/online-adhd-diagnosis-california | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_online-adhd-diagnosis-california.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/online-adhd-diagnosis-california | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_online-adhd-diagnosis-california.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/glp1-side-effects-and-how-to-manage-them | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_glp1-side-effects-and-how-to-manage-them.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/glp1-side-effects-and-how-to-manage-them | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_glp1-side-effects-and-how-to-manage-them.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/semaglutide-for-weight-loss-how-it-works | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_semaglutide-for-weight-loss-how-it-works.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/semaglutide-for-weight-loss-how-it-works | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_semaglutide-for-weight-loss-how-it-works.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/how-to-know-if-you-have-adhd-adult | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_how-to-know-if-you-have-adhd-adult.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/how-to-know-if-you-have-adhd-adult | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_how-to-know-if-you-have-adhd-adult.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/is-online-adhd-diagnosis-legit | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_is-online-adhd-diagnosis-legit.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/is-online-adhd-diagnosis-legit | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_is-online-adhd-diagnosis-legit.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/medical-weight-loss-glp1-semaglutide-texas | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_medical-weight-loss-glp1-semaglutide-texas.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/medical-weight-loss-glp1-semaglutide-texas | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_medical-weight-loss-glp1-semaglutide-texas.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/compounded-vs-branded-glp1-medications | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_compounded-vs-branded-glp1-medications.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/compounded-vs-branded-glp1-medications | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_compounded-vs-branded-glp1-medications.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/tirzepatide-vs-semaglutide-which-is-better | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_tirzepatide-vs-semaglutide-which-is-better.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/tirzepatide-vs-semaglutide-which-is-better | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_tirzepatide-vs-semaglutide-which-is-better.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/adderall-for-adhd-how-it-works | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_adderall-for-adhd-how-it-works.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/adderall-for-adhd-how-it-works | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_adderall-for-adhd-how-it-works.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/vyvanse-vs-adderall-differences | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_vyvanse-vs-adderall-differences.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/vyvanse-vs-adderall-differences | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_vyvanse-vs-adderall-differences.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/medical-weight-loss-vs-dieting-what-actually-works | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_medical-weight-loss-vs-dieting-what-actually-works.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/medical-weight-loss-vs-dieting-what-actually-works | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_medical-weight-loss-vs-dieting-what-actually-works.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/phentermine-for-weight-loss-safety-and-effectiveness | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_phentermine-for-weight-loss-safety-and-effectiveness.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/phentermine-for-weight-loss-safety-and-effectiveness | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_phentermine-for-weight-loss-safety-and-effectiveness.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/blog/adult-adhd-treatment-california-2026 | Duplicate CTA sections | `div.cta-band, section.blog-final-cta` | 1 cta-band + 1 blog-final-cta | docs/visual-audit-screenshots/production-audit/1440/blog_adult-adhd-treatment-california-2026.png | Keep one final exit CTA band per article | High — conversion clutter |
| High | https://siya.health/blog/adult-adhd-treatment-california-2026 | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/blog_adult-adhd-treatment-california-2026.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/signs-of-adult-adhd | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_signs-of-adult-adhd.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/what-is-insulin-resistance | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_what-is-insulin-resistance.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/what-is-food-noise | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_what-is-food-noise.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/why-am-i-tired-even-after-sleeping | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_why-am-i-tired-even-after-sleeping.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/can-sleep-apnea-cause-fatigue | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_can-sleep-apnea-cause-fatigue.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/poor-sleep-feels-like-adhd | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_poor-sleep-feels-like-adhd.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/brain-fog-after-eating | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_brain-fog-after-eating.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/glp-1-side-effects | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_glp-1-side-effects.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/can-adhd-be-diagnosed-online | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_can-adhd-be-diagnosed-online.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/how-long-adhd-evaluation | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_how-long-adhd-evaluation.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/semaglutide-weight-loss-how-it-works | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_semaglutide-weight-loss-how-it-works.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/normal-a1c-insulin-resistance | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_normal-a1c-insulin-resistance.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/adhd-vs-burnout | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_adhd-vs-burnout.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/what-is-free-testosterone | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_what-is-free-testosterone.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/is-telehealth-legitimate | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_is-telehealth-legitimate.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/meet-and-greet-telehealth-expectations | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_meet-and-greet-telehealth-expectations.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/who-qualifies-glp-1-weight-loss | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_who-qualifies-glp-1-weight-loss.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/medical-weight-loss-vs-dieting | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_medical-weight-loss-vs-dieting.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/starting-adhd-medication-adults | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_starting-adhd-medication-adults.png | Run sitewide copy normalization on deploy | High — licensing trust |
| High | https://siya.health/answers/how-online-prescriptions-work | Legacy copy / states | `footer, body` | State list missing California | docs/visual-audit-screenshots/production-audit/1440/answers_how-online-prescriptions-work.png | Run sitewide copy normalization on deploy | High — licensing trust |
| Medium | (sitewide) | Different hero heights | `.hero, section.section` | Hero heights range 126px–3556px across 47 pages | docs/visual-audit-screenshots/production-audit/1440/home.png | Standardize min-height and padding on service heroes | Medium — brand rhythm |
| Low | https://siya.health/ | Missing alt text | `img` | 3 images missing alt | docs/visual-audit-screenshots/production-audit/1440/home.png | Add descriptive alt on content images | Low — accessibility |
| Low | https://siya.health/adhd-care | Missing alt text | `img` | 3 images missing alt | docs/visual-audit-screenshots/production-audit/1440/adhd-care.png | Add descriptive alt on content images | Low — accessibility |

## Pages audited

### Core
- https://siya.health/
- https://siya.health/adhd-care
- https://siya.health/weight-loss-metabolic-health
- https://siya.health/mens-health-longevity
- https://siya.health/telehealth
- https://siya.health/answers
- https://siya.health/blog

### Top blogs (traffic proxy: cornerstone + state + medication intent)
- https://siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps
- https://siya.health/blog/insulin-resistance-and-weight-loss-clinician-overview
- https://siya.health/blog/why-am-i-always-tired-causes-when-to-see-doctor
- https://siya.health/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign
- https://siya.health/blog/free-testosterone-vs-total-testosterone-what-patients-should-know
- https://siya.health/blog/adhd-symptoms-overlooked
- https://siya.health/blog/online-adhd-diagnosis-texas
- https://siya.health/blog/online-adhd-diagnosis-california
- https://siya.health/blog/glp1-side-effects-and-how-to-manage-them
- https://siya.health/blog/semaglutide-for-weight-loss-how-it-works
- https://siya.health/blog/how-to-know-if-you-have-adhd-adult
- https://siya.health/blog/is-online-adhd-diagnosis-legit
- https://siya.health/blog/medical-weight-loss-glp1-semaglutide-texas
- https://siya.health/blog/compounded-vs-branded-glp1-medications
- https://siya.health/blog/tirzepatide-vs-semaglutide-which-is-better
- https://siya.health/blog/adderall-for-adhd-how-it-works
- https://siya.health/blog/vyvanse-vs-adderall-differences
- https://siya.health/blog/medical-weight-loss-vs-dieting-what-actually-works
- https://siya.health/blog/phentermine-for-weight-loss-safety-and-effectiveness
- https://siya.health/blog/adult-adhd-treatment-california-2026

### Top Health Guides
- https://siya.health/answers/signs-of-adult-adhd
- https://siya.health/answers/what-is-insulin-resistance
- https://siya.health/answers/what-is-food-noise
- https://siya.health/answers/why-am-i-tired-even-after-sleeping
- https://siya.health/answers/can-sleep-apnea-cause-fatigue
- https://siya.health/answers/poor-sleep-feels-like-adhd
- https://siya.health/answers/brain-fog-after-eating
- https://siya.health/answers/glp-1-side-effects
- https://siya.health/answers/can-adhd-be-diagnosed-online
- https://siya.health/answers/how-long-adhd-evaluation
- https://siya.health/answers/semaglutide-weight-loss-how-it-works
- https://siya.health/answers/normal-a1c-insulin-resistance
- https://siya.health/answers/adhd-vs-burnout
- https://siya.health/answers/what-is-free-testosterone
- https://siya.health/answers/is-telehealth-legitimate
- https://siya.health/answers/meet-and-greet-telehealth-expectations
- https://siya.health/answers/who-qualifies-glp-1-weight-loss
- https://siya.health/answers/medical-weight-loss-vs-dieting
- https://siya.health/answers/starting-adhd-medication-adults
- https://siya.health/answers/how-online-prescriptions-work

## Notes

- Traffic ranking uses sitemap priority + cornerstone/medication intent (no GA access in this run).
- DOM audit depth on **desktop 1440**; all viewports receive screenshots.
- New guides (`brain-fog-after-eating`, `poor-sleep-feels-like-adhd`) checked on production deploy state.
