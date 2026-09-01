/**
 * About page — "About the Company" block (Phase 5).
 * Public-appropriate investor first-impression copy — not data-room / MSO detail.
 * Metrics pulled from homepage-trust-metrics.mjs (deck-aligned source of truth).
 */
import { HOMEPAGE_TRUST_METRICS } from './homepage-trust-metrics.mjs';

const M = HOMEPAGE_TRUST_METRICS;

/** Stat tiles for the company section — derived from locked site metrics. */
export const ABOUT_COMPANY_STATS = [
  { value: M.patientsTreated.value, label: M.patientsTreated.label },
  { value: M.neurocognitiveEvaluations.value, label: M.neurocognitiveEvaluations.label },
  {
    value: `${M.googleRating.value}${M.googleRating.suffix ?? '★'}`,
    label: `${M.googleReviews.label} (${M.googleReviews.value})`,
  },
  { value: '6', label: 'Licensed clinicians' },
  { value: '4', label: 'Telehealth states (CA · TX · PA · FL)' },
];

export const ABOUT_COMPANY_COPY = {
  heading: 'About the Company',
  lead: 'Siya Health is a physician-led telehealth practice for adults who want structured evaluation, transparent pricing, and care that still feels like real medicine.',
  paragraphs: [
    'We built Siya around a simple operating model: licensed clinicians lead every care pathway, supported by a concierge team that handles intake, scheduling, documentation support, pharmacy coordination, and follow-up logistics—so clinical time stays focused on patients.',
    'Care is delivered through HIPAA-compliant telehealth in California, Texas, Pennsylvania, and Florida. Patients choose transparent cash-pay pricing for evaluations and ongoing membership options—without insurance maze-finding as the first step.',
    'Our multidisciplinary team covers adult ADHD and neurocognitive evaluation, metabolic and weight care, primary and urgent telehealth, and behavioral-health overlap—including men\u2019s and women\u2019s health—under standardized, physician-led protocols.',
    'Much of our clinical work serves working adults navigating focus, fatigue, sleep, and cognitive load alongside demanding schedules—whether they arrive through individual booking or structured workplace programs.',
  ],
  employerCta: {
    label: 'For Employers',
    href: '/employers',
    text: 'Exploring structured screening or workplace partnerships?',
  },
};
