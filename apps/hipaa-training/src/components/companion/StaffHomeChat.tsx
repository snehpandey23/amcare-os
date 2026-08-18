"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AssistChatShell } from "@/components/siya/AssistChatShell";
import { MyDayTasksPanel } from "@/components/tasks/MyDayTasksPanel";
import { SopLeadMyDayCard } from "@/components/sops/SopLeadMyDayCard";
import { LeadKnowledgeGapsCard } from "@/components/ops/LeadKnowledgeGapsCard";
import { WeeklyCheckInCard } from "@/components/ops/WeeklyCheckInCard";
import { portalBtnGhostSm, portalSectionCompact } from "@/lib/portal-ui";

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

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1">
        <AssistChatShell
          firstName={firstName}
          focusMode={inFocus || focusFromUrl}
          initialQuery={initialQuery}
        />
      </div>

      {!onBreak ? (
        <div className={`mt-3 ${portalSectionCompact}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[var(--siya-text-muted)]">
              Today&apos;s checklist &amp; lead queues — optional, under Assist.
            </p>
            <button type="button" className={portalBtnGhostSm} onClick={() => setShowToday((v) => !v)}>
              {showToday ? "Hide today" : "Today’s checklist"}
            </button>
          </div>
          {showToday ? (
            <div className="mt-3 space-y-3">
              {!inFocus ? <MyDayTasksPanel /> : null}
              <SopLeadMyDayCard />
              <LeadKnowledgeGapsCard />
              {!inFocus ? <WeeklyCheckInCard /> : null}
              <p className="text-[11px] text-[var(--siya-text-muted)]">
                HIPAA certification lives under{" "}
                <Link href="/training" className="font-semibold text-[var(--siya-accent)] hover:underline">
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
