/**
 * Typed-content repetition → bounded Relevance deduction.
 *
 *   npx tsx scripts/smoke-typed-repetition-relevance.ts
 */
import assert from "node:assert/strict";
import {
  TYPED_REPETITION_RELEVANCE_PENALTY,
  assessTypedContentRepetition,
  evaluateSimulatorSession,
  scoreRelevanceTurn,
} from "../src/lib/patient-drill/evaluate";
import { JANET_SPOKEN_SCHEDULING_EXPECTED, JANET_SPOKEN_SCHEDULING_MESSAGES } from "../src/lib/patient-drill/fixtures/janet-spoken-scheduling-strong";

const ASK =
  "How soon can I get an appointment? I need something next week if possible.";

const EXPLANATION =
  "Typically we can get you in within the same week once intake is reviewed — usually about 1–2 weeks total if you move quickly on the forms.";

// --- Unit: 2 similar explanations = not excessive; 3+ = excessive ---
const twice = `${EXPLANATION} ${EXPLANATION}`;
const thrice = `${EXPLANATION} ${EXPLANATION} ${EXPLANATION}`;
const two = assessTypedContentRepetition(twice);
const three = assessTypedContentRepetition(thrice);
console.log("2× explanation", two);
console.log("3× explanation", three);
assert.equal(two.excessive, false, "2 repeats must not trigger");
assert.ok(two.maxOccurrences <= 2);
assert.equal(three.excessive, true, "3+ repeats must trigger");
assert.ok(three.maxOccurrences >= 3);

// Short factual confirmation echoes — never excessive
const factual =
  "We have Tuesday at 9:30 available. Tuesday at 9:30. Got it — Tuesday at 9:30.";
const factAssess = assessTypedContentRepetition(factual);
console.log("factual echoes", factAssess);
assert.equal(factAssess.excessive, false, "time/date confirmation must not trigger");

// --- Typed Relevance: 3× pulls score down by bounded penalty; 2× does not ---
const clean = scoreRelevanceTurn(ASK, EXPLANATION, { inputModality: "typed" });
const typedTwice = scoreRelevanceTurn(ASK, twice, { inputModality: "typed" });
const typedThrice = scoreRelevanceTurn(ASK, thrice, { inputModality: "typed" });
console.log("typed clean", clean.score, clean.reason);
console.log("typed 2×", typedTwice.score, typedTwice.typedRepetition);
console.log("typed 3×", typedThrice.score, typedThrice.reason);

assert.equal(clean.score, 1, "single clear answer stays full Relevance");
assert.equal(typedTwice.score, clean.score, "2× must not reduce Relevance");
assert.ok(typedThrice.typedRepetition?.excessive);
assert.equal(
  typedThrice.score,
  Math.round((clean.score - TYPED_REPETITION_RELEVANCE_PENALTY) * 100) / 100,
);
assert.ok(typedThrice.score < clean.score);
assert.ok(typedThrice.score >= 0.5, "bounded — not a hard fail");
assert.match(typedThrice.reason, /repeated the same explanation/i);

// --- Spoken: identical 3× text must NOT apply the typed penalty ---
const spokenThrice = scoreRelevanceTurn(ASK, thrice, { inputModality: "spoken" });
console.log("spoken 3×", spokenThrice.score, spokenThrice.typedRepetition);
assert.equal(spokenThrice.score, clean.score, "spoken must not take typed repetition penalty");
assert.ok(!spokenThrice.typedRepetition?.excessive && spokenThrice.typedRepetition === undefined);

// Session-level: typed message with modality
const typedSession = evaluateSimulatorSession([
  { who: "Jordan", text: ASK },
  { who: "you", text: thrice, inputModality: "typed" },
]);
const spokenSession = evaluateSimulatorSession([
  { who: "Jordan", text: ASK },
  { who: "you", text: thrice, inputModality: "spoken" },
]);
console.log("session typed Relevance", typedSession.relevanceScore);
console.log("session spoken Relevance", spokenSession.relevanceScore);
assert.ok(typedSession.relevanceScore < spokenSession.relevanceScore);
assert.equal(spokenSession.relevanceScore, Math.round(clean.score * 100));

// Janet spoken fixture must stay locked (no accidental spoken penalty)
const janet = evaluateSimulatorSession(JANET_SPOKEN_SCHEDULING_MESSAGES);
assert.equal(janet.relevanceScore, JANET_SPOKEN_SCHEDULING_EXPECTED.relevanceScore);
assert.equal(janet.grammarScore, JANET_SPOKEN_SCHEDULING_EXPECTED.grammarScore);
assert.equal(janet.politenessScore, JANET_SPOKEN_SCHEDULING_EXPECTED.politenessScore);

console.log("smoke-typed-repetition-relevance: OK");
