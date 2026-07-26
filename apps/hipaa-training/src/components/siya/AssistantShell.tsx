"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isTrainingAuthRequired } from "@/lib/trainingConfig";

export function AssistantShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-teal-700 dark:text-teal-400">
            SiyaOS
          </Link>
          <nav className="hidden gap-3 text-sm sm:flex">
            <Link href="/" className={path === "/" ? "font-medium" : "text-zinc-500"}>
              Assistant
            </Link>
            <Link href="/training" className={path.startsWith("/training") ? "font-medium" : "text-zinc-500"}>
              Training
            </Link>
            <Link href="/resources" className="text-zinc-500">
              References
            </Link>
          </nav>
        </div>
        {isTrainingAuthRequired() && user ? (
          <button type="button" onClick={() => logout()} className="text-xs text-teal-700 dark:text-teal-400">
            Sign out
          </button>
        ) : null}
      </header>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
