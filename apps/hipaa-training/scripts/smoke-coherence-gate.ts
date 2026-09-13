/**
 * Coherence gate + calibration scenario bank.
 *   cd apps/hipaa-training && npx tsx scripts/smoke-coherence-gate.ts
 */
import assert from "node:assert/strict";
import { CALIBRATION_SCENARIOS } from "../src/lib/patient-drill/calibration-scenarios";
import {
  assessReplyCoherence,
  evaluateSimulatorSession,
  scorePolitenessMessage,
} from "../src/lib/patient-drill/evaluate";
import { runSpokenCalibration } from "../src/lib/patient-drill/spoken-calibration";

console.log(`=== Scenario bank (${CALIBRATION_SCENARIOS.length} cases) ===\n`);

for (const s of CALIBRATION_SCENARIOS) {
  const coh = assessReplyCoherence(s.sampleReply);
  const cal = runSpokenCalibration({
    confirmedText: s.sampleReply,
    sttRaw: s.sampleReply,
    patientAsk: s.patientAsk,
  });
  const g = cal.grammar.score;
  const r = cal.relevance.score ?? -1;
  const p = cal.politeness.score;

  if (s.expect?.coherence === "fail") {
    assert.equal(coh.coherent, false, `${s.id} should fail coherence`);
  }
  if (s.expect?.coherence === "pass") {
    assert.equal(coh.coherent, true, `${s.id} falsely incoherent: ${coh.reason}`);
  }
  if (s.expect?.grammarMax != null) {
    assert.ok(g <= s.expect.grammarMax, `${s.id} grammar ${g} > max ${s.expect.grammarMax}`);
  }
  if (s.expect?.grammarMin != null) {
    assert.ok(g >= s.expect.grammarMin, `${s.id} grammar ${g} < min ${s.expect.grammarMin}`);
  }
  if (s.expect?.relevanceMax != null) {
    assert.ok(r <= s.expect.relevanceMax, `${s.id} relevance ${r} > max ${s.expect.relevanceMax}`);
  }
  if (s.expect?.relevanceMin != null) {
    assert.ok(r >= s.expect.relevanceMin, `${s.id} relevance ${r} < min ${s.expect.relevanceMin}`);
  }
  if (s.expect?.politenessMax != null) {
    assert.ok(p <= s.expect.politenessMax, `${s.id} politeness ${p} > max ${s.expect.politenessMax}`);
  }

  console.log(
    `  ${coh.coherent ? "PASS" : "FAIL"}  ${s.label.padEnd(32)} G${String(g).padStart(3)} P${String(p).padStart(3)} R${String(r).padStart(3)}  · ${s.probe.slice(0, 56)}`,
  );
}

console.log("\n=== Multi-turn session (mixed quality) ===");
{
  const messages = [
    {
      who: "Patient",
      text: "How long will this actually take? I have finals next week.",
    },
    {
      who: "you",
      text: "Typically we can get you in for testing within the same week. After that the provider decides on medication — usually about 1–2 weeks total if you move fast on the agreement.",
    },
    {
      who: "Patient",
      text: "What exactly is the neuropsych testing? Like what do I do?",
    },
    {
      who: "you",
      text: "First you sign the controlled substance agreement, then we book a testing visit where you complete focus and memory tasks with the provider — usually one visit.",
    },
    {
      who: "Patient",
      text: "Can we do tomorrow evenings?",
    },
    {
      who: "you",
      text: "I can check evening openings — would tomorrow at 7 pm work for you?",
    },
  ];
  const good = evaluateSimulatorSession(messages);
  assert.ok(good.grammarScore >= 90, `mixed good grammar ${good.grammarScore}`);
  assert.ok(good.relevanceScore >= 85, `mixed good relevance ${good.relevanceScore}`);
  console.log(
    `  good multi-turn: Grammar ${good.grammarScore} · Politeness ${good.politenessScore} · Relevance ${good.relevanceScore}`,
  );

  const spoiled = evaluateSimulatorSession([
    ...messages,
    { who: "Patient", text: "And how long for meds after that?" },
    {
      who: "you",
      text: "Long take might some hours days no final next week what mean do find where",
    },
  ]);
  assert.ok(spoiled.grammarScore < good.grammarScore, "word-salad turn must pull grammar down");
  assert.ok(spoiled.relevanceScore < good.relevanceScore, "word-salad turn must pull relevance down");
  console.log(
    `  + word-salad turn: Grammar ${spoiled.grammarScore} · Relevance ${spoiled.relevanceScore} (both lower)`,
  );
}

console.log("\n=== Blame vs clean politeness (same ask) ===");
{
  const clean = scorePolitenessMessage("This can take anywhere between 5 to 7 days.");
  const blame = scorePolitenessMessage(
    "I think if you have a finals next week you should have planned ahead of this because things like that can take time.",
  );
  assert.equal(clean.score, 100);
  assert.ok(blame.score <= 20);
  console.log(`  clean P${clean.score} · blame P${blame.score} flags=[${blame.toneFlags.join("; ")}]`);
}

console.log("\nAll coherence-gate + scenario-bank checks passed.");
