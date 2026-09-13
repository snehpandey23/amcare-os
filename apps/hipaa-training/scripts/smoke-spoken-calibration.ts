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

// --- 5. Politeness: clean timeline stays high; blaming drops despite help markers ---
{
  const clean = runSpokenCalibration({
    confirmedText: "This can take anywhere between 5 to 7 days.",
    sttRaw: "This can take anywhere between 5 to 7 days.",
    patientAsk: "How long will this take? I have finals next week.",
  });
  assert.equal(clean.politeness.score, 100, `clean timeline politeness: ${clean.politeness.score}`);
  assert.equal(clean.politeness.toneFlags.length, 0);
  assert.equal(clean.politeness.isPolite, true);

  const blame = runSpokenCalibration({
    confirmedText:
      "I think if you have a finals next week you should have planned ahead of this because things like that can take time.",
    sttRaw:
      "I think if you have a finals next week you should have planned ahead of this because things like that can take time.",
    patientAsk: "How long will this take? I have finals next week.",
  });
  assert.ok(blame.politeness.score <= 20, `blaming politeness should be low, got ${blame.politeness.score}`);
  assert.equal(blame.politeness.isPolite, false);
  assert.ok(blame.politeness.toneFlags.length > 0, "expected dismissive/blaming tone flags");
  assert.ok(
    blame.politeness.markers.some((m) => /dismissive\/blaming/i.test(m)),
    `expected blame in markers: ${blame.politeness.markers.join(" | ")}`,
  );
  assert.ok(
    /dismissive|blaming/i.test(blame.politeness.note),
    `expected dismissive note: ${blame.politeness.note}`,
  );
  // Helpfulness marker alone must not rescue the score
  assert.ok(blame.politeness.markers.some((m) => /helpfulness/i.test(m)));
  console.log(
    `ok: politeness calibration — clean=${clean.politeness.score}, blame=${blame.politeness.score} flags=[${blame.politeness.toneFlags.join("; ")}]`,
  );
}

// --- 6. Coherence gate: word-salad fails Grammar + Relevance; clean timeline still passes ---
{
  const salad =
    "Long take might some hours days no final next week what mean do find where";
  const ask = "How long will this actually take? I have finals next week.";
  const bad = runSpokenCalibration({ confirmedText: salad, sttRaw: salad, patientAsk: ask });
  assert.equal(bad.grammar.score, 0);
  assert.equal(bad.relevance.score, 0);
  assert.ok(bad.grammar.issues.some((i) => i.kinds.includes("incoherent_or_word_salad")));
  assert.match(bad.grammar.note, /coherent sentence/i);

  const good = runSpokenCalibration({
    confirmedText: "This can take anywhere between 5 to 7 days.",
    sttRaw: "This can take anywhere between 5 to 7 days.",
    patientAsk: ask,
  });
  assert.equal(good.grammar.score, 100);
  assert.ok((good.relevance.score ?? 0) >= 90);
  console.log(
    `ok: coherence gate — salad G${bad.grammar.score}/R${bad.relevance.score}, clean G${good.grammar.score}/R${good.relevance.score}`,
  );
}

console.log("\nAll spoken-calibration smokes passed.");
