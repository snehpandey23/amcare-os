/**
 * Sitewide copy standards — states, footer, Health Guides naming.
 */
export const LICENSED_STATES = ['California', 'Texas', 'Florida', 'Pennsylvania'];

/** Display: California • Texas • Florida • Pennsylvania */
export const STATES_BULLET = LICENSED_STATES.join(' • ');

/** Prose: California, Texas, Florida, and Pennsylvania */
export const STATES_INLINE =
  'California, Texas, Florida, and Pennsylvania';

export const FOOTER_STATES_LINE = `Board-certified providers providing telehealth care across ${STATES_INLINE}.`;

/** Approved user-facing copy — applied via normalizeSitewideCopy() */
export const COPY_STANDARDS = {
  primaryCta: 'Book a Meet & Greet',
  secondaryCta: 'Explore Care Options',
  adhdPrimaryCta: 'Book ADHD Evaluation',
  adhdSecondaryCta: 'Start Free Screening',
  educationHub: 'Health Guides',
  reviewBadgePending: 'Pending physician review',
  reviewBadgeReviewed: 'Physician reviewed',
};

/** Legacy footer strings to replace during seo-build */
export const LEGACY_FOOTER_PATTERNS = [
  'Board-certified providers providing telehealth care across Texas, Pennsylvania, and Florida.',
  'Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida.',
];
