---
id: billing-late-cancel
module: 11-operations
title: Late cancellation and refunds
status: live
owner: Billing lead
keywords:
  - late cancel
  - cancellation
  - refund
  - same day
  - billing
escalate: Billing lead
priority: 8
sources:
  - docs/workflows/daily-tasks-workflow.md
---

## Overview

How staff talk about cancellations without promising refunds.

## Why

Refund authority sits with billing; inconsistent promises create liability and patient conflict.

## SOP

1. Follow **written billing policy** for the cancellation window.  
2. Document cancel date/time in the record.  
3. Do **not** promise refunds in chat or phone — use approved language.  
4. Escalate exceptions to **billing lead**.

## FAQ

**Patient cancels same-day / inside late-cancel window?**  
Use approved late-cancel language; do **not** promise refund in chat. Route to **billing lead** or Klarity support per policy. For **Klarity-booked** visits, use `klarity-billing-cancellation` (24h rule; $10 initial deposit non-refundable).

**Provider no-show / emergency?**  
Offer **reschedule** first. Refund only when billing policy and billing lead (or documented provider direction) support it.

**Patient no-show?**  
Explain no-show policy; do **not** proactively offer refund. Disputes → billing / Klarity. Klarity channel details: `klarity-billing-cancellation`.

**Payment not captured before visit (card failed)?**  
Follow ops workflow to **release slot** after the defined window so others can book — document in chart/billing tools. Klarity timing: `klarity-previsit-checklist`.

**FSA / HSA cards?**  
May work in Klarity/Carepatron when plan allows; declines often mean visit type not covered. Never collect card data in Siya Assistant. Escalate **billing**.

**Duplicate charge already refunded in portal?**  
Confirm ledger, explain refund timeline; do not double-refund without billing review.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Patient demands refund in portal chat | Empathy + billing follow-up; no commitment |

## AI Context

Never authorize refunds. Point to written policy and billing lead. For Klarity bookings prefer `klarity-billing-cancellation`. Suggest documenting cancel time.

## Related documents

- Billing policy (internal — billing owner)
- `klarity-billing-cancellation`
- `klarity-previsit-checklist`

## Owner

Billing lead

## Revision history

| Date | Change |
|------|--------|
| 2026-07-26 | Migrated from workspace KB |
