"use client";

import { useEffect, useState } from "react";
import { loadLocalPortalProfile } from "@/lib/portal-profile";
import {
  hasUnfinishedTourRecord,
  normalizePortalTour,
  shouldOfferProductTour,
  tourRemainingStepCount,
} from "@/lib/portal-product-tour";
import { usePortalTour } from "@/context/PortalTourContext";
import { PortalNavLink } from "@/components/training/PortalNavLink";

const SESSION_DISMISS_KEY = "siya-tour-nudge-dismissed-session";

function isDismissedThisSession(): boolean {
  try {
    return sessionStorage.getItem(SESSION_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function dismissThisSession(): void {
  try {
    sessionStorage.setItem(SESSION_DISMISS_KEY, "1");
  } catch {
    /* private mode */
  }
}

/**
 * Low-profile, once-per-session tour nudge — dismissible so it never stacks above Ask.
 */
export function ProductTourNudgeBanner() {
  const { resumeTour } = usePortalTour();
  const [offer, setOffer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [stepNum, setStepNum] = useState(1);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(isDismissedThisSession());
    const refresh = () => {
      const profile = loadLocalPortalProfile();
      setOffer(shouldOfferProductTour(profile));
      const unfinished = hasUnfinishedTourRecord(profile);
      setPaused(unfinished);
      const tour = normalizePortalTour(profile.productTour);
      setRemaining(tourRemainingStepCount(tour));
      setStepNum(Math.min(tour.currentStepIndex + 1, Math.max(1, tour.completedStepIds.length + 1)));
    };
    refresh();
    window.addEventListener("siya-portal-profile-updated", refresh);
    window.addEventListener("siya-portal-tour-updated", refresh);
    return () => {
      window.removeEventListener("siya-portal-profile-updated", refresh);
      window.removeEventListener("siya-portal-tour-updated", refresh);
    };
  }, []);

  if (dismissed || !offer) return null;

  function onDismiss() {
    dismissThisSession();
    setDismissed(true);
  }

  return (
    <div
      className="flex items-start justify-between gap-2 rounded-md border border-[var(--siya-border)]/70 bg-transparent px-2.5 py-1.5 text-[11px] leading-snug text-[var(--siya-text-muted)]"
      data-tour-nudge="session"
    >
      <p className="min-w-0">
        {paused ? (
          <>
            Tour paused · step {stepNum} · {remaining} left.{" "}
            <button
              type="button"
              className="font-semibold text-[var(--siya-text-secondary)] underline underline-offset-2"
              onClick={() => resumeTour()}
            >
              Resume
            </button>
          </>
        ) : (
          <>
            Optional tour:{" "}
            <PortalNavLink
              href="/product-tour"
              className="font-semibold text-[var(--siya-text-secondary)] underline underline-offset-2"
            >
              essentials
            </PortalNavLink>
            {" · "}
            <PortalNavLink
              href="/onboarding"
              className="font-semibold text-[var(--siya-text-secondary)] underline underline-offset-2"
            >
              Personalize
            </PortalNavLink>
          </>
        )}
      </p>
      <button
        type="button"
        className="shrink-0 rounded px-1 text-[10px] font-medium uppercase tracking-wide text-[var(--siya-text-muted)] hover:bg-[var(--siya-bg-subtle)] hover:text-[var(--siya-text-secondary)]"
        aria-label="Dismiss tour notice for this session"
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </div>
  );
}
