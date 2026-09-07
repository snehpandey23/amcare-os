/**
 * Smoke: life-threatening / chest pain must not route to abusive-patient SOP.
 * Run: cd apps/hipaa-training && npx tsx scripts/smoke-patient-emergency-ask.ts
 */
import assert from "node:assert/strict";
import { routeIntent } from "../src/lib/siya-os/flows";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import { patientEmergencyAnswer } from "../src/lib/siya-os/compose-answer";

const life =
  "I can not find protocol for the patient who is in lifethreatening condition where can i find what shoukd i tell to the patient";
const chest =
  "what should i tell to the patient if he is saying he is feeling chest pain anxiety";
const abusive = "abusive patient yelling on the phone — what do I do?";

assert.equal(routeIntent(life).flowId, "clinical-ops-patient-emergency");
assert.equal(routeIntent(chest).flowId, "clinical-ops-patient-emergency");
assert.equal(routeIntent(abusive).flowId, "clinical-ops-abusive-patient");

for (const surface of [false, true] as const) {
  for (const q of [life, chest]) {
    const r = runSiyaAssistant(q, [], { founderCoach: surface });
    const label = `${surface ? "founder" : "ask"}: ${q.slice(0, 40)}`;
    assert.equal(r.knowledgeGap, false, `${label} knowledgeGap`);
    assert.ok(r.ruleFinal !== false, `${label} ruleFinal`);
    assert.match(r.message || "", /911|urgent care|ER|red-flag|emergency/i, `${label} must`);
    assert.doesNotMatch(
      r.message || "",
      /verbally abusive|right staff guide for that yet/i,
      `${label} mustNot`,
    );
    console.log(`OK\t${label}\t${(r.message || "").slice(0, 90).replace(/\n/g, " ")}`);
  }
}

assert.match(patientEmergencyAnswer(), /Chest pain \+ anxiety/i);
console.log("smoke-patient-emergency-ask: OK");
