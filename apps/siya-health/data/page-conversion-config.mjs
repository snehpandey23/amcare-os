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
    secondarySlot: 'secondary',
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
    secondarySlot: 'primary',
    additionalCtas: ['walkthrough', 'evaluation'],
    notes: 'Google Ads LP — walkthrough/eval use CarePatron links in page HTML',
  },
  'mens-health-longevity.html': {
    conversionGoal: 'secureChat',
    intent: 'hormones',
    primarySlot: 'primary',
    secondarySlot: 'secondary',
  },
  'womens-health.html': {
    conversionGoal: 'secureChat',
    intent: 'hormones',
    primarySlot: 'primary',
    secondarySlot: 'secondary',
  },
  'weight-loss-metabolic-health.html': {
    conversionGoal: 'consultation',
    intent: 'weight',
    primarySlot: 'secondary',
    secondarySlot: 'primary',
  },
  'pricing.html': {
    conversionGoal: 'consultation',
    intent: 'pricing',
    primarySlot: 'secondary',
    secondarySlot: 'primary',
  },
  'telehealth.html': {
    conversionGoal: 'secureChat',
    intent: 'telehealth',
    primarySlot: 'primary',
    secondarySlot: 'secondary',
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
