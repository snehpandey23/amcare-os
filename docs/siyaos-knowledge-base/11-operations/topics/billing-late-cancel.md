---
id: billing-late-cancel
module: 11-operations
title: Late cancellation, no-show, and refunds (direct + Klarity)
status: live
owner: Billing lead
keywords:
  - late cancel
  - cancellation
  - refund
  - same day
  - billing
  - no-show
  - $50
escalate: Billing lead
priority: 8
sources:
  - docs/workflows/daily-tasks-workflow.md
  - Founder lock 2026-08-06 — direct no-show $50
---

## Overview

How staff talk about cancellations and no-shows without promising refunds. Prefer Ask **facts-lookup** for the locked **$50** direct no-show fee.

## Why

Refund authority sits with billing; inconsistent promises create liability and patient conflict. Legacy **$40 / $79** no-show drafts are **retired** — do not quote them.

## SOP

1. Confirm booking **channel** first: **siya.health direct** vs **Klarity**.  
2. **Direct no-show / missed appointment:** fee is **$50** (facts-lookup). Do **not** waive in chat.  
3. **Direct late-cancel** (patient cancelled before start): fee wording **not locked** — escalate **Billing lead**; do not invent an amount.  
4. **Klarity-booked:** use `klarity-billing-cancellation` only (24h rule; $10 deposit) — never apply the $50 Siya direct fee to Klarity.  
5. Document cancel/no-show date/time in the record.  
6. Do **not** promise refunds in chat or phone — escalate exceptions to **billing lead**.

## FAQ

**What is the no-show fee for a CarePatron / siya.health booking?**  
**$50** for missed / no-show appointments on direct bookings. Disputes → Billing lead. Do not quote legacy $40 or $79.

**Patient cancels same-day / late-cancel (direct)?**  
Late-cancel amount is **pending founder confirmation**. Empathy + document time + escalate **Billing lead**. Do **not** invent a fee. If it was actually a no-show, use **$50**.

**Klarity-booked cancel / no-show?**  
Use `klarity-billing-cancellation` (24h rule; $10 initial deposit non-refundable). Different channel — do not mix.

**Provider no-show / emergency?**  
Offer **reschedule** first. Refund only when billing policy and billing lead (or documented provider direction) support it.

**Payment not captured before visit (card failed)?**  
Follow ops workflow to **release slot** after the defined window so others can book — document in chart/billing tools. Klarity timing: `klarity-previsit-checklist`.

**FSA / HSA cards?**  
May work when plan allows; declines often mean visit type not covered. Never collect card data in Ask. Escalate **billing**. Use Siya cash-pay / FSA facts-lookup for siya.health payment questions (not Klarity insured language).

**Duplicate charge already refunded in portal?**  
Confirm ledger, explain refund timeline; do not double-refund without billing review.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Patient demands refund in portal chat | Empathy + billing follow-up; no commitment |
| Staff cites old $40 or $79 no-show | Correct to **$50** direct no-show (or Klarity topic if Klarity) |

## AI Context

Never authorize refunds. Direct no-show = **$50** via facts-lookup. Late-cancel amount not locked — escalate. Klarity → `klarity-billing-cancellation`. Never surface retired $40/$79 no-show drafts.

## Related documents

- Ask facts-lookup (`facts-no-show-fee`)
- `klarity-billing-cancellation`
- `klarity-previsit-checklist`
- `legacy-pricing-funnel-unresolved` (no-show row resolved)

## Owner

Billing lead

## Revision history

| Date | Change |
|------|--------|
| 2026-08-06 | Locked direct no-show **$50**; late-cancel pending; retire $40/$79 |
| 2026-07-26 | Migrated from workspace KB |
