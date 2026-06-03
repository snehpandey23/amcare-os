/**
 * Entity graph helpers for Physician schema and clinical review assignment.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://siya.health';
const ORG_ID = `${BASE}/#organization`;
const LAST_REVIEWED = '2026-05-19';

let _graph = null;

export function loadEntityGraph() {
  if (_graph) return _graph;
  _graph = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'entity-graph.json'), 'utf8'));
  return _graph;
}

export function getProviderBySlug(slug) {
  return loadEntityGraph().providers.find((p) => p.slug === slug);
}

export function getAllProviders() {
  return loadEntityGraph().providers;
}

/** Assign reviewing physician from slug + title keywords */
export function pickReviewer(slug, title = '') {
  const t = `${slug} ${title}`.toLowerCase();
  const swati =
    /adderall|vyvanse|focalin|stimulant|non-stimulant|medication|modafinil|ir-vs-xr|side-effect|safe-long-term|daily-or-as-needed|prescribed-online|ambien|sleep-medications|oral-vs-injectable|compounded-vs-branded|long-term-weight-loss-medications|phentermine-for-weight|food-noise|glp-1|glp1|semaglutide|tirzepatide/.test(
      t,
    );
  const natasha =
    /symptom|lazy|overlooked|know-if-you|youre-not-lazy|anxiety|mental-health|insomnia-treatment|emotional|women|burnout|rejection|time-blindness|executive-dysfunction|high-functioning/.test(
      t,
    ) && !/glp|semaglutide|tirzepatide|phentermine|weight-loss-medication|testosterone|minoxidil|sildenafil/.test(t);

  if (swati && !natasha) return getProviderBySlug('dr-swati-pandey');
  if (natasha && !swati) return getProviderBySlug('dr-natasha-desai');
  if (swati && natasha) {
    if (/symptom|lazy|overlooked|anxiety|women|burnout/.test(t)) return getProviderBySlug('dr-natasha-desai');
    return getProviderBySlug('dr-swati-pandey');
  }
  return getProviderBySlug('dr-sneh-pandey');
}

export function formatReviewDate(iso = LAST_REVIEWED) {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function physicianReviewedBy(reviewer) {
  return {
    '@type': 'Physician',
    '@id': reviewer['@id'],
    name: `${reviewer.givenName} ${reviewer.familyName}`,
    honorificPrefix: reviewer.honorificPrefix || 'Dr.',
    honorificSuffix: 'MD',
    url: reviewer.url,
  };
}

export function buildPhysicianGraph(provider, pageTitle, pageDesc, canonical) {
  const image = `${BASE}/assets/images/${provider.slug}.png`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Physician',
        '@id': provider['@id'],
        name: `${provider.givenName} ${provider.familyName}`,
        honorificPrefix: provider.honorificPrefix || 'Dr.',
        honorificSuffix: 'MD',
        jobTitle: provider.jobTitle,
        medicalSpecialty: provider.medicalSpecialty,
        knowsAbout: provider.conditionsTreated,
        url: provider.url,
        image,
        worksFor: { '@id': ORG_ID },
        areaServed: provider.statesLicensed.map((name) => ({ '@type': 'State', name })),
      },
      {
        '@type': 'MedicalOrganization',
        '@id': ORG_ID,
        name: 'Siya Health',
        url: `${BASE}/`,
        logo: `${BASE}/assets/images/siya-health-logo.png`,
        employee: { '@id': provider['@id'] },
      },
      {
        '@type': 'WebPage',
        name: pageTitle,
        description: pageDesc,
        url: canonical,
        about: { '@id': provider['@id'] },
      },
    ],
  };
}

export function clinicalReviewHtml(reviewer, date = LAST_REVIEWED) {
  return `
            <aside class="clinical-review" aria-label="Clinical review">
              <p class="clinical-review-label">Clinical review</p>
              <p>Educational content from Siya Health. Medically reviewed by <a href="${reviewer.url}">${reviewer.name}</a> · Last reviewed: ${formatReviewDate(date)}</p>
            </aside>`;
}

export function injectProviderPhysicianSchema(html, provider, title, description, canonical) {
  const graph = buildPhysicianGraph(provider, title, description, canonical);
  const tag = `<script type="application/ld+json">${JSON.stringify(graph)}</script>`;
  html = html.replace(
    /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"Organization"[\s\S]*?<\/script>\s*/i,
    '',
  );
  html = html.replace(
    /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"WebPage"[\s\S]*?<\/script>\s*/i,
    '',
  );
  if (!html.includes('"@type":"Physician"') && !html.includes('"@type": "Physician"')) {
    html = html.replace(/<\/head>/i, `\n    ${tag}\n  </head>`);
  }
  return html;
}

export function injectBlogReviewedBy(html, reviewer) {
  html = html.replace(
    /<script type="application\/ld\+json">\s*(\{[\s\S]*?"@type"\s*:\s*"BlogPosting"[\s\S]*?\})\s*<\/script>/i,
    (_, jsonStr) => {
      try {
        const o = JSON.parse(jsonStr.trim());
        o.author = { '@type': 'Organization', name: 'Siya Health', url: BASE };
        o.reviewedBy = physicianReviewedBy(reviewer);
        o.dateModified = LAST_REVIEWED;
        return `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
      } catch {
        return _;
      }
    },
  );

  if (!html.includes('class="clinical-review"')) {
    const block = clinicalReviewHtml(reviewer);
    if (html.includes('class="blog-disclaimer"')) {
      html = html.replace(/(<p class="blog-disclaimer"[\s\S]*?<\/p>)/i, `$1${block}`);
    } else if (html.includes('<div class="blog-content">')) {
      html = html.replace(/(<div class="blog-content">)/i, `$1${block}`);
    }
  }
  return html;
}

export { BASE, ORG_ID, LAST_REVIEWED };
