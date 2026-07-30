/**
 * SiyaOS Knowledge architecture — types shared by API and (mirrored) staff app.
 * User-facing pillar name: Memory. System name: Knowledge.
 */

/** Capture → Verify → Promote → Connect → Retrieve → Apply → Learn */
export type KnowledgePipelineStage =
  | "capture"
  | "verify"
  | "promote"
  | "connect"
  | "retrieve"
  | "apply"
  | "learn";

export type KnowledgeLayer = 0 | 1 | 2 | 3;

export type KnowledgeLifecycle =
  | "captured"
  | "verified"
  | "promoted"
  | "linked"
  | "archived";

/** Every knowledge artifact must answer these four (explicit or derived). */
export type KnowledgeFourQuestions = {
  whatHappened: string;
  whyItMatters: string;
  whatChanged: string;
  actionHook: string | null;
};

export type DecisionStatus = "idea" | "draft" | "active" | "superseded";

export type KnowledgeLinkRel =
  | "supersedes"
  | "relates_to"
  | "implements"
  | "evidence_for"
  | "owned_by"
  | "derived_from"
  | "grounded_in"
  | "parent_of"
  | "child_of";

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
  ownerUserId: string | null;
  department: string | null;
  decisionDate: string | null;
  importance: 1 | 2 | 3;
  confidence: number;
  status: DecisionStatus;
  supersedesId: string | null;
  parentConstitutionId: string | null;
  halfLifeDays: number | null;
  reviewDue: boolean;
  evidence: string | null;
  lifecycle: KnowledgeLifecycle;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeLink = {
  id: string;
  fromId: string;
  toId: string;
  relType: KnowledgeLinkRel;
  createdAt: string;
};

export function parseDecisionStatus(raw: unknown): DecisionStatus {
  const s = typeof raw === "string" ? raw : "";
  if (s === "idea" || s === "draft" || s === "active" || s === "superseded") return s;
  return "active";
}

export function parseConfidence(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function decisionToFourQuestions(d: Pick<
  DecisionRecord,
  "title" | "decisionText" | "reason" | "whatChanged" | "actionHook"
>): KnowledgeFourQuestions {
  return {
    whatHappened: `${d.title}: ${d.decisionText}`.trim(),
    whyItMatters: d.reason?.trim() || "—",
    whatChanged: d.whatChanged?.trim() || "—",
    actionHook: d.actionHook?.trim() || null,
  };
}

export const PIPELINE_STAGES: { stage: KnowledgePipelineStage; label: string; hint: string }[] = [
  { stage: "capture", label: "Capture", hint: "Layer 3 memory — abundant, mostly ephemeral" },
  { stage: "verify", label: "Verify", hint: "Owner confirms accuracy" },
  { stage: "promote", label: "Promote", hint: "Earn permanence — constitution, decisions, canonical" },
  { stage: "connect", label: "Connect", hint: "No orphans — parent, related, lineage" },
  { stage: "retrieve", label: "Retrieve", hint: "Search and reconstruct with evidence" },
  { stage: "apply", label: "Apply", hint: "Ask, workflows, hooks — retrieval is not the goal" },
  { stage: "learn", label: "Learn", hint: "Application produces new capture; loop closes" },
];
