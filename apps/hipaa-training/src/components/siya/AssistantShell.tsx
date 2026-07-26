"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isTrainingAuthRequired } from "@/lib/trainingConfig";
import { BRAND } from "@/lib/brand";

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={
        active
          ? "font-semibold text-[var(--siya-primary)]"
          : "text-[var(--siya-text-muted)] hover:text-[var(--siya-text-secondary)]"
      }
    >
      {children}
    </Link>
  );
}

export function AssistantShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="siya-page-bg flex h-screen flex-col">
      <header className="no-print flex h-[4.25rem] shrink-0 items-center justify-between border-b border-[var(--siya-border)] bg-white/90 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/images/siya-health-logo.png"
              alt="Siya Health"
              width={120}
              height={36}
              className="hidden h-8 w-auto sm:block"
            />
            <span className="font-[family-name:var(--font-poppins)] text-base font-semibold text-[var(--siya-primary)] sm:hidden">
              {BRAND.appName}
            </span>
          </Link>
          <nav className="flex gap-4 text-sm md:gap-6">
            <NavLink href="/" active={path === "/"}>
              Chat
            </NavLink>
            <NavLink href="/training" active={path.startsWith("/training") || path.startsWith("/module")}>
              Certification
            </NavLink>
            <NavLink href="/resources" active={path.startsWith("/resources")}>
              References
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--siya-text-muted)]">
          {isTrainingAuthRequired() && user ? (
            <>
              <span className="hidden max-w-[160px] truncate sm:inline">{user.name || user.email}</span>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-[var(--siya-border)] px-3 py-1.5 font-medium text-[var(--siya-accent)] hover:bg-[var(--siya-bg-subtle)]"
              >
                Sign out
              </button>
            </>
          ) : isTrainingAuthRequired() ? (
            <Link
              href="/login"
              className="rounded-lg bg-[var(--siya-primary)] px-3 py-1.5 font-medium text-white hover:bg-[var(--siya-primary-hover)]"
            >
              Sign in
            </Link>
          ) : (
            <span className="rounded-full bg-[var(--siya-bg-subtle)] px-2.5 py-1 text-[var(--siya-accent)]">
              Preview
            </span>
          )}
        </div>
      </header>
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
