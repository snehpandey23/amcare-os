/**
 * Typing bank content-quality + section-focus checks (+ HIPAA / Writing isolated draw).
 *   cd apps/hipaa-training && npx tsx scripts/verify-competency-section-focus.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseExamSectionFocus, examSectionReviewHref } from "../src/lib/competency-exam/section-focus";
import { drawTypingPassage, drawHipaaExam, drawWritingPrompt, HIPAA_EXAM_COUNT } from "../src/lib/competency-exam/draws";
import { typingSectionScore } from "../src/lib/competency-exam/scoring";
import { scoreTyping } from "../src/lib/level-up/typing-drill";
import { recordSeen, freshDrawSeed } from "../src/lib/competency-exam/seen-set";
import { blendWritingScore, scoreWritingDeterministic } from "../src/lib/competency-exam/writing-score";
import { COMPETENCY_EXAM_TIMERS } from "../src/lib/competency-exam/exam-timer";
import {
  saveIsolatedReview,
  getIsolatedReview,
  type IsolatedWritingTrail,
} from "../src/lib/competency-exam/storage";
import { WRITING_PROMPTS } from "../src/content/competency-exam/writing-prompts.draft";
import passages from "../src/data/level-up/typing-passages.json";
import { ALL_QUESTIONS } from "../src/content/questionBank";

const __dirname = dirname(fileURLToPath(import.meta.url));

assert.equal(parseExamSectionFocus(null), null);
assert.equal(parseExamSectionFocus("typing"), "typing");
assert.equal(parseExamSectionFocus("hipaa"), "hipaa");
assert.equal(parseExamSectionFocus("writing"), "writing");
assert.equal(examSectionReviewHref("typing"), "/learn/competency-exam?section=typing");
assert.equal(examSectionReviewHref("hipaa"), "/learn/competency-exam?section=hipaa");
assert.equal(examSectionReviewHref("writing"), "/learn/competency-exam?section=writing");
assert.equal(passages.length, 15, "typing bank size");
assert.equal(COMPETENCY_EXAM_TIMERS.writing, 10 * 60, "writing lock is 10 minutes");

// UI must allow writing when isolated (not gated behind !isolated alone).
const examSrc = readFileSync(join(__dirname, "../src/components/competency-exam/CompetencyExam.tsx"), "utf8");
assert.match(examSrc, /focus === "writing"/);
assert.match(examSrc, /beginWritingOnly/);
assert.match(examSrc, /Start writing section/);
assert.doesNotMatch(examSrc, /VoiceInputButton/);
assert.match(examSrc, /data-no-voice-input="true"/);
assert.match(examSrc, /Mic\/dictation is not available/);
assert.doesNotMatch(examSrc, /phase === "writing" && writingPrompt && !isolated/);

const PUNCT = new Set(".,!?;:'\"()-/");
type Row = { id: string; title: string; text: string };
const table: { id: string; chars: number; words: number; punct: number }[] = [];

for (const row of passages as Row[]) {
  for (const field of ["title", "text"] as const) {
    const s = row[field];
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      assert.ok(
        code === 10 || (code >= 32 && code <= 126),
        `${row.id}.${field} non-keyboard U+${code.toString(16)}`,
      );
    }
  }
  const text = row.text;
  const words = text.match(/[A-Za-z0-9']+/g) || [];
  const punct = [...text].filter((c) => PUNCT.has(c)).length;
  table.push({ id: row.id, chars: text.length, words: words.length, punct });
  assert.equal(text.includes("\n"), false, `${row.id} must be single-line for exam fairness`);
  assert.ok(text.length >= 55 && text.length <= 95, `${row.id} chars ${text.length} outside 55–95`);
  assert.ok(words.length >= 9 && words.length <= 16, `${row.id} words ${words.length} outside 9–16`);
}

const chars = table.map((r) => r.chars);
const ratio = Math.max(...chars) / Math.min(...chars);
assert.ok(ratio <= 1.75, `length ratio ${ratio} still too high`);

console.log("passage table (chars / words / punct):");
for (const r of table) {
  console.log(`  ${r.id.padEnd(18)} ${String(r.chars).padStart(3)}  ${String(r.words).padStart(2)}  ${String(r.punct).padStart(2)}`);
}

const scored = scoreTyping(table[0] ? (passages as Row[])[0]!.text : "x", (passages as Row[])[0]!.text, 90, true);
const section = typingSectionScore(scored);
assert.match(section.note, /DEFAULT|pending founder|60%/i);

const a = drawTypingPassage([], 11).items[0]!.id;
const b = drawTypingPassage([], 99).items[0]!.id;
const after = recordSeen([], "typing", ["chat-portal"], [], "review-x");
const next = drawTypingPassage(after, 42).items[0]!;
assert.notEqual(next.id, "chat-portal", "seen-set excludes prior id when unused remain");
assert.ok(a && b);

const TRIALS = 3000;
const counts = new Map<string, number>();
for (let i = 0; i < TRIALS; i++) {
  const id = drawTypingPassage([], freshDrawSeed()).items[0]!.id;
  counts.set(id, (counts.get(id) ?? 0) + 1);
}
assert.equal(counts.size, passages.length, "every passage must appear in empty-seen draws");
const expected = TRIALS / passages.length;
let maxShare = 0;
for (const [id, n] of counts) {
  const share = n / TRIALS;
  maxShare = Math.max(maxShare, share);
  assert.ok(share < 0.12, `${id} share ${(share * 100).toFixed(1)}% looks biased (expected ~6.7%)`);
  assert.ok(n > expected * 0.45, `${id} under-drawn (${n})`);
}

const ephemeral = recordSeen([], "typing", ["doc-refill"], [], "review-1");
const again = drawTypingPassage(ephemeral, freshDrawSeed()).items[0]!;
assert.notEqual(again.id, "doc-refill", "within-session Run again must exclude prior passage");

const sameMsPair = [drawTypingPassage([], freshDrawSeed()).items[0]!.id, drawTypingPassage([], freshDrawSeed()).items[0]!.id];
assert.ok(sameMsPair[0] && sameMsPair[1]);

assert.ok(ALL_QUESTIONS.length >= HIPAA_EXAM_COUNT, "HIPAA bank must fill one sitting");
const hipaaA = drawHipaaExam([], freshDrawSeed());
const hipaaB = drawHipaaExam([], freshDrawSeed());
assert.equal(hipaaA.questions.length, HIPAA_EXAM_COUNT);
assert.equal(hipaaB.questions.length, HIPAA_EXAM_COUNT);
assert.equal(hipaaA.repeatedIds.length, 0, "empty seen should not mark repeats");
const hipaaIds = hipaaA.questions.map((q) => q.id);
assert.equal(new Set(hipaaIds).size, HIPAA_EXAM_COUNT, "HIPAA draw must be unique within sitting");
const hipaaSeen = recordSeen([], "hipaa", hipaaIds, [], "review-hipaa-1");
const hipaaAgain = drawHipaaExam(hipaaSeen, freshDrawSeed());
assert.equal(hipaaAgain.questions.length, HIPAA_EXAM_COUNT);
const againFresh = hipaaAgain.questions.filter((q) => !hipaaIds.includes(q.id));
assert.equal(againFresh.length, HIPAA_EXAM_COUNT, "second HIPAA review with room in bank should avoid prior 20");
assert.equal(hipaaAgain.repeatedIds.length, 0);

// Writing isolated review: draft bank, draw, score, trail persistence (same REVIEW_ATTEMPTS_KEY).
assert.ok(WRITING_PROMPTS.length >= 5, "writing bank should have several prompts");
for (const p of WRITING_PROMPTS) {
  assert.equal(p.reviewStatus, "draft_pending_sonu", `${p.id} must stay draft_pending_sonu`);
}
const writeA = drawWritingPrompt([], freshDrawSeed());
assert.equal(writeA.items.length, 1);
assert.equal(writeA.repeatedIds.length, 0);
const wp = writeA.items[0]!;
const writeSeen = recordSeen([], "writing", [wp.id], [], "review-writing-1");
const writeAgain = drawWritingPrompt(writeSeen, freshDrawSeed());
assert.equal(writeAgain.items.length, 1);
assert.notEqual(writeAgain.items[0]!.id, wp.id, "Run again must exclude prior writing prompt when unused remain");

const sampleText = [
  "Thank you for messaging. I see your refill request and will send it to the care team for review today.",
  "I cannot promise a prescription myself, but I will document what the pharmacy said and ask the clinician to follow up.",
  "Chart note: Patient reports pharmacy never received refill. Requested same-day send. Escalated to clinician; no Rx promised by MA.",
].join(" ");
const det = scoreWritingDeterministic(sampleText);
assert.ok(det.wordCount >= 40, "sample should meet length floor");
const blended = blendWritingScore(det.score, 78);
assert.ok(blended.score >= 0 && blended.score <= 100);

const mem = new Map<string, string>();
const ls = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => {
    mem.set(k, v);
  },
  removeItem: (k: string) => {
    mem.delete(k);
  },
  clear: () => mem.clear(),
  key: () => null,
  length: 0,
} as Storage;
(globalThis as unknown as { window: { localStorage: Storage }; localStorage: Storage }).window = {
  localStorage: ls,
};
(globalThis as unknown as { localStorage: Storage }).localStorage = ls;

const attemptId = `review-writing-verify-${Date.now()}`;
const trail: IsolatedWritingTrail = {
  promptId: wp.id,
  title: wp.title,
  prompt: wp.prompt,
  text: sampleText,
  wordCount: det.wordCount,
  grammarScore: det.grammarScore,
  issues: det.issues,
  llmEstimate: 78,
  blendedScore: blended.score,
};
saveIsolatedReview({
  attemptId,
  userId: "verify-user",
  section: "writing",
  at: Date.now(),
  score: blended.score,
  detail: `${det.wordCount} words · grammar ${det.grammarScore} · LLM estimate 78`,
  itemIds: [wp.id],
  repeatedIds: [],
  items: [],
  writing: trail,
});
const loaded = getIsolatedReview(attemptId);
assert.ok(loaded, "writing trail must persist");
assert.equal(loaded!.section, "writing");
assert.equal(loaded!.writing?.promptId, wp.id);
assert.equal(loaded!.writing?.text, sampleText);
assert.equal(loaded!.writing?.blendedScore, blended.score);
assert.ok(loaded!.writing?.prompt.includes(" "), "prompt text stored");
assert.equal(loaded!.items.length, 0, "writing uses writing trail, not HIPAA items[]");

// Isolated writing submit must close out (section-done) and return — not continue to chat.
const writingSubmitCloseout =
  /if \(focus === "writing"\) \{[\s\S]*?setWritingTrail\(trail\);[\s\S]*?setLastSection\(row\);[\s\S]*?setPhase\("section-done"\);\s*return;/;
assert.match(examSrc, writingSubmitCloseout);
const submitWritingFn = examSrc.match(/const submitWriting = useCallback\(async \(\) => \{[\s\S]*?\}, \[[^\]]+\]\);/);
assert.ok(submitWritingFn, "submitWriting callback present");
assert.match(submitWritingFn![0], /setPhase\("section-done"\)/);
assert.doesNotMatch(submitWritingFn![0], /setPhase\("chat"\)/);

const learnHub = readFileSync(join(__dirname, "../src/components/companion/LearnHub.tsx"), "utf8");
assert.match(learnHub, /Competency · Writing review/);
assert.match(learnHub, /\/learn\/competency-exam\?section=writing/);

console.log("EVIDENCE writing isolated trail:", JSON.stringify(loaded, null, 2));
console.log("verify-competency-section-focus: OK", {
  lengthRatio: Number(ratio.toFixed(2)),
  sampleDraws: { seed11: a, seed99: b },
  afterChatPortalSeen: next.id,
  formulaNote: section.note.slice(0, 80),
  emptySeenMaxShare: `${(maxShare * 100).toFixed(1)}%`,
  runAgainAfterDocRefill: again.id,
  independentPair: sameMsPair,
  hipaaBank: ALL_QUESTIONS.length,
  hipaaDrawSizes: [hipaaA.questions.length, hipaaB.questions.length],
  hipaaRunAgainFresh: againFresh.length,
  writingBank: WRITING_PROMPTS.length,
  writingDraw: wp.id,
  writingAgain: writeAgain.items[0]!.id,
  writingTrailAttempt: attemptId,
  writingScore: blended.score,
  writingWords: det.wordCount,
  writingTimerSec: COMPETENCY_EXAM_TIMERS.writing,
  writingNoMic: true,
  writingDraftStatus: "draft_pending_sonu",
  writingCloseout: "section-done",
});
