/**
 * Escalation / auto-gap emails (Resend).
 * Set RESEND_API_KEY on Vercel project siya-staff-assist.
 */
import {
  assistThreadDeepLink,
  formatGapContextBlock,
  redactGapEmailText,
  type GapContextTurn,
} from "@/lib/siya-os/gap-email-context";

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
};

export function escalationInbox(): string {
  return (process.env.SIYA_ESCALATION_TO || "bot@siya.health").trim();
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

async function sendResendText(opts: {
  subject: string;
  text: string;
}): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const to = escalationInbox();
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
        subject: opts.subject,
        text: opts.text,
        reply_to: process.env.SIYA_ESCALATION_REPLY_TO?.trim() || undefined,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { sent: false, error: body.slice(0, 500) || res.statusText };
    }

    return { sent: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "send failed";
    return { sent: false, error: message };
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
): Promise<{ sent: boolean; error?: string }> {
  const subject = `[Siya Assist] ${payload.department} — policy gap (Notify owner)`;
  const text = buildNotifyOwnerEmailText(payload);
  console.info(
    "[escalation-email] notify_owner",
    JSON.stringify({
      recordId: payload.recordId,
      hasAssistReply: /Assist reply: (?!\(not provided\))/.test(text),
      hasThreadDeepLink: text.includes("?thread="),
      hasReporterNote: /Reporter note \(what they expected\):/.test(text),
      hasContextTurns: !text.includes("(no surrounding turns)"),
    }),
  );
  return sendResendText({ subject, text });
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
): Promise<{ sent: boolean; error?: string }> {
  const subject = `[Siya Assist] Auto gap — ${payload.chatCategory}`;
  const text = buildAutoGapFounderEmailText(payload);
  console.info(
    "[escalation-email] auto_gap",
    JSON.stringify({
      recordId: payload.recordId,
      hasAssistReply: /Assist reply: (?!\(not provided\))/.test(text),
      hasThreadDeepLink: text.includes("?thread="),
      hasContextTurns: !text.includes("(no surrounding turns)"),
      hasUserQuestion: /Staff question \(email only/.test(text),
    }),
  );
  return sendResendText({ subject, text });
}
