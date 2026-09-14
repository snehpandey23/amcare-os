/**
 * P2 — sitting closure (lazy-finalize), reject-after-close, history, MoM trends (§6).
 *
 *   cd apps/hipaa-training && npx tsx scripts/smoke-competency-exam-sitting-p2.ts
 *
 * Optional DB proof (writes test sittings for ASSIST user, then cleans up):
 *   COMPETENCY_SITTING_P2_DB=1 npx tsx --env-file=../../integrations/hipaa-training-api/.env.db \
 *     scripts/smoke-competency-exam-sitting-p2.ts
 */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildSittingTrends,
  computeCompositeSummary,
  memoryLazyFinalize,
  memorySubmitSectionAttempt,
  needsLazyFinalize,
  type SittingMemoryState,
  utcMonthSittingWindow,
} from "../../../integrations/hipaa-training-api/src/competency-exam-sitting-core.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../../../.cursor-verify/competency-sitting-p2");
mkdirSync(OUT, { recursive: true });

const USER = "11111111-1111-4111-8111-111111111111";
const JUL = utcMonthSittingWindow(new Date("2026-07-15T12:00:00.000Z"));
const AUG = utcMonthSittingWindow(new Date("2026-08-15T12:00:00.000Z"));
assert.equal(JUL.id, "2026-07");
assert.equal(JUL.closesAt, "2026-08-01T00:00:00.000Z");
assert.equal(AUG.id, "2026-08");

let state: SittingMemoryState = {
  catalog: [JUL, AUG],
  userSittings: new Map(),
  attempts: [],
  seen: [],
};

const midJul = new Date("2026-07-20T10:00:00.000Z");
const midAug = new Date("2026-08-20T10:00:00.000Z");
const afterJulClose = new Date("2026-08-01T00:00:00.000Z");
const afterAugClose = new Date("2026-09-01T00:00:00.000Z");

// --- July sitting: typing + mcq only (incomplete listening/chat) ---
state = memorySubmitSectionAttempt(
  state,
  {
    id: "p2-jul-typing",
    userId: USER,
    sittingId: JUL.id,
    section: "typing",
    activeSec: 90,
    sectionScore: 40,
    itemIds: ["t1"],
    repeatedIds: [],
  },
  midJul,
).state;
state = memorySubmitSectionAttempt(
  state,
  {
    id: "p2-jul-mcq",
    userId: USER,
    sittingId: JUL.id,
    section: "mcq",
    activeSec: 600,
    sectionScore: 50,
    itemIds: ["m1"],
    repeatedIds: [],
  },
  midJul,
).state;

assert.equal(state.userSittings.get(`${USER}:${JUL.id}`)?.status, "open");
assert.equal(needsLazyFinalize(JUL, "open", afterJulClose), true);

// Lazy-finalize on first read after closesAt
state = memoryLazyFinalize(state, USER, JUL.id, afterJulClose);
const julClosed = state.userSittings.get(`${USER}:${JUL.id}`)!;
assert.equal(julClosed.status, "closed");
assert.ok(julClosed.closedAt);
assert.ok(julClosed.compositeSummary);
assert.ok(julClosed.compositeSummary!.incompleteSectionIds.includes("listening"));
assert.match(julClosed.compositeSummary!.incompleteNote, /not scored as zero/i);
const julPoints = julClosed.compositeSummary!.pointsEarned;
// typing 12*0.4 + mcq 30*0.5 = 4.8 + 15 = 19.8
assert.equal(julPoints, 19.8);
console.log("PASS\tlazy-finalize-july", `points=${julPoints} incomplete=${julClosed.compositeSummary!.incompleteSectionIds.join(",")}`);

// Idempotent — second finalize does not change locked composite
const locked = JSON.stringify(julClosed.compositeSummary);
state = memoryLazyFinalize(state, USER, JUL.id, afterAugClose);
assert.equal(JSON.stringify(state.userSittings.get(`${USER}:${JUL.id}`)?.compositeSummary), locked);
console.log("PASS\tlazy-finalize-idempotent");

// Reject attempt after close (do not auto-start new month on same sitting id)
assert.throws(
  () =>
    memorySubmitSectionAttempt(
      state,
      {
        id: "p2-jul-late",
        userId: USER,
        sittingId: JUL.id,
        section: "listening",
        activeSec: 10,
        sectionScore: 99,
        itemIds: ["l1"],
        repeatedIds: [],
      },
      afterJulClose,
    ),
  (e: unknown) => e instanceof Error && e.message === "SITTING_CLOSED",
);
console.log("PASS\treject-after-close", "SITTING_CLOSED (no auto new period on closed id)");

// --- August sitting: higher scores for MoM trend ---
state = memorySubmitSectionAttempt(
  state,
  {
    id: "p2-aug-typing",
    userId: USER,
    sittingId: AUG.id,
    section: "typing",
    activeSec: 80,
    sectionScore: 80,
    itemIds: ["t2"],
    repeatedIds: [],
  },
  midAug,
).state;
state = memorySubmitSectionAttempt(
  state,
  {
    id: "p2-aug-mcq",
    userId: USER,
    sittingId: AUG.id,
    section: "mcq",
    activeSec: 500,
    sectionScore: 70,
    itemIds: ["m2"],
    repeatedIds: [],
  },
  midAug,
).state;
state = memoryLazyFinalize(state, USER, AUG.id, afterAugClose);
const augClosed = state.userSittings.get(`${USER}:${AUG.id}`)!;
assert.equal(augClosed.status, "closed");
// typing 12*0.8 + mcq 30*0.7 = 9.6 + 21 = 30.6
assert.equal(augClosed.compositeSummary!.pointsEarned, 30.6);
console.log("PASS\tlazy-finalize-august", `points=${augClosed.compositeSummary!.pointsEarned}`);

// History newest-first + trends
const historyNewestFirst = [
  {
    sittingId: AUG.id,
    label: AUG.label,
    status: "closed" as const,
    composite: augClosed.compositeSummary!,
  },
  {
    sittingId: JUL.id,
    label: JUL.label,
    status: "closed" as const,
    composite: julClosed.compositeSummary!,
  },
];
const trends = buildSittingTrends(historyNewestFirst);
assert.equal(trends.length, 2);
const augTrend = trends.find((t) => t.sittingId === AUG.id)!;
assert.equal(augTrend.pointsEarned, 30.6);
assert.equal(augTrend.pointsDelta, 10.8); // 30.6 - 19.8
assert.equal(augTrend.sections.mcq.previousAverage, 50);
assert.equal(augTrend.sections.mcq.averageScore, 70);
assert.equal(augTrend.sections.mcq.delta, 20);
console.log(
  "PASS\tmom-trend",
  `MCQ: ${augTrend.sections.mcq.previousAverage} → ${augTrend.sections.mcq.averageScore} (${augTrend.sections.mcq.delta! > 0 ? "+" : ""}${augTrend.sections.mcq.delta}); composite Δ ${augTrend.pointsDelta}`,
);

// Old July attempts still queryable
const julAttempts = state.attempts.filter((a) => a.sittingId === JUL.id);
assert.equal(julAttempts.length, 2);
console.log("PASS\thistory-preserved", `july attempts still ${julAttempts.length}`);

const evidence = {
  july: julClosed.compositeSummary,
  august: augClosed.compositeSummary,
  trends,
  rejectAfterClose: "SITTING_CLOSED",
};
writeFileSync(join(OUT, "memory-evidence.json"), JSON.stringify(evidence, null, 2));

async function optionalDbProof() {
  if (process.env.COMPETENCY_SITTING_P2_DB !== "1") {
    console.log("SKIP\tdb-proof\tset COMPETENCY_SITTING_P2_DB=1 with DATABASE_URL");
    return;
  }
  const { default: pg } = await import("pg");
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  assert.ok(url, "DATABASE_URL required");
  const pool = new pg.Pool({ connectionString: url });
  const {
    upsertSittingCatalog,
    submitSectionAttempt,
    listUserSittingHistory,
    lazyFinalizeUserSittingIfNeeded,
  } = await import("../../../integrations/hipaa-training-api/src/competency-exam-sitting-service.ts");

  // Prefer QA user from env; fall back to first active user.
  let userId = process.env.COMPETENCY_P2_USER_ID || "";
  if (!userId) {
    const email = process.env.ASSIST_EMAIL;
    if (email) {
      const r = await pool.query(`SELECT id FROM hipaa_training_users WHERE lower(email)=lower($1) LIMIT 1`, [
        email,
      ]);
      userId = r.rows[0]?.id ? String(r.rows[0].id) : "";
    }
  }
  assert.ok(userId, "Need COMPETENCY_P2_USER_ID or ASSIST_EMAIL");

  const sitA = utcMonthSittingWindow(new Date("2025-01-15T12:00:00.000Z")); // far past — avoid colliding with live months
  const sitB = utcMonthSittingWindow(new Date("2025-02-15T12:00:00.000Z"));
  await upsertSittingCatalog(pool, sitA);
  await upsertSittingCatalog(pool, sitB);

  const stamp = Date.now();
  await submitSectionAttempt(
    pool,
    {
      id: `p2db-a-typing-${stamp}`,
      userId,
      sittingId: sitA.id,
      section: "typing",
      activeSec: 60,
      sectionScore: 30,
      itemIds: ["db-t1"],
      repeatedIds: [],
    },
    new Date("2025-01-15T12:00:00.000Z"),
  );
  await submitSectionAttempt(
    pool,
    {
      id: `p2db-a-mcq-${stamp}`,
      userId,
      sittingId: sitA.id,
      section: "mcq",
      activeSec: 100,
      sectionScore: 40,
      itemIds: ["db-m1"],
      repeatedIds: [],
    },
    new Date("2025-01-20T12:00:00.000Z"),
  );

  const fin = await lazyFinalizeUserSittingIfNeeded(
    pool,
    userId,
    sitA.id,
    new Date("2025-02-01T00:00:00.000Z"),
  );
  assert.equal(fin?.status, "closed");
  assert.equal(fin?.finalizedNow, true);
  assert.ok(fin?.compositeSummary);
  assert.ok(fin!.compositeSummary!.incompleteSectionIds.length >= 1);
  console.log("PASS\tdb-lazy-finalize", `points=${fin!.compositeSummary!.pointsEarned} finalizedNow=${fin!.finalizedNow}`);

  let rejected = false;
  try {
    await submitSectionAttempt(
      pool,
      {
        id: `p2db-a-late-${stamp}`,
        userId,
        sittingId: sitA.id,
        section: "listening",
        activeSec: 10,
        sectionScore: 90,
        itemIds: ["db-l1"],
        repeatedIds: [],
      },
      new Date("2025-02-02T00:00:00.000Z"),
    );
  } catch (e) {
    rejected = e instanceof Error && e.message === "SITTING_CLOSED";
  }
  assert.equal(rejected, true);
  console.log("PASS\tdb-reject-after-close");

  await submitSectionAttempt(
    pool,
    {
      id: `p2db-b-typing-${stamp}`,
      userId,
      sittingId: sitB.id,
      section: "typing",
      activeSec: 60,
      sectionScore: 90,
      itemIds: ["db-t2"],
      repeatedIds: [],
    },
    new Date("2025-02-15T12:00:00.000Z"),
  );
  await submitSectionAttempt(
    pool,
    {
      id: `p2db-b-mcq-${stamp}`,
      userId,
      sittingId: sitB.id,
      section: "mcq",
      activeSec: 100,
      sectionScore: 80,
      itemIds: ["db-m2"],
      repeatedIds: [],
    },
    new Date("2025-02-18T12:00:00.000Z"),
  );
  await lazyFinalizeUserSittingIfNeeded(pool, userId, sitB.id, new Date("2025-03-01T00:00:00.000Z"));

  const { trendsForHistory } = await import(
    "../../../integrations/hipaa-training-api/src/competency-exam-sitting-service.ts"
  );
  const hist = await listUserSittingHistory(pool, userId, 24, new Date("2025-03-02T00:00:00.000Z"));
  const past = hist.filter((h) => h.sittingId === sitA.id || h.sittingId === sitB.id);
  assert.ok(past.every((h) => h.status === "closed"));
  const trendsDb = trendsForHistory(past);
  const bTrend = trendsDb.find((t) => t.sittingId === sitB.id);
  assert.ok(bTrend && bTrend.pointsDelta != null && bTrend.pointsDelta > 0);
  console.log(
    "PASS\tdb-history-trend",
    `rows=${past.length} composite Δ=${bTrend!.pointsDelta} mcq=${bTrend!.sections.mcq.previousAverage}→${bTrend!.sections.mcq.averageScore}`,
  );

  writeFileSync(
    join(OUT, "db-evidence.json"),
    JSON.stringify({ userId, sitA: sitA.id, sitB: sitB.id, past, trendsDb }, null, 2),
  );
  await pool.end();
}

void optionalDbProof()
  .then(() => {
    console.log("ok: smoke-competency-exam-sitting-p2");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
