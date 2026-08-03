import { countUserAnswers, pendingQuestion, MIN_QUESTIONS, type SopBuilderTranscriptEntry } from "@/lib/sop-builder-assist";
import { apiFetch, requireSopBuilderAuth } from "@/lib/sop-builder-route-auth";

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
      transcript: SopBuilderTranscriptEntry[];
      status: string;
      draftJson: unknown;
    };
  };
  const session = sessionData.session;
  const pq = pendingQuestion(session.transcript);
  const answerCount = countUserAnswers(session.transcript);
  const readyToDraft =
    session.status === "draft_ready" ||
    Boolean(session.draftJson) ||
    (answerCount >= MIN_QUESTIONS && !pq);

  return Response.json({
    session: sessionData.session,
    pendingQuestion: pq,
    readyToDraft,
  });
}
