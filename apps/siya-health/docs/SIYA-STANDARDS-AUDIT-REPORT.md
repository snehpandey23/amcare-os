# SIYA Standards Audit Report

> **Read-only audit** against [`docs/SIYA-STANDARDS.md`](./SIYA-STANDARDS.md). No HTML pages were modified.

**Generated:** 2026-06-07  
**Scope:** 164 HTML files · 160 indexable pages · standards version 2026-06-07

**Audit scripts run:** `audit-pricing-system.mjs`, `audit-cta-inventory.mjs`, `audit-provider-consistency.mjs`, `audit-brand-consistency.mjs` (+ `site-pruning-audit.json`)

## Executive Summary

Full sitewide comparison of patient-facing HTML against **SIYA-STANDARDS.md**. Four audit scripts were re-run read-only; results were merged with direct HTML scans and site-pruning classifications.

| Metric | Count |
|--------|------:|
| HTML files scanned | 164 |
| Indexable pages | 166 |
| **Total findings** | 417 |
| **Critical findings** | 0 |
| High | 106 |
| Medium | 257 |
| Low | 54 |

**Priority themes:** (1) CTA consolidation — 28 pages exceed 3 CTAs in `<main>`; (2) provider role/state drift on hub cards and profiles; (3) 82 redirect + 8 delete candidates from pruning audit; (4) duplicate guide/blog streams.

**Note:** `pricing.html` is **compliant** with §3 ($199/$79/$149). The pricing audit script false-flags negated "No Bronze/Silver/Gold tiers" copy.

### Section counts

| # | Category | Findings | Critical |
|---|----------|----------:|---------:|
| 1 | Conflicting pricing | 54 | 0 |
| 2 | Conflicting provider descriptions | 13 | 0 |
| 3 | Conflicting CTA language | 49 | 0 |
| 4 | ADHD-only but should be broader | 2 | 0 |
| 5 | No longer fit positioning | 3 | 0 |
| 6 | Duplicate content | 86 | 0 |
| 7 | Should be redirected | 82 | 0 |
| 8 | Should be deleted | 12 | 0 |
| 9 | Require rewrites | 72 | 0 |
| 10 | Can remain unchanged | 44 | 0 |

### Top critical findings (0)

_No Critical-severity violations found in live HTML after manual review of pricing false positives._


---

## 1. Conflicting pricing

**Count:** 54 (Critical: 0, High: 0, Medium: 44, Low: 10)

| Severity | File | Finding |
|----------|------|--------|
| Medium | `adhd-care.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `adhd-diagnosis-austin.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `adhd-diagnosis-florida.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `adhd-diagnosis-houston.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `adhd-diagnosis-houston.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `adhd-diagnosis-pennsylvania.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `adhd-diagnosis-philadelphia.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `adhd-diagnosis-texas.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `adhd-evaluation-cost.html` | ADHD evaluation cost page shows $199 only; follow-up plans ($79/$149) not enumerated |
| Medium | `adhd-evaluation-cost.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `adhd-treatment-online.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `adult-adhd-diagnosis.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `blog/adderall-for-adhd-how-it-works.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/adhd-evaluation-cost-california.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/adhd-evaluation-cost-texas.html` | Mentions $149/month follow-up without $79 non-controlled tier or universal plan naming |
| Medium | `blog/adhd-evaluation-cost-texas.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/adhd-medication-online-texas-telehealth.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/adhd-medication-options-for-adults.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/adhd-medication-side-effects-what-to-expect.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/adhd-symptoms-overlooked.html` | Mentions $149/month follow-up without $79 non-controlled tier or universal plan naming |
| Medium | `blog/adhd-symptoms-overlooked.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/adhd-treatment-houston-online.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/adhd.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/focalin-vs-adderall-comparison.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/how-adhd-medication-is-prescribed-online.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/how-to-know-if-you-have-adhd-adult.html` | Mentions $149/month follow-up without $79 non-controlled tier or universal plan naming |
| Medium | `blog/how-to-know-if-you-have-adhd-adult.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/index.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/is-adhd-medication-safe-long-term.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/is-online-adhd-diagnosis-legit.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/non-stimulant-adhd-medications-explained.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/online-adhd-diagnosis-texas.html` | Mentions $149/month follow-up without $79 non-controlled tier or universal plan naming |
| Medium | `blog/online-adhd-diagnosis-texas.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/telehealth.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/vyvanse-vs-adderall-differences.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `book-appointment.html` | Shows "$199 Transparent Pricing" hero badge without explaining universal Initial Evaluation model |
| Medium | `creyos-adhd-testing.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `index.html` | Links to legacy /adhd-evaluation-cost instead of canonical /pricing |
| Medium | `labs.html` | Shows "$199 Transparent Pricing" hero badge without explaining universal Initial Evaluation model |
| Medium | `mens-health-longevity.html` | Shows "$199 Transparent Pricing" hero badge without explaining universal Initial Evaluation model |
| Medium | `online-adhd-test.html` | Says "monthly plan" without specifying $79 vs $149 follow-up tiers |
| Medium | `prescriptions.html` | Shows "$199 Transparent Pricing" hero badge without explaining universal Initial Evaluation model |
| Medium | `primary-urgent-care.html` | Shows "$199 Transparent Pricing" hero badge without explaining universal Initial Evaluation model |
| Low | `adhd-diagnosis-austin.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `adhd-diagnosis-florida.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `adhd-diagnosis-houston.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `adhd-diagnosis-pennsylvania.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `adhd-diagnosis-philadelphia.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `adhd-diagnosis-texas.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `adhd-treatment-online.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `adult-adhd-diagnosis.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `creyos-adhd-testing.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |
| Low | `online-adhd-test.html` | Duplicate ADHD pricing content; should canonicalize to /adhd-care + unified pricing page |

## 2. Conflicting provider descriptions

**Count:** 13 (Critical: 0, High: 11, Medium: 2, Low: 0)

| Severity | File | Finding |
|----------|------|--------|
| High | `about.html` | dr-vanessa-urbina: care-team section — expected "All 7 providers or explicit link to /providers"; found "Not listed (only 3 of 7 providers on About page)" |
| High | `providers/derek-timbs.html` | Uses "board-certified" for NP/PA (physicians only per §1) |
| High | `providers/dr-swati-pandey.html` | Role line "Licensed Medical Provider — ADHD & Mental Health Care" conflicts with canonical "Internal Medicine Physician" (§2) |
| High | `providers/index.html` | dr-sneh-pandey: data-states — expected "CA,FL,PA,TX"; found "FL" |
| High | `providers/index.html` | dr-vanessa-urbina: data-states — expected "FL"; found "TX,FL" |
| High | `providers/index.html` | dr-natasha-desai: data-states — expected "FL,TX"; found "PA" |
| High | `providers/index.html` | megan-wunderlich: data-states — expected "PA"; found "TX,OH" |
| High | `providers/index.html` | derek-timbs: data-states — expected "OH,TX"; found "CA" |
| High | `providers/megan-wunderlich.html` | Uses "board-certified" for NP/PA (physicians only per §1) |
| High | `providers/wendy-delgado.html` | Uses "board-certified" for NP/PA (physicians only per §1) |
| High | `weight-loss-metabolic-health.html` | wendy-delgado: data-states — expected "CA"; found "TX,OH" |
| Medium | `providers/dr-natasha-desai.html` | dr-natasha-desai: provider-lp-role-line — expected "Family Medicine Physician"; found "Family & Behavioral Medicine Physician" |
| Medium | `providers/dr-swati-pandey.html` | dr-swati-pandey: provider-lp-role-line — expected "Internal Medicine Physician"; found "Licensed Medical Provider — ADHD & Mental Health Care" |

## 3. Conflicting CTA language

**Count:** 49 (Critical: 0, High: 21, Medium: 28, Low: 0)

| Severity | File | Finding |
|----------|------|--------|
| High | `about.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-care.html` | 4 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-diagnosis-austin.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-diagnosis-florida.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-diagnosis-houston.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-diagnosis-pennsylvania.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-diagnosis-philadelphia.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-diagnosis-texas.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-evaluation-cost.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adhd-treatment-online.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `adult-adhd-diagnosis.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `blog/index.html` | 2 booking CTAs in <main> (max 1 in hero or final band) |
| High | `blog/index.html` | "Join Siya Circle" in <main> (newsletter CTAs footer-only per §7) |
| High | `book-appointment.html` | 4 booking CTAs in <main> (max 1 in hero or final band) |
| High | `creyos-adhd-testing.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `index.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `mens-health-longevity.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `online-adhd-test.html` | 4 booking CTAs in <main> (max 1 in hero or final band) |
| High | `primary-urgent-care.html` | 3 booking CTAs in <main> (max 1 in hero or final band) |
| High | `siya-circle.html` | 2 booking CTAs in <main> (max 1 in hero or final band) |
| High | `siya-circle.html` | "Join Siya Circle" in <main> (newsletter CTAs footer-only per §7) |
| Medium | `about.html` | 8 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-care.html` | 7 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-diagnosis-austin.html` | 6 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-diagnosis-florida.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-diagnosis-houston.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-diagnosis-pennsylvania.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-diagnosis-philadelphia.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-diagnosis-texas.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-evaluation-cost.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `adhd-treatment-online.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `adult-adhd-diagnosis.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `answers/index.html` | 6 CTAs in <main> (max 3 per §4) |
| Medium | `blog/index.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `book-appointment.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `creyos-adhd-testing.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `index.html` | 15 CTAs in <main> (max 3 per §4) |
| Medium | `mens-health-longevity.html` | 4 CTAs in <main> (max 3 per §4) |
| Medium | `online-adhd-test.html` | 6 CTAs in <main> (max 3 per §4) |
| Medium | `primary-urgent-care.html` | 4 CTAs in <main> (max 3 per §4) |
| Medium | `providers/derek-timbs.html` | 4 CTAs in <main> (max 3 per §4) |
| Medium | `providers/dr-natasha-desai.html` | 4 CTAs in <main> (max 3 per §4) |
| Medium | `providers/dr-sneh-pandey.html` | 4 CTAs in <main> (max 3 per §4) |
| Medium | `providers/dr-swati-pandey.html` | 4 CTAs in <main> (max 3 per §4) |
| Medium | `providers/dr-vanessa-urbina.html` | 4 CTAs in <main> (max 3 per §4) |
| Medium | `providers/index.html` | 9 CTAs in <main> (max 3 per §4) |
| Medium | `providers/megan-wunderlich.html` | 5 CTAs in <main> (max 3 per §4) |
| Medium | `providers/wendy-delgado.html` | 4 CTAs in <main> (max 3 per §4) |
| Medium | `siya-circle.html` | 6 CTAs in <main> (max 3 per §4) |

## 4. ADHD-only but should be broader

**Count:** 2 (Critical: 0, High: 0, Medium: 2, Low: 0)

| Severity | File | Finding |
|----------|------|--------|
| Medium | `about.html` | About H1 "done guessing about your health" skews ADHD-adjacent; §8 prefers whole-person entry on broad pages |
| Medium | `pricing.html` | ADHD-only framing on /pricing |

## 5. No longer fit positioning

**Count:** 3 (Critical: 0, High: 3, Medium: 0, Low: 0)

| Severity | File | Finding |
|----------|------|--------|
| High | `blog/online-adhd-diagnosis-california.html` | Outdated language |
| High | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Outdated language |
| High | `index.html` | Outdated language |

## 6. Duplicate content

**Count:** 86 (Critical: 0, High: 0, Medium: 86, Low: 0)

| Severity | File | Finding |
|----------|------|--------|
| Medium | `adhd-diagnosis-houston.html` | City geo page with 2 inbound; consolidate to single Texas geo cornerstone. |
| Medium | `adhd-diagnosis-pennsylvania.html` | Thin state geo (451 words, 1 inbound); PA coverage belongs as section on /adhd-care until traffic justifies standalone. |
| Medium | `adhd-diagnosis-philadelphia.html` | City duplicate of PA state page; 1 inbound each, same offer. |
| Medium | `adhd-evaluation-cost.html` | Standalone pricing page duplicates membership-pricing and adhd-care; consolidate single pricing source. |
| Medium | `adhd-treatment-online.html` | Post-diagnosis treatment belongs as section on /adhd-care; 1 inbound, thin duplicate. |
| Medium | `adult-adhd-diagnosis.html` | Overlaps /adhd-care H1 and offer; splits ADHD commercial intent across 3 URLs. |
| Medium | `answers/adderall-vs-vyvanse-adults.html` | Cannibalizes https://siya.health/blog/vyvanse-vs-adderall-differences |
| Medium | `answers/adderall-vs-vyvanse-adults.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/adhd-and-weight-loss-connection.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/adhd-in-men.html` | Thin gender variant (348 words, 1 inbound); signs-of-adult-adhd covers presentation. |
| Medium | `answers/adhd-in-women.html` | Thin gender variant (356 words, 3 inbound); consolidate to adult signs cornerstone guide. |
| Medium | `answers/adhd-medication-side-effects.html` | Cannibalizes https://siya.health/blog/adhd-medication-side-effects-what-to-expect |
| Medium | `answers/adhd-medication-side-effects.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/adhd-vs-anxiety.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/adhd-vs-burnout.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/afternoon-energy-crash-after-lunch.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| Medium | `answers/asrs-adhd-screening-explained.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/brain-fog-after-eating.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| Medium | `answers/can-adhd-cause-anxiety.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/can-you-get-adhd-medication-online.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/compounded-vs-branded-glp-1.html` | Cannibalizes https://siya.health/blog/compounded-vs-branded-glp1-medications |
| Medium | `answers/compounded-vs-branded-glp-1.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/ed-telehealth-legitimate.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /telehealth. |
| Medium | `answers/executive-dysfunction-adhd.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/food-noise-returned-on-glp-1.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/food-noise-and-glp-1-what-it-means-and-what-helps. |
| Medium | `answers/fsa-hsa-adhd-evaluation.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/glp-1-nausea-management.html` | Cannibalization owner Blog; nausea subset fully covered in GLP-1 side effects cornerstone. |
| Medium | `answers/glp-1-side-effects.html` | Cannibalizes https://siya.health/blog/glp1-side-effects-and-how-to-manage-them |
| Medium | `answers/glp-1-side-effects.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/high-functioning-adhd.html` | Thin guide (350 words); high-functioning narrative covered in adult ADHD cornerstone blog. |
| Medium | `answers/high-shbg-low-free-testosterone.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/free-testosterone-vs-total-testosterone-what-patients-should-know. |
| Medium | `answers/how-long-adhd-evaluation.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/how-much-does-adhd-testing-cost.html` | Pricing FAQ duplicates membership-pricing and adhd-care pricing sections. |
| Medium | `answers/how-online-prescriptions-work.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| Medium | `answers/insulin-resistance-without-diabetes.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/insulin-resistance-and-weight-loss-clinician-overview. |
| Medium | `answers/is-adhd-medication-safe-long-term.html` | Cannibalizes https://siya.health/blog/is-adhd-medication-safe-long-term |
| Medium | `answers/is-adhd-medication-safe-long-term.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/is-online-adhd-diagnosis-legitimate.html` | Cannibalizes https://siya.health/blog/is-online-adhd-diagnosis-legit |
| Medium | `answers/is-online-adhd-diagnosis-legitimate.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/late-adhd-diagnosis-adults.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/medical-weight-loss-vs-dieting.html` | Cannibalizes https://siya.health/blog/medical-weight-loss-vs-dieting-what-actually-works |
| Medium | `answers/medical-weight-loss-vs-dieting.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/meet-and-greet-telehealth-expectations.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /telehealth. |
| Medium | `answers/minoxidil-hair-loss-does-it-work.html` | Cannibalizes https://siya.health/blog/minoxidil-for-hair-loss-does-it-work |
| Medium | `answers/minoxidil-hair-loss-does-it-work.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/non-stimulant-adhd-medications.html` | Cannibalizes https://siya.health/blog/non-stimulant-adhd-medications-explained |
| Medium | `answers/non-stimulant-adhd-medications.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/normal-a1c-insulin-resistance.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/insulin-resistance-and-weight-loss-clinician-overview. |
| Medium | `answers/oral-vs-injectable-weight-loss-meds.html` | Cannibalizes https://siya.health/blog/oral-vs-injectable-weight-loss-medications |
| Medium | `answers/oral-vs-injectable-weight-loss-meds.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/oral-vs-topical-minoxidil.html` | Cannibalizes https://siya.health/blog/oral-vs-topical-minoxidil-which-is-right |
| Medium | `answers/oral-vs-topical-minoxidil.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/phentermine-weight-loss-safety.html` | Cannibalizes https://siya.health/blog/phentermine-for-weight-loss-safety-and-effectiveness |
| Medium | `answers/phentermine-weight-loss-safety.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/poor-sleep-feels-like-adhd.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/semaglutide-weight-loss-how-it-works.html` | Cannibalizes https://siya.health/blog/semaglutide-for-weight-loss-how-it-works |
| Medium | `answers/semaglutide-weight-loss-how-it-works.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/signs-of-sleep-apnea-in-adults.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign. |
| Medium | `answers/sildenafil-erectile-dysfunction-expectations.html` | Cannibalizes https://siya.health/blog/sildenafil-for-erectile-dysfunction-what-to-expect |
| Medium | `answers/sildenafil-erectile-dysfunction-expectations.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/starting-adhd-medication-adults.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/telehealth-adhd-texas.html` | TX telehealth FAQ duplicates TX diagnosis blog; geo FAQ → geo cornerstone. |
| Medium | `answers/testosterone-and-adhd-overlap.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/time-blindness-adhd.html` | Micro-topic guide (358 words, 2 inbound); consolidate to adult signs cornerstone guide. |
| Medium | `answers/tirzepatide-vs-semaglutide.html` | Cannibalizes https://siya.health/blog/tirzepatide-vs-semaglutide-which-is-better |
| Medium | `answers/tirzepatide-vs-semaglutide.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/trt-monitoring-requirements.html` | Cannibalizes https://siya.health/blog/when-is-testosterone-therapy-appropriate |
| Medium | `answers/trt-monitoring-requirements.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/what-does-low-testosterone-feel-like.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/free-testosterone-vs-total-testosterone-what-patients-should-know. |
| Medium | `answers/when-is-testosterone-therapy-appropriate.html` | Cannibalizes https://siya.health/blog/when-is-testosterone-therapy-appropriate |
| Medium | `answers/when-is-testosterone-therapy-appropriate.html` | Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/why-normal-labs-dont-mean-healthy.html` | Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| Medium | `blog/adderall-ir-vs-xr-adults.html` | IR/XR variant duplicates Adderall mechanism article. |
| Medium | `blog/adhd-evaluation-california-online-vs-in-person.html` | CA geo cluster consolidation; online diagnosis cornerstone absorbs comparison intent. |
| Medium | `blog/adhd-evaluation-cost-california.html` | State-specific pricing duplicate; membership-pricing is canonical pricing page. |
| Medium | `blog/adhd-evaluation-cost-texas.html` | State-specific pricing duplicate of /adhd-evaluation-cost and membership-pricing. |
| Medium | `blog/adhd-medication-online-california.html` | CA medication blog duplicates general adult medication guide. |
| Medium | `blog/adhd-medication-options-california.html` | State variant of general medication options article; cannibalizes adult guide. |
| Medium | `blog/adhd-treatment-houston-online.html` | Houston blog duplicates Texas geo landing; 3 inbound. |
| Medium | `blog/adhd.html` | Category hub duplicates /blog index; merge ADHD article list into main blog hub. |
| Medium | `blog/adult-adhd-symptoms-california.html` | Symptoms content duplicates sitewide ADHD symptoms cornerstone (167 inbound). |
| Medium | `blog/after-adhd-diagnosis-next-steps-adults.html` | Post-diagnosis journey belongs on /adhd-care; 2 inbound thin article. |
| Medium | `blog/focalin-vs-adderall-comparison.html` | Third stimulant comparison page; consolidate ADHD med comparisons to canonical pair. |
| Medium | `blog/telehealth.html` | Category hub duplicates /blog; low unique value (327 words). |
| Medium | `blog/weight-loss.html` | Category hub duplicates /blog; merge weight-loss articles into filtered blog index. |
| Medium | `online-adhd-test.html` | Duplicate screening funnel intent with /adhd-screening; CTA audit flags cross-link confusion. |

## 7. Should be redirected

**Count:** 82 (Critical: 0, High: 38, Medium: 44, Low: 0)

| Severity | File | Finding |
|----------|------|--------|
| High | `adhd-diagnosis-austin.html` | → /adhd-diagnosis-texas: City geo page with 1 inbound; Texas state cornerstone absorbs Austin intent. |
| High | `adhd-diagnosis-houston.html` | → /adhd-diagnosis-texas: City geo page with 2 inbound; consolidate to single Texas geo cornerstone. |
| High | `adhd-diagnosis-pennsylvania.html` | → /adhd-care: Thin state geo (451 words, 1 inbound); PA coverage belongs as section on /adhd-care until traffic justifies standalone. |
| High | `adhd-diagnosis-philadelphia.html` | → /adhd-diagnosis-pennsylvania: City duplicate of PA state page; 1 inbound each, same offer. |
| High | `adhd-evaluation-cost.html` | → /membership-pricing: Standalone pricing page duplicates membership-pricing and adhd-care; consolidate single pricing source. |
| High | `adhd-treatment-online.html` | → /adhd-care: Post-diagnosis treatment belongs as section on /adhd-care; 1 inbound, thin duplicate. |
| High | `adult-adhd-diagnosis.html` | → /adhd-care: Overlaps /adhd-care H1 and offer; splits ADHD commercial intent across 3 URLs. |
| High | `answers/adhd-in-men.html` | → /answers/signs-of-adult-adhd: Thin gender variant (348 words, 1 inbound); signs-of-adult-adhd covers presentation. |
| High | `answers/adhd-in-women.html` | → /answers/signs-of-adult-adhd: Thin gender variant (356 words, 3 inbound); consolidate to adult signs cornerstone guide. |
| High | `answers/creyos-adhd-testing-explained.html` | → /adhd-care: Creyos FAQ with 1 inbound; merge into adhd-care evaluation section. |
| High | `answers/glp-1-nausea-management.html` | → /blog/glp1-side-effects-and-how-to-manage-them: Cannibalization owner Blog; nausea subset fully covered in GLP-1 side effects cornerstone. |
| High | `answers/high-functioning-adhd.html` | → /blog/how-to-know-if-you-have-adhd-adult: Thin guide (350 words); high-functioning narrative covered in adult ADHD cornerstone blog. |
| High | `answers/how-much-does-adhd-testing-cost.html` | → /membership-pricing: Pricing FAQ duplicates membership-pricing and adhd-care pricing sections. |
| High | `answers/rejection-sensitivity-adhd.html` | → /answers/signs-of-adult-adhd: Niche ADHD symptom (365 words, 2 inbound); low search volume vs maintenance cost. |
| High | `answers/telehealth-adhd-texas.html` | → /blog/online-adhd-diagnosis-texas: TX telehealth FAQ duplicates TX diagnosis blog; geo FAQ → geo cornerstone. |
| High | `answers/time-blindness-adhd.html` | → /answers/signs-of-adult-adhd: Micro-topic guide (358 words, 2 inbound); consolidate to adult signs cornerstone guide. |
| High | `answers/weight-gain-after-stopping-ozempic.html` | → /blog/food-noise-and-glp-1-what-it-means-and-what-helps: Ozempic cessation FAQ with 1 inbound; food-noise cornerstone owns GLP-1 rebound narrative. |
| High | `answers/what-included-199-adhd-evaluation.html` | → /adhd-care: Evaluation scope FAQ belongs on /adhd-care offer section. |
| High | `blog/adderall-ir-vs-xr-adults.html` | → /blog/adderall-for-adhd-how-it-works: IR/XR variant duplicates Adderall mechanism article. |
| High | `blog/adhd-evaluation-california-online-vs-in-person.html` | → /blog/online-adhd-diagnosis-california: CA geo cluster consolidation; online diagnosis cornerstone absorbs comparison intent. |
| High | `blog/adhd-evaluation-cost-california.html` | → /membership-pricing: State-specific pricing duplicate; membership-pricing is canonical pricing page. |
| High | `blog/adhd-evaluation-cost-texas.html` | → /membership-pricing: State-specific pricing duplicate of /adhd-evaluation-cost and membership-pricing. |
| High | `blog/adhd-medication-online-california.html` | → /blog/adhd-medication-options-for-adults: CA medication blog duplicates general adult medication guide. |
| High | `blog/adhd-medication-online-texas-telehealth.html` | → /blog/online-adhd-diagnosis-texas: TX medication logistics covered by TX diagnosis cornerstone + /adhd-care. |
| High | `blog/adhd-medication-options-california.html` | → /blog/adhd-medication-options-for-adults: State variant of general medication options article; cannibalizes adult guide. |
| High | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | → /adhd-screening: Screening vs evaluation intent owned by /adhd-screening + /adhd-care. |
| High | `blog/adhd-treatment-houston-online.html` | → /adhd-diagnosis-texas: Houston blog duplicates Texas geo landing; 3 inbound. |
| High | `blog/adult-adhd-symptoms-california.html` | → /blog/how-to-know-if-you-have-adhd-adult: Symptoms content duplicates sitewide ADHD symptoms cornerstone (167 inbound). |
| High | `blog/adult-adhd-treatment-california-2026.html` | → /adhd-care: Treatment commercial intent belongs on service page, not geo blog. |
| High | `blog/after-adhd-diagnosis-next-steps-adults.html` | → /adhd-care: Post-diagnosis journey belongs on /adhd-care; 2 inbound thin article. |
| High | `blog/combining-adhd-treatment-and-weight-loss-strategies.html` | → /weight-loss-metabolic-health: Cross-service article with 2 inbound; metabolic service page owns dual-condition positioning. |
| High | `blog/focalin-vs-adderall-comparison.html` | → /blog/vyvanse-vs-adderall-differences: Third stimulant comparison page; consolidate ADHD med comparisons to canonical pair. |
| High | `blog/how-to-choose-adhd-provider-california.html` | → /providers: Provider selection intent better served by /providers hub + profiles. |
| High | `creyos-adhd-testing.html` | → /adhd-care: Creyos is included in $199 evaluation; standalone page fragments ADHD funnel (3 inbound). |
| High | `labs.html` | → /telehealth: 102-word coming-soon placeholder; no unique content. Defer until labs launch. |
| High | `online-adhd-test.html` | → /adhd-screening: Duplicate screening funnel intent with /adhd-screening; CTA audit flags cross-link confusion. |
| High | `prescriptions.html` | → /telehealth: 92-word coming-soon placeholder; 1 inbound. Telehealth owns prescription narrative. |
| High | `primary-urgent-care.html` | → /telehealth: Secondary service with 1 inbound; telehealth page covers virtual primary care positioning. |
| Medium | `answers/adderall-vs-vyvanse-adults.html` | → /blog/vyvanse-vs-adderall-differences: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/adhd-and-weight-loss-connection.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/adhd-medication-side-effects.html` | → /blog/adhd-medication-side-effects-what-to-expect: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/adhd-vs-anxiety.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/adhd-vs-burnout.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/afternoon-energy-crash-after-lunch.html` | → /answers: Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| Medium | `answers/asrs-adhd-screening-explained.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/brain-fog-after-eating.html` | → /answers: Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| Medium | `answers/can-adhd-cause-anxiety.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/can-you-get-adhd-medication-online.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/compounded-vs-branded-glp-1.html` | → /blog/compounded-vs-branded-glp1-medications: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/ed-telehealth-legitimate.html` | → /telehealth: Supporting/thin guide not in minimum viable whitelist; consolidate to /telehealth. |
| Medium | `answers/executive-dysfunction-adhd.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/food-noise-returned-on-glp-1.html` | → /blog/food-noise-and-glp-1-what-it-means-and-what-helps: Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/food-noise-and-glp-1-what-it-means-and-what-helps. |
| Medium | `answers/fsa-hsa-adhd-evaluation.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/glp-1-side-effects.html` | → /blog/glp1-side-effects-and-how-to-manage-them: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/high-shbg-low-free-testosterone.html` | → /blog/free-testosterone-vs-total-testosterone-what-patients-should-know: Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/free-testosterone-vs-total-testosterone-what-patients-should-know. |
| Medium | `answers/how-long-adhd-evaluation.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/how-online-prescriptions-work.html` | → /answers: Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| Medium | `answers/insulin-resistance-without-diabetes.html` | → /blog/insulin-resistance-and-weight-loss-clinician-overview: Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/insulin-resistance-and-weight-loss-clinician-overview. |
| Medium | `answers/is-adhd-medication-safe-long-term.html` | → /blog/is-adhd-medication-safe-long-term: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/is-online-adhd-diagnosis-legitimate.html` | → /blog/is-online-adhd-diagnosis-legit: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/late-adhd-diagnosis-adults.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/medical-weight-loss-vs-dieting.html` | → /blog/medical-weight-loss-vs-dieting-what-actually-works: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/meet-and-greet-telehealth-expectations.html` | → /telehealth: Supporting/thin guide not in minimum viable whitelist; consolidate to /telehealth. |
| Medium | `answers/minoxidil-hair-loss-does-it-work.html` | → /blog/minoxidil-for-hair-loss-does-it-work: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/non-stimulant-adhd-medications.html` | → /blog/non-stimulant-adhd-medications-explained: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/normal-a1c-insulin-resistance.html` | → /blog/insulin-resistance-and-weight-loss-clinician-overview: Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/insulin-resistance-and-weight-loss-clinician-overview. |
| Medium | `answers/oral-vs-injectable-weight-loss-meds.html` | → /blog/oral-vs-injectable-weight-loss-medications: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/oral-vs-topical-minoxidil.html` | → /blog/oral-vs-topical-minoxidil-which-is-right: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/phentermine-weight-loss-safety.html` | → /blog/phentermine-for-weight-loss-safety-and-effectiveness: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/poor-sleep-feels-like-adhd.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/semaglutide-weight-loss-how-it-works.html` | → /blog/semaglutide-for-weight-loss-how-it-works: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/signs-of-sleep-apnea-in-adults.html` | → /blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign: Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign. |
| Medium | `answers/sildenafil-erectile-dysfunction-expectations.html` | → /blog/sildenafil-for-erectile-dysfunction-what-to-expect: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/starting-adhd-medication-adults.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/testosterone-and-adhd-overlap.html` | → /adhd-care: Supporting/thin guide not in minimum viable whitelist; consolidate to /adhd-care. |
| Medium | `answers/tirzepatide-vs-semaglutide.html` | → /blog/tirzepatide-vs-semaglutide-which-is-better: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/trt-monitoring-requirements.html` | → /blog/when-is-testosterone-therapy-appropriate: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/what-does-low-testosterone-feel-like.html` | → /blog/free-testosterone-vs-total-testosterone-what-patients-should-know: Supporting/thin guide not in minimum viable whitelist; consolidate to /blog/free-testosterone-vs-total-testosterone-what-patients-should-know. |
| Medium | `answers/when-is-testosterone-therapy-appropriate.html` | → /blog/when-is-testosterone-therapy-appropriate: Cannibalization Phase 1 duplicate; blog owns long-form. Guide narrowed to FAQ but still splits authority — redirect per pruning. |
| Medium | `answers/why-normal-labs-dont-mean-healthy.html` | → /answers: Supporting/thin guide not in minimum viable whitelist; consolidate to /answers. |
| Medium | `blog/how-mental-health-affects-weight-loss-outcomes.html` | → /weight-loss-metabolic-health: Blog not in minimum viable whitelist; redirect to preserve link equity on /weight-loss-metabolic-health. |
| Medium | `blog/long-term-weight-loss-medications-what-to-expect.html` | → /weight-loss-metabolic-health: Blog not in minimum viable whitelist; redirect to preserve link equity on /weight-loss-metabolic-health. |

## 8. Should be deleted

**Count:** 12 (Critical: 0, High: 12, Medium: 0, Low: 0)

| Severity | File | Finding |
|----------|------|--------|
| High | `adhd-diagnosis-florida.html` | Thin geo landing; zero inbound links, orphan. Florida not a licensed priority state in entity-graph. |
| High | `adhd-diagnosis-florida.html` | Brand audit: DELETE |
| High | `blog/all.html` | Redundant article index duplicating /blog hub; 4 inbound only from footer. High maintenance, no unique SEO value. |
| High | `blog/ambien-and-sleep-medications-risks-and-benefits.html` | Off-scope sleep Rx content; Siya does not promote Ambien prescribing. 2 inbound, no conversion path. |
| High | `blog/glutathione-and-peptides-what-do-they-actually-do.html` | Peptide marketing content outside current service scope; 2 inbound, maintenance with no revenue tie. |
| High | `blog/modafinil-for-focus-and-fatigue-is-it-safe.html` | Modafinil not a Siya service line; risks implying off-label prescribing. 4 inbound only. |
| High | `privacy-policy.html` | Legacy legal stub; canonical is /legal/privacy-policy. Zero inbound. Remove file after 301. |
| High | `privacy-policy.html` | Brand audit: DELETE |
| High | `siya-circle.html` | Orphan utility page (0 inbound). Newsletter signup belongs in footer only per CTA audit. |
| High | `siya-circle.html` | Brand audit: DELETE |
| High | `terms.html` | Legacy legal stub; canonical is /legal/terms-of-use. Zero inbound. Remove file after 301. |
| High | `terms.html` | Brand audit: DELETE |

## 9. Require rewrites

**Count:** 72 (Critical: 0, High: 21, Medium: 51, Low: 0)

| Severity | File | Finding |
|----------|------|--------|
| High | `about.html` | Fix team image alt text, link providers, reduce duplicate CTAs. |
| High | `adhd-care.html` | Core revenue page; add state availability sections, Creyos/pricing blocks, provider cards. |
| High | `adhd-diagnosis-texas.html` | Geo cornerstone; add provider routing and state-specific trust signals. |
| High | `adhd-screening.html` | Brand score 6.5/10; flags: alignment |
| High | `adhd-screening.html` | Top-of-funnel; align copy with /adhd-care after online-adhd-test redirect. |
| High | `answers/index.html` | Hub needs pillar restructure after guide pruning; reduce 87 outbound links. |
| High | `blog/adhd-symptoms-overlooked.html` | Brand score 6/10; flags: alignment |
| High | `blog/adhd-telehealth-california.html` | Brand score 6/10; flags: alignment |
| High | `blog/how-to-know-if-you-have-adhd-adult.html` | Brand score 6/10; flags: alignment |
| High | `blog/index.html` | Simplify discovery; remove blog/all dependency; category hubs may merge. |
| High | `blog/online-adhd-diagnosis-california.html` | Brand score 6.5/10; flags: Outdated language |
| High | `blog/vyvanse-vs-adderall-differences.html` | Brand score 6/10; flags: alignment |
| High | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Brand score 5/10; flags: Outdated language |
| High | `index.html` | Homepage MVP polish needed; consolidate CTAs and link all provider cards per provider audit. |
| High | `legal/cookie-policy/index.html` | Brand score 5.5/10; flags: alignment |
| High | `legal/privacy-policy/index.html` | Brand score 5.5/10; flags: alignment |
| High | `legal/terms-of-use/index.html` | Brand score 5.5/10; flags: alignment |
| High | `membership-pricing.html` | Single pricing source of truth; absorb adhd-evaluation-cost redirects. |
| High | `mens-health-longevity.html` | Core revenue; align scope to actual services, add hormone cornerstone links. |
| High | `telehealth.html` | Core routing hub; absorb redirected coming-soon services, simplify service grid. |
| High | `weight-loss-metabolic-health.html` | Core revenue; add provider authority (Sneh), simplify CTA bands per CTA audit. |
| Medium | `about.html` | CTA band consolidation (8 main CTAs) |
| Medium | `adhd-care.html` | Brand score 7.5/10; flags: Excessive CTAs |
| Medium | `adhd-care.html` | CTA band consolidation (7 main CTAs) |
| Medium | `adhd-diagnosis-austin.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adhd-diagnosis-austin.html` | CTA band consolidation (6 main CTAs) |
| Medium | `adhd-diagnosis-florida.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adhd-diagnosis-florida.html` | CTA band consolidation (5 main CTAs) |
| Medium | `adhd-diagnosis-houston.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adhd-diagnosis-houston.html` | CTA band consolidation (5 main CTAs) |
| Medium | `adhd-diagnosis-pennsylvania.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adhd-diagnosis-pennsylvania.html` | CTA band consolidation (5 main CTAs) |
| Medium | `adhd-diagnosis-philadelphia.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adhd-diagnosis-philadelphia.html` | CTA band consolidation (5 main CTAs) |
| Medium | `adhd-diagnosis-texas.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adhd-diagnosis-texas.html` | CTA band consolidation (5 main CTAs) |
| Medium | `adhd-evaluation-cost.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adhd-evaluation-cost.html` | CTA band consolidation (5 main CTAs) |
| Medium | `adhd-treatment-online.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adhd-treatment-online.html` | CTA band consolidation (5 main CTAs) |
| Medium | `adult-adhd-diagnosis.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `adult-adhd-diagnosis.html` | CTA band consolidation (5 main CTAs) |
| Medium | `answers/index.html` | CTA band consolidation (6 main CTAs) |
| Medium | `blog/adhd-evaluation-cost-texas.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `blog/adhd-symptoms-overlooked.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `blog/how-to-know-if-you-have-adhd-adult.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `blog/index.html` | CTA band consolidation (5 main CTAs) |
| Medium | `blog/online-adhd-diagnosis-texas.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `book-appointment.html` | Brand score 7.5/10; flags: Excessive CTAs |
| Medium | `book-appointment.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `book-appointment.html` | CTA band consolidation (5 main CTAs) |
| Medium | `creyos-adhd-testing.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `creyos-adhd-testing.html` | CTA band consolidation (5 main CTAs) |
| Medium | `index.html` | Brand score 8/10; flags: Excessive CTAs, Outdated language |
| Medium | `index.html` | CTA band consolidation (15 main CTAs) |
| Medium | `labs.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `mens-health-longevity.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `mens-health-longevity.html` | CTA band consolidation (4 main CTAs) |
| Medium | `online-adhd-test.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `online-adhd-test.html` | CTA band consolidation (6 main CTAs) |
| Medium | `prescriptions.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `primary-urgent-care.html` | Pricing copy needs $79/$149 follow-up tier clarity |
| Medium | `primary-urgent-care.html` | CTA band consolidation (4 main CTAs) |
| Medium | `providers/derek-timbs.html` | CTA band consolidation (4 main CTAs) |
| Medium | `providers/dr-natasha-desai.html` | CTA band consolidation (4 main CTAs) |
| Medium | `providers/dr-sneh-pandey.html` | CTA band consolidation (4 main CTAs) |
| Medium | `providers/dr-swati-pandey.html` | CTA band consolidation (4 main CTAs) |
| Medium | `providers/dr-vanessa-urbina.html` | CTA band consolidation (4 main CTAs) |
| Medium | `providers/index.html` | CTA band consolidation (9 main CTAs) |
| Medium | `providers/megan-wunderlich.html` | CTA band consolidation (5 main CTAs) |
| Medium | `providers/wendy-delgado.html` | CTA band consolidation (4 main CTAs) |
| Medium | `siya-circle.html` | CTA band consolidation (6 main CTAs) |

## 10. Can remain unchanged

**Count:** 44 (Critical: 0, High: 0, Medium: 0, Low: 44)

| Severity | File | Finding |
|----------|------|--------|
| Low | `answers/adhd-medication-every-day.html` | Brand alignment 7.5/10 |
| Low | `answers/can-adhd-be-diagnosed-online.html` | Brand alignment 8.5/10 |
| Low | `answers/can-sleep-apnea-cause-fatigue.html` | Brand alignment 7.5/10 |
| Low | `answers/is-telehealth-legitimate.html` | Brand alignment 8.5/10 |
| Low | `answers/screening-vs-adhd-evaluation.html` | Brand alignment 7.5/10 |
| Low | `answers/signs-of-adult-adhd.html` | Brand alignment 6.5/10 |
| Low | `answers/telehealth-adhd-california.html` | Brand alignment 7.5/10 |
| Low | `answers/what-is-food-noise.html` | Brand alignment 7.5/10 |
| Low | `answers/what-is-free-testosterone.html` | Brand alignment 7.5/10 |
| Low | `answers/what-is-insulin-resistance.html` | Brand alignment 7.5/10 |
| Low | `answers/who-qualifies-glp-1-weight-loss.html` | Brand alignment 7.5/10 |
| Low | `answers/why-am-i-tired-even-after-sleeping.html` | Brand alignment 7.5/10 |
| Low | `blog/adderall-for-adhd-how-it-works.html` | Brand alignment 6.5/10 |
| Low | `blog/adhd-medication-daily-or-as-needed-adults.html` | Brand alignment 6.5/10 |
| Low | `blog/adhd-medication-options-for-adults.html` | Brand alignment 6.5/10 |
| Low | `blog/adhd-medication-side-effects-what-to-expect.html` | Brand alignment 7.5/10 |
| Low | `blog/compounded-vs-branded-glp1-medications.html` | Brand alignment 7.5/10 |
| Low | `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | Brand alignment 8.5/10 |
| Low | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Brand alignment 7.5/10 |
| Low | `blog/glp1-side-effects-and-how-to-manage-them.html` | Brand alignment 9/10 |
| Low | `blog/how-adhd-medication-is-prescribed-online.html` | Brand alignment 6.5/10 |
| Low | `blog/how-to-safely-get-prescriptions-online.html` | Brand alignment 7.5/10 |
| Low | `blog/insomnia-treatment-options-beyond-medication.html` | Brand alignment 7.5/10 |
| Low | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | Brand alignment 8.5/10 |
| Low | `blog/is-adhd-medication-safe-long-term.html` | Brand alignment 7.5/10 |
| Low | `blog/is-online-adhd-diagnosis-legit.html` | Brand alignment 7.5/10 |
| Low | `blog/medical-weight-loss-glp1-semaglutide-texas.html` | Brand alignment 8.5/10 |
| Low | `blog/medical-weight-loss-vs-dieting-what-actually-works.html` | Brand alignment 8.5/10 |
| Low | `blog/minoxidil-for-hair-loss-does-it-work.html` | Brand alignment 6.5/10 |
| Low | `blog/non-stimulant-adhd-medications-explained.html` | Brand alignment 6.5/10 |
| Low | `blog/oral-vs-injectable-weight-loss-medications.html` | Brand alignment 7.5/10 |
| Low | `blog/oral-vs-topical-minoxidil-which-is-right.html` | Brand alignment 6.5/10 |
| Low | `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | Brand alignment 8.5/10 |
| Low | `blog/semaglutide-for-weight-loss-how-it-works.html` | Brand alignment 7.5/10 |
| Low | `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | Brand alignment 6.5/10 |
| Low | `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Brand alignment 7.5/10 |
| Low | `blog/telehealth-prescriptions-how-online-treatment-works.html` | Brand alignment 8.5/10 |
| Low | `blog/tirzepatide-vs-semaglutide-which-is-better.html` | Brand alignment 7.5/10 |
| Low | `blog/when-is-testosterone-therapy-appropriate.html` | Brand alignment 7.5/10 |
| Low | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | Brand alignment 8.5/10 |
| Low | `legal/controlled-substance-treatment-agreement/index.html` | Brand alignment 6/10 |
| Low | `legal/index.html` | Core revenue, trust, or legal page in minimum viable site. |
| Low | `legal/notice-of-privacy-practices/index.html` | Brand alignment 6/10 |
| Low | `pricing.html` | Canonical $199/$79/$149 care-delivery model implemented (§3); Bronze/Silver/Gold mention is negation only |

---

## Methodology

1. Re-ran four audit scripts (JSON artifacts only; no HTML edits).
2. Scanned all **164** HTML files for legacy phrases, forbidden CTAs, pricing drift, and positioning.
3. Merged `site-pruning-audit.json` (82 redirects, 8 deletes).
4. Manually corrected `pricing.html` Bronze/Silver/Gold false positive.
5. Severity: **Critical** = breaks canonical model; **High** = trust/clinical accuracy; **Medium** = consolidation; **Low** = compliant.
