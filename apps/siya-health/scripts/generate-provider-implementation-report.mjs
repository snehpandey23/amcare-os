/**
 * Provider expansion implementation QA report.
 * Run: node scripts/generate-provider-implementation-report.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BASE_URL,
  PROVIDERS,
  SERVICE_PROVIDER_SLUGS,
  getProviderBySlug,
} from '../data/providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

function walkHtml(dir, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'scripts', 'public'].includes(e.name)) continue;
    const rel = path.join(base, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function extractLinks(html) {
  const links = [];
  const re = /href="(\/[^"#?]*)/g;
  let m;
  while ((m = re.exec(html))) links.push(m[1].replace(/\/$/, '') || '/');
  return links;
}

function countProviderLinks(htmlFiles) {
  const counts = { hub: 0 };
  for (const p of PROVIDERS) counts[p.slug] = 0;

  for (const rel of htmlFiles) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    if (html.includes('href="/providers"')) counts.hub += 1;
    for (const p of PROVIDERS) {
      if (html.includes(`/providers/${p.slug}`)) counts[p.slug] += 1;
    }
  }
  return counts;
}

function validateProviderPages() {
  const results = [];
  for (const p of PROVIDERS) {
    const file = path.join(SITE_ROOT, 'providers', `${p.slug}.html`);
    const exists = fs.existsSync(file);
    let schemaOk = false;
    let breadcrumbOk = false;
    let ctaOk = false;
    let statesOk = false;
    if (exists) {
      const html = fs.readFileSync(file, 'utf8');
      schemaOk = /"@type"\s*:\s*"Physician"/.test(html) && /application\/ld\+json/.test(html);
      breadcrumbOk = /BreadcrumbList/.test(html) && /Our Care Team/.test(html);
      ctaOk = /Book a Meet/.test(html) && /data-provider-cta/.test(html);
      const prov = getProviderBySlug(p.slug);
      statesOk = prov && prov.statesLicensed.every((name) => html.includes(name));
    }
    results.push({
      slug: p.slug,
      url: `${BASE_URL}/providers/${p.slug}`,
      exists,
      schemaOk,
      breadcrumbOk,
      ctaOk,
      statesOk,
    });
  }
  return results;
}

function buildServiceMatrix() {
  const rows = [];
  for (const [serviceKey, slugs] of Object.entries(SERVICE_PROVIDER_SLUGS)) {
    rows.push({
      service: serviceKey,
      path: `/${serviceKey}`,
      providers: slugs.map((s) => getProviderBySlug(s)?.name || s),
      count: slugs.length,
    });
  }
  return rows;
}

function scanBrokenLinks(htmlFiles) {
  const valid = new Set(['/']);
  for (const rel of htmlFiles) {
    const url = rel === 'index.html' ? '/' : '/' + rel.replace(/\.html$/, '').replace(/\/index$/, '');
    valid.add(url);
    if (rel.endsWith('/index.html') && rel !== 'index.html') {
      valid.add('/' + rel.slice(0, -'/index.html'.length));
    }
  }
  const broken = [];
  for (const rel of htmlFiles) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    for (const link of extractLinks(html)) {
      if (link.startsWith('http') || link.startsWith('mailto:') || link.startsWith('tel:')) continue;
      const norm = link.replace(/\/$/, '') || '/';
      if (!valid.has(norm) && !norm.startsWith('/answers/') && !norm.startsWith('/blog/') && !norm.startsWith('/providers/')) {
        // allow dynamic paths already in sitemap
      }
      if (!valid.has(norm)) {
        const checkPath = norm === '/' ? 'index.html' : norm.slice(1) + '.html';
        const altIndex = norm.slice(1) + '/index.html';
        if (!fs.existsSync(path.join(SITE_ROOT, checkPath)) && !fs.existsSync(path.join(SITE_ROOT, altIndex))) {
          broken.push({ from: rel, to: link });
        }
      }
    }
  }
  return broken.slice(0, 20);
}

function main() {
  const htmlFiles = walkHtml(SITE_ROOT);
  const sitemap = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
  const sitemapCount = (sitemap.match(/<loc>/g) || []).length;
  const providerProfiles = validateProviderPages();
  const linkCounts = countProviderLinks(htmlFiles);
  const serviceMatrix = buildServiceMatrix();
  const broken = scanBrokenLinks(htmlFiles);
  const jsonLdErrors = providerProfiles.filter((p) => p.exists && !p.schemaOk).length;

  const lines = [
    '# Provider Expansion — Implementation Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    '| Metric | Value |',
    '|--------|------:|',
    `| Sitemap URLs | ${sitemapCount} |`,
    `| Contracted providers in data | ${PROVIDERS.length} |`,
    `| Live profile pages | ${providerProfiles.filter((p) => p.exists).length} |`,
    `| Hub URL | ${BASE_URL}/providers |`,
    `| Pages linking to /providers hub | ${linkCounts.hub} |`,
    `| Broken internal links (sample) | ${broken.length} |`,
    `| JSON-LD issues on profiles | ${jsonLdErrors} |`,
    '',
    '## Profile URLs',
    '',
    '| Provider | URL | In sitemap | Schema | Breadcrumb | CTAs | States |',
    '|----------|-----|:----------:|:------:|:----------:|:----:|:------:|',
  ];

  for (const p of providerProfiles) {
    const inSitemap = sitemap.includes(`/providers/${p.slug}`);
    lines.push(
      `| ${p.slug} | ${p.url} | ${inSitemap ? '✓' : '✗'} | ${p.schemaOk ? '✓' : '✗'} | ${p.breadcrumbOk ? '✓' : '✗'} | ${p.ctaOk ? '✓' : '✗'} | ${p.statesOk ? '✓' : '✗'} |`,
    );
  }

  lines.push('', '## Service coverage matrix', '', '| Service | Path | Providers | Count |', '|---------|------|-----------|------:|');
  for (const row of serviceMatrix) {
    lines.push(`| ${row.service} | ${row.path} | ${row.providers.join('; ')} | ${row.count} |`);
  }

  lines.push('', '## Internal link counts (pages referencing profile)', '', '| Target | Inbound pages |', '|--------|-------------:|');
  lines.push(`| /providers hub | ${linkCounts.hub} |`);
  for (const p of PROVIDERS) {
    lines.push(`| /providers/${p.slug} | ${linkCounts[p.slug]} |`);
  }

  lines.push('', '## Hub features', '', '- Physicians + Advanced Practice Provider sections', '- Client-side filters: State (CA, TX, PA, FL, OH), Service (ADHD, Weight Loss, Primary Care, Telehealth)', '- Nav/footer label: **Our Care Team**', '');

  if (broken.length) {
    lines.push('## Broken links (sample)', '');
    for (const b of broken) lines.push(`- \`${b.from}\` → \`${b.to}\``);
  } else {
    lines.push('## Broken links', '', '_None detected in sample scan._');
  }

  lines.push('', '## Operational note', '', 'All seven providers are treated as contracted, credentialed, and actively seeing patients. No future-provider or intake workflows on the public site.', '');

  const outPath = path.join(SITE_ROOT, 'docs', 'PROVIDER-EXPANSION-IMPLEMENTATION-REPORT.md');
  fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
  console.log('Wrote', outPath);
}

main();
