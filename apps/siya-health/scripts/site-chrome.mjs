/**
 * Sitewide chrome: nav, footer, service learn-more blocks, blog Continue Reading.
 * Applied by seo-build.mjs on every HTML file.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import {
  FOOTER_STATES_LINE,
  LEGACY_FOOTER_PATTERNS,
  STATES_BULLET,
  STATES_INLINE,
} from '../data/site-standards.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

/** Primary nav label for /answers (URL unchanged for SEO) */
export const NAV_HEALTH_GUIDES = { path: '/answers', label: 'Health Guides', shortLabel: 'Health guides' };

export const MEET_GREET_URL = 'https://link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY';

const NAV_CTA_MEET_GREET = `<a class="button" href="${MEET_GREET_URL}" target="_blank" rel="noopener">Book a Meet &amp; Greet</a>`;
const NAV_CTA_SCREENING = `<a class="button" href="/adhd-screening">Start Free Screening</a>`;

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
  '/answers/semaglutide-weight-loss-how-it-works': 'How semaglutide works for weight loss',
  '/answers/glp-1-side-effects': 'GLP-1 side effects explained',
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
            <li><a href="/answers/semaglutide-weight-loss-how-it-works">How semaglutide works for weight loss</a></li>
            <li><a href="/answers/glp-1-side-effects">GLP-1 side effects — what to expect</a></li>
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

/** Sitewide nav CTA: Meet & Greet default; ADHD screening on ADHD funnels only */
export function injectNavCta(html, relPath) {
  if (isAdhdFunnelPage(relPath)) return html;
  if (relPath.startsWith('answers/')) return html;

  const meetBtn = NAV_CTA_MEET_GREET;
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
  return html;
}

/** Standardize states, Health Guides naming, and legacy CTAs on every page */
export function normalizeSitewideCopy(html) {
  for (const legacy of LEGACY_FOOTER_PATTERNS) {
    html = html.replaceAll(legacy, FOOTER_STATES_LINE);
  }
  html = html.replaceAll(
    'Texas, Pennsylvania, and Florida. All care is delivered via secure telehealth.',
    `${STATES_INLINE}. All care is delivered via secure telehealth.`,
  );
  html = html.replaceAll('California, California,', 'California,');
  html = html.replaceAll('Texas, Pennsylvania, and Florida.', `${STATES_INLINE}.`);
  html = html.replaceAll('Texas, Pennsylvania, and Florida via', `${STATES_INLINE} via`);
  html = html.replace(/serve Texas, Pennsylvania, and Florida/gi, `serve ${STATES_INLINE}`);
  html = html.replaceAll('Licensed in Texas, Pennsylvania, and Florida', `Licensed in ${STATES_INLINE}`);
  html = html.replace(
    /(?<!California, )California, Texas, Pennsylvania, and Florida/g,
    STATES_INLINE,
  );

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

  html = html.replaceAll('Book Free Consultation →', 'Book a Meet &amp; Greet →');
  html = html.replaceAll('Book Free Consultation', 'Book a Meet &amp; Greet');
  html = html.replace(
    /<a([^>]*href="[^"]*yourmarketingai[^"]*"[^>]*)>Book a Meet &amp; Greet<\/a>/gi,
    (m) => (m.includes('target=') ? m : m.replace('<a', '<a target="_blank" rel="noopener"')),
  );

  return html;
}

export function injectFooterChrome(html) {
  if (!html.includes('<footer')) return html;

  if (html.includes('class="footer-brand"')) {
    html = html.replace(
      /<div class="footer-brand">\s*<p>[^<]*<\/p>\s*<\/div>/i,
      `<div class="footer-brand"><p>${FOOTER_STATES_LINE}</p></div>`,
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

  return html;
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

/** Replace remaining ADHD screening links in body/footer on non-ADHD funnels */
export function injectSitewideCtas(html, relPath) {
  if (isAdhdFunnelPage(relPath)) return html;
  if (relPath.startsWith('answers/')) return html;

  const meet = MEET_GREET_URL;
  html = html.replace(/href="\/adhd-screening(\?adhd=1)?"/gi, `href="${meet}" target="_blank" rel="noopener"`);
  html = html.replace(/>Start Free Screening</g, '>Book a Meet &amp; Greet<');
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

export function applySiteChrome(html, relPath, title = '') {
  const auditIndex = loadContinueReadingIndex();
  html = injectNavCta(html, relPath);
  html = injectSitewideCtas(html, relPath);
  html = injectAnswersNav(html);
  html = injectFooterChrome(html);
  html = injectLearnMoreSections(html, relPath);
  html = injectContinueReading(html, relPath, title, auditIndex);
  html = normalizeSitewideCopy(html);
  return html;
}
