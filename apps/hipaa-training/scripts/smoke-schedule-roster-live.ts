/**
 * Live verify schedule intents (local engine + live APIs after auth deploy).
 *   source scripts/agent-qa-env.sh
 *   cd apps/hipaa-training && npx tsx scripts/smoke-schedule-roster-live.ts
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

async function main() {
  assert.ok(email && password);
  const login = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json() as Promise<{ token?: string; user?: { role?: string } }>);
  assert.ok(login.token);
  console.log("login", email, login.user?.role);

  const teamApi = await fetch(`${API}/api/shift-roster/team?from=2026-09-01&to=2026-09-30`, {
    headers: { Authorization: `Bearer ${login.token}` },
  });
  assert.equal(teamApi.status, 200, `team API ${teamApi.status}`);
  const teamData = (await teamApi.json()) as { count: number; rows: { userName?: string; personKey: string }[] };
  assert.ok(teamData.count > 0, "September team roster should have rows");
  const names = new Set(
    teamData.rows.map((r) => (r.userName || r.personKey || "").toLowerCase()).filter(Boolean),
  );
  assert.ok(names.size >= 2, `expected multiple people, got ${names.size}`);
  console.log("team API OK", teamData.count, "rows", names.size, "people");

  const { runSiyaAssistantAsync } = await import("../src/lib/siya-os/engine");

  const cases: { message: string; must: RegExp; mustNot?: RegExp; team?: boolean }[] = [
    {
      message: "when do I work this week",
      must: /schedule|this week|shift_roster|No schedule data/i,
      mustNot: /MA duty roster \(.*\)[\s\S]*people on duty in range/i,
    },
    {
      message: "who is on duty tomorrow",
      must: /MA duty roster|on duty|team view|No team roster/i,
      mustNot: /Team pulse/i,
      team: true,
    },
    {
      message: "who is working tomorrow",
      must: /MA duty roster|team view|No team roster/i,
      mustNot: /Team pulse/i,
      team: true,
    },
    {
      message: "show the MA duty roster for September",
      must: /MA duty roster|September|team view|not self-only/i,
      team: true,
    },
    {
      message: "who is working right now",
      must: /Team pulse/i,
      mustNot: /MA duty roster/i,
    },
  ];

  for (const surface of ["default", "founder-coach"] as const) {
    for (const c of cases) {
      const r = await runSiyaAssistantAsync(c.message, [], {
        authToken: login.token,
        surface,
      });
      const label = `${surface}: ${c.message}`;
      assert.ok(!SOFT.test(r.message || ""), `${label} soft-stop`);
      assert.ok(!r.knowledgeGap, `${label} knowledgeGap`);
      assert.ok(r.ruleFinal !== false, `${label} ruleFinal`);
      assert.match(r.message || "", c.must, `${label} must`);
      if (c.mustNot) assert.doesNotMatch(r.message || "", c.mustNot, `${label} mustNot`);
      if (c.team) {
        assert.match(r.message || "", /not self-only|Team MA roster|admins and department leads/i);
        // Admin should get multi-person team data when rows exist
        if (!/admins and department leads only/i.test(r.message || "")) {
          assert.match(r.message || "", /roster row|people on duty|OFF:/i);
        }
      }
      console.log(`OK\t${label}\t${(r.message || "").slice(0, 100).replace(/\n/g, " ")}`);
    }
  }
  console.log("smoke-schedule-roster-live: OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
