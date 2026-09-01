/**
 * Generates /join-our-team — provider recruitment (staging-first, noindex).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { careersInquiryButtonHtml, careersInquiryFormHtml } from '../data/careers-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'join-our-team.html');

const CANONICAL = 'https://siya.health/join-our-team';
const TITLE = 'Join Our Clinical Team | Siya Health';
const DESCRIPTION =
  'Join Siya Health as a telehealth clinician. Concierge admin support, licensing coordination, and multi-state opportunity — express interest without a full ATS.';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <link rel="canonical" href="${CANONICAL}" />
    <meta property="og:title" content="${esc(TITLE)}" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${CANONICAL}" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="page-careers page-service">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header site-header-transparent">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">&reg;</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary"></nav>
        <div class="nav-cta"></div>
      </div>
    </header>

    <main id="main">
      <section class="hero-merged" style="background-image: url('/assets/images/healthy-lifestyle.png');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="hero-state-line">For licensed clinicians</p>
            <h1>Practice with concierge support</h1>
            <p class="hero-merged-lead">Siya Health is building physician-led telehealth for working professionals — with operational support so clinicians can focus on medicine, not inbox chaos.</p>
            <div class="hero-ctas hero-ctas-row">
              ${careersInquiryButtonHtml({ location: 'hero' })}
              <a class="button ds-button ds-button--secondary secondary" href="#why-join" data-page-type="careers">Why join Siya</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-tinted" id="why-join">
        <div class="container">
          <div class="section-header">
            <h2>What we offer providers</h2>
            <p class="lead">Exact arrangements vary by role and state — this page is for initial interest, not a contract offer.</p>
          </div>
          <div class="flow-cards flow-cards--journey">
            <div class="flow-card">
              <span class="flow-step-num">1</span>
              <h3>Concierge admin model</h3>
              <p>Scribing support, intake coordination, pharmacy logistics, and care navigation — designed to reduce between-visit drop-off.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">2</span>
              <h3>Licensing &amp; credentialing support</h3>
              <p>Operational help navigating multi-state telehealth practice — not legal advice, but structured internal coordination.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">3</span>
              <h3>Flexible telehealth practice</h3>
              <p>Adult-focused care across ADHD, metabolic health, primary care pathways, and related services in supported states.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">4</span>
              <h3>Clinician-informed culture</h3>
              <p>Built by physicians who understand the gap between good clinical intent and what actually happens between visits.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="careers-inquiry" aria-labelledby="careers-inquiry-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="careers-inquiry-heading">Express interest</h2>
            <p class="lead">Share your background and licensed states. Our clinical leadership team will follow up — this is not a patient booking form.</p>
          </div>
          <div class="intake-legal-panel employer-inquiry-panel">
            ${careersInquiryFormHtml()}
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p class="footer-legal-micro">Recruiting inquiries only — not for patient care or emergencies. Emergency: call 911.</p>
      </div>
    </footer>
    <script src="/scripts/careers-inquiry.js" defer></script>
  </body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
