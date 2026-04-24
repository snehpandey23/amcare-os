"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TrainingLayout } from "./TrainingLayout";
import { useClientProgress } from "@/hooks/useClientProgress";
import { useAuth } from "@/context/AuthContext";
import { getModulesForRole } from "@/content/modules";

export default function ClientShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { authReady, authRequired, user } = useAuth();
  const { progress, hydrated } = useClientProgress();

  useEffect(() => {
    if (!authReady || !authRequired) return;
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [authReady, authRequired, user, pathname, router]);

  useEffect(() => {
    if (!authReady || !authRequired) return;
    if (!user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [authReady, authRequired, user, pathname, router]);

  if (!authReady || !hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-500">Loading training…</p>
      </div>
    );
  }

  if (authRequired && user && !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-500">Loading your progress…</p>
      </div>
    );
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (authRequired && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-500">Redirecting to sign in…</p>
      </div>
    );
  }

  const modules = getModulesForRole(progress?.role ?? "other");
  return <TrainingLayout modules={modules} progress={progress}>{children}</TrainingLayout>;
}
