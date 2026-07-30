"use client";

import Link from "next/link";
import portal from "@/data/employee-portal-links.json";
import { GrowthPillars } from "@/components/companion/GrowthPillars";
import { logToolLinkOpened } from "@/lib/portal-analytics";

type Item = { label: string; href: string; note?: string };
type Section = { id: string; label: string; items: Item[] };

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
}

export function EmployeeWorkspace() {
  const data = portal as { title: string; subtitle: string; sections: Section[] };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
          Your workspace
        </h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          One place to learn, practice, and stay engaged — not a pile of forgotten bookmarks.
        </p>
      </div>
      <GrowthPillars />
      <details className="rounded-2xl border border-[var(--siya-border)] bg-white/80 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--siya-text-secondary)]">
          {data.title} ↓
        </summary>
        <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">{data.subtitle}</p>
        <div className="mt-4 space-y-5 pb-2">
          {data.sections.map((sec) => (
            <div key={sec.id}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-muted)]">
                {sec.label}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {sec.items.map((item) => (
                  <li key={item.label}>
                    {isExternal(item.href) ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => void logToolLinkOpened(item.label, item.href)}
                        className="text-sm font-medium text-[var(--siya-accent)] hover:underline"
                      >
                        {item.label} ↗
                      </a>
                    ) : (
                      <Link href={item.href} className="text-sm font-medium text-[var(--siya-accent)] hover:underline">
                        {item.label}
                      </Link>
                    )}
                    {item.note ? <p className="text-[11px] text-[var(--siya-text-muted)]">{item.note}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
