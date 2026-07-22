/**
 * Generates /labs/*.html topic pages + injects topic index on labs.html hub.
 * Run: node scripts/generate-labs-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  LABS_TOPIC_PAGES,
  LABS_STOREFRONT_URL,
  labsTopicPath,
  labsTopicFile,
} from '../data/labs-pages.mjs';
import { REDIRECT_MEET_GREET_URL } from '../data/providers-core.mjs';
import { COPY_STANDARDS } from '../data/site-standards.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LABS_DIR = path.join(ROOT, 'labs');

const STORE = LABS_STOREFRONT_URL;
const MEET = REDIRECT_MEET_GREET_URL;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function storeBtn(location, label = 'Browse Lab Tests', variant = 'primary') {
  const cls =
    variant === 'primary'
      ? 'button ds-button ds-button--primary'
      : 'button ds-button ds-button--secondary secondary';
  return `<a href="${STORE}" class="${cls}" data-siya-track="lab_storefront_click" data-siya-location="${esc(location)}" data-page-type="labs" data-intent="labs" data-component="button">${esc(label)}</a>`;
}

function meetBtn(location, variant = 'secondary') {
  const cls =
    variant === 'primary'
      ? 'button ds-button ds-button--primary'
      : 'button ds-button ds-button--secondary secondary';
  return `<a href="${MEET}" class="${cls}" data-siya-track="meet_greet_click" data-siya-location="${esc(location)}" data-page-type="labs" data-intent="labs" data-conversion-goal="meetGreet" data-cta-slot="meetGreet" data-component="button">${esc(COPY_STANDARDS.meetGreetCta)}</a>`;
}

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

function breadcrumbSchema(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
      { '@type': 'ListItem', position: 2, name: 'Labs & Blood Tests', item: 'https://siya.health/labs' },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.navLabel.replace(/^./, (c) => c.toUpperCase()),
        item: `https://siya.health${labsTopicPath(page.slug)}`,
      },
    ],
  };
}

function siblingLinks(currentSlug) {
  const topics = LABS_TOPIC_PAGES.filter((p) => p.slug !== currentSlug)
    .map((p) => `<li><a href="${labsTopicPath(p.slug)}">${esc(p.navLabel)}</a></li>`)
    .join('\n              ');
  return `${topics}
                <li><a href="/labs/how-to-read-results">How to read your lab results</a></li>`;
}

function renderFaqAccordion(faqs, idPrefix) {
  return faqs
    .map((f, i) => {
      const id = `${idPrefix}-${i}`;
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

function renderPage(page) {
  const pathUrl = labsTopicPath(page.slug);
  const canonical = `https://siya.health${pathUrl}`;
  const tests = page.commonTests
    .map(
      (t) => `            <article class="why-choose-card">
              <h3>${esc(t.name)}</h3>
              <p>${esc(t.note)}</p>
            </article>`,
    )
    .join('\n');
  const when = page.whenAppropriate.map((x) => `<li>${esc(x)}</li>`).join('\n                ');
  const cannot = page.cannotTell.map((x) => `<li>${esc(x)}</li>`).join('\n                ');
  const services = page.relatedServices
    .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`)
    .join('\n                ');
  const guides = page.relatedGuides
    .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`)
    .join('\n                ');
  const heroNote = page.heroNote
    ? `<p class="cta-microcopy"><strong>${esc(page.heroNote)}</strong></p>`
    : `<p class="cta-microcopy">Not sure which tests fit? Start with a clinical conversation.</p>`;

  const careFunnel = page.careFunnel
    ? `      <section class="section" aria-labelledby="care-funnel-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="care-funnel-heading">${esc(page.careFunnel.heading)}</h2>
            <p class="lead">${esc(page.careFunnel.lead)}</p>
          </div>
          <ol class="labs-care-funnel">
${page.careFunnel.steps
  .map((s, i) => {
    const link =
      s.href && s.linkLabel
        ? `<p class="cta-microcopy"><a href="${esc(s.href)}">${esc(s.linkLabel)}</a></p>`
        : '';
    return `            <li class="labs-care-funnel__step">
              <span class="labs-care-funnel__num" aria-hidden="true">${i + 1}</span>
              <div>
                <h3>${esc(s.title)}</h3>
                <p>${esc(s.body)}</p>
                ${link}
              </div>
            </li>`;
  })
  .join('\n')}
          </ol>
          <div class="hero-ctas hero-ctas-row" style="margin-top:1.5rem;">
            ${storeBtn(`labs-${page.slug}-funnel`)}
            <a href="/pricing" class="button ds-button ds-button--secondary secondary">View follow-up plans</a>
          </div>
        </div>
      </section>
`
    : '';

  const starterSet = page.starterSet
    ? `      <section class="section section-tinted" aria-labelledby="starter-set-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="starter-set-heading">${esc(page.starterSet.heading)}</h2>
            <p class="lead">${esc(page.starterSet.lead)}</p>
          </div>
          <ul class="scan-list">
                ${page.starterSet.items.map((x) => `<li>${esc(x)}</li>`).join('\n                ')}
          </ul>
          <p class="cta-microcopy" style="margin-top:1.25rem;">${esc(page.starterSet.note)}</p>
        </div>
      </section>

`
    : '';
  const limitsSectionClass = page.starterSet ? 'section' : 'section section-tinted';

  const webPageLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.description,
    url: canonical,
    isPartOf: { '@type': 'WebSite', name: 'Siya Health', url: 'https://siya.health' },
  };

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/scripts/cookie-consent-bootstrap.js"></script>
<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${esc(page.title)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:site_name" content="Siya Health" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(page.title)}" />
    <meta name="twitter:description" content="${esc(page.description)}" />
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
    <link rel="preload" href="/styles.css" as="style" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
    <script type="application/ld+json">${JSON.stringify(webPageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbSchema(page))}</script>
    <script type="application/ld+json">${JSON.stringify(faqSchema(page.faqs))}</script>
  </head>
  <body class="page-labs page-labs-topic page-service">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">®</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/mens-health-longevity">Men's Health</a>
          <a href="/labs">Labs</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          ${meetBtn('nav', 'primary')}
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/mens-health-longevity">Men's Health</a>
          <a href="/labs">Labs</a>
          <a href="/blog">Blog</a>
          ${meetBtn('nav-mobile', 'primary')}
        </div>
      </div>
    </header>

    <main id="main">
      <section class="hero-merged" style="background-image: url('/assets/images/healthy-lifestyle.png');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="hero-state-line"><a href="/labs">Labs &amp; Blood Tests</a> · Topic guide</p>
            <h1>${esc(page.h1)}</h1>
            <p class="hero-merged-lead">${esc(page.lead)}</p>
            <p class="hero-state-line">Available across <strong>California · Texas · Pennsylvania · Florida</strong></p>
            <div class="labs-hero-value">
              <p><strong>Not sure which tests make sense?</strong> We&rsquo;ll help.</p>
              <p><strong>Already have results?</strong> We&rsquo;ll help interpret them too.</p>
            </div>
            <div class="hero-ctas hero-ctas-row">
              ${storeBtn(`labs-${page.slug}-hero`)}
              ${meetBtn(`labs-${page.slug}-hero`)}
            </div>
            ${heroNote}
          </div>
        </div>
      </section>

${careFunnel}      <section class="section section-tinted" aria-labelledby="when-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="when-heading">When testing may be appropriate</h2>
            <p class="lead">Not every symptom requires laboratory testing. These are common reasons clinicians consider it.</p>
          </div>
          <ul class="scan-list">
                ${when}
          </ul>
        </div>
      </section>

      <section class="section" aria-labelledby="tests-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="tests-heading">Commonly discussed tests</h2>
            <p class="lead">Examples only—availability and panels vary on the storefront. Your clinician individualizes orders.</p>
          </div>
          <div class="why-choose-grid">
${tests}
          </div>
        </div>
      </section>

${starterSet}      <section class="${limitsSectionClass}" aria-labelledby="limits-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="limits-heading">What these tests cannot tell you</h2>
            <p class="lead">Clear limits protect you from false certainty.</p>
          </div>
          <ul class="scan-list">
                ${cannot}
          </ul>
          <p>${esc(page.whyInterpretation)}</p>
          <p class="cta-microcopy" style="margin-top:1.5rem;">${meetBtn(`labs-${page.slug}-guidance`, 'primary')}</p>
        </div>
      </section>

      <section class="section" aria-labelledby="related-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="related-heading">Related care &amp; reading</h2>
          </div>
          <div class="why-choose-grid">
            <article class="why-choose-card">
              <h3>Services</h3>
              <ul class="footer-links">
                ${services}
              </ul>
            </article>
            <article class="why-choose-card">
              <h3>Guides</h3>
              <ul class="footer-links">
                ${guides}
              </ul>
            </article>
            <article class="why-choose-card">
              <h3>More lab topics</h3>
              <ul class="footer-links">
              ${siblingLinks(page.slug)}
                <li><a href="/labs">All Labs &amp; Blood Tests</a></li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section class="section faq-accordion-section section-tinted" aria-labelledby="faq-heading">
        <div class="container">
          <div class="faq-accordion">
            <div class="faq-accordion-header">
              <h2 id="faq-heading">Frequently asked questions</h2>
            </div>
            <div class="faq-accordion-list">
${renderFaqAccordion(page.faqs, `faq-${page.slug}`)}
            </div>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="section cta-band" aria-labelledby="final-cta-heading">
        <div class="container">
          <h2 id="final-cta-heading">Browse tests—or talk it through</h2>
          <p class="lead">Transparent direct-pay pricing on the storefront. Physician guidance when you need help choosing or interpreting.</p>
          <div class="cta-band-buttons">
            ${storeBtn(`labs-${page.slug}-final`)}
            ${meetBtn(`labs-${page.slug}-final`)}
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p><a href="/labs">Labs &amp; Blood Tests</a> · © 2026 Siya Health Inc.</p>
      </div>
    </footer>
  </body>
</html>
`;
}

function topicHubMarkup() {
  const cards = LABS_TOPIC_PAGES.map((p) => {
    return `            <article class="why-choose-card">
              <h3><a href="${labsTopicPath(p.slug)}">${esc(p.h1)}</a></h3>
              <p>${esc(p.lead.slice(0, 140))}${p.lead.length > 140 ? '…' : ''}</p>
              <p class="cta-microcopy"><a href="${labsTopicPath(p.slug)}">Learn more</a></p>
            </article>`;
  }).join('\n');

  return `<!-- SIYA:LABS-TOPIC-HUB -->
      <section class="section section-tinted" id="lab-topics" aria-labelledby="lab-topics-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="lab-topics-heading">Explore labs by topic</h2>
            <p class="lead">Deeper guides that connect symptoms, Knowledge Products, and thoughtful testing—without turning labs into a catalogue.</p>
          </div>
          <div class="why-choose-grid">
${cards}
          </div>
        </div>
      </section>
      <!-- /SIYA:LABS-TOPIC-HUB -->`;
}

function injectHubIndex() {
  const hubPath = path.join(ROOT, 'labs.html');
  let html = fs.readFileSync(hubPath, 'utf8');
  const block = topicHubMarkup();

  if (html.includes('SIYA:LABS-TOPIC-HUB')) {
    html = html.replace(/<!-- SIYA:LABS-TOPIC-HUB -->[\s\S]*?<!-- \/SIYA:LABS-TOPIC-HUB -->/, block);
  } else if (html.includes('id="how-it-works"')) {
    html = html.replace(
      /(<section[^>]*id="how-it-works"[^>]*>)/,
      `${block}\n\n      $1`,
    );
  } else {
    html = html.replace('</main>', `      ${block}\n    </main>`);
  }

  const map = [
    ['Routine &amp; preventive', 'preventive'],
    ['Thyroid', 'thyroid'],
    ['Nutritional &amp; fatigue-related', 'fatigue-brain-fog'],
    ['Metabolic health', 'a1c-blood-sugar'],
    ['Women&rsquo;s midlife concerns', 'womens-midlife'],
    ['Men&rsquo;s health', 'mens-health'],
    ['ADHD evaluation support', 'adhd-support'],
  ];
  for (const [heading, slug] of map) {
    const link = `<p class="cta-microcopy"><a href="${labsTopicPath(slug)}">Learn more</a></p>`;
    if (html.includes(`href="${labsTopicPath(slug)}">Learn more</a>`)) continue;
    const re = new RegExp(`(<h3>${heading}</h3>\\s*<p>[\\s\\S]*?</p>)`, 'i');
    if (re.test(html)) {
      html = html.replace(re, `$1\n              ${link}`);
    }
  }

  fs.writeFileSync(hubPath, html);
  console.log('Updated labs.html topic hub index');
}

function writeHowToReadResultsPage() {
  const rel = 'labs/how-to-read-results.html';
  const canonical = 'https://siya.health/labs/how-to-read-results';
  const title = 'How to Read Your Lab Results | Siya Health';
  const description =
    'Got your results? Reference ranges don’t diagnose disease. Learn how to read labs calmly—and when to book interpretation with a Siya Health clinician.';
  const faqs = [
    {
      q: 'Does being outside the reference range mean I have a disease?',
      a: 'No. Reference ranges are statistical norms for a lab’s method and population—not automatic diagnoses. Mild outliers can be insignificant; “normal” results can still miss context. Interpretation belongs with a clinician who knows your history.',
    },
    {
      q: 'Should I panic about one abnormal number?',
      a: 'Usually not. One value is a data point. Clinicians look at trends, symptoms, medications, and related markers before deciding what matters.',
    },
    {
      q: 'Can Siya help if I already ordered labs elsewhere?',
      a: 'Yes. Bring prior results to a visit when appropriate. We can help put findings in clinical context and discuss next steps—without treating a portal screenshot as a diagnosis.',
    },
  ];
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/scripts/cookie-consent-bootstrap.js"></script>
<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <meta property="og:site_name" content="Siya Health" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${JSON.stringify(faqSchema(faqs))}</script>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
        { '@type': 'ListItem', position: 2, name: 'Labs & Blood Tests', item: 'https://siya.health/labs' },
        { '@type': 'ListItem', position: 3, name: 'How to read lab results', item: canonical },
      ],
    })}</script>
  </head>
  <body class="page-labs page-labs-topic page-service">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">®</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/mens-health-longevity">Men's Health</a>
          <a href="/labs">Labs</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          ${meetBtn('nav', 'primary')}
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/mens-health-longevity">Men's Health</a>
          <a href="/labs">Labs</a>
          <a href="/blog">Blog</a>
          ${meetBtn('nav-mobile', 'primary')}
        </div>
      </div>
    </header>

    <main id="main">
      <section class="hero-merged" style="background-image: url('/assets/images/healthy-lifestyle.png');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="hero-state-line"><a href="/labs">Labs &amp; Blood Tests</a> · Guide</p>
            <h1>How to Read Your Lab Results</h1>
            <p class="hero-merged-lead">Got your results? Don&rsquo;t panic. Reference ranges don&rsquo;t diagnose disease—and one number rarely tells the whole story.</p>
            <div class="hero-ctas hero-ctas-row">
              ${meetBtn('labs-how-to-read-hero', 'primary')}
              <a href="/labs" class="button ds-button ds-button--secondary secondary">Back to Labs hub</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-tinted">
        <div class="container">
          <div class="section-header">
            <h2>Start here</h2>
            <p class="lead">A calm frame for portal PDFs and storefront results.</p>
          </div>
          <ol class="scan-list">
            <li><strong>Got your results?</strong> Save the full report (not just screenshots of one line).</li>
            <li><strong>Don&rsquo;t panic.</strong> Mild flags are common and often need context—or a repeat.</li>
            <li><strong>Reference ranges aren&rsquo;t diagnoses.</strong> They describe a lab&rsquo;s statistical band, not your personal “healthy.”</li>
            <li><strong>Book interpretation</strong> when symptoms, history, or confusion deserve a clinician&rsquo;s read.</li>
          </ol>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>What “normal” and “abnormal” actually mean</h2>
          </div>
          <p>Most lab reports show a result next to a reference interval. That interval usually reflects where most values fall for the method and population the lab used—not a personalized target for you.</p>
          <p>A result slightly outside the interval can be meaningless. A result inside the interval can still matter if it doesn&rsquo;t fit your symptoms, medications, or prior trend. Numbers without history are incomplete.</p>
          <p>Siya Health can help you decide which findings deserve follow-up—and which ones do not require urgent worry.</p>
        </div>
      </section>

      <section class="section section-tinted">
        <div class="container">
          <div class="section-header">
            <h2>When to talk with a clinician</h2>
          </div>
          <ul class="scan-list">
            <li>You have symptoms that still don&rsquo;t make sense after reading the report</li>
            <li>Multiple markers are flagged, or values changed sharply from prior labs</li>
            <li>You ordered direct-pay labs and want help choosing what matters next</li>
            <li>You&rsquo;re unsure whether a supplement, lifestyle change, or further testing is appropriate</li>
          </ul>
          <p class="cta-microcopy" style="margin-top:1.25rem;">${meetBtn('labs-how-to-read-mid', 'primary')}</p>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-header">
            <h2>Related lab topics</h2>
          </div>
          <ul class="footer-links">
            <li><a href="/labs">All Labs &amp; Blood Tests</a></li>
            <li><a href="/labs/fatigue-brain-fog">Fatigue &amp; brain fog labs</a></li>
            <li><a href="/labs/thyroid">Thyroid testing</a></li>
            <li><a href="/labs/iron-ferritin">Iron &amp; ferritin</a></li>
            <li><a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar</a></li>
            <li><a href="/answers/why-normal-labs-dont-mean-healthy">Why normal labs don&rsquo;t mean healthy</a></li>
            <li><a href="/answers/which-preventive-blood-tests-adults">Which preventive blood tests adults need</a></li>
            <li><a href="/answers/what-to-do-after-lab-results">What to do after lab results</a></li>
          </ul>
        </div>
      </section>

      <section class="section faq-accordion-section section-tinted" aria-labelledby="faq-heading">
        <div class="container">
          <div class="faq-accordion">
            <div class="faq-accordion-header">
              <h2 id="faq-heading">Frequently asked questions</h2>
            </div>
            <div class="faq-accordion-list">
${renderFaqAccordion(faqs, 'faq-how-to-read')}
            </div>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="section cta-band" aria-labelledby="final-cta-heading">
        <div class="container">
          <h2 id="final-cta-heading">Ready for interpretation?</h2>
          <p class="lead">Bring your results. We&rsquo;ll help put them in clinical context—and plan next steps if needed.</p>
          <div class="cta-band-buttons">
            ${meetBtn('labs-how-to-read-final', 'primary')}
            ${storeBtn('labs-how-to-read-final', 'Browse Lab Tests', 'secondary')}
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p><a href="/labs">Labs &amp; Blood Tests</a> · © 2026 Siya Health Inc.</p>
      </div>
    </footer>
  </body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, rel), html);
  console.log('Wrote', rel);
}

function main() {
  fs.mkdirSync(LABS_DIR, { recursive: true });
  for (const page of LABS_TOPIC_PAGES) {
    const rel = labsTopicFile(page.slug);
    const full = path.join(ROOT, rel);
    fs.writeFileSync(full, renderPage(page));
    console.log('Wrote', rel);
  }
  writeHowToReadResultsPage();
  injectHubIndex();
  console.log(`Generated ${LABS_TOPIC_PAGES.length} labs topic pages + how-to-read guide`);
}

main();
