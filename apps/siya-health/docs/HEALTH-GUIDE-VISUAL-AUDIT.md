# Health Guide visual audit

**Scope:** 65 Health Guides (`/answers/*`)  
**Generated:** 2026-06-04T12:14:57.737Z  
**Implementation:** `scripts/answer-engagement-system.mjs` → `generate-answer-pages.mjs`

## Component registry (reusable)

| Visual type | CSS / class | Builder |
|-------------|-------------|---------|
| Symptom flowchart | `blog-engage--flowchart` | `symptomFlowchart()` |
| Decision tree | `blog-engage--decision` | `decisionTree()` |
| Comparison table | `blog-engage--comparison` | `comparisonTable()` |
| Myth vs reality | `blog-engage--myth` | `mythVsReality()` |
| Evidence snapshot | `blog-engage--evidence` | `evidenceSnapshot()` |
| Clinical pearl | `blog-engage--pearl` | `clinicalPearl()` |
| Mini infographic | `blog-engage--infographic` | `miniInfographic()` |
| Key takeaway | `blog-engage--takeaway` | `keyTakeaway()` |

## Placement standard (all guides post-implementation)

| Requirement | Placement | Component |
|-------------|-----------|-----------|
| ≥1 above-the-fold visual | After `#short-answer` | flowchart / infographic / comparison |
| ≥1 decision support | After main sections | `decisionTree` |
| ≥1 evidence summary | Inside `#evidence` before bullet list | `evidenceSnapshot` |
| Mid visual break | After section 2 (or section 1 if only one) | myth / pearl |

## Summary counts

| Metric | Count |
|--------|------:|
| High text density (>900 words) | 0 |
| Medium density (500–900) | 26 |
| Low density (<500) | 39 |
| Low engagement potential (flagged) | 7 |
| Guides with 0 engagement blocks (post-build HTML) | 0 |

## Guides with high text density (watch wall-of-text)

_None_

## Guides with low density / short copy (boost visuals)

- `late-adhd-diagnosis-adults` (45 words, medium potential)
- `high-functioning-adhd` (49 words, medium potential)
- `adhd-in-women` (43 words, medium potential)
- `adhd-in-men` (48 words, medium potential)
- `time-blindness-adhd` (56 words, medium potential)
- `rejection-sensitivity-adhd` (56 words, medium potential)
- `executive-dysfunction-adhd` (49 words, medium potential)
- `how-much-does-adhd-testing-cost` (54 words, medium potential)
- `how-long-adhd-evaluation` (44 words, medium potential)
- `adderall-vs-vyvanse-adults` (55 words, medium potential)
- `adhd-medication-side-effects` (53 words, medium potential)
- `is-adhd-medication-safe-long-term` (50 words, medium potential)
- `adhd-medication-every-day` (39 words, medium potential)
- `can-you-get-adhd-medication-online` (43 words, medium potential)
- `asrs-adhd-screening-explained` (48 words, medium potential)
- `creyos-adhd-testing-explained` (46 words, medium potential)
- `screening-vs-adhd-evaluation` (46 words, medium potential)
- `tirzepatide-vs-semaglutide` (54 words, medium potential)
- `compounded-vs-branded-glp-1` (47 words, medium potential)
- `phentermine-weight-loss-safety` (47 words, medium potential)
- `oral-vs-injectable-weight-loss-meds` (48 words, medium potential)
- `medical-weight-loss-vs-dieting` (47 words, medium potential)
- `glp-1-nausea-management` (42 words, medium potential)
- `who-qualifies-glp-1-weight-loss` (42 words, medium potential)
- `adhd-and-weight-loss-connection` (45 words, medium potential)
- `why-am-i-tired-even-after-sleeping` (141 words, low potential)
- `can-sleep-apnea-cause-fatigue` (123 words, low potential)
- `signs-of-sleep-apnea-in-adults` (100 words, low potential)
- `what-does-low-testosterone-feel-like` (50 words, medium potential)
- `sildenafil-erectile-dysfunction-expectations` (47 words, medium potential)
- `minoxidil-hair-loss-does-it-work` (54 words, medium potential)
- `oral-vs-topical-minoxidil` (43 words, medium potential)
- `ed-telehealth-legitimate` (38 words, medium potential)
- `testosterone-and-adhd-overlap` (45 words, medium potential)
- `how-online-prescriptions-work` (500 words, medium potential)
- `telehealth-adhd-california` (51 words, low potential)
- `telehealth-adhd-texas` (40 words, low potential)
- `fsa-hsa-adhd-evaluation` (42 words, low potential)
- `what-included-199-adhd-evaluation` (49 words, low potential)

## Low engagement potential (telehealth logistics / thin copy)

- `why-am-i-tired-even-after-sleeping`
- `can-sleep-apnea-cause-fatigue`
- `signs-of-sleep-apnea-in-adults`
- `telehealth-adhd-california`
- `telehealth-adhd-texas`
- `fsa-hsa-adhd-evaluation`
- `what-included-199-adhd-evaluation`

---

## Per-guide recommendations

| Guide | Above-fold visual | Placement | Mid break | Decision | Evidence card | Density | Words | Engage blocks |
|-------|-------------------|-----------|-----------|----------|---------------|---------|------:|-------------:|
| [signs-of-adult-adhd](/answers/signs-of-adult-adhd) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 548 | 4 |
| [can-adhd-cause-anxiety](/answers/can-adhd-cause-anxiety) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 539 | 4 |
| [adhd-vs-anxiety](/answers/adhd-vs-anxiety) | comparison | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 618 | 4 |
| [adhd-vs-burnout](/answers/adhd-vs-burnout) | comparison | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 715 | 4 |
| [late-adhd-diagnosis-adults](/answers/late-adhd-diagnosis-adults) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 45 | 5 |
| [high-functioning-adhd](/answers/high-functioning-adhd) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 49 | 5 |
| [adhd-in-women](/answers/adhd-in-women) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 43 | 5 |
| [adhd-in-men](/answers/adhd-in-men) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 48 | 5 |
| [time-blindness-adhd](/answers/time-blindness-adhd) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 56 | 5 |
| [rejection-sensitivity-adhd](/answers/rejection-sensitivity-adhd) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 56 | 5 |
| [executive-dysfunction-adhd](/answers/executive-dysfunction-adhd) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 49 | 5 |
| [can-adhd-be-diagnosed-online](/answers/can-adhd-be-diagnosed-online) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 518 | 4 |
| [is-online-adhd-diagnosis-legitimate](/answers/is-online-adhd-diagnosis-legitimate) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 501 | 4 |
| [how-much-does-adhd-testing-cost](/answers/how-much-does-adhd-testing-cost) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 54 | 5 |
| [how-long-adhd-evaluation](/answers/how-long-adhd-evaluation) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 44 | 5 |
| [adderall-vs-vyvanse-adults](/answers/adderall-vs-vyvanse-adults) | custom | After short answer | myth | blog-engage--decision | blog-engage--evidence | low | 55 | 5 |
| [adhd-medication-side-effects](/answers/adhd-medication-side-effects) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 53 | 5 |
| [is-adhd-medication-safe-long-term](/answers/is-adhd-medication-safe-long-term) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 50 | 5 |
| [non-stimulant-adhd-medications](/answers/non-stimulant-adhd-medications) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 585 | 4 |
| [starting-adhd-medication-adults](/answers/starting-adhd-medication-adults) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 581 | 4 |
| [adhd-medication-every-day](/answers/adhd-medication-every-day) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 39 | 5 |
| [can-you-get-adhd-medication-online](/answers/can-you-get-adhd-medication-online) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 43 | 5 |
| [asrs-adhd-screening-explained](/answers/asrs-adhd-screening-explained) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 48 | 5 |
| [creyos-adhd-testing-explained](/answers/creyos-adhd-testing-explained) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 46 | 5 |
| [screening-vs-adhd-evaluation](/answers/screening-vs-adhd-evaluation) | comparison | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 46 | 5 |
| [glp-1-side-effects](/answers/glp-1-side-effects) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 608 | 4 |
| [semaglutide-weight-loss-how-it-works](/answers/semaglutide-weight-loss-how-it-works) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 584 | 4 |
| [tirzepatide-vs-semaglutide](/answers/tirzepatide-vs-semaglutide) | custom | After short answer | myth | blog-engage--decision | blog-engage--evidence | low | 54 | 5 |
| [compounded-vs-branded-glp-1](/answers/compounded-vs-branded-glp-1) | comparison | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 47 | 5 |
| [phentermine-weight-loss-safety](/answers/phentermine-weight-loss-safety) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 47 | 5 |
| [oral-vs-injectable-weight-loss-meds](/answers/oral-vs-injectable-weight-loss-meds) | comparison | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 48 | 5 |
| [medical-weight-loss-vs-dieting](/answers/medical-weight-loss-vs-dieting) | comparison | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 47 | 5 |
| [glp-1-nausea-management](/answers/glp-1-nausea-management) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 42 | 5 |
| [who-qualifies-glp-1-weight-loss](/answers/who-qualifies-glp-1-weight-loss) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 42 | 5 |
| [adhd-and-weight-loss-connection](/answers/adhd-and-weight-loss-connection) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 45 | 5 |
| [what-is-insulin-resistance](/answers/what-is-insulin-resistance) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 648 | 4 |
| [insulin-resistance-without-diabetes](/answers/insulin-resistance-without-diabetes) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 511 | 4 |
| [normal-a1c-insulin-resistance](/answers/normal-a1c-insulin-resistance) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 542 | 4 |
| [what-is-food-noise](/answers/what-is-food-noise) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | medium | 581 | 4 |
| [why-am-i-tired-even-after-sleeping](/answers/why-am-i-tired-even-after-sleeping) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 141 | 5 |
| [can-sleep-apnea-cause-fatigue](/answers/can-sleep-apnea-cause-fatigue) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 123 | 5 |
| [signs-of-sleep-apnea-in-adults](/answers/signs-of-sleep-apnea-in-adults) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 100 | 5 |
| [poor-sleep-feels-like-adhd](/answers/poor-sleep-feels-like-adhd) | custom | After short answer | custom | blog-engage--decision | blog-engage--evidence | medium | 599 | 4 |
| [brain-fog-after-eating](/answers/brain-fog-after-eating) | custom | After short answer | myth | blog-engage--decision | blog-engage--evidence | medium | 701 | 4 |
| [what-is-free-testosterone](/answers/what-is-free-testosterone) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | medium | 524 | 4 |
| [what-does-low-testosterone-feel-like](/answers/what-does-low-testosterone-feel-like) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 50 | 5 |
| [when-is-testosterone-therapy-appropriate](/answers/when-is-testosterone-therapy-appropriate) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | medium | 532 | 4 |
| [trt-monitoring-requirements](/answers/trt-monitoring-requirements) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | medium | 514 | 4 |
| [sildenafil-erectile-dysfunction-expectations](/answers/sildenafil-erectile-dysfunction-expectations) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 47 | 5 |
| [minoxidil-hair-loss-does-it-work](/answers/minoxidil-hair-loss-does-it-work) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 54 | 5 |
| [oral-vs-topical-minoxidil](/answers/oral-vs-topical-minoxidil) | comparison | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 43 | 5 |
| [ed-telehealth-legitimate](/answers/ed-telehealth-legitimate) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 38 | 5 |
| [testosterone-and-adhd-overlap](/answers/testosterone-and-adhd-overlap) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 45 | 5 |
| [how-online-prescriptions-work](/answers/how-online-prescriptions-work) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | low | 500 | 4 |
| [is-telehealth-legitimate](/answers/is-telehealth-legitimate) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | medium | 505 | 4 |
| [telehealth-adhd-california](/answers/telehealth-adhd-california) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 51 | 5 |
| [telehealth-adhd-texas](/answers/telehealth-adhd-texas) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 40 | 5 |
| [fsa-hsa-adhd-evaluation](/answers/fsa-hsa-adhd-evaluation) | flowchart | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 42 | 5 |
| [what-included-199-adhd-evaluation](/answers/what-included-199-adhd-evaluation) | infographic | After short answer (above the fold) | myth | blog-engage--decision | blog-engage--evidence | low | 49 | 5 |
| [meet-and-greet-telehealth-expectations](/answers/meet-and-greet-telehealth-expectations) | flowchart | After short answer (above the fold) | pearl | blog-engage--decision | blog-engage--evidence | medium | 506 | 4 |
| [why-normal-labs-dont-mean-healthy](/answers/why-normal-labs-dont-mean-healthy) | custom | After short answer | myth | blog-engage--decision | blog-engage--evidence | medium | 819 | 4 |
| [food-noise-returned-on-glp-1](/answers/food-noise-returned-on-glp-1) | custom | After short answer | myth | blog-engage--decision | blog-engage--evidence | medium | 779 | 4 |
| [weight-gain-after-stopping-ozempic](/answers/weight-gain-after-stopping-ozempic) | custom | After short answer | myth | blog-engage--decision | blog-engage--evidence | medium | 746 | 4 |
| [afternoon-energy-crash-after-lunch](/answers/afternoon-energy-crash-after-lunch) | custom | After short answer | myth | blog-engage--decision | blog-engage--evidence | medium | 729 | 4 |
| [high-shbg-low-free-testosterone](/answers/high-shbg-low-free-testosterone) | custom | After short answer | pearl | blog-engage--decision | blog-engage--evidence | medium | 711 | 4 |

---

## Per-guide detail

### What are the signs of adult ADHD?

- **Slug:** `signs-of-adult-adhd`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Adult ADHD often shows up as chronic difficulty sustaining focus, disorganization, forgetfulness, ti…
- **Text density:** medium (548 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Can ADHD cause anxiety?

- **Slug:** `can-adhd-cause-anxiety`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** ADHD does not universally “cause” anxiety in a simple one-direction way, but living with untreated A…
- **Text density:** medium (539 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How do you tell ADHD apart from anxiety?

- **Slug:** `adhd-vs-anxiety`
- **Recommended above-fold:** comparison → `blog-engage--comparison`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Anxiety often shows as situational worry, physical tension, and avoidance tied to feared outcomes. A…
- **Text density:** medium (618 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Is it ADHD or burnout?

- **Slug:** `adhd-vs-burnout`
- **Recommended above-fold:** comparison → `blog-engage--comparison`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Burnout is usually tied to prolonged occupational or caregiving stress and often improves with rest,…
- **Text density:** medium (715 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Why are so many adults diagnosed with ADHD late in life?

- **Slug:** `late-adhd-diagnosis-adults`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Childhood ADHD was often missed—especially in girls, high achievers, and inattentive types without h…
- **Text density:** low (45 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Can you have ADHD and still be high-functioning?

- **Slug:** `high-functioning-adhd`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Yes. Many adults with ADHD perform well outwardly while struggling privately with exhaustion, procra…
- **Text density:** low (49 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How does ADHD present differently in women?

- **Slug:** `adhd-in-women`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Women more often present with inattentive symptoms—daydreaming, disorganization, emotional dysregula…
- **Text density:** low (43 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How does adult ADHD present in men?

- **Slug:** `adhd-in-men`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Men may show more external restlessness, impulsivity, or risk-taking—but many men have primarily ina…
- **Text density:** low (48 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is time blindness in ADHD?

- **Slug:** `time-blindness-adhd`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Time blindness describes difficulty sensing how long tasks take, losing track of time, or chronicall…
- **Text density:** low (56 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is rejection sensitive dysphoria (RSD) and ADHD?

- **Slug:** `rejection-sensitivity-adhd`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** RSD describes intense emotional pain after perceived criticism or rejection. It is not an official D…
- **Text density:** low (56 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is executive dysfunction in adult ADHD?

- **Slug:** `executive-dysfunction-adhd`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Executive dysfunction refers to difficulty with planning, prioritizing, initiating tasks, working me…
- **Text density:** low (49 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Can ADHD be diagnosed online?

- **Slug:** `can-adhd-be-diagnosed-online`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Yes—when a licensed clinician in your state conducts a full telehealth evaluation with clinical inte…
- **Text density:** medium (518 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Is online ADHD diagnosis legitimate?

- **Slug:** `is-online-adhd-diagnosis-legitimate`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Online ADHD diagnosis is legitimate when a licensed provider in your state conducts an adequate visi…
- **Text density:** medium (501 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How much does ADHD testing cost?

- **Slug:** `how-much-does-adhd-testing-cost`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Costs vary widely: some clinics charge $500–$2,000+; Siya Health offers a transparent $199 comprehen…
- **Text density:** low (54 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How long does an ADHD evaluation take?

- **Slug:** `how-long-adhd-evaluation`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** A thorough adult ADHD evaluation typically takes 60–90 minutes of face-to-face clinician time, plus …
- **Text density:** low (44 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Adderall vs Vyvanse for adults: what is the difference?

- **Slug:** `adderall-vs-vyvanse-adults`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Both are stimulant medications used for ADHD when clinically appropriate. Adderall (mixed amphetamin…
- **Text density:** low (55 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What are common ADHD medication side effects?

- **Slug:** `adhd-medication-side-effects`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Stimulants may cause decreased appetite, insomnia, increased heart rate or blood pressure, anxiety, …
- **Text density:** low (53 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Is ADHD medication safe long term?

- **Slug:** `is-adhd-medication-safe-long-term`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** For many appropriately monitored adults, stimulant and non-stimulant ADHD medications have favorable…
- **Text density:** low (50 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What non-stimulant ADHD medications exist for adults?

- **Slug:** `non-stimulant-adhd-medications`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** When stimulants are contraindicated, poorly tolerated, or insufficient, clinicians may consider FDA-…
- **Text density:** medium (585 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What should adults expect when starting ADHD medication?

- **Slug:** `starting-adhd-medication-adults`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Adults starting ADHD medication should expect a structured titration plan, baseline vitals when indi…
- **Text density:** medium (581 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Do you have to take ADHD medication every day?

- **Slug:** `adhd-medication-every-day`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Some adults take medication daily; others use weekday-only or situational dosing when clinically app…
- **Text density:** low (39 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Can you get ADHD medication online?

- **Slug:** `can-you-get-adhd-medication-online`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** In eligible states, yes—after a legitimate telehealth evaluation and ongoing relationship with a lic…
- **Text density:** low (43 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is the ASRS ADHD screening test?

- **Slug:** `asrs-adhd-screening-explained`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** The Adult ADHD Self-Report Scale (ASRS) is a validated screening questionnaire—not a diagnosis. It h…
- **Text density:** low (48 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is Creyos cognitive testing for ADHD?

- **Slug:** `creyos-adhd-testing-explained`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Creyos is a digital cognitive assessment battery sometimes used alongside clinical interview and rat…
- **Text density:** low (46 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is the difference between ADHD screening and a full evaluation?

- **Slug:** `screening-vs-adhd-evaluation`
- **Recommended above-fold:** comparison → `blog-engage--comparison`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Screening (e.g., ASRS, short online quizzes) estimates likelihood and takes minutes. A full evaluati…
- **Text density:** low (46 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What are GLP-1 side effects?

- **Slug:** `glp-1-side-effects`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Common GLP-1 receptor agonist side effects include nausea, vomiting, diarrhea, constipation, reflux,…
- **Text density:** medium (608 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How does semaglutide work for weight loss?

- **Slug:** `semaglutide-weight-loss-how-it-works`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Semaglutide mimics glucagon-like peptide-1 (GLP-1), slowing gastric emptying, reducing appetite sign…
- **Text density:** medium (584 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Tirzepatide vs semaglutide: which is better for weight loss?

- **Slug:** `tirzepatide-vs-semaglutide`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Both are prescription GLP-1–based therapies with strong trial data in eligible adults. Tirzepatide (…
- **Text density:** low (54 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Compounded vs branded GLP-1: what is the difference?

- **Slug:** `compounded-vs-branded-glp-1`
- **Recommended above-fold:** comparison → `blog-engage--comparison`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Branded FDA-approved GLP-1 medicines undergo standardized manufacturing, labeling, and post-market s…
- **Text density:** low (47 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Is phentermine safe for weight loss?

- **Slug:** `phentermine-weight-loss-safety`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Phentermine is an FDA-approved short-term appetite suppressant for select patients when benefits out…
- **Text density:** low (47 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Oral vs injectable weight loss medications: pros and cons?

- **Slug:** `oral-vs-injectable-weight-loss-meds`
- **Recommended above-fold:** comparison → `blog-engage--comparison`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Injectables (weekly GLP-1 agents) dominate recent trial outcomes but require needles and titration. …
- **Text density:** low (48 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Medical weight loss vs dieting: what works better?

- **Slug:** `medical-weight-loss-vs-dieting`
- **Recommended above-fold:** comparison → `blog-engage--comparison`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Sustainable weight change usually combines nutrition, movement, sleep, behavioral support, and—when …
- **Text density:** low (47 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How do you manage GLP-1 nausea?

- **Slug:** `glp-1-nausea-management`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Clinicians start low and titrate slowly, advise smaller meals, avoid greasy foods, stay hydrated, an…
- **Text density:** low (42 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Who qualifies for GLP-1 weight loss medications?

- **Slug:** `who-qualifies-glp-1-weight-loss`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Eligibility generally follows FDA indications: typically BMI thresholds with comorbidities, or highe…
- **Text density:** low (42 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Is there a connection between ADHD and weight loss struggles?

- **Slug:** `adhd-and-weight-loss-connection`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Yes. Impulsivity, emotional eating, irregular meals, sleep debt, and stimulant effects on appetite a…
- **Text density:** low (45 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is insulin resistance?

- **Slug:** `what-is-insulin-resistance`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Insulin resistance means your cells respond less efficiently to insulin, so the pancreas often relea…
- **Text density:** medium (648 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Can you have insulin resistance without diabetes?

- **Slug:** `insulin-resistance-without-diabetes`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Yes—you can have insulin resistance for years while blood sugar still looks normal because the pancr…
- **Text density:** medium (511 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Can you have insulin resistance with a normal A1C?

- **Slug:** `normal-a1c-insulin-resistance`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Yes. A1C reflects average blood glucose over roughly three months, not how hard your pancreas works …
- **Text density:** medium (542 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is food noise?

- **Slug:** `what-is-food-noise`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Food noise is persistent, intrusive thinking about food—planning meals, craving, or mental “backgrou…
- **Text density:** medium (581 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Why am I tired even after sleeping?

- **Slug:** `why-am-i-tired-even-after-sleeping`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Time in bed is not the same as restorative sleep. Common causes include obstructive sleep apnea, ins…
- **Text density:** low (141 words, 1 sections)
- **Engagement potential:** low
- **Text decision section in seed:** generator


### Can sleep apnea cause fatigue?

- **Slug:** `can-sleep-apnea-cause-fatigue`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Yes. Obstructive sleep apnea fragments sleep with repeated breathing reductions and intermittent hyp…
- **Text density:** low (123 words, 1 sections)
- **Engagement potential:** low
- **Text decision section in seed:** generator


### What are the signs of sleep apnea in adults?

- **Slug:** `signs-of-sleep-apnea-in-adults`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Clues include habitual snoring, witnessed breathing pauses or gasping, unrefreshing sleep, daytime s…
- **Text density:** low (100 words, 1 sections)
- **Engagement potential:** low
- **Text decision section in seed:** generator


### Can poor sleep feel like ADHD?

- **Slug:** `poor-sleep-feels-like-adhd`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** custom → `blog-engage--override`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Yes. Chronic poor sleep—especially fragmented sleep from insomnia or obstructive sleep apnea—commonl…
- **Text density:** medium (599 words, 3 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Why do I get brain fog after eating?

- **Slug:** `brain-fog-after-eating`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Post-meal brain fog is common and usually multifactorial. Large or high-glycemic meals, reactive glu…
- **Text density:** medium (701 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What is free testosterone?

- **Slug:** `what-is-free-testosterone`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Free testosterone is the small fraction of testosterone in blood that is not tightly bound—chiefly t…
- **Text density:** medium (524 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What does low testosterone feel like?

- **Slug:** `what-does-low-testosterone-feel-like`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Possible symptoms include low energy, reduced libido, depressed mood, decreased muscle mass, increas…
- **Text density:** low (50 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### When is testosterone therapy appropriate?

- **Slug:** `when-is-testosterone-therapy-appropriate`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Testosterone replacement therapy (TRT) may be appropriate for men with consistent symptoms of androg…
- **Text density:** medium (532 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What monitoring is required on testosterone therapy?

- **Slug:** `trt-monitoring-requirements`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Testosterone therapy requires baseline and follow-up monitoring tailored to formulation and patient …
- **Text density:** medium (514 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### What should you expect from sildenafil for erectile dysfunction?

- **Slug:** `sildenafil-erectile-dysfunction-expectations`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Sildenafil improves erectile response when sexual stimulation is present; it is not an automatic aph…
- **Text density:** low (47 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Does minoxidil work for hair loss?

- **Slug:** `minoxidil-hair-loss-does-it-work`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Topical minoxidil is FDA-approved for androgenetic alopecia in men and women and slows loss or regro…
- **Text density:** low (54 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Oral vs topical minoxidil: which is right?

- **Slug:** `oral-vs-topical-minoxidil`
- **Recommended above-fold:** comparison → `blog-engage--comparison`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Topical minoxidil is first-line for many patients due to localized action and established OTC/Rx for…
- **Text density:** low (43 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Is telehealth for erectile dysfunction legitimate?

- **Slug:** `ed-telehealth-legitimate`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Yes when a licensed clinician takes history, reviews medications (especially nitrates), discusses ca…
- **Text density:** low (38 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Can low testosterone mimic ADHD?

- **Slug:** `testosterone-and-adhd-overlap`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Low testosterone and ADHD can both cause fatigue, low motivation, and concentration problems. Labs a…
- **Text density:** low (45 words, 1 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How do online prescriptions work legally?

- **Slug:** `how-online-prescriptions-work`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** A licensed clinician in your state evaluates you via telehealth (or approved in-person care), docume…
- **Text density:** low (500 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Is telehealth legitimate for medical care?

- **Slug:** `is-telehealth-legitimate`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Legitimate telehealth uses licensed clinicians, HIPAA-compliant communication, informed consent, doc…
- **Text density:** medium (505 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### How does ADHD telehealth work in California?

- **Slug:** `telehealth-adhd-california`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** California residents may receive adult ADHD evaluation and follow-up via telehealth when treated by …
- **Text density:** low (51 words, 1 sections)
- **Engagement potential:** low
- **Text decision section in seed:** generator


### How does ADHD telehealth work in Texas?

- **Slug:** `telehealth-adhd-texas`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Texas adults can complete structured ADHD telehealth evaluations with Texas-licensed clinicians, inc…
- **Text density:** low (40 words, 1 sections)
- **Engagement potential:** low
- **Text decision section in seed:** generator


### Can you use FSA or HSA for ADHD evaluation?

- **Slug:** `fsa-hsa-adhd-evaluation`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Many patients use FSA/HSA debit cards for qualified medical expenses including physician telehealth …
- **Text density:** low (42 words, 1 sections)
- **Engagement potential:** low
- **Text decision section in seed:** generator


### What is included in Siya Health’s $199 ADHD evaluation?

- **Slug:** `what-included-199-adhd-evaluation`
- **Recommended above-fold:** infographic → `blog-engage--infographic`
- **Placement:** After short answer (above the fold)
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Siya Health’s $199 adult ADHD evaluation is a 60–90 minute telehealth visit with a board-certified, …
- **Text density:** low (49 words, 1 sections)
- **Engagement potential:** low
- **Text decision section in seed:** generator


### What happens in a telehealth Meet & Greet?

- **Slug:** `meet-and-greet-telehealth-expectations`
- **Recommended above-fold:** flowchart → `blog-engage--flowchart`
- **Placement:** After short answer (above the fold)
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** A telehealth Meet & Greet is a brief, low-pressure introduction to confirm service fit, review offer…
- **Text density:** medium (506 words, 6 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** generator


### Why don't normal labs mean you're healthy?

- **Slug:** `why-normal-labs-dont-mean-healthy`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** “Normal labs” usually means values fall inside population reference ranges—not that you feel well, s…
- **Text density:** medium (819 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** yes (seed)


### Why did food noise come back on GLP-1?

- **Slug:** `food-noise-returned-on-glp-1`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** “Food noise”—intrusive thoughts about eating—often quiets when GLP-1 therapy is working, but it can …
- **Text density:** medium (779 words, 7 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** yes (seed)


### Why am I gaining weight after stopping Ozempic?

- **Slug:** `weight-gain-after-stopping-ozempic`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** After stopping semaglutide (Ozempic or Wegovy), appetite hormones and gastric emptying patterns ofte…
- **Text density:** medium (746 words, 8 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** yes (seed)


### Why do I crash every afternoon after lunch?

- **Slug:** `afternoon-energy-crash-after-lunch`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** myth → `blog-engage--myth`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** A predictable afternoon slump 60–120 minutes after lunch is common. When it is daily, severe, or pai…
- **Text density:** medium (729 words, 8 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** yes (seed)


### What does high SHBG with low free testosterone mean?

- **Slug:** `high-shbg-low-free-testosterone`
- **Recommended above-fold:** custom → `blog-engage--override`
- **Placement:** After short answer
- **Mid visual:** pearl → `blog-engage--pearl`
- **Decision support:** `blog-engage--decision` (after sections)
- **Evidence snapshot:** `blog-engage--evidence` (before reference bullets)
- **Supporting copy hook:** Sex hormone-binding globulin (SHBG) binds testosterone tightly; when SHBG is high, the **free testos…
- **Text density:** medium (711 words, 8 sections)
- **Engagement potential:** medium
- **Text decision section in seed:** yes (seed)



## Notes

- Re-run `npm run build` then this script to refresh `Engage blocks` column from generated HTML.
- Tier-1 overrides: `poor-sleep-feels-like-adhd`, `brain-fog-after-eating`, Phase 3 slugs, `adderall-vs-vyvanse`, `tirzepatide-vs-semaglutide`.
- No new URLs; no blog posts.
