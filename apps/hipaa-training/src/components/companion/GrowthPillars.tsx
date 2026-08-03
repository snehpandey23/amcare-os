"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";

const PILLARS = [
  {
    id: "learn",
    emoji: "📚",
    title: "Learn",
    blurb: "HIPAA certification, modules, and certificate — your LMS track.",
    href: "/training",
    cta: "Open training",
  },
  {
    id: "practice",
    emoji: "⚡",
    title: "Practice",
    blurb: "Daily drills: English, US culture, chat speed, billing scenarios, map & timezone.",
    href: "/learn/practice",
    cta: "Open practice",
  },
  {
    id: "ask",
    emoji: "💬",
    title: "Ask",
    blurb: "Approved SOPs, billing, HR-style process answers — escalate when policy is missing.",
    href: "/help",
    cta: "Open assistant",
  },
] as const;

export function GrowthPillars() {
  const { user } = useAuth();

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {PILLARS.map((p) => (
        <Link
          key={p.id}
          href={p.href}
          className="group rounded-2xl border border-[var(--siya-border)] bg-white/90 p-4 shadow-[var(--siya-shadow)] transition hover:border-[var(--siya-accent)] hover:shadow-md"
        >
          <span className="text-2xl" aria-hidden>
            {p.emoji}
          </span>
          <h3 className="mt-2 font-[family-name:var(--font-poppins)] text-base font-semibold text-[var(--siya-primary)]">
            {p.title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-[var(--siya-text-muted)]">{p.blurb}</p>
          <span className="mt-3 inline-block text-xs font-semibold text-[var(--siya-accent)] group-hover:underline">
            {p.cta} →
          </span>
        </Link>
      ))}
      {user && isPortalAdmin(user.role) ? (
        <Link
          href="/admin/team"
          className="group rounded-2xl border border-dashed border-[var(--siya-primary)]/40 bg-[var(--siya-bg-subtle)] p-4 sm:col-span-3"
        >
          <span className="text-2xl" aria-hidden>
            👥
          </span>
          <h3 className="mt-2 font-[family-name:var(--font-poppins)] text-base font-semibold text-[var(--siya-primary)]">
            Team (admin)
          </h3>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            Invite colleagues, assign roles, and track learning & practice progress.
          </p>
          <span className="mt-3 inline-block text-xs font-semibold text-[var(--siya-accent)] group-hover:underline">
            Manage team →
          </span>
        </Link>
      ) : null}
    </section>
  );
}
