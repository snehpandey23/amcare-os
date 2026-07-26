/**
 * Unknown questions → documentation roadmap (client v1; sync via API when configured).
 */
const GAPS_KEY = "siya-kb-gaps-v1";

export type KnowledgeGapRecord = {
  id: string;
  question: string;
  department: string;
  task: string;
  status: "awaiting_policy" | "notified";
  createdAt: number;
  notifiedAt?: number;
};

function load(): KnowledgeGapRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GAPS_KEY);
    return raw ? (JSON.parse(raw) as KnowledgeGapRecord[]) : [];
  } catch {
    return [];
  }
}

function save(rows: KnowledgeGapRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAPS_KEY, JSON.stringify(rows.slice(-200)));
}

export function listKnowledgeGaps() {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function notifyOwnerForGap(opts: {
  question: string;
  department: string;
  task: string;
}): KnowledgeGapRecord {
  const row: KnowledgeGapRecord = {
    id: `gap-${Date.now()}`,
    question: opts.question.trim().slice(0, 2000),
    department: opts.department,
    task: opts.task,
    status: "notified",
    createdAt: Date.now(),
    notifiedAt: Date.now(),
  };
  const next = [...load(), row];
  save(next);
  return row;
}

export function topMissingQuestions(limit = 10) {
  const counts = new Map<string, number>();
  for (const g of load()) {
    const key = g.question.toLowerCase().trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([question, count]) => ({ question, count }));
}
