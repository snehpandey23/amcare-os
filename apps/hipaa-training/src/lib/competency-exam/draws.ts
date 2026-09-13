import { ALL_QUESTIONS, getQuestionById } from "@/content/questionBank";
import { MODULES } from "@/content/modules";
import { buildFinalExam } from "@/lib/quizEngine";
import passages from "@/data/level-up/typing-passages.json";
import type { TypingPassage } from "@/lib/level-up/typing-drill";
import type { Question } from "@/lib/types";
import { CHAT_EXAM_BRIEFS, type ChatExamBrief } from "@/content/competency-exam/chat-briefs.draft";
import { WRITING_PROMPTS, type WritingPrompt } from "@/content/competency-exam/writing-prompts.draft";
import {
  WRITING_CLINICAL_PROMPTS,
  type ClinicalWritingPrompt,
} from "@/content/competency-exam/writing-clinical-prompts.draft";
import { LISTENING_PROMPTS } from "@/content/competency-exam/listening-prompts.draft";
import { clinicalKnowledgeDraftAsQuestions } from "@/content/competency-exam/clinical-knowledge-bank.draft";
import { cultureDraftAsQuestions } from "@/lib/competency-exam/mcq-adapters";
import { drawUnseen, type SeenEntry } from "./seen-set";

const TYPING = passages as TypingPassage[];

/** Combined MCQ sitting size (HIPAA + clinical knowledge + trivia/culture). */
export const MCQ_EXAM_COUNT = 40;
/** Legacy HIPAA-only draw size (isolated review / transition). */
export const HIPAA_EXAM_COUNT = 20;
export const CULTURE_READY_MIN = 25;

/** Target mix inside a 40-item Combined MCQ draw. */
export const MCQ_MIX = {
  hipaa: 20,
  clinical: 10,
  trivia: 10,
} as const;

export function drawTypingPassage(seen: SeenEntry[], seed: number) {
  return drawUnseen(TYPING, seen, 1, seed, "typing");
}

/** @deprecated Writing removed from live exam — kept for legacy content / smokes. */
export function drawWritingPrompt(seen: SeenEntry[], seed: number) {
  return drawUnseen(WRITING_CLINICAL_PROMPTS, seen, 1, seed, "writing");
}

/** Supplemental patient-communication bank (not live exam). */
export function drawWritingPatientPrompt(seen: SeenEntry[], seed: number) {
  return drawUnseen(WRITING_PROMPTS, seen, 1, seed, "writing");
}

/** Isolated Listening — voicemail → single provider message. */
export function drawListeningPrompt(seen: SeenEntry[], seed: number) {
  return drawUnseen(LISTENING_PROMPTS, seen, 1, seed, "listening");
}

export function drawChatBrief(seen: SeenEntry[], seed: number) {
  return drawUnseen(CHAT_EXAM_BRIEFS, seen, 1, seed, "chat-sim");
}

function fillFromPool(
  pool: Question[],
  seen: SeenEntry[],
  count: number,
  seed: number,
  poolKey: string,
): { items: Question[]; repeatedIds: string[] } {
  if (count <= 0 || pool.length === 0) return { items: [], repeatedIds: [] };
  const draw = drawUnseen(pool, seen, Math.min(count, pool.length), seed, poolKey);
  return { items: draw.items, repeatedIds: draw.repeatedIds };
}

/**
 * Combined MCQ: mix HIPAA live bank + clinical-knowledge draft + culture/trivia draft.
 * Anti-repeat uses per-pool seen keys (hipaa / clinical-knowledge / culture).
 * Draft pools mark the sitting as draftContent until reviewers clear items.
 */
export function drawCombinedMcqExam(
  seen: SeenEntry[],
  seed: number,
): {
  questions: Question[];
  repeatedIds: string[];
  mix: { hipaa: number; clinical: number; trivia: number };
  draftPools: Array<"clinical-knowledge" | "culture">;
} {
  const hipaaPool = ALL_QUESTIONS;
  const clinicalPool = clinicalKnowledgeDraftAsQuestions();
  const triviaPool = cultureDraftAsQuestions();

  let hipaaN = MCQ_MIX.hipaa;
  let clinicalN = Math.min(MCQ_MIX.clinical, clinicalPool.length);
  let triviaN = Math.min(MCQ_MIX.trivia, triviaPool.length);
  // If draft pools are short, give leftover seats to HIPAA so we still hit 40 when possible.
  const shortfall = MCQ_EXAM_COUNT - (hipaaN + clinicalN + triviaN);
  if (shortfall > 0) hipaaN += shortfall;

  const hipaa = fillFromPool(hipaaPool, seen, hipaaN, seed + 11, "hipaa");
  const clinical = fillFromPool(clinicalPool, seen, clinicalN, seed + 29, "clinical-knowledge");
  const trivia = fillFromPool(triviaPool, seen, triviaN, seed + 47, "culture");

  const questions = [...hipaa.items, ...clinical.items, ...trivia.items];
  // Stable shuffle of the combined list so topics interleave on the form.
  const shuffled = shuffleQuestions(questions, seed + 99).slice(0, MCQ_EXAM_COUNT);
  const repeatedIds = [...hipaa.repeatedIds, ...clinical.repeatedIds, ...trivia.repeatedIds].filter((id) =>
    shuffled.some((q) => q.id === id),
  );
  const draftPools: Array<"clinical-knowledge" | "culture"> = [];
  if (clinical.items.length) draftPools.push("clinical-knowledge");
  if (trivia.items.length) draftPools.push("culture");

  return {
    questions: shuffled,
    repeatedIds,
    mix: {
      hipaa: shuffled.filter((q) => hipaa.items.some((h) => h.id === q.id)).length,
      clinical: shuffled.filter((q) => clinical.items.some((h) => h.id === q.id)).length,
      trivia: shuffled.filter((q) => trivia.items.some((h) => h.id === q.id)).length,
    },
    draftPools,
  };
}

function shuffleQuestions<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed || 1;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
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

export type { WritingPrompt, ClinicalWritingPrompt, ChatExamBrief };
