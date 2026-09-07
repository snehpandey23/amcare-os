/**
 * Dual-surface: Founder Talk + staff Ask must not soft-stop on ops/practice/tasks asks.
 * Uses QA login (non-admin → pointer / My day — still ruleFinal, no knowledge gap).
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/smoke-ops-founder-asks-dual.ts
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

const ASKS = [
  "has anyone tried any drills",
  "are staff members loggin into OS?",
  "i want to know staff performance",
  "urgent tasks for me?",
];

async function login(): Promise<string> {
  assert.ok(email && password, "ASSIST_EMAIL/PASSWORD required");
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
  const token = await login();
  const { runSiyaAssistantAsync } = await import("../src/lib/siya-os/engine");

  for (const surface of ["default", "founder-coach"] as const) {
    for (const message of ASKS) {
      const r = await runSiyaAssistantAsync(message, [], {
        authToken: token,
        surface,
      });
      const label = `${surface}: ${message}`;
      assert.ok(!r.knowledgeGap, `${label} knowledgeGap=${r.knowledgeGap} msg=${(r.message || "").slice(0, 160)}`);
      assert.equal(r.ruleFinal, true, `${label} ruleFinal`);
      assert.ok(!SOFT.test(r.message || ""), `${label} soft-stop: ${r.message?.slice(0, 160)}`);
      console.log(`OK\t${label}\t${(r.message || "").slice(0, 80).replace(/\n/g, " ")}`);
    }
  }
  console.log("smoke-ops-founder-asks-dual: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
