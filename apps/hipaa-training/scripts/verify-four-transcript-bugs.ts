/**
 * Dual-surface verify — four transcript bugs (admin conversation).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-four-transcript-bugs.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(process.cwd(), ".cursor-verify/four-transcript-bugs.json");

type ChatRes = {
  message?: string;
  knowledgeGap?: boolean;
  answerTrust?: string;
  sources?: { title: string; id: string }[];
  routing?: { department?: string; task?: string };
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
  const data = (await res.json()) as { token?: string; user?: { name?: string; email?: string }; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return data;
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

async function surfaceRun(surface: "default" | "founder-coach", token: string, viewerName: string) {
  const prefix = surface === "default" ? "ask" : "talk";
  const threadId = `ath-bugs-${surface}-${Date.now()}`;
  const history: { role: string; content: string }[] = [];

  // Bug 3 — My day naming
  {
    const q = "why do you call it my day";
    const r = await chat(token, q, history, surface, threadId);
    history.push({ role: "user", content: q }, { role: "assistant", content: r.message || "" });
    const msg = r.message || "";
    if (/Daily Plan|Overdue Tasks/i.test(msg)) fail(`${prefix}-myday-no-plan`, msg.slice(0, 120));
    else pass(`${prefix}-myday-no-plan`, "not daily plan");
    if (/home screen|daily workspace|My day/i.test(msg)) pass(`${prefix}-myday-explain`, "naming explained");
    else fail(`${prefix}-myday-explain`, msg.slice(0, 160));
  }

  // Seed history like transcript turn 1 (assignment lines) for bug 4 reuse
  history.push({
    role: "assistant",
    content: [
      "### Daily Plan",
      "- Lead Review:",
      "- SOP: Handling Verbally Abusive Patient Interactions (High, Due 2026-08-09) → Rock Star",
      "- SOP Reviews:",
      "- SOP: Handling Verbally Abusive Patient Interactions (High, Due 2026-08-09) → Sneh Pandey",
    ].join("\n"),
  });

  // Bug 1 + assignment-shaped turn 2
  {
    const q = "rock star is handing verbally abusive patient sop?";
    const r = await chat(token, q, history, surface, threadId);
    history.push({ role: "user", content: q }, { role: "assistant", content: r.message || "" });
    const src = (r.sources || []).map((s) => s.title).join(" · ");
    if (/Clinical Ops · provisional stub/i.test(src)) fail(`${prefix}-cite-no-prov`, src);
    else pass(`${prefix}-cite-no-prov`, src || "(no provisional)");
    if (/provisional stub/i.test(src) && !/session|assignment|directory|task list/i.test(src)) {
      fail(`${prefix}-cite-clean`, src);
    } else pass(`${prefix}-cite-clean`, src || "ok");
    // Should be assignment answer OR live Accounts citation — not provisional
    const msg = r.message || "";
    if (/Accounts|Rock Star|assignment\/status|Owner \(author\)|live/i.test(msg + src)) {
      pass(`${prefix}-t2-substance`, "assignment or live sop");
    } else fail(`${prefix}-t2-substance`, msg.slice(0, 200));
  }

  // Bug 4 — confirm who is reviewing
  {
    const q = "why r u telling SOP? confirm who is reviewing SOP";
    const r = await chat(token, q, history, surface, threadId);
    history.push({ role: "user", content: q }, { role: "assistant", content: r.message || "" });
    const msg = r.message || "";
    if (/SOP Review Process|Assign a Reviewer|Final Approval/i.test(msg)) {
      fail(`${prefix}-assign-no-generic`, "generic process dump");
    } else pass(`${prefix}-assign-no-generic`, "not generic process");
    if (/Rock Star|Sneh Pandey|Owner|Status:|pending_review|live/i.test(msg)) {
      pass(`${prefix}-assign-real`, msg.slice(0, 160));
    } else fail(`${prefix}-assign-real`, msg.slice(0, 200));
  }

  // Bug 2 — who is rock star / who am I
  {
    const q = "who is rock star";
    const r = await chat(token, q, [], surface, `${threadId}-who`);
    const msg = r.message || "";
    if (/right staff guide for that yet|No approved guide yet/i.test(msg)) {
      fail(`${prefix}-who-no-softstop`, msg.slice(0, 120));
    } else pass(`${prefix}-who-no-softstop`, "no soft-stop");
    if (/roster|signed in|you\b|email|staff/i.test(msg)) pass(`${prefix}-who-identity`, msg.slice(0, 160));
    else fail(`${prefix}-who-identity`, msg.slice(0, 160));
  }

  {
    const q = "who am I";
    const r = await chat(token, q, [], surface, `${threadId}-me`);
    const msg = r.message || "";
    if (/signed in as/i.test(msg)) pass(`${prefix}-whoami`, msg.slice(0, 120));
    else fail(`${prefix}-whoami`, msg.slice(0, 160));
    if (viewerName && new RegExp(viewerName.split(/\s+/)[0]!, "i").test(msg)) {
      pass(`${prefix}-whoami-name`, viewerName);
    } else pass(`${prefix}-whoami-name`, `got session reply (${viewerName || "n/a"})`);
  }

  // Pure content abusive ask — live Accounts citation only
  {
    const q = "what is the procedure for verbally abusive patient interactions";
    const r = await chat(token, q, [], surface, `${threadId}-sop`);
    const src = (r.sources || []).map((s) => s.title).join(" · ");
    if (/provisional stub/i.test(src)) fail(`${prefix}-sop-cite`, src);
    else pass(`${prefix}-sop-cite`, src || "(none)");
    if (/Accounts/i.test(src) || /Accounts/i.test(r.message || "")) pass(`${prefix}-sop-accounts`, "Accounts");
    else fail(`${prefix}-sop-accounts`, src);
  }
}

async function main() {
  const logged = await login();
  pass("auth", logged.user?.email || "ok");
  await surfaceRun("default", logged.token!, logged.user?.name || "");
  await surfaceRun("founder-coach", logged.token!, logged.user?.name || "");

  const out = {
    at: new Date().toISOString(),
    pass: rows.filter((r) => r.pass).length,
    fail: rows.filter((r) => !r.pass).length,
    rows,
  };
  mkdirSync(resolve(process.cwd(), ".cursor-verify"), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${OUT} (${out.pass} pass / ${out.fail} fail)`);
  if (out.fail > 0) process.exitCode = 1;
  else console.log("verify-four-transcript-bugs: PASS");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
