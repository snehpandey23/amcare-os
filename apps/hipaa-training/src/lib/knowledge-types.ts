export const PROMOTION_RULE =
  "Most things aren't worth promoting. Knowledge must earn permanence.";

/** Sole approver for promoting into Policies & Knowledge until a named Editor in Chief exists. */
export const KNOWLEDGE_STEWARD = "Founder (Knowledge Steward)";

export const PROMOTE_QUESTIONS = [
  "What happened?",
  "Why does it matter?",
  "What changed because of it?",
  "Can the system act on it later? (actionHook)",
] as const;

export const KNOWLEDGE_LAYERS = [
  { layer: 0, name: "The Siya Way", hint: "Timeless principles — half-life: forever" },
  { layer: 1, name: "Policies & requirements", hint: "Company policy — HIPAA, PHI, leave, reimbursement" },
  { layer: 2, name: "Knowledge", hint: "SOPs, playbooks, decisions — how to execute" },
  { layer: 3, name: "Memory", hint: "Captures — rarely promoted" },
] as const;

export const PIPELINE_STAGES = [
  { stage: "capture", label: "Capture", hint: "Layer 3" },
  { stage: "verify", label: "Verify", hint: "Confirm" },
  { stage: "promote", label: "Promote", hint: "Earn permanence" },
  { stage: "connect", label: "Connect", hint: "No orphans" },
  { stage: "retrieve", label: "Retrieve", hint: "Way → Laws → Knowledge → Memory" },
  { stage: "apply", label: "Apply", hint: "Use in work" },
  { stage: "learn", label: "Learn", hint: "New capture" },
] as const;

export type ConstitutionEntry = {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string;
  halfLife: "forever" | number;
  confidence: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PolicyRequirement = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  ownerName: string;
  ownerContact: string | null;
  reviewDate: string;
  halfLifeDays: number;
  status: string;
  supersedesId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DecisionRecord = {
  id: string;
  authorUserId: string;
  authorName: string | null;
  title: string;
  decisionText: string;
  reason: string | null;
  whatChanged: string | null;
  actionHook: string | null;
  ownerName: string | null;
  department: string | null;
  decisionDate: string | null;
  importance: 1 | 2 | 3;
  confidence: number;
  status: string;
  supersedesId: string | null;
  parentConstitutionId: string | null;
  halfLifeDays: number | null;
  reviewDue: boolean;
  evidence: string | null;
  createdAt: string;
  updatedAt: string;
};
