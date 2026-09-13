/**
 * Adapt culture exam draft items into the shared Question shape for Combined MCQ draws.
 * Live approval still requires Sonu — draft status stays on the source bank.
 */
import type { Question } from "@/lib/types";
import { CULTURE_EXAM_BANK_DRAFT_V1 } from "@/content/competency-exam/culture-bank-exam.draft";

const KEYS = ["A", "B", "C", "D", "E", "F"] as const;

export function cultureDraftAsQuestions(): Question[] {
  return CULTURE_EXAM_BANK_DRAFT_V1.map((item) => {
    const options = item.choices.map((text, i) => ({
      key: KEYS[i] || String(i),
      text,
    }));
    const correctKey = options[item.correctIndex]?.key || "A";
    return {
      id: item.id,
      sourceRef: `Culture exam draft · ${item.id}`,
      moduleId: "culture-exam-draft",
      tags: ["culture", "trivia", item.topic],
      difficulty: 2 as const,
      type: "mcq" as const,
      prompt: item.prompt,
      options,
      correctKey,
      explanation: item.rationale,
    };
  });
}
