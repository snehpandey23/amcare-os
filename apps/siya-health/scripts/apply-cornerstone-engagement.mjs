/**
 * Inject engagement components into metabolic cornerstone blogs.
 * Run: node scripts/apply-cornerstone-engagement.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  CORNERSTONE_ENGAGEMENT,
  dedupeClinicalReview,
} from './blog-engagement-components.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'blog');

const INSERT_AFTER = {
  'food-noise-and-glp-1-what-it-means-and-what-helps': [
    { marker: '<div class="blog-internal-links">', key: 'afterInternalLinks', position: 'after' },
    {
      marker: '<h2>Why this happens: homeostatic hunger, hedonic eating, and “noise”</h2>',
      key: 'afterWhyThisHappens',
      position: 'before',
    },
    {
      marker: 'Both deserve a medical and behavioral framework that matches biology, psychology, and access to care.</p>',
      key: 'afterRealWorldProblem',
      position: 'after',
    },
    { marker: '<h2>What current evidence says about GLP-1 and food noise</h2>', key: 'beforeEvidence', position: 'before' },
    {
      marker: 'led some participants to stop treatment.</p>',
      key: 'afterStepTrial',
      position: 'after',
    },
    { marker: '<h2>Common myths patients encounter online</h2>', key: 'beforeMyths', position: 'before' },
    { marker: '<h2>Practical takeaways if you are considering GLP-1 therapy</h2>', key: 'beforePracticalTakeaways', position: 'before' },
    { marker: '<h2>When to seek medical evaluation</h2>', key: 'beforeWhenToSeek', position: 'before' },
  ],
  'insulin-resistance-and-weight-loss-clinician-overview': [
    { marker: '<div class="blog-internal-links">', key: 'afterInternalLinks', position: 'after' },
    { marker: '<h2>Early signs people miss</h2>', key: 'afterWhatIs', position: 'before' },
    { marker: '<h2>Why weight loss becomes harder</h2>', key: 'afterEarlySigns', position: 'before' },
    { marker: '<h2>Current evidence: what actually moves insulin sensitivity</h2>', key: 'beforeEvidence', position: 'before' },
    { marker: '<h2>Cravings, food noise, and insulin resistance</h2>', key: 'afterFoodNoise', position: 'after' },
    { marker: '<h2>Common myths</h2>', key: 'beforeMyths', position: 'before' },
    { marker: '<h2>Practical next steps</h2>', key: 'beforePractical', position: 'before' },
    { marker: '<h2>FAQ</h2>', key: 'beforeFaq', position: 'before' },
  ],
  'why-am-i-always-tired-causes-when-to-see-doctor': [
    { marker: '<div class="blog-internal-links">', key: 'afterInternalLinks', position: 'after' },
    { marker: '<h2>Common causes, organized the way clinicians think</h2>', key: 'afterWhatFatigueMeans', position: 'before' },
    { marker: '<h2>Common myths</h2>', key: 'beforeMyths', position: 'before' },
    { marker: '<h2>Conditions frequently missed</h2>', key: 'afterMissedDiagnoses', position: 'after' },
    { marker: '<h2>Practical next steps (before your appointment)</h2>', key: 'beforePractical', position: 'before' },
    { marker: '<h2>When to seek medical evaluation</h2>', key: 'beforeWhenToSeek', position: 'before' },
    { marker: '<h2>FAQ</h2>', key: 'beforeFaq', position: 'before' },
  ],
  'free-testosterone-vs-total-testosterone-what-patients-should-know': [
    { marker: '<div class="blog-internal-links">', key: 'afterInternalLinks', position: 'after' },
    { marker: '<h2>What total testosterone measures</h2>', key: 'afterHook', position: 'before' },
    { marker: '<h2>Why both matter</h2>', key: 'afterWhyBothMatter', position: 'after' },
    { marker: '<h2>Current evidence patients should know</h2>', key: 'beforeEvidence', position: 'before' },
    { marker: '<h2>Common myths</h2>', key: 'beforeMyths', position: 'before' },
    { marker: '<h2>Practical next steps</h2>', key: 'beforePractical', position: 'before' },
    { marker: '<h2>When evaluation is appropriate</h2>', key: 'beforeWhenEval', position: 'before' },
  ],
  'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': [
    { marker: '<div class="blog-internal-links">', key: 'afterInternalLinks', position: 'after' },
    { marker: '<h2>Why sleep apnea is frequently missed</h2>', key: 'beforeWhyMissed', position: 'before' },
    { marker: '<h2>Common symptoms beyond snoring</h2>', key: 'beforeSymptoms', position: 'before' },
    {
      marker: '<h2>Relationship with fatigue</h2>',
      key: 'afterSymptoms',
      position: 'before',
    },
    { marker: '<h2>Practical next steps</h2>', key: 'beforePractical', position: 'before' },
    { marker: '<h2>FAQ</h2>', key: 'afterPractical', position: 'before' },
  ],
};

function insertAfterInternalLinks(html, snippet) {
  if (html.includes('blog-engage--takeaway')) return html;
  const re = /(<div class="blog-internal-links">[\s\S]*?<\/div>)/;
  if (!re.test(html)) {
    console.warn('blog-internal-links block not found');
    return html;
  }
  return html.replace(re, `$1${snippet}`);
}

function snippetAlreadyPresent(html, snippet) {
  const typeMatch = snippet.match(/blog-engage--([a-z]+)/);
  if (typeMatch) return html.includes(`blog-engage--${typeMatch[1]}`);
  const ariaMatch = snippet.match(/aria-label="([^"]+)"/);
  if (ariaMatch) return html.includes(`aria-label="${ariaMatch[1]}"`);
  return html.includes(snippet.trim().slice(0, 80));
}

function insertAfterMarker(html, marker, snippet) {
  if (snippetAlreadyPresent(html, snippet)) return html;
  const idx = html.indexOf(marker);
  if (idx === -1) {
    console.warn('Marker not found:', marker.slice(0, 60));
    return html;
  }
  const insertAt = idx + marker.length;
  return html.slice(0, insertAt) + snippet + html.slice(insertAt);
}

function insertBeforeMarker(html, marker, snippet) {
  if (snippetAlreadyPresent(html, snippet)) return html;
  const idx = html.indexOf(marker);
  if (idx === -1) {
    console.warn('Marker not found:', marker.slice(0, 60));
    return html;
  }
  return html.slice(0, idx) + snippet + html.slice(idx);
}

function applyEngagement(slug) {
  const file = path.join(BLOG_DIR, `${slug}.html`);
  let html = fs.readFileSync(file, 'utf8');
  html = dedupeClinicalReview(html);

  const bundle = CORNERSTONE_ENGAGEMENT[slug];
  const plan = INSERT_AFTER[slug];
  if (!bundle || !plan) {
    console.warn('Skip', slug);
    return;
  }

  for (const step of plan) {
    const snippet = bundle[step.key];
    if (!snippet) continue;
    if (step.key === 'afterInternalLinks') {
      html = insertAfterInternalLinks(html, snippet);
      continue;
    }
    html =
      step.position === 'after'
        ? insertAfterMarker(html, step.marker, snippet)
        : insertBeforeMarker(html, step.marker, snippet);
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log('Updated', slug);
}

for (const slug of Object.keys(CORNERSTONE_ENGAGEMENT)) {
  applyEngagement(slug);
}
