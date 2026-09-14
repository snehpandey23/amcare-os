/**
 * Competency exam improvement plans — Typing / HIPAA / Listening builders.
 *
 *   cd apps/hipaa-training && npx tsx scripts/smoke-exam-improvement-plan.ts
 */
import assert from "node:assert/strict";
import {
  IMPROVEMENT_SCORE_THRESHOLD,
  TYPING_DRILL_HREF,
  TYPING_TARGET_WPM,
  buildExamImprovementPlans,
  buildHipaaImprovementPlan,
  buildListeningImprovementPlan,
  buildTypingImprovementPlan,
  classifyListeningMisses,
  formatImprovementPlansMessage,
} from "../src/lib/competency-exam/improvement-plan";
import { formatPracticeRecommendation } from "../src/lib/siya-os/practice-stats-ask";
import type { LevelUpProgress } from "../src/lib/level-up/progress";

const slowTyping = buildTypingImprovementPlan({
  section: { status: "scored", score: 55 },
  metrics: { wpm: 28, wpmReliable: true, accuracy: 94 },
});
assert.ok(slowTyping, "below-target WPM should yield a typing plan");
assert.ok(slowTyping!.tips.some((t) => /touch-typing/i.test(t)));
assert.ok(slowTyping!.tips.some((t) => /home row/i.test(t)));
assert.equal(slowTyping!.links[0]?.href, TYPING_DRILL_HREF);
assert.ok(28 < TYPING_TARGET_WPM);

const fastAccurate = buildTypingImprovementPlan({
  section: { status: "scored", score: 95 },
  metrics: { wpm: 55, wpmReliable: true, accuracy: 98 },
});
assert.equal(fastAccurate, null, "strong typing should not force a plan");

const hipaa = buildHipaaImprovementPlan({
  section: { id: "mcq", status: "scored", score: 50 },
  items: [
    {
      id: "q1",
      moduleId: "privacy",
      prompt: "…",
      selectedKey: "a",
      correctKey: "b",
      correct: false,
    },
    {
      id: "q2",
      moduleId: "clinical-knowledge-draft",
      prompt: "…",
      selectedKey: "a",
      correctKey: "b",
      correct: false,
    },
    {
      id: "q3",
      moduleId: "breach",
      prompt: "…",
      selectedKey: "a",
      correctKey: "a",
      correct: true,
    },
  ],
});
assert.ok(hipaa);
assert.ok(hipaa!.links.some((l) => l.href === "/module/privacy"));
assert.ok(!hipaa!.links.some((l) => l.href.includes("clinical-knowledge")));
assert.ok(hipaa!.tips.some((t) => /Privacy/i.test(t) || /privacy/i.test(t)));

const missAsk = classifyListeningMisses({
  text: "Patient has two days left and pharmacy is waiting. Called back, no answer.",
  missingAsk: true,
});
assert.ok(missAsk.kinds.includes("missing_ask"));
assert.ok(missAsk.notes.some((n) => /clear ask/i.test(n)));

const missFacts = classifyListeningMisses({
  text: "Please advise on next steps for this patient refill.",
  missingAsk: false,
});
assert.ok(missFacts.kinds.includes("missed_key_detail"));
assert.ok(missFacts.notes.some((n) => /key detail/i.test(n)));

const listening = buildListeningImprovementPlan({
  section: { status: "scored", score: IMPROVEMENT_SCORE_THRESHOLD - 1 },
  trail: {
    promptText: "voicemail",
    text: "Please advise.",
    escalationText: "Please advise.",
    issues: [],
    llmEstimate: 40,
    escalationHasAskHint: true,
  },
});
assert.ok(listening);
assert.ok(listening!.links[0]?.href.includes("section=listening"));

const deferredSpoken = buildExamImprovementPlans({
  sections: [
    {
      id: "chat-sim-spoken",
      label: "Spoken",
      weight: 20,
      status: "scored",
      score: 40,
      note: "",
      itemIds: [],
      repeatedIds: [],
      draftContent: true,
    },
  ],
  includeSpokenDeferredPlaceholder: true,
});
assert.ok(deferredSpoken.some((p) => p.deferred && p.sectionId === "chat-sim-spoken"));

// Default path must not invent spoken tips
const noSpoken = buildExamImprovementPlans({
  sections: [
    {
      id: "chat-sim-spoken",
      label: "Spoken",
      weight: 20,
      status: "scored",
      score: 40,
      note: "",
      itemIds: [],
      repeatedIds: [],
      draftContent: true,
    },
  ],
  includeSpokenDeferredPlaceholder: false,
});
assert.equal(noSpoken.length, 0);

const msg = formatImprovementPlansMessage([slowTyping!, hipaa!]);
assert.ok(/What to work on/i.test(msg));
assert.ok(/touch-typing/i.test(msg));

const progress: LevelUpProgress = {
  streak: 1,
  lastActiveDate: "2026-09-13",
  completedToday: ["typing"],
  totalXp: 10,
  dayLedger: [
    {
      id: "t1",
      date: "2026-09-13",
      at: Date.now(),
      drill: "typing",
      xpAwarded: 5,
      wpm: 30,
      accuracy: 0.95,
    },
  ],
};
const ask = formatPracticeRecommendation(progress, null);
assert.ok(/touch-typing|home row|typing/i.test(ask), "Ask recommend should reuse typing tips");
assert.ok(ask.includes(TYPING_DRILL_HREF) || /practice#typing/.test(ask));

console.log("ok: smoke-exam-improvement-plan");
