/**
 * Peer feedback — recipient notification (Resend).
 * Feedback Friday is a themed reminder day only; feedback can arrive any weekday.
 * Same sender / API-key pattern as sop-review-email.ts and task-assignment-email.ts.
 * Never includes feedback body or giver identity in email (read in-app at /feedback).
 */

import { escalationFromAddress } from "@/lib/siya-os/escalation-email";
import { SIYA_ASSISTANT_CANONICAL_URL } from "@/lib/siya-os/public-url";

export type FeedbackEmailSendResult = {
  sent: boolean;
  error?: string;
  to: string[];
  id?: string;
};

function staffAppBase(): string {
  return SIYA_ASSISTANT_CANONICAL_URL.replace(/\/$/, "");
}

function feedbackFromAddress(): string {
  return (
    process.env.SIYA_INVITE_FROM?.trim() ||
    process.env.SIYA_ESCALATION_FROM?.trim() ||
    escalationFromAddress()
  );
}

async function sendResend(opts: {
  to: string[];
  subject: string;
  text: string;
}): Promise<FeedbackEmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = [...new Set(opts.to.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))];
  const from = feedbackFromAddress();
  if (!to.length) {
    console.warn("[feedback-received-email] skip: no_recipient", { subject: opts.subject });
    return { sent: false, error: "no_recipient", to: [] };
  }
  if (!apiKey) {
    console.warn("[feedback-received-email] skip: RESEND_API_KEY missing on siya-staff-assist", {
      subject: opts.subject,
      toCount: to.length,
      from,
    });
    return { sent: false, error: "RESEND_API_KEY not configured", to };
  }
  try {
    console.info("[feedback-received-email] calling Resend", {
      subject: opts.subject,
      toCount: to.length,
      from,
    });
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: opts.subject,
        text: opts.text,
      }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      const error = bodyText.slice(0, 500) || res.statusText;
      console.error("[feedback-received-email] Resend rejected", { status: res.status, error, toCount: to.length });
      return { sent: false, error, to };
    }
    let id: string | undefined;
    try {
      id = (JSON.parse(bodyText) as { id?: string }).id;
    } catch {
      /* ignore */
    }
    console.info("[feedback-received-email] Resend accepted", { id, toCount: to.length, subject: opts.subject });
    return { sent: true, to, id };
  } catch (err) {
    const error = err instanceof Error ? err.message : "send failed";
    console.error("[feedback-received-email] send exception", error);
    return { sent: false, error, to };
  }
}

export function buildFeedbackReceivedEmail(opts: {
  recipientName?: string | null;
}): { subject: string; text: string; link: string } {
  const link = `${staffAppBase()}/feedback`;
  return {
    subject: "You've received feedback from a teammate",
    link,
    text: [
      `Hi ${opts.recipientName || "there"},`,
      "",
      "You've received feedback from a teammate.",
      "",
      "We don't include feedback text in email — read it in the portal:",
      link,
      "",
      "— Siya staff portal —",
    ].join("\n"),
  };
}

/** Same warm copy for named and anonymous — no giver identity in email. */
export async function notifyFeedbackReceived(opts: {
  recipientEmail: string | null | undefined;
  recipientName?: string | null;
}): Promise<FeedbackEmailSendResult> {
  if (!opts.recipientEmail?.includes("@")) {
    console.warn("[feedback-received-email] skip: no recipient email");
    return { sent: false, error: "no_recipient", to: [] };
  }
  const { subject, text } = buildFeedbackReceivedEmail(opts);
  return sendResend({ to: [opts.recipientEmail], subject, text });
}
