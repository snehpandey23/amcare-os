/**
 * Content Consolidation Phase 1 — Scenario A (Section 1 + Section 2).
 * Consumed by scripts/apply-content-consolidation-phase1.mjs
 */

/** @typedef {{ source: string, target: string, action: 'redirect' | 'merge' }} ConsolidationAction */

/** All 301 redirects: source path (no domain) → destination path */
export const PHASE1_REDIRECTS = {
  '/answers/adhd-in-men': '/answers/signs-of-adult-adhd',
  '/answers/creyos-adhd-testing-explained': '/creyos-adhd-testing',
  '/blog/adhd-evaluation-cost-california': '/blog/adhd-evaluation-cost-texas',
  '/blog/after-adhd-diagnosis-next-steps-adults': '/answers/starting-adhd-medication-adults',
  '/answers/phentermine-weight-loss-safety': '/blog/phentermine-for-weight-loss-safety-and-effectiveness',
  '/answers/oral-vs-injectable-weight-loss-meds': '/blog/oral-vs-injectable-weight-loss-medications',
  '/answers/non-stimulant-adhd-medications': '/blog/non-stimulant-adhd-medications-explained',
  '/answers/tirzepatide-vs-semaglutide': '/blog/tirzepatide-vs-semaglutide-which-is-better',
  '/answers/minoxidil-hair-loss-does-it-work': '/blog/minoxidil-for-hair-loss-does-it-work',
  '/answers/sildenafil-erectile-dysfunction-expectations': '/blog/sildenafil-for-erectile-dysfunction-what-to-expect',
  '/blog/combining-adhd-treatment-and-weight-loss-strategies': '/answers/adhd-and-weight-loss-connection',
  '/blog/focalin-vs-adderall-comparison': '/blog/vyvanse-vs-adderall-differences',
  '/blog/long-term-weight-loss-medications-what-to-expect': '/blog/semaglutide-for-weight-loss-how-it-works',
  '/blog/adderall-ir-vs-xr-adults': '/blog/vyvanse-vs-adderall-differences',
  '/blog/adhd-treatment-houston-online': '/blog/online-adhd-diagnosis-texas',
  '/blog/adhd-medication-online-texas-telehealth': '/blog/online-adhd-diagnosis-texas',
};

/** Guide slugs removed from answer-seeds (redirect targets absorb equity) */
export const RETIRED_GUIDE_SLUGS = new Set([
  'adhd-in-men',
  'creyos-adhd-testing-explained',
  'phentermine-weight-loss-safety',
  'oral-vs-injectable-weight-loss-meds',
  'non-stimulant-adhd-medications',
  'tirzepatide-vs-semaglutide',
  'minoxidil-hair-loss-does-it-work',
  'sildenafil-erectile-dysfunction-expectations',
]);

/** Blog HTML filenames removed from blog/ */
export const RETIRED_BLOG_SLUGS = new Set([
  'after-adhd-diagnosis-next-steps-adults',
  'adhd-evaluation-cost-california',
  'combining-adhd-treatment-and-weight-loss-strategies',
  'focalin-vs-adderall-comparison',
  'long-term-weight-loss-medications-what-to-expect',
  'adderall-ir-vs-xr-adults',
  'adhd-treatment-houston-online',
  'adhd-medication-online-texas-telehealth',
]);

export const PHASE1_ACTIONS = Object.entries(PHASE1_REDIRECTS).map(([source, target]) => ({
  source,
  target,
  action: [
    '/blog/after-adhd-diagnosis-next-steps-adults',
    '/answers/non-stimulant-adhd-medications',
    '/answers/tirzepatide-vs-semaglutide',
    '/answers/minoxidil-hair-loss-does-it-work',
    '/answers/sildenafil-erectile-dysfunction-expectations',
  ].includes(source)
    ? 'merge'
    : 'redirect',
}));
