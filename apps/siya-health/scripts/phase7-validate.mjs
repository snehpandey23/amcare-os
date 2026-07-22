/**
 * Phase 7 — Post-build crawl health validation gates.
 * Run: node scripts/phase7-validate.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ALL_REDIRECT_SOURCES, resolveCanonicalPath } from '../data/redirect-map.mjs';
import { ADHD_COMMERCIAL_PATHS } from '../data/adhd-commercial-links.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BASE = 'https://siya.health';

const vercel = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'vercel.json'), 'utf8'));
const vercelRedirects = {};
for (const r of vercel.redirects) {
  if (r.has) continue;
  vercelRedirects[r.source.replace(/:path\*$/, '')] = r.destination;
}

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['public', 'node_modules', 'scripts', 'data'].includes(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) out.push(...walkHtml(path.join(dir, e.name), rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function fileToPath(rel) {
  if (rel === 'index.html') return '/';
  if (rel === 'blog/index.html') return '/blog';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.replace(/\.html$/i, '');
}

const sitemap = new Set();
const xml = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
for (const m of xml.matchAll(/<loc>https:\/\/siya\.health([^<]+)<\/loc>/g)) sitemap.add(m[1]);

const allPaths = new Set(walkHtml(SITE_ROOT).map(fileToPath));
const errors = [];

for (const url of sitemap) {
  if (vercelRedirects[url] || ALL_REDIRECT_SOURCES.has(url)) {
    errors.push(`P0: sitemap contains redirect source ${url}`);
  }
}

for (const rel of walkHtml(SITE_ROOT)) {
  const src = fileToPath(rel);
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const canon = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1] || '';
  const canonPath = canon.replace(BASE, '').replace('https://www.siya.health', '');
  if (
    canonPath &&
    src !== '/siya-circle' &&
    (vercelRedirects[canonPath] || ALL_REDIRECT_SOURCES.has(canonPath))
  ) {
    errors.push(`P0: ${src} canonical points to redirect ${canonPath}`);
  }
  const re = /<a[^>]+href=["']([^"'#?]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    let h = m[1];
    if (!h.startsWith('/') || h.startsWith('//')) continue;
    if (h.endsWith('/') && h.length > 1) h = h.slice(0, -1);
    if (vercelRedirects[h] || ALL_REDIRECT_SOURCES.has(h)) {
      if (ADHD_COMMERCIAL_PATHS.has(h)) continue;
      errors.push(`P0: ${src} links to redirect source ${h} (use ${resolveCanonicalPath(h)})`);
    }
  }
}

if (errors.length) {
  console.error('Phase 7 validation FAILED:');
  for (const e of errors.slice(0, 30)) console.error(' ', e);
  if (errors.length > 30) console.error(`  ... and ${errors.length - 30} more`);
  process.exit(1);
}

console.log('Phase 7 validation PASS');
console.log('  Sitemap URLs:', sitemap.size);
console.log('  Redirect rules:', Object.keys(vercelRedirects).length);
console.log('  Broken internal links to redirect sources: 0');
console.log('  Canonical-to-redirect issues: 0');
