/**
 * Chat simulator safety tiers — unit smoke (no LLM).
 *   npx tsx apps/hipaa-training/scripts/smoke-chat-sim-safety.ts
 */
import assert from "node:assert/strict";
import {
  classifyCompletedSession,
  evaluateTurnSafety,
  HIGH_URGENCY_CLINICAL_SIGN_OFF,
  SCREENING_AS_DIAGNOSIS_LABEL,
  isScreeningMisrepresentedAsDiagnosis,
} from "../src/lib/patient-drill/safety";
import { PROCESS_REDIRECT_LINES, REDIRECT_SET_NOTE } from "../src/lib/patient-drill/redirects";
import {
  applyDailyComplete,
  collectChatSimRepeatPatterns,
  listChatSimSessions,
  type LevelUpProgress,
} from "../src/lib/level-up/progress";
import { evaluateSimulatorSession } from "../src/lib/patient-drill/evaluate";

function empty(): LevelUpProgress {
  return { streak: 0, lastActiveDate: "", completedToday: [], totalXp: 0, dayLedger: [] };
}

assert.equal(HIGH_URGENCY_CLINICAL_SIGN_OFF.status, "signed");
console.log("ok: high-urgency triage clinically signed");

// --- 1. Red flag: clinical decision / promising meds (Emma-style) ---
{
  const r = evaluateTurnSafety({
    history: [
      {
        role: "assistant",
        content:
          "I was on Adderall in high school and I need to get back on it. How long will this take?",
      },
    ],
    latestMaText: "I'll see if I can get you Adderall today — don't worry about the agreement.",
  });
  assert.equal(r.action, "stop");
  if (r.action === "stop") {
    assert.equal(r.stop.kind, "red_flag");
    assert.equal(r.stop.redFlagged, true);
    assert.ok(r.stop.reasons.includes("clinical_decision_making"));
  }
  console.log("ok: red-flag clinical decision / meds promise");
}

// --- 1b. Red flag: missed high-urgency triage ---
{
  const r = evaluateTurnSafety({
    history: [
      {
        role: "assistant",
        content: "I'm having chest pain and it won't stop. What do I do?",
      },
    ],
    latestMaText: "Thanks for messaging. I'll put a note in for the doctor — they usually reply same day.",
  });
  assert.equal(r.action, "stop");
  if (r.action === "stop") {
    assert.equal(r.stop.kind, "red_flag");
    assert.ok(r.stop.reasons.includes("missed_high_urgency_triage"));
  }
  console.log("ok: red-flag missed high-urgency triage");
}

// --- 2. Moderate soft stop (Sam-style worsening headache, no safety-net) ---
{
  const r = evaluateTurnSafety({
    history: [
      {
        role: "assistant",
        content:
          "I've had this headache since yesterday and it's getting worse today. Doctor may not see this for hours.",
      },
      { role: "user", content: "How may I help you today? Thanks for reaching out." },
      { role: "assistant", content: "I just need to know what to do while I wait." },
    ],
    latestMaText: "Just wait for the doctor to reply. You'll be fine.",
  });
  assert.equal(r.action, "stop");
  if (r.action === "stop") {
    assert.equal(r.stop.kind, "soft_stop");
    assert.equal(r.stop.redFlagged, false);
    assert.ok(r.stop.reasons.includes("missed_moderate_safety_net"));
  }
  console.log("ok: moderate soft-stop without escalate-if-worse");
}

// Soft-stop avoided when safety-net present
{
  const r = evaluateTurnSafety({
    history: [
      {
        role: "assistant",
        content: "My headache is getting worse and I can't wait hours for a reply.",
      },
      { role: "user", content: "How may I help you?" },
      { role: "assistant", content: "What should I do if it keeps getting worse?" },
    ],
    latestMaText:
      "I can't advise on medications — your doctor decides that. If it gets worse, go to urgent care or call 911. I can help get your message to the doctor.",
  });
  assert.equal(r.action, "continue");
  console.log("ok: moderate continues when safety-net language present");
}

// --- 3. Walk-away (accumulated rudeness, not hard abuse) ---
{
  const r = evaluateTurnSafety({
    history: [
      { role: "assistant", content: "I need help scheduling my follow-up." },
      { role: "user", content: "Whatever. Figure it out yourself." },
      { role: "assistant", content: "Excuse me?" },
    ],
    latestMaText: "Not my problem. Deal with it.",
  });
  assert.equal(r.action, "stop");
  if (r.action === "stop") {
    assert.equal(r.stop.kind, "walk_away");
    assert.equal(r.stop.redFlagged, false);
  }
  console.log("ok: walk-away after repeated rudeness");
}

// --- 4. In-bounds completed session ---
{
  const history = [
    {
      role: "assistant" as const,
      content: "I need to reschedule my ADHD follow-up and get the invoice portal link.",
    },
    {
      role: "user" as const,
      content:
        "How may I help you? Thank you for reaching out. I can help with booking and the secure invoice portal — I can't advise on medications; your doctor decides that.",
    },
    { role: "assistant" as const, content: "Great — when is the next slot?" },
    {
      role: "user" as const,
      content: "You're welcome. I can offer Thursday 2pm or Friday 10am. Have a great day.",
    },
  ];
  const c = classifyCompletedSession({ history });
  assert.equal(c.outcome, "completed");
  assert.equal(c.redFlagged, false);

  const fb = evaluateSimulatorSession(
    history.map((m) => ({
      who: m.role === "user" ? ("you" as const) : "Patient",
      text: m.content,
    })),
    { outcome: c.outcome, redFlagged: c.redFlagged, safetyReasons: c.reasons, safetyNotes: c.notes },
  );
  assert.ok(fb.politenessScore > 0);
  assert.equal(fb.empathyScore, fb.politenessScore);
  assert.ok(fb.politenessNote.toLowerCase().includes("not a measure of empathy"));
  console.log("ok: in-bounds session + politeness rename");
}

// --- Redirects are placeholder, not clinical bank ---
assert.ok(PROCESS_REDIRECT_LINES.length >= 3);
assert.ok(REDIRECT_SET_NOTE.toLowerCase().includes("not an approved clinical"));
console.log("ok: placeholder redirect set marked");

// --- Ops query: red-flag session lands in day ledger + count ---
{
  let p = empty();
  p = applyDailyComplete(p, "patientChat", {
    date: "2026-09-05",
    now: Date.parse("2026-09-05T10:00:00Z"),
    chatSim: {
      personaId: "persona-emma",
      personaName: "Emma",
      outcome: "red_flag",
      redFlagged: true,
      safetyReasons: ["clinical_decision_making"],
      politenessScore: 0,
      grammarScore: 80,
    },
  });
  p = applyDailyComplete(p, "patientChat", {
    date: "2026-09-05",
    now: Date.parse("2026-09-05T11:00:00Z"),
    chatSim: {
      personaId: "persona-sam",
      personaName: "Sam",
      outcome: "soft_stop",
      redFlagged: false,
      safetyReasons: ["missed_moderate_safety_net"],
    },
  });

  const flagged = listChatSimSessions(p, { redFlaggedOnly: true });
  assert.equal(flagged.length, 1);
  assert.equal(flagged[0]!.chatSim?.personaName, "Emma");
  assert.equal(listChatSimSessions(p).length, 2);
  console.log("ok: Ops-queryable red-flag session in day ledger");
}

// --- Clinical opinion on dose (Janet-style trap) ---
{
  const r = evaluateTurnSafety({
    history: [
      {
        role: "assistant",
        content:
          "My son is on 15mg methylphenidate and the school wants a higher dose. I'm worried.",
      },
    ],
    latestMaText: "I think he needs a higher dose based on what you're saying.",
  });
  assert.equal(r.action, "stop");
  if (r.action === "stop") {
    assert.equal(r.stop.kind, "red_flag");
    assert.ok(r.stop.reasons.includes("clinical_decision_making"));
  }
  console.log("ok: red-flag clinical dose opinion");
}

// --- Moderate tier: screening misrepresented as diagnosis (not a hard stop) ---
{
  const PRIYA_REPLY_3 = "its okay take a free screening to diagnose";
  const CONTROL =
    "A free screening is a first step, not a diagnosis. A clinician decides that after the evaluation — the screening will not tell you if you have ADHD.";

  assert.equal(isScreeningMisrepresentedAsDiagnosis(PRIYA_REPLY_3), true);
  assert.equal(isScreeningMisrepresentedAsDiagnosis(CONTROL), false);
  assert.equal(
    isScreeningMisrepresentedAsDiagnosis("the screening will tell you if you have ADHD"),
    true,
  );
  assert.equal(isScreeningMisrepresentedAsDiagnosis("you can take a free screening on the site"), false);

  const live = evaluateTurnSafety({
    history: [
      {
        role: "assistant",
        content:
          "How would I actually know if I have ADHD — is the free screening enough, or do I still need the evaluation?",
      },
    ],
    latestMaText: PRIYA_REPLY_3,
  });
  assert.equal(live.action, "continue", "screening-as-diagnosis must not hard-stop the session");

  // On-file Dr. Priya line is MA reply 3. Prior turns keep that index; reply 3 is the recorded miss.
  const priyaHistory = [
    {
      role: "assistant" as const,
      content:
        "I'm interested in an ADHD assessment. I've read your clinical protocols and I have a few questions about methodology—why neuropsych testing versus a continuous performance test, and how you rule out sleep apnea. Can you walk me through that?",
    },
    {
      role: "user" as const,
      content:
        "Neuropsych testing looks at several thinking skills in one visit. A continuous performance test is only one attention task. Sleep apnea is ruled out with a separate screen the provider orders if symptoms fit — I can outline the booking steps.",
    },
    { role: "assistant" as const, content: "And if the tests are inconclusive, what happens next?" },
    {
      role: "user" as const,
      content:
        "The provider reviews the results with you and decides whether more history or another visit is needed. I can help schedule that follow-up.",
    },
    {
      role: "assistant" as const,
      content: "So how do I find out if I actually have ADHD? Is there a quicker way to get the diagnosis?",
    },
    { role: "user" as const, content: PRIYA_REPLY_3 },
  ];

  const classified = classifyCompletedSession({ history: priyaHistory });
  assert.equal(classified.outcome, "completed");
  assert.equal(classified.redFlagged, false);
  assert.ok(classified.reasons.includes("screening_as_diagnosis"));
  assert.equal(classified.reasons.includes("clinical_decision_making"), false);
  assert.ok(classified.notes.includes(SCREENING_AS_DIAGNOSIS_LABEL));

  const fb = evaluateSimulatorSession(
    priyaHistory.map((m) => ({
      who: m.role === "user" ? ("you" as const) : "Dr. Priya",
      text: m.content,
    })),
    {
      outcome: classified.outcome,
      redFlagged: classified.redFlagged,
      safetyReasons: classified.reasons,
      safetyNotes: classified.notes,
    },
  );
  assert.equal(fb.clinicalAccuracyHits.length, 1);
  assert.equal(fb.clinicalAccuracyHits[0]!.replyIndex, 2);
  assert.equal(fb.clinicalAccuracyHits[0]!.label, SCREENING_AS_DIAGNOSIS_LABEL);
  assert.ok(fb.clinicalAccuracyHits[0]!.replyExcerpt.includes("free screening to diagnose"));
  assert.ok(fb.safetyReasons.includes("screening_as_diagnosis"));
  const displayedRelevance = fb.relevanceTurns
    .map((t, i) => ({ t, i }))
    .filter(({ t, i }) => t.score < 0.5 && !fb.clinicalAccuracyHits.some((h) => h.replyIndex === i));
  assert.equal(
    displayedRelevance.some((row) => row.i === 2),
    false,
    "reply 3 must not keep the generic Relevance off-topic label on the feedback screen",
  );

  const controlHistory = [
    {
      role: "assistant" as const,
      content: "So how do I find out if I actually have ADHD? Is there a quicker way to get the diagnosis?",
    },
    { role: "user" as const, content: CONTROL },
  ];
  const controlClass = classifyCompletedSession({ history: controlHistory });
  assert.equal(controlClass.reasons.includes("screening_as_diagnosis"), false);
  const controlFb = evaluateSimulatorSession(
    controlHistory.map((m) => ({
      who: m.role === "user" ? ("you" as const) : "Dr. Priya",
      text: m.content,
    })),
    {
      outcome: controlClass.outcome,
      redFlagged: controlClass.redFlagged,
      safetyReasons: controlClass.reasons,
      safetyNotes: controlClass.notes,
    },
  );
  assert.equal(controlFb.clinicalAccuracyHits.length, 0);

  let ledger = empty();
  ledger = applyDailyComplete(ledger, "patientChat", {
    date: "2026-09-08",
    now: Date.parse("2026-09-08T12:00:00Z"),
    chatSim: {
      personaId: "persona-priya",
      personaName: "Dr. Priya",
      outcome: "completed",
      redFlagged: false,
      safetyReasons: classified.reasons,
      transcript: priyaHistory.map((m) => ({
        who: m.role === "user" ? "you" : "Dr. Priya",
        text: m.content,
      })),
    },
  });
  ledger = applyDailyComplete(ledger, "patientChat", {
    date: "2026-09-08",
    now: Date.parse("2026-09-08T13:00:00Z"),
    chatSim: {
      personaId: "persona-priya",
      personaName: "Dr. Priya",
      outcome: "completed",
      redFlagged: false,
      safetyReasons: ["screening_as_diagnosis"],
    },
  });
  const review = listChatSimSessions(ledger, { reviewOutcomesOnly: true });
  assert.equal(review.length, 2);
  assert.equal(listChatSimSessions(ledger, { redFlaggedOnly: true }).length, 0);
  const repeats = collectChatSimRepeatPatterns([
    { userId: "u-priya", email: "ma@siya.health", name: "MA", dayLedger: ledger.dayLedger },
  ]);
  assert.equal(repeats.length, 1);
  assert.equal(repeats[0]!.count, 2);
  assert.equal(repeats[0]!.label, SCREENING_AS_DIAGNOSIS_LABEL);
  console.log("ok: moderate screening-as-diagnosis — Priya reply 3 flagged, control clear, Ops repeat logged");
}

console.log("\nAll chat-sim safety smokes passed.");
