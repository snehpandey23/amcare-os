/**
 * Pre-synthesis relevance gate for Founder Coach Draft.
 * Judges whether input warrants a Focus/Can Wait draft — not a blocklist of known bad phrases.
 */
import { generateObject } from "ai";
import { z } from "zod";
import {
  markWorkforceLlmFailure,
  workforceLlmConfigured,
  withWorkforceModelFallback,
} from "@/lib/siya-os/model";

export const FOUNDER_DRAFT_OFF_TOPIC_MESSAGE =
  "That doesn't look like a work priority — try asking about a decision, task, or what needs attention this week.";

export type DraftRelevanceVerdict = {
  relevant: boolean;
  reason: string;
  userMessage: string;
  layer: "empty" | "llm" | "pass" | "llm_unavailable";
};

const relevanceSchema = z.object({
  relevant: z.boolean(),
  reason: z.string().max(400),
});

/**
 * Soft shape check used ONLY when LLM is unavailable.
 * Positive work-framing cues — not a denylist of joke questions.
 */
function looksLikeStatedWorkPriority(text: string): boolean {
  const t = text.trim();
  if (t.length < 12) return false;
  if (
    /\b(i want to|i need to|focus on|this week|priorit(y|ies)|decision|sop|hipaa|billing|refund|ads|cac|fundraising|malpractice|contract|hiring|check-?in|delegate|escalat|clinical|compliance|marketing|hr\b|accounts|telehealth|patient|provider|klarity|siya)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  if (/\b(what|which|who|how)\b.+\b(sop|pending|review|attention|queue|handoff|check-?in|blocker|decision|this week)\b/i.test(t)) {
    return true;
  }
  return false;
}

/**
 * Classify founder Draft input BEFORE any Focus/Can Wait synthesis.
 * Off-topic / nonsense / unrelated personal trivia → relevant=false (no draft fields).
 */
export async function assessFounderDraftRelevance(input: string): Promise<DraftRelevanceVerdict> {
  const t = input.trim();
  if (!t) {
    // Empty = signal-only draft from portal (Draft this week's plan with no new text).
    return { relevant: true, reason: "empty_signal_only_ok", userMessage: "", layer: "empty" };
  }

  if (!workforceLlmConfigured()) {
    if (looksLikeStatedWorkPriority(t)) {
      return {
        relevant: true,
        reason: "no_llm_work_framing_pass",
        userMessage: "",
        layer: "pass",
      };
    }
    return {
      relevant: false,
      reason: "no_llm_cannot_classify",
      userMessage: FOUNDER_DRAFT_OFF_TOPIC_MESSAGE,
      layer: "llm_unavailable",
    };
  }

  try {
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: relevanceSchema,
        temperature: 0,
        system: [
          "You classify founder input for Siya Health's Founder Decision Coach weekly plan Draft.",
          "Siya Health = physician-led cash-pay telehealth (ADHD, weight, primary care, etc.).",
          "relevant=true when the input is plausibly about company work: priorities, decisions, tasks,",
          "ops/clinical/compliance/marketing/HR/billing, SOPs, hiring, fundraising, ads, contracts,",
          "what needs attention this week, or a clear stated focus for the business.",
          "relevant=false when the input is unrelated trivia, jokes, riddles, personal non-work chatter,",
          "random nonsense, or a question with no plausible link to running Siya Health / Amcare.",
          "Do NOT use a fixed list of banned phrases — judge the meaning.",
          "When unsure but the text could be a terse ops ask (e.g. SOP queue, HIPAA, ads CAC), prefer relevant=true.",
          "When clearly unrelated to the business, relevant=false.",
        ].join(" "),
        messages: [
          {
            role: "user",
            content: [
              "Classify this founder Draft input:",
              `"""${t.slice(0, 2000)}"""`,
              "",
              "Return relevant true/false and a short reason.",
            ].join("\n"),
          },
        ],
      });
      return o;
    });

    if (object.relevant) {
      return {
        relevant: true,
        reason: object.reason || "llm_relevant",
        userMessage: "",
        layer: "llm",
      };
    }
    return {
      relevant: false,
      reason: object.reason || "llm_off_topic",
      userMessage: FOUNDER_DRAFT_OFF_TOPIC_MESSAGE,
      layer: "llm",
    };
  } catch (err) {
    markWorkforceLlmFailure(err);
    if (looksLikeStatedWorkPriority(t)) {
      return {
        relevant: true,
        reason: "llm_error_work_framing_pass",
        userMessage: "",
        layer: "pass",
      };
    }
    return {
      relevant: false,
      reason: "llm_error_fail_closed",
      userMessage: FOUNDER_DRAFT_OFF_TOPIC_MESSAGE,
      layer: "llm_unavailable",
    };
  }
}
