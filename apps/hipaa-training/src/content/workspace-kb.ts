import { GENERATED_WORKSPACE_KB } from "./workspace-kb.generated";
import type { WorkspaceKbEntry } from "./workspace-kb.types";

/** Company memory index — compiled from docs/siyaos-knowledge-base (npm run kb:build). */
export type { KbCategory, WorkspaceKbEntry } from "./workspace-kb.types";

export const WORKSPACE_KB: WorkspaceKbEntry[] = GENERATED_WORKSPACE_KB;
