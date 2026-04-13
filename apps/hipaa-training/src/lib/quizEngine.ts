import type { Question, QuizAttemptRecord, WorkforceRole } from "./types";
import { getQuestionsForModule, primaryTag, ALL_QUESTIONS } from "@/content/questionBank";

function shuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface ModuleQuizPlan {
  orderedIds: string[];
}

/**
 * Build module quiz: shuffle with optional bias toward harder items if learner is strong,
 * and append extra items from weak tags (pulled from same module + lower difficulty first).
 */
export function buildModuleQuizQueue(args: {
  moduleId: string;
  role?: WorkforceRole;
  /** tag -> accuracy 0-1 from prior sessions */
  topicAccuracy: Record<string, number>;
  /** seed for reproducible shuffle per attempt */
  seed: number;
}): ModuleQuizPlan {
  const pool = getQuestionsForModule(args.moduleId, args.role);
  let ordered = shuffle(pool, args.seed);

  const weakTags = Object.entries(args.topicAccuracy)
    .filter(([, acc]) => args.topicAccuracy && acc < 0.55 && acc > 0)
    .map(([t]) => t);

  const extras: Question[] = [];
  for (const tag of weakTags) {
    const add = pool.filter((q) => q.tags.includes(tag) && q.difficulty <= 2);
    extras.push(...shuffle(add, args.seed + tag.length).slice(0, 2));
  }

  const seen = new Set<string>();
  const finalList: Question[] = [];
  const strong = Object.values(args.topicAccuracy).length && Object.values(args.topicAccuracy).every((a) => a >= 0.85);

  let skipRoll = args.seed % 100;
  for (const q of ordered) {
    skipRoll = (skipRoll * 17 + 9) % 100;
    if (strong && q.difficulty === 1 && skipRoll < 35) continue;
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    finalList.push(q);
  }
  for (const q of extras) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    finalList.push(q);
  }

  return { orderedIds: finalList.map((q) => q.id) };
}

export function pickReinforcementQuestion(args: {
  moduleId: string;
  wrongQuestion: Question;
  usedIds: Set<string>;
  role?: WorkforceRole;
}): Question | null {
  const pool = getQuestionsForModule(args.moduleId, args.role).filter(
    (q) => !args.usedIds.has(q.id) && q.difficulty <= 2
  );
  const tag = primaryTag(args.wrongQuestion);
  const tagged = pool.filter((q) => q.tags.includes(tag));
  const pickFrom = tagged.length ? tagged : pool;
  if (!pickFrom.length) return null;
  const h =
    [...args.wrongQuestion.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) +
    args.usedIds.size;
  const choice = pickFrom[h % pickFrom.length];
  return choice ?? null;
}

export function evaluateAnswer(question: Question, selectedKey: string): boolean {
  return selectedKey === question.correctKey;
}

export function recordToAttempt(
  question: Question,
  selectedKey: string,
  reinforcement: boolean
): QuizAttemptRecord {
  return {
    questionId: question.id,
    selectedKey,
    correct: evaluateAnswer(question, selectedKey),
    primaryTag: primaryTag(question),
    wasReinforcement: reinforcement,
    at: Date.now(),
  };
}

/** Final exam: 20 questions (within 15–25), stratified across modules with weakness weighting. */
export function buildFinalExam(args: {
  moduleIds: string[];
  role?: WorkforceRole;
  topicAccuracy: Record<string, number>;
  count?: number;
  seed: number;
}): ModuleQuizPlan {
  const count = Math.min(25, Math.max(15, args.count ?? 20));
  const per = Math.max(1, Math.floor(count / args.moduleIds.length));
  const weakTags = new Set(
    Object.entries(args.topicAccuracy)
      .filter(([, a]) => a < 0.6)
      .map(([t]) => t)
  );

  const picked: Question[] = [];
  const used = new Set<string>();

  for (const mid of shuffle([...args.moduleIds], args.seed)) {
    let pool = getQuestionsForModule(mid, args.role).filter((q) => !used.has(q.id));
    if (pool.length === 0) continue;
    const weakFirst = pool.filter((q) => q.tags.some((t) => weakTags.has(t)));
    const prefer = weakFirst.length ? shuffle(weakFirst, args.seed + mid.length) : shuffle(pool, args.seed + mid.length);
    const chunk = prefer.slice(0, per);
    for (const q of chunk) {
      used.add(q.id);
      picked.push(q);
    }
  }

  let i = 0;
  while (picked.length < count && i < 200) {
    i++;
    const filler = shuffle(
      ALL_QUESTIONS.filter((q) => args.moduleIds.includes(q.moduleId) && !used.has(q.id)),
      args.seed + i
    )[0];
    if (!filler) break;
    used.add(filler.id);
    picked.push(filler);
  }

  if (picked.length > count) picked.length = count;
  return { orderedIds: shuffle(picked, args.seed + 99).map((q) => q.id) };
}
