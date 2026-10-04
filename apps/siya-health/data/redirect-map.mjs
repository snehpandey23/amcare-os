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
  '/blog/ambien-and-sleep-medications-risks-and-benefits': '/guides/sleep#sl-insomnia',
  '/blog/glutathione-and-peptides-what-do-they-actually-do': '/mens-health-longevity',
  // EG-P0-01: garbled California 2026 ADHD article → CA cornerstone (canonical entity)
  '/blog/adult-adhd-treatment-california-2026': '/adult-adhd-california',
  '/blog/vyvanse-vs-adderall-differences': '/guides/mental-health-and-adhd#mh-screen',
  '/blog/tirzepatide-vs-semaglutide-which-is-better': '/guides/weight#wt-glp1',
  '/blog/sleep-and-focus-at-work': '/guides/sleep#sl-focus',
  '/blog/semaglutide-for-weight-loss-how-it-works': '/guides/weight#wt-glp1',
  '/blog/pots-and-adhd': '/guides/mental-health-and-adhd#mh-diff',
  '/blog/phentermine-for-weight-loss-safety-and-effectiveness': '/guides/weight#wt-opener',
  '/blog/perimenopause-brain-fog': '/guides/perimenopause#pe-mood',
  '/blog/oral-vs-topical-minoxidil-which-is-right': '/guides/testosterone#te-opener',
  '/blog/oral-vs-injectable-weight-loss-medications': '/guides/weight#wt-glp1',
  '/blog/non-stimulant-adhd-medications-explained': '/guides/mental-health-and-adhd#mh-screen',
  '/blog/morning-fatigue': '/guides/exhausted#ex-sleep-link',
  '/blog/minoxidil-for-hair-loss-does-it-work': '/guides/testosterone#te-opener',
  '/blog/medical-weight-loss-vs-dieting-what-actually-works': '/guides/weight#wt-opener',
  '/blog/is-adhd-medication-safe-long-term': '/guides/mental-health-and-adhd#mh-screen',
  '/blog/iron-deficiency-and-fatigue': '/guides/exhausted#ex-iron',
  '/blog/how-mental-health-affects-weight-loss-outcomes': '/guides/weight#wt-opener',
  '/blog/fatigue-despite-normal-labs': '/guides/exhausted#ex-iron',
  '/blog/fatigue-after-illness': '/guides/exhausted#ex-opener',
  '/blog/compounded-vs-branded-glp1-medications': '/guides/weight#wt-glp1',
  '/blog/chronic-fatigue-vs-everyday-tiredness': '/guides/exhausted#ex-opener',
  '/blog/chronic-fatigue-and-work-performance': '/guides/exhausted#ex-opener',
  '/blog/brain-fog-at-work': '/guides/exhausted#ex-opener',
  '/blog/brain-fog-and-sleep': '/guides/sleep#sl-focus',
  '/blog/brain-fog-after-covid': '/guides/exhausted#ex-opener',
  '/blog/adhd-medication-side-effects-what-to-expect': '/guides/mental-health-and-adhd#mh-screen',
  '/blog/adhd-medication-options-for-adults': '/guides/mental-health-and-adhd#mh-screen',
  '/blog/adhd-medication-daily-or-as-needed-adults': '/guides/mental-health-and-adhd#mh-work',
  '/blog/adhd-brain-imaging-subtypes': '/guides/mental-health-and-adhd#mh-signs',
  '/blog/adderall-for-adhd-how-it-works': '/guides/mental-health-and-adhd#mh-screen',
  '/answers/why-normal-labs-dont-mean-healthy': '/guides/exhausted#ex-opener',
  '/answers/why-am-i-tired-even-after-sleeping': '/guides/exhausted#ex-sleep-link',
  '/answers/what-is-food-noise': '/guides/weight#wt-food-noise',
  '/answers/trt-monitoring-requirements': '/guides/testosterone#te-therapy',
  '/answers/starting-adhd-medication-adults': '/guides/mental-health-and-adhd#mh-work',
  '/answers/semaglutide-weight-loss-how-it-works': '/guides/weight#wt-glp1',
  '/answers/oral-vs-topical-minoxidil': '/guides/testosterone#te-opener',
  '/answers/medical-weight-loss-vs-dieting': '/guides/weight#wt-opener',
  '/answers/is-adhd-medication-safe-long-term': '/guides/mental-health-and-adhd#mh-screen',
  '/answers/compounded-vs-branded-glp-1': '/guides/weight#wt-glp1',
  '/answers/brain-fog-after-eating': '/guides/weight#wt-insulin',
  '/answers/afternoon-energy-crash-after-lunch': '/guides/exhausted#ex-opener',
  '/answers/adhd-medication-side-effects': '/guides/mental-health-and-adhd#mh-screen',
  '/answers/adhd-medication-every-day': '/guides/mental-health-and-adhd#mh-work',
  '/answers/adderall-vs-vyvanse-adults': '/guides/mental-health-and-adhd#mh-screen',
  '/blog/adhd-telehealth-california': '/adhd-care',
  '/blog/adhd-treatment-texas': '/adhd-diagnosis-texas',
  '/blog/online-adhd-diagnosis-texas': '/adhd-care',
  '/blog/online-adhd-diagnosis-california': '/adhd-care',
  '/blog/adhd-medication-options-california': '/adhd-care',
  '/blog/adhd-medication-online-california': '/adhd-care',
  '/blog/insomnia-treatment-options-beyond-medication': '/guides/sleep#sl-insomnia',
  '/employers/california-pilot': '/employers',
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
  '/blog/adhd-treatment-san-antonio-tx': '/adhd-diagnosis-texas',
  '/blog/adhd-treatment-fort-worth-tx': '/adhd-diagnosis-texas',
  '/blog/adhd-treatment-dallas-tx': '/adhd-diagnosis-texas',
  '/blog/adhd-treatment-austin-tx': '/adhd-diagnosis-texas',
  '/blog/adhd-treatment-houston-tx': '/adhd-diagnosis-texas',
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
  '/answers/food-noise-returned-on-glp-1': '/guides/weight#wt-food-noise',
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

  '/answers/adhd-vs-burnout': '/guides/mental-health-and-adhd#mh-diff',
  '/answers/adhd-vs-anxiety': '/guides/mental-health-and-adhd#mh-diff',
  '/answers/can-adhd-cause-anxiety': '/guides/mental-health-and-adhd#mh-diff',
  '/blog/brain-fog-vs-adhd': '/guides/mental-health-and-adhd#mh-diff',
  '/blog/brain-fog-and-anxiety': '/guides/mental-health-and-adhd#mh-diff',
  '/answers/rejection-sensitivity-adhd': '/guides/mental-health-and-adhd#mh-signs',

  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': '/guides/sleep#sl-apnea',
  '/answers/signs-of-sleep-apnea-in-adults': '/guides/sleep#sl-apnea',
  '/answers/can-sleep-apnea-cause-fatigue': '/guides/sleep#sl-apnea',
  '/answers/poor-sleep-feels-like-adhd': '/guides/sleep#sl-focus',
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know': '/guides/testosterone#te-free',
  '/answers/what-is-free-testosterone': '/guides/testosterone#te-free',
  '/answers/high-shbg-low-free-testosterone': '/guides/testosterone#te-free',
  '/answers/what-does-low-testosterone-feel-like': '/guides/testosterone#te-symptoms',
  '/answers/testosterone-and-adhd-overlap': '/guides/testosterone#te-opener',
  '/blog/when-is-testosterone-therapy-appropriate': '/guides/testosterone#te-therapy',
  '/answers/when-is-testosterone-therapy-appropriate': '/guides/testosterone#te-therapy',
  '/blog/adhd-hormones-women': '/guides/perimenopause#pe-opener',
  '/blog/adhd-in-women': '/guides/perimenopause#pe-opener',
  '/answers/adhd-in-women': '/guides/perimenopause#pe-opener',

  '/blog/adhd-and-binge-eating': '/guides/weight#wt-food-noise',
  '/answers/adhd-and-weight-loss-connection': '/guides/weight#wt-opener',
  '/labs/fatigue-brain-fog': '/labs#labs-fatigue',
  '/labs/preventive': '/labs#labs-preventive',
  '/labs/adhd-support': '/labs#labs-adhd',
  '/labs/womens-midlife': '/labs#labs-womens',
  '/labs/mens-health': '/labs#labs-mens',
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
