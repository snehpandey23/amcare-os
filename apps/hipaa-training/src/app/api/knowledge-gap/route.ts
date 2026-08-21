import type { Department } from "@/lib/siya-os/departments";
import { sendEscalationEmail, escalationInbox } from "@/lib/siya-os/escalation-email";
import { assessStaffMessageSafety } from "@/lib/siya-os/phi-guard";
import { persistAssistGap } from "@/lib/siya-os/assist-gap-persist";
import type { GapContextTurn } from "@/lib/siya-os/gap-email-context";
import {
  isSyntheticGapEmailProbe,
  parseRequestedEmailMode,
  resolveGapEmailDeliveryMode,
  type GapEmailSendResult,
} from "@/lib/siya-os/gap-email-mode";
import { getTrainingApiUrl } from "@/lib/trainingConfig";

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
    const emailModeRequested = parseRequestedEmailMode(body);
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
    const syntheticProbe = isSyntheticGapEmailProbe(`${question}\n${reporterNote}`);
    const deliveryMode = resolveGapEmailDeliveryMode({
      requested: emailModeRequested,
      probeText: `${question}\n${reporterNote}`,
    });

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
        syntheticProbe,
        emailDeliveryMode: deliveryMode,
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
    const recordId = persisted.id || id;

    // Synthetic / dry-run probes: resolve immediately so they never sit in open queues.
    let autoResolved = false;
    if (syntheticProbe || deliveryMode === "dry_run") {
      autoResolved = await resolveGapQuietly(bearer, recordId);
    }

    let email: GapEmailSendResult = {
      sent: false,
      delivery: "skipped",
      wouldSendTo: escalationInbox(),
    };
    if (routeMode === "founder_instant") {
      email = await sendEscalationEmail({
        question: phiRedacted
          ? "[Question redacted — possible PHI/clinical content. Department and task only.]"
          : question,
        department,
        task,
        recordId,
        phiRedacted,
        botReply,
        contextTurns,
        threadId,
        reporterNote,
        emailMode: emailModeRequested || (syntheticProbe ? "dry_run" : undefined),
      });
      if (!email.sent && email.delivery !== "dry_run") {
        console.warn("[knowledge-gap] email not sent:", email.delivery, email.error);
      }
    }

    const message = messageForNotifyResult({
      routeMode,
      departmentLabel: persisted.route.departmentLabel || department,
      email,
      phiRedacted,
    });

    return Response.json({
      ok: true,
      record: {
        id: recordId,
        department,
        task,
        status: autoResolved ? "resolved" : "awaiting_policy",
        createdAt: Date.now(),
        phiRedacted,
        questionStored: false,
      },
      gap: persisted.gap ?? null,
      digestEligible: autoResolved ? false : (persisted.digestEligible ?? false),
      routeMode,
      routeReason: persisted.route.reason ?? null,
      leadName: persisted.route.leadName ?? null,
      phiRedacted,
      syntheticProbe,
      autoResolved,
      emailSent: routeMode === "founder_instant" ? email.sent : false,
      emailDelivery: routeMode === "founder_instant" ? email.delivery : "skipped",
      emailTo: routeMode === "founder_instant" ? email.to : undefined,
      emailWouldSendTo: routeMode === "founder_instant" ? email.wouldSendTo : undefined,
      emailPreview: routeMode === "founder_instant" ? email.preview : undefined,
      emailError: routeMode === "founder_instant" && !email.sent && email.delivery !== "dry_run" ? email.error : undefined,
      message,
      honestyNote:
        "Notify owner: founder_instant emails report emailDelivery (live | dry_run | test_recipient). Synthetic probes force dry_run and auto-resolve. Postgres stores category/task only.",
    });
  } catch {
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}

async function resolveGapQuietly(token: string, id: string): Promise<boolean> {
  const base = getTrainingApiUrl();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/api/assist/gaps/${encodeURIComponent(id)}/resolve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function messageForNotifyResult(opts: {
  routeMode: string;
  departmentLabel: string;
  email: GapEmailSendResult;
  phiRedacted: boolean;
}): string {
  if (opts.routeMode === "lead_digest") {
    return `Logged for the ${opts.departmentLabel} lead’s weekly knowledge-gap digest (Notify owner — category/task; email deferred to Monday digest).`;
  }
  if (opts.email.delivery === "dry_run") {
    return `Dry-run only — no email sent to ${opts.email.wouldSendTo || escalationInbox()}. Preview returned in emailPreview.`;
  }
  if (opts.email.delivery === "test_recipient" && opts.email.sent) {
    return `Test-mode gap emailed to ${opts.email.to} (not ${opts.email.wouldSendTo}).`;
  }
  if (opts.email.sent) {
    return `Gap emailed to ${opts.email.to || escalationInbox()}${opts.phiRedacted ? " (question text redacted by PHI guard)." : "."}`;
  }
  return "Gap logged. Founder email not sent — add RESEND_API_KEY on Vercel (see docs/ESCALATION-EMAIL.md).";
}
