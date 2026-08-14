"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMyOpenKnowledgeGaps,
  resolveKnowledgeGap,
  type AssistGapRecord,
} from "@/lib/assist-gaps-api";
import {
  portalBtnGhostSm,
  portalH3,
  portalSectionCompact,
  portalStatusErrorText,
  portalStatusSuccessText,
} from "@/lib/portal-ui";

type Props = { className?: string };

/**
 * Lead-facing open knowledge gaps (Notify owner → weekly digest).
 * Category/task only — no Ask question text.
 */
export function LeadKnowledgeGapsCard({ className = "" }: Props) {
  const { authReady, user } = useAuth();
  const [gaps, setGaps] = useState<AssistGapRecord[]>([]);
  const [honestyNote, setHonestyNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authReady || !user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyOpenKnowledgeGaps();
      setGaps(data.gaps);
      setHonestyNote(data.honestyNote);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load gaps");
      setGaps([]);
    } finally {
      setLoading(false);
    }
  }, [authReady, user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!authReady || !user) return null;
  if (!loading && gaps.length === 0 && !error) return null;

  async function onResolve(id: string) {
    setPendingId(id);
    setError(null);
    setNotice(null);
    try {
      await resolveKnowledgeGap(id);
      setNotice("Marked handled.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <section className={`${portalSectionCompact} ${className}`} aria-label="Open knowledge gaps">
      <h2 className={portalH3}>Open knowledge gaps</h2>
      <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
        {honestyNote ||
          "Notify owner clicks for your departments — category and task only, not every unanswered Ask."}
      </p>

      {error ? <p className={`mt-2 text-xs ${portalStatusErrorText}`}>{error}</p> : null}
      {notice ? <p className={`mt-2 text-xs ${portalStatusSuccessText}`}>{notice}</p> : null}

      {loading ? (
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">Loading…</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {gaps.map((g) => (
            <li
              key={g.id}
              className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[var(--siya-primary)]">{g.department}</p>
                <p className="text-sm text-[var(--siya-text-secondary)]">
                  {g.taskLabel || "Missing approved policy"}
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--siya-text-muted)]">
                  {g.createdAt.slice(0, 10)}
                  {g.phiRedacted ? " · PHI-safe capture" : ""}
                </p>
              </div>
              <button
                type="button"
                className={portalBtnGhostSm}
                disabled={pendingId === g.id}
                onClick={() => void onResolve(g.id)}
              >
                {pendingId === g.id ? "…" : "Mark handled"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && gaps.length > 0 ? (
        <p className="mt-3 text-[10px] text-[var(--siya-text-muted)]">
          Weekly email digests use the same rows (category + task only — no question text).
        </p>
      ) : null}
    </section>
  );
}
