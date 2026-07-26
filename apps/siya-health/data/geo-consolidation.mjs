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
 * Deferred P1: /adult-adhd-california cornerstone will absorb CA commercial intent;
 * until then CA city treatment clones redirect to /adhd-care.
 */

/** @type {Record<string, string>} source path → permanent destination */
export const GEO_CLONE_REDIRECTS = {
  // California city treatment clones → national ADHD care (cornerstone deferred)
  '/blog/adhd-treatment-los-angeles-ca': '/adhd-care',
  '/blog/adhd-treatment-san-diego-ca': '/adhd-care',
  '/blog/adhd-treatment-san-francisco-ca': '/adhd-care',
  '/blog/adhd-treatment-san-jose-ca': '/adhd-care',
  '/blog/adhd-treatment-sacramento-ca': '/adhd-care',
  '/blog/adhd-treatment-oakland-ca': '/adhd-care',
  '/blog/adhd-treatment-orange-county-ca': '/adhd-care',

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
