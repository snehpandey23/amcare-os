import type { QuizFeedback } from "@/lib/scoring";

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
      <div className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950 dark:border-teal-800 dark:bg-teal-950/30 dark:text-teal-100">
        <p className="font-semibold">{feedback.headline}</p>
        <p className="mt-2 leading-relaxed">{feedback.teaching}</p>
        <button
          type="button"
          onClick={onContinue}
          className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {continueLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-50">
      <p className="font-semibold">{feedback.headline}</p>
      <dl className="mt-3 space-y-3">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-amber-900/90 dark:text-amber-200/90">
            Correct answer
          </dt>
          <dd className="mt-1 font-medium leading-snug text-zinc-900 dark:text-zinc-100">{feedback.correctAnswer}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-amber-900/90 dark:text-amber-200/90">
            Your answer
          </dt>
          <dd className="mt-1 leading-snug line-through decoration-amber-700/50 dark:decoration-amber-300/50">
            {feedback.yourAnswer}
          </dd>
        </div>
        {feedback.whyNot ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-amber-900/90 dark:text-amber-200/90">
              Why that option is incorrect
            </dt>
            <dd className="mt-1 leading-relaxed">{feedback.whyNot}</dd>
          </div>
        ) : null}
      </dl>
      <div className="mt-4 border-t border-amber-300/60 pt-3 dark:border-amber-800">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-900/80 dark:text-amber-200/80">
          Teaching point
        </p>
        <p className="mt-1 leading-relaxed">{feedback.teaching}</p>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        {continueLabel}
      </button>
    </div>
  );
}
