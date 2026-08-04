"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ChatReviewPanel } from "@/components/ops/ChatReviewPanel";
import { fetchChatReviewAccess } from "@/lib/ops-coordination-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalH1, portalLinkBack, portalPage } from "@/lib/portal-ui";

export function ChatReviewPageClient() {
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [access, setAccess] = useState<{ canReview: boolean; isAdmin: boolean } | null>(null);

  useEffect(() => {
    if (!authReady || !user) return;
    void fetchChatReviewAccess()
      .then((acc) => {
        setAccess(acc);
        if (!acc.canReview) router.replace("/");
      })
      .catch(() => router.replace("/"));
  }, [authReady, user, router]);

  if (!authReady || !user || !access?.canReview) return null;

  return (
    <div className={`${portalPage} max-w-lg`}>
      <header className="mb-2">
        <PortalNavLink href="/" className={portalLinkBack}>
          ← My day
        </PortalNavLink>
        <h1 className={`mt-2 ${portalH1}`}>Chat review</h1>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Clinical QA log — admin and Clinical Operations lead only. Log reviews as you go; mark open/closed when done.
        </p>
      </header>
      <ChatReviewPanel />
      {access.isAdmin ? (
        <p className="mt-6 text-center text-[11px] text-[var(--siya-text-muted)]">
          Cross-team view:{" "}
          <Link href="/admin/chat-reviews" className="font-semibold text-[var(--siya-accent)] hover:underline">
            All reviews
          </Link>
        </p>
      ) : null}
    </div>
  );
}
