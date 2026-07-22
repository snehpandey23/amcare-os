/**
 * CTA System — canonical CTA slot definitions.
 * Resolution by intent lives in conversion-system.mjs.
 */
import { CTA_SYSTEM, COPY_STANDARDS } from '../data/site-standards.mjs';
import {
  REDIRECT_CHAT_URL,
  REDIRECT_MEET_GREET_URL,
  REDIRECT_ADHD_WALKTHROUGH_URL,
  REDIRECT_ADHD_EVALUATION_URL,
  ZOCDOC_BOOKING_URL,
} from '../data/providers-core.mjs';
import {
  SIYA_CIRCLE_GHL_FORM_URL,
  SIYA_CIRCLE_JOIN_TRACK,
} from '../data/siya-circle-config.mjs';

export { CTA_SYSTEM, COPY_STANDARDS };

/** Canonical CTA slots */
export const CTA_SLOTS = {
  meetGreet: {
    id: 'meetGreet',
    label: COPY_STANDARDS.meetGreetCta,
    url: REDIRECT_MEET_GREET_URL,
    external: false,
    track: 'meet_greet_click',
    microcopy: COPY_STANDARDS.meetGreetMicrocopy,
    disclaimer: COPY_STANDARDS.meetGreetDisclaimer,
  },
  /** Primary slot — Meet & Greet on general cold-traffic pages */
  primary: {
    id: 'meetGreet',
    label: COPY_STANDARDS.meetGreetCta,
    url: REDIRECT_MEET_GREET_URL,
    external: false,
    track: 'meet_greet_click',
    microcopy: COPY_STANDARDS.meetGreetMicrocopy,
    disclaimer: COPY_STANDARDS.meetGreetDisclaimer,
  },
  secureChat: {
    id: 'secureChat',
    label: COPY_STANDARDS.secureChatCta,
    url: REDIRECT_CHAT_URL,
    external: false,
    track: 'secure_chat_click',
  },
  secondary: {
    id: 'secondary',
    label: CTA_SYSTEM.secondary.booking.label,
    url: CTA_SYSTEM.secondary.booking.url,
    external: false,
    track: 'explore-care-click',
  },
  walkthrough: {
    id: 'walkthrough',
    label: COPY_STANDARDS.meetGreetCta,
    url: REDIRECT_MEET_GREET_URL,
    external: false,
    track: 'meet_greet_click',
    microcopy: COPY_STANDARDS.meetGreetAdhdMicrocopy,
    disclaimer: COPY_STANDARDS.meetGreetDisclaimer,
  },
  leadMagnet: {
    id: 'lead-magnet',
    label: COPY_STANDARDS.adhdSecondaryCta,
    url: '/adhd-screening?adhd=1',
    external: false,
    track: 'adhd_screening_click',
  },
  exploreCare: {
    id: 'exploreCare',
    label: 'Explore Care Options',
    url: '/telehealth',
    external: false,
    track: 'explore-care-click',
  },
  viewPricing: {
    id: 'viewPricing',
    label: 'View Pricing',
    url: COPY_STANDARDS.pricingPath ?? '/pricing',
    external: false,
    track: 'view-pricing-click',
  },
  zocdoc: {
    id: 'zocdoc',
    label: 'Additional booking option',
    url: ZOCDOC_BOOKING_URL,
    external: true,
    track: 'zocdoc_booking_click',
  },
  newsletter: {
    id: 'newsletter',
    label: CTA_SYSTEM.newsletter.label,
    microcopy: CTA_SYSTEM.newsletter.microcopy,
    url: SIYA_CIRCLE_GHL_FORM_URL,
    external: true,
    track: SIYA_CIRCLE_JOIN_TRACK,
  },
};

/**
 * @deprecated Use conversion-system resolveConversion(). Kept for migration reference.
 */
export const PAGE_CTA_RULES = {
  homepage: { primary: 'primary', secondary: 'exploreCare' },
  adhd: { primary: 'leadMagnet', secondary: 'meetGreet' },
  blog: { primary: 'primary', secondary: 'newsletter' },
  provider: { primary: 'primary', secondary: 'zocdoc' },
  landing: { primary: null, secondary: null },
  default: { primary: 'primary', secondary: 'exploreCare' },
};

/**
 * Landing-page conversion CTAs — page config may reference these ids.
 */
export const LANDING_CONVERSION_CTAS = {
  screening: CTA_SLOTS.leadMagnet,
  evaluation: {
    id: 'evaluation',
    label: 'Start ADHD Evaluation',
    url: REDIRECT_ADHD_EVALUATION_URL,
    external: false,
    track: 'adhd_evaluation_click',
  },
  walkthrough: {
    id: 'walkthrough',
    label: COPY_STANDARDS.meetGreetCta,
    url: REDIRECT_MEET_GREET_URL,
    external: false,
    track: 'meet_greet_click',
    microcopy: COPY_STANDARDS.meetGreetAdhdMicrocopy,
    disclaimer: COPY_STANDARDS.meetGreetDisclaimer,
  },
  meetGreet: CTA_SLOTS.meetGreet,
};

/**
 * Build CTA tracking + analytics attributes for rendered links.
 * @param {{ track?: string, location?: string, pageType?: string, intent?: string, conversionGoal?: string, ctaSlot?: string, component?: string }} opts
 */
export function ctaTrackingAttrs(opts, location = 'body') {
  const o = typeof opts === 'string' ? { track: opts } : { ...opts };
  const loc = o.location ?? location;
  const parts = [];
  if (o.track) parts.push(`data-siya-track="${o.track}"`);
  if (loc) parts.push(`data-siya-location="${loc}"`);
  if (o.pageType) parts.push(`data-page-type="${o.pageType}"`);
  if (o.intent) parts.push(`data-intent="${o.intent}"`);
  if (o.conversionGoal) parts.push(`data-conversion-goal="${o.conversionGoal}"`);
  if (o.ctaSlot) parts.push(`data-cta-slot="${o.ctaSlot}"`);
  if (o.component) parts.push(`data-component="${o.component}"`);
  return parts.join(' ');
}
