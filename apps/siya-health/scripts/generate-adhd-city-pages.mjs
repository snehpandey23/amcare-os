/**
 * Scaffold city ADHD service pages under /adhd-care/{city}.
 * Content sourced from data/adhd-city-landings.mjs.
 * Meta robots: index, follow (clinical review signed off Aug 2026).
 *
 * Run: node scripts/generate-adhd-city-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ADHD_CITY_LANDINGS } from '../data/adhd-city-landings.mjs';
import { applySiteChrome } from './site-chrome.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(SITE_ROOT, 'adhd-care');
const BASE = 'https://siya.health';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function faqAccordion(city) {
  return city.faqs
    .map((faq, i) => {
      const id = `faq-${city.slug}-${i}`;
      const qid = `faq-${city.slug}-q-${i}`;
      return `<div class="faq-accordion-card" data-faq-item>
          <h3 style="margin:0;">
            <button type="button" class="faq-accordion-trigger" aria-expanded="false" aria-controls="${id}" id="${qid}" data-faq-trigger>
              <span>${esc(faq.question)}</span>
              <span class="faq-accordion-icon" aria-hidden="true">+</span>
            </button>
          </h3>
          <div id="${id}" class="faq-accordion-content" role="region" aria-labelledby="${qid}" data-faq-content>
            <div class="faq-accordion-inner">
              <p>${esc(faq.answer)}</p>
            </div>
          </div>
        </div>`;
    })
    .join('\n        ');
}

function providerList(city) {
  return `<ul class="footer-links">
            ${city.providers
              .map((p) => `<li><a href="${esc(p.href)}">${esc(p.name)}</a> · licensed in ${esc(city.state)}</li>`)
              .join('\n            ')}
          </ul>`;
}

function relatedList(city) {
  return `<ul class="footer-links">
            ${city.relatedLinks
              .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`)
              .join('\n            ')}
          </ul>`;
}

function clinicalReviewAside(city) {
  const flags = (city.clinicalReviewFlags || [])
    .map((f) => `<li>${esc(f)}</li>`)
    .join('\n              ');
  return `<aside class="clinical-review clinical-review--pending" data-needs-clinical-review="true" aria-label="NEEDS CLINICAL REVIEW">
            <p class="clinical-review-label">NEEDS CLINICAL REVIEW: ${esc(city.city)}</p>
            <p>Operational and telehealth copy below is ready for founder review. Leave <code>noindex</code> until this pass is signed off. Do not invent medication, diagnostic-criteria, or efficacy claims.</p>
            <ul>
              ${flags}
            </ul>
          </aside>`;
}

function buildPage(city) {
  const canonical = `${BASE}/adhd-care/${city.slug}`;
  const webpageLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: city.title.replace(/ \| Siya Health$/, ''),
    description: city.description,
    url: canonical,
    inLanguage: 'en-US',
    isPartOf: { '@type': 'WebSite', name: 'Siya Health', url: `${BASE}/` },
    about: { '@type': 'MedicalCondition', name: 'Attention Deficit Hyperactivity Disorder (Adult ADHD)' },
    audience: {
      '@type': 'MedicalAudience',
      geographicArea: { '@type': 'City', name: city.city, containedInPlace: { '@type': 'State', name: city.state } },
    },
  };
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'ADHD Care', item: `${BASE}/adhd-care` },
      { '@type': 'ListItem', position: 3, name: `ADHD care in ${city.city}`, item: canonical },
    ],
  };
  // MedicalClinic: areaServed city only — no street address / invent of local office
  const clinicLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: 'Siya Health',
    url: `${BASE}/`,
    image: `${BASE}/assets/images/siya-health-logo.png`,
    medicalSpecialty: 'Adult ADHD',
    areaServed: {
      '@type': 'City',
      name: city.city,
      containedInPlace: { '@type': 'State', name: city.state },
    },
    availableService: {
      '@type': 'MedicalProcedure',
      name: 'Adult ADHD evaluation (telehealth)',
      url: `${BASE}/adhd-care`,
    },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: city.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${esc(city.title)}</title>
    <meta name="description" content="${esc(city.description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${esc(city.title)}" />
    <meta property="og:description" content="${esc(city.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${BASE}/assets/images/siya-health-logo.png" />
    <meta property="og:site_name" content="Siya Health" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(city.title)}" />
    <meta name="twitter:description" content="${esc(city.description)}" />
    <meta name="twitter:image" content="${BASE}/assets/images/siya-health-logo.png" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${JSON.stringify(webpageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(clinicLd)}</script>
    <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  </head>
  <body class="page-service page-adhd-city" data-siya-care-pathway="adhd" data-siya-city="${esc(city.slug)}" data-siya-state="${esc(city.stateAbbr)}">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">®</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/providers">Care Team</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          <a class="button ds-button ds-button--primary" href="/adhd-screening?adhd=1" data-siya-track="adhd_screening_click" data-siya-location="nav" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="lead-magnet" data-component="button">Take Free ADHD Screening</a>
        </div>
      </div>
    </header>

    <main id="main">
      <section class="hero-merged" style="background-image: url('/assets/images/adhd-care.jpg');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="hero-kicker"><a href="/adhd-care">ADHD Care</a> · ${esc(city.city)}, ${esc(city.stateAbbr)}</p>
            <h1>${esc(city.h1)}</h1>
            <p class="hero-merged-lead">${esc(city.lead)}</p>
            <p class="hero-state-line">${esc(city.state)}-licensed telehealth · No insurance required · No local clinic visit required</p>
            <div class="hero-ctas hero-ctas-row">
              <a class="button ds-button ds-button--primary" href="/adhd-screening?adhd=1" data-siya-track="adhd_screening_click" data-siya-location="hero" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="lead-magnet" data-component="button">Take Free ADHD Screening</a>
              <a class="button ds-button ds-button--secondary secondary" href="/redirect/meet-greet" data-siya-track="meet_greet_click" data-siya-location="hero" data-page-type="adhd" data-intent="adhd" data-conversion-goal="meetGreet" data-cta-slot="meetGreet" data-component="button">Book Free Meet &amp; Greet</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-tinted" id="clinical-review-gate" aria-labelledby="clinical-review-heading">
        <div class="container">
          <h2 id="clinical-review-heading" class="visually-hidden">Clinical review status</h2>
          ${clinicalReviewAside(city)}
        </div>
      </section>

      <section class="section" id="city-intro" aria-labelledby="city-intro-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="city-intro-heading">${esc(city.introHeading)}</h2>
          </div>
          <div class="prose city-intro">
            ${city.introHtml}
          </div>
        </div>
      </section>

      <section class="section" id="telehealth-model" aria-labelledby="telehealth-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="telehealth-heading">${esc(city.telehealthHeading)}</h2>
          </div>
          <div class="prose city-telehealth">
            ${city.telehealthHtml}
          </div>
          <h3>Clinicians licensed in ${esc(city.state)}</h3>
          ${providerList(city)}
        </div>
      </section>

      <section class="section" id="how-care-works">
        <div class="container">
          <div class="section-header">
            <h2>How ADHD care works from ${esc(city.city)}</h2>
            <p class="lead">Same care pathway as our <a href="/adhd-care">ADHD Care</a> hub—localized for ${esc(city.regionLabel)} search intent.</p>
          </div>
          <ol class="evaluation-journey-list">
            <li><strong>Free screening</strong> <span>2-minute check-in. Screening is not a diagnosis.</span></li>
            <li><strong>Physician-led evaluation</strong> <span>Structured virtual visit when you are ready—${esc(city.state)}-licensed clinicians only.</span></li>
            <li><strong>Personalized plan</strong> <span>Options explained in plain language. Medication is never guaranteed.</span></li>
          </ol>
        </div>
      </section>

      <section class="section faq-accordion-section" id="faq">
        <div class="container">
          <div class="faq-accordion" role="region" aria-label="Frequently Asked Questions">
            <div class="faq-accordion-header section-header">
              <h2>Frequently asked questions — ${esc(city.city)}</h2>
            </div>
            <div class="faq-accordion-list">
              ${faqAccordion(city)}
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="related">
        <div class="container">
          <div class="section-header">
            <h2>Related resources</h2>
          </div>
          ${relatedList(city)}
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="cta-band">
            <h3>Start with screening—or a Meet &amp; Greet</h3>
            <p>Same-week appointments are often available after screening. No insurance required. ${esc(city.state)} licensing confirmed at scheduling.</p>
            <div class="cta-band-buttons">
              <a class="button ds-button ds-button--primary" href="/adhd-screening?adhd=1" data-siya-track="adhd_screening_click" data-siya-location="city-final" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="lead-magnet" data-component="button">Take Free ADHD Screening</a>
              <a class="button ds-button ds-button--secondary secondary" href="/redirect/meet-greet" data-siya-track="meet_greet_click" data-siya-location="city-final" data-page-type="adhd" data-intent="adhd" data-conversion-goal="meetGreet" data-cta-slot="meetGreet" data-component="button">Book Free Meet &amp; Greet</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p><a href="/adhd-care">ADHD Care</a> · <a href="/providers">Care Team</a> · <a href="/legal">Legal</a></p>
      </div>
    </footer>
  </body>
</html>
`;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const city of ADHD_CITY_LANDINGS) {
    const rel = `adhd-care/${city.slug}.html`;
    let html = buildPage(city);
    html = applySiteChrome(html, rel, city.title);
    fs.writeFileSync(path.join(SITE_ROOT, rel), html, 'utf8');
    console.log('wrote', rel);
  }
}

main();
