/**
 * Workplace / working-professionals SEO cluster — shared links and copy blocks.
 * Used by apply-workplace-seo-cluster.mjs and generate-employers-page.mjs.
 */

export const WORKPLACE_CLUSTER_MARKER = 'workplace-seo-2026-09';

export const WORKPLACE_PATHS = {
  employers: '/employers',
  workplaceAccommodations: '/answers/adhd-workplace-accommodations',
  brainFogAtWork: '/blog/brain-fog-at-work',
  executiveDysfunctionBlog: '/blog/executive-dysfunction-adhd',
  executiveDysfunctionAnswer: '/answers/executive-dysfunction-adhd',
  sleepFocusAtWork: '/blog/sleep-and-focus-at-work',
  fatigueWork: '/blog/chronic-fatigue-and-work-performance',
  brainFogHub: '/brain-fog',
  fatigueHub: '/fatigue',
  adhdCare: '/adhd-care',
  providers: '/providers',
};

/** Related reading list for /employers (employee + HR paths). */
export const EMPLOYER_RELATED_GUIDES = [
  {
    href: WORKPLACE_PATHS.workplaceAccommodations,
    label: 'Workplace accommodations & clinical documentation',
    audience: 'HR & employees',
  },
  {
    href: WORKPLACE_PATHS.brainFogAtWork,
    label: 'Brain fog at work — when concentration slips',
    audience: 'Employees',
  },
  {
    href: WORKPLACE_PATHS.executiveDysfunctionBlog,
    label: 'Executive dysfunction in adult ADHD',
    audience: 'Employees',
  },
  {
    href: WORKPLACE_PATHS.sleepFocusAtWork,
    label: 'Sleep, focus, and cognitive load at work',
    audience: 'Employees',
  },
  {
    href: WORKPLACE_PATHS.providers,
    label: 'Meet our care team',
    audience: 'Clinical credibility',
  },
];

export function renderEmployerRelatedGuidesSection() {
  const items = EMPLOYER_RELATED_GUIDES.map(
    (g) =>
      `            <li><a href="${g.href}">${g.label}</a> <span class="employer-related-audience">(${g.audience})</span></li>`,
  ).join('\n');
  return `      <section class="section section-tinted" id="related-workplace-guides" aria-labelledby="related-workplace-guides-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="related-workplace-guides-heading">Related guides</h2>
            <p class="lead">Educational resources for HR teams and employees exploring focus, fatigue, and cognitive health—not medical advice or legal guidance.</p>
          </div>
          <ul class="learn-more-links employer-related-guides">
${items}
          </ul>
          <p class="symptoms-transition">Individual employees can <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a> without an employer contract.</p>
        </div>
      </section>`;
}

export function renderWorkplaceLinkPass({ intro, links }) {
  const linkHtml = links
    .map((l) => `<a href="${l.href}">${l.label}</a>`)
    .join(' · ');
  return `<aside class="workplace-seo-cluster" data-link-pass="${WORKPLACE_CLUSTER_MARKER}" aria-label="Work and cognitive health resources">
              <p class="workplace-seo-cluster__intro">${intro}</p>
              <p class="workplace-seo-cluster__links">${linkHtml}</p>
            </aside>`;
}

export function renderEmployerHrStrip() {
  return renderWorkplaceLinkPass({
    intro: 'For HR and benefits teams exploring structured programs for working professionals:',
    links: [{ href: WORKPLACE_PATHS.employers, label: 'Employer cognitive health programs' }],
  });
}

export function renderEmployeeWorkplaceStrip() {
  return renderWorkplaceLinkPass({
    intro: 'Focus, fatigue, and brain fog at work deserve a real workup—not just productivity tips.',
    links: [
      { href: WORKPLACE_PATHS.brainFogAtWork, label: 'Brain fog at work' },
      { href: WORKPLACE_PATHS.executiveDysfunctionBlog, label: 'Executive dysfunction guide' },
      { href: '/redirect/meet-greet', label: 'Book Free Meet & Greet' },
    ],
  });
}

/** Blog hub spotlight — work & cognitive health cluster (phase 2). */
export function renderWorkplaceBlogSpotlight() {
  const items = [
    { href: WORKPLACE_PATHS.brainFogAtWork, label: 'Brain fog at work' },
    { href: WORKPLACE_PATHS.sleepFocusAtWork, label: 'Sleep, focus & cognitive load at work' },
    { href: WORKPLACE_PATHS.fatigueWork, label: 'Chronic fatigue & work performance' },
    { href: WORKPLACE_PATHS.workplaceAccommodations, label: 'Workplace accommodations (HR & employees)' },
    { href: WORKPLACE_PATHS.employers, label: 'Employer cognitive health programs' },
  ];
  const lis = items.map((i) => `            <li><a href="${i.href}">${i.label}</a></li>`).join('\n');
  return `<!-- SIYA:WORKPLACE-BLOG-SPOTLIGHT -->
      <section class="section section-tinted" id="workplace-articles" aria-labelledby="workplace-articles-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="workplace-articles-heading">Work, focus &amp; cognitive health</h2>
            <p class="lead">Educational articles for working adults—and HR teams exploring structured programs.</p>
          </div>
          <ul class="learn-more-links workplace-blog-spotlight">
${lis}
          </ul>
        </div>
      </section>
<!-- /SIYA:WORKPLACE-BLOG-SPOTLIGHT -->`;
}
