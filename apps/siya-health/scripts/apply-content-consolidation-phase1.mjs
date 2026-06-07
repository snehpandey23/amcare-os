/**
 * Content Consolidation Phase 1 — delete retired pages, rewrite internal links in HTML.
 * Run once after seed/data updates: node scripts/apply-content-consolidation-phase1.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PHASE1_REDIRECTS,
  RETIRED_BLOG_SLUGS,
  RETIRED_GUIDE_SLUGS,
} from '../data/content-consolidation-phase1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const SKIP_DIRS = new Set(['public', 'node_modules', 'scripts', 'data', 'docs']);

const stats = {
  filesDeleted: [],
  linksUpdated: 0,
  filesTouched: new Set(),
};

function walkHtml(dir, baseRel = '') {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(ent.name)) continue;
    const rel = path.join(baseRel, ent.name).replace(/\\/g, '/');
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkHtml(full, rel));
    else if (ent.name.endsWith('.html')) out.push({ rel, full });
  }
  return out;
}

function deleteRetiredPages() {
  for (const slug of RETIRED_GUIDE_SLUGS) {
    const rel = `answers/${slug}.html`;
    const full = path.join(SITE_ROOT, rel);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      stats.filesDeleted.push(`/answers/${slug}`);
    }
  }
  for (const slug of RETIRED_BLOG_SLUGS) {
    const rel = `blog/${slug}.html`;
    const full = path.join(SITE_ROOT, rel);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      stats.filesDeleted.push(`/blog/${slug}`);
    }
  }
}

function replaceLinksInHtml(text) {
  let updated = text;
  let count = 0;
  // Sort by source length descending to avoid partial replacements
  const entries = Object.entries(PHASE1_REDIRECTS).sort((a, b) => b[0].length - a[0].length);
  for (const [source, target] of entries) {
    if (source === target) continue;
    const patterns = [
      new RegExp(`(href=")${source.replace(/\//g, '\\/')}(")`, 'g'),
      new RegExp(`(href=')${source.replace(/\//g, '\\/')}(')`, 'g'),
    ];
    for (const re of patterns) {
      const matches = updated.match(re);
      if (matches) {
        count += matches.length;
        updated = updated.replace(re, `$1${target}$2`);
      }
    }
    const fullSrc = `https://siya.health${source}`;
    const fullTgt = `https://siya.health${target}`;
    const fullRe = new RegExp(`(href=")${fullSrc.replace(/\//g, '\\/')}(")`, 'g');
    const fullMatches = updated.match(fullRe);
    if (fullMatches) {
      count += fullMatches.length;
      updated = updated.replace(fullRe, `$1${fullTgt}$2`);
    }
  }
  return { text: updated, count };
}

function updateInternalLinks() {
  for (const { rel, full } of walkHtml(SITE_ROOT)) {
    const raw = fs.readFileSync(full, 'utf8');
    const { text, count } = replaceLinksInHtml(raw);
    if (count > 0 && text !== raw) {
      fs.writeFileSync(full, text, 'utf8');
      stats.linksUpdated += count;
      stats.filesTouched.add(rel);
    }
  }
}

function removeReciprocalGuideBlocks() {
  const blogTargets = [
    'non-stimulant-adhd-medications-explained',
    'tirzepatide-vs-semaglutide-which-is-better',
    'minoxidil-for-hair-loss-does-it-work',
    'sildenafil-for-erectile-dysfunction-what-to-expect',
    'phentermine-for-weight-loss-safety-and-effectiveness',
    'oral-vs-injectable-weight-loss-medications',
  ];
  for (const slug of blogTargets) {
    const full = path.join(SITE_ROOT, 'blog', `${slug}.html`);
    if (!fs.existsSync(full)) continue;
    let html = fs.readFileSync(full, 'utf8');
    const retiredGuides = [...RETIRED_GUIDE_SLUGS].map((g) => `/answers/${g}`);
    let changed = false;
    for (const g of retiredGuides) {
      if (html.includes(g)) {
        html = html.replace(
          new RegExp(`<li[^>]*>\\s*<a href="${g.replace(/\//g, '\\/')}"[^>]*>[^<]*</a>\\s*</li>\\s*`, 'g'),
          '',
        );
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(full, html, 'utf8');
      stats.filesTouched.add(`blog/${slug}.html`);
    }
  }
}

function main() {
  deleteRetiredPages();
  updateInternalLinks();
  removeReciprocalGuideBlocks();

  const reportPath = path.join(SITE_ROOT, 'data', 'content-consolidation-phase1-result.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        executedAt: new Date().toISOString(),
        redirects: PHASE1_REDIRECTS,
        filesDeleted: stats.filesDeleted,
        linksUpdated: stats.linksUpdated,
        filesTouched: [...stats.filesTouched].sort(),
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log('Content consolidation phase 1 applied.');
  console.log('  Deleted:', stats.filesDeleted.length, 'pages');
  console.log('  Link replacements:', stats.linksUpdated);
  console.log('  Files touched:', stats.filesTouched.size);
}

main();
