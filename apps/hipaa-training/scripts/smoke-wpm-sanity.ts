/**
 * WPM sanity + low-effort scoring evidence.
 * Run: npx tsx scripts/smoke-wpm-sanity.ts
 */
import assert from "node:assert/strict";
import passages from "../src/data/level-up/typing-passages.json";
import { scoreTyping } from "../src/lib/level-up/typing-drill";
import { estimateWpmFromWords, MAX_PLAUSIBLE_WPM } from "../src/lib/level-up/wpm";
import { evaluateSimulatorSession, isPoliteMessage } from "../src/lib/patient-drill/evaluate";

type Passage = { id: string; text: string };

const long = [...(passages as Passage[])].sort((a, b) => b.text.length - a.text.length)[0]!;

// --- Before-style raw math (what staff saw) ---
const elapsedPasteSec = 0.05;
const legacyMinutes = Math.max(elapsedPasteSec / 60, 1 / 60);
const legacyRaw = Math.round(long.text.length / 5 / legacyMinutes);

// --- After: scoreTyping gate ---
const after = scoreTyping(long.text, long.text, elapsedPasteSec, true);

console.log(
  JSON.stringify(
    {
      case: "typing-drill paste / near-zero elapsed",
      passageId: long.id,
      chars: long.text.length,
      elapsedSec: elapsedPasteSec,
      beforeDisplayedWpm: legacyRaw,
      afterDisplayedWpm: after.wpm,
      afterReliable: after.wpmReliable,
      afterRawWpm: after.rawWpm,
      afterNote: after.wpmNote,
    },
    null,
    2,
  ),
);

assert.ok(legacyRaw > MAX_PLAUSIBLE_WPM, "before should be absurd");
assert.equal(after.wpmReliable, false);
assert.equal(after.wpm, 0);
assert.ok(after.rawWpm > MAX_PLAUSIBLE_WPM);

// Realistic typing: 60 chars in 12s ≈ 60 WPM
const steady = scoreTyping("x".repeat(60), "x".repeat(60), 12, true);
assert.equal(steady.wpmReliable, true);
assert.ok(steady.wpm >= 50 && steady.wpm <= 70, `steady wpm ${steady.wpm}`);

// Exact staff-class artifact: 20 words in 506ms → 2372 WPM (live report was 2371)
const staffWordsList = [
  "ok",
  "sure",
  "thank",
  "you",
  "i",
  "can",
  "help",
  "with",
  "that",
  "please",
  "let",
  "me",
  "know",
  "what",
  "you",
  "need",
  "from",
  "me",
  "today",
  "thanks",
];
const staffPaste = staffWordsList.join(" ");
const staffWords = staffWordsList.length;
const staffElapsedMs = 506;
const staffElapsedSec = staffElapsedMs / 1000;
const beforeStaffRaw = Math.round(staffWords / (staffElapsedSec / 60));
const afterStaff = evaluateSimulatorSession([
  { who: "you", text: staffPaste, startedAt: 1000, sentAt: 1000 + staffElapsedMs },
]);

console.log(
  JSON.stringify(
    {
      case: "patient-chat focus/paste→send (2371-class)",
      words: staffWords,
      elapsedMs: staffElapsedMs,
      beforeDisplayedWpm: beforeStaffRaw,
      afterDisplayedWpm: afterStaff.avgWpm,
      afterReliable: afterStaff.wpmReliable,
      uiLabel: afterStaff.wpmReliable ? `${afterStaff.avgWpm} WPM` : "Unable to estimate",
    },
    null,
    2,
  ),
);

assert.equal(staffWords, 20);
assert.equal(beforeStaffRaw, 2372); // 20 / (0.506/60) rounds to 2372; staff saw 2371
assert.equal(afterStaff.wpmReliable, false);
assert.equal(afterStaff.avgWpm, 0);

const rawGate = estimateWpmFromWords(staffWords, staffElapsedSec);
assert.equal(rawGate.reliable, false);
assert.ok(rawGate.rawWpm > MAX_PLAUSIBLE_WPM);

// Steady patient reply: 12 words in 8s ≈ 90 WPM
const steadyPatient = evaluateSimulatorSession([
  {
    who: "you",
    text: "I can help with booking — what day works best for you?",
    startedAt: 1,
    sentAt: 1 + 8000,
  },
]);
assert.equal(steadyPatient.wpmReliable, true);
assert.ok(steadyPatient.avgWpm > 0 && steadyPatient.avgWpm <= MAX_PLAUSIBLE_WPM);

// --- Low-effort scoring: politeness/grammar still high; relevance catches gaming ---
const low = evaluateSimulatorSession([
  { who: "Emma", text: "How long will this actually take?" },
  { who: "you", text: "ok sure", startedAt: 1, sentAt: 5000 },
]);
assert.equal(isPoliteMessage("ok sure"), true);
assert.equal(low.politenessScore, 100);
assert.equal(low.grammarScore, 100);
assert.equal(low.relevanceScore, 0);
assert.ok(/substance|relevance|question/i.test(low.politenessNote + low.grammarNote));
assert.ok(/estimate/i.test(low.relevanceNote));

console.log(
  JSON.stringify(
    {
      case: "low-effort reply scoring",
      text: "ok sure",
      politeness: low.politenessScore,
      grammar: low.grammarScore,
      relevance: low.relevanceScore,
      note: "Grammar/politeness stay high; Relevance is 0 for generic non-answer",
    },
    null,
    2,
  ),
);

console.log("smoke-wpm-sanity: OK");
