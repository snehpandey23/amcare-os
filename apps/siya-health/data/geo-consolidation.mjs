/**
 * Geo consolidation map — Assembly gate recovery (Governance v1.0).
 *
 * Decision rule: retain a city/metro page only when it has defensible unique value
 * (local demand, local care info, different regulation/availability, local providers,
 * or distinct navigation value). Mail-merge city-name swaps do NOT qualify.
 *
 * Retained state owners:
 *   TX treatment  → /blog/adhd-treatment-texas
 *   TX diagnosis  → /adhd-diagnosis-texas
 *   CA screening  → /adult-adhd-screening-california (product page, not a city clone)
 *   National care → /adhd-care
 *
 * CA cornerstone LIVE: /adult-adhd-california is the canonical California ADHD
 * entity. California city treatment clones now redirect to it (single canonical).
 */

/** @type {Record<string, string>} source path → permanent destination */
export const GEO_CLONE_REDIRECTS = {
  // California city treatment clones → California ADHD cornerstone (canonical entity)
  '/blog/adhd-treatment-los-angeles-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-san-diego-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-san-francisco-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-san-jose-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-sacramento-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-oakland-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-orange-county-ca': '/adult-adhd-california',
  // CA-specific retired / consolidated → cornerstone (not /adhd-care)
  '/blog/adult-adhd-treatment-california-2026': '/adult-adhd-california',
  '/blog/adhd-evaluation-cost-california': '/adult-adhd-california',

  // Texas city treatment clones → statewide TX treatment owner
  '/blog/adhd-treatment-houston-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-austin-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-dallas-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-fort-worth-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-san-antonio-tx': '/blog/adhd-treatment-texas',

  // Florida / Pennsylvania city treatment clones → national care
  '/blog/adhd-treatment-miami-fl': '/adhd-care',
  '/blog/adhd-treatment-orlando-fl': '/adhd-care',
  '/blog/adhd-treatment-philadelphia-pa': '/adhd-care',

  // Root diagnosis metros / thin state pages (SITE-PRUNING-AUDIT)
  '/adhd-diagnosis-austin': '/adhd-diagnosis-texas',
  '/adhd-diagnosis-houston': '/adhd-diagnosis-texas',
  '/adhd-diagnosis-philadelphia': '/adhd-care',
  '/adhd-diagnosis-pennsylvania': '/adhd-care',
  // florida already in redirect-map → /adhd-care
};

/** State / product pages we keep (not stubs). */
export const GEO_RETAINED = [
  '/blog/adhd-treatment-texas',
  '/adhd-diagnosis-texas',
  '/adult-adhd-screening-california',
  '/adhd-care',
  '/blog/online-adhd-diagnosis-california',
  '/blog/adhd-telehealth-california',
  '/blog/adhd-medication-options-california',
  '/blog/online-adhd-diagnosis-texas',
];

export const GEO_CLONE_STATS = {
  redirected: Object.keys(GEO_CLONE_REDIRECTS).length,
  retained: GEO_RETAINED.length,
  consolidatedInto: [...new Set(Object.values(GEO_CLONE_REDIRECTS))],
};
