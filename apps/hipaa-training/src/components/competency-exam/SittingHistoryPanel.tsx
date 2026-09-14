"use client";

import { useCallback, useEffect, useState } from "react";
import { LIVE_SECTION_ORDER, SECTION_LABEL } from "@/lib/competency-exam/weights";
import type { ExamSectionId } from "@/lib/competency-exam/types";
import {
  fetchAdminSittingHistory,
  fetchMySittingHistory,
  type SittingHistoryRow,
  type SittingTrendRow,
} from "@/lib/competency-exam/sitting-api";
import {
  portalDenseTableXs,
  portalDenseTableWrap,
  portalTableRowParity,
  portalTableTh,
} from "@/lib/portal-ui";

function fmtDelta(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n > 0) return `+${n}`;
  return String(n);
}

function SectionBreakdown({ row }: { row: SittingHistoryRow }) {
  const sections = row.composite?.sections ?? row.sectionAggregates;
  return (
    <ul className="mt-2 space-y-1 text-xs text-[var(--siya-text)]">
      {LIVE_SECTION_ORDER.map((id) => {
        const agg = sections[id] ?? row.sectionAggregates[id];
        if (!agg || agg.status !== "attempted") {
          return (
            <li key={id}>
              <span className="text-[var(--siya-text-secondary)]">{SECTION_LABEL[id]}:</span> incomplete
            </li>
          );
        }
        return (
          <li key={id}>
            <span className="font-medium">{SECTION_LABEL[id]}:</span> avg {agg.averageScore}
            {agg.attemptCount != null ? ` · ${agg.attemptCount} attempt${agg.attemptCount === 1 ? "" : "s"}` : ""}
            {agg.totalActiveSec != null && agg.totalActiveSec > 0
              ? ` · ${Math.round(agg.totalActiveSec)}s active`
              : ""}
          </li>
        );
      })}
    </ul>
  );
}

function TrendTable({ trends }: { trends: SittingTrendRow[] }) {
  if (trends.length < 2) {
    return (
      <p className="text-xs text-[var(--siya-text-secondary)]">
        Month-over-month trend appears after two sittings with scores.
      </p>
    );
  }
  return (
    <div className={portalDenseTableWrap} data-sitting-trend="true">
      <table className={`${portalDenseTableXs} min-w-[28rem]`}>
        <thead>
          <tr>
            <th className={portalTableTh}>Sitting</th>
            <th className={portalTableTh}>Composite</th>
            {LIVE_SECTION_ORDER.map((id) => (
              <th key={id} className={portalTableTh}>
                {SECTION_LABEL[id]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trends.map((t, rowIndex) => (
            <tr key={t.sittingId} data-row-parity={portalTableRowParity(rowIndex)}>
              <td className="px-2 py-1.5 font-medium text-[var(--siya-primary)]">{t.label}</td>
              <td className="px-2 py-1.5">
                {t.pointsEarned != null ? `${t.pointsEarned}/100` : "—"}
                {t.pointsDelta != null ? (
                  <span className="ml-1 text-[var(--siya-text-secondary)]">({fmtDelta(t.pointsDelta)})</span>
                ) : null}
              </td>
              {LIVE_SECTION_ORDER.map((id) => {
                const s = t.sections[id as ExamSectionId];
                if (!s || s.averageScore == null) {
                  return (
                    <td key={id} className="px-2 py-1.5 text-[var(--siya-text-secondary)]">
                      —
                    </td>
                  );
                }
                return (
                  <td key={id} className="px-2 py-1.5">
                    {s.previousAverage != null ? (
                      <>
                        {s.previousAverage} → {s.averageScore}{" "}
                        <span className="text-[var(--siya-text-secondary)]">({fmtDelta(s.delta)})</span>
                      </>
                    ) : (
                      <>{s.averageScore}</>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HistoryList({
  sittings,
  trends,
  showPerson,
  showTrends,
}: {
  sittings: SittingHistoryRow[];
  trends: SittingTrendRow[];
  showPerson?: boolean;
  showTrends?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!sittings.length) {
    return <p className="text-xs text-[var(--siya-text-secondary)]">No sittings recorded yet.</p>;
  }
  return (
    <div className="space-y-3">
      {showTrends !== false ? <TrendTable trends={trends} /> : null}
      <ul className="space-y-2" data-sitting-history="true">
        {sittings.map((row) => {
          const key = `${row.userId ?? ""}:${row.sittingId}`;
          const open = openId === key;
          const score = row.composite.pointsEarned;
          const incomplete = row.composite.incompleteSectionIds ?? [];
          return (
            <li key={key} className="rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-3">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setOpenId(open ? null : key)}
                data-sitting-history-row={row.sittingId}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold text-[var(--siya-primary)]">
                    {showPerson ? (
                      <>
                        {row.userName || row.userEmail || row.userId} · {row.label}
                      </>
                    ) : (
                      row.label
                    )}
                  </p>
                  <p className="text-xs uppercase text-[var(--siya-text-secondary)]">
                    {row.status} · {score}/100
                  </p>
                </div>
                {incomplete.length ? (
                  <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">
                    Incomplete: {incomplete.map((id) => SECTION_LABEL[id]).join(", ")}. Not scored as zero.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">All sections attempted.</p>
                )}
              </button>
              {open ? <SectionBreakdown row={row} /> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Staff: past closed + open sittings with MoM trend. */
export function SittingHistoryPanel() {
  const [sittings, setSittings] = useState<SittingHistoryRow[]>([]);
  const [trends, setTrends] = useState<SittingTrendRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchMySittingHistory();
    if (!data) {
      setError("Could not load sitting history.");
      setSittings([]);
      setTrends([]);
    } else {
      setSittings(data.sittings);
      setTrends(data.trends);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <section className="mt-6 space-y-2" data-sitting-history-panel="staff">
      <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Sitting history & trend</h2>
      <p className="text-xs text-[var(--siya-text-secondary)]">
        Closed sittings lock their composite. Month-over-month change uses real closed scores — not employment decisions.
      </p>
      {loading ? <p className="text-xs text-[var(--siya-text-secondary)]">Loading history…</p> : null}
      {error ? <p className="text-xs text-[var(--siya-status-error-text)]">{error}</p> : null}
      {!loading && !error ? <HistoryList sittings={sittings} trends={trends} /> : null}
    </section>
  );
}

/** Admin/Ops: same transparency across staff. */
export function SittingHistoryAdminPanel() {
  const [sittings, setSittings] = useState<SittingHistoryRow[]>([]);
  const [trends, setTrends] = useState<SittingTrendRow[]>([]);
  const [filterUserId, setFilterUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await fetchAdminSittingHistory({
      userId: filterUserId.trim() || undefined,
    });
    if (!data) {
      setError("Could not load admin sitting history (admin required).");
      setSittings([]);
      setTrends([]);
    } else {
      setSittings(data.sittings);
      setTrends(data.trends);
    }
    setLoading(false);
  }, [filterUserId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <section className="mt-6 space-y-2" data-sitting-history-panel="admin">
      <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Competency sittings (Ops)</h2>
      <p className="text-xs text-[var(--siya-text-secondary)]">
        Server history across staff. Filter by user id (uuid) to unlock month-over-month trend for that person.
        Closed composites are locked.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          value={filterUserId}
          onChange={(e) => setFilterUserId(e.target.value)}
          placeholder="Optional user uuid filter"
          className="min-w-[16rem] flex-1 rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={() => void reload()}
          className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-xs font-semibold"
        >
          Refresh
        </button>
      </div>
      {loading ? <p className="text-xs text-[var(--siya-text-secondary)]">Loading…</p> : null}
      {error ? <p className="text-xs text-[var(--siya-status-error-text)]">{error}</p> : null}
      {!loading && !error ? (
        <HistoryList
          sittings={sittings}
          trends={trends}
          showPerson
          showTrends={Boolean(filterUserId.trim())}
        />
      ) : null}
    </section>
  );
}
