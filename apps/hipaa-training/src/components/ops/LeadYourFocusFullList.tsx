"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { fetchMySopOwnership, fetchSops } from "@/lib/sop-api";
import { fetchMyOpenKnowledgeGaps } from "@/lib/assist-gaps-api";
import {
  buildLeadFocusItems,
  isClinicalOpsLead,
  type LeadFocusItem,
} from "@/lib/lead-your-focus";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import {
  portalH1,
  portalPage,
  portalSectionCompact,
  portalStatusErrorText,
} from "@/lib/portal-ui";

/**
 * Full Clinical lead Your Focus list (gaps + pending SOPs, oldest first).
 */
export function LeadYourFocusFullList() {
  const { authReady, user } = useAuth();
  const [eligible, setEligible] = useState(false);
  const [items, setItems] = useState<LeadFocusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authReady || !user || !isPortalAuthEnabled()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const depts = await fetchMySopOwnership();
      if (!isClinicalOpsLead(depts)) {
        setEligible(false);
        setItems([]);
        return;
      }
      setEligible(true);
      const [gapData, sops] = await Promise.all([
        fetchMyOpenKnowledgeGaps(),
        fetchSops({ department: "Clinical Operations", status: "pending_review" }),
      ]);
      setItems(buildLeadFocusItems({ gaps: gapData.gaps, sops }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load list");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [authReady, user]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!authReady) {
    return (
      <div className={portalPage}>
        <p className="text-sm text-[var(--siya-text-muted)]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={portalPage}>
        <h1 className={portalH1}>Your Focus</h1>
        <p className="mt-2 text-sm text-[var(--siya-text-muted)]">Sign in to see your Clinical Operations inbox.</p>
      </div>
    );
  }

  if (!loading && !eligible) {
    return (
      <div className={portalPage}>
        <h1 className={portalH1}>Your Focus</h1>
        <p className="mt-2 text-sm text-[var(--siya-text-muted)]">
          This inbox is for the <strong>Clinical Operations</strong> lead. Open{" "}
          <PortalNavLink href="/" className="font-semibold text-[var(--siya-accent)] hover:underline">
            My day
          </PortalNavLink>{" "}
          for your usual work.
        </p>
      </div>
    );
  }

  return (
    <div className={portalPage}>
      <header>
        <p className="text-xs font-medium text-[var(--siya-text-muted)]">
          <PortalNavLink href="/" className="hover:underline">
            ← My day
          </PortalNavLink>
        </p>
        <h1 className={`${portalH1} mt-2`}>Your Focus</h1>
        <p className="mt-1 text-sm text-[var(--siya-text-muted)]">
          All open Clinical Operations knowledge gaps and SOPs in pending review — oldest first.
        </p>
      </header>

      {error ? <p className={`mt-4 text-sm ${portalStatusErrorText}`}>{error}</p> : null}

      {loading ? (
        <p className="mt-4 text-sm text-[var(--siya-text-muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className={`mt-4 ${portalSectionCompact} text-sm text-[var(--siya-text-secondary)]`}>
          You&apos;re clear — nothing waiting right now.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((item, i) => (
            <li key={item.id}>
              <PortalNavLink
                href={item.href}
                className={`${portalSectionCompact} flex flex-col hover:border-[var(--siya-accent)]/40`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
                  #{i + 1} · {item.kind === "gap" ? "Knowledge gap" : "SOP review"}
                </span>
                <span className="text-sm font-semibold text-[var(--siya-primary)]">{item.title}</span>
                <span className="text-[11px] text-[var(--siya-text-muted)]">{item.subtitle}</span>
              </PortalNavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
