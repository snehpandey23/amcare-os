/**
 * Client-side knowledge-gap cache (device only).
 * Never store verbatim question text when the server PHI guard redacted it.
 */
const GAPS_KEY = "siya-kb-gaps-v1";

export type KnowledgeGapRecord = {
  id: string;
  /** Empty when PHI-redacted — do not invent question text client-side. */
  question: string;
  department: string;
  task: string;
  status: "awaiting_policy" | "notified";
  createdAt: number;
  notifiedAt?: number;
  phiRedacted?: boolean;
  routeMode?: "lead_digest" | "founder_instant";
};

function load(): KnowledgeGapRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GAPS_KEY);
    return raw ? (JSON.parse(raw) as KnowledgeGapRecord[]) : [];
  } catch {
    return [];
  }
}

function save(rows: KnowledgeGapRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GAPS_KEY, JSON.stringify(rows.slice(-200)));
}

export function listKnowledgeGaps() {
  return load().sort((a, b) => b.createdAt - a.createdAt);
}

export function notifyOwnerForGap(opts: {
  question: string;
  department: string;
  task: string;
  /** When true, store department/task only — never the question. */
  phiRedacted?: boolean;
  routeMode?: "lead_digest" | "founder_instant";
  id?: string;
}): KnowledgeGapRecord {
  const phiRedacted = Boolean(opts.phiRedacted);
  const row: KnowledgeGapRecord = {
    id: opts.id || `gap-${Date.now()}`,
    question: phiRedacted ? "" : opts.question.trim().slice(0, 2000),
    department: opts.department,
    task: opts.task,
    status: "notified",
    createdAt: Date.now(),
    notifiedAt: Date.now(),
    phiRedacted,
    routeMode: opts.routeMode,
  };
  const next = [...load(), row];
  save(next);
  return row;
}

export function topMissingQuestions(limit = 10) {
  const counts = new Map<string, number>();
  for (const g of load()) {
    if (g.phiRedacted || !g.question.trim()) continue;
    const key = g.question.toLowerCase().trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([question, count]) => ({ question, count }));
}
