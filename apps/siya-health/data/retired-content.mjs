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
  '/adult-adhd-screening-california': {
    destination: '/adhd-evaluation-california',
    entity: 'adhd-evaluation-california',
    reason:
      'Google Ads CA screening LP retired 2026-08-16. Final Ads destination is the lean evaluation LP /adhd-evaluation-california (not the SEO hub /adult-adhd-california).',
  },
  '/adult-adhd-screening-texas': {
    destination: '/adhd-evaluation-texas',
    entity: 'adhd-evaluation-texas',
    reason:
      'Google Ads TX screening LP retired 2026-08-16. Final Ads destination is the lean evaluation LP /adhd-evaluation-texas.',
  },
  '/providers/derek-timbs': {
    destination: '/providers',
    entity: 'providers',
    reason:
      'Provider removed from public roster due to licensing issue (2026-09-01). Profile retired with permanent redirect to care team hub.',
  },
  '/adhd-diagnosis-florida': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'Thin Florida geo landing with no unique value (SITE-PRUNING-AUDIT). National ADHD care hub owns commercial intent; FL city content consolidated.',
  },
  '/adult-adhd-diagnosis': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'Legacy ADHD funnel duplicate splitting commercial intent with /adhd-care (SITE-PRUNING-AUDIT). Permanent redirect preserves equity on canonical service page.',
  },
  '/adhd-treatment-online': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'Legacy post-diagnosis treatment URL duplicating /adhd-care sections (SITE-PRUNING-AUDIT). Redirect rather than maintain parallel funnel.',
  },
  '/answers/weight-gain-after-stopping-ozempic': {
    destination: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
    entity: 'food-noise-and-glp-1',
    reason:
      'Ozempic cessation / GLP-1 rebound narrative owned by food-noise cornerstone blog (SITE-PRUNING-AUDIT). Guide retired; blog retains long-form depth.',
  },
  '/employers/california-pilot': {
    destination: '/employers',
    entity: 'employers',
    reason:
      'Removed 2026-09-30. The $50/$100 per-employee figures on this page were illustrative and are no longer accurate. Employer pricing is scoped per employer and is not a published rate.',
  },
  '/blog/insomnia-treatment-options-beyond-medication': {
    destination: '/guides/sleep#sl-insomnia',
    entity: 'sleep',
    reason:
      'Insomnia is a section of the sleep guide, not a standalone category. Retired 2026-10-01.',
  },
  '/blog/adhd-medication-online-california': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'Acquisition-style “get ADHD medication online” article. Permanent redirect to the service page. Retired 2026-10-01.',
  },
  '/blog/adhd-medication-options-california': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'California medication-options sibling of the online-acquisition cluster. Retired 2026-10-01.',
  },
  '/blog/online-adhd-diagnosis-california': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'California “online ADHD diagnosis” acquisition URL. Retired 2026-10-01.',
  },
  '/blog/online-adhd-diagnosis-texas': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'Texas “online ADHD diagnosis” acquisition URL. Retired 2026-10-01.',
  },
  '/blog/adhd-telehealth-california': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'California ADHD-telehealth acquisition sibling. Retired 2026-10-01.',
  },
};

export const RETIRED_CONTENT_STATS = {
  retiredPages: Object.keys(RETIRED_CONTENT_REDIRECTS).length,
};
