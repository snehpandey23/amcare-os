/**
 * Verify product tour sandbox isolation:
 * - tourMode feedback → no team_feedback row, no Resend
 * - tourMode level-up PUT → no progress write
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-product-tour-sandbox.ts
 */
import { createHash } from "crypto";
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/product-tour-sandbox.json",
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

function fingerprintProgress(progress: unknown): string {
  return createHash("sha256").update(JSON.stringify(progress ?? null)).digest("hex").slice(0, 16);
}

async function main() {
  const email = (process.env.ASSIST_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD || "").trim();
  if (!email || !password) {
    fail("creds", "QA credentials missing (source scripts/agent-qa-env.sh)");
    process.exit(1);
  }
  if (!/qa|test/i.test(email)) {
    fail("creds-qa-only", `Refusing non-QA email: ${email}`);
    process.exit(1);
  }
  pass("creds-qa-only", email);

  const loginRes = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const login = (await loginRes.json()) as { token?: string; error?: string };
  if (!loginRes.ok || !login.token) {
    fail("login", login.error || `HTTP ${loginRes.status}`);
    process.exit(1);
  }
  const token = login.token;
  pass("login", "QA token acquired");

  const authHeaders = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const inboxBeforeRes = await fetch(`${AUTH}/api/team-feedback/inbox`, { headers: authHeaders });
  const inboxBefore = (await inboxBeforeRes.json()) as { items?: { id: string }[] };
  const inboxCountBefore = inboxBefore.items?.length ?? 0;
  pass("inbox-before", `${inboxCountBefore} items`);

  const progressBeforeRes = await fetch(`${AUTH}/api/level-up/progress`, { headers: authHeaders });
  const progressBefore = (await progressBeforeRes.json()) as { progress?: unknown };
  const progressFpBefore = fingerprintProgress(progressBefore.progress);
  pass("progress-before", `fp=${progressFpBefore}`);

  const tourBody =
    "[Product tour practice] Sandbox verify — no real recipient, no email, no DB row.";
  const feedbackAuthRes = await fetch(`${AUTH}/api/team-feedback`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ tourMode: true, body: tourBody, anonymous: false }),
  });
  const feedbackAuth = (await feedbackAuthRes.json()) as {
    tourMode?: boolean;
    recipientFacing?: { id: string };
    error?: string;
  };
  if (!feedbackAuthRes.ok || !feedbackAuth.tourMode || !feedbackAuth.recipientFacing?.id) {
    fail("feedback-auth-tour", feedbackAuth.error || `HTTP ${feedbackAuthRes.status}`);
  } else if (!feedbackAuth.recipientFacing.id.startsWith("tour-demo-")) {
    fail("feedback-auth-id", `Unexpected id: ${feedbackAuth.recipientFacing.id}`);
  } else {
    pass("feedback-auth-tour", feedbackAuth.recipientFacing.id);
  }

  const feedbackBffRes = await fetch(`${STAFF}/api/team-feedback`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ tourMode: true, body: tourBody, anonymous: true }),
  });
  const feedbackBff = (await feedbackBffRes.json()) as {
    tourMode?: boolean;
    email?: { sent?: boolean; error?: string };
    recipientFacing?: { id: string };
    error?: string;
  };
  if (!feedbackBffRes.ok || !feedbackBff.tourMode) {
    fail("feedback-bff-tour", feedbackBff.error || `HTTP ${feedbackBffRes.status}`);
  } else if (feedbackBff.email?.sent) {
    fail("feedback-bff-email", "Resend reported sent=true in tour mode");
  } else {
    pass(
      "feedback-bff-tour",
      `email.sent=${feedbackBff.email?.sent ?? false} err=${feedbackBff.email?.error ?? "none"}`,
    );
  }

  const inboxAfterRes = await fetch(`${AUTH}/api/team-feedback/inbox`, { headers: authHeaders });
  const inboxAfter = (await inboxAfterRes.json()) as { items?: { id: string }[] };
  const inboxCountAfter = inboxAfter.items?.length ?? 0;
  if (inboxCountAfter !== inboxCountBefore) {
    fail("inbox-unchanged", `before=${inboxCountBefore} after=${inboxCountAfter}`);
  } else {
    pass("inbox-unchanged", `${inboxCountAfter} items`);
  }

  const fakeProgress = {
    ...(typeof progressBefore.progress === "object" && progressBefore.progress !== null
      ? (progressBefore.progress as Record<string, unknown>)
      : {}),
    totalXp: 999_999,
    streak: 999,
    lastActiveDate: new Date().toISOString().slice(0, 10),
    completedToday: ["typing"],
    dayLedger: [
      {
        id: "tour-verify-fake",
        date: new Date().toISOString().slice(0, 10),
        drill: "typing",
        at: Date.now(),
        xpAwarded: 10,
      },
    ],
  };

  const tourPutRes = await fetch(`${AUTH}/api/level-up/progress`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({ tourMode: true, progress: fakeProgress }),
  });
  const tourPut = (await tourPutRes.json()) as { ok?: boolean; skipped?: boolean; reason?: string };
  if (!tourPutRes.ok || !tourPut.skipped) {
    fail("progress-tour-put", JSON.stringify(tourPut));
  } else {
    pass("progress-tour-put", tourPut.reason || "skipped");
  }

  const progressAfterRes = await fetch(`${AUTH}/api/level-up/progress`, { headers: authHeaders });
  const progressAfter = (await progressAfterRes.json()) as { progress?: unknown };
  const progressFpAfter = fingerprintProgress(progressAfter.progress);
  if (progressFpAfter !== progressFpBefore) {
    fail("progress-unchanged", `before=${progressFpBefore} after=${progressFpAfter}`);
  } else {
    pass("progress-unchanged", `fp=${progressFpAfter}`);
  }

  const modId = feedbackAuth.recipientFacing?.id;
  if (modId) {
    const modRes = await fetch(`${AUTH}/api/admin/team-feedback/moderation/${modId}`, {
      headers: authHeaders,
    });
    if (modRes.status === 200) {
      fail("feedback-no-db-row", `Moderation found tour id ${modId}`);
    } else {
      pass("feedback-no-db-row", `moderation HTTP ${modRes.status}`);
    }
  }

  mkdirSync(dirname(OUT), { recursive: true });
  const allPass = rows.every((r) => r.pass);
  writeFileSync(
    OUT,
    JSON.stringify({ at: new Date().toISOString(), allPass, rows, endpoints: { AUTH, STAFF } }, null, 2),
  );
  console.log(`\nWrote ${OUT}`);
  if (!allPass) process.exit(1);
  console.log("\nAll product tour sandbox checks passed.");
}

void main();
