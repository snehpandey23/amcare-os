/**
 * Conversion System — resolves CTAs by user intent and page config, not ad-hoc page logic.
 * Pages declare goals in data/page-conversion-config.mjs; unlisted pages use intent detection.
 */
import { getPageConversionConfig } from '../data/page-conversion-config.mjs';
import { CTA_SLOTS, ctaTrackingAttrs } from './cta-system.mjs';

/** @typedef {'meetGreet'|'secureChat'|'consultation'|'screening'|'newsletter'|'bookDemo'|'exploreCare'|'viewPricing'|'zocdoc'} ConversionGoal */

/** Conversion goal → default CTA slot id */
export const CONVERSION_GOAL_SLOTS = {
  meetGreet: 'meetGreet',
  secureChat: 'secureChat',
  consultation: 'meetGreet',
  screening: 'leadMagnet',
  newsletter: 'newsletter',
  bookDemo: 'bookDemo',
  exploreCare: 'exploreCare',
  viewPricing: 'viewPricing',
  zocdoc: 'zocdoc',
};

/**
 * Intent-based defaults when no page config exists.
 */
export const USER_INTENT_RULES = {
  homepage: { intent: 'homepage', primaryGoal: 'meetGreet', secondaryGoal: 'secureChat' },
  adhd: { intent: 'adhd', primaryGoal: 'screening', secondaryGoal: 'meetGreet' },
  blog: { intent: 'blog', primaryGoal: 'meetGreet', secondaryGoal: 'newsletter' },
  provider: { intent: 'provider', primaryGoal: 'meetGreet', secondaryGoal: 'zocdoc' },
  pricing: { intent: 'pricing', primaryGoal: 'meetGreet', secondaryGoal: 'exploreCare' },
  hormones: { intent: 'hormones', primaryGoal: 'meetGreet', secondaryGoal: 'viewPricing' },
  weight: { intent: 'weight', primaryGoal: 'meetGreet', secondaryGoal: 'viewPricing' },
  telehealth: { intent: 'telehealth', primaryGoal: 'meetGreet', secondaryGoal: 'exploreCare' },
  employer: { intent: 'employer', primaryGoal: 'bookDemo', secondaryGoal: 'secureChat' },
  landing: { intent: 'landing', primaryGoal: null, secondaryGoal: null },
  default: { intent: 'default', primaryGoal: 'meetGreet', secondaryGoal: 'exploreCare' },
};

/** Custom slot for employer / demo flows (Pass 2 wiring) */
CTA_SLOTS.bookDemo = {
  id: 'bookDemo',
  label: 'Book a Demo',
  url: 'mailto:care@siya.health?subject=Employer%20Health%20Demo',
  external: false,
  track: 'book-demo-click',
};

const INTENT_DETECTORS = [
  { intent: 'homepage', test: (p) => p === 'index.html' },
  {
    intent: 'adhd',
    test: (p) =>
      /^adhd-/.test(p) ||
      p === 'adult-adhd-diagnosis.html' ||
      p === 'adult-adhd-california.html' ||
      p === 'creyos-adhd-testing.html' ||
      p === 'online-adhd-test.html' ||
      (/^blog\//.test(p) && /adhd/i.test(p)),
  },
  { intent: 'pricing', test: (p) => p === 'pricing.html' || p === 'membership-pricing.html' },
  {
    intent: 'hormones',
    test: (p) =>
      p === 'mens-health-longevity.html' ||
      p === 'womens-health.html' ||
      /testosterone|hormone|mens-health|womens-health|pcos/i.test(p),
  },
  {
    intent: 'weight',
    test: (p) =>
      p === 'weight-loss-metabolic-health.html' ||
      (/^blog\//.test(p) && /weight|glp|semaglutide|tirzepatide|metabolic/i.test(p)),
  },
  { intent: 'telehealth', test: (p) => p === 'telehealth.html' || /^blog\/telehealth/.test(p) },
  { intent: 'employer', test: (p) => /employer|workplace/i.test(p) },
  { intent: 'provider', test: (p) => p.startsWith('providers/') },
  { intent: 'blog', test: (p) => p.startsWith('blog/') || p.startsWith('answers/') },
  {
    intent: 'landing',
    test: (p) =>
      p.includes('landing') ||
      p.startsWith('lp/') ||
      p === 'adult-adhd-screening-california.html',
  },
];

/**
 * @param {string} relPath
 * @returns {keyof typeof USER_INTENT_RULES}
 */
export function detectUserIntent(relPath) {
  const pageConfig = getPageConversionConfig(relPath);
  if (pageConfig?.intent && USER_INTENT_RULES[pageConfig.intent]) {
    return pageConfig.intent;
  }
  const hit = INTENT_DETECTORS.find((d) => d.test(relPath));
  return hit?.intent ?? 'default';
}

function goalToSlot(goal) {
  if (!goal) return null;
  const slotId = CONVERSION_GOAL_SLOTS[goal];
  return slotId ? CTA_SLOTS[slotId] ?? null : null;
}

function slotById(id) {
  if (!id) return null;
  return CTA_SLOTS[id] ?? null;
}

/**
 * Resolve conversion pairing for a page path.
 * @param {string} relPath
 * @param {{ primarySlot?: string, secondarySlot?: string | null, conversionGoal?: ConversionGoal }} [overrides]
 */
export function resolveConversion(relPath, overrides = {}) {
  const pageConfig = getPageConversionConfig(relPath);
  const intentKey = detectUserIntent(relPath);
  const intentRules = USER_INTENT_RULES[intentKey] ?? USER_INTENT_RULES.default;

  const conversionGoal =
    overrides.conversionGoal ?? pageConfig?.conversionGoal ?? intentRules.primaryGoal;

  let primarySlot =
    overrides.primarySlot ??
    pageConfig?.primarySlot ??
    (conversionGoal ? CONVERSION_GOAL_SLOTS[conversionGoal] : null);

  let secondarySlot =
    overrides.secondarySlot !== undefined
      ? overrides.secondarySlot
      : pageConfig?.secondarySlot !== undefined
        ? pageConfig.secondarySlot
        : intentRules.secondaryGoal
          ? CONVERSION_GOAL_SLOTS[intentRules.secondaryGoal]
          : null;

  if (primarySlot === secondarySlot) secondarySlot = null;

  const primary = slotById(primarySlot) ?? goalToSlot(conversionGoal);
  let secondary = slotById(secondarySlot) ?? goalToSlot(intentRules.secondaryGoal);

  /** On telehealth hub, secondary Explore Care Options → Health Guides hub */
  if (relPath === 'telehealth.html' && secondary?.id === 'exploreCare') {
    secondary = { ...secondary, url: '/answers' };
  }

  return {
    relPath,
    intent: pageConfig?.intent ?? intentKey,
    conversionGoal,
    funnel: pageConfig?.funnel ?? null,
    pageType: intentKey,
    primary,
    secondary,
    additionalCtas: pageConfig?.additionalCtas ?? [],
    config: pageConfig,
  };
}

export function isAdhdFunnelPath(relPath) {
  if (relPath === 'adult-adhd-screening-california.html') return true;
  if (relPath === 'adhd-screening-results.html') return true;
  return detectUserIntent(relPath) === 'adhd';
}

const ADHD_SCREENING_NAV_PAGES = new Set([
  'adhd-care.html',
  'adhd-screening.html',
  'adult-adhd-screening-california.html',
  'adult-adhd-california.html',
]);

/**
 * Nav CTA slot — ADHD cornerstone → screening; results → meet & greet; else primary.
 * @param {string} relPath
 */
export function resolveNavCtaSlot(relPath) {
  if (relPath.startsWith('answers/')) return null;
  if (relPath === 'index.html') return CTA_SLOTS.meetGreet;
  if (relPath === 'adhd-screening-results.html') return CTA_SLOTS.meetGreet;
  if (ADHD_SCREENING_NAV_PAGES.has(relPath)) return CTA_SLOTS.leadMagnet;
  if (isAdhdFunnelPath(relPath)) return CTA_SLOTS.meetGreet;
  return resolveConversion(relPath).primary;
}

/** Map abstract page types (generators) → representative paths for intent resolution */
const PAGE_TYPE_PATH = {
  homepage: 'index.html',
  adhd: 'adhd-care.html',
  blog: 'blog/index.html',
  provider: 'providers/index.html',
  landing: 'adult-adhd-screening-california.html',
  pricing: 'pricing.html',
  hormones: 'mens-health-longevity.html',
  weight: 'weight-loss-metabolic-health.html',
};

/**
 * Resolve CTAs by abstract page type (for generators / render helpers).
 * @param {string} pageType
 * @param {object} [overrides]
 */
export function resolvePageCtas(pageType, overrides = {}) {
  const relPath = PAGE_TYPE_PATH[pageType] ?? 'index.html';
  const result = resolveConversion(relPath, overrides);
  return {
    primary: result.primary,
    secondary: result.secondary,
    pageType: result.pageType,
    conversionGoal: result.conversionGoal,
  };
}

/** @deprecated Use resolveConversion — kept for Pass 1 import compatibility */
export function resolveCtasForPath(relPath, overrides = {}) {
  const result = resolveConversion(relPath, overrides);
  return {
    primary: result.primary,
    secondary: result.secondary,
    pageType: result.pageType,
  };
}

export { ctaTrackingAttrs, CTA_SLOTS };
