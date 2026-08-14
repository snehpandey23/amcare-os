import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { notifySopSentBack } from "@/lib/sop-review-email";

export const maxDuration = 30;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }
  const base = getTrainingApiUrl();
  if (!base) return Response.json({ error: "API not configured" }, { status: 503 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const comment = typeof (body as { comment?: string })?.comment === "string"
    ? (body as { comment: string }).comment.trim()
    : "";
  if (!comment) return Response.json({ error: "comment required" }, { status: 400 });

  const { id } = await ctx.params;
  const res = await fetch(`${base}/api/admin/sops/${encodeURIComponent(id)}/send-back`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify({ comment }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    sop?: { id: string; title: string; reviewerComment?: string | null };
    notify?: { ownerEmail: string | null; ownerName: string | null };
    error?: string;
  };
  if (!res.ok) {
    return Response.json({ error: data.error || "Send back failed" }, { status: res.status });
  }

  let email: { sent: boolean; error?: string } | null = null;
  try {
    if (data.sop && data.notify) {
      email = await notifySopSentBack({
        title: data.sop.title,
        ownerEmail: data.notify.ownerEmail,
        ownerName: data.notify.ownerName,
        comment,
        sopId: data.sop.id,
      });
    }
  } catch (err) {
    console.error("[sop-send-back] notify failed", err);
    email = { sent: false, error: err instanceof Error ? err.message : "notify failed" };
  }

  return Response.json({ sop: data.sop, email });
}
