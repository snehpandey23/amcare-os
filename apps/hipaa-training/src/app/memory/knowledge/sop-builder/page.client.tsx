"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SopBuilderWizard } from "@/components/sop-builder/SopBuilderWizard";
import { fetchSopBuilderAccess, resumeSopBuilderSession } from "@/lib/sop-builder-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalH1, portalLinkBack, portalPage } from "@/lib/portal-ui";

export default function SopBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionParam = searchParams.get("session");
  const topicParam = searchParams.get("topic") ?? "";
  const { user, authReady } = useAuth();
  const [resumeId, setResumeId] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !user) return;
    void fetchSopBuilderAccess().then((acc) => {
      if (!acc.canBuild) router.replace("/learn");
    });
  }, [authReady, user, router]);

  useEffect(() => {
    if (!sessionParam || !authReady) return;
    void resumeSopBuilderSession(sessionParam)
      .then(() => setResumeId(sessionParam))
      .catch(() => setResumeId(null));
  }, [sessionParam, authReady]);

  if (!authReady || !user) return null;

  return (
    <div className={`${portalPage} max-w-lg`}>
      <header>
        <PortalNavLink href="/memory/knowledge/sops" className={portalLinkBack}>
          ← Department SOPs
        </PortalNavLink>
        <h1 className={`mt-2 ${portalH1}`}>AI checklist builder</h1>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          Operational daily checklists for My day — not department policy docs (
          <Link href="/memory/knowledge/sops" className="text-[var(--siya-accent)] hover:underline">
            those live here
          </Link>
          ).
        </p>
      </header>
      <SopBuilderWizard initialResumeId={resumeId} initialTopic={topicParam} />
    </div>
  );
}
