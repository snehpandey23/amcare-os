"use client";

import { useEffect, useState } from "react";
import {
  persistTheme,
  readStoredTheme,
  resolveInitialTheme,
  systemPrefersDark,
  type PortalTheme,
} from "@/lib/theme";

type Props = {
  /** Compact control for header; default is Account-page block. */
  variant?: "header" | "account";
};

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2.5v2.25M12 19.25V21.5M4.22 4.22l1.59 1.59M18.19 18.19l1.59 1.59M2.5 12h2.25M19.25 12H21.5M4.22 19.78l1.59-1.59M18.19 5.81l1.59-1.59"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 7 7 0 1 0 20.5 14.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle({ variant = "account" }: Props) {
  const [theme, setTheme] = useState<PortalTheme>("dark");
  const [hydrated, setHydrated] = useState(false);
  const [showSystemHint, setShowSystemHint] = useState(false);

  useEffect(() => {
    const initial = resolveInitialTheme();
    setTheme(initial);
    applyWithoutPersistIfNeeded(initial);
    setShowSystemHint(readStoredTheme() === null && systemPrefersDark());
    setHydrated(true);
  }, []);

  function applyWithoutPersistIfNeeded(t: PortalTheme) {
    document.documentElement.classList.toggle("dark", t === "dark");
  }

  function setAndPersist(next: PortalTheme) {
    setTheme(next);
    persistTheme(next);
    setShowSystemHint(false);
  }

  if (variant === "header") {
    const toLight = theme === "dark";
    return (
      <button
        type="button"
        aria-label={toLight ? "Switch to light mode" : "Switch to dark mode"}
        title={toLight ? "Switch to light mode" : "Switch to dark mode"}
        disabled={!hydrated}
        onClick={() => setAndPersist(toLight ? "light" : "dark")}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-page)] hover:text-[var(--siya-text)] disabled:opacity-50"
      >
        {toLight ? (
          <SunIcon className="h-4 w-4" />
        ) : (
          <MoonIcon className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-5">
      <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Appearance</h2>
      <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
        Default is dark. Light is optional.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!hydrated}
          aria-pressed={theme === "light"}
          onClick={() => setAndPersist("light")}
          className={
            theme === "light"
              ? "inline-flex items-center gap-1.5 rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-primary)] px-3 py-1.5 text-xs font-semibold text-white"
              : "inline-flex items-center gap-1.5 rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--siya-text-secondary)]"
          }
        >
          <SunIcon className="h-3.5 w-3.5 shrink-0" />
          Light
        </button>
        <button
          type="button"
          disabled={!hydrated}
          aria-pressed={theme === "dark"}
          onClick={() => setAndPersist("dark")}
          className={
            theme === "dark"
              ? "inline-flex items-center gap-1.5 rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-primary)] px-3 py-1.5 text-xs font-semibold text-white"
              : "inline-flex items-center gap-1.5 rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--siya-text-secondary)]"
          }
        >
          <MoonIcon className="h-3.5 w-3.5 shrink-0" />
          Dark
        </button>
      </div>
      {showSystemHint ? (
        <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">
          Your device prefers dark — already the default.
        </p>
      ) : null}
    </section>
  );
}
