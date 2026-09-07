/**
 * Local Phase-1 smoke for OET LMS (auth + health).
 * With stack on 3005/3006/3007:
 *   npx tsx apps/oet-lms/scripts/smoke-phase1-local.ts
 */
import assert from "node:assert/strict";

const API = process.env.OET_LMS_SUBMISSIONS_ORIGIN || "http://127.0.0.1:3006";
const CHAT = process.env.OET_LMS_CHAT_ORIGIN || "http://127.0.0.1:3007";
const FE = process.env.OET_LMS_ORIGIN || "http://127.0.0.1:3005";

const email = `phase1-${Date.now()}@example.com`;
const password = "Phase1Test!99";

async function main() {
  const healthSub = (await fetch(`${API}/api/health`).then((r) => r.json())) as {
    ok?: boolean;
    database?: string;
  };
  assert.equal(healthSub.ok, true);
  assert.equal(healthSub.database, "connected");
  console.log("submissions health", healthSub);

  const healthChat = (await fetch(`${CHAT}/health`).then((r) => r.json())) as { ok?: boolean };
  assert.equal(healthChat.ok, true);
  console.log("chat health", healthChat);

  const fe = await fetch(FE);
  assert.equal(fe.status, 200);
  console.log("frontend", fe.status);

  const reg = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: "Phase1 Tester" }),
  });
  const regBody = (await reg.json()) as { token?: string; error?: string; user?: { email: string } };
  assert.ok(reg.ok && regBody.token, `register failed: ${reg.status} ${JSON.stringify(regBody)}`);
  console.log("register ok", regBody.user?.email);

  const login = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const loginBody = (await login.json()) as { token?: string };
  assert.ok(login.ok && loginBody.token, "login failed");

  const sessionRes = await fetch(`${API}/api/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginBody.token}`,
    },
    body: JSON.stringify({
      personaId: "emma",
      personaName: "Emma",
      timestamp: Date.now(),
      messageCount: 2,
      empathyScore: 50,
      grammarScore: 80,
      avgWpm: 40,
      calgaryScore: 3,
      calgaryMax: 10,
      transcript: [
        { who: "Emma", text: "Hello" },
        { who: "you", text: "Hi, I can help with next steps." },
      ],
    }),
  });
  const sessionBody = await sessionRes.json();
  assert.ok(sessionRes.ok, `save session: ${sessionRes.status} ${JSON.stringify(sessionBody)}`);
  console.log("session saved");

  const listRes = await fetch(`${API}/api/sessions`, {
    headers: { Authorization: `Bearer ${loginBody.token}` },
  });
  const list = await listRes.json();
  const sessions = Array.isArray(list) ? list : list.sessions;
  assert.ok(Array.isArray(sessions) && sessions.length >= 1, "list sessions");
  console.log("smoke-phase1-local: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
