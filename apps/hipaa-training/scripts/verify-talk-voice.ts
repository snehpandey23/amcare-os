/**
 * Talk voice helpers unit verify (Node has no speechSynthesis — browser verify for live voices).
 *
 *   cd apps/hipaa-training && npx tsx scripts/verify-talk-voice.ts
 */
import assert from "assert";
import { formatTtsVoiceLabel, resolveTtsVoice, speakText } from "../src/lib/text-to-speech";

{
  const label = formatTtsVoiceLabel({ name: "Google UK English Female", lang: "en-GB" });
  assert.match(label, /English/i);
  assert.match(label, /Google UK English Female/);
  console.log("OK label", label);
}

{
  const label = formatTtsVoiceLabel({ name: "Microsoft Heera - English (India)", lang: "en-IN" });
  assert.match(label, /English/i);
  console.log("OK India label", label);
}

// Node: no voices — resolve returns null; speakText no-ops safely.
assert.equal(resolveTtsVoice("fake-uri"), null);
void speakText("noop", { voiceURI: "fake" }).then(() => {
  console.log("OK resolve/speak safe without browser TTS");
  console.log("\nverify-talk-voice: PASS (unit). Live: change Talk voice → Preview / next answer uses voiceURI.");
});
