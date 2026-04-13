"use client";

import type { ReactNode } from "react";
import { TrainingLayout } from "./TrainingLayout";
import { TimeTracker } from "./TimeTracker";
import { useClientProgress } from "@/hooks/useClientProgress";
import { getModulesForRole } from "@/content/modules";

export default function ClientShell({ children }: { children: ReactNode }) {
  const { progress, hydrated } = useClientProgress();

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <p className="text-zinc-500">Loading training…</p>
      </div>
    );
  }

  const modules = getModulesForRole(progress?.role ?? "other");
  return (
    <>
      <TimeTracker />
      <TrainingLayout modules={modules} progress={progress}>{children}</TrainingLayout>
    </>
  );
}
