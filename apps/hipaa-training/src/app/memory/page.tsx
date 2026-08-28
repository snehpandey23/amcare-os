"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MemoryHub } from "@/components/memory/MemoryHub";
import { isPortalMemoryEnabled } from "@/lib/trainingConfig";

/**
 * No Suspense+useSearchParams wrapper — tab sync uses history.replaceState inside MemoryHub
 * so switching tabs does not replay a full-page "Loading Memory…" fallback.
 */
export default function MemoryPage() {
  const router = useRouter();
  const enabled = isPortalMemoryEnabled();

  useEffect(() => {
    if (!enabled) router.replace("/");
  }, [enabled, router]);

  if (!enabled) return null;
  return <MemoryHub />;
}
