import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { notifyFeedbackReceived } from "@/lib/feedback-received-email";

export const maxDuration = 30;

type DirectoryPerson = {
  id: string;
  name: string | null;
  email: string;
};

/**
 * Same-origin BFF: proxy feedback submit to auth API, then Resend recipient notification
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

  const recipientUserId = typeof body.recipientUserId === "string" ? body.recipientUserId : "";

  const res = await fetch(`${base}/api/team-feedback`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    recipientFacing?: { id: string };
    error?: string;
    status?: string;
  };
  if (!res.ok) {
    return Response.json({ error: data.error || "Submit failed" }, { status: res.status });
  }

  let email: { sent: boolean; error?: string; to?: string[]; id?: string } | null = null;
  try {
    const meRes = await fetch(`${base}/api/auth/me`, { headers: { Authorization: auth } });
    const me = (await meRes.json().catch(() => ({}))) as { id?: string };
    if (me.id && recipientUserId && me.id === recipientUserId) {
      email = { sent: false, error: "skipped_self", to: [] };
    } else {
      const dirRes = await fetch(`${base}/api/team-feedback/directory`, { headers: { Authorization: auth } });
      const dir = (await dirRes.json().catch(() => ({}))) as {
        peers?: DirectoryPerson[];
        leads?: DirectoryPerson[];
      };
      const person = [...(dir.peers || []), ...(dir.leads || [])].find((p) => p.id === recipientUserId);
      email = await notifyFeedbackReceived({
        recipientEmail: person?.email,
        recipientName: person?.name,
      });
    }
  } catch (err) {
    console.error("[team-feedback-bff] notify failed", err);
    email = { sent: false, error: err instanceof Error ? err.message : "notify failed" };
  }

  return Response.json(
    {
      ok: data.ok ?? true,
      status: data.status,
      recipientFacing: data.recipientFacing,
      email,
    },
    { status: 201 },
  );
}
