/**
 * Sitewide copy standards — states, footer, Health Guides naming.
 */
export const LICENSED_STATES = ['California', 'Texas', 'Pennsylvania', 'Florida'];

/** Display: California • Texas • Pennsylvania • Florida */
export const STATES_BULLET = LICENSED_STATES.join(' • ');

/** Prose: California, Texas, Pennsylvania, and Florida */
export const STATES_INLINE =
  'California, Texas, Pennsylvania, and Florida';

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
  'Board-certified providers providing telehealth care across California, Texas, Florida, and Pennsylvania.',
  'Board-certified providers providing telehealth care across California, California, Texas, Pennsylvania, and Florida.',
  'Modern telehealth care for ADHD, weight loss, and concierge primary care across California, California, Texas, Pennsylvania, and Florida.',
];

/** Canonical on-site legal URLs (replaces adhd.siya.health) */
export const LEGAL_LINKS = {
  privacy: '/privacy-policy',
  terms: '/terms',
  noticeOfPrivacy: '/privacy-policy',
};
