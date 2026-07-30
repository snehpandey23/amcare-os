export type TaskStatus = "todo" | "in_progress" | "done" | "overdue" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskType = "sop" | "adhoc";

export type ChecklistInstanceItem = {
  id: string;
  label: string;
  isChecked: boolean;
  checkedAt: string | null;
};

export type TaskRecord = {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  sourceSopTemplateId: string | null;
  assigneeId: string;
  assignedBy: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  dueTime: string | null;
  checklistItems: ChecklistInstanceItem[];
  notes: { userId: string; text: string; createdAt: string }[];
  completedAt: string | null;
  completedBy: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  assignedByName?: string | null;
};

export type SopTemplateRecord = {
  id: string;
  title: string;
  description: string;
  recurrence: string;
  recurrenceConfig: Record<string, unknown>;
  checklistItems: { id: string; label: string; order: number }[];
  assignedToUserId: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type MyTasksResponse = {
  date: string;
  tasks: TaskRecord[];
  sop: TaskRecord[];
  adhoc: TaskRecord[];
};

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-800",
  medium: "bg-blue-50 text-blue-900",
  high: "bg-amber-50 text-amber-950",
  urgent: "bg-red-50 text-red-900",
};

export function priorityBadgeClass(p: TaskPriority): string {
  return PRIORITY_STYLE[p] ?? PRIORITY_STYLE.medium;
}

export function formatDueTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = Number(h);
  if (!Number.isFinite(hour)) return t;
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m ?? "00"} ${ampm}`;
}

export function taskIsComplete(t: TaskRecord): boolean {
  if (t.status === "done" || t.status === "cancelled") return true;
  if (t.checklistItems.length > 0) return t.checklistItems.every((c) => c.isChecked);
  return false;
}

export function boardColumn(status: TaskStatus): "todo" | "in_progress" | "done" {
  if (status === "done" || status === "cancelled") return "done";
  if (status === "in_progress") return "in_progress";
  return "todo";
}
