import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type BriefingConfidence = "high" | "medium" | "low";

export type TimeBudget = {
  clinical: number;
  usFundraising: number;
  indiaAmcare: number;
  other: number;
};

export type MonthlyOutcome = { id: string; text: string };

export type ReviewTrigger = {
  id: string;
  text: string;
  metricKey?: "ads_tx_cpa" | "ads_tx_conversions";
  thresholdPct?: number;
  weeks?: number;
};

export type MonthlyPlanRecord = {
  monthKey: string;
  northStar: string;
  timeBudget: TimeBudget;
  outcomes: MonthlyOutcome[];
  notDoing: string[];
  reviewTriggers: ReviewTrigger[];
  updatedAt: string;
};

export type DelegateLane = {
  lane: string;
  ownerName: string;
  note?: string;
};

export type ObserveOnlyFlag = {
  id: string;
  lane: string;
  instruction: string;
};

export type WeeklyPlanRecord = {
  weekStart: string;
  monthKey: string | null;
  founderFocus: string;
  canWait: string[];
  delegate: DelegateLane[];
  observeOnly: ObserveOnlyFlag[];
  updatedAt: string;
};

export type WeeklyActualsRecord = {
  weekStart: string;
  adsTxCpa: number | null;
  adsTxConversions: number | null;
  adsCampaignEdits: number;
  indiaGrantsIdentified: number | null;
  indiaApplicationsSubmitted: number | null;
  usIntroContacted: number | null;
  usIntroReplied: number | null;
  usIntroMeetings: number | null;
  notes: string | null;
  updatedAt: string;
};

export type PortalSignals = {
  openChatReviews: number;
  shiftHandoffsToday: number;
  overdueTasks: number;
  tasksDueToday: number;
  tasksDoneToday: number;
};

export type DriftEvidence = { id: string; label: string };

export type DriftFlag = {
  id: string;
  message: string;
  confidence: BriefingConfidence;
  evidence: DriftEvidence[];
  updatedAt: string;
  triggeredBy: string;
};

export type FounderCoachBrief = {
  phase: 1;
  statusLabel: "in_progress";
  generatedAt: string;
  weekStart: string;
  monthKey: string;
  monthlyPlan: MonthlyPlanRecord | null;
  weeklyPlan: WeeklyPlanRecord | null;
  actuals: WeeklyActualsRecord | null;
  priorWeekActuals: WeeklyActualsRecord | null;
  portalSignals: PortalSignals;
  driftFlags: DriftFlag[];
  canEditMonthly: boolean;
  canEditWeekly: boolean;
};

async function coachFetch(path: string, init?: RequestInit) {
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

export async function fetchFounderCoachBrief(): Promise<FounderCoachBrief> {
  return (await coachFetch("/api/founder-coach/brief")) as FounderCoachBrief;
}

export async function saveMonthlyPlan(body: Partial<MonthlyPlanRecord>): Promise<{ plan: MonthlyPlanRecord }> {
  return (await coachFetch("/api/founder-coach/monthly", {
    method: "PUT",
    body: JSON.stringify(body),
  })) as { plan: MonthlyPlanRecord };
}

export async function saveWeeklyPlan(body: Partial<WeeklyPlanRecord>): Promise<{ plan: WeeklyPlanRecord }> {
  return (await coachFetch("/api/founder-coach/weekly", {
    method: "PUT",
    body: JSON.stringify(body),
  })) as { plan: WeeklyPlanRecord };
}

export async function saveWeeklyActuals(
  weekStart: string,
  patch: Partial<Omit<WeeklyActualsRecord, "weekStart" | "updatedAt">>,
): Promise<{ actuals: WeeklyActualsRecord }> {
  return (await coachFetch("/api/founder-coach/actuals", {
    method: "PUT",
    body: JSON.stringify({ weekStart, ...patch }),
  })) as { actuals: WeeklyActualsRecord };
}

export async function logObserveEvent(
  observeId: string,
  note: string,
  weekStart?: string,
): Promise<void> {
  await coachFetch("/api/founder-coach/observe-events", {
    method: "POST",
    body: JSON.stringify({ observeId, note, weekStart }),
  });
}

export const founderCoachBriefKey = ["founder-coach", "brief"] as const;
