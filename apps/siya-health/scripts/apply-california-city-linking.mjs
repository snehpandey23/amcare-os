/**
 * California ADHD linking — statewide hubs only.
 *
 * Geo consolidation (Governance v1.0): city treatment clones were retired.
 * This script STRIPS metro directories and injects a capped statewide next-step.
 * It never re-links /blog/adhd-treatment-*-ca pages.
 *
 * Run: node scripts/apply-california-city-linking.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

/** Statewide CA blogs that may carry a capped statewide next-step (no metros). */
const CA_STATE_BLOGS = [
  'blog/online-adhd-diagnosis-california.html',
  'blog/adhd-telehealth-california.html',
  'blog/how-to-choose-adhd-provider-california.html',
  'blog/adhd-medication-options-california.html',
  'blog/adhd-medication-online-california.html',
  'blog/adhd-evaluation-california-online-vs-in-person.html',
  'blog/adhd-testing-online-california-screening-vs-evaluation.html',
  'blog/adult-adhd-symptoms-california.html',
];

/** Retired city stubs — never inject content into these. */
const RETIRED_CITY_PAGES = [
  'blog/adhd-treatment-los-angeles-ca.html',
  'blog/adhd-treatment-san-diego-ca.html',
  'blog/adhd-treatment-san-francisco-ca.html',
  'blog/adhd-treatment-san-jose-ca.html',
  'blog/adhd-treatment-sacramento-ca.html',
  'blog/adhd-treatment-oakland-ca.html',
  'blog/adhd-treatment-orange-county-ca.html',
];

const STRIP_MARKERS = [
  'CA-CITY-CLUSTER',
  'CA-GEO-PARAGRAPH',
  'CA-CITY-SIBLINGS',
  'CA-CITY-ANSWER',
  'CA-CITY-HUB-CARDS',
  'CA-CITY-INDEX',
];

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, html) {
  fs.writeFileSync(path.join(ROOT, rel), html);
}
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function softStrip(html, marker) {
  const re = new RegExp(`<!--\\s*SIYA:${marker}\\s*-->[\\s\\S]*?<!--\\s*/SIYA:${marker}\\s*-->\\s*`, 'g');
  return html.replace(re, '');
}

function upsertMarkerBlock(html, marker, block) {
  const start = `<!-- SIYA:${marker} -->`;
  const end = `<!-- /SIYA:${marker} -->`;
  const wrapped = `${start}\n${block}\n${end}`;
  html = softStrip(html, marker);
  if (html.includes('<section class="related-articles"')) {
    return html.replace('<section class="related-articles"', `${wrapped}\n            <section class="related-articles"`);
  }
  if (html.includes('</main>')) {
    return html.replace('</main>', `      ${wrapped}\n    </main>`);
  }
  return html + '\n' + wrapped;
}

/** Capped statewide next-step — no metro directory (assembly ≤3 links + context). */
function statewideNextStepBlock() {
  return `            <aside class="blog-internal-links ca-statewide-next" aria-label="California ADHD next steps" data-assembly="ca-statewide">
              <p>For California adults: read <a href="/blog/online-adhd-diagnosis-california">online ADHD diagnosis in California</a>, <a href="/blog/adhd-telehealth-california">ADHD telehealth in California</a>, or start with <a href="/adult-adhd-screening-california">California ADHD screening</a>.</p>
              <p><a class="button ds-button ds-button--primary" href="/adhd-care" data-siya-track="primary-cta-click" data-siya-location="ca-statewide-next">Explore ADHD Care →</a></p>
            </aside>`;
}

let n = 0;

// 1) Strip metro markers from statewide blogs; inject capped statewide next-step
for (const rel of CA_STATE_BLOGS) {
  if (!exists(rel)) continue;
  let html = read(rel);
  for (const m of STRIP_MARKERS) html = softStrip(html, m);
  // Also strip bare legacy metro hrefs that aren't in markers
  html = html.replace(/href="\/blog\/adhd-treatment-(los-angeles|san-diego|san-francisco|san-jose|sacramento|oakland|orange-county)-ca"/g, 'href="/adhd-care"');
  html = upsertMarkerBlock(html, 'CA-STATEWIDE-NEXT', statewideNextStepBlock());
  write(rel, html);
  console.log('OK state', rel);
  n += 1;
}

// 2) Screening page — statewide only, no metro strip
if (exists('adult-adhd-screening-california.html')) {
  let html = read('adult-adhd-screening-california.html');
  for (const m of STRIP_MARKERS) html = softStrip(html, m);
  html = html.replace(/href="\/blog\/adhd-treatment-(los-angeles|san-diego|san-francisco|san-jose|sacramento|oakland|orange-county)-ca"/g, 'href="/adhd-care"');
  write('adult-adhd-screening-california.html', html);
  console.log('OK screening adult-adhd-screening-california.html');
  n += 1;
}

// 3) ADHD care — ensure no CA metro strip
if (exists('adhd-care.html')) {
  let html = read('adhd-care.html');
  const before = html;
  for (const m of STRIP_MARKERS) html = softStrip(html, m);
  if (html !== before) {
    write('adhd-care.html', html);
    console.log('OK adhd-care (removed CA metro strip)');
    n += 1;
  } else {
    console.log('SKIP adhd-care (no CA metro strip)');
  }
}

// 4) Blog ADHD hub — strip metro cards / city index
if (exists('blog/adhd.html')) {
  let html = read('blog/adhd.html');
  for (const m of STRIP_MARKERS) html = softStrip(html, m);
  html = html.replace(/href="\/blog\/adhd-treatment-(los-angeles|san-diego|san-francisco|san-jose|sacramento|oakland|orange-county)-ca"/g, 'href="/adhd-care"');
  // Soft-replace TX/FL/PA city treatment links too (retired)
  html = html.replace(/href="\/blog\/adhd-treatment-(houston|austin|dallas|fort-worth|san-antonio)-tx"/g, 'href="/blog/adhd-treatment-texas"');
  html = html.replace(/href="\/blog\/adhd-treatment-(miami|orlando)-fl"/g, 'href="/adhd-care"');
  html = html.replace(/href="\/blog\/adhd-treatment-philadelphia-pa"/g, 'href="/adhd-care"');
  write('blog/adhd.html', html);
  console.log('OK blog/adhd hub');
  n += 1;
}

// 5) Educational guides — ensure CA-CITY-ANSWER stays stripped
for (const rel of [
  'answers/can-adhd-be-diagnosed-online.html',
  'answers/is-online-adhd-diagnosis-legitimate.html',
  'answers/screening-vs-adhd-evaluation.html',
  'answers/how-long-adhd-evaluation.html',
  'answers/what-included-199-adhd-evaluation.html',
  'answers/late-adhd-diagnosis-adults.html',
  'answers/signs-of-adult-adhd.html',
  'answers/adhd-in-women.html',
]) {
  if (!exists(rel)) continue;
  let html = read(rel);
  const before = html;
  html = softStrip(html, 'CA-CITY-ANSWER');
  if (html !== before) {
    write(rel, html);
    console.log('OK answer (stripped CA-CITY-ANSWER)', rel);
    n += 1;
  }
}

// 6) Confirm retired city pages stay stubs (do not enrich)
for (const rel of RETIRED_CITY_PAGES) {
  if (!exists(rel)) continue;
  const html = read(rel);
  if (!/noindex/i.test(html)) {
    console.warn('WARN: retired city page missing noindex:', rel);
  }
}

console.log(`California linking applied (statewide only): ${n} files`);
