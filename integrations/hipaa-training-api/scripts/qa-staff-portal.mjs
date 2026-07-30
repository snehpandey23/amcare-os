/**
 * Staff portal smoke + authenticated QA (run before/after prod deploy).
 */
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = join(__dirname, "..", ".env.qa.tmp");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let v = m[2].replace(/^"|"$/g, "");
    process.env[m[1]] = v;
  }
}

const API = (process.env.QA_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.QA_STAFF_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const EMAIL = process.env.QA_EMAIL?.trim() || process.env.STAFF_PORTAL_QA_EMAIL?.trim();
const PASS = process.env.QA_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD;
const CI_STRICT = process.env.GITHUB_ACTIONS === "true" || process.env.QA_STRICT === "1";

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
  console.error(`✗ ${name} — ${detail}`);
}

async function getJson(path, token) {
  const res = await fetch(`${API}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const body = await res.json().catch(() => ({}));
  return { res, body };
}

async function checkSchema() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
    pass("DB schema", "skipped locally (no DATABASE_URL)");
    return;
  }
  const pool = new pg.Pool({ connectionString: url, max: 2 });
  try {
    const required = [
      ["siya_sop_templates", "assigned_to_user_id"],
      ["siya_tasks", "assignee_id"],
      ["siya_task_activity_logs", "source"],
    ];
    for (const [table, col] of required) {
      const r = await pool.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, col],
      );
      if (!r.rows.length) {
        fail(`DB column ${table}.${col}`, "missing — hit /api/team/pulse once after API deploy or run migrate:status");
        return;
      }
    }
    pass("DB schema", "task tables + assigned_to_user_id");
  } catch (e) {
    fail("DB schema", e instanceof Error ? e.message : "connection failed");
  } finally {
    await pool.end().catch(() => {});
  }
}

async function main() {
  console.log(`Staff portal QA\nAPI: ${API}\nStaff proxy: ${STAFF}/api/staff-auth\n`);

  {
    const { res, body } = await getJson("/api/health");
    if (res.ok && body.ok && body.service === "hipaa-training-api") pass("API health", body.database);
    else fail("API health", `${res.status} ${JSON.stringify(body)}`);
  }

  {
    const res = await fetch(`${STAFF}/api/staff-auth/api/health`);
    const body = await res.json().catch(() => ({}));
    if (res.ok && body.ok) pass("Staff app proxy → API");
    else fail("Staff app proxy", `${res.status}`);
  }

  {
    const { res } = await getJson("/api/team/pulse");
    if (res.status === 401) pass("Team pulse auth gate", "401 without token");
    else fail("Team pulse auth gate", `expected 401, got ${res.status}`);
  }

  await checkSchema();

  if (!EMAIL || !PASS) {
    if (CI_STRICT) {
      fail(
        "Authenticated QA",
        "Set GitHub secrets STAFF_PORTAL_QA_EMAIL + STAFF_PORTAL_QA_PASSWORD (dedicated admin test account)",
      );
      summarize();
      process.exit(1);
    }
    console.log("\nSet QA_EMAIL + QA_PASSWORD for authenticated checks (optional).\n");
    summarize();
    process.exit(results.some((r) => !r.ok) ? 1 : 0);
  }

  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASS }),
  });
  const loginBody = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok || !loginBody.token) {
    fail("Login", loginBody.error || loginRes.status);
    summarize();
    process.exit(1);
  }
  const token = loginBody.token;
  pass("Login", EMAIL);

  {
    const { res, body } = await getJson("/api/team/pulse", token);
    if (res.ok && Array.isArray(body.members) && body.live) {
      pass("Team pulse", `${body.members.length} members, ${body.date}`);
    } else fail("Team pulse", `${res.status} ${body.error || ""}`);
  }

  {
    const { res, body } = await getJson("/api/tasks/me?date=today", token);
    if (res.ok && body.date && Array.isArray(body.tasks)) pass("My tasks", `${body.tasks.length} tasks`);
    else fail("My tasks", `${res.status} ${body.error || ""}`);
  }

  {
    const { res, body } = await getJson("/api/shift/state", token);
    if (res.ok && "active" in body) pass("Shift state");
    else fail("Shift state", `${res.status}`);
  }

  {
    const { res, body } = await getJson("/api/auth/me", token);
    if (res.ok && body.role) {
      pass("Auth me", body.role);
      if (body.role === "admin") {
        const board = await getJson("/api/tasks/board", token);
        if (board.res.ok) pass("Admin task board");
        else fail("Admin task board", `${board.res.status} ${board.body.error || ""}`);
        const leads = await getJson("/api/admin/department-leads", token);
        if (leads.res.ok && Array.isArray(leads.body.leads)) pass("Department leads");
        else fail("Department leads", `${leads.res.status}`);
      }
    } else fail("Auth me", `${res.status}`);
  }

  summarize();
  process.exit(results.some((r) => !r.ok) ? 1 : 0);
}

function summarize() {
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed`);
  if (bad.length) {
    console.log("Failed:");
    for (const b of bad) console.log(`  - ${b.name}: ${b.detail}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
