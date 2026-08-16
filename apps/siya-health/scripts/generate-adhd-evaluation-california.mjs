/**
 * Generates /adhd-evaluation-california — lean Google Ads evaluation LP.
 *
 * Twin of /adhd-evaluation-texas (same chrome, CA copy). Care-team cards are
 * NOT hardcoded here — site-chrome injectMeetPhysiciansSection fills
 * SIYA:MEET-PHYSICIANS from provider-canonical + SERVICE_PROVIDER_SLUGS
 * (adhd-care, state=CA) during seo-build.
 *
 * Does NOT write /adult-adhd-california — that URL is the SEO entity hub owned by
 * generate-california-adhd-cornerstone.mjs. Keeping these paths separate stops
 * Ads ↔ SEO overwrites on every Vercel build.
 *
 * Run: node scripts/generate-adhd-evaluation-california.mjs
 * Invoked from package.json build after the CA cornerstone generator.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TX = path.join(ROOT, 'adhd-evaluation-texas.html');
const OUT = path.join(ROOT, 'adhd-evaluation-california.html');
const FORBIDDEN = path.join(ROOT, 'adult-adhd-california.html');

if (path.resolve(OUT) === path.resolve(FORBIDDEN)) {
  throw new Error('Refuse to write ads LP onto /adult-adhd-california (SEO hub).');
}

/** Placeholder only — real cards injected by site-chrome from canonical SoT. */
const MEET_PHYSICIANS_STUB = `<!-- SIYA:MEET-PHYSICIANS -->
      <!-- Filled at build by site-chrome from provider-canonical + SERVICE_PROVIDER_SLUGS (adhd-care, CA). Do not hardcode cards here. -->
      <!-- /SIYA:MEET-PHYSICIANS -->`;

function build() {
  if (!fs.existsSync(TX)) {
    throw new Error(`Missing TX template: ${TX}`);
  }
  let html = fs.readFileSync(TX, 'utf8');

  const replacements = [
    ['noindex, follow', 'noindex, follow'],
    [
      'Adult ADHD Evaluation in Texas | Same-Week Online Eval | Siya Health',
      'Adult ADHD Evaluation in California | Same-Week Online Eval | Siya Health',
    ],
    [
      'Physician-led adult ADHD evaluation online for Texas adults. $149 transparent pricing, same-week appointments, DSM-based assessment. Screening is not a diagnosis.',
      'Physician-led adult ADHD evaluation online for California adults. $149 transparent pricing, same-week appointments, DSM-based assessment. Screening is not a diagnosis.',
    ],
    ['https://siya.health/adhd-evaluation-texas', 'https://siya.health/adhd-evaluation-california'],
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
    [
      '<!-- HERO: same structure/classes as /adhd-care (Texas copy only) -->',
      '<!-- HERO: same structure/classes as /adhd-evaluation-texas (California copy) -->',
    ],
    ['Adult ADHD Evaluation &amp; Testing · Texas', 'Adult ADHD Evaluation &amp; Testing · California'],
    ['Virtual ADHD care in <strong>Texas</strong>', 'Virtual ADHD care in <strong>California</strong>'],
    ['within 48 hours across Texas.', 'within 48 hours across California.'],
    ['faq-tx-eval-', 'faq-ca-eval-'],
    [
      'eligible adults in Texas and other licensed states',
      'eligible adults in California and other licensed states',
    ],
  ];

  for (const [from, to] of replacements) {
    if (from === to) continue;
    if (!html.includes(from)) {
      console.warn(`WARN: expected TX string missing: ${from.slice(0, 80)}`);
    }
    html = html.split(from).join(to);
  }

  // Always replace care-team region with stub (never hardcode CA_CARE_TEAM)
  if (!html.includes('SIYA:MEET-PHYSICIANS')) {
    throw new Error('TX template missing SIYA:MEET-PHYSICIANS markers');
  }
  html = html.replace(
    /<!-- SIYA:MEET-PHYSICIANS -->[\s\S]*?<!-- \/SIYA:MEET-PHYSICIANS -->/,
    MEET_PHYSICIANS_STUB,
  );

  if (!html.includes('google-ads-ca-evaluation')) {
    throw new Error('CA evaluation landing attribute missing after replacements');
  }
  if (html.includes('nav-center') || /<header class="site-header/.test(html)) {
    throw new Error('Ads LP must not include full site header/nav');
  }
  if (/rel="canonical"[^>]+adhd-evaluation-texas/.test(html)) {
    throw new Error('Canonical still points at Texas');
  }
  // Hardcoded provider cards must not sneak back in before chrome inject
  if (/about-team-card/.test(html)) {
    throw new Error('CA ads LP must not hardcode about-team-card (use site-chrome injection)');
  }

  fs.writeFileSync(OUT, html);
  console.log(
    `Wrote ${path.relative(ROOT, OUT)} (lean CA ads LP; care team via site-chrome @ seo-build; SEO hub untouched)`,
  );
}

build();
