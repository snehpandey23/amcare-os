---
id: klarity-channel-overview
module: 11-operations
title: Klarity (Hello Klarity) — channel overview for MAs
status: live
owner: Clinical Program · Ops
confidence: official
reviewDate: 2026-11-01
supersedes: none
kind: topic
bot_retrieve: true
keywords:
  - Klarity
  - Hello Klarity
  - helloklarity
  - marketplace
  - EHR
  - patient portal
  - new appointment
  - MA
  - medical assistant
escalate: Clinical lead
priority: 9
revision:
  - date: 2026-08-03
    author: Siya Assist seed
    note: Seeded from Klarity public site + Siya channel description for MA training
sources:
  - https://www.helloklarity.com/
  - https://support.helloklarity.com/support/solutions/articles/66000508830-how-does-booking-care-through-the-klarity-platform-work-
  - docs/siyaos-knowledge-base/11-operations/klarity/README.md
---

## Overview

**Klarity** (public site: [helloklarity.com](https://www.helloklarity.com), also branded Hello Klarity) is a telehealth **marketplace + EHR** used by Siya providers. Klarity Health, Inc. does **not** provide medical services; care is delivered by **independent practices** on the platform.

Siya gets patients via Klarity acquisition (ads → site → condition → provider list → book). MAs then manage those visits inside the **Klarity EHR / portal**.

## Why

MAs must know the patient path and platform boundaries so they do not invent Siya-only policies for Klarity bookings, or confuse Klarity with the public Siya.health cash-pay funnel.

## SOP — Patient journey (public Klarity)

1. Patient sees ads / discovers Klarity.  
2. Chooses a **condition / service** on Klarity.  
3. Browses **providers** (Siya doctors may appear).  
4. Selects **provider + time** and **books**.  
5. Pays initial **$10 deposit** (initial visits) and accepts the **portal invite email**.  
6. Completes **medical + consent forms**, uploads **U.S. ID**, and prepares **proof of residency** if asked.  
7. Ensures payment method can cover the **remaining balance**.  
8. Joins telehealth via the **email link** (or in-person if selected).

Source: Klarity support — *How does booking care through the Klarity platform work?*

## SOP — Siya MA side (channel ops)

1. Watch Klarity EHR for **new appointment scheduled** notifications.  
2. Run the **pre-visit checklist** (`klarity-previsit-checklist`): payment/invoice cleared + intake complete.  
3. Do **not** give clinical advice or refund promises in Siya Assist / unapproved channels.  
4. Billing / refund / chargeback questions → `klarity-billing-cancellation` + billing lead / Klarity support.  
5. Consent / form questions → `klarity-patient-consents` + portal Forms.

## FAQ

**Is Klarity the same as Siya.health booking?**  
No. Klarity is a separate marketplace/EHR channel. Siya public site pricing and Meet & Greet rules live in Finance / Clinical KB — do not mix.

**Who answers patient billing emails?**  
Klarity patient support: **patientsupport@helloklarity.com**. Medical questions → provider via portal messaging (Klarity guidance).

**Hours for Klarity phone support?**  
(866) 391-3314 · Monday–Friday · 7:00 AM–4:00 PM PST (published on Klarity site).

## Troubleshooting

| Symptom | Action |
|---------|--------|
| New booking but MA not notified | Check Klarity EHR alerts / filters; escalate Technology if persistent |
| Patient confused Siya.health vs Klarity | Explain channel; use the booking source of truth in EHR |
| Provider mismatch / wrong specialty | Do not diagnose; Klarity support or clinical lead |

## AI Context

Klarity = Hello Klarity marketplace/EHR. Siya MAs prepare Klarity-booked visits (payment + intake). Platform is not Siya’s clinic entity. No refund promises. Point staff to klarity-previsit-checklist and klarity-billing-cancellation. Escalate clinical to Clinical lead; billing disputes to Billing lead / Klarity patient support.

## Related documents

- `docs/siyaos-knowledge-base/11-operations/klarity/README.md`
- Topics: `klarity-previsit-checklist`, `klarity-billing-cancellation`, `klarity-patient-consents`
- `billing-late-cancel` (general language — Klarity-specific rules override when channel is Klarity)

## Owner

Clinical Program · Ops

## Revision history

| Date | Change |
|------|--------|
| 2026-08-03 | Initial live topic for MA training |
