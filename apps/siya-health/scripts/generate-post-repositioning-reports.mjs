/**
 * QA + cleanup reports after repositioning implementation.
 * Run after full build: node scripts/generate-post-repositioning-reports.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { FOOTER_STATES_LINE, STATES_INLINE, STATES_BULLET } from '../data/site-standards.mjs';
import { NAV_HEALTH_GUIDES } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

function walkHtml(subdir = '') {
  const out = [];
  const fullDir = subdir ? path.join(SITE_ROOT, subdir) : SITE_ROOT;
  for (const e of fs.readdirSync(fullDir, { withFileTypes: true })) {
    if (e.name === 'public' || e.name === 'node_modules' || e.name === 'scripts' || e.name === 'data') continue;
    const rel = subdir ? `${subdir}/${e.name}` : e.name;
    const full = path.join(SITE_ROOT, rel);
    if (e.isDirectory()) out.push(...walkHtml(rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

const htmlFiles = walkHtml('');
const LEGACY_FOOTER = /Texas, Pennsylvania, and Florida/i;
const LEGACY_CA_ORDER = /California, Texas, Pennsylvania, and Florida/i;
const CLINICAL_ANSWERS = /Clinical Answers|clinical answers|Browse clinical answers|Clinical Answers Hub/i;
const BOOK_FREE = /Book Free Consultation/i;
const MED_REVIEW = /Medically reviewed by/i;
const PENDING = /clinical-review--pending/;

let stateFixed = 0;
let stateLegacy = [];
let hgLegacy = [];
let ctaLegacy = [];
let medLegacy = [];
let pendingOk = 0;
let pendingMissing = [];

for (const rel of htmlFiles) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  if (html.includes(FOOTER_STATES_LINE) || html.includes(STATES_INLINE)) stateFixed++;
  if (LEGACY_FOOTER.test(html) && !html.includes('California, Texas, Florida')) {
    stateLegacy.push(rel);
  }
  if (LEGACY_CA_ORDER.test(html)) stateLegacy.push(`${rel} (old 4-state order)`);
  if (CLINICAL_ANSWERS.test(html)) hgLegacy.push(rel);
  if (BOOK_FREE.test(html)) ctaLegacy.push(rel);
  if (MED_REVIEW.test(html)) medLegacy.push(rel);
  if (rel.startsWith('blog/') && !['blog/index.html', 'blog/all.html', 'blog/adhd.html', 'blog/weight-loss.html', 'blog/telehealth.html'].includes(rel)) {
    if (PENDING.test(html)) pendingOk++;
    else if (!PENDING.test(html) && !html.includes('clinical-review--reviewed')) pendingMissing.push(rel);
  }
  if (rel.startsWith('answers/') && rel !== 'answers/index.html') {
    if (PENDING.test(html)) pendingOk++;
    else if (!html.includes('clinical-review--reviewed')) pendingMissing.push(rel);
  }
}

const hub = fs.readFileSync(path.join(SITE_ROOT, 'answers/index.html'), 'utf8');
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const hubCategoryLabels = [
  'Metabolic Health',
  'Energy & Fatigue',
  'Hormone Health',
  'ADHD & Focus',
  'Telehealth & Care',
];
const hubChecks = {
  h1: /<h1>Health Guides<\/h1>/.test(hub),
  cards: hub.includes('health-guides-hub-grid'),
  categories: hubCategoryLabels.every((l) => hub.includes(escHtml(l))),
};

const llms = fs.existsSync(path.join(SITE_ROOT, 'llms.txt'))
  ? fs.readFileSync(path.join(SITE_ROOT, 'llms.txt'), 'utf8')
  : '';
const llmsFull = fs.existsSync(path.join(SITE_ROOT, 'llms-full.txt'))
  ? fs.readFileSync(path.join(SITE_ROOT, 'llms-full.txt'), 'utf8')
  : '';

fs.writeFileSync(
  path.join(SITE_ROOT, 'STATE-STANDARDIZATION-REPORT.md'),
  `# State Standardization Report

Generated: ${new Date().toISOString()}

## Canonical standard

- **Bullet:** ${STATES_BULLET}
- **Prose:** ${STATES_INLINE}
- **Footer:** ${FOOTER_STATES_LINE}

## Implementation

- \`data/site-standards.mjs\` — single source of truth
- \`scripts/site-chrome.mjs\` — \`normalizeSitewideCopy()\` + footer brand replacement on every \`seo-build\` pass
- \`scripts/generate-answer-pages.mjs\` — answer footer template

## Post-build scan (${htmlFiles.length} pages)

| Check | Result |
|-------|--------|
| Pages with canonical 4-state footer line | ${stateFixed} |
| Legacy 3-state / wrong-order footer | **${stateLegacy.length}** |

${stateLegacy.length ? stateLegacy.slice(0, 40).map((r) => `- \`${r}\``).join('\n') : '_None — all footers standardized._'}

## Homepage note

\`index.html\` provider schema uses \`areaServed\` array; body copy should match **${STATES_INLINE}**.
`,
);

fs.writeFileSync(
  path.join(SITE_ROOT, 'HEALTH-GUIDES-CLEANUP-REPORT.md'),
  `# Health Guides Naming Cleanup Report

Generated: ${new Date().toISOString()}

## Replacements applied

| Legacy | New |
|--------|-----|
| Clinical Answers Hub | Health Guides Hub |
| Clinical Answers / clinical answers | Health Guides / health guides |
| Browse clinical answers | Browse Health Guides |
| Health guides (H1) | Health Guides |

## Sources updated

- \`scripts/generate-answer-pages.mjs\` — next steps, meta, hub
- \`scripts/site-chrome.mjs\` — sitewide normalize
- \`scripts/generate-ai-indexes.mjs\` — \`health-guide\` topic tag, llms.txt hub line
- \`scripts/internal-link-audit.mjs\` — link label

## Post-build scan

| Pattern | Remaining files |
|---------|----------------:|
| Clinical Answers / clinical answers / Browse clinical answers | **${hgLegacy.length}** |

${hgLegacy.length ? hgLegacy.map((r) => `- \`${r}\``).join('\n') : '_None in production HTML._'}

## AI indexes

| File | Health Guides hub |
|------|-------------------|
| llms.txt | ${llms.includes('Health Guides') ? '✓' : '✗'} |
| llms-full.txt | ${llmsFull.includes('Health Guides Hub') || !llmsFull.includes('Clinical Answers Hub') ? '✓' : 'check titles'} |

## Hub UX

| Check | Status |
|-------|--------|
| H1 "Health Guides" | ${hubChecks.h1 ? '✓' : '✗'} |
| Category card grid | ${hubChecks.cards ? '✓' : '✗'} |
| Five categories present | ${hubChecks.categories ? '✓' : '✗'} |
| Nav label "${NAV_HEALTH_GUIDES.label}" | ${hub.includes(NAV_HEALTH_GUIDES.label) ? '✓' : '✗'} |
`,
);

fs.writeFileSync(
  path.join(SITE_ROOT, 'CTA-CLEANUP-REPORT.md'),
  `# CTA Cleanup Report

Generated: ${new Date().toISOString()}

## Standard CTAs

| Role | Copy |
|------|------|
| Primary | Book a Meet & Greet |
| Secondary | Explore Care Options |
| ADHD-only nav | Start Free Screening |

## Replacements

- \`Book Free Consultation\` → \`Book a Meet & Greet\` (including \`→\` variants)
- Applied via \`normalizeSitewideCopy()\` on every page in \`seo-build\`

## Post-build scan

| Pattern | Remaining |
|---------|----------:|
| Book Free Consultation | **${ctaLegacy.length}** |

${ctaLegacy.length ? ctaLegacy.map((r) => `- \`${r}\``).join('\n') : '_None — cleanup complete._'}

## Verified page types

- Blog hubs: index, all, adhd, weight-loss, telehealth
- Service: telehealth.html, weight-loss-metabolic-health.html
- Provider pages: normalized on build
`,
);

fs.writeFileSync(
  path.join(SITE_ROOT, 'HEALTH-GUIDES-UX-REPORT.md'),
  `# Health Guides UX Report

Generated: ${new Date().toISOString()}

## /answers index refactor

Replaced flat topic lists with **category cards**:

1. **Metabolic Health** — weight-loss topic seeds (GLP-1, insulin, food noise)
2. **Energy & Fatigue** — fatigue / sleep-related guides
3. **Hormone Health** — men's health / testosterone / hair / ED
4. **ADHD & Focus** — all ADHD-topic seeds
5. **Telehealth & Care** — telehealth logistics, Meet & Greet, prescriptions

## UI components

- \`.health-guides-hub-grid\` — responsive card grid
- \`.health-guides-card\` — category card with preview links + "Explore care" CTA
- Expand "+ N more" per category (inline script on hub)

## CSS

Added in \`styles.css\` after existing \`.answer-hub-*\` rules.

## URL

Unchanged: \`/answers\` (SEO/backlinks preserved)

## Hub verification

${Object.entries(hubChecks)
  .map(([k, v]) => `- ${k}: ${v ? 'PASS' : 'FAIL'}`)
  .join('\n')}
`,
);

const qaPass =
  stateLegacy.length === 0 &&
  hgLegacy.length === 0 &&
  ctaLegacy.length === 0 &&
  medLegacy.length === 0 &&
  pendingMissing.length === 0 &&
  hubChecks.h1 &&
  hubChecks.cards &&
  hubChecks.categories;

fs.writeFileSync(
  path.join(SITE_ROOT, 'POST-REPOSITIONING-QA.md'),
  `# Post-Repositioning QA

Generated: ${new Date().toISOString()}

## Overall: ${qaPass ? '**PASS**' : '**REVIEW**'} (automated checks)

| Check | Status |
|-------|--------|
| California in footer (${STATES_INLINE}) | ${stateLegacy.length === 0 ? '✓' : `✗ ${stateLegacy.length} files`} |
| Health Guides terminology | ${hgLegacy.length === 0 ? '✓' : `✗ ${hgLegacy.length} files`} |
| No Book Free Consultation | ${ctaLegacy.length === 0 ? '✓' : `✗ ${ctaLegacy.length} files`} |
| No stale Medically reviewed | ${medLegacy.length === 0 ? '✓' : `✗ ${medLegacy.length} files`} |
| Pending review on educational pages | ${pendingMissing.length === 0 ? '✓' : `✗ ${pendingMissing.length} missing`} |
| Health Guides hub UX | ${hubChecks.h1 && hubChecks.cards && hubChecks.categories ? '✓' : 'partial'} |

## Educational content review blocks

- Pages with pending review block: **${pendingOk}**
- Missing review block: **${pendingMissing.length}**

${pendingMissing.length ? pendingMissing.slice(0, 15).map((r) => `- \`${r}\``).join('\n') : ''}

## Related reports

- [STATE-STANDARDIZATION-REPORT.md](./STATE-STANDARDIZATION-REPORT.md)
- [HEALTH-GUIDES-CLEANUP-REPORT.md](./HEALTH-GUIDES-CLEANUP-REPORT.md)
- [CTA-CLEANUP-REPORT.md](./CTA-CLEANUP-REPORT.md)
- [HEALTH-GUIDES-UX-REPORT.md](./HEALTH-GUIDES-UX-REPORT.md)
- [PRODUCTION-READINESS-AUDIT.md](./PRODUCTION-READINESS-AUDIT.md)

## Build command

\`\`\`bash
cd apps/siya-health
node scripts/generate-answer-pages.mjs
node scripts/internal-link-audit.mjs
node scripts/seo-build.mjs
node scripts/generate-ai-indexes.mjs
node scripts/generate-post-repositioning-reports.mjs
\`\`\`
`,
);

console.log('QA:', qaPass ? 'PASS' : 'REVIEW', {
  stateLegacy: stateLegacy.length,
  hgLegacy: hgLegacy.length,
  ctaLegacy: ctaLegacy.length,
  medLegacy: medLegacy.length,
});
