# GHL Legal Acceptance — Implementation Report

Generated: 2026-06-05T14:58:17.153Z

## Objective

Enforceable intake acceptance for Siya Health booking, consultation, ADHD evaluation, screening, and contact funnels before external GHL form submission.

## Implementation summary

| Layer | Status | Notes |
|-------|--------|-------|
| Sitewide clickwrap gate | **Deployed** | `scripts/ghl-legal-acceptance.js` intercepts all `link.yourmarketingai.com/widget/form/` anchor clicks |
| Policy links | **Deployed** | `/legal/terms-of-use`, `/legal/privacy-policy`, `/legal/notice-of-privacy-practices` |
| Hidden field capture (URL params) | **Deployed** | `legal_acceptance_timestamp`, `legal_acceptance_source`, `legal_document_version` + boolean acceptance flags |
| ADHD disclaimer variant | **Deployed** | Shown on ADHD funnel pages, ADHD CTAs, and `/intake?funnel=adhd` |
| Dedicated intake hub | **Deployed** | `/intake` — on-page acceptance + embedded GHL iframe |
| GHL workflow persistence | **Ops required** | Map custom fields in GHL admin (see below) |

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

- HTML pages scanned: **167**
- Pages with GHL booking links: **159**
- Total GHL booking anchor targets: **696**
- Pages with acceptance script after build: **161**
- Intake hub present: **yes**

## Forms audited (site touchpoints)

- **/about** (general-cta) — 9 GHL link(s), acceptance script: yes, chat widget: yes
- **/adhd-care** (adhd-funnel) — 7 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/adhd-diagnosis-austin** (adhd-funnel) — 5 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adhd-diagnosis-florida** (adhd-funnel) — 5 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adhd-diagnosis-houston** (adhd-funnel) — 5 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adhd-diagnosis-pennsylvania** (adhd-funnel) — 6 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adhd-diagnosis-philadelphia** (adhd-funnel) — 6 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adhd-diagnosis-texas** (adhd-funnel) — 5 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adhd-evaluation-cost** (adhd-funnel) — 3 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adhd-screening** (adhd-screening) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adhd-treatment-online** (adhd-funnel) — 7 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/adult-adhd-diagnosis** (adhd-funnel) — 7 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/answers/adderall-vs-vyvanse-adults** (general-cta) — 1 GHL link(s), acceptance script: yes
- **/answers/adhd-and-weight-loss-connection** (adhd-content) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/adhd-in-men** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/adhd-in-women** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/adhd-medication-every-day** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/adhd-medication-side-effects** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/adhd-vs-anxiety** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/adhd-vs-burnout** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/afternoon-energy-crash-after-lunch** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/asrs-adhd-screening-explained** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/brain-fog-after-eating** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/can-adhd-be-diagnosed-online** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/can-adhd-cause-anxiety** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/can-sleep-apnea-cause-fatigue** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/can-you-get-adhd-medication-online** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/compounded-vs-branded-glp-1** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/creyos-adhd-testing-explained** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/ed-telehealth-legitimate** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/executive-dysfunction-adhd** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/food-noise-returned-on-glp-1** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/fsa-hsa-adhd-evaluation** (adhd-content) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/glp-1-nausea-management** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/glp-1-side-effects** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/high-functioning-adhd** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/high-shbg-low-free-testosterone** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/how-long-adhd-evaluation** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/how-much-does-adhd-testing-cost** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/how-online-prescriptions-work** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers** (general-cta) — 2 GHL link(s), acceptance script: yes
- **/answers/insulin-resistance-without-diabetes** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/is-adhd-medication-safe-long-term** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/is-online-adhd-diagnosis-legitimate** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/is-telehealth-legitimate** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/late-adhd-diagnosis-adults** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/medical-weight-loss-vs-dieting** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/meet-and-greet-telehealth-expectations** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/minoxidil-hair-loss-does-it-work** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/non-stimulant-adhd-medications** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/normal-a1c-insulin-resistance** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/oral-vs-injectable-weight-loss-meds** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/oral-vs-topical-minoxidil** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/phentermine-weight-loss-safety** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/poor-sleep-feels-like-adhd** (adhd-content) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/rejection-sensitivity-adhd** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/screening-vs-adhd-evaluation** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/semaglutide-weight-loss-how-it-works** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/signs-of-adult-adhd** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/signs-of-sleep-apnea-in-adults** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/sildenafil-erectile-dysfunction-expectations** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/starting-adhd-medication-adults** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/telehealth-adhd-california** (adhd-content) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/telehealth-adhd-texas** (adhd-content) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/testosterone-and-adhd-overlap** (adhd-content) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/time-blindness-adhd** (adhd-content) — 1 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/tirzepatide-vs-semaglutide** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/trt-monitoring-requirements** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/weight-gain-after-stopping-ozempic** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/what-does-low-testosterone-feel-like** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/what-included-199-adhd-evaluation** (adhd-content) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes
- **/answers/what-is-food-noise** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/what-is-free-testosterone** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/what-is-insulin-resistance** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/when-is-testosterone-therapy-appropriate** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/who-qualifies-glp-1-weight-loss** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/why-am-i-tired-even-after-sleeping** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/answers/why-normal-labs-dont-mean-healthy** (general-cta) — 4 GHL link(s), acceptance script: yes
- **/blog/adderall-for-adhd-how-it-works** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/adderall-ir-vs-xr-adults** (general-cta) — 8 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-evaluation-california-online-vs-in-person** (adhd-related) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-evaluation-cost-california** (adhd-related) — 7 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-evaluation-cost-texas** (adhd-related) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-medication-daily-or-as-needed-adults** (adhd-related) — 8 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-medication-online-california** (adhd-related) — 7 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-medication-online-texas-telehealth** (adhd-related) — 8 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-medication-options-california** (adhd-related) — 7 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-medication-options-for-adults** (adhd-related) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-medication-side-effects-what-to-expect** (adhd-related) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-symptoms-overlooked** (adhd-related) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-telehealth-california** (adhd-related) — 7 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-testing-online-california-screening-vs-evaluation** (adhd-related) — 7 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd-treatment-houston-online** (adhd-related) — 8 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/adhd** (adhd-funnel) — 3 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/adult-adhd-symptoms-california** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/adult-adhd-treatment-california-2026** (adhd-funnel) — 3 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/after-adhd-diagnosis-next-steps-adults** (adhd-funnel) — 3 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/all** (general-cta) — 4 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/ambien-and-sleep-medications-risks-and-benefits** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/combining-adhd-treatment-and-weight-loss-strategies** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/compounded-vs-branded-glp1-medications** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/focalin-vs-adderall-comparison** (general-cta) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/food-noise-and-glp-1-what-it-means-and-what-helps** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/free-testosterone-vs-total-testosterone-what-patients-should-know** (general-cta) — 4 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/glp1-side-effects-and-how-to-manage-them** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/glutathione-and-peptides-what-do-they-actually-do** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/how-adhd-medication-is-prescribed-online** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/how-mental-health-affects-weight-loss-outcomes** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/how-to-choose-adhd-provider-california** (adhd-funnel) — 3 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/how-to-know-if-you-have-adhd-adult** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/how-to-safely-get-prescriptions-online** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog** (general-cta) — 6 GHL link(s), acceptance script: yes
- **/blog/insomnia-treatment-options-beyond-medication** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/insulin-resistance-and-weight-loss-clinician-overview** (general-cta) — 4 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/is-adhd-medication-safe-long-term** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/is-online-adhd-diagnosis-legit** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/long-term-weight-loss-medications-what-to-expect** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/medical-weight-loss-glp1-semaglutide-texas** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/medical-weight-loss-vs-dieting-what-actually-works** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/minoxidil-for-hair-loss-does-it-work** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/modafinil-for-focus-and-fatigue-is-it-safe** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/non-stimulant-adhd-medications-explained** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/online-adhd-diagnosis-california** (adhd-funnel) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/online-adhd-diagnosis-texas** (adhd-funnel) — 4 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/blog/oral-vs-injectable-weight-loss-medications** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/oral-vs-topical-minoxidil-which-is-right** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/phentermine-for-weight-loss-safety-and-effectiveness** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/semaglutide-for-weight-loss-how-it-works** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/sildenafil-for-erectile-dysfunction-what-to-expect** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign** (general-cta) — 4 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/telehealth-prescriptions-how-online-treatment-works** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/telehealth** (general-cta) — 4 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/tirzepatide-vs-semaglutide-which-is-better** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/vyvanse-vs-adderall-differences** (general-cta) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/weight-loss** (general-cta) — 4 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/when-is-testosterone-therapy-appropriate** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/why-am-i-always-tired-causes-when-to-see-doctor** (general-cta) — 4 GHL link(s), acceptance script: yes, chat widget: yes
- **/blog/youre-not-lazy-signs-undiagnosed-adult-adhd** (adhd-funnel) — 2 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/book-appointment** (booking-hub) — 7 GHL link(s), acceptance script: yes, chat widget: yes
- **/creyos-adhd-testing** (adhd-funnel) — 3 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/** (general-cta) — 12 GHL link(s), acceptance script: yes
- **/intake** (intake-hub) — 0 GHL link(s), acceptance script: yes
- **/labs** (general-cta) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/membership-pricing** (general-cta) — 3 GHL link(s), acceptance script: yes, chat widget: yes
- **/mens-health-longevity** (general-cta) — 8 GHL link(s), acceptance script: yes
- **/online-adhd-test** (adhd-funnel) — 7 GHL link(s), acceptance script: yes, ADHD disclaimer: yes, chat widget: yes
- **/prescriptions** (general-cta) — 6 GHL link(s), acceptance script: yes, chat widget: yes
- **/primary-urgent-care** (general-cta) — 10 GHL link(s), acceptance script: yes, chat widget: yes
- **/privacy-policy** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/providers/derek-timbs** (provider-page) — 6 GHL link(s), acceptance script: yes
- **/providers/dr-natasha-desai** (provider-page) — 9 GHL link(s), acceptance script: yes
- **/providers/dr-sneh-pandey** (provider-page) — 9 GHL link(s), acceptance script: yes
- **/providers/dr-swati-pandey** (provider-page) — 9 GHL link(s), acceptance script: yes
- **/providers/dr-vanessa-urbina** (provider-page) — 9 GHL link(s), acceptance script: yes
- **/providers** (provider-page) — 4 GHL link(s), acceptance script: yes
- **/providers/megan-wunderlich** (provider-page) — 10 GHL link(s), acceptance script: yes
- **/providers/wendy-delgado** (provider-page) — 6 GHL link(s), acceptance script: yes
- **/telehealth** (general-cta) — 13 GHL link(s), acceptance script: yes
- **/terms** (general-cta) — 5 GHL link(s), acceptance script: yes, chat widget: yes
- **/weight-loss-metabolic-health** (general-cta) — 10 GHL link(s), acceptance script: yes

## External funnels (GHL-side only)

- **Meet & Greet / booking widget** (`ghl-primary-form`) — clickwrap gate via ghl-legal-acceptance.js on all non-legal HTML pages
- **LeadConnector chat widget** (`leadconnector-chat`) — NOT gated by clickwrap — configure acceptance in GHL chat funnel / workflow

## Forms still missing acceptance capture

### Site (HTML) — after `npm run build`

_None — all pages with GHL links include the acceptance gate._

### GHL / LeadConnector (ops — cannot be completed in repo)

- Primary GHL form hidden-field mapping and contact persistence
- LeadConnector chat widget intake checkboxes
- Any additional GHL forms not using `mnWpgh0IEgFvJymdZqHY` (audit found single form ID sitewide)

## Files added/changed

- `data/ghl-intake-config.mjs` — form ID, field keys, policy versions, copy
- `scripts/ghl-legal-acceptance.js` — clickwrap modal + link interception
- `scripts/site-chrome.mjs` — inject config + script on all non-legal pages
- `scripts/generate-intake-page.mjs` — `/intake` hub
- `scripts/audit-ghl-forms.mjs` — this report
- `scripts/validate-ghl-legal-acceptance.mjs` — CI gate
- `styles.css` — modal + intake panel styles

## Out of scope (per sprint)

- Legal document body text — unchanged
- Counsel-authored `/legal/*` pages — unchanged (no clickwrap injection on legal pages)
