/**
 * Dual-surface verify — product tour copy + Ask step behavior (Ask + Talk).
 * Confirms gap-reporting teaching matches live meta answers; Ask capability
 * catalog works on both surfaces (tour Ask step).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-product-tour-dual-surface.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  PORTAL_TOUR_STEPS,
  PORTAL_TOUR_ESSENTIALS,
  PORTAL_TOUR_OUT_OF_SCOPE,
  TOUR_DEMO_PEER,
  tourFeedbackPracticeBody,
} from "../src/lib/portal-product-tour";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/product-tour-dual-surface.json",
);

type Row = { id: string; surface?: string; pass: boolean; detail: string };
const rows: Row[] = [];

function pass(id: string, detail: string, surface?: string) {
  rows.push({ id, surface, pass: true, detail });
  console.log(`PASS\t${surface ? `[${surface}] ` : ""}${id}\t${detail}`);
}

function fail(id: string, detail: string, surface?: string) {
  rows.push({ id, surface, pass: false, detail });
  console.error(`FAIL\t${surface ? `[${surface}] ` : ""}${id}\t${detail}`);
}

async function login() {
  const email = (process.env.ASSIST_EMAIL || process.env.STAFF_PORTAL_QA_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || process.env.STAFF_PORTAL_QA_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD (source scripts/agent-qa-env.sh)");
  if (!/qa|test/i.test(email)) throw new Error(`Refusing non-QA email: ${email}`);
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return data.token;
}

async function chat(token: string, message: string, surface: "default" | "founder-coach") {
  const res = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, surface }),
  });
  const data = (await res.json()) as {
    reply?: string;
    message?: string;
    links?: { label: string; href: string }[];
    portalLinks?: { label: string; href: string }[];
    knowledgeGap?: boolean;
  };
  return {
    text: data.reply ?? data.message ?? "",
    links: data.links ?? data.portalLinks ?? [],
    knowledgeGap: data.knowledgeGap === true,
  };
}

/** Local: essentials scope lock + gap-reporting copy vs Feedback. */
function verifyTourCopyLocal() {
  const expectedIds = [
    "welcome",
    "my-day",
    "ask-capability",
    "learn-hub",
    "practice-typing",
    "hipaa-training",
    "team",
    "feedback-practice",
    "finish",
  ];
  const actualIds = PORTAL_TOUR_STEPS.map((s) => s.id);
  if (actualIds.join(",") === expectedIds.join(",")) {
    pass("essentials-step-ids", actualIds.join(" → "));
  } else {
    fail("essentials-step-ids", `got ${actualIds.join(",")} want ${expectedIds.join(",")}`);
  }
  if (PORTAL_TOUR_ESSENTIALS.length === 8) {
    pass("essentials-manifest", `${PORTAL_TOUR_ESSENTIALS.length} essentials`);
  } else {
    fail("essentials-manifest", `expected 8 essentials, got ${PORTAL_TOUR_ESSENTIALS.length}`);
  }

  const allCopy = PORTAL_TOUR_STEPS.map((s) => `${s.title}\n${s.lines.join("\n")}\n${s.verifyHint}`).join(
    "\n",
  );
  const forbidden = [
    { id: "oos-ops", re: /\bOps\b|\badmin task\b|SOP review/i },
    { id: "oos-talk", re: /\bTalk Mode\b|use voice|Talk voice/i },
    { id: "oos-checkin", re: /weekly check-?in/i },
    { id: "oos-memory", re: /\bMemory\b/ },
    { id: "oos-shift-schedule", re: /shift schedule|roster/i },
    { id: "oos-weekly-report", re: /weekly practice report/i },
  ];
  for (const f of forbidden) {
    if (f.re.test(allCopy)) fail(f.id, `out-of-scope phrase found in tour copy`);
    else pass(f.id, "not mentioned");
  }
  if (PORTAL_TOUR_OUT_OF_SCOPE.length >= 7) {
    pass("oos-manifest", PORTAL_TOUR_OUT_OF_SCOPE.join("; "));
  } else {
    fail("oos-manifest", "out-of-scope list too short");
  }

  const finish = PORTAL_TOUR_STEPS.find((s) => s.id === "finish");
  const feedback = PORTAL_TOUR_STEPS.find((s) => s.id === "feedback-practice");
  const ask = PORTAL_TOUR_STEPS.find((s) => s.id === "ask-capability");
  const practice = PORTAL_TOUR_STEPS.find((s) => s.id === "practice-typing");
  const welcome = PORTAL_TOUR_STEPS.find((s) => s.id === "welcome");

  if (!finish || !feedback || !ask || !practice || !welcome) {
    fail("tour-steps-present", "missing finish/feedback/ask/practice/welcome step");
    return;
  }

  const finishText = finish.lines.join("\n");
  const feedbackText = feedback.lines.join("\n");
  const welcomeText = welcome.lines.join("\n");

  const checks: { id: string; ok: boolean; detail: string }[] = [
    {
      id: "copy-essentials-framing",
      ok: /get started|essentials/i.test(welcomeText + "\n" + finishText),
      detail: "welcome/finish must frame essentials / get started",
    },
    {
      id: "copy-not-everything",
      ok: !/everything this (tool|portal|product) can do|full portal capability list/i.test(allCopy),
      detail: "must not imply full product coverage",
    },
    {
      id: "copy-auto-gap",
      ok: /logs the gap automatically|automatically/i.test(finishText),
      detail: "finish must teach auto-capture",
    },
    {
      id: "copy-notify-owner",
      ok: /Notify owner/i.test(finishText),
      detail: "finish must teach Notify owner",
    },
    {
      id: "copy-thumbs",
      ok: /👍|👎|thumbs/i.test(finishText),
      detail: "finish must teach thumbs as separate channel",
    },
    {
      id: "copy-thumbs-not-gap",
      ok: /different|not a missing-guide|separate/i.test(finishText),
      detail: "finish must say thumbs ≠ missing-guide gap",
    },
    {
      id: "copy-feedback-not-sop",
      ok: /not for missing SOP|interpersonal|recognition/i.test(feedbackText + "\n" + finishText),
      detail: "must distinguish peer Feedback from SOP gaps",
    },
    {
      id: "copy-no-notify-only-oversimplify",
      ok: !/^If Ask has no approved guide, click \*\*Notify owner\*\*/m.test(finishText),
      detail: "must not use old Notify-owner-only line",
    },
    {
      id: "sandbox-feedback-href",
      ok: feedback.actionHref === "/feedback?tour=1",
      detail: `href=${feedback.actionHref}`,
    },
    {
      id: "sandbox-practice-href",
      ok: practice.actionHref?.includes("tour=1") === true,
      detail: `href=${practice.actionHref}`,
    },
    {
      id: "demo-peer-not-uuid",
      ok: TOUR_DEMO_PEER.id === "tour-demo-peer" && /demo/i.test(TOUR_DEMO_PEER.label),
      detail: TOUR_DEMO_PEER.label,
    },
    {
      id: "ask-step-capability",
      ok: /what can this do/i.test(ask.lines.join(" ")),
      detail: "Ask step still teaches capability catalog",
    },
    {
      id: "tour-feedback-body-prefix",
      ok: tourFeedbackPracticeBody().includes("[Product tour practice]"),
      detail: "sandbox body prefix present",
    },
  ];

  for (const c of checks) {
    if (c.ok) pass(c.id, c.detail);
    else fail(c.id, c.detail);
  }
}

type LiveCase = {
  id: string;
  message: string;
  mustMatch: RegExp;
  mustNot?: RegExp;
  /** Tour Ask step — must not be a knowledge-gap soft-stop */
  expectNoGap?: boolean;
};

const LIVE_CASES: LiveCase[] = [
  {
    id: "tour-ask-what-can-this-do",
    message: "what can this do",
    mustMatch: /everything reachable|Learn & training|Practice drills|Feedback/i,
    mustNot: /right staff guide for that yet|No approved guide yet/i,
    expectNoGap: true,
  },
  {
    id: "meta-notify-owner",
    message: "what does notify owner button do",
    mustMatch: /Notify owner|knowledge-gap/i,
    mustNot: /Feedback Friday.*send to a peer/i,
  },
  {
    id: "meta-thumbs",
    message: "what does the thumbs up button do",
    mustMatch: /yes\/no|no transcript|Does not email|helpful/i,
    mustNot: /Notify owner logs a \*\*knowledge-gap click\*\*/i,
  },
];

async function main() {
  verifyTourCopyLocal();

  // Brand-intro ↔ tour coordination (local, no DOM)
  const { shouldShowBrandIntro, markBrandIntroShownToday } = await import("../src/lib/brand-intro");
  const mem: Record<string, string> = {};
  const session: Record<string, string> = {};
  (globalThis as { window?: unknown }).window = globalThis;
  (globalThis as { localStorage?: Storage }).localStorage = {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => {
      mem[k] = v;
    },
    removeItem: (k) => {
      delete mem[k];
    },
    clear: () => {
      for (const k of Object.keys(mem)) delete mem[k];
    },
    key: () => null,
    length: 0,
  };
  (globalThis as { sessionStorage?: Storage }).sessionStorage = {
    getItem: (k) => (k in session ? session[k] : null),
    setItem: (k, v) => {
      session[k] = v;
    },
    removeItem: (k) => {
      delete session[k];
    },
    clear: () => {
      for (const k of Object.keys(session)) delete session[k];
    },
    key: () => null,
    length: 0,
  };
  Object.defineProperty(globalThis, "location", { value: { search: "" }, writable: true });

  delete mem["siya-brand-intro-shown-on"];
  if (shouldShowBrandIntro({ tourInProgress: true })) {
    fail("brand-intro-defers-tour", "splash should skip when tourInProgress");
  } else {
    pass("brand-intro-defers-tour", "splash skipped while tour active");
  }
  if (!shouldShowBrandIntro({ tourInProgress: false })) {
    fail("brand-intro-allows-without-tour", "splash should show when no tour and not marked today");
  } else {
    pass("brand-intro-allows-without-tour", "splash allowed without tour");
  }
  markBrandIntroShownToday();

  const token = await login();
  pass("login", "QA token");

  const surfaces: ("default" | "founder-coach")[] = ["default", "founder-coach"];
  for (const c of LIVE_CASES) {
    for (const surface of surfaces) {
      const { text, knowledgeGap } = await chat(token, c.message, surface);
      let ok = c.mustMatch.test(text);
      if (c.mustNot && c.mustNot.test(text)) ok = false;
      if (c.expectNoGap && knowledgeGap) ok = false;
      if (ok) pass(c.id, "ok", surface);
      else fail(c.id, `text=${text.slice(0, 160)}… gap=${knowledgeGap}`, surface);
    }
  }

  mkdirSync(resolve(OUT, ".."), { recursive: true });
  const passed = rows.filter((r) => r.pass).length;
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        at: new Date().toISOString(),
        staffUrl: STAFF,
        authUrl: AUTH,
        passed,
        total: rows.length,
        rows,
      },
      null,
      2,
    ),
  );
  console.log(`\n${passed}/${rows.length} passed → ${OUT}`);
  if (passed !== rows.length) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
