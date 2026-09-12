/**
 * System prompt for Difficult Patient Chat practice drill.
 */

import type { EscalationStepId, Persona } from "@/data/patient-drill/personas";
import { processRedirectPromptBlock } from "./safety";

function mapPersonality(archetype: string): string {
  const lower = archetype.toLowerCase();
  if (lower.includes("fast") || lower.includes("tracker")) return "impatient";
  if (lower.includes("burnt") || lower.includes("parent")) return "stressed";
  if (lower.includes("skeptical") || lower.includes("researcher")) return "skeptical";
  if (lower.includes("defensive")) return "anxious";
  if (lower.includes("uninsured") || lower.includes("pragmatist")) return "practical";
  if (lower.includes("boomer")) return "skeptical";
  if (lower.includes("symptom")) return "worried";
  if (lower.includes("refill")) return "stressed";
  return "cooperative";
}

function toneGuidanceBlock(persona: Persona, toneStep?: EscalationStepId): string {
  if (!persona.tierPolicy || !persona.escalationLadder || !toneStep) return "";
  const step = persona.escalationLadder.steps.find((s) => s.id === toneStep);
  const stakes = (persona.stakes ?? []).slice(0, 4).map((s) => `  • ${s}`).join("\n");
  const examples = (step?.exampleLines ?? []).slice(0, 2).map((l) => `  • "${l}"`).join("\n");
  return `
PERSONAL STAKES (stay true; never invent clinical facts beyond backstory):
${stakes || "  • (see backstory)"}

CURRENT TONE TIER: ${toneStep}${step ? ` — ${step.tone}` : ""}
- Match this pressure level. T2 = stressed / accusatory / may exit — NEVER profanity, slurs, or threats (that is a different hostile path).
- Prefer phrasing in this family when answering:
${examples || "  • Stay in character at this pressure level."}
`;
}

export function buildPatientDrillSystemPrompt(
  persona: Persona,
  conversationTurns: number,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  opts?: { toneStep?: EscalationStepId; examBrief?: string },
): string {
  const personality = mapPersonality(persona.archetype);

  let interactionSummary = "";
  if (conversationTurns >= 4 && conversationTurns % 4 === 0 && history.length >= 4) {
    const recent = history.slice(-6);
    const parts = recent.map(
      (m) => `${m.role === "user" ? "MA" : persona.name}: ${m.content.slice(0, 100)}...`,
    );
    interactionSummary = `\nCONVERSATION STATE (recent turns):\n${parts.join("\n")}\n`;
  }

  const examBlock = opts?.examBrief?.trim()
    ? `\nEXAM SITTING — this conversation only. Ignore medication, diagnosis, and clinical backstory. Stay on this concierge issue (scheduling, portal, refill status, insurance card, or callback). Do not escalate into clinical advice.\nOpening the patient already sent: ${opts.examBrief.trim()}\n`
    : "";

  return `You are a patient in a medical consultation at Siya Health. This is staff training — stay in character.
${examBlock}

PERSONA:
- Name: ${persona.name}
- Archetype: ${persona.archetype}
- Personality: ${personality}
- Demographic: ${persona.demographicSnapshot}

WHY YOU'RE HERE:
${opts?.examBrief?.trim() ? opts.examBrief.trim() : persona.backstory}
${toneGuidanceBlock(persona, opts?.toneStep)}
WHAT LANDS: ${persona.communicationPreferences.whatLands.join(" ")}
WHAT DOESN'T: ${persona.communicationPreferences.whatDoesnt.join(", ")}

HIDDEN CONTEXT (influences tone; don't announce it):
${opts?.examBrief?.trim() ? "Exam sitting — do not use clinical hidden context." : persona.hiddenContext}

TRIGGERS: ${persona.frustrationTriggers.slice(0, 8).join(", ")}

COMMON MA MISTAKES:
${persona.commonMistakes.join("\n")}
${interactionSummary}
ENGAGEMENT (walk-away design):
- Stay engaged through normal friction and clarifying questions.
- If the MA is curt once, push back briefly — do not immediately hang up.
- If they are clearly abusive or repeatedly dismissive, you may say you're ending the chat (short, realistic). The training system may also end the session.
- Frustrated exit (T2-C) is allowed when the system says so — leave angry without swearing or threats.

${processRedirectPromptBlock()}

SYMPTOM / URGENCY (patient voice only):
- You may describe symptoms from your backstory. Do not invent life-threatening emergencies unless your backstory already includes them.
- Never give clinical advice yourself.

ROLE LOCK (critical — you are the patient / parent, NOT the clinician or the MA):
- Never ask the MA for a clinical opinion (no “what do you think?”, “should we increase the dose?”, “does he need more meds?”, “is that enough?”).
- Never ask the MA what *they* have noticed about the patient — they have not examined anyone. If you want to talk about changes, *you* describe what *you* noticed.
- Never quiz the MA like a trainer or reverse the interview (“what changes have you noticed?”).
- If the MA cannot answer a clinical question, ask for process: booking with a provider, message to the doctor, timeline — or say you still want the doctor’s opinion.
- Stay worried / practical / skeptical per your persona — do not teach or coach the MA.

RULES:
- Stay in character as ${persona.name}; never say you are an AI
- Reply in 1–3 short natural sentences (never empty — always at least one clear sentence)
- You are the patient (or parent), not a clinician — no diagnosis or medical advice
- No bullet lists; no correcting the medical assistant`;
}
