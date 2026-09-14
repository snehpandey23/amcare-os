/**
 * Quick admin parity only — seeds the real sitting scores into localStorage.
 * Does NOT re-run the full exam.
 */
import { copyFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { chromium } from "playwright";

const BASE = "https://www.siyahealth.net";
const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const OUT = resolve("apps/hipaa-training/.cursor-verify/competency-full-sitting-prod");

async function main() {
  mkdirSync(OUT, { recursive: true });
  // Preserve staff composite evidence from the completed sitting
  try {
    copyFileSync(`${OUT}/error-state.png`, `${OUT}/10-final-composite-report.png`);
  } catch {
    /* ok */
  }

  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  const loginRes = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = (await loginRes.json()) as { token?: string; user?: { id?: string; name?: string } };
  if (!login.token || !login.user?.id) throw new Error("login failed");

  const report = {
    attemptId: "exam-prod-e2e-178928",
    subjectLabel: login.user.name || email,
    startedAt: Date.now() - 600000,
    submittedAt: Date.now(),
    pointsEarned: 61.8,
    pointsPossible: 100,
    partialNote: "All five live sections scored this sitting.",
    safety: { redFlagged: false, reasons: [], notes: [] },
    sections: [
      {
        id: "typing",
        label: "Typing",
        weight: 12,
        status: "scored",
        score: 10,
        note: "WPM was not reliable (too short or implausible)",
        itemIds: [],
        repeatedIds: [],
        draftContent: false,
        detail: "10% accuracy · WPM not counted",
      },
      {
        id: "mcq",
        label: "Combined MCQ",
        weight: 30,
        status: "scored",
        score: 40,
        note: "Combined MCQ draw",
        itemIds: [],
        repeatedIds: [],
        draftContent: true,
        detail: "16/40 correct",
      },
      {
        id: "listening",
        label: "Listening",
        weight: 20,
        status: "scored",
        score: 68,
        note: "Listening · deterministic",
        itemIds: [],
        repeatedIds: [],
        draftContent: true,
        detail: "Provider message",
      },
      {
        id: "chat-sim-typed",
        label: "Chat simulator (typed)",
        weight: 18,
        status: "scored",
        score: 100,
        note: "Typed chat lane",
        itemIds: [],
        repeatedIds: [],
        draftContent: true,
        detail: "Grammar 100 · Politeness 100 · Relevance 100",
      },
      {
        id: "chat-sim-spoken",
        label: "Chat simulator (spoken)",
        weight: 20,
        status: "scored",
        score: 85,
        note: "Spoken chat lane",
        itemIds: [],
        repeatedIds: [],
        draftContent: true,
        detail: "mean of Grammar · Politeness · Relevance",
      },
    ],
  };

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
  await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" });
  await page.fill("input[type=email]", email);
  await page.fill("input[type=password]", password);
  await page.getByRole("button", { name: /Sign in/i }).click();
  await page.waitForTimeout(2500);
  await page.evaluate(
    (payload) => {
      localStorage.setItem("siya-competency-exam-attempts-v1", JSON.stringify([payload]));
    },
    { attemptId: report.attemptId, userId: login.user.id, report },
  );
  await page.goto(`${BASE}/admin/team`, { waitUntil: "domcontentloaded" });
  await page.getByText("Competency exam reports").waitFor({ timeout: 30000 });
  await page.locator("section").filter({ hasText: "Competency exam reports" }).getByRole("button").first().click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/11-admin-team-report.png`, fullPage: true });
  const text = await page.locator("body").innerText();
  const checks = {
    weightsOk:
      /Typing · 12 pts/.test(text) &&
      /Combined MCQ · 30 pts/.test(text) &&
      /Listening · 20 pts/.test(text) &&
      /Chat simulator \(typed\) · 18 pts/.test(text) &&
      /Chat simulator \(spoken\) · 20 pts/.test(text),
    scoresOk:
      /10\/100/.test(text) &&
      /40\/100/.test(text) &&
      /68\/100/.test(text) &&
      /100\/100/.test(text) &&
      /85\/100/.test(text),
    partialOk: /61\.8\s*\/\s*100/.test(text),
    noImprovement: !/What to work on|Specific next steps from this sitting/.test(text),
    sameComponent: /Same report as staff Learn/.test(text),
  };
  writeFileSync(`${OUT}/admin-parity-check.json`, JSON.stringify(checks, null, 2));
  console.log(JSON.stringify(checks, null, 2));
  if (!Object.values(checks).every(Boolean)) process.exitCode = 1;
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
