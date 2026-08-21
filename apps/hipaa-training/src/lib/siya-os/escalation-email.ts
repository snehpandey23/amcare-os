/**
 * Escalation / auto-gap emails (Resend).
 * Set RESEND_API_KEY on Vercel project siya-staff-assist.
 *
 * Delivery modes (see gap-email-mode.ts):
 * - live: Resend → SIYA_ESCALATION_TO (default bot@siya.health)
 * - dry_run: no Resend; returns preview only
 * - test_recipient: Resend → SIYA_ESCALATION_TEST_TO only (never production inbox)
 */
import {
  assistThreadDeepLink,
  formatGapContextBlock,
  redactGapEmailText,
  type GapContextTurn,
} from "@/lib/siya-os/gap-email-context";
import {
  gapEmailTestRecipient,
  productionEscalationInbox,
  resolveGapEmailDeliveryMode,
  type GapEmailDeliveryMode,
  type GapEmailSendResult,
} from "@/lib/siya-os/gap-email-mode";

export type EscalationEmailPayload = {
  question: string;
  department: string;
  task: string;
  recordId: string;
  /** When true, question field is already a redaction placeholder. */
  phiRedacted?: boolean;
  botReply?: string;
  contextTurns?: GapContextTurn[];
  threadId?: string | null;
  reporterNote?: string;
  /** Override: dry_run | test_recipient | live (synthetic probes force dry_run). */
  emailMode?: string | null;
};

/** Auto-capture founder instant — includes bot reply + context; question text still omitted from Postgres. */
export type AutoGapFounderEmailPayload = {
  recordId: string;
  department: string;
  task: string;
  chatCategory: string;
  signalType: string;
  botReply?: string;
  contextTurns?: GapContextTurn[];
  threadId?: string | null;
  /** Optional: redacted user question for email only (never stored in Postgres). */
  userQuestion?: string;
  emailMode?: string | null;
};

/** @deprecated Prefer productionEscalationInbox / GapEmailSendResult.to */
export function escalationInbox(): string {
  return productionEscalationInbox();
}

export function escalationFromAddress(): string {
  return (
    process.env.SIYA_ESCALATION_FROM?.trim() ||
    "Siya Assist <onboarding@resend.dev>"
  );
}

function formatIstStamp(d = new Date()): { date: string; time: string } {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(d);
  return { date, time };
}

async function deliverResendText(opts: {
  subject: string;
  text: string;
  mode: GapEmailDeliveryMode;
  probeText?: string | null;
}): Promise<GapEmailSendResult> {
  const wouldSendTo = productionEscalationInbox();
  const preview = { subject: opts.subject, text: opts.text };

  if (opts.mode === "dry_run") {
    console.info(
      "[escalation-email] dry_run",
      JSON.stringify({
        wouldSendTo,
        subject: opts.subject,
        textChars: opts.text.length,
        delivery: "dry_run",
      }),
    );
    return {
      sent: false,
      delivery: "dry_run",
      wouldSendTo,
      preview,
    };
  }

  let to = wouldSendTo;
  if (opts.mode === "test_recipient") {
    const testTo = gapEmailTestRecipient();
    if (!testTo) {
      return {
        sent: false,
        delivery: "skipped",
        wouldSendTo,
        error: "SIYA_ESCALATION_TEST_TO not configured — refusing live send",
        preview,
      };
    }
    // Never allow test mode to target the production escalation inbox.
    if (testTo.toLowerCase() === wouldSendTo.toLowerCase()) {
      return {
        sent: false,
        delivery: "skipped",
        wouldSendTo,
        error: "SIYA_ESCALATION_TEST_TO must differ from production SIYA_ESCALATION_TO",
        preview,
      };
    }
    to = testTo;
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      sent: false,
      delivery: "skipped",
      wouldSendTo,
      to,
      error: "RESEND_API_KEY not configured",
      preview,
    };
  }

  const from = escalationFromAddress();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject:
          opts.mode === "test_recipient"
            ? `[TEST] ${opts.subject}`
            : opts.subject,
        text:
          opts.mode === "test_recipient"
            ? `[Siya Assist TEST MODE — not the founder production inbox]\nIntended live recipient would be: ${wouldSendTo}\n\n${opts.text}`
            : opts.text,
        reply_to: process.env.SIYA_ESCALATION_REPLY_TO?.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return {
        sent: false,
        delivery: "skipped",
        wouldSendTo,
        to,
        error: body.slice(0, 500) || res.statusText,
        preview,
      };
    }

    return {
      sent: true,
      delivery: opts.mode,
      to,
      wouldSendTo,
      preview: opts.mode === "test_recipient" ? preview : undefined,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "send failed";
    return {
      sent: false,
      delivery: "skipped",
      wouldSendTo,
      to,
      error: message,
      preview,
    };
  }
}

export function buildNotifyOwnerEmailText(payload: EscalationEmailPayload): string {
  const threadUrl = assistThreadDeepLink(payload.threadId);
  const { date, time } = formatIstStamp();

  const questionLine = payload.phiRedacted
    ? "Staff question: [redacted by PHI/clinical guard — department & task only]"
    : `Staff question: ${redactGapEmailText(payload.question).text}`;

  const botLine = payload.botReply?.trim()
    ? `Assist reply: ${redactGapEmailText(payload.botReply).text}`
    : "Assist reply: (not provided)";

  const noteLine = payload.reporterNote?.trim()
    ? `Reporter note (what they expected): ${redactGapEmailText(payload.reporterNote, 500).text}`
    : "Reporter note: (none)";

  return [
    "Siya Assist — Notify owner click (staff escalated a gap)",
    "",
    `Date (IST): ${date}`,
    `Time (IST): ${time}`,
    `Route: ${payload.department} · ${payload.task}`,
    `Record ID: ${payload.recordId}`,
    `Thread: ${threadUrl}`,
    "",
    questionLine,
    botLine,
    noteLine,
    "",
    "Surrounding context (up to 2 prior turns):",
    formatGapContextBlock(payload.contextTurns ?? []),
    "",
    "What to do: Review the Assist reply vs what the reporter expected. Publish or update an approved guide, or resolve the gap in Admin if it was a false alarm.",
    "Do not reply with PHI.",
    "",
    "— automated from Notify owner —",
  ].join("\n");
}

export async function sendEscalationEmail(
  payload: EscalationEmailPayload,
): Promise<GapEmailSendResult> {
  const mode = resolveGapEmailDeliveryMode({
    requested: payload.emailMode,
    probeText: `${payload.question}\n${payload.reporterNote || ""}`,
  });
  const subject = `[Siya Assist] ${payload.department} — policy gap (Notify owner)`;
  const text = buildNotifyOwnerEmailText(payload);
  console.info(
    "[escalation-email] notify_owner",
    JSON.stringify({
      recordId: payload.recordId,
      delivery: mode,
      hasAssistReply: /Assist reply: (?!\(not provided\))/.test(text),
      hasThreadDeepLink: text.includes("?thread="),
      hasReporterNote: /Reporter note \(what they expected\):/.test(text),
      hasContextTurns: !text.includes("(no surrounding turns)"),
    }),
  );
  return deliverResendText({ subject, text, mode, probeText: payload.question });
}

export function buildAutoGapFounderEmailText(payload: AutoGapFounderEmailPayload): string {
  const { date, time } = formatIstStamp();
  const threadUrl = assistThreadDeepLink(payload.threadId);

  const questionLine = payload.userQuestion?.trim()
    ? `Staff question (email only, not stored): ${redactGapEmailText(payload.userQuestion).text}`
    : "Staff question: (omitted — auto-capture; see Assist reply + context)";

  const botLine = payload.botReply?.trim()
    ? `Assist reply: ${redactGapEmailText(payload.botReply).text}`
    : "Assist reply: (not provided)";

  return [
    "Siya Assist — automatic knowledge-gap capture (no Notify owner click)",
    "",
    `Date (IST): ${date}`,
    `Time (IST): ${time}`,
    `Chat category: ${payload.chatCategory}`,
    `Department: ${payload.department}`,
    `Task: ${payload.task}`,
    `Signal: ${payload.signalType}`,
    `Record ID: ${payload.recordId}`,
    `Thread: ${threadUrl}`,
    "",
    questionLine,
    botLine,
    "",
    "Surrounding context (up to 2 prior turns):",
    formatGapContextBlock(payload.contextTurns ?? []),
    "",
    "What to do: Open the thread link, see why Assist soft-stopped, then publish a guide or resolve the gap if it was noise.",
    "Verbatim questions are not stored in Postgres; email body may include PHI-redacted snippets for triage only.",
    "",
    "— automated from Assist auto-capture —",
  ].join("\n");
}

/** Auto knowledge-gap — Leadership/Founder Talk founder instant. */
export async function sendAutoGapFounderEmail(
  payload: AutoGapFounderEmailPayload,
): Promise<GapEmailSendResult> {
  const mode = resolveGapEmailDeliveryMode({
    requested: payload.emailMode,
    probeText: payload.userQuestion || payload.chatCategory,
  });
  const subject = `[Siya Assist] Auto gap — ${payload.chatCategory}`;
  const text = buildAutoGapFounderEmailText(payload);
  console.info(
    "[escalation-email] auto_gap",
    JSON.stringify({
      recordId: payload.recordId,
      delivery: mode,
      hasAssistReply: /Assist reply: (?!\(not provided\))/.test(text),
      hasThreadDeepLink: text.includes("?thread="),
      hasContextTurns: !text.includes("(no surrounding turns)"),
      hasUserQuestion: /Staff question \(email only/.test(text),
    }),
  );
  return deliverResendText({
    subject,
    text,
    mode,
    probeText: payload.userQuestion,
  });
}
