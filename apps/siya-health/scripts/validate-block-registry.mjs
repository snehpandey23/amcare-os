#!/usr/bin/env node
/**
 * Siya Knowledge Governance Framework v1.0 — Block Registry Validator.
 *
 * Audits BLOCKS, not pages. Answers "which blocks are unsafe / out of place?"
 *
 * Checks:
 *   1. Every SIYA:* marker in the site is registered (or matches a chrome pattern).
 *   2. No block renders outside its allowedTopics / allowedPaths (Clinical Context gate).
 *   3. No deprecated block renders anywhere.
 *   4. Reports usage count ("pages affected") per block for versioning.
 *
 * Output: docs/BLOCK-REGISTRY-STATUS.json + console summary. Exit 1 on violations.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CONTENT_BLOCKS, BLOCK_BY_ID, CHROME_MARKER_PATTERNS, GOVERNANCE_VERSION } from '../data/content-blocks.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '.git', 'scripts', 'data', 'docs', 'audit', '.vercel']);
const MARKER_RE = /<!-- (SIYA:[A-Z0-9-]+) -->/g;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...walk(path.join(dir, entry.name)));
    } else if (entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function relPath(f) {
  return path.relative(SITE_ROOT, f);
}

function isChromePattern(id) {
  return CHROME_MARKER_PATTERNS.some((re) => re.test(id));
}

function topicOfPath(rel) {
  const p = rel.toLowerCase();
  if (/adhd/.test(p)) return 'adhd';
  if (/glp-1|semaglutide|tirzepatide|weight|ozempic|wegovy|mounjaro/.test(p)) return 'weight-loss';
  if (/testosterone|trt|mens-health|men-/.test(p)) return 'mens-health';
  if (/menopause|perimenopause|womens|hormone|midlife/.test(p)) return 'womens-health';
  if (/primary|urgent/.test(p)) return 'primary-care';
  if (/labs/.test(p)) return 'labs';
  return null;
}

const files = walk(SITE_ROOT);
const usage = new Map(); // id -> Set<relPath>
const unregistered = new Map(); // id -> count
const violations = []; // { block, file, reason }

for (const file of files) {
  const rel = relPath(file);
  const html = fs.readFileSync(file, 'utf8');
  const seen = new Set();
  let m;
  MARKER_RE.lastIndex = 0;
  while ((m = MARKER_RE.exec(html))) {
    const id = m[1];
    if (seen.has(id)) continue; // count once per file (open/close pairs)
    seen.add(id);

    if (!usage.has(id)) usage.set(id, new Set());
    usage.get(id).add(rel);

    const block = BLOCK_BY_ID.get(id);
    if (!block) {
      if (!isChromePattern(id)) unregistered.set(id, (unregistered.get(id) || 0) + 1);
      continue;
    }

    if (block.status === 'deprecated') {
      violations.push({ block: id, file: rel, reason: `Deprecated block still rendering (${block.notes || ''})` });
      continue;
    }

    // Clinical Context gate: allowedTopics
    if (block.allowedTopics !== 'any') {
      const topic = topicOfPath(rel);
      const topicOk = Array.isArray(block.allowedTopics) && block.allowedTopics.length > 0 && block.allowedTopics.includes(topic);
      const pathOk = block.allowedPaths ? block.allowedPaths.test(rel) : false;
      if (!topicOk && !pathOk) {
        violations.push({
          block: id,
          file: rel,
          reason: `Rendered outside allowedTopics [${block.allowedTopics.join(', ') || 'none'}]${block.allowedPaths ? ' / allowedPaths' : ''} (page topic: ${topic || 'unknown'})`,
        });
      }
    }
  }
}

// Build status report
const blockStatus = CONTENT_BLOCKS.map((b) => ({
  id: b.id,
  name: b.name,
  kind: b.kind,
  entity: b.entity || null,
  owner: b.owner,
  version: b.version,
  approved: b.approved,
  clinicalReview: b.clinicalReview,
  status: b.status,
  pagesAffected: usage.has(b.id) ? usage.get(b.id).size : 0,
}));

const report = {
  framework: 'Siya Knowledge Governance Framework',
  governanceVersion: GOVERNANCE_VERSION,
  generated: new Date().toISOString(),
  filesScanned: files.length,
  registeredBlocks: CONTENT_BLOCKS.length,
  unregisteredMarkers: [...unregistered.entries()].map(([id, count]) => ({ id, files: count })),
  violations,
  blocks: blockStatus.sort((a, b) => b.pagesAffected - a.pagesAffected),
};

fs.writeFileSync(path.join(SITE_ROOT, 'docs', 'BLOCK-REGISTRY-STATUS.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');

// Console summary
console.log(`\nSiya Knowledge Governance Framework v${GOVERNANCE_VERSION} — Block Registry Audit`);
console.log('─'.repeat(60));
console.log(`Files scanned:        ${files.length}`);
console.log(`Registered blocks:    ${CONTENT_BLOCKS.length}`);
console.log(`Unregistered markers: ${report.unregisteredMarkers.length}`);
console.log(`Context violations:   ${violations.length}`);
console.log('');
console.log('Top blocks by pages affected (versioning anchor):');
for (const b of report.blocks.filter((x) => x.status !== 'chrome').slice(0, 12)) {
  console.log(`  ${String(b.pagesAffected).padStart(4)}  ${b.version.padEnd(6)} ${b.id}  [clinical:${b.owner.clinical}]`);
}

if (report.unregisteredMarkers.length) {
  console.log('\n⚠ Unregistered markers (add to data/content-blocks.mjs or CHROME_MARKER_PATTERNS):');
  for (const u of report.unregisteredMarkers) console.log(`   ${u.id}  (${u.files} files)`);
}

if (violations.length) {
  console.log('\n✗ CONTEXT / SAFETY VIOLATIONS:');
  for (const v of violations.slice(0, 40)) console.log(`   [${v.block}] ${v.file}\n      → ${v.reason}`);
  console.log(`\nWrote docs/BLOCK-REGISTRY-STATUS.json`);
  process.exit(1);
}

console.log('\n✓ All rendered blocks are registered and within their allowed context.');
console.log('Wrote docs/BLOCK-REGISTRY-STATUS.json');
