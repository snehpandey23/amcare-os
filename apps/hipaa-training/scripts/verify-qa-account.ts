/**
 * Authenticated production verify using the dedicated QA/test account only.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-qa-account.ts
 *
 * Does NOT accept or print founder personal credentials.
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || process.env.QA_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || process.env.QA_STAFF_URL || "https://siya-staff-assist.vercel.app").replace(
  /\/$/,
  "",
);
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/qa-account-verify.json",
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
  const email = (process.env.ASSIST_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL || process.env.QA_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD || process.env.QA_PASSWORD || "").trim();
  if (!email || !password) {
    fail("creds", "ASSIST_EMAIL/ASSIST_PASSWORD (or STAFF_PORTAL_QA_*) required via .env.agent-qa or CI secrets");
    process.exit(1);
  }
  if (!/qa|test/i.test(email)) {
    fail("creds-qa-only", `Refusing non-QA email pattern: ${email}`);
    process.exit(1);
  }
  pass("creds-qa-only", email);

  const health = await fetch(`${AUTH}/api/health`).then((r) => r.json()) as {
    ok?: boolean;
    registerOpen?: boolean;
    service?: string;
  };
  if (health.ok && health.service === "hipaa-training-api") {
    pass("health", `registerOpen=${health.registerOpen}`);
  } else {
    fail("health", JSON.stringify(health));
  }
  if (health.registerOpen === true) {
    fail("register-closed", "Public registration is open — should be false after QA bootstrap");
  } else {
    pass("register-closed", "self-registration disabled");
  }

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
  if (login.user.role !== "admin") {
    fail("admin-role", `expected admin, got ${login.user.role}`);
  } else {
    pass("admin-role", "admin");
  }
  if (/QA|test|automated|do not use/i.test(login.user.name || "")) {
    pass("display-name-warning", login.user.name || "");
  } else {
    fail("display-name-warning", `name missing QA warning label: ${login.user.name}`);
  }

  const rosterRes = await fetch(`${AUTH}/api/admin/team/roster`, {
    headers: { Authorization: `Bearer ${login.token}` },
  });
  const roster = (await rosterRes.json()) as { members?: { email?: string; portalRole?: string }[]; error?: string };
  if (!rosterRes.ok) {
    fail("admin-roster", roster.error || `HTTP ${rosterRes.status}`);
  } else {
    const me = (roster.members || []).find((m) => m.email === email);
    pass("admin-roster", `members=${(roster.members || []).length} selfRole=${me?.portalRole}`);
  }

  const day = new Date().toISOString().slice(0, 10);
  const entryId = `qa-verify-${Date.now()}`;
  const progress = {
    streak: 1,
    lastActiveDate: day,
    completedToday: ["trivia"],
    totalXp: 10,
    lifetimeDrills: { trivia: 1 },
    dayLedger: [
      {
        id: entryId,
        date: day,
        drill: "trivia",
        at: Date.now(),
        xpAwarded: 10,
        shareDecision: "yes" as const,
      },
    ],
  };
  const putRes = await fetch(`${AUTH}/api/level-up/progress`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${login.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(progress),
  });
  const put = (await putRes.json()) as { ok?: boolean; error?: string };
  if (!putRes.ok || !put.ok) {
    fail("level-up-put", put.error || `HTTP ${putRes.status}`);
  } else {
    pass("level-up-put", "day ledger with shareDecision=yes");
  }

  const getRes = await fetch(`${AUTH}/api/level-up/progress`, {
    headers: { Authorization: `Bearer ${login.token}` },
  });
  const got = (await getRes.json()) as {
    progress?: { dayLedger?: { id?: string; shareDecision?: string; drill?: string }[]; totalXp?: number };
  };
  const ledger = got.progress?.dayLedger || [];
  const hit = ledger.find((e) => e.id === entryId && e.shareDecision === "yes");
  if (hit) {
    pass("level-up-shared-ledger", `drill=${hit.drill} xp=${got.progress?.totalXp}`);
  } else {
    fail("level-up-shared-ledger", `entry ${entryId} not found with share=yes`);
  }

  // Staff app serves login (public) — proves deploy alias
  const staffLogin = await fetch(`${STAFF}/login`);
  if (staffLogin.ok) pass("staff-app", `${STAFF}/login HTTP ${staffLogin.status}`);
  else fail("staff-app", `HTTP ${staffLogin.status}`);

  const failed = rows.filter((r) => !r.pass);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        account: email,
        note: "QA/test only — do not use for real patient or business data",
        auth: AUTH,
        staff: STAFF,
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
  console.log("verify-qa-account: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
