/**
 * Apply transcript review fixes: images, bullets, about trust, blog circle, etc.
 * Run: node scripts/apply-transcript-review-fixes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SIYA_CIRCLE_GHL_FORM_URL, SIYA_CIRCLE_JOIN_TRACK } from '../data/siya-circle-config.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, html) {
  fs.writeFileSync(path.join(ROOT, rel), html, 'utf8');
  console.log('patched', rel);
}

function replaceOnce(html, find, repl, label) {
  if (!html.includes(find)) {
    console.warn(`  miss ${label}`);
    return html;
  }
  return html.replace(find, repl);
}

// —— About: how care works bullets + trust logos ——
{
  let html = read('about.html');
  html = replaceOnce(
    html,
    `<div class="about-how-steps">
            <article class="about-how-step">
              <p class="about-how-step-num">Step 1</p>
              <h3>Start with a conversation</h3>
              <p>Meet with a licensed clinician or begin with the most relevant care pathway.</p>
            </article>
            <article class="about-how-step">
              <p class="about-how-step-num">Step 2</p>
              <h3>Structured evaluation</h3>
              <p>We review symptoms, history, goals, medications, and relevant records or labs when appropriate.</p>
            </article>
            <article class="about-how-step">
              <p class="about-how-step-num">Step 3</p>
              <h3>Personalized plan</h3>
              <p>Your clinician explains what may be contributing and recommends next steps in plain language.</p>
            </article>
            <article class="about-how-step">
              <p class="about-how-step-num">Step 4</p>
              <h3>Ongoing support when needed</h3>
              <p>Follow-up, medication monitoring, labs, lifestyle support, and long-term care options when appropriate.</p>
            </article>
          </div>`,
    `<div class="about-how-steps">
            <article class="about-how-step">
              <p class="about-how-step-num">Step 1</p>
              <h3>Start with a conversation</h3>
              <ul class="scan-list scan-list--compact">
                <li>Book a Meet &amp; Greet or start secure chat</li>
                <li>Share what has been bothering you</li>
                <li>Confirm the best care pathway</li>
              </ul>
            </article>
            <article class="about-how-step">
              <p class="about-how-step-num">Step 2</p>
              <h3>Structured evaluation</h3>
              <ul class="scan-list scan-list--compact">
                <li>Review symptoms and goals</li>
                <li>Review medical and medication history</li>
                <li>Review records or labs when appropriate</li>
              </ul>
            </article>
            <article class="about-how-step">
              <p class="about-how-step-num">Step 3</p>
              <h3>Personalized plan</h3>
              <ul class="scan-list scan-list--compact">
                <li>Findings explained in plain language</li>
                <li>Clear next-step options</li>
                <li>No guaranteed medication outcome</li>
              </ul>
            </article>
            <article class="about-how-step">
              <p class="about-how-step-num">Step 4</p>
              <h3>Ongoing support when needed</h3>
              <ul class="scan-list scan-list--compact">
                <li>Follow-up visits</li>
                <li>Medication monitoring when appropriate</li>
                <li>Labs and lifestyle support as needed</li>
              </ul>
            </article>
          </div>`,
    'about how-care bullets',
  );
  html = replaceOnce(
    html,
    `<div class="trust-strip-compact trust-strip-compact--quad">
            <article>
              <h3>Licensed clinicians</h3>
              <p>Licensed physicians and advanced practice clinicians with training across primary care, ADHD, obesity medicine, and behavioral health.</p>
            </article>
            <article>
              <h3>HIPAA-compliant care</h3>
              <p>Secure video, encrypted records, and practice policies built for telehealth.</p>
            </article>
            <article>
              <h3>LegitScript certified</h3>
              <p>Verified online healthcare standards for safe, compliant telehealth practice.</p>
            </article>
            <article>
              <h3>Licensed in CA · TX · PA · FL</h3>
              <p>Care available in California, Texas, Pennsylvania, and Florida—eligibility confirmed at scheduling.</p>
            </article>
          </div>`,
    `<div class="trust-strip-compact trust-strip-compact--quad trust-strip-compact--logos">
            <article>
              <img class="trust-logo-img" src="/assets/images/siya-health-mark.png" alt="" width="48" height="48" loading="lazy" />
              <h3>Licensed clinicians</h3>
              <p>Licensed physicians and advanced practice clinicians with training across primary care, ADHD, obesity medicine, and behavioral health.</p>
            </article>
            <article>
              <img class="trust-logo-img" src="/assets/images/hipaa-compliant.png" alt="HIPAA compliant" width="72" height="72" loading="lazy" />
              <h3>HIPAA-compliant care</h3>
              <p>Secure video, encrypted records, and practice policies built for telehealth.</p>
            </article>
            <article>
              <img class="trust-logo-img" src="/assets/images/legitscript-certified.png" alt="LegitScript certified" width="72" height="72" loading="lazy" />
              <h3>LegitScript certified</h3>
              <p>Verified online healthcare standards for safe, compliant telehealth practice.</p>
            </article>
            <article>
              <div class="trust-logo-states" aria-hidden="true">CA · TX · PA · FL</div>
              <h3>Licensed in CA · TX · PA · FL</h3>
              <p>Online telehealth only. Eligibility confirmed at scheduling.</p>
            </article>
          </div>`,
    'about trust logos',
  );
  write('about.html', html);
}

// —— Homepage: pathway images distinct from symptoms; compact care team ——
{
  let html = read('index.html');
  html = html.replace(
    /(<section class="section section-tinted" id="pathways">[\s\S]*?<\/section>)/,
    (block) =>
      block
        .replace('editorial-finally-heard.jpg', 'telehealth-visit.png')
        .replace('editorial-weight-effort.jpg', 'weightloss-health.png')
        .replace('editorial-exhausted-morning.jpg', 'doctor-video-consult.png')
        .replace('editorial-focus-overwhelm.jpg', 'services-overview.png')
        .replace('editorial-burnout-afterwork.jpg', 'healthy-lifestyle.png')
        .replace('editorial-adhd-consult.jpg', 'doctor-office.png'),
  );
  // Prefer first pathway replacements carefully - do sequential unique
  html = replaceOnce(
    html,
    `<article class="pathway-card pathway-card--editorial">
              <figure class="pathway-card-media">
                <img src="/assets/images/editorial-finally-heard.jpg"`,
    `<article class="pathway-card pathway-card--editorial">
              <figure class="pathway-card-media">
                <img src="/assets/images/telehealth-visit.png"`,
    'pathway 1',
  );
  html = replaceOnce(
    html,
    `<article class="pathway-card pathway-card--editorial">
              <figure class="pathway-card-media">
                <img src="/assets/images/editorial-weight-effort.jpg"`,
    `<article class="pathway-card pathway-card--editorial">
              <figure class="pathway-card-media">
                <img src="/assets/images/weightloss-health.png"`,
    'pathway 2',
  );
  // Shrink care team: keep Medical Director only + link
  html = replaceOnce(
    html,
    `          <div class="about-team-grid homepage-care-grid homepage-care-grid--featured">
            <article class="about-team-card homepage-care-card ds-provider-card" data-states="CA,TX,PA,FL">
              <img src="/assets/images/dr-sneh-pandey.png" alt="Dr. Sneh Pandey, MD" width="128" height="128" loading="lazy" />
              <h3><a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey, MD</a></h3>
              <p class="about-team-role">Medical Director · Internal Medicine Physician</p>
              <p class="about-team-states">Licensed in California • Texas • Pennsylvania • Florida</p>
              <p class="about-team-bio">Focus on metabolic health, weight management, ADHD, and whole-person wellness for adults in CA, TX, PA, and FL.</p>
              <a class="button secondary care-team-profile-btn" href="/providers/dr-sneh-pandey">View profile</a>
            </article>
            <article class="about-team-card homepage-care-card ds-provider-card" data-states="FL">
              <img src="/assets/images/dr-vanessa-urbina.png" alt="Dr. Vanessa Urbina, MD" width="128" height="128" loading="lazy" />
              <h3><a href="/providers/dr-vanessa-urbina">Dr. Vanessa Urbina, MD</a></h3>
              <p class="about-team-role">Family Medicine Physician</p>
              <p class="about-team-states">Licensed in FL</p>
              <p class="about-team-bio">Experienced in primary care, preventive health, ADHD evaluation and treatment, and caring for patients across a wide range of everyday health concerns.</p>
              <a class="button secondary care-team-profile-btn" href="/providers/dr-vanessa-urbina">View profile</a>
            </article>
            <article class="about-team-card homepage-care-card ds-provider-card" data-states="TX,FL">
              <img src="/assets/images/dr-natasha-desai.png" alt="Dr. Natasha Desai, MD" width="128" height="128" loading="lazy" />
              <h3><a href="/providers/dr-natasha-desai">Dr. Natasha Desai, MD</a></h3>
              <p class="about-team-role">Family Medicine Physician</p>
              <p class="about-team-states">Licensed in TX, FL</p>
              <p class="about-team-bio">Focus on adult ADHD evaluation and treatment, behavioral health, and helping patients better understand symptoms affecting focus, productivity, and daily functioning.</p>
              <a class="button secondary care-team-profile-btn" href="/providers/dr-natasha-desai">View profile</a>
            </article>
          </div>
          <p class="care-team-hub-link"><a href="/providers" class="text-link">View full care team →</a></p>`,
    `          <div class="homepage-care-compact">
            <article class="homepage-care-compact-card">
              <img src="/assets/images/dr-sneh-pandey.png" alt="Dr. Sneh Pandey, MD" width="72" height="72" loading="lazy" />
              <div>
                <h3><a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey, MD</a></h3>
                <p>Medical Director · Internal Medicine</p>
              </div>
            </article>
            <a class="button secondary" href="/providers">Meet the full care team</a>
          </div>`,
    'homepage care compact',
  );
  write('index.html', html);
}

// —— Providers hub hero team photo ——
{
  let html = read('providers/index.html');
  html = html.replace(
    'src="/assets/images/editorial-adhd-consult.jpg" alt="Patient connecting with a Siya Health clinician online"',
    'src="/assets/images/care-team-group.jpg" alt="Siya Health care team of clinicians"',
  );
  write('providers/index.html', html);
}

// —— ADHD care: bullets + image variety ——
{
  let html = read('adhd-care.html');
  html = replaceOnce(
    html,
    `<div class="flow-cards flow-cards--adhd-process">
            <div class="flow-card">
              <span class="flow-step-num">Step 1</span>
              <div class="flow-card-icon"><img src="/assets/images/icons/icon12.svg" alt="" width="48" height="48" /></div>
              <h3>Take Free ADHD Screening</h3>
              <p class="flow-card-desc">A brief online check-in to help you decide whether a full evaluation is worth exploring. Screening is not a diagnosis.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">Step 2</span>
              <div class="flow-card-icon"><img src="/assets/images/icons/icon1.svg" alt="" width="48" height="48" /></div>
              <h3>Comprehensive Physician Evaluation</h3>
              <p class="flow-card-desc">A 60–90 minute virtual visit covering symptoms, history, daily functioning, and validated tools when clinically appropriate.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">Step 3</span>
              <div class="flow-card-icon"><img src="/assets/images/icons/icon5.svg" alt="" width="48" height="48" /></div>
              <h3>Personalized Treatment Plan</h3>
              <p class="flow-card-desc">Clear next steps in plain language—lifestyle, therapy, testing, medication, or follow-up when clinically appropriate. Medication is never guaranteed.</p>
            </div>
          </div>`,
    `<div class="flow-cards flow-cards--adhd-process">
            <div class="flow-card">
              <span class="flow-step-num">Step 1</span>
              <div class="flow-card-icon"><img src="/assets/images/icons/icon12.svg" alt="" width="48" height="48" /></div>
              <h3>Take Free ADHD Screening</h3>
              <ul class="scan-list scan-list--compact">
                <li>2-minute online check-in</li>
                <li>Helps you decide if evaluation is worth exploring</li>
                <li>Screening is not a diagnosis</li>
              </ul>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">Step 2</span>
              <div class="flow-card-icon"><img src="/assets/images/icons/icon1.svg" alt="" width="48" height="48" /></div>
              <h3>Comprehensive Physician Evaluation</h3>
              <ul class="scan-list scan-list--compact">
                <li>60–90 minute virtual visit</li>
                <li>Symptoms, history, and daily functioning</li>
                <li>Validated tools when clinically appropriate</li>
              </ul>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">Step 3</span>
              <div class="flow-card-icon"><img src="/assets/images/icons/icon5.svg" alt="" width="48" height="48" /></div>
              <h3>Personalized Treatment Plan</h3>
              <ul class="scan-list scan-list--compact">
                <li>Findings in plain language</li>
                <li>Lifestyle, therapy, testing, or medication options</li>
                <li>Medication is never guaranteed</li>
              </ul>
            </div>
          </div>`,
    'adhd steps bullets',
  );
  html = replaceOnce(
    html,
    `<p class="adhd-pull-quote">Tasks started, rarely finished. Multiple tabs open in your brain. Procrastination—then sudden hyperfocus. Everything pushed to the last minute.</p>`,
    `<ul class="adhd-pull-quote-list">
              <li>Tasks started, rarely finished</li>
              <li>Multiple tabs open in your brain</li>
              <li>Procrastination, then sudden hyperfocus</li>
              <li>Everything pushed to the last minute</li>
            </ul>`,
    'adhd pull quote bullets',
  );
  // Diversify symptom images
  html = html
    .replace('editorial-adhd-unfinished.jpg', 'adhd-focus-work.png')
    .replace('editorial-adhd-overwhelm.jpg', 'adhd-overwhelmed.png')
    .replace('editorial-adhd-keys.jpg', 'telehealth-workspace.png')
    .replace('editorial-energy-afternoon.jpg', 'patient-laptop-smile.png');
  write('adhd-care.html', html);
}

// —— Weight loss: bullets + image swap + leave pricing to conversion cleanup ——
{
  let html = read('weight-loss-metabolic-health.html');
  html = html
    .replaceAll('editorial-adhd-unfinished.jpg', 'weightloss-hero.png')
    .replaceAll('editorial-adhd-consult.jpg', 'healthy-lifestyle.png')
    .replaceAll('editorial-burnout-afterwork.jpg', 'patient-happy.png')
    .replaceAll('editorial-hormones-pause.jpg', 'services-overview.png');
  html = html.replace(
    /<p class="flow-card-desc">Share weight history[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Share weight history and what you&rsquo;ve tried</li>
                <li>Discuss cravings, energy, and appetite</li>
                <li>No form dump required</li>
              </ul>`,
  );
  html = html.replace(
    /<p class="flow-card-desc">A clinician reviews patterns[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Review patterns and medical history</li>
                <li>Labs when appropriate</li>
                <li>Identify metabolic contributors</li>
              </ul>`,
  );
  html = html.replace(
    /<p class="flow-card-desc">Nutrition, lifestyle[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Nutrition and lifestyle support</li>
                <li>Behavioral strategies</li>
                <li>Medication only when clinically appropriate</li>
              </ul>`,
  );
  write('weight-loss-metabolic-health.html', html);
}

// —— Telehealth: diversify images + step bullets ——
{
  let html = read('telehealth.html');
  html = html
    .replaceAll('editorial-adhd-time.jpg', 'doctor-office.png')
    .replaceAll('editorial-adhd-keys.jpg', 'telehealth-workspace.png')
    .replaceAll('editorial-adhd-consult.jpg', 'doctor-video-consult.png')
    .replaceAll('editorial-focus-overwhelm.jpg', 'services-overview.png');
  html = html.replace(
    /<p class="flow-card-desc">Start with a free Meet[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Free Meet &amp; Greet or secure chat</li>
                <li>No waiting room</li>
                <li>Confirm eligibility for your state</li>
              </ul>`,
  );
  html = html.replace(
    /<p class="flow-card-desc">A virtual visit covering[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Virtual visit from home</li>
                <li>History and concerns reviewed</li>
                <li>Clear next steps</li>
              </ul>`,
  );
  html = html.replace(
    /<p class="flow-card-desc">Prescriptions when appropriate[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Prescriptions when appropriate</li>
                <li>Forms and labs as needed</li>
                <li>Ongoing care options explained</li>
              </ul>`,
  );
  write('telehealth.html', html);
}

// —— Men's health: male-coded images + step bullets ——
{
  let html = read('mens-health-longevity.html');
  const maleImgs = [
    'doctor-profile.png',
    'telehealth-workspace.png',
    'doctor-office.png',
    'patient-telehealth.png',
    'healthy-lifestyle.png',
    'doctor-video-consult.png',
    'telehealth-visit.png',
    'adhd-focus-work.png',
  ];
  // Replace symptom editorial images with male-leaning assets
  html = html
    .replaceAll('/assets/images/editorial-exhausted-morning.jpg', `/assets/images/${maleImgs[0]}`)
    .replaceAll('/assets/images/editorial-focus-overwhelm.jpg', `/assets/images/${maleImgs[1]}`)
    .replaceAll('/assets/images/editorial-burnout-afterwork.jpg', `/assets/images/${maleImgs[2]}`)
    .replaceAll('/assets/images/editorial-hormones-pause.jpg', `/assets/images/${maleImgs[3]}`)
    .replaceAll('/assets/images/editorial-weight-effort.jpg', `/assets/images/${maleImgs[4]}`)
    .replaceAll('/assets/images/editorial-finally-heard.jpg', `/assets/images/${maleImgs[5]}`)
    .replaceAll('/assets/images/editorial-energy-afternoon.jpg', `/assets/images/${maleImgs[6]}`)
    .replaceAll('/assets/images/editorial-adhd-consult.jpg', `/assets/images/${maleImgs[7]}`);
  html = html.replace(
    /style="background-image: url\('\/assets\/images\/[^']+'\)"/,
    `style="background-image: url('/assets/images/doctor-profile.png')"`,
  );
  html = html.replace(
    /<p class="flow-card-desc">Energy, mood, libido[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Energy, mood, libido, or sleep concerns</li>
                <li>Training and recovery changes</li>
                <li>What has felt off lately</li>
              </ul>`,
  );
  html = html.replace(
    /<p class="flow-card-desc">History and labs when appropriate[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Structured history</li>
                <li>Labs when appropriate</li>
                <li>Rule out other contributors first</li>
              </ul>`,
  );
  html = html.replace(
    /<p class="flow-card-desc">Lifestyle, monitoring[\s\S]*?<\/p>/,
    `<ul class="scan-list scan-list--compact">
                <li>Lifestyle and monitoring plan</li>
                <li>Treatment only when indicated</li>
                <li>Never a guaranteed prescription</li>
              </ul>`,
  );
  write('mens-health-longevity.html', html);
}

// —— Blog hub: Siya Circle join strip ——
{
  let html = read('blog/index.html');
  if (html.includes('SIYA:BLOG-CIRCLE')) {
    html = html.replace(/<!-- SIYA:BLOG-CIRCLE -->[\s\S]*?<!-- \/SIYA:BLOG-CIRCLE -->\s*/g, '');
    write('blog/index.html', html);
    console.log('Removed legacy blog circle strip');
  }
}

console.log('Transcript review fixes applied.');
