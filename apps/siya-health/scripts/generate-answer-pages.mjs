/**
 * Generates /answers/*.html citation pages from data/answer-seeds.mjs
 * Run before seo-build: node scripts/generate-answer-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS, TOPIC_HUBS } from '../data/answer-seeds.mjs';
import {
  BASE,
  LAST_REVIEWED,
  clinicalReviewBlock,
  formatReviewDate,
  physicianReviewedBy,
  resolveAnswerReviewRecord,
  REVIEW_STATUS,
} from './clinical-entity.mjs';
import { FOOTER_STATES_LINE } from '../data/site-standards.mjs';
import { MEET_GREET_URL, NAV_HEALTH_GUIDES } from './site-chrome.mjs';

/** UX hub groupings (display order) */
const HEALTH_GUIDE_CATEGORIES = [
  {
    id: 'metabolic',
    label: 'Metabolic Health',
    blurb: 'GLP-1, insulin resistance, food noise, and medical weight loss.',
    carePath: '/weight-loss-metabolic-health',
  },
  {
    id: 'energy',
    label: 'Energy & Fatigue',
    blurb: 'Sleep, burnout, and why rest does not always restore energy.',
    carePath: '/telehealth',
  },
  {
    id: 'hormone',
    label: 'Hormone Health',
    blurb: 'Testosterone, men\'s health, hair loss, and related telehealth care.',
    carePath: '/mens-health-longevity',
  },
  {
    id: 'adhd',
    label: 'ADHD & Focus',
    blurb: 'Evaluation, medication, screening, and adult ADHD education.',
    carePath: '/adhd-care',
  },
  {
    id: 'telehealth',
    label: 'Telehealth & Care',
    blurb: 'How online care works, Meet & Greet, prescriptions, and logistics.',
    carePath: '/telehealth',
  },
];

function guideCategoryForSeed(seed) {
  if (seed.slug === 'why-am-i-tired-even-after-sleeping') return 'energy';
  if (seed.topic === 'adhd') return 'adhd';
  if (seed.topic === 'mens-health') return 'hormone';
  if (seed.topic === 'telehealth') return 'telehealth';
  if (seed.topic === 'weight-loss') return 'metabolic';
  return 'telehealth';
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const ANSWERS_DIR = path.join(SITE_ROOT, 'answers');
const BOOK = 'https://link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function headBlock(title, description, url, jsonLdScripts) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PLBD4TTQ');</script>
    <!-- End Google Tag Manager -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-9WTQWHCTFT"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-9WTQWHCTFT');
  gtag('config', 'AW-17553537456');
</script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(description)}" />
    <link rel="canonical" href="${esc(url)}" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
${jsonLdScripts}
  </head>`;
}

function headerNav(topic = 'general') {
  const navCta =
    topic === 'adhd'
      ? `<a class="button" href="/adhd-screening">Start Free Screening</a>`
      : `<a class="button" href="${MEET_GREET_URL}" target="_blank" rel="noopener">Book a Meet &amp; Greet</a>`;
  return `    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo" href="/"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" /></a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="${NAV_HEALTH_GUIDES.path}">${NAV_HEALTH_GUIDES.label}</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          ${navCta}
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="${NAV_HEALTH_GUIDES.path}">${NAV_HEALTH_GUIDES.label}</a>
          <a href="/blog">Blog</a>
          ${navCta}
        </div>
      </div>
    </header>`;
}

function footerBlock() {
  return `    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-logo-col">
          <a href="/" class="footer-logo-link"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" class="footer-logo-img" /></a>
        </div>
        <div class="footer-brand">
          <p>${FOOTER_STATES_LINE}</p>
        </div>
        <div><h4>Services</h4><p><a href="${NAV_HEALTH_GUIDES.path}">${NAV_HEALTH_GUIDES.label}</a></p><p><a href="/adhd-care">ADHD Care</a></p><p><a href="/weight-loss-metabolic-health">Weight Loss</a></p><p><a href="/telehealth">Telehealth</a></p></div>
        <div><h4>Healthcare Services</h4><p><a href="/primary-urgent-care">Primary &amp; urgent care</a></p><p><a href="/labs">Diagnostic labs</a></p><p><a href="/prescriptions">Prescriptions</a></p></div>
        <div><h4>Contact</h4><p><a href="mailto:care@siya.health">care@siya.health</a></p><p><a href="tel:+12154451244">(215) 445-1244</a></p></div>
      </div>
      <div class="container"><p class="footer-notice">For emergencies, call 911. Educational content only—not medical advice for your specific situation.</p><small>© 2026 Siya Health Inc.</small></div>
    </footer>`;
}

function nextStepsHtml(hub, topic = 'general') {
  const items =
    topic === 'adhd'
      ? `<li><a href="/adhd-screening">Take a free 2-minute ADHD screening</a></li>
                <li><a href="/adult-adhd-diagnosis">Book a $199 adult ADHD evaluation</a></li>
                <li><a href="${hub.care}">Explore ${hub.label} care at Siya Health</a></li>`
      : `<li><a href="${MEET_GREET_URL}" target="_blank" rel="noopener">Book a Meet &amp; Greet</a></li>
                <li><a href="${hub.care}">Explore ${hub.label} care</a></li>
                <li><a href="/answers">Browse Health Guides</a></li>`;
  return `            <section class="answer-next-steps" id="next-steps" aria-labelledby="next-steps-heading">
              <h2 id="next-steps-heading">Next steps</h2>
              <ul class="answer-next-steps-list">
                ${items}
              </ul>
            </section>`;
}

function buildAnswerPage(seed) {
  const reviewRecord = resolveAnswerReviewRecord(seed.slug);
  const url = `${BASE}/answers/${seed.slug}`;
  const title = `${seed.question} | Siya Health`;
  const metaDesc = seed.shortAnswer.slice(0, 155) + (seed.shortAnswer.length > 155 ? '…' : '');
  const hub = TOPIC_HUBS[seed.topic] || TOPIC_HUBS.adhd;

  const relatedHtml = (seed.related || [])
    .map((s) => {
      const rel = ANSWER_SEEDS.find((x) => x.slug === s);
      if (!rel) return '';
      return `<li><a href="/answers/${rel.slug}">${esc(rel.question)}</a></li>`;
    })
    .filter(Boolean)
    .join('\n                ');

  const evidenceHtml = (seed.evidence || []).map((e) => `<li>${esc(e)}</li>`).join('\n              ');
  const detailHtml = seed.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n            ');

  const faqJson = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: seed.question,
        acceptedAnswer: { '@type': 'Answer', text: seed.shortAnswer + ' ' + seed.paragraphs.join(' ') },
      },
    ],
  };

  const medicalWebPage = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: seed.question,
    description: seed.shortAnswer,
    url,
    dateModified: reviewRecord.reviewDate || LAST_REVIEWED,
    publisher: { '@type': 'MedicalOrganization', name: 'Siya Health', url: BASE },
    about: { '@type': 'MedicalCondition', name: seed.topic === 'adhd' ? 'Attention Deficit Hyperactivity Disorder' : 'Medical Condition' },
  };
  if (reviewRecord.status === REVIEW_STATUS.CLINICALLY_REVIEWED && reviewRecord.reviewer) {
    medicalWebPage.reviewedBy = physicianReviewedBy(reviewRecord.reviewer);
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Health Guides', item: `${BASE}/answers` },
      { '@type': 'ListItem', position: 3, name: seed.question, item: url },
    ],
  };

  const jsonLd = `
    <script type="application/ld+json">${JSON.stringify(faqJson)}</script>
    <script type="application/ld+json">${JSON.stringify(medicalWebPage)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>`;

  return `${headBlock(title, metaDesc, url, jsonLd)}
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PLBD4TTQ"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
${headerNav(seed.topic)}
    <main id="main">
      <article class="blog-article answer-page">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="/answers">${NAV_HEALTH_GUIDES.label}</a> · <a href="${hub.url}">${hub.label}</a></p>
            <h1>${esc(seed.question)}</h1>
          </header>
          <div class="blog-content">
            <p class="blog-disclaimer"><strong>Educational only:</strong> This page is for general education—not personal medical advice, diagnosis, or treatment. See a licensed clinician for your situation.</p>
${clinicalReviewBlock(reviewRecord)}
            <section class="answer-short" id="short-answer" aria-labelledby="short-answer-heading">
              <h2 id="short-answer-heading">Short answer</h2>
              <p class="answer-lead">${esc(seed.shortAnswer)}</p>
            </section>
            <section class="answer-detailed" id="detailed-answer" aria-labelledby="detailed-answer-heading">
              <h2 id="detailed-answer-heading">Detailed answer</h2>
            ${detailHtml}
            </section>
            <section class="answer-evidence" id="evidence" aria-labelledby="evidence-heading">
              <h2 id="evidence-heading">Evidence &amp; references</h2>
              <ul>${evidenceHtml}</ul>
            </section>
            <section class="answer-related" id="related-questions" aria-labelledby="related-heading">
              <h2 id="related-heading">Related questions</h2>
              <ul>
                ${relatedHtml}
              </ul>
            </section>
${nextStepsHtml(hub, seed.topic)}
            <div class="cta-block blog-cta">
              <a class="button" href="${BOOK}" target="_blank" rel="noopener">Book a Meet &amp; Greet</a>
              <a class="button secondary" href="${hub.care}">Explore ${hub.label} care</a>
            </div>
            <p class="cta-microcopy">Also read our <a href="${hub.url}">${hub.label} articles</a>${seed.cornerstoneBlog ? ` · <a href="${seed.cornerstoneBlog}">Full clinical guide</a>` : ''}${reviewRecord.reviewer ? ` · <a href="/providers/${reviewRecord.reviewer.slug}">${reviewRecord.reviewer.name}</a>` : ''}</p>
          </div>
        </div>
      </article>
    </main>
${footerBlock()}
  </body>
</html>
`;
}

function buildIndexPage() {
  const byCategory = Object.fromEntries(HEALTH_GUIDE_CATEGORIES.map((c) => [c.id, []]));
  for (const s of ANSWER_SEEDS) {
    const cat = guideCategoryForSeed(s);
    byCategory[cat].push(s);
  }

  const cards = HEALTH_GUIDE_CATEGORIES.map((cat) => {
    const seeds = byCategory[cat.id] || [];
    const preview = seeds.slice(0, 4);
    const more = seeds.length - preview.length;
    return `
          <article class="health-guides-card" id="guides-${cat.id}">
            <header class="health-guides-card-header">
              <h2>${esc(cat.label)}</h2>
              <p class="health-guides-card-blurb">${esc(cat.blurb)}</p>
              <p class="health-guides-card-meta"><span class="health-guides-count">${seeds.length}</span> guides</p>
            </header>
            <ul class="health-guides-card-list">
              ${preview.map((s) => `<li><a href="/answers/${s.slug}">${esc(s.question)}</a></li>`).join('\n              ')}
              ${more > 0 ? `<li class="health-guides-more"><a href="#guides-${cat.id}-all">+ ${more} more in this category</a></li>` : ''}
            </ul>
            ${more > 0 ? `<ul class="health-guides-card-list health-guides-card-list--all" id="guides-${cat.id}-all" hidden>
              ${seeds.slice(4).map((s) => `<li><a href="/answers/${s.slug}">${esc(s.question)}</a></li>`).join('\n              ')}
            </ul>` : ''}
            <p class="health-guides-card-cta"><a href="${cat.carePath}">Explore ${esc(cat.label)} care →</a></p>
          </article>`;
  }).join('\n');

  const url = `${BASE}/answers`;
  const title = 'Health Guides | Metabolic, ADHD, Hormones & Telehealth | Siya Health';
  const desc =
    'Physician-led Health Guides: short answers, evidence, and related topics for metabolic health, fatigue, hormones, ADHD, and telehealth. Each page shows its clinical review status.';

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Siya Health Health Guides Hub',
    description: desc,
    url,
    numberOfItems: ANSWER_SEEDS.length,
  };

  const jsonLd = `\n    <script type="application/ld+json">${JSON.stringify(collection)}</script>
    <script>
      document.querySelectorAll('.health-guides-more a').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const id = link.getAttribute('href').slice(1);
          const list = document.getElementById(id);
          if (list) {
            list.hidden = false;
            link.closest('li')?.remove();
          }
        });
      });
    </script>`;

  return `${headBlock(title, desc, url, jsonLd)}
  <body>
${headerNav()}
    <main id="main">
      <section class="section blog-index health-guides-hub" style="padding-top: 120px;">
        <div class="container">
          <div class="section-header">
            <h1>Health Guides</h1>
            <p class="lead">One question per page—short answer, detailed explanation, evidence, and related questions. Reviewed pages display physician name and date; others show pending physician review. <a href="/llms.txt">Machine index</a> · <a href="/article-index.json">JSON index</a></p>
          </div>
          <div class="health-guides-hub-grid">
${cards}
          </div>
        </div>
      </section>
    </main>
${footerBlock()}
  </body>
</html>
`;
}

function main() {
  fs.mkdirSync(ANSWERS_DIR, { recursive: true });
  for (const seed of ANSWER_SEEDS) {
    const out = path.join(ANSWERS_DIR, `${seed.slug}.html`);
    fs.writeFileSync(out, buildAnswerPage(seed), 'utf8');
  }
  fs.writeFileSync(path.join(ANSWERS_DIR, 'index.html'), buildIndexPage(), 'utf8');
  console.log('Wrote', ANSWER_SEEDS.length, 'answer pages + answers/index.html');
}

main();
