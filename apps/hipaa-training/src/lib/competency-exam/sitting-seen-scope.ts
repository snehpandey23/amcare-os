/**
 * Sitting-scoped seen for monthly competency draws.
 * Server persistence: siya_competency_seen (auth API).
 * Pure helpers mirror integrations/hipaa-training-api/src/competency-exam-sitting-core.ts
 */
import type { SeenEntry } from "./seen-set";

/** Isolated founder review — must not share seen with monthly sittings. */
export const ISOLATED_REVIEW_SITTING_ID = "isolated-review";

/** Legacy localStorage seen rows without sittingId — treat as global pre-migration only. */
export const LEGACY_GLOBAL_SITTING_ID = "legacy-global";

export function filterSeenForSittingDraw(
  entries: SeenEntry[],
  sittingId: string,
  poolKey: string,
): SeenEntry[] {
  return entries.filter((e) => {
    const scope = e.sittingId ?? LEGACY_GLOBAL_SITTING_ID;
    if (scope !== sittingId) return false;
    return e.pool === poolKey;
  });
}

export function toSeenEntriesForDraw(scoped: SeenEntry[]): SeenEntry[] {
  return scoped.map(({ pool, id, attemptId, at, repeated }) => ({
    pool,
    id,
    attemptId,
    at,
    repeated,
  }));
}
