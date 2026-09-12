"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import {
  fetchOpsDashboard,
  type OpsDashboardPayload,
  type OpsEngagementRow,
  type OpsLeadResponsivenessRow,
  type OpsRecurringGapPattern,
  type OpsFounderSopConsolidationFlag,
} from "@/lib/ops-dashboard-api";
import { resolveKnowledgeGap } from "@/lib/assist-gaps-api";
import { WeeklyPracticeReportView } from "@/components/level-up/WeeklyPracticeReportView";
import { buildWeeklyPracticeReport, coerceDayLedger } from "@/lib/level-up/weekly-report";
import type { LevelUpProgress } from "@/lib/level-up/progress";
import { PlannedVsActualPanel } from "@/components/shift/PlannedVsActualPanel";
import {
  buildOpsAttentionSummary,
  filterEngagementRows,
  isNotEngagedYet,
  isOpsTestAccount,
  sortLeadsByUrgency,
} from "@/lib/ops-dashboard-view";
import { WeeklyCheckInFeed } from "@/components/ops/WeeklyCheckInFeed";
import { ChatSimOpsReviewPanel } from "@/components/ops/ChatSimOpsReviewPanel";
import { OpsAttendanceHoursPanel } from "@/components/ops/OpsAttendanceHoursPanel";
import { CappedStack, ListOverflowBox } from "@/components/ops/CappedStack";
import { summarizeHiddenLabels } from "@/lib/portal-list-cap";
import {
  portalBtnGhostSm,
  portalH1,
  portalH2,
  portalSection,
  portalStatusErrorText,
  portalStatusSuccessText,
  portalStatusWarnText,
} from "@/lib/portal-ui";

function displayName(row: { name: string | null; email: string }) {
  return row.name?.trim() || row.email;
}

function segmentLabel(segment: string): string {
  if (segment === "new_ask") return "Just getting started";
  if (segment === "regular_ask") return "Uses Ask often";
  if (segment === "practice_bridge") return "Practice + Ask";
  return segment;
}

function EngagementTable({
  rows,
  reportUserId,
  onToggleReport,
  reportPanel,
}: {
  rows: OpsEngagementRow[];
  reportUserId: string | null;
  onToggleReport: (id: string) => void;
  /** Inline under the selected person (not below the whole table). */
  reportPanel?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--siya-border)] text-xs uppercase tracking-wide text-[var(--siya-text-muted)]">
            <th className="px-2 py-2 font-medium">Person</th>
            <th className="px-2 py-2 font-medium">Ask · 2 wks</th>
            <th className="px-2 py-2 font-medium">Ask · 30d</th>
            <th className="px-2 py-2 font-medium">Habit</th>
            <th className="px-2 py-2 font-medium">Practice</th>
            <th className="px-2 py-2 font-medium">Sharing this week?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const cold = isNotEngagedYet(r);
            const open = reportUserId === r.userId;
            return (
              <Fragment key={r.userId}>
                <tr
                  className={`border-b border-[var(--siya-border)]/60 align-top ${
                    cold ? "bg-amber-50/80 dark:bg-amber-950/20" : ""
                  }`}
                >
                  <td className="px-2 py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[var(--siya-text)]">{displayName(r)}</span>
                      {cold ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                          Quiet so far
                        </span>
                      ) : null}
                    </div>
                    <div className="text-[11px] text-[var(--siya-text-muted)]">{r.email}</div>
                  </td>
                  <td className="px-2 py-2.5 tabular-nums">{r.askTurnsLast14d}</td>
                  <td className="px-2 py-2.5 tabular-nums">{r.askTurnsLast30d}</td>
                  <td className="px-2 py-2.5 text-xs">{segmentLabel(r.usageSegment)}</td>
                  <td className="px-2 py-2.5 text-xs">
                    {r.practiceLifetime} lifetime · streak {r.streak}
                    {(r.chatSimRedFlags ?? 0) > 0 ? (
                      <span className="mt-0.5 block text-[10px] font-semibold text-[var(--siya-status-error-text)]">
                        Chat sim red flags: {r.chatSimRedFlags}
                      </span>
                    ) : null}
                    {r.lastActiveDate ? (
                      <span className="block text-[10px] text-[var(--siya-text-muted)]">
                        Last active {r.lastActiveDate}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-2 py-2.5 text-xs">
                    {r.practiceShareThisWeek.optedInShared ? (
                      <span>
                        Opted in ({r.practiceShareThisWeek.drillDaysShared}d shared /{" "}
                        {r.practiceShareThisWeek.drillDaysActive}d active)
                      </span>
                    ) : (
                      <span className="text-[var(--siya-text-muted)]">
                        Not sharing
                        {r.practiceShareThisWeek.drillDaysActive > 0
                          ? ` (${r.practiceShareThisWeek.drillDaysActive}d active)`
                          : ""}
                      </span>
                    )}
                    <button
                      type="button"
                      className="mt-1 block text-[10px] font-semibold text-[var(--siya-accent)] underline"
                      onClick={() => onToggleReport(r.userId)}
                      aria-expanded={open}
                    >
                      {open ? "Hide weekly report" : "Weekly practice report"}
                    </button>
                  </td>
                </tr>
                {open && reportPanel ? (
                  <tr className="border-b border-[var(--siya-border)]/60 bg-[var(--siya-bg-page)]/50">
                    <td colSpan={6} className="px-2 py-3" id={`ops-weekly-report-${r.userId}`}>
                      {reportPanel}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LeadCard({
  row,
  highlightSelf,
  emphasize,
}: {
  row: OpsLeadResponsivenessRow;
  highlightSelf: boolean;
  emphasize: boolean;
}) {
  const sop = row.sopQueue;
  const gap = row.gapDigest;
  const check = row.weeklyCheckIn;
  const stale = (sop.oldestPendingAgeDays ?? 0) >= 14 && sop.pendingCount > 0;

  return (
    <article
      className={`rounded-[var(--siya-radius-md)] border bg-[var(--siya-bg-page)]/40 p-4 ${
        emphasize
          ? "border-amber-500/70 ring-2 ring-amber-400/50"
          : highlightSelf
            ? "border-[var(--siya-border)] ring-1 ring-[var(--siya-accent)]/40"
            : "border-[var(--siya-border)]"
      }`}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--siya-primary)]">{displayName(row)}</h3>
          <p className="text-[11px] text-[var(--siya-text-muted)]">
            {row.departments.join(" · ")} · {row.email}
            {highlightSelf ? " · your row" : ""}
          </p>
        </div>
        {sop.pendingCount > 0 ? (
          <div
            className={`flex min-w-[7.5rem] flex-col items-end rounded-lg px-3 py-2 ${
              stale ? "bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:text-amber-50" : "bg-[var(--siya-bg-elevated)]"
            }`}
          >
            <p className="text-[10px] font-medium uppercase tracking-wide opacity-80">Oldest pending</p>
            <p className="text-2xl font-semibold tabular-nums leading-none">
              {sop.oldestPendingAgeDays ?? "—"}
              <span className="ml-0.5 text-sm font-medium">d</span>
            </p>
            <p className="mt-1 text-xs font-semibold tabular-nums">
              {sop.pendingCount} pending
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-[var(--siya-bg-elevated)] px-3 py-2 text-right">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
              SOP queue
            </p>
            <p className="text-sm font-semibold text-[var(--siya-status-success-text)]">Clear</p>
          </div>
        )}
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
            SOP review queue
          </p>
          {sop.pendingCount > 0 ? (
            <p className={`mt-1 text-xs ${stale ? portalStatusWarnText : "text-[var(--siya-text-muted)]"}`}>
              {sop.oldestPendingTitle ? sop.oldestPendingTitle : "Pending review"}
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Nothing waiting</p>
          )}
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
            Gap digest
          </p>
          {gap.gapsInLastDigest != null ? (
            <>
              <p className="mt-1 text-sm tabular-nums">
                Last digest: <span className="font-semibold">{gap.gapsInLastDigest}</span> gaps
                {gap.lastWeekStart ? (
                  <span className="text-xs text-[var(--siya-text-muted)]"> (week of {gap.lastWeekStart})</span>
                ) : null}
              </p>
              <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
                Resolved since: {gap.resolvedSinceDigest ?? "—"} · Still open (eligible):{" "}
                {gap.stillOpenEligible}
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs text-[var(--siya-text-muted)]">No digest send recorded yet</p>
          )}
          <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
            Avg resolve (30d):{" "}
            {gap.avgResolveDaysLast30d != null ? `${gap.avgResolveDaysLast30d}d` : "—"}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
            Weekly check-in
          </p>
          <p className="mt-1 text-sm">
            This week ({check.thisWeekStart}):{" "}
            <span
              className={`font-semibold ${
                check.submittedThisWeek ? "text-[var(--siya-status-success-text)]" : portalStatusWarnText
              }`}
            >
              {check.submittedThisWeek ? "In" : "Missing"}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
            Last {check.lastNWeeks} weeks: {check.weeksSubmittedOfLastN}/{check.lastNWeeks}
            {" · "}Read the actual note under <strong>This week’s lead notes</strong>.
          </p>
          <div className="mt-2 flex flex-wrap gap-1" aria-label="Check-in history">
            {check.history.map((h) => (
              <span
                key={h.weekStart}
                title={`${h.weekStart}: ${h.submitted ? "submitted" : "missed"}`}
                className={`inline-block h-2.5 w-2.5 rounded-sm ${
                  h.submitted ? "bg-[var(--siya-status-success-text)]" : "bg-[var(--siya-border)]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function isQuestionPattern(p: OpsRecurringGapPattern): boolean {
  if (p.patternKind === "question") return true;
  if (p.topicHint?.trim()) return true;
  return Boolean(p.sampleHints?.some((h) => h.trim()));
}

function patternHeadline(p: OpsRecurringGapPattern): string {
  return (
    p.topicHint?.trim() ||
    p.sampleHints?.find((h) => h.trim()) ||
    `${p.departmentLabel} · ${p.taskLabel}`
  );
}

function RecurringGapPatternCard({
  pattern,
  volumeUnknown,
}: {
  pattern: OpsRecurringGapPattern;
  volumeUnknown?: boolean;
}) {
  const unknownPeople = volumeUnknown || !pattern.multiStaff;
  const headline = patternHeadline(pattern);
  const extraSamples = (pattern.sampleHints || []).filter((h) => h && h !== headline).slice(0, 2);

  return (
    <article className="rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-primary)]">
        Repeating question
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--siya-text)]">{pattern.departmentLabel}</p>
      <p className="mt-1 text-sm text-[var(--siya-text-secondary)]">“{headline}”</p>
      {extraSamples.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5 text-xs text-[var(--siya-text-muted)]">
          {extraSamples.map((s) => (
            <li key={s}>also: “{s}”</li>
          ))}
        </ul>
      ) : null}
      <p className="mt-2 text-sm tabular-nums text-[var(--siya-text-secondary)]">
        <span className="font-semibold text-[var(--siya-text)]">{pattern.openGapCount}</span> open
        {!unknownPeople ? (
          <>
            {" "}
            · <span className="font-semibold text-[var(--siya-text)]">{pattern.distinctPeople}</span>{" "}
            people
          </>
        ) : null}{" "}
        · last {pattern.windowDays} days
      </p>
      {unknownPeople ? (
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Volume is high — reporters not all known.</p>
      ) : null}
      <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">
        Write or merge a guide if this still has no approved answer.
      </p>
    </article>
  );
}

function FounderConsolidationFlags({ flags }: { flags: OpsFounderSopConsolidationFlag[] }) {
  if (!flags.length) return null;
  return (
    <section
      className="mb-4 rounded-[var(--siya-radius-md)] border border-amber-500/40 bg-amber-50/80 p-4 dark:border-amber-500/30 dark:bg-amber-950/25"
      aria-labelledby="ops-sop-consolidate-heading"
    >
      <h3 id="ops-sop-consolidate-heading" className="text-sm font-semibold text-amber-950 dark:text-amber-100">
        Founder note — pick one Zocdoc SOP version
      </h3>
      {flags.map((flag) => (
        <div key={flag.id} className="mt-3">
          <p className="text-sm font-medium text-[var(--siya-text)]">
            {flag.department} · {flag.topic} ({flag.candidates.length} team versions)
          </p>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">{flag.action}</p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--siya-text-secondary)]">
            {flag.candidates.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.status}</span> — {c.title}
                {c.ownerName ? ` · ${c.ownerName}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function AttentionStrip({
  items,
  onOpen,
}: {
  items: ReturnType<typeof buildOpsAttentionSummary>;
  onOpen?: (section: OpsSectionId) => void;
}) {
  const warnings = items.filter((i) => i.tone === "warn");
  const oks = items.filter((i) => i.tone !== "warn");
  return (
    <section
      className="rounded-[var(--siya-radius-md)] border border-amber-500/40 bg-amber-50/90 p-4 dark:border-amber-500/30 dark:bg-amber-950/30"
      aria-labelledby="ops-attention-heading"
    >
      <h2 id="ops-attention-heading" className="text-sm font-semibold text-amber-950 dark:text-amber-100">
        Start here
      </h2>
      <p className="mt-0.5 text-[11px] text-amber-900/80 dark:text-amber-100/70">
        Quick look at what’s off — tap a tile below for the full picture.
      </p>
      {warnings.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {warnings.map((item) => (
            <li key={item.id} className="flex gap-2 text-sm font-medium text-amber-950 dark:text-amber-50">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-600" />
              {item.label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm font-medium text-[var(--siya-status-success-text)]">
          Nothing urgent on this list right now.
        </p>
      )}
      {oks.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2 border-t border-amber-500/20 pt-3">
          {oks.map((item) => (
            <li
              key={item.id}
              className="rounded-full bg-[var(--siya-white)]/70 px-2.5 py-1 text-[11px] text-[var(--siya-text-muted)] dark:bg-black/20"
            >
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
      {onOpen && warnings.length > 0 ? (
        <p className="mt-3 text-[11px] text-amber-900/70 dark:text-amber-100/60">
          Tip: open{" "}
          <button type="button" className="font-semibold underline" onClick={() => onOpen("leads")}>
            Lead follow-through
          </button>{" "}
          or{" "}
          <button type="button" className="font-semibold underline" onClick={() => onOpen("engagement")}>
            Who’s using Ask
          </button>{" "}
          next.
        </p>
      ) : null}
    </section>
  );
}

type OpsSectionId =
  | "engagement"
  | "chatSim"
  | "leads"
  | "checkIns"
  | "gaps"
  | "coverage"
  | "hours"
  | "today";

type OpsHubTile = {
  id: OpsSectionId;
  title: string;
  blurb: string;
  stat: string;
  warn?: boolean;
  adminOnly?: boolean;
};

function OpsHubTileButton({
  tile,
  onOpen,
}: {
  tile: OpsHubTile;
  onOpen: (id: OpsSectionId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(tile.id)}
      className={`flex min-h-[7.5rem] flex-col rounded-[var(--siya-radius-lg)] border p-4 text-left shadow-[var(--siya-shadow)] transition hover:border-[var(--siya-accent)]/50 hover:bg-[var(--siya-bg-subtle)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--siya-accent)]/30 ${
        tile.warn
          ? "border-amber-500/45 bg-amber-50/70 dark:bg-amber-950/25"
          : "border-[var(--siya-border)] bg-[var(--siya-white)]/90"
      }`}
    >
      <p className="text-sm font-semibold text-[var(--siya-primary)]">{tile.title}</p>
      <p className="mt-1 flex-1 text-xs leading-snug text-[var(--siya-text-muted)]">{tile.blurb}</p>
      <p className={`mt-3 text-lg font-semibold tabular-nums ${tile.warn ? portalStatusWarnText : "text-[var(--siya-text)]"}`}>
        {tile.stat}
      </p>
      <span className="mt-1 text-[11px] font-semibold text-[var(--siya-accent)]">Open →</span>
    </button>
  );
}

export function OpsDashboardPanel() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [data, setData] = useState<OpsDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportUserId, setReportUserId] = useState<string | null>(null);
  const [showTestAccounts, setShowTestAccounts] = useState(false);
  const [openSection, setOpenSection] = useState<OpsSectionId | null>(null);
  const [clearingBacklog, setClearingBacklog] = useState(false);
  const [gapNotice, setGapNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchOpsDashboard();
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load ops");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    void load();
  }, [authReady, user, router, load]);

  useEffect(() => {
    if (!reportUserId) return;
    const el = document.getElementById(`ops-weekly-report-${reportUserId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [reportUserId]);

  const engagementView = useMemo(() => {
    if (!data?.engagement) return null;
    return filterEngagementRows(data.engagement, showTestAccounts);
  }, [data?.engagement, showTestAccounts]);

  const rawTestAccountCount = useMemo(
    () => data?.engagement?.filter((r) => isOpsTestAccount(r.email)).length ?? 0,
    [data?.engagement],
  );

  const leadsSorted = useMemo(
    () => (data ? sortLeadsByUrgency(data.leadResponsiveness) : []),
    [data],
  );

  const attention = useMemo(() => {
    if (!data) return [];
    return buildOpsAttentionSummary({
      engagement: data.engagement,
      leads: data.leadResponsiveness,
      coverageGapCount: data.coverageGaps?.length ?? 0,
      showTestAccounts,
    });
  }, [data, showTestAccounts]);

  const gapQuestionPatterns = useMemo(() => {
    if (!data) return [];
    const multi = data.recurringGapPatterns || [];
    const volume = data.volumeGapPatternsUnknownPeople || [];
    return [
      ...multi.filter(isQuestionPattern).map((p) => ({ pattern: p, volumeUnknown: false as const })),
      ...volume.filter(isQuestionPattern).map((p) => ({ pattern: p, volumeUnknown: true as const })),
    ];
  }, [data]);

  const gapRouterBacklog = useMemo(() => {
    if (!data) return [];
    const multi = data.recurringGapPatterns || [];
    const volume = data.volumeGapPatternsUnknownPeople || [];
    return [
      ...multi.filter((p) => !isQuestionPattern(p)),
      ...volume.filter((p) => !isQuestionPattern(p)),
    ];
  }, [data]);

  const hubTiles = useMemo((): OpsHubTile[] => {
    if (!data) return [];
    const cold =
      engagementView?.visible.filter(isNotEngagedYet).length ??
      (data.engagement ? filterEngagementRows(data.engagement, false).visible.filter(isNotEngagedYet).length : 0);
    const missingNotes = leadsSorted.filter((l) => !l.weeklyCheckIn.submittedThisWeek).length;
    const pendingSops = leadsSorted.reduce((n, l) => n + l.sopQueue.pendingCount, 0);
    const questionCount = gapQuestionPatterns.length;
    const coverage = data.coverageGaps?.length ?? 0;
    const todayRows = data.scheduledVsActual?.length ?? 0;

    const tiles: OpsHubTile[] = [
      {
        id: "engagement",
        title: "Who’s using Ask",
        blurb: "Who’s chatting with Assist, and who’s gone quiet.",
        stat: cold > 0 ? `${cold} quiet` : `${engagementView?.visible.length ?? "—"} people`,
        warn: cold > 0,
      },
      {
        id: "chatSim",
        title: "Chat practice flags",
        blurb: "Practice chats that hit a safety stop.",
        stat: "Review",
      },
      {
        id: "leads",
        title: "Lead follow-through",
        blurb: "SOP queues and whether leads filed this week’s note.",
        stat: pendingSops > 0 ? `${pendingSops} SOPs waiting` : `${missingNotes} notes missing`,
        warn: pendingSops > 0 || missingNotes > 0,
      },
      {
        id: "checkIns",
        title: "This week’s lead notes",
        blurb: "The actual write-ups — not just submitted / missing.",
        stat: missingNotes > 0 ? `${missingNotes} missing` : "Open notes",
        warn: missingNotes > 0,
      },
      {
        id: "gaps",
        title: "Same questions keep coming",
        blurb: "Repeating Ask wording (not old router labels like Company memory lookup).",
        stat: questionCount > 0 ? `${questionCount} questions` : "None with wording yet",
        warn: questionCount > 0,
      },
      {
        id: "today",
        title: "Today vs the roster",
        blurb: "Scheduled shifts vs who actually started Working.",
        stat: todayRows > 0 ? `${todayRows} rows` : "No roster rows",
      },
    ];

    if (data.viewer.isAdmin) {
      tiles.splice(5, 0, {
        id: "coverage",
        title: "Empty coverage hours",
        blurb: "Times in the next week with nobody on the imported roster.",
        stat: coverage > 0 ? `${coverage} gaps` : "Covered",
        warn: coverage > 0,
        adminOnly: true,
      });
      tiles.splice(6, 0, {
        id: "hours",
        title: "Time on shift",
        blurb: "Working / break / focus hours — for review, not payroll math.",
        stat: "Open hours",
        adminOnly: true,
      });
    }

    return tiles;
  }, [data, engagementView, leadsSorted, gapQuestionPatterns.length]);

  if (!authReady || !user) return null;

  const reportRow =
    reportUserId && engagementView
      ? engagementView.visible.find((r) => r.userId === reportUserId)
      : null;

  const topLead = leadsSorted[0];
  const topLeadUrgent =
    !!topLead &&
    topLead.sopQueue.pendingCount > 0 &&
    (topLead.sopQueue.oldestPendingAgeDays ?? 0) >= 14;

  const openMeta = openSection ? hubTiles.find((t) => t.id === openSection) : null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={portalH1}>Ops</h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--siya-text-muted)]">
            A short home for what’s going on with the team — pick a square, dig in, come back.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPortalAdmin(user.role) ? (
            <Link href="/admin/team" className={`${portalBtnGhostSm} text-[var(--siya-accent)]`}>
              Team board
            </Link>
          ) : (
            <Link href="/team" className={`${portalBtnGhostSm} text-[var(--siya-accent)]`}>
              Team
            </Link>
          )}
          <button type="button" className={portalBtnGhostSm} onClick={() => void load()} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      {loading ? <p className="text-sm text-[var(--siya-text-muted)]">Loading…</p> : null}
      {error ? <p className={`text-sm ${portalStatusErrorText}`}>{error}</p> : null}

      {data && !loading ? (
        <>
          <AttentionStrip items={attention} onOpen={setOpenSection} />

          {!openSection ? (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-[var(--siya-primary)]">Browse</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {hubTiles.map((tile) => (
                  <OpsHubTileButton key={tile.id} tile={tile} onOpen={setOpenSection} />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                type="button"
                className="text-xs font-semibold text-[var(--siya-accent)] hover:underline"
                onClick={() => setOpenSection(null)}
              >
                ← Back to Ops home
              </button>
              {openMeta ? (
                <p className="text-xs text-[var(--siya-text-muted)]">{openMeta.blurb}</p>
              ) : null}

              {openSection === "engagement" ? (
                <section className={portalSection} aria-labelledby="ops-engagement-heading">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 id="ops-engagement-heading" className={portalH2}>
                        Who’s using Ask
                      </h2>
                      <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                        Quiet people (no Ask, no practice) show up first. Test accounts stay hidden unless you
                        flip the switch.
                      </p>
                    </div>
                    {data.engagement != null && (rawTestAccountCount > 0 || showTestAccounts) ? (
                      <label className="flex cursor-pointer items-center gap-2 text-xs text-[var(--siya-text-muted)]">
                        <input
                          type="checkbox"
                          checked={showTestAccounts}
                          onChange={(e) => setShowTestAccounts(e.target.checked)}
                          className="rounded border-[var(--siya-border)]"
                        />
                        Show test accounts
                        {!showTestAccounts && rawTestAccountCount > 0 ? ` (${rawTestAccountCount} hidden)` : ""}
                      </label>
                    ) : null}
                  </div>
                  {data.engagement == null ? (
                    <p className="text-sm text-[var(--siya-text-muted)]">
                      Full team list is admin-only. Your lead view is under Lead follow-through.
                    </p>
                  ) : !engagementView || engagementView.visible.length === 0 ? (
                    <p className="text-sm text-[var(--siya-text-muted)]">
                      {engagementView?.hiddenTestCount
                        ? "Only test accounts here — turn on Show test accounts if you need them."
                        : "No active staff found."}
                    </p>
                  ) : (
                    <>
                      <EngagementTable
                        rows={engagementView.visible}
                        reportUserId={reportUserId}
                        onToggleReport={(id) => setReportUserId((cur) => (cur === id ? null : id))}
                        reportPanel={
                          reportRow
                            ? (() => {
                                const progress: LevelUpProgress = {
                                  streak: reportRow.streak,
                                  lastActiveDate: reportRow.lastActiveDate,
                                  completedToday: [],
                                  totalXp: reportRow.totalXp,
                                  dayLedger: coerceDayLedger(reportRow.dayLedger),
                                };
                                const report = buildWeeklyPracticeReport(progress, {
                                  subjectLabel: displayName(reportRow),
                                });
                                return (
                                  <div>
                                    <p className="mb-2 text-xs text-[var(--siya-text-muted)]">
                                      Same weekly practice summary as Learn.
                                    </p>
                                    <WeeklyPracticeReportView report={report} />
                                  </div>
                                );
                              })()
                            : null
                        }
                      />
                    </>
                  )}
                </section>
              ) : null}

              {openSection === "chatSim" ? <ChatSimOpsReviewPanel engagement={data.engagement} /> : null}

              {openSection === "leads" ? (
                <section className={portalSection} aria-labelledby="ops-leads-heading">
                  <h2 id="ops-leads-heading" className={portalH2}>
                    Lead follow-through
                  </h2>
                  <p className="mt-1 mb-4 text-xs text-[var(--siya-text-muted)]">
                    Sorted so the oldest waiting SOP floats up. Big number on each card = how long it’s been
                    sitting.
                  </p>
                  {data.viewer.isAdmin && (data.founderSopConsolidationFlags?.length ?? 0) > 0 ? (
                    <FounderConsolidationFlags flags={data.founderSopConsolidationFlags || []} />
                  ) : null}
                  {leadsSorted.length === 0 ? (
                    <p className="text-sm text-[var(--siya-text-muted)]">No department leads assigned.</p>
                  ) : (
                    <CappedStack
                      className="space-y-3"
                      items={leadsSorted}
                      renderItem={(row, idx) => (
                        <LeadCard
                          key={row.userId}
                          row={row}
                          highlightSelf={row.userId === user.id}
                          emphasize={idx === 0 && topLeadUrgent}
                        />
                      )}
                      renderOverflow={({ hiddenCount, hidden }) => {
                        const { topLabels, extraLabelKinds } = summarizeHiddenLabels(
                          hidden.map((h) => h.name?.trim() || h.email),
                        );
                        return (
                          <ListOverflowBox
                            title={`+${hiddenCount} more leads`}
                            detail={`${topLabels.join(" · ")}${
                              extraLabelKinds > 0 ? ` · +${extraLabelKinds} other` : ""
                            }`}
                          />
                        );
                      }}
                    />
                  )}
                </section>
              ) : null}

              {openSection === "checkIns" ? (
                <section className={portalSection} aria-labelledby="ops-checkin-text-heading">
                  <h2 id="ops-checkin-text-heading" className={portalH2}>
                    This week’s lead notes
                  </h2>
                  <p className="mt-1 mb-4 text-xs text-[var(--siya-text-muted)]">
                    Full write-ups from leads — what changed, blockers, notes for you. The lead cards only show
                    whether they submitted.
                  </p>
                  <WeeklyCheckInFeed />
                </section>
              ) : null}

              {openSection === "gaps" ? (
                <section className={portalSection} aria-labelledby="ops-recurring-gaps-heading">
                  <h2 id="ops-recurring-gaps-heading" className={portalH2}>
                    Same questions keep coming
                  </h2>
                  <p className="mt-1 mb-4 text-xs text-[var(--siya-text-muted)]">
                    Only shows <strong>real Ask wording</strong> we’ve saved (PHI-safe). Labels like “Company
                    memory lookup” or “Founder Talk” are router buckets — not topics — so they stay out of this
                    list.
                    {data.viewer.isAdmin ? " All departments." : " Your lead departments only."}
                  </p>
                  {gapNotice ? (
                    <p className={`mb-3 text-xs ${portalStatusSuccessText}`}>{gapNotice}</p>
                  ) : null}
                  {gapQuestionPatterns.length === 0 ? (
                    <div className="rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-4 py-3">
                      <p className="text-sm font-medium text-[var(--siya-text)]">
                        No repeating questions with wording yet
                      </p>
                      <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                        After the next few Notify owner / auto-gaps (when the PHI guard passes), you’ll see the
                        actual questions here — e.g. “how do we handle late cancel fees?” — not a stack of
                        router labels.
                      </p>
                    </div>
                  ) : (
                    <CappedStack
                      className="space-y-3"
                      items={gapQuestionPatterns}
                      renderItem={({ pattern, volumeUnknown }) => (
                        <RecurringGapPatternCard
                          key={`${volumeUnknown ? "vol" : "multi"}-${pattern.patternKey || pattern.normalizedTaskLabel}-${pattern.departmentSlug}`}
                          pattern={pattern}
                          volumeUnknown={volumeUnknown}
                        />
                      )}
                      renderOverflow={({ hiddenCount, hidden }) => {
                        const { topLabels, extraLabelKinds } = summarizeHiddenLabels(
                          hidden.map(({ pattern }) => patternHeadline(pattern)),
                        );
                        return (
                          <ListOverflowBox
                            title={`+${hiddenCount} more repeating questions`}
                            detail={`${topLabels.join(" · ")}${
                              extraLabelKinds > 0 ? ` · +${extraLabelKinds} other` : ""
                            }`}
                          />
                        );
                      }}
                    />
                  )}

                  {gapRouterBacklog.length > 0 ? (
                    <div className="mt-6">
                      <ListOverflowBox
                        title={`Old label backlog · ${gapRouterBacklog.reduce((n, p) => n + p.openGapCount, 0)} open rows`}
                        detail={
                          summarizeHiddenLabels(
                            gapRouterBacklog.map(
                              (p) => `${p.departmentLabel} · ${p.taskLabel} ×${p.openGapCount}`,
                            ),
                            5,
                          ).topLabels.join(" · ") +
                          " — these are not questions; safe to clear if you’re not using them as a queue."
                        }
                        action={
                          data.viewer.isAdmin ? (
                            <button
                              type="button"
                              className={portalBtnGhostSm}
                              disabled={clearingBacklog}
                              onClick={() => {
                                void (async () => {
                                  setClearingBacklog(true);
                                  setGapNotice(null);
                                  setError(null);
                                  try {
                                    const ids = gapRouterBacklog.flatMap((p) => p.gapIds || []);
                                    let ok = 0;
                                    for (const id of ids) {
                                      try {
                                        await resolveKnowledgeGap(id);
                                        ok += 1;
                                      } catch {
                                        /* keep going */
                                      }
                                    }
                                    setGapNotice(`Cleared ${ok} old label rows.`);
                                    await load();
                                  } catch (e) {
                                    setError(e instanceof Error ? e.message : "Could not clear backlog");
                                  } finally {
                                    setClearingBacklog(false);
                                  }
                                })();
                              }}
                            >
                              {clearingBacklog ? "Clearing…" : "Clear old label backlog"}
                            </button>
                          ) : (
                            <span className="text-[11px] text-[var(--siya-text-muted)]">
                              Ask an admin to clear this backlog if it’s noise.
                            </span>
                          )
                        }
                      />
                    </div>
                  ) : null}
                </section>
              ) : null}

              {openSection === "coverage" && data.viewer.isAdmin ? (
                <section className={portalSection} aria-labelledby="ops-coverage-heading">
                  <h2 id="ops-coverage-heading" className={portalH2}>
                    Empty coverage hours
                  </h2>
                  <p className="mt-1 mb-4 text-xs text-[var(--siya-text-muted)]">
                    Hours in the next 7 days (IST) with nobody on the imported MA roster — not a new attendance
                    system.
                  </p>
                  {!data.coverageGaps?.length ? (
                    <p className="text-sm text-[var(--siya-text-muted)]">Looks covered for the next week.</p>
                  ) : (
                    <ul className="max-h-64 space-y-1 overflow-y-auto text-sm">
                      {data.coverageGaps.slice(0, 40).map((g) => (
                        <li key={`${g.windowStart}-${g.windowEnd}`} className={portalStatusWarnText}>
                          {g.label}
                        </li>
                      ))}
                      {data.coverageGaps.length > 40 ? (
                        <li className="text-xs text-[var(--siya-text-muted)]">
                          …and {data.coverageGaps.length - 40} more
                        </li>
                      ) : null}
                    </ul>
                  )}
                </section>
              ) : null}

              {openSection === "hours" && data.viewer.isAdmin ? (
                <section className={portalSection} aria-labelledby="ops-attendance-hours-heading">
                  <h2 id="ops-attendance-hours-heading" className={portalH2}>
                    Time on shift
                  </h2>
                  <p className="mt-1 mb-4 text-xs text-[var(--siya-text-muted)]">
                    Working / break / focus from shift events. Good for spotting odd days — not for setting pay.
                    Staff see their own day on My day.
                  </p>
                  <OpsAttendanceHoursPanel />
                </section>
              ) : null}

              {openSection === "today" ? (
                <PlannedVsActualPanel
                  rows={data.scheduledVsActual || []}
                  rosterDate={data.rosterDate || ""}
                  title="Today vs the roster"
                  subtitle={
                    data.viewer.isAdmin
                      ? "One card per person — extra shift pieces nest under their name."
                      : "Your roster vs what you marked on My day."
                  }
                />
              ) : null}
            </div>
          )}

          <p className="text-[10px] text-[var(--siya-text-muted)]">
            Updated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </>
      ) : null}
    </div>
  );
}
