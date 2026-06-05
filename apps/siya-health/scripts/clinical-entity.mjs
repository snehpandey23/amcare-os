/**
 * Entity graph helpers for Physician schema and clinical review assignment.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  REVIEW_STATUS,
  getBlogReviewMeta,
  getAnswerReviewMeta,
} from '../data/content-review-registry.mjs';
import { getProviderBySlug as getProviderFromData, toEntityGraphProvider } from '../data/providers.mjs';

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
  const fromData = getProviderFromData(slug);
  if (fromData) return toEntityGraphProvider(fromData);
  return loadEntityGraph().providers.find((p) => p.slug === slug);
}

export function getAllProviders() {
  return loadEntityGraph().providers;
}

/** @deprecated Use content-review-registry allowlist; kept for non-governed tooling only */
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
  const suffix = reviewer.honorificSuffix || (reviewer.honorificPrefix ? 'MD' : undefined);
  const name = reviewer.name || `${reviewer.givenName} ${reviewer.familyName}`;
  return {
    '@type': 'Physician',
    '@id': reviewer['@id'],
    name,
    ...(reviewer.honorificPrefix ? { honorificPrefix: reviewer.honorificPrefix } : {}),
    ...(suffix ? { honorificSuffix: suffix } : {}),
    url: reviewer.url,
  };
}

export function resolveBlogReviewRecord(slug) {
  const meta = getBlogReviewMeta(slug);
  if (!meta) {
    return { status: REVIEW_STATUS.PENDING_REVIEW, slug, reviewer: null, reviewDate: null };
  }
  const reviewer = getProviderBySlug(meta.reviewerSlug);
  return {
    status: REVIEW_STATUS.CLINICALLY_REVIEWED,
    slug,
    reviewer,
    reviewDate: meta.reviewDate || LAST_REVIEWED,
  };
}

export function resolveAnswerReviewRecord(slug) {
  const meta = getAnswerReviewMeta(slug);
  if (!meta) {
    return { status: REVIEW_STATUS.PENDING_REVIEW, slug, reviewer: null, reviewDate: null };
  }
  const reviewer = getProviderBySlug(meta.reviewerSlug);
  return {
    status: REVIEW_STATUS.CLINICALLY_REVIEWED,
    slug,
    reviewer,
    reviewDate: meta.reviewDate || LAST_REVIEWED,
  };
}

export function clinicalReviewBlock(record) {
  if (record.status === REVIEW_STATUS.CLINICALLY_REVIEWED && record.reviewer) {
    const date = formatReviewDate(record.reviewDate || LAST_REVIEWED);
    return `
            <aside class="clinical-review clinical-review--reviewed" aria-label="Clinical review">
              <p class="clinical-review-label">Physician reviewed</p>
              <p><strong>Reviewed by:</strong> <a href="${record.reviewer.url}">${record.reviewer.name}</a></p>
              <p><strong>Review date:</strong> ${date}</p>
            </aside>`;
  }
  return `
            <aside class="clinical-review clinical-review--pending" aria-label="Clinical review status">
              <p class="clinical-review-label">Pending physician review</p>
              <p>This educational content is awaiting final physician review.</p>
            </aside>`;
}

/** @deprecated Use clinicalReviewBlock(resolveAnswerReviewRecord(slug)) */
export function clinicalReviewHtml(reviewer, date = LAST_REVIEWED) {
  return clinicalReviewBlock({
    status: REVIEW_STATUS.CLINICALLY_REVIEWED,
    reviewer,
    reviewDate: date,
  });
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

const LEGACY_REVIEW_LINE =
  /<p>\s*Educational content from Siya Health\.\s*Medically reviewed by[\s\S]*?<\/p>\s*/gi;

function patchBlogPostingSchema(html, record) {
  return html.replace(
    /<script type="application\/ld\+json">\s*(\{[\s\S]*?"@type"\s*:\s*"BlogPosting"[\s\S]*?\})\s*<\/script>/i,
    (_, jsonStr) => {
      try {
        const o = JSON.parse(jsonStr.trim());
        o.author = { '@type': 'Organization', name: 'Siya Health', url: BASE };
        delete o.reviewedBy;
        if (record.status === REVIEW_STATUS.CLINICALLY_REVIEWED && record.reviewer) {
          o.reviewedBy = physicianReviewedBy(record.reviewer);
          o.dateModified = record.reviewDate || LAST_REVIEWED;
        }
        return `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
      } catch {
        return _;
      }
    },
  );
}

function patchMedicalWebPageSchema(html, record) {
  return html.replace(
    /<script type="application\/ld\+json">\s*(\{[\s\S]*?"@type"\s*:\s*"MedicalWebPage"[\s\S]*?\})\s*<\/script>/i,
    (_, jsonStr) => {
      try {
        const o = JSON.parse(jsonStr.trim());
        delete o.reviewedBy;
        if (record.status === REVIEW_STATUS.CLINICALLY_REVIEWED && record.reviewer) {
          o.reviewedBy = physicianReviewedBy(record.reviewer);
          o.dateModified = record.reviewDate || LAST_REVIEWED;
        } else {
          o.dateModified = LAST_REVIEWED;
        }
        return `<script type="application/ld+json">${JSON.stringify(o)}</script>`;
      } catch {
        return _;
      }
    },
  );
}

function stripClinicalReviewAsides(html) {
  return html.replace(/\s*<aside class="clinical-review[\s\S]*?<\/aside>/g, '');
}

function insertClinicalReviewAside(html, block) {
  if (html.includes('class="blog-disclaimer"')) {
    return html.replace(/(<p class="blog-disclaimer"[\s\S]*?<\/p>)/i, `$1${block}`);
  }
  if (html.includes('<div class="blog-content">')) {
    return html.replace(/(<div class="blog-content">)/i, `$1${block}`);
  }
  return html;
}

function syncClinicalReviewAside(html, record) {
  const block = clinicalReviewBlock(record);
  html = html.replace(LEGACY_REVIEW_LINE, '');
  html = stripClinicalReviewAsides(html);
  return insertClinicalReviewAside(html, block);
}

/** Apply governance review status to blog article HTML */
export function applyBlogReviewStatus(html, slug) {
  const record = resolveBlogReviewRecord(slug);
  html = patchBlogPostingSchema(html, record);
  html = syncClinicalReviewAside(html, record);
  return html;
}

/** Apply governance review status to answer page HTML */
export function applyAnswerReviewStatus(html, slug) {
  const record = resolveAnswerReviewRecord(slug);
  html = patchMedicalWebPageSchema(html, record);
  html = syncClinicalReviewAside(html, record);
  return html;
}

/** @deprecated Use applyBlogReviewStatus */
export function injectBlogReviewedBy(html, reviewer) {
  return applyBlogReviewStatus(html, '');
}

export { BASE, ORG_ID, LAST_REVIEWED, REVIEW_STATUS };
