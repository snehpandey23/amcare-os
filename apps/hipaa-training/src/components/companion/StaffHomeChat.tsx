"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AssistChatShell } from "@/components/siya/AssistChatShell";
import { MyDayTasksPanel } from "@/components/tasks/MyDayTasksPanel";
import { SopLeadMyDayCard } from "@/components/sops/SopLeadMyDayCard";
import { LeadKnowledgeGapsCard } from "@/components/ops/LeadKnowledgeGapsCard";
import { WeeklyCheckInCard } from "@/components/ops/WeeklyCheckInCard";
import { useTourExpandToday } from "@/components/tour/PortalTourHost";
import { PORTAL_TOUR_ASK_CHIPS, markPortalTourComplete } from "@/lib/portal-tour";

/**
 * My day = continuous Assist chat (merged former Ask).
 * Checklist / lead queues stay secondary under the thread.
 */
function StaffHomeChatInner({
  firstName,
  inFocus,
  onBreak,
}: {
  firstName?: string;
  inFocus: boolean;
  onBreak: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const initialQuery = params.get("q")?.trim() || undefined;
  const focusFromUrl = params.get("focus") === "1";
  const askTour = params.get("tour") === "ask";
  const [showToday, setShowToday] = useState(false);

  const expandToday = useCallback(() => setShowToday(true), []);
  useTourExpandToday(expandToday);

  useEffect(() => {
    if (askTour) markPortalTourComplete();
  }, [askTour]);

  function runTourChip(text: string) {
    markPortalTourComplete();
    const q = new URLSearchParams({ tour: "ask", q: text });
    router.push(`/?${q.toString()}`);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {askTour ? (
        <div className="shrink-0 border-b border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-2">
          <p className="text-[11px] text-[var(--siya-text-muted)]">
            Ask tour — try a chip, or type your own. Chrome how-to lives here anytime.
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PORTAL_TOUR_ASK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-md border border-[var(--siya-border)] bg-[var(--siya-white)] px-2 py-1 text-[11px] text-[var(--siya-text-secondary)] hover:border-[var(--siya-accent)] hover:text-[var(--siya-primary)]"
                onClick={() => runTourChip(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="min-h-0 flex-1" data-tour="ask">
        <AssistChatShell
          key={initialQuery ? `tour-q:${initialQuery}` : "assist-home"}
          firstName={firstName}
          focusMode={inFocus || focusFromUrl}
          initialQuery={initialQuery}
        />
      </div>

      {!onBreak ? (
        <div className="shrink-0 px-3 py-1.5">
          <div className="flex items-center justify-end">
            <button
              type="button"
              data-tour="today"
              className="text-[11px] text-[var(--siya-text-muted)] hover:text-[var(--siya-text)]"
              onClick={() => setShowToday((v) => !v)}
            >
              {showToday ? "Hide today" : "Today"}
            </button>
          </div>
          {showToday ? (
            <div className="mt-2 space-y-3">
              {!inFocus ? <MyDayTasksPanel /> : null}
              <SopLeadMyDayCard />
              <LeadKnowledgeGapsCard />
              {!inFocus ? <WeeklyCheckInCard /> : null}
              <p className="text-[11px] text-[var(--siya-text-muted)]">
                HIPAA certification lives under{" "}
                <Link href="/training" className="underline underline-offset-2 hover:text-[var(--siya-text)]">
                  Learn
                </Link>
                .
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function StaffHomeChat(props: { firstName?: string; inFocus: boolean; onBreak: boolean }) {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>}>
      <StaffHomeChatInner {...props} />
    </Suspense>
  );
}
