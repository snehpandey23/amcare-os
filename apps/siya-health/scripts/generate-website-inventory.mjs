/**
 * Complete website inventory for Siya Health static site.
 * Run: node scripts/generate-website-inventory.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HIGH_OVERLAP_PAIRS } from '../data/cannibalization-phase1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BASE = 'https://siya.health';

const CORE_REVENUE = new Set([
  '/',
  '/adhd-care',
  '/adhd-screening',
  '/weight-loss-metabolic-health',
  '/telehealth',
  '/mens-health-longevity',
  '/membership-pricing',
  '/book-appointment',
  '/primary-urgent-care',
  '/prescriptions',
  '/labs',
  '/adult-adhd-diagnosis',
  '/adhd-treatment-online',
  '/adhd-evaluation-cost',
  '/creyos-adhd-testing',
  '/online-adhd-test',
]);

const GEO_SEO = [
  '/adhd-diagnosis-austin',
  '/adhd-diagnosis-florida',
  '/adhd-diagnosis-houston',
  '/adhd-diagnosis-pennsylvania',
  '/adhd-diagnosis-philadelphia',
  '/adhd-diagnosis-texas',
];

const LEGACY_PATHS = new Set([
  '/terms',
  '/privacy-policy',
]);

/** vercel.json 301 shells — not indexable inventory */
const REDIRECT_SHELL_PATHS = new Set([
  '/terms',
  '/privacy-policy',
  '/adult-adhd-diagnosis',
  '/adhd-treatment-online',
  '/adhd-diagnosis-florida',
  '/adhd-evaluation-cost',
  '/online-adhd-test',
]);

const UTILITY_PATHS = new Set([
  '/intake',
  '/siya-circle',
  '/book-appointment',
]);

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
  if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return null;
  let p = href.split('?')[0].split('#')[0];
  if (!p.startsWith('/')) return null;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

function decodeText(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMain(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

function wordCount(html) {
  const main = extractMain(html);
  const text = main
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ');
  return decodeText(text).split(/\s+/).filter(Boolean).length;
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']+)["']`, 'i');
  const m = html.match(re);
  return m ? decodeText(m[1]) : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? decodeText(m[1].replace(/\s*\|\s*Siya Health\s*$/i, '').trim()) : '';
}

function extractH1(html) {
  const main = extractMain(html);
  const m = main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? decodeText(m[1].replace(/<[^>]+>/g, '')) : '';
}

function extractLinks(html) {
  const links = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const dest = normalizeHref(m[1]);
    if (!dest) continue;
    const anchor = decodeText(m[2].replace(/<[^>]+>/g, ''));
    const cls = (m[0].match(/class=["']([^"']+)["']/i) || [])[1] || '';
    links.push({ dest, anchor, cls, raw: m[0] });
  }
  return links;
}

function isIndexable(html, p) {
  if (REDIRECT_SHELL_PATHS.has(p)) return false;
  const robots = extractMeta(html, 'robots').toLowerCase();
  if (robots.includes('noindex')) return false;
  return true;
}

function detectCTAs(html, links) {
  const main = extractMain(html);
  const bookingRe = /book\.carepatron\.com|link\.yourmarketingai\.com/;
  const mainLinks = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(main)) !== null) {
    const href = m[1];
    const anchor = decodeText(m[2].replace(/<[^>]+>/g, ''));
    const cls = (m[0].match(/class=["']([^"']+)["']/i) || [])[1] || '';
    const isBtn = /\bbutton\b/.test(cls) || bookingRe.test(href);
    if (isBtn && anchor) mainLinks.push({ href, anchor, cls, isSecondary: /\bsecondary\b/.test(cls) });
  }

  const primaryCandidates = mainLinks.filter((l) => !l.isSecondary);
  const secondaryCandidates = mainLinks.filter((l) => l.isSecondary);

  const pick = (arr) => (arr.length ? `${arr[0].anchor} → ${arr[0].href.split('?')[0]}` : '—');

  let primary = pick(primaryCandidates);
  let secondary = pick(secondaryCandidates);

  if (primary === '—' && mainLinks.length) primary = pick(mainLinks);
  if (secondary === '—' && mainLinks.length > 1) {
    const rest = mainLinks.filter((l) => `${l.anchor} → ${l.href.split('?')[0]}` !== primary);
    secondary = rest.length ? pick(rest) : '—';
  }

  return { primary, secondary };
}

function inferPageType(p) {
  if (p === '/') return 'Homepage';
  if (p === '/about') return 'About';
  if (p === '/providers') return 'Provider Hub';
  if (p.startsWith('/providers/')) return 'Provider Profile';
  if (p.startsWith('/legal')) return 'Legal';
  if (p === '/blog' || p === '/blog/adhd' || p === '/blog/weight-loss' || p === '/blog/telehealth' || p === '/blog/all') return 'Blog Hub';
  if (p.startsWith('/blog/')) return 'Blog Article';
  if (p === '/answers') return 'Health Guide Hub';
  if (p.startsWith('/answers/')) return 'Health Guide';
  if (GEO_SEO.includes(p)) return 'Geo SEO Landing';
  if (CORE_REVENUE.has(p)) return 'Service Page';
  if (UTILITY_PATHS.has(p)) return 'Utility';
  if (LEGACY_PATHS.has(p)) return 'Legacy';
  return 'Page';
}

function inferPurpose(p, title, h1, desc, pageType) {
  const t = `${p} ${title} ${h1}`.toLowerCase();
  if (p === '/') return 'Brand entry; route patients to core services and booking';
  if (p === '/about') return 'Build trust; explain mission and care team';
  if (p === '/providers') return 'Show clinician roster; drive profile views and booking';
  if (pageType === 'Provider Profile') return 'Clinician credibility; convert to booking with this provider';
  if (p === '/adhd-care') return 'Convert ADHD evaluation and treatment interest to booking';
  if (p === '/adhd-screening') return 'Top-of-funnel ADHD screening; lead to evaluation';
  if (p === '/weight-loss-metabolic-health') return 'Convert GLP-1 / medical weight loss interest to consult';
  if (p === '/telehealth') return 'Explain virtual care model; route to services';
  if (p === '/membership-pricing') return 'Pricing transparency; reduce friction before booking';
  if (p === '/book-appointment') return 'Direct appointment scheduling entry';
  if (p === '/mens-health-longevity') return 'Men\'s health / TRT / longevity service conversion';
  if (p.startsWith('/legal')) return 'Legal compliance and policy disclosure';
  if (pageType === 'Blog Hub') return 'Content discovery; distribute authority to articles';
  if (pageType === 'Blog Article') return 'Educational SEO; nurture toward clinical services';
  if (pageType === 'Health Guide Hub') return 'FAQ/PAA discovery hub for AI and organic search';
  if (pageType === 'Health Guide') return 'Answer specific patient question; support SEO and conversion';
  if (pageType === 'Geo SEO Landing') return 'Local/state ADHD intent capture; drive evaluation booking';
  if (p === '/intake') return 'Patient intake form (operational)';
  if (p === '/siya-circle') return 'Community membership signup';
  if (LEGACY_PATHS.has(p)) return 'Legacy URL; superseded by /legal/* canonical pages';
  return desc || title || 'General site content';
}

function inferTrafficIntent(p, pageType) {
  if (CORE_REVENUE.has(p) && p !== '/') return 'Commercial / Transactional';
  if (p === '/') return 'Navigational / Commercial';
  if (pageType === 'Provider Profile' || p === '/providers' || p === '/about') return 'Trust / Navigational';
  if (pageType === 'Blog Article' || pageType === 'Health Guide') return 'Informational';
  if (pageType === 'Geo SEO Landing') return 'Local SEO / Commercial';
  if (pageType === 'Legal') return 'Compliance / Navigational';
  if (UTILITY_PATHS.has(p)) return 'Transactional / Utility';
  if (pageType === 'Blog Hub' || pageType === 'Health Guide Hub') return 'Informational / Navigational';
  return 'Mixed';
}

function inferTargetKeyword(p, title, h1, desc) {
  if (h1 && h1.length > 5) return h1.slice(0, 120);
  if (title) return title.slice(0, 120);
  const slug = p.split('/').pop().replace(/-/g, ' ');
  if (desc) return desc.split(/[.!?]/)[0].slice(0, 120);
  return slug;
}

function assignGroup(p, pageType, indexable, inboundCount, duplicateOf) {
  const groups = [];
  if (duplicateOf) groups.push('Duplicate Pages');
  if (inboundCount === 0 && indexable) groups.push('Orphan Pages');
  if (LEGACY_PATHS.has(p)) groups.push('Legacy Pages');
  if (CORE_REVENUE.has(p) || GEO_SEO.includes(p)) groups.push('Core Revenue Pages');
  if (p === '/about' || p === '/providers' || pageType === 'Provider Profile') groups.push('Trust Pages');
  if (pageType === 'Blog Article' || pageType === 'Health Guide' || pageType === 'Blog Hub' || pageType === 'Health Guide Hub') {
    groups.push('Educational Pages');
  }
  if (GEO_SEO.includes(p) || ['/online-adhd-test', '/creyos-adhd-testing', '/adult-adhd-diagnosis', '/adhd-treatment-online', '/adhd-evaluation-cost'].includes(p)) {
    if (!groups.includes('SEO Pages')) groups.push('SEO Pages');
  }
  if (pageType === 'Blog Article' && /california|texas|houston|austin|philadelphia|florida|pennsylvania/.test(p)) {
    if (!groups.includes('SEO Pages')) groups.push('SEO Pages');
  }
  if (UTILITY_PATHS.has(p) || p === '/labs' || p === '/prescriptions' || p === '/primary-urgent-care' || pageType === 'Legal') {
    if (!groups.includes('Utility Pages')) groups.push('Utility Pages');
  }
  if (pageType === 'Legal') groups.push('Trust Pages');
  if (groups.length === 0) groups.push('Utility Pages');
  return [...new Set(groups)];
}

function loadSitemap() {
  const xml = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(BASE, ''));
  return new Set(urls);
}

function buildDuplicateMap() {
  const map = new Map();
  for (const pair of HIGH_OVERLAP_PAIRS) {
    if (pair.classification === 'Duplicate') {
      map.set(pair.guide, pair.blog);
    }
  }
  return map;
}

function escapeCsv(v) {
  const s = String(v ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function main() {
  const files = walkHtml(SITE_ROOT);
  const pathToFile = new Map(files.map((f) => [fileToPath(f), f]));
  const allPaths = [...pathToFile.keys()].sort();
  const sitemapPaths = loadSitemap();
  const duplicateMap = buildDuplicateMap();

  const inbound = new Map(allPaths.map((p) => [p, new Set()]));
  const outbound = new Map(allPaths.map((p) => [p, new Set()]));

  for (const rel of files) {
    const src = fileToPath(rel);
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    for (const { dest } of extractLinks(html)) {
      if (allPaths.includes(dest)) {
        outbound.get(src).add(dest);
        inbound.get(dest).add(src);
      }
    }
  }

  const pages = [];
  for (const p of allPaths) {
    const rel = pathToFile.get(p);
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    const indexable = isIndexable(html, p);
    const title = extractTitle(html);
    const h1 = extractH1(html);
    const desc = extractMeta(html, 'description');
    const pageType = inferPageType(p);
    const links = extractLinks(html);
    const ctas = detectCTAs(html, links);
    const wc = wordCount(html);
    const inCount = inbound.get(p).size;
    const outCount = outbound.get(p).size;
    const dupPair = duplicateMap.get(p);
    const groups = assignGroup(p, pageType, indexable, inCount, dupPair);

    pages.push({
      url: `${BASE}${p}`,
      path: p,
      pageType,
      primaryPurpose: inferPurpose(p, title, h1, desc, pageType),
      primaryCTA: ctas.primary,
      secondaryCTA: ctas.secondary,
      trafficIntent: inferTrafficIntent(p, pageType),
      targetKeyword: inferTargetKeyword(p, title, h1, desc),
      wordCount: wc,
      internalLinksIn: inCount,
      internalLinksOut: outCount,
      indexable,
      inSitemap: sitemapPaths.has(p),
      title,
      h1,
      groups,
      duplicateOf: dupPair ? `${BASE}${dupPair}` : null,
    });
  }

  const indexablePages = pages.filter((p) => p.indexable);

  const groupOrder = [
    'Core Revenue Pages',
    'Trust Pages',
    'Educational Pages',
    'SEO Pages',
    'Utility Pages',
    'Orphan Pages',
    'Duplicate Pages',
    'Legacy Pages',
  ];

  const grouped = {};
  for (const g of groupOrder) grouped[g] = [];
  for (const page of indexablePages) {
    for (const g of page.groups) {
      if (!grouped[g].some((x) => x.path === page.path)) grouped[g].push(page);
    }
  }
  for (const g of groupOrder) grouped[g].sort((a, b) => a.path.localeCompare(b.path));

  const summary = {
    generated: new Date().toISOString(),
    totalHtmlFiles: pages.length,
    indexablePages: indexablePages.length,
    nonIndexable: pages.filter((p) => !p.indexable).map((p) => p.path),
    groupCounts: Object.fromEntries(groupOrder.map((g) => [g, grouped[g].length])),
  };

  const jsonOut = { summary, pages: indexablePages, grouped };
  fs.writeFileSync(path.join(SITE_ROOT, 'data', 'website-inventory.json'), JSON.stringify(jsonOut, null, 2) + '\n');

  const csvRows = [
    ['URL', 'Page Type', 'Primary Purpose', 'Primary CTA', 'Secondary CTA', 'Traffic Intent', 'Target Keyword', 'Word Count', 'Internal Links In', 'Internal Links Out', 'Groups'].join(','),
    ...indexablePages.map((p) =>
      [
        p.url,
        p.pageType,
        p.primaryPurpose,
        p.primaryCTA,
        p.secondaryCTA,
        p.trafficIntent,
        p.targetKeyword,
        p.wordCount,
        p.internalLinksIn,
        p.internalLinksOut,
        p.groups.join('; '),
      ].map(escapeCsv).join(','),
    ),
  ];
  fs.writeFileSync(path.join(SITE_ROOT, 'docs', 'website-inventory.csv'), csvRows.join('\n') + '\n');

  let md = `# Siya Health — Complete Website Inventory\n\n`;
  md += `Generated: ${summary.generated.split('T')[0]}\n\n`;
  md += `| Metric | Count |\n|--------|------:|\n`;
  md += `| HTML files | ${summary.totalHtmlFiles} |\n`;
  md += `| Indexable pages | ${summary.indexablePages} |\n`;
  md += `| Non-indexable | ${summary.nonIndexable.length} |\n\n`;

  md += `## Group summary\n\n| Group | Pages |\n|-------|------:|\n`;
  for (const g of groupOrder) md += `| ${g} | ${grouped[g].length} |\n`;

  md += `\n## Non-indexable pages\n\n`;
  for (const p of summary.nonIndexable) md += `- \`${p}\`\n`;

  const tableHeader = `| URL | Type | Purpose | Primary CTA | Secondary CTA | Intent | Target Keyword | Words | In | Out |\n|-----|------|---------|-------------|---------------|--------|----------------|------:|---:|---:|\n`;

  for (const g of groupOrder) {
    const items = grouped[g];
    if (!items.length) continue;
    md += `\n---\n\n## ${g} (${items.length})\n\n${tableHeader}`;
    for (const p of items) {
      const shortPurpose = p.primaryPurpose.length > 60 ? p.primaryPurpose.slice(0, 57) + '…' : p.primaryPurpose;
      const shortPrimary = p.primaryCTA.length > 40 ? p.primaryCTA.slice(0, 37) + '…' : p.primaryCTA;
      const shortSecondary = p.secondaryCTA.length > 40 ? p.secondaryCTA.slice(0, 37) + '…' : p.secondaryCTA;
      const shortKw = p.targetKeyword.length > 50 ? p.targetKeyword.slice(0, 47) + '…' : p.targetKeyword;
      md += `| [${p.path}](${p.url}) | ${p.pageType} | ${shortPurpose} | ${shortPrimary} | ${shortSecondary} | ${p.trafficIntent} | ${shortKw} | ${p.wordCount} | ${p.internalLinksIn} | ${p.internalLinksOut} |\n`;
    }
  }

  md += `\n---\n\n## Full page detail (indexable)\n\n`;
  for (const p of indexablePages) {
    md += `### ${p.path}\n\n`;
    md += `- **URL:** ${p.url}\n`;
    md += `- **Page Type:** ${p.pageType}\n`;
    md += `- **Primary Purpose:** ${p.primaryPurpose}\n`;
    md += `- **Primary CTA:** ${p.primaryCTA}\n`;
    md += `- **Secondary CTA:** ${p.secondaryCTA}\n`;
    md += `- **Traffic Intent:** ${p.trafficIntent}\n`;
    md += `- **Target Keyword:** ${p.targetKeyword}\n`;
    md += `- **Word Count:** ${p.wordCount}\n`;
    md += `- **Internal Links In:** ${p.internalLinksIn}\n`;
    md += `- **Internal Links Out:** ${p.internalLinksOut}\n`;
    md += `- **Groups:** ${p.groups.join(', ')}\n`;
    if (p.duplicateOf) md += `- **Duplicate of:** ${p.duplicateOf}\n`;
    md += `\n`;
  }

  fs.writeFileSync(path.join(SITE_ROOT, 'docs', 'WEBSITE-INVENTORY.md'), md);

  console.log('Wrote data/website-inventory.json');
  console.log('Wrote docs/website-inventory.csv');
  console.log('Wrote docs/WEBSITE-INVENTORY.md');
  console.log('Indexable:', indexablePages.length, '/', pages.length);
  for (const g of groupOrder) console.log(`  ${g}:`, grouped[g].length);
}

main();
