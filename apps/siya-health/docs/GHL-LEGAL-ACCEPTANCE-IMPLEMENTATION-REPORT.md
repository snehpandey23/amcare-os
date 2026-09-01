# GHL Legal Acceptance — Implementation Report

Generated: 2026-09-01T12:50:08.612Z

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

- HTML pages scanned: **223**
- Pages with legacy GHL booking links: **7**
- Total legacy GHL booking anchor targets: **7**
- Pages with CarePatron booking links: **3**
- Total CarePatron booking anchor targets: **3**
- Pages with acceptance script after build: **1**
- Intake hub present: **yes**

## Forms audited (site touchpoints)

- **/blog/how-to-safely-get-prescriptions-online** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/insomnia-treatment-options-beyond-medication** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/minoxidil-for-hair-loss-does-it-work** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/oral-vs-topical-minoxidil-which-is-right** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/sildenafil-for-erectile-dysfunction-what-to-expect** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/blog/vyvanse-vs-adderall-differences** (general-cta) — 0 CarePatron link(s), 1 legacy GHL link(s), acceptance script: no
- **/intake** (intake-hub) — 0 CarePatron link(s), 0 legacy GHL link(s), acceptance script: yes
- **/redirect/adhd-evaluation** (adhd-related) — 1 CarePatron link(s), 0 legacy GHL link(s), acceptance script: no
- **/redirect/adhd-walkthrough** (adhd-related) — 1 CarePatron link(s), 0 legacy GHL link(s), acceptance script: no
- **/redirect/meet-greet** (general-cta) — 1 CarePatron link(s), 0 legacy GHL link(s), acceptance script: no

## External funnels (GHL-side only)

- **CarePatron direct scheduling** (`carepatron-booking`) — Direct booking CTAs sitewide; legal gate on /intake only
- **Legacy GHL form (deprecated for booking)** (`ghl-legacy-form`) — No longer used for Meet & Greet / discovery CTAs
- **LeadConnector chat widget** (`leadconnector-chat`) — NOT gated by clickwrap — configure acceptance in GHL chat funnel / workflow

## Forms still missing acceptance capture

### Site (HTML) — after `npm run build`

- `blog/how-to-safely-get-prescriptions-online.html`
- `blog/index.html`
- `blog/insomnia-treatment-options-beyond-medication.html`
- `blog/minoxidil-for-hair-loss-does-it-work.html`
- `blog/oral-vs-topical-minoxidil-which-is-right.html`
- `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html`
- `blog/vyvanse-vs-adderall-differences.html`

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
