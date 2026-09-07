/**
 * Dual-surface smoke: typing speed / Needs Attention / Founder Focus.
 *
 *   source scripts/agent-qa-env.sh
 *   cd apps/hipaa-training && npx tsx scripts/smoke-ask-gaps-typing-focus-attention.ts
 */
process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL =
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  process.env.HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app";
process.env.HIPAA_TRAINING_API_URL = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL;

import assert from "node:assert/strict";

const API = process.env.HIPAA_TRAINING_API_URL!;
const email = process.env.ASSIST_EMAIL || process.env.QA_EMAIL || "";
const password = process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD || "";

const SOFT = /right staff guide for that yet|No approved guide yet/i;

const CASES: {
  message: string;
  mustMatch: RegExp;
  mustNot?: RegExp;
}[] = [
  {
    message: "How is my typing speed",
    mustMatch: /Practice stats|Personal best typing|WPM|none logged yet/i,
    mustNot: /Open the \*\*Chat speed|start a typing drill/i,
  },
  {
    message: "What needs my attention today?",
    mustMatch: /Needs Attention|SOP|check-in|coverage|not engaged|admin summary/i,
  },
  {
    message: "What's my focus today?",
    mustMatch: /Founder Focus|This week.?s plan|Empty right now/i,
  },
];

async function login(): Promise<string> {
  assert.ok(email && password, "ASSIST_EMAIL/PASSWORD required (admin preferred)");
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  assert.ok(res.ok && data.token, data.error || `login ${res.status}`);
  return data.token!;
}

async function main() {
  const { isMyTypingSpeedQuery } = await import("../src/lib/siya-os/practice-stats-ask");
  const { isOpsNeedsAttentionQuery } = await import("../src/lib/siya-os/ops-attention-ask");
  const { isFounderFocusQuery } = await import("../src/lib/siya-os/founder-focus-ask");

  assert.ok(isMyTypingSpeedQuery("How is my typing speed"));
  assert.ok(isOpsNeedsAttentionQuery("What needs my attention today?"));
  assert.ok(isFounderFocusQuery("What's my focus today?"));
  assert.ok(!isFounderFocusQuery("what should I focus on today"));

  const token = await login();
  const { runSiyaAssistantAsync } = await import("../src/lib/siya-os/engine");

  for (const surface of ["default", "founder-coach"] as const) {
    for (const c of CASES) {
      const r = await runSiyaAssistantAsync(c.message, [], {
        authToken: token,
        surface,
      });
      const label = `${surface}: ${c.message}`;
      assert.ok(!r.knowledgeGap, `${label} knowledgeGap msg=${(r.message || "").slice(0, 200)}`);
      assert.equal(r.ruleFinal, true, `${label} ruleFinal`);
      assert.ok(!SOFT.test(r.message || ""), `${label} soft-stop: ${(r.message || "").slice(0, 200)}`);
      assert.match(r.message || "", c.mustMatch, `${label} mustMatch`);
      if (c.mustNot) {
        assert.doesNotMatch(r.message || "", c.mustNot, `${label} mustNot`);
      }
      console.log(`OK\t${label}\t${(r.message || "").slice(0, 120).replace(/\n/g, " ")}`);
    }
  }
  console.log("smoke-ask-gaps-typing-focus-attention: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
