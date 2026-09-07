"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMyOpenKnowledgeGaps,
  resolveKnowledgeGap,
  type AssistGapRecord,
} from "@/lib/assist-gaps-api";
import { CappedStack, ListOverflowBox } from "@/components/ops/CappedStack";
import { summarizeHiddenLabels } from "@/lib/portal-list-cap";
import {
  portalBtnGhostSm,
  portalH3,
  portalSectionCompact,
  portalStatusErrorText,
  portalStatusSuccessText,
} from "@/lib/portal-ui";

type Props = { className?: string };

type GapCluster = {
  key: string;
  department: string;
  title: string;
  count: number;
  latestAt: string;
  phiRedacted: boolean;
  ids: string[];
  hasQuestion: boolean;
};

function clusterOpenGaps(gaps: AssistGapRecord[]): GapCluster[] {
  const map = new Map<string, GapCluster>();
  for (const g of gaps) {
    const hint = g.topicHint?.trim() || "";
    const title = (hint || g.taskLabel?.trim() || "Missing approved policy").slice(0, 200);
    const key = `${g.departmentSlug || g.department}::${title.toLowerCase()}`;
    const cur = map.get(key);
    if (!cur) {
      map.set(key, {
        key,
        department: g.department,
        title,
        count: 1,
        latestAt: g.createdAt,
        phiRedacted: g.phiRedacted,
        ids: [g.id],
        hasQuestion: Boolean(hint),
      });
      continue;
    }
    cur.count += 1;
    cur.ids.push(g.id);
    if (g.createdAt > cur.latestAt) cur.latestAt = g.createdAt;
    if (g.phiRedacted) cur.phiRedacted = true;
    if (hint) cur.hasQuestion = true;
  }
  return [...map.values()].sort(
    (a, b) =>
      Number(b.hasQuestion) - Number(a.hasQuestion) ||
      b.count - a.count ||
      b.latestAt.localeCompare(a.latestAt) ||
      a.title.localeCompare(b.title),
  );
}

/**
 * Lead/admin open knowledge gaps — question clusters first; router-label noise capped.
 */
export function LeadKnowledgeGapsCard({ className = "" }: Props) {
  const { authReady, user } = useAuth();
  const [gaps, setGaps] = useState<AssistGapRecord[]>([]);
  const [honestyNote, setHonestyNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const clusters = useMemo(() => clusterOpenGaps(gaps), [gaps]);
  const questionClusters = useMemo(() => clusters.filter((c) => c.hasQuestion), [clusters]);
  const labelBacklog = useMemo(() => clusters.filter((c) => !c.hasQuestion), [clusters]);

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
  if (user.role !== "admin") return null;
  if (!loading && gaps.length === 0 && !error) return null;

  async function onResolveCluster(cluster: GapCluster) {
    setPendingKey(cluster.key);
    setError(null);
    setNotice(null);
    try {
      for (const id of cluster.ids) {
        await resolveKnowledgeGap(id);
      }
      setNotice(
        cluster.count > 1
          ? `Marked ${cluster.count} matching gaps handled.`
          : "Marked handled.",
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not resolve");
    } finally {
      setPendingKey(null);
    }
  }

  async function clearLabelBacklog() {
    setPendingKey("__backlog__");
    setError(null);
    setNotice(null);
    try {
      let ok = 0;
      for (const c of labelBacklog) {
        for (const id of c.ids) {
          try {
            await resolveKnowledgeGap(id);
            ok += 1;
          } catch {
            /* continue */
          }
        }
      }
      setNotice(`Cleared ${ok} old label rows.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not clear");
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <section className={`${portalSectionCompact} ${className}`} aria-label="Open knowledge gaps">
      <h2 className={portalH3}>Open knowledge gaps</h2>
      <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
        {honestyNote ||
          "Shows PHI-safe Ask wording when we have it. Old router labels are a separate backlog."}
      </p>
      {!loading && gaps.length > 0 ? (
        <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">
          {questionClusters.length} with wording · {labelBacklog.length} old labels · {gaps.length} open
          rows
        </p>
      ) : null}

      {error ? <p className={`mt-2 text-xs ${portalStatusErrorText}`}>{error}</p> : null}
      {notice ? <p className={`mt-2 text-xs ${portalStatusSuccessText}`}>{notice}</p> : null}

      {loading ? (
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">Loading…</p>
      ) : (
        <div className="mt-3 space-y-4">
          {questionClusters.length === 0 ? (
            <p className="text-sm text-[var(--siya-text-muted)]">
              No open gaps with saved question wording yet. New Notify owner clicks will show the Ask here.
            </p>
          ) : (
            <CappedStack
              items={questionClusters}
              renderItem={(c) => (
                <div
                  key={c.key}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[var(--siya-primary)]">
                      {c.department}
                      {c.count > 1 ? (
                        <span className="ml-2 font-semibold tabular-nums text-[var(--siya-accent)]">
                          ×{c.count}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-[var(--siya-text-secondary)]">“{c.title}”</p>
                    <p className="mt-0.5 text-[10px] text-[var(--siya-text-muted)]">
                      Latest {c.latestAt.slice(0, 10)}
                      {c.phiRedacted ? " · some PHI-safe" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={portalBtnGhostSm}
                    disabled={pendingKey === c.key}
                    onClick={() => void onResolveCluster(c)}
                  >
                    {pendingKey === c.key ? "…" : c.count > 1 ? "Mark all handled" : "Mark handled"}
                  </button>
                </div>
              )}
              renderOverflow={({ hiddenCount, hidden }) => {
                const { topLabels, extraLabelKinds } = summarizeHiddenLabels(
                  hidden.map((h) => `${h.department} · ${h.title}`),
                );
                return (
                  <ListOverflowBox
                    title={`+${hiddenCount} more questions`}
                    detail={`${topLabels.join(" · ")}${
                      extraLabelKinds > 0 ? ` · +${extraLabelKinds} other` : ""
                    }`}
                    action={
                      <Link
                        href="/ops"
                        className="text-xs font-semibold text-[var(--siya-accent)] hover:underline"
                      >
                        Same questions on Ops →
                      </Link>
                    }
                  />
                );
              }}
            />
          )}

          {labelBacklog.length > 0 ? (
            <ListOverflowBox
              title={`Old label backlog · ${labelBacklog.reduce((n, c) => n + c.count, 0)} rows`}
              detail={
                summarizeHiddenLabels(
                  labelBacklog.map((c) => `${c.department} · ${c.title} ×${c.count}`),
                  4,
                ).topLabels.join(" · ") + " — not real question text."
              }
              action={
                <button
                  type="button"
                  className={portalBtnGhostSm}
                  disabled={pendingKey === "__backlog__"}
                  onClick={() => void clearLabelBacklog()}
                >
                  {pendingKey === "__backlog__" ? "Clearing…" : "Clear old labels"}
                </button>
              }
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
