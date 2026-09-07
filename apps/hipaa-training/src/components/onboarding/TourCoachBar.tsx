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

function detectionLabel(kind: string, verified: boolean): string {
  if (!verified) return "";
  if (kind === "visit") return "✓ Page visited — you can continue.";
  if (kind === "ask" || kind === "practice" || kind === "feedback") {
    return "✓ Action completed — you can continue.";
  }
  return "✓ Ready — you can continue.";
}

/**
 * Docked coach (top-right on md+) — not a full-width overlay.
 * Pause keeps progress; resume from My day.
 */
export function TourCoachBar() {
  const pathname = usePathname() ?? "/";
  const { splashDismissed } = useBrandIntroBoot();
  const { active, tourState, stepReady, progressPct, completeCurrentStep, finishTour, pauseTour } =
    usePortalTour();

  if (!splashDismissed || !active || pathname === "/product-tour" || pathname === "/login") return null;

  const state = tourState ?? defaultPortalTourState();
  const step = currentTourStep(state);
  const stepNum = state.currentStepIndex + 1;
  const total = PORTAL_TOUR_STEPS.length;
  const verified = checkTourStepVerified(step);
  const isFinish = step.id === "finish";
  /** Unverified + has href: one CTA opens the target (no duplicate same-label button). */
  const needsNavigate = !verified && Boolean(step.actionHref);

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
      className="pointer-events-none fixed inset-x-0 top-12 z-[55] flex justify-end px-3 pt-2 md:inset-x-auto md:right-3 md:top-14 md:w-[min(100%,22rem)] md:px-0"
      role="region"
      aria-label="Product tour coach"
    >
      <div className="pointer-events-auto w-full max-w-md rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] shadow-lg md:max-w-none">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--siya-border)] px-3 py-2">
          <p className="text-[11px] font-medium text-[var(--siya-text-muted)]">
            Tour · {stepNum}/{total} · {progressPct}%
          </p>
          <button type="button" onClick={pauseTour} className={`${portalBtnGhostSm} text-xs`}>
            Pause tour
          </button>
        </div>
        <div className="max-h-[36vh] space-y-2 overflow-y-auto px-3 py-2.5">
          <h2 className="text-sm font-semibold text-[var(--siya-text)]">{step.title}</h2>
          {step.lines.map((line) => (
            <p key={line} className="text-xs leading-relaxed text-[var(--siya-text-secondary)]">
              {renderLine(line)}
            </p>
          ))}
          <p className="text-[11px] text-[var(--siya-text-muted)]">
            {verified
              ? detectionLabel(step.kind, verified)
              : needsNavigate
                ? `${step.verifyHint} (button below opens it.)`
                : step.verifyHint}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--siya-border)] px-3 py-2.5">
          {isFinish ? (
            <button type="button" className={portalBtnAccent} onClick={finishTour}>
              Finish tour
            </button>
          ) : needsNavigate ? (
            <TourActionButton href={step.actionHref!} label={step.actionLabel ?? "Open"} />
          ) : (
            <button
              type="button"
              className={portalBtnAccent}
              disabled={!stepReady && step.id !== "welcome"}
              onClick={onContinue}
            >
              {step.id === "welcome" ? "Start hands-on steps" : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Clearance so content is not hidden under the docked coach. */
export function TourCoachSpacer() {
  const pathname = usePathname() ?? "/";
  const { splashDismissed } = useBrandIntroBoot();
  const { active } = usePortalTour();
  if (!splashDismissed || !active || pathname === "/product-tour" || pathname === "/login") return null;
  return <div className="h-4 shrink-0 md:h-2" aria-hidden />;
}
