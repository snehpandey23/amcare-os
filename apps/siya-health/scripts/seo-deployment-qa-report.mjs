/**
 * Post-build SEO deployment QA report.
 * Run after: generate-answer-pages → internal-link-audit → seo-build
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import { BOOKING_LINK } from '../data/providers-core.mjs';
import { isAdhdFunnelPage } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'SEO-DEPLOYMENT-QA-REPORT.md');
const MEET_GREET = BOOKING_LINK;

const DEPLOY_BLOGS = [
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
];

const DEPLOY_ANSWERS = [
  'what-is-food-noise',
  'what-is-insulin-resistance',
  'insulin-resistance-without-diabetes',
  'normal-a1c-insulin-resistance',
  'why-am-i-tired-even-after-sleeping',
];

const CROSS_LINKS = [
  ['food-noise-and-glp-1-what-it-means-and-what-helps.html', 'insulin-resistance-and-weight-loss-clinician-overview'],
  ['food-noise-and-glp-1-what-it-means-and-what-helps.html', 'why-am-i-always-tired-causes-when-to-see-doctor'],
  ['insulin-resistance-and-weight-loss-clinician-overview.html', 'food-noise-and-glp-1-what-it-means-and-what-helps'],
  ['insulin-resistance-and-weight-loss-clinician-overview.html', 'why-am-i-always-tired-causes-when-to-see-doctor'],
  ['why-am-i-always-tired-causes-when-to-see-doctor.html', 'food-noise-and-glp-1-what-it-means-and-what-helps'],
  ['why-am-i-always-tired-causes-when-to-see-doctor.html', 'insulin-resistance-and-weight-loss-clinician-overview'],
];

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

function extractInternalLinks(html) {
  const links = new Set();
  const re = /href="(\/[^"#?]+)"/g;
  let m;
  while ((m = re.exec(html))) links.add(m[1].replace(/\/$/, '') || '/');
  return links;
}

function validateJsonLd(html) {
  const errors = [];
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const [, raw] of blocks) {
    try {
      JSON.parse(raw.trim());
    } catch (e) {
      errors.push(e.message);
    }
  }
  return errors;
}

const files = walkHtml(SITE_ROOT);
const allLinks = new Map();
const inbound = new Map();
const broken = [];
const schemaErrors = [];
let sitemapCount = 0;
let meetGreetNav = 0;
const screeningNavNonAdhd = [];
const adhdScreeningRemaining = [];

for (const rel of files) {
  const full = path.join(SITE_ROOT, rel);
  const html = fs.readFileSync(full, 'utf8');
  const links = extractInternalLinks(html);
  allLinks.set(rel, links);
  for (const href of links) {
    inbound.set(href, (inbound.get(href) || 0) + 1);
  }
  const ldErr = validateJsonLd(html);
  if (ldErr.length) schemaErrors.push({ rel, errors: ldErr });

  if (html.includes('Book a Meet &amp; Greet') && html.includes('nav-cta')) meetGreetNav++;
  if (!isAdhdFunnelPage(rel) && !rel.startsWith('answers/') && /adhd-screening/.test(html)) {
    screeningNavNonAdhd.push(rel);
  }
  if (/adhd-screening/.test(html)) adhdScreeningRemaining.push(rel);
}

const htmlPaths = new Set(files.map((f) => '/' + f.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/'));
htmlPaths.add('/');

for (const [from, links] of allLinks) {
  for (const href of links) {
    if (!href.startsWith('/')) continue;
    if (href.startsWith('http')) continue;
    const normalized = href.replace(/\/$/, '') || '/';
    const candidates = [
      normalized === '/' ? 'index.html' : normalized.slice(1) + '.html',
      normalized.slice(1) + '/index.html',
    ];
    const exists =
      normalized === '/' ||
      files.includes('index.html') && normalized === '/' ||
      files.some((f) => candidates.some((c) => f === c || f.endsWith('/' + c)));
    const fileExists =
      fs.existsSync(path.join(SITE_ROOT, normalized === '/' ? 'index.html' : normalized.slice(1) + '.html')) ||
      fs.existsSync(path.join(SITE_ROOT, normalized.slice(1), 'index.html'));
    if (!fileExists && !['/blog', '/answers', '/providers'].includes(normalized) && !normalized.startsWith('/blog/') === false) {
      // only flag .html targets we can resolve
      const asFile = path.join(SITE_ROOT, normalized.slice(1) + '.html');
      const asDir = path.join(SITE_ROOT, normalized.slice(1), 'index.html');
      if (!fs.existsSync(asFile) && !fs.existsSync(asDir)) {
        broken.push({ from, href });
      }
    }
  }
}

const sitemapPath = path.join(SITE_ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  const sm = fs.readFileSync(sitemapPath, 'utf8');
  sitemapCount = (sm.match(/<loc>/g) || []).length;
}

const deployBlogStatus = DEPLOY_BLOGS.map((p) => {
  const f = p.replace(/^\//, '') + '.html';
  const exists = fs.existsSync(path.join(SITE_ROOT, f));
  const inSitemap = fs.existsSync(sitemapPath) && fs.readFileSync(sitemapPath, 'utf8').includes(`https://siya.health${p}`);
  return { path: p, exists, inSitemap };
});

const deployAnswerStatus = DEPLOY_ANSWERS.map((slug) => {
  const f = path.join(SITE_ROOT, 'answers', `${slug}.html`);
  const exists = fs.existsSync(f);
  const inSitemap = fs.existsSync(sitemapPath) && fs.readFileSync(sitemapPath, 'utf8').includes(`/answers/${slug}`);
  const html = exists ? fs.readFileSync(f, 'utf8') : '';
  return {
    slug,
    exists,
    inSitemap,
    meetGreetCta: html.includes(MEET_GREET),
    cornerstoneBlog: html.includes('Full clinical guide'),
    continueReading: html.includes('continue-reading') || html.includes('answer-next-steps'),
  };
});

const crossLinkResults = CROSS_LINKS.map(([from, toSlug]) => {
  const html = fs.readFileSync(path.join(SITE_ROOT, 'blog', from), 'utf8');
  return { from, toSlug, ok: html.includes(toSlug) };
});

const orphans = files
  .filter((f) => !f.includes('privacy') && !f.includes('terms'))
  .filter((f) => {
    const route = '/' + f.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');
    const count = inbound.get(route) || inbound.get(route.replace(/\/$/, '')) || 0;
    return count < 1 && f !== 'index.html';
  })
  .slice(0, 30);

const report = `# SEO Deployment QA Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Value |
|--------|------:|
| HTML pages scanned | ${files.length} |
| Sitemap URLs | ${sitemapCount} |
| Pages with Meet & Greet in nav | ${meetGreetNav} |
| Non-ADHD pages still referencing adhd-screening | ${screeningNavNonAdhd.length} |
| Broken internal links (sample) | ${broken.length} |
| JSON-LD parse errors | ${schemaErrors.length} |

## Content deployed

### Cornerstone blogs

| URL | File exists | In sitemap |
|-----|:-----------:|:----------:|
${deployBlogStatus.map((r) => `| ${r.path} | ${r.exists ? '✓' : '✗'} | ${r.inSitemap ? '✓' : '✗'} |`).join('\n')}

### Answer pages

| Slug | Exists | Sitemap | Meet & Greet CTA | Blog backlink |
|------|:------:|:-------:|:----------------:|:-------------:|
${deployAnswerStatus.map((r) => `| ${r.slug} | ${r.exists ? '✓' : '✗'} | ${r.inSitemap ? '✓' : '✗'} | ${r.meetGreetCta ? '✓' : '✗'} | ${r.cornerstoneBlog ? '✓' : '—'} |`).join('\n')}

## CTA repositioning

- **Default primary CTA:** Book a Meet & Greet → \`${MEET_GREET}\`
- **Default secondary CTA:** Explore Care Options → \`#services\` or service hubs
- **ADHD screening retained on:** ADHD service pages, ADHD blogs, ADHD answers, Creyos, geo diagnosis pages, \`adhd-screening.html\`

### Non-ADHD pages still containing \`adhd-screening\` (${screeningNavNonAdhd.length})

${screeningNavNonAdhd.length ? screeningNavNonAdhd.map((p) => `- \`${p}\``).join('\n') : '_None detected._'}

### All pages with any \`adhd-screening\` reference (${adhdScreeningRemaining.length})

${adhdScreeningRemaining.slice(0, 40).map((p) => `- \`${p}\``).join('\n')}
${adhdScreeningRemaining.length > 40 ? `\n_…and ${adhdScreeningRemaining.length - 40} more (expected on ADHD funnels)._` : ''}

## Internal link cluster (food noise ↔ insulin ↔ fatigue)

| From | To | Linked |
|------|-----|:------:|
${crossLinkResults.map((r) => `| blog/${r.from} | ${r.toSlug} | ${r.ok ? '✓' : '✗'} |`).join('\n')}

## Service page Learn More blocks

| Page | Marker |
|------|--------|
| weight-loss-metabolic-health.html | SIYA:LEARN-MORE-WEIGHT |
| mens-health-longevity.html | SIYA:LEARN-MORE-MENS |
| telehealth.html | SIYA:LEARN-MORE-TELE |

## Schema validation

${schemaErrors.length ? schemaErrors.map((e) => `- **${e.rel}:** ${e.errors.join('; ')}`).join('\n') : '_No JSON-LD parse errors._'}

## Broken links (first 25)

${broken.length ? broken.slice(0, 25).map((b) => `- \`${b.from}\` → \`${b.href}\``).join('\n') : '_None detected in static HTML scan._'}

## Orphan pages (low inbound links, sample)

${orphans.length ? orphans.map((p) => `- \`${p}\``).join('\n') : '_No obvious orphans in sample._'}

## Recommendations

1. Deploy via Netlify after merge; publish root is \`apps/siya-health\`.
2. Re-run this script after any manual HTML edits: \`node scripts/seo-deployment-qa-report.mjs\`.
3. Monitor Search Console for new cornerstone URLs indexing.
4. Review remaining \`adhd-screening\` references—intentional on ADHD funnels only.

## Build command

\`\`\`bash
node scripts/generate-answer-pages.mjs && node scripts/internal-link-audit.mjs && node scripts/seo-build.mjs && node scripts/generate-ai-indexes.mjs && node scripts/seo-deployment-qa-report.mjs
\`\`\`
`;

fs.writeFileSync(OUT, report, 'utf8');
console.log('Wrote', OUT);
