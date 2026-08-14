/**
 * SOP review transactional emails (Resend).
 * Same sender config as invites / Ask escalation — RESEND_API_KEY on siya-staff-assist.
 */

import { escalationFromAddress, escalationInbox } from "@/lib/siya-os/escalation-email";
import { SIYA_ASSISTANT_CANONICAL_URL } from "@/lib/siya-os/public-url";

export type SopNotifyContacts = {
  ownerEmail: string | null;
  ownerName: string | null;
  adminEmails: string[];
};

function staffAppBase(): string {
  return SIYA_ASSISTANT_CANONICAL_URL.replace(/\/$/, "");
}

function sopFromAddress(): string {
  return (
    process.env.SIYA_INVITE_FROM?.trim() ||
    process.env.SIYA_ESCALATION_FROM?.trim() ||
    escalationFromAddress()
  );
}

/** Review is admin-only today; optional SIYA_SOP_REVIEW_TO overrides/extends. */
export function resolveReviewerEmails(adminEmails: string[]): string[] {
  const override = process.env.SIYA_SOP_REVIEW_TO?.trim();
  const fromEnv = override
    ? override.split(/[,;\s]+/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"))
    : [];
  const admins = adminEmails.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"));
  const merged = [...new Set([...fromEnv, ...admins])];
  if (merged.length) return merged;
  const fallback = escalationInbox().toLowerCase();
  return fallback.includes("@") ? [fallback] : [];
}

export type SopEmailSendResult = {
  sent: boolean;
  error?: string;
  to: string[];
  /** Resend email id when accepted */
  id?: string;
};

async function sendResend(opts: {
  to: string[];
  subject: string;
  text: string;
}): Promise<SopEmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = [...new Set(opts.to.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))];
  const from = sopFromAddress();
  if (!to.length) {
    console.warn("[sop-review-email] skip: no_recipient", { subject: opts.subject });
    return { sent: false, error: "no_recipient", to: [] };
  }
  if (!apiKey) {
    // Trigger fired; Resend never called — this is the usual prod miss.
    console.warn("[sop-review-email] skip: RESEND_API_KEY missing on siya-staff-assist", {
      subject: opts.subject,
      toCount: to.length,
      from,
    });
    return { sent: false, error: "RESEND_API_KEY not configured", to };
  }
  try {
    console.info("[sop-review-email] calling Resend", {
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
      console.error("[sop-review-email] Resend rejected", { status: res.status, error, toCount: to.length });
      return { sent: false, error, to };
    }
    let id: string | undefined;
    try {
      id = (JSON.parse(bodyText) as { id?: string }).id;
    } catch {
      /* ignore */
    }
    console.info("[sop-review-email] Resend accepted", { id, toCount: to.length, subject: opts.subject });
    return { sent: true, to, id };
  } catch (err) {
    const error = err instanceof Error ? err.message : "send failed";
    console.error("[sop-review-email] send exception", error);
    return { sent: false, error, to };
  }
}

export function buildSopSubmittedEmail(opts: {
  title: string;
  department: string;
  submitterName: string;
  kind: "policy" | "checklist";
}): { subject: string; text: string; link: string } {
  const link = `${staffAppBase()}/admin/sop-review`;
  return {
    subject: `[SOP review] ${opts.title}`,
    link,
    text: [
      `${opts.submitterName} submitted an SOP for review.`,
      "",
      `Title: ${opts.title}`,
      `Department: ${opts.department}`,
      `Type: ${opts.kind === "checklist" ? "Checklist (AI Builder)" : "Policy"}`,
      "",
      `Review: ${link}`,
      "",
      "— Siya staff portal —",
    ].join("\n"),
  };
}

export async function notifySopSubmittedForReview(opts: {
  title: string;
  department: string;
  submitterName: string;
  adminEmails: string[];
  /** Prefer these when lead self-approves */
  reviewerEmails?: string[];
  kind: "policy" | "checklist";
}): Promise<SopEmailSendResult> {
  const to = resolveReviewerEmails(opts.reviewerEmails?.length ? opts.reviewerEmails : opts.adminEmails);
  console.info("[sop-review-email] submit notify", {
    title: opts.title,
    kind: opts.kind,
    adminCount: opts.adminEmails?.length ?? 0,
    reviewerCount: opts.reviewerEmails?.length ?? 0,
    resolvedToCount: to.length,
  });
  const { subject, text } = buildSopSubmittedEmail(opts);
  return sendResend({ to, subject, text });
}

export function buildSopApprovedEmail(opts: {
  title: string;
  ownerName: string | null;
  kind: "policy" | "checklist";
  sopId?: string;
}): { subject: string; text: string; link: string } {
  const viewPath =
    opts.kind === "checklist"
      ? "/admin/task-templates"
      : opts.sopId
        ? `/memory/knowledge/sops?edit=${encodeURIComponent(opts.sopId)}`
        : "/memory/knowledge/sops";
  const link = `${staffAppBase()}${viewPath}`;
  return {
    subject: `[SOP approved] ${opts.title}`,
    link,
    text: [
      `Hi ${opts.ownerName || "there"},`,
      "",
      `Your SOP “${opts.title}” was approved and is now live.`,
      "",
      `View: ${link}`,
      "",
      "— Siya staff portal —",
    ].join("\n"),
  };
}

export async function notifySopApproved(opts: {
  title: string;
  ownerEmail: string | null;
  ownerName: string | null;
  kind: "policy" | "checklist";
  sopId?: string;
}): Promise<SopEmailSendResult> {
  if (!opts.ownerEmail) {
    console.warn("[sop-review-email] approve: no owner email — skipping");
    return { sent: false, error: "no_recipient", to: [] };
  }
  const { subject, text } = buildSopApprovedEmail(opts);
  return sendResend({ to: [opts.ownerEmail], subject, text });
}

export function buildSopSentBackEmail(opts: {
  title: string;
  ownerName: string | null;
  comment: string;
  sopId: string;
}): { subject: string; text: string; link: string } {
  const link = `${staffAppBase()}/memory/knowledge/sops?edit=${encodeURIComponent(opts.sopId)}`;
  return {
    subject: `[SOP needs changes] ${opts.title}`,
    link,
    text: [
      `Hi ${opts.ownerName || "there"},`,
      "",
      `Your SOP “${opts.title}” was sent back to draft.`,
      "",
      `Feedback: ${opts.comment.slice(0, 2000)}`,
      "",
      `Edit: ${link}`,
      "",
      "— Siya staff portal —",
    ].join("\n"),
  };
}

export async function notifySopSentBack(opts: {
  title: string;
  ownerEmail: string | null;
  ownerName: string | null;
  comment: string;
  sopId: string;
}): Promise<SopEmailSendResult> {
  if (!opts.ownerEmail) {
    console.warn("[sop-review-email] send-back: no owner email — skipping");
    return { sent: false, error: "no_recipient", to: [] };
  }
  const { subject, text } = buildSopSentBackEmail(opts);
  return sendResend({ to: [opts.ownerEmail], subject, text });
}
