/**
 * Off-topic vs weak-on-topic framing — Grammar/Politeness de-emphasis is display-only.
 *   cd apps/hipaa-training && npx tsx scripts/smoke-offtopic-style-deemphasis.ts
 */
import assert from "node:assert/strict";
import {
  OFF_TOPIC_STYLE_SCORES_NOTE,
  scoreRelevanceTurn,
  styleScoresDeemphasizedForSession,
  styleScoresDeemphasizedForTurn,
} from "../src/lib/patient-drill/evaluate";
import { runSpokenCalibration } from "../src/lib/patient-drill/spoken-calibration";

const ASK = "How long will this actually take? I have finals next week.";
const EIFFEL =
  "The Eiffel Tower is in Paris and is a very famous landmark that many tourists visit every year.";
const MICHAEL = "That would depend upon the providers' review and advise";

console.log("=== Side by side ===\n");

const eiffelTurn = scoreRelevanceTurn(ASK, EIFFEL);
const michaelTurn = scoreRelevanceTurn(ASK, MICHAEL);
const eiffelCal = runSpokenCalibration({
  confirmedText: EIFFEL,
  sttRaw: EIFFEL,
  patientAsk: ASK,
});
const michaelCal = runSpokenCalibration({
  confirmedText: MICHAEL,
  sttRaw: MICHAEL,
  patientAsk: ASK,
});

assert.equal(eiffelTurn.fit, "unrelated");
assert.ok(eiffelTurn.score <= 0.15, `eiffel relevance ${eiffelTurn.score}`);
assert.equal(styleScoresDeemphasizedForTurn(eiffelTurn), true);
assert.equal(eiffelCal.styleScoresDeemphasized, true);
assert.equal(eiffelCal.styleScoresDeemphasizedNote, OFF_TOPIC_STYLE_SCORES_NOTE);
// Raw scores still computed
assert.equal(typeof eiffelCal.grammar.score, "number");
assert.equal(typeof eiffelCal.politeness.score, "number");

assert.equal(michaelTurn.fit, "weak_on_topic");
assert.ok(michaelTurn.score >= 0.2 && michaelTurn.score <= 0.45, `michael ${michaelTurn.score}`);
assert.equal(styleScoresDeemphasizedForTurn(michaelTurn), false);
assert.equal(michaelCal.styleScoresDeemphasized, false);
assert.equal(michaelCal.styleScoresDeemphasizedNote, null);

assert.equal(styleScoresDeemphasizedForSession([eiffelTurn]), true);
assert.equal(styleScoresDeemphasizedForSession([michaelTurn]), false);
assert.equal(styleScoresDeemphasizedForSession([michaelTurn, eiffelTurn]), false); // has care-relevant

console.log(
  `  Eiffel:   fit=${eiffelTurn.fit} R=${eiffelCal.relevance.score} G${eiffelCal.grammar.score} P${eiffelCal.politeness.score} deemphasis=${eiffelCal.styleScoresDeemphasized}`,
);
console.log(`           note: ${eiffelCal.styleScoresDeemphasizedNote}`);
console.log(
  `  Michael:  fit=${michaelTurn.fit} R=${michaelCal.relevance.score} G${michaelCal.grammar.score} P${michaelCal.politeness.score} deemphasis=${michaelCal.styleScoresDeemphasized}`,
);
console.log("\nAll off-topic style-deemphasis checks passed.");
