"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { getModulesForRole } from "@/content/modules";
import { topicLabel } from "@/content/topicLabels";
import { getQuestionById } from "@/content/questionBank";
import { buildFinalExam, recordToAttempt } from "@/lib/quizEngine";
import { buildFinalSummary, explainResult } from "@/lib/scoring";
import type { Question, QuizAttemptRecord } from "@/lib/types";
import { useClientProgress } from "@/hooks/useClientProgress";
import { QuizFeedbackPanel } from "@/components/training/QuizFeedbackPanel";
import {
  TrainingBtnPrimary,
  TrainingCard,
  TrainingProgressBar,
  quizOptionClass,
  type QuizOptionState,
  trainingLinkPrimaryClass,
  trainingLinkSecondaryClass,
} from "@/components/training/training-ui";

type Phase = "answer" | "feedback";

function optionState(phase: Phase, isCorrect: boolean, isSelected: boolean): QuizOptionState {
  if (phase === "feedback") {
    if (isCorrect) return "correct";
    if (isSelected && !isCorrect) return "incorrect";
    return "muted";
  }
  return isSelected ? "selected" : "default";
}

export default function FinalExamPage() {
  const { progress, refresh, afterFinalExam } = useClientProgress();
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
  const attemptsRef = useRef<QuizAttemptRecord[]>([]);
  const [finished, setFinished] = useState(false);

  const current = queue[idx] ?? null;
  const pct = queue.length ? Math.round(((idx + (phase === "feedback" ? 0.5 : 0)) / queue.length) * 100) : 0;

  function submitAnswer() {
    if (!current || selected === null) return;
    const rec = recordToAttempt(current, selected, false);
    attemptsRef.current = [...attemptsRef.current, rec];
    setPhase("feedback");
  }

  function goNext() {
    setPhase("answer");
    setSelected(null);
    if (idx + 1 >= queue.length) {
      const summary = buildFinalSummary(attemptsRef.current);
      afterFinalExam(attemptsRef.current, summary.readiness);
      void refresh();
      setFinished(true);
      return;
    }
    setIdx((i) => i + 1);
  }

  if (finished) {
    const summary = buildFinalSummary(attemptsRef.current);
    return (
      <div className="siya-cert p-6 md:p-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
            Final assessment complete
          </h1>
          <p className="mt-4 font-[family-name:var(--font-poppins)] text-4xl font-bold text-[var(--siya-accent)]">
            {summary.percent}%
          </p>
          <p className="mt-2 text-lg font-medium text-[var(--siya-text)]">
            {summary.readiness === "ready" ? "Ready — passing range" : "Needs review — revisit weak areas"}
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <TrainingCard className="p-4">
              <h2 className="font-semibold text-[var(--siya-primary)]">Strengths</h2>
              <ul className="mt-2 list-inside list-disc text-sm text-[var(--siya-text-secondary)]">
                {summary.strengths.length ? summary.strengths.map((s) => <li key={s.tag}>{topicLabel(s.tag)}</li>) : <li>—</li>}
              </ul>
            </TrainingCard>
            <TrainingCard className="p-4">
              <h2 className="font-semibold text-amber-800">Weak areas</h2>
              <ul className="mt-2 list-inside list-disc text-sm text-[var(--siya-text-secondary)]">
                {summary.weaknesses.length ? summary.weaknesses.map((s) => <li key={s.tag}>{topicLabel(s.tag)}</li>) : <li>—</li>}
              </ul>
            </TrainingCard>
          </div>
          <TrainingCard className="mt-8 p-4 text-sm text-[var(--siya-text-secondary)]">
            <strong className="text-[var(--siya-text)]">Certification-style summary:</strong> Organizational training record
            only—not a government-issued credential. Retain completion per your workforce policies.
          </TrainingCard>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/results" className={trainingLinkPrimaryClass}>
              Full analytics
            </Link>
            <Link href="/certificate" className={trainingLinkSecondaryClass}>
              Print certificate
            </Link>
            <Link href="/training" className="text-sm text-[var(--siya-accent)] underline">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!current) {
    return <div className="p-8">No exam items. Complete modules or adjust role.</div>;
  }

  const feedback = phase === "feedback" && selected !== null ? explainResult(current, selected) : null;

  return (
    <div className="siya-cert p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
          Final readiness assessment
        </h1>
        <p className="mt-1 text-sm text-[var(--siya-text-muted)]">{queue.length} questions · mixed modules</p>
        <div className="mt-4">
          <TrainingProgressBar pct={pct} />
        </div>
        <TrainingCard className="mt-8">
          <p className="text-xs text-[var(--siya-accent)]">{current.sourceRef}</p>
          <p className="mt-2 text-lg font-medium leading-snug text-[var(--siya-text)]">{current.prompt}</p>
          <div className="mt-4 space-y-2">
            {current.options.map((opt) => {
              const isCorrect = opt.key === current.correctKey;
              const isSelected = selected === opt.key;
              const state = optionState(phase, isCorrect, isSelected);
              return (
                <button
                  key={opt.key}
                  type="button"
                  disabled={phase !== "answer"}
                  onClick={() => phase === "answer" && setSelected(opt.key)}
                  className={quizOptionClass(state, phase === "answer")}
                >
                  <span className="mr-3 font-mono text-xs text-[var(--siya-text-muted)]">{opt.key}.</span>
                  {opt.text}
                </button>
              );
            })}
          </div>
          {phase === "answer" ? (
            <TrainingBtnPrimary className="mt-6 w-full" disabled={selected === null} onClick={submitAnswer}>
              Submit
            </TrainingBtnPrimary>
          ) : feedback ? (
            <QuizFeedbackPanel feedback={feedback} continueLabel="Next question" onContinue={goNext} />
          ) : null}
        </TrainingCard>
      </div>
    </div>
  );
}
