import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";

export type OpsEngagementRow = {
  userId: string;
  email: string;
  name: string | null;
  askTurnsLast14d: number;
  askTurnsLast30d: number;
  usageSegment: string;
  totalXp: number;
  streak: number;
  lastActiveDate: string;
  practiceLifetime: number;
  dayLedger: unknown[];
  practiceShareThisWeek: {
    optedInShared: boolean;
    drillDaysActive: number;
    drillDaysShared: number;
    weekStart: string;
    weekEnd: string;
  };
};

export type OpsLeadResponsivenessRow = {
  userId: string;
  email: string;
  name: string | null;
  departments: string[];
  sopQueue: {
    pendingCount: number;
    oldestPendingTitle: string | null;
    oldestPendingAgeDays: number | null;
    oldestPendingSubmittedAt: string | null;
  };
  gapDigest: {
    lastWeekStart: string | null;
    lastSentAt: string | null;
    gapsInLastDigest: number | null;
    stillOpenEligible: number;
    resolvedSinceDigest: number | null;
    avgResolveDaysLast30d: number | null;
  };
  weeklyCheckIn: {
    submittedThisWeek: boolean;
    thisWeekStart: string;
    weeksSubmittedOfLastN: number;
    lastNWeeks: number;
    history: { weekStart: string; submitted: boolean }[];
  };
};

export type OpsDashboardPayload = {
  viewer: { isAdmin: boolean; isLead: boolean };
  engagement: OpsEngagementRow[] | null;
  leadResponsiveness: OpsLeadResponsivenessRow[];
  coverageGaps: {
    rosterDate: string;
    windowStart: string;
    windowEnd: string;
    scheduledCount: number;
    label: string;
  }[];
  scheduledVsActual: import("@/components/shift/PlannedVsActualPanel").PlannedVsActualRow[];
  rosterDate: string;
  generatedAt: string;
};

export async function fetchOpsDashboard(): Promise<OpsDashboardPayload> {
  const base = getTrainingApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const res = await fetch(`${base}/api/ops/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = (await res.json().catch(() => ({}))) as OpsDashboardPayload & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
