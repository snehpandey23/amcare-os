import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { reviewPolicySopDraft } from "@/lib/sop-submit-feedback";

export const maxDuration = 60;

/** Pre-submit AI feedback for Knowledge policy SOPs — not a gate. */
export async function POST(req: Request) {
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

  const o = body as Record<string, unknown>;
  const title = typeof o.title === "string" ? o.title.trim() : "";
  const draftBody = typeof o.body === "string" ? o.body.trim() : "";
  const department = typeof o.department === "string" ? o.department.trim() : "";
  if (!title || !draftBody || !department) {
    return Response.json({ error: "title, body, and department required" }, { status: 400 });
  }

  let liveSamples: { title: string; body: string }[] = [];
  try {
    const res = await fetch(
      `${base}/api/knowledge/sops?department=${encodeURIComponent(department)}&status=live`,
      { headers: { Authorization: auth } },
    );
    const data = (await res.json().catch(() => ({}))) as {
      sops?: { title: string; body: string }[];
    };
    liveSamples = (data.sops ?? []).map((s) => ({
      title: s.title,
      body: (s.body || "").slice(0, 1200),
    }));
  } catch {
    liveSamples = [];
  }

  const result = await reviewPolicySopDraft({ title, body: draftBody, department, liveSamples });
  if ("error" in result) {
    return Response.json(
      { error: result.error.userMessage, code: result.error.code, kind: result.error.kind },
      { status: 503 },
    );
  }
  const heuristic = Boolean(result.feedback.heuristicOnly);
  return Response.json({
    feedback: result.feedback,
    note: heuristic
      ? "Structure checklist (AI model unavailable) — still not a gate. Refine if needed, then submit for human approval."
      : "AI feedback only — you can Refine, then submit for human approval. This does not block submit.",
  });
}
