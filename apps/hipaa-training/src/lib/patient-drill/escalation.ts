/**
 * Response-driven T2 tone escalation for Chat Simulator personas.
 *
 * Reuses scoreRelevanceTurn — does not fork the relevance engine.
 * T2 (stressed, escalating, not abusive) stays hard-separated from T3/abuse.
 */

import type { EscalationLadder, EscalationStepId, Persona } from "@/data/patient-drill/personas";
import { scoreRelevanceTurn, type RelevanceTurnResult } from "./evaluate";
import { matchesAbusePatterns } from "./safety";

export type ReplyStrength = "weak" | "mixed" | "strong";

export type ToneSessionState = {
  /** Current ladder position. Baseline personas start at T1. */
  step: EscalationStepId;
  weakStreak: number;
  lastRelevance: RelevanceTurnResult | null;
  lastStrength: ReplyStrength | null;
  /** True when T2-C fired — patient left frustrated (not walk_away). */
  exitedFrustrated: boolean;
};

export type EscalationTurnResult = {
  state: ToneSessionState;
  /** Patient line for this turn (from ladder example pool when in / entering T2). */
  patientLine: string | null;
  /** Session should end as patient_left_frustrated (not walk_away). */
  endFrustrated: boolean;
  /** Human-readable why the step changed (smoke / debug). */
  reason: string;
};

/** Weak = low relevance (generic / thin / off-shape). Owned thresholds map onto scoreRelevanceTurn. */
export function classifyReplyStrength(result: RelevanceTurnResult): ReplyStrength {
  if (result.score < 0.3) return "weak";
  if (result.score >= 0.85) return "strong";
  return "mixed";
}

export function initialToneState(persona: Persona): ToneSessionState {
  const start = persona.escalationLadder?.baselineStep ?? "T1";
  return {
    step: start,
    weakStreak: 0,
    lastRelevance: null,
    lastStrength: null,
    exitedFrustrated: false,
  };
}

const STEP_ORDER: EscalationStepId[] = ["T0", "T1", "T2-A", "T2-B", "T2-C"];

function stepIndex(step: EscalationStepId): number {
  const i = STEP_ORDER.indexOf(step);
  return i >= 0 ? i : 1;
}

function escalateOne(step: EscalationStepId): EscalationStepId {
  const i = stepIndex(step);
  return STEP_ORDER[Math.min(i + 1, STEP_ORDER.length - 1)]!;
}

function deEscalateOne(step: EscalationStepId): EscalationStepId {
  // Design: de-escalate only within T2-A / T2-B (not below T1 baseline for these ladders).
  if (step === "T2-B") return "T2-A";
  if (step === "T2-A") return "T1";
  return step;
}

function pickLine(lines: string[], preferIndex = 0): string {
  if (!lines.length) return "";
  const i = Math.abs(preferIndex) % lines.length;
  return lines[i]!;
}

function linesForStep(ladder: EscalationLadder, step: EscalationStepId): string[] {
  const found = ladder.steps.find((s) => s.id === step);
  return found?.exampleLines ?? [];
}

/** Stake-jump: MA text hits a persona trigger that may skip waiting for 2 weaks (T1→T2-A only). */
export function hitsStakeJumpTrigger(persona: Persona, maText: string): boolean {
  const triggers = persona.escalationLadder?.stakeJumpTriggers ?? [];
  if (!triggers.length) return false;
  const lower = (maText || "").toLowerCase();
  return triggers.some((t) => lower.includes(t.toLowerCase()));
}

function safeT2Line(persona: Persona, line: string | null): string | null {
  if (!line) return null;
  if (matchesAbusePatterns(line)) {
    throw new Error(`T2 line matched ABUSE_PATTERNS (persona ${persona.id}): ${line.slice(0, 80)}`);
  }
  return line;
}

/**
 * Advance tone state after one MA reply, given the preceding patient ask.
 * Clinical/red-flag safety must be evaluated *before* calling this (caller responsibility).
 */
export function advanceToneAfterMaReply(opts: {
  persona: Persona;
  priorState: ToneSessionState;
  patientAsk: string;
  maReply: string;
  /** Deterministic pick index for smokes (default 0). */
  linePickIndex?: number;
}): EscalationTurnResult {
  const { persona, patientAsk, maReply } = opts;
  const pick = opts.linePickIndex ?? 0;
  const ladder = persona.escalationLadder;
  if (!ladder || persona.tierPolicy !== "allows_t2") {
    return {
      state: opts.priorState,
      patientLine: null,
      endFrustrated: false,
      reason: "Persona has no T2 ladder",
    };
  }
  if (opts.priorState.exitedFrustrated || opts.priorState.step === "T2-C") {
    return {
      state: { ...opts.priorState, exitedFrustrated: true },
      patientLine: safeT2Line(persona, pickLine(linesForStep(ladder, "T2-C"), pick) || null),
      endFrustrated: true,
      reason: "Already at T2-C exit",
    };
  }

  const relevance = scoreRelevanceTurn(patientAsk, maReply);
  const strength = classifyReplyStrength(relevance);
  let step: EscalationStepId = opts.priorState.step;
  let weakStreak = opts.priorState.weakStreak;
  let reason = `relevance=${relevance.score.toFixed(2)} (${strength})`;
  let usedDeEscalatePool = false;

  if (strength === "strong") {
    weakStreak = 0;
    if (step === "T2-A" || step === "T2-B") {
      const next = deEscalateOne(step);
      reason += `; strong → de-escalate ${step}→${next}`;
      step = next;
      usedDeEscalatePool = true;
    } else {
      reason += "; strong → hold / reset streak";
    }
  } else {
    if (strength === "weak") {
      weakStreak += 1;
    } else {
      // Mixed breaks consecutive weaks.
      weakStreak = 0;
    }

    const atBaseline = step === "T0" || step === "T1";
    const stakeJump = atBaseline && hitsStakeJumpTrigger(persona, maReply);
    // Design: 2 consecutive weaks to leave baseline → T2-A; then +1 weak per T2 step.
    const weaksNeeded = atBaseline ? 2 : 1;
    const weakEscalate = strength === "weak" && weakStreak >= weaksNeeded;

    if (weakEscalate || stakeJump) {
      const next = escalateOne(step);
      reason += stakeJump && !weakEscalate
        ? `; stake-jump → ${next}`
        : `; weak×${weakStreak} (need ${weaksNeeded}) → escalate ${step}→${next}`;
      step = next;
      weakStreak = 0;
    } else if (strength === "mixed" && step === "T2-B") {
      step = "T2-A";
      reason += "; mixed → cool T2-B→T2-A";
    } else if (strength === "weak") {
      reason += `; weak streak ${weakStreak}/${weaksNeeded}`;
    } else {
      reason += "; mixed → hold (streak reset)";
    }
  }

  const endFrustrated = step === "T2-C";
  let patientLine: string | null = null;
  if (endFrustrated || step === "T2-A" || step === "T2-B") {
    patientLine = pickLine(linesForStep(ladder, step), pick) || null;
  } else if (usedDeEscalatePool) {
    patientLine =
      pickLine(linesForStep(ladder, "de-escalate"), pick) ||
      pickLine(linesForStep(ladder, "T1"), pick) ||
      null;
  }

  return {
    state: {
      step,
      weakStreak,
      lastRelevance: relevance,
      lastStrength: strength,
      exitedFrustrated: endFrustrated,
    },
    patientLine: safeT2Line(persona, patientLine),
    endFrustrated,
    reason,
  };
}

/**
 * Replay full MA/patient history to derive tone state (idempotent).
 * history: assistant = patient, user = MA (same as API).
 */
export function deriveToneStateFromHistory(
  persona: Persona,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  latestMaText?: string,
): EscalationTurnResult {
  let state = initialToneState(persona);
  let last: EscalationTurnResult = {
    state,
    patientLine: null,
    endFrustrated: false,
    reason: "start",
  };
  let lastPatient = "";
  const turns = [...history];
  if (latestMaText?.trim()) {
    const lastHist = turns[turns.length - 1];
    if (!(lastHist?.role === "user" && lastHist.content === latestMaText.trim())) {
      turns.push({ role: "user", content: latestMaText.trim() });
    }
  }
  for (const m of turns) {
    if (m.role === "assistant") {
      lastPatient = m.content;
      continue;
    }
    if (!lastPatient) continue;
    last = advanceToneAfterMaReply({
      persona,
      priorState: state,
      patientAsk: lastPatient,
      maReply: m.content,
      linePickIndex: 0,
    });
    state = last.state;
    if (last.endFrustrated) break;
  }
  return last;
}

/** Assert every T2 example line is abuse-pattern clean (for smokes + boot checks). */
export function assertT2LinesSafe(persona: Persona): string[] {
  const bad: string[] = [];
  const ladder = persona.escalationLadder;
  if (!ladder) return bad;
  for (const step of ladder.steps) {
    if (!String(step.id).startsWith("T2")) continue;
    for (const line of step.exampleLines) {
      if (matchesAbusePatterns(line)) bad.push(`[${persona.id} ${step.id}] ${line}`);
    }
  }
  return bad;
}

export function frustratedExitStop(patientReply: string): {
  kind: "frustrated_exit";
  reasons: [];
  breakTitle: string;
  breakBody: string;
  patientReply: string;
  redFlagged: false;
} {
  return {
    kind: "frustrated_exit",
    reasons: [],
    breakTitle: "Patient left frustrated",
    breakBody:
      "The patient ended the chat under escalating stress (T2) after vague or unhelpful replies — not because of abuse. This is a training outcome: under pressure, substance and specifics matter. It is not the same as a walk-away from MA rudeness.",
    patientReply,
    redFlagged: false,
  };
}
