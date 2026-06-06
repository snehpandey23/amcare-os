/**
 * Siya Circle™ Phase 0 — newsletter & topic-demand learning (non-PHI).
 * GHL list/tag integration: set ghlFormId or ghlWebhookUrl when ops configures.
 */

export const SIYA_CIRCLE_LIST_TAG = 'Siya Circle';

/** @type {null | string} TODO: Create dedicated GHL newsletter form; map fields + tags in admin */
export const SIYA_CIRCLE_GHL_FORM_ID = null;

/** @type {null | string} TODO: Optional GHL inbound webhook URL for contact create + tags */
export const SIYA_CIRCLE_GHL_WEBHOOK_URL = null;

export const SIYA_CIRCLE_TOPICS = [
  {
    id: 'focus',
    label: 'Focus & ADHD',
    analyticsEvent: 'siya_circle_topic_focus',
    ghlTag: 'Topic: Focus & ADHD',
  },
  {
    id: 'energy',
    label: 'Energy & fatigue',
    analyticsEvent: 'siya_circle_topic_energy',
    ghlTag: 'Topic: Energy & fatigue',
  },
  {
    id: 'weight',
    label: 'Weight & metabolism',
    analyticsEvent: 'siya_circle_topic_weight',
    ghlTag: 'Topic: Weight & metabolism',
  },
  {
    id: 'mood',
    label: 'Mood & stress',
    analyticsEvent: 'siya_circle_topic_mood',
    ghlTag: 'Topic: Mood & stress',
  },
  {
    id: 'hormones',
    label: "Men's health & hormones",
    analyticsEvent: 'siya_circle_topic_hormones',
    ghlTag: "Topic: Men's health & hormones",
  },
  {
    id: 'primary_care',
    label: 'Primary care & sick visits',
    analyticsEvent: 'siya_circle_topic_primary_care',
    ghlTag: 'Topic: Primary care & sick visits',
  },
];

export const SIYA_CIRCLE_RECOMMENDED_GUIDES = [
  { href: '/answers/signs-of-adult-adhd', label: 'Signs of adult ADHD' },
  { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Why am I tired after sleeping?' },
  { href: '/answers/what-is-food-noise', label: 'What is food noise?' },
  { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
  { href: '/answers/what-does-low-testosterone-feel-like', label: 'What does low testosterone feel like?' },
];

export function buildSiyaCircleClientConfig() {
  return {
    listTag: SIYA_CIRCLE_LIST_TAG,
    ghlFormId: SIYA_CIRCLE_GHL_FORM_ID,
    ghlWebhookUrl: SIYA_CIRCLE_GHL_WEBHOOK_URL,
    ghlFormBase: 'https://link.yourmarketingai.com/widget/form/',
    topics: SIYA_CIRCLE_TOPICS.map(({ id, label, analyticsEvent, ghlTag }) => ({
      id,
      label,
      analyticsEvent,
      ghlTag,
    })),
    integrationReady: Boolean(SIYA_CIRCLE_GHL_FORM_ID || SIYA_CIRCLE_GHL_WEBHOOK_URL),
  };
}

/** Compact promo band for hub pages */
export const SIYA_CIRCLE_PROMO_HTML = `          <aside class="siya-circle-promo" aria-labelledby="siya-circle-promo-heading">
            <div class="siya-circle-promo-inner">
              <h2 id="siya-circle-promo-heading">Join Siya Circle™</h2>
              <p>Free clinician-informed health explainers—tell us what topics matter to you. General education only; not medical advice.</p>
              <a class="button" href="/siya-circle">Join free →</a>
            </div>
          </aside>`;
