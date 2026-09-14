/**
 * Scoring integrity verification (no deploy required for unit checks).
 *
 * 1) Exam trail builders mark chat/listening as auditable with transcript (+ STT fields).
 * 2) Audit grammar sample before/after expanded ESL patterns.
 * 3) Relevance near-floor cross-check caps/marks grammar.
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-scoring-integrity.ts
 */
import assert from "node:assert/strict";
import {
  buildExamChatSimTrailJson,
  buildExamListeningTrailJson,
  examTrailIsAuditable,
  EXAM_TRAIL_TRANSCRIPT_VERSION,
} from "../src/lib/competency-exam/exam-trail";
import {
  evaluateSimulatorSession,
  grammarIssuesForMessage,
  type SimulatorFeedback,
} from "../src/lib/patient-drill/evaluate";
import { AUDIT_GRAMMAR_2026_09_SAMPLES } from "../src/lib/patient-drill/fixtures/audit-grammar-2026-09-sample";

function pass(label: string, detail?: string) {
  console.log(`PASS ${label}${detail ? ` — ${detail}` : ""}`);
}

/** Legacy score-only trail (pre-fix) — must be unauditable. */
const legacyChatTrail = { grammar: 100, politeness: 100, relevance: 100 };
assert.equal(examTrailIsAuditable(legacyChatTrail), false);
pass("legacy-chat-trail-unauditable");

const mockFb: SimulatorFeedback = {
  empathyScore: 100,
  politenessScore: 100,
  politenessNote: "",
  grammarScore: 80,
  grammarNote: "",
  grammarIssues: [],
  relevanceScore: 70,
  relevanceNote: "",
  relevanceTurns: [],
  avgWpm: 0,
  wpmReliable: false,
  rawAvgWpm: 0,
  spokenSession: true,
  messageCount: 2,
  grammarErrorCount: 0,
  accuracyNote: "",
  clinicalAccuracyHits: [],
  outcome: "completed",
  redFlagged: false,
  safetyReasons: [],
  safetyNotes: [],
  transcriptVersion: 1,
  transcript: [
    { who: "Janet", text: "Hi, I need to renew Adderall." },
    {
      who: "you",
      text: "I can help with the controlled substance agreement first.",
      inputModality: "spoken",
      sttRaw: "I can help with the control substance agreement first.",
      sttProvider: "sarvam",
    },
  ],
};

const chatTrail = buildExamChatSimTrailJson({
  feedback: mockFb,
  modality: "spoken",
  briefId: "brief-test",
});
assert.equal(chatTrail.transcriptVersion, EXAM_TRAIL_TRANSCRIPT_VERSION);
assert.ok(examTrailIsAuditable(chatTrail));
assert.equal(chatTrail.transcript.length, 2);
assert.equal(chatTrail.transcript[1]?.sttRaw?.includes("control substance"), true);
assert.equal(chatTrail.grammar, 80);
assert.equal(chatTrail.relevance, 70);
pass("chat-trail-auditable-with-sttRaw");

const listeningTrail = buildExamListeningTrailJson({
  promptId: "listen-1",
  title: "Voicemail",
  prompt: "Write a provider message",
  format: "listening-provider-message",
  text: "Hi Dr. Pandey — patient called about refill; please advise next steps.",
  wordCount: 12,
  grammarScore: 100,
  issues: [],
  voicemailScript: "Hi, this is Emma, calling about my Adderall refill…",
  estimateUnavailableReason: null,
});
assert.ok(examTrailIsAuditable(listeningTrail));
assert.equal(listeningTrail.transcript[0]?.who, "stimulus");
assert.equal(listeningTrail.transcript[1]?.who, "you");
assert.equal(listeningTrail.transcript[1]?.inputModality, "typed");
pass("listening-trail-auditable-stimulus-plus-trainee");

// --- Grammar expansion before/after on audit sample ---
let expectIssue = 0;
let caught = 0;
let cleanExpected = 0;
let falseClean = 0;
const misses: string[] = [];
for (const s of AUDIT_GRAMMAR_2026_09_SAMPLES) {
  const issues = grammarIssuesForMessage(s.text);
  const flagged = issues.kinds.length > 0;
  if (s.expectIssue) {
    expectIssue++;
    if (flagged) caught++;
    else {
      falseClean++;
      misses.push(s.text.slice(0, 100));
    }
  } else {
    cleanExpected++;
  }
}
console.log(
  JSON.stringify(
    {
      auditSamples: AUDIT_GRAMMAR_2026_09_SAMPLES.length,
      expectIssue,
      caughtByExpandedScorer: caught,
      stillMissed: falseClean,
      missPreviews: misses,
      // Historical: audit recorded grammar=100 for all of these (0 caught by old thin list).
      beforeCaught: 0,
      afterCaught: caught,
    },
    null,
    2,
  ),
);
assert.ok(caught >= 7, `expected ≥7 ESL/typo catches from audit set, got ${caught}`);
pass("grammar-expansion-audit-sample", `before=0 after=${caught}/${expectIssue}`);

// Known patterns smoke
assert.ok(grammarIssuesForMessage("Can you share me your preferred availability?").kinds.includes("esl_collocation"));
assert.ok(
  grammarIssuesForMessage("Yes we can help you scheduling appointment to get everything done.").kinds.includes(
    "esl_collocation",
  ),
);
assert.ok(grammarIssuesForMessage("It is an inital consultation").kinds.includes("wrong_word_or_typo"));
assert.ok(
  grammarIssuesForMessage("That would depend upon the providers' review and advise.").kinds.includes(
    "esl_collocation",
  ),
);
pass("grammar-pattern-smokes");

// Relevance near-floor cross-check: polite but empty engagement → grammar cannot stay 100
const lowRel = evaluateSimulatorSession(
  [
    { who: "Michael", text: "When can I get my Adderall refill appointment?" },
    { who: "you", text: "Hello Michael,", inputModality: "typed" },
    { who: "Michael", text: "I need a time this week." },
    { who: "you", text: "Thanks for sharing this with us.", inputModality: "typed" },
  ],
  { outcome: "completed" },
);
assert.ok(lowRel.relevanceScore <= 25, `expected near-floor relevance, got ${lowRel.relevanceScore}`);
assert.ok(
  lowRel.grammarScore <= 70,
  `expected grammar capped/reduced when relevance near-floor, got ${lowRel.grammarScore}`,
);
assert.ok(
  lowRel.grammarIssues.some((g) => g.kinds.includes("relevance_floor_cross_check")) ||
    lowRel.grammarCappedForLowRelevance,
);
pass("relevance-floor-grammar-cross-check", `G=${lowRel.grammarScore} R=${lowRel.relevanceScore}`);

// Strong ESL still flagged even with decent relevance context
const esl = evaluateSimulatorSession(
  [
    { who: "Michael", text: "Can you help me book?" },
    {
      who: "you",
      text: "Hello Michael, Yes we can help you scheduling appointment to get everything done.",
      inputModality: "typed",
    },
  ],
  { outcome: "completed" },
);
assert.ok(esl.grammarIssues.some((g) => g.kinds.includes("esl_collocation")));
assert.ok(esl.grammarScore < 100);
pass("esl-collocation-in-session-score");

console.log("\nALL PASS — scoring integrity (trail + grammar + cross-check)");
console.log(
  "Note: historical chat-sim exam trails (score-only) remain unauditable; Alpana spoken 100 cannot be recovered. New attempts after deploy will store transcript+sttRaw.",
);
