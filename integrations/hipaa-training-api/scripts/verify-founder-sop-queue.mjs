/**
 * Before/after Founder Coach SOP queue: all pending_review vs founder-routed only.
 * Usage (with DATABASE_URL):
 *   node scripts/verify-founder-sop-queue.mjs
 * Or authenticated against prod API:
 *   QA_EMAIL=… QA_PASSWORD=… node scripts/verify-founder-sop-queue.mjs --api
 */
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i);
    let v = line.slice(i + 1);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

for (const f of [".env.local", ".env.db", ".env.vercel.pull", join(root, "../../.env.staff.production")]) {
  loadEnvFile(join(root, f));
}

const FOUNDER_DEPTS = new Set(["Leadership", "General"]);
const API = (process.env.QA_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");

async function resolveRoute(pool, departmentSlug, departmentLabelHint) {
  const label = departmentLabelHint || departmentSlug;
  if (FOUNDER_DEPTS.has(label)) {
    return { mode: "founder", reason: "cross_cutting_department", label };
  }
  const r = await pool.query(
    `SELECT l.user_id, u.email, u.name, u.role, l.department_label
     FROM siya_department_leads l
     LEFT JOIN hipaa_training_users u ON u.id = l.user_id AND u.deactivated_at IS NULL
     WHERE l.department_slug = $1`,
    [departmentSlug],
  );
  const row = r.rows[0];
  const deptLabel = row?.department_label || label;
  if (FOUNDER_DEPTS.has(deptLabel)) {
    return { mode: "founder", reason: "cross_cutting_department", label: deptLabel };
  }
  if (!row?.user_id) return { mode: "founder", reason: "no_assigned_lead", label: deptLabel };
  if (row.role === "admin") {
    return { mode: "founder", reason: "lead_is_founder_admin", label: deptLabel, lead: row.name };
  }
  return {
    mode: "lead_self",
    reason: "department_lead",
    label: deptLabel,
    lead: row.name || row.email,
  };
}

async function viaDb() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url || !/^postgres(ql)?:\/\//i.test(url) || /SENSITIVE/i.test(url)) {
    return null;
  }
  const pool = new pg.Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, max: 2 });
  try {
    const pending = await pool.query(
      `SELECT id, title, department_slug, department
       FROM siya_sops WHERE status = 'pending_review' ORDER BY updated_at DESC`,
    );
    const founder = [];
    const leadSelf = [];
    for (const sop of pending.rows) {
      const route = await resolveRoute(pool, sop.department_slug, sop.department);
      const row = {
        title: sop.title,
        dept: route.label,
        reason: route.reason,
        lead: route.lead || null,
      };
      if (route.mode === "founder") founder.push(row);
      else leadSelf.push(row);
    }
    return {
      source: "database",
      beforeAllPendingReview: pending.rows.length,
      afterFounderRoutedOnly: founder.length,
      excludedLeadSelfApprove: leadSelf.length,
      founderItems: founder,
      excludedLeadOwned: leadSelf,
    };
  } finally {
    await pool.end().catch(() => {});
  }
}

async function viaApi() {
  const email = process.env.QA_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL;
  const pass = process.env.QA_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD;
  if (!email || !pass) return null;

  const loginRes = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pass }),
  });
  const loginBody = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok || !loginBody.token) {
    throw new Error(`login failed: ${loginRes.status} ${loginBody.error || ""}`);
  }
  const token = loginBody.token;
  const headers = { Authorization: `Bearer ${token}` };

  const [allRes, queueRes, mapRes] = await Promise.all([
    fetch(`${API}/api/knowledge/sops?status=pending_review`, { headers }),
    fetch(`${API}/api/admin/sops/review-queue`, { headers }),
    fetch(`${API}/api/admin/department-leads/approval-map`, { headers }),
  ]);
  const allBody = await allRes.json().catch(() => ({}));
  const queueBody = await queueRes.json().catch(() => ({}));
  const mapBody = await mapRes.json().catch(() => ({}));

  const all = Array.isArray(allBody.sops) ? allBody.sops : [];
  const founderQueue = Array.isArray(queueBody.sops) ? queueBody.sops : [];
  const modeBySlug = new Map(
    (mapBody.map || []).map((m) => [m.departmentSlug, m]),
  );

  const founder = [];
  const leadSelf = [];
  for (const sop of all) {
    const meta = modeBySlug.get(sop.departmentSlug) || {};
    const row = {
      title: sop.title,
      dept: meta.department || sop.department || sop.departmentSlug,
      reason: meta.reason || "unknown",
      lead: meta.leadName || null,
      approvalMode: meta.approvalMode || null,
    };
    if (meta.approvalMode === "founder" || founderQueue.some((f) => f.id === sop.id)) {
      founder.push(row);
    } else {
      leadSelf.push(row);
    }
  }

  return {
    source: "api",
    beforeAllPendingReview: all.length,
    afterFounderRoutedOnly: founderQueue.length,
    excludedLeadSelfApprove: Math.max(0, all.length - founderQueue.length),
    founderItems: founderQueue.map((s) => ({
      title: s.title,
      dept: s.department || s.departmentSlug,
    })),
    excludedLeadOwned: leadSelf.filter((r) => r.approvalMode === "lead_self"),
    note: "afterFounderRoutedOnly uses /api/admin/sops/review-queue (same filter as Founder Coach after deploy)",
  };
}

async function main() {
  const preferApi = process.argv.includes("--api");
  let result = preferApi ? await viaApi() : await viaDb();
  if (!result) result = preferApi ? await viaDb() : await viaApi();
  if (!result) {
    console.error(
      JSON.stringify({
        error: "No DATABASE_URL or QA_EMAIL/QA_PASSWORD available",
        hint: "Pass a real DATABASE_URL, or QA credentials for --api mode",
      }),
    );
    process.exit(1);
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
