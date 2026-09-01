/**
 * Gentle shift-start reminder (Resend) — same delivery modes as weekday team mail.
 */
import { escalationFromAddress } from "@/lib/siya-os/escalation-email";
import {
  filterRecipientsForMode,
  resolveWeekdayEmailMode,
  weekdayPilotAllowlist,
  weekdayTestRecipient,
  type WeekdayEmailMode,
} from "@/lib/team-weekday-email";

export { filterRecipientsForMode, resolveWeekdayEmailMode };

function formatIst(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function buildShiftReminderCopy(opts: {
  firstName: string;
  shiftStart: string;
  shiftEnd: string | null;
  rawCell: string;
}): { subject: string; text: string } {
  const start = formatIst(opts.shiftStart);
  const end = opts.shiftEnd ? formatIst(opts.shiftEnd) : "";
  const subject = `Shift reminder · ${start} IST`;
  const text = [
    `Hi ${opts.firstName},`,
    "",
    `Your rostered shift is coming up (or just started):`,
    `  ${opts.rawCell.trim()}`,
    `  Starts ${start} IST${end ? ` · ends ${end} IST` : ""}.`,
    "",
    `When you begin, tap Start shift on My day and set Working (or Focus) so your day is logged correctly.`,
    "",
    `This is a gentle nudge — same view you and ops share for “did today go as planned.”`,
    "",
    `— Siya Assist`,
  ].join("\n");
  return { subject, text };
}

export type ShiftReminderSendResult = {
  sent: boolean;
  delivery: WeekdayEmailMode | "skipped";
  to?: string;
  wouldSendTo?: string;
  resendId?: string;
  error?: string;
  preview?: { subject: string; text: string };
};

export async function sendShiftRosterReminderEmail(opts: {
  to: string;
  firstName: string;
  shiftStart: string;
  shiftEnd: string | null;
  rawCell: string;
  mode: WeekdayEmailMode;
}): Promise<ShiftReminderSendResult> {
  const { subject, text } = buildShiftReminderCopy({
    firstName: opts.firstName,
    shiftStart: opts.shiftStart,
    shiftEnd: opts.shiftEnd,
    rawCell: opts.rawCell,
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
    subjectOut = `[TEST shift] ${subject}`;
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
    return { sent: true, delivery: opts.mode, to, wouldSendTo, resendId: body.id, preview };
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
