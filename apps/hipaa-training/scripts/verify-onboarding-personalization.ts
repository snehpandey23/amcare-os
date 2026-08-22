/**
 * Verify onboarding personalization fields (preferred name, Assist label, training reminder).
 *
 * Usage:
 *   ASSIST_EMAIL='…' ASSIST_PASSWORD='…' npx tsx apps/hipaa-training/scripts/verify-onboarding-personalization.ts
 *
 * Optional:
 *   STAFF_APP_URL=https://siya-staff-assist.vercel.app
 *   HIPAA_TRAINING_API_URL=https://siya-staff-auth-api.vercel.app
 */
import { writeFileSync, mkdirSync } from "fs";
import { dirname, resolve } from "path";
import {
  displayAssistantLabel,
  displayPreferredName,
  shouldShowTrainingNudge,
  type PortalProfile,
} from "../src/lib/portal-profile";

const AUTH = (process.env.HIPAA_TRAINING_API_URL || "https://siya-staff-auth-api.vercel.app").replace(/\/$/, "");
const OUT = resolve(
  process.cwd().includes("hipaa-training") ? "." : "apps/hipaa-training",
  ".cursor-verify/onboarding-personalization.json",
);

type Row = { id: string; pass: boolean; detail: string };
const rows: Row[] = [];

function pass(id: string, detail: string) {
  rows.push({ id, pass: true, detail });
  console.log(`PASS\t${id}\t${detail}`);
}

function fail(id: string, detail: string) {
  rows.push({ id, pass: false, detail });
  console.error(`FAIL\t${id}\t${detail}`);
}

async function login(): Promise<{ token: string; userId: string; name: string }> {
  const email = (process.env.ASSIST_EMAIL || "").trim();
  const password = (process.env.ASSIST_PASSWORD || "").trim();
  if (!email || !password) {
    throw new Error("ASSIST_EMAIL and ASSIST_PASSWORD required for authenticated verification");
  }
  const res = await fetch(`${AUTH}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    token?: string;
    accessToken?: string;
    user?: { id?: string; name?: string };
    error?: string;
  };
  const token = (data.token || data.accessToken || "").trim();
  if (!res.ok || token.length < 20 || !data.user?.id) {
    throw new Error(`login failed: ${res.status} ${data.error || JSON.stringify(data)}`);
  }
  return { token, userId: data.user.id, name: data.user.name || "" };
}

async function saveProfile(token: string, profile: PortalProfile): Promise<void> {
  const res = await fetch(`${AUTH}/api/portal/profile`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`profile PUT failed: ${res.status} ${err}`);
  }
}

async function loadProfile(token: string): Promise<PortalProfile | null> {
  const res = await fetch(`${AUTH}/api/portal/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { profile?: PortalProfile | null };
  return data.profile ?? null;
}

function runUnitTests() {
  const base: PortalProfile = {
    onboardingComplete: true,
    department: "clinical",
    experience: [],
    improveGoals: [],
    biggestChallenge: "",
    preferredName: "Priya",
    assistantName: "Nova",
    trainingReminder: "end",
  };

  if (displayPreferredName(base, "Sneh Pandey") !== "Priya") {
    fail("unit-preferred-name", "preferredName should win over account name");
  } else {
    pass("unit-preferred-name", "Priya");
  }

  if (displayAssistantLabel(base) !== "Nova") {
    fail("unit-assistant-label", "custom assistant label");
  } else {
    pass("unit-assistant-label", "Nova");
  }

  if (shouldShowTrainingNudge(base, "start")) {
    fail("unit-reminder-end", "end preference should hide start nudge");
  } else {
    pass("unit-reminder-end-hide-start", "start hidden");
  }

  if (!shouldShowTrainingNudge(base, "end")) {
    fail("unit-reminder-end-show", "end preference should show end nudge");
  } else {
    pass("unit-reminder-end-show", "end shown");
  }

  const none: PortalProfile = { ...base, trainingReminder: "none" };
  if (shouldShowTrainingNudge(none, "start") || shouldShowTrainingNudge(none, "end")) {
    fail("unit-reminder-none", "none should hide all nudges");
  } else {
    pass("unit-reminder-none", "all hidden");
  }
}

async function runAuthTests() {
  const { token, name } = await login();
  const testProfile: PortalProfile = {
    onboardingComplete: true,
    department: "operations",
    experience: ["remote"],
    improveGoals: ["Productivity"],
    biggestChallenge: "Verify personalization wiring",
    preferredName: "Alex",
    assistantName: "Chip",
    trainingReminder: "start",
    completedAt: Date.now(),
  };

  await saveProfile(token, testProfile);
  const remote = await loadProfile(token);
  if (!remote) {
    fail("auth-profile-roundtrip", "GET profile returned empty");
    return;
  }

  if (remote.preferredName !== "Alex") {
    fail("auth-preferred-name", `expected Alex, got ${remote.preferredName}`);
  } else {
    pass("auth-preferred-name", "Alex persisted");
  }

  if (remote.assistantName !== "Chip") {
    fail("auth-assistant-name", `expected Chip, got ${remote.assistantName}`);
  } else {
    pass("auth-assistant-name", "Chip persisted");
  }

  if (remote.trainingReminder !== "start") {
    fail("auth-training-reminder", `expected start, got ${remote.trainingReminder}`);
  } else {
    pass("auth-training-reminder", "start persisted");
  }

  const greeting = displayPreferredName(remote, name);
  if (greeting !== "Alex") {
    fail("auth-greeting-name", `greeting ${greeting}`);
  } else {
    pass("auth-greeting-name", `Good morning, ${greeting}`);
  }

  if (displayAssistantLabel(remote) !== "Chip") {
    fail("auth-assist-label", displayAssistantLabel(remote));
  } else {
    pass("auth-assist-label", "I'm Chip");
  }

  if (!shouldShowTrainingNudge(remote, "start") || shouldShowTrainingNudge(remote, "end")) {
    fail("auth-nudge-timing", "start-only nudge mismatch");
  } else {
    pass("auth-nudge-timing", "start nudge on, end off");
  }
}

async function main() {
  runUnitTests();
  try {
    await runAuthTests();
  } catch (e) {
    fail("auth-setup", e instanceof Error ? e.message : String(e));
  }

  const passed = rows.filter((r) => r.pass).length;
  const payload = {
    at: new Date().toISOString(),
    auth: AUTH,
    passed,
    total: rows.length,
    rows,
    failed: rows.filter((r) => !r.pass),
  };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(`\nWrote ${OUT}`);
  process.exit(rows.some((r) => !r.pass) ? 1 : 0);
}

void main();
