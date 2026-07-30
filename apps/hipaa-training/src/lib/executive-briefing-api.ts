import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type BriefingConfidence = "high" | "medium" | "low";

export type ExecutiveCardMeta = {
  confidence: BriefingConfidence;
  freshnessSeconds: number;
  evidenceCount: number;
  whatHappened: string;
  whyItMatters: string;
  recommendedAction: string;
};

export type ExecutiveBriefing = {
  generatedAt: string;
  greetingName: string | null;
  cards: {
    teamCoverage: ExecutiveCardMeta & {
      working: number;
      focus: number;
      onBreak: number;
      onShift: number;
    };
    overdueWork: ExecutiveCardMeta & {
      total: number;
      critical: number;
      boardHref: string;
    };
    knowledgeHealth: ExecutiveCardMeta & {
      unansweredQuestions: number;
      negativeResponses: number;
      pendingPromotions: number;
    };
    needsAttention: ExecutiveCardMeta & {
      total: number;
      groups: { label: string; items: string[] }[];
    };
  };
};

export async function fetchExecutiveBriefing(): Promise<ExecutiveBriefing> {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in to load briefing.");
  const res = await fetch(`${base}/api/executive/briefing`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = (await res.json().catch(() => ({}))) as ExecutiveBriefing & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const executiveBriefingKey = ["executive", "briefing"] as const;
