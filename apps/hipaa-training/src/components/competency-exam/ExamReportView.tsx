import type { ExamReportModel } from "@/lib/competency-exam/types";

export function ExamReportView({ report }: { report: ExamReportModel }) {
  return (
    <div className="space-y-4 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">Competency exam</p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--siya-primary)]">{report.subjectLabel}</h2>
        <p className="mt-1 text-sm text-[var(--siya-text)]">
          Partial total <strong>{report.pointsEarned}</strong> / {report.pointsPossible} from sections scored this sitting.
          Not the full 100-point competency score.
        </p>
      </div>
      <p className="rounded-xl bg-[var(--siya-bg-subtle)] p-3 text-xs text-[var(--siya-text)]">{report.partialNote}</p>
      <p className="text-xs font-semibold text-[var(--siya-text)]">
        Human review required. This report does not decide employment, pay, or HIPAA certification.
      </p>
      {report.safety.redFlagged ? (
        <div className="rounded-xl border border-[var(--siya-status-error-border)] bg-[var(--siya-status-error-bg)] p-3 text-sm text-[var(--siya-status-error-text)]">
          <p className="font-semibold">Safety flag — separate from the composite</p>
          <ul className="mt-1 list-disc pl-4">
            {report.safety.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
            {report.safety.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-xs text-[var(--siya-text-secondary)]">No chat-sim safety flag on this attempt. Still human-reviewed.</p>
      )}
      <ul className="space-y-2">
        {report.sections.map((s) => (
          <li key={s.id} className="rounded-xl border border-[var(--siya-border)] p-3 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-[var(--siya-primary)]">
                {s.label} · {s.weight} pts
              </p>
              <p className="text-xs uppercase text-[var(--siya-text-secondary)]">
                {s.status === "scored" ? `${s.score}/100` : s.status}
              </p>
            </div>
            <p className="mt-1 text-xs text-[var(--siya-text)]">{s.note}</p>
            {s.detail ? <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">{s.detail}</p> : null}
            {s.draftContent ? (
              <p className="mt-1 text-xs font-semibold text-[var(--siya-text)]">DRAFT — pending Sonu review. Not an approved official item.</p>
            ) : null}
            {s.repeatedIds.length ? (
              <p className="mt-1 text-xs font-semibold text-[var(--siya-text)]">
                Repeat — not a fresh measure: {s.repeatedIds.join(", ")}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
