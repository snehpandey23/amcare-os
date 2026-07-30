/**
 * P0 audit chain check — template ledger + task ledger for one SOP task.
 * Usage: DATABASE_URL=... node scripts/verify-audit-chain.mjs [taskId]
 */
import pg from "pg";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const taskId = process.argv[2]?.trim();
const pool = new pg.Pool({ connectionString: url });

async function main() {
  let id = taskId;
  if (!id) {
    const r = await pool.query(
      `SELECT id, source_sop_template_id FROM siya_tasks WHERE task_type = 'sop' ORDER BY created_at DESC LIMIT 1`,
    );
    if (!r.rows[0]) {
      console.error("No SOP tasks found — create template + run cron first.");
      process.exit(1);
    }
    id = r.rows[0].id;
    console.log(`Using latest SOP task: ${id}\n`);
  }

  const task = await pool.query(`SELECT id, source_sop_template_id, status FROM siya_tasks WHERE id = $1`, [id]);
  if (!task.rows[0]) {
    console.error("Task not found");
    process.exit(1);
  }
  const templateId = task.rows[0].source_sop_template_id;

  if (templateId) {
    console.log("Template ledger (why this workflow exists):\n");
    const tpl = await pool.query(
      `SELECT action, source, user_id, metadata, created_at
       FROM siya_sop_template_activity_logs WHERE template_id = $1 ORDER BY created_at ASC`,
      [templateId],
    );
    for (const row of tpl.rows) {
      console.log(`  ${row.created_at.toISOString()}  ${row.action}  source=${row.source}  actor=${row.user_id ?? "—"}`);
    }
    if (!tpl.rows.some((r) => r.action === "created")) {
      console.log("  ⚠ expected template.created (templates seeded before ledger may lack row)");
    }
    console.log("");
  }

  console.log("Task ledger (what happened):\n");
  const logs = await pool.query(
    `SELECT action, source, user_id, metadata, created_at
     FROM siya_task_activity_logs WHERE task_id = $1 ORDER BY created_at ASC`,
    [id],
  );
  for (const row of logs.rows) {
    console.log(`  ${row.created_at.toISOString()}  ${row.action}  source=${row.source}  actor=${row.user_id ?? "—"}`);
  }

  const actions = logs.rows.map((r) => r.action);
  const hasCreated = actions.includes("created");
  const hasChecklist = actions.includes("checklist_updated");
  const hasStatus = actions.includes("status_changed");
  console.log("\nChain check:");
  console.log(hasCreated ? "  ✓ task.created" : "  ✗ missing task.created");
  console.log(hasChecklist ? "  ✓ checklist_updated (complete a checklist item in UI)" : "  ○ checklist_updated (pending human step)");
  console.log(hasStatus ? "  ✓ status_changed" : "  ○ status_changed (optional if checklist auto-completes to done)");

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
