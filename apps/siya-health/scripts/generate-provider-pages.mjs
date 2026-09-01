/**
 * Generate provider profile pages and /providers index from data/providers.mjs.
 * Run: node scripts/generate-provider-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  BASE_URL,
  PROVIDERS,
  ZOCDOC_BOOKING_URL,
  getAllProviders,
  getProviderHubFilterTags,
  providerServiceStates,
  resolveProviderPhoto,
  stateChipLabel,
} from '../data/providers.mjs';
import { REDIRECT_MEET_GREET_URL, REDIRECT_CHAT_URL } from '../data/providers-core.mjs';
import {
  AVAILABLE_SERVICE_STATES,
  COPY_STANDARDS,
  PROVIDER_LICENSE_DISCLAIMER,
  STATES_INLINE,
} from '../data/site-standards.mjs';
import { formatCredentialMeta } from '../data/internal-provider-records.mjs';
import { getReviewedContentForProvider } from '../data/provider-reviewed-content.mjs';
import { getProviderHubPresentation } from '../data/provider-hub-presentation.mjs';
import { renderLegalFooter } from './site-chrome.mjs';
import { renderNavCtaMarkup, renderButton, slotToButton, resolveConversion } from '../design-system/components.mjs';

const STATE_ABBREV = {
  California: 'CA',
  Texas: 'TX',
  Pennsylvania: 'PA',
  Florida: 'FL',
  Ohio: 'OH',
};

function isServiceFootprintState(stateLabel) {
  if (AVAILABLE_SERVICE_STATES.includes(stateLabel)) return true;
  const match = Object.entries(STATE_ABBREV).find(([, abbr]) => abbr === stateLabel);
  return match ? AVAILABLE_SERVICE_STATES.includes(match[0]) : false;
}

function renderLicenseStateChip(label) {
  const licenseOnly = !isServiceFootprintState(label);
  const cls = licenseOnly
    ? 'provider-state-chip provider-state-chip--license-only'
    : 'provider-state-chip';
  const title = licenseOnly
    ? ' title="Professional license — not organizational service availability"'
    : '';
  return `<span class="${cls}"${title}>${esc(label)}</span>`;
}

function renderStateChipsBlock(states) {
  const chips = states.map((s) => renderLicenseStateChip(s)).join('\n                ');
  return `<div class="provider-state-chips" aria-label="Licensed states">${chips}</div>
              <p class="provider-license-disclaimer">${esc(PROVIDER_LICENSE_DISCLAIMER)}</p>`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const PROVIDERS_DIR = path.join(SITE_ROOT, 'providers');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function schemaEntityType(provider) {
  return provider.providerType === 'physician' ? 'Physician' : 'Physician';
}

function schemaEntityId(provider) {
  const canonical = `${BASE_URL}/providers/${provider.slug}`;
  return provider.providerType === 'physician' ? `${canonical}#physician` : `${canonical}#practitioner`;
}

function formatCredentialStatus(provider) {
  return formatCredentialMeta(provider);
}

function renderProviderPhotoMarkup(provider, { width = 280, height = 280, loading = 'eager', pathPrefix = '../' } = {}) {
  const photo = resolveProviderPhoto(provider);
  const src = `${pathPrefix}${photo.src}`;
  if (!photo.pending) {
    return `<img src="${src}" alt="${esc(photo.alt)}" width="${width}" height="${height}" loading="${loading}" />`;
  }
  return `<div class="provider-photo-wrap provider-photo-wrap--pending">
              <img src="${src}" alt="${esc(photo.alt)}" width="${width}" height="${height}" loading="${loading}" class="provider-photo-img provider-photo-img--placeholder" />
              <span class="provider-photo-initials" aria-hidden="true">${esc(photo.initials)}</span>
              <p class="provider-photo-pending-note">${esc(photo.pendingNote)}</p>
            </div>`;
}

function formatEducationHtml(provider) {
  const edu = provider.education;
  if (!edu || typeof edu !== 'object') return '';
  const items = [];
  if (edu.medicalSchool) {
    items.push(
      `<li><strong>Medical school:</strong> ${esc(edu.medicalSchool)}${edu.graduationYear ? ` (${edu.graduationYear})` : ''}</li>`,
    );
  }
  if (edu.undergraduate) items.push(`<li><strong>Education:</strong> ${esc(edu.undergraduate)}</li>`);
  if (edu.graduate) items.push(`<li><strong>Graduate training:</strong> ${esc(edu.graduate)}</li>`);
  if (edu.postGraduate) items.push(`<li><strong>Post-graduate:</strong> ${esc(edu.postGraduate)}</li>`);
  if (provider.residency) items.push(`<li><strong>Residency:</strong> ${esc(provider.residency)}</li>`);
  if (provider.fellowship) items.push(`<li><strong>Fellowship:</strong> ${esc(provider.fellowship)}</li>`);
  if (edu.residency && !provider.residency) items.push(`<li><strong>Residency:</strong> ${esc(edu.residency)}</li>`);
  return items.length ? `<ul class="provider-credential-list">${items.join('')}</ul>` : '';
}

function buildPhysicianSchema(provider) {
  const canonical = `${BASE_URL}/providers/${provider.slug}`;
  const image = `${BASE_URL}/${resolveProviderPhoto(provider).src}`;
  const entityId = schemaEntityId(provider);
  const person = {
    '@type': schemaEntityType(provider),
    '@id': entityId,
    name: `${provider.givenName} ${provider.familyName}`,
    jobTitle: provider.schema.jobTitle,
    medicalSpecialty: provider.schema.medicalSpecialty,
    knowsAbout: provider.schema.knowsAbout,
    url: canonical,
    image,
    worksFor: { '@id': `${BASE_URL}/#organization` },
    areaServed: providerServiceStates(provider).map((name) => ({ '@type': 'State', name })),
    ...(provider.honorificPrefix ? { honorificPrefix: provider.honorificPrefix } : {}),
    ...(provider.honorificSuffix ? { honorificSuffix: provider.honorificSuffix } : {}),
    ...(provider.npi ? { identifier: { '@type': 'PropertyValue', name: 'NPI', value: provider.npi } } : {}),
    ...(provider.sameAs.length ? { sameAs: provider.sameAs } : {}),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      {
        '@type': 'MedicalOrganization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Siya Health',
        url: `${BASE_URL}/`,
        logo: `${BASE_URL}/assets/images/siya-health-logo.png`,
        employee: { '@id': entityId },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${canonical}#webpage`,
        name: provider.seo.title.replace(/ \| Siya Health$/, ''),
        description: provider.seo.description,
        url: canonical,
        dateModified: provider.profileLastUpdated,
        mainEntity: { '@id': entityId },
      },
    ],
  };
}

function buildProviderBreadcrumb(provider) {
  const canonical = `${BASE_URL}/providers/${provider.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Our Care Team', item: `${BASE_URL}/providers` },
      { '@type': 'ListItem', position: 3, name: provider.name, item: canonical },
    ],
  };
}

function crossLinks(provider) {
  const servicePaths = new Set(provider.services.map((s) => s.path));
  const others = PROVIDERS.filter((p) => p.slug !== provider.slug);
  const scored = others
    .map((p) => ({ p, score: p.services.filter((s) => servicePaths.has(s.path)).length }))
    .sort((a, b) => b.score - a.score);
  const related = [];
  for (const { p, score } of scored) {
    if (related.length >= 3) break;
    if (score > 0 || related.length < 3) related.push(p);
  }
  const links = related.map((p) => `<a href="/providers/${p.slug}">${esc(p.displayName)}</a>`);
  return `More: <a href="/providers">Our care team</a> · <a href="/about">About Siya Health</a> · ${links.join(' · ')}`;
}

function renderProviderPage(provider) {
  const canonical = `${BASE_URL}/providers/${provider.slug}`;
  const isMedicalDirector = provider.slug === 'dr-sneh-pandey';
  const meetGreetUrl = REDIRECT_MEET_GREET_URL;
  const meetGreetLabel = COPY_STANDARDS.meetGreetCta;
  const zocdocLabel = 'Book Online via Zocdoc';
  const heroPrimaryCta = isMedicalDirector
    ? `<a class="button" href="${meetGreetUrl}" data-siya-track="meet_greet_click" data-siya-location="provider-hero-meet-greet" data-provider-cta="${provider.slug}">${meetGreetLabel}</a>`
    : `<a class="button" href="${REDIRECT_CHAT_URL}" data-siya-track="secure_chat_click" data-siya-location="provider-hero-chat" data-provider-cta="${provider.slug}">${COPY_STANDARDS.secureChatCta}</a>`;
  const finalPrimaryCta = isMedicalDirector
    ? `<a class="button" href="${meetGreetUrl}" data-siya-track="meet_greet_click" data-siya-location="provider-final-meet-greet" data-provider-cta="${provider.slug}">${meetGreetLabel}</a>`
    : `<a class="button" href="${REDIRECT_CHAT_URL}" data-siya-track="secure_chat_click" data-siya-location="provider-final-chat" data-provider-cta="${provider.slug}">${COPY_STANDARDS.secureChatCta}</a>`;
  const acceptingBadge = provider.acceptingNewPatients
    ? '<span class="provider-accepting-badge">Accepting new patients</span>'
    : '';
  const supervisionLine = provider.supervisionNote
    ? `<p class="provider-supervision-note">${esc(provider.supervisionNote)}</p>`
    : '';
  const chips = provider.credentialChips.map((c) => `<span>${c}</span>`).join('\n                ');
  const stateChipsBlock = renderStateChipsBlock(provider.statesLicensed);
  const longBio = provider.longBio.map((p) => `              <p>${p}</p>`).join('\n');
  const bullets = provider.patientFit.bullets.map((b) => `<li>${b}</li>`).join('\n                ');
  const focusFixed = provider.clinicalFocus.map((item) => `<li>${item}</li>`).join('\n            ');
  const carePhil = provider.carePhilosophy.map((p) => `<p>${p}</p>`).join('\n          ');
  const steps = provider.whatToExpect
    .map((s) => `<li><strong>${esc(s.title)}</strong>—${s.text}</li>`)
    .join('\n            ');
  const trust = provider.trustCards
    .map((c) => `<article>\n              <h3>${esc(c.title)}</h3>\n              <p>${c.text}</p>\n            </article>`)
    .join('\n            ');
  const services = provider.services.map((s) => `<li><a href="${s.path}">${esc(s.label)}</a></li>`).join('\n              ');
  const boardList = provider.boardCertifications.length
    ? `<ul class="provider-credential-list">${provider.boardCertifications.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>`
    : '<p>Board certification details pending verification.</p>';
  const educationBlock =
    formatEducationHtml(provider) ||
    '<p class="provider-data-pending">Education details not published on this profile—contact care@siya.health for credentialing questions.</p>';
  const memberships =
    provider.professionalMemberships.length > 0
      ? `<ul>${provider.professionalMemberships.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>`
      : '';
  const languages =
    provider.languages.length > 0 ? `<p><strong>Languages:</strong> ${provider.languages.join(', ')}</p>` : '';
  const inlineCtas = provider.inlineCtas
    .map((c) => `<a class="text-link" href="${c.path}">${esc(c.label)} →</a>`)
    .join('\n                ');
  const bookWithLabel = meetGreetLabel;
  const verifiedTestimonials = provider.testimonials.filter((t) => !t.needsVerification);
  const testimonialBlock =
    verifiedTestimonials.length > 0
      ? `          <div class="provider-lp-testimonials-wrap">
            <h3 class="sr-only">Patient reflections</h3>
${verifiedTestimonials
  .map(
    (t) => `            <blockquote class="provider-testimonial">
              “${t.quote}”
              <cite>— ${esc(t.cite)}</cite>
            </blockquote>`,
  )
  .join('\n')}
          </div>`
      : '';
  const reviewedBlock =
    provider.reviewedContent.length > 0
      ? `<section class="provider-lp-section" id="reviewed-content">
        <div class="container">
          <div class="section-header"><h2>Physician-reviewed content</h2></div>
          <ul>${provider.reviewedContent.map((r) => `<li><a href="${r.path}">${esc(r.title)}</a></li>`).join('')}</ul>
        </div>
      </section>`
      : '';
  const screeningBtn = '';
  const schemaJson = JSON.stringify(buildPhysicianSchema(provider));
  const breadcrumbJson = JSON.stringify(buildProviderBreadcrumb(provider));

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${esc(provider.seo.title)}</title>
    <meta name="description" content="${esc(provider.seo.description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${esc(provider.seo.title)}" />
    <meta property="og:description" content="${esc(provider.seo.description)}" />
    <meta property="og:type" content="profile" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${BASE_URL}/assets/images/siya-health-logo.png" />
    <meta property="og:site_name" content="Siya Health" />
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${breadcrumbJson}</script>
    <script type="application/ld+json">${schemaJson}</script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="site-header">
      <div class="container">
        <a class="header-logo" href="/"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" /></a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/providers">Our Care Team</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/answers">Health Guides</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          ${renderNavCtaMarkup(`providers/${provider.slug}.html`, 'nav')}
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/providers">Our Care Team</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/answers">Health Guides</a>
          <a href="/blog">Blog</a>
          ${renderNavCtaMarkup(`providers/${provider.slug}.html`, 'nav-mobile')}
        </div>
      </div>
    </header>

    <main id="main">
      <section class="provider-lp-hero">
        <div class="container">
          <div class="provider-lp-hero-inner">
            <div class="provider-lp-hero-copy">
              <h1>${esc(provider.name)}</h1>
              <p class="provider-lp-role-line"><strong>${esc(provider.role)}</strong>${acceptingBadge}</p>
              ${supervisionLine}
              <p class="provider-lp-hero-deck">${provider.patientFit.deck}</p>
              <p class="provider-lp-hero-lead">${provider.shortBio}</p>
              <div class="provider-lp-badges" aria-label="Credentials">${chips}</div>
              ${stateChipsBlock}
              <div class="provider-lp-ctas">
                ${heroPrimaryCta}
                <a class="button secondary" href="${ZOCDOC_BOOKING_URL}" target="_blank" rel="noopener noreferrer" data-siya-track="zocdoc_booking_click" data-siya-location="provider-hero-zocdoc">Book Online via Zocdoc</a>
                <a class="button secondary" href="#services-supported">View Services</a>
              </div>
              ${isMedicalDirector ? `<p class="cta-microcopy"><a href="${REDIRECT_CHAT_URL}" data-siya-track="secure_chat_click" data-siya-location="provider-hero-chat">${COPY_STANDARDS.secureChatCta}</a></p>` : ''}
            </div>
            <div class="provider-lp-photo-wrap">
              ${renderProviderPhotoMarkup(provider)}
            </div>
          </div>
        </div>
      </section>

      <section class="provider-lp-section section-tinted">
        <div class="container">
          <div class="provider-credential-card">
            <h2 class="sr-only">Credential summary</h2>
            <p><strong>${esc(provider.role)}</strong></p>
            <p>${provider.boardCertifications.map(esc).join(' · ')}</p>
            <p class="provider-profile-meta"><span>Profile updated: ${provider.profileLastUpdated}</span> · <span>${esc(formatCredentialStatus(provider))}</span>${provider.npi ? ` · <span>NPI ${esc(provider.npi)}</span>` : ''}</p>
          </div>
        </div>
      </section>

      <section class="provider-lp-section">
        <div class="container">
          <div class="section-header">
            <h2>${esc(provider.patientFit.sectionTitle)}</h2>
          </div>
          <div class="provider-lp-split">
            <div>
${longBio}
            </div>
            <div>
              <ul>
                ${bullets}
              </ul>
              <div class="provider-lp-ctas provider-lp-ctas--tight-top">
                ${inlineCtas}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="provider-lp-section section-tinted">
        <div class="container">
          <div class="section-header">
            <h2>Clinical focus</h2>
            <p class="lead">${provider.seo.focusLead}</p>
          </div>
          <ul class="conditions-list">
            ${focusFixed}
          </ul>
          <p class="cta-microcopy provider-lp-links-note">${provider.relatedLinksHtml}</p>
        </div>
      </section>

      <section class="provider-lp-section">
        <div class="container">
          <div class="section-header">
            <h2>Credentials &amp; training</h2>
          </div>
          ${boardList}
          ${educationBlock}
          ${memberships}
          ${languages}
        </div>
      </section>

      <section class="provider-lp-section section-tinted">
        <div class="container">
          <div class="section-header">
            <h2>Care philosophy</h2>
          </div>
          ${carePhil}
        </div>
      </section>

      <section class="provider-lp-section">
        <div class="container">
          <div class="section-header">
            <h2>Who this provider helps</h2>
          </div>
          <p>${provider.shortBio}</p>
          <ul>
            ${bullets}
          </ul>
        </div>
      </section>

      <section class="provider-lp-section section-tinted" id="services-supported">
        <div class="container">
          <div class="section-header">
            <h2>Services supported</h2>
          </div>
          <ul class="provider-service-links">
            ${services}
          </ul>
        </div>
      </section>

      <section class="provider-lp-section">
        <div class="container">
          <div class="section-header">
            <h2>Treatment approach</h2>
          </div>
          ${carePhil}
        </div>
      </section>

      <section class="provider-lp-section section-tinted">
        <div class="container">
          <div class="section-header">
            <h2>What to expect</h2>
          </div>
          <ol class="provider-lp-steps">
            ${steps}
          </ol>
        </div>
      </section>

      <section class="provider-lp-section">
        <div class="container">
          <div class="section-header">
            <h2>States &amp; telehealth</h2>
          </div>
          <div class="trust-strip-compact">
            ${trust}
          </div>
          <p class="blog-disclaimer">Telehealth availability depends on your location, medical history, and state regulations. Confirm licensed states when scheduling. ${provider.telehealthDisclaimer || 'For emergencies, call 911.'}</p>
${testimonialBlock}
        </div>
      </section>

      ${reviewedBlock}

      <section class="provider-lp-section">
        <div class="container">
          <div class="cta-band">
            <h3>${esc(provider.finalCta.title)}</h3>
            <p>${esc(provider.finalCta.subtitle)}</p>
            <div class="cta-band-buttons">
              ${finalPrimaryCta}
              <a class="button secondary" href="${ZOCDOC_BOOKING_URL}" target="_blank" rel="noopener noreferrer" data-siya-track="zocdoc_booking_click" data-siya-location="provider-final-zocdoc">${zocdocLabel}</a>
              ${isMedicalDirector ? `<a class="button secondary" href="${REDIRECT_CHAT_URL}" data-siya-track="secure_chat_click" data-siya-location="provider-final-chat">${COPY_STANDARDS.secureChatCta}</a>` : ''}
            </div>
          </div>
          <p class="blog-disclaimer provider-lp-disclaimer-below-cta"><strong>Disclaimer:</strong> ${esc(provider.disclaimer)}</p>
          <div class="provider-lp-cross">
            <p>${crossLinks(provider)}</p>
          </div>
          <p class="provider-profile-meta provider-profile-meta--footer">Last updated ${provider.profileLastUpdated}. ${esc(formatCredentialStatus(provider))}</p>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-logo-col">
          <a href="/" class="footer-logo-link"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" class="footer-logo-img" /></a>
        </div>
        <div class="footer-brand"><p>Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida.</p></div>
        <div><h4>Services</h4>
          <p><a href="/answers">Health Guides</a></p><p><a href="/adhd-care">ADHD Care</a></p><p><a href="/telehealth">Telehealth</a></p></div>
        <div><h4>Healthcare Services</h4><p><a href="/primary-urgent-care">Primary &amp; urgent care</a></p><p><a href="/labs">Diagnostic labs</a></p><p><a href="/prescriptions">Prescriptions</a></p></div>
        <div><h4>Contact</h4><p><a href="mailto:care@siya.health">care@siya.health</a></p><p><a href="tel:+12154451244">(215) 445-1244</a></p></div>
        ${renderLegalFooter()}
      </div>
      <div class="container"><p class="footer-notice">For emergencies, call 911. All telehealth services are provided by licensed medical professionals.</p><small>© 2026 Siya Health Inc.</small></div>
    </footer>
  </body>
</html>
`;
}

function formatLicensedStatesLine(statesLicensed) {
  if (!statesLicensed?.length) return '';
  return `Licensed in: ${statesLicensed.join(' · ')}`;
}

function renderProviderIndexCard(p) {
  const hub = getProviderHubPresentation(p.slug);
  const role = hub?.role ?? p.role;
  const credentialsLine = hub?.credentials
    ? `<p class="provider-index-credentials">${esc(hub.credentials)}</p>`
    : '';
  const focusItems = hub?.focus ?? p.clinicalFocus.map((f) => f.replace(/<[^>]+>/g, '').split('—')[0].trim());
  const focusTags = focusItems
    .map((text) => `<span class="provider-index-tag">${esc(text)}</span>`)
    .join('');
  const licensedStatesLine = p.statesDisplayHub || formatLicensedStatesLine(p.statesLicensed);
  const statesMarkup = licensedStatesLine
    ? `<p class="provider-index-states">${esc(licensedStatesLine)}</p>`
    : '';
  const description = hub?.description ?? p.patientFit.deck;
  const hubTags = getProviderHubFilterTags(p);
  const accepting = p.acceptingNewPatients
    ? '<span class="provider-accepting-badge provider-accepting-badge--hub">Accepting patients</span>'
    : '';
  const photoMarkup = renderProviderPhotoMarkup(p, { width: 120, height: 120, loading: 'lazy' });
  return `            <article class="provider-index-card" data-provider-type="${p.providerType || 'physician'}" data-states="${hubTags.states.join(',')}" data-services="${hubTags.services.join(',')}">
              ${photoMarkup}
              <h2><a href="/providers/${p.slug}">${esc(p.displayName || p.name)}</a></h2>
              <p class="provider-index-role">${esc(role)}${accepting}</p>
              ${credentialsLine}
              ${statesMarkup}
              <div class="provider-index-tags">${focusTags}</div>
              <p class="provider-index-teaser">${esc(description)}</p>
              <a class="button secondary" href="/providers/${p.slug}">View Profile</a>
            </article>`;
}

/** Hub filters reflect organizational service footprint only — not individual license states. */
const HUB_FILTER_STATES = ['CA', 'TX', 'PA', 'FL'];
const HUB_FILTER_SERVICES = [
  { key: 'adhd', label: 'ADHD' },
  { key: 'weight-loss', label: 'Weight Loss' },
  { key: 'primary-care', label: 'Primary Care' },
  { key: 'telehealth', label: 'Telehealth' },
];

function renderHubFilters() {
  const stateChips = HUB_FILTER_STATES.map(
    (s) => `<button type="button" class="provider-filter-chip" data-filter-group="state" data-filter-value="${s}">${s}</button>`,
  ).join('\n              ');
  const serviceChips = HUB_FILTER_SERVICES.map(
    (s) => `<button type="button" class="provider-filter-chip" data-filter-group="service" data-filter-value="${s.key}">${s.label}</button>`,
  ).join('\n              ');
  return `          <div class="provider-hub-filters" id="provider-hub-filters" aria-label="Filter care team">
            <div class="provider-filter-row">
              <span class="provider-filter-label">State</span>
              <div class="provider-filter-chips" role="group" aria-label="Filter by state">
                <button type="button" class="provider-filter-chip is-active" data-filter-group="state" data-filter-value="all">All</button>
${stateChips}
              </div>
            </div>
            <div class="provider-filter-row">
              <span class="provider-filter-label">Service</span>
              <div class="provider-filter-chips" role="group" aria-label="Filter by service">
                <button type="button" class="provider-filter-chip is-active" data-filter-group="service" data-filter-value="all">All</button>
${serviceChips}
              </div>
            </div>
            <p class="provider-filter-status" id="provider-filter-status" aria-live="polite">Showing all ${getAllProviders().length} clinicians</p>
          </div>`;
}

function renderProvidersIndex() {
  const all = getAllProviders();
  const physicians = all.filter((p) => p.hubSection === 'physicians');
  const advanced = all.filter((p) => p.hubSection === 'advanced-practice');
  const physicianCards = physicians.map(renderProviderIndexCard).join('\n');
  const advancedCards = advanced.map(renderProviderIndexCard).join('\n');
  const indexConv = resolveConversion('providers/index.html');
  const indexPrimaryBtn = renderButton({
    ...slotToButton(indexConv.primary, { location: 'provider-index-hero', relPath: 'providers/index.html' }),
    variant: 'primary',
  });
  const indexSecondaryBtn = renderButton({
    label: 'Book Online via Zocdoc',
    href: ZOCDOC_BOOKING_URL,
    external: true,
    track: 'zocdoc_booking_click',
    location: 'provider-index-hero',
    variant: 'secondary',
    relPath: 'providers/index.html',
  });

  const breadcrumb = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Our Care Team', item: `${BASE_URL}/providers` },
    ],
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>Our Care Team | Siya Health</title>
    <meta name="description" content="Meet Siya Health physicians and advanced practice providers—primary care–led telehealth for working adults across ADHD, metabolic, fatigue, and neurocognitive evaluation in ${STATES_INLINE}." />
    <link rel="canonical" href="${BASE_URL}/providers" />
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${breadcrumb}</script>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Our Care Team',
      alternateName: 'Our providers',
      description: 'Siya Health care team profiles',
      url: `${BASE_URL}/providers`,
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: PROVIDERS.map((p, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${BASE_URL}/providers/${p.slug}`,
          name: p.name,
        })),
      },
    })}</script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="site-header">
      <div class="container">
        <a class="header-logo" href="/"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" /></a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/providers" aria-current="page">Our Care Team</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/answers">Health Guides</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          ${renderNavCtaMarkup('providers/index.html', 'nav')}
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/providers">Our Care Team</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/answers">Health Guides</a>
          <a href="/blog">Blog</a>
          ${renderNavCtaMarkup('providers/index.html', 'nav-mobile')}
        </div>
      </div>
    </header>

    <main id="main">
      <section class="provider-index-hero section">
        <div class="container">
          <div class="provider-index-hero-layout">
            <div class="provider-index-hero-copy">
              <div class="section-header">
                <h1>Our Care Team</h1>
                <p class="lead">Physicians and advanced practice clinicians supporting structured evaluation for working adults—ADHD, metabolic health, fatigue, neurocognitive testing, primary care, and telehealth.</p>
                <p>Different training backgrounds—one standard: thoughtful evaluation, clear communication, and follow-through that does not vanish after one visit. <a href="/employers" class="text-link">Employer program overview →</a></p>
              </div>
              <div class="provider-lp-ctas">
                ${indexPrimaryBtn}
                ${indexSecondaryBtn}
              </div>
            </div>
            <figure class="provider-index-hero-media">
              <img src="/assets/images/care-team-group.jpg" alt="Siya Health care team of clinicians" width="640" height="420" loading="eager" decoding="async" />
            </figure>
          </div>
        </div>
      </section>

      <section class="section provider-hub-positioning" id="how-care-team-works">
        <div class="container">
          <div class="section-header">
            <h2>How our care team works</h2>
            <p class="lead">Siya Health uses a physician-led, primary care–first model—not a psychiatry-only or wellness-app approach. Depending on your state and clinical needs, you may work with a physician, nurse practitioner, or Physician Associate.</p>
          </div>
          <div class="flow-cards flow-cards--journey">
            <div class="flow-card">
              <span class="flow-step-num">1</span>
              <h3>Structured evaluation</h3>
              <p>History, validated tools when appropriate, and labs or neurocognitive testing when clinically indicated. Screening is not diagnosis.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">2</span>
              <h3>Physician-led plan</h3>
              <p>Findings explained in plain language. Medication, lifestyle, and follow-up only when clinically appropriate—not guaranteed outcomes.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">3</span>
              <h3>Concierge-supported follow-through</h3>
              <p>Intake coordination, pharmacy logistics, and care navigation so plans survive between visits—especially for busy working adults.</p>
            </div>
          </div>
          <p class="symptoms-transition">Licensed telehealth in ${STATES_INLINE}. <a href="/employers" class="text-link">Employer &amp; benefits teams →</a></p>
        </div>
      </section>

      <section class="section section-tinted">
        <div class="container">
${renderHubFilters()}
          <div class="section-header"><h2>Physicians</h2></div>
          <div class="provider-index-grid" id="provider-grid-physicians">
${physicianCards}
          </div>
          <div class="section-header provider-hub-section-gap"><h2>Advanced Practice Providers</h2></div>
          <div class="provider-index-grid" id="provider-grid-advanced">
${advancedCards}
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-logo-col">
          <a href="/" class="footer-logo-link"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" class="footer-logo-img" /></a>
        </div>
        <div class="footer-brand"><p>Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida.</p></div>
        <div><h4>Services</h4>
          <p><a href="/answers">Health Guides</a></p><p><a href="/adhd-care">ADHD Care</a></p><p><a href="/telehealth">Telehealth</a></p></div>
        <div><h4>Contact</h4><p><a href="mailto:care@siya.health">care@siya.health</a></p></div>
        ${renderLegalFooter()}
      </div>
      <div class="container"><small>© 2026 Siya Health Inc.</small></div>
    </footer>
    <script src="../assets/provider-hub-filters.js" defer></script>
  </body>
</html>
`;
}

function enrichProvider(provider) {
  return {
    ...provider,
    reviewedContent: getReviewedContentForProvider(provider.slug),
  };
}

function main() {
  fs.mkdirSync(PROVIDERS_DIR, { recursive: true });
  for (const p of PROVIDERS.map(enrichProvider)) {
    const out = path.join(PROVIDERS_DIR, `${p.slug}.html`);
    fs.writeFileSync(out, renderProviderPage(p), 'utf8');
    console.log('Wrote', out);
  }
  fs.writeFileSync(path.join(PROVIDERS_DIR, 'index.html'), renderProvidersIndex(), 'utf8');
  console.log('Wrote providers/index.html');
  console.log(`Generated ${PROVIDERS.length} provider pages + index`);
}

main();
