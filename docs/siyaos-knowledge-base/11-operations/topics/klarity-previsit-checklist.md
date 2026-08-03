---
id: klarity-previsit-checklist
module: 11-operations
title: Klarity pre-visit checklist — payment and intake
status: live
owner: Clinical Program · Billing
confidence: official
reviewDate: 2026-11-01
supersedes: none
kind: topic
bot_retrieve: true
keywords:
  - Klarity
  - Hello Klarity
  - intake
  - forms
  - invoice
  - payment
  - deposit
  - ID upload
  - pre-visit
  - MA checklist
escalate: Billing lead
priority: 10
revision:
  - date: 2026-08-03
    author: Siya Assist seed
    note: Combines Klarity public booking/intake/billing duties with Siya MA pre-visit focus
sources:
  - https://www.helloklarity.com/billing-and-cancellation-policy
  - https://support.helloklarity.com/support/solutions/articles/66000508830-how-does-booking-care-through-the-klarity-platform-work-
  - https://support.helloklarity.com/support/solutions/articles/66000501245-how-do-i-complete-my-intake-forms-
---

## Overview

Before a Klarity-booked visit goes live, MAs confirm: **(1) invoices / balances are cleared or ready**, and **(2) intake + consent forms are complete**. Incomplete forms can delay the visit and may trigger **extra fees** for extended time.

## Why

Klarity policy puts documentation and payment readiness on the patient — but ops quality depends on MAs catching gaps early so providers are not surprised and patients are not charged unexpectedly for admin delay.

## SOP — MA pre-visit checklist (Klarity EHR)

For each upcoming Klarity appointment (same day / next day first):

### A. Payment / invoice

1. Confirm booking type: **initial** vs **follow-up / refill** vs other.  
2. **Initial (self-pay):** $10 **non-refundable** deposit at booking; **remainder charged ~24 hours before** the appointment (Klarity Billing Policy).  
3. **Follow-up / refill (self-pay):** fee charged **24 hours prior** to card on file.  
4. Confirm card on file can cover remaining balance (Klarity booking article).  
5. If balance unpaid / card failing inside the Klarity window → flag **Billing lead**; do not invent a Siya.health workaround.  
6. **Insured:** confirm patient understands copay / coinsurance / deductible; Klarity does **not** guarantee coverage (Payment Agreement + Billing Policy).

### B. Intake & identity

1. Portal → **Forms** (Klarity EHR path per Klarity support).  
2. Required before ideal visit readiness: **medical + consent forms** signed/submitted.  
3. **U.S. government ID** uploaded (passport, driver’s license, or ID card).  
4. **Proof of U.S. residency** available if requested (utility bill / rental agreement — Klarity booking article).  
5. Klarity asks patients to submit intake **24 hours prior** when using IntakeQ-style flows; Klarity EHR also prompts incomplete intake on login.  
6. Note: patients **can sometimes join** via email Zoom link or portal “Join Appointment” **without** finishing intake — MAs must still chase incomplete forms and warn the provider (Klarity intake article).

### C. Day-of readiness

1. Patient should join **5–10 minutes early** (Klarity late/tech policy).  
2. Tech issues → patient reports via portal/email; reschedule without penalty only when Klarity/provider allows (do not promise).  
3. Incomplete intake at visit time → provider may charge **additional fees for extended time / admin delay** (Billing Policy).

## FAQ

**Must intake be done before the patient can see the schedule?**  
Klarity states incomplete intake prompts on login and that forms should be done before accessing the appointment schedule — but bypass paths exist for joining video. Treat incomplete forms as a **pre-visit defect**, not “optional.”

**Who completes forms?**  
Patient in Klarity (or IntakeQ) client portal. MA coaches steps; does not fill clinical history for the patient.

**Payment not cleared 24h before?**  
Escalate Billing; follow release/hold practice set by Clinical Program — do not promise the visit will proceed unpaid.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Forms incomplete night before | Message patient via portal; escalate if no response |
| Deposit paid, remainder failed | Billing lead + Klarity support if platform error |
| Patient joined without forms | Notify provider; document; complete forms ASAP |
| Patient asks “will I be charged extra?” | Quote Klarity incomplete-intake fee language; no custom promises |

## AI Context

For Klarity visits, MAs verify payment timing ($10 initial deposit; remainder / follow-ups ~24h prior) and completed intake + ID. Incomplete forms can cause extra fees. Patients may still join video without finishing forms — still chase forms. No refund or fee waivers in Assist. Escalate payment blocks to Billing lead.

## Related documents

- `klarity-channel-overview`
- `klarity-billing-cancellation`
- `klarity-patient-consents`
- `daily-payment-check` (Zoho / other channels — do not replace Klarity ledger)

## Owner

Clinical Program · Billing

## Revision history

| Date | Change |
|------|--------|
| 2026-08-03 | Initial live topic |
