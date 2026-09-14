/**
 * Screenshot pass for founder review — hub cards + start confirmation modal.
 *
 *   source scripts/agent-qa-env.sh
 *   COMPETENCY_EXAM_BASE_URL=https://www.siyahealth.net \
 *     npx tsx apps/hipaa-training/scripts/shot-sitting-hub-entry.ts
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
  ".cursor-verify/sitting-hub-entry",
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
  const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
  await page.goto(`${STAFF}/login`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(2500);

  await page.goto(`${STAFF}/learn/competency-exam/sitting`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.locator('[data-sitting-hub="true"]').waitFor({ timeout: 90_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/01-hub-section-cards.png`, fullPage: true });
  console.log("shot", `${OUT}/01-hub-section-cards.png`);

  await page.locator('[data-sitting-hub-section="typing"]').click();
  await page.locator("[data-sitting-start-modal]").waitFor({ timeout: 15_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/02-start-modal-typing.png`, fullPage: true });
  console.log("shot", `${OUT}/02-start-modal-typing.png`);

  await page.locator("[data-sitting-start-cancel]").click();
  await page.locator('[data-sitting-hub="true"]').waitFor({ timeout: 15_000 });
  await page.locator('[data-sitting-hub-section="listening"]').click();
  await page.locator('[data-sitting-start-modal="listening"]').waitFor({ timeout: 15_000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/03-start-modal-listening.png`, fullPage: true });
  console.log("shot", `${OUT}/03-start-modal-listening.png`);

  await browser.close();
  console.log("ok: sitting hub entry screenshots →", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
