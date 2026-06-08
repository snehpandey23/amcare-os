/**
 * Phase 8 — Apply CTR title/meta/H1/FAQ updates to ADHD blog HTML.
 * Run: node scripts/apply-phase8-adhd-ctr.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PHASE8_BLOG_CTR } from '../data/phase8-adhd-ctr.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

function escapeJson(s) {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

for (const [slug, cfg] of Object.entries(PHASE8_BLOG_CTR)) {
  const file = path.join(SITE_ROOT, 'blog', `${slug}.html`);
  if (!fs.existsSync(file)) {
    console.warn('Skip missing', slug);
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');

  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${cfg.title}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${cfg.description.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${cfg.title}" />`);
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${cfg.description.replace(/"/g, '&quot;')}" />`
  );
  html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${cfg.title.replace(/\s*\|\s*Siya Health\s*$/i, '')}" />`);
  html = html.replace(
    /<meta property="og:description" content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${cfg.description.replace(/"/g, '&quot;')}" />`
  );

  const h1Plain = cfg.h1.replace(/"/g, '&quot;');
  html = html.replace(/<h1>[^<]*<\/h1>/, `<h1>${cfg.h1}</h1>`);
  html = html.replace(/<p class="blog-lead">[\s\S]*?<\/p>/, `<p class="blog-lead">${cfg.lead}</p>`);

  // BlogPosting headline
  html = html.replace(/"headline":"[^"]*"/, `"headline":"${escapeJson(cfg.h1)}"`);
  html = html.replace(/"description":"[^"]*"(?=,"datePublished")/, `"description":"${escapeJson(cfg.description)}"`);

  // Append FAQ items before closing FAQ section if present
  if (cfg.faqAdd?.length) {
    const newFaqs = cfg.faqAdd.filter((f) => !html.includes(f.q));
    const faqBlocks = newFaqs
      .map((f) => `\n            <h3>${f.q}</h3>\n            <p>${f.a}</p>`)
      .join('');
    if (faqBlocks && html.includes('<h2>FAQ</h2>')) {
      html = html.replace(/(<h2>FAQ<\/h2>)/, `$1${faqBlocks}`);
    }

    // Extend FAQPage JSON-LD
    if (newFaqs.length) {
    const faqRe = /<script type="application\/ld\+json">\{"@context": "https:\/\/schema\.org", "@type": "FAQPage"[\s\S]*?<\/script>/;
    const m = html.match(faqRe);
    if (m) {
      let faqJson;
      try {
        faqJson = JSON.parse(m[0].replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, ''));
        for (const f of newFaqs) {
          faqJson.mainEntity.push({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          });
        }
        html = html.replace(faqRe, `<script type="application/ld+json">${JSON.stringify(faqJson)}</script>`);
      } catch {
        /* keep existing */
      }
    }
    }
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('Updated CTR:', slug);
}
