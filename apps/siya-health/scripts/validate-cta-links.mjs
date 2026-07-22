/**
 * Fail the build on empty/placeholder CTA hrefs and broken internal links.
 * Run: node scripts/validate-cta-links.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.vercel', '.git', 'docs', 'data', 'public']);

const PLACEHOLDER_HREFS = new Set([
  '',
  '#',
  '#!',
  'javascript:void(0)',
  'javascript:void(0);',
  'javascript:;',
  'undefined',
  'null',
  '[object Object]',
]);

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtml(full, rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function fileToPath(rel) {
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.replace(/\.html$/i, '');
}

function existsInternal(dest, allPaths, redirectTargets = new Set()) {
  const p = dest.split('?')[0].split('#')[0];
  if (!p || p === '/') return true;
  const variants = [p, p.replace(/\/$/, '')];
  if (!p.endsWith('.html')) {
    variants.push(p + '.html', p.replace(/\/$/, '') + '/index.html', p + '/index.html');
  }
  if (variants.some((v) => allPaths.has(v) || fs.existsSync(path.join(SITE_ROOT, v.replace(/^\//, ''))))) {
    return true;
  }
  // Permanent Vercel redirects count as valid destinations when target exists
  for (const v of variants) {
    if (redirectTargets.has(v) || redirectTargets.has(v.replace(/\/$/, ''))) return true;
  }
  return false;
}

function loadRedirectTargets() {
  const ok = new Set();
  const vercelPath = path.join(SITE_ROOT, 'vercel.json');
  if (!fs.existsSync(vercelPath)) return ok;
  try {
    const cfg = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    for (const r of cfg.redirects || []) {
      const source = '/' + String(r.source || '').replace(/^\//, '').split('?')[0];
      const dest = String(r.destination || '').split('?')[0];
      if (!dest.startsWith('/')) continue;
      const destVariants = [dest, dest.replace(/\/$/, ''), dest + '.html', dest + '/index.html'];
      if (destVariants.some((d) => allPaths.has(d) || fs.existsSync(path.join(SITE_ROOT, d.replace(/^\//, ''))))) {
        ok.add(source);
      }
    }
  } catch {
    /* ignore */
  }
  return ok;
}

const files = walkHtml(SITE_ROOT);
const allPaths = new Set(files.map(fileToPath));
allPaths.add('/');
const redirectTargets = loadRedirectTargets();

const issues = [];
let scanned = 0;

for (const rel of files) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const re = /<a\s+([^>]*?)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1];
    const hm = tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
    if (!hm) continue;
    const href = hm[2].trim();
    scanned += 1;
    const low = href.toLowerCase();

    if (PLACEHOLDER_HREFS.has(low) || PLACEHOLDER_HREFS.has(href)) {
      issues.push({ file: rel, href, problem: 'empty_or_placeholder_href' });
      continue;
    }
    if (
      /(?:^|\/)(?:todo|coming-soon|undefined|tbd|placeholder)(?:\/|$)/i.test(href) ||
      /example\.com|lorem|FIXME|TODO/i.test(href)
    ) {
      issues.push({ file: rel, href, problem: 'placeholder_pattern' });
      continue;
    }
    if ((low === 'undefined' || low.includes('undefined')) && !href.startsWith('http')) {
      issues.push({ file: rel, href, problem: 'undefined_href' });
      continue;
    }
    if (href.startsWith('/') && !href.startsWith('//')) {
      if (!existsInternal(href, allPaths, redirectTargets)) {
        issues.push({ file: rel, href, problem: 'broken_internal' });
      }
    }
  }
}

const reportPath = path.join(SITE_ROOT, 'data', 'cta-link-validation.json');
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      generated: new Date().toISOString(),
      scanned,
      files: files.length,
      issueCount: issues.length,
      issues,
    },
    null,
    2,
  ) + '\n',
  'utf8',
);

console.log(`CTA/link validation: scanned ${scanned} hrefs across ${files.length} HTML files`);
console.log(`Issues: ${issues.length}`);
if (issues.length) {
  for (const i of issues.slice(0, 50)) {
    console.error(`  [${i.problem}] ${i.file} → ${i.href}`);
  }
  if (issues.length > 50) console.error(`  … +${issues.length - 50} more`);
  process.exit(1);
}
console.log('Wrote', reportPath);
