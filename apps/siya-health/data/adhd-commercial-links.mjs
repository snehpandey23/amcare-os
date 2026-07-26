/**
 * ADHD commercial landing pages — hub contextual linking registry.
 * Consumed by apply-adhd-hub-linking.mjs and generate-answer-pages.mjs.
 *
 * Paths listed here are intentional internal-link targets (ad/SEO shadow pages).
 * phase7-link-remediation.mjs preserves hrefs to these paths.
 */

/** @typedef {{ href: string, label: string, blurb?: string }} CommercialLink */

/** Screening & evaluation entry points */
export const ADHD_SCREENING_LINKS = [
  {
    href: '/online-adhd-test',
    label: 'Free online ADHD test',
    blurb: 'Two-minute ASRS-style screening—not a diagnosis, but a structured starting point.',
  },
  {
    href: '/adult-adhd-screening-california',
    label: 'California ADHD screening',
    blurb: 'State-specific screening page for adults in California exploring virtual evaluation.',
  },
];

/** Core commercial service pages */
export const ADHD_SERVICE_LINKS = [
  {
    href: '/adult-adhd-diagnosis',
    label: 'Adult ADHD diagnosis online',
    blurb: 'Structured $149 telehealth evaluation with licensed clinicians.',
  },
  {
    href: '/adhd-treatment-online',
    label: 'ADHD treatment online',
    blurb: 'Medication management and follow-up after a formal evaluation.',
  },
  {
    href: '/adhd-evaluation-cost',
    label: 'ADHD evaluation cost',
    blurb: 'Transparent $149 flat-fee pricing—no insurance surprise bills.',
  },
];

/** State & metro geo landing pages */
export const ADHD_GEO_LINKS = [
  { href: '/adhd-diagnosis-texas', label: 'Texas ADHD diagnosis', region: 'TX' },
  { href: '/adhd-diagnosis-florida', label: 'Florida ADHD diagnosis', region: 'FL' },
  { href: '/adhd-diagnosis-pennsylvania', label: 'Pennsylvania ADHD diagnosis', region: 'PA' },
  { href: '/adhd-diagnosis-austin', label: 'Austin ADHD diagnosis', region: 'TX', metro: true },
  { href: '/adhd-diagnosis-houston', label: 'Houston ADHD diagnosis', region: 'TX', metro: true },
  { href: '/adhd-diagnosis-philadelphia', label: 'Philadelphia ADHD diagnosis', region: 'PA', metro: true },
];

/** All commercial LP paths — used by phase7 skip list */
export const ADHD_COMMERCIAL_PATHS = new Set([
  ...ADHD_SCREENING_LINKS.map((l) => l.href),
  ...ADHD_SERVICE_LINKS.map((l) => l.href),
  ...ADHD_GEO_LINKS.map((l) => l.href),
]);

function link(href, label) {
  return `<a href="${href}">${label}</a>`;
}

/** ADHD care pathways on /adhd-care — assembly-capped. */
export function renderAdhdCarePathwaysSection() {
  return `<!-- SIYA:ADHD-CARE-PATHWAYS -->
      <section class="section section-tinted adhd-care-pathways" id="adhd-care-pathways" aria-labelledby="adhd-care-pathways-heading" data-assembly="care-pathways">
        <div class="container">
          <div class="section-header">
            <h2 id="adhd-care-pathways-heading">Ready to take the next step?</h2>
            <p class="lead">Start with ${link('/adhd-screening', 'free ADHD screening')}, then review ${link('/pricing', 'evaluation pricing')} when you are ready for clinical care.</p>
          </div>
          <div style="max-width:640px;margin:0 auto;text-align:center;">
            <p><a class="button ds-button ds-button--primary" href="/adhd-care#how-it-works" data-siya-track="primary-cta-click" data-siya-location="adhd-care-pathways">See how ADHD care works →</a></p>
            <p class="answers-next-step-availability">Available in California, Texas, Pennsylvania, and Florida.</p>
          </div>
        </div>
      </section>
      <!-- /SIYA:ADHD-CARE-PATHWAYS -->`;
}

/** Contextual block for /blog/adhd hub — assembly-capped (≤3 contextual + 1 button). */
export function renderBlogAdhdCarePathwaysSection() {
  return `<!-- SIYA:ADHD-BLOG-CARE-PATHWAYS -->
          <section class="blog-hub-section adhd-blog-care-pathways" id="care-pathways" aria-labelledby="adhd-blog-care-pathways-heading" data-assembly="care-pathways">
            <h2 id="adhd-blog-care-pathways-heading">From articles to clinical care</h2>
            <p class="lead" style="max-width:720px;">Articles explain symptoms and legitimacy—clinical pages help you act. Start with ${link('/adhd-screening', 'free ADHD screening')}, then review ${link('/adhd-care', 'ADHD evaluation &amp; care')} when you are ready.</p>
            <p style="max-width:720px;"><a class="button ds-button ds-button--primary" href="/adhd-care" data-siya-track="primary-cta-click" data-siya-location="blog-adhd-care-pathways">Explore ADHD Care →</a></p>
            <p class="answers-next-step-availability" style="max-width:720px;">Available in California, Texas, Pennsylvania, and Florida. State and metro guides live under ADHD Care—not as a directory on this hub.</p>
          </section>
          <!-- /SIYA:ADHD-BLOG-CARE-PATHWAYS -->`;
}

/**
 * Educational next-step block for /answers hub.
 *
 * CONTENT ASSEMBLY RULE (see docs/CONTENT-ASSEMBLY-SYSTEM.md):
 * A next-step CTA must (1) advance the reader's journey, (2) reference only
 * relevant services, (3) NOT introduce a state directory, (4) not repeat
 * navigation already present, (5) use at most 3 contextual links + one button.
 * State availability = one sentence, never a link list.
 */
export function renderAnswersHubCarePathwaysSection() {
  return `<!-- SIYA:ANSWERS-ADHD-CARE-PATHWAYS -->
          <section class="answers-next-step" aria-labelledby="answers-adhd-care-pathways-heading">
            <div class="section-header">
              <h2 id="answers-adhd-care-pathways-heading">Ready to take the next step?</h2>
              <p class="lead">These guides are educational. If you're exploring whether ADHD could explain your symptoms, a few resources can help you decide what's next.</p>
            </div>
            <div class="answers-next-step-actions" style="max-width:640px;margin:0 auto;">
              <p class="answers-next-step-links">${link('/adhd-screening', 'Take our free ADHD screening')} · ${link('/adult-adhd-diagnosis', 'How the evaluation works')} · ${link('/adhd-care', 'Treatment options')}</p>
              <p><a class="button ds-button ds-button--primary" href="/adhd-care" data-siya-track="answers_next_step_click">Explore ADHD Care →</a></p>
              <p class="answers-next-step-availability">Available in California, Texas, Pennsylvania, and Florida.</p>
            </div>
          </section>
          <!-- /SIYA:ANSWERS-ADHD-CARE-PATHWAYS -->`;
}

/** Geo context for shadow LPs only — capped, no metro directory dump. */
export function renderShadowLpGeoContext() {
  return `<!-- SIYA:ADHD-SHADOW-GEO-CONTEXT -->
            <p class="adhd-shadow-geo-context" style="max-width:720px;margin:1.5rem auto 0;" data-assembly="geo-context">Review ${link('/adhd-care', 'ADHD care')} and ${link('/pricing', 'evaluation pricing')}, or take ${link('/adhd-screening', 'the free ADHD screening')} first. Available in California, Texas, Pennsylvania, and Florida.</p>
            <!-- /SIYA:ADHD-SHADOW-GEO-CONTEXT -->`;
}

/** Screening cross-links for /online-adhd-test — assembly-capped. */
export function renderOnlineTestCrossLinks() {
  return `<!-- SIYA:ADHD-ONLINE-TEST-CROSS-LINKS -->
            <p class="adhd-online-test-cross-links" style="max-width:720px;margin:1.5rem auto 0;" data-assembly="test-cross-links">Ready for evaluation? See ${link('/adhd-care', 'ADHD care')} · ${link('/adult-adhd-screening-california', 'California screening')} · ${link('/pricing', 'pricing')}.</p>
            <!-- /SIYA:ADHD-ONLINE-TEST-CROSS-LINKS -->`;
}
