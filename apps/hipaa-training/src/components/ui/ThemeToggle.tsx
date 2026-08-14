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

export function ThemeToggle({ variant = "account" }: Props) {
  const [theme, setTheme] = useState<PortalTheme>("light");
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
    return (
      <button
        type="button"
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        title={theme === "dark" ? "Light mode" : "Dark mode"}
        disabled={!hydrated}
        onClick={() => setAndPersist(theme === "dark" ? "light" : "dark")}
        className="rounded-lg border border-[var(--siya-border)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-subtle)]"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-5">
      <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Appearance</h2>
      <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
        Default is light. Dark is optional for long sessions.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!hydrated}
          aria-pressed={theme === "light"}
          onClick={() => setAndPersist("light")}
          className={
            theme === "light"
              ? "rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-primary)] px-3 py-1.5 text-xs font-semibold text-white"
              : "rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--siya-text-secondary)]"
          }
        >
          Light
        </button>
        <button
          type="button"
          disabled={!hydrated}
          aria-pressed={theme === "dark"}
          onClick={() => setAndPersist("dark")}
          className={
            theme === "dark"
              ? "rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-primary)] px-3 py-1.5 text-xs font-semibold text-white"
              : "rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-1.5 text-xs font-medium text-[var(--siya-text-secondary)]"
          }
        >
          Dark
        </button>
      </div>
      {showSystemHint ? (
        <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">
          Your device prefers dark — optional; we stay on light until you choose.
        </p>
      ) : null}
    </section>
  );
}
