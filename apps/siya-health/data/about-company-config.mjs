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
  { value: '6', label: 'Licensed clinicians' },
  { value: '4', label: 'Telehealth states (CA · TX · PA · FL)' },
];

export const ABOUT_COMPANY_COPY = {
  heading: 'About the Company',
    lead: 'Working professionals were doing the job. The system around them was not: offices that close when shifts start, visits too short to hear the whole story, and follow-up that disappears.',
  paragraphs: [
    'Siya Health is the company we built for that problem. Licensed clinicians lead the visit. Scheduling, pharmacy coordination, and follow-up stay with the care team so the appointment is for the person, not the paperwork.',
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
