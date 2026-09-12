/**
 * Personal practice / attendance / feedback asks — intent + recommendation, then live Ask + Talk.
 *
 *   source scripts/agent-qa-env.sh
 *   cd apps/hipaa-training && npx tsx scripts/smoke-personal-practice-ask.ts
 */
process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL =
  process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL ||
  process.env.HIPAA_TRAINING_API_URL ||
  "https://siya-staff-auth-api.vercel.app";
process.env.HIPAA_TRAINING_API_URL = process.env.NEXT_PUBLIC_HIPAA_TRAINING_API_URL;

import assert from "node:assert/strict";
import {
  classifyPersonalPracticeAsk,
  formatPracticeRecommendation,
} from "../src/lib/siya-os/practice-stats-ask";
import { isMyAttendanceQuery, isMyFeedbackQuery } from "../src/lib/siya-os/personal-self-ask";
import type { LevelUpProgress } from "../src/lib/level-up/progress";
import type { ProgressState } from "../src/lib/types";

const PHRASES: Array<{
  message: string;
  kind: "stats" | "recommend" | "last_typing" | "last_chat_sim" | "attendance" | "feedback";
}> = [
  { message: "how are my training scores", kind: "stats" },
  { message: "what tests should I do", kind: "recommend" },
  { message: "what drills should I do", kind: "recommend" },
  { message: "what should I practice next", kind: "recommend" },
  { message: "what was my last typing speed", kind: "last_typing" },
  { message: "when did I last do the chat simulator", kind: "last_chat_sim" },
  { message: "how's my attendance", kind: "attendance" },
  { message: "what feedback have I received", kind: "feedback" },
  { message: "practice chat simulator", kind: "last_chat_sim" },
  { message: "check my scores", kind: "stats" },
  { message: "my feedback", kind: "feedback" },
  { message: "my attendance", kind: "attendance" },
];

function classify(message: string) {
  if (isMyAttendanceQuery(message)) return "attendance" as const;
  if (isMyFeedbackQuery(message)) return "feedback" as const;
  return classifyPersonalPracticeAsk(message);
}

for (const c of PHRASES) {
  assert.equal(classify(c.message), c.kind, c.message);
}
assert.equal(classify("start a typing drill"), null);
assert.equal(isMyFeedbackQuery("how do I give feedback"), false);
console.log("ok: phrase intents");

const emptyHipaa = {
  modulesCompleted: [],
  moduleQuizScores: {},
} as ProgressState;
const partialHipaa = {
  modulesCompleted: ["intro"],
  moduleQuizScores: { intro: { correct: 4, total: 5, at: 1 } },
} as unknown as ProgressState;

const ledger: LevelUpProgress = {
  streak: 3,
  lastActiveDate: "2026-09-01",
  completedToday: [],
  totalXp: 10,
  dayLedger: [
    {
      id: "t1",
      date: "2026-08-01",
      drill: "typing",
      at: Date.parse("2026-08-01T12:00:00Z"),
      xpAwarded: 10,
      wpm: 42,
      accuracy: 0.95,
    },
    {
      id: "c1",
      date: "2026-08-10",
      drill: "patientChat",
      at: Date.parse("2026-08-10T12:00:00Z"),
      xpAwarded: 0,
      chatSim: { personaName: "Dr. Priya", outcome: "completed" },
    },
  ],
};

const rec = formatPracticeRecommendation(ledger, partialHipaa, new Date("2026-09-08T12:00:00Z"));
assert.match(rec, /Continue \*\*HIPAA training\*\*/);
assert.match(rec, /chat simulator/i);
assert.match(rec, /42 WPM/);
assert.match(rec, /2026-08-10/);
assert.match(rec, /streak \*\*3\*\*/);
assert.match(rec, /not logged yet|last logged/);
console.log("ok: recommendation uses HIPAA gap, stale chat-sim, and real numbers");

const doneHipaa = {
  modulesCompleted: ["intro", "ce-ba", "phi", "privacy", "rights", "security", "safeguards", "breach", "enforcement", "admin-simp"],
  moduleQuizScores: {},
} as unknown as ProgressState;
const fresh = formatPracticeRecommendation(
  {
    ...ledger,
    streak: 1,
    dayLedger: [
      {
        id: "t2",
        date: "2026-09-08",
        drill: "typing",
        at: Date.parse("2026-09-08T10:00:00Z"),
        xpAwarded: 10,
        wpm: 50,
        accuracy: 1,
      },
      {
        id: "c2",
        date: "2026-09-07",
        drill: "patientChat",
        at: Date.parse("2026-09-07T10:00:00Z"),
        xpAwarded: 0,
        chatSim: { personaName: "Emma", outcome: "completed" },
      },
      ...["english", "documentation", "compliance", "healthterm", "trivia", "billing", "timezone", "map"].map(
        (drill, i) => ({
          id: `d${i}`,
          date: "2026-09-06",
          drill: drill as "english",
          at: Date.parse("2026-09-06T10:00:00Z"),
          xpAwarded: 0,
        }),
      ),
    ],
  },
  doneHipaa,
  new Date("2026-09-08T12:00:00Z"),
);
assert.doesNotMatch(fresh, /Continue \*\*HIPAA training\*\*/);
assert.match(fresh, /50 WPM/);
console.log("ok: complete HIPAA + fresh chat-sim does not force HIPAA continue");

const API = process.env.HIPAA_TRAINING_API_URL!;
const email = process.env.ASSIST_EMAIL || process.env.QA_EMAIL || "";
const password = process.env.ASSIST_PASSWORD || process.env.QA_PASSWORD || "";
const SOFT = /right staff guide for that yet|No approved guide yet|no available guide/i;

async function login(): Promise<string | null> {
  if (!email || !password) return null;
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { token?: string; error?: string };
  if (!res.ok || !data.token) return null;
  return data.token;
}

async function main() {
  const token = await login();
  if (!token) {
    console.log("skip live Ask/Talk — ASSIST_EMAIL/PASSWORD not set");
    return;
  }
  const { runSiyaAssistantAsync } = await import("../src/lib/siya-os/engine");
  const live = PHRASES.filter((c) =>
    [
      "how are my training scores",
      "what tests should I do",
      "what drills should I do",
      "what should I practice next",
      "what was my last typing speed",
      "when did I last do the chat simulator",
      "how's my attendance",
      "what feedback have I received",
    ].includes(c.message),
  );
  for (const surface of ["default", "founder-coach"] as const) {
    for (const c of live) {
      const r = await runSiyaAssistantAsync(c.message, [], { authToken: token, surface });
      const label = `${surface}: ${c.message}`;
      assert.equal(r.ruleFinal, true, `${label} ruleFinal`);
      assert.equal(r.knowledgeGap, false, `${label} knowledgeGap`);
      assert.ok(!SOFT.test(r.message || ""), `${label} soft-stop: ${(r.message || "").slice(0, 220)}`);
      if (c.kind === "recommend") {
        assert.match(r.message || "", /What to practice next|HIPAA|streak/i, label);
        assert.match(r.message || "", /Current numbers/i, label);
      } else if (c.kind === "last_typing") {
        assert.match(r.message || "", /last typing speed|WPM|none logged/i, label);
      } else if (c.kind === "last_chat_sim") {
        assert.match(r.message || "", /chat simulator/i, label);
      } else if (c.kind === "attendance") {
        assert.match(r.message || "", /attendance hours/i, label);
      } else if (c.kind === "feedback") {
        assert.match(r.message || "", /Feedback you.?ve received|inbox/i, label);
      } else {
        assert.match(r.message || "", /Practice stats|HIPAA training|WPM/i, label);
      }
      console.log(`OK\t${label}\t${(r.message || "").slice(0, 140).replace(/\n/g, " ")}`);
    }
  }
  console.log("ok: live Ask + Talk");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
