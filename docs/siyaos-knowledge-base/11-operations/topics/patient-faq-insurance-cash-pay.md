---
id: patient-faq-insurance-cash-pay
module: 11-operations
title: Patient FAQ — insurance, cash-pay, and Superbills (direct)
status: live
owner: Billing lead
confidence: official
reviewDate: 2026-11-01
supersedes: none
kind: topic
bot_retrieve: true
keywords:
  - insurance
  - cash-pay
  - cash pay
  - do you take insurance
  - accept insurance
  - superbill
  - EOB
  - out of network
  - reimbursement
  - in-network
escalate: Billing lead
priority: 9
revision:
  - date: 2026-08-06
    author: Siya Assist seed
    note: Curated staff FAQ from siya.health pricing + insurance messaging (not full answers corpus)
sources:
  - https://www.siya.health/pricing
  - apps/siya-health/data/site-standards.mjs
  - docs/siyaos-knowledge-base/11-operations/patient-site-faqs/README.md
---

## Overview

Staff talk-track for **siya.health direct** patients asking about insurance. Siya Health is **cash-pay today** and does **not** accept insurance. Do not mix with Klarity insured-patient rules.

## Why

Insurance questions are high-volume and easy to over-promise. One consistent answer protects trust and billing.

## SOP

1. Confirm channel: **siya.health direct** vs **Klarity**.  
2. **Direct:** “We do not accept insurance. Care is cash-pay with transparent pricing on siya.health/pricing.”  
3. Offer **itemized receipt / Superbill** so the patient can submit to their plan for possible out-of-network reimbursement — **we do not guarantee reimbursement**.  
4. FSA/HSA: point to `patient-faq-fsa-hsa` (plan administrator decides eligibility).  
5. “Will you be in-network later?” → “Insurance options may be added later; today we are cash-pay.” Do not invent a go-live date.  
6. Never collect card/insurance member IDs in Ask. Escalate Billing lead for Superbill disputes or special billing requests.

## FAQ

**Do you take my insurance / Aetna / Blue Cross / Medicare?**  
No. Siya Health does not accept insurance on the direct site. Cash-pay only. Klarity marketplace insurance rules are a **different channel** — use Klarity topics if the visit was booked on Klarity.

**Can I get reimbursed by my plan?**  
Maybe — out-of-network / FSA rules vary. We provide itemized receipts; the **plan** decides. Do not promise coverage.

**Can you bill insurance after the visit?**  
No for direct cash-pay visits. Escalate Billing lead if a patient insists on an exception — do not commit in chat.

**What about Klarity patients who have insurance?**  
Different channel. Use `klarity-billing-cancellation` / Klarity payment agreement language. Do not apply this cash-pay FAQ to Klarity insured flows.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Patient sends EOB / claim denial | Empathy + clarify we are cash-pay; escalate Billing if Superbill wording disputed |
| Staff quotes “we take insurance” | Correct immediately; cite this topic + pricing page |

## AI Context

Direct siya.health: **does not accept insurance**; cash-pay; receipts for patient-driven reimbursement/FSA. No coverage guarantees. Klarity ≠ this answer. Escalate Billing lead for exceptions. No PHI in chat.

## Related documents

- `patient-faq-fsa-hsa`
- `patient-pricing-public-canonical`
- `klarity-billing-cancellation` (Klarity only)

## Owner

Billing lead
