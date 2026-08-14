"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchWeeklyCheckInAccess,
  submitWeeklyCheckIn,
} from "@/lib/ops-coordination-api";
import {
  portalBtnAccentSm,
  portalBtnGhostSm,
  portalH3,
  portalInput,
  portalSectionCompact,
  portalStatusErrorText,
  portalStatusSuccessText,
} from "@/lib/portal-ui";

type Props = { className?: string };

/**
 * Structured weekly check-in for Marketing / Clinical Operations / Compliance leads.
 * Same ops-coordination infrastructure as shift handoffs; surfaces on Team feed.
 */
export function WeeklyCheckInCard({ className = "" }: Props) {
  const { authReady, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [canSubmit, setCanSubmit] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [weekStart, setWeekStart] = useState("");
  const [department, setDepartment] = useState("");
  const [whatChanged, setWhatChanged] = useState("");
  const [keyNumbersStatus, setKeyNumbersStatus] = useState("");
  const [blockers, setBlockers] = useState("");
  const [founderShouldKnow, setFounderShouldKnow] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAccess = useCallback(async () => {
    if (!authReady || !user) return;
    try {
      const access = await fetchWeeklyCheckInAccess();
      setCanSubmit(access.canSubmit);
      setDepartments(access.departments);
      setWeekStart(access.weekStart);
      if (access.departments.length && !department) {
        setDepartment(access.departments[0]!);
      }
    } catch {
      setCanSubmit(false);
    }
  }, [authReady, user, department]);

  useEffect(() => {
    void loadAccess();
  }, [loadAccess]);

  if (!authReady || !user || !canSubmit) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(null);
    try {
      await submitWeeklyCheckIn({
        department,
        weekStart: weekStart || undefined,
        whatChanged,
        keyNumbersStatus,
        blockers,
        founderShouldKnow,
      });
      setSuccess("Weekly check-in saved — visible on Team.");
      setWhatChanged("");
      setKeyNumbersStatus("");
      setBlockers("");
      setFounderShouldKnow("");
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save check-in");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={`${portalSectionCompact} ${className}`} aria-label="Weekly lead check-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={portalH3}>Weekly lead check-in</h2>
          <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
            Week of {weekStart || "—"} · Marketing / Clinical / Compliance
          </p>
        </div>
        {!open ? (
          <button type="button" className={portalBtnAccentSm} onClick={() => setOpen(true)}>
            File this week
          </button>
        ) : (
          <button type="button" className={portalBtnGhostSm} onClick={() => setOpen(false)}>
            Cancel
          </button>
        )}
      </div>
      {success ? <p className={`mt-2 text-xs ${portalStatusSuccessText}`}>{success}</p> : null}
      {error ? <p className={`mt-2 text-xs ${portalStatusErrorText}`}>{error}</p> : null}
      {open ? (
        <form className="mt-3 space-y-3" onSubmit={(e) => void onSubmit(e)}>
          {departments.length > 1 ? (
            <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
              Department
              <select
                className={`${portalInput} mt-1`}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-xs text-[var(--siya-text-secondary)]">Department: {department}</p>
          )}
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            What changed this week
            <textarea
              className={`${portalInput} mt-1 min-h-[4rem]`}
              value={whatChanged}
              onChange={(e) => setWhatChanged(e.target.value)}
              required
              maxLength={4000}
            />
          </label>
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            Key numbers / status
            <textarea
              className={`${portalInput} mt-1 min-h-[3.5rem]`}
              value={keyNumbersStatus}
              onChange={(e) => setKeyNumbersStatus(e.target.value)}
              required
              maxLength={4000}
            />
          </label>
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            Anything blocking
            <textarea
              className={`${portalInput} mt-1 min-h-[3rem]`}
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              maxLength={4000}
              placeholder="Optional"
            />
          </label>
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            Anything the founder should know
            <textarea
              className={`${portalInput} mt-1 min-h-[3rem]`}
              value={founderShouldKnow}
              onChange={(e) => setFounderShouldKnow(e.target.value)}
              maxLength={4000}
              placeholder="Optional"
            />
          </label>
          <button type="submit" disabled={pending} className={portalBtnAccentSm}>
            {pending ? "Saving…" : "Submit check-in"}
          </button>
        </form>
      ) : null}
    </section>
  );
}
