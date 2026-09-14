/**
 * Regression: Janet spoken scheduling strong-example (live 89/100 calibration anchor).
 *
 *   cd apps/hipaa-training && npx tsx scripts/smoke-chat-sim-scoring-janet-spoken.ts
 *
 * Locks Grammar 100 · Politeness 80 · Relevance 87 against this known-good
 * multi-turn transcript. Any future Relevance/Politeness scorer change must
 * either keep these scores or deliberately update this fixture with rationale.
 */
import assert from "node:assert/strict";
import {
  evaluateSimulatorSession,
  isPoliteMessage,
  scorePolitenessMessage,
} from "../src/lib/patient-drill/evaluate";
import {
  JANET_SPOKEN_POLITENESS_GAP,
  JANET_SPOKEN_SCHEDULING_EXPECTED,
  JANET_SPOKEN_SCHEDULING_MESSAGES,
  JANET_SPOKEN_RELEVANCE_SOFT,
} from "../src/lib/patient-drill/fixtures/janet-spoken-scheduling-strong";

const fb = evaluateSimulatorSession(JANET_SPOKEN_SCHEDULING_MESSAGES);
const ma = JANET_SPOKEN_SCHEDULING_MESSAGES.filter((m) => m.who === "you");

console.log("=== Janet spoken scheduling — strong-example regression ===\n");
console.log(`  Grammar:    ${fb.grammarScore}/100  (expected ${JANET_SPOKEN_SCHEDULING_EXPECTED.grammarScore})`);
console.log(`  Politeness: ${fb.politenessScore}/100  (expected ${JANET_SPOKEN_SCHEDULING_EXPECTED.politenessScore})`);
console.log(`  Relevance:  ${fb.relevanceScore}/100  (expected ${JANET_SPOKEN_SCHEDULING_EXPECTED.relevanceScore})`);
console.log(
  `  Section:    ${Math.round((fb.grammarScore + fb.politenessScore + fb.relevanceScore) / 3)}/100  (expected ${JANET_SPOKEN_SCHEDULING_EXPECTED.sectionScore})`,
);

assert.equal(ma.length, 5, "fixture must have 5 MA turns");
assert.equal(fb.grammarScore, JANET_SPOKEN_SCHEDULING_EXPECTED.grammarScore);
assert.equal(fb.politenessScore, JANET_SPOKEN_SCHEDULING_EXPECTED.politenessScore);
assert.equal(fb.relevanceScore, JANET_SPOKEN_SCHEDULING_EXPECTED.relevanceScore);
assert.equal(
  Math.round((fb.grammarScore + fb.politenessScore + fb.relevanceScore) / 3),
  JANET_SPOKEN_SCHEDULING_EXPECTED.sectionScore,
);
assert.equal(fb.grammarErrorCount, 0);
assert.equal(fb.redFlagged, false);

// Per-turn politeness: only the bare slot offer fails the keyword heuristic
const politeFlags = ma.map((m) => scorePolitenessMessage(m.text || ""));
assert.equal(politeFlags.filter((p) => p.isPolite).length, 4);
assert.equal(politeFlags[JANET_SPOKEN_POLITENESS_GAP.maReplyIndex]!.isPolite, false);
assert.equal(isPoliteMessage(JANET_SPOKEN_POLITENESS_GAP.excerpt), false);
assert.equal(JANET_SPOKEN_POLITENESS_GAP.fairRealCourtesyGap, false);
assert.equal(JANET_SPOKEN_POLITENESS_GAP.classification, "scorer_under_credit");

// Relevance soft spot stays documented (cancellation-list turn)
const soft = fb.relevanceTurns[JANET_SPOKEN_RELEVANCE_SOFT.maReplyIndex];
assert.ok(soft, "relevance turn for soft spot must exist");
assert.ok(
  soft!.score > 0 && soft!.score < 1,
  `turn 2 relevance should be partial, got ${soft!.score}`,
);
assert.match(soft!.reason, /weak|incomplete|scheduling/i);

console.log("\nPoliteness gap (locked):");
console.log(`  MA turn ${JANET_SPOKEN_POLITENESS_GAP.maReplyIndex + 1}: “${JANET_SPOKEN_POLITENESS_GAP.excerpt}”`);
console.log(`  classification=${JANET_SPOKEN_POLITENESS_GAP.classification} (not a real courtesy failure)`);

console.log("\nRelevance soft spot (locked):");
console.log(`  MA turn ${JANET_SPOKEN_RELEVANCE_SOFT.maReplyIndex + 1}: ${soft!.reason}`);

console.log("\nAll Janet spoken strong-example checks passed.");
