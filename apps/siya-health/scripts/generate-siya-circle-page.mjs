/**
 * Generates /siya-circle — first-party newsletter signup page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SIYA_CIRCLE_JOIN_LINK_ATTRS,
  SIYA_CIRCLE_JOIN_TRACK,
  buildSiyaCircleSignupCtaHtml,
} from '../data/siya-circle-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'siya-circle.html');

const CANONICAL = 'https://siya.health/siya-circle';

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>Siya Circle | Free Health Education Newsletter</title>
    <meta name="description" content="Join Siya Circle, a free health education newsletter from Siya Health with clinician-informed guides on focus, energy, weight, mood, hormones, and everyday health." />
    <link rel="canonical" href="${CANONICAL}" />
    <meta property="og:title" content="Siya Circle | Free Health Education Newsletter" />
    <meta property="og:description" content="Join Siya Circle for clinician-informed health education — general education only, not medical advice." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${CANONICAL}" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="page-siya-circle">
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
      <section class="hero-merged siya-circle-hero" style="background-image: url('/assets/images/healthy-lifestyle.png');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="siya-circle-eyebrow">Free · General education only</p>
            <h1>Join Siya Circle</h1>
            <p class="hero-merged-lead">A free health education newsletter for adults working on focus, energy, mood, weight, and everyday health.</p>
            <p>Get useful, clinician-informed explainers from Siya Health, plus early updates on new guides, programs, and practical ways to understand what may be getting in the way.</p>
            <div class="hero-ctas">
              <a class="button ds-button ds-button--primary" ${SIYA_CIRCLE_JOIN_LINK_ATTRS} data-siya-location="hero" data-page-type="newsletter" data-intent="newsletter" data-conversion-goal="newsletter" data-cta-slot="newsletter" data-component="button">Join Siya Circle</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="siya-circle-signup" aria-labelledby="signup-heading">
        <div class="container siya-circle-layout">
          <div class="siya-circle-form-col">
${buildSiyaCircleSignupCtaHtml()}
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p class="footer-legal-micro">Educational content only — not medical advice. Emergency: call 911.</p>
      </div>
    </footer>
    <script src="/scripts/siya-circle-signup.js" defer></script>
  </body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
