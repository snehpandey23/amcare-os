/**
 * Client-side assist metrics (v1 — no server DB required).
 * Export weekly for "missing knowledge" roadmap.
 */
const METRICS_KEY = "siya-assist-metrics-v1";

export type AssistMetricEvent =
  | { type: "question"; at: number; answered: boolean; escalated: boolean; knowledgeGap: boolean }
  | { type: "time_to_answer"; at: number; ms: number }
  | {
      type: "feedback";
      at: number;
      helpful: boolean;
      failureType?: string;
      department?: string;
      knowledgeGap?: boolean;
    };

type Store = { events: AssistMetricEvent[] };

function load(): Store {
  if (typeof window === "undefined") return { events: [] };
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    if (!raw) return { events: [] };
    const parsed = JSON.parse(raw) as Store;
    return parsed?.events ? parsed : { events: [] };
  } catch {
    return { events: [] };
  }
}

function save(store: Store) {
  if (typeof window === "undefined") return;
  const trimmed = { events: store.events.slice(-500) };
  localStorage.setItem(METRICS_KEY, JSON.stringify(trimmed));
}

export function recordQuestion(opts: {
  answered: boolean;
  escalated: boolean;
  knowledgeGap: boolean;
}) {
  const store = load();
  store.events.push({
    type: "question",
    at: Date.now(),
    answered: opts.answered,
    escalated: opts.escalated,
    knowledgeGap: opts.knowledgeGap,
  });
  save(store);
}

export function recordTimeToAnswer(ms: number) {
  const store = load();
  store.events.push({ type: "time_to_answer", at: Date.now(), ms });
  save(store);
}

export function recordAnswerFeedback(opts: {
  helpful: boolean;
  failureType?: string;
  department?: string;
  knowledgeGap?: boolean;
}) {
  const store = load();
  store.events.push({
    type: "feedback",
    at: Date.now(),
    helpful: opts.helpful,
    failureType: opts.failureType,
    department: opts.department,
    knowledgeGap: opts.knowledgeGap,
  });
  save(store);
}

export function countQuestionsSince(sinceMs: number): number {
  const store = load();
  return store.events.filter(
    (e): e is Extract<AssistMetricEvent, { type: "question" }> =>
      e.type === "question" && e.at >= sinceMs,
  ).length;
}

export function summarizeMetrics(days = 7) {
  const store = load();
  const since = Date.now() - days * 86400000;
  const questions = store.events.filter(
    (e): e is Extract<AssistMetricEvent, { type: "question" }> =>
      e.type === "question" && e.at >= since
  );
  const times = store.events.filter(
    (e): e is Extract<AssistMetricEvent, { type: "time_to_answer" }> =>
      e.type === "time_to_answer" && e.at >= since
  );
  const total = questions.length;
  const answered = questions.filter((q) => q.answered && !q.knowledgeGap).length;
  const gaps = questions.filter((q) => q.knowledgeGap).length;
  const escalated = questions.filter((q) => q.escalated).length;
  const avgMs = times.length ? Math.round(times.reduce((s, t) => s + t.ms, 0) / times.length) : null;

  return {
    periodDays: days,
    totalQuestions: total,
    firstAnswerRate: total ? Math.round((100 * answered) / total) : null,
    escalationRate: total ? Math.round((100 * escalated) / total) : null,
    missingKnowledgeCount: gaps,
    avgTimeToAnswerMs: avgMs,
  };
}
