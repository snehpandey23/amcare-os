/** Shared competency-exam countdown urgency from the SAME remaining/total the section uses. */

export type ExamTimerUrgency = "normal" | "warn" | "urgent";

/**
 * Graduated warnings from remaining/allotted ratio.
 * - warn at ≤25% remaining
 * - urgent at ≤10% remaining
 */
export function examTimerUrgency(remainingSec: number, totalSec: number): ExamTimerUrgency {
  if (!(totalSec > 0)) return "normal";
  const ratio = Math.max(0, remainingSec) / totalSec;
  if (ratio <= 0.1) return "urgent";
  if (ratio <= 0.25) return "warn";
  return "normal";
}

/** Tailwind shell for HUD — tested so 25%/10% map to amber/red classes. */
export function examTimerShellClass(urgency: ExamTimerUrgency): string {
  if (urgency === "urgent") {
    return "border-rose-500/80 bg-rose-50 text-rose-900 shadow-rose-200/80 exam-timer-urgent";
  }
  if (urgency === "warn") {
    return "border-amber-500/80 bg-amber-50 text-amber-950 shadow-amber-200/70";
  }
  return "border-[var(--siya-border)] bg-[var(--siya-white)] text-[var(--siya-primary)] shadow-[var(--siya-shadow)]";
}

export function formatExamCountdown(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export type ExamTimerHudModel = {
  /** Seconds left — must be the same value that drives auto-submit / scoring for this section. */
  remainingSec: number;
  /** Allotted seconds for this section (denominator for 25%/10% thresholds). */
  totalSec: number;
  label: string;
  /** Typing: clock armed but first keystroke not yet pressed. */
  awaitingStart?: boolean;
};

export const COMPETENCY_EXAM_TIMERS = {
  typing: 120,
  hipaa: 12 * 60,
  writing: 10 * 60,
  /** Exam-only wall clock for chat-sim (practice still uses turn cap only). */
  chat: 10 * 60,
} as const;
