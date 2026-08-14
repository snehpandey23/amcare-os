import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type AssistGapRecord = {
  id: string;
  department: string;
  departmentSlug: string;
  taskLabel: string;
  status: "open" | "resolved";
  phiRedacted: boolean;
  createdAt: string;
  resolvedAt: string | null;
};

async function gapsFetch(path: string, init?: RequestInit) {
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

export async function fetchMyOpenKnowledgeGaps(): Promise<{
  gaps: AssistGapRecord[];
  honestyNote: string;
}> {
  const data = (await gapsFetch("/api/assist/gaps")) as {
    gaps?: AssistGapRecord[];
    honestyNote?: string;
  };
  return {
    gaps: data.gaps ?? [],
    honestyNote:
      data.honestyNote ||
      "Counts reflect Notify owner clicks in Ask — not every unanswered query.",
  };
}

export async function resolveKnowledgeGap(id: string): Promise<AssistGapRecord> {
  const data = (await gapsFetch(`/api/assist/gaps/${encodeURIComponent(id)}/resolve`, {
    method: "POST",
    body: "{}",
  })) as { gap: AssistGapRecord };
  return data.gap;
}
