/**
 * Client for monthly sitting HTTP API (§8.2) — auth API base URL.
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import type { ExamSectionId } from "./types";
import type { SeenEntry } from "./seen-set";

export type SittingCatalog = {
  id: string;
  label: string;
  opensAt: string;
  closesAt: string;
};

export type SectionAggregate = {
  status: "attempted" | "not_attempted";
  averageScore?: number;
  attemptCount?: number;
  totalActiveSec?: number;
  lastAttemptAt?: string;
  safetyAnyRedFlag?: boolean;
};

export type CompositePreview = {
  sections: Record<string, SectionAggregate>;
  pointsEarned: number;
  pointsPossible: 100;
  incompleteSectionIds: ExamSectionId[];
  incompleteNote: string;
};

export type CurrentSittingResponse = {
  sitting: SittingCatalog;
  status: "open" | "closed";
  sectionAggregates: Record<string, SectionAggregate>;
  compositePreview: CompositePreview;
  firstActivityAt: string | null;
  closedAt: string | null;
  attempts: unknown[];
};

export type SubmitSittingAttemptBody = {
  id: string;
  activeSec: number;
  sectionScore: number | null;
  startedAt?: string | null;
  submittedAt?: string;
  itemIds: string[];
  repeatedIds: string[];
  safetyRedFlagged?: boolean;
  safetyJson?: unknown;
  trailJson?: unknown;
  contentFingerprint?: string | null;
  seenRecords?: Array<{ pool: string; ids: string[]; repeatedIds: string[] }>;
};

function apiBase(): string | null {
  const u = getTrainingApiUrl();
  return u ? u.replace(/\/$/, "") : null;
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

export async function fetchCurrentSitting(): Promise<CurrentSittingResponse | null> {
  const base = apiBase();
  if (!base || !getStoredToken()) return null;
  const res = await fetch(`${base}/api/competency-exam/sittings/current`, {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  return (await res.json()) as CurrentSittingResponse;
}

export async function fetchSittingSeen(
  sittingId: string,
  pool?: string,
): Promise<SeenEntry[]> {
  const base = apiBase();
  if (!base || !getStoredToken()) return [];
  const q = pool ? `?pool=${encodeURIComponent(pool)}` : "";
  const res = await fetch(`${base}/api/competency-exam/sittings/${encodeURIComponent(sittingId)}/seen${q}`, {
    headers: authHeaders(),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    seen?: Array<{ pool: string; id: string; attemptId: string; at: number; repeated: boolean; sittingId: string }>;
  };
  return (data.seen || []).map((s) => ({
    pool: s.pool,
    id: s.id,
    attemptId: s.attemptId,
    at: s.at,
    repeated: s.repeated,
    sittingId: s.sittingId,
  }));
}

export async function submitSittingSectionAttempt(
  sittingId: string,
  section: ExamSectionId,
  body: SubmitSittingAttemptBody,
): Promise<{
  ok: boolean;
  attempt?: { attemptIndex: number; sectionScore: number | null };
  sectionAggregates?: Record<string, SectionAggregate>;
  compositePreview?: CompositePreview;
  error?: string;
}> {
  const base = apiBase();
  if (!base || !getStoredToken()) return { ok: false, error: "Not signed in" };
  const res = await fetch(
    `${base}/api/competency-exam/sittings/${encodeURIComponent(sittingId)}/sections/${encodeURIComponent(section)}/attempts`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    },
  );
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return { ok: false, error: typeof data.error === "string" ? data.error : `HTTP ${res.status}` };
  }
  return {
    ok: true,
    attempt: data.attempt as { attemptIndex: number; sectionScore: number | null },
    sectionAggregates: data.sectionAggregates as Record<string, SectionAggregate>,
    compositePreview: data.compositePreview as CompositePreview,
  };
}

export type SittingHistoryRow = {
  sittingId: string;
  label: string;
  opensAt: string;
  closesAt: string;
  status: "open" | "closed";
  firstActivityAt: string | null;
  closedAt: string | null;
  sectionAggregates: Record<string, SectionAggregate>;
  composite: CompositePreview;
  compositeSummary: CompositePreview | null;
  userId?: string;
  userEmail?: string | null;
  userName?: string | null;
};

export type SittingTrendRow = {
  sittingId: string;
  label: string;
  pointsEarned: number | null;
  pointsDelta: number | null;
  sections: Record<
    ExamSectionId,
    { averageScore: number | null; previousAverage: number | null; delta: number | null }
  >;
};

export async function fetchMySittingHistory(): Promise<{
  sittings: SittingHistoryRow[];
  trends: SittingTrendRow[];
} | null> {
  const base = apiBase();
  if (!base || !getStoredToken()) return null;
  const res = await fetch(`${base}/api/competency-exam/sittings/mine?limit=24`, {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { sittings?: SittingHistoryRow[]; trends?: SittingTrendRow[] };
  return { sittings: data.sittings ?? [], trends: data.trends ?? [] };
}

export async function fetchAdminSittingHistory(opts?: {
  userId?: string;
  sittingId?: string;
}): Promise<{ sittings: SittingHistoryRow[]; trends: SittingTrendRow[] } | null> {
  const base = apiBase();
  if (!base || !getStoredToken()) return null;
  const qs = new URLSearchParams();
  if (opts?.userId) qs.set("userId", opts.userId);
  if (opts?.sittingId) qs.set("sittingId", opts.sittingId);
  qs.set("limit", "100");
  const res = await fetch(`${base}/api/admin/competency-exam/sittings?${qs.toString()}`, {
    headers: authHeaders(),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { sittings?: SittingHistoryRow[]; trends?: SittingTrendRow[] };
  return { sittings: data.sittings ?? [], trends: data.trends ?? [] };
}
export function hubSectionHref(section: ExamSectionId): string {
  return `/learn/competency-exam/sitting?section=${section}`;
}

export const HUB_PATH = "/learn/competency-exam/sitting";
