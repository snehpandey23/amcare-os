/**
 * Post-deploy smoke for Daily Tasks module.
 *
 * Env:
 *   API_BASE_URL (default https://siya-staff-auth-api.vercel.app)
 *   SMOKE_EMAIL + SMOKE_PASSWORD — admin portal user
 *   CRON_SECRET — optional; tests cron generation when set
 *   DATABASE_URL — optional; verifies activity row after checklist toggle
 *
 * Usage: npm run smoke:tasks
 */
const base = (process.env.API_BASE_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const email = process.env.SMOKE_EMAIL?.trim();
const password = process.env.SMOKE_PASSWORD;
const cronSecret = process.env.CRON_SECRET?.trim();

const checks = [];

function pass(label) {
  checks.push({ ok: true, label });
  console.log(`✓ ${label}`);
}

function fail(label, detail) {
  checks.push({ ok: false, label, detail });
  console.log(`✗ ${label}${detail ? `: ${detail}` : ""}`);
}

async function jsonFetch(path, init = {}) {
  const res = await fetch(`${base}${path}`, init);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { res, body };
}

async function main() {
  console.log(`Smoke tasks — ${base}\n`);

  const health = await jsonFetch("/api/health");
  if (health.res.ok && health.body?.ok) pass("API health");
  else fail("API health", `${health.res.status} ${JSON.stringify(health.body)?.slice(0, 120)}`);

  if (!email || !password) {
    fail("auth middleware (login)", "Set SMOKE_EMAIL and SMOKE_PASSWORD");
    summarize();
    process.exit(1);
  }

  const login = await jsonFetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const token = login.body?.token;
  if (!login.res.ok || !token) {
    fail("auth middleware (login)", login.body?.error || String(login.res.status));
    summarize();
    process.exit(1);
  }
  pass("auth middleware (login)");

  const auth = { Authorization: `Bearer ${token}` };

  const templates = await jsonFetch("/api/admin/sop-templates", { headers: auth });
  if (templates.res.status === 403) fail("templates endpoint", "user is not admin");
  else if (templates.res.ok && Array.isArray(templates.body?.templates)) pass("templates endpoint");
  else fail("templates endpoint", `${templates.res.status}`);

  const today = new Date().toISOString().slice(0, 10);

  if (cronSecret) {
    const cron = await jsonFetch("/api/cron/generate-daily-tasks", {
      method: "POST",
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    if (cron.res.ok && cron.body?.ok) pass("task generation endpoint (cron)");
    else fail("task generation endpoint (cron)", cron.body?.error || String(cron.res.status));
  } else {
    console.log("○ task generation endpoint (cron) — skipped (CRON_SECRET not set)");
  }

  const me = await jsonFetch(`/api/tasks/me?date=${today}`, { headers: auth });
  if (me.res.ok && Array.isArray(me.body?.tasks)) pass("task retrieval endpoint (/api/tasks/me)");
  else fail("task retrieval endpoint", me.body?.error || String(me.res.status));

  let activityVerified = false;
  const taskWithChecklist = me.body?.tasks?.find((t) => t.checklistItems?.length > 0);
  if (taskWithChecklist) {
    const itemId = taskWithChecklist.checklistItems[0].id;
    const wasChecked = taskWithChecklist.checklistItems[0].isChecked;
    const toggle = await jsonFetch(`/api/tasks/${taskWithChecklist.id}/checklist-item/${itemId}`, {
      method: "PATCH",
      headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !wasChecked }),
    });
    if (toggle.res.ok) {
      pass("checklist toggle (writes activity)");
      if (process.env.DATABASE_URL) {
        const pg = await import("pg");
        const pool = new pg.default.Pool({ connectionString: process.env.DATABASE_URL });
        const r = await pool.query(
          `SELECT action, source FROM siya_task_activity_logs
           WHERE task_id = $1 AND action = 'checklist_updated' ORDER BY created_at DESC LIMIT 1`,
          [taskWithChecklist.id],
        );
        await pool.end();
        if (r.rows.length) pass("activity write (DB ledger)");
        else fail("activity write (DB ledger)", "no checklist_updated row");
      } else {
        pass("activity write (API path only; set DATABASE_URL to verify ledger row)");
      }
      activityVerified = true;
      await jsonFetch(`/api/tasks/${taskWithChecklist.id}/checklist-item/${itemId}`, {
        method: "PATCH",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ checked: wasChecked }),
      });
    } else fail("checklist toggle", toggle.body?.error || String(toggle.res.status));
  } else {
    console.log("○ activity write — skipped (no task with checklist; seed staging first)");
  }

  if (!activityVerified && me.body?.tasks?.length) {
    console.log("○ full activity chain — create a template with checklist steps to complete this check");
  }

  summarize();
  const failed = checks.filter((c) => !c.ok).length;
  process.exit(failed ? 1 : 0);
}

function summarize() {
  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
  if (failed.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
