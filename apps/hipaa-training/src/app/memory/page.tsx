"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MemoryHub } from "@/components/memory/MemoryHub";
import { isPortalMemoryEnabled } from "@/lib/trainingConfig";

export default function MemoryPage() {
  const router = useRouter();
  const enabled = isPortalMemoryEnabled();

  useEffect(() => {
    if (!enabled) router.replace("/");
  }, [enabled, router]);

  if (!enabled) return null;
  return (
    <Suspense fallback={<p className="p-8 text-sm text-[var(--siya-text-muted)]">Loading Memory…</p>}>
      <MemoryHub />
    </Suspense>
  );
}
