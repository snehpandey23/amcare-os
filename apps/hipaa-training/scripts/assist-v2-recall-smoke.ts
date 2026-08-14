/**
 * Assist v2 recall smoke — proves server history is used across a "new session".
 *
 * Usage (with a staff JWT):
 *   ASSIST_TOKEN=... npx tsx apps/hipaa-training/scripts/assist-v2-recall-smoke.ts
 */

const AUTH = process.env.HIPAA_TRAINING_API_URL || process.env.ASSIST_AUTH_URL || "https://siya-staff-auth-api.vercel.app";
const STAFF = process.env.STAFF_APP_URL || "https://siya-staff-assist.vercel.app";
const TOKEN = process.env.ASSIST_TOKEN || "";

const MARKER = `Priya-Recall-${Date.now().toString(36)}`;

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${AUTH}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

async function main() {
  if (!TOKEN) {
    console.error("Set ASSIST_TOKEN to a staff JWT (sign in, copy from localStorage).");
    process.exit(1);
  }

  console.log("1) Create thread");
  const { thread } = await api("/api/assist/threads", {
    method: "POST",
    body: JSON.stringify({ title: "Recall smoke" }),
  });
  const threadId = thread.id as string;
  console.log("   threadId=", threadId);

  console.log("2) Session A — teach a fact via /api/chat with threadId");
  const teach = `My preferred escalation contact for refunds is ${MARKER}. Remember that for this chat.`;
  const r1 = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: teach, history: [], threadId }),
  });
  const d1 = await r1.json();
  if (!r1.ok) throw new Error(`chat teach failed: ${JSON.stringify(d1)}`);
  console.log("   reply1:", String(d1.message || "").slice(0, 120));

  console.log("3) Simulate new session — load history from auth API only (no client buffer)");
  const hist = await api(`/api/assist/threads/${encodeURIComponent(threadId)}/history?limit=24`);
  const history = hist.history as { role: string; content: string }[];
  console.log("   server turns=", history.length);
  if (history.length < 2) throw new Error("Expected persisted user+assistant turn");

  console.log("4) Ask recall question with empty client history; server must supply context");
  const ask = "Who did I say handles refunds / preferred escalation contact? Reply with their name only if you know.";
  const r2 = await fetch(`${STAFF}/api/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: ask, history: [], threadId }),
  });
  const d2 = await r2.json();
  if (!r2.ok) throw new Error(`chat recall failed: ${JSON.stringify(d2)}`);
  const answer = String(d2.message || "");
  console.log("   reply2:", answer.slice(0, 240));
  console.log("   llmUsed=", d2.llmUsed, "llmFallback=", d2.llmFallback);

  const ok = answer.includes(MARKER) || /priya/i.test(answer);
  if (!ok) {
    console.error("FAIL — reply did not recall the planted contact from server history.");
    process.exit(2);
  }
  console.log("PASS — Assist recalled prior turn from server thread history.");

  // Optional: archive
  await api(`/api/assist/threads/${encodeURIComponent(threadId)}/archive`, { method: "POST", body: "{}" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
