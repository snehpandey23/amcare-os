/**
 * Employer / B2B partnership inquiry — first-party form + API.
 */
export const EMPLOYER_INQUIRY_API_PATH = '/api/employer-inquiry';

/** data-siya-track + GA4 event names (distinct from meet_greet_click) */
export const EMPLOYER_INQUIRY_TRACK = 'employer_inquiry_click';
export const EMPLOYER_INQUIRY_SUBMIT_EVENT = 'employer_inquiry_submit';
export const EMPLOYER_PAGE_VIEW_EVENT = 'employer_page_view';

export function employerInquiryButtonHtml({
  location = 'hero',
  variant = 'primary',
  label = 'Request employer information',
} = {}) {
  const btnClass =
    variant === 'primary' ? 'ds-button--primary' : 'ds-button--secondary secondary';
  return `<a class="button ds-button ${btnClass}" href="#employer-inquiry-form" data-siya-track="${EMPLOYER_INQUIRY_TRACK}" data-siya-location="${location}" data-page-type="employer" data-intent="employer" data-conversion-goal="bookDemo" data-cta-slot="bookDemo" data-component="button">${label}</a>`;
}

export function employerInquiryFormHtml() {
  return `<form id="employer-inquiry-form" class="employer-inquiry-form ghl-legal-gate__form" novalidate>
              <div class="employer-inquiry-grid">
                <label class="employer-inquiry-field">
                  <span>Company name <strong aria-hidden="true">*</strong></span>
                  <input type="text" name="companyName" autocomplete="organization" required maxlength="200" />
                </label>
                <label class="employer-inquiry-field">
                  <span>Your name <strong aria-hidden="true">*</strong></span>
                  <input type="text" name="contactName" autocomplete="name" required maxlength="120" />
                </label>
                <label class="employer-inquiry-field">
                  <span>Work email <strong aria-hidden="true">*</strong></span>
                  <input type="email" name="email" autocomplete="email" inputmode="email" required maxlength="254" />
                </label>
                <label class="employer-inquiry-field">
                  <span>Phone <span class="employer-inquiry-optional">(optional)</span></span>
                  <input type="tel" name="phone" autocomplete="tel" maxlength="40" />
                </label>
                <label class="employer-inquiry-field">
                  <span>Approx. employees</span>
                  <select name="employeeCount">
                    <option value="">Select…</option>
                    <option value="under-100">Under 100</option>
                    <option value="100-500">100–500</option>
                    <option value="500-2000">500–2,000</option>
                    <option value="2000-plus">2,000+</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </label>
                <fieldset class="employer-inquiry-field employer-inquiry-states">
                  <legend>States of interest</legend>
                  <div class="employer-states-grid">
                    <label class="employer-state-option"><input type="checkbox" name="state" value="CA" /> <span>California</span></label>
                    <label class="employer-state-option"><input type="checkbox" name="state" value="TX" /> <span>Texas</span></label>
                    <label class="employer-state-option"><input type="checkbox" name="state" value="PA" /> <span>Pennsylvania</span></label>
                    <label class="employer-state-option"><input type="checkbox" name="state" value="FL" /> <span>Florida</span></label>
                    <label class="employer-state-option employer-state-option--wide"><input type="checkbox" name="state" value="other" /> <span>Other / multi-state</span></label>
                  </div>
                </fieldset>
              </div>
              <label class="employer-inquiry-field employer-inquiry-field--full">
                <span>What are you hoping to explore?</span>
                <textarea name="message" rows="4" maxlength="4000" placeholder="Team size, screening goals, timeline, or questions for our partnerships team."></textarea>
              </label>
              <label class="ghl-legal-gate__check employer-inquiry-consent">
                <input type="checkbox" name="consent" value="on" required />
                <span>I agree to be contacted at the email above about employer partnership options. This is not a patient booking request.</span>
              </label>
              <div class="employer-inquiry-honeypot" aria-hidden="true">
                <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
              </div>
              <p class="ghl-legal-gate__error" id="employer-inquiry-error" hidden role="alert"></p>
              <p class="employer-inquiry-success" id="employer-inquiry-success" hidden role="status">
                Thank you — we received your inquiry. Our partnerships team will follow up by email. For individual clinical care, use <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a>.
              </p>
              <div class="ghl-legal-gate__actions">
                <button type="submit" class="button ds-button ds-button--primary" data-siya-track="${EMPLOYER_INQUIRY_SUBMIT_EVENT}" data-siya-location="form" data-page-type="employer" data-intent="employer" data-conversion-goal="bookDemo" data-cta-slot="bookDemo" data-component="button">Submit inquiry</button>
              </div>
              <p class="siya-circle-compliance">Business contact only — not for medical advice or emergency care. Emergency: call 911.</p>
            </form>`;
}
