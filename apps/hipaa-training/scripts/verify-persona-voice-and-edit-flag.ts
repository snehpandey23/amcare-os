/**
 * Honest verification: persona voice gender + transcript heavy-edit flagging.
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-persona-voice-and-edit-flag.ts
 */
import assert from "node:assert/strict";
import {
  PERSONA_TTS_PROFILES,
  classifyVoiceGender,
  isPersonaVoiceGenderMismatch,
  resolvePersonaTtsVoice,
  resolvePersonaTtsVoiceURI,
} from "../src/lib/patient-drill/persona-tts-voice.ts";
import { measureSttTranscriptEdit } from "../src/lib/patient-drill/spoken-transcript-edit.ts";
import { buildChatSimTranscript } from "../src/lib/level-up/progress.ts";
import type { TtsVoiceOption } from "../src/lib/text-to-speech.ts";

/** Typical macOS / Chrome mix — includes the male voices that previously leaked onto Janet. */
const BROWSER_VOICES: TtsVoiceOption[] = [
  { voiceURI: "com.apple.voice.Alex", name: "Alex", lang: "en-US", label: "English — Alex", localService: true, default: true },
  { voiceURI: "com.apple.voice.Samantha", name: "Samantha", lang: "en-US", label: "English — Samantha", localService: true, default: false },
  { voiceURI: "com.apple.voice.Daniel", name: "Daniel", lang: "en-GB", label: "English — Daniel", localService: true, default: false },
  { voiceURI: "com.apple.voice.Karen", name: "Karen", lang: "en-AU", label: "English — Karen", localService: true, default: false },
  { voiceURI: "com.apple.voice.Moira", name: "Moira", lang: "en-IE", label: "English — Moira", localService: true, default: false },
  { voiceURI: "com.apple.voice.Victoria", name: "Victoria", lang: "en-US", label: "English — Victoria", localService: true, default: false },
  { voiceURI: "com.apple.voice.Kathy", name: "Kathy", lang: "en-US", label: "English — Kathy", localService: true, default: false },
  { voiceURI: "com.apple.voice.Fred", name: "Fred", lang: "en-US", label: "English — Fred", localService: true, default: false },
  { voiceURI: "Microsoft Zira", name: "Microsoft Zira - English (United States)", lang: "en-US", label: "Zira", localService: false, default: false },
  { voiceURI: "Microsoft David", name: "Microsoft David - English (United States)", lang: "en-US", label: "David", localService: false, default: false },
  { voiceURI: "Google UK English Female", name: "Google UK English Female", lang: "en-GB", label: "Female", localService: false, default: false },
  { voiceURI: "Google UK English Male", name: "Google UK English Male", lang: "en-GB", label: "Male", localService: false, default: false },
  { voiceURI: "hi-IN-Neel", name: "Neel", lang: "hi-IN", label: "Hindi — Neel", localService: false, default: false },
  { voiceURI: "hi-IN-Veena", name: "Veena", lang: "hi-IN", label: "Hindi — Veena", localService: false, default: false },
  // Spanish-locale traps — must never win for English-speaking personas (Carlos).
  { voiceURI: "com.apple.voice.Jorge", name: "Jorge", lang: "es-MX", label: "Spanish (Mexico) — Jorge", localService: true, default: false },
  { voiceURI: "com.apple.voice.Juan", name: "Juan", lang: "es-MX", label: "Spanish (Mexico) — Juan", localService: true, default: false },
  { voiceURI: "com.apple.voice.Paulina", name: "Paulina", lang: "es-MX", label: "Spanish (Mexico) — Paulina", localService: true, default: false },
];

assert.equal(classifyVoiceGender(BROWSER_VOICES[0]!), "male"); // Alex
assert.equal(classifyVoiceGender(BROWSER_VOICES[1]!), "female"); // Samantha

const janet1 = resolvePersonaTtsVoice("persona-janet", BROWSER_VOICES);
const janet2 = resolvePersonaTtsVoice("persona-janet", BROWSER_VOICES);
console.log("Janet resolved:", janet1);
assert.equal(janet1.voiceURI, janet2.voiceURI, "Janet must be stable turn-to-turn");
assert.equal(janet1.profileGender, "female");
assert.notEqual(janet1.classifiedGender, "male", `Janet must not be male-tagged (got ${janet1.voiceName})`);
assert.ok(
  janet1.classifiedGender === "female" || janet1.classifiedGender === "neutral",
  `Janet voice gender=${janet1.classifiedGender} name=${janet1.voiceName}`,
);
assert.equal(isPersonaVoiceGenderMismatch("persona-janet", BROWSER_VOICES), false);

// Prefer Kathy/Victoria for Janet when present
assert.ok(
  /kathy|victoria|karen|samantha|zira|female/i.test(janet1.voiceName || ""),
  `Janet should prefer a female-named voice, got ${janet1.voiceName}`,
);

const audit: Record<string, string> = {};
for (const id of Object.keys(PERSONA_TTS_PROFILES)) {
  const r = resolvePersonaTtsVoice(id, BROWSER_VOICES);
  const profile = PERSONA_TTS_PROFILES[id]!;
  audit[profile.displayName] = `${r.voiceName} (${r.classifiedGender})`;
  if (profile.gender === "female" || profile.gender === "male") {
    assert.equal(
      isPersonaVoiceGenderMismatch(id, BROWSER_VOICES),
      false,
      `${profile.displayName} gender mismatch → ${r.voiceName}`,
    );
    if (r.classifiedGender && r.classifiedGender !== "neutral") {
      assert.equal(r.classifiedGender, profile.gender, `${profile.displayName}: ${r.voiceName}`);
    }
  }
  // Stability
  assert.equal(resolvePersonaTtsVoiceURI(id, BROWSER_VOICES), r.voiceURI);
}
console.log("Persona voice audit:", audit);

// Priya must never get Neel
const priya = resolvePersonaTtsVoice("persona-priya", BROWSER_VOICES);
assert.ok(!/neel/i.test(priya.voiceName || ""), `Priya must never get Neel, got ${priya.voiceName}`);
assert.ok(
  priya.voiceLang && /^en/i.test(priya.voiceLang),
  `Priya must use English locale, got ${priya.voiceLang}`,
);

// Carlos: never Spanish-locale (es_MX) even when Jorge/Juan are present
const carlos = resolvePersonaTtsVoice("persona-carlos", BROWSER_VOICES);
console.log("Carlos resolved:", carlos);
assert.ok(carlos.voiceURI, "Carlos must resolve a voice");
assert.ok(
  carlos.voiceLang && /^en/i.test(carlos.voiceLang),
  `Carlos must use English locale (not Spanish), got lang=${carlos.voiceLang} name=${carlos.voiceName}`,
);
assert.ok(
  !/jorge|juan|diego|paulina/i.test(carlos.voiceName || ""),
  `Carlos must not pick Spanish-named voice, got ${carlos.voiceName}`,
);
assert.match(carlos.accentNote || "", /Mexican-accented English unavailable/i);
assert.equal(carlos.classifiedGender, "male");

// --- Edit distance ---
const minor = measureSttTranscriptEdit("use the Mick please", "use the mic please");
assert.equal(minor.heavilyEdited, false, JSON.stringify(minor));

const rewrite = measureSttTranscriptEdit(
  "ok sure how can I help",
  "The pharmacy on file is CVS and I will document a callback for the clinician today",
);
assert.equal(rewrite.heavilyEdited, true, JSON.stringify(rewrite));
assert.match(rewrite.integrityNote || "", /Heavily edited/i);

const trail = buildChatSimTranscript([
  { who: "Janet", text: "I need a refill" },
  {
    who: "you",
    text: rewrite.submitted,
    inputModality: "spoken",
    sttRaw: rewrite.sttRaw,
    sttWordEditDistance: rewrite.wordEditDistance,
    sttWordChangePct: rewrite.wordChangePct,
    sttHeavilyEdited: rewrite.heavilyEdited,
    sttIntegrityNote: rewrite.integrityNote || undefined,
  },
]);
assert.equal(trail[1]?.sttHeavilyEdited, true);
assert.match(trail[1]?.sttIntegrityNote || "", /Heavily edited/);

console.log(
  JSON.stringify(
    {
      janet: janet1,
      audit,
      minorFlagged: minor.heavilyEdited,
      rewriteFlagged: rewrite.heavilyEdited,
      trailHasIntegrityNote: Boolean(trail[1]?.sttIntegrityNote),
    },
    null,
    2,
  ),
);
console.log("ok: verify-persona-voice-and-edit-flag");
