/**
 * Client-side presentation helpers for Ops dashboard (same payload, clearer layout).
 */

import type { OpsEngagementRow, OpsLeadResponsivenessRow } from "@/lib/ops-dashboard-api";
import type { PlannedVsActualRow } from "@/components/shift/PlannedVsActualPanel";

/** Known QA / automation inboxes — hidden from Section A by default. */
const OPS_TEST_EMAILS = new Set([
  "qa-test@siya.health",
  "qa-feedback-inbox@siya.health",
]);

export function isOpsTestAccount(email: string): boolean {
  const e = email.trim().toLowerCase();
  if (OPS_TEST_EMAILS.has(e)) return true;
  // Extra QA patterns (still toggleable via “show test accounts”)
  const local = e.split("@")[0] || "";
  return /^qa[-._]/i.test(local) || local.includes("test-automation");
}

export function isNotEngagedYet(row: OpsEngagementRow): boolean {
  return row.askTurnsLast30d === 0 && row.practiceLifetime === 0;
}

/** Not engaged first (actionable), then most Ask activity in 14d. */
export function sortEngagementRows(rows: OpsEngagementRow[]): OpsEngagementRow[] {
  return [...rows].sort((a, b) => {
    const aCold = isNotEngagedYet(a) ? 0 : 1;
    const bCold = isNotEngagedYet(b) ? 0 : 1;
    if (aCold !== bCold) return aCold - bCold;
    if (b.askTurnsLast14d !== a.askTurnsLast14d) return b.askTurnsLast14d - a.askTurnsLast14d;
    if (b.askTurnsLast30d !== a.askTurnsLast30d) return b.askTurnsLast30d - a.askTurnsLast30d;
    if (b.practiceLifetime !== a.practiceLifetime) return b.practiceLifetime - a.practiceLifetime;
    return (a.name || a.email).localeCompare(b.name || b.email);
  });
}

export function filterEngagementRows(
  rows: OpsEngagementRow[],
  showTestAccounts: boolean,
): { visible: OpsEngagementRow[]; hiddenTestCount: number } {
  if (showTestAccounts) {
    return { visible: sortEngagementRows(rows), hiddenTestCount: 0 };
  }
  const visible: OpsEngagementRow[] = [];
  let hiddenTestCount = 0;
  for (const r of rows) {
    if (isOpsTestAccount(r.email)) hiddenTestCount += 1;
    else visible.push(r);
  }
  return { visible: sortEngagementRows(visible), hiddenTestCount };
}

/** Urgency: oldest pending SOP age first, then pending count. */
export function sortLeadsByUrgency(rows: OpsLeadResponsivenessRow[]): OpsLeadResponsivenessRow[] {
  return [...rows].sort((a, b) => {
    const aAge = a.sopQueue.oldestPendingAgeDays ?? -1;
    const bAge = b.sopQueue.oldestPendingAgeDays ?? -1;
    const aHas = a.sopQueue.pendingCount > 0;
    const bHas = b.sopQueue.pendingCount > 0;
    if (aHas !== bHas) return aHas ? -1 : 1;
    if (bAge !== aAge) return bAge - aAge;
    if (b.sopQueue.pendingCount !== a.sopQueue.pendingCount) {
      return b.sopQueue.pendingCount - a.sopQueue.pendingCount;
    }
    const aMiss = a.weeklyCheckIn.submittedThisWeek ? 1 : 0;
    const bMiss = b.weeklyCheckIn.submittedThisWeek ? 1 : 0;
    if (aMiss !== bMiss) return aMiss - bMiss;
    return (a.name || a.email).localeCompare(b.name || b.email);
  });
}

export type OpsAttentionItem = {
  id: string;
  label: string;
  tone: "warn" | "ok" | "info";
};

export function buildOpsAttentionSummary(input: {
  engagement: OpsEngagementRow[] | null;
  leads: OpsLeadResponsivenessRow[];
  coverageGapCount: number;
  showTestAccounts: boolean;
}): OpsAttentionItem[] {
  const items: OpsAttentionItem[] = [];
  const leads = input.leads;

  const staleLeads = leads.filter(
    (l) => (l.sopQueue.oldestPendingAgeDays ?? 0) >= 21 && l.sopQueue.pendingCount > 0,
  );
  const staleSopCount = staleLeads.reduce((n, l) => n + l.sopQueue.pendingCount, 0);
  const maxStaleAge = Math.max(0, ...staleLeads.map((l) => l.sopQueue.oldestPendingAgeDays ?? 0));
  if (staleSopCount > 0) {
    items.push({
      id: "stale-sops",
      label: `${staleSopCount} SOP${staleSopCount === 1 ? "" : "s"} pending ≥3 weeks${
        maxStaleAge ? ` (oldest ${maxStaleAge}d)` : ""
      }`,
      tone: "warn",
    });
  } else {
    items.push({ id: "stale-sops-ok", label: "No SOP queues ≥3 weeks old", tone: "ok" });
  }

  const missingCheckIns = leads.filter((l) => !l.weeklyCheckIn.submittedThisWeek).length;
  if (missingCheckIns > 0) {
    items.push({
      id: "checkins",
      label: `${missingCheckIns} lead${missingCheckIns === 1 ? "" : "s"} missing this week’s check-in`,
      tone: "warn",
    });
  } else if (leads.length > 0) {
    items.push({ id: "checkins-ok", label: "All leads filed this week’s check-in", tone: "ok" });
  }

  if (input.coverageGapCount > 0) {
    items.push({
      id: "coverage",
      label: `${input.coverageGapCount} coverage gap hour${input.coverageGapCount === 1 ? "" : "s"} in next 7 days`,
      tone: "warn",
    });
  } else {
    items.push({ id: "coverage-ok", label: "No zero-coverage hours in next 7 days", tone: "ok" });
  }

  if (input.engagement) {
    const { visible } = filterEngagementRows(input.engagement, input.showTestAccounts);
    const cold = visible.filter(isNotEngagedYet).length;
    if (cold > 0) {
      items.push({
        id: "not-engaged",
        label: `${cold} staff not engaged yet (0 Ask · 0 practice)`,
        tone: "warn",
      });
    } else {
      items.push({
        id: "not-engaged-ok",
        label: "Every listed staff member has some Ask or practice activity",
        tone: "ok",
      });
    }
  }

  return items;
}

export type PersonScheduleGroup = {
  key: string;
  displayName: string;
  email: string | null;
  rows: PlannedVsActualRow[];
  /** Worst outcome across segments for badge emphasis */
  primaryOutcome: string;
};

function personKey(row: PlannedVsActualRow): string {
  return row.roster.userId || row.roster.personKey || row.roster.id;
}

function displayPerson(row: PlannedVsActualRow): string {
  return row.roster.userName?.trim() || row.roster.userEmail || row.roster.personKey;
}

const OUTCOME_RANK: Record<string, number> = {
  missed: 0,
  started_late: 1,
  no_user: 2,
  in_progress: 3,
  upcoming: 4,
  started_on_time: 5,
  scheduled_off: 6,
};

export function groupPlannedVsActualByPerson(rows: PlannedVsActualRow[]): PersonScheduleGroup[] {
  const map = new Map<string, PlannedVsActualRow[]>();
  for (const row of rows) {
    const k = personKey(row);
    const list = map.get(k);
    if (list) list.push(row);
    else map.set(k, [row]);
  }
  const groups: PersonScheduleGroup[] = [];
  for (const [key, groupRows] of map) {
    const sorted = [...groupRows].sort((a, b) => {
      const as = a.roster.shiftStart || "";
      const bs = b.roster.shiftStart || "";
      return as.localeCompare(bs);
    });
    const primary = [...sorted].sort(
      (a, b) => (OUTCOME_RANK[a.outcome] ?? 9) - (OUTCOME_RANK[b.outcome] ?? 9),
    )[0];
    groups.push({
      key,
      displayName: displayPerson(sorted[0]!),
      email: sorted[0]!.roster.userEmail,
      rows: sorted,
      primaryOutcome: primary?.outcome || sorted[0]!.outcome,
    });
  }
  return groups.sort((a, b) => {
    const ar = OUTCOME_RANK[a.primaryOutcome] ?? 9;
    const br = OUTCOME_RANK[b.primaryOutcome] ?? 9;
    if (ar !== br) return ar - br;
    return a.displayName.localeCompare(b.displayName);
  });
}
