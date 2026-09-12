import { ALL_QUESTIONS, getQuestionById } from "@/content/questionBank";
import { MODULES } from "@/content/modules";
import { buildFinalExam } from "@/lib/quizEngine";
import passages from "@/data/level-up/typing-passages.json";
import type { TypingPassage } from "@/lib/level-up/typing-drill";
import { CHAT_EXAM_BRIEFS, type ChatExamBrief } from "@/content/competency-exam/chat-briefs.draft";
import { WRITING_PROMPTS, type WritingPrompt } from "@/content/competency-exam/writing-prompts.draft";
import { drawUnseen, type SeenEntry } from "./seen-set";

const TYPING = passages as TypingPassage[];

export const HIPAA_EXAM_COUNT = 20;
export const CULTURE_READY_MIN = 25;

export function drawTypingPassage(seen: SeenEntry[], seed: number) {
  return drawUnseen(TYPING, seen, 1, seed, "typing");
}

export function drawWritingPrompt(seen: SeenEntry[], seed: number) {
  return drawUnseen(WRITING_PROMPTS, seen, 1, seed, "writing");
}

export function drawChatBrief(seen: SeenEntry[], seed: number) {
  return drawUnseen(CHAT_EXAM_BRIEFS, seen, 1, seed, "chat-sim");
}

/**
 * Separate from certification `buildFinalExam` usage: same shuffle helper, own attempt record.
 * Prefer unseen ids; if the unused pool cannot fill 20, oldest seen items return and are flagged.
 */
export function drawHipaaExam(seen: SeenEntry[], seed: number): {
  questions: NonNullable<ReturnType<typeof getQuestionById>>[];
  repeatedIds: string[];
} {
  const seenIds = new Set(seen.filter((s) => s.pool === "hipaa").map((s) => s.id));
  const unseen = ALL_QUESTIONS.filter((q) => !seenIds.has(q.id));
  const moduleIds = MODULES.map((m) => m.id);
  const plan = buildFinalExam({
    moduleIds,
    topicAccuracy: {},
    count: HIPAA_EXAM_COUNT,
    seed,
  });
  const preferred = plan.orderedIds
    .map((id) => getQuestionById(id))
    .filter((q): q is NonNullable<typeof q> => Boolean(q && !seenIds.has(q.id)));

  const picked = [...preferred];
  const used = new Set(picked.map((q) => q.id));
  if (picked.length < HIPAA_EXAM_COUNT) {
    for (const q of unseen) {
      if (picked.length >= HIPAA_EXAM_COUNT) break;
      if (used.has(q.id)) continue;
      picked.push(q);
      used.add(q.id);
    }
  }
  const repeatedIds: string[] = [];
  if (picked.length < HIPAA_EXAM_COUNT) {
    const oldest = seen.filter((s) => s.pool === "hipaa").map((s) => s.id);
    for (const id of oldest) {
      if (picked.length >= HIPAA_EXAM_COUNT) break;
      if (used.has(id)) continue;
      const q = getQuestionById(id);
      if (!q) continue;
      picked.push(q);
      used.add(id);
      repeatedIds.push(id);
    }
  }
  return { questions: picked.slice(0, HIPAA_EXAM_COUNT), repeatedIds };
}

export function cultureSectionEnabled(): false {
  return false;
}

export type { WritingPrompt, ChatExamBrief };
