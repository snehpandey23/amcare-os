import type { QuizFeedback } from "@/lib/scoring";
import { TrainingBtnNavy, TrainingCard } from "./training-ui";

export function QuizFeedbackPanel({
  feedback,
  continueLabel = "Continue",
  onContinue,
}: {
  feedback: QuizFeedback;
  continueLabel?: string;
  onContinue: () => void;
}) {
  if (feedback.correct) {
    return (
      <TrainingCard className="mt-6 border-[var(--siya-primary)]/20 bg-[var(--siya-bg-subtle)] p-4">
        <p className="font-semibold text-[var(--siya-primary)]">{feedback.headline}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--siya-text-secondary)]">{feedback.teaching}</p>
        <TrainingBtnNavy className="mt-4" onClick={onContinue}>
          {continueLabel}
        </TrainingBtnNavy>
      </TrainingCard>
    );
  }

  return (
    <TrainingCard className="mt-6 border-amber-200/80 bg-amber-50/50 p-4">
      <p className="font-semibold text-amber-950">{feedback.headline}</p>
      <dl className="mt-3 space-y-3 text-sm text-[var(--siya-text-secondary)]">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--siya-primary)]">Correct answer</dt>
          <dd className="mt-1 font-medium leading-snug text-[var(--siya-text)]">{feedback.correctAnswer}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">Your answer</dt>
          <dd className="mt-1 leading-snug line-through decoration-amber-700/40">{feedback.yourAnswer}</dd>
        </div>
        {feedback.whyNot ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
              Why that option is incorrect
            </dt>
            <dd className="mt-1 leading-relaxed">{feedback.whyNot}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4 border-t border-amber-200/60 pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--siya-primary)]">Teaching point</p>
        <p className="mt-1 text-sm leading-relaxed">{feedback.teaching}</p>
      </div>
      <TrainingBtnNavy className="mt-4" onClick={onContinue}>
        {continueLabel}
      </TrainingBtnNavy>
    </TrainingCard>
  );
}
