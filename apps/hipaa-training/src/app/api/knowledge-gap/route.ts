import type { Department } from "@/lib/siya-os/departments";
import { sendEscalationEmail, escalationInbox } from "@/lib/siya-os/escalation-email";
import { getTrainingApiUrl } from "@/lib/trainingConfig";

async function persistGapToApi(record: { id: string; department: string; task: string }, token?: string | null) {
  const base = getTrainingApiUrl();
  if (!base || !token) return;
  try {
    await fetch(`${base}/api/assist/gaps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: record.id, department: record.department, task: record.task }),
    });
  } catch {
    /* console log remains primary fallback */
  }
}

/** Log gap + optional email to bot@siya.health (Resend). */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const department = (typeof body?.department === "string" ? body.department : "General") as Department;
    const task = typeof body?.task === "string" ? body.task : "Missing approved policy";

    if (!question || question.length > 2000) {
      return Response.json({ error: "question required" }, { status: 400 });
    }

    const record = {
      id: `gap-${Date.now()}`,
      question,
      department,
      task,
      status: "awaiting_policy" as const,
      createdAt: Date.now(),
    };

    console.info("[knowledge-gap]", JSON.stringify({ ...record, question: question.slice(0, 200) }));

    const auth = req.headers.get("authorization");
    const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    await persistGapToApi({ id: record.id, department, task }, bearer);

    const email = await sendEscalationEmail({
      question,
      department,
      task,
      recordId: record.id,
    });

    if (!email.sent) {
      console.warn("[knowledge-gap] email not sent:", email.error);
    }

    return Response.json({
      ok: true,
      record,
      emailSent: email.sent,
      emailTo: email.sent ? escalationInbox() : undefined,
      emailError: email.sent ? undefined : email.error,
      message: email.sent
        ? `Question emailed to ${escalationInbox()}.`
        : "Question logged. Email not sent — add RESEND_API_KEY on Vercel (see docs/ESCALATION-EMAIL.md).",
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
