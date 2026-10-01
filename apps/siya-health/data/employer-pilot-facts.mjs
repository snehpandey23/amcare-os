/**
 * Shared employer facts for /employers/demo.
 * /employers/california-pilot was removed 2026-09-30. Do not republish a per-employee rate.
 * Do not duplicate these strings in page templates — import this module.
 * Pricing stays on the pilot generator only; the demo must not render rates.
 */
export const EMPLOYER_PILOT_FACTS = {
  asOf: 'September 2026',
  patientsTreated: '2,700+',
  evaluationsCompleted: '1,200+',
  newPatientsPerMonth: 180,
  returningPatientsPerMonth: 200,
  googleScore: '4.90/5',
  googleReviewCount: 102,
  klarityScore: '4.66/5',
  klarityReviewCount: 589,
  conciergeSessionsFrom: 25,
  conciergeSessionsTo: 50,
  panelMin: 500,
  panelMax: 600,
  /** Practice service area — not each founder's personal license list. */
  practiceStatesShort: 'CA, TX, PA, FL',
  /** Care window, founder's local-time standard (Sep 30, 2026). */
  scheduledCare: "6 AM – 10 PM, 7 days a week (patient's local time), including urgent appointments",
  /** Concierge replies during that same window. */
  responseWithin: 'Our team replies within 1 hour, 6 AM – 10 PM.',
  /** Where the employee must be located for the visit. */
  visitLocationLine:
    'For employees located in California, Texas, Pennsylvania or Florida at the time of their visit.',
};

export function proofScaleLine(facts = EMPLOYER_PILOT_FACTS) {
  return `${facts.patientsTreated} patients treated, ${facts.evaluationsCompleted} clinical evaluations completed`;
}

export function proofMonthlyLine(facts = EMPLOYER_PILOT_FACTS) {
  return `Averaging about ${facts.newPatientsPerMonth} new patients and ${facts.returningPatientsPerMonth} returning patients every month (as of ${facts.asOf})`;
}

export function proofGoogleLine(facts = EMPLOYER_PILOT_FACTS) {
  return `Google: ${facts.googleScore} average (${facts.googleReviewCount} reviews, as of ${facts.asOf})`;
}

export function proofKlarityLine(facts = EMPLOYER_PILOT_FACTS) {
  return `Klarity: ${facts.klarityScore} average across ${facts.klarityReviewCount} provider reviews (as of ${facts.asOf})`;
}

export function proofConciergeLine(facts = EMPLOYER_PILOT_FACTS) {
  return `Concierge/care-management sessions have grown from ${facts.conciergeSessionsFrom}/month to ${facts.conciergeSessionsTo}/month over the past quarter — an active care-management team already in place`;
}

export function proofLead(facts = EMPLOYER_PILOT_FACTS) {
  return `Operational scale and published ratings (as of ${facts.asOf}).`;
}
