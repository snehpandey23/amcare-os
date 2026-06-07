# Site Pruning Audit — Siya Health

Generated: 2026-06-07

> Audit-only deliverable. No pages were modified.

Related: [WEBSITE-INVENTORY.md](./WEBSITE-INVENTORY.md) · [CANNIBALIZATION-PHASE1-FINAL.md](./CANNIBALIZATION-PHASE1-FINAL.md) · [CTA-AUDIT.md](./CTA-AUDIT.md) · [PROVIDER-CONSISTENCY-AUDIT.md](./PROVIDER-CONSISTENCY-AUDIT.md)

## Executive summary

Siya Health has **166 indexable pages** today. This audit recommends pruning to **76 pages** — a **54% reduction** — by deleting legacy stubs, consolidating geo/funnel duplicates, and redirecting cannibalizing guide→blog pairs. The goal is maximum trust and clarity with minimum maintenance: one pricing source, one ADHD funnel, two geo cornerstones (Texas + California blog), and **30 cornerstone URLs** that anchor SEO authority.

| Metric | Count |
|--------|------:|
| Current indexable pages | 166 |
| Recommended pages (after pruning) | 76 |
| DELETE | 8 |
| REDIRECT | 82 |
| MERGE | 3 |
| KEEP + REWRITE | 11 |
| KEEP (no rewrite) | 62 |
| Cornerstone pages | 30 |

## Classification summary

| Classification | Count | Action |
|----------------|------:|--------|
| KEEP | 62 | Retain as-is |
| KEEP + REWRITE | 11 | Retain; content/UX pass required |
| MERGE | 3 | Fold into target page, then redirect |
| REDIRECT | 82 | 301 to target; remove source |
| DELETE | 8 | Remove immediately (301 first if live) |

## Maintenance burden estimate

| Measure | Before | After | Change |
|---------|-------:|------:|--------|
| Indexable pages | 166 | 76 | **−90 (54%)** |
| Duplicate content streams eliminated | — | 90 | Redirects + deletes |
| Guide→blog duplicate pairs redirected | 17 | 17 | Phase 3 consolidation |
| Legacy legal stubs | 2 | 0 | DELETE after 301 |
| Geo landing pages | 7 | 1 | Texas cornerstone only |
| ADHD commercial funnel URLs | 6 | 2 | /adhd-care + /adhd-screening |

**Estimated ongoing maintenance reduction:** ~54% fewer pages to update on pricing/provider/copy changes; 3 blog category hubs merged into one; single pricing page replaces 4 pricing URLs.

## Delete immediately

| Source | Redirect target (if any) | Rationale |
|--------|--------------------------|-----------|
| `/adhd-diagnosis-florida` | `/adhd-care` | Thin geo landing; zero inbound links, orphan. Florida not a licensed priority state in entity-graph. |
| `/blog/all` | `/blog` | Redundant article index duplicating /blog hub; 4 inbound only from footer. High maintenance, no unique SEO value. |
| `/blog/ambien-and-sleep-medications-risks-and-benefits` | `/blog/insomnia-treatment-options-beyond-medication` | Off-scope sleep Rx content; Siya does not promote Ambien prescribing. 2 inbound, no conversion path. |
| `/blog/glutathione-and-peptides-what-do-they-actually-do` | `/mens-health-longevity` | Peptide marketing content outside current service scope; 2 inbound, maintenance with no revenue tie. |
| `/blog/modafinil-for-focus-and-fatigue-is-it-safe` | `/adhd-care` | Modafinil not a Siya service line; risks implying off-label prescribing. 4 inbound only. |
| `/privacy-policy` | `/legal/privacy-policy` | Legacy legal stub; canonical is /legal/privacy-policy. Zero inbound. Remove file after 301. |
| `/siya-circle` | `https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl` | Orphan utility page (0 inbound). Newsletter signup belongs in footer only per CTA audit. |
| `/terms` | `/legal/terms-of-use` | Legacy legal stub; canonical is /legal/terms-of-use. Zero inbound. Remove file after 301. |

## Redirect map (full)

| Source | Target | Phase | Rationale |
|--------|--------|------:|-----------|
| `/adhd-diagnosis-austin` | `/adhd-diagnosis-texas` | 1 | City geo page with 1 inbound; Texas state cornerstone absorbs Austin intent. |
| `/adhd-diagnosis-houston` | `/adhd-diagnosis-texas` | 1 | City geo page with 2 inbound; consolidate to single Texas geo cornerstone. |
| `/adhd-diagnosis-pennsylvania` | `/adhd-care` | 1 | Thin state geo (451 words, 1 inbound); PA coverage belongs as section on /adhd-care until traffic justifies standalone. |
| `/adhd-diagnosis-philadelphia` | `/adhd-diagnosis-pennsylvania` | 1 | City duplicate of PA state page; 1 inbound each, same offer. |
| `/adhd-evaluation-cost` | `/membership-pricing` | 1 | Standalone pricing page duplicates membership-pricing and adhd-care; consolidate single pricing source. |
| `/adhd-treatment-online` | `/adhd-care` | 1 | Post-diagnosis treatment belongs as section on /adhd-care; 1 inbound, thin duplicate. |
| `/adult-adhd-diagnosis` | `/adhd-care` | 1 | Overlaps /adhd-care H1 and offer; splits ADHD commercial intent across 3 URLs. |
| `/answers/adderall-vs-vyvanse-adults` | `/blog/vyvanse-vs-adderall-differences` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/adhd-and-weight-loss-connection` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/adhd-in-men` | `/answers/signs-of-adult-adhd` | 1 | Thin gender variant (348 words, 1 inbound); signs-of-adult-adhd covers presentation. |
| `/answers/adhd-in-women` | `/answers/signs-of-adult-adhd` | 1 | Thin gender variant (356 words, 3 inbound); consolidate to adult signs cornerstone guide. |
| `/answers/adhd-medication-side-effects` | `/blog/adhd-medication-side-effects-what-to-expect` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/adhd-vs-anxiety` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/adhd-vs-burnout` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/afternoon-energy-crash-after-lunch` | `/answers` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| `/answers/asrs-adhd-screening-explained` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/brain-fog-after-eating` | `/answers` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| `/answers/can-adhd-cause-anxiety` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/can-you-get-adhd-medication-online` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/compounded-vs-branded-glp-1` | `/blog/compounded-vs-branded-glp1-medications` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/creyos-adhd-testing-explained` | `/adhd-care` | 1 | Creyos FAQ with 1 inbound; merge into adhd-care evaluation section. |
| `/answers/ed-telehealth-legitimate` | `/telehealth` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /telehealth. |
| `/answers/executive-dysfunction-adhd` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/food-noise-returned-on-glp-1` | `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/food-noise-and-glp-1-what-it-means-and-what-helps. |
| `/answers/fsa-hsa-adhd-evaluation` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/glp-1-nausea-management` | `/blog/glp1-side-effects-and-how-to-manage-them` | 1 | Cannibalization owner Blog; nausea subset fully covered in GLP-1 side effects cornerstone. |
| `/answers/glp-1-side-effects` | `/blog/glp1-side-effects-and-how-to-manage-them` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/high-functioning-adhd` | `/blog/how-to-know-if-you-have-adhd-adult` | 1 | Thin guide (350 words); high-functioning narrative covered in adult ADHD cornerstone blog. |
| `/answers/high-shbg-low-free-testosterone` | `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/free-testosterone-vs-total-testosterone-what-patients-should-know. |
| `/answers/how-long-adhd-evaluation` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/how-much-does-adhd-testing-cost` | `/membership-pricing` | 1 | Pricing FAQ duplicates membership-pricing and adhd-care pricing sections. |
| `/answers/how-online-prescriptions-work` | `/answers` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| `/answers/insulin-resistance-without-diabetes` | `/blog/insulin-resistance-and-weight-loss-clinician-overview` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/insulin-resistance-and-weight-loss-clinician-overview. |
| `/answers/is-adhd-medication-safe-long-term` | `/blog/is-adhd-medication-safe-long-term` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/is-online-adhd-diagnosis-legitimate` | `/blog/is-online-adhd-diagnosis-legit` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/late-adhd-diagnosis-adults` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/medical-weight-loss-vs-dieting` | `/blog/medical-weight-loss-vs-dieting-what-actually-works` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/meet-and-greet-telehealth-expectations` | `/telehealth` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /telehealth. |
| `/answers/minoxidil-hair-loss-does-it-work` | `/blog/minoxidil-for-hair-loss-does-it-work` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/non-stimulant-adhd-medications` | `/blog/non-stimulant-adhd-medications-explained` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/normal-a1c-insulin-resistance` | `/blog/insulin-resistance-and-weight-loss-clinician-overview` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/insulin-resistance-and-weight-loss-clinician-overview. |
| `/answers/oral-vs-injectable-weight-loss-meds` | `/blog/oral-vs-injectable-weight-loss-medications` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/oral-vs-topical-minoxidil` | `/blog/oral-vs-topical-minoxidil-which-is-right` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/phentermine-weight-loss-safety` | `/blog/phentermine-for-weight-loss-safety-and-effectiveness` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/poor-sleep-feels-like-adhd` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/rejection-sensitivity-adhd` | `/answers/signs-of-adult-adhd` | 1 | Niche ADHD symptom (365 words, 2 inbound); low search volume vs maintenance cost. |
| `/answers/semaglutide-weight-loss-how-it-works` | `/blog/semaglutide-for-weight-loss-how-it-works` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/signs-of-sleep-apnea-in-adults` | `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign. |
| `/answers/sildenafil-erectile-dysfunction-expectations` | `/blog/sildenafil-for-erectile-dysfunction-what-to-expect` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/starting-adhd-medication-adults` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/telehealth-adhd-texas` | `/blog/online-adhd-diagnosis-texas` | 1 | TX telehealth FAQ duplicates TX diagnosis blog; geo FAQ → geo cornerstone. |
| `/answers/testosterone-and-adhd-overlap` | `/adhd-care` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/time-blindness-adhd` | `/answers/signs-of-adult-adhd` | 1 | Micro-topic guide (358 words, 2 inbound); consolidate to adult signs cornerstone guide. |
| `/answers/tirzepatide-vs-semaglutide` | `/blog/tirzepatide-vs-semaglutide-which-is-better` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/trt-monitoring-requirements` | `/blog/when-is-testosterone-therapy-appropriate` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/weight-gain-after-stopping-ozempic` | `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | 1 | Ozempic cessation FAQ with 1 inbound; food-noise cornerstone owns GLP-1 rebound narrative. |
| `/answers/what-does-low-testosterone-feel-like` | `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/free-testosterone-vs-total-testosterone-what-patients-should-know. |
| `/answers/what-included-199-adhd-evaluation` | `/adhd-care` | 1 | Evaluation scope FAQ belongs on /adhd-care offer section. |
| `/answers/when-is-testosterone-therapy-appropriate` | `/blog/when-is-testosterone-therapy-appropriate` | 3 | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/why-normal-labs-dont-mean-healthy` | `/answers` | 3 | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| `/blog/adderall-ir-vs-xr-adults` | `/blog/adderall-for-adhd-how-it-works` | 1 | IR/XR variant duplicates Adderall mechanism article. |
| `/blog/adhd-evaluation-california-online-vs-in-person` | `/blog/online-adhd-diagnosis-california` | 1 | CA geo cluster consolidation; online diagnosis cornerstone absorbs comparison intent. |
| `/blog/adhd-evaluation-cost-california` | `/membership-pricing` | 1 | State-specific pricing duplicate; membership-pricing is canonical pricing page. |
| `/blog/adhd-evaluation-cost-texas` | `/membership-pricing` | 1 | State-specific pricing duplicate of /adhd-evaluation-cost and membership-pricing. |
| `/blog/adhd-medication-online-california` | `/blog/adhd-medication-options-for-adults` | 1 | CA medication blog duplicates general adult medication guide. |
| `/blog/adhd-medication-online-texas-telehealth` | `/blog/online-adhd-diagnosis-texas` | 1 | TX medication logistics covered by TX diagnosis cornerstone + /adhd-care. |
| `/blog/adhd-medication-options-california` | `/blog/adhd-medication-options-for-adults` | 1 | State variant of general medication options article; cannibalizes adult guide. |
| `/blog/adhd-testing-online-california-screening-vs-evaluation` | `/adhd-screening` | 1 | Screening vs evaluation intent owned by /adhd-screening + /adhd-care. |
| `/blog/adhd-treatment-houston-online` | `/adhd-diagnosis-texas` | 1 | Houston blog duplicates Texas geo landing; 3 inbound. |
| `/blog/adult-adhd-symptoms-california` | `/blog/how-to-know-if-you-have-adhd-adult` | 1 | Symptoms content duplicates sitewide ADHD symptoms cornerstone (167 inbound). |
| `/blog/adult-adhd-treatment-california-2026` | `/adhd-care` | 1 | Treatment commercial intent belongs on service page, not geo blog. |
| `/blog/after-adhd-diagnosis-next-steps-adults` | `/adhd-care` | 1 | Post-diagnosis journey belongs on /adhd-care; 2 inbound thin article. |
| `/blog/combining-adhd-treatment-and-weight-loss-strategies` | `/weight-loss-metabolic-health` | 1 | Cross-service article with 2 inbound; metabolic service page owns dual-condition positioning. |
| `/blog/focalin-vs-adderall-comparison` | `/blog/vyvanse-vs-adderall-differences` | 1 | Third stimulant comparison page; consolidate ADHD med comparisons to canonical pair. |
| `/blog/how-mental-health-affects-weight-loss-outcomes` | `/weight-loss-metabolic-health` | 3 | Blog not in minimum viable whitelist; redirect to preserve link equity on /weight-loss-metabolic-health. |
| `/blog/how-to-choose-adhd-provider-california` | `/providers` | 1 | Provider selection intent better served by /providers hub + profiles. |
| `/blog/long-term-weight-loss-medications-what-to-expect` | `/weight-loss-metabolic-health` | 3 | Blog not in minimum viable whitelist; redirect to preserve link equity on /weight-loss-metabolic-health. |
| `/creyos-adhd-testing` | `/adhd-care` | 1 | Creyos is included in $199 evaluation; standalone page fragments ADHD funnel (3 inbound). |
| `/labs` | `/telehealth` | 1 | 102-word coming-soon placeholder; no unique content. Defer until labs launch. |
| `/online-adhd-test` | `/adhd-screening` | 1 | Duplicate screening funnel intent with /adhd-screening; CTA audit flags cross-link confusion. |
| `/prescriptions` | `/telehealth` | 1 | 92-word coming-soon placeholder; 1 inbound. Telehealth owns prescription narrative. |
| `/primary-urgent-care` | `/telehealth` | 1 | Secondary service with 1 inbound; telehealth page covers virtual primary care positioning. |

## Merge map

| Source | Target | Phase | Rationale |
|--------|--------|------:|-----------|
| `/blog/adhd` | `/blog` | 2 | Category hub duplicates /blog index; merge ADHD article list into main blog hub. |
| `/blog/telehealth` | `/blog` | 2 | Category hub duplicates /blog; low unique value (327 words). |
| `/blog/weight-loss` | `/blog` | 2 | Category hub duplicates /blog; merge weight-loss articles into filtered blog index. |

## Cornerstone pages

**30 URLs** anchor revenue, trust, and SEO authority:

### Core service & trust

- `/`
- `/about`
- `/adhd-care`
- `/adhd-diagnosis-texas`
- `/adhd-screening`
- `/answers`
- `/blog`
- `/book-appointment`
- `/membership-pricing`
- `/mens-health-longevity`
- `/providers`
- `/telehealth`
- `/weight-loss-metabolic-health`

### Legal (required)


### Blog cornerstones

- `/blog/adhd-telehealth-california`
- `/blog/food-noise-and-glp-1-what-it-means-and-what-helps`
- `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know`
- `/blog/how-to-know-if-you-have-adhd-adult`
- `/blog/insulin-resistance-and-weight-loss-clinician-overview`
- `/blog/is-online-adhd-diagnosis-legit`
- `/blog/medical-weight-loss-glp1-semaglutide-texas`
- `/blog/online-adhd-diagnosis-california`
- `/blog/online-adhd-diagnosis-texas`
- `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign`
- `/blog/why-am-i-always-tired-causes-when-to-see-doctor`

### Health guide cornerstones (supporting PAA)

- `/answers/can-adhd-be-diagnosed-online`
- `/answers/signs-of-adult-adhd`
- `/answers/what-is-food-noise`
- `/answers/what-is-free-testosterone`
- `/answers/what-is-insulin-resistance`
- `/answers/why-am-i-tired-even-after-sleeping`

## KEEP + REWRITE

| Page | Rationale |
|------|-----------|
| `/` | Homepage MVP polish needed; consolidate CTAs and link all provider cards per provider audit. |
| `/about` | Fix team image alt text, link providers, reduce duplicate CTAs. |
| `/adhd-care` | Core revenue page; add state availability sections, Creyos/pricing blocks, provider cards. |
| `/adhd-diagnosis-texas` | Geo cornerstone; add provider routing and state-specific trust signals. |
| `/adhd-screening` | Top-of-funnel; align copy with /adhd-care after online-adhd-test redirect. |
| `/answers` | Hub needs pillar restructure after guide pruning; reduce 87 outbound links. |
| `/blog` | Simplify discovery; remove blog/all dependency; category hubs may merge. |
| `/membership-pricing` | Single pricing source of truth; absorb adhd-evaluation-cost redirects. |
| `/mens-health-longevity` | Core revenue; align scope to actual services, add hormone cornerstone links. |
| `/telehealth` | Core routing hub; absorb redirected coming-soon services, simplify service grid. |
| `/weight-loss-metabolic-health` | Core revenue; add provider authority (Sneh), simplify CTA bands per CTA audit. |

## Phased implementation

### Phase 1 — Deletes & safe redirects (Week 1)

**46 pages.** Legacy legal stubs, orphan utilities, off-scope blogs, funnel duplicates, geo consolidation. No content loss on canonical targets.

- `/adhd-diagnosis-austin` → REDIRECT `/adhd-diagnosis-texas`
- `/adhd-diagnosis-florida` → DELETE `/adhd-care`
- `/adhd-diagnosis-houston` → REDIRECT `/adhd-diagnosis-texas`
- `/adhd-diagnosis-pennsylvania` → REDIRECT `/adhd-care`
- `/adhd-diagnosis-philadelphia` → REDIRECT `/adhd-diagnosis-pennsylvania`
- `/adhd-evaluation-cost` → REDIRECT `/membership-pricing`
- `/adhd-treatment-online` → REDIRECT `/adhd-care`
- `/adult-adhd-diagnosis` → REDIRECT `/adhd-care`
- `/answers/adhd-in-men` → REDIRECT `/answers/signs-of-adult-adhd`
- `/answers/adhd-in-women` → REDIRECT `/answers/signs-of-adult-adhd`
- `/answers/creyos-adhd-testing-explained` → REDIRECT `/adhd-care`
- `/answers/glp-1-nausea-management` → REDIRECT `/blog/glp1-side-effects-and-how-to-manage-them`
- `/answers/high-functioning-adhd` → REDIRECT `/blog/how-to-know-if-you-have-adhd-adult`
- `/answers/how-much-does-adhd-testing-cost` → REDIRECT `/membership-pricing`
- `/answers/rejection-sensitivity-adhd` → REDIRECT `/answers/signs-of-adult-adhd`
- *…and 31 more (see JSON)*

### Phase 2 — Rewrites & hub merges (Weeks 2–4)

**14 pages.** Service page rewrites, provider cards, pricing consolidation, blog category hub merge into /blog.

- `/` — KEEP + REWRITE
- `/about` — KEEP + REWRITE
- `/adhd-care` — KEEP + REWRITE
- `/adhd-diagnosis-texas` — KEEP + REWRITE
- `/adhd-screening` — KEEP + REWRITE
- `/answers` — KEEP + REWRITE
- `/blog` — KEEP + REWRITE
- `/blog/adhd` — MERGE → `/blog`
- `/blog/telehealth` — MERGE → `/blog`
- `/blog/weight-loss` — MERGE → `/blog`
- `/membership-pricing` — KEEP + REWRITE
- `/mens-health-longevity` — KEEP + REWRITE
- `/telehealth` — KEEP + REWRITE
- `/weight-loss-metabolic-health` — KEEP + REWRITE

### Phase 3 — Guide consolidation (Weeks 4–6)

**44 pages.** Redirect 17 cannibalizing Health Guides to winning blogs; redirect thin guides to hub or parent cornerstone.

Monitor Search Console for 404s and ranking shifts 30 days post-redirect.

## Per-page appendix

| Path | Classification | Redirect target | Rationale |
|------|----------------|-----------------|-----------|
| `/` | KEEP + REWRITE | — | Homepage MVP polish needed; consolidate CTAs and link all provider cards per provider audit. |
| `/about` | KEEP + REWRITE | — | Fix team image alt text, link providers, reduce duplicate CTAs. |
| `/adhd-care` | KEEP + REWRITE | — | Core revenue page; add state availability sections, Creyos/pricing blocks, provider cards. |
| `/adhd-diagnosis-austin` | REDIRECT | `/adhd-diagnosis-texas` | City geo page with 1 inbound; Texas state cornerstone absorbs Austin intent. |
| `/adhd-diagnosis-florida` | DELETE | `/adhd-care` | Thin geo landing; zero inbound links, orphan. Florida not a licensed priority state in entity-graph. |
| `/adhd-diagnosis-houston` | REDIRECT | `/adhd-diagnosis-texas` | City geo page with 2 inbound; consolidate to single Texas geo cornerstone. |
| `/adhd-diagnosis-pennsylvania` | REDIRECT | `/adhd-care` | Thin state geo (451 words, 1 inbound); PA coverage belongs as section on /adhd-care until traffic justifies standalone. |
| `/adhd-diagnosis-philadelphia` | REDIRECT | `/adhd-diagnosis-pennsylvania` | City duplicate of PA state page; 1 inbound each, same offer. |
| `/adhd-diagnosis-texas` | KEEP + REWRITE | — | Geo cornerstone; add provider routing and state-specific trust signals. |
| `/adhd-evaluation-cost` | REDIRECT | `/membership-pricing` | Standalone pricing page duplicates membership-pricing and adhd-care; consolidate single pricing source. |
| `/adhd-screening` | KEEP + REWRITE | — | Top-of-funnel; align copy with /adhd-care after online-adhd-test redirect. |
| `/adhd-treatment-online` | REDIRECT | `/adhd-care` | Post-diagnosis treatment belongs as section on /adhd-care; 1 inbound, thin duplicate. |
| `/adult-adhd-diagnosis` | REDIRECT | `/adhd-care` | Overlaps /adhd-care H1 and offer; splits ADHD commercial intent across 3 URLs. |
| `/answers` | KEEP + REWRITE | — | Hub needs pillar restructure after guide pruning; reduce 87 outbound links. |
| `/answers/adderall-vs-vyvanse-adults` | REDIRECT | `/blog/vyvanse-vs-adderall-differences` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/adhd-and-weight-loss-connection` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/adhd-in-men` | REDIRECT | `/answers/signs-of-adult-adhd` | Thin gender variant (348 words, 1 inbound); signs-of-adult-adhd covers presentation. |
| `/answers/adhd-in-women` | REDIRECT | `/answers/signs-of-adult-adhd` | Thin gender variant (356 words, 3 inbound); consolidate to adult signs cornerstone guide. |
| `/answers/adhd-medication-every-day` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/adhd-medication-side-effects` | REDIRECT | `/blog/adhd-medication-side-effects-what-to-expect` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/adhd-vs-anxiety` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/adhd-vs-burnout` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/afternoon-energy-crash-after-lunch` | REDIRECT | `/answers` | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| `/answers/asrs-adhd-screening-explained` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/brain-fog-after-eating` | REDIRECT | `/answers` | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| `/answers/can-adhd-be-diagnosed-online` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/can-adhd-cause-anxiety` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/can-sleep-apnea-cause-fatigue` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/can-you-get-adhd-medication-online` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/compounded-vs-branded-glp-1` | REDIRECT | `/blog/compounded-vs-branded-glp1-medications` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/creyos-adhd-testing-explained` | REDIRECT | `/adhd-care` | Creyos FAQ with 1 inbound; merge into adhd-care evaluation section. |
| `/answers/ed-telehealth-legitimate` | REDIRECT | `/telehealth` | Supporting/thin guide not in minimum viable whitelist; consolidate to /telehealth. |
| `/answers/executive-dysfunction-adhd` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/food-noise-returned-on-glp-1` | REDIRECT | `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/food-noise-and-glp-1-what-it-means-and-what-helps. |
| `/answers/fsa-hsa-adhd-evaluation` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/glp-1-nausea-management` | REDIRECT | `/blog/glp1-side-effects-and-how-to-manage-them` | Cannibalization owner Blog; nausea subset fully covered in GLP-1 side effects cornerstone. |
| `/answers/glp-1-side-effects` | REDIRECT | `/blog/glp1-side-effects-and-how-to-manage-them` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/high-functioning-adhd` | REDIRECT | `/blog/how-to-know-if-you-have-adhd-adult` | Thin guide (350 words); high-functioning narrative covered in adult ADHD cornerstone blog. |
| `/answers/high-shbg-low-free-testosterone` | REDIRECT | `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/free-testosterone-vs-total-testosterone-what-patients-should-know. |
| `/answers/how-long-adhd-evaluation` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/how-much-does-adhd-testing-cost` | REDIRECT | `/membership-pricing` | Pricing FAQ duplicates membership-pricing and adhd-care pricing sections. |
| `/answers/how-online-prescriptions-work` | REDIRECT | `/answers` | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| `/answers/insulin-resistance-without-diabetes` | REDIRECT | `/blog/insulin-resistance-and-weight-loss-clinician-overview` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/insulin-resistance-and-weight-loss-clinician-overview. |
| `/answers/is-adhd-medication-safe-long-term` | REDIRECT | `/blog/is-adhd-medication-safe-long-term` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/is-online-adhd-diagnosis-legitimate` | REDIRECT | `/blog/is-online-adhd-diagnosis-legit` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/is-telehealth-legitimate` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/late-adhd-diagnosis-adults` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/medical-weight-loss-vs-dieting` | REDIRECT | `/blog/medical-weight-loss-vs-dieting-what-actually-works` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/meet-and-greet-telehealth-expectations` | REDIRECT | `/telehealth` | Supporting/thin guide not in minimum viable whitelist; consolidate to /telehealth. |
| `/answers/minoxidil-hair-loss-does-it-work` | REDIRECT | `/blog/minoxidil-for-hair-loss-does-it-work` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/non-stimulant-adhd-medications` | REDIRECT | `/blog/non-stimulant-adhd-medications-explained` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/normal-a1c-insulin-resistance` | REDIRECT | `/blog/insulin-resistance-and-weight-loss-clinician-overview` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/insulin-resistance-and-weight-loss-clinician-overview. |
| `/answers/oral-vs-injectable-weight-loss-meds` | REDIRECT | `/blog/oral-vs-injectable-weight-loss-medications` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/oral-vs-topical-minoxidil` | REDIRECT | `/blog/oral-vs-topical-minoxidil-which-is-right` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/phentermine-weight-loss-safety` | REDIRECT | `/blog/phentermine-for-weight-loss-safety-and-effectiveness` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/poor-sleep-feels-like-adhd` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/rejection-sensitivity-adhd` | REDIRECT | `/answers/signs-of-adult-adhd` | Niche ADHD symptom (365 words, 2 inbound); low search volume vs maintenance cost. |
| `/answers/screening-vs-adhd-evaluation` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/semaglutide-weight-loss-how-it-works` | REDIRECT | `/blog/semaglutide-for-weight-loss-how-it-works` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/signs-of-adult-adhd` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/signs-of-sleep-apnea-in-adults` | REDIRECT | `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign. |
| `/answers/sildenafil-erectile-dysfunction-expectations` | REDIRECT | `/blog/sildenafil-for-erectile-dysfunction-what-to-expect` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/starting-adhd-medication-adults` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/telehealth-adhd-california` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/telehealth-adhd-texas` | REDIRECT | `/blog/online-adhd-diagnosis-texas` | TX telehealth FAQ duplicates TX diagnosis blog; geo FAQ → geo cornerstone. |
| `/answers/testosterone-and-adhd-overlap` | REDIRECT | `/adhd-care` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| `/answers/time-blindness-adhd` | REDIRECT | `/answers/signs-of-adult-adhd` | Micro-topic guide (358 words, 2 inbound); consolidate to adult signs cornerstone guide. |
| `/answers/tirzepatide-vs-semaglutide` | REDIRECT | `/blog/tirzepatide-vs-semaglutide-which-is-better` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/trt-monitoring-requirements` | REDIRECT | `/blog/when-is-testosterone-therapy-appropriate` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/weight-gain-after-stopping-ozempic` | REDIRECT | `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | Ozempic cessation FAQ with 1 inbound; food-noise cornerstone owns GLP-1 rebound narrative. |
| `/answers/what-does-low-testosterone-feel-like` | REDIRECT | `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/free-testosterone-vs-total-testosterone-what-patients-should-know. |
| `/answers/what-included-199-adhd-evaluation` | REDIRECT | `/adhd-care` | Evaluation scope FAQ belongs on /adhd-care offer section. |
| `/answers/what-is-food-noise` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/what-is-free-testosterone` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/what-is-insulin-resistance` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/when-is-testosterone-therapy-appropriate` | REDIRECT | `/blog/when-is-testosterone-therapy-appropriate` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| `/answers/who-qualifies-glp-1-weight-loss` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/why-am-i-tired-even-after-sleeping` | KEEP | — | Primary PAA guide for cornerstone cluster; paired blog owns long-form depth. |
| `/answers/why-normal-labs-dont-mean-healthy` | REDIRECT | `/answers` | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| `/blog` | KEEP + REWRITE | — | Simplify discovery; remove blog/all dependency; category hubs may merge. |
| `/blog/adderall-for-adhd-how-it-works` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/adderall-ir-vs-xr-adults` | REDIRECT | `/blog/adderall-for-adhd-how-it-works` | IR/XR variant duplicates Adderall mechanism article. |
| `/blog/adhd` | MERGE | `/blog` | Category hub duplicates /blog index; merge ADHD article list into main blog hub. |
| `/blog/adhd-evaluation-california-online-vs-in-person` | REDIRECT | `/blog/online-adhd-diagnosis-california` | CA geo cluster consolidation; online diagnosis cornerstone absorbs comparison intent. |
| `/blog/adhd-evaluation-cost-california` | REDIRECT | `/membership-pricing` | State-specific pricing duplicate; membership-pricing is canonical pricing page. |
| `/blog/adhd-evaluation-cost-texas` | REDIRECT | `/membership-pricing` | State-specific pricing duplicate of /adhd-evaluation-cost and membership-pricing. |
| `/blog/adhd-medication-daily-or-as-needed-adults` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/adhd-medication-online-california` | REDIRECT | `/blog/adhd-medication-options-for-adults` | CA medication blog duplicates general adult medication guide. |
| `/blog/adhd-medication-online-texas-telehealth` | REDIRECT | `/blog/online-adhd-diagnosis-texas` | TX medication logistics covered by TX diagnosis cornerstone + /adhd-care. |
| `/blog/adhd-medication-options-california` | REDIRECT | `/blog/adhd-medication-options-for-adults` | State variant of general medication options article; cannibalizes adult guide. |
| `/blog/adhd-medication-options-for-adults` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/adhd-medication-side-effects-what-to-expect` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/adhd-symptoms-overlooked` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/adhd-telehealth-california` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/adhd-testing-online-california-screening-vs-evaluation` | REDIRECT | `/adhd-screening` | Screening vs evaluation intent owned by /adhd-screening + /adhd-care. |
| `/blog/adhd-treatment-houston-online` | REDIRECT | `/adhd-diagnosis-texas` | Houston blog duplicates Texas geo landing; 3 inbound. |
| `/blog/adult-adhd-symptoms-california` | REDIRECT | `/blog/how-to-know-if-you-have-adhd-adult` | Symptoms content duplicates sitewide ADHD symptoms cornerstone (167 inbound). |
| `/blog/adult-adhd-treatment-california-2026` | REDIRECT | `/adhd-care` | Treatment commercial intent belongs on service page, not geo blog. |
| `/blog/after-adhd-diagnosis-next-steps-adults` | REDIRECT | `/adhd-care` | Post-diagnosis journey belongs on /adhd-care; 2 inbound thin article. |
| `/blog/all` | DELETE | `/blog` | Redundant article index duplicating /blog hub; 4 inbound only from footer. High maintenance, no unique SEO value. |
| `/blog/ambien-and-sleep-medications-risks-and-benefits` | DELETE | `/blog/insomnia-treatment-options-beyond-medication` | Off-scope sleep Rx content; Siya does not promote Ambien prescribing. 2 inbound, no conversion path. |
| `/blog/combining-adhd-treatment-and-weight-loss-strategies` | REDIRECT | `/weight-loss-metabolic-health` | Cross-service article with 2 inbound; metabolic service page owns dual-condition positioning. |
| `/blog/compounded-vs-branded-glp1-medications` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/focalin-vs-adderall-comparison` | REDIRECT | `/blog/vyvanse-vs-adderall-differences` | Third stimulant comparison page; consolidate ADHD med comparisons to canonical pair. |
| `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/glp1-side-effects-and-how-to-manage-them` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/glutathione-and-peptides-what-do-they-actually-do` | DELETE | `/mens-health-longevity` | Peptide marketing content outside current service scope; 2 inbound, maintenance with no revenue tie. |
| `/blog/how-adhd-medication-is-prescribed-online` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/how-mental-health-affects-weight-loss-outcomes` | REDIRECT | `/weight-loss-metabolic-health` | Blog not in minimum viable whitelist; redirect to preserve link equity on /weight-loss-metabolic-health. |
| `/blog/how-to-choose-adhd-provider-california` | REDIRECT | `/providers` | Provider selection intent better served by /providers hub + profiles. |
| `/blog/how-to-know-if-you-have-adhd-adult` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/how-to-safely-get-prescriptions-online` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/insomnia-treatment-options-beyond-medication` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/insulin-resistance-and-weight-loss-clinician-overview` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/is-adhd-medication-safe-long-term` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/is-online-adhd-diagnosis-legit` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/long-term-weight-loss-medications-what-to-expect` | REDIRECT | `/weight-loss-metabolic-health` | Blog not in minimum viable whitelist; redirect to preserve link equity on /weight-loss-metabolic-health. |
| `/blog/medical-weight-loss-glp1-semaglutide-texas` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/medical-weight-loss-vs-dieting-what-actually-works` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/minoxidil-for-hair-loss-does-it-work` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/modafinil-for-focus-and-fatigue-is-it-safe` | DELETE | `/adhd-care` | Modafinil not a Siya service line; risks implying off-label prescribing. 4 inbound only. |
| `/blog/non-stimulant-adhd-medications-explained` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/online-adhd-diagnosis-california` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/online-adhd-diagnosis-texas` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/oral-vs-injectable-weight-loss-medications` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/oral-vs-topical-minoxidil-which-is-right` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/phentermine-for-weight-loss-safety-and-effectiveness` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/semaglutide-for-weight-loss-how-it-works` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/sildenafil-for-erectile-dysfunction-what-to-expect` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/telehealth` | MERGE | `/blog` | Category hub duplicates /blog; low unique value (327 words). |
| `/blog/telehealth-prescriptions-how-online-treatment-works` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/tirzepatide-vs-semaglutide-which-is-better` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/vyvanse-vs-adderall-differences` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/weight-loss` | MERGE | `/blog` | Category hub duplicates /blog; merge weight-loss articles into filtered blog index. |
| `/blog/when-is-testosterone-therapy-appropriate` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/why-am-i-always-tired-causes-when-to-see-doctor` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/blog/youre-not-lazy-signs-undiagnosed-adult-adhd` | KEEP | — | Whitelisted cornerstone or high-equity blog in minimum viable site. |
| `/book-appointment` | KEEP | — | Core revenue, trust, or legal page in minimum viable site. |
| `/creyos-adhd-testing` | REDIRECT | `/adhd-care` | Creyos is included in $199 evaluation; standalone page fragments ADHD funnel (3 inbound). |
| `/labs` | REDIRECT | `/telehealth` | 102-word coming-soon placeholder; no unique content. Defer until labs launch. |
| `/legal` | KEEP | — | Core revenue, trust, or legal page in minimum viable site. |
| `/legal/controlled-substance-treatment-agreement` | KEEP | — | Core revenue, trust, or legal page in minimum viable site. |
| `/legal/cookie-policy` | KEEP | — | Core revenue, trust, or legal page in minimum viable site. |
| `/legal/notice-of-privacy-practices` | KEEP | — | Core revenue, trust, or legal page in minimum viable site. |
| `/legal/privacy-policy` | KEEP | — | Core revenue, trust, or legal page in minimum viable site. |
| `/legal/terms-of-use` | KEEP | — | Core revenue, trust, or legal page in minimum viable site. |
| `/membership-pricing` | KEEP + REWRITE | — | Single pricing source of truth; absorb adhd-evaluation-cost redirects. |
| `/mens-health-longevity` | KEEP + REWRITE | — | Core revenue; align scope to actual services, add hormone cornerstone links. |
| `/online-adhd-test` | REDIRECT | `/adhd-screening` | Duplicate screening funnel intent with /adhd-screening; CTA audit flags cross-link confusion. |
| `/prescriptions` | REDIRECT | `/telehealth` | 92-word coming-soon placeholder; 1 inbound. Telehealth owns prescription narrative. |
| `/primary-urgent-care` | REDIRECT | `/telehealth` | Secondary service with 1 inbound; telehealth page covers virtual primary care positioning. |
| `/privacy-policy` | DELETE | `/legal/privacy-policy` | Legacy legal stub; canonical is /legal/privacy-policy. Zero inbound. Remove file after 301. |
| `/providers` | KEEP | — | Core revenue, trust, or legal page in minimum viable site. |
| `/providers/derek-timbs` | KEEP | — | Provider profile — required for E-E-A-T and booking conversion. |
| `/providers/dr-natasha-desai` | KEEP | — | Provider profile — required for E-E-A-T and booking conversion. |
| `/providers/dr-sneh-pandey` | KEEP | — | Provider profile — required for E-E-A-T and booking conversion. |
| `/providers/dr-swati-pandey` | KEEP | — | Provider profile — required for E-E-A-T and booking conversion. |
| `/providers/dr-vanessa-urbina` | KEEP | — | Provider profile — required for E-E-A-T and booking conversion. |
| `/providers/megan-wunderlich` | KEEP | — | Provider profile — required for E-E-A-T and booking conversion. |
| `/providers/wendy-delgado` | KEEP | — | Provider profile — required for E-E-A-T and booking conversion. |
| `/siya-circle` | DELETE | `https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl` | Orphan utility page (0 inbound). Newsletter signup belongs in footer only per CTA audit. |
| `/telehealth` | KEEP + REWRITE | — | Core routing hub; absorb redirected coming-soon services, simplify service grid. |
| `/terms` | DELETE | `/legal/terms-of-use` | Legacy legal stub; canonical is /legal/terms-of-use. Zero inbound. Remove file after 301. |
| `/weight-loss-metabolic-health` | KEEP + REWRITE | — | Core revenue; add provider authority (Sneh), simplify CTA bands per CTA audit. |

