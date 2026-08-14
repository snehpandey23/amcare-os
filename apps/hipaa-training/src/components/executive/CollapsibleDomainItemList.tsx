"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { DomainItem } from "@/lib/founder-coach-api";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalStatusWarnText } from "@/lib/portal-ui";

/** Match Phase 1 server sort: founder_should_know first, then nearest deadline. */
export function sortByFounderUrgency<T extends { founderFlag?: boolean; urgencyDate?: string | null; label?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const af = Boolean(a.founderFlag);
    const bf = Boolean(b.founderFlag);
    if (af !== bf) return af ? -1 : 1;
    if (a.urgencyDate && b.urgencyDate) return a.urgencyDate.localeCompare(b.urgencyDate);
    if (a.urgencyDate) return -1;
    if (b.urgencyDate) return 1;
    return String(a.label ?? "").localeCompare(String(b.label ?? ""));
  });
}

export const FOUNDER_QUEUE_PREVIEW = 6;

type Props = {
  items: DomainItem[];
  /** Default 6 (within 5–7). */
  previewCount?: number;
  className?: string;
  empty?: ReactNode;
};

export function CollapsibleDomainItemList({
  items,
  previewCount = FOUNDER_QUEUE_PREVIEW,
  className = "",
  empty,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const sorted = useMemo(() => sortByFounderUrgency(items), [items]);
  const hidden = Math.max(0, sorted.length - previewCount);
  const visible = expanded || hidden === 0 ? sorted : sorted.slice(0, previewCount);

  if (!sorted.length) {
    return <>{empty ?? null}</>;
  }

  return (
    <div className={className}>
      <p className="mt-2 text-[11px] text-[var(--siya-text-muted)]">
        Founder-flag first · nearest deadline · showing {visible.length} of {sorted.length}
      </p>
      <ul className="mt-2 space-y-3">
        {visible.map((item) => (
          <li key={item.id} className="border-b border-[var(--siya-border)] pb-3 last:border-0 last:pb-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm font-medium text-[var(--siya-text-secondary)]">
                {item.founderFlag ? (
                  <span className={`mr-1.5 text-[10px] font-bold uppercase ${portalStatusWarnText}`}>Founder</span>
                ) : null}
                {item.label}
              </p>
              {item.urgencyDate ? (
                <span className="text-[10px] text-[var(--siya-text-muted)]">By {item.urgencyDate}</span>
              ) : null}
            </div>
            {item.detail ? <p className="mt-1 text-xs text-[var(--siya-text-muted)]">{item.detail}</p> : null}
            <p className="mt-1 text-[10px] text-[var(--siya-text-muted)]">
              Source: {item.source}
              {item.href ? (
                <>
                  {" · "}
                  <PortalNavLink href={item.href} className="text-[var(--siya-accent)] underline">
                    Open
                  </PortalNavLink>
                </>
              ) : null}
            </p>
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 w-full rounded-lg border border-[var(--siya-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--siya-accent)] hover:bg-[var(--siya-bg-subtle)]"
        >
          {expanded ? "Show less" : `Show all (${sorted.length}) — ${hidden} more`}
        </button>
      ) : null}
    </div>
  );
}
