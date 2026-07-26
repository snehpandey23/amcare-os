#!/usr/bin/env node
/**
 * Siya Knowledge Governance Framework v1.0 — Report Hygiene Validator.
 *
 * A governance report must be as clean as the site it evaluates.
 * Flags in audit/*.md and docs governance files:
 *   - Duplicate headings (same normalized text > once)
 *   - Duplicate sections / appendices
 *   - Repeated paragraph blocks (accidental copy-paste)
 *
 * Exit 1 on duplicates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const TARGET_DIRS = [path.join(SITE_ROOT, 'audit')];
const TARGET_FILES = [
  path.join(SITE_ROOT, 'docs', 'SIYA-KNOWLEDGE-GOVERNANCE-FRAMEWORK.md'),
];

function collect() {
  const files = [];
  for (const dir of TARGET_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.md')) files.push(path.join(dir, f));
  }
  for (const f of TARGET_FILES) if (fs.existsSync(f)) files.push(f);
  return files;
}

function normHeading(h) {
  return h.replace(/^#+\s*/, '').replace(/[^a-z0-9 ]/gi, '').trim().toLowerCase();
}

let problems = 0;
for (const file of collect()) {
  const rel = path.relative(SITE_ROOT, file);
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  // Duplicate headings (H2/H3)
  const headingCount = new Map();
  for (const line of lines) {
    if (/^#{2,3}\s+/.test(line)) {
      const key = normHeading(line);
      if (key.length < 4) continue;
      headingCount.set(key, (headingCount.get(key) || 0) + 1);
    }
  }
  const dupHeadings = [...headingCount.entries()].filter(([, n]) => n > 1);
  if (dupHeadings.length) {
    problems += dupHeadings.length;
    console.log(`\n✗ ${rel} — duplicate headings:`);
    for (const [h, n] of dupHeadings) console.log(`   "${h}" ×${n}`);
  }

  // Duplicate non-trivial paragraphs
  const paras = fs
    .readFileSync(file, 'utf8')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 80 && !p.startsWith('|') && !p.startsWith('```'));
  const paraCount = new Map();
  for (const p of paras) paraCount.set(p, (paraCount.get(p) || 0) + 1);
  const dupParas = [...paraCount.entries()].filter(([, n]) => n > 1);
  if (dupParas.length) {
    problems += dupParas.length;
    console.log(`\n✗ ${rel} — duplicate paragraph blocks:`);
    for (const [p, n] of dupParas) console.log(`   ×${n}: ${p.slice(0, 70)}…`);
  }
}

console.log('\n' + '─'.repeat(60));
if (problems) {
  console.log(`Report hygiene: ${problems} duplication issue(s) found. Fix before publishing the report.`);
  process.exit(1);
}
console.log('✓ Report hygiene: no duplicate headings, sections, or paragraph blocks.');
