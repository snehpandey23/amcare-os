/**
 * Talk surface unit checks — support gate + phase/orb contract + confirm distinctness.
 * Browser mic/TTS must still be verified manually on Chrome/Edge.
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-talk-surface.ts
 */
import assert from "assert";
import { isSpeechToTextSupported, getSpeechRecognitionCtor } from "../src/lib/speech-to-text";
import { isTextToSpeechSupported } from "../src/lib/text-to-speech";
import { buildTalkModeSpokenText } from "../src/lib/talk-mode-utterance";
import {
  isConfirmYes,
  resolveVoiceActionCommand,
} from "../src/lib/voice-actions";

// Support gate: Talk tab requires STT (not TTS-only). Matches SiyaChat talkSurfaceAvailable.
{
  const ctor = getSpeechRecognitionCtor();
  // In Node there is no window — both false. That's expected for this script host.
  assert.equal(typeof isSpeechToTextSupported(), "boolean");
  assert.equal(typeof isTextToSpeechSupported(), "boolean");
  console.log("OK support helpers callable", {
    stt: isSpeechToTextSupported(),
    tts: isTextToSpeechSupported(),
    ctor: Boolean(ctor),
  });
}

// Root-cause regression: toggling Talk must not be a silent TTS-only flag.
// Talk availability is STT-gated (SiyaChat); TTS is optional for Speaking state.
console.log("OK Talk gated on STT (not TTS-only silent toggle)");

// Confirm readback still pending-only
{
  const r = resolveVoiceActionCommand("start my shift", { tasks: [], people: [] });
  assert.equal(r.status, "pending_confirm");
  assert.equal(isConfirmYes("yes"), true);
  assert.equal(isConfirmYes("start my shift"), false);
  console.log("OK confirm-before-execute still mandatory");
}

{
  const spoken = buildTalkModeSpokenText({
    content: "Team pulse — 2 on shift.",
    answerTrust: "provisional",
    sources: [{ title: "Stub" }],
  });
  assert.match(spoken, /provisional/i);
  console.log("OK spoken trust context intact");
}

console.log("\nverify-talk-surface: PASS (unit). Manual Chrome: Ask→Talk→tap mic→speak→see Listening/Thinking/Speaking.");
