import { generateObject } from "ai";
import { z } from "zod";
import {
  markWorkforceLlmFailure,
  workforceLlmConfigured,
  withWorkforceModelFallback,
} from "@/lib/siya-os/model";

const verdictSchema = z.object({
  substantive: z.boolean(),
  reason: z.string().max(400),
  followUp: z.string().max(500),
});

export type AnswerQualityVerdict = {
  ok: boolean;
  /** Staff-facing pushback when not ok */
  followUp: string;
  /** Which layer rejected (for logs/tests) */
  layer: "heuristic" | "llm" | "pass";
  reason: string;
};

/** Answers this long that passed heuristic are treated as usable operational content. */
const LONG_ANSWER_CHARS = 80;

function alphaWord(w: string): string {
  return w.replace(/[^a-z]/gi, "").toLowerCase();
}

/** Real vocabulary token — not a stub like "fas" / "xx". */
function isContentWord(w: string): boolean {
  const a = alphaWord(w);
  return a.length >= 4 && /[aeiouy]/.test(a);
}

/** Fast first-pass: obvious emptiness / known junk / ultra-thin tokens. */
export function isHeuristicallyWeakAnswer(answer: string, skipped = false): boolean {
  if (skipped) return false;
  const t = answer.trim();
  if (!t) return true;
  if (t.length < 12) return true;
  const compact = t.replace(/\s+/g, "");
  if (/^(.)\1{4,}$/i.test(compact)) return true;
  if (
    /^(abcd|abcdef|asdf|qwer|zxcv|test|testing|n\/a|na|idk|dunno|xyz|foo|bar|lorem|afs|fas|xxx|yyy|zzz)+$/i.test(
      compact,
    )
  ) {
    return true;
  }
  // Near-empty fragments: "As.", "fas.", "Afs."
  if (/^[a-z]{1,4}\.?$/i.test(t)) return true;
  if (/^[a-z0-9]{1,8}$/i.test(compact) && !/[aeiou]/.test(compact.slice(0, 4))) return true;
  const words = t.split(/\s+/).filter(Boolean);
  // All micro-tokens: "a b c d"
  if (words.every((w) => alphaWord(w).length <= 2) && words.length < 8) return true;
  // Generic deferral filler (exact / near-exact only — not long pastes that mention "not sure")
  if (
    t.length < 64 &&
    /^(it depends|we'?ll figure it out|not sure|tbd|to be decided|same as above|see above|n\/a\.?)$/i.test(
      t,
    )
  ) {
    return true;
  }
  // Short answers: allow 2+ real words ("Medical assistants", "Billing lead", "Card declines").
  // Still reject single thin tokens and stubby phrases without a content word ≥5 letters.
  if (words.length < 3 && t.length < 48) {
    const contentful = words.filter(isContentWord);
    const hasStrong = words.some((w) => alphaWord(w).length >= 5 && /[aeiouy]/.test(alphaWord(w)));
    if (!(contentful.length >= 2 || (words.length >= 2 && hasStrong))) return true;
  }
  // Numbered list of empty tokens: "1. Afs. 2. Afs. 3. Afs."
  const numbered = t.match(/^\s*\d+[\.)]\s*\S+/gm);
  if (numbered && numbered.length >= 2) {
    const tokens = numbered.map((line) => line.replace(/^\s*\d+[\.)]\s*/, "").replace(/\.+$/, "").trim());
    if (tokens.every((tok) => tok.length <= 4 || isHeuristicallyWeakAnswer(tok))) return true;
  }
  // Short answers ending in a nonsense stub: "This SOP applies to fas."
  // Skip this check for longer pastes (real ops text often ends in MA, MD, lead, etc.).
  if (t.length < LONG_ANSWER_CHARS) {
    const lastWord = alphaWord(words[words.length - 1] ?? "");
    if (
      words.length >= 3 &&
      lastWord.length <= 3 &&
      !/^(who|how|why|all|any|new|old|day|ops|ma|md|np|pa|ceo|cmo)$/i.test(lastWord)
    ) {
      const contentWords = words.filter((w) => alphaWord(w).length > 3);
      if (contentWords.length <= 2) return true;
    }
  }
  return false;
}

const HEURISTIC_FOLLOW_UP =
  "That doesn’t give me enough real detail. What are the actual steps, who does them, and when — specific enough that someone new could follow them?";

/**
 * Shared quality gate: heuristic first, then LLM substantiveness vs the question.
 * Use for checklist interview turns and Knowledge SOP guided answers.
 */
export async function assessAnswerSubstantiveness(opts: {
  question: string;
  answer: string;
  skipped?: boolean;
}): Promise<AnswerQualityVerdict> {
  if (opts.skipped) {
    return { ok: true, followUp: "", layer: "pass", reason: "skipped" };
  }
  if (isHeuristicallyWeakAnswer(opts.answer, false)) {
    return {
      ok: false,
      followUp: HEURISTIC_FOLLOW_UP,
      layer: "heuristic",
      reason: "heuristic_weak",
    };
  }

  if (!workforceLlmConfigured()) {
    // No LLM path: keep stricter heuristic-only (already passed above).
    return { ok: true, followUp: "", layer: "pass", reason: "heuristic_only_no_llm" };
  }

  try {
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: verdictSchema,
        system: [
          "You judge whether a staff answer to an SOP interview question is usable enough to continue.",
          "Default to substantive=true for on-topic answers with any concrete detail",
          "(roles, tools, steps, timing, who to escalate to) — even if brief, informal, or incomplete.",
          "One-line answers are fine when they name a real role, tool, or action",
          "(e.g. 'Medical assistants', 'Billing lead', 'Confirm Klarity payment before visits').",
          "substantive=false ONLY for gibberish, placeholders, nonsense syllables, empty fragments,",
          "or pure deferrals with no usable detail (e.g. 'it depends' / 'not sure' / 'ABCD' alone).",
          "Do NOT reject because the answer could be longer or more polished.",
          "If substantive=false, write followUp as a short, direct pushback naming what detail is missing.",
          "Do not invent SOP content. No PHI.",
        ].join(" "),
        messages: [
          {
            role: "user",
            content: [
              `QUESTION: ${opts.question}`,
              `ANSWER: ${opts.answer}`,
              "",
              "Return substantive true/false, a short reason, and followUp (empty string if substantive).",
            ].join("\n"),
          },
        ],
        temperature: 0,
      });
      return o;
    });
    if (object.substantive) {
      return { ok: true, followUp: "", layer: "pass", reason: object.reason || "llm_ok" };
    }
    // Heuristic already cleared — only keep LLM rejects for short/ambiguous leftovers.
    if (opts.answer.trim().length >= LONG_ANSWER_CHARS) {
      return {
        ok: true,
        followUp: "",
        layer: "pass",
        reason: `llm_reject_overridden_lenient:${object.reason || "llm_not_substantive"}`,
      };
    }
    return {
      ok: false,
      followUp: object.followUp.trim() || HEURISTIC_FOLLOW_UP,
      layer: "llm",
      reason: object.reason || "llm_not_substantive",
    };
  } catch (err) {
    markWorkforceLlmFailure(err);
    // Fail closed on thin-looking answers; if heuristic passed and LLM fails, allow through
    // only when answer is long enough to be plausibly real.
    if (opts.answer.trim().length < LONG_ANSWER_CHARS) {
      return {
        ok: false,
        followUp: HEURISTIC_FOLLOW_UP,
        layer: "llm",
        reason: "llm_error_fail_closed",
      };
    }
    return { ok: true, followUp: "", layer: "pass", reason: "llm_error_lenient" };
  }
}

export type FieldAnswer = { field: string; question: string; answer: string };

/**
 * Multi-field gate (Knowledge SOP guide). Rejects if required fields fail, or if the set
 * looks like repeated low-content filler across fields.
 * Empty optional fields (e.g. exceptions) are ignored — do not treat blank optional as weak.
 */
export async function assessMultiFieldAnswers(
  fields: FieldAnswer[],
): Promise<AnswerQualityVerdict & { weakFields?: string[] }> {
  const present = fields.filter((f) => f.answer.trim().length > 0);
  if (!present.length) {
    return {
      ok: false,
      layer: "heuristic",
      reason: "all_fields_empty",
      followUp: HEURISTIC_FOLLOW_UP,
      weakFields: fields.map((f) => f.field),
    };
  }

  const weakHeuristic = present.filter((f) => isHeuristicallyWeakAnswer(f.answer));
  if (weakHeuristic.length) {
    const labels = weakHeuristic.map((f) => {
      const map: Record<string, string> = {
        purpose: "Purpose (what this SOP is for)",
        appliesTo: "Applies to (who / when)",
        steps: "Steps",
        exceptions: "Exceptions / common mistakes",
        escalateTo: "Escalate to",
      };
      return map[f.field] || f.field;
    });
    return {
      ok: false,
      layer: "heuristic",
      reason: `weak_fields:${weakHeuristic.map((f) => f.field).join(",")}`,
      followUp: `These fields need more detail: ${labels.join("; ")}. ${HEURISTIC_FOLLOW_UP}`,
      weakFields: weakHeuristic.map((f) => f.field),
    };
  }

  // Cross-field: nearly identical low-entropy answers
  const norms = present.map((f) => f.answer.trim().toLowerCase().replace(/[^a-z0-9]+/g, ""));
  const unique = new Set(norms.filter(Boolean));
  if (present.length >= 3 && unique.size <= 2 && norms.every((n) => n.length < 40)) {
    return {
      ok: false,
      layer: "heuristic",
      reason: "repeated_filler_across_fields",
      followUp:
        "Every field looks like the same thin placeholder. Give real content for purpose, who it applies to, and concrete steps — not filler repeated across boxes.",
      weakFields: present.map((f) => f.field),
    };
  }

  if (!workforceLlmConfigured()) {
    return { ok: true, followUp: "", layer: "pass", reason: "heuristic_only_no_llm" };
  }

  const totalChars = present.reduce((n, f) => n + f.answer.trim().length, 0);

  try {
    const batchSchema = z.object({
      substantive: z.boolean(),
      weakFields: z.array(z.string()).max(8),
      reason: z.string().max(400),
      followUp: z.string().max(600),
    });
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: batchSchema,
        system: [
          "You judge whether guided SOP draft answers are usable enough to generate a real SOP.",
          "Default to substantive=true when purpose and steps have concrete operational content —",
          "even if imperfect, incomplete, brief, or roughly pasted.",
          "Short who/when and escalate lines are fine when they name a real role or team",
          "(e.g. 'Medical assistants', 'Billing lead'). Optional exceptions may be thin or empty.",
          "substantive=false ONLY for gibberish, near-empty fragments, nonsense syllables,",
          "the same filler repeated across fields, or pure deferrals with no usable detail.",
          "Do NOT reject because tone is informal, structure is messy, or some fields are short.",
          "If rejecting, list weakFields by the field keys provided and write a direct followUp.",
        ].join(" "),
        messages: [
          {
            role: "user",
            content: [
              "FIELDS (empty optional fields may be omitted):",
              ...present.map((f) => `- ${f.field} | Q: ${f.question} | A: ${f.answer}`),
              "",
              "Return substantive, weakFields (field keys), reason, followUp.",
            ].join("\n"),
          },
        ],
        temperature: 0,
      });
      return o;
    });
    if (object.substantive) {
      return { ok: true, followUp: "", layer: "pass", reason: object.reason || "llm_ok" };
    }
    // Heuristic already cleared every field — don't hard-block on a harsh LLM reject.
    // (UI may still warn; draft-assist can proceed with acceptThinAnswers.)
    if (totalChars >= LONG_ANSWER_CHARS) {
      return {
        ok: true,
        followUp: "",
        layer: "pass",
        reason: `llm_reject_overridden_lenient:${object.reason || "llm_not_substantive"}`,
      };
    }
    return {
      ok: false,
      layer: "llm",
      reason: object.reason || "llm_not_substantive",
      followUp: object.followUp.trim() || HEURISTIC_FOLLOW_UP,
      weakFields: object.weakFields,
    };
  } catch (err) {
    markWorkforceLlmFailure(err);
    // Heuristic already passed — Gateway outage must not block Generate or look like "thin answers."
    return { ok: true, followUp: "", layer: "pass", reason: "llm_error_lenient" };
  }
}
