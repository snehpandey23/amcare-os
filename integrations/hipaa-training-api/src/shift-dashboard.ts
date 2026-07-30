import type pg from "pg";
import { parseShiftStore, isSameCalendarDay } from "./shift-store.js";
import { ensureShiftAttendanceTables } from "./shift-attendance.js";

/** Fixed offset — whole team ops day (India). */
export const OPS_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function opsDayBounds(dateParam: unknown): { from: string; to: string; label: string; timezone: string } {
  const raw =
    typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? dateParam
      : istDateLabel(new Date());
  const [y, m, d] = raw.split("-").map(Number);
  const startUtcMs = Date.UTC(y, m - 1, d, 0, 0, 0, 0) - IST_OFFSET_MS;
  const endUtcMs = startUtcMs + 86400000;
  return {
    from: new Date(startUtcMs).toISOString(),
    to: new Date(endUtcMs).toISOString(),
    label: raw,
    timezone: OPS_TIMEZONE,
  };
}

export function istDateLabel(at: Date): string {
  const ist = new Date(at.getTime() + IST_OFFSET_MS);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type ShiftDashboardPayload = {
  date: string;
  timezone: string;
  generatedAt: string;
  live: {
    expected: number;
    onShift: number;
    working: number;
    onBreak: number;
    inFocus: number;
    offShift: number;
    members: {
      id: string;
      email: string;
      name: string | null;
      onShift: boolean;
      presence: string | null;
      shiftStartedAt: string | null;
    }[];
  };
  today: {
    shiftStarts: number;
    uniqueStarters: number;
    shiftEnds: number;
    breakStarts: number;
    focusStarts: number;
    toolOpens: number;
    loginStarts: number;
    manualStarts: number;
  };
  toolLinks: { label: string; host: string; count: number }[];
  people: {
    userId: string;
    email: string;
    name: string | null;
    eventCount: number;
    firstEventAt: string | null;
    lastEventAt: string | null;
    shiftStarts: number;
    toolOpens: number;
  }[];
};

export type LiveTeamMember = {
  id: string;
  email: string;
  name: string | null;
  onShift: boolean;
  presence: string | null;
  shiftStartedAt: string | null;
};

export async function buildLiveTeamRoster(pool: pg.Pool): Promise<LiveTeamMember[]> {
  const roster = await pool.query(
    `SELECT u.id, u.email, u.name, p.shift_json
     FROM hipaa_training_users u
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     WHERE u.deactivated_at IS NULL
     ORDER BY u.name NULLS LAST, u.email ASC`,
  );

  return roster.rows.map((row) => {
    const store = parseShiftStore(row.shift_json);
    const todayRecord = store.recent.find((rec) => isSameCalendarDay(rec.startedAt));
    const onShift = Boolean(store.active);
    return {
      id: row.id as string,
      email: row.email as string,
      name: row.name as string | null,
      onShift,
      presence: onShift ? (store.active!.presence as string) : null,
      shiftStartedAt: store.active?.startedAt ?? todayRecord?.startedAt ?? null,
    };
  });
}

export async function buildShiftDashboard(pool: pg.Pool, dateParam: unknown): Promise<ShiftDashboardPayload> {
  await ensureShiftAttendanceTables(pool);
  const { from, to, label, timezone } = opsDayBounds(dateParam);

  const liveMembers = await buildLiveTeamRoster(pool);

  const expected = liveMembers.length;
  const onShift = liveMembers.filter((m) => m.onShift).length;
  const onBreak = liveMembers.filter((m) => m.onShift && m.presence === "break").length;
  const inFocus = liveMembers.filter((m) => m.onShift && m.presence === "focus").length;
  const working = liveMembers.filter((m) => m.onShift && m.presence === "working").length;

  const ev = await pool.query(
    `SELECT e.user_id, e.event_type, e.source, e.metadata, e.created_at, u.email, u.name
     FROM siya_shift_attendance_events e
     JOIN hipaa_training_users u ON u.id = e.user_id
     WHERE e.created_at >= $1::timestamptz AND e.created_at < $2::timestamptz
     ORDER BY e.created_at ASC`,
    [from, to],
  );

  let shiftStarts = 0;
  let shiftEnds = 0;
  let breakStarts = 0;
  let focusStarts = 0;
  let toolOpens = 0;
  let loginStarts = 0;
  let manualStarts = 0;
  const starters = new Set<string>();
  const toolMap = new Map<string, { label: string; host: string; count: number }>();
  const peopleMap = new Map<
    string,
    {
      userId: string;
      email: string;
      name: string | null;
      eventCount: number;
      firstEventAt: string | null;
      lastEventAt: string | null;
      shiftStarts: number;
      toolOpens: number;
    }
  >();

  for (const row of ev.rows) {
    const userId = row.user_id as string;
    const email = row.email as string;
    const name = row.name as string | null;
    const eventType = row.event_type as string;
    const source = row.source as string;
    const at = new Date(row.created_at as Date).toISOString();
    const meta = (row.metadata as Record<string, unknown>) ?? {};

    let p = peopleMap.get(userId);
    if (!p) {
      p = {
        userId,
        email,
        name,
        eventCount: 0,
        firstEventAt: at,
        lastEventAt: at,
        shiftStarts: 0,
        toolOpens: 0,
      };
      peopleMap.set(userId, p);
    }
    p.eventCount += 1;
    p.lastEventAt = at;
    if (!p.firstEventAt) p.firstEventAt = at;

    if (eventType === "shift_start") {
      shiftStarts += 1;
      p.shiftStarts += 1;
      starters.add(userId);
      if (source === "login") loginStarts += 1;
      else manualStarts += 1;
    } else if (eventType === "shift_end") shiftEnds += 1;
    else if (eventType === "break_start") breakStarts += 1;
    else if (eventType === "focus_start") focusStarts += 1;
    else if (eventType === "tool_link_opened") {
      toolOpens += 1;
      p.toolOpens += 1;
      const label = String(meta.label ?? "link");
      const host = String(meta.host ?? "");
      const key = `${label}|${host}`;
      const cur = toolMap.get(key) ?? { label, host, count: 0 };
      cur.count += 1;
      toolMap.set(key, cur);
    }
  }

  const toolLinks = [...toolMap.values()].sort((a, b) => b.count - a.count).slice(0, 12);
  const people = [...peopleMap.values()].sort((a, b) => (b.lastEventAt ?? "").localeCompare(a.lastEventAt ?? ""));

  return {
    date: label,
    timezone,
    generatedAt: new Date().toISOString(),
    live: {
      expected,
      onShift,
      working,
      onBreak,
      inFocus,
      offShift: expected - onShift,
      members: liveMembers,
    },
    today: {
      shiftStarts,
      uniqueStarters: starters.size,
      shiftEnds,
      breakStarts,
      focusStarts,
      toolOpens,
      loginStarts,
      manualStarts,
    },
    toolLinks,
    people,
  };
}
