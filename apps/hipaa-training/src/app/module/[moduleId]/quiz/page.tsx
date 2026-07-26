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

function optionState(
  phase: Phase,
  isCorrect: boolean,
  isSelected: boolean
): QuizOptionState {
  if (phase === "feedback") {
    if (isCorrect) return "correct";
    if (isSelected && !isCorrect) return "incorrect";
    return "muted";
  }
  return isSelected ? "selected" : "default";
}

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
        <Link href="/training">Home</Link>
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
      <div className="siya-cert p-8 md:p-10">
        <div className="mx-auto max-w-lg">
          <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
            Module complete
          </h1>
          <p className="mt-2 text-[var(--siya-text-secondary)]">
            Score: {c}/{graded.length} ({pct}%)
          </p>
          <Link href="/training" className={`mt-6 ${trainingLinkPrimaryClass}`}>
            Return to certification dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!current || baseQueue.length === 0) {
    return (
      <div className="p-8">
        <p>No questions for this module with your role filter.</p>
        <Link href="/training">Dashboard</Link>
      </div>
    );
  }

  const feedback = phase === "feedback" && selected !== null ? explainResult(current, selected) : null;

  return (
    <div className="siya-cert p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--siya-text-muted)]">
              {mod.shortTitle} quiz · Question {mainIdx + 1} of {totalMain}
            </p>
            <p className="text-xs text-[var(--siya-accent)]">{current.sourceRef}</p>
          </div>
          <div className="w-40">
            <TrainingProgressBar pct={progressPct} />
          </div>
        </div>

        <TrainingCard>
          <p className="text-lg font-medium leading-snug text-[var(--siya-text)]">{current.prompt}</p>
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
              Check answer
            </TrainingBtnPrimary>
          ) : feedback ? (
            <QuizFeedbackPanel feedback={feedback} onContinue={continueAfterFeedback} />
          ) : null}
        </TrainingCard>

        <Link href={`/module/${moduleId}`} className={`mt-4 inline-block text-sm text-[var(--siya-text-muted)] hover:text-[var(--siya-accent)]`}>
          Back to lesson
        </Link>
      </div>
    </div>
  );
}
