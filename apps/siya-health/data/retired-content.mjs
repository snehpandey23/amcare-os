/**
 * Retired content — pages superseded by a Canonical Entity Page.
 *
 * Distinct from geo-consolidation.mjs (city clones with no unique value).
 * These are pages that DID have value; the value moved to a canonical entity, so
 * the old URL hands its equity over with a permanent redirect rather than being
 * "upgraded" in place. Never merge two architectures — redirect one into the other.
 *
 * Governance: every entry must state which entity superseded it and why.
 * Consumed by: scripts/retire-pages.mjs (stub + vercel + redirect-map registration)
 */

/** @type {Record<string, { destination: string, entity: string, reason: string }>} */
export const RETIRED_CONTENT_REDIRECTS = {
  '/blog/why-am-i-always-tired-causes-when-to-see-doctor': {
    destination: '/fatigue',
    entity: 'fatigue',
    reason:
      'Fatigue cluster cornerstone (3,386 words, established ranking history) superseded by the /fatigue Canonical Entity Page on 2026-07-26. Redirected rather than rewritten: the blog architecture and the entity architecture should not be merged.',
  },
};

export const RETIRED_CONTENT_STATS = {
  retiredPages: Object.keys(RETIRED_CONTENT_REDIRECTS).length,
};
