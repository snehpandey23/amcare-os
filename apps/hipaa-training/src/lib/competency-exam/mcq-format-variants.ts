/**
 * Format variants for already-approved MCQ bank items.
 *
 * Same underlying keyed concept — different exam formats (direct / NOT /
 * true-false / paraphrase+shuffle). Not net-new facts; lighter human review.
 *
 * Self-check reuses chat-sim `assessReplyCoherence` plus MCQ-specific
 * ambiguity / double-negative heuristics before any reviewer pass.
 */

import { assessReplyCoherence } from "@/lib/patient-drill/evaluate";
import type { Question, QuestionOption } from "@/lib/types";

export type McqVariantType = "direct" | "negative" | "true_false" | "paraphrase_shuffle";

export type McqVariantFlag =
  | "coherence_stem"
  | "coherence_option"
  | "double_negative"
  | "ambiguous_not_framing"
  | "all_of_above_negative"
  | "source_already_negative"
  | "tf_source_limited"
  | "empty_or_duplicate_options"
  | "correct_key_missing";

export type GeneratedMcqVariant = {
  variantId: string;
  sourceId: string;
  variantType: McqVariantType;
  prompt: string;
  options: QuestionOption[];
  correctKey: string;
  explanation: string;
  /** Same teaching point as the approved source. */
  keyedConceptNote: string;
  /** Automated gate — do not send to humans if blocked (severe). */
  coherence: {
    ok: boolean;
    /** Soft flags still shown to humans; blocked = fail-closed for review queue. */
    blocked: boolean;
    flags: Array<{ code: McqVariantFlag; detail: string }>;
  };
};

export type McqVariantBatchItem = {
  source: Pick<Question, "id" | "sourceRef" | "moduleId" | "type" | "prompt" | "options" | "correctKey" | "explanation">;
  variants: GeneratedMcqVariant[];
};

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

function isAllOfAboveText(text: string): boolean {
  return /^all of the above\.?$/i.test(text.trim());
}

function sourceCorrectIsAllOfAbove(q: Question): boolean {
  const opt = q.options.find((o) => o.key === q.correctKey);
  return Boolean(opt && isAllOfAboveText(opt.text));
}

function stemLooksNegative(prompt: string): boolean {
  return /\b(not|never|false|incorrect|except)\b/i.test(prompt);
}

function optionLooksNegative(text: string): boolean {
  return /^(not|never|no)\b/i.test(text.trim()) || /\bis not\b/i.test(text);
}

/** Seeded shuffle — stable across runs for the same source id. */
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleInPlace<T>(arr: T[], rand: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}

function rekeyOptions(texts: string[], correctText: string): { options: QuestionOption[]; correctKey: string } {
  const options: QuestionOption[] = texts.map((text, i) => ({
    key: LETTERS[i]!,
    text,
  }));
  const hit = options.find((o) => o.text === correctText);
  if (!hit) {
    throw new Error("correctText not found after rekey");
  }
  return { options, correctKey: hit.key };
}

/** Light paraphrase — wording only, no new claims. */
function paraphraseText(text: string): string {
  let t = text.trim();
  t = t.replace(/\bwhich of the following\b/gi, "which option below");
  t = t.replace(/\bwith regards to\b/gi, "regarding");
  t = t.replace(/\bestablishes\b/gi, "sets out");
  t = t.replace(/\brequires\b/gi, "calls for");
  t = t.replace(/\brequire\b/gi, "call for");
  t = t.replace(/\bprovides\b/gi, "gives");
  t = t.replace(/\bincludes\b/gi, "covers");
  t = t.replace(/\bregarding\b/gi, "about");
  return t.replace(/\s+/g, " ").trim();
}

function correctOption(q: Question): QuestionOption {
  const opt = q.options.find((o) => o.key === q.correctKey);
  if (!opt) throw new Error(`Missing correct option for ${q.id}`);
  return opt;
}

function wrongOptions(q: Question): QuestionOption[] {
  return q.options.filter((o) => o.key !== q.correctKey);
}

/**
 * Run chat-sim coherence gate on stem + options, plus MCQ ambiguity heuristics.
 * Incomplete exam stems (ending in ":") are wrapped so the gate sees a clause.
 */
export function assessMcqVariantCoherence(input: {
  prompt: string;
  options: QuestionOption[];
  correctKey: string;
  variantType: McqVariantType;
  sourcePrompt: string;
}): GeneratedMcqVariant["coherence"] {
  const flags: Array<{ code: McqVariantFlag; detail: string }> = [];
  let blocked = false;

  const texts = input.options.map((o) => o.text.trim().toLowerCase());
  if (input.options.length < 2 || new Set(texts).size !== texts.length) {
    flags.push({ code: "empty_or_duplicate_options", detail: "Options empty or duplicated" });
    blocked = true;
  }
  if (!input.options.some((o) => o.key === input.correctKey)) {
    flags.push({ code: "correct_key_missing", detail: `correctKey ${input.correctKey} not in options` });
    blocked = true;
  }

  const stemForGate = /[:?]\s*$/.test(input.prompt.trim())
    ? `${input.prompt.trim().replace(/:+\s*$/, "")} — choose the best option.`
    : input.prompt;

  const stemGate = assessReplyCoherence(stemForGate);
  if (!stemGate.coherent) {
    flags.push({
      code: "coherence_stem",
      detail: `Stem: ${stemGate.flags.join("; ") || stemGate.reason}`,
    });
    // Incomplete official stems often trip the chat gate after wrap; soft unless salad.
    if (stemGate.flags.some((f) => /salad|empty|content-word run/i.test(f))) {
      blocked = true;
    }
  }

  for (const o of input.options) {
    if (o.text.trim().length < 8) continue; // "True" / "False"
    const g = assessReplyCoherence(o.text);
    if (!g.coherent) {
      flags.push({
        code: "coherence_option",
        detail: `Option ${o.key}: ${g.flags.join("; ") || g.reason}`,
      });
      if (g.flags.some((f) => /salad|empty/i.test(f))) blocked = true;
    }
  }

  const stemNeg = stemLooksNegative(input.prompt);
  const optionNegCount = input.options.filter((o) => optionLooksNegative(o.text)).length;
  if (stemNeg && optionNegCount > 0) {
    flags.push({
      code: "double_negative",
      detail: `Stem is negative-framed and ${optionNegCount} option(s) also read as negations`,
    });
    blocked = true;
  }

  if (input.variantType === "negative" && stemLooksNegative(input.sourcePrompt)) {
    flags.push({
      code: "source_already_negative",
      detail: "Source stem already uses NOT/false/except — negative variant may stack confusion",
    });
  }

  if (input.variantType === "negative" && /\bnot\b.*\bnot\b/i.test(input.prompt)) {
    flags.push({
      code: "ambiguous_not_framing",
      detail: "Stem contains multiple NOT markers",
    });
    blocked = true;
  }

  if (input.variantType === "negative" && sourceLooksAllOfAboveFromOptions(input.options, input.correctKey)) {
    flags.push({
      code: "all_of_above_negative",
      detail: "Negative framing of an all-of-the-above item — verify the false option is clearly false",
    });
  }

  return { ok: flags.length === 0, blocked, flags };
}

function sourceLooksAllOfAboveFromOptions(options: QuestionOption[], correctKey: string): boolean {
  const c = options.find((o) => o.key === correctKey);
  // After negative transform, correct is often the meta-false option
  return options.some((o) => isAllOfAboveText(o.text)) || Boolean(c && /none of the listed/i.test(c.text));
}

function buildDirect(q: Question): Omit<GeneratedMcqVariant, "coherence"> {
  return {
    variantId: `${q.id}__direct`,
    sourceId: q.id,
    variantType: "direct",
    prompt: q.prompt,
    options: q.options.map((o) => ({ ...o })),
    correctKey: q.correctKey,
    explanation: q.explanation,
    keyedConceptNote: "Unchanged approved item (baseline).",
  };
}

function buildNegative(q: Question): Omit<GeneratedMcqVariant, "coherence"> {
  if (q.type === "tf" || (q.options.length === 2 && q.options.every((o) => /^(true|false)$/i.test(o.text)))) {
    // Invert keyed truth: same statement, flip True/False
    const flipped = q.correctKey === "a" ? "b" : "a";
    return {
      variantId: `${q.id}__negative`,
      sourceId: q.id,
      variantType: "negative",
      prompt: `Which of the following is NOT the correct answer to this statement?\n\n“${q.prompt.replace(/\?$/, "")}”`,
      options: [
        { key: "a", text: "True" },
        { key: "b", text: "False" },
      ],
      // If original was False (b), the correct answer to the statement is False;
      // "NOT the correct answer" means True is the keyed choice for this meta-question — too meta.
      // Cleaner: keep statement, ask T/F of a negated claim.
      correctKey: flipped,
      explanation: `${q.explanation} (Negative/reversed framing of the same keyed fact.)`,
      keyedConceptNote:
        "T/F source: negative variant flips the keyed True/False for the same statement — confirm this does not confuse.",
    };
  }

  if (sourceCorrectIsAllOfAbove(q)) {
    const individuals = q.options.filter((o) => !isAllOfAboveText(o.text));
    const falseOpt =
      "None of the listed items are part of what the approved question treats as in-scope for this topic";
    const texts = [...individuals.map((o) => o.text), falseOpt];
    const rand = mulberry32(hashSeed(`${q.id}:neg`));
    shuffleInPlace(texts, rand);
    const { options, correctKey } = rekeyOptions(texts, falseOpt);
    const topic = q.prompt.replace(/:+\s*$/, "").trim();
    return {
      variantId: `${q.id}__negative`,
      sourceId: q.id,
      variantType: "negative",
      prompt: `Which of the following is NOT true about “${topic}”?`,
      options,
      correctKey,
      explanation: `${q.explanation} (NOT framing: individual listed items remain true; the meta “none are in scope” claim is false.)`,
      keyedConceptNote:
        "All-of-the-above source: NOT item keys the false meta-claim; listed elements stay accurate — no new clinical facts.",
    };
  }

  const correct = correctOption(q);
  const wrongs = wrongOptions(q);
  const keyedWrong = wrongs[0]!;
  const texts = [correct.text, ...wrongs.map((w) => w.text)];
  const rand = mulberry32(hashSeed(`${q.id}:neg`));
  shuffleInPlace(texts, rand);
  const { options, correctKey } = rekeyOptions(texts, keyedWrong.text);
  const topic = q.prompt.replace(/:+\s*$/, "").trim();
  const prompt = stemLooksNegative(q.prompt)
    ? `Re-check (reversed): which option below is the inaccurate claim among these choices?\n\n(Original ask: ${topic})`
    : `Which of the following is NOT accurate for: ${topic}?`;

  return {
    variantId: `${q.id}__negative`,
    sourceId: q.id,
    variantType: "negative",
    prompt,
    options,
    correctKey,
    explanation: `${q.explanation} (NOT framing: the keyed option is an inaccurate claim from the approved distractors.)`,
    keyedConceptNote: "Same concept; answer is an original distractor (the inaccurate claim).",
  };
}

function buildTrueFalse(q: Question): Omit<GeneratedMcqVariant, "coherence"> {
  if (q.type === "tf" || (q.options.length === 2 && q.options.every((o) => /^(true|false)$/i.test(o.text)))) {
    return {
      variantId: `${q.id}__true_false`,
      sourceId: q.id,
      variantType: "true_false",
      prompt: q.prompt,
      options: q.options.map((o) => ({ ...o })),
      correctKey: q.correctKey,
      explanation: q.explanation,
      keyedConceptNote: "Source is already True/False — variant mirrors direct.",
    };
  }

  const correct = correctOption(q);
  if (isAllOfAboveText(correct.text)) {
    const parts = wrongOptions(q)
      .map((o) => o.text.replace(/\.$/, ""))
      .join("; ");
    const statement = `${q.prompt.replace(/:+\s*$/, "").trim()} includes each of the following: ${parts}.`;
    return {
      variantId: `${q.id}__true_false`,
      sourceId: q.id,
      variantType: "true_false",
      prompt: `True or False: ${statement}`,
      options: [
        { key: "a", text: "True" },
        { key: "b", text: "False" },
      ],
      correctKey: "a",
      explanation: q.explanation,
      keyedConceptNote: "T/F restates the all-of-the-above keyed bundle as one true statement.",
    };
  }

  const statement = `${q.prompt.replace(/:+\s*$/, "").trim()}: ${correct.text.replace(/\.$/, "")}.`;
  return {
    variantId: `${q.id}__true_false`,
    sourceId: q.id,
    variantType: "true_false",
    prompt: `True or False: ${statement}`,
    options: [
      { key: "a", text: "True" },
      { key: "b", text: "False" },
    ],
    correctKey: "a",
    explanation: q.explanation,
    keyedConceptNote: "T/F states the approved correct option as a single true claim.",
  };
}

function buildParaphraseShuffle(q: Question): Omit<GeneratedMcqVariant, "coherence"> {
  if (q.type === "tf" || (q.options.length === 2 && q.options.every((o) => /^(true|false)$/i.test(o.text)))) {
    return {
      variantId: `${q.id}__paraphrase_shuffle`,
      sourceId: q.id,
      variantType: "paraphrase_shuffle",
      prompt: paraphraseText(q.prompt),
      options: [
        { key: "a", text: "True" },
        { key: "b", text: "False" },
      ],
      correctKey: q.correctKey,
      explanation: q.explanation,
      keyedConceptNote: "Paraphrased stem; True/False keys unchanged.",
    };
  }

  const correct = correctOption(q);
  const paraphrasedCorrect = isAllOfAboveText(correct.text) ? correct.text : paraphraseText(correct.text);
  const texts = q.options.map((o) =>
    o.key === q.correctKey ? paraphrasedCorrect : paraphraseText(o.text),
  );
  const rand = mulberry32(hashSeed(`${q.id}:para`));
  shuffleInPlace(texts, rand);
  const { options, correctKey } = rekeyOptions(texts, paraphrasedCorrect);

  return {
    variantId: `${q.id}__paraphrase_shuffle`,
    sourceId: q.id,
    variantType: "paraphrase_shuffle",
    prompt: paraphraseText(q.prompt),
    options,
    correctKey,
    explanation: q.explanation,
    keyedConceptNote: "Same correct meaning; light paraphrase + shuffled option order.",
  };
}

function attachCoherence(
  draft: Omit<GeneratedMcqVariant, "coherence">,
  source: Question,
): GeneratedMcqVariant {
  let coherence = assessMcqVariantCoherence({
    prompt: draft.prompt,
    options: draft.options,
    correctKey: draft.correctKey,
    variantType: draft.variantType,
    sourcePrompt: source.prompt,
  });

  if (source.type === "tf" && draft.variantType === "true_false") {
    coherence = {
      ...coherence,
      flags: [
        ...coherence.flags,
        { code: "tf_source_limited", detail: "Source already T/F — true_false variant is a mirror of direct" },
      ],
      ok: false,
    };
  }

  // Fix T/F negative: the earlier flip is confusing — replace with clearer negated-statement form
  return { ...draft, coherence };
}

/**
 * Generate the four format variants for one approved question.
 * Does not invent new teaching facts; distractors come from the source bank item
 * (or a meta-false claim for all-of-the-above NOT items).
 */
export function generateFormatVariants(q: Question): GeneratedMcqVariant[] {
  // Prefer a clear T/F negative: negate the statement, key True when original was False and vice versa
  const drafts: Array<Omit<GeneratedMcqVariant, "coherence">> = [
    buildDirect(q),
    refineNegative(q),
    buildTrueFalse(q),
    buildParaphraseShuffle(q),
  ];
  return drafts.map((d) => attachCoherence(d, q));
}

/** Clearer T/F negative than meta “which is NOT the correct answer”. */
function refineNegative(q: Question): Omit<GeneratedMcqVariant, "coherence"> {
  const isTf =
    q.type === "tf" || (q.options.length === 2 && q.options.every((o) => /^(true|false)$/i.test(o.text)));
  if (!isTf) return buildNegative(q);

  const originalTrue = q.correctKey === "a";
  const base = q.prompt.replace(/^true or false:\s*/i, "").trim().replace(/\?$/, "");
  // Negated claim: "It is not the case that …"
  const prompt = `True or False: It is not the case that ${base.charAt(0).toLowerCase()}${base.slice(1)}`.replace(
    /\.\s*$/,
    ".",
  );
  // If original statement is True, negated claim is False → correctKey b
  // If original is False, negated claim is True → correctKey a
  const correctKey = originalTrue ? "b" : "a";
  return {
    variantId: `${q.id}__negative`,
    sourceId: q.id,
    variantType: "negative",
    prompt,
    options: [
      { key: "a", text: "True" },
      { key: "b", text: "False" },
    ],
    correctKey,
    explanation: `${q.explanation} (Reversed: “it is not the case that …” flips the keyed truth.)`,
    keyedConceptNote: "Same fact; stem uses explicit negation of the approved statement.",
  };
}

export const DEFAULT_SAMPLE_SOURCE_IDS = [
  "t-8", // CE/BA
  "t-19", // PHI
  "t-23", // Privacy
  "t-41", // Security
  "t-51", // Safeguards (all of above)
  "t-3", // Intro (all of above)
  "t-60", // Breach (all of above)
  "t-66", // Enforcement T/F
] as const;

export function generateFormatVariantBatch(
  questions: Question[],
  sourceIds: readonly string[] = DEFAULT_SAMPLE_SOURCE_IDS,
): McqVariantBatchItem[] {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const out: McqVariantBatchItem[] = [];
  for (const id of sourceIds) {
    const q = byId.get(id);
    if (!q) throw new Error(`Sample source not found in bank: ${id}`);
    out.push({
      source: {
        id: q.id,
        sourceRef: q.sourceRef,
        moduleId: q.moduleId,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        correctKey: q.correctKey,
        explanation: q.explanation,
      },
      variants: generateFormatVariants(q),
    });
  }
  return out;
}
