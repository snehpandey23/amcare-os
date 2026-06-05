/**
 * Generate docs/REVIEW-QUEUE.csv — all public blog articles + Health Guides.
 * Run: node scripts/generate-review-queue.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(__dirname, '..');
const OUT = path.join(SITE, 'docs', 'REVIEW-QUEUE.csv');

const BLOG_HUBS = new Set(['index.html', 'all.html', 'adhd.html', 'weight-loss.html', 'telehealth.html']);
const REVIEWERS = ['Reviewer A', 'Reviewer B', 'Reviewer C', 'Reviewer D', 'Reviewer E'];

const CATEGORY_LABEL = {
  adhd: 'ADHD',
  metabolic: 'Metabolic Health',
  energy: 'Energy & Fatigue',
  hormone: 'Hormone Health',
  telehealth: 'Telehealth',
  'weight-loss': 'Metabolic Health',
  'mens-health': 'Hormone Health',
};

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordCountFromHtml(html) {
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const block = main ? main[1] : html;
  const text = stripTags(block);
  return text.split(/\s+/).filter(Boolean).length;
}

function reviewStatusFromHtml(html) {
  if (/clinical-review--reviewed/i.test(html)) return 'Clinically reviewed';
  if (/clinical-review--pending/i.test(html)) return 'Pending physician review';
  if (/clinical-review-label[^>]*>Physician reviewed/i.test(html)) return 'Clinically reviewed';
  return 'Unknown';
}

function titleFromHtml(html) {
  const t = html.match(/<title>([^<]+)<\/title>/i);
  if (t) return decodeHtml(t[1].replace(/\s*\|\s*Siya Health\s*$/i, '').trim());
  const h1 = html.match(/<h1[^>]*>([^<]+)</i);
  return h1 ? decodeHtml(h1[1].trim()) : '';
}

function blogCategory(slug, title) {
  const t = `${slug} ${title}`.toLowerCase();
  if (/testosterone|trt|sildenafil|erectile|minoxidil|libido|glutathione|peptide/.test(t)) {
    return 'Hormone Health';
  }
  if (/sleep-apnea|apnea|insomnia|ambien|always-tired|fatigue|modafinil/.test(t)) {
    return 'Energy & Fatigue';
  }
  if (/glp|semaglutide|tirzepatide|phentermine|weight|food-noise|insulin|metabolic|dieting|obesity/.test(t)) {
    return 'Metabolic Health';
  }
  if (/adhd|adderall|vyvanse|focalin|stimulant|asrs|creyos|executive|lazy/.test(t)) {
    return 'ADHD';
  }
  if (/telehealth|prescription|online-diagnosis|screening/.test(t)) {
    return 'Telehealth';
  }
  return 'Telehealth';
}

function guideCategory(seed) {
  if (seed.hubCategories?.length) {
    const id = seed.hubCategories[0];
    return CATEGORY_LABEL[id] || id;
  }
  return CATEGORY_LABEL[seed.topic] || seed.topic;
}

function csvEscape(val) {
  const s = String(val ?? '');
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function csvRow(cols) {
  return cols.map(csvEscape).join(',');
}

const seedBySlug = new Map(ANSWER_SEEDS.map((s) => [s.slug, s]));
const rows = [];

for (const file of fs.readdirSync(path.join(SITE, 'blog')).sort()) {
  if (!file.endsWith('.html') || BLOG_HUBS.has(file)) continue;
  const slug = file.replace(/\.html$/, '');
  const html = fs.readFileSync(path.join(SITE, 'blog', file), 'utf8');
  const title = titleFromHtml(html);
  rows.push({
    type: 'Blog',
    title,
    url: `https://siya.health/blog/${slug}`,
    category: blogCategory(slug, title),
    wordCount: wordCountFromHtml(html),
    reviewStatus: reviewStatusFromHtml(html),
  });
}

for (const file of fs.readdirSync(path.join(SITE, 'answers')).sort()) {
  if (file === 'index.html') continue;
  const slug = file.replace(/\.html$/, '');
  const html = fs.readFileSync(path.join(SITE, 'answers', file), 'utf8');
  const seed = seedBySlug.get(slug);
  const title = seed?.question || titleFromHtml(html);
  rows.push({
    type: 'Health Guide',
    title,
    url: `https://siya.health/answers/${slug}`,
    category: seed ? guideCategory(seed) : 'Telehealth',
    wordCount: wordCountFromHtml(html),
    reviewStatus: reviewStatusFromHtml(html),
  });
}

rows.sort((a, b) => {
  if (a.type !== b.type) return a.type === 'Blog' ? -1 : 1;
  return a.url.localeCompare(b.url);
});

rows.forEach((r, i) => {
  r.assignedReviewer = REVIEWERS[i % REVIEWERS.length];
});

const header = ['Type', 'Title', 'URL', 'Category', 'WordCount', 'ReviewStatus', 'AssignedReviewer'];
const lines = [header.join(','), ...rows.map((r) => csvRow([r.type, r.title, r.url, r.category, r.wordCount, r.reviewStatus, r.assignedReviewer]))];
fs.writeFileSync(OUT, lines.join('\n') + '\n');

const blogs = rows.filter((r) => r.type === 'Blog');
const guides = rows.filter((r) => r.type === 'Health Guide');
const perReviewer = Object.fromEntries(REVIEWERS.map((r) => [r, 0]));
for (const row of rows) perReviewer[row.assignedReviewer]++;

console.log('Wrote', OUT);
console.log('Total Blogs:', blogs.length);
console.log('Total Health Guides:', guides.length);
console.log('Total URLs:', rows.length);
for (const r of REVIEWERS) {
  console.log(`URLs per ${r}:`, perReviewer[r]);
}
