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
    blurb: 'Structured $199 telehealth evaluation with licensed clinicians.',
  },
  {
    href: '/adhd-treatment-online',
    label: 'ADHD treatment online',
    blurb: 'Medication management and follow-up after a formal evaluation.',
  },
  {
    href: '/adhd-evaluation-cost',
    label: 'ADHD evaluation cost',
    blurb: 'Transparent $199 flat-fee pricing—no insurance surprise bills.',
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

/** Contextual care-pathways block for /adhd-care */
export function renderAdhdCarePathwaysSection() {
  const stateLinks = ADHD_GEO_LINKS.map((g) => link(g.href, g.label)).join(', ');
  const screening = ADHD_SCREENING_LINKS.map((s) => link(s.href, s.label)).join(' or ');
  const services = ADHD_SERVICE_LINKS.map((s) => link(s.href, s.label)).join(', ');

  return `<!-- SIYA:ADHD-CARE-PATHWAYS -->
      <section class="section section-tinted adhd-care-pathways" id="adhd-care-pathways" aria-labelledby="adhd-care-pathways-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="adhd-care-pathways-heading">ADHD care pathways by location</h2>
            <p class="lead">Siya Health serves adults in California, Texas, Pennsylvania, and Florida. Start with ${screening}, then explore ${services} when you are ready for clinical care.</p>
          </div>
          <div class="adhd-care-pathways-grid" style="display:grid;gap:1.5rem;max-width:720px;margin:0 auto;">
            <div>
              <h3 style="font-size:1.1rem;margin:0 0 0.5rem;">State &amp; metro pages</h3>
              <p style="margin:0;">${stateLinks}.</p>
            </div>
            <div>
              <h3 style="font-size:1.1rem;margin:0 0 0.5rem;">Screening &amp; evaluation</h3>
              <p style="margin:0;">${link('/online-adhd-test', 'Free online ADHD test')} and ${link('/adult-adhd-screening-california', 'California ADHD screening')} help you decide if evaluation makes sense. For clinical next steps see ${link('/adult-adhd-diagnosis', 'adult ADHD diagnosis online')} and ${link('/adhd-evaluation-cost', 'evaluation cost')}.</p>
            </div>
            <div>
              <h3 style="font-size:1.1rem;margin:0 0 0.5rem;">After diagnosis</h3>
              <p style="margin:0;">Patients who complete evaluation may continue with ${link('/adhd-treatment-online', 'online ADHD treatment')} and medication follow-up. Educational guides live on <a href="/answers#guides-adhd">Health Guides</a> and the <a href="/blog/adhd">ADHD articles hub</a>.</p>
            </div>
          </div>
        </div>
      </section>
      <!-- /SIYA:ADHD-CARE-PATHWAYS -->`;
}

/** Contextual block for /blog/adhd hub */
export function renderBlogAdhdCarePathwaysSection() {
  const caScreen = link('/adult-adhd-screening-california', 'California screening page');
  const onlineTest = link('/online-adhd-test', 'free online ADHD test');
  const geoList = ADHD_GEO_LINKS.filter((g) => !g.metro)
    .map((g) => link(g.href, g.label))
    .join(', ');
  const metroList = ADHD_GEO_LINKS.filter((g) => g.metro)
    .map((g) => link(g.href, g.label))
    .join(', ');

  return `<!-- SIYA:ADHD-BLOG-CARE-PATHWAYS -->
          <section class="blog-hub-section adhd-blog-care-pathways" id="care-pathways" aria-labelledby="adhd-blog-care-pathways-heading">
            <h2 id="adhd-blog-care-pathways-heading">From articles to clinical care</h2>
            <p class="lead" style="max-width:720px;">Articles explain symptoms and legitimacy—clinical pages help you act. Try ${onlineTest} or ${caScreen} before booking. See ${link('/adhd-evaluation-cost', 'what the $199 evaluation includes')}, ${link('/adult-adhd-diagnosis', 'adult diagnosis pathways')}, and ${link('/adhd-treatment-online', 'ongoing treatment')} when you are ready.</p>
            <p style="max-width:720px;">State-specific evaluation: ${geoList}. Metro guides: ${metroList}.</p>
          </section>
          <!-- /SIYA:ADHD-BLOG-CARE-PATHWAYS -->`;
}

/** Educational care-pathways block for /answers hub */
export function renderAnswersHubCarePathwaysSection() {
  const screening = ADHD_SCREENING_LINKS.map((s) => link(s.href, s.label)).join(' and ');
  const services = [
    link('/adult-adhd-diagnosis', 'adult ADHD diagnosis online'),
    link('/adhd-evaluation-cost', 'evaluation cost breakdown'),
    link('/adhd-treatment-online', 'online treatment after diagnosis'),
  ].join(', ');

  const geoByRegion = {
    TX: ADHD_GEO_LINKS.filter((g) => g.region === 'TX'),
    FL: ADHD_GEO_LINKS.filter((g) => g.region === 'FL'),
    PA: ADHD_GEO_LINKS.filter((g) => g.region === 'PA'),
  };

  const txLinks = geoByRegion.TX.map((g) => link(g.href, g.label)).join(', ');
  const flLink = link('/adhd-diagnosis-florida', 'Florida ADHD diagnosis');
  const paLinks = geoByRegion.PA.map((g) => link(g.href, g.label)).join(', ');

  return `<!-- SIYA:ANSWERS-ADHD-CARE-PATHWAYS -->
          <section class="topic-cluster-explorer adhd-answers-care-pathways" aria-labelledby="answers-adhd-care-pathways-heading">
            <div class="section-header">
              <h2 id="answers-adhd-care-pathways-heading">When you are ready for clinical care</h2>
              <p class="lead">These guides are educational. If screening or evaluation is the next step, start with ${screening}—then review ${services}.</p>
            </div>
            <div style="max-width:720px;margin:0 auto;">
              <p><strong>Texas:</strong> ${txLinks}.</p>
              <p><strong>Florida:</strong> ${flLink}.</p>
              <p><strong>Pennsylvania:</strong> ${paLinks}.</p>
              <p>California readers can use ${link('/adult-adhd-screening-california', 'state-specific ADHD screening')} before exploring <a href="/blog/online-adhd-diagnosis-california">California diagnosis articles</a>.</p>
            </div>
          </section>
          <!-- /SIYA:ANSWERS-ADHD-CARE-PATHWAYS -->`;
}

/** Geo context paragraph for shadow landing pages */
export function renderShadowLpGeoContext() {
  const states = ADHD_GEO_LINKS.filter((g) => !g.metro)
    .map((g) => link(g.href, g.label))
    .join(', ');
  const metros = ADHD_GEO_LINKS.filter((g) => g.metro)
    .map((g) => link(g.href, g.label))
    .join(', ');

  return `<!-- SIYA:ADHD-SHADOW-GEO-CONTEXT -->
            <p class="adhd-shadow-geo-context" style="max-width:720px;margin:1.5rem auto 0;">Explore state pages: ${states}. Metro guides: ${metros}. Review ${link('/adhd-evaluation-cost', 'evaluation pricing')} or take ${link('/online-adhd-test', 'the free online ADHD test')} first.</p>
            <!-- /SIYA:ADHD-SHADOW-GEO-CONTEXT -->`;
}

/** Screening cross-links for /online-adhd-test */
export function renderOnlineTestCrossLinks() {
  return `<!-- SIYA:ADHD-ONLINE-TEST-CROSS-LINKS -->
            <p class="adhd-online-test-cross-links" style="max-width:720px;margin:1.5rem auto 0;">California residents: see ${link('/adult-adhd-screening-california', 'California ADHD screening')}. Ready for evaluation? ${link('/adult-adhd-diagnosis', 'Adult ADHD diagnosis online')} · ${link('/adhd-diagnosis-texas', 'Texas')} · ${link('/adhd-diagnosis-pennsylvania', 'Pennsylvania')} · ${link('/adhd-diagnosis-florida', 'Florida')}.</p>
            <!-- /SIYA:ADHD-ONLINE-TEST-CROSS-LINKS -->`;
}
