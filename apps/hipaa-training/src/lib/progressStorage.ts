import type { ProgressState, QuizAttemptRecord, WorkforceRole } from "./types";
import { COURSE_VERSION } from "@/content/modules";
import { mergeTopicStats } from "./scoring";

const STORAGE_KEY = "hipaa-training-progress-v1";

function defaultState(role: WorkforceRole): ProgressState {
  const now = Date.now();
  return {
    version: STORAGE_KEY,
    courseVersion: COURSE_VERSION,
    role,
    startedAt: now,
    updatedAt: now,
    secondsInCourse: 0,
    modulesCompleted: [],
    moduleQuizScores: {},
    topicStats: {},
  };
}

export function loadProgress(roleFallback: WorkforceRole = "other"): ProgressState {
  if (typeof window === "undefined") return defaultState(roleFallback);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState(roleFallback);
    const parsed = JSON.parse(raw) as ProgressState;
    if (!parsed.version || parsed.courseVersion !== COURSE_VERSION) {
      return defaultState(parsed.role ?? roleFallback);
    }
    return parsed;
  } catch {
    return defaultState(roleFallback);
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function touchTime(secondsDelta: number): void {
  const p = loadProgress();
  p.secondsInCourse += Math.max(0, secondsDelta);
  saveProgress(p);
}

export function updateAfterModuleQuiz(
  moduleId: string,
  correct: number,
  total: number,
  attempts: QuizAttemptRecord[]
): void {
  const p = loadProgress();
  p.moduleQuizScores[moduleId] = { correct, total, at: Date.now() };
  p.topicStats = mergeTopicStats(p.topicStats, attempts);
  if (!p.modulesCompleted.includes(moduleId)) p.modulesCompleted.push(moduleId);
  saveProgress(p);
}

export function updateFinalExam(attempts: QuizAttemptRecord[], readiness: "ready" | "needs_review"): void {
  const p = loadProgress();
  const graded = attempts.filter((a) => !a.wasReinforcement);
  const correct = graded.filter((a) => a.correct).length;
  p.finalExam = {
    correct,
    total: graded.length,
    attempts,
    at: Date.now(),
    readiness,
  };
  p.topicStats = mergeTopicStats(p.topicStats, attempts);
  saveProgress(p);
}

export function setRole(role: WorkforceRole): void {
  const p = loadProgress();
  p.role = role;
  saveProgress(p);
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
