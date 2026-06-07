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
  CANONICAL_ENTITY_STATEMENT,
} from '../data/site-standards.mjs';

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
    <meta name="description" content="Transparent physician-led telehealth pricing: $199 initial evaluation, $79 or $149/month follow-up plans. ADHD, weight loss, primary care, and telehealth in ${STATES_INLINE}." />
    <link rel="canonical" href="https://siya.health${PRICING.path}" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <main id="main">
      <section class="hero-merged" style="background-image: url('/assets/images/telehealth-visit.png');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <h1>Transparent pricing for physician-led care</h1>
            <p class="hero-merged-lead">One evaluation. Clear follow-up plans. No Bronze/Silver/Gold tiers—just care-delivery pricing that applies across ADHD, weight loss, metabolic health, primary care, and telehealth.</p>
            <div class="hero-ctas">
              <a class="button" href="${BOOK}" target="_blank" rel="noopener">${COPY_STANDARDS.primaryCta}</a>
            </div>
            <div class="hero-trust-bar">
              <span>Board-certified physicians</span>
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
              <p class="pricing-price">${PRICING.initialEvaluation.display} <span>${PRICING.initialEvaluation.period}</span></p>
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
              <summary>Which follow-up plan will I need?</summary>
              <p>Your clinician recommends non-controlled ($79/month) or controlled ($149/month) follow-up based on your treatment plan and state regulations—not every patient needs either plan.</p>
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
  </body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
