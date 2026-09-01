/**
 * Remove Dr. Sneh Pandey Texas licensing claims sitewide.
 * Source of truth: data/providers.mjs + data/provider-canonical.json (regenerate provider pages first).
 *
 * Run: node scripts/apply-sneh-tx-license-removal.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.vercel', '.git', 'docs', 'public', 'data']);

const REPLACEMENTS = [
  // Founder / medical director prose (Sneh-specific)
  [
    /He is licensed in <strong>California, Texas, Pennsylvania, and Florida<\/strong>/g,
    'He is licensed in <strong>California, Pennsylvania, and Florida</strong>',
  ],
  [
    /licensed in <strong>California, Texas, Pennsylvania, and Florida<\/strong>/g,
    'licensed in <strong>California, Pennsylvania, and Florida</strong>',
  ],
  // Sneh provider cards / taglines
  [
    /(<article[^>]*data-states=")CA,TX,PA,FL("[^>]*>[\s\S]*?dr-sneh-pandey[\s\S]*?<p class="about-team-tagline">Medical Director · Adult ADHD evaluation &amp; care · )CA, TX, PA, FL(<\/p>)/g,
    '$1CA,PA,FL$2CA, PA, FL$3',
  ],
  [
    /Medical Director · Adult ADHD evaluation &amp; care · CA, TX, PA, FL/g,
    'Medical Director · Adult ADHD evaluation &amp; care · CA, PA, FL',
  ],
  [
    /Adult ADHD &amp; metabolic care · CA, TX, PA, FL/g,
    'Adult ADHD &amp; metabolic care · CA, PA, FL',
  ],
  [
    /data-states="CA,TX,PA,FL"([^>]*>[\s\S]*?dr-sneh-pandey)/g,
    'data-states="CA,PA,FL"$1',
  ],
];

function snehTexasViolation(html, rel) {
  if (rel === 'providers/dr-sneh-pandey.html') {
    const main = html.replace(/<footer[\s\S]*$/i, '');
    if (/provider-state-chip">Texas/.test(main)) return true;
    if (/CA, TX, PA|CA, TX &/.test(main.slice(0, 4000))) return true;
    if (/"name":"Texas"/.test(main) && /#physician/.test(main)) return true;
    return false;
  }

  if (rel === 'blog/adhd-treatment-texas.html' && html.includes('dr-sneh-pandey')) return true;

  const articles = html.match(/<article[\s\S]*?<\/article>/gi) || [];
  for (const block of articles) {
    if (!block.includes('dr-sneh-pandey')) continue;
    if (/TX|Texas/.test(block)) return true;
  }

  const sections =
    html.match(/id="(?:why-siya-exists|medical-director|medical-director-message)"[\s\S]*?<\/section>/gi) ||
    [];
  for (const chunk of sections) {
    if (!/Sneh Pandey|dr-sneh-pandey/.test(chunk)) continue;
    if (/licensed in[\s\S]{0,120}Texas|CA, TX, PA, FL|CA, TX, PA &/i.test(chunk)) return true;
  }

  return false;
}

function walkHtml(dir, baseRel = '', out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(full, rel, out);
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function removeSnehCardFromTexasProviderSections(html) {
  if (!html.includes('dr-sneh-pandey') || !html.includes('licensed in <strong>TX</strong>')) {
    return html;
  }
  return html.replace(
    /<article class="about-team-card ds-provider-card" data-states="CA,TX,PA,FL">[\s\S]*?dr-sneh-pandey[\s\S]*?<\/article>\s*/g,
    '',
  );
}

function patchTexasBlogReviewer(html, rel) {
  if (rel !== 'blog/adhd-treatment-texas.html') return html;
  return html
    .replace(
      /meet the medical director behind the clinical model: <a href="\/providers\/dr-sneh-pandey">Dr\. Sneh Pandey, MD<\/a>/,
      'meet Texas-licensed clinicians on our <a href="/providers">care team</a>',
    )
    .replace(
      /<strong>Medical reviewer:<\/strong> <a href="\/providers\/dr-sneh-pandey">Dr\. Sneh Pandey, MD<\/a> — Internal Medicine · ABOM \(Obesity Medicine\) · Medical Director, Siya Health/,
      '<strong>Medical reviewer:</strong> <a href="/providers/dr-natasha-desai">Dr. Natasha Desai, MD</a> — Family Medicine · ADHD-CCSP · Texas-licensed physician, Siya Health',
    );
}

let changed = 0;
for (const rel of walkHtml(SITE_ROOT)) {
  const full = path.join(SITE_ROOT, rel);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;

  for (const [pattern, replacement] of REPLACEMENTS) {
    html = html.replace(pattern, replacement);
  }
  html = removeSnehCardFromTexasProviderSections(html);
  html = patchTexasBlogReviewer(html, rel);

  if (html !== before) {
    fs.writeFileSync(full, html, 'utf8');
    changed += 1;
    console.log('Patched', rel);
  }
}

/** Fail closed if Sneh is still tied to Texas licensing in patient-facing HTML. */
const violations = [];
for (const rel of walkHtml(SITE_ROOT)) {
  if (rel.startsWith('legal/')) continue;
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  if (snehTexasViolation(html, rel)) violations.push(rel);
}

console.log(`Patched ${changed} HTML files.`);
if (violations.length) {
  console.error('Sneh + Texas licensing still found in:');
  for (const v of [...new Set(violations)]) console.error('  -', v);
  process.exit(1);
}
console.log('Sneh TX license audit: PASS');
