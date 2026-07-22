/**
 * Page composition recipes — documents how DS components assemble per page type.
 * Pass 2: generators import these recipes; Pass 3: CRO experiments swap slots.
 */

/** @typedef {'homepage'|'adhd'|'blog'|'provider'|'landing'} PageRecipeId */

/**
 * Canonical section order per page type.
 * `slot` maps to components.mjs render* functions.
 * `optional` sections may be omitted per page variant.
 */
export const PAGE_RECIPES = {
  homepage: {
    id: 'homepage',
    label: 'Homepage',
    ctaPageType: 'homepage',
    sections: [
      { slot: 'hero', component: 'renderHero', required: true, notes: 'hero-merged pattern; trust bar + dual CTAs (chat + consultation)' },
      { slot: 'trust', component: 'renderTrustSection', required: false, notes: 'trust-metrics-grid or badges' },
      { slot: 'services', component: 'renderFeatureGrid', required: true, notes: 'maps to services-grid / service-cols today' },
      { slot: 'how-it-works', component: 'renderTimeline', required: true, notes: 'process-steps-inline' },
      { slot: 'pricing', component: 'renderPricingGrid', required: false, notes: 'pricing-grid-three on homepage' },
      { slot: 'testimonials', component: 'renderTestimonial', required: false, notes: 'testimonial-cards-grid / reviews carousel' },
      { slot: 'care-team', component: 'renderProviderCard', required: true, notes: 'SIYA:CARE-TEAM injection via site-chrome' },
      { slot: 'faq', component: 'renderFaq', required: true, notes: 'faq-accordion-section' },
      { slot: 'newsletter', component: 'renderNewsletterBlock', required: false, notes: 'siya-circle-home-band optional' },
      { slot: 'final-cta', component: 'renderCtaBlock', required: true, notes: 'cta-band before footer' },
      { slot: 'footer', component: 'renderFooterReference', required: true, notes: 'site-chrome renderSeoFooterMarkup' },
    ],
    heroDefaults: {
      pageType: 'homepage',
      trustItems: ['HIPAA-compliant', 'Licensed clinicians', 'CA • TX • PA • FL'],
    },
    ctaRules: { primary: 'chat', secondary: 'consultation' },
  },

  adhd: {
    id: 'adhd',
    label: 'ADHD funnel pages',
    ctaPageType: 'adhd',
    sections: [
      { slot: 'hero', component: 'renderHero', required: true, notes: 'accent CTA = screening; secondary = chat' },
      { slot: 'stats', component: 'renderStatsSection', required: false, notes: 'trust-metrics-adhd-rewrite persuasive copy' },
      { slot: 'how-it-works', component: 'renderTimeline', required: true },
      { slot: 'pricing', component: 'renderPricingGrid', required: true, notes: '$149 eval + follow-up tiers' },
      { slot: 'testimonials', component: 'renderTestimonial', required: false },
      { slot: 'faq', component: 'renderFaq', required: true, notes: 'ADHD_FAQ_CTA from site-chrome for adhd-care' },
      { slot: 'learn-more', component: 'renderSectionHeader', required: false, notes: 'SIYA:LEARN-MORE-ADHD cluster' },
      { slot: 'final-cta', component: 'renderCtaBlock', required: true, notes: 'screening + pricing secondary on ADHD funnels' },
      { slot: 'footer', component: 'renderFooterReference', required: true },
    ],
    heroDefaults: {
      pageType: 'adhd',
      eyebrow: 'Adult ADHD evaluation',
    },
    ctaRules: { primary: 'screening', secondary: 'chat' },
    legalContext: true,
    controlledSubstanceLink: true,
  },

  blog: {
    id: 'blog',
    label: 'Blog article',
    ctaPageType: 'blog',
    sections: [
      { slot: 'article-header', component: null, required: true, notes: 'blog-post-header — not DS yet' },
      { slot: 'engagement', component: null, required: false, notes: 'blog-engagement-components.mjs asides' },
      { slot: 'mid-cta', component: 'renderCtaBlock', required: false, notes: 'currently empty via midCtaBlock()' },
      { slot: 'service-card', component: null, required: false, notes: 'blog-service-card from blog-engagement' },
      { slot: 'related-guides', component: null, required: false, notes: 'related-health-guides' },
      { slot: 'continue-reading', component: null, required: true, notes: 'site-chrome injectContinueReading' },
      { slot: 'final-cta', component: 'renderCtaBlock', required: true, notes: 'blog-final-cta / cta-band; chat primary' },
      { slot: 'newsletter', component: 'renderNewsletterBlock', required: false, notes: 'secondary CTA slot = newsletter on blog hub' },
      { slot: 'footer', component: 'renderFooterReference', required: true },
    ],
    ctaRules: { primary: 'chat', secondary: 'newsletter' },
    finalCtaDefaults: {
      title: 'Not sure where to start?',
      text: 'A brief clinician conversation can help you understand your options—no obligation.',
    },
  },

  provider: {
    id: 'provider',
    label: 'Provider profile',
    ctaPageType: 'provider',
    sections: [
      { slot: 'hero', component: 'renderHero', required: false, notes: 'provider pages use provider-hero layout today' },
      { slot: 'profile', component: 'renderProviderCard', required: true, notes: 'generate-provider-pages.mjs main column' },
      { slot: 'credentials', component: null, required: true, notes: 'provider-credential-list' },
      { slot: 'testimonials', component: 'renderTestimonial', required: false, notes: 'provider-testimonial block' },
      { slot: 'faq', component: 'renderFaq', required: false },
      { slot: 'conversion', component: 'renderCtaBlock', required: true, notes: 'SIYA:PROVIDER-CONVERSION; consultation primary' },
      { slot: 'footer', component: 'renderFooterReference', required: true },
    ],
    ctaRules: { primary: 'consultation', secondary: 'chat' },
    generator: 'scripts/generate-provider-pages.mjs',
  },

  landing: {
    id: 'landing',
    label: 'Campaign landing pages',
    ctaPageType: 'landing',
    sections: [
      { slot: 'hero', component: 'renderHero', required: true, notes: 'siya-landing-page scoped CSS' },
      { slot: 'trust-scroll', component: 'renderTrustScroll', required: true, notes: 'trust-system profile: landing / landing-adhd' },
      { slot: 'timeline', component: 'renderTimeline', required: true, notes: 'lp-process-steps' },
      { slot: 'testimonials', component: 'renderTestimonial', required: false },
      { slot: 'faq', component: 'renderFaq', required: true },
      { slot: 'final-cta', component: 'renderCtaBlock', required: true, notes: 'conversionGoal from page-conversion-config' },
      { slot: 'footer', component: 'renderFooterReference', required: false, notes: 'minimal LP footer' },
    ],
    ctaRules: { primary: 'config', secondary: 'config' },
    conversionConfig: 'data/page-conversion-config.mjs',
    notes: 'Primary CTA = conversionGoal per page (screening, chat, consultation, bookDemo)',
    wrapperClass: 'siya-landing-page',
  },
};

/**
 * @param {PageRecipeId} recipeId
 */
export function getPageRecipe(recipeId) {
  return PAGE_RECIPES[recipeId] ?? PAGE_RECIPES.homepage;
}

/**
 * List required section slots for a recipe (for QA / migration checklists).
 * @param {PageRecipeId} recipeId
 */
export function getRequiredSlots(recipeId) {
  return getPageRecipe(recipeId).sections.filter((s) => s.required).map((s) => s.slot);
}

/**
 * Map relPath → recipe id (aligns with cta-system detectPageType).
 * @param {string} relPath
 */
export function detectRecipeId(relPath) {
  if (relPath === 'index.html') return 'homepage';
  if (/^providers\//.test(relPath)) return 'provider';
  if (relPath.startsWith('blog/') || relPath.startsWith('answers/')) return 'blog';
  if (/landing|\/lp\//.test(relPath)) return 'landing';
  if (
    /^adhd-/.test(relPath) ||
    relPath === 'adult-adhd-diagnosis.html' ||
    relPath === 'creyos-adhd-testing.html' ||
    relPath === 'online-adhd-test.html'
  ) {
    return 'adhd';
  }
  return 'homepage';
}

/**
 * Integration hooks for Pass 2 — which scripts own each slot today.
 */
export const INTEGRATION_OWNERS = {
  'site-chrome.mjs': [
    'nav', 'footer', 'SIYA:CARE-TEAM', 'SIYA:LEARN-MORE-*', 'injectContinueReading',
    'blog-final-cta', 'faq-accordion-cta', 'ADHD_FAQ_CTA', 'normalizeSitewideCopy',
  ],
  'generate-provider-pages.mjs': ['provider profile HTML', 'providers/index.html'],
  'generate-pricing-page.mjs': ['pricing.html tiers'],
  'blog-engagement-components.mjs': ['blog asides', 'finalCtaBandSection (legacy)'],
  'seo-build.mjs': ['applies site-chrome to all HTML', 'copy normalization'],
};
