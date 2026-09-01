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
 * Same-origin BFF: proxy task create to auth API, then Resend assignment email
 * (RESEND_API_KEY lives on siya-staff-assist, not the auth API).
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }
  const base = getTrainingApiUrl();
  if (!base) return Response.json({ error: "API not configured" }, { status: 503 });

  const bodyText = await req.text();
  let body: Record<string, unknown> = {};
  try {
    body = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : {};
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const res = await fetch(`${base}/api/tasks`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    task?: TaskPayload;
    error?: string;
    assignmentWarning?: string | null;
  };
  if (!res.ok) {
    return Response.json({ error: data.error || "Create failed" }, { status: res.status });
  }

  let email: { sent: boolean; error?: string; to?: string[]; id?: string } | null = null;
  try {
    const task = data.task;
    if (!task) {
      email = { sent: false, error: "no_task_in_response" };
    } else {
      const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: auth } });
      const me = (await meRes.json().catch(() => ({}))) as { id?: string; name?: string };
      if (me.id && task.assigneeId === me.id) {
        email = { sent: false, error: "skipped_self_assign", to: [] };
      } else {
        email = await notifyTaskAssigned({
          title: task.title,
          dueDate: task.dueDate,
          assigneeEmail: task.assigneeEmail,
          assigneeName: task.assigneeName,
          assignerName: task.assignedByName || me.name || null,
          kind: "created",
        });
      }
    }
  } catch (err) {
    console.error("[tasks-bff] create notify failed", err);
    email = { sent: false, error: err instanceof Error ? err.message : "notify failed" };
  }

  return Response.json(
    { task: data.task, email, assignmentWarning: data.assignmentWarning ?? null },
    { status: 201 },
  );
}
