import type pg from "pg";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));

let ensured = false;

export async function ensureAssistTelemetryTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "assist-telemetry-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

export async function insertAssistGap(
  pool: pg.Pool,
  input: { id: string; department: string; task: string },
): Promise<void> {
  await ensureAssistTelemetryTables(pool);
  await pool.query(
    `INSERT INTO siya_assist_gaps (id, department, task_label, status)
     VALUES ($1, $2, $3, 'open')
     ON CONFLICT (id) DO NOTHING`,
    [input.id, input.department.slice(0, 64), input.task.slice(0, 200)],
  );
}

export async function insertAssistFeedback(
  pool: pg.Pool,
  input: {
    helpful: boolean;
    failureType?: string;
    department?: string;
    knowledgeGap?: boolean;
  },
): Promise<void> {
  await ensureAssistTelemetryTables(pool);
  await pool.query(
    `INSERT INTO siya_assist_feedback (helpful, failure_type, department, knowledge_gap)
     VALUES ($1, $2, $3, $4)`,
    [
      input.helpful,
      input.failureType?.slice(0, 64) ?? null,
      input.department?.slice(0, 64) ?? null,
      Boolean(input.knowledgeGap),
    ],
  );
}

export async function countOpenGapsSince(pool: pg.Pool, since: Date): Promise<number> {
  await ensureAssistTelemetryTables(pool);
  const r = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_assist_gaps WHERE status = 'open' AND created_at >= $1`,
    [since],
  );
  return r.rows[0]?.c ?? 0;
}

export async function countNegativeFeedbackSince(pool: pg.Pool, since: Date): Promise<number> {
  await ensureAssistTelemetryTables(pool);
  const r = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_assist_feedback WHERE helpful = FALSE AND created_at >= $1`,
    [since],
  );
  return r.rows[0]?.c ?? 0;
}
