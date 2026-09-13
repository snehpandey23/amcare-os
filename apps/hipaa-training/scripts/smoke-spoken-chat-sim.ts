/**
 * Spoken chat-sim — scoring honesty + transcript edit path (no live mic required).
 * Run: npx tsx scripts/smoke-spoken-chat-sim.ts
 */
import assert from "node:assert/strict";
import {
  evaluateSimulatorSession,
  grammarIssuesForMessage,
  normalizeSpeechDisfluencyForGrammar,
} from "../src/lib/patient-drill/evaluate";
import { buildChatSimTranscript } from "../src/lib/level-up/progress";

// --- Disfluency must not flag as grammar ---
const withFillers =
  "um uh I can help you book an appointment for tomorrow morning if that works";
const issues = grammarIssuesForMessage(withFillers);
assert.deepEqual(issues.kinds, [], `unexpected grammar kinds: ${JSON.stringify(issues)}`);
assert.match(normalizeSpeechDisfluencyForGrammar(withFillers), /I can help you book/i);

const stutter = "I I can check the schedule for you next week";
assert.deepEqual(grammarIssuesForMessage(stutter).kinds, []);

// Still catch real writing errors after normalize
const bad = "um teh appointment is tomorrow";
assert.ok(grammarIssuesForMessage(bad).kinds.includes("wrong_word_or_typo"));

// --- Score submitted text, never raw STT ---
const patient = "How soon can I get an appointment?";
const sttRaw = "ok sure how can I help"; // thin / off — would score poorly if used
const submitted =
  "I can help you book — we usually have openings same week; what day works best for you?";

const fbSpoken = evaluateSimulatorSession([
  { who: "Jordan", text: patient },
  {
    who: "you",
    text: submitted,
    inputModality: "spoken",
    sttRaw,
    sttProvider: "sarvam",
  },
]);

assert.equal(fbSpoken.spokenSession, true);
assert.equal(fbSpoken.wpmReliable, false);
assert.equal(fbSpoken.avgWpm, 0);
assert.match(fbSpoken.accuracyNote, /does not score pronunciation/i);
assert.ok(fbSpoken.grammarScore === 100, `grammar ${fbSpoken.grammarScore}`);
assert.ok(fbSpoken.relevanceScore >= 55, `relevance should use submitted text, got ${fbSpoken.relevanceScore}`);

// If we had scored raw STT instead, relevance would be low
const fbIfRaw = evaluateSimulatorSession([
  { who: "Jordan", text: patient },
  { who: "you", text: sttRaw, inputModality: "spoken", sttRaw },
]);
assert.ok(
  fbIfRaw.relevanceScore < fbSpoken.relevanceScore,
  `raw STT relevance ${fbIfRaw.relevanceScore} should be worse than submitted ${fbSpoken.relevanceScore}`,
);

// Deliberately leave filler in submitted spoken reply — still 100 grammar
const fbFiller = evaluateSimulatorSession([
  { who: "Jordan", text: patient },
  {
    who: "you",
    text: "um I can help you book for tomorrow morning if that works for you",
    inputModality: "spoken",
    sttRaw: "um I can help you book for tomorrow morning if that works for you",
  },
]);
assert.equal(fbFiller.grammarScore, 100);
assert.equal(fbFiller.grammarErrorCount, 0);

// Transcript persistence keeps audit STT separate from scored text
const tx = buildChatSimTranscript([
  { who: "Jordan", text: patient },
  {
    who: "you",
    text: submitted,
    inputModality: "spoken",
    sttRaw,
    sttProvider: "sarvam",
  },
]);
assert.equal(tx[1]?.text, submitted);
assert.equal(tx[1]?.sttRaw, sttRaw);
assert.equal(tx[1]?.inputModality, "spoken");
assert.notEqual(tx[1]?.text, tx[1]?.sttRaw);

console.log(
  JSON.stringify(
    {
      disfluencyGrammarKinds: issues.kinds,
      spokenGrammar: fbSpoken.grammarScore,
      spokenRelevance: fbSpoken.relevanceScore,
      rawWouldScoreRelevance: fbIfRaw.relevanceScore,
      fillerLeftInGrammar: fbFiller.grammarScore,
      transcriptAuditSeparate: tx[1]?.sttRaw !== tx[1]?.text,
      wpmSpoken: fbSpoken.avgWpm,
      spokenSession: fbSpoken.spokenSession,
    },
    null,
    2,
  ),
);
console.log("smoke-spoken-chat-sim: OK");
