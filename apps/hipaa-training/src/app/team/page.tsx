"use client";

import Link from "next/link";
import { TeamPulsePanel } from "@/components/team/TeamPulsePanel";
import { ShiftHandoffFeed } from "@/components/ops/ShiftHandoffFeed";
import { WeeklyCheckInFeed } from "@/components/ops/WeeklyCheckInFeed";
import { WeeklyCheckInCard } from "@/components/ops/WeeklyCheckInCard";
import { LeadKnowledgeGapsCard } from "@/components/ops/LeadKnowledgeGapsCard";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { portalBtnGhostSm, portalH1 } from "@/lib/portal-ui";

/**
 * Team = presence + handoffs for everyone.
 * Lead/admin ops chrome (gaps, weekly check-ins) stays below and is gated —
 * never replace the presence story at the top of the page.
 */
export default function TeamPage() {
  const { user, authReady } = useAuth();
  const showLeadOps = authReady && isPortalAdmin(user?.role);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className={portalH1}>Team</h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--siya-text-muted)]">
              Who is working, on break, or in focus — and shift handoffs. Self-declared presence only; no
              surveillance.
            </p>
          </div>
          {showLeadOps ? (
            <Link href="/ops" className={`${portalBtnGhostSm} text-[var(--siya-accent)]`}>
              Ops dashboard
            </Link>
          ) : null}
        </header>

        <TeamPulsePanel />
        <ShiftHandoffFeed />

        {showLeadOps ? (
          <>
            <LeadKnowledgeGapsCard />
            <WeeklyCheckInCard />
            <WeeklyCheckInFeed />
          </>
        ) : null}
      </div>
    </div>
  );
}
