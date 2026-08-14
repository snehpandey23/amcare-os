"use client";

import Link from "next/link";
import portal from "@/data/employee-portal-links.json";
import { logToolLinkOpened } from "@/lib/portal-analytics";

type WorkplaceItem = { label: string; href: string; note?: string };

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
}

function openExternal(label: string, href: string) {
  void logToolLinkOpened(label, href);
  window.open(href, "_blank", "noopener,noreferrer");
}

export function WorkplaceLinksPanel({ className = "" }: { className?: string }) {
  const items = (portal as { workplacePrimary?: WorkplaceItem[] }).workplacePrimary ?? [];
  if (!items.length) return null;

  return (
    <section
      className={`rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)]/90 p-5 shadow-[var(--siya-shadow)] ${className}`}
    >
      <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Workplace links</h2>
      <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">
        Opens in a new tab — PHI stays in the approved tool, not in chat.
      </p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.href + item.label}>
            {isExternal(item.href) ? (
              <button
                type="button"
                onClick={() => openExternal(item.label, item.href)}
                className="w-full rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2.5 text-left text-sm font-medium text-[var(--siya-accent)] hover:border-[var(--siya-accent)]/40"
              >
                {item.label} ↗
                {item.note ? (
                  <span className="mt-0.5 block text-[11px] font-normal text-[var(--siya-text-muted)]">{item.note}</span>
                ) : null}
              </button>
            ) : (
              <Link
                href={item.href}
                className="block rounded-xl border border-[var(--siya-border)] px-3 py-2.5 text-sm font-medium text-[var(--siya-accent)] hover:underline"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
