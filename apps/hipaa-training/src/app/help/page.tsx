"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AssistChatShell } from "@/components/siya/AssistChatShell";
import { AssistantBrandPanel } from "@/components/siya/AssistantBrandPanel";
import { useAuth } from "@/context/AuthContext";
import { useShiftOptional } from "@/context/ShiftContext";
import { portalH2, portalLinkBack } from "@/lib/portal-ui";

/** Top-nav Ask destination — shared staff Assist chat (not Founder Coach). */
function HelpDeskInner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const firstName = user?.name?.trim().split(/\s+/)[0];
  const initialQuery = params.get("q")?.trim() || undefined;
  const shift = useShiftOptional();
  const focusMode = shift?.presence === "focus" || params.get("focus") === "1";

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {!focusMode ? <AssistantBrandPanel /> : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-[var(--siya-border)] bg-[var(--siya-white)]/80 px-4 py-3 md:px-6">
          <Link href="/" className={portalLinkBack}>
            ← My day
          </Link>
          {focusMode ? (
            <>
              <h1 className={`mt-1 ${portalH2}`}>Focus mode</h1>
              <p className="text-xs text-[var(--siya-text-muted)]">Concise answers — action first.</p>
            </>
          ) : (
            <h1 className={`mt-1 ${portalH2}`}>Hi, how can I help you?</h1>
          )}
        </div>
        <div className="min-h-0 flex-1">
          <AssistChatShell
            key={`${initialQuery ?? ""}-${focusMode ? "focus" : "normal"}`}
            firstName={firstName}
            initialQuery={initialQuery}
            focusMode={focusMode}
          />
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
