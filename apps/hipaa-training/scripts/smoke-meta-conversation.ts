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
  ];
  for (const text of engineSamples) {
    const r = runSiyaAssistant(text);
    assert.ok(r.ruleFinal, `expected ruleFinal: ${text}`);
    assert.equal(r.knowledgeGap, false, `expected no knowledgeGap: ${text}`);
    assert.ok(
      !/I don't have an approved staff guide/i.test(r.message),
      `soft-stop leak: ${text}\n${r.message.slice(0, 200)}`,
    );
  }

  const existig = runSiyaAssistant("delete existig chat");
  assert.ok(/Archive|Clear chat/i.test(existig.message));
  assert.ok(!/right staff guide for that yet/i.test(existig.message));

  const split = runSiyaAssistant("delete", [{ role: "user", content: "how to" }]);
  assert.ok(/Archive|Clear chat/i.test(split.message), split.message.slice(0, 200));

  const qa = runSiyaAssistant("who does quality review n how is it done");
  assert.ok(/Chat Review|product quality flag/i.test(qa.message));
  assert.ok(!/Quality Review Access/i.test(qa.message));

  console.log("smoke-meta-conversation: OK");
}

main();
