/**
 * Cluster internal linking report — run after internal-link-audit + seo-build.
 * node scripts/cluster-linking-report.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CORNERSTONE_BLOG_PATHS } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'CLUSTER-LINKING-REPORT.md');
const BEFORE_INBOUND_FOOD_NOISE = 2;

const CORNERSTONE_SLUGS = Object.values(CORNERSTONE_BLOG_PATHS).map((p) =>
  p.replace('/blog/', '').replace(/^\//, ''),
);

const LINKS_ADDED_LOG = [
  { type: 'continue-reading', target: 'All 4 cornerstones', detail: 'Forced 2 sibling blogs + answer + service via CORNERSTONE_CONTINUE_READING' },
  { type: 'body', target: 'food-noise → insulin, fatigue', detail: 'New paragraphs + internal-links block' },
  { type: 'body', target: 'insulin → fatigue, free-T', detail: 'Sleep/metabolic + SHBG paragraph' },
  { type: 'body', target: 'free-T → food-noise, insulin, fatigue', detail: 'Obesity/insulin + existing paths' },
  { type: 'body', target: 'fatigue → free-T', detail: 'Reading path hormone branch' },
  { type: 'learn-more', target: 'weight-loss, mens-health, telehealth', detail: 'All cornerstones + what-is-food-noise' },
  { type: 'inbound-boost', target: '/answers/what-is-food-noise', detail: '6 GLP-1/weight blogs + 7 answer related arrays' },
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

function countInbound(target) {
  let n = 0;
  const files = walkHtml(SITE_ROOT);
  for (const rel of files) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    const matches = html.match(new RegExp(`href="${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'));
    if (matches) n += matches.length;
  }
  return n;
}

function verifyCornerstoneContinue(relFile) {
  const html = fs.readFileSync(path.join(SITE_ROOT, relFile), 'utf8');
  const blogPath = '/' + relFile.replace(/\.html$/, '');
  const others = CORNERSTONE_SLUGS.filter((s) => s !== relFile.replace(/^blog\//, ''));
  const hasCr = html.includes('class="continue-reading"');
  const siblingHits = others.filter((s) => html.includes(`/blog/${s}`)).length;
  const hasAnswer = html.includes('continue-reading-answer');
  const hasService = html.includes('continue-reading-service');
  return { blogPath, hasCr, siblingHits, hasAnswer, hasService, ok: hasCr && siblingHits >= 2 && hasAnswer && hasService };
}

function crossBodyLinks(relFile) {
  const html = fs.readFileSync(path.join(SITE_ROOT, relFile), 'utf8');
  const key = relFile.replace(/^blog\//, '');
  const checks = {
    'food-noise-and-glp-1-what-it-means-and-what-helps.html': [
      'insulin-resistance-and-weight-loss-clinician-overview',
      'why-am-i-always-tired-causes-when-to-see-doctor',
    ],
    'insulin-resistance-and-weight-loss-clinician-overview.html': [
      'food-noise-and-glp-1-what-it-means-and-what-helps',
      'why-am-i-always-tired-causes-when-to-see-doctor',
      'free-testosterone-vs-total-testosterone-what-patients-should-know',
    ],
    'why-am-i-always-tired-causes-when-to-see-doctor.html': [
      'insulin-resistance-and-weight-loss-clinician-overview',
      'food-noise-and-glp-1-what-it-means-and-what-helps',
      'free-testosterone-vs-total-testosterone-what-patients-should-know',
    ],
    'free-testosterone-vs-total-testosterone-what-patients-should-know.html': [
      'insulin-resistance-and-weight-loss-clinician-overview',
      'why-am-i-always-tired-causes-when-to-see-doctor',
      'food-noise-and-glp-1-what-it-means-and-what-helps',
    ],
  }[key];
  if (!checks) return [];
  return checks.map((slug) => ({ slug, ok: html.includes(slug) }));
}

const auditPath = path.join(SITE_ROOT, 'data', 'internal-link-audit.json');
const audit = fs.existsSync(auditPath) ? JSON.parse(fs.readFileSync(auditPath, 'utf8')) : {};
const inboundAudit = audit.inboundCounts?.['/answers/what-is-food-noise'] ?? null;

const foodNoiseInbound = countInbound('/answers/what-is-food-noise');
const cornerstoneChecks = CORNERSTONE_SLUGS.map((s) => verifyCornerstoneContinue(`blog/${s}.html`));
const bodyChecks = CORNERSTONE_SLUGS.flatMap((s) =>
  crossBodyLinks(`blog/${s}.html`).map((c) => ({ from: s, ...c })),
);

const weakNodes = [];
if (foodNoiseInbound < 8) weakNodes.push(`/answers/what-is-food-noise (${foodNoiseInbound} inbound, target ≥8)`);
for (const c of cornerstoneChecks.filter((x) => !x.ok)) {
  weakNodes.push(`Continue reading incomplete: ${c.blogPath}`);
}
for (const b of bodyChecks.filter((x) => !x.ok)) {
  weakNodes.push(`Body cross-link missing: ${b.from} → ${b.slug}`);
}
const under3 = (audit.under3Inbound || []).filter((x) =>
  ['/answers/what-is-food-noise', ...Object.values(CORNERSTONE_BLOG_PATHS)].includes(x.path),
);

const modifiedFiles = [
  'scripts/site-chrome.mjs',
  'blog/food-noise-and-glp-1-what-it-means-and-what-helps.html',
  'blog/insulin-resistance-and-weight-loss-clinician-overview.html',
  'blog/why-am-i-always-tired-causes-when-to-see-doctor.html',
  'blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html',
  'blog/glp1-side-effects-and-how-to-manage-them.html',
  'blog/semaglutide-for-weight-loss-how-it-works.html',
  'blog/tirzepatide-vs-semaglutide-which-is-better.html',
  'blog/medical-weight-loss-glp1-semaglutide-texas.html',
  'blog/how-mental-health-affects-weight-loss-outcomes.html',
  'blog/combining-adhd-treatment-and-weight-loss-strategies.html',
  'data/answer-seeds.mjs',
  'weight-loss-metabolic-health.html',
  'mens-health-longevity.html',
  'telehealth.html',
];

const report = `# Cluster Linking Report

Generated: ${new Date().toISOString()}

## Summary

| Metric | Value |
|--------|------:|
| \`/answers/what-is-food-noise\` inbound (before) | ${BEFORE_INBOUND_FOOD_NOISE} (audit snapshot) |
| \`/answers/what-is-food-noise\` inbound (after, HTML scan) | **${foodNoiseInbound}** |
| Target inbound | ≥ 8 |
| Cornerstone Continue reading passes | ${cornerstoneChecks.filter((c) => c.ok).length} / 4 |

## Links added (by category)

| Type | Target | Detail |
|------|--------|--------|
${LINKS_ADDED_LOG.map((r) => `| ${r.type} | ${r.target || '—'} | ${r.detail || '—'} |`).join('\n')}

## Pages modified (source)

${modifiedFiles.map((f) => `- \`${f}\``).join('\n')}

_Post \`seo-build\`: all HTML pages receive updated Continue reading on cornerstone blogs._

## Cornerstone Continue reading verification

| Article | CR block | Sibling links | Answer | Service | Pass |
|---------|:--------:|:-------------:|:------:|:-------:|:----:|
${cornerstoneChecks.map((c) => `| ${c.blogPath.replace('/blog/', '')} | ${c.hasCr ? '✓' : '✗'} | ${c.siblingHits}/2 | ${c.hasAnswer ? '✓' : '✗'} | ${c.hasService ? '✓' : '✗'} | ${c.ok ? '✓' : '✗'} |`).join('\n')}

## Body cross-link verification (cornerstone cluster)

| From | To | Linked |
|------|-----|:------:|
${bodyChecks.map((b) => `| ${b.from} | ${b.slug} | ${b.ok ? '✓' : '✗'} |`).join('\n')}

## Inbound: \`/answers/what-is-food-noise\`

| Source | Before (audit) | After (HTML href count) |
|--------|:--------------:|:------------------------:|
| Site-wide internal | ${BEFORE_INBOUND_FOOD_NOISE} unique pages (under3Inbound) | **${foodNoiseInbound}** total \`href\` instances |

${foodNoiseInbound >= 8 ? '_Target met (≥8 inbound href instances)._' : '_Target not yet met—add more GLP-1/medication hub links or homepage/footer placement._'}

## Remaining weak nodes

${weakNodes.length ? weakNodes.map((w) => `- ${w}`).join('\n') : '_None critical in cornerstone cluster._'}

${under3.length ? `\n### Cluster pages still under 3 unique inbound (audit)\n${under3.map((u) => `- \`${u.path}\` (${u.count})`).join('\n')}` : ''}

## Build order

\`\`\`bash
node scripts/generate-answer-pages.mjs
node scripts/internal-link-audit.mjs
node scripts/seo-build.mjs
node scripts/cluster-linking-report.mjs
\`\`\`
`;

fs.writeFileSync(OUT, report, 'utf8');
console.log('Wrote', OUT);
console.log('what-is-food-noise inbound href count:', foodNoiseInbound);
