/**
 * Verify Part 1 (seed retire) + Part 2 (recurring gap patterns).
 *
 *   cd integrations/hipaa-training-api && node --env-file=.env.db --import tsx scripts/verify-recurring-gap-patterns.ts
 *
 * Hard boundary: detection must NOT create SOPs, assignments, or pending_review rows.
 */
import pg from "pg";
import { randomUUID } from "node:crypto";
import {
  ensureAssistTelemetryTables,
  insertAssistGap,
  listRecurringGapPatterns,
  listVolumeGapPatternsUnknownPeople,
  newGapId,
  normalizeGapTaskLabel,
} from "../src/assist-telemetry.js";
import {
  ensureSopTables,
  listFounderSopConsolidationFlags,
  retireDuplicateSeedPacks,
} from "../src/sop-service.js";
import { RETIRED_OPERATIONAL_PACK_IDS } from "../src/lead-operational-pack.js";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL required");

  const pool = new pg.Pool({
    connectionString: url,
    ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
  });

  const probeTask = `VERIFY recurring gap probe ${Date.now()}`;
  const probeNorm = normalizeGapTaskLabel(probeTask);
  assert(probeNorm === probeTask.toLowerCase(), "normalize lowercases");

  await ensureAssistTelemetryTables(pool);
  await ensureSopTables(pool);

  // --- Part 1: retire seed packs ---
  const retire = await retireDuplicateSeedPacks(pool);
  console.log("retire:", JSON.stringify(retire));
  assert(
    retire.retiredPackIds.includes("task-pack-marketing-zocdoc-narrative"),
    "zocdoc pack listed",
  );
  assert(
    retire.retiredPackIds.includes("task-pack-accounts-chargeback-refunds"),
    "chargeback pack listed",
  );

  for (const packId of RETIRED_OPERATIONAL_PACK_IDS) {
    const task = await pool.query(`SELECT status FROM siya_sop_tasks WHERE id = $1`, [packId]);
    if (task.rows[0]) {
      assert(task.rows[0].status === "done", `${packId} task should be done`);
    }
    const sop = await pool.query(`SELECT id FROM siya_sops WHERE id = $1`, [`sop-pack-${packId}`]);
    assert(sop.rows.length === 0, `seed SOP sop-pack-${packId} must be removed`);
  }

  // Expense seed must remain until team reimbursement is live.
  const expense = await pool.query(
    `SELECT id, status FROM siya_sops WHERE id = $1`,
    ["sop-pack-task-pack-audit-expense-reimbursement"],
  );
  console.log("expense seed still present:", expense.rows[0] || "(not in this DB — ok if never installed)");

  const flags = await listFounderSopConsolidationFlags(pool);
  console.log(
    "founder Zocdoc consolidation candidates:",
    flags[0]?.candidates.length ?? 0,
    "(flag only — no auto-merge)",
  );

  // --- Part 2: simulate multi-staff recurring gaps ---
  const users = await pool.query(
    `SELECT id FROM hipaa_training_users WHERE deactivated_at IS NULL ORDER BY created_at ASC LIMIT 2`,
  );
  assert(users.rows.length >= 2, "need ≥2 users in DB for multi-staff simulation");
  const userA = String(users.rows[0].id);
  const userB = String(users.rows[1].id);

  const gapIds: string[] = [];
  const reporters = [userA, userA, userB]; // 3 gaps, 2 distinct people
  for (let i = 0; i < 3; i++) {
    const id = `gap-verify-${Date.now()}-${i}-${randomUUID().slice(0, 6)}`;
    gapIds.push(id);
    await insertAssistGap(pool, {
      id,
      department: "Marketing",
      task: probeTask,
      phiRedacted: true,
      signalType: "notify_owner",
      reportedByUserId: reporters[i],
    });
  }

  // thumbs_down must NOT count toward multi-staff pattern
  await insertAssistGap(pool, {
    id: newGapId(),
    department: "Marketing",
    task: probeTask,
    phiRedacted: true,
    signalType: "thumbs_down",
    reportedByUserId: userB,
  });

  const beforeSopCount = await pool.query(`SELECT COUNT(*)::int AS c FROM siya_sops`);
  const beforePending = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_sops WHERE status = 'pending_review'`,
  );
  const beforeTasks = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_sop_tasks WHERE status = 'open'`,
  );

  const patterns = await listRecurringGapPatterns(pool, { departmentSlugs: null });
  const hit = patterns.find(
    (p) => p.departmentSlug === "marketing" && p.normalizedTaskLabel === probeNorm,
  );
  assert(Boolean(hit), "pattern must appear for probe task");
  assert((hit!.openGapCount) >= 3, `expected ≥3 open gaps, got ${hit!.openGapCount}`);
  assert(hit!.distinctPeople >= 2, `expected ≥2 people, got ${hit!.distinctPeople}`);
  assert(hit!.multiStaff === true, "multiStaff true");
  assert(
    hit!.surfaceOnlyNote.includes("no auto-draft"),
    "surface-only note present",
  );
  console.log("pattern hit:", JSON.stringify(hit, null, 2));

  // Volume-unknown: insert 3 gaps with null reporter on a different task
  const volTask = `VERIFY volume unknown ${Date.now()}`;
  for (let i = 0; i < 3; i++) {
    await insertAssistGap(pool, {
      id: `gap-vol-${Date.now()}-${i}-${randomUUID().slice(0, 6)}`,
      department: "Accounts",
      task: volTask,
      phiRedacted: true,
      signalType: "no_match",
      reportedByUserId: null,
    });
  }
  const volume = await listVolumeGapPatternsUnknownPeople(pool, {});
  const volHit = volume.find((p) => p.normalizedTaskLabel === normalizeGapTaskLabel(volTask));
  assert(Boolean(volHit), "volume pattern (people unknown) must appear");
  assert(volHit!.multiStaff === false, "volume is not multi-staff");
  console.log("volume hit distinctPeople:", volHit!.distinctPeople);

  const afterSopCount = await pool.query(`SELECT COUNT(*)::int AS c FROM siya_sops`);
  const afterPending = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_sops WHERE status = 'pending_review'`,
  );
  const afterTasks = await pool.query(
    `SELECT COUNT(*)::int AS c FROM siya_sop_tasks WHERE status = 'open'`,
  );

  assert(
    afterSopCount.rows[0].c === beforeSopCount.rows[0].c,
    "HARD BOUNDARY: listing patterns must not create SOPs",
  );
  assert(
    afterPending.rows[0].c === beforePending.rows[0].c,
    "HARD BOUNDARY: must not create pending_review rows",
  );
  assert(
    afterTasks.rows[0].c === beforeTasks.rows[0].c,
    "HARD BOUNDARY: must not open new SOP tasks / assignments",
  );

  // Cleanup probe gaps
  await pool.query(`DELETE FROM siya_assist_gaps WHERE id = ANY($1::text[])`, [gapIds]);
  await pool.query(
    `DELETE FROM siya_assist_gaps WHERE task_label = $1 OR task_label = $2`,
    [probeTask, volTask],
  );

  await pool.end();
  console.log("verify-recurring-gap-patterns: OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
