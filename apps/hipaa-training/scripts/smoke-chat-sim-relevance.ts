/**
 * Relevance / engagement scoring — gaming vs substantive, plus Emma transcript.
 *
 * Decision (documented in evaluate.ts): structured turn-type shape matching,
 * not LLM — sync, deterministic smokes, honest “estimate” label.
 *
 *   npx tsx apps/hipaa-training/scripts/smoke-chat-sim-relevance.ts
 */
import assert from "node:assert/strict";
import {
  classifyPatientAsk,
  evaluateSimulatorSession,
  scoreRelevanceTurn,
} from "../src/lib/patient-drill/evaluate";

const EMMA_OPEN =
  "I was on Adderall in high school and I need to get back on it. I filled out the intake and thought it would be a simple renewal. Now I'm being told I have to sign an agreement and do neuropsych testing. How long will this actually take? I have finals.";

assert.equal(classifyPatientAsk(EMMA_OPEN), "timeline", "Emma opening is a timeline ask");

// --- Gaming: generic non-answer to a real timeline question ---
const gaming = scoreRelevanceTurn(EMMA_OPEN, "ok sure");
console.log("GAMING  ask=timeline reply=“ok sure”");
console.log(`  score=${gaming.score} reason=${gaming.reason}`);
assert.equal(gaming.score, 0, "ok sure must score 0");
assert.match(gaming.reason, /generic non-answer/i);

const gaming2 = scoreRelevanceTurn(EMMA_OPEN, "okay sure");
assert.equal(gaming2.score, 0, "okay sure must score 0");

const gaming3 = scoreRelevanceTurn(EMMA_OPEN, "got it");
assert.equal(gaming3.score, 0, "got it alone must score 0");

// Politeness would still like “ok sure” — relevance must not
const politeButIrrelevant = evaluateSimulatorSession([
  { who: "Emma", text: EMMA_OPEN },
  { who: "you", text: "ok sure" },
]);
assert.ok(
  politeButIrrelevant.politenessScore >= 50,
  "politeness still rewards ack markers",
);
assert.ok(
  politeButIrrelevant.relevanceScore <= 15,
  `relevance must stay low for ok sure session, got ${politeButIrrelevant.relevanceScore}`,
);

// --- Substantive on-topic timeline answer ---
const substantiveReply =
  "Typically we can get you in for testing within the same week. After that the provider decides on medication — usually about 1–2 weeks total if you move fast on the agreement.";
const good = scoreRelevanceTurn(EMMA_OPEN, substantiveReply);
console.log("\nSUBSTANTIVE ask=timeline");
console.log(`  score=${good.score} reason=${good.reason}`);
assert.equal(good.score, 1, "timeline-shaped substantive reply must score 1");
assert.match(good.reason, /timeline/i);

const goodSession = evaluateSimulatorSession([
  { who: "Emma", text: EMMA_OPEN },
  { who: "you", text: substantiveReply },
]);
assert.ok(
  goodSession.relevanceScore >= 90,
  `substantive session relevance expected ≥90, got ${goodSession.relevanceScore}`,
);
assert.ok(goodSession.relevanceNote.toLowerCase().includes("estimate"));
assert.ok(goodSession.relevanceNote.toLowerCase().includes("not a full meaning"));

// Process ask → process-shaped reply
const processAsk = "What exactly is the neuropsych testing? Like what do I do?";
assert.equal(classifyPatientAsk(processAsk), "process");
const processGood = scoreRelevanceTurn(
  processAsk,
  "First you sign the controlled substance agreement, then we book a testing visit where you complete focus and memory tasks with the provider — usually one visit.",
);
assert.equal(processGood.score, 1);

const processGaming = scoreRelevanceTurn(processAsk, "ok sure");
assert.equal(processGaming.score, 0);

// Substantive but wrong shape (timeline ask, only empathy)
const offShape = scoreRelevanceTurn(EMMA_OPEN, "okay so sorry to hear that, that sounds really stressful for finals");
console.log("\nOFF-SHAPE (empathy, no timeline)");
console.log(`  score=${offShape.score} reason=${offShape.reason}`);
assert.ok(offShape.score > 0 && offShape.score < 0.6, "empathy-only should be mid/low for timeline ask");

// --- Emma 6-reply with patient opens (relevance needs pairing) ---
const emmaMessages = [
  { who: "Emma", text: EMMA_OPEN },
  { who: "you", text: "hello emma how are youo?" },
  { who: "Emma", text: "Fine. How long will this actually take?" },
  { who: "you", text: "okay sure, are you showing for the first time" },
  { who: "Emma", text: "Yes. I just need a renewal timeline." },
  { who: "you", text: "okay so sorry to hear that" },
  { who: "Emma", text: "What do I do next?" },
  { who: "you", text: "first thing is booking an appointment with our providers to go through your clinical history" },
  { who: "Emma", text: "How long for testing then meds?" },
  {
    who: "you",
    text: "while we can typically get an appointment within the same week, getting medications aren't guaranteed",
  },
  { who: "Emma", text: "Can we do tomorrow?" },
  { who: "you", text: "i will see what i can do, can you make it tomorrow 7 pm?" },
];

const emma = evaluateSimulatorSession(emmaMessages);
console.log("\n=== Emma paired transcript — three scores ===");
console.log(`  Grammar:    ${emma.grammarScore}/100`);
console.log(`  Politeness: ${emma.politenessScore}/100`);
console.log(`  Relevance:  ${emma.relevanceScore}/100`);
for (const [i, t] of emma.relevanceTurns.entries()) {
  console.log(
    `    · Reply ${i + 1} ask=${t.askType} score=${t.score} — ${t.reason}`,
  );
}

assert.ok(emma.relevanceScore < 70, "Emma mixed transcript should not look fully relevant");
assert.ok(
  emma.relevanceTurns.some((t) => t.score <= 0.2),
  "at least one thin/gaming turn should score ≤0.2",
);
assert.ok(
  emma.relevanceTurns.some((t) => t.score >= 0.9),
  "process/scheduling substantive turns should score high",
);

// Honest scoping on all three notes
assert.ok(emma.grammarNote.toLowerCase().includes("does not score relevance"));
assert.ok(emma.politenessNote.toLowerCase().includes("whether you answered"));
assert.ok(emma.relevanceNote.toLowerCase().includes("estimate"));

console.log("\nBefore/after evidence:");
console.log("  BEFORE: only Grammar + Politeness — “ok sure” could look polite and hide non-answers.");
console.log(
  `  AFTER:  Relevance ${politeButIrrelevant.relevanceScore}/100 on “ok sure” vs ${goodSession.relevanceScore}/100 on substantive timeline reply.`,
);
console.log("\nAll relevance checks passed.");
