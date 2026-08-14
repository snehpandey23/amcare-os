import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { departmentToSlug, slugToDepartment } from "./sop-store.js";

const __dir = dirname(fileURLToPath(import.meta.url));

let ensured = false;

/** Cross-cutting depts always go to founder instant inbox (not lead digest). */
export const FOUNDER_INSTANT_DEPARTMENTS = new Set(["Leadership", "General"]);

export type AssistGapStatus = "open" | "resolved";

export type AssistGapRecord = {
  id: string;
  department: string;
  departmentSlug: string;
  taskLabel: string;
  status: AssistGapStatus;
  phiRedacted: boolean;
  createdAt: string;
  resolvedAt: string | null;
};

export type GapNotifyRoute = {
  mode: "lead_digest" | "founder_instant";
  departmentSlug: string;
  departmentLabel: string;
  leadUserId: string | null;
  leadEmail: string | null;
  leadName: string | null;
  reason: string;
};

export type LeadGapDigestPayload = {
  userId: string;
  email: string;
  name: string | null;
  weekStart: string;
  departments: string[];
  gaps: { id: string; department: string; taskLabel: string; createdAt: string }[];
};

export async function ensureAssistTelemetryTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "assist-telemetry-schema.sql"), "utf8");
  await pool.query(sql);
  await pool.query(`ALTER TABLE siya_assist_gaps ADD COLUMN IF NOT EXISTS department_slug VARCHAR(64)`);
  await pool.query(`ALTER TABLE siya_assist_gaps ADD COLUMN IF NOT EXISTS phi_redacted BOOLEAN NOT NULL DEFAULT FALSE`);
  await pool.query(`ALTER TABLE siya_assist_gaps ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ`);
  await pool.query(
    `ALTER TABLE siya_assist_gaps ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL`,
  );
  await pool.query(
    `UPDATE siya_assist_gaps SET department_slug = lower(regexp_replace(regexp_replace(department, '\\s+', '_', 'g'), '[^a-z0-9_]', '', 'g'))
     WHERE department_slug IS NULL OR department_slug = ''`,
  );
  await pool.query(`ALTER TABLE siya_assist_gaps ALTER COLUMN department_slug SET DEFAULT 'general'`);
  await pool.query(`UPDATE siya_assist_gaps SET department_slug = 'general' WHERE department_slug IS NULL`);
  await pool.query(`ALTER TABLE siya_assist_gaps ALTER COLUMN department_slug SET NOT NULL`);
  ensured = true;
}

function rowToGap(row: Record<string, unknown>): AssistGapRecord {
  const status = row.status === "resolved" ? "resolved" : "open";
  return {
    id: String(row.id),
    department: String(row.department || "General"),
    departmentSlug: String(row.department_slug || "general"),
    taskLabel: String(row.task_label || ""),
    status,
    phiRedacted: Boolean(row.phi_redacted),
    createdAt: new Date(row.created_at as string).toISOString(),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at as string).toISOString() : null,
  };
}

export async function resolveGapNotifyRoute(pool: pg.Pool, departmentLabel: string): Promise<GapNotifyRoute> {
  await ensureAssistTelemetryTables(pool);
  const label = slugToDepartment(departmentToSlug(departmentLabel)) || departmentLabel || "General";
  const slug = departmentToSlug(label);

  if (FOUNDER_INSTANT_DEPARTMENTS.has(label)) {
    return {
      mode: "founder_instant",
      departmentSlug: slug,
      departmentLabel: label,
      leadUserId: null,
      leadEmail: null,
      leadName: null,
      reason: "cross_cutting_department",
    };
  }

  const r = await pool.query(
    `SELECT l.user_id, u.email, u.name, u.role
     FROM siya_department_leads l
     LEFT JOIN hipaa_training_users u ON u.id = l.user_id AND u.deactivated_at IS NULL
     WHERE l.department_slug = $1`,
    [slug],
  );
  const row = r.rows[0] as
    | { user_id: string | null; email: string | null; name: string | null; role: string | null }
    | undefined;

  if (!row?.user_id) {
    return {
      mode: "founder_instant",
      departmentSlug: slug,
      departmentLabel: label,
      leadUserId: null,
      leadEmail: null,
      leadName: null,
      reason: "no_assigned_lead",
    };
  }

  if (row.role === "admin") {
    return {
      mode: "founder_instant",
      departmentSlug: slug,
      departmentLabel: label,
      leadUserId: row.user_id,
      leadEmail: row.email,
      leadName: row.name,
      reason: "lead_is_founder_admin",
    };
  }

  const email = String(row.email || "")
    .trim()
    .toLowerCase();
  return {
    mode: "lead_digest",
    departmentSlug: slug,
    departmentLabel: label,
    leadUserId: row.user_id,
    leadEmail: email.includes("@") ? email : null,
    leadName: row.name,
    reason: "department_lead",
  };
}

export async function insertAssistGap(
  pool: pg.Pool,
  input: {
    id: string;
    department: string;
    task: string;
    phiRedacted?: boolean;
  },
): Promise<{ gap: AssistGapRecord; route: GapNotifyRoute }> {
  await ensureAssistTelemetryTables(pool);
  const route = await resolveGapNotifyRoute(pool, input.department);
  await pool.query(
    `INSERT INTO siya_assist_gaps (id, department, department_slug, task_label, status, phi_redacted)
     VALUES ($1, $2, $3, $4, 'open', $5)
     ON CONFLICT (id) DO NOTHING`,
    [
      input.id,
      route.departmentLabel.slice(0, 64),
      route.departmentSlug,
      input.task.slice(0, 200),
      Boolean(input.phiRedacted),
    ],
  );
  const gap =
    (await getAssistGap(pool, input.id)) ||
    ({
      id: input.id,
      department: route.departmentLabel,
      departmentSlug: route.departmentSlug,
      taskLabel: input.task.slice(0, 200),
      status: "open" as const,
      phiRedacted: Boolean(input.phiRedacted),
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    } satisfies AssistGapRecord);
  return { gap, route };
}

export async function getAssistGap(pool: pg.Pool, id: string): Promise<AssistGapRecord | null> {
  await ensureAssistTelemetryTables(pool);
  const r = await pool.query(`SELECT * FROM siya_assist_gaps WHERE id = $1`, [id]);
  if (!r.rows[0]) return null;
  return rowToGap(r.rows[0] as Record<string, unknown>);
}

export async function listOpenGapsForViewer(
  pool: pg.Pool,
  opts: { userId: string; role: string },
): Promise<AssistGapRecord[]> {
  await ensureAssistTelemetryTables(pool);
  if (opts.role === "admin") {
    const r = await pool.query(
      `SELECT * FROM siya_assist_gaps WHERE status = 'open' ORDER BY created_at DESC LIMIT 200`,
    );
    return r.rows.map((row) => rowToGap(row as Record<string, unknown>));
  }
  const { listMyLeadDepartments } = await import("./sop-service.js");
  const slugs = await listMyLeadDepartments(pool, opts.userId);
  if (!slugs.length) return [];
  const r = await pool.query(
    `SELECT * FROM siya_assist_gaps
     WHERE status = 'open' AND department_slug = ANY($1::text[])
     ORDER BY created_at DESC LIMIT 200`,
    [slugs],
  );
  return r.rows.map((row) => rowToGap(row as Record<string, unknown>));
}

export async function resolveAssistGap(
  pool: pg.Pool,
  opts: { id: string; userId: string; role: string },
): Promise<AssistGapRecord> {
  await ensureAssistTelemetryTables(pool);
  const gap = await getAssistGap(pool, opts.id);
  if (!gap) throw new Error("Gap not found");
  if (gap.status !== "open") throw new Error("Gap is already resolved");

  if (opts.role !== "admin") {
    const { isLeadForDepartment } = await import("./sop-service.js");
    const ok = await isLeadForDepartment(pool, opts.userId, gap.departmentSlug);
    if (!ok) throw new Error("Only the department lead or an admin can resolve this gap");
  }

  const r = await pool.query(
    `UPDATE siya_assist_gaps
     SET status = 'resolved', resolved_at = NOW(), resolved_by = $2
     WHERE id = $1 RETURNING *`,
    [opts.id, opts.userId],
  );
  return rowToGap(r.rows[0] as Record<string, unknown>);
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

/** Build weekly lead digests for open gaps (category/task only — no question text). */
export async function buildLeadGapDigestPayloads(
  pool: pg.Pool,
  weekStart: string,
): Promise<LeadGapDigestPayload[]> {
  await ensureAssistTelemetryTables(pool);
  const r = await pool.query(
    `SELECT g.id, g.department, g.department_slug, g.task_label, g.created_at,
            l.user_id, u.email, u.name, u.role
     FROM siya_assist_gaps g
     JOIN siya_department_leads l ON l.department_slug = g.department_slug AND l.user_id IS NOT NULL
     JOIN hipaa_training_users u ON u.id = l.user_id AND u.deactivated_at IS NULL
     WHERE g.status = 'open'
       AND u.role <> 'admin'
       AND g.department NOT IN ('Leadership', 'General')
       AND NOT EXISTS (
         SELECT 1 FROM siya_assist_gap_digest_sends d
         WHERE d.user_id = l.user_id AND d.week_start = $1::date
       )
     ORDER BY u.email ASC, g.created_at DESC`,
    [weekStart],
  );

  const byUser = new Map<string, LeadGapDigestPayload>();
  for (const row of r.rows) {
    const email = String(row.email || "")
      .trim()
      .toLowerCase();
    if (!email.includes("@")) continue;
    const userId = String(row.user_id);
    let payload = byUser.get(userId);
    if (!payload) {
      payload = {
        userId,
        email,
        name: (row.name as string) ?? null,
        weekStart,
        departments: [],
        gaps: [],
      };
      byUser.set(userId, payload);
    }
    const dept = String(row.department);
    if (!payload.departments.includes(dept)) payload.departments.push(dept);
    payload.gaps.push({
      id: String(row.id),
      department: dept,
      taskLabel: String(row.task_label || "Missing approved policy"),
      createdAt: new Date(row.created_at as string).toISOString(),
    });
  }
  return [...byUser.values()].filter((p) => p.gaps.length > 0);
}

export async function markLeadGapDigestSent(
  pool: pg.Pool,
  opts: { userId: string; weekStart: string; gapCount: number },
): Promise<void> {
  await ensureAssistTelemetryTables(pool);
  await pool.query(
    `INSERT INTO siya_assist_gap_digest_sends (id, user_id, week_start, gap_count)
     VALUES ($1, $2, $3::date, $4)
     ON CONFLICT (user_id, week_start) DO UPDATE SET
       gap_count = EXCLUDED.gap_count,
       sent_at = NOW()`,
    [`gap-digest-${opts.userId}-${opts.weekStart}`, opts.userId, opts.weekStart, opts.gapCount],
  );
}

export function newGapId(): string {
  return `gap-${Date.now()}-${randomUUID().slice(0, 8)}`;
}
