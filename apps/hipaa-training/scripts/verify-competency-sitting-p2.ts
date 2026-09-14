/**
 * P2 live verify — history API shape + hub history panel (after deploy).
 * Closure / reject / MoM math are proven by smoke-competency-exam-sitting-p2.ts (memory).
 *
 *   source scripts/agent-qa-env.sh
 *   COMPETENCY_EXAM_BASE_URL=https://www.siyahealth.net \
 *     npx tsx scripts/verify-competency-sitting-p2.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../../../.cursor-verify/competency-sitting-p2");
mkdirSync(OUT, { recursive: true });

const API = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.COMPETENCY_EXAM_BASE_URL || process.env.STAFF_APP_URL || "https://www.siyahealth.net").replace(
  /\/$/,
  "",
);

const rows: { name: string; ok: boolean; detail: string }[] = [];
function pass(name: string, detail: string) {
  rows.push({ name, ok: true, detail });
  console.log(`PASS\t${name}\t${detail}`);
}
function fail(name: string, detail: string) {
  rows.push({ name, ok: false, detail });
  console.log(`FAIL\t${name}\t${detail}`);
}

async function login() {
  const email = process.env.ASSIST_EMAIL || process.env.QA_EMAIL;
  const password = process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD;
  if (!email || !password) throw new Error("ASSIST_EMAIL/PASSWORD required");
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = (await res.json()) as { token?: string; user?: { email?: string; role?: string } };
  if (!res.ok || !json.token) throw new Error(`login failed ${res.status}`);
  return { token: json.token, email: json.user?.email || email, role: json.user?.role };
}

async function main() {
  const { token, email, role } = await login();
  pass("login", `${email} role=${role || "?"}`);

  const mine = await fetch(`${API}/api/competency-exam/sittings/mine?limit=24`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const mineJson = (await mine.json()) as {
    sittings?: Array<{
      sittingId?: string;
      label?: string;
      status?: string;
      composite?: { pointsEarned?: number; incompleteSectionIds?: string[]; incompleteNote?: string };
      compositePreview?: { pointsEarned?: number };
    }>;
    trends?: Array<{ sittingId?: string; pointsDelta?: number | null; sections?: Record<string, unknown> }>;
  };
  if (!mine.ok) fail("mine-api", `HTTP ${mine.status}`);
  else {
    const sittings = mineJson.sittings || [];
    const trends = mineJson.trends || [];
    pass("mine-api", `sittings=${sittings.length} trends=${trends.length}`);
    writeFileSync(join(OUT, "mine.json"), JSON.stringify(mineJson, null, 2));
    if (sittings.some((s) => s.composite || s.compositePreview)) {
      pass("mine-composite-shape", "composite present on history rows");
    } else if (sittings.length === 0) {
      pass("mine-composite-shape", "no sittings yet (empty ok)");
    } else fail("mine-composite-shape", "missing composite on rows");
  }

  if (role === "admin" || role === "founder" || process.env.FORCE_ADMIN_SITTING_CHECK === "1") {
    const admin = await fetch(`${API}/api/admin/competency-exam/sittings?limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (admin.ok) {
      const aj = (await admin.json()) as { sittings?: unknown[]; trends?: unknown[] };
      pass("admin-sittings", `sittings=${aj.sittings?.length ?? 0}`);
      writeFileSync(join(OUT, "admin-sittings.json"), JSON.stringify(aj, null, 2));
    } else fail("admin-sittings", `HTTP ${admin.status}`);

    const current = await fetch(`${API}/api/competency-exam/sittings/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const cj = (await current.json()) as { sitting?: { id?: string } };
    const sid = cj.sitting?.id;
    if (sid) {
      const roster = await fetch(`${API}/api/admin/competency-exam/sittings/${encodeURIComponent(sid)}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (roster.ok) {
        const rj = (await roster.json()) as { users?: unknown[] };
        pass("admin-roster", `users=${rj.users?.length ?? 0} sitting=${sid}`);
      } else fail("admin-roster", `HTTP ${roster.status}`);
    }
  } else {
    pass("admin-sittings", `skipped (role=${role})`);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    const password = process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD || "";
    await page.goto(`${STAFF}/login`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForTimeout(2500);

    await page.goto(`${STAFF}/learn/competency-exam/sitting`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.locator('[data-sitting-hub="true"]').waitFor({ timeout: 90_000 });
    await page.locator('[data-sitting-history-panel="staff"]').waitFor({ timeout: 60_000 });
    const histText = await page.locator('[data-sitting-history-panel="staff"]').innerText();
    await page.screenshot({ path: join(OUT, "01-hub-history.png"), fullPage: true });
    if (/Sitting history|trend|No sittings/i.test(histText)) {
      pass("hub-history-ui", histText.slice(0, 120).replace(/\s+/g, " "));
    } else fail("hub-history-ui", histText.slice(0, 200));
  } catch (e) {
    await page.screenshot({ path: join(OUT, "error.png"), fullPage: true }).catch(() => {});
    const body = await page.locator("body").innerText().catch(() => "");
    fail("hub-history-ui", `${e instanceof Error ? e.message : String(e)} | body=${body.slice(0, 180)}`);
  } finally {
    await browser.close();
  }

  writeFileSync(join(OUT, "summary.json"), JSON.stringify({ rows, STAFF, API }, null, 2));
  if (rows.some((r) => !r.ok)) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
