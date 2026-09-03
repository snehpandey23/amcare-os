/**
 * Tour progression smoke — Ask continue + visit-step Continue navigates.
 * Run: npx tsx apps/hipaa-training/scripts/smoke-product-tour-ask-progress.ts
 */
import assert from "assert";
import {
  PORTAL_TOUR_STEPS,
  checkTourStepVerified,
  clearTourSessionFlags,
  isTourStepReadyToComplete,
  normalizePortalTour,
  recordTourAskMessage,
  recordTourVisit,
  defaultPortalTourState,
} from "../src/lib/portal-product-tour";

const mem: Record<string, string> = {};
(globalThis as { window?: unknown }).window = {
  dispatchEvent: () => true,
};
(globalThis as { sessionStorage?: Storage }).sessionStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => {
    mem[k] = String(v);
  },
  removeItem: (k) => {
    delete mem[k];
  },
  clear: () => {
    for (const k of Object.keys(mem)) delete mem[k];
  },
  key: () => null,
  length: 0,
};

function askStep() {
  return PORTAL_TOUR_STEPS.find((s) => s.id === "ask-capability")!;
}

clearTourSessionFlags();
assert.equal(checkTourStepVerified(askStep()), false);

recordTourAskMessage("what can this do");
assert.equal(mem["siya-tour-ask-done"], "1", "exact phrase must set flag");
assert.equal(isTourStepReadyToComplete(askStep()), true);

clearTourSessionFlags();
recordTourAskMessage("What can this do?");
assert.equal(mem["siya-tour-ask-done"], "1", "punctuation must still match");

clearTourSessionFlags();
recordTourAskMessage("what can you do");
assert.equal(mem["siya-tour-ask-done"], "1", "what can you do");

clearTourSessionFlags();
recordTourAskMessage("hello");
assert.equal(mem["siya-tour-ask-done"], undefined, "unrelated must not match");

// Simulate completeCurrentStep gate for ask → learn
clearTourSessionFlags();
recordTourAskMessage("what can this do");
const state = normalizePortalTour({
  ...defaultPortalTourState(),
  startedAt: Date.now(),
  currentStepIndex: 2,
  completedStepIds: ["welcome", "my-day"],
});
const stepNow = PORTAL_TOUR_STEPS[state.currentStepIndex];
assert.equal(stepNow.id, "ask-capability");
assert.equal(isTourStepReadyToComplete(stepNow), true, "Continue must be allowed after Ask");

const nextIndex = Math.min(state.currentStepIndex + 1, PORTAL_TOUR_STEPS.length - 1);
assert.equal(PORTAL_TOUR_STEPS[nextIndex].id, "learn-hub");
assert.equal(PORTAL_TOUR_STEPS[nextIndex].actionHref, "/learn");

// After advance to learn-hub without visiting /learn — Continue should still be clickable
// (navigates via actionHref). Verification remains false until visit.
const learn = PORTAL_TOUR_STEPS[nextIndex];
assert.equal(isTourStepReadyToComplete(learn), false, "learn requires visit");
assert.ok(learn.actionHref, "learn must have actionHref so Continue can navigate");

recordTourVisit("/learn");
assert.equal(isTourStepReadyToComplete(learn), true, "after /learn visit Continue advances");

// Remaining visit/practice/feedback chain
const expected = [
  "practice-typing",
  "hipaa-training",
  "team",
  "feedback-practice",
  "finish",
];
for (const id of expected) {
  const s = PORTAL_TOUR_STEPS.find((x) => x.id === id);
  assert.ok(s, id);
  if (s.kind === "visit") assert.ok(s.actionHref, `${id} visit needs href`);
  if (s.kind === "practice") assert.ok(s.actionHref?.includes("tour=1"));
  if (s.kind === "feedback") assert.ok(s.actionHref?.includes("tour=1"));
}

console.log("smoke-product-tour-ask-progress: OK");
