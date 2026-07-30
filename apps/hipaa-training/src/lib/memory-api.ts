import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

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
  visibility: "private" | "org";
  metadata: Record<string, unknown>;
  expiresAt: string | null;
  createdAt: string;
};

export const IMPORTANCE_LABEL: Record<MemoryImportance, string> = {
  1: "Temporary",
  2: "Operational",
  3: "Strategic",
};

export const IMPORTANCE_HINT: Record<MemoryImportance, string> = {
  1: "Shift notes, meeting scraps — may archive after ~90 days.",
  2: "SOP updates, fixes, marketing learnings — kept for the org.",
  3: "Decisions, vision, pricing — canonical; never auto-archived.",
};

async function memoryFetch(path: string, init?: RequestInit) {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchRecentMemory(limit = 20): Promise<MemoryEntry[]> {
  const data = (await memoryFetch(`/api/memory/recent?limit=${limit}`)) as { entries: MemoryEntry[] };
  return data.entries ?? [];
}

export async function searchMemory(q: string, authToken?: string | null): Promise<MemoryEntry[]> {
  const base = getTrainingApiUrl();
  const token = authToken?.trim() || getStoredToken();
  if (!base || !token) return [];
  const res = await fetch(`${base}/api/memory/search?q=${encodeURIComponent(q)}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json().catch(() => ({}))) as { entries?: MemoryEntry[] };
  return data.entries ?? [];
}

export async function fetchWeekInReview(): Promise<{
  since: string;
  total: number;
  groups: {
    department: string;
    items: {
      title: string;
      body: string;
      importance: MemoryImportance;
      createdAt: string;
      authorName: string | null;
    }[];
  }[];
}> {
  return (await memoryFetch("/api/memory/week-in-review")) as {
    since: string;
    total: number;
    groups: {
      department: string;
      items: {
        title: string;
        body: string;
        importance: MemoryImportance;
        createdAt: string;
        authorName: string | null;
      }[];
    }[];
  };
}

export async function saveMemory(payload: {
  title: string;
  body: string;
  importance?: MemoryImportance;
  source?: MemorySource;
  department?: string;
  visibility?: "private" | "org";
  tags?: string[];
  metadata?: Record<string, unknown>;
}): Promise<MemoryEntry> {
  const data = (await memoryFetch("/api/memory", {
    method: "POST",
    body: JSON.stringify(payload),
  })) as { entry: MemoryEntry };
  return data.entry;
}
