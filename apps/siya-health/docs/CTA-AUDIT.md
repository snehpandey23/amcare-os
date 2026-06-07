# CTA Audit — Siya Health

Generated: 2026-06-07T07:46:15.748Z

> Audit-only deliverable. No pages were modified. Footer CTAs are inventoried but flagged as frozen per prior sprints.

Related: [UX-CTA-AUDIT-BEFORE.md](./UX-CTA-AUDIT-BEFORE.md) · [UX-CTA-AUDIT-AFTER.md](./UX-CTA-AUDIT-AFTER.md)

## Executive summary

Scanned **166** indexable pages (per `data/website-inventory.json`).

| Metric | Value |
|--------|------:|
| Total CTA instances | 1169 |
| Unique CTA labels | 66 |
| Unique CTA patterns (label + URL + type + zone) | 95 |
| Booking label variants | 7 |
| Instances to **KEEP** | 323 |
| Instances to **CONSOLIDATE** | 528 |
| Instances to **REMOVE** | 318 |
| Pages with >3 CTAs in `<main>` | 28 |
| Pages with duplicate booking in `<main>` | 23 |
| **Chaos score** (higher = worse) | **357** |

**Fragmentation:** 66 distinct labels and 7 booking variants across 166 pages — far above the target **3-slot** system. Prior UX sprint reduced buttons (~925→704) but label/URL duplication remains.

## Recommended final CTA system

| Slot | Label | URL | Usage rules |
|------|-------|-----|-------------|
| **Primary** | Talk to a Clinician | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=sysv73e4` | One per page max in hero **or** final `cta-band`; nav may repeat same label. Consolidate all booking variants (Book ADHD Evaluation, Book a Meet & Greet, Book with {name}, etc.). |
| **Secondary** | Explore Services | `/telehealth` (contextual: `/adhd-care`, `/weight-loss-metabolic-health`, etc.) | Optional, one max in hero or final band. ADHD funnel may use Free ADHD Screening instead on service/screening pages only. |
| **Newsletter** | Siya Circle | `https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl` | Footer Company column only (+ dedicated promo on `/answers` hub). Do not add to hero or article bodies. |

## Sitewide inventory table

| Label | URL | Type | Zone | Count | Pages (sample) | Recommendation |
|-------|-----|------|------|------:|----------------|----------------|
| Talk to a Clinician | `https://book.carepatron.com/Siya-Health` | booking | nav | 204 | `/`, `/about`, `/answers`… | **CONSOLIDATE** (primary) |
| Talk to a Clinician | `https://book.carepatron.com/Siya-Health` | booking | footer | 162 | `/`, `/about`, `/adhd-care`… | **CONSOLIDATE** (primary) |
| Free ADHD screening | `/adhd-screening` | screening | footer-links | 161 | `/`, `/about`, `/adhd-care`… | **KEEP** |
| Siya Circle | `https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl` | newsletter | footer-links | 161 | `/`, `/about`, `/adhd-care`… | **KEEP** (newsletter) |
| Talk to a Clinician | `https://book.carepatron.com/Siya-Health` | booking | main | 115 | `/`, `/adhd-screening`, `/answers/adderall-vs-vyvanse-adults`… | **REMOVE** |
| Book ADHD Evaluation | `https://book.carepatron.com/Siya-Health` | booking | nav | 56 | `/adhd-care`, `/adhd-diagnosis-austin`, `/adhd-diagnosis-florida`… | **CONSOLIDATE** (primary) |
| Start Free Screening | `/adhd-screening` | screening | nav | 50 | `/answers/adderall-vs-vyvanse-adults`, `/answers/adhd-in-men`, `/answers/adhd-in-women`… | **REMOVE** |
| Talk to a Clinician | `https://book.carepatron.com/Siya-Health` | booking | main | 38 | `/about`, `/adhd-diagnosis-austin`, `/adhd-diagnosis-florida`… | **CONSOLIDATE** (primary) |
| Free ADHD screening (not a diagnosis) | `/adhd-screening` | screening | main | 25 | `/answers/adderall-vs-vyvanse-adults`, `/answers/adhd-in-men`, `/answers/adhd-in-women`… | **REMOVE** |
| Book ADHD Evaluation | `https://book.carepatron.com/Siya-Health` | booking | main | 18 | `/adhd-care`, `/blog/adderall-for-adhd-how-it-works`, `/blog/adult-adhd-symptoms-california`… | **REMOVE** |
| online ADHD screening | `/online-adhd-test` | screening | main | 17 | `/blog/adderall-for-adhd-how-it-works`, `/blog/adhd`, `/blog/adhd-evaluation-cost-texas`… | **REMOVE** |
| Talk to a Clinician | `https://book.carepatron.com/Siya-Health` | provider-booking | main | 14 | `/providers/derek-timbs`, `/providers/dr-natasha-desai`, `/providers/dr-sneh-pandey`… | **CONSOLIDATE** (primary) |
| View Services | `#services-supported` | secondary-other | main | 14 | `/providers/derek-timbs`, `/providers/dr-natasha-desai`, `/providers/dr-sneh-pandey`… | **REMOVE** |
| Book ADHD Evaluation | `https://book.carepatron.com/Siya-Health` | booking | main | 12 | `/adhd-diagnosis-austin`, `/adhd-diagnosis-florida`, `/adhd-diagnosis-houston`… | **CONSOLIDATE** (primary) |
| Free 2-minute screening | `/adhd-screening` | screening | main | 11 | `/adhd-diagnosis-austin`, `/adhd-diagnosis-florida`, `/adhd-diagnosis-houston`… | **CONSOLIDATE** (secondary) |
| Free screening | `/adhd-screening` | screening | main | 11 | `/adhd-diagnosis-austin`, `/adhd-diagnosis-florida`, `/adhd-diagnosis-houston`… | **CONSOLIDATE** (secondary) |
| Free ADHD Screening | `/adhd-screening` | screening | main | 3 | `/adhd-care` | **CONSOLIDATE** (secondary) |
| Read the full clinical guide | `/blog/why-am-i-always-tired-causes-when-to-see-doctor` | content-crosslink | main | 3 | `/answers/afternoon-energy-crash-after-lunch`, `/answers/poor-sleep-feels-like-adhd`, `/answers/why-am-i-tired-even-after-sleeping` | **REMOVE** |
| Free vs total testosterone: what patients should know (full guide) | `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | content-crosslink | main | 3 | `/answers/high-shbg-low-free-testosterone`, `/answers/what-does-low-testosterone-feel-like`, `/answers/what-is-free-testosterone` | **REMOVE** |
| Insulin resistance and weight loss (clinician overview) | `/blog/insulin-resistance-and-weight-loss-clinician-overview` | content-crosslink | main | 3 | `/answers/insulin-resistance-without-diabetes`, `/answers/normal-a1c-insulin-resistance`, `/answers/what-is-insulin-resistance` | **REMOVE** |
| Join Siya Circle | `https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl` | newsletter | main | 3 | `/blog`, `/siya-circle` | **REMOVE** |
| View profile | `/providers/dr-swati-pandey` | secondary-service | main | 2 | `/`, `/about` | **REMOVE** |
| Explore Telehealth Care | `/telehealth` | secondary-service | main | 2 | `/about`, `/providers` | **CONSOLIDATE** (secondary) |
| Read the full clinical guide | `/blog/insulin-resistance-and-weight-loss-clinician-overview` | content-crosslink | main | 2 | `/answers/brain-fog-after-eating`, `/answers/why-normal-labs-dont-mean-healthy` | **REMOVE** |
| Sleep apnea, fatigue, and metabolic risk (full guide) | `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign` | content-crosslink | main | 2 | `/answers/can-sleep-apnea-cause-fatigue`, `/answers/signs-of-sleep-apnea-in-adults` | **REMOVE** |
| Food noise and GLP-1: what it means and what helps (full guide) | `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | content-crosslink | main | 2 | `/answers/food-noise-returned-on-glp-1`, `/answers/what-is-food-noise` | **REMOVE** |
| GLP-1 side effects and how to manage them (full guide) | `/blog/glp1-side-effects-and-how-to-manage-them` | content-crosslink | main | 2 | `/answers/glp-1-nausea-management`, `/answers/glp-1-side-effects` | **REMOVE** |
| When is testosterone therapy appropriate? (full guide) | `/blog/when-is-testosterone-therapy-appropriate` | content-crosslink | main | 2 | `/answers/trt-monitoring-requirements`, `/answers/when-is-testosterone-therapy-appropriate` | **REMOVE** |
| Explore Care Options | `/weight-loss-metabolic-health` | secondary-service | main | 2 | `/blog/food-noise-and-glp-1-what-it-means-and-what-helps`, `/blog/insulin-resistance-and-weight-loss-clinician-overview` | **REMOVE** |
| Learn More | `#coming-soon` | secondary-other | main | 2 | `/labs`, `/prescriptions` | **REMOVE** |
| View Legal Documents | `/legal` | secondary-other | main | 2 | `/privacy-policy`, `/terms` | **REMOVE** |
| Explore Health Guides | `/answers` | secondary-other | main | 2 | `/siya-circle` | **CONSOLIDATE** (secondary) |
| See pricing | `/pricing` | secondary-text | main | 1 | `/` | **REMOVE** |
| Free screening → | `/adhd-screening` | screening | main | 1 | `/` | **REMOVE** |
| Free ADHD screening | `/adhd-screening` | screening | main | 1 | `/` | **REMOVE** |
| Free ADHD Screening | `/adhd-screening` | screening | main | 1 | `/` | **REMOVE** |
| View profile | `/providers/dr-sneh-pandey` | secondary-service | main | 1 | `/` | **REMOVE** |
| View profile | `/providers/dr-vanessa-urbina` | secondary-service | main | 1 | `/` | **REMOVE** |
| View profile | `/providers/dr-natasha-desai` | secondary-service | main | 1 | `/` | **REMOVE** |
| View profile | `/providers/megan-wunderlich` | secondary-service | main | 1 | `/` | **REMOVE** |
| View profile | `/providers/derek-timbs` | secondary-service | main | 1 | `/` | **REMOVE** |
| View profile | `/providers/wendy-delgado` | secondary-service | main | 1 | `/` | **REMOVE** |
| free ADHD screening | `/adhd-screening` | screening | main | 1 | `/` | **REMOVE** |
| View Dr. Pandey's Profile | `/providers/dr-sneh-pandey` | button-other | main | 1 | `/about` | **REMOVE** |
| View profile | `/providers/dr-sneh-pandey` | secondary-service | main | 1 | `/about` | **CONSOLIDATE** (secondary) |
| View profile | `/providers/dr-natasha-desai` | secondary-service | main | 1 | `/about` | **CONSOLIDATE** (secondary) |
| free screening | `/online-adhd-test` | screening | main | 1 | `/adhd-diagnosis-austin` | **CONSOLIDATE** (secondary) |
| Join Siya Circle | `https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl` | newsletter | main | 1 | `/answers` | **KEEP** (newsletter) |
| View all Metabolic Health guides | `#guides-metabolic-all` | secondary-other | main | 1 | `/answers` | **REMOVE** |
| View all Energy & Fatigue guides | `#guides-energy-all` | secondary-other | main | 1 | `/answers` | **REMOVE** |
| View all Hormone Health guides | `#guides-hormone-all` | secondary-other | main | 1 | `/answers` | **REMOVE** |
| View all ADHD & Focus guides | `#guides-adhd-all` | secondary-other | main | 1 | `/answers` | **REMOVE** |
| View all Telehealth & Care guides | `#guides-telehealth-all` | secondary-other | main | 1 | `/answers` | **REMOVE** |
| Vyvanse vs Adderall: full comparison guide | `/blog/vyvanse-vs-adderall-differences` | content-crosslink | main | 1 | `/answers/adderall-vs-vyvanse-adults` | **REMOVE** |
| ADHD medication daily or as-needed (full guide) | `/blog/adhd-medication-daily-or-as-needed-adults` | content-crosslink | main | 1 | `/answers/adhd-medication-every-day` | **REMOVE** |
| ADHD medication side effects: what to expect (full guide) | `/blog/adhd-medication-side-effects-what-to-expect` | content-crosslink | main | 1 | `/answers/adhd-medication-side-effects` | **REMOVE** |
| Free ADHD screening (ASRS) | `/adhd-screening` | screening | main | 1 | `/answers/adhd-vs-anxiety` | **REMOVE** |
| Compounded vs branded GLP-1 medications (full guide) | `/blog/compounded-vs-branded-glp1-medications` | content-crosslink | main | 1 | `/answers/compounded-vs-branded-glp-1` | **REMOVE** |
| Is ADHD medication safe long-term? (full guide) | `/blog/is-adhd-medication-safe-long-term` | content-crosslink | main | 1 | `/answers/is-adhd-medication-safe-long-term` | **REMOVE** |
| Is online ADHD diagnosis legit? (full clinical guide) | `/blog/is-online-adhd-diagnosis-legit` | content-crosslink | main | 1 | `/answers/is-online-adhd-diagnosis-legitimate` | **REMOVE** |
| Medical weight loss vs dieting: what actually works (full guide) | `/blog/medical-weight-loss-vs-dieting-what-actually-works` | content-crosslink | main | 1 | `/answers/medical-weight-loss-vs-dieting` | **REMOVE** |
| Minoxidil for hair loss: does it work? (full guide) | `/blog/minoxidil-for-hair-loss-does-it-work` | content-crosslink | main | 1 | `/answers/minoxidil-hair-loss-does-it-work` | **REMOVE** |
| Non-stimulant ADHD medications explained (full guide) | `/blog/non-stimulant-adhd-medications-explained` | content-crosslink | main | 1 | `/answers/non-stimulant-adhd-medications` | **REMOVE** |
| Oral vs injectable weight-loss medications (full guide) | `/blog/oral-vs-injectable-weight-loss-medications` | content-crosslink | main | 1 | `/answers/oral-vs-injectable-weight-loss-meds` | **REMOVE** |
| Oral vs topical minoxidil: which is right? (full guide) | `/blog/oral-vs-topical-minoxidil-which-is-right` | content-crosslink | main | 1 | `/answers/oral-vs-topical-minoxidil` | **REMOVE** |
| Phentermine for weight loss: safety and effectiveness (full guide) | `/blog/phentermine-for-weight-loss-safety-and-effectiveness` | content-crosslink | main | 1 | `/answers/phentermine-weight-loss-safety` | **REMOVE** |
| Semaglutide for weight loss: how it works (full guide) | `/blog/semaglutide-for-weight-loss-how-it-works` | content-crosslink | main | 1 | `/answers/semaglutide-weight-loss-how-it-works` | **REMOVE** |
| Free ASRS screening | `/adhd-screening` | screening | main | 1 | `/answers/signs-of-adult-adhd` | **REMOVE** |
| Sildenafil for erectile dysfunction: what to expect (full guide) | `/blog/sildenafil-for-erectile-dysfunction-what-to-expect` | content-crosslink | main | 1 | `/answers/sildenafil-erectile-dysfunction-expectations` | **REMOVE** |
| ADHD telehealth in California (full overview) | `/blog/adhd-telehealth-california` | content-crosslink | main | 1 | `/answers/telehealth-adhd-california` | **REMOVE** |
| Tirzepatide vs semaglutide: full comparison guide | `/blog/tirzepatide-vs-semaglutide-which-is-better` | content-crosslink | main | 1 | `/answers/tirzepatide-vs-semaglutide` | **REMOVE** |
| Read the full clinical guide | `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | content-crosslink | main | 1 | `/answers/weight-gain-after-stopping-ozempic` | **REMOVE** |
| Medical weight loss with GLP-1 in Texas (full overview) | `/blog/medical-weight-loss-glp1-semaglutide-texas` | content-crosslink | main | 1 | `/answers/who-qualifies-glp-1-weight-loss` | **REMOVE** |
| Browse Health Guides | `/answers` | secondary-other | main | 1 | `/blog` | **CONSOLIDATE** (secondary) |
| Browse all articles → | `/blog` | button-other | main | 1 | `/blog` | **REMOVE** |
| Talk to a Clinician → | `https://book.carepatron.com/Siya-Health` | booking | main | 1 | `/blog` | **CONSOLIDATE** (primary) |
| Explore Care Options | `/mens-health-longevity` | secondary-service | main | 1 | `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | **REMOVE** |
| Explore metabolic health | `/weight-loss-metabolic-health` | secondary-service | main | 1 | `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign` | **REMOVE** |
| screening tool | `/online-adhd-test` | screening | main | 1 | `/blog/telehealth` | **REMOVE** |
| Explore Care Options | `/telehealth` | secondary-service | main | 1 | `/blog/why-am-i-always-tired-causes-when-to-see-doctor` | **REMOVE** |
| … | … | … | … | … | … | *15 more patterns in `data/cta-audit.json`* |

## Per-page-type rules

| Page type | Primary | Secondary | Newsletter | Remove |
|------|---------|-----------|------------|--------|
| Homepage | Hero only (drop testimonials + final-band duplicate) | Optional: Explore Services → /telehealth | Footer only | 7 profile buttons, mid-page booking, mobile sticky, hero pricing link → consolidate |
| Service pages | Hero OR final band (not both) | Contextual service or screening on ADHD pages | Footer only | Inline body booking, duplicate nav labels per funnel |
| About | Hero Talk to a Clinician | Explore Services → /telehealth | Footer only | Extra Meet & Greet variants, mid-section booking |
| Provider profiles | Hero booking (UTM OK) | None (bio is the content) | Footer only | Duplicate Book with {name} in body band |
| Blog articles | Final cta-band only | Optional contextual (/adhd-care) | Footer only | Nav duplicate + inline `<p>` booking links + mid-article buttons |
| Health guides | Final cta-band only | Optional screening on ADHD guides | Footer only | Nav Meet & Greet variant, content-crosslink `.button.secondary` to blog |
| Legal | None in main | None | Footer only | Footer contact booking duplicates (inventory only) |

## Pages with excessive CTAs (>3 in `<main>`)

| Page | Main CTAs | Booking in main | Remove (labels) |
|------|----------:|----------------:|-----------------|
| `/` | 15 | 3 | Talk to a Clinician; See pricing; Free screening →; Free ADHD screening… |
| `/providers` | 9 | 1 | — |
| `/about` | 8 | 3 | View Dr. Pandey's Profile; View profile |
| `/adhd-care` | 7 | 4 | Book ADHD Evaluation; Book ADHD Evaluation; Book ADHD Evaluation; Book ADHD Evaluation |
| `/adhd-diagnosis-austin` | 6 | 3 | — |
| `/answers` | 6 | 0 | View all Metabolic Health guides; View all Energy & Fatigue guides; View all Hormone Health guides; View all ADHD & Focus guides… |
| `/online-adhd-test` | 6 | 4 | — |
| `/siya-circle` | 6 | 2 | Join Siya Circle; Join Siya Circle |
| `/adhd-diagnosis-florida` | 5 | 3 | — |
| `/adhd-diagnosis-houston` | 5 | 3 | — |
| `/adhd-diagnosis-pennsylvania` | 5 | 3 | — |
| `/adhd-diagnosis-philadelphia` | 5 | 3 | — |
| `/adhd-diagnosis-texas` | 5 | 3 | — |
| `/adhd-evaluation-cost` | 5 | 3 | — |
| `/adhd-treatment-online` | 5 | 3 | — |
| `/adult-adhd-diagnosis` | 5 | 3 | — |
| `/blog` | 5 | 2 | Join Siya Circle; Browse all articles → |
| `/book-appointment` | 5 | 4 | Talk to a Clinician; Choose Visit Type; Start Free ADHD Assessment; ADHD Care… |
| `/creyos-adhd-testing` | 5 | 3 | — |
| `/providers/megan-wunderlich` | 5 | 0 | View Services; Free ADHD screening →; View Services |
| `/mens-health-longevity` | 4 | 3 | Explore Care Options; Talk to a Clinician |
| `/primary-urgent-care` | 4 | 3 | Explore Care Options |
| `/providers/derek-timbs` | 4 | 0 | View Services; View Services |
| `/providers/dr-natasha-desai` | 4 | 0 | View Services; View Services |
| `/providers/dr-sneh-pandey` | 4 | 0 | View Services; View Services |
| `/providers/dr-swati-pandey` | 4 | 0 | View Services; View Services |
| `/providers/dr-vanessa-urbina` | 4 | 0 | View Services; View Services |
| `/providers/wendy-delgado` | 4 | 0 | View Services; View Services |

## Duplicate booking in `<main>` (same URL, multiple buttons)

**23** pages shown (top 30 in JSON). Worst offenders:

- `/adhd-care` — 4 booking CTAs in main
- `/book-appointment` — 4 booking CTAs in main
- `/online-adhd-test` — 4 booking CTAs in main
- `/` — 3 booking CTAs in main
- `/about` — 3 booking CTAs in main
- `/adhd-diagnosis-austin` — 3 booking CTAs in main
- `/adhd-diagnosis-florida` — 3 booking CTAs in main
- `/adhd-diagnosis-houston` — 3 booking CTAs in main
- `/adhd-diagnosis-pennsylvania` — 3 booking CTAs in main
- `/adhd-diagnosis-philadelphia` — 3 booking CTAs in main
- `/adhd-diagnosis-texas` — 3 booking CTAs in main
- `/adhd-evaluation-cost` — 3 booking CTAs in main
- `/adhd-treatment-online` — 3 booking CTAs in main
- `/adult-adhd-diagnosis` — 3 booking CTAs in main
- `/creyos-adhd-testing` — 3 booking CTAs in main

## Exact removal list

CTA label + URL patterns flagged **REMOVE** sitewide (sorted by instance count):

| Label | URL | Count | Note |
|-------|-----|------:|------|
| Talk to a Clinician | `https://book.carepatron.com/Siya-Health` | 115 | Mid-page booking — use hero OR final band only |
| Start Free Screening | `/adhd-screening` | 50 | Screening CTA outside ADHD hero/symptoms |
| Free ADHD screening (not a diagnosis) | `/adhd-screening` | 25 | Screening CTA outside ADHD hero/symptoms |
| Book ADHD Evaluation | `https://book.carepatron.com/Siya-Health` | 18 | Extra main booking beyond hero/final band |
| online ADHD screening | `/online-adhd-test` | 17 | Screening CTA outside ADHD hero/symptoms |
| View Services | `#services-supported` | 14 | In-page anchor button — not a sitewide CTA slot |
| Read the full clinical guide | `/blog/why-am-i-always-tired-causes-when-to-see-doctor` | 3 | Styled content cross-link — use text links in body, not button CTAs |
| Free vs total testosterone: what patients should know (full guide) | `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | 3 | Styled content cross-link — use text links in body, not button CTAs |
| Insulin resistance and weight loss (clinician overview) | `/blog/insulin-resistance-and-weight-loss-clinician-overview` | 3 | Styled content cross-link — use text links in body, not button CTAs |
| Join Siya Circle | `https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl` | 3 | Newsletter CTA belongs in footer or dedicated hub section only |
| View profile | `/providers/dr-swati-pandey` | 2 | Secondary explore link outside hero/final band |
| Read the full clinical guide | `/blog/insulin-resistance-and-weight-loss-clinician-overview` | 2 | Styled content cross-link — use text links in body, not button CTAs |
| Sleep apnea, fatigue, and metabolic risk (full guide) | `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign` | 2 | Styled content cross-link — use text links in body, not button CTAs |
| Food noise and GLP-1: what it means and what helps (full guide) | `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | 2 | Styled content cross-link — use text links in body, not button CTAs |
| GLP-1 side effects and how to manage them (full guide) | `/blog/glp1-side-effects-and-how-to-manage-them` | 2 | Styled content cross-link — use text links in body, not button CTAs |
| When is testosterone therapy appropriate? (full guide) | `/blog/when-is-testosterone-therapy-appropriate` | 2 | Styled content cross-link — use text links in body, not button CTAs |
| Explore Care Options | `/weight-loss-metabolic-health` | 2 | Secondary explore link outside hero/final band |
| Learn More | `#coming-soon` | 2 | In-page anchor button — not a sitewide CTA slot |
| View Legal Documents | `/legal` | 2 | Secondary explore link outside hero/final band |
| See pricing | `/pricing` | 1 | Secondary explore link outside hero/final band |
| Free screening → | `/adhd-screening` | 1 | Screening CTA outside ADHD hero/symptoms |
| Free ADHD screening | `/adhd-screening` | 1 | Screening CTA outside ADHD hero/symptoms |
| Free ADHD Screening | `/adhd-screening` | 1 | Screening CTA outside ADHD hero/symptoms |
| View profile | `/providers/dr-sneh-pandey` | 1 | Secondary explore link outside hero/final band |
| View profile | `/providers/dr-vanessa-urbina` | 1 | Secondary explore link outside hero/final band |
| View profile | `/providers/dr-natasha-desai` | 1 | Secondary explore link outside hero/final band |
| View profile | `/providers/megan-wunderlich` | 1 | Secondary explore link outside hero/final band |
| View profile | `/providers/derek-timbs` | 1 | Secondary explore link outside hero/final band |
| View profile | `/providers/wendy-delgado` | 1 | Secondary explore link outside hero/final band |
| free ADHD screening | `/adhd-screening` | 1 | Screening CTA outside ADHD hero/symptoms |
| View Dr. Pandey's Profile | `/providers/dr-sneh-pandey` | 1 | Misc button — not part of 3-slot system |
| View all Metabolic Health guides | `#guides-metabolic-all` | 1 | In-page anchor button — not a sitewide CTA slot |
| View all Energy & Fatigue guides | `#guides-energy-all` | 1 | In-page anchor button — not a sitewide CTA slot |
| View all Hormone Health guides | `#guides-hormone-all` | 1 | In-page anchor button — not a sitewide CTA slot |
| View all ADHD & Focus guides | `#guides-adhd-all` | 1 | In-page anchor button — not a sitewide CTA slot |
| View all Telehealth & Care guides | `#guides-telehealth-all` | 1 | In-page anchor button — not a sitewide CTA slot |
| Vyvanse vs Adderall: full comparison guide | `/blog/vyvanse-vs-adderall-differences` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| ADHD medication daily or as-needed (full guide) | `/blog/adhd-medication-daily-or-as-needed-adults` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| ADHD medication side effects: what to expect (full guide) | `/blog/adhd-medication-side-effects-what-to-expect` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Free ADHD screening (ASRS) | `/adhd-screening` | 1 | Screening CTA outside ADHD hero/symptoms |
| Compounded vs branded GLP-1 medications (full guide) | `/blog/compounded-vs-branded-glp1-medications` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Is ADHD medication safe long-term? (full guide) | `/blog/is-adhd-medication-safe-long-term` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Is online ADHD diagnosis legit? (full clinical guide) | `/blog/is-online-adhd-diagnosis-legit` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Medical weight loss vs dieting: what actually works (full guide) | `/blog/medical-weight-loss-vs-dieting-what-actually-works` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Minoxidil for hair loss: does it work? (full guide) | `/blog/minoxidil-for-hair-loss-does-it-work` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Non-stimulant ADHD medications explained (full guide) | `/blog/non-stimulant-adhd-medications-explained` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Oral vs injectable weight-loss medications (full guide) | `/blog/oral-vs-injectable-weight-loss-medications` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Oral vs topical minoxidil: which is right? (full guide) | `/blog/oral-vs-topical-minoxidil-which-is-right` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Phentermine for weight loss: safety and effectiveness (full guide) | `/blog/phentermine-for-weight-loss-safety-and-effectiveness` | 1 | Styled content cross-link — use text links in body, not button CTAs |
| Semaglutide for weight loss: how it works (full guide) | `/blog/semaglutide-for-weight-loss-how-it-works` | 1 | Styled content cross-link — use text links in body, not button CTAs |

## Booking label consolidation

Replace all variants with **Talk to a Clinician** → CarePatron canonical URL:

- `Talk to a Clinician` (✓ canonical)
- `Book ADHD Evaluation` (→ consolidate)
- `Talk to a Clinician →` (→ consolidate)
- `Start Free ADHD Assessment` (→ consolidate)
- `ADHD Care` (→ consolidate)
- `Weight Loss Consultation` (→ consolidate)
- `schedule a visit` (→ consolidate)

## By page type (instance counts)

| Page type | Instances | KEEP | CONSOLIDATE | REMOVE |
|-----------|----------:|-----:|------------:|-------:|
| Health Guide | 454 | 130 | 145 | 179 |
| Blog Article | 334 | 104 | 157 | 73 |
| Service Page | 127 | 28 | 80 | 19 |
| Provider Profile | 64 | 14 | 35 | 15 |
| Geo SEO Landing | 61 | 12 | 49 | 0 |
| Blog Hub | 27 | 8 | 15 | 4 |
| Homepage | 21 | 2 | 4 | 15 |
| Legal | 18 | 12 | 6 | 0 |
| Legacy | 14 | 4 | 6 | 4 |
| Provider Hub | 14 | 2 | 12 | 0 |
| About | 13 | 2 | 9 | 2 |
| Health Guide Hub | 11 | 3 | 3 | 5 |
| Utility | 11 | 2 | 7 | 2 |

