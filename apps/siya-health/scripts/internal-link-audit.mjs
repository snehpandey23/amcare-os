/**
 * Internal link graph audit for Siya Health static site.
 * Run: node scripts/internal-link-audit.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BASE = 'https://siya.health';

const SERVICE_PAGES = new Set([
  '/adhd-care',
  '/adhd-screening',
  '/adult-adhd-diagnosis',
  '/adhd-treatment-online',
  '/pricing',
  '/creyos-adhd-testing',
  '/online-adhd-test',
  '/weight-loss-metabolic-health',
  '/telehealth',
  '/mens-health-longevity',
  '/book-appointment',
  '/primary-urgent-care',
  '/about',
]);

const HIGH_AUTHORITY = new Set([
  '/',
  '/adhd-care',
  '/blog',
  '/blog/adhd',
  '/answers',
  '/about',
  '/weight-loss-metabolic-health',
]);

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

function normalizeHref(href) {
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return null;
  let p = href.split('?')[0].split('#')[0];
  if (!p.startsWith('/')) return null;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function extractLinks(html) {
  const links = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const dest = normalizeHref(m[1]);
    if (!dest) continue;
    const anchor = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
    links.push({ dest, anchor });
  }
  return links;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s*\|\s*Siya Health\s*$/i, '').trim() : '';
}

function classifyPath(p) {
  if (p.startsWith('/blog/') && p !== '/blog') return 'blog';
  if (p.startsWith('/answers/') && p !== '/answers') return 'answer';
  if (p.startsWith('/providers/')) return 'provider';
  if (SERVICE_PAGES.has(p) || p.startsWith('/adhd-diagnosis')) return 'service';
  if (['/privacy-policy', '/terms'].includes(p)) return 'legal';
  return 'page';
}

function topicFromPath(p, title) {
  const t = `${p} ${title}`.toLowerCase();
  if (/adhd|adderall|vyvanse|focalin|asrs|creyos|stimulant|executive|rejection|time-blindness/.test(t)) return 'adhd';
  if (/weight|glp|semaglutide|tirzepatide|phentermine|metabolic|obesity|food/.test(t)) return 'metabolic';
  if (/testosterone|trt|sildenafil|erectile|minoxidil|libido|fertility|shbg|hormone|mens-health/.test(t)) return 'hormone';
  if (/sleep|insomnia|ambien|fatigue|burnout|recovery|energy/.test(t)) return 'energy';
  return 'general';
}

function scoreRelatedness(srcPath, srcTitle, candPath, candTitle) {
  const st = topicFromPath(srcPath, srcTitle);
  const ct = topicFromPath(candPath, candTitle);
  let score = 0;
  if (st === ct && st !== 'general') score += 5;
  if (srcPath.startsWith('/blog/') && candPath.startsWith('/answers/')) score += 2;
  if (srcPath.startsWith('/answers/') && candPath.startsWith('/blog/')) score += 2;
  if (SERVICE_PAGES.has(candPath)) score += 1;
  const sw = new Set(`${srcPath} ${srcTitle}`.toLowerCase().split(/[^a-z0-9]+/));
  const cw = `${candPath} ${candTitle}`.toLowerCase().split(/[^a-z0-9]+/);
  for (const w of cw) {
    if (w.length > 4 && sw.has(w)) score += 1;
  }
  return score;
}

const files = walkHtml(SITE_ROOT);
const pathToFile = new Map(files.map((f) => [fileToPath(f), f]));
const allPaths = new Set(files.map(fileToPath));
const outbound = new Map();
const inbound = new Map();

for (const p of allPaths) inbound.set(p, []);

for (const rel of files) {
  const src = fileToPath(rel);
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const links = extractLinks(html);
  const unique = new Map();
  for (const { dest, anchor } of links) {
    if (!allPaths.has(dest) && !dest.startsWith('/adhd-diagnosis')) continue;
    if (!unique.has(dest)) unique.set(dest, anchor);
  }
  outbound.set(src, [...unique.entries()].map(([dest, anchor]) => ({ dest, anchor })));
  for (const { dest } of links) {
    const d = normalizeHref(
      links.find((l) => l.dest === dest)?.dest || dest,
    );
    if (!d) continue;
    if (allPaths.has(d)) {
      if (!inbound.has(d)) inbound.set(d, []);
      inbound.get(d).push(src);
    }
  }
}

// Rebuild inbound correctly
for (const p of allPaths) inbound.set(p, []);
for (const rel of files) {
  const src = fileToPath(rel);
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  for (const { dest } of extractLinks(html)) {
    if (allPaths.has(dest)) {
      inbound.get(dest).push(src);
    }
  }
}

const navPaths = new Set(['/', '/about', '/adhd-care', '/weight-loss-metabolic-health', '/telehealth', '/blog', '/answers']);
for (const rel of files) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  if (html.includes('nav-center') || html.includes('nav-mobile')) {
    for (const p of navPaths) navPaths.add(p);
  }
}

const zeroInbound = [...allPaths].filter((p) => inbound.get(p).length === 0);
const under3 = [...allPaths].filter((p) => {
  const unique = new Set(inbound.get(p));
  return unique.size < 3;
});

const blogArticles = files.filter((f) => f.startsWith('blog/') && !['blog/index.html', 'blog/adhd.html', 'blog/weight-loss.html', 'blog/telehealth.html', 'blog/all.html'].includes(f));

const blogNoService = [];
for (const rel of blogArticles) {
  const src = fileToPath(rel);
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const links = extractLinks(html).map((l) => l.dest);
  const hasService = links.some((d) => SERVICE_PAGES.has(d) || d === '/adhd-care' || d === '/adhd-screening');
  if (!hasService) blogNoService.push(src);
}

const serviceNoBlog = [];
for (const sp of SERVICE_PAGES) {
  if (!allPaths.has(sp)) continue;
  const rel = pathToFile.get(sp);
  if (!rel) continue;
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const links = extractLinks(html).map((l) => l.dest);
  if (!links.some((d) => d.startsWith('/blog/') || d === '/blog')) serviceNoBlog.push(sp);
}

// Suggested new links (high value, not already present)
const suggestions = [];
const addSuggestion = (src, dest, anchor, why) => {
  const srcLinks = outbound.get(src) || [];
  if (srcLinks.some((l) => l.dest === dest)) return;
  suggestions.push({ src, dest, anchor, why });
};

const pagesMeta = new Map();
for (const rel of files) {
  const p = fileToPath(rel);
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  pagesMeta.set(p, { title: extractTitle(html), type: classifyPath(p), rel });
}

// Cross-link patterns
for (const rel of blogArticles) {
  const src = fileToPath(rel);
  const topic = topicFromPath(src, pagesMeta.get(src).title);
  if (topic === 'adhd') {
    addSuggestion(src, '/adhd-care', 'ADHD evaluation and care', 'Convert educational readers to primary service');
    addSuggestion(src, '/answers', 'Browse Health Guides', 'Deepen engagement + AI retrieval hub');
  }
  if (topic === 'metabolic') {
    addSuggestion(src, '/weight-loss-metabolic-health', 'Medical weight loss programs', 'Service conversion path');
  }
}

for (const sp of ['/adhd-care', '/weight-loss-metabolic-health', '/mens-health-longevity', '/telehealth']) {
  if (!allPaths.has(sp)) continue;
  addSuggestion(sp, '/answers', 'Clinical Q&A library', 'Distribute authority to citation pages');
  addSuggestion(sp, '/blog/adhd', 'ADHD articles', 'Topic cluster upward link');
}

// Continue reading per blog
const continueReading = {};
for (const rel of blogArticles) {
  const src = fileToPath(rel);
  const srcTitle = pagesMeta.get(src).title;
  const candidates = [...allPaths].filter((p) => p !== src && p !== '/blog');
  const scored = candidates
    .map((p) => ({
      p,
      score: scoreRelatedness(src, srcTitle, p, pagesMeta.get(p)?.title || ''),
      title: pagesMeta.get(p)?.title || p,
    }))
    .filter((c) => c.score >= 3)
    .sort((a, b) => b.score - a.score);
  const picks = [];
  const seenTopic = new Set();
  for (const c of scored) {
    if (picks.length >= 5) break;
    const tp = topicFromPath(c.p, c.title);
    if (seenTopic.has(tp) && picks.length >= 2) continue;
    picks.push(c);
    seenTopic.add(tp);
  }
  while (picks.length < 3) {
    const extra = scored.find((c) => !picks.includes(c));
    if (!extra) break;
    picks.push(extra);
  }
  continueReading[src] = picks.slice(0, 5);
}

const report = {
  generated: new Date().toISOString().split('T')[0],
  totalPages: allPaths.size,
  zeroInbound: zeroInbound.sort(),
  under3Inbound: under3.map((p) => ({ path: p, count: new Set(inbound.get(p)).size })).sort((a, b) => a.count - b.count),
  blogNoServiceLink: blogNoService,
  serviceNoBlogLink: serviceNoBlog,
  highAuthorityOutbound: [...HIGH_AUTHORITY].map((p) => ({
    path: p,
    outboundCount: (outbound.get(p) || []).length,
    uniqueInbound: new Set(inbound.get(p) || []).size,
  })),
  topSuggestions: suggestions.slice(0, 40),
  continueReading,
  inboundCounts: Object.fromEntries(
    [...allPaths].map((p) => [p, new Set(inbound.get(p)).size]).sort((a, b) => b[1] - a[1]),
  ),
};

const outPath = path.join(SITE_ROOT, 'data', 'internal-link-audit.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log('Wrote', outPath);
console.log('Pages:', allPaths.size);
console.log('Zero inbound:', zeroInbound.length);
console.log('Under 3 inbound:', under3.length);
console.log('Blog without service link:', blogNoService.length);
console.log('Service without blog link:', serviceNoBlog.length);
