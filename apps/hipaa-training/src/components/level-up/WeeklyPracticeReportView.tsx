"use client";

import type { WeeklyPracticeReportModel } from "@/lib/level-up/weekly-report";
import { drillLabel } from "@/lib/level-up/weekly-report";

/**
 * Single shared weekly practice report renderer for staff AND admin.
 * Do not fork this UI — both surfaces must pass the same WeeklyPracticeReportModel builder.
 */
export function WeeklyPracticeReportView({ report }: { report: WeeklyPracticeReportModel }) {
  return (
    <section
      className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-elevated)] p-4"
      data-weekly-report-fingerprint={report.contentFingerprint}
    >
      <header className="mb-3">
        <h3 className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-[var(--siya-primary)]">
          Weekly practice report
        </h3>
        <p className="mt-0.5 text-xs text-[var(--siya-text-muted)]">
          {report.subjectLabel} · {report.weekStart} → {report.weekEnd} (UTC)
        </p>
        <p className="mt-2 text-sm text-[var(--siya-text)]">
          <strong>
            {report.drillDaysShared} of {report.drillDaysActive}
          </strong>{" "}
          drill-days shared this week
        </p>
        <p className="mt-1 text-[10px] text-[var(--siya-text-muted)]">
          Only results you chose to share appear here. Fingerprint: {report.contentFingerprint}
        </p>
      </header>

      {report.typingTrend.length ? (
        <div className="mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
            Typing (shared)
          </h4>
          <ul className="mt-1 space-y-1 text-sm">
            {report.typingTrend.map((t, i) => (
              <li key={`${t.date}-${t.wpm}-${i}`}>
                {t.date}: <strong>{t.wpm} WPM</strong> ({t.accuracy}% acc)
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-3 text-xs text-[var(--siya-text-muted)]">No shared typing results this week.</p>
      )}

      {report.cultureProgress.length ? (
        <div className="mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
            Culture / map / trivia (shared)
          </h4>
          <ul className="mt-1 space-y-1 text-sm">
            {report.cultureProgress.map((c) => (
              <li key={c.drill}>
                {c.label}: <strong>{c.sharedCount}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mb-3 text-xs text-[var(--siya-text-muted)]">No shared culture/map results this week.</p>
      )}

      {report.sharedEvents.length ? (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
            Shared events
          </h4>
          <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto text-xs text-[var(--siya-text-secondary)]">
            {report.sharedEvents.map((e, i) => (
              <li key={`${e.date}-${e.drill}-${i}`}>
                {e.date} · {drillLabel(e.drill)}
                {e.xpAwarded ? ` · +${e.xpAwarded} XP` : ""}
                {typeof e.wpm === "number" ? ` · ${e.wpm} WPM` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
