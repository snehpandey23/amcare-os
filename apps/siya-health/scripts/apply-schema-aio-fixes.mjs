/**
 * Schema-only AIO/GEO fixes (no visible body content changes):
 * 1. MedicalWebPage on /adhd-care.html + indexable blog posts missing it
 * 2. Trim FAQPage first Answer on /answers/* to on-page short lead
 * 3. Per-page MedicalWebPage dateModified from git (fallback: file mtime)
 *
 * Run: node scripts/apply-schema-aio-fixes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { contentLastModifiedIso, SITE_ROOT } from './content-lastmod.mjs';

const BASE = 'https://siya.health';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function stripTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["']([^"']*)["']`, 'i');
  const m = html.match(re);
  return m ? m[1] : '';
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? stripTags(m[1]) : '';
}

function extractCanonical(html) {
  const m = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  return m ? m[1] : '';
}

function inferAboutCondition(relPath, title, desc) {
  const t = `${relPath} ${title} ${desc || ''}`.toLowerCase();
  if (/pots/.test(t)) return 'Postural Orthostatic Tachycardia Syndrome';
  if (/testosterone|trt|erectile|sildenafil|minoxidil|men.?s health/.test(t)) return "Men's Health";
  if (/semaglutide|tirzepatide|glp-?1|weight|obesity|phentermine|food.noise|binge.eating|insulin/.test(t)) {
    return 'Obesity';
  }
  if (/thyroid|fatigue|brain.fog|iron|sleep|insomnia|covid/.test(t) && !/adhd/.test(t)) return 'Fatigue';
  if (/adhd|stimulant|vyvanse|adderall|focalin|executive|inattent|telehealth/.test(t)) {
    return 'Attention-Deficit/Hyperactivity Disorder';
  }
  if (relPath === 'adhd-care.html') return 'Attention-Deficit/Hyperactivity Disorder';
  return 'Medical Condition';
}

function mapJsonLdScripts(html, mapper) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (full, inner) => {
    let o;
    try {
      o = JSON.parse(inner.trim());
    } catch {
      return full;
    }
    const next = mapper(o);
    if (!next) return full;
    return `<script type="application/ld+json">${JSON.stringify(next)}</script>`;
  });
}

function refreshMedicalWebPageDate(html, relPath) {
  const dateModified = contentLastModifiedIso(relPath);
  let updated = false;
  // Prefer BlogPosting.dateModified when present (editorial date already on page).
  let preferred = dateModified;
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const o = JSON.parse(m[1].trim());
      if (o?.['@type'] === 'BlogPosting' && o.dateModified && /^\d{4}-\d{2}-\d{2}/.test(String(o.dateModified))) {
        preferred = String(o.dateModified).slice(0, 10);
      }
    } catch {
      /* skip */
    }
  }
  const next = mapJsonLdScripts(html, (o) => {
    if (o?.['@type'] !== 'MedicalWebPage') return null;
    if (o.dateModified === preferred) return null;
    o.dateModified = preferred;
    updated = true;
    return o;
  });
  return { html: next, updated, dateModified: preferred };
}

function ensureMedicalWebPage(html, relPath) {
  if (html.includes('MedicalWebPage')) {
    const refreshed = refreshMedicalWebPageDate(html, relPath);
    return {
      html: refreshed.html,
      changed: refreshed.updated,
      action: refreshed.updated ? 'date-refreshed' : 'already',
    };
  }
  if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    return { html, changed: false, action: 'skipped-noindex' };
  }

  const title = extractTitle(html);
  const desc = extractMeta(html, 'description');
  const canonical =
    extractCanonical(html) ||
    (relPath === 'adhd-care.html'
      ? `${BASE}/adhd-care`
      : `${BASE}/${relPath.replace(/\.html$/, '').replace(/\/index$/, '')}`);
  const name = title.replace(/\s*\|\s*Siya Health\s*$/i, '').trim();

  let dateModified = contentLastModifiedIso(relPath);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)) {
    try {
      const o = JSON.parse(m[1].trim());
      if (o?.dateModified && /^\d{4}-\d{2}-\d{2}/.test(String(o.dateModified))) {
        dateModified = String(o.dateModified).slice(0, 10);
      }
    } catch {
      /* skip */
    }
  }

  const mwp = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name,
    description: desc || undefined,
    url: canonical,
    dateModified,
    publisher: { '@type': 'MedicalOrganization', name: 'Siya Health', url: BASE },
    about: {
      '@type': 'MedicalCondition',
      name: inferAboutCondition(relPath, title, desc),
    },
  };

  let upgraded = false;
  let next = html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi, (full, inner) => {
    if (upgraded) return full;
    let o;
    try {
      o = JSON.parse(inner.trim());
    } catch {
      return full;
    }
    if (!o || o['@type'] !== 'WebPage') return full;
    upgraded = true;
    return `<script type="application/ld+json">${JSON.stringify(mwp)}</script>`;
  });
  if (upgraded) return { html: next, changed: true, action: 'upgraded-WebPage' };

  next = html.replace(/<\/head>/i, `    <script type="application/ld+json">${JSON.stringify(mwp)}</script>\n  </head>`);
  return { html: next, changed: next !== html, action: 'injected' };
}

function patchAnswerSchemas(html, relPath) {
  const leadMatch = html.match(/class=["']answer-lead["'][^>]*>([\s\S]*?)<\/p>/i);
  const shortAnswer = leadMatch ? stripTags(leadMatch[1]).slice(0, 1000) : '';
  const dateModified = contentLastModifiedIso(relPath);
  let faqTrimmed = false;
  let dateUpdated = false;

  const next = mapJsonLdScripts(html, (o) => {
    if (!o || !o['@type']) return null;

    if (o['@type'] === 'FAQPage' && Array.isArray(o.mainEntity) && o.mainEntity[0] && shortAnswer) {
      const ans = o.mainEntity[0].acceptedAnswer;
      const prev = typeof ans?.text === 'string' ? ans.text : '';
      if (prev !== shortAnswer) {
        o.mainEntity[0].acceptedAnswer = { '@type': 'Answer', text: shortAnswer };
        faqTrimmed = true;
        return o;
      }
      return null;
    }

    if (o['@type'] === 'MedicalWebPage') {
      if (o.dateModified !== dateModified) {
        o.dateModified = dateModified;
        dateUpdated = true;
        return o;
      }
    }
    return null;
  });

  return { html: next, faqTrimmed, dateUpdated, dateModified, shortLen: shortAnswer.length };
}

function main() {
  const stats = {
    mwpAdded: 0,
    mwpSkippedNoindex: 0,
    mwpAlready: 0,
    answersFaq: 0,
    answersDate: 0,
  };

  // 1) adhd-care + blogs
  const targets = ['adhd-care.html'];
  for (const name of fs.readdirSync(path.join(SITE_ROOT, 'blog'))) {
    if (!name.endsWith('.html') || name === 'index.html') continue;
    targets.push(`blog/${name}`);
  }

  for (const rel of targets) {
    const full = path.join(SITE_ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const before = fs.readFileSync(full, 'utf8');
    const { html, changed, action } = ensureMedicalWebPage(before, rel);
    if (action === 'skipped-noindex') stats.mwpSkippedNoindex += 1;
    else if (action === 'already') stats.mwpAlready += 1;
    else if (changed) {
      fs.writeFileSync(full, html, 'utf8');
      stats.mwpAdded += 1;
      console.log(`MedicalWebPage ${action}: ${rel}`);
    }
  }

  // 2–3) answers FAQ trim + dateModified
  const answersDir = path.join(SITE_ROOT, 'answers');
  for (const name of fs.readdirSync(answersDir)) {
    if (!name.endsWith('.html') || name === 'index.html') continue;
    const rel = `answers/${name}`;
    const full = path.join(SITE_ROOT, rel);
    const before = fs.readFileSync(full, 'utf8');
    const { html, faqTrimmed, dateUpdated, dateModified, shortLen } = patchAnswerSchemas(before, rel);
    if (faqTrimmed || dateUpdated) {
      fs.writeFileSync(full, html, 'utf8');
      if (faqTrimmed) stats.answersFaq += 1;
      if (dateUpdated) stats.answersDate += 1;
      console.log(
        `answers/${name}: faq=${faqTrimmed ? `trimmed(${shortLen}c)` : 'ok'} dateModified=${dateUpdated ? dateModified : 'ok'}`,
      );
    }
  }

  console.log('\nSummary:', JSON.stringify(stats, null, 2));
}

main();
