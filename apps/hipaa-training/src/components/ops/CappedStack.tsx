"use client";

import type { ReactNode } from "react";
import { PORTAL_LIST_VISIBLE_CAP, splitCappedList } from "@/lib/portal-list-cap";

type Props<T> = {
  items: T[];
  /** Default 5 — soft cap before overflow box. */
  cap?: number;
  className?: string;
  renderItem: (item: T, index: number) => ReactNode;
  /** Shown instead of remaining rows when over the cap. */
  renderOverflow: (info: {
    hiddenCount: number;
    total: number;
    hidden: T[];
  }) => ReactNode;
};

/**
 * Renders up to `cap` items, then one overflow summary — not a long similar stack.
 */
export function CappedStack<T>({
  items,
  cap = PORTAL_LIST_VISIBLE_CAP,
  className = "space-y-2",
  renderItem,
  renderOverflow,
}: Props<T>) {
  const split = splitCappedList(items, cap);
  return (
    <div className={className}>
      {split.visible.map((item, i) => renderItem(item, i))}
      {split.capped
        ? renderOverflow({
            hiddenCount: split.hiddenCount,
            total: split.total,
            hidden: split.hidden,
          })
        : null}
    </div>
  );
}

export function ListOverflowBox({
  title,
  detail,
  action,
}: {
  title: string;
  detail?: string;
  action?: ReactNode;
}) {
  return (
    <div
      className="rounded-[var(--siya-radius-md)] border border-dashed border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/70 px-4 py-3"
      role="status"
    >
      <p className="text-sm font-semibold text-[var(--siya-primary)]">{title}</p>
      {detail ? <p className="mt-1 text-xs text-[var(--siya-text-muted)]">{detail}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
