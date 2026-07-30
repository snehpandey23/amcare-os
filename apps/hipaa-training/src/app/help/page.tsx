"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiyaChat } from "@/components/siya/SiyaChat";
import { AssistantBrandPanel } from "@/components/siya/AssistantBrandPanel";
import { useShiftOptional } from "@/context/ShiftContext";
import Link from "next/link";

function HelpDeskInner() {
  const params = useSearchParams();
  const initialQuery = params.get("q")?.trim() || undefined;
  const shift = useShiftOptional();
  const focusMode = shift?.presence === "focus" || params.get("focus") === "1";

  return (
    <div className="flex h-full min-h-0">
      {!focusMode ? <AssistantBrandPanel /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-[var(--siya-border)] bg-white/80 px-4 py-3 md:px-6">
          <Link href="/" className="text-xs text-[var(--siya-accent)] hover:underline">
            ← My day
          </Link>
          {focusMode ? (
            <>
              <h1 className="font-[family-name:var(--font-poppins)] text-xl font-semibold text-violet-900">
                Focus mode
              </h1>
              <p className="text-xs text-[var(--siya-text-muted)]">Concise answers — action first.</p>
            </>
          ) : (
            <h1 className="font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
              Hi, how can I help you?
            </h1>
          )}
        </div>
        <div className="min-h-0 flex-1">
          <SiyaChat initialQuery={initialQuery} focusMode={focusMode} />
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-[var(--siya-text-muted)]">Loading…</p>}>
      <HelpDeskInner />
    </Suspense>
  );
}
