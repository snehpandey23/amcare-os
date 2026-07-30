import type pg from "pg";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { PresenceStatus } from "./shift-store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type ShiftAttendanceEventType =
  | "shift_start"
  | "shift_end"
  | "break_start"
  | "break_end"
  | "focus_start"
  | "focus_end"
  | "tool_link_opened";

export type ShiftAttendanceSource = "login" | "staff_ui" | "cron" | "system";

export async function ensureShiftAttendanceTables(pool: pg.Pool): Promise<void> {
  const sql = readFileSync(join(__dirname, "database", "shift-attendance-schema.sql"), "utf8");
  await pool.query(sql);
}

export async function logShiftAttendance(
  pool: pg.Pool,
  userId: string,
  eventType: ShiftAttendanceEventType,
  source: ShiftAttendanceSource,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await pool.query(
    `INSERT INTO siya_shift_attendance_events (id, user_id, event_type, source, metadata) VALUES ($1, $2, $3, $4, $5)`,
    [`att-${randomUUID()}`, userId, eventType, source, JSON.stringify(metadata)],
  );
}

export function presenceTransitionEvents(
  from: PresenceStatus,
  to: PresenceStatus,
): ShiftAttendanceEventType[] {
  const events: ShiftAttendanceEventType[] = [];
  if (to === "break") events.push("break_start");
  else if (to === "focus") events.push("focus_start");
  else if (to === "working") {
    if (from === "break") events.push("break_end");
    if (from === "focus") events.push("focus_end");
  }
  return events;
}

export async function fetchAttendanceForCsv(
  pool: pg.Pool,
  fromIso: string,
  toIso: string,
): Promise<
  {
    created_at: Date;
    email: string;
    name: string | null;
    event_type: string;
    source: string;
    metadata: Record<string, unknown>;
  }[]
> {
  const r = await pool.query(
    `SELECT e.created_at, u.email, u.name, e.event_type, e.source, e.metadata
     FROM siya_shift_attendance_events e
     JOIN hipaa_training_users u ON u.id = e.user_id
     WHERE e.created_at >= $1::timestamptz AND e.created_at < $2::timestamptz
     ORDER BY e.created_at ASC`,
    [fromIso, toIso],
  );
  return r.rows.map((row) => ({
    created_at: row.created_at as Date,
    email: row.email as string,
    name: row.name as string | null,
    event_type: row.event_type as string,
    source: row.source as string,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  }));
}

export function attendanceRowsToCsv(
  rows: Awaited<ReturnType<typeof fetchAttendanceForCsv>>,
): string {
  const header = "timestamp_utc,email,name,event_type,source,detail";
  const lines = rows.map((r) => {
    const detail =
      r.event_type === "tool_link_opened"
        ? String(r.metadata.label ?? r.metadata.host ?? "")
        : "";
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    return [
      r.created_at.toISOString(),
      esc(r.email),
      esc(r.name ?? ""),
      r.event_type,
      r.source,
      esc(detail),
    ].join(",");
  });
  return [header, ...lines].join("\n");
}
