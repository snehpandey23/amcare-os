import type pg from "pg";
import { randomUUID } from "node:crypto";
import { departmentToSlug, slugToDepartment } from "./sop-store.js";

let ensured = false;

/** Cross-cutting depts always go to founder instant inbox (not lead digest). */
export const FOUNDER_INSTANT_DEPARTMENTS = new Set(["Leadership", "General"]);

export type AssistGapStatus = "open" | "resolved";

/** How the gap entered the table — never stores question text. */
export type AssistGapSignalType =
  | "no_match"
  | "notify_owner"
  | "thumbs_down"
  | "unresolved_repeat";

export type AssistGapRecord = {
  id: string;
  department: string;
  departmentSlug: string;
  taskLabel: string;
  status: AssistGapStatus;
  signalType: AssistGapSignalType;
  phiRedacted: boolean;
  /** Optional reporter UUID — never question text. Null on historical rows. */
  reportedByUserId: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

export function parseAssistGapSignalType(raw: unknown): AssistGapSignalType {
  if (raw === "notify_owner" || raw === "thumbs_down" || raw === "unresolved_repeat" || raw === "no_match") {
    return raw;
  }
  return "no_match";
}

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

/**
 * Prod table may predate department_slug. CREATE TABLE IF NOT EXISTS is a no-op on that
 * old table; indexes in the .sql file then fail (42703) before ALTER ADD COLUMN runs.
 * Column add → backfill → indexes, in that order.
 */
export async function ensureAssistTelemetryTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_assist_gaps (
      id TEXT PRIMARY KEY,
      department TEXT NOT NULL DEFAULT 'General',
      task_label TEXT NOT NULL DEFAULT '',
      status VARCHAR(24) NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
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
  await pool.query(`UPDATE siya_assist_gaps SET department_slug = 'general' WHERE department_slug IS NULL OR department_slug = ''`);
  await pool.query(`ALTER TABLE siya_assist_gaps ALTER COLUMN department_slug SET NOT NULL`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_status ON siya_assist_gaps(status, created_at DESC)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_dept_status ON siya_assist_gaps(department_slug, status, created_at DESC)`,
  );
  await pool.query(
    `ALTER TABLE siya_assist_gaps ADD COLUMN IF NOT EXISTS signal_type VARCHAR(32) NOT NULL DEFAULT 'no_match'`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_signal ON siya_assist_gaps(signal_type, created_at DESC)`,
  );
  await pool.query(
    `ALTER TABLE siya_assist_gaps ADD COLUMN IF NOT EXISTS reported_by_user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_siya_assist_gaps_reported_by ON siya_assist_gaps(reported_by_user_id, created_at DESC)`,
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_assist_feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      helpful BOOLEAN NOT NULL,
      failure_type TEXT,
      department TEXT,
      knowledge_gap BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`ALTER TABLE siya_assist_feedback ADD COLUMN IF NOT EXISTS thread_id TEXT`);
  await pool.query(`ALTER TABLE siya_assist_feedback ADD COLUMN IF NOT EXISTS task_label TEXT`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_siya_assist_feedback_created ON siya_assist_feedback(created_at DESC)`,
  );
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_siya_assist_feedback_thread ON siya_assist_feedback(thread_id, created_at DESC)`,
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_assist_gap_digest_sends (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      gap_count INT NOT NULL DEFAULT 0,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, week_start)
    )
  `);
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
    signalType: parseAssistGapSignalType(row.signal_type),
    phiRedacted: Boolean(row.phi_redacted),
    reportedByUserId: row.reported_by_user_id ? String(row.reported_by_user_id) : null,
    createdAt: new Date(row.created_at as string).toISOString(),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at as string).toISOString() : null,
  };
}

/** Normalize task labels for recurring-pattern keys (no question text). */
export function normalizeGapTaskLabel(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 200);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseReportedByUserId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim();
  return UUID_RE.test(id) ? id : null;
}

export async function resolveGapNotifyRoute(pool: pg.Pool, departmentLabel: string): Promise<GapNotifyRoute> {
  await ensureAssistTelemetryTables(pool);
  const { ensureSopTables } = await import("./sop-service.js");
  await ensureSopTables(pool);
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
    signalType?: AssistGapSignalType;
    /** Optional reporter UUID only — never question text. */
    reportedByUserId?: string | null;
  },
): Promise<{ gap: AssistGapRecord; route: GapNotifyRoute; digestEligible: boolean }> {
  await ensureAssistTelemetryTables(pool);
  const route = await resolveGapNotifyRoute(pool, input.department);
  const signalType = parseAssistGapSignalType(input.signalType ?? "no_match");
  const reportedBy = parseReportedByUserId(input.reportedByUserId ?? null);
  await pool.query(
    `INSERT INTO siya_assist_gaps
       (id, department, department_slug, task_label, status, phi_redacted, signal_type, reported_by_user_id)
     VALUES ($1, $2, $3, $4, 'open', $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      input.id,
      route.departmentLabel.slice(0, 64),
      route.departmentSlug,
      input.task.slice(0, 200),
      Boolean(input.phiRedacted),
      signalType,
      reportedBy,
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
      signalType,
      phiRedacted: Boolean(input.phiRedacted),
      reportedByUserId: reportedBy,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    } satisfies AssistGapRecord);
  const digestEligible = await gapWouldAppearInWeeklyDigest(pool, gap.id);
  return { gap, route, digestEligible };
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
  const { ensureSopTables } = await import("./sop-service.js");
  await ensureSopTables(pool);
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
    threadId?: string;
    taskLabel?: string;
  },
): Promise<void> {
  await ensureAssistTelemetryTables(pool);
  await pool.query(
    `INSERT INTO siya_assist_feedback (helpful, failure_type, department, knowledge_gap, thread_id, task_label)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.helpful,
      input.failureType?.slice(0, 64) ?? null,
      input.department?.slice(0, 64) ?? null,
      Boolean(input.knowledgeGap),
      input.threadId?.slice(0, 80) ?? null,
      input.taskLabel?.slice(0, 200) ?? null,
    ],
  );
}

/** True if this thread logged a thumbs-up after `sinceIso` (exclusive of gap capture). */
export async function threadHadThumbsUpSince(
  pool: pg.Pool,
  threadId: string,
  sinceIso: string,
): Promise<boolean> {
  await ensureAssistTelemetryTables(pool);
  if (!threadId) return false;
  const r = await pool.query(
    `SELECT 1 FROM siya_assist_feedback
     WHERE thread_id = $1 AND helpful = TRUE AND created_at > $2::timestamptz
     LIMIT 1`,
    [threadId.slice(0, 80), sinceIso],
  );
  return r.rows.length > 0;
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

/** True if Monday cron would include this open gap (non-admin lead; not Leadership/General). */
export async function gapWouldAppearInWeeklyDigest(pool: pg.Pool, gapId: string): Promise<boolean> {
  await ensureAssistTelemetryTables(pool);
  const { ensureSopTables } = await import("./sop-service.js");
  await ensureSopTables(pool);
  const r = await pool.query(
    `SELECT EXISTS (
       SELECT 1
       FROM siya_assist_gaps g
       JOIN siya_department_leads l ON l.department_slug = g.department_slug AND l.user_id IS NOT NULL
       JOIN hipaa_training_users u ON u.id = l.user_id AND u.deactivated_at IS NULL
       WHERE g.id = $1
         AND g.status = 'open'
         AND u.role <> 'admin'
         AND g.department NOT IN ('Leadership', 'General')
         AND g.signal_type IN ('no_match', 'notify_owner')
     ) AS ok`,
    [gapId],
  );
  return Boolean(r.rows[0]?.ok);
}

/** Build weekly lead digests for open knowledge gaps (no_match / notify_owner only). */
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
       AND g.signal_type IN ('no_match', 'notify_owner')
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

export type FounderGapRollup = {
  weekStart: string;
  since: string;
  autoGaps: number;
  notifyOwnerGaps: number;
  thumbsDown: number;
  unresolvedRepeats: number;
  topTopics: { taskLabel: string; department: string; count: number; signalType: string }[];
};

/** Week rollup for founder digest — category/task aggregates only. */
export async function buildFounderGapRollup(pool: pg.Pool, weekStart: string): Promise<FounderGapRollup> {
  await ensureAssistTelemetryTables(pool);
  const since = `${weekStart}T00:00:00.000Z`;
  const counts = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE signal_type = 'no_match')::int AS auto_gaps,
       COUNT(*) FILTER (WHERE signal_type = 'notify_owner')::int AS notify_owner,
       COUNT(*) FILTER (WHERE signal_type = 'thumbs_down')::int AS thumbs_down,
       COUNT(*) FILTER (WHERE signal_type = 'unresolved_repeat')::int AS unresolved
     FROM siya_assist_gaps
     WHERE created_at >= $1::timestamptz`,
    [since],
  );
  const top = await pool.query(
    `SELECT task_label, department, signal_type, COUNT(*)::int AS c
     FROM siya_assist_gaps
     WHERE created_at >= $1::timestamptz
       AND task_label IS NOT NULL
       AND task_label <> ''
     GROUP BY task_label, department, signal_type
     ORDER BY c DESC, task_label ASC
     LIMIT 5`,
    [since],
  );
  const row = counts.rows[0] as
    | { auto_gaps: number; notify_owner: number; thumbs_down: number; unresolved: number }
    | undefined;
  return {
    weekStart,
    since,
    autoGaps: row?.auto_gaps ?? 0,
    notifyOwnerGaps: row?.notify_owner ?? 0,
    thumbsDown: row?.thumbs_down ?? 0,
    unresolvedRepeats: row?.unresolved ?? 0,
    topTopics: top.rows.map((r) => ({
      taskLabel: String(r.task_label || "Missing approved policy"),
      department: String(r.department || "General"),
      count: Number(r.c) || 0,
      signalType: String(r.signal_type || "no_match"),
    })),
  };
}

export type RecurringGapPattern = {
  departmentSlug: string;
  departmentLabel: string;
  taskLabel: string;
  normalizedTaskLabel: string;
  openGapCount: number;
  /** Distinct reporters with a UUID; 0 means historical-only / unknown people. */
  distinctPeople: number;
  /** True when ≥2 known reporters; false → display "Volume pattern (people unknown)." */
  multiStaff: boolean;
  windowDays: number;
  lastSeenAt: string;
  gapIds: string[];
  /** Hard boundary reminder for UI. */
  surfaceOnlyNote: string;
};

/**
 * Recurring knowledge-gap patterns for Ops B2.
 * Locked threshold: ≥3 open rows, same dept + normalized task_label, ≥2 distinct
 * reported_by_user_id, rolling 30 days. Excludes thumbs_down from the multi-staff count.
 *
 * Detection and surfacing only — never creates SOPs, assignments, or pending_review rows.
 */
export async function listRecurringGapPatterns(
  pool: pg.Pool,
  opts: {
    /** Admin: all depts. Lead: restrict to these slugs. */
    departmentSlugs?: string[] | null;
    windowDays?: number;
    minOpenGaps?: number;
    minDistinctPeople?: number;
  } = {},
): Promise<RecurringGapPattern[]> {
  await ensureAssistTelemetryTables(pool);
  const windowDays = opts.windowDays ?? 30;
  const minOpenGaps = opts.minOpenGaps ?? 3;
  const minDistinctPeople = opts.minDistinctPeople ?? 2;
  const slugs = opts.departmentSlugs?.filter(Boolean) ?? null;

  const params: unknown[] = [windowDays, minOpenGaps, minDistinctPeople];
  let deptClause = "";
  if (slugs && slugs.length > 0) {
    params.push(slugs);
    deptClause = `AND department_slug = ANY($${params.length}::text[])`;
  }

  // thumbs_down excluded from pattern detection (quality signal ≠ missing SOP).
  const r = await pool.query(
    `WITH eligible AS (
       SELECT
         id,
         department,
         department_slug,
         task_label,
         reported_by_user_id,
         created_at,
         lower(regexp_replace(trim(task_label), '\\s+', ' ', 'g')) AS norm_task
       FROM siya_assist_gaps
       WHERE status = 'open'
         AND signal_type <> 'thumbs_down'
         AND created_at >= NOW() - ($1::int * INTERVAL '1 day')
         AND trim(task_label) <> ''
         ${deptClause}
     ),
     grouped AS (
       SELECT
         department_slug,
         (array_agg(department ORDER BY created_at DESC))[1] AS department_label,
         (array_agg(task_label ORDER BY created_at DESC))[1] AS task_label,
         norm_task,
         COUNT(*)::int AS open_gap_count,
         COUNT(DISTINCT reported_by_user_id) FILTER (WHERE reported_by_user_id IS NOT NULL)::int AS distinct_people,
         MAX(created_at) AS last_seen_at,
         array_agg(id ORDER BY created_at DESC) AS gap_ids
       FROM eligible
       GROUP BY department_slug, norm_task
     )
     SELECT *
     FROM grouped
     WHERE open_gap_count >= $2
       AND distinct_people >= $3
     ORDER BY distinct_people DESC, open_gap_count DESC, department_slug ASC, norm_task ASC
     LIMIT 50`,
    params,
  );

  return r.rows.map((row) => {
    const distinctPeople = Number(row.distinct_people) || 0;
    const multiStaff = distinctPeople >= minDistinctPeople;
    return {
      departmentSlug: String(row.department_slug),
      departmentLabel: String(row.department_label || "General"),
      taskLabel: String(row.task_label || ""),
      normalizedTaskLabel: String(row.norm_task || ""),
      openGapCount: Number(row.open_gap_count) || 0,
      distinctPeople,
      multiStaff,
      windowDays,
      lastSeenAt: new Date(row.last_seen_at as string).toISOString(),
      gapIds: Array.isArray(row.gap_ids) ? row.gap_ids.map(String) : [],
      surfaceOnlyNote: "Surfaced for human action — no auto-draft.",
    } satisfies RecurringGapPattern;
  });
}

/**
 * Volume-only patterns (≥3 open, same key, 30d) that lack ≥2 known reporters.
 * Display label: "Volume pattern (people unknown)." Never auto-drafts.
 */
export async function listVolumeGapPatternsUnknownPeople(
  pool: pg.Pool,
  opts: {
    departmentSlugs?: string[] | null;
    windowDays?: number;
    minOpenGaps?: number;
  } = {},
): Promise<RecurringGapPattern[]> {
  await ensureAssistTelemetryTables(pool);
  const windowDays = opts.windowDays ?? 30;
  const minOpenGaps = opts.minOpenGaps ?? 3;
  const slugs = opts.departmentSlugs?.filter(Boolean) ?? null;
  const params: unknown[] = [windowDays, minOpenGaps];
  let deptClause = "";
  if (slugs && slugs.length > 0) {
    params.push(slugs);
    deptClause = `AND department_slug = ANY($${params.length}::text[])`;
  }

  const r = await pool.query(
    `WITH eligible AS (
       SELECT
         id,
         department,
         department_slug,
         task_label,
         reported_by_user_id,
         created_at,
         lower(regexp_replace(trim(task_label), '\\s+', ' ', 'g')) AS norm_task
       FROM siya_assist_gaps
       WHERE status = 'open'
         AND signal_type <> 'thumbs_down'
         AND created_at >= NOW() - ($1::int * INTERVAL '1 day')
         AND trim(task_label) <> ''
         ${deptClause}
     ),
     grouped AS (
       SELECT
         department_slug,
         (array_agg(department ORDER BY created_at DESC))[1] AS department_label,
         (array_agg(task_label ORDER BY created_at DESC))[1] AS task_label,
         norm_task,
         COUNT(*)::int AS open_gap_count,
         COUNT(DISTINCT reported_by_user_id) FILTER (WHERE reported_by_user_id IS NOT NULL)::int AS distinct_people,
         MAX(created_at) AS last_seen_at,
         array_agg(id ORDER BY created_at DESC) AS gap_ids
       FROM eligible
       GROUP BY department_slug, norm_task
     )
     SELECT *
     FROM grouped
     WHERE open_gap_count >= $2
       AND distinct_people < 2
     ORDER BY open_gap_count DESC, department_slug ASC, norm_task ASC
     LIMIT 50`,
    params,
  );

  return r.rows.map((row) => ({
    departmentSlug: String(row.department_slug),
    departmentLabel: String(row.department_label || "General"),
    taskLabel: String(row.task_label || ""),
    normalizedTaskLabel: String(row.norm_task || ""),
    openGapCount: Number(row.open_gap_count) || 0,
    distinctPeople: Number(row.distinct_people) || 0,
    multiStaff: false,
    windowDays,
    lastSeenAt: new Date(row.last_seen_at as string).toISOString(),
    gapIds: Array.isArray(row.gap_ids) ? row.gap_ids.map(String) : [],
    surfaceOnlyNote: "Surfaced for human action — no auto-draft.",
  }));
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
