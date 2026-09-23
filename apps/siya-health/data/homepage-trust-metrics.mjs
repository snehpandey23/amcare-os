/**
 * Homepage trust statistics — single editable source.
 * Owner-supplied figures (do not invent or extrapolate).
 * As of: September 2026 (Google + Klarity confirmed; capacity from employer pilot proof).
 * Used by homepage reviews section and trust-system profiles.
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
  },
  googleReviews: {
    value: '88',
    label: 'Google reviews',
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
