/**
 * Homepage trust statistics — single editable source.
 * Owner-supplied figures (do not invent or extrapolate).
 *
 * Google listing last verified: 2026-09-28.
 * Source: https://maps.app.goo.gl/6vxs6tvGQKvoq6Yg6
 * Place: Siya Health (place id ChIJ4RHZWUvVZ4IR5OJs8dRJ-Eo).
 * That check: 4.9 stars, 102 reviews. The figure recorded before this check was 4.90 and 88 reviews.
 * Klarity was not re-checked on 2026-09-28.
 *
 * Used by the homepage reviews section (partials/homepage2-google-reviews.mjs) and trust-system profiles.
 */
export const HOMEPAGE_TRUST_METRICS = {
  patientsTreated: {
    value: '2,700+',
    label: 'Patients treated',
  },
  neurocognitiveEvaluations: {
    value: '1,200+',
    label: 'Evaluations completed',
  },
  googleRating: {
    value: '4.90',
    label: 'Google rating',
    suffix: '★',
    /** Google shows this as 4.9. Last read from the listing on this date. */
    lastVerified: '2026-09-28',
  },
  googleReviews: {
    value: '102',
    label: 'Google reviews',
    lastVerified: '2026-09-28',
  },
  klarityRating: {
    value: '4.66',
    label: 'Klarity rating',
    suffix: '★',
  },
  klarityReviews: {
    value: '589',
    label: 'Klarity reviews',
  },
  /**
   * @deprecated Prefer klarityRating + klarityReviews.
   * Kept so legacy injectors that still reference verifiedReviews do not invent a new number.
   */
  verifiedReviews: {
    value: '589',
    label: 'Klarity reviews',
  },
};

/** @deprecated Use neurocognitiveEvaluations */
export const adhdEvaluations = HOMEPAGE_TRUST_METRICS.neurocognitiveEvaluations;

/** Compact ordered list for homepage trust summary UI */
export const HOMEPAGE_TRUST_SUMMARY = [
  HOMEPAGE_TRUST_METRICS.googleRating,
  HOMEPAGE_TRUST_METRICS.googleReviews,
  HOMEPAGE_TRUST_METRICS.patientsTreated,
  HOMEPAGE_TRUST_METRICS.neurocognitiveEvaluations,
  {
    value: `${HOMEPAGE_TRUST_METRICS.klarityRating.value}${HOMEPAGE_TRUST_METRICS.klarityRating.suffix}`,
    label: `Klarity · ${HOMEPAGE_TRUST_METRICS.klarityReviews.value} reviews`,
  },
];

export const SITE_CONTACT = {
  phoneDisplay: '(215) 445-1244',
  phoneHref: 'tel:+12154451244',
  email: 'care@siya.health',
  emailHref: 'mailto:care@siya.health',
};
