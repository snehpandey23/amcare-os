import { generateObject } from "ai";
import { z } from "zod";
import { assessMultiFieldAnswers } from "@/lib/answer-quality";
import {
  markWorkforceLlmFailure,
  workforceLlmConfigured,
  workforceLlmDisabledMessage,
  withWorkforceModelFallback,
  type ClassifiedWorkforceLlmError,
} from "@/lib/siya-os/model";

export type SopDraftAnswers = {
  purpose: string;
  appliesTo: string;
  steps: string;
  exceptions: string;
  escalateTo: string;
};

export type SopDraftAssistResult = {
  title: string;
  body: string;
  method?: "llm" | "deterministic";
  note?: string;
};

export type SopDraftQualityReject = {
  code: "answers_not_substantive";
  followUp: string;
  weakFields?: string[];
  layer: "heuristic" | "llm" | "pass";
  reason: string;
};

/** Human labels for thin-answer feedback (never show raw keys alone). */
export const SOP_DRAFT_FIELD_LABELS: Record<keyof SopDraftAnswers, string> = {
  purpose: "Purpose (what this SOP is for)",
  appliesTo: "Applies to (who / when)",
  steps: "Steps",
  exceptions: "Exceptions / common mistakes",
  escalateTo: "Escalate to",
};

export function formatWeakFieldLabels(fields: string[] | undefined): string {
  if (!fields?.length) return "one or more fields";
  return fields
    .map((f) => SOP_DRAFT_FIELD_LABELS[f as keyof SopDraftAnswers] || f)
    .join("; ");
}

const sopDraftSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(8000),
});

function formatStyleSamples(samples: { title: string; body: string }[]): string {
  if (!samples.length) return "(No live SOPs in this department yet — use a clear, numbered internal SOP style.)";
  return samples
    .map((s, i) => `### Example ${i + 1}: ${s.title}\n${s.body.slice(0, 1200)}`)
    .join("\n\n");
}

/** Always-available draft so Generate never fails silently when AI Gateway is down. */
export function buildDeterministicSopDraft(
  department: string,
  answers: SopDraftAnswers,
  llmNote?: string,
): SopDraftAssistResult {
  const purpose = answers.purpose.trim() || "Department procedure";
  const title = purpose.length > 80 ? `${purpose.slice(0, 77)}…` : purpose;
  const stepsRaw = answers.steps.trim();
  const stepLines = stepsRaw
    .split(/\n|(?:^|\s)[-*•]\s+|(?=\d+[.)]\s)/)
    .map((s) => s.replace(/^\d+[.)]\s*/, "").trim())
    .filter((s) => s.length >= 2);
  const steps =
    stepLines.length >= 2
      ? stepLines.map((s, i) => `${i + 1}. ${s}`).join("\n")
      : stepsRaw
        ? `1. ${stepsRaw}`
        : "1. (Add concrete steps — AI draft was unavailable.)";

  const body = [
    "Purpose",
    purpose,
    "",
    "Scope",
    answers.appliesTo.trim() || `Staff in ${department} who perform this process.`,
    "",
    "Steps",
    steps,
    "",
    "Exceptions",
    answers.exceptions.trim() ||
      "Document edge cases here. Do not invent exceptions beyond what the author provided.",
    "",
    "Escalation",
    answers.escalateTo.trim() || "Department lead / supervisor.",
    "",
    "— NOT an AI rewrite — structured from your answers only. Edit before submit. —",
  ].join("\n");

  return {
    title: title.slice(0, 500),
    body: body.slice(0, 50000),
    method: "deterministic",
    note:
      llmNote ||
      "AI draft failed — this is your answers rearranged into Purpose/Scope/Steps, not a generated SOP. Fix AI credentials or edit manually.",
  };
}

export async function generateSopDraftFromAnswers(opts: {
  department: string;
  answers: SopDraftAnswers;
  styleSamples: { title: string; body: string }[];
  /** Author checked the thin-answers disclaimer — warn only, do not block. */
  acceptThinAnswers?: boolean;
  /** Founder Coach refine pattern: current draft + instruction → new draft. */
  currentDraft?: SopDraftAssistResult | null;
  refineInstruction?: string | null;
}): Promise<
  | { draft: SopDraftAssistResult }
  | { error: ClassifiedWorkforceLlmError }
  | { quality: SopDraftQualityReject }
> {
  const a = opts.answers;

  if (!workforceLlmConfigured()) {
    return { error: workforceLlmDisabledMessage() };
  }

  const refine = opts.refineInstruction?.trim() || "";
  const cur = opts.currentDraft;
  const isRefine = Boolean(refine && cur?.title?.trim() && cur?.body?.trim());

  if (isRefine) {
    const { assessRefineInstruction, refinePromptPreamble } = await import("@/lib/sop-refine");
    const refineQuality = await assessRefineInstruction(refine);
    if (!refineQuality.ok) {
      return {
        quality: {
          code: "answers_not_substantive",
          followUp:
            refineQuality.followUp ||
            "That refine request looks too thin or unclear. Say what to change (e.g. add an escalation timeline, make step 3 more specific).",
          weakFields: ["refineInstruction"],
          layer: refineQuality.layer,
          reason: refineQuality.reason,
        },
      };
    }

    const userPrompt = [
      refinePromptPreamble(refine),
      "",
      `Department: ${opts.department}`,
      "",
      "CURRENT DRAFT:",
      `Title: ${cur!.title}`,
      "",
      cur!.body,
      "",
      "AUTHOR ANSWERS (grounding — do not invent policy beyond these and the current draft):",
      `1. Purpose: ${a.purpose || "(from current draft)"}`,
      `2. Who / when: ${a.appliesTo || "(from current draft)"}`,
      `3. Steps: ${a.steps || "(from current draft)"}`,
      `4. Exceptions: ${a.exceptions || "(from current draft)"}`,
      `5. Escalate to: ${a.escalateTo || "(from current draft)"}`,
      "",
      "Return the full updated SOP (title + body). Keep body under ~3500 characters.",
      "body sections: Purpose, Scope, Steps (numbered), Exceptions, Escalation. Plain text, no markdown fences.",
    ].join("\n");

    try {
      const object = await withWorkforceModelFallback(async (model) => {
        const { object: o } = await generateObject({
          model,
          schema: sopDraftSchema,
          system:
            "You refine internal department SOPs for Siya Health staff. Apply only the requested adjustment; keep the rest. Be concrete and procedural.",
          messages: [{ role: "user", content: userPrompt }],
          temperature: 0.25,
        });
        return o;
      });
      return {
        draft: {
          title: object.title.trim().slice(0, 500),
          body: object.body.trim().slice(0, 50000),
          method: "llm",
        },
      };
    } catch (err) {
      const classified = markWorkforceLlmFailure(err);
      // Do not pretend refine succeeded — return hard error so UI does not say "Draft refined."
      return { error: classified };
    }
  }

  // Soft gate: warn on thin answers unless author accepts the risk and proceeds.
  if (!opts.acceptThinAnswers) {
    const quality = await assessMultiFieldAnswers([
      {
        field: "purpose",
        question: "What is this SOP for, in one line?",
        answer: a.purpose,
      },
      {
        field: "appliesTo",
        question: "Who does this apply to / when does someone need it?",
        answer: a.appliesTo,
      },
      {
        field: "steps",
        question: "What are the steps, in order?",
        answer: a.steps,
      },
      ...(a.exceptions.trim()
        ? [
            {
              field: "exceptions",
              question: "What commonly goes wrong or needs an exception?",
              answer: a.exceptions,
            },
          ]
        : []),
      {
        field: "escalateTo",
        question: "Who should someone escalate to if they're stuck?",
        answer: a.escalateTo,
      },
    ]);

    if (!quality.ok) {
      const labels = formatWeakFieldLabels(quality.weakFields);
      return {
        quality: {
          code: "answers_not_substantive",
          followUp: `These fields need more detail before a useful draft: ${labels}. Add specifics (who, when, tools, order), or check the box below to generate a structured skeleton from what you have.`,
          weakFields: quality.weakFields,
          layer: quality.layer,
          reason: quality.reason,
        },
      };
    }
  }

  const userPrompt = [
    `Department: ${opts.department}`,
    "",
    "STYLE REFERENCE (match tone and structure when examples exist; keep your draft shorter than examples if needed):",
    formatStyleSamples(opts.styleSamples),
    "",
    "AUTHOR ANSWERS (source of truth — do not invent policy beyond these):",
    `1. Purpose (one line): ${a.purpose}`,
    `2. Who / when: ${a.appliesTo}`,
    `3. Steps (rough): ${a.steps}`,
    `4. Exceptions / common mistakes: ${a.exceptions}`,
    `5. Escalate to: ${a.escalateTo}`,
    "",
    opts.acceptThinAnswers
      ? "NOTE: Author accepted a thin-answers disclaimer. Draft the best SOP you can from what is here; mark gaps clearly under Exceptions or Escalation rather than inventing steps."
      : "",
    "Write a concise internal SOP. Keep body under ~3500 characters.",
    "Paraphrase and structure — do not paste the author answers verbatim.",
    "body sections: Purpose, Scope, Steps (numbered), Exceptions, Escalation. Plain text, no markdown fences.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const object = await withWorkforceModelFallback(async (model) => {
      const { object: o } = await generateObject({
        model,
        schema: sopDraftSchema,
        system:
          "You draft internal department SOPs for Siya Health staff. Be concrete and procedural. Paraphrase author answers into clear SOP language — never return their raw paste as the body. Do not cite laws or HIPAA unless the author mentioned them.",
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.25,
      });
      return o;
    });
    return {
      draft: {
        title: object.title.trim().slice(0, 500),
        body: object.body.trim().slice(0, 50000),
        method: "llm",
      },
    };
  } catch (err) {
    // Hard fail — never return a silent deterministic draft labeled as AI.
    return { error: markWorkforceLlmFailure(err) };
  }
}
