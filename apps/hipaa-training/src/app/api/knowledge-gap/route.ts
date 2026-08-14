import type { Department } from "@/lib/siya-os/departments";
import { sendEscalationEmail, escalationInbox } from "@/lib/siya-os/escalation-email";
import { assessStaffMessageSafety } from "@/lib/siya-os/phi-guard";
import { getTrainingApiUrl } from "@/lib/trainingConfig";

type PersistGapResult = {
  ok: boolean;
  id?: string;
  route?: {
    mode: "lead_digest" | "founder_instant";
    departmentLabel?: string;
    reason?: string;
    leadName?: string | null;
  };
};

async function persistGapToApi(
  record: { id: string; department: string; task: string; phiRedacted: boolean },
  token: string,
): Promise<PersistGapResult> {
  const base = getTrainingApiUrl();
  if (!base) return { ok: false };
  try {
    const res = await fetch(`${base}/api/assist/gaps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        id: record.id,
        department: record.department,
        task: record.task,
        phiRedacted: record.phiRedacted,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as PersistGapResult & { error?: string };
    if (!res.ok) return { ok: false };
    return {
      ok: true,
      id: data.id,
      route: data.route,
    };
  } catch {
    return { ok: false };
  }
}

/**
 * Notify owner / knowledge-gap capture.
 * Auth required so department→lead routing can run.
 * PHI guard runs before Resend, logs, or any client-safe echo of question text.
 */
export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!bearer) {
      return Response.json({ error: "Sign in required" }, { status: 401 });
    }

    const body = await req.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const department = (typeof body?.department === "string" ? body.department : "General") as Department;
    const task = typeof body?.task === "string" ? body.task : "Missing approved policy";

    if (!question || question.length > 2000) {
      return Response.json({ error: "question required" }, { status: 400 });
    }

    const safety = assessStaffMessageSafety(question);
    const phiRedacted = Boolean(safety.blocked);
    const id = `gap-${Date.now()}`;

    console.info(
      "[knowledge-gap]",
      JSON.stringify({
        id,
        department,
        task,
        status: "awaiting_policy",
        phiRedacted,
        refusalCategory: safety.category ?? null,
        question: phiRedacted ? "[redacted — PHI/clinical/emergency guard]" : question.slice(0, 200),
      }),
    );

    const persisted = await persistGapToApi({ id, department, task, phiRedacted }, bearer);
    if (!persisted.ok || !persisted.route) {
      return Response.json(
        { error: "Could not record gap — try again after sign-in.", phiRedacted },
        { status: 503 },
      );
    }
    const routeMode = persisted.route.mode;

    let email: { sent: boolean; error?: string } = { sent: false };
    if (routeMode === "founder_instant") {
      email = await sendEscalationEmail({
        question: phiRedacted
          ? "[Question redacted — possible PHI/clinical content. Department and task only.]"
          : question,
        department,
        task,
        recordId: persisted.id || id,
        phiRedacted,
      });
      if (!email.sent) {
        console.warn("[knowledge-gap] email not sent:", email.error);
      }
    }

    const message =
      routeMode === "lead_digest"
        ? `Logged for the ${persisted.route.departmentLabel || department} lead’s weekly knowledge-gap digest (Notify owner clicks — category/task only).`
        : email.sent
          ? `Question emailed to ${escalationInbox()}${phiRedacted ? " (question text redacted by PHI guard)." : "."}`
          : "Gap logged. Founder email not sent — add RESEND_API_KEY on Vercel (see docs/ESCALATION-EMAIL.md).";

    return Response.json({
      ok: true,
      record: {
        id: persisted.id || id,
        department,
        task,
        status: "awaiting_policy",
        createdAt: Date.now(),
        phiRedacted,
        questionStored: false,
      },
      routeMode,
      routeReason: persisted.route.reason ?? null,
      leadName: persisted.route.leadName ?? null,
      phiRedacted,
      emailSent: routeMode === "founder_instant" ? email.sent : false,
      emailTo: routeMode === "founder_instant" && email.sent ? escalationInbox() : undefined,
      emailError: routeMode === "founder_instant" && !email.sent ? email.error : undefined,
      message,
      honestyNote:
        "This records a Notify owner click — not every unanswered Ask turn. Verbatim questions are never stored in Postgres.",
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
