/**
 * Ensures HTML uses root-relative /assets/, /styles.css, /scripts/ (cleanUrls-safe).
 * Run after seo-build: node scripts/validate-root-asset-paths.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const errors = [];
const BAD_PATTERNS = [
  /\bsrc="assets\//,
  /\bsrc="\.\.\/assets\//,
  /\bhref="assets\//,
  /\bhref="\.\.\/assets\//,
  /\bhref="styles\.css"/,
  /\bhref="\.\.\/styles\.css"/,
  /url\(\s*['"]assets\//,
  /url\(\s*['"](?:\.\.\/)+assets\//,
];

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'public') continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(rel, files);
    else if (e.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

for (const rel of walkHtml('.')) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  for (const re of BAD_PATTERNS) {
    if (re.test(html)) {
      errors.push(`${rel}: relative static asset path (${re})`);
      break;
    }
  }
}

if (errors.length) {
  console.error('validate-root-asset-paths: FAIL');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}

console.log('validate-root-asset-paths: PASS');
