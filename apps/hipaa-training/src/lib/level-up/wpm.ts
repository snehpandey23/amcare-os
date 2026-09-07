/**
 * Shared WPM sanity — paste / focus-to-send / near-zero elapsed must never
 * display as a real pace (staff saw 2371 WPM from a timing artifact).
 */

/** Sustained human ceiling used as hard reject (not a soft display clamp). */
export const MAX_PLAUSIBLE_WPM = 200;

/** Below this, char/word ÷ time is dominated by timer granularity / paste. */
export const MIN_ELAPSED_SEC_FOR_RELIABLE_WPM = 1.5;

export type WpmEstimate = {
  /** Rounded WPM when reliable; otherwise 0 (do not show as a real score). */
  wpm: number;
  reliable: boolean;
  /** Raw uncapped value before sanity gate (for diagnostics). */
  rawWpm: number;
  reason?: "elapsed_too_short" | "implausible_pace" | "no_sample" | "invalid";
};

export function estimateWpmFromChars(correctChars: number, elapsedSec: number): WpmEstimate {
  if (!Number.isFinite(correctChars) || correctChars < 0 || !Number.isFinite(elapsedSec)) {
    return { wpm: 0, reliable: false, rawWpm: 0, reason: "invalid" };
  }
  if (elapsedSec <= 0 || correctChars === 0) {
    return { wpm: 0, reliable: false, rawWpm: 0, reason: "no_sample" };
  }
  const minutes = elapsedSec / 60;
  const rawWpm = correctChars / 5 / minutes;
  return sanitizeRawWpm(rawWpm, elapsedSec);
}

export function estimateWpmFromWords(wordCount: number, elapsedSec: number): WpmEstimate {
  if (!Number.isFinite(wordCount) || wordCount < 0 || !Number.isFinite(elapsedSec)) {
    return { wpm: 0, reliable: false, rawWpm: 0, reason: "invalid" };
  }
  if (elapsedSec <= 0 || wordCount === 0) {
    return { wpm: 0, reliable: false, rawWpm: 0, reason: "no_sample" };
  }
  const rawWpm = wordCount / (elapsedSec / 60);
  return sanitizeRawWpm(rawWpm, elapsedSec);
}

export function sanitizeRawWpm(rawWpm: number, elapsedSec: number): WpmEstimate {
  if (!Number.isFinite(rawWpm) || rawWpm < 0) {
    return { wpm: 0, reliable: false, rawWpm: 0, reason: "invalid" };
  }
  const rounded = Math.round(rawWpm);
  if (elapsedSec < MIN_ELAPSED_SEC_FOR_RELIABLE_WPM) {
    return { wpm: 0, reliable: false, rawWpm: rounded, reason: "elapsed_too_short" };
  }
  if (rounded > MAX_PLAUSIBLE_WPM) {
    return { wpm: 0, reliable: false, rawWpm: rounded, reason: "implausible_pace" };
  }
  return { wpm: rounded, reliable: true, rawWpm: rounded };
}

export function wpmDisplayLabel(est: Pick<WpmEstimate, "wpm" | "reliable">): string {
  if (!est.reliable || est.wpm <= 0) return "Unable to estimate";
  return `${est.wpm} WPM`;
}
