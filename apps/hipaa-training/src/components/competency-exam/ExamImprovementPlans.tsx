import type { SectionImprovementPlan } from "@/lib/competency-exam/improvement-plan";

/** Encouraging, actionable “what to work on” block — shared by report + isolated section done. */
export function ExamImprovementPlans({ plans }: { plans: SectionImprovementPlan[] }) {
  if (!plans.length) return null;
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--siya-accent)]/30 bg-[var(--siya-bg-subtle)] p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-accent)]">What to work on</p>
        <p className="mt-1 text-sm text-[var(--siya-text)]">
          Specific next steps from this sitting — not a generic “study more.”
        </p>
      </div>
      <ul className="space-y-3">
        {plans.map((p) => (
          <li key={`${p.sectionId}-${p.title}`} className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-3 text-sm">
            <p className="font-semibold text-[var(--siya-primary)]">{p.title}</p>
            <p className="mt-1 text-[var(--siya-text)]">{p.headline}</p>
            {p.deferred ? (
              <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">
                Spoken-specific tips deferred until calibration preview findings.
              </p>
            ) : null}
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-[var(--siya-text)]">
              {p.tips.map((tip) => (
                <li key={tip}>{tip.replace(/\*\*/g, "")}</li>
              ))}
            </ul>
            {p.links.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {p.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-xl bg-[var(--siya-accent)] px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
