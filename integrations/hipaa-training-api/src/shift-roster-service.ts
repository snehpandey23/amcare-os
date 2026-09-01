/**
 * Shift roster — scheduled MA shifts (IST source). Schema ensure + queries.
 */
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import type pg from "pg";
import { parseShiftStore, type ShiftStore } from "./shift-store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type ShiftRosterRow = {
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

export async function ensureShiftRosterTables(pool: pg.Pool): Promise<void> {
  const sql = readFileSync(join(__dirname, "database", "shift-roster-schema.sql"), "utf8");
  await pool.query(sql);
}

function rosterDateYmd(val: unknown): string {
  if (val instanceof Date && !Number.isNaN(val.getTime())) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(val);
  }
  const s = String(val);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : s;
}

function rowToRoster(row: Record<string, unknown>): ShiftRosterRow {
  return {
    id: row.id as string,
    rosterDate: rosterDateYmd(row.roster_date),
    personKey: row.person_key as string,
    userId: (row.user_id as string) ?? null,
    userName: (row.user_name as string) ?? null,
    userEmail: (row.user_email as string) ?? null,
    shiftStart: row.shift_start ? new Date(row.shift_start as string).toISOString() : null,
    shiftEnd: row.shift_end ? new Date(row.shift_end as string).toISOString() : null,
    shiftLabel: (row.shift_label as string) ?? null,
    rawCell: row.raw_cell as string,
    isOff: Boolean(row.is_off),
  };
}

/** IST calendar date YYYY-MM-DD for an instant. */
export function istDateString(at = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

export async function listRosterForDate(
  pool: pg.Pool,
  rosterDate: string,
): Promise<ShiftRosterRow[]> {
  await ensureShiftRosterTables(pool);
  const r = await pool.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email
     FROM shift_roster r
     LEFT JOIN hipaa_training_users u ON u.id = r.user_id
     WHERE r.roster_date = $1::date
     ORDER BY r.person_key ASC, r.shift_start ASC NULLS LAST`,
    [rosterDate],
  );
  return r.rows.map((row) => rowToRoster(row as Record<string, unknown>));
}

export async function listRosterForUserDate(
  pool: pg.Pool,
  userId: string,
  rosterDate: string,
): Promise<ShiftRosterRow[]> {
  await ensureShiftRosterTables(pool);
  const r = await pool.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email
     FROM shift_roster r
     LEFT JOIN hipaa_training_users u ON u.id = r.user_id
     WHERE r.user_id = $1 AND r.roster_date = $2::date
     ORDER BY r.shift_start ASC NULLS LAST`,
    [userId, rosterDate],
  );
  return r.rows.map((row) => rowToRoster(row as Record<string, unknown>));
}

export async function listRosterForUserRange(
  pool: pg.Pool,
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<ShiftRosterRow[]> {
  await ensureShiftRosterTables(pool);
  const r = await pool.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email
     FROM shift_roster r
     LEFT JOIN hipaa_training_users u ON u.id = r.user_id
     WHERE r.user_id = $1
       AND r.roster_date >= $2::date
       AND r.roster_date <= $3::date
     ORDER BY r.roster_date ASC, r.shift_start ASC NULLS LAST`,
    [userId, fromDate, toDate],
  );
  return r.rows.map((row) => rowToRoster(row as Record<string, unknown>));
}

/** Last calendar day of month (UTC date math — roster_date is IST calendar day stored as DATE). */
export function monthEndDate(year: number, month: number): string {
  const d = new Date(Date.UTC(year, month, 0));
  return d.toISOString().slice(0, 10);
}

export type CoverageGapWindow = {
  rosterDate: string;
  windowStart: string;
  windowEnd: string;
  scheduledCount: number;
  label: string;
};

/**
 * Thin/zero coverage: for each hour of the IST day, count overlapping scheduled (non-OFF) shifts.
 * Flag hours with 0 people on shift.
 */
export async function findCoverageGaps(
  pool: pg.Pool,
  opts: { fromDate: string; toDate: string },
): Promise<CoverageGapWindow[]> {
  await ensureShiftRosterTables(pool);
  const shifts = await pool.query(
    `SELECT roster_date::text AS roster_date, shift_start, shift_end, person_key
     FROM shift_roster
     WHERE is_off = FALSE
       AND shift_start IS NOT NULL AND shift_end IS NOT NULL
       AND roster_date >= $1::date AND roster_date <= $2::date`,
    [opts.fromDate, opts.toDate],
  );

  const gaps: CoverageGapWindow[] = [];
  const dayMs = 24 * 60 * 60 * 1000;
  const from = Date.parse(`${opts.fromDate}T00:00:00+05:30`);
  const to = Date.parse(`${opts.toDate}T00:00:00+05:30`) + dayMs;

  for (let t = from; t < to; t += 60 * 60 * 1000) {
    const windowStart = new Date(t);
    const windowEnd = new Date(t + 60 * 60 * 1000);
    let count = 0;
    for (const row of shifts.rows) {
      const s = new Date(row.shift_start as string).getTime();
      const e = new Date(row.shift_end as string).getTime();
      if (s < windowEnd.getTime() && e > windowStart.getTime()) count += 1;
    }
    if (count === 0) {
      const rosterDate = istDateString(windowStart);
      gaps.push({
        rosterDate,
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        scheduledCount: 0,
        label: `${rosterDate} ${windowStart.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}–${windowEnd.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })} IST`,
      });
    }
  }

  // Collapse consecutive empty hours into ranges for readability
  const collapsed: CoverageGapWindow[] = [];
  for (const g of gaps) {
    const prev = collapsed[collapsed.length - 1];
    if (prev && prev.windowEnd === g.windowStart && prev.rosterDate === g.rosterDate) {
      prev.windowEnd = g.windowEnd;
      prev.label = `${prev.rosterDate} ${new Date(prev.windowStart).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}–${new Date(prev.windowEnd).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })} IST (0 scheduled)`;
    } else {
      collapsed.push({ ...g, label: `${g.label} (0 scheduled)` });
    }
  }
  return collapsed;
}

export type ScheduledVsActualRow = {
  roster: ShiftRosterRow;
  scheduledOff: boolean;
  hasActiveShift: boolean;
  presence: string | null;
  shiftStartedAt: string | null;
  presenceSince: string | null;
  outcome:
    | "started_on_time"
    | "started_late"
    | "in_progress"
    | "missed"
    | "upcoming"
    | "scheduled_off"
    | "no_user";
  detail: string;
};

/** Find a self-declared start that belongs to this scheduled window (active or recent). */
function matchDeclaredStart(
  store: ShiftStore,
  windowStartMs: number,
  windowEndMs: number,
  rosterDate: string,
): { startedAt: string; presence: string | null; presenceSince: string | null; active: boolean } | null {
  const pad = 2 * 60 * 60 * 1000;
  const lo = windowStartMs - pad;
  const hi = windowEndMs + pad;

  const belongsToRosterDay = (iso: string): boolean => {
    const t = Date.parse(iso);
    if (!Number.isFinite(t)) return false;
    if (t >= lo && t <= hi) return true;
    // Same IST calendar day as the roster row (not multi-week stale actives).
    return istDateString(new Date(t)) === rosterDate;
  };

  if (store.active?.startedAt && belongsToRosterDay(store.active.startedAt)) {
    return {
      startedAt: store.active.startedAt,
      presence: store.active.presence,
      presenceSince: store.active.presenceSince,
      active: true,
    };
  }
  for (const rec of store.recent) {
    if (!belongsToRosterDay(rec.startedAt)) continue;
    const t = Date.parse(rec.startedAt);
    if (t < lo || t > hi) {
      // Same IST day but outside this segment — still count as declared for that segment
      // only if it overlaps the window in wall-clock terms.
      if (!(t < windowEndMs && (rec.endedAt ? Date.parse(rec.endedAt) : t) > windowStartMs)) {
        continue;
      }
    }
    return {
      startedAt: rec.startedAt,
      presence: null,
      presenceSince: null,
      active: false,
    };
  }
  return null;
}

export async function buildScheduledVsActual(
  pool: pg.Pool,
  opts: { rosterDate: string; userId?: string; asOf?: Date },
): Promise<ScheduledVsActualRow[]> {
  await ensureShiftRosterTables(pool);
  const params: unknown[] = [opts.rosterDate];
  let userFilter = "";
  if (opts.userId) {
    params.push(opts.userId);
    userFilter = ` AND r.user_id = $${params.length}`;
  }
  const r = await pool.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email, p.shift_json
     FROM shift_roster r
     LEFT JOIN hipaa_training_users u ON u.id = r.user_id
     LEFT JOIN hipaa_training_progress p ON p.user_id = r.user_id
     WHERE r.roster_date = $1::date ${userFilter}
     ORDER BY r.person_key ASC, r.shift_start ASC NULLS LAST`,
    params,
  );

  const now = (opts.asOf ?? new Date()).getTime();
  const out: ScheduledVsActualRow[] = [];
  for (const row of r.rows) {
    const roster = rowToRoster(row as Record<string, unknown>);
    const store = parseShiftStore(row.shift_json);

    if (roster.isOff) {
      const activeNow = Boolean(store.active?.startedAt);
      out.push({
        roster,
        scheduledOff: true,
        hasActiveShift: activeNow,
        presence: store.active?.presence ?? null,
        shiftStartedAt: store.active?.startedAt ?? null,
        presenceSince: store.active?.presenceSince ?? null,
        outcome: "scheduled_off",
        detail: activeNow
          ? "Scheduled OFF but a self-declared shift is active — check if this is intentional."
          : "Scheduled OFF today.",
      });
      continue;
    }
    if (!roster.userId) {
      out.push({
        roster,
        scheduledOff: false,
        hasActiveShift: false,
        presence: null,
        shiftStartedAt: null,
        presenceSince: null,
        outcome: "no_user",
        detail: "No portal user linked to this roster name.",
      });
      continue;
    }
    if (!roster.shiftStart || !roster.shiftEnd) {
      out.push({
        roster,
        scheduledOff: false,
        hasActiveShift: Boolean(store.active?.startedAt),
        presence: store.active?.presence ?? null,
        shiftStartedAt: store.active?.startedAt ?? null,
        presenceSince: store.active?.presenceSince ?? null,
        outcome: "upcoming",
        detail: "No parseable start/end on this cell.",
      });
      continue;
    }

    const startMs = Date.parse(roster.shiftStart);
    const endMs = Date.parse(roster.shiftEnd);
    const graceMs = 15 * 60 * 1000;
    const matched = matchDeclaredStart(store, startMs, endMs, roster.rosterDate);

    if (now < startMs - graceMs && !matched) {
      out.push({
        roster,
        scheduledOff: false,
        hasActiveShift: Boolean(store.active?.startedAt),
        presence: store.active?.presence ?? null,
        shiftStartedAt: store.active?.startedAt ?? null,
        presenceSince: store.active?.presenceSince ?? null,
        outcome: "upcoming",
        detail: "Shift not started yet (scheduled later).",
      });
      continue;
    }

    if (matched) {
      const startedMs = Date.parse(matched.startedAt);
      const late = startedMs > startMs + graceMs;
      const onBreak = matched.presence === "break";
      let outcome: ScheduledVsActualRow["outcome"] = "started_on_time";
      if (onBreak || (matched.active && now <= endMs)) outcome = late ? "started_late" : "in_progress";
      else if (late) outcome = "started_late";
      out.push({
        roster,
        scheduledOff: false,
        hasActiveShift: matched.active,
        presence: matched.presence,
        shiftStartedAt: matched.startedAt,
        presenceSince: matched.presenceSince,
        outcome,
        detail: onBreak
          ? "On Break — shift was started for this window."
          : late
            ? `Working declared after scheduled start (+${Math.round((startedMs - startMs) / 60000)} min).`
            : "Self-declared Working/Focus matches this scheduled window.",
      });
      continue;
    }

    if (now > endMs + graceMs) {
      out.push({
        roster,
        scheduledOff: false,
        hasActiveShift: false,
        presence: null,
        shiftStartedAt: null,
        presenceSince: null,
        outcome: "missed",
        detail: "Scheduled window ended without a self-declared Working status.",
      });
      continue;
    }

    out.push({
      roster,
      scheduledOff: false,
      hasActiveShift: false,
      presence: null,
      shiftStartedAt: null,
      presenceSince: null,
      outcome: "missed",
      detail: "Shift window open/recent — Working not declared yet.",
    });
  }
  return out;
}

/** Same-day OFF check for task assignment soft warning. */
export async function isUserScheduledOff(
  pool: pg.Pool,
  userId: string,
  rosterDate: string,
): Promise<{ scheduledOff: boolean; rawCells: string[] }> {
  const rows = await listRosterForUserDate(pool, userId, rosterDate);
  if (!rows.length) return { scheduledOff: false, rawCells: [] };
  const working = rows.filter((r) => !r.isOff);
  if (working.length === 0) {
    return { scheduledOff: true, rawCells: rows.map((r) => r.rawCell) };
  }
  return { scheduledOff: false, rawCells: working.map((r) => r.rawCell) };
}

export type ReminderCandidate = ShiftRosterRow & { email: string; firstName: string };

export async function listShiftReminderCandidates(
  pool: pg.Pool,
  at = new Date(),
): Promise<ReminderCandidate[]> {
  await ensureShiftRosterTables(pool);
  // Shifts starting within past 90 min through next 14 hours, not yet reminded this bucket.
  const r = await pool.query(
    `SELECT r.*, u.name AS user_name, u.email AS user_email
     FROM shift_roster r
     JOIN hipaa_training_users u ON u.id = r.user_id AND u.deactivated_at IS NULL
     WHERE r.is_off = FALSE
       AND r.shift_start IS NOT NULL
       AND r.shift_start >= $1::timestamptz
       AND r.shift_start <= $2::timestamptz
       AND NOT EXISTS (
         SELECT 1 FROM shift_roster_reminder_sends s
         WHERE s.roster_row_id = r.id
       )`,
    [new Date(at.getTime() - 90 * 60 * 1000).toISOString(), new Date(at.getTime() + 14 * 60 * 60 * 1000).toISOString()],
  );

  const out: ReminderCandidate[] = [];
  for (const row of r.rows) {
    const roster = rowToRoster(row as Record<string, unknown>);
    const email = (row.user_email as string) || "";
    if (!email.includes("@")) continue;
    // Skip if already on an active Working/Focus shift
    const prog = await pool.query(`SELECT shift_json FROM hipaa_training_progress WHERE user_id = $1`, [
      roster.userId,
    ]);
    const store = parseShiftStore(prog.rows[0]?.shift_json);
    if (
      store.active?.startedAt &&
      store.active.presence &&
      store.active.presence !== "break" &&
      roster.shiftStart &&
      roster.shiftEnd
    ) {
      const matched = matchDeclaredStart(
        store,
        Date.parse(roster.shiftStart),
        Date.parse(roster.shiftEnd),
        roster.rosterDate,
      );
      if (matched) continue;
    }
    const firstName =
      (roster.userName || "").trim().split(/\s+/)[0] ||
      email.split("@")[0] ||
      roster.personKey;
    out.push({ ...roster, email, firstName });
  }
  return out;
}

export async function markShiftReminderSent(
  pool: pg.Pool,
  opts: { rosterRowId: string; userId: string; sendBucket: string; resendId?: string | null },
): Promise<void> {
  await ensureShiftRosterTables(pool);
  await pool.query(
    `INSERT INTO shift_roster_reminder_sends (id, roster_row_id, user_id, send_bucket, resend_id)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (roster_row_id, send_bucket) DO NOTHING`,
    [randomUUID(), opts.rosterRowId, opts.userId, opts.sendBucket, opts.resendId ?? null],
  );
}

export function reminderSendBucket(shiftStartIso: string): string {
  const d = new Date(shiftStartIso);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
