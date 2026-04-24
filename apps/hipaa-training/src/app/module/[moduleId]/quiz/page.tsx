"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { MODULES } from "@/content/modules";
import { getQuestionById } from "@/content/questionBank";
import { buildModuleQuizQueue, recordToAttempt } from "@/lib/quizEngine";
import { explainResult } from "@/lib/scoring";
import type { Question, QuizAttemptRecord } from "@/lib/types";
import { useClientProgress } from "@/hooks/useClientProgress";
import { QuizFeedbackPanel } from "@/components/training/QuizFeedbackPanel";

type Phase = "answer" | "feedback";

export default function ModuleQuizPage() {
  const params = useParams();
  const moduleId = params.moduleId as string;
  const mod = MODULES.find((m) => m.id === moduleId);
  const { progress, refresh, afterModuleQuiz } = useClientProgress();
  const role = progress?.role ?? "other";

  const seed = useMemo(() => (progress?.startedAt ?? 1) % 100000, [progress?.startedAt]);

  const baseQueue = useMemo(() => {
    if (!mod) return [] as Question[];
    const plan = buildModuleQuizQueue({
      moduleId: mod.id,
      role,
      topicAccuracy: Object.fromEntries(
        Object.entries(progress?.topicStats ?? {}).map(([k, v]) => [k, v.attempted ? v.correct / v.attempted : 0.5])
      ),
      seed: seed + mod.id.length * 17,
    });
    return plan.orderedIds.map((id) => getQuestionById(id)).filter(Boolean) as Question[];
  }, [mod, role, progress?.topicStats, seed]);

  const [mainIdx, setMainIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("answer");
  const [selected, setSelected] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<QuizAttemptRecord[]>([]);
  const attemptsRef = useRef<QuizAttemptRecord[]>([]);
  const [done, setDone] = useState(false);

  if (!mod) {
    return (
      <div className="p-8">
        <p>Module not found.</p>
        <Link href="/">Home</Link>
      </div>
    );
  }

  const resolvedModuleId = mod.id;

  const current: Question | null = baseQueue[mainIdx] ?? null;

  const totalMain = baseQueue.length;
  const progressPct =
    totalMain === 0 ? 0 : Math.round(((mainIdx + (phase === "feedback" ? 0.35 : 0)) / totalMain) * 100);

  function finishSnapshot(snapshot: QuizAttemptRecord[]) {
    const graded = snapshot.filter((a) => !a.wasReinforcement);
    const correct = graded.filter((a) => a.correct).length;
    afterModuleQuiz(resolvedModuleId, correct, graded.length, snapshot);
    void refresh();
    setDone(true);
  }

  function submitAnswer() {
    if (!current || selected === null) return;
    const rec = recordToAttempt(current, selected, false);
    const nextAttempts = [...attemptsRef.current, rec];
    attemptsRef.current = nextAttempts;
    setAttempts(nextAttempts);
    setPhase("feedback");
  }

  function continueAfterFeedback() {
    const prev = attemptsRef.current;
    setPhase("answer");
    setSelected(null);
    const n = mainIdx + 1;
    if (n >= baseQueue.length) finishSnapshot(prev);
    else setMainIdx(n);
  }

  if (done) {
    const graded = attempts.filter((a) => !a.wasReinforcement);
    const c = graded.filter((x) => x.correct).length;
    const pct = Math.round((100 * c) / Math.max(1, graded.length));
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Module complete</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Score: {c}/{graded.length} ({pct}%)
        </p>
        <p className="mt-2 max-w-lg text-sm text-zinc-500">
          Review the lesson anytime. Incorrect items showed the keyed correct answer so you can reinforce before the final
          assessment.
        </p>
        <Link href="/" className="mt-6 inline-block text-teal-600">
          Return to dashboard
        </Link>
      </div>
    );
  }

  if (!current || baseQueue.length === 0) {
    return (
      <div className="p-8">
        <p>No questions for this module with your role filter.</p>
        <Link href="/">Dashboard</Link>
      </div>
    );
  }

  const feedback =
    phase === "feedback" && selected !== null ? explainResult(current, selected) : null;

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">
              {mod.shortTitle} quiz • Question {mainIdx + 1} of {totalMain}
            </p>
            <p className="text-xs text-teal-600 dark:text-teal-400">{current.sourceRef}</p>
          </div>
          <div className="h-2 w-40 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-lg font-medium leading-snug">{current.prompt}</p>
          <div className="mt-4 space-y-2">
            {current.options.map((opt) => {
              const isCorrect = opt.key === current.correctKey;
              const isSelected = selected === opt.key;
              let ring = "border-zinc-200 dark:border-zinc-700";
              if (phase === "feedback") {
                if (isCorrect) ring = "border-emerald-600 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-950/40";
                else if (isSelected && !isCorrect)
                  ring = "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/30";
                else ring = "border-zinc-200 opacity-70 dark:border-zinc-700";
              } else if (isSelected) {
                ring = "border-teal-600 bg-teal-50 dark:border-teal-500 dark:bg-teal-950/40";
              }
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={phase !== "answer"}
                  onClick={() => phase === "answer" && setSelected(opt.key)}
                  className={`flex w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${ring} ${
                    phase === "answer" ? "hover:border-zinc-300 dark:hover:border-zinc-600" : ""
                  }`}
                >
                  <span className="mr-3 font-mono text-xs text-zinc-400">{opt.key}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>

          {phase === "answer" ? (
            <button
              type="button"
              disabled={selected === null}
              onClick={submitAnswer}
              className="mt-6 w-full rounded-lg bg-teal-600 py-2.5 text-sm font-medium text-white disabled:opacity-40"
            >
              Check answer
            </button>
          ) : feedback ? (
            <QuizFeedbackPanel feedback={feedback} onContinue={continueAfterFeedback} />
          ) : null}
        </div>

        <Link href={`/module/${moduleId}`} className="mt-4 inline-block text-sm text-zinc-500 hover:text-zinc-700">
          Back to lesson
        </Link>
      </div>
    </div>
  );
}
