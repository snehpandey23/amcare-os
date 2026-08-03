"use client";

import Link from "next/link";
import { MODULES } from "@/content/modules";
import { topicLabel } from "@/content/topicLabels";
import { buildFinalSummary } from "@/lib/scoring";
import { useClientProgress } from "@/hooks/useClientProgress";
import {
  portalH1,
  portalH2,
  portalH3,
  portalPage,
  portalSection,
  portalSectionSubtle,
  portalStatusSuccessText,
  portalStatusWarnText,
  portalLinkBack,
} from "@/lib/portal-ui";

export default function ResultsPage() {
  const { progress } = useClientProgress();
  const final = progress?.finalExam;
  const topic = progress?.topicStats ?? {};
  const moduleScores = progress?.moduleQuizScores ?? {};

  const topicRows = Object.entries(topic)
    .map(([tag, v]) => ({
      tag,
      label: topicLabel(tag),
      ...v,
      rate: v.attempted ? Math.round((100 * v.correct) / v.attempted) : 0,
    }))
    .sort((a, b) => a.rate - b.rate);

  const summary = final?.attempts ? buildFinalSummary(final.attempts) : null;

  const moduleRows = MODULES.map((m) => {
    const s = moduleScores[m.id];
    if (!s) return { mod: m, pct: null as number | null, detail: "—" as string };
    const pct = Math.round((100 * s.correct) / Math.max(1, s.total));
    return { mod: m, pct, detail: `${s.correct}/${s.total}` };
  }).filter((r) => r.pct !== null);

  return (
    <div className={`${portalPage} siya-cert`}>
      <h1 className={portalH1}>Results & analytics</h1>
      <p className="mt-2 text-sm text-[var(--siya-text-muted)]">
        Data is stored only in this browser. Topic rows show quiz performance by subject area (each attempt updates the
        running average).
      </p>

      <section className={`${portalSectionSubtle} mt-6 text-sm leading-relaxed text-[var(--siya-text-secondary)]`}>
        <h2 className={portalH3}>How to read this page</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>
            <strong>Module quizzes</strong> — one row per module you finished; % is correct out of all questions in that
            quiz run.
          </li>
          <li>
            <strong>Final assessment</strong> — your most recent mixed-module exam and an overall readiness label.
          </li>
          <li>
            <strong>Topic performance</strong> — grouped by subject tags from the official test; low % means revisit
            that lesson and the keyed explanations you saw after wrong answers.
          </li>
        </ul>
      </section>

      {moduleRows.length > 0 ? (
        <section className={`${portalSection} mt-8`}>
          <h2 className={portalH2}>Module quiz scores</h2>
          <div className="mt-4 space-y-3">
            {moduleRows.map(({ mod, pct, detail }) => (
              <div
                key={mod.id}
                className="flex items-center justify-between gap-3 border-b border-[var(--siya-border)] pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium text-[var(--siya-text)]">
                    {mod.order}. {mod.shortTitle}
                  </p>
                  <p className="text-xs text-[var(--siya-text-muted)]">{detail} correct</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-[var(--siya-bg-subtle)]">
                    <div
                      className={`h-full rounded-full ${
                        pct !== null && pct >= 70
                          ? "bg-[var(--siya-accent)]"
                          : "bg-[var(--siya-status-warn-border)]"
                      }`}
                      style={{ width: `${pct ?? 0}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-semibold text-[var(--siya-text)]">{pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {summary ? (
        <section className={`${portalSection} mt-8`}>
          <h2 className={portalH2}>Latest final assessment</h2>
          <p className="mt-2 text-3xl font-bold text-[var(--siya-primary)]">{summary.percent}%</p>
          <p className="mt-1 text-[var(--siya-text-secondary)]">
            Readiness:{" "}
            <strong className={summary.readiness === "ready" ? portalStatusSuccessText : portalStatusWarnText}>
              {summary.readiness === "ready" ? "Ready (≥80% and no very weak topics)" : "Needs review"}
            </strong>
          </p>
          <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
            “Ready” requires at least 80% on the final and no topic bucket below about 55% correct; otherwise you should
            review weak areas before treating training as complete.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className={`text-sm font-medium ${portalStatusSuccessText}`}>Stronger topics</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--siya-text-secondary)]">
                {summary.strengths.length ? (
                  summary.strengths.map((s) => (
                    <li key={s.tag}>
                      {topicLabel(s.tag)} — {Math.round(s.rate * 100)}% ({s.correct}/{s.attempted})
                    </li>
                  ))
                ) : (
                  <li className="text-[var(--siya-text-muted)]">—</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className={`text-sm font-medium ${portalStatusWarnText}`}>Topics to revisit</h3>
              <ul className="mt-2 space-y-1 text-sm text-[var(--siya-text-secondary)]">
                {summary.weaknesses.length ? (
                  summary.weaknesses.map((s) => (
                    <li key={s.tag}>
                      {topicLabel(s.tag)} — {Math.round(s.rate * 100)}% ({s.correct}/{s.attempted})
                    </li>
                  ))
                ) : (
                  <li className="text-[var(--siya-text-muted)]">None flagged</li>
                )}
              </ul>
            </div>
          </div>
        </section>
      ) : (
        <p className="mt-8 text-[var(--siya-text-muted)]">
          No final assessment yet — use the Final assessment link on the dashboard.
        </p>
      )}

      <section className={`${portalSection} mt-8`}>
        <h2 className={portalH2}>Topic performance (graded items only)</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Reinforcement-only attempts are excluded from these totals.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--siya-text-secondary)]">
            <thead>
              <tr className="border-b border-[var(--siya-border)]">
                <th className="py-2 pr-4">Topic</th>
                <th className="py-2">Correct</th>
                <th className="py-2">Attempts</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {topicRows.length ? (
                topicRows.map((row) => (
                  <tr key={row.tag} className="border-b border-[var(--siya-border)]">
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className="py-2">{row.correct}</td>
                    <td className="py-2">{row.attempted}</td>
                    <td className="py-2">
                      <span className={row.rate >= 70 ? portalStatusSuccessText : portalStatusWarnText}>
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-[var(--siya-text-muted)]">
                    No topic data yet — complete a module quiz or the final assessment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Link href="/" className={`mt-8 inline-block ${portalLinkBack}`}>
        Back to dashboard
      </Link>
    </div>
  );
}
