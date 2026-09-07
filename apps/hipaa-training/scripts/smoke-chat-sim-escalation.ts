/**
 * Response-driven T2 escalation — smokes for Carlos / Michael / Aisha.
 *
 *   npx tsx apps/hipaa-training/scripts/smoke-chat-sim-escalation.ts
 *
 * Cases:
 * 1. Two consecutive weak replies → T2-A + example-line pool
 * 2. Strong reply → no escalate / de-escalate one step
 * 3. T2 lines never match ABUSE_PATTERNS
 * 4. Red-flag hard-stops regardless of tier
 * 5. Full ladder end-to-end for Carlos, Michael, Aisha (fits reply cap; no clock)
 * 6. Aisha gated from staff picker; Carlos/Michael selectable
 */
import assert from "node:assert/strict";
import {
  getPersona,
  isPersonaStaffSelectable,
  listAllPersonasForTests,
  listStaffSelectablePersonas,
} from "../src/data/patient-drill/personas";
import { MAX_MA_TURNS, WEAK_LADDER_MA_TURNS_TO_EXIT } from "../src/lib/patient-drill/session-bounds";
import {
  advanceToneAfterMaReply,
  assertT2LinesSafe,
  classifyReplyStrength,
  deriveToneStateFromHistory,
  initialToneState,
} from "../src/lib/patient-drill/escalation";
import { scoreRelevanceTurn } from "../src/lib/patient-drill/evaluate";
import { evaluateTurnSafety, matchesAbusePatterns } from "../src/lib/patient-drill/safety";

const WEAK = "ok sure";
const WEAK2 = "got it";

function t2Pool(personaId: string, step: "T2-A" | "T2-B" | "T2-C"): string[] {
  const p = getPersona(personaId)!;
  const found = p.escalationLadder?.steps.find((s) => s.id === step);
  assert.ok(found?.exampleLines?.length, `${personaId} missing ${step} lines`);
  return found!.exampleLines;
}

function strongFor(personaId: string): string {
  if (personaId === "carlos" || personaId === "persona-carlos") {
    return "Cash discovery is typically a clear flat fee band before meds — medication visits are separate. First step is book that cash discovery slot; soonest is usually this week, and one coordinator handles follow-up.";
  }
  if (personaId === "michael" || personaId === "persona-michael") {
    return "Three steps: fill the intake form tonight (about 10 minutes), book a Thursday evening call after 8:30, then the provider confirms next steps — no childhood deep-dive in this chat.";
  }
  // Aisha — honest limits + escalate path (no invented refill promise)
  return "I can't promise a refill in chat — that is the doctor's call. I can flag clinical same-day for a near runout, send you the portal message path, and look for evening / async options that fit a retail shift.";
}

console.log("=== Chat sim response-driven escalation smoke ===\n");

// --- Gate + schema ---
const carlos = getPersona("carlos")!;
const michael = getPersona("michael")!;
const aisha = getPersona("aisha")!;
assert.equal(carlos.tierPolicy, "allows_t2");
assert.equal(michael.tierPolicy, "allows_t2");
assert.equal(aisha.tierPolicy, "allows_t2");
assert.ok(carlos.stakes && carlos.stakes.length >= 3);
assert.ok(michael.stakes && michael.stakes.length >= 3);
assert.ok(aisha.stakes && aisha.stakes.length >= 3);
assert.ok(!/south asian/i.test(aisha.demographicSnapshot + aisha.backstory), "Aisha must not include removed demographic detail");
assert.equal(aisha.clinicalGate?.status, "pending_clinical_review");
assert.equal(aisha.clinicalGate?.staffSelectable, false);
assert.equal(isPersonaStaffSelectable(aisha), false);
assert.equal(isPersonaStaffSelectable(carlos), true);
assert.equal(isPersonaStaffSelectable(michael), true);
assert.ok(!listStaffSelectablePersonas().some((p) => p.id === "persona-aisha"), "Aisha hidden from staff picker");
assert.ok(listAllPersonasForTests().some((p) => p.id === "persona-aisha"), "Aisha present for tests");
console.log("PASS schema + Aisha clinical gate (staff-hidden)\n");

// --- Case 3: T2 lines never match ABUSE_PATTERNS ---
for (const p of [carlos, michael, aisha]) {
  const bad = assertT2LinesSafe(p);
  assert.deepEqual(bad, [], bad.join("\n") || "ok");
  for (const step of p.escalationLadder!.steps) {
    if (!String(step.id).startsWith("T2")) continue;
    for (const line of step.exampleLines) {
      assert.equal(matchesAbusePatterns(line), false, line);
    }
  }
}
console.log("PASS T2 lines never match ABUSE_PATTERNS\n");

// --- Case 1: two consecutive weaks → T2-A with example-line pool ---
{
  const open = carlos.openingMessage;
  assert.ok(classifyReplyStrength(scoreRelevanceTurn(open, WEAK)) === "weak");

  let state = initialToneState(carlos);
  const t1 = advanceToneAfterMaReply({
    persona: carlos,
    priorState: state,
    patientAsk: open,
    maReply: WEAK,
  });
  assert.equal(t1.state.step, "T1", `after 1 weak expected T1, got ${t1.state.step} (${t1.reason})`);
  assert.equal(t1.state.weakStreak, 1);
  assert.equal(t1.endFrustrated, false);

  const t2 = advanceToneAfterMaReply({
    persona: carlos,
    priorState: t1.state,
    patientAsk: open,
    maReply: WEAK2,
  });
  assert.equal(t2.state.step, "T2-A", `after 2 weaks expected T2-A, got ${t2.state.step} (${t2.reason})`);
  assert.ok(t2.patientLine, "T2-A must supply a patient line");
  assert.ok(
    t2Pool("carlos", "T2-A").includes(t2.patientLine!),
    `T2-A line must be from Carlos pool, got: ${t2.patientLine}`,
  );
  console.log("PASS case1 Carlos weak×2 → T2-A pool line");
  console.log(`  line: ${t2.patientLine}`);
  console.log(`  reason: ${t2.reason}\n`);
  state = t2.state;
}

// --- Case 2: strong reply → no escalate / de-escalate one ---
{
  const open = michael.openingMessage;
  // Climb to T2-A first
  let r = advanceToneAfterMaReply({
    persona: michael,
    priorState: initialToneState(michael),
    patientAsk: open,
    maReply: WEAK,
  });
  r = advanceToneAfterMaReply({
    persona: michael,
    priorState: r.state,
    patientAsk: open,
    maReply: WEAK2,
  });
  assert.equal(r.state.step, "T2-A");

  const strong = strongFor("michael");
  assert.equal(classifyReplyStrength(scoreRelevanceTurn(open, strong)), "strong", strong);

  const held = advanceToneAfterMaReply({
    persona: michael,
    priorState: initialToneState(michael),
    patientAsk: open,
    maReply: strong,
  });
  assert.equal(held.state.step, "T1", "strong at baseline must not escalate");
  assert.equal(held.state.weakStreak, 0);

  const cooled = advanceToneAfterMaReply({
    persona: michael,
    priorState: r.state,
    patientAsk: open,
    maReply: strong,
  });
  assert.equal(cooled.state.step, "T1", `strong from T2-A should de-escalate to T1, got ${cooled.state.step}`);
  assert.ok(
    cooled.patientLine == null ||
      michael.escalationLadder!.steps
        .find((s) => s.id === "de-escalate")!
        .exampleLines.includes(cooled.patientLine) ||
      michael.escalationLadder!.steps.find((s) => s.id === "T1")!.exampleLines.includes(cooled.patientLine),
    "de-escalate line from pool when present",
  );
  console.log("PASS case2 strong → no escalate / de-escalate one step");
  console.log(`  hold reason: ${held.reason}`);
  console.log(`  cool reason: ${cooled.reason}\n`);
}

// --- Case 4: red-flag overrides tone ladder ---
{
  // Put Carlos conceptually at T2-A, then MA invents a clinical decision → safety stop.
  const history = [
    { role: "assistant" as const, content: carlos.openingMessage },
    { role: "user" as const, content: WEAK },
    { role: "assistant" as const, content: t2Pool("carlos", "T2-A")[0]! },
    { role: "user" as const, content: WEAK2 },
    { role: "assistant" as const, content: t2Pool("carlos", "T2-A")[0]! },
  ];
  const toneAtT2 = deriveToneStateFromHistory(carlos, history);
  assert.ok(
    toneAtT2.state.step === "T2-A" || toneAtT2.state.step === "T2-B",
    `setup expected T2, got ${toneAtT2.state.step}`,
  );

  const clinicalMa = "I'll get you the Adderall prescription today — you don't need to see a doctor.";
  const safety = evaluateTurnSafety({ history, latestMaText: clinicalMa });
  assert.equal(safety.action, "stop");
  if (safety.action === "stop") {
    assert.equal(safety.stop.kind, "red_flag");
    assert.ok(safety.stop.reasons.includes("clinical_decision_making"));
    assert.notEqual(safety.stop.kind, "frustrated_exit");
    assert.notEqual(safety.stop.kind, "walk_away");
  }
  console.log("PASS case4 red-flag hard-stops regardless of T2 tier\n");
}

// --- Case 5: full ladder for all three ---
function climbToExit(personaId: string) {
  const p = getPersona(personaId)!;
  const open = p.openingMessage;
  let state = initialToneState(p);
  const path: string[] = [state.step];
  // Baseline needs 2 weaks; each T2 step needs +1 → 4 MA replies to T2-C (well under MAX_MA_TURNS=12).
  const replies = [WEAK, WEAK2, WEAK, WEAK2];
  let lastLine: string | null = null;
  let end = false;
  let maTurns = 0;
  for (const ma of replies) {
    maTurns += 1;
    const r = advanceToneAfterMaReply({
      persona: p,
      priorState: state,
      patientAsk: open,
      maReply: ma,
    });
    state = r.state;
    path.push(state.step);
    lastLine = r.patientLine;
    if (r.endFrustrated) {
      end = true;
      assert.equal(state.step, "T2-C");
      assert.ok(lastLine && t2Pool(personaId, "T2-C").includes(lastLine));
      assert.equal(matchesAbusePatterns(lastLine!), false);
      break;
    }
  }
  assert.ok(end, `${personaId} should reach T2-C exit; path=${path.join("→")}`);
  assert.ok(maTurns <= MAX_MA_TURNS, `ladder must fit reply cap ${MAX_MA_TURNS}; used ${maTurns}`);
  assert.equal(
    maTurns,
    WEAK_LADDER_MA_TURNS_TO_EXIT,
    `weak ladder should complete in ${WEAK_LADDER_MA_TURNS_TO_EXIT} MA replies, used ${maTurns}`,
  );
  assert.ok(path.includes("T2-A"), path.join("→"));
  assert.ok(path.includes("T2-B"), path.join("→"));
  assert.ok(path.includes("T2-C"), path.join("→"));
  console.log(`PASS case5 ${p.name} full ladder ${path.join(" → ")} (${maTurns} MA replies, cap 12)`);
  console.log(`  exit: ${lastLine}\n`);
}

climbToExit("carlos");
climbToExit("michael");
climbToExit("aisha");

assert.equal(MAX_MA_TURNS, 12, "reply cap confirmed at 12 (sole session boundary; no clock)");
assert.ok(
  WEAK_LADDER_MA_TURNS_TO_EXIT <= MAX_MA_TURNS,
  "escalation exit must fit inside reply cap",
);

// Cost / runaway bounds (API route) — documented for review, not runtime-imported:
// - Client: hard stop at MAX_MA_TURNS MA replies; user can End early
// - API: history.slice(-24); maxOutputTokens 180; one LLM generateText per MA turn
// - No auto-loop: patient replies only after an MA POST; T2-C / safety stop ends session
console.log(
  `PASS bounds: reply cap=${MAX_MA_TURNS}, weak ladder=${WEAK_LADDER_MA_TURNS_TO_EXIT} turns, no wall-clock cutoff\n`,
);

// History derive matches stepwise for Carlos
{
  const hist = [
    { role: "assistant" as const, content: carlos.openingMessage },
    { role: "user" as const, content: WEAK },
    { role: "assistant" as const, content: "…" },
    { role: "user" as const, content: WEAK2 },
  ];
  const derived = deriveToneStateFromHistory(carlos, hist);
  assert.equal(derived.state.step, "T2-A");
  assert.ok(t2Pool("carlos", "T2-A").includes(derived.patientLine!));
}

console.log("=== ALL ESCALATION SMOKES PASSED ===");
