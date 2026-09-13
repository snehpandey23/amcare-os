/**
 * Spoken scoring calibration — sandbox smoke (no mic / no STT).
 *   cd apps/hipaa-training && npx tsx scripts/smoke-spoken-calibration.ts
 */
import assert from "node:assert/strict";
import { runSpokenCalibration } from "../src/lib/patient-drill/spoken-calibration";

// --- 1. Full detail fields with optional relevance ---
{
  const r = runSpokenCalibration({
    confirmedText:
      "Um uh thank you for reaching out. I can help you book an appointment — how may I help with the timeline?",
    sttRaw: "um uh thank you for reaching out I can help you book",
    sttProvider: "sarvam",
    patientAsk: "How long will this actually take? I have finals next week.",
    recordingElapsedSec: 12,
  });
  assert.equal(r.transcriptEdited, true);
  assert.ok(r.grammar.disfluencyStrippedText.length > 0);
  assert.doesNotMatch(r.grammar.disfluencyStrippedText, /\bum\b/i);
  assert.equal(r.grammar.score, 100);
  assert.equal(r.grammar.issues.length, 0);
  assert.ok(r.politeness.markers.length > 0, "expected politeness markers");
  assert.equal(r.politeness.score, 100);
  assert.equal(r.relevance.skipped, false);
  assert.ok(typeof r.relevance.score === "number");
  assert.ok(r.relevance.turn?.askType);
  assert.equal(r.safety.turnAction, "continue");
  assert.equal(r.safety.redFlagged, false);
  assert.ok(r.spokenWpm.wordCount > 0);
  assert.ok(r.spokenWpm.elapsedSec === 12);
  console.log("ok: calibration detail fields populated (grammar/politeness/relevance/safety/wpm)");
}

// --- 2. Relevance skipped when no patient ask ---
{
  const r = runSpokenCalibration({
    confirmedText: "I can help you with booking and the secure portal.",
    sttRaw: "I can help you with booking and the secure portal.",
    sttProvider: "sarvam",
    patientAsk: null,
    recordingElapsedSec: 8,
  });
  assert.equal(r.relevance.skipped, true);
  assert.equal(r.relevance.score, null);
  assert.match(r.relevance.note, /skipped/i);
  console.log("ok: relevance skipped in pure calibration");
}

// --- 3. Bribery hard-stop still fires ---
{
  const r = runSpokenCalibration({
    confirmedText: "you can pay me some money via venmo and i can see what to do",
    sttRaw: "you can pay me some money via venmo and i can see what to do",
    sttProvider: "sarvam",
    patientAsk: "Can you help faster?",
    recordingElapsedSec: 5,
  });
  assert.equal(r.safety.redFlagged, true);
  assert.equal(r.safety.turnAction, "stop");
  assert.equal(r.safety.stopKind, "red_flag");
  assert.ok(r.safety.misconductReasons.includes("bribe_or_money"));
  console.log("ok: venmo bribery still red-flags in calibration");
}

// --- 4. Grammar issue surfaces with detail ---
{
  const r = runSpokenCalibration({
    confirmedText: "getting medications aren't guaranteed same day",
    sttRaw: "getting medications aren't guaranteed same day",
    recordingElapsedSec: 4,
  });
  assert.equal(r.grammar.score, 0);
  assert.ok(r.grammar.issues.some((i) => i.kinds.includes("subject_verb_disagreement")));
  console.log("ok: grammar issue detail present");
}

console.log("\nAll spoken-calibration smokes passed.");
