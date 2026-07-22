/**
 * Phase 7 — Replace internal hrefs pointing at redirect sources with canonical destinations.
 * Run: node scripts/phase7-link-remediation.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INTERNAL_LINK_CANONICAL } from '../data/redirect-map.mjs';
import { ADHD_COMMERCIAL_PATHS } from '../data/adhd-commercial-links.mjs';

/** Legacy legal shells — footers use LEGAL_LINKS; do not rewrite remaining /terms or /privacy-policy hrefs */
const SKIP_HREF_REWRITE = new Set(['/terms', '/privacy-policy', ...ADHD_COMMERCIAL_PATHS]);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const SCAN_DIRS = ['.', 'data', 'scripts'];
const SCAN_EXT = new Set(['.html', '.mjs', '.py', '.json']);
const SKIP_DIRS = new Set(['node_modules', 'public', '.git']);

function walk(dir, base = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const rel = path.join(base, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, rel));
    else if (SCAN_EXT.has(path.extname(e.name))) out.push(rel);
  }
  return out;
}

function remediateContent(text) {
  let changed = 0;
  let out = text;
  const sorted = Object.entries(INTERNAL_LINK_CANONICAL).sort((a, b) => b[0].length - a[0].length);
  for (const [src, dest] of sorted) {
    if (src === dest || SKIP_HREF_REWRITE.has(src)) continue;
    const patterns = [
      new RegExp(`(href=["'])${src.replace(/\//g, '\\/')}(["'])`, 'g'),
      new RegExp(`(href=['"])${src.replace(/\//g, '\\/')}(['"])`, 'g'),
    ];
    for (const re of patterns) {
      const next = out.replace(re, `$1${dest}$2`);
      if (next !== out) {
        changed += (out.match(re) || []).length;
        out = next;
      }
    }
  }
  return { out, changed };
}

let totalFiles = 0;
let totalReplacements = 0;

for (const root of SCAN_DIRS) {
  const abs = path.join(SITE_ROOT, root === '.' ? '' : root);
  const files = root === '.' ? walk(SITE_ROOT).filter((f) => !f.startsWith('docs/')) : walk(abs, root);
  for (const rel of files) {
    if (rel.endsWith('redirect-map.mjs') || rel.endsWith('phase7-link-remediation.mjs')) continue;
    const full = path.join(SITE_ROOT, rel);
    const before = fs.readFileSync(full, 'utf8');
    const { out, changed } = remediateContent(before);
    if (changed > 0) {
      fs.writeFileSync(full, out, 'utf8');
      totalFiles++;
      totalReplacements += changed;
      console.log(`  ${rel}: ${changed} href fix(es)`);
    }
  }
}

console.log(`Link remediation: ${totalReplacements} replacements in ${totalFiles} files`);
