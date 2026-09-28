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
    <link rel="stylesheet" href="/design-system/h2-surface.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="page-siya-circle siya-h2-surface">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">&reg;</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <div class="nav-dropdown">
          <button type="button" class="nav-dropdown__toggle" aria-expanded="false" aria-haspopup="true" aria-controls="nav-about-menu" id="nav-about-toggle">About</button>
          <div class="nav-dropdown__menu" id="nav-about-menu" role="menu">
            <a href="/about" role="menuitem">About Us</a>
            <a href="/providers" role="menuitem">Care Team</a>
            <a href="/labs" role="menuitem">Labs</a>
          </div>
          </div>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/employers">Employers</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          <a class="button ds-button ds-button--primary" href="/siya-circle#siya-circle-signup">Join Siya Circle</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About Us</a>
          <a href="/providers">Care Team</a>
          <a href="/labs">Labs</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/employers">For Employers</a>
          <a href="/blog">Blog</a>
        </div>
      </div>
    </header>

    <main id="main">
      <section class="hero-merged hero-merged--abstract" aria-label="Siya Circle">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <h1>Join Siya Circle</h1>
            <p class="hero-merged-lead">Siya Circle is the short note from Siya Health: focus, energy, weight, and everyday care. You choose which of those you want to receive.</p>
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

    <footer class="footer siya-h2-footer-compact" id="siya-h2-footer"></footer>
    <script src="/scripts/h2-footer.js"></script>
    <script src="/scripts/header-scroll.js" defer></script>
    <script src="/scripts/nav-dropdown.js" defer></script>
    <script src="/scripts/siya-circle-signup.js" defer></script>
  </body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
