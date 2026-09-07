/**
 * Attendance hours reporting — load events, derive IST day records, disputes.
 */
import type pg from "pg";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { ensureShiftAttendanceTables } from "./shift-attendance.js";
import { istDateString } from "./shift-store.js";
import {
  ATTENDANCE_TZ,
  addIstDays,
  buildAttendanceDayRecordsFromEvents,
  formatHoursMinutes,
  istDayStartUtc,
  rollupMonth,
  type AttendanceDayDispute,
  type AttendanceDayRecord,
  type AttendanceHoursAmbiguityStats,
} from "./attendance-hours.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function ensureAttendanceDisputeTables(pool: pg.Pool): Promise<void> {
  const sql = readFileSync(join(__dirname, "database", "attendance-disputes-schema.sql"), "utf8");
  await pool.query(sql);
}

type DisputeRow = {
  user_id: string;
  attendance_date: string;
  status: string;
  staff_note: string | null;
  resolution_note: string | null;
  corrected_working_minutes: number | null;
  corrected_break_minutes: number | null;
  corrected_focus_minutes: number | null;
  flagged_at: Date;
  resolved_at: Date | null;
  resolved_by: string | null;
};

function mapDispute(row: DisputeRow): {
  dispute: AttendanceDayDispute;
  correction: {
    workingMinutes: number;
    breakMinutes: number;
    focusMinutes: number;
  } | null;
} {
  const status = row.status as AttendanceDayDispute["status"];
  const dispute: AttendanceDayDispute = {
    status,
    staffNote: row.staff_note,
    resolutionNote: row.resolution_note,
    flaggedAt: row.flagged_at?.toISOString?.() ?? String(row.flagged_at),
    resolvedAt: row.resolved_at
      ? row.resolved_at.toISOString?.() ?? String(row.resolved_at)
      : null,
    resolvedBy: row.resolved_by,
  };
  const correction =
    status === "resolved_corrected" &&
    row.corrected_working_minutes != null &&
    row.corrected_break_minutes != null &&
    row.corrected_focus_minutes != null
      ? {
          workingMinutes: row.corrected_working_minutes,
          breakMinutes: row.corrected_break_minutes,
          focusMinutes: row.corrected_focus_minutes,
        }
      : null;
  return { dispute, correction };
}

async function loadDisputes(
  pool: pg.Pool,
  userIds: string[],
  fromDate: string,
  toDate: string,
): Promise<Map<string, Map<string, ReturnType<typeof mapDispute>>>> {
  const out = new Map<string, Map<string, ReturnType<typeof mapDispute>>>();
  if (!userIds.length) return out;
  await ensureAttendanceDisputeTables(pool);
  const r = await pool.query(
    `SELECT user_id, attendance_date::text AS attendance_date, status, staff_note, resolution_note,
            corrected_working_minutes, corrected_break_minutes, corrected_focus_minutes,
            flagged_at, resolved_at, resolved_by
     FROM siya_attendance_day_disputes
     WHERE user_id = ANY($1::uuid[])
       AND attendance_date >= $2::date AND attendance_date <= $3::date`,
    [userIds, fromDate, toDate],
  );
  for (const row of r.rows as DisputeRow[]) {
    const mapped = mapDispute(row);
    let byDate = out.get(row.user_id);
    if (!byDate) {
      byDate = new Map();
      out.set(row.user_id, byDate);
    }
    byDate.set(row.attendance_date.slice(0, 10), mapped);
  }
  return out;
}

async function loadEventsForUsers(
  pool: pg.Pool,
  userIds: string[],
  fromDate: string,
  toDate: string,
): Promise<Map<string, { eventType: string; createdAt: Date; metadata: Record<string, unknown> }[]>> {
  await ensureShiftAttendanceTables(pool);
  // Pad ±1 day so overnight segments that start previous IST day are included.
  const fromIso = addIstDays(fromDate, -1);
  const toIsoExclusive = addIstDays(toDate, 2);
  const from = istDayStartUtc(fromIso);
  const to = istDayStartUtc(toIsoExclusive);

  const map = new Map<
    string,
    { eventType: string; createdAt: Date; metadata: Record<string, unknown> }[]
  >();
  if (!userIds.length) return map;

  const r = await pool.query(
    `SELECT user_id, event_type, created_at, metadata
     FROM siya_shift_attendance_events
     WHERE user_id = ANY($1::uuid[])
       AND created_at >= $2::timestamptz AND created_at < $3::timestamptz
       AND event_type <> 'tool_link_opened'
     ORDER BY created_at ASC`,
    [userIds, from.toISOString(), to.toISOString()],
  );

  for (const row of r.rows) {
    const uid = row.user_id as string;
    const list = map.get(uid) ?? [];
    list.push({
      eventType: row.event_type as string,
      createdAt: row.created_at as Date,
      metadata: (row.metadata as Record<string, unknown>) ?? {},
    });
    map.set(uid, list);
  }
  return map;
}

export type AttendanceHoursReport = {
  timezone: typeof ATTENDANCE_TZ;
  fromDate: string;
  toDate: string;
  generatedAt: string;
  scope: "me" | "team";
  people: {
    userId: string;
    subjectLabel: string;
    email: string;
    days: AttendanceDayRecord[];
    monthRollup: ReturnType<typeof rollupMonth>;
    monthRollupLabel: string;
  }[];
  ambiguity: AttendanceHoursAmbiguityStats;
};

function subjectLabel(name: string | null, email: string): string {
  return (name && name.trim()) || email;
}

export async function buildAttendanceHoursReport(
  pool: pg.Pool,
  opts: {
    scope: "me" | "team";
    viewerUserId: string;
    /** Inclusive IST YYYY-MM-DD */
    fromDate?: string;
    toDate?: string;
    /** YYYY-MM — overrides from/to to that IST month */
    month?: string;
    now?: Date;
  },
): Promise<AttendanceHoursReport> {
  await ensureAttendanceDisputeTables(pool);
  const { closeAllStaleActiveShifts } = await import("./shift-progress.js");
  await closeAllStaleActiveShifts(pool, { now: opts.now });
  const now = opts.now ?? new Date();
  let fromDate = opts.fromDate;
  let toDate = opts.toDate;

  if (opts.month && /^\d{4}-\d{2}$/.test(opts.month)) {
    const [y, m] = opts.month.split("-").map(Number);
    fromDate = `${opts.month}-01`;
    const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
    toDate = `${opts.month}-${String(lastDay).padStart(2, "0")}`;
  }

  if (!fromDate || !toDate) {
    const today = istDateString(now);
    fromDate = today;
    toDate = today;
  }

  let users: { id: string; email: string; name: string | null }[] = [];
  if (opts.scope === "me") {
    const r = await pool.query(
      `SELECT id, email, name FROM hipaa_training_users WHERE id = $1`,
      [opts.viewerUserId],
    );
    users = r.rows.map((row) => ({
      id: row.id as string,
      email: row.email as string,
      name: row.name as string | null,
    }));
  } else {
    const r = await pool.query(
      `SELECT id, email, name FROM hipaa_training_users
       WHERE deactivated_at IS NULL
       ORDER BY name NULLS LAST, email ASC`,
    );
    users = r.rows.map((row) => ({
      id: row.id as string,
      email: row.email as string,
      name: row.name as string | null,
    }));
  }

  const userIds = users.map((u) => u.id);
  const [eventsByUser, disputesByUser] = await Promise.all([
    loadEventsForUsers(pool, userIds, fromDate, toDate),
    loadDisputes(pool, userIds, fromDate, toDate),
  ]);

  const people: AttendanceHoursReport["people"] = [];
  let cleanDays = 0;
  let ambiguousDays = 0;
  let provisionalDays = 0;
  let staleAffectedDays = 0;
  let payrollEligibleDays = 0;
  let payrollEligibleMinutes = 0;
  let dayRecords = 0;

  for (const u of users) {
    const label = subjectLabel(u.name, u.email);
    const disputeMap = disputesByUser.get(u.id);
    const disputesByDate: Record<string, AttendanceDayDispute> = {};
    const correctionsByDate: Record<
      string,
      { workingMinutes: number; breakMinutes: number; focusMinutes: number }
    > = {};
    if (disputeMap) {
      for (const [date, mapped] of disputeMap) {
        disputesByDate[date] = mapped.dispute;
        if (mapped.correction) correctionsByDate[date] = mapped.correction;
      }
    }

    const { days, stats } = buildAttendanceDayRecordsFromEvents({
      userId: u.id,
      subjectLabel: label,
      events: eventsByUser.get(u.id) ?? [],
      fromDate,
      toDate,
      now,
      disputesByDate,
      correctionsByDate,
    });

    dayRecords += stats.dayRecords;
    cleanDays += stats.cleanDays;
    ambiguousDays += stats.ambiguousDays;
    provisionalDays += stats.provisionalDays;
    staleAffectedDays += stats.staleAffectedDays;
    payrollEligibleDays += stats.payrollEligibleDays;
    payrollEligibleMinutes += stats.payrollEligibleMinutes;

    if (opts.scope === "team" && days.length === 0) continue;

    const monthRollup = rollupMonth(days);
    people.push({
      userId: u.id,
      subjectLabel: label,
      email: u.email,
      days,
      monthRollup,
      monthRollupLabel: formatHoursMinutes(monthRollup.totalMinutes),
    });
  }

  return {
    timezone: ATTENDANCE_TZ,
    fromDate,
    toDate,
    generatedAt: now.toISOString(),
    scope: opts.scope,
    people,
    ambiguity: {
      dayRecords,
      cleanDays,
      ambiguousDays,
      provisionalDays,
      staleAffectedDays,
      cleanRatio: dayRecords ? cleanDays / dayRecords : 1,
      payrollEligibleDays,
      payrollEligibleMinutes,
    },
  };
}

export async function getAttendanceDayRecordForUser(
  pool: pg.Pool,
  opts: {
    userId: string;
    attendanceDate: string;
    now?: Date;
  },
): Promise<AttendanceDayRecord | null> {
  const r = await pool.query(
    `SELECT id, email, name FROM hipaa_training_users WHERE id = $1`,
    [opts.userId],
  );
  if (!r.rows[0]) return null;
  const label = subjectLabel(r.rows[0].name as string | null, r.rows[0].email as string);
  const now = opts.now ?? new Date();
  const today = istDateString(now);
  // Single-day detail must see: (1) shift_start from weeks earlier if still open through
  // this day, and (2) late-logged shift_end (stale auto-close written at sweep time, not
  // at semantic end). Narrow ±1d around attendanceDate misses those and falsely shows
  // provisional open hours that disagree with the month report.
  const eventFrom = addIstDays(opts.attendanceDate, -60);
  const eventTo = today > opts.attendanceDate ? today : opts.attendanceDate;
  const eventsByUser = await loadEventsForUsers(pool, [opts.userId], eventFrom, eventTo);
  const disputes = await loadDisputes(
    pool,
    [opts.userId],
    opts.attendanceDate,
    opts.attendanceDate,
  );
  const mapped = disputes.get(opts.userId)?.get(opts.attendanceDate);
  const { days } = buildAttendanceDayRecordsFromEvents({
    userId: opts.userId,
    subjectLabel: label,
    events: eventsByUser.get(opts.userId) ?? [],
    fromDate: opts.attendanceDate,
    toDate: opts.attendanceDate,
    now,
    disputesByDate: mapped ? { [opts.attendanceDate]: mapped.dispute } : {},
    correctionsByDate: mapped?.correction
      ? { [opts.attendanceDate]: mapped.correction }
      : {},
  });
  return days[0] ?? null;
}

export async function flagAttendanceDayDispute(
  pool: pg.Pool,
  opts: {
    userId: string;
    attendanceDate: string;
    staffNote: string;
  },
): Promise<{ id: string; status: string }> {
  await ensureAttendanceDisputeTables(pool);
  const note = opts.staffNote.trim().slice(0, 2000);
  if (!note) throw new Error("NOTE_REQUIRED");
  const id = `adis-${randomUUID()}`;
  await pool.query(
    `INSERT INTO siya_attendance_day_disputes
       (id, user_id, attendance_date, status, staff_note, flagged_at, updated_at)
     VALUES ($1, $2, $3::date, 'under_review', $4, NOW(), NOW())
     ON CONFLICT (user_id, attendance_date) DO UPDATE SET
       status = 'under_review',
       staff_note = EXCLUDED.staff_note,
       resolution_note = NULL,
       corrected_working_minutes = NULL,
       corrected_break_minutes = NULL,
       corrected_focus_minutes = NULL,
       flagged_at = NOW(),
       resolved_at = NULL,
       resolved_by = NULL,
       updated_at = NOW(),
       id = CASE
         WHEN siya_attendance_day_disputes.status = 'under_review'
         THEN siya_attendance_day_disputes.id
         ELSE EXCLUDED.id
       END
     RETURNING id, status`,
    [id, opts.userId, opts.attendanceDate, note],
  );
  const r = await pool.query(
    `SELECT id, status FROM siya_attendance_day_disputes
     WHERE user_id = $1 AND attendance_date = $2::date`,
    [opts.userId, opts.attendanceDate],
  );
  return { id: r.rows[0].id as string, status: r.rows[0].status as string };
}

export async function resolveAttendanceDayDispute(
  pool: pg.Pool,
  opts: {
    userId: string;
    attendanceDate: string;
    resolverUserId: string;
    resolution: "stands" | "corrected";
    resolutionNote: string;
    correctedWorkingMinutes?: number;
    correctedBreakMinutes?: number;
    correctedFocusMinutes?: number;
  },
): Promise<{ id: string; status: string }> {
  await ensureAttendanceDisputeTables(pool);
  const resolutionNote = opts.resolutionNote.trim().slice(0, 2000);
  if (!resolutionNote) throw new Error("NOTE_REQUIRED");

  const existing = await pool.query(
    `SELECT id, status FROM siya_attendance_day_disputes
     WHERE user_id = $1 AND attendance_date = $2::date`,
    [opts.userId, opts.attendanceDate],
  );
  if (!existing.rows[0]) throw new Error("NOT_FOUND");
  if (existing.rows[0].status !== "under_review") throw new Error("NOT_UNDER_REVIEW");

  if (opts.resolution === "stands") {
    await pool.query(
      `UPDATE siya_attendance_day_disputes SET
         status = 'resolved_stands',
         resolution_note = $3,
         corrected_working_minutes = NULL,
         corrected_break_minutes = NULL,
         corrected_focus_minutes = NULL,
         resolved_at = NOW(),
         resolved_by = $4,
         updated_at = NOW()
       WHERE user_id = $1 AND attendance_date = $2::date`,
      [opts.userId, opts.attendanceDate, resolutionNote, opts.resolverUserId],
    );
  } else {
    const w = opts.correctedWorkingMinutes;
    const b = opts.correctedBreakMinutes;
    const f = opts.correctedFocusMinutes;
    if (
      typeof w !== "number" ||
      typeof b !== "number" ||
      typeof f !== "number" ||
      w < 0 ||
      b < 0 ||
      f < 0
    ) {
      throw new Error("CORRECTION_REQUIRED");
    }
    await pool.query(
      `UPDATE siya_attendance_day_disputes SET
         status = 'resolved_corrected',
         resolution_note = $3,
         corrected_working_minutes = $4,
         corrected_break_minutes = $5,
         corrected_focus_minutes = $6,
         resolved_at = NOW(),
         resolved_by = $7,
         updated_at = NOW()
       WHERE user_id = $1 AND attendance_date = $2::date`,
      [opts.userId, opts.attendanceDate, resolutionNote, w, b, f, opts.resolverUserId],
    );
  }

  const r = await pool.query(
    `SELECT id, status FROM siya_attendance_day_disputes
     WHERE user_id = $1 AND attendance_date = $2::date`,
    [opts.userId, opts.attendanceDate],
  );
  return { id: r.rows[0].id as string, status: r.rows[0].status as string };
}
