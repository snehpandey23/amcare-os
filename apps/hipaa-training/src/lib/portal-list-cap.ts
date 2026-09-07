/**
 * List length discipline for staff portal ops surfaces.
 * Show a short stack; if there are more, replace the rest with one summary box.
 * Do not render long walls of near-identical rows.
 */
export const PORTAL_LIST_VISIBLE_CAP = 5;

export type CappedListSplit<T> = {
  visible: T[];
  hidden: T[];
  hiddenCount: number;
  total: number;
  capped: boolean;
};

export function splitCappedList<T>(
  items: T[],
  cap: number = PORTAL_LIST_VISIBLE_CAP,
): CappedListSplit<T> {
  const total = items.length;
  if (total <= cap) {
    return { visible: items, hidden: [], hiddenCount: 0, total, capped: false };
  }
  const visible = items.slice(0, cap);
  const hidden = items.slice(cap);
  return {
    visible,
    hidden,
    hiddenCount: hidden.length,
    total,
    capped: true,
  };
}

/** Summarize hidden rows for the overflow box (top labels by count). */
export function summarizeHiddenLabels(
  labels: string[],
  maxLabels = 3,
): { topLabels: string[]; extraLabelKinds: number } {
  const counts = new Map<string, number>();
  for (const raw of labels) {
    const key = raw.trim() || "Other";
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const top = ranked.slice(0, maxLabels);
  return {
    topLabels: top.map(([label, n]) => (n > 1 ? `${label} ×${n}` : label)),
    extraLabelKinds: Math.max(0, ranked.length - top.length),
  };
}
