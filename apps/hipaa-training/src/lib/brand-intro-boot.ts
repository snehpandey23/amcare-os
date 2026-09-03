/**
 * Global branded splash boot — monotonic state machine (one owner per application boot).
 * Pure helpers are testable without React.
 */
import {
  BRAND_INTRO_EXIT_MS,
  BRAND_INTRO_HOLD_MS,
  BRAND_INTRO_PREVIEW_MS,
  BRAND_INTRO_REDUCED_MS,
  isBrandIntroPreviewQuery,
} from "@/lib/brand-intro";

export type BrandIntroBootPhase = "pending" | "booting" | "exiting" | "ready" | "skipped";

/** Survives React Strict Mode provider remount within one document load. */
let bootSessionPhase: BrandIntroBootPhase = "pending";

export function getBootSessionPhase(): BrandIntroBootPhase {
  return bootSessionPhase;
}

export function setBootSessionPhase(phase: BrandIntroBootPhase): void {
  bootSessionPhase = phase;
}

export function resetBootSessionForTests(): void {
  bootSessionPhase = "pending";
}

export function isSplashDismissed(phase: BrandIntroBootPhase): boolean {
  return phase === "ready" || phase === "skipped";
}

export function isBrandedSplashVisible(phase: BrandIntroBootPhase): boolean {
  return phase === "booting" || phase === "exiting";
}

/** Terminal phases — never return to booting during the same boot. */
export function isBootTerminal(phase: BrandIntroBootPhase): boolean {
  return phase === "ready" || phase === "skipped";
}

export type BootEvaluateInput = {
  shouldShow: boolean;
  alreadyCommitted: boolean;
};

/**
 * First transition from pending. Idempotent when alreadyCommitted.
 * Returns null when no change.
 */
export function evaluateBootStart(input: BootEvaluateInput): BrandIntroBootPhase | null {
  if (input.alreadyCommitted || bootSessionPhase !== "pending") return null;
  const next: BrandIntroBootPhase = input.shouldShow ? "booting" : "skipped";
  bootSessionPhase = next;
  return next;
}

export function computeHoldMs(opts?: {
  reducedMotion?: boolean;
  preview?: boolean;
}): number {
  if (opts?.reducedMotion) return BRAND_INTRO_REDUCED_MS;
  if (opts?.preview) return BRAND_INTRO_PREVIEW_MS;
  return BRAND_INTRO_HOLD_MS;
}

/** Remaining hold time from boot start — single timer source of truth. */
export function remainingHoldMs(bootStartAt: number, holdMs: number, now = Date.now()): number {
  return Math.max(0, holdMs - (now - bootStartAt));
}

export function resolveHoldMsFromEnv(): number {
  if (typeof window === "undefined") return BRAND_INTRO_HOLD_MS;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return computeHoldMs({ reducedMotion: reduce, preview: isBrandIntroPreviewQuery() });
}

export type BootTransition =
  | { type: "hold_complete" }
  | { type: "user_skip" }
  | { type: "exit_complete" };

/** Monotonic phase transitions for booting → exiting → ready. */
export function transitionBootPhase(
  phase: BrandIntroBootPhase,
  event: BootTransition,
): BrandIntroBootPhase {
  switch (phase) {
    case "booting":
      if (event.type === "hold_complete" || event.type === "user_skip") {
        bootSessionPhase = "exiting";
        return "exiting";
      }
      return phase;
    case "exiting":
      if (event.type === "exit_complete") {
        bootSessionPhase = "ready";
        return "ready";
      }
      return phase;
    default:
      return phase;
  }
}

export const BRAND_INTRO_BOOT_DEBUG =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_BRAND_INTRO_DEBUG === "1";

export type BootDebugEvent =
  | "mount"
  | "boot_start"
  | "readiness"
  | "exit_start"
  | "exit_complete"
  | "unmount"
  | "tour_check";

export function logBootDebug(event: BootDebugEvent, detail?: Record<string, unknown>): void {
  if (!BRAND_INTRO_BOOT_DEBUG) return;
  // eslint-disable-next-line no-console
  console.info(`[brand-intro-boot] ${event}`, detail ?? {});
}
