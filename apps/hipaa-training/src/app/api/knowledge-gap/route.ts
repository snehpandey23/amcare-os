import type { Department } from "@/lib/siya-os/departments";
import { sendEscalationEmail, escalationInbox } from "@/lib/siya-os/escalation-email";
import { assessStaffMessageSafety } from "@/lib/siya-os/phi-guard";
import { persistAssistGap } from "@/lib/siya-os/assist-gap-persist";
import type { GapContextTurn } from "@/lib/siya-os/gap-email-context";

/**
 * Notify owner / knowledge-gap capture (explicit click).
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
    const botReply = typeof body?.botReply === "string" ? body.botReply.trim() : "";
    const reporterNote = typeof body?.reporterNote === "string" ? body.reporterNote.trim().slice(0, 500) : "";
    const threadId =
      typeof body?.threadId === "string" && body.threadId.startsWith("ath-") ? body.threadId : null;
    const contextTurns: GapContextTurn[] = Array.isArray(body?.contextTurns)
      ? body.contextTurns
          .filter(
            (t: unknown) =>
              t &&
              typeof t === "object" &&
              ((t as GapContextTurn).role === "user" || (t as GapContextTurn).role === "assistant") &&
              typeof (t as GapContextTurn).content === "string",
          )
          .map((t: GapContextTurn) => ({
            role: t.role,
            content: String(t.content).slice(0, 2000),
          }))
          .slice(-2)
      : [];

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
        hasReporterNote: Boolean(reporterNote),
        threadId: threadId || null,
        question: phiRedacted ? "[redacted — PHI/clinical/emergency guard]" : question.slice(0, 200),
      }),
    );

    const persisted = await persistAssistGap({
      token: bearer,
      id,
      department,
      task,
      phiRedacted,
      signalType: "notify_owner",
      sendFounderInstantEmail: false,
    });
    if (!persisted.ok || !persisted.route) {
      const signInHint = persisted.persistStatus === 401 || persisted.persistStatus === 403;
      return Response.json(
        {
          error: signInHint
            ? "Could not record gap — try again after sign-in."
            : "Could not record gap.",
          persistStatus: persisted.persistStatus ?? 503,
          persistError: persisted.persistError ?? null,
          phiRedacted,
        },
        { status: signInHint ? 401 : 503 },
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
        botReply,
        contextTurns,
        threadId,
        reporterNote,
      });
      if (!email.sent) {
        console.warn("[knowledge-gap] email not sent:", email.error);
      }
    }

    const message =
      routeMode === "lead_digest"
        ? `Logged for the ${persisted.route.departmentLabel || department} lead’s weekly knowledge-gap digest (Notify owner — category/task; email deferred to Monday digest).`
        : email.sent
          ? `Gap emailed to ${escalationInbox()}${phiRedacted ? " (question text redacted by PHI guard)." : "."}`
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
      gap: persisted.gap ?? null,
      digestEligible: persisted.digestEligible ?? false,
      routeMode,
      routeReason: persisted.route.reason ?? null,
      leadName: persisted.route.leadName ?? null,
      phiRedacted,
      emailSent: routeMode === "founder_instant" ? email.sent : false,
      emailTo: routeMode === "founder_instant" && email.sent ? escalationInbox() : undefined,
      emailError: routeMode === "founder_instant" && !email.sent ? email.error : undefined,
      message,
      honestyNote:
        "Notify owner click logged with Assist reply + optional reporter note in founder email when routed founder_instant. Postgres still stores category/task only.",
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
