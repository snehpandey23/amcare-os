import type { Question, QuizAttemptRecord } from "./types";
import { getQuestionById } from "@/content/questionBank";

export interface TopicSummary {
  tag: string;
  correct: number;
  attempted: number;
  rate: number;
}

export interface FinalSummary {
  percent: number;
  strengths: TopicSummary[];
  weaknesses: TopicSummary[];
  readiness: "ready" | "needs_review";
}

const READY_THRESHOLD = 80;
const WEAK_THRESHOLD = 0.55;

export function mergeTopicStats(
  existing: Record<string, { correct: number; attempted: number }>,
  attempts: QuizAttemptRecord[]
): Record<string, { correct: number; attempted: number }> {
  const next = { ...existing };
  for (const a of attempts) {
    if (a.wasReinforcement) continue;
    const t = a.primaryTag;
    if (!next[t]) next[t] = { correct: 0, attempted: 0 };
    next[t].attempted += 1;
    if (a.correct) next[t].correct += 1;
  }
  return next;
}

export function summarizeTopics(stats: Record<string, { correct: number; attempted: number }>): TopicSummary[] {
  return Object.entries(stats).map(([tag, v]) => ({
    tag,
    correct: v.correct,
    attempted: v.attempted,
    rate: v.attempted ? v.correct / v.attempted : 0,
  }));
}

export function buildFinalSummary(attempts: QuizAttemptRecord[]): FinalSummary {
  const graded = attempts.filter((a) => !a.wasReinforcement);
  const correct = graded.filter((a) => a.correct).length;
  const total = graded.length;
  const percent = total ? Math.round((100 * correct) / total) : 0;

  const byTag: Record<string, { correct: number; attempted: number }> = {};
  for (const a of graded) {
    if (!byTag[a.primaryTag]) byTag[a.primaryTag] = { correct: 0, attempted: 0 };
    byTag[a.primaryTag].attempted += 1;
    if (a.correct) byTag[a.primaryTag].correct += 1;
  }
  const topics = summarizeTopics(byTag).filter((t) => t.attempted > 0);
  const strengths = topics.filter((t) => t.rate >= 0.7).sort((a, b) => b.rate - a.rate);
  const weaknesses = topics.filter((t) => t.rate < 0.7).sort((a, b) => a.rate - b.rate);

  const weakBucket = weaknesses.some((w) => w.rate < WEAK_THRESHOLD);
  const readiness: "ready" | "needs_review" =
    percent >= READY_THRESHOLD && !weakBucket ? "ready" : "needs_review";

  return { percent, strengths, weaknesses, readiness };
}

export function explainResult(
  question: Question,
  selectedKey: string
): { correct: boolean; headline: string; detail: string } {
  const correct = selectedKey === question.correctKey;
  const wrongHint = question.distractorHints?.[selectedKey];
  const detail = correct
    ? question.explanation
    : `${question.explanation}${wrongHint ? ` **Why not your choice:** ${wrongHint}` : ""}`;
  return {
    correct,
    headline: correct ? "Correct" : "Not quite — review the rationale",
    detail,
  };
}

export function attemptsFromIds(
  answers: Record<string, string>
): { attempts: QuizAttemptRecord[] } {
  const attempts: QuizAttemptRecord[] = [];
  for (const [qid, key] of Object.entries(answers)) {
    const q = getQuestionById(qid);
    if (!q) continue;
    attempts.push({
      questionId: qid,
      selectedKey: key,
      correct: key === q.correctKey,
      primaryTag: q.tags[0] ?? "general",
      wasReinforcement: false,
      at: Date.now(),
    });
  }
  return { attempts };
}
