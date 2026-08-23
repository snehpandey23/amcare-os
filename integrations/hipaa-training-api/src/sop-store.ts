/** Knowledge layer — department SOPs (8 departments, v1 help-desk taxonomy). */

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

export type SopDepartment = (typeof SOP_DEPARTMENTS)[number];

export type SopStatus = "draft" | "pending_review" | "draft_live" | "live" | "needs_review";

/** 1 = marketing/internal process · 2 = billing/accounts · 3 = clinical/compliance/patient-facing */
export type SopRiskTier = 1 | 2 | 3;

export type SopTaskType = "create_sop" | "update_sop";

export type SopTaskStatus = "open" | "done";

export function departmentToSlug(dept: string): string {
  return dept
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export function slugToDepartment(slug: string): SopDepartment | null {
  for (const d of SOP_DEPARTMENTS) {
    if (departmentToSlug(d) === slug) return d;
  }
  return null;
}

export function parseSopStatus(raw: unknown): SopStatus {
  const s = typeof raw === "string" ? raw : "";
  if (s === "draft" || s === "pending_review" || s === "draft_live" || s === "live" || s === "needs_review") return s;
  return "draft";
}

export function parseSopRiskTier(raw: unknown): SopRiskTier {
  const n = Number(raw);
  if (n === 1 || n === 2 || n === 3) return n;
  return 2;
}

/**
 * Risk tier: department default, content may only raise (never lower).
 * T1 marketing/HR/tech process · T2 accounts/billing · T3 clinical/compliance/patient-care.
 */
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
  // Accounts may mention HIPAA in an escalation line without becoming a compliance SOP.
  const hipaaCore = /\b(phi|hipaa)\b/.test(blob) && department !== "Accounts";
  if (clinicalSafety || hipaaCore) {
    tier = 3;
  }
  if (/\b(refund|chargeback|reimburs|invoice|klarity billing)\b/.test(blob) && tier < 2) {
    tier = 2;
  }
  return tier;
}

export type DepartmentLead = {
  department: SopDepartment;
  departmentSlug: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
};

export type SopRecord = {
  id: string;
  department: SopDepartment;
  title: string;
  body: string;
  keywords: string[];
  status: SopStatus;
  riskTier: SopRiskTier;
  ownerUserId: string;
  ownerName: string | null;
  reviewDate: string | null;
  halfLifeDays: number;
  reviewerComment: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  approvedByUserId: string | null;
  approvedByName: string | null;
  approvedByRole: string | null;
  createdAt: string;
  updatedAt: string;
  /** Internal — admin review queue only; not used in Ask retrieval. */
  aiDrafted?: boolean;
};

export type SopTaskRecord = {
  id: string;
  department: SopDepartment;
  taskType: SopTaskType;
  title: string;
  sopId: string | null;
  assigneeUserId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  status: SopTaskStatus;
  createdAt: string;
};

export const SOP_TASK_SEED: { department: SopDepartment; taskType: SopTaskType; title: string }[] = [
  { department: "HR", taskType: "create_sop", title: "Onboarding SOP — unassigned" },
  { department: "Accounts", taskType: "update_sop", title: "Reimbursement workflow — unassigned" },
  { department: "Marketing", taskType: "create_sop", title: "Pre-publish content QA — unassigned" },
  { department: "Clinical Operations", taskType: "update_sop", title: "Chat review SLA — unassigned" },
];

/** Strip internal fields before staff-facing knowledge API responses. */
export function sopForStaffApi(s: SopRecord): Omit<SopRecord, "aiDrafted"> {
  const { aiDrafted: _omit, ...rest } = s;
  return rest;
}

export function sopsForStaffApi(list: SopRecord[]): Omit<SopRecord, "aiDrafted">[] {
  return list.map(sopForStaffApi);
}

export function sopRetrievalTitle(s: SopRecord): string {
  if (s.status === "draft_live") return `[Active draft] ${s.title}`;
  if (s.status === "needs_review") return `[Needs Review] ${s.title}`;
  return s.title;
}
