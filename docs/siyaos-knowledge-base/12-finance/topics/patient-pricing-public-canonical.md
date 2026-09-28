---
id: patient-pricing-public-canonical
module: 12-finance
title: Patient pricing — public website (canonical for staff chat)
status: live
owner: CEO · Billing
confidence: official
reviewDate: 2026-09-28
kind: topic
keywords:
  - pricing
  - $149
  - evaluation
  - follow-up
  - membership
  - marketplace
priority: 10
links:
  - label: Public pricing page
    href: https://siya.health/pricing
sources:
  - apps/siya-health/data/site-standards.mjs
  - apps/siya-health/pricing.html
---

## Overview

Staff quote Siya-billed prices from facts-lookup, which reads `apps/siya-health/data/site-standards.mjs`. Do not memorize a second monthly tier.

## SOP

**Siya-billed patients (direct siya.health), signed off 2026-09-28:**

- **Free** — Meet & Greet.
- **$149** — initial evaluation, one time.
- **$149/month** — ongoing care for everyone billed by Siya, including when a controlled medication is part of the plan. There is no cheaper non-controlled plan.
- Patients who were on **$79/month** have been moved to **$149/month**. Do not tell them the old plan still exists on Siya billing.
- Pharmacy cost and lab tests are separate.

**Marketplaces:** Charge whatever that marketplace displays, and follow that marketplace’s guidelines. Do not overwrite a Klarity or other marketplace price with the Siya direct-site price.

## Legacy — do not quote as current Siya billing

- **$79/month** non-controlled follow-up (retired; Siya-billed patients moved to $149/month).
- Discovery Call **$79** (retired; intro is free Meet & Greet).
- Intake **$199**.

## FAQ

**Is there a cheaper plan if I’m not on a controlled medication?**  
No. Siya-billed ongoing care is **$149/month** either way.

**I’m on the $79 plan. Why did it change?**  
Siya billing moved those patients to **$149/month**. If they pay through a marketplace, the price on that marketplace still applies.

## AI Context

Read dollar amounts from facts-lookup (`site-standards.mjs`). Do not hardcode a $79 monthly tier. Marketplace invoices stay on marketplace pricing.

## Revision history

| Date | Change |
|------|--------|
| 2026-09-28 | One $149/month Siya-billed plan; $79/month retired; marketplace prices unchanged |
| 2026-07-26 | Canonical public pricing for assistant |
