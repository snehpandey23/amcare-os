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
import { TourCoachSpacer } from "@/components/onboarding/TourCoachBar";

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
        <header className="no-print relative z-50 flex h-11 shrink-0 items-center justify-between border-b border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 md:px-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-[var(--siya-text-muted)] hover:bg-[var(--siya-white)] hover:text-[var(--siya-text)] md:hidden"
              aria-label="Open chats and navigation"
              onClick={() => setMobileNav(true)}
            >
              Chats
            </button>
            <Link href="/" className="flex items-center" aria-label="Siya — My day">
              <SiyaWordmark size="compact" />
            </Link>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--siya-text-muted)] md:gap-2">
            {!isPortalAdmin(user?.role) ? (
              <ShiftPresenceBar onEndShift={() => router.replace("/start-shift")} />
            ) : null}
            <ThemeToggle variant="header" />
            {user ? (
              <>
                <span className="hidden max-w-[160px] truncate sm:inline">
                  {user.name?.trim() || user.email}
                </span>
                <a
                  href="/account"
                  className="hidden rounded-md px-2 py-1 text-[11px] hover:bg-[var(--siya-white)] hover:text-[var(--siya-text)] sm:inline"
                >
                  Account
                </a>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-md px-2 py-1 text-[11px] hover:bg-[var(--siya-white)] hover:text-[var(--siya-text)]"
                >
                  Sign out
                </button>
              </>
            ) : isPortalAuthEnabled() || isTrainingAuthRequired() ? (
              <Link
                href="/login"
                className="rounded-md bg-[var(--siya-btn-primary)] px-3 py-1.5 font-medium text-white hover:bg-[var(--siya-btn-primary-hover)]"
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
            <TourCoachSpacer />
            {children}
          </main>
        </div>
      </div>
    </AssistThreadProvider>
  );
}
