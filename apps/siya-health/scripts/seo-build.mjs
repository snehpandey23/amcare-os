/**
 * Regenerates sitemap.xml and normalizes SEO metadata across static HTML.
 * Run from repo root: node apps/siya-health/scripts/seo-build.mjs
 * Or from apps/siya-health: node scripts/seo-build.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

const BASE = 'https://siya.health';
const GA4_ID = process.env.SIYA_GA4_MEASUREMENT_ID || 'G-9WTQWHCTFT';
const AW_ID = 'AW-17553537456';
const DEFAULT_OG_IMAGE = `${BASE}/assets/images/siya-health-logo.png`;
const GSC_PLACEHOLDER = 'PASTE_VERIFICATION_CODE_HERE';

const BLOG_HUB_FILES = new Set([
  'blog/index.html',
  'blog/all.html',
  'blog/adhd.html',
  'blog/weight-loss.html',
  'blog/telehealth.html',
]);

const GTAG_BLOCK = `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA4_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA4_ID}');
  gtag('config', '${AW_ID}');
</script>`;

function walkHtmlFiles(dir, baseRel = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (e.name === 'public' || e.name === 'node_modules' || e.name === 'scripts') continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkHtmlFiles(full, rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function fileToUrlPath(rel) {
  if (rel === 'index.html') return '/';
  if (rel === 'blog/index.html') return '/blog';
  if (rel.endsWith('/index.html')) return '/' + rel.slice(0, -'/index.html'.length);
  return '/' + rel.replace(/\.html$/i, '');
}

function priorityFor(rel) {
  if (rel === 'index.html') return '1.0';
  if (['adhd-care.html', 'adhd-screening.html', 'weight-loss-metabolic-health.html', 'telehealth.html'].includes(rel)) return '0.95';
  if (rel.startsWith('providers/')) return '0.85';
  if (rel === 'blog/index.html' || rel === 'blog/all.html') return '0.85';
  if (['blog/adhd.html', 'blog/weight-loss.html', 'blog/telehealth.html'].includes(rel)) return '0.82';
  if (rel.startsWith('blog/')) return '0.74';
  if (rel.startsWith('adhd-diagnosis-') || rel.includes('adult-adhd') || rel.includes('online-adhd') || rel.includes('creyos')) return '0.8';
  if (['privacy-policy.html', 'terms.html'].includes(rel)) return '0.3';
  return '0.78';
}

function generateSitemap(htmlFiles) {
  const lines = [`<?xml version="1.0" encoding="UTF-8"?>`, `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`];
  const sorted = [...htmlFiles].sort((a, b) => fileToUrlPath(a).localeCompare(fileToUrlPath(b)));
  for (const rel of sorted) {
    const loc = `${BASE}${fileToUrlPath(rel)}`;
    const pr = priorityFor(rel);
    const freq = rel.startsWith('blog/') && !BLOG_HUB_FILES.has(rel) ? 'monthly' : rel === 'index.html' ? 'weekly' : 'monthly';
    lines.push(`  <url><loc>${loc}</loc><changefreq>${freq}</changefreq><priority>${pr}</priority></url>`);
  }
  lines.push(`</urlset>`);
  fs.writeFileSync(path.join(SITE_ROOT, 'sitemap.xml'), lines.join('\n') + '\n', 'utf8');
  console.log('Wrote sitemap.xml with', sorted.length, 'URLs');
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : 'Siya Health';
}

function extractDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? m[1].trim() : '';
}

function extractCanonical(html) {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return m ? m[1].trim() : null;
}

function escapeJson(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function ensureNoindexPublic(html, relPath) {
  if (!['labs.html', 'prescriptions.html'].includes(relPath)) return html;
  return html.replace(/<meta\s+name="robots"\s+content="noindex,\s*follow"\s*\/?>/gi, '<meta name="robots" content="index, follow" />');
}

function normalizeGtag(html) {
  const re = /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"><\/script>\s*(?:<!--[^>]*-->\s*)?<script>[\s\S]*?<\/script>/gi;
  if (!html.includes('googletagmanager.com/gtag/js')) return html;
  let h = html.replace(re, GTAG_BLOCK);
  h = h.replace(/\s*<!--\s*Google Analytics 4[^>]*-->\s*/gi, '\n');
  return h;
}

function ensureGSC(html) {
  if (html.includes('google-site-verification')) return html;
  return html.replace(/(<meta\s+name="viewport"[^>]*\/?>)/i, `$1\n    <meta name="google-site-verification" content="${GSC_PLACEHOLDER}" />`);
}

function ensureCanonical(html, relPath) {
  const urlPath = fileToUrlPath(relPath);
  const full = urlPath === '/' ? `${BASE}/` : `${BASE}${urlPath}`;
  if (extractCanonical(html)) return html;
  if (html.match(/<meta\s+name="description"/i)) {
    return html.replace(/(<meta\s+name="description"[^>]*\/?>)/i, `$1\n    <link rel="canonical" href="${full}" />`);
  }
  return html.replace(/(<meta\s+name="viewport"[^>]*\/?>)/i, `$1\n    <link rel="canonical" href="${full}" />`);
}

function ensureOgTwitter(html, relPath, title, description, canonical) {
  let h = html;
  const ogUrl = canonical || (fileToUrlPath(relPath) === '/' ? `${BASE}/` : `${BASE}${fileToUrlPath(relPath)}`);
  const desc = description || `${title} | Siya Health`;
  const img = DEFAULT_OG_IMAGE;

  if (!h.includes('property="og:url"')) {
    const insert = `
    <meta property="og:url" content="${ogUrl.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="${img}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Siya Health" />
    <meta property="og:locale" content="en_US" />`;
    if (h.includes('rel="canonical"')) {
      h = h.replace(/(<link\s+rel="canonical"[^>]*\/?>)/i, `$1${insert}`);
    } else {
      h = h.replace(/(<title>[^<]+<\/title>)/i, `$1${insert}`);
    }
  }
  if (!h.includes('property="og:description"') && desc) {
    if (h.includes('property="og:title"')) {
      h = h.replace(/(<meta\s+property="og:title"[^>]*\/?>)/i, `$1\n    <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />`);
    }
  }
  const hasTwitterTitle = h.includes('name="twitter:title"');
  if (!hasTwitterTitle) {
    const hasCard = h.includes('name="twitter:card"');
    const tw = hasCard
      ? `
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${img}" />`
      : `
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
    <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="${img}" />`;
    if (h.includes('property="og:locale"')) {
      h = h.replace(/(<meta\s+property="og:locale"[^>]*\/?>)/i, `$1${tw}`);
    } else if (h.includes('property="og:image:height"')) {
      h = h.replace(/(<meta\s+property="og:image:height"[^>]*\/?>)/i, `$1${tw}`);
    } else if (h.includes('rel="canonical"')) {
      h = h.replace(/(<link\s+rel="canonical"[^>]*\/?>)/i, `$1${tw}`);
    } else {
      h = h.replace(/(<meta\s+name="description"[^>]*\/?>)/i, `$1${tw}`);
    }
  }
  if (!h.includes('property="og:image"')) {
    if (h.includes('property="og:url"')) {
      h = h.replace(/(<meta\s+property="og:url"[^>]*\/?>)/i, `$1\n    <meta property="og:image" content="${img}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`);
    }
  }
  if (!h.includes('property="og:site_name"')) {
    if (h.includes('property="og:type"')) {
      h = h.replace(/(<meta\s+property="og:type"[^>]*\/?>)/i, `$1\n    <meta property="og:site_name" content="Siya Health" />`);
    }
  }
  if (!h.includes('property="og:locale"')) {
    if (h.includes('property="og:site_name"')) {
      h = h.replace(/(<meta\s+property="og:site_name"[^>]*\/?>)/i, `$1\n    <meta property="og:locale" content="en_US" />`);
    } else if (h.includes('property="og:type"')) {
      h = h.replace(/(<meta\s+property="og:type"[^>]*\/?>)/i, `$1\n    <meta property="og:site_name" content="Siya Health" />\n    <meta property="og:locale" content="en_US" />`);
    }
  }
  if (!h.includes('property="og:title"')) {
    h = h.replace(/(<link\s+rel="canonical"[^>]*\/?>)/i, `$1\n    <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`);
  }
  if (!h.includes('property="og:type"')) {
    if (h.includes('property="og:title"')) {
      h = h.replace(/(<meta\s+property="og:title"[^>]*\/?>)/i, `$1\n    <meta property="og:type" content="website" />`);
    }
  }
  if (!h.includes('property="og:description"') && desc) {
    if (h.includes('property="og:title"')) {
      h = h.replace(/(<meta\s+property="og:title"[^>]*\/?>)/i, `$1\n    <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />`);
    }
  }
  return h;
}

function articleToBlogPosting(html) {
  return html.replace(/"@type"\s*:\s*"Article"/g, '"@type": "BlogPosting"');
}

function ensureBreadcrumbBlogArticle(html, relPath, title, canonical) {
  if (html.includes('BreadcrumbList')) return html;
  if (!relPath.startsWith('blog/') || BLOG_HUB_FILES.has(relPath)) return html;
  const url = canonical || `${BASE}${fileToUrlPath(relPath)}`;
  const itemName = title.replace(/\s*\|\s*Siya Health\s*$/i, '').trim().slice(0, 110);
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
      { '@type': 'ListItem', position: 3, name: itemName, item: url },
    ],
  };
  const tag = `\n    <script type="application/ld+json">${JSON.stringify(json)}</script>`;
  return html.replace(/<\/head>/i, `${tag}\n  </head>`);
}

function ensureBreadcrumbCategory(html, relPath, name, canonical) {
  if (html.includes('BreadcrumbList')) return html;
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
      { '@type': 'ListItem', position: 3, name: name, item: canonical },
    ],
  };
  const tag = `\n    <script type="application/ld+json">${JSON.stringify(json)}</script>`;
  return html.replace(/<\/head>/i, `${tag}\n  </head>`);
}

function ensureBreadcrumbSimplePage(html, name, canonical) {
  if (html.includes('BreadcrumbList')) return html;
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: name, item: canonical },
    ],
  };
  const tag = `\n    <script type="application/ld+json">${JSON.stringify(json)}</script>`;
  return html.replace(/<\/head>/i, `${tag}\n  </head>`);
}

function ensureProviderBreadcrumb(html, title, canonical) {
  if (html.includes('BreadcrumbList')) return html;
  const name = title.split('|')[0].trim();
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${BASE}/about` },
      { '@type': 'ListItem', position: 3, name: name, item: canonical },
    ],
  };
  const tag = `\n    <script type="application/ld+json">${JSON.stringify(json)}</script>`;
  return html.replace(/<\/head>/i, `${tag}\n  </head>`);
}

function ensureOrganizationWebPage(html, relPath, title, desc, canonical) {
  if (html.includes('BlogPosting')) return html;
  if (html.includes('MedicalOrganization')) return html;
  if (html.match(/"@type"\s*:\s*"Organization"/) || html.match(/'@type'\s*:\s*'Organization'/)) return html;
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Siya Health',
    url: BASE,
    logo: DEFAULT_OG_IMAGE,
  };
  const webPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description: desc || undefined,
    url: canonical,
  };
  const tag = `\n    <script type="application/ld+json">${JSON.stringify(org)}</script>\n    <script type="application/ld+json">${JSON.stringify(webPage)}</script>`;
  return html.replace(/<\/head>/i, `${tag}\n  </head>`);
}

function ensureWebSiteSchema(html, relPath) {
  if (relPath !== 'index.html') return html;
  if (html.includes('"@type":"WebSite"') || html.includes('"@type": "WebSite"')) return html;
  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Siya Health',
    url: BASE,
    publisher: { '@type': 'Organization', name: 'Siya Health', url: BASE, logo: { '@type': 'ImageObject', url: DEFAULT_OG_IMAGE } },
  };
  const tag = `    <script type="application/ld+json">${JSON.stringify(webSite)}</script>\n`;
  return html.replace(/<\/head>/i, `${tag}  </head>`);
}

/** Category hub breadcrumbs */
function categoryBreadcrumb(relPath, html) {
  if (relPath === 'blog/index.html') {
    html = html.replace(/<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"BreadcrumbList"[\s\S]*?<\/script>\s*/i, '');
    const json = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog hub', item: `${BASE}/blog` },
      ],
    };
    const tag = `\n    <script type="application/ld+json">${JSON.stringify(json)}</script>`;
    return html.replace(/<\/head>/i, `${tag}\n  </head>`);
  }
  const map = {
    'blog/adhd.html': { name: 'ADHD articles', path: '/blog/adhd' },
    'blog/weight-loss.html': { name: 'Weight loss articles', path: '/blog/weight-loss' },
    'blog/telehealth.html': { name: 'Telehealth articles', path: '/blog/telehealth' },
    'blog/all.html': { name: 'All articles', path: '/blog/all' },
  };
  const entry = map[relPath];
  if (!entry) return html;
  return ensureBreadcrumbCategory(html, relPath, entry.name, `${BASE}${entry.path}`);
}

function processHtml(relPath) {
  const fullPath = path.join(SITE_ROOT, relPath);
  let html = fs.readFileSync(fullPath, 'utf8');
  const title = extractTitle(html);
  let description = extractDescription(html);
  let canonical = extractCanonical(html);
  const urlPath = fileToUrlPath(relPath);
  if (!canonical) canonical = urlPath === '/' ? `${BASE}/` : `${BASE}${urlPath}`;

  html = normalizeGtag(html);
  html = ensureGSC(html);
  html = ensureNoindexPublic(html, relPath);
  html = ensureCanonical(html, relPath);
  canonical = extractCanonical(html) || canonical;

  if (!description && title) {
    description = `Learn more about ${title.replace(/\s*\|\s*Siya Health\s*$/i, '').trim()} with Siya Health telehealth.`;
    html = html.replace(
      /(<meta\s+name="description"\s+content=")([^"]*)(")/i,
      `$1${escapeAttr(description)}$3`
    );
    if (!html.includes('name="description"')) {
      html = html.replace(/(<link\s+rel="canonical"[^>]*\/?>)/i, `\n    <meta name="description" content="${escapeAttr(description)}" />$1`);
    }
  }

  html = ensureOgTwitter(html, relPath, title, description || title, canonical);

  if (isBlogArticle(relPath)) {
    html = articleToBlogPosting(html);
    html = ensureBreadcrumbBlogArticle(html, relPath, title, canonical);
  } else {
    html = categoryBreadcrumb(relPath, html);
  }

  if (relPath === 'about.html') html = ensureBreadcrumbSimplePage(html, 'About', canonical);
  if (relPath === 'adhd-care.html') html = ensureBreadcrumbSimplePage(html, 'ADHD Care', canonical);
  if (relPath === 'membership-pricing.html') html = ensureBreadcrumbSimplePage(html, 'Membership & pricing', canonical);
  if (relPath.startsWith('providers/')) html = ensureProviderBreadcrumb(html, title, canonical);

  html = ensureOrganizationWebPage(html, relPath, title, description, canonical);
  html = ensureWebSiteSchema(html, relPath);

  fs.writeFileSync(fullPath, html, 'utf8');
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function isBlogArticle(relPath) {
  if (!relPath.startsWith('blog/') || !relPath.endsWith('.html')) return false;
  return !BLOG_HUB_FILES.has(relPath);
}

function main() {
  const htmlFiles = walkHtmlFiles(SITE_ROOT);
  generateSitemap(htmlFiles);

  const dupTitles = {};
  for (const rel of htmlFiles) {
    const t = extractTitle(fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8'));
    dupTitles[t] = (dupTitles[t] || 0) + 1;
  }
  const dups = Object.entries(dupTitles).filter(([, c]) => c > 1);
  if (dups.length) console.warn('Duplicate titles found:', dups.map(([t, c]) => `${c}× ${t.slice(0, 60)}`));

  for (const rel of htmlFiles) {
    processHtml(rel);
  }
  console.log('Processed', htmlFiles.length, 'HTML files for SEO tags.');
}

main();
