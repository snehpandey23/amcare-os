"use client";

import { useMemo, useState } from "react";
import { useShiftOptional } from "@/context/ShiftContext";
import { isPortalLoginRequired } from "@/lib/trainingConfig";
import type { PresenceStatus } from "@/lib/shift-api";
import { PRESENCE_EMOJI, PRESENCE_LABEL } from "@/lib/shift-presence";
import { buildShiftDaySummary } from "@/lib/shift-day-summary";
import { EndShiftModal } from "@/components/shift/EndShiftModal";
import { ShiftHandoffModal } from "@/components/ops/ShiftHandoffModal";

function btnClass(extra?: string) {
  return `shrink-0 rounded-lg border border-[var(--siya-border)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-subtle)] ${extra ?? ""}`;
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

  if (!isPortalLoginRequired() || !shift?.shiftReady) return null;

  const { presence, setPresence, endShift, onShift, startShift } = shift;

  if (!onShift) {
    return (
      <button
        type="button"
        className="shrink-0 rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[var(--siya-primary-hover)]"
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

  const pill =
    presence === "working"
      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
      : presence === "break"
        ? "bg-amber-50 text-amber-900 ring-amber-200"
        : "bg-[var(--siya-status-info-bg)] text-[var(--siya-status-info-text)] ring-[var(--siya-status-info-border)]";

  return (
    <>
      <div className="flex max-w-none flex-nowrap items-center justify-end gap-1.5">
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${pill}`}
          title="Self-declared — not detected from keyboard or mouse"
        >
          {PRESENCE_EMOJI[presence]} {PRESENCE_LABEL[presence]}
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
        <button type="button" className={btnClass("text-[var(--siya-accent)]")} onClick={() => setEndOpen(true)}>
          End shift
        </button>
      </div>
      <EndShiftModal
        open={endOpen}
        summary={summary}
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
