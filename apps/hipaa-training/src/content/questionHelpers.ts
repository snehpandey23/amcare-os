import type { Question, QuestionOption } from "@/lib/types";

export function o(key: string, text: string): QuestionOption {
  return { key, text };
}

export function tf(difficulty: 1 | 2 | 3, moduleId: string, tags: string[], num: number, prompt: string, correctIsTrue: boolean, explanation: string, distractorHints?: Question["distractorHints"]): Question {
  return {
    id: `t-${num}`,
    sourceRef: `HIPAA Test Q${num}`,
    moduleId,
    tags,
    difficulty,
    type: "tf",
    prompt,
    options: [o("a", "True"), o("b", "False")],
    correctKey: correctIsTrue ? "a" : "b",
    explanation,
    distractorHints,
  };
}

export function mcq(
  difficulty: 1 | 2 | 3,
  moduleId: string,
  tags: string[],
  num: number,
  prompt: string,
  choices: Record<string, string>,
  correctKey: string,
  explanation: string,
  type: Question["type"] = "mcq",
  distractorHints?: Question["distractorHints"]
): Question {
  return {
    id: `t-${num}`,
    sourceRef: `HIPAA Test Q${num}`,
    moduleId,
    tags,
    difficulty,
    type,
    prompt,
    options: Object.entries(choices).map(([key, text]) => o(key, text)),
    correctKey,
    explanation,
    distractorHints,
  };
}
