# GHL Clickwrap Implementation Log

Generated: 2026-06-28T15:14:21.138Z

## Site-side implementation (repo)

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Terms of Use linked | **Yes** | `/legal/terms-of-use` — modal + `/intake` |
| Privacy Policy linked | **Yes** | `/legal/privacy-policy` |
| Notice of Privacy Practices linked | **Yes** | `/legal/notice-of-privacy-practices` |
| Controlled Substance Agreement (ADHD CS forms) | **Partial** | Published at `/legal/controlled-substance-treatment-agreement`; linked on ADHD/CS pages. **Not yet a required GHL modal checkbox** — add in GHL admin for ADHD controlled-substance intake forms. |
| Timestamp capture | **Yes** | `legal_acceptance_timestamp` URL param |
| Source page capture | **Yes** | `legal_acceptance_source` URL param |
| Policy version capture | **Yes** | `legal_document_version` URL param |
| Boolean acceptance flags | **Yes** | `legal_acceptance_terms`, `_privacy`, `_npp` |

## GHL form

- Form ID: `mnWpgh0IEgFvJymdZqHY`
- Interceptor: `scripts/ghl-legal-acceptance.js` (sitewide on non-legal pages)

## Remaining manual verification (ops)

1. [ ] GHL hidden fields map to contact custom fields
2. [ ] Workflow persists `legal_acceptance_*` through pipelines and booking automations
3. [ ] LeadConnector chat widget (`69be9ab3db1480f6799cdd18`) — add Terms/Privacy/NPP checkboxes
4. [ ] ADHD controlled-substance GHL forms — add Controlled Substance Treatment Agreement checkbox + field mapping
5. [ ] End-to-end test: submit intake → verify contact record fields in GHL

## Related docs

- [GHL-LEGAL-ACCEPTANCE-IMPLEMENTATION-REPORT.md](./GHL-LEGAL-ACCEPTANCE-IMPLEMENTATION-REPORT.md)
- [GHL-LEGAL-ACCEPTANCE-AUDIT.json](./GHL-LEGAL-ACCEPTANCE-AUDIT.json)
