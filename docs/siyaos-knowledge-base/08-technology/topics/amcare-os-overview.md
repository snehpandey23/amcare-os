---
id: amcare-os-overview
module: 08-technology
title: AmCare OS — modular ops stack
status: live
owner: Engineering
keywords:
  - amcare
  - siyaos
  - monorepo
  - staff dashboard
  - patient management
  - operations hub
  - audit
  - hipaa
priority: 5
sources:
  - README.md
  - packages/audit/README.md
---

## Overview

Internal platform modules in `amcare-os` for staff, patients, ops, analytics, and integrations.

## Why

Eventual **SiyaOS** product vision: one architecture reused across portfolio companies.

## SOP

- Staff workflows → `apps/staff-dashboard`  
- Patient chart/comms → `apps/patient-management`  
- Billing/scheduling integrations → `apps/operations-hub`  
- Audit trail → `@amcare/audit` (RBAC-aligned, retention)  
- Changes ship via monorepo with compliance docs in `docs/compliance/`

## FAQ

**Is this the same as the public website?**  
No — `apps/siya-health` is patient-facing; AmCare OS is internal tooling.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| Need API behavior | `docs/api-specs/` + audit logging requirements |
| Zoho out of sync | `integrations/zoho-sync/README.md` |

## AI Context

Describe AmCare OS at architecture level only — no credentials, no internal URLs with secrets. Point developers to README and audit package. Future CAPR.AI inherits patterns, not Siya-only hacks.

## Related documents

- `/README.md`
- `docs/compliance/HIPAA.md`

## Owner

Engineering

## Revision history

| Date | Change |
|------|--------|
| 2026-07-26 | Seeded from monorepo README |
