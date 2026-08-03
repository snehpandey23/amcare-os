"use client";

import { useState } from "react";
import { submitShiftHandoff, type HandoffFollowup } from "@/lib/ops-coordination-api";
import { trainingLinkPrimaryClass } from "@/components/training/training-ui";

type Props = {
  open: boolean;
  shiftEndEventId?: string | null;
  onClose: () => void;
};

function emptyFollowup(): HandoffFollowup {
  return { patientIdentifier: "", note: "" };
}

export function ShiftHandoffModal({ open, shiftEndEventId, onClose }: Props) {
  const [followups, setFollowups] = useState<HandoffFollowup[]>([emptyFollowup()]);
  const [scheduled, setScheduled] = useState("");
  const [general, setGeneral] = useState("");
  const [chatCount, setChatCount] = useState("");
  const [callsMade, setCallsMade] = useState("");
  const [callsReceived, setCallsReceived] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setFollowups([emptyFollowup()]);
    setScheduled("");
    setGeneral("");
    setChatCount("");
    setCallsMade("");
    setCallsReceived("");
    setError(null);
    onClose();
  }

  if (!open) return null;

  function updateFollowup(i: number, patch: Partial<HandoffFollowup>) {
    setFollowups((prev) => prev.map((f, j) => (j === i ? { ...f, ...patch } : f)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await submitShiftHandoff({
        shiftEndEventId: shiftEndEventId ?? null,
        chatsHandledCount: chatCount.trim() ? Number(chatCount) : null,
        callsMadeCount: callsMade.trim() ? Number(callsMade) : null,
        callsReceivedCount: callsReceived.trim() ? Number(callsReceived) : null,
        pendingFollowups: followups,
        scheduledItemsToday: scheduled.trim() || undefined,
        generalNotes: general.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save handoff");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/40 p-4">
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <form
          onSubmit={onSubmit}
          className="my-auto w-full max-w-md max-h-[min(92dvh,calc(100%-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-[var(--siya-border)] bg-white p-5 shadow-xl"
        >
        <h2 className="text-lg font-semibold text-[var(--siya-primary)]">Shift handoff</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Quick note for whoever picks up next. Use IDs/initials only — no full patient names.
        </p>

        <label className="mt-4 block text-xs font-medium text-[var(--siya-text-muted)]">
          Chats handled (optional)
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={chatCount}
            onChange={(e) => setChatCount(e.target.value)}
          />
        </label>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            Calls made
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={callsMade}
              onChange={(e) => setCallsMade(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            Calls received
            <input
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={callsReceived}
              onChange={(e) => setCallsReceived(e.target.value)}
            />
          </label>
        </div>

        <div className="mt-3">
          <p className="text-xs font-medium text-[var(--siya-text-muted)]">Pending follow-ups</p>
          {followups.map((f, i) => (
            <div key={i} className="mt-2 space-y-1 rounded-lg border border-[var(--siya-border)]/80 p-2">
              <input
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="Patient ID / initials"
                value={f.patientIdentifier}
                onChange={(e) => updateFollowup(i, { patientIdentifier: e.target.value })}
              />
              <input
                className="w-full rounded border px-2 py-1 text-sm"
                placeholder="What they need"
                value={f.note}
                onChange={(e) => updateFollowup(i, { note: e.target.value })}
              />
            </div>
          ))}
          <button
            type="button"
            className="mt-1 text-xs font-semibold text-[var(--siya-accent)]"
            onClick={() => setFollowups((p) => [...p, emptyFollowup()])}
          >
            + Add follow-up
          </button>
        </div>

        <label className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
          Scheduled for later today
          <textarea
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={scheduled}
            onChange={(e) => setScheduled(e.target.value)}
          />
        </label>

        <label className="mt-3 block text-xs font-medium text-[var(--siya-text-muted)]">
          General note
          <textarea
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={general}
            onChange={(e) => setGeneral(e.target.value)}
          />
        </label>

        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
            {pending ? "Saving…" : "Save handoff"}
          </button>
          <button type="button" className="rounded-lg px-4 py-2 text-sm text-[var(--siya-text-muted)]" onClick={handleClose}>
            Skip
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
