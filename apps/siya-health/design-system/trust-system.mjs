/**
 * Trust System — one source of truth for badges, metrics, and credibility signals.
 * Pages request a trust profile; they do not hand-pick copy per page.
 *
 * Patient/review volume figures come from data/homepage-trust-metrics.mjs
 * (homepage is canonical — do not invent alternate counts per page).
 */
import { getPageConversionConfig } from '../data/page-conversion-config.mjs';
import { HOMEPAGE_TRUST_METRICS as M } from '../data/homepage-trust-metrics.mjs';
import { PRICING } from '../data/site-standards.mjs';
import { detectUserIntent } from './conversion-system.mjs';
import { HIPAA_BADGE_PATH } from './hipaa-badge.mjs';

/** @typedef {'metric'|'badge'|'certification'|'review'|'editorial'} TrustItemType */

/**
 * Canonical trust items — ids are stable for analytics and render helpers.
 * @type {Record<string, {
 *   id: string,
 *   type: TrustItemType,
 *   headline: string,
 *   subline?: string,
 *   icon?: string,
 *   image?: string,
 *   imageAlt?: string,
 *   href?: string,
 * }>}
 */
export const TRUST_ITEMS = {
  patientCount: {
    id: 'patientCount',
    type: 'metric',
    headline: M.patientsTreated.value,
    subline: M.patientsTreated.label.toLowerCase(),
  },
  reviews: {
    id: 'reviews',
    type: 'review',
    headline: `${M.googleRating.value}${M.googleRating.suffix}`,
    subline: `${M.verifiedReviews.value} verified reviews`,
  },
  neurocognitiveEvaluations: {
    id: 'neurocognitiveEvaluations',
    type: 'metric',
    headline: M.neurocognitiveEvaluations.value,
    subline: M.neurocognitiveEvaluations.label,
  },
  googleReviews: {
    id: 'googleReviews',
    type: 'review',
    headline: M.googleReviews.value,
    subline: M.googleReviews.label,
  },
  transparentPricing: {
    id: 'transparentPricing',
    type: 'metric',
    headline: PRICING.initialEvaluation.display,
    subline: 'transparent evaluation',
  },
  boardCertified: {
    id: 'boardCertified',
    type: 'badge',
    headline: 'Licensed clinicians',
    subline: 'physician-led care team',
  },
  legitscript: {
    id: 'legitscript',
    type: 'certification',
    headline: 'LegitScript',
    subline: 'certified telehealth',
    image: 'https://static.legitscript.com/seals/46197681.png',
    imageAlt: 'LegitScript certified',
    href: 'https://www.legitscript.com/websites/?checker_keywords=siya.health',
  },
  hipaa: {
    id: 'hipaa',
    type: 'certification',
    headline: 'HIPAA',
    subline: 'compliant care',
    image: HIPAA_BADGE_PATH,
    imageAlt: 'HIPAA compliant',
  },
  telehealth: {
    id: 'telehealth',
    type: 'badge',
    headline: 'Online care',
    subline: 'California • TX • PA • FL',
  },
  creyos: {
    id: 'creyos',
    type: 'certification',
    headline: 'Creyos',
    subline: 'cognitive testing',
    image: '/assets/images/creyos-logo.png',
    imageAlt: 'Creyos cognitive testing',
  },
  doctorReviewed: {
    id: 'doctorReviewed',
    type: 'editorial',
    headline: 'Clinician-informed',
    subline: 'physician-reviewed guides',
  },
  medicalSources: {
    id: 'medicalSources',
    type: 'editorial',
    headline: 'Evidence-based',
    subline: 'medical sources cited',
  },
  secureChat: {
    id: 'secureChat',
    type: 'badge',
    headline: 'Secure chat',
    subline: 'HIPAA-compliant messaging',
  },
};

/** Trust profile → ordered item ids */
export const TRUST_PROFILES = {
  /** Hero strip shows first 4 scroll items — keep 2,700+ / 1,200+ / 4.9★ / states. */
  homepage: ['patientCount', 'neurocognitiveEvaluations', 'reviews', 'telehealth'],
  landing: ['boardCertified', 'patientCount', 'reviews', 'transparentPricing', 'telehealth'],
  'landing-adhd': ['reviews', 'patientCount', 'transparentPricing', 'telehealth'],
  adhd: ['reviews', 'patientCount', 'transparentPricing', 'creyos', 'hipaa'],
  blog: ['doctorReviewed', 'medicalSources', 'hipaa'],
  provider: ['boardCertified', 'legitscript', 'hipaa'],
  pricing: ['transparentPricing', 'patientCount', 'hipaa'],
  default: ['hipaa', 'legitscript', 'telehealth'],
};

const PROFILE_DETECTORS = [
  { profile: 'landing-adhd', test: (p) => p === 'adhd-evaluation-california.html' || p === 'adhd-evaluation-texas.html' },
  { profile: 'landing', test: (p) => /landing|\/lp\//.test(p) || /adhd-evaluation-(california|texas)/.test(p) },
  { profile: 'homepage', test: (p) => p === 'index.html' },
  {
    profile: 'adhd',
    test: (p) => /^adhd-/.test(p) || p === 'adult-adhd-diagnosis.html' || p === 'creyos-adhd-testing.html',
  },
  { profile: 'provider', test: (p) => p.startsWith('providers/') },
  { profile: 'blog', test: (p) => p.startsWith('blog/') || p.startsWith('answers/') },
  { profile: 'pricing', test: (p) => p === 'pricing.html' },
];

/**
 * @param {string} relPath
 * @param {keyof typeof TRUST_PROFILES} [profileOverride]
 */
export function detectTrustProfile(relPath, profileOverride) {
  if (profileOverride) return profileOverride;
  const pageConfig = getPageConversionConfig(relPath);
  if (pageConfig?.funnel === 'google-ads-adhd-ca') return 'landing-adhd';
  const hit = PROFILE_DETECTORS.find((d) => d.test(relPath));
  if (hit) return hit.profile;
  const intent = detectUserIntent(relPath);
  if (TRUST_PROFILES[intent]) return intent;
  return 'default';
}

/**
 * @param {string} relPath
 * @param {{ profile?: keyof typeof TRUST_PROFILES, limit?: number }} [opts]
 */
export function resolveTrust(relPath, opts = {}) {
  const profile = detectTrustProfile(relPath, opts.profile);
  const ids = TRUST_PROFILES[profile] ?? TRUST_PROFILES.default;
  const limited = opts.limit ? ids.slice(0, opts.limit) : ids;
  const items = limited.map((id) => TRUST_ITEMS[id]).filter(Boolean);
  return { profile, relPath, items };
}

/**
 * Map trust-system items to renderTrustSection props.
 * @param {{ items: Array<{ type?: string, headline: string, subline?: string }> }} trust
 */
export function trustToRenderProps(trust) {
  const scrollItems = trust.items
    .filter((i) => ['metric', 'review', 'badge'].includes(i.type))
    .map((i) => ({ strong: i.headline, text: i.subline ?? '' }));
  const badges = trust.items.filter((i) => i.type === 'badge').map((i) => i.headline);
  const metrics = trust.items
    .filter((i) => i.type === 'metric' || i.type === 'review')
    .map((i) => ({ value: i.headline, label: i.subline ?? '' }));
  return { scrollItems, badges, metrics };
}
