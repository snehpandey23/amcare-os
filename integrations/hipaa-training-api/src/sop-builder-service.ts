import type pg from "pg";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type SopBuilderSessionStatus = "in_progress" | "draft_ready" | "submitted";

export type SopBuilderTranscriptEntry = {
  role: "assistant" | "user";
  content: string;
  skipped?: boolean;
};

export type SopBuilderSourceRefs = {
  sops?: { id: string; title: string; snippet: string }[];
  kb?: { id: string; title: string; snippet: string }[];
};

export type SopBuilderDraftJson = {
  title: string;
  description: string;
  checklistItems: { id: string; label: string; order: number }[];
  gaps: string[];
};

export type SopBuilderSessionRecord = {
  id: string;
  userId: string;
  topic: string;
  transcript: SopBuilderTranscriptEntry[];
  sourceMaterialRefs: SopBuilderSourceRefs;
  draftJson: SopBuilderDraftJson | null;
  status: SopBuilderSessionStatus;
  createdAt: string;
  updatedAt: string;
};

export type SopFeedbackRecord = {
  id: string;
  sopTemplateId: string;
  checklistItemId: string;
  userId: string;
  note: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  userName?: string | null;
  templateTitle?: string | null;
  itemLabel?: string | null;
};

let schemaReady: Promise<void> | null = null;

export async function ensureSopBuilderTablesReady(pool: pg.Pool): Promise<void> {
  if (!schemaReady) {
    schemaReady = ensureSopBuilderTables(pool).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

async function ensureSopBuilderTables(pool: pg.Pool): Promise<void> {
  const { ensureTaskTablesReady } = await import("./task-service.js");
  await ensureTaskTablesReady(pool);
  const sql = readFileSync(join(__dirname, "database", "sop-builder-schema.sql"), "utf8");
  await pool.query(sql);
}

function rowToSession(row: Record<string, unknown>): SopBuilderSessionRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    topic: row.topic as string,
    transcript: (row.transcript_json as SopBuilderTranscriptEntry[]) ?? [],
    sourceMaterialRefs: (row.source_material_refs as SopBuilderSourceRefs) ?? {},
    draftJson: (row.draft_json as SopBuilderDraftJson | null) ?? null,
    status: row.status as SopBuilderSessionStatus,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

export async function canUseSopBuilder(pool: pg.Pool, userId: string, role: string): Promise<boolean> {
  if (role === "admin") return true;
  const { listMyLeadDepartments } = await import("./sop-service.js");
  const slugs = await listMyLeadDepartments(pool, userId);
  return slugs.length > 0;
}

export async function createSopBuilderSession(
  pool: pg.Pool,
  userId: string,
  topic: string,
  sourceMaterialRefs: SopBuilderSourceRefs,
  initialTranscript: SopBuilderTranscriptEntry[] = [],
): Promise<SopBuilderSessionRecord> {
  await ensureSopBuilderTablesReady(pool);
  const id = `sbs-${randomUUID()}`;
  await pool.query(
    `INSERT INTO sop_builder_sessions (id, user_id, topic, transcript_json, source_material_refs, status)
     VALUES ($1, $2, $3, $4, $5, 'in_progress')`,
    [id, userId, topic.slice(0, 500), JSON.stringify(initialTranscript), JSON.stringify(sourceMaterialRefs)],
  );
  const r = await pool.query(`SELECT * FROM sop_builder_sessions WHERE id = $1`, [id]);
  return rowToSession(r.rows[0] as Record<string, unknown>);
}

export async function getSopBuilderSession(pool: pg.Pool, id: string): Promise<SopBuilderSessionRecord | null> {
  await ensureSopBuilderTablesReady(pool);
  const r = await pool.query(`SELECT * FROM sop_builder_sessions WHERE id = $1`, [id]);
  if (!r.rows[0]) return null;
  return rowToSession(r.rows[0] as Record<string, unknown>);
}

export async function listSopBuilderSessionsForUser(
  pool: pg.Pool,
  userId: string,
  statuses?: SopBuilderSessionStatus[],
): Promise<SopBuilderSessionRecord[]> {
  await ensureSopBuilderTablesReady(pool);
  const allowed = statuses?.length ? statuses : (["in_progress", "draft_ready"] as SopBuilderSessionStatus[]);
  const r = await pool.query(
    `SELECT * FROM sop_builder_sessions
     WHERE user_id = $1 AND status = ANY($2::varchar[])
     ORDER BY updated_at DESC
     LIMIT 20`,
    [userId, allowed],
  );
  return r.rows.map((row) => rowToSession(row as Record<string, unknown>));
}

export async function updateSopBuilderSession(
  pool: pg.Pool,
  id: string,
  patch: {
    transcript?: SopBuilderTranscriptEntry[];
    draftJson?: SopBuilderDraftJson | null;
    status?: SopBuilderSessionStatus;
    sourceMaterialRefs?: SopBuilderSourceRefs;
  },
): Promise<SopBuilderSessionRecord | null> {
  await ensureSopBuilderTablesReady(pool);
  const sets: string[] = ["updated_at = NOW()"];
  const vals: unknown[] = [];
  let i = 1;
  if (patch.transcript !== undefined) {
    sets.push(`transcript_json = $${i++}`);
    vals.push(JSON.stringify(patch.transcript));
  }
  if (patch.draftJson !== undefined) {
    sets.push(`draft_json = $${i++}`);
    vals.push(patch.draftJson ? JSON.stringify(patch.draftJson) : null);
  }
  if (patch.status !== undefined) {
    sets.push(`status = $${i++}`);
    vals.push(patch.status);
  }
  if (patch.sourceMaterialRefs !== undefined) {
    sets.push(`source_material_refs = $${i++}`);
    vals.push(JSON.stringify(patch.sourceMaterialRefs));
  }
  vals.push(id);
  await pool.query(`UPDATE sop_builder_sessions SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  return getSopBuilderSession(pool, id);
}

export async function listSubmittedSopBuilderSessions(pool: pg.Pool): Promise<
  (SopBuilderSessionRecord & { userName: string | null; userEmail: string })[]
> {
  await ensureSopBuilderTablesReady(pool);
  const r = await pool.query(
    `SELECT s.*, u.name AS user_name, u.email AS user_email
     FROM sop_builder_sessions s
     JOIN hipaa_training_users u ON u.id = s.user_id
     WHERE s.status = 'submitted'
     ORDER BY s.updated_at DESC
     LIMIT 50`,
  );
  return r.rows.map((row) => ({
    ...rowToSession(row as Record<string, unknown>),
    userName: (row.user_name as string) ?? null,
    userEmail: row.user_email as string,
  }));
}

export async function createSopFeedback(
  pool: pg.Pool,
  userId: string,
  opts: { sopTemplateId: string; checklistItemId: string; note: string },
): Promise<SopFeedbackRecord> {
  await ensureSopBuilderTablesReady(pool);
  const { getSopTemplate } = await import("./task-service.js");
  const template = await getSopTemplate(pool, opts.sopTemplateId);
  if (!template) throw new Error("Template not found");
  const item = template.checklistItems.find((c) => c.id === opts.checklistItemId);
  if (!item) throw new Error("Checklist item not found");
  const id = `sfb-${randomUUID()}`;
  await pool.query(
    `INSERT INTO sop_feedback (id, sop_template_id, checklist_item_id, user_id, note)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, opts.sopTemplateId, opts.checklistItemId, userId, opts.note.slice(0, 2000)],
  );
  const r = await pool.query(`SELECT * FROM sop_feedback WHERE id = $1`, [id]);
  return rowToFeedback(r.rows[0] as Record<string, unknown>, template.title, item.label);
}

function rowToFeedback(
  row: Record<string, unknown>,
  templateTitle?: string,
  itemLabel?: string,
): SopFeedbackRecord {
  return {
    id: row.id as string,
    sopTemplateId: row.sop_template_id as string,
    checklistItemId: row.checklist_item_id as string,
    userId: row.user_id as string,
    note: (row.note as string) ?? "",
    createdAt: new Date(row.created_at as string).toISOString(),
    resolved: Boolean(row.resolved),
    resolvedAt: row.resolved_at ? new Date(row.resolved_at as string).toISOString() : null,
    resolvedBy: (row.resolved_by as string) ?? null,
    userName: (row.user_name as string) ?? null,
    templateTitle: templateTitle ?? (row.template_title as string) ?? null,
    itemLabel: itemLabel ?? (row.item_label as string) ?? null,
  };
}

export async function listUnresolvedSopFeedback(pool: pg.Pool): Promise<SopFeedbackRecord[]> {
  await ensureSopBuilderTablesReady(pool);
  const r = await pool.query(
    `SELECT f.*, t.title AS template_title, u.name AS user_name
     FROM sop_feedback f
     JOIN siya_sop_templates t ON t.id = f.sop_template_id
     JOIN hipaa_training_users u ON u.id = f.user_id
     WHERE f.resolved = FALSE
     ORDER BY f.created_at DESC
     LIMIT 200`,
  );
  const out: SopFeedbackRecord[] = [];
  for (const row of r.rows) {
    const templateId = row.sop_template_id as string;
    const itemId = row.checklist_item_id as string;
    const { getSopTemplate } = await import("./task-service.js");
    const template = await getSopTemplate(pool, templateId);
    const itemLabel = template?.checklistItems.find((c) => c.id === itemId)?.label;
    out.push(
      rowToFeedback(row as Record<string, unknown>, row.template_title as string, itemLabel ?? undefined),
    );
  }
  return out;
}

export async function resolveSopFeedback(
  pool: pg.Pool,
  feedbackId: string,
  resolvedBy: string,
): Promise<SopFeedbackRecord | null> {
  await ensureSopBuilderTablesReady(pool);
  await pool.query(
    `UPDATE sop_feedback SET resolved = TRUE, resolved_at = NOW(), resolved_by = $1 WHERE id = $2`,
    [resolvedBy, feedbackId],
  );
  const r = await pool.query(`SELECT * FROM sop_feedback WHERE id = $1`, [feedbackId]);
  if (!r.rows[0]) return null;
  return rowToFeedback(r.rows[0] as Record<string, unknown>);
}
