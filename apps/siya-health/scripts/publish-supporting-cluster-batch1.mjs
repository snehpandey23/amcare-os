/**
 * Publish supporting cluster Batch 1 (Brain Fog + Fatigue).
 * Run: node scripts/publish-supporting-cluster-batch1.mjs
 *
 * Graph pattern: Supporting → Canonical Entity → Related Entity → Primary Care
 * CTA: primary care / Meet & Greet — never ADHD screening as default.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SUPPORTING_CLUSTER_BATCH1 } from './supporting-cluster-batch1-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'blog');

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildFaqJsonLd(post) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  });
}

function buildBlogPostingJsonLd(post) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.headlineJson,
    description: post.metaDescription,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: { '@type': 'Organization', name: 'Siya Health' },
    publisher: { '@type': 'Organization', name: 'Siya Health', url: 'https://siya.health' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://siya.health/blog/${post.slug}` },
    about: [post.cluster === 'brain-fog' ? 'Brain fog' : 'Fatigue', 'Primary care'],
  });
}

function buildBreadcrumb(post) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://siya.health/blog' },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.breadcrumbShort,
        item: `https://siya.health/blog/${post.slug}`,
      },
    ],
  });
}

function hubLabel(cluster) {
  return cluster === 'brain-fog' ? 'Brain Fog' : 'Fatigue';
}

function hubHref(cluster) {
  return cluster === 'brain-fog' ? '/brain-fog' : '/fatigue';
}

function faqHtml(post) {
  return post.faqs
    .map(([q, a]) => `\n            <h3>${q}</h3>\n            <p>${a}</p>`)
    .join('');
}

function buildPage(post) {
  const url = `https://siya.health/blog/${post.slug}`;
  const hub = hubHref(post.cluster);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/scripts/cookie-consent-bootstrap.js"></script>
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){var h=(w.location&&w.location.hostname)||'';if(h==='localhost'||h==='127.0.0.1'||h==='[::1]'||/\.local$/.test(h))return;w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PLBD4TTQ');</script>
<!-- End Google Tag Manager -->
<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${escAttr(post.title)}</title>
    <meta name="description" content="${escAttr(post.metaDescription)}" />
    <link rel="canonical" href="${escAttr(url)}" />
    <meta property="og:title" content="${escAttr(post.headlineJson)}" />
    <meta property="og:description" content="${escAttr(post.metaDescription)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escAttr(url)}" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <meta property="og:site_name" content="Siya Health" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escAttr(post.title)}" />
    <meta name="twitter:description" content="${escAttr(post.metaDescription)}" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${buildBlogPostingJsonLd(post)}</script>
    <script type="application/ld+json">${buildFaqJsonLd(post)}</script>
    <script type="application/ld+json">${buildBreadcrumb(post)}</script>
  </head>
  <body data-siya-supporting-cluster="${escAttr(post.cluster)}" data-siya-parent-entity="${escAttr(post.canonicalEntity)}">
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PLBD4TTQ"
height="0" width="0" style="display:none;visibility:hidden" title="GTM"></iframe></noscript>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <img class="brand-lockup__wordmark" src="/assets/images/siya-health-logo-pre-registered.png" alt="Siya Health" width="140" height="40" decoding="async" />
        </a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/primary-care">Primary Care</a>
          <a href="/brain-fog">Brain Fog</a>
          <a href="/fatigue">Fatigue</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          <a class="button ds-button ds-button--secondary" href="/primary-care" data-siya-track="explore-care-click" data-siya-location="nav">Primary Care</a>
        </div>
      </div>
    </header>
    <main id="main">
      <article class="blog-article">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="${hub}">${hubLabel(post.cluster)}</a> · Supporting guide</p>
            <h1>${post.h1}</h1>
            <p class="blog-lead">${post.lead}</p>
          </header>
          <div class="blog-content">
${post.bodyHtml}
            <aside class="blog-internal-links" aria-label="Strengthen the knowledge graph" data-assembly="supporting-cluster">
              <p><strong>In this graph:</strong>
                <a href="${post.canonicalEntity}">${hubLabel(post.cluster)}</a>
                → <a href="${post.relatedEntity}">${escAttr(post.relatedLabel)}</a>
                → <a href="/primary-care">Primary Care</a>
              </p>
            </aside>
            <h2>Frequently asked questions</h2>${faqHtml(post)}
            <section class="blog-provider-cta" aria-labelledby="supporting-cta-heading">
              <h2 id="supporting-cta-heading">Talk with primary care</h2>
              <p>${post.ctaBlurb || 'This article orients you—it does not diagnose. A licensed clinician can sort look-alikes and decide whether further evaluation fits your situation.'}</p>
              <div class="blog-provider-cta-actions">
                <a class="button ds-button ds-button--primary" href="/book-appointment" data-siya-track="book_appointment_click" data-siya-location="blog-supporting-cta">Book a primary care visit</a>
                <a class="button ds-button ds-button--secondary secondary" href="/redirect/meet-greet" data-siya-track="meet_greet_click" data-siya-location="blog-supporting-cta">Book Free Meet &amp; Greet</a>
              </div>
              <p class="blog-provider-cta-foot"><a href="${post.canonicalEntity}">${hubLabel(post.cluster)} hub</a> · <a href="/primary-care">Primary care</a> · <a href="/preventive-care">Preventive care</a></p>
            </section>
          </div>
        </div>
      </article>
    </main>
    <footer class="footer">
      <div class="container">
        <p><a href="/primary-care">Primary Care</a> · <a href="/brain-fog">Brain Fog</a> · <a href="/fatigue">Fatigue</a> · &copy; 2026 Siya Health Inc.</p>
        <p class="footer-notice">Educational content only. For emergencies, call 911.</p>
      </div>
    </footer>
    <script src="/scripts/siya-tracking.js" defer></script>
  </body>
</html>
`;
}

for (const post of SUPPORTING_CLUSTER_BATCH1) {
  const out = path.join(BLOG_DIR, `${post.slug}.html`);
  fs.writeFileSync(out, buildPage(post));
  console.log('Wrote', path.relative(path.join(__dirname, '..'), out));
}
console.log(`Supporting cluster Batch 1: ${SUPPORTING_CLUSTER_BATCH1.length} articles`);
