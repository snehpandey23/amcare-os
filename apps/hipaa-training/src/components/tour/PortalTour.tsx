"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  STAFF_SPOTLIGHT_STEPS,
  markPortalTourComplete,
  portalTourAskHref,
  type SpotlightStep,
  type SpotlightStepId,
} from "@/lib/portal-tour";
import { portalBtnAccentSm, portalBtnGhostSm, portalBtnNavySm, portalSection } from "@/lib/portal-ui";

type Phase = "pick" | "spotlight" | "done";

type Rect = { top: number; left: number; width: number; height: number };

function measureTarget(tourId: string): Rect | null {
  const el = document.querySelector(`[data-tour="${tourId}"]`) as HTMLElement | null;
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return null;
  const pad = 6;
  return {
    top: Math.max(0, r.top - pad),
    left: Math.max(0, r.left - pad),
    width: r.width + pad * 2,
    height: r.height + pad * 2,
  };
}

function resolveSteps(onShift: boolean): SpotlightStep[] {
  return STAFF_SPOTLIGHT_STEPS.filter((s) => {
    if (s.id === "end-shift" && !onShift) return false;
    return true;
  });
}

type Props = {
  open: boolean;
  onShift: boolean;
  /** Expand Today panel when that step is active */
  onExpandToday?: () => void;
  onOpenMobileNav?: () => void;
  onClose: () => void;
};

export function PortalTour({ open, onShift, onExpandToday, onOpenMobileNav, onClose }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("pick");
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const steps = resolveSteps(onShift);
  const step = steps[stepIndex] ?? null;

  const finish = useCallback(() => {
    markPortalTourComplete();
    setPhase("done");
    onClose();
  }, [onClose]);

  const startAsk = useCallback(() => {
    markPortalTourComplete();
    onClose();
    router.push(portalTourAskHref());
  }, [onClose, router]);

  const refreshRect = useCallback(() => {
    if (!step) {
      setRect(null);
      return;
    }
    setRect(measureTarget(step.target));
  }, [step]);

  useLayoutEffect(() => {
    if (!open || phase !== "spotlight" || !step) return;
    if (step.expandToday) onExpandToday?.();
    if (step.openMobileNav && typeof window !== "undefined" && window.innerWidth < 768) {
      onOpenMobileNav?.();
    }
    const t = window.setTimeout(refreshRect, 60);
    return () => window.clearTimeout(t);
  }, [open, phase, step, onExpandToday, onOpenMobileNav, refreshRect]);

  useEffect(() => {
    if (!open || phase !== "spotlight") return;
    const onResize = () => refreshRect();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, phase, refreshRect]);

  useEffect(() => {
    if (!open) {
      setPhase("pick");
      setStepIndex(0);
      setRect(null);
    }
  }, [open]);

  if (!open || phase === "done") return null;

  if (phase === "pick") {
    return (
      <div
        className="fixed inset-0 z-[90] flex items-end justify-center bg-black/40 p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="portal-tour-title"
      >
        <div className={`w-full max-w-md p-5 shadow-[var(--siya-shadow-lg)] ${portalSection}`}>
          <h2 id="portal-tour-title" className="text-lg font-semibold text-[var(--siya-primary)]">
            Quick My day tour
          </h2>
          <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">
            New here? Pick how you want to learn the basics — about a minute either way.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <button
              type="button"
              className={portalBtnAccentSm}
              onClick={() => {
                setStepIndex(0);
                setPhase("spotlight");
              }}
            >
              Show me the buttons
            </button>
            <button type="button" className={portalBtnNavySm} onClick={startAsk}>
              Ask Assist to walk me through
            </button>
            <button type="button" className={portalBtnGhostSm} onClick={finish}>
              Skip for now
            </button>
          </div>
          <p className="mt-3 text-[11px] text-[var(--siya-text-muted)]">
            Restart anytime from Account → Show My day tour again.
          </p>
        </div>
      </div>
    );
  }

  // spotlight
  const tipTop = rect ? Math.min(window.innerHeight - 200, rect.top + rect.height + 12) : 80;
  const tipLeft = rect ? Math.min(Math.max(12, rect.left), window.innerWidth - 320) : 16;

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="portal-tour-step-title">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-black/45"
        aria-label="Tour backdrop"
        onClick={() => {
          /* stay on tour — use Skip */
        }}
      />
      {rect ? (
        <div
          className="pointer-events-none absolute rounded-lg ring-2 ring-[var(--siya-accent)] ring-offset-2 ring-offset-transparent"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
          }}
        />
      ) : null}
      <div
        className={`absolute z-[91] w-[min(100%-1.5rem,20rem)] p-4 shadow-[var(--siya-shadow-lg)] ${portalSection}`}
        style={{ top: tipTop, left: tipLeft }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
          Step {stepIndex + 1} of {steps.length}
        </p>
        <h2 id="portal-tour-step-title" className="mt-1 text-sm font-semibold text-[var(--siya-primary)]">
          {step?.title}
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--siya-text-secondary)]">{step?.body}</p>
        {!rect && step ? (
          <p className="mt-2 text-[11px] text-[var(--siya-status-warn-text)]">
            That control isn’t on screen right now — Next continues the tour.
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={portalBtnAccentSm}
            onClick={() => {
              if (stepIndex >= steps.length - 1) finish();
              else setStepIndex((i) => i + 1);
            }}
          >
            {stepIndex >= steps.length - 1 ? "Done" : "Next"}
          </button>
          <button type="button" className={portalBtnGhostSm} onClick={startAsk}>
            Switch to Ask
          </button>
          <button type="button" className={portalBtnGhostSm} onClick={finish}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

export type { SpotlightStepId };
