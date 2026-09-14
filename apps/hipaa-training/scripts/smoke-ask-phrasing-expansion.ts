/**
 * Phrasing-expansion pass — person attendance + Team pulse variants.
 *
 *   cd apps/hipaa-training && npx tsx scripts/smoke-ask-phrasing-expansion.ts
 *
 * 1) Asserts every banked phrasing hits the intended detector (full bank).
 * 2) Samples 8–10 variants per category through the engine (dual surface when possible).
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
  PERSON_ATTENDANCE_PHRASINGS,
  PERSON_ATTENDANCE_NEGATIVE_PHRASINGS,
  TEAM_PULSE_PHRASINGS,
  TEAM_PULSE_NEGATIVE_PHRASINGS,
} from "../src/lib/siya-os/ask-phrasing-variants";
import {
  detectAdminOpsIntent,
  isTeamPulseAsk,
} from "../src/lib/siya-os/admin-ops-coach";
import {
  extractAttendanceSubjectName,
  isPersonAttendanceQuery,
  parseAttendanceHoursPeriod,
} from "../src/lib/siya-os/attendance-person-ask";
import { isMyAttendanceQuery } from "../src/lib/siya-os/personal-self-ask";
import { isTeamRosterQuery } from "../src/lib/siya-os/shift-roster-ask";

const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/ask-phrasing-expansion.json",
);

function pickSample<T>(arr: readonly T[], n: number): T[] {
  if (arr.length <= n) return [...arr];
  const step = arr.length / n;
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(i * step + step / 2)]!);
  return out;
}

function pass(id: string, detail?: string) {
  console.log(`PASS\t${id}${detail ? `\t${detail}` : ""}`);
}

async function main() {
  const attendanceHits: { q: string; ok: boolean; subject: string | null }[] = [];
  for (const q of PERSON_ATTENDANCE_PHRASINGS) {
    const ok =
      isPersonAttendanceQuery(q) &&
      !isMyAttendanceQuery(q) &&
      !isTeamPulseAsk(q) &&
      !isTeamRosterQuery(q);
    attendanceHits.push({ q, ok, subject: extractAttendanceSubjectName(q) });
    assert.ok(ok, `person-attendance miss: ${q}`);
    assert.ok(extractAttendanceSubjectName(q), `subject missing: ${q}`);
  }
  pass("person-attendance-bank", `${PERSON_ATTENDANCE_PHRASINGS.length} variants`);

  for (const q of PERSON_ATTENDANCE_NEGATIVE_PHRASINGS) {
    assert.equal(isPersonAttendanceQuery(q), false, `false positive attendance: ${q}`);
  }
  pass("person-attendance-negatives");

  // Multi-month + last month period parsing
  const augSep = parseAttendanceHoursPeriod("pull up Anmol's attendance for August and September");
  assert.ok(augSep.from.endsWith("-08-01"), `aug start ${augSep.from}`);
  assert.ok(/-09-30$/.test(augSep.to), `sep end ${augSep.to}`);
  const last = parseAttendanceHoursPeriod("how many hours did Sonu work last month");
  assert.ok(last.from < last.to || last.from === last.to.slice(0, 8) + "01");
  pass("attendance-period-parse", `${augSep.label} · ${last.label}`);

  const pulseHits: { q: string; ok: boolean }[] = [];
  for (const q of TEAM_PULSE_PHRASINGS) {
    const ok = isTeamPulseAsk(q) && !isTeamRosterQuery(q) && !isPersonAttendanceQuery(q);
    pulseHits.push({ q, ok });
    assert.ok(isTeamPulseAsk(q), `pulse miss: ${q}`);
    assert.equal(isTeamRosterQuery(q), false, `roster steal: ${q}`);
    assert.equal(detectAdminOpsIntent(q)?.kind, "team_pulse", `intent miss: ${q}`);
  }
  pass("team-pulse-bank", `${TEAM_PULSE_PHRASINGS.length} variants`);

  for (const q of TEAM_PULSE_NEGATIVE_PHRASINGS) {
    assert.equal(isTeamPulseAsk(q), false, `false positive pulse: ${q}`);
  }
  pass("team-pulse-negatives");

  const sampleAttendance = pickSample(PERSON_ATTENDANCE_PHRASINGS, 10);
  const samplePulse = pickSample(TEAM_PULSE_PHRASINGS, 10);
  const live: Record<string, unknown> = { attendance: [], pulse: [] };

  const email = process.env.ASSIST_EMAIL || process.env.QA_EMAIL || "";
  const password = process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD || "";
  if (email && password) {
    const API = process.env.HIPAA_TRAINING_API_URL!;
    const loginRes = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginData = (await loginRes.json()) as { token?: string; error?: string };
    assert.ok(loginRes.ok && loginData.token, loginData.error || "login failed");
    pass("live-login", `${email.replace(/^(.).+(@.*)$/, "$1***$2")} → ${API}`);
    const { runSiyaAssistantAsync } = await import("../src/lib/siya-os/engine");
    const SOFT = /right staff guide for that yet|No approved guide yet|I don't have an approved/i;
    const PULSE = /Team pulse|On shift now|No one is marked on shift|Pulse shows/i;
    const ATTEND = /attendance hours|Working \*\*|no hours logged|No attendance match|admins and department leads/i;

    for (const surface of ["default", "founder-coach"] as const) {
      console.log(`\n=== LIVE ${surface} · person attendance (${sampleAttendance.length}) ===`);
      for (const q of sampleAttendance) {
        const r = await runSiyaAssistantAsync(q, [], { authToken: loginData.token!, surface });
        const msg = r.message || "";
        assert.ok(!SOFT.test(msg), `${surface} soft-stop attendance: ${q}`);
        assert.ok(ATTEND.test(msg), `${surface} attendance route fail: ${q} → ${msg.slice(0, 200)}`);
        assert.equal(r.ruleFinal, true);
        const row = {
          surface,
          q,
          ok: true,
          ruleFinal: r.ruleFinal,
          task: r.routing?.task,
          department: r.routing?.department,
          preview: msg.replace(/\s+/g, " ").trim().slice(0, 220),
        };
        (live.attendance as unknown[]).push(row);
        console.log(`  Q: ${q}`);
        console.log(`  → [${row.department}/${row.task}] ${row.preview}`);
      }
      console.log(`\n=== LIVE ${surface} · team pulse (${samplePulse.length}) ===`);
      for (const q of samplePulse) {
        const r = await runSiyaAssistantAsync(q, [], { authToken: loginData.token!, surface });
        const msg = r.message || "";
        assert.ok(!SOFT.test(msg), `${surface} soft-stop pulse: ${q}`);
        assert.ok(PULSE.test(msg), `${surface} pulse route fail: ${q} → ${msg.slice(0, 200)}`);
        assert.equal(r.ruleFinal, true);
        const row = {
          surface,
          q,
          ok: true,
          ruleFinal: r.ruleFinal,
          task: r.routing?.task,
          department: r.routing?.department,
          preview: msg.replace(/\s+/g, " ").trim().slice(0, 220),
        };
        (live.pulse as unknown[]).push(row);
        console.log(`  Q: ${q}`);
        console.log(`  → [${row.department}/${row.task}] ${row.preview}`);
      }
    }
    pass(
      "live-sample",
      `attendance×${sampleAttendance.length} pulse×${samplePulse.length} × dual surface (${(live.attendance as unknown[]).length + (live.pulse as unknown[]).length} calls)`,
    );
  } else {
    console.log("SKIP\tlive-engine\t(set ASSIST_EMAIL/PASSWORD for live sample)");
    live.skipped = "no credentials";
  }

  mkdirSync(resolve(OUT, ".."), { recursive: true });
  writeFileSync(
    OUT,
    JSON.stringify(
      {
        personAttendanceCount: PERSON_ATTENDANCE_PHRASINGS.length,
        teamPulseCount: TEAM_PULSE_PHRASINGS.length,
        personAttendance: PERSON_ATTENDANCE_PHRASINGS,
        teamPulse: TEAM_PULSE_PHRASINGS,
        sampleAttendance,
        samplePulse,
        live,
      },
      null,
      2,
    ),
  );
  console.log("ok: smoke-ask-phrasing-expansion →", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
