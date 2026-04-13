"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CourseModule } from "@/lib/types";
import type { ProgressState } from "@/lib/types";

export function Sidebar({
  modules,
  progress,
}: {
  modules: CourseModule[];
  progress: ProgressState | null;
}) {
  const path = usePathname();
  const done = new Set(progress?.modulesCompleted ?? []);

  const total = modules.length;
  const pct = total ? Math.round((done.size / total) * 100) : 0;

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
        <Link href="/" className="text-lg font-semibold tracking-tight text-teal-700 dark:text-teal-400">
          HIPAA Training
        </Link>
        <p className="mt-1 text-xs text-zinc-500">Workforce • {progress?.courseVersion ?? "…"}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-teal-600 transition-all dark:bg-teal-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">{pct}% modules completed</p>
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
                      ? "bg-teal-50 font-medium text-teal-800 dark:bg-teal-950/50 dark:text-teal-200"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
                      complete ? "bg-teal-600 text-white" : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
        <div className="mt-4 border-t border-zinc-200 pt-3 dark:border-zinc-800">
          <Link
            href="/final"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
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
