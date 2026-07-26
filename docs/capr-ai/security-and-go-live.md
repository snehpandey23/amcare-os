# CAPR.AI Security and Go-Live Checklist

## Security Validation
- Enforce tenant boundaries by `x-org-id` on every API request path.
- Verify RBAC via header role permutations before release.
- Review audit stream completeness for create/read/update actions on PHI.
- Ensure AI suggestions require explicit approval before finalization.
- Confirm secrets are loaded from environment (never hard-coded).

## Reliability and Operations
- Health endpoint monitored: `/api/health`.
- Define SLO baseline: API p95 latency < 400ms for standard routes.
- Incident process: triage, containment, communication, remediation log.
- Daily backup/restore test plan for persistence layer (next persistence increment).

## Pilot Rollout Plan
- Pilot cohort: 1-2 clinics, mixed operational and clinical workflows.
- Enable only 7 launch agents with conservative confidence thresholds.
- Weekly review of override rate and adverse automation events.
- Exit criteria:
  - No severe security incidents.
  - Audit completeness > 99% for sampled PHI events.
  - Suggestion approval safety checks pass in pilot review.
