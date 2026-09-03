"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  portalBtnGhostSm,
  portalH1,
  portalH2,
  portalSection,
  portalStatusErrorText,
  portalStatusWarnText,
} from "@/lib/portal-ui";

function displayName(row: { name: string | null; email: string }) {
  return row.name?.trim() || row.email;
}

function segmentLabel(segment: string): string {
  if (segment === "new_ask") return "New / light Ask";
  if (segment === "regular_ask") return "Regular Ask";
  if (segment === "practice_bridge") return "Practice bridge";
  return segment;
}

function EngagementTable({
  rows,
  reportUserId,
  onToggleReport,
}: {
  rows: OpsEngagementRow[];
  reportUserId: string | null;
  onToggleReport: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--siya-border)] text-xs uppercase tracking-wide text-[var(--siya-text-muted)]">
            <th className="px-2 py-2 font-medium">Staff</th>
            <th className="px-2 py-2 font-medium">Ask 14d</th>
            <th className="px-2 py-2 font-medium">Ask 30d</th>
            <th className="px-2 py-2 font-medium">Segment</th>
            <th className="px-2 py-2 font-medium">Practice</th>
            <th className="px-2 py-2 font-medium">This week share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const cold = isNotEngagedYet(r);
            return (
              <tr
                key={r.userId}
                className={`border-b border-[var(--siya-border)]/60 align-top ${
                  cold ? "bg-amber-50/80 dark:bg-amber-950/20" : ""
                }`}
              >
                <td className="px-2 py-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--siya-text)]">{displayName(r)}</span>
                    {cold ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
                        Not engaged yet
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
                      Not sharing this week
                      {r.practiceShareThisWeek.drillDaysActive > 0
                        ? ` (${r.practiceShareThisWeek.drillDaysActive}d active)`
                        : ""}
                    </span>
                  )}
                  <button
                    type="button"
                    className="mt-1 block text-[10px] font-semibold text-[var(--siya-accent)] underline"
                    onClick={() => onToggleReport(r.userId)}
                  >
                    {reportUserId === r.userId ? "Hide weekly report" : "Weekly practice report"}
                  </button>
                </td>
              </tr>
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
              {check.submittedThisWeek ? "Submitted" : "Missing"}
            </span>
          </p>
          <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
            Last {check.lastNWeeks} weeks: {check.weeksSubmittedOfLastN}/{check.lastNWeeks}
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

function RecurringGapPatternCard({
  pattern,
  volumeUnknown,
}: {
  pattern: OpsRecurringGapPattern;
  volumeUnknown?: boolean;
}) {
  const unknownPeople = volumeUnknown || !pattern.multiStaff;
  return (
    <article className="rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-primary)]">
        Recurring gap pattern
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--siya-text)]">
        {pattern.departmentLabel} ·{" "}
        <code className="rounded bg-[var(--siya-bg-subtle)] px-1.5 py-0.5 text-[12px]">
          {pattern.taskLabel}
        </code>
      </p>
      <p className="mt-2 text-sm tabular-nums text-[var(--siya-text-secondary)]">
        <span className="font-semibold text-[var(--siya-text)]">{pattern.openGapCount}</span> open
        gaps
        {!unknownPeople ? (
          <>
            {" "}
            · <span className="font-semibold text-[var(--siya-text)]">{pattern.distinctPeople}</span>{" "}
            staff
          </>
        ) : null}{" "}
        · last {pattern.windowDays} days
      </p>
      {unknownPeople ? (
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Volume pattern (people unknown).
        </p>
      ) : null}
      <p className="mt-2 text-[11px] italic text-[var(--siya-text-muted)]">
        {pattern.surfaceOnlyNote || "Surfaced for human action — no auto-draft."}
      </p>
      <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">
        Review matching rows in{" "}
        <Link href="/team" className="font-semibold text-[var(--siya-accent)] underline">
          Open knowledge gaps
        </Link>{" "}
        (category + task only). Write or merge an SOP yourself — this card never creates drafts.
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
        Founder action — consolidate team SOP duplicates
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

function AttentionStrip({ items }: { items: ReturnType<typeof buildOpsAttentionSummary> }) {
  const warnings = items.filter((i) => i.tone === "warn");
  const oks = items.filter((i) => i.tone !== "warn");
  return (
    <section
      className="rounded-[var(--siya-radius-md)] border border-amber-500/40 bg-amber-50/90 p-4 dark:border-amber-500/30 dark:bg-amber-950/30"
      aria-labelledby="ops-attention-heading"
    >
      <h2 id="ops-attention-heading" className="text-sm font-semibold text-amber-950 dark:text-amber-100">
        Needs attention
      </h2>
      <p className="mt-0.5 text-[11px] text-amber-900/80 dark:text-amber-100/70">
        Scan this first — same data as the sections below, surfaced as problems.
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
          No urgent flags right now.
        </p>
      )}
      {oks.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2 border-t border-amber-500/20 pt-3">
          {oks.map((item) => (
            <li
              key={item.id}
              className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-[var(--siya-text-muted)] dark:bg-black/20"
            >
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await fetchOpsDashboard();
      setData(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load ops dashboard");
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className={portalH1}>Ops dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--siya-text-muted)]">
            Problems first, then detail — staff engagement and lead responsiveness stay separate (not a combined
            score).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPortalAdmin(user.role) ? (
            <Link href="/admin/team" className={`${portalBtnGhostSm} text-[var(--siya-accent)]`}>
              Team health
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
          <AttentionStrip items={attention} />

          {/* Section A — Staff engagement */}
          <section className={portalSection} aria-labelledby="ops-engagement-heading">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="ops-engagement-heading" className={portalH2}>
                  A · Staff engagement
                </h2>
                <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
                  Not engaged (0 Ask · 0 practice) listed first, then highest Ask activity. QA/test accounts hidden by
                  default.
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
                Full team engagement is admin-only. Your lead responsiveness is below.
              </p>
            ) : !engagementView || engagementView.visible.length === 0 ? (
              <p className="text-sm text-[var(--siya-text-muted)]">
                {engagementView?.hiddenTestCount
                  ? "Only test accounts in this list — toggle Show test accounts to inspect them."
                  : "No active staff found."}
              </p>
            ) : (
              <>
                <EngagementTable
                  rows={engagementView.visible}
                  reportUserId={reportUserId}
                  onToggleReport={(id) => setReportUserId((cur) => (cur === id ? null : id))}
                />
                {reportRow ? (() => {
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
                    <div className="mt-4">
                      <p className="mb-2 text-xs text-[var(--siya-text-muted)]">
                        Same weekly report component as Learn / Admin Team (shared results only).
                      </p>
                      <WeeklyPracticeReportView report={report} />
                    </div>
                  );
                })() : null}
              </>
            )}
          </section>

          {/* Section B — Lead responsiveness */}
          <section className={portalSection} aria-labelledby="ops-leads-heading">
            <h2 id="ops-leads-heading" className={portalH2}>
              B · Leads&apos; operational responsiveness
            </h2>
            <p className="mt-1 mb-4 text-xs text-[var(--siya-text-muted)]">
              Sorted by urgency — oldest pending SOP first. The age and pending count sit large on each card.
            </p>
            {data.viewer.isAdmin && (data.founderSopConsolidationFlags?.length ?? 0) > 0 ? (
              <FounderConsolidationFlags flags={data.founderSopConsolidationFlags || []} />
            ) : null}
            {leadsSorted.length === 0 ? (
              <p className="text-sm text-[var(--siya-text-muted)]">No department leads assigned.</p>
            ) : (
              <div className="space-y-3">
                {leadsSorted.map((row, idx) => (
                  <LeadCard
                    key={row.userId}
                    row={row}
                    highlightSelf={row.userId === user.id}
                    emphasize={idx === 0 && topLeadUrgent}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Section B2 — Recurring knowledge gaps (surface only) */}
          <section className={portalSection} aria-labelledby="ops-recurring-gaps-heading">
            <h2 id="ops-recurring-gaps-heading" className={portalH2}>
              B2 · Recurring knowledge gaps
            </h2>
            <p className="mt-1 mb-4 text-xs text-[var(--siya-text-muted)]">
              Same department + task, ≥3 open gaps, ≥2 distinct staff, last 30 days (thumbs-down excluded).
              Detection only — no auto-draft, no auto-assign, no auto pending_review.
              {data.viewer.isAdmin
                ? " Showing all departments."
                : " Showing your lead department(s) only."}
            </p>
            {(() => {
              const multi = data.recurringGapPatterns || [];
              const volume = data.volumeGapPatternsUnknownPeople || [];
              if (!multi.length && !volume.length) {
                return (
                  <p className="text-sm text-[var(--siya-text-muted)]">
                    No recurring multi-staff gap patterns in the last 30 days.
                  </p>
                );
              }
              return (
                <div className="space-y-3">
                  {multi.map((p) => (
                    <RecurringGapPatternCard
                      key={`multi-${p.departmentSlug}-${p.normalizedTaskLabel}`}
                      pattern={p}
                    />
                  ))}
                  {volume.map((p) => (
                    <RecurringGapPatternCard
                      key={`vol-${p.departmentSlug}-${p.normalizedTaskLabel}`}
                      pattern={p}
                      volumeUnknown
                    />
                  ))}
                </div>
              );
            })()}
          </section>

          {/* Section C — Coverage gaps (admin) */}
          {data.viewer.isAdmin ? (
            <section className={portalSection} aria-labelledby="ops-coverage-heading">
              <h2 id="ops-coverage-heading" className={portalH2}>
                C · MA coverage gaps (next 7 days IST)
              </h2>
              <p className="mt-1 mb-4 text-xs text-[var(--siya-text-muted)]">
                Hours with zero scheduled people on <code className="text-[10px]">shift_roster</code>. From the imported
                MA roster — not a new attendance system.
              </p>
              {!data.coverageGaps?.length ? (
                <p className="text-sm text-[var(--siya-text-muted)]">No zero-coverage hours in the next 7 days.</p>
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

          {/* Section D — Scheduled vs actual (transparent), grouped by person */}
          <PlannedVsActualPanel
            rows={data.scheduledVsActual || []}
            rosterDate={data.rosterDate || ""}
            title={data.viewer.isAdmin ? "D · Did today go as planned?" : "C · Did today go as planned?"}
            subtitle={
              data.viewer.isAdmin
                ? "One card per person — multiple shift segments nest under their name (not duplicate rows)."
                : "Your roster vs self-declared status — same card staff see on My day (own data only)."
            }
          />

          <p className="text-[10px] text-[var(--siya-text-muted)]">
            Generated {new Date(data.generatedAt).toLocaleString()} · existing tables + shift_roster
          </p>
        </>
      ) : null}
    </div>
  );
}
