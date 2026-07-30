import type pg from "pg";
import { halfLifeReviewDue } from "./constitution-store.js";
import {
  departmentToSlug,
  parseSopStatus,
  SOP_DEPARTMENTS,
  SOP_TASK_SEED,
  slugToDepartment,
  type DepartmentLead,
  type SopDepartment,
  type SopRecord,
  type SopTaskRecord,
  type SopTaskStatus,
  type SopTaskType,
} from "./sop-store.js";
import { OPERATIONAL_SOP_PACK } from "./lead-operational-pack.js";

export async function ensureSopTables(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_department_leads (
      department_slug VARCHAR(64) PRIMARY KEY,
      department_label VARCHAR(128) NOT NULL,
      user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS siya_sops (
      id TEXT PRIMARY KEY,
      department_slug VARCHAR(64) NOT NULL,
      department_label VARCHAR(128) NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(32) NOT NULL DEFAULT 'draft',
      owner_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
      review_date DATE,
      half_life_days INT NOT NULL DEFAULT 365,
      reviewer_comment TEXT,
      submitted_at TIMESTAMPTZ,
      approved_at TIMESTAMPTZ,
      approved_by UUID REFERENCES hipaa_training_users(id),
      ai_drafted BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_siya_sops_dept_status ON siya_sops(department_slug, status);

    CREATE TABLE IF NOT EXISTS siya_sop_tasks (
      id TEXT PRIMARY KEY,
      department_slug VARCHAR(64) NOT NULL,
      department_label VARCHAR(128) NOT NULL,
      task_type VARCHAR(16) NOT NULL,
      title TEXT NOT NULL,
      sop_id TEXT REFERENCES siya_sops(id) ON DELETE SET NULL,
      assignee_user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
      due_date DATE,
      status VARCHAR(16) NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_siya_sop_tasks_dept ON siya_sop_tasks(department_slug, status);
  `);

  await pool.query(`ALTER TABLE siya_sops ADD COLUMN IF NOT EXISTS ai_drafted BOOLEAN NOT NULL DEFAULT FALSE`);

  for (const dept of SOP_DEPARTMENTS) {
    const slug = departmentToSlug(dept);
    await pool.query(
      `INSERT INTO siya_department_leads (department_slug, department_label, user_id)
       VALUES ($1, $2, NULL) ON CONFLICT (department_slug) DO NOTHING`,
      [slug, dept],
    );
  }
}

export async function seedSopTasksIfEmpty(pool: pg.Pool): Promise<void> {
  const c = await pool.query(`SELECT COUNT(*)::int AS n FROM siya_sop_tasks`);
  if ((c.rows[0]?.n as number) > 0) return;
  for (const t of SOP_TASK_SEED) {
    const slug = departmentToSlug(t.department);
    await pool.query(
      `INSERT INTO siya_sop_tasks (id, department_slug, department_label, task_type, title, status)
       VALUES ($1, $2, $3, $4, $5, 'open')`,
      [`task-seed-${slug}-${t.taskType}`, slug, t.department, t.taskType, t.title],
    );
  }
}

async function firstAdminUserId(pool: pg.Pool): Promise<string | null> {
  const r = await pool.query(
    `SELECT id FROM hipaa_training_users WHERE role = 'admin' AND deactivated_at IS NULL ORDER BY created_at ASC LIMIT 1`,
  );
  return (r.rows[0]?.id as string) ?? null;
}

async function resolveDepartmentOwner(pool: pg.Pool, departmentSlug: string): Promise<string | null> {
  const lead = await pool.query(
    `SELECT user_id FROM siya_department_leads WHERE department_slug = $1 AND user_id IS NOT NULL`,
    [departmentSlug],
  );
  if (lead.rows[0]?.user_id) return lead.rows[0].user_id as string;
  return firstAdminUserId(pool);
}

/** Idempotent install of meeting-derived Knowledge tasks (+ draft SOP stubs when an owner exists). */
export async function ensureOperationalSopPack(pool: pg.Pool): Promise<void> {
  await ensureSopTables(pool);
  for (const item of OPERATIONAL_SOP_PACK) {
    const slug = departmentToSlug(item.department);
    await pool.query(
      `INSERT INTO siya_sop_tasks (id, department_slug, department_label, task_type, title, status)
       VALUES ($1, $2, $3, $4, $5, 'open')
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, department_label = EXCLUDED.department_label`,
      [item.id, slug, item.department, item.taskType, item.title],
    );

    const ownerId = await resolveDepartmentOwner(pool, slug);
    if (!ownerId) continue;

    const sopId = `sop-pack-${item.id}`;
    await pool.query(
      `INSERT INTO siya_sops
        (id, department_slug, department_label, title, body, status, owner_user_id, ai_drafted)
       VALUES ($1, $2, $3, $4, $5, 'draft', $6, TRUE)
       ON CONFLICT (id) DO NOTHING`,
      [sopId, slug, item.department, item.draftSopTitle, item.draftSopBody, ownerId],
    );
    await pool.query(`UPDATE siya_sop_tasks SET sop_id = $1 WHERE id = $2 AND sop_id IS NULL`, [sopId, item.id]);
  }
  await syncOpenSopTasksToAllLeads(pool);
}

export async function getUserRole(pool: pg.Pool, userId: string): Promise<string> {
  const r = await pool.query(`SELECT role FROM hipaa_training_users WHERE id = $1`, [userId]);
  return (r.rows[0]?.role as string) ?? "trainee";
}

export async function isLeadForDepartment(pool: pg.Pool, userId: string, departmentSlug: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM siya_department_leads WHERE department_slug = $1 AND user_id = $2`,
    [departmentSlug, userId],
  );
  return r.rows.length > 0;
}

export async function listDepartmentLeads(pool: pg.Pool): Promise<DepartmentLead[]> {
  const r = await pool.query(
    `SELECT l.department_slug, l.department_label, l.user_id, u.name, u.email
     FROM siya_department_leads l
     LEFT JOIN hipaa_training_users u ON u.id = l.user_id
     ORDER BY l.department_label ASC`,
  );
  return r.rows.map((row) => ({
    department: row.department_label as SopDepartment,
    departmentSlug: row.department_slug as string,
    userId: (row.user_id as string) ?? null,
    userName: (row.name as string) ?? null,
    userEmail: (row.email as string) ?? null,
  }));
}

export async function setDepartmentLead(pool: pg.Pool, departmentSlug: string, userId: string | null): Promise<void> {
  if (!slugToDepartment(departmentSlug)) throw new Error("Invalid department");
  await pool.query(`UPDATE siya_department_leads SET user_id = $1, updated_at = NOW() WHERE department_slug = $2`, [
    userId,
    departmentSlug,
  ]);
  if (userId) {
    await assignOpenSopTasksToLead(pool, departmentSlug, userId);
  }
}

/** Open department SOP tasks (create/update procedures) go to the department lead when unassigned. */
export async function assignOpenSopTasksToLead(
  pool: pg.Pool,
  departmentSlug: string,
  userId: string,
): Promise<number> {
  const r = await pool.query(
    `UPDATE siya_sop_tasks SET assignee_user_id = $1
     WHERE department_slug = $2 AND status = 'open' AND assignee_user_id IS NULL
     RETURNING id`,
    [userId, departmentSlug],
  );
  return r.rowCount ?? 0;
}

/** Backfill for leads saved before auto-assign existed. */
export async function syncOpenSopTasksToAllLeads(pool: pg.Pool): Promise<number> {
  const r = await pool.query(
    `UPDATE siya_sop_tasks t
     SET assignee_user_id = l.user_id
     FROM siya_department_leads l
     WHERE t.department_slug = l.department_slug
       AND t.status = 'open'
       AND t.assignee_user_id IS NULL
       AND l.user_id IS NOT NULL
     RETURNING t.id`,
  );
  return r.rowCount ?? 0;
}

function rowToSop(row: Record<string, unknown>): SopRecord {
  let keywords: string[] = [];
  if (Array.isArray(row.keywords)) keywords = row.keywords as string[];
  else if (typeof row.keywords === "string") {
    try {
      keywords = JSON.parse(row.keywords);
    } catch {
      keywords = [];
    }
  }
  return {
    id: row.id as string,
    department: row.department_label as SopDepartment,
    title: row.title as string,
    body: row.body as string,
    keywords,
    status: parseSopStatus(row.status),
    ownerUserId: row.owner_user_id as string,
    ownerName: (row.owner_name as string) ?? null,
    reviewDate: row.review_date ? new Date(row.review_date as string).toISOString().slice(0, 10) : null,
    halfLifeDays: Number(row.half_life_days),
    reviewerComment: (row.reviewer_comment as string) ?? null,
    submittedAt: row.submitted_at ? new Date(row.submitted_at as string).toISOString() : null,
    approvedAt: row.approved_at ? new Date(row.approved_at as string).toISOString() : null,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    aiDrafted: Boolean(row.ai_drafted),
  };
}

async function assertCanEditSop(pool: pg.Pool, userId: string, role: string, sop: SopRecord): Promise<void> {
  if (role === "admin") return;
  const slug = departmentToSlug(sop.department);
  if (!(await isLeadForDepartment(pool, userId, slug))) throw new Error("Department lead access required");
  if (sop.status !== "draft" && sop.status !== "needs_review") {
    throw new Error("SOP can only be edited in draft or needs_review");
  }
}

export async function listSops(pool: pg.Pool, opts: { departmentSlug?: string; status?: string }): Promise<SopRecord[]> {
  await refreshExpiredLiveSops(pool);
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (opts.departmentSlug) {
    params.push(opts.departmentSlug);
    clauses.push(`s.department_slug = $${params.length}`);
  }
  if (opts.status) {
    params.push(opts.status);
    clauses.push(`s.status = $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const r = await pool.query(
    `SELECT s.*, u.name AS owner_name FROM siya_sops s
     JOIN hipaa_training_users u ON u.id = s.owner_user_id ${where}
     ORDER BY s.updated_at DESC`,
    params,
  );
  return r.rows.map(rowToSop);
}

export async function listSopsForRetrieval(pool: pg.Pool): Promise<SopRecord[]> {
  await refreshExpiredLiveSops(pool);
  const r = await pool.query(
    `SELECT s.*, u.name AS owner_name FROM siya_sops s
     JOIN hipaa_training_users u ON u.id = s.owner_user_id
     WHERE s.status IN ('live', 'pending_review', 'needs_review')
     ORDER BY s.updated_at DESC`,
  );
  return r.rows.map(rowToSop);
}

export async function getSop(pool: pg.Pool, id: string): Promise<SopRecord | null> {
  const r = await pool.query(
    `SELECT s.*, u.name AS owner_name FROM siya_sops s
     JOIN hipaa_training_users u ON u.id = s.owner_user_id WHERE s.id = $1`,
    [id],
  );
  if (!r.rows[0]) return null;
  return rowToSop(r.rows[0]);
}

export async function createSop(
  pool: pg.Pool,
  userId: string,
  role: string,
  body: {
    department: string;
    title: string;
    body?: string;
    keywords?: string[];
    reviewDate?: string;
    halfLifeDays?: number;
    aiDrafted?: boolean;
  },
): Promise<SopRecord> {
  const dept = resolveDepartment(body.department);
  const slug = departmentToSlug(dept);
  if (role !== "admin" && !(await isLeadForDepartment(pool, userId, slug))) {
    throw new Error("Department lead access required");
  }
  const id = `sop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const r = await pool.query(
    `INSERT INTO siya_sops
      (id, department_slug, department_label, title, body, keywords, status, owner_user_id, review_date, half_life_days, ai_drafted)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,'draft',$7,$8,$9,$10) RETURNING *`,
    [
      id,
      slug,
      dept,
      body.title.slice(0, 500),
      (body.body ?? "").slice(0, 50000),
      JSON.stringify(body.keywords ?? []),
      userId,
      body.reviewDate?.slice(0, 10) ?? null,
      body.halfLifeDays ?? 365,
      Boolean(body.aiDrafted),
    ],
  );
  const owner = await pool.query(`SELECT name FROM hipaa_training_users WHERE id = $1`, [userId]);
  return rowToSop({ ...r.rows[0], owner_name: owner.rows[0]?.name });
}

function resolveDepartment(raw: string): SopDepartment {
  const bySlug = slugToDepartment(raw);
  if (bySlug) return bySlug;
  if (SOP_DEPARTMENTS.includes(raw as SopDepartment)) return raw as SopDepartment;
  throw new Error("Invalid department");
}

export async function updateSop(
  pool: pg.Pool,
  userId: string,
  role: string,
  id: string,
  patch: {
    title?: string;
    body?: string;
    keywords?: string[];
    reviewDate?: string;
    halfLifeDays?: number;
  },
): Promise<SopRecord> {
  const sop = await getSop(pool, id);
  if (!sop) throw new Error("SOP not found");
  await assertCanEditSop(pool, userId, role, sop);
  const r = await pool.query(
    `UPDATE siya_sops SET
      title = COALESCE($2, title),
      body = COALESCE($3, body),
      keywords = COALESCE($4::jsonb, keywords),
      review_date = COALESCE($5, review_date),
      half_life_days = COALESCE($6, half_life_days),
      updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [
      id,
      patch.title?.slice(0, 500) ?? null,
      patch.body !== undefined ? patch.body.slice(0, 50000) : null,
      patch.keywords ? JSON.stringify(patch.keywords) : null,
      patch.reviewDate?.slice(0, 10) ?? null,
      patch.halfLifeDays ?? null,
    ],
  );
  return rowToSop({ ...r.rows[0], owner_name: sop.ownerName });
}

export async function submitSopForReview(pool: pg.Pool, userId: string, role: string, id: string): Promise<SopRecord> {
  const sop = await getSop(pool, id);
  if (!sop) throw new Error("SOP not found");
  await assertCanEditSop(pool, userId, role, sop);
  const r = await pool.query(
    `UPDATE siya_sops SET status = 'pending_review', submitted_at = NOW(), reviewer_comment = NULL, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id],
  );
  return rowToSop({ ...r.rows[0], owner_name: sop.ownerName });
}

export async function approveSop(pool: pg.Pool, adminUserId: string, id: string): Promise<SopRecord> {
  const sop = await getSop(pool, id);
  if (!sop) throw new Error("SOP not found");
  if (sop.status !== "pending_review") throw new Error("SOP is not pending review");
  const r = await pool.query(
    `UPDATE siya_sops SET status = 'live', approved_at = NOW(), approved_by = $2, reviewer_comment = NULL, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, adminUserId],
  );
  return rowToSop({ ...r.rows[0], owner_name: sop.ownerName });
}

export async function sendBackSop(pool: pg.Pool, id: string, comment: string): Promise<SopRecord> {
  const sop = await getSop(pool, id);
  if (!sop) throw new Error("SOP not found");
  if (sop.status !== "pending_review") throw new Error("SOP is not pending review");
  const r = await pool.query(
    `UPDATE siya_sops SET status = 'draft', reviewer_comment = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, comment.slice(0, 4000)],
  );
  return rowToSop({ ...r.rows[0], owner_name: sop.ownerName });
}

function rowToTask(row: Record<string, unknown>): SopTaskRecord {
  return {
    id: row.id as string,
    department: row.department_label as SopDepartment,
    taskType: row.task_type as SopTaskType,
    title: row.title as string,
    sopId: (row.sop_id as string) ?? null,
    assigneeUserId: (row.assignee_user_id as string) ?? null,
    assigneeName: (row.assignee_name as string) ?? null,
    dueDate: row.due_date ? new Date(row.due_date as string).toISOString().slice(0, 10) : null,
    status: row.status as SopTaskStatus,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function listSopTasks(pool: pg.Pool, departmentSlug?: string): Promise<SopTaskRecord[]> {
  const r = departmentSlug
    ? await pool.query(
        `SELECT t.*, u.name AS assignee_name FROM siya_sop_tasks t
         LEFT JOIN hipaa_training_users u ON u.id = t.assignee_user_id
         WHERE t.department_slug = $1 ORDER BY t.status ASC, t.due_date NULLS LAST`,
        [departmentSlug],
      )
    : await pool.query(
        `SELECT t.*, u.name AS assignee_name FROM siya_sop_tasks t
         LEFT JOIN hipaa_training_users u ON u.id = t.assignee_user_id
         ORDER BY t.department_label ASC, t.status ASC`,
      );
  return r.rows.map(rowToTask);
}

export async function createSopTask(
  pool: pg.Pool,
  userId: string,
  role: string,
  body: {
    department: string;
    taskType: SopTaskType;
    title: string;
    sopId?: string;
    assigneeUserId?: string;
    dueDate?: string;
  },
): Promise<SopTaskRecord> {
  const dept = resolveDepartment(body.department);
  const slug = departmentToSlug(dept);
  if (role !== "admin" && !(await isLeadForDepartment(pool, userId, slug))) {
    throw new Error("Department lead access required");
  }
  const id = `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await pool.query(
    `INSERT INTO siya_sop_tasks (id, department_slug, department_label, task_type, title, sop_id, assignee_user_id, due_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      id,
      slug,
      dept,
      body.taskType,
      body.title.slice(0, 500),
      body.sopId ?? null,
      body.assigneeUserId ?? null,
      body.dueDate?.slice(0, 10) ?? null,
    ],
  );
  const tasks = await listSopTasks(pool, slug);
  const t = tasks.find((x) => x.id === id);
  if (!t) throw new Error("Task create failed");
  return t;
}

export async function patchSopTask(
  pool: pg.Pool,
  userId: string,
  role: string,
  taskId: string,
  patch: { assigneeUserId?: string | null; dueDate?: string | null; status?: SopTaskStatus },
): Promise<SopTaskRecord> {
  const r0 = await pool.query(`SELECT department_slug FROM siya_sop_tasks WHERE id = $1`, [taskId]);
  if (!r0.rows[0]) throw new Error("Task not found");
  const slug = r0.rows[0].department_slug as string;
  if (role !== "admin" && !(await isLeadForDepartment(pool, userId, slug))) {
    throw new Error("Department lead access required");
  }
  await pool.query(
    `UPDATE siya_sop_tasks SET
      assignee_user_id = COALESCE($2, assignee_user_id),
      due_date = COALESCE($3, due_date),
      status = COALESCE($4, status)
     WHERE id = $1`,
    [taskId, patch.assigneeUserId ?? null, patch.dueDate ?? null, patch.status ?? null],
  );
  const all = await listSopTasks(pool);
  const t = all.find((x) => x.id === taskId);
  if (!t) throw new Error("Task not found");
  return t;
}

export async function listLiveSopStyleSamples(
  pool: pg.Pool,
  departmentSlug: string,
  limit = 3,
): Promise<{ title: string; body: string }[]> {
  const r = await pool.query(
    `SELECT title, body FROM siya_sops
     WHERE department_slug = $1 AND status = 'live'
     ORDER BY updated_at DESC LIMIT $2`,
    [departmentSlug, limit],
  );
  return r.rows.map((row) => ({
    title: row.title as string,
    body: (row.body as string).slice(0, 4000),
  }));
}

export async function listMyLeadDepartments(pool: pg.Pool, userId: string): Promise<string[]> {
  const r = await pool.query(`SELECT department_slug FROM siya_department_leads WHERE user_id = $1`, [userId]);
  return r.rows.map((row) => row.department_slug as string);
}

/** Move live SOPs past half-life into needs_review (Knowledge layer refresh). */
export async function refreshExpiredLiveSops(pool: pg.Pool): Promise<void> {
  const r = await pool.query(
    `SELECT id, approved_at, created_at, half_life_days FROM siya_sops WHERE status = 'live'`,
  );
  for (const row of r.rows) {
    const anchor = row.approved_at ?? row.created_at;
    if (!anchor) continue;
    const days = Number(row.half_life_days);
    if (!Number.isFinite(days) || days <= 0) continue;
    if (halfLifeReviewDue(new Date(anchor as string).toISOString(), days)) {
      await pool.query(`UPDATE siya_sops SET status = 'needs_review', updated_at = NOW() WHERE id = $1`, [row.id]);
    }
  }
}
