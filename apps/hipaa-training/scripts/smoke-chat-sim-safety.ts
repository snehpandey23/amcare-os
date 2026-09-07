/**
 * Chat simulator safety tiers — unit smoke (no LLM).
 *   npx tsx apps/hipaa-training/scripts/smoke-chat-sim-safety.ts
 */
import assert from "node:assert/strict";
import {
  classifyCompletedSession,
  evaluateTurnSafety,
  HIGH_URGENCY_CLINICAL_SIGN_OFF,
} from "../src/lib/patient-drill/safety";
import { PROCESS_REDIRECT_LINES, REDIRECT_SET_NOTE } from "../src/lib/patient-drill/redirects";
import {
  applyDailyComplete,
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

console.log("\nAll chat-sim safety smokes passed.");
