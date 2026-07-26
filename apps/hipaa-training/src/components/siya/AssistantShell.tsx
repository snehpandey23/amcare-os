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
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-900">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold text-teal-700 dark:text-teal-400">
            SiyaOS
          </Link>
          <nav className="hidden gap-3 text-sm sm:flex">
            <Link
              href="/"
              className={path === "/" ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-500 hover:text-zinc-800"}
            >
              Assistant
            </Link>
            <Link
              href="/training"
              className={
                path.startsWith("/training") || path.startsWith("/module")
                  ? "font-medium text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800"
              }
            >
              Training
            </Link>
            <Link href="/resources" className="text-zinc-500 hover:text-zinc-800">
              References
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          {isTrainingAuthRequired() && user ? (
            <>
              <span className="hidden max-w-[140px] truncate sm:inline">{user.name || user.email}</span>
              <button type="button" onClick={() => logout()} className="text-teal-700 hover:underline dark:text-teal-400">
                Sign out
              </button>
            </>
          ) : isTrainingAuthRequired() ? (
            <Link href="/login" className="text-teal-700 hover:underline dark:text-teal-400">
              Sign in
            </Link>
          ) : (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Internal preview
            </span>
          )}
        </div>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
