"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchShiftHandoffs, type ShiftHandoffRecord } from "@/lib/ops-coordination-api";

export function ShiftHandoffFeed({ compact = false }: { compact?: boolean }) {
  const [handoffs, setHandoffs] = useState<ShiftHandoffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setHandoffs(await fetchShiftHandoffs("today"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load handoffs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  if (loading && !handoffs.length) {
    return <p className="text-xs text-[var(--siya-text-muted)]">Loading handoffs…</p>;
  }

  if (error) return <p className="text-xs text-red-600">{error}</p>;

  const shown = compact ? handoffs.slice(0, 5) : handoffs;

  return (
    <section className="rounded-2xl border border-[var(--siya-border)] bg-white/90 p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Shift handoffs today</h2>
      <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
        Notes left when teammates ended shift — team-visible (IST ops day).
      </p>
      <ul className="mt-3 space-y-3">
        {shown.map((h) => (
          <li key={h.id} className="rounded-xl border border-[var(--siya-border)]/80 bg-[var(--siya-bg-subtle)]/30 p-3 text-sm">
            <p className="font-medium text-[var(--siya-primary)]">
              {h.userName || h.userEmail}
              <span className="ml-2 text-[10px] font-normal text-[var(--siya-text-muted)]">
                {new Date(h.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </p>
            {(h.chatsHandledCount != null || h.callsMadeCount != null || h.callsReceivedCount != null) ? (
              <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">
                {[
                  h.chatsHandledCount != null ? `Chats: ${h.chatsHandledCount}` : null,
                  h.callsMadeCount != null ? `Calls made: ${h.callsMadeCount}` : null,
                  h.callsReceivedCount != null ? `Calls received: ${h.callsReceivedCount}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
            {h.pendingFollowups.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs">
                {h.pendingFollowups.map((f, i) => (
                  <li key={i}>
                    <strong>{f.patientIdentifier || "Follow-up"}:</strong> {f.note || "—"}
                  </li>
                ))}
              </ul>
            ) : null}
            {h.scheduledItemsToday ? (
              <p className="mt-2 text-xs">
                <span className="font-semibold">Scheduled:</span> {h.scheduledItemsToday}
              </p>
            ) : null}
            {h.generalNotes ? (
              <p className="mt-2 text-xs text-[var(--siya-text-secondary)]">{h.generalNotes}</p>
            ) : null}
          </li>
        ))}
        {!shown.length ? (
          <li className="text-xs text-[var(--siya-text-muted)]">No handoffs yet today.</li>
        ) : null}
      </ul>
      {compact && handoffs.length > 5 ? (
        <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">+{handoffs.length - 5} more on Team page</p>
      ) : null}
    </section>
  );
}
