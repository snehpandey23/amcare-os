"use client";

import { useEffect, useState } from "react";
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import { PlannedVsActualPanel, type PlannedVsActualRow } from "@/components/shift/PlannedVsActualPanel";

/** My day — own scheduled vs actual only (same component + API scope=me as ops uses for a person). */
export function MyDayPlannedVsActual() {
  const [rows, setRows] = useState<PlannedVsActualRow[] | null>(null);
  const [rosterDate, setRosterDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const base = getTrainingApiUrl();
        const token = getStoredToken();
        if (!base || !token) return;
        const res = await fetch(`${base}/api/shift-roster/planned?scope=me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json().catch(() => ({}))) as {
          rows?: PlannedVsActualRow[];
          rosterDate?: string;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error || "Could not load roster plan");
        if (cancelled) return;
        setRows(data.rows || []);
        setRosterDate(data.rosterDate || "");
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="mt-3 text-xs text-[var(--siya-text-muted)]">
        Planned shift check unavailable ({error}).
      </p>
    );
  }
  if (rows == null) return null;
  if (rows.length === 0) return null;

  return (
    <div className="mt-3">
      <PlannedVsActualPanel rows={rows} rosterDate={rosterDate} compact />
    </div>
  );
}
