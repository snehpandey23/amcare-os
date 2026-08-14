/**
 * Siya Assist v2 — per-user conversation threads + messages.
 */
import type pg from "pg";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));

let ensured = false;

export type AssistThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
};

export type AssistMessage = {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  meta?: Record<string, unknown>;
};

export async function ensureAssistChatTables(pool: pg.Pool): Promise<void> {
  if (ensured) return;
  const sql = readFileSync(join(__dir, "database", "assist-chat-schema.sql"), "utf8");
  await pool.query(sql);
  ensured = true;
}

function rowToThread(row: Record<string, unknown>): AssistThread {
  return {
    id: String(row.id),
    title: String(row.title || "New chat"),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    messageCount: row.message_count != null ? Number(row.message_count) : undefined,
  };
}

function rowToMessage(row: Record<string, unknown>): AssistMessage {
  return {
    id: String(row.id),
    threadId: String(row.thread_id),
    role: row.role === "assistant" ? "assistant" : "user",
    content: String(row.content || ""),
    createdAt: new Date(row.created_at as string).toISOString(),
    meta: (row.meta as Record<string, unknown>) || {},
  };
}

function titleFromFirstMessage(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "New chat";
  return (t.length > 72 ? `${t.slice(0, 69)}…` : t).slice(0, 120);
}

export async function listAssistThreads(
  pool: pg.Pool,
  userId: string,
  opts?: { q?: string; limit?: number },
): Promise<AssistThread[]> {
  await ensureAssistChatTables(pool);
  const limit = Math.min(Math.max(opts?.limit ?? 40, 1), 100);
  const q = opts?.q?.trim().slice(0, 80);
  const params: unknown[] = [userId];
  let where = `t.user_id = $1 AND t.archived_at IS NULL`;
  if (q) {
    params.push(`%${q.replace(/[%_]/g, "")}%`);
    where += ` AND (t.title ILIKE $${params.length} OR EXISTS (
      SELECT 1 FROM siya_assist_messages m
      WHERE m.thread_id = t.id AND m.content ILIKE $${params.length}
    ))`;
  }
  params.push(limit);
  const r = await pool.query(
    `SELECT t.*,
       (SELECT COUNT(*)::int FROM siya_assist_messages m WHERE m.thread_id = t.id) AS message_count
     FROM siya_assist_threads t
     WHERE ${where}
     ORDER BY t.updated_at DESC
     LIMIT $${params.length}`,
    params,
  );
  return r.rows.map(rowToThread);
}

export async function createAssistThread(
  pool: pg.Pool,
  userId: string,
  title?: string,
): Promise<AssistThread> {
  await ensureAssistChatTables(pool);
  const id = `ath-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
  const r = await pool.query(
    `INSERT INTO siya_assist_threads (id, user_id, title)
     VALUES ($1, $2, $3) RETURNING *`,
    [id, userId, (title?.trim() || "New chat").slice(0, 120)],
  );
  return rowToThread(r.rows[0]);
}

export async function getAssistThread(
  pool: pg.Pool,
  userId: string,
  threadId: string,
): Promise<AssistThread | null> {
  await ensureAssistChatTables(pool);
  const r = await pool.query(
    `SELECT * FROM siya_assist_threads
     WHERE id = $1 AND user_id = $2 AND archived_at IS NULL`,
    [threadId, userId],
  );
  if (!r.rows[0]) return null;
  return rowToThread(r.rows[0]);
}

export async function renameAssistThread(
  pool: pg.Pool,
  userId: string,
  threadId: string,
  title: string,
): Promise<AssistThread | null> {
  await ensureAssistChatTables(pool);
  const r = await pool.query(
    `UPDATE siya_assist_threads SET title = $3, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND archived_at IS NULL
     RETURNING *`,
    [threadId, userId, title.trim().slice(0, 120) || "New chat"],
  );
  if (!r.rows[0]) return null;
  return rowToThread(r.rows[0]);
}

export async function archiveAssistThread(
  pool: pg.Pool,
  userId: string,
  threadId: string,
): Promise<boolean> {
  await ensureAssistChatTables(pool);
  const r = await pool.query(
    `UPDATE siya_assist_threads SET archived_at = NOW(), updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND archived_at IS NULL`,
    [threadId, userId],
  );
  return (r.rowCount ?? 0) > 0;
}

export async function listAssistMessages(
  pool: pg.Pool,
  userId: string,
  threadId: string,
  opts?: { limit?: number },
): Promise<AssistMessage[]> {
  await ensureAssistChatTables(pool);
  const owned = await getAssistThread(pool, userId, threadId);
  if (!owned) return [];
  const limit = Math.min(Math.max(opts?.limit ?? 80, 1), 200);
  const r = await pool.query(
    `SELECT * FROM siya_assist_messages
     WHERE thread_id = $1 AND user_id = $2
     ORDER BY created_at ASC
     LIMIT $3`,
    [threadId, userId, limit],
  );
  return r.rows.map(rowToMessage);
}

/** History for the LLM — last N user/assistant turns, oldest first. */
export async function listAssistHistoryForLlm(
  pool: pg.Pool,
  userId: string,
  threadId: string,
  limit = 24,
): Promise<{ role: "user" | "assistant"; content: string }[]> {
  const msgs = await listAssistMessages(pool, userId, threadId, { limit: Math.max(limit, 40) });
  return msgs
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    .filter((m) => m.content.trim())
    .slice(-limit);
}

export async function appendAssistMessage(
  pool: pg.Pool,
  userId: string,
  threadId: string,
  role: "user" | "assistant",
  content: string,
  meta?: Record<string, unknown>,
): Promise<AssistMessage | null> {
  await ensureAssistChatTables(pool);
  const owned = await getAssistThread(pool, userId, threadId);
  if (!owned) return null;
  const body = content.trim().slice(0, 12000);
  if (!body) return null;
  const id = `amsg-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
  const r = await pool.query(
    `INSERT INTO siya_assist_messages (id, thread_id, user_id, role, content, meta)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb) RETURNING *`,
    [id, threadId, userId, role, body, JSON.stringify(meta ?? {})],
  );
  // Auto-title from first user message
  if (role === "user" && (owned.title === "New chat" || !owned.title.trim())) {
    await pool.query(
      `UPDATE siya_assist_threads SET title = $2, updated_at = NOW() WHERE id = $1`,
      [threadId, titleFromFirstMessage(body)],
    );
  } else {
    await pool.query(`UPDATE siya_assist_threads SET updated_at = NOW() WHERE id = $1`, [threadId]);
  }
  return rowToMessage(r.rows[0]);
}

export async function appendAssistTurn(
  pool: pg.Pool,
  userId: string,
  threadId: string,
  userContent: string,
  assistantContent: string,
  assistantMeta?: Record<string, unknown>,
): Promise<{ user: AssistMessage; assistant: AssistMessage } | null> {
  const user = await appendAssistMessage(pool, userId, threadId, "user", userContent);
  if (!user) return null;
  const assistant = await appendAssistMessage(
    pool,
    userId,
    threadId,
    "assistant",
    assistantContent,
    assistantMeta,
  );
  if (!assistant) return null;
  return { user, assistant };
}
