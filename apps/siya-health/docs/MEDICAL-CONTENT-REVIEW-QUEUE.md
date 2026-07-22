# Medical Content Review Queue — Siya Health

**Audit date:** 2026-07-19 · **Scope:** `apps/siya-health` — 59 blog articles + 4 blog hubs (`blog/*.html`), 57 health guides + 1 hub (`answers/*.html`), generator scripts, and governance data files. Audit only; no files modified.

---

## Summary

| Governance level | Count | Definition |
|---|---:|---|
| **Full governance** | **0 / 116** | Named reviewer with credentials + completed sign-off + schema `reviewedBy` + visible pub/updated dates + cited sources |
| **Partial governance** | **73 / 116** | Some elements present (reviewer attribution without sign-off, and/or a references/evidence section) |
| **Minimal / none** | **43 / 116** | Schema dates + generic disclaimer only; no reviewer, no citations |

Breakdown of the 73 partial pages:

- **10 blogs** (9 city/state ADHD treatment pages + `pots-and-adhd`) have the strongest pattern in the repo: a visible EEAT block naming **Dr. Sneh Pandey, MD — Internal Medicine · ABOM**, a visible "Last updated" date, and a numbered References section. However each explicitly states **"Status: Clinician-informed; formal physician sign-off pending"**, and none emit schema `reviewedBy`.
- **6 more blogs** (`adhd-in-women`, `adhd-brain-imaging-subtypes`, `executive-dysfunction-adhd`, `iron-deficiency-brain-fog-adhd`, `adhd-and-binge-eating`, `food-noise-and-glp-1…`) have visible References sections (citing DSM-5-TR, CDC, peer-reviewed studies) but no reviewer block.
- **All 57 health guides** have an "Evidence & references" section, but items are **plain-text source names with zero hyperlinks** (0 pages link to pubmed/nih.gov/fda.gov/doi.org), and none has a reviewer or a publication date.

Key sitewide facts:

1. **No page anywhere contains "Written by", "Reviewed by", or "Medically reviewed" text, and no page has schema `reviewedBy`.** Ten blogs use the label "Medical reviewer:" instead.
2. **Blog schema:** all 59 articles have `BlogPosting` JSON-LD with `datePublished` + `dateModified`, but `author` is always `{"@type":"Organization","name":"Siya Health"}` — never a credentialed Person. Only 5 blogs also emit `MedicalWebPage`.
3. **Guide schema:** all 57 guides emit `FAQPage` + `MedicalWebPage`, but with **no `datePublished`, no `author`**, and a `dateModified` of `2026-05-19` on every single guide — this is the hard-coded `LAST_REVIEWED` constant in `scripts/clinical-entity.mjs`, not a per-page review date.
4. **Visible dates:** only the 10 EEAT blogs show a human-readable date on the page. The other 49 blogs and all 57 guides carry dates in JSON-LD only (invisible to readers).
5. **This is an intentional interim state.** `data/content-review-registry.mjs` implements a sign-off gate (`reviewerSlug` + `reviewDate` + `signOffSource` + `reviewerConsent`), and `docs/REVIEWED-CONTENT-ROLLBACK-REPORT.md` (2026-06-05) documents that a previous wave of 16 `reviewedBy` URLs was **rolled back** because reviewer consent/sign-off documentation was missing. The allowlist is currently **empty**, so every page renders the fallback "Clinician-informed" aside.

---

## Governance pattern findings

### What the templates provide

**Health-guide generator (`scripts/generate-answer-pages.mjs` + `data/answer-seeds.mjs`):**

- Emits per page: `FAQPage`, `MedicalWebPage` (publisher = MedicalOrganization), `BreadcrumbList`; an "Educational only" disclaimer; a `clinicalReviewBlock()`; an "Evidence & references" `<ul>` from the seed's `evidence: []` array; ~34 guides also get an "Evidence snapshot" card grading evidence strength (e.g. "hypothesis-generating").
- The machinery for full governance **already exists but never fires**: if a slug were in `CLINICAL_REVIEW_APPROVED.answers` with complete sign-off, the page would render "Physician reviewed / Reviewed by: [name] / Review date: [date]" and emit schema `reviewedBy` (`generate-answer-pages.mjs` lines 463–472, `clinical-entity.mjs` lines 104–119). Because the registry is empty, all 57 guides render the "Clinician-informed" fallback.
- Seed `evidence` entries are titles only ("STEP trial appetite-related outcomes", "NIMH: ADHD in adults overview") — the seed format has **no field for URLs, publication years, or access dates**.

### What's missing

| Gap | Impact |
|---|---|
| Empty review allowlist (`CLINICAL_REVIEW_APPROVED = {pages:{}, blogs:{}, answers:{}}`) | 0 pages carry a completed medical review despite YMYL medication content |
| Organization-only authorship | No E-E-A-T author signal; no Person with credentials in any schema |
| No `datePublished` on guides; `dateModified` is a build constant | Readers and crawlers can't tell content age; "2026-05-19" on all 57 guides is misleading |
| Evidence lists are unlinked text | Citations unverifiable; 0 outbound links to PubMed/NIH/FDA sitewide (except 1 blog) |
| 43 blogs have no references section at all — including nearly all P1 medication articles (`sildenafil…`, `phentermine…`, `tirzepatide-vs-semaglutide…`, `vyvanse-vs-adderall…`, `adderall-for-adhd…`) | Highest-risk content has the weakest sourcing |
| 23 guides lack the evidence snapshot card (per `data/health-guide-evidence-audit.json`, run 2026-07-15, 0 thin rows flagged) | Inconsistent evidence presentation |
| `docs/REVIEW-QUEUE.csv` (121 rows) is stale: all rows "Pending physician review", assigned to placeholder "Reviewer A–E", and it lists ≥3 URLs that no longer exist (`adderall-ir-vs-xr-adults`, `adhd-evaluation-cost-california`, `adhd-medication-online-texas-telehealth`) | Existing queue can't be executed as-is |
| Reviewer routing exists (`REVIEWER_OWNERSHIP`: metabolic → derek-timbs, adhdMedication → dr-swati-pandey, etc.) but is unused by any published page | Ownership defined, sign-off never captured |

### What "full governance" should mean here (per the repo's own gate)

Per-URL: `reviewerSlug` + `reviewDate` + `signOffSource` document + `reviewerConsent === true` → emits visible "Physician reviewed" block + schema `reviewedBy`. The queue below is ordered so compliance can fill that allowlist highest-risk-first.

---

## Review queue

Legend — **Source age** reflects JSON-LD dates (visible on-page only for the 10 EEAT blogs). "Unlinked evidence list" = named sources, no URLs. All dates below are as found; where absent, marked **missing**.

### P1 — Medication / dosing content (38 pages) — review first

| Page | Reason for review | Claims needing validation | Source age | Priority |
|---|---|---|---|---|
| `blog/adderall-for-adhd-how-it-works` | No reviewer, no references; stimulant (Schedule II) mechanism content | Mechanism, onset/duration, side-effect and safety framing | Pub 2026-03-15, mod 2026-05-19; **no sources cited** | P1 |
| `blog/vyvanse-vs-adderall-differences` | No reviewer, no references; comparative stimulant content | Pharmacokinetic comparison, duration claims, misuse-potential framing | Pub 2026-03-15, mod 2026-05-19; **no sources cited** | P1 |
| `blog/non-stimulant-adhd-medications-explained` | No reviewer, no references | Atomoxetine/guanfacine/clonidine efficacy and onset claims | Pub 2026-03-15, mod 2026-05-19; **no sources cited** | P1 |
| `blog/adhd-medication-options-for-adults` | No reviewer, no references; medication catalog | Class comparisons, first-line framing | Pub 2026-03-15, mod 2026-05-19; **no sources cited** | P1 |
| `blog/adhd-medication-options-california` | No reviewer, no references | Same as above + CA telehealth prescribing rules | Pub 2026-05-08, mod 2026-05-19; **no sources cited** | P1 |
| `blog/adhd-medication-side-effects-what-to-expect` | No reviewer, no references; safety content | Side-effect frequencies, "when to call a doctor" thresholds | Pub 2026-03-15, mod 2026-05-19; **no sources cited** | P1 |
| `blog/adhd-medication-daily-or-as-needed-adults` | No reviewer, no references; dosing-pattern advice | Daily vs PRN stimulant use — clinically contested territory | Pub 2026-04-08, mod 2026-05-19; **no sources cited** | P1 |
| `blog/is-adhd-medication-safe-long-term` | No reviewer, no references; long-term safety claims | Cardiovascular risk, tolerance, long-term outcome data | Pub 2026-03-15, mod 2026-05-19; **no sources cited** | P1 |
| `blog/how-adhd-medication-is-prescribed-online` | No reviewer, no references; controlled-substance telehealth prescribing | DEA/Ryan Haight flexibility status (time-sensitive regulatory claims) | Pub 2026-03-15, mod 2026-06-02; **no sources cited** | P1 |
| `blog/adhd-medication-online-california` | No reviewer, no references | CA controlled-substance telehealth rules | Pub 2026-05-04, mod 2026-05-19; **no sources cited** | P1 |
| `blog/semaglutide-for-weight-loss-how-it-works` | No reviewer, no references; GLP-1 mechanism/dosing | STEP trial results, Wegovy vs Ozempic dosing distinction, contraindications (MTC/MEN2) | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `blog/tirzepatide-vs-semaglutide-which-is-better` | No reviewer, no references; head-to-head efficacy claims | SURMOUNT vs STEP comparison, superiority framing | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `blog/glp1-side-effects-and-how-to-manage-them` | No reviewer, no references; side-effect management advice | GI management guidance, pancreatitis/gallbladder warnings | Pub 2026-03-16, mod 2026-06-02; **no sources cited** | P1 |
| `blog/compounded-vs-branded-glp1-medications` | No reviewer, no references; compounding legality/safety | FDA compounding status claims (highly time-sensitive), safety comparison | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `blog/oral-vs-injectable-weight-loss-medications` | No reviewer, no references | Efficacy comparison across formulations | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `blog/phentermine-for-weight-loss-safety-and-effectiveness` | No reviewer, no references; controlled stimulant anorectic | Duration-of-use limits, CV contraindications, efficacy data | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `blog/medical-weight-loss-glp1-semaglutide-texas` | No reviewer, no references; GLP-1 + state-specific access | Eligibility criteria (BMI thresholds), TX prescribing claims | Pub 2026-01-10, mod 2026-05-19; **no sources cited**; oldest P1 pub date | P1 |
| `blog/food-noise-and-glp-1-what-it-means-and-what-helps` | Has References but no reviewer block | "Food noise" mechanism claims vs hypothesis-generating evidence | Pub 2026-06-03, mod 2026-06-02; references unlinked | P1 |
| `blog/sildenafil-for-erectile-dysfunction-what-to-expect` | No reviewer, no references; PDE5 inhibitor content | Nitrate interaction warning, onset/duration, online-pharmacy safety claims | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `blog/when-is-testosterone-therapy-appropriate` | No reviewer, no references; TRT eligibility | Diagnostic thresholds, indications, risk framing (CV, fertility) | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `blog/minoxidil-for-hair-loss-does-it-work` | No reviewer, no references | Efficacy percentages, oral off-label use | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `blog/oral-vs-topical-minoxidil-which-is-right` | No reviewer, no references; off-label oral dosing comparison | Oral low-dose minoxidil safety (off-label), shedding-phase claims | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P1 |
| `answers/adderall-vs-vyvanse-adults` | No reviewer, no pub date; unlinked evidence list | Comparative stimulant claims | Pub **missing**; mod 2026-05-19 (site-wide constant) | P1 |
| `answers/adhd-medication-every-day` | No reviewer, no pub date; unlinked evidence | Daily vs as-needed stimulant guidance | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/adhd-medication-side-effects` | No reviewer, no pub date; on prior wave's review shortlist, never signed off | Side-effect ranges, escalation thresholds | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/starting-adhd-medication-adults` | No reviewer, no pub date; titration expectations | First-weeks titration and monitoring claims | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/is-adhd-medication-safe-long-term` | No reviewer, no pub date | Long-term stimulant safety claims | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/can-you-get-adhd-medication-online` | No reviewer, no pub date; controlled-substance telehealth rules | Regulatory accuracy (time-sensitive) | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/semaglutide-weight-loss-how-it-works` | No reviewer, no pub date; very long FAQ answer (~1,000 words in schema) with dosing/contraindication content | STEP claims, MTC/MEN2 contraindications, Ozempic/Wegovy distinction | Pub **missing**; mod 2026-05-19 (constant); evidence cites "2024–2025 reviews" unlinked | P1 |
| `answers/glp-1-side-effects` | No reviewer, no pub date | Side-effect management, urgent-care triggers | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/glp-1-nausea-management` | No reviewer, no pub date; **no evidence snapshot card** | Anti-nausea self-management advice | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/compounded-vs-branded-glp-1` | No reviewer, no pub date; compounding legality | FDA compounding/shortage status (time-sensitive) | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/who-qualifies-glp-1-weight-loss` | No reviewer, no pub date; eligibility criteria | BMI/comorbidity thresholds | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/weight-gain-after-stopping-ozempic` | No reviewer, no pub date | Discontinuation/regain claims (STEP extension data) | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/food-noise-returned-on-glp-1` | No reviewer, no pub date | Dose-gap appetite-return claims | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/when-is-testosterone-therapy-appropriate` | No reviewer, no pub date | TRT indications and thresholds | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/trt-monitoring-requirements` | No reviewer, no pub date; lab-monitoring protocol content | Monitoring intervals, hematocrit/PSA thresholds | Pub **missing**; mod 2026-05-19 (constant) | P1 |
| `answers/oral-vs-topical-minoxidil` | No reviewer, no pub date; off-label oral dosing | Oral minoxidil safety claims | Pub **missing**; mod 2026-05-19 (constant) | P1 |

### P2 — Clinical explainers (46 pages)

| Page | Reason for review | Claims needing validation | Source age | Priority |
|---|---|---|---|---|
| `blog/adhd-in-women` | Has References + MedicalWebPage + the only NIH/PubMed links sitewide; no reviewer | Sex-difference prevalence and presentation claims | Pub/mod 2026-07-17; references partially linked | P2 |
| `blog/adhd-brain-imaging-subtypes` | Has References + MedicalWebPage; no reviewer; neuroimaging claims are easy to overstate | Imaging-subtype claims vs research maturity | Pub/mod 2026-07-17; references unlinked | P2 |
| `blog/executive-dysfunction-adhd` | Has References + MedicalWebPage; no reviewer | Executive-function model claims | Pub/mod 2026-07-17; references unlinked | P2 |
| `blog/iron-deficiency-brain-fog-adhd` | Has References + MedicalWebPage; no reviewer; supplement-adjacent | Ferritin threshold claims, iron–ADHD causality framing | Pub/mod 2026-07-17; references unlinked | P2 |
| `blog/adhd-and-binge-eating` | Has References; no reviewer; comorbidity + medication adjacency (Vyvanse/BED) | ADHD–BED prevalence and treatment claims | Pub/mod 2026-07-16; references unlinked | P2 |
| `blog/pots-and-adhd` | Best-governed clinical blog: EEAT block (Dr. Sneh Pandey, MD), Last updated, 8 references — but sign-off pending, no schema reviewedBy | POTS–ADHD overlap claims, stimulant–POTS interaction cautions | Pub/mod 2026-07-17; visible "Last updated"; refs incl. 2009–2023 studies | P2 |
| `blog/adhd-symptoms-overlooked` | No reviewer, no references | Symptom-presentation claims | Pub 2026-01-10, mod 2026-05-19; **no sources cited** | P2 |
| `blog/how-to-know-if-you-have-adhd-adult` | No reviewer, no references | Diagnostic-criteria descriptions | Pub 2026-01-10, mod 2026-05-19; **no sources cited** | P2 |
| `blog/adult-adhd-symptoms-california` | No reviewer, no references | Symptom claims + CA framing | Pub 2026-05-09, mod 2026-05-19; **no sources cited** | P2 |
| `blog/adult-adhd-treatment-california-2026` | No reviewer, no references; treatment overview | Treatment-pathway claims | Pub 2026-05-03, mod 2026-05-19; **no sources cited** | P2 |
| `blog/insulin-resistance-and-weight-loss-clinician-overview` | No reviewer, no references; positioned as "clinician overview" without named clinician | IR mechanism and lab-interpretation claims | Pub 2026-06-02, mod 2026-05-19 (mod predates pub — inconsistent); **no sources cited** | P2 |
| `blog/how-mental-health-affects-weight-loss-outcomes` | No reviewer, no references | Psych–metabolic interaction claims | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P2 |
| `blog/medical-weight-loss-vs-dieting-what-actually-works` | No reviewer, no references; "what actually works" efficacy framing | Program vs diet outcome claims | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P2 |
| `blog/free-testosterone-vs-total-testosterone-what-patients-should-know` | No reviewer, no references; lab interpretation | Free-T calculation and SHBG claims | Pub 2026-06-03, mod 2026-05-19 (inconsistent); **no sources cited** | P2 |
| `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign` | No reviewer, no references; cardiometabolic risk claims | OSA risk claims, screening thresholds | Pub/mod 2026-06-04; **no sources cited** | P2 |
| `blog/insomnia-treatment-options-beyond-medication` | No reviewer, no references | CBT-I and sleep-hygiene efficacy claims | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P2 |
| `blog/why-am-i-always-tired-causes-when-to-see-doctor` | No reviewer, no references; differential-diagnosis content | Fatigue red-flag thresholds | Pub 2026-06-03, mod 2026-05-19 (inconsistent); **no sources cited** | P2 |
| `blog/how-to-safely-get-prescriptions-online` | No reviewer, no references; prescription-safety guidance | Pharmacy verification claims (LegitScript/NABP) | Pub 2026-03-16, mod 2026-05-19; **no sources cited** | P2 |
| `blog/telehealth-prescriptions-how-online-treatment-works` | No reviewer, no references; on prior wave's shortlist | Telehealth prescribing process claims | Pub 2026-03-16, mod 2026-06-02; **no sources cited** | P2 |
| `answers/signs-of-adult-adhd` | No reviewer, no pub date; unlinked evidence (DSM-5-TR, NIMH, CHADD) | Symptom-criteria claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/adhd-in-women` | No reviewer, no pub date | Presentation-difference claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/adhd-vs-anxiety` | No reviewer, no pub date | Differential-diagnosis claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/adhd-vs-burnout` | No reviewer, no pub date | Burnout vs ADHD distinction claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/can-adhd-cause-anxiety` | No reviewer, no pub date | Comorbidity causality framing | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/high-functioning-adhd` | No reviewer, no pub date; **no evidence snapshot card** | Non-DSM label used clinically | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/late-adhd-diagnosis-adults` | No reviewer, no pub date; **no evidence card** | Late-diagnosis prevalence claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/executive-dysfunction-adhd` | No reviewer, no pub date; **no evidence card** | EF-deficit claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/rejection-sensitivity-adhd` | No reviewer, no pub date; **no evidence card**; RSD is not a validated diagnosis | RSD framing vs evidence base | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/time-blindness-adhd` | No reviewer, no pub date; **no evidence card** | Time-perception claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/adhd-and-weight-loss-connection` | No reviewer, no pub date; **no evidence card** | ADHD–obesity association claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/testosterone-and-adhd-overlap` | No reviewer, no pub date; **no evidence card**; thin evidence area | Hormone–attention overlap claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/poor-sleep-feels-like-adhd` | No reviewer, no pub date | Sleep-deprivation mimic claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/asrs-adhd-screening-explained` | No reviewer, no pub date; **no evidence card** | ASRS validity/limits claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/what-is-insulin-resistance` | No reviewer, no pub date | IR mechanism claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/insulin-resistance-without-diabetes` | No reviewer, no pub date; **no evidence card** | Pre-diabetic IR claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/normal-a1c-insulin-resistance` | No reviewer, no pub date | "Normal A1C but IR" lab-interpretation claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/brain-fog-after-eating` | No reviewer, no pub date | Postprandial-symptom mechanism claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/what-is-food-noise` | No reviewer, no pub date; evidence explicitly "hypothesis-generating" | Food-noise construct claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/medical-weight-loss-vs-dieting` | No reviewer, no pub date; **no evidence card** | Program-efficacy claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/what-is-free-testosterone` | No reviewer, no pub date; **no evidence card** | Free-T measurement claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/high-shbg-low-free-testosterone` | No reviewer, no pub date; cites "PubMed literature" without links | SHBG–age–thyroid claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/what-does-low-testosterone-feel-like` | No reviewer, no pub date | Symptom-attribution claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/can-sleep-apnea-cause-fatigue` | No reviewer, no pub date | OSA–fatigue claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/signs-of-sleep-apnea-in-adults` | No reviewer, no pub date | OSA symptom/screening claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/why-am-i-tired-even-after-sleeping` | No reviewer, no pub date | Fatigue differential claims | Pub **missing**; mod 2026-05-19 (constant) | P2 |
| `answers/why-normal-labs-dont-mean-healthy` | No reviewer, no pub date; cites "PubMed reviews" without links; contrarian lab framing | "Normal labs ≠ healthy" claims need careful clinical framing | Pub **missing**; mod 2026-05-19 (constant) | P2 |

### P3 — Local, process, cost, and lifestyle content (32 pages)

| Page | Reason for review | Claims needing validation | Source age | Priority |
|---|---|---|---|---|
| `blog/adhd-treatment-texas` | EEAT block (named reviewer, credentials) + References, but sign-off pending; no schema reviewedBy | State telehealth-prescribing claims | Pub/mod 2026-07-16; visible "Last updated: July 16, 2026" | P3 |
| `blog/adhd-treatment-austin-tx` | Same pattern (EEAT + refs, sign-off pending) | Local access/pricing claims | Pub/mod 2026-07-16; visible date | P3 |
| `blog/adhd-treatment-dallas-tx` | Same | Same | Pub/mod 2026-07-16; visible date | P3 |
| `blog/adhd-treatment-fort-worth-tx` | Same | Same | Pub/mod 2026-07-16; visible date | P3 |
| `blog/adhd-treatment-houston-tx` | Same | Same | Pub/mod 2026-07-16; visible date | P3 |
| `blog/adhd-treatment-san-antonio-tx` | Same | Same | Pub/mod 2026-07-16; visible date | P3 |
| `blog/adhd-treatment-miami-fl` | Same | FL telehealth rules | Pub/mod 2026-07-16; visible date | P3 |
| `blog/adhd-treatment-orlando-fl` | Same | Same | Pub/mod 2026-07-16; visible date | P3 |
| `blog/adhd-treatment-philadelphia-pa` | Same | PA telehealth rules | Pub/mod 2026-07-16; visible date | P3 |
| `blog/adhd-evaluation-cost-texas` | No reviewer, no references; pricing claims | $199 evaluation and competitor-cost claims | Pub 2026-01-10, mod 2026-06-02; **no sources cited** | P3 |
| `blog/adhd-evaluation-california-online-vs-in-person` | No reviewer, no references | Evaluation-process comparison claims | Pub 2026-05-02, mod 2026-05-19; **no sources cited** | P3 |
| `blog/adhd-testing-online-california-screening-vs-evaluation` | No reviewer, no references | Screening vs evaluation distinction | Pub 2026-05-05, mod 2026-05-19; **no sources cited** | P3 |
| `blog/adhd-telehealth-california` | No reviewer, no references | CA telehealth claims | Pub 2026-05-07, mod 2026-05-19; **no sources cited** | P3 |
| `blog/how-to-choose-adhd-provider-california` | No reviewer, no references | Provider-selection criteria | Pub 2026-05-10, mod 2026-05-19; **no sources cited** | P3 |
| `blog/is-online-adhd-diagnosis-legit` | No reviewer, no references; legitimacy claims | Online-diagnosis validity claims | Pub 2026-01-10, mod 2026-05-19; **no sources cited** | P3 |
| `blog/online-adhd-diagnosis-california` | No reviewer, no references | Same + CA specifics | Pub 2026-05-01, mod 2026-05-19; **no sources cited** | P3 |
| `blog/online-adhd-diagnosis-texas` | No reviewer, no references | Same + TX specifics | Pub 2026-01-10, mod 2026-06-02; **no sources cited** | P3 |
| `blog/youre-not-lazy-signs-undiagnosed-adult-adhd` | No reviewer, no references; on prior wave's shortlist | Awareness-content symptom claims | Pub 2026-04-07, mod 2026-06-02; **no sources cited** | P3 |
| `answers/telehealth-adhd-california` | No reviewer, no pub date; **no evidence card**; prior shortlist | CA telehealth claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/telehealth-adhd-texas` | No reviewer, no pub date; **no evidence card** | TX telehealth claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/can-adhd-be-diagnosed-online` | No reviewer, no pub date; **no evidence card** | Online-diagnosis validity claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/is-online-adhd-diagnosis-legitimate` | No reviewer, no pub date; **no evidence card** | Same | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/is-telehealth-legitimate` | No reviewer, no pub date; prior shortlist | Telehealth-legitimacy claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/ed-telehealth-legitimate` | No reviewer, no pub date; ED med adjacency | Online ED-prescribing safety claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/how-online-prescriptions-work` | No reviewer, no pub date | Prescribing-process claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/screening-vs-adhd-evaluation` | No reviewer, no pub date; **no evidence card**; prior shortlist | Screening/evaluation distinction | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/how-long-adhd-evaluation` | No reviewer, no pub date; **no evidence card** | Duration claims (60–90 min) | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/how-much-does-adhd-testing-cost` | No reviewer, no pub date; **no evidence card**; $199 and competitor-price claims in FAQ schema | Pricing claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/what-included-199-adhd-evaluation` | No reviewer, no pub date; **no evidence card**; prior shortlist | Service-inclusion claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/fsa-hsa-adhd-evaluation` | No reviewer, no pub date | FSA/HSA eligibility claims (tax rules) | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/meet-and-greet-telehealth-expectations` | No reviewer, no pub date; **no evidence card** | Process claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |
| `answers/afternoon-energy-crash-after-lunch` | No reviewer, no pub date; lifestyle content | Postprandial-dip claims | Pub **missing**; mod 2026-05-19 (constant) | P3 |

**Hubs (no article-level governance by design, per `docs/REVIEW-STATUS-CONSISTENCY-REPORT.md`):** `blog/index`, `blog/adhd`, `blog/telehealth`, `blog/weight-loss`, `answers/index` — no reviewer blocks, no dates, no references. Acceptable for index pages; excluded from the queue.

---

## Recommended sequence

1. **P1 sign-offs first (38 pages):** route via `REVIEWER_OWNERSHIP` (adhdMedication → dr-swati-pandey; metabolic/GLP-1 and mensHealth → derek-timbs; adhdEval → dr-sneh-pandey) and populate `CLINICAL_REVIEW_APPROVED` with real `signOffSource` + `reviewerConsent` — the templates will then emit `reviewedBy` and visible review blocks automatically.
2. **Add references to the 22 P1 blogs with zero citations** — every high-risk medication article except `food-noise-and-glp-1` currently cites nothing.
3. **Fix guide dating:** replace the site-wide `LAST_REVIEWED = '2026-05-19'` constant with per-page `datePublished`/`dateModified`, and add a URL field to the seed `evidence` format so citations become verifiable links.
4. **Retire or regenerate `docs/REVIEW-QUEUE.csv`** (placeholder reviewers A–E; ≥3 dead URLs).
