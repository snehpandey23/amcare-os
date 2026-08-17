#!/usr/bin/env node
/**
 * Fail closed if blog hub cards lose their titles (assembly-cap regression).
 * Run: node scripts/validate-blog-hub-cards.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HUBS = [
  'blog/index.html',
  'blog/adhd.html',
  'blog/weight-loss.html',
  'blog/telehealth.html',
];

const empty = [];
for (const rel of HUBS) {
  const html = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const cards = [...html.matchAll(/<article class="blog-card">([\s\S]*?)<\/article>/gi)];
  for (const m of cards) {
    const block = m[1];
    const heading = block.match(/<h[23]>([\s\S]*?)<\/h[23]>/i);
    const title = (heading ? heading[1] : '').replace(/<[^>]+>/g, '').trim();
    if (!title) {
      const tag = (block.match(/blog-card-tag">([^<]+)/) || [, '?'])[1];
      empty.push(`${rel} [${tag}]`);
    }
  }
}

if (empty.length) {
  console.error('validate-blog-hub-cards: FAIL — empty card titles:');
  for (const row of empty) console.error('  ', row);
  process.exit(1);
}

console.log(`validate-blog-hub-cards: OK (${HUBS.length} hubs)`);
