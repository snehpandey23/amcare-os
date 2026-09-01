/**
 * Four-turn presence / context carryover verify (Ask + Founder Talk).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-presence-thread-four.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import {
  detectAdminOpsIntent,
  isTeamPulseAsk,
  isAmbiguousStaffLoginDashboardQuery,
  historySuggestsPresenceTopic,
} from "../src/lib/siya-os/admin-ops-coach";
import { extractWhoIsName } from "../src/lib/siya-os/staff-identity-ask";
import { isConfusedAboutPriorAnswer } from "../src/lib/siya-os/compose-answer";
import { tryWorkplaceLinkLookup } from "../src/lib/siya-os/workplace-link-lookup";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/presence-thread-four.json",
);

const EMAIL = (process.env.ASSIST_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL || "").trim();
const PASSWORD = (process.env.ASSIST_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD || "").trim();

const TURNS = [
  "who all r online now",
  "who is loggin in",
  "wdym",
  "i wnna see the dashboard for login of staff",
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

function unitChecks() {
  if (isTeamPulseAsk("who all r online now") && detectAdminOpsIntent("who all r online now")?.kind === "team_pulse") {
    pass("unit-t1-intent", "team_pulse");
  } else fail("unit-t1-intent", String(detectAdminOpsIntent("who all r online now")?.kind));

  if (extractWhoIsName("who is loggin in") !== null) {
    fail("unit-t2-not-name", `extractWhoIsName=${extractWhoIsName("who is loggin in")}`);
  } else pass("unit-t2-not-name", "not a roster name");

  const hist1 = [{ role: "user" as const, content: "who all r online now" }];
  if (detectAdminOpsIntent("who is loggin in", hist1)?.kind === "team_pulse") {
    pass("unit-t2-intent", "team_pulse with/without history");
  } else if (isTeamPulseAsk("who is loggin in")) {
    pass("unit-t2-intent", "team_pulse standalone");
  } else fail("unit-t2-intent", "not team_pulse");

  if (isConfusedAboutPriorAnswer("wdym")) pass("unit-t3-wdym", "confused follow-up");
  else fail("unit-t3-wdym", "not recognized");

  if (isAmbiguousStaffLoginDashboardQuery("i wnna see the dashboard for login of staff")) {
    pass("unit-t4-ambiguous", "flagged ambiguous");
  } else fail("unit-t4-ambiguous", "not flagged");

  if (tryWorkplaceLinkLookup("i wnna see the dashboard for login of staff")) {
    fail("unit-t4-no-workplace", "workplace links stole ambiguous ask");
  } else pass("unit-t4-no-workplace", "workplace lookup skipped");

  const histPresence = [
    { role: "user" as const, content: "who all r online now" },
    { role: "assistant" as const, content: "Team pulse — on shift now: … Open **Team**." },
  ];
  if (
    historySuggestsPresenceTopic(histPresence) &&
    detectAdminOpsIntent("i wnna see the dashboard for login of staff", histPresence)?.kind ===
      "team_pulse"
  ) {
    pass("unit-t4-history-pulse", "presence history → team_pulse");
  } else fail("unit-t4-history-pulse", "did not stay on pulse");
}

async function login() {
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return data.token;
}

async function chat(
  surface: "default" | "founder-coach",
  token: string,
  message: string,
  history: { role: string; content: string }[],
) {
  const res = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, surface }),
  });
  const data = (await res.json()) as {
    message?: string;
    knowledgeGap?: boolean;
    routing?: { task?: string; department?: string };
    error?: string;
  };
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function assertPresenceish(label: string, data: { message?: string; knowledgeGap?: boolean; routing?: { task?: string } }) {
  const msg = (data.message || "").toLowerCase();
  const soft = /not sure i have the right staff guide|say what you.?re trying to get done/i.test(msg);
  const nameMiss = /don.?t see .+ on the staff roster/i.test(msg);
  const workplaceDump = /which system\? use these staff portals/i.test(msg);
  const presence =
    /team pulse|on shift|who.?s online|open \*\*team\*\*|team presence|working|live presence|presence/i.test(
      msg,
    ) ||
    /team presence|executive workspace/i.test(data.routing?.task || "");
  const clarifyPresence = /who.?s currently online|tool to log into|who.?s online|workplace links/i.test(msg);

  if (soft) {
    fail(label, "soft-stop");
    return false;
  }
  if (nameMiss) {
    fail(label, "name lookup miss");
    return false;
  }
  if (workplaceDump) {
    fail(label, "workplace links dump");
    return false;
  }
  if (presence || clarifyPresence) {
    pass(label, (data.routing?.task || "ok").slice(0, 60));
    return true;
  }
  fail(label, `unexpected: ${msg.slice(0, 160)}`);
  return false;
}

async function surfaceRun(surface: "default" | "founder-coach", token: string) {
  const history: { role: string; content: string }[] = [];
  for (let i = 0; i < TURNS.length; i++) {
    const turn = TURNS[i]!;
    const data = await chat(surface, token, turn, history);
    history.push({ role: "user", content: turn });
    history.push({ role: "assistant", content: data.message || "" });
    const id = `${surface}-t${i + 1}`;
    if (i === 2) {
      // wdym — must not soft-stop; presence re-anchor or confused clarify OK
      const msg = data.message || "";
      if (/not sure i have the right staff guide/i.test(msg)) fail(id, "soft-stop on wdym");
      else if (/don.?t see .+ roster/i.test(msg)) fail(id, "name lookup on wdym");
      else pass(id, msg.slice(0, 80).replace(/\n/g, " "));
    } else {
      assertPresenceish(id, data);
    }
    console.log(`--- ${id} ---\n${(data.message || "").slice(0, 280)}\n`);
  }
}

async function main() {
  unitChecks();
  if (!EMAIL || !PASSWORD || !/qa|test/i.test(EMAIL)) {
    fail("creds", "QA credentials required");
    process.exit(1);
  }
  const token = await login();
  pass("login", EMAIL);
  await surfaceRun("default", token);
  await surfaceRun("founder-coach", token);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify({ at: new Date().toISOString(), email: EMAIL, rows }, null, 2),
  );
  console.log(`\nWrote ${OUT}`);
  if (rows.some((r) => !r.pass)) process.exit(1);
  console.log("verify-presence-thread-four: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
