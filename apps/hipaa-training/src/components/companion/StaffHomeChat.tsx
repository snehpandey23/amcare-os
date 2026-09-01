"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AssistChatShell } from "@/components/siya/AssistChatShell";
import { MyDayTasksPanel } from "@/components/tasks/MyDayTasksPanel";
import { SopLeadMyDayCard } from "@/components/sops/SopLeadMyDayCard";
import { LeadKnowledgeGapsCard } from "@/components/ops/LeadKnowledgeGapsCard";
import {
  LeadYourFocusStrip,
  useIsClinicalYourFocusLead,
} from "@/components/ops/LeadYourFocusStrip";
import { WeeklyCheckInCard } from "@/components/ops/WeeklyCheckInCard";
import { PracticeInactivityNudgeBanner } from "@/components/level-up/PracticeInactivityNudgeBanner";

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
  const params = useSearchParams();
  const initialQuery = params.get("q")?.trim() || undefined;
  const focusFromUrl = params.get("focus") === "1";
  const [showToday, setShowToday] = useState(false);
  const isClinicalFocusLead = useIsClinicalYourFocusLead();

  return (
    <div className="flex h-full min-h-0 flex-col">
      {!onBreak && !inFocus ? (
        <div className="shrink-0 px-3 pt-2">
          <PracticeInactivityNudgeBanner />
        </div>
      ) : null}
      {/* Phase 1: Clinical lead Your Focus — always visible above Ask, not buried in Today. */}
      {!onBreak && !inFocus ? (
        <div className="shrink-0 px-3 pt-2">
          <LeadYourFocusStrip />
        </div>
      ) : null}
      <div className="min-h-0 flex-1">
        <AssistChatShell
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
              {/* Clinical lead uses Your Focus above; other leads keep the gaps card here. */}
              {isClinicalFocusLead ? null : <LeadKnowledgeGapsCard />}
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
