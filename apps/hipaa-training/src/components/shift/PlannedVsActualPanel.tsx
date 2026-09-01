"use client";

import { portalSection, portalH2, portalH3 } from "@/lib/portal-ui";
import { groupPlannedVsActualByPerson } from "@/lib/ops-dashboard-view";

export type PlannedVsActualRow = {
  roster: {
    id: string;
    rosterDate: string;
    personKey: string;
    userId: string | null;
    userName: string | null;
    userEmail: string | null;
    shiftStart: string | null;
    shiftEnd: string | null;
    shiftLabel: string | null;
    rawCell: string;
    isOff: boolean;
  };
  scheduledOff: boolean;
  hasActiveShift: boolean;
  presence: string | null;
  shiftStartedAt: string | null;
  presenceSince: string | null;
  outcome: string;
  detail: string;
};

function formatIst(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function outcomeLabel(outcome: string): string {
  switch (outcome) {
    case "started_on_time":
      return "On time";
    case "started_late":
      return "Started late";
    case "in_progress":
      return "In progress";
    case "missed":
      return "Not logged yet";
    case "upcoming":
      return "Upcoming";
    case "scheduled_off":
      return "Scheduled OFF";
    case "no_user":
      return "Unlinked";
    default:
      return outcome;
  }
}

function outcomeClass(outcome: string): string {
  if (outcome === "missed" || outcome === "started_late") return "text-amber-800";
  if (outcome === "started_on_time" || outcome === "in_progress") return "text-[var(--siya-status-success-text)]";
  return "text-[var(--siya-text-muted)]";
}

/**
 * Shared scheduled-vs-actual view — identical markup for ops (team) and My day (self).
 * Grouped by person so multi-segment days (e.g. Anmol morning + evening) read as one card.
 */
export function PlannedVsActualPanel({
  rows,
  rosterDate,
  title = "Did today go as planned?",
  subtitle = "Same scheduled roster vs your self-declared Working / Break / Focus — what you see here is what ops sees about you.",
  compact = false,
}: {
  rows: PlannedVsActualRow[];
  rosterDate: string;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  const groups = groupPlannedVsActualByPerson(rows);

  return (
    <section className={portalSection} aria-labelledby="planned-vs-actual-heading">
      <h2 id="planned-vs-actual-heading" className={compact ? portalH3 : portalH2}>
        {title}
      </h2>
      <p className="mt-1 mb-3 text-xs text-[var(--siya-text-muted)]">
        {subtitle} · {rosterDate} (IST)
      </p>
      {groups.length === 0 ? (
        <p className="text-sm text-[var(--siya-text-muted)]">No roster entries for this date.</p>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => (
            <li
              key={g.key}
              className="rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-page)]/40 px-3 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--siya-text)]">{g.displayName}</p>
                  {g.email ? (
                    <p className="text-[11px] text-[var(--siya-text-muted)]">{g.email}</p>
                  ) : null}
                </div>
                {g.rows.length > 1 ? (
                  <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
                    {g.rows.length} segments today
                  </p>
                ) : (
                  <p className={`text-xs font-semibold ${outcomeClass(g.primaryOutcome)}`}>
                    {outcomeLabel(g.primaryOutcome)}
                  </p>
                )}
              </div>
              <ul className={`${g.rows.length > 1 ? "mt-2 space-y-2 border-t border-[var(--siya-border)]/70 pt-2" : "mt-1.5"}`}>
                {g.rows.map((row) => (
                  <li key={row.roster.id} className={g.rows.length > 1 ? "pl-2" : undefined}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[11px] text-[var(--siya-text-muted)]">
                        Scheduled: {row.roster.rawCell.trim() || "—"}
                        {!row.roster.isOff && row.roster.shiftStart ? (
                          <span>
                            {" "}
                            · {formatIst(row.roster.shiftStart)}–{formatIst(row.roster.shiftEnd)} IST
                          </span>
                        ) : null}
                      </p>
                      {g.rows.length > 1 ? (
                        <p className={`text-xs font-semibold ${outcomeClass(row.outcome)}`}>
                          {outcomeLabel(row.outcome)}
                        </p>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-[var(--siya-text-secondary)]">{row.detail}</p>
                    {row.shiftStartedAt ? (
                      <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
                        Declared start {formatIst(row.shiftStartedAt)}
                        {row.presence ? ` · ${row.presence}` : ""}
                        {row.presenceSince ? ` since ${formatIst(row.presenceSince)}` : ""}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
