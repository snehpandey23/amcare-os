/**
 * Writes California ADHD SEO blog HTML files matching existing *.html blog layout.
 * Run from apps/siya-health: node scripts/publish-california-adhd-blog.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { BOOKING_LINK } from '../data/providers-core.mjs';
import { CALIFORNIA_POSTS } from './california-adhd-blog-data.mjs';
import { CALIFORNIA_POSTS_REST } from './california-adhd-blog-rest.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const BOOK = BOOKING_LINK;

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function buildFaqJsonLd(post) {
  const mainEntity = post.faqs.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  }));
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
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
  });
}

function buildBreadcrumb(post) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://siya.health/blog' },
      { '@type': 'ListItem', position: 3, name: post.breadcrumbShort, item: `https://siya.health/blog/${post.slug}` },
    ],
  });
}

function appendFaqDetails(post) {
  return (
    post.faqs
      .map(
        ([q, a]) =>
          `\n            <h3>${q}</h3>\n            <p>${a}</p>`,
      )
      .join('') +
    `
            <section class="blog-provider-cta" aria-labelledby="blog-provider-cta-heading-ca">
              <h2 id="blog-provider-cta-heading-ca">Get evaluated by a Siya Health provider</h2>
              <p>Structured telehealth for eligible patients when clinically appropriate—with documentation, screening, monitoring, and follow-up.</p>
              <div class="blog-provider-cta-actions">
                <a class="button" href="/adhd-screening?adhd=1">Start ADHD screening</a>
                <a class="button secondary" href="${BOOK}" target="_blank" rel="noopener">Schedule Meet &amp; Greet</a>
              </div>
              <p class="blog-provider-cta-foot"><a href="/providers/dr-sneh-pandey">Meet Dr. Sneh Pandey, MD — Medical Director</a> · <a href="/adhd-care">ADHD care</a> · <a href="/pricing">Pricing</a></p>
            </section>`
  );
}

function buildPage(post) {
  const url = `https://siya.health/blog/${post.slug}`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){var h=(w.location&&w.location.hostname)||'';if(h==='localhost'||h==='127.0.0.1'||h==='[::1]'||/\.local$/.test(h))return;w[l]=w[l]||[];w[l].push({'gtm.start':
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
    <title>${escAttr(post.title)}</title>
    <meta name="description" content="${escAttr(post.metaDescription)}" />
    <link rel="canonical" href="${escAttr(url)}" />
    <meta property="og:url" content="${escAttr(url)}" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Siya Health" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escAttr(post.title)}" />
    <meta name="twitter:description" content="${escAttr(post.metaDescription)}" />
    <meta name="twitter:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <meta property="og:title" content="${escAttr(post.headlineJson)}" />
    <meta property="og:type" content="website" />
    <meta property="og:description" content="${escAttr(post.metaDescription)}" />
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${buildBlogPostingJsonLd(post)}</script>
    <script type="application/ld+json">${buildFaqJsonLd(post)}</script>

    <script type="application/ld+json">${buildBreadcrumb(post)}</script>
  </head>
  <body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PLBD4TTQ"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo" href="/"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" /></a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          <a class="button" href="/adhd-screening">Start Free Screening</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/blog">Blog</a>
          <a class="button" href="/adhd-screening">Start Free Screening</a>
        </div>
      </div>
    </header>

    <main id="main">
      <article class="blog-article">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="/blog/adhd">ADHD Resources</a> · California</p>
            <h1>${post.h1}</h1>
            <p class="blog-lead">${post.lead}</p>
          </header>

          <div class="blog-content">
${post.bodyHtml}${appendFaqDetails(post)}
          </div>
        </div>
      </article>

      <section class="section">
        <div class="container">
          <div class="cta-band">
            <h3>Questions about ADHD in California?</h3>
            <p>Speak with our team—virtual ADHD evaluation pathways for eligible patients.</p>
            <div class="cta-band-buttons">
              <a class="button" href="/adhd-screening?adhd=1">Start Free ADHD Screening</a>
              <a class="button secondary" href="/adhd-care">ADHD Care Overview</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-logo-col">
          <a href="/" class="footer-logo-link"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" class="footer-logo-img" /></a>
        </div>
        <div class="footer-brand">
          <p>Licensed clinicians providing telehealth care across Texas, Pennsylvania, Florida, and California.</p>
        </div>
        <div><h4>Services</h4><p><a href="/adhd-care">ADHD Care</a></p><p><a href="/adhd-screening">Start Free Screening</a></p></div>
        <div><h4>Contact</h4><p><a href="mailto:care@siya.health">care@siya.health</a></p><p><a href="tel:+12154451244">(215) 445-1244</a></p></div>
        <div><h4>Legal</h4><p><a href="https://adhd.siya.health/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a></p><p><a href="https://adhd.siya.health/terms-of-service" target="_blank" rel="noopener">Terms</a></p></div>
      </div>
      <div class="container"><p class="footer-notice">For emergencies, call 911. All telehealth services are provided by licensed medical professionals.</p><small>© 2026 Siya Health Inc.</small></div>
    </footer>
    <script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="69be9ab3db1480f6799cdd18"></script>
  </body>
</html>
`;
}

const RETIRED_SLUGS = new Set([
  // EG-P0-01: garbled prose — 301 → /adhd-care; do not regenerate
  'adult-adhd-treatment-california-2026',
]);

const ALL = [...CALIFORNIA_POSTS, ...CALIFORNIA_POSTS_REST].filter(
  (p) => !p.retired && !RETIRED_SLUGS.has(p.slug),
);

for (const post of ALL) {
  fs.writeFileSync(path.join(BLOG_DIR, `${post.slug}.html`), buildPage(post), 'utf8');
  console.log('Wrote blog/' + post.slug + '.html');
}
console.log('Total:', ALL.length, '| retired skipped:', [...RETIRED_SLUGS].join(', '));
