/**
 * Weekday team message email (Resend) — warm Siya Assist tone, usage-segment copy.
 */
import { escalationFromAddress } from "@/lib/siya-os/escalation-email";
import {
  buildWeekdayMessage,
  type UsageSegment,
  type WeekdayTheme,
} from "@/lib/team-weekday-messages";

export type WeekdayEmailMode = "live" | "pilot" | "dry_run" | "test_recipient";

export function resolveWeekdayEmailMode(requested?: string | null): WeekdayEmailMode {
  const raw = (requested || process.env.SIYA_WEEKDAY_EMAIL_MODE || "pilot").trim().toLowerCase();
  if (raw === "live") return "live";
  if (raw === "dry_run" || raw === "dryrun") return "dry_run";
  if (raw === "test" || raw === "test_recipient") return "test_recipient";
  return "pilot";
}

export function weekdayPilotAllowlist(): string[] {
  const raw =
    process.env.SIYA_WEEKDAY_PILOT_TO?.trim() ||
    process.env.SIYA_ESCALATION_TEST_TO?.trim() ||
    "qa-test@siya.health";
  return raw
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
}

export function weekdayTestRecipient(): string | null {
  const to = process.env.SIYA_WEEKDAY_TEST_TO?.trim() || process.env.SIYA_ESCALATION_TEST_TO?.trim();
  return to && to.includes("@") ? to : null;
}

export function filterRecipientsForMode<T extends { email: string }>(
  recipients: T[],
  mode: WeekdayEmailMode,
): T[] {
  if (mode === "live") return recipients;
  const allow = new Set(weekdayPilotAllowlist());
  return recipients.filter((r) => allow.has(r.email.trim().toLowerCase()));
}

export type WeekdaySendResult = {
  sent: boolean;
  delivery: WeekdayEmailMode | "skipped";
  to?: string;
  wouldSendTo?: string;
  resendId?: string;
  error?: string;
  preview?: { subject: string; text: string };
};

export async function sendWeekdayTeamEmail(opts: {
  to: string;
  firstName: string;
  theme: WeekdayTheme;
  segment: UsageSegment;
  mode: WeekdayEmailMode;
}): Promise<WeekdaySendResult> {
  const { subject, text } = buildWeekdayMessage({
    theme: opts.theme,
    segment: opts.segment,
    firstName: opts.firstName,
  });

  const preview = { subject, text };
  const wouldSendTo = opts.to.trim().toLowerCase();

  if (opts.mode === "dry_run") {
    return { sent: false, delivery: "dry_run", wouldSendTo, preview };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, delivery: opts.mode, wouldSendTo, error: "RESEND_API_KEY not configured", preview };
  }

  let to = wouldSendTo;
  let subjectOut = subject;
  if (opts.mode === "test_recipient") {
    const testTo = weekdayTestRecipient();
    if (!testTo) {
      return {
        sent: false,
        delivery: "test_recipient",
        wouldSendTo,
        error: "SIYA_WEEKDAY_TEST_TO or SIYA_ESCALATION_TEST_TO required",
        preview,
      };
    }
    to = testTo;
    subjectOut = `[TEST weekday] ${subject}`;
  }

  if (opts.mode === "pilot") {
    const allow = weekdayPilotAllowlist();
    if (!allow.includes(wouldSendTo)) {
      return { sent: false, delivery: "pilot", wouldSendTo, error: "not_in_pilot_allowlist", preview };
    }
  }

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
        subject: subjectOut,
        text,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return {
        sent: false,
        delivery: opts.mode,
        wouldSendTo,
        error: body.message || `Resend HTTP ${res.status}`,
        preview,
      };
    }
    return {
      sent: true,
      delivery: opts.mode,
      to,
      wouldSendTo,
      resendId: body.id,
      preview,
    };
  } catch (e) {
    return {
      sent: false,
      delivery: opts.mode,
      wouldSendTo,
      error: e instanceof Error ? e.message : "Send failed",
      preview,
    };
  }
}
