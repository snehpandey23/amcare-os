"use client";

import { useMemo, useState } from "react";
import { useShiftOptional } from "@/context/ShiftContext";
import { isPortalLoginRequired } from "@/lib/trainingConfig";
import type { PresenceStatus } from "@/lib/shift-api";
import { PRESENCE_LABEL } from "@/lib/shift-presence";
import { buildShiftDaySummary } from "@/lib/shift-day-summary";
import { loadLocalPortalProfile, shouldShowTrainingNudge } from "@/lib/portal-profile";
import { suggestLearningPicks } from "@/lib/my-day";
import { EndShiftModal } from "@/components/shift/EndShiftModal";
import { ShiftHandoffModal } from "@/components/ops/ShiftHandoffModal";

function btnClass(extra?: string) {
  return `shrink-0 rounded-md px-1.5 py-1 text-[11px] text-[var(--siya-text-muted)] hover:text-[var(--siya-text)] disabled:opacity-40 ${extra ?? ""}`;
}

export function ShiftPresenceBar({ onEndShift }: { onEndShift?: () => void }) {
  const shift = useShiftOptional();
  const [endOpen, setEndOpen] = useState(false);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [shiftEndEventId, setShiftEndEventId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const summary = useMemo(() => {
    if (!shift?.state?.active) return null;
    return buildShiftDaySummary({
      shiftStartedAt: shift.state.active.startedAt,
      presenceLog: shift.state.active.presenceLog,
    });
  }, [shift?.state?.active]);

  const profile = loadLocalPortalProfile();
  const endLearningPicks = useMemo(() => suggestLearningPicks(profile), [profile]);
  const showEndTrainingNudge = shouldShowTrainingNudge(profile, "end");

  if (!isPortalLoginRequired() || !shift?.shiftReady) return null;

  const { presence, setPresence, endShift, onShift, startShift } = shift;

  if (!onShift) {
    return (
      <button
        type="button"
        className="shrink-0 rounded-md px-2 py-1 text-[11px] text-[var(--siya-text-muted)] hover:bg-[var(--siya-white)] hover:text-[var(--siya-text)]"
        onClick={() => void startShift("morning")}
      >
        Start shift
      </button>
    );
  }

  async function go(status: PresenceStatus) {
    if (status === presence) return;
    setPending(true);
    try {
      await setPresence(status);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex max-w-none flex-nowrap items-center justify-end gap-0.5">
        <span
          className="shrink-0 px-1.5 text-[11px] text-[var(--siya-text-muted)]"
          title="Self-declared — not detected from keyboard or mouse"
        >
          {PRESENCE_LABEL[presence]}
        </span>
        {presence === "working" ? (
          <>
            <button type="button" disabled={pending} className={btnClass()} onClick={() => void go("break")}>
              Break
            </button>
            <button type="button" disabled={pending} className={btnClass()} onClick={() => void go("focus")}>
              Focus
            </button>
          </>
        ) : (
          <button type="button" disabled={pending} className={btnClass("font-semibold")} onClick={() => void go("working")}>
            Back to working
          </button>
        )}
        <button type="button" className={btnClass()} onClick={() => setEndOpen(true)}>
          End shift
        </button>
      </div>
      <EndShiftModal
        open={endOpen}
        summary={summary}
        learningPicks={endLearningPicks}
        showLearningNudge={showEndTrainingNudge}
        onClose={() => setEndOpen(false)}
        onConfirm={async (payload) => {
          const result = await endShift(payload);
          setEndOpen(false);
          setShiftEndEventId(result.shiftEndEventId ?? null);
          setHandoffOpen(true);
          onEndShift?.();
        }}
      />
      <ShiftHandoffModal
        open={handoffOpen}
        shiftEndEventId={shiftEndEventId}
        onClose={() => {
          setHandoffOpen(false);
          setShiftEndEventId(null);
        }}
      />
    </>
  );
}

/** Off shift — for admin display labels only */
export function offShiftLabel() {
  return "⚫ Off shift";
}
