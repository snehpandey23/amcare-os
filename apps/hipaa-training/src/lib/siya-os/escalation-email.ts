/**
 * Escalation email when staff use "Notify owner" (knowledge gap).
 * Uses Resend HTTP API — set RESEND_API_KEY on Vercel project siya-staff-assist.
 */

export type EscalationEmailPayload = {
  question: string;
  department: string;
  task: string;
  recordId: string;
  /** When true, question field is already a redaction placeholder. */
  phiRedacted?: boolean;
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

export async function sendEscalationEmail(
  payload: EscalationEmailPayload,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  const to = escalationInbox();
  const from = escalationFromAddress();
  const subject = `[Siya Assist] ${payload.department} — policy gap`;
  const appUrl =
    process.env.NEXT_PUBLIC_SIYA_ASSISTANT_URL?.trim() ||
    "https://siya-staff-assist.vercel.app";

  const questionLine = payload.phiRedacted
    ? "Question: [redacted by PHI/clinical guard — department & task only]"
    : `Question: ${payload.question.slice(0, 2000)}`;

  const text = [
    "Siya Assist — staff reported a missing or unclear policy (Notify owner click)",
    "",
    questionLine,
    `Route: ${payload.department} · ${payload.task}`,
    `Record ID: ${payload.recordId}`,
    `App: ${appUrl}`,
    "",
    "Note: This is a Notify owner click, not a full count of unanswered Ask turns.",
    "Do not reply with PHI. Add or update a live topic in the internal knowledge base when resolved.",
    "",
    "— automated from Notify owner —",
  ].join("\n");

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
        subject,
        text,
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
