/**
 * Sitewide chrome: nav, footer, service learn-more blocks, blog Continue Reading.
 * Applied by seo-build.mjs on every HTML file.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANSWER_SEEDS } from '../data/answer-seeds.mjs';
import {
  landingForTopic,
  loadBlogRegistry,
  pickRelatedArticles,
  renderRelatedArticlesSection,
  topicFromBlog,
} from '../data/blog-internal-linking.mjs';
import {
  COPY_STANDARDS,
  FOOTER_STATES_LINE,
  LEGACY_FOOTER_PATTERNS,
  LEGACY_MARKETPLACE_PHRASES,
  LEGAL_LINKS,
  MIXED_ROSTER_CLINICIAN_PHRASE,
  PRICING,
  REMOVED_BLOG_PATHS,
  REMOVED_BOOKING_CTA_LABELS,
  LEGACY_WALKTHROUGH_CTA_LABELS,
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
import { SPRUCE_CHAT_URL, MEET_GREET_BOOKING_URL, ADHD_EVALUATION_199_LINK, REDIRECT_CHAT_URL, REDIRECT_MEET_GREET_URL, REDIRECT_ADHD_WALKTHROUGH_URL, REDIRECT_ADHD_EVALUATION_URL, ZOCDOC_BOOKING_URL } from '../data/providers-core.mjs';
import { applyPricingTokens, initialEvaluationPriceDisplay } from '../data/pricing-display.mjs';
import { TRACKING, GTM_PRODUCTION_HOST_GUARD } from '../data/tracking-config.mjs';
import { HOMEPAGE_TRUST_METRICS } from '../data/homepage-trust-metrics.mjs';
import { ABOUT_COMPANY_COPY, ABOUT_COMPANY_STATS } from '../data/about-company-config.mjs';
import { getServiceTagline } from '../data/provider-canonical.mjs';
import {
  SIYA_CIRCLE_GHL_FORM_URL,
  SIYA_CIRCLE_JOIN_TRACK,
  SIYA_CIRCLE_SIGNUP_URL,
} from '../data/siya-circle-config.mjs';
import {
  renderNavCtaMarkup,
  renderFaqCtaInner,
  renderBlogFinalCtaSection,
  renderAboutTeamCard,
  renderButton,
  slotToButton,
  resolveConversion,
  isAdhdFunnelPath,
} from '../design-system/components.mjs';
import { resolveTrust, trustToRenderProps } from '../design-system/trust-system.mjs';
import { CTA_SLOTS } from '../design-system/cta-system.mjs';

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
export const NAV_PROVIDERS = { path: '/providers', label: 'Care Team', shortLabel: 'Care Team' };
export const NAV_MENS_HEALTH = { path: '/mens-health-longevity', label: "Men's Health", shortLabel: "Men's Health" };
export const NAV_EMPLOYERS = { path: '/employers', label: 'For Employers', shortLabel: 'Employers' };
export const NAV_LABS = { path: '/labs', label: 'Labs' };
export const NAV_JOIN_OUR_TEAM = {
  path: '/join-our-team',
  label: 'Join Our Team',
  shortLabel: 'Join Our Team',
};

/** Primary nav service links — Join Our Team replaces Men's Health at top level. */
const STANDARD_SERVICE_NAV_LINKS = [
  { path: '/adhd-care', label: 'ADHD Care' },
  { path: '/weight-loss-metabolic-health', label: 'Weight Loss' },
  { path: '/telehealth', label: 'Telehealth' },
  { path: NAV_JOIN_OUR_TEAM.path, label: NAV_JOIN_OUR_TEAM.label },
  { path: NAV_LABS.path, label: NAV_LABS.label },
  { path: NAV_EMPLOYERS.path, label: NAV_EMPLOYERS.label },
  { path: '/blog', label: 'Blog' },
];

function renderAboutNavDropdown() {
  return `<div class="nav-dropdown">
          <button type="button" class="nav-dropdown__toggle" aria-expanded="false" aria-haspopup="true" aria-controls="nav-about-menu" id="nav-about-toggle">About</button>
          <div class="nav-dropdown__menu" id="nav-about-menu" role="menu">
            <a href="/about" role="menuitem">About Us</a>
            <a href="${NAV_PROVIDERS.path}" role="menuitem">${NAV_PROVIDERS.label}</a>
          </div>
        </div>`;
}

function renderStandardDesktopNav() {
  const links = STANDARD_SERVICE_NAV_LINKS.map((l) => `<a href="${l.path}">${l.label}</a>`).join('\n          ');
  return `<nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          ${renderAboutNavDropdown()}
          ${links}
        </nav>`;
}

function renderStandardMobileNavShell() {
  const links = STANDARD_SERVICE_NAV_LINKS.map((l) => `<a href="${l.path}">${l.label}</a>`).join('\n          ');
  return `<input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About Us</a>
          ${links}
        </div>`;
}

function primaryNavIsSparse(navHtml = '') {
  return !/href="\/adhd-care"/i.test(navHtml);
}

function normalizeProviderCareersNav(html) {
  html = html.replace(new RegExp(`\\s*<a href="${NAV_MENS_HEALTH.path}">[^<]*</a>`, 'gi'), '');
  html = html.replace(new RegExp(`\\s*<a href="${NAV_PROVIDERS.path}">[^<]*</a>`, 'gi'), '');
  html = html.replace(/\s*<a href="\/providers">[^<]*<\/a>/gi, '');
  const desktopNav = html.match(/<nav class="nav-center"[\s\S]*?<\/nav>/i)?.[0] || '';
  if (desktopNav && !new RegExp(`href="${NAV_JOIN_OUR_TEAM.path}"`).test(desktopNav)) {
    html = html.replace(
      /(<a href="\/telehealth">Telehealth<\/a>)/i,
      `$1\n          <a href="${NAV_JOIN_OUR_TEAM.path}">${NAV_JOIN_OUR_TEAM.label}</a>`,
    );
  }
  return html;
}

function injectSparsePrimaryNav(html) {
  const navMatch = html.match(/<nav class="nav-center"[\s\S]*?<\/nav>/i)?.[0] || '';
  if (!primaryNavIsSparse(navMatch)) return html;
  html = html.replace(/<nav class="nav-center"[\s\S]*?<\/nav>/i, renderStandardDesktopNav());
  if (!html.includes('id="nav-toggle"')) {
    html = html.replace(
      /(<div class="nav-cta">[\s\S]*?<\/div>)/i,
      `$1\n        ${renderStandardMobileNavShell()}`,
    );
  }
  if (!/<header class="site-header[^"]*" id="site-header"/i.test(html)) {
    html = html.replace(
      /<header class="site-header([^"]*)">/i,
      '<header class="site-header$1" id="site-header">',
    );
  }
  return html;
}
/** Circular brand mark (icon only). Wordmark is rendered in HTML via renderBrandLockup(). */
export const BRAND_MARK_ICON = '/assets/images/siya-health-mark.png';
/** @deprecated Use BRAND_MARK_ICON + renderBrandLockup(); kept for legacy src swaps. */
export const BRAND_LOGO_MARK = BRAND_MARK_ICON;

const BRAND_WORDMARK = 'Siya Health';

/** Header, footer, or compact LP lockup: circular mark + Poppins wordmark with ®. */
export function renderBrandLockup({ variant = 'header', href = '/' } = {}) {
  const isFooter = variant === 'footer';
  const isLp = variant === 'lp';
  const markSize = isFooter ? 40 : isLp ? 36 : 44;
  const linkClass = isFooter
    ? 'footer-logo-link footer-logo-link--compact brand-lockup brand-lockup--footer'
    : isLp
      ? 'lp-header-logo brand-lockup brand-lockup--lp'
      : 'header-logo brand-lockup';
  return `<a class="${linkClass}" href="${href}" aria-label="${BRAND_WORDMARK} home">
  <img class="brand-lockup__mark" src="${BRAND_MARK_ICON}" alt="" width="${markSize}" height="${markSize}" decoding="async" aria-hidden="true" />
  <span class="brand-lockup__wordmark">${BRAND_WORDMARK}<sup class="brand-lockup__reg" aria-hidden="true">®</sup></span>
</a>`;
}

const FAVICON_HEAD_TAGS = `    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16x16.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />`;

export const MEET_GREET_URL = BOOKING_LINK;

/** Pages that keep ADHD screening as the primary nav CTA */
const ADHD_FUNNEL_PATH = [
  /^adhd-care\.html$/,
  /^adhd-screening\.html$/,
  /^adhd-screening-results\.html$/,
  /^adult-adhd-diagnosis\.html$/,
  /^adhd-treatment-online\.html$/,
  /^creyos-adhd-testing\.html$/,
  /^online-adhd-test\.html$/,
  /^adhd-diagnosis-.+\.html$/,
  /^blog\/adhd\.html$/,
];

export function isAdhdFunnelPage(relPath) {
  return isAdhdFunnelPath(relPath);
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
  if (relPath === 'membership-pricing.html' || relPath === 'pricing.html') return true;
  if (/^blog\/.+adhd/i.test(relPath)) return true;
  if (/^blog\/.*(medication|vyvanse|adderall|focalin|stimulant|ritalin|prescribed-online)/i.test(relPath)) {
    return true;
  }
  return false;
}

const BLOG_HUB_FILES = new Set([
  'blog/index.html',
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
  FATIGUE: '/fatigue',
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
  '/blog/tirzepatide-vs-semaglutide-which-is-better': 'Who might consider tirzepatide instead of semaglutide (FAQ)',
  '/answers/is-online-adhd-diagnosis-legitimate': 'Legitimate online ADHD diagnosis checklist (FAQ)',
  '/answers/when-is-testosterone-therapy-appropriate': 'Symptoms that warrant TRT evaluation (FAQ)',
  '/answers/adhd-and-weight-loss-connection': 'ADHD and weight loss struggles',
  '/creyos-adhd-testing': 'Creyos cognitive testing for ADHD',
  '/pricing': `Transparent care pricing (${initialEvaluationPriceDisplay()} evaluation · $79 / $149 follow-up)`,
  '/blog/online-adhd-diagnosis-california': 'Online ADHD diagnosis in California',
  '/blog/online-adhd-diagnosis-texas': 'Online ADHD diagnosis in Texas',
  '/adhd-care': 'ADHD evaluation and ongoing care',
  '/weight-loss-metabolic-health': 'Medical weight loss program',
  '/adult-adhd-diagnosis': 'Book an adult ADHD evaluation',
  '/adhd-screening': 'Free 2-minute ADHD screening',
  '/answers': 'Browse all health guides',
  '/primary-urgent-care': 'Primary and urgent telehealth care',
  '/labs': 'Labs & blood tests',
  '/labs/fatigue-brain-fog': 'Fatigue & brain fog labs',
  '/labs/iron-ferritin': 'Iron & ferritin testing',
  '/labs/thyroid': 'Thyroid testing',
  '/labs/a1c-blood-sugar': 'A1c & blood sugar testing',
  '/labs/womens-midlife': "Women's midlife labs",
  '/labs/mens-health': "Men's health labs",
  '/labs/vitamin-b12': 'Vitamin B12 testing',
  '/labs/preventive': 'Preventive labs',
  '/labs/adhd-support': 'Labs & ADHD evaluation support',
  '/prescriptions': 'Online prescription services',
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps': 'Food noise and GLP-1 guide',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview': 'Insulin resistance and weight loss',
  '/fatigue': 'Fatigue: when tired stops being normal',
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
      <section class="section section-tinted learn-more-cluster adhd-suggested-reading" id="learn-more-adhd" aria-labelledby="learn-more-adhd-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-adhd-heading">Suggested Reading</h2>
            <p class="lead">A few starting points—before or after evaluation.</p>
          </div>
          <div class="adhd-reading-grid adhd-reading-grid--compact">
            <a class="adhd-reading-card" href="/answers/late-adhd-diagnosis-adults">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-finally-heard.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Late ADHD Diagnosis</strong>
              <span>Why so many adults seek answers later in life.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/adhd-medication-options-for-adults">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-adhd-consult.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>ADHD Medication Guide</strong>
              <span>Stimulant vs non-stimulant paths adults ask about first.</span>
            </a>
            <a class="adhd-reading-card" href="/answers/adhd-vs-anxiety">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-adhd-racing.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>ADHD vs Anxiety</strong>
              <span>How overlap happens—and why evaluation matters.</span>
            </a>
          </div>
          <p class="cta-microcopy adhd-reading-footer">Also useful: <a href="/pricing">evaluation pricing</a> · <a href="/blog/adhd">Browse all ADHD articles →</a></p>
        </div>
      </section>
      <!-- /SIYA:LEARN-MORE-ADHD -->`;

function buildMeetPhysiciansBlock(serviceKey, lead, stateAbbr = null, { gridClass = 'about-team-grid', heading = 'Meet our care team', limit = null, sectionClass = 'section', seeAllClass = 'blog-hub-see-all' } = {}) {
  let providers = getProvidersForServicePage(serviceKey, { stateAbbr });
  if (typeof limit === 'number' && limit > 0) providers = providers.slice(0, limit);
  const stateNote = stateAbbr
    ? `<p class="provider-state-filter-note">Showing clinicians licensed in <strong>${stateAbbr}</strong>.</p>`
    : '';
  const cards = providers
    .map((p) => {
      const tagline = `${getServiceTagline(p.slug, serviceKey) ?? p.servicePageTagline} · ${stateChipLabel(p)}`;
      return renderAboutTeamCard(p, {
        variant: 'meet',
        photoHtml: renderCareTeamPhoto(p, 88, 88),
        serviceTagline: tagline,
      });
    })
    .join('\n');
  return `<!-- SIYA:MEET-PHYSICIANS -->
      <section class="${sectionClass}" id="meet-physicians" aria-labelledby="meet-physicians-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="meet-physicians-heading">${heading}</h2>
            <p class="lead">${lead}</p>
            ${stateNote}
          </div>
          <div class="${gridClass}">
${cards}
          </div>
          <p class="${seeAllClass}"><a href="/providers" class="text-link">View full care team →</a></p>
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
      'womens-health.html': 'womens-health',
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
  'adhd-care.html': () =>
    buildMeetPhysiciansBlock(
      'adhd-care',
      'Licensed clinicians who evaluate and treat adult ADHD—physician-led, not a psychiatry mill.',
      null,
      {
        gridClass: 'about-team-grid about-team-grid--adhd about-team-grid--adhd-compact',
        sectionClass: 'section adhd-care-team-compact',
        seeAllClass: 'blog-hub-see-all care-team-hub-link',
        limit: 3,
      },
    ),
  'telehealth.html': () => buildMeetPhysiciansBlock('telehealth', 'Licensed telehealth clinicians—availability varies by state.'),
  'weight-loss-metabolic-health.html': () =>
    buildMeetPhysiciansBlock(
      'weight-loss-metabolic-health',
      'Our team includes physicians and advanced practice providers with experience in obesity medicine, ADHD, primary care, metabolic health, and long-term behavior change.',
      null,
      { heading: 'Meet the clinicians behind your care' },
    ),
  'mens-health-longevity.html': () =>
    buildMeetPhysiciansBlock(
      'mens-health-longevity',
      "Physician-led men's health and hormone care—evaluation first, treatment when clinically appropriate.",
      null,
      { heading: "Your men's health clinician" },
    ),
  'womens-health.html': () =>
    buildMeetPhysiciansBlock('womens-health', "Evidence-based women's health and hormone care."),
  'primary-urgent-care.html': () =>
    buildMeetPhysiciansBlock('primary-urgent-care', 'Family medicine clinicians for primary and urgent telehealth.'),
  /** Ads evaluation LPs — same canonical/roster source as /adhd-care; state-filtered. */
  'adhd-evaluation-texas.html': () =>
    buildMeetPhysiciansBlock(
      'adhd-care',
      'Licensed clinicians — physician-led adult ADHD evaluation.',
      'TX',
      {
        heading: 'Your care team',
        gridClass: 'about-team-grid about-team-grid--adhd about-team-grid--adhd-compact',
        sectionClass: 'section adhd-care-team-compact',
        seeAllClass: 'blog-hub-see-all',
        limit: 4,
      },
    ),
  'adhd-evaluation-california.html': () =>
    buildMeetPhysiciansBlock(
      'adhd-care',
      'Licensed clinicians — physician-led adult ADHD evaluation.',
      'CA',
      {
        heading: 'Your care team',
        gridClass: 'about-team-grid about-team-grid--adhd about-team-grid--adhd-compact',
        sectionClass: 'section adhd-care-team-compact',
        seeAllClass: 'blog-hub-see-all',
        limit: 4,
      },
    ),
};

const LEARN_MORE_WEIGHT = `<!-- SIYA:LEARN-MORE-WEIGHT -->
      <section class="section section-tinted learn-more-cluster adhd-suggested-reading" id="learn-more-weight-loss" aria-labelledby="learn-more-weight-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-weight-heading">Suggested Reading</h2>
            <p class="lead">Educational resources from Siya Health—so you can learn at your own pace before or after a visit.</p>
          </div>
          <div class="adhd-reading-grid">
            <a class="adhd-reading-card" href="/blog/food-noise-and-glp-1-what-it-means-and-what-helps">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-weight-effort.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Food Noise &amp; GLP-1</strong>
              <span>What food noise means and what may help.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/insulin-resistance-and-weight-loss-clinician-overview">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-insulin-metabolic.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Insulin Resistance</strong>
              <span>Clinician overview of IR and weight physiology.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/semaglutide-for-weight-loss-how-it-works">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-glp1-consult.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Semaglutide Overview</strong>
              <span>How it works when clinically appropriate.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/medical-weight-loss-vs-dieting-what-actually-works">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-medical-vs-diet.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Medical Weight Loss vs Dieting</strong>
              <span>Why regain happens—and what evaluation adds.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/how-mental-health-affects-weight-loss-outcomes">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-weight-mood.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Mental Health &amp; Weight</strong>
              <span>Stress, mood, and habits that affect outcomes.</span>
            </a>
            <a class="adhd-reading-card" href="/fatigue">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-exhausted-morning.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Fatigue</strong>
              <span>Energy, sleep, and metabolic overlap.</span>
            </a>
          </div>
          <p class="cta-microcopy adhd-reading-footer">Also useful: <a href="/pricing">pricing</a> · <a href="/blog/weight-loss">Browse weight loss articles →</a></p>
        </div>
      </section>
      <!-- /SIYA:LEARN-MORE-WEIGHT -->`;

const LEARN_MORE_MENS = `<!-- SIYA:LEARN-MORE-MENS -->
      <section class="section section-tinted learn-more-cluster adhd-suggested-reading" id="learn-more-mens-health" aria-labelledby="learn-more-mens-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-mens-heading">Suggested Reading</h2>
            <p class="lead">Educational resources from Siya Health—so you can learn at your own pace before or after a visit.</p>
          </div>
          <div class="adhd-reading-grid">
            <a class="adhd-reading-card" href="/blog/when-is-testosterone-therapy-appropriate">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-trt-consult.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>When Is TRT Appropriate?</strong>
              <span>Evidence-based criteria—not anti-aging hype.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/free-testosterone-vs-total-testosterone-what-patients-should-know">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-mens-hero.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Free vs Total Testosterone</strong>
              <span>What lab numbers actually mean.</span>
            </a>
            <a class="adhd-reading-card" href="/answers/what-does-low-testosterone-feel-like">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-mens-low-energy.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>What Low T Can Feel Like</strong>
              <span>Symptoms that prompt evaluation.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-mens-recovery.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Sleep Apnea &amp; Fatigue</strong>
              <span>When snoring signals more than noise.</span>
            </a>
            <a class="adhd-reading-card" href="/fatigue">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-mens-low-energy.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Fatigue</strong>
              <span>Energy workups that go beyond caffeine.</span>
            </a>
            <a class="adhd-reading-card" href="/answers/testosterone-and-adhd-overlap">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-mens-brain-fog.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Testosterone &amp; ADHD Overlap</strong>
              <span>When focus and hormones intersect.</span>
            </a>
          </div>
          <p class="cta-microcopy adhd-reading-footer">Also useful: <a href="/pricing">pricing</a> · <a href="/blog">Browse health articles →</a></p>
        </div>
      </section>
      <!-- /SIYA:LEARN-MORE-MENS -->`;

const LEARN_MORE_WOMENS = `<!-- SIYA:LEARN-MORE-WOMENS -->
      <section class="section section-tinted learn-more-cluster" id="learn-more-womens-health" aria-labelledby="learn-more-womens-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-womens-heading">Learn More About Women's Health</h2>
            <p class="lead">Evidence-based guides on ADHD in women, metabolic health, fatigue, and hormone-related concerns.</p>
          </div>
          <ul class="learn-more-links">
            <li><a href="/answers/adhd-in-women">ADHD in women: why symptoms are often missed</a></li>
            <li><a href="/answers/what-is-insulin-resistance">What is insulin resistance?</a></li>
            <li><a href="/answers/why-am-i-tired-even-after-sleeping">Why am I tired even after sleeping?</a></li>
            <li><a href="/answers/poor-sleep-feels-like-adhd">When poor sleep feels like ADHD</a></li>
            <li><a href="/fatigue">Fatigue: when tired stops being normal</a></li>
            <li><a href="/blog/insulin-resistance-and-weight-loss-clinician-overview">Insulin resistance and weight loss</a></li>
            <li><a href="/blog/food-noise-and-glp-1-what-it-means-and-what-helps">Food noise and GLP-1</a></li>
            <li><a href="/answers/what-is-food-noise">What is food noise?</a></li>
            <li><a href="/adhd-care">ADHD evaluation &amp; care</a></li>
            <li><a href="/weight-loss-metabolic-health">Medical weight loss</a></li>
          </ul>
        </div>
      </section>
      <!-- /SIYA:LEARN-MORE-WOMENS -->`;

const LEARN_MORE_TELE = `<!-- SIYA:LEARN-MORE-TELE -->
      <section class="section section-tinted learn-more-cluster adhd-suggested-reading" id="learn-more-telehealth" aria-labelledby="learn-more-tele-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="learn-more-tele-heading">Suggested Reading</h2>
            <p class="lead">Educational resources from Siya Health—so you can learn at your own pace before or after a visit.</p>
          </div>
          <div class="adhd-reading-grid">
            <a class="adhd-reading-card" href="/answers/is-telehealth-legitimate">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-finally-heard.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Is Telehealth Legitimate?</strong>
              <span>What to expect from licensed virtual care.</span>
            </a>
            <a class="adhd-reading-card" href="/answers/meet-and-greet-telehealth-expectations">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-adhd-consult.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Meet &amp; Greet Expectations</strong>
              <span>What the free call is—and is not.</span>
            </a>
            <a class="adhd-reading-card" href="/answers/how-online-prescriptions-work">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-adhd-keys.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>How Online Prescriptions Work</strong>
              <span>Safety, oversight, and refill basics.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/telehealth-prescriptions-how-online-treatment-works">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-energy-afternoon.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Online Treatment Overview</strong>
              <span>How virtual treatment pathways work.</span>
            </a>
            <a class="adhd-reading-card" href="/fatigue">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-exhausted-morning.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Fatigue</strong>
              <span>Common reasons adults book a visit.</span>
            </a>
            <a class="adhd-reading-card" href="/blog/telehealth">
              <figure class="adhd-reading-card-media">
                <img src="/assets/images/editorial-burnout-afterwork.jpg" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>Telehealth Article Hub</strong>
              <span>More guides on virtual care.</span>
            </a>
          </div>
          <p class="cta-microcopy adhd-reading-footer">Also useful: <a href="/pricing">pricing</a> · <a href="/blog/telehealth">Browse telehealth articles →</a></p>
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

/** Remove Health Guides from primary/mobile nav (keep Blog; guides remain in footer). */
function stripHealthGuidesFromNavBlock(navHtml) {
  return navHtml
    .replace(/\n?\s*<a href="\/answers">(?:Health Guides|Answers)<\/a>/gi, '')
    .replace(/\n?\s*<a href="\/answers\/?">[^<]*<\/a>/gi, (m) =>
      /Health Guides|Answers/i.test(m) ? '' : m,
    );
}

function injectAnswersInNavBlock(navHtml) {
  /* Homepage / primary nav: Blog only — Health Guides live in footer. */
  return stripHealthGuidesFromNavBlock(navHtml);
}

export function injectAnswersNav(html) {
  html = html.replace(/<nav class="nav-center"[\s\S]*?<\/nav>/gi, (nav) => injectAnswersInNavBlock(nav));
  html = html.replace(/<div class="nav-mobile">[\s\S]*?<\/div>/gi, (nav) => injectAnswersInNavBlock(nav));
  return html;
}

function injectMensHealthInNavBlock(navHtml) {
  /* Men's Health stays in footer/service links — not primary nav (Care Team holds that slot). */
  return navHtml;
}

export function injectMensHealthNav(html) {
  html = html.replace(/<nav class="nav-center"[\s\S]*?<\/nav>/gi, (nav) => injectMensHealthInNavBlock(nav));
  html = html.replace(/<div class="nav-mobile">[\s\S]*?<\/div>/gi, (nav) => injectMensHealthInNavBlock(nav));
  return html;
}

function injectLabsInNavBlock(navHtml) {
  const link = `<a href="${NAV_LABS.path}">${NAV_LABS.label}</a>`;
  if (navHtml.includes(`href="${NAV_LABS.path}"`)) return navHtml;
  if (navHtml.includes(`href="${NAV_JOIN_OUR_TEAM.path}"`)) {
    return navHtml.replace(
      new RegExp(`(<a href="${NAV_JOIN_OUR_TEAM.path}">[^<]*</a>)`),
      `$1\n          ${link}`,
    );
  }
  if (navHtml.includes('href="/blog">Blog</a>')) {
    return navHtml.replace(/(<a href="\/blog">Blog<\/a>)/, `${link}\n          $1`);
  }
  return navHtml;
}

export function injectLabsNav(html) {
  html = html.replace(/<nav class="nav-center"[\s\S]*?<\/nav>/gi, (nav) => injectLabsInNavBlock(nav));
  html = html.replace(/<div class="nav-mobile">[\s\S]*?<\/div>/gi, (nav) => injectLabsInNavBlock(nav));
  return html;
}

function injectEmployersInNavBlock(navHtml) {
  const link = `<a href="${NAV_EMPLOYERS.path}">${NAV_EMPLOYERS.label}</a>`;
  if (navHtml.includes(`href="${NAV_EMPLOYERS.path}"`)) return navHtml;
  if (navHtml.includes('href="/blog">Blog</a>')) {
    return navHtml.replace(/(<a href="\/blog">Blog<\/a>)/, `${link}\n          $1`);
  }
  if (navHtml.includes(`href="${NAV_LABS.path}"`)) {
    return navHtml.replace(
      new RegExp(`(<a href="${NAV_LABS.path}">[^<]*</a>)`),
      `$1\n          ${link}`,
    );
  }
  return navHtml;
}

export function injectEmployersNav(html) {
  html = html.replace(/<nav class="nav-center"[\s\S]*?<\/nav>/gi, (nav) => injectEmployersInNavBlock(nav));
  html = html.replace(/<div class="nav-mobile">[\s\S]*?<\/div>/gi, (nav) => injectEmployersInNavBlock(nav));
  return html;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Replace landing-page trust strip from trust-system profile */
function injectLandingTrust(html, relPath) {
  if (html.includes('lp-trust-grid-section')) return html;
  if (!html.includes('lp-trust-row')) return html;
  const { items } = resolveTrust(relPath, { variant: 'scroll' });
  const props = trustToRenderProps({ items });
  const lis = props.scrollItems
    .map((i) => `<li><strong>${escHtml(i.strong)}</strong> ${escHtml(i.text)}</li>`)
    .join('\n            ');
  const block = `      <section class="lp-trust-row" aria-label="Trust highlights">
        <div class="container">
          <ul class="lp-trust-scroll ds-trust-scroll">
            ${lis}
          </ul>
        </div>
      </section>`;
  return html.replace(/<section class="lp-trust-row"[\s\S]*?<\/section>/, block);
}

/** Sync legacy hardcoded trust figures from homepage-trust-metrics.mjs (Phase 1 numbers reconcile). */
export function injectSitewideTrustMetrics(html) {
  const M = HOMEPAGE_TRUST_METRICS;
  const patients = M.patientsTreated.value;
  const patientsTarget = patients.replace(/[^\d]/g, '');
  const ratingDisplay = `${M.googleRating.value}${M.googleRating.suffix}`;
  const neuro = M.neurocognitiveEvaluations.value;
  const neuroTarget = neuro.replace(/[^\d]/g, '');
  const neuroLabel = M.neurocognitiveEvaluations.label;
  const googleReviews = M.googleReviews.value;

  html = html.replace(/data-target="2200"/g, `data-target="${patientsTarget}"`);
  html = html.replace(/2,200\+/g, patients);
  html = html.replace(/data-target="4\.8"(?= data-suffix="★")/g, `data-target="${M.googleRating.value}"`);
  html = html.replace(/4\.8★/g, ratingDisplay);
  html = html.replace(
    /<span class="trust-metric-value" data-target="1000" data-suffix="\+">1,000\+<\/span> ADHD evaluations &amp; screenings/g,
    `<span class="trust-metric-value" data-target="${neuroTarget}" data-suffix="+">${neuro}</span> ${neuroLabel}`,
  );
  html = html.replace(/data-target="1000"(?= data-suffix="\+")/g, `data-target="${neuroTarget}"`);
  html = html.replace(/1,000\+/g, neuro);
  html = html.replace(
    /<span class="homepage-trust-stat-value">1,000\+<\/span>\s*<span class="homepage-trust-stat-label">ADHD evaluations &amp; screenings<\/span>/g,
    `<span class="homepage-trust-stat-value">${neuro}</span> <span class="homepage-trust-stat-label">${neuroLabel}</span>`,
  );
  html = html.replace(
    /<span class="homepage-trust-stat-value">1,200\+<\/span>\s*<span class="homepage-trust-stat-label">ADHD evaluations &amp; screenings<\/span>/g,
    `<span class="homepage-trust-stat-value">${neuro}</span> <span class="homepage-trust-stat-label">${neuroLabel}</span>`,
  );
  html = html.replace(
    /<span class="homepage-trust-stat-value">44<\/span>\s*<span class="homepage-trust-stat-label">Google reviews<\/span>/g,
    `<span class="homepage-trust-stat-value">${googleReviews}</span> <span class="homepage-trust-stat-label">Google reviews</span>`,
  );
  html = html.replace(
    /<span class="homepage-trust-stat-value">600\+<\/span>\s*<span class="homepage-trust-stat-label">Verified patient reviews<\/span>/g,
    `<span class="homepage-trust-stat-value">${M.verifiedReviews.value}</span> <span class="homepage-trust-stat-label">${M.verifiedReviews.label}</span>`,
  );

  const googleReviewsLine = `<span aria-hidden="true">⭐</span> <span class="trust-metric-value" data-target="${M.googleRating.value}" data-suffix="★">${ratingDisplay}</span> average · <span class="trust-metric-value" data-target="100" data-suffix="+">${googleReviews}</span> Google reviews · <span class="trust-metric-value" data-target="600" data-suffix="+">${M.verifiedReviews.value}</span> verified across platforms`;
  html = html.replace(
    /<span aria-hidden="true">⭐<\/span>[\s\S]*?verified patient reviews/g,
    googleReviewsLine,
  );

  const fullDeckStrong = `<p class="trust-metrics-rewrite-line trust-metrics-rewrite-line-strong"><span class="trust-metric-value" data-target="${patientsTarget}" data-suffix="+">${patients}</span> patients treated · <span class="trust-metric-value" data-target="${neuroTarget}" data-suffix="+">${neuro}</span> ${neuroLabel.toLowerCase()}</p>`;
  html = html.replace(
    /<p class="trust-metrics-rewrite-line trust-metrics-rewrite-line-strong">\s*<span class="trust-metric-value" data-target="2700" data-suffix="\+">2,700\+<\/span> patients treated\s*<\/p>/g,
    fullDeckStrong,
  );
  html = html.replace(
    /<p class="trust-metrics-rewrite-line trust-metrics-rewrite-line-strong">\s*<span class="trust-metric-value" data-target="1200" data-suffix="\+">1,200\+<\/span> Neurocognitive evaluations\s*<\/p>/gi,
    fullDeckStrong,
  );

  return html;
}

/** Sync hero trust bar from trust-system (homepage + cornerstone service pages) */
const HERO_TRUST_PAGES = new Set([
  'index.html',
  'mens-health-longevity.html',
  'womens-health.html',
  'weight-loss-metabolic-health.html',
  'telehealth.html',
  'pricing.html',
]);

function injectHeroTrustBar(html, relPath) {
  if (!HERO_TRUST_PAGES.has(relPath) || !html.includes('hero-trust-bar')) return html;
  const { profile, items } = resolveTrust(relPath);
  const props = trustToRenderProps({ items });
  const spans = props.scrollItems
    .slice(0, 4)
    .map((i) => `<span><strong>${escHtml(i.strong)}</strong> ${escHtml(i.text)}</span>`)
    .join('\n            ');
  return html.replace(
    /<div class="hero-trust-bar[^"]*">[\s\S]*?<\/div>/,
    `<div class="hero-trust-bar ds-trust-row" data-trust-profile="${escAttr(profile)}">\n            ${spans}\n          </div>`,
  );
}

/** Wire hero primary CTA through conversion-system with full analytics attrs */
function injectHeroPrimaryCta(html, relPath) {
  if (relPath === 'blog/index.html') return html;
  if (isAdsLandingPage(relPath, html)) return html;
  const heroBlock = html.match(/<div class="hero-ctas[^"]*">[\s\S]*?<\/div>/i);
  if (!heroBlock) return html;
  const { primary, secondary } = resolveConversion(relPath);
  const slot = primary ?? CTA_SLOTS.primary;
  const btn = renderButton({
    ...slotToButton(slot, { location: 'hero', relPath }),
    variant: 'primary',
    ctaSlot: slot.id ?? 'primary',
  });

  /** About (and similar): rebuild hero CTA row so secondary is not a duplicate Meet & Greet. */
  if (relPath === 'about.html' && secondary) {
    const secondaryBtn = renderButton({
      ...slotToButton(secondary, { location: 'hero', relPath }),
      variant: 'secondary',
      ctaSlot: secondary.id ?? 'secondary',
    });
    html = html.replace(
      /<div class="hero-ctas[^"]*">[\s\S]*?<\/div>/i,
      `<div class="hero-ctas hero-ctas-row">\n            ${btn}\n            ${secondaryBtn}\n          </div>`,
    );
  } else if (heroBlock[0].includes('data-conversion-goal') && heroBlock[0].includes(slot.url)) {
    /* Still refresh mobile sticky CTA if present */
  } else {
    html = html.replace(/<div class="hero-ctas[^"]*">[\s\S]*?<\/div>/i, (block) => {
      if (BUTTON_ANCHOR_RE.test(block)) {
        return block.replace(BUTTON_ANCHOR_RE, btn);
      }
      return `<div class="hero-ctas">\n            ${btn}\n          </div>`;
    });
  }
  if (html.includes('mobile-sticky-cta')) {
    const stickyBtn = renderButton({
      ...slotToButton(slot, { location: 'mobile-sticky', relPath }),
      variant: 'primary',
      ctaSlot: slot.id ?? 'primary',
    });
    html = html.replace(
      /<div class="mobile-sticky-cta"[^>]*>[\s\S]*?<\/div>/i,
      `<div class="mobile-sticky-cta" aria-hidden="true">\n      ${stickyBtn}\n    </div>`,
    );
  }
  return html;
}

/** Service heroes historically pair Meet & Greet + Secure Medical Chat — restore chat secondary if missing. */
const HERO_SECURE_CHAT_PAGES = new Set([
  'telehealth.html',
  'weight-loss-metabolic-health.html',
  'mens-health-longevity.html',
  'womens-health.html',
]);

function restoreSecureChatSecondaryCtas(html, relPath) {
  if (!HERO_SECURE_CHAT_PAGES.has(relPath)) return html;
  const chatBtn = renderButton({
    ...slotToButton(CTA_SLOTS.secureChat, { location: 'hero', relPath }),
    variant: 'secondary',
  });
  return html.replace(/<div class="hero-ctas[^"]*">[\s\S]*?<\/div>/i, (block) => {
    if (/\/redirect\/chat|data-cta-slot="secureChat"|secure_chat_click/i.test(block)) return block;
    const buttons = block.match(/<a\s[^>]*\bclass="[^"]*\bbutton\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi) || [];
    if (!buttons.length) {
      return block.replace(
        /(<div class="hero-ctas[^"]*">)/i,
        `$1\n            ${chatBtn}\n          `,
      );
    }
    const primary = buttons[0];
    return block.replace(
      /(<div class="hero-ctas[^"]*">)[\s\S]*(<\/div>)/i,
      `$1\n            ${primary}\n            ${chatBtn}\n          $2`,
    );
  });
}

const REVENUE_TRUST_PAGES = new Set([
  'adhd-care.html',
  'weight-loss-metabolic-health.html',
  'mens-health-longevity.html',
  'womens-health.html',
  'telehealth.html',
  'pricing.html',
]);

/** Inject trust-metrics grid on cornerstone service pages when present */
function injectServiceTrust(html, relPath) {
  if (!REVENUE_TRUST_PAGES.has(relPath) || !html.includes('trust-metrics')) return html;
  if (html.includes('data-trust-profile')) return html;
  const { profile, items } = resolveTrust(relPath);
  const props = trustToRenderProps({ items });
  if (!props.metrics.length) return html;
  const cards = props.metrics
    .map(
      (m) => `<div class="trust-metric-card ds-trust__metric" data-trust-item>
              <span class="trust-metric-value ds-trust__value">${escHtml(m.value)}</span>
              <span class="trust-metric-label ds-trust__label">${escHtml(m.label)}</span>
            </div>`,
    )
    .join('\n            ');
  return html.replace(
    /<div class="trust-metrics-grid">[\s\S]*?<\/div>/,
    `<div class="trust-metrics-grid ds-trust__grid" data-trust-profile="${escAttr(profile)}">\n            ${cards}\n          </div>`,
  );
}

/** Match <a ... class="...button..."> regardless of attribute order (href may precede class). */
const BUTTON_ANCHOR_RE = /<a\s+[^>]*\bclass="[^"]*\bbutton\b[^"]*"[^>]*>[\s\S]*?<\/a>/i;

/** Sitewide nav CTA via conversion-system */
export function injectNavCta(html, relPath) {
  if (relPath.startsWith('answers/')) return html;
  const meetBtn = renderNavCtaMarkup(relPath, 'nav');
  const mobileBtn = renderNavCtaMarkup(relPath, 'nav-mobile');
  html = html.replace(/<div class="nav-cta">\s*[\s\S]*?<\/div>/gi, (block) => {
    if (BUTTON_ANCHOR_RE.test(block)) {
      return block.replace(BUTTON_ANCHOR_RE, meetBtn);
    }
    return `<div class="nav-cta">\n          ${meetBtn}\n        </div>`;
  });
  // Scope to each nav-mobile block only — never span past its closing </div>
  // into hero-ctas (previous regex required class-before-href and could replace Explore Care).
  html = html.replace(/<div class="nav-mobile">[\s\S]*?<\/div>/gi, (block) => {
    if (BUTTON_ANCHOR_RE.test(block)) {
      return block.replace(BUTTON_ANCHOR_RE, mobileBtn);
    }
    return block.replace(/<\/div>\s*$/i, `          ${mobileBtn}\n        </div>`);
  });
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
    ? `            <li><a href="${LEGAL_LINKS.controlledSubstanceTreatment}">Controlled Substance Agreement</a></li>`
    : '';
  return `        <div class="footer-col footer-col--legal"><h4>Legal</h4>
          <ul class="footer-links">
            <li><a href="${LEGAL_LINKS.hub}">Legal &amp; Compliance</a></li>
            <li><a href="${LEGAL_LINKS.terms}">Terms of Use</a></li>
            <li><a href="${LEGAL_LINKS.privacy}">Privacy Policy</a></li>
            <li><a href="${LEGAL_LINKS.noticeOfPrivacy}">Notice of Privacy Practices</a></li>
            <li><a href="${LEGAL_LINKS.cookie}">Cookie Policy</a></li>
${csLink}
          </ul>
        </div>`;
}

/** Point legacy URLs to registry-driven /legal/* paths; standardize labels. */
export function normalizeLegalLinks(html) {
  html = html.replaceAll('https://adhd.siya.health/privacy-policy', LEGAL_LINKS.privacy);
  html = html.replaceAll('https://adhd.siya.health/terms-of-service', LEGAL_LINKS.terms);
  html = html.replaceAll('https://adhd.siya.health/notice-of-privacy-practices', LEGAL_LINKS.noticeOfPrivacy);

  // False NPP → privacy (legacy path and link-cards on /legal/privacy-policy)
  // Do not cross </a> — otherwise a Privacy Policy card can match a later NPP <h4>.
  html = html.replace(
    /href="\/privacy-policy"([^>]*)>((?:(?!<\/a>)[\s\S])*?)Notice of Privacy Practices/gi,
    `href="${LEGAL_LINKS.noticeOfPrivacy}"$1>$2Notice of Privacy Practices`,
  );
  html = html.replace(
    /<a([^>]*)\bhref="(?:\/privacy-policy|\/legal\/privacy-policy)"([^>]*)>((?:(?!<\/a>)[\s\S])*?<h4>\s*Notice of Privacy Practices\s*<\/h4>)/gi,
    `<a$1href="${LEGAL_LINKS.noticeOfPrivacy}"$2>$3`,
  );

  html = html.replaceAll('href="/legal/terms-of-use"', `href="${LEGAL_LINKS.terms}"`);
  html = html.replaceAll('href="/legal/privacy-policy"', `href="${LEGAL_LINKS.privacy}"`);

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

/** Standardize states, Health Guides naming, CTAs, pricing paths, and legacy copy on every page */
export function normalizeSitewideCopy(html, relPath = '') {
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
  // ADHD shadow/geo pages + meta: "telehealth in Texas, Pennsylvania & Florida" omits California (idempotent).
  html = html.replace(
    /telehealth in (?:California, )?Texas, Pennsylvania (&amp;|&) Florida/g,
    (_m, amp) => `telehealth in California, Texas, Pennsylvania ${amp} Florida`,
  );
  html = html.replace(
    /at home in (?:California, )?Texas, Pennsylvania, or Florida/g,
    'at home in California, Texas, Pennsylvania, or Florida',
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

  html = html.replaceAll('Book Free Consultation →', `${COPY_STANDARDS.walkthroughCta} →`);
  for (const label of LEGACY_WALKTHROUGH_CTA_LABELS) {
    html = html.replaceAll(label, COPY_STANDARDS.walkthroughCta);
  }
  for (const label of REMOVED_BOOKING_CTA_LABELS) {
    if (label.includes('book.carepatron') || label.includes('yourmarketingai')) continue;
    html = html.replaceAll(label, COPY_STANDARDS.primaryCta);
  }
  html = html.replaceAll('Explore care options', COPY_STANDARDS.secondaryCtaTelehealth);
  html = html.replaceAll('Explore Services', COPY_STANDARDS.secondaryCtaTelehealth);
  html = html.replaceAll('Explore Siya Health Services', COPY_STANDARDS.secondaryCtaTelehealth);
  html = html.replace(
    /(<a[^>]*>)\s*Join Siya Circle\s*(<\/a>)/gi,
    `$1${COPY_STANDARDS.newsletterCta}$2`,
  );
  html = html.replaceAll('Get Health Guides', COPY_STANDARDS.newsletterCta);
  // Screening CTA label normalization (CA screening Ads LP retired 2026-08-16)
  html = html.replace(/(Take )+Free ADHD Screening/g, COPY_STANDARDS.adhdSecondaryCta);
  html = html.replace(/(?<!Take )Free ADHD Screening/g, COPY_STANDARDS.adhdSecondaryCta);
  html = html.replaceAll('Take Free Screening', COPY_STANDARDS.adhdSecondaryCta);
  html = html.replaceAll('Start Free Screening', COPY_STANDARDS.adhdSecondaryCta);
  html = html.replaceAll('Schedule ADHD Evaluation', COPY_STANDARDS.adhdPrimaryCta);
  html = html.replaceAll('Book ADHD Evaluation', COPY_STANDARDS.adhdPrimaryCta);
  html = html.replaceAll('Clinical Review Status', COPY_STANDARDS.reviewBadgePending);
  html = html.replaceAll('Clinically Reviewed', COPY_STANDARDS.reviewBadgeReviewed);
  html = html.replaceAll('Review needed', COPY_STANDARDS.reviewBadgePending);
  html = html.replaceAll('Awaiting final physician review', 'awaiting final physician review');
  html = html.replaceAll('Membership &amp; pricing', COPY_STANDARDS.pricingNavLabel);
  html = html.replaceAll('Membership & pricing', COPY_STANDARDS.pricingNavLabel);
  html = html.replaceAll('Membership &amp; Pricing', COPY_STANDARDS.pricingNavLabel);
  html = html.replaceAll('Membership & Pricing', COPY_STANDARDS.pricingNavLabel);
  html = html.replaceAll('See pricing &amp; membership', `See ${COPY_STANDARDS.pricingNavLabel.toLowerCase()}`);
  html = html.replaceAll('See pricing & membership', `See ${COPY_STANDARDS.pricingNavLabel.toLowerCase()}`);
  html = html.replaceAll('View Membership &amp; Pricing', `View ${COPY_STANDARDS.pricingNavLabel}`);
  html = html.replaceAll('View Membership & Pricing', `View ${COPY_STANDARDS.pricingNavLabel}`);
  html = html.replaceAll(PRICING.legacyPath, PRICING.path);
  for (const [from, to] of Object.entries(REMOVED_BLOG_PATHS)) {
    html = html.replaceAll(`href="${from}"`, `href="${to}"`);
  }
  html = html.replaceAll('Siya Circle™', 'Siya Circle');
  for (const { from, to } of LEGACY_MARKETPLACE_PHRASES) {
    if (to) html = html.replace(from, to);
  }
  html = html.replace(/\$150(\s*<span>\/month<\/span>)/g, '$149$1');
  html = html.replace(/\$150\/month/g, '$149/month');
  html = html.replaceAll('Related guides + Meet & Greet when ready.', `Related guides — ${COPY_STANDARDS.primaryCta} when ready.`);
  html = html.replaceAll('Related guides + Meet &amp; Greet when ready.', `Related guides — ${COPY_STANDARDS.primaryCta} when ready.`);
  html = html.replace(/Meet &amp; Greet when ready/gi, `${COPY_STANDARDS.primaryCta} when ready`);
  html = html.replace(/Meet & Greet when ready/gi, `${COPY_STANDARDS.primaryCta} when ready`);
  html = html.replace(/Talk to a Clinician when ready/gi, `${COPY_STANDARDS.primaryCta} when ready`);
  html = html.replace(/Talk to a clinician when ready/gi, `${COPY_STANDARDS.primaryCta} when ready`);
  html = html.replace(/Find the Right Starting Point/g, COPY_STANDARDS.secondaryCtaTelehealth);
  html = html.replace(/Schedule a quick call/gi, COPY_STANDARDS.primaryCta);
  html = html.replace(/membership pricing/gi, 'follow-up plan pricing');
  html = html.replace(/Board-certified, ADHD-CCSP trained providers/gi, MIXED_ROSTER_CLINICIAN_PHRASE);
  html = html.replace(/ADHD-CCSP trained clinicians/gi, 'ADHD-CCSP–trained clinicians');
  html = html.replace(/physician assistant/gi, 'Physician Associate');
  /* Meet & Greet is the approved product CTA — do not rename body/CTA copy to "first telehealth visit". */
  html = html.replace(/book a Meet &amp; Greet/gi, COPY_STANDARDS.primaryCta);
  html = html.replace(/book a Meet & Greet/gi, COPY_STANDARDS.primaryCta);
  html = html.replace(/Discuss pricing on a Meet and Greet/gi, 'View Pricing');
  html = html.replace(/\bfree discovery call\b/gi, 'free Meet &amp; Greet');
  html = html.replace(/\bdiscovery call\b/gi, 'Meet &amp; Greet');
  html = html.replace(/Talk to a clinician when you['']re ready/gi, COPY_STANDARDS.primaryCta);
  html = html.replace(
    /Ongoing medication management is available on a monthly plan if clinically appropriate\./g,
    'Follow-up plans start at $79/month for non-controlled medications, or $149/month for controlled-medication follow-up when clinically appropriate. See <a href="/pricing">pricing</a>.',
  );
  html = fixDuplicateCalifornia(html);
  return html;
}

/** HelloKlarity-style SEO footer — compact horizontal columns + brand/contact bar. */
const FOOTER_NOTICE_DEFAULT =
  'For emergencies, call 911. All telehealth services are provided by licensed medical professionals in accordance with state regulations.';
const FOOTER_NOTICE_EDUCATIONAL =
  'For emergencies, call 911. Educational content only—not medical advice for your specific situation.';

const FOOTER_CARE_SERVICES_LINKS = [
  { href: '/adhd-care', label: 'ADHD evaluation & care' },
  { href: '/adhd-screening', label: 'Free ADHD screening' },
  { href: '/weight-loss-metabolic-health', label: 'Medical weight loss' },
  { href: '/mens-health-longevity', label: "Men's health & longevity" },
  { href: '/womens-health', label: "Women's health" },
  { href: '/telehealth', label: 'Telehealth services' },
  { href: '/primary-urgent-care', label: 'Primary & urgent care' },
  { href: '/prescriptions', label: 'Online prescriptions' },
  { href: '/labs', label: 'Labs & blood tests' },
];

const FOOTER_HEALTH_GUIDES_LINKS = [
  { href: NAV_HEALTH_GUIDES.path, label: 'All Health Guides' },
  { href: '/answers/signs-of-adult-adhd', label: 'Adult ADHD signs' },
  { href: '/answers/is-online-adhd-diagnosis-legitimate', label: 'Online ADHD diagnosis' },
  { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Fatigue & sleep' },
  { href: '/answers/what-is-insulin-resistance', label: 'Insulin resistance' },
];

const FOOTER_BLOG_LINKS = [
  { href: '/blog', label: 'Health articles' },
  { href: '/blog/adhd', label: 'ADHD articles' },
  { href: '/blog/weight-loss', label: 'Weight loss articles' },
  { href: '/blog/telehealth', label: 'Telehealth articles' },
  { href: '/blog/how-to-know-if-you-have-adhd-adult', label: 'Signs of adult ADHD' },
];

const FOOTER_COMPANY_LINKS = [
  { href: '/about', label: 'About Siya Health' },
  { href: NAV_PROVIDERS.path, label: NAV_PROVIDERS.label },
  { href: PRICING.path, label: COPY_STANDARDS.pricingNavLabel },
  { href: '/telehealth', label: 'Explore Telehealth Care' },
  { href: '/book-appointment', label: 'Book Appointment', track: 'book_appointment_click' },
  { href: REDIRECT_CHAT_URL, label: COPY_STANDARDS.secureChatCta, track: 'secure_chat_click' },
  {
    href: ZOCDOC_BOOKING_URL,
    label: 'Book Online via Zocdoc',
    external: true,
    track: 'zocdoc_booking_click',
  },
  {
    href: SIYA_CIRCLE_SIGNUP_URL,
    label: 'Siya Circle',
    track: SIYA_CIRCLE_JOIN_TRACK,
  },
  {
    href: NAV_EMPLOYERS.path,
    label: NAV_EMPLOYERS.label,
  },
];

const FOOTER_TRUST_BLOCK = `          <div class="footer-trust-logos">
            <img src="/assets/images/hipaa-compliant.png" alt="HIPAA compliant privacy practices" class="footer-trust-logo" width="72" height="72" />
            <a href="https://www.legitscript.com/websites/?checker_keywords=siya.health" target="_blank" rel="noopener" title="Verify LegitScript Approval for www.siya.health"><img src="https://static.legitscript.com/seals/46197681.png" alt="Verify Approval for www.siya.health" class="footer-trust-logo" width="73" height="79" /></a>
            <img src="/assets/images/creyos-logo.png" alt="Creyos Cognitive Testing" class="footer-trust-logo" width="90" height="50" />
          </div>`;

const FOOTER_SOCIAL_BLOCK = `          <div class="footer-social">
            <a href="https://www.facebook.com/siyahealthofficial" target="_blank" rel="noopener" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
            <a href="https://www.instagram.com/siyahealth_official/" target="_blank" rel="noopener" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a href="https://www.linkedin.com/company/siyahealthofficial/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
            <a href="https://www.pinterest.com/siyahealthus/" target="_blank" rel="noopener" aria-label="Pinterest"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.395 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg></a>
          </div>`;

function renderFooterLinkItem({ href, label, external = false, track = '' }) {
  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const trackAttr = track ? ` data-siya-track="${track}"` : '';
  return `            <li><a href="${href}"${attrs}${trackAttr}>${label}</a></li>`;
}

function renderFooterLinkColumn(title, links, className = 'footer-col') {
  const linkHtml = links.map((l) => renderFooterLinkItem(l)).join('\n');
  return `        <div class="${className}">
          <h4>${title}</h4>
          <ul class="footer-links">
${linkHtml}
          </ul>
        </div>`;
}

function renderSeoFooterColumns(relPath = '') {
  const includeCs = relPath ? isControlledSubstanceLinkPage(relPath) : false;
  return [
    renderFooterLinkColumn('Care &amp; Services', FOOTER_CARE_SERVICES_LINKS, 'footer-col footer-col--services'),
    renderFooterLinkColumn('Health Guides', FOOTER_HEALTH_GUIDES_LINKS, 'footer-col footer-col--guides'),
    renderFooterLinkColumn('Blog', FOOTER_BLOG_LINKS, 'footer-col footer-col--blog'),
    renderFooterLinkColumn('Company', FOOTER_COMPANY_LINKS, 'footer-col footer-col--company'),
    renderLegalFooter({ includeControlledSubstance: includeCs }),
  ].join('\n');
}

function resolveFooterNotice(html, relPath = '') {
  const match = html.match(/<p class="footer-notice">([^<]*)<\/p>/);
  if (match) return match[1].trim();
  if (relPath.startsWith('answers/') || relPath.startsWith('blog/')) return FOOTER_NOTICE_EDUCATIONAL;
  return FOOTER_NOTICE_DEFAULT;
}

function renderSeoFooterMarkup(relPath = '', notice = FOOTER_NOTICE_DEFAULT) {
  const columns = renderSeoFooterColumns(relPath);
  return `      <div class="container container--footer-wide footer-grid footer-grid--seo" data-siya-footer="seo-v2">
${columns}
      </div>
      <div class="container container--footer-wide footer-brand-bar">
        <div class="footer-brand-bar__left">
          ${renderBrandLockup({ variant: 'footer' })}
          <div class="footer-brand-meta">
            <p class="footer-brand-tagline">${FOOTER_STATES_LINE}</p>
${FOOTER_TRUST_BLOCK}
${FOOTER_SOCIAL_BLOCK}
          </div>
        </div>
        <div class="footer-brand-bar__right footer-contact-block">
          <p class="footer-contact-phone"><a href="tel:+12154451244" class="footer-phone">(215)&nbsp;445-1244</a></p>
          <p><a href="mailto:care@siya.health">care@siya.health</a></p>
          <p><a href="${REDIRECT_MEET_GREET_URL}" data-siya-track="meet_greet_click">${COPY_STANDARDS.meetGreetCta}</a></p>
          <p><a href="/book-appointment" data-siya-track="book_appointment_click">Book Appointment</a></p>
          <p><a href="${REDIRECT_CHAT_URL}" data-siya-track="secure_chat_click">${COPY_STANDARDS.secureChatCta}</a></p>
          <p class="footer-booking-alt"><a href="${ZOCDOC_BOOKING_URL}" target="_blank" rel="noopener noreferrer" data-siya-track="zocdoc_booking_click">Additional booking option</a></p>
        </div>
      </div>
      <div class="container container--footer-wide">
        <p class="footer-notice">${notice}</p>
        <small>© 2026 Siya Health Inc. All rights reserved.</small>
      </div>`;
}

/** Replace footer with HelloKlarity-style horizontal SEO architecture (visible links only). */
export function injectSeoFooterArchitecture(html, relPath = '') {
  if (!html.includes('<footer')) return html;

  const notice = resolveFooterNotice(html, relPath);
  const markup = renderSeoFooterMarkup(relPath, notice);
  return html.replace(/<footer class="footer">[\s\S]*?<\/footer>/i, `<footer class="footer">\n${markup}\n    </footer>`);
}

/** @deprecated Merged into injectSeoFooterArchitecture — kept for import compatibility. */
export function injectFooterChrome(html, relPath = '') {
  return injectSeoFooterArchitecture(html, relPath);
}

/** @deprecated Merged into injectSeoFooterArchitecture — kept for import compatibility. */
export function injectFooterGuideHubs(html) {
  return html;
}

/** Google Consent Mode bootstrap — must run synchronously before GTM on every public page */
export function injectCookieConsentBootstrap(html) {
  const tag = '<script src="/scripts/cookie-consent-bootstrap.js"></script>';
  html = html.replace(/\s*<script src="\/scripts\/cookie-consent-bootstrap\.js"><\/script>\s*/gi, '\n');
  if (html.includes(tag)) return html;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/(<head[^>]*>)/i, `$1\n    ${tag}`);
  }
  return html;
}

const GTM_ID = TRACKING.GTM_CONTAINER_ID;

const GTM_HEAD_SNIPPET = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){${GTM_PRODUCTION_HOST_GUARD}w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');</script>
<!-- End Google Tag Manager -->`;

const GTM_NOSCRIPT_SNIPPET = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
height="0" width="0" style="display:none;visibility:hidden" title="GTM"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

/** Meta Pixel — Facebook standard snippet (head script + body noscript) */
const META_PIXEL_SNIPPET = `<!-- Meta Pixel Code -->
<script>window.__SIYA_META_PIXEL_ID='${TRACKING.META_PIXEL_ID}';</script>
<script src="/scripts/meta-pixel.js"></script>
<!-- End Meta Pixel Code -->`;

const META_PIXEL_NOSCRIPT = `<!-- Meta Pixel noscript -->
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${TRACKING.META_PIXEL_ID}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel noscript -->`;

const SIYA_TRACKING_BLOCK = `<!-- SIYA:TRACKING -->
    <script src="/scripts/siya-tracking.js" defer></script>
    <script src="/scripts/lab-storefront-modal.js" defer></script>
    <!-- /SIYA:TRACKING -->`;

const SIYA_TRACKING_BLOCK_SYNC = `<!-- SIYA:TRACKING -->
    <script src="/scripts/siya-tracking.js"></script>
    <script src="/scripts/lab-storefront-modal.js"></script>
    <!-- /SIYA:TRACKING -->`;

/** Remove duplicate GTM head / noscript blocks before canonical re-injection */
export function stripExistingGtm(html) {
  html = html.replace(
    /<!--\s*Google Tag Manager\s*-->[\s\S]*?<!--\s*End Google Tag Manager\s*-->\s*/gi,
    '',
  );
  html = html.replace(
    /<!--\s*Google Tag Manager \(noscript\)\s*-->[\s\S]*?<!--\s*End Google Tag Manager \(noscript\)\s*-->\s*/gi,
    '',
  );
  html = html.replace(
    /<script>\s*\(function\(w,d,s,l,i\)\{[\s\S]*?googletagmanager\.com\/gtm\.js[\s\S]*?<\/script>\s*/gi,
    '',
  );
  html = html.replace(
    /<noscript>\s*<iframe[^>]*googletagmanager\.com\/ns\.html[^>]*>\s*<\/iframe>\s*<\/noscript>\s*/gi,
    '',
  );
  return html;
}

/** Remove raw gtag / GA4 / Google Ads direct installs — GTM manages these tags */
export function stripExistingGtag(html) {
  html = html.replace(
    /<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=[^"]+"><\/script>\s*/gi,
    '',
  );
  html = html.replace(
    /<script>\s*window\.dataLayer\s*=\s*window\.dataLayer[\s\S]*?gtag\('config',\s*'AW-[^']+'\);[\s\S]*?<\/script>\s*/gi,
    '',
  );
  html = html.replace(/\s*<!--\s*Google Analytics 4[^>]*-->\s*/gi, '\n');
  return html;
}

/** Remove prior Meta Pixel installs before canonical re-injection */
export function stripExistingMetaPixel(html) {
  html = html.replace(
    /<!--\s*Meta Pixel Code\s*-->[\s\S]*?<!--\s*End Meta Pixel Code\s*-->\s*/gi,
    '',
  );
  html = html.replace(
    /<script src="\/scripts\/meta-pixel\.js"><\/script>\s*/gi,
    '',
  );
  html = html.replace(
    /<script>\s*!function\(f,b,e,v,n,t,s\)[\s\S]*?fbevents\.js[\s\S]*?<\/script>\s*/gi,
    '',
  );
  html = html.replace(
    /<noscript>\s*<img[^>]*facebook\.com\/tr\?[^>]*>\s*<\/noscript>\s*/gi,
    '',
  );
  return html;
}

/** Install GTM + Meta Pixel + sitewide dataLayer tracking on every public HTML page */
export function injectGtmAndTracking(html, relPath = '') {
  html = stripExistingGtm(html);
  html = stripExistingGtag(html);
  html = stripExistingMetaPixel(html);

  if (!html.includes(`gtm.js?id=${GTM_ID}`)) {
    if (html.includes('cookie-consent-bootstrap.js')) {
      html = html.replace(
        /(<script src="\/scripts\/cookie-consent-bootstrap\.js"><\/script>)/i,
        `$1\n${GTM_HEAD_SNIPPET}`,
      );
    } else if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1\n    ${GTM_HEAD_SNIPPET}`);
    }
  }

  if (!html.includes('/scripts/meta-pixel.js')) {
    if (html.includes('cookie-consent-bootstrap.js')) {
      html = html.replace(
        /(<script src="\/scripts\/cookie-consent-bootstrap\.js"><\/script>)/i,
        `$1\n${META_PIXEL_SNIPPET}`,
      );
    } else if (html.includes('<!-- End Google Tag Manager -->')) {
      html = html.replace(
        '<!-- End Google Tag Manager -->',
        `<!-- End Google Tag Manager -->\n${META_PIXEL_SNIPPET}`,
      );
    } else if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1\n    ${META_PIXEL_SNIPPET}`);
    }
  }

  if (!html.includes(`googletagmanager.com/ns.html?id=${GTM_ID}`)) {
    if (/<body[^>]*>/i.test(html)) {
      html = html.replace(/(<body[^>]*>)/i, `$1\n    ${GTM_NOSCRIPT_SNIPPET}\n`);
    }
  }

  if (!html.includes(`facebook.com/tr?id=${TRACKING.META_PIXEL_ID}`)) {
    if (/<body[^>]*>/i.test(html)) {
      html = html.replace(/(<body[^>]*>)/i, `$1\n    ${META_PIXEL_NOSCRIPT}\n`);
    }
  }

  /* Re-place tracking cleanly (redirect pages need sync load before redirect-transition.js) */
  html = html.replace(/<!--\s*SIYA:TRACKING\s*-->[\s\S]*?<!--\s*\/SIYA:TRACKING\s*-->\s*/gi, '');
  html = html.replace(/<script src="\/scripts\/siya-tracking\.js"(?:\s+defer)?><\/script>\s*/gi, '');
  html = html.replace(/<script src="\/scripts\/lab-storefront-modal\.js"(?:\s+defer)?><\/script>\s*/gi, '');

  const isRedirect = /^redirect\//.test(relPath);

  if (!html.includes('siya-tracking.js')) {
    if (isRedirect && html.includes('redirect-transition.js')) {
      html = html.replace(
        /<script src="\/scripts\/redirect-transition\.js"><\/script>/i,
        `${SIYA_TRACKING_BLOCK_SYNC}\n    <script src="/scripts/redirect-transition.js"></script>`,
      );
    } else if (html.includes('<!-- /SIYA:COOKIE-NOTICE -->')) {
      html = html.replace('<!-- /SIYA:COOKIE-NOTICE -->', `${SIYA_TRACKING_BLOCK}\n<!-- /SIYA:COOKIE-NOTICE -->`);
    } else if (html.includes('<!-- /SIYA:HEADER-SCROLL -->')) {
      html = html.replace('<!-- /SIYA:HEADER-SCROLL -->', `${SIYA_TRACKING_BLOCK}\n<!-- /SIYA:HEADER-SCROLL -->`);
    } else {
      html = html.replace(/<\/body>/i, `${SIYA_TRACKING_BLOCK}\n</body>`);
    }
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

const ADHD_LEARN_MORE_PAGES = new Set([
  'adhd-care.html',
  'adhd-screening.html',
  'adult-adhd-diagnosis.html',
  'adhd-treatment-online.html',
  'online-adhd-test.html',
  'creyos-adhd-testing.html',
]);

export function injectLearnMoreSections(html, relPath) {
  if (ADHD_LEARN_MORE_PAGES.has(relPath)) {
    if (html.includes('SIYA:LEARN-MORE-ADHD')) {
      html = html.replace(/<!-- SIYA:LEARN-MORE-ADHD -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-ADHD -->/, LEARN_MORE_ADHD);
    } else if (html.includes('<!-- FINAL CTA -->')) {
      html = html.replace('<!-- FINAL CTA -->', `${LEARN_MORE_ADHD}\n\n      <!-- FINAL CTA -->`);
    } else if (html.includes('</main>')) {
      html = html.replace(/\s*<\/main>/, `\n\n      ${LEARN_MORE_ADHD}\n    </main>`);
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
  if (relPath === 'womens-health.html') {
    if (html.includes('SIYA:LEARN-MORE-WOMENS')) {
      html = html.replace(/<!-- SIYA:LEARN-MORE-WOMENS -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-WOMENS -->/, LEARN_MORE_WOMENS);
    } else {
      html = html.replace(/\s*<\/main>/, `\n\n      ${LEARN_MORE_WOMENS}\n     </main>`);
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

const HOMEPAGE_FOUNDER_SLUGS = ['dr-sneh-pandey', 'dr-swati-pandey'];

function renderHomepageCareCompactCard(provider) {
  const role = provider.homepageRole || provider.role || '';
  return `<article class="homepage-care-compact-card">
              ${renderCareTeamPhoto(provider, 72, 72)}
              <div>
                <h3><a href="/providers/${provider.slug}">${provider.name}</a></h3>
                <p>${role}</p>
              </div>
            </article>`;
}

function activeClinicianCountLabel() {
  const n = getAllProviders().length;
  return `${n} clinician${n === 1 ? '' : 's'}`;
}

function buildHomepageCareTeam() {
  const founders = HOMEPAGE_FOUNDER_SLUGS.map((slug) => getAllProviders().find((p) => p.slug === slug)).filter(
    Boolean,
  );
  const founderCards = founders.map((p) => renderHomepageCareCompactCard(p)).join('\n            ');
  return `<!-- SIYA:CARE-TEAM -->
      <section class="section" id="care-team" aria-labelledby="care-team-heading">
        <div class="container">
          <div class="section-header care-team-header">
            <h2 id="care-team-heading">Meet Our Care Team</h2>
            <p class="lead">Physician-led telehealth with a full multidisciplinary team behind your care.</p>
          </div>
          <div class="homepage-care-compact">
            <div class="homepage-care-compact-founders">
            ${founderCards}
            </div>
            <a class="button secondary" href="/providers">Meet the full care team (${activeClinicianCountLabel()})</a>
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
            <p class="lead">Start Secure Medical Chat—we match you with a licensed clinician for your state and goals.</p>
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
  html = injectSparsePrimaryNav(html);
  html = normalizeProviderCareersNav(html);

  html = html.replaceAll('href="/providers">Our Care Team</a>', `href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a>`);
  html = html.replaceAll('href="/providers">Our providers</a>', `href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a>`);
  html = html.replaceAll('href="/providers">Our physicians</a>', `href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a>`);

  const aboutDropdown = renderAboutNavDropdown();
  const DROPDOWN_RE =
    /<div class="nav-dropdown">\s*<button[\s\S]*?<\/button>\s*<div class="nav-dropdown__menu"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*/gi;

  const collapseDesktopNav = (nav) => {
    if (!/class="nav-center"/i.test(nav)) return nav;
    if (primaryNavIsSparse(nav)) return renderStandardDesktopNav();
    let next = nav
      .replace(DROPDOWN_RE, '')
      .replace(/<a href="\/about">About(?: Us)?<\/a>\s*/gi, '')
      .replace(new RegExp(`<a href="${NAV_PROVIDERS.path}">[^<]*</a>\\s*`, 'gi'), '')
      .replace(/<a href="\/providers">[^<]*<\/a>\s*/gi, '')
      .replace(/<\/div>\s*(?=<a href="\/(?:adhd-care|weight-loss|telehealth|mens-health|join-our-team|blog|answers)")/gi, '');
    if (next.includes('nav-dropdown')) return next;
    return next.replace(
      /(<nav class="nav-center"[^>]*>\s*(?:<a href="\/">Home<\/a>\s*)?)/i,
      `$1${aboutDropdown}\n          `,
    );
  };

  const standardMobileInner = `<a href="/">Home</a>
          <a href="/about">About Us</a>
          <a href="${NAV_PROVIDERS.path}">${NAV_PROVIDERS.label}</a>
          ${STANDARD_SERVICE_NAV_LINKS.map((l) => `<a href="${l.path}">${l.label}</a>`).join('\n          ')}`;

  const collapseMobileNav = (nav) => {
    if (!/class="nav-mobile"/i.test(nav)) return nav;
    return nav.replace(
      /<div class="nav-mobile">[\s\S]*?<\/div>/i,
      `<div class="nav-mobile">
          ${standardMobileInner}
        </div>`,
    );
  };

  html = html.replace(/<nav class="nav-center"[\s\S]*?<\/nav>/gi, collapseDesktopNav);
  html = html.replace(/<div class="nav-mobile">[\s\S]*?<\/div>/gi, collapseMobileNav);
  return html;
}

export function injectAboutProviderHub(html, relPath) {
  if (relPath !== 'about.html') return html;
  if (html.includes('View full care team') || html.includes('View Our Care Team (')) {
    return html;
  }
  const hubLink = `<p class="blog-hub-see-all"><a href="/providers">View Our Care Team (${activeClinicianCountLabel()})</a></p>`;
  if (html.includes('about-care-team-grid')) {
    return html.replace(
      /(<div class="about-team-grid about-care-team-grid">[\s\S]*?<\/div>)(\s*<p class="blog-hub-see-all)/,
      `$1\n          ${hubLink}$2`,
    );
  }
  return html;
}

function buildAboutCompanySection() {
  const copy = ABOUT_COMPANY_COPY;
  const stats = ABOUT_COMPANY_STATS.map(
    (s) => `            <article class="about-company-stat">
              <p class="about-company-stat-value">${s.value}</p>
              <p class="about-company-stat-label">${s.label}</p>
            </article>`,
  ).join('\n');
  const paragraphs = copy.paragraphs.map((p) => `            <p>${p}</p>`).join('\n');
  return `<!-- SIYA:ABOUT-COMPANY -->
      <section class="section section-tinted" id="about-company" aria-labelledby="about-company-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="about-company-heading">${copy.heading}</h2>
            <p class="lead">${copy.lead}</p>
          </div>
          <div class="about-company-layout">
            <div class="about-company-copy">
${paragraphs}
            </div>
            <div class="about-company-stats" aria-label="Siya Health at a glance">
${stats}
            </div>
          </div>
          <p class="blog-hub-see-all about-company-employer">
            ${copy.employerCta.text}
            <a href="${copy.employerCta.href}">${copy.employerCta.label}</a>
          </p>
        </div>
      </section>
      <!-- /SIYA:ABOUT-COMPANY -->`;
}

export function injectAboutCompany(html, relPath) {
  if (relPath !== 'about.html') return html;
  const block = buildAboutCompanySection();
  if (html.includes('SIYA:ABOUT-COMPANY')) {
    return html.replace(/<!-- SIYA:ABOUT-COMPANY -->[\s\S]*?<!-- \/SIYA:ABOUT-COMPANY -->/, block);
  }
  if (html.includes('id="medical-director"')) {
    return html.replace(
      /(\s*<!-- 3\. MEDICAL DIRECTOR -->)/,
      `\n\n      ${block}\n$1`,
    );
  }
  return html;
}

function buildAboutCareTeamSection() {
  const providers = getAllProviders();
  const cards = providers
    .map((p) =>
      renderAboutTeamCard(p, {
        variant: 'about',
        photoHtml: renderCareTeamPhoto(p, 88, 88),
      }),
    )
    .join('\n');
  return `<!-- SIYA:ABOUT-CARE-TEAM -->
      <section class="section" id="care-team">
        <div class="container">
          <div class="section-header">
            <h2>Meet Your Care Team</h2>
            <p class="lead">Our clinicians bring experience across primary care, ADHD, behavioral health, obesity medicine, metabolic health, women&rsquo;s health, men&rsquo;s health, and telehealth.</p>
          </div>
          <div class="about-team-grid about-care-team-grid">
${cards}
          </div>
          <p class="blog-hub-see-all"><a href="/providers">View full care team (${activeClinicianCountLabel()})</a></p>
          <p class="blog-hub-see-all about-hub-links"><a href="/telehealth">Explore Telehealth Care</a> · <a href="/pricing">View Pricing</a></p>
        </div>
      </section>
      <!-- /SIYA:ABOUT-CARE-TEAM -->`;
}

export function injectAboutCareTeam(html, relPath) {
  if (relPath !== 'about.html') return html;
  const block = buildAboutCareTeamSection();
  if (html.includes('SIYA:ABOUT-CARE-TEAM')) {
    return html.replace(/<!-- SIYA:ABOUT-CARE-TEAM -->[\s\S]*?<!-- \/SIYA:ABOUT-CARE-TEAM -->/, block);
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
  if (relPath === 'womens-health.html' && html.includes('<!-- /SIYA:LEARN-MORE-WOMENS -->')) {
    return html.replace(
      '<!-- /SIYA:LEARN-MORE-WOMENS -->',
      `<!-- /SIYA:LEARN-MORE-WOMENS -->\n\n      ${block}`,
    );
  }
  return html;
}

/** Preserve screening links — do not route educational screening CTAs to booking. */
export function injectSitewideCtas(html) {
  return html;
}

/** Inject FAQ accordion CTA blocks via conversion-system + components.mjs */
function injectFaqCtaBlocks(html, relPath) {
  if (!html.includes('faq-accordion-cta')) return html;
  if (relPath === 'adhd-care.html' || relPath === 'telehealth.html') {
    const block = renderFaqCtaInner(relPath);
    html = html.replace(/<div class="faq-accordion-cta">[\s\S]*?<\/div>\s*(?=\n\s*<\/div>\s*\n\s*(?:<script|<!-- SIYA))/m, `${block}\n`);
    return html;
  }
  return html.replace(
    /(<div class="faq-accordion-cta">[\s\S]*?)<a class="button"[^>]*>[\s\S]*?<\/a>/g,
    (match, prefix) => {
      if (relPath === 'adhd-care.html' || relPath === 'telehealth.html') return match;
      const { primary } = resolveConversion(relPath);
      const slot = primary ?? CTA_SLOTS.primary;
      return `${prefix}${renderButton({ ...slotToButton(slot, { location: 'faq-cta' }), variant: 'primary' })}`;
    },
  );
}

const THIN_ADHD_LANDERS = new Set([
  'adult-adhd-diagnosis.html',
  'adhd-treatment-online.html',
  'online-adhd-test.html',
  'creyos-adhd-testing.html',
]);

function isThinAdhdLander(relPath) {
  return THIN_ADHD_LANDERS.has(relPath) || /^adhd-diagnosis-.+\.html$/.test(relPath);
}

function buildAdhdFunnelBanner() {
  return `<!-- SIYA:ADHD-FUNNEL-BANNER -->
      <div class="adhd-funnel-banner section-tinted" role="note">
        <div class="container">
          <p><strong>Main ADHD pathway:</strong> <a href="/adhd-care">ADHD Care</a> is our main ADHD care page for evaluation, screening, and treatment planning.</p>
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
    // Pillar hubs keep Meet & Greet + Start an ADHD Evaluation (not screening/newsletter defaults).
    if (relPath !== 'blog/adhd-in-women.html' && relPath !== 'blog/executive-dysfunction-adhd.html') {
      html = html.replace(
        /<section class="section blog-final-cta">[\s\S]*?<\/section>/,
        renderBlogFinalCtaSection(relPath),
      );
    }
  }

  html = injectFaqCtaBlocks(html, relPath);

  html = html.replace(
    /<p><a href="[^"]*(?:carepatron|yourmarketingai)[^"]*"[^>]*>Book a Meet[^<]*<\/a><\/p>/gi,
    '',
  );

  if (relPath === 'index.html') {
    html = html.replace(/<div class="provider-lp-ctas provider-lp-ctas--center">[\s\S]*?<\/div>/g, '');
  }

  if (isAdhdFunnelPage(relPath) && !relPath.startsWith('blog/') && html.includes('<!-- FINAL CTA -->')) {
    // Hero / screening lead owns primary; final band is secondary.
    const screeningBtn = renderButton({
      label: COPY_STANDARDS.adhdSecondaryCta,
      href: '/adhd-screening?adhd=1',
      variant: 'secondary',
      track: 'adhd_screening_click',
      location: 'final-cta',
      pageType: 'adhd',
      intent: 'adhd',
      conversionGoal: 'screening',
      ctaSlot: 'lead-magnet',
    });
    const meetBtn = renderButton({
      ...slotToButton(CTA_SLOTS.meetGreet, { location: 'final-cta', relPath }),
      variant: 'secondary',
    });
    html = html.replace(
      /(<!-- FINAL CTA -->[\s\S]*?<div class="cta-band-buttons">)[\s\S]*?(<\/div>)/,
      `$1\n              ${screeningBtn}\n              ${meetBtn}\n            $2`,
    );
    html = html.replace(/Start Free Screening/g, COPY_STANDARDS.adhdSecondaryCta);
  }

  if (relPath === 'index.html' && html.includes('<!-- FINAL CTA -->')) {
    // Hero owns the single primary; final band reinforces as secondary.
    const chatBtn = renderButton({
      ...slotToButton(CTA_SLOTS.secureChat, { location: 'final-cta', relPath }),
      variant: 'secondary',
    });
    const meetBtn = renderButton({
      ...slotToButton(CTA_SLOTS.meetGreet, { location: 'final-cta', relPath }),
      variant: 'secondary',
    });
    html = html.replace(
      /(<!-- FINAL CTA -->[\s\S]*?<div class="cta-band-buttons">)[\s\S]*?(<\/div>)/,
      `$1\n              ${chatBtn}\n              ${meetBtn}\n            $2`,
    );
  }

  if (
    (relPath === 'telehealth.html' ||
      relPath === 'weight-loss-metabolic-health.html' ||
      relPath === 'mens-health-longevity.html') &&
    html.includes('<!-- FINAL CTA -->')
  ) {
    // Hero owns primary; final band is secondary reinforcement.
    const meetBtn = renderButton({
      ...slotToButton(CTA_SLOTS.meetGreet, { location: 'final-cta', relPath }),
      variant: 'secondary',
    });
    const chatBtn = renderButton({
      ...slotToButton(CTA_SLOTS.secureChat, { location: 'final-cta', relPath }),
      variant: 'secondary',
    });
    html = html.replace(
      /(<!-- FINAL CTA -->[\s\S]*?<div class="cta-band-buttons">)[\s\S]*?(<\/div>)/,
      `$1\n              ${meetBtn}\n              ${chatBtn}\n            $2`,
    );
  }

  if (relPath === 'book-appointment.html' && html.includes('id="book-visit"')) {
    const meetBtn = renderButton({
      ...slotToButton(CTA_SLOTS.meetGreet, { location: 'book-visit-primary', relPath }),
      variant: 'primary',
    });
    const zocdocBtn = renderButton({
      ...slotToButton(CTA_SLOTS.zocdoc, { location: 'book-visit-zocdoc', relPath }),
      variant: 'secondary',
    });
    const chatBtn = renderButton({
      ...slotToButton(CTA_SLOTS.secureChat, { location: 'book-visit-chat', relPath }),
      variant: 'secondary',
    });
    html = html.replace(
      /(<div class="booking-buttons">)[\s\S]*?(<\/div>\s*<p class="note card-note">)/,
      `$1
               <div class="booking-option booking-option--featured">
                 <h3>Start here — low-friction</h3>
                 <p class="cta-microcopy">${COPY_STANDARDS.meetGreetMicrocopy}</p>
                 ${meetBtn}
                 <p class="cta-microcopy">${COPY_STANDARDS.meetGreetDisclaimer}</p>
               </div>
               <div class="booking-option booking-option--secondary">
                 <h3>Additional booking option</h3>
                 <p class="cta-microcopy">Prefer to schedule through a partner calendar?</p>
                 ${zocdocBtn}
               </div>
               <div class="booking-option">
                 <h3>Questions before booking?</h3>
                 ${chatBtn}
               </div>
               <div class="booking-option">
                 <h3>ADHD evaluation</h3>
                 <p class="cta-microcopy">Already screened and ready for structured evaluation?</p>
                 <a class="button ds-button ds-button--secondary secondary" href="${REDIRECT_ADHD_EVALUATION_URL}" data-siya-track="adhd_evaluation_click" data-siya-location="book-visit-adhd">Start ADHD Evaluation</a>
               </div>
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

let blogRegistryCache = null;

function getBlogRegistry() {
  if (!blogRegistryCache) {
    blogRegistryCache = loadBlogRegistry(path.join(SITE_ROOT, 'blog'));
  }
  return blogRegistryCache;
}

function buildRelatedArticlesHtml(blogPath, title) {
  const slug = blogPath.replace(/^\/blog\//, '');
  const registry = getBlogRegistry();
  const entry = registry.find((e) => e.slug === slug);
  const topic = entry?.topic || topicFromBlog(slug, title);
  const related = pickRelatedArticles(slug, registry, 3);
  const landing = landingForTopic(topic);
  return renderRelatedArticlesSection({ articles: related, landing });
}

export function injectContinueReading(html, relPath, title) {
  if (!relPath.startsWith('blog/') || BLOG_HUB_FILES.has(relPath)) return html;
  const block = buildRelatedArticlesHtml(`/${relPath.replace(/\.html$/, '')}`, title);

  if (html.includes('class="related-articles"')) {
    return html.replace(/<section class="related-articles"[\s\S]*?<\/section>/, block);
  }
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

/** Google Ads / minimal landing pages — skip full nav/footer injection */
export function isRedirectTransitionPage(relPath) {
  return relPath.startsWith('redirect/');
}

/** Google Ads / minimal landing pages — skip full nav/footer injection */
export function isAdsLandingPage(relPath, html = '') {
  if (relPath === 'adhd-evaluation-texas.html' || relPath === 'adhd-evaluation-california.html') {
    return true;
  }
  return /\bclass="[^"]*siya-landing-page/.test(html) || /data-siya-landing=/.test(html);
}

/** Route legacy join CTAs to on-site Siya Circle signup */
export function normalizeSiyaCircleJoinLinks(html) {
  html = html.replaceAll(SIYA_CIRCLE_GHL_FORM_URL, SIYA_CIRCLE_SIGNUP_URL);
  html = html.replace(
    /<a(\s[^>]*?)href="\/siya-circle"([^>]*)>([^<]*(?:Join|Siya Circle|newsletter|Subscribe|Get updates)[^<]*)<\/a>/gi,
    (_m, before, after, label) => {
      const trimmed = label.trim();
      const display =
        /newsletter/i.test(trimmed) ? 'Siya Circle' : trimmed.replace(/\s*→\s*$/, '').trim();
      const arrow = label.includes('→') ? ' →' : '';
      return `<a${before}href="${SIYA_CIRCLE_SIGNUP_URL}" data-siya-track="${SIYA_CIRCLE_JOIN_TRACK}"${after}>${display}${arrow}</a>`;
    },
  );
  html = html.replace(
    /<a(\s[^>]*?)href="#siya-circle-signup"([^>]*)>([^<]+)<\/a>/gi,
    (_m, before, after, label) =>
      `<a${before}href="${SIYA_CIRCLE_SIGNUP_URL}" data-siya-track="${SIYA_CIRCLE_JOIN_TRACK}"${after}>${label}</a>`,
  );
  html = html.replace(
    new RegExp(
      `<a([^>]*?)href="${SIYA_CIRCLE_SIGNUP_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"([^>]*?)target="_blank"([^>]*)>`,
      'gi',
    ),
    '<a$1href="' + SIYA_CIRCLE_SIGNUP_URL + '"$2$3>',
  );
  html = html.replace(
    new RegExp(
      `<a([^>]*?)href="${SIYA_CIRCLE_SIGNUP_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"([^>]*?)rel="noopener noreferrer"([^>]*)>`,
      'gi',
    ),
    '<a$1href="' + SIYA_CIRCLE_SIGNUP_URL + '"$2$3>',
  );
  return html;
}

/** Siya Circle — join-click analytics (signup on GHL, all pages) */
export function injectSiyaCircleAnalytics(html) {
  if (html.includes('siya-circle-signup.js')) return html;
  html = html.replace(/<!-- SIYA:CIRCLE-SIGNUP -->[\s\S]*?<!-- \/SIYA:CIRCLE-SIGNUP -->\n?/g, '');
  html = html.replace(/<script>window\.SIYA_CIRCLE_CONFIG=[\s\S]*?<\/script>\n?/g, '');
  const block =
    '<!-- SIYA:CIRCLE-ANALYTICS -->\n<script src="/scripts/siya-circle-signup.js" defer></script>\n<!-- /SIYA:CIRCLE-ANALYTICS -->';
  if (html.includes('<!-- /SIYA:COOKIE-NOTICE -->')) {
    return html.replace('<!-- /SIYA:COOKIE-NOTICE -->', `<!-- /SIYA:COOKIE-NOTICE -->\n${block}`);
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

function encCarepatronHref(url) {
  return url.replace(/&/g, '&amp;');
}

/** Ensure walkthrough, $149 evaluation, and geo ADHD hero CTAs use canonical CarePatron i= params. */
export function normalizeCarePatronLinks(html, relPath) {
  html = html.replace(/<a\s+([^>]*?)>/gi, (match, attrs) => {
    if (!/book\.carepatron\.com/i.test(attrs)) return match;
    if (/data-cta="book-walkthrough"/i.test(attrs)) {
      return `<a ${attrs.replace(/href="[^"]*"/i, `href="${encCarepatronHref(MEET_GREET_BOOKING_URL)}"`)}>`;
    }
    if (/data-cta="start-199-evaluation"/i.test(attrs)) {
      return `<a ${attrs.replace(/href="[^"]*"/i, `href="${encCarepatronHref(ADHD_EVALUATION_199_LINK)}"`)}>`;
    }
    return match;
  });

  html = html.replace(
    /<a(\s[^>]*?)href="([^"]*book\.carepatron\.com[^"]*)"([^>]*>)([\s\S]*?)<\/a>/gi,
    (match, pre, _href, post, inner) => {
      const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (/walkthrough|15-Minute ADHD Consultation|Meet & Greet|Meet &amp; Greet/i.test(text)) {
        return `<a${pre}href="${encCarepatronHref(MEET_GREET_BOOKING_URL)}"${post}${inner}</a>`;
      }
      if (/(?:Start|start).*\$149|Already ready\?/i.test(text) && /evaluation/i.test(text)) {
        return `<a${pre}href="${encCarepatronHref(ADHD_EVALUATION_199_LINK)}"${post}${inner}</a>`;
      }
      if (/Book Free Consultation|Book Your ADHD Walkthrough|Book Free(?:\s+Evaluation)?\s+Walkthrough|Book Free Demo|Book Demo|Book Free Meet/i.test(text)) {
        return `<a${pre}href="${encCarepatronHref(MEET_GREET_BOOKING_URL)}"${post}${inner}</a>`;
      }
      return match;
    },
  );

  return html;
}

const CONSULTATION_CTA_LABEL_RE =
  /Schedule Consultation|Book Consultation|Book Appointment|Book appointment|Book Free Consultation|Book Your ADHD Walkthrough|Book Your Free 15-Minute ADHD Consultation/i;

/** Route consultation CTAs — ADHD funnel → meet & greet redirect; general pages → meet & greet (not Spruce). */
export function normalizeConsultationCtaRouting(html, relPath = '') {
  const isAdhd = isAdhdFunnelPath(relPath);
  const meetHref = REDIRECT_MEET_GREET_URL;
  html = html.replace(
    /href="([^"]*book\.carepatron\.com[^"]*i(?:=|%3D)sysv73e4[^"]*)"/gi,
    `href="${meetHref}"`,
  );
  html = html.replace(
    /<a(\s[^>]*?)href="([^"]*spruce\.care\/siyahealth[^"]*)"([^>]*>)([\s\S]*?)<\/a>/gi,
    (match, pre, _href, post, inner) => {
      const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (CONSULTATION_CTA_LABEL_RE.test(text)) {
        const attrs = `${pre}${post}`
          .replace(/\s*data-siya-track="[^"]*"/gi, '')
          .replace(/>$/, ` data-siya-track="meet_greet_click">`);
        return `<a${attrs.replace(/^(\s*)/, `$1href="${meetHref}" `)}${inner}</a>`;
      }
      return match;
    },
  );
  if (!isAdhd) {
    /* Canonicalize meet/walkthrough redirect CTAs — preserve href. */
    html = html.replace(
      /<a(\s[^>]*?)href="([^"]*redirect\/(?:adhd-walkthrough|meet-greet)[^"]*)"([^>]*>)([\s\S]*?)<\/a>/gi,
      (match, pre, _href, post, inner) => {
        const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (
          /walkthrough|consultation|appointment|schedule|meet & greet|meet &amp; greet/i.test(text) &&
          !/ADHD screening|Take Free/i.test(text)
        ) {
          const attrs = `${pre}${post}`
            .replace(/\s*data-siya-track="[^"]*"/gi, '')
            .replace(/>$/, ' data-siya-track="meet_greet_click">');
          return `<a${attrs.replace(/^(\s*)/, `$1href="${meetHref}" `)}${COPY_STANDARDS.meetGreetCta}</a>`;
        }
        return match;
      },
    );
    html = html.replace(
      /<a(\s[^>]*?)href="([^"]*book\.carepatron\.com[^"]*)"([^>]*>)([\s\S]*?)<\/a>/gi,
      (match, pre, _href, post, inner) => {
        const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (CONSULTATION_CTA_LABEL_RE.test(text) || /schedule|consultation|appointment|meet & greet/i.test(text)) {
          const attrs = `${pre}${post}`
            .replace(/\s*data-siya-track="[^"]*"/gi, '')
            .replace(/>$/, ' data-siya-track="meet_greet_click">');
          return `<a${attrs.replace(/^(\s*)/, `$1href="${meetHref}" `)}${inner}</a>`;
        }
        return match;
      },
    );
  }
  return html;
}

/** Icon + wordmark lockup in header/footer/LP chrome (OG/schema keep mark asset). */
export function normalizeBrandLogos(html) {
  const headerLockup = renderBrandLockup({ variant: 'header' });
  const footerLockup = renderBrandLockup({ variant: 'footer' });
  const lpLockup = renderBrandLockup({ variant: 'lp' });

  html = html.replace(/<a class="header-logo(?:\s+brand-lockup)?"[^>]*>[\s\S]*?<\/a>/gi, headerLockup);
  html = html.replace(/<a class="lp-header-logo(?:\s+brand-lockup)?"[^>]*>[\s\S]*?<\/a>/gi, lpLockup);
  html = html.replace(
    /<a[^>]*class="[^"]*footer-logo-link[^"]*"[^>]*>[\s\S]*?<\/a>/gi,
    footerLockup,
  );

  const legacyMarks = [
    '/assets/images/siya-health-logo.png',
    '/assets/images/siya-health-logo-pre-registered.png',
    '/assets/images/siya-health-logo-registered.png',
    BRAND_MARK_ICON,
  ];
  for (const legacy of legacyMarks) {
    const esc = legacy.replace(/\./g, '\\.');
    html = html.replace(
      new RegExp(`(class="footer-logo-img[^"]*"[^>]*\\bsrc=")${esc}(")`, 'gi'),
      `$1${BRAND_MARK_ICON}$2`,
    );
  }
  return html;
}

/** Ensure PNG favicons from the circular mark are linked in every page head. */
export function normalizeFavicons(html) {
  html = html.replace(/<link rel="icon"[^>]*href="[^"]*favicon\.svg"[^>]*>\s*/gi, '');
  if (!html.includes('favicon-32x32')) {
    if (/<meta charset="[^"]+"\s*\/?>/i.test(html)) {
      html = html.replace(/(<meta charset="[^"]+"\s*\/?>)/i, `$1\n${FAVICON_HEAD_TAGS}`);
    } else if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/(<head[^>]*>)/i, `$1\n${FAVICON_HEAD_TAGS}`);
    }
  }
  return html;
}

/** Repair Meet & Greet CTAs that lost their href during prior chrome passes. */
export function ensureMeetGreetHrefs(html) {
  const meetHref = REDIRECT_MEET_GREET_URL;
  html = html.replace(
    /<a(\s[^>]*?)>(\s*Book Free Meet(?:\s|&amp;|\s&)*Greet\s*)<\/a>/gi,
    (match, attrs, label) => {
      if (/\bhref\s*=/i.test(attrs)) return match;
      const cleaned = attrs.replace(/\s*data-siya-track="[^"]*"/gi, '');
      return `<a${cleaned} href="${meetHref}" data-siya-track="meet_greet_click">${label}</a>`;
    },
  );
  return html;
}

/** Normalize Meet & Greet / walkthrough CTA button labels and CarePatron/redirect anchors. */
export function normalizeWalkthroughCtaLabels(html, relPath = '') {
  const label = COPY_STANDARDS.walkthroughCta;
  const screeningLabel = COPY_STANDARDS.walkthroughScreeningResultCta;
  html = html.replace(
    /<a(\s[^>]*data-cta="book-walkthrough"[^>]*)>[^<]*<\/a>/gi,
    `<a$1>${screeningLabel}</a>`,
  );
  html = html.replace(
    /(<a[^>]*href="[^"]*(?:redirect\/(?:meet-greet|adhd-walkthrough)|i(?:=|%3D)(?:kkarJfxH|ftxOxenx))[^"]*"[^>]*>)\s*[^<]+\s*(<\/a>)/gi,
    (match, open, close) => {
      if (/screening-results|book-walkthrough/i.test(match)) return `${open}${screeningLabel}${close}`;
      return `${open}${label}${close}`;
    },
  );
  /* Prefer canonical meet-greet redirect sitewide. */
  html = html.replace(
    /(<a[^>]*data-siya-track="(?:meet_greet_click|click_book_walkthrough|adhd_intro_call_click|schedule-consultation-click)"[^>]*href=")\/redirect\/adhd-walkthrough(")/gi,
    `$1${REDIRECT_MEET_GREET_URL}$2`,
  );
  html = html.replace(
    /(<a[^>]*href=")\/redirect\/adhd-walkthrough("[^>]*data-siya-track="(?:meet_greet_click|click_book_walkthrough|adhd_intro_call_click|schedule-consultation-click)")/gi,
    `$1${REDIRECT_MEET_GREET_URL}$2`,
  );
  return html;
}

/** Route external booking/chat URLs through internal redirect transition pages for conversion tracking. */
export function normalizeConversionRedirectUrls(html) {
  html = html.replace(/href="https?:\/\/spruce\.care\/siyahealth[^"]*"/gi, `href="${REDIRECT_CHAT_URL}"`);
  html = html.replace(
    /href="([^"]*book\.carepatron\.com[^"]*i(?:=|%3D)(?:kkarJfxH|ftxOxenx)[^"]*)"/gi,
    `href="${REDIRECT_MEET_GREET_URL}"`,
  );
  html = html.replace(
    /href="([^"]*book\.carepatron\.com[^"]*i(?:=|%3D)bxrKBOuk[^"]*)"/gi,
    `href="${REDIRECT_ADHD_EVALUATION_URL}"`,
  );
  for (const internal of [REDIRECT_CHAT_URL, REDIRECT_MEET_GREET_URL, REDIRECT_ADHD_WALKTHROUGH_URL, REDIRECT_ADHD_EVALUATION_URL]) {
    const esc = internal.replace(/\//g, '\\/');
    html = html.replace(
      new RegExp(`(<a\\s[^>]*href="${esc}"[^>]*)\\s*target="_blank"`, 'gi'),
      '$1',
    );
    html = html.replace(
      new RegExp(`(<a\\s[^>]*href="${esc}"[^>]*)\\s*rel="noopener noreferrer"`, 'gi'),
      '$1',
    );
  }
  return html;
}

/** Route legacy primary CTA links (CarePatron/YMA) to Meet & Greet redirect. */
export function normalizeCtaUrls(html) {
  const meetGreetLabels = 'Book Free Meet & Greet|Book Free Consultation|Schedule Consultation|Talk to a Clinician|Talk to a clinician';
  html = html.replace(
    new RegExp(`<a(\\s[^>]*?)href="[^"]*(?:carepatron|yourmarketingai)[^"]*"([^>]*)>\\s*(?:${meetGreetLabels})\\s*<\\/a>`, 'gi'),
    (_m, before, after) => {
      const attrs = `${before}${after}`
        .replace(/\s*target="[^"]*"/gi, '')
        .replace(/\s*rel="[^"]*"/gi, '')
        .replace(/\s*data-siya-track="[^"]*"/gi, '');
      return `<a${attrs} href="${REDIRECT_MEET_GREET_URL}" data-siya-track="meet_greet_click">${COPY_STANDARDS.meetGreetCta}</a>`;
    },
  );
  // Keep Secure Chat CTAs on /redirect/chat (Spruce)
  const chatLabels = 'Start Secure Medical Chat|Start Secure Chat';
  html = html.replace(
    new RegExp(`<a(\\s[^>]*?)href="[^"]*(?:carepatron|yourmarketingai)[^"]*"([^>]*)>\\s*(?:${chatLabels})\\s*<\\/a>`, 'gi'),
    (_m, before, after) => {
      const attrs = `${before}${after}`
        .replace(/\s*target="[^"]*"/gi, '')
        .replace(/\s*rel="[^"]*"/gi, '')
        .replace(/\s*data-siya-track="[^"]*"/gi, '');
      return `<a${attrs} href="${REDIRECT_CHAT_URL}" data-siya-track="secure_chat_click">${COPY_STANDARDS.secureChatCta}</a>`;
    },
  );
  return html;
}

/** Remove per-page inline FAQ/header scripts superseded by shared assets. */
export function stripInlineChromeScripts(html) {
  if (html.includes('faq-accordion.js')) {
    html = html.replace(
      /<script>\s*\(function\s*\(\)\s*\{[\s\S]*?data-faq-trigger[\s\S]*?\}\)\(\);\s*<\/script>\s*/g,
      '',
    );
  }
  if (html.includes('header-scroll.js')) {
    html = html.replace(
      /<script>\s*\(function\s*\(\)\s*\{[\s\S]*?site-header-scrolled[\s\S]*?\}\)\(\);\s*<\/script>\s*/g,
      '',
    );
  }
  return html;
}

/** Shared FAQ accordion behavior (replaces per-page inline scripts). */
export function injectFaqAccordion(html) {
  if (!html.includes('faq-accordion') && !html.includes('data-faq-trigger')) return html;
  if (html.includes('faq-accordion.js')) return html;
  const block = `<!-- SIYA:FAQ-ACCORDION -->
    <script src="/scripts/faq-accordion.js" defer></script>
    <!-- /SIYA:FAQ-ACCORDION -->`;
  if (html.includes('<!-- /SIYA:HEADER-SCROLL -->')) {
    return html.replace('<!-- /SIYA:HEADER-SCROLL -->', `<!-- /SIYA:HEADER-SCROLL -->\n${block}`);
  }
  if (html.includes('<!-- /SIYA:COOKIE-NOTICE -->')) {
    return html.replace('<!-- /SIYA:COOKIE-NOTICE -->', `<!-- /SIYA:COOKIE-NOTICE -->\n${block}`);
  }
  return html.replace(/<\/body>/i, `${block}\n</body>`);
}

/** Shared transparent-header scroll + About dropdown behavior. */
export function injectHeaderScroll(html) {
  if (!html.includes('site-header-transparent') && !html.includes('id="site-header"')) return html;

  // Always ensure About dropdown script is present when the dropdown markup exists
  if (html.includes('nav-dropdown') && !html.includes('nav-dropdown.js')) {
    if (html.includes('header-scroll.js')) {
      html = html.replace(
        /(<script src="\/scripts\/header-scroll\.js"[^>]*><\/script>)/i,
        `$1\n    <script src="/scripts/nav-dropdown.js" defer></script>`,
      );
    } else {
      const block = `<!-- SIYA:HEADER-SCROLL -->
    <script src="/scripts/header-scroll.js" defer></script>
    <script src="/scripts/nav-dropdown.js" defer></script>
    <!-- /SIYA:HEADER-SCROLL -->`;
      if (html.includes('<!-- /SIYA:COOKIE-NOTICE -->')) {
        html = html.replace('<!-- /SIYA:COOKIE-NOTICE -->', `<!-- /SIYA:COOKIE-NOTICE -->\n${block}`);
      } else {
        html = html.replace(/<\/body>/i, `${block}\n</body>`);
      }
    }
    return html;
  }

  if (html.includes('header-scroll.js')) return html;
  const block = `<!-- SIYA:HEADER-SCROLL -->
    <script src="/scripts/header-scroll.js" defer></script>
    <script src="/scripts/nav-dropdown.js" defer></script>
    <!-- /SIYA:HEADER-SCROLL -->`;
  if (html.includes('<!-- /SIYA:COOKIE-NOTICE -->')) {
    return html.replace('<!-- /SIYA:COOKIE-NOTICE -->', `<!-- /SIYA:COOKIE-NOTICE -->\n${block}`);
  }
  return html.replace(/<\/body>/i, `${block}\n</body>`);
}


/** Sitewide Siya AI Concierge widget (not Messenger / LeadConnector). */
export function injectSiyaConcierge(html, relPath) {
  if (isLegalContentPage(relPath)) return html;
  if (isRedirectTransitionPage(relPath)) return html;
  if (!html || html.includes('siya-concierge.js')) return html;
  const block = `<!-- SIYA:CONCIERGE -->
    <script src="/scripts/siya-concierge.js" defer></script>
    <!-- /SIYA:CONCIERGE -->`;
  return html.replace(/<\/body>/i, `${block}\n</body>`);
}

/** Floating chat widgets paused — Messenger FAB + GHL LeadConnector only. Spruce Secure Chat CTAs stay. */
export function injectContactFab(html) {
  return stripChatWidgets(html);
}

/** Remove Messenger FAB and GHL LeadConnector widget scripts/DOM only. */
export function stripChatChannels(html) {
  return stripChatWidgets(html);
}

export function stripChatWidgets(html) {
  if (!html) return html;
  html = html.replace(/<!-- SIYA:CONTACT-FAB -->[\s\S]*?<!-- \/SIYA:CONTACT-FAB -->\s*/gi, '');
  html = html.replace(/<script[^>]*src="\/scripts\/contact-fab\.js"[^>]*><\/script>\s*/gi, '');
  html = html.replace(/<script[^>]*src="\/scripts\/deferred-chat-widget\.js"[^>]*><\/script>\s*/gi, '');
  html = html.replace(/<script[^>]*widgets\.leadconnectorhq\.com[^>]*>[\s\S]*?<\/script>\s*/gi, '');
  html = html.replace(/<script[^>]*src="https:\/\/widgets\.leadconnectorhq\.com[^"]*"[^>]*><\/script>\s*/gi, '');
  html = html.replace(/<div[^>]*id="siya-contact-fab"[^>]*>[\s\S]*?<\/div>\s*/gi, '');
  return html;
}

export function applySiteChrome(html, relPath, title = '') {
  html = injectCookieConsentBootstrap(html);
  if (isRedirectTransitionPage(relPath)) {
    html = injectCookieNotice(html, relPath);
    return injectGtmAndTracking(html, relPath);
  }
  if (isLegalContentPage(relPath)) {
    html = injectSeoFooterArchitecture(html, relPath);
    html = normalizeLegalLinks(html);
    html = normalizeConsultationCtaRouting(html, relPath);
    html = normalizeConversionRedirectUrls(html);
    html = stripChatChannels(html);
    return injectGtmAndTracking(html, relPath);
  }

  if (isAdsLandingPage(relPath, html)) {
    html = injectCookieNotice(html, relPath);
    html = injectLandingTrust(html, relPath);
    html = injectFaqAccordion(html);
    html = injectSitewideTrustMetrics(html);
    html = injectHeaderScroll(html);
    html = stripInlineChromeScripts(html);
    html = normalizeLegalLinks(html);
    html = normalizeSitewideCopy(html, relPath);
    html = normalizeConsultationCtaRouting(html, relPath);
    html = normalizeWalkthroughCtaLabels(html, relPath);
    html = normalizeConversionRedirectUrls(html);
    html = ensureMeetGreetHrefs(html);
    html = stripChatChannels(html);
    // Care team from provider-canonical + SERVICE_PROVIDER_SLUGS (not hardcoded HTML)
    html = injectMeetPhysiciansSection(html, relPath);
    html = injectSiyaConcierge(html, relPath);
    return injectGtmAndTracking(html, relPath);
  }

  html = injectNavCta(html, relPath);
  html = injectSitewideCtas(html);
  html = injectAdhdFunnelBanner(html, relPath);
  html = injectProvidersNav(html);
  html = injectMensHealthNav(html);
  html = injectLabsNav(html);
  html = injectEmployersNav(html);
  html = injectAnswersNav(html);
  html = injectSeoFooterArchitecture(html, relPath);
  html = injectLearnMoreSections(html, relPath);
  html = injectHomepageCareTeam(html, relPath);
  html = injectAboutCareTeam(html, relPath);
  html = injectAboutCompany(html, relPath);
  html = injectAboutProviderHub(html, relPath);
  html = injectMeetPhysiciansSection(html, relPath);
  html = injectContinueReading(html, relPath, title);
  html = injectProviderAttribution(html);
  html = injectSiyaCircleAnalytics(html);
  html = stripGhlLegalAcceptance(html, relPath);
  html = injectGhlLegalAcceptance(html, relPath);
  html = injectCookieNotice(html, relPath);
  html = injectHeaderScroll(html);
  html = injectFaqAccordion(html);
  html = injectSitewideTrustMetrics(html);
  html = injectHeroTrustBar(html, relPath);
  html = injectHeroPrimaryCta(html, relPath);
  html = restoreSecureChatSecondaryCtas(html, relPath);
  html = injectServiceTrust(html, relPath);
  html = stripInlineChromeScripts(html);
  html = normalizeLegalLinks(html);
  html = normalizeSitewideCopy(html, relPath);
  html = normalizeSiyaCircleJoinLinks(html);
  html = normalizeCtaUrls(html);
  html = normalizeCarePatronLinks(html, relPath);
  html = normalizeConsultationCtaRouting(html, relPath);
  html = normalizeWalkthroughCtaLabels(html, relPath);
  html = normalizeConversionRedirectUrls(html);
  html = normalizeCtaHierarchy(html, relPath);
  html = ensureMeetGreetHrefs(html);
  html = normalizeBrandLogos(html);
  html = normalizeFavicons(html);
  html = applyPricingTokens(html);
  html = stripChatChannels(html);
  html = injectSiyaConcierge(html, relPath);
  return injectGtmAndTracking(html, relPath);
}

