import {
  gatherSopBuilderContext,
  generateInterviewStart,
  SopBuilderLlmError,
  type SopBuilderTranscriptEntry,
} from "@/lib/sop-builder-assist";
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
  const topic = typeof (body as { topic?: string })?.topic === "string" ? (body as { topic: string }).topic.trim() : "";
  if (!topic) return Response.json({ error: "topic required" }, { status: 400 });

  const sourceRefs = await gatherSopBuilderContext(topic, auth);
  // generateInterviewStart falls back to a deterministic first question if LLM is down.
  let interview: Awaited<ReturnType<typeof generateInterviewStart>>;
  try {
    interview = await generateInterviewStart({ topic, sourceRefs });
  } catch (err) {
    if (err instanceof SopBuilderLlmError) {
      return Response.json(
        { error: err.classified.userMessage, code: err.classified.code, kind: err.classified.kind },
        { status: 503 },
      );
    }
    throw err;
  }

  const transcript: SopBuilderTranscriptEntry[] = [
    {
      role: "assistant",
      content: interview.questions[0]!,
      coverageTag: interview.firstQuestionMeta.coverageTag,
      isPushback: false,
    },
  ];

  const created = (await apiFetch(auth, "/api/sop-builder/sessions", {
    method: "POST",
    body: JSON.stringify({ topic, sourceMaterialRefs: sourceRefs, transcript }),
  })) as { session: Record<string, unknown> };

  return Response.json({
    session: created.session,
    questions: interview.questions,
    readyToDraft: interview.readyToDraft,
  });
}
