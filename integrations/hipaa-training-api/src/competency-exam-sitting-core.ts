/**
 * Pure monthly-sitting logic — shared by API service and P0 smoke tests.
 * UTC calendar month boundaries (founder §12).
 */

export const ISOLATED_REVIEW_SITTING_ID = "isolated-review";

export const EXAM_SECTION_IDS = [
  "typing",
  "mcq",
  "listening",
  "chat-sim-typed",
  "chat-sim-spoken",
] as const;

export type ExamSectionId = (typeof EXAM_SECTION_IDS)[number];

export function isExamSectionId(s: string): s is ExamSectionId {
  return (EXAM_SECTION_IDS as readonly string[]).includes(s);
}

/** Locked weights — snapshot on each attempt row. */
export const EXAM_WEIGHTS: Record<ExamSectionId, number> = {
  typing: 12,
  mcq: 30,
  listening: 20,
  "chat-sim-typed": 18,
  "chat-sim-spoken": 20,
};

export type SittingCatalogRow = {
  id: string;
  label: string;
  opensAt: string;
  closesAt: string;
};

export type SeenRow = {
  userId: string;
  sittingId: string;
  pool: string;
  itemId: string;
  attemptId: string;
  repeated: boolean;
  recordedAt: string;
};

/** Compatible with apps/hipaa-training seen-set SeenEntry (sitting-scoped). */
export type ScopedSeenEntry = {
  pool: string;
  id: string;
  attemptId: string;
  at: number;
  repeated: boolean;
  sittingId: string;
};

export type SectionAttemptRow = {
  id: string;
  userId: string;
  sittingId: string;
  section: ExamSectionId;
  attemptIndex: number;
  startedAt: string | null;
  submittedAt: string;
  activeSec: number;
  sectionScore: number | null;
  weight: number;
  itemIds: string[];
  repeatedIds: string[];
  safetyRedFlagged: boolean;
  safetyJson: unknown;
  trailJson: unknown;
  contentFingerprint: string | null;
};

export type SectionAggregate = {
  status: "attempted" | "not_attempted";
  averageScore?: number;
  attemptCount?: number;
  totalActiveSec?: number;
  lastAttemptAt?: string;
  safetyAnyRedFlag?: boolean;
};

export type CompositeSummary = {
  sections: Record<string, SectionAggregate>;
  pointsEarned: number;
  pointsPossible: 100;
  incompleteSectionIds: ExamSectionId[];
  incompleteNote: string;
};

const INCOMPLETE_NOTE =
  "These sections were not submitted during this sitting. They are not scored as zero.";

export function utcMonthSittingId(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export function utcMonthSittingWindow(d: Date): SittingCatalogRow {
  const id = utcMonthSittingId(d);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const opensAt = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
  const closesAt = new Date(Date.UTC(y, m + 1, 1, 0, 0, 0, 0));
  const label = opensAt.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) + " sitting";
  return {
    id,
    label,
    opensAt: opensAt.toISOString(),
    closesAt: closesAt.toISOString(),
  };
}

export function isInstantInSittingWindow(catalog: SittingCatalogRow, instant: Date): boolean {
  const t = instant.getTime();
  return t >= Date.parse(catalog.opensAt) && t < Date.parse(catalog.closesAt);
}

export function resolveOpenSittingCatalog(now = new Date()): SittingCatalogRow {
  return utcMonthSittingWindow(now);
}

export function seenRowsToDrawEntries(rows: SeenRow[]): ScopedSeenEntry[] {
  return rows.map((r) => ({
    pool: r.pool,
    id: r.itemId,
    attemptId: r.attemptId,
    at: Date.parse(r.recordedAt),
    repeated: r.repeated,
    sittingId: r.sittingId,
  }));
}

/** Entries for drawUnseen — only this sitting + pool. */
export function filterSeenForDraw(
  entries: ScopedSeenEntry[],
  sittingId: string,
  poolKey: string,
): ScopedSeenEntry[] {
  return entries.filter((e) => e.sittingId === sittingId && e.pool === poolKey);
}

export function appendSeenRows(
  prev: SeenRow[],
  args: {
    userId: string;
    sittingId: string;
    pool: string;
    ids: string[];
    repeatedIds: string[];
    attemptId: string;
    recordedAt?: string;
  },
): SeenRow[] {
  const repeated = new Set(args.repeatedIds);
  const at = args.recordedAt ?? new Date().toISOString();
  const next = [...prev];
  for (const itemId of args.ids) {
    next.push({
      userId: args.userId,
      sittingId: args.sittingId,
      pool: args.pool,
      itemId,
      attemptId: args.attemptId,
      repeated: repeated.has(itemId),
      recordedAt: at,
    });
  }
  return next;
}

export function nextAttemptIndex(attempts: SectionAttemptRow[], section: ExamSectionId): number {
  const n = attempts.filter((a) => a.section === section).length;
  return n + 1;
}

export function recomputeSectionAggregates(
  attempts: SectionAttemptRow[],
): Record<ExamSectionId, SectionAggregate> {
  const out = {} as Record<ExamSectionId, SectionAggregate>;
  for (const sid of EXAM_SECTION_IDS) {
    const rows = attempts.filter((a) => a.section === sid && a.sectionScore != null);
    if (!rows.length) {
      out[sid] = { status: "not_attempted" };
      continue;
    }
    const scores = rows.map((r) => Number(r.sectionScore));
    const sum = scores.reduce((a, b) => a + b, 0);
    const totalActiveSec = rows.reduce((a, r) => a + Number(r.activeSec || 0), 0);
    const lastAttemptAt = rows.map((r) => r.submittedAt).sort().slice(-1)[0];
    out[sid] = {
      status: "attempted",
      averageScore: Math.round((sum / scores.length) * 10) / 10,
      attemptCount: rows.length,
      totalActiveSec,
      lastAttemptAt,
      safetyAnyRedFlag: rows.some((r) => r.safetyRedFlagged),
    };
  }
  return out;
}

export function computeCompositeSummary(
  sectionAggregates: Record<string, SectionAggregate>,
): CompositeSummary {
  const sections: Record<string, SectionAggregate> = { ...sectionAggregates };
  const incompleteSectionIds: ExamSectionId[] = [];
  let pointsEarned = 0;

  for (const sid of EXAM_SECTION_IDS) {
    const agg = sections[sid] ?? { status: "not_attempted" as const };
    sections[sid] = agg;
    if (agg.status !== "attempted" || agg.averageScore == null) {
      incompleteSectionIds.push(sid);
      continue;
    }
    pointsEarned += EXAM_WEIGHTS[sid] * (agg.averageScore / 100);
  }

  return {
    sections,
    pointsEarned: Math.round(pointsEarned * 10) / 10,
    pointsPossible: 100,
    incompleteSectionIds,
    incompleteNote: INCOMPLETE_NOTE,
  };
}

export type SubmitSectionAttemptInput = {
  id: string;
  userId: string;
  sittingId: string;
  section: ExamSectionId;
  startedAt?: string | null;
  submittedAt?: string;
  activeSec: number;
  sectionScore: number | null;
  weight?: number;
  itemIds: string[];
  repeatedIds: string[];
  safetyRedFlagged?: boolean;
  safetyJson?: unknown;
  trailJson?: unknown;
  contentFingerprint?: string | null;
  /** Pools to append to sitting-scoped seen (one or more per section). */
  seenRecords?: Array<{ pool: string; ids: string[]; repeatedIds: string[] }>;
};

export type UserSittingMemory = {
  userId: string;
  sittingId: string;
  status: "open" | "closed";
  sectionAggregates: Record<string, SectionAggregate>;
  compositeSummary?: CompositeSummary | null;
  closedAt?: string | null;
  firstActivityAt?: string | null;
};

export type SittingMemoryState = {
  catalog: SittingCatalogRow[];
  userSittings: Map<string, UserSittingMemory>;
  attempts: SectionAttemptRow[];
  seen: SeenRow[];
};

/** Window has ended and row is still open → finalize on read. */
export function needsLazyFinalize(
  catalog: SittingCatalogRow,
  status: "open" | "closed",
  now = new Date(),
): boolean {
  return status === "open" && now.getTime() >= Date.parse(catalog.closesAt);
}

/** Build the immutable closure snapshot (§6.2). */
export function buildClosureSnapshot(
  attempts: SectionAttemptRow[],
  closedAt = new Date().toISOString(),
): {
  sectionAggregates: Record<ExamSectionId, SectionAggregate>;
  compositeSummary: CompositeSummary;
  closedAt: string;
} {
  const sectionAggregates = recomputeSectionAggregates(attempts);
  return {
    sectionAggregates,
    compositeSummary: computeCompositeSummary(sectionAggregates),
    closedAt,
  };
}

export type SittingTrendDelta = {
  sittingId: string;
  label: string;
  pointsEarned: number | null;
  pointsDelta: number | null;
  sections: Record<
    ExamSectionId,
    { averageScore: number | null; previousAverage: number | null; delta: number | null }
  >;
};

/**
 * Newest-first history → per-row MoM deltas vs the prior (older) closed sitting.
 * Open / provisional rows still appear; delta uses previous closed composite when available.
 */
export function buildSittingTrends(
  historyNewestFirst: Array<{
    sittingId: string;
    label: string;
    status: "open" | "closed";
    composite: CompositeSummary;
  }>,
): SittingTrendDelta[] {
  const chronological = [...historyNewestFirst].reverse();
  const out: SittingTrendDelta[] = [];
  let prevClosed: CompositeSummary | null = null;

  for (const row of chronological) {
    const sections = {} as SittingTrendDelta["sections"];
    for (const sid of EXAM_SECTION_IDS) {
      const cur =
        row.composite.sections[sid]?.status === "attempted"
          ? row.composite.sections[sid]?.averageScore ?? null
          : null;
      const previous =
        prevClosed?.sections[sid]?.status === "attempted"
          ? prevClosed.sections[sid]?.averageScore ?? null
          : null;
      sections[sid] = {
        averageScore: cur,
        previousAverage: previous,
        delta: cur != null && previous != null ? Math.round((cur - previous) * 10) / 10 : null,
      };
    }
    const pointsEarned = row.composite.pointsEarned;
    const pointsDelta =
      prevClosed != null
        ? Math.round((pointsEarned - prevClosed.pointsEarned) * 10) / 10
        : null;
    out.push({
      sittingId: row.sittingId,
      label: row.label,
      pointsEarned,
      pointsDelta,
      sections,
    });
    if (row.status === "closed") prevClosed = row.composite;
  }

  return out.reverse();
}

/** Memory: finalize open sitting whose closesAt has passed. Idempotent. */
export function memoryLazyFinalize(
  state: SittingMemoryState,
  userId: string,
  sittingId: string,
  now = new Date(),
): SittingMemoryState {
  const catalog = state.catalog.find((c) => c.id === sittingId);
  if (!catalog) return state;
  const uk = memoryUserSittingKey(userId, sittingId);
  const existing = state.userSittings.get(uk);
  const status = existing?.status ?? "open";
  if (!needsLazyFinalize(catalog, status, now)) return state;

  const attempts = state.attempts.filter((a) => a.userId === userId && a.sittingId === sittingId);
  const snap = buildClosureSnapshot(attempts, now.toISOString());
  const userSittings = new Map(state.userSittings);
  userSittings.set(uk, {
    userId,
    sittingId,
    status: "closed",
    sectionAggregates: snap.sectionAggregates,
    compositeSummary: snap.compositeSummary,
    closedAt: snap.closedAt,
    firstActivityAt: existing?.firstActivityAt ?? attempts[0]?.submittedAt ?? null,
  });
  return { ...state, userSittings };
}

export function memoryUserSittingKey(userId: string, sittingId: string): string {
  return `${userId}:${sittingId}`;
}

/**
 * In-memory submit — mirrors DB service.
 * Rejects when sitting is closed or past closesAt (do not auto-redirect to a new month).
 */
const ISOLATED_REVIEW_CATALOG: SittingCatalogRow = {
  id: ISOLATED_REVIEW_SITTING_ID,
  label: "Isolated review",
  opensAt: "1970-01-01T00:00:00.000Z",
  closesAt: "9999-12-31T00:00:00.000Z",
};

function resolveMemoryCatalog(
  state: SittingMemoryState,
  sittingId: string,
): SittingCatalogRow | undefined {
  if (sittingId === ISOLATED_REVIEW_SITTING_ID) return ISOLATED_REVIEW_CATALOG;
  return state.catalog.find((c) => c.id === sittingId);
}

export function memorySubmitSectionAttempt(
  state: SittingMemoryState,
  input: SubmitSectionAttemptInput,
  now = new Date(),
): { state: SittingMemoryState; attempt: SectionAttemptRow } {
  const catalog = resolveMemoryCatalog(state, input.sittingId);
  if (!catalog) throw new Error("UNKNOWN_SITTING");

  // Isolated review never month-closes; monthly sittings lazy-finalize then reject.
  let nextState =
    input.sittingId === ISOLATED_REVIEW_SITTING_ID
      ? state
      : memoryLazyFinalize(state, input.userId, input.sittingId, now);
  const uk = memoryUserSittingKey(input.userId, input.sittingId);
  const us = nextState.userSittings.get(uk);
  if (
    input.sittingId !== ISOLATED_REVIEW_SITTING_ID &&
    (us?.status === "closed" || now.getTime() >= Date.parse(catalog.closesAt))
  ) {
    throw new Error("SITTING_CLOSED");
  }

  const submittedAt = input.submittedAt ?? now.toISOString();
  const sittingAttempts = nextState.attempts.filter(
    (a) => a.userId === input.userId && a.sittingId === input.sittingId,
  );
  const attemptIndex = nextAttemptIndex(sittingAttempts, input.section);
  const weight = input.weight ?? EXAM_WEIGHTS[input.section];

  const attempt: SectionAttemptRow = {
    id: input.id,
    userId: input.userId,
    sittingId: input.sittingId,
    section: input.section,
    attemptIndex,
    startedAt: input.startedAt ?? null,
    submittedAt,
    activeSec: Math.max(0, input.activeSec),
    sectionScore: input.sectionScore,
    weight,
    itemIds: input.itemIds,
    repeatedIds: input.repeatedIds,
    safetyRedFlagged: Boolean(input.safetyRedFlagged),
    safetyJson: input.safetyJson ?? {},
    trailJson: input.trailJson ?? {},
    contentFingerprint: input.contentFingerprint ?? null,
  };

  let seen = nextState.seen;
  for (const rec of input.seenRecords ?? []) {
    seen = appendSeenRows(seen, {
      userId: input.userId,
      sittingId: input.sittingId,
      pool: rec.pool,
      ids: rec.ids,
      repeatedIds: rec.repeatedIds,
      attemptId: input.id,
      recordedAt: submittedAt,
    });
  }

  const attempts = [...nextState.attempts, attempt];
  const allForUserSitting = attempts.filter(
    (a) => a.userId === input.userId && a.sittingId === input.sittingId,
  );
  const sectionAggregates = recomputeSectionAggregates(allForUserSitting);
  const userSittings = new Map(nextState.userSittings);
  userSittings.set(uk, {
    userId: input.userId,
    sittingId: input.sittingId,
    status: "open",
    sectionAggregates,
    compositeSummary: null,
    closedAt: null,
    firstActivityAt: us?.firstActivityAt ?? submittedAt,
  });

  return {
    state: { ...nextState, attempts, seen, userSittings },
    attempt,
  };
}

export function memoryLoadSeenEntries(
  state: SittingMemoryState,
  userId: string,
  sittingId: string,
): ScopedSeenEntry[] {
  const rows = state.seen.filter((s) => s.userId === userId && s.sittingId === sittingId);
  return seenRowsToDrawEntries(rows);
}
