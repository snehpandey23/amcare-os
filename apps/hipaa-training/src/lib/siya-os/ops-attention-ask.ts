/**
 * Ask — "what needs my attention today?" → Ops dashboard Needs Attention strip (deterministic).
 */
import { getTrainingApiUrl } from "@/lib/trainingConfig";
import type { OpsDashboardPayload } from "@/lib/ops-dashboard-api";
import { buildOpsAttentionSummary, type OpsAttentionItem } from "@/lib/ops-dashboard-view";

export type OpsAttentionAnswer = {
  message: string;
  sources: { title: string; id: string }[];
  links: { label: string; href: string }[];
};

function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ");
}

/** Ops Needs Attention — not personal overdue-only, not soft-stop. */
export function isOpsNeedsAttentionQuery(message: string): boolean {
  const t = norm(message);
  if (!t) return false;
  if (/\bwhat\s+needs\s+(my\s+)?attention(\s+today)?\b/.test(t)) return true;
  if (/\b(needs|need)\s+(my\s+)?attention(\s+today)?\b/.test(t)) return true;
  if (/\b(ops\s+)?needs\s+attention\b/.test(t)) return true;
  if (/\bwhat\s+(should|do)\s+i\s+(pay\s+)?attention\s+to(\s+today)?\b/.test(t)) return true;
  if (/\battention\s+(items?|summary|strip)\b/.test(t) && /\b(ops|today|my|what)\b/.test(t)) {
    return true;
  }
  return false;
}

export function formatOpsAttentionMessage(
  items: OpsAttentionItem[],
  opts?: { isAdmin: boolean; generatedAt?: string },
): string {
  if (!opts?.isAdmin) {
    return [
      "**Needs Attention** on **Ops** is an admin summary (SOP queues, lead check-ins, coverage, engagement).",
      "",
      "For **your** work today, ask **what should I do first?** or open **My day**. Admins: open **Ops** for the live strip.",
    ].join("\n");
  }

  const lines: string[] = [
    "**Needs Attention** (same Ops dashboard strip — live):",
    "",
  ];
  if (!items.length) {
    lines.push("No attention items computed — open **Ops** to refresh.");
  } else {
    for (const item of items) {
      const mark = item.tone === "warn" ? "⚠" : item.tone === "ok" ? "✓" : "·";
      lines.push(`${mark} ${item.label}`);
    }
  }
  if (opts.generatedAt) {
    lines.push("", `_Snapshot ${opts.generatedAt}_`);
  }
  lines.push("", "Open **Ops** for Section A detail, lead queues, and coverage hours.");
  return lines.join("\n");
}

export async function answerOpsNeedsAttentionQuery(
  token: string,
): Promise<OpsAttentionAnswer | null> {
  const base = getTrainingApiUrl();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/api/ops/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (res.status === 403) {
      return {
        message: formatOpsAttentionMessage([], { isAdmin: false }),
        sources: [{ title: "Ops Needs Attention", id: "ops-needs-attention" }],
        links: [
          { label: "My day", href: "/" },
          { label: "Ops", href: "/ops" },
        ],
      };
    }
    if (!res.ok) return null;
    const data = (await res.json()) as OpsDashboardPayload;
    const isAdmin = Boolean(data.viewer?.isAdmin);
    const items = isAdmin
      ? buildOpsAttentionSummary({
          engagement: data.engagement,
          leads: data.leadResponsiveness ?? [],
          coverageGapCount: data.coverageGaps?.length ?? 0,
          showTestAccounts: false,
        })
      : [];
    return {
      message: formatOpsAttentionMessage(items, {
        isAdmin,
        generatedAt: data.generatedAt,
      }),
      sources: [{ title: "Ops dashboard — Needs Attention", id: "ops-needs-attention" }],
      links: [
        { label: "Ops", href: "/ops" },
        { label: "My day", href: "/" },
        { label: "This week’s plan", href: "/executive" },
      ],
    };
  } catch {
    return null;
  }
}
