/**
 * Authenticated 3-turn onboarding meta follow-up (admin Founder Talk path).
 *
 *   ASSIST_EMAIL='…' ASSIST_PASSWORD='…' npx tsx apps/hipaa-training/scripts/verify-meta-onboarding-followup.ts
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, resolve } from "path";

const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/meta-onboarding-followup-auth.json",
);

type HistoryItem = { role: "user" | "assistant"; content: string };
type ChatRow = {
  turn: number;
  message: string;
  pass: boolean;
  detail: string;
  knowledgeGap?: boolean;
  opsCoPilot?: boolean;
  links?: { label: string; href: string }[];
  messagePreview?: string;
};

const rows: ChatRow[] = [];

async function login(): Promise<string> {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  if (!email || !password) throw new Error("ASSIST_EMAIL and ASSIST_PASSWORD required");
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; accessToken?: string; error?: string };
  const token = (data.token || data.accessToken || "").trim();
  if (!res.ok || token.length < 20) throw new Error(`login failed: ${res.status} ${data.error || ""}`);
  return token;
}

async function ask(token: string, message: string, history: HistoryItem[] = []) {
  const res = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history, surface: "founder-coach" }),
  });
  const data = (await res.json()) as {
    message?: string;
    knowledgeGap?: boolean;
    opsCoPilot?: boolean;
    links?: { label: string; href: string }[];
    error?: string;
  };
  if (!res.ok) throw new Error(`chat ${res.status}: ${data.error || JSON.stringify(data)}`);
  return data;
}

function record(turn: number, message: string, pass: boolean, detail: string, data: Awaited<ReturnType<typeof ask>>) {
  rows.push({
    turn,
    message,
    pass,
    detail,
    knowledgeGap: data.knowledgeGap,
    opsCoPilot: data.opsCoPilot,
    links: data.links,
    messagePreview: data.message?.slice(0, 320),
  });
  console.log(`${pass ? "PASS" : "FAIL"}\tT${turn}\t${message}\t${detail}`);
  if (data.message) console.log(`  → ${data.message.slice(0, 200).replace(/\n/g, " ")}`);
  if (data.links?.length) console.log(`  links: ${data.links.map((l) => l.href).join(", ")}`);
}

async function main() {
  const token = await login();
  const history: HistoryItem[] = [];

  const t1 = await ask(token, "why did u skip my onboarding", history);
  const t1Pass =
    /personalization wizard/i.test(t1.message || "") &&
    t1.knowledgeGap !== true &&
    !/Concierge Specialist|Klarity.*Spruce/i.test(t1.message || "");
  record(1, "why did u skip my onboarding", t1Pass, t1Pass ? "portal onboarding meta" : "wrong route", t1);
  history.push({ role: "user", content: "why did u skip my onboarding" });
  history.push({ role: "assistant", content: t1.message || "" });

  const t2 = await ask(token, "i dont see personalize on my day", history);
  const t2Pass =
    /not on admin|Open onboarding|\/onboarding|Founder Talk/i.test(t2.message || "") &&
    !/Overdue Tasks|team status|Current Team Status/i.test(t2.message || "") &&
    t2.opsCoPilot !== true &&
    t2.knowledgeGap !== true;
  record(2, "i dont see personalize on my day", t2Pass, t2Pass ? "troubleshoot meta" : "ops leak or wrong copy", t2);
  history.push({ role: "user", content: "i dont see personalize on my day" });
  history.push({ role: "assistant", content: t2.message || "" });

  const t3 = await ask(token, "cant u do the personalization now", history);
  const t3Pass =
    /can't run the personalization|Open onboarding/i.test(t3.message || "") &&
    (t3.message || "").trim() !== (t1.message || "").trim() &&
    (t3.links?.some((l) => l.href === "/onboarding") ||
      /Open onboarding/i.test(t3.message || "")) &&
    t3.knowledgeGap !== true;
  record(3, "cant u do the personalization now", t3Pass, t3Pass ? "action meta + link" : "verbatim repeat or no link", t3);

  const payload = {
    at: new Date().toISOString(),
    staff: STAFF,
    surface: "founder-coach",
    rows,
    passed: rows.filter((r) => r.pass).length,
    total: rows.length,
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(`\nWrote ${OUT}`);
  process.exit(rows.some((r) => !r.pass) ? 1 : 0);
}

void main().catch((e) => {
  console.error("FAIL\tsetup", e instanceof Error ? e.message : String(e));
  process.exit(1);
});
