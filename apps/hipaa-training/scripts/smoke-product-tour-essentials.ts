/**
 * Local smoke — product tour v1 essentials scope lock.
 * Run: npx tsx apps/hipaa-training/scripts/smoke-product-tour-essentials.ts
 */
import assert from "assert";
import {
  PORTAL_TOUR_ESSENTIALS,
  PORTAL_TOUR_OUT_OF_SCOPE,
  PORTAL_TOUR_STEPS,
} from "../src/lib/portal-product-tour";

const EXPECTED_IDS = [
  "welcome",
  "my-day",
  "ask-capability",
  "learn-hub",
  "practice-typing",
  "hipaa-training",
  "team",
  "feedback-practice",
  "finish",
];

assert.deepEqual(
  PORTAL_TOUR_STEPS.map((s) => s.id),
  EXPECTED_IDS,
  "tour step ids must match essentials walkthrough exactly",
);
assert.equal(PORTAL_TOUR_ESSENTIALS.length, 8);
assert.ok(PORTAL_TOUR_OUT_OF_SCOPE.length >= 7);

const allCopy = PORTAL_TOUR_STEPS.map((s) => `${s.title}\n${s.lines.join("\n")}\n${s.verifyHint}`).join(
  "\n",
);

for (const phrase of [
  /weekly check-?in/i,
  /\bTalk Mode\b/,
  /use voice/i,
  /\bMemory\b/,
  /shift schedule/i,
  /weekly practice report/i,
  /SOP review/i,
]) {
  assert.equal(phrase.test(allCopy), false, `out-of-scope leak: ${phrase}`);
}

assert.match(allCopy, /get started|essentials/i);
assert.equal(/full portal capability list/i.test(allCopy), false);
assert.match(allCopy, /Notify owner/);
assert.match(allCopy, /automatically/);
assert.match(allCopy, /👍|👎/);

console.log("smoke-product-tour-essentials: OK", {
  steps: EXPECTED_IDS.length,
  essentials: PORTAL_TOUR_ESSENTIALS.length,
  outOfScope: PORTAL_TOUR_OUT_OF_SCOPE.length,
});
