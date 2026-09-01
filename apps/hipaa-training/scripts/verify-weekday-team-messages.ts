/**
 * Weekday team message pilot verify — segments + Resend delivery (admin pilot-send).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-weekday-team-messages.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import { buildWeekdayMessage } from "../src/lib/team-weekday-messages";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/weekday-team-messages-verify.json",
);

const QA_GIVER = (process.env.ASSIST_EMAIL || "qa-test@siya.health").trim();
const QA_GIVER_PW = (process.env.ASSIST_PASSWORD || "").trim();
const QA_INBOX = "qa-feedback-inbox@siya.health";
const QA_INBOX_PW = process.env.QA_FEEDBACK_INBOX_PASSWORD || "QaFeedbackInbox!2026";

const THEMES = [
  "motivational_monday",
  "therapeutic_tuesday",
  "working_wednesday",
  "thoughtful_thursday",
  "feedback_friday",
] as const;

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

async function login(email: string, password: string) {
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; user?: { id: string }; error?: string };
  if (!res.ok || !data.token || !data.user) throw new Error(data.error || `login ${email}`);
  return { token: data.token, userId: data.user.id };
}

async function usage(token: string, email: string) {
  const res = await fetch(`${AUTH}/api/admin/weekday-messages/usage?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as {
    segment?: string;
    askTurnsLast14d?: number;
    askTurnsLast30d?: number;
    practiceLifetime?: number;
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || `usage ${email}`);
  return data;
}

async function pilotSend(token: string, body: Record<string, unknown>) {
  const res = await fetch(`${STAFF}/api/admin/weekday-messages/pilot-send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await res.json()) as {
    ok?: boolean;
    sentCount?: number;
    results?: {
      email: string;
      theme: string;
      segment: string;
      sent: boolean;
      resendId?: string;
      error?: string;
      subject?: string;
    }[];
    error?: string;
  };
}

async function main() {
  if (!QA_GIVER_PW) {
    fail("creds", "source scripts/agent-qa-env.sh");
    process.exit(1);
  }

  const admin = await login(QA_GIVER, QA_GIVER_PW);
  pass("admin-login", QA_GIVER);

  // Ensure qa-test has a recent Ask turn → regular_ask segment (thread must exist first)
  const threadRes = await fetch(`${AUTH}/api/assist/threads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${admin.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Weekday segment verify" }),
  });
  const threadData = (await threadRes.json()) as { thread?: { id?: string } };
  const threadId = threadData.thread?.id;
  if (threadId) {
    await fetch(`${STAFF}/api/chat`, {
      method: "POST",
      headers: { Authorization: `Bearer ${admin.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Weekday segment verify — what is late cancel policy? auto-probe",
        history: [],
        surface: "default",
        threadId,
      }),
    });
  }

  const reg = await usage(admin.token, QA_GIVER);
  if (reg.segment === "regular_ask") pass("segment-regular", `ask14=${reg.askTurnsLast14d}`);
  else fail("segment-regular", `expected regular_ask got ${reg.segment}`);

  let inboxUsage = await usage(admin.token, QA_INBOX);
  if (inboxUsage.segment === "new_ask" || inboxUsage.segment === "practice_bridge") {
    pass("segment-new-or-bridge", inboxUsage.segment);
  } else fail("segment-new", inboxUsage.segment || "?");

  const inboxLogin = await login(QA_INBOX, QA_INBOX_PW);
  const day = new Date().toISOString().slice(0, 10);
  await fetch(`${AUTH}/api/level-up/progress`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${inboxLogin.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      streak: 1,
      lastActiveDate: day,
      completedToday: ["trivia"],
      totalXp: 10,
      lifetimeDrills: { trivia: 3 },
      dayLedger: [{ id: `bridge-${Date.now()}`, date: day, drill: "trivia", at: Date.now(), xpAwarded: 10 }],
    }),
  });
  inboxUsage = await usage(admin.token, QA_INBOX);
  if (inboxUsage.segment === "practice_bridge") {
    pass("segment-practice-bridge", `practice=${inboxUsage.practiceLifetime} ask30=${inboxUsage.askTurnsLast30d}`);
  } else fail("segment-practice-bridge", inboxUsage.segment || "?");

  const friCopy = buildWeekdayMessage({ theme: "feedback_friday", segment: "new_ask", firstName: "Sam" });
  if (friCopy.text.includes("https://siya-staff-assist.vercel.app/feedback")) pass("feedback-url", "Friday links /feedback");
  else fail("feedback-url", friCopy.text.slice(0, 100));

  const monRegCopy = buildWeekdayMessage({ theme: "motivational_monday", segment: "regular_ask", firstName: "A" });
  const monNewCopy = buildWeekdayMessage({ theme: "motivational_monday", segment: "new_ask", firstName: "B" });
  if (monRegCopy.subject !== monNewCopy.subject) pass("monday-variant-diff", `${monNewCopy.subject} vs ${monRegCopy.subject}`);
  else fail("monday-variant-diff", "same subject");

  const all = await pilotSend(admin.token, { verifyAllThemes: true, mode: "pilot", skipMark: true, sendDate: "2099-01-01" });
  if (!all.ok) fail("send-all-themes", all.error || "failed");
  else {
    const sent = all.results?.filter((r) => r.sent) || [];
    for (const t of THEMES) {
      const hit = sent.find((r) => r.theme === t);
      if (hit?.resendId) pass(`send-${t}`, `resend=${hit.resendId} segment=${hit.segment} subject=${hit.subject}`);
      else fail(`send-${t}`, hit?.error || "not sent");
    }
    const fri = sent.find((r) => r.theme === "feedback_friday");
    if (fri) {
      const preview = buildWeekdayMessage({ theme: "feedback_friday", segment: fri.segment as "new_ask", firstName: "X" });
      if (preview.text.includes("/feedback")) pass("send-friday-feedback-link", "copy has /feedback");
    }
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        mode: "pilot",
        segments: { regular: reg, inbox: inboxUsage },
        sendAllThemes: all,
        passed: rows.filter((r) => r.pass).length,
        total: rows.length,
        rows,
      },
      null,
      2,
    ),
  );
  console.log(`\nWrote ${OUT}`);
  if (rows.some((r) => !r.pass)) process.exit(1);
  console.log("verify-weekday-team-messages: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
