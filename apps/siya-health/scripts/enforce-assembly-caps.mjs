#!/usr/bin/env node
/**
 * Enforce Content Assembly caps across public HTML:
 * - Max 1 primary CTA button in <main>
 * - Max 8 <a> links per <section>/<aside>
 *
 * Primary preference (keep one):
 *   blog-final-cta / blog-supporting-cta / answer-context-closing
 *   → hero / book-visit-primary
 *   → final-cta
 *   → first remaining
 *
 * Idempotent. Run after generators / injectors.
 * Usage: node scripts/enforce-assembly-caps.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSEMBLY } from './content-assembly.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'brand', 'docs', 'scripts', 'data', 'design-system', '.vercel', 'assets', 'audit']);

const PRIMARY_RE =
  /<(a|button)\b([^>]*class="[^"]*\b(?:ds-button--primary|button[^"]*\bprimary)\b[^"]*"[^>]*)>([\s\S]*?)<\/\1>/gi;

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (e.name.endsWith('.html') && !e.name.includes('LOCAL-PREVIEW') && !e.name.startsWith('_preview')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function primaryScore(attrs = '') {
  const loc = /data-siya-location="([^"]*)"/i.exec(attrs)?.[1] || '';
  if (/blog-final-cta|blog-supporting-cta|answer-context-closing/i.test(loc)) return 100;
  if (/^hero$|book-visit-primary/i.test(loc)) return 80;
  if (/^final-cta$/i.test(loc)) return 40;
  if (/blog-cta-|adhd-what-next|nav-mobile|faq-cta/i.test(loc)) return 10;
  return 20;
}

function demoteExtraPrimaries(mainHtml) {
  const matches = [...mainHtml.matchAll(PRIMARY_RE)];
  if (matches.length <= ASSEMBLY.maxPrimaryCtas) return mainHtml;

  let keepIdx = 0;
  let best = -1;
  matches.forEach((m, i) => {
    const score = primaryScore(m[2]);
    // Prefer higher score; on ties prefer later (final CTA after mid CTA).
    if (score > best || (score === best && i > keepIdx)) {
      best = score;
      keepIdx = i;
    }
  });

  let i = -1;
  return mainHtml.replace(PRIMARY_RE, (full, tag, attrs, inner) => {
    i += 1;
    if (i === keepIdx) return full;
    const nextAttrs = attrs
      .replace(/\bds-button--primary\b/g, 'ds-button--secondary')
      .replace(/\bbutton\b([^"]*)\bprimary\b/g, 'button$1 ds-button--secondary');
    return `<${tag}${nextAttrs}>${inner}</${tag}>`;
  });
}

/**
 * Within a provider card, keep the first link per href (usually the name in <h3>)
 * and drop later duplicates (usually "View profile") so caps don't erase names.
 */
function collapseDuplicateHrefsInArticles(html) {
  return html.replace(/<article\b[^>]*>[\s\S]*?<\/article>/gi, (article) => {
    const seen = new Set();
    return article.replace(/<a\b([^>]*href="([^"]+)"[^>]*)>[\s\S]*?<\/a>/gi, (anchor, _attrs, href) => {
      if (seen.has(href)) return '';
      seen.add(href);
      return anchor;
    });
  });
}

function isHeadingAnchor(anchor, haystack, index) {
  const before = haystack.slice(Math.max(0, index - 120), index);
  return /<h[1-6]\b[^>]*>[^<]*$/i.test(before) || /<h[1-6]\b[^>]*>\s*$/i.test(before);
}

/**
 * Cap links per section without destroying provider cards or related hubs.
 * - Provider roster sections are exempt (name + View profile per clinician)
 * - Elsewhere: collapse consecutive same-href pairs, then drop low-priority links
 * - Never strip anchors that are the clinician name inside a heading
 */
function capSectionLinks(mainHtml, max = ASSEMBLY.maxLinksPerSection) {
  return mainHtml.replace(/<(section|aside)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    // Care-team / meet-clinicians grids intentionally exceed the educational-page link cap.
    if (/about-team-card|ds-provider-card|provider-index-card|homepage-care-card/i.test(inner)) {
      return full;
    }
    // Blog/labs topic hubs: jump nav + card grids are meant to exceed the cap.
    if (
      /blog-hub-jump|blog-hub-section|blog-card|blog-index|why-choose-grid/i.test(inner) ||
      /blog-hub-jump|blog-hub-section|blog-index|lab-markers|lab-topics/i.test(attrs)
    ) {
      return full;
    }
    // City ADHD landings: clinician roster list must keep every licensed provider link.
    if (/city-clinician-list/i.test(inner) || /\bid=["']telehealth-model["']/i.test(attrs)) {
      return full;
    }

    const linkCount = (inner.match(/<a\b/gi) || []).length;
    if (linkCount <= max) return full;

    let nextInner = collapseDuplicateHrefsInArticles(inner);
    // Collapse consecutive same-href pairs outside articles too.
    nextInner = nextInner.replace(
      /(<a\b([^>]*href="([^"]+)"[^>]*)>[\s\S]*?<\/a>)(\s*<a\b[^>]*href="\3"[^>]*>[\s\S]*?<\/a>)/gi,
      '$1',
    );

    const remaining = () => (nextInner.match(/<a\b/gi) || []).length;
    if (remaining() <= max) {
      return `<${tag}${attrs}>${nextInner}</${tag}>`;
    }

    // Drop low-priority trailing links until under cap.
    const dropHref = [
      /\/pricing\/?$/i,
      /\/telehealth\/?$/i,
      /\/labs\/preventive\/?$/i,
      /\/labs\/fatigue-brain-fog\/?$/i,
      /\/answers\/why-normal-labs/i,
      /\/preventive-care\/?$/i,
    ];
    for (const re of dropHref) {
      if (remaining() <= max) break;
      nextInner = nextInner.replace(/<li>\s*<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>\s*<\/li>/gi, (li, href) =>
        re.test(href) ? '' : li,
      );
      nextInner = nextInner.replace(/\s*[·•|&]\s*<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi, (chunk, href) =>
        re.test(href) && remaining() > max ? '' : chunk,
      );
      nextInner = nextInner.replace(/<a\b[^>]*href="([^"]+)"[^>]*class="[^"]*button[^"]*"[^>]*>[\s\S]*?<\/a>/gi, (a, href) =>
        re.test(href) && remaining() > max ? '' : a,
      );
    }

    // Prefer dropping "View profile" before any other trim.
    if (remaining() > max) {
      nextInner = nextInner.replace(/<a\b[^>]*>[\s\S]*?[Vv]iew [Pp]rofile[^<]*<\/a>/gi, (a) =>
        remaining() > max ? '' : a,
      );
    }

    // Last resort: remove excess trailing <a> tags, but never heading name links.
    if (remaining() > max) {
      let kept = 0;
      nextInner = nextInner.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (a, offset) => {
        if (isHeadingAnchor(a, nextInner, offset)) return a;
        kept += 1;
        return kept <= max ? a : '';
      });
      nextInner = nextInner
        .replace(/<li>\s*<\/li>/gi, '')
        .replace(/\s*[·•|,]\s*(?=[·•|,]|<)/g, ' ')
        .replace(/\(\s*\)/g, '')
        .replace(/\s{2,}/g, ' ');
    }

    return `<${tag}${attrs}>${nextInner}</${tag}>`;
  });
}

let changed = 0;
const SKIP_ROSTER_PAGES = new Set([
  'about.html',
  'providers/index.html',
  'telehealth.html',
  'adhd-care.html',
  'weight-loss-metabolic-health.html',
  'mens-health-longevity.html',
  'womens-health.html',
  'primary-urgent-care.html',
]);

/**
 * Topic hubs are link grids by design (jump nav + many article cards).
 * The 8-link section cap previously wiped jump links and, before heading
 * protection, emptied card titles on /blog/adhd (see cd9e856 fallout).
 */
const SKIP_LINK_CAP_PAGES = new Set([
  'blog/adhd.html',
  'blog/weight-loss.html',
  'blog/telehealth.html',
  'blog/index.html',
  'blog/all.html',
  'labs.html',
]);

for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  if (SKIP_ROSTER_PAGES.has(rel)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  // Any page whose main roster grid would be destroyed by the 8-link cap.
  if (/about-team-card|provider-index-card|homepage-care-card/i.test(html)) continue;
  const m = html.match(/^([\s\S]*?<main\b[^>]*>)([\s\S]*?)(<\/main>[\s\S]*)$/i);
  if (!m) continue;
  let main = m[2];
  const before = main;
  main = demoteExtraPrimaries(main);
  if (!SKIP_LINK_CAP_PAGES.has(rel)) {
    main = capSectionLinks(main);
  }
  if (main !== before) {
    fs.writeFileSync(file, m[1] + main + m[3], 'utf8');
    changed += 1;
  }
}

console.log(`Assembly caps enforced on ${changed} pages`);
