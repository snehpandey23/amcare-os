/**
 * Generates /brain-fog — Symptom Canonical Entity Page.
 *
 * Intersection of Fatigue + Preventive Care + Labs. Not an ADHD funnel.
 * Answers: "Why does my thinking feel slower than usual?"
 *
 * Journey:
 *   Recognition → what people mean → common experiences → what can contribute →
 *   when evaluation helps → how primary care approaches it → related labs →
 *   Differential Recognition → FAQs → Book a primary care visit
 *
 * CTA policy: ONE primary = primary care booking. ADHD is one differential row.
 *
 * Run: node scripts/generate-brain-fog-entity-page.mjs  (BEFORE seo-build.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderDifferentialSection } from '../data/differential-diagnosis.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'brain-fog.html');

const CANONICAL = 'https://siya.health/brain-fog';
const TITLE = 'Brain Fog — Why Thinking Feels Slower, and When to Get Evaluated | Siya Health';
const DESCRIPTION =
  'Brain fog is a symptom with many possible contributors — fatigue, sleep, thyroid, B12, iron, mood, ADHD. Learn what people mean by brain fog, when evaluation helps, which labs clinicians may consider, and how primary care sorts it out.';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const FAQS = [
  {
    q: 'What do people mean by “brain fog”?',
    a: 'Brain fog is everyday language for slowed thinking, word-finding trouble, weak focus, or a sense that mental effort costs more than it used to. It is a symptom description, not a medical diagnosis on its own.',
  },
  {
    q: 'Is brain fog the same as ADHD?',
    a: 'No. ADHD can contribute to concentration problems, but many other factors — sleep, iron, thyroid, B12, mood, medications, hormones — can feel similar. Brain fog alone is not enough to point to ADHD.',
  },
  {
    q: 'When should I see a clinician for brain fog?',
    a: 'Consider evaluation when fog lasts more than a few weeks, interferes with work or safety, arrived suddenly, or comes with fatigue, sleep disruption, mood changes, or neurologic symptoms. Seek urgent care for sudden severe confusion, weakness, vision loss, or speech changes.',
  },
  {
    q: 'Which labs might a clinician consider?',
    a: 'Depending on history, clinicians may discuss CBC, TSH, vitamin B12, ferritin, and vitamin D — among others. Testing is individualized. Ordering every marker is not the same as testing well.',
  },
  {
    q: 'Can my labs be normal and I still feel foggy?',
    a: 'Yes. Sleep apnea, depression, anxiety, medication effects, and ADHD-related load often do not show up as an abnormal standard panel. Normal labs narrow questions; they do not always close them.',
  },
  {
    q: 'How is brain fog related to fatigue?',
    a: 'They frequently travel together. When energy reserves are low, mental clarity often drops too. Evaluating one without asking about the other misses half the picture.',
  },
  {
    q: 'How does Siya Health approach brain fog?',
    a: 'A clinician starts with history — timeline, sleep, mood, medications, cycle or midlife changes, and daily function — then decides which labs or next steps would change the plan. Findings are explained in plain language with follow-up when needed.',
  },
  {
    q: 'Do I need insurance for a brain fog visit?',
    a: 'No. Siya Health offers direct-pay telehealth with published pricing. Availability depends on the state you are in when you schedule.',
  },
];

function faqAccordion(faqs, prefix) {
  return faqs
    .map((f, i) => {
      const id = `${prefix}-${i}`;
      return `              <div class="faq-accordion-card" data-faq-item>
                <h3 style="margin:0;">
                  <button type="button" class="faq-accordion-trigger" aria-expanded="false" aria-controls="${id}" id="${id}-q" data-faq-trigger>
                    <span>${esc(f.q)}</span>
                    <span class="faq-accordion-icon" aria-hidden="true">+</span>
                  </button>
                </h3>
                <div id="${id}" class="faq-accordion-content" role="region" aria-labelledby="${id}-q" data-faq-content>
                  <div class="faq-accordion-inner">
                    <p>${esc(f.a)}</p>
                  </div>
                </div>
              </div>`;
    })
    .join('\n');
}

const medicalWebPageLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: TITLE,
  description: DESCRIPTION,
  url: CANONICAL,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', name: 'Siya Health', url: 'https://siya.health' },
  about: {
    '@type': 'MedicalSymptom',
    name: 'Brain fog',
    alternateName: ['Mental fog', 'Cognitive fog', 'Cloudy thinking', 'Slowed thinking'],
    possibleCause: [
      { '@type': 'MedicalCondition', name: 'Fatigue' },
      { '@type': 'MedicalCondition', name: 'Obstructive sleep apnea' },
      { '@type': 'MedicalCondition', name: 'Hypothyroidism' },
      { '@type': 'MedicalCondition', name: 'Vitamin B12 deficiency' },
      { '@type': 'MedicalCondition', name: 'Iron deficiency' },
      { '@type': 'MedicalCondition', name: 'Depression' },
      { '@type': 'MedicalCondition', name: 'Anxiety' },
      { '@type': 'MedicalCondition', name: 'Attention deficit hyperactivity disorder' },
    ],
  },
  lastReviewed: new Date().toISOString().slice(0, 10),
  reviewedBy: {
    '@type': 'Person',
    name: 'Dr. Vanessa Urbina',
    url: 'https://siya.health/providers/dr-vanessa-urbina',
  },
  provider: { '@type': 'MedicalOrganization', name: 'Siya Health', url: 'https://siya.health/' },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Primary Care',
      item: 'https://siya.health/primary-care',
    },
    { '@type': 'ListItem', position: 3, name: 'Brain Fog', item: CANONICAL },
  ],
};

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

function render() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/scripts/cookie-consent-bootstrap.js"></script>
<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <link rel="canonical" href="${CANONICAL}" />
    <meta property="og:title" content="${esc(TITLE)}" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${CANONICAL}" />
    <meta property="og:site_name" content="Siya Health" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${esc(TITLE)}" />
    <meta name="twitter:description" content="${esc(DESCRIPTION)}" />
    <link rel="icon" type="image/x-icon" href="/assets/favicon.ico" />
    <link rel="preload" href="/styles.css" as="style" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/styles.css" />
    <script type="application/ld+json">${JSON.stringify(medicalWebPageLd)}</script>
    <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
    <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  </head>
  <body class="page-service page-brain-fog">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">&reg;</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/primary-urgent-care">Primary Care</a>
          <a href="/preventive-care">Preventive Care</a>
          <a href="/labs">Labs</a>
          <a href="/answers">Health Guides</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta"></div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/primary-urgent-care">Primary Care</a>
          <a href="/preventive-care">Preventive Care</a>
          <a href="/labs">Labs</a>
          <a href="/answers">Health Guides</a>
          <a href="/blog">Blog</a>
        </div>
      </div>
    </header>

    <main id="main">
      <!-- HERO — recognition; single primary CTA -->
      <section class="hero-merged" style="background-image: url('/assets/images/healthy-lifestyle.png');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="hero-state-line"><a href="/primary-care">Primary Care</a> &middot; Symptom guide</p>
            <h1>Brain fog: when thinking feels slower than usual</h1>
            <p class="hero-merged-lead">Words take longer to find. Focus slips mid-sentence. Simple decisions feel heavy. Brain fog is how people describe that shift&mdash;and it is a symptom worth evaluating in primary care, not a label that automatically means ADHD.</p>
            <div class="hero-ctas hero-ctas-row">
              <a class="button ds-button ds-button--primary" href="/book-appointment" data-siya-track="primary-cta-click" data-siya-location="hero" data-page-type="default" data-intent="primary-care" data-component="button">Book a primary care visit</a>
              <a class="button ds-button ds-button--secondary secondary" href="#what-it-could-be" data-siya-track="scroll_differential" data-siya-location="hero" data-component="button">See what it could be</a>
            </div>
            <p class="cta-microcopy">Educational information, not a diagnosis. Sudden confusion, weakness, vision or speech changes need emergency care now.</p>
          </div>
        </div>
      </section>

      <nav class="section on-this-page" aria-labelledby="on-this-page-heading">
        <div class="container">
          <h2 id="on-this-page-heading" class="section-header">What this page answers</h2>
          <ul class="scan-list scan-list--compact">
            <li><a href="#what-people-mean">What people mean by brain fog</a></li>
            <li><a href="#common-experiences">Common experiences</a></li>
            <li><a href="#what-can-contribute">What can contribute</a></li>
            <li><a href="#when-to-be-evaluated">When evaluation helps</a></li>
            <li><a href="#our-approach">How primary care approaches it</a></li>
            <li><a href="#labs">Related labs</a></li>
            <li><a href="#what-it-could-be">Differential recognition</a></li>
            <li><a href="#faq">Frequently asked questions</a></li>
          </ul>
        </div>
      </nav>

      <section class="section" id="what-people-mean" aria-labelledby="what-people-mean-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="what-people-mean-heading">What people mean by &ldquo;brain fog&rdquo;</h2>
            <p class="lead">It is everyday language for a real experience&mdash;not a single disease name.</p>
          </div>
          <p>Clinicians hear &ldquo;brain fog&rdquo; as a cluster: slowed processing, weaker working memory, harder focus, and a sense that mental effort used to cost less. People rarely mean forgetfulness alone; they mean the mind feels less available.</p>
          <p>Because the phrase is informal, it can hide very different stories underneath. Someone recovering from poor sleep, someone with low iron stores, someone in perimenopause, and someone with lifelong ADHD patterns may use the same words. The job of a visit is to unpack the story&mdash;not to treat the metaphor as the diagnosis.</p>
        </div>
      </section>

      <section class="section section-tinted" id="common-experiences" aria-labelledby="common-experiences-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="common-experiences-heading">Common experiences</h2>
            <p class="lead">Patterns people recognize in themselves&mdash;not a checklist that proves a cause.</p>
          </div>
          <ul class="scan-list">
            <li>Reading the same paragraph twice and still not retaining it</li>
            <li>Losing a word mid-sentence that used to come easily</li>
            <li>Feeling mentally exhausted after meetings that used to be routine</li>
            <li>Afternoon crashes where focus and mood both dip</li>
            <li>Fog that worsens with poor sleep, heavy periods, new medications, or midlife hormone shifts</li>
            <li>A sense that caffeine or willpower no longer closes the gap</li>
          </ul>
          <p>These experiences overlap with <a href="/fatigue">fatigue</a>, post-meal energy crashes, and concentration complaints. Overlap is expected; it does not mean every cause is present at once.</p>
        </div>
      </section>

      <section class="section" id="what-can-contribute" aria-labelledby="what-can-contribute-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="what-can-contribute-heading">What can contribute</h2>
            <p class="lead">Brain fog sits at the intersection of energy, sleep, nutrients, mood, hormones, and attention&mdash;not a single funnel.</p>
          </div>
          <p>Contributors clinicians keep in view include unrefreshing sleep, iron and B12 status, thyroid function, mood and anxiety load, medications, metabolic swings, midlife hormone transitions, and&mdash;sometimes&mdash;ADHD-related executive strain. Preventive care and thoughtful labs can clarify some of those pieces; history clarifies others.</p>
          <p>What this page will not do is rank those possibilities or turn your symptom into a marketing destination. ADHD appears later as one related entity among several. The starting frame is primary care: sort the contributors, then decide what deserves follow-up.</p>
          <p>For the structured recognition table, see <a href="#what-it-could-be">what it could be</a>. For marker-level lab education under preventive care, see the related labs below.</p>
        </div>
      </section>

      <section class="section section-tinted" id="when-to-be-evaluated" aria-labelledby="when-to-be-evaluated-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="when-to-be-evaluated-heading">When evaluation helps</h2>
            <p class="lead">Not every foggy week needs a workup. These are situations where a clinical conversation changes the plan.</p>
          </div>
          <ul class="scan-list">
            <li>Fog has lasted more than a few weeks and is not improving with rest or routine sleep hygiene</li>
            <li>It interferes with work, driving, parenting, or learning</li>
            <li>It arrived with new fatigue, heavy periods, diet change, or a new medication</li>
            <li>You snore, gasp, or wake unrefreshed despite enough hours in bed</li>
            <li>Mood, anxiety, or midlife symptoms are rising alongside the fog</li>
            <li>Prior labs were called &ldquo;normal&rdquo; but nothing actually improved</li>
          </ul>
          <p>Sudden severe confusion, one-sided weakness, vision loss, or speech changes are emergency symptoms&mdash;not a reason to wait for a telehealth slot.</p>
        </div>
      </section>

      <section class="section" id="our-approach" aria-labelledby="our-approach-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="our-approach-heading">How primary care approaches brain fog</h2>
            <p class="lead">Clear thinking about cloudy thinking starts with history&mdash;not a scattershot panel.</p>
          </div>
          <ol class="evaluation-journey-list">
            <li><strong>History before tests</strong><span>Timeline, sleep, mood, medications, cycle or midlife changes, diet, and what specifically feels different&mdash;because the story usually narrows possibilities faster than ordering everything.</span></li>
            <li><strong>Targeted labs when informative</strong><span>Markers such as CBC, TSH, B12, ferritin, and vitamin D may help when history supports them. They sit under <a href="/preventive-care">preventive care</a>, not as a catalogue to shop.</span></li>
            <li><strong>Sleep and mood taken seriously</strong><span>Unrefreshing sleep and mood conditions are common fog contributors that standard panels may not reveal.</span></li>
            <li><strong>Related entities without premature funnels</strong><span>If ADHD, perimenopause, or metabolic health belongs in the picture, that becomes a branch of the plan&mdash;not the opening assumption.</span></li>
            <li><strong>Plain-language findings and follow-up</strong><span>You get what was found, what it means, and what happens next. Fog often needs more than one visit to sort properly.</span></li>
          </ol>
        </div>
      </section>

      <section class="section section-tinted" id="labs" aria-labelledby="labs-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="labs-heading">Related labs</h2>
            <p class="lead">Marker guides already live under preventive care. Reuse them&mdash;this is orientation, not a self-order list.</p>
          </div>
          <ul class="scan-list">
            <li><strong><a href="/labs/cbc">CBC</a></strong> &mdash; blood-count context when anemia or related patterns are in view</li>
            <li><strong><a href="/labs/thyroid">TSH</a></strong> &mdash; thyroid signalling when history raises endocrine questions</li>
            <li><strong><a href="/labs/vitamin-b12">Vitamin B12</a></strong> &mdash; when diet, absorption, or neurologic clues fit</li>
            <li><strong><a href="/labs/iron-ferritin">Ferritin</a></strong> &mdash; iron stores, especially with heavy periods or fatigue overlap</li>
            <li><strong><a href="/labs/vitamin-d">Vitamin D</a></strong> &mdash; when deficiency risk or clinical questions justify it</li>
          </ul>
          <p>For the cluster view, see <a href="/labs/fatigue-brain-fog">fatigue &amp; brain fog labs</a>. For the parent frame, see <a href="/preventive-care">preventive care</a> and the <a href="/labs/preventive">preventive labs overview</a>. Results still need a clinician&mdash;see <a href="/answers/why-normal-labs-dont-mean-healthy">why normal labs don&rsquo;t mean healthy</a>.</p>
        </div>
      </section>

${renderDifferentialSection('brain_fog')}

      <section class="section" id="related" aria-labelledby="related-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="related-heading">Related guides</h2>
            <p class="lead">Follow the thread that matches where you are.</p>
          </div>
          <ul class="footer-links">
            <li><a href="/fatigue">Fatigue: when tired stops being normal</a></li>
            <li><a href="/preventive-care">Preventive care</a></li>
            <li><a href="/answers/brain-fog-after-eating">Brain fog after eating</a></li>
            <li><a href="/blog/perimenopause-brain-fog">Perimenopause brain fog</a></li>
            <li><a href="/answers/poor-sleep-feels-like-adhd">Can poor sleep feel like ADHD?</a></li>
            <li><a href="/labs/fatigue-brain-fog">Fatigue &amp; brain fog labs</a></li>
          </ul>
        </div>
      </section>

      <section class="section faq-accordion-section section-tinted" id="faq" aria-labelledby="faq-heading">
        <div class="container">
          <div class="faq-accordion">
            <div class="faq-accordion-header">
              <h2 id="faq-heading">Frequently asked questions</h2>
            </div>
            <div class="faq-accordion-list">
${faqAccordion(FAQS, 'faq-brain-fog')}
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="next-step" aria-labelledby="next-step-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="next-step-heading">Bring your brain fog to a clinician</h2>
            <p class="lead">You do not need a theory before you book. Timeline, sleep, medications, and what changed is enough to start.</p>
          </div>
          <div style="max-width:640px;margin:0 auto;text-align:center;">
            <p><a class="button ds-button ds-button--secondary secondary" href="/book-appointment" data-siya-track="booking_click" data-siya-location="next-step" data-component="button">Book a primary care visit</a></p>
            <p class="cta-microcopy">Prefer to ask questions first? <a href="/redirect/meet-greet">Book a free Meet &amp; Greet</a>, or review <a href="/pricing">pricing</a> before you decide.</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p><a href="/primary-urgent-care">Primary &amp; Urgent Care</a> &middot; <a href="/fatigue">Fatigue</a> &middot; &copy; 2026 Siya Health Inc.</p>
      </div>
    </footer>
  </body>
</html>
`;
}

fs.writeFileSync(OUT, render());
console.log('Wrote brain-fog.html (canonical brain fog entity page)');
