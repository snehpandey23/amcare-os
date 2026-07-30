/**
 * Layer 0 constitution entries — seeded from approved docs; rarely change.
 */

export type ConstitutionCategory =
  | "mission"
  | "principles"
  | "product"
  | "brand"
  | "hiring"
  | "leadership"
  | "ai"
  | "clinical"
  | "security";

export type ConstitutionEntry = {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: ConstitutionCategory;
  halfLife: "forever" | number;
  confidence: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** User-facing names; internal schema may still say constitution / laws. */
export const KNOWLEDGE_LAYERS = [
  { layer: 0, name: "The Siya Way", hint: "Timeless principles — half-life: forever." },
  { layer: 1, name: "Policies & requirements", hint: "Company policy (HIPAA, PHI, leave…) — review cycles." },
  { layer: 2, name: "Knowledge", hint: "SOPs, playbooks, decisions — how to execute." },
  { layer: 3, name: "Memory", hint: "Captures — most never promoted." },
] as const;

export const PROMOTION_RULE =
  "Most things aren't worth promoting. Knowledge must earn permanence.";

export const ORPHAN_RULE =
  "No orphan knowledge: every promoted object needs a parent, child, or related link.";

/** Sole approver for Layer 0–2 promotion until a named Editor in Chief exists. */
export const KNOWLEDGE_STEWARD = "Founder (Knowledge Steward)";

export type KnowledgeHalfLife = "forever" | number;

export function parseHalfLife(raw: unknown): KnowledgeHalfLife {
  if (raw === "forever" || raw === null || raw === undefined) return "forever";
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  return "forever";
}

export function halfLifeReviewDue(createdAt: string, halfLife: KnowledgeHalfLife): boolean {
  if (halfLife === "forever") return false;
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / 86400000;
  return ageDays >= halfLife;
}

/** Seed slugs — idempotent upsert on API boot */
export const CONSTITUTION_SEED: {
  slug: string;
  title: string;
  body: string;
  category: ConstitutionCategory;
  sortOrder: number;
}[] = [
  {
    slug: "mission-ai-judgment",
    title: "Mission",
    body: "When someone leaves Siya, they should use AI responsibly to keep growing — personally and professionally. We build judgment: when to trust AI, when to verify, and how to amplify your own thinking.",
    category: "mission",
    sortOrder: 0,
  },
  {
    slug: "principle-never-ask-twice",
    title: "Never ask twice",
    body: "If an employee has to ask a teammate something answerable by company knowledge, documentation, or prior experience, SiyaOS has failed. Every gap becomes KB, training, routing, or documentation work.",
    category: "principles",
    sortOrder: 1,
  },
  {
    slug: "principle-growth-accountability",
    title: "Employees own growth. SiyaOS owns accountability.",
    body: "Employees choose goals. SiyaOS nudges with context — no guilt, no surveillance. Accountability means reminders tied to their stated goals.",
    category: "principles",
    sortOrder: 2,
  },
  {
    slug: "principle-outcomes-not-surveillance",
    title: "Optimize for outcomes, not surveillance",
    body: "Self-declared presence, not idle tracking. Coach learning and outcomes — never keyboard scores, webcams, or productivity theater.",
    category: "principles",
    sortOrder: 3,
  },
  {
    slug: "principle-earn-permanence",
    title: "Knowledge must earn permanence",
    body: "Most things aren't worth promoting. Capture is cheap; promotion is editorial. The Siya Way and Policies & requirements are rare; Memory is abundant.",
    category: "principles",
    sortOrder: 4,
  },
  {
    slug: "principle-no-orphans",
    title: "No orphan knowledge",
    body: "Every promoted object must connect: parent, children, or related. Graph value comes from connections, not volume.",
    category: "principles",
    sortOrder: 5,
  },
  {
    slug: "principle-ai-augments-judgment",
    title: "AI augments judgment",
    body: "AI drafts, retrieves, and reminds. Humans own clinical, legal, billing, and people decisions. Never treat a model answer as policy authority when Policies & requirements or an owner say otherwise.",
    category: "ai",
    sortOrder: 6,
  },
  {
    slug: "ai-coach-opt-in",
    title: "AI Coach is opt-in",
    body: "Long-term coaching memory only when the employee chooses yes. Otherwise Ask stays stateless with approved sources.",
    category: "ai",
    sortOrder: 10,
  },
];
