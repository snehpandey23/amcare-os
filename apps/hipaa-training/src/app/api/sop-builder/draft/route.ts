import { generateChecklistDraft, SopBuilderLlmError, type SopBuilderTranscriptEntry } from "@/lib/sop-builder-assist";
import { assessRefineInstruction } from "@/lib/sop-refine";
import { apiFetch, requireSopBuilderAuth } from "@/lib/sop-builder-route-auth";

export const maxDuration = 60;

type IncomingDraft = {
  title?: string;
  description?: string;
  checklistItems?: { label?: string; order?: number }[];
  gaps?: string[];
};

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

  const refineInstruction =
    typeof (body as { refineInstruction?: string })?.refineInstruction === "string"
      ? (body as { refineInstruction: string }).refineInstruction.trim()
      : "";
  const rawCurrent = (body as { currentDraft?: IncomingDraft })?.currentDraft;
  const currentDraft =
    rawCurrent && typeof rawCurrent === "object" && typeof rawCurrent.title === "string"
      ? {
          title: rawCurrent.title.trim(),
          description: typeof rawCurrent.description === "string" ? rawCurrent.description : "",
          checklistItems: Array.isArray(rawCurrent.checklistItems)
            ? rawCurrent.checklistItems
                .map((it, i) => ({
                  label: typeof it?.label === "string" ? it.label.trim() : "",
                  order: typeof it?.order === "number" ? it.order : i,
                }))
                .filter((it) => it.label)
            : [],
          gaps: Array.isArray(rawCurrent.gaps) ? rawCurrent.gaps.map(String) : [],
        }
      : null;

  if (refineInstruction) {
    if (!currentDraft?.title || !currentDraft.checklistItems.length) {
      return Response.json(
        { error: "Refine needs the current draft (title + checklist steps).", code: "refine_needs_draft" },
        { status: 400 },
      );
    }
    const quality = await assessRefineInstruction(refineInstruction);
    if (!quality.ok) {
      return Response.json(
        {
          error:
            quality.followUp ||
            "That refine request looks too thin or unclear. Say what to change specifically.",
          code: "answers_not_substantive",
          followUp: quality.followUp,
          layer: quality.layer,
          reason: quality.reason,
        },
        { status: 422 },
      );
    }
  }

  const sessionData = (await apiFetch(auth, `/api/sop-builder/sessions/${sessionId}`)) as {
    session: {
      topic: string;
      transcript: SopBuilderTranscriptEntry[];
      sourceMaterialRefs: { sops?: unknown[]; kb?: unknown[] };
    };
  };
  const session = sessionData.session;

  let draft: Awaited<ReturnType<typeof generateChecklistDraft>>;
  try {
    draft = await generateChecklistDraft({
      topic: session.topic,
      sourceRefs: {
        sops: (session.sourceMaterialRefs.sops ?? []) as { id: string; title: string; snippet: string }[],
        kb: (session.sourceMaterialRefs.kb ?? []) as { id: string; title: string; snippet: string }[],
      },
      transcript: session.transcript,
      currentDraft: refineInstruction ? currentDraft : null,
      refineInstruction: refineInstruction || null,
    });
  } catch (err) {
    if (err instanceof SopBuilderLlmError) {
      return Response.json(
        { error: err.classified.userMessage, code: err.classified.code, kind: err.classified.kind },
        { status: 503 },
      );
    }
    throw err;
  }
  if (!draft) {
    return Response.json(
      { error: "Draft generation returned invalid output. Try again.", code: "llm_error", kind: "unknown" },
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

  return Response.json({
    session: updated.session,
    draft: draftJson,
    refined: Boolean(refineInstruction),
  });
}
