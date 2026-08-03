import { generateChecklistDraft, type SopBuilderTranscriptEntry } from "@/lib/sop-builder-assist";
import { apiFetch, requireSopBuilderAuth } from "@/lib/sop-builder-route-auth";

export const maxDuration = 60;

export async function POST(req: Request) {
  const authResult = await requireSopBuilderAuth(req);
  if (authResult instanceof Response) return authResult;
  const { auth } = authResult;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const sessionId = typeof (body as { sessionId?: string })?.sessionId === "string" ? (body as { sessionId: string }).sessionId : "";
  if (!sessionId) return Response.json({ error: "sessionId required" }, { status: 400 });

  const sessionData = (await apiFetch(auth, `/api/sop-builder/sessions/${sessionId}`)) as {
    session: {
      topic: string;
      transcript: SopBuilderTranscriptEntry[];
      sourceMaterialRefs: { sops?: unknown[]; kb?: unknown[] };
    };
  };
  const session = sessionData.session;

  const draft = await generateChecklistDraft({
    topic: session.topic,
    sourceRefs: {
      sops: (session.sourceMaterialRefs.sops ?? []) as { id: string; title: string; snippet: string }[],
      kb: (session.sourceMaterialRefs.kb ?? []) as { id: string; title: string; snippet: string }[],
    },
    transcript: session.transcript,
  });
  if (!draft) {
    return Response.json(
      { error: "Draft generation failed (LLM off or invalid output)", code: "llm_unavailable" },
      { status: 503 },
    );
  }

  const draftJson = {
    ...draft,
    checklistItems: draft.checklistItems.map((it, i) => ({
      id: `ci-${i}-${Date.now()}`,
      label: it.label,
      order: it.order,
    })),
  };

  const updated = (await apiFetch(auth, `/api/sop-builder/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ draftJson, status: "draft_ready" }),
  })) as { session: unknown };

  return Response.json({ session: updated.session, draft: draftJson });
}
