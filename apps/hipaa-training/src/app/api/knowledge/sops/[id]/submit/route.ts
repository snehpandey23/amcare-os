import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { notifySopSubmittedForReview } from "@/lib/sop-review-email";

export const maxDuration = 30;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Sign in required" }, { status: 401 });
  }
  const base = getTrainingApiUrl();
  if (!base) return Response.json({ error: "API not configured" }, { status: 503 });

  const { id } = await ctx.params;
  const res = await fetch(`${base}/api/knowledge/sops/${encodeURIComponent(id)}/submit`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: "{}",
  });
  const data = (await res.json().catch(() => ({}))) as {
    sop?: {
      id: string;
      title: string;
      department: string;
      ownerName: string | null;
    };
    notify?: {
      ownerEmail: string | null;
      ownerName: string | null;
      adminEmails: string[];
      reviewerEmails?: string[];
      approvalMode?: string;
    };
    error?: string;
  };
  if (!res.ok) {
    return Response.json({ error: data.error || "Submit failed" }, { status: res.status });
  }

  // Fail-soft: never block submit if email fails — but always attempt + report.
  let email: { sent: boolean; error?: string; to?: string[]; id?: string } | null = null;
  try {
    if (!data.sop) {
      email = { sent: false, error: "no_sop_in_response" };
    } else {
      console.info("[sop-submit] firing review notify", {
        sopId: data.sop.id,
        adminCount: data.notify?.adminEmails?.length ?? 0,
        reviewerCount: data.notify?.reviewerEmails?.length ?? 0,
        approvalMode: data.notify?.approvalMode,
        hasNotifyMeta: Boolean(data.notify),
      });
      email = await notifySopSubmittedForReview({
        title: data.sop.title,
        department: data.sop.department,
        submitterName: data.notify?.ownerName || data.sop.ownerName || "A teammate",
        adminEmails: data.notify?.adminEmails ?? [],
        reviewerEmails: data.notify?.reviewerEmails,
        kind: "policy",
      });
    }
  } catch (err) {
    console.error("[sop-submit] notify failed", err);
    email = { sent: false, error: err instanceof Error ? err.message : "notify failed" };
  }

  return Response.json({ sop: data.sop, email });
}
