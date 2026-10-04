/**
 * Shared employer facts for /employers/california-pilot and /employers/demo.
 * Do not duplicate these strings in page templates — import this module.
 * Pricing stays on the pilot generator only; the demo must not render rates.
 *
 * Care hours / response (Oct 4, 2026 — founder-confirmed):
 * - Employees can book visits 24/7. Care team: 24/7.
 * - Care team replies within 30 minutes; a doctor within 2 hours, any time.
 * Never use “guaranteed” / “guarantee” in demo copy.
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
  /** Booking + care-team hours (founder-confirmed). */
  booking24_7: 'Employees can book visits 24/7.',
  careTeam24_7: 'Care team available 24/7.',
  scheduledCare: "Visits available 24/7, including weekends and holidays (patient's local time).",
  responseWithin: 'Our care team replies within 30 minutes, 24/7.',
  responseChip: 'Replies within 30 min, 24/7',
  doctorAvailability: 'A doctor is available within 2 hours, any time, often sooner.',
  doctorChip: 'A doctor within 2 hours, any time',
  /** Schedule slide copy (desk). */
  scheduleSubline:
    'At Siya, they can book a quick check-in on a busy workday, or a longer visit after hours, on weekends, or on holidays. Bookable 24/7.',
  weekLegendCare: 'Siya care · 24/7',
  /** Cost slide Siya column + footnote (no discount brand names). */
  costDoctorRow: 'A doctor within 2 hours, any time',
  costFootnote:
    'Medications are filled at their own pharmacy; we can help find discount coupons. Labs and outside specialists are billed separately. Lab prices are shown upfront when ordered through our lab portal.',
  /** Where the employee must be located for the visit. */
  visitLocationLine:
    'For employees located in California, Texas, Pennsylvania or Florida at the time of their visit.',
  /**
   * Dr. Sneh Pandey titles (Oct 4, 2026 — founder-confirmed; match care-team /providers page).
   * Cards/booking: full credentials line. Short contexts: surname + Medical Director.
   */
  medicalDirectorName: 'Dr. Sneh Pandey',
  medicalDirectorTitleCard: 'Medical Director · Internal Medicine Physician',
  medicalDirectorTitleShort: 'Dr. Pandey, Medical Director',
  medicalDirectorByline: 'Dr. Sneh Pandey · Medical Director, Siya Health',
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
