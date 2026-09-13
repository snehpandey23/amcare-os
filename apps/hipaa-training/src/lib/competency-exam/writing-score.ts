import { evaluateSimulatorSession, type SimMessage } from "@/lib/patient-drill/evaluate";

/** Legacy single-box Writing (patient-communication bank). */
const LEGACY_MIN_WORDS = 40;
/** Two-part clinical Writing — per box. Listening single-response uses escalation min. */
export const WRITING_PART_MIN_WORDS = 25;
/**
 * Hard cap when text fails the substance floor (e.g. chart note = “thank you”).
 * Must stay very low — deterministic/LLM blend must not rescue empty/non-clinical text.
 */
export const WRITING_EMPTY_SUBSTANCE_CAP = 12;
/** Below this word count → automatic substance fail (unless richer clinical tokens somehow appear — still fail). */
export const WRITING_SUBSTANCE_MIN_WORDS = 8;

const COURTESY_ONLY =
  /^(thanks|thank\s*you|thx|ty|ok|okay|sure|yes|no|noted|got\s*it|will\s*do|sounds\s*good)[\s.!,]*$/i;

/** Lightweight clinical / ops tokens — absence + short courtesy text ⇒ non-clinical. */
const CLINICAL_OR_OPS_TOKEN =
  /\b(patient|pt\b|refill|rx|prescription|pharmacy|medication|meds?|dose|provider|doctor|clinician|chart|call(?:ed|back)?|voicemail|escalate|urgent|weekend|days?\s+left|controlled|stimulant|adderall|appointment|follow[\s-]?up|symptom|bp\b|vitals?|allergy|dob|mrn)\b/i;

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

export type WritingSubstanceAssessment = {
  ok: boolean;
  wordCount: number;
  reason: string;
};

/**
 * Substance floor: word count AND clinical/ops relevance — not length alone.
 * “thank you” / empty / courtesy-only → fail (trust-breaker fix from Listening review).
 */
export function assessWritingSubstance(text: string): WritingSubstanceAssessment {
  const trimmed = (text || "").trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  if (!trimmed || wordCount === 0) {
    return { ok: false, wordCount: 0, reason: "Empty response — no clinical documentation substance." };
  }
  if (COURTESY_ONLY.test(trimmed)) {
    return {
      ok: false,
      wordCount,
      reason: "Courtesy-only text (e.g. “thank you”) — not a clinical chart or provider note.",
    };
  }
  if (wordCount < WRITING_SUBSTANCE_MIN_WORDS) {
    return {
      ok: false,
      wordCount,
      reason: `Near-empty (${wordCount} words; need about ${WRITING_SUBSTANCE_MIN_WORDS}+ with clinical/ops content).`,
    };
  }
  if (!CLINICAL_OR_OPS_TOKEN.test(trimmed)) {
    return {
      ok: false,
      wordCount,
      reason: "No clinical/ops content detected — response does not look like chart or provider documentation.",
    };
  }
  return { ok: true, wordCount, reason: "Passes substance floor (length + clinical/ops signals)." };
}

function scoreLengthAndGrammar(text: string, minWords: number, noteLabel: string): WritingDeterministic {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = text.trim() ? words.length : 0;
  const meetsLength = wordCount >= minWords;
  const substance = assessWritingSubstance(text);
  const fake: SimMessage[] = [
    { who: "patient", text: "Please rewrite this workplace note." },
    { who: "you", text: text.trim() || "" },
  ];
  const fb = evaluateSimulatorSession(fake);
  const issues = fb.grammarIssues.map((g) => g.detail || g.kinds.join(", "));
  if (!substance.ok) {
    const score = Math.min(
      WRITING_EMPTY_SUBSTANCE_CAP,
      Math.round((wordCount / Math.max(minWords, 1)) * WRITING_EMPTY_SUBSTANCE_CAP),
    );
    return {
      wordCount,
      meetsLength: false,
      grammarScore: fb.grammarScore,
      issues: [...issues, substance.reason],
      score,
      note: `Deterministic (${noteLabel}) — substance floor failed: ${substance.reason} Score capped at ${WRITING_EMPTY_SUBSTANCE_CAP}/100.`,
    };
  }
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

/** Cap when LLM estimate is missing — never present deterministic-only as a full 100. */
export const WRITING_DETERMINISTIC_ONLY_CAP = 68;

export function blendWritingScore(
  deterministic: number,
  llm: number | null,
  opts?: { substanceOk?: boolean },
): {
  score: number;
  note: string;
  /** True when LLM estimate was unavailable — score is grammar/length only and capped. */
  partial: boolean;
} {
  const substanceOk = opts?.substanceOk !== false;
  if (!substanceOk) {
    const score = Math.min(deterministic, WRITING_EMPTY_SUBSTANCE_CAP);
    return {
      score,
      note: `Substance floor failed — score capped at ${WRITING_EMPTY_SUBSTANCE_CAP}/100. LLM estimate is not allowed to rescue empty or non-clinical text.`,
      partial: llm == null,
    };
  }
  if (llm == null) {
    const score = Math.min(deterministic, WRITING_DETERMINISTIC_ONLY_CAP);
    return {
      score,
      note: `Partial score — LLM content/coherence estimate unavailable. Reflects length/grammar only (capped at ${WRITING_DETERMINISTIC_ONLY_CAP}/100); not a full writing judgment.`,
      partial: true,
    };
  }
  return {
    score: Math.round(deterministic * 0.4 + llm * 0.6),
    note: "Combined: 40% deterministic (length + chat-register grammar) and 60% LLM content/coherence estimate. The LLM part is an estimate, not a certified grade.",
    partial: false,
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

/**
 * Soft check: Part B should signal an ask to the provider.
 * Accepts labeled asks ("please advise") and natural MA narrative closes
 * (e.g. keep you in the loop / reach out if you need / before next visit or refill).
 */
export function escalationLooksLikeAsk(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (
    /\b(please|ask|advise|review|confirm|clarify|guidance|recommend|can you|could you|would you)\b/i.test(t)
  ) {
    return true;
  }
  return (
    /\bkeep you in the loop\b/i.test(t) ||
    /\breach out if you need\b/i.test(t) ||
    /\bfeel free to reach out\b/i.test(t) ||
    /\blet me know\b/i.test(t) ||
    /\bhow (you'd|you would) like\b/i.test(t) ||
    /\bwhat you'd like us to\b/i.test(t) ||
    /\b(awaiting your|for your (review|guidance|decision))\b/i.test(t) ||
    /\bbefore your next (visit|refill)\b/i.test(t) ||
    /\bif anything else could be done\b/i.test(t)
  );
}

/**
 * Score a single Listening provider-message response (no chart half).
 * Applies substance floor + ask hint cap (no chart duplicate check).
 */
export function scoreListeningProviderMessage(args: {
  text: string;
  llmEstimate: number | null;
}): {
  score: number;
  det: WritingDeterministic;
  substance: WritingSubstanceAssessment;
  missingAsk: boolean;
  note: string;
  partial: boolean;
} {
  const det = scoreWritingPartDeterministic(args.text, "escalation");
  const substance = assessWritingSubstance(args.text);
  const blend = blendWritingScore(det.score, args.llmEstimate, { substanceOk: substance.ok });
  const missingAsk = !escalationLooksLikeAsk(args.text);
  let score = blend.score;
  const notes = [det.note, blend.note];
  if (substance.ok && missingAsk) {
    score = Math.min(score, WRITING_MISSING_ASK_PART_B_CAP);
    notes.push(
      `Provider message missing an explicit ask; capped at ${WRITING_MISSING_ASK_PART_B_CAP}.`,
    );
  }
  return {
    score,
    det,
    substance,
    missingAsk,
    note: notes.filter(Boolean).join(" "),
    partial: blend.partial,
  };
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
