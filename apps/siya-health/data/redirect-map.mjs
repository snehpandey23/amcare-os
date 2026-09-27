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
  // EG-P0-01: garbled California 2026 ADHD article → CA cornerstone (canonical entity)
  '/blog/adult-adhd-treatment-california-2026': '/adult-adhd-california',
  '/answers/weight-gain-after-stopping-ozempic': '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  '/providers/derek-timbs': '/providers',
  '/blog/why-am-i-always-tired-causes-when-to-see-doctor': '/fatigue',
  '/adult-adhd-screening-california': '/adhd-evaluation-california',
  '/adult-adhd-screening-texas': '/adhd-evaluation-texas',
  '/blog/adhd-evaluation-cost-california': '/adult-adhd-california',
  '/adhd-diagnosis-pennsylvania': '/adhd-care',
  '/adhd-diagnosis-philadelphia': '/adhd-care',
  '/adhd-diagnosis-houston': '/adhd-diagnosis-texas',
  '/adhd-diagnosis-austin': '/adhd-diagnosis-texas',
  '/blog/adhd-treatment-philadelphia-pa': '/adhd-care',
  '/blog/adhd-treatment-orlando-fl': '/adhd-care',
  '/blog/adhd-treatment-miami-fl': '/adhd-care',
  '/blog/adhd-treatment-san-antonio-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-fort-worth-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-dallas-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-austin-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-houston-tx': '/blog/adhd-treatment-texas',
  '/blog/adhd-treatment-orange-county-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-oakland-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-sacramento-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-san-jose-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-san-francisco-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-san-diego-ca': '/adult-adhd-california',
  '/blog/adhd-treatment-los-angeles-ca': '/adult-adhd-california',
  '/answers/adhd-in-men': '/guides/mental-health-and-adhd#mh-signs',
  '/answers/weight-gain-after-stopping-ozempic': '/guides/weight#wt-food-noise',
  '/blog/iron-deficiency-brain-fog-adhd': '/guides/exhausted#ex-iron',
  '/blog/thyroid-and-fatigue': '/guides/exhausted#ex-thyroid',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview': '/guides/weight#wt-insulin',
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps': '/guides/weight#wt-food-noise',
  '/answers/food-noise-returned-on-glp-1': '/guides/weight#wt-glp1',
  '/answers/what-is-insulin-resistance': '/guides/weight#wt-insulin',
  '/answers/insulin-resistance-without-diabetes': '/guides/weight#wt-insulin',
  '/answers/normal-a1c-insulin-resistance': '/guides/weight#wt-insulin',
  '/answers/who-qualifies-glp-1-weight-loss': '/guides/weight#wt-glp1',
  '/blog/glp1-side-effects-and-how-to-manage-them': '/guides/weight#wt-glp1',
  '/answers/glp-1-side-effects': '/guides/weight#wt-glp1',
  '/answers/glp-1-nausea-management': '/guides/weight#wt-glp1',
  '/blog/how-to-know-if-you-have-adhd-adult': '/guides/mental-health-and-adhd#mh-signs',
  '/blog/adhd-symptoms-overlooked': '/guides/mental-health-and-adhd#mh-signs',
  '/blog/youre-not-lazy-signs-undiagnosed-adult-adhd': '/guides/mental-health-and-adhd#mh-signs',
  '/answers/signs-of-adult-adhd': '/guides/mental-health-and-adhd#mh-signs',
  '/answers/high-functioning-adhd': '/guides/mental-health-and-adhd#mh-signs',
  '/answers/late-adhd-diagnosis-adults': '/guides/mental-health-and-adhd#mh-signs',
  '/answers/asrs-adhd-screening-explained': '/guides/mental-health-and-adhd#mh-screen',
  '/answers/screening-vs-adhd-evaluation': '/guides/mental-health-and-adhd#mh-screen',
  '/blog/executive-dysfunction-adhd': '/guides/mental-health-and-adhd#mh-work',
  '/answers/executive-dysfunction-adhd': '/guides/mental-health-and-adhd#mh-work',
  '/answers/time-blindness-adhd': '/guides/mental-health-and-adhd#mh-work',
  '/answers/adhd-workplace-accommodations': '/guides/mental-health-and-adhd#mh-work',
  '/blog/adhd-accommodations-hr-primer': '/guides/mental-health-and-adhd#mh-work',
  '/answers/adhd-vs-burnout': '/guides/mental-health-and-adhd#mh-diff',
  '/answers/adhd-vs-anxiety': '/guides/mental-health-and-adhd#mh-diff',
  '/answers/can-adhd-cause-anxiety': '/guides/mental-health-and-adhd#mh-diff',
  '/blog/brain-fog-vs-adhd': '/guides/mental-health-and-adhd#mh-diff',
  '/blog/brain-fog-and-anxiety': '/guides/mental-health-and-adhd#mh-diff',
  '/answers/rejection-sensitivity-adhd': '/guides/mental-health-and-adhd#mh-diff',
  '/blog/adult-adhd-symptoms-california': '/adult-adhd-california',
  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': '/guides/sleep#sl-apnea',
  '/answers/signs-of-sleep-apnea-in-adults': '/guides/sleep#sl-apnea',
  '/answers/can-sleep-apnea-cause-fatigue': '/guides/sleep#sl-apnea',
  '/answers/poor-sleep-feels-like-adhd': '/guides/sleep#sl-focus',
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know': '/guides/hormonal-health#ho-free',
  '/answers/what-is-free-testosterone': '/guides/hormonal-health#ho-free',
  '/answers/high-shbg-low-free-testosterone': '/guides/hormonal-health#ho-free',
  '/answers/what-does-low-testosterone-feel-like': '/guides/hormonal-health#ho-symptoms',
  '/answers/testosterone-and-adhd-overlap': '/guides/hormonal-health#ho-symptoms',
  '/blog/when-is-testosterone-therapy-appropriate': '/guides/hormonal-health#ho-therapy',
  '/answers/when-is-testosterone-therapy-appropriate': '/guides/hormonal-health#ho-therapy',
  '/blog/adhd-hormones-women': '/guides/hormonal-health#ho-women',
  '/blog/adhd-in-women': '/guides/hormonal-health#ho-women',
  '/answers/adhd-in-women': '/guides/hormonal-health#ho-women',
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
export const EXTERNAL_REDIRECT_SOURCES = new Set([]);

/** HTML shells on disk whose URLs redirect elsewhere */
export const REDIRECT_SHELL_FILES = {
  'terms.html': '/legal/terms-of-use',
  'privacy-policy.html': '/legal/privacy-policy',
  'adult-adhd-diagnosis.html': '/adhd-care',
  'adhd-treatment-online.html': '/adhd-care',
  'adhd-diagnosis-florida.html': '/adhd-care',
  'adhd-evaluation-cost.html': '/pricing',
  'online-adhd-test.html': '/adhd-screening',
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
