/**
 * Clinical review governance — explicit allowlist only.
 * All content defaults to PENDING_REVIEW until listed here.
 */
export const REVIEW_STATUS = {
  PENDING_REVIEW: 'PENDING_REVIEW',
  CLINICALLY_REVIEWED: 'CLINICALLY_REVIEWED',
};

/** ISO date (YYYY-MM-DD) per approved item */
export const CLINICAL_REVIEW_APPROVED = {
  blogs: {
    // Uncomment when a blog has completed physician sign-off:
    // 'food-noise-and-glp-1-what-it-means-and-what-helps': { reviewerSlug: 'dr-sneh-pandey', reviewDate: '2026-06-03' },
  },
  answers: {
    // 'what-is-food-noise': { reviewerSlug: 'dr-sneh-pandey', reviewDate: '2026-06-03' },
  },
};

export function getBlogReviewMeta(slug) {
  return CLINICAL_REVIEW_APPROVED.blogs[slug] || null;
}

export function getAnswerReviewMeta(slug) {
  return CLINICAL_REVIEW_APPROVED.answers[slug] || null;
}

export function isClinicallyReviewedBlog(slug) {
  return Boolean(CLINICAL_REVIEW_APPROVED.blogs[slug]);
}

export function isClinicallyReviewedAnswer(slug) {
  return Boolean(CLINICAL_REVIEW_APPROVED.answers[slug]);
}
