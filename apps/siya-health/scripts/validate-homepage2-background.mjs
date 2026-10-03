/**
 * Fail the build if a live page is missing the homepage2 motion background.
 * Covers every URL in sitemap.xml plus the reachable pages that stay out of the sitemap.
 *
 * Run: node scripts/validate-homepage2-background.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Reachable HTML that sitemap.xml does not list. */
const UNSITEMAP_FILES = [
  'join-our-team.html',
  'intake/index.html',
  'redirect/meet-greet/index.html',
  'redirect/chat/index.html',
  'redirect/adhd-walkthrough/index.html',
  'redirect/adhd-evaluation/index.html',
];

function pathToFile(urlPath) {
  if (urlPath === '/' || urlPath === '') return path.join(SITE_ROOT, 'index.html');
  const rel = urlPath.replace(/^\//, '').replace(/\/$/, '');
  const candidates = [
    path.join(SITE_ROOT, `${rel}.html`),
    path.join(SITE_ROOT, rel, 'index.html'),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function fileToUrl(rel) {
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'/index.html'.length)}`;
  if (rel.endsWith('.html')) return `/${rel.slice(0, -'.html'.length)}`;
  return `/${rel}`;
}

function loadTargets() {
  const sitemap = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
  const locs = [...sitemap.matchAll(/<loc>https:\/\/siya\.health([^<]*)<\/loc>/g)].map((match) => match[1] || '/');
  const rows = [];
  for (const urlPath of locs) {
    const file = pathToFile(urlPath);
    rows.push({
      url: urlPath || '/',
      rel: file ? path.relative(SITE_ROOT, file) : null,
      file,
    });
  }
  for (const rel of UNSITEMAP_FILES) {
    rows.push({
      url: fileToUrl(rel),
      rel,
      file: path.join(SITE_ROOT, rel),
    });
  }
  return rows;
}

function missingMarks(html) {
  const missing = [];
  const body = html.match(/<body\b[^>]*>/i);
  if (!body || !/\bsiya-h2-surface\b/.test(body[0])) missing.push('siya-h2-surface');
  if (!html.includes('class="siya-h2-page-bg"') && !html.includes("class='siya-h2-page-bg'")) {
    missing.push('siya-h2-page-bg');
  }
  return missing;
}

const offenders = [];
for (const row of loadTargets()) {
  if (!row.file || !fs.existsSync(row.file)) {
    offenders.push(`${row.url}  MISSING FILE  ${row.rel || '(no html for sitemap URL)'}`);
    continue;
  }
  const missing = missingMarks(fs.readFileSync(row.file, 'utf8'));
  if (missing.length) offenders.push(`${row.url}  missing ${missing.join(', ')}  ${row.rel}`);
}

if (offenders.length) {
  console.error(`homepage2 background check FAILED (${offenders.length} page${offenders.length === 1 ? '' : 's'}):`);
  for (const line of offenders) console.error(`  ${line}`);
  process.exit(1);
}

console.log(`homepage2 background check passed (${loadTargets().length} pages).`);
