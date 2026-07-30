export type SopStatus = "draft" | "pending_review" | "live" | "needs_review";

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
  ownerUserId: string;
  ownerName: string | null;
  reviewDate: string | null;
  halfLifeDays: number;
  reviewerComment: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
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
  live: "Live",
  needs_review: "Needs review",
};
