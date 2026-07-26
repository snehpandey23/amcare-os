"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TrainingLayout } from "./TrainingLayout";
import { AssistantShell } from "@/components/siya/AssistantShell";
import { useClientProgress } from "@/hooks/useClientProgress";
import { useAuth } from "@/context/AuthContext";
import { getModulesForRole } from "@/content/modules";

function isAssistantRoute(path: string) {
  return path === "/" || path.startsWith("/resources");
}

function isTrainingRoute(path: string) {
  return (
    path.startsWith("/training") ||
    path.startsWith("/module") ||
    path.startsWith("/final") ||
    path.startsWith("/results") ||
    path.startsWith("/certificate")
  );
}

export default function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authReady, authRequired, user } = useAuth();
  const { progress, hydrated } = useClientProgress();

  useEffect(() => {
    if (!authReady || !authRequired) return;
    if (user && pathname === "/login") router.replace("/");
  }, [authReady, authRequired, user, pathname, router]);

  useEffect(() => {
    if (!authReady || !authRequired) return;
    if (!user && pathname !== "/login") router.replace("/login");
  }, [authReady, authRequired, user, pathname, router]);

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (pathname === "/login") return <>{children}</>;

  if (authRequired && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Redirecting to sign in…</p>
      </div>
    );
  }

  if (isAssistantRoute(pathname)) {
    return <AssistantShell>{children}</AssistantShell>;
  }

  if (isTrainingRoute(pathname)) {
    if (!hydrated || (authRequired && user && !progress)) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-zinc-500">Loading training…</p>
        </div>
      );
    }
    const modules = getModulesForRole(progress?.role ?? "other");
    return (
      <AssistantShell>
        <TrainingLayout modules={modules} progress={progress}>
          {children}
        </TrainingLayout>
      </AssistantShell>
    );
  }

  return <AssistantShell>{children}</AssistantShell>;
}
