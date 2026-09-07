"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  fetchEomMonthStatus,
  submitEomNomination,
  type EomMonthStatus,
} from "@/lib/eom-nominations-api";
import {
  portalBtnAccent,
  portalH3,
  portalInput,
  portalSection,
  portalStatusErrorText,
  portalStatusSuccessText,
} from "@/lib/portal-ui";

function displayName(p: { name: string | null; email: string }) {
  return p.name?.trim() || p.email;
}

export function EomNominationSection() {
  const [status, setStatus] = useState<EomMonthStatus | null>(null);
  const [nomineeUserId, setNomineeUserId] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await fetchEomMonthStatus();
      setStatus(s);
      if (!nomineeUserId && s.nominees[0]) {
        setNomineeUserId(s.nominees[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load nominations");
    } finally {
      setLoading(false);
    }
  }, [nomineeUserId]);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once on mount
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!nomineeUserId) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await submitEomNomination({ nomineeUserId, reason });
      setReason("");
      setNotice("Nomination saved — thank you.");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setPending(false);
    }
  }

  return (
    <section
      id="employee-of-the-month"
      className={portalSection}
      aria-labelledby="eom-heading"
    >
      <h2 id="eom-heading" className={portalH3}>
        Employee of the month
      </h2>
      <p className="mt-1 text-sm text-[var(--siya-text-secondary)]">
        Vote for a teammate — or yourself — and say why in plain words. Winner gets{" "}
        <strong className="text-[var(--siya-text)]">₹5,000</strong> as an Amazon voucher or preferred gift
        voucher.
      </p>
      {status ? (
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Voting for <strong>{status.monthLabel}</strong>
          {status.nudgeDay ? " · nudge day — don’t forget to nominate" : ""}.
        </p>
      ) : null}

      {loading ? <p className="mt-3 text-sm text-[var(--siya-text-muted)]">Loading…</p> : null}

      {!loading && status ? (
        <form className="mt-4 space-y-3" onSubmit={(e) => void onSubmit(e)}>
          <label className="block text-xs font-semibold text-[var(--siya-primary)]">
            Who are you nominating?
            <select
              className={`mt-1 ${portalInput}`}
              value={nomineeUserId}
              onChange={(e) => setNomineeUserId(e.target.value)}
              required
            >
              {status.nominees.map((p) => (
                <option key={p.id} value={p.id}>
                  {displayName(p)}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs font-semibold text-[var(--siya-primary)]">
            Why them?
            <textarea
              className={`mt-1 ${portalInput}`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="One concrete thing they did that helped patients, the team, or the month…"
              required
              minLength={20}
            />
          </label>

          {error ? <p className={`text-xs ${portalStatusErrorText}`}>{error}</p> : null}
          {notice ? <p className={`text-xs ${portalStatusSuccessText}`}>{notice}</p> : null}

          <button type="submit" className={portalBtnAccent} disabled={pending || !nomineeUserId}>
            {pending ? "Saving…" : "Submit nomination"}
          </button>
        </form>
      ) : null}

      {status && status.myNominations.length > 0 ? (
        <div className="mt-5 border-t border-[var(--siya-border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
            Your nominations this month
          </p>
          <ul className="mt-2 space-y-2">
            {status.myNominations.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2"
              >
                <p className="text-sm font-medium text-[var(--siya-primary)]">
                  {displayName({ name: n.nomineeName, email: n.nomineeEmail })}
                  {n.isSelf ? (
                    <span className="ml-2 text-[10px] font-semibold uppercase text-[var(--siya-text-muted)]">
                      You
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">{n.reason}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
