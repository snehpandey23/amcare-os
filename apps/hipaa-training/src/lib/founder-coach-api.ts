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
  prioritiesRaw?: string;
  lockedAt?: string | null;
  lockedBy?: string | null;
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

export type DomainTabId = "accounts" | "hr" | "clinical" | "marketing" | "compliance";

export type DomainItem = {
  id: string;
  label: string;
  detail?: string;
  urgencyDate: string | null;
  founderFlag: boolean;
  source: string;
  href?: string;
};

export type DomainCheckInSummary = {
  id: string;
  departmentLabel: string;
  weekStart: string;
  submitterName: string | null;
  whatChanged: string;
  keyNumbersStatus: string;
  blockers: string;
  founderShouldKnow: string;
  createdAt: string;
};

export type DomainSnapshot = {
  id: DomainTabId;
  title: string;
  status: "live" | "partial" | "not_tracked";
  summary: string;
  items: DomainItem[];
  checkins: DomainCheckInSummary[];
  placeholders: string[];
};

export type FounderCoachBrief = {
  phase: 1 | 2;
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
  /** Domain tabs — real portal rows only; may be empty array on older API */
  domains?: DomainSnapshot[];
  /** Same weekly_lead_checkins-derived items as domain tabs (not a parallel source) */
  leadCheckInSignals?: DomainItem[];
  canEditMonthly: boolean;
  canEditWeekly: boolean;
  isWeekLocked?: boolean;
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

export async function lockWeeklyPlan(weekStart: string): Promise<{ plan: WeeklyPlanRecord }> {
  return (await coachFetch("/api/founder-coach/weekly/lock", {
    method: "POST",
    body: JSON.stringify({ weekStart }),
  })) as { plan: WeeklyPlanRecord };
}

export async function unlockWeeklyPlan(weekStart: string): Promise<{ plan: WeeklyPlanRecord }> {
  return (await coachFetch("/api/founder-coach/weekly/unlock", {
    method: "POST",
    body: JSON.stringify({ weekStart }),
  })) as { plan: WeeklyPlanRecord };
}

export type WeeklyPlanDraft = {
  founderFocus: string;
  canWait: string[];
  delegate: DelegateLane[];
  observeOnly: ObserveOnlyFlag[];
  groundedOnly: boolean;
  method: "llm" | "deterministic";
  citations: string[];
  aiUnavailable?: {
    code: string;
    kind: string;
    userMessage: string;
  } | null;
};

/** Same-origin BFF — AI draft grounded in Phase 1 brief signals (or refine current draft). */
export async function draftWeeklyPlan(
  prioritiesRaw: string,
  opts?: {
    refineInstruction?: string;
    currentDraft?: Pick<WeeklyPlanDraft, "founderFocus" | "canWait" | "delegate" | "observeOnly" | "citations">;
  },
): Promise<{ draft: WeeklyPlanDraft }> {
  const token = getStoredToken();
  if (!token) throw new Error("Sign in required.");
  const res = await fetch("/api/founder-coach/draft-weekly", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prioritiesRaw,
      refineInstruction: opts?.refineInstruction,
      currentDraft: opts?.currentDraft,
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    draft?: WeeklyPlanDraft;
    basicDraft?: WeeklyPlanDraft;
    code?: string;
  };
  // Prefer structured draft (incl. deterministic + aiUnavailable). Legacy 503 + basicDraft still accepted.
  const draft = data.draft ?? data.basicDraft;
  if (draft) return { draft };
  if (!res.ok) {
    throw new Error(
      data.error ||
        (data.code === "llm_billing"
          ? "AI unavailable (billing). Add AI Gateway credits or fix model access — draft was not generated."
          : `Draft failed (${res.status})`),
    );
  }
  throw new Error("No draft returned");
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
