"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { getModulesForRole } from "@/content/modules";
import { getQuestionById } from "@/content/questionBank";
import { buildFinalExam, evaluateAnswer, recordToAttempt } from "@/lib/quizEngine";
import { buildFinalSummary, explainResult } from "@/lib/scoring";
import type { Question, QuizAttemptRecord } from "@/lib/types";
import { useClientProgress } from "@/hooks/useClientProgress";
import { updateFinalExam } from "@/lib/progressStorage";

type Phase = "answer" | "feedback";

export default function FinalExamPage() {
  const { progress, refresh } = useClientProgress();
  const role = progress?.role ?? "other";

  const moduleIds = useMemo(() => getModulesForRole(role).map((m) => m.id), [role]);

  const seed = useMemo(() => (progress?.startedAt ?? 1) % 100000, [progress?.startedAt]);

  const queue = useMemo(() => {
    const plan = buildFinalExam({
      moduleIds,
      role,
      topicAccuracy: Object.fromEntries(
        Object.entries(progress?.topicStats ?? {}).map(([k, v]) => [k, v.attempted ? v.correct / v.attempted : 0.5])
      ),
      count: 20,
      seed: seed + 333,
    });
    return plan.orderedIds.map((id) => getQuestionById(id)).filter(Boolean) as Question[];
  }, [moduleIds, role, progress?.topicStats, seed]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>([]);
  const attemptsRef = useRef<QuizAttemptRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const current = queue[idx] ?? null;
  const pct = queue.length ? Math.round(((idx + (phase === "feedback" ? 0.5 : 0)) / queue.length) * 100) : 0;

  function submitAnswer() {
    if (!current || selected === null) return;
    const rec = recordToAttempt(current, selected, false);
    const next = [...attemptsRef.current, rec];
    attemptsRef.current = next;
    setAttempts(next);
    setPhase("feedback");
  }

  function goNext() {
    setPhase("answer");
    setSelected(null);
    if (idx + 1 >= queue.length) {
      const summary = buildFinalSummary(attemptsRef.current);
      updateFinalExam(attemptsRef.current, summary.readiness);
      refresh();
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
  }

  if (finished) {
    const summary = buildFinalSummary(attemptsRef.current);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Final assessment complete</h1>
        <p className="mt-4 text-3xl font-bold text-teal-700 dark:text-teal-400">{summary.percent}%</p>
        <p className="mt-2 text-lg font-medium">
          {summary.readiness === "ready" ? "Ready — passing range" : "Needs review — revisit weak areas"}
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="font-semibold text-teal-700 dark:text-teal-400">Strengths</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
              {summary.strengths.length ? summary.strengths.map((s) => <li key={s.tag}>{s.tag}</li>) : <li>—</li>}
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="font-semibold text-amber-700 dark:text-amber-400">Weak areas</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-zinc-600 dark:text-zinc-400">
              {summary.weaknesses.length ? summary.weaknesses.map((s) => <li key={s.tag}>{s.tag}</li>) : <li>—</li>}
            </ul>
          </div>
        </div>
        <p className="mt-8 rounded-lg bg-zinc-100 p-4 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <strong>Certification-style summary:</strong> You have completed the HIPAA training assessment associated with
          your organization&apos;s Gamma Compliance welcome kit content. This is an <em>organizational training record</em>,
          not a government-issued credential. Retain completion per your HIPAA Training and workforce policies.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/results" className="rounded-lg bg-teal-600 px-4 py-2 text-white">
            Full analytics
          </Link>
          <Link href="/certificate" className="rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-600">
            Print certificate
          </Link>
          <Link href="/">Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!current) {
    return <div className="p-8">No exam items. Complete modules or adjust role.</div>;
  }

  const feedback =
    phase === "feedback" && selected !== null ? explainResult(current, selected) : null;

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Final readiness assessment</h1>
        <p className="mt-1 text-sm text-zinc-500">{queue.length} questions • mixed modules</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-teal-600 dark:text-teal-400">{current.sourceRef}</p>
          <p className="mt-2 text-lg font-medium leading-snug">{current.prompt}</p>
          <div className="mt-4 space-y-2">
            {current.options.map((opt) => (
              <button
                key={opt.key}
                type="button"
                disabled={phase !== "answer"}
                onClick={() => phase === "answer" && setSelected(opt.key)}
                className={`flex w-full rounded-xl border px-4 py-3 text-left text-sm ${
                  selected === opt.key
                    ? "border-teal-600 bg-teal-50 dark:border-teal-500 dark:bg-teal-950/40"
                    : "border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <span className="mr-3 font-mono text-xs text-zinc-400">{opt.key}.</span>
                {opt.text}
              </button>
            ))}
          </div>
          {phase === "answer" ? (
            <button
              type="button"
              disabled={selected === null}
              onClick={submitAnswer}
              className="mt-6 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            >
              Submit
            </button>
          ) : feedback ? (
            <div className="mt-6 rounded-xl border border-zinc-200 p-4 text-sm dark:border-zinc-800">
              <p className="font-semibold">{feedback.headline}</p>
              <p className="mt-2 whitespace-pre-wrap">{feedback.detail}</p>
              <button type="button" onClick={goNext} className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-white">
                Next
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
