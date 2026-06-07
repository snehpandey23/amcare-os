/**
 * CI gate — legal acceptance script present on intake hub only (CarePatron direct booking elsewhere).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SIYA_CIRCLE_GHL_FORM_ID } from '../data/siya-circle-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const errors = [];

function read(rel) {
  return fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
}

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'public') continue;
    const rel = path.join(dir, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) walkHtml(rel, files);
    else if (e.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

const requiredFiles = [
  'scripts/ghl-legal-acceptance.js',
  'data/ghl-intake-config.mjs',
  'intake/index.html',
  'docs/GHL-LEGAL-ACCEPTANCE-IMPLEMENTATION-REPORT.md',
];

for (const f of requiredFiles) {
  if (!fs.existsSync(path.join(SITE_ROOT, f))) errors.push(`Missing required file: ${f}`);
}

const gateJs = read('scripts/ghl-legal-acceptance.js');
for (const field of [
  'legal_acceptance_timestamp',
  'legal_acceptance_source',
  'legal_document_version',
]) {
  if (!gateJs.includes(field)) errors.push(`ghl-legal-acceptance.js missing field: ${field}`);
}

const ghlBookingHrefPattern = /href="[^"]*link\.yourmarketingai\.com\/widget\/form\//i;
const siyaCircleFormHrefPattern = new RegExp(
  `href="[^"]*link\\.yourmarketingai\\.com/widget/form/${SIYA_CIRCLE_GHL_FORM_ID}[^"]*"`,
  'gi',
);

function htmlWithoutSiyaCircleSignupLinks(html) {
  return html.replace(siyaCircleFormHrefPattern, '');
}

for (const rel of walkHtml('.')) {
  if (rel.startsWith('legal/')) continue;
  const html = read(rel);
  if (!ghlBookingHrefPattern.test(htmlWithoutSiyaCircleSignupLinks(html))) continue;
  errors.push(`Legacy GHL booking CTA still present: ${rel}`);
}

const intake = read('intake/index.html');
if (!intake.includes('ghl-legal-acceptance.js')) {
  errors.push('intake/index.html missing ghl-legal-acceptance.js');
}
if (!intake.includes('SIYA_GHL_INTAKE')) {
  errors.push('intake/index.html missing SIYA_GHL_INTAKE config');
}
for (const slug of ['terms-of-use', 'privacy-policy', 'notice-of-privacy-practices']) {
  if (!intake.includes(`/legal/${slug}`)) errors.push(`intake page missing link: /legal/${slug}`);
}

if (errors.length) {
  console.error('GHL legal acceptance validation FAILED:\n' + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log('GHL legal acceptance validation OK');
