"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { fetchMySopOwnership } from "@/lib/sop-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalBtnAccentSm, portalBtnGhostSm, portalNoticeLead } from "@/lib/portal-ui";

/** Shown only to the signed-in user when admin assigned them as a department SOP lead. */
export function MySopOwnershipNotice({ className = "" }: { className?: string }) {
  const { user, authReady } = useAuth();
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    if (!authReady || !user || !isPortalAuthEnabled()) return;
    let cancelled = false;
    void fetchMySopOwnership()
      .then((d) => {
        if (!cancelled) setDepartments(d);
      })
      .catch(() => {
        if (!cancelled) setDepartments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  if (!departments.length) return null;

  const label =
    departments.length === 1
      ? `You're currently responsible for: ${departments[0]} SOPs`
      : `You're currently responsible for: ${departments.join(", ")} SOPs`;

  return (
    <div className={`${portalNoticeLead} ${className}`}>
      <p className="font-semibold text-[var(--siya-primary)]">{label}</p>
      <p className="mt-1 text-[11px] text-[var(--siya-text-secondary)]">
        Draft and update procedures in the SOP workspace. Today&apos;s assigned checklists are on{" "}
        <PortalNavLink href="/" className="font-semibold underline">
          My day
        </PortalNavLink>
        .
      </p>
      <PortalNavLink href="/memory/knowledge/sops" className={`mt-2 inline-block ${portalBtnAccentSm}`}>
        Open SOP workspace
      </PortalNavLink>
      <PortalNavLink
        href="/memory/knowledge/sop-builder"
        className={`mt-2 ml-2 inline-block ${portalBtnGhostSm}`}
      >
        Build daily checklist (AI)
      </PortalNavLink>
    </div>
  );
}
