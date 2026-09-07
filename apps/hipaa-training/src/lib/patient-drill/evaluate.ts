/**
 * Heuristic session feedback for Chat Simulator (chat register).
 *
 * Grammar = competence (agreement, tense, garbled structure, wrong word) —
 * NOT casual-chat formatting (missing caps / end punctuation).
 *
 * LanguageTool is NOT wired yet (scoped separately). This scorer is the
 * interim chat-register rule set: formatting rigidity is explicitly off.
 *
 * Politeness = acknowledgment / helpfulness / warmth markers — not empathy,
 * and not exact-phrase-only.
 */

import type { SafetyReasonCode, SessionOutcome } from "./safety";
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
};

/**
 * Score one MA reply against the preceding patient turn.
 * Returns 0–1. Exported for smokes / demos.
 */
export function scoreRelevanceTurn(patientText: string, maReply: string): RelevanceTurnResult {
  const askType = classifyPatientAsk(patientText);
  const reply = (maReply || "").trim();
  const patientExcerpt = (patientText || "").trim().slice(0, 72);
  const replyExcerpt = reply.slice(0, 72);

  if (!reply) {
    return {
      askType,
      patientExcerpt,
      replyExcerpt,
      score: 0,
      reason: "Empty reply",
    };
  }
  if (CURT_MARKERS.test(reply)) {
    return {
      askType,
      patientExcerpt,
      replyExcerpt,
      score: 0,
      reason: "Dismissive / curt — not engaged",
    };
  }
  if (isGenericNonAnswer(reply)) {
    return {
      askType,
      patientExcerpt,
      replyExcerpt,
      score: 0,
      reason: "Generic non-answer (e.g. “ok sure”) — does not address the ask",
    };
  }

  const substantive = wordCount(reply) >= 8;
  const matched = shapeMatch(askType, reply);
  const fillerLead =
    /^(ok(ay)?(\s+sure)?|sure|got it|alright|all right)[\s,!.]+/i.test(reply) && !matched;

  // “okay sure, …” that never answers the ask — treat as gaming / non-engagement
  if (fillerLead && !matched) {
    return {
      askType,
      patientExcerpt,
      replyExcerpt,
      score: substantive ? 0.2 : 0,
      reason: "Filler ack without answering the ask (e.g. “ok sure” + off-topic)",
    };
  }

  // Greeting-only / thin ack with a trailing half-question still weak for a real ask
  if (!substantive && !matched) {
    return {
      askType,
      patientExcerpt,
      replyExcerpt,
      score: 0.15,
      reason: "Too thin / off-shape for this ask type",
    };
  }
  if (matched && substantive) {
    return {
      askType,
      patientExcerpt,
      replyExcerpt,
      score: 1,
      reason: `On-topic ${askType}-shaped answer`,
    };
  }
  if (matched && !substantive) {
    return {
      askType,
      patientExcerpt,
      replyExcerpt,
      score: 0.55,
      reason: `Partially ${askType}-shaped but thin`,
    };
  }
  // Substantive but wrong shape — some engagement, not what was asked
  return {
    askType,
    patientExcerpt,
    replyExcerpt,
    score: 0.35,
    reason: `Substantive but not ${askType}-shaped (may be off-topic)`,
  };
}

export type SimMessage = {
  who: "you" | string;
  text: string;
  startedAt?: number;
  sentAt?: number;
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
        });
        continue;
      }
      turns.push(scoreRelevanceTurn(lastPatient, m.text || ""));
    } else {
      lastPatient = m.text || "";
    }
  }
  const n = turns.length;
  const score = n > 0 ? Math.round((turns.reduce((s, t) => s + t.score, 0) / n) * 100) : 0;
  return {
    score,
    turns,
    note:
      "Relevance / engagement (estimate) — checks whether each reply is substantive and shape-matched to what the patient just asked (timeline → time-shaped, process → steps, etc.). Not a full meaning judge / LLM. Generic non-answers like “ok sure” score low. Does not measure clinical correctness (see safety tiers).",
  };
}

export type GrammarIssueKind =
  | "empty"
  | "subject_verb_disagreement"
  | "wrong_word_or_typo"
  | "garbled_or_unclear"
  | "wrong_tense";

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

function grammarIssuesFor(text: string): { kinds: GrammarIssueKind[]; detail?: string } {
  const t = text.trim();
  if (!t) return { kinds: ["empty"], detail: "Empty message" };

  const kinds: GrammarIssueKind[] = [];
  const details: string[] = [];

  // Chat register: do NOT flag missing capitalization or end punctuation.

  for (const { re, detail } of TYPO_OR_WRONG_WORD) {
    if (re.test(t)) {
      kinds.push("wrong_word_or_typo");
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
  const words = t.split(/\s+/).filter(Boolean);
  const weird = words.filter((w) => /^[a-z]{4,}$/i.test(w) && !/[aeiou]/i.test(w));
  if (weird.length >= 2) {
    kinds.push("garbled_or_unclear");
    details.push("Multiple unusual spellings — sentence may be unclear");
  }

  return { kinds: [...new Set(kinds)], detail: details[0] };
}

/** True when the message shows courtesy / helpful chat tone (forgiving). */
export function isPoliteMessage(text: string): boolean {
  const t = (text || "").trim();
  if (!t) return false;
  if (CURT_MARKERS.test(t)) return false;
  const lower = t.toLowerCase();
  if (POLITENESS_PHRASES.some((p) => lower.includes(p))) return true;
  if (WARM_GREETING.test(t)) return true;
  // Acknowledgment alone (“okay so sorry…”) or ack + help both count
  if (ACK_MARKERS.test(t)) return true;
  if (HELP_MARKERS.test(t) && !CURT_MARKERS.test(t)) return true;
  return false;
}

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
  messageCount: number;
  grammarErrorCount: number;
  accuracyNote: string;
  outcome: SessionOutcome;
  redFlagged: boolean;
  safetyReasons: SafetyReasonCode[];
  safetyNotes: string[];
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
    if (isPoliteMessage(msg.text || "")) politeCount++;
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
  const grammarScore = n > 0 ? Math.round((grammarOkCount / n) * 100) : 0;
  const relevance = scoreRelevanceSession(messages);
  const rawAvg = totalMinutes > 0 ? totalWords / totalMinutes : 0;
  const avgEst =
    totalMinutes > 0
      ? estimateWpmFromWords(totalWords, totalMinutes * 60)
      : { wpm: 0, reliable: false, rawWpm: 0, reason: "no_sample" as const };

  return {
    empathyScore: politenessScore,
    politenessScore,
    politenessNote:
      "Politeness — acknowledgment, helpfulness, or courtesy wording (chat register). Not a measure of empathy, substance, or whether you answered the patient’s question.",
    grammarScore,
    grammarNote:
      "Grammar (chat register) — flags real issues (agreement, wrong word/typo, unclear wording). Missing caps/periods are not scored. Does not score relevance or substance. LanguageTool formal checks are not wired yet.",
    grammarIssues,
    relevanceScore: relevance.score,
    relevanceNote: relevance.note,
    relevanceTurns: relevance.turns,
    avgWpm: avgEst.wpm,
    wpmReliable: avgEst.reliable,
    rawAvgWpm: Math.round(rawAvg) || avgEst.rawWpm,
    messageCount: n,
    grammarErrorCount,
    accuracyNote: avgEst.reliable
      ? `Typing pace estimated from first keystroke → send (capped sanity ≤ ${MAX_PLAUSIBLE_WPM} WPM). Accuracy is not measured here — clinical content uses safety tiers.`
      : "Typing pace unable to estimate — send timing was too short or implausibly fast (often paste, or timer started late). Clinical content is scored via safety tiers, not this number.",
    outcome: opts?.outcome ?? "completed",
    redFlagged: opts?.redFlagged ?? false,
    safetyReasons: opts?.safetyReasons ?? [],
    safetyNotes: opts?.safetyNotes ?? [],
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
