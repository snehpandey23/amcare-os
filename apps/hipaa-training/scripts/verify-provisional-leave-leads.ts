/**
 * Three-tier leave provisional + department leads — live API dual-surface replay.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-provisional-leave-leads.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/provisional-leave-leads.json",
);

const email = (process.env.ASSIST_EMAIL || "").trim();
const password = (process.env.ASSIST_PASSWORD || "").trim();

type ChatRes = {
  message?: string;
  knowledgeGap?: boolean;
  answerTrust?: string;
  sources?: { title: string; id: string }[];
  routing?: { department?: string; task?: string };
  error?: string;
};

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
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return data.token;
}

async function chat(
  token: string,
  message: string,
  history: { role: string; content: string }[],
  surface: "default" | "founder-coach",
  threadId: string,
): Promise<ChatRes> {
  const res = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, surface, threadId }),
  });
  return (await res.json()) as ChatRes;
}

async function replay(surface: "default" | "founder-coach", token: string) {
  const prefix = surface === "default" ? "ask" : "talk";
  const threadId = `ath-prov-${surface}-${Date.now()}`;
  const history: { role: string; content: string }[] = [];

  // Ensure thread exists for persist
  await fetch(`${AUTH}/api/assist/threads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ title: `provisional verify ${surface}` }),
  }).catch(() => undefined);

  const t1 = await chat(token, "i want to take a leave tomorrow", history, surface, threadId);
  history.push({ role: "user", content: "i want to take a leave tomorrow" });
  history.push({ role: "assistant", content: t1.message || "" });

  if (t1.knowledgeGap) fail(`${prefix}-leave-no-gap`, "soft-stopped");
  else pass(`${prefix}-leave-no-gap`, "knowledgeGap=false");

  if (t1.answerTrust === "provisional") pass(`${prefix}-leave-trust`, "provisional");
  else fail(`${prefix}-leave-trust`, `got ${t1.answerTrust}`);

  const src = (t1.sources || []).map((s) => s.title).join(" | ");
  if (/HR · provisional stub|provisional stub/i.test(src)) pass(`${prefix}-leave-source`, src);
  else fail(`${prefix}-leave-source`, `sources=${src || "(none)"}`);

  if (/Clinical Operations/i.test(src) || /SOP · Clinical/i.test(t1.message || "")) {
    fail(`${prefix}-leave-no-clinical`, "Clinical Operations mislabel");
  } else pass(`${prefix}-leave-no-clinical`, "no Clinical Ops citation");

  if (
    /manager|HR/i.test(t1.message || "") &&
    /approval/i.test(t1.message || "") &&
    /not signed-off leave policy|Practical next steps only/i.test(t1.message || "")
  ) {
    pass(`${prefix}-leave-body`, "steps + disclaimer");
  } else fail(`${prefix}-leave-body`, (t1.message || "").slice(0, 200));

  const t2 = await chat(token, "who is HR manager", history, surface, threadId);
  history.push({ role: "user", content: "who is HR manager" });
  history.push({ role: "assistant", content: t2.message || "" });

  if (t2.knowledgeGap) fail(`${prefix}-hr-lead-no-gap`, "soft-stopped");
  else pass(`${prefix}-hr-lead-no-gap`, "ok");

  if (/don'?t publish a live\s+\*\*org chart\*\*/i.test(t2.message || "")) {
    fail(`${prefix}-hr-lead-no-orgchart`, "legacy org-chart copy");
  } else pass(`${prefix}-hr-lead-no-orgchart`, "not legacy");

  if (
    /HR lead|no lead assigned yet|department lead/i.test(t2.message || "") &&
    !/right staff guide for that yet/i.test(t2.message || "")
  ) {
    pass(`${prefix}-hr-lead-data`, (t2.message || "").replace(/\s+/g, " ").slice(0, 160));
  } else fail(`${prefix}-hr-lead-data`, (t2.message || "").slice(0, 200));

  const t3 = await chat(token, "dont u have leads info already", history, surface, threadId);

  if (t3.knowledgeGap) fail(`${prefix}-followup-no-gap`, "soft-stopped");
  else pass(`${prefix}-followup-no-gap`, "ok");

  if (/right staff guide for that yet|No approved guide yet/i.test(t3.message || "")) {
    fail(`${prefix}-followup-on-topic`, "fell to soft-stop");
  } else if (/department lead|assigned|portal/i.test(t3.message || "")) {
    pass(`${prefix}-followup-on-topic`, (t3.message || "").replace(/\s+/g, " ").slice(0, 160));
  } else fail(`${prefix}-followup-on-topic`, (t3.message || "").slice(0, 200));

  return { t1, t2, t3 };
}

async function main() {
  if (!email || !password || !/qa|test/i.test(email)) {
    fail("creds", "QA credentials via agent-qa-env.sh");
    process.exit(1);
  }
  const token = await login();
  pass("login", email);

  const ask = await replay("default", token);
  const talk = await replay("founder-coach", token);

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        ask: {
          leave: { trust: ask.t1.answerTrust, sources: ask.t1.sources, gap: ask.t1.knowledgeGap },
          hr: { gap: ask.t2.knowledgeGap, clip: (ask.t2.message || "").slice(0, 240) },
          followup: { gap: ask.t3.knowledgeGap, clip: (ask.t3.message || "").slice(0, 240) },
        },
        talk: {
          leave: { trust: talk.t1.answerTrust, sources: talk.t1.sources, gap: talk.t1.knowledgeGap },
          hr: { gap: talk.t2.knowledgeGap, clip: (talk.t2.message || "").slice(0, 240) },
          followup: { gap: talk.t3.knowledgeGap, clip: (talk.t3.message || "").slice(0, 240) },
        },
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
  console.log("verify-provisional-leave-leads: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
