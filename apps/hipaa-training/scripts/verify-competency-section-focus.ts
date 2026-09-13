/**
 * Competency exam section-focus + draw + Listening single-response checks.
 *   cd apps/hipaa-training && npx tsx scripts/verify-competency-section-focus.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseExamSectionFocus, examSectionReviewHref } from "../src/lib/competency-exam/section-focus";
import {
  drawTypingPassage,
  drawCombinedMcqExam,
  drawListeningPrompt,
  drawHipaaExam,
  HIPAA_EXAM_COUNT,
  MCQ_EXAM_COUNT,
} from "../src/lib/competency-exam/draws";
import { typingSectionScore } from "../src/lib/competency-exam/scoring";
import type { TypingScore } from "../src/lib/level-up/typing-drill";
import { recordSeen, freshDrawSeed } from "../src/lib/competency-exam/seen-set";
import {
  assessWritingSubstance,
  scoreListeningProviderMessage,
  WRITING_EMPTY_SUBSTANCE_CAP,
} from "../src/lib/competency-exam/writing-score";
import { COMPETENCY_EXAM_TIMERS } from "../src/lib/competency-exam/exam-timer";
import { examWeightsSum, EXAM_WEIGHTS, LIVE_SECTION_ORDER, SECTION_LABEL } from "../src/lib/competency-exam/weights";
import { LISTENING_PROMPTS } from "../src/content/competency-exam/listening-prompts.draft";
import { CLINICAL_KNOWLEDGE_BANK_DRAFT_V1 } from "../src/content/competency-exam/clinical-knowledge-bank.draft";
import { CULTURE_EXAM_BANK_DRAFT_V1 } from "../src/content/competency-exam/culture-bank-exam.draft";
import passages from "../src/data/level-up/typing-passages.json";

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- section focus aliases ---
assert.equal(parseExamSectionFocus(null), null);
assert.equal(parseExamSectionFocus("typing"), "typing");
assert.equal(parseExamSectionFocus("mcq"), "mcq");
assert.equal(parseExamSectionFocus("hipaa"), "mcq", "legacy hipaa → mcq");
assert.equal(parseExamSectionFocus("writing"), "listening", "legacy writing → listening");
assert.equal(parseExamSectionFocus("listening"), "listening");
assert.equal(examSectionReviewHref("typing"), "/learn/competency-exam?section=typing");
assert.equal(examSectionReviewHref("mcq"), "/learn/competency-exam?section=mcq");
assert.equal(examSectionReviewHref("hipaa"), "/learn/competency-exam?section=mcq");
assert.equal(examSectionReviewHref("writing"), "/learn/competency-exam?section=listening");
assert.equal(examSectionReviewHref("listening"), "/learn/competency-exam?section=listening");

assert.equal(passages.length, 15, "typing bank size");
assert.equal(COMPETENCY_EXAM_TIMERS.mcq, 20 * 60);
assert.equal(COMPETENCY_EXAM_TIMERS.listening, 10 * 60);
assert.equal(examWeightsSum(), 100);
assert.deepEqual(LIVE_SECTION_ORDER, ["typing", "mcq", "listening", "chat-sim-typed", "chat-sim-spoken"]);
assert.equal(SECTION_LABEL.mcq, "Combined MCQ");
assert.equal(EXAM_WEIGHTS.listening, 20);

const examSrc = readFileSync(join(__dirname, "../src/components/competency-exam/CompetencyExam.tsx"), "utf8");
assert.match(examSrc, /drawCombinedMcqExam/);
assert.match(examSrc, /drawListeningPrompt/);
assert.match(examSrc, /scoreListeningProviderMessage/);
assert.match(examSrc, /data-listening-voicemail/);
assert.match(examSrc, /Start listening section/);
assert.match(examSrc, /providerMessageHint/);
assert.match(examSrc, /chat-sim-typed/);
assert.match(examSrc, /chat-sim-spoken/);
assert.doesNotMatch(examSrc, /beginWritingOnly/);
assert.doesNotMatch(examSrc, /Start writing section/);
assert.doesNotMatch(examSrc, /writing-chart-note/);
assert.doesNotMatch(examSrc, /heldCulture/);
assert.match(examSrc, /unsuccessful callback attempt|callback attempt|provider message/i);

const learnHub = readFileSync(join(__dirname, "../src/components/companion/LearnHub.tsx"), "utf8");
assert.match(learnHub, /section=mcq/);
assert.match(learnHub, /section=listening/);
assert.doesNotMatch(learnHub, /section=writing/);

// --- Listening content: single-response ---
assert.equal(LISTENING_PROMPTS.length >= 1, true);
assert.equal(LISTENING_PROMPTS[0]!.responseShape, "provider-message-only");
assert.ok(LISTENING_PROMPTS[0]!.providerMessageHint.length > 20);
assert.ok(!("chartHint" in LISTENING_PROMPTS[0]!));

// --- Clinical knowledge draft sample ---
assert.ok(CLINICAL_KNOWLEDGE_BANK_DRAFT_V1.length >= 10);
assert.ok(CLINICAL_KNOWLEDGE_BANK_DRAFT_V1.some((i) => i.subArea === "recent_advances" && i.reReviewMonths));
assert.ok(CLINICAL_KNOWLEDGE_BANK_DRAFT_V1.every((i) => i.reviewOwner === "Vayushi"));
assert.ok(CULTURE_EXAM_BANK_DRAFT_V1.length >= 20);

// --- draws ---
{
  const typing = drawTypingPassage([], freshDrawSeed("u"));
  assert.equal(typing.items.length, 1);
  const mcq = drawCombinedMcqExam([], 99);
  assert.equal(mcq.questions.length, MCQ_EXAM_COUNT);
  const listening = drawListeningPrompt([], 7);
  assert.equal(listening.items.length, 1);
  const hipaaOnly = drawHipaaExam([], 3);
  assert.equal(hipaaOnly.questions.length, HIPAA_EXAM_COUNT);
}

// --- thank-you floor (also covered by smoke-writing-substance-floor) ---
assert.equal(assessWritingSubstance("thank you").ok, false);
const thank = scoreListeningProviderMessage({ text: "thank you", llmEstimate: 88 });
assert.ok(thank.score <= WRITING_EMPTY_SUBSTANCE_CAP);

// --- typing score still maps ---
{
  const raw: TypingScore = {
    accuracy: 100,
    wpm: 45,
    wpmReliable: true,
    rawWpm: 45,
    typedChars: 40,
    targetChars: 40,
    correctChars: 40,
    elapsedSec: 60,
    finished: true,
  };
  const mapped = typingSectionScore(raw);
  assert.ok(mapped.score >= 0 && mapped.score <= 100);
}

// seen-set record still works
{
  let seen = recordSeen([], "listening", ["listen-clin-refill-urgent-v1"], [], "attempt-1");
  assert.equal(seen.length, 1);
  seen = recordSeen(seen, "mcq", ["x"], [], "attempt-2");
  assert.ok(seen.length >= 2);
}

console.log("ok: competency section-focus / MCQ / Listening / weights verify passed");
