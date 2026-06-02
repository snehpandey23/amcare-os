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
  clinicalReviewHtml,
  formatReviewDate,
  getProviderBySlug,
  physicianReviewedBy,
} from './clinical-entity.mjs';

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

function headerNav() {
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
          <a href="/answers">Answers</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          <a class="button" href="/adhd-screening?adhd=1">Start Free Screening</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/answers">Answers</a>
          <a href="/blog">Blog</a>
          <a class="button" href="/adhd-screening?adhd=1">Start Free Screening</a>
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
          <p>Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida.</p>
        </div>
        <div><h4>Services</h4><p><a href="/adhd-care">ADHD Care</a></p><p><a href="/answers">Clinical answers</a></p><p><a href="/weight-loss-metabolic-health">Weight Loss</a></p></div>
        <div><h4>Contact</h4><p><a href="mailto:care@siya.health">care@siya.health</a></p><p><a href="tel:+12154451244">(215) 445-1244</a></p></div>
      </div>
      <div class="container"><p class="footer-notice">For emergencies, call 911. Educational content only—not medical advice for your specific situation.</p><small>© 2026 Siya Health Inc.</small></div>
    </footer>`;
}

function buildAnswerPage(seed) {
  const reviewer = getProviderBySlug(seed.reviewerSlug) || getProviderBySlug('dr-sneh-pandey');
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
    dateModified: LAST_REVIEWED,
    reviewedBy: physicianReviewedBy(reviewer),
    publisher: { '@type': 'MedicalOrganization', name: 'Siya Health', url: BASE },
    about: { '@type': 'MedicalCondition', name: seed.topic === 'adhd' ? 'Attention Deficit Hyperactivity Disorder' : 'Medical Condition' },
  };

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Answers', item: `${BASE}/answers` },
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
${headerNav()}
    <main id="main">
      <article class="blog-article answer-page">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="/answers">Clinical answers</a> · <a href="${hub.url}">${hub.label}</a></p>
            <h1>${esc(seed.question)}</h1>
          </header>
          <div class="blog-content">
            <p class="blog-disclaimer"><strong>Educational only:</strong> This page is for general education—not personal medical advice, diagnosis, or treatment. See a licensed clinician for your situation.</p>
${clinicalReviewHtml(reviewer)}
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
            <div class="cta-block blog-cta">
              <a class="button" href="${hub.care}">Explore ${hub.label} care</a>
              <a class="button secondary" href="${BOOK}" target="_blank" rel="noopener">Schedule Meet &amp; Greet</a>
            </div>
            <p class="cta-microcopy">Also read our <a href="${hub.url}">${hub.label} articles</a> · <a href="/providers/${reviewer.slug}">${reviewer.name}</a></p>
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
  const byTopic = {};
  for (const s of ANSWER_SEEDS) {
    byTopic[s.topic] = byTopic[s.topic] || [];
    byTopic[s.topic].push(s);
  }

  let sections = '';
  for (const [topic, seeds] of Object.entries(byTopic)) {
    const hub = TOPIC_HUBS[topic];
    sections += `
          <section class="answer-hub-section">
            <h2>${esc(hub.label)}</h2>
            <ul class="answer-hub-list">
              ${seeds.map((s) => `<li><a href="/answers/${s.slug}">${esc(s.question)}</a></li>`).join('\n              ')}
            </ul>
            <p class="blog-hub-see-all"><a href="${hub.url}">More ${hub.label.toLowerCase()} articles →</a></p>
          </section>`;
  }

  const url = `${BASE}/answers`;
  const title = 'Clinical Answers Hub | ADHD, Weight Loss & Telehealth | Siya Health';
  const desc =
    'Direct answers to common ADHD, GLP-1, testosterone, and telehealth questions—medically reviewed by Siya Health physicians. Optimized for clarity and clinical accuracy.';

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Siya Health Clinical Answers',
    description: desc,
    url,
    numberOfItems: ANSWER_SEEDS.length,
  };

  const jsonLd = `\n    <script type="application/ld+json">${JSON.stringify(collection)}</script>`;

  return `${headBlock(title, desc, url, jsonLd)}
  <body>
${headerNav()}
    <main id="main">
      <section class="section blog-index" style="padding-top: 120px;">
        <div class="container">
          <div class="section-header">
            <h1>Clinical answers</h1>
            <p class="lead">One question per page—short answer, detailed explanation, evidence, and related questions. Medically reviewed by Siya Health physicians. <a href="/llms.txt">Machine index</a> · <a href="/article-index.json">JSON index</a></p>
          </div>
${sections}
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
