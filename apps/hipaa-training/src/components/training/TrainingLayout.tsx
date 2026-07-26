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
    <div className="siya-cert siya-page-bg flex h-full min-h-0 flex-1">
      <Sidebar modules={modules} progress={progress} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
