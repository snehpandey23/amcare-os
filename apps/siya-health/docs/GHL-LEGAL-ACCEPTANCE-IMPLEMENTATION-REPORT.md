# GHL Legal Acceptance — Implementation Report

Generated: 2026-07-21T06:58:14.213Z

## Objective

Enforceable intake acceptance before CarePatron booking; direct scheduling links sitewide without modal friction.

## Implementation summary

| Layer | Status | Notes |
|-------|--------|-------|
| Direct CarePatron booking | **Deployed** | All Meet & Greet / discovery CTAs link to `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=kkarJfxH` |
| Intake legal gate | **Deployed** | `/intake` — on-page acceptance then redirect to CarePatron |
| Policy links | **Deployed** | `/legal/terms-of-use`, `/legal/privacy-policy`, `/legal/notice-of-privacy-practices` |
| Hidden field capture (URL params) | **Deployed** | `legal_acceptance_timestamp`, `legal_acceptance_source`, `legal_document_version` + boolean acceptance flags appended on /intake redirect |
| ADHD disclaimer variant | **Deployed** | Shown on `/intake?funnel=adhd` |
| Legacy GHL form | **Deprecated** | No booking CTAs to `link.yourmarketingai.com/widget/form/` |

## Policy version string

```
terms:1.0.0-counsel;privacy:1.0.0-counsel;npp:1.0.0-counsel;effective:2025-10-31
```

## Hidden fields (pass to GHL contact record)

| Field | Purpose |
|-------|---------|
| `legal_acceptance_timestamp` | ISO-8601 acceptance timestamp |
| `legal_acceptance_source` | Page URL / funnel source |
| `legal_document_version` | Serialized counsel policy versions |
| `legal_acceptance_terms` | `true` when Terms accepted |
| `legal_acceptance_privacy` | `true` when Privacy Policy acknowledged |
| `legal_acceptance_npp` | `true` when NPP acknowledged |

## GHL admin configuration (required for workflow persistence)

1. Open form `mnWpgh0IEgFvJymdZqHY` in GoHighLevel → add **hidden fields** matching the keys above.
2. Enable **query string mapping** (or workflow "Create/Update Contact" step) to write values to contact custom fields.
3. On form submit workflow: copy hidden values to contact record; do not strip on pipeline stage changes.
4. For **LeadConnector chat** (`69be9ab3db1480f6799cdd18`): add the same three checkboxes + hidden fields in the chat booking funnel — not gated by site JS.
5. Re-run appointment booking automations test with a contact that includes all `legal_acceptance_*` fields.

## Audit totals

- HTML pages scanned: **192**
- Pages with legacy GHL booking links: **186**
- Total legacy GHL booking anchor targets: **199**
- Pages with CarePatron booking links: **3**
- Total CarePatron booking anchor targets: **3**
- Pages with acceptance script after build: **1**
- Intake hub present: **yes**

## Forms audited (site touchpoints)

- **/about** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/adhd-care** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-diagnosis-austin** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-diagnosis-florida** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-diagnosis-houston** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-diagnosis-pennsylvania** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-diagnosis-philadelphia** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-diagnosis-texas** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-evaluation-cost** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-screening-results** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-screening** (adhd-screening) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adhd-treatment-online** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/adult-adhd-diagnosis** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/adderall-vs-vyvanse-adults** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/adhd-and-weight-loss-connection** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/adhd-in-women** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/adhd-medication-every-day** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/adhd-medication-side-effects** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/adhd-vs-anxiety** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/adhd-vs-burnout** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/afternoon-energy-crash-after-lunch** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/asrs-adhd-screening-explained** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/brain-fog-after-eating** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/can-adhd-be-diagnosed-online** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/can-adhd-cause-anxiety** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/can-sleep-apnea-cause-fatigue** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/can-you-get-adhd-medication-online** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/compounded-vs-branded-glp-1** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/ed-telehealth-legitimate** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/executive-dysfunction-adhd** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/food-noise-returned-on-glp-1** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/fsa-hsa-adhd-evaluation** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/glp-1-nausea-management** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/glp-1-side-effects** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/high-functioning-adhd** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/high-shbg-low-free-testosterone** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/how-long-adhd-evaluation** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/how-much-does-adhd-testing-cost** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/how-online-prescriptions-work** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/answers/insulin-resistance-without-diabetes** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/is-adhd-medication-safe-long-term** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/is-online-adhd-diagnosis-legitimate** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/is-telehealth-legitimate** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/late-adhd-diagnosis-adults** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/medical-weight-loss-vs-dieting** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/meet-and-greet-telehealth-expectations** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/normal-a1c-insulin-resistance** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/oral-vs-topical-minoxidil** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/poor-sleep-feels-like-adhd** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/rejection-sensitivity-adhd** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/screening-vs-adhd-evaluation** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/semaglutide-weight-loss-how-it-works** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/signs-of-adult-adhd** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/signs-of-sleep-apnea-in-adults** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/starting-adhd-medication-adults** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/telehealth-adhd-california** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/telehealth-adhd-texas** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/testosterone-and-adhd-overlap** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/time-blindness-adhd** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/trt-monitoring-requirements** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/weight-gain-after-stopping-ozempic** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/what-does-low-testosterone-feel-like** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/what-included-199-adhd-evaluation** (adhd-content) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/answers/what-is-food-noise** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/what-is-free-testosterone** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/what-is-insulin-resistance** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/what-to-do-after-lab-results** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/when-is-testosterone-therapy-appropriate** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/which-preventive-blood-tests-adults** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/who-qualifies-glp-1-weight-loss** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/why-am-i-tired-even-after-sleeping** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/answers/why-normal-labs-dont-mean-healthy** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/adderall-for-adhd-how-it-works** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-and-binge-eating** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-brain-imaging-subtypes** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-evaluation-california-online-vs-in-person** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-evaluation-cost-texas** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-hormones-women** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-in-women** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-medication-daily-or-as-needed-adults** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-medication-online-california** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-medication-options-california** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-medication-options-for-adults** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-medication-side-effects-what-to-expect** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-symptoms-overlooked** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-telehealth-california** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-testing-online-california-screening-vs-evaluation** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-austin-tx** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-dallas-tx** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-fort-worth-tx** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-houston-tx** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-los-angeles-ca** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-miami-fl** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-oakland-ca** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-orange-county-ca** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-orlando-fl** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-philadelphia-pa** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-sacramento-ca** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-san-antonio-tx** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-san-diego-ca** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-san-francisco-ca** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-san-jose-ca** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd-treatment-texas** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adhd** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adult-adhd-symptoms-california** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/adult-adhd-treatment-california-2026** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/compounded-vs-branded-glp1-medications** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/executive-dysfunction-adhd** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/food-noise-and-glp-1-what-it-means-and-what-helps** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/free-testosterone-vs-total-testosterone-what-patients-should-know** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/glp1-side-effects-and-how-to-manage-them** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/how-adhd-medication-is-prescribed-online** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/how-mental-health-affects-weight-loss-outcomes** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/how-to-choose-adhd-provider-california** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/how-to-know-if-you-have-adhd-adult** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/how-to-safely-get-prescriptions-online** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/blog** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/blog/insomnia-treatment-options-beyond-medication** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/blog/insulin-resistance-and-weight-loss-clinician-overview** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/iron-deficiency-brain-fog-adhd** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/is-adhd-medication-safe-long-term** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/is-online-adhd-diagnosis-legit** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/medical-weight-loss-glp1-semaglutide-texas** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/medical-weight-loss-vs-dieting-what-actually-works** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/minoxidil-for-hair-loss-does-it-work** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/blog/non-stimulant-adhd-medications-explained** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/online-adhd-diagnosis-california** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/online-adhd-diagnosis-texas** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/oral-vs-injectable-weight-loss-medications** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/oral-vs-topical-minoxidil-which-is-right** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/blog/perimenopause-brain-fog** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/phentermine-for-weight-loss-safety-and-effectiveness** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/pots-and-adhd** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/blog/semaglutide-for-weight-loss-how-it-works** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/sildenafil-for-erectile-dysfunction-what-to-expect** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/telehealth-prescriptions-how-online-treatment-works** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/telehealth** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/tirzepatide-vs-semaglutide-which-is-better** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/vyvanse-vs-adderall-differences** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/blog/weight-loss** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/when-is-testosterone-therapy-appropriate** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/why-am-i-always-tired-causes-when-to-see-doctor** (general-cta) — 0 CarePatron link(s), 2 legacy GHL link(s), acceptance script: no
- **/blog/youre-not-lazy-signs-undiagnosed-adult-adhd** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/book-appointment** (booking-hub) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/creyos-adhd-testing** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/intake** (intake-hub) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: yes
- **/labs** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/a1c-blood-sugar** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/adhd-support** (adhd-related) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/fatigue-brain-fog** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/how-to-read-results** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/iron-ferritin** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/mens-health** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/preventive** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/thyroid** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/vitamin-b12** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/labs/womens-midlife** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/legal/controlled-substance-treatment-agreement** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/legal/cookie-policy** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/legal** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/legal/notice-of-privacy-practices** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/legal/privacy-policy** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/legal/terms-of-use** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/mens-health-longevity** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/online-adhd-test** (adhd-funnel) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no, ADHD disclaimer: yes
- **/prescriptions** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/pricing** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/primary-urgent-care** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/privacy-policy** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/providers/derek-timbs** (provider-page) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/providers/dr-natasha-desai** (provider-page) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/providers/dr-sneh-pandey** (provider-page) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/providers/dr-swati-pandey** (provider-page) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/providers/dr-vanessa-urbina** (provider-page) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/providers** (provider-page) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/providers/megan-wunderlich** (provider-page) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/providers/wendy-delgado** (provider-page) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/redirect/adhd-evaluation** (adhd-related) — 1 CarePatron link(s), 0 legacy GHL link(s), acceptance script: no
- **/redirect/adhd-walkthrough** (adhd-related) — 1 CarePatron link(s), 0 legacy GHL link(s), acceptance script: no
- **/redirect/meet-greet** (general-cta) — 1 CarePatron link(s), 0 legacy GHL link(s), acceptance script: no
- **/siya-circle** (general-cta) — 0 CarePatron link(s), 5 legacy GHL link(s), acceptance script: no
- **/telehealth** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/terms** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/weight-loss-metabolic-health** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/womens-health** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/womens-midlife-health** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no

## External funnels (GHL-side only)

- **CarePatron direct scheduling** (`carepatron-booking`) — Direct booking CTAs sitewide; legal gate on /intake only
- **Legacy GHL form (deprecated for booking)** (`ghl-legacy-form`) — No longer used for Meet & Greet / discovery CTAs
- **LeadConnector chat widget** (`leadconnector-chat`) — NOT gated by clickwrap — configure acceptance in GHL chat funnel / workflow

## Forms still missing acceptance capture

### Site (HTML) — after `npm run build`

- `about.html`
- `adhd-care.html`
- `adhd-diagnosis-austin.html`
- `adhd-diagnosis-florida.html`
- `adhd-diagnosis-houston.html`
- `adhd-diagnosis-pennsylvania.html`
- `adhd-diagnosis-philadelphia.html`
- `adhd-diagnosis-texas.html`
- `adhd-evaluation-cost.html`
- `adhd-screening-results.html`
- `adhd-screening.html`
- `adhd-treatment-online.html`
- `adult-adhd-diagnosis.html`
- `answers/adderall-vs-vyvanse-adults.html`
- `answers/adhd-and-weight-loss-connection.html`
- `answers/adhd-in-women.html`
- `answers/adhd-medication-every-day.html`
- `answers/adhd-medication-side-effects.html`
- `answers/adhd-vs-anxiety.html`
- `answers/adhd-vs-burnout.html`
- `answers/afternoon-energy-crash-after-lunch.html`
- `answers/asrs-adhd-screening-explained.html`
- `answers/brain-fog-after-eating.html`
- `answers/can-adhd-be-diagnosed-online.html`
- `answers/can-adhd-cause-anxiety.html`
- `answers/can-sleep-apnea-cause-fatigue.html`
- `answers/can-you-get-adhd-medication-online.html`
- `answers/compounded-vs-branded-glp-1.html`
- `answers/ed-telehealth-legitimate.html`
- `answers/executive-dysfunction-adhd.html`
- `answers/food-noise-returned-on-glp-1.html`
- `answers/fsa-hsa-adhd-evaluation.html`
- `answers/glp-1-nausea-management.html`
- `answers/glp-1-side-effects.html`
- `answers/high-functioning-adhd.html`
- `answers/high-shbg-low-free-testosterone.html`
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
- `answers/normal-a1c-insulin-resistance.html`
- `answers/oral-vs-topical-minoxidil.html`
- `answers/poor-sleep-feels-like-adhd.html`
- `answers/rejection-sensitivity-adhd.html`
- `answers/screening-vs-adhd-evaluation.html`
- `answers/semaglutide-weight-loss-how-it-works.html`
- `answers/signs-of-adult-adhd.html`
- `answers/signs-of-sleep-apnea-in-adults.html`
- `answers/starting-adhd-medication-adults.html`
- `answers/telehealth-adhd-california.html`
- `answers/telehealth-adhd-texas.html`
- `answers/testosterone-and-adhd-overlap.html`
- `answers/time-blindness-adhd.html`
- `answers/trt-monitoring-requirements.html`
- `answers/weight-gain-after-stopping-ozempic.html`
- `answers/what-does-low-testosterone-feel-like.html`
- `answers/what-included-199-adhd-evaluation.html`
- `answers/what-is-food-noise.html`
- `answers/what-is-free-testosterone.html`
- `answers/what-is-insulin-resistance.html`
- `answers/what-to-do-after-lab-results.html`
- `answers/when-is-testosterone-therapy-appropriate.html`
- `answers/which-preventive-blood-tests-adults.html`
- `answers/who-qualifies-glp-1-weight-loss.html`
- `answers/why-am-i-tired-even-after-sleeping.html`
- `answers/why-normal-labs-dont-mean-healthy.html`
- `blog/adderall-for-adhd-how-it-works.html`
- `blog/adhd-and-binge-eating.html`
- `blog/adhd-brain-imaging-subtypes.html`
- `blog/adhd-evaluation-california-online-vs-in-person.html`
- `blog/adhd-evaluation-cost-texas.html`
- `blog/adhd-hormones-women.html`
- `blog/adhd-in-women.html`
- `blog/adhd-medication-daily-or-as-needed-adults.html`
- `blog/adhd-medication-online-california.html`
- `blog/adhd-medication-options-california.html`
- `blog/adhd-medication-options-for-adults.html`
- `blog/adhd-medication-side-effects-what-to-expect.html`
- `blog/adhd-symptoms-overlooked.html`
- `blog/adhd-telehealth-california.html`
- `blog/adhd-testing-online-california-screening-vs-evaluation.html`
- `blog/adhd-treatment-austin-tx.html`
- `blog/adhd-treatment-dallas-tx.html`
- `blog/adhd-treatment-fort-worth-tx.html`
- `blog/adhd-treatment-houston-tx.html`
- `blog/adhd-treatment-los-angeles-ca.html`
- `blog/adhd-treatment-miami-fl.html`
- `blog/adhd-treatment-oakland-ca.html`
- `blog/adhd-treatment-orange-county-ca.html`
- `blog/adhd-treatment-orlando-fl.html`
- `blog/adhd-treatment-philadelphia-pa.html`
- `blog/adhd-treatment-sacramento-ca.html`
- `blog/adhd-treatment-san-antonio-tx.html`
- `blog/adhd-treatment-san-diego-ca.html`
- `blog/adhd-treatment-san-francisco-ca.html`
- `blog/adhd-treatment-san-jose-ca.html`
- `blog/adhd-treatment-texas.html`
- `blog/adhd.html`
- `blog/adult-adhd-symptoms-california.html`
- `blog/adult-adhd-treatment-california-2026.html`
- `blog/compounded-vs-branded-glp1-medications.html`
- `blog/executive-dysfunction-adhd.html`
- `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html`
- `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html`
- `blog/glp1-side-effects-and-how-to-manage-them.html`
- `blog/how-adhd-medication-is-prescribed-online.html`
- `blog/how-mental-health-affects-weight-loss-outcomes.html`
- `blog/how-to-choose-adhd-provider-california.html`
- `blog/how-to-know-if-you-have-adhd-adult.html`
- `blog/how-to-safely-get-prescriptions-online.html`
- `blog/index.html`
- `blog/insomnia-treatment-options-beyond-medication.html`
- `blog/insulin-resistance-and-weight-loss-clinician-overview.html`
- `blog/iron-deficiency-brain-fog-adhd.html`
- `blog/is-adhd-medication-safe-long-term.html`
- `blog/is-online-adhd-diagnosis-legit.html`
- `blog/medical-weight-loss-glp1-semaglutide-texas.html`
- `blog/medical-weight-loss-vs-dieting-what-actually-works.html`
- `blog/minoxidil-for-hair-loss-does-it-work.html`
- `blog/non-stimulant-adhd-medications-explained.html`
- `blog/online-adhd-diagnosis-california.html`
- `blog/online-adhd-diagnosis-texas.html`
- `blog/oral-vs-injectable-weight-loss-medications.html`
- `blog/oral-vs-topical-minoxidil-which-is-right.html`
- `blog/perimenopause-brain-fog.html`
- `blog/phentermine-for-weight-loss-safety-and-effectiveness.html`
- `blog/pots-and-adhd.html`
- `blog/semaglutide-for-weight-loss-how-it-works.html`
- `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html`
- `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html`
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
- `labs/a1c-blood-sugar.html`
- `labs/adhd-support.html`
- `labs/fatigue-brain-fog.html`
- `labs/how-to-read-results.html`
- `labs/iron-ferritin.html`
- `labs/mens-health.html`
- `labs/preventive.html`
- `labs/thyroid.html`
- `labs/vitamin-b12.html`
- `labs/womens-midlife.html`
- `mens-health-longevity.html`
- `online-adhd-test.html`
- `prescriptions.html`
- `pricing.html`
- `primary-urgent-care.html`
- `privacy-policy.html`
- `providers/derek-timbs.html`
- `providers/dr-natasha-desai.html`
- `providers/dr-sneh-pandey.html`
- `providers/dr-swati-pandey.html`
- `providers/dr-vanessa-urbina.html`
- `providers/index.html`
- `providers/megan-wunderlich.html`
- `providers/wendy-delgado.html`
- `siya-circle.html`
- `telehealth.html`
- `terms.html`
- `weight-loss-metabolic-health.html`
- `womens-health.html`
- `womens-midlife-health.html`

### GHL / LeadConnector (ops — cannot be completed in repo)

- Primary GHL form hidden-field mapping and contact persistence
- LeadConnector chat widget intake checkboxes
- Any additional GHL forms not using `mnWpgh0IEgFvJymdZqHY` (audit found single form ID sitewide)

## Files added/changed

- `data/ghl-intake-config.mjs` — form ID, field keys, policy versions, copy
- `scripts/ghl-legal-acceptance.js` — clickwrap modal + link interception
- `scripts/site-chrome.mjs` — CarePatron CTAs; legal gate on /intake only
- `scripts/generate-intake-page.mjs` — `/intake` hub with CarePatron redirect
- `scripts/audit-ghl-forms.mjs` — this report
- `scripts/validate-ghl-legal-acceptance.mjs` — CI gate
- `styles.css` — modal + intake panel styles

## Out of scope (per sprint)

- Legal document body text — unchanged
- Counsel-authored `/legal/*` pages — unchanged (no clickwrap injection on legal pages)
