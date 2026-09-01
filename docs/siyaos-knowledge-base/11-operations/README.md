# 11 — Operations

**Owner:** Clinical Program / Ops · **Status:** live (seeded)

Daily workflows, escalations, billing coordination, and cross-department handoffs.

## Topics (live / provisional)

| Topic | ID | Status |
|-------|-----|--------|
| Patient asks for manager / supervisor — provisional | `patient-manager-request-provisional` | provisional |
| Escalation pathways | `escalation-pathways` | live |
| Daily payment check | `daily-payment-check` |
| Late cancel / refunds | `billing-late-cancel` |
| Klarity channel overview | `klarity-channel-overview` |
| Klarity pre-visit (payment + intake) | `klarity-previsit-checklist` |
| Klarity billing / cancel / chargebacks | `klarity-billing-cancellation` |
| Klarity patient consents | `klarity-patient-consents` |
| Discovery Call staff billing / no-show | `discovery-call-staff-billing` |

## Klarity (Hello Klarity) pack

Index + source map: [`klarity/README.md`](./klarity/README.md)

## Source docs in repo

- `docs/workflows/daily-tasks-workflow.md`
- `docs/workflows/clinical-program-manager-sow.md`

Add new articles under `topics/` using `_template-topic.md`, set `status: live`, run `npm run kb:build -w @amcare/hipaa-training`.
