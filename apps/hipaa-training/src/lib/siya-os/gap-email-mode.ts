/**
 * Gap / Notify-owner email delivery modes.
 * Verification must never look identical to a live founder-inbox send.
 */

export type GapEmailDeliveryMode = "live" | "dry_run" | "test_recipient";

export type GapEmailSendResult = {
  /** True only when Resend accepted a message (live or test_recipient). */
  sent: boolean;
  /** How delivery was handled — always set; never omit in API reports. */
  delivery: GapEmailDeliveryMode | "skipped";
  /** Actual Resend `to` when sent; omitted on dry_run. */
  to?: string;
  /** Production founder/escalation inbox that would have received a live send. */
  wouldSendTo?: string;
  error?: string;
  preview?: { subject: string; text: string };
};

/** Synthetic agent/QA probes — force dry_run unless an explicit live override is allowed. */
const SYNTHETIC_PROBE =
  /\bzzzxxy\b|ui-notify-owner|notify-owner-probe|gap-email-(?:auto-)?probe|e2e (?:prior|context|notify)|auto-probe\b/i;

export function isSyntheticGapEmailProbe(text: string | null | undefined): boolean {
  return Boolean(text && SYNTHETIC_PROBE.test(text));
}

export function productionEscalationInbox(): string {
  return (process.env.SIYA_ESCALATION_TO || "bot@siya.health").trim();
}

export function gapEmailTestRecipient(): string | null {
  const to = process.env.SIYA_ESCALATION_TEST_TO?.trim();
  return to && to.includes("@") ? to : null;
}

/**
 * Resolve delivery mode for a gap email.
 * Priority: synthetic probe → dry_run; request/env mode; default live.
 */
export function resolveGapEmailDeliveryMode(opts: {
  requested?: string | null;
  probeText?: string | null;
}): GapEmailDeliveryMode {
  if (isSyntheticGapEmailProbe(opts.probeText)) return "dry_run";

  const raw = (opts.requested || process.env.SIYA_ESCALATION_EMAIL_MODE || "live")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");

  if (raw === "dry_run" || raw === "dryrun") return "dry_run";
  if (raw === "test" || raw === "test_recipient" || raw === "test_inbox") return "test_recipient";
  return "live";
}

export function parseRequestedEmailMode(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const v = (body as { emailMode?: unknown }).emailMode;
  return typeof v === "string" ? v : null;
}
