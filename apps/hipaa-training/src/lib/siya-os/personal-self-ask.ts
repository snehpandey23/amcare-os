/**
 * Ask — personal attendance hours and Feedback Friday inbox.
 * Signed-in user only. Same pattern as practice-stats: live data, never a missing-guide stop.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import type { AttendanceHoursReport } from "@/lib/attendance-hours-api";
import { formatHoursMinutes } from "@/lib/attendance-hours-api";
import type { RecipientFacingFeedback } from "@/lib/team-feedback-api";

export type PersonalSelfAnswer = {
  message: string;
  sources: { title: string; id: string }[];
  links: { label: string; href: string }[];
};

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ");
}

export function isMyAttendanceQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;
  if (/\b(team|their|his|her|everyone|all staff|ops)\b/.test(t) && !/\bmy\b/.test(t)) return false;
  if (/\b(how('?s| is| are)|what('?s| is)|show|see|check)\s+my\s+attendance\b/.test(t)) return true;
  if (/\bmy\s+attendance(\s+hours?)?\b/.test(t)) return true;
  if (/\battendance\b/.test(t) && /\b(my|i|me)\b/.test(t)) return true;
  return false;
}

export function isMyFeedbackQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;
  if (/\b(give|submit|send|share|leave|write|open)\b/.test(t) && /\bfeedback\b/.test(t)) return false;
  if (/\bhow\b/.test(t) && /\b(give|submit)\b/.test(t)) return false;
  if (/\bwhat feedback have i received\b/.test(t)) return true;
  if (/\bwhat feedback (did|do) i (get|have|receive)\b/.test(t)) return true;
  if (/\b(my|i)\s+feedback\b/.test(t) && !/\bgive\b/.test(t)) return true;
  if (/\bfeedback (i('ve| have)|i)\s+received\b/.test(t)) return true;
  if (/\bfeedback i('ve| have) (got|gotten|received)\b/.test(t)) return true;
  return false;
}

function istMonth(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
  }).format(now);
}

export function formatAttendanceMessage(report: AttendanceHoursReport | null): string {
  const person = report?.people?.[0];
  const roll = person?.monthRollup;
  if (!person || !roll || roll.dayCount === 0) {
    return [
      "**Your attendance hours** (IST Working / Break / Focus — this account only):",
      "",
      "No hours logged for this month yet. Open **My day** and set Working when you start — I won’t invent a roster.",
    ].join("\n");
  }
  return [
    "**Your attendance hours** (IST, this account only):",
    "",
    `**${person.monthRollupLabel || report?.fromDate || "This month"}** — ${roll.dayCount} day${roll.dayCount === 1 ? "" : "s"} with hours.`,
    `Working **${formatHoursMinutes(roll.workingMinutes)}** · Break ${formatHoursMinutes(roll.breakMinutes)} · Focus ${formatHoursMinutes(roll.focusMinutes)}.`,
    "",
    "This is the same self-scoped hours view as My day. Not a schedule, and not someone else’s attendance.",
  ].join("\n");
}

export function formatFeedbackInboxMessage(items: RecipientFacingFeedback[]): string {
  if (!items.length) {
    return [
      "**Feedback you’ve received** (Feedback Friday inbox, this account only):",
      "",
      "Nothing in your inbox yet. Notes people send you show up here — anonymous ones never include the giver’s name.",
    ].join("\n");
  }
  const shown = items.slice(0, 5);
  const lines = [
    "**Feedback you’ve received** (Feedback Friday inbox, this account only):",
    "",
    `${items.length} note${items.length === 1 ? "" : "s"}. Latest:`,
  ];
  for (const item of shown) {
    const who = item.attribution.mode === "named" ? item.attribution.displayName : "Anonymous";
    const day = item.createdAt.slice(0, 10);
    const body = item.body.replace(/\s+/g, " ").trim().slice(0, 180);
    lines.push(`• ${day} · ${who}: ${body}${item.body.length > 180 ? "…" : ""}`);
  }
  if (items.length > shown.length) {
    lines.push("", `+${items.length - shown.length} more in **Feedback**.`);
  }
  return lines.join("\n");
}

export async function answerMyAttendanceQuery(token: string): Promise<PersonalSelfAnswer | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  try {
    const month = istMonth();
    const res = await fetch(`${base}/api/attendance/hours?scope=me&month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const report = (await res.json()) as AttendanceHoursReport;
    return {
      message: formatAttendanceMessage(report),
      sources: [{ title: "Attendance hours (self)", id: "attendance-hours-me" }],
      links: [{ label: "My day", href: "/" }],
    };
  } catch {
    return null;
  }
}

export async function answerMyFeedbackQuery(token: string): Promise<PersonalSelfAnswer | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/team-feedback/inbox`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { items?: RecipientFacingFeedback[] };
    return {
      message: formatFeedbackInboxMessage(data.items ?? []),
      sources: [{ title: "Feedback inbox", id: "team-feedback-inbox" }],
      links: [{ label: "Feedback", href: "/feedback" }],
    };
  } catch {
    return null;
  }
}
