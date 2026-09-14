/**
 * Spoken chat-sim — raw STT scoring policy + persona voice gender (no live mic).
 * Run: npx tsx scripts/smoke-spoken-chat-sim.ts
 */
import assert from "node:assert/strict";
import {
  evaluateSimulatorSession,
  grammarIssuesForMessage,
  normalizeSpeechDisfluencyForGrammar,
} from "../src/lib/patient-drill/evaluate";
import { buildChatSimTranscript } from "../src/lib/level-up/progress";
import {
  rerecordsRemaining,
  SPOKEN_FREE_RERECORDS_PER_TURN,
  SPOKEN_RAW_STT_POLICY,
  canRerecord,
} from "../src/lib/patient-drill/spoken-turn-limits.ts";
import { sttStudyFairRate, type SttStudyTurnLog } from "../src/lib/patient-drill/spoken-stt-study.ts";
import { measureSttTranscriptEdit } from "../src/lib/patient-drill/spoken-transcript-edit.ts";
import {
  PERSONA_TTS_PROFILES,
  isPersonaVoiceGenderMismatch,
  resolvePersonaTtsVoiceURI,
  personaVoiceProfile,
} from "../src/lib/patient-drill/persona-tts-voice.ts";
import type { TtsVoiceOption } from "../src/lib/text-to-speech.ts";

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

// --- Production policy: score raw STT as written (no edit safety net) ---
const patient = "How soon can I get an appointment?";
const rawSttScored =
  "I can help you book — we usually have openings same week; what day works best for you?";

const fbSpoken = evaluateSimulatorSession([
  { who: "Jordan", text: patient },
  {
    who: "you",
    text: rawSttScored,
    inputModality: "spoken",
    sttRaw: rawSttScored,
  },
]);
assert.equal(fbSpoken.spokenSession, true);
assert.match(fbSpoken.accuracyNote, /raw cloud transcription|no transcript edit/i);
assert.match(SPOKEN_RAW_STT_POLICY, /no edit or confirm/i);

const thinRaw = "ok sure how can I help";
const fbThin = evaluateSimulatorSession([
  { who: "Jordan", text: patient },
  { who: "you", text: thinRaw, inputModality: "spoken", sttRaw: thinRaw },
]);
assert.ok(fbThin.relevanceScore < fbSpoken.relevanceScore, "thin raw STT must score as-is");

const tx = buildChatSimTranscript([
  { who: "Jordan", text: patient },
  {
    who: "you",
    text: rawSttScored,
    inputModality: "spoken",
    sttRaw: rawSttScored,
  },
]);
assert.equal(tx[1]?.inputModality, "spoken");
assert.equal(tx[1]?.text, tx[1]?.sttRaw);

console.log(
  JSON.stringify(
    {
      spokenGrammar: fbSpoken.grammarScore,
      spokenRelevance: fbSpoken.relevanceScore,
      thinRawRelevance: fbThin.relevanceScore,
      rawEqualsScored: tx[1]?.text === tx[1]?.sttRaw,
      spokenSession: fbSpoken.spokenSession,
      policy: SPOKEN_RAW_STT_POLICY,
    },
    null,
    2,
  ),
);

// Edit-distance helpers remain for legacy trails / Ops; production no longer edits.
const minor = measureSttTranscriptEdit("use the Mick please", "use the mic please");
assert.equal(minor.heavilyEdited, false);

// --- Persona voice: stable + gender-correct ---
assert.ok(PERSONA_TTS_PROFILES["persona-janet"]);
assert.ok(PERSONA_TTS_PROFILES["persona-emma"]);
const fakeVoices: TtsVoiceOption[] = [
  {
    voiceURI: "uri-samantha",
    name: "Samantha",
    lang: "en-US",
    label: "English — Samantha",
    localService: true,
    default: false,
  },
  {
    voiceURI: "uri-alex",
    name: "Alex",
    lang: "en-US",
    label: "English — Alex",
    localService: true,
    default: false,
  },
  {
    voiceURI: "uri-david",
    name: "Microsoft David",
    lang: "en-US",
    label: "English — David",
    localService: false,
    default: false,
  },
];
const j1 = resolvePersonaTtsVoiceURI("persona-janet", fakeVoices);
const j2 = resolvePersonaTtsVoiceURI("persona-janet", fakeVoices);
const e1 = resolvePersonaTtsVoiceURI("persona-emma", fakeVoices);
assert.equal(j1, j2, "Janet voice must be stable across resolves");
assert.ok(j1);
assert.ok(e1);
assert.equal(j1, "uri-samantha", "Janet (female) must not resolve to Alex/David");
assert.equal(e1, "uri-samantha", "Emma (female) must resolve to female-safe pool");
assert.equal(resolvePersonaTtsVoiceURI("persona-michael", fakeVoices), "uri-alex");
assert.equal(personaVoiceProfile("persona-michael").gender, "male");
assert.equal(personaVoiceProfile("persona-janet").gender, "female");
assert.equal(isPersonaVoiceGenderMismatch("persona-janet", fakeVoices), false);
assert.equal(isPersonaVoiceGenderMismatch("persona-michael", fakeVoices), false);

// Re-record polish loop removed — failed capture can re-tap Mic freely (no review quota).
assert.equal(SPOKEN_FREE_RERECORDS_PER_TURN, 0);
assert.equal(canRerecord(0), false);
assert.equal(rerecordsRemaining(0), 0);

const studyTurns: SttStudyTurnLog[] = [
  {
    turnIndex: 1,
    intendedSaid: "I can help book tomorrow",
    sttTranscript: "I can help book tomorrow",
    sttProvider: "sarvam",
    fairForScoring: "fair",
    recordedAt: new Date().toISOString(),
  },
  {
    turnIndex: 2,
    intendedSaid: "use the mic",
    sttTranscript: "use the Mick",
    sttProvider: "sarvam",
    fairForScoring: "unfair",
    recordedAt: new Date().toISOString(),
  },
];
const rate = sttStudyFairRate(studyTurns);
assert.equal(rate.eligible, 2);
assert.equal(rate.fair, 1);
assert.equal(rate.unfair, 1);

console.log("smoke-spoken-chat-sim: OK");
