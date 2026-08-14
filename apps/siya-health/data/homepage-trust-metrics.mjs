/**
 * Homepage trust statistics — single editable source.
 * Owner-supplied figures (do not invent or extrapolate).
 * Used by homepage reviews section and trust-system profiles.
 *
 * Google rating / reviewCount MUST match the live Google Business Profile
 * (see GOOGLE_BUSINESS_PROFILE). Re-check GBP before shipping AggregateRating
 * or trust-bar updates — these go stale without a manual cadence or Places API.
 *
 * Do NOT put patientsTreated / adhdEvaluations / verifiedReviews into
 * AggregateRating schema — those are volume claims, not Google review stats.
 */
export const GOOGLE_BUSINESS_PROFILE = {
  /** Stable Maps place URL (Siya Health medical clinic; matches siya.health + 215-445-1244). */
  url: 'https://www.google.com/maps/place/Siya+Health/data=!4m2!3m1!1s0x8267d54b59d911e1:0x4af849d4f16ce2e4',
  /** Human-readable Maps place name */
  name: 'Siya Health',
  /** ISO date of last manual confirmation against live GBP UI */
  lastVerified: '2026-08-08',
  ratingValue: '4.9',
  reviewCount: '70',
  bestRating: '5',
  worstRating: '1',
};

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
    value: GOOGLE_BUSINESS_PROFILE.ratingValue,
    label: 'Average Google rating',
    suffix: '★',
  },
  googleReviews: {
    value: GOOGLE_BUSINESS_PROFILE.reviewCount,
    label: 'Google reviews',
  },
  verifiedReviews: {
    // Conservative cross-platform copy (Klarity ~837 + GBP 70 ≈ 907; Zocdoc not counted).
    // Page copy only — never feed into AggregateRating (GBP-only schema).
    value: '900+',
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

/** Schema.org AggregateRating from GBP only — not Klarity, not internal volume. */
export function googleBusinessAggregateRating() {
  return {
    '@type': 'AggregateRating',
    ratingValue: GOOGLE_BUSINESS_PROFILE.ratingValue,
    reviewCount: GOOGLE_BUSINESS_PROFILE.reviewCount,
    bestRating: GOOGLE_BUSINESS_PROFILE.bestRating,
    worstRating: GOOGLE_BUSINESS_PROFILE.worstRating,
  };
}

export const SITE_CONTACT = {
  phoneDisplay: '(215) 445-1244',
  phoneHref: 'tel:+12154451244',
  email: 'care@siya.health',
  emailHref: 'mailto:care@siya.health',
};
