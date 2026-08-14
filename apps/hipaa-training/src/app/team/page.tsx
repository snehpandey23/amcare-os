import { TeamPulsePanel } from "@/components/team/TeamPulsePanel";
import { ShiftHandoffFeed } from "@/components/ops/ShiftHandoffFeed";
import { WeeklyCheckInFeed } from "@/components/ops/WeeklyCheckInFeed";
import { WeeklyCheckInCard } from "@/components/ops/WeeklyCheckInCard";
import { LeadKnowledgeGapsCard } from "@/components/ops/LeadKnowledgeGapsCard";
import { portalH1 } from "@/lib/portal-ui";

export default function TeamPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
        <header>
          <h1 className={portalH1}>Team</h1>
          <p className="mt-1 max-w-xl text-sm text-[var(--siya-text-muted)]">
            One place to see who is working, on break, or in focus — and what each person has on the board for today.
            Self-declared presence only; no surveillance.
          </p>
        </header>
        <LeadKnowledgeGapsCard />
        <WeeklyCheckInCard />
        <WeeklyCheckInFeed />
        <ShiftHandoffFeed />
        <TeamPulsePanel />
      </div>
    </div>
  );
}
