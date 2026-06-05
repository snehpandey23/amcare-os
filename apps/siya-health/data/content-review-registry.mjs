/**
 * Clinical review governance — explicit allowlist only.
 * All content defaults to PENDING_REVIEW until listed here with complete sign-off.
 */
export const REVIEW_STATUS = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  CLINICALLY_REVIEWED: 'CLINICALLY_REVIEWED',
};

/** Primary reviewer ownership by topic cluster (Wave 1+ routing). */
export const REVIEWER_OWNERSHIP = {
  metabolic: { primary: 'derek-timbs', secondary: 'dr-sneh-pandey', support: 'wendy-delgado' },
  adhdEval: { primary: 'dr-sneh-pandey', secondary: 'dr-natasha-desai' },
  adhdMedication: { primary: 'dr-swati-pandey', secondary: 'dr-sneh-pandey' },
  adhdBehavioral: { primary: 'dr-natasha-desai', secondary: 'megan-wunderlich' },
  telehealthTrust: { primary: 'dr-sneh-pandey', secondary: 'megan-wunderlich' },
  primaryCare: { primary: 'dr-vanessa-urbina', secondary: 'dr-sneh-pandey' },
  mensHealth: { primary: 'derek-timbs', secondary: 'dr-sneh-pandey' },
};

/**
 * Sign-off contract — reviewedBy emits only when all fields pass:
 * reviewerSlug, reviewDate, signOffSource, reviewerConsent === true
 */
export function isReviewSignOffComplete(meta) {
  return Boolean(
    meta &&
      meta.reviewerSlug &&
      meta.reviewDate &&
      meta.signOffSource &&
      meta.reviewerConsent === true,
  );
}

/** Wave 1 rolled back until compliance attaches signOffSource + reviewerConsent per URL */
export const CLINICAL_REVIEW_APPROVED = {
  pages: {},
  blogs: {},
  answers: {},
};

export function getPageReviewMeta(slug) {
  const meta = CLINICAL_REVIEW_APPROVED.pages?.[slug];
  return isReviewSignOffComplete(meta) ? meta : null;
}

export function getBlogReviewMeta(slug) {
  const meta = CLINICAL_REVIEW_APPROVED.blogs[slug];
  return isReviewSignOffComplete(meta) ? meta : null;
}

export function getAnswerReviewMeta(slug) {
  const meta = CLINICAL_REVIEW_APPROVED.answers[slug];
  return isReviewSignOffComplete(meta) ? meta : null;
}

export function isClinicallyReviewedBlog(slug) {
  return isReviewSignOffComplete(CLINICAL_REVIEW_APPROVED.blogs[slug]);
}

export function isClinicallyReviewedAnswer(slug) {
  return isReviewSignOffComplete(CLINICAL_REVIEW_APPROVED.answers[slug]);
}
