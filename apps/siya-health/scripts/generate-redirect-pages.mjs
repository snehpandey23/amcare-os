/**
 * Generate internal conversion redirect transition pages.
 * Run: node scripts/generate-redirect-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SPRUCE_CHAT_URL,
  ADHD_WALKTHROUGH_LINK,
  ADHD_EVALUATION_199_LINK,
} from '../data/providers-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const PAGES = [
  {
    slug: 'chat',
    title: 'Connecting to Secure Medical Chat | Siya Health',
    heading: 'Connecting you to secure medical chat',
    body: 'You are leaving Siya Health to message our care team securely in Spruce. This is the fastest way to ask questions before booking.',
    destination: SPRUCE_CHAT_URL,
    analyticsEvent: 'redirect_secure_chat',
    type: 'secure_chat',
    ctaLabel: 'Continue to Secure Medical Chat',
  },
  {
    slug: 'adhd-walkthrough',
    title: 'Booking Your ADHD Walkthrough | Siya Health',
    heading: 'Booking your free ADHD walkthrough',
    body: 'You are leaving Siya Health to schedule a short, non-clinical call with our care team about the ADHD evaluation process, pricing, and next steps.',
    destination: ADHD_WALKTHROUGH_LINK,
    analyticsEvent: 'redirect_adhd_walkthrough',
    type: 'adhd_walkthrough',
    ctaLabel: 'Continue to Book ADHD Walkthrough',
  },
  {
    slug: 'adhd-evaluation',
    title: 'Starting Your ADHD Evaluation | Siya Health',
    heading: 'Starting your $199 ADHD evaluation',
    body: 'You are leaving Siya Health to begin the adult ADHD evaluation booking flow, including intake and testing before your provider visit.',
    destination: ADHD_EVALUATION_199_LINK,
    analyticsEvent: 'redirect_adhd_evaluation',
    type: 'adhd_evaluation',
    ctaLabel: 'Continue to $199 Evaluation Booking',
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function renderPage(page) {
  const config = JSON.stringify({
    destination: page.destination,
    analyticsEvent: page.analyticsEvent,
    type: page.type,
    delayMs: 1500,
  });

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/scripts/cookie-consent-bootstrap.js"></script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${esc(page.title)}</title>
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="stylesheet" href="/styles.css" />
    <style>
      .redirect-transition { min-height: 70vh; display: flex; align-items: center; justify-content: center; padding: 48px 20px; }
      .redirect-transition__card { max-width: 520px; text-align: center; }
      .redirect-transition__logo { width: 160px; margin: 0 auto 24px; display: block; }
      .redirect-transition__spinner { width: 36px; height: 36px; border: 3px solid rgba(13,148,136,.2); border-top-color: #0d9488; border-radius: 50%; margin: 20px auto; animation: siya-spin .8s linear infinite; }
      @keyframes siya-spin { to { transform: rotate(360deg); } }
    </style>
    <script>window.SIYA_REDIRECT_CONFIG = ${config};</script>
  </head>
  <body>
    <main class="redirect-transition" id="main">
      <div class="redirect-transition__card">
        <a href="/"><img class="redirect-transition__logo" src="/assets/images/siya-health-logo.png" alt="Siya Health" width="160" height="48" /></a>
        <h1>${esc(page.heading)}</h1>
        <p>${esc(page.body)}</p>
        <div class="redirect-transition__spinner" aria-hidden="true"></div>
        <p><a id="siya-redirect-fallback" class="button" href="${esc(page.destination)}" rel="noopener">${esc(page.ctaLabel)}</a></p>
        <p class="cta-microcopy">If you are not redirected automatically, use the button above.</p>
      </div>
    </main>
    <script src="/scripts/redirect-transition.js"></script>
  </body>
</html>
`;
}

for (const page of PAGES) {
  const dir = path.join(SITE_ROOT, 'redirect', page.slug);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'index.html');
  fs.writeFileSync(out, renderPage(page), 'utf8');
  console.log('Wrote', path.relative(SITE_ROOT, out));
}
