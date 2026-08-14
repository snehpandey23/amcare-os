/**
 * Siya Circle — newsletter signup via CarePatron form (button + optional inline embed).
 */

export const SIYA_CIRCLE_LIST_TAG = 'Siya Circle';

/** CarePatron form — all join CTAs and /siya-circle embed */
export const SIYA_CIRCLE_FORM_URL =
  'https://form.carepatron.com/Forms/XRMFIPAWuXhTlncGx';

/** @deprecated use SIYA_CIRCLE_FORM_URL — kept for older imports */
export const SIYA_CIRCLE_GHL_FORM_URL = SIYA_CIRCLE_FORM_URL;

export const SIYA_CIRCLE_FORM_ID = 'XRMFIPAWuXhTlncGx';

/** @deprecated use SIYA_CIRCLE_FORM_ID */
export const SIYA_CIRCLE_GHL_FORM_ID = SIYA_CIRCLE_FORM_ID;

export const SIYA_CIRCLE_JOIN_TRACK = 'siya-circle-join-click';

/**
 * Soft capture on /adhd-screening-results (v1).
 * Destination is this CarePatron form (current Siya Circle), not a parallel list.
 * Segmentation: CarePatron form has no in-repo custom fields for source/outcome/score.
 * v1 attaches UTMs + siya_* query params on handoff; full consent record (email,
 * consented_at, exact opt_in_copy) is stored client-side in localStorage key
 * `siya_email_consent_log`. Add CarePatron/CRM custom fields before nurture by outcome.
 */
export const SIYA_CIRCLE_SOFT_CAPTURE = {
  source: 'adhd-screening-results-soft-capture',
  optInCopy:
    'Yes, send me occasional ADHD care info and updates from Siya Health. I can unsubscribe anytime.',
  dwellMs: 45000,
  aaHoldoutPct: 0.5,
};

export const SIYA_CIRCLE_JOIN_LINK_ATTRS = `href="${SIYA_CIRCLE_FORM_URL}" target="_blank" rel="noopener noreferrer" data-siya-track="${SIYA_CIRCLE_JOIN_TRACK}"`;

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

/** Signup block for /siya-circle — button + inline CarePatron form */
export function buildSiyaCircleSignupCtaHtml() {
  return `            <div class="siya-circle-signup-cta">
              <h2 id="signup-heading">Join Siya Circle</h2>
              <p class="lead">Get practical health insights from Siya Health on focus, energy, weight, metabolic health, hormones, and everyday care.</p>
              <p class="siya-circle-compliance">Siya Circle is for general education only. It does not provide diagnosis, treatment, medication advice, emergency care, or a provider-patient relationship. For personal medical concerns, <a href="/redirect/chat" rel="noopener">schedule a visit</a> with a licensed clinician. For emergencies, call 911.</p>
              <a class="button" ${SIYA_CIRCLE_JOIN_LINK_ATTRS}>Join Our Health Guide</a>
              <p class="siya-circle-ghl-note">Prefer the form here? Join below—or open it in a new tab with the button above.</p>
              <div class="siya-circle-ghl-embed">
                <iframe
                  title="Join Siya Circle"
                  src="${SIYA_CIRCLE_FORM_URL}"
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
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
