/**
 * Employee of the month — nomination nudge email (Resend).
 * Cron: 20th and 25th IST.
 */
import { escalationFromAddress } from "@/lib/siya-os/escalation-email";
import {
  filterRecipientsForMode,
  resolveWeekdayEmailMode,
  weekdayPilotAllowlist,
  weekdayTestRecipient,
  type WeekdayEmailMode,
} from "@/lib/team-weekday-email";

const FEEDBACK_EOM = "https://siya-staff-assist.vercel.app/feedback#employee-of-the-month";

export { filterRecipientsForMode, resolveWeekdayEmailMode };
export type { WeekdayEmailMode };

export function buildEomNominationNudgeMessage(opts: {
  firstName: string;
  monthLabel?: string;
}): { subject: string; text: string } {
  const firstName = opts.firstName.trim() || "there";
  const monthBit = opts.monthLabel ? ` for ${opts.monthLabel}` : "";
  return {
    subject: "Have you nominated for employee of the month yet?",
    text: `Hi ${firstName}.\n\nHave you nominated yourself or a peer yet for employee of the month${monthBit}?\n\nWinner gets ₹5,000 as an Amazon voucher or a preferred gift voucher of the same value. Add a short why — one concrete thing that helped patients, the team, or the month.\n\nNominate here: ${FEEDBACK_EOM}\n\n— your Siya Assist`,
  };
}

export type EomNudgeSendResult = {
  sent: boolean;
  delivery: WeekdayEmailMode | "skipped";
  to?: string;
  wouldSendTo?: string;
  resendId?: string;
  error?: string;
  preview?: { subject: string; text: string };
};

export async function sendEomNominationNudgeEmail(opts: {
  to: string;
  firstName: string;
  monthLabel?: string;
  mode: WeekdayEmailMode;
}): Promise<EomNudgeSendResult> {
  const { subject, text } = buildEomNominationNudgeMessage({
    firstName: opts.firstName,
    monthLabel: opts.monthLabel,
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
    subjectOut = `[TEST EOM] ${subject}`;
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
