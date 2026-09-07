/**
 * Re-score the founder Emma 6-reply transcript — before (rigid) vs after (chat register).
 *   npx tsx apps/hipaa-training/scripts/smoke-chat-sim-scoring-emma.ts
 */
import assert from "node:assert/strict";
import {
  evaluateSimulatorSession,
  isPoliteMessage,
  legacyPoliteExactPhrase,
  legacyRigidGrammarIssues,
} from "../src/lib/patient-drill/evaluate";

/** Exact MA replies from live Emma session (founder paste 2026-09-05). */
const EMMA_MA_REPLIES = [
  "hello emma how are youo?",
  "okay sure, are you showing for the first time",
  "okay so sorry to hear that",
  "first thing is booking an appointment with our providers to go through your clinical history",
  "while we can typically get an appointment within the same week, getting medications aren't guaranteed",
  "i will see what i can do, can you make it tomorrow 7 pm?",
] as const;

const messages = EMMA_MA_REPLIES.map((text) => ({ who: "you" as const, text }));

// --- BEFORE (rigid formatting + narrow phrases) ---
const legacyGrammarOk = EMMA_MA_REPLIES.filter((t) => legacyRigidGrammarIssues(t).length === 0).length;
const legacyPolite = EMMA_MA_REPLIES.filter((t) => legacyPoliteExactPhrase(t)).length;
const beforeGrammar = Math.round((legacyGrammarOk / EMMA_MA_REPLIES.length) * 100);
const beforePolite = Math.round((legacyPolite / EMMA_MA_REPLIES.length) * 100);

// --- AFTER ---
const after = evaluateSimulatorSession(messages);
const politeFlags = EMMA_MA_REPLIES.map((t) => ({ t, polite: isPoliteMessage(t) }));

console.log("=== Emma 6-reply transcript — scoring before/after ===\n");
console.log("BEFORE (rigid caps/period + narrow phrase list)");
console.log(`  Grammar:    ${beforeGrammar}/100  (${EMMA_MA_REPLIES.length - legacyGrammarOk} flagged — almost all for missing caps/periods)`);
console.log(`  Politeness: ${beforePolite}/100  (${legacyPolite}/${EMMA_MA_REPLIES.length} phrase hits)`);
for (const t of EMMA_MA_REPLIES) {
  const issues = legacyRigidGrammarIssues(t);
  console.log(`    · “${t.slice(0, 56)}${t.length > 56 ? "…" : ""}”`);
  console.log(`      legacy grammar: ${issues.length ? issues.join(", ") : "ok"} | phrase-polite: ${legacyPoliteExactPhrase(t)}`);
}

console.log("\nAFTER (chat-register grammar + forgiving politeness + relevance)");
console.log(`  Grammar:    ${after.grammarScore}/100  (${after.grammarErrorCount} real-issue flags)`);
console.log(`  Politeness: ${after.politenessScore}/100  (${politeFlags.filter((p) => p.polite).length}/${EMMA_MA_REPLIES.length} tone-ok)`);
console.log(`  Relevance:  ${after.relevanceScore}/100  (MA-only transcript — no patient turns paired; see smoke-chat-sim-relevance.ts)`);
console.log(`  Note: ${after.grammarNote}`);
for (const g of after.grammarIssues) {
  console.log(`    · Reply ${g.messageIndex + 1}: ${g.kinds.join(", ")} — ${g.detail || g.excerpt}`);
}
for (const { t, polite } of politeFlags) {
  console.log(`    · polite=${polite} “${t.slice(0, 60)}${t.length > 60 ? "…" : ""}”`);
}

// Caps/period must not appear as issue kinds
assert.ok(
  after.grammarIssues.every(
    (g) =>
      !g.kinds.some((k) =>
        ["missing_capital", "missing_end_punctuation", "double_space"].includes(k),
      ),
  ),
  "must not flag chat formatting",
);

// “okay so sorry to hear that” must register as polite
assert.equal(isPoliteMessage("okay so sorry to hear that"), true);
assert.ok(after.politenessScore >= 80, `expected high politeness, got ${after.politenessScore}`);

// Real issues on this transcript: youo, showing, medications aren't
assert.ok(after.grammarErrorCount >= 2, "expected real grammar flags on this transcript");
assert.ok(after.grammarScore > beforeGrammar, "new grammar score must beat rigid formatter");
assert.ok(after.politenessScore > beforePolite, "new politeness must beat narrow phrase list");

// LanguageTool not claimed
assert.ok(after.grammarNote.toLowerCase().includes("languagetool"));
assert.ok(after.grammarNote.toLowerCase().includes("not wired"));

console.log("\nHuman read of this transcript:");
console.log("  · Reply 1 “youo” — real typo (should flag)");
console.log("  · Reply 2 “showing for the first time” — wrong/unclear wording (should flag)");
console.log("  · Reply 3 “okay so sorry to hear that” — fine + polite (should pass)");
console.log("  · Reply 4 process steps — fine chat grammar (should pass)");
console.log("  · Reply 5 “getting medications aren't” — subject–verb disagreement (should flag)");
console.log("  · Reply 6 scheduling offer — fine chat grammar (should pass)");
console.log(`  → Expected ~50/100 grammar (3/6 ok), high politeness — got grammar ${after.grammarScore}, politeness ${after.politenessScore}`);

assert.equal(after.grammarScore, 50, `expected 50 (3/6 clean), got ${after.grammarScore}`);
assert.equal(after.messageCount, 6);

console.log("\nAll Emma scoring checks passed.");
