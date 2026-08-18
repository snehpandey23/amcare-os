"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isTrainingAuthRequired, isPortalAuthEnabled, isPortalMemoryEnabled } from "@/lib/trainingConfig";
import { isPortalAdmin } from "@/lib/portal-role";
import { ShiftPresenceBar } from "@/components/shift/ShiftPresenceBar";
import { ShiftRitualStrip } from "@/components/shift/ShiftRitualStrip";
import { useShiftOptional } from "@/context/ShiftContext";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SiyaWordmark } from "@/components/siya/SiyaWordmark";

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  const className = active
    ? "font-semibold text-[var(--siya-primary)]"
    : "text-[var(--siya-text-muted)] hover:text-[var(--siya-text-secondary)]";

  return (
    <PortalNavLink href={href} className={className}>
      {children}
    </PortalNavLink>
  );
}

export function AssistantShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const shift = useShiftOptional();

  return (
    <div className="siya-page-bg flex h-screen flex-col">
      <header className="no-print relative z-50 flex h-[4.25rem] shrink-0 items-center justify-between border-b border-[var(--siya-border)] bg-[var(--siya-white)]/90 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center" aria-label="Siya — My day">
            <SiyaWordmark size="header" />
          </Link>
          <nav className="flex flex-wrap gap-3 text-sm md:gap-5">
            <NavLink href="/" active={path === "/" || path.startsWith("/help")}>
              My day
            </NavLink>
            <NavLink
              href="/learn"
              active={
                path.startsWith("/learn") ||
                path.startsWith("/training") ||
                path.startsWith("/module") ||
                path.startsWith("/level-up")
              }
            >
              Learn
            </NavLink>
            {isPortalMemoryEnabled() ? (
              <NavLink href="/memory" active={path.startsWith("/memory")}>
                Memory
              </NavLink>
            ) : null}
            {user && !isPortalAdmin(user.role) ? (
              <NavLink href="/team" active={path === "/team" || path.startsWith("/team/")}>
                Team
              </NavLink>
            ) : null}
            {user && isPortalAdmin(user.role) ? (
              <NavLink href="/admin/team" active={path.startsWith("/admin")}>
                Admin
              </NavLink>
            ) : null}
          </nav>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--siya-text-muted)] md:gap-3">
          {!isPortalAdmin(user?.role) ? (
            <ShiftPresenceBar onEndShift={() => router.replace("/start-shift")} />
          ) : null}
          <ThemeToggle variant="header" />
          {user ? (
            <>
              <span className="hidden max-w-[180px] truncate sm:inline text-[var(--siya-text-muted)]">
                {user.name?.trim() || user.email}
              </span>
              <a
                href="/account"
                className="hidden rounded-lg border border-[var(--siya-border)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-subtle)] sm:inline"
              >
                Account
              </a>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 font-medium text-[var(--siya-accent)] hover:bg-[var(--siya-bg-subtle)]"
              >
                Sign out
              </button>
            </>
          ) : isPortalAuthEnabled() ? (
            <Link
              href="/login"
              className="rounded-lg bg-[var(--siya-btn-primary)] px-3 py-1.5 font-medium text-white hover:bg-[var(--siya-btn-primary-hover)]"
            >
              Sign in
            </Link>
          ) : isTrainingAuthRequired() ? (
            <Link
              href="/login"
              className="rounded-lg bg-[var(--siya-btn-primary)] px-3 py-1.5 font-medium text-white hover:bg-[var(--siya-btn-primary-hover)]"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </header>
      <ShiftRitualStrip ritual={shift?.ritual ?? null} onDismiss={() => shift?.clearRitual()} />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
