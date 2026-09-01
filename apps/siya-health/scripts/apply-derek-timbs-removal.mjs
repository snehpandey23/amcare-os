/**
 * Fail-closed audit: Dr. Derek Timbs must not appear on the public patient site.
 * Source of truth: removed from data/providers.mjs + provider-canonical.json;
 * profile retired via data/retired-content.mjs → retire-pages.mjs stub + vercel redirect.
 *
 * Run: node scripts/apply-derek-timbs-removal.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllProviders } from '../data/providers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.vercel', '.git', 'docs', 'public', 'brand']);
const SKIP_FILES = new Set([
  'data/provider-consistency-audit.json',
  'data/website-inventory.json',
  'data/internal-link-audit.json',
  'data/site-pruning-audit.json',
  'data/cta-audit.json',
  'data/pricing-system-audit.json',
  'data/brand-consistency-audit.json',
  'data/retired-content.mjs',
  'data/redirect-map.mjs',
  'scripts/apply-derek-timbs-removal.mjs',
  'scripts/validate-deployment-hardening.mjs',
  'scripts/synthesize-standards-audit-report.mjs',
  'vercel.json',
]);

const DEREK_PATTERNS = [/derek-timbs/i, /Derek Timbs/i];

function walkFiles(dir, baseRel = '', out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(full, rel, out);
    else if (/\.(html|json|txt|xml|mjs)$/i.test(e.name)) out.push(rel);
  }
  return out;
}

function derekViolation(content, rel) {
  if (rel === 'providers/derek-timbs.html') {
    if (!/noindex/i.test(content)) return 'profile stub must declare noindex';
    if (DEREK_PATTERNS.some((re) => re.test(content))) return 'retirement stub must not contain provider name';
    return null;
  }
  if (DEREK_PATTERNS.some((re) => re.test(content))) return 'contains Derek Timbs reference';
  return null;
}

const violations = [];
for (const rel of walkFiles(SITE_ROOT)) {
  if (SKIP_FILES.has(rel)) continue;
  const content = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const reason = derekViolation(content, rel);
  if (reason) violations.push({ rel, reason });
}

if (getAllProviders().some((p) => p.slug === 'derek-timbs')) {
  violations.push({ rel: 'data/providers.mjs', reason: 'derek-timbs still in active provider roster' });
}

const sitemap = fs.existsSync(path.join(SITE_ROOT, 'sitemap.xml'))
  ? fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8')
  : '';
if (/providers\/derek-timbs/.test(sitemap)) {
  violations.push({ rel: 'sitemap.xml', reason: 'derek-timbs URL still indexed' });
}

const vercel = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'vercel.json'), 'utf8'));
const derekRedirect = vercel.redirects?.find((r) => r.source === '/providers/derek-timbs');
if (!derekRedirect || derekRedirect.destination !== '/providers') {
  violations.push({ rel: 'vercel.json', reason: 'missing permanent redirect /providers/derek-timbs → /providers' });
}

const count = getAllProviders().length;
const countViolations = [];
for (const rel of walkFiles(SITE_ROOT).filter((r) => r.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  if (/7 clinicians/i.test(html)) countViolations.push(rel);
}

if (violations.length) {
  console.error('Derek Timbs removal audit: FAIL');
  for (const v of violations) console.error(`  - ${v.rel}: ${v.reason}`);
  process.exit(1);
}

if (countViolations.length) {
  console.error('Provider count audit: FAIL (still says 7 clinicians)');
  for (const v of countViolations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log(`Derek Timbs removal audit: PASS (${count} active clinicians)`);
