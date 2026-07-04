/**
 * Per-page conversion goals — config over code.
 * Landing pages, campaigns, and service lines declare intent here.
 * Unlisted pages fall back to intent detection in conversion-system.mjs.
 */

/** @typedef {'secureChat'|'consultation'|'screening'|'newsletter'|'bookDemo'} ConversionGoal */

/**
 * @type {Record<string, {
 *   conversionGoal: ConversionGoal,
 *   intent?: string,
 *   funnel?: string,
 *   primarySlot?: string,
 *   secondarySlot?: string | null,
 *   additionalCtas?: string[],
 *   notes?: string,
 * }>}
 */
export const PAGE_CONVERSION_CONFIG = {
  'index.html': {
    conversionGoal: 'secureChat',
    intent: 'homepage',
    primarySlot: 'primary',
    secondarySlot: 'exploreCare',
  },
  'adhd-care.html': {
    conversionGoal: 'screening',
    intent: 'adhd',
    funnel: 'adhd-cornerstone',
    primarySlot: 'leadMagnet',
    secondarySlot: 'primary',
  },
  'adult-adhd-screening-california.html': {
    conversionGoal: 'screening',
    intent: 'adhd-ads',
    funnel: 'google-ads-adhd-ca',
    primarySlot: 'leadMagnet',
    secondarySlot: 'walkthrough',
    additionalCtas: ['walkthrough', 'evaluation'],
    notes: 'Google Ads LP — walkthrough/eval use redirect transition pages',
  },
  'mens-health-longevity.html': {
    conversionGoal: 'secureChat',
    intent: 'hormones',
    primarySlot: 'primary',
    secondarySlot: 'viewPricing',
  },
  'womens-health.html': {
    conversionGoal: 'secureChat',
    intent: 'hormones',
    primarySlot: 'primary',
    secondarySlot: 'viewPricing',
  },
  'weight-loss-metabolic-health.html': {
    conversionGoal: 'secureChat',
    intent: 'weight',
    primarySlot: 'primary',
    secondarySlot: 'viewPricing',
  },
  'pricing.html': {
    conversionGoal: 'secureChat',
    intent: 'pricing',
    primarySlot: 'primary',
    secondarySlot: 'exploreCare',
  },
  'membership-pricing.html': {
    conversionGoal: 'secureChat',
    intent: 'pricing',
    primarySlot: 'primary',
    secondarySlot: 'exploreCare',
  },
  'telehealth.html': {
    conversionGoal: 'secureChat',
    intent: 'telehealth',
    primarySlot: 'primary',
    secondarySlot: 'viewPricing',
  },
  'siya-circle.html': {
    conversionGoal: 'newsletter',
    intent: 'newsletter',
    primarySlot: 'newsletter',
    secondarySlot: null,
  },
};

/**
 * @param {string} relPath
 * @returns {typeof PAGE_CONVERSION_CONFIG[string] | null}
 */
export function getPageConversionConfig(relPath) {
  return PAGE_CONVERSION_CONFIG[relPath] ?? null;
}
