import type pg from "pg";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { nextOccurrenceDates, templateRunsOnDate, addDays } from "./task-recurrence.js";
import { istDateLabel } from "./shift-dashboard.js";
import type { ActivitySource, TaskActivityEvent, TemplateActivityEvent } from "./task-activity-events.js";
import {
  type ChecklistInstanceItem,
  type ChecklistTemplateItem,
  type RecurrenceConfig,
  type SopTemplateRecord,
  type TaskComment,
  type TaskPriority,
  type TaskRecord,
  type TaskRecurrence,
  type TaskStatus,
  newChecklistInstance,
  parseTaskPriority,
  parseTaskStatus,
  taskIsComplete,
} from "./task-store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let taskSchemaReady: Promise<void> | null = null;

/** Idempotent — adds missing columns (e.g. activity `source`) on older prod DBs. */
export async function ensureTaskTablesReady(pool: pg.Pool): Promise<void> {
  if (!taskSchemaReady) {
    taskSchemaReady = ensureTaskTables(pool).catch((err) => {
      taskSchemaReady = null;
      throw err;
    });
  }
  await taskSchemaReady;
}

export async function ensureTaskTables(pool: pg.Pool): Promise<void> {
  // Legacy prod: `siya_sop_templates` may exist without assigned_to_user_id; tasks-schema.sql creates an index on that column.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_sop_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      recurrence VARCHAR(32) NOT NULL,
      recurrence_config JSONB NOT NULL DEFAULT '{}'::jsonb,
      checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    ALTER TABLE siya_sop_templates ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES hipaa_training_users(id) ON DELETE CASCADE;
  `);
  await pool.query(`
    UPDATE siya_sop_templates SET assigned_to_user_id = created_by
    WHERE assigned_to_user_id IS NULL AND created_by IS NOT NULL;
  `);

  const sql = readFileSync(join(__dirname, "database", "tasks-schema.sql"), "utf8");
  await pool.query(sql);
  await pool.query(`
    ALTER TABLE siya_task_activity_logs ADD COLUMN IF NOT EXISTS source VARCHAR(32) NOT NULL DEFAULT 'system';
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_sop_template_activity_logs (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL REFERENCES siya_sop_templates(id) ON DELETE CASCADE,
      user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
      action VARCHAR(32) NOT NULL,
      source VARCHAR(32) NOT NULL DEFAULT 'api',
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await pool.query(`
    ALTER TABLE siya_sop_template_activity_logs ADD COLUMN IF NOT EXISTS source VARCHAR(32) NOT NULL DEFAULT 'api';
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_siya_template_activity ON siya_sop_template_activity_logs(template_id, created_at DESC);
  `);
}

function rowToTemplate(row: Record<string, unknown>): SopTemplateRecord {
  let assignedToUserId = row.assigned_to_user_id as string | undefined;
  if (!assignedToUserId && row.assigned_to) {
    const legacy = row.assigned_to as { kind?: string; userIds?: string[] };
    if (legacy.kind === "users" && legacy.userIds?.[0]) assignedToUserId = legacy.userIds[0];
  }
  if (!assignedToUserId) assignedToUserId = row.created_by as string;
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    recurrence: row.recurrence as TaskRecurrence,
    recurrenceConfig: (row.recurrence_config as RecurrenceConfig) ?? {},
    checklistItems: ((row.checklist_items as ChecklistTemplateItem[]) ?? []).map((c) => ({
      id: c.id,
      label: c.label,
      order: c.order,
    })),
    assignedToUserId,
    active: Boolean(row.active),
    createdBy: row.created_by as string,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

function rowToTask(row: Record<string, unknown>): TaskRecord {
  const rawItems = (row.checklist_items as ChecklistInstanceItem[]) ?? [];
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? "",
    type: row.task_type as "sop" | "adhoc",
    sourceSopTemplateId: (row.source_sop_template_id as string) ?? null,
    assigneeId: row.assignee_id as string,
    assignedBy: (row.assigned_by as string) ?? "",
    status: parseTaskStatus(row.status),
    priority: parseTaskPriority(row.priority),
    dueDate: new Date(row.due_date as string).toISOString().slice(0, 10),
    dueTime: row.due_time ? String(row.due_time).slice(0, 8) : null,
    checklistItems: rawItems.map((it) => ({
      id: it.id,
      label: it.label,
      isChecked: Boolean(it.isChecked),
      checkedAt: it.checkedAt ?? null,
    })),
    notes: (row.notes as TaskComment[]) ?? [],
    completedAt: row.completed_at ? new Date(row.completed_at as string).toISOString() : null,
    completedBy: (row.completed_by as string) ?? null,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    assigneeName: (row.assignee_name as string) ?? null,
    assigneeEmail: (row.assignee_email as string) ?? null,
    assignedByName: (row.assigned_by_name as string) ?? null,
  };
}

async function logTaskActivity(
  pool: pg.Pool,
  taskId: string,
  userId: string | null,
  action: TaskActivityEvent,
  metadata: Record<string, unknown>,
  source: ActivitySource,
): Promise<void> {
  await ensureTaskTablesReady(pool);
  await pool.query(
    `INSERT INTO siya_task_activity_logs (id, task_id, user_id, action, source, metadata) VALUES ($1, $2, $3, $4, $5, $6)`,
    [`log-${randomUUID()}`, taskId, userId, action, source, JSON.stringify(metadata)],
  );
}

async function logTemplateActivity(
  pool: pg.Pool,
  templateId: string,
  userId: string | null,
  action: TemplateActivityEvent,
  metadata: Record<string, unknown>,
  source: ActivitySource,
): Promise<void> {
  await ensureTaskTablesReady(pool);
  await pool.query(
    `INSERT INTO siya_sop_template_activity_logs (id, template_id, user_id, action, source, metadata) VALUES ($1, $2, $3, $4, $5, $6)`,
    [`tmpl-log-${randomUUID()}`, templateId, userId, action, source, JSON.stringify(metadata)],
  );
}

export function computeOverdueStatus(task: TaskRecord, now = new Date()): TaskStatus {
  if (task.status === "done") return "done";
  const due = task.dueTime
    ? new Date(`${task.dueDate}T${task.dueTime}`)
    : new Date(`${task.dueDate}T23:59:59`);
  if (now > due) return "overdue";
  return task.status === "overdue" ? "todo" : task.status;
}

function withOverdue(t: TaskRecord): TaskRecord {
  const status = computeOverdueStatus(t);
  return status === t.status ? t : { ...t, status };
}

const TASK_SELECT = `
  SELECT t.*,
    ua.name AS assignee_name, ua.email AS assignee_email,
    ub.name AS assigned_by_name
  FROM siya_tasks t
  LEFT JOIN hipaa_training_users ua ON ua.id = t.assignee_id
  LEFT JOIN hipaa_training_users ub ON ub.id = t.assigned_by
`;

export async function generateTasksFromTemplates(
  pool: pg.Pool,
  dateStr: string,
): Promise<{ created: number; skipped: number }> {
  const r = await pool.query(`SELECT * FROM siya_sop_templates WHERE active = TRUE`);
  let created = 0;
  let skipped = 0;
  for (const row of r.rows) {
    const template = rowToTemplate(row);
    if (!template.assignedToUserId) continue;
    if (!templateRunsOnDate(template.recurrence, template.recurrenceConfig, dateStr)) continue;
    const userId = template.assignedToUserId;
    const id = `sop-${template.id}-${dateStr}`;
    const exists = await pool.query(`SELECT 1 FROM siya_tasks WHERE id = $1`, [id]);
    if (exists.rows.length) {
      skipped += 1;
      continue;
    }
    const dueTime = template.recurrenceConfig.timeOfDay ?? "17:00:00";
    const checklist = newChecklistInstance(template.checklistItems);
    const ins = await pool.query(
      `INSERT INTO siya_tasks (
        id, title, description, task_type, source_sop_template_id, assignee_id,
        assigned_by, status, priority, due_date, due_time, checklist_items
      ) VALUES ($1,$2,$3,'sop',$4,$5,$6,'todo','medium',$7,$8,$9)
      ON CONFLICT (id) DO NOTHING
      RETURNING id`,
      [
        id,
        template.title,
        template.description,
        template.id,
        userId,
        template.createdBy,
        dateStr,
        dueTime,
        JSON.stringify(checklist),
      ],
    );
    if (!ins.rowCount) {
      skipped += 1;
      continue;
    }
    created += 1;
    await logTaskActivity(pool, id, null, "created", { templateId: template.id, date: dateStr }, "cron");
  }
  return { created, skipped };
}

/** Turn SOP templates into task rows for each day in range (ops calendar dates). */
export async function materializeTasksForDateRange(
  pool: pg.Pool,
  from: string,
  to: string,
): Promise<void> {
  await ensureTaskTablesReady(pool);
  if (from > to) return;
  let cursor = from;
  let guard = 0;
  while (cursor <= to && guard < 45) {
    await generateTasksFromTemplates(pool, cursor);
    cursor = addDays(cursor, 1);
    guard += 1;
  }
}

export function resolveOpsTaskDate(dateParam: string | undefined): string {
  if (!dateParam || dateParam === "today") return istDateLabel(new Date());
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return dateParam;
  return istDateLabel(new Date());
}

async function materializeNearTermFromTemplates(pool: pg.Pool): Promise<void> {
  const today = istDateLabel(new Date());
  await materializeTasksForDateRange(pool, today, addDays(today, 13));
}

export async function listSopTemplates(pool: pg.Pool): Promise<SopTemplateRecord[]> {
  const r = await pool.query(`SELECT * FROM siya_sop_templates ORDER BY updated_at DESC`);
  return r.rows.map(rowToTemplate);
}

export async function getSopTemplate(pool: pg.Pool, id: string): Promise<SopTemplateRecord | null> {
  const r = await pool.query(`SELECT * FROM siya_sop_templates WHERE id = $1`, [id]);
  return r.rows[0] ? rowToTemplate(r.rows[0]) : null;
}

export async function createSopTemplate(
  pool: pg.Pool,
  userId: string,
  body: {
    title: string;
    description?: string;
    recurrence: TaskRecurrence;
    recurrenceConfig?: RecurrenceConfig;
    checklistItems: ChecklistTemplateItem[];
    assignedToUserId: string;
    active?: boolean;
  },
  source: ActivitySource = "admin_ui",
): Promise<SopTemplateRecord> {
  const id = `tmpl-${randomUUID()}`;
  await pool.query(
    `INSERT INTO siya_sop_templates (
      id, title, description, recurrence, recurrence_config, checklist_items,
      assigned_to_user_id, active, created_by
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      id,
      body.title.trim(),
      body.description?.trim() ?? "",
      body.recurrence,
      JSON.stringify(body.recurrenceConfig ?? {}),
      JSON.stringify(body.checklistItems ?? []),
      body.assignedToUserId,
      body.active !== false,
      userId,
    ],
  );
  const t = await pool.query(`SELECT * FROM siya_sop_templates WHERE id = $1`, [id]);
  await logTemplateActivity(pool, id, userId, "created", { title: body.title.trim() }, source);
  await materializeNearTermFromTemplates(pool);
  return rowToTemplate(t.rows[0]);
}

export async function updateSopTemplate(
  pool: pg.Pool,
  id: string,
  patch: Partial<{
    title: string;
    description: string;
    recurrence: TaskRecurrence;
    recurrenceConfig: RecurrenceConfig;
    checklistItems: ChecklistTemplateItem[];
    assignedToUserId: string;
    active: boolean;
  }>,
  actorId: string | null = null,
  source: ActivitySource = "admin_ui",
): Promise<SopTemplateRecord> {
  const before = await getSopTemplate(pool, id);
  if (!before) throw new Error("Template not found");
  const sets: string[] = ["updated_at = NOW()"];
  const vals: unknown[] = [];
  let i = 1;
  const fields: [keyof typeof patch, string][] = [
    ["title", "title"],
    ["description", "description"],
    ["recurrence", "recurrence"],
    ["assignedToUserId", "assigned_to_user_id"],
    ["active", "active"],
  ];
  for (const [key, col] of fields) {
    if (patch[key] != null) {
      sets.push(`${col} = $${i++}`);
      vals.push(patch[key]);
    }
  }
  if (patch.recurrenceConfig != null) {
    sets.push(`recurrence_config = $${i++}`);
    vals.push(JSON.stringify(patch.recurrenceConfig));
  }
  if (patch.checklistItems != null) {
    sets.push(`checklist_items = $${i++}`);
    vals.push(JSON.stringify(patch.checklistItems));
  }
  vals.push(id);
  await pool.query(`UPDATE siya_sop_templates SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  const t = await pool.query(`SELECT * FROM siya_sop_templates WHERE id = $1`, [id]);
  if (!t.rows[0]) throw new Error("Template not found");
  if (patch.active === true && !before.active) {
    await logTemplateActivity(pool, id, actorId, "activated", {}, source);
  } else if (patch.active === false && before.active) {
    await logTemplateActivity(pool, id, actorId, "deactivated", {}, source);
  } else if (Object.keys(patch).length > 0) {
    await logTemplateActivity(pool, id, actorId, "updated", { fields: Object.keys(patch) }, source);
  }
  await materializeNearTermFromTemplates(pool);
  return rowToTemplate(t.rows[0]);
}

export { nextOccurrenceDates, templateRunsOnDate };

export async function getMyTasks(pool: pg.Pool, userId: string, dateStr: string): Promise<TaskRecord[]> {
  const { maybeSyncKnowledgeWorkToDailyBoard } = await import("./knowledge-sync-throttle.js");
  await maybeSyncKnowledgeWorkToDailyBoard(pool, dateStr);
  await materializeTasksForDateRange(pool, dateStr, dateStr);
  const r = await pool.query(
    `${TASK_SELECT} WHERE t.assignee_id = $1 AND t.due_date = $2
     ORDER BY t.due_time NULLS LAST, t.priority DESC, t.created_at ASC`,
    [userId, dateStr],
  );
  return r.rows.map(rowToTask).map(withOverdue);
}

export async function getTaskBoard(
  pool: pg.Pool,
  filters: {
    assigneeId?: string;
    status?: string;
    type?: string;
    overdue?: boolean;
    priority?: string;
    from?: string;
    to?: string;
  },
): Promise<TaskRecord[]> {
  await ensureTaskTablesReady(pool);
  const today = istDateLabel(new Date());
  const from = filters.from ?? addDays(today, -14);
  const to = filters.to ?? addDays(today, 7);
  const { maybeSyncKnowledgeWorkToDailyBoard } = await import("./knowledge-sync-throttle.js");
  await maybeSyncKnowledgeWorkToDailyBoard(pool, today, { force: true });
  await materializeTasksForDateRange(pool, from, to);

  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.assigneeId) {
    params.push(filters.assigneeId);
    clauses.push(`t.assignee_id = $${params.length}`);
  }
  if (filters.status) {
    params.push(filters.status);
    clauses.push(`t.status = $${params.length}`);
  }
  if (filters.type) {
    params.push(filters.type);
    clauses.push(`t.task_type = $${params.length}`);
  }
  if (filters.priority) {
    params.push(filters.priority);
    clauses.push(`t.priority = $${params.length}`);
  }
  if (filters.from) {
    params.push(filters.from);
    clauses.push(`t.due_date >= $${params.length}`);
  }
  if (filters.to) {
    params.push(filters.to);
    clauses.push(`t.due_date <= $${params.length}`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const r = await pool.query(
    `${TASK_SELECT} ${where} ORDER BY t.due_date DESC, t.due_time NULLS LAST LIMIT 500`,
    params,
  );
  let tasks = r.rows.map(rowToTask).map(withOverdue);
  if (filters.overdue) tasks = tasks.filter((t) => t.status === "overdue");
  return tasks;
}

export async function createAdhocTask(
  pool: pg.Pool,
  actorId: string,
  body: {
    title: string;
    description?: string;
    assigneeId: string;
    priority?: TaskPriority;
    dueDate: string;
    dueTime?: string;
    checklistItems?: ChecklistInstanceItem[];
  },
  source: ActivitySource = "api",
): Promise<TaskRecord> {
  await ensureTaskTablesReady(pool);
  const id = `adhoc-${randomUUID()}`;
  await pool.query(
    `INSERT INTO siya_tasks (
      id, title, description, task_type, assignee_id, assigned_by,
      status, priority, due_date, due_time, checklist_items
    ) VALUES ($1,$2,$3,'adhoc',$4,$5,'todo',$6,$7,$8,$9)`,
    [
      id,
      body.title.trim(),
      body.description?.trim() ?? "",
      body.assigneeId,
      actorId,
      body.priority ?? "medium",
      body.dueDate,
      body.dueTime ?? null,
      JSON.stringify(body.checklistItems ?? []),
    ],
  );
  await logTaskActivity(pool, id, actorId, "created", { type: "adhoc" }, source);
  const r = await pool.query(`${TASK_SELECT} WHERE t.id = $1`, [id]);
  return withOverdue(rowToTask(r.rows[0]));
}

export async function getTask(pool: pg.Pool, id: string): Promise<TaskRecord | null> {
  const r = await pool.query(`${TASK_SELECT} WHERE t.id = $1`, [id]);
  if (!r.rows[0]) return null;
  return withOverdue(rowToTask(r.rows[0]));
}

async function assertCanEditTask(_pool: pg.Pool, userId: string, role: string, task: TaskRecord): Promise<void> {
  if (role === "admin") return;
  if (task.assigneeId !== userId) throw new Error("You can only update your own tasks");
}

export async function updateTask(
  pool: pg.Pool,
  userId: string,
  role: string,
  taskId: string,
  patch: {
    status?: TaskStatus;
    assigneeId?: string;
    dueDate?: string;
    dueTime?: string | null;
    priority?: TaskPriority;
  },
  source: ActivitySource = "api",
): Promise<TaskRecord> {
  await ensureTaskTablesReady(pool);
  const task = await getTask(pool, taskId);
  if (!task) throw new Error("Task not found");
  if (patch.assigneeId && patch.assigneeId !== task.assigneeId && role !== "admin") {
    throw new Error("Only admins can reassign tasks");
  }
  if (patch.assigneeId || patch.dueDate || patch.dueTime !== undefined || patch.priority) {
    if (role !== "admin" && task.assigneeId !== userId) {
      throw new Error("You can only update your own tasks");
    }
  } else {
    await assertCanEditTask(pool, userId, role, task);
  }
  const status = patch.status ?? task.status;
  const completedAt = status === "done" ? new Date().toISOString() : null;
  const completedBy = status === "done" ? userId : null;
  await pool.query(
    `UPDATE siya_tasks SET
      status = COALESCE($1, status),
      assignee_id = COALESCE($2, assignee_id),
      due_date = COALESCE($3, due_date),
      due_time = COALESCE($4, due_time),
      priority = COALESCE($5, priority),
      completed_at = $6,
      completed_by = $7,
      updated_at = NOW()
     WHERE id = $8`,
    [
      patch.status ?? null,
      patch.assigneeId ?? null,
      patch.dueDate ?? null,
      patch.dueTime === undefined ? null : patch.dueTime,
      patch.priority ?? null,
      completedAt,
      completedBy,
      taskId,
    ],
  );
  if (patch.status) await logTaskActivity(pool, taskId, userId, "status_changed", { status: patch.status }, source);
  if (patch.assigneeId) await logTaskActivity(pool, taskId, userId, "assigned", { assigneeId: patch.assigneeId }, source);
  const updated = await getTask(pool, taskId);
  if (!updated) throw new Error("Task not found");
  return updated;
}

export async function updateTaskStatus(
  pool: pg.Pool,
  userId: string,
  role: string,
  taskId: string,
  status: TaskStatus,
): Promise<TaskRecord> {
  return updateTask(pool, userId, role, taskId, { status });
}

export async function toggleChecklistItem(
  pool: pg.Pool,
  userId: string,
  role: string,
  taskId: string,
  itemId: string,
  opts: { checked?: boolean },
  source: ActivitySource = "staff_ui",
): Promise<TaskRecord> {
  const task = await getTask(pool, taskId);
  if (!task) throw new Error("Task not found");
  await assertCanEditTask(pool, userId, role, task);
  const items = task.checklistItems.map((it) => {
    if (it.id !== itemId) return it;
    const nextChecked = opts.checked ?? !it.isChecked;
    return {
      ...it,
      isChecked: nextChecked,
      checkedAt: nextChecked ? new Date().toISOString() : null,
    };
  });
  if (!items.some((it) => it.id === itemId)) throw new Error("Checklist item not found");
  const allDone = items.length > 0 && items.every((it) => it.isChecked);
  let status: TaskStatus = task.status;
  if (allDone) status = "done";
  else if (task.status === "done") status = "in_progress";
  else if (status === "overdue") status = "in_progress";
  await pool.query(
    `UPDATE siya_tasks SET checklist_items = $1, status = $2,
      completed_at = CASE WHEN $2 = 'done' THEN NOW() ELSE NULL END,
      completed_by = CASE WHEN $2 = 'done' THEN $3::uuid ELSE NULL END,
      updated_at = NOW()
     WHERE id = $4`,
    [JSON.stringify(items), status, userId, taskId],
  );
  await logTaskActivity(
    pool,
    taskId,
    userId,
    "checklist_updated",
    {
      itemId,
      checked: items.find((i) => i.id === itemId)?.isChecked,
    },
    source,
  );
  const updated = await getTask(pool, taskId);
  if (!updated) throw new Error("Task not found");
  return updated;
}

export async function addTaskComment(
  pool: pg.Pool,
  userId: string,
  role: string,
  taskId: string,
  text: string,
): Promise<TaskRecord> {
  const task = await getTask(pool, taskId);
  if (!task) throw new Error("Task not found");
  await assertCanEditTask(pool, userId, role, task);
  const notes: TaskComment[] = [
    ...task.notes,
    { userId, text: text.trim(), createdAt: new Date().toISOString() },
  ];
  await pool.query(`UPDATE siya_tasks SET notes = $1, updated_at = NOW() WHERE id = $2`, [JSON.stringify(notes), taskId]);
  const updated = await getTask(pool, taskId);
  if (!updated) throw new Error("Task not found");
  return updated;
}

export async function markOverdueTasks(pool: pg.Pool): Promise<number> {
  const r = await pool.query(`SELECT id FROM siya_tasks WHERE status NOT IN ('done')`);
  let n = 0;
  for (const row of r.rows) {
    const task = await getTask(pool, row.id as string);
    if (!task) continue;
    const computed = computeOverdueStatus(task);
    if (computed === "overdue" && task.status !== "overdue") {
      await pool.query(`UPDATE siya_tasks SET status = 'overdue', updated_at = NOW() WHERE id = $1`, [task.id]);
      n += 1;
    }
  }
  return n;
}

async function upsertKnowledgeDailyTask(
  pool: pg.Pool,
  opts: {
    id: string;
    title: string;
    description: string;
    assigneeId: string;
    dueDate: string;
    knowledgeDone: boolean;
  },
): Promise<void> {
  const status = opts.knowledgeDone ? "done" : "todo";
  await pool.query(
    `INSERT INTO siya_tasks (
      id, title, description, task_type, assignee_id, assigned_by,
      status, priority, due_date, checklist_items
    ) VALUES ($1, $2, $3, 'adhoc', $4, $4, $5, 'high', $6, '[]'::jsonb)
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      assignee_id = EXCLUDED.assignee_id,
      due_date = EXCLUDED.due_date,
      status = CASE
        WHEN siya_tasks.status IN ('done', 'cancelled') THEN siya_tasks.status
        WHEN EXCLUDED.status = 'done' THEN 'done'
        ELSE siya_tasks.status
      END,
      updated_at = NOW()`,
    [opts.id, opts.title.slice(0, 500), opts.description.slice(0, 8000), opts.assigneeId, status, opts.dueDate],
  );
}

/** Mirror Knowledge-layer lead work onto the daily task board (`siya_tasks`). */
export async function syncKnowledgeWorkToDailyBoard(pool: pg.Pool, dueDate?: string): Promise<number> {
  await ensureTaskTablesReady(pool);
  const { ensureOperationalSopPack } = await import("./sop-service.js");
  await ensureOperationalSopPack(pool);
  const opsDate = dueDate ?? istDateLabel(new Date());
  let synced = 0;

  const openTasks = await pool.query(
    `SELECT id, title, task_type, department_label, assignee_user_id, status
     FROM siya_sop_tasks
     WHERE assignee_user_id IS NOT NULL AND status = 'open'`,
  );
  for (const row of openTasks.rows) {
    const assigneeId = row.assignee_user_id as string;
    const knDone = (row.status as string) === "done";
    const dept = row.department_label as string;
    await upsertKnowledgeDailyTask(pool, {
      id: `kn-sop-task-${row.id as string}`,
      title: row.title as string,
      description: `Grow → SOPs · ${dept} · Knowledge task (${row.task_type}). Complete in Grow or mark done on the task board.`,
      assigneeId,
      dueDate: opsDate,
      knowledgeDone: knDone,
    });
    synced += 1;
  }

  const needsReview = await pool.query(
    `SELECT id, title, owner_user_id FROM siya_sops WHERE status = 'needs_review'`,
  );
  for (const row of needsReview.rows) {
    const ownerId = row.owner_user_id as string;
    if (!ownerId) continue;
    await upsertKnowledgeDailyTask(pool, {
      id: `kn-sop-refresh-${row.id as string}`,
      title: `Refresh SOP: ${row.title as string}`,
      description: "This live SOP passed its review date. Update in Grow → SOPs and submit for review.",
      assigneeId: ownerId,
      dueDate: opsDate,
      knowledgeDone: false,
    });
    synced += 1;
  }

  const pendingReview = await pool.query(
    `SELECT s.id, s.title, l.user_id AS lead_id
     FROM siya_sops s
     JOIN siya_department_leads l ON l.department_slug = s.department_slug
     WHERE s.status = 'pending_review' AND l.user_id IS NOT NULL`,
  );
  for (const row of pendingReview.rows) {
    await upsertKnowledgeDailyTask(pool, {
      id: `kn-sop-lead-review-${row.id as string}`,
      title: `Lead review: ${row.title as string}`,
      description: "Department lead pre-check before admin approval. Admin queue: /admin/sop-review",
      assigneeId: row.lead_id as string,
      dueDate: opsDate,
      knowledgeDone: false,
    });
    synced += 1;
  }

  const adminRow = await pool.query(
    `SELECT id FROM hipaa_training_users WHERE role = 'admin' AND deactivated_at IS NULL ORDER BY created_at ASC LIMIT 1`,
  );
  const adminId = (adminRow.rows[0]?.id as string) ?? null;
  const adminPending = await pool.query(`SELECT id, title FROM siya_sops WHERE status = 'pending_review'`);
  for (const sop of adminPending.rows) {
    if (!adminId) break;
    await upsertKnowledgeDailyTask(pool, {
      id: `kn-sop-admin-review-${sop.id as string}`,
      title: `SOP review: ${sop.title as string}`,
      description: "Approve or send back in Admin → SOP review.",
      assigneeId: adminId,
      dueDate: opsDate,
      knowledgeDone: false,
    });
    synced += 1;
  }

  return synced;
}

export { taskIsComplete };
