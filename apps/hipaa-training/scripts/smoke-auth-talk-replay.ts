/**
 * Authenticated Talk replay — REQUIRED evidence path (Bearer token).
 *
 * Usage:
 *   ASSIST_TOKEN='…' npx tsx apps/hipaa-training/scripts/smoke-auth-talk-replay.ts
 *
 * Token: sign in → DevTools → Application → localStorage key `hipaa-training-jwt`
 *     or Network → /api/chat → Authorization: Bearer …
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const TOKEN = (process.env.ASSIST_TOKEN || "").trim();

const ORIGINAL_TALK = [
  "best song by led zeppelin",
  "ac dc?",
  "how to get CAC sorted",
  "best song ever",
  "no i want a song by post malone",
  "whats my default background color as per marketing desgin brand system",
  "who is the president of india",
  "how",
];

const PRESENCE = [
  "who all are working right now",
  "no i want to know who is present today",
  "isnt that just one person",
  "who's working right now",
];

async function chat(message: string, history: { role: string; content: string }[]) {
  const res = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, history, surface: "founder-coach" }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`chat ${res.status}: ${JSON.stringify(data)}`);
  return data as {
    message: string;
    llmUsed?: boolean;
    opsCoPilot?: boolean;
    routing?: { department?: string; task?: string };
  };
}

async function replay(label: string, msgs: string[]) {
  const history: { role: string; content: string }[] = [];
  const turns: Record<string, unknown>[] = [];
  console.log(`\n######## ${label} ########`);
  for (const message of msgs) {
    const data = await chat(message, history);
    const reply = String(data.message || "");
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });
    const flags = {
      youWrote: /You wrote/i.test(reply),
      triage15: /1\.\s*\*\*Patient|reply with one line/i.test(reply),
      offTopic: /don.?t pick songs|outside what I can help/i.test(reply),
      brand: /#fffdf6/i.test(reply),
      teamPulse: /Team pulse|On shift now|No one is marked on shift/i.test(reply),
      rockStarLeadList: /Accounts Lead:.*Rock Star/i.test(reply),
      founderTalk: data.routing?.task === "Founder Talk",
      opsCoPilot: Boolean(data.opsCoPilot),
      llmUsed: Boolean(data.llmUsed),
    };
    turns.push({ message, reply, flags, routing: data.routing, llmUsed: data.llmUsed, opsCoPilot: data.opsCoPilot });
    console.log("\n=== USER ===\n" + message);
    console.log(
      `=== ASSIST (llmUsed=${data.llmUsed} ops=${data.opsCoPilot} task=${data.routing?.task}) ===\n` + reply,
    );
    console.log("flags", JSON.stringify(flags));
  }
  return turns;
}

async function auditDepartmentLeads() {
  console.log("\n######## siya_department_leads audit ########");
  const res = await fetch(`${AUTH}/api/admin/department-leads`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.log("department-leads failed", res.status, body);
    return { ok: false, status: res.status, body };
  }
  const leads = (body.leads || body) as {
    departmentSlug?: string;
    departmentLabel?: string;
    userId?: string | null;
    userName?: string | null;
    userEmail?: string | null;
    name?: string | null;
    email?: string | null;
  }[];
  const rows = Array.isArray(leads) ? leads : [];
  const byPerson = new Map<string, string[]>();
  for (const l of rows) {
    const name = (l.userName || l.name || "").trim() || "(unassigned)";
    const email = (l.userEmail || l.email || "").trim();
    const key = email || name;
    const dept = l.departmentLabel || l.departmentSlug || "?";
    if (!byPerson.has(key)) byPerson.set(key, []);
    byPerson.get(key)!.push(dept);
    console.log(`- ${dept}: ${name}${email ? ` <${email}>` : ""}${l.userId ? ` id=${l.userId}` : " (empty seat)"}`);
  }
  const rock = [...byPerson.entries()].filter(([k]) => /rock\s*star/i.test(k));
  console.log("\nRock Star seats:", rock.length ? rock : "none named Rock Star");
  const multi = [...byPerson.entries()].filter(([, depts]) => depts.length > 1 && !depts[0].includes("unassigned"));
  console.log("People holding multiple lead seats:", multi);
  return { ok: true, rows, byPerson: Object.fromEntries(byPerson), rockStar: rock, multiSeat: multi };
}

async function main() {
  if (!TOKEN || TOKEN.length < 20) {
    console.error("Set ASSIST_TOKEN to a real staff JWT (authenticated admin session).");
    process.exit(1);
  }

  const me = await fetch(`${AUTH}/api/auth/me`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const meBody = await me.json().catch(() => ({}));
  if (!me.ok) {
    console.error("Auth /me failed", me.status, meBody);
    process.exit(1);
  }
  console.log("authenticated_as", meBody.email || meBody.user?.email, "role", meBody.role || meBody.user?.role);

  const leadsAudit = await auditDepartmentLeads();
  const original = await replay("ORIGINAL JUST-TALK TRANSCRIPT", ORIGINAL_TALK);
  const presence = await replay("PRESENCE QUESTIONS", PRESENCE);

  const fb = await fetch(`${STAFF}/api/assist-feedback`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ helpful: true, department: "Leadership", knowledgeGap: false }),
  });
  const fbBody = await fb.json().catch(() => ({}));
  console.log("\n=== THUMBS UP API ===", fb.status, fbBody);

  const out = resolve("apps/hipaa-training/.cursor-verify/diag-auth-talk-replay.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(
    out,
    JSON.stringify({ me: meBody, leadsAudit, original, presence, thumbs: { status: fb.status, body: fbBody } }, null, 2),
  );
  console.log("\nwrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
