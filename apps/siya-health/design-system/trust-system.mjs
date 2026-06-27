/**
 * Trust System — one source of truth for badges, metrics, and credibility signals.
 * Pages request a trust profile; they do not hand-pick copy per page.
 */
import { getPageConversionConfig } from '../data/page-conversion-config.mjs';
import { detectUserIntent } from './conversion-system.mjs';

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
    headline: '750+',
    subline: 'ADHD evaluations completed',
  },
  reviews: {
    id: 'reviews',
    type: 'review',
    headline: '4.7★',
    subline: '450+ verified reviews',
  },
  transparentPricing: {
    id: 'transparentPricing',
    type: 'metric',
    headline: '$199',
    subline: 'transparent evaluation',
  },
  boardCertified: {
    id: 'boardCertified',
    type: 'badge',
    headline: 'Board-certified',
    subline: 'licensed clinicians',
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
    image: '/assets/images/hipaa-compliant.png',
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
  homepage: ['patientCount', 'legitscript', 'reviews', 'hipaa', 'telehealth'],
  landing: ['boardCertified', 'patientCount', 'reviews', 'transparentPricing', 'telehealth'],
  'landing-adhd': ['reviews', 'patientCount', 'transparentPricing', 'telehealth'],
  adhd: ['reviews', 'patientCount', 'transparentPricing', 'creyos', 'hipaa'],
  blog: ['doctorReviewed', 'medicalSources', 'hipaa'],
  provider: ['boardCertified', 'legitscript', 'hipaa'],
  pricing: ['transparentPricing', 'patientCount', 'hipaa'],
  default: ['hipaa', 'legitscript', 'telehealth'],
};

const PROFILE_DETECTORS = [
  { profile: 'landing-adhd', test: (p) => p === 'adult-adhd-screening-california.html' },
  { profile: 'landing', test: (p) => /landing|\/lp\//.test(p) || p.includes('screening-california') },
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
