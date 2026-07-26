#!/usr/bin/env node
/**
 * Content Cohesion Audit — detects template bleed across the site.
 *
 * Flags, per page:
 *  - State directory / geography bleed on educational (guide/blog) pages
 *  - Repeated consecutive horizontal separators (<hr><hr>)
 *  - Duplicate paragraphs shared across many pages (template bleed)
 *  - Clinical-care CTA blocks with > 3 contextual links
 *
 * Usage: node scripts/content-cohesion-audit.mjs
 * Writes: docs/CONTENT-COHESION-AUDIT.md
 *
 * Non-technical, editorial audit. Run monthly. See docs/CONTENT-ASSEMBLY-SYSTEM.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'scripts', 'data', 'docs', 'brand', '.git', 'assets']);

const GEO_TERMS = /(Texas|Florida|Pennsylvania|Houston|Austin|Philadelphia|Sacramento|Oakland|San Diego|San Jose)/g;
const STATE_DIRECTORY = /<strong>\s*(Texas|Florida|Pennsylvania)\s*:\s*<\/strong>/i;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), out);
    } else if (entry.name.endsWith('.html')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

function rel(p) {
  return path.relative(SITE_ROOT, p);
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function classify(relPath) {
  if (relPath.startsWith('answers/') && relPath !== 'answers/index.html') return 'guide';
  if (relPath.startsWith('blog/') && relPath !== 'blog/index.html') return 'blog';
  if (/(diagnosis|treatment)-(texas|florida|pennsylvania|california|austin|houston|philadelphia)/.test(relPath)) return 'geo-lp';
  if (relPath.includes('california')) return 'geo-lp';
  return 'other';
}

function mainContent(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

const files = walk(SITE_ROOT);
const findings = [];
const paragraphMap = new Map(); // normalized paragraph -> [pages]

for (const file of files) {
  const relPath = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  const type = classify(relPath);
  const body = mainContent(html);
  const page = { relPath, type, issues: [] };

  // 1. Geography bleed on educational pages (guide/blog, non-geo)
  if (type === 'guide' || type === 'blog') {
    if (STATE_DIRECTORY.test(body)) {
      page.issues.push('STATE-DIRECTORY: multi-state link directory on an educational page (breaks reading flow)');
    } else {
      const geoHits = (body.match(GEO_TERMS) || []).length;
      // one footer/tagline mention is fine; 3+ in <main> body signals bleed
      if (geoHits >= 3) {
        page.issues.push(`GEO-BLEED: ${geoHits} state/metro mentions in main content`);
      }
    }
  }

  // 2. Repeated consecutive separators
  if (/<hr[^>]*>\s*<hr[^>]*>/i.test(html)) {
    page.issues.push('DOUBLE-SEPARATOR: consecutive <hr> rules');
  }

  // 3. Clinical-care CTA with > 3 contextual links
  const ctaBlocks = html.match(/<!-- SIYA:[A-Z-]*CARE-PATHWAYS[^>]*-->[\s\S]*?<!-- \/SIYA:[A-Z-]*CARE-PATHWAYS[^>]*-->/g) || [];
  for (const block of ctaBlocks) {
    const links = (block.match(/<a\s/g) || []).length;
    if (links > 4) {
      page.issues.push(`CTA-OVERLINK: care-pathways block has ${links} links (max 3 contextual + 1 button)`);
    }
  }

  // 4. Collect paragraphs for duplicate detection (main content only)
  const paras = body.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  for (const p of paras) {
    const text = stripTags(p);
    if (text.length < 60) continue; // ignore short/nav paragraphs
    const key = text.toLowerCase();
    if (!paragraphMap.has(key)) paragraphMap.set(key, []);
    paragraphMap.get(key).push(relPath);
  }

  if (page.issues.length) findings.push(page);
}

// Duplicate paragraphs across many pages (exclude 2 — some overlap is fine)
const dupParas = [...paragraphMap.entries()]
  .filter(([, pages]) => new Set(pages).size >= 4)
  .sort((a, b) => new Set(b[1]).size - new Set(a[1]).size)
  .slice(0, 25);

// Report
const lines = [];
lines.push('# Content Cohesion Audit');
lines.push('');
lines.push(`**Date:** ${new Date().toISOString().slice(0, 10)}  `);
lines.push(`**Pages scanned:** ${files.length}  `);
lines.push('**Rule:** Every page earns every section — see `CONTENT-ASSEMBLY-SYSTEM.md`.');
lines.push('');
lines.push('## Scorecard');
lines.push('');
lines.push('| Check | Pages flagged |');
lines.push('|-------|--------------:|');
const count = (kind) => findings.filter((f) => f.issues.some((i) => i.startsWith(kind))).length;
lines.push(`| State directory on educational pages | ${count('STATE-DIRECTORY')} |`);
lines.push(`| Geography bleed (3+ state mentions) | ${count('GEO-BLEED')} |`);
lines.push(`| Double separators | ${count('DOUBLE-SEPARATOR')} |`);
lines.push(`| CTA over-linking | ${count('CTA-OVERLINK')} |`);
lines.push(`| Duplicate paragraphs (≥4 pages) | ${dupParas.length} groups |`);
lines.push('');

lines.push('## Page-level findings');
lines.push('');
if (!findings.length) {
  lines.push('_No template-bleed issues detected._');
} else {
  for (const f of findings.sort((a, b) => b.issues.length - a.issues.length)) {
    lines.push(`### \`${f.relPath}\` (${f.type})`);
    for (const i of f.issues) lines.push(`- ${i}`);
    lines.push('');
  }
}

lines.push('## Duplicate paragraphs across ≥4 pages');
lines.push('');
if (!dupParas.length) {
  lines.push('_None._');
} else {
  for (const [text, pages] of dupParas) {
    const uniq = [...new Set(pages)];
    lines.push(`- **${uniq.length} pages** — "${text.slice(0, 90)}…"`);
    lines.push(`  - e.g. ${uniq.slice(0, 4).map((p) => `\`${p}\``).join(', ')}`);
  }
}
lines.push('');

const outPath = path.join(SITE_ROOT, 'docs', 'CONTENT-COHESION-AUDIT.md');
fs.writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');

const totalIssues = findings.reduce((n, f) => n + f.issues.length, 0);
console.log(`Content Cohesion Audit: ${findings.length} pages flagged, ${totalIssues} issues, ${dupParas.length} duplicate-paragraph groups`);
console.log('Wrote', rel(outPath));
