/** Categories align with SiyaOS KB modules (see docs/siyaos-knowledge-base/manifest.json). */
export type KbCategory = string;

export interface WorkspaceKbEntry {
  id: string;
  category: KbCategory;
  title: string;
  keywords: string[];
  body: string;
  links?: { label: string; href: string }[];
  escalate?: string;
}
