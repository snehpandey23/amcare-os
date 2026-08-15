/**
 * Authenticated Talk replay — REQUIRED evidence path (Bearer token).
 *
 * Usage:
 *   ASSIST_TOKEN='…' npx tsx apps/hipaa-training/scripts/smoke-auth-talk-replay.ts
 *
 * Token: sign in at siya-staff-assist → DevTools → Application → localStorage
 * (auth token key used by the staff app), or Network → /api/chat → Authorization.
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

const STAFF = (process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app").replace(/\/$/, "");
const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const TOKEN = (process.env.ASSIST_TOKEN || "").trim();

const MSGS = [
  "best song by led zeppelin",
  "ac dc?",
  "how to get CAC sorted",
  "best song ever",
  "no i want a song by post malone",
  "whats my default background color as per marketing desgin brand system",
  "who is the president of india",
  "how",
];

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
  console.log("authenticated_as", meBody.email || meBody.user?.email || meBody, "role", meBody.role || meBody.user?.role);

  const history: { role: string; content: string }[] = [];
  const turns: Record<string, unknown>[] = [];

  for (const message of MSGS) {
    const res = await fetch(`${STAFF}/api/chat`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history,
        surface: "founder-coach",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("chat failed", message, res.status, data);
      process.exit(1);
    }
    const reply = String(data.message || "");
    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: reply });
    const flags = {
      youWrote: /You wrote/i.test(reply),
      triage15: /1\.\s*\*\*Patient|reply with one line/i.test(reply),
      offTopic: /don.?t pick songs|outside what I can help/i.test(reply),
      brand: /#fffdf6/i.test(reply),
      llmUsed: Boolean(data.llmUsed),
      routing: data.routing ?? null,
    };
    turns.push({ message, reply, flags, llmUsed: data.llmUsed, routing: data.routing });
    console.log("\n=== USER ===\n" + message);
    console.log("=== ASSIST (llmUsed=" + data.llmUsed + ") ===\n" + reply);
    console.log("flags", JSON.stringify(flags));
  }

  // Thumbs: feedback only — must not require memory save
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
  turns.push({
    message: "[thumbs up]",
    reply: `assist-feedback ${fb.status}: ${JSON.stringify(fbBody)}`,
    flags: { note: "UI no longer sets memoryOffer on thumbs; API only logs" },
  });

  const out = resolve("apps/hipaa-training/.cursor-verify/diag-auth-talk-replay.json");
  writeFileSync(out, JSON.stringify({ me: meBody, turns }, null, 2));
  console.log("\nwrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
