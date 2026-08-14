"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { helpHref } from "@/lib/companion/quick-actions";

/** Legacy /help → My day (one continuous Assist chat). */
function HelpRedirectInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const q = params.get("q")?.trim() || undefined;
    const focus = params.get("focus") === "1";
    router.replace(helpHref(q, focus));
  }, [router, params]);

  return <p className="p-8 text-sm text-[var(--siya-text-muted)]">Opening My day…</p>;
}

export default function HelpPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-[var(--siya-text-muted)]">Opening My day…</p>}>
      <HelpRedirectInner />
    </Suspense>
  );
}
