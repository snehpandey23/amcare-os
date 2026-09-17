/**
 * California employer pilot pitch — outbound page for HR / benefits buyers.
 * Content locked to founder-supplied facts + approved clinical-scope additions.
 * Tool UIs: illustrative SVG mockups only (no live-account screenshots / PHI risk).
 * Provider photos: local assets only (never Klarity hotlinks).
 * noindex — placeholder employer name.
 * Run before seo-build: node scripts/generate-employer-ca-pilot-pitch.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'employers');
const OUT = path.join(OUT_DIR, 'california-pilot.html');

const CANONICAL = 'https://siya.health/employers/california-pilot';
const TITLE = 'California Employer Pilot | Siya Health';
const DESCRIPTION =
  'Dedicated concierge primary care and ADHD/psychiatric management for California employer pilots—physician-supervised care team, fixed pricing, zero cost to employees.';

/** Visible replace token — do not invent a client name. */
const EMPLOYER_NAME = '[Employer Name]';

/**
 * Founder-confirmed framing (MBBS 2013 → residency 2015–2018):
 * 12 years of experience treating patients.
 */
const DR_PANDEY_EXPERIENCE = '12 years of experience treating patients';

/** Local assets only — already in repo; do not hotlink Klarity. */
const PHOTO_SNEH = '/assets/images/dr-sneh-pandey.png';
const PHOTO_WENDY = '/assets/images/wendy-delgado.png';

const CTA_HREF = '/employers#employer-inquiry-form';
const CTA_LABEL = "Let's talk";

/**
 * Standing post–Month 1 price — LOCKED 2026-09-17 at $100/employee/month.
 * Founder-confirmed from staffing-cost margin model. Do not change without a new cost model.
 * ($75 drafts are obsolete; do not reopen that debate.)
 */
const POST_PILOT_PRICE = 100;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ctaButton(location) {
  return `<a class="button ds-button ds-button--accent" href="${CTA_HREF}" data-siya-track="employer_inquiry_click" data-siya-location="${location}" data-page-type="employer" data-intent="employer" data-conversion-goal="bookDemo" data-cta-slot="bookDemo" data-component="button">${esc(CTA_LABEL)}</a>`;
}

/** Clinical care flow — inline SVG (navy structure + champagne accent on step 1). */
function careFlowSvg() {
  return `<figure class="employer-pitch-flow" aria-labelledby="care-flow-heading">
            <svg class="employer-pitch-flow-svg" viewBox="0 0 960 160" role="img" aria-label="Care flow: Intake and Cognitive Baseline, Provider Evaluation, Personalized Care Plan, Ongoing Management and Check-ins">
              <title>Clinical care flow</title>
              <!-- connectors -->
              <line x1="210" y1="56" x2="250" y2="56" stroke="#C4A574" stroke-width="2" />
              <line x1="450" y1="56" x2="490" y2="56" stroke="#C4A574" stroke-width="2" />
              <line x1="690" y1="56" x2="730" y2="56" stroke="#C4A574" stroke-width="2" />
              <!-- step 1 active accent -->
              <rect x="16" y="16" width="190" height="80" rx="10" fill="#ffffff" stroke="#C4A574" stroke-width="2.5" />
              <circle cx="48" cy="56" r="16" fill="url(#pitchFlowGrad)" />
              <text x="48" y="61" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">1</text>
              <text x="74" y="48" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Intake &amp;</text>
              <text x="74" y="66" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Cognitive Baseline</text>
              <!-- step 2 -->
              <rect x="256" y="16" width="190" height="80" rx="10" fill="#ffffff" stroke="#001878" stroke-width="1.5" />
              <circle cx="288" cy="56" r="16" fill="#001878" />
              <text x="288" y="61" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">2</text>
              <text x="314" y="48" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Provider</text>
              <text x="314" y="66" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Evaluation</text>
              <!-- step 3 -->
              <rect x="496" y="16" width="190" height="80" rx="10" fill="#ffffff" stroke="#001878" stroke-width="1.5" />
              <circle cx="528" cy="56" r="16" fill="#001878" />
              <text x="528" y="61" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">3</text>
              <text x="554" y="48" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Personalized</text>
              <text x="554" y="66" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Care Plan</text>
              <!-- step 4 -->
              <rect x="736" y="16" width="208" height="80" rx="10" fill="#ffffff" stroke="#001878" stroke-width="1.5" />
              <circle cx="768" cy="56" r="16" fill="#001878" />
              <text x="768" y="61" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">4</text>
              <text x="794" y="48" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Ongoing Management</text>
              <text x="794" y="66" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">&amp; Check-ins</text>
              <defs>
                <linearGradient id="pitchFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#D81088" />
                  <stop offset="28%" stop-color="#C32889" />
                  <stop offset="68%" stop-color="#87218B" />
                  <stop offset="100%" stop-color="#642EAE" />
                </linearGradient>
              </defs>
            </svg>
            <figcaption class="employer-pitch-flow-caption">Intake and scheduled visits set the plan; day-to-day check-ins usually happen in Spruce (message, photo, or video) — not only through new appointment slots.</figcaption>
          </figure>`;
}

/**
 * Illustrative Spruce-class care coordination UI — fully staged fake demo.
 * Never use a real account screenshot (even cropped). PHI-safe: fake name, fake copy,
 * generic diagram (not a real patient photo).
 */
function spruceMockSvg() {
  return `<svg class="employer-pitch-tool-svg" viewBox="0 0 420 300" role="img" aria-label="Illustrative care coordination mockup with messaging, photo share, and video call">
              <title>Illustrative Spruce-class care coordination UI</title>
              <rect width="420" height="300" rx="12" fill="#F4EFE7" stroke="#ebe5d6" />
              <rect x="0" y="0" width="420" height="40" rx="12" fill="#001878" />
              <rect x="0" y="28" width="420" height="12" fill="#001878" />
              <text x="16" y="26" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600">Care team chat (demo)</text>
              <!-- thread -->
              <rect x="12" y="52" width="250" height="210" rx="8" fill="#ffffff" stroke="#ebe5d6" />
              <text x="24" y="74" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="11" font-weight="700">Jordan Lee (demo patient)</text>
              <text x="24" y="90" fill="#57534e" font-family="Inter, Arial, sans-serif" font-size="9">Fake name · staged thread · not a real account</text>
              <rect x="24" y="104" width="200" height="36" rx="8" fill="#F4EFE7" />
              <text x="34" y="120" fill="#001878" font-family="Inter, Arial, sans-serif" font-size="10">Hi — can I share a photo of a</text>
              <text x="34" y="134" fill="#001878" font-family="Inter, Arial, sans-serif" font-size="10">rash on my arm?</text>
              <rect x="48" y="150" width="190" height="52" rx="8" fill="#F4EFE7" stroke="#C4A574" />
              <!-- generic medical reference diagram (not a photo) -->
              <ellipse cx="78" cy="176" rx="18" ry="14" fill="none" stroke="#001878" stroke-width="1.5" />
              <circle cx="78" cy="176" r="6" fill="#C4A574" opacity="0.55" />
              <text x="104" y="172" fill="#001878" font-family="Inter, Arial, sans-serif" font-size="9" font-weight="600">Demo reference image</text>
              <text x="104" y="186" fill="#57534e" font-family="Inter, Arial, sans-serif" font-size="8">(diagram only · not a photo)</text>
              <rect x="24" y="212" width="210" height="28" rx="8" fill="url(#spruceGrad)" opacity="0.92" />
              <text x="34" y="230" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="600">Provider: Thanks — we&apos;ll review today.</text>
              <rect x="24" y="248" width="150" height="22" rx="6" fill="#ffffff" stroke="#C4A574" />
              <text x="34" y="263" fill="#001878" font-family="Inter, Arial, sans-serif" font-size="9" font-weight="600">+ Attach photo / video</text>
              <!-- video panel -->
              <rect x="274" y="52" width="134" height="210" rx="8" fill="#001878" />
              <text x="286" y="74" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="600">Video visit</text>
              <circle cx="341" cy="130" r="28" fill="#0A246B" />
              <circle cx="341" cy="122" r="10" fill="#C4A574" opacity="0.7" />
              <ellipse cx="341" cy="148" rx="16" ry="10" fill="#C4A574" opacity="0.45" />
              <text x="300" y="188" fill="#F4EFE7" font-family="Inter, Arial, sans-serif" font-size="9">Demo · not live</text>
              <rect x="292" y="204" width="98" height="24" rx="12" fill="url(#spruceGrad)" />
              <text x="308" y="220" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="10" font-weight="600">Join call</text>
              <text x="16" y="288" fill="#57534e" font-family="Inter, Arial, sans-serif" font-size="10">Illustrative mockup — no real patient data</text>
              <defs>
                <linearGradient id="spruceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#D81088" />
                  <stop offset="100%" stop-color="#642EAE" />
                </linearGradient>
              </defs>
            </svg>`;
}

/** Illustrative CarePatron-class backend UI — scheduling / notes / billing chrome only. */
function carePatronMockSvg() {
  return `<svg class="employer-pitch-tool-svg" viewBox="0 0 420 260" role="img" aria-label="Illustrative scheduling and documentation backend mockup">
              <title>Illustrative CarePatron-class scheduling and documentation UI</title>
              <rect width="420" height="260" rx="12" fill="#F4EFE7" stroke="#ebe5d6" />
              <rect x="0" y="0" width="420" height="40" rx="12" fill="#001878" />
              <rect x="0" y="28" width="420" height="12" fill="#001878" />
              <text x="16" y="26" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600">Scheduling &amp; charting (provider)</text>
              <rect x="16" y="56" width="120" height="168" rx="8" fill="#ffffff" stroke="#ebe5d6" />
              <rect x="28" y="72" width="96" height="10" rx="3" fill="#C4A574" opacity="0.55" />
              <rect x="28" y="96" width="88" height="8" rx="3" fill="#ebe5d6" />
              <rect x="28" y="116" width="88" height="8" rx="3" fill="#ebe5d6" />
              <rect x="28" y="136" width="88" height="8" rx="3" fill="#ebe5d6" />
              <text x="28" y="168" fill="#57534e" font-family="Inter, Arial, sans-serif" font-size="9">Book · notes · billing</text>
              <rect x="152" y="56" width="252" height="168" rx="8" fill="#ffffff" stroke="#ebe5d6" />
              <text x="168" y="80" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="12" font-weight="700">Week view</text>
              <rect x="168" y="96" width="64" height="36" rx="6" fill="#F4EFE7" stroke="#C4A574" />
              <rect x="244" y="96" width="64" height="36" rx="6" fill="#F4EFE7" stroke="#ebe5d6" />
              <rect x="320" y="96" width="64" height="36" rx="6" fill="#F4EFE7" stroke="#ebe5d6" />
              <rect x="168" y="144" width="216" height="28" rx="6" fill="url(#carePatronGrad)" opacity="0.85" />
              <text x="180" y="163" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="600">Scheduled visit slot</text>
              <rect x="168" y="184" width="160" height="22" rx="6" fill="#F4EFE7" stroke="#ebe5d6" />
              <text x="178" y="199" fill="#57534e" font-family="Inter, Arial, sans-serif" font-size="9">AI scribe / note tools (demo)</text>
              <text x="16" y="248" fill="#57534e" font-family="Inter, Arial, sans-serif" font-size="10">Illustrative mockup — no real patient data</text>
              <defs>
                <linearGradient id="carePatronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#D81088" />
                  <stop offset="100%" stop-color="#642EAE" />
                </linearGradient>
              </defs>
            </svg>`;
}

/** Illustrative cognitive testing UI — not a live Creyos screenshot. */
function creyosMockSvg() {
  return `<svg class="employer-pitch-tool-svg" viewBox="0 0 420 260" role="img" aria-label="Illustrative cognitive testing interface mockup">
              <title>Illustrative cognitive testing UI</title>
              <rect width="420" height="260" rx="12" fill="#F4EFE7" stroke="#ebe5d6" />
              <rect x="0" y="0" width="420" height="40" rx="12" fill="#001878" />
              <rect x="0" y="28" width="420" height="12" fill="#001878" />
              <text x="16" y="26" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600">Cognitive testing</text>
              <rect x="16" y="56" width="388" height="48" rx="8" fill="#ffffff" stroke="#ebe5d6" />
              <text x="28" y="78" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="12" font-weight="700">Task battery</text>
              <text x="28" y="94" fill="#57534e" font-family="Inter, Arial, sans-serif" font-size="11">Attention · memory · executive function (illustrative labels)</text>
              <rect x="16" y="116" width="188" height="100" rx="8" fill="#ffffff" stroke="#C4A574" stroke-width="1.5" />
              <circle cx="110" cy="156" r="28" fill="none" stroke="#001878" stroke-width="3" />
              <circle cx="110" cy="156" r="12" fill="#C4A574" opacity="0.7" />
              <text x="56" y="204" fill="#001878" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="600">Sample task panel</text>
              <rect x="216" y="116" width="188" height="100" rx="8" fill="#ffffff" stroke="#ebe5d6" />
              <rect x="232" y="136" width="156" height="10" rx="3" fill="#ebe5d6" />
              <rect x="232" y="156" width="120" height="10" rx="3" fill="#ebe5d6" />
              <rect x="232" y="176" width="140" height="10" rx="3" fill="#C4A574" opacity="0.45" />
              <text x="16" y="252" fill="#57534e" font-family="Inter, Arial, sans-serif" font-size="10">Illustrative mockup — no real patient data</text>
            </svg>`;
}

for (const rel of [PHOTO_SNEH, PHOTO_WENDY]) {
  const abs = path.join(ROOT, rel.replace(/^\//, ''));
  if (!fs.existsSync(abs)) {
    console.warn(`WARNING: missing local photo ${rel} — page will reference it anyway`);
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${esc(TITLE)}</title>
    <meta name="description" content="${esc(DESCRIPTION)}" />
    <link rel="canonical" href="${CANONICAL}" />
    <meta property="og:title" content="${esc(TITLE)}" />
    <meta property="og:description" content="${esc(DESCRIPTION)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${CANONICAL}" />
    <meta property="og:image" content="https://siya.health/assets/images/siya-health-logo.png" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
  </head>
  <body class="page-employer-pitch page-service">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header employer-pitch-header">
      <div class="container employer-pitch-header-inner">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">&reg;</sup></span>
        </a>
        <div class="employer-pitch-header-actions">
          <p class="employer-pitch-eyebrow">California employer pilot</p>
          <a class="employer-pitch-header-link" href="${CTA_HREF}" data-siya-track="employer_inquiry_click" data-siya-location="ca-pilot-header" data-page-type="employer" data-intent="employer">Let&rsquo;s talk</a>
        </div>
      </div>
    </header>

    <main id="main" class="employer-pitch">
      <section class="employer-pitch-section employer-pitch-hero" aria-labelledby="pitch-hero-heading">
        <div class="container">
          <h1 id="pitch-hero-heading">One Care Team. Your Whole Team.</h1>
          <p class="employer-pitch-kicker employer-pitch-kicker--support">For <span class="employer-pitch-token">${esc(EMPLOYER_NAME)}</span> in California — dedicated care, not a network referral</p>
          <div class="employer-pitch-accent-rule" aria-hidden="true"></div>
          <p class="employer-pitch-lead">Your California employees get a doctor and provider who actually know them — for everyday health, ADHD, mental health, hormones, and more. No juggling five apps. No cost to them, ever.</p>
          <ul class="employer-pitch-hero-hooks" aria-label="Pilot highlights">
            <li><strong>Month 1:</strong> $50 per employee — just to see if it&rsquo;s a fit</li>
            <li><strong>If you continue:</strong> $${POST_PILOT_PRICE} per employee each month</li>
            <li><strong>Small by design:</strong> each care team stays around 500–600 people, so visits don&rsquo;t turn into a rush</li>
            <li><strong>California-licensed</strong> providers on your team — not a rotating clinic list</li>
          </ul>
          <div class="employer-pitch-cta-row">
            ${ctaButton('ca-pilot-hero')}
            <a class="button ds-button ds-button--secondary secondary" href="#difference" data-siya-location="ca-pilot-hero-secondary" data-page-type="employer" data-intent="employer" data-component="button">See how we compare</a>
          </div>
          <p class="employer-pitch-micro">Just a conversation to start. This page isn&rsquo;t for individual patient booking.</p>
        </div>
      </section>

      <section class="employer-pitch-section" id="difference" aria-labelledby="difference-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="difference-heading">Access isn&rsquo;t the same as having your doctor</h2>
            <p class="employer-pitch-section-lead">Access to a doctor isn&rsquo;t the same as having your doctor. When someone&rsquo;s struggling with focus, sleep, or stress, what actually helps is a care team that knows their history — not another portal to log into.</p>
          </header>
          <div class="employer-pitch-compare">
            <article class="employer-pitch-compare-card">
              <h3>Traditional primary care</h3>
              <ul>
                <li>2,000–3,000 patients per physician</li>
                <li>~3-week appointment backlogs</li>
                <li>~8-minute visits</li>
              </ul>
            </article>
            <article class="employer-pitch-compare-card">
              <h3>MDVIP <span class="employer-pitch-card-note">(leading concierge network)</span></h3>
              <ul>
                <li>$2,600–$3,250/year for access alone</li>
                <li>No ADHD/psychiatric management</li>
                <li>No cognitive testing</li>
              </ul>
            </article>
            <article class="employer-pitch-compare-card employer-pitch-compare-card--highlight">
              <p class="employer-pitch-card-badge">Siya Health for ${esc(EMPLOYER_NAME)}</p>
              <h3>Your dedicated care team</h3>
              <ul>
                <li>$${POST_PILOT_PRICE}/employee/month after Month 1</li>
                <li>Primary care + ADHD/psychiatric management + objective cognitive testing — in one relationship</li>
                <li>Each care team stays around 500–600 people</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="pricing" aria-labelledby="pricing-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="pricing-heading">Try it first.</h2>
            <p class="employer-pitch-section-lead">Month 1 is $50 per employee — genuinely just to see if it&rsquo;s a fit. If it is, we settle into $${POST_PILOT_PRICE}/employee/month going forward. No surprises, no renegotiation, just a fair next step if you want to keep going.</p>
          </header>
          <div class="employer-pitch-pricing">
            <div class="employer-pitch-price-card employer-pitch-price-card--pilot">
              <p class="employer-pitch-price-label">Month 1</p>
              <p class="employer-pitch-price"><span class="employer-pitch-price-amount">$50</span><span class="employer-pitch-price-unit">/employee/month</span></p>
              <p class="employer-pitch-price-note">A real try-out for ${esc(EMPLOYER_NAME)} — not a lock-in</p>
            </div>
            <div class="employer-pitch-price-card employer-pitch-price-card--continued">
              <p class="employer-pitch-price-label">If you continue</p>
              <p class="employer-pitch-price"><span class="employer-pitch-price-amount">$${POST_PILOT_PRICE}</span><span class="employer-pitch-price-unit">/employee/month</span></p>
              <p class="employer-pitch-price-note">Same clear number from Month 2 onward — no quiet renegotiation</p>
            </div>
          </div>
          <aside class="employer-pitch-scope" role="note">
            <p>This pilot is for your employees — we&rsquo;re keeping it simple to start. If it&rsquo;s a great fit, extending to spouses and family is a natural next conversation.</p>
          </aside>
        </div>
      </section>

      <section class="employer-pitch-section" id="included" aria-labelledby="included-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="included-heading">Everything, in one place.</h2>
            <p class="employer-pitch-section-lead">Primary care. ADHD and mental health support. Hormone and metabolic health. Real cognitive testing, not guesswork. One team, one relationship, one place to go.</p>
          </header>
          <ul class="employer-pitch-included">
            <li>Primary care</li>
            <li>ADHD/psychiatric diagnosis and management</li>
            <li>Objective cognitive testing</li>
            <li>Concierge navigation (pharmacy coordination, prior authorization, lab routing)</li>
            <li>Metabolic and weight management (including obesity medicine)</li>
            <li>Hormonal health evaluation and treatment</li>
            <li>General psychiatric care (depression, anxiety, sleep, stress-related conditions) beyond ADHD specifically</li>
          </ul>
          <aside class="employer-pitch-scope" role="note">
            <p>This pilot is for your employees — we&rsquo;re keeping it simple to start. If it&rsquo;s a great fit, extending to spouses and family is a natural next conversation.</p>
          </aside>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="care-flow" aria-labelledby="care-flow-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="care-flow-heading">What to expect.</h2>
            <p class="employer-pitch-section-lead">We start with intake and a cognitive baseline, then a formally scheduled visit to meet your provider and build a plan. After that, most day-to-day contact happens in <strong>Spruce</strong> — secure messaging, a quick photo or video of a concern, or a video call when you need face-to-face — so you can share what&rsquo;s going on and hear back the same day. A licensed provider still reviews and responds; this is fast communication, not automated diagnosis. <strong>CarePatron</strong> stays the backend for booking, notes, and billing on those scheduled visits.</p>
          </header>
${careFlowSvg()}
        </div>
      </section>

      <section class="employer-pitch-section" id="access" aria-labelledby="access-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="access-heading">How your people get in</h2>
            <p class="employer-pitch-section-lead">Simple for HR. Easy for employees. And it&rsquo;s <strong>always free for them</strong>.</p>
          </header>
          <ol class="employer-pitch-access">
            <li>Employer-branded login</li>
            <li>Verified against employer roster</li>
            <li>Book scheduled visits with your dedicated provider team; message the team in Spruce between visits</li>
            <li>Zero cost to the employee</li>
          </ol>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="tools" aria-labelledby="tools-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="tools-heading">How you actually reach your care team</h2>
            <p class="employer-pitch-section-lead"><strong>Spruce</strong> is the day-to-day care coordination channel patients use — secure messaging, photo/video of a concern, and video visits when needed. <strong>CarePatron</strong> is the scheduling, billing, and clinical documentation backend (including AI scribe tools for providers). <strong>Creyos</strong> supports objective cognitive testing. Panels below are <strong>fully staged illustrative mockups</strong> — fake names and copy only — not live account screenshots.</p>
          </header>
          <div class="employer-pitch-tools employer-pitch-tools--three">
            <figure class="employer-pitch-tool-card employer-pitch-tool-card--primary">
              ${spruceMockSvg()}
              <figcaption>
                <strong>Spruce — primary patient experience</strong>
                <span>Share what&rsquo;s going on (message, attach a photo of a rash or concern, or join video) and hear back the same day from a licensed provider. Illustrative mockup — no real patient data.</span>
              </figcaption>
            </figure>
            <figure class="employer-pitch-tool-card">
              ${carePatronMockSvg()}
              <figcaption>
                <strong>CarePatron — scheduling &amp; documentation backend</strong>
                <span>Booking, notes, billing, and provider workflow — not the primary day-to-day patient chat surface. Illustrative mockup — no real patient data.</span>
              </figcaption>
            </figure>
            <figure class="employer-pitch-tool-card">
              ${creyosMockSvg()}
              <figcaption>
                <strong>Creyos — cognitive testing</strong>
                <span>Objective attention, memory, and executive-function batteries at baseline and follow-up. Illustrative mockup — no real patient data.</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section class="employer-pitch-section" id="care-team" aria-labelledby="care-team-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="care-team-heading">Meet the people behind your care</h2>
            <p class="employer-pitch-section-lead">Your employees will know who they&rsquo;re talking to. You&rsquo;ll know who&rsquo;s accountable.</p>
          </header>
          <div class="employer-pitch-team">
            <article class="employer-pitch-provider">
              <div class="employer-pitch-provider-media">
                <picture>
                  <source srcset="/assets/images/dr-sneh-pandey-176.webp" type="image/webp" />
                  <img src="/assets/images/dr-sneh-pandey-176.png" alt="Dr. Sneh Pandey, MD" width="160" height="160" loading="lazy" decoding="async" />
                </picture>
              </div>
              <div class="employer-pitch-provider-body">
                <h3>Dr. Sneh Pandey, MD</h3>
                <p class="employer-pitch-role">Internal Medicine &amp; Obesity Medicine (Board Certified, American Board of Obesity Medicine)</p>
                <ul class="employer-pitch-creds">
                  <li>${esc(DR_PANDEY_EXPERIENCE)}</li>
                  <li>4.72 rating (296 verified patient reviews)</li>
                  <li>Licensed in California, Texas, Pennsylvania, Florida</li>
                  <li>Residency: University of Pittsburgh Medical Center</li>
                  <li>Medical degree: Maulana Azad Medical College</li>
                </ul>
              </div>
            </article>
            <article class="employer-pitch-provider">
              <div class="employer-pitch-provider-media">
                <img src="${PHOTO_WENDY}" alt="Wendy Delgado, PA-C" width="160" height="160" loading="lazy" decoding="async" />
              </div>
              <div class="employer-pitch-provider-body">
                <h3>Wendy Delgado, PA-C</h3>
                <p class="employer-pitch-role">Specializes in psychiatric/mental health and ADHD management alongside general primary care</p>
                <ul class="employer-pitch-creds">
                  <li>17 years of clinical experience</li>
                  <li>4.89 rating (52 verified patient reviews)</li>
                  <li>Multi-state licensed including California</li>
                </ul>
              </div>
            </article>
          </div>
          <aside class="employer-pitch-supervision" aria-label="Supervision structure">
            <p><strong>How it works day to day:</strong> Wendy is usually your team&rsquo;s first stop for scheduled care (Mon–Fri, 10am–6pm). Dr. Pandey supervises, and he&rsquo;s there for complex cases, urgent escalations, and evenings or weekends when someone needs him.</p>
          </aside>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="sample-journey" aria-labelledby="sample-journey-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="sample-journey-heading">A Typical Care Journey</h2>
            <p class="employer-pitch-illustrative-note" role="note"><strong>Illustrative example — not an individual patient&rsquo;s story.</strong> This narrative is a composite walkthrough for employers. It is separate from the verified, attributed patient reviews below.</p>
          </header>
          <ol class="employer-pitch-journey">
            <li>
              <strong>First login &amp; scheduled onboarding</strong>
              <p>Someone on your team signs in through the employer-branded login, gets verified against your roster, and books an initial visit in CarePatron with your dedicated providers — at zero cost to them.</p>
            </li>
            <li>
              <strong>Intake &amp; cognitive baseline</strong>
              <p>They complete a real intake and objective cognitive testing (Creyos), so the first visit starts with a clear baseline — not guesswork from a rushed chat.</p>
            </li>
            <li>
              <strong>Provider evaluation &amp; plan</strong>
              <p>They meet the care team in a formally scheduled visit (usually Wendy, with Dr. Pandey supervising and available when things get complex). Together they build a plan that can include primary care, ADHD/mental health support, metabolic or hormonal work, and a sensible follow-up rhythm.</p>
            </li>
            <li>
              <strong>Ongoing management via Spruce</strong>
              <p>Most day-to-day contact happens in Spruce — messaging, a quick photo-based check-in, or video when needed — so people can share what&rsquo;s going on and hear back the same day from a licensed provider (not an automated diagnosis). CarePatron remains for later scheduled visits, notes, and billing. Concierge still helps with pharmacy, prior auth, and labs so the plan doesn&rsquo;t stall.</p>
            </li>
          </ol>
        </div>
      </section>

      <section class="employer-pitch-section" id="reviews" aria-labelledby="reviews-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="reviews-heading">What patients say about this team</h2>
            <p class="employer-pitch-section-lead">These are real, attributed reviews for the providers who&rsquo;d care for ${esc(EMPLOYER_NAME)} employees — not a platform-wide average, and not the illustrative journey above.</p>
          </header>
          <div class="employer-pitch-reviews">
            <blockquote class="employer-pitch-quote">
              <p>&ldquo;Dr. S. P. Pandey was thorough, professional, and took time to address all my questions without making me feel rushed. He explained everything clearly and made sure I understood my health status and any recommendations. The examination was comprehensive, and I felt confident in his expertise&hellip; I&rsquo;ll definitely be returning and would recommend Dr. S. P. Pandey to anyone looking for quality healthcare.&rdquo;</p>
              <footer>— Patient review for <cite>Dr. Sneh Pandey, MD</cite></footer>
            </blockquote>
            <blockquote class="employer-pitch-quote">
              <p>&ldquo;My experience with Wendy Delgado, PA was excellent. She was knowledgeable, respectful, and genuinely attentive throughout the appointment. She took the time to understand my concerns, provided clear explanations, and ensured I felt comfortable with every step of my care. I would highly recommend her to anyone seeking high-quality, patient-centered care.&rdquo;</p>
              <footer>— Patient review for <cite>Wendy Delgado, PA-C</cite></footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="coverage" aria-labelledby="coverage-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="coverage-heading">We&rsquo;ll always tell you the truth about availability.</h2>
            <p class="employer-pitch-section-lead">Wendy&rsquo;s your go-to, weekdays 10–6. Evenings, weekends, and anything urgent — Dr. Pandey&rsquo;s got you, usually within 2 hours. We&rsquo;re a small, dedicated team, which means real relationships — and also means that, very occasionally, someone might be out sick just like anywhere else. We&rsquo;d rather tell you that upfront than pretend otherwise.</p>
          </header>
          <div class="employer-pitch-coverage">
            <ul>
              <li>Concierge team response within 30 minutes</li>
              <li>Provider response to escalations within 24 hours</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-close" id="next-step" aria-labelledby="next-step-heading">
        <div class="container">
          <h2 id="next-step-heading">Let&rsquo;s talk.</h2>
          <p class="employer-pitch-lead">Tell us a bit about your team in California, and we&rsquo;ll figure out together if a pilot makes sense. No pressure, just a conversation.</p>
          <div class="employer-pitch-cta-row">
            ${ctaButton('ca-pilot-close')}
          </div>
          <p class="employer-pitch-foot">Partnership information only—not medical advice. Emergency: call 911.</p>
        </div>
      </section>
    </main>

    <footer class="footer employer-pitch-footer">
      <div class="container">
        <p class="footer-legal-micro">Siya Health · California employer pilot · Replace <code>[Employer Name]</code> before sending to a prospect.</p>
      </div>
    </footer>
  </body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
