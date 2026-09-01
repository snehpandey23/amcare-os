/**
 * Workplace / working-professionals blog posts — sleep+focus, chronic fatigue at work.
 * Run before apply-workplace-seo-cluster.mjs and seo-build.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const DATE = '2026-09-01';

const POSTS = [
  {
    slug: 'sleep-and-focus-at-work',
    title: 'Sleep, Focus, and Cognitive Load at Work | Siya Health',
    headline: 'Sleep, Focus, and Cognitive Load at Work',
    breadcrumbShort: 'Sleep & Focus at Work',
    metaDescription:
      'Poor sleep and heavy cognitive load can look like ADHD or burnout at work. Learn when to treat sleep as a medical issue—not just a schedule problem.',
    meta: 'Sleep & energy · Supporting guide',
    hubHref: '/fatigue',
    hubLabel: 'Fatigue',
    parentEntity: '/fatigue',
    cluster: 'fatigue',
    lead: 'When you cannot think straight after a short night—or after weeks of “fine” sleep that never restores you—work becomes the place you notice it first.',
    body: `
            <p>Demanding jobs compress sleep, blur boundaries, and reward pushing through. That is situational strain. But when focus reliably crashes at the same time each day, or sleep never feels restorative, a medical workup may be more useful than another productivity hack.</p>
            <h2>How sleep problems show up at work</h2>
            <ul>
              <li>Reading the same paragraph twice without retaining it</li>
              <li>Meeting fatigue by mid-afternoon despite caffeine</li>
              <li>Irritability or impatience that is new for you</li>
              <li>Weekend “catch-up” sleep that still leaves you tired Monday</li>
              <li>Snoring, gasping, or restless legs reported by a partner</li>
            </ul>
            <h2>Sleep debt versus sleep disorders</h2>
            <p>One bad week is different from months of non-restorative sleep. Insomnia, sleep apnea, shift-work disorder, mood overlap, and medication effects can all disrupt sleep architecture—so “enough hours in bed” still is not enough recovery.</p>
            <h2>Cognitive load is not the same as laziness</h2>
            <p>Complex work taxes working memory and task switching. When sleep or underlying fatigue is impaired, the same workload feels impossible. That pattern deserves evaluation—not shame or a standing-desk upgrade alone.</p>
            <h2>What primary care can sort</h2>
            <p><a href="/fatigue">Fatigue</a> and <a href="/brain-fog">brain fog</a> often travel together. A clinician can review sleep history, screen for apnea risk, check labs when appropriate, and decide whether referral or treatment fits. <a href="/answers/adhd-workplace-accommodations">Workplace accommodations</a> are a separate HR/legal conversation once you understand the clinical picture.</p>
            <p><em>Educational only—not occupational medicine or disability advice.</em></p>
            <aside class="blog-internal-links" aria-label="Knowledge graph" data-assembly="supporting-cluster">
              <p><strong>In this graph:</strong>
                <a href="/fatigue">Fatigue</a>
                → <a href="/brain-fog">Brain Fog</a>
                → <a href="/primary-care">Primary Care</a>
              </p>
            </aside>`,
    faqs: [
      [
        'Can poor sleep mimic ADHD at work?',
        'Yes—sleep deprivation impairs attention, impulse control, and working memory. Evaluation should consider sleep before assuming a lifelong attention disorder.',
      ],
      [
        'Should I use melatonin or apps before seeing a clinician?',
        'Short-term tools can help situational insomnia. Persistent non-restorative sleep, snoring, or daytime sleepiness warrant medical assessment—not endless self-experimentation.',
      ],
      [
        'Does remote work worsen sleep and focus?',
        'It can blur wake/sleep cues and reduce daylight exposure. It can also remove commute fatigue. The impact depends on your habits and any underlying sleep disorder.',
      ],
    ],
    relatedHub: '/telehealth',
    relatedHubLabel: 'Telehealth fatigue & sleep care',
  },
  {
    slug: 'chronic-fatigue-and-work-performance',
    title: 'Chronic Fatigue and Work Performance: When Exhaustion Won\'t Lift | Siya Health',
    headline: 'Chronic Fatigue and Work Performance',
    breadcrumbShort: 'Fatigue & Work Performance',
    metaDescription:
      'Chronic fatigue at work—unrelenting exhaustion, crash cycles, brain fog—may have medical causes. Learn framing for evaluation before blaming burnout alone.',
    meta: 'Fatigue · Supporting guide',
    hubHref: '/fatigue',
    hubLabel: 'Fatigue',
    parentEntity: '/fatigue',
    cluster: 'fatigue',
    lead: 'When rest, weekends, and vacations no longer restore you—and performance keeps slipping—chronic fatigue deserves a structured medical look, not only a workload reset.',
    body: `
            <p>Burnout is real. So are iron deficiency, thyroid disease, sleep apnea, mood conditions, long illness recovery, and medication side effects. Chronic fatigue at work is often the first place the body stops compensating.</p>
            <h2>Patterns that suggest more than “busy season”</h2>
            <ul>
              <li>Post-exertional crashes after routine tasks</li>
              <li>Brain fog paired with <a href="/blog/brain-fog-at-work">concentration problems on the job</a></li>
              <li>Exercise that used to energize you now flattens you</li>
              <li>Months of unrefreshing sleep</li>
              <li>Symptoms that predate a single stressful project</li>
            </ul>
            <h2>Why “push through” stops working</h2>
            <p>Short bursts of overwork are survivable when recovery mechanisms work. Chronic physiological fatigue reduces cognitive reserve—so the same role requires disproportionate effort, which looks like disengagement from the outside.</p>
            <h2>Medical evaluation is not giving up</h2>
            <p><a href="/fatigue">Fatigue evaluation</a> through <a href="/primary-care">primary care</a> can identify treatable contributors. That is separate from workplace performance plans or HR conversations—though clearer clinical information can inform those decisions later.</p>
            <h2>For HR and benefits teams</h2>
            <p>Structured access to screening and physician-led follow-up can help employees get answers sooner. <a href="/employers">Employer program overview</a> describes partnership pathways; individual employees can also <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a> without a contract.</p>
            <p><em>Educational only—not occupational medicine, disability determination, or legal guidance.</em></p>
            <aside class="blog-internal-links" aria-label="Knowledge graph" data-assembly="supporting-cluster">
              <p><strong>In this graph:</strong>
                <a href="/fatigue">Fatigue</a>
                → <a href="/brain-fog">Brain Fog</a>
                → <a href="/primary-care">Primary Care</a>
              </p>
            </aside>`,
    faqs: [
      [
        'Is chronic fatigue the same as ME/CFS?',
        'Not automatically. “Chronic fatigue” describes a symptom pattern; specific syndromes require defined criteria and specialist input. Primary care helps sort common causes first.',
      ],
      [
        'Should I disclose fatigue to my manager?',
        'That is an HR and legal decision. Clinically, understanding your own diagnosis and options first usually leads to clearer choices about disclosure and accommodations.',
      ],
      [
        'Can labs be normal and fatigue still be real?',
        'Yes. Normal basic labs do not rule out sleep disorders, mood overlap, post-viral recovery, or conditions needing targeted testing. Persistent symptoms still warrant follow-up.',
      ],
    ],
    relatedHub: '/fatigue',
    relatedHubLabel: 'Fatigue evaluation hub',
  },
];

function escAttr(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function faqJsonLd(faqs) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  });
}

function buildPage(post) {
  const url = `https://siya.health/blog/${post.slug}`;
  const faqHtml = post.faqs.map(([q, a]) => `\n            <h3>${q}</h3>\n            <p>${a}</p>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${escAttr(post.title)}</title>
    <meta name="description" content="${escAttr(post.metaDescription)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:title" content="${escAttr(post.headline)}" />
    <meta property="og:description" content="${escAttr(post.metaDescription)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <meta property="og:site_name" content="Siya Health" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escAttr(post.title)}" />
    <meta name="twitter:description" content="${escAttr(post.metaDescription)}" />
    <meta name="twitter:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.headline,
      description: post.metaDescription,
      datePublished: DATE,
      dateModified: DATE,
      author: { '@type': 'Organization', name: 'Siya Health', url: 'https://siya.health' },
      publisher: { '@type': 'Organization', name: 'Siya Health', url: 'https://siya.health' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      about: [post.hubLabel, 'Primary care'],
    })}</script>
    <script type="application/ld+json">${faqJsonLd(post.faqs)}</script>
    <script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://siya.health/blog' },
        { '@type': 'ListItem', position: 3, name: post.breadcrumbShort, item: url },
      ],
    })}</script>
  </head>
  <body data-siya-supporting-cluster="${post.cluster}" data-siya-parent-entity="${post.parentEntity}">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">®</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary"></nav>
      </div>
    </header>
    <main id="main">
      <article class="blog-article">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="${post.hubHref}">${post.hubLabel}</a> · ${post.meta.split(' · ')[1] || 'Supporting guide'}</p>
            <h1>${post.headline}</h1>
            <p class="blog-lead">${post.lead}</p>
          </header>
          <div class="blog-content">
            <aside class="clinical-review clinical-review--pending" aria-label="Clinical review status">
              <p class="clinical-review-label">Clinician-informed</p>
              <p>Educational content informed by clinical practice patterns—not personal medical advice.</p>
            </aside>
${post.body}
            <h2>Frequently asked questions</h2>${faqHtml}

            <section class="related-articles" aria-labelledby="related-articles-heading">
              <h2 id="related-articles-heading">Related Articles</h2>
              <ul>
                <li><a href="/blog/brain-fog-at-work">Brain Fog at Work</a></li>
                <li><a href="/blog/brain-fog-and-sleep">Brain Fog and Sleep</a></li>
                <li><a href="/blog/always-tired-no-energy">Always Tired With No Energy</a></li>
              </ul>
              <p class="related-articles-care"><a href="${post.relatedHub}">${post.relatedHubLabel} →</a></p>
            </section>

            <section class="blog-provider-cta" aria-labelledby="supporting-cta-heading">
              <h2 id="supporting-cta-heading">Talk with primary care</h2>
              <p>These articles describe patterns—they cannot assess your history. A licensed clinician can sort fatigue look-alikes and decide what evaluation, if any, fits your situation.</p>
              <div class="blog-provider-cta-actions">
                <a class="button ds-button ds-button--primary" href="/book-appointment" data-siya-track="book_appointment_click" data-siya-location="blog-supporting-cta">Book a primary care visit</a>
                <a href="/redirect/meet-greet" class="button ds-button ds-button--secondary secondary" data-siya-location="blog-supporting-cta" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a>
              </div>
              <p class="blog-provider-cta-foot"><a href="${post.hubHref}">${post.hubLabel} hub</a> · <a href="/primary-care">Primary care</a> · <a href="/employers">For employers</a></p>
            </section>
          </div>
        </div>
      </article>
    </main>
    <footer class="footer"><div class="container"><p>&copy; Siya Health</p></div></footer>
    <script src="/scripts/site-header.js" defer></script>
  </body>
</html>
`;
}

function main() {
  for (const post of POSTS) {
    const out = path.join(BLOG_DIR, `${post.slug}.html`);
    fs.writeFileSync(out, buildPage(post), 'utf8');
    console.log(`  wrote blog/${post.slug}.html`);
  }
  console.log(`generate-workplace-blog-posts: ${POSTS.length} posts`);
}

main();
