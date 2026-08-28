/**
 * Task assignment transactional emails (Resend).
 * Same sender / API-key pattern as sop-review-email.ts — RESEND_API_KEY on siya-staff-assist.
 * Subjects intentionally distinct from SOP review mail.
 */

import { escalationFromAddress } from "@/lib/siya-os/escalation-email";
import { SIYA_ASSISTANT_CANONICAL_URL } from "@/lib/siya-os/public-url";

export type TaskEmailSendResult = {
  sent: boolean;
  error?: string;
  to: string[];
  id?: string;
};

function staffAppBase(): string {
  return SIYA_ASSISTANT_CANONICAL_URL.replace(/\/$/, "");
}

function taskFromAddress(): string {
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
}): Promise<TaskEmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = [...new Set(opts.to.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))];
  const from = taskFromAddress();
  if (!to.length) {
    console.warn("[task-assignment-email] skip: no_recipient", { subject: opts.subject });
    return { sent: false, error: "no_recipient", to: [] };
  }
  if (!apiKey) {
    console.warn("[task-assignment-email] skip: RESEND_API_KEY missing on siya-staff-assist", {
      subject: opts.subject,
      toCount: to.length,
      from,
    });
    return { sent: false, error: "RESEND_API_KEY not configured", to };
  }
  try {
    console.info("[task-assignment-email] calling Resend", {
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
      console.error("[task-assignment-email] Resend rejected", { status: res.status, error, toCount: to.length });
      return { sent: false, error, to };
    }
    let id: string | undefined;
    try {
      id = (JSON.parse(bodyText) as { id?: string }).id;
    } catch {
      /* ignore */
    }
    console.info("[task-assignment-email] Resend accepted", { id, toCount: to.length, subject: opts.subject });
    return { sent: true, to, id };
  } catch (err) {
    const error = err instanceof Error ? err.message : "send failed";
    console.error("[task-assignment-email] send exception", error);
    return { sent: false, error, to };
  }
}

export function buildTaskAssignedEmail(opts: {
  title: string;
  dueDate?: string | null;
  assigneeName?: string | null;
  assignerName?: string | null;
  kind: "created" | "reassigned";
}): { subject: string; text: string; link: string } {
  const link = `${staffAppBase()}/`;
  const dueLine = opts.dueDate?.trim() ? `Due: ${opts.dueDate.trim()}` : "Due: (not set)";
  const who =
    opts.kind === "reassigned"
      ? `${opts.assignerName || "A teammate"} reassigned a task to you.`
      : `${opts.assignerName || "A teammate"} assigned you a new task.`;
  return {
    subject: `[Task assigned] ${opts.title}`.slice(0, 200),
    link,
    text: [
      `Hi ${opts.assigneeName || "there"},`,
      "",
      who,
      "",
      `Task: ${opts.title}`,
      dueLine,
      "",
      `Open My day (Your tasks today): ${link}`,
      "",
      "This is a task assignment notice — not an SOP review email.",
      "",
      "— Siya staff portal —",
    ].join("\n"),
  };
}

export async function notifyTaskAssigned(opts: {
  title: string;
  dueDate?: string | null;
  assigneeEmail: string | null | undefined;
  assigneeName?: string | null;
  assignerName?: string | null;
  kind: "created" | "reassigned";
}): Promise<TaskEmailSendResult> {
  if (!opts.assigneeEmail?.includes("@")) {
    console.warn("[task-assignment-email] skip: no assignee email", { title: opts.title, kind: opts.kind });
    return { sent: false, error: "no_recipient", to: [] };
  }
  const { subject, text } = buildTaskAssignedEmail(opts);
  return sendResend({ to: [opts.assigneeEmail], subject, text });
}
