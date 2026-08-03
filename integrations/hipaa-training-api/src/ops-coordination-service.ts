import type pg from "pg";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { istDateLabel, opsDayBounds } from "./shift-dashboard.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export type ChatReviewStatus = "open" | "closed";

export type ChatReviewRecord = {
  id: string;
  userId: string;
  reviewDate: string;
  patientIdentifier: string;
  notes: string;
  errorNotes: string;
  status: ChatReviewStatus;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  reviewerName?: string | null;
  reviewerEmail?: string;
  reviewerDepartment?: string | null;
};

export type HandoffFollowup = {
  patientIdentifier: string;
  note: string;
};

export type ShiftHandoffRecord = {
  id: string;
  userId: string;
  shiftEndEventId: string | null;
  handoffDate: string;
  chatsHandledCount: number | null;
  callsMadeCount: number | null;
  callsReceivedCount: number | null;
  pendingFollowups: HandoffFollowup[];
  scheduledItemsToday: string | null;
  generalNotes: string | null;
  createdAt: string;
  userName?: string | null;
  userEmail?: string;
};

const CLINICAL_OPS_SLUG = "clinical_operations";

export async function canUseChatReview(pool: pg.Pool, userId: string, role: string): Promise<boolean> {
  if (role === "admin") return true;
  const { listMyLeadDepartments } = await import("./sop-service.js");
  const slugs = await listMyLeadDepartments(pool, userId);
  return slugs.includes(CLINICAL_OPS_SLUG);
}

let schemaReady: Promise<void> | null = null;

export async function ensureOpsCoordinationTablesReady(pool: pg.Pool): Promise<void> {
  if (!schemaReady) {
    schemaReady = ensureOpsCoordinationTables(pool).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

async function ensureOpsCoordinationTables(pool: pg.Pool): Promise<void> {
  const { ensureShiftAttendanceTables } = await import("./shift-attendance.js");
  await ensureShiftAttendanceTables(pool);
  const sql = readFileSync(join(__dirname, "database", "ops-coordination-schema.sql"), "utf8");
  await pool.query(sql);
}

function parseReviewDate(raw: unknown): string {
  if (typeof raw === "string" && raw === "today") return istDateLabel(new Date());
  if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return istDateLabel(new Date());
}

function rowToChatReview(row: Record<string, unknown>): ChatReviewRecord {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    reviewDate: new Date(row.review_date as string).toISOString().slice(0, 10),
    patientIdentifier: (row.patient_identifier as string) ?? "",
    notes: (row.notes as string) ?? "",
    errorNotes: (row.error_notes as string) ?? "",
    status: row.status === "closed" ? "closed" : "open",
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    closedAt: row.closed_at ? new Date(row.closed_at as string).toISOString() : null,
    reviewerName: (row.reviewer_name as string) ?? null,
    reviewerEmail: row.reviewer_email as string | undefined,
    reviewerDepartment: (row.reviewer_department as string) ?? null,
  };
}

function rowToHandoff(row: Record<string, unknown>): ShiftHandoffRecord {
  const followups = (row.pending_followups as HandoffFollowup[]) ?? [];
  return {
    id: row.id as string,
    userId: row.user_id as string,
    shiftEndEventId: (row.shift_end_event_id as string) ?? null,
    handoffDate: new Date(row.handoff_date as string).toISOString().slice(0, 10),
    chatsHandledCount: row.chats_handled_count != null ? Number(row.chats_handled_count) : null,
    callsMadeCount: row.calls_made_count != null ? Number(row.calls_made_count) : null,
    callsReceivedCount: row.calls_received_count != null ? Number(row.calls_received_count) : null,
    pendingFollowups: Array.isArray(followups)
      ? followups.map((f) => ({
          patientIdentifier: String(f.patientIdentifier ?? "").slice(0, 200),
          note: String(f.note ?? "").slice(0, 1000),
        }))
      : [],
    scheduledItemsToday: (row.scheduled_items_today as string) ?? null,
    generalNotes: (row.general_notes as string) ?? null,
    createdAt: new Date(row.created_at as string).toISOString(),
    userName: (row.user_name as string) ?? null,
    userEmail: row.user_email as string | undefined,
  };
}

export async function getUserDepartment(pool: pg.Pool, userId: string): Promise<string | null> {
  const r = await pool.query(`SELECT profile_json FROM hipaa_training_progress WHERE user_id = $1`, [userId]);
  const profile = r.rows[0]?.profile_json as { department?: string } | undefined;
  const dept = profile?.department?.trim();
  return dept || null;
}

export async function listChatReviewsForUser(
  pool: pg.Pool,
  userId: string,
  dateParam: unknown,
  status?: ChatReviewStatus,
): Promise<ChatReviewRecord[]> {
  await ensureOpsCoordinationTablesReady(pool);
  const reviewDate = parseReviewDate(dateParam);
  const params: unknown[] = [userId, reviewDate];
  let statusSql = "";
  if (status === "open" || status === "closed") {
    statusSql = " AND status = $3";
    params.push(status);
  }
  const r = await pool.query(
    `SELECT * FROM chat_reviews WHERE user_id = $1 AND review_date = $2${statusSql} ORDER BY updated_at DESC`,
    params,
  );
  return r.rows.map((row) => rowToChatReview(row as Record<string, unknown>));
}

export async function createChatReview(
  pool: pg.Pool,
  userId: string,
  opts: {
    reviewDate?: string;
    patientIdentifier: string;
    notes?: string;
    errorNotes?: string;
    status?: ChatReviewStatus;
  },
): Promise<ChatReviewRecord> {
  await ensureOpsCoordinationTablesReady(pool);
  const id = `cr-${randomUUID()}`;
  const reviewDate = opts.reviewDate ?? istDateLabel(new Date());
  const status = opts.status === "closed" ? "closed" : "open";
  await pool.query(
    `INSERT INTO chat_reviews (id, user_id, review_date, patient_identifier, notes, error_notes, status, closed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      id,
      userId,
      reviewDate,
      opts.patientIdentifier.slice(0, 200),
      (opts.notes ?? "").slice(0, 4000),
      (opts.errorNotes ?? "").slice(0, 4000),
      status,
      status === "closed" ? new Date() : null,
    ],
  );
  const rows = await listChatReviewsForUser(pool, userId, reviewDate);
  return rows.find((x) => x.id === id)!;
}

export async function updateChatReview(
  pool: pg.Pool,
  userId: string,
  reviewId: string,
  patch: {
    patientIdentifier?: string;
    notes?: string;
    errorNotes?: string;
    status?: ChatReviewStatus;
  },
): Promise<ChatReviewRecord | null> {
  await ensureOpsCoordinationTablesReady(pool);
  const existing = await pool.query(`SELECT user_id FROM chat_reviews WHERE id = $1`, [reviewId]);
  if (!existing.rows[0] || (existing.rows[0].user_id as string) !== userId) return null;

  const sets = ["updated_at = NOW()"];
  const vals: unknown[] = [];
  let i = 1;
  if (patch.patientIdentifier !== undefined) {
    sets.push(`patient_identifier = $${i++}`);
    vals.push(patch.patientIdentifier.slice(0, 200));
  }
  if (patch.notes !== undefined) {
    sets.push(`notes = $${i++}`);
    vals.push(patch.notes.slice(0, 4000));
  }
  if (patch.errorNotes !== undefined) {
    sets.push(`error_notes = $${i++}`);
    vals.push(patch.errorNotes.slice(0, 4000));
  }
  if (patch.status !== undefined) {
    sets.push(`status = $${i++}`);
    vals.push(patch.status);
    if (patch.status === "closed") {
      sets.push(`closed_at = NOW()`);
    } else {
      sets.push(`closed_at = NULL`);
    }
  }
  vals.push(reviewId);
  await pool.query(`UPDATE chat_reviews SET ${sets.join(", ")} WHERE id = $${i}`, vals);
  const r = await pool.query(`SELECT * FROM chat_reviews WHERE id = $1`, [reviewId]);
  if (!r.rows[0]) return null;
  return rowToChatReview(r.rows[0] as Record<string, unknown>);
}

export async function listChatReviewsAdmin(
  pool: pg.Pool,
  opts: {
    dateParam: unknown;
    status?: ChatReviewStatus;
    viewerUserId: string;
    viewerRole: string;
  },
): Promise<ChatReviewRecord[]> {
  await ensureOpsCoordinationTablesReady(pool);
  const reviewDate = parseReviewDate(opts.dateParam);
  const params: unknown[] = [reviewDate];
  let where = "cr.review_date = $1";
  let idx = 2;

  if (opts.status === "open" || opts.status === "closed") {
    where += ` AND cr.status = $${idx++}`;
    params.push(opts.status);
  }

  if (opts.viewerRole !== "admin") {
    const { listMyLeadDepartments } = await import("./sop-service.js");
    const { slugToDepartment } = await import("./sop-store.js");
    const slugs = await listMyLeadDepartments(pool, opts.viewerUserId);
    const deptLabels = slugs.map((s) => slugToDepartment(s)).filter(Boolean) as string[];
    if (!deptLabels.length) return [];
    where += ` AND COALESCE(p.profile_json->>'department', '') = ANY($${idx++}::text[])`;
    params.push(deptLabels);
  }

  const r = await pool.query(
    `SELECT cr.*, u.name AS reviewer_name, u.email AS reviewer_email,
            COALESCE(p.profile_json->>'department', '') AS reviewer_department
     FROM chat_reviews cr
     JOIN hipaa_training_users u ON u.id = cr.user_id
     LEFT JOIN hipaa_training_progress p ON p.user_id = cr.user_id
     WHERE ${where}
     ORDER BY cr.status ASC, cr.updated_at DESC
     LIMIT 500`,
    params,
  );
  return r.rows.map((row) => rowToChatReview(row as Record<string, unknown>));
}

export async function createShiftHandoff(
  pool: pg.Pool,
  userId: string,
  opts: {
    shiftEndEventId?: string | null;
    handoffDate?: string;
    chatsHandledCount?: number | null;
    callsMadeCount?: number | null;
    callsReceivedCount?: number | null;
    pendingFollowups?: HandoffFollowup[];
    scheduledItemsToday?: string;
    generalNotes?: string;
  },
): Promise<ShiftHandoffRecord> {
  await ensureOpsCoordinationTablesReady(pool);
  const id = `sho-${randomUUID()}`;
  const handoffDate = opts.handoffDate ?? istDateLabel(new Date());
  const followups = (opts.pendingFollowups ?? [])
    .filter((f) => f.patientIdentifier.trim() || f.note.trim())
    .map((f) => ({
      patientIdentifier: f.patientIdentifier.trim().slice(0, 200),
      note: f.note.trim().slice(0, 1000),
    }));
  await pool.query(
    `INSERT INTO shift_handoffs (
       id, user_id, shift_end_event_id, handoff_date, chats_handled_count,
       calls_made_count, calls_received_count,
       pending_followups, scheduled_items_today, general_notes
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      id,
      userId,
      opts.shiftEndEventId ?? null,
      handoffDate,
      opts.chatsHandledCount ?? null,
      opts.callsMadeCount ?? null,
      opts.callsReceivedCount ?? null,
      JSON.stringify(followups),
      opts.scheduledItemsToday?.slice(0, 4000) ?? null,
      opts.generalNotes?.slice(0, 4000) ?? null,
    ],
  );
  const listed = await listShiftHandoffs(pool, handoffDate);
  return listed.find((h) => h.id === id)!;
}

export async function listShiftHandoffs(pool: pg.Pool, dateParam: unknown): Promise<ShiftHandoffRecord[]> {
  await ensureOpsCoordinationTablesReady(pool);
  const handoffDate = parseReviewDate(dateParam);
  const r = await pool.query(
    `SELECT h.*, u.name AS user_name, u.email AS user_email
     FROM shift_handoffs h
     JOIN hipaa_training_users u ON u.id = h.user_id
     WHERE h.handoff_date = $1
     ORDER BY h.created_at DESC
     LIMIT 100`,
    [handoffDate],
  );
  return r.rows.map((row) => rowToHandoff(row as Record<string, unknown>));
}

export { parseReviewDate, opsDayBounds };
