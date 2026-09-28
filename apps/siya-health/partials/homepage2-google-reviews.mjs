/**
 * Homepage Google rating block. Homepage2 dropped this when the page was rebuilt.
 * Numbers come only from data/homepage-trust-metrics.mjs (a manual check, not a live API).
 * seo-build calls ensureHomepageGoogleReviews so a rebuild rewrites this block from that file.
 */
import { HOMEPAGE_TRUST_METRICS as M } from '../data/homepage-trust-metrics.mjs';

function asOfMonth(isoDate) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [, month] = String(isoDate).split('-').map(Number);
  const year = String(isoDate).slice(0, 4);
  return `${months[(month || 1) - 1]} ${year}`;
}

export function homepageGoogleReviewsHtml() {
  const rating = `${M.googleRating.value}${M.googleRating.suffix || ''}`;
  const reviews = M.googleReviews.value;
  const googleAsOf = asOfMonth(M.googleReviews.lastVerified || M.googleRating.lastVerified);
  return `<div class="homepage-trust-summary" data-siya-google-reviews aria-label="Trust statistics recorded ${googleAsOf}">
 <div class="homepage-trust-stat">
 <span class="homepage-trust-stat-value">${rating}</span>
 <span class="homepage-trust-stat-label">Google rating (as of ${googleAsOf})</span>
 </div>
 <div class="homepage-trust-stat">
 <span class="homepage-trust-stat-value">${reviews}</span>
 <span class="homepage-trust-stat-label">Google reviews (as of ${googleAsOf})</span>
 </div>
 <div class="homepage-trust-stat">
 <span class="homepage-trust-stat-value">${M.patientsTreated.value}</span>
 <span class="homepage-trust-stat-label">${M.patientsTreated.label}</span>
 </div>
 <div class="homepage-trust-stat">
 <span class="homepage-trust-stat-value">${M.neurocognitiveEvaluations.value}</span>
 <span class="homepage-trust-stat-label">${M.neurocognitiveEvaluations.label}</span>
 </div>
</div>`;
}

const REVIEWS_BLOCK = /<div class="homepage-trust-summary" data-siya-google-reviews[\s\S]*?(?=<input\b[^>]*id="siya-h2-more-reviews")/;

/** Rewrite the homepage reviews summary from homepage-trust-metrics.mjs, or insert it if missing. */
export function ensureHomepageGoogleReviews(html) {
  if (!html || !html.includes('id="siya-h2-more-reviews"')) return html;
  if (!/page-home|page-homepage2/.test(html)) return html;
  const block = `${homepageGoogleReviewsHtml()}\n `;
  if (REVIEWS_BLOCK.test(html)) return html.replace(REVIEWS_BLOCK, block);
  return html.replace(
    /(id="reviews"[\s\S]*?<div class="section-header testimonials-premium-header">[\s\S]*?<\/div>)\s*(<input\b[^>]*id="siya-h2-more-reviews")/,
    `$1\n ${block}$2`,
  );
}
