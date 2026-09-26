/**
 * California employer pilot — invitation-only prospect page.
 * Confirmed content only; unresolved items stay as [bracket] placeholders.
 * noindex · no vendor names · no competitor comparisons · no marketing pixels (site-chrome skip).
 * Run: node scripts/generate-employer-ca-pilot-pitch.mjs
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
  'California employer pilot with Siya Healthcare PC — dedicated care team, enrolled-employee pricing, and clear included vs separately billed services.';

/** Neutral fallback when no prospect name is set — never show [Employer Name]. */
const EMPLOYER_NAME = 'your team';

/** Contracting medical entity — confirmed. */
const LEGAL_ENTITY = 'Siya Healthcare PC';

const DR_PANDEY_EXPERIENCE = '12 years of experience treating patients';
const PHOTO_SNEH = '/assets/images/dr-sneh-pandey.png';
const PHOTO_WENDY = '/assets/images/wendy-delgado.png';

const CTA_HREF = '/employers#employer-inquiry-form';
const CTA_LABEL = "Let's talk";

/** Standard rate — locked; intro is $50 for first 1–2 months. */
const INTRO_PRICE = 50;
const STANDARD_PRICE = 100;

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

function careFlowSvg() {
  return `<figure class="employer-pitch-flow" aria-labelledby="care-flow-heading">
            <svg class="employer-pitch-flow-svg" viewBox="0 0 960 160" role="img" aria-label="Care flow: Intake and Cognitive Baseline, Provider Evaluation, Personalized Care Plan, Ongoing Management and Check-ins">
              <title>Clinical care flow</title>
              <line x1="210" y1="56" x2="250" y2="56" stroke="#C4A574" stroke-width="2" />
              <line x1="450" y1="56" x2="490" y2="56" stroke="#C4A574" stroke-width="2" />
              <line x1="690" y1="56" x2="730" y2="56" stroke="#C4A574" stroke-width="2" />
              <rect x="16" y="16" width="190" height="80" rx="10" fill="#ffffff" stroke="#C4A574" stroke-width="2.5" />
              <circle cx="48" cy="56" r="16" fill="url(#pitchFlowGrad)" />
              <text x="48" y="61" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">1</text>
              <text x="74" y="48" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Intake &amp;</text>
              <text x="74" y="66" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Cognitive Baseline</text>
              <rect x="256" y="16" width="190" height="80" rx="10" fill="#ffffff" stroke="#001878" stroke-width="1.5" />
              <circle cx="288" cy="56" r="16" fill="#001878" />
              <text x="288" y="61" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">2</text>
              <text x="314" y="48" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Provider</text>
              <text x="314" y="66" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Evaluation</text>
              <rect x="496" y="16" width="190" height="80" rx="10" fill="#ffffff" stroke="#001878" stroke-width="1.5" />
              <circle cx="528" cy="56" r="16" fill="#001878" />
              <text x="528" y="61" text-anchor="middle" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="700">3</text>
              <text x="554" y="48" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Personalized</text>
              <text x="554" y="66" fill="#001878" font-family="Poppins, Arial, sans-serif" font-size="13" font-weight="700">Care Plan</text>
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
            <figcaption class="employer-pitch-flow-caption">Intake and scheduled visits set the plan; day-to-day check-ins usually happen by message, photo, or video — not only through new appointment slots.</figcaption>
          </figure>`;
}

for (const rel of [PHOTO_SNEH, PHOTO_WENDY]) {
  const abs = path.join(ROOT, rel.replace(/^\//, ''));
  if (!fs.existsSync(abs)) {
    console.warn(`WARNING: missing local photo ${rel}`);
  }
}

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
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
          <p class="employer-pitch-lead">Your California employees get a doctor and care team who actually know them — for everyday health, ADHD, mental health, hormones, and more. No juggling five apps. Covered clinical visits are included for enrolled employees; medications, labs, and other extras are billed separately and disclosed before anything is ordered.</p>
          <ul class="employer-pitch-hero-hooks" aria-label="Pilot highlights">
            <li><strong>Introductory:</strong> $${INTRO_PRICE} per enrolled employee/month for the first 1–2 months</li>
            <li><strong>Standard:</strong> $${STANDARD_PRICE} per enrolled employee/month thereafter</li>
            <li><strong>Pilot term:</strong> 6 months, with checkpoint reviews at month 3 and month 6</li>
            <li><strong>California-licensed</strong> clinicians on your dedicated care team</li>
          </ul>
          <div class="employer-pitch-cta-row">
            ${ctaButton('ca-pilot-hero')}
          </div>
          <p class="employer-pitch-micro">Just a conversation to start. This page isn&rsquo;t for individual patient booking.</p>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="credibility" aria-labelledby="credibility-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="credibility-heading">Proof points</h2>
            <p class="employer-pitch-section-lead">Operational scale and published ratings (as of September 2026).</p>
          </header>
          <ul class="employer-pitch-included employer-pitch-proof">
            <li>2,700+ patients treated, 1,200+ clinical evaluations completed</li>
            <li>Averaging about 180 new patients and 200 returning patients every month (as of September 2026)</li>
            <li>Google: 4.90/5 average (88 reviews, as of September 2026)</li>
            <li>Klarity: 4.66/5 average across 589 provider reviews (as of September 2026)</li>
            <li>Concierge/care-management sessions have grown from 25/month to 50/month over the past quarter — an active care-management team already in place</li>
          </ul>
        </div>
      </section>

      <section class="employer-pitch-section" id="difference" aria-labelledby="difference-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="difference-heading">Access isn&rsquo;t the same as having your doctor</h2>
            <p class="employer-pitch-section-lead">Access to a doctor isn&rsquo;t the same as having your doctor. When someone&rsquo;s struggling with focus, sleep, or stress, what actually helps is a care team that knows their history — not another portal to log into.</p>
          </header>
          <div class="employer-pitch-compare employer-pitch-compare--solo">
            <article class="employer-pitch-compare-card employer-pitch-compare-card--highlight">
              <p class="employer-pitch-card-badge">Siya Health for ${esc(EMPLOYER_NAME)}</p>
              <h3>Your dedicated care team</h3>
              <ul>
                <li>$${STANDARD_PRICE}/enrolled employee/month after the introductory period</li>
                <li>Primary care + ADHD/psychiatric management + cognitive assessment — in one relationship</li>
                <li>Each care team stays around 500–600 people</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="included" aria-labelledby="included-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <p class="employer-pitch-section-label">Section 4</p>
            <h2 id="included-heading">What&rsquo;s included vs. billed separately</h2>
            <p class="employer-pitch-section-lead">Covered clinical care is included for enrolled employees at $0 to them. Other services are billed separately and disclosed before anything is ordered.</p>
          </header>
          <div class="employer-pitch-split">
            <div>
              <h3 class="employer-pitch-subhead">Included at $0 to employees</h3>
              <ul class="employer-pitch-included">
                <li>Primary care visits and follow-ups</li>
                <li>ADHD evaluation and ongoing management</li>
                <li>General psychiatric care (depression, anxiety, sleep, stress-related conditions)</li>
                <li>Cognitive assessment (baseline + follow-up, one input to clinician evaluation)</li>
                <li>Metabolic and weight management, including obesity medicine consultations</li>
                <li>Hormonal health evaluation and treatment (menopause, thyroid, diabetes, PCOS, low testosterone, and infertility)</li>
                <li>Secure messaging and care navigation</li>
                <li>Ongoing care management through our Medical Assistant team (concierge check-ins, monitoring, follow-up)</li>
              </ul>
            </div>
            <div>
              <h3 class="employer-pitch-subhead">Billed separately (disclosed before ordered)</h3>
              <ul class="employer-pitch-included employer-pitch-included--separate">
                <li>Prescription medications</li>
                <li>Laboratory services and additional/extra testing</li>
                <li>Specialist consultations and referrals</li>
                <li>In-person, urgent, and emergency care</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="employer-pitch-section" id="pricing" aria-labelledby="pricing-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <p class="employer-pitch-section-label">Section 5 · Pricing &amp; term</p>
            <h2 id="pricing-heading">Pricing (per enrolled employee)</h2>
            <p class="employer-pitch-section-lead">Billed per <strong>enrolled</strong> employee — not per eligible employee. Pilot term is 6 months, with checkpoint reviews at month 3 and month 6. If you continue after the pilot, the standard rate is held for 12 months.</p>
          </header>
          <div class="employer-pitch-pricing">
            <div class="employer-pitch-price-card employer-pitch-price-card--pilot">
              <p class="employer-pitch-price-label">Introductory (first 1–2 months)</p>
              <p class="employer-pitch-price"><span class="employer-pitch-price-amount">$${INTRO_PRICE}</span><span class="employer-pitch-price-unit">/enrolled employee/month</span></p>
              <p class="employer-pitch-price-note">A real try-out for ${esc(EMPLOYER_NAME)}</p>
            </div>
            <div class="employer-pitch-price-card employer-pitch-price-card--continued">
              <p class="employer-pitch-price-label">Standard rate</p>
              <p class="employer-pitch-price"><span class="employer-pitch-price-amount">$${STANDARD_PRICE}</span><span class="employer-pitch-price-unit">/enrolled employee/month</span></p>
              <p class="employer-pitch-price-note">Held for 12 months after the pilot if you continue</p>
            </div>
          </div>
          <div class="employer-pitch-term-sheet" id="term-sheet">
            <h3 class="employer-pitch-subhead">Term sheet summary</h3>
            <table class="employer-pitch-table">
              <caption class="visually-hidden">Pilot commercial terms</caption>
              <tbody>
                <tr>
                  <th scope="row">Part 3A — Billing unit</th>
                  <td>Per enrolled employee / month</td>
                </tr>
                <tr>
                  <th scope="row">Part 3B — Rates</th>
                  <td>$${INTRO_PRICE} introductory (months 1–2) · $${STANDARD_PRICE} standard thereafter · 12-month standard-rate lock if continued after pilot</td>
                </tr>
                <tr>
                  <th scope="row">Pilot term</th>
                  <td>6 months · checkpoint reviews at month 3 and month 6</td>
                </tr>
                <tr>
                  <th scope="row">Contracting entity</th>
                  <td>${esc(LEGAL_ENTITY)}</td>
                </tr>
                <tr>
                  <th scope="row">Insurance</th>
                  <td>Professional liability and cyber insurance coverage maintained — details available in our security packet upon request.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <aside class="employer-pitch-scope" role="note">
            <p>This pilot is for your employees — we&rsquo;re keeping it simple to start. If it&rsquo;s a great fit, extending to spouses and family is a natural next conversation.</p>
          </aside>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="care-flow" aria-labelledby="care-flow-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="care-flow-heading">What to expect</h2>
            <p class="employer-pitch-section-lead">We start with intake and a cognitive baseline, then a formally scheduled visit to meet your provider and build a plan. After that, most day-to-day contact happens via secure messaging, a quick photo or video of a concern, or a video call when needed — so you can share what&rsquo;s going on and hear back the same day. A licensed provider still reviews and responds; this is fast communication, not automated diagnosis.</p>
          </header>
${careFlowSvg()}
          <div class="employer-pitch-assessment" aria-labelledby="assessment-pathway-heading">
            <h3 id="assessment-pathway-heading" class="employer-pitch-subhead">How a diagnosis is reached</h3>
            <p class="employer-pitch-section-lead">This is the assessment pathway employers asked to see — how one symptom becomes a clear clinical picture, without implying a separate therapy network or automatic medication.</p>
            <ol class="employer-pitch-journey">
              <li>
                <strong>Cognitive baseline (when indicated)</strong>
                <p>Before or around the first visit, a structured cognitive assessment can set an objective baseline. It is one input to clinician judgment — not a standalone diagnosis and not a quiz that replaces evaluation.</p>
              </li>
              <li>
                <strong>Structured history across the whole picture</strong>
                <p>Licensed clinicians look at how focus, stress, sleep, weight, fatigue, and mood show up together over time — because those threads often connect. The goal is integrated understanding of what sits behind one complaint, not a handoff to five different apps.</p>
              </li>
              <li>
                <strong>Validated tools + records when they change the plan</strong>
                <p>Screeners such as ASRS, PHQ-9, or GAD-7, prior records, and labs are used when they may clarify the picture — not as a default test menu. Screening is not diagnosis.</p>
              </li>
              <li>
                <strong>Clinician diagnosis and plan</strong>
                <p>A licensed clinician synthesizes the inputs, explains findings in plain language, and builds a plan that can include primary care, ADHD/mental health support, metabolic or hormonal work, and a sensible follow-up rhythm. Medication is never guaranteed. If medication is part of your plan, we don’t rush it. Stimulant medication isn’t started at the first visit. You’ll review and sign a treatment agreement first, and care includes ongoing monitoring, including drug screening and pill counts when clinically indicated.</p>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section class="employer-pitch-section" id="access" aria-labelledby="access-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="access-heading">How your people get in</h2>
            <p class="employer-pitch-section-lead">Simple for HR. Easy for employees. Covered clinical visits in the base plan are <strong>$0 to enrolled employees</strong>; separately billed items are disclosed before ordered.</p>
          </header>
          <ol class="employer-pitch-access">
            <li>Employer-branded login</li>
            <li>Verified against employer roster</li>
            <li>Book scheduled visits with your dedicated care team; message between visits</li>
            <li>Covered visits included; extras disclosed before ordered</li>
          </ol>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="confidentiality" aria-labelledby="confidentiality-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <p class="employer-pitch-section-label">Section 7 · Confidentiality</p>
            <h2 id="confidentiality-heading">What employers see — and what they don&rsquo;t</h2>
            <p class="employer-pitch-section-lead">Employers receive de-identified, aggregate reports only, for groups of 10 or more employees. Never who enrolled, who visited, or why.</p>
          </header>
        </div>
      </section>

      <section class="employer-pitch-section" id="controlled-substance" aria-labelledby="controlled-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <p class="employer-pitch-section-label">Section 8</p>
            <h2 id="controlled-heading">Controlled-substance contingency</h2>
            <p class="employer-pitch-section-lead">When stimulant medication is clinically appropriate, we follow a structured safety process—not a one-visit prescription.</p>
          </header>
          <ul class="employer-pitch-included">
            <li>If medication is part of your plan, we don’t rush it. Stimulant medication isn’t started at the first visit. You’ll review and sign a treatment agreement first, and care includes ongoing monitoring, including drug screening and pill counts when clinically indicated.</li>
          </ul>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="care-team" aria-labelledby="care-team-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <p class="employer-pitch-section-label">Section 9 · Care capacity</p>
            <h2 id="care-team-heading">Staffed for continuity — not a rotating clinic list</h2>
            <p class="employer-pitch-section-lead">We describe capacity, not individual clinician marketing cards. Figures below match the operational snapshot already shown in Proof points (as of September 2026).</p>
          </header>
          <ul class="employer-pitch-included">
            <li><strong>2,700+</strong> patients treated · <strong>1,200+</strong> clinical evaluations completed</li>
            <li>About <strong>180</strong> new patients and <strong>200</strong> returning patients per month</li>
            <li>Each dedicated care team stays around <strong>500–600</strong> people — sized so someone can actually know the panel</li>
            <li>Concierge / care-management sessions grew from <strong>25/month to 50/month</strong> over the past quarter</li>
            <li>California-licensed clinicians on the dedicated employer panel; additional board-certified clinicians join as enrollment grows</li>
            <li>Day-to-day: a California-licensed advanced practice clinician is often the first stop for scheduled care (Mon–Fri, 10am–6pm), with physician supervision for complex cases and escalations</li>
          </ul>
        </div>
      </section>

      <section class="employer-pitch-section" id="response-times" aria-labelledby="response-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <p class="employer-pitch-section-label">Section 10 · Response times</p>
            <h2 id="response-heading">How quickly we respond</h2>
            <p class="employer-pitch-section-lead">Scheduling and non-urgent questions: concierge team responds within 1 hour during business hours.</p>
          </header>
          <p class="employer-pitch-section-lead">Emergency: call <strong>911</strong>. Mental health crisis: call or text <strong>988</strong>. Do not use this page or messaging for emergencies.</p>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="outcome-measures" aria-labelledby="outcome-measures-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <p class="employer-pitch-section-label">Section 11 · Outcome measures</p>
            <h2 id="outcome-measures-heading">How we track clinical progress</h2>
            <p class="employer-pitch-section-lead">PHQ-9, GAD-7, and ASRS, along with other validated screening tools as clinically appropriate.</p>
          </header>
        </div>
      </section>

      <section class="employer-pitch-section" id="sample-journey" aria-labelledby="sample-journey-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="sample-journey-heading">A typical care journey</h2>
            <p class="employer-pitch-illustrative-note" role="note"><strong>Illustrative example — not an individual patient&rsquo;s story.</strong> Composite walkthrough for employers; separate from attributed reviews below.</p>
          </header>
          <ol class="employer-pitch-journey">
            <li>
              <strong>First login &amp; scheduled onboarding</strong>
              <p>Someone on your team signs in through the employer-branded login, gets verified against your roster, and books an initial visit with your dedicated care team.</p>
            </li>
            <li>
              <strong>Intake &amp; cognitive baseline</strong>
              <p>They complete intake and a cognitive assessment (baseline), so the first visit starts with a clear clinical input — not guesswork from a rushed chat.</p>
            </li>
            <li>
              <strong>Provider evaluation &amp; plan</strong>
              <p>They meet the care team in a formally scheduled visit. Together they build a plan that can include primary care, ADHD/mental health support, metabolic or hormonal work, and a sensible follow-up rhythm.</p>
            </li>
            <li>
              <strong>Ongoing management</strong>
              <p>Day-to-day contact via messaging, photo-based check-ins, or video when needed — share what&rsquo;s going on and hear back the same day from a licensed clinician (not an automated diagnosis). Concierge and Medical Assistant care management keep pharmacy, prior auth, and labs from stalling the plan.</p>
            </li>
          </ol>
        </div>
      </section>

            <section class="employer-pitch-section" id="reviews" aria-labelledby="reviews-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <h2 id="reviews-heading">What patients say</h2>
            <p class="employer-pitch-section-lead">Role-attributed patient notes — not a named clinician roster. Individual experiences vary; outcomes are not guaranteed.</p>
          </header>
          <div class="employer-pitch-reviews">
            <blockquote class="employer-pitch-quote">
              <p>&ldquo;Thorough, professional, and took time to address all my questions without making me feel rushed. Everything was explained clearly so I understood my health status and any recommendations. The examination was comprehensive, and I felt confident in the expertise&hellip; I&rsquo;ll definitely be returning and would recommend this care to anyone looking for quality healthcare.&rdquo;</p>
              <footer>— Patient, physician visit</footer>
            </blockquote>
            <blockquote class="employer-pitch-quote">
              <p>&ldquo;My experience with the PA was excellent. She was knowledgeable, respectful, and genuinely attentive throughout the appointment. She took the time to understand my concerns, provided clear explanations, and ensured I felt comfortable with every step of my care. I would highly recommend this team to anyone seeking high-quality, patient-centered care.&rdquo;</p>
              <footer>— Patient, PA-C visit</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-section--tint" id="security" aria-labelledby="security-heading">
        <div class="container">
          <header class="employer-pitch-section-header">
            <p class="employer-pitch-section-label">Section 13 · Security and compliance</p>
            <h2 id="security-heading">Security and compliance</h2>
            <p class="employer-pitch-section-lead">Clinical services under this pilot are provided through <strong>${esc(LEGAL_ENTITY)}</strong>. We follow HIPAA-aligned telehealth practices for employee care. Employer partnership reporting is limited to de-identified aggregates as described in Section 7.</p>
          </header>
          <ul class="employer-pitch-included">
            <li><strong>Siya notice of privacy practices:</strong> <a href="/legal/notice-of-privacy-practices">siya.health/legal/notice-of-privacy-practices</a></li>
            <li><strong>Siya privacy policy:</strong> <a href="/legal/privacy-policy">siya.health/legal/privacy-policy</a></li>
            <li><strong>LegitScript verification (siya.health):</strong> <a href="https://www.legitscript.com/websites/?checker_keywords=siya.health" target="_blank" rel="noopener noreferrer">legitscript.com verification lookup</a></li>
            <li><strong>Patient messaging (Spruce) — HIPAA &amp; security overview:</strong> <a href="https://help.sprucehealth.com/hc/en-us/articles/23003305420571-Spruce-Safety-Security-and-HIPAA-Compliance-Overview" target="_blank" rel="noopener noreferrer">Spruce Safety, Security, and HIPAA</a></li>
            <li><strong>Spruce SOC 2 Type II (vendor attestation):</strong> <a href="https://sprucehealth.com/blog/spruce-soc-2-type-ii-audit/" target="_blank" rel="noopener noreferrer">Spruce SOC 2 Type II overview</a> — full reports available to customers on request</li>
            <li><strong>Practice operations (CarePatron) — HIPAA:</strong> <a href="https://help.carepatron.com/en/articles/6381803-is-carepatron-hipaa-compliant" target="_blank" rel="noopener noreferrer">Is Carepatron HIPAA compliant?</a></li>
            <li><strong>CarePatron Trust Center (HIPAA / SOC 2 docs):</strong> <a href="https://trust.carepatron.com/" target="_blank" rel="noopener noreferrer">trust.carepatron.com</a></li>
          </ul>
          <p class="employer-pitch-section-lead">HIPAA and SOC 2 references above are <strong>platform-vendor</strong> verification sources for tools we use — not a claim that Siya Healthcare PC itself holds a published SOC 2 report. For Siya&rsquo;s own practices, start with our NPP and privacy policy; ask for the current security packet for diligence.</p>
          <p class="employer-pitch-section-lead">Professional liability and cyber insurance coverage maintained — details available in our security packet upon request.</p>
        </div>
      </section>

      <section class="employer-pitch-section employer-pitch-close" id="next-step" aria-labelledby="next-step-heading">
        <div class="container">
          <h2 id="next-step-heading">Let&rsquo;s talk.</h2>
          <p class="employer-pitch-lead">Tell us a bit about your team in California, and we&rsquo;ll figure out together if a pilot makes sense. No pressure, just a conversation.</p>
          <div class="employer-pitch-cta-row">
            ${ctaButton('ca-pilot-close')}
          </div>
          <p class="employer-pitch-foot">Partnership information only — not medical advice. Emergency: call 911. Mental health crisis: 988.</p>
        </div>
      </section>
    </main>

    <footer class="footer employer-pitch-footer">
      <div class="container">
        <p class="footer-legal-micro">${esc(LEGAL_ENTITY)} · Siya Health · California employer pilot · Invitation-only</p>
      </div>
    </footer>
  </body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');
console.log('Wrote', OUT);
