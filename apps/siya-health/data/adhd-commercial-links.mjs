/**
 * ADHD commercial landing pages — hub contextual linking registry.
 * Consumed by apply-adhd-hub-linking.mjs and generate-answer-pages.mjs.
 *
 * Assembly rule: ≤3 contextual links + 1 primary button in care-pathway blocks.
 * Metro geo clones were retired (data/geo-consolidation.mjs) — do not re-link them.
 */

/** @typedef {{ href: string, label: string, blurb?: string, region?: string, metro?: boolean }} CommercialLink */

/** Screening & evaluation entry points (canonical only) */
export const ADHD_SCREENING_LINKS = [
  {
    href: '/adhd-screening',
    label: 'Free ADHD screening',
    blurb: 'Structured starting point—not a diagnosis.',
  },
  {
    href: '/adult-adhd-screening-california',
    label: 'California ADHD screening',
    blurb: 'State-specific screening for California adults.',
  },
];

/** Core commercial service pages — use live service URLs, not redirect sources */
export const ADHD_SERVICE_LINKS = [
  {
    href: '/adhd-care',
    label: 'ADHD evaluation & care',
    blurb: 'Structured telehealth evaluation and follow-up.',
  },
  {
    href: '/pricing',
    label: 'Evaluation pricing',
    blurb: 'Transparent flat-fee pricing.',
  },
];

/**
 * Retained geo owners only (no metro clones).
 * Metros redirect via GEO_CLONE_REDIRECTS — never list them here.
 */
export const ADHD_GEO_LINKS = [
  { href: '/adhd-diagnosis-texas', label: 'Texas ADHD diagnosis', region: 'TX' },
  { href: '/blog/adhd-treatment-texas', label: 'Texas ADHD treatment', region: 'TX' },
  { href: '/blog/online-adhd-diagnosis-california', label: 'California ADHD diagnosis', region: 'CA' },
  { href: '/adult-adhd-screening-california', label: 'California ADHD screening', region: 'CA' },
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

/** Contextual care-pathways block for /adhd-care — one primary CTA */
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

/** Contextual block for /blog/adhd hub — capped links, one primary */
export function renderBlogAdhdCarePathwaysSection() {
  return `<!-- SIYA:ADHD-BLOG-CARE-PATHWAYS -->
          <section class="blog-hub-section adhd-blog-care-pathways" id="care-pathways" aria-labelledby="adhd-blog-care-pathways-heading" data-assembly="care-pathways">
            <h2 id="adhd-blog-care-pathways-heading">From articles to clinical care</h2>
            <p class="lead" style="max-width:720px;">Articles explain symptoms and legitimacy—clinical pages help you act. Start with ${link('/adhd-screening', 'free ADHD screening')}, then review ${link('/adhd-care', 'ADHD evaluation &amp; care')} when you are ready.</p>
            <p style="max-width:720px;"><a class="button ds-button ds-button--primary" href="/adhd-care" data-siya-track="primary-cta-click" data-siya-location="blog-adhd-care-pathways">Explore ADHD Care →</a></p>
            <p class="answers-next-step-availability" style="max-width:720px;">Available in California, Texas, Pennsylvania, and Florida. State guides live under ADHD Care—not as a metro directory on this hub.</p>
          </section>
          <!-- /SIYA:ADHD-BLOG-CARE-PATHWAYS -->`;
}

/**
 * Educational next-step block for /answers hub.
 * Max 3 contextual links + one button. State availability = one sentence.
 */
export function renderAnswersHubCarePathwaysSection() {
  return `<!-- SIYA:ANSWERS-ADHD-CARE-PATHWAYS -->
          <section class="answers-next-step" aria-labelledby="answers-adhd-care-pathways-heading">
            <div class="section-header">
              <h2 id="answers-adhd-care-pathways-heading">Ready to take the next step?</h2>
              <p class="lead">These guides are educational. If you're exploring whether ADHD could explain your symptoms, a few resources can help you decide what's next.</p>
            </div>
            <div class="answers-next-step-actions" style="max-width:640px;margin:0 auto;">
              <p class="answers-next-step-links">${link('/adhd-screening', 'Take our free ADHD screening')} · ${link('/adhd-care', 'How the evaluation works')} · ${link('/pricing', 'Pricing')}</p>
              <p><a class="button ds-button ds-button--primary" href="/adhd-care" data-siya-track="answers_next_step_click">Explore ADHD Care →</a></p>
              <p class="answers-next-step-availability">Available in California, Texas, Pennsylvania, and Florida.</p>
            </div>
          </section>
          <!-- /SIYA:ANSWERS-ADHD-CARE-PATHWAYS -->`;
}

/** Geo context for retained shadow landers — no metro dump */
export function renderShadowLpGeoContext() {
  return `<!-- SIYA:ADHD-SHADOW-GEO-CONTEXT -->
            <p class="adhd-shadow-geo-context" style="max-width:720px;margin:1.5rem auto 0;">Siya Health offers virtual ADHD evaluation for eligible adults in California, Texas, Pennsylvania, and Florida. Review ${link('/pricing', 'evaluation pricing')} or take ${link('/adhd-screening', 'the free ADHD screening')} first.</p>
            <!-- /SIYA:ADHD-SHADOW-GEO-CONTEXT -->`;
}

/** Screening cross-links for /online-adhd-test / /adhd-screening */
export function renderOnlineTestCrossLinks() {
  return `<!-- SIYA:ADHD-ONLINE-TEST-CROSS-LINKS -->
            <p class="adhd-online-test-cross-links" style="max-width:720px;margin:1.5rem auto 0;">California residents: see ${link('/adult-adhd-screening-california', 'California ADHD screening')}. Ready for evaluation? ${link('/adhd-care', 'ADHD evaluation &amp; care')} · ${link('/adhd-diagnosis-texas', 'Texas ADHD diagnosis')}.</p>
            <!-- /SIYA:ADHD-ONLINE-TEST-CROSS-LINKS -->`;
}
