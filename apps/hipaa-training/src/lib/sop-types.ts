export type SopStatus = "draft" | "pending_review" | "draft_live" | "live" | "needs_review";
export type SopRiskTier = 1 | 2 | 3;

export const SOP_DEPARTMENTS = [
  "Accounts",
  "HR",
  "Marketing",
  "Clinical Operations",
  "Compliance",
  "Technology",
  "Leadership",
  "General",
] as const;

export type SopTaskType = "create_sop" | "update_sop";

export type SopRecord = {
  id: string;
  department: string;
  title: string;
  body: string;
  keywords: string[];
  status: SopStatus;
  riskTier?: SopRiskTier;
  ownerUserId: string;
  ownerName: string | null;
  reviewDate: string | null;
  halfLifeDays: number;
  reviewerComment: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedByUserId?: string | null;
  approvedByName?: string | null;
  approvedByRole?: string | null;
  createdAt: string;
  updatedAt: string;
  aiDrafted?: boolean;
};

export type SopTaskRecord = {
  id: string;
  department: string;
  taskType: SopTaskType;
  title: string;
  sopId: string | null;
  assigneeUserId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  status: "open" | "done";
  createdAt: string;
};

export type DepartmentLead = {
  department: string;
  departmentSlug: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
};

export const SOP_STATUS_LABEL: Record<SopStatus, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  draft_live: "Active draft",
  live: "Live",
  needs_review: "Needs review",
};

export const SOP_RISK_TIER_LABEL: Record<SopRiskTier, string> = {
  1: "Tier 1 · process",
  2: "Tier 2 · billing",
  3: "Tier 3 · clinical / compliance",
};

export function inferSopRiskTier(department: string, title: string, body: string): SopRiskTier {
  let tier: SopRiskTier = 1;
  if (department === "Accounts") tier = 2;
  if (
    department === "Clinical Operations" ||
    department === "Compliance" ||
    department === "Leadership" ||
    department === "General"
  ) {
    tier = 3;
  }
  const blob = `${title}\n${body}`.toLowerCase();
  // Patient-facing operational workflows (booking, eligibility, MA chat) — never T1.
  if (
    /\b(patient workflow|payment collection|eligibility review|chat quality|patient communication chats|carepatron)\b/.test(
      blob,
    ) ||
    /\b(discovery call|meet & greet|meet and greet)\b/.test(blob)
  ) {
    tier = 3;
  }
  const clinicalSafety =
    /\b(suicid|patient safety|de-escalat|verbally abusive|prescri|controlled.?substance|\bcsa\b|\buds\b)\b/.test(blob);
  const hipaaCore = /\b(phi|hipaa)\b/.test(blob) && department !== "Accounts";
  if (clinicalSafety || hipaaCore) {
    tier = 3;
  }
  if (/\b(refund|chargeback|reimburs|invoice|klarity billing)\b/.test(blob) && tier < 2) {
    tier = 2;
  }
  return tier;
}
