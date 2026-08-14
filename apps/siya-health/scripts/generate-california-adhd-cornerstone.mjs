/**
 * Generates /adult-adhd-california as the California twin of
 * /adhd-evaluation-texas (lean ads/evaluation LP).
 *
 * Diffs vs Texas are intentional and limited to:
 *   - California state copy
 *   - CA-licensed care team (Sneh + Wendy)
 *   - CA canonical/meta URLs
 *
 * Full SEO long-form California guide content previously lived here; the
 * evaluation LP pattern is now the shared TX/CA standard. Run before seo-build.
 *
 * Run: node scripts/generate-california-adhd-cornerstone.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TX = path.join(ROOT, 'adhd-evaluation-texas.html');
const OUT = path.join(ROOT, 'adult-adhd-california.html');

const CA_CARE_TEAM = `
          <div class="about-team-grid about-team-grid--adhd about-team-grid--adhd-compact">
            <article class="about-team-card ds-provider-card" data-states="CA,TX,PA,FL">
              <img src="/assets/images/dr-sneh-pandey.png" alt="Dr. Sneh Pandey, MD" width="88" height="88" loading="lazy" />
              <h3><a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey, MD</a></h3>
              <p class="about-team-tagline">Medical Director · Adult ADHD evaluation &amp; care · CA, TX, PA, FL</p>
              <a class="text-link" href="/providers/dr-sneh-pandey">View profile →</a>
            </article>
            <article class="about-team-card ds-provider-card" data-states="CA,TX,PA,FL">
              <img src="/assets/images/wendy-delgado.png" alt="Wendy Delgado, PA-C" width="88" height="88" loading="lazy" />
              <h3><a href="/providers/wendy-delgado">Wendy Delgado, PA-C</a></h3>
              <p class="about-team-tagline">Adult ADHD evaluation &amp; ongoing telehealth care · CA, TX, PA, FL</p>
              <a class="text-link" href="/providers/wendy-delgado">View profile →</a>
            </article>
          </div>`;

function build() {
  let html = fs.readFileSync(TX, 'utf8');

  const replacements = [
    ['noindex, follow', 'index, follow'],
    [
      'Adult ADHD Evaluation in Texas | Same-Week Online Eval | Siya Health',
      'Adult ADHD Evaluation in California | Same-Week Online Eval | Siya Health',
    ],
    [
      'Physician-led adult ADHD evaluation online for Texas adults. $149 transparent pricing, same-week appointments, DSM-based assessment. Screening is not a diagnosis.',
      'Physician-led adult ADHD evaluation online for California adults. $149 transparent pricing, same-week appointments, DSM-based assessment. Screening is not a diagnosis.',
    ],
    ['https://siya.health/adhd-evaluation-texas', 'https://siya.health/adult-adhd-california'],
    ['Adult ADHD Evaluation in Texas | Siya Health', 'Adult ADHD Evaluation in California | Siya Health'],
    [
      'Physician-led adult ADHD evaluation online for Texas adults. $149 transparent pricing. Screening is not a diagnosis; medication never guaranteed.',
      'Physician-led adult ADHD evaluation online for California adults. $149 transparent pricing. Screening is not a diagnosis; medication never guaranteed.',
    ],
    [
      'Physician-led adult ADHD evaluation online for Texas adults. $149 transparent pricing.',
      'Physician-led adult ADHD evaluation online for California adults. $149 transparent pricing.',
    ],
    ['"name":"Adult ADHD Evaluation in Texas"', '"name":"Adult ADHD Evaluation in California"'],
    ['siya-landing-page--tx-evaluation', 'siya-landing-page--ca-evaluation'],
    ['google-ads-tx-evaluation', 'google-ads-ca-evaluation'],
    ['aria-label="Texas ADHD evaluation"', 'aria-label="California ADHD evaluation"'],
    ['<!-- HERO: same structure/classes as /adhd-care (Texas copy only) -->', '<!-- HERO: same structure/classes as /adhd-evaluation-texas (California copy) -->'],
    [
      'Adult ADHD Evaluation &amp; Testing · Texas',
      'Adult ADHD Evaluation &amp; Testing · California',
    ],
    ['Virtual ADHD care in <strong>Texas</strong>', 'Virtual ADHD care in <strong>California</strong>'],
    ['within 48 hours across Texas.', 'within 48 hours across California.'],
    ['faq-tx-eval-', 'faq-ca-eval-'],
    ['Showing clinicians licensed in <strong>TX</strong>.', 'Showing clinicians licensed in <strong>CA</strong>.'],
    [
      'eligible adults in Texas and other licensed states',
      'eligible adults in California and other licensed states',
    ],
  ];

  for (const [from, to] of replacements) {
    if (!html.includes(from)) {
      console.warn('CA generator: expected string missing:', from.slice(0, 72));
    }
    html = html.split(from).join(to);
  }

  html = html.replace(
    /<div class="about-team-grid about-team-grid--adhd about-team-grid--adhd-compact">[\s\S]*?<\/div>\s*(?=<p class="blog-hub-see-all">)/,
    `${CA_CARE_TEAM}\n          `,
  );

  if (html.includes('<strong>Texas</strong>') || /href="https:\/\/siya\.health\/adhd-evaluation-texas"/.test(html)) {
    throw new Error('CA generator left Texas patient-facing strings behind');
  }
  if (html.includes('dr-natasha-desai')) {
    throw new Error('CA generator still includes TX-only Desai card');
  }

  fs.writeFileSync(OUT, html);
  console.log('Wrote adult-adhd-california.html (lean CA twin of adhd-evaluation-texas)');
}

build();
