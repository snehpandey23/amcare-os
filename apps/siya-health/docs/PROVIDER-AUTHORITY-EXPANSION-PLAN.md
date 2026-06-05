# Provider Authority Expansion Plan

Generated: 2026-06-05  
Scope: Internal audit — **no public page changes in this pass**  
Goal: Every provider profile should have **≥20 inbound internal links**

Method: Scanned production HTML (excludes `public/` mirror). Counts links to `/providers/{slug}`.

---

## Authority score formula

```
authorityScore =
  inboundLinks
  + (serviceAssignments × 2)
  + (primaryReviewerTopics × 4)
  + (secondaryReviewerTopics × 2)
  + (supportReviewerTopics × 1)
  + (homepageCard ? 5 : 0)
  + (hubCard ? 3 : 0)
  + (featured ? 5 : 0)
  + floor(answerSeedAssignments ÷ 5)
```

`answerSeedAssignments` = rows in `answer-seeds.mjs` with `reviewerSlug` (routing intent; Wave 1 review currently rolled back).

---

## Provider authority matrix (sorted: lowest inbound first)

| Provider | Inbound | Services | Answer seeds | Reviewer roles | Home | Hub | Featured | **Score** | **≥20 links?** |
|----------|--------:|----------|-------------:|----------------|:----:|:---:|:--------:|:---------:|:--------------:|
| Wendy Delgado, PA-C | **7** | 2 | 0 | support: metabolic | ✅ | ✅ | ❌ | **20** | ❌ |
| Dr. Vanessa Urbina | **9** | 3 | 0 | primary: primaryCare | ✅ | ✅ | ✅ | **32** | ❌ |
| Derek Timbs, FNP-BC | **9** | 3 | 0 | primary: metabolic, mensHealth | ✅ | ✅ | ❌ | **31** | ❌ |
| Megan Wunderlich, FNP-C | **12** | 2 | 0 | secondary: adhdBehavioral, telehealthTrust | ✅ | ✅ | ❌ | **28** | ❌ |
| Dr. Swati Pandey | **13** | 2 | 6 | primary: adhdMedication | ✅ | ✅ | ✅ | **35** | ❌ |
| Dr. Natasha Desai | **18** | 3 | 13 | primary: adhdBehavioral; secondary: adhdEval | ✅ | ✅ | ✅ | **45** | ❌ |
| Dr. Sneh Pandey | **26** | 5 | 46 | primary: adhdEval, telehealthTrust; secondary ×4 | ✅ | ✅ | ✅ | **74** | ✅ |

**Hub exposure:** `/providers` linked from **159** pages (sitewide).

---

## Service ownership (current)

| Service | Primary owners (recommended) | Slugs on page today |
|---------|------------------------------|---------------------|
| ADHD evaluation | Sneh (primary), Natasha, Swati, Megan | 4 |
| Weight / metabolic | Derek (primary), Sneh, Vanessa, Wendy | 4 |
| Primary / urgent care | Vanessa (primary), Natasha, Sneh | 3 |
| Men's health | Derek (primary), Sneh | 2 |
| Telehealth trust | Sneh (primary), Megan (secondary) | 7 (all) |

---

## Missing provider-to-content relationships

| Provider | Gap | Recommended links |
|----------|-----|-------------------|
| **Wendy** | 13 links short of 20 | `/blog/food-noise-*`, `/answers/what-is-food-noise`, `/answers/who-qualifies-glp-1`, CA weight-loss geo pages, `membership-pricing` metabolic FAQ |
| **Vanessa** | 11 short | `/blog/online-adhd-diagnosis-*` (FL), `/primary-urgent-care`, `/adhd-care` FL callout, `/answers/can-adhd-be-diagnosed-online`, Florida geo diagnosis pages |
| **Derek** | 11 short | `/blog/glp1-side-effects*`, `/blog/medical-weight-loss-glp1-texas`, `/mens-health-longevity`, `/answers/who-qualifies-glp-1`, TX/OH telehealth pages |
| **Megan** | 8 short | `/answers/screening-vs-adhd-evaluation`, `/adhd-screening`, PA geo pages, `/blog/how-to-know-if-you-have-adhd-adult` (screening CTA) |
| **Swati** | 7 short | `/blog/how-adhd-medication-is-prescribed-online`, `/answers/adhd-medication-side-effects`, PA ADHD geo pages, medication option blogs |
| **Natasha** | 2 short | `/blog/youre-not-lazy-*`, `/answers/adhd-vs-anxiety`, `/answers/adhd-in-women` — already strong; add 2 service cross-links |

---

## Recommended URL → provider link map

### Wendy Delgado
- `/weight-loss-metabolic-health` — already listed ✅
- `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` — add “Meet Wendy” card
- `/answers/what-is-food-noise` — footer provider strip
- `/answers/who-qualifies-glp-1-weight-loss` — co-list with Derek
- `/membership-pricing` — metabolic plan clinician note

### Dr. Vanessa Urbina
- `/primary-urgent-care` — already listed ✅
- `/adhd-diagnosis-florida` — state care-team card
- `/blog/online-adhd-diagnosis-texas` — cross-state FL sibling page (create or link from FL hub)
- `/answers/can-adhd-be-diagnosed-online` — FL-licensed clinician callout

### Derek Timbs
- `/mens-health-longevity` — already listed ✅
- `/blog/glp1-side-effects-and-how-to-manage-them`
- `/blog/medical-weight-loss-glp1-semaglutide-texas`
- `/answers/glp-1-side-effects`
- `/answers/tirzepatide-vs-semaglutide`

### Megan Wunderlich
- `/adhd-care` — already listed ✅
- `/adhd-screening`
- `/answers/screening-vs-adhd-evaluation`
- `/adhd-diagnosis-pennsylvania`
- `/adhd-diagnosis-philadelphia`

### Dr. Swati Pandey
- `/adhd-care` — already listed ✅
- `/blog/how-adhd-medication-is-prescribed-online`
- `/blog/adhd-medication-options-for-adults`
- `/answers/adhd-medication-side-effects`
- `/adhd-diagnosis-pennsylvania`

### Dr. Natasha Desai
- `/blog/youre-not-lazy-signs-undiagnosed-adult-adhd`
- `/blog/adhd-symptoms-overlooked`
- `/answers/adhd-vs-anxiety`
- `/answers/adhd-in-women`
- `/blog/online-adhd-diagnosis-texas` — already partially linked

### Dr. Sneh Pandey
- Maintain — **26 inbound**; continue as Medical Director anchor on homepage conversion module, all service `#meet-physicians` blocks, and cornerstone metabolic/ADHD content.

---

## Blog & answer assignment intent (data layer)

| Provider | Answer seeds (`reviewerSlug`) | Planned reviewer ownership |
|----------|------------------------------:|--------------------------|
| Sneh | 46 | adhdEval, telehealthTrust + metabolic/mens secondary |
| Natasha | 13 | adhdBehavioral + adhdEval secondary |
| Swati | 6 | adhdMedication |
| Vanessa | 0 | primaryCare — **assign FL primary-care answers** |
| Megan | 0 | adhdBehavioral secondary — **assign screening answers** |
| Derek | 0 | metabolic, mensHealth — **assign GLP-1 / TRT answers** |
| Wendy | 0 | metabolic support — **assign food-noise / CA weight answers** |

*Note: `CLINICAL_REVIEW_APPROVED` is empty until sign-off; seeds define routing intent only.*

---

## Implementation priority (link equity only)

| Priority | Provider | Links needed | Fastest wins |
|----------|----------|-------------:|--------------|
| P0 | Wendy | +13 | Weight-loss blog cluster + 3 answers |
| P0 | Vanessa | +11 | FL geo pages + primary-care answers |
| P0 | Derek | +11 | GLP-1 blog/answer cluster |
| P1 | Megan | +8 | Screening page + PA geo |
| P1 | Swati | +7 | Medication blog/answer cluster |
| P2 | Natasha | +2 | 2 behavioral blog footer cards |

**Target:** Re-audit after link injection; all seven profiles ≥20 inbound (excluding `public/`).

---

## Authority distribution summary

Authority is **concentrated on Sneh** (Medical Director, 5 services, 46 answer seeds, 26 inbound). APP clinicians and Vanessa/Wendy are **under-linked** relative to service assignments. Expanding internal links to match `SERVICE_PROVIDER_SLUGS` and `REVIEWER_OWNERSHIP` will balance E-E-A-T without changing clinical claims.
