/**
 * Verify production/staging DB has the shape the task module expects.
 * Usage: DATABASE_URL=... npm run migrate:status
 */
import pg from "pg";

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("✗ DATABASE_URL is not set");
  process.exit(1);
}

const REQUIRED_TABLES = {
  hipaa_training_users: ["id", "email", "role"],
  siya_sop_templates: [
    "id",
    "title",
    "recurrence",
    "checklist_items",
    "assigned_to_user_id",
    "active",
    "created_by",
  ],
  siya_tasks: ["id", "title", "task_type", "assignee_id", "status", "due_date", "checklist_items"],
  siya_task_activity_logs: ["id", "task_id", "action", "source", "metadata", "created_at"],
  siya_sop_template_activity_logs: ["id", "template_id", "action", "source", "metadata", "created_at"],
};

const pool = new pg.Pool({ connectionString: url });

async function columnExists(table, column) {
  const r = await pool.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, column],
  );
  return r.rows.length > 0;
}

async function tableExists(table) {
  const r = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
    [table],
  );
  return r.rows.length > 0;
}

async function main() {
  let ok = true;
  console.log("Daily tasks schema check\n");

  for (const [table, columns] of Object.entries(REQUIRED_TABLES)) {
    if (!(await tableExists(table))) {
      console.log(`✗ missing table: ${table}`);
      ok = false;
      continue;
    }
    const missingCols = [];
    for (const col of columns) {
      if (!(await columnExists(table, col))) missingCols.push(col);
    }
    if (missingCols.length) {
      for (const col of missingCols) console.log(`✗ missing column: ${table}.${col}`);
      ok = false;
    } else {
      console.log(`✓ ${table}`);
    }
  }

  await pool.end();
  if (!ok) {
    console.log("\nFix: deploy API (ensureTaskTables) or run tasks-schema.sql against this database.");
    process.exit(1);
  }
  console.log("\nAll required task tables/columns present.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
