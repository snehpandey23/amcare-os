/**
 * Siya Circle — first-party newsletter signup (Postgres + Resend via auth API).
 */

export const SIYA_CIRCLE_LIST_TAG = 'Siya Circle';

export const SIYA_CIRCLE_PAGE_PATH = '/siya-circle';
export const SIYA_CIRCLE_SIGNUP_HASH = '#siya-circle-signup';
export const SIYA_CIRCLE_SIGNUP_URL = `${SIYA_CIRCLE_PAGE_PATH}${SIYA_CIRCLE_SIGNUP_HASH}`;

export const SIYA_CIRCLE_API_PATH = '/api/siya-circle-signup';

export const SIYA_CIRCLE_JOIN_TRACK = 'siya_circle_join_click';
export const SIYA_CIRCLE_SUBMIT_EVENT = 'siya_circle_signup_submit';
export const SIYA_CIRCLE_PAGE_VIEW_EVENT = 'siya_circle_signup_view';

/** @deprecated GHL sunset — use SIYA_CIRCLE_SIGNUP_URL */
export const SIYA_CIRCLE_GHL_FORM_URL =
  'https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl';

export const SIYA_CIRCLE_GHL_FORM_ID = 'HmvqrDVq3tq3qv6rkCjl';

export const SIYA_CIRCLE_JOIN_LINK_ATTRS = `href="${SIYA_CIRCLE_SIGNUP_URL}" data-siya-track="${SIYA_CIRCLE_JOIN_TRACK}"`;

export const SIYA_CIRCLE_TOPICS = [
  { id: 'focus', label: 'Focus & ADHD' },
  { id: 'energy', label: 'Energy & fatigue' },
  { id: 'weight', label: 'Weight & metabolism' },
  { id: 'mood', label: 'Mood & stress' },
  { id: 'hormones', label: "Men's health & hormones" },
  { id: 'primary_care', label: 'Primary care & sick visits' },
];

export const SIYA_CIRCLE_RECOMMENDED_GUIDES = [
  { href: '/answers/signs-of-adult-adhd', label: 'Signs of adult ADHD' },
  { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Why am I tired after sleeping?' },
  { href: '/answers/what-is-food-noise', label: 'What is food noise?' },
  { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
  { href: '/answers/what-does-low-testosterone-feel-like', label: 'What does low testosterone feel like?' },
];

function topicCheckboxes() {
  return SIYA_CIRCLE_TOPICS.map(
    (t) =>
      `<label class="employer-state-option"><input type="checkbox" name="topic" value="${t.id}" /> <span>${t.label}</span></label>`,
  ).join('\n                    ');
}

export function siyaCircleSignupFormHtml() {
  return `<form id="siya-circle-signup-form" class="employer-inquiry-form siya-circle-signup-form" novalidate>
              <div class="employer-inquiry-grid">
                <label class="employer-inquiry-field">
                  <span>First name <strong aria-hidden="true">*</strong></span>
                  <input type="text" name="firstName" autocomplete="given-name" required maxlength="80" />
                </label>
                <label class="employer-inquiry-field">
                  <span>Email <strong aria-hidden="true">*</strong></span>
                  <input type="email" name="email" autocomplete="email" inputmode="email" required maxlength="254" />
                </label>
              </div>
              <fieldset class="employer-inquiry-field employer-inquiry-states">
                <legend>Topics you care about <span class="employer-inquiry-optional">(optional)</span></legend>
                <div class="employer-states-grid siya-circle-topics-grid">
                    ${topicCheckboxes()}
                </div>
              </fieldset>
              <label class="ghl-legal-gate__check employer-inquiry-consent">
                <input type="checkbox" name="consent" value="on" required />
                <span>I agree to receive Siya Circle educational emails. This is general education only—not medical advice, diagnosis, or treatment.</span>
              </label>
              <div class="employer-inquiry-honeypot" aria-hidden="true">
                <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
              </div>
              <p class="ghl-legal-gate__error" id="siya-circle-signup-error" hidden role="alert"></p>
              <p class="employer-inquiry-success" id="siya-circle-signup-success" hidden role="status">
                You&rsquo;re in — thank you for joining Siya Circle. Check your inbox for a confirmation from our team.
              </p>
              <div class="ghl-legal-gate__actions">
                <button type="submit" class="button ds-button ds-button--primary" data-siya-track="${SIYA_CIRCLE_SUBMIT_EVENT}" data-siya-location="form" data-page-type="newsletter" data-intent="newsletter" data-conversion-goal="newsletter" data-cta-slot="newsletter" data-component="button">Join Siya Circle</button>
              </div>
              <p class="siya-circle-compliance">For personal medical concerns, <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a>. Emergency: call 911.</p>
            </form>`;
}

/** Signup block for /siya-circle */
export function buildSiyaCircleSignupCtaHtml() {
  return `            <div class="siya-circle-signup-cta">
              <h2 id="signup-heading">Join Siya Circle</h2>
              <p class="lead">Get practical health insights from Siya Health on focus, energy, weight, metabolic health, hormones, and everyday care.</p>
              <p class="siya-circle-compliance">Siya Circle is for general education only. It does not provide diagnosis, treatment, medication advice, emergency care, or a provider-patient relationship. For personal medical concerns, <a href="/redirect/meet-greet" rel="noopener" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a> with a licensed clinician. For emergencies, call 911.</p>
              ${siyaCircleSignupFormHtml()}
            </div>`;
}

/** Compact promo band for hub pages */
export const SIYA_CIRCLE_PROMO_HTML = `          <aside class="siya-circle-promo" aria-labelledby="siya-circle-promo-heading">
            <div class="siya-circle-promo-inner">
              <h2 id="siya-circle-promo-heading">Join Siya Circle</h2>
              <p>Weekly evidence-based health insights from Siya Health physicians. General education only; not medical advice.</p>
              <a class="button" ${SIYA_CIRCLE_JOIN_LINK_ATTRS}>Join Siya Circle</a>
            </div>
          </aside>`;
