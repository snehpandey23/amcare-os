/**
 * Server-side fetch of live portal ops data (admin only). Used by /api/chat co-pilot.
 */

import { getTrainingApiUrl } from "@/lib/trainingConfig";
import type { MyTasksResponse, TaskRecord } from "@/lib/tasks-types";
import type { TeamPulse } from "@/lib/team-pulse-api";

export type AdminOpsRosterMember = {
  id: string;
  email: string;
  name: string | null;
};

export type AdminOpsSnapshot = {
  user: { id: string; email: string; name: string | null; role: string };
  date: string;
  myTasks: TaskRecord[];
  boardOpen: TaskRecord[];
  boardOverdue: TaskRecord[];
  pulse: TeamPulse | null;
  roster: AdminOpsRosterMember[];
};

async function apiGet<T>(token: string, path: string): Promise<T | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  const res = await fetch(`${base}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

/** Any signed-in staff — today’s assigned tasks (My day). */
export async function fetchMyTasksToday(
  token: string,
): Promise<{ date: string; tasks: TaskRecord[] } | null> {
  const myRes = await apiGet<MyTasksResponse>(token, "/api/tasks/me?date=today");
  if (!myRes) return null;
  return { date: myRes.date, tasks: myRes.tasks ?? [] };
}

export async function fetchAdminOpsSnapshot(token: string): Promise<AdminOpsSnapshot | null> {
  const me = await apiGet<{ id: string; email: string; name: string | null; role: string }>(
    token,
    "/api/auth/me",
  );
  if (!me || me.role !== "admin") return null;

  const [myRes, openBoard, overdueBoard, pulse, rosterRes] = await Promise.all([
    apiGet<MyTasksResponse>(token, "/api/tasks/me?date=today"),
    apiGet<{ tasks: TaskRecord[] }>(token, "/api/tasks/board?status=todo"),
    apiGet<{ tasks: TaskRecord[] }>(token, "/api/tasks/board?overdue=1"),
    apiGet<TeamPulse>(token, "/api/team/pulse"),
    apiGet<{ members: { id: string; email: string; name: string | null }[] }>(
      token,
      "/api/admin/team/roster",
    ),
  ]);

  const inProgress = await apiGet<{ tasks: TaskRecord[] }>(
    token,
    "/api/tasks/board?status=in_progress",
  );

  const boardOpen = [
    ...(openBoard?.tasks ?? []),
    ...(inProgress?.tasks ?? []),
  ].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);

  return {
    user: me,
    date: myRes?.date ?? new Date().toISOString().slice(0, 10),
    myTasks: myRes?.tasks ?? [],
    boardOpen,
    boardOverdue: overdueBoard?.tasks ?? [],
    pulse: pulse ?? null,
    roster: (rosterRes?.members ?? []).map((m) => ({ id: m.id, email: m.email, name: m.name })),
  };
}

export async function createTaskViaApi(
  token: string,
  payload: {
    title: string;
    assigneeId: string;
    priority?: string;
    dueDate?: string;
    description?: string;
  },
): Promise<TaskRecord | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  const res = await fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { task?: TaskRecord };
  const task = data.task ?? null;
  if (task?.assigneeEmail && task.assigneeId !== (await actorId(token, base))) {
    try {
      const { notifyTaskAssigned } = await import("@/lib/task-assignment-email");
      await notifyTaskAssigned({
        title: task.title,
        dueDate: task.dueDate,
        assigneeEmail: task.assigneeEmail,
        assigneeName: task.assigneeName,
        assignerName: task.assignedByName,
        kind: "created",
      });
    } catch (err) {
      console.error("[admin-ops] task assign notify failed", err);
    }
  }
  return task;
}

async function actorId(token: string, base: string): Promise<string | null> {
  const res = await fetch(`${base}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const me = (await res.json()) as { id?: string };
  return me.id ?? null;
}
