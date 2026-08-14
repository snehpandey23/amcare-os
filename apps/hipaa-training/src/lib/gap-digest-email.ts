/**
 * Weekly knowledge-gap digest for department leads (Resend).
 * Category + task_label only — never includes Ask question text.
 */

import { escalationFromAddress } from "./siya-os/escalation-email";
import { SIYA_ASSISTANT_CANONICAL_URL } from "./siya-os/public-url";

export type LeadGapDigestGap = {
  id: string;
  department: string;
  taskLabel: string;
  createdAt: string;
};

export type LeadGapDigestEmailInput = {
  to: string;
  name: string | null;
  weekStart: string;
  departments: string[];
  gaps: LeadGapDigestGap[];
};

function staffAppBase(): string {
  return SIYA_ASSISTANT_CANONICAL_URL.replace(/\/$/, "");
}

export function buildLeadGapDigestEmail(opts: LeadGapDigestEmailInput): { subject: string; text: string } {
  const link = `${staffAppBase()}/team`;
  const lines = opts.gaps.slice(0, 40).map((g, i) => {
    const day = g.createdAt.slice(0, 10);
    return `${i + 1}. [${g.department}] ${g.taskLabel || "Missing approved policy"} (${day})`;
  });
  return {
    subject: `[Siya] Knowledge gaps this week — ${opts.departments.join(", ") || "your departments"}`,
    text: [
      `Hi ${opts.name?.split(/\s+/)[0] || "there"},`,
      "",
      `Open knowledge gaps for week of ${opts.weekStart} (your lead departments).`,
      "",
      "Important: these counts are Notify owner clicks in Ask — not every unanswered query.",
      "Each row is category/task only. Verbatim questions are never emailed or stored for digests.",
      "",
      ...lines,
      opts.gaps.length > 40 ? `…and ${opts.gaps.length - 40} more open gaps.` : "",
      "",
      `Review & mark handled: ${link}`,
      "",
      "— Siya staff portal (weekly lead digest) —",
    ]
      .filter((l) => l !== "")
      .join("\n"),
  };
}

export async function sendLeadGapDigestEmail(
  opts: LeadGapDigestEmailInput,
): Promise<{ sent: boolean; error?: string; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = opts.to.trim().toLowerCase();
  if (!to.includes("@")) return { sent: false, error: "no_recipient" };
  if (!apiKey) return { sent: false, error: "RESEND_API_KEY not configured" };

  const { subject, text } = buildLeadGapDigestEmail(opts);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: escalationFromAddress(),
        to: [to],
        subject,
        text,
      }),
    });
    const bodyText = await res.text();
    if (!res.ok) {
      return { sent: false, error: bodyText.slice(0, 500) || res.statusText };
    }
    let id: string | undefined;
    try {
      id = (JSON.parse(bodyText) as { id?: string }).id;
    } catch {
      /* ignore */
    }
    return { sent: true, id };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "send failed" };
  }
}
