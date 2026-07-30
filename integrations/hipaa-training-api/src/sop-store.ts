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

export type SopStatus = "draft" | "pending_review" | "live" | "needs_review";

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
  if (s === "draft" || s === "pending_review" || s === "live" || s === "needs_review") return s;
  return "draft";
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
  ownerUserId: string;
  ownerName: string | null;
  reviewDate: string | null;
  halfLifeDays: number;
  reviewerComment: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
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
  if (s.status === "pending_review") return `[Pending Review] ${s.title}`;
  if (s.status === "needs_review") return `[Needs Review] ${s.title}`;
  return s.title;
}
