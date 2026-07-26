"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import type { CourseModule } from "@/lib/types";
import type { ProgressState } from "@/lib/types";

export function TrainingLayout({
  modules,
  progress,
  children,
}: {
  modules: CourseModule[];
  progress: ProgressState | null;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-1 bg-[var(--siya-bg-page)] text-[var(--siya-text)]">
      <Sidebar modules={modules} progress={progress} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
