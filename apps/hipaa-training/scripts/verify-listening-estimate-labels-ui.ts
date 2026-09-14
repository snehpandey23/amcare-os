/**
 * UI proof — three Listening estimate labels via sitting hub.
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-listening-estimate-labels-ui.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { chromium, type Page } from "playwright";
import { ESTIMATE_UNAVAILABLE_LABEL } from "../src/lib/competency-exam/estimate-unavailable";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.COMPETENCY_EXAM_BASE_URL || "https://www.siyahealth.net").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/listening-estimate-labels",
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
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string };
  if (!data.token) throw new Error("login failed");
  return { token: data.token, email, password };
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
}

async function runListeningCase(
  page: Page,
  opts: { id: string; text: string; expectSubstring: string; interceptFail?: boolean },
) {
  await page.goto(`${STAFF}/learn/competency-exam/sitting?section=listening`, {
    waitUntil: "domcontentloaded",
    timeout: 120_000,
  });
  if (opts.interceptFail) {
    await page.route("**/api/competency-exam/estimate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          estimate: null,
          unavailableReason: "llm_failed",
          note: ESTIMATE_UNAVAILABLE_LABEL.llm_failed,
          part: "escalation",
          label: "estimate",
        }),
      });
    });
  } else {
    await page.unroute("**/api/competency-exam/estimate").catch(() => {});
  }

  const hubModal = page.locator("[data-sitting-start-modal]");
  await hubModal.waitFor({ timeout: 15_000 }).catch(() => {});
  if (await hubModal.isVisible().catch(() => false)) {
    await page.locator("[data-sitting-start-confirm]").click();
  } else {
    await page.locator('input[type="checkbox"]').first().check();
    await page.getByRole("button", { name: /Start listening/i }).click();
  }
  await page.locator("#listening-provider-message").waitFor({ timeout: 30_000 });
  await page.locator("#listening-provider-message").fill(opts.text);
  await page.getByRole("button", { name: /Submit listening/i }).click();
  await page.locator('[data-sitting-section-done="true"]').waitFor({ timeout: 180_000 });
  const body = await page.locator("[data-sitting-section-done]").innerText();
  await shot(page, opts.id);
  if (body.includes(opts.expectSubstring) && !/partial \(LLM unavailable\)/i.test(body)) {
    pass(opts.id, body.replace(/\s+/g, " ").slice(0, 220));
  } else {
    fail(opts.id, body.replace(/\s+/g, " ").slice(0, 280));
  }
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const { email, password } = await login();

  // Live API probe before UI
  const AUTH_TOKEN = (
    await (
      await fetch(`${AUTH}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
    ).json()
  ).token as string;
  async function est(text: string) {
    const r = await fetch(`${STAFF}/api/competency-exam/estimate`, {
      method: "POST",
      headers: { Authorization: `Bearer ${AUTH_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: "Voicemail. Provider message.", text, part: "escalation" }),
    });
    return r.json();
  }
  const shortApi = await est("a b c d e f");
  const phiApi = await est("Patient called about refill.");
  writeFileSync(`${OUT}/api-probes.json`, JSON.stringify({ shortApi, phiApi }, null, 2));
  if (shortApi.unavailableReason === "too_short") pass("api-too-short", JSON.stringify(shortApi.unavailableReason));
  else fail("api-too-short", JSON.stringify(shortApi));
  if (phiApi.unavailableReason === "phi_blocked") pass("api-phi", JSON.stringify(phiApi.unavailableReason));
  else fail("api-phi", JSON.stringify(phiApi));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  try {
    await page.goto(`${STAFF}/login`, { waitUntil: "domcontentloaded" });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForTimeout(2500);

    await runListeningCase(page, {
      id: "ui-too-short",
      text: "a b c d e f",
      expectSubstring: "too short for full evaluation",
    });
    await runListeningCase(page, {
      id: "ui-phi",
      text: "Patient called about refill.",
      expectSubstring: "flagged content pattern",
    });
    await runListeningCase(page, {
      id: "ui-llm-failed",
      text:
        "Hi Dr. Smith — John Doe left a voicemail that his refill runs out before travel. I called twice with no answer. Could you please advise whether we can send a bridge supply to his pharmacy on file?",
      expectSubstring: "Evaluation service temporarily unavailable",
      interceptFail: true,
    });
  } catch (e) {
    await shot(page, "error").catch(() => {});
    fail("run-error", e instanceof Error ? e.message : String(e));
  } finally {
    await browser.close();
  }

  writeFileSync(`${OUT}/summary.json`, JSON.stringify({ rows }, null, 2));
  if (rows.some((r) => !r.pass)) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
