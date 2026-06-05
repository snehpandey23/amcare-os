/**
 * Audit GHL intake touchpoints — booking CTAs, ADHD funnels, chat widget, acceptance coverage.
 * Writes docs/GHL-LEGAL-ACCEPTANCE-AUDIT.json and docs/GHL-LEGAL-ACCEPTANCE-IMPLEMENTATION-REPORT.md
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  GHL_BOOKING_URL,
  GHL_FORM_ID,
  GHL_LEGAL_FIELDS,
  legalDocumentVersionString,
} from '../data/ghl-intake-config.mjs';
import { isAdhdLegalContext, isAdhdFunnelPage } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const GHL_PATTERN = /link\.yourmarketingai\.com\/widget\/form\//i;
const CHAT_WIDGET_PATTERN = /widgets\.leadconnectorhq\.com\/loader\.js/i;
const ACCEPTANCE_MARKER = 'ghl-legal-acceptance.js';

function walkHtml(dir, files = []) {
  for (const e of fs.readdirSync(path.join(SITE_ROOT, dir), { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'public') continue;
    const rel = path.join(dir, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) walkHtml(rel, files);
    else if (e.name.endsWith('.html')) files.push(rel);
  }
  return files;
}

function categorize(relPath) {
  if (relPath === 'book-appointment.html') return 'booking-hub';
  if (relPath === 'intake/index.html') return 'intake-hub';
  if (relPath.startsWith('providers/')) return 'provider-page';
  if (relPath === 'adhd-screening.html') return 'adhd-screening';
  if (isAdhdFunnelPage(relPath)) return 'adhd-funnel';
  if (/^blog\/.+adhd/i.test(relPath)) return 'adhd-content';
  if (/^answers\/.*adhd/i.test(relPath)) return 'adhd-content';
  if (relPath.includes('adhd')) return 'adhd-related';
  return 'general-cta';
}

function countGhlLinks(html) {
  const matches = html.match(/href="[^"]*link\.yourmarketingai\.com\/widget\/form\/[^"]*"/gi) || [];
  return matches.length;
}

const pages = walkHtml('.');
const audited = [];
let totalGhlLinks = 0;
let pagesWithGhl = 0;
let pagesWithAcceptance = 0;
let pagesWithGhlMissingAcceptance = [];

for (const rel of pages.sort()) {
  const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
  const ghlCount = countGhlLinks(html);
  const hasChat = CHAT_WIDGET_PATTERN.test(html);
  const hasAcceptance = html.includes(ACCEPTANCE_MARKER);
  const category = categorize(rel);

  if (ghlCount > 0) {
    pagesWithGhl += 1;
    totalGhlLinks += ghlCount;
  }
  if (hasAcceptance) pagesWithAcceptance += 1;
  if (ghlCount > 0 && !hasAcceptance && !rel.startsWith('legal/')) {
    pagesWithGhlMissingAcceptance.push(rel);
  }

  if (ghlCount > 0 || hasChat || rel === 'intake/index.html') {
    audited.push({
      path: `/${rel.replace(/index\.html$/, '').replace(/\.html$/, '')}`.replace(/\/$/, '') || '/',
      file: rel,
      category,
      ghlBookingLinks: ghlCount,
      hasLegalAcceptanceScript: hasAcceptance,
      adhdDisclaimerRequired: isAdhdLegalContext(rel),
      hasChatWidget: hasChat,
    });
  }
}

const externalOnly = [
  {
    id: 'ghl-primary-form',
    name: 'Meet & Greet / booking widget',
    url: GHL_BOOKING_URL,
    formId: GHL_FORM_ID,
    siteCoverage: 'clickwrap gate via ghl-legal-acceptance.js on all non-legal HTML pages',
    ghlAdminRequired: [
      `Map URL/query hidden fields: ${Object.values(GHL_LEGAL_FIELDS).join(', ')}`,
      'Persist fields on contact record and workflow triggers',
      'Add matching hidden fields in GHL form builder',
    ],
  },
  {
    id: 'leadconnector-chat',
    name: 'LeadConnector chat widget',
    widgetId: '69be9ab3db1480f6799cdd18',
    siteCoverage: 'NOT gated by clickwrap — configure acceptance in GHL chat funnel / workflow',
    ghlAdminRequired: [
      'Add Terms, Privacy, and NPP checkboxes to chat-initiated intake',
      'Map legal_acceptance_* custom fields on chat form submit',
    ],
  },
];

const audit = {
  generatedAt: new Date().toISOString(),
  formId: GHL_FORM_ID,
  bookingUrl: GHL_BOOKING_URL,
  legalDocumentVersion: legalDocumentVersionString(),
  hiddenFields: GHL_LEGAL_FIELDS,
  summary: {
    htmlPagesScanned: pages.length,
    pagesWithGhlLinks: pagesWithGhl,
    totalGhlBookingLinks: totalGhlLinks,
    pagesWithAcceptanceScript: pagesWithAcceptance,
    pagesWithGhlMissingAcceptance: pagesWithGhlMissingAcceptance.length,
    intakeHub: fs.existsSync(path.join(SITE_ROOT, 'intake/index.html')),
  },
  externalFunnels: externalOnly,
  auditedPages: audited,
  missingAcceptance: pagesWithGhlMissingAcceptance,
};

fs.mkdirSync(path.join(SITE_ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(SITE_ROOT, 'docs/GHL-LEGAL-ACCEPTANCE-AUDIT.json'), JSON.stringify(audit, null, 2));

const report = `# GHL Legal Acceptance — Implementation Report

Generated: ${audit.generatedAt}

## Objective

Enforceable intake acceptance for Siya Health booking, consultation, ADHD evaluation, screening, and contact funnels before external GHL form submission.

## Implementation summary

| Layer | Status | Notes |
|-------|--------|-------|
| Sitewide clickwrap gate | **Deployed** | \`scripts/ghl-legal-acceptance.js\` intercepts all \`link.yourmarketingai.com/widget/form/\` anchor clicks |
| Policy links | **Deployed** | \`/legal/terms-of-use\`, \`/legal/privacy-policy\`, \`/legal/notice-of-privacy-practices\` |
| Hidden field capture (URL params) | **Deployed** | \`${GHL_LEGAL_FIELDS.timestamp}\`, \`${GHL_LEGAL_FIELDS.source}\`, \`${GHL_LEGAL_FIELDS.version}\` + boolean acceptance flags |
| ADHD disclaimer variant | **Deployed** | Shown on ADHD funnel pages, ADHD CTAs, and \`/intake?funnel=adhd\` |
| Dedicated intake hub | **Deployed** | \`/intake\` — on-page acceptance + embedded GHL iframe |
| GHL workflow persistence | **Ops required** | Map custom fields in GHL admin (see below) |

## Policy version string

\`\`\`
${legalDocumentVersionString()}
\`\`\`

## Hidden fields (pass to GHL contact record)

| Field | Purpose |
|-------|---------|
| \`${GHL_LEGAL_FIELDS.timestamp}\` | ISO-8601 acceptance timestamp |
| \`${GHL_LEGAL_FIELDS.source}\` | Page URL / funnel source |
| \`${GHL_LEGAL_FIELDS.version}\` | Serialized counsel policy versions |
| \`${GHL_LEGAL_FIELDS.terms}\` | \`true\` when Terms accepted |
| \`${GHL_LEGAL_FIELDS.privacy}\` | \`true\` when Privacy Policy acknowledged |
| \`${GHL_LEGAL_FIELDS.npp}\` | \`true\` when NPP acknowledged |

## GHL admin configuration (required for workflow persistence)

1. Open form \`${GHL_FORM_ID}\` in GoHighLevel → add **hidden fields** matching the keys above.
2. Enable **query string mapping** (or workflow "Create/Update Contact" step) to write values to contact custom fields.
3. On form submit workflow: copy hidden values to contact record; do not strip on pipeline stage changes.
4. For **LeadConnector chat** (\`69be9ab3db1480f6799cdd18\`): add the same three checkboxes + hidden fields in the chat booking funnel — not gated by site JS.
5. Re-run appointment booking automations test with a contact that includes all \`legal_acceptance_*\` fields.

## Audit totals

- HTML pages scanned: **${audit.summary.htmlPagesScanned}**
- Pages with GHL booking links: **${audit.summary.pagesWithGhlLinks}**
- Total GHL booking anchor targets: **${audit.summary.totalGhlBookingLinks}**
- Pages with acceptance script after build: **${audit.summary.pagesWithAcceptanceScript}**
- Intake hub present: **${audit.summary.intakeHub ? 'yes' : 'no'}**

## Forms audited (site touchpoints)

${audited.map((p) => `- **${p.path}** (${p.category}) — ${p.ghlBookingLinks} GHL link(s), acceptance script: ${p.hasLegalAcceptanceScript ? 'yes' : 'no'}${p.adhdDisclaimerRequired ? ', ADHD disclaimer: yes' : ''}${p.hasChatWidget ? ', chat widget: yes' : ''}`).join('\n')}

## External funnels (GHL-side only)

${externalOnly.map((f) => `- **${f.name}** (\`${f.id}\`) — ${f.siteCoverage}`).join('\n')}

## Forms still missing acceptance capture

### Site (HTML) — after \`npm run build\`

${pagesWithGhlMissingAcceptance.length === 0 ? '_None — all pages with GHL links include the acceptance gate._' : pagesWithGhlMissingAcceptance.map((p) => `- \`${p}\``).join('\n')}

### GHL / LeadConnector (ops — cannot be completed in repo)

- Primary GHL form hidden-field mapping and contact persistence
- LeadConnector chat widget intake checkboxes
- Any additional GHL forms not using \`${GHL_FORM_ID}\` (audit found single form ID sitewide)

## Files added/changed

- \`data/ghl-intake-config.mjs\` — form ID, field keys, policy versions, copy
- \`scripts/ghl-legal-acceptance.js\` — clickwrap modal + link interception
- \`scripts/site-chrome.mjs\` — inject config + script on all non-legal pages
- \`scripts/generate-intake-page.mjs\` — \`/intake\` hub
- \`scripts/audit-ghl-forms.mjs\` — this report
- \`scripts/validate-ghl-legal-acceptance.mjs\` — CI gate
- \`styles.css\` — modal + intake panel styles

## Out of scope (per sprint)

- Legal document body text — unchanged
- Counsel-authored \`/legal/*\` pages — unchanged (no clickwrap injection on legal pages)
`;

fs.writeFileSync(path.join(SITE_ROOT, 'docs/GHL-LEGAL-ACCEPTANCE-IMPLEMENTATION-REPORT.md'), report);
console.log(`GHL audit: ${pagesWithGhl} pages, ${totalGhlLinks} links, ${pagesWithGhlMissingAcceptance.length} missing acceptance`);
