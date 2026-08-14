/**
 * Markdown decision boot-seed — mirrors LAWS_V0_SEED / syncLawsSeed.
 * Stable ids match docs/siyaos-knowledge-base/decisions/*.md frontmatter.
 * After first sync, Memory hub UI is the sole create/edit path; markdown is export/backup.
 */

export type MarkdownDecisionSeed = {
  id: string;
  title: string;
  decisionText: string;
  reason: string;
  whatChanged?: string;
  actionHook?: string;
  ownerName: string;
  department: string;
  decisionDate: string;
  importance: 1 | 2 | 3;
  confidence: number;
  parentConstitutionSlug: string;
  evidence: string;
};

/** Content compiled from the three live markdown decisions (git KB). */
export const MARKDOWN_DECISIONS_SEED: MarkdownDecisionSeed[] = [
  {
    id: "homepage-cta-meet-and-greet",
    title: "Homepage primary CTA — Book Free Meet & Greet",
    decisionText:
      "Standardize the primary homepage CTA to Book Free Meet & Greet (per SIYA-STANDARDS CTA hierarchy), not third-party marketplace checkout as the hero action.",
    reason:
      "Highest trust and lower friction for physician-led telehealth positioning; keeps booking on owned flows.",
    actionHook:
      "When staff ask why we don't lead with Zocdoc or alternate CTAs on the homepage, explain trust/friction rationale and point to SIYA-STANDARDS CTA section—not folklore.",
    ownerName: "CEO · Marketing",
    department: "Marketing",
    decisionDate: "2026-07-01",
    importance: 3,
    confidence: 90,
    parentConstitutionSlug: "principle-never-ask-twice",
    evidence: "markdown-seed:docs/siyaos-knowledge-base/decisions/homepage-cta-meet-and-greet.md",
  },
  {
    id: "marketing-os-v1-frozen",
    title: "Freeze Marketing OS as Siya OS department module v1.0",
    decisionText:
      "Marketing is a department module of Siya OS, not an independent Marketing OS. Foundation is frozen as Siya Marketing Operating System v1.0; further changes ship as versioned updates or new decision entries.",
    reason:
      "Independent departmental OS philosophies create incompatible systems. One shared Siya OS architecture keeps Clinical, Compliance, Technology, Ops, and Marketing reconcilable.",
    actionHook:
      "When staff ask what Marketing OS is: point to MARKETING-OS-v1.0.md (frozen) and SIYA-OS-ARCHITECTURE.md. Suggest v1.1+ for changes instead of rewriting v1.0.",
    ownerName: "CMO · CEO",
    department: "Marketing",
    decisionDate: "2026-07-27",
    importance: 3,
    confidence: 92,
    parentConstitutionSlug: "principle-earn-permanence",
    evidence: "markdown-seed:docs/siyaos-knowledge-base/decisions/marketing-os-v1-frozen.md",
  },
  {
    id: "agent-org-chart-deferred",
    title: "Defer the multi-agent C-suite / Executive Office layer",
    decisionText:
      "Do not build the proposed seven-agent C-suite (COO, CMO, CTO, Intelligence, Content, Memory, Executive Advisor) with an Executive Office orchestration layer. Adopt salvageable pieces as Marketing OS v1.1 and defer the rest.",
    reason:
      "Attention math, duplication with Founder Decision Coach, sequencing (KPIs not ready), content-quota contradiction, and scale — an orchestration layer is premature.",
    actionHook:
      "When asked about agent org chart / Executive Office / COO agent: deferred, not rejected forever — cite revisit criteria. Direct founder-attention features to Executive Workspace v2; marketing agent behavior to MARKETING-OS-v1.1.md.",
    ownerName: "CEO · CMO",
    department: "Leadership",
    decisionDate: "2026-07-31",
    importance: 3,
    confidence: 90,
    parentConstitutionSlug: "principle-ai-augments-judgment",
    evidence: "markdown-seed:docs/siyaos-knowledge-base/decisions/agent-org-chart-deferred.md",
  },
];

export function importanceFromLabel(raw: unknown): 1 | 2 | 3 {
  if (typeof raw === "string") {
    const s = raw.toLowerCase().trim();
    if (s === "high" || s === "3" || s === "l3") return 3;
    if (s === "medium" || s === "2" || s === "l2") return 2;
    if (s === "low" || s === "1" || s === "l1") return 1;
  }
  const n = Number(raw);
  if (n === 3) return 3;
  if (n === 2) return 2;
  return 1;
}

export function normalizeDecisionTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
