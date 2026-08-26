/**
 * Smoke: hostile/abusive patient prefers live reviewed SOP over hardcoded fallback.
 * Run: npx tsx scripts/smoke-abusive-patient-sop.ts
 */
import assert from "assert";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";
import { retrieveLayeredKnowledge, retrieveDynamicSops } from "../src/lib/siya-os/retrieval";
import { pickLiveAbusivePatientSop, abusivePatientAnswer } from "../src/lib/siya-os/compose-answer";
import { routeIntent } from "../src/lib/siya-os/flows";

const SOP_ID = "sop-1786241888864-djh6i5";
const SOP_BODY = `
# Purpose
Give Medical Assistants a clear, consistent procedure for responding when a patient interaction turns verbally abusive.

# Steps
1. Stay calm and set a boundary — you may end the call if abuse continues.
2. Do not argue, diagnose, or promise refunds or exceptions.
3. Document in the clinical system (no PHI in Ask).
4. Escalate same day to the clinical supervisor; loop leadership on safety threats.
5. Billing anger goes to supervisor + Billing lead.

# Escalation
Clinical Program Manager; Leadership for safety threats.
`.trim();

const LIVE_SOP = {
  id: SOP_ID,
  title: "SOP: Handling Verbally Abusive Patient Interactions",
  body: SOP_BODY,
  keywords: ["abusive", "hostile", "verbal abuse", "patient", "de-escalation"],
  department: "Accounts",
  status: "live" as const,
};

function main() {
  const q = "abusive patient yelling on the phone — what do I do?";
  assert.equal(routeIntent(q).flowId, "clinical-ops-abusive-patient");

  const dyn = retrieveDynamicSops(q, [LIVE_SOP], 4);
  assert.ok(dyn.length, "dynamic SOP retrieval should hit");
  assert.equal(dyn[0].id, `sop-db-${SOP_ID}`);

  const layered = retrieveLayeredKnowledge(q, { sops: [LIVE_SOP], limit: 6 });
  const picked = pickLiveAbusivePatientSop(layered);
  assert.ok(picked, "pickLiveAbusivePatientSop should select live row");
  assert.equal(picked!.id, `sop-db-${SOP_ID}`);

  const withSop = runSiyaAssistant(q, [], { layeredChunks: layered });
  assert.equal(withSop.knowledgeGap, false, "live SOP must not set knowledgeGap");
  assert.ok(
    withSop.sources?.some((s) => /verbally abusive|abusive patient/i.test(s.title)),
    `expected SOP citation in sources, got ${JSON.stringify(withSop.sources)}`,
  );
  assert.ok(
    /Give Medical Assistants a clear|verbally abusive|Clinical Program Manager|boundary/i.test(
      withSop.message,
    ),
    `message should reflect live SOP body, got:\n${withSop.message.slice(0, 400)}`,
  );
  assert.ok(
    !withSop.message.includes("Notify owner if you want this tracked until a published SOP"),
    "must not use hardcoded fallback footer when live SOP exists",
  );

  const founder = runSiyaAssistant(q, [], { layeredChunks: layered, founderCoach: true });
  assert.equal(founder.knowledgeGap, false, "Founder Talk must also cite live SOP");
  assert.ok(founder.sources?.some((s) => /verbally abusive/i.test(s.title)));

  const noSop = runSiyaAssistant(q, []);
  assert.equal(noSop.knowledgeGap, true, "without live SOP, fallback sets knowledgeGap");
  assert.ok(noSop.message.includes(abusivePatientAnswer().slice(0, 40)) || /hostile, abusive/i.test(noSop.message));

  console.log("smoke-abusive-patient-sop: OK", {
    topScore: picked!.score,
    sources: withSop.sources,
    founderSources: founder.sources,
  });
}

main();
