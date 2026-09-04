"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePortalTour } from "@/context/PortalTourContext";
import { loadLocalPortalProfile } from "@/lib/portal-profile";
import {
  isPortalTourInProgress,
  isPortalTourFinished,
  PORTAL_TOUR_STEPS,
  PORTAL_TOUR_ESSENTIALS,
} from "@/lib/portal-product-tour";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { portalBtnGhostSm, portalH1, portalPage, portalSection } from "@/lib/portal-ui";
import { BRAND } from "@/lib/brand";
import { PortalNavLink } from "@/components/training/PortalNavLink";

/** Later re-entry / re-run for the essentials tour (first-run chains from onboarding). */
export function ProductTourLanding() {
  const router = useRouter();
  const { authReady, user } = useAuth();
  const { startTour } = usePortalTour();
  const profile = loadLocalPortalProfile();
  const inProgress = isPortalTourInProgress(profile);
  const finished = isPortalTourFinished(profile);
  const firstName = user?.name?.trim().split(/\s+/)[0] || "there";

  useEffect(() => {
    if (inProgress) router.replace("/");
  }, [inProgress, router]);

  if (inProgress) return null;

  const canStart = authReady && Boolean(user?.id);

  return (
    <div className={`${portalPage} mx-auto max-w-lg px-4 py-10 md:py-14`}>
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--siya-text-muted)]">
        {BRAND.appName} · essentials walkthrough
      </p>
      <h1 className={`${portalH1} mt-2`}>Run through the tour</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--siya-text-secondary)]">
        Hi {firstName} — a short hands-on tour of <strong>what you need to get started</strong>, not every feature
        in the portal. You’ll try Ask, Learn, one practice drill, HIPAA training, Team, sandbox Feedback, and how
        gap reporting works.
      </p>
      <p className="mt-2 text-xs text-[var(--siya-text-muted)]">
        Personalization lives under{" "}
        <PortalNavLink href="/onboarding" className="font-semibold underline underline-offset-2">
          Personalize
        </PortalNavLink>
        . You can take this tour anytime — it is not required to use My day.
      </p>

      <section className={`${portalSection} mt-6 space-y-2`}>
        <p className="text-sm font-semibold text-[var(--siya-text)]">
          Essentials in this tour ({PORTAL_TOUR_STEPS.length} steps)
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm text-[var(--siya-text-secondary)]">
          {PORTAL_TOUR_ESSENTIALS.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
        <p className="text-xs text-[var(--siya-text-muted)]">
          About 10 minutes · progress saves to your account · other tools stay available later as you need them
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-3">
        {finished ? (
          <>
            <p className="text-sm text-[var(--siya-status-success-text)]">You completed or skipped this tour earlier.</p>
            <button type="button" className={trainingLinkPrimaryClass} onClick={startTour} disabled={!canStart}>
              Run through again
            </button>
          </>
        ) : (
          <button type="button" className={trainingLinkPrimaryClass} onClick={startTour} disabled={!canStart}>
            Begin essentials tour
          </button>
        )}
        <PortalNavLink href="/" className={`${portalBtnGhostSm} text-center`}>
          Back to My day
        </PortalNavLink>
      </div>
    </div>
  );
}
