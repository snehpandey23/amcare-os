import type pg from "pg";
import { parseImportance } from "./memory-store.js";
import {
  parseConfidence,
  parseDecisionStatus,
  type DecisionRecord,
  type KnowledgeLink,
  type KnowledgeLinkRel,
} from "./knowledge-store.js";
import { ensureMemoryTable } from "./memory-service.js";
import { ensureConstitutionTable, seedConstitutionIfEmpty } from "./constitution-service.js";
import { halfLifeReviewDue } from "./constitution-store.js";

export async function ensureKnowledgeTables(pool: pg.Pool): Promise<void> {
  await ensureMemoryTable(pool);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_decisions (
      id TEXT PRIMARY KEY,
      author_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      decision_text TEXT NOT NULL,
      reason TEXT,
      what_changed TEXT,
      action_hook TEXT,
      owner_name TEXT,
      owner_user_id UUID REFERENCES hipaa_training_users(id) ON DELETE SET NULL,
      department VARCHAR(128),
      decision_date DATE,
      importance SMALLINT NOT NULL DEFAULT 2 CHECK (importance IN (1, 2, 3)),
      confidence SMALLINT NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      supersedes_id TEXT REFERENCES siya_decisions(id) ON DELETE SET NULL,
      evidence TEXT,
      lifecycle VARCHAR(32) NOT NULL DEFAULT 'promoted',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_siya_decisions_status ON siya_decisions(status, decision_date DESC);
    CREATE INDEX IF NOT EXISTS idx_siya_decisions_department ON siya_decisions(department);

    CREATE TABLE IF NOT EXISTS siya_knowledge_links (
      id TEXT PRIMARY KEY,
      from_id TEXT NOT NULL,
      to_id TEXT NOT NULL,
      rel_type VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (from_id, to_id, rel_type)
    );
    CREATE INDEX IF NOT EXISTS idx_siya_knowledge_links_from ON siya_knowledge_links(from_id);
    CREATE INDEX IF NOT EXISTS idx_siya_knowledge_links_to ON siya_knowledge_links(to_id);
  `);
  await pool.query(`
    ALTER TABLE siya_decisions ADD COLUMN IF NOT EXISTS parent_constitution_id TEXT;
    ALTER TABLE siya_decisions ADD COLUMN IF NOT EXISTS half_life_days INT;
    ALTER TABLE siya_decisions ADD COLUMN IF NOT EXISTS confidence_log JSONB NOT NULL DEFAULT '[]'::jsonb;
  `);
  await ensureConstitutionTable(pool);
  await seedConstitutionIfEmpty(pool);
  const { ensureLawTable, syncLawsSeed } = await import("./law-service.js");
  await ensureLawTable(pool);
  await syncLawsSeed(pool);
  const { ensureSopTables, seedSopTasksIfEmpty } = await import("./sop-service.js");
  await ensureSopTables(pool);
  await seedSopTasksIfEmpty(pool);
  const { ensureTaskTables } = await import("./task-service.js");
  await ensureTaskTables(pool);
}

function rowToDecision(row: Record<string, unknown>): DecisionRecord {
  return {
    id: row.id as string,
    authorUserId: row.author_user_id as string,
    authorName: (row.author_name as string) ?? null,
    title: row.title as string,
    decisionText: row.decision_text as string,
    reason: (row.reason as string) ?? null,
    whatChanged: (row.what_changed as string) ?? null,
    actionHook: (row.action_hook as string) ?? null,
    ownerName: (row.owner_name as string) ?? null,
    ownerUserId: (row.owner_user_id as string) ?? null,
    department: (row.department as string) ?? null,
    decisionDate: row.decision_date
      ? new Date(row.decision_date as string).toISOString().slice(0, 10)
      : null,
    importance: row.importance as 1 | 2 | 3,
    confidence: Number(row.confidence),
    status: parseDecisionStatus(row.status),
    supersedesId: (row.supersedes_id as string) ?? null,
    parentConstitutionId: (row.parent_constitution_id as string) ?? null,
    halfLifeDays: row.half_life_days != null ? Number(row.half_life_days) : null,
    reviewDue: halfLifeReviewDue(
      new Date(row.created_at as string).toISOString(),
      row.half_life_days != null ? Number(row.half_life_days) : "forever",
    ),
    evidence: (row.evidence as string) ?? null,
    lifecycle: (row.lifecycle as DecisionRecord["lifecycle"]) ?? "promoted",
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

export async function listDecisions(pool: pg.Pool, limit = 30): Promise<DecisionRecord[]> {
  const r = await pool.query(
    `SELECT d.*, u.name AS author_name
     FROM siya_decisions d
     JOIN hipaa_training_users u ON u.id = d.author_user_id
     WHERE d.status IN ('active', 'draft', 'idea', 'superseded')
     ORDER BY d.decision_date DESC NULLS LAST, d.created_at DESC
     LIMIT $1`,
    [limit],
  );
  return r.rows.map(rowToDecision);
}

export async function getDecision(pool: pg.Pool, id: string): Promise<DecisionRecord | null> {
  const r = await pool.query(
    `SELECT d.*, u.name AS author_name FROM siya_decisions d
     JOIN hipaa_training_users u ON u.id = d.author_user_id
     WHERE d.id = $1`,
    [id],
  );
  if (!r.rows[0]) return null;
  return rowToDecision(r.rows[0]);
}

export async function createDecision(
  pool: pg.Pool,
  userId: string,
  body: {
    title: string;
    decisionText: string;
    reason?: string;
    whatChanged?: string;
    actionHook?: string;
    ownerName?: string;
    department?: string;
    decisionDate?: string;
    importance?: number;
    confidence?: number;
    status?: string;
    supersedesId?: string;
    parentConstitutionId?: string;
    halfLifeDays?: number | null;
    relatedIds?: string[];
    evidence?: string;
  },
): Promise<DecisionRecord> {
  const hasConnection =
    Boolean(body.parentConstitutionId) ||
    Boolean(body.supersedesId) ||
    (body.relatedIds?.length ?? 0) > 0;
  if (!hasConnection) {
    throw new Error("Promoted knowledge must connect: parent principle, supersedes, or related link.");
  }
  const id = `dec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const importance = parseImportance(body.importance);
  const confidence = parseConfidence(body.confidence);
  const status = parseDecisionStatus(body.status ?? "active");
  const r = await pool.query(
    `INSERT INTO siya_decisions
      (id, author_user_id, title, decision_text, reason, what_changed, action_hook,
       owner_name, owner_user_id, department, decision_date, importance, confidence,
       status, supersedes_id, parent_constitution_id, half_life_days, evidence, lifecycle)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'promoted')
     RETURNING *`,
    [
      id,
      userId,
      body.title.slice(0, 500),
      body.decisionText.slice(0, 4000),
      body.reason?.slice(0, 4000) ?? null,
      body.whatChanged?.slice(0, 4000) ?? null,
      body.actionHook?.slice(0, 2000) ?? null,
      body.ownerName?.slice(0, 255) ?? null,
      null,
      body.department?.slice(0, 128) ?? null,
      body.decisionDate?.slice(0, 10) ?? null,
      importance,
      confidence,
      status,
      body.supersedesId ?? null,
      body.parentConstitutionId ?? null,
      body.halfLifeDays ?? null,
      body.evidence?.slice(0, 4000) ?? null,
    ],
  );
  const author = await pool.query(`SELECT name FROM hipaa_training_users WHERE id = $1`, [userId]);
  const row = { ...r.rows[0], author_name: author.rows[0]?.name };
  if (body.supersedesId) {
    await addLink(pool, { fromId: id, toId: body.supersedesId, relType: "supersedes" });
  }
  if (body.parentConstitutionId) {
    await addLink(pool, { fromId: id, toId: body.parentConstitutionId, relType: "grounded_in" });
  }
  for (const rel of body.relatedIds ?? []) {
    await addLink(pool, { fromId: id, toId: rel, relType: "relates_to" });
  }
  return rowToDecision(row);
}

export async function addLink(
  pool: pg.Pool,
  opts: { fromId: string; toId: string; relType: KnowledgeLinkRel },
): Promise<KnowledgeLink> {
  const id = `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  await pool.query(
    `INSERT INTO siya_knowledge_links (id, from_id, to_id, rel_type)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (from_id, to_id, rel_type) DO NOTHING`,
    [id, opts.fromId, opts.toId, opts.relType],
  );
  return {
    id,
    fromId: opts.fromId,
    toId: opts.toId,
    relType: opts.relType,
    createdAt: new Date().toISOString(),
  };
}

export async function linksForEntity(pool: pg.Pool, entityId: string): Promise<KnowledgeLink[]> {
  const r = await pool.query(
    `SELECT * FROM siya_knowledge_links WHERE from_id = $1 OR to_id = $1 ORDER BY created_at DESC`,
    [entityId],
  );
  return r.rows.map((row) => ({
    id: row.id,
    fromId: row.from_id,
    toId: row.to_id,
    relType: row.rel_type as KnowledgeLinkRel,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export type DecisionLineage = {
  current: DecisionRecord;
  supersededChain: DecisionRecord[];
  links: KnowledgeLink[];
  relatedPrinciples: { id: string; title: string }[];
};

export async function getDecisionLineage(pool: pg.Pool, id: string): Promise<DecisionLineage | null> {
  const current = await getDecision(pool, id);
  if (!current) return null;
  const supersededChain: DecisionRecord[] = [];
  let walkId = current.supersedesId;
  while (walkId) {
    const prev = await getDecision(pool, walkId);
    if (!prev) break;
    supersededChain.push(prev);
    walkId = prev.supersedesId;
  }
  const links = await linksForEntity(pool, id);
  const relatedPrinciples: { id: string; title: string }[] = [];
  if (current.parentConstitutionId) {
    const { getConstitutionById } = await import("./constitution-service.js");
    const p = await getConstitutionById(pool, current.parentConstitutionId);
    if (p) relatedPrinciples.push({ id: p.id, title: p.title });
  }
  for (const link of links) {
    if (link.relType === "grounded_in" && link.toId.startsWith("con-")) {
      const { getConstitutionById } = await import("./constitution-service.js");
      const p = await getConstitutionById(pool, link.toId);
      if (p && !relatedPrinciples.some((x) => x.id === p.id)) {
        relatedPrinciples.push({ id: p.id, title: p.title });
      }
    }
  }
  return { current, supersededChain, links, relatedPrinciples };
}
