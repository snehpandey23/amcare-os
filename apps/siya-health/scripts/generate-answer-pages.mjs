/**
 * Generates /answers/*.html citation pages from data/answer-seeds.mjs
 * Run before seo-build: node scripts/generate-answer-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyPricingTokens } from '../data/pricing-display.mjs';
import { ANSWER_SEEDS, TOPIC_HUBS } from '../data/answer-seeds.mjs';
import { RETIRED_GUIDE_SLUGS } from '../data/content-consolidation-phase1.mjs';
import { GUIDE_CANNIBALIZATION_OVERRIDES } from '../data/cannibalization-phase1.mjs';
import {
  ADHD_TOPIC_CLUSTERS,
  ASK_SIYA_CHAT_PATH,
  BLOG_CLUSTER_ANCHORS,
  clusterForGuide,
  METABOLIC_TOPIC_CLUSTERS,
  ENERGY_TOPIC_CLUSTERS,
  resolveAnswerInternalLinks,
} from '../data/content-topic-clusters.mjs';
import {
  BASE,
  LAST_REVIEWED,
  clinicalReviewBlock,
  formatReviewDate,
  physicianReviewedBy,
  resolveAnswerReviewRecord,
  REVIEW_STATUS,
} from './clinical-entity.mjs';
import { COPY_STANDARDS, FOOTER_STATES_LINE } from '../data/site-standards.mjs';
import { buildHealthGuideEngagement } from './answer-engagement-system.mjs';
import { BOOKING_LINK } from '../data/providers-core.mjs';
import { MEET_GREET_URL, NAV_HEALTH_GUIDES } from './site-chrome.mjs';
import { renderNavCtaMarkup, renderButton, slotToButton, resolveConversion } from '../design-system/components.mjs';
import { ANSWER_DIAGRAM_EMBEDS, renderDiagramFigure } from '../data/visual-diagrams.mjs';
import { SIYA_CIRCLE_PROMO_HTML } from '../data/siya-circle-config.mjs';
import { renderAnswersHubCarePathwaysSection } from '../data/adhd-commercial-links.mjs';

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
    blurb: 'How online care works, telehealth visits, prescriptions, and logistics.',
    carePath: '/telehealth',
  },
];

/** Featured on hub (exactly 3 per category; remainder behind “View all”) */
const FEATURED_BY_CATEGORY = {
  metabolic: [
    'why-normal-labs-dont-mean-healthy',
    'which-preventive-blood-tests-adults',
    'what-to-do-after-lab-results',
  ],
  energy: [
    'afternoon-energy-crash-after-lunch',
    'poor-sleep-feels-like-adhd',
    'why-am-i-tired-even-after-sleeping',
  ],
  hormone: [
    'high-shbg-low-free-testosterone',
    'what-is-free-testosterone',
    'what-does-low-testosterone-feel-like',
  ],
  adhd: ['signs-of-adult-adhd', 'how-long-adhd-evaluation', 'can-adhd-be-diagnosed-online'],
  telehealth: ['is-telehealth-legitimate', 'meet-and-greet-telehealth-expectations', 'how-online-prescriptions-work'],
};

const CATEGORY_ICONS = {
  metabolic: '◆',
  energy: '◎',
  hormone: '△',
  adhd: '▣',
  telehealth: '◇',
};

function categoriesForSeed(seed) {
  if (seed.hubCategories?.length) return seed.hubCategories;
  return [guideCategoryForSeed(seed)];
}

function guideCategoryForSeed(seed) {
  if (seed.hubCategories?.length) return seed.hubCategories[0];
  if (
    seed.slug === 'brain-fog-after-eating' ||
    seed.slug === 'why-normal-labs-dont-mean-healthy' ||
    seed.slug === 'food-noise-returned-on-glp-1' ||
    seed.slug === 'weight-gain-after-stopping-ozempic'
  ) {
    return 'metabolic';
  }
  if (
    seed.slug === 'afternoon-energy-crash-after-lunch' ||
    seed.slug === 'why-am-i-tired-even-after-sleeping' ||
    seed.slug === 'can-sleep-apnea-cause-fatigue' ||
    seed.slug === 'signs-of-sleep-apnea-in-adults' ||
    seed.slug === 'poor-sleep-feels-like-adhd'
  ) {
    return 'energy';
  }
  if (seed.slug === 'high-shbg-low-free-testosterone') return 'hormone';
  if (seed.topic === 'adhd') return 'adhd';
  if (seed.topic === 'mens-health') return 'hormone';
  if (seed.topic === 'telehealth') return 'telehealth';
  if (seed.topic === 'weight-loss') return 'metabolic';
  return 'telehealth';
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const ANSWERS_DIR = path.join(SITE_ROOT, 'answers');
const BOOK = BOOKING_LINK;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function resolveCanonicalBlog(seed) {
  const raw = seed.canonicalBlog || seed.cornerstoneBlog;
  if (!raw) return null;
  if (typeof raw === 'string') {
    return { path: raw, label: 'Read the full clinical guide' };
  }
  return raw;
}

function applyCannibalizationOverrides(seed) {
  const patch = GUIDE_CANNIBALIZATION_OVERRIDES[seed.slug];
  if (!patch) return seed;
  return { ...seed, ...patch };
}

function canonicalBlogTopHtml(seed) {
  const cb = resolveCanonicalBlog(seed);
  if (!cb) return '';
  return `            <aside class="answer-canonical-pointer" role="note" aria-label="Full clinical guide">
              <p><strong>Quick FAQ.</strong> This page answers one focused question. For in-depth evidence, treatment discussion, and care pathways, see <a href="${esc(cb.path)}">${esc(cb.label)}</a>.</p>
            </aside>`;
}

function canonicalBlogFullHtml(seed) {
  const cb = resolveCanonicalBlog(seed);
  if (!cb) return '';
  return `            <section class="answer-full-guide-cta" id="full-guide" aria-labelledby="full-guide-heading">
              <h2 id="full-guide-heading">Read the full guide</h2>
              <p>This Health Guide is scoped for a single FAQ-style question. Our clinical article goes deeper on evidence, risks, monitoring, and what to discuss with your clinician.</p>
              <p><a class="button secondary" href="${esc(cb.path)}">${esc(cb.label)}</a></p>
            </section>`;
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

function headerNav(topic = 'general', slug = 'index') {
  const relPath = slug === 'index' ? 'answers/index.html' : `answers/${slug}.html`;
  const navCta = renderNavCtaMarkup(relPath, 'nav');
  const mobileCta = renderNavCtaMarkup(relPath, 'nav-mobile');
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
          ${mobileCta}
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
      ? `<li><a href="/adhd-care">Explore ADHD evaluation pathways</a></li>
                <li><a href="/adhd-screening">Free ADHD screening (not a diagnosis)</a></li>
                <li><a href="/answers/signs-of-adult-adhd">Cornerstone guide: signs of adult ADHD</a></li>
                <li><a href="/blog/how-to-know-if-you-have-adhd-adult">Cornerstone article: ADHD signs in adults</a></li>
                <li><a href="${hub.url}">Browse ${hub.label} articles</a></li>
                <li><a href="/answers#topic-cluster-explorer-heading">All ADHD topic clusters</a></li>`
      : `<li><a href="${hub.care}">Explore ${hub.label} care</a></li>
                <li><a href="/answers">Browse Health Guides</a></li>
                <li><a href="/providers">Meet our care team</a></li>`;
  return `            <section class="answer-next-steps" id="next-steps" aria-labelledby="next-steps-heading">
              <h2 id="next-steps-heading">Next steps</h2>
              <ul class="answer-next-steps-list">
                ${items}
              </ul>
            </section>`;
}

function buildSectionsHtml(seed, midBreakHtml = '') {
  if (seed.sections?.length) {
    return seed.sections
      .map((s, index) => {
        const id = s.id || s.heading.toLowerCase().replace(/\W+/g, '-').slice(0, 40);
        const paras = (s.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('\n            ');
        const list = s.listItems?.length
          ? `<ul class="answer-section-list">\n                ${s.listItems.map((li) => `<li>${esc(li)}</li>`).join('\n                ')}\n              </ul>`
          : '';
        const midAfterIndex = seed.sections.length > 1 ? 1 : 0;
        const mid = index === midAfterIndex && midBreakHtml ? `\n${midBreakHtml}\n` : '';
        return `            <section class="answer-section" id="${id}" aria-labelledby="${id}-heading">
              <h2 id="${id}-heading">${esc(s.heading)}</h2>
            ${paras}
            ${list}
            </section>${mid}`;
      })
      .join('\n');
  }
  const paras = (seed.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('\n            ');
  return `            <section class="answer-detailed" id="detailed-answer" aria-labelledby="detailed-answer-heading">
              <h2 id="detailed-answer-heading">Detailed answer</h2>
            ${paras}
            </section>`;
}

function guideLabel(slug) {
  const seed = ANSWER_SEEDS.find((s) => s.slug === slug);
  return seed?.question || slug.replace(/-/g, ' ');
}

function blogLabel(path) {
  return BLOG_CLUSTER_ANCHORS[path] || path.replace(/^\/blog\//, '').replace(/-/g, ' ');
}

function buildAnswerInternalLinksHtml(seed) {
  const canonical = resolveCanonicalBlog(seed);
  const links = resolveAnswerInternalLinks(seed, canonical);
  const relatedLis = links.relatedSlugs
    .map((slug) => `<li><a href="/answers/${slug}">${esc(guideLabel(slug))}</a></li>`)
    .join('\n                ');

  return `            <section class="answer-internal-links" id="related-resources" aria-labelledby="answer-links-heading">
              <h2 id="answer-links-heading">Related resources</h2>
              <p class="answer-internal-links-intro">This page is a concise FAQ. For clinical depth, start with the full article below.</p>
              <div class="answer-internal-links-grid">
                <div class="answer-internal-links-col">
                  <h3 class="answer-internal-links-col-title">Related questions</h3>
                  <ul>
                ${relatedLis}
                  </ul>
                </div>
                <div class="answer-internal-links-col">
                  <h3 class="answer-internal-links-col-title">Clinical article</h3>
                  <p><a class="answer-internal-links-primary" href="${links.blogPath}">${esc(links.blogLabel)}</a></p>
                </div>
                <div class="answer-internal-links-col">
                  <h3 class="answer-internal-links-col-title">Care</h3>
                  <p><a class="answer-internal-links-primary" href="${links.landingPath}">${esc(links.landingLabel)}</a></p>
                </div>
              </div>
            </section>
            <aside class="answer-ask-siya" aria-label="Ask Siya">
              <p>Still have a question? <a href="${ASK_SIYA_CHAT_PATH}" data-siya-track="primary-cta-click" data-siya-location="answer-ask-siya" data-conversion-goal="secureChat">Ask Siya</a>.</p>
            </aside>`;
}

function buildIndexClusterExplorerHtml() {
  const renderClusterGroup = (title, clusters) => {
    const cards = clusters
      .map((c) => {
        const guideCount = c.guides.length;
        const blogCount = c.blogs.length;
        return `
            <article class="topic-cluster-card" id="cluster-${c.id}">
              <h3><a href="/answers/${c.cornerstoneGuide}">${esc(c.name)}</a></h3>
              <p>${esc(c.blurb)}</p>
              <ul class="topic-cluster-card-links">
                <li><a href="/answers/${c.cornerstoneGuide}">Cornerstone guide →</a></li>
                <li><a href="${c.cornerstoneBlog}">Cornerstone article →</a></li>
                <li><a href="${c.service}">Service page →</a></li>
                ${c.screening ? `<li><a href="${c.screening}">Free screening →</a></li>` : ''}
              </ul>
              <p class="topic-cluster-card-meta">${guideCount} guides · ${blogCount} articles</p>
            </article>`;
      })
      .join('\n');
    return `
          <section class="topic-cluster-explorer-group" aria-labelledby="cluster-group-${title.replace(/\W+/g, '-').toLowerCase()}">
            <h2 id="cluster-group-${title.replace(/\W+/g, '-').toLowerCase()}">${esc(title)}</h2>
            <div class="topic-cluster-explorer-grid">
${cards}
            </div>
          </section>`;
  };

  return `<!-- SIYA:ANSWERS-TOPIC-CLUSTERS -->
          <section class="topic-cluster-explorer" aria-labelledby="topic-cluster-explorer-heading">
            <div class="section-header">
              <h2 id="topic-cluster-explorer-heading">Browse by topic cluster</h2>
              <p class="lead">Each cluster links a cornerstone Health Guide, supporting FAQs, related clinical articles, and the right care pathway—so informational pages reinforce each other instead of competing.</p>
            </div>
${renderClusterGroup('ADHD', ADHD_TOPIC_CLUSTERS)}
${renderClusterGroup('Metabolic health', METABOLIC_TOPIC_CLUSTERS)}
${renderClusterGroup('Energy & sleep', ENERGY_TOPIC_CLUSTERS)}
          </section>
          <!-- /SIYA:ANSWERS-TOPIC-CLUSTERS -->`;
}

function buildLearnMoreHtml(seed) {
  if (!seed.learnMore?.length) return '';
  const items = seed.learnMore
    .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`)
    .join('\n                ');
  return `            <section class="answer-learn-more" id="learn-more" aria-labelledby="learn-more-heading">
              <h2 id="learn-more-heading">Clinical guides &amp; care</h2>
              <ul>
                ${items}
              </ul>
            </section>`;
}

function buildFaqJson(seed) {
  const bodyText = [
    seed.shortAnswer,
    ...(seed.paragraphs || []),
    ...(seed.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.listItems || [])]),
  ].join(' ');
  const entities = [
    {
      '@type': 'Question',
      name: seed.question,
      acceptedAnswer: { '@type': 'Answer', text: bodyText.slice(0, 5000) },
    },
  ];
  for (const faq of seed.faqs || []) {
    entities.push({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    });
  }
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: entities };
}

function buildAnswerPage(seed) {
  const reviewRecord = resolveAnswerReviewRecord(seed.slug);
  const url = `${BASE}/answers/${seed.slug}`;
  const title = `${seed.question} | Siya Health`;
  const metaDesc =
    (seed.metaDescription || seed.shortAnswer).slice(0, 155) +
    ((seed.metaDescription || seed.shortAnswer).length > 155 ? '…' : '');
  const hub = TOPIC_HUBS[seed.topic] || TOPIC_HUBS.adhd;

  const evidenceHtml = (seed.evidence || []).map((e) => `<li>${esc(e)}</li>`).join('\n              ');
  const engagement = buildHealthGuideEngagement(seed);
  const sectionsHtml = buildSectionsHtml(seed, engagement.midBreak);
  const shortBodyExtra =
    !seed.sections?.length && engagement.takeaway
      ? `\n            ${engagement.takeaway}\n            ${engagement.midBreak}`
      : '';
  // Only emit learnMore for labs-funnel guides (avoids regenerating duplicate link blocks sitewide).
  const learnMoreHtml = ['which-preventive-blood-tests-adults', 'what-to-do-after-lab-results'].includes(
    seed.slug
  )
    ? buildLearnMoreHtml(seed)
    : '';
  const diagramConfig = ANSWER_DIAGRAM_EMBEDS[seed.slug];
  const diagramHtml = diagramConfig
    ? `\n${renderDiagramFigure(diagramConfig.key, { figcaption: diagramConfig.figcaption })}\n`
    : '';
  const faqJson = buildFaqJson(seed);
  const answerRelPath = `answers/${seed.slug}.html`;
  const answerCtaBtn = renderButton({
    ...slotToButton(resolveConversion(answerRelPath).primary, { location: 'answer-final-cta', relPath: answerRelPath }),
    variant: 'primary',
  });

  const medicalWebPage = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: seed.question,
    description: seed.shortAnswer,
    url,
    dateModified: reviewRecord.reviewDate || LAST_REVIEWED,
    publisher: { '@type': 'MedicalOrganization', name: 'Siya Health', url: BASE },
    about: {
      '@type': 'MedicalCondition',
      name: seed.aboutCondition || (seed.topic === 'adhd' ? 'Attention Deficit Hyperactivity Disorder' : 'Medical Condition'),
    },
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
${headerNav(seed.topic, seed.slug)}
    <main id="main">
      <article class="blog-article answer-page">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="/answers">${NAV_HEALTH_GUIDES.label}</a> · <a href="${hub.url}">${hub.label}</a></p>
            <h1>${esc(seed.question)}</h1>
          </header>
          <div class="blog-content">
            <p class="blog-disclaimer"><strong>Educational only:</strong> This page is for general education—not personal medical advice, diagnosis, or treatment. See a licensed clinician for your situation.</p>
${diagramHtml}${canonicalBlogTopHtml(seed)}
${clinicalReviewBlock(reviewRecord)}
            <section class="answer-short" id="short-answer" aria-labelledby="short-answer-heading">
              <h2 id="short-answer-heading">Short answer</h2>
              <p class="answer-lead">${esc(seed.shortAnswer)}</p>
            </section>
${engagement.aboveFold}
${sectionsHtml}${shortBodyExtra}
${engagement.decisionSupport}
            <section class="answer-evidence" id="evidence" aria-labelledby="evidence-heading">
              <h2 id="evidence-heading">Evidence &amp; references</h2>
${engagement.evidenceCard}
              <ul class="answer-evidence-list">${evidenceHtml}</ul>
            </section>
${learnMoreHtml}
${buildAnswerInternalLinksHtml(seed)}
            <div class="cta-block blog-cta answer-final-cta">
              ${answerCtaBtn}
            </div>
            <p class="cta-microcopy">Browse <a href="/answers">all Health Guides</a> · <a href="${hub.url}">${hub.label} articles</a>${reviewRecord.reviewer ? ` · <a href="/providers/${reviewRecord.reviewer.slug}">${reviewRecord.reviewer.name}</a>` : ''}</p>
          </div>
        </div>
      </article>
    </main>
${footerBlock()}
  </body>
</html>
`;
}

function guideOneLiner(seed) {
  const t = seed.shortAnswer || '';
  return t.length > 118 ? `${t.slice(0, 115)}…` : t;
}

function featuredSeedsForCategory(catId, allSeeds) {
  const slugs = FEATURED_BY_CATEGORY[catId] || [];
  const picked = [];
  const used = new Set();
  for (const slug of slugs) {
    const s = allSeeds.find((x) => x.slug === slug);
    if (s) {
      picked.push(s);
      used.add(s.slug);
    }
  }
  for (const s of allSeeds) {
    if (picked.length >= 3) break;
    if (!used.has(s.slug)) {
      picked.push(s);
      used.add(s.slug);
    }
  }
  return picked;
}

function featureCardHtml(seed, catId) {
  return `
              <article class="health-guide-feature-card">
                <span class="health-guide-feature-icon health-guide-feature-icon--${catId}" aria-hidden="true">${CATEGORY_ICONS[catId] || '•'}</span>
                <h3 class="health-guide-feature-title"><a href="/answers/${seed.slug}">${esc(seed.question)}</a></h3>
                <p class="health-guide-feature-desc">${esc(guideOneLiner(seed))}</p>
                <p class="health-guide-feature-link"><a href="/answers/${seed.slug}">Read guide →</a></p>
              </article>`;
}

function placeholderCardHtml(catId) {
  return `
              <article class="health-guide-feature-card health-guide-feature-card--placeholder">
                <span class="health-guide-feature-icon health-guide-feature-icon--${catId}" aria-hidden="true">${CATEGORY_ICONS[catId] || '•'}</span>
                <h3 class="health-guide-feature-title">More guides coming soon</h3>
                <p class="health-guide-feature-desc">We are adding physician-reviewed guides in this category.</p>
              </article>`;
}

function buildIndexPage() {
  const byCategory = Object.fromEntries(HEALTH_GUIDE_CATEGORIES.map((c) => [c.id, []]));
  const activeSeeds = ANSWER_SEEDS.filter((s) => !RETIRED_GUIDE_SLUGS.has(s.slug));
  for (const s of activeSeeds) {
    for (const cat of categoriesForSeed(s)) {
      if (!byCategory[cat].some((x) => x.slug === s.slug)) {
        byCategory[cat].push(s);
      }
    }
  }

  const cards = HEALTH_GUIDE_CATEGORIES.map((cat) => {
    const seeds = byCategory[cat.id] || [];
    const featured = featuredSeedsForCategory(cat.id, seeds);
    const featuredSlugs = new Set(featured.map((s) => s.slug));
    const rest = seeds.filter((s) => !featuredSlugs.has(s.slug));
    const featureSlots = [
      ...featured.map((s) => featureCardHtml(s, cat.id)),
      ...Array.from({ length: Math.max(0, 3 - featured.length) }, () => placeholderCardHtml(cat.id)),
    ].join('\n');
    const restList =
      rest.length > 0
        ? `<ul class="health-guides-category-all-list" id="guides-${cat.id}-all-list">
              ${rest.map((s) => `<li><a href="/answers/${s.slug}">${esc(s.question)}</a></li>`).join('\n              ')}
            </ul>`
        : '';
    return `
          <section class="health-guides-category" id="guides-${cat.id}" aria-labelledby="guides-${cat.id}-heading">
            <header class="health-guides-category-header">
              <h2 id="guides-${cat.id}-heading">${esc(cat.label)}</h2>
              <p class="health-guides-category-blurb">${esc(cat.blurb)}</p>
              <p class="health-guides-category-meta"><span class="health-guides-count">${seeds.length}</span> guides</p>
            </header>
            <div class="health-guides-featured-grid">
${featureSlots}
            </div>
            <div class="health-guides-category-actions">
              ${rest.length > 0 ? `<a class="button secondary health-guides-view-all" href="#guides-${cat.id}-all" data-category="${cat.id}">View all ${esc(cat.label)} guides</a>` : ''}
              <a class="health-guides-care-link" href="${cat.carePath}">${COPY_STANDARDS.secondaryCta} →</a>
            </div>
            ${rest.length > 0 ? `<div class="health-guides-category-all" id="guides-${cat.id}-all" hidden>
              <h3 class="health-guides-category-all-heading">All ${esc(cat.label)} guides</h3>
              ${restList}
            </div>` : ''}
          </section>`;
  }).join('\n');

  const url = `${BASE}/answers`;
  const title = 'Health Guides | Metabolic, ADHD, Hormones & Telehealth | Siya Health';
  const desc =
    'Physician-led Health Guides: short answers, evidence, and related topics for metabolic health, fatigue, hormones, ADHD, and telehealth.';

  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Siya Health Health Guides Hub',
    description: desc,
    url,
    numberOfItems: activeSeeds.length,
  };

  const jsonLd = `\n    <script type="application/ld+json">${JSON.stringify(collection)}</script>`;

  /* Must run after DOM exists — previously this lived in <head> and never attached listeners,
     so “View all … guides” buttons looked dead (hash target is hidden). */
  const hubViewAllScript = `
    <script>
      document.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('.health-guides-view-all');
        if (!btn) return;
        var href = btn.getAttribute('href') || '';
        var id = href.charAt(0) === '#' ? href.slice(1) : '';
        var panel = id && document.getElementById(id);
        if (!panel) return;
        e.preventDefault();
        var open = panel.hidden;
        panel.hidden = !open;
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        var label = btn.textContent || '';
        btn.textContent = open
          ? label.replace(/^View all/, 'Hide')
          : label.replace(/^Hide/, 'View all');
        if (typeof window.siyaTrack === 'function') {
          window.siyaTrack('health_guides_click', {
            action: open ? 'view_all' : 'hide_all',
            category: btn.getAttribute('data-category') || '',
            page_path: location.pathname,
          });
        }
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
            <p class="lead">Each guide answers one question with a short takeaway, a deeper explanation, cited evidence, and related topics—written for adults researching ADHD, metabolic health, hormones, fatigue, and telehealth. Educational only; not a substitute for care with your clinician.</p>
            <p class="health-guides-hub-jump-links"><a href="#topic-cluster-explorer-heading">Topic clusters</a> · <a href="#guides-adhd">ADHD guides</a> · <a href="#guides-metabolic">Metabolic guides</a> · <a href="/blog/adhd">ADHD articles</a> · <a href="/adhd-care">ADHD care</a> · <a href="/adhd-screening">Free screening</a></p>
          </div>
${SIYA_CIRCLE_PROMO_HTML}
${buildIndexClusterExplorerHtml()}
${renderAnswersHubCarePathwaysSection()}
          <div class="health-guides-hub-categories">
${cards}
          </div>
        </div>
      </section>
    </main>
${footerBlock()}
${hubViewAllScript}
  </body>
</html>
`;
}

function main() {
  const activeSeeds = ANSWER_SEEDS.filter((s) => !RETIRED_GUIDE_SLUGS.has(s.slug));
  fs.mkdirSync(ANSWERS_DIR, { recursive: true });
  for (const seed of activeSeeds.map(applyCannibalizationOverrides)) {
    const out = path.join(ANSWERS_DIR, `${seed.slug}.html`);
    fs.writeFileSync(out, applyPricingTokens(buildAnswerPage(seed)), 'utf8');
  }
  fs.writeFileSync(path.join(ANSWERS_DIR, 'index.html'), applyPricingTokens(buildIndexPage()), 'utf8');
  console.log('Wrote', activeSeeds.length, 'answer pages + answers/index.html');
}

main();
