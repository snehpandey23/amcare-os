import type { SeenEntry } from "./seen-set";
import type { ExamReportModel } from "./types";

const SEEN_KEY = "siya-competency-exam-seen-v1";
const ATTEMPTS_KEY = "siya-competency-exam-attempts-v1";
/** Isolated section reviews — item-level audit trail (not a scored sitting). */
const REVIEW_ATTEMPTS_KEY = "siya-competency-exam-review-attempts-v1";

export type StoredAttempt = {
  attemptId: string;
  userId: string;
  report: ExamReportModel;
};

export type IsolatedReviewItemResult = {
  id: string;
  moduleId?: string;
  prompt: string;
  selectedKey: string | null;
  correctKey: string;
  correct: boolean;
  options?: { key: string; text: string }[];
};

/** Writing isolated review trail — same REVIEW_ATTEMPTS_KEY as HIPAA items. */
export type IsolatedWritingPartTrail = {
  wordCount: number;
  grammarScore: number;
  issues: string[];
  llmEstimate: number | null;
  blendedScore: number;
};

export type IsolatedWritingTrail = {
  promptId: string;
  title: string;
  /** Scenario / prompt text shown to the taker */
  prompt: string;
  format: "clinical-two-part" | "legacy-single";
  /** Legacy single-box text (patient-comms); empty when clinical-two-part */
  text: string;
  chartNote: string;
  escalationText: string;
  wordCount: number;
  grammarScore: number;
  issues: string[];
  llmEstimate: number | null;
  blendedScore: number;
  partA?: IsolatedWritingPartTrail;
  partB?: IsolatedWritingPartTrail;
  escalationHasAskHint?: boolean;
};

export type IsolatedReviewAttempt = {
  attemptId: string;
  userId: string;
  section: "typing" | "hipaa" | "writing" | "chat-sim";
  at: number;
  score: number | null;
  detail: string;
  itemIds: string[];
  repeatedIds: string[];
  items: IsolatedReviewItemResult[];
  writing?: IsolatedWritingTrail;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadSeen(userId: string): SeenEntry[] {
  const all = readJson<Record<string, SeenEntry[]>>(SEEN_KEY, {});
  return all[userId] ?? [];
}

export function saveSeen(userId: string, entries: SeenEntry[]) {
  if (typeof window === "undefined") return;
  const all = readJson<Record<string, SeenEntry[]>>(SEEN_KEY, {});
  all[userId] = entries;
  localStorage.setItem(SEEN_KEY, JSON.stringify(all));
}

export function loadAttempts(): StoredAttempt[] {
  return readJson<StoredAttempt[]>(ATTEMPTS_KEY, []);
}

export function saveAttempt(row: StoredAttempt) {
  if (typeof window === "undefined") return;
  const all = loadAttempts().filter((a) => a.attemptId !== row.attemptId);
  all.push(row);
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(all.slice(-30)));
}

export function loadIsolatedReviews(userId?: string): IsolatedReviewAttempt[] {
  const all = readJson<IsolatedReviewAttempt[]>(REVIEW_ATTEMPTS_KEY, []);
  if (!userId) return all;
  return all.filter((r) => r.userId === userId);
}

export function saveIsolatedReview(row: IsolatedReviewAttempt) {
  if (typeof window === "undefined") return;
  const all = loadIsolatedReviews().filter((a) => a.attemptId !== row.attemptId);
  all.push(row);
  localStorage.setItem(REVIEW_ATTEMPTS_KEY, JSON.stringify(all.slice(-40)));
}

export function getIsolatedReview(attemptId: string): IsolatedReviewAttempt | null {
  return loadIsolatedReviews().find((r) => r.attemptId === attemptId) ?? null;
}

export function latestReportFor(userId: string): ExamReportModel | null {
  const rows = loadAttempts().filter((a) => a.userId === userId);
  return rows.length ? rows[rows.length - 1]!.report : null;
}
