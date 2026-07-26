"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CourseModule } from "@/lib/types";
import type { ProgressState } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { isTrainingAuthRequired } from "@/lib/trainingConfig";
import { BRAND } from "@/lib/brand";

export function Sidebar({
  modules,
  progress,
}: {
  modules: CourseModule[];
  progress: ProgressState | null;
}) {
  const { user, logout } = useAuth();
  const path = usePathname();
  const done = new Set(progress?.modulesCompleted ?? []);

  const total = modules.length;
  const pct = total ? Math.round((done.size / total) * 100) : 0;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--siya-border)] bg-white">
      <div className="border-b border-[var(--siya-border)] p-4">
        <Link href="/" className="text-sm font-semibold text-[var(--siya-primary)]">
          ← {BRAND.appName}
        </Link>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Certification · {progress?.courseVersion ?? "…"}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--siya-bg-subtle)]">
          <div
            className="h-full rounded-full bg-[var(--siya-accent)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">{pct}% modules completed</p>
        {isTrainingAuthRequired() && user ? (
          <div className="mt-3 border-t border-zinc-200 pt-3 text-xs dark:border-zinc-800">
            <p className="truncate font-medium text-zinc-800 dark:text-zinc-200">{user.name || user.email}</p>
            <p className="truncate text-zinc-500">{user.email}</p>
            <button
              type="button"
              onClick={() => logout()}
              className="mt-2 text-left text-teal-700 hover:underline dark:text-teal-400"
            >
              Sign out
            </button>
          </div>
        ) : null}
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-0.5 text-sm">
          {modules.map((m) => {
            const active = path.startsWith(`/module/${m.id}`);
            const complete = done.has(m.id);
            return (
              <li key={m.id}>
                <Link
                  href={`/module/${m.id}`}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    active
                      ? "bg-[var(--siya-bg-subtle)] font-medium text-[var(--siya-primary)]"
                      : "text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-page)]"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      complete ? "bg-[var(--siya-accent)] text-white" : "bg-[var(--siya-bg-subtle)] text-[var(--siya-text-muted)]"
                    }`}
                  >
                    {complete ? "✓" : m.order}
                  </span>
                  <span className="truncate">{m.shortTitle}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 border-t border-[var(--siya-border)] pt-3">
          <Link href="/training" className="block rounded-lg px-3 py-2 text-sm text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-page)]">
            Certification dashboard
          </Link>
          <Link href="/resources" className="block rounded-lg px-3 py-2 text-sm text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-page)]">
            Reference library
          </Link>
          <Link
            href="/final"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-page)]"
          >
            Final assessment
          </Link>
          <Link
            href="/results"
            className="block rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Results & analytics
          </Link>
          <Link
            href="/certificate"
            className="block rounded-lg px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            Certificate
          </Link>
        </div>
      </nav>
    </aside>
  );
}
