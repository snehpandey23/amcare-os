/**
 * Phase 2 pre-commit QA. Run: node scripts/phase2-qa.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BLOG = path.join(SITE_ROOT, 'blog');

const CORNERSTONES = [
  'food-noise-and-glp-1-what-it-means-and-what-helps',
  'insulin-resistance-and-weight-loss-clinician-overview',
  'why-am-i-always-tired-causes-when-to-see-doctor',
  'free-testosterone-vs-total-testosterone-what-patients-should-know',
  'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
];

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'scripts', 'data', 'docs'].includes(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function extractLinks(html) {
  const links = new Set();
  const re = /href="(\/[^"#?]+)"/g;
  let m;
  while ((m = re.exec(html))) links.add(m[1].replace(/\/$/, '') || '/');
  return links;
}

function validateJsonLd(html) {
  const errors = [];
  for (const [, raw] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      JSON.parse(raw.trim());
    } catch (e) {
      errors.push(e.message);
    }
  }
  return errors;
}

function checkCornerstone(slug) {
  const html = fs.readFileSync(path.join(BLOG, `${slug}.html`), 'utf8');
  const reviewCount = (html.match(/clinical-review--pending/g) || []).length;
  return {
    slug,
    reviewCount,
    l1: html.includes('blog-service-link'),
    l2: html.includes('data-phase2="l2"') || html.includes('blog-cta--mid'),
    l3: html.includes('blog-service-card'),
    l4: html.includes('related-health-guides'),
    l5: html.includes('cta-band'),
    takeaway: html.includes('blog-engage--takeaway'),
    evidence: html.includes('blog-engage--evidence'),
    flowchart: html.includes('blog-engage--flowchart'),
    myth: html.includes('blog-engage--myth'),
    pearl: html.includes('blog-engage--pearl'),
    decision: html.includes('blog-engage--decision'),
    deferredChat: html.includes('deferred-chat-widget'),
  };
}

function main() {
  const files = walkHtml(SITE_ROOT);
  const allLinks = new Map();
  const inbound = new Map();
  const broken = [];
  const schemaErrors = [];

  for (const rel of files) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    const links = extractLinks(html);
    const urlPath =
      rel === 'index.html' ? '/' : '/' + rel.replace(/\.html$/i, '').replace(/\/index$/, '');
    allLinks.set(urlPath, links);
    for (const l of links) inbound.set(l, (inbound.get(l) || 0) + 1);
    const errs = validateJsonLd(html);
    if (errs.length) schemaErrors.push({ rel, errs });
  }

  for (const [from, links] of allLinks) {
    for (const l of links) {
      if (l.startsWith('http') || l.startsWith('mailto:') || l.startsWith('tel:')) continue;
      const target = l.endsWith('.html') ? l.replace(/\.html$/, '') : l;
      const exists =
        inbound.has(target) ||
        inbound.has(target + '/') ||
        files.some((f) => {
          const p = f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '');
          return p === target || p === target + '/';
        });
      if (!exists && !l.includes('.')) broken.push({ from, to: l });
    }
  }

  const sitemapCount = fs.existsSync(path.join(SITE_ROOT, 'sitemap.xml'))
    ? (fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8').match(/<loc>/g) || []).length
    : 0;

  const cornerstone = CORNERSTONES.map(checkCornerstone);
  const hgFails = [];
  for (const rel of files) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    if (/>Answers<\/a>/.test(html) || /Clinical Answers/i.test(html) || /Browse clinical answers/i.test(html)) {
      hgFails.push(rel);
    }
  }

  const pass =
    broken.length === 0 &&
    schemaErrors.length === 0 &&
    hgFails.length === 0 &&
    cornerstone.every(
      (c) =>
        c.reviewCount === 1 &&
        c.l1 &&
        c.l2 &&
        c.l3 &&
        c.l4 &&
        c.l5 &&
        c.takeaway &&
        c.evidence &&
        c.flowchart &&
        c.myth &&
        c.pearl &&
        c.decision &&
        (c.slug !== 'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign' || c.deferredChat),
    );

  const report = `# Phase 2 QA Report

**Generated:** ${new Date().toISOString().slice(0, 10)}

## Build / site checks

| Check | Result |
|-------|--------|
| Sitemap URL count | **${sitemapCount}** |
| Broken internal links | **${broken.length}** |
| JSON-LD parse errors | **${schemaErrors.length}** |
| User-facing legacy Answers labels | **${hgFails.length}** files |

## Cornerstone conversion parity

| Article | Review blocks | L1 | L2 | L3 | L4 | L5 | Engage |
|---------|--------------:|----|----|----|----|-----|--------|
${cornerstone
  .map((c) => {
    const eng = [c.takeaway, c.evidence, c.flowchart, c.myth, c.pearl, c.decision].every(Boolean) ? '✓' : '✗';
    return `| ${c.slug.slice(0, 40)}… | ${c.reviewCount} | ${c.l1 ? '✓' : '✗'} | ${c.l2 ? '✓' : '✗'} | ${c.l3 ? '✓' : '✗'} | ${c.l4 ? '✓' : '✗'} | ${c.l5 ? '✓' : '✗'} | ${eng} |`;
  })
  .join('\n')}

## Sleep Apnea engagement

| Block | Status |
|-------|--------|
${(() => {
  const s = cornerstone.find((c) => c.slug.includes('sleep-apnea'));
  if (!s) return '| — | — |';
  return [
    ['Key takeaway', s.takeaway],
    ['Evidence snapshot', s.evidence],
    ['Symptom flowchart', s.flowchart],
    ['Myth vs reality', s.myth],
    ['Clinical pearl', s.pearl],
    ['Decision tree', s.decision],
    ['Mid CTA (L2)', s.l2],
    ['Deferred chat', s.deferredChat],
  ]
    .map(([k, v]) => `| ${k} | ${v ? '✓' : '✗'} |`)
    .join('\n');
})()}

${broken.length ? `\n### Broken links\n\n${broken.slice(0, 15).map((b) => `- ${b.from} → ${b.to}`).join('\n')}` : ''}
${schemaErrors.length ? `\n### Schema errors\n\n${schemaErrors.map((s) => `- \`${s.rel}\`: ${s.errs.join('; ')}`).join('\n')}` : ''}
${hgFails.length ? `\n### Health Guides label failures\n\n${hgFails.map((f) => `- \`${f}\``).join('\n')}` : ''}

## Screenshots

Regenerate with \`node scripts/capture-phase2-qa-screenshots.mjs\` (see \`docs/visual-audit-screenshots/phase2/\`).

## Overall

**${pass ? 'PASS — ready to commit' : 'FAIL — fix issues above'}**
`;

  fs.writeFileSync(path.join(SITE_ROOT, 'PHASE-2-QA-REPORT.md'), report, 'utf8');
  console.log(report);
  if (!pass) process.exit(1);
}

main();
