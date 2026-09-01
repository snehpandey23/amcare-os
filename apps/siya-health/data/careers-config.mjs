/**
 * Provider careers / join-our-team inquiry — first-party form + API.
 */
export const CAREERS_INQUIRY_API_PATH = '/api/provider-careers-inquiry';

export const CAREERS_INQUIRY_TRACK = 'provider_careers_inquiry_click';
export const CAREERS_INQUIRY_SUBMIT_EVENT = 'provider_careers_inquiry_submit';
export const CAREERS_PAGE_VIEW_EVENT = 'provider_careers_page_view';

export function careersInquiryButtonHtml({
  location = 'hero',
  variant = 'primary',
  label = 'Express interest',
} = {}) {
  const btnClass =
    variant === 'primary' ? 'ds-button--primary' : 'ds-button--secondary secondary';
  return `<a class="button ds-button ${btnClass}" href="#careers-inquiry-form" data-siya-track="${CAREERS_INQUIRY_TRACK}" data-siya-location="${location}" data-page-type="careers" data-intent="careers" data-conversion-goal="careers" data-cta-slot="careers" data-component="button">${label}</a>`;
}

export function careersInquiryFormHtml() {
  return `<form id="careers-inquiry-form" class="employer-inquiry-form careers-inquiry-form" novalidate>
              <div class="employer-inquiry-grid">
                <label class="employer-inquiry-field">
                  <span>Full name <strong aria-hidden="true">*</strong></span>
                  <input type="text" name="fullName" autocomplete="name" required maxlength="120" />
                </label>
                <label class="employer-inquiry-field">
                  <span>Email <strong aria-hidden="true">*</strong></span>
                  <input type="email" name="email" autocomplete="email" inputmode="email" required maxlength="254" />
                </label>
                <label class="employer-inquiry-field">
                  <span>Phone <span class="employer-inquiry-optional">(optional)</span></span>
                  <input type="tel" name="phone" autocomplete="tel" maxlength="40" />
                </label>
                <label class="employer-inquiry-field">
                  <span>Credential / role <strong aria-hidden="true">*</strong></span>
                  <select name="credential" required>
                    <option value="">Select…</option>
                    <option value="physician">Physician (MD/DO)</option>
                    <option value="np">Nurse Practitioner</option>
                    <option value="pa">Physician Assistant</option>
                    <option value="other">Other clinical role</option>
                  </select>
                </label>
                <label class="employer-inquiry-field employer-inquiry-field--full">
                  <span>Licensed states <span class="employer-inquiry-optional">(optional)</span></span>
                  <input type="text" name="licensedStates" maxlength="120" placeholder="e.g. CA, TX, PA" />
                </label>
              </div>
              <label class="employer-inquiry-field employer-inquiry-field--full">
                <span>Tell us about your interest</span>
                <textarea name="message" rows="4" maxlength="4000" placeholder="Specialty, telehealth experience, timing, or questions about joining Siya."></textarea>
              </label>
              <label class="ghl-legal-gate__check employer-inquiry-consent">
                <input type="checkbox" name="consent" value="on" required />
                <span>I agree to be contacted about provider opportunities at Siya Health. This is not a patient booking request.</span>
              </label>
              <div class="employer-inquiry-honeypot" aria-hidden="true">
                <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
              </div>
              <p class="ghl-legal-gate__error" id="careers-inquiry-error" hidden role="alert"></p>
              <p class="employer-inquiry-success" id="careers-inquiry-success" hidden role="status">
                Thank you — we received your interest. Our clinical leadership team will follow up by email.
              </p>
              <div class="ghl-legal-gate__actions">
                <button type="submit" class="button ds-button ds-button--primary" data-siya-track="${CAREERS_INQUIRY_SUBMIT_EVENT}" data-siya-location="form" data-page-type="careers" data-intent="careers" data-conversion-goal="careers" data-cta-slot="careers" data-component="button">Submit</button>
              </div>
            </form>`;
}
