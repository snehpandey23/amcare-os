/**
 * Generates /primary-care — ROOT SERVICE ENTITY.
 *
 * Taxonomy class: Root Service (docs/CANONICAL-ENTITY-TAXONOMY-v1.md).
 * Not a sibling of Preventive Care — the root of the service hierarchy.
 *
 * Mission: answer "Where do I start when something feels off — or when I want
 * ongoing care?" Primary care is the relationship that holds symptoms, prevention,
 * labs, and specialty lanes together.
 *
 * Ownership vs siblings:
 *   /primary-care         → Root Service Entity (this page)
 *   /primary-urgent-care  → acute + process / booking surface under the root
 *   /preventive-care      → Service child (stay healthy before something goes wrong)
 *   /fatigue, /brain-fog  → Symptom children of the primary-care graph
 *
 * CTA policy: ONE primary = Book a primary care visit. No ADHD / GLP-1 / TRT funnels.
 *
 * Run: node scripts/generate-primary-care-entity-page.mjs  (BEFORE seo-build.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'primary-care.html');

const CANONICAL = 'https://siya.health/primary-care';
const TITLE = 'Primary Care — Where Ongoing Health Starts | Siya Health';
const DESCRIPTION =
  'Primary care is the root of ongoing health at Siya: symptoms, preventive care, labs in context, and specialty lanes under one physician-led telehealth relationship — not a funnel to a single condition.';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FAQS = [
  {
    q: 'What is primary care at Siya?',
    a: 'It is physician-led telehealth for ongoing adult health: new symptoms, preventive planning, chronic follow-up, lab review, and coordination into specialty lanes when needed. The point is a relationship that knows your baseline — not a one-off visit for a single keyword.',
  },
  {
    q: 'How is /primary-care different from Primary & Urgent Care?',
    a: 'This page is the knowledge-graph root: how primary care fits together. Primary & Urgent Care is the operational surface for acute needs, common conditions, and booking logistics. Both belong to the same care relationship.',
  },
  {
    q: 'Do I start with primary care or a specialty page?',
    a: 'If you are describing a symptom — fatigue, brain fog, feeling unwell — start with primary care. Specialty lanes (ADHD, weight, men’s or women’s health) become branches once history clarifies what belongs in the plan.',
  },
  {
    q: 'How does preventive care fit?',
    a: 'Preventive care is a service under primary care: staying healthy before something goes wrong — wellness rhythm, screenings, vaccines, lifestyle, and labs chosen because they would change a plan.',
  },
  {
    q: 'Can primary care help with labs?',
    a: 'Yes. Labs sit under preventive and clinical judgment, not as a catalogue. Your clinician helps decide what is worth measuring and what results mean for you.',
  },
  {
    q: 'Is ADHD care separate from primary care?',
    a: 'ADHD evaluation is a specialty lane Siya offers when appropriate. It is related to primary care, not a replacement for it — and symptoms like fatigue or brain fog should not auto-route to ADHD screening.',
  },
  {
    q: 'Which states is Siya available in?',
    a: 'Siya Health offers telehealth in California, Texas, Pennsylvania, and Florida. Availability is confirmed when you schedule.',
  },
  {
    q: 'Do I need insurance?',
    a: 'No. Siya offers direct-pay telehealth with published pricing so you know the cost before you book.',
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
                    <p>${esc(f.a)}</p>
                  </div>
                </div>
              </div>`;
    })
    .join('\n');
}

const medicalWebPageLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: TITLE,
  description: DESCRIPTION,
  url: CANONICAL,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', name: 'Siya Health', url: 'https://siya.health' },
  about: {
    '@type': 'MedicalTherapy',
    name: 'Primary Care',
    alternateName: ['Family medicine telehealth', 'Internal medicine telehealth', 'Ongoing primary care'],
  },
  lastReviewed: new Date().toISOString().slice(0, 10),
  reviewedBy: {
    '@type': 'Person',
    name: 'Dr. Vanessa Urbina',
    url: 'https://siya.health/providers/dr-vanessa-urbina',
  },
  provider: { '@type': 'MedicalOrganization', name: 'Siya Health', url: 'https://siya.health/' },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
    { '@type': 'ListItem', position: 2, name: 'Primary Care', item: CANONICAL },
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

function render() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/scripts/cookie-consent-bootstrap.js"></script>
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
    <meta property="og:site_name" content="Siya Health" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(TITLE)}" />
    <meta name="twitter:description" content="${esc(DESCRIPTION)}" />
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
    <link rel="preload" href="/styles.css" as="style" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
    <script type="application/ld+json">${JSON.stringify(medicalWebPageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  </head>
  <body class="page-service page-primary-care">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">&reg;</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/primary-care">Primary Care</a>
          <a href="/preventive-care">Preventive Care</a>
          <a href="/labs">Labs</a>
          <a href="/answers">Health Guides</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta"></div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/primary-care">Primary Care</a>
          <a href="/preventive-care">Preventive Care</a>
          <a href="/labs">Labs</a>
          <a href="/answers">Health Guides</a>
          <a href="/blog">Blog</a>
        </div>
      </div>
    </header>

    <main id="main">
      <section class="hero-merged" style="background-image: url('/assets/images/concierge-care-v2.jpg');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="hero-state-line">Root of care &middot; Physician-led telehealth</p>
            <h1>Primary care: where ongoing health starts</h1>
            <p class="hero-merged-lead">You do not have to know the diagnosis before you book. Primary care is the relationship that sorts symptoms, prevention, labs, and specialty questions into one coherent plan&mdash;across California, Texas, Pennsylvania, and Florida.</p>
            <div class="hero-ctas hero-ctas-row">
              <a class="button ds-button ds-button--primary" href="/book-appointment" data-siya-track="primary-cta-click" data-siya-location="hero" data-page-type="default" data-intent="primary-care" data-component="button">Book a primary care visit</a>
              <a class="button ds-button ds-button--secondary secondary" href="#how-it-fits" data-siya-track="scroll_hierarchy" data-siya-location="hero" data-component="button">See how care fits together</a>
            </div>
            <p class="cta-microcopy">Educational orientation, not a diagnosis. Emergencies need ER or urgent local care&mdash;not a scheduled telehealth slot.</p>
          </div>
        </div>
      </section>

      <nav class="section on-this-page" aria-labelledby="on-this-page-heading">
        <div class="container">
          <h2 id="on-this-page-heading" class="section-header">What this page answers</h2>
          <ul class="scan-list scan-list--compact">
            <li><a href="#what-primary-care-means">What primary care means here</a></li>
            <li><a href="#how-it-fits">How care fits together</a></li>
            <li><a href="#symptoms">When symptoms bring you in</a></li>
            <li><a href="#prevention-and-labs">Prevention and labs</a></li>
            <li><a href="#specialty-lanes">Specialty lanes</a></li>
            <li><a href="#faq">Frequently asked questions</a></li>
          </ul>
        </div>
      </nav>

      <section class="section" id="what-primary-care-means" aria-labelledby="what-primary-care-means-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="what-primary-care-means-heading">What primary care means here</h2>
            <p class="lead">A durable clinical home&mdash;not a landing page for a single product.</p>
          </div>
          <p>People arrive saying they are tired, foggy, worried about a lab PDF, or unsure what is due this year. Primary care is the frame that can hold all of that without forcing a premature specialty label.</p>
          <p>At Siya, that relationship is physician-led telehealth: history first, targeted evaluation, plain-language findings, and follow-up when trends matter. Acute needs and booking logistics also live on <a href="/primary-urgent-care">Primary &amp; Urgent Care</a>; this page is the root that explains how the pieces connect.</p>
        </div>
      </section>

      <section class="section section-tinted" id="how-it-fits" aria-labelledby="how-it-fits-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="how-it-fits-heading">How care fits together</h2>
            <p class="lead">Primary care is the root. Everything else is a child or related lane.</p>
          </div>
          <ul class="scan-list">
            <li><strong><a href="/preventive-care">Preventive Care</a></strong> &mdash; stay healthy before something goes wrong</li>
            <li><strong><a href="/primary-urgent-care">Primary &amp; Urgent Care</a></strong> &mdash; sick visits, common conditions, operational booking</li>
            <li><strong><a href="/adhd-care">ADHD Care</a></strong> &mdash; specialty evaluation lane when clinically appropriate (<a href="/adult-adhd-california">California ADHD hub</a>)</li>
            <li><strong><a href="/weight-loss-metabolic-health">Weight &amp; metabolic health</a></strong> &mdash; cardiometabolic care when that is the question</li>
            <li><strong><a href="/womens-midlife-health">Women&rsquo;s midlife health</a></strong> &mdash; midlife and hormone-related concerns in context</li>
            <li><strong><a href="/mens-health-longevity">Men&rsquo;s health</a></strong> &mdash; vitality and longevity questions under clinical judgment</li>
            <li><strong><a href="/telehealth">Telehealth</a></strong> &mdash; how access works across supported states</li>
          </ul>
        </div>
      </section>

      <section class="section" id="symptoms" aria-labelledby="symptoms-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="symptoms-heading">When symptoms bring you in</h2>
            <p class="lead">Symptoms are reasons for a visit&mdash;not destinations that skip evaluation.</p>
          </div>
          <p>Start with the experience you are having. Siya&rsquo;s symptom hubs teach recognition and differential thinking, then route to primary care&mdash;not to a default specialty funnel.</p>
          <ul class="footer-links">
            <li><a href="/fatigue">Fatigue: when tired stops being normal</a></li>
            <li><a href="/brain-fog">Brain fog: when thinking feels slower</a></li>
          </ul>
          <p>The clinical path looks like symptom &rarr; primary care &rarr; evaluation &rarr; possible labs &rarr; possible conditions &rarr; care. That is how a physician thinks; the site is built to match.</p>
        </div>
      </section>

      <section class="section section-tinted" id="prevention-and-labs" aria-labelledby="prevention-and-labs-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="prevention-and-labs-heading">Prevention and labs</h2>
            <p class="lead">Screenings and markers make sense inside a relationship&mdash;not as a shopping cart.</p>
          </div>
          <p><a href="/preventive-care">Preventive care</a> owns the forward-looking frame. <a href="/labs/preventive">Preventive labs</a> and marker guides such as <a href="/labs/cbc">CBC</a>, <a href="/labs/thyroid">TSH</a>, and <a href="/labs/vitamin-b12">B12</a> explain what tests broadly measure without interpreting your portal PDF.</p>
          <p>Bring results back to primary care when you need meaning, not just numbers. See <a href="/labs/how-to-read-results">how to read lab results</a> and <a href="/answers/why-normal-labs-dont-mean-healthy">why normal labs don&rsquo;t mean healthy</a>.</p>
        </div>
      </section>

      <section class="section" id="specialty-lanes" aria-labelledby="specialty-lanes-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="specialty-lanes-heading">Specialty lanes without premature funnels</h2>
            <p class="lead">Expertise is available. It is not the opening assumption for every symptom.</p>
          </div>
          <p>ADHD care, metabolic weight management, and midlife or men&rsquo;s health lanes exist because adults ask those questions. They sit under the primary care root so credibility compounds: the site is a primary care knowledge system with deep expertise&mdash;not an ADHD-only destination with bolted-on pages. California adults can start at the <a href="/adult-adhd-california">Adult ADHD California</a> hub when that is the question.</p>
        </div>
      </section>

      <section class="section section-tinted" id="related" aria-labelledby="related-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="related-heading">Related guides</h2>
            <p class="lead">Enter wherever you are; the graph connects the rest.</p>
          </div>
          <ul class="footer-links">
            <li><a href="/preventive-care">Preventive care</a></li>
            <li><a href="/fatigue">Fatigue</a></li>
            <li><a href="/brain-fog">Brain fog</a></li>
            <li><a href="/adult-adhd-california">Adult ADHD California</a></li>
            <li><a href="/primary-urgent-care">Primary &amp; Urgent Care</a></li>
            <li><a href="/labs">Labs &amp; blood tests</a></li>
          </ul>
        </div>
      </section>

      <section class="section faq-accordion-section" id="faq" aria-labelledby="faq-heading">
        <div class="container">
          <div class="faq-accordion">
            <div class="faq-accordion-header">
              <h2 id="faq-heading">Frequently asked questions</h2>
            </div>
            <div class="faq-accordion-list">
${faqAccordion(FAQS, 'faq-primary-care')}
            </div>
          </div>
        </div>
      </section>

      <section class="section section-tinted" id="next-step" aria-labelledby="next-step-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="next-step-heading">Start with a primary care visit</h2>
            <p class="lead">Bring the timeline, medications, and what changed. You do not need a finished theory first.</p>
          </div>
          <div style="max-width:640px;margin:0 auto;text-align:center;">
            <p><a class="button ds-button ds-button--secondary secondary" href="/book-appointment" data-siya-track="booking_click" data-siya-location="next-step" data-component="button">Book a primary care visit</a></p>
            <p class="cta-microcopy">Prefer to ask questions first? <a href="/redirect/meet-greet">Book a free Meet &amp; Greet</a>, or review <a href="/pricing">pricing</a>.</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p><a href="/primary-care">Primary Care</a> &middot; &copy; 2026 Siya Health Inc.</p>
      </div>
    </footer>
  </body>
</html>
`;
}

fs.writeFileSync(OUT, render());
console.log('Wrote primary-care.html (root service entity page)');
