/**
 * Heuristic session feedback for Chat Simulator (chat register).
 *
 * Grammar = competence (agreement, tense, garbled structure, wrong word) —
 * NOT casual-chat formatting (missing caps / end punctuation).
 *
 * Coherence gate (before Grammar + Relevance): replies that are unstructured
 * word-salad / not sentence-shaped score very low on both — keyword hits alone
 * must not look like “on-topic” or “perfect grammar.”
 *
 * LanguageTool is NOT wired yet (scoped separately). This scorer is the
 * interim chat-register rule set: formatting rigidity is explicitly off.
 *
 * Politeness = acknowledgment / helpfulness / warmth markers — not empathy,
 * and not exact-phrase-only.
 */

import {
  SCREENING_AS_DIAGNOSIS_LABEL,
  SCREENING_AS_DIAGNOSIS_REASON,
  isScreeningMisrepresentedAsDiagnosis,
  type SafetyReasonCode,
  type SessionOutcome,
} from "./safety";
import { estimateWpmFromWords, MAX_PLAUSIBLE_WPM } from "@/lib/level-up/wpm";

/** Expanded courtesy / tone stems — natural variations welcome. */
const POLITENESS_PHRASES = [
  "how may i help",
  "how can i help",
  "happy to help",
  "glad to help",
  "here to help",
  "thank you",
  "thanks for",
  "you're welcome",
  "you are welcome",
  "my pleasure",
  "been my pleasure",
  "have a great day",
  "take care",
  "i'm sorry",
  "im sorry",
  "sorry to hear",
  "so sorry",
  "sorry about",
  "i understand",
  "i hear you",
  "that makes sense",
  "appreciate",
  "of course",
  "no problem",
  "no worries",
  "how are you",
  "hope you're",
  "hope you are",
];

/** Soft acknowledgment / helpful tone markers (chat register). */
const ACK_MARKERS =
  /\b(okay|ok|sure|got it|alright|all right|i see|understood|thanks|thank you|sorry|appreciate|of course|absolutely|certainly|welcome)\b/i;

const HELP_MARKERS =
  /\b(help|can\b|let me|i('ll| will)|book|schedul|appoint|next step|here('s| is) what|timeline|process|provider|see what i can|first thing|same week|guaranteed)\b/i;

const WARM_GREETING = /\b(hi|hello|hey)\b.*\b(how are you|hope)\b|\bhow are you\b/i;

const CURT_MARKERS =
  /\b(whatever|not my problem|deal with it|figure it out yourself|stop bothering|get lost|go to hell)\b/i;

/**
 * Blaming / condescending / scolding toward the patient.
 * When present, politeness must drop even if a help/ack marker appears elsewhere.
 */
const DISMISSIVE_BLAMING_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\byou\s+should\s+have\b/i, label: "“you should have”" },
  { re: /\byou\s+should'?ve\b/i, label: "“you should've”" },
  { re: /\byou\s+should\s+know\b/i, label: "“you should know”" },
  { re: /\byou\s+ought\s+to\s+have\b/i, label: "“you ought to have”" },
  { re: /\b(that'?s|that\s+is)\s+your\s+fault\b/i, label: "“that's your fault”" },
  { re: /\bit'?s\s+your\s+fault\b/i, label: "“it's your fault”" },
  { re: /\bi\s+already\s+told\s+you\b/i, label: "“I already told you”" },
  { re: /\bi'?ve\s+already\s+told\s+you\b/i, label: "“I've already told you”" },
  { re: /\bas\s+i\s+(already\s+)?(said|told)\s+you\b/i, label: "“as I already said/told you”" },
  { re: /\bobviously\b/i, label: "“obviously”" },
  { re: /\bwhy\s+didn'?t\s+you\b/i, label: "“why didn't you”" },
  { re: /\bdon'?t\s+you\s+(know|understand)\b/i, label: "“don't you know/understand”" },
  { re: /\byou\s+need\s+to\s+understand\b/i, label: "“you need to understand”" },
  { re: /\bif\s+you\s+had\s+planned\b/i, label: "“if you had planned”" },
  { re: /\bplanned\s+ahead\s+of\s+(this|that)\b/i, label: "“planned ahead of this” (blame framing)" },
];

export const DISMISSIVE_BLAMING_TONE_LABEL =
  "tone: dismissive/blaming toward the patient";

/** Detect blaming/scolding constructions (deterministic tone check). */
export function detectDismissiveBlamingTone(text: string): string[] {
  const t = (text || "").trim();
  if (!t) return [];
  const hits: string[] = [];
  for (const { re, label } of DISMISSIVE_BLAMING_PATTERNS) {
    if (re.test(t)) hits.push(label);
  }
  return hits;
}

/**
 * Relevance / engagement — decision note
 * --------------------------------------
 * Judging “did you answer what they asked?” is meaning-level, not grammar.
 * We deliberately do **not** call an LLM here:
 *   - Feedback must stay sync (same path as grammar/politeness)
 *   - Known-bad cases (“ok sure”) must be deterministic in smoke/CI
 *   - No extra latency/API flake on the summary screen
 *
 * Instead: classify the *patient* turn’s ask type, then check whether the MA
 * reply is substantive and *shape-matched* (timeline → time-shaped content,
 * process → steps/process info, etc.). This is stronger than a keyword bag on
 * the MA reply alone, but it is still an **estimate** — not a full semantic judge.
 * Label the UI accordingly; upgrade path is a later LLM estimate in the same slot.
 */

export type PatientAskType =
  | "timeline"
  | "process"
  | "scheduling"
  | "clarification"
  | "emotional"
  | "general";

/** Filler / gaming non-answers when the patient asked something real. */
const GENERIC_NON_ANSWER =
  /^(ok|okay|sure|ok\s*sure|okay\s*sure|got it|alright|all right|yes|yep|yeah|no problem|no worries|sounds good|will do|noted|k|kk|thanks|thank you|cool|fine|great)[\s.!,]*$/i;

const ACK_ONLY_PREFIX =
  /^(ok(ay)?|sure|got it|alright|all right|yeah|yep|thanks|thank you)([\s,]+|$)/i;

export function classifyPatientAsk(patientText: string): PatientAskType {
  const t = (patientText || "").trim();
  if (!t) return "general";
  const lower = t.toLowerCase();

  if (
    /\b(how long|how soon|when (will|can|do|is)|timeline|how many (days|weeks)|wait|waiting|finals|by when|what'?s the (actual )?timeline|date)\b/i.test(
      t,
    )
  ) {
    return "timeline";
  }
  if (
    /\b(book|schedul|appoint|available|come in|slot|tomorrow|can we (do|make)|make it)\b/i.test(t) &&
    !/\bhow long\b/i.test(t)
  ) {
    return "scheduling";
  }
  if (
    /\b(what (exactly |do |is |does )|how does|step by step|process|renewal|agreement|neuropsych|testing|what do i do|explain)\b/i.test(
      t,
    ) ||
    /\bwhy (do|does|are|is)\b/i.test(t)
  ) {
    return "process";
  }
  if (
    /\b(what does that (even )?mean|doesn'?t make sense|i don'?t (understand|get)|clarify)\b/i.test(t)
  ) {
    return "clarification";
  }
  if (
    /\b(frustrated|scared|worried|stressed|falling apart|i can'?t|this is ridiculous)\b/i.test(t) &&
    !/\?/.test(t)
  ) {
    return "emotional";
  }
  if (/\?/.test(t) || /^(how|what|when|why|where|can|could|would|do|does|is|are)\b/i.test(lower)) {
    return "general";
  }
  return "emotional";
}

function wordCount(text: string): number {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function isGenericNonAnswer(reply: string): boolean {
  const t = (reply || "").trim();
  if (!t) return true;
  if (GENERIC_NON_ANSWER.test(t)) return true;
  // Short ack-only (“ok sure.” / “okay, sure”) with ≤4 words
  if (wordCount(t) <= 4 && ACK_ONLY_PREFIX.test(t) && !/\b(week|day|appoint|step|first|because|provider|test|book|schedul|timeline|\d)\b/i.test(t)) {
    return true;
  }
  return false;
}

function hasTimelineShape(reply: string): boolean {
  return /\b(\d+\s*[-–]?\s*\d*\s*(day|days|week|weeks|hour|hours|month|months)|same week|next week|this week|tomorrow|today|tonight|friday|monday|tuesday|wednesday|thursday|saturday|sunday|within\s+\d|by\s+(next|this|end)|timeline|1\s*[-–]\s*2\s*weeks?)\b/i.test(
    reply,
  );
}

function hasProcessShape(reply: string): boolean {
  return /\b(first|then|next|step|agreement|sign|intake|evaluat|neuropsych|test(ing)?|provider|process|here'?s what|go through|clinical history|controlled substance|renewal)\b/i.test(
    reply,
  );
}

function hasSchedulingShape(reply: string): boolean {
  return /\b(appoint|book|schedul|available|slot|tomorrow|come in|visit|pm\b|am\b|\d{1,2}\s*(:\d{2})?\s*(am|pm)?)\b/i.test(
    reply,
  );
}

function hasClarificationShape(reply: string): boolean {
  return (
    wordCount(reply) >= 10 &&
    /\b(mean|means|because|so that|it('s| is)|which is|that('s| is)|evaluat|test|check|look at|assess)\b/i.test(
      reply,
    )
  );
}

function hasEmotionalEngagement(reply: string): boolean {
  return (
    /\b(sorry|hear you|understand|makes sense|appreciate|tough|hard|with you)\b/i.test(reply) ||
    (wordCount(reply) >= 8 && HELP_MARKERS.test(reply))
  );
}

function shapeMatch(ask: PatientAskType, reply: string): boolean {
  switch (ask) {
    case "timeline":
      return hasTimelineShape(reply);
    case "process":
      return hasProcessShape(reply);
    case "scheduling":
      return hasSchedulingShape(reply);
    case "clarification":
      return hasClarificationShape(reply) || hasProcessShape(reply);
    case "emotional":
      return hasEmotionalEngagement(reply);
    case "general":
      return (
        hasTimelineShape(reply) ||
        hasProcessShape(reply) ||
        hasSchedulingShape(reply) ||
        (wordCount(reply) >= 12 && HELP_MARKERS.test(reply))
      );
    default:
      return false;
  }
}

export type RelevanceTurnResult = {
  askType: PatientAskType;
  patientExcerpt: string;
  replyExcerpt: string;
  /** 0–1 engagement for this turn */
  score: number;
  reason: string;
  /**
   * How the reply relates to the ask — used for UI framing.
   * `unrelated` = clearly off-topic (e.g. landmark trivia); not the same as weak-but-on-topic.
   */
  fit:
    | "on_topic"
    | "partial"
    | "weak_on_topic"
    | "unrelated"
    | "non_answer"
    | "thin"
    | "filler"
    | "empty"
    | "curt"
    | "incoherent";
  /** Trainee-facing explanation when score is low — plain language, not just the numeric score. */
  humanNote?: string;
  /** Typed-only: 3+ near-duplicate explanations in one turn (not a safety hit). */
  typedRepetition?: TypedContentRepetitionAssessment;
};

/**
 * Typed chat-sim only — substantial repeated explanations within one turn.
 * Threshold is 3+ similar segments (2 is allowed as confirm/clarity restatement).
 * Spoken mode must not use this (disfluency already handled separately).
 */
export type TypedContentRepetitionAssessment = {
  excessive: boolean;
  /** Size of the largest near-duplicate cluster (≥ 3 when excessive). */
  maxOccurrences: number;
  /** Short excerpt of the repeated material (when excessive). */
  phraseExcerpt?: string;
};

/** Bounded 0–1 Relevance deduction for typed excessive repetition (not a hard fail). */
export const TYPED_REPETITION_RELEVANCE_PENALTY = 0.18;

const REPETITION_MIN_CONTENT_WORDS = 6;
const REPETITION_SIMILARITY = 0.85;
const REPETITION_TRIGGER_COUNT = 3;

/** Short factual / confirmation language — not “explanations” for repetition scoring. */
const FACTUAL_ECHO_RE =
  /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|am|pm|a\.m\.|p\.m\.|january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}:\d{2}|\d{1,2}\/\d{1,2}|\d{4}|got\s+it|okay|ok|sure|thanks|thank\s+you|confirmed|confirm|noted|copied|understood)\b/i;

function normalizeForRepetitionCompare(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/\b(um+|uh+|er+|ah+|hmm+|huh+|mm+|mhm)\b/gi, " ")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contentWordsForRepetition(text: string): string[] {
  const stop = COHERENCE_FUNCTION_WORDS;
  return normalizeForRepetitionCompare(text)
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/'s$/, ""))
    .filter((w) => w.length > 2 && !stop.has(w) && !/^\d+$/.test(w));
}

function segmentForRepetition(text: string): string[] {
  const parts = (text || "").match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!parts) return text.trim() ? [text.trim()] : [];
  return parts.map((p) => p.trim()).filter(Boolean);
}

function tokenJaccard(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  const union = sa.size + sb.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * True for brief confirmations / time-date echoes — must not trigger repetition.
 * Genuine explanations are longer and not dominated by schedule tokens alone.
 */
export function isShortFactualEchoForRepetition(segment: string): boolean {
  const words = contentWordsForRepetition(segment);
  if (words.length < REPETITION_MIN_CONTENT_WORDS) return true;
  if (words.length <= 10) {
    const factualHits = words.filter((w) => FACTUAL_ECHO_RE.test(w)).length;
    if (factualHits / words.length >= 0.45) return true;
  }
  return false;
}

/**
 * Detect 3+ near-duplicate explanation segments in one typed reply.
 * Does not score stutter/filler (spoken) and ignores short factual restatements.
 */
export function assessTypedContentRepetition(text: string): TypedContentRepetitionAssessment {
  const segments = segmentForRepetition(text)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => !isShortFactualEchoForRepetition(s));

  if (segments.length < REPETITION_TRIGGER_COUNT) {
    return { excessive: false, maxOccurrences: segments.length ? 1 : 0 };
  }

  const tokens = segments.map((s) => contentWordsForRepetition(s));
  const clusterSize = new Array(segments.length).fill(1);
  const clusterRoot = segments.map((_, i) => i);

  function find(i: number): number {
    let r = i;
    while (clusterRoot[r] !== r) r = clusterRoot[r]!;
    return r;
  }
  function unite(a: number, b: number) {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return;
    clusterRoot[rb] = ra;
    clusterSize[ra] += clusterSize[rb]!;
  }

  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const ti = tokens[i]!;
      const tj = tokens[j]!;
      const lenRatio =
        Math.min(ti.length, tj.length) / Math.max(ti.length, tj.length || 1);
      if (lenRatio < 0.75) continue;
      if (tokenJaccard(ti, tj) >= REPETITION_SIMILARITY) unite(i, j);
    }
  }

  let maxOccurrences = 1;
  let bestRoot = 0;
  for (let i = 0; i < segments.length; i++) {
    if (find(i) !== i) continue;
    if (clusterSize[i]! > maxOccurrences) {
      maxOccurrences = clusterSize[i]!;
      bestRoot = i;
    }
  }

  if (maxOccurrences < REPETITION_TRIGGER_COUNT) {
    return { excessive: false, maxOccurrences };
  }

  return {
    excessive: true,
    maxOccurrences,
    phraseExcerpt: segments[bestRoot]!.slice(0, 96),
  };
}

function applyTypedRepetitionPenalty(
  result: RelevanceTurnResult,
  reply: string,
  inputModality?: "typed" | "spoken",
): RelevanceTurnResult {
  // Spoken: never — overlaps disfluency handling; would double-penalize.
  if (inputModality === "spoken") return result;
  // Only typed (or legacy messages with no modality = typed chat-sim).
  if (inputModality === undefined) {
    // treat as typed for classic chat-sim
  } else if (inputModality !== "typed") {
    return result;
  }

  const rep = assessTypedContentRepetition(reply);
  if (!rep.excessive) return { ...result, typedRepetition: rep };

  const nextScore = Math.max(0, Math.round((result.score - TYPED_REPETITION_RELEVANCE_PENALTY) * 100) / 100);
  return {
    ...result,
    score: nextScore,
    typedRepetition: rep,
    reason: `${result.reason} · repeated the same explanation ${rep.maxOccurrences}× in one reply (clarity)`,
  };
}

export const OFF_TOPIC_STYLE_SCORES_NOTE =
  "This reply didn't address what was asked — grammar/politeness scores below are not meaningful for an off-topic response.";

/** Display helper: de-emphasize Grammar/Politeness for clearly unrelated replies only. */
export function styleScoresDeemphasizedForTurn(
  turn: Pick<RelevanceTurnResult, "fit"> | null | undefined,
): boolean {
  return turn?.fit === "unrelated";
}

/**
 * Session summary: de-emphasize G/P only when replies are unrelated and none are
 * care-relevant (on-topic / partial / weak-on-topic). Weak incomplete answers do not qualify.
 */
export function styleScoresDeemphasizedForSession(turns: RelevanceTurnResult[]): boolean {
  if (!turns.length) return false;
  const hasUnrelated = turns.some((t) => t.fit === "unrelated");
  const hasCareRelevant = turns.some(
    (t) => t.fit === "on_topic" || t.fit === "partial" || t.fit === "weak_on_topic",
  );
  return hasUnrelated && !hasCareRelevant;
}

/** Care / clinic / ask-bridging tokens — marks weak-but-relevant vs pure digression. */
const CARE_DOMAIN_RE =
  /\b(provider|providers|doctor|clinician|appointment|appointments|timeline|medication|medications|meds|renewal|agreement|book|booking|schedul\w*|intake|process|review|advise|advice|finals|waiting\s+list|how\s+long|usually|typically|escalate|escalat\w*|clinical|neuropsych|prescription|refill|portal|care\s+team|follow[- ]?up|evaluation|assess(?:ment)?|screening|controlled\s+substance|(?:office|clinic|testing)\s+visit)\b/i;

const UNRELATED_DOMAIN_RE =
  /\b(eiffel|tower|paris|tourist|tourists|landmark|landmarks|museum|olympics|football|soccer|recipe|pizza|vacation|beach|weather forecast|movie|concert|celebrity)\b/i;

function contentLemmaTokens(text: string): Set<string> {
  const stop = COHERENCE_FUNCTION_WORDS;
  const out = new Set<string>();
  for (const w of coherenceTokens(text)) {
    const bare = w.replace(/'s$/, "");
    if (bare.length <= 2) continue;
    if (stop.has(bare)) continue;
    if (/^\d+$/.test(bare)) continue;
    out.add(bare);
  }
  return out;
}

function askReplyContentOverlap(patientText: string, reply: string): { overlap: number; ratio: number } {
  const ask = contentLemmaTokens(patientText);
  const rep = contentLemmaTokens(reply);
  if (ask.size === 0) return { overlap: 0, ratio: 0 };
  let overlap = 0;
  for (const t of ask) {
    if (rep.has(t)) overlap++;
  }
  return { overlap, ratio: overlap / ask.size };
}

/**
 * True when a substantive reply is a clear digression from the ask (not merely
 * incomplete / wrong-shape care talk).
 */
export function isClearlyUnrelatedToAsk(
  patientText: string,
  reply: string,
  askType: PatientAskType,
): boolean {
  if (shapeMatch(askType, reply)) return false;
  if (isGenericNonAnswer(reply)) return false;
  if (wordCount(reply) < 8) return false;
  if (CARE_DOMAIN_RE.test(reply)) return false;
  const { overlap, ratio } = askReplyContentOverlap(patientText, reply);
  if (UNRELATED_DOMAIN_RE.test(reply) && overlap < 2) return true;
  // No care bridge + almost no shared content with the ask
  if (overlap < 2 && ratio < 0.12) return true;
  return false;
}

const ASK_TYPE_PLAIN: Record<PatientAskType, string> = {
  timeline: "timeline / how-long question",
  process: "process / steps question",
  scheduling: "scheduling question",
  clarification: "clarification question",
  emotional: "emotional concern",
  general: "question",
};

/** Plain-language note for a weak relevance turn (for feedback UI). */
export function plainLanguageRelevanceNote(
  turn: Pick<RelevanceTurnResult, "askType" | "score" | "reason" | "fit">,
  turnIndex: number,
): string | undefined {
  const ask = ASK_TYPE_PLAIN[turn.askType] || "question";
  const turnLabel = `turn ${turnIndex + 1}`;
  // Clarity note even when score stays mid/high after a bounded penalty
  if (turn.reason.toLowerCase().includes("repeated the same explanation")) {
    return `Reply ${turnLabel} repeated the same explanation multiple times — say it once clearly (a short time/date confirmation is fine; restating the whole answer 3+ times hurts clarity).`;
  }
  if (turn.score >= 0.5) return undefined;
  if (turn.fit === "unrelated" || turn.reason.toLowerCase().includes("unrelated to the ask")) {
    return `Reply ${turnLabel} was unrelated to the patient's ${ask} — off-topic content, not a weak/incomplete answer.`;
  }
  if (turn.reason.toLowerCase().includes("empty")) {
    return `You left reply ${turnLabel} empty — nothing addressed the patient's ${ask}.`;
  }
  if (
    turn.reason.toLowerCase().includes("coherent sentence") ||
    turn.reason.toLowerCase().includes("word-salad") ||
    turn.reason.toLowerCase().includes("incoherent")
  ) {
    return `Reply ${turnLabel} does not form a coherent sentence — relevance cannot treat keyword hits as an answer to the patient's ${ask}.`;
  }
  if (turn.reason.toLowerCase().includes("generic non-answer")) {
    return `You didn't directly answer the ${ask} the patient asked on ${turnLabel} (reply was a generic non-answer like “ok/sure/thanks”).`;
  }
  if (turn.fit === "weak_on_topic" || turn.reason.toLowerCase().includes("weak") || turn.reason.toLowerCase().includes("incomplete")) {
    return `You didn't fully answer the ${ask} the patient asked on ${turnLabel} — the reply was on-topic but weak or incomplete for what they asked.`;
  }
  if (turn.reason.toLowerCase().includes("not") && turn.reason.toLowerCase().includes("shaped")) {
    return `You didn't directly answer the ${ask} the patient asked on ${turnLabel} — your reply was substantive but off-shape for what they asked.`;
  }
  if (turn.reason.toLowerCase().includes("thin") || turn.reason.toLowerCase().includes("off-shape")) {
    return `You didn't directly answer the ${ask} the patient asked on ${turnLabel} — the reply was too thin or off-shape.`;
  }
  if (turn.reason.toLowerCase().includes("filler")) {
    return `You didn't directly answer the ${ask} the patient asked on ${turnLabel} — filler acknowledgment without answering the ask.`;
  }
  return `You didn't directly answer the ${ask} the patient asked on ${turnLabel}. (${turn.reason})`;
}

/**
 * Score one MA reply against the preceding patient turn.
 * Returns 0–1. Exported for smokes / demos.
 *
 * @param opts.inputModality — typed (default) may apply bounded repetition penalty;
 *   spoken never does (disfluency already handled for grammar).
 */
export function scoreRelevanceTurn(
  patientText: string,
  maReply: string,
  opts?: { inputModality?: "typed" | "spoken" },
): RelevanceTurnResult {
  const askType = classifyPatientAsk(patientText);
  const reply = (maReply || "").trim();
  const patientExcerpt = (patientText || "").trim().slice(0, 72);
  const replyExcerpt = reply.slice(0, 72);

  const base = (
    score: number,
    reason: string,
    fit: RelevanceTurnResult["fit"],
  ): RelevanceTurnResult => ({
    askType,
    patientExcerpt,
    replyExcerpt,
    score,
    reason,
    fit,
  });

  if (!reply) {
    return applyTypedRepetitionPenalty(base(0, "Empty reply", "empty"), reply, opts?.inputModality);
  }
  const coherence = assessReplyCoherence(reply);
  if (!coherence.coherent) {
    return applyTypedRepetitionPenalty(
      base(0, coherence.reason, "incoherent"),
      reply,
      opts?.inputModality,
    );
  }
  if (CURT_MARKERS.test(reply)) {
    return applyTypedRepetitionPenalty(
      base(0, "Dismissive / curt — not engaged", "curt"),
      reply,
      opts?.inputModality,
    );
  }
  if (isGenericNonAnswer(reply)) {
    return applyTypedRepetitionPenalty(
      base(0, "Generic non-answer (e.g. “ok sure”) — does not address the ask", "non_answer"),
      reply,
      opts?.inputModality,
    );
  }

  const substantive = wordCount(reply) >= 8;
  const matched = shapeMatch(askType, reply);
  const fillerLead =
    /^(ok(ay)?(\s+sure)?|sure|got it|alright|all right)[\s,!.]+/i.test(reply) && !matched;

  // “okay sure, …” that never answers the ask — treat as gaming / non-engagement
  if (fillerLead && !matched) {
    return applyTypedRepetitionPenalty(
      base(
        substantive ? 0.2 : 0,
        "Filler ack without answering the ask (e.g. “ok sure” + off-topic)",
        "filler",
      ),
      reply,
      opts?.inputModality,
    );
  }

  // Greeting-only / thin ack with a trailing half-question still weak for a real ask
  if (!substantive && !matched) {
    return applyTypedRepetitionPenalty(
      base(0.15, "Too thin / off-shape for this ask type", "thin"),
      reply,
      opts?.inputModality,
    );
  }
  if (matched && substantive) {
    return applyTypedRepetitionPenalty(
      base(1, `On-topic ${askType}-shaped answer`, "on_topic"),
      reply,
      opts?.inputModality,
    );
  }
  if (matched && !substantive) {
    return applyTypedRepetitionPenalty(
      base(0.55, `Partially ${askType}-shaped but thin`, "partial"),
      reply,
      opts?.inputModality,
    );
  }

  // Substantive but wrong shape — split clear digression from weak care-related replies
  if (isClearlyUnrelatedToAsk(patientText, reply, askType)) {
    return applyTypedRepetitionPenalty(
      base(
        0.08,
        `Unrelated to the ask (off-topic) — not a ${askType}-shaped answer`,
        "unrelated",
      ),
      reply,
      opts?.inputModality,
    );
  }
  return applyTypedRepetitionPenalty(
    base(
      0.35,
      `On-topic but weak/incomplete for this ${askType} ask (not fully ${askType}-shaped)`,
      "weak_on_topic",
    ),
    reply,
    opts?.inputModality,
  );
}

export type SimMessage = {
  who: "you" | string;
  text: string;
  startedAt?: number;
  sentAt?: number;
  /** How the MA entered this reply (spoken = STT → edit → submit). */
  inputModality?: "typed" | "spoken";
  /** Raw cloud STT before MA edit — Ops audit only; never used for scoring. */
  sttRaw?: string;
  sttProvider?: string;
};

/** Pair each MA reply with the nearest preceding patient turn; average 0–100. */
export function scoreRelevanceSession(messages: SimMessage[]): {
  score: number;
  turns: RelevanceTurnResult[];
  note: string;
} {
  const turns: RelevanceTurnResult[] = [];
  let lastPatient = "";
  for (const m of messages) {
    if (m.who === "you") {
      if (!lastPatient) {
        // No patient context yet — score low-neutral if they spoke first
        turns.push({
          askType: "general",
          patientExcerpt: "",
          replyExcerpt: (m.text || "").slice(0, 72),
          score: isGenericNonAnswer(m.text || "") ? 0 : Math.min(0.5, wordCount(m.text || "") >= 8 ? 0.5 : 0.2),
          reason: "No preceding patient ask",
          fit: isGenericNonAnswer(m.text || "") ? "non_answer" : "thin",
        });
        continue;
      }
      turns.push(
        scoreRelevanceTurn(lastPatient, m.text || "", {
          inputModality: m.inputModality,
        }),
      );
    } else {
      lastPatient = m.text || "";
    }
  }
  const n = turns.length;
  const scoredTurns = turns.map((t, i) => {
    const humanNote = plainLanguageRelevanceNote(t, i);
    return humanNote ? { ...t, humanNote } : t;
  });
  const score = n > 0 ? Math.round((scoredTurns.reduce((s, t) => s + t.score, 0) / n) * 100) : 0;
  const weakNotes = scoredTurns.map((t) => t.humanNote).filter(Boolean) as string[];
  const plainSummary =
    weakNotes.length > 0
      ? ` Low-relevance detail: ${weakNotes.slice(0, 2).join(" ")}`
      : "";
  return {
    score,
    turns: scoredTurns,
    note:
      "Relevance / engagement (estimate) — checks whether each reply is substantive and shape-matched to what the patient just asked (timeline → time-shaped, process → steps, etc.). Not a full meaning judge / LLM. Incoherent / word-salad replies score 0 (coherence gate). Generic non-answers like “ok sure” score low. Does not measure clinical correctness (see safety tiers)." +
      plainSummary,
  };
}

export type GrammarIssueKind =
  | "empty"
  | "incoherent_or_word_salad"
  | "subject_verb_disagreement"
  | "wrong_word_or_typo"
  | "garbled_or_unclear"
  | "wrong_tense"
  | "esl_collocation"
  | "relevance_floor_cross_check";

export const INCOHERENT_REPLY_LABEL =
  "Response does not form a coherent sentence — cannot be scored as normal Grammar/Relevance.";

/**
 * Lightweight English function-word set for coherence heuristics.
 * Used only to detect unstructured word lists — not a full POS tagger.
 */
const COHERENCE_FUNCTION_WORDS = new Set(
  (
    "a an the to for of in on at with by from as that this these those and or but if so because than then " +
    "about into over after before between within your my our their his her its you i we they he she it me us them " +
    "am is are was were be been being do does did have has had can could will would shall should may might must " +
    "not no yes ok okay sure how what when where why who which there here also just only very really actually " +
    "typically usually normally generally first next then please somehow something someone anything anyone " +
    "everything everyone else own same such each every few more most other some any both while during until " +
    "unless whether whose whom across against among behind below beside beyond inside outside toward towards " +
    "under upon via per " +
    // Common contractions — keep SVA / casual chat from looking like content-word runs
    "i'm you're we're they're he's she's it's that's what's who's where's there's here's let's " +
    "don't doesn't didn't can't couldn't won't wouldn't shouldn't haven't hasn't hadn't " +
    "aren't isn't wasn't weren't ain't"
  ).split(/\s+/),
);

function coherenceTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/^'+|'+$/g, ""));
}

/** Recognizable clause / chat-sentence skeleton (subject+aux, WH+aux, MA openers, etc.). */
function hasClauseSkeleton(text: string): boolean {
  const t = text;
  if (
    /\b(i|we|you|they|he|she|it)\s+(am|is|are|was|were|do|does|did|have|has|had|can|could|will|would|should|may|might|must|need|want|think|see|get|got|don'?t|doesn'?t|can'?t|won'?t|'m|'re|'ll|'ve)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/\b(this|that|there|it)\s+(is|are|was|were|can|will|would|could|takes?|means?|might|should)\b/i.test(t)) {
    return true;
  }
  if (/\b(how|what|when|where|who|why)\s+(are|is|do|does|did|can|will|would|am|have|has)\b/i.test(t)) {
    return true;
  }
  if (/\b(can|will|could|would|should)\s+(you|we|i|it|they)\b/i.test(t)) return true;
  if (/\b(let me|here'?s|first thing|how (may|can) i|thank you|sorry to|happy to|glad to)\b/i.test(t)) {
    return true;
  }
  if (/\b(typically|usually|normally|generally)\b/i.test(t) && /\b(can|will|is|are|have|get|takes?)\b/i.test(t)) {
    return true;
  }
  if (/\b\w+\s+is\s+\w+/i.test(t) && /\b(the|a|an|your|our|to|for|with)\b/i.test(t)) return true;
  if (/\b(okay|ok|sure|alright|all right)\b/i.test(t) && coherenceTokens(t).length <= 14) return true;
  if (
    /^(um+|uh+|er+)?\s*(i|we|let|please|sure|okay|ok|hi|hello|hey|thank|sorry|first|typically|usually)\b/i.test(
      t.trim(),
    )
  ) {
    return true;
  }
  return false;
}

function maxContentWordRun(words: string[]): number {
  let max = 0;
  let run = 0;
  for (const w of words) {
    const bare = w.replace(/'s$/, "");
    if (!COHERENCE_FUNCTION_WORDS.has(bare) && !/^\d+$/.test(bare)) {
      run++;
      max = Math.max(max, run);
    } else {
      run = 0;
    }
  }
  return max;
}

/** Deterministic word-salad / jumbled-order markers (cheap; not a parser). */
function wordSaladPatternHits(text: string): string[] {
  const hits: string[] = [];
  const pats: Array<{ re: RegExp; label: string }> = [
    {
      re: /\b(can|could|will|would|should|may|might|must)\s+(some|any|hours?|days?|weeks?|months?|finals?)\b/i,
      label: "modal stuck to a noun/time word (not a verb phrase)",
    },
    {
      re: /\b(hours?|days?|weeks?)\s+(hours?|days?|weeks?)\b/i,
      label: "stacked time nouns without sentence glue",
    },
    {
      re: /\b(what|where|how|why)\s+(mean|find|take|get|see)\s+(do|find|where|mean|take|what)\b/i,
      label: "question-word + verb jumble",
    },
    {
      re: /\b(mean|find|take|get)\s+(do|find|where|mean)\s+(where|find|do|what|mean)\b/i,
      label: "verb-verb word salad",
    },
  ];
  for (const { re, label } of pats) {
    if (re.test(text)) hits.push(label);
  }
  return hits;
}

export type ReplyCoherenceAssessment = {
  coherent: boolean;
  /** Trainee-facing reason when incoherent. */
  reason: string;
  /** Debug / calibration flags. */
  flags: string[];
};

/**
 * Basic well-formedness gate: does this look like actual sentence(s), or an
 * unstructured keyword list? Deterministic — catches word-salad without a parser.
 * Short acks (“ok sure”) pass; normal MA chat sentences pass; jumbled topic words fail.
 */
export function assessReplyCoherence(text: string): ReplyCoherenceAssessment {
  const raw = (text || "").trim();
  if (!raw) {
    return {
      coherent: false,
      reason: INCOHERENT_REPLY_LABEL,
      flags: ["empty"],
    };
  }
  // Grammar path already strips um/uh; use the same view for fairness.
  // Also strip markdown bold/italic so clinical templates aren't scored as salad.
  const strippedMd = (normalizeSpeechDisfluencyForGrammar(raw) || raw)
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1");
  const t = strippedMd.trim() || raw;
  const words = coherenceTokens(t);
  if (words.length === 0) {
    return { coherent: false, reason: INCOHERENT_REPLY_LABEL, flags: ["empty"] };
  }

  // Very short replies (acks, thanks) are not word-salad.
  if (words.length <= 4) {
    return { coherent: true, reason: "Short reply", flags: [] };
  }

  const skeleton = hasClauseSkeleton(t);
  const contentRun = maxContentWordRun(words);
  const saladHits = wordSaladPatternHits(t);
  const funcCount = words.filter((w) => COHERENCE_FUNCTION_WORDS.has(w.replace(/'s$/, ""))).length;
  const funcRatio = funcCount / words.length;
  const flags: string[] = [];
  if (!skeleton) flags.push("no clause skeleton");
  if (contentRun >= 4) flags.push(`long content-word run (${contentRun})`);
  if (funcRatio < 0.28) flags.push(`low function-word density (${funcRatio.toFixed(2)})`);
  for (const h of saladHits) flags.push(h);

  // Strong salad evidence
  if (saladHits.length >= 2) {
    return { coherent: false, reason: INCOHERENT_REPLY_LABEL, flags };
  }

  // Medium replies: fail only with salad n-gram or long content run and no skeleton
  if (words.length <= 7) {
    if (!skeleton && (saladHits.length >= 1 || contentRun >= 4)) {
      return { coherent: false, reason: INCOHERENT_REPLY_LABEL, flags };
    }
    return { coherent: true, reason: "Acceptable short/medium sentence shape", flags: [] };
  }

  if (!skeleton && (saladHits.length >= 1 || contentRun >= 4 || funcRatio < 0.28)) {
    return { coherent: false, reason: INCOHERENT_REPLY_LABEL, flags };
  }
  if (!skeleton && words.length >= 10 && funcRatio < 0.35) {
    return { coherent: false, reason: INCOHERENT_REPLY_LABEL, flags };
  }

  return {
    coherent: true,
    reason: skeleton ? "Recognizable sentence shape" : "Acceptable phrase structure",
    flags: [],
  };
}

export type GrammarIssue = {
  messageIndex: number;
  kinds: GrammarIssueKind[];
  excerpt: string;
  detail?: string;
};

/** Common chat typos / wrong-word forms that hurt clarity. */
const TYPO_OR_WRONG_WORD: Array<{ re: RegExp; detail: string }> = [
  { re: /\byouo\b/i, detail: "Typo: “youo” → “you”" },
  { re: /\bteh\b/i, detail: "Typo: “teh” → “the”" },
  { re: /\badn\b/i, detail: "Typo: “adn” → “and”" },
  { re: /\bwoudl\b/i, detail: "Typo: “woudl” → “would”" },
  { re: /\brecieve\b/i, detail: "Typo: “recieve” → “receive”" },
  { re: /\binital\b/i, detail: "Typo: “inital” → “initial”" },
  { re: /\badral\b/i, detail: "Likely misspelling of “Adderall”" },
  { re: /\btou have\b/i, detail: "Typo: “tou have” → “you have”" },
  { re: /\bcan;'?t\b/i, detail: "Garbled contraction — use “can’t”" },
  { re: /\bappart?ment\b/i, detail: "Wrong word/typo for “appointment”" },
  {
    re: /\bare you showing (for|up)?\s*(the\s+)?first\s+time\b/i,
    detail: "Wrong/unclear wording — likely “Is this your first time seeing us?” / “Have you been seen here before?”",
  },
  {
    re: /\bshowing for the first time\b/i,
    detail: "Wrong/unclear wording — “showing” is not standard for a first visit",
  },
];

/**
 * High-frequency ESL / collocation errors from live audit (2026-09).
 * These are real mistakes human reviewers catch that the thin typo list missed.
 */
const ESL_COLLOCATION: Array<{ re: RegExp; detail: string }> = [
  {
    re: /\bshare me\b/i,
    detail: "ESL collocation: “share me” → “share with me” / “share your …”",
  },
  {
    re: /\bhelp you\s+(scheduling|booking|getting|filling|completing|doing)\b/i,
    detail: "ESL collocation: “help you scheduling” → “help you schedule” (bare infinitive)",
  },
  {
    re: /\b(review|providers?'?\s+review)\s+and\s+advise\b/i,
    detail: "Wrong word form: “advise” (verb) → “advice” (noun) in “review and advice”",
  },
  {
    re: /\bcontrol substance\b/i,
    detail: "Wrong form: “control substance” → “controlled substance”",
  },
  {
    re: /\bthank you to thank you\b/i,
    detail: "Unclear / repeated phrasing — “Thank you for …”",
  },
  {
    re: /\bnear by\b/i,
    detail: "Prefer “nearby” (one word) as an adjective",
  },
  {
    re: /\bappointment done the\b/i,
    detail: "Missing verb: “once the appointment is done, the …”",
  },
  {
    re: /\btake a free screening to diagnose\b/i,
    detail: "Unclear clinical English — screenings do not “diagnose”; prefer “screening to help assess …”",
  },
];

/** Gerund/noun subject with mismatched plural verb, e.g. “getting medications aren't”. */
const SVA_PATTERNS: Array<{ re: RegExp; detail: string }> = [
  {
    re: /\b(getting|booking|taking|renewing|ordering)\s+[\w-]+(?:\s+[\w-]+)?\s+(aren't|are not)\b/i,
    detail: "Subject–verb disagreement (gerund subject needs singular verb, e.g. “isn’t”)",
  },
  {
    re: /\b(this|that|it)\s+(are|aren't)\b/i,
    detail: "Subject–verb disagreement (singular subject with plural verb)",
  },
  {
    re: /\b(these|those|they)\s+(is|isn't|was)\b/i,
    detail: "Subject–verb disagreement (plural subject with singular verb)",
  },
  {
    re: /\bmedications?\s+aren't\s+guaranteed\b/i,
    detail: "Prefer “medication isn’t guaranteed” / “medications aren’t guaranteed” with a matching subject",
  },
];

/**
 * Strip natural speech disfluency before grammar checks only.
 * Does not change the submitted text used for politeness / relevance / safety.
 * Fillers left in the transcript must not count as writing errors.
 */
export function normalizeSpeechDisfluencyForGrammar(text: string): string {
  let t = (text || "").trim();
  if (!t) return t;
  // Standalone fillers / hesitation markers
  t = t.replace(/\b(um+|uh+|er+|ah+|hmm+|huh+|mm+|mhm)\b[,.]?/gi, " ");
  // Self-correction stutter: "I I can" / "the the appointment"
  t = t.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");
  return t.replace(/\s+/g, " ").trim();
}

function grammarIssuesFor(text: string): { kinds: GrammarIssueKind[]; detail?: string } {
  const raw = text.trim();
  if (!raw) return { kinds: ["empty"], detail: "Empty message" };

  // Score grammar on disfluency-normalized text so um/uh/repeats are not writing errors.
  const t = normalizeSpeechDisfluencyForGrammar(raw) || raw;

  const kinds: GrammarIssueKind[] = [];
  const details: string[] = [];

  // Coherence gate first — word-salad is not “perfect grammar.”
  const coherence = assessReplyCoherence(raw);
  if (!coherence.coherent) {
    return {
      kinds: ["incoherent_or_word_salad"],
      detail: INCOHERENT_REPLY_LABEL,
    };
  }

  // Chat register: do NOT flag missing capitalization or end punctuation.

  for (const { re, detail } of TYPO_OR_WRONG_WORD) {
    if (re.test(t)) {
      kinds.push("wrong_word_or_typo");
      details.push(detail);
      break;
    }
  }

  for (const { re, detail } of ESL_COLLOCATION) {
    if (re.test(t)) {
      kinds.push("esl_collocation");
      details.push(detail);
      break;
    }
  }

  for (const { re, detail } of SVA_PATTERNS) {
    if (re.test(t)) {
      kinds.push("subject_verb_disagreement");
      details.push(detail);
      break;
    }
  }

  // Specific SVA in this training corpus: “getting medications aren't”
  if (/\bgetting\s+medications?\s+aren'?t\b/i.test(t)) {
    if (!kinds.includes("subject_verb_disagreement")) kinds.push("subject_verb_disagreement");
    details.push("“getting medications aren’t” → “getting medication isn’t” / “medications aren’t”");
  }

  // Garbled: mostly non-words, or collapsed nonsense (very short + no vowels pattern)
  // Ignore leftover filler tokens if any slipped through.
  const words = t.split(/\s+/).filter(Boolean);
  const weird = words.filter((w) => /^[a-z]{4,}$/i.test(w) && !/[aeiou]/i.test(w));
  if (weird.length >= 2) {
    kinds.push("garbled_or_unclear");
    details.push("Multiple unusual spellings — sentence may be unclear");
  }

  return { kinds: [...new Set(kinds)], detail: details[0] };
}

/** Exported for smokes — same rules as session grammar scoring. */
export function grammarIssuesForMessage(text: string): { kinds: GrammarIssueKind[]; detail?: string } {
  return grammarIssuesFor(text);
}

/** True when the message shows courtesy / helpful chat tone (forgiving). */
export function isPoliteMessage(text: string): boolean {
  const t = (text || "").trim();
  if (!t) return false;
  if (CURT_MARKERS.test(t)) return false;
  // Blaming/scolding overrides any courtesy or help marker in the same reply.
  if (detectDismissiveBlamingTone(t).length > 0) return false;
  const lower = t.toLowerCase();
  if (POLITENESS_PHRASES.some((p) => lower.includes(p))) return true;
  if (WARM_GREETING.test(t)) return true;
  // Acknowledgment alone (“okay so sorry…”) or ack + help both count
  if (ACK_MARKERS.test(t)) return true;
  if (HELP_MARKERS.test(t) && !CURT_MARKERS.test(t)) return true;
  return false;
}

/**
 * Which politeness / tone signals fired (for calibration + feedback inspection).
 * Dismissive/blaming flags are listed even when positive markers also match —
 * scoring treats blame as an override.
 */
export function detectPolitenessMarkers(text: string): string[] {
  const t = (text || "").trim();
  if (!t) return [];
  const hits: string[] = [];
  if (CURT_MARKERS.test(t)) {
    hits.push("curt/dismissive marker (blocks politeness)");
  }
  const blame = detectDismissiveBlamingTone(t);
  const lower = t.toLowerCase();
  for (const p of POLITENESS_PHRASES) {
    if (lower.includes(p)) hits.push(`phrase: “${p}”`);
  }
  if (WARM_GREETING.test(t)) hits.push("warm greeting pattern");
  if (ACK_MARKERS.test(t)) hits.push("acknowledgment marker");
  if (HELP_MARKERS.test(t)) hits.push("helpfulness marker");
  for (const label of blame) {
    hits.push(`${DISMISSIVE_BLAMING_TONE_LABEL} — ${label}`);
  }
  if (blame.length > 0) {
    hits.push("(blame/scolding overrides courtesy/helpfulness markers for the Politeness score)");
  }
  return hits;
}

/** Per-message politeness 0–100 with explicit tone flags (used by calibration + session mean). */
export function scorePolitenessMessage(text: string): {
  score: number;
  isPolite: boolean;
  markers: string[];
  toneFlags: string[];
} {
  const markers = detectPolitenessMarkers(text);
  const toneFlags = detectDismissiveBlamingTone(text);
  if (!text.trim()) {
    return { score: 0, isPolite: false, markers, toneFlags };
  }
  if (CURT_MARKERS.test(text) || toneFlags.length > 0) {
    // Meaningfully low — not rescued by help/ack markers elsewhere in the reply.
    return { score: 0, isPolite: false, markers, toneFlags };
  }
  const polite = isPoliteMessage(text);
  return { score: polite ? 100 : 0, isPolite: polite, markers, toneFlags };
}

export type ClinicalAccuracyHit = {
  /** Index among MA replies (same order as relevanceTurns). */
  replyIndex: number;
  label: string;
  replyExcerpt: string;
};

export type SimulatorFeedback = {
  /** @deprecated use politenessScore */
  empathyScore: number;
  politenessScore: number;
  politenessNote: string;
  grammarScore: number;
  grammarNote: string;
  grammarIssues: GrammarIssue[];
  relevanceScore: number;
  relevanceNote: string;
  relevanceTurns: RelevanceTurnResult[];
  /** Reliable average only; 0 when timing is unusable. */
  avgWpm: number;
  wpmReliable: boolean;
  /** Uncapped average before sanity gate. */
  rawAvgWpm: number;
  /** True when any MA reply was spoken (WPM n/a — show honesty copy instead). */
  spokenSession: boolean;
  messageCount: number;
  grammarErrorCount: number;
  accuracyNote: string;
  /** Moderate clinical-accuracy hits — not Relevance, not a hard stop. */
  clinicalAccuracyHits: ClinicalAccuracyHit[];
  outcome: SessionOutcome;
  redFlagged: boolean;
  safetyReasons: SafetyReasonCode[];
  safetyNotes: string[];
  /**
   * Full conversation for exam/Ops audit (set by chat UI after evaluate).
   * Spoken turns should include sttRaw when available.
   */
  transcript?: import("@/lib/level-up/progress").ChatSimTranscriptTurn[];
  transcriptVersion?: 1;
  /** True when grammar was capped because session relevance was near-floor. */
  grammarCappedForLowRelevance?: boolean;
};

export function evaluateSimulatorSession(
  messages: SimMessage[],
  opts?: {
    outcome?: SessionOutcome;
    redFlagged?: boolean;
    safetyReasons?: SafetyReasonCode[];
    safetyNotes?: string[];
  },
): SimulatorFeedback {
  const ma = messages.filter((m) => m.who === "you");
  let politeCount = 0;
  let grammarOkCount = 0;
  let totalWords = 0;
  let totalMinutes = 0;
  let grammarErrorCount = 0;
  const grammarIssues: GrammarIssue[] = [];

  ma.forEach((msg, messageIndex) => {
    const polite = scorePolitenessMessage(msg.text || "");
    if (polite.isPolite) politeCount++;
    const { kinds, detail } = grammarIssuesFor(msg.text || "");
    if (kinds.length === 0) grammarOkCount++;
    else {
      grammarErrorCount++;
      grammarIssues.push({
        messageIndex,
        kinds,
        excerpt: (msg.text || "").trim().slice(0, 80),
        detail,
      });
    }
    // Pace from first keystroke → send only (caller must not stamp startedAt on focus alone).
    if (msg.startedAt != null && msg.sentAt != null && msg.sentAt > msg.startedAt) {
      const words = (msg.text || "").trim().split(/\s+/).filter(Boolean).length;
      const elapsedSec = (msg.sentAt - msg.startedAt) / 1000;
      const perMsg = estimateWpmFromWords(words, elapsedSec);
      // Only accumulate samples that pass the same per-message sanity gate.
      if (perMsg.reliable && elapsedSec > 0) {
        totalWords += words;
        totalMinutes += elapsedSec / 60;
      }
    }
  });

  const n = ma.length;
  const politenessScore = n > 0 ? Math.round((politeCount / n) * 100) : 0;
  let grammarScore = n > 0 ? Math.round((grammarOkCount / n) * 100) : 0;
  const relevance = scoreRelevanceSession(messages);

  // Per-turn: near-floor relevance → grammar cannot stay "perfect" on that reply.
  const RELEVANCE_TURN_NEAR_FLOOR = 0.25;
  relevance.turns.forEach((turn, messageIndex) => {
    if (turn.score > RELEVANCE_TURN_NEAR_FLOOR) return;
    if (messageIndex < 0 || messageIndex >= ma.length) return;
    if (grammarIssues.some((g) => g.messageIndex === messageIndex)) return;
    const msg = ma[messageIndex]!;
    grammarErrorCount++;
    grammarOkCount = Math.max(0, grammarOkCount - 1);
    grammarIssues.push({
      messageIndex,
      kinds: ["relevance_floor_cross_check"],
      excerpt: (msg.text || "").trim().slice(0, 80),
      detail:
        "Relevance near-floor on this turn — grammar cannot stay perfect when the reply barely engaged the ask",
    });
  });
  grammarScore = n > 0 ? Math.round((grammarOkCount / n) * 100) : 0;

  // Session-level safety: if relevance is still near-floor and grammar looks excellent, cap it.
  const RELEVANCE_SESSION_NEAR_FLOOR = 25;
  const GRAMMAR_CAP_WHEN_RELEVANCE_NEAR_FLOOR = 70;
  let grammarCappedForLowRelevance = false;
  if (relevance.score <= RELEVANCE_SESSION_NEAR_FLOOR && grammarScore >= 95) {
    grammarScore = Math.min(grammarScore, GRAMMAR_CAP_WHEN_RELEVANCE_NEAR_FLOOR);
    grammarCappedForLowRelevance = true;
  }

  const clinicalAccuracyHits: ClinicalAccuracyHit[] = ma.flatMap((msg, replyIndex) =>
    isScreeningMisrepresentedAsDiagnosis(msg.text || "")
      ? [
          {
            replyIndex,
            label: SCREENING_AS_DIAGNOSIS_LABEL,
            replyExcerpt: (msg.text || "").trim().slice(0, 120),
          },
        ]
      : [],
  );
  const safetyReasons = [
    ...new Set([
      ...(opts?.safetyReasons ?? []),
      ...(clinicalAccuracyHits.length ? [SCREENING_AS_DIAGNOSIS_REASON] : []),
    ]),
  ];
  const safetyNotes = [
    ...new Set([
      ...(opts?.safetyNotes ?? []),
      ...(clinicalAccuracyHits.length ? [SCREENING_AS_DIAGNOSIS_LABEL] : []),
    ]),
  ];
  const spokenSession = ma.some((m) => m.inputModality === "spoken");
  const rawAvg = totalMinutes > 0 ? totalWords / totalMinutes : 0;
  const avgEst =
    !spokenSession && totalMinutes > 0
      ? estimateWpmFromWords(totalWords, totalMinutes * 60)
      : { wpm: 0, reliable: false, rawWpm: 0, reason: "no_sample" as const };

  const baseGrammarNote = spokenSession
    ? "Grammar (chat register) — scores the raw cloud transcription (no edit step). Natural speech fillers (um/uh) and simple self-corrections are not writing errors. Incoherent word-salad scores 0 (coherence gate). Does not score pronunciation or fluency."
    : "Grammar (chat register) — flags real issues (agreement, wrong word/typo, ESL collocations, unclear wording) plus a basic coherence gate (word-salad / non-sentences score 0). Missing caps/periods are not scored. Does not score relevance or substance. LanguageTool formal checks are not wired yet.";
  const grammarNote = grammarCappedForLowRelevance
    ? `${baseGrammarNote} Cross-check: grammar capped because session relevance was near-floor (≤25) — a perfect grammar score is not allowed when replies barely engaged the ask.`
    : baseGrammarNote;

  return {
    empathyScore: politenessScore,
    politenessScore,
    politenessNote:
      "Politeness — acknowledgment, helpfulness, or courtesy wording (chat register). Blaming or scolding the patient (e.g. “you should have…”) overrides help markers in the same reply. Not a measure of empathy, substance, or whether you answered the patient’s question.",
    grammarScore,
    grammarNote,
    grammarIssues,
    relevanceScore: relevance.score,
    relevanceNote: relevance.note,
    relevanceTurns: relevance.turns,
    avgWpm: avgEst.wpm,
    wpmReliable: avgEst.reliable,
    rawAvgWpm: Math.round(rawAvg) || avgEst.rawWpm,
    spokenSession,
    messageCount: n,
    grammarErrorCount,
    clinicalAccuracyHits,
    grammarCappedForLowRelevance,
    accuracyNote: spokenSession
      ? "Spoken mode scores the raw cloud transcription immediately after you stop the mic — the same Grammar, Politeness, Relevance, and Safety checks as typed chat-sim. There is no transcript edit or confirm step; STT mishears count as written. It does not score pronunciation, fluency, or how quickly you replied. Typing pace (WPM) does not apply."
      : avgEst.reliable
        ? `Typing pace estimated from first keystroke → send (capped sanity ≤ ${MAX_PLAUSIBLE_WPM} WPM). Accuracy is not measured here — clinical content uses safety tiers.`
        : "Typing pace unable to estimate — send timing was too short or implausibly fast (often paste, or timer started late). Clinical content is scored via safety tiers, not this number.",
    outcome: opts?.outcome ?? "completed",
    redFlagged: opts?.redFlagged ?? false,
    safetyReasons,
    safetyNotes,
  };
}

/** Legacy rigid formatter (caps/period) — for before/after demos only. */
export function legacyRigidGrammarIssues(text: string): string[] {
  const t = text.trim();
  const kinds: string[] = [];
  if (!t) return ["empty"];
  if (/\s{2,}/.test(t)) kinds.push("double_space");
  if (!/[.!?]$/.test(t)) kinds.push("missing_end_punctuation");
  const first = t[0]!;
  if (first !== first.toUpperCase() || first === first.toLowerCase()) kinds.push("missing_capital");
  return kinds;
}

export function legacyPoliteExactPhrase(text: string): boolean {
  const lower = text.toLowerCase();
  const old = [
    "how may i help",
    "how can i help",
    "thank you",
    "you're welcome",
    "you are welcome",
    "my pleasure",
    "been my pleasure",
    "have a great day",
    "take care",
    "i'm sorry",
    "im sorry",
    "sorry to hear",
    "happy to help",
  ];
  return old.some((p) => lower.includes(p));
}

export { POLITENESS_PHRASES };
