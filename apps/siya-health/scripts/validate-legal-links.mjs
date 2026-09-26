/**
 * CI gate: legal URL consistency (Phase 1 — fail on violations).
 * Run: node scripts/validate-legal-links.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PUBLISHED_LEGAL_DOCUMENTS, LEGAL_HUB, LEGAL_SECTION_ANCHORS } from '../data/legal-documents.mjs';
import {
  CANONICAL_ENTITY_STATEMENT,
  LEGAL_EFFECTIVE_DATE_DISPLAY,
  LEGAL_LINKS,
} from '../data/site-standards.mjs';

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

const hubPath = path.join(SITE_ROOT, 'legal', 'index.html');
if (!fs.existsSync(hubPath)) {
  errors.push('Missing generated page: /legal');
}
for (const doc of PUBLISHED_LEGAL_DOCUMENTS) {
  const separate = path.join(SITE_ROOT, 'legal', doc.slug, 'index.html');
  if (!fs.existsSync(separate)) {
    errors.push(`Missing legal page: /legal/${doc.slug}`);
  }
}

if (LEGAL_LINKS.noticeOfPrivacy === LEGAL_LINKS.privacy) {
  errors.push('LEGAL_LINKS.noticeOfPrivacy must not equal LEGAL_LINKS.privacy');
}

const hubLegalPath = path.join(SITE_ROOT, 'legal', 'index.html');
let hubHtml = '';
if (fs.existsSync(hubLegalPath)) {
  hubHtml = fs.readFileSync(hubLegalPath, 'utf8');
  if (!hubHtml.includes(LEGAL_EFFECTIVE_DATE_DISPLAY)) {
    errors.push(`Legal page missing effective date ${LEGAL_EFFECTIVE_DATE_DISPLAY}: /legal`);
  }
  if (!hubHtml.includes(CANONICAL_ENTITY_STATEMENT)) {
    errors.push('Legal page missing canonical entity statement: /legal');
  }
  if (!hubHtml.includes('id="entity-structure"')) {
    errors.push('Legal page missing #entity-structure');
  }
  for (const doc of PUBLISHED_LEGAL_DOCUMENTS) {
    const anchor = LEGAL_SECTION_ANCHORS[doc.slug];
    if (!hubHtml.includes(`id="${anchor}"`)) {
      errors.push(`Legal page missing section #${anchor} (${doc.title})`);
    }
  }
}

const htmlFiles = walkHtml('.');
const separatePolicyHrefs = PUBLISHED_LEGAL_DOCUMENTS.map((d) => `/legal/${d.slug}`);

for (const rel of htmlFiles) {
  const base = path.basename(rel);
  if (/^preview-home/i.test(base) || rel.startsWith('previews/') || rel.includes('/previews/')) continue;
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

  // Sitewide pages with footer must include standard policy links
  if (html.includes('<footer')) {
    const footer = extractFooter(html);
    const isPolicyCol =
      footer.includes('<h4>Policies</h4>') || footer.includes('<h4>Legal</h4>');
    if (isPolicyCol) {
      if (!footer.includes('href="/legal"') && !footer.includes('href="/legal#terms"')) {
        errors.push(`Missing single Legal footer link: ${rel}`);
      }
      for (const href of separatePolicyHrefs) {
        if (footer.includes(`href="${href}"`)) {
          errors.push(`Footer still lists separate policy ${href}: ${rel}`);
        }
      }
    }
    if (footer.includes('siya-h2-footer') || footer.includes('id="siya-h2-footer"')) {
      if (footer.includes('/terms2') || footer.includes('/privacy2')) {
        errors.push(`Compact footer still lists Terms/Privacy separately: ${rel}`);
      }
    }
  }
}

if (hubHtml) {
  if (/states the providers are licensed/i.test(hubHtml)) {
    errors.push('CS agreement contains forbidden provider-license service expansion phrase');
  }
  if (/Pennsylvania Prescription Drug Monitoring Program \(PA-PDMP\) monthly/i.test(hubHtml)) {
    errors.push('CS agreement hardcodes PA-PDMP only — use multi-state PDMP language');
  }
  if (!hubHtml.includes('does not guarantee diagnosis, medication, or stimulant prescribing')) {
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
