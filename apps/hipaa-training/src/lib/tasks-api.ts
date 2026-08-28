import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import type { MyTasksResponse, SopTemplateRecord, TaskRecord, TaskStatus } from "@/lib/tasks-types";

async function taskFetch(path: string, init?: RequestInit) {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

/** Same-origin BFF — proxies auth API and sends Resend assignment emails. */
async function staffPortalTaskFetch(path: string, init?: RequestInit) {
  const token = getStoredToken();
  if (!token) throw new Error("Sign in required.");
  const res = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchMyTasks(date = "today"): Promise<MyTasksResponse> {
  return (await taskFetch(`/api/tasks/me?date=${encodeURIComponent(date)}`)) as MyTasksResponse;
}

export async function fetchTaskBoard(params: Record<string, string>): Promise<TaskRecord[]> {
  const q = new URLSearchParams(params);
  const data = (await taskFetch(`/api/tasks/board?${q}`)) as { tasks: TaskRecord[] };
  return data.tasks ?? [];
}

export async function fetchTask(id: string): Promise<TaskRecord> {
  const data = (await taskFetch(`/api/tasks/${id}`)) as { task: TaskRecord };
  return data.task;
}

export async function patchTask(
  id: string,
  patch: {
    status?: TaskStatus;
    assigneeId?: string;
    dueDate?: string;
    dueTime?: string | null;
    priority?: string;
  },
): Promise<TaskRecord> {
  // Reassign goes through BFF so Resend can notify the new assignee.
  if (patch.assigneeId) {
    const data = (await staffPortalTaskFetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    })) as { task: TaskRecord };
    return data.task;
  }
  const data = (await taskFetch(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(patch) })) as {
    task: TaskRecord;
  };
  return data.task;
}

export async function toggleTaskChecklistItem(
  taskId: string,
  itemId: string,
  checked?: boolean,
): Promise<TaskRecord> {
  const data = (await taskFetch(`/api/tasks/${taskId}/checklist-item/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(checked === undefined ? {} : { checked }),
  })) as { task: TaskRecord };
  return data.task;
}

export async function createAdhocTask(payload: {
  title: string;
  description?: string;
  assigneeId: string;
  priority?: string;
  dueDate?: string;
  dueTime?: string;
  checklistItems?: { id: string; label: string; isChecked: boolean; checkedAt: string | null }[];
}): Promise<TaskRecord> {
  const data = (await staffPortalTaskFetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { task: TaskRecord };
  return data.task;
}

export async function fetchSopTemplates(): Promise<SopTemplateRecord[]> {
  const data = (await taskFetch("/api/admin/sop-templates")) as { templates: SopTemplateRecord[] };
  return data.templates ?? [];
}

export async function createSopTemplate(payload: Record<string, unknown>): Promise<SopTemplateRecord> {
  const data = (await taskFetch("/api/admin/sop-templates", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { template: SopTemplateRecord };
  return data.template;
}

export async function patchSopTemplate(id: string, payload: Record<string, unknown>): Promise<SopTemplateRecord> {
  const data = (await taskFetch(`/api/admin/sop-templates/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })) as { template: SopTemplateRecord };
  return data.template;
}

export async function fetchTemplatePreview(id: string): Promise<string[]> {
  const data = (await taskFetch(`/api/admin/sop-templates/${id}/preview`)) as { dates: string[] };
  return data.dates ?? [];
}

export const myTasksKey = (date = "today") => ["tasks", "me", date] as const;
export const taskBoardKey = (params: Record<string, string>) => ["tasks", "board", params] as const;
