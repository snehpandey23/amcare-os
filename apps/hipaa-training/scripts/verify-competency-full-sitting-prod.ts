/**
 * Production E2E — one full competency exam sitting on www.siyahealth.net.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-competency-full-sitting-prod.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { chromium, type Page } from "playwright";
import { EXAM_WEIGHTS, SECTION_LABEL } from "../src/lib/competency-exam/weights";

const BASE = (process.env.COMPETENCY_EXAM_BASE_URL || "https://www.siyahealth.net").replace(/\/$/, "");
const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const OUT_DIR = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/competency-full-sitting-prod",
);

type Step = { id: string; pass: boolean; detail: string };
const steps: Step[] = [];
const sectionScreens: string[] = [];

function log(id: string, pass: boolean, detail: string) {
  steps.push({ id, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}\t${id}\t${detail}`);
}

async function shot(page: Page, name: string) {
  const path = `${OUT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function loginApi(): Promise<{ token: string; email: string }> {
  const email = (process.env.ASSIST_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD — source scripts/agent-qa-env.sh");
  if (!/qa|test/i.test(email)) throw new Error(`Refusing non-QA email: ${email}`);
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return { token: data.token, email };
}

async function waitForHeading(page: Page, re: RegExp, timeout = 120_000) {
  await page.getByRole("heading", { name: re }).waitFor({ timeout });
}

async function doTyping(page: Page) {
  if (await page.getByRole("button", { name: "Continue" }).isVisible().catch(() => false)) {
    const note = await page.locator("body").innerText();
    if (/Typing recorded/i.test(note)) {
      sectionScreens.push(await shot(page, "01-after-typing-review"));
      return;
    }
  }
  await waitForHeading(page, /Full sitting|MA competency exam/i);
  await page.locator('input[type="checkbox"]').first().check();
  await page.getByRole("button", { name: "Start typing" }).click();
  await page.getByRole("button", { name: "Start test" }).click({ timeout: 15_000 }).catch(() => {});
  const ta = page.locator("textarea").first();
  await ta.waitFor({ timeout: 30_000 });
  const passage = await page.evaluate(() => {
    const ta = document.querySelector("textarea");
    const root = ta?.closest(".space-y-4") || ta?.parentElement;
    const card = root?.querySelector(".rounded-2xl.border");
    return (card?.textContent || "").replace(/\s+/g, " ").trim();
  });
  // Type most of the passage; finishing early via Submit (auto-finish also OK).
  const toType =
    passage.length >= 40
      ? passage.slice(0, Math.max(80, Math.floor(passage.length * 0.85)))
      : "Thanks for calling Siya Health. I can help with scheduling, forms, and routing your message to the care team today.";
  await ta.pressSequentially(toType, { delay: 1 });
  const submit = page.getByRole("button", { name: "Submit section" });
  if (await submit.isVisible().catch(() => false)) {
    await submit.click({ timeout: 10_000 }).catch(() => {});
  }
  await page.getByRole("button", { name: "Continue" }).waitFor({ timeout: 180_000 });
  sectionScreens.push(await shot(page, "01-after-typing-review"));
}

async function doMcq(page: Page) {
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText(/Combined MCQ · .* left/i).waitFor({ timeout: 30_000 });
  sectionScreens.push(await shot(page, "02-mcq-start"));
  await page.evaluate(() => {
    const items = document.querySelectorAll("ol li");
    items.forEach((li, idx) => {
      const radios = li.querySelectorAll('input[type="radio"]');
      const pick = radios[idx % radios.length] as HTMLInputElement | undefined;
      pick?.click();
    });
  });
  await page.getByRole("button", { name: "Submit MCQ section" }).click();
  await page.getByRole("button", { name: "Continue" }).waitFor({ timeout: 120_000 });
  sectionScreens.push(await shot(page, "03-after-mcq-review"));
}

const LISTENING_MSG = `Hi Dr. Smith — this is Alex from Siya Health regarding John Doe (DOB on file).

I returned the patient's voicemail about his refill running out before travel. I tried calling him back twice today with no answer.

Could you please advise whether we can send a short bridge supply to his pharmacy on file, or if you need him seen first? I will document outreach attempts and follow your direction.

Thank you.`;

async function doListening(page: Page) {
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText(/Listening · .* left/i).waitFor({ timeout: 30_000 });
  sectionScreens.push(await shot(page, "04-listening"));
  await page.locator("#listening-provider-message").fill(LISTENING_MSG);
  await page.getByRole("button", { name: "Submit listening" }).click();
  await page.getByRole("button", { name: "Continue" }).waitFor({ timeout: 180_000 });
  sectionScreens.push(await shot(page, "05-after-listening-review"));
}

const TYPED_REPLIES = [
  "Thanks for reaching out — I can help with scheduling and what we need from you before the visit. What day works best this week?",
  "I hear you're frustrated about the wait. I'll check the next available telehealth slot and confirm whether we need any forms on file.",
  "For billing questions I can't change charges on my own, but I can send this to our accounts team and email you a summary of what we have on file.",
  "Please don't share card numbers in chat — I'll send a secure payment link from our official email if you need to pay a copay.",
  "Our clinicians review labs and advise on next steps; I can note your concern and ask the care team to call you back with guidance.",
  "I'll document this and make sure the provider sees your message today. If symptoms worsen before we call back, please use urgent care or 911.",
];

async function sendTypedChatTurn(page: Page, text: string, turnIndex: number) {
  const input = page.getByPlaceholder("Type as the MA — process, booking, forms. No clinical decisions.");
  await input.waitFor({ state: "visible", timeout: 60_000 });
  await input.fill(text);
  await page.getByRole("button", { name: "Send" }).click();
  const next = turnIndex + 1;
  if (next < 6) {
    await page.getByText(`${next}/6 replies`).waitFor({ timeout: 180_000 });
  } else {
    await page.getByRole("button", { name: "Continue" }).waitFor({ timeout: 180_000 });
  }
}

async function doTypedChat(page: Page) {
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Type (exam lane)", { exact: true }).waitFor({ timeout: 30_000 });
  sectionScreens.push(await shot(page, "06-chat-typed-start"));
  for (let i = 0; i < TYPED_REPLIES.length; i++) {
    await sendTypedChatTurn(page, TYPED_REPLIES[i]!, i);
  }
  await page.getByRole("button", { name: "Continue" }).waitFor({ timeout: 180_000 });
  sectionScreens.push(await shot(page, "07-after-typed-chat-review"));
}

const SPOKEN_REPLIES = [
  "I can help you find an appointment time — do mornings or afternoons work better for you?",
  "Let me confirm your pharmacy on file and I'll ask the team about refill timing after travel.",
  "I understand this is stressful; I'll escalate to the nurse line and note you need a callback today.",
  "I can't give medical advice, but I will make sure the provider reviews your symptoms.",
  "Please use our secure portal link for documents — I'll resend it to your email on file.",
  "Thanks for your patience — I've documented everything and you'll hear back once the provider responds.",
];

async function submitSpokenTurn(page: Page, transcript: string, turnIndex: number) {
  await page.route("**/api/talk/cloud-stt", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, transcript, provider: "sarvam" }),
    });
  });
  await page.locator('[data-spoken-chat-sim-record="true"]').click({ timeout: 30_000 });
  await page.waitForTimeout(2200);
  const stop = page.locator('[data-spoken-chat-sim-stop="true"]');
  if (await stop.isVisible().catch(() => false)) {
    await stop.click();
  }
  // No editable draft — raw STT auto-submits.
  if ((await page.locator('[data-spoken-chat-sim-transcript="true"]').count()) > 0) {
    throw new Error(`Transcript edit UI still present (turn ${turnIndex + 1})`);
  }
  const next = turnIndex + 1;
  if (next < 6) {
    await page.getByText(`${next}/6 replies`).waitFor({ timeout: 180_000 });
  } else {
    await page.getByRole("button", { name: "Continue" }).waitFor({ timeout: 180_000 });
  }
  await page.unroute("**/api/talk/cloud-stt").catch(() => {});
}

async function doSpokenChat(page: Page) {
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByText("Speak (exam lane)", { exact: true }).waitFor({ timeout: 30_000 });
  sectionScreens.push(await shot(page, "08-chat-spoken-start"));
  for (let i = 0; i < SPOKEN_REPLIES.length; i++) {
    await submitSpokenTurn(page, SPOKEN_REPLIES[i]!, i);
  }
  await page.getByRole("button", { name: "Continue" }).waitFor({ timeout: 180_000 });
  sectionScreens.push(await shot(page, "09-after-spoken-review"));
}

function parseReportText(text: string) {
  const weights: Record<string, number | null> = {};
  for (const [id, w] of Object.entries(EXAM_WEIGHTS)) {
    const label = SECTION_LABEL[id as keyof typeof SECTION_LABEL];
    const re = new RegExp(`${label.replace(/[()]/g, "\\$&")} · (\\d+) pts`, "i");
    const m = text.match(re);
    weights[id] = m ? Number(m[1]) : null;
  }
  const partial = text.match(/Partial total\s+(\d+)\s*\/\s*(\d+)/i);
  const scoredSections = (text.match(/\d+\/100/g) || []).length;
  return {
    weights,
    pointsEarned: partial ? Number(partial[1]) : null,
    pointsPossible: partial ? Number(partial[2]) : null,
    scoredSections,
  };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { email } = await loginApi();
  log("qa-login", true, email);

  const browser = await chromium.launch({
    headless: true,
    args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ["microphone"],
  });
  const page = await context.newPage();

  await page.route("**/api/talk/cloud-stt", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        transcript: "Production E2E spoken turn — scheduling and callback documented for the care team.",
        provider: "e2e-mock",
      }),
    });
  });

  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', process.env.ASSIST_PASSWORD || "");
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/(my-day|learn|admin)/, { timeout: 120_000 }).catch(() => {});

  await page.goto(`${BASE}/learn/competency-exam`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  sectionScreens.push(await shot(page, "00-orient"));

  try {
    await doTyping(page);
    log("section-typing", true, "typing → review → continue");
    await doMcq(page);
    log("section-mcq", true, "mcq → review → continue");
    await doListening(page);
    log("section-listening", true, "listening → review → continue");
    await doTypedChat(page);
    log("section-chat-typed", true, "6 typed turns → review");
    await doSpokenChat(page);
    log("section-chat-spoken", true, "6 spoken turns → review");

    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByText("Competency exam", { exact: true }).waitFor({ timeout: 60_000 });
    const reportPath = await shot(page, "10-final-composite-report");
    sectionScreens.push(reportPath);

    const staffReportRoot = page.locator("div").filter({ has: page.getByText("Competency exam", { exact: true }) }).filter({ hasText: "Partial total" }).first();
    const staffReportText = await staffReportRoot.innerText();
    const pageText = await page.locator("body").innerText();
    const forbidden = ["What to work on", "Specific next steps from this sitting", "ExamImprovementPlans"];
    const hits = forbidden.filter((s) => pageText.includes(s));
    if (hits.length) log("no-improvement-ui", false, `found: ${hits.join(", ")}`);
    else log("no-improvement-ui", true, "no improvement-plan copy on staff report");

    const parsed = parseReportText(staffReportText);
    const weightOk =
      parsed.weights.typing === 12 &&
      parsed.weights.mcq === 30 &&
      parsed.weights.listening === 20 &&
      parsed.weights["chat-sim-typed"] === 18 &&
      parsed.weights["chat-sim-spoken"] === 20;
    log(
      "weights-table",
      weightOk,
      JSON.stringify(parsed.weights),
    );
    log(
      "composite-scores",
      parsed.scoredSections >= 5 && parsed.pointsPossible === 100,
      `sectionsWithScore=${parsed.scoredSections} partial=${parsed.pointsEarned}/${parsed.pointsPossible}`,
    );

    // Capture report text before navigating away
    const staffFingerprint = staffReportText.replace(/\s+/g, " ").trim();

    await page.goto(`${BASE}/admin/team`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.getByText("Competency exam reports").waitFor({ timeout: 60_000 });
    const attemptBtn = page.locator("section").filter({ hasText: "Competency exam reports" }).getByRole("button").first();
    await attemptBtn.click({ timeout: 30_000 });
    await page.waitForTimeout(500);
    const adminReportRoot = page.locator("div").filter({ has: page.getByText("Competency exam", { exact: true }) }).filter({ hasText: "Partial total" }).first();
    const adminReportText = await adminReportRoot.innerText();
    const adminPageText = await page.locator("body").innerText();
    await shot(page, "11-admin-team-report");
    const adminHits = forbidden.filter((s) => adminReportText.includes(s) || adminPageText.includes(s));
    if (adminHits.length) log("admin-no-improvement-ui", false, adminHits.join(", "));
    else log("admin-no-improvement-ui", true, "absent on admin panel");

    const adminFingerprint = adminReportText.replace(/\s+/g, " ").trim();
    const parity = staffFingerprint === adminFingerprint;
    log("staff-admin-report-parity", parity, parity ? "identical report blocks" : `staffLen=${staffFingerprint.length} adminLen=${adminFingerprint.length}`);

    writeFileSync(
      `${OUT_DIR}/summary.json`,
      JSON.stringify(
        {
          base: BASE,
          email,
          steps,
          sectionScreens,
          parsed,
          staffReportText,
          adminReportText,
        },
        null,
        2,
      ),
    );
  } catch (e) {
    await shot(page, "error-state").catch(() => {});
    log("run-error", false, e instanceof Error ? e.message : String(e));
    writeFileSync(`${OUT_DIR}/summary.json`, JSON.stringify({ steps, sectionScreens, error: String(e) }, null, 2));
    process.exitCode = 1;
  } finally {
    await browser.close();
  }

  if (steps.some((s) => !s.pass)) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
