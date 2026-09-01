/**
 * Phase 1 — Clinical lead "Your Focus" (Your 5) work inbox.
 * Combines open assist gaps + pending_review SOPs for Clinical Operations.
 * Cap hard at 5; overflow → full list. No new data collection.
 */

export const CLINICAL_OPS_DEPARTMENT = "Clinical Operations";
export const CLINICAL_OPS_SLUG = "clinical_operations";
export const YOUR_FOCUS_CAP = 5;

export type LeadFocusItemKind = "gap" | "sop";

export type LeadFocusItem = {
  id: string;
  kind: LeadFocusItemKind;
  title: string;
  subtitle: string;
  href: string;
  /** Oldest / most urgent first */
  sortAt: string;
};

export function isClinicalOpsLead(leadDepartments: string[]): boolean {
  return leadDepartments.some(
    (d) =>
      d === CLINICAL_OPS_DEPARTMENT ||
      d.toLowerCase().replace(/\s+/g, "_") === CLINICAL_OPS_SLUG,
  );
}

export function buildLeadFocusItems(opts: {
  gaps: { id: string; department: string; departmentSlug?: string; taskLabel: string; createdAt: string }[];
  sops: {
    id: string;
    department: string;
    title: string;
    status: string;
    submittedAt?: string | null;
    createdAt: string;
    updatedAt?: string;
  }[];
}): LeadFocusItem[] {
  const items: LeadFocusItem[] = [];

  for (const g of opts.gaps) {
    const slug = (g.departmentSlug || "").toLowerCase();
    const isClinical =
      slug === CLINICAL_OPS_SLUG ||
      g.department === CLINICAL_OPS_DEPARTMENT ||
      /clinical/i.test(g.department);
    if (!isClinical) continue;
    items.push({
      id: `gap-${g.id}`,
      kind: "gap",
      title: g.taskLabel?.trim() || "Knowledge gap",
      subtitle: `Ask gap · ${g.createdAt.slice(0, 10)}`,
      href: `/lead/your-focus/gap/${encodeURIComponent(g.id)}`,
      sortAt: g.createdAt,
    });
  }

  for (const s of opts.sops) {
    if (s.status !== "pending_review") continue;
    if (s.department !== CLINICAL_OPS_DEPARTMENT) continue;
    const when = s.submittedAt || s.createdAt;
    items.push({
      id: `sop-${s.id}`,
      kind: "sop",
      title: s.title?.trim() || "SOP pending review",
      subtitle: `SOP review · ${(when || "").slice(0, 10)}`,
      href: `/memory/knowledge/sops?edit=${encodeURIComponent(s.id)}`,
      sortAt: when || s.createdAt,
    });
  }

  items.sort((a, b) => a.sortAt.localeCompare(b.sortAt));
  return items;
}

export function capLeadFocusItems(items: LeadFocusItem[], cap = YOUR_FOCUS_CAP) {
  const preview = items.slice(0, cap);
  const moreCount = Math.max(0, items.length - cap);
  return { preview, moreCount, total: items.length };
}
