/**
 * CTA System — canonical CTA slot definitions.
 * Resolution by intent lives in conversion-system.mjs.
 */
import { CTA_SYSTEM, COPY_STANDARDS } from '../data/site-standards.mjs';
import {
  BOOKING_LINK,
  ADHD_WALKTHROUGH_LINK,
  ADHD_EVALUATION_199_LINK,
  SPRUCE_CHAT_URL,
} from '../data/providers-core.mjs';
import {
  SIYA_CIRCLE_GHL_FORM_URL,
  SIYA_CIRCLE_JOIN_TRACK,
} from '../data/siya-circle-config.mjs';

export { CTA_SYSTEM, COPY_STANDARDS };

/** Canonical CTA slots */
export const CTA_SLOTS = {
  primary: {
    id: 'primary',
    label: CTA_SYSTEM.primary.label,
    url: SPRUCE_CHAT_URL,
    external: true,
    track: 'primary-cta-click',
  },
  secondary: {
    id: 'secondary',
    label: CTA_SYSTEM.secondary.booking.label,
    url: BOOKING_LINK,
    external: true,
    track: 'schedule-consultation-click',
  },
  leadMagnet: {
    id: 'lead-magnet',
    label: COPY_STANDARDS.adhdSecondaryCta,
    url: '/adhd-screening?adhd=1',
    external: false,
    track: 'screening-cta-click',
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
  homepage: { primary: 'primary', secondary: 'secondary' },
  adhd: { primary: 'leadMagnet', secondary: 'primary' },
  blog: { primary: 'primary', secondary: 'newsletter' },
  provider: { primary: 'secondary', secondary: 'primary' },
  landing: { primary: null, secondary: null },
  default: { primary: 'primary', secondary: 'secondary' },
};

/**
 * Landing-page conversion CTAs — page config may reference these ids.
 */
export const LANDING_CONVERSION_CTAS = {
  screening: CTA_SLOTS.leadMagnet,
  evaluation: {
    id: 'evaluation',
    label: 'Start $199 Evaluation',
    url: ADHD_EVALUATION_199_LINK,
    external: true,
    track: 'click_start_199_evaluation',
  },
  walkthrough: {
    id: 'walkthrough',
    label: 'Book Free Walkthrough',
    url: ADHD_WALKTHROUGH_LINK,
    external: true,
    track: 'click_book_walkthrough',
  },
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
