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
  LEGAL_SECTION_ANCHORS,
  getLegalPath,
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

/** Counsel markdown → HTML. headingBump demotes headings so each policy sits under one h2. */
function markdownToHtml(md, headingBump = 0) {
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
      out.push(`<h${Math.min(6, 3 + headingBump)}>${inlineMarkdown(t.slice(4))}</h${Math.min(6, 3 + headingBump)}>`);
    } else if (t.startsWith('## ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h${Math.min(6, 2 + headingBump)}>${inlineMarkdown(t.slice(3))}</h${Math.min(6, 2 + headingBump)}>`);
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
  return { html: markdownToHtml(raw, 1), fromSource: true };
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
      return `<li><a href="${getLegalPath(related.slug)}">${escapeHtml(related.title)}</a></li>`;
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
    <link rel="stylesheet" href="/design-system/h2-surface.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="legal-page siya-h2-surface">
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="siya-h2-cursor-glow" aria-hidden="true"></div>
    <div class="siya-h2-page-bg" aria-hidden="true">
      <svg class="siya-h2-page-bg__svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
        <defs>
          <linearGradient id="siyaHeroCream" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F4EFE7"/>
            <stop offset="55%" stop-color="#E8EEF8"/>
            <stop offset="100%" stop-color="#F7F2EC"/>
          </linearGradient>
          <radialGradient id="siyaHeroGlowA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#D81088" stop-opacity="0.50"/>
            <stop offset="45%" stop-color="#D81088" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#D81088" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="siyaHeroGlowB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#001878" stop-opacity="0.42"/>
            <stop offset="50%" stop-color="#0A246B" stop-opacity="0.18"/>
            <stop offset="100%" stop-color="#001878" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="siyaHeroGlowC" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#7B2D8E" stop-opacity="0.38"/>
            <stop offset="55%" stop-color="#0A246B" stop-opacity="0.14"/>
            <stop offset="100%" stop-color="#0A246B" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#siyaHeroCream)"/>
        <g class="siya-hero-drift siya-hero-drift--a">
          <circle cx="240" cy="220" r="190" fill="url(#siyaHeroGlowA)"/>
          <circle class="siya-h2-ring" cx="240" cy="220" r="88" fill="none" stroke="#D81088" stroke-width="2.75"/>
          <circle class="siya-h2-ring siya-h2-ring--outer" cx="240" cy="220" r="132" fill="none" stroke="#D81088" stroke-width="1.6"/>
        </g>
        <g class="siya-hero-drift siya-hero-drift--b">
          <circle cx="940" cy="500" r="230" fill="url(#siyaHeroGlowB)"/>
          <circle class="siya-h2-ring" cx="940" cy="500" r="108" fill="none" stroke="#001878" stroke-width="2.75"/>
          <circle class="siya-h2-ring siya-h2-ring--outer" cx="940" cy="500" r="156" fill="none" stroke="#0A246B" stroke-width="1.6"/>
        </g>
        <g class="siya-hero-drift siya-hero-drift--wave">
          <path d="M40 620 C 220 500, 380 700, 560 560 S 900 480, 1180 380" fill="none" stroke="#D81088" stroke-width="2.75" stroke-linecap="round"/>
          <path d="M20 300 C 200 380, 360 180, 540 280 S 840 360, 1160 200" fill="none" stroke="#001878" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      </svg>
    </div>
    <header class="site-header site-header-transparent" id="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">®</sup></span>
        </a>
        <div class="nav-cta">
          <a href="/redirect/meet-greet" class="button ds-button ds-button--primary" data-siya-location="nav" data-page-type="legal">Book Free Meet &amp; Greet</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/about">About Us</a>
          <a href="/providers">Care Team</a>
          <a href="/labs">Labs</a>
          <a href="/pricing">Pricing</a>
        </div>
      </div>
    </header>
    <main id="main" class="legal-document-main">
      <div class="container legal-document-container">
        ${isHub ? '' : `<nav class="legal-breadcrumb" aria-label="Breadcrumb"><a href="${LEGAL_LINKS.hub}">Policies</a> <span aria-hidden="true">/</span> <span>${escapeHtml(title)}</span></nav>`}
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
    <footer class="footer siya-h2-footer-compact" id="siya-h2-footer"></footer>
    <script src="/scripts/h2-footer.js"></script>
    <script src="/scripts/h2-motion.js" defer></script>
    <script src="/scripts/header-scroll.js" defer></script>
  </body>
</html>`;
}

function rewritePublishedLegalHrefs(html) {
  let out = html.replaceAll('/legal/terms-of-use#entity-structure', '/legal#entity-structure');
  const slugs = [...PUBLISHED_LEGAL_DOCUMENTS.map((d) => d.slug)].sort((a, b) => b.length - a.length);
  for (const slug of slugs) {
    out = out.replaceAll(`/legal/${slug}`, getLegalPath(slug));
  }
  return out;
}

function generateCombinedPage() {
  const toc = PUBLISHED_LEGAL_DOCUMENTS.map((d) => {
    const anchor = LEGAL_SECTION_ANCHORS[d.slug];
    return `<li><a href="#${anchor}">${escapeHtml(d.title)}</a></li>`;
  }).join('\n');

  const sections = PUBLISHED_LEGAL_DOCUMENTS.map((doc) => {
    const anchor = LEGAL_SECTION_ANCHORS[doc.slug];
    const { html: body } = loadBody(doc);
    const effLabel = formatEffectiveDate(doc.effectiveDate);
    const related = relatedLinks(doc);
    const entityBlock = doc.slug === 'terms-of-use' ? `\n${entityStructureSectionHtml()}\n` : '';
    return `<section id="${anchor}" class="legal-policy-section" aria-labelledby="${anchor}-heading">
    <header class="legal-document-header">
      <h2 id="${anchor}-heading">${escapeHtml(doc.title)}</h2>
      <p class="legal-document-meta">Effective: ${escapeHtml(effLabel)}</p>
      ${related ? `<nav class="legal-related" aria-label="Related policies"><ul>${related}</ul></nav>` : ''}
    </header>
    <!-- SIYA:LEGAL-CONTENT -->
    ${entityBlock}${rewritePublishedLegalHrefs(body)}
    <!-- /SIYA:LEGAL-CONTENT -->
    </section>`;
  }).join('\n');

  const main = `
    <header class="legal-document-header">
      <h1>${escapeHtml(LEGAL_HUB.title)}</h1>
      <p class="legal-document-lead">Policies governing use of siya.health and Siya Healthcare, PLLC telehealth services. Each policy below stays at its own link.</p>
      <p class="legal-document-lead">Entity structure and service-availability disclosures are in the <a href="/legal#entity-structure">Terms of Use</a>.</p>
    </header>
    <nav class="legal-toc" aria-label="Policies on this page">
      <ul>${toc}</ul>
    </nav>
    ${sections}`;

  const html = renderPage({
    title: LEGAL_HUB.title,
    description: 'Terms of Use, Privacy Policy, Notice of Privacy Practices, Controlled Substance Treatment Agreement, and Cookie Policy for Siya Health.',
    canonicalPath: LEGAL_HUB.path,
    mainHtml: main,
    isHub: true,
  });
  fs.mkdirSync(LEGAL_DIR, { recursive: true });
  fs.writeFileSync(path.join(LEGAL_DIR, 'index.html'), html);
}

function entityStructureSectionHtml() {
  return `<section id="entity-structure" aria-labelledby="entity-structure-heading">
<h3 id="entity-structure-heading">Entity structure</h3>
<p>${escapeHtml(CANONICAL_ENTITY_STATEMENT)}</p>
<p>Siya Health Inc. does not practice medicine. Clinical care is delivered solely by Siya Healthcare, PLLC and its employed and/or contracted licensed clinicians (the Professionals). Administrative, payment, technology, and other non-clinical support services are provided by Siya Health Inc.</p>
</section>
<section id="organizational-service-availability" aria-labelledby="service-availability-heading">
<h3 id="service-availability-heading">Organizational service availability</h3>
<p>Siya Healthcare, PLLC currently provides clinical telehealth services in: <strong>${escapeHtml(STATES_INLINE)}</strong>.</p>
<p>${escapeHtml(PROVIDER_LICENSE_DISCLAIMER)}</p>
</section>`;
}

function removeSeparatePolicyDirs() {
  for (const doc of PUBLISHED_LEGAL_DOCUMENTS) {
    const dir = path.join(LEGAL_DIR, doc.slug);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`  Removed separate page (now /legal#${LEGAL_SECTION_ANCHORS[doc.slug]}): /legal/${doc.slug}`);
    }
  }
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
  generateCombinedPage();
  // Keep /legal/terms-of-use and the other document URLs serving until the
  // redirect cutover is explicitly shipped. Do not delete them in this build.
  console.log('Generated combined legal page:', LEGAL_HUB.path);
  for (const doc of PUBLISHED_LEGAL_DOCUMENTS) {
    console.log(`  ${getLegalPath(doc.slug)}  ${doc.title}`);
  }
  console.log('Published documents:', PUBLISHED_LEGAL_DOCUMENTS.length);
  console.log('AVAILABLE_SERVICE_STATES:', AVAILABLE_SERVICE_STATES.join(', '));
}

main();
