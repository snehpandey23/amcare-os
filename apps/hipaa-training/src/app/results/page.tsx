"use client";

import Link from "next/link";
import { buildFinalSummary } from "@/lib/scoring";
import { useClientProgress } from "@/hooks/useClientProgress";

export default function ResultsPage() {
  const { progress } = useClientProgress();
  const final = progress?.finalExam;
  const topic = progress?.topicStats ?? {};

  const topicRows = Object.entries(topic)
    .map(([tag, v]) => ({
      tag,
      ...v,
      rate: v.attempted ? Math.round((100 * v.correct) / v.attempted) : 0,
    }))
    .sort((a, b) => a.rate - b.rate);

  const summary = final?.attempts ? buildFinalSummary(final.attempts) : null;

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Results & analytics</h1>
        <p className="mt-2 text-sm text-zinc-500">Stored locally in this browser ({progress?.version ?? "—"}).</p>

        {summary ? (
          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold">Latest final assessment</h2>
            <p className="mt-2 text-3xl font-bold">{summary.percent}%</p>
            <p className="mt-1">
              Readiness:{" "}
              <strong>{summary.readiness === "ready" ? "Ready" : "Needs review"}</strong>
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-teal-700 dark:text-teal-400">Strengths</h3>
                <ul className="mt-2 list-inside list-disc text-sm">
                  {summary.strengths.map((s) => (
                    <li key={s.tag}>
                      {s.tag} ({Math.round(s.rate * 100)}%)
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-700 dark:text-amber-400">Weak areas</h3>
                <ul className="mt-2 list-inside list-disc text-sm">
                  {summary.weaknesses.map((s) => (
                    <li key={s.tag}>
                      {s.tag} ({Math.round(s.rate * 100)}%)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : (
          <p className="mt-8 text-zinc-500">No final assessment yet — use the Final assessment link in the sidebar.</p>
        )}

        <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="font-semibold">Topic performance (non-reinforcement attempts)</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="py-2">Tag</th>
                  <th className="py-2">Correct</th>
                  <th className="py-2">Attempts</th>
                  <th className="py-2">%</th>
                </tr>
              </thead>
              <tbody>
                {topicRows.length ? (
                  topicRows.map((row) => (
                    <tr key={row.tag} className="border-b border-zinc-100 dark:border-zinc-900">
                      <td className="py-2 font-mono text-xs">{row.tag}</td>
                      <td className="py-2">{row.correct}</td>
                      <td className="py-2">{row.attempted}</td>
                      <td className="py-2">{row.rate}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-zinc-500">
                      No topic data yet.
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
