/**
 * Stage 2 verify — Sitting Hub UI + isolation guarantees.
 *
 * Requires Stage 1 API live + staff app with /learn/competency-exam/sitting deployed.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-competency-sitting-hub-p1.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { chromium, type Page } from "playwright";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.STAFF_APP_URL || "https://www.siyahealth.net").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/competency-sitting-hub-p1",
);

type Row = { id: string; pass: boolean; detail: string };
const rows: Row[] = [];
function pass(id: string, detail: string) {
  rows.push({ id, pass: true, detail });
  console.log(`PASS\t${id}\t${detail}`);
}
function fail(id: string, detail: string) {
  rows.push({ id, pass: false, detail });
  console.error(`FAIL\t${id}\t${detail}`);
}

async function login() {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD");
  if (!/qa|test/i.test(email)) throw new Error(`Refusing non-QA: ${email}`);
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return { token: data.token, email, password };
}

async function apiGet(token: string, path: string) {
  const res = await fetch(`${AUTH}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

async function shot(page: Page, name: string) {
  const p = `${OUT}/${name}.png`;
  await page.screenshot({ path: p, fullPage: true });
  return p;
}

async function loginUi(page: Page, email: string, password: string) {
  await page.goto(`${STAFF}/login`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(2500);
}

async function confirmSittingStart(page: Page) {
  // Hub opens modal first
  const hubModal = page.locator("[data-sitting-start-modal]");
  await hubModal.waitFor({ timeout: 15_000 }).catch(() => {});
  if (await hubModal.isVisible().catch(() => false)) {
    await page.locator("[data-sitting-start-confirm]").click();
    return;
  }
  // Section-page modal (deep link)
  await page.locator("[data-sitting-start-confirm]").click({ timeout: 10_000 }).catch(async () => {
    const cb = page.locator('input[type="checkbox"]').first();
    if (await cb.isVisible().catch(() => false)) {
      await cb.check();
      await page.getByRole("button", { name: /Start/i }).first().click();
    }
  });
}

async function runTypingAttempt(page: Page) {
  await confirmSittingStart(page);
  await page.getByRole("heading", { name: /Sitting · Typing/i }).waitFor({ timeout: 30_000 }).catch(() => {});
  await page.getByRole("button", { name: "Start test" }).click({ timeout: 15_000 }).catch(() => {});
  const ta = page.locator("textarea").first();
  await ta.waitFor({ timeout: 30_000 });
  const passage = await page.evaluate(() => {
    const el = document.querySelector("textarea");
    const card = el?.closest(".space-y-4")?.querySelector(".rounded-2xl.border");
    return (card?.textContent || "").replace(/\s+/g, " ").trim();
  });
  const toType = passage.length > 40 ? passage.slice(0, Math.floor(passage.length * 0.85)) : passage || "Thanks for calling Siya Health scheduling desk today.";
  await ta.pressSequentially(toType, { delay: 1 });
  const submit = page.getByRole("button", { name: "Submit section" });
  if (await submit.isVisible().catch(() => false)) await submit.click().catch(() => {});
  await page.locator('[data-sitting-section-done="true"]').waitFor({ timeout: 180_000 });
  await page.waitForTimeout(1500); // allow POST
}

async function runMcqQuick(page: Page) {
  await confirmSittingStart(page);
  await page.getByText(/Combined MCQ ·/i).waitFor({ timeout: 30_000 });
  await page.evaluate(() => {
    document.querySelectorAll("ol li").forEach((li, idx) => {
      const radios = li.querySelectorAll('input[type="radio"]');
      (radios[idx % radios.length] as HTMLInputElement | undefined)?.click();
    });
  });
  await page.getByRole("button", { name: /Submit MCQ/i }).click();
  await page.locator('[data-sitting-section-done="true"]').waitFor({ timeout: 120_000 });
  await page.waitForTimeout(1500);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const { token, email, password } = await login();
  pass("login", email);

  const before = await apiGet(token, "/api/competency-exam/sittings/current");
  if (before.status !== 200) {
    fail("api-current", `HTTP ${before.status}`);
    throw new Error("Stage 1 API missing");
  }
  const sittingId = (before.json as { sitting?: { id?: string } }).sitting?.id;
  const typingBefore = (before.json as { sectionAggregates?: { typing?: { attemptCount?: number; averageScore?: number } } })
    .sectionAggregates?.typing;
  pass("api-before", `sitting=${sittingId} typingAttempts=${typingBefore?.attemptCount ?? 0}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await loginUi(page, email, password);

    // Hub loads
    await page.goto(`${STAFF}/learn/competency-exam/sitting`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.locator('[data-sitting-hub="true"]').waitFor({ timeout: 60_000 });
    await shot(page, "01-hub");
    pass("hub-loads", "data-sitting-hub visible");

    // Typing attempt via hub
    await page.locator('[data-sitting-hub-section="typing"]').click();
    await runTypingAttempt(page);
    await shot(page, "02-typing-done");
    const note1 = await page.locator("[data-sitting-section-done]").innerText();
    if (/Saved to|section avg/i.test(note1)) pass("typing-persisted-ui", note1.slice(0, 120));
    else fail("typing-persisted-ui", note1.slice(0, 200));

    await page.locator('[data-sitting-back-hub="true"]').click();
    await page.locator('[data-sitting-hub="true"]').waitFor({ timeout: 30_000 });

    // Simulate "different day" by only checking server state still has typing, then do MCQ
    const mid = await apiGet(token, "/api/competency-exam/sittings/current");
    const typingMid = (mid.json as { sectionAggregates?: { typing?: { attemptCount?: number } } }).sectionAggregates?.typing;
    const mcqMid = (mid.json as { sectionAggregates?: { mcq?: { status?: string } } }).sectionAggregates?.mcq;
    if ((typingMid?.attemptCount ?? 0) >= (typingBefore?.attemptCount ?? 0) + 1) {
      pass("typing-persisted-api", `attemptCount=${typingMid?.attemptCount}`);
    } else fail("typing-persisted-api", JSON.stringify(typingMid));

    // MCQ
    await page.locator('[data-sitting-hub-section="mcq"]').click();
    await runMcqQuick(page);
    await shot(page, "03-mcq-done");
    await page.locator('[data-sitting-back-hub="true"]').click();
    await page.locator('[data-sitting-hub="true"]').waitFor({ timeout: 30_000 });
    await shot(page, "04-hub-after-two");

    const afterTwo = await apiGet(token, "/api/competency-exam/sittings/current");
    const preview = (afterTwo.json as {
      compositePreview?: { incompleteSectionIds?: string[]; pointsEarned?: number };
      sectionAggregates?: Record<string, { status?: string; attemptCount?: number; averageScore?: number }>;
    }).compositePreview;
    const incomplete = preview?.incompleteSectionIds || [];
    const attempted = 5 - incomplete.length;
    if (attempted >= 2 && incomplete.includes("listening")) {
      pass("composite-2-of-5", `attempted≈${attempted} incomplete=${incomplete.join(",")}`);
    } else {
      fail("composite-2-of-5", `attempted=${attempted} incomplete=${incomplete.join(",")}`);
    }
    const hubText = await page.locator("[data-sitting-hub]").innerText();
    if (/2\/5|Listening|incomplete/i.test(hubText)) pass("hub-incomplete-copy", "hub shows progress");
    else fail("hub-incomplete-copy", hubText.slice(0, 200));

    // Second typing attempt — average update
    const tCount = afterTwo.json as { sectionAggregates?: { typing?: { attemptCount?: number; averageScore?: number } } };
    const avgBeforeRetry = tCount.sectionAggregates?.typing?.averageScore;
    const nBeforeRetry = tCount.sectionAggregates?.typing?.attemptCount ?? 0;
    await page.locator('[data-sitting-hub-section="typing"]').click();
    await runTypingAttempt(page);
    await page.waitForTimeout(1000);
    const afterRetry = await apiGet(token, "/api/competency-exam/sittings/current");
    const typingRetry = (afterRetry.json as { sectionAggregates?: { typing?: { attemptCount?: number; averageScore?: number } } })
      .sectionAggregates?.typing;
    if ((typingRetry?.attemptCount ?? 0) === nBeforeRetry + 1) {
      pass(
        "typing-retry-average",
        `n ${nBeforeRetry}→${typingRetry?.attemptCount} avg ${avgBeforeRetry}→${typingRetry?.averageScore}`,
      );
    } else {
      fail("typing-retry-average", JSON.stringify(typingRetry));
    }
    await page.locator('[data-sitting-back-hub="true"]').click();

    // Linear full sitting still works
    await page.goto(`${STAFF}/learn/competency-exam`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /Full sitting/i }).waitFor({ timeout: 30_000 });
    await page.getByText(/Typing → Combined MCQ → Listening/i).waitFor({ timeout: 10_000 });
    await shot(page, "05-linear-unchanged");
    pass("linear-full-sitting", "orient still present");

    // Isolated review must not bump sitting attempt counts
    const beforeIso = await apiGet(token, "/api/competency-exam/sittings/current");
    const nIsoBefore =
      (beforeIso.json as { sectionAggregates?: { typing?: { attemptCount?: number } } }).sectionAggregates?.typing
        ?.attemptCount ?? 0;
    await page.goto(`${STAFF}/learn/competency-exam?section=typing&mode=review`, {
      waitUntil: "domcontentloaded",
    });
    await page.getByRole("heading", { name: "Isolated review · Typing" }).waitFor({ timeout: 30_000 });
    // Do not complete — just confirm path is isolated (not sitting)
    const body = await page.locator("body").innerText();
    if (/isolation|Isolated review/i.test(body) && !/Monthly sitting hub/i.test(body)) {
      pass("isolated-review-path", "founder review URL intact");
    } else fail("isolated-review-path", body.slice(0, 180));
    await shot(page, "06-isolated-review");

    // Confirm hub API unchanged by merely opening isolated orient
    const afterIso = await apiGet(token, "/api/competency-exam/sittings/current");
    const nIsoAfter =
      (afterIso.json as { sectionAggregates?: { typing?: { attemptCount?: number } } }).sectionAggregates?.typing
        ?.attemptCount ?? 0;
    if (nIsoAfter === nIsoBefore) pass("isolated-no-sitting-write", `typing attempts still ${nIsoAfter}`);
    else fail("isolated-no-sitting-write", `${nIsoBefore} → ${nIsoAfter}`);

    void mcqMid;
  } catch (e) {
    await shot(page, "error").catch(() => {});
    fail("run-error", e instanceof Error ? e.message : String(e));
  } finally {
    await browser.close();
  }

  writeFileSync(`${OUT}/summary.json`, JSON.stringify({ staff: STAFF, auth: AUTH, rows }, null, 2));
  if (rows.some((r) => !r.pass)) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
