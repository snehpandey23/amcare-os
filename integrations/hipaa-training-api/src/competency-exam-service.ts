import type pg from "pg";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

let schemaReady: Promise<void> | null = null;

export async function ensureCompetencyExamTablesReady(pool: pg.Pool): Promise<void> {
  if (!schemaReady) {
    schemaReady = ensureCompetencyExamTables(pool).catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  await schemaReady;
}

async function ensureCompetencyExamTables(pool: pg.Pool): Promise<void> {
  const sql = readFileSync(join(__dirname, "database", "competency-exam-schema.sql"), "utf8");
  await pool.query(sql);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export type CompetencyAttemptType = "full" | "isolated";

export type UpsertCompetencyAttemptInput = {
  id: string;
  userId: string;
  attemptType: CompetencyAttemptType;
  section?: string | null;
  subjectLabel?: string;
  startedAt?: string | number | null;
  submittedAt?: string | number | null;
  pointsEarned?: number | null;
  pointsPossible?: number | null;
  sectionScore?: number | null;
  safetyRedFlagged?: boolean;
  safetyJson?: unknown;
  sectionsJson?: unknown;
  reportJson?: unknown;
  hipaaItemsJson?: unknown;
  writingJson?: unknown;
  chatJson?: unknown;
  itemIds?: unknown;
  repeatedIds?: unknown;
  contentFingerprint?: string | null;
};

function toIso(v: string | number | null | undefined): string | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") return new Date(v).toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function upsertCompetencyAttempt(
  pool: pg.Pool,
  input: UpsertCompetencyAttemptInput,
): Promise<{ id: string }> {
  await ensureCompetencyExamTablesReady(pool);
  if (!isUuid(input.userId)) {
    throw new Error("INVALID_USER_ID");
  }
  const attemptType = input.attemptType === "isolated" ? "isolated" : "full";
  const id = String(input.id || "").trim().slice(0, 120);
  if (!id) throw new Error("MISSING_ATTEMPT_ID");

  await pool.query(
    `INSERT INTO siya_competency_exam_attempts (
      id, user_id, attempt_type, section, subject_label,
      started_at, submitted_at, points_earned, points_possible, section_score,
      safety_red_flagged, safety_json, sections_json, report_json,
      hipaa_items_json, writing_json, chat_json, item_ids, repeated_ids, content_fingerprint
    ) VALUES (
      $1, $2::uuid, $3, $4, $5,
      $6::timestamptz, COALESCE($7::timestamptz, NOW()), $8, $9, $10,
      $11, $12::jsonb, $13::jsonb, $14::jsonb,
      $15::jsonb, $16::jsonb, $17::jsonb, $18::jsonb, $19::jsonb, $20
    )
    ON CONFLICT (id) DO UPDATE SET
      subject_label = EXCLUDED.subject_label,
      started_at = COALESCE(EXCLUDED.started_at, siya_competency_exam_attempts.started_at),
      submitted_at = EXCLUDED.submitted_at,
      points_earned = EXCLUDED.points_earned,
      points_possible = EXCLUDED.points_possible,
      section_score = EXCLUDED.section_score,
      safety_red_flagged = EXCLUDED.safety_red_flagged,
      safety_json = EXCLUDED.safety_json,
      sections_json = EXCLUDED.sections_json,
      report_json = EXCLUDED.report_json,
      hipaa_items_json = EXCLUDED.hipaa_items_json,
      writing_json = EXCLUDED.writing_json,
      chat_json = EXCLUDED.chat_json,
      item_ids = EXCLUDED.item_ids,
      repeated_ids = EXCLUDED.repeated_ids,
      content_fingerprint = EXCLUDED.content_fingerprint`,
    [
      id,
      input.userId,
      attemptType,
      input.section ? String(input.section).slice(0, 24) : null,
      String(input.subjectLabel || "").slice(0, 500),
      toIso(input.startedAt ?? null),
      toIso(input.submittedAt ?? null),
      input.pointsEarned ?? null,
      input.pointsPossible ?? null,
      input.sectionScore ?? null,
      Boolean(input.safetyRedFlagged),
      JSON.stringify(input.safetyJson ?? {}),
      JSON.stringify(input.sectionsJson ?? []),
      JSON.stringify(input.reportJson ?? {}),
      input.hipaaItemsJson == null ? null : JSON.stringify(input.hipaaItemsJson),
      input.writingJson == null ? null : JSON.stringify(input.writingJson),
      input.chatJson == null ? null : JSON.stringify(input.chatJson),
      JSON.stringify(input.itemIds ?? []),
      JSON.stringify(input.repeatedIds ?? []),
      input.contentFingerprint ? String(input.contentFingerprint).slice(0, 4000) : null,
    ],
  );
  return { id };
}

export type CompetencyAttemptListRow = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  attemptType: CompetencyAttemptType;
  section: string | null;
  subjectLabel: string;
  startedAt: string | null;
  submittedAt: string;
  pointsEarned: number | null;
  pointsPossible: number | null;
  sectionScore: number | null;
  safetyRedFlagged: boolean;
  sectionSummaries: { id: string; label?: string; score: number | null; weight?: number; status?: string }[];
  hipaaItemCount: number;
  hasWritingTrail: boolean;
  hasChatTrail: boolean;
};

function mapListRow(row: Record<string, unknown>): CompetencyAttemptListRow {
  const sections = Array.isArray(row.sections_json) ? row.sections_json : [];
  const hipaa = row.hipaa_items_json;
  const hipaaCount = Array.isArray(hipaa) ? hipaa.length : 0;
  return {
    id: String(row.id),
    userId: String(row.user_id),
    userEmail: row.user_email != null ? String(row.user_email) : null,
    userName: row.user_name != null ? String(row.user_name) : null,
    attemptType: row.attempt_type === "isolated" ? "isolated" : "full",
    section: row.section != null ? String(row.section) : null,
    subjectLabel: String(row.subject_label || ""),
    startedAt: row.started_at ? new Date(String(row.started_at)).toISOString() : null,
    submittedAt: new Date(String(row.submitted_at)).toISOString(),
    pointsEarned: row.points_earned != null ? Number(row.points_earned) : null,
    pointsPossible: row.points_possible != null ? Number(row.points_possible) : null,
    sectionScore: row.section_score != null ? Number(row.section_score) : null,
    safetyRedFlagged: Boolean(row.safety_red_flagged),
    sectionSummaries: (sections as Record<string, unknown>[]).map((s) => ({
      id: String(s.id ?? ""),
      label: s.label != null ? String(s.label) : undefined,
      score: s.score != null ? Number(s.score) : null,
      weight: s.weight != null ? Number(s.weight) : undefined,
      status: s.status != null ? String(s.status) : undefined,
    })),
    hipaaItemCount: hipaaCount,
    hasWritingTrail: row.writing_json != null,
    hasChatTrail: row.chat_json != null,
  };
}

export async function listCompetencyAttemptsForAdmin(
  pool: pg.Pool,
  opts?: { limit?: number; userId?: string },
): Promise<CompetencyAttemptListRow[]> {
  await ensureCompetencyExamTablesReady(pool);
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 300);
  const params: unknown[] = [];
  let where = "";
  if (opts?.userId && isUuid(opts.userId)) {
    params.push(opts.userId);
    where = `WHERE a.user_id = $${params.length}::uuid`;
  }
  params.push(limit);
  const { rows } = await pool.query(
    `SELECT a.id, a.user_id, a.attempt_type, a.section, a.subject_label,
            a.started_at, a.submitted_at, a.points_earned, a.points_possible, a.section_score,
            a.safety_red_flagged, a.sections_json, a.hipaa_items_json, a.writing_json, a.chat_json,
            u.email AS user_email, u.name AS user_name
     FROM siya_competency_exam_attempts a
     JOIN hipaa_training_users u ON u.id = a.user_id
     ${where}
     ORDER BY a.submitted_at DESC
     LIMIT $${params.length}`,
    params,
  );
  return rows.map((r) => mapListRow(r as Record<string, unknown>));
}

export async function listCompetencyAttemptsForUser(
  pool: pg.Pool,
  userId: string,
  limit = 40,
): Promise<CompetencyAttemptListRow[]> {
  if (!isUuid(userId)) return [];
  return listCompetencyAttemptsForAdmin(pool, { userId, limit });
}

export type CompetencyAttemptDetail = CompetencyAttemptListRow & {
  safetyJson: unknown;
  sectionsJson: unknown;
  reportJson: unknown;
  hipaaItemsJson: unknown;
  writingJson: unknown;
  chatJson: unknown;
  itemIds: unknown;
  repeatedIds: unknown;
  contentFingerprint: string | null;
};

export async function getCompetencyAttempt(
  pool: pg.Pool,
  attemptId: string,
): Promise<CompetencyAttemptDetail | null> {
  await ensureCompetencyExamTablesReady(pool);
  const { rows } = await pool.query(
    `SELECT a.*, u.email AS user_email, u.name AS user_name
     FROM siya_competency_exam_attempts a
     JOIN hipaa_training_users u ON u.id = a.user_id
     WHERE a.id = $1
     LIMIT 1`,
    [attemptId],
  );
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  const base = mapListRow(row);
  return {
    ...base,
    safetyJson: row.safety_json ?? {},
    sectionsJson: row.sections_json ?? [],
    reportJson: row.report_json ?? {},
    hipaaItemsJson: row.hipaa_items_json ?? null,
    writingJson: row.writing_json ?? null,
    chatJson: row.chat_json ?? null,
    itemIds: row.item_ids ?? [],
    repeatedIds: row.repeated_ids ?? [],
    contentFingerprint: row.content_fingerprint != null ? String(row.content_fingerprint) : null,
  };
}
