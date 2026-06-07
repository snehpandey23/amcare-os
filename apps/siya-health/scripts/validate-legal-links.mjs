/**
 * CI gate: legal URL consistency (Phase 1 — fail on violations).
 * Run: node scripts/validate-legal-links.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PUBLISHED_LEGAL_DOCUMENTS, LEGAL_HUB } from '../data/legal-documents.mjs';
import {
  CANONICAL_ENTITY_STATEMENT,
  LEGAL_EFFECTIVE_DATE_DISPLAY,
  LEGAL_LINKS,
} from '../data/site-standards.mjs';
import { isControlledSubstanceLinkPage } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'public') continue;
    const rel = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(rel, files);
    else if (e.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

function extractFooter(html) {
  const m = html.match(/<footer[\s\S]*?<\/footer>/i);
  return m ? m[0] : '';
}

/** NPP label must not point at the Privacy Policy URL (same anchor only). */
function hasFalseNppLink(html) {
  for (const m of html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = m[1];
    const inner = m[2];
    if (!/Notice of Privacy Practices/i.test(inner)) continue;
    if (href === '/privacy-policy' || href === '/legal/privacy-policy') return true;
  }
  return false;
}

const errors = [];
const warnings = [];

// Registry paths must exist after generate-legal-pages
for (const doc of PUBLISHED_LEGAL_DOCUMENTS) {
  const p = path.join(SITE_ROOT, 'legal', doc.slug, 'index.html');
  if (!fs.existsSync(p)) {
    errors.push(`Missing generated page: /legal/${doc.slug}`);
  }
}
const hubPath = path.join(SITE_ROOT, 'legal', 'index.html');
if (!fs.existsSync(hubPath)) {
  errors.push('Missing generated page: /legal');
}

if (LEGAL_LINKS.noticeOfPrivacy === LEGAL_LINKS.privacy) {
  errors.push('LEGAL_LINKS.noticeOfPrivacy must not equal LEGAL_LINKS.privacy');
}

for (const doc of PUBLISHED_LEGAL_DOCUMENTS) {
  const pagePath = path.join(SITE_ROOT, 'legal', doc.slug, 'index.html');
  if (!fs.existsSync(pagePath)) continue;
  const legalHtml = fs.readFileSync(pagePath, 'utf8');
  if (!legalHtml.includes(LEGAL_EFFECTIVE_DATE_DISPLAY)) {
    errors.push(`Legal page missing effective date ${LEGAL_EFFECTIVE_DATE_DISPLAY}: /legal/${doc.slug}`);
  }
  if (!legalHtml.includes(CANONICAL_ENTITY_STATEMENT)) {
    errors.push(`Legal page missing canonical entity statement: /legal/${doc.slug}`);
  }
}
const hubLegalPath = path.join(SITE_ROOT, 'legal', 'index.html');
if (fs.existsSync(hubLegalPath)) {
  const hubHtml = fs.readFileSync(hubLegalPath, 'utf8');
  if (!hubHtml.includes(CANONICAL_ENTITY_STATEMENT)) {
    errors.push('Legal hub missing canonical entity statement');
  }
}

const htmlFiles = walkHtml('.');
const requiredFooterHrefs = [
  LEGAL_LINKS.hub,
  LEGAL_LINKS.terms,
  LEGAL_LINKS.privacy,
  LEGAL_LINKS.noticeOfPrivacy,
  LEGAL_LINKS.cookie,
];

for (const rel of htmlFiles) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');

  if (hasFalseNppLink(html)) {
    errors.push(`False NPP→privacy URL: ${rel}`);
  }

  // Discourage legacy /terms and /privacy-policy in footers — canonical legal paths preferred
  if (!rel.startsWith('legal/') && html.includes('<footer')) {
    const footer = extractFooter(html);
    if (footer.includes('href="/terms"') && !rel.endsWith('terms.html')) {
      warnings.push(`Footer still links to legacy /terms (use ${LEGAL_LINKS.terms}): ${rel}`);
    }
    if (footer.includes('href="/privacy-policy"') && !rel.endsWith('privacy-policy.html')) {
      warnings.push(`Footer still links to legacy /privacy-policy (use ${LEGAL_LINKS.privacy}): ${rel}`);
    }
  }

  // Sitewide pages with footer must include standard legal links
  if (html.includes('<footer')) {
    const footer = extractFooter(html);
    if (footer.includes('<h4>Legal</h4>')) {
      for (const href of requiredFooterHrefs) {
        if (!footer.includes(`href="${href}"`)) {
          errors.push(`Missing legal footer link ${href}: ${rel}`);
        }
      }
      if (isControlledSubstanceLinkPage(rel) && !footer.includes(LEGAL_LINKS.controlledSubstanceTreatment)) {
        errors.push(`Missing Controlled Substance Treatment Agreement link: ${rel}`);
      }
    }
  }
}

// Legal hub must list published cookie + CS agreement
const hubHtml = fs.readFileSync(hubPath, 'utf8');
if (!hubHtml.includes('/legal/cookie-policy')) {
  errors.push('Legal hub missing Cookie Policy link');
}
if (!hubHtml.includes('/legal/controlled-substance-treatment-agreement')) {
  errors.push('Legal hub missing Controlled Substance Treatment Agreement link');
}

const csPage = path.join(SITE_ROOT, 'legal/controlled-substance-treatment-agreement/index.html');
if (fs.existsSync(csPage)) {
  const csHtml = fs.readFileSync(csPage, 'utf8');
  if (/states the providers are licensed/i.test(csHtml)) {
    errors.push('CS agreement contains forbidden provider-license service expansion phrase');
  }
  if (/Pennsylvania Prescription Drug Monitoring Program \(PA-PDMP\) monthly/i.test(csHtml)) {
    errors.push('CS agreement hardcodes PA-PDMP only — use multi-state PDMP language');
  }
  if (!csHtml.includes('does not guarantee diagnosis, medication, or stimulant prescribing')) {
    errors.push('CS agreement missing non-guarantee header note');
  }
}

console.log('Legal link validation');
console.log('Hub:', LEGAL_HUB.path);
console.log('Published documents:', PUBLISHED_LEGAL_DOCUMENTS.length);
console.log('HTML files scanned:', htmlFiles.length);

if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach((w) => console.log(' ', w));
}
if (errors.length) {
  console.log('\nErrors:');
  errors.forEach((e) => console.log(' ', e));
  process.exit(1);
}
console.log('\nOK — all legal link checks passed.');
