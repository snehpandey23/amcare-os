"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { fetchMySopOwnership } from "@/lib/sop-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";

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
    <div
      className={`rounded-lg border border-violet-200/80 bg-violet-50/90 px-3 py-2.5 text-xs text-violet-950 ${className}`}
    >
      <p className="font-semibold">{label}</p>
      <p className="mt-1 text-[11px] text-violet-900/90">
        Draft and update procedures in the SOP workspace. Today&apos;s assigned checklists are on{" "}
        <PortalNavLink href="/" className="font-semibold underline">
          My day
        </PortalNavLink>
        .
      </p>
      <PortalNavLink
        href="/grow/sops"
        className="mt-2 inline-block rounded-lg bg-violet-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-violet-800"
      >
        Open SOP workspace
      </PortalNavLink>
    </div>
  );
}
