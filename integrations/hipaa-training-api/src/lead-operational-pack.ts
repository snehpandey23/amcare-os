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

/**
 * Packs removed from active seed install because real team SOPs now cover the topic.
 * `ensureOperationalSopPack` will not re-create these; `retireDuplicateSeedPacks` closes
 * any leftover seed task + `sop-pack-*` draft/pending rows.
 *
 * Do **not** auto-merge or delete team-authored duplicates — founder picks a canonical SOP.
 */
export const RETIRED_OPERATIONAL_PACK_IDS = [
  "task-pack-marketing-zocdoc-narrative",
  "task-pack-accounts-chargeback-refunds",
] as const;

/**
 * Team-authored Zocdoc SOP cluster (not seed) — founder must pick one canonical version.
 * Surfaced on Ops as a consolidation flag only; never auto-deleted.
 */
export const FOUNDER_ZOCDOC_TEAM_CONSOLIDATION_FLAG = {
  id: "founder-flag-zocdoc-team-duplicates",
  topic: "Zocdoc & listing narrative",
  department: "Marketing",
  titleMatch: /zocdoc/i,
  action:
    "Pick one canonical team-authored Zocdoc SOP and consolidate the rest. Do not auto-merge or auto-delete.",
} as const;

/** Active meeting-derived seeds (Expense stays in audit pack until team reimbursement is live). */
export const OPERATIONAL_SOP_PACK: OperationalSopTaskDef[] = [
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
