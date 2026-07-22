/**
 * Inverse map: registry allowlist → provider.reviewedContent[] for profile pages.
 */
import { CLINICAL_REVIEW_APPROVED, isReviewSignOffComplete } from './content-review-registry.mjs';

const PAGE_TITLES = {
  'adhd-care': 'ADHD evaluation & care',
  'weight-loss-metabolic-health': 'Medical weight loss programs',
};

const BLOG_TITLES = {
  'food-noise-and-glp-1-what-it-means-and-what-helps': 'Food noise and GLP-1',
  'glp1-side-effects-and-how-to-manage-them': 'GLP-1 side effects and management',
  'how-adhd-medication-is-prescribed-online': 'How ADHD medication is prescribed online',
  'adhd-evaluation-cost-texas': 'ADHD evaluation cost in Texas',
  'online-adhd-diagnosis-texas': 'Online ADHD diagnosis in Texas',
  'youre-not-lazy-signs-undiagnosed-adult-adhd': 'Signs of undiagnosed adult ADHD',
  'telehealth-prescriptions-how-online-treatment-works': 'Telehealth prescriptions explained',
};

const ANSWER_TITLES = {
  'what-is-food-noise': 'What is food noise?',
  'who-qualifies-glp-1-weight-loss': 'Who qualifies for GLP-1 weight loss?',
  'what-included-199-adhd-evaluation': 'What is included in a Siya Health ADHD evaluation?',
  'is-telehealth-legitimate': 'Is telehealth legitimate?',
  'telehealth-adhd-california': 'Telehealth ADHD in California',
  'screening-vs-adhd-evaluation': 'Screening vs ADHD evaluation',
  'adhd-medication-side-effects': 'ADHD medication side effects',
};

function pushEntry(map, slug, entry) {
  if (!map[slug]) map[slug] = [];
  map[slug].push(entry);
}

export function buildReviewedContentByProvider() {
  const byProvider = {};

  for (const [pageSlug, meta] of Object.entries(CLINICAL_REVIEW_APPROVED.pages || {})) {
    if (!isReviewSignOffComplete(meta)) continue;
    pushEntry(byProvider, meta.reviewerSlug, {
      path: `/${pageSlug}`,
      title: PAGE_TITLES[pageSlug] || pageSlug.replace(/-/g, ' '),
      reviewDate: meta.reviewDate,
    });
  }

  for (const [blogSlug, meta] of Object.entries(CLINICAL_REVIEW_APPROVED.blogs)) {
    if (!isReviewSignOffComplete(meta)) continue;
    pushEntry(byProvider, meta.reviewerSlug, {
      path: `/blog/${blogSlug}`,
      title: BLOG_TITLES[blogSlug] || blogSlug.replace(/-/g, ' '),
      reviewDate: meta.reviewDate,
    });
  }

  for (const [answerSlug, meta] of Object.entries(CLINICAL_REVIEW_APPROVED.answers)) {
    if (!isReviewSignOffComplete(meta)) continue;
    pushEntry(byProvider, meta.reviewerSlug, {
      path: `/answers/${answerSlug}`,
      title: ANSWER_TITLES[answerSlug] || answerSlug.replace(/-/g, ' '),
      reviewDate: meta.reviewDate,
    });
  }

  for (const slug of Object.keys(byProvider)) {
    byProvider[slug].sort((a, b) => (b.reviewDate || '').localeCompare(a.reviewDate || ''));
  }

  return byProvider;
}

export function getReviewedContentForProvider(providerSlug) {
  return buildReviewedContentByProvider()[providerSlug] || [];
}
