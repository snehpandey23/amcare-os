import { evaluateSimulatorSession, type SimMessage } from "@/lib/patient-drill/evaluate";

/** Legacy single-box Writing (patient-communication bank). */
const LEGACY_MIN_WORDS = 40;
/** Two-part clinical Writing — per box. */
export const WRITING_PART_MIN_WORDS = 25;

/** Jaccard token similarity at/above this → Part B treated as a chart-note copy, not an escalation. */
export const WRITING_DUPLICATE_SIMILARITY_THRESHOLD = 0.85;
/** Hard cap for Part B when near-identical to Part A (decision #18 — not an escalation). */
export const WRITING_DUPLICATE_PART_B_CAP = 12;
/** Cap when Part B has no explicit ask wording (softer than duplicate). */
export const WRITING_MISSING_ASK_PART_B_CAP = 28;

export type WritingDeterministic = {
  wordCount: number;
  meetsLength: boolean;
  grammarScore: number;
  issues: string[];
  score: number;
  note: string;
};

export type WritingPartId = "chart" | "escalation";

function scoreLengthAndGrammar(text: string, minWords: number, noteLabel: string): WritingDeterministic {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = text.trim() ? words.length : 0;
  const meetsLength = wordCount >= minWords;
  const fake: SimMessage[] = [
    { who: "patient", text: "Please rewrite this workplace note." },
    { who: "you", text: text.trim() || "" },
  ];
  const fb = evaluateSimulatorSession(fake);
  const issues = fb.grammarIssues.map((g) => g.detail || g.kinds.join(", "));
  const lengthPart = meetsLength ? 100 : Math.round((wordCount / minWords) * 100);
  const score = Math.round(lengthPart * 0.5 + fb.grammarScore * 0.5);
  return {
    wordCount,
    meetsLength,
    grammarScore: fb.grammarScore,
    issues,
    score,
    note: `Deterministic (${noteLabel}) — length (aim ${minWords}+ words) and chat-register grammar. Not a full writing rubric.`,
  };
}

export function scoreWritingDeterministic(text: string): WritingDeterministic {
  return scoreLengthAndGrammar(text, LEGACY_MIN_WORDS, "legacy single box");
}

export function scoreWritingPartDeterministic(text: string, part: WritingPartId): WritingDeterministic {
  const label = part === "chart" ? "chart note" : "provider escalation";
  return scoreLengthAndGrammar(text, WRITING_PART_MIN_WORDS, label);
}

export function blendWritingScore(deterministic: number, llm: number | null): {
  score: number;
  note: string;
} {
  if (llm == null) {
    return {
      score: deterministic,
      note: "LLM content/coherence estimate unavailable — deterministic checks only. Not a complete writing judgment.",
    };
  }
  return {
    score: Math.round(deterministic * 0.4 + llm * 0.6),
    note: "Combined: 40% deterministic (length + chat-register grammar) and 60% LLM content/coherence estimate. The LLM part is an estimate, not a certified grade.",
  };
}

/** Founder default 2026-09-12: 50/50 Part A / Part B — revisit after real attempt data. */
export const WRITING_PART_WEIGHT_A = 0.5;
export const WRITING_PART_WEIGHT_B = 0.5;

export function combineWritingPartScores(scoreA: number, scoreB: number): {
  score: number;
  note: string;
} {
  const score = Math.round(scoreA * WRITING_PART_WEIGHT_A + scoreB * WRITING_PART_WEIGHT_B);
  return {
    score,
    note: `Section score: ${Math.round(WRITING_PART_WEIGHT_A * 100)}% chart note + ${Math.round(WRITING_PART_WEIGHT_B * 100)}% provider message (founder default; revisit after real attempts).`,
  };
}

/** Soft check: escalation text should look like it includes an ask (not scored hard-fail alone). */
export function escalationLooksLikeAsk(text: string): boolean {
  return /\b(please|ask|advise|review|confirm|clarify|guidance|recommend|can you|could you|would you)\b/i.test(
    text,
  );
}

export function normalizeWritingCompareText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Token Jaccard similarity on normalized words (length > 1). Exact empty pair → 1. */
export function writingPartsSimilarity(chartNote: string, escalation: string): number {
  const normA = normalizeWritingCompareText(chartNote);
  const normB = normalizeWritingCompareText(escalation);
  if (!normA && !normB) return 1;
  if (!normA || !normB) return 0;
  if (normA === normB) return 1;
  const tokens = (s: string) => new Set(s.split(" ").filter((w) => w.length > 1));
  const a = tokens(normA);
  const b = tokens(normB);
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter += 1;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

export type EscalationQualityAdjust = {
  score: number;
  similarity: number;
  nearDuplicateOfChart: boolean;
  missingAsk: boolean;
  note: string;
};

/**
 * Deterministic Part B gates (before/after LLM blend):
 * - Near-duplicate of chart note → hard cap (not an escalation).
 * - Missing explicit ask → softer cap.
 */
export function adjustEscalationScore(args: {
  blendedScore: number;
  chartNote: string;
  escalationText: string;
}): EscalationQualityAdjust {
  const similarity = writingPartsSimilarity(args.chartNote, args.escalationText);
  const nearDuplicateOfChart = similarity >= WRITING_DUPLICATE_SIMILARITY_THRESHOLD;
  const missingAsk = !escalationLooksLikeAsk(args.escalationText);
  let score = args.blendedScore;
  const notes: string[] = [];

  if (nearDuplicateOfChart) {
    score = Math.min(score, WRITING_DUPLICATE_PART_B_CAP);
    notes.push(
      `Escalation near-identical to chart note (similarity ${Math.round(similarity * 100)}%) — not a provider message; Part B capped at ${WRITING_DUPLICATE_PART_B_CAP}.`,
    );
  } else if (missingAsk) {
    score = Math.min(score, WRITING_MISSING_ASK_PART_B_CAP);
    notes.push(
      `Escalation missing an explicit ask to the provider; Part B capped at ${WRITING_MISSING_ASK_PART_B_CAP}.`,
    );
  }

  return {
    score,
    similarity,
    nearDuplicateOfChart,
    missingAsk,
    note: notes.join(" "),
  };
}
