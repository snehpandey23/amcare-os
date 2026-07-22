/**
 * Phase 7 — Full crawl inventory for all HTML routes.
 * Run: node scripts/phase7-crawl-inventory.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ALL_REDIRECT_SOURCES,
  EXTERNAL_REDIRECT_SOURCES,
  REDIRECT_SHELL_FILES,
  resolveCanonicalPath,
} from '../data/redirect-map.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BASE = 'https://siya.health';

const vercel = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'vercel.json'), 'utf8'));
/** @type {Record<string, string>} */
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
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
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
if (fs.existsSync(path.join(SITE_ROOT, 'sitemap.xml'))) {
  const xml = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
  for (const m of xml.matchAll(/<loc>https:\/\/siya\.health([^<]+)<\/loc>/g)) sitemap.add(m[1]);
}

const files = walkHtml(SITE_ROOT);
const inbound = new Map();
for (const rel of files) {
  const p = fileToPath(rel);
  inbound.set(p, 0);
}

for (const rel of files) {
  const src = fileToPath(rel);
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const re = /<a[^>]+href=["']([^"'#?]+)/gi;
  let m;
  while ((m = re.exec(html))) {
    let h = m[1];
    if (!h.startsWith('/') || h.startsWith('//')) continue;
    if (h.endsWith('/') && h.length > 1) h = h.slice(0, -1);
    if (inbound.has(h)) inbound.set(h, (inbound.get(h) || 0) + 1);
  }
}

const rows = [];
let issues = { sitemapRedirect: 0, badCanonical: 0, linksToRedirect: 0, missingCanonical: 0 };

for (const rel of files.sort()) {
  const urlPath = fileToPath(rel);
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const canonical = (html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i) || [])[1] || '';
  const robots = (html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i) || [])[1] || 'index, follow';
  const redirectTarget = vercelRedirects[urlPath] || (ALL_REDIRECT_SOURCES.has(urlPath) ? resolveCanonicalPath(urlPath) : '');
  const inSitemap = sitemap.has(urlPath);
  const indexable = !/noindex/i.test(robots) && !EXTERNAL_REDIRECT_SOURCES.has(urlPath);
  const linkCount = inbound.get(urlPath) || 0;

  if (inSitemap && redirectTarget) issues.sitemapRedirect++;
  if (!canonical) issues.missingCanonical++;

  const canonPath = canonical.replace(BASE, '').replace('https://www.siya.health', '');
  if (canonPath && (ALL_REDIRECT_SOURCES.has(canonPath) || vercelRedirects[canonPath])) issues.badCanonical++;

  const hrefRe = /<a[^>]+href=["']([^"'#?]+)/gi;
  let hm;
  while ((hm = hrefRe.exec(html))) {
    let h = hm[1];
    if (!h.startsWith('/') || h.startsWith('//')) continue;
    if (h.endsWith('/') && h.length > 1) h = h.slice(0, -1);
    if (ALL_REDIRECT_SOURCES.has(h) || vercelRedirects[h]) issues.linksToRedirect++;
  }

  rows.push({
    urlPath,
    rel,
    status: redirectTarget ? '301' : '200',
    canonical: canonical || '—',
    indexable: indexable ? 'yes' : 'no',
    sitemap: inSitemap ? 'yes' : 'no',
    inbound: linkCount,
    redirectTarget: redirectTarget || '—',
  });
}

const md = [];
md.push('# Phase 7 — Crawl Inventory');
md.push('');
md.push(`**Generated:** ${new Date().toISOString().split('T')[0]}`);
md.push(`**HTML routes:** ${files.length} · **Sitemap URLs:** ${sitemap.size}`);
md.push('');
md.push('## Issue summary');
md.push('');
md.push('| Check | Count |');
md.push('|-------|------:|');
md.push(`| Sitemap entries that redirect | ${issues.sitemapRedirect} |`);
md.push(`| Internal links to redirect sources | ${issues.linksToRedirect} |`);
md.push(`| Canonical → redirect source | ${issues.badCanonical} |`);
md.push(`| Missing canonical | ${issues.missingCanonical} |`);
md.push('');
md.push('## Route inventory');
md.push('');
md.push('| URL | Status | Indexable | Sitemap | Inbound | Canonical | Redirect |');
md.push('|-----|--------|-----------|---------|--------:|-----------|----------|');
for (const r of rows) {
  md.push(`| ${r.urlPath} | ${r.status} | ${r.indexable} | ${r.sitemap} | ${r.inbound} | ${r.canonical.replace(BASE, '') || '—'} | ${r.redirectTarget} |`);
}

const outPath = path.join(SITE_ROOT, 'docs/PHASE-7-CRAWL-INVENTORY.md');
fs.writeFileSync(outPath, md.join('\n') + '\n', 'utf8');
console.log('Wrote', outPath);
console.log('Issues:', issues);
