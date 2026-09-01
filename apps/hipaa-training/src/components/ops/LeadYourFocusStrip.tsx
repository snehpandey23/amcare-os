"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { fetchMySopOwnership, fetchSops } from "@/lib/sop-api";
import { fetchMyOpenKnowledgeGaps } from "@/lib/assist-gaps-api";
import {
  buildLeadFocusItems,
  capLeadFocusItems,
  isClinicalOpsLead,
  YOUR_FOCUS_CAP,
  type LeadFocusItem,
} from "@/lib/lead-your-focus";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalH3, portalSectionCompact, portalStatusErrorText } from "@/lib/portal-ui";

type Props = {
  className?: string;
  /** When true, always render for clinical lead even if inbox is empty. */
  showWhenEmpty?: boolean;
};

/**
 * Phase 1 — Clinical lead "Your Focus" (Your 5).
 * Open Clinical Ops gaps + pending_review SOPs, oldest first, hard cap 5.
 */
export function LeadYourFocusStrip({ className = "", showWhenEmpty = true }: Props) {
  const { authReady, user } = useAuth();
  const [eligible, setEligible] = useState(false);
  const [items, setItems] = useState<LeadFocusItem[]>([]);
  const [moreCount, setMoreCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authReady || !user || !isPortalAuthEnabled()) {
      setLoading(false);
      setEligible(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const depts = await fetchMySopOwnership();
      if (!isClinicalOpsLead(depts)) {
        setEligible(false);
        setItems([]);
        setMoreCount(0);
        return;
      }
      setEligible(true);
      const [gapData, sops] = await Promise.all([
        fetchMyOpenKnowledgeGaps(),
        fetchSops({ department: "Clinical Operations", status: "pending_review" }),
      ]);
      const built = buildLeadFocusItems({ gaps: gapData.gaps, sops });
      const { preview, moreCount: more } = capLeadFocusItems(built, YOUR_FOCUS_CAP);
      setItems(preview);
      setMoreCount(more);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load Your Focus");
      setItems([]);
      setMoreCount(0);
    } finally {
      setLoading(false);
    }
  }, [authReady, user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!authReady || !user) return null;
  if (loading && !eligible) {
    // Avoid flash for non-leads: wait until ownership check finishes.
    return null;
  }
  if (!eligible) return null;
  if (!showWhenEmpty && !loading && items.length === 0 && !error) return null;

  return (
    <section
      className={`${portalSectionCompact} ${className}`}
      aria-label="Your Focus"
      data-testid="lead-your-focus"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className={portalH3}>Your Focus</h2>
          <p className="mt-0.5 text-[11px] text-[var(--siya-text-muted)]">
            Up to {YOUR_FOCUS_CAP} Clinical Operations items — oldest first. Gaps + SOPs waiting on review.
          </p>
        </div>
        <PortalNavLink
          href="/lead/your-focus"
          className="text-xs font-semibold text-[var(--siya-accent)] hover:underline"
        >
          Full list →
        </PortalNavLink>
      </div>

      {error ? <p className={`mt-2 text-xs ${portalStatusErrorText}`}>{error}</p> : null}

      {loading ? (
        <p className="mt-2 text-xs text-[var(--siya-text-muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-2 text-xs text-[var(--siya-text-secondary)]">
          You&apos;re clear — no open Clinical gaps or SOPs waiting on review.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.id}>
              <PortalNavLink
                href={item.href}
                className="flex flex-col rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2 hover:border-[var(--siya-accent)]/40 hover:bg-[var(--siya-white)]"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
                  {item.kind === "gap" ? "Knowledge gap" : "SOP review"}
                </span>
                <span className="text-sm font-medium text-[var(--siya-primary)]">{item.title}</span>
                <span className="text-[10px] text-[var(--siya-text-muted)]">{item.subtitle}</span>
              </PortalNavLink>
            </li>
          ))}
        </ul>
      )}

      {moreCount > 0 ? (
        <PortalNavLink
          href="/lead/your-focus"
          className="mt-3 inline-block text-xs font-semibold text-[var(--siya-accent)] hover:underline"
          data-testid="lead-your-focus-more"
        >
          +{moreCount} more
        </PortalNavLink>
      ) : null}
    </section>
  );
}

/** Hook for other surfaces that need to know if clinical Your Focus is active. */
export function useIsClinicalYourFocusLead(): boolean | null {
  const { authReady, user } = useAuth();
  const [eligible, setEligible] = useState<boolean | null>(null);
  useEffect(() => {
    if (!authReady || !user || !isPortalAuthEnabled()) {
      setEligible(false);
      return;
    }
    let cancelled = false;
    void fetchMySopOwnership()
      .then((depts) => {
        if (!cancelled) setEligible(isClinicalOpsLead(depts));
      })
      .catch(() => {
        if (!cancelled) setEligible(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, user]);
  return eligible;
}
