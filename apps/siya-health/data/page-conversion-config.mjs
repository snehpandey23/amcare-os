/**
 * Per-page conversion goals — config over code.
 * Landing pages, campaigns, and service lines declare intent here.
 * Unlisted pages fall back to intent detection in conversion-system.mjs.
 */

/** @typedef {'meetGreet'|'secureChat'|'consultation'|'screening'|'newsletter'|'bookDemo'|'exploreCare'|'viewPricing'|'zocdoc'} ConversionGoal */

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
    conversionGoal: 'meetGreet',
    intent: 'homepage',
    primarySlot: 'meetGreet',
    secondarySlot: 'exploreCare',
  },
  'about.html': {
    conversionGoal: 'meetGreet',
    intent: 'default',
    primarySlot: 'meetGreet',
    secondarySlot: 'exploreCare',
  },
  'book-appointment.html': {
    conversionGoal: 'meetGreet',
    intent: 'default',
    primarySlot: 'meetGreet',
    secondarySlot: 'zocdoc',
    additionalCtas: ['secureChat'],
    notes: 'Booking hub — Meet & Greet is low-friction first step',
  },
  'adhd-care.html': {
    conversionGoal: 'screening',
    intent: 'adhd',
    funnel: 'adhd-cornerstone',
    primarySlot: 'leadMagnet',
    secondarySlot: 'meetGreet',
    additionalCtas: ['evaluation'],
  },
  'adhd-screening-results.html': {
    conversionGoal: 'meetGreet',
    intent: 'adhd',
    funnel: 'adhd-screening-results',
    primarySlot: 'meetGreet',
    secondarySlot: 'evaluation',
    additionalCtas: ['secureChat'],
  },
  'adult-adhd-screening-california.html': {
    conversionGoal: 'screening',
    intent: 'adhd-ads',
    funnel: 'google-ads-adhd-ca',
    primarySlot: 'leadMagnet',
    secondarySlot: 'meetGreet',
    additionalCtas: ['meetGreet', 'evaluation'],
    notes: 'Google Ads LP — screening → meet & greet → evaluation; no Zocdoc primary',
  },
  'mens-health-longevity.html': {
    conversionGoal: 'meetGreet',
    intent: 'hormones',
    primarySlot: 'meetGreet',
    secondarySlot: 'viewPricing',
  },
  'womens-health.html': {
    conversionGoal: 'meetGreet',
    intent: 'hormones',
    primarySlot: 'meetGreet',
    secondarySlot: 'viewPricing',
  },
  'weight-loss-metabolic-health.html': {
    conversionGoal: 'meetGreet',
    intent: 'weight',
    primarySlot: 'meetGreet',
    secondarySlot: 'viewPricing',
  },
  'pricing.html': {
    conversionGoal: 'meetGreet',
    intent: 'pricing',
    primarySlot: 'meetGreet',
    secondarySlot: 'exploreCare',
  },
  'membership-pricing.html': {
    conversionGoal: 'meetGreet',
    intent: 'pricing',
    primarySlot: 'meetGreet',
    secondarySlot: 'exploreCare',
  },
  'telehealth.html': {
    conversionGoal: 'meetGreet',
    intent: 'telehealth',
    primarySlot: 'meetGreet',
    secondarySlot: 'exploreCare',
    additionalCtas: ['secureChat'],
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
