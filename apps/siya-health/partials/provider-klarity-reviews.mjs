/**
 * Klarity line on each provider profile. Numbers come from data/provider-trust-metrics.mjs.
 * seo-build and generate-provider-pages call ensureProviderKlarityReviews so a rebuild keeps it.
 */
import { MIN_KLARITY_REVIEWS, PROVIDER_KLARITY } from '../data/provider-trust-metrics.mjs';

function slugFromRel(relPath) {
  return String(relPath || '').replace(/^providers\//, '').replace(/\.html$/, '');
}

export function providerKlarityReviewsHtml(slug) {
  const entry = PROVIDER_KLARITY[slug];
  if (!entry) return '';
  if (entry.reviewCount > MIN_KLARITY_REVIEWS) {
    const rating = `${entry.rating}★`;
    return `<p class="provider-klarity-reviews" data-siya-klarity-reviews="${slug}">
              <a href="${entry.profileUrl}" rel="noopener noreferrer">${rating} · ${entry.reviewCount} Klarity reviews</a>
              <span class="provider-klarity-reviews__note">Based on post-visit patient surveys</span>
            </p>`;
  }
  return `<p class="provider-klarity-reviews" data-siya-klarity-reviews="${slug}">Not enough reviews yet</p>`;
}

const KLARITY_BLOCK = /<p class="provider-klarity-reviews"[\s\S]*?<\/p>\s*/;

/** Insert or rewrite the Klarity line on a provider profile. Homepage files are left alone. */
export function ensureProviderKlarityReviews(html, relPath) {
  if (!html || !relPath || !relPath.startsWith('providers/') || relPath.endsWith('index.html')) return html;
  const slug = slugFromRel(relPath);
  const block = providerKlarityReviewsHtml(slug);
  if (!block) return html;
  if (KLARITY_BLOCK.test(html)) return html.replace(KLARITY_BLOCK, `${block}\n              `);
  if (!html.includes('provider-lp-role-line')) return html;
  return html.replace(
    /(<p class="provider-lp-role-line">[\s\S]*?<\/p>)/,
    `$1\n              ${block}`,
  );
}
