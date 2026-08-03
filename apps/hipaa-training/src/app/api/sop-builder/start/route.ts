import {
  gatherSopBuilderContext,
  generateInterviewStart,
  type SopBuilderTranscriptEntry,
} from "@/lib/sop-builder-assist";
import { workforceLlmEnabled } from "@/lib/siya-os/model";
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
  const interview = await generateInterviewStart({ topic, sourceRefs });
  if (!interview) {
    return Response.json(
      {
        error: workforceLlmEnabled()
          ? "Interview generation failed. Try again later."
          : "Workforce AI is off — use the department SOP workspace or task templates instead.",
        code: "llm_unavailable",
      },
      { status: 503 },
    );
  }

  const transcript: SopBuilderTranscriptEntry[] = [
    { role: "assistant", content: interview.questions[0]! },
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
