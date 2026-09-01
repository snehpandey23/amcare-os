/**
 * Provisional patient→manager stub + leave regression — dual-surface live API.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-provisional-manager-stub.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(process.cwd(), ".cursor-verify/provisional-manager-stub.json");

const MANAGER_Q =
  "A patient wants to speak to a manager or supervisor — what should I do? Who do I escalate to?";

type ChatRes = {
  message?: string;
  knowledgeGap?: boolean;
  answerTrust?: string;
  sources?: { title: string; id: string }[];
  routing?: { department?: string; task?: string };
  error?: string;
};

const rows: { id: string; pass: boolean; detail: string }[] = [];
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
  const threadId = `ath-mgr-${surface}-${Date.now()}`;
  const history: { role: string; content: string }[] = [];

  await fetch(`${AUTH}/api/assist/threads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ title: `provisional manager verify ${surface}` }),
  }).catch(() => undefined);

  const t1 = await chat(token, MANAGER_Q, history, surface, threadId);
  history.push({ role: "user", content: MANAGER_Q });
  history.push({ role: "assistant", content: t1.message || "" });

  if (t1.knowledgeGap) fail(`${prefix}-mgr-no-gap`, "soft-stopped");
  else pass(`${prefix}-mgr-no-gap`, "knowledgeGap=false");

  if (t1.answerTrust === "provisional") pass(`${prefix}-mgr-trust`, "provisional");
  else fail(`${prefix}-mgr-trust`, `got ${t1.answerTrust}`);

  const src = (t1.sources || []).map((s) => s.title).join(" | ");
  if (/Clinical Ops · provisional stub/i.test(src)) pass(`${prefix}-mgr-source`, src);
  else fail(`${prefix}-mgr-source`, `sources=${src || "(none)"}`);

  if ((t1.sources || []).length === 1 && t1.sources![0]?.id === "patient-manager-request-provisional") {
    pass(`${prefix}-mgr-cite-only`, t1.sources![0].id);
  } else fail(`${prefix}-mgr-cite-only`, JSON.stringify(t1.sources));

  const msg = t1.message || "";
  if (/Clinical Program Manager/i.test(msg)) pass(`${prefix}-mgr-cpm`, "CPM named");
  else fail(`${prefix}-mgr-cpm`, msg.slice(0, 240));

  if (/one\s+resolution\s+attempt/i.test(msg) && /Escalate immediately/i.test(msg)) {
    pass(`${prefix}-mgr-attempt`, "attempt vs immediate");
  } else fail(`${prefix}-mgr-attempt`, msg.slice(0, 240));

  if (/Document/i.test(msg) && /Spruce|EHR/i.test(msg)) pass(`${prefix}-mgr-doc`, "document step");
  else fail(`${prefix}-mgr-doc`, msg.slice(0, 240));

  if (/not a signed-off escalation SOP/i.test(msg)) pass(`${prefix}-mgr-disclaimer`, "disclaimer");
  else fail(`${prefix}-mgr-disclaimer`, msg.slice(0, 240));

  if (t1.routing?.department === "Clinical Operations") {
    pass(`${prefix}-mgr-dept`, t1.routing.task || "Clinical Operations");
  } else fail(`${prefix}-mgr-dept`, JSON.stringify(t1.routing));

  // Leave regression — still HR provisional, not mislabeled Clinical Ops
  const leaveQ = "i want to take a leave tomorrow";
  const t2 = await chat(token, leaveQ, [], surface, `${threadId}-leave`);
  if (t2.answerTrust === "provisional") pass(`${prefix}-leave-trust`, "provisional");
  else fail(`${prefix}-leave-trust`, `got ${t2.answerTrust}`);
  const leaveSrc = (t2.sources || []).map((s) => s.title).join(" | ");
  if (/HR · provisional stub/i.test(leaveSrc)) pass(`${prefix}-leave-source`, leaveSrc);
  else fail(`${prefix}-leave-source`, leaveSrc || "(none)");

  return { manager: t1, leave: t2 };
}

async function main() {
  const token = await login();
  pass("auth", "ok");
  const ask = await replay("default", token);
  const talk = await replay("founder-coach", token);

  const out = {
    at: new Date().toISOString(),
    staff: STAFF,
    pass: rows.filter((r) => r.pass).length,
    fail: rows.filter((r) => !r.pass).length,
    rows,
    samples: {
      askManager: ask.manager.message?.slice(0, 400),
      talkManager: talk.manager.message?.slice(0, 400),
    },
  };
  mkdirSync(resolve(process.cwd(), ".cursor-verify"), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${OUT} (${out.pass} pass / ${out.fail} fail)`);
  if (out.fail > 0) process.exitCode = 1;
  else console.log("verify-provisional-manager-stub: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
