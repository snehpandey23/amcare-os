/**
 * Scenario bank coverage — distinct ask-types + rubric probes.
 *   cd apps/hipaa-training && npx tsx scripts/smoke-calibration-scenarios.ts
 */
import assert from "node:assert/strict";
import {
  CALIBRATION_SCENARIOS,
  REQUIRED_SCENARIO_IDS,
  getCalibrationScenario,
} from "../src/lib/patient-drill/calibration-scenarios";
import { classifyPatientAsk } from "../src/lib/patient-drill/evaluate";
import { runSpokenCalibration } from "../src/lib/patient-drill/spoken-calibration";

console.log(`=== Scenario bank (${CALIBRATION_SCENARIOS.length} entries) ===\n`);

// Required checklist present
for (const id of REQUIRED_SCENARIO_IDS) {
  const s = getCalibrationScenario(id);
  assert.ok(s, `missing required scenario ${id}`);
  assert.ok(s.patientAsk.trim().length > 10, `${id} ask too short`);
  assert.ok(s.sampleReply.trim().length > 0, `${id} missing sample reply`);
  assert.ok(s.probe.trim().length > 10, `${id} missing probe`);
}

// All ids unique; all asks for required set are pairwise distinct
const ids = CALIBRATION_SCENARIOS.map((s) => s.id);
assert.equal(new Set(ids).size, ids.length, "duplicate scenario ids");

const requiredAsks = REQUIRED_SCENARIO_IDS.map((id) => getCalibrationScenario(id)!.patientAsk);
assert.equal(
  new Set(requiredAsks).size,
  requiredAsks.length,
  "required scenarios must not share the same patient ask",
);

// Selecting a scenario “auto-fills” ask the same way the UI loadScenario does
for (const s of CALIBRATION_SCENARIOS) {
  const loadedAsk = getCalibrationScenario(s.id)!.patientAsk;
  assert.equal(loadedAsk, s.patientAsk, `${s.id} load mismatch`);
}

// Distinct ask-type / probe purposes (not timeline clones)
const timeline = getCalibrationScenario("timeline-clean")!;
const process = getCalibrationScenario("process-exact-steps")!;
const emotional = getCalibrationScenario("emotional-pressure")!;
const yesno = getCalibrationScenario("yesno-today")!;
const multi = getCalibrationScenario("multipart-timeline-insurance")!;
const bribe = getCalibrationScenario("bribery-bait")!;
const offtopicPatient = getCalibrationScenario("offtopic-patient-bait")!;

assert.equal(classifyPatientAsk(timeline.patientAsk), "timeline");
assert.equal(classifyPatientAsk(process.patientAsk), "process");
assert.equal(classifyPatientAsk(emotional.patientAsk), "emotional");
assert.match(yesno.patientAsk, /can i get this today/i);
assert.match(multi.patientAsk, /how long.*insurance/i);
assert.match(bribe.patientAsk, /venmo|\$100/i);
assert.match(offtopicPatient.patientAsk, /eiffel|restaurant|paris/i);
assert.doesNotMatch(process.patientAsk, /how long will this actually take/i);
assert.doesNotMatch(yesno.patientAsk, /how long/i);
assert.doesNotMatch(offtopicPatient.patientAsk, /how long|finals|renewal|medication/i);

console.log("Required checklist:");
for (const id of REQUIRED_SCENARIO_IDS) {
  const s = getCalibrationScenario(id)!;
  const askType = classifyPatientAsk(s.patientAsk);
  console.log(`  · ${s.label}`);
  console.log(`      ask-type≈${askType} · “${s.patientAsk.slice(0, 72)}${s.patientAsk.length > 72 ? "…" : ""}”`);
  console.log(`      probes: ${s.probe}`);
}

// Bribery sample must red-flag; clean refuse must not
{
  const bad = runSpokenCalibration({
    confirmedText: bribe.sampleReply,
    sttRaw: bribe.sampleReply,
    patientAsk: bribe.patientAsk,
  });
  assert.equal(bad.safety.redFlagged, true, "bribery sample must red-flag");
  assert.ok(bad.safety.misconductReasons.includes("bribe_or_money"));

  const refuse = getCalibrationScenario("bribery-refuse")!;
  const good = runSpokenCalibration({
    confirmedText: refuse.sampleReply,
    sttRaw: refuse.sampleReply,
    patientAsk: refuse.patientAsk,
  });
  assert.equal(good.safety.redFlagged, false, "clean refuse must not red-flag");
  console.log("\nok: bribery bait red-flags; refuse stays clean");
}

// Emotional blame sample drops politeness
{
  const blame = getCalibrationScenario("emotional-pressure-blame")!;
  const cal = runSpokenCalibration({
    confirmedText: blame.sampleReply,
    sttRaw: blame.sampleReply,
    patientAsk: blame.patientAsk,
  });
  assert.ok(cal.politeness.score <= 20, `blame politeness ${cal.politeness.score}`);
  console.log(`ok: pressure+blame politeness=${cal.politeness.score}`);
}

// Off-topic MA digression still de-emphasizes style scores
{
  const eiffel = getCalibrationScenario("offtopic-eiffel-reply")!;
  const cal = runSpokenCalibration({
    confirmedText: eiffel.sampleReply,
    sttRaw: eiffel.sampleReply,
    patientAsk: eiffel.patientAsk,
  });
  assert.equal(cal.styleScoresDeemphasized, true);
  console.log(`ok: off-topic MA reply deemphasis R=${cal.relevance.score}`);
}

console.log(`\nAll ${CALIBRATION_SCENARIOS.length} scenarios selectable; required set distinct.`);
console.log("All calibration-scenario checks passed.");
