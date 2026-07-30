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

export async function ensureActiveShift(
  pool: pg.Pool,
  userId: string,
  workShift: WorkShift,
  source: ShiftAttendanceSource,
): Promise<{ store: ShiftStore; started: boolean }> {
  await ensureShiftAttendanceTables(pool);
  let store = await loadShiftStore(pool, userId);
  if (store.active) {
    return { store, started: false };
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
  return { store, started: true };
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

export async function logShiftEnd(pool: pg.Pool, userId: string, metadata: Record<string, unknown>): Promise<void> {
  await ensureShiftAttendanceTables(pool);
  await logShiftAttendance(pool, userId, "shift_end", "staff_ui", metadata);
}
