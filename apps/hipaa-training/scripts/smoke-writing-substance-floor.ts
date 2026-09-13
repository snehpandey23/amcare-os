/**
 * Empty/near-empty substance floor — trust-breaker fix (“thank you” must not score ~79).
 *   cd apps/hipaa-training && npx tsx scripts/smoke-writing-substance-floor.ts
 */
import assert from "node:assert/strict";
import {
  assessWritingSubstance,
  blendWritingScore,
  scoreListeningProviderMessage,
  scoreWritingPartDeterministic,
  WRITING_EMPTY_SUBSTANCE_CAP,
} from "../src/lib/competency-exam/writing-score";
import { examWeightsSum, EXAM_WEIGHTS, LIVE_SECTION_ORDER } from "../src/lib/competency-exam/weights";
import { drawCombinedMcqExam, MCQ_EXAM_COUNT } from "../src/lib/competency-exam/draws";
import { plainLanguageRelevanceNote, scoreRelevanceTurn } from "../src/lib/patient-drill/evaluate";

// --- thank you / empty must fail substance + score very low ---
{
  const thankYou = assessWritingSubstance("thank you");
  assert.equal(thankYou.ok, false, "thank you must fail substance floor");
  const det = scoreWritingPartDeterministic("thank you", "chart");
  assert.ok(det.score <= WRITING_EMPTY_SUBSTANCE_CAP, `det score ${det.score} > cap`);
  const blendRescue = blendWritingScore(det.score, 95, { substanceOk: false });
  assert.ok(
    blendRescue.score <= WRITING_EMPTY_SUBSTANCE_CAP,
    `LLM must not rescue thank-you: got ${blendRescue.score}`,
  );
  const listen = scoreListeningProviderMessage({ text: "thank you", llmEstimate: 90 });
  assert.ok(
    listen.score <= WRITING_EMPTY_SUBSTANCE_CAP,
    `Listening thank-you must be <= ${WRITING_EMPTY_SUBSTANCE_CAP}, got ${listen.score}`,
  );
  console.log(`ok: thank-you scores ${listen.score}/100 (cap ${WRITING_EMPTY_SUBSTANCE_CAP}) — not ~79`);
}

{
  const empty = scoreListeningProviderMessage({ text: "   ", llmEstimate: 100 });
  assert.ok(empty.score <= WRITING_EMPTY_SUBSTANCE_CAP);
  const ok = assessWritingSubstance(
    "Called patient back — no answer. Refill concern: ~2 days left, pharmacy waiting on office, wants help before weekend. Please review and advise whether we should call again.",
  );
  assert.equal(ok.ok, true, "substantive provider note must pass");
  console.log("ok: empty fails; substantive provider note passes");
}

// --- weights lock ---
assert.equal(examWeightsSum(), 100);
assert.deepEqual(
  LIVE_SECTION_ORDER,
  ["typing", "mcq", "listening", "chat-sim-typed", "chat-sim-spoken"],
);
assert.equal(EXAM_WEIGHTS.mcq, 30);
assert.equal(EXAM_WEIGHTS.listening, 20);
assert.equal(EXAM_WEIGHTS["chat-sim-spoken"], 20);
assert.equal(EXAM_WEIGHTS["chat-sim-typed"], 18);
assert.equal(EXAM_WEIGHTS.typing, 12);
console.log("ok: locked weights sum to 100");

// --- combined MCQ draw ---
{
  const draw = drawCombinedMcqExam([], 42);
  assert.equal(draw.questions.length, MCQ_EXAM_COUNT);
  assert.ok(draw.mix.hipaa >= 1, "should include HIPAA items");
  assert.ok(draw.draftPools.includes("clinical-knowledge"));
  assert.ok(draw.draftPools.includes("culture"));
  console.log(
    `ok: combined MCQ draw ${draw.questions.length} (hipaa ${draw.mix.hipaa} · clinical ${draw.mix.clinical} · trivia ${draw.mix.trivia})`,
  );
}

// --- plain-language relevance ---
{
  const turn = scoreRelevanceTurn(
    "How long will this actually take? I have finals next week.",
    "thank you",
  );
  const note = plainLanguageRelevanceNote(turn, 0);
  assert.ok(note, "expected humanNote for weak turn");
  assert.match(note!, /timeline|how-long|turn 1/i);
  console.log("ok: plain-language relevance note:", note);
}

console.log("\nAll substance-floor / weights / MCQ / relevance smokes passed.");
