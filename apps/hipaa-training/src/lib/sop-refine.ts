/**
 * Shared SOP refine helpers — mirrors Founder Coach weekly-plan refine
 * (current draft + instruction → new draft; not a chat thread).
 */
import { assessAnswerSubstantiveness, type AnswerQualityVerdict } from "@/lib/answer-quality";

export const SOP_REFINE_QUESTION =
  "What specific adjustment should we make to the current SOP draft?";

/** Same quality gate as interview / guided answers — reject gibberish refine requests. */
export async function assessRefineInstruction(instruction: string): Promise<AnswerQualityVerdict> {
  return assessAnswerSubstantiveness({
    question: SOP_REFINE_QUESTION,
    answer: instruction,
  });
}

export function refinePromptPreamble(instruction: string): string {
  return [
    "REFINING AN EXISTING DRAFT — do not rebuild from scratch.",
    "Apply ONLY the author's adjustment below. Keep everything else that still fits.",
    `ADJUSTMENT: ${instruction.trim()}`,
  ].join("\n");
}
