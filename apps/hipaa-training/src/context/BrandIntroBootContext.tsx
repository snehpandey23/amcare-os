"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { BrandIntroSplash } from "@/components/siya/BrandIntroSplash";
import { shouldShowBrandIntro, BRAND_INTRO_EXIT_MS } from "@/lib/brand-intro";
import {
  evaluateBootStart,
  getBootSessionPhase,
  isBrandedSplashVisible,
  isSplashDismissed,
  logBootDebug,
  remainingHoldMs,
  resolveHoldMsFromEnv,
  setBootSessionPhase,
  transitionBootPhase,
  type BrandIntroBootPhase,
} from "@/lib/brand-intro-boot";
import { isPortalTourInProgress } from "@/lib/portal-product-tour";
import { loadLocalPortalProfile } from "@/lib/portal-profile";

type BrandIntroBootContextValue = {
  phase: BrandIntroBootPhase;
  /** True once splash finished or was skipped — tour coach bar and main chrome may show. */
  splashDismissed: boolean;
  splashVisible: boolean;
};

const BrandIntroBootContext = createContext<BrandIntroBootContextValue>({
  phase: "pending",
  splashDismissed: false,
  splashVisible: false,
});

export function useBrandIntroBoot(): BrandIntroBootContextValue {
  return useContext(BrandIntroBootContext);
}

function tourInProgressNow(): boolean {
  return isPortalTourInProgress(loadLocalPortalProfile());
}

export function BrandIntroBootProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<BrandIntroBootPhase>(() => getBootSessionPhase());
  const committedRef = useRef(getBootSessionPhase() !== "pending");
  const bootStartAtRef = useRef<number | null>(null);
  const exitDoneRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const finishExit = useCallback(() => {
    if (exitDoneRef.current) return;
    exitDoneRef.current = true;
    logBootDebug("exit_complete");
    setPhase((prev) => {
      const next = transitionBootPhase(prev, { type: "exit_complete" });
      setBootSessionPhase(next);
      return next;
    });
  }, []);

  const beginExit = useCallback(() => {
    clearHoldTimer();
    logBootDebug("exit_start");
    setPhase((prev) => {
      if (prev !== "booting") return prev;
      const next = transitionBootPhase(prev, { type: "user_skip" });
      setBootSessionPhase(next);
      return next;
    });
  }, [clearHoldTimer]);

  /** Evaluate once per boot — tour-aware; defer one frame for profile bind. */
  useEffect(() => {
    logBootDebug("mount", { sessionPhase: getBootSessionPhase() });
    if (committedRef.current) return;

    let cancelled = false;

    const commit = (source: string) => {
      if (cancelled || committedRef.current) return;
      const tourActive = tourInProgressNow();
      logBootDebug("tour_check", { tourInProgress: tourActive, source });
      const shouldShow = shouldShowBrandIntro({ tourInProgress: tourActive });
      const next = evaluateBootStart({ shouldShow, alreadyCommitted: committedRef.current });
      if (!next) return;

      committedRef.current = true;
      logBootDebug("boot_start", { next, shouldShow, tourInProgress: tourActive, source });

      if (next === "booting") {
        bootStartAtRef.current = Date.now();
      }
      setPhase(next);
      setBootSessionPhase(next);
    };

    const raf = requestAnimationFrame(() => commit("raf"));
    const onProfile = () => commit("profile-updated");
    window.addEventListener("siya-portal-profile-updated", onProfile);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("siya-portal-profile-updated", onProfile);
    };
  }, []);

  /** If tour becomes active while splash is booting, abort immediately (coach bar must not hide). */
  useEffect(() => {
    const abortForTour = () => {
      if (!tourInProgressNow()) return;
      if (phase !== "booting" && phase !== "pending") return;
      logBootDebug("readiness", { abortedForTour: true, phase });
      clearHoldTimer();
      clearExitTimer();
      exitDoneRef.current = true;
      committedRef.current = true;
      setPhase("skipped");
      setBootSessionPhase("skipped");
    };

    window.addEventListener("siya-portal-profile-updated", abortForTour);
    window.addEventListener("siya-portal-tour-updated", abortForTour);
    return () => {
      window.removeEventListener("siya-portal-profile-updated", abortForTour);
      window.removeEventListener("siya-portal-tour-updated", abortForTour);
    };
  }, [phase, clearHoldTimer, clearExitTimer]);

  /** Hold timer — one timer, remaining duration from boot start. */
  useEffect(() => {
    if (phase !== "booting") return;
    const start = bootStartAtRef.current ?? Date.now();
    bootStartAtRef.current = start;
    const holdMs = resolveHoldMsFromEnv();
    const delay = remainingHoldMs(start, holdMs);
    logBootDebug("readiness", { holdMs, delay });

    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      setPhase((prev) => {
        const next = transitionBootPhase(prev, { type: "hold_complete" });
        setBootSessionPhase(next);
        return next;
      });
      logBootDebug("exit_start", { reason: "hold_complete" });
    }, delay);

    return () => clearHoldTimer();
  }, [phase, clearHoldTimer]);

  /** Exit fade timer */
  useEffect(() => {
    if (phase !== "exiting") return;
    exitTimerRef.current = setTimeout(finishExit, BRAND_INTRO_EXIT_MS);
    return () => clearExitTimer();
  }, [phase, finishExit, clearExitTimer]);

  useEffect(() => {
    return () => {
      logBootDebug("unmount");
      clearHoldTimer();
      clearExitTimer();
    };
  }, [clearHoldTimer, clearExitTimer]);

  const splashVisible = isBrandedSplashVisible(phase);
  const splashDismissed = isSplashDismissed(phase);

  return (
    <BrandIntroBootContext.Provider value={{ phase, splashDismissed, splashVisible }}>
      {children}
      {splashVisible ? (
        <BrandIntroSplash
          exiting={phase === "exiting"}
          onSkip={beginExit}
          onExitComplete={finishExit}
        />
      ) : null}
    </BrandIntroBootContext.Provider>
  );
}
