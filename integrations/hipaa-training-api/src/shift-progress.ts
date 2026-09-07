import type pg from "pg";
import { parseShiftStore, type ShiftStore, type PresenceStatus } from "./shift-store.js";
import {
  ensureShiftAttendanceTables,
  logShiftAttendance,
  presenceTransitionEvents,
  type ShiftAttendanceSource,
} from "./shift-attendance.js";

type WorkShift = "morning" | "evening" | "night";

export async function loadShiftStore(pool: pg.Pool, userId: string): Promise<ShiftStore> {
  const r = await pool.query("SELECT shift_json FROM hipaa_training_progress WHERE user_id = $1", [userId]);
  return parseShiftStore(r.rows[0]?.shift_json);
}

export async function saveShiftStore(pool: pg.Pool, userId: string, store: ShiftStore): Promise<void> {
  const json = JSON.stringify(store);
  await pool.query(
    `INSERT INTO hipaa_training_progress (user_id, course_version, progress_json, shift_json, updated_at)
     VALUES ($1, 'n/a', '{}'::jsonb, $2::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (user_id) DO UPDATE SET shift_json = EXCLUDED.shift_json, updated_at = CURRENT_TIMESTAMP`,
    [userId, json],
  );
}

/** Open shifts older than this are treated as abandoned and auto-closed (attendance integrity). */
export const STALE_OPEN_SHIFT_HOURS = 24;

/**
 * If the user has an active shift older than `maxAgeHours`, close it as of
 * startedAt + maxAgeHours (not "now") so weeks of phantom Working time are not attributed.
 * Logs shift_end with source=system.
 */
export async function closeStaleActiveShiftIfNeeded(
  pool: pg.Pool,
  userId: string,
  opts?: { now?: Date; maxAgeHours?: number },
): Promise<{ closed: boolean; store: ShiftStore; ageHours?: number }> {
  const maxAgeHours = opts?.maxAgeHours ?? STALE_OPEN_SHIFT_HOURS;
  const now = opts?.now ?? new Date();
  let store = await loadShiftStore(pool, userId);
  if (!store.active?.startedAt) return { closed: false, store };

  const startedMs = new Date(store.active.startedAt).getTime();
  if (Number.isNaN(startedMs)) return { closed: false, store };
  const ageHours = (now.getTime() - startedMs) / 3600000;
  if (ageHours < maxAgeHours) return { closed: false, store, ageHours };

  const { countPresenceSessions } = await import("./shift-store.js");
  const { breakCount, focusSessionCount } = countPresenceSessions(store.active.presenceLog);
  const endedAtMs = startedMs + maxAgeHours * 3600000;
  const endedAt = new Date(Math.min(endedAtMs, now.getTime())).toISOString();
  const ended = {
    id: `sh-stale-${Date.now()}`,
    startedAt: store.active.startedAt,
    endedAt,
    workShift: store.active.workShift,
    breakCount,
    focusSessionCount,
  };
  store = { active: null, recent: [ended, ...store.recent].slice(0, 60) };
  await saveShiftStore(pool, userId, store);
  await ensureShiftAttendanceTables(pool);
  await logShiftAttendance(pool, userId, "shift_end", "system", {
    workShift: ended.workShift,
    breakCount,
    focusSessionCount,
    autoClosed: true,
    reason: "stale_open_shift",
    endedAt,
    startedAt: ended.startedAt,
    ageHoursAtClose: Math.round(ageHours),
    staleThresholdHours: maxAgeHours,
  });
  return { closed: true, store, ageHours };
}

/** Sweep all users with a stale active shift (admin / hours report integrity). */
export async function closeAllStaleActiveShifts(
  pool: pg.Pool,
  opts?: { now?: Date; maxAgeHours?: number },
): Promise<{ closedUserIds: string[]; checked: number }> {
  const r = await pool.query(
    `SELECT u.id, p.shift_json
     FROM hipaa_training_users u
     JOIN hipaa_training_progress p ON p.user_id = u.id
     WHERE u.deactivated_at IS NULL
       AND p.shift_json ? 'active'
       AND p.shift_json->'active' IS NOT NULL
       AND p.shift_json->>'active' <> 'null'`,
  );
  const closedUserIds: string[] = [];
  for (const row of r.rows) {
    const result = await closeStaleActiveShiftIfNeeded(pool, row.id as string, opts);
    if (result.closed) closedUserIds.push(row.id as string);
  }
  return { closedUserIds, checked: r.rows.length };
}

export async function ensureActiveShift(
  pool: pg.Pool,
  userId: string,
  workShift: WorkShift,
  source: ShiftAttendanceSource,
): Promise<{ store: ShiftStore; started: boolean; staleClosed?: boolean }> {
  await ensureShiftAttendanceTables(pool);
  const stale = await closeStaleActiveShiftIfNeeded(pool, userId);
  let store = stale.store;
  if (store.active) {
    return { store, started: false, staleClosed: stale.closed };
  }
  const now = new Date().toISOString();
  store = {
    ...store,
    active: {
      startedAt: now,
      workShift,
      presence: "working",
      presenceSince: now,
      presenceLog: [{ status: "working", at: now }],
    },
  };
  await saveShiftStore(pool, userId, store);
  await logShiftAttendance(pool, userId, "shift_start", source, { workShift });
  return { store, started: true, staleClosed: stale.closed };
}

export async function logPresenceTransition(
  pool: pg.Pool,
  userId: string,
  from: PresenceStatus,
  to: PresenceStatus,
): Promise<void> {
  await ensureShiftAttendanceTables(pool);
  for (const eventType of presenceTransitionEvents(from, to)) {
    await logShiftAttendance(pool, userId, eventType, "staff_ui", { from, to });
  }
}

export async function logShiftEnd(pool: pg.Pool, userId: string, metadata: Record<string, unknown>): Promise<string> {
  await ensureShiftAttendanceTables(pool);
  return logShiftAttendance(pool, userId, "shift_end", "staff_ui", metadata);
}
