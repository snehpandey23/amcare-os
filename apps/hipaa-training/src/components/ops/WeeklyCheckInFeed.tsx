"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWeeklyCheckIns, type WeeklyLeadCheckInRecord } from "@/lib/ops-coordination-api";
import { portalH3, portalSectionCompact, portalStatusErrorText } from "@/lib/portal-ui";

function Field({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null;
  return (
    <p className="mt-1.5 text-xs text-[var(--siya-text-secondary)]">
      <span className="font-semibold text-[var(--siya-primary)]">{label}:</span> {value}
    </p>
  );
}

export function WeeklyCheckInFeed() {
  const [items, setItems] = useState<WeeklyLeadCheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setItems(await fetchWeeklyCheckIns("current"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load weekly check-ins");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  if (loading && !items.length) {
    return <p className="text-xs text-[var(--siya-text-muted)]">Loading weekly check-ins…</p>;
  }

  if (error) return <p className={`text-xs ${portalStatusErrorText}`}>{error}</p>;

  const weekLabel = items[0]?.weekStart;

  return (
    <section className={portalSectionCompact}>
      <h2 className={portalH3}>Weekly lead check-ins</h2>
      <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
        Marketing · Clinical Operations · Compliance — week of {weekLabel || "current"} (IST).
      </p>
      <ul className="mt-3 space-y-3">
        {items.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-[var(--siya-border)]/80 bg-[var(--siya-bg-subtle)]/30 p-3 text-sm"
          >
            <p className="font-medium text-[var(--siya-primary)]">
              {c.userName || c.userEmail}
              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-accent)]">
                {c.departmentLabel}
              </span>
              <span className="ml-2 text-[10px] font-normal text-[var(--siya-text-muted)]">
                {new Date(c.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
            <Field label="What changed" value={c.whatChanged} />
            <Field label="Key numbers / status" value={c.keyNumbersStatus} />
            <Field label="Blocking" value={c.blockers} />
            <Field label="Founder should know" value={c.founderShouldKnow} />
          </li>
        ))}
        {!items.length ? (
          <li className="text-xs text-[var(--siya-text-muted)]">No weekly check-ins yet for this week.</li>
        ) : null}
      </ul>
    </section>
  );
}
