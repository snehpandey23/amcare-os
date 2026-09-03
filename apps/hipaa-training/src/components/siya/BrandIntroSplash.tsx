"use client";

import { useEffect, useRef, useState } from "react";
import {
  BRAND_INTRO_SOUND_ENABLED,
  BRAND_INTRO_TAGLINE,
  markBrandIntroShownToday,
} from "@/lib/brand-intro";
import { logBootDebug } from "@/lib/brand-intro-boot";

type Props = {
  /** Controlled by BrandIntroBootProvider — fade-out phase. */
  exiting?: boolean;
  /** User tap / key skip — provider owns timers. */
  onSkip?: () => void;
  /** Idempotent exit completion (after fade or reduced motion). */
  onExitComplete?: () => void;
};

/**
 * Branded splash visuals only — timing and boot phase owned by BrandIntroBootProvider.
 * Hold + fade ≈ 2.2s total when provider timers run normally.
 */
export function BrandIntroSplash({ exiting = false, onSkip, onExitComplete }: Props) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const mountedRef = useRef(false);
  const skipRef = useRef(onSkip);
  const exitCompleteRef = useRef(onExitComplete);
  skipRef.current = onSkip;
  exitCompleteRef.current = onExitComplete;

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    markBrandIntroShownToday();
    logBootDebug("mount", { component: "BrandIntroSplash" });
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (BRAND_INTRO_SOUND_ENABLED) {
      // playIntroChime();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        skipRef.current?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Reduced motion: skip fade — complete immediately when exiting. */
  useEffect(() => {
    if (!exiting || !reducedMotion) return;
    exitCompleteRef.current?.();
  }, [exiting, reducedMotion]);

  return (
    <div
      className={[
        "siya-brand-intro",
        exiting ? "siya-brand-intro--exit" : "",
        reducedMotion ? "siya-brand-intro--reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-label="Siya brand introduction"
      aria-live="polite"
      onPointerDown={() => skipRef.current?.()}
    >
      <div className="siya-brand-intro__stage">
        <p className="siya-brand-intro__wordmark" aria-label="Siya">
          <span className="siya-brand-intro__si">Si</span>
          <span className="siya-brand-intro__ya">ya</span>
        </p>
        <p className="siya-brand-intro__tagline">{BRAND_INTRO_TAGLINE}</p>
      </div>
    </div>
  );
}
