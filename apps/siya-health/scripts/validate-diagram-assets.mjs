/**
 * Ensures every diagram <img> reference resolves to a file under assets/diagrams/.
 * Run: node scripts/validate-diagram-assets.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DIAGRAMS } from '../data/visual-diagrams.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const DIAGRAMS_DIR = path.join(SITE_ROOT, 'assets', 'diagrams');

const errors = [];

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'public') continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(rel, files);
    else if (e.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

for (const file of Object.values(DIAGRAMS)) {
  const full = path.join(DIAGRAMS_DIR, file.file);
  if (!fs.existsSync(full)) {
    errors.push(`Registry diagram missing on disk: assets/diagrams/${file.file}`);
  }
}

const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;

for (const rel of walkHtml('.')) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    const src = m[1];
    if (!src.includes('diagrams/') || !src.endsWith('.svg')) continue;

    if (!src.startsWith('/assets/diagrams/')) {
      errors.push(`${rel}: diagram src must be root-relative (/assets/diagrams/...), got "${src}"`);
      continue;
    }

    const filename = path.basename(src);
    const onDisk = path.join(DIAGRAMS_DIR, filename);
    if (!fs.existsSync(onDisk)) {
      errors.push(`${rel}: missing file for src="${src}"`);
    }
  }
}

if (errors.length) {
  console.error('validate-diagram-assets: FAIL');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
}

console.log('validate-diagram-assets: PASS —', Object.keys(DIAGRAMS).length, 'registry diagrams, HTML refs OK');
