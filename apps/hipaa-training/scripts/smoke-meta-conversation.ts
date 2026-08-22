/**
 * Proactive meta catalog smoke — catalog match + engine ruleFinal (no soft-stop).
 * Run: npx tsx scripts/smoke-meta-conversation.ts
 */
import assert from "assert";
import {
  META_SMOKE_SAMPLES,
  answerMetaConversation,
  metaCaseCount,
} from "../src/lib/siya-os/meta-conversation";
import { runSiyaAssistant } from "../src/lib/siya-os/engine";

function main() {
  console.log(`meta cases: ${metaCaseCount()}, samples: ${META_SMOKE_SAMPLES.length}`);

  let catalogFails = 0;
  for (const s of META_SMOKE_SAMPLES) {
    const ans = answerMetaConversation(s.text);
    if (!ans) {
      console.error(`CATALOG MISS [${s.id}]: ${s.text}`);
      catalogFails++;
      continue;
    }
    if (!s.mustMatch.test(ans)) {
      console.error(`CATALOG mustMatch fail [${s.id}]: ${s.text}\n---\n${ans.slice(0, 240)}`);
      catalogFails++;
    }
    if (s.mustNot.test(ans)) {
      console.error(`CATALOG mustNot fail [${s.id}]: ${s.text}\n---\n${ans.slice(0, 240)}`);
      catalogFails++;
    }
  }
  assert.equal(catalogFails, 0, `${catalogFails} catalog sample(s) failed`);

  // Engine: practice deep-link beats generic “train you”; other metas stay ruleFinal / no soft-stop.
  const cultureTrain = runSiyaAssistant(
    "i want to train you regarding american culture so that my staff can learn from it",
  );
  assert.ok(cultureTrain.ruleFinal);
  assert.equal(cultureTrain.knowledgeGap, false);
  assert.ok(
    /practice|culture/i.test(cultureTrain.message) ||
      (cultureTrain.portalLinks ?? []).some((l) => /culture/i.test(l.href)),
    "culture train should deep-link Practice",
  );
  assert.ok(!/approved staff guide for that/i.test(cultureTrain.message));

  const engineSamples = [
    "why not arent u AI",
    "who is your boss",
    "what can you do",
    "do you remember previous chats",
    "are you chatgpt",
    "what does the thumbs up button do",
    "can you write my plan record",
    "who r u",
    "whats ur name",
    "whtas ur name",
    "i am feeling lonely",
    "can you be my friend",
    "why did you do my onboarding",
  ];
  for (const text of engineSamples) {
    const r = runSiyaAssistant(text);
    assert.ok(r.ruleFinal, `expected ruleFinal: ${text}`);
    assert.equal(r.knowledgeGap, false, `expected no knowledgeGap: ${text}`);
    assert.ok(
      !/I don't have an approved staff guide/i.test(r.message),
      `soft-stop leak: ${text}\n${r.message.slice(0, 200)}`,
    );
    if (text === "why did you do my onboarding") {
      assert.ok(/personalization wizard|Personalize/i.test(r.message), r.message.slice(0, 200));
      assert.ok(!/Klarity.*Spruce.*Week 1|Concierge Specialist/i.test(r.message), "MA KB leak");
    }
  }

  const crisis = runSiyaAssistant("what if i kill myself");
  assert.equal(crisis.refused, true);
  assert.equal(crisis.refusalCategory, "emergency");
  assert.ok(/911|emergency/i.test(crisis.message));
  assert.ok(!/personalization wizard/i.test(crisis.message));

  const existig = runSiyaAssistant("delete existig chat");
  assert.ok(/Archive|Clear chat/i.test(existig.message));
  assert.ok(!/right staff guide for that yet/i.test(existig.message));

  const split = runSiyaAssistant("delete", [{ role: "user", content: "how to" }]);
  assert.ok(/Archive|Clear chat/i.test(split.message), split.message.slice(0, 200));

  const qa = runSiyaAssistant("who does quality review n how is it done");
  assert.ok(/Nobody gets an email|Chat Review/i.test(qa.message));
  assert.ok(!/Quality Review Access/i.test(qa.message));

  const writeSop = runSiyaAssistant("want to write a sop");
  assert.ok(writeSop.ruleFinal);
  assert.equal(writeSop.knowledgeGap, false);
  assert.ok(/SOP builder/i.test(writeSop.message));
  assert.ok(writeSop.portalLinks?.some((l) => l.href.includes("sop-builder")));
  assert.ok(!/right staff guide for that yet/i.test(writeSop.message));

  const howWrite = runSiyaAssistant("new sop how to write");
  assert.ok(/SOP builder/i.test(howWrite.message));
  assert.ok(!/right staff guide for that yet/i.test(howWrite.message));

  const listSops = runSiyaAssistant("what sops r already there");
  assert.ok(/Department SOPs/i.test(listSops.message));
  assert.ok(listSops.portalLinks?.some((l) => l.href.includes("/memory/knowledge/sops")));
  assert.ok(!/right staff guide for that yet/i.test(listSops.message));

  const policySop = runSiyaAssistant("what is the refill SOP");
  assert.ok(!policySop.portalLinks?.some((l) => l.href.includes("sop-builder")));

  const creyos = runSiyaAssistant("where is creyos link");
  assert.ok(creyos.ruleFinal);
  assert.equal(creyos.knowledgeGap, false);
  assert.ok(/health\.creyos\.com/i.test(creyos.message));
  assert.ok(creyos.portalLinks?.some((l) => /creyos/i.test(l.href)));
  assert.ok(!/right staff guide for that yet/i.test(creyos.message));

  const creyosEval = runSiyaAssistant("is creyos included in the evaluation");
  assert.ok(!creyosEval.portalLinks?.some((l) => /creyos/i.test(l.href)));

  console.log("smoke-meta-conversation: OK");
}

main();
