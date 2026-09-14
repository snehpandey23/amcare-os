import type pg from "pg";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  buildClosureSnapshot,
  buildSittingTrends,
  computeCompositeSummary,
  EXAM_WEIGHTS,
  filterSeenForDraw,
  isExamSectionId,
  ISOLATED_REVIEW_SITTING_ID,
  needsLazyFinalize,
  recomputeSectionAggregates,
  resolveOpenSittingCatalog,
  seenRowsToDrawEntries,
  type CompositeSummary,
  type ExamSectionId,
  type ScopedSeenEntry,
  type SectionAggregate,
  type SectionAttemptRow,
  type SittingCatalogRow,
  type SittingTrendDelta,
  type SubmitSectionAttemptInput,
  utcMonthSittingWindow,
} from "./competency-exam-sitting-core.js";
import { isUuid } from "./competency-exam-service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

let sittingSchemaReady: Promise<void> | null = null;

export async function ensureCompetencySittingTablesReady(pool: pg.Pool): Promise<void> {
  if (!sittingSchemaReady) {
    sittingSchemaReady = applySittingSchema(pool).catch((err) => {
      sittingSchemaReady = null;
      throw err;
    });
  }
  await sittingSchemaReady;
}

async function applySittingSchema(pool: pg.Pool): Promise<void> {
  const base = readFileSync(join(__dirname, "database", "competency-exam-schema.sql"), "utf8");
  const sitting = readFileSync(join(__dirname, "database", "competency-exam-sitting-schema.sql"), "utf8");
  await pool.query(base);
  await pool.query(sitting);
}

export async function upsertSittingCatalog(pool: pg.Pool, catalog: SittingCatalogRow): Promise<void> {
  await ensureCompetencySittingTablesReady(pool);
  await pool.query(
    `INSERT INTO siya_competency_sittings (id, label, opens_at, closes_at)
     VALUES ($1, $2, $3::timestamptz, $4::timestamptz)
     ON CONFLICT (id) DO UPDATE SET
       label = EXCLUDED.label,
       opens_at = EXCLUDED.opens_at,
       closes_at = EXCLUDED.closes_at`,
    [catalog.id, catalog.label, catalog.opensAt, catalog.closesAt],
  );
}

export async function ensureSittingCatalogForDate(pool: pg.Pool, when = new Date()): Promise<SittingCatalogRow> {
  const catalog = utcMonthSittingWindow(when);
  await upsertSittingCatalog(pool, catalog);
  return catalog;
}

export async function ensureIsolatedReviewCatalog(pool: pg.Pool): Promise<SittingCatalogRow> {
  const catalog: SittingCatalogRow = {
    id: ISOLATED_REVIEW_SITTING_ID,
    label: "Isolated review",
    opensAt: "1970-01-01T00:00:00.000Z",
    closesAt: "9999-12-31T00:00:00.000Z",
  };
  await upsertSittingCatalog(pool, catalog);
  return catalog;
}

export async function getSittingCatalog(
  pool: pg.Pool,
  sittingId: string,
): Promise<SittingCatalogRow | null> {
  await ensureCompetencySittingTablesReady(pool);
  if (sittingId === ISOLATED_REVIEW_SITTING_ID) {
    return ensureIsolatedReviewCatalog(pool);
  }
  const { rows } = await pool.query(
    `SELECT id, label, opens_at, closes_at FROM siya_competency_sittings WHERE id = $1 LIMIT 1`,
    [sittingId],
  );
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: String(row.id),
    label: String(row.label),
    opensAt: new Date(String(row.opens_at)).toISOString(),
    closesAt: new Date(String(row.closes_at)).toISOString(),
  };
}

export async function loadSeenForSitting(
  pool: pg.Pool,
  userId: string,
  sittingId: string,
): Promise<ScopedSeenEntry[]> {
  if (!isUuid(userId)) return [];
  await ensureCompetencySittingTablesReady(pool);
  const { rows } = await pool.query(
    `SELECT user_id, sitting_id, pool, item_id, attempt_id, repeated, recorded_at
     FROM siya_competency_seen
     WHERE user_id = $1::uuid AND sitting_id = $2`,
    [userId, sittingId],
  );
  return seenRowsToDrawEntries(
    rows.map((r) => ({
      userId: String(r.user_id),
      sittingId: String(r.sitting_id),
      pool: String(r.pool),
      itemId: String(r.item_id),
      attemptId: String(r.attempt_id),
      repeated: Boolean(r.repeated),
      recordedAt: new Date(String(r.recorded_at)).toISOString(),
    })),
  );
}

export async function loadSeenForSittingDraw(
  pool: pg.Pool,
  userId: string,
  sittingId: string,
  poolKey: string,
): Promise<ScopedSeenEntry[]> {
  const all = await loadSeenForSitting(pool, userId, sittingId);
  return filterSeenForDraw(all, sittingId, poolKey);
}

async function insertSeenBatch(
  client: pg.PoolClient,
  args: {
    userId: string;
    sittingId: string;
    pool: string;
    ids: string[];
    repeatedIds: string[];
    attemptId: string;
  },
): Promise<void> {
  const repeated = new Set(args.repeatedIds);
  for (const itemId of args.ids) {
    await client.query(
      `INSERT INTO siya_competency_seen (user_id, sitting_id, pool, item_id, attempt_id, repeated)
       VALUES ($1::uuid, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, sitting_id, pool, item_id, attempt_id) DO NOTHING`,
      [args.userId, args.sittingId, args.pool, itemId, args.attemptId, repeated.has(itemId)],
    );
  }
}

function mapAttemptRow(row: Record<string, unknown>): SectionAttemptRow {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    sittingId: String(row.sitting_id),
    section: String(row.section) as ExamSectionId,
    attemptIndex: Number(row.attempt_index),
    startedAt: row.started_at ? new Date(String(row.started_at)).toISOString() : null,
    submittedAt: new Date(String(row.submitted_at)).toISOString(),
    activeSec: Number(row.active_sec ?? 0),
    sectionScore: row.section_score != null ? Number(row.section_score) : null,
    weight: Number(row.weight),
    itemIds: Array.isArray(row.item_ids) ? (row.item_ids as string[]) : [],
    repeatedIds: Array.isArray(row.repeated_ids) ? (row.repeated_ids as string[]) : [],
    safetyRedFlagged: Boolean(row.safety_red_flagged),
    safetyJson: row.safety_json ?? {},
    trailJson: row.trail_json ?? {},
    contentFingerprint: row.content_fingerprint != null ? String(row.content_fingerprint) : null,
  };
}

async function recomputeAndSaveUserSitting(
  client: pg.PoolClient,
  userId: string,
  sittingId: string,
): Promise<Record<string, SectionAggregate>> {
  const { rows: statusRows } = await client.query(
    `SELECT status FROM siya_competency_user_sittings
     WHERE user_id = $1::uuid AND sitting_id = $2 LIMIT 1`,
    [userId, sittingId],
  );
  if (statusRows[0]?.status === "closed") {
    throw new Error("SITTING_CLOSED");
  }

  const { rows } = await client.query(
    `SELECT id, user_id, sitting_id, section, attempt_index, started_at, submitted_at,
            active_sec, section_score, weight, item_ids, repeated_ids,
            safety_red_flagged, safety_json, trail_json, content_fingerprint
     FROM siya_competency_section_attempts
     WHERE user_id = $1::uuid AND sitting_id = $2
     ORDER BY submitted_at ASC`,
    [userId, sittingId],
  );
  const attempts = rows.map((r) => mapAttemptRow(r as Record<string, unknown>));
  const sectionAggregates = recomputeSectionAggregates(attempts);
  const safetyAny = attempts.some((a) => a.safetyRedFlagged);

  await client.query(
    `INSERT INTO siya_competency_user_sittings (user_id, sitting_id, status, first_activity_at, section_aggregates, safety_summary)
     VALUES ($1::uuid, $2, 'open', NOW(), $3::jsonb, $4::jsonb)
     ON CONFLICT (user_id, sitting_id) DO UPDATE SET
       section_aggregates = EXCLUDED.section_aggregates,
       safety_summary = EXCLUDED.safety_summary,
       first_activity_at = COALESCE(siya_competency_user_sittings.first_activity_at, EXCLUDED.first_activity_at)`,
    [userId, sittingId, JSON.stringify(sectionAggregates), JSON.stringify({ safetyAnyRedFlag: safetyAny })],
  );
  return sectionAggregates;
}

/**
 * Lazy-finalize (§6.2): on first read after closesAt, lock composite_summary permanently.
 * Idempotent — already-closed rows are returned as-is.
 */
export async function lazyFinalizeUserSittingIfNeeded(
  pool: pg.Pool,
  userId: string,
  sittingId: string,
  now = new Date(),
): Promise<{
  status: "open" | "closed";
  sectionAggregates: Record<string, SectionAggregate>;
  compositeSummary: CompositeSummary | null;
  firstActivityAt: string | null;
  closedAt: string | null;
  finalizedNow: boolean;
} | null> {
  if (!isUuid(userId)) return null;
  await ensureCompetencySittingTablesReady(pool);
  const catalog = await getSittingCatalog(pool, sittingId);
  if (!catalog) return null;

  const { rows } = await pool.query(
    `SELECT status, section_aggregates, composite_summary, first_activity_at, closed_at
     FROM siya_competency_user_sittings
     WHERE user_id = $1::uuid AND sitting_id = $2 LIMIT 1`,
    [userId, sittingId],
  );
  const row = rows[0] as Record<string, unknown> | undefined;
  const status: "open" | "closed" = row?.status === "closed" ? "closed" : "open";

  if (status === "closed") {
    const rawAgg = row?.section_aggregates;
    const sectionAggregates =
      rawAgg && typeof rawAgg === "object" ? (rawAgg as Record<string, SectionAggregate>) : {};
    const locked = row?.composite_summary;
    const compositeSummary =
      locked && typeof locked === "object"
        ? (locked as CompositeSummary)
        : computeCompositeSummary(sectionAggregates);
    return {
      status: "closed",
      sectionAggregates,
      compositeSummary,
      firstActivityAt: row?.first_activity_at ? new Date(String(row.first_activity_at)).toISOString() : null,
      closedAt: row?.closed_at ? new Date(String(row.closed_at)).toISOString() : null,
      finalizedNow: false,
    };
  }

  if (!needsLazyFinalize(catalog, status, now)) {
    const rawAgg = row?.section_aggregates;
    const sectionAggregates =
      rawAgg && typeof rawAgg === "object" ? (rawAgg as Record<string, SectionAggregate>) : {};
    return {
      status: "open",
      sectionAggregates,
      compositeSummary: null,
      firstActivityAt: row?.first_activity_at ? new Date(String(row.first_activity_at)).toISOString() : null,
      closedAt: null,
      finalizedNow: false,
    };
  }

  // Past closesAt and still open → lock now.
  const attempts = await listSectionAttemptsForUserSitting(pool, userId, sittingId);
  const snap = buildClosureSnapshot(attempts, now.toISOString());
  const safetyAny = attempts.some((a) => a.safetyRedFlagged);
  const firstActivityAt =
    row?.first_activity_at != null
      ? new Date(String(row.first_activity_at)).toISOString()
      : attempts[0]?.submittedAt ?? null;

  await pool.query(
    `INSERT INTO siya_competency_user_sittings (
       user_id, sitting_id, status, first_activity_at, closed_at,
       section_aggregates, composite_summary, safety_summary
     ) VALUES ($1::uuid, $2, 'closed', $3::timestamptz, $4::timestamptz, $5::jsonb, $6::jsonb, $7::jsonb)
     ON CONFLICT (user_id, sitting_id) DO UPDATE SET
       status = 'closed',
       closed_at = COALESCE(siya_competency_user_sittings.closed_at, EXCLUDED.closed_at),
       section_aggregates = EXCLUDED.section_aggregates,
       composite_summary = COALESCE(siya_competency_user_sittings.composite_summary, EXCLUDED.composite_summary),
       safety_summary = EXCLUDED.safety_summary,
       first_activity_at = COALESCE(siya_competency_user_sittings.first_activity_at, EXCLUDED.first_activity_at)`,
    [
      userId,
      sittingId,
      firstActivityAt,
      snap.closedAt,
      JSON.stringify(snap.sectionAggregates),
      JSON.stringify(snap.compositeSummary),
      JSON.stringify({ safetyAnyRedFlag: safetyAny }),
    ],
  );

  // Re-read locked composite (COALESCE keeps prior lock if race).
  const again = await pool.query(
    `SELECT section_aggregates, composite_summary, first_activity_at, closed_at
     FROM siya_competency_user_sittings
     WHERE user_id = $1::uuid AND sitting_id = $2 LIMIT 1`,
    [userId, sittingId],
  );
  const lockedRow = again.rows[0] as Record<string, unknown>;
  const sectionAggregates =
    lockedRow?.section_aggregates && typeof lockedRow.section_aggregates === "object"
      ? (lockedRow.section_aggregates as Record<string, SectionAggregate>)
      : snap.sectionAggregates;
  const compositeSummary =
    lockedRow?.composite_summary && typeof lockedRow.composite_summary === "object"
      ? (lockedRow.composite_summary as CompositeSummary)
      : snap.compositeSummary;

  return {
    status: "closed",
    sectionAggregates,
    compositeSummary,
    firstActivityAt: lockedRow?.first_activity_at
      ? new Date(String(lockedRow.first_activity_at)).toISOString()
      : firstActivityAt,
    closedAt: lockedRow?.closed_at ? new Date(String(lockedRow.closed_at)).toISOString() : snap.closedAt,
    finalizedNow: true,
  };
}

export async function submitSectionAttempt(
  pool: pg.Pool,
  input: SubmitSectionAttemptInput,
  now = new Date(),
): Promise<{ attempt: SectionAttemptRow; sectionAggregates: Record<string, SectionAggregate> }> {
  await ensureCompetencySittingTablesReady(pool);
  if (!isUuid(input.userId)) throw new Error("INVALID_USER_ID");
  const id = String(input.id || "").trim().slice(0, 120);
  if (!id) throw new Error("MISSING_ATTEMPT_ID");

  const catalog = await getSittingCatalog(pool, input.sittingId);
  if (!catalog) throw new Error("UNKNOWN_SITTING");

  // Isolated review never month-closes. Monthly sittings: finalize then reject if closed.
  if (input.sittingId !== ISOLATED_REVIEW_SITTING_ID) {
    const finalized = await lazyFinalizeUserSittingIfNeeded(pool, input.userId, input.sittingId, now);
    if (finalized?.status === "closed" || now.getTime() >= Date.parse(catalog.closesAt)) {
      throw new Error("SITTING_CLOSED");
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: idxRows } = await client.query(
      `SELECT COALESCE(MAX(attempt_index), 0) + 1 AS next_idx
       FROM siya_competency_section_attempts
       WHERE user_id = $1::uuid AND sitting_id = $2 AND section = $3`,
      [input.userId, input.sittingId, input.section],
    );
    const attemptIndex = Number((idxRows[0] as { next_idx: number }).next_idx);
    const w = input.weight ?? EXAM_WEIGHTS[input.section];

    const submittedAt = input.submittedAt ? new Date(input.submittedAt).toISOString() : now.toISOString();

    await client.query(
      `INSERT INTO siya_competency_section_attempts (
        id, user_id, sitting_id, section, attempt_index, started_at, submitted_at,
        active_sec, section_score, weight, item_ids, repeated_ids,
        safety_red_flagged, safety_json, trail_json, content_fingerprint
      ) VALUES (
        $1, $2::uuid, $3, $4, $5, $6::timestamptz, $7::timestamptz,
        $8, $9, $10, $11::jsonb, $12::jsonb,
        $13, $14::jsonb, $15::jsonb, $16
      )`,
      [
        id,
        input.userId,
        input.sittingId,
        input.section,
        attemptIndex,
        input.startedAt ? new Date(input.startedAt).toISOString() : null,
        submittedAt,
        Math.max(0, input.activeSec),
        input.sectionScore,
        w,
        JSON.stringify(input.itemIds ?? []),
        JSON.stringify(input.repeatedIds ?? []),
        Boolean(input.safetyRedFlagged),
        JSON.stringify(input.safetyJson ?? {}),
        JSON.stringify(input.trailJson ?? {}),
        input.contentFingerprint ? String(input.contentFingerprint).slice(0, 4000) : null,
      ],
    );

    for (const rec of input.seenRecords ?? []) {
      await insertSeenBatch(client, {
        userId: input.userId,
        sittingId: input.sittingId,
        pool: rec.pool,
        ids: rec.ids,
        repeatedIds: rec.repeatedIds,
        attemptId: id,
      });
    }

    const sectionAggregates = await recomputeAndSaveUserSitting(client, input.userId, input.sittingId);
    await client.query("COMMIT");

    const { rows } = await pool.query(
      `SELECT * FROM siya_competency_section_attempts WHERE id = $1 LIMIT 1`,
      [id],
    );
    const attempt = mapAttemptRow(rows[0] as Record<string, unknown>);
    return { attempt, sectionAggregates };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function listSectionAttemptsForUserSitting(
  pool: pg.Pool,
  userId: string,
  sittingId: string,
): Promise<SectionAttemptRow[]> {
  if (!isUuid(userId)) return [];
  await ensureCompetencySittingTablesReady(pool);
  const { rows } = await pool.query(
    `SELECT * FROM siya_competency_section_attempts
     WHERE user_id = $1::uuid AND sitting_id = $2
     ORDER BY submitted_at ASC`,
    [userId, sittingId],
  );
  return rows.map((r) => mapAttemptRow(r as Record<string, unknown>));
}

export async function getUserSittingProgress(
  pool: pg.Pool,
  userId: string,
  sittingId: string,
  now = new Date(),
): Promise<{
  sectionAggregates: Record<string, SectionAggregate>;
  compositePreview: CompositeSummary;
  compositeSummary: CompositeSummary | null;
  status: "open" | "closed";
  firstActivityAt: string | null;
  closedAt: string | null;
  finalizedNow: boolean;
} | null> {
  if (!isUuid(userId)) return null;
  const finalized = await lazyFinalizeUserSittingIfNeeded(pool, userId, sittingId, now);
  if (!finalized) {
    // No user row and sitting not past close — empty open progress.
    const catalog = await getSittingCatalog(pool, sittingId);
    if (!catalog) return null;
    return {
      sectionAggregates: {},
      compositePreview: computeCompositeSummary({}),
      compositeSummary: null,
      status: "open",
      firstActivityAt: null,
      closedAt: null,
      finalizedNow: false,
    };
  }
  const composite =
    finalized.status === "closed" && finalized.compositeSummary
      ? finalized.compositeSummary
      : computeCompositeSummary(finalized.sectionAggregates);
  return {
    sectionAggregates: finalized.sectionAggregates,
    compositePreview: composite,
    compositeSummary: finalized.status === "closed" ? finalized.compositeSummary : null,
    status: finalized.status,
    firstActivityAt: finalized.firstActivityAt,
    closedAt: finalized.closedAt,
    finalizedNow: finalized.finalizedNow,
  };
}

/** Open calendar sitting + this user's progress (creates catalog row if needed). */
export async function getCurrentSittingForUser(
  pool: pg.Pool,
  userId: string,
  when = new Date(),
): Promise<{
  sitting: SittingCatalogRow;
  status: "open" | "closed";
  sectionAggregates: Record<string, SectionAggregate>;
  compositePreview: CompositeSummary;
  compositeSummary: CompositeSummary | null;
  firstActivityAt: string | null;
  closedAt: string | null;
  attempts: SectionAttemptRow[];
}> {
  const sitting = await ensureSittingCatalogForDate(pool, when);
  const progress = await getUserSittingProgress(pool, userId, sitting.id, when);
  const attempts = await listSectionAttemptsForUserSitting(pool, userId, sitting.id);
  return {
    sitting,
    status: progress?.status ?? "open",
    sectionAggregates: progress?.sectionAggregates ?? {},
    compositePreview: progress?.compositePreview ?? computeCompositeSummary({}),
    compositeSummary: progress?.compositeSummary ?? null,
    firstActivityAt: progress?.firstActivityAt ?? null,
    closedAt: progress?.closedAt ?? null,
    attempts,
  };
}

export type UserSittingHistoryRow = {
  sittingId: string;
  label: string;
  opensAt: string;
  closesAt: string;
  status: "open" | "closed";
  firstActivityAt: string | null;
  closedAt: string | null;
  sectionAggregates: Record<string, SectionAggregate>;
  /** Locked summary when closed; live preview when still open. */
  composite: CompositeSummary;
  /** Alias of composite — P1 clients / UI. */
  compositePreview: CompositeSummary;
  compositeSummary: CompositeSummary | null;
  finalizedNow?: boolean;
};

export async function listUserSittingHistory(
  pool: pg.Pool,
  userId: string,
  limit = 24,
  now = new Date(),
): Promise<UserSittingHistoryRow[]> {
  if (!isUuid(userId)) return [];
  await ensureCompetencySittingTablesReady(pool);
  const { rows } = await pool.query(
    `SELECT us.sitting_id, us.status, us.first_activity_at, us.closed_at, us.section_aggregates,
            us.composite_summary, s.label, s.opens_at, s.closes_at
     FROM siya_competency_user_sittings us
     JOIN siya_competency_sittings s ON s.id = us.sitting_id
     WHERE us.user_id = $1::uuid
     ORDER BY s.opens_at DESC
     LIMIT $2`,
    [userId, Math.min(Math.max(1, limit), 60)],
  );

  const out: UserSittingHistoryRow[] = [];
  for (const r of rows) {
    const sittingId = String(r.sitting_id);
    const progress = await getUserSittingProgress(pool, userId, sittingId, now);
    const composite =
      progress?.status === "closed" && progress.compositeSummary
        ? progress.compositeSummary
        : progress?.compositePreview ?? computeCompositeSummary({});
    out.push({
      sittingId,
      label: String(r.label),
      opensAt: new Date(String(r.opens_at)).toISOString(),
      closesAt: new Date(String(r.closes_at)).toISOString(),
      status: progress?.status ?? "open",
      firstActivityAt: progress?.firstActivityAt ?? null,
      closedAt: progress?.closedAt ?? null,
      sectionAggregates: progress?.sectionAggregates ?? {},
      composite,
      compositePreview: composite,
      compositeSummary: progress?.compositeSummary ?? null,
      finalizedNow: progress?.finalizedNow,
    });
  }
  return out;
}

export type AdminSittingHistoryRow = UserSittingHistoryRow & {
  userId: string;
  userEmail: string | null;
  userName: string | null;
};

export async function listAdminSittingHistory(
  pool: pg.Pool,
  opts?: { userId?: string; sittingId?: string; limit?: number; now?: Date },
): Promise<AdminSittingHistoryRow[]> {
  await ensureCompetencySittingTablesReady(pool);
  const limit = Math.min(Math.max(opts?.limit ?? 100, 1), 300);
  const now = opts?.now ?? new Date();
  const params: unknown[] = [];
  const where: string[] = [];
  if (opts?.userId && isUuid(opts.userId)) {
    params.push(opts.userId);
    where.push(`us.user_id = $${params.length}::uuid`);
  }
  if (opts?.sittingId) {
    params.push(opts.sittingId);
    where.push(`us.sitting_id = $${params.length}`);
  }
  params.push(limit);
  const { rows } = await pool.query(
    `SELECT us.user_id, us.sitting_id, us.status, us.first_activity_at, us.closed_at,
            us.section_aggregates, us.composite_summary,
            s.label, s.opens_at, s.closes_at,
            u.email AS user_email, u.name AS user_name
     FROM siya_competency_user_sittings us
     JOIN siya_competency_sittings s ON s.id = us.sitting_id
     JOIN hipaa_training_users u ON u.id = us.user_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY s.opens_at DESC, u.email ASC
     LIMIT $${params.length}`,
    params,
  );

  const out: AdminSittingHistoryRow[] = [];
  for (const r of rows) {
    const userId = String(r.user_id);
    const sittingId = String(r.sitting_id);
    const progress = await getUserSittingProgress(pool, userId, sittingId, now);
    const composite =
      progress?.status === "closed" && progress.compositeSummary
        ? progress.compositeSummary
        : progress?.compositePreview ?? computeCompositeSummary({});
    out.push({
      userId,
      userEmail: r.user_email != null ? String(r.user_email) : null,
      userName: r.user_name != null ? String(r.user_name) : null,
      sittingId,
      label: String(r.label),
      opensAt: new Date(String(r.opens_at)).toISOString(),
      closesAt: new Date(String(r.closes_at)).toISOString(),
      status: progress?.status ?? "open",
      firstActivityAt: progress?.firstActivityAt ?? null,
      closedAt: progress?.closedAt ?? null,
      sectionAggregates: progress?.sectionAggregates ?? {},
      composite,
      compositePreview: composite,
      compositeSummary: progress?.compositeSummary ?? null,
      finalizedNow: progress?.finalizedNow,
    });
  }
  return out;
}

/** Ops roster for one sitting month (§8.2) — lazy-finalizes each user on read. */
export async function listSittingRosterUsers(
  pool: pg.Pool,
  sittingId: string,
  now = new Date(),
): Promise<{ sitting: SittingCatalogRow; users: AdminSittingHistoryRow[] }> {
  const catalog = await getSittingCatalog(pool, sittingId);
  if (!catalog) throw new Error("UNKNOWN_SITTING");
  const users = await listAdminSittingHistory(pool, { sittingId, limit: 300, now });
  return { sitting: catalog, users };
}

export function trendsForHistory(rows: UserSittingHistoryRow[]): SittingTrendDelta[] {
  return buildSittingTrends(
    rows.map((r) => ({
      sittingId: r.sittingId,
      label: r.label,
      status: r.status,
      composite: r.composite,
    })),
  );
}

export {
  resolveOpenSittingCatalog,
  computeCompositeSummary,
  filterSeenForDraw,
  isExamSectionId,
  buildSittingTrends,
  needsLazyFinalize,
  buildClosureSnapshot,
};
