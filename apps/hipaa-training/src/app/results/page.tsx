"use client";

import Link from "next/link";
import { MODULES } from "@/content/modules";
import { topicLabel } from "@/content/topicLabels";
import { buildFinalSummary } from "@/lib/scoring";
import { useClientProgress } from "@/hooks/useClientProgress";

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
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Results & analytics</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Data is stored only in this browser. Topic rows show quiz performance by subject area (each attempt updates the
          running average).
        </p>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-sm leading-relaxed text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">How to read this page</h2>
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
          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold">Module quiz scores</h2>
            <div className="mt-4 space-y-3">
              {moduleRows.map(({ mod, pct, detail }) => (
                <div key={mod.id} className="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 last:border-0 dark:border-zinc-900">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {mod.order}. {mod.shortTitle}
                    </p>
                    <p className="text-xs text-zinc-500">{detail} correct</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className={`h-full rounded-full ${pct !== null && pct >= 70 ? "bg-teal-600" : "bg-amber-500"}`}
                        style={{ width: `${pct ?? 0}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-sm font-semibold">{pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {summary ? (
          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold">Latest final assessment</h2>
            <p className="mt-2 text-3xl font-bold">{summary.percent}%</p>
            <p className="mt-1">
              Readiness:{" "}
              <strong className={summary.readiness === "ready" ? "text-teal-700 dark:text-teal-400" : "text-amber-700 dark:text-amber-400"}>
                {summary.readiness === "ready" ? "Ready (≥80% and no very weak topics)" : "Needs review"}
              </strong>
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              “Ready” requires at least 80% on the final and no topic bucket below about 55% correct; otherwise you should
              review weak areas before treating training as complete.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-teal-700 dark:text-teal-400">Stronger topics</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {summary.strengths.length ? (
                    summary.strengths.map((s) => (
                      <li key={s.tag}>
                        {topicLabel(s.tag)} — {Math.round(s.rate * 100)}% ({s.correct}/{s.attempted})
                      </li>
                    ))
                  ) : (
                    <li className="text-zinc-500">—</li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">Topics to revisit</h3>
                <ul className="mt-2 space-y-1 text-sm">
                  {summary.weaknesses.length ? (
                    summary.weaknesses.map((s) => (
                      <li key={s.tag}>
                        {topicLabel(s.tag)} — {Math.round(s.rate * 100)}% ({s.correct}/{s.attempted})
                      </li>
                    ))
                  ) : (
                    <li className="text-zinc-500">None flagged</li>
                  )}
                </ul>
              </div>
            </div>
          </section>
        ) : (
          <p className="mt-8 text-zinc-500">No final assessment yet — use the Final assessment link on the dashboard.</p>
        )}

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold">Topic performance (graded items only)</h2>
          <p className="mt-1 text-xs text-zinc-500">Reinforcement-only attempts are excluded from these totals.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-2 pr-4">Topic</th>
                  <th className="py-2">Correct</th>
                  <th className="py-2">Attempts</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {topicRows.length ? (
                  topicRows.map((row) => (
                    <tr key={row.tag} className="border-b border-zinc-100 dark:border-zinc-900">
                      <td className="py-2 pr-4">{row.label}</td>
                      <td className="py-2">{row.correct}</td>
                      <td className="py-2">{row.attempted}</td>
                      <td className="py-2">
                        <span className={row.rate >= 70 ? "text-teal-700 dark:text-teal-400" : "text-amber-700 dark:text-amber-400"}>
                          {row.rate}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-zinc-500">
                      No topic data yet — complete a module quiz or the final assessment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <Link href="/" className="mt-8 inline-block text-teal-600">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
