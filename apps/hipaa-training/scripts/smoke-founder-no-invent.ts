/**
 * Founder Talk: no-approved-source must stop (no invent) unless portal-intent question.
 */
process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL =
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app";
process.env.HIPAA_TRAINING_API_URL =
  process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app";
delete process.env.AI_GATEWAY_API_KEY;
delete process.env.OPENAI_API_KEY;

import assert from "assert";

const origFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (url.includes("/api/founder-coach/brief")) {
    return new Response(
      JSON.stringify({
        weekStart: "2026-08-11",
        weeklyPlan: { founderFocus: "CAC for Google" },
        domains: [{ id: "clinical", title: "Clinical", status: "attention", summary: "flagged" }],
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
  const token = "x".repeat(40);

  const stopMsgs = [
    "how to get CAC sorted",
    "PRESIDENT OF USA",
    "why not this is supposed to train staff about current american culture",
  ];
  for (const msg of stopMsgs) {
    const r = await runSiyaAssistantAsync(msg, [], { authToken: token, surface: "founder-coach" });
    console.log("\nSTOP USER:", msg);
    console.log(r.message);
    assert.equal(r.ruleFinal, true);
    assert.notEqual(r.llmUsed, true);
    assert.ok(
      /don't have an approved|don.?t invent|outside what I can help|civics trivia|don.?t pick songs/i.test(
        r.message,
      ),
    );
    assert.ok(!/Customer Acquisition Cost|Total Cost of Sales|\\text\{CAC\}/i.test(r.message));
    assert.ok(!/On shift now|Rock Star|Alpana/i.test(r.message));
  }

  const brand = await runSiyaAssistantAsync(
    "whats my default background color as per marketing desgin brand system",
    [],
    { authToken: token, surface: "founder-coach" },
  );
  console.log("\nBRAND:", brand.message.slice(0, 200));
  assert.ok(/#fffdf6/.test(brand.message));
  assert.equal(brand.ruleFinal, true);

  console.log("\nfounder-no-invent-ok");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
