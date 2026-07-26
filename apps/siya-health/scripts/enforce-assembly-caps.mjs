#!/usr/bin/env node
/**
 * Enforce Content Assembly caps across public HTML:
 * - Max 1 primary CTA button in <main>
 * - Max 8 <a> links per <section>/<aside>
 *
 * Idempotent. Run after generators / injectors.
 * Usage: node scripts/enforce-assembly-caps.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ASSEMBLY } from './content-assembly.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', 'brand', 'docs', 'scripts', 'data', 'design-system', '.vercel', 'assets', 'audit']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (!SKIP.has(e.name)) walk(path.join(dir, e.name), out);
    } else if (e.name.endsWith('.html') && !e.name.includes('LOCAL-PREVIEW') && !e.name.startsWith('_preview')) {
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function demoteExtraPrimaries(mainHtml) {
  let seen = 0;
  return mainHtml.replace(
    /<(a|button)\b([^>]*class="[^"]*\bds-button--primary\b[^"]*"[^>]*)>([\s\S]*?)<\/\1>/gi,
    (full, tag, attrs, inner) => {
      seen += 1;
      if (seen === 1) return full;
      const nextAttrs = attrs
        .replace(/\bds-button--primary\b/g, 'ds-button--secondary')
        .replace(/\bds-button--primary\b/g, 'ds-button--secondary');
      return `<${tag}${nextAttrs}>${inner}</${tag}>`;
    },
  );
}

function capSectionLinks(mainHtml, max = ASSEMBLY.maxLinksPerSection) {
  return mainHtml.replace(/<(section|aside)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, inner) => {
    let count = 0;
    const nextInner = inner.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (a) => {
      count += 1;
      if (count <= max) return a;
      // Drop excess links but keep surrounding text clean.
      return '';
    });
    // Clean empty list items / orphaned separators left by link removal
    const cleaned = nextInner
      .replace(/<li>\s*<\/li>/gi, '')
      .replace(/\s*[·•|,]\s*(?=[·•|,]|<)/g, ' ')
      .replace(/\(\s*\)/g, '')
      .replace(/\s{2,}/g, ' ');
    return `<${tag}${attrs}>${cleaned}</${tag}>`;
  });
}

let changed = 0;
for (const file of walk(ROOT)) {
  let html = fs.readFileSync(file, 'utf8');
  const m = html.match(/^([\s\S]*?<main\b[^>]*>)([\s\S]*?)(<\/main>[\s\S]*)$/i);
  if (!m) continue;
  let main = m[2];
  const before = main;
  main = demoteExtraPrimaries(main);
  main = capSectionLinks(main);
  if (main !== before) {
    fs.writeFileSync(file, m[1] + main + m[3], 'utf8');
    changed += 1;
  }
}

console.log(`Assembly caps enforced on ${changed} pages`);
