/** Daily Tasks & SOP checklists (operational layer — separate from Knowledge SOPs). */

export type TaskRecurrence = "daily" | "weekly" | "monthly" | "custom_cron";

export type TaskStatus = "todo" | "in_progress" | "done" | "overdue" | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskType = "sop" | "adhoc";

export type ChecklistTemplateItem = {
  id: string;
  label: string;
  order: number;
};

export type ChecklistInstanceItem = {
  id: string;
  label: string;
  isChecked: boolean;
  checkedAt: string | null;
};

export type TaskComment = {
  userId: string;
  text: string;
  createdAt: string;
};

export type RecurrenceConfig = {
  daysOfWeek?: number[];
  dayOfMonth?: number;
  timeOfDay?: string;
  cron?: string;
};

export type SopTemplateRecord = {
  id: string;
  title: string;
  description: string;
  recurrence: TaskRecurrence;
  recurrenceConfig: RecurrenceConfig;
  checklistItems: ChecklistTemplateItem[];
  assignedToUserId: string;
  active: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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
  notes: TaskComment[];
  completedAt: string | null;
  completedBy: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  assignedByName?: string | null;
};

export function parseTaskStatus(raw: unknown): TaskStatus {
  const s = typeof raw === "string" ? raw : "";
  if (s === "todo" || s === "in_progress" || s === "done" || s === "overdue" || s === "cancelled") return s;
  if (s === "blocked") return "todo";
  return "todo";
}

export function parseTaskPriority(raw: unknown): TaskPriority {
  const s = typeof raw === "string" ? raw : "";
  if (s === "low" || s === "medium" || s === "high" || s === "urgent") return s;
  return "medium";
}

export function newChecklistInstance(template: ChecklistTemplateItem[]): ChecklistInstanceItem[] {
  return [...template]
    .sort((a, b) => a.order - b.order)
    .map((t) => ({
      id: t.id,
      label: t.label,
      isChecked: false,
      checkedAt: null,
    }));
}

export function taskIsComplete(t: TaskRecord): boolean {
  if (t.status === "done" || t.status === "cancelled") return true;
  if (t.checklistItems.length > 0) return t.checklistItems.every((c) => c.isChecked);
  return false;
}
