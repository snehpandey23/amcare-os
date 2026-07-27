/**
 * Generates /adult-adhd-california — the CANONICAL California ADHD entity page.
 *
 * Governance v1.0 reference implementation. This page is NOT a landing page,
 * sales page, blog, or city page. It is the single canonical answer for every
 * California ADHD query, and the hub every California ADHD article links back to.
 *
 * Architecture rules obeyed (Content Assembly System):
 *   - Exactly ONE primary CTA in <main> (hero: Free ADHD Screening).
 *   - ≤8 contextual links per section.
 *   - No city directory / metro dump (relationships live in the knowledge graph).
 *   - Every section answers a real question.
 *   - Unique prose (no shared boilerplate → editorial fingerprint 10/10).
 *
 * Schema: MedicalWebPage + BreadcrumbList + FAQPage.
 * Chrome (GTM, nav CTA, footer, cookies, concierge, FAQ script) is injected by
 * scripts/seo-build.mjs → applySiteChrome. Run this BEFORE seo-build.
 *
 * Run: node scripts/generate-california-adhd-cornerstone.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'adult-adhd-california.html');

const CANONICAL = 'https://siya.health/adult-adhd-california';
const TITLE = 'Adult ADHD Care in California — Diagnosis, Treatment & Screening | Siya Health';
const DESCRIPTION =
  'The complete guide to adult ADHD in California: what it looks like, when evaluation helps, how online diagnosis works, treatment options, women & ADHD, executive dysfunction, pricing, and a free screening. Physician-led telehealth for California adults.';

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── FAQ content (drives both the accordion and FAQPage schema) ─────────── */
const FAQS = [
  {
    q: 'Can adults be diagnosed with ADHD in California online?',
    a: 'Yes. California licensed clinicians can evaluate adult ADHD through telehealth. A structured clinical interview, symptom history, and validated tools used when appropriate can support a diagnosis without an in-person visit. Screening is a starting point, not a diagnosis on its own.',
  },
  {
    q: 'What does adult ADHD actually look like in California adults?',
    a: 'Adult ADHD often shows up as unfinished tasks, chronic lateness, mental clutter, forgetfulness, and difficulty starting work you care about—patterns that usually trace back to childhood and persist across settings. It is less about being unable to focus and more about being unable to regulate where focus goes.',
  },
  {
    q: 'How is adult ADHD evaluated?',
    a: 'A physician-led evaluation reviews your symptom timeline (childhood versus adult onset), how symptoms affect work, relationships, and daily function, and screens for conditions that mimic or accompany ADHD—such as anxiety, depression, sleep disorders, and thyroid or iron issues. Validated rating scales are used to support, not replace, clinical judgment.',
  },
  {
    q: 'Can I be diagnosed with ADHD later in life?',
    a: 'Yes. Many adults are recognized in their 30s, 40s, or later—often after a child is diagnosed, after a life change removes external structure, or after years of compensating quietly. A late diagnosis does not mean the ADHD is new; it usually means it was missed or masked.',
  },
  {
    q: 'What ADHD treatments are available in California?',
    a: 'Treatment is individualized and may combine non-medication strategies (routines, coaching, sleep and exercise, workplace or academic accommodations) with medication when clinically appropriate. Medication may be stimulant or non-stimulant, and it is never guaranteed—it is one option a clinician discusses after an evaluation.',
  },
  {
    q: 'Do you prescribe ADHD medication in California?',
    a: 'When an evaluation supports it and it is clinically appropriate, our clinicians can prescribe and manage ADHD medication for California patients, including monitoring and follow-up. Controlled medications involve additional safeguards. Medication is decided case by case, not promised in advance.',
  },
  {
    q: 'What happens after I take the free ADHD screening?',
    a: 'The screening helps you decide whether a full evaluation is worth exploring—it is not a diagnosis. If your results suggest ADHD may be contributing, the next step is a physician-led evaluation. If they point elsewhere, that is useful information too, and we can help you find the right direction.',
  },
  {
    q: 'How much does an adult ADHD evaluation cost in California?',
    a: 'Siya Health uses transparent, direct-pay pricing with no insurance required. The initial evaluation is a one-time fee, and ongoing care options are priced separately if management makes sense for you. See the pricing section on this page for current figures.',
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

/* ── Structured data ────────────────────────────────────────────────────── */
const medicalWebPageLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalWebPage',
  name: TITLE,
  description: DESCRIPTION,
  url: CANONICAL,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', name: 'Siya Health', url: 'https://siya.health' },
  about: { '@type': 'MedicalCondition', name: 'Attention Deficit Hyperactivity Disorder (Adult ADHD)' },
  audience: { '@type': 'MedicalAudience', geographicArea: { '@type': 'State', name: 'California' } },
  lastReviewed: new Date().toISOString().slice(0, 10),
  reviewedBy: {
    '@type': 'Person',
    name: 'Dr. Sneh Pandey',
    url: 'https://siya.health/providers/dr-sneh-pandey',
  },
  provider: {
    '@type': 'MedicalOrganization',
    name: 'Siya Health',
    url: 'https://siya.health/',
    areaServed: { '@type': 'State', name: 'California' },
  },
};

const breadcrumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://siya.health/' },
    { '@type': 'ListItem', position: 2, name: 'ADHD Care', item: 'https://siya.health/adhd-care' },
    { '@type': 'ListItem', position: 3, name: 'Adult ADHD in California', item: CANONICAL },
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

/* ── Page ───────────────────────────────────────────────────────────────── */
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
  <body class="page-service page-adhd-california">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">&reg;</sup></span>
        </a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/mens-health-longevity">Men's Health</a>
          <a href="/labs">Labs</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          <a class="button ds-button ds-button--primary" href="/adhd-screening?adhd=1" data-siya-track="adhd_screening_click" data-siya-location="nav" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="lead-magnet" data-component="button">Take Free ADHD Screening</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/mens-health-longevity">Men's Health</a>
          <a href="/labs">Labs</a>
          <a href="/blog">Blog</a>
          <a class="button ds-button ds-button--primary" href="/adhd-screening?adhd=1" data-siya-track="adhd_screening_click" data-siya-location="nav-mobile" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="lead-magnet" data-component="button">Take Free ADHD Screening</a>
        </div>
      </div>
    </header>

    <main id="main">
      <!-- HERO — the single primary CTA on this page lives here -->
      <section class="hero-merged" style="background-image: url('/assets/images/adhd-care.jpg');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <p class="hero-state-line"><a href="/adhd-care">ADHD Care</a> &middot; California</p>
            <h1>Adult ADHD care in California</h1>
            <p class="hero-merged-lead">Everything a California adult needs to understand ADHD in one place: what it looks like, when an evaluation helps, how online diagnosis works, and what treatment can involve. Physician-led, telehealth-based, and written to answer your question&mdash;not sell you a label.</p>
            <p class="hero-state-line">Licensed telehealth for adults across <strong>California</strong> &middot; No insurance required.</p>
            <div class="hero-ctas hero-ctas-row">
              <a class="button ds-button ds-button--primary" href="/adhd-screening?adhd=1" data-siya-track="adhd_screening_click" data-siya-location="hero" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="lead-magnet" data-component="button">Take Free ADHD Screening</a>
              <a class="button ds-button ds-button--secondary secondary" href="/redirect/meet-greet" data-siya-track="meet_greet_click" data-siya-location="hero" data-page-type="adhd" data-intent="adhd" data-cta-slot="meetGreet" data-component="button">Book Free Meet &amp; Greet</a>
            </div>
            <p class="cta-microcopy">Screening is a 2-minute check-in, not a diagnosis&mdash;it just helps you decide whether an evaluation is worth exploring.</p>
          </div>
        </div>
      </section>

      <!-- ON THIS PAGE — orientation, in-page anchors only (assembly ≤8 links) -->
      <nav class="section on-this-page" aria-labelledby="on-this-page-heading">
        <div class="container">
          <h2 id="on-this-page-heading" class="section-header">What this page answers</h2>
          <ul class="scan-list scan-list--compact">
            <li><a href="#recognition">What ADHD can look like in adults</a></li>
            <li><a href="#evaluation">When an evaluation may help &amp; how diagnosis works</a></li>
            <li><a href="#treatment">Treatment options: medication &amp; non-medication support</a></li>
            <li><a href="#women">Women &amp; ADHD, and executive dysfunction</a></li>
            <li><a href="#myths">ADHD myths, California availability &amp; pricing</a></li>
            <li><a href="#faq">Frequently asked questions</a></li>
          </ul>
        </div>
      </nav>

      <!-- RECOGNITION -->
      <section class="section" id="recognition" aria-labelledby="recognition-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="recognition-heading">What ADHD can look like in adults</h2>
            <p class="lead">Adult ADHD is rarely about never focusing. More often it is about not being able to choose where attention goes&mdash;so effort and results stop matching up.</p>
          </div>
          <div class="why-choose-grid">
            <article class="why-choose-card">
              <h3>Starting is the hard part</h3>
              <p>You care about the work, you know the deadline, and you still cannot begin&mdash;until pressure finally forces a last-minute sprint.</p>
            </article>
            <article class="why-choose-card">
              <h3>Mental clutter that never quiets</h3>
              <p>Open tabs in your head, half-finished thoughts, and a running sense that something important is being forgotten.</p>
            </article>
            <article class="why-choose-card">
              <h3>Time feels slippery</h3>
              <p>Underestimating how long things take, losing track of hours, and running late even when you leave early.</p>
            </article>
            <article class="why-choose-card">
              <h3>Effort without traction</h3>
              <p>Working harder than the people around you and still feeling behind&mdash;often quietly, for years.</p>
            </article>
          </div>
          <p>Because these patterns usually trace back to childhood and show up across settings&mdash;work, home, relationships&mdash;rather than in just one stressful season, they are worth taking seriously. However, recognizing yourself here does not mean you have ADHD; it means a structured evaluation could be worth exploring. If you want a fuller picture of the signs, for example, the guide on <a href="/answers/signs-of-adult-adhd">signs of adult ADHD</a> goes deeper.</p>
        </div>
      </section>

      <!-- EVALUATION: when it helps + how diagnosis works -->
      <section class="section section-tinted" id="evaluation" aria-labelledby="evaluation-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="evaluation-heading">When an evaluation may help&mdash;and how diagnosis works</h2>
            <p class="lead">An evaluation is worth considering when these patterns interfere with work, relationships, finances, or wellbeing&mdash;not just when they are annoying.</p>
          </div>
          <p>In California, adult ADHD can be evaluated entirely through telehealth. A physician-led evaluation is not a quiz score, however. Instead, it is a structured conversation that reviews your history and, as a result, rules other explanations in or out before reaching a conclusion.</p>
          <ol class="evaluation-journey-list">
            <li><strong>Symptom timeline</strong><span>Childhood versus adult onset, which settings are affected, and your best and worst stretches&mdash;because ADHD is a lifelong pattern, not a bad month.</span></li>
            <li><strong>Functional impact</strong><span>How symptoms actually affect work, study, relationships, and daily systems&mdash;the part a checklist alone cannot capture.</span></li>
            <li><strong>Screening for look-alikes</strong><span>Anxiety, depression, poor sleep, thyroid, and iron can mimic or accompany ADHD. Good evaluations check what else could be driving symptoms.</span></li>
            <li><strong>Validated tools as support</strong><span>Rating scales are used when clinically appropriate to inform&mdash;never to replace&mdash;a clinician's judgment.</span></li>
            <li><strong>A plan in plain language</strong><span>Findings explained clearly, with next steps whether or not the answer is ADHD.</span></li>
          </ol>
          <p>Being recognized later in life is common and valid. Many California adults are identified in their 30s, 40s, or beyond&mdash;often after a child's diagnosis, for example, or after a job change removes the structure that used to hold things together. So, for the specifics of remote evaluation, see <a href="/blog/online-adhd-diagnosis-california">online ADHD diagnosis in California</a> and how <a href="/blog/adhd-telehealth-california">ADHD telehealth works in California</a>.</p>
        </div>
      </section>

      <!-- TREATMENT: medication overview + non-medication support -->
      <section class="section" id="treatment" aria-labelledby="treatment-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="treatment-heading">Treatment options: medication and non-medication support</h2>
            <p class="lead">There is no single ADHD treatment. Most plans combine practical support with medication only when it is clinically appropriate.</p>
          </div>
          <div class="why-choose-grid">
            <article class="why-choose-card">
              <h3>Medication overview</h3>
              <p>When an evaluation supports it, medication may be stimulant or non-stimulant. Each has different onset, duration, and monitoring needs, so finding a fit is usually an adjustment process rather than a one-time prescription. That said, medication is discussed after an evaluation and is never guaranteed.</p>
            </article>
            <article class="why-choose-card">
              <h3>Non-medication support</h3>
              <p>Routines and external structure, ADHD coaching, sleep and exercise, and reasonable workplace or academic accommodations can meaningfully change day-to-day function&mdash;sometimes alone, often alongside medication.</p>
            </article>
          </div>
          <p>Because ADHD rarely travels alone, a plan may also address sleep, anxiety, or mood, which can make focus problems worse when left untreated. That said, the point of treatment is not a perfect brain; instead, it is getting your effort and your results to finally line up.</p>
        </div>
      </section>

      <!-- WOMEN & ADHD + EXECUTIVE DYSFUNCTION -->
      <section class="section section-tinted" id="women" aria-labelledby="women-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="women-heading">Women &amp; ADHD, and executive dysfunction</h2>
            <p class="lead">Two areas that are easy to miss&mdash;and that explain a lot of late diagnoses.</p>
          </div>
          <div class="why-choose-grid">
            <article class="why-choose-card">
              <h3>ADHD in women</h3>
              <p>ADHD in women is often internalized&mdash;overwhelm, anxiety, and exhaustion rather than obvious hyperactivity&mdash;so it is frequently missed until adulthood, and symptoms can shift with hormonal changes. The guide on <a href="/blog/adhd-in-women">ADHD in women</a> covers this in depth.</p>
            </article>
            <article class="why-choose-card">
              <h3>Executive dysfunction</h3>
              <p>Executive dysfunction is the engine under most ADHD symptoms: trouble planning, starting, sequencing, and switching tasks. Understanding it reframes &ldquo;lazy&rdquo; as a real, workable challenge&mdash;see <a href="/blog/executive-dysfunction-adhd">executive dysfunction in ADHD</a>.</p>
            </article>
          </div>
        </div>
      </section>

      <!-- MYTHS + CALIFORNIA AVAILABILITY -->
      <section class="section" id="myths" aria-labelledby="myths-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="myths-heading">ADHD myths, California availability &amp; pricing</h2>
            <p class="lead">Clearing up the beliefs that keep California adults from getting evaluated.</p>
          </div>
          <div class="why-choose-grid">
            <article class="why-choose-card">
              <h3>&ldquo;Online ADHD diagnosis isn't legitimate&rdquo;</h3>
              <p>A structured, physician-led telehealth evaluation follows the same clinical standards as an in-person visit. Legitimacy comes from the process, not the room. See <a href="/answers/is-online-adhd-diagnosis-legitimate">is online ADHD diagnosis legitimate</a>.</p>
            </article>
            <article class="why-choose-card">
              <h3>&ldquo;If I were smart I couldn't have ADHD&rdquo;</h3>
              <p>ADHD is unrelated to intelligence. Many capable adults compensate for years, which is exactly why it is missed&mdash;and why the crash feels so confusing when structure disappears.</p>
            </article>
            <article class="why-choose-card">
              <h3>&ldquo;A screening quiz is a diagnosis&rdquo;</h3>
              <p>Screening only tells you whether an evaluation is worth exploring. Diagnosis requires clinical history and judgment&mdash;the difference is explained in <a href="/answers/screening-vs-adhd-evaluation">screening versus evaluation</a>.</p>
            </article>
          </div>
          <p class="hero-state-line">Siya Health provides physician-led adult ADHD telehealth to patients located in <strong>California</strong>, with clinicians licensed in the state, so availability is confirmed when you book. However, there is no in-person location to visit and no city you need to live in&mdash;because it is telehealth, care reaches you wherever you are in California.</p>
        </div>
      </section>

      <!-- PRICING -->
      <section class="section section-tinted pricing-section" id="pricing" aria-labelledby="pricing-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="pricing-heading">Transparent California pricing</h2>
            <p class="lead">Direct-pay, no insurance required, no surprise bills. You get answers first; ongoing care is optional.</p>
          </div>
          <div class="why-choose-grid">
            <article class="why-choose-card">
              <h3>Initial ADHD evaluation</h3>
              <p class="pricing-price"><span class="siya-price siya-price--initial-evaluation" data-siya-price="initialEvaluation">$149</span></p>
              <p>One-time 60&ndash;90 minute physician evaluation with a personalized plan. No subscription required to get answers.</p>
            </article>
            <article class="why-choose-card">
              <h3>Ongoing care (optional)</h3>
              <p>If management makes sense for you, ongoing non-stimulant and stimulant options are available with regular follow-ups. Full figures live on the <a href="/pricing">pricing page</a>.</p>
            </article>
          </div>
          <p class="pricing-note">FSA/HSA eligible. Cancel anytime. Pricing is the same whether you are in a major California metro or a rural county&mdash;telehealth removes the geography.</p>
        </div>
      </section>

      <!-- FREE SCREENING (next step, secondary CTA — primary already used in hero) -->
      <section class="section" id="free-screening" aria-labelledby="free-screening-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="free-screening-heading">Start with the free ADHD screening</h2>
            <p class="lead">If this page sounds like your life, the lowest-risk first step is the free 2-minute screening. It is not a diagnosis&mdash;it just helps you decide whether a full evaluation is worth your time.</p>
          </div>
          <div style="max-width:640px;margin:0 auto;text-align:center;">
            <p><a class="button ds-button ds-button--secondary secondary" href="/adhd-screening" data-siya-track="adhd_screening_click" data-siya-location="free-screening" data-page-type="adhd" data-intent="adhd" data-cta-slot="lead-magnet" data-component="button">Take the free ADHD screening</a></p>
            <p class="cta-microcopy">Prefer to talk it through first? <a href="/redirect/meet-greet">Book a free Meet &amp; Greet</a> or review <a href="/pricing">pricing</a>.</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="section faq-accordion-section section-tinted" id="faq" aria-labelledby="faq-heading">
        <div class="container">
          <div class="faq-accordion">
            <div class="faq-accordion-header">
              <h2 id="faq-heading">Frequently asked questions</h2>
            </div>
            <div class="faq-accordion-list">
${faqAccordion(FAQS, 'faq-ca-adhd')}
            </div>
          </div>
        </div>
      </section>

      <!-- RELATED HEALTH GUIDES (assembly ≤8 links) -->
      <section class="section" id="related-guides" aria-labelledby="related-guides-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="related-guides-heading">Related Health Guides</h2>
            <p class="lead">Go deeper on the parts that matter most to you.</p>
          </div>
          <ul class="footer-links">
            <li><a href="/primary-care">Primary care</a></li>
            <li><a href="/adhd-care">ADHD Care</a></li>
            <li><a href="/adhd-screening">Free ADHD screening</a></li>
            <li><a href="/pricing">Pricing</a></li>
            <li><a href="/blog/executive-dysfunction-adhd">Executive dysfunction in ADHD</a></li>
            <li><a href="/fatigue">Fatigue (when energy is part of the picture)</a></li>
            <li><a href="/brain-fog">Brain fog (when focus is the complaint)</a></li>
            <li><a href="/preventive-care">Preventive care</a></li>
          </ul>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container">
        <p><a href="/primary-care">Primary Care</a> &middot; <a href="/adhd-care">ADHD Care</a> &middot; &copy; 2026 Siya Health Inc.</p>
      </div>
    </footer>
  </body>
</html>
`;
}

fs.writeFileSync(OUT, render());
console.log('Wrote adult-adhd-california.html (canonical California ADHD entity)');
