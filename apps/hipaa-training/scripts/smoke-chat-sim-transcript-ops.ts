/**
 * P0 — chat-sim transcript persistence + Ops review listing.
 *   npx tsx apps/hipaa-training/scripts/smoke-chat-sim-transcript-ops.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  applyDailyComplete,
  buildChatSimTranscript,
  chatSimHasReviewableTranscript,
  collectChatSimReviewsFromEngagement,
  listChatSimSessions,
  type LevelUpProgress,
} from "../src/lib/level-up/progress";

function empty(): LevelUpProgress {
  return { streak: 0, lastActiveDate: "", completedToday: [], totalXp: 0, dayLedger: [] };
}

const EMMA_LINES = [
  {
    who: "Emma",
    text: "I was on Adderall in high school and I need to get back on it. How long will this take?",
  },
  {
    who: "you",
    text: "I'll see if I can get you Adderall today — don't worry about the agreement.",
  },
  {
    who: "Emma",
    text: "I'm ending this chat. That isn't how care works here.",
  },
];

const transcript = buildChatSimTranscript(EMMA_LINES);
assert.equal(transcript.length, 3);
assert.equal(transcript[1]!.who, "you");
assert.ok(transcript[0]!.text.includes("Adderall"));

let p = empty();
p = applyDailyComplete(p, "patientChat", {
  date: "2026-09-05",
  now: Date.parse("2026-09-05T14:00:00Z"),
  chatSim: {
    personaId: "persona-emma",
    personaName: "Emma",
    outcome: "red_flag",
    redFlagged: true,
    safetyReasons: ["clinical_decision_making"],
    politenessScore: 0,
    grammarScore: 100,
    transcript,
    endReason: "Wrong track — session stopped",
    transcriptVersion: 1,
  },
});

// Legacy summary-only flag (pre-transcript) — like tonight's missed_high_urgency_triage
p = applyDailyComplete(p, "patientChat", {
  date: "2026-09-04",
  now: Date.parse("2026-09-04T10:00:00Z"),
  chatSim: {
    personaId: "persona-sam",
    personaName: "Sam",
    outcome: "red_flag",
    redFlagged: true,
    safetyReasons: ["missed_high_urgency_triage"],
    politenessScore: 50,
    grammarScore: 50,
  },
});

// Soft stop with transcript
p = applyDailyComplete(p, "patientChat", {
  date: "2026-09-05",
  now: Date.parse("2026-09-05T15:00:00Z"),
  chatSim: {
    personaId: "persona-sam",
    personaName: "Sam",
    outcome: "soft_stop",
    redFlagged: false,
    safetyReasons: ["missed_moderate_safety_net"],
    transcript: buildChatSimTranscript([
      { who: "Sam", text: "My headache is getting worse." },
      { who: "you", text: "Just wait for the doctor." },
    ]),
    transcriptVersion: 1,
  },
});

const flagged = listChatSimSessions(p, { redFlaggedOnly: true });
assert.equal(flagged.length, 2);

const reviewable = listChatSimSessions(p, { reviewOutcomesOnly: true });
assert.equal(reviewable.length, 3);

const withTx = reviewable.filter((e) => chatSimHasReviewableTranscript(e.chatSim));
assert.equal(withTx.length, 2);

const legacyHighUrgency = flagged.find(
  (e) => e.chatSim?.safetyReasons?.includes("missed_high_urgency_triage"),
);
assert.ok(legacyHighUrgency);
assert.equal(chatSimHasReviewableTranscript(legacyHighUrgency!.chatSim), false);

const emma = flagged.find((e) => e.chatSim?.personaName === "Emma");
assert.ok(emma);
assert.equal(emma!.chatSim!.transcript!.length, 3);
assert.ok(emma!.chatSim!.transcript!.some((t) => t.text.includes("get you Adderall")));

const opsRows = collectChatSimReviewsFromEngagement([
  {
    userId: "u1",
    email: "rock@siya.health",
    name: "Rock Star",
    dayLedger: p.dayLedger,
  },
]);
assert.equal(opsRows.length, 3);
assert.ok(opsRows.some((r) => chatSimHasReviewableTranscript(r.entry.chatSim)));
assert.ok(opsRows.some((r) => !chatSimHasReviewableTranscript(r.entry.chatSim)));

const root = resolve(__dirname, "..");
const ui = readFileSync(resolve(root, "src/components/ops/OpsDashboardPanel.tsx"), "utf8");
assert.ok(ui.includes("ChatSimOpsReviewPanel"));
const trainee = readFileSync(resolve(root, "src/components/companion/PatientChatSimulator.tsx"), "utf8");
assert.ok(trainee.includes("View transcript"));
assert.ok(trainee.includes("transcriptVersion: 1"));
const opsPanel = readFileSync(resolve(root, "src/components/ops/ChatSimOpsReviewPanel.tsx"), "utf8");
assert.ok(opsPanel.includes("Legacy flag"));
assert.ok(opsPanel.includes("not recoverable"));

console.log("ok: transcript built and stored on red-flag session");
console.log("ok: legacy missed_high_urgency_triage row has no transcript (unrecoverable)");
console.log("ok: Ops collect lists red + soft_stop; distinguishes reviewable vs legacy");
console.log("ok: trainee + Ops UI wired");
console.log("\nAll P0 transcript/Ops smokes passed.");
