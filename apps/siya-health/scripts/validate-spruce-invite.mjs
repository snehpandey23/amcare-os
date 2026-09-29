/**
 * Fail the build if any shipped HTML still opens the old Spruce invite.
 * The current invite is SPRUCE_CHAT_URL in data/providers-core.mjs.
 *
 * Run: node scripts/validate-spruce-invite.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SITE_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OLD = 'spruce.care/siyahealth';
const SKIP_DIRS = new Set(['node_modules', 'scripts', 'docs', 'brand', 'previews', '.vercel']);

function walk(dir, hits) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walk(full, hits);
      continue;
    }
    if (!ent.name.endsWith('.html')) continue;
    const text = fs.readFileSync(full, 'utf8');
    if (!text.includes(OLD)) continue;
    const lines = [];
    text.split('\n').forEach((line, i) => {
      if (line.includes(OLD)) lines.push(i + 1);
    });
    hits.push(`${path.relative(SITE_ROOT, full)}:${lines.join(',')}`);
  }
}

const hits = [];
walk(SITE_ROOT, hits);
if (hits.length) {
  console.error(`spruce invite check FAILED — old spruce.care/siyahealth still in HTML (${hits.length}):`);
  for (const line of hits) console.error(`  ${line}`);
  process.exit(1);
}
console.log('spruce invite check passed (no spruce.care/siyahealth in shipped HTML).');
