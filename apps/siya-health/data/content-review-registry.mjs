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
  metabolic: { primary: 'dr-sneh-pandey', secondary: 'wendy-delgado', support: 'dr-vanessa-urbina' },
  adhdEval: { primary: 'dr-sneh-pandey', secondary: 'dr-natasha-desai' },
  adhdMedication: { primary: 'dr-swati-pandey', secondary: 'dr-sneh-pandey' },
  adhdBehavioral: { primary: 'dr-natasha-desai', secondary: 'megan-wunderlich' },
  telehealthTrust: { primary: 'dr-sneh-pandey', secondary: 'megan-wunderlich' },
  primaryCare: { primary: 'dr-vanessa-urbina', secondary: 'dr-sneh-pandey' },
  mensHealth: { primary: 'dr-sneh-pandey', secondary: 'dr-vanessa-urbina' },
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

/**
 * Explicit allowlist only. Each entry needs reviewerSlug + reviewDate +
 * signOffSource + reviewerConsent === true or reviewedBy will not emit.
 */
export const CLINICAL_REVIEW_APPROVED = {
  pages: {
    'guides/sleep': {
      reviewerSlug: 'dr-sneh-pandey',
      reviewDate: '2026-10-04',
      signOffSource: 'docs/clinical-signoffs/2026-10-04-pillar-guides-dr-sneh-pandey.md',
      reviewerConsent: true,
    },
    'guides/testosterone': {
      reviewerSlug: 'dr-sneh-pandey',
      reviewDate: '2026-10-04',
      signOffSource: 'docs/clinical-signoffs/2026-10-04-pillar-guides-dr-sneh-pandey.md',
      reviewerConsent: true,
    },
    'guides/perimenopause': {
      reviewerSlug: 'dr-sneh-pandey',
      reviewDate: '2026-10-04',
      signOffSource: 'docs/clinical-signoffs/2026-10-04-pillar-guides-dr-sneh-pandey.md',
      reviewerConsent: true,
    },
  },
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
