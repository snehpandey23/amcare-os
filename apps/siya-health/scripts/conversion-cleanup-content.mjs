/**
 * Reusable content blocks for the conversion-clarity cleanup pass.
 * Exact approved copy — injected as idempotent marked blocks by
 * scripts/apply-conversion-cleanup.mjs. Do not change layout/brand.
 */
import { renderButton } from '../design-system/components.mjs';
import { PRICING } from '../data/site-standards.mjs';

const SCREENING_URL = '/adhd-screening?adhd=1';
const CONSULT_URL = '/redirect/adhd-walkthrough';
const EVAL_URL = '/redirect/adhd-evaluation';
const CHAT_URL = '/redirect/chat';
const PRICING_URL = PRICING.path;

/** Compact pricing strip — Task 3. Marker: SIYA:PRICING-STRIP */
export function renderPricingStrip(relPath = '') {
  const viewPricing = renderButton({
    label: 'View Pricing',
    href: PRICING_URL,
    variant: 'secondary',
    track: 'view-pricing-click',
    location: 'pricing-strip',
    relPath,
  });
  return `<!-- SIYA:PRICING-STRIP -->
      <section class="section pricing-strip" aria-labelledby="pricing-strip-heading">
        <div class="container">
          <div class="pricing-strip-inner">
            <div class="pricing-strip-copy">
              <h2 id="pricing-strip-heading" class="pricing-strip-title">Transparent pricing</h2>
              <ul class="pricing-strip-list">
                <li><strong>Initial evaluation:</strong> ${PRICING.initialEvaluation.display}</li>
                <li><strong>Non-controlled medication follow-up:</strong> ${PRICING.nonControlledFollowUp.display}/month</li>
                <li><strong>Controlled medication follow-up:</strong> ${PRICING.controlledFollowUp.display}/month when clinically appropriate</li>
              </ul>
              <p class="pricing-strip-note">Medication costs are separate. Availability may vary by state. Start a secure medical chat to confirm eligibility.</p>
            </div>
            <div class="pricing-strip-cta">
              ${viewPricing}
            </div>
          </div>
        </div>
      </section>
      <!-- /SIYA:PRICING-STRIP -->`;
}

/** ADHD screening disclaimer — Task 4. Marker: SIYA:ADHD-SCREENING-DISCLAIMER */
export function renderAdhdScreeningDisclaimer() {
  return `<!-- SIYA:ADHD-SCREENING-DISCLAIMER -->
              <p class="adhd-screening-disclaimer" role="note">This screening is not a diagnosis. It is designed to help you decide whether a full ADHD evaluation may be appropriate.</p>
              <!-- /SIYA:ADHD-SCREENING-DISCLAIMER -->`;
}

/** "What happens next?" ADHD journey — Task 5 (+ disclaimer). Marker: SIYA:ADHD-NEXT-STEPS */
export function renderAdhdNextSteps(relPath = '') {
  const screeningBtn = renderButton({
    label: 'Take Free ADHD Screening',
    href: SCREENING_URL,
    variant: 'primary',
    track: 'screening-cta-click',
    location: 'adhd-what-next',
    relPath,
  });
  const consultBtn = renderButton({
    label: 'Book Free ADHD Consultation',
    href: CONSULT_URL,
    variant: 'secondary',
    track: 'click_book_walkthrough',
    location: 'adhd-what-next',
    relPath,
  });
  return `<!-- SIYA:ADHD-NEXT-STEPS -->
      <section class="section adhd-next-steps" aria-labelledby="adhd-next-steps-heading">
        <div class="container">
          <h2 id="adhd-next-steps-heading">What happens next</h2>
          <p class="adhd-screening-disclaimer" role="note">This screening is not a diagnosis. It is designed to help you decide whether a full ADHD evaluation may be appropriate.</p>
          <ol class="adhd-next-steps-list">
            <li>Take the free 2-minute ADHD screening.</li>
            <li>Review whether your symptoms may suggest ADHD.</li>
            <li>Book a free consultation if you have questions.</li>
            <li>Start your structured ${PRICING.initialEvaluation.display} ADHD evaluation.</li>
            <li>Meet with a licensed provider online.</li>
          </ol>
          <div class="adhd-next-steps-cta cta-band-buttons">
            ${screeningBtn}
            ${consultBtn}
          </div>
        </div>
      </section>
      <!-- /SIYA:ADHD-NEXT-STEPS -->`;
}

/** ADHD blog CTA block — Task 6. Marker: SIYA:BLOG-CTA-ADHD */
export function renderBlogCtaAdhd(relPath = '') {
  const screeningBtn = renderButton({
    label: 'Take Free ADHD Screening',
    href: SCREENING_URL,
    variant: 'primary',
    track: 'screening-cta-click',
    location: 'blog-cta-adhd',
    relPath,
  });
  return `<!-- SIYA:BLOG-CTA-ADHD -->
            <aside class="blog-inline-cta blog-inline-cta--adhd" aria-labelledby="blog-cta-adhd-heading">
              <p id="blog-cta-adhd-heading" class="blog-inline-cta-title">Wondering if ADHD may explain your symptoms?</p>
              <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</p>
              <div class="blog-inline-cta-actions">
                ${screeningBtn}
              </div>
              <p class="blog-inline-cta-links">Learn more: <a href="/adhd-care">ADHD evaluation &amp; care</a> &middot; <a href="/adhd-screening">Free ADHD screening</a></p>
            </aside>
            <!-- /SIYA:BLOG-CTA-ADHD -->`;
}

/** Metabolic / weight / hormone / fatigue blog CTA block — Task 6. Marker: SIYA:BLOG-CTA-METABOLIC */
export function renderBlogCtaMetabolic(relPath = '', { serviceHref = '/weight-loss-metabolic-health', serviceLabel = 'Medical weight loss & metabolic health' } = {}) {
  const chatBtn = renderButton({
    label: 'Start Secure Medical Chat',
    href: CHAT_URL,
    variant: 'primary',
    track: 'primary-cta-click',
    location: 'blog-cta-metabolic',
    relPath,
  });
  return `<!-- SIYA:BLOG-CTA-METABOLIC -->
            <aside class="blog-inline-cta blog-inline-cta--metabolic" aria-labelledby="blog-cta-metabolic-heading">
              <p id="blog-cta-metabolic-heading" class="blog-inline-cta-title">Feeling stuck with weight, energy, or metabolic health?</p>
              <p>Start a secure medical chat with Siya Health to understand what care options may be appropriate for you.</p>
              <div class="blog-inline-cta-actions">
                ${chatBtn}
              </div>
              <p class="blog-inline-cta-links">Learn more: <a href="${serviceHref}">${serviceLabel}</a> &middot; <a href="/pricing">View pricing</a></p>
            </aside>
            <!-- /SIYA:BLOG-CTA-METABOLIC -->`;
}

export const CLEANUP_MARKERS = [
  'SIYA:PRICING-STRIP',
  'SIYA:ADHD-SCREENING-DISCLAIMER',
  'SIYA:ADHD-NEXT-STEPS',
  'SIYA:BLOG-CTA-ADHD',
  'SIYA:BLOG-CTA-METABOLIC',
];
