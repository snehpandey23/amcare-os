/**
 * Phase 0 Hinglish normalize + alias → English intent surface.
 *   cd apps/hipaa-training && npx tsx scripts/smoke-hinglish-phase0.ts
 */
import assert from "node:assert/strict";
import { normalizeHinglishForAsk, hinglishAliasCount } from "../src/lib/siya-os/hinglish-normalize";
import { normalizeStaffAskText, runSiyaAssistant } from "../src/lib/siya-os/engine";
import { detectAdminOpsIntent, isPersonalTasksAsk } from "../src/lib/siya-os/admin-ops-coach";
import { evaluateConfirmUtterance, looksLikeVoiceAction, type PendingVoiceAction } from "../src/lib/voice-actions";
import { tryFeatureNavigation } from "../src/lib/siya-os/feature-navigation";
import { documentedSarvamMishear } from "../src/lib/talk-cloud-stt-fallback";

assert.ok(hinglishAliasCount() >= 10 && hinglishAliasCount() <= 50, "alias table stays small");

assert.ok(isPersonalTasksAsk(normalizeStaffAskText("aaj mera kya kaam hai")));
assert.match(normalizeHinglishForAsk("aaj mera kya kaam hai"), /^what are my tasks today$/i);

// Live Talk STT scrambles (2026-09-07)
assert.ok(isPersonalTasksAsk(normalizeStaffAskText("today my what Kam is")));
assert.match(normalizeHinglishForAsk("today my what Kam is"), /what are my tasks today/i);
assert.ok(isPersonalTasksAsk(normalizeStaffAskText("my kam jaane ki koshish kar raha hun")));
assert.match(normalizeHinglishForAsk("my kam jaane ki koshish kar raha hun"), /what are my tasks today/i);

assert.equal(
  detectAdminOpsIntent(normalizeStaffAskText("kisi ne drills try kiye"))?.kind,
  "ops_practice",
);
assert.equal(
  detectAdminOpsIntent(normalizeStaffAskText("Sonu ka performance"))?.kind,
  "ops_engagement",
);
assert.ok(looksLikeVoiceAction(normalizeStaffAskText("mera shift start karo")));

// English unchanged enough to still match
assert.equal(
  detectAdminOpsIntent(normalizeStaffAskText("i want to know staff performance"))?.kind,
  "ops_engagement",
);

const pendingShift: PendingVoiceAction = {
  kind: "start_shift",
  workShift: "morning",
  readback: "I heard: start your morning shift. Say yes to confirm, or no to cancel.",
};
assert.equal(
  evaluateConfirmUtterance("ok", { action: pendingShift, confidence: 0.9, source: "voice" }).decision,
  "unclear",
  "garbled ok must not execute",
);
assert.equal(
  evaluateConfirmUtterance("sure", { action: pendingShift, confidence: 0.9, source: "voice" }).decision,
  "unclear",
);

const sopHowToPhrases = [
  "SOP कैसे बनाना है",
  "SOP kaise banana hai",
  "sop kaise banate hain",
  "SOP कैसे लिखें",
];

for (const phrase of sopHowToPhrases) {
  const normalized = normalizeStaffAskText(phrase);
  assert.match(normalized, /how to write an SOP/i, `${phrase} → ${normalized}`);
  for (const founderCoach of [false, true]) {
    const reply = runSiyaAssistant(phrase, [], { founderCoach });
    assert.equal(reply.knowledgeGap, false, `${phrase} founder=${founderCoach} gap`);
    assert.equal(reply.routing?.task, "SOP builder", `${phrase} founder=${founderCoach} task`);
    assert.ok(/SOP builder/i.test(reply.message || ""), `${phrase} soft-stop`);
    assert.ok(
      (reply.portalLinks || []).some((l) => l.href.includes("sop-builder")),
      `${phrase} missing sop-builder`,
    );
  }
}

const feedbackPhrases = [
  "feedback kaise dete hain",
  "feedback कैसे देते हैं",
  "feedback कैसे देते हैं?",
  "main feedback kaise submit karu",
  "मैं feedback कैसे submit करूं?",
  "feedback का page कहाँ है?",
  "फीडबैक कैसे देते हैं",
];

const SOFT = /not sure i have the right staff guide|no available guide/i;

for (const phrase of feedbackPhrases) {
  const normalized = normalizeStaffAskText(phrase);
  assert.match(normalized, /give feedback|submit feedback|feedback page/i, `${phrase} → ${normalized}`);
  const nav = tryFeatureNavigation(normalized, { isSignedIn: true });
  assert.equal(nav?.id, "team-feedback", `${phrase} → ${normalized} → ${nav?.id}`);
  for (const founderCoach of [false, true]) {
    const reply = runSiyaAssistant(phrase, [], { founderCoach });
    assert.equal(reply.knowledgeGap, false, `${phrase} founder=${founderCoach}`);
    assert.ok(!SOFT.test(reply.message || ""), `${phrase} soft-stop`);
    assert.ok(
      (reply.portalLinks || []).some((l) => l.href === "/feedback"),
      `${phrase} missing /feedback`,
    );
  }
}

const rescheduleFee =
  "Ek patient Ne appointment Lagaya Tha per abhi vah text kar raha is ki main turant Nahin show sakta what Uski do ghante bad appointment schedule kar sakte are aur Iske Jule mein what koi aur charges lagenge";

assert.match(
  normalizeStaffAskText(rescheduleFee),
  /reschedule/i,
  "hinglish reschedule-fee alias",
);

for (const founderCoach of [false, true]) {
  const reply = runSiyaAssistant(rescheduleFee, [], { founderCoach });
  const first = (reply.message || "").trim().split("\n").find((l) => l.trim()) || "";
  assert.match(
    first,
    /Yes, they can reschedule/i,
    `reschedule-fee first line founder=${founderCoach}: ${first}`,
  );
  assert.match(first, /charged again/i, `charged again founder=${founderCoach}`);
  assert.match(first, /24\+ hours/i, `24h founder=${founderCoach}`);
  assert.match(reply.message || "", /billing-and-cancellation-policy/, `SOP link founder=${founderCoach}`);
  assert.equal(
    (reply.sources || []).some((s) => s.id === "escalation-pathways"),
    false,
    `no escalation cite founder=${founderCoach}`,
  );
  assert.ok(!/A few quick questions|To help you faster|Routine or urgent/i.test(reply.message || ""), "no tacked follow-ups");
  assert.ok(reply.ruleFinal, "lead stays; LLM must not overwrite");
  assert.ok((reply.message || "").includes("[[detail]]"), "steps collapsed");
}

assert.equal(documentedSarvamMishear("please use the Mick"), "mic");
assert.equal(documentedSarvamMishear("open logos"), "os");
assert.equal(documentedSarvamMishear("feedback कैसे देते हैं"), null);

console.log("smoke-hinglish-phase0: OK", {
  tasks: normalizeHinglishForAsk("aaj mera kya kaam hai"),
  sttScramble: normalizeStaffAskText("today my what Kam is"),
  tryingKnow: normalizeStaffAskText("my kam jaane ki koshish kar raha hun"),
  shift: normalizeStaffAskText("mera shift start karo"),
  sonu: normalizeStaffAskText("Sonu ka performance"),
});
