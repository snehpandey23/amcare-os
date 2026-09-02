/**
 * Shared retired / stub page helpers for link and CTA audits.
 * Consumed by internal-link-audit, crawl reports, and SEO deployment QA.
 */
import { GEO_CLONE_REDIRECTS } from './geo-consolidation.mjs';
import { RETIRED_CONTENT_REDIRECTS } from './retired-content.mjs';

const REDIRECT_SHELLS = new Set([
  '/privacy-policy',
  '/terms',
  '/online-adhd-test',
  '/intake',
  '/docs/tint-options-preview',
]);

const UTILITY_PREFIXES = ['/redirect/'];

let retiredPathSet;

/** @returns {Set<string>} */
export function buildRetiredPathSet() {
  if (!retiredPathSet) {
    retiredPathSet = new Set([
      ...Object.keys(GEO_CLONE_REDIRECTS),
      ...Object.keys(RETIRED_CONTENT_REDIRECTS),
    ]);
  }
  return retiredPathSet;
}

export function isNoindexHtml(html) {
  return /<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
}

export function isMovedStubHtml(html) {
  return /<title>Moved to /i.test(html);
}

/**
 * Pages excluded from actionable orphan / blog-service audit noise.
 * @param {string} pagePath normalized site path (e.g. `/blog/foo`)
 * @param {string} [html]
 */
export function isAuditExcludedPath(pagePath, html = '') {
  if (buildRetiredPathSet().has(pagePath)) return true;
  if (REDIRECT_SHELLS.has(pagePath)) return true;
  if (UTILITY_PREFIXES.some((pre) => pagePath.startsWith(pre))) return true;
  if (html && (isNoindexHtml(html) || isMovedStubHtml(html))) return true;
  return false;
}

/** Remove global footer before in-content CTA checks. */
export function stripFooterHtml(html) {
  return html.replace(/<footer class="footer">[\s\S]*?<\/footer>/gi, '');
}
