/**
 * Screenshot spoken call-style UI for founder review.
 *
 *   source scripts/agent-qa-env.sh
 *   COMPETENCY_EXAM_BASE_URL=https://www.siyahealth.net \
 *     npx tsx apps/hipaa-training/scripts/shot-spoken-call-ui.ts
 */
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.COMPETENCY_EXAM_BASE_URL || process.env.STAFF_APP_URL || "https://www.siyahealth.net").replace(
  /\/$/,
  "",
);
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/spoken-call-ui",
);

async function login() {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD");
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string };
  if (!res.ok || !data.token) throw new Error("login failed");
  return { email, password };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const { email, password } = await login();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  await page.goto(`${STAFF}/login`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(2500);

  await page.goto(`${STAFF}/learn/chat-simulator`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByRole("button", { name: /Start chat/i }).first().click();
  await page.waitForTimeout(1500);
  // Switch to speak if not already
  const speakToggle = page.getByRole("button", { name: /Switch to Speak|Speak/i }).first();
  if (await speakToggle.isVisible().catch(() => false)) {
    await speakToggle.click();
    await page.waitForTimeout(800);
  }
  await page.locator("[data-spoken-call-ui]").waitFor({ timeout: 30_000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/01-call-style-idle-or-speaking.png`, fullPage: true });
  console.log("shot", `${OUT}/01-call-style-idle-or-speaking.png`);

  const persona = await page.locator("[data-spoken-call-persona]").innerText();
  const status = await page.locator("[data-spoken-call-status]").innerText();
  console.log(JSON.stringify({ persona, status, ok: true }));

  await browser.close();
  console.log("ok: spoken call UI screenshots →", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
