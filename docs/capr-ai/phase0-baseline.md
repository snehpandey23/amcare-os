# CAPR.AI Phase 0 Baseline

## Care Setting Assumptions
- Primary care first with behavioral-health-ready workflows.
- SMB practices (1-50 providers) are the launch segment.
- Hybrid model: overlay existing EHRs while owning workflow orchestration.

## Data Classification Matrix
| Class | Examples | Controls |
| --- | --- | --- |
| PHI-Clinical | Diagnoses, notes, medications, labs, vitals | Encryption at rest/in transit, strict RBAC, full audit logging |
| PHI-Administrative | Appointments, claims tasks, payer details | Tenant isolation, least-privilege access, retention policy |
| PII | Names, phone, address, DOB | Masked exports, scoped access, breach monitoring |
| Operational Metadata | Queue states, workflow status, connector health | Segregated logs, redaction of identifiers |

## Role Matrix (Minimum Necessary)
| Role | Clinical Chart | Billing/Claims | Messaging | Admin Config | Audit Review |
| --- | --- | --- | --- | --- | --- |
| Admin | Read/limited write | Read/write | Read/write | Full | Read |
| Clinician | Read/write assigned patients | Read | Read/write | None | Read own access |
| Staff | Read demographics/scheduling | Limited write claim tasks | Read/write operational | Limited | None |
| Billing | Read demographics/coverage | Read/write | Read operational | None | Read billing events |
| Patient | Read own summary | Read own invoices | Read/write own thread | None | None |

## Compliance Baseline Controls
- HIPAA-aligned safeguards with tenant-scoped access checks on every API path.
- Immutable audit events for PHI read/write/export actions.
- Break-glass access requires reason + elevated log severity.
- Signed notes are append-only with amendment records.
- AI-generated output is draft-only until explicit clinician approval.

## Threat Model Priorities
- Unauthorized cross-tenant data access.
- PHI leakage in logs/prompts.
- Over-automation without human approval for clinical/billing outcomes.
- Connector sync conflicts causing unsafe stale data.

## Launch KPIs
- Chart completion time per encounter.
- Prior auth turnaround and approval rate.
- Claim task resolution time.
- Patient message response latency.
- AI suggestion override rate.
