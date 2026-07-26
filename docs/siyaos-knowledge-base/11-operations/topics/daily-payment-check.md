---
id: daily-payment-check
module: 11-operations
title: Daily payment check (before visits)
status: live
owner: Clinical Program · Billing
keywords:
  - payment
  - zoho
  - books
  - billing
  - pre-auth
  - appointment
  - daily task
priority: 8
sources:
  - docs/workflows/daily-tasks-workflow.md
---

## Overview

Verify payment and pre-auth status before scheduled visits.

## Why

Unpaid or unverified visits create front-desk conflict and compliance risk.

## SOP

1. Review daily payment reports from Zoho Books.  
2. Match payments to scheduled appointments.  
3. Verify insurance pre-authorizations where required.  
4. Flag issues for billing follow-up.  
5. Update billing status in EHR before the visit.

Deliverable: payments verified before patient visits.

## FAQ

**Where do reports live?**  
Zoho Books sync — see Operations hub / integration runbooks in Technology module.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Payment shows paid but EHR not updated | Sync + document; billing if stuck |
| Pre-auth missing | Hold scheduling per policy; billing lead |

## AI Context

Describe the Zoho → appointment → EHR verification loop. Do not access live patient accounts in chat. Escalate payment disputes to billing lead.

## Related documents

- `docs/workflows/daily-tasks-workflow.md`
- `integrations/zoho-sync/README.md`

## Owner

Clinical Program Manager workflow

## Revision history

| Date | Change |
|------|--------|
| 2026-07-26 | Seeded from daily tasks workflow |
