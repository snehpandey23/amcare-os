/**
 * Generates AI retrieval files: llms.txt, llms-full.txt, and JSON indexes.
 * Run: node apps/siya-health/scripts/generate-ai-indexes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const BASE = 'https://siya.health';

const ENTITY_GRAPH = JSON.parse(
  fs.readFileSync(path.join(SITE_ROOT, 'data/entity-graph.json'), 'utf8'),
);

function walkHtmlFiles(dir, baseRel = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (e.name === 'public' || e.name === 'node_modules' || e.name === 'scripts' || e.name === 'data') continue;
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

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s*\|\s*Siya Health\s*$/i, '').trim() : 'Siya Health';
}

function extractDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? m[1].replace(/&amp;/g, '&').trim() : '';
}

function classifyPage(rel, title, desc) {
  if (rel.startsWith('labs/') || rel === 'labs.html') return 'service-labs';
  if (rel.startsWith('providers/')) return 'provider';
  if (rel.startsWith('answers/')) return rel === 'answers/index.html' ? 'answer-hub' : 'answer';
  if (rel.startsWith('blog/')) return 'article';
  if (rel.startsWith('adhd-') || rel.includes('adhd')) return 'service-adhd';
  if (rel.includes('weight-loss') || rel.includes('metabolic')) return 'service-weight-loss';
  if (rel.includes('mens-health')) return 'service-mens-health';
  if (rel.includes('telehealth') || rel.includes('primary-urgent')) return 'service-telehealth';
  if (rel === 'index.html') return 'home';
  if (rel === 'about.html') return 'about';
  return 'page';
}

function topicTags(rel, title) {
  const t = `${rel} ${title}`.toLowerCase();
  const tags = [];
  if (/adhd|adderall|vyvanse|focalin|stimulant|asrs|creyos/.test(t)) tags.push('adhd');
  if (/weight|glp|semaglutide|tirzepatide|phentermine|obesity|metabolic/.test(t)) tags.push('weight-loss');
  if (/telehealth|online diagnosis|prescription online/.test(t)) tags.push('telehealth');
  if (rel.startsWith('answers/')) tags.push('health-guide');
  if (/labs|thyroid|ferritin|iron|a1c|b12|testosterone|cholesterol|insulin|blood.?test/.test(t)) tags.push('labs');
  if (/california|\bca\b/.test(t)) tags.push('california');
  if (/texas|houston|austin|\btx\b/.test(t)) tags.push('texas');
  if (/pennsylvania|philadelphia|\bpa\b/.test(t)) tags.push('pennsylvania');
  if (/florida|\bfl\b/.test(t)) tags.push('florida');
  if (/testosterone|trt|erectile|sildenafil|mens-health/.test(t)) tags.push('mens-health');
  if (/minoxidil|hair/.test(t)) tags.push('hair-loss');
  if (/sleep|insomnia|ambien/.test(t)) tags.push('sleep');
  if (/medication|meds/.test(t)) tags.push('medication');
  return [...new Set(tags)];
}

function buildPageIndex(htmlFiles) {
  return htmlFiles.flatMap((rel) => {
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    // Skip retired / noindex stubs (EG-P0-01 and similar).
    // /join-our-team stays noindex (SEO). Chatbot reach is via curated fact_careers only — do not add it here.
    if (/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) return [];
    const title = extractTitle(html);
    const description = extractDescription(html);
    const urlPath = fileToUrlPath(rel);
    return [{
      path: urlPath,
      url: `${BASE}${urlPath === '/' ? '/' : urlPath}`,
      title,
      description,
      type: classifyPage(rel, title, description),
      topics: topicTags(rel, title),
      file: rel,
    }];
  });
}

function loadSitemapPaths() {
  const xml = fs.readFileSync(path.join(SITE_ROOT, 'sitemap.xml'), 'utf8');
  const paths = [];
  const seen = new Set();
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    let loc = match[1].trim().replace(/^https:\/\/(?:www\.)?siya\.health/, '') || '/';
    if (!loc.startsWith('/')) loc = `/${loc}`;
    loc = loc.replace(/\/$/, '') || '/';
    if (seen.has(loc)) continue;
    seen.add(loc);
    paths.push(loc);
  }
  return paths;
}

function fileForSitemapPath(urlPath) {
  if (urlPath === '/') return 'index.html';
  const rel = urlPath.slice(1);
  if (fs.existsSync(path.join(SITE_ROOT, `${rel}.html`))) return `${rel}.html`;
  if (fs.existsSync(path.join(SITE_ROOT, rel, 'index.html'))) return `${rel}/index.html`;
  return null;
}

function redirectTarget(urlPath) {
  const vercel = JSON.parse(fs.readFileSync(path.join(SITE_ROOT, 'vercel.json'), 'utf8'));
  const rule = (vercel.redirects || []).find((item) => item.source === urlPath);
  if (!rule || typeof rule.destination !== 'string' || !rule.destination.startsWith('/')) return null;
  const pathOnly = rule.destination.split('#')[0].replace(/\/$/, '') || '/';
  return { pathOnly, destination: rule.destination };
}

function pagesFromSitemap() {
  const allowed = new Set(loadSitemapPaths());
  const pages = [];
  for (const urlPath of loadSitemapPaths()) {
    const rel = fileForSitemapPath(urlPath);
    if (!rel) continue;
    const html = fs.readFileSync(path.join(SITE_ROOT, rel), 'utf8');
    const title = extractTitle(html);
    const description = extractDescription(html).replace(/\s+/g, ' ').trim();
    pages.push({
      path: urlPath,
      url: `${BASE}${urlPath === '/' ? '/' : urlPath}`,
      title,
      description: description || title,
      type: classifyPage(rel, title, description),
      topics: topicTags(rel, title),
      file: rel,
    });
  }
  // Retired paths are not sitemap URLs. If a caller still holds one, the
  // replacement is the vercel.json redirect when that target is current.
  pages.redirectFor = (urlPath) => {
    const target = redirectTarget(urlPath);
    if (!target || !allowed.has(target.pathOnly)) return null;
    return `${BASE}${target.destination}`;
  };
  return pages;
}

function writeLlmsPageList(pages, fileName) {
  const lines = [
    '# Siya Health',
    '',
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    `Total pages: ${pages.length}`,
    '',
  ];
  const sorted = [...pages].sort((a, b) => a.path.localeCompare(b.path));
  for (const page of sorted) {
    lines.push(`- ${page.title}`);
    lines.push(`  URL: ${page.url}`);
    lines.push(`  Summary: ${page.description}`);
    lines.push('');
  }
  fs.writeFileSync(path.join(SITE_ROOT, fileName), `${lines.join('\n').replace(/\n+$/, '\n')}`, 'utf8');
}

function writeLlmsTxt(pages) {
  // Former hard-coded lines for retired answers are not written.
  // Current replacements, from vercel.json, are already sitemap pages:
  // /answers/why-am-i-tired-even-after-sleeping → /guides/exhausted#ex-sleep-link
  // /answers/signs-of-sleep-apnea-in-adults → /guides/sleep#sl-apnea
  // /answers/brain-fog-after-eating → /guides/weight#wt-insulin
  writeLlmsPageList(pages, 'llms.txt');
}

function writeLlmsFullTxt(pages) {
  writeLlmsPageList(pages, 'llms-full.txt');
}

function main() {
  const pages = pagesFromSitemap();
  writeLlmsTxt(pages);
  writeLlmsFullTxt(pages);

  const articles = pages
    .filter((p) => p.type === 'article')
    .sort((a, b) => a.url.localeCompare(b.url))
    .map((p) => ({
      title: p.title,
      url: p.url,
      description: p.description,
      topics: p.topics,
    }));
  const articleIndex = {
    generated: new Date().toISOString().slice(0, 10),
    count: articles.length,
    articles,
  };
  fs.writeFileSync(path.join(SITE_ROOT, 'article-index.json'), JSON.stringify(articleIndex, null, 2) + '\n', 'utf8');

  if (!process.argv.includes('--all-indexes')) {
    console.log('Wrote llms.txt, llms-full.txt, article-index.json');
    console.log('Pages indexed:', pages.length, '| Articles:', articleIndex.count);
    return;
  }

  const htmlFiles = walkHtmlFiles(SITE_ROOT);
  const allPages = buildPageIndex(htmlFiles);
  const providers = ENTITY_GRAPH.providers;
  const providerIndex = {
    generated: new Date().toISOString(),
    hubUrl: `${BASE}/providers`,
    count: providers.length,
    providers: providers.map((p) => ({
      name: p.name,
      slug: p.slug,
      url: p.url,
      jobTitle: p.jobTitle,
      providerType: p.providerType,
      medicalSpecialty: p.medicalSpecialty,
      statesLicensed: p.statesLicensed,
      serviceStates: p.serviceStates || p.statesLicensed,
      conditionsTreated: p.conditionsTreated,
      npi: p.npi || null,
      relatedContent: (p.relatedContent || []).map((u) => `${BASE}${u}`),
    })),
  };

  const serviceIndex = {
    generated: new Date().toISOString(),
    services: allPages
      .filter((p) => p.type.startsWith('service-') || ['home', 'about'].includes(p.type))
      .map((p) => ({ title: p.title, url: p.url, type: p.type, description: p.description })),
  };

  const conditionIndex = {
    generated: new Date().toISOString(),
    conditions: ENTITY_GRAPH.conditions.map((c) => ({
      name: c.name,
      hubUrl: `${BASE}${c.hubUrl}`,
      blogHubUrl: `${BASE}${c.blogHubUrl}`,
      plannedKnowledgeHub: c.knowledgeHubUrl ? `${BASE}${c.knowledgeHubUrl}` : null,
      subtopics: c.subtopics,
      providers: c.providers,
    })),
  };

  const guideIndex = {
    generated: new Date().toISOString(),
    hubUrl: `${BASE}/answers`,
    count: allPages.filter((p) => p.type === 'answer').length,
    guides: allPages
      .filter((p) => p.type === 'answer')
      .map((p) => ({
        title: p.title,
        url: p.url,
        description: p.description,
        topics: p.topics,
      })),
  };

  const labsKeywordIndex = {
    generated: new Date().toISOString(),
    hubUrl: `${BASE}/labs`,
    note: 'Keyword → educational labs topic pages (Siya owns education; storefront is logistics only).',
    keywords: [
      { terms: ['thyroid', 'tsh', 'free t4'], path: '/labs/thyroid', also: ['/labs', '/labs/how-to-read-results'] },
      { terms: ['ferritin', 'iron', 'iron deficiency'], path: '/labs/iron-ferritin', also: ['/labs', '/labs#labs-fatigue'] },
      { terms: ['testosterone', 'free testosterone', 'low t'], path: '/labs#labs-mens', also: ['/labs'] },
      { terms: ['a1c', 'hemoglobin a1c', 'blood sugar', 'glucose'], path: '/labs/a1c-blood-sugar', also: ['/labs'] },
      { terms: ['b12', 'vitamin b12', 'cobalamin'], path: '/labs/vitamin-b12', also: ['/labs', '/labs#labs-fatigue'] },
      { terms: ['cholesterol', 'lipid', 'lipids'], path: '/labs/a1c-blood-sugar', also: ['/labs#labs-preventive'] },
      { terms: ['insulin', 'insulin resistance'], path: '/labs/a1c-blood-sugar', also: ['/labs'] },
      { terms: ['vitamin d'], path: '/labs/vitamin-d', also: ['/labs', '/labs#labs-fatigue', '/brain-fog'] },
      { terms: ['brain fog', 'mental fog', 'cloudy thinking'], path: '/brain-fog', also: ['/fatigue', '/labs#labs-fatigue'] },
      { terms: ['lab results', 'how to read labs', 'reference range'], path: '/labs/how-to-read-results', also: ['/labs'] },
    ],
  };

  fs.writeFileSync(path.join(SITE_ROOT, 'provider-index.json'), JSON.stringify(providerIndex, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(SITE_ROOT, 'service-index.json'), JSON.stringify(serviceIndex, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(SITE_ROOT, 'condition-index.json'), JSON.stringify(conditionIndex, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(SITE_ROOT, 'guide-index.json'), JSON.stringify(guideIndex, null, 2) + '\n', 'utf8');
  fs.writeFileSync(path.join(SITE_ROOT, 'labs-keyword-index.json'), JSON.stringify(labsKeywordIndex, null, 2) + '\n', 'utf8');

  console.log('Wrote llms.txt, llms-full.txt, provider/service/condition/article/guide/labs-keyword indexes');
  console.log('Pages indexed:', pages.length, '| Articles:', articleIndex.count, '| Guides:', guideIndex.count);
}

main();
