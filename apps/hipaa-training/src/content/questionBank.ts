import type { Question } from "@/lib/types";
import { QUESTIONS_PART_1 } from "./questionsPart1";
import { QUESTIONS_PART_2 } from "./questionsPart2";

/** Full bank digitized from HIPAA Test for Healthcare Providers (Gamma) in your welcome kit. */
export const ALL_QUESTIONS: Question[] = [...QUESTIONS_PART_1, ...QUESTIONS_PART_2];

const byId = new Map<string, Question>();
for (const q of ALL_QUESTIONS) {
  if (byId.has(q.id)) throw new Error(`Duplicate question id: ${q.id}`);
  byId.set(q.id, q);
}

export function getQuestionById(id: string): Question | undefined {
  return byId.get(id);
}

export function getQuestionsForModule(moduleId: string, role?: import("@/lib/types").WorkforceRole): Question[] {
  return ALL_QUESTIONS.filter((q) => {
    if (q.moduleId !== moduleId) return false;
    if (q.roles?.length && role && !q.roles.includes(role)) return false;
    return true;
  });
}

export function getQuestionsByTag(tag: string): Question[] {
  return ALL_QUESTIONS.filter((q) => q.tags.includes(tag));
}

/** Primary tag = first tag (weak-area bucket) */
export function primaryTag(q: Question): string {
  return q.tags[0] ?? "general";
}
