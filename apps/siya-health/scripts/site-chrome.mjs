/**
 * Sitewide chrome: nav, footer, service learn-more blocks, blog Continue Reading.
 * Applied by seo-build.mjs on every HTML file.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import {
  COPY_STANDARDS,
  FOOTER_STATES_LINE,
  LEGACY_FOOTER_PATTERNS,
  LEGAL_LINKS,
  STATES_BULLET,
  STATES_INLINE,
} from '../data/site-standards.mjs';
import {
  BOOKING_LINK,
  getAllProviders,
  getProvidersForServicePage,
  bookingLinkWithAttribution,
  resolveProviderPhoto,
  stateChipLabel,
} from '../data/providers.mjs';
import { buildClientIntakeConfig, GHL_BOOKING_URL } from '../data/ghl-intake-config.mjs';
import { buildSiyaCircleClientConfig } from '../data/siya-circle-config.mjs';

function escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function renderCareTeamPhoto(p, width, height) {
  const photo = resolveProviderPhoto(p);
  const src = `/${photo.src}`;
  if (!photo.pending) {
    return `<img src="${src}" alt="${escAttr(photo.alt)}" width="${width}" height="${height}" loading="lazy" />`;
  }
  return `<div class="provider-photo-wrap provider-photo-wrap--pending provider-photo-wrap--compact">
              <img src="${src}" alt="${escAttr(photo.alt)}" width="${width}" height="${height}" loading="lazy" class="provider-photo-img provider-photo-img--placeholder" />
              <span class="provider-photo-initials" aria-hidden="true">${escAttr(photo.initials)}</span>
            </div>`;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

/** Primary nav label for /answers (URL unchanged for SEO) */
export const NAV_HEALTH_GUIDES = { path: '/answers', label: 'Health Guides', shortLabel: 'Health guides' };
export const NAV_PROVIDERS = { path: '/providers', label: 'Our Care Team', shortLabel: 'Our Care Team' };

export const MEET_GREET_URL = BOOKING_LINK;

const NAV_CTA_MEET_GREET = `<a class="button" href="${MEET_GREET_URL}" target="_blank" rel="noopener">${COPY_STANDARDS.primaryCta}</a>`;
const NAV_CTA_ADHD_EVAL = `<a class="button" href="${MEET_GREET_URL}" target="_blank" rel="noopener">${COPY_STANDARDS.adhdPrimaryCta}</a>`;
const NAV_CTA_SCREENING = `<a class="button" href="/adhd-screening">${COPY_STANDARDS.adhdSecondaryCta}</a>`;

/** Pages that keep ADHD screening as the primary nav CTA */
const ADHD_FUNNEL_PATH = [
  /^adhd-care\.html$/,
  /^adhd-screening\.html$/,
  /^adult-adhd-diagnosis\.html$/,
  /^adhd-treatment-online\.html$/,
  /^adhd-evaluation-cost\.html$/,
  /^creyos-adhd-testing\.html$/,
  /^online-adhd-test\.html$/,
  /^adhd-diagnosis-.+\.html$/,
  /^blog\/adhd\.html$/,
];

export function isAdhdFunnelPage(relPath) {
  if (ADHD_FUNNEL_PATH.some((re) => re.test(relPath))) return true;
  if (/^blog\/.+adhd/i.test(relPath)) return true;
  return false;
}

/** ADHD funnels that require the extended screening/medication disclaimer in legal gate */
export function isAdhdLegalContext(relPath) {
  if (isAdhdFunnelPage(relPath)) return true;
  if (/^answers\/.*adhd/i.test(relPath)) return true;
  return false;
}

/** Pages that must link to the Controlled Substance Treatment Agreement */
export function isControlledSubstanceLinkPage(relPath) {
  if (isAdhdFunnelPage(relPath) || isAdhdLegalContext(relPath)) return true;
  if (/^adhd-diagnosis-/.test(relPath)) return true;
  if (relPath === 'membership-pricing.html' || relPath === 'adhd-evaluation-cost.html') return true;
  if (/^blog\/.+adhd/i.test(relPath)) return true;
  if (/^blog\/.*(medication|vyvanse|adderall|focalin|stimulant|ritalin|prescribed-online)/i.test(relPath)) {
    return true;
  }
  return false;
}

const BLOG_HUB_FILES = new Set([
  'blog/index.html',
  'blog/all.html',
  'blog/adhd.html',
  'blog/weight-loss.html',
  'blog/telehealth.html',
]);

const SERVICE_BY_TOPIC = {
  adhd: { path: '/adhd-care', label: 'ADHD evaluation and telehealth care' },
  metabolic: { path: '/weight-loss-metabolic-health', label: 'Medical weight loss programs' },
  hormone: { path: '/mens-health-longevity', label: "Men's health and longevity care" },
  energy: { path: '/telehealth', label: 'Telehealth and sleep-related care' },
  general: { path: '/telehealth', label: 'Telehealth services' },
};

const DEFAULT_ANSWER_BY_TOPIC = {
  adhd: '/answers/signs-of-adult-adhd',
  metabolic: '/answers/semaglutide-weight-loss-how-it-works',
  hormone: '/answers/what-is-free-testosterone',
  energy: '/answers/why-am-i-tired-even-after-sleeping',
  general: '/answers/is-telehealth-legitimate',
};

/** Cornerstone cluster: forced Continue reading (2 sibling blogs + answer + service) */
export const CORNERSTONE_BLOG_PATHS = {
  FOOD_NOISE: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  INSULIN: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  FATIGUE: '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
  SLEEP_APNEA: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
  FREE_T: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
};

const CORNERSTONE_CONTINUE_READING = {
  [CORNERSTONE_BLOG_PATHS.FOOD_NOISE]: {
    siblings: [CORNERSTONE_BLOG_PATHS.INSULIN, CORNERSTONE_BLOG_PATHS.FATIGUE],
    answer: '/answers/what-is-food-noise',
    service: SERVICE_BY_TOPIC.metabolic,
  },
  [CORNERSTONE_BLOG_PATHS.INSULIN]: {
    siblings: [CORNERSTONE_BLOG_PATHS.FOOD_NOISE, CORNERSTONE_BLOG_PATHS.FATIGUE],
    answer: '/answers/what-is-insulin-resistance',
    service: SERVICE_BY_TOPIC.metabolic,
  },
  [CORNERSTONE_BLOG_PATHS.FATIGUE]: {
    siblings: [CORNERSTONE_BLOG_PATHS.SLEEP_APNEA, CORNERSTONE_BLOG_PATHS.INSULIN],
    answer: '/answers/why-am-i-tired-even-after-sleeping',
    service: SERVICE_BY_TOPIC.energy,
  },
  [CORNERSTONE_BLOG_PATHS.SLEEP_APNEA]: {
    siblings: [CORNERSTONE_BLOG_PATHS.FATIGUE, CORNERSTONE_BLOG_PATHS.INSULIN],
    answer: '/answers/can-sleep-apnea-cause-fatigue',
    service: SERVICE_BY_TOPIC.energy,
  },
  [CORNERSTONE_BLOG_PATHS.FREE_T]: {
    siblings: [CORNERSTONE_BLOG_PATHS.FATIGUE, CORNERSTONE_BLOG_PATHS.INSULIN],
    answer: '/answers/what-is-free-testosterone',
    service: SERVICE_BY_TOPIC.hormone,
  },
};

/** Descriptive anchors for Continue Reading / Learn More */
export const ANCHOR_LABELS = {
  '/blog/adhd': 'ADHD articles and clinical guides',
  '/blog/weight-loss': 'Medical weight loss articles',
  '/blog/telehealth': 'Telehealth and online care articles',
  '/answers/signs-of-adult-adhd': 'Signs of adult ADHD (quick health guide)',
  '/answers/semaglutide-weight-loss-how-it-works': 'How quickly semaglutide starts working (FAQ)',
  '/answers/glp-1-side-effects': 'GLP-1 side effects that improve with titration (FAQ)',
  '/answers/tirzepatide-vs-semaglutide': 'Who might consider tirzepatide instead of semaglutide (FAQ)',
  '/answers/is-online-adhd-diagnosis-legitimate': 'Legitimate online ADHD diagnosis checklist (FAQ)',
  '/answers/when-is-testosterone-therapy-appropriate': 'Symptoms that warrant TRT evaluation (FAQ)',
  '/answers/adhd-and-weight-loss-connection': 'ADHD and weight loss struggles',
  '/creyos-adhd-testing': 'Creyos cognitive testing for ADHD',
  '/adhd-evaluation-cost': 'ADHD evaluation cost and what is included',
  '/blog/online-adhd-diagnosis-california': 'Online ADHD diagnosis in California',
  '/blog/online-adhd-diagnosis-texas': 'Online ADHD diagnosis in Texas',
  '/adhd-care': 'ADHD evaluation and ongoing care',
  '/weight-loss-metabolic-health': 'Medical weight loss program',
  '/adult-adhd-diagnosis': 'Book a $199 adult ADHD evaluation',
  '/adhd-screening': 'Free 2-minute ADHD screening',
  '/answers': 'Browse all health guides',
  '/primary-urgent-care': 'Primary and urgent telehealth care',
  '/labs': 'Diagnostic lab services',
  '/prescriptions': 'Online prescription services',
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps': 'Food noise and GLP-1 guide',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview': 'Insulin resistance and weight loss',
  '/blog/why-am-i-always-tired-causes-when-to-see-doctor': 'Why am I always tired?',
  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': 'Sleep apnea, fatigue, and metabolic risk',
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know': 'Free vs total testosterone',
  '/answers/can-sleep-apnea-cause-fatigue': 'Can sleep apnea cause fatigue?',
  '/answers/signs-of-sleep-apnea-in-adults': 'Signs of sleep apnea in adults',
  '/answers/what-is-food-noise': 'What is food noise?',
  '/answers/what-is-insulin-resistance': 'What is insulin resistance?',
  '/answers/why-am-i-tired-even-after-sleeping': 'Tired after sleeping',
  '/mens-health-longevity': "Men's health and longevity",
};

const ANSWER_QUESTIONS = Object.fromEntries(ANSWER_SEEDS.map((s) => [`/answers/${s.slug}`, s.question]));

const LEARN_MORE_ADHD = `<!-- SIYA:LEARN-MORE-ADHD -->
      <section class="section section-tinted learn-more-cluster" id="learn-more-adhd" aria-labelledby="learn-more-adhd-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-adhd-heading">Learn More About ADHD</h2>
            <p class="lead">Explore Health Guides, articles, and evaluation resources from Siya Health physicians.</p>
          </div>
          <ul class="learn-more-links">
            <li><a href="/blog/why-am-i-always-tired-causes-when-to-see-doctor">Why am I always tired? (clinician guide)</a></li>
            <li><a href="/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign">Sleep apnea, fatigue, and metabolic risk</a></li>
            <li><a href="/blog/adhd">ADHD articles and state-specific guides</a></li>
            <li><a href="/answers/why-am-i-tired-even-after-sleeping">Tired after sleeping — health guide</a></li>
            <li><a href="/answers/signs-of-adult-adhd">Signs of adult ADHD — health guide</a></li>
            <li><a href="/creyos-adhd-testing">Creyos cognitive testing for ADHD evaluations</a></li>
            <li><a href="/adhd-evaluation-cost">ADHD evaluation cost and what is included</a></li>
            <li><a href="/blog/online-adhd-diagnosis-california">Online ADHD diagnosis in California</a></li>
            <li><a href="/blog/online-adhd-diagnosis-texas">Online ADHD diagnosis in Texas</a></li>
          </ul>
        </div>
      </section>
      <!-- /SIYA:LEARN-MORE-ADHD -->`;

function buildMeetPhysiciansBlock(serviceKey, lead, stateAbbr = null) {
  const providers = getProvidersForServicePage(serviceKey, { stateAbbr });
  const stateNote = stateAbbr
    ? `<p class="provider-state-filter-note">Showing clinicians licensed in <strong>${stateAbbr}</strong>.</p>`
    : '';
  const cards = providers
    .map(
      (p) => `            <article class="about-team-card" data-states="${p.stateAbbreviations.join(',')}">
              ${renderCareTeamPhoto(p, 88, 88)}
              <h3><a href="/providers/${p.slug}">${p.name}</a></h3>
              <p class="about-team-tagline">${p.servicePageTagline} · ${stateChipLabel(p)}</p>
              <a class="text-link" href="/providers/${p.slug}">View profile →</a>
            </article>`,
    )
    .join('\n');
  return `<!-- SIYA:MEET-PHYSICIANS -->
      <section class="section" id="meet-physicians" aria-labelledby="meet-physicians-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="meet-physicians-heading">Meet our care team</h2>
            <p class="lead">${lead}</p>
            ${stateNote}
          </div>
          <div class="about-team-grid">
${cards}
          </div>
          <p class="blog-hub-see-all"><a href="/providers">View full care team</a></p>
        </div>
      </section>
      <!-- /SIYA:MEET-PHYSICIANS -->`;
}

const GEO_PAGE_STATE = {
  'adhd-diagnosis-texas.html': 'TX',
  'adhd-diagnosis-houston.html': 'TX',
  'adhd-diagnosis-austin.html': 'TX',
  'adhd-diagnosis-florida.html': 'FL',
  'adhd-diagnosis-pennsylvania.html': 'PA',
  'adhd-diagnosis-philadelphia.html': 'PA',
  'blog/online-adhd-diagnosis-texas.html': 'TX',
  'blog/online-adhd-diagnosis-california.html': 'CA',
};

function resolveMeetPhysiciansConfig(relPath) {
  if (MEET_PHYSICIANS_BY_PAGE[relPath]) {
    const key = relPath.replace('.html', '').replace('weight-loss-metabolic-health', 'weight-loss-metabolic-health');
    const map = {
      'adhd-care.html': 'adhd-care',
      'telehealth.html': 'telehealth',
      'weight-loss-metabolic-health.html': 'weight-loss-metabolic-health',
      'mens-health-longevity.html': 'mens-health-longevity',
    };
    return { serviceKey: map[relPath], stateAbbr: null };
  }
  if (relPath === 'primary-urgent-care.html') {
    return { serviceKey: 'primary-urgent-care', stateAbbr: null };
  }
  if (/^adhd-diagnosis-/.test(relPath) || GEO_PAGE_STATE[relPath]) {
    return { serviceKey: 'adhd-care', stateAbbr: GEO_PAGE_STATE[relPath] || null };
  }
  if (['adult-adhd-diagnosis.html', 'adhd-treatment-online.html', 'online-adhd-test.html'].includes(relPath)) {
    return { serviceKey: 'adhd-care', stateAbbr: null };
  }
  if (/^blog\/online-adhd-diagnosis-/.test(relPath)) {
    return { serviceKey: 'adhd-care', stateAbbr: GEO_PAGE_STATE[relPath] || null };
  }
  return null;
}

const MEET_PHYSICIANS_BY_PAGE = {
  'adhd-care.html': () => buildMeetPhysiciansBlock('adhd-care', 'Board-certified clinicians on your ADHD care team.'),
  'telehealth.html': () => buildMeetPhysiciansBlock('telehealth', 'Licensed telehealth clinicians—availability varies by state.'),
  'weight-loss-metabolic-health.html': () =>
    buildMeetPhysiciansBlock('weight-loss-metabolic-health', 'Provider-led medical weight loss and metabolic care.'),
  'mens-health-longevity.html': () =>
    buildMeetPhysiciansBlock('mens-health-longevity', "Evidence-based men's health and hormone care."),
  'primary-urgent-care.html': () =>
    buildMeetPhysiciansBlock('primary-urgent-care', 'Family medicine clinicians for primary and urgent telehealth.'),
};

const LEARN_MORE_WEIGHT = `<!-- SIYA:LEARN-MORE-WEIGHT -->
      <section class="section section-tinted learn-more-cluster" id="learn-more-weight-loss" aria-labelledby="learn-more-weight-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-weight-heading">Learn More About Medical Weight Loss</h2>
            <p class="lead">Evidence-based articles and short Health Guides on GLP-1 therapy, side effects, and ADHD–weight connections.</p>
          </div>
          <ul class="learn-more-links">
            <li><a href="/blog/why-am-i-always-tired-causes-when-to-see-doctor">Why am I always tired? causes and when to see a doctor</a></li>
            <li><a href="/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign">Sleep apnea and metabolic risk (when snoring is not benign)</a></li>
            <li><a href="/blog/insulin-resistance-and-weight-loss-clinician-overview">Insulin resistance and weight loss (clinician overview)</a></li>
            <li><a href="/blog/food-noise-and-glp-1-what-it-means-and-what-helps">Food noise and GLP-1</a></li>
            <li><a href="/blog/free-testosterone-vs-total-testosterone-what-patients-should-know">Free vs total testosterone</a></li>
            <li><a href="/answers/what-is-food-noise">What is food noise?</a></li>
            <li><a href="/answers/what-is-insulin-resistance">What is insulin resistance?</a></li>
            <li><a href="/blog/weight-loss">More medical weight loss articles</a></li>
            <li><a href="/answers/semaglutide-weight-loss-how-it-works">How quickly semaglutide starts working (FAQ)</a></li>
            <li><a href="/answers/glp-1-side-effects">GLP-1 side effects that improve with titration (FAQ)</a></li>
            <li><a href="/answers/adhd-and-weight-loss-connection">ADHD and weight loss struggles</a></li>
          </ul>
        </div>
      </section>
      <!-- /SIYA:LEARN-MORE-WEIGHT -->`;

const LEARN_MORE_MENS = `<!-- SIYA:LEARN-MORE-MENS -->
      <section class="section section-tinted learn-more-cluster" id="learn-more-mens-health" aria-labelledby="learn-more-mens-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-mens-heading">Learn More About Men's Hormone Health</h2>
            <p class="lead">Evidence-based guides on testosterone labs, symptoms, and when therapy is appropriate—not anti-aging hype.</p>
          </div>
          <ul class="learn-more-links">
            <li><a href="/blog/free-testosterone-vs-total-testosterone-what-patients-should-know">Free vs total testosterone: what patients should know</a></li>
            <li><a href="/answers/what-is-free-testosterone">What is free testosterone?</a></li>
            <li><a href="/answers/what-does-low-testosterone-feel-like">What does low testosterone feel like?</a></li>
            <li><a href="/blog/when-is-testosterone-therapy-appropriate">When is testosterone therapy appropriate?</a></li>
            <li><a href="/answers/testosterone-and-adhd-overlap">Testosterone and ADHD overlap</a></li>
            <li><a href="/blog/why-am-i-always-tired-causes-when-to-see-doctor">Why am I always tired?</a></li>
            <li><a href="/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign">Sleep apnea, fatigue, and metabolic risk</a></li>
            <li><a href="/blog/insulin-resistance-and-weight-loss-clinician-overview">Insulin resistance and weight loss</a></li>
            <li><a href="/blog/food-noise-and-glp-1-what-it-means-and-what-helps">Food noise and GLP-1</a></li>
            <li><a href="/answers/what-is-food-noise">What is food noise?</a></li>
          </ul>
        </div>
      </section>
      <!-- /SIYA:LEARN-MORE-MENS -->`;

const LEARN_MORE_TELE = `<!-- SIYA:LEARN-MORE-TELE -->
      <section class="section section-tinted learn-more-cluster" id="learn-more-telehealth" aria-labelledby="learn-more-tele-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-tele-heading">Learn More About Virtual Care</h2>
            <p class="lead">Clinical guides on fatigue, metabolic health, hormones, and when telehealth is the right fit.</p>
          </div>
          <ul class="learn-more-links">
            <li><a href="/blog/why-am-i-always-tired-causes-when-to-see-doctor">Why am I always tired?</a></li>
            <li><a href="/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign">Sleep apnea and metabolic risk</a></li>
            <li><a href="/answers/why-am-i-tired-even-after-sleeping">Tired even after sleeping</a></li>
            <li><a href="/answers/can-sleep-apnea-cause-fatigue">Can sleep apnea cause fatigue?</a></li>
            <li><a href="/blog/insulin-resistance-and-weight-loss-clinician-overview">Insulin resistance overview</a></li>
            <li><a href="/blog/food-noise-and-glp-1-what-it-means-and-what-helps">Food noise &amp; GLP-1</a></li>
            <li><a href="/blog/free-testosterone-vs-total-testosterone-what-patients-should-know">Free vs total testosterone</a></li>
            <li><a href="/answers/what-is-food-noise">What is food noise?</a></li>
            <li><a href="/weight-loss-metabolic-health">Metabolic health services</a></li>
            <li><a href="/mens-health-longevity">Men's health &amp; longevity</a></li>
            <li><a href="/adhd-care">ADHD care</a></li>
          </ul>
        </div>
      </section>
      <!-- /SIYA:LEARN-MORE-TELE -->`;

export function topicFromPath(p, title = '') {
  const t = `${p} ${title}`.toLowerCase();
  if (/adhd|adderall|vyvanse|focalin|asrs|creyos|stimulant|executive|rejection|time-blindness/.test(t)) return 'adhd';
  if (/fatigue|always tired|exhausted|burnout|brain fog|low energy/.test(t)) return 'energy';
  if (/weight|glp|semaglutide|tirzepatide|phentermine|metabolic|obesity|food/.test(t)) return 'metabolic';
  if (/testosterone|trt|sildenafil|erectile|minoxidil|libido|fertility|shbg|hormone|mens-health/.test(t)) return 'hormone';
  if (/sleep|insomnia|ambien|fatigue|burnout|recovery|energy|modafinil/.test(t)) return 'energy';
  if (/telehealth|prescription|online-care|meet-and-greet/.test(t)) return 'general';
  return 'general';
}

function slugToLabel(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bGlp\b/gi, 'GLP')
    .replace(/\bAdhd\b/gi, 'ADHD')
    .replace(/\bTrt\b/gi, 'TRT');
}

function anchorFor(path, fallbackTitle) {
  if (ANCHOR_LABELS[path]) return ANCHOR_LABELS[path];
  if (path.startsWith('/answers/') && ANSWER_QUESTIONS[path]) {
    const q = ANSWER_QUESTIONS[path];
    return q.length > 72 ? `${q.slice(0, 69)}…` : q;
  }
  const cleaned = (fallbackTitle || '').replace(/\s*\|\s*Siya Health\s*$/i, '').trim();
  if (cleaned && !cleaned.startsWith('/')) return cleaned;
  if (path.startsWith('/blog/')) return slugToLabel(path.replace('/blog/', ''));
  return slugToLabel(path.replace(/^\//, '').replace(/\//g, ' '));
}

function injectAnswersInNavBlock(navHtml) {
  const link = `<a href="${NAV_HEALTH_GUIDES.path}">${NAV_HEALTH_GUIDES.label}</a>`;
  if (navHtml.includes(`href="${NAV_HEALTH_GUIDES.path}">${NAV_HEALTH_GUIDES.label}</a>`)) return navHtml;
  if (navHtml.includes('href="/answers">Answers</a>')) {
    return navHtml.replaceAll('href="/answers">Answers</a>', `href="${NAV_HEALTH_GUIDES.path}">${NAV_HEALTH_GUIDES.label}</a>`);
  }
  if (!navHtml.includes('href="/blog">Blog</a>')) return navHtml;
  return navHtml.replace(/(<a href="\/blog">Blog<\/a>)/, `${link}\n          $1`);
}

export function injectAnswersNav(html) {
  html = html.replace(/<nav class="nav-center"[\s\S]*?<\/nav>/gi, (nav) => injectAnswersInNavBlock(nav));
  html = html.replace(/<div class="nav-mobile">[\s\S]*?<\/div>/gi, (nav) => injectAnswersInNavBlock(nav));
  return html;
}

/** Sitewide nav CTA: Talk to a Clinician default; Book ADHD Evaluation on ADHD funnels */
export function injectNavCta(html, relPath) {
  if (relPath.startsWith('answers/')) return html;

  const meetBtn = isAdhdFunnelPage(relPath) ? NAV_CTA_ADHD_EVAL : NAV_CTA_MEET_GREET;
  html = html.replace(
    /<div class="nav-cta">\s*<a class="button"[^>]*>[\s\S]*?<\/a>\s*<\/div>/gi,
    `<div class="nav-cta">\n          ${meetBtn}\n        </div>`,
  );
  html = html.replace(
    /(<div class="nav-mobile">[\s\S]*?)<a class="button"[^>]*href="[^"]*adhd-screening[^"]*"[^>]*>[\s\S]*?<\/a>/gi,
    `$1${meetBtn}`,
  );
  html = html.replace(
    /(<div class="nav-mobile">[\s\S]*?)<a class="button"[^>]*href="[^"]*yourmarketingai[^"]*"[^>]*>Book Free Consultation<\/a>/gi,
    `$1${meetBtn}`,
  );
  html = html.replace(
    /(<div class="nav-mobile">[\s\S]*?)<a class="button"[^>]*href="[^"]*carepatron[^"]*"[^>]*>[\s\S]*?<\/a>/gi,
    `$1${meetBtn}`,
  );
  return html;
}

/** Collapse duplicate California entries in state lists (source + JSON-LD). */
function fixDuplicateCalifornia(html) {
  const dupPattern = /California,\s*California(?:,\s*California)*/gi;
  html = html.replace(dupPattern, 'California');
  while (html.includes('California, California')) {
    html = html.replaceAll('California, California', 'California');
  }
  html = html.replace(
    /California,\s*Texas,\s*Pennsylvania,\s*and\s*Florida/gi,
    STATES_INLINE,
  );
  return html;
}

/** Standard Legal column for sitewide footers — driven by LEGAL_LINKS registry. */
export function renderLegalFooter({ includeControlledSubstance = false } = {}) {
  const csLink = includeControlledSubstance
    ? `<p><a href="${LEGAL_LINKS.controlledSubstanceTreatment}">Controlled Substance Treatment Agreement</a></p>`
    : '';
  return `<div><h4>Legal</h4>
          <p><a href="${LEGAL_LINKS.hub}">Legal &amp; Compliance</a></p>
          <p><a href="${LEGAL_LINKS.terms}">Terms of Use</a></p>
          <p><a href="${LEGAL_LINKS.privacy}">Privacy Policy</a></p>
          <p><a href="${LEGAL_LINKS.noticeOfPrivacy}">Notice of Privacy Practices</a></p>
          <p><a href="${LEGAL_LINKS.cookie}">Cookie Policy</a></p>
          ${csLink}</div>`;
}

/** Point legacy URLs to registry-driven /legal/* paths; standardize labels. */
export function normalizeLegalLinks(html) {
  html = html.replaceAll('https://adhd.siya.health/privacy-policy', LEGAL_LINKS.privacy);
  html = html.replaceAll('https://adhd.siya.health/terms-of-service', LEGAL_LINKS.terms);
  html = html.replaceAll('https://adhd.siya.health/notice-of-privacy-practices', LEGAL_LINKS.noticeOfPrivacy);

  // False NPP → privacy (legacy path and link-cards on /legal/privacy-policy)
  html = html.replace(
    /href="\/privacy-policy"([^>]*)>Notice of Privacy Practices/gi,
    `href="${LEGAL_LINKS.noticeOfPrivacy}"$1>Notice of Privacy Practices`,
  );
  html = html.replace(
    /<a([^>]*)\bhref="(?:\/privacy-policy|\/legal\/privacy-policy)"([^>]*)>([\s\S]*?<h4>\s*Notice of Privacy Practices\s*<\/h4>)/gi,
    `<a$1href="${LEGAL_LINKS.noticeOfPrivacy}"$2>$3`,
  );

  html = html.replaceAll('href="/terms"', `href="${LEGAL_LINKS.terms}"`);
  html = html.replaceAll('href="/privacy-policy"', `href="${LEGAL_LINKS.privacy}"`);

  html = html.replaceAll('Terms &amp; Conditions', 'Terms of Use');
  html = html.replace(/(<a[^>]*href="[^"]*\/legal\/terms-of-use"[^>]*>)\s*Terms\s*(<\/a>)/gi, '$1Terms of Use$2');
  html = html.replace(
    /(<a[^>]*href="[^"]*\/legal\/terms-of-use"[^>]*>)\s*Terms of Service\s*(<\/a>)/gi,
    '$1Terms of Use$2',
  );

  html = html.replace(
    /href="(\/legal\/[^"]+)"([^>]*)\s+target="_blank"\s+rel="noopener"/gi,
    'href="$1"$2',
  );
  html = html.replace(
    /href="(\/privacy-policy|\/terms)"([^>]*)\s+target="_blank"\s+rel="noopener"/gi,
    'href="$1"$2',
  );

  return html;
}

/** Standardize states, Health Guides naming, and legacy CTAs on every page */
export function normalizeSitewideCopy(html) {
  html = fixDuplicateCalifornia(html);
  for (const legacy of LEGACY_FOOTER_PATTERNS) {
    html = html.replaceAll(legacy, FOOTER_STATES_LINE);
  }
  /** Expand 3-state lists only when California is not already listed (avoids "California, California, …"). */
  html = html.replace(
    /(?<!California,\s*)Texas, Pennsylvania, and Florida\. All care is delivered via secure telehealth\./g,
    `${STATES_INLINE}. All care is delivered via secure telehealth.`,
  );
  html = html.replace(/(?<!California,\s*)Texas, Pennsylvania, and Florida\./g, `${STATES_INLINE}.`);
  html = html.replace(/(?<!California,\s*)Texas, Pennsylvania, and Florida via/g, `${STATES_INLINE} via`);
  html = html.replace(/(?<!California,\s*)Texas, Florida, and Pennsylvania\./g, `${STATES_INLINE}.`);
  html = html.replace(/(?<!California,\s*)Texas, Florida, and Pennsylvania via/g, `${STATES_INLINE} via`);
  html = html.replace(/(?<!California,\s*)serve Texas, Pennsylvania, and Florida/gi, `serve ${STATES_INLINE}`);
  html = html.replace(/(?<!California,\s*)serve Texas, Florida, and Pennsylvania/gi, `serve ${STATES_INLINE}`);
  html = html.replace(/(?<!California,\s*)Licensed in Texas, Pennsylvania, and Florida/g, `Licensed in ${STATES_INLINE}`);
  html = html.replace(/(?<!California,\s*)Licensed in Texas, Florida, and Pennsylvania/g, `Licensed in ${STATES_INLINE}`);
  html = html.replaceAll('California, Texas, Florida, and Pennsylvania', STATES_INLINE);
  html = html.replaceAll('California, Texas, Pennsylvania, and Florida', STATES_INLINE);
  html = html.replaceAll('Licensed in CA, TX, PA, FL', `Licensed in ${STATES_BULLET}`);
  html = html.replaceAll('Licensed in CA, TX, FL, PA', `Licensed in ${STATES_BULLET}`);
  html = html.replace(/(?<!CA,\s*)across TX, PA, FL/g, 'across CA, TX, PA, FL');
  html = html.replace(/(?<!CA,\s*)Licensed in TX, PA, FL/g, `Licensed in ${STATES_BULLET}`);
  html = html.replace(/(?<!CA,\s*)HIPAA-compliant\. TX, PA, FL\./g, 'HIPAA-compliant. CA, TX, PA, FL.');
  html = html.replace(/Full telehealth coverage in three states\./g, 'Full telehealth coverage in four states.');

  html = html.replaceAll('Clinical Answers Hub', 'Health Guides Hub');
  html = html.replaceAll('Answers Hub', 'Health Guides Hub');
  html = html.replaceAll('Answer hub', 'Health Guides hub');
  html = html.replaceAll('Answers hub', 'Health Guides hub');
  html = html.replaceAll('Browse clinical answers', 'Browse Health Guides');
  html = html.replaceAll('Browse clinical answer', 'Browse Health Guides');
  html = html.replaceAll('Browse Answers', 'Browse Health Guides');
  html = html.replaceAll('clinical answers hub', 'Health Guides hub');
  html = html.replaceAll('Clinical Answers', 'Health Guides');
  html = html.replaceAll('Clinical answers', 'Health guides');
  html = html.replaceAll('clinical answers', 'health guides');
  html = html.replace(/ — clinical answer/gi, ' — health guide');
  html = html.replace(/\(quick clinical answer\)/gi, '(quick health guide)');
  html = html.replace(/clinical answer/gi, 'health guide');

  // /answers nav and footer label (URL unchanged)
  html = html.replace(
    /(<a[^>]*href="\/answers"[^>]*>)\s*Answers\s*(<\/a>)/gi,
    `$1${NAV_HEALTH_GUIDES.label}$2`,
  );
  html = html.replace(/"name"\s*:\s*"Answers"/g, `"name":"${NAV_HEALTH_GUIDES.label}"`);
  html = html.replace(
    /<title>\s*Answers\s*\|/gi,
    `<title>${NAV_HEALTH_GUIDES.label} |`,
  );

  html = html.replaceAll('Book Free Consultation →', `${COPY_STANDARDS.primaryCta} →`);
  html = html.replaceAll('Book Free Consultation', COPY_STANDARDS.primaryCta);
  html = html.replaceAll('Schedule Meet &amp; Greet', COPY_STANDARDS.primaryCta);
  html = html.replaceAll('Schedule Meet & Greet', COPY_STANDARDS.primaryCta);
  html = html.replaceAll('Book a meet &amp; greet', COPY_STANDARDS.primaryCta);
  html = html.replaceAll('Explore care options', COPY_STANDARDS.secondaryCta);
  html = html.replaceAll('Take Free Screening', COPY_STANDARDS.adhdSecondaryCta);
  html = html.replaceAll('Book ADHD evaluation online', `${COPY_STANDARDS.adhdPrimaryCta} online`);
  html = html.replaceAll('Book ADHD evaluation', COPY_STANDARDS.adhdPrimaryCta);
  html = html.replaceAll('Schedule ADHD Evaluation', COPY_STANDARDS.adhdPrimaryCta);
  html = html.replaceAll('Clinical Review Status', COPY_STANDARDS.reviewBadgePending);
  html = html.replaceAll('Clinically Reviewed', COPY_STANDARDS.reviewBadgeReviewed);
  html = html.replaceAll('Review needed', COPY_STANDARDS.reviewBadgePending);
  html = html.replaceAll('Awaiting final physician review', 'awaiting final physician review');
  html = html.replace(
    /<a([^>]*href="[^"]*yourmarketingai[^"]*"[^>]*)>Book a Meet &amp; Greet<\/a>/gi,
    (m) => (m.includes('target=') ? m : m.replace('<a', '<a target="_blank" rel="noopener"')),
  );

  html = fixDuplicateCalifornia(html);
  return html;
}

export function injectFooterChrome(html, relPath = '') {
  if (!html.includes('<footer')) return html;

  if (html.includes('class="footer-brand"')) {
    html = html.replace(
      /(<div class="footer-brand">)\s*<p>[^<]*<\/p>/i,
      `$1<p>${FOOTER_STATES_LINE}</p>`,
    );
  }

  html = html.replaceAll('href="/answers">Answers</a>', `href="${NAV_HEALTH_GUIDES.path}">${NAV_HEALTH_GUIDES.label}</a>`);

  const footerHasAnswers = /<footer[\s\S]*<h4>Services<\/h4>[\s\S]{0,600}href="\/answers"/i.test(html);
  if (html.includes('<h4>Services</h4>') && !footerHasAnswers) {
    html = html.replace(
      /<h4>Services<\/h4>/i,
      `<h4>Services</h4>\n          <p><a href="${NAV_HEALTH_GUIDES.path}">${NAV_HEALTH_GUIDES.label}</a></p>`,
    );
  }

  if (html.includes('<h4>Services</h4>') && !html.includes(`href="${NAV_PROVIDERS.path}"`)) {
    html = html.replace(
      /(<h4>Services<\/h4>[\s\S]*?)(<p><a href="\/adhd-care">)/i,
      `$1<p><a href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a></p>\n          $2`,
    );
  }

  if (!html.includes('Healthcare Services')) {
    const block =
      '        <div><h4>Healthcare Services</h4><p><a href="/primary-urgent-care">Primary &amp; urgent care</a></p><p><a href="/labs">Diagnostic labs</a></p><p><a href="/prescriptions">Prescriptions</a></p></div>\n';
    if (/<div>\s*<h4>Contact<\/h4>/i.test(html)) {
      html = html.replace(/(\n\s*<div>\s*\n\s*<h4>Contact<\/h4>)/, `\n${block}$1`);
    }
    if (!html.includes('Healthcare Services') && /<div><h4>Contact<\/h4>/i.test(html)) {
      html = html.replace(/(<div><h4>Contact<\/h4>)/, `${block}$1`);
    }
    if (!html.includes('Healthcare Services') && html.includes('<h4>Legal</h4>')) {
      html = html.replace(/(\n\s*<div>\s*\n\s*<h4>Legal<\/h4>)/, `\n${block}$1`);
    }
  }

  const includeCs = relPath ? isControlledSubstanceLinkPage(relPath) : false;
  if (html.includes('<h4>Legal</h4>')) {
    html = html.replace(/<div>\s*<h4>Legal<\/h4>[\s\S]*?<\/div>/i, renderLegalFooter({ includeControlledSubstance: includeCs }));
  } else if (html.includes('footer-grid')) {
    const legalBlock = renderLegalFooter({ includeControlledSubstance: includeCs });
    html = html.replace(
      /(\s*<\/div>\s*<div class="container">\s*<p class="footer-notice">)/i,
      `\n        ${legalBlock}$1`,
    );
  }

  return html;
}

/** Non-blocking cookie notice — localStorage acceptance only */
export function injectCookieNotice(html, relPath) {
  if (isLegalContentPage(relPath)) return html;
  if (html.includes('cookie-notice.js')) return html;
  const block = `<!-- SIYA:COOKIE-NOTICE -->
    <script src="/scripts/cookie-notice.js" defer></script>
    <!-- /SIYA:COOKIE-NOTICE -->`;
  if (html.includes('<!-- /SIYA:GHL-LEGAL-ACCEPTANCE -->')) {
    return html.replace('<!-- /SIYA:GHL-LEGAL-ACCEPTANCE -->', `<!-- /SIYA:GHL-LEGAL-ACCEPTANCE -->\n${block}`);
  }
  return html.replace(/<\/body>/i, `${block}\n</body>`);
}

export function injectLearnMoreSections(html, relPath) {
  if (relPath === 'adhd-care.html') {
    if (html.includes('SIYA:LEARN-MORE-ADHD')) {
      html = html.replace(/<!-- SIYA:LEARN-MORE-ADHD -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-ADHD -->/, LEARN_MORE_ADHD);
    } else if (html.includes('<!-- FINAL CTA -->')) {
      html = html.replace('<!-- FINAL CTA -->', `${LEARN_MORE_ADHD}\n\n      <!-- FINAL CTA -->`);
    }
  }
  if (relPath === 'weight-loss-metabolic-health.html') {
    if (html.includes('SIYA:LEARN-MORE-WEIGHT')) {
      html = html.replace(/<!-- SIYA:LEARN-MORE-WEIGHT -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-WEIGHT -->/, LEARN_MORE_WEIGHT);
    } else if (html.includes('<!-- FINAL CTA -->')) {
      html = html.replace('<!-- FINAL CTA -->', `${LEARN_MORE_WEIGHT}\n\n      <!-- FINAL CTA -->`);
    }
  }
  if (relPath === 'mens-health-longevity.html') {
    if (html.includes('SIYA:LEARN-MORE-MENS')) {
      html = html.replace(/<!-- SIYA:LEARN-MORE-MENS -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-MENS -->/, LEARN_MORE_MENS);
    } else {
      html = html.replace(/\s*<\/main>/, `\n\n      ${LEARN_MORE_MENS}\n     </main>`);
    }
  }
  if (relPath === 'telehealth.html') {
    if (html.includes('SIYA:LEARN-MORE-TELE')) {
      html = html.replace(/<!-- SIYA:LEARN-MORE-TELE -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-TELE -->/, LEARN_MORE_TELE);
    } else if (html.includes('<!-- FINAL CTA -->')) {
      html = html.replace('<!-- FINAL CTA -->', `${LEARN_MORE_TELE}\n\n      <!-- FINAL CTA -->`);
    }
  }
  return html;
}

function buildHomepageCareTeam() {
  const providers = getAllProviders();
  const cards = providers
    .map(
      (p) => `            <article class="about-team-card homepage-care-card" data-states="${p.stateAbbreviations.join(',')}">
              ${renderCareTeamPhoto(p, 96, 96)}
              <h3><a href="/providers/${p.slug}">${p.name}</a></h3>
              <p class="about-team-tagline">${p.servicePageTagline} · ${stateChipLabel(p)}</p>
              <a class="text-link" href="/providers/${p.slug}">View profile</a>
            </article>`,
    )
    .join('\n');
  return `<!-- SIYA:CARE-TEAM -->
      <section class="section section-tinted" id="care-team" aria-labelledby="care-team-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="care-team-heading">Meet our care team</h2>
            <p class="lead">Seven contracted clinicians across ADHD, weight loss, primary care, and telehealth—each card links to a full profile.</p>
          </div>
          <div class="about-team-grid homepage-care-grid">
${cards}
          </div>
          <div class="provider-lp-ctas provider-lp-ctas--center">
            <a class="button" href="${BOOKING_LINK}" target="_blank" rel="noopener">Book a Meet &amp; Greet</a>
            <a class="button secondary" href="/providers">View Our Care Team</a>
          </div>
        </div>
      </section>
      <!-- /SIYA:CARE-TEAM -->`;
}

function buildHomepageProviderConversion() {
  const featured = getAllProviders().filter((p) => p.featured).slice(0, 4);
  const cards = featured
    .map(
      (p) => `            <article class="provider-conversion-card">
              ${renderCareTeamPhoto(p, 72, 72)}
              <div>
                <h3><a href="/providers/${p.slug}">${p.name}</a></h3>
                <p>${p.servicePageTagline}</p>
                <a class="button secondary" href="${bookingLinkWithAttribution(p.slug, 'homepage-module')}" target="_blank" rel="noopener" data-provider-cta="${p.slug}">Book with ${p.givenName}</a>
              </div>
            </article>`,
    )
    .join('\n');
  return `<!-- SIYA:PROVIDER-CONVERSION -->
      <section class="section" id="provider-conversion" aria-labelledby="provider-conversion-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="provider-conversion-heading">Not sure who to see?</h2>
            <p class="lead">Start with a Meet &amp; Greet—we match you with a licensed clinician for your state and goals.</p>
          </div>
          <div class="provider-conversion-grid">
${cards}
          </div>
        </div>
      </section>
      <!-- /SIYA:PROVIDER-CONVERSION -->`;
}

export function injectHomepageCareTeam(html, relPath) {
  if (relPath !== 'index.html') return html;
  const careTeam = buildHomepageCareTeam();
  const conversion = buildHomepageProviderConversion();
  if (html.includes('SIYA:CARE-TEAM')) {
    html = html.replace(/<!-- SIYA:CARE-TEAM -->[\s\S]*?<!-- \/SIYA:CARE-TEAM -->/, careTeam);
  } else if (html.includes('id="why-siya-exists"')) {
    html = html.replace(
      /(<section class="section section-tinted why-siya-exists" id="why-siya-exists">)/,
      `${careTeam}\n\n      $1`,
    );
  }
  if (html.includes('SIYA:PROVIDER-CONVERSION')) {
    html = html.replace(/<!-- SIYA:PROVIDER-CONVERSION -->[\s\S]*?<!-- \/SIYA:PROVIDER-CONVERSION -->/, conversion);
  } else if (html.includes('class="faq-accordion-section"')) {
    html = html.replace(
      /(<section class="section faq-accordion-section")/,
      `${conversion}\n\n      $1`,
    );
  }
  return html;
}

export function injectProvidersNav(html) {
  const link = `<a href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a>`;
  if (html.includes(`href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a>`)) return html;
  html = html.replaceAll('href="/providers">Our providers</a>', `href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a>`);
  html = html.replaceAll('href="/providers">Our physicians</a>', `href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a>`);
  const injectAfterAbout = (nav) => {
    if (!nav.includes('href="/about"')) return nav;
    if (nav.includes(NAV_PROVIDERS.path)) return nav;
    return nav.replace(/(<a href="\/about">About<\/a>)/, `$1\n          ${link}`);
  };
  html = html.replace(/<nav class="nav-center"[\s\S]*?<\/nav>/gi, (nav) => injectAfterAbout(nav));
  html = html.replace(/<div class="nav-mobile">[\s\S]*?<\/div>/gi, (nav) => injectAfterAbout(nav));
  return html;
}

export function injectAboutProviderHub(html, relPath) {
  if (relPath !== 'about.html') return html;
  const hubLink = `<p class="blog-hub-see-all"><a href="/providers">View Our Care Team (7 clinicians)</a></p>`;
  if (html.includes('View full care team')) return html;
  if (html.includes('about-team-grid')) {
    html = html.replace(/(<div class="about-team-grid">[\s\S]*?<\/div>)/, `$1\n          ${hubLink}`);
  }
  return html;
}

export function injectProviderAttribution(html) {
  if (html.includes('SIYA:PROVIDER-ATTRIBUTION')) return html;
  const script = `<!-- SIYA:PROVIDER-ATTRIBUTION -->
    <script>
      document.addEventListener('click', function (e) {
        var el = e.target.closest('[data-provider-cta]');
        if (!el || typeof gtag !== 'function') return;
        gtag('event', 'provider_cta_click', {
          provider_slug: el.getAttribute('data-provider-cta'),
          link_url: el.href || '',
          page_path: location.pathname
        });
      });
    </script>
    <!-- /SIYA:PROVIDER-ATTRIBUTION -->`;
  return html.replace('</body>', `${script}\n  </body>`);
}

export function injectMeetPhysiciansSection(html, relPath) {
  let build = MEET_PHYSICIANS_BY_PAGE[relPath];
  let block;
  if (build) {
    block = typeof build === 'function' ? build() : build;
  } else {
    const cfg = resolveMeetPhysiciansConfig(relPath);
    if (!cfg) return html;
    block = buildMeetPhysiciansBlock(
      cfg.serviceKey,
      'Licensed clinicians for this service—confirm state eligibility when you book.',
      cfg.stateAbbr,
    );
  }
  if (html.includes('SIYA:MEET-PHYSICIANS')) {
    return html.replace(/<!-- SIYA:MEET-PHYSICIANS -->[\s\S]*?<!-- \/SIYA:MEET-PHYSICIANS -->/, block);
  }
  if (html.includes('<!-- FINAL CTA -->')) {
    return html.replace('<!-- FINAL CTA -->', `${block}\n\n      <!-- FINAL CTA -->`);
  }
  if (html.includes('</main>')) {
    return html.replace(/\s*<\/main>/, `\n\n      ${block}\n    </main>`);
  }
  if (relPath === 'mens-health-longevity.html' && html.includes('<!-- /SIYA:LEARN-MORE-MENS -->')) {
    return html.replace(
      '<!-- /SIYA:LEARN-MORE-MENS -->',
      `<!-- /SIYA:LEARN-MORE-MENS -->\n\n      ${block}`,
    );
  }
  return html;
}

/** Preserve screening links — do not route educational screening CTAs to booking. */
export function injectSitewideCtas(html) {
  return html;
}

const THIN_ADHD_LANDERS = new Set([
  'adult-adhd-diagnosis.html',
  'adhd-treatment-online.html',
  'online-adhd-test.html',
  'adhd-evaluation-cost.html',
  'creyos-adhd-testing.html',
]);

function isThinAdhdLander(relPath) {
  return THIN_ADHD_LANDERS.has(relPath) || /^adhd-diagnosis-.+\.html$/.test(relPath);
}

function buildAdhdFunnelBanner() {
  return `<!-- SIYA:ADHD-FUNNEL-BANNER -->
      <div class="adhd-funnel-banner section-tinted" role="note">
        <div class="container">
          <p><strong>Main ADHD pathway:</strong> <a href="/adhd-care">ADHD Care</a> is our canonical starting point for evaluation, screening, and treatment planning.</p>
        </div>
      </div>
      <!-- /SIYA:ADHD-FUNNEL-BANNER -->`;
}

export function injectAdhdFunnelBanner(html, relPath) {
  if (!isThinAdhdLander(relPath)) return html;
  const block = buildAdhdFunnelBanner();
  if (html.includes('SIYA:ADHD-FUNNEL-BANNER')) {
    return html.replace(/<!-- SIYA:ADHD-FUNNEL-BANNER -->[\s\S]*?<!-- \/SIYA:ADHD-FUNNEL-BANNER -->/, block);
  }
  if (html.includes('<main id="main">')) {
    return html.replace('<main id="main">', `<main id="main">\n${block}`);
  }
  return html;
}

/** Reduce duplicate booking modules; enforce single end-of-page CTAs on blogs/guides. */
export function normalizeCtaHierarchy(html, relPath) {
  if (html.includes('blog-final-cta')) {
    html = html.replace(/<div class="cta-block blog-cta blog-cta--mid"[\s\S]*?<\/div>\s*/g, '');
    html = html.replace(/<section class="blog-california-cta cta-block blog-cta"[\s\S]*?<\/section>\s*/g, '');
    const blogPrimary = isAdhdFunnelPage(relPath) ? COPY_STANDARDS.adhdPrimaryCta : COPY_STANDARDS.primaryCta;
    html = html.replace(
      /<section class="section blog-final-cta">[\s\S]*?<\/section>/,
      `<section class="section blog-final-cta">
        <div class="container">
          <div class="cta-band">
            <h3>Not sure where to start?</h3>
            <p>A brief clinician conversation can help you understand your options—no obligation.</p>
            <div class="cta-band-buttons">
              <a class="button" href="${MEET_GREET_URL}" target="_blank" rel="noopener">${blogPrimary}</a>
            </div>
          </div>
        </div>
      </section>`,
    );
  }

  html = html.replace(
    /(<div class="faq-accordion-cta">[\s\S]*?)<a class="button"[^>]*>[\s\S]*?<\/a>/g,
    '$1<p class="cta-microcopy"><a href="#book-telehealth" class="text-link">Talk to a clinician when you\'re ready →</a></p>',
  );

  html = html.replace(
    /<p><a href="[^"]*(?:carepatron|yourmarketingai)[^"]*"[^>]*>Book a Meet[^<]*<\/a><\/p>/gi,
    '',
  );

  if (relPath === 'index.html') {
    html = html.replace(/<div class="provider-lp-ctas provider-lp-ctas--center">[\s\S]*?<\/div>/g, '');
    html = html.replace(
      /<div class="testimonial-cta">[\s\S]*?<\/div>/g,
      `<p class="testimonial-cta-text">Start with a conversation—not a commitment. <a href="${MEET_GREET_URL}" class="text-link" target="_blank" rel="noopener">Talk to a clinician →</a></p>`,
    );
  }

  if (isAdhdFunnelPage(relPath) && !relPath.startsWith('blog/') && html.includes('<!-- FINAL CTA -->')) {
    html = html.replace(
      /(<!-- FINAL CTA -->[\s\S]*?<div class="cta-band-buttons">)[\s\S]*?(<\/div>)/,
      `$1
              <a class="button" href="${MEET_GREET_URL}" target="_blank" rel="noopener">${COPY_STANDARDS.adhdPrimaryCta}</a>
              <a class="button secondary" href="/adhd-screening">${COPY_STANDARDS.adhdSecondaryCta}</a>
            $2`,
    );
    html = html.replace(/Start Free Screening/g, COPY_STANDARDS.adhdSecondaryCta);
  }

  if (relPath === 'telehealth.html' && html.includes('<!-- FINAL CTA -->')) {
    html = html.replace(
      /(<!-- FINAL CTA -->[\s\S]*?<div class="cta-band-buttons">)[\s\S]*?(<\/div>)/,
      `$1
              <a class="button" href="${MEET_GREET_URL}" target="_blank" rel="noopener">${COPY_STANDARDS.primaryCta}</a>
              <a class="button secondary" href="#why-choose">${COPY_STANDARDS.secondaryCta}</a>
            $2`,
    );
  }

  if (relPath.startsWith('answers/') && relPath !== 'answers/index.html') {
    html = html.replace(
      /<div class="cta-block blog-cta(?!\s+answer-final-cta)">[\s\S]*?<\/div>/g,
      '',
    );
  }

  // Screening-labeled links must never route to booking — always /adhd-screening (ASRS tool).
  html = html.replace(
    /<a([^>]*href="[^"]*(?:carepatron|yourmarketingai)[^"]*"[^>]*)>([^<]*(?:Screen|screening)[^<]*)<\/a>/gi,
    (_m, _attrs, label) => {
      const text = /ADHD/i.test(label) ? COPY_STANDARDS.adhdSecondaryCta : 'Free ADHD Screening';
      return `<a href="/adhd-screening">${text}</a>`;
    },
  );

  return html;
}

function loadContinueReadingIndex() {
  const auditPath = path.join(SITE_ROOT, 'data', 'internal-link-audit.json');
  if (!fs.existsSync(auditPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(auditPath, 'utf8')).continueReading || {};
  } catch {
    return {};
  }
}

function buildCornerstoneContinueReadingHtml(blogPath) {
  const cfg = CORNERSTONE_CONTINUE_READING[blogPath];
  if (!cfg) return null;

  const items = [
    ...cfg.siblings.map((p) => ({ path: p, label: anchorFor(p) })),
    { path: cfg.answer, label: anchorFor(cfg.answer), kind: 'answer' },
    { path: cfg.service.path, label: cfg.service.label, kind: 'service' },
  ];

  const lis = items
    .map((item) => {
      const cls = item.kind ? ` class="continue-reading-${item.kind}"` : '';
      return `                <li${cls}><a href="${item.path}">${item.label}</a></li>`;
    })
    .join('\n');

  return `<section class="continue-reading" aria-labelledby="continue-reading-heading">
              <h2 id="continue-reading-heading">Continue reading</h2>
              <ul>
${lis}
              </ul>
            </section>`;
}

function buildContinueReadingHtml(blogPath, title, auditIndex) {
  const cornerstoneBlock = buildCornerstoneContinueReadingHtml(blogPath);
  if (cornerstoneBlock) return cornerstoneBlock;

  const slug = blogPath.replace(/^\/blog\//, '');
  const topic = topicFromPath(blogPath, title);
  const service = SERVICE_BY_TOPIC[topic] || SERVICE_BY_TOPIC.general;

  const picks = auditIndex[blogPath] || [];
  const articles = [];
  let answerPath = null;

  for (const c of picks) {
    if (c.p.startsWith('/blog/') && c.p !== blogPath && articles.length < 5) {
      const label = anchorFor(c.p, c.title);
      if (!articles.some((a) => a.path === c.p)) articles.push({ path: c.p, label });
    }
    if (c.p.startsWith('/answers/') && !answerPath) answerPath = c.p;
  }

  if (!answerPath) {
    const topicAnswer = DEFAULT_ANSWER_BY_TOPIC[topic];
    const slugHint = slug.replace(/-/g, ' ');
    const matched = ANSWER_SEEDS.find(
      (s) =>
        slug.includes(s.slug.replace(/-/g, '-')) ||
        s.slug.replace(/-/g, ' ').split(' ').some((w) => w.length > 5 && slugHint.includes(w)),
    );
    answerPath = matched ? `/answers/${matched.slug}` : topicAnswer;
  }

  while (articles.length < 3) {
    const fallbacks = {
      adhd: ['/blog/how-to-know-if-you-have-adhd-adult', '/blog/is-online-adhd-diagnosis-legit', '/blog/adhd-symptoms-overlooked'],
      metabolic: [
        '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
        '/blog/insulin-resistance-and-weight-loss-clinician-overview',
        '/blog/glp1-side-effects-and-how-to-manage-them',
        '/blog/semaglutide-for-weight-loss-how-it-works',
      ],
      hormone: [
        '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
        '/blog/when-is-testosterone-therapy-appropriate',
        '/blog/minoxidil-for-hair-loss-does-it-work',
      ],
      energy: [
        '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
        '/blog/modafinil-for-focus-and-fatigue-is-it-safe',
        '/blog/insomnia-treatment-options-beyond-medication',
      ],
      general: ['/blog/telehealth-prescriptions-how-online-treatment-works', '/blog/how-to-safely-get-prescriptions-online', '/blog/is-online-adhd-diagnosis-legit'],
    }[topic];
    for (const p of fallbacks || []) {
      if (articles.length >= 5) break;
      if (p !== blogPath && !articles.some((a) => a.path === p)) articles.push({ path: p, label: anchorFor(p) });
    }
    break;
  }

  const items = [
    ...articles.slice(0, 5),
    { path: answerPath, label: anchorFor(answerPath), kind: 'answer' },
    { path: service.path, label: service.label, kind: 'service' },
  ];

  const lis = items
    .map((item) => {
      const cls = item.kind ? ` class="continue-reading-${item.kind}"` : '';
      return `                <li${cls}><a href="${item.path}">${item.label}</a></li>`;
    })
    .join('\n');

  return `<section class="continue-reading" aria-labelledby="continue-reading-heading">
              <h2 id="continue-reading-heading">Continue reading</h2>
              <ul>
${lis}
              </ul>
            </section>`;
}

export function injectContinueReading(html, relPath, title, auditIndex) {
  if (!relPath.startsWith('blog/') || BLOG_HUB_FILES.has(relPath)) return html;
  const blogPath = `/${relPath.replace(/\.html$/, '')}`;
  const block = buildContinueReadingHtml(blogPath, title, auditIndex);

  if (html.includes('class="continue-reading"')) {
    return html.replace(/<section class="continue-reading"[\s\S]*?<\/section>/, block);
  }
  if (html.includes('class="blog-related"')) {
    return html.replace(/<section class="blog-related"[\s\S]*?<\/section>/, block);
  }
  if (html.includes('class="blog-provider-cta"')) {
    return html.replace(/<section class="blog-provider-cta"/, `${block}\n\n            <section class="blog-provider-cta"`);
  }
  return html.replace(/<\/div>\s*<\/div>\s*<\/article>/, `${block}\n          </div>\n        </div>\n      </article>`);
}

function isLegalContentPage(relPath) {
  return relPath.startsWith('legal/');
}

/** Legal acceptance gate — intake hub only (direct CarePatron booking elsewhere) */
export function injectSiyaCircleSignup(html, relPath) {
  if (relPath !== 'siya-circle.html') return html;
  if (html.includes('siya-circle-signup.js')) return html;

  const config = buildSiyaCircleClientConfig();
  const configScript = `<script>window.SIYA_CIRCLE_CONFIG=${JSON.stringify(config)};</script>`;
  const loader = `<script src="/scripts/siya-circle-signup.js" defer></script>`;
  const block = `<!-- SIYA:CIRCLE-SIGNUP -->\n${configScript}\n${loader}\n<!-- /SIYA:CIRCLE-SIGNUP -->`;

  if (html.includes('<!-- SIYA:CIRCLE-SIGNUP -->')) {
    return html.replace(/<!-- SIYA:CIRCLE-SIGNUP -->[\s\S]*?(?:<!-- \/SIYA:CIRCLE-SIGNUP -->)?/, block);
  }
  return html.replace(/<\/body>/i, `${block}\n</body>`);
}

/** Remove legacy sitewide legal gate from pages that now use direct CarePatron booking */
export function stripGhlLegalAcceptance(html, relPath) {
  if (relPath === 'intake/index.html') return html;
  html = html.replace(/<!-- SIYA:GHL-LEGAL-ACCEPTANCE -->[\s\S]*?<!-- \/SIYA:GHL-LEGAL-ACCEPTANCE -->\n?/g, '');
  html = html.replace(/<script>window\.SIYA_GHL_INTAKE=[\s\S]*?<\/script>\n?/g, '');
  html = html.replace(/<script src="\/scripts\/ghl-legal-acceptance\.js" defer><\/script>\n?/g, '');
  return html;
}

export function injectGhlLegalAcceptance(html, relPath) {
  if (relPath !== 'intake/index.html') return html;
  if (html.includes('ghl-legal-acceptance.js')) return html;

  if (isAdhdLegalContext(relPath)) {
    html = html.replace(/<body([^>]*)>/i, (match, attrs) => {
      if (/\bdata-siya-funnel=/i.test(attrs)) return match;
      return `<body${attrs} data-siya-funnel="adhd">`;
    });
  }

  const config = buildClientIntakeConfig();
  const configScript = `<script>window.SIYA_GHL_INTAKE=${JSON.stringify(config)};</script>`;
  const loader = `<script src="/scripts/ghl-legal-acceptance.js" defer></script>`;
  const block = `<!-- SIYA:GHL-LEGAL-ACCEPTANCE -->\n${configScript}\n${loader}\n<!-- /SIYA:GHL-LEGAL-ACCEPTANCE -->`;

  if (html.includes('<!-- /SIYA:PROVIDER-ATTRIBUTION -->')) {
    return html.replace('<!-- /SIYA:PROVIDER-ATTRIBUTION -->', `<!-- /SIYA:PROVIDER-ATTRIBUTION -->\n${block}`);
  }
  return html.replace(/<\/body>/i, `${block}\n</body>`);
}

export function applySiteChrome(html, relPath, title = '') {
  if (isLegalContentPage(relPath)) {
    html = injectFooterChrome(html, relPath);
    html = normalizeLegalLinks(html);
    return html;
  }

  const auditIndex = loadContinueReadingIndex();
  html = injectNavCta(html, relPath);
  html = injectSitewideCtas(html);
  html = injectAdhdFunnelBanner(html, relPath);
  html = injectProvidersNav(html);
  html = injectAnswersNav(html);
  html = injectFooterChrome(html, relPath);
  html = injectLearnMoreSections(html, relPath);
  html = injectHomepageCareTeam(html, relPath);
  html = injectAboutProviderHub(html, relPath);
  html = injectMeetPhysiciansSection(html, relPath);
  html = injectContinueReading(html, relPath, title, auditIndex);
  html = injectProviderAttribution(html);
  html = injectSiyaCircleSignup(html, relPath);
  html = stripGhlLegalAcceptance(html, relPath);
  html = injectGhlLegalAcceptance(html, relPath);
  html = injectCookieNotice(html, relPath);
  html = normalizeLegalLinks(html);
  html = normalizeSitewideCopy(html);
  html = normalizeCtaHierarchy(html, relPath);
  return html;
}
