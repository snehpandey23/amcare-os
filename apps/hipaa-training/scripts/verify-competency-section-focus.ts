/**
 * Typing bank content-quality + section-focus checks (+ HIPAA isolated draw).
 *   cd apps/hipaa-training && npx tsx scripts/verify-competency-section-focus.ts
 */
import assert from "node:assert/strict";
import { parseExamSectionFocus, examSectionReviewHref } from "../src/lib/competency-exam/section-focus";
import { drawTypingPassage, drawHipaaExam, HIPAA_EXAM_COUNT } from "../src/lib/competency-exam/draws";
import { typingSectionScore } from "../src/lib/competency-exam/scoring";
import { scoreTyping } from "../src/lib/level-up/typing-drill";
import { recordSeen, freshDrawSeed } from "../src/lib/competency-exam/seen-set";
import passages from "../src/data/level-up/typing-passages.json";
import { ALL_QUESTIONS } from "../src/content/questionBank";

assert.equal(parseExamSectionFocus(null), null);
assert.equal(parseExamSectionFocus("typing"), "typing");
assert.equal(parseExamSectionFocus("hipaa"), "hipaa");
assert.equal(examSectionReviewHref("typing"), "/learn/competency-exam?section=typing");
assert.equal(examSectionReviewHref("hipaa"), "/learn/competency-exam?section=hipaa");
assert.equal(passages.length, 15, "typing bank size");

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

// Seen-set draw is real (not fixed): two different seeds with empty seen can differ;
// and after recording chat-portal, a fresh official draw prefers other ids.
const a = drawTypingPassage([], 11).items[0]!.id;
const b = drawTypingPassage([], 99).items[0]!.id;
const after = recordSeen([], "typing", ["chat-portal"], [], "review-x");
const next = drawTypingPassage(after, 42).items[0]!;
assert.notEqual(next.id, "chat-portal", "seen-set excludes prior id when unused remain");
assert.ok(a && b);

// Isolated-review simulation: empty ephemeral seen + crypto seeds must vary across draws,
// and after recording a hit, "Run again" must exclude that id while unused remain.
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
  // Fair share ≈ 6.7%; reject old LCG-style bias (~18% on favorites).
  assert.ok(share < 0.12, `${id} share ${(share * 100).toFixed(1)}% looks biased (expected ~6.7%)`);
  assert.ok(n > expected * 0.45, `${id} under-drawn (${n})`);
}

let ephemeral = recordSeen([], "typing", ["doc-refill"], [], "review-1");
const again = drawTypingPassage(ephemeral, freshDrawSeed()).items[0]!;
assert.notEqual(again.id, "doc-refill", "within-session Run again must exclude prior passage");

// Two independent empty-seen starts CAN collide (1/15) — that is fair randomness, not a stuck seed.
const sameMsPair = [drawTypingPassage([], freshDrawSeed()).items[0]!.id, drawTypingPassage([], freshDrawSeed()).items[0]!.id];
assert.ok(sameMsPair[0] && sameMsPair[1]);

// HIPAA isolated review: 20-from-73 draw, ephemeral exclusion across Run-again.
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
});
