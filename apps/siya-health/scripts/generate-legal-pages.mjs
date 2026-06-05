/**
 * Generates /legal/* pages from counsel markdown in legal-document-versions/.
 * Phase 2: publishes only PUBLISHED_LEGAL_DOCUMENTS (three-document stack).
 *
 * Run: node scripts/generate-legal-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  AVAILABLE_SERVICE_STATES,
  CANONICAL_ENTITY_STATEMENT,
  FOOTER_STATES_LINE,
  LEGAL_LINKS,
  PROVIDER_LICENSE_DISCLAIMER,
  STATES_INLINE,
} from '../data/site-standards.mjs';
import {
  PUBLISHED_LEGAL_DOCUMENTS,
  LEGAL_HUB,
  LEGAL_DOC_STATUS,
} from '../data/legal-documents.mjs';
import { renderLegalFooter } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const LEGAL_DIR = path.join(SITE_ROOT, 'legal');
const VERSIONS_DIR = path.join(SITE_ROOT, 'legal-document-versions');
const BASE = 'https://siya.health';

const REMOVED_PLANNED_SLUGS = [
  'telehealth-consent',
  'controlled-substance-policy',
  'prescription-policy',
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inlineMarkdown(text) {
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(escapeHtml(text.slice(last, m.index)));
    if (m[1] !== undefined) {
      parts.push(`<a href="${escapeHtml(m[2])}">${escapeHtml(m[1])}</a>`);
    } else if (m[3] !== undefined) {
      parts.push(`<strong>${escapeHtml(m[3])}</strong>`);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(escapeHtml(text.slice(last)));
  return parts.join('');
}

/** Counsel markdown → HTML (headings, paragraphs, lists, inline links/bold) */
function markdownToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let inList = false;

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      continue;
    }
    if (t.startsWith('### ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h3>${inlineMarkdown(t.slice(4))}</h3>`);
    } else if (t.startsWith('## ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h2>${inlineMarkdown(t.slice(3))}</h2>`);
    } else if (t.startsWith('# ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      // Page h1 rendered in header — skip duplicate top-level counsel title
      if (out.length === 0) continue;
      out.push(`<h1>${inlineMarkdown(t.slice(2))}</h1>`);
    } else if (t.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(t.slice(2))}</li>`);
    } else {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<p>${inlineMarkdown(t)}</p>`);
    }
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

function loadBody(doc) {
  const srcPath = path.join(SITE_ROOT, doc.sourceFile);
  if (!fs.existsSync(srcPath)) {
    throw new Error(`Missing counsel source for published document: ${doc.sourceFile}`);
  }
  let raw = fs.readFileSync(srcPath, 'utf8');
  raw = raw
    .replace(
      /^# (?:Terms of Use|Privacy Policy|Notice of Privacy Practices|Controlled Substance Treatment Agreement|Cookie Policy)\n\n/m,
      '',
    )
    .replace(/^## Effective Date:.*\n\n/m, '')
    .replace(/^\*\*Effective:.*\*\*\n\n/m, '');
  if (doc.status !== LEGAL_DOC_STATUS.PUBLISHED) {
    return {
      html: `<div class="legal-stub" data-legal-status="${doc.status}">
        <p><strong>Publication pending.</strong></p>
      </div>`,
      fromSource: false,
    };
  }
  return { html: markdownToHtml(raw), fromSource: true };
}

function formatEffectiveDate(iso) {
  if (!iso) return 'Pending';
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

function relatedLinks(doc) {
  return doc.relatedSlugs
    .map((slug) => {
      const related = PUBLISHED_LEGAL_DOCUMENTS.find((d) => d.slug === slug);
      if (!related) return '';
      return `<li><a href="/legal/${related.slug}">${escapeHtml(related.title)}</a></li>`;
    })
    .filter(Boolean)
    .join('\n');
}

function renderPage({ title, description, canonicalPath, mainHtml, isHub = false }) {
  const canonical = `${BASE}${canonicalPath}`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${escapeHtml(title)} | Siya Health</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body class="legal-page">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header site-header--legal">
      <div class="container">
        <a class="header-logo" href="/"><img src="/assets/images/siya-health-logo.png" alt="Siya Health" /></a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="${LEGAL_LINKS.hub}"${isHub ? ' aria-current="page"' : ''}>Legal</a>
          <a href="/about">About</a>
        </nav>
      </div>
    </header>
    <main id="main" class="legal-document-main">
      <div class="container legal-document-container">
        ${isHub ? '' : `<nav class="legal-breadcrumb" aria-label="Breadcrumb"><a href="${LEGAL_LINKS.hub}">Legal</a> <span aria-hidden="true">/</span> <span>${escapeHtml(title)}</span></nav>`}
        <article class="legal-document-body">
          ${mainHtml}
        </article>
        <aside class="legal-meta" aria-label="Entity and service availability">
          <p class="legal-entity-statement">${escapeHtml(CANONICAL_ENTITY_STATEMENT)}</p>
          <p class="legal-service-states"><strong>Organizational service availability:</strong> ${escapeHtml(STATES_INLINE)}.</p>
          <p class="legal-provider-license-note">${escapeHtml(PROVIDER_LICENSE_DISCLAIMER)}</p>
        </aside>
      </div>
    </main>
    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-brand"><p>${escapeHtml(FOOTER_STATES_LINE)}</p></div>
        ${renderLegalFooter()}
      </div>
      <div class="container">
        <p class="footer-notice">For emergencies, call 911. All telehealth services are provided by licensed medical professionals in accordance with state regulations.</p>
        <small>© 2026 Siya Health Inc. All rights reserved.</small>
      </div>
    </footer>
  </body>
</html>`;
}

function generateHub() {
  const rows = PUBLISHED_LEGAL_DOCUMENTS.map((d) => {
    const eff = formatEffectiveDate(d.effectiveDate);
    return `<tr>
      <td><a href="/legal/${d.slug}">${escapeHtml(d.title)}</a></td>
      <td>${eff}</td>
    </tr>`;
  }).join('\n');

  const main = `
    <header class="legal-document-header">
      <h1>${escapeHtml(LEGAL_HUB.title)}</h1>
      <p class="legal-document-lead">Policies governing use of siya.health and Siya Healthcare, PLLC telehealth services.</p>
    </header>
    <section>
      <h2>Entity structure</h2>
      <p>${escapeHtml(CANONICAL_ENTITY_STATEMENT)}</p>
    </section>
    <section>
      <h2>Organizational service availability</h2>
      <p>Siya Healthcare, PLLC currently provides clinical telehealth services in: <strong>${escapeHtml(STATES_INLINE)}</strong>.</p>
      <p>${escapeHtml(PROVIDER_LICENSE_DISCLAIMER)}</p>
    </section>
    <section>
      <h2>Published policies</h2>
      <table class="legal-hub-table">
        <thead><tr><th>Document</th><th>Effective</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </section>`;

  const html = renderPage({
    title: LEGAL_HUB.title,
    description: 'Legal and compliance policies for Siya Health telehealth services.',
    canonicalPath: LEGAL_HUB.path,
    mainHtml: main,
    isHub: true,
  });
  fs.mkdirSync(LEGAL_DIR, { recursive: true });
  fs.writeFileSync(path.join(LEGAL_DIR, 'index.html'), html);
}

function generateDocument(doc) {
  const { html: body, fromSource } = loadBody(doc);
  const effLabel = formatEffectiveDate(doc.effectiveDate);
  const related = relatedLinks(doc);
  const header = `
    <header class="legal-document-header">
      <h1>${escapeHtml(doc.title)}</h1>
      <p class="legal-document-meta">Effective: ${escapeHtml(effLabel)}</p>
      ${related ? `<nav class="legal-related" aria-label="Related policies"><ul>${related}</ul></nav>` : ''}
    </header>
    <!-- SIYA:LEGAL-CONTENT -->`;

  const main = `${header}\n${body}\n<!-- /SIYA:LEGAL-CONTENT -->`;

  const page = renderPage({
    title: doc.title,
    description: `${doc.title} for Siya Health.`,
    canonicalPath: `/legal/${doc.slug}`,
    mainHtml: main,
  });

  const outDir = path.join(LEGAL_DIR, doc.slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  return { slug: doc.slug, fromSource };
}

function removePlannedPageDirs() {
  for (const slug of REMOVED_PLANNED_SLUGS) {
    const dir = path.join(LEGAL_DIR, slug);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`  Removed planned stub: /legal/${slug}`);
    }
  }
}

function main() {
  fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  removePlannedPageDirs();
  generateHub();
  const report = PUBLISHED_LEGAL_DOCUMENTS.map(generateDocument);
  console.log('Generated legal pages:', LEGAL_HUB.path);
  for (const r of report) {
    console.log(`  /legal/${r.slug} ${r.fromSource ? '(counsel source rendered)' : '(stub)'}`);
  }
  console.log('Published documents:', PUBLISHED_LEGAL_DOCUMENTS.length);
  console.log('AVAILABLE_SERVICE_STATES:', AVAILABLE_SERVICE_STATES.join(', '));
}

main();
