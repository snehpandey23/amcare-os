import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { reviewChecklistSopDraft } from "@/lib/sop-submit-feedback";

export const maxDuration = 60;

/** Pre-submit AI feedback for AI checklist SOP Builder — not a gate. */
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
  const description = typeof o.description === "string" ? o.description.trim() : "";
  const stepsRaw = Array.isArray(o.steps) ? o.steps : [];
  const steps = stepsRaw
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .slice(0, 40);
  if (!title || !steps.length) {
    return Response.json({ error: "title and steps required" }, { status: 400 });
  }

  let liveSamples: { title: string; body: string }[] = [];
  try {
    const res = await fetch(`${base}/api/admin/sop-templates`, {
      headers: { Authorization: auth },
    });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        templates?: { title: string; description?: string | null }[];
      };
      liveSamples = (data.templates ?? []).slice(0, 8).map((t) => ({
        title: t.title,
        body: t.description || "",
      }));
    }
  } catch {
    liveSamples = [];
  }

  const result = await reviewChecklistSopDraft({ title, description, steps, liveSamples });
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
