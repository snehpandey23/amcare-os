"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CourseModule } from "@/lib/types";
import type { ProgressState } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { isTrainingAuthRequired } from "@/lib/trainingConfig";
import { BRAND } from "@/lib/brand";
import { TrainingProgressBar } from "./training-ui";

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

  const navLink = (href: string, label: string, active?: boolean) => (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
        active
          ? "bg-[var(--siya-bg-subtle)] font-medium text-[var(--siya-primary)]"
          : "text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-page)]"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--siya-border)] bg-white">
      <div className="border-b border-[var(--siya-border)] p-4">
        <Link href="/" className="text-sm font-semibold text-[var(--siya-primary)]">
          ← {BRAND.appName}
        </Link>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">Certification · {progress?.courseVersion ?? "…"}</p>
        <div className="mt-3">
          <TrainingProgressBar pct={pct} />
        </div>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">{pct}% modules completed</p>
        {isTrainingAuthRequired() && user ? (
          <div className="mt-3 border-t border-[var(--siya-border)] pt-3 text-xs">
            <p className="truncate font-medium text-[var(--siya-text)]">{user.name || user.email}</p>
            <p className="truncate text-[var(--siya-text-muted)]">{user.email}</p>
            <button
              type="button"
              onClick={() => logout()}
              className="mt-2 text-left font-medium text-[var(--siya-accent)] hover:underline"
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
                      complete
                        ? "bg-[var(--siya-accent)] text-white"
                        : "bg-[var(--siya-bg-subtle)] text-[var(--siya-text-muted)]"
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
        <div className="mt-4 border-t border-[var(--siya-border)] pt-3 space-y-0.5">
          {navLink("/training", "Certification dashboard", path === "/training")}
          {navLink("/resources", "Reference library", path.startsWith("/resources"))}
          {navLink("/final", "Final assessment", path === "/final")}
          {navLink("/results", "Results & analytics", path === "/results")}
          {navLink("/certificate", "Certificate", path === "/certificate")}
        </div>
      </nav>
    </aside>
  );
}
