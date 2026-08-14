"use client";

import { useEffect, useRef, useState } from "react";
import {
  BRAND_INTRO_SOUND_ENABLED,
  BRAND_INTRO_TAGLINE,
  isBrandIntroPreviewQuery,
  markBrandIntroShownToday,
} from "@/lib/brand-intro";

type Props = {
  onComplete: () => void;
};

const TOTAL_MS = 2600;
const PREVIEW_MS = 8000;
const REDUCED_MS = 450;
const EXIT_MS = 320;

/**
 * Sega-style first-load brand splash — once per day, skippable, silent by default.
 * Pure CSS animation; tap/click/Escape skips straight to My day.
 */
export function BrandIntroSplash({ onComplete }: Props) {
  const [exiting, setExiting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const doneRef = useRef(false);
  const releasedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const finishRef = useRef<() => void>(() => {});
  onCompleteRef.current = onComplete;

  useEffect(() => {
    markBrandIntroShownToday();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduce);

    if (BRAND_INTRO_SOUND_ENABLED) {
      // playIntroChime();
    }

    let exitTimer: number | undefined;

    const release = () => {
      if (releasedRef.current) return;
      releasedRef.current = true;
      onCompleteRef.current();
    };

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      markBrandIntroShownToday();
      const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (instant) {
        release();
        return;
      }
      setExiting(true);
      exitTimer = window.setTimeout(release, EXIT_MS);
    };
    finishRef.current = finish;

    const ms = reduce
      ? REDUCED_MS
      : isBrandIntroPreviewQuery()
        ? PREVIEW_MS
        : TOTAL_MS;
    const auto = window.setTimeout(finish, ms);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(auto);
      if (exitTimer !== undefined) window.clearTimeout(exitTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

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
      onPointerDown={() => finishRef.current()}
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
