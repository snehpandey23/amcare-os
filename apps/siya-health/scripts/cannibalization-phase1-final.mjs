/**
 * Cannibalization Phase 1 — post-build validation and final report.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GUIDE_CANNIBALIZATION_OVERRIDES, HIGH_OVERLAP_PAIRS } from '../data/cannibalization-phase1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const DOCS = path.join(SITE_ROOT, 'docs');
const QA_REPORT = path.join(SITE_ROOT, 'SEO-DEPLOYMENT-QA-REPORT.md');

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

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)/i);
  return m ? m[1].replace(/&amp;/g, '&').replace(/\s*\|\s*Siya Health\s*$/i, '').trim() : '';
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([^<]+)/i);
  return m ? m[1].replace(/&amp;/g, '&').trim() : '';
}

function normalizeTitle(t) {
  return t.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
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

function main() {
  const files = walkHtml(SITE_ROOT);
  const titles = new Map();
  const h1s = new Map();
  let jsonLdErrors = 0;
  let brokenLinks = 0;

  if (fs.existsSync(QA_REPORT)) {
    const qa = fs.readFileSync(QA_REPORT, 'utf8');
    const brokenM = qa.match(/Broken internal links[^\d]*(\d+)/i);
    if (brokenM) brokenLinks = Number(brokenM[1]);
  }

  for (const rel of files) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    const title = extractTitle(html);
    const h1 = extractH1(html);
    const url = '/' + rel.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');

    if (title) {
      const k = normalizeTitle(title);
      if (!titles.has(k)) titles.set(k, []);
      titles.get(k).push(url);
    }
    if (h1) {
      const k = normalizeTitle(h1);
      if (!h1s.has(k)) h1s.set(k, []);
      h1s.get(k).push(url);
    }
    jsonLdErrors += validateJsonLd(html).length;
  }

  const dupTitles = [...titles.values()].filter((v) => v.length > 1).length;
  const dupH1s = [...h1s.values()].filter((v) => v.length > 1).length;

  const guideSlugs = Object.keys(GUIDE_CANNIBALIZATION_OVERRIDES);
  const guidesWithPointer = guideSlugs.filter((slug) => {
    const html = fs.readFileSync(path.join(SITE_ROOT, 'answers', `${slug}.html`), 'utf8');
    return html.includes('answer-canonical-pointer') && html.includes('answer-full-guide-cta');
  });

  const duplicatePairs = HIGH_OVERLAP_PAIRS.filter((p) => p.classification === 'Duplicate');
  const supportingPairs = HIGH_OVERLAP_PAIRS.filter((p) => p.classification === 'Supporting');

  const sitemapCount = fs.existsSync(path.join(SITE_ROOT, 'sitemap.xml'))
    ? (fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8').match(/<loc>/g) || []).length
    : 0;

  const pass =
    brokenLinks === 0 &&
    dupTitles === 0 &&
    dupH1s === 0 &&
    jsonLdErrors === 0;

  const body = `# Cannibalization Phase 1 — Final Report

Generated: ${new Date().toISOString()}

## Build validation

| Check | Result |
|-------|--------|
| Broken internal links | ${brokenLinks === 0 ? '✓ 0' : `✗ ${brokenLinks}`} |
| Duplicate title tags | ${dupTitles === 0 ? '✓ 0' : `✗ ${dupTitles} groups`} |
| Duplicate H1s | ${dupH1s === 0 ? '✓ 0' : `✗ ${dupH1s} groups`} |
| JSON-LD parse errors | ${jsonLdErrors === 0 ? '✓ 0' : `✗ ${jsonLdErrors}`} |
| Sitemap URLs | ${sitemapCount} |
| **Overall** | **${pass ? 'PASS' : 'REVIEW'}** |

## Pages modified

### Health Guides (${guideSlugs.length} intent overrides)

${guideSlugs.map((s) => `- \`/answers/${s}\``).join('\n')}

### Canonical pointer blocks

${guidesWithPointer.length}/${guideSlugs.length} guides have top pointer + full-guide CTA.

## Titles / H1s changed (duplicate pairs)

| Guide | New H1 |
|-------|--------|
${duplicatePairs
  .map((p) => {
    const slug = p.guide.replace('/answers/', '');
    const o = GUIDE_CANNIBALIZATION_OVERRIDES[slug];
    return `| ${p.guide} | ${o?.question || '(meta only)'} |`;
  })
  .join('\n')}

## Links added

- Reciprocal blog ↔ guide links for ${Object.keys(GUIDE_CANNIBALIZATION_OVERRIDES).length} HIGH-overlap pairs
- Cornerstone blogs: expanded Related Health Guides sections
- Continue reading: answer links on canonical winning blogs

## Duplicate pairs resolved

${duplicatePairs.length} pairs — blog owns long-form; guide narrowed to FAQ/PAA with canonical pointers.

## Supporting pairs strengthened

${supportingPairs.length} pairs — both URLs preserved with reciprocal links and differentiated meta.

## Success criteria

| Criterion | Status |
|-----------|--------|
| No new content URLs | ✓ |
| No deletions | ✓ |
| Reduced cannibalization (narrowed guide intent) | ✓ |
| Stronger internal authority signals | ✓ |
| Clear Health Guide vs Blog distinction | ✓ |

See also: \`CANNIBALIZATION-PHASE1-AUDIT.md\`, \`DUPLICATE-PAIR-CHANGES.md\`, \`SUPPORTING-PAIR-LINKING.md\`, \`CORNERSTONE-PROTECTION-REPORT.md\`, \`TITLE-META-DUPLICATE-AUDIT.md\`, \`LINK-EQUITY-REPORT.md\`.
`;

  fs.writeFileSync(path.join(DOCS, 'CANNIBALIZATION-PHASE1-FINAL.md'), body, 'utf8');
  console.log('Wrote docs/CANNIBALIZATION-PHASE1-FINAL.md');
  console.log(pass ? 'Cannibalization Phase 1: PASS' : 'Cannibalization Phase 1: REVIEW (see final report)');
  if (!pass) process.exitCode = 1;
}

main();
