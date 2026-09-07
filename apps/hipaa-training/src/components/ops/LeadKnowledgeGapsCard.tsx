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
};

function clusterOpenGaps(gaps: AssistGapRecord[]): GapCluster[] {
  const map = new Map<string, GapCluster>();
  for (const g of gaps) {
    const title = (g.topicHint?.trim() || g.taskLabel?.trim() || "Missing approved policy").slice(0, 200);
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
      });
      continue;
    }
    cur.count += 1;
    cur.ids.push(g.id);
    if (g.createdAt > cur.latestAt) cur.latestAt = g.createdAt;
    if (g.phiRedacted) cur.phiRedacted = true;
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || b.latestAt.localeCompare(a.latestAt) || a.title.localeCompare(b.title),
  );
}

/**
 * Lead/admin open knowledge gaps — clustered + capped (max 5 rows, then overflow box).
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

  return (
    <section className={`${portalSectionCompact} ${className}`} aria-label="Open knowledge gaps">
      <h2 className={portalH3}>Open knowledge gaps</h2>
      <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
        {honestyNote ||
          "Notify owner / auto-gap signals — similar asks are grouped. Thumbs-down quality votes are omitted here."}
      </p>
      {!loading && gaps.length > 0 ? (
        <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">
          {gaps.length} open · {clusters.length} topic{clusters.length === 1 ? "" : "s"}
        </p>
      ) : null}

      {error ? <p className={`mt-2 text-xs ${portalStatusErrorText}`}>{error}</p> : null}
      {notice ? <p className={`mt-2 text-xs ${portalStatusSuccessText}`}>{notice}</p> : null}

      {loading ? (
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">Loading…</p>
      ) : (
        <div className="mt-3">
          <CappedStack
            items={clusters}
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
                  <p className="text-sm text-[var(--siya-text-secondary)]">{c.title}</p>
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
            renderOverflow={({ hiddenCount, hidden, total }) => {
              const { topLabels, extraLabelKinds } = summarizeHiddenLabels(
                hidden.map((h) => `${h.department} · ${h.title}`),
              );
              const hiddenRows = hidden.reduce((n, h) => n + h.count, 0);
              return (
                <ListOverflowBox
                  title={`+${hiddenCount} more topic${hiddenCount === 1 ? "" : "s"} (${hiddenRows} open)`}
                  detail={`${topLabels.join(" · ")}${
                    extraLabelKinds > 0 ? ` · +${extraLabelKinds} other` : ""
                  } · ${total} topics total`}
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
        </div>
      )}
    </section>
  );
}
