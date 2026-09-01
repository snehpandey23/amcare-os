/**
 * Generates /employers — B2B employer partnership landing (staging-first).
 * Run before seo-build.mjs: node scripts/generate-employers-page.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  employerInquiryButtonHtml,
  employerInquiryFormHtml,
} from '../data/employer-config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'employers.html');

const CANONICAL = 'https://siya.health/employers';
const TITLE = 'Employer Cognitive Health Programs | Siya Health';
const DESCRIPTION =
  'Structured screening and physician-led telehealth for working professionals—ADHD, sleep, stress, and attention markers—with concierge-team-supported care and proactive monitoring. Partnership inquiries welcome; pricing finalized separately.';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FAQS = [
  {
    q: 'Is this an employee wellness perk or clinical care?',
    a: 'Siya Health provides physician-led telehealth—not a generic wellness app. Structured screening and evaluation pathways are clinician-guided; outcomes are not guaranteed and vary by individual.',
  },
  {
    q: 'What screening markers do you track?',
    a: 'Programs can include structured screening for ADHD-related attention patterns, sleep disruption, and stress or mood markers that affect focus at work. Screening is not diagnosis; clinical evaluation determines next steps when appropriate.',
  },
  {
    q: 'Do you publish employer pricing on this page?',
    a: 'No. B2B pricing and program packaging are being finalized with early partners. Submit an inquiry and our team will share what is available for your organization size and goals.',
  },
  {
    q: 'Which states are covered?',
    a: 'Licensed telehealth for adults in California, Texas, Pennsylvania, and Florida. Eligibility is confirmed at scheduling based on where the employee is located at the time of visit.',
  },
  {
    q: 'How is this different from patient self-booking on siya.health?',
    a: 'This page is for HR, benefits, and leadership teams exploring structured programs for working professionals. Individual employees can still use our standard patient pathways (Meet &amp; Greet, screening, and evaluation) without an employer contract.',
  },
];

function faqAccordion(faqs, prefix) {
  return faqs
    .map((f, i) => {
      const id = `${prefix}-${i}`;
      return `              <div class="faq-accordion-card" data-faq-item>
                <h3 style="margin:0;">
                  <button type="button" class="faq-accordion-trigger" aria-expanded="false" aria-controls="${id}" id="${id}-q" data-faq-trigger>
                    <span>${esc(f.q)}</span>
                    <span class="faq-accordion-icon" aria-hidden="true">+</span>
                  </button>
                </h3>
                <div id="${id}" class="faq-accordion-content" role="region" aria-labelledby="${id}-q" data-faq-content>
                  <div class="faq-accordion-inner">
                    <p>${f.a}</p>
                  </div>
                </div>
              </div>`;
    })
    .join('\n');
}

const webPageLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: TITLE,
  description: DESCRIPTION,
  url: CANONICAL,
  audience: { '@type': 'BusinessAudience', audienceType: 'Employers and HR leaders' },
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/&amp;/g, '&') },
  })),
};

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <link rel="canonical" href="${CANONICAL}" />
    <meta property="og:title" content="${esc(TITLE)}" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${CANONICAL}" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${JSON.stringify(webPageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  </head>
  <body class="page-employer page-service">
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
      <section class="hero-merged" style="background-image: url('/assets/images/editorial-burnout-afterwork.jpg');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="hero-state-line">For employers &amp; benefits teams</p>
            <h1>Cognitive health support for working professionals</h1>
            <p class="hero-merged-lead">Healthcare often screens for cognitive and mental health markers only after something breaks. Siya Health is building structured, longitudinal screening—ADHD, sleep, stress, and attention patterns—with physician-led telehealth and concierge-team-supported follow-through.</p>
            <div class="hero-ctas hero-ctas-row">
              ${employerInquiryButtonHtml({ location: 'hero', variant: 'primary' })}
              <a class="button ds-button ds-button--secondary secondary" href="#how-it-works" data-siya-location="hero" data-page-type="employer" data-intent="employer" data-component="button">See how it works</a>
            </div>
            <p class="cta-microcopy">Partnership pricing is not published yet. This page is for employer and HR inquiries—not individual patient booking.</p>
          </div>
        </div>
      </section>

      <section class="section section-tinted" id="why-now">
        <div class="container">
          <div class="section-header">
            <h2>Why now</h2>
            <p class="lead">Demand is already here. Healthcare has not caught up to what working professionals actually need.</p>
          </div>
          <div class="why-patients-grid">
            <div class="why-patients-copy">
              <p>While carefully screening ADHD patients, we noticed a pattern worth building on: a negative screen does not always mean nothing is there. Most systems react—a PHQ flag in the chart, dementia screening starting at 65—not proactive tracking for adults under sustained pressure.</p>
              <ul class="scan-list">
                <li><strong>Longitudinal markers</strong> for attention, sleep, and stress—not one-off checkboxes</li>
                <li><strong>Physician-led evaluation</strong> when screening warrants clinical follow-up</li>
                <li><strong>Concierge coordination</strong> so plans survive between visits</li>
              </ul>
            </div>
            <figure class="why-patients-media">
              <img src="/assets/images/editorial-busy-schedule.jpg" width="1100" height="733" alt="Professional working at a desk, pausing during a demanding workday." loading="lazy" decoding="async" />
            </figure>
          </div>
        </div>
      </section>

      <section class="section" id="what-included">
        <div class="container">
          <div class="section-header">
            <h2>What employer programs can include</h2>
            <p class="lead">Exact packaging is customized per partnership. No public pricing on this page.</p>
          </div>
          <div class="flow-cards flow-cards--journey">
            <div class="flow-card">
              <span class="flow-step-num">1</span>
              <h3>Structured screening</h3>
              <p>Validated tools for ADHD-related attention patterns, sleep disruption, and stress markers—designed for working adults, not pediatric checklists.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">2</span>
              <h3>Physician-led evaluation</h3>
              <p>Licensed clinicians in CA, TX, PA, and FL when clinical follow-up is appropriate. Screening is not diagnosis; evaluation determines next steps.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">3</span>
              <h3>Concierge-team support</h3>
              <p>Operational follow-through—intake coordination, pharmacy logistics, and care navigation—so plans do not die between visits.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">4</span>
              <h3>Proactive monitoring</h3>
              <p>Longitudinal check-ins on cognitive and related health markers for teams that want earlier signal—not only crisis response.</p>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-tinted" id="how-it-works">
        <div class="container">
          <div class="section-header">
            <h2>How employer partnerships start</h2>
          </div>
          <ol class="provider-lp-steps">
            <li><strong>Inquiry</strong>—tell us about your workforce, states, and goals (no commitment).</li>
            <li><strong>Discovery call</strong>—align on screening scope, clinical guardrails, and implementation.</li>
            <li><strong>Pilot design</strong>—pricing and contract terms finalized with your team (not listed publicly).</li>
          </ol>
          <p class="symptoms-transition">Individual employees can always start through our <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">patient pathways</a> without an employer contract.</p>
        </div>
      </section>

      <section class="section faq-accordion-section" id="faq" aria-labelledby="faq-heading">
        <div class="container">
          <div class="faq-accordion">
            <div class="faq-accordion-header section-header">
              <h2 id="faq-heading">Frequently asked questions</h2>
            </div>
            <div class="faq-accordion-list">
${faqAccordion(FAQS, 'employer-faq')}
            </div>
          </div>
        </div>
      </section>

      <section class="section section-tinted" id="employer-inquiry" aria-labelledby="inquiry-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="inquiry-heading">Request employer information</h2>
            <p class="lead">Share your organization details. Our team will follow up about partnership options—separate from patient self-booking.</p>
          </div>
          <div class="intake-legal-panel employer-inquiry-panel">
            ${employerInquiryFormHtml()}
            <p class="siya-circle-compliance" style="margin-top:1rem;">For individual clinical care, use <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a>—not this form.</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p class="footer-legal-micro">Educational and partnership information only—not medical advice. Emergency: call 911.</p>
      </div>
    </footer>
    <script src="/scripts/employer-inquiry.js" defer></script>
  </body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
