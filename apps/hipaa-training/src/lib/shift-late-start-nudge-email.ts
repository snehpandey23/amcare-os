/**
 * Late shift-start nudge email (Resend) — staff + lead + HR + admin.
 * Same delivery modes as weekday / shift-reminder mail.
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

export function buildLateStartNudgeCopy(opts: {
  staffName: string;
  staffEmail: string;
  recipientRole: "staff" | "department_lead" | "hr" | "admin";
  shiftStart: string;
  shiftEnd: string | null;
  rawCell: string;
  minutesLate: number;
}): { subject: string; text: string } {
  const start = formatIst(opts.shiftStart);
  const end = opts.shiftEnd ? formatIst(opts.shiftEnd) : "";
  const who =
    opts.recipientRole === "staff"
      ? "you"
      : `${opts.staffName} (${opts.staffEmail})`;
  const subject =
    opts.recipientRole === "staff"
      ? `Shift check-in overdue · ${start} IST`
      : `Late start · ${opts.staffName} · ${start} IST`;
  const text = [
    opts.recipientRole === "staff"
      ? `Hi,`
      : `Heads-up (${opts.recipientRole.replace("_", " ")}),`,
    "",
    `${who} ${opts.recipientRole === "staff" ? "are" : "is"} past the rostered start by about ${opts.minutesLate} minutes with no Start shift / Working declared yet.`,
    "",
    `Roster: ${opts.rawCell.trim() || "(see schedule)"}`,
    `Scheduled start: ${start} IST${end ? ` · end ${end} IST` : ""}.`,
    "",
    opts.recipientRole === "staff"
      ? `Please open My day → Start shift and set Working (or Focus) so attendance hours stay accurate.`
      : `This is a one-time nudge for this rostered start (not a repeating alert). Staff was also emailed.`,
    "",
    `— Siya Assist`,
  ].join("\n");
  return { subject, text };
}

export type LateStartSendResult = {
  sent: boolean;
  delivery: WeekdayEmailMode | "skipped";
  role: string;
  to?: string;
  wouldSendTo?: string;
  resendId?: string;
  error?: string;
  preview?: { subject: string; text: string };
};

export async function sendLateStartNudgeEmail(opts: {
  to: string;
  role: "staff" | "department_lead" | "hr" | "admin";
  staffName: string;
  staffEmail: string;
  shiftStart: string;
  shiftEnd: string | null;
  rawCell: string;
  minutesLate: number;
  mode: WeekdayEmailMode;
}): Promise<LateStartSendResult> {
  const { subject, text } = buildLateStartNudgeCopy({
    staffName: opts.staffName,
    staffEmail: opts.staffEmail,
    recipientRole: opts.role,
    shiftStart: opts.shiftStart,
    shiftEnd: opts.shiftEnd,
    rawCell: opts.rawCell,
    minutesLate: opts.minutesLate,
  });
  const preview = { subject, text };
  const wouldSendTo = opts.to.trim().toLowerCase();

  if (opts.mode === "dry_run") {
    return { sent: false, delivery: "dry_run", role: opts.role, wouldSendTo, preview };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      sent: false,
      delivery: opts.mode,
      role: opts.role,
      wouldSendTo,
      error: "RESEND_API_KEY not configured",
      preview,
    };
  }

  let to = wouldSendTo;
  let subjectOut = subject;
  if (opts.mode === "test_recipient") {
    const testTo = weekdayTestRecipient();
    if (!testTo) {
      return {
        sent: false,
        delivery: "test_recipient",
        role: opts.role,
        wouldSendTo,
        error: "SIYA_WEEKDAY_TEST_TO or SIYA_ESCALATION_TEST_TO required",
        preview,
      };
    }
    to = testTo;
    subjectOut = `[TEST late-start · ${opts.role}] ${subject}`;
  }

  if (opts.mode === "pilot") {
    const allow = weekdayPilotAllowlist();
    if (!allow.includes(wouldSendTo)) {
      return {
        sent: false,
        delivery: "pilot",
        role: opts.role,
        wouldSendTo,
        error: "not_in_pilot_allowlist",
        preview,
      };
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
        role: opts.role,
        wouldSendTo,
        error: body.message || `Resend HTTP ${res.status}`,
        preview,
      };
    }
    return {
      sent: true,
      delivery: opts.mode,
      role: opts.role,
      to,
      wouldSendTo,
      resendId: body.id,
      preview,
    };
  } catch (e) {
    return {
      sent: false,
      delivery: opts.mode,
      role: opts.role,
      wouldSendTo,
      error: e instanceof Error ? e.message : "Send failed",
      preview,
    };
  }
}
