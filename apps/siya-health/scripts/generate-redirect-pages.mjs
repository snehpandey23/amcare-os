/**
 * Generate internal conversion redirect transition pages.
 * Run: node scripts/generate-redirect-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SPRUCE_CHAT_URL,
  MEET_GREET_BOOKING_URL,
  ADHD_EVALUATION_199_LINK,
} from '../data/providers-core.mjs';
import { COPY_STANDARDS } from '../data/site-standards.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const PAGES = [
  {
    slug: 'chat',
    title: 'Connecting to Secure Medical Chat | Siya Health',
    heading: 'Connecting you to secure medical chat',
    body: 'You are leaving Siya Health to message our care team securely in Spruce. Use this when you have a care question and are not ready to book yet.',
    destination: SPRUCE_CHAT_URL,
    analyticsEvent: 'redirect_secure_chat',
    type: 'secure_chat',
    ctaLabel: 'Continue to Secure Medical Chat',
  },
  {
    slug: 'meet-greet',
    title: 'Booking Your Free Meet & Greet | Siya Health',
    heading: 'Booking your free Meet & Greet',
    body: 'You are leaving Siya Health to schedule a short, free call to understand your needs, explain care options (including labs interpretation when relevant), and help you choose the right next step. This is not a medical visit, diagnosis, or treatment recommendation. No medication will be prescribed during this call.',
    destination: MEET_GREET_BOOKING_URL,
    analyticsEvent: 'redirect_meet_greet',
    type: 'meet_greet',
    ctaLabel: COPY_STANDARDS.meetGreetCta,
  },
  {
    slug: 'adhd-walkthrough',
    title: 'Booking Your Free Meet & Greet (Legacy Path) | Siya Health',
    heading: 'Booking your free Meet & Greet',
    body: 'You are leaving Siya Health to schedule a short, free call to understand your needs, explain care options (including labs interpretation when relevant), and help you choose the right next step. This is not a medical visit, diagnosis, or treatment recommendation. No medication will be prescribed during this call.',
    destination: MEET_GREET_BOOKING_URL,
    analyticsEvent: 'redirect_adhd_walkthrough',
    type: 'adhd_walkthrough',
    ctaLabel: COPY_STANDARDS.meetGreetCta,
  },
  {
    slug: 'adhd-evaluation',
    title: 'Starting Your ADHD Evaluation | Siya Health',
    heading: 'Starting your ADHD evaluation',
    body: 'You are leaving Siya Health to begin the adult ADHD evaluation booking flow, including intake and testing before your provider visit.',
    destination: ADHD_EVALUATION_199_LINK,
    analyticsEvent: 'redirect_adhd_evaluation',
    type: 'adhd_evaluation',
    ctaLabel: 'Continue to ADHD Evaluation Booking',
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
    delayMs: 2000,
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
      .redirect-transition__logo { height: 56px; width: auto; max-width: 200px; margin: 0 auto 24px; display: block; object-fit: contain; }
      .redirect-transition__spinner { width: 36px; height: 36px; border: 3px solid rgba(13,148,136,.2); border-top-color: #0d9488; border-radius: 50%; margin: 20px auto; animation: siya-spin .8s linear infinite; }
      @keyframes siya-spin { to { transform: rotate(360deg); } }
    </style>
    <script>window.SIYA_REDIRECT_CONFIG = ${config};</script>
  </head>
  <body>
    <main class="redirect-transition" id="main">
      <div class="redirect-transition__card">
        <a href="/"><img class="redirect-transition__logo" src="/assets/images/siya-health-logo-registered.png" alt="Siya Health" width="200" height="56" /></a>
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
