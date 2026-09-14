/**
 * P0 — monthly sitting schema + sitting-scoped seen + section attempts (memory proof).
 *
 *   cd apps/hipaa-training && npx tsx scripts/smoke-competency-exam-sitting-p0.ts
 *
 * Optional DB proof (requires DATABASE_URL + migrated user):
 *   COMPETENCY_SITTING_P0_DB=1 npx tsx scripts/smoke-competency-exam-sitting-p0.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { drawUnseen, recordSeen } from "../src/lib/competency-exam/seen-set";
import {
  filterSeenForSittingDraw,
  ISOLATED_REVIEW_SITTING_ID,
} from "../src/lib/competency-exam/sitting-seen-scope";
import {
  computeCompositeSummary,
  ISOLATED_REVIEW_SITTING_ID as CORE_ISOLATED,
  memoryLoadSeenEntries,
  memorySubmitSectionAttempt,
  resolveOpenSittingCatalog,
  type SittingMemoryState,
  utcMonthSittingWindow,
} from "../../../integrations/hipaa-training-api/src/competency-exam-sitting-core.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "../../..");

assert.equal(ISOLATED_REVIEW_SITTING_ID, CORE_ISOLATED);

// --- Schema file contains required tables (§8.1) ---
const schemaSql = readFileSync(
  join(REPO, "integrations/hipaa-training-api/src/database/competency-exam-sitting-schema.sql"),
  "utf8",
);
for (const table of [
  "siya_competency_sittings",
  "siya_competency_user_sittings",
  "siya_competency_section_attempts",
  "siya_competency_seen",
]) {
  assert.match(schemaSql, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`), `missing ${table}`);
}
assert.match(schemaSql, /sitting_id TEXT REFERENCES siya_competency_sittings/, "legacy alter sitting_id");

// --- UTC month boundaries (§12) ---
const sep = utcMonthSittingWindow(new Date("2026-09-15T12:00:00.000Z"));
assert.equal(sep.id, "2026-09");
assert.equal(sep.opensAt, "2026-09-01T00:00:00.000Z");
assert.equal(sep.closesAt, "2026-10-01T00:00:00.000Z");
const open = resolveOpenSittingCatalog(new Date("2026-09-15T12:00:00.000Z"));
assert.equal(open.id, "2026-09");

const poolItems = [{ id: "a" }, { id: "b" }, { id: "c" }];
const USER = "11111111-1111-4111-8111-111111111111";
const SIT_A = "2026-09";
const SIT_B = "2026-10";

let state: SittingMemoryState = {
  catalog: [sep, utcMonthSittingWindow(new Date("2026-10-05T00:00:00Z"))],
  userSittings: new Map(),
  attempts: [],
  seen: [],
};

function drawForSitting(sittingId: string, poolKey: string, seed: number, count: number) {
  const scoped = filterSeenForSittingDraw(
    memoryLoadSeenEntries(state, USER, sittingId).map((e) => ({
      pool: e.pool,
      id: e.id,
      attemptId: e.attemptId,
      at: e.at,
      repeated: e.repeated,
      sittingId: e.sittingId,
    })),
    sittingId,
    poolKey,
  );
  return drawUnseen(poolItems, scoped, count, seed, poolKey);
}

// Sitting A — first draw unseen
const d1 = drawForSitting(SIT_A, "typing", 11, 2);
assert.equal(d1.repeatedIds.length, 0);
let r1 = memorySubmitSectionAttempt(state, {
  id: "att-a1",
  userId: USER,
  sittingId: SIT_A,
  section: "typing",
  activeSec: 95,
  sectionScore: 70,
  itemIds: d1.items.map((i) => i.id),
  repeatedIds: d1.repeatedIds,
  seenRecords: [{ pool: "typing", ids: d1.items.map((i) => i.id), repeatedIds: d1.repeatedIds }],
  trailJson: { wpm: 38 },
});
state = r1.state;
assert.equal(r1.attempt.attemptIndex, 1);
assert.equal(r1.attempt.activeSec, 95);
assert.equal(r1.attempt.itemIds.length, 2);
assert.ok(r1.attempt.itemIds.every((id) => poolItems.some((p) => p.id === id)));

// Sitting A — second attempt excludes prior items in same pool
const d2 = drawForSitting(SIT_A, "typing", 19, 2);
assert.ok(d2.repeatedIds.length >= 1 || d2.items.every((i) => !d1.attempt.itemIds.includes(i.id)), "reuse only c or repeat");
state = memorySubmitSectionAttempt(state, {
  id: "att-a2",
  userId: USER,
  sittingId: SIT_A,
  section: "typing",
  activeSec: 110,
  sectionScore: 80,
  itemIds: d2.items.map((i) => i.id),
  repeatedIds: d2.repeatedIds,
  seenRecords: [{ pool: "typing", ids: d2.items.map((i) => i.id), repeatedIds: d2.repeatedIds }],
}).state;

const uk = `${USER}:${SIT_A}`;
const aggA = state.userSittings.get(uk)?.sectionAggregates.typing;
assert.equal(aggA?.attemptCount, 2);
assert.equal(aggA?.averageScore, 75);
assert.equal(aggA?.totalActiveSec, 205);

// Sitting B — fresh seen (prior month must not exclude items)
const seenB = filterSeenForSittingDraw(
  memoryLoadSeenEntries(state, USER, SIT_B).map((e) => ({ ...e, sittingId: e.sittingId })),
  SIT_B,
  "typing",
);
assert.equal(seenB.length, 0);
const dB = drawForSitting(SIT_B, "typing", 7, 1);
assert.equal(dB.repeatedIds.length, 0);
const dBWithGlobalA = drawUnseen(poolItems, [], 1, 7, "typing");
assert.equal(dB.items[0]?.id, dBWithGlobalA.items[0]?.id, "empty sitting B draw matches fresh pool draw");

// Isolated review namespace — does not pollute sitting A
state = memorySubmitSectionAttempt(state, {
  id: "att-iso-1",
  userId: USER,
  sittingId: ISOLATED_REVIEW_SITTING_ID,
  section: "mcq",
  activeSec: 600,
  sectionScore: 50,
  itemIds: ["hipaa-q1"],
  repeatedIds: [],
  seenRecords: [{ pool: "hipaa", ids: ["hipaa-q1"], repeatedIds: [] }],
}).state;

const sittingASeenHipaa = filterSeenForSittingDraw(
  memoryLoadSeenEntries(state, USER, SIT_A).map((e) => ({ ...e, sittingId: e.sittingId })),
  SIT_A,
  "hipaa",
);
assert.equal(sittingASeenHipaa.length, 0, "isolated hipaa seen must not apply to monthly sitting");

// Chat pools split (§12)
state = memorySubmitSectionAttempt(state, {
  id: "att-chat-typed",
  userId: USER,
  sittingId: SIT_A,
  section: "chat-sim-typed",
  activeSec: 400,
  sectionScore: 88,
  itemIds: ["brief-typed-1"],
  repeatedIds: [],
  seenRecords: [{ pool: "chat-sim-typed", ids: ["brief-typed-1"], repeatedIds: [] }],
}).state;
state = memorySubmitSectionAttempt(state, {
  id: "att-chat-spoken",
  userId: USER,
  sittingId: SIT_A,
  section: "chat-sim-spoken",
  activeSec: 420,
  sectionScore: 77,
  itemIds: ["brief-spoken-1"],
  repeatedIds: [],
  seenRecords: [{ pool: "chat-sim-spoken", ids: ["brief-spoken-1"], repeatedIds: [] }],
}).state;

const typedSeen = filterSeenForSittingDraw(
  memoryLoadSeenEntries(state, USER, SIT_A).map((e) => ({ ...e, sittingId: e.sittingId })),
  SIT_A,
  "chat-sim-typed",
);
const spokenSeen = filterSeenForSittingDraw(
  memoryLoadSeenEntries(state, USER, SIT_A).map((e) => ({ ...e, sittingId: e.sittingId })),
  SIT_A,
  "chat-sim-spoken",
);
assert.equal(typedSeen.length, 1);
assert.equal(spokenSeen.length, 1);
assert.notEqual(typedSeen[0]?.id, spokenSeen[0]?.id);

// Composite — incomplete sections listed, not scored as zero (§12)
const composite = computeCompositeSummary(state.userSittings.get(uk)!.sectionAggregates);
assert.equal(composite.pointsPossible, 100);
assert.ok(composite.incompleteSectionIds.includes("listening"));
assert.ok(composite.incompleteSectionIds.includes("mcq"));
assert.match(composite.incompleteNote, /not scored as zero/i);
assert.ok(composite.pointsEarned > 0 && composite.pointsEarned < 100);

// Legacy recordSeen without sittingId — filter must not mix into monthly sitting
let legacySeen = recordSeen([], "typing", ["legacy-passage"], [], "legacy-att");
legacySeen = legacySeen.map((e) => ({ ...e, sittingId: undefined }));
const monthlyOnly = filterSeenForSittingDraw(legacySeen, SIT_A, "typing");
assert.equal(monthlyOnly.length, 0);

async function optionalDbProof() {
  if (process.env.COMPETENCY_SITTING_P0_DB !== "1") return;
  const { default: pg } = await import("pg");
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  assert.ok(url, "DATABASE_URL required for COMPETENCY_SITTING_P0_DB=1");
  const pool = new pg.Pool({ connectionString: url });
  const {
    ensureSittingCatalogForDate,
    submitSectionAttempt,
    loadSeenForSittingDraw,
  } = await import("../../../integrations/hipaa-training-api/src/competency-exam-sitting-service.ts");

  const catalog = await ensureSittingCatalogForDate(pool, new Date("2026-09-10T00:00:00Z"));
  assert.equal(catalog.id, "2026-09");

  const att1 = await submitSectionAttempt(pool, {
    id: `p0-db-${Date.now()}-1`,
    userId: USER,
    sittingId: catalog.id,
    section: "listening",
    activeSec: 300,
    sectionScore: 65,
    itemIds: ["listen-test-1"],
    repeatedIds: [],
    seenRecords: [{ pool: "listening", ids: ["listen-test-1"], repeatedIds: [] }],
    trailJson: { promptId: "listen-test-1" },
  });
  assert.equal(att1.attempt.attemptIndex, 1);

  const seenAfter = await loadSeenForSittingDraw(pool, USER, catalog.id, "listening");
  assert.ok(seenAfter.some((s) => s.id === "listen-test-1"));

  await pool.end();
  console.log("ok: smoke-competency-exam-sitting-p0 (database)");
}

console.log("ok: smoke-competency-exam-sitting-p0 (memory + schema)");
optionalDbProof().catch((e) => {
  console.error(e);
  process.exit(1);
});
