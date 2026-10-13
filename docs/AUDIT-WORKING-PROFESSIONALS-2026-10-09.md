# Site rebrand audit — working professionals — 2026-10-09

Worktree: `/Users/sp/siya-pillars` branch `guides/pillars` tip `7b4383d7`. Read-only. No site file was edited. Labels: **EVIDENCE** or **INFERENCE**.

## 0. Executive summary

**EVIDENCE:** Production homepage already says “Welcome to an integrated care experience for busy professionals” (live curl 200, content-length 63086, last-modified Fri 09 Oct 2026 05:12:13 GMT). The rebrand is not only on paper. What is only on this branch: the hormonal split (`/guides/testosterone`, `/guides/perimenopause`, `/guides/fatigue-tracking` return 404 on https://www.siya.health), the shortened `/guides/hormonal-health` (pillars 9575 bytes vs main 20149 bytes), and the bulk of the 90-page retirement (live `/blog/adderall-for-adhd-how-it-works` is still 200).

**Lane percents (method):** Positioning keyword on sitemap H1+first sentence: 5 yes / 20 partly / 90 no of 115 sitemap URLs (scripted keyword match, **INFERENCE** as a completeness score, quotes in §4). Guide rewrite vs main: 8 guide files exist on the branch; 3 of them are new files absent from main (**EVIDENCE** git diff). Consolidation: 90 HTML files exist on main and not on this branch (**EVIDENCE** file compare); those URLs are not retired in production (spot check adderall 200). Clinical sign-off: 3 of 8 guides are in `CLINICAL_REVIEW_APPROVED` (`guides/sleep`, `guides/testosterone`, `guides/perimenopause` — `data/content-review-registry.mjs` lines 39–58). Blogs and answers registries are empty. **INFERENCE:** of the 9 first screens in §4, 4 are yes, 3 partly, 2 no; `/` is byte-identical to main, so that yes is already in production. Consolidation is ~0% deployed (adderall still 200) and present as a branch diff (90 HTML files removed), with one dirty guide.

**Five risks:** (1) Merging this branch without `fix/team-feedback-tier0` (`5cbb5810`) drops the screening-results hide and the cream-button contrast fix — those commits are not in this branch. (2) Uncommitted `guides/mental-health-and-adhd.html` would be omitted or accidentally included. (3) Tip `7b4383d7` is 1 commit ahead of `origin/guides/pillars` (not pushed). (4) Physician-reviewed label is allowed on only 3 guides; other guides still say Clinician-informed or nothing, and a merge would publish unreviewed rewrites (weight, exhausted, mental-health, fatigue-tracking, shortened hormonal landing). (5) “2,700+” and “$149” are on many pages with no source file in this audit that verifies the number; backlog marks stats and employer price as blocked.

**Next order:** lock the one-liner and the blocked facts (Florida clinic, price, 2,700) before more copy; merge Tier 0 into this branch before any production merge; do not deploy; keep content generation paused; do not generate pages. **Cut / defer:** a weight-page wallpaper (the reading-friendly ticket asks for a fixed-contrast background and less motion; it does not say “header image only”), new 24/7 patient copy until compliance signs it, employer price, and any new generated articles.

**Only on paper (this branch, not production):** testosterone, perimenopause, and fatigue-tracking guides; the short hormonal landing that replaces the long live page; the retirement of pages that are still HTTP 200 on www.siya.health; sitemap commit `7b4383d7`.

## 1. State map

| Worktree | Branch | Tip | vs main (behind/ahead) | Dirty | Pushed | If merged to main |
|---|---|---|---|---|---|---|
| `/Users/sp/amcare-os` | main | `9baeaea8` | 0/0 | dirty (do not touch) | yes (user-stated production) | This is production’s git tip per the brief. Live headers do not name a deployment id. |
| `/Users/sp/siya-pillars` | guides/pillars | `7b4383d7` | 0/14 | 4 paths (below) | no — 1 ahead of origin | Would publish guide rewrites, hormonal split, sitemap, and ~90 fewer HTML files plus new redirects. |
| `/Users/sp/siya-fixes` | fix/team-feedback-tier0 | `5cbb5810` | 0/2 | clean at last read | not deployed | Screening-results gate (`951d587a`) and contrast (`5cbb5810`). Must land or this branch overwrites those files where they overlap. |
| `/Users/sp/siya-hotfix` | deploy/main-9baeaea8 | `7707f79a` | 0/1 | clean | deploy trigger, no content | Empty content trigger. |
| `/Users/sp/siya-release` | release/2026-10-09 | `b6c02a36` | 0/100 | clean | employer-demo release line | Not the patient-site rebrand. Merging it into main would mix the demo release. |
| `/Users/sp/siya-demo` | employer-demo-journey-prod | `6533ddb6` | 5/82 | dirty | preview line | Would regress or replace patient pages with demo work. Do not merge. |
| `/Users/sp/siya-guides` | wip/hormonal-health-patch | `46bae4ea` | 5/62 | clean | old WIP | Stale relative to this branch. |
| `/Users/sp/siya-tier0-staged` | deploy/tier0-staged | `5cbb5810` | 0/2 | clean | same commits as Tier 0 | Same as siya-fixes. |

**EVIDENCE:** `git -C /Users/sp/siya-pillars rev-list --left-right --count main...HEAD` = `0 14`. `origin/guides/pillars...HEAD` = `0 1`. Dirty: `M apps/siya-health/.gitignore`, `M apps/siya-health/guides/mental-health-and-adhd.html`, `?? apps/siya-health/docs/POST-CLEANUP-HUMAN-REVIEW.md`, `?? docs/BACKLOG-2026-10-09.md`. `git merge-tree --name-only main HEAD` printed only a tree id (no conflict file list). `git merge-tree --name-only HEAD 5cbb5810` also printed only a tree id. Files changed on both branches vs main: `adhd-screening.html`, `creyos-adhd-testing.html`, `scripts/site-chrome.mjs`.

**Live production:** HTTP 200, `last-modified: Fri, 09 Oct 2026 05:12:13 GMT`, `content-length: 63086`, `x-vercel-cache: HIT`. **COULD NOT VERIFY:** deployment id `dpl_AUmPNzerNeXpLLQ9QAnry3oMwELw` (not present in response headers). Rollback target not named in headers. **INFERENCE:** rollback is the previous Vercel deployment of main, not this branch.

**Could regress production if pushed to main:** `guides/pillars` (unreviewed guide bodies + 90 retirements), `release/2026-10-09` and `employer-demo-journey-prod` (different product line, demo is 5 behind main), any dirty demo worktree.

## 2. Page-by-page matrix

Sitemap URL count: **115**. Status compares file bytes to `/Users/sp/amcare-os` (main). Positioning is a keyword flag on H1 + first long sentence, not a human grade. Review label is visible text. Em-dash count is inside `<main>` only. Feedback column is blank because the 34-row sheet was not in the prompt.

| URL | Type | vs main | Position | H1 | First sentence | Review label | Em | Words in main | Next action |
|---|---|---|---|---|---|---|---|---|---|
| `/` | home | same | yes | Welcome to an integrated care experience for busy professionals | Welcome to an integrated care experience for busy professionals Explore our care model Care that covers Primar | none | 42 | 1122 | see §8 / §9 |
| `/about` | other | same | yes | Busy professionals weren’t failing. The healthcare system was. | Physician-led care for people whose jobs don’t stop at 5 p.m., in California, Texas, Pennsylvania, and Florida | none | 10 | 618 | see §8 / §9 |
| `/adhd-care` | care | same | partly | Adult ADHD care for working professionals | Adult ADHD care for working professionals Physician-led evaluation and follow-up. | none | 4 | 354 | see §8 / §9 |
| `/adhd-care/miami` | care | rewritten | no | Adult ADHD evaluation in Miami, FL | ADHD Care · Miami, FL Adult ADHD evaluation in Miami, FL Searching for adult ADHD testing near Miami? | none | 28 | 826 | see §8 / §9 |
| `/adhd-care/orlando` | care | same | no | Adult ADHD evaluation in Orlando, FL | ADHD Care · Orlando, FL Adult ADHD evaluation in Orlando, FL Looking for adult ADHD testing in Orlando? | none | 22 | 768 | see §8 / §9 |
| `/adhd-care/san-diego` | care | same | no | Adult ADHD evaluation in San Diego, CA | ADHD Care · San Diego, CA Adult ADHD evaluation in San Diego, CA Searching for adult ADHD testing in San Diego | none | 22 | 774 | see §8 / §9 |
| `/adhd-diagnosis-texas` | care | same | no | Online ADHD Diagnosis in Texas | Main ADHD pathway: ADHD Care is our main ADHD care page for evaluation, screening, and treatment planning. | none | 12 | 449 | see §8 / §9 |
| `/adhd-evaluation-california` | care | same | no | Adult ADHD evaluation in California—same-week, physician-led | Adult ADHD Evaluation & Testing · California Adult ADHD evaluation in California—same-week, physician-led Wond | none | 22 | 804 | see §8 / §9 |
| `/adhd-evaluation-texas` | care | same | no | Adult ADHD evaluation in Texas—same-week, physician-led | Adult ADHD Evaluation & Testing · Texas Adult ADHD evaluation in Texas—same-week, physician-led Wondering if A | none | 24 | 852 | see §8 / §9 |
| `/adhd-screening` | care | rewritten | no | What are you looking for help with? | ADHD screening is a short questionnaire; for other services we’ll take you to the right page on our site. | none | 8 | 455 | see §8 / §9 |
| `/adhd-screening-results` | care | same | no | Your ADHD screening is complete | Screening result Your ADHD screening is complete This screening is not a diagnosis. | none | 4 | 131 | see §8 / §9 |
| `/adult-adhd-california` | care | rewritten | no | Adult ADHD care in California | ADHD Care · California Adult ADHD care in California Everything a California adult needs to understand ADHD in | none | 58 | 1613 | see §8 / §9 |
| `/answers/can-adhd-be-diagnosed-online` | answers | same | no | Can ADHD be diagnosed online? | Health Guides · ADHD Can ADHD be diagnosed online? | Clinician-informed | 26 | 837 | see §8 / §9 |
| `/answers/can-you-get-adhd-medication-online` | answers | rewritten | no | Can you get ADHD medication online? | Health Guides · ADHD Can you get ADHD medication online? | Clinician-informed | 22 | 486 | see §8 / §9 |
| `/answers/ed-telehealth-legitimate` | answers | rewritten | no | Is telehealth for erectile dysfunction legitimate? | Health Guides · Is telehealth for erectile dysfunction legitimate? | Clinician-informed | 16 | 432 | see §8 / §9 |
| `/answers/fsa-hsa-adhd-evaluation` | answers | same | no | Can you use FSA or HSA for ADHD evaluation? | Health Guides · Telehealth Can you use FSA or HSA for ADHD evaluation? | Clinician-informed | 16 | 538 | see §8 / §9 |
| `/answers/how-long-adhd-evaluation` | answers | same | no | How long does an ADHD evaluation take? | Health Guides · ADHD How long does an ADHD evaluation take? | Clinician-informed | 12 | 495 | see §8 / §9 |
| `/answers/how-much-does-adhd-testing-cost` | answers | same | no | How much does ADHD testing cost? | Health Guides · ADHD How much does ADHD testing cost? | Clinician-informed | 12 | 510 | see §8 / §9 |
| `/answers/how-online-prescriptions-work` | answers | same | no | How do online prescriptions work legally? | Health Guides · Telehealth How do online prescriptions work legally? | Clinician-informed | 24 | 807 | see §8 / §9 |
| `/answers/index` | answers | rewritten | no | Health Guides | Health Guides Each guide answers one question with a short takeaway, a deeper explanation, cited evidence, and | none | 14 | 869 | see §8 / §9 |
| `/answers/is-online-adhd-diagnosis-legitimate` | answers | same | no | What should you look for in a legitimate online ADHD diagnosis? | Health Guides · ADHD What should you look for in a legitimate online ADHD diagnosis? | Clinician-informed | 24 | 941 | see §8 / §9 |
| `/answers/is-telehealth-legitimate` | answers | same | no | Is telehealth legitimate for medical care? | Health Guides · Telehealth Is telehealth legitimate for medical care? | Clinician-informed | 26 | 799 | see §8 / §9 |
| `/answers/meet-and-greet-telehealth-expectations` | answers | same | no | What should I expect from a first telehealth visit? | Health Guides · Telehealth What should I expect from a first telehealth visit? | Clinician-informed | 18 | 827 | see §8 / §9 |
| `/answers/telehealth-adhd-california` | answers | same | no | How does ADHD telehealth work in California? | Health Guides · Telehealth How does ADHD telehealth work in California? | Clinician-informed | 12 | 566 | see §8 / §9 |
| `/answers/telehealth-adhd-texas` | answers | same | no | How does ADHD telehealth work in Texas? | Health Guides · Telehealth How does ADHD telehealth work in Texas? | Clinician-informed | 12 | 491 | see §8 / §9 |
| `/answers/what-happens-after-adhd-evaluation` | answers | rewritten | no | What happens after an ADHD evaluation? | Health Guides · ADHD What happens after an ADHD evaluation? | Clinician-informed | 18 | 696 | see §8 / §9 |
| `/answers/what-included-199-adhd-evaluation` | answers | same | no | What is included in a Siya Health ADHD evaluation? | Health Guides · Telehealth What is included in a Siya Health ADHD evaluation? | Clinician-informed | 16 | 550 | see §8 / §9 |
| `/answers/what-to-do-after-lab-results` | answers | rewritten | no | What to do after you get lab results | Health Guides · Telehealth What to do after you get lab results Educational only: This page is for general edu | Clinician-informed | 34 | 1202 | see §8 / §9 |
| `/answers/which-preventive-blood-tests-adults` | answers | rewritten | no | Which preventive blood tests do adults usually need? | Health Guides · Weight loss Which preventive blood tests do adults usually need? | Clinician-informed | 42 | 1331 | see §8 / §9 |
| `/blog/adhd` | blog | rewritten | no | ADHD articles | Blog home ADHD Weight loss Telehealth ADHD articles Clinical education on evaluation, symptoms, and medication | none | 14 | 638 | see §8 / §9 |
| `/blog/adhd-accommodations-hr-primer` | blog | rewritten | partly | ADHD Accommodations at Work: An HR Primer | Employers · HR & benefits guide ADHD Accommodations at Work: An HR Primer When an employee mentions ADHD or fo | Clinician-informed | 32 | 641 | see §8 / §9 |
| `/blog/adhd-evaluation-california-online-vs-in-person` | blog | rewritten | no | ADHD Evaluation in California: Online vs In-Person Options | ADHD Resources · California ADHD Evaluation in California: Online vs In-Person Options Choosing between ADHD e | Clinician-informed | 28 | 554 | see §8 / §9 |
| `/blog/adhd-evaluation-cost-texas` | blog | rewritten | no | ADHD Evaluation Cost in Texas: Full Breakdown (2026 Guide) | ADHD Resources · Texas ADHD Evaluation Cost in Texas: Full Breakdown (2026 Guide) You’ve finally decided to lo | Clinician-informed | 10 | 676 | see §8 / §9 |
| `/blog/adhd-testing-online-california-screening-vs-evaluation` | blog | rewritten | no | ADHD Testing Online in California: Screening vs Full Evaluation | ADHD Resources · California ADHD Testing Online in California: Screening vs Full Evaluation If you googled ADH | Clinician-informed | 36 | 467 | see §8 / §9 |
| `/blog/adult-adhd-symptoms-california` | blog | rewritten | no | Adult ADHD Symptoms in California: Patterns Worth Taking Seriously | ADHD Resources · California Adult ADHD Symptoms in California: Patterns Worth Taking Seriously If you are sear | Clinician-informed | 44 | 926 | see §8 / §9 |
| `/blog/cognitive-health-benefits-for-employers` | blog | rewritten | partly | Cognitive Health Benefits for Employers | Employers · HR & benefits guide Cognitive Health Benefits for Employers Benefits teams are asked to solve focu | Clinician-informed | 32 | 594 | see §8 / §9 |
| `/blog/focus-fatigue-workforce-issue` | blog | rewritten | partly | When Focus and Fatigue Show Up as a Workforce Issue | Employers · HR & benefits guide When Focus and Fatigue Show Up as a Workforce Issue Quarterly reviews mention  | Clinician-informed | 28 | 590 | see §8 / §9 |
| `/blog/how-adhd-medication-is-prescribed-online` | blog | rewritten | no | How ADHD Medication Is Prescribed Online (2026) | ADHD · Medication education How ADHD Medication Is Prescribed Online (2026) Telehealth made ADHD care more acc | Clinician-informed | 8 | 642 | see §8 / §9 |
| `/blog/how-to-choose-adhd-provider-california` | blog | rewritten | no | How to Choose an ADHD Provider in California | ADHD Resources · California How to Choose an ADHD Provider in California If you wondered how to choose an ADHD | Clinician-informed | 34 | 619 | see §8 / §9 |
| `/blog/how-to-safely-get-prescriptions-online` | blog | rewritten | no | How to Safely Get Prescriptions Online (2026) | Telehealth · Medical education How to Safely Get Prescriptions Online (2026) Learning how to safely get prescr | Clinician-informed | 42 | 1713 | see §8 / §9 |
| `/blog/index` | blog | rewritten | partly | Health insights for a full workweek | Health insights for a full workweek Weight, energy, sleep, hormones, and focus — from licensed clinicians in C | none | 40 | 914 | see §8 / §9 |
| `/blog/is-online-adhd-diagnosis-legit` | blog | rewritten | no | Is Online ADHD Diagnosis Legit? What Patients Should Know | ADHD Resources Is Online ADHD Diagnosis Legit? | Clinician-informed | 44 | 952 | see §8 / §9 |
| `/blog/medical-weight-loss-glp1-semaglutide-texas` | blog | rewritten | no | Medical Weight Loss in Texas: GLP-1, Semaglutide, Tirzepatide & What Actually Works | Weight loss · Medical education Medical Weight Loss in Texas: GLP-1, Semaglutide, Tirzepatide & What Actually  | Clinician-informed | 48 | 1187 | see §8 / §9 |
| `/blog/sildenafil-for-erectile-dysfunction-what-to-expect` | blog | rewritten | no | Sildenafil for Erectile Dysfunction: What to Expect (2026) | Telehealth · Medical education Sildenafil for Erectile Dysfunction: What to Expect (2026) Sildenafil is a PDE5 | Clinician-informed | 16 | 619 | see §8 / §9 |
| `/blog/telehealth` | blog | rewritten | no | Telehealth articles | Blog home ADHD Weight loss Telehealth Telehealth articles How legitimate online care works—safe prescribing, v | none | 8 | 197 | see §8 / §9 |
| `/blog/telehealth-prescriptions-how-online-treatment-works` | blog | rewritten | no | Telehealth Prescriptions: How Online Treatment Works (2026) | Telehealth · Medical education Telehealth Prescriptions: How Online Treatment Works (2026) Understanding teleh | Clinician-informed | 10 | 568 | see §8 / §9 |
| `/blog/weight-loss` | blog | rewritten | no | Weight loss articles | Blog home ADHD Weight loss Telehealth Weight loss articles Evidence-based guides on medical weight loss and GL | none | 2 | 291 | see §8 / §9 |
| `/book-appointment` | other | same | no | Choose How You Want to Get Started | Choose How You Want to Get Started Start with a free Meet & Greet if you want help choosing the right path—or  | none | 4 | 202 | see §8 / §9 |
| `/brain-fog` | other | rewritten | partly | Brain fog: when thinking feels slower than usual | Primary Care · Symptom guide Brain fog: when thinking feels slower than usual Words take longer to find. | none | 52 | 1446 | see §8 / §9 |
| `/creyos-adhd-testing` | care | rewritten | no | Creyos ADHD Testing (Included in Your Evaluation) | Main ADHD pathway: ADHD Care is our main ADHD care page for evaluation, screening, and treatment planning. | none | 20 | 408 | see §8 / §9 |
| `/employers` | employer | same | yes | Integrated care for busy professionals | For employers & benefits teams Integrated care for busy professionals Your people are not failing. | none | 24 | 985 | see §8 / §9 |
| `/fatigue` | other | rewritten | no | Fatigue: when tired stops being normal | Primary Care · Symptom guide Fatigue: when tired stops being normal You sleep, and it does not help. | none | 38 | 1517 | see §8 / §9 |
| `/guides/exhausted` | guide | rewritten | partly | Exhausted, with no explanation | Health guide Exhausted, with no explanation You've had eight hours in bed, your day wasn't even that brutal, a | Clinician-informed | 52 | 1648 | see §8 / §9 |
| `/guides/fatigue-tracking` | guide | new | no | How to track fatigue before a doctor visit | Health guide How to track fatigue before a doctor visit You’re sitting in the exam room and the only sentence  | Clinician-informed | 12 | 278 | see §8 / §9 |
| `/guides/hormonal-health` | guide | rewritten | no | Hormonal health | Health guide Hormonal health Hormonal questions usually fall into one of two tracks. | none | 6 | 104 | see §8 / §9 |
| `/guides/mental-health-and-adhd` | guide | rewritten | no | Mental health and ADHD | Health guide Mental health and ADHD You've reread the same email three times and still can't start the reply. | Clinician-informed | 48 | 1461 | see §8 / §9 |
| `/guides/perimenopause` | guide | new | no | Perimenopause and menopause | Health guide Perimenopause and menopause Your cycles aren't what they were. | Physician reviewed | 24 | 780 | see §8 / §9 |
| `/guides/sleep` | guide | rewritten | no | Sleep disorders may not be as common as you think | Health guide Sleep disorders may not be as common as you think You've just flipped from nights to mornings. | Physician reviewed | 32 | 1430 | see §8 / §9 |
| `/guides/testosterone` | guide | new | no | Men’s hormonal health: testosterone | Health guide Men’s hormonal health: testosterone You're tired for no clear reason. | Physician reviewed | 38 | 1130 | see §8 / §9 |
| `/guides/weight` | guide | rewritten | no | Weight that will not move | Health guide Weight that will not move You've been careful with food for months. | Clinician-informed | 44 | 1480 | see §8 / §9 |
| `/headache` | other | rewritten | no | Headaches that get in the way of work | Primary Care · Symptom guide Headaches that get in the way of work A recurring headache that wrecks a meeting, | none | 0 | 914 | see §8 / §9 |
| `/homepage2-audit` | other | same | no | Homepage2 live audit proof | Homepage2 audit proof · Siya Health Homepage2 live audit proof Public artifacts for / — not local paths. | none | 4 | 80 | see §8 / §9 |
| `/homepage2-care-preview` | other | same | no |  | Explore our care model One continuous loop — from what you’re noticing to a plan your care team actually follo | none | 14 | 159 | see §8 / §9 |
| `/intake/index` | other | same | no | Secure intake & booking | Secure intake & booking Review and accept our policies before continuing to schedule your visit. | none | 0 | 154 | see §8 / §9 |
| `/join-our-team` | other | same | yes | Practice with concierge support | For licensed clinicians Practice with concierge support Siya Health is building physician-led telehealth for w | Clinician-informed | 12 | 217 | see §8 / §9 |
| `/labs` | labs | same | no | Labs & Blood Tests with Transparent Direct-Pay Options | Labs & Blood Tests with Transparent Direct-Pay Options Access commonly ordered laboratory testing with clear s | none | 56 | 2018 | see §8 / §9 |
| `/labs/a1c-blood-sugar` | labs | rewritten | no | Hemoglobin A1c (HbA1c) | Preventive Care · Labs · Marker guide Hemoglobin A1c (HbA1c) Hemoglobin A1c reflects average blood sugar over  | none | 18 | 485 | see §8 / §9 |
| `/labs/cbc` | labs | same | no | Complete Blood Count (CBC) | Preventive Care · Labs · Marker guide Complete Blood Count (CBC) A complete blood count looks at cells that ci | none | 16 | 514 | see §8 / §9 |
| `/labs/cmp` | labs | rewritten | no | Comprehensive Metabolic Panel (CMP) | Preventive Care · Labs · Marker guide Comprehensive Metabolic Panel (CMP) A comprehensive metabolic panel grou | none | 16 | 498 | see §8 / §9 |
| `/labs/how-to-read-results` | labs | rewritten | no | How to Read Your Lab Results | Labs & Blood Tests · Guide How to Read Your Lab Results Got your results? | none | 14 | 434 | see §8 / §9 |
| `/labs/iron-ferritin` | labs | rewritten | no | Ferritin & Iron Studies | Preventive Care · Labs · Marker guide Ferritin & Iron Studies Ferritin reflects iron stores. | none | 14 | 472 | see §8 / §9 |
| `/labs/lipid-panel` | labs | rewritten | no | Lipid Panel | Preventive Care · Labs · Marker guide Lipid Panel A lipid panel looks at cholesterol and related markers used  | none | 16 | 518 | see §8 / §9 |
| `/labs/thyroid` | labs | same | no | TSH (Thyroid Stimulating Hormone) | Preventive Care · Labs · Marker guide TSH (Thyroid Stimulating Hormone) TSH is a common first thyroid marker. | none | 16 | 473 | see §8 / §9 |
| `/labs/vitamin-b12` | labs | same | no | Vitamin B12 | Preventive Care · Labs · Marker guide Vitamin B12 Vitamin B12 testing looks at a nutrient that supports blood  | none | 14 | 468 | see §8 / §9 |
| `/labs/vitamin-d` | labs | same | no | Vitamin D (25-OH) | Preventive Care · Labs · Marker guide Vitamin D (25-OH) 25-hydroxy vitamin D is the usual blood marker for vit | none | 18 | 494 | see §8 / §9 |
| `/legal/controlled-substance-treatment-agreement/index` | legal | same | no | Controlled Substance Treatment Agreement | Policies / Controlled Substance Treatment Agreement Controlled Substance Treatment Agreement Effective: Octobe | none | 2 | 862 | see §8 / §9 |
| `/legal/cookie-policy/index` | legal | same | no | Cookie Policy | Policies / Cookie Policy Cookie Policy Effective: October 31, 2025 Privacy Policy Overview This Cookie Policy  | none | 8 | 469 | see §8 / §9 |
| `/legal/index` | legal | same | no | Legal & Compliance | Legal & Compliance Policies governing use of siya.health and Siya Healthcare, PLLC telehealth services. | none | 10 | 10316 | see §8 / §9 |
| `/legal/notice-of-privacy-practices/index` | legal | same | no | Notice of Privacy Practices | Policies / Notice of Privacy Practices Notice of Privacy Practices Effective: October 31, 2025 Privacy Policy  | none | 0 | 1556 | see §8 / §9 |
| `/legal/privacy-policy/index` | legal | same | no | Privacy Policy | Policies / Privacy Policy Privacy Policy Effective: October 31, 2025 Notice of Privacy Practices Terms of Use  | none | 0 | 2913 | see §8 / §9 |
| `/legal/terms-of-use/index` | legal | same | no | Terms of Use | Policies / Terms of Use Terms of Use Effective: October 31, 2025 Privacy Policy Notice of Privacy Practices En | none | 0 | 4667 | see §8 / §9 |
| `/mens-health-longevity` | other | rewritten | partly | When energy, drive, and focus don’t feel like they used to | When energy, drive, and focus don’t feel like they used to Physician-led men’s health—not testosterone-first m | none | 38 | 664 | see §8 / §9 |
| `/prescriptions` | other | same | no | Online Prescription Services | Online Prescription Services Provider-reviewed prescriptions may be available through Siya Health telehealth w | none | 4 | 401 | see §8 / §9 |
| `/preventive-care` | other | rewritten | no | Preventive care: stay healthy before something goes wrong | Primary Care · Service guide Preventive care: stay healthy before something goes wrong Most people wait for a  | none | 38 | 1155 | see §8 / §9 |
| `/preview-home-a` | other | same | partly | Clear answers when focus, energy, or weight won't add up. | Clear answers when focus, energy, or weight won't add up. | none | 40 | 1109 | see §8 / §9 |
| `/preview-home-b` | other | same | partly | Clear answers when focus, energy, or weight won't add up. | Clear answers when focus, energy, or weight won't add up. | none | 40 | 1109 | see §8 / §9 |
| `/preview-home-b-btn-v1` | other | same | partly | Clear answers when focus, energy, or weight won't add up. | Clear answers when focus, energy, or weight won't add up. | none | 40 | 1109 | see §8 / §9 |
| `/preview-home-b-btn-v2` | other | same | partly | Clear answers when focus, energy, or weight won't add up. | Clear answers when focus, energy, or weight won't add up. | none | 40 | 1109 | see §8 / §9 |
| `/preview-home-hero-video` | other | same | partly | Clear answers when brain fog focus won’t add up. | Preview only — production homepage unchanged Clear answers when brain fog focus won’t add up. | none | 46 | 1109 | see §8 / §9 |
| `/previews/homepage-variant-a/index` | other | same | partly | Clear answers when focus, energy, or weight won't add up. | Clear answers when focus, energy, or weight won't add up. | none | 40 | 1109 | see §8 / §9 |
| `/previews/homepage-variant-b/cta-button-compare` | other | same | no | Variant B — primary CTA button only | CTA button comparison — Variant B Variant B — primary CTA button only Side-by-side comparison of the filled “B | none | 8 | 114 | see §8 / §9 |
| `/previews/homepage-variant-b/index` | other | same | partly | Clear answers when focus, energy, or weight won't add up. | Clear answers when focus, energy, or weight won't add up. | none | 40 | 1109 | see §8 / §9 |
| `/previews/homepage2-audit` | other | same | no | Homepage2 live audit proof | Homepage2 audit proof · Siya Health Homepage2 live audit proof Public artifacts for / — not local paths. | none | 4 | 80 | see §8 / §9 |
| `/pricing` | other | same | no | Transparent pricing for physician-led care | Transparent pricing for physician-led care $149 for the evaluation. | none | 24 | 661 | see §8 / §9 |
| `/primary-care` | care | rewritten | no | Primary care: where ongoing health starts | Root of care · Physician-led telehealth Primary care: where ongoing health starts You do not have to know the  | none | 38 | 864 | see §8 / §9 |
| `/primary-urgent-care` | care | same | no | Primary & Urgent Care — Virtual, Same-Week | Primary & Urgent Care — Virtual, Same-Week Licensed clinicians. | none | 20 | 448 | see §8 / §9 |
| `/providers/dr-natasha-desai` | provider | rewritten | no | Dr. Natasha Desai, MD | Natasha Desai, MD Family Medicine Physician Accepting new patients 4.93★ · 67 Klarity reviews Based on post-vi | none | 58 | 757 | see §8 / §9 |
| `/providers/dr-sneh-pandey` | provider | same | partly | Dr. Sneh Pandey, MD | Sneh Pandey, MD Medical Director Accepting new patients 4.72★ · 299 Klarity reviews Based on post-visit patien | none | 62 | 905 | see §8 / §9 |
| `/providers/dr-swati-pandey` | provider | rewritten | no | Dr. Swati Pandey, MD | Swati Pandey, MD Internal Medicine Physician Accepting new patients 4.93★ · 139 Klarity reviews Based on post- | none | 48 | 865 | see §8 / §9 |
| `/providers/dr-vanessa-urbina` | provider | same | no | Dr. Vanessa Urbina, MD | Vanessa Urbina, MD Family Medicine Physician Accepting new patients Not enough reviews yet Florida adults who  | none | 40 | 679 | see §8 / §9 |
| `/providers/index` | provider | same | no | Our Care Team | Our Care Team Physicians and advanced practice clinicians supporting structured evaluation for working adults— | none | 10 | 521 | see §8 / §9 |
| `/providers/megan-wunderlich` | provider | same | no | Megan Wunderlich, FNP-C | Megan Wunderlich, FNP-C Family Nurse Practitioner Accepting new patients Not enough reviews yet Practice under | none | 46 | 642 | see §8 / §9 |
| `/providers/wendy-delgado` | provider | rewritten | no | Wendy Delgado, PA-C | Wendy Delgado, PA-C Physician Associate Accepting new patients 4.83★ · 58 Klarity reviews Based on post-visit  | none | 38 | 642 | see §8 / §9 |
| `/redirect/adhd-evaluation/index` | care | same | no | Starting your ADHD evaluation | Starting your ADHD evaluation You are leaving Siya Health to begin the adult ADHD evaluation booking flow, inc | none | 0 | 40 | see §8 / §9 |
| `/redirect/adhd-walkthrough/index` | care | same | no | Booking your free Meet & Greet | Booking your free Meet & Greet You are leaving Siya Health to schedule a short, free call to understand your n | none | 0 | 68 | see §8 / §9 |
| `/redirect/chat/index` | other | same | no | Connecting you to secure medical chat | Connecting you to secure medical chat You are leaving Siya Health to message our care team securely in Spruce. | none | 0 | 49 | see §8 / §9 |
| `/redirect/meet-greet/index` | other | same | no | Booking your free Meet & Greet | Booking your free Meet & Greet You are leaving Siya Health to schedule a short, free call to understand your n | none | 0 | 68 | see §8 / §9 |
| `/siya-circle` | other | same | partly | Join Siya Circle | Join Siya Circle Siya Circle is the short note from Siya Health: focus, energy, weight, and everyday care. | none | 4 | 164 | see §8 / §9 |
| `/siya-intro-animation` | other | same | no |  | Siya intro | none | 0 | 2 | see §8 / §9 |
| `/social` | other | rewritten | no | Follow Siya Health | Follow Siya Health Facebook, Instagram, YouTube, and LinkedIn. | none | 10 | 234 | see §8 / §9 |
| `/telehealth` | care | same | yes | A doctor visit that fits a workday | A doctor visit that fits a workday Primary care, refills, forms, and follow-up by secure video for busy profes | none | 0 | 241 | see §8 / §9 |
| `/video-cards` | other | same | no |  | Siya Health — video cards (internal) Internal video title cards (noindex, unlinked). | none | 6 | 185 | see §8 / §9 |
| `/weight-loss-metabolic-health` | care | rewritten | partly | When your appetite, energy, and weight stop making sense | When your appetite, energy, and weight stop making sense Physician-led metabolic health and weight management— | none | 50 | 1159 | see §8 / §9 |
| `/womens-health` | care | rewritten | partly | When energy, cycles, and mood stop making sense together | When energy, cycles, and mood stop making sense together Physician-led women’s health—PCOS, perimenopause, thy | none | 40 | 774 | see §8 / §9 |
| `/womens-midlife-health` | care | rewritten | partly | Women’s Midlife Health: Brain, Hormones & Metabolism | Knowledge Hub · Women’s Midlife Health Women’s Midlife Health: Brain, Hormones & Metabolism Most women do not  | none | 90 | 1793 | see §8 / §9 |

Registry vs label: `CLINICAL_REVIEW_APPROVED.pages` lists only sleep, testosterone, perimenopause (`content-review-registry.mjs:39-58`). `blogs` and `answers` are empty objects. **EVIDENCE.** A visible “Physician reviewed” string on any other page would be a mismatch; the scan’s physician-reviewed hits should be checked against those three slugs in §5.

## 3. Consolidation and rewrite

**EVIDENCE:** HTML files on main but not on this branch: 90. Redirect objects in pillars `vercel.json`: 201. Sources whose first hop is another redirect (chain): 13. Loops found by one-hop check: 0. The 13 “no local HTML” hits are those intermediate hops (the retired page was deleted, so the first destination is another redirect, not a file). They are not final 404s. Final hops in the examples below are guide URLs that exist as files.

Chain examples:
- /blog/after-adhd-diagnosis-next-steps-adults -> /answers/starting-adhd-medication-adults -> /guides/mental-health-and-adhd#mh-work
- /answers/phentermine-weight-loss-safety -> /blog/phentermine-for-weight-loss-safety-and-effectiveness -> /guides/weight#wt-opener
- /answers/oral-vs-injectable-weight-loss-meds -> /blog/oral-vs-injectable-weight-loss-medications -> /guides/weight#wt-glp1
- /answers/non-stimulant-adhd-medications -> /blog/non-stimulant-adhd-medications-explained -> /guides/mental-health-and-adhd#mh-screen
- /answers/tirzepatide-vs-semaglutide -> /blog/tirzepatide-vs-semaglutide-which-is-better -> /guides/weight#wt-glp1
- /answers/minoxidil-hair-loss-does-it-work -> /blog/minoxidil-for-hair-loss-does-it-work -> /guides/testosterone#te-opener
- /blog/combining-adhd-treatment-and-weight-loss-strategies -> /answers/adhd-and-weight-loss-connection -> /guides/weight#wt-opener
- /blog/focalin-vs-adderall-comparison -> /blog/vyvanse-vs-adderall-differences -> /guides/mental-health-and-adhd#mh-screen

Missing-destination examples:
- /blog/after-adhd-diagnosis-next-steps-adults -> /answers/starting-adhd-medication-adults
- /answers/phentermine-weight-loss-safety -> /blog/phentermine-for-weight-loss-safety-and-effectiveness
- /answers/oral-vs-injectable-weight-loss-meds -> /blog/oral-vs-injectable-weight-loss-medications
- /answers/non-stimulant-adhd-medications -> /blog/non-stimulant-adhd-medications-explained
- /answers/tirzepatide-vs-semaglutide -> /blog/tirzepatide-vs-semaglutide-which-is-better
- /answers/minoxidil-hair-loss-does-it-work -> /blog/minoxidil-for-hair-loss-does-it-work
- /blog/combining-adhd-treatment-and-weight-loss-strategies -> /answers/adhd-and-weight-loss-connection
- /blog/focalin-vs-adderall-comparison -> /blog/vyvanse-vs-adderall-differences

**Live spot checks (curl):** `/blog/adderall-for-adhd-how-it-works` 200 (still live). `/blog/brain-fog-at-work` 200 (still live). `/blog/food-noise-and-glp-1-what-it-means-and-what-helps` 308 to `/guides/weight#wt-food-noise` (this redirect is already on main `vercel.json` around the food-noise source). `/guides/testosterone` 404. `/guides/perimenopause` 404. `/guides/fatigue-tracking` 404. `/guides/sleep` 200. `/guides/hormonal-health` 200 with live H1 “Hormonal health” and body length 20125, matching the long main file, not the short pillars file.

Triage plan counts (**EVIDENCE** `docs/PERSONA-TRIAGE-PLAN-2026-10-04.md` as previously read: 120 considered, KEEP 30, MERGE 68, RETIRE 22, MERGE+RETIRE executed as 90). This audit did not re-count the plan’s labels line by line against every deleted file. **INFERENCE:** the 90 files present only on main are the retirement set plus any path the file walker treats differently.

Sitemap lists `/answers/index`, `/blog/index`, and `/previews/...` (`sitemap.xml` lines 80, 164, 360+). Files are `answers/index.html` and `blog/index.html`, which also resolve as `/answers` and `/blog`. **INFERENCE:** `/answers/index` is a duplicate loc, not a missing file. Preview URLs in the sitemap are a real mismatch if those pages should be noindex.

### 30 KEEP pages

Word count is visible text inside `<main>` (nav chrome excluded). Citation count is `<sup>digits` plus `[n]` in that text. None of these slugs are in `CLINICAL_REVIEW_APPROVED.blogs` or `.answers`.

| URL | Words | Citation markers | Review label | Stale strings in file |
|---|---|---|---|---|
| `/blog/sildenafil-for-erectile-dysfunction-what-to-expect` | 619 | 0 | Clinician-informed | none of the checked strings |
| `/blog/adhd-accommodations-hr-primer` | 641 | 0 | Clinician-informed | none of the checked strings |
| `/blog/adhd-evaluation-california-online-vs-in-person` | 554 | 0 | Clinician-informed | none of the checked strings |
| `/blog/adhd-evaluation-cost-texas` | 676 | 0 | Clinician-informed | none of the checked strings |
| `/blog/adhd-testing-online-california-screening-vs-evaluation` | 467 | 0 | Clinician-informed | none of the checked strings |
| `/blog/adult-adhd-symptoms-california` | 926 | 0 | Clinician-informed | none of the checked strings |
| `/blog/cognitive-health-benefits-for-employers` | 594 | 0 | Clinician-informed | none of the checked strings |
| `/blog/focus-fatigue-workforce-issue` | 590 | 0 | Clinician-informed | none of the checked strings |
| `/blog/how-adhd-medication-is-prescribed-online` | 642 | 0 | Clinician-informed | none of the checked strings |
| `/blog/how-to-choose-adhd-provider-california` | 619 | 0 | Clinician-informed | none of the checked strings |
| `/blog/how-to-safely-get-prescriptions-online` | 1713 | 0 | Clinician-informed | none of the checked strings |
| `/blog/is-online-adhd-diagnosis-legit` | 952 | 0 | Clinician-informed | none of the checked strings |
| `/blog/medical-weight-loss-glp1-semaglutide-texas` | 1187 | 0 | Clinician-informed | none of the checked strings |
| `/blog/telehealth-prescriptions-how-online-treatment-works` | 568 | 0 | Clinician-informed | none of the checked strings |
| `/answers/can-adhd-be-diagnosed-online` | 837 | 0 | Clinician-informed | none of the checked strings |
| `/answers/can-you-get-adhd-medication-online` | 486 | 0 | Clinician-informed | none of the checked strings |
| `/answers/ed-telehealth-legitimate` | 432 | 0 | Clinician-informed | none of the checked strings |
| `/answers/fsa-hsa-adhd-evaluation` | 538 | 0 | Clinician-informed | none of the checked strings |
| `/answers/how-long-adhd-evaluation` | 495 | 0 | Clinician-informed | none of the checked strings |
| `/answers/how-much-does-adhd-testing-cost` | 510 | 0 | Clinician-informed | none of the checked strings |
| `/answers/how-online-prescriptions-work` | 807 | 0 | Clinician-informed | none of the checked strings |
| `/answers/is-online-adhd-diagnosis-legitimate` | 941 | 0 | Clinician-informed | none of the checked strings |
| `/answers/is-telehealth-legitimate` | 799 | 0 | Clinician-informed | none of the checked strings |
| `/answers/meet-and-greet-telehealth-expectations` | 827 | 0 | Clinician-informed | none of the checked strings |
| `/answers/telehealth-adhd-california` | 566 | 0 | Clinician-informed | none of the checked strings |
| `/answers/telehealth-adhd-texas` | 491 | 0 | Clinician-informed | none of the checked strings |
| `/answers/what-happens-after-adhd-evaluation` | 696 | 0 | Clinician-informed | none of the checked strings |
| `/answers/what-included-199-adhd-evaluation` | 550 | 0 | Clinician-informed | none of the checked strings |
| `/answers/what-to-do-after-lab-results` | 1202 | 0 | Clinician-informed | none of the checked strings |
| `/answers/which-preventive-blood-tests-adults` | 1331 | 0 | Clinician-informed | none of the checked strings |

### Guides

| Guide | Words in main | Citation markers | Visible review | Last commit touching file | numstat vs main |
|---|---|---|---|---|---|
| `weight` | 1480 | 14 | Clinician-informed | 6dcbd716 WIP: weight guide template pass pending founder approval. | 103	20	apps/siya-health/guides/weight.html |
|  | H1: ['Weight that will not move'] |
| `mental-health-and-adhd` | 1461 | 15 | Clinician-informed | dc2f7fe4 Scene-first opener for the mental health and ADHD guide. | 104	25	apps/siya-health/guides/mental-health-and-adhd.html |
|  | H1: ['Mental health and ADHD'] |
| `exhausted` | 1648 | 18 | Clinician-informed | ab4854b0 Scene-first opener for exhausted; extract fatigue tracking to its own guide. | 128	27	apps/siya-health/guides/exhausted.html |
|  | H1: ['Exhausted, with no explanation'] |
| `sleep` | 1430 | 14 | Physician reviewed | a2e43de3 Scene-first opener for the sleep guide. | 8	6	apps/siya-health/guides/sleep.html |
|  | H1: ['Sleep disorders may not be as common as you think'] |
| `testosterone` | 1130 | 16 | Physician reviewed | 55c4d239 Scene-first opener for the testosterone guide. | 214	0	apps/siya-health/guides/testosterone.html |
|  | H1: ['Men’s hormonal health: testosterone'] |
| `perimenopause` | 780 | 7 | Physician reviewed | 03df3419 Scene-first opener for the perimenopause guide. | 194	0	apps/siya-health/guides/perimenopause.html |
|  | H1: ['Perimenopause and menopause'] |
| `hormonal-health` | 104 | 0 | none | 3535964b Remove ED/sildenafil section from testosterone guide; keep sildenafil blog standalone. | 12	41	apps/siya-health/guides/hormonal-health.html |
|  | H1: ['Hormonal health'] |
| `fatigue-tracking` | 278 | 0 | Clinician-informed | ab4854b0 Scene-first opener for exhausted; extract fatigue tracking to its own guide. | 177	0	apps/siya-health/guides/fatigue-tracking.html |
|  | H1: ['How to track fatigue before a doctor visit'] |

**Passes (INFERENCE from diff size + registry, not a reread of every paragraph):** sleep is a small diff (already on main, physician-reviewed in the registry). testosterone and perimenopause are new files and are in the registry. weight, exhausted, and mental-health-and-adhd are large diffs and are not in the registry. hormonal-health is shortened on this branch. fatigue-tracking is new and not in the registry. mental-health-and-adhd.html is **uncommitted** on top of the branch tip.

Scene-first / go-deeper: `guides/weight.html` has `<h2 id="wt-deeper">` at line 225; `guides/exhausted.html` line 240; `guides/mental-health-and-adhd.html` line 226. Perimenopause line 162 links to sleep and mental-health mid-article (“see the sleep guide”), which is a mid-article pointer, not only an end list.

## 4. Positioning

Quotes are from pillars files unless noted live. Live curl H1s matched pillars for `/`, `/adhd-care`, `/guides/sleep`, `/guides/weight`, `/guides/exhausted`, `/guides/mental-health-and-adhd`, `/blog`, `/answers`, `/employers`, `/pricing`. Live `/guides/hormonal-health` is the long main page.

| Surface | H1 (pillars) | Position flag |
|---|---|---|
| `/` | Welcome to an integrated care experience for busy professionals | yes |
| `/about` | Busy professionals weren’t failing. The healthcare system was. | yes |
| `/adhd-care` | Adult ADHD care for working professionals | partly |
| `/employers` | Integrated care for busy professionals | yes |
| `/labs` | Labs & Blood Tests with Transparent Direct-Pay Options | no |
| `/pricing` | Transparent pricing for physician-led care | no |
| `/telehealth` | A doctor visit that fits a workday | yes |
| `/weight-loss-metabolic-health` | When your appetite, energy, and weight stop making sense | partly |
| `/womens-health` | When energy, cycles, and mood stop making sense together | partly |

**Homepage (EVIDENCE `index.html:252-257`):** H1 “Welcome to an integrated care experience for busy professionals”. Primary CTA “Explore our care model” (`index.html:257`). Rotating kicker “Care that covers” starts on “Primary Care” (`index.html:263-264`). Proof line “2,700+” / “patients treated” / “many of them busy professionals” (`index.html:282-285`).

**ADHD still leads:** `/adhd-care` H1 is “Adult ADHD care for working professionals” (live and pillars). The noun ADHD is first; “working professionals” is the audience. City and diagnosis URLs (`/adhd-care/miami`, `/adhd-diagnosis-texas`, many `/blog` and `/answers` KEEP pages) are ADHD-query pages by URL. **INFERENCE:** ADHD does not lead the homepage H1; it still leads the ADHD care H1 and the majority of KEEP articles, which are ADHD-intent URLs from the triage KEEP list.

**Working-professional language:** homepage H1, employers H1 “Integrated care for busy professionals” (`employers.html:147`), about H1 as previously read “Busy professionals weren’t failing…”, telehealth and weight/women’s problem-first H1s in the matrix.

**Hubs:** `/blog` H1 “Health insights for a full workweek”. `/answers` H1 “Health Guides”. **INFERENCE:** the answers hub title is a topic label (“Guides”), not a problem list. This audit did not count cards per topic versus per problem inside the hub HTML beyond the H1. Feedback “describe problems rather than topics” is **PARTLY** true of `/answers` and not of the blog H1.

**Labs** H1 is product language: “Labs & Blood Tests with Transparent Direct-Pay Options” (`labs.html` hero). **Providers** H1 is “Our Care Team” (`providers/index.html:124`). Neither labs nor providers states the busy-professional problem in the H1.

**Contradictions:** Patient pages in this public-HTML scan did not contain “within 30 minutes” or “24/7” (see §5). “6 AM to 10 PM” was previously found on the employers demo prototype, which is a different line. `$149` and `$199` both appear (filename `what-included-199-adhd-evaluation` plus `$149` on pricing). Hormonal-health live vs pillars is two different documents at one URL.

## 5. Claims register

Status key: **UNVERIFIED** means the number or credential is on the page and this audit found no source document that proves it. **CONFLICTS** means it disagrees with the standards in the brief. **SOURCED** means a cited paper or a registry entry, not a marketing count.

| Claim | Pages (count) | Status |
|---|---|---|
| `2,700` | 20 files. e.g. /primary-urgent-care.html, /index.html, /adhd-evaluation-texas.html, /about.html | UNVERIFIED |
| `2700+` | 1 files. e.g. /employers/demo.html | UNVERIFIED |
| `6 AM to 10 PM` | 1 files. e.g. /employers/demo.html | CONFLICTS — understates the stated standard (24/7; messages within 30 minutes; doctor within 2 hours). |
| `within 1 hour` | 1 files. e.g. /employers/demo.html | CONFLICTS — understates the stated standard (24/7; messages within 30 minutes; doctor within 2 hours). |
| `within 30 minutes` | 0 files. e.g.  | CONFLICTS WITH CURRENT STANDARDS if on a patient page — compliance has not approved the new 24/7 copy. Also understates if an older window is shown instead of 24/7. |
| `24/7` | 0 files. e.g.  | CONFLICTS WITH CURRENT STANDARDS if on a patient page — compliance has not approved the new 24/7 copy. Also understates if an older window is shown instead of 24/7. |
| `24x7` | 0 files. e.g.  | CONFLICTS WITH CURRENT STANDARDS if on a patient page — compliance has not approved the new 24/7 copy. Also understates if an older window is shown instead of 24/7. |
| `$149` | 30 files. e.g. /primary-urgent-care.html, /index.html, /adhd-diagnosis-texas.html, /adhd-evaluation-texas.html | UNVERIFIED |
| `$199` | 0 files. e.g.  | UNVERIFIED |
| `board-certified` | 11 files. e.g. /adhd-diagnosis-texas.html, /preview-home-a.html, /preview-home-b-btn-v2.html, /preview-home-b-btn-v1.html | UNVERIFIED |
| `Board-certified` | 7 files. e.g. /index.html, /about.html, /weight-loss-metabolic-health.html, /mens-health-longevity.html | UNVERIFIED |
| `Physician reviewed` | 3 files. e.g. /guides/perimenopause.html, /guides/sleep.html, /guides/testosterone.html | SOURCED only where the slug is in CLINICAL_REVIEW_APPROVED; otherwise the visible label is ahead of the registry. |
| `HIPAA` | 33 files. e.g. /primary-urgent-care.html, /adhd-diagnosis-texas.html, /adhd-evaluation-texas.html, /about.html | UNVERIFIED |
| `free` | 66 files. e.g. /primary-urgent-care.html, /primary-care.html, /index.html, /adhd-diagnosis-texas.html | UNVERIFIED |

**Contrast math (EVIDENCE, not a screenshot):** `--text-muted` is `#78716c` (`styles.css` near line 41). On white that is 4.80:1 (clears 4.5:1). On cream `#F4EFE7` it is 4.19:1 (fails 4.5:1 for normal text). `.section p.lead` uses `var(--text-muted)` (`styles.css:1606-1609`). White `#fff` on cream `#F4EFE7` (`h2-surface.css:38-40`) = 1.14:1 (fails). Navy `#0A246B` on that cream = 12.42:1 (passes). `.hero-state-line` is `rgba(255,255,255,.95)` (`styles.css:1180-1184`). On `body.siya-h2-surface`, `h2-surface.css:1280-1287` sets `.hero-merged-content p` to `#0A246B !important`. Weight page body has `siya-h2-surface` (`weight-loss-metabolic-health.html:39`) and the state line is a `p` inside `.hero-merged-content` (`weight-loss-metabolic-health.html` hero). **INFERENCE:** the state line computes to navy, not white, on that page. **COULD NOT VERIFY** in a browser.

**24/7 copy:** zero public HTML hits for `within 30 minutes`, `24/7`, and `24x7` in the scan that skipped `internal/` and `previews/`. **EVIDENCE** of absence in that file set. Patient pages are not yet using the new 24/7 sentence. They also do not state the new standard, so they understate it wherever an older window remains. The only stale-hours hit called out earlier was the employers demo prototype, which is not this branch’s patient site.

## 6. Objective quality scan

**Not run as a rendered pass.** No local static server and no browser were used. Contrast above is from declared CSS. External link HTTP statuses were not crawled. The live checks in §3 are curl status codes only.

**Heading issues (HTML source, pillars):** no H1: ['/homepage2-care-preview', '/siya-intro-animation', '/video-cards'] (count 3). Two or more H1s: [('/adhd-screening', 2)] (count 1).

**Meta:** missing `<title>`: [] (count 0). Missing meta description: ['/adhd-care', '/homepage2-audit', '/homepage2-care-preview', '/previews/homepage2-audit', '/redirect/adhd-evaluation/index', '/redirect/adhd-walkthrough/index', '/redirect/chat/index', '/redirect/meet-greet/index'] (count 11). Canonical path != sitemap loc: [('/answers/index', 'https://siya.health/answers'), ('/blog/index', 'https://siya.health/blog'), ('/intake/index', 'https://siya.health/intake'), ('/legal/controlled-substance-treatment-agreement/index', 'https://siya.health/legal/controlled-substance-treatment-agreement'), ('/legal/cookie-policy/index', 'https://siya.health/legal/cookie-policy'), ('/legal/index', 'https://siya.health/legal'), ('/legal/notice-of-privacy-practices/index', 'https://siya.health/legal/notice-of-privacy-practices'), ('/legal/privacy-policy/index', 'https://siya.health/legal/privacy-policy')] (count 17).

**Em-dash, visible text in `<main>`, descending:**

| Em | URL |
|---|---|
| 90 | `/womens-midlife-health` |
| 62 | `/providers/dr-sneh-pandey` |
| 58 | `/providers/dr-natasha-desai` |
| 58 | `/adult-adhd-california` |
| 56 | `/labs` |
| 52 | `/guides/exhausted` |
| 52 | `/brain-fog` |
| 50 | `/weight-loss-metabolic-health` |
| 48 | `/providers/dr-swati-pandey` |
| 48 | `/guides/mental-health-and-adhd` |
| 48 | `/blog/medical-weight-loss-glp1-semaglutide-texas` |
| 46 | `/providers/megan-wunderlich` |
| 46 | `/preview-home-hero-video` |
| 44 | `/guides/weight` |
| 44 | `/blog/is-online-adhd-diagnosis-legit` |
| 44 | `/blog/adult-adhd-symptoms-california` |
| 42 | `/blog/how-to-safely-get-prescriptions-online` |
| 42 | `/answers/which-preventive-blood-tests-adults` |
| 42 | `/` |
| 40 | `/womens-health` |
| 40 | `/providers/dr-vanessa-urbina` |
| 40 | `/previews/homepage-variant-b/index` |
| 40 | `/previews/homepage-variant-a/index` |
| 40 | `/preview-home-b-btn-v2` |
| 40 | `/preview-home-b-btn-v1` |

**Guides over 1,300 words (main-element word count):**
- `/guides/exhausted` 1648
- `/guides/mental-health-and-adhd` 1461
- `/guides/sleep` 1430
- `/guides/weight` 1480

**Tracking:** `booking_confirmation` count in pillars HTML/JS: 0. In main HTML/JS: 0. **EVIDENCE** both counts. Diff stat of `apps/siya-health/scripts` vs main is included below if non-empty.

```
 .../scripts/apply-cannibalization-phase1.mjs       | 48 ++++++++++++++----
 apps/siya-health/scripts/apply-ed-hub-inbound.mjs  |  4 +-
 .../scripts/apply-women-adhd-hub-inbound.mjs       |  4 +-
 .../scripts/blog-engagement-components.mjs         |  2 +-
 .../scripts/california-adhd-blog-rest.mjs          | 18 +++----
 .../scripts/cannibalization-phase1-final.mjs       | 57 ++++++++++++++++------
 apps/siya-health/scripts/clinical-entity.mjs       | 46 +++++++++++++++++
 .../scripts/generate-brain-fog-entity-page.mjs     |  8 +--
 .../scripts/generate-fatigue-entity-page.mjs       | 12 ++---
 apps/siya-health/scripts/generate-labs-pages.mjs   |  2 +-
 .../generate-preventive-care-entity-page.mjs       |  2 +-
 .../scripts/generate-primary-care-entity-page.mjs  |  2 +-
 .../scripts/generate-workplace-blog-posts.mjs      |  6 +--
 apps/siya-health/scripts/seo-build.mjs             |  9 ++++
 .../scripts/seo-deployment-qa-report.mjs           |  7 ++-
 apps/siya-health/scripts/site-chrome.mjs           | 12 ++---
 .../scripts/supporting-cluster-batch1-data.mjs     |  2 +-
 apps/siya-health/scripts/validate-cta-links.mjs    |  8 ++-
 18 files changed, 184 insertions(+), 65 deletions(-)

```

**INFERENCE:** event name `booking_confirmation` is unchanged because it is absent on both sides. A full GTM container diff was not done.

## 7. Feedback triage

**The 34-row sheet with reviewer names was not in the message this audit received.** No older sheet was attached either. Rows were not invented. Named items from the brief:

| Item | Verdict | Evidence | Class |
|---|---|---|---|
| Pricing “is medication included” | VERIFIED as copy, not as a clinical rule | `pricing.html` FAQ: “Medication cost varies by medication and is decided by you and your clinician as part of your personalized plan.” (line ~255). Hero: “$149 for the evaluation. Then $149 a month for ongoing care.” (line ~152). The sentence does not say “included” or “not included” in those words. | needs positioning one-liner |
| CarePatron staff name | NOT REPRODUCED in code | Booking URLs are `https://book.carepatron.com/Siya-Health?p=…&i=…` (`redirect/meet-greet/index.html`). No person’s name is in that URL. **INFERENCE:** a name on the booking page is CarePatron settings, not a string in this repo. The live booking page was not opened. | no action in repo until the booking page is checked |
| Labs message length | PARTLY | Labs hero lead is one sentence (`labs.html` hero): “Access commonly ordered laboratory testing with clear self-pay options…” H1 is still a product title. Length of a specific “message” was not defined without the sheet. | needs positioning one-liner |
| Blog hub structure | PARTLY | Blog H1 “Health insights for a full workweek”. Answers H1 “Health Guides” (topic word). | template-level rule |
| Weight “food noise” | VERIFIED present | `guides/weight.html:180` `<h2 id="wt-food-noise">Food noise</h2>` and opener paragraph line 135. Live food-noise blog 308s to this anchor. | already on pillars and already redirected on production |
| Weight “wallpaper” | NOT REPRODUCED as a new background | No “wallpaper” or “header image only” string in `docs/TICKET-reading-friendly-mode.md` or `docs/GUIDE-PAGE-TEMPLATE.md` (search). The ticket asks to pause decorative motion and use a fixed-contrast background (`TICKET-reading-friendly-mode.md:12-16`). A full-bleed wallpaper would fight that. The brief’s “header image only” phrase is not in those docs. | conflicts with a locked decision or ticket |
| Employers hero and section order | VERIFIED hero; order not graded | `employers.html:146-160`: kicker “For employers & benefits teams”, H1 “Integrated care for busy professionals”, CTA “Request employer information”, then section “What we kept seeing”. | needs positioning one-liner if the sheet wanted a different order |
| Siya Circle “why join” | NOT REPRODUCED as a why-join section | `siya-circle.html:124-125` H1 “Join Siya Circle”. Lead: “Siya Circle is the short note from Siya Health: focus, energy, weight, and everyday care. You choose which of those you want to receive.” “Why join Siya” exists on `join-our-team.html` (careers), not as a Circle heading. | needs positioning one-liner |

## 8. Merge readiness

| Check | Result |
|---|---|
| Validators / build | **Not run.** `npm run build` executes generators that rewrite HTML (`package.json` build script starts with `retire-pages.mjs`). `validate:links` calls `fs.writeFileSync` (`scripts/validate-cta-links.mjs:141`). Running them would edit the tree, which this task forbids. |
| Conflicts with main | `git merge-tree --name-only main HEAD` returned a tree id and no file list. **INFERENCE:** a clean textual merge. |
| Tier 0 | Commits `951d587a` and `5cbb5810` are not in this branch. Merge-tree of HEAD with `5cbb5810` returned a tree id only. Overlapping paths vs main: screening HTML, creyos HTML, `site-chrome.mjs`. **Merging pillars to main without those two commits drops Tier 0.** |
| Unreviewed pages that would go live | weight, exhausted, mental-health-and-adhd (including uncommitted edits), fatigue-tracking, shortened hormonal-health. Registry covers sleep, testosterone, perimenopause only. |
| 90 retirements | File compare shows 90 HTML files on main missing here. Redirects added in the vercel.json diff (261 lines in the earlier diffstat). Live adderall and brain-fog posts still 200. |
| Sitemap `7b4383d7` | Tip of this branch. `git rev-list --left-right --count origin/guides/pillars...HEAD` = 0 / 1. **Not pushed.** |
| Dirty | `.gitignore`, `guides/mental-health-and-adhd.html`, untracked `POST-CLEANUP-HUMAN-REVIEW.md`, `docs/BACKLOG-2026-10-09.md`. This audit file is a fifth untracked path once written. |
| Pause | `data/CONTENT-GENERATION-PAUSE.json` paused true. Not changed. |

### Go / no-go

- [ ] No. Do not merge to main.
- [ ] Tier 0 merged first, or merged in the same release without dropping `951d587a` / `5cbb5810`.
- [ ] `mental-health-and-adhd.html` either committed on purpose or reverted. Do not leave it dirty.
- [ ] `7b4383d7` pushed only when you say so. It is not on origin now.
- [ ] Physician review for guides not in the registry, or those guides held back.
- [ ] Redirect destinations checked for 404 after a preview, not before.
- [ ] Content pause still true. No generator run.
- [ ] Explicit deploy go, from a clean repo-root worktree, one attempt, staged then promote.

## 9. Recommended sequence (7 working days)

1. You: write the positioning one-liner (who it is for, problem, ADHD not leading). Blocked on you. No copy edits until that sentence exists.
2. You: confirm or kill the blocked facts — Florida clinic relationship, public price, 2,700+ patients, after-hours stats. Do not publish new numbers.
3. Sneha / compliance: approve or reject patient-facing 24/7, 30-minute message, and 2-hour doctor wording. Until then, do not add it, and do not leave “6 AM to 10 PM” / “within 1 hour” on any page that still has them.
4. Cursor, read-only until you say otherwise: merge Tier 0 into `guides/pillars` on a clean tree so screening and contrast fixes are not lost. No deploy.
5. Decide the uncommitted mental-health guide: keep the dirty diff or restore the committed file. Physician review before it is public.
6. Hold the 90 retirements and the hormonal split for a preview only after you give a go. One staged deploy, then a separate promote. Deploy from a clean repo-root worktree. Content pause stays on. No new pages.
7. After preview: check redirect destinations, the weight state line in a browser, and the CarePatron booking page for a staff name (settings, not this repo).

**Cut:** weight-page wallpaper; new generated articles; employer price; folding the reading-friendly ticket into the content merge; merging `release/2026-10-09` or the demo branch into main.

## COULD NOT VERIFY

- The 34-row feedback sheet and any older sheet. Reviewer names were not available.
- Vercel deployment id `dpl_AUmPNzerNeXpLLQ9QAnry3oMwELw` and the rollback deployment id.
- Rendered contrast, alt text, and heading order in a browser (source-level H1 counts are in §6).
- External links returning non-200.
- Full redirect graph for loops beyond one hop, and whether every retired URL has a 301 whose destination is 200.
- CarePatron’s displayed staff name (page not opened).
- Whether `git merge-tree` without conflict files guarantees a clean `git merge` once dirty files and the unpushed commit are included.
- GTM container event list beyond the string `booking_confirmation`.
- Line-by-line KEEP/MERGE/RETIRE recount against `PERSONA-TRIAGE-PLAN-2026-10-04.md` (counts used as documented, deletions counted as files).

Stop. No follow-up edits.
