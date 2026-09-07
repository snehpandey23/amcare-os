"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MemoryHub } from "@/components/memory/MemoryHub";
import { isPortalMemoryEnabled } from "@/lib/trainingConfig";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";

/**
 * Memory hub is admin-only in the nav. Non-admins are redirected to approved SOPs
 * (also linked from Learn) — no separate Memory pillar for all staff.
 */
export default function MemoryPage() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const enabled = isPortalMemoryEnabled();

  useEffect(() => {
    if (!enabled) {
      router.replace("/");
      return;
    }
    if (!authReady) return;
    if (!isPortalAdmin(user?.role)) {
      router.replace("/memory/knowledge/sops");
    }
  }, [enabled, authReady, user?.role, router]);

  if (!enabled) return null;
  if (!authReady) {
    return (
      <div className="p-6 text-sm text-[var(--siya-text-muted)]">Loading…</div>
    );
  }
  if (!isPortalAdmin(user?.role)) return null;
  return <MemoryHub />;
}
