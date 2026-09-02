/**
 * Crawl architecture report — internal link graph metrics only.
 * Run: node scripts/generate-crawl-architecture-report.mjs
 * Requires: node scripts/internal-link-audit.mjs (writes data/internal-link-audit.json)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isAuditExcludedPath } from '../data/retired-pages.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'docs', 'CRAWL-ARCHITECTURE-REPORT.md');
const AUDIT_PATH = path.join(SITE_ROOT, 'data', 'internal-link-audit.json');

const SKIP_PREFIXES = ['/redirect/', 'mailto:', 'tel:'];
const ROOT = '/';

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['public', 'node_modules', 'scripts', 'data', 'docs'].includes(e.name)) continue;
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
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) {
    return null;
  }
  let p = href.split('?')[0].split('#')[0];
  if (!p.startsWith('/')) return null;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s*\|\s*Siya Health\s*$/i, '').trim().slice(0, 70) : '';
}

function buildGraph() {
  const files = walkHtml(SITE_ROOT);
  const allPaths = new Set(files.map(fileToPath));
  const outbound = new Map();
  const inbound = new Map();
  const titles = new Map();

  for (const p of allPaths) {
    inbound.set(p, new Set());
    outbound.set(p, new Set());
  }

  for (const rel of files) {
    const src = fileToPath(rel);
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    titles.set(src, extractTitle(html));
    const dests = new Set();
    const re = /<a\s+[^>]*href=["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(html)) !== null) {
      const dest = normalizeHref(m[1]);
      if (!dest) continue;
      if (SKIP_PREFIXES.some((pre) => dest.startsWith(pre))) continue;
      if (!allPaths.has(dest)) continue;
      dests.add(dest);
    }
    outbound.set(src, dests);
    for (const d of dests) {
      if (inbound.has(d)) inbound.get(d).add(src);
    }
  }

  return { allPaths, outbound, inbound, titles, files };
}

function computeCrawlDepths(allPaths, outbound, root = ROOT) {
  const depth = new Map();
  const queue = [{ path: root, d: 0 }];
  depth.set(root, 0);

  while (queue.length) {
    const { path: current, d } = queue.shift();
    for (const next of outbound.get(current) || []) {
      if (depth.has(next)) continue;
      depth.set(next, d + 1);
      queue.push({ path: next, d: d + 1 });
    }
  }

  for (const p of allPaths) {
    if (!depth.has(p)) depth.set(p, null);
  }
  return depth;
}

function main() {
  const { allPaths, outbound, inbound, titles, files } = buildGraph();
  const depth = computeCrawlDepths(allPaths, outbound);

  const reachable = [...depth.entries()].filter(([, d]) => d !== null);
  const avgDepth =
    reachable.length > 0
      ? reachable.reduce((sum, [, d]) => sum + d, 0) / reachable.length
      : 0;

  const depthDistribution = {};
  for (const [, d] of reachable) {
    depthDistribution[d] = (depthDistribution[d] || 0) + 1;
  }

  const inboundCounts = [...allPaths].map((p) => ({
    path: p,
    count: inbound.get(p).size,
    title: titles.get(p) || p,
  }));

  const orphansAll = inboundCounts.filter((x) => x.count === 0 && x.path !== ROOT);
  const orphans = orphansAll.filter((x) => {
    const rel = files.find((f) => fileToPath(f) === x.path);
    const html = rel ? fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8') : '';
    return !isAuditExcludedPath(x.path, html);
  });
  const orphansExcluded = orphansAll.length - orphans.length;
  const under2 = inboundCounts.filter((x) => x.count < 2 && x.path !== ROOT);
  const over100Out = [...allPaths]
    .map((p) => ({ path: p, count: outbound.get(p).size, title: titles.get(p) || p }))
    .filter((x) => x.count > 100);
  const over100In = inboundCounts.filter((x) => x.count > 100);
  const top20Inbound = [...inboundCounts].sort((a, b) => b.count - a.count).slice(0, 20);

  const unreachable = [...depth.entries()].filter(([, d]) => d === null).map(([p]) => p);

  const report = `# Crawl architecture report

Generated: ${new Date().toISOString()}

Internal link graph analysis only — not a general SEO audit.

## Summary

| Metric | Value |
|--------|------:|
| Total indexable HTML pages | ${allPaths.size} |
| Pages reachable from \`/\` | ${reachable.length} |
| Unreachable from \`/\` (by internal links) | ${unreachable.length} |
| **Average crawl depth** (reachable pages) | **${avgDepth.toFixed(2)}** |
| Orphan pages (0 inbound internal links) | ${orphans.length} |
| Orphan pages excluded (retired/stubs/utilities) | ${orphansExcluded} |
| Pages with &lt; 2 inbound links | ${under2.length} |
| Pages with &gt; 100 outbound internal links | ${over100Out.length} |
| Pages with &gt; 100 inbound internal links | ${over100In.length} |

## Crawl depth distribution

| Depth from homepage | Pages |
|--------------------:|------:|
${Object.entries(depthDistribution)
  .sort((a, b) => Number(a[0]) - Number(b[0]))
  .map(([d, n]) => `| ${d} | ${n} |`)
  .join('\n')}

## Top 20 most internally linked pages (inbound)

| Rank | Inbound links | Path | Title |
|------|-------------:|------|-------|
${top20Inbound.map((x, i) => `| ${i + 1} | ${x.count} | \`${x.path}\` | ${x.title.replace(/\|/g, '\\|')} |`).join('\n')}

## Orphan pages (0 inbound internal links)

_Actionable only — retired noindex stubs, redirect shells, and /redirect/* utilities are excluded (${orphansExcluded} excluded)._

${orphans.length ? orphans.map((x) => `- \`${x.path}\` — ${x.title}`).join('\n') : '_None_'}

## Pages with fewer than 2 inbound links

${under2.length ? under2.slice(0, 40).map((x) => `- \`${x.path}\` (${x.count} inbound) — ${x.title}`).join('\n') : '_None_'}
${under2.length > 40 ? `\n_…and ${under2.length - 40} more._` : ''}

## Pages with more than 100 outbound internal links

${over100Out.length ? over100Out.map((x) => `- \`${x.path}\` (${x.count} outbound) — ${x.title}`).join('\n') : '_None_'}

## Pages with more than 100 inbound internal links

${over100In.length ? over100In.map((x) => `- \`${x.path}\` (${x.count} inbound) — ${x.title}`).join('\n') : '_None_'}

## Unreachable from homepage (internal link graph)

${unreachable.length ? unreachable.slice(0, 30).map((p) => `- \`${p}\``).join('\n') : '_All pages reachable from `/`._'}
${unreachable.length > 30 ? `\n_…and ${unreachable.length - 30} more._` : ''}

## Remaining weak points

1. **Orphans** — add at least one inbound link from a hub (\`/answers\`, \`/blog\`, or service page).
2. **Depth &gt; 4** — consider linking high-value pages from shallower hubs.
3. **Low inbound (&lt; 2)** — informational pages need cluster/hub links (see content hierarchy).
4. **High outbound (&gt; 100)** — usually hub pages; expected if listing many children.

---

_Run \`node scripts/internal-link-audit.mjs && node scripts/generate-crawl-architecture-report.mjs\` after HTML changes._
`;

  fs.writeFileSync(OUT, report, 'utf8');
  console.log('Wrote', OUT);
  console.log(`Avg depth: ${avgDepth.toFixed(2)}; orphans: ${orphans.length}; under-2-inbound: ${under2.length}`);
}

main();
