/**
 * Ask — self schedule + lead/admin team MA roster from shift_roster.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";

export type ShiftRosterRowDto = {
  id: string;
  rosterDate: string;
  personKey: string;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  shiftStart: string | null;
  shiftEnd: string | null;
  shiftLabel: string | null;
  rawCell: string;
  isOff: boolean;
};

export type MyScheduleAnswer = {
  message: string;
  sources: { title: string; id: string }[];
  periodLabel: string;
  rowCount: number;
};

export type TeamRosterAnswer = {
  message: string;
  sources: { title: string; id: string }[];
  periodLabel: string;
  rowCount: number;
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

function istYear(): number {
  return Number(istToday().slice(0, 4));
}

function monthEnd(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function addDaysYmd(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export type SchedulePeriod = {
  from: string;
  to: string;
  label: string;
};

/** Monday–Sunday IST week containing `ymd` (or offset weeks). */
export function istWeekRangeContaining(ymd: string, weekOffset = 0): SchedulePeriod {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  const dow = dt.getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = addDaysYmd(ymd, mondayOffset + weekOffset * 7);
  const sunday = addDaysYmd(monday, 6);
  const label =
    weekOffset === 0
      ? `this week (${monday} → ${sunday})`
      : weekOffset === 1
        ? `next week (${monday} → ${sunday})`
        : `week of ${monday}`;
  return { from: monday, to: sunday, label };
}

/** Parse which period the user asked about (IST calendar). */
export function parseMySchedulePeriod(message: string): SchedulePeriod {
  const t = norm(message);
  const yearMatch = message.match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : istYear();

  for (const [name, num] of Object.entries(MONTH_NAMES)) {
    if (new RegExp(`\\b${name}\\b`).test(t)) {
      const from = `${year}-${String(num).padStart(2, "0")}-01`;
      const to = monthEnd(year, num);
      const label = `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
      return { from, to, label };
    }
  }

  const iso = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) {
    const d = iso[1]!;
    return { from: d, to: d, label: d };
  }

  const dayMonth = t.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/,
  );
  if (dayMonth) {
    const m = MONTH_NAMES[dayMonth[2]!]!;
    const d = `${year}-${String(m).padStart(2, "0")}-${String(Number(dayMonth[1])).padStart(2, "0")}`;
    return { from: d, to: d, label: d };
  }

  if (/\btoday\b/.test(t)) {
    const d = istToday();
    return { from: d, to: d, label: `today (${d})` };
  }
  if (/\btomorrow\b/.test(t)) {
    const d = addDaysYmd(istToday(), 1);
    return { from: d, to: d, label: `tomorrow (${d})` };
  }
  if (/\bthis\s+week\b/.test(t)) {
    return istWeekRangeContaining(istToday(), 0);
  }
  if (/\bnext\s+week\b/.test(t)) {
    return istWeekRangeContaining(istToday(), 1);
  }

  const today = istToday();
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7));
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  const to = monthEnd(y, m);
  const monthLabel = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return { from, to, label: monthLabel };
}

/** Lead/admin team MA duty roster (not self-only). */
export function isTeamRosterQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;

  // Live presence stays on Team pulse — not imported roster.
  if (/\b(right\s+now|currently|online|logged\s*in|logging\s*in|on\s+the\s+clock)\b/.test(t)) {
    return false;
  }

  if (/\bwho('?s| is| are)\s+on\s+duty\b/.test(t)) return true;
  if (/\bwho('?s| is| are)\s+(working|scheduled|on\s+shift)\b/.test(t)) return true;
  if (/\b(show|list|open|see|get)\s+(the\s+)?(ma\s+)?(duty\s+)?(team\s+)?roster\b/.test(t)) return true;
  if (
    /\b(ma\s+)?(duty\s+)?roster\s+for\b/.test(t) &&
    /\b(team|ma|duty|september|october|november|december|january|february|march|april|may|june|july|august|today|tomorrow|week)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (/\b(team|everyone|all\s+(staff|mas?))\s+(roster|schedule|shifts?)\b/.test(t)) return true;
  if (/\bduty\s+roster\b/.test(t)) return true;
  if (/\bma\s+(duty\s+)?roster\b/.test(t)) return true;
  if (/\bwho\s+else\s+is\s+on\s+(duty|shift|today|tomorrow)\b/.test(t)) return true;
  return false;
}

/** True when staff is asking about their own imported MA schedule — not team/admin roster. */
export function isMyScheduleQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;

  if (isTeamRosterQuery(message)) return false;

  if (/\b(their|his|her|everyone|all staff|all ma|coverage)\b/.test(t)) {
    return false;
  }
  if (/\b(anmol|sonu|sneha|bhavini|isha)\s*('s|s)?\s*(schedule|roster|shifts?)\b/.test(t)) return false;
  if (
    /\b(is|does|will|when is)\s+[a-z]{3,}\s+(working|scheduled|on shift)\b/.test(t) &&
    !/\b(i|me|my)\b/.test(t)
  ) {
    return false;
  }

  if (/\b(my|mine)\s+(schedule|roster|shifts?|shift roster|hours)\b/.test(t)) return true;
  if (/\b(what('s| is)|show|see)\s+my\s+(schedule|roster|shifts?|hours)\b/.test(t)) return true;
  if (/\bdo\s+i\s+have\s+(any\s+)?(shifts?|hours)\b/.test(t)) return true;
  if (/\bam\s+i\s+(working|scheduled|on shift|off)\b/.test(t)) return true;
  if (/\bwhen\s+am\s+i\s+(working|scheduled|on shift)\b/.test(t)) return true;
  if (/\bwhen\s+do\s+i\s+work\b/.test(t)) return true;
  if (/\bwhen\s+do\s+i\s+(start|have\s+(a\s+)?shift)\b/.test(t)) return true;
  if (/\b(what\s+are|whats|what'?s)\s+my\s+hours\b/.test(t)) return true;
  if (/\bmy\s+hours\b/.test(t)) return true;
  if (/\bdo\s+i\s+work\s+(this|next)?\s*(week|today|tomorrow)\b/.test(t)) return true;
  if (/\b(what('s| is)\s+my\s+(work\s+)?schedule)\b/.test(t)) return true;
  if (/\bmy\s+shifts?\s+(in|for|on)\b/.test(t)) return true;
  // Legacy self phrasing: "do you have september roster" (not MA/team/duty)
  if (
    /\b(do you have|is there|show me)\s+(the\s+)?([a-z]+\s+)?roster\b/.test(t) &&
    !/\b(team|ma|duty|everyone)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bshifts?\s+(in|for|during)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(
      t,
    ) &&
    /\b(my|me|i|do\s+i)\b/.test(t)
  ) {
    return true;
  }
  if (
    /\bschedule\s+for\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(
      t,
    ) &&
    /\b(my|me|i)\b/.test(t)
  ) {
    return true;
  }

  return false;
}

function formatIstTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDayHeading(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!));
  const weekday = dt.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" });
  const mon = dt.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });
  return `${weekday} ${d} ${mon}`;
}

function personLabel(row: ShiftRosterRowDto): string {
  return (row.userName && row.userName.trim()) || row.userEmail || row.personKey || "Unknown";
}

/** Build staff-facing schedule list from API rows — no synthesis. */
export function formatMyScheduleMessage(
  rows: ShiftRosterRowDto[],
  period: SchedulePeriod,
  viewerName: string | null,
): string {
  const who = viewerName?.trim() || "You";
  if (!rows.length) {
    return [
      `**No schedule data found for that period** (${period.label}).`,
      "",
      "The portal only shows dates imported into **shift_roster** for your account. If that week/month hasn’t been imported yet, there’s nothing to list — I won’t invent shifts.",
      "",
      "Try a month that was imported (e.g. **when do I work in September?**), or check **Did today go as planned?** on **My day**.",
      "Admins/leads: **who is on duty tomorrow?** or **show the MA duty roster for September** for the team view.",
    ].join("\n");
  }

  const byDate = new Map<string, ShiftRosterRowDto[]>();
  for (const row of rows) {
    const list = byDate.get(row.rosterDate) || [];
    list.push(row);
    byDate.set(row.rosterDate, list);
  }

  const lines: string[] = [
    `**${who} — schedule (${period.label}, IST)**`,
    `_Imported MA roster · ${period.from} → ${period.to}_`,
    "",
  ];

  for (const date of [...byDate.keys()].sort()) {
    const dayRows = byDate.get(date)!;
    const heading = formatDayHeading(date);
    if (dayRows.every((r) => r.isOff)) {
      lines.push(`- **${heading}** — OFF`);
      continue;
    }
    const segments: string[] = [];
    for (const r of dayRows.filter((x) => !x.isOff)) {
      const raw = r.rawCell.trim();
      if (r.shiftStart && r.shiftEnd && r.shiftLabel) {
        segments.push(
          `${raw} (${formatIstTime(r.shiftStart)}–${formatIstTime(r.shiftEnd)} IST · ${r.shiftLabel})`,
        );
      } else if (raw) {
        segments.push(raw);
      }
    }
    const unique = [...new Set(segments)];
    lines.push(`- **${heading}** — ${unique.length ? unique.join(" · ") : "(scheduled — times not parsed)"}`);
  }

  lines.push("", `${rows.length} roster row(s) · source: shift_roster`);
  return lines.join("\n");
}

/** Team duty list — multiple people per day. */
export function formatTeamRosterMessage(rows: ShiftRosterRowDto[], period: SchedulePeriod): string {
  if (!rows.length) {
    return [
      `**No team roster rows for that period** (${period.label}).`,
      "",
      "Nothing imported into **shift_roster** for those dates yet — I won’t invent coverage.",
    ].join("\n");
  }

  const byDate = new Map<string, ShiftRosterRowDto[]>();
  for (const row of rows) {
    const list = byDate.get(row.rosterDate) || [];
    list.push(row);
    byDate.set(row.rosterDate, list);
  }

  const lines: string[] = [
    `**MA duty roster (${period.label}, IST)**`,
    `_Team view · ${period.from} → ${period.to} · source: shift_roster_`,
    "",
  ];

  const dates = [...byDate.keys()].sort().slice(0, 31);
  for (const date of dates) {
    const dayRows = byDate.get(date)!;
    lines.push(`**${formatDayHeading(date)}**`);
    const onDuty = dayRows.filter((r) => !r.isOff);
    const off = dayRows.filter((r) => r.isOff);
    if (!onDuty.length) {
      lines.push(`- Everyone listed OFF (${off.length} row(s))`);
    } else {
      for (const r of onDuty) {
        const raw = r.rawCell.trim() || r.shiftLabel || "scheduled";
        const times =
          r.shiftStart && r.shiftEnd
            ? ` · ${formatIstTime(r.shiftStart)}–${formatIstTime(r.shiftEnd)} IST`
            : "";
        lines.push(`- **${personLabel(r)}** — ${raw}${times}`);
      }
      if (off.length) {
        lines.push(`- OFF: ${off.map(personLabel).join(", ")}`);
      }
    }
    lines.push("");
  }

  const people = new Set(rows.filter((r) => !r.isOff).map((r) => personLabel(r).toLowerCase()));
  lines.push(
    `${rows.length} roster row(s) · ${people.size} people on duty in range · lead/admin team view (not self-only)`,
  );
  return lines.join("\n");
}

async function fetchMyScheduleRows(
  token: string,
  period: SchedulePeriod,
): Promise<{ rows: ShiftRosterRowDto[]; viewerName: string | null } | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;

  const q = new URLSearchParams({ from: period.from, to: period.to });
  const res = await fetch(`${base}/api/shift-roster/me?${q}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as {
    rows?: ShiftRosterRowDto[];
  };
  const meRes = await fetch(`${base}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const me = meRes.ok ? ((await meRes.json().catch(() => ({}))) as { name?: string | null }) : {};

  return {
    rows: data.rows ?? [],
    viewerName: me.name ?? null,
  };
}

async function fetchTeamRosterRows(
  token: string,
  period: SchedulePeriod,
): Promise<{ rows: ShiftRosterRowDto[] } | { forbidden: true } | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  const q = new URLSearchParams({ from: period.from, to: period.to });
  const res = await fetch(`${base}/api/shift-roster/team?${q}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (res.status === 403) return { forbidden: true };
  if (!res.ok) return null;
  const data = (await res.json().catch(() => ({}))) as { rows?: ShiftRosterRowDto[] };
  return { rows: data.rows ?? [] };
}

export async function answerMyScheduleQuery(
  message: string,
  authToken: string,
): Promise<MyScheduleAnswer | null> {
  if (!isMyScheduleQuery(message)) return null;
  const period = parseMySchedulePeriod(message);
  const loaded = await fetchMyScheduleRows(authToken, period);
  if (!loaded) return null;

  return {
    message: formatMyScheduleMessage(loaded.rows, period, loaded.viewerName),
    sources: [{ title: `My schedule · shift_roster (${period.label})`, id: "shift-roster-me" }],
    periodLabel: period.label,
    rowCount: loaded.rows.length,
  };
}

export async function answerTeamRosterQuery(
  message: string,
  authToken: string,
): Promise<TeamRosterAnswer | null> {
  if (!isTeamRosterQuery(message)) return null;
  const period = parseMySchedulePeriod(message);
  const loaded = await fetchTeamRosterRows(authToken, period);
  if (!loaded) return null;
  if ("forbidden" in loaded && loaded.forbidden) {
    return {
      message: [
        "**Team MA roster** is for **admins and department leads** only.",
        "",
        "For **your** shifts, ask **when do I work this week?** or **what's my schedule?**",
      ].join("\n"),
      sources: [{ title: "Team roster (forbidden)", id: "shift-roster-team" }],
      periodLabel: period.label,
      rowCount: 0,
      forbidden: true,
    };
  }
  const rows = "rows" in loaded ? loaded.rows : [];
  return {
    message: formatTeamRosterMessage(rows, period),
    sources: [{ title: `Team MA roster · shift_roster (${period.label})`, id: "shift-roster-team" }],
    periodLabel: period.label,
    rowCount: rows.length,
  };
}
