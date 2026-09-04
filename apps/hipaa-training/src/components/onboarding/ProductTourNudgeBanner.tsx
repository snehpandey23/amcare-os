"use client";

import { PortalNavLink } from "@/components/training/PortalNavLink";
import { useEffect, useState } from "react";
import { loadLocalPortalProfile } from "@/lib/portal-profile";
import { shouldOfferProductTour } from "@/lib/portal-product-tour";
import { portalStatusInfoBox, portalStatusInfoText } from "@/lib/portal-ui";

/** Prompt anyone who skipped or never finished the essentials tour. */
export function ProductTourNudgeBanner() {
  const [offer, setOffer] = useState(false);

  useEffect(() => {
    const refresh = () => setOffer(shouldOfferProductTour(loadLocalPortalProfile()));
    refresh();
    window.addEventListener("siya-portal-profile-updated", refresh);
    window.addEventListener("siya-portal-tour-updated", refresh);
    return () => {
      window.removeEventListener("siya-portal-profile-updated", refresh);
      window.removeEventListener("siya-portal-tour-updated", refresh);
    };
  }, []);

  if (!offer) return null;

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
