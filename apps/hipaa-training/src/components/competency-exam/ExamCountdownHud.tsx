"use client";

import {
  examTimerShellClass,
  examTimerUrgency,
  formatExamCountdown,
  type ExamTimerHudModel,
} from "@/lib/competency-exam/exam-timer";

/**
 * Fixed top-right countdown. Displays `model.remainingSec` from the section's own timer —
 * not a second clock.
 */
export function ExamCountdownHud({ model }: { model: ExamTimerHudModel | null }) {
  if (!model || model.totalSec <= 0) return null;

  const urgency = model.awaitingStart
    ? "normal"
    : examTimerUrgency(model.remainingSec, model.totalSec);
  const display = formatExamCountdown(model.awaitingStart ? model.totalSec : model.remainingSec);
  const shell = examTimerShellClass(urgency);

  return (
    <div
      className={`pointer-events-none fixed right-3 top-3 z-[60] min-w-[7.5rem] rounded-2xl border px-3 py-2 shadow-md sm:right-5 sm:top-4 ${shell}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      data-exam-timer="hud"
      data-urgency={urgency}
      data-remaining={Math.ceil(model.awaitingStart ? model.totalSec : model.remainingSec)}
      data-total={model.totalSec}
      data-awaiting-start={model.awaitingStart ? "1" : "0"}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{model.label}</p>
      <p className="font-mono text-xl font-bold tabular-nums leading-tight sm:text-2xl" data-exam-timer-display>
        {display}
      </p>
      <p className="text-[10px] opacity-70">
        {model.awaitingStart ? "Starts on first key" : "Time left"}
      </p>
      {/* Pulse the chrome only — number stays fully opaque for readability */}
      <style>{`
        @keyframes exam-timer-pulse {
          0%, 100% { box-shadow: 0 4px 14px rgba(244, 63, 94, 0.22); }
          50% { box-shadow: 0 4px 22px rgba(244, 63, 94, 0.45); }
        }
        .exam-timer-urgent { animation: exam-timer-pulse 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
