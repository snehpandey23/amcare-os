/**
 * In-process: authenticated-shaped Talk path (Bearer + portal brief mock).
 * Proves ruleFinal answers are not LLM-overwritten when portalSignals exist.
 */
import assert from "assert";

process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL =
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app";
process.env.HIPAA_TRAINING_API_URL =
  process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app";
// Keep workforce LLM from running even if keys exist in env
delete process.env.AI_GATEWAY_API_KEY;
delete process.env.OPENAI_API_KEY;
delete process.env.VERCEL_OIDC_TOKEN;

const origFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (url.includes("/api/founder-coach/brief")) {
    return new Response(
      JSON.stringify({
        weekStart: "2026-08-11",
        weeklyPlan: { founderFocus: "CAC for Google", canWait: ["misc"] },
        domains: [
          {
            id: "marketing",
            title: "Marketing",
            status: "attention",
            summary: "CAC pressure",
            checkins: [{ submitterName: "Lead", founderShouldKnow: "Google CAC rising" }],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }
  if (/\/api\/(sops|decisions|memory|knowledge)/.test(url)) {
    return new Response(JSON.stringify({ sops: [], decisions: [], memories: [], items: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  return origFetch(input, init);
}) as typeof fetch;

async function main() {
  const { runSiyaAssistantAsync } = await import("../src/lib/siya-os/engine");
  const token = "test-admin-token-xxxxxxxxxxxxxxxxxxxx";

  const historyFull: { role: string; content: string }[] = [];
  const convo = [
    "best song by led zeppelin",
    "ac dc?",
    "how to get CAC sorted",
    "best song ever",
    "no i want a song by post malone",
    "whats my default background color as per marketing desgin brand system",
    "who is the president of india",
    "how",
  ];

  for (const msg of convo) {
    const r = await runSiyaAssistantAsync(msg, historyFull, { authToken: token, surface: "founder-coach" });
    console.log("\n=== USER ===\n" + msg);
    console.log("=== ASSIST (llmUsed=" + r.llmUsed + " ruleFinal=" + r.ruleFinal + ") ===\n" + r.message);
    assert.ok(!/You wrote|reply with one line|1\.\s*\*\*Patient/i.test(r.message), "no triage/You wrote: " + msg);
    if (/zeppelin|ac\s*dc|post malone|best song/i.test(msg)) {
      assert.ok(/don.?t pick songs|outside what I can help/i.test(r.message), "off-topic: " + msg);
      assert.notEqual(r.llmUsed, true);
    }
    if (/desgin brand|background color/i.test(msg)) {
      assert.ok(/#fffdf6/.test(r.message), "brand token");
      assert.notEqual(r.llmUsed, true);
    }
    historyFull.push({ role: "user", content: msg });
    historyFull.push({ role: "assistant", content: r.message });
  }

  // Concat regression: prior 1–5 assistant in history must not glue ac dc onto prior user for echo
  const history = [
    { role: "user", content: "best song by led zeppelin" },
    {
      role: "assistant",
      content:
        "You wrote “best song by led zeppelin”. I’m not sure which path you need yet — reply with one line:\n1. **Patient / caller situation**",
    },
  ];
  const r2 = await runSiyaAssistantAsync("ac dc?", history, { authToken: token, surface: "founder-coach" });
  console.log("\nUSER: ac dc? (after old 1-5 history)");
  console.log("REPLY:", r2.message);
  assert.ok(!/You wrote|led zeppelin — ac dc/i.test(r2.message));
  assert.ok(/don.?t pick songs|outside what I can help/i.test(r2.message));

  console.log("\nengine-portal-signals-smoke OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
