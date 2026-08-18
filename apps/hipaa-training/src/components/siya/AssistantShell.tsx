"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AssistThreadProvider } from "@/context/AssistThreadContext";
import { isTrainingAuthRequired, isPortalAuthEnabled } from "@/lib/trainingConfig";
import { isPortalAdmin } from "@/lib/portal-role";
import { ShiftPresenceBar } from "@/components/shift/ShiftPresenceBar";
import { ShiftRitualStrip } from "@/components/shift/ShiftRitualStrip";
import { useShiftOptional } from "@/context/ShiftContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SiyaWordmark } from "@/components/siya/SiyaWordmark";
import { AssistWorkspaceSidebar } from "@/components/siya/AssistWorkspaceSidebar";
import { portalBtnGhostSm } from "@/lib/portal-ui";

export function AssistantShell({ children }: { children: ReactNode }) {
  const path = usePathname() ?? "/";
  const router = useRouter();
  const { user, logout } = useAuth();
  const shift = useShiftOptional();
  const [mobileNav, setMobileNav] = useState(false);
  const chatHome = path === "/" || path.startsWith("/help");

  return (
    <AssistThreadProvider>
      <div className="siya-page-bg flex h-screen flex-col">
        <header className="no-print relative z-50 flex h-[4.25rem] shrink-0 items-center justify-between border-b border-[var(--siya-border)] bg-[var(--siya-white)]/90 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`${portalBtnGhostSm} md:hidden`}
              aria-label="Open chats and navigation"
              onClick={() => setMobileNav(true)}
            >
              Chats
            </button>
            <Link href="/" className="flex items-center" aria-label="Siya — My day">
              <SiyaWordmark size="header" />
            </Link>
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
            ) : isPortalAuthEnabled() || isTrainingAuthRequired() ? (
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
        <div className="flex min-h-0 flex-1">
          <div className="hidden md:flex">
            <AssistWorkspaceSidebar />
          </div>
          {mobileNav ? (
            <div className="fixed inset-0 z-[60] flex md:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/25"
                aria-label="Close navigation"
                onClick={() => setMobileNav(false)}
              />
              <div className="relative z-[61] h-full shadow-[var(--siya-shadow-lg)]">
                <AssistWorkspaceSidebar onNavigate={() => setMobileNav(false)} />
              </div>
            </div>
          ) : null}
          <main className={`min-h-0 min-w-0 flex-1 ${chatHome ? "overflow-hidden" : "overflow-y-auto"}`}>
            {children}
          </main>
        </div>
      </div>
    </AssistThreadProvider>
  );
}
