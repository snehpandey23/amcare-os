/**
 * Dual-surface verify — portal chrome / tool routes (Ask + Founder Talk).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-portal-chrome-dual-surface.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(
  /\/$/,
  "",
);
const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const OUT = resolve(process.cwd(), ".cursor-verify/portal-chrome-dual-surface.json");

const SOFT_STOP = /right staff guide for that yet|No approved guide yet/i;

type Case = {
  id: string;
  group: string;
  message: string;
  mustMatch: RegExp;
  mustNot?: RegExp;
  /** Expect portalLinks with this href substring */
  linkHref?: string;
};

const CASES: Case[] = [
  // Learn / Practice
  {
    id: "practice-hub",
    group: "Learn / Practice",
    message: "open practice drills",
    mustMatch: /Practice drills|\/learn\/practice/i,
    mustNot: /bookmark shortcut only/i,
    linkHref: "/learn/practice",
  },
  {
    id: "practice-benefit",
    group: "Learn / Practice",
    message: "will doing practice make me better",
    mustMatch: /Learn → Practice|skill drills|not.*medical practice/i,
    mustNot: /practice-wide hours|prove the practice/i,
    linkHref: "/learn/practice",
  },
  {
    id: "hipaa-training",
    group: "Learn / Practice",
    message: "continue my hipaa training",
    mustMatch: /HIPAA|\/training/i,
    linkHref: "/training",
  },
  {
    id: "hipaa-mock-quiz",
    group: "Learn / Practice",
    message: "can you create a mock quiz for me for hipaa, 5 mcqs?",
    mustMatch: /HIPAA|compliance|doesn.?t generate/i,
    mustNot: /Privacy or compliance question|Suspected breach/i,
    linkHref: "/training",
  },
  {
    id: "quick-compliance",
    group: "Learn / Practice",
    message: "open quick compliance drill",
    mustMatch: /Quick compliance|compliance/i,
    linkHref: "/learn/practice",
  },
  {
    id: "learn-hub",
    group: "Learn / Practice",
    message: "open learn hub",
    mustMatch: /Learn hub|\/learn/i,
    linkHref: "/learn",
  },
  {
    id: "culture-drill",
    group: "Learn / Practice",
    message: "open culture trivia practice",
    mustMatch: /Culture|trivia/i,
    linkHref: "/learn/practice",
  },
  {
    id: "typing-drill",
    group: "Learn / Practice",
    message: "start typing practice",
    mustMatch: /Chat speed|typing/i,
    linkHref: "/learn/practice",
  },
  {
    id: "learn-explain",
    group: "Learn / Practice",
    message: "what is learn and practice drills",
    mustMatch: /Learn|Practice drills/i,
    mustNot: SOFT_STOP,
  },
  // Portal tools
  {
    id: "team-feedback",
    group: "Portal tools",
    message: "Feedback assistance",
    mustMatch: /Feedback Friday|Give feedback/i,
    mustNot: SOFT_STOP,
    linkHref: "/feedback",
  },
  {
    id: "thumbs",
    group: "Portal tools",
    message: "what does the thumbs up button do",
    mustMatch: /yes\/no|helpful|no transcript/i,
    mustNot: SOFT_STOP,
  },
  {
    id: "notify-owner",
    group: "Portal tools",
    message: "what does notify owner button do",
    mustMatch: /knowledge-gap|missing guide/i,
    mustNot: SOFT_STOP,
  },
  {
    id: "clear-chat",
    group: "Portal tools",
    message: "how do I clear chat",
    mustMatch: /Clear chat/i,
    mustNot: SOFT_STOP,
  },
  {
    id: "focus-help",
    group: "Portal tools",
    message: "what is focus mode",
    mustMatch: /Focus/i,
    mustNot: SOFT_STOP,
  },
  // Identity / meta
  {
    id: "who-are-you",
    group: "Identity",
    message: "who are you",
    mustMatch: /Siya Assist/i,
    mustNot: SOFT_STOP,
  },
  {
    id: "who-is-siya",
    group: "Identity",
    message: "who is siya",
    mustMatch: /Siya Assist|not a person on the staff roster/i,
    mustNot: /roster matches/i,
  },
  {
    id: "feelings",
    group: "Identity",
    message: "I am feeling really lonely and I want to talk to somebody",
    mustMatch: /hard moment|therapist|manager|HR/i,
    mustNot: SOFT_STOP,
  },
  // Live portal (auth)
  {
    id: "missing-sops",
    group: "Live portal",
    message: "what sops r missign",
    mustMatch: /not live yet|knowledge gaps|pending review/i,
    mustNot: /Open Department SOPs in Memory to see what/i,
    linkHref: "/memory/knowledge/sops",
  },
  {
    id: "team-pulse",
    group: "Live portal",
    message: "who all in my team",
    mustMatch: /Team pulse|on shift|Team/i,
    mustNot: SOFT_STOP,
    linkHref: "/team",
  },
];

type Row = {
  id: string;
  group: string;
  surface: string;
  pass: boolean;
  detail: string;
  task?: string;
  knowledgeGap?: boolean;
};

async function login() {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  if (!email || !password) throw new Error("Need ASSIST_EMAIL/PASSWORD (source scripts/agent-qa-env.sh)");
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; user?: { email?: string }; error?: string };
  if (!res.ok || !data.token) throw new Error(data.error || "login failed");
  return data.token;
}

async function chat(
  token: string,
  message: string,
  surface: "default" | "founder-coach",
): Promise<{
  message?: string;
  knowledgeGap?: boolean;
  routing?: { task?: string };
  links?: { href: string; label?: string }[];
}> {
  const res = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history: [],
      surface,
      threadId: `ath-chrome-${surface}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    }),
  });
  if (!res.ok) throw new Error(`chat ${surface} ${res.status}`);
  return (await res.json()) as {
    message?: string;
    knowledgeGap?: boolean;
    routing?: { task?: string };
    links?: { href: string; label?: string }[];
  };
}

function evaluate(c: Case, r: Awaited<ReturnType<typeof chat>>): { pass: boolean; detail: string } {
  const msg = r.message || "";
  if (r.knowledgeGap && SOFT_STOP.test(msg)) {
    return { pass: false, detail: "soft-stop / knowledgeGap" };
  }
  if (c.mustNot && c.mustNot.test(msg)) {
    return { pass: false, detail: `mustNot matched: ${msg.slice(0, 100)}` };
  }
  if (!c.mustMatch.test(msg)) {
    return { pass: false, detail: `mustMatch miss: ${msg.slice(0, 120)}` };
  }
  if (c.linkHref) {
    const links = r.links ?? [];
    const inLinks = links.some((l) => l.href.includes(c.linkHref!));
    const inMsg = msg.includes(c.linkHref);
    if (!inLinks && !inMsg) {
      return {
        pass: false,
        detail: `missing link ${c.linkHref} (links: ${links.map((l) => l.href).join(", ") || "none"})`,
      };
    }
  }
  return { pass: true, detail: (r.routing?.task || "ok").slice(0, 80) };
}

async function main() {
  const token = await login();
  const rows: Row[] = [];

  for (const surface of ["default", "founder-coach"] as const) {
    const label = surface === "default" ? "Ask" : "Talk";
    for (const c of CASES) {
      const r = await chat(token, c.message, surface);
      const { pass, detail } = evaluate(c, r);
      rows.push({
        id: c.id,
        group: c.group,
        surface: label,
        pass,
        detail,
        task: r.routing?.task,
        knowledgeGap: r.knowledgeGap,
      });
      console.log(`${pass ? "PASS" : "FAIL"}\t${label}\t${c.id}\t${detail}`);
    }
  }

  const pass = rows.filter((r) => r.pass).length;
  const fail = rows.filter((r) => !r.pass).length;
  const byGroup = [...new Set(CASES.map((c) => c.group))].map((g) => ({
    group: g,
    pass: rows.filter((r) => r.group === g && r.pass).length,
    total: rows.filter((r) => r.group === g).length,
  }));

  mkdirSync(resolve(process.cwd(), ".cursor-verify"), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify({ at: new Date().toISOString(), pass, fail, byGroup, rows }, null, 2),
  );
  console.log(`\nWrote ${OUT}`);
  console.log(`Summary: ${pass} pass / ${fail} fail (${CASES.length} cases × 2 surfaces)`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
