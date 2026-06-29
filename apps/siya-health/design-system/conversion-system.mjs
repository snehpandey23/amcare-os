/**
 * Conversion System — resolves CTAs by user intent and page config, not ad-hoc page logic.
 * Pages declare goals in data/page-conversion-config.mjs; unlisted pages use intent detection.
 */
import { getPageConversionConfig } from '../data/page-conversion-config.mjs';
import { CTA_SLOTS, ctaTrackingAttrs } from './cta-system.mjs';

/** @typedef {'secureChat'|'consultation'|'screening'|'newsletter'|'bookDemo'} ConversionGoal */

/** Conversion goal → default CTA slot id */
export const CONVERSION_GOAL_SLOTS = {
  secureChat: 'primary',
  consultation: 'secondary',
  screening: 'leadMagnet',
  newsletter: 'newsletter',
  bookDemo: 'bookDemo',
};

/** Intent-based defaults when no page config exists */
export const USER_INTENT_RULES = {
  homepage: { intent: 'homepage', primaryGoal: 'secureChat', secondaryGoal: 'consultation' },
  adhd: { intent: 'adhd', primaryGoal: 'screening', secondaryGoal: 'secureChat' },
  blog: { intent: 'blog', primaryGoal: 'secureChat', secondaryGoal: 'newsletter' },
  provider: { intent: 'provider', primaryGoal: 'secureChat', secondaryGoal: null },
  pricing: { intent: 'pricing', primaryGoal: 'secureChat', secondaryGoal: null },
  hormones: { intent: 'hormones', primaryGoal: 'secureChat', secondaryGoal: null },
  weight: { intent: 'weight', primaryGoal: 'secureChat', secondaryGoal: null },
  telehealth: { intent: 'telehealth', primaryGoal: 'secureChat', secondaryGoal: null },
  employer: { intent: 'employer', primaryGoal: 'bookDemo', secondaryGoal: 'secureChat' },
  landing: { intent: 'landing', primaryGoal: null, secondaryGoal: null },
  default: { intent: 'default', primaryGoal: 'secureChat', secondaryGoal: null },
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

  return {
    relPath,
    intent: pageConfig?.intent ?? intentKey,
    conversionGoal,
    funnel: pageConfig?.funnel ?? null,
    pageType: intentKey,
    primary: slotById(primarySlot) ?? goalToSlot(conversionGoal),
    secondary: slotById(secondarySlot) ?? goalToSlot(intentRules.secondaryGoal),
    additionalCtas: pageConfig?.additionalCtas ?? [],
    config: pageConfig,
  };
}

export function isAdhdFunnelPath(relPath) {
  if (relPath === 'adult-adhd-screening-california.html') return true;
  return detectUserIntent(relPath) === 'adhd';
}

/**
 * Nav CTA slot — preserves legacy behavior: ADHD funnels → Schedule Consultation; else primary.
 * @param {string} relPath
 */
export function resolveNavCtaSlot(relPath) {
  if (relPath.startsWith('answers/')) return null;
  if (isAdhdFunnelPath(relPath)) return CTA_SLOTS.walkthrough;
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
