/**
 * Homepage trust statistics — single editable source.
 * Owner-supplied figures (do not invent or extrapolate).
 * Used by homepage reviews section and trust-system profiles.
 */
export const HOMEPAGE_TRUST_METRICS = {
  patientsTreated: {
    value: '2,200+',
    label: 'Patients treated',
  },
  adhdEvaluations: {
    value: '1,000+',
    label: 'ADHD evaluations & screenings',
  },
  googleRating: {
    value: '4.8',
    label: 'Average Google rating',
    suffix: '★',
  },
  googleReviews: {
    value: '44',
    label: 'Google reviews',
  },
  verifiedReviews: {
    value: '600+',
    label: 'Total verified patient reviews',
  },
};

/** Compact ordered list for homepage trust summary UI */
export const HOMEPAGE_TRUST_SUMMARY = [
  HOMEPAGE_TRUST_METRICS.googleRating,
  HOMEPAGE_TRUST_METRICS.googleReviews,
  HOMEPAGE_TRUST_METRICS.patientsTreated,
  HOMEPAGE_TRUST_METRICS.adhdEvaluations,
  HOMEPAGE_TRUST_METRICS.verifiedReviews,
];

export const SITE_CONTACT = {
  phoneDisplay: '(215) 445-1244',
  phoneHref: 'tel:+12154451244',
  email: 'care@siya.health',
  emailHref: 'mailto:care@siya.health',
};
