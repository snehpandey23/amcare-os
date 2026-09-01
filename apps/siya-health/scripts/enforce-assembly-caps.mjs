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
 * Cap links per section without destroying provider cards or related hubs.
 * - Drop duplicate consecutive same-href anchors ("Name" + "View profile")
 * - Then drop lowest-priority trailing links (pricing/telehealth CTAs, lab panel dumps)
 */
function isListingGridSection(attrs = '', inner = '') {
  return (
    /\b(blog-featured|blog-index|blog-hub-section)\b/i.test(attrs) ||
    /\b(blog-grid|blog-featured-grid|cornerstone-articles-grid|provider-index-grid|about-care-team-grid|about-team-grid)\b/i.test(
      inner,
    ) ||
    /\bid=["']care-team["']/i.test(attrs) ||
    /\bid=["']meet-physicians["']/i.test(attrs)
  );
}

function capSectionLinks(mainHtml, max = ASSEMBLY.maxLinksPerSection) {
  return mainHtml.replace(/<(section|aside)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    /* Card grids are meant to have many title+read-more links. The 8-link cap
       was stripping <a> out of later cards and leaving empty <h2>/<h3>. */
    if (isListingGridSection(attrs, inner)) return full;

    const linkCount = (inner.match(/<a\b/gi) || []).length;
    if (linkCount <= max) return full;

    let nextInner = inner;
    // Collapse duplicate same-href pairs (provider name + View profile).
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

    // Last resort: remove excess trailing <a> tags (keep first max).
    if (remaining() > max) {
      let kept = 0;
      nextInner = nextInner.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (a) => {
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
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  const m = html.match(/^([\s\S]*?<main\b[^>]*>)([\s\S]*?)(<\/main>[\s\S]*)$/i);
  if (!m) continue;
  let main = m[2];
  const before = main;
  main = demoteExtraPrimaries(main);
  main = capSectionLinks(main);
  if (main !== before) {
    fs.writeFileSync(file, m[1] + main + m[3], 'utf8');
    changed += 1;
  }
}

console.log(`Assembly caps enforced on ${changed} pages`);
