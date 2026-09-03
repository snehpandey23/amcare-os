"use client";

import { usePathname } from "next/navigation";
import { useBrandIntroBoot } from "@/context/BrandIntroBootContext";
import { usePortalTour } from "@/context/PortalTourContext";
import {
  PORTAL_TOUR_STEPS,
  checkTourStepVerified,
  currentTourStep,
  defaultPortalTourState,
  isTourStepReadyToComplete,
} from "@/lib/portal-product-tour";
import { portalBtnAccent, portalBtnGhostSm } from "@/lib/portal-ui";

function renderLine(line: string) {
  const parts = line.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-[var(--siya-text)]">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function focusAskInput() {
  const el = document.querySelector<HTMLInputElement>('[data-tour="ask-input"]');
  if (!el) return false;
  el.focus();
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  return true;
}

function navigateTour(href: string) {
  // Match PortalNavLink — App Router soft navigation is unreliable for tour hops.
  window.location.assign(href);
}

function TourActionButton({ href, label }: { href: string; label: string }) {
  const pathname = usePathname() ?? "/";
  const [pathPart, queryPart] = href.split("?");
  const hashIdx = pathPart.indexOf("#");
  const targetPath = (hashIdx >= 0 ? pathPart.slice(0, hashIdx) : pathPart).replace(/\/$/, "") || "/";
  const currentPath = pathname.replace(/\/$/, "") || "/";
  const samePath = targetPath === currentPath;

  return (
    <button
      type="button"
      className={portalBtnAccent}
      onClick={() => {
        // Same path, no query/hash — focus in-page target (Ask input on My day).
        if (samePath && !queryPart && hashIdx < 0) {
          if (targetPath === "/") {
            focusAskInput();
            return;
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        navigateTour(href);
      }}
    >
      {label}
    </button>
  );
}

export function TourCoachBar() {
  const pathname = usePathname() ?? "/";
  const { splashDismissed } = useBrandIntroBoot();
  const { active, tourState, stepReady, progressPct, completeCurrentStep, finishTour, dismissTour } =
    usePortalTour();

  if (!splashDismissed || !active || pathname === "/product-tour" || pathname === "/login") return null;

  const state = tourState ?? defaultPortalTourState();
  const step = currentTourStep(state);
  const stepNum = state.currentStepIndex + 1;
  const total = PORTAL_TOUR_STEPS.length;
  const verified = checkTourStepVerified(step);
  const isFinish = step.id === "finish";
  /** Unverified steps with a target page: Continue navigates there (never a dead disabled click). */
  const continueNavigates = !verified && Boolean(step.actionHref);

  function onContinue() {
    if (isFinish) {
      finishTour();
      return;
    }
    if (!isTourStepReadyToComplete(step) && step.id !== "welcome") {
      if (step.actionHref) navigateTour(step.actionHref);
      return;
    }
    const nextIdx = Math.min(state.currentStepIndex + 1, PORTAL_TOUR_STEPS.length - 1);
    const next = PORTAL_TOUR_STEPS[nextIdx];
    completeCurrentStep();
    if (next && next.id !== step.id && next.actionHref) {
      navigateTour(next.actionHref);
    }
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-11 z-[55] flex justify-center px-3 pt-2 md:px-4"
      role="region"
      aria-label="Product tour coach"
    >
      <div className="pointer-events-auto w-full max-w-2xl rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--siya-border)] px-4 py-2">
          <p className="text-xs font-medium text-[var(--siya-text-muted)]">
            Product tour · Step {stepNum} of {total} · {progressPct}%
          </p>
          <button type="button" onClick={dismissTour} className={`${portalBtnGhostSm} text-xs`}>
            Pause tour
          </button>
        </div>
        <div className="max-h-[40vh] space-y-2 overflow-y-auto px-4 py-3">
          <h2 className="text-base font-semibold text-[var(--siya-text)]">{step.title}</h2>
          {step.lines.map((line) => (
            <p key={line} className="text-sm leading-relaxed text-[var(--siya-text-secondary)]">
              {renderLine(line)}
            </p>
          ))}
          <p className="text-xs text-[var(--siya-text-muted)]">
            {verified
              ? "✓ Step detected — you can continue."
              : continueNavigates
                ? `${step.verifyHint} (Continue opens it.)`
                : step.verifyHint}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--siya-border)] px-4 py-3">
          {step.actionHref ? (
            <TourActionButton href={step.actionHref} label={step.actionLabel ?? "Open"} />
          ) : null}
          {isFinish ? (
            <button type="button" className={portalBtnAccent} onClick={finishTour}>
              Finish tour
            </button>
          ) : (
            <button
              type="button"
              className={portalBtnAccent}
              disabled={!stepReady && !continueNavigates && step.id !== "welcome"}
              onClick={onContinue}
            >
              {step.id === "welcome"
                ? "Start hands-on steps"
                : continueNavigates
                  ? step.actionLabel ?? "Continue"
                  : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Top coach bar clearance so content is not hidden under the panel. */
export function TourCoachSpacer() {
  const pathname = usePathname() ?? "/";
  const { splashDismissed } = useBrandIntroBoot();
  const { active } = usePortalTour();
  if (!splashDismissed || !active || pathname === "/product-tour" || pathname === "/login") return null;
  return <div className="h-36 shrink-0 md:h-32" aria-hidden />;
}
