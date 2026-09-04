/**
 * Generates canonical /pricing page from site-standards.mjs
 * Run: node scripts/generate-pricing-page.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PRICING,
  COPY_STANDARDS,
  CTA_SYSTEM,
  STATES_INLINE,
  FOOTER_STATES_LINE,
  CANONICAL_ENTITY_STATEMENT,
} from '../data/site-standards.mjs';
import { REDIRECT_MEET_GREET_URL, REDIRECT_CHAT_URL } from '../data/providers-core.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT = path.join(SITE_ROOT, 'pricing.html');
const BOOK = CTA_SYSTEM.primary.url;

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>${PRICING.pageTitle}</title>
    <meta name="description" content="Transparent physician-led telehealth pricing: ${PRICING.initialEvaluation.display} initial evaluation, $79 or $149/month follow-up plans. ADHD, weight loss, primary care, and telehealth in ${STATES_INLINE}." />
    <link rel="canonical" href="https://siya.health${PRICING.path}" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="site-header">
      <div class="container">
        <a class="header-logo" href="/"><img src="/assets/images/siya-health-logo-registered.png" alt="Siya Health" /></a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/providers">Care Team</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/mens-health-longevity">Men's Health</a>
          <a href="/blog">Blog</a>
          <a href="/pricing" aria-current="page">Pricing</a>
        </nav>
        <div class="nav-cta">
          <a class="button ds-button ds-button--primary" href="${REDIRECT_MEET_GREET_URL}" data-siya-track="meet_greet_click" data-siya-location="nav" data-page-type="pricing">${COPY_STANDARDS.meetGreetCta}</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/providers">Care Team</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/mens-health-longevity">Men's Health</a>
          <a href="/blog">Blog</a>
          <a href="/pricing" aria-current="page">Pricing</a>
          <a class="button ds-button ds-button--primary" href="${REDIRECT_MEET_GREET_URL}" data-siya-track="meet_greet_click" data-siya-location="nav-mobile" data-page-type="pricing">${COPY_STANDARDS.meetGreetCta}</a>
        </div>
      </div>
    </header>
    <main id="main">
      <section class="hero-merged" style="background-image: url('/assets/images/telehealth-visit.png');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <h1>Transparent pricing for physician-led care</h1>
            <p class="hero-merged-lead">One evaluation. Clear follow-up plans. No Bronze/Silver/Gold tiers—just care-delivery pricing that applies across ADHD, weight loss, metabolic health, primary care, and telehealth.</p>
            <div class="hero-ctas hero-ctas-row">
              <a class="button ds-button ds-button--primary" href="${BOOK}" data-siya-track="meet_greet_click" data-siya-location="hero" data-page-type="pricing" data-cta-slot="meetGreet" data-component="button">${COPY_STANDARDS.meetGreetCta || 'Book Free Meet &amp; Greet'}</a>
              <a class="button ds-button ds-button--secondary secondary" href="${REDIRECT_CHAT_URL}" data-siya-track="secure_chat_click" data-siya-location="hero" data-page-type="pricing" data-cta-slot="secureChat" data-component="button">Start Secure Medical Chat</a>
            </div>
            <div class="hero-trust-bar">
              <span>Licensed clinicians</span>
              <span>Transparent pricing</span>
              <span>HIPAA-Compliant</span>
              <span>${STATES_INLINE}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="pricing-plans">
        <div class="container">
          <div class="section-header">
            <h2>Care pricing</h2>
            <p class="lead">These plans describe how care is delivered—not a single condition. Your clinician recommends the right pathway after evaluation.</p>
          </div>
          <div class="pricing-cards-grid">
            <article class="pricing-card">
              <h3>${PRICING.initialEvaluation.label}</h3>
              <p class="pricing-price"><!-- SIYA:PRICE:INITIAL_EVAL --> <span>${PRICING.initialEvaluation.period}</span></p>
              <p>${PRICING.initialEvaluation.description}</p>
            </article>
            <article class="pricing-card pricing-card--featured">
              <h3>${PRICING.nonControlledFollowUp.label}</h3>
              <p class="pricing-price">${PRICING.nonControlledFollowUp.display}<span>${PRICING.nonControlledFollowUp.period}</span></p>
              <p>${PRICING.nonControlledFollowUp.description}</p>
            </article>
            <article class="pricing-card">
              <h3>${PRICING.controlledFollowUp.label}</h3>
              <p class="pricing-price">${PRICING.controlledFollowUp.display}<span>${PRICING.controlledFollowUp.period}</span></p>
              <p>${PRICING.controlledFollowUp.description}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section section-tinted" id="pricing-applies">
        <div class="container">
          <div class="section-header">
            <h2>Where this pricing applies</h2>
          </div>
          <ul class="who-we-help-list">
            <li><strong>ADHD care</strong> — structured evaluation and ongoing medication monitoring when appropriate</li>
            <li><strong>Weight loss &amp; metabolic health</strong> — GLP-1 and medical weight management follow-up</li>
            <li><strong>Primary care &amp; telehealth</strong> — ongoing visits, refills, and chronic care when clinically appropriate</li>
            <li><strong>Men's health</strong> — hormone and metabolic follow-up within licensed scope</li>
          </ul>
          <p class="blog-hub-see-all"><a href="/telehealth">${COPY_STANDARDS.secondaryCtaTelehealth}</a></p>
        </div>
      </section>

      <section class="section section-tinted" id="pricing-labs">
        <div class="container">
          <div class="section-header">
            <h2>Labs &amp; blood tests</h2>
            <p class="lead">Lab orders are separate from visit fees. Browse transparent direct-pay pricing on our laboratory storefront—then return to Siya for interpretation and ongoing care.</p>
          </div>
          <ul class="who-we-help-list">
            <li><strong>Storefront pricing</strong> — tests and panels are priced on the lab storefront and may change; we do not mark up a hidden catalogue here.</li>
            <li><strong>Interpretation</strong> — included in clinician visits and follow-up plans when labs are clinically relevant (see $79/month non-controlled follow-up).</li>
            <li><strong>Clean loop</strong> — <a href="/labs/preventive">preventive labs</a> → <a href="/labs/how-to-read-results">how to read results</a> → follow-up when you need ongoing care.</li>
          </ul>
          <p class="blog-hub-see-all"><a href="/labs">Explore Labs &amp; Blood Tests</a> · <a href="/labs/preventive">Preventive labs</a></p>
        </div>
      </section>

      <section class="section" id="pricing-faq">
        <div class="container">
          <div class="section-header">
            <h2>Pricing FAQ</h2>
          </div>
          <div class="faq-accordion">
            <details class="faq-item">
              <summary>Is this ADHD-only pricing?</summary>
              <p>No. These are care-delivery plans used across service lines—evaluation first, then follow-up matched to your clinical needs.</p>
            </details>
            <details class="faq-item">
              <summary>Do you take insurance?</summary>
              <p>We offer transparent cash pricing today. Many patients use FSA or HSA funds. Insurance-based options may be added later.</p>
            </details>
            <details class="faq-item">
              <summary>Is medication included in the monthly price?</summary>
              <p>Visit fees cover clinician time, evaluation, and monitoring. Medication costs are separate and depend on your pharmacy and plan.</p>
            </details>
            <details class="faq-item">
              <summary>Are lab tests included in visit pricing?</summary>
              <p>No. Laboratory tests are ordered and priced separately through our transparent direct-pay storefront. Clinician review of results is part of visits and follow-up plans when appropriate. Start at <a href="/labs">Labs &amp; Blood Tests</a>.</p>
            </details>
            <details class="faq-item">
              <summary>Is Creyos testing included in the evaluation?</summary>
              <p>When clinically appropriate, cognitive testing such as <a href="/creyos-adhd-testing">Creyos</a> may be part of an adult ADHD evaluation. Your clinician decides which tools fit your history—not every patient receives every instrument.</p>
            </details>
            <details class="faq-item">
              <summary>Which follow-up plan will I need?</summary>
              <p>Your clinician recommends non-controlled (${PRICING.nonControlledFollowUp.display}/month) or controlled (${PRICING.controlledFollowUp.display}/month) follow-up based on your treatment plan and state regulations—not every patient needs either plan.</p>
            </details>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="cta-band">
            <h3>Ready to start with a clinician?</h3>
            <p>Book when you are ready. We will confirm eligibility for ${STATES_INLINE} at scheduling.</p>
            <div class="cta-band-buttons">
              <a class="button" href="${BOOK}" target="_blank" rel="noopener">${COPY_STANDARDS.primaryCta}</a>
            </div>
          </div>
          <p class="cta-microcopy">${CANONICAL_ENTITY_STATEMENT}</p>
        </div>
      </section>
    </main>
    <footer class="footer">
      <div class="container">
        <div class="footer-brand-bar">
          <div class="footer-brand-bar__left">
            <a href="/" class="footer-logo-link footer-logo-link--compact"><img src="/assets/images/siya-health-logo-registered.png" alt="Siya Health" class="footer-logo-img footer-logo-img--compact" /></a>
            <div class="footer-brand-meta">
              <p class="footer-brand-tagline">${FOOTER_STATES_LINE}</p>
              <p><a href="mailto:care@siya.health">care@siya.health</a> · <a href="tel:+12154451244">(215) 445-1244</a></p>
            </div>
          </div>
          <div class="footer-brand-bar__right">
            <p><a href="/">← Back to homepage</a></p>
            <p><a href="/telehealth">${COPY_STANDARDS.secondaryCtaTelehealth}</a></p>
          </div>
        </div>
        <p class="cta-microcopy">${CANONICAL_ENTITY_STATEMENT}</p>
      </div>
    </footer>
  </body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
