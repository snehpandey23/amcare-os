import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { notifyTaskAssigned } from "@/lib/task-assignment-email";

export const maxDuration = 30;

type TaskPayload = {
  id: string;
  title: string;
  dueDate?: string;
  assigneeId: string;
  assigneeEmail?: string | null;
  assigneeName?: string | null;
  assignedByName?: string | null;
};

/**
 * Same-origin BFF: proxy task PATCH; Resend when assignee changes.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }
  const base = getTrainingApiUrl();
  if (!base) return Response.json({ error: "API not configured" }, { status: 503 });

  const { id } = await ctx.params;
  const bodyText = await req.text();
  let body: Record<string, unknown> = {};
  try {
    body = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const nextAssigneeId = typeof body.assigneeId === "string" ? body.assigneeId : null;
  let previousAssigneeId: string | null = null;
  if (nextAssigneeId) {
    const prevRes = await fetch(`${base}/api/tasks/${encodeURIComponent(id)}`, {
      headers: { Authorization: auth },
    });
    const prevData = (await prevRes.json().catch(() => ({}))) as { task?: TaskPayload };
    previousAssigneeId = prevData.task?.assigneeId ?? null;
  }

  const res = await fetch(`${base}/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { task?: TaskPayload; error?: string };
  if (!res.ok) {
    return Response.json({ error: data.error || "Update failed" }, { status: res.status });
  }

  let email: { sent: boolean; error?: string; to?: string[]; id?: string } | null = null;
  try {
    const task = data.task;
    const reassigned = Boolean(nextAssigneeId && previousAssigneeId && nextAssigneeId !== previousAssigneeId);
    if (task && reassigned) {
      const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: auth } });
      const me = (await meRes.json().catch(() => ({}))) as { name?: string };
      email = await notifyTaskAssigned({
        title: task.title,
        dueDate: task.dueDate,
        assigneeEmail: task.assigneeEmail,
        assigneeName: task.assigneeName,
        assignerName: me.name || task.assignedByName || null,
        kind: "reassigned",
      });
    } else {
      email = { sent: false, error: reassigned ? "no_task" : "skipped_no_reassign", to: [] };
    }
  } catch (err) {
    console.error("[tasks-bff] patch notify failed", err);
    email = { sent: false, error: err instanceof Error ? err.message : "notify failed" };
  }

  return Response.json({ task: data.task, email });
}
