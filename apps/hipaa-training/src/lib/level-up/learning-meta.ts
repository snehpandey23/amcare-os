/** Governance fields for approved Level Up content (static JSON only). */

export type ContentStatus = "draft" | "review" | "live" | "archived";

export type LearningMeta = {
  status: ContentStatus;
  owner: string;
  reviewDate: string;
  difficulty?: "easy" | "medium" | "hard";
  category: string;
};

export function isLive(meta: LearningMeta): boolean {
  return meta.status === "live";
}
