/**
 * Ask — admin/lead view of another person's attendance hours (IST).
 * Reuses GET /api/attendance/hours?scope=team&from&to — not self-only.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import type { AttendanceHoursReport } from "@/lib/attendance-hours-api";
import { formatHoursMinutes } from "@/lib/attendance-hours-api";
import {
  parseMySchedulePeriod,
  type SchedulePeriod,
  istWeekRangeContaining,
} from "./shift-roster-ask";

export type PersonAttendanceAnswer = {
  message: string;
  sources: { title: string; id: string }[];
  links: { label: string; href: string }[];
  forbidden?: boolean;
};

const MONTH_NAMES: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ");
}

function istToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function monthEnd(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function addMonthsYmd(ymd: string, deltaMonths: number): { year: number; month: number } {
  const y = Number(ymd.slice(0, 4));
  const m = Number(ymd.slice(5, 7));
  const idx = y * 12 + (m - 1) + deltaMonths;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

/** Attendance-specific period: last month, multi-month ranges, else schedule parser. */
export function parseAttendanceHoursPeriod(message: string): SchedulePeriod {
  const t = norm(message);
  const today = istToday();
  const yearMatch = message.match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : Number(today.slice(0, 4));

  if (/\blast\s+month\b/.test(t)) {
    const prev = addMonthsYmd(today, -1);
    const from = `${prev.year}-${String(prev.month).padStart(2, "0")}-01`;
    const to = monthEnd(prev.year, prev.month);
    const label = new Date(Date.UTC(prev.year, prev.month - 1, 1)).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    return { from, to, label };
  }

  if (/\blast\s+week\b/.test(t)) {
    return istWeekRangeContaining(today, -1);
  }

  // Collect month tokens in order of appearance → span first→last when 2+.
  const monthHits: { num: number; index: number; name: string }[] = [];
  for (const [name, num] of Object.entries(MONTH_NAMES)) {
    const re = new RegExp(`\\b${name}\\b`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(t)) !== null) {
      monthHits.push({ num, index: m.index, name });
    }
  }
  monthHits.sort((a, b) => a.index - b.index);
  // Dedupe same month name repeats
  const uniqueOrdered: { num: number; name: string }[] = [];
  for (const hit of monthHits) {
    if (uniqueOrdered.length && uniqueOrdered[uniqueOrdered.length - 1]!.num === hit.num) continue;
    // Prefer long names over abbreviations when both match same span — skip short if long already at index
    if (uniqueOrdered.some((u) => u.num === hit.num)) continue;
    uniqueOrdered.push({ num: hit.num, name: hit.name });
  }

  if (uniqueOrdered.length >= 2) {
    const first = uniqueOrdered[0]!;
    const last = uniqueOrdered[uniqueOrdered.length - 1]!;
    let y1 = year;
    let y2 = year;
    // Cross-year: Dec → Jan
    if (last.num < first.num) y2 = year + 1;
    const from = `${y1}-${String(first.num).padStart(2, "0")}-01`;
    const to = monthEnd(y2, last.num);
    const label = `${capitalize(first.name)}–${capitalize(last.name)} ${y1 === y2 ? y1 : `${y1}/${y2}`}`;
    return { from, to, label };
  }

  return parseMySchedulePeriod(message);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const ATTENDANCE_TOPIC =
  /\b(attendance(\s+hours?|\s+record)?|hours?\s+worked|working\s+time|break\s+time|break\s+and\s+working|working\s+and\s+break|time\s+totals?|hours?\s+totals?|break\/working|working\/break)\b/;

const ATTENDANCE_TOPIC_LOOSE =
  /\b(attendance|hours?|working\s+time|break\s+time|time\s+(logged|worked)|break\s+and\s+working|working\s+and\s+break)\b/;

/**
 * Admin/lead ask about a named person's attendance/hours (not self).
 */
export function isPersonAttendanceQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;
  // Self-only stays on my-attendance path.
  if (/\b(my|mine|i|me)\b/.test(t) && !/\b(his|her|their|[a-z]{2,}'s)\b/.test(t)) {
    if (/\b(my|mine)\b/.test(t) || /\b(how many hours did i|hours did i work)\b/.test(t)) {
      return false;
    }
  }
  if (/\bhow many hours did i\b/.test(t) || /\bmy\s+attendance\b/.test(t)) return false;
  // Live presence is Team pulse.
  if (
    /\b(right\s+now|currently|on\s+shift\s+now|who(?:'s| is| are)\s+(?:on\s+shift|working|online))\b/.test(t) &&
    !ATTENDANCE_TOPIC.test(t)
  ) {
    return false;
  }

  // how many hours did NAME work …
  if (/\bhow\s+(many\s+hours|much\s+time)\s+did\s+[a-z][a-z-]{1,30}\s+work\b/.test(t)) return true;
  // what were NAME's hours …
  if (/\bwhat\s+were\s+[a-z][a-z-]{1,30}(?:'s|’s)?\s+hours\b/.test(t)) return true;
  // NAME's attendance / hours / working time …
  if (
    /\b[a-z][a-z-]{1,30}(?:'s|’s)\s+(attendance(\s+(hours?|record))?|hours?|working\s+time|break\s+time|break\s+and\s+working)\b/.test(
      t,
    )
  ) {
    return true;
  }
  // verb + NAME's attendance|hours …
  if (
    /\b(pull\s+up|show(\s+me)?|get\s+me|look\s+up|check|open|fetch|list|where\s+(?:are|is)|where'?s|i\s+want\s+to\s+know|i\s+need)\b[\s\S]{0,40}\b[a-z][a-z-]{1,30}(?:'s|’s)\b[\s\S]{0,40}/.test(
      t,
    ) &&
    ATTENDANCE_TOPIC_LOOSE.test(t)
  ) {
    return true;
  }
  // pull up break/working totals for NAME …
  if (
    /\b(pull\s+up|show|get|fetch)\b[\s\S]{0,24}\b(break|working)\b[\s\S]{0,40}\bfor\s+[a-z][a-z-]{1,30}\b/.test(
      t,
    )
  ) {
    return true;
  }
  // attendance for NAME / hours for NAME
  if (
    /\b(attendance|hours|working\s+time|break\s+time)\s+for\s+[a-z][a-z-]{1,30}\b/.test(t) &&
    !/\bfor\s+(me|myself|this\s+week|last\s+month|august|september)\b/.test(t)
  ) {
    // "attendance for August" is not a person — require name not a month/time word
    const m = t.match(/\b(?:attendance|hours|working\s+time|break\s+time)\s+for\s+([a-z][a-z-]{1,30})\b/);
    if (m && !MONTH_NAMES[m[1]!] && !/^(last|this|next|today|tomorrow|week|month)$/.test(m[1]!)) {
      return true;
    }
  }
  // list NAME's hours from … / show NAME's hours August…
  if (/\b(list|show|get|pull)\b[\s\S]{0,20}\b[a-z][a-z-]{1,30}(?:'s|’s)\s+hours\b/.test(t)) {
    return true;
  }
  return false;
}

/** Extract the staff member name the asker is asking about. */
export function extractAttendanceSubjectName(message: string): string | null {
  const raw = message.trim();
  const patterns: RegExp[] = [
    /\bhow\s+(?:many\s+hours|much\s+time)\s+did\s+([A-Za-z][A-Za-z-]{1,30})\s+work\b/i,
    /\bwhat\s+were\s+([A-Za-z][A-Za-z-]{1,30})(?:'s|’s)?\s+hours\b/i,
    /\b(?:pull\s+up|show(?:\s+me)?|get\s+me|look\s+up|check|open|fetch|list|where\s+(?:are|is)|where'?s|i\s+want\s+to\s+know|i\s+need)\s+([A-Za-z][A-Za-z-]{1,30})(?:'s|’s)\b/i,
    /\b([A-Za-z][A-Za-z-]{1,30})(?:'s|’s)\s+(?:attendance|hours|working\s+time|break\s+time|break\s+and\s+working)\b/i,
    /\b(?:break|working)(?:\s+and\s+(?:break|working))?\s+totals?\s+for\s+([A-Za-z][A-Za-z-]{1,30})\b/i,
    /\b(?:attendance|hours|working\s+time|break\s+time)\s+for\s+([A-Za-z][A-Za-z-]{1,30})\b/i,
    /\b(?:list|show|get|pull)\s+([A-Za-z][A-Za-z-]{1,30})(?:'s|’s)\s+hours\b/i,
  ];
  for (const re of patterns) {
    const m = raw.match(re);
    if (!m?.[1]) continue;
    const name = m[1].trim();
    const lower = name.toLowerCase();
    if (MONTH_NAMES[lower] || /^(last|this|next|my|the|a|an|his|her|their|team)$/.test(lower)) {
      continue;
    }
    return name;
  }
  return null;
}

function namesMatch(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const aw = na.split(" ").filter(Boolean);
  const bw = nb.split(" ").filter(Boolean);
  if (aw.length === 1 && bw.some((w) => w === aw[0] && w.length >= 3)) return true;
  if (bw.length === 1 && aw.some((w) => w === bw[0] && w.length >= 3)) return true;
  return false;
}

export function formatPersonAttendanceMessage(
  report: AttendanceHoursReport,
  subjectName: string,
  period: SchedulePeriod,
): string {
  const people = report.people ?? [];
  const matches = people.filter(
    (p) =>
      namesMatch(p.subjectLabel, subjectName) ||
      namesMatch(p.email.split("@")[0] || "", subjectName) ||
      namesMatch(p.email, subjectName),
  );

  if (!matches.length) {
    return [
      `**No attendance match for “${subjectName}”** in **${period.label}** (IST).`,
      "",
      people.length
        ? `Team hours loaded (${people.length} people) but none matched that name. Try the name as it appears on **Ops → Attendance hours**.`
        : "No team hours in that range yet — I won’t invent totals.",
      "",
      `_Range ${period.from} → ${period.to} · source: attendance hours (team)_`,
    ].join("\n");
  }

  const lines: string[] = [
    `**${matches.length === 1 ? matches[0]!.subjectLabel : subjectName} — attendance hours** (${period.label}, IST)`,
    `_Admin/lead team view · ${period.from} → ${period.to}_`,
    "",
  ];

  for (const person of matches) {
    const roll = person.monthRollup;
    if (!roll || roll.dayCount === 0) {
      lines.push(`**${person.subjectLabel}** — no hours logged in this range.`);
      continue;
    }
    lines.push(
      `**${person.subjectLabel}** (${person.email}) — ${roll.dayCount} day${roll.dayCount === 1 ? "" : "s"} with hours.`,
    );
    lines.push(
      `Working **${formatHoursMinutes(roll.workingMinutes)}** · Break ${formatHoursMinutes(roll.breakMinutes)} · Focus ${formatHoursMinutes(roll.focusMinutes)} · Total ${formatHoursMinutes(roll.totalMinutes)}.`,
    );
    if (typeof roll.payrollEligibleMinutes === "number") {
      lines.push(`Payroll-eligible (reporting): ${formatHoursMinutes(roll.payrollEligibleMinutes)}.`);
    }
    lines.push("");
  }

  lines.push("Same IST Working / Break / Focus derivation as **Ops → Attendance hours**. Not a schedule roster.");
  return lines.join("\n");
}

export async function answerPersonAttendanceQuery(
  message: string,
  token: string,
): Promise<PersonAttendanceAnswer | null> {
  if (!isPersonAttendanceQuery(message)) return null;
  const subject = extractAttendanceSubjectName(message);
  if (!subject) {
    return {
      message: [
        "I can pull **another person’s attendance hours** for admins/leads — name who you mean.",
        "",
        "Example: **pull up Anmol’s attendance for August and September** or **how many hours did Sonu work last month?**",
      ].join("\n"),
      sources: [{ title: "Attendance hours (team)", id: "attendance-hours-person" }],
      links: [{ label: "Ops", href: "/ops" }],
    };
  }

  const period = parseAttendanceHoursPeriod(message);
  const base = getTrainingApiUrl();
  if (!base) return null;

  try {
    const q = new URLSearchParams({
      scope: "team",
      from: period.from,
      to: period.to,
    });
    const res = await fetch(`${base}/api/attendance/hours?${q}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 403) {
      return {
        message: [
          "**Someone else’s attendance hours** are for **admins and department leads** only.",
          "",
          "For **your** hours, ask **what’s my attendance?**",
        ].join("\n"),
        sources: [{ title: "Attendance hours (forbidden)", id: "attendance-hours-person" }],
        links: [
          { label: "My day", href: "/" },
          { label: "Ops", href: "/ops" },
        ],
        forbidden: true,
      };
    }
    if (!res.ok) return null;
    const report = (await res.json()) as AttendanceHoursReport;
    return {
      message: formatPersonAttendanceMessage(report, subject, period),
      sources: [
        {
          title: `Attendance hours · ${subject} (${period.label})`,
          id: "attendance-hours-person",
        },
      ],
      links: [
        { label: "Ops", href: "/ops" },
        { label: "Team", href: "/admin/team" },
      ],
    };
  } catch {
    return null;
  }
}
