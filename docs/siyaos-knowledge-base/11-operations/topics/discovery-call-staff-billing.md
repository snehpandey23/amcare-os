---
id: discovery-call-staff-billing
module: 11-operations
title: Discovery Call — staff billing, cancel, and no-show (DISCONTINUED)
status: archived
owner: Billing lead
confidence: official
reviewDate: 2026-08-06
supersedes: none
superseded_by: free Meet & Greet (site-standards MEET_GREET_CTA / PRICING.meetGreet)
kind: topic
bot_retrieve: false
keywords:
  - Discovery Call
  - discontinued
  - archived
  - Meet and Greet
  - $79
escalate: Billing lead
priority: 1
revision:
  - date: 2026-08-06
    author: Siya Assist
    note: "ARCHIVED — Discovery Call ($79) discontinued. Superseded by free Meet & Greet. bot_retrieve false so Ask cannot surface fee tables."
  - date: 2026-08-04
    author: Siya Assist ingest
    note: Structured from WorkDrive accounts/discovery-call-staff-quick-reference.md + discovery-call-terms-and-conditions.md (no rewrite)
sources:
  - WorkDrive SiyaOS/accounts/discovery-call-staff-quick-reference.md
  - WorkDrive SiyaOS/accounts/discovery-call-terms-and-conditions.md
  - apps/siya-health/data/site-standards.mjs (PRICING.meetGreet / MEET_GREET_CTA)
links:
  - label: Public Meet & Greet booking
    href: https://www.siya.health/redirect/meet-greet
  - label: Public pricing
    href: https://www.siya.health/pricing
---

## Discontinued

**Status:** Archived / not for retrieval  
**When:** 2026-08-06  
**Why:** The paid **$79 Discovery Call** product is discontinued. Current patient entry is the **free Meet & Greet** (non-clinical intro). Do **not** quote $79, $10 booking hold, or $69 remainder for intro calls.

**Current source of truth:** `apps/siya-health/data/site-standards.mjs` → `PRICING.meetGreet` (amount `0` / Free) and `MEET_GREET_CTA`. Staff Ask answers Meet & Greet / intro price via the facts-lookup layer, not this topic.

Historical fee tables below are retained for audit only.

## Overview (historical)

Staff cheat sheet that formerly covered **Siya Health Discovery Call** billing and attendance. Naming later aligned to site “Meet & Greet.” Support email: **patientsupport@siya.health**. This topic applied to Discovery Call only — not full ADHD evaluation / CSV / Klarity-booked visits.

## Why (historical)

Concierge and MAs applied Discovery Call fee rules without waiving fees in chat or inventing refunds.

## SOP (historical — do not apply)

### Money

| Item | Amount |
|------|--------|
| Total | $79 |
| At booking (non-refundable) | $10 |
| Due ≥1 h before visit | $69 |

### Refunds / cancel (historical)

- **$10:** never refunded.
- **$69:** refunded if patient cancels **≥24 h** before; kept if **<24 h** (patient charged full $79).
- **Exceptions:** Billing lead only.

### No-show / late (historical)

- No-show → **$79 forfeited**.
- **Late >5 min** from start → may be documented as no-show per provider (full $79).

## FAQ

**Is Discovery Call still bookable?** No — discontinued 2026-08-06. Offer **free Meet & Greet**.

**Is this the same as Klarity cancellation?** Klarity-booked visits still use Klarity billing topics. Do not apply these Discovery Call dollar amounts to Klarity or full evaluation products.

## AI Context

**Do not retrieve or cite this topic for live answers.** Discovery Call ($79) is discontinued as of 2026-08-06, superseded by free Meet & Greet. For intro / Meet & Greet price use facts-lookup / public pricing. Escalate Billing lead only for legacy charge disputes from when Discovery Call was active.
