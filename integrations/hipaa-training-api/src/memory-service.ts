import type pg from "pg";
import {
  defaultExpiresAt,
  parseImportance,
  parseSource,
  rowToEntry,
  type MemoryEntry,
  type MemoryImportance,
  type MemorySource,
  type MemoryVisibility,
} from "./memory-store.js";

export async function ensureMemoryTable(pool: pg.Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS siya_memory_entries (
      id TEXT PRIMARY KEY,
      author_user_id UUID NOT NULL REFERENCES hipaa_training_users(id) ON DELETE CASCADE,
      source VARCHAR(64) NOT NULL,
      importance SMALLINT NOT NULL DEFAULT 1 CHECK (importance IN (1, 2, 3)),
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      department VARCHAR(128),
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      visibility VARCHAR(16) NOT NULL DEFAULT 'org' CHECK (visibility IN ('private', 'org')),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      expires_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_siya_memory_created ON siya_memory_entries(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_siya_memory_importance ON siya_memory_entries(importance DESC, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_siya_memory_department ON siya_memory_entries(department);
  `);
}

async function authorContext(pool: pg.Pool, userId: string): Promise<{ name: string | null; department: string | null }> {
  const r = await pool.query(
    `SELECT u.name, p.profile_json
     FROM hipaa_training_users u
     LEFT JOIN hipaa_training_progress p ON p.user_id = u.id
     WHERE u.id = $1`,
    [userId],
  );
  const row = r.rows[0];
  if (!row) return { name: null, department: null };
  const profile = row.profile_json as { department?: string } | null;
  return {
    name: row.name ?? null,
    department: profile?.department ?? null,
  };
}

export async function insertMemory(
  pool: pg.Pool,
  opts: {
    userId: string;
    source: MemorySource;
    importance: MemoryImportance;
    title: string;
    body: string;
    department?: string | null;
    tags?: string[];
    visibility?: MemoryVisibility;
    metadata?: Record<string, unknown>;
  },
): Promise<MemoryEntry> {
  const ctx = await authorContext(pool, opts.userId);
  const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const importance = opts.importance;
  const expires = defaultExpiresAt(importance);
  const department = opts.department ?? ctx.department ?? "General";
  const r = await pool.query(
    `INSERT INTO siya_memory_entries
      (id, author_user_id, source, importance, title, body, department, tags, visibility, metadata, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10::jsonb, $11)
     RETURNING *, (SELECT name FROM hipaa_training_users WHERE id = $2) AS author_name`,
    [
      id,
      opts.userId,
      opts.source,
      importance,
      opts.title.slice(0, 500),
      opts.body.slice(0, 12000),
      department,
      JSON.stringify(opts.tags ?? []),
      opts.visibility ?? "org",
      JSON.stringify(opts.metadata ?? {}),
      expires,
    ],
  );
  return rowToEntry(r.rows[0]);
}

export async function ingestShiftAccomplishment(
  pool: pg.Pool,
  userId: string,
  accomplishments: string,
  importance: MemoryImportance = 1,
): Promise<MemoryEntry | null> {
  const text = accomplishments.trim();
  if (!text) return null;
  const ctx = await authorContext(pool, userId);
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "UTC" });
  return insertMemory(pool, {
    userId,
    source: "shift_accomplishment",
    importance,
    title: `Shift work — ${ctx.name ?? "Team member"} — ${day}`,
    body: text,
    department: ctx.department,
    visibility: importance >= 2 ? "org" : "org",
    metadata: { capture: "end_shift" },
  });
}

export async function searchMemory(
  pool: pg.Pool,
  userId: string,
  q: string,
  limit = 25,
): Promise<MemoryEntry[]> {
  const term = `%${q.trim().slice(0, 200)}%`;
  if (!q.trim()) {
    return listRecentMemory(pool, userId, limit);
  }
  const r = await pool.query(
    `SELECT m.*, u.name AS author_name
     FROM siya_memory_entries m
     JOIN hipaa_training_users u ON u.id = m.author_user_id
     WHERE (m.visibility = 'org' OR m.author_user_id = $1)
       AND (m.expires_at IS NULL OR m.expires_at > NOW())
       AND (m.title ILIKE $2 OR m.body ILIKE $2 OR m.department ILIKE $2)
     ORDER BY m.importance DESC, m.created_at DESC
     LIMIT $3`,
    [userId, term, limit],
  );
  return r.rows.map(rowToEntry);
}

export async function listRecentMemory(pool: pg.Pool, userId: string, limit = 20): Promise<MemoryEntry[]> {
  const r = await pool.query(
    `SELECT m.*, u.name AS author_name
     FROM siya_memory_entries m
     JOIN hipaa_training_users u ON u.id = m.author_user_id
     WHERE (m.visibility = 'org' OR m.author_user_id = $1)
       AND (m.expires_at IS NULL OR m.expires_at > NOW())
     ORDER BY m.created_at DESC
     LIMIT $2`,
    [userId, limit],
  );
  return r.rows.map(rowToEntry);
}

export type WeekInReviewGroup = {
  department: string;
  items: { title: string; body: string; importance: MemoryImportance; createdAt: string; authorName: string | null }[];
};

export async function buildWeekInReview(pool: pg.Pool, userId: string): Promise<{
  since: string;
  groups: WeekInReviewGroup[];
  total: number;
}> {
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const r = await pool.query(
    `SELECT m.*, u.name AS author_name
     FROM siya_memory_entries m
     JOIN hipaa_training_users u ON u.id = m.author_user_id
     WHERE (m.visibility = 'org' OR m.author_user_id = $1)
       AND m.created_at >= $2
       AND (m.expires_at IS NULL OR m.expires_at > NOW())
       AND m.source != 'weekly_digest'
     ORDER BY m.department NULLS LAST, m.created_at DESC`,
    [userId, since],
  );
  const byDept = new Map<string, WeekInReviewGroup["items"]>();
  for (const row of r.rows) {
    const dept = row.department ?? "Company";
    const list = byDept.get(dept) ?? [];
    list.push({
      title: row.title,
      body: row.body.length > 240 ? `${row.body.slice(0, 240)}…` : row.body,
      importance: row.importance as MemoryImportance,
      createdAt: row.created_at.toISOString(),
      authorName: row.author_name ?? null,
    });
    byDept.set(dept, list);
  }
  const groups: WeekInReviewGroup[] = [...byDept.entries()].map(([department, items]) => ({
    department,
    items,
  }));
  return { since, groups, total: r.rows.length };
}

export { parseImportance, parseSource };
