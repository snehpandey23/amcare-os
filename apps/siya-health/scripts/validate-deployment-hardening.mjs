/**
 * Deployment risk hardening CI gate — Tier 1 compliance checks.
 * Run: node scripts/validate-deployment-hardening.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PUBLISHED_LEGAL_DOCUMENTS } from '../data/legal-documents.mjs';
import {
  AVAILABLE_SERVICE_STATES,
  CANONICAL_ENTITY_STATEMENT,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_EFFECTIVE_DATE_DISPLAY,
} from '../data/site-standards.mjs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const errors = [];

function read(rel) {
  return fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
}

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'public') continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(rel, files);
    else if (e.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

// 1. Legal effective date
for (const doc of PUBLISHED_LEGAL_DOCUMENTS) {
  if (doc.effectiveDate !== LEGAL_EFFECTIVE_DATE) {
    errors.push(`Registry effectiveDate must be ${LEGAL_EFFECTIVE_DATE}: ${doc.slug}`);
  }
  const page = read(path.join('legal', doc.slug, 'index.html'));
  if (!page.includes(LEGAL_EFFECTIVE_DATE_DISPLAY)) {
    errors.push(`Legal page missing ${LEGAL_EFFECTIVE_DATE_DISPLAY}: /legal/${doc.slug}`);
  }
}
const hub = read('legal/index.html');
if (!hub.includes(LEGAL_EFFECTIVE_DATE_DISPLAY)) {
  errors.push(`Legal hub missing ${LEGAL_EFFECTIVE_DATE_DISPLAY}`);
}
for (const slug of ['terms-of-use', 'privacy-policy', 'notice-of-privacy-practices']) {
  const md = read(path.join('legal-document-versions', `${slug}.md`));
  if (md.includes('June 2, 2026')) {
    errors.push(`Source markdown still has June 2, 2026: ${slug}`);
  }
}

// 2. Canonical entity block on legal surfaces
for (const rel of ['legal/index.html', ...PUBLISHED_LEGAL_DOCUMENTS.map((d) => `legal/${d.slug}/index.html`)]) {
  const html = read(rel);
  if (!html.includes(CANONICAL_ENTITY_STATEMENT)) {
    errors.push(`Missing canonical entity statement: ${rel}`);
  }
}

// 3. Derek / Ohio service availability
const derekHtml = read('providers/derek-timbs.html');
const derekForbidden = [
  /Texas and Ohio adults/i,
  /telehealth in Texas and Ohio/i,
  /see adults in <strong>Texas and Ohio<\/strong>/i,
  /men's metabolic telehealth in Texas and Ohio/i,
];
for (const re of derekForbidden) {
  if (re.test(derekHtml)) {
    errors.push(`Derek profile service-implying Ohio pattern: ${re}`);
  }
}
const derekSchema = derekHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (derekSchema && /areaServed[\s\S]*"name":"Ohio"/.test(derekSchema[1])) {
  errors.push('Derek JSON-LD areaServed includes Ohio');
}
const hubHtml = read('providers/index.html');
if (/Texas and Ohio/i.test(hubHtml)) {
  errors.push('Provider hub teaser implies Texas and Ohio service');
}

const entityGraph = JSON.parse(read('data/entity-graph.json'));
const derekNode = entityGraph.providers?.find((p) => p.slug === 'derek-timbs');
if (derekNode?.serviceStates?.includes('Ohio')) {
  errors.push('entity-graph derek-timbs serviceStates must not include Ohio');
}

// 4. Psychiatry / telepsychiatry self-positioning (sitewide scan)
const psychPatterns = [/Psychiatry \/ ADHD/i, /Psychiatric depth for ADHD/i, /ADHD telepsychiatry/i, /thoughtful telepsychiatry/i];
for (const rel of ['llms.txt', 'about.html', ...walkHtml('blog').filter((f) => /adhd/i.test(f))]) {
  const html = read(rel);
  for (const re of psychPatterns) {
    if (re.test(html)) {
      errors.push(`Psychiatry/telepsychiatry self-positioning (${re}) in ${rel}`);
    }
  }
}

// 5. Derek llms line
const llms = read('llms.txt');
if (/Derek Timbs.*\(TX, OH\)/i.test(llms)) {
  errors.push('llms.txt Derek line implies OH service availability');
}

// 6. Published operational legal docs
for (const slug of ['controlled-substance-treatment-agreement', 'cookie-policy']) {
  if (!fs.existsSync(path.join(SITE_ROOT, 'legal', slug, 'index.html'))) {
    errors.push(`Missing published legal page: /legal/${slug}`);
  }
}

// 7. CS agreement compliance language
const csRel = 'legal/controlled-substance-treatment-agreement/index.html';
if (fs.existsSync(path.join(SITE_ROOT, csRel))) {
  const cs = read(csRel);
  if (/guarantee.*stimulant|stimulant.*guaranteed/i.test(cs) && !/does not guarantee|never guaranteed/i.test(cs)) {
    errors.push('CS agreement may imply stimulant guarantee');
  }
  if (/Ohio|New York/i.test(cs)) {
    errors.push('CS agreement must not list Ohio or New York as service states');
  }
}

// 8. Cookie policy + notice script on non-legal pages
let cookiePolicyLinked = 0;
let cookieNoticeScript = 0;
for (const rel of walkHtml('.')) {
  if (rel.startsWith('legal/')) continue;
  const html = read(rel);
  if (html.includes('cookie-notice.js')) cookieNoticeScript += 1;
  if (html.includes('/legal/cookie-policy')) cookiePolicyLinked += 1;
}
if (cookieNoticeScript < 10) {
  errors.push(`cookie-notice.js injected on too few pages (${cookieNoticeScript})`);
}

console.log('Deployment hardening validation');
console.log('Legal effective date required:', LEGAL_EFFECTIVE_DATE_DISPLAY);
console.log('Service states:', AVAILABLE_SERVICE_STATES.join(', '));

if (errors.length) {
  console.log('\nErrors:');
  errors.forEach((e) => console.log(' ', e));
  process.exit(1);
}
console.log('\nOK — deployment hardening checks passed.');
