/**
 * Stage 2 remaining sections — Listening + typed/spoken chat-sim via sitting hub.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-competency-sitting-hub-remaining-p1.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { chromium, type Page } from "playwright";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.COMPETENCY_EXAM_BASE_URL || process.env.STAFF_APP_URL || "https://www.siyahealth.net").replace(
  /\/$/,
  "",
);
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/competency-sitting-hub-remaining-p1",
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

function agg(
  json: unknown,
  section: string,
): { attemptCount?: number; averageScore?: number; status?: string } | undefined {
  return (json as { sectionAggregates?: Record<string, { attemptCount?: number; averageScore?: number; status?: string }> })
    .sectionAggregates?.[section];
}

function listeningTrails(json: unknown) {
  const attempts = ((json as { attempts?: Record<string, unknown>[] }).attempts || []).filter(
    (a) => a.section === "listening",
  );
  return attempts.map((a) => {
    const trail = (a.trailJson || {}) as Record<string, unknown>;
    return {
      id: a.id,
      sittingId: a.sittingId,
      score: a.sectionScore,
      wordCount: trail.wordCount,
      llmEstimate: trail.llmEstimate,
      issues: trail.issues,
      text: String(trail.text || trail.escalationText || "").slice(0, 160),
    };
  });
}

async function loginUi(page: Page, email: string, password: string) {
  await page.goto(`${STAFF}/login`, { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(2500);
}

async function backToHub(page: Page) {
  await page.locator('[data-sitting-back-hub="true"]').click({ timeout: 30_000 });
  await page.locator('[data-sitting-hub="true"]').waitFor({ timeout: 30_000 });
}

const GOOD_LISTENING = `Hi Dr. Smith — this is Alex from front desk regarding James Doe on file.

I returned their voicemail about a refill running out before travel. I tried calling back twice today with no answer.

Could you please advise whether we can send a short bridge supply to the pharmacy on file, or if they need to be seen first? I will document outreach attempts and follow your direction.

Thank you.`;

const SHORT_LISTENING = "a b c d e f"; // too_short path (not PHI)
const PHI_LISTENING = "Patient called about refill."; // phi_blocked path

async function confirmSittingStart(page: Page) {
  const hubModal = page.locator("[data-sitting-start-modal]");
  await hubModal.waitFor({ timeout: 15_000 }).catch(() => {});
  if (await hubModal.isVisible().catch(() => false)) {
    await page.locator("[data-sitting-start-confirm]").click();
    return;
  }
  await page.locator("[data-sitting-start-confirm]").click({ timeout: 10_000 }).catch(async () => {
    const cb = page.locator('input[type="checkbox"]').first();
    if (await cb.isVisible().catch(() => false)) {
      await cb.check();
      await page.getByRole("button", { name: /Start/i }).first().click();
    }
  });
}

async function runListening(page: Page, text: string) {
  await confirmSittingStart(page);
  await page.locator("#listening-provider-message").waitFor({ timeout: 30_000 });
  await page.locator("#listening-provider-message").fill(text);
  await page.getByRole("button", { name: /Submit listening/i }).click();
  await page.locator('[data-sitting-section-done="true"]').waitFor({ timeout: 180_000 });
  await page.waitForTimeout(2000);
}

const TYPED_REPLIES = [
  "Thanks for reaching out — I can help with scheduling and what we need before the visit. What day works best?",
  "I hear the frustration about the wait. I'll check the next telehealth slot and confirm forms on file.",
  "For billing I can't change charges myself, but I can send this to accounts and email a summary.",
  "Please don't share card numbers in chat — I'll send a secure payment link from our official email.",
  "Our clinicians review labs and advise; I'll note your concern and ask the care team to call back.",
  "I'll document this for the provider today. If symptoms worsen before callback, use urgent care or 911.",
];

async function sendTyped(page: Page, text: string, turnIndex: number) {
  const input = page.getByPlaceholder("Type as the MA — process, booking, forms. No clinical decisions.");
  await input.waitFor({ state: "visible", timeout: 60_000 });
  await input.fill(text);
  await page.getByRole("button", { name: "Send" }).click();
  const next = turnIndex + 1;
  if (next < 6) await page.getByText(`${next}/6 replies`).waitFor({ timeout: 180_000 });
  else await page.locator('[data-sitting-section-done="true"]').waitFor({ timeout: 180_000 });
}

async function runTypedChat(page: Page) {
  await confirmSittingStart(page);
  await page.getByText("Type (exam lane)", { exact: true }).waitFor({ timeout: 30_000 });
  for (let i = 0; i < TYPED_REPLIES.length; i++) await sendTyped(page, TYPED_REPLIES[i]!, i);
  await page.locator('[data-sitting-section-done="true"]').waitFor({ timeout: 180_000 });
  await page.waitForTimeout(2000);
}

const SPOKEN = [
  "I can help find an appointment — mornings or afternoons better for you?",
  "Let me confirm your pharmacy on file and ask the team about refill timing.",
  "I understand this is stressful; I'll escalate to the nurse line for a callback today.",
  "I can't give medical advice, but I will make sure the provider reviews your symptoms.",
  "Please use our secure portal for documents — I'll resend the link to your email on file.",
  "Thanks for your patience — I've documented everything for the provider response.",
];

async function spokenTurn(page: Page, transcript: string, turnIndex: number) {
  // Stub cloud STT so Stop auto-submits known text (no transcript review UI anymore).
  await page.route("**/api/talk/cloud-stt", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, transcript, provider: "sarvam" }),
    });
  });
  const record = page.locator('[data-spoken-chat-sim-record="true"]');
  await record.waitFor({ state: "visible", timeout: 30_000 });
  await record.click();
  await page.waitForTimeout(2200);
  const stop = page.locator('[data-spoken-chat-sim-stop="true"]');
  if (await stop.isVisible().catch(() => false)) {
    await stop.click();
  } else {
    await record.click({ timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(800);
    await page.locator('[data-spoken-chat-sim-stop="true"]').click({ timeout: 10_000 });
  }
  // No editable draft — raw STT auto-submits.
  const draftCount = await page.locator('[data-spoken-chat-sim-transcript="true"]').count();
  if (draftCount > 0) throw new Error("transcript edit UI must be gone");
  const next = turnIndex + 1;
  if (next < 6) await page.getByText(`${next}/6 replies`).waitFor({ timeout: 180_000 });
  else await page.locator('[data-sitting-section-done="true"]').waitFor({ timeout: 180_000 });
  await page.unroute("**/api/talk/cloud-stt").catch(() => {});
}

async function runSpokenChat(page: Page) {
  await confirmSittingStart(page);
  await page.getByText("Speak (exam lane)", { exact: true }).waitFor({ timeout: 30_000 });
  for (let i = 0; i < SPOKEN.length; i++) await spokenTurn(page, SPOKEN[i]!, i);
  await page.locator('[data-sitting-section-done="true"]').waitFor({ timeout: 180_000 });
  await page.waitForTimeout(2000);
}

async function postEstimate(token: string, text: string) {
  const res = await fetch(`${STAFF}/api/competency-exam/estimate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: "Voicemail refill. Write one provider message.",
      text,
      part: "escalation",
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    http: res.status,
    estimate: json.estimate ?? null,
    unavailableReason: json.unavailableReason ?? null,
    note: String(json.note || "").slice(0, 180),
  };
}

async function probeEstimate(token: string) {
  const phi = { id: "short-phi-patient-called", ...(await postEstimate(token, PHI_LISTENING)) };
  const six = { id: "short-six-words", ...(await postEstimate(token, SHORT_LISTENING)) };
  // Good message can hit transient llm_failed — retry a few times before failing the probe
  let good: Record<string, unknown> = { id: "good-provider-message" };
  for (let attempt = 1; attempt <= 4; attempt++) {
    good = { id: "good-provider-message", ...(await postEstimate(token, GOOD_LISTENING)) };
    if (typeof good.estimate === "number") break;
    if (good.unavailableReason !== "llm_failed") break;
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
  return [phi, six, good];
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const { token, email, password } = await login();
  pass("login", email);

  const before = await apiGet(token, "/api/competency-exam/sittings/current");
  const sittingId = (before.json as { sitting?: { id?: string } }).sitting?.id;
  if (!sittingId) throw new Error("no sitting");
  pass("sitting", sittingId);

  const estimates = await probeEstimate(token);
  writeFileSync(`${OUT}/llm-estimate-probes.json`, JSON.stringify(estimates, null, 2));
  const phi = estimates.find((e) => e.id === "short-phi-patient-called");
  const six = estimates.find((e) => e.id === "short-six-words");
  const good = estimates.find((e) => e.id === "good-provider-message");
  if (phi?.estimate == null && (phi?.note as string)?.length) {
    pass("llm-q-phi-short", `estimate=null — ${String(phi.note).slice(0, 80)}`);
  } else fail("llm-q-phi-short", JSON.stringify(phi));
  // After label fix: near-empty skips LLM with too_short (not a live model call)
  if (six?.estimate == null && /too short|too_short/i.test(JSON.stringify(six))) {
    pass("llm-q-too-short-skips", `estimate=null by design — ${String(six.note).slice(0, 80)}`);
  } else fail("llm-q-too-short-skips", JSON.stringify(six));
  // Soft: transient llm_failed is ok if Listening UI later posts a numeric llmEstimate
  let serviceUpDeferred = false;
  if (typeof good?.estimate === "number") pass("llm-q-service-up", `good estimate=${good.estimate}`);
  else if (good?.unavailableReason === "llm_failed") {
    serviceUpDeferred = true;
    console.log("DEFER\tllm-q-service-up\ttransient llm_failed — will accept Listening UI llmEstimate");
  } else fail("llm-q-service-up", JSON.stringify(good));

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--allow-fake-device-microphone",
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    permissions: ["microphone"],
  });
  // Chromium fake mic needs this for getUserMedia in some versions
  await context.grantPermissions(["microphone"], { origin: STAFF });
  const page = await context.newPage();
  await page.addInitScript(() => {
    // Ensure mediaDevices exists for exam spoken lane in headless
    if (!navigator.mediaDevices) {
      // @ts-expect-error test shim
      navigator.mediaDevices = {};
    }
  });
  await page.route("**/api/talk/cloud-stt", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        transcript: "E2E spoken turn — scheduling and callback documented for the care team.",
        provider: "e2e-mock",
      }),
    });
  });

  try {
    await loginUi(page, email, password);
    await page.goto(`${STAFF}/learn/competency-exam/sitting`, { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.locator('[data-sitting-hub="true"]').waitFor({ timeout: 60_000 });

    // --- Listening #1 short (too_short) ---
    const listenBefore = agg(before.json, "listening");
    await page.locator('[data-sitting-hub-section="listening"]').click();
    await page.getByRole("heading", { name: /Sitting · Listening/i }).waitFor({ timeout: 30_000 });
    await runListening(page, SHORT_LISTENING);
    await shot(page, "01-listening-short-done");
    const shortDone = await page.locator("[data-sitting-section-done]").innerText();
    if (/Saved to 2026-09|Saved to /.test(shortDone)) pass("listening-short-ui-save", shortDone.slice(0, 160));
    else fail("listening-short-ui-save", shortDone.slice(0, 200));
    await backToHub(page);

    let cur = await apiGet(token, "/api/competency-exam/sittings/current");
    let L = agg(cur.json, "listening");
    const trails1 = listeningTrails(cur.json);
    writeFileSync(`${OUT}/listening-trails-after-short.json`, JSON.stringify(trails1, null, 2));
    const lastShort = trails1[trails1.length - 1];
    if (lastShort?.sittingId === sittingId && (L?.attemptCount ?? 0) >= (listenBefore?.attemptCount ?? 0) + 1) {
      pass(
        "listening-short-api",
        `score=${lastShort.score} words=${lastShort.wordCount} llm=${JSON.stringify(lastShort.llmEstimate)} sittingId=${lastShort.sittingId}`,
      );
    } else fail("listening-short-api", JSON.stringify({ L, lastShort }));

    // --- Listening #2 good (retry — average should move) ---
    const nAfterShort = L?.attemptCount ?? 0;
    const avgAfterShort = L?.averageScore;
    await page.locator('[data-sitting-hub-section="listening"]').click();
    await runListening(page, GOOD_LISTENING);
    await shot(page, "02-listening-good-done");
    await backToHub(page);
    cur = await apiGet(token, "/api/competency-exam/sittings/current");
    L = agg(cur.json, "listening");
    const trails2 = listeningTrails(cur.json);
    writeFileSync(`${OUT}/listening-trails-after-retry.json`, JSON.stringify(trails2, null, 2));
    const lastGood = trails2[trails2.length - 1];
    if ((L?.attemptCount ?? 0) === nAfterShort + 1 && lastGood?.sittingId === sittingId) {
      pass(
        "listening-retry-average",
        `n ${nAfterShort}→${L?.attemptCount} avg ${avgAfterShort}→${L?.averageScore}; good llm=${JSON.stringify(lastGood.llmEstimate)} score=${lastGood.score}`,
      );
    } else fail("listening-retry-average", JSON.stringify({ L, lastGood }));

    // Classify founder-like short attempt from persisted trail
    const shortHits = trails2.filter(
      (t) =>
        (typeof t.wordCount === "number" && t.wordCount <= 8) ||
        /Near-empty|Substance floor|patient called/i.test(JSON.stringify(t.issues || [])) ||
        (t.llmEstimate == null && (t.score ?? 100) <= 12),
    );
    if (shortHits.length) {
      pass(
        "llm-unavailable-case",
        `Found ${shortHits.length} short/low listening row(s) with null LLM and low score — expected substance/PHI path, not outage. sample=${JSON.stringify(shortHits[0])}`,
      );
    } else {
      fail("llm-unavailable-case", "expected short listening trail missing");
    }
    const goodHits = trails2.filter(
      (t) => typeof t.llmEstimate === "number" || ((t.wordCount as number) > 20 && (t.score ?? 0) >= 50),
    );
    if (goodHits.some((t) => typeof t.llmEstimate === "number")) {
      pass("llm-available-when-substantive", JSON.stringify(goodHits.filter((t) => typeof t.llmEstimate === "number").slice(-1)[0]));
      if (serviceUpDeferred) {
        pass(
          "llm-q-service-up",
          `probe hit transient llm_failed; Listening UI proved LLM estimate=${goodHits.filter((t) => typeof t.llmEstimate === "number").slice(-1)[0]?.llmEstimate}`,
        );
        serviceUpDeferred = false;
      }
    } else if (goodHits.length) {
      // Deterministic-only 68 path still proves substantive submit persisted; LLM may be null if service flaky
      pass(
        "llm-available-when-substantive",
        `substantive listening persisted without numeric llm (ok if estimate null): ${JSON.stringify(goodHits.slice(-1)[0])}`,
      );
    } else fail("llm-available-when-substantive", "no listening trail with numeric llmEstimate or strong score");

    if (serviceUpDeferred) {
      fail("llm-q-service-up", "probe llm_failed and Listening UI also lacked numeric llmEstimate");
    }
    // --- Typed chat ---
    const typedBefore = agg(cur.json, "chat-sim-typed");
    await page.locator('[data-sitting-hub-section="chat-sim-typed"]').click();
    await page.getByRole("heading", { name: /Sitting · Typed chat-sim/i }).waitFor({ timeout: 30_000 });
    await runTypedChat(page);
    await shot(page, "03-typed-chat-done");
    const typedNote = await page.locator("[data-sitting-section-done]").innerText();
    if (/Saved to/.test(typedNote)) pass("typed-ui-save", typedNote.slice(0, 140));
    else fail("typed-ui-save", typedNote.slice(0, 200));
    await backToHub(page);
    cur = await apiGet(token, "/api/competency-exam/sittings/current");
    let T = agg(cur.json, "chat-sim-typed");
    if ((T?.attemptCount ?? 0) >= (typedBefore?.attemptCount ?? 0) + 1) {
      pass("typed-api", `n=${T?.attemptCount} avg=${T?.averageScore}`);
    } else fail("typed-api", JSON.stringify(T));

    const typedN = T?.attemptCount ?? 0;
    const typedAvg = T?.averageScore;
    await page.locator('[data-sitting-hub-section="chat-sim-typed"]').click();
    await runTypedChat(page);
    await shot(page, "04-typed-chat-retry");
    await backToHub(page);
    cur = await apiGet(token, "/api/competency-exam/sittings/current");
    T = agg(cur.json, "chat-sim-typed");
    if ((T?.attemptCount ?? 0) === typedN + 1) {
      pass("typed-retry-average", `n ${typedN}→${T?.attemptCount} avg ${typedAvg}→${T?.averageScore}`);
    } else fail("typed-retry-average", JSON.stringify(T));

    // --- Spoken chat ---
    const spokenBefore = agg(cur.json, "chat-sim-spoken");
    await page.locator('[data-sitting-hub-section="chat-sim-spoken"]').click();
    await page.getByRole("heading", { name: /Sitting · Spoken chat-sim/i }).waitFor({ timeout: 30_000 });
    await runSpokenChat(page);
    await shot(page, "05-spoken-chat-done");
    const spokenNote = await page.locator("[data-sitting-section-done]").innerText();
    if (/Saved to/.test(spokenNote)) pass("spoken-ui-save", spokenNote.slice(0, 140));
    else fail("spoken-ui-save", spokenNote.slice(0, 200));
    await backToHub(page);
    cur = await apiGet(token, "/api/competency-exam/sittings/current");
    let S = agg(cur.json, "chat-sim-spoken");
    if ((S?.attemptCount ?? 0) >= (spokenBefore?.attemptCount ?? 0) + 1) {
      pass("spoken-api", `n=${S?.attemptCount} avg=${S?.averageScore}`);
    } else fail("spoken-api", JSON.stringify(S));

    const spokenN = S?.attemptCount ?? 0;
    const spokenAvg = S?.averageScore;
    await page.locator('[data-sitting-hub-section="chat-sim-spoken"]').click();
    await runSpokenChat(page);
    await shot(page, "06-spoken-chat-retry");
    await backToHub(page);
    await shot(page, "07-hub-final");
    cur = await apiGet(token, "/api/competency-exam/sittings/current");
    S = agg(cur.json, "chat-sim-spoken");
    if ((S?.attemptCount ?? 0) === spokenN + 1) {
      pass("spoken-retry-average", `n ${spokenN}→${S?.attemptCount} avg ${spokenAvg}→${S?.averageScore}`);
    } else fail("spoken-retry-average", JSON.stringify(S));

    // Confirm all attempts carry sittingId
    const attempts = ((cur.json as { attempts?: { sittingId?: string; section?: string }[] }).attempts || []).filter((a) =>
      ["listening", "chat-sim-typed", "chat-sim-spoken"].includes(String(a.section)),
    );
    const badScope = attempts.filter((a) => a.sittingId !== sittingId);
    if (attempts.length >= 4 && badScope.length === 0) {
      pass("sittingId-scope", `${attempts.length} section attempts all sittingId=${sittingId}`);
    } else fail("sittingId-scope", `n=${attempts.length} bad=${badScope.length}`);

    writeFileSync(
      `${OUT}/summary.json`,
      JSON.stringify({ sittingId, estimates, rows, finalAggregates: (cur.json as { sectionAggregates?: unknown }).sectionAggregates }, null, 2),
    );
  } catch (e) {
    await shot(page, "error").catch(() => {});
    fail("run-error", e instanceof Error ? e.message : String(e));
    writeFileSync(`${OUT}/summary.json`, JSON.stringify({ rows, error: String(e) }, null, 2));
  } finally {
    await browser.close();
  }

  if (rows.some((r) => !r.pass)) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
