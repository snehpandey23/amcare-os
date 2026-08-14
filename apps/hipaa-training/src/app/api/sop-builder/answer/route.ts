import {
  generateInterviewNext,
  countUserAnswers,
  countSubstantiveAnswers,
  MAX_QUESTIONS,
  MIN_QUESTIONS,
  SopBuilderLlmError,
  type SopBuilderTranscriptEntry,
} from "@/lib/sop-builder-assist";
import { assessAnswerSubstantiveness } from "@/lib/answer-quality";
import { assessStaffMessageSafety, staffRefusalMessage } from "@/lib/siya-os/phi-guard";
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
  const skipped = Boolean((body as { skipped?: boolean })?.skipped);
  const answer = typeof (body as { answer?: string })?.answer === "string" ? (body as { answer: string }).answer.trim() : "";
  if (!sessionId) return Response.json({ error: "sessionId required" }, { status: 400 });
  if (!skipped && !answer) return Response.json({ error: "answer required (or set skipped)" }, { status: 400 });

  const sessionData = (await apiFetch(auth, `/api/sop-builder/sessions/${sessionId}`)) as {
    session: {
      topic: string;
      transcript: SopBuilderTranscriptEntry[];
      sourceMaterialRefs: { sops?: unknown[]; kb?: unknown[] };
      status: string;
    };
  };
  const session = sessionData.session;
  if (session.status !== "in_progress") {
    return Response.json({ error: "Session is not in progress" }, { status: 400 });
  }

  if (!skipped && answer) {
    const history = session.transcript
      .filter((e) => e.role === "user")
      .map((e) => ({ role: "user", content: e.content }));
    const safety = assessStaffMessageSafety(answer, history);
    if (safety.blocked && safety.category) {
      return Response.json({ error: staffRefusalMessage(safety.category), blocked: true }, { status: 400 });
    }
  }

  const transcript = [...session.transcript];
  if (transcript.length && transcript[transcript.length - 1]?.role === "assistant") {
    transcript.push({
      role: "user",
      content: skipped ? "" : answer,
      skipped,
    });
  }

  const answerCount = countUserAnswers(transcript);
  const substantive = countSubstantiveAnswers(transcript);
  const lastUser = transcript[transcript.length - 1];
  const lastQuestion =
    [...transcript].reverse().find((e) => e.role === "assistant")?.content ??
    `Interview question about: ${session.topic}`;

  // Cap turns only after a substantive last answer (heuristic + LLM gate).
  if (
    answerCount >= MAX_QUESTIONS &&
    substantive >= MIN_QUESTIONS &&
    lastUser?.role === "user" &&
    (lastUser.skipped ||
      (
        await assessAnswerSubstantiveness({
          question: lastQuestion,
          answer: lastUser.content,
          skipped: false,
        })
      ).ok)
  ) {
    const updated = (await apiFetch(auth, `/api/sop-builder/sessions/${sessionId}`, {
      method: "PATCH",
      body: JSON.stringify({ transcript }),
    })) as { session: unknown };
    return Response.json({
      session: updated.session,
      question: null,
      readyToDraft: true,
      questionNumber: answerCount,
    });
  }

  let next: Awaited<ReturnType<typeof generateInterviewNext>>;
  try {
    next = await generateInterviewNext({
      topic: session.topic,
      sourceRefs: {
        sops: (session.sourceMaterialRefs.sops ?? []) as { id: string; title: string; snippet: string }[],
        kb: (session.sourceMaterialRefs.kb ?? []) as { id: string; title: string; snippet: string }[],
      },
      transcript,
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
  if (!next) {
    return Response.json(
      { error: "Could not generate next question (invalid AI output).", code: "llm_error", kind: "unknown" },
      { status: 503 },
    );
  }

  if (next.question) {
    transcript.push({ role: "assistant", content: next.question });
  }

  const updated = (await apiFetch(auth, `/api/sop-builder/sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({ transcript }),
  })) as { session: unknown };

  return Response.json({
    session: updated.session,
    question: next.question,
    readyToDraft: next.readyToDraft,
    questionNumber: next.questionNumber,
  });
}
