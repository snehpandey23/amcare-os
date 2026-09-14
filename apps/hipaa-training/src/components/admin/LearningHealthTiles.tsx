"use client";

import {
  portalH3,
  portalKpiHint,
  portalKpiLabel,
  portalKpiTile,
  portalKpiValue,
  portalSection,
} from "@/lib/portal-ui";
import type { TeamRosterMember } from "@/lib/admin-api";
import type { SittingHistoryRow } from "@/lib/competency-exam/sitting-api";

export type LearningHealthStats = {
  teamCount: number;
  hipaaModulesPct: number | null;
  hipaaCertReadyPct: number | null;
  sittingParticipants: number | null;
  sittingLabel: string | null;
  moduleTotal: number;
};

export function computeLearningHealthStats(
  members: TeamRosterMember[],
  moduleTotal: number,
  sittings: SittingHistoryRow[] | null,
): LearningHealthStats {
  const active = members.filter((m) => !m.deactivatedAt);
  const teamCount = active.length;
  const modulesDone = active.filter((m) => m.training.modulesCompleted >= moduleTotal).length;
  const certReady = active.filter((m) => m.training.finalExamReady).length;

  let sittingParticipants: number | null = null;
  let sittingLabel: string | null = null;
  if (sittings && sittings.length > 0) {
    const byId = new Map<string, SittingHistoryRow[]>();
    for (const row of sittings) {
      const list = byId.get(row.sittingId) ?? [];
      list.push(row);
      byId.set(row.sittingId, list);
    }
    let latest: SittingHistoryRow[] = [];
    let latestOpen = "";
    for (const rows of byId.values()) {
      const open = rows[0]?.opensAt ?? "";
      if (!latest.length || open > latestOpen) {
        latest = rows;
        latestOpen = open;
      }
    }
    const people = new Set(latest.map((r) => r.userId).filter(Boolean));
    sittingParticipants = people.size;
    sittingLabel = latest[0]?.label ?? "Latest sitting";
  }

  return {
    teamCount,
    hipaaModulesPct: teamCount ? Math.round((modulesDone / teamCount) * 100) : null,
    hipaaCertReadyPct: teamCount ? Math.round((certReady / teamCount) * 100) : null,
    sittingParticipants,
    sittingLabel,
    moduleTotal,
  };
}

type Props = {
  stats: LearningHealthStats | null;
  loading?: boolean;
};

/**
 * Admin quick-glance learning KPIs — Team / Ops surfaces only (not Founder Talk chrome).
 */
export function LearningHealthTiles({ stats, loading }: Props) {
  return (
    <section className={portalSection} aria-labelledby="learning-health-heading" data-learning-health="true">
      <h2 id="learning-health-heading" className={portalH3}>
        Learning health at a glance
      </h2>
      <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
        Same roster and sitting data as Team / Ops — summary only.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className={portalKpiTile} data-kpi="team-count">
          <p className={portalKpiLabel}>Team members</p>
          <p className={portalKpiValue}>{loading || !stats ? "…" : stats.teamCount}</p>
          <p className={portalKpiHint}>Active accounts on the roster</p>
        </article>
        <article className={portalKpiTile} data-kpi="hipaa-modules">
          <p className={portalKpiLabel}>HIPAA modules complete</p>
          <p className={portalKpiValue}>
            {loading || !stats || stats.hipaaModulesPct == null ? "…" : `${stats.hipaaModulesPct}%`}
          </p>
          <p className={portalKpiHint}>
            {stats ? `All ${stats.moduleTotal} modules finished` : "Share of team finished"}
          </p>
        </article>
        <article className={portalKpiTile} data-kpi="hipaa-cert">
          <p className={portalKpiLabel}>Cert ready</p>
          <p className={portalKpiValue}>
            {loading || !stats || stats.hipaaCertReadyPct == null ? "…" : `${stats.hipaaCertReadyPct}%`}
          </p>
          <p className={portalKpiHint}>Final exam unlocked / ready</p>
        </article>
        <article className={portalKpiTile} data-kpi="sitting">
          <p className={portalKpiLabel}>Competency sitting</p>
          <p className={portalKpiValue}>
            {loading || !stats
              ? "…"
              : stats.sittingParticipants == null
                ? "—"
                : stats.teamCount
                  ? `${stats.sittingParticipants}/${stats.teamCount}`
                  : String(stats.sittingParticipants)}
          </p>
          <p className={portalKpiHint}>
            {stats?.sittingLabel ? `Participated · ${stats.sittingLabel}` : "No sitting history yet"}
          </p>
        </article>
      </div>
    </section>
  );
}
