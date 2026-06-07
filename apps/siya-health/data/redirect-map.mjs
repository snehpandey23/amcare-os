/**
 * Canonical internal path map — redirect sources → final on-site destinations.
 * Used by phase-7 link remediation and crawl validation. Resolves single-hop chains.
 */
import { PHASE1_REDIRECTS } from './content-consolidation-phase1.mjs';
import { REMOVED_BLOG_PATHS } from './site-standards.mjs';

/** @type {Record<string, string>} */
const RAW = {
  '/terms': '/legal/terms-of-use',
  '/privacy-policy': '/legal/privacy-policy',
  '/membership-pricing': '/pricing',
  '/mental-health-adhd': '/adhd-care',
  '/online-adhd-test': '/adhd-screening',
  '/adult-adhd-diagnosis': '/adhd-care',
  '/adhd-treatment-online': '/adhd-care',
  '/adhd-evaluation-cost': '/pricing',
  '/adhd-diagnosis-florida': '/adhd-care',
  '/blog/all': '/blog',
  '/blog/ambien-and-sleep-medications-risks-and-benefits': '/blog/insomnia-treatment-options-beyond-medication',
  '/blog/glutathione-and-peptides-what-do-they-actually-do': '/mens-health-longevity',
  '/blog/modafinil-for-focus-and-fatigue-is-it-safe': '/adhd-care',
  '/visual-components': '/',
  '/public': '/',
  '/terms-of-service': '/legal/terms-of-use',
  '/notice-of-privacy-practices': '/legal/notice-of-privacy-practices',
  '/blank': '/',
  '/book': '/book-appointment',
  '/discovery-call': '/book-appointment',
  '/meet-and-greet': '/book-appointment',
  ...PHASE1_REDIRECTS,
  ...REMOVED_BLOG_PATHS,
};

/** Paths that 301 to external URLs — exclude from sitemap; never use as internal link targets */
export const EXTERNAL_REDIRECT_SOURCES = new Set(['/siya-circle']);

/** HTML shells on disk whose URLs redirect elsewhere */
export const REDIRECT_SHELL_FILES = {
  'terms.html': '/legal/terms-of-use',
  'privacy-policy.html': '/legal/privacy-policy',
  'adult-adhd-diagnosis.html': '/adhd-care',
  'adhd-treatment-online.html': '/adhd-care',
  'adhd-diagnosis-florida.html': '/adhd-care',
  'adhd-evaluation-cost.html': '/pricing',
  'online-adhd-test.html': '/adhd-screening',
  'siya-circle.html': null,
};

/**
 * Resolve a path through redirect map to final on-site destination.
 * @param {string} path
 * @returns {string}
 */
export function resolveCanonicalPath(path) {
  let p = path;
  const seen = new Set();
  while (RAW[p] && !seen.has(p)) {
    seen.add(p);
    p = RAW[p];
  }
  return p;
}

/** Flat map: every redirect source → resolved final destination */
export const INTERNAL_LINK_CANONICAL = Object.fromEntries(
  Object.keys(RAW).map((src) => [src, resolveCanonicalPath(src)])
);

export const ALL_REDIRECT_SOURCES = new Set([...Object.keys(RAW), ...EXTERNAL_REDIRECT_SOURCES]);
