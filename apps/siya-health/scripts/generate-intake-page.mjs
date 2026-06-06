/**
 * Generates /intake — on-page legal acceptance before redirect to CarePatron booking.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  buildClientIntakeConfig,
  GHL_BOOKING_URL,
  LEGAL_ACCEPTANCE_COPY,
  LEGAL_LINK_PATHS,
} from '../data/ghl-intake-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'intake', 'index.html');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const copy = LEGAL_ACCEPTANCE_COPY;
const config = buildClientIntakeConfig();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, follow" />
  <title>Secure Intake | Siya Health</title>
  <meta name="description" content="Complete required policy acknowledgments before booking with Siya Health." />
  <link rel="canonical" href="https://siya.health/intake" />
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container">
      <a class="header-logo" href="/"><img src="/assets/images/siya-health-logo.png" alt="Siya Health" /></a>
      <nav class="nav-center" aria-label="Primary">
        <a href="/">Home</a>
        <a href="/adhd-care">ADHD Care</a>
        <a href="/providers">Our Care Team</a>
        <a href="/legal">Legal</a>
      </nav>
    </div>
  </header>
  <main id="main" class="section">
    <div class="container">
      <div class="section-header">
        <h1>Secure intake &amp; booking</h1>
        <p class="lead">Review and accept our policies before continuing to schedule your visit. No PHI is collected on this page.</p>
      </div>

      <div class="intake-legal-panel" id="intake-acceptance-panel">
        <form id="intake-acceptance-form" class="ghl-legal-gate__form" novalidate>
          <fieldset class="ghl-legal-gate__checks">
            <legend class="visually-hidden">Legal acceptance</legend>
            <label class="ghl-legal-gate__check">
              <input type="checkbox" id="intake-legal-terms" required />
              <span>I agree to the <a href="${LEGAL_LINK_PATHS.terms}" target="_blank" rel="noopener">Terms of Use</a></span>
            </label>
            <label class="ghl-legal-gate__check">
              <input type="checkbox" id="intake-legal-privacy" required />
              <span>I acknowledge the <a href="${LEGAL_LINK_PATHS.privacy}" target="_blank" rel="noopener">Privacy Policy</a></span>
            </label>
            <label class="ghl-legal-gate__check">
              <input type="checkbox" id="intake-legal-npp" required />
              <span>I acknowledge the <a href="${LEGAL_LINK_PATHS.npp}" target="_blank" rel="noopener">Notice of Privacy Practices</a></span>
            </label>
          </fieldset>
          <p class="ghl-legal-gate__adhd" id="intake-adhd-disclaimer" hidden>${esc(copy.adhdDisclaimer)}</p>
          <p class="ghl-legal-gate__confirm">${esc(copy.submitConfirmation)}</p>
          <p class="ghl-legal-gate__links">
            <a href="${LEGAL_LINK_PATHS.terms}" target="_blank" rel="noopener">Terms of Use</a>
            <span aria-hidden="true">|</span>
            <a href="${LEGAL_LINK_PATHS.privacy}" target="_blank" rel="noopener">Privacy Policy</a>
            <span aria-hidden="true">|</span>
            <a href="${LEGAL_LINK_PATHS.npp}" target="_blank" rel="noopener">Notice of Privacy Practices</a>
          </p>
          <p class="ghl-legal-gate__error" id="intake-acceptance-error" role="alert" hidden>Please accept all three policies to continue.</p>
          <button type="submit" class="button">Continue to booking</button>
        </form>
      </div>
    </div>
  </main>
  <footer class="footer">
    <div class="container">
      <p class="footer-notice">For emergencies, call 911.</p>
      <small>© 2026 Siya Health Inc.</small>
    </div>
  </footer>
  <script>window.SIYA_GHL_INTAKE=${JSON.stringify(config)};</script>
  <script src="/scripts/ghl-legal-acceptance.js" defer></script>
  <script>
    (function () {
      var params = new URLSearchParams(location.search);
      var dest = params.get('dest') || ${JSON.stringify(GHL_BOOKING_URL)};
      var adhd = params.get('funnel') === 'adhd' || /adhd/i.test(params.get('source') || '');
      if (adhd) {
        document.body.dataset.siyaFunnel = 'adhd';
        var adhdEl = document.getElementById('intake-adhd-disclaimer');
        if (adhdEl) adhdEl.hidden = false;
      }
      var form = document.getElementById('intake-acceptance-form');
      var err = document.getElementById('intake-acceptance-error');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok =
          document.getElementById('intake-legal-terms').checked &&
          document.getElementById('intake-legal-privacy').checked &&
          document.getElementById('intake-legal-npp').checked;
        if (!ok) {
          err.hidden = false;
          return;
        }
        err.hidden = true;
        var gate = window.SiyaGhlLegalGate;
        var src = location.pathname + location.search;
        var url = gate ? gate.buildAcceptanceUrl(dest, src) : dest;
        window.location.href = url;
      });
    })();
  </script>
</body>
</html>`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote intake/index.html');
