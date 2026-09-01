/**
 * End-to-end prod verify with QA service account only:
 * login → practice day-ledger + weekly report fingerprint → Ask chat → admin roster.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-qa-e2e-practice-ask.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";
import { buildWeeklyPracticeReport } from "../src/lib/level-up/weekly-report";
import type { LevelUpProgress } from "../src/lib/level-up/progress";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/qa-e2e-practice-ask.json",
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
  const login = (await loginRes.json()) as {
    token?: string;
    user?: { email?: string; role?: string; name?: string; id?: string };
    error?: string;
  };
  if (!loginRes.ok || !login.token || !login.user) {
    fail("login", login.error || `HTTP ${loginRes.status}`);
    process.exit(1);
  }
  pass("login", `${login.user.email} role=${login.user.role}`);
  if (login.user.role !== "admin") fail("role-admin", `got ${login.user.role}`);
  else pass("role-admin", "admin covers staff + Team admin surfaces");

  const token = login.token;
  const day = new Date().toISOString().slice(0, 10);
  const entryId = `qa-e2e-${Date.now()}`;
  const progress: LevelUpProgress = {
    streak: 2,
    lastActiveDate: day,
    completedToday: ["trivia", "typing"],
    totalXp: 35,
    lifetimeDrills: { trivia: 2, typing: 1 },
    dayLedger: [
      {
        id: `${entryId}-a`,
        date: day,
        drill: "trivia",
        at: Date.now() - 60_000,
        xpAwarded: 10,
        shareDecision: "yes",
      },
      {
        id: `${entryId}-b`,
        date: day,
        drill: "typing",
        at: Date.now(),
        xpAwarded: 15,
        wpm: 42,
        accuracy: 0.96,
        shareDecision: "no",
      },
    ],
  };

  const putRes = await fetch(`${AUTH}/api/level-up/progress`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(progress),
  });
  const put = (await putRes.json()) as { ok?: boolean; error?: string };
  if (!putRes.ok || !put.ok) fail("practice-put", put.error || `HTTP ${putRes.status}`);
  else pass("practice-put", "shared trivia + private typing in dayLedger");

  const getRes = await fetch(`${AUTH}/api/level-up/progress`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const got = (await getRes.json()) as { progress?: LevelUpProgress };
  const stored = got.progress;
  if (!stored?.dayLedger?.some((e) => e.id === `${entryId}-a` && e.shareDecision === "yes")) {
    fail("practice-get", "shared entry missing after GET");
  } else {
    pass("practice-get", `ledger=${stored.dayLedger?.length} xp=${stored.totalXp}`);
  }

  const subject = login.user.name || email;
  const staffReport = buildWeeklyPracticeReport(stored || progress, {
    subjectLabel: subject,
  });
  const adminReport = buildWeeklyPracticeReport(stored || progress, {
    subjectLabel: `${subject} (admin view)`,
  });
  const sharedN = staffReport.sharedEvents.length;
  const privateN = (stored?.dayLedger || []).filter((e) => e.shareDecision === "no").length;
  if (staffReport.contentFingerprint === adminReport.contentFingerprint && sharedN >= 1) {
    pass(
      "weekly-report",
      `sharedEvents=${sharedN} privateInLedger=${privateN} daysShared=${staffReport.drillDaysShared} fp=${staffReport.contentFingerprint}`,
    );
  } else {
    fail(
      "weekly-report",
      `fp mismatch or no shared rows staff=${staffReport.contentFingerprint} admin=${adminReport.contentFingerprint} shared=${sharedN}`,
    );
  }

  const rosterRes = await fetch(`${AUTH}/api/admin/team/roster`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const roster = (await rosterRes.json()) as {
    members?: { email?: string; portalRole?: string }[];
    error?: string;
  };
  if (!rosterRes.ok) fail("admin-roster", roster.error || `HTTP ${rosterRes.status}`);
  else {
    const me = (roster.members || []).find((m) => m.email === email);
    pass("admin-roster", `members=${(roster.members || []).length} self=${me?.portalRole || "?"}`);
  }

  const threadId = `qa-e2e-${Date.now()}`;
  // Use a known-covered / non-gap ask — never PTO/leave (HR handbook blocked).
  // Include synthetic probe token so any accidental soft-stop stays dry_run + auto-resolved.
  const chatRes = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "Where do I find brand style tokens for Siya Health social posts? Keep it short. auto-probe",
      history: [],
      surface: "default",
      threadId,
    }),
  });
  const chat = (await chatRes.json()) as {
    message?: string;
    error?: string;
    knowledgeGap?: boolean;
    routing?: { department?: string };
    gapAuto?: { id?: string; emailDelivery?: string; autoResolved?: boolean; syntheticProbe?: boolean };
  };
  if (!chatRes.ok || !chat.message || chat.message.trim().length < 20) {
    fail("ask-chat", chat.error || `HTTP ${chatRes.status} empty reply`);
  } else {
    const clip = chat.message.replace(/\s+/g, " ").trim().slice(0, 160);
    pass(
      "ask-chat",
      `dept=${chat.routing?.department || "?"} gap=${Boolean(chat.knowledgeGap)} reply=${clip}${chat.message.length > 160 ? "…" : ""}`,
    );
  }
  if (chat.knowledgeGap && chat.gapAuto?.emailDelivery === "live") {
    fail("ask-no-live-gap-email", `QA probe must not live-email founder; got ${JSON.stringify(chat.gapAuto)}`);
  } else if (chat.knowledgeGap) {
    pass(
      "ask-no-live-gap-email",
      `soft-stop ok delivery=${chat.gapAuto?.emailDelivery || "n/a"} autoResolved=${chat.gapAuto?.autoResolved}`,
    );
  } else {
    pass("ask-no-live-gap-email", "answered without knowledgeGap");
  }

  const failed = rows.filter((r) => !r.pass);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        account: email,
        role: login.user.role,
        note: "QA/test only — do not use for real patient or business data",
        founderInvolvement: false,
        auth: AUTH,
        staff: STAFF,
        weeklyFingerprint: staffReport.contentFingerprint,
        passed: rows.filter((r) => r.pass).length,
        total: rows.length,
        rows,
        failed,
      },
      null,
      2,
    ),
  );
  console.log(`\nWrote ${OUT}`);
  if (failed.length) process.exit(1);
  console.log("verify-qa-e2e-practice-ask: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
