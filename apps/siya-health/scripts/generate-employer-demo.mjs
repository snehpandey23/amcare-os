/**
 * Invitation-only employer demo: /employers/demo
 * noindex · not in site nav · no pricing · facts from employer-pilot-facts.mjs
 *
 * EXCEPTION: this page loads GTM + siya-tracking.js and never the Meta pixel.
 * Do not copy that tracking setup onto other pages. seo-build chrome-lock
 * (siya-h2-surface + siya-h2-cursor-glow) skips site-chrome injection, so the
 * tags are written here. site-chrome.mjs has a matching demo-only branch if
 * the lock is ever removed.
 *
 * Run: node scripts/generate-employer-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyHomepage2Surface } from '../partials/homepage2-bg.mjs';
import { TRACKING } from '../data/tracking-config.mjs';
import { PROVIDERS } from '../data/providers.mjs';
import {
  EMPLOYER_PILOT_FACTS as FACTS,
  proofGoogleLine,
  proofKlarityLine,
  proofScaleLine,
} from '../data/employer-pilot-facts.mjs';

/** Swap for a scheduling URL later. Used only by the final "Book a call" button. */
const DEMO_BOOK_CALL_HREF = '/employers#employer-inquiry-form';

const sneh = PROVIDERS.find((p) => p.slug === 'dr-sneh-pandey');
const swati = PROVIDERS.find((p) => p.slug === 'dr-swati-pandey');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'employers', 'demo.html');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const gtm = '';
const gtmNoscript = '';

/** Inject GTM + siya-tracking.js only on production siya.health, and never after ?review=1. No Meta pixel. Do not copy. */
const analyticsBootstrap = `<script>
(function () {
function boot() {
  if (!document.body) return;
  var q = new URLSearchParams(location.search || '');
  if (q.get('review') === '1') {
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = 'siya_demo_review=1; Path=/employers; Max-Age=31536000; SameSite=Lax' + secure;
  }
  var bits = document.cookie ? document.cookie.split(';') : [];
  for (var i = 0; i < bits.length; i++) {
    if (bits[i].trim() === 'siya_demo_review=1') return;
  }
  var h = String((location && location.hostname) || '').toLowerCase();
  if (!(h === 'siya.health' || /\\.siya\\.health$/.test(h))) return;
  var w = window;
  var d = document;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var j = d.createElement('script');
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=${TRACKING.GTM_CONTAINER_ID}';
  d.head.appendChild(j);
  var t = d.createElement('script');
  t.src = '/scripts/siya-tracking.js';
  t.defer = true;
  d.body.appendChild(t);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
})();
</script>`;

const slides = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'problem', label: 'The problem' },
  { id: 'thesis', label: 'Thesis' },
  { id: 'start', label: 'Start however works for you' },
  { id: 'chat', label: 'Secure chat' },
  { id: 'threads', label: 'One conversation' },
  { id: 'curtain', label: 'Behind the curtain' },
  { id: 'founders', label: 'Founders' },
  { id: 'launch', label: 'Launching is simple' },
  { id: 'safety', label: 'Safety built in' },
  { id: 'measure', label: 'How we\u2019ll measure it together' },
  { id: 'hr', label: 'For HR' },
  { id: 'close', label: 'See it live' },
];

const dots = slides
  .map(
    (slide, i) =>
      `<li><button type="button" data-demo-dot="${esc(slide.id)}" aria-label="${esc(slide.label)}"${i === 0 ? ' class="is-current" aria-current="true"' : ''}></button></li>`,
  )
  .join('\n      ');

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/scripts/cookie-consent-bootstrap.js"></script>
    <!-- EXCEPTION: analytics for /employers/demo only, and only on siya.health. No Meta pixel. Do not copy. -->
    ${analyticsBootstrap}
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>Employer demo | Siya Health</title>
    <meta name="description" content="A short, self-paced walkthrough of Siya Health for HR and benefits leaders." />
    <link rel="canonical" href="https://siya.health/employers/demo" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/employers/demo.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="page-employer-demo page-service">
    ${gtmNoscript}
    <div class="siya-h2-cursor-glow" aria-hidden="true"></div>
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="demo-app">
    <header class="demo-header">
      <div class="container demo-header-inner">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">&reg;</sup></span>
        </a>
        <p class="demo-kicker">Employer demo</p>
      </div>
    </header>
    <div class="demo-stage" id="demo-stage">
    <main id="main">
      <section class="demo-slide" id="welcome" data-demo-chapter="welcome" aria-labelledby="demo-welcome-heading">
        <div class="container demo-slide-inner">
          <p class="demo-kicker" data-demo-in="up" style="--demo-i:0">Welcome — a 2-minute tour for HR and benefits leaders.</p>
          <h1 id="demo-welcome-heading" data-demo-in="up" style="--demo-i:1">Siya Health. An integrated care experience for <span class="siya-em">busy professionals</span>.</h1>
          <p data-demo-in="up" style="--demo-i:2"><button type="button" class="demo-open" id="demo-start-tour">Start the tour</button></p>
        </div>
      </section>

      <section class="demo-slide" id="problem" data-demo-chapter="problem" aria-labelledby="demo-problem-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-problem-heading" data-demo-in="left" style="--demo-i:0">The problem</h2>
          <ul class="demo-lines">
            <li data-demo-in="left" style="--demo-i:1">Appointments that don&rsquo;t fit a workday</li>
            <li data-demo-in="left" style="--demo-i:2">Messages that go unanswered for days</li>
            <li data-demo-in="left" style="--demo-i:3">Five apps, five logins, no one connecting the dots</li>
            <li data-demo-in="left" style="--demo-i:4">Care that starts over with every new provider</li>
          </ul>
        </div>
      </section>

      <section class="demo-slide" id="thesis" data-demo-chapter="thesis" aria-labelledby="demo-thesis-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-thesis-heading" data-demo-in="up" style="--demo-i:0">Most people don&rsquo;t lack health coverage. They lack care they can <span class="siya-em">actually use</span>.</h2>
        </div>
      </section>

      <section class="demo-slide" id="start" data-demo-chapter="start" aria-labelledby="demo-start-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-start-heading" data-demo-in="up" style="--demo-i:0">Start however works for you</h2>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:1">Not everyone wants another app. Choose the way that suits you — it all reaches the same care team.</p>
          <div class="demo-choice" role="group" aria-label="Ways to start" data-demo-in="up" style="--demo-i:2">
            <button type="button" data-start-choice="call" aria-pressed="false">Call</button>
            <button type="button" data-start-choice="text" aria-pressed="false">Text</button>
            <button type="button" data-start-choice="app" aria-pressed="false">Secure app</button>
            <button type="button" data-start-choice="book" aria-pressed="false">Book online</button>
          </div>
          <div class="demo-choice-panel" data-start-panel="call" hidden>
            <ol>
              <li>Call our care line.</li>
              <li>Tell our team what times work.</li>
              <li>We call you back to set everything up.</li>
            </ol>
          </div>
          <div class="demo-choice-panel" data-start-panel="text" hidden>
            <ol>
              <li>Text our number.</li>
              <li>We reply to coordinate timing.</li>
              <li>We call or book you in.</li>
            </ol>
            <p class="demo-note">Texts are for scheduling. Health details go through secure messaging.</p>
          </div>
          <div class="demo-choice-panel" data-start-panel="app" hidden>
            <ol>
              <li>Download our secure messaging app from the link we send.</li>
              <li>Share questions or documents before your visit.</li>
              <li>Our team replies and books you in.</li>
            </ol>
          </div>
          <div class="demo-choice-panel" data-start-panel="book" hidden>
            <ol>
              <li>Book a free meet &amp; greet.</li>
              <li>Pick a time that works for you.</li>
              <li>Get your visit link.</li>
            </ol>
            <p class="demo-note">The meet &amp; greet is free. Covered visits stay $0 for enrolled employees.</p>
          </div>
          <p class="demo-choice-same" id="demo-start-same" hidden>However you start, it&rsquo;s the same team and the same record.</p>
        </div>
      </section>

      <section class="demo-slide" id="chat" data-demo-chapter="chat" aria-labelledby="demo-chat-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-chat-heading" data-demo-in="left" style="--demo-i:0">Secure chat</h2>
          <p class="demo-label" data-demo-in="left" style="--demo-i:1">Illustrative — demo data</p>
          <div class="demo-chat-window">
          <div class="demo-thread" id="demo-thread" aria-label="Illustrative secure chat">
            <p class="demo-bubble"><time>Employee</time> I&rsquo;d like to get started.</p>
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> How can we help?</p>
            <p class="demo-bubble"><time>Employee</time> I&rsquo;m joining through my employer.</p>
            <p class="demo-note">Enrollment details to be finalized.</p>
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> You&rsquo;re enrolled. Same care team from here.</p>
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> Triage and intake forms are in this chat.</p>
            <p class="demo-bubble"><time>Employee</time> Forms completed.</p>
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> Thursday at 12:30, or use the booking link in this chat.</p>
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> You&rsquo;re confirmed for Thursday at 12:30.</p>
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> Your video visit link is in this chat.</p>
          </div>
          </div>
        </div>
      </section>

      <section class="demo-slide" id="threads" data-demo-chapter="threads" aria-labelledby="demo-threads-heading">
        <div class="container demo-slide-inner">
          <ul class="demo-nodes">
            <li class="demo-node" data-demo-in="up" style="--demo-i:0">Sleep</li>
            <li class="demo-node" data-demo-in="up" style="--demo-i:1">Focus</li>
            <li class="demo-node" data-demo-in="up" style="--demo-i:2">Stress</li>
            <li class="demo-node" data-demo-in="up" style="--demo-i:3">Energy</li>
          </ul>
          <svg class="demo-wave siya-hero-drift siya-hero-drift--wave" viewBox="0 0 1200 160" aria-hidden="true">
            <path d="M40 90 C 220 20, 380 140, 560 70 S 900 30, 1180 90" fill="none" stroke="#D81088" stroke-width="3" stroke-linecap="round"/>
            <path d="M20 40 C 200 110, 360 10, 540 80 S 840 130, 1160 40" fill="none" stroke="#001878" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:4">They&rsquo;re usually connected. One care team looks at them together.</p>
          <h2 id="demo-threads-heading" data-demo-in="up" style="--demo-i:5"><span class="siya-em">One conversation.</span> Not five referrals.</h2>
        </div>
      </section>

      <section class="demo-slide" id="curtain" data-demo-chapter="curtain" aria-labelledby="demo-curtain-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-curtain-heading" data-demo-in="left" style="--demo-i:0">Behind the curtain</h2>
          <ol class="demo-sequence">
            <li data-demo-in="left" style="--demo-i:1">A care plan</li>
            <li data-demo-in="left" style="--demo-i:2">Scheduled check-ins</li>
            <li data-demo-in="left" style="--demo-i:3">Safety protocols when medication is part of care</li>
            <li data-demo-in="left" style="--demo-i:4">Progress tracking</li>
          </ol>
        </div>
      </section>

      <section class="demo-slide" id="founders" data-demo-chapter="founders" aria-labelledby="demo-founders-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-founders-heading" data-demo-in="up" style="--demo-i:0">Founders</h2>
          <div class="demo-founders">
            <article class="demo-founder" data-demo-in="up" style="--demo-i:1">
              <img src="${esc(sneh.photo.startsWith('/') ? sneh.photo : `/${sneh.photo}`)}" alt="${esc(sneh.altText)}" width="72" height="72" />
              <p>${esc(sneh.displayName)}</p>
            </article>
            <article class="demo-founder" data-demo-in="up" style="--demo-i:2">
              <img src="${esc(swati.photo.startsWith('/') ? swati.photo : `/${swati.photo}`)}" alt="${esc(swati.altText)}" width="72" height="72" />
              <p>${esc(swati.displayName)}</p>
            </article>
          </div>
          <blockquote class="demo-quote" data-demo-in="up" style="--demo-i:3">
            <p class="demo-label">Quote placeholder — not approved copy</p>
            <p>Founder quote goes here.</p>
          </blockquote>
        </div>
      </section>

      <section class="demo-slide" id="launch" data-demo-chapter="launch" aria-labelledby="demo-launch-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-launch-heading" data-demo-in="up" style="--demo-i:0">Launching is simple</h2>
          <ol class="demo-sequence">
            <li data-demo-in="up" style="--demo-i:1">Share your employee roster.</li>
            <li data-demo-in="up" style="--demo-i:2">We send your team a launch kit.</li>
            <li data-demo-in="up" style="--demo-i:3">Employees join the way that suits them.</li>
            <li data-demo-in="up" style="--demo-i:4">You receive aggregate reports.</li>
          </ol>
        </div>
      </section>

      <section class="demo-slide" id="safety" data-demo-chapter="safety" aria-labelledby="demo-safety-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-safety-heading" data-demo-in="up" style="--demo-i:0">Safety built in</h2>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:1">When stimulant medication is clinically appropriate, we follow a structured safety process—not a one-visit prescription.</p>
          <ol class="demo-sequence">
            <li data-demo-in="up" style="--demo-i:2">Stimulant medication isn&rsquo;t started at the first visit.</li>
            <li data-demo-in="up" style="--demo-i:3">You&rsquo;ll review and sign a treatment agreement first.</li>
            <li data-demo-in="up" style="--demo-i:4">Care includes ongoing monitoring, including drug screening and pill counts when clinically indicated.</li>
          </ol>
        </div>
      </section>

      <section class="demo-slide" id="measure" data-demo-chapter="measure" aria-labelledby="demo-measure-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-measure-heading" data-demo-in="up" style="--demo-i:0">How we&rsquo;ll measure it together</h2>
          <ol class="demo-sequence">
            <li data-demo-in="up" style="--demo-i:1">Checkpoint reviews at month 3 and month 6.</li>
            <li data-demo-in="up" style="--demo-i:2">PHQ-9, GAD-7, and ASRS, along with other validated screening tools as clinically appropriate.</li>
            <li data-demo-in="up" style="--demo-i:3">Reports are aggregate only, for groups of 10 or more.</li>
          </ol>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:4">Outcomes aren&rsquo;t guaranteed.</p>
        </div>
      </section>

      <section class="demo-slide" id="hr" data-demo-chapter="hr" aria-labelledby="demo-hr-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-hr-heading" data-demo-in="up" style="--demo-i:0">You see aggregate results. <span class="siya-em">Never who, or why.</span></h2>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:1">Reports are aggregate only, for groups of 10 or more.</p>
          <ul class="demo-proof">
            <li data-demo-in="up" style="--demo-i:2">${esc(proofScaleLine())}</li>
            <li data-demo-in="up" style="--demo-i:3">${esc(proofGoogleLine())}</li>
            <li data-demo-in="up" style="--demo-i:4">${esc(proofKlarityLine())}</li>
            <li data-demo-in="up" style="--demo-i:5">Licensed in ${esc(FACTS.practiceStatesShort)}</li>
          </ul>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:6">Scheduled care ${esc(FACTS.scheduledCare)}. Concierge replies ${esc(FACTS.responseWithin)}.</p>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:7">${esc(FACTS.visitLocationLine)}</p>
        </div>
      </section>

      <section class="demo-slide" id="close" data-demo-chapter="close" aria-labelledby="demo-close-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-close-heading" data-demo-in="up" style="--demo-i:0">See it live.</h2>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:1">This tour is a preview. Book a short call and we&rsquo;ll walk you through the real experience.</p>
          <p data-demo-in="up" style="--demo-i:2"><a class="button ds-button ds-button--accent demo-cta" href="${esc(DEMO_BOOK_CALL_HREF)}" data-siya-track="employer_inquiry_click" data-siya-location="employer-demo-book" data-page-type="employer" data-intent="employer" data-conversion-goal="bookDemo" data-cta-slot="bookDemo" data-component="button">Book a call</a></p>
          <p data-demo-in="up" style="--demo-i:3"><a class="button ds-button demo-cta demo-cta--secondary" href="${esc(DEMO_BOOK_CALL_HREF)}" data-siya-track="employer_inquiry_click" data-siya-location="employer-demo-details" data-page-type="employer" data-intent="employer" data-conversion-goal="bookDemo" data-cta-slot="bookDemo" data-component="button">Request pilot details</a></p>
        </div>
      </section>
    </main>
    </div>
    <div class="demo-controls">
      <button type="button" id="demo-back">Back</button>
      <div class="demo-progress" id="demo-progress" role="progressbar" aria-valuemin="1" aria-valuemax="${slides.length}" aria-valuenow="1" aria-label="Tour progress"><span id="demo-progress-fill"></span></div>
      <p id="demo-counter" class="demo-counter">1 / ${slides.length}</p>
      <button type="button" id="demo-next">Next</button>
      <button type="button" id="demo-play" aria-pressed="false">Play</button>
    </div>
    </div>
    <div class="demo-intro" id="demo-intro" hidden>
      <canvas class="demo-intro-dots" id="demo-intro-dots" aria-hidden="true"></canvas>
      <button type="button" class="demo-intro-skip" id="demo-intro-skip">Skip intro</button>
      <div class="demo-intro-copy">
        <p class="demo-intro-name" id="demo-intro-name"></p>
        <p class="demo-intro-line" id="demo-intro-line">An integrated care experience for <span class="siya-em">busy professionals</span>.</p>
      </div>
    </div>
    <button type="button" id="demo-mute" class="demo-mute" aria-pressed="false" aria-label="Mute sound">Mute</button>
    <script src="/scripts/employer-demo.js" defer></script>
  </body>
</html>
`;

fs.writeFileSync(OUT, applyHomepage2Surface(html), 'utf8');
console.log('Wrote', OUT);
