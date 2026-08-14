import { getTrainingApiUrl } from "@/lib/trainingConfig";
import {
  notifySopApproved,
  notifySopSubmittedForReview,
} from "@/lib/sop-review-email";

export const maxDuration = 30;

/**
 * Proxy SOP Builder session PATCH so we can fire Resend on status transitions
 * (submitted → admins, published → submitter). Auth API still owns the mutation.
 */
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
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

  const { id } = await ctx.params;
  const res = await fetch(`${base}/api/sop-builder/sessions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as {
    session?: unknown;
    notify?: {
      kind: "builder_submitted" | "builder_published";
      ownerEmail: string | null;
      ownerName: string | null;
      adminEmails: string[];
      title: string;
    };
    error?: string;
  };
  if (!res.ok) {
    return Response.json({ error: data.error || "Update failed" }, { status: res.status });
  }

  let email: { sent: boolean; error?: string; to?: string[]; id?: string } | null = null;
  try {
    const n = data.notify;
    if (n?.kind === "builder_submitted") {
      console.info("[sop-builder-patch] firing submit notify", {
        title: n.title,
        adminCount: n.adminEmails?.length ?? 0,
      });
      email = await notifySopSubmittedForReview({
        title: n.title,
        department: "Clinical Operations",
        submitterName: n.ownerName || "A teammate",
        adminEmails: n.adminEmails ?? [],
        kind: "checklist",
      });
    } else if (n?.kind === "builder_published") {
      email = await notifySopApproved({
        title: n.title,
        ownerEmail: n.ownerEmail,
        ownerName: n.ownerName,
        kind: "checklist",
      });
    }
  } catch (err) {
    console.error("[sop-builder-patch] notify failed", err);
    email = { sent: false, error: err instanceof Error ? err.message : "notify failed" };
  }

  return Response.json({ session: data.session, email });
}
