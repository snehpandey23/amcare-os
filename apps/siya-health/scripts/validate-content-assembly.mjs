#!/usr/bin/env node
/**
 * Content Assembly success-metric validator.
 *
 * Metrics (must all pass):
 * 1. <5 duplicate paragraph groups (excl. intentional boilerplate)
 * 2. Zero irrelevant geography on educational pages
 * 3. No section with >8 contextual links
 * 4. ≤1 primary CTA per page (main content)
 * 5. Every educational answer has a unique context-aware closing
 * 6. Editorial fingerprint ≥9/10 on core answers + service pages
 *
 * Usage: node scripts/validate-content-assembly.mjs
 * Exit 1 on failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ASSEMBLY,
  INTENTIONAL_BOILERPLATE,
  editorialFingerprint,
  isGeoLandingPath,
  countPrimaryCtas,
  countIrrelevantGeography,
} from './content-assembly.mjs';

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

function rel(p) {
  return path.relative(ROOT, p);
}

function mainHtml(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isIntentional(text) {
  return INTENTIONAL_BOILERPLATE.some((re) => re.test(text));
}

function isEducational(relPath) {
  if (isGeoLandingPath(relPath)) return false;
  return relPath.startsWith('answers/') || (relPath.startsWith('blog/') && !/adhd-treatment-|diagnosis-/.test(relPath));
}

const files = walk(ROOT);
const failures = [];
const paragraphMap = new Map();
let geoBleed = 0;
let overlinkSections = 0;
let multiPrimary = 0;
let missingClosing = 0;
const fingerprints = [];

for (const file of files) {
  const relPath = rel(file);
  const html = fs.readFileSync(file, 'utf8');
  // Retired / noindex stubs (EG-P0-01 / geo clones) are out of assembly scope
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
  const body = mainHtml(html);

  // Duplicate paragraphs
  for (const p of body.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || []) {
    const text = stripTags(p);
    if (text.length < 60 || isIntentional(text)) continue;
    const key = text.toLowerCase();
    if (!paragraphMap.has(key)) paragraphMap.set(key, []);
    paragraphMap.get(key).push(relPath);
  }

  // Irrelevant geography — use Governance v1.0 assembly definition (not raw state-name counts)
  if (isEducational(relPath) && !relPath.endsWith('index.html') && !relPath.endsWith('adhd.html')) {
    if (countIrrelevantGeography(body) > 0) {
      geoBleed += 1;
      failures.push(`GEO ${relPath}`);
    }
  }

  // Link caps per section
  for (const sec of body.match(/<(?:section|aside)\b[^>]*>[\s\S]*?<\/(?:section|aside)>/gi) || []) {
    const links = (sec.match(/<a\b/gi) || []).length;
    if (links > ASSEMBLY.maxLinksPerSection) {
      overlinkSections += 1;
      failures.push(`OVERLINK(${links}) ${relPath}`);
      break;
    }
  }

  // Primary CTA cap (main only)
  const primary = countPrimaryCtas(body);
  if (primary > ASSEMBLY.maxPrimaryCtas) {
    multiPrimary += 1;
    failures.push(`PRIMARY(${primary}) ${relPath}`);
  }

  // Context closing on answers
  if (relPath.startsWith('answers/') && relPath !== 'answers/index.html') {
    if (!/data-assembly="context-closing"|class="answer-closing"/i.test(body)) {
      missingClosing += 1;
      failures.push(`NO-CLOSING ${relPath}`);
    }
  }

  // Fingerprint core content
  if (
    relPath.startsWith('answers/') ||
    ['adhd-care.html', 'adult-adhd-california.html', 'telehealth.html', 'weight-loss-metabolic-health.html', 'primary-urgent-care.html'].includes(relPath)
  ) {
    const topic =
      /adhd/.test(relPath) ? 'adhd' : /weight|glp|insulin|food-noise/.test(relPath) ? 'weight-loss' : /testosterone|trt|mens/.test(relPath) ? 'mens-health' : 'telehealth';
    const score = editorialFingerprint(body, { relPath, topic, slug: path.basename(relPath, '.html') });
    fingerprints.push({ relPath, score });
    if (score < ASSEMBLY.minEditorialFingerprint) {
      failures.push(`FINGERPRINT(${score}) ${relPath}`);
    }
  }
}

const dupGroups = [...paragraphMap.entries()]
  .filter(([, pages]) => new Set(pages).size >= 4)
  .sort((a, b) => new Set(b[1]).size - new Set(a[1]).size);

const avgFp =
  fingerprints.length === 0 ? 0 : fingerprints.reduce((s, f) => s + f.score, 0) / fingerprints.length;
const minFp = fingerprints.length === 0 ? 0 : Math.min(...fingerprints.map((f) => f.score));

const report = {
  date: new Date().toISOString().slice(0, 10),
  pages: files.length,
  metrics: {
    duplicateParagraphGroups: dupGroups.length,
    duplicateLimit: ASSEMBLY.maxDuplicateParagraphGroups,
    irrelevantGeographyPages: geoBleed,
    sectionsOver8Links: overlinkSections,
    pagesWithMultiplePrimaryCtas: multiPrimary,
    educationalPagesMissingClosing: missingClosing,
    editorialFingerprintAvg: Number(avgFp.toFixed(2)),
    editorialFingerprintMin: minFp,
    fingerprintFloor: ASSEMBLY.minEditorialFingerprint,
  },
  topDuplicates: dupGroups.slice(0, 10).map(([text, pages]) => ({
    pages: [...new Set(pages)].length,
    sample: text.slice(0, 100),
    examples: [...new Set(pages)].slice(0, 4),
  })),
  failures: failures.slice(0, 40),
};

const pass =
  dupGroups.length < ASSEMBLY.maxDuplicateParagraphGroups &&
  geoBleed === 0 &&
  overlinkSections === 0 &&
  multiPrimary === 0 &&
  missingClosing === 0 &&
  minFp >= ASSEMBLY.minEditorialFingerprint;

report.pass = pass;

const outPath = path.join(ROOT, 'docs', 'CONTENT-ASSEMBLY-VALIDATION.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');

console.log(JSON.stringify(report.metrics, null, 2));
console.log(pass ? '\nPASS — content assembly metrics met' : '\nFAIL — see docs/CONTENT-ASSEMBLY-VALIDATION.json');
if (!pass) {
  console.log('Sample failures:', failures.slice(0, 15));
  if (dupGroups.length) {
    console.log('Top duplicate groups:');
    for (const d of report.topDuplicates.slice(0, 5)) {
      console.log(`  ${d.pages} pages — ${d.sample}…`);
    }
  }
}
process.exit(pass ? 0 : 1);
