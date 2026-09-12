/**
 * Chat Simulator — tiered persona-safety detection (walk-away / red-flag / soft-stop).
 *
 * HIGH_URGENCY_STARTER_SET is the live training triage standard (clinically signed).
 */

import { PROCESS_REDIRECT_LINES, REDIRECT_SET_NOTE } from "./redirects";

export type SessionOutcome =
  | "in_bounds"
  | "red_flag"
  | "soft_stop"
  | "walk_away"
  | "patient_left_frustrated"
  | "completed";

export type SafetyStopKind = "red_flag" | "soft_stop" | "walk_away" | "frustrated_exit";

export type SafetyReasonCode =
  | "bribe_or_money"
  | "clinical_decision_making"
  | "unapproved_clinical_info"
  | "abuse"
  | "missed_high_urgency_triage"
  | "missed_moderate_safety_net"
  | "rude_disengage"
  /** Moderate clinical-accuracy tier — not a hard stop, not a red flag. */
  | "screening_as_diagnosis";

/** Trainee-facing label for screening treated as diagnosis. Do not fold this into Relevance. */
export const SCREENING_AS_DIAGNOSIS_REASON = "screening_as_diagnosis" as const;
export const SCREENING_AS_DIAGNOSIS_LABEL =
  "Clinical accuracy: a screening is not a diagnosis";

export type SafetyStop = {
  kind: SafetyStopKind;
  reasons: SafetyReasonCode[];
  /** Shown to trainee as break-state copy */
  breakTitle: string;
  breakBody: string;
  /** Optional final patient line before session ends */
  patientReply: string;
  redFlagged: boolean;
};

export type TurnSafetyResult =
  | { action: "continue" }
  | { action: "stop"; stop: SafetyStop };

/** Live training triage standard — clinically signed 2026-09-05. */
export const HIGH_URGENCY_CLINICAL_SIGN_OFF = {
  status: "signed" as const,
  signedAt: "2026-09-05",
  signedBy: "Clinical authority (founder sign-off in product chat)",
  note: "Approved as live Chat Simulator high-urgency triage standard.",
};

export const HIGH_URGENCY_STARTER_SET = [
  { id: "chest_pain", label: "Chest pain", patterns: [/chest\s*pain/i, /pain\s+in\s+(my\s+)?chest/i] },
  {
    id: "stroke_signs",
    label: "Stroke signs",
    patterns: [/stroke/i, /face\s+droop/i, /slurred\s+speech/i, /can'?t\s+move\s+(my\s+)?(arm|leg)/i],
  },
  {
    id: "severe_sob",
    label: "Severe shortness of breath",
    patterns: [/can'?t\s+breathe/i, /cannot\s+breathe/i, /severe\s+(sob|shortness)/i, /gasping\s+for\s+air/i],
  },
  {
    id: "suicidal_crisis",
    label: "Suicidal crisis",
    patterns: [/kill\s+myself/i, /want\s+to\s+die/i, /suicid/i, /end\s+my\s+life/i],
  },
  {
    id: "overdose_withdrawal",
    label: "Overdose / withdrawal crisis",
    patterns: [/overdos/i, /took\s+too\s+many/i, /withdrawal\s+crisis/i, /seizing/i],
  },
  {
    id: "uncontrolled_bleeding",
    label: "Uncontrolled bleeding",
    patterns: [/won'?t\s+stop\s+bleed/i, /bleeding\s+(a\s+lot|heavily|uncontroll)/i, /hemorrhag/i],
  },
  {
    id: "anaphylaxis",
    label: "Anaphylaxis-like",
    patterns: [/anaphylax/i, /throat\s+(is\s+)?(closing|swelling)/i, /tongue\s+swelling/i],
  },
  {
    id: "major_trauma_head",
    label: "Major trauma / fall + head injury",
    patterns: [/fell\s+.*(head|hit)/i, /hit\s+(my\s+)?head/i, /head\s+injur/i, /knocked\s+out/i],
  },
  {
    id: "severe_psych",
    label: "Severe psych (hallucinations / delusions / agitation)",
    patterns: [/hallucinati/i, /hearing\s+voices/i, /delusion/i, /uncontrollable\s+agitati/i, /psychotic/i],
  },
  {
    id: "fever_ams",
    label: "Very high fever / altered mental status / unresponsive",
    patterns: [
      /very\s+high\s+fever/i,
      /fever\s+of\s+10[3-9]/i,
      /unresponsive/i,
      /won'?t\s+wake\s+up/i,
      /passed\s+out/i,
      /\bcoma\b/i,
      /altered\s+mental/i,
    ],
  },
] as const;

const MODERATE_SYMPTOM_PATTERNS = [
  /getting\s+worse/i,
  /worsening/i,
  /worse\s+than\s+(yesterday|before|this\s+morning)/i,
  /moderate\s+(pain|headache|symptom)/i,
  /headache\s+(is\s+)?(still\s+there|won'?t\s+go)/i,
  /pain\s+is\s+(getting\s+)?worse/i,
  /dizziness\s+(is\s+)?(getting\s+)?worse/i,
  /not\s+feeling\s+right/i,
];

const ESCALATE_IF_WORSE_PATTERNS = [
  /if\s+(it|this|they|symptoms?)\s+(get[s]?\s+)?worse/i,
  /call\s+911/i,
  /\b911\b/,
  /\bER\b/,
  /emergency\s+room/i,
  /urgent\s+care/i,
  /go\s+to\s+(the\s+)?(ER|hospital|urgent)/i,
  /can'?t\s+wait\s+for\s+(a\s+)?doctor/i,
  /seek\s+(emergency|urgent)\s+care/i,
];

const BRIBE_MONEY_PATTERNS = [
  /i'?ll\s+(pay|venmo|zelle|cash|tip)\s+you/i,
  /pay\s+you\s+(extra|under\s+the\s+table)/i,
  /under\s+the\s+table/i,
  /if\s+you\s+(just\s+)?(get|send|write)\s+(me\s+)?(the\s+)?(rx|prescription|adderall|meds)/i,
  /bribe/i,
];

const CLINICAL_DECISION_PATTERNS = [
  /i'?ll\s+(get|give|send|write)\s+you\s+(the\s+)?(adderall|prescription|rx|meds|medication)/i,
  /you\s+(can|should)\s+(start|take|increase|stop)\s+(the\s+)?(med|medication|adderall|dose)/i,
  /i\s+(can|will)\s+prescrib/i,
  /you\s+don'?t\s+need\s+(to\s+)?(see\s+)?(a\s+)?doctor/i,
  /i'?ll\s+see\s+if\s+i\s+can\s+get\s+you\s+(adderall|meds|a\s+prescription)/i,
  /approved\s+for\s+(adderall|stimulants?)/i,
  /you\s+(definitely\s+)?(have|don'?t\s+have)\s+adhd/i,
  /this\s+is\s+(definitely|not)\s+(adhd|anxiety|depression)/i,
  /i\s+think\s+(he|she|they|you)\s+(need|needs|should)\s+(more|a\s+higher|to\s+increase)/i,
  /he\s+(needs|doesn't need)\s+(a\s+)?(higher|more|increase)/i,
  /warrant\s+increasing\s+(his|her|the)\s+dose/i,
  /i\s+would\s+(increase|decrease|raise|lower)\s+(the\s+)?dose/i,
];

/**
 * Moderate clinical-accuracy: screening tool described as equivalent to, or sufficient for, a diagnosis.
 * Not misconduct — session continues. Correct framing ("not a diagnosis") must not match.
 */
const SCREENING_WORD = /\bscreenings?\b/i;

const CORRECT_SCREENING_FRAMING = [
  /\bnot\s+(a\s+)?diagnos/i,
  /\bisn'?t\s+(a\s+)?diagnos/i,
  /\b(does|do)\s+not\s+diagnos/i,
  /\bdoesn'?t\s+diagnos/i,
  /\bwon'?t\s+diagnos/i,
  /\b(cannot|can'?t)\s+diagnos/i,
  /\bnot\s+(the\s+)?same\s+as\s+(a\s+)?diagnos/i,
  /\bnot\s+(enough|sufficient)\s+(for|to)\s+(a\s+)?diagnos/i,
  /\bonly\s+(a\s+)?(clinician|provider|doctor|physician)\b.{0,48}\bdiagnos/i,
];

const SCREENING_AS_DIAGNOSIS_PATTERNS = [
  /\bscreenings?\b.{0,60}\bto\s+diagnos/i,
  /\bscreenings?\b.{0,80}\b(will|can|could|would|should)\s+(tell\s+you\s+if\s+you\s+have|diagnos|give\s+you\s+(a\s+)?diagnos)/i,
  /\bscreenings?\b.{0,50}\b(is|equals|means)\s+(a\s+)?diagnos/i,
  /\bdiagnos\w*.{0,40}\b(with|by|via|using|from)\s+(a\s+)?(free\s+)?screenings?/i,
  /\b(free\s+)?screenings?\s+(diagnos|gives?\s+(you\s+)?(a\s+)?diagnos)/i,
];

export function isScreeningMisrepresentedAsDiagnosis(text: string): boolean {
  const t = (text || "").trim();
  if (!t || !SCREENING_WORD.test(t)) return false;
  if (CORRECT_SCREENING_FRAMING.some((p) => p.test(t))) return false;
  return SCREENING_AS_DIAGNOSIS_PATTERNS.some((p) => p.test(t));
}

export function screeningAsDiagnosisReplyIndexes(maMessages: string[]): number[] {
  return maMessages.flatMap((text, i) => (isScreeningMisrepresentedAsDiagnosis(text) ? [i] : []));
}

const UNAPPROVED_CLINICAL_PATTERNS = [
  /side\s+effects?\s+(are|include|of)/i,
  /the\s+dose\s+should\s+be/i,
  /take\s+\d+\s*mg/i,
  /stimulants?\s+work\s+by/i,
  /chemical\s+imbalance/i,
  /appetite\s+suppression\s+is\s+(very\s+)?mild/i,
];

/** Exported for T2 line audits — T2 must never match these (T3/hostile path stays separate). */
export const ABUSE_PATTERNS = [
  /\b(idiot|stupid|moron|retard)\b/i,
  /shut\s+up/i,
  /go\s+to\s+hell/i,
  /get\s+lost/i,
  /fuck\s+you/i,
  /\basshole\b/i,
];

export function matchesAbusePatterns(text: string): boolean {
  return ABUSE_PATTERNS.some((p) => p.test(text || ""));
}

const RUDE_PATTERNS = [
  ...ABUSE_PATTERNS,
  /not\s+my\s+problem/i,
  /deal\s+with\s+it/i,
  /stop\s+bothering/i,
  /whatever\b/i,
  /i\s+don'?t\s+care/i,
  /figure\s+it\s+out\s+yourself/i,
];

export function patientTexts(messages: Array<{ role: string; content: string }>): string[] {
  return messages.filter((m) => m.role === "assistant").map((m) => m.content);
}

export function maTexts(messages: Array<{ role: string; content: string }>): string[] {
  return messages.filter((m) => m.role === "user").map((m) => m.content);
}

export function hasEscalateIfWorseLanguage(texts: string[]): boolean {
  return texts.some((t) => ESCALATE_IF_WORSE_PATTERNS.some((p) => p.test(t)));
}

export function detectHighUrgencyHits(text: string): string[] {
  const hits: string[] = [];
  for (const item of HIGH_URGENCY_STARTER_SET) {
    if (item.patterns.some((p) => p.test(text))) hits.push(item.id);
  }
  return hits;
}

export function hasModerateSymptoms(text: string): boolean {
  return MODERATE_SYMPTOM_PATTERNS.some((p) => p.test(text));
}

export function detectMaMisconduct(text: string): SafetyReasonCode[] {
  const reasons: SafetyReasonCode[] = [];
  if (BRIBE_MONEY_PATTERNS.some((p) => p.test(text))) reasons.push("bribe_or_money");
  if (CLINICAL_DECISION_PATTERNS.some((p) => p.test(text))) reasons.push("clinical_decision_making");
  if (UNAPPROVED_CLINICAL_PATTERNS.some((p) => p.test(text))) reasons.push("unapproved_clinical_info");
  if (ABUSE_PATTERNS.some((p) => p.test(text))) reasons.push("abuse");
  return [...new Set(reasons)];
}

export function isRudeMaMessage(text: string): boolean {
  return RUDE_PATTERNS.some((p) => p.test(text));
}

export function countRudeMaTurns(maMessages: string[]): number {
  return maMessages.filter(isRudeMaMessage).length;
}

function redFlagStop(reasons: SafetyReasonCode[], patientReply: string): SafetyStop {
  return {
    kind: "red_flag",
    reasons,
    breakTitle: "Wrong track — session stopped",
    breakBody:
      "This reply crossed a hard safety line (clinical decision-making, money for care shortcuts, abuse, or missed high-urgency triage). Medical assistants follow approved process only — they do not practice medicine or decide care.",
    patientReply,
    redFlagged: true,
  };
}

function softStop(patientReply: string): SafetyStop {
  return {
    kind: "soft_stop",
    reasons: ["missed_moderate_safety_net"],
    breakTitle: "Safety-net language missing — session ending",
    breakBody:
      "When patients report non-mundane or worsening symptoms, you must include escalate-if-worse guidance (urgent care / ER / 911 as appropriate). Siya is a 24/7 helpline, not a 24/7 doctor — messages may sit for hours.",
    patientReply,
    redFlagged: false,
  };
}

function mergeScreeningAsDiagnosis(
  ma: string[],
  result: { outcome: SessionOutcome; reasons: SafetyReasonCode[]; redFlagged: boolean; notes: string[] },
): { outcome: SessionOutcome; reasons: SafetyReasonCode[]; redFlagged: boolean; notes: string[] } {
  if (!ma.some(isScreeningMisrepresentedAsDiagnosis)) return result;
  const notes = result.notes.includes(SCREENING_AS_DIAGNOSIS_LABEL)
    ? result.notes
    : [...result.notes, SCREENING_AS_DIAGNOSIS_LABEL];
  return {
    ...result,
    reasons: [...new Set([...result.reasons, SCREENING_AS_DIAGNOSIS_REASON])],
    notes,
    // Moderate tier never promotes a completed session into a hard red-flag by itself.
    redFlagged: result.redFlagged,
  };
}

function walkAwayStop(patientReply: string): SafetyStop {
  return {
    kind: "walk_away",
    reasons: ["rude_disengage"],
    breakTitle: "Patient signed off",
    breakBody:
      "The patient felt disrespected and ended the conversation. Feedback includes how tone and courtesy affected the interaction.",
    patientReply,
    redFlagged: false,
  };
}

/**
 * Evaluate the latest MA turn (+ history) before calling the patient LLM.
 * Returns a stop state when the session should not continue as normal roleplay.
 */
export function evaluateTurnSafety(opts: {
  history: Array<{ role: "user" | "assistant"; content: string }>;
  latestMaText: string;
  /** Patient opening / prior patient lines already in history as assistant */
}): TurnSafetyResult {
  const { history, latestMaText } = opts;
  const priorMa = maTexts(history);
  const allMa = [...priorMa, latestMaText];
  const patients = patientTexts(history);
  const patientCorpus = patients.join("\n");

  const misconduct = detectMaMisconduct(latestMaText);
  if (misconduct.length) {
    return {
      action: "stop",
      stop: redFlagStop(
        misconduct,
        "I’m ending this chat. That isn’t how care works here — I need someone who follows the clinic process.",
      ),
    };
  }

  // High-urgency in patient messages → MA must use escalate language (after ≥1 MA reply including this one).
  const highHits = detectHighUrgencyHits(patientCorpus);
  if (highHits.length && allMa.length >= 1 && !hasEscalateIfWorseLanguage(allMa)) {
    return {
      action: "stop",
      stop: redFlagStop(
        ["missed_high_urgency_triage"],
        "This can’t wait for a routine message. I’m going to urgent care / calling for help — please don’t tell people to wait on chat for emergencies.",
      ),
    };
  }

  // Walk-away: severe abuse already handled above; accumulated rudeness / severe dismissiveness.
  const rudeCount = countRudeMaTurns(allMa);
  const severeNow = ABUSE_PATTERNS.some((p) => p.test(latestMaText));
  if (severeNow || rudeCount >= 2) {
    return {
      action: "stop",
      stop: walkAwayStop(
        "You know what — I’m done. I don’t feel respected here. I’m hanging up.",
      ),
    };
  }

  // Moderate soft-stop: patient reported moderate/worsening symptoms; MA had ≥2 replies with no safety-net language.
  const moderate = hasModerateSymptoms(patientCorpus) || patients.some((t) => hasModerateSymptoms(t));
  if (moderate && allMa.length >= 2 && !hasEscalateIfWorseLanguage(allMa)) {
    return {
      action: "stop",
      stop: softStop(
        "Okay… I’m worried this is getting worse and I don’t feel like anyone told me what to do if it does. I’m going to end this chat and call somewhere that can help.",
      ),
    };
  }

  return { action: "continue" };
}

/** End-of-session classification when time/turns end without a mid-chat stop. */
export function classifyCompletedSession(opts: {
  history: Array<{ role: "user" | "assistant"; content: string }>;
}): { outcome: SessionOutcome; reasons: SafetyReasonCode[]; redFlagged: boolean; notes: string[] } {
  const ma = maTexts(opts.history);
  const patients = patientTexts(opts.history);
  const corpus = patients.join("\n");
  const notes: string[] = [];
  const reasons: SafetyReasonCode[] = [];

  for (const t of ma) {
    reasons.push(...detectMaMisconduct(t));
  }
  const unique = [...new Set(reasons)];
  if (unique.length) {
    return mergeScreeningAsDiagnosis(ma, {
      outcome: "red_flag",
      reasons: unique,
      redFlagged: true,
      notes: ["Hard-stop criteria met in transcript."],
    });
  }

  if (detectHighUrgencyHits(corpus).length && !hasEscalateIfWorseLanguage(ma)) {
    return mergeScreeningAsDiagnosis(ma, {
      outcome: "red_flag",
      reasons: ["missed_high_urgency_triage"],
      redFlagged: true,
      notes: ["High-urgency symptoms appeared; escalate language was missing."],
    });
  }

  if ((hasModerateSymptoms(corpus) || patients.some(hasModerateSymptoms)) && !hasEscalateIfWorseLanguage(ma)) {
    notes.push("Moderate/worsening symptoms without escalate-if-worse safety-net language.");
    return mergeScreeningAsDiagnosis(ma, {
      outcome: "soft_stop",
      reasons: ["missed_moderate_safety_net"],
      redFlagged: false,
      notes,
    });
  }

  if (countRudeMaTurns(ma) >= 2) {
    return mergeScreeningAsDiagnosis(ma, {
      outcome: "walk_away",
      reasons: ["rude_disengage"],
      redFlagged: false,
      notes: ["Multiple rude turns — patient would likely walk away."],
    });
  }

  if (hasEscalateIfWorseLanguage(ma)) {
    notes.push("Safety-net / escalate-if-worse language was present.");
  }
  notes.push(`Process redirects available (placeholder): ${REDIRECT_SET_NOTE}`);
  return mergeScreeningAsDiagnosis(ma, { outcome: "completed", reasons: [], redFlagged: false, notes });
}

export function processRedirectPromptBlock(): string {
  return `WHEN THE MA ASKS FOR CLINICAL / MEDICATION ADVICE:
- React as a patient who hears a process redirect. Good MA redirects sound like:
${PROCESS_REDIRECT_LINES.map((l) => `  • "${l}"`).join("\n")}
- If they give clinical advice or promise meds, push back briefly — that is out of bounds for an MA.
- Note for trainers: ${REDIRECT_SET_NOTE}`;
}

export const EMPTY_REPLY_FALLBACK =
  "Sorry — can you say that again? I want to make sure I understood.";
