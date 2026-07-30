import type { SopDepartment, SopTaskType } from "./sop-store.js";

/** Meeting-derived ops pack — upserted into Knowledge SOP tasks (+ optional draft SOP bodies). */
export type OperationalSopTaskDef = {
  id: string;
  department: SopDepartment;
  taskType: SopTaskType;
  title: string;
  draftSopTitle: string;
  draftSopBody: string;
};

export const OPERATIONAL_SOP_PACK: OperationalSopTaskDef[] = [
  {
    id: "task-pack-marketing-zocdoc-narrative",
    department: "Marketing",
    taskType: "create_sop",
    title: "Zocdoc & listing narrative alignment — draft SOP",
    draftSopTitle: "Zocdoc and directory listing narrative (visit types & claims)",
    draftSopBody: `# Purpose
Keep Zocdoc, Google, and site listings aligned so visit types and marketing claims match what clinicians actually offer.

# Scope
- Visit types shown on Zocdoc vs. internal scheduling templates
- ADHD / Rx language on listings vs. site and compliance-approved copy
- Paid ads and landing pages vs. live booking paths

# Lead checklist
1. Export current Zocdoc visit types and compare to siyahealth.com service pages.
2. Flag any Rx-forward or ADHD-specific claims not approved on the public site.
3. Document the approved narrative per service line (what we say / what we do not say).
4. Open a change ticket for mismatches before scaling ad spend.
5. Submit this SOP for admin review when the narrative doc is complete.

# Escalation
Compliance + Leadership if a listing must change patient-facing clinical claims.`,
  },
  {
    id: "task-pack-accounts-chargeback-refunds",
    department: "Accounts",
    taskType: "create_sop",
    title: "Chargeback & refund expectations — draft SOP",
    draftSopTitle: "Chargebacks, refunds, and patient billing expectations",
    draftSopBody: `# Purpose
Reduce preventable chargebacks by setting clear refund rules and escalation paths for frontline staff.

# Scope
- Self-pay visits, no-shows, partial refunds, duplicate charges
- When to escalate vs. resolve in-channel
- Documentation required before issuing a refund

# Lead checklist
1. List top chargeback reasons from the last 90 days (amount + visit type).
2. Define what patients are told at booking and in confirmation emails.
3. Write step-by-step: patient asks for refund → verify chart/payment → approve/deny criteria.
4. Add escalation to Compliance for disputed clinical care or HIPAA-sensitive threads.
5. Link reimbursement SOP once updated.

# Metrics
Track weekly chargeback count and dollars; target downward trend after SOP is live.`,
  },
  {
    id: "task-pack-clinical-scheduling-capacity",
    department: "Clinical Operations",
    taskType: "create_sop",
    title: "Provider scheduling & capacity ownership — draft SOP",
    draftSopTitle: "Scheduling capacity, PA priority, and bandwidth before scaling bookings",
    draftSopBody: `# Purpose
Clarify who owns provider calendars, how PA visits are prioritized, and when to pause new booking volume.

# Scope
- Named owners for each clinician’s open slots (e.g. leadership vs. ops vs. provider)
- PA / admin visit priority rules
- Bandwidth check before marketing or Zocdoc increases availability

# Lead checklist
1. Document current owners for each active provider’s schedule template.
2. Define PA-priority rules (same-day, refill, new patient) in one table.
3. Set a weekly bandwidth review: slots open vs. clinical load before campaigns go live.
4. Add handoff when a provider is out (who approves overflow / redirects).
5. Align with Marketing on “do not scale ads” triggers when capacity is below threshold.

# Escalation
Leadership when capacity blocks revenue or patient access for >48 hours.`,
  },
];
