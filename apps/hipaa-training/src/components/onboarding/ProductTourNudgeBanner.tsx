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
import { portalStatusInfoBox, portalStatusInfoText } from "@/lib/portal-ui";
import { PortalNavLink } from "@/components/training/PortalNavLink";

/** Prompt anyone who paused, skipped start, or never finished the essentials tour. */
export function ProductTourNudgeBanner() {
  const { resumeTour } = usePortalTour();
  const [offer, setOffer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [stepNum, setStepNum] = useState(1);

  useEffect(() => {
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

  if (!offer) return null;

  if (paused) {
    return (
      <div className={`${portalStatusInfoBox} px-3 py-2 text-xs ${portalStatusInfoText}`}>
        Tour paused · step {stepNum} · {remaining} remaining.{" "}
        <button
          type="button"
          className="font-semibold underline underline-offset-2"
          onClick={() => resumeTour()}
        >
          Resume tour
        </button>{" "}
        ·{" "}
        <PortalNavLink href="/product-tour" className="font-semibold underline underline-offset-2">
          Tour hub
        </PortalNavLink>
        .
      </div>
    );
  }

  return (
    <div className={`${portalStatusInfoBox} px-3 py-2 text-xs ${portalStatusInfoText}`}>
      Optional:{" "}
      <PortalNavLink href="/product-tour" className="font-semibold underline underline-offset-2">
        Run through the tour
      </PortalNavLink>{" "}
      — My day, Ask, Learn, Practice, Team, Feedback.{" "}
      <PortalNavLink href="/onboarding" className="font-semibold underline underline-offset-2">
        Personalize
      </PortalNavLink>{" "}
      anytime too.
    </div>
  );
}
