/**
 * Seed daily-task fixtures (templates + adhoc tasks). Requires DATABASE_URL.
 * Usage: DATABASE_URL=... node scripts/seed-daily-tasks.mjs [adminEmail]
 */
import pg from "pg";
import { randomUUID } from "crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const adminEmail = process.argv[2]?.trim().toLowerCase();

const pool = new pg.Pool({ connectionString: url });

async function main() {
  const users = await pool.query(
    `SELECT id, email, role FROM hipaa_training_users WHERE deactivated_at IS NULL ORDER BY created_at ASC LIMIT 10`,
  );
  if (!users.rows.length) {
    console.error("No users — create portal users first.");
    process.exit(1);
  }
  let admin = users.rows.find((r) => r.role === "admin");
  if (adminEmail) {
    admin = users.rows.find((r) => (r.email as string).toLowerCase() === adminEmail) ?? admin;
  }
  if (!admin) admin = users.rows[0];
  const assignee = users.rows.find((r) => r.id !== admin.id) ?? admin;
  const today = new Date().toISOString().slice(0, 10);

  const tmplId = `tmpl-seed-marketing-daily`;
  await pool.query(
    `INSERT INTO siya_sop_templates (
      id, title, description, recurrence, recurrence_config, checklist_items,
      assigned_to_user_id, active, created_by
    ) VALUES ($1,$2,$3,'daily',$4,$5,$6,TRUE,$7)
    ON CONFLICT (id) DO UPDATE SET active = TRUE, assigned_to_user_id = EXCLUDED.assigned_to_user_id`,
    [
      tmplId,
      "Marketing — daily publish checklist",
      "Seed template for QA",
      JSON.stringify({ timeOfDay: "17:00:00" }),
      JSON.stringify([
        { id: "c1", label: "Review scheduled posts", order: 0 },
        { id: "c2", label: "Check brand voice on drafts", order: 1 },
      ]),
      assignee.id,
      admin.id,
    ],
  );

  const sopTaskId = `sop-${tmplId}-${today}`;
  await pool.query(
    `INSERT INTO siya_tasks (
      id, title, description, task_type, source_sop_template_id, assignee_id, assigned_by,
      status, priority, due_date, due_time, checklist_items
    ) VALUES ($1,$2,$3,'sop',$4,$5,$6,'todo','medium',$7,'17:00:00',$8)
    ON CONFLICT (id) DO NOTHING`,
    [
      sopTaskId,
      "Marketing — daily publish checklist",
      "Seed template for QA",
      tmplId,
      assignee.id,
      admin.id,
      today,
      JSON.stringify([
        { id: "c1", label: "Review scheduled posts", isChecked: false, checkedAt: null },
        { id: "c2", label: "Check brand voice on drafts", isChecked: false, checkedAt: null },
      ]),
    ],
  );

  const adhocId = `adhoc-seed-${randomUUID()}`;
  await pool.query(
    `INSERT INTO siya_tasks (
      id, title, description, task_type, assignee_id, assigned_by, status, priority, due_date, checklist_items
    ) VALUES ($1,'Review inbox tags','Seed adhoc task','adhoc',$2,$3,'todo','high',$4,'[]')
    ON CONFLICT (id) DO NOTHING`,
    [adhocId, assignee.id, admin.id, today],
  );

  console.log("Seed OK:", {
    template: tmplId,
    assignee: assignee.email,
    admin: admin.email,
    sopTaskId,
    adhocId,
  });
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
