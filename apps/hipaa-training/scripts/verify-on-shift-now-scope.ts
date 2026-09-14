/**
 * Live presence scope — "who is on shift now" must be Team pulse (not month roster),
 * and corrections like "today, right now, not the entire thing" re-scope to pulse.
 *
 *   source scripts/agent-qa-env.sh
 *   npx tsx apps/hipaa-training/scripts/verify-on-shift-now-scope.ts
 */
process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL =
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  process.env.HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app";
process.env.HIPAA_TRAINING_API_URL = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL;

import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  detectAdminOpsIntent,
  isPresenceRescopeCorrection,
  isPresenceTopicContinuation,
  isTeamPulseAsk,
} from "../src/lib/siya-os/admin-ops-coach";
import { isTeamRosterQuery } from "../src/lib/siya-os/shift-roster-ask";

const OUT = resolve(process.cwd(), ".cursor-verify/on-shift-now-scope.json");
mkdirSync(resolve(OUT, ".."), { recursive: true });

const SOFT = /right staff guide for that yet|No approved guide yet|I don't have an approved/i;
const ROSTER_DUMP = /MA duty roster|shift_roster|Imported MA roster|\d{4}-\d{2}-\d{2} → \d{4}-\d{2}-\d{2}/i;
const PULSE = /Team pulse|On shift now|No one is marked on shift/i;

const API = process.env.HIPAA_TRAINING_API_URL!;
const email = process.env.ASSIST_EMAIL || process.env.QA_EMAIL || "";
const password = process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD || "";

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
  // Unit: routing
  assert.equal(isTeamPulseAsk("who is on shift now"), true);
  assert.equal(isTeamRosterQuery("who is on shift now"), false);
  assert.equal(detectAdminOpsIntent("who is on shift now")?.kind, "team_pulse");
  assert.equal(isTeamRosterQuery("who is on duty tomorrow"), true);
  assert.equal(isTeamPulseAsk("who is on duty tomorrow"), false);

  const follow = "today, right now, not the entire thing";
  assert.equal(isPresenceRescopeCorrection(follow), true);
  const hist = [
    { role: "user", content: "who is on shift now" },
    {
      role: "assistant",
      content: "**MA duty roster (September 2026, IST)**\n_Team view · 2026-09-01 → 2026-09-30 · source: shift_roster_",
    },
  ];
  assert.equal(isPresenceTopicContinuation(follow, hist), true);
  assert.equal(detectAdminOpsIntent(follow, hist)?.kind, "team_pulse");
  console.log("PASS\tunit-routing");

  const token = await login();
  const { runSiyaAssistantAsync } = await import("../src/lib/siya-os/engine");
  const evidence: Record<string, unknown> = {};

  for (const surface of ["default", "founder-coach"] as const) {
    const q1 = "who is on shift now";
    const r1 = await runSiyaAssistantAsync(q1, [], { authToken: token, surface });
    assert.ok(!SOFT.test(r1.message || ""), `${surface} soft-stop on ${q1}`);
    assert.ok(!ROSTER_DUMP.test(r1.message || ""), `${surface} roster dump: ${(r1.message || "").slice(0, 200)}`);
    assert.ok(PULSE.test(r1.message || ""), `${surface} expected pulse: ${(r1.message || "").slice(0, 200)}`);
    assert.equal(r1.ruleFinal, true);
    console.log(`PASS\t${surface}\t${q1}\t${(r1.message || "").slice(0, 90).replace(/\n/g, " ")}`);

    const history = [
      { role: "user" as const, content: q1 },
      { role: "assistant" as const, content: r1.message || "" },
    ];
    // Simulate prior wrong dump in history, then correction
    const badHist = [
      { role: "user" as const, content: q1 },
      {
        role: "assistant" as const,
        content:
          "**MA duty roster (September 2026, IST)**\n_Team view · 2026-09-01 → 2026-09-30 · source: shift_roster_\n(entire month)",
      },
    ];
    const r2 = await runSiyaAssistantAsync(follow, badHist, { authToken: token, surface });
    assert.ok(!SOFT.test(r2.message || ""), `${surface} soft-stop on correction`);
    assert.ok(!ROSTER_DUMP.test(r2.message || ""), `${surface} correction still roster: ${(r2.message || "").slice(0, 200)}`);
    assert.ok(PULSE.test(r2.message || ""), `${surface} correction expected pulse: ${(r2.message || "").slice(0, 200)}`);
    console.log(`PASS\t${surface}\tcorrection\t${(r2.message || "").slice(0, 90).replace(/\n/g, " ")}`);

    evidence[surface] = {
      onShiftNow: (r1.message || "").slice(0, 500),
      correction: (r2.message || "").slice(0, 500),
      afterRealPulse: (
        await runSiyaAssistantAsync(follow, history, { authToken: token, surface })
      ).message?.slice(0, 300),
    };
  }

  writeFileSync(OUT, JSON.stringify(evidence, null, 2));
  console.log("ok: verify-on-shift-now-scope →", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
