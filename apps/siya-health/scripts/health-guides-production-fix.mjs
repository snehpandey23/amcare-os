/**
 * Apply Health Guides copy normalization + scan built HTML.
 * Run: npm run build && node scripts/health-guides-production-fix.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeSitewideCopy, NAV_HEALTH_GUIDES } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const USER_FACING_PATTERNS = [
  { label: '>Answers</a>', re: />Answers<\/a>/ },
  { label: 'Clinical Answers', re: /Clinical Answers/i },
  { label: 'Browse clinical answers', re: /Browse clinical answers/i },
  { label: 'Browse Answers', re: /Browse Answers/i },
  { label: 'Answers Hub', re: /Answers Hub/i },
  { label: 'breadcrumb "Answers"', re: /"name"\s*:\s*"Answers"/ },
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

function scanAll(files) {
  const byPattern = USER_FACING_PATTERNS.map((p) => ({ ...p, files: [] }));
  for (const rel of files) {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    for (const p of byPattern) {
      if (p.re.test(html)) p.files.push(rel);
    }
  }
  return byPattern;
}

function main() {
  const files = walkHtml(SITE_ROOT);
  const before = scanAll(files);
  const changed = [];

  for (const rel of files) {
    const fp = path.join(SITE_ROOT, rel);
    const html = fs.readFileSync(fp, 'utf8');
    const next = normalizeSitewideCopy(html);
    if (next !== html) {
      fs.writeFileSync(fp, next, 'utf8');
      changed.push(rel);
    }
  }

  const after = scanAll(files);
  const sitemap = fs.existsSync(path.join(SITE_ROOT, 'sitemap.xml'))
    ? (fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8').match(/<loc>/g) || []).length
    : 0;

  const hub = fs.readFileSync(path.join(SITE_ROOT, 'answers/index.html'), 'utf8');
  const index = fs.readFileSync(path.join(SITE_ROOT, 'index.html'), 'utf8');

  const report = `# Health Guides Production Fix Report

**Generated:** ${new Date().toISOString().slice(0, 10)}

## Goal

User-facing: **${NAV_HEALTH_GUIDES.label}** · URL: **${NAV_HEALTH_GUIDES.path}** (unchanged)

## Files changed (normalizeSitewideCopy)

${changed.length ? changed.map((f) => `- \`${f}\``).join('\n') : '- None required'}

## User-facing pattern scan (after normalize)

| Pattern | File count | Files |
|---------|------------|-------|
${after
  .map((p) => `| ${p.label} | ${p.files.length} | ${p.files.length ? p.files.slice(0, 8).join(', ') + (p.files.length > 8 ? '…' : '') : '—'} |`)
  .join('\n')}

**Total HTML files scanned:** ${files.length}

## Hub & homepage verification

| Page | Nav Health Guides | Footer Health Guides |
|------|-----------------|----------------------|
| \`answers/index.html\` | ${hub.includes('href="/answers">Health Guides</a>') ? '✓' : '✗'} | ${/<footer[\s\S]*Health Guides<\/a>/i.test(hub) ? '✓' : '✗'} |
| \`index.html\` | ${index.includes('href="/answers">Health Guides</a>') ? '✓' : '✗'} | ${/<footer[\s\S]*Health Guides<\/a>/i.test(index) ? '✓' : '✗'} |

Hub H1: ${hub.includes('<h1>Health Guides</h1>') ? '✓ Health Guides' : '✗ missing'}

## Sitemap

**${sitemap}** URLs in \`sitemap.xml\`

## Remaining technical "answers" (category B/C — OK)

- URL paths: \`/answers\`, \`/answers/{slug}\`
- Directory: \`answers/\`
- Code: \`ANSWER_SEEDS\`, \`answer-seeds.mjs\`, \`generate-answer-pages.mjs\`
- Meta prose: "short answers, evidence" (not a product label)

## Acceptable marketing "Answers" (not hub labels)

- \`about.html\` — "Answers about ADHD"
- \`blog/adhd-symptoms-overlooked.html\` — "Answers without the wait"

## Before → after (files with legacy labels)

${before
  .filter((p) => p.files.length)
  .map((p) => `- **${p.label}:** ${p.files.length} → ${after.find((a) => a.label === p.label)?.files.length ?? 0}`)
  .join('\n') || '- No legacy labels detected before normalize'}
`;

  fs.writeFileSync(path.join(SITE_ROOT, 'HEALTH-GUIDES-PRODUCTION-FIX-REPORT.md'), report, 'utf8');
  const failCount = after.reduce((n, p) => n + p.files.length, 0);
  console.log('Wrote HEALTH-GUIDES-PRODUCTION-FIX-REPORT.md');
  console.log('Legacy user-facing hits:', failCount);
  if (failCount) process.exit(1);
}

main();
