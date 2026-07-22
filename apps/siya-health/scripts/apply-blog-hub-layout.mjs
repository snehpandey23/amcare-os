/**
 * Blog hub layout — reading-first hero, search, no master index dump.
 * Run: node scripts/apply-blog-hub-layout.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SIYA_CIRCLE_GHL_FORM_URL,
  SIYA_CIRCLE_JOIN_TRACK,
} from '../data/siya-circle-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(__dirname, '..', 'blog', 'index.html');

function heroCtasHtml() {
  return `          <div class="hero-ctas">
            <a href="${SIYA_CIRCLE_GHL_FORM_URL}" class="button ds-button ds-button--primary" target="_blank" rel="noopener noreferrer" data-siya-location="hero" data-page-type="blog" data-intent="blog" data-conversion-goal="newsletter" data-cta-slot="newsletter" data-component="button" data-siya-track="${SIYA_CIRCLE_JOIN_TRACK}">Join our newsletter</a>
            <a href="/answers" class="button ds-button ds-button--secondary secondary" data-siya-location="hero" data-page-type="blog" data-intent="blog" data-conversion-goal="healthGuides" data-cta-slot="healthGuides" data-component="button">Read health guides</a>
          </div>`;
}

const SEARCH_BLOCK = `<!-- SIYA:BLOG-SEARCH -->
          <div class="blog-search" role="search" aria-labelledby="blog-search-label">
            <label id="blog-search-label" for="blog-search-input">Search articles</label>
            <input type="search" id="blog-search-input" name="q" placeholder="Try sleep, ADHD, GLP-1, telehealth…" autocomplete="off" enterkeyhint="search" />
            <p id="blog-search-status" class="blog-search-status" hidden aria-live="polite"></p>
            <div id="blog-search-results" class="blog-search-results" hidden></div>
          </div>
          <!-- /SIYA:BLOG-SEARCH -->`;

function apply(html) {
  let next = html;

  next = next.replace(/<!-- SIYA:BLOG-CIRCLE -->[\s\S]*?<!-- \/SIYA:BLOG-CIRCLE -->\s*/g, '');

  next = next.replace(/<div class="hero-ctas">[\s\S]*?<\/div>/, heroCtasHtml());

  next = next.replace(/<!-- SIYA:BLOG-MASTER-INDEX -->[\s\S]*?<!-- \/SIYA:BLOG-MASTER-INDEX -->\s*/g, '');

  next = next.replace(
    /\s*<p class="blog-hub-see-all"><!-- SIYA:CA-CITY-INDEX -->[\s\S]*?<!-- \/SIYA:CA-CITY-INDEX --><\/p>/g,
    '',
  );

  next = next.replace(
    /<p class="lead" style="margin-left: auto; margin-right: auto;">Jump to a topic or open the full index—every article stays indexable\.<\/p>/,
    '<p class="lead" style="margin-left: auto; margin-right: auto;">Open a topic hub to explore articles by clinical area.</p>',
  );

  next = next.replace(
    /<nav class="blog-hub-categories"[\s\S]*?<\/nav>/,
    `          <nav class="blog-hub-categories" aria-label="Blog categories">
            <a href="/blog/adhd">ADHD</a>
            <a href="/blog/weight-loss">Weight loss</a>
            <a href="/blog/telehealth">Telehealth</a>
          </nav>`,
  );

  next = next.replace(
    /<p class="blog-hub-see-all" style="margin-top: 0;">[\s\S]*?<\/p>\s*/,
    '',
  );

  if (!next.includes('SIYA:BLOG-SEARCH')) {
    next = next.replace(
      /(<section class="section blog-featured">[\s\S]*?<div class="section-header">[\s\S]*?<\/div>\s*)/,
      `$1${SEARCH_BLOCK}\n`,
    );
  }

  if (!next.includes('blog-search.js')) {
    next = next.replace(
      /<!-- SIYA:HEADER-SCROLL -->/,
      '<!-- SIYA:BLOG-SEARCH-SCRIPT -->\n    <script src="/scripts/blog-search.js" defer></script>\n    <!-- /SIYA:BLOG-SEARCH-SCRIPT -->\n<!-- SIYA:HEADER-SCROLL -->',
    );
  }

  return next;
}

function main() {
  const html = fs.readFileSync(INDEX_PATH, 'utf8');
  const updated = apply(html);
  if (updated !== html) {
    fs.writeFileSync(INDEX_PATH, updated, 'utf8');
    console.log('Blog hub layout applied.');
  } else {
    console.log('Blog hub layout already up to date.');
  }
}

main();
