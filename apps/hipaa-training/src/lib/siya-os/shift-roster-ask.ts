/**
 * Ask — "my shifts / my schedule" deterministic lookup from shift_roster (signed-in user only).
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

export type SchedulePeriod = {
  from: string;
  to: string;
  label: string;
};

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

  const dayMonth = t.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/);
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
    const [y, mo, da] = istToday().split("-").map(Number);
    const dt = new Date(Date.UTC(y!, mo! - 1, da!));
    dt.setUTCDate(dt.getUTCDate() + 1);
    const d = dt.toISOString().slice(0, 10);
    return { from: d, to: d, label: `tomorrow (${d})` };
  }

  // Default: current IST month
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

/** True when staff is asking about their own imported MA schedule — not team/admin roster. */
export function isMyScheduleQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;

  // Someone else's schedule (out of scope this pass)
  if (/\b(their|his|her|team|everyone|all staff|all ma|coverage|who is working|who'?s working)\b/.test(t)) {
    return false;
  }
  if (/\b(anmol|sonu|sneha|bhavini|isha)\s*('s|s)?\s*(schedule|roster|shifts?)\b/.test(t)) return false;
  if (/\b(is|does|will|when is)\s+[a-z]{3,}\s+(working|scheduled|on shift)\b/.test(t) && !/\b(i|me|my)\b/.test(t)) {
    return false;
  }

  if (/\b(my|mine)\s+(schedule|roster|shifts?|shift roster)\b/.test(t)) return true;
  if (/\b(what('s| is)|show|see)\s+my\s+(schedule|roster|shifts?)\b/.test(t)) return true;
  if (/\bdo\s+i\s+have\s+(any\s+)?shifts?\b/.test(t)) return true;
  if (/\bam\s+i\s+(working|scheduled|on shift|off)\b/.test(t)) return true;
  if (/\bwhen\s+am\s+i\s+(working|scheduled|on shift)\b/.test(t)) return true;
  if (/\bmy\s+shifts?\s+(in|for|on)\b/.test(t)) return true;
  if (/\bshifts?\s+(in|for|during)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(t)) {
    return true;
  }
  if (/\b(do you have|is there|show me)\s+(the\s+)?([a-z]+\s+)?roster\b/.test(t)) return true;
  if (/\broster\s+for\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(t)) {
    return true;
  }
  if (/\bschedule\s+for\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(t)) {
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
      "The portal only shows dates imported into **shift_roster** for your account. If that month hasn’t been imported yet, there’s nothing to list — I won’t invent shifts.",
      "",
      "You can also check **Did today go as planned?** on **My day** for today’s roster vs your Working status.",
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
    error?: string;
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
