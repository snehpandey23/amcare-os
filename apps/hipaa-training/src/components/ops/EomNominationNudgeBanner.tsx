"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  dismissEomNudgeForToday,
  fetchEomMonthStatus,
  isEomNudgeDayClient,
  isEomNudgeDismissedForToday,
} from "@/lib/eom-nominations-api";
import { portalBtnGhostSm, portalSectionSubtle } from "@/lib/portal-ui";

/**
 * Shows on the 20th and 25th (IST) until dismissed for that calendar day,
 * and only if the signed-in user has not nominated yet this month.
 */
export function EomNominationNudgeBanner({ compact }: { compact?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isEomNudgeDayClient() || isEomNudgeDismissedForToday()) {
      setShow(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const status = await fetchEomMonthStatus();
        if (!cancelled) setShow(!status.hasNominatedThisMonth);
      } catch {
        if (!cancelled) setShow(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={
        compact
          ? `${portalSectionSubtle} flex flex-wrap items-start justify-between gap-2`
          : "rounded-[var(--siya-radius-md)] border border-[var(--siya-accent)]/35 bg-[var(--siya-accent)]/5 px-4 py-3"
      }
      role="status"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--siya-primary)]">
          Employee of the month — have you nominated yet?
        </p>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Nominate yourself or a peer (with a short why). Winner gets{" "}
          <strong className="text-[var(--siya-text)]">₹5,000</strong> as an Amazon voucher or preferred gift
          voucher.
        </p>
        <Link
          href="/feedback#employee-of-the-month"
          className="mt-2 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline"
        >
          Nominate on Feedback →
        </Link>
      </div>
      <button
        type="button"
        className={portalBtnGhostSm}
        onClick={() => {
          dismissEomNudgeForToday();
          setShow(false);
        }}
      >
        Not now
      </button>
    </div>
  );
}
