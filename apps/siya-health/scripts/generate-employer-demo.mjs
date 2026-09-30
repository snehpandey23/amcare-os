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
  { id: 'question', label: 'The question' },
  { id: 'bridge', label: 'See how care works' },
  { id: 'chooser', label: 'How would you like to start?' },
  { id: 'web-ask', label: 'AI concierge' },
  { id: 'web-home', label: 'Homepage' },
  { id: 'web-book', label: 'Booking your free Meet & Greet' },
  { id: 'end-cal', label: 'Your care team' },
  { id: 'end-time', label: 'Pick a time' },
  { id: 'end-done', label: "You're booked" },
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
    <script>document.documentElement.classList.add("demo-js");if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)document.documentElement.classList.add("demo-reduce");</script>
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
      <section class="demo-slide" id="welcome" data-demo-chapter="welcome" data-title="Welcome" data-fx="dissolve" aria-labelledby="demo-welcome-heading">
        <div class="container demo-slide-inner">
          <p class="demo-welcome-mark" data-demo-in="up" style="--demo-i:0">Siya Health</p>
          <h1 id="demo-welcome-heading" class="demo-welcome-line" data-demo-in="up" style="--demo-i:1">A 2-minute tour for HR and benefits leaders</h1>
          <p data-demo-in="up" style="--demo-i:2"><button type="button" class="demo-open" id="demo-start-tour">Start the tour</button></p>
        </div>
      </section>

      <section class="demo-slide" id="problem" data-demo-chapter="problem" data-title="The problem" data-fx="zoom" aria-labelledby="demo-problem-heading">
        <div class="container demo-slide-inner demo-infographic">
          <h2 id="demo-problem-heading" class="demo-sr" data-demo-in="up">The problem</h2>
          <ul class="demo-info-grid">
            <li data-demo-in="zoom" style="--demo-i:0">
              <span class="demo-clock" aria-hidden="true"><span class="demo-clock-work"></span><span class="demo-clock-face"></span></span>
              <p data-demo-in="up" style="--demo-i:3">Appointments that don&rsquo;t fit a workday</p>
            </li>
            <li data-demo-in="zoom" style="--demo-i:1">
              <span class="demo-bubble-stamp" aria-hidden="true">Seen · 3 days ago</span>
              <p data-demo-in="up" style="--demo-i:4">Messages that go unanswered for days</p>
            </li>
            <li data-demo-in="zoom" style="--demo-i:2">
              <span class="demo-tangle" aria-hidden="true">
                <svg viewBox="0 0 160 72" aria-hidden="true"><path d="M16 20 C 40 60, 70 8, 96 40 S 130 10, 148 36" fill="none" stroke="#001878" stroke-width="1.5"/><path d="M20 50 C 50 10, 80 64, 110 24 S 140 58, 152 18" fill="none" stroke="#D81088" stroke-width="1.5"/></svg>
                <span></span><span></span><span></span><span></span><span></span>
              </span>
              <p data-demo-in="up" style="--demo-i:5">Five apps, five logins, no one connecting the dots</p>
            </li>
          </ul>
        </div>
      </section>

      <section class="demo-slide" id="question" data-demo-chapter="question" data-title="The question" data-fx="dissolve" aria-labelledby="demo-question-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-question-heading" data-demo-in="up" style="--demo-i:0">You&rsquo;ve invested in great health coverage for your people.</h2>
          <p class="demo-question-punch" data-demo-in="up" style="--demo-i:5">But can they actually use it?</p>
        </div>
      </section>

      <section class="demo-slide demo-parked" id="thesis" data-demo-chapter="thesis" aria-labelledby="demo-thesis-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-thesis-heading" data-demo-in="up" style="--demo-i:0">Most people don&rsquo;t lack health coverage. They lack care they can <span class="siya-em">actually use</span>.</h2>
        </div>
      </section>

      <section class="demo-slide demo-parked" id="start" data-demo-chapter="start" aria-labelledby="demo-start-heading">
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

      <section class="demo-slide demo-parked" id="chat" data-demo-chapter="chat" aria-labelledby="demo-chat-heading">
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

      <section class="demo-slide demo-parked" id="threads" data-demo-chapter="threads" aria-labelledby="demo-threads-heading">
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

      <section class="demo-slide demo-parked" id="curtain" data-demo-chapter="curtain" aria-labelledby="demo-curtain-heading">
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

      <section class="demo-slide demo-parked" id="founders" data-demo-chapter="founders" aria-labelledby="demo-founders-heading">
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

      <section class="demo-slide demo-parked" id="launch" data-demo-chapter="launch" aria-labelledby="demo-launch-heading">
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

      <section class="demo-slide demo-parked" id="safety" data-demo-chapter="safety" aria-labelledby="demo-safety-heading">
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

      <section class="demo-slide demo-parked" id="measure" data-demo-chapter="measure" aria-labelledby="demo-measure-heading">
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

      <section class="demo-slide demo-parked" id="hr" data-demo-chapter="hr" aria-labelledby="demo-hr-heading">
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

      <section class="demo-slide" id="bridge" data-demo-chapter="bridge" data-title="See how care works" data-fx="fly" aria-labelledby="demo-bridge-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-bridge-heading" data-demo-in="right" style="--demo-i:0">See how care really works — in real time.</h2>
        </div>
      </section>

      <section class="demo-slide" id="chooser" data-demo-chapter="chooser" data-title="How would you like to start?" data-fx="dissolve" aria-labelledby="demo-chooser-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-chooser-heading" data-demo-in="up" style="--demo-i:0">How would you like to start?</h2>
          <div class="demo-doors" role="group" aria-label="How would you like to start?">
            <button type="button" data-door="website" data-demo-in="up" style="--demo-i:1">Website</button>
            <button type="button" data-door="call" data-demo-in="up" style="--demo-i:2">Call</button>
            <button type="button" data-door="app" data-demo-in="up" style="--demo-i:3">Secure app</button>
          </div>
        </div>
      </section>

      <section class="demo-slide" id="web-ask" data-path="website" data-title="AI concierge" data-fx="zoom" aria-labelledby="demo-web-ask-heading">
        <div class="container demo-slide-inner">
          <p class="demo-label">Illustrative — demo data</p>
          <h2 id="demo-web-ask-heading" data-demo-in="up" style="--demo-i:0">Questions first? Ask our AI concierge or request a call back.</h2>
          <figure class="demo-shot" data-demo-in="zoom" style="--demo-i:1"><img src="/employers/media/home-hero.png" alt="Siya Health homepage with the AI concierge button" /></figure>
        </div>
      </section>
      <section class="demo-slide" id="web-home" data-path="website" data-title="Homepage" data-fx="zoom" aria-labelledby="demo-web-home-heading">
        <div class="container demo-slide-inner">
          <h2 id="demo-web-home-heading" class="demo-sr">Book Free Meet &amp; Greet</h2>
          <figure class="demo-shot demo-shot--zoom" data-demo-in="zoom" style="--demo-i:0"><img src="/employers/media/home-hero.png" alt="Siya Health homepage" /><span class="demo-zoom-ring" aria-hidden="true"></span></figure>
        </div>
      </section>
      <section class="demo-slide" id="web-book" data-path="website" data-title="Booking your free Meet &amp; Greet" data-fx="zoom">
        <div class="container demo-slide-inner">
          <p class="demo-kicker" data-demo-in="up">Booking your free Meet &amp; Greet</p>
          <p class="demo-lead" data-demo-in="up" style="--demo-i:1">A short, free call to understand what you need and choose the next step. It is not a medical visit.</p>
        </div>
      </section>

      <section class="demo-slide" id="call-tap" data-path="call" data-title="Call" data-fx="zoom">
        <div class="container demo-slide-inner">
          <p class="demo-label">Illustrative — demo data</p>
          <figure class="demo-shot" data-demo-in="zoom" style="--demo-i:0"><img src="/employers/media/home-footer.png" alt="Siya Health footer with the phone number" /></figure>
          <p class="demo-phone" data-demo-in="up" style="--demo-i:1"><a href="tel:+12154451244">(215) 445-1244</a></p>
        </div>
      </section>
      <section class="demo-slide" id="call-line" data-path="call" data-title="We'll call you back" data-fx="dissolve">
        <div class="container demo-slide-inner">
          <p class="demo-label">Illustrative — demo data</p>
          <h2 data-demo-in="up">We&rsquo;ll call you back during business hours to set everything up.</h2>
        </div>
      </section>

      <section class="demo-slide" id="app-qr" data-path="app" data-title="Secure app" data-fx="fly">
        <div class="container demo-slide-inner demo-phone-wrap">
          <p class="demo-label">Illustrative — demo data</p>
          <div class="demo-handset" data-demo-in="up">
            <img src="/employers/media/secure-chat-qr.png" alt="QR code to the Siya secure chat link" width="140" height="140" />
            <p>Scan to open secure chat</p>
          </div>
        </div>
      </section>
      <section class="demo-slide" id="app-hi" data-path="app" data-title="How can we help?" data-fx="dissolve">
        <div class="container demo-slide-inner demo-phone-wrap">
          <p class="demo-label">Illustrative — demo data</p>
          <div class="demo-handset" data-demo-in="up">
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> Hi, how can we help?</p>
          </div>
        </div>
      </section>
      <section class="demo-slide" id="app-form" data-path="app" data-title="Form" data-fx="dissolve">
        <div class="container demo-slide-inner demo-phone-wrap">
          <p class="demo-label">Illustrative — demo data</p>
          <div class="demo-handset" data-demo-in="up">
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> A short form arrived in this chat. Name, email, and what time works.</p>
          </div>
        </div>
      </section>
      <section class="demo-slide" id="app-times" data-path="app" data-title="Times offered" data-fx="dissolve">
        <div class="container demo-slide-inner demo-phone-wrap">
          <p class="demo-label">Illustrative — demo data</p>
          <div class="demo-handset" data-demo-in="up">
            <p class="demo-bubble demo-bubble--reply"><time>Care team</time> Thursday at 12:30, or Friday at 2:00.</p>
          </div>
        </div>
      </section>

      <section class="demo-slide" id="end-cal" data-path="shared" data-title="Your care team" data-fx="zoom">
        <div class="container demo-slide-inner">
          <p class="demo-label">Illustrative — demo data</p>
          <h2 data-demo-in="up" style="--demo-i:0">Your care team</h2>
          <div class="demo-cal" data-demo-in="up" style="--demo-i:1" aria-hidden="true">
            <p>September</p>
            <div class="demo-cal-grid"><span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span></span><span>1</span><span>2</span><span>3</span><span>4</span><span class="is-pick">5</span><span>6</span></div>
          </div>
        </div>
      </section>
      <section class="demo-slide" id="end-time" data-path="shared" data-title="Pick a time" data-fx="dissolve">
        <div class="container demo-slide-inner">
          <p class="demo-label">Illustrative — demo data</p>
          <h2 data-demo-in="up">Thursday, September 5</h2>
          <div class="demo-times" data-demo-in="up" style="--demo-i:1">
            <span>10:30</span><span class="is-pick">12:30</span><span>2:00</span><span>4:30</span>
          </div>
        </div>
      </section>
      <section class="demo-slide" id="end-done" data-path="shared" data-title="You're booked" data-fx="dissolve">
        <div class="container demo-slide-inner">
          <p class="demo-label">Illustrative — demo data</p>
          <h2 data-demo-in="up">You&rsquo;re booked. Your video visit link is in your confirmation — join from your phone or laptop.</h2>
        </div>
      </section>

      <section class="demo-slide" id="close" data-demo-chapter="close" data-title="See it live" data-fx="zoom" aria-labelledby="demo-close-heading">
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
      <label class="demo-scrub" id="demo-scrub-wrap">
        <span class="demo-scrub-tip" id="demo-scrub-tip" hidden></span>
        <input type="range" id="demo-scrub" min="1" max="${slides.length}" value="1" aria-valuemin="1" aria-valuemax="${slides.length}" aria-valuenow="1" aria-label="Tour slides" />
      </label>
      <p id="demo-counter" class="demo-counter">1 / ${slides.length}</p>
      <button type="button" id="demo-next">Next</button>
      <button type="button" id="demo-play" aria-pressed="false">Play</button>
    </div>
    </div>
    <div class="demo-intro is-gate" id="demo-intro">
      <canvas class="demo-intro-dots" id="demo-intro-dots" aria-hidden="true"></canvas>
      <button type="button" class="demo-intro-skip" id="demo-intro-skip">Skip</button>
      <p class="demo-intro-gate" id="demo-intro-gate">Click to begin</p>
      <div class="demo-intro-copy" id="demo-intro-copy">
        <p class="demo-intro-mark" id="demo-intro-mark">Siya Health</p>
        <p class="demo-intro-line" id="demo-intro-line">Integrated care for <span class="siya-em">busy professionals</span></p>
      </div>
    </div>
    <button type="button" id="demo-mute" class="demo-mute" aria-pressed="false" aria-label="Mute sound">Mute</button>
    <style>
      .demo-intro .siya-em {
        background-image: linear-gradient(90deg, #FF5CB8 0%, #E12193 46%, #C9A0FF 100%) !important;
      }
    </style>
    <script src="/scripts/employer-demo.js" defer></script>
  </body>
</html>
`;

fs.writeFileSync(OUT, applyHomepage2Surface(html), 'utf8');
console.log('Wrote', OUT);
