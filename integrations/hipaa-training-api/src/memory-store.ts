/** Organizational memory — structured, searchable, importance-tiered. */

export type MemoryImportance = 1 | 2 | 3;

export type MemorySource =
  | "shift_accomplishment"
  | "ask_resolved"
  | "knowledge_gap"
  | "reflection"
  | "learning"
  | "decision"
  | "manual"
  | "sop_update"
  | "weekly_digest";

export type MemoryVisibility = "private" | "org";

export type MemoryEntryRow = {
  id: string;
  author_user_id: string;
  source: MemorySource;
  importance: MemoryImportance;
  title: string;
  body: string;
  department: string | null;
  tags: string[];
  visibility: MemoryVisibility;
  metadata: Record<string, unknown>;
  expires_at: Date | null;
  created_at: Date;
  author_name?: string | null;
  author_email?: string | null;
};

export type MemoryEntry = {
  id: string;
  authorUserId: string;
  authorName: string | null;
  source: MemorySource;
  importance: MemoryImportance;
  title: string;
  body: string;
  department: string | null;
  tags: string[];
  visibility: MemoryVisibility;
  metadata: Record<string, unknown>;
  expiresAt: string | null;
  createdAt: string;
};

export const IMPORTANCE_LABEL: Record<MemoryImportance, string> = {
  1: "Temporary",
  2: "Operational",
  3: "Strategic",
};

export function defaultExpiresAt(importance: MemoryImportance): Date | null {
  if (importance !== 1) return null;
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 90);
  return d;
}

export function rowToEntry(row: MemoryEntryRow): MemoryEntry {
  return {
    id: row.id,
    authorUserId: row.author_user_id,
    authorName: row.author_name ?? null,
    source: row.source,
    importance: row.importance as MemoryImportance,
    title: row.title,
    body: row.body,
    department: row.department,
    tags: Array.isArray(row.tags) ? row.tags : [],
    visibility: row.visibility as MemoryVisibility,
    metadata: row.metadata ?? {},
    expiresAt: row.expires_at ? row.expires_at.toISOString() : null,
    createdAt: row.created_at.toISOString(),
  };
}

export function parseImportance(raw: unknown): MemoryImportance {
  const n = Number(raw);
  if (n === 2 || n === 3) return n;
  return 1;
}

export function parseSource(raw: unknown): MemorySource {
  const s = typeof raw === "string" ? raw : "manual";
  const allowed: MemorySource[] = [
    "shift_accomplishment",
    "ask_resolved",
    "knowledge_gap",
    "reflection",
    "learning",
    "decision",
    "manual",
    "sop_update",
    "weekly_digest",
  ];
  return allowed.includes(s as MemorySource) ? (s as MemorySource) : "manual";
}
