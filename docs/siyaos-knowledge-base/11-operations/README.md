# 11 — Operations

**Owner:** Clinical Program / Ops · **Status:** live (seeded)

Daily workflows, escalations, billing coordination, and cross-department handoffs.

## Topics (live)

| Topic | ID |
|-------|-----|
| Escalation pathways | `escalation-pathways` |
| Daily payment check | `daily-payment-check` |
| Late cancel / refunds | `billing-late-cancel` |
| Klarity channel overview | `klarity-channel-overview` |
| Klarity pre-visit (payment + intake) | `klarity-previsit-checklist` |
| Klarity billing / cancel / chargebacks | `klarity-billing-cancellation` |
| Klarity patient consents | `klarity-patient-consents` |
| Patient FAQ — insurance / cash-pay | `patient-faq-insurance-cash-pay` |
| Patient FAQ — FSA / HSA | `patient-faq-fsa-hsa` |
| Patient FAQ — telehealth legitimate | `patient-faq-telehealth-legitimate` |
| Patient FAQ — ADHD eval included | `patient-faq-adhd-evaluation-included` |
| Service-line blurbs | `service-line-blurbs` |

## Packs

| Pack | Path |
|------|------|
| Klarity (Hello Klarity) | [`klarity/README.md`](./klarity/README.md) |
| Patient-site FAQs + service blurbs | [`patient-site-faqs/README.md`](./patient-site-faqs/README.md) |

## Held for founder/legal sign-off (not in Ask)

| Topic | ID | Notes |
|-------|-----|-------|
| Legal policy talk-tracks | `legal-escalation-summaries` | `status: draft`, `bot_retrieve: false` — do not live until sign-off |

## Archived (not retrieved by Ask)

| Topic | ID | Notes |
|-------|-----|-------|
| Discovery Call staff billing / no-show | `discovery-call-staff-billing` | **Discontinued 2026-08-06** — $79 Discovery Call superseded by **free Meet & Greet**. `status: archived`, `bot_retrieve: false`. |

## Source docs in repo

- `docs/workflows/daily-tasks-workflow.md`
- `docs/workflows/clinical-program-manager-sow.md`

Add new articles under `topics/` using `_template-topic.md`, set `status: live`, run `npm run kb:build -w @amcare/hipaa-training`.
