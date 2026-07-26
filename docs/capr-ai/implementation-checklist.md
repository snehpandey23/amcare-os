# CAPR.AI MVP Implementation Checklist

## Phase 1 Foundation
- [x] New shared EMR contracts package: `@amcare/emr-core`
- [x] API service scaffold: `integrations/capr-emr-api`
- [x] Clinician web surface scaffold: `apps/capr-emr`
- [x] Tenant, role, and access checks in API middleware
- [x] Audit event creation for PHI-centric operations

## Phase 2 Clinical Core
- [x] Patient chart shell endpoints and UI listing
- [x] Encounter creation endpoint
- [x] AI note drafting endpoint with clinician approval requirement
- [x] Signed-note endpoint for explicit finalization

## Phase 3 Practice Ops
- [x] Appointment endpoints
- [x] Task queue endpoints (manual + automation source tracking)
- [x] Basic ops dashboard cards and queue visualization
- [x] Rule-based lab automation trigger endpoint

## Phase 4 Patient Engagement
- [x] Message thread creation endpoint with channel support
- [ ] Full patient/caregiver portal UI (next increment)
- [ ] Attachment pipeline and patient auth flows (next increment)

## Phase 5 AI + Automation
- [x] 7-agent suggestion model and queue endpoint
- [x] Suggestion approval endpoint with audit event
- [x] Confidence and approval metadata captured
- [ ] Model-specific routing and safety evaluator service (next increment)

## Phase 6 Hardening
- [x] Service health endpoint
- [x] Event logging for security/compliance review
- [ ] Integration conformance tests (FHIR/HL7)
- [ ] Load/perf and incident runbook exercises
