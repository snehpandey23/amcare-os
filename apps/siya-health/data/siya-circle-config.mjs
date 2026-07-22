/**
 * Siya Circle — newsletter signup routes to GHL (no on-site email capture).
 */

export const SIYA_CIRCLE_LIST_TAG = 'Siya Circle';

/** Direct GHL widget form URL (all join CTAs) */
export const SIYA_CIRCLE_GHL_FORM_URL =
  'https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl';

export const SIYA_CIRCLE_GHL_FORM_ID = 'HmvqrDVq3tq3qv6rkCjl';

export const SIYA_CIRCLE_JOIN_TRACK = 'siya-circle-join-click';

export const SIYA_CIRCLE_JOIN_LINK_ATTRS = `href="${SIYA_CIRCLE_GHL_FORM_URL}" target="_blank" rel="noopener noreferrer" data-siya-track="${SIYA_CIRCLE_JOIN_TRACK}"`;

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

/** Signup CTA block for /siya-circle (no on-site form fields) */
export function buildSiyaCircleSignupCtaHtml() {
  return `            <div class="siya-circle-signup-cta">
              <h2 id="signup-heading">Join Siya Circle</h2>
              <p class="lead">Get practical health insights from Siya Health on focus, energy, weight, metabolic health, hormones, and everyday care.</p>
              <p class="siya-circle-compliance">Siya Circle is for general education only. It does not provide diagnosis, treatment, medication advice, emergency care, or a provider-patient relationship. For personal medical concerns, <a href="/redirect/chat" rel="noopener">schedule a visit</a> with a licensed clinician. For emergencies, call 911.</p>
              <a class="button" ${SIYA_CIRCLE_JOIN_LINK_ATTRS}>Join Our Health Guide</a>
              <p class="siya-circle-ghl-note">You&rsquo;ll be taken to our secure signup form.</p>
            </div>`;
}

/** Compact promo band for hub pages */
export const SIYA_CIRCLE_PROMO_HTML = `          <aside class="siya-circle-promo" aria-labelledby="siya-circle-promo-heading">
            <div class="siya-circle-promo-inner">
              <h2 id="siya-circle-promo-heading">Join Siya Circle</h2>
              <p>Weekly evidence-based health insights from Siya Health physicians. General education only; not medical advice.</p>
              <a class="button" ${SIYA_CIRCLE_JOIN_LINK_ATTRS}>Join Our Health Guide</a>
            </div>
          </aside>`;
