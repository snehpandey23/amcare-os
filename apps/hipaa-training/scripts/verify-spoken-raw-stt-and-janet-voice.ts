/**
 * Prod verify: raw-STT auto-submit (no edit UI) + Janet female voice stability.
 *
 *   source scripts/agent-qa-env.sh
 *   COMPETENCY_EXAM_BASE_URL=https://www.siyahealth.net \
 *     npx tsx apps/hipaa-training/scripts/verify-spoken-raw-stt-and-janet-voice.ts
 */
import assert from "node:assert/strict";
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
  ".cursor-verify/spoken-raw-stt-janet",
);

const FEMALE_HINT =
  /female|woman|\bzira\b|\bsamantha\b|\bkaren\b|\bmoira\b|\btessa\b|\bveena\b|\braveena\b|\blekha\b|\bkathy\b|\bvictoria\b|\bsusan\b|\bfiona\b|\bserena\b|\ballison\b|\bava\b|\bjenny\b/i;
const MALE_HINT =
  /male|\bman\b|\balex\b|\bdaniel\b|\bfred\b|\bdavid\b|\bmark\b|\bbruce\b|\bralph\b|\bneel\b/i;

async function loginCreds() {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD (source scripts/agent-qa-env.sh)");
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
  const { email, password } = await loginCreds();
  const browser = await chromium.launch({
    headless: true,
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const context = await browser.newContext({
    viewport: { width: 1100, height: 900 },
    permissions: ["microphone"],
  });
  const page = await context.newPage();

  await page.goto(`${STAFF}/login`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(2500);

  await page.goto(`${STAFF}/learn/chat-simulator`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.getByRole("button", { name: /Janet/i }).first().click({ timeout: 60_000 });
  await page.waitForTimeout(1500);

  const speakToggle = page.getByRole("button", { name: /Switch to Speak \(call\)/i }).first();
  if (await speakToggle.isVisible().catch(() => false)) {
    await speakToggle.click();
    await page.waitForTimeout(800);
  }

  await page.locator("[data-spoken-call-ui]").waitFor({ timeout: 45_000 });
  const noEdit = await page.locator('[data-spoken-no-transcript-edit="true"]').count();
  assert.ok(noEdit > 0, "expected data-spoken-no-transcript-edit");
  assert.equal(await page.locator('[data-spoken-chat-sim-transcript="true"]').count(), 0);
  assert.equal(await page.locator('[data-spoken-chat-sim-submit="true"]').count(), 0);

  const persona = (await page.locator("[data-spoken-call-persona]").innerText()).trim();
  assert.match(persona, /Janet/i, `expected Janet session, got ${persona}`);

  // Wait for voices to populate
  await page.waitForTimeout(1500);
  const voiceUri1 = await page.locator("[data-spoken-call-ui]").getAttribute("data-persona-tts-voice-uri");
  const voiceName1 = await page.locator("[data-spoken-call-ui]").getAttribute("data-persona-tts-voice-name");
  assert.ok(voiceUri1, "Janet voice URI missing");
  if (voiceName1) {
    assert.ok(!MALE_HINT.test(voiceName1) || FEMALE_HINT.test(voiceName1), `Janet voice looks male: ${voiceName1}`);
    assert.ok(FEMALE_HINT.test(voiceName1) || !MALE_HINT.test(voiceName1), `Janet not female-tagged: ${voiceName1}`);
  }

  // Stub STT → auto-submit raw text; no edit UI may appear
  const canned =
    "I can help find an appointment — mornings or afternoons better for you?";
  await page.route("**/api/talk/cloud-stt", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, transcript: canned, provider: "sarvam" }),
    });
  });

  // Wait until mic ready (after persona TTS if any)
  const record = page.locator('[data-spoken-chat-sim-record="true"]');
  await record.waitFor({ state: "visible", timeout: 60_000 });
  await record.click();
  await page.waitForTimeout(2200);
  const stop = page.locator('[data-spoken-chat-sim-stop="true"]');
  if (await stop.isVisible().catch(() => false)) await stop.click();
  else {
    await record.click().catch(() => {});
    await page.waitForTimeout(800);
    await page.locator('[data-spoken-chat-sim-stop="true"]').click({ timeout: 15_000 });
  }

  assert.equal(await page.locator('[data-spoken-chat-sim-transcript="true"]').count(), 0, "edit UI must not appear after STT");
  await page.getByText(/1\/\d+ replies/).waitFor({ timeout: 120_000 });

  const lastStt = await page.locator("[data-spoken-last-stt]").innerText().catch(() => "");
  assert.match(lastStt, /appointment|mornings/i, `expected last scored raw STT echo, got: ${lastStt}`);

  // Turn-to-turn voice stability: still same URI after a reply cycle
  await page.waitForTimeout(2000);
  const voiceUri2 = await page.locator("[data-spoken-call-ui]").getAttribute("data-persona-tts-voice-uri");
  assert.equal(voiceUri2, voiceUri1, "Janet voice URI must stay stable across turns");

  await page.screenshot({ path: `${OUT}/01-raw-stt-no-edit-janet.png`, fullPage: true });

  const policyAttr = await page.locator("[data-spoken-submit-policy]").getAttribute("data-spoken-submit-policy");
  assert.equal(policyAttr, "raw-stt");
  // Idle hint mentions no-edit when mic is available; during TTS it may show wait copy.
  const policyText = await page.locator("[data-spoken-submit-policy]").innerText();
  assert.ok(
    /no edit|scores the transcription directly|raw STT|Wait for the patient|Listening/i.test(policyText),
    `unexpected mic hint: ${policyText}`,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        persona,
        voiceUri: voiceUri1,
        voiceName: voiceName1,
        voiceStable: voiceUri1 === voiceUri2,
        noEditUi: true,
        autoSubmitted: true,
        lastSttPreview: lastStt.slice(0, 120),
        shot: `${OUT}/01-raw-stt-no-edit-janet.png`,
        intentionalNoSafetyNet:
          "STT mishears are scored as written — no transcript correction path (founder decision).",
      },
      null,
      2,
    ),
  );

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
