import type { ProgressState, QuizAttemptRecord, WorkforceRole } from "./types";
import { COURSE_VERSION } from "@/content/modules";
import { mergeTopicStats } from "./scoring";
import { getTrainingApiUrl } from "./trainingConfig";
import { getStoredToken } from "./authStorage";

const STORAGE_KEY = "hipaa-training-progress-v1";
const REMOTE_DEBOUNCE_MS = 900;

export { STORAGE_KEY };

let remoteTimer: ReturnType<typeof setTimeout> | null = null;
let latestForRemote: ProgressState | null = null;

export function defaultState(role: WorkforceRole): ProgressState {
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

/** Normalize JSON from server or localStorage; reset if course version mismatch. */
export function normalizeParsedProgress(
  parsed: Partial<ProgressState> | null | undefined,
  roleFallback: WorkforceRole
): ProgressState {
  const base = defaultState((parsed?.role as WorkforceRole) ?? roleFallback);
  if (!parsed || typeof parsed !== "object") return base;
  if (!parsed.version || parsed.courseVersion !== COURSE_VERSION) {
    return defaultState((parsed.role as WorkforceRole) ?? roleFallback);
  }
  return {
    ...base,
    ...parsed,
    version: STORAGE_KEY,
    courseVersion: COURSE_VERSION,
  };
}

export function loadLocalProgress(roleFallback: WorkforceRole = "other"): ProgressState {
  if (typeof window === "undefined") return defaultState(roleFallback);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState(roleFallback);
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return normalizeParsedProgress(parsed, roleFallback);
  } catch {
    return defaultState(roleFallback);
  }
}

export function saveLocalProgress(state: ProgressState): void {
  if (typeof window === "undefined") return;
  const next = { ...state, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function scheduleDebouncedRemoteSave(state: ProgressState): void {
  const api = getTrainingApiUrl();
  const token = getStoredToken();
  if (!api || !token) return;
  latestForRemote = state;
  if (remoteTimer) clearTimeout(remoteTimer);
  remoteTimer = setTimeout(() => {
    remoteTimer = null;
    const s = latestForRemote;
    if (s) void pushProgressToServer(s);
  }, REMOTE_DEBOUNCE_MS);
}

export async function pushProgressToServer(state: ProgressState): Promise<boolean> {
  const api = getTrainingApiUrl();
  const token = getStoredToken();
  if (!api || !token) return false;
  try {
    const res = await fetch(`${api}/api/training/progress`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function pullProgressFromServer(token: string): Promise<ProgressState | null> {
  const api = getTrainingApiUrl();
  if (!api) return null;
  try {
    const res = await fetch(`${api}/api/training/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { progress: unknown };
    if (!data.progress || typeof data.progress !== "object") return null;
    return normalizeParsedProgress(data.progress as Partial<ProgressState>, "other");
  } catch {
    return null;
  }
}

/** Persist locally and sync to server (debounced) when authenticated. */
export function persistProgress(state: ProgressState): void {
  saveLocalProgress(state);
  scheduleDebouncedRemoteSave(state);
}

export function touchTime(secondsDelta: number, getBase: () => ProgressState): ProgressState {
  const prev = getBase();
  const p = {
    ...prev,
    secondsInCourse: prev.secondsInCourse + Math.max(0, secondsDelta),
  };
  persistProgress(p);
  return p;
}

export function updateAfterModuleQuiz(
  moduleId: string,
  correct: number,
  total: number,
  attempts: QuizAttemptRecord[],
  getBase: () => ProgressState
): ProgressState {
  const prev = getBase();
  const completed = prev.modulesCompleted.includes(moduleId)
    ? prev.modulesCompleted
    : [...prev.modulesCompleted, moduleId];
  const p = {
    ...prev,
    moduleQuizScores: { ...prev.moduleQuizScores, [moduleId]: { correct, total, at: Date.now() } },
    topicStats: mergeTopicStats(prev.topicStats, attempts),
    modulesCompleted: completed,
  };
  persistProgress(p);
  return p;
}

export function updateFinalExam(
  attempts: QuizAttemptRecord[],
  readiness: "ready" | "needs_review",
  getBase: () => ProgressState
): ProgressState {
  const prev = getBase();
  const graded = attempts.filter((a) => !a.wasReinforcement);
  const correct = graded.filter((a) => a.correct).length;
  const p = {
    ...prev,
    finalExam: {
      correct,
      total: graded.length,
      attempts,
      at: Date.now(),
      readiness,
    },
    topicStats: mergeTopicStats(prev.topicStats, attempts),
  };
  persistProgress(p);
  return p;
}

export function setRole(role: WorkforceRole, getBase: () => ProgressState): ProgressState {
  const prev = getBase();
  const p = { ...prev, role };
  persistProgress(p);
  return p;
}

export function setLearnerName(name: string, getBase: () => ProgressState): ProgressState {
  const prev = getBase();
  const trimmed = name.trim();
  const p: ProgressState = { ...prev };
  if (trimmed) p.learnerName = trimmed;
  else delete p.learnerName;
  persistProgress(p);
  return p;
}

export function clearLocalProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function resetProgressRemote(): Promise<void> {
  clearLocalProgress();
  const fresh = defaultState("other");
  saveLocalProgress(fresh);
  const token = getStoredToken();
  if (token) {
    await pushProgressToServer(fresh);
  }
}
