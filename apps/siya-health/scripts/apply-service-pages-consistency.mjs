/**
 * One-shot structural polish: Weight Loss, Men's Health, Telehealth
 * toward SERVICE-PAGE-BLUEPRINT.md / ADHD Care rhythm.
 * Run: node scripts/apply-service-pages-consistency.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function readingCard(href, img, title, blurb) {
  return `            <a class="adhd-reading-card" href="${href}">
              <figure class="adhd-reading-card-media">
                <img src="${img}" alt="" width="720" height="480" loading="lazy" decoding="async" />
              </figure>
              <strong>${title}</strong>
              <span>${blurb}</span>
            </a>`;
}

function editorialCard(img, title, blurb) {
  return `            <div class="symptoms-card symptoms-card--editorial fade-in">
              <figure class="symptoms-card-media">
                <img src="${img}" alt="" width="900" height="600" loading="lazy" decoding="async" />
              </figure>
              <h3>${title}</h3>
              <p>${blurb}</p>
            </div>`;
}

function trustBlock({ photo, photoAlt, serviceLine, quote, cite, bullets }) {
  return `      <section class="trust-metrics trust-metrics-adhd-rewrite trust-metrics-adhd-human trust-metrics-human" data-no-countup aria-label="Trust statistics">
        <div class="container trust-metrics-adhd-human-grid">
          <figure class="trust-metrics-adhd-photo">
            <img src="${photo}" width="1100" height="733" alt="${photoAlt}" loading="lazy" decoding="async" />
          </figure>
          <div class="trust-metrics-rewrite-inner">
          <h2 class="trust-metrics-rewrite-headline">Trusted by <span class="trust-metric-value" data-target="2200" data-suffix="+">2,200+</span> adults for physician-led care</h2>
          <p class="trust-metrics-rewrite-line">
            <span aria-hidden="true">⭐</span>
            <span class="trust-metric-value" data-target="4.8" data-suffix="★">4.8★</span> average Google rating · <span class="trust-metric-value" data-target="600" data-suffix="+">600+</span> verified patient reviews
          </p>
          <p class="trust-metrics-rewrite-line trust-metrics-rewrite-line-strong">
            <span class="trust-metric-value" data-target="2200" data-suffix="+">2,200+</span> patients treated
          </p>
          <p class="trust-metrics-rewrite-meta">${serviceLine}</p>
          <blockquote class="hero-inline-testimonial trust-metrics-quote">
            <p class="hero-inline-testimonial-quote">&ldquo;${quote}&rdquo;</p>
            <cite class="hero-inline-testimonial-cite">— ${cite}</cite>
          </blockquote>
          <ul class="hero-bullet-list trust-metrics-bullets" aria-label="What you get">
${bullets.map((b) => `            <li>${b}</li>`).join('\n')}
          </ul>
          </div>
        </div>
      </section>`;
}

function howItWorks({ id, title, lead, steps }) {
  const icons = ['/assets/images/icons/icon12.svg', '/assets/images/icons/icon1.svg', '/assets/images/icons/icon5.svg'];
  const cards = steps
    .map(
      (s, i) => `            <div class="flow-card">
              <span class="flow-step-num">Step ${i + 1}</span>
              <div class="flow-card-icon"><img src="${icons[i]}" alt="" width="48" height="48" /></div>
              <h3>${s.title}</h3>
              <p class="flow-card-desc">${s.desc}</p>
            </div>`,
    )
    .join('\n');
  return `      <section class="section service-process-section" id="${id}">
        <div class="container">
          <div class="section-header">
            <h2>${title}</h2>
            <p class="lead">${lead}</p>
          </div>
          <div class="flow-cards flow-cards--service-process">
${cards}
          </div>
        </div>
      </section>`;
}

function mdMessage({ heading, lead, quote, paragraphs }) {
  return `      <section class="section section-tinted why-siya-exists adhd-md-message-section" id="medical-director-message" aria-labelledby="service-md-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="service-md-heading">${heading}</h2>
            <p class="lead">${lead}</p>
          </div>
          <div class="why-siya-two-col adhd-md-centerpiece">
            <div class="why-siya-photo">
              <img src="/assets/images/dr-sneh-pandey-founder.png" alt="Dr. Sneh Pandey, MD, Medical Director at Siya Health." width="420" height="560" loading="lazy" class="why-siya-founder-img adhd-md-portrait" />
            </div>
            <div class="why-siya-content">
              <div class="why-siya-quote-block adhd-md-quote-lead">
                <blockquote class="why-siya-quote-card">
                  <p class="why-siya-quote-text">&ldquo;${quote}&rdquo;</p>
                  <cite class="why-siya-quote-cite">— Dr. Sneh Pandey, MD</cite>
                </blockquote>
              </div>
              <div class="why-siya-story">
${paragraphs.map((p) => `                <p>${p}</p>`).join('\n')}
                <p><a class="text-link" href="/providers/dr-sneh-pandey">View Dr. Pandey&rsquo;s profile →</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>`;
}

function suggestedReading({ marker, id, headingId, footer, cards }) {
  return `<!-- SIYA:${marker} -->
      <section class="section section-tinted learn-more-cluster adhd-suggested-reading" id="${id}" aria-labelledby="${headingId}">
        <div class="container">
          <div class="section-header">
            <h2 id="${headingId}">Suggested Reading</h2>
            <p class="lead">Educational resources from Siya Health—so you can learn at your own pace before or after a visit.</p>
          </div>
          <div class="adhd-reading-grid">
${cards.join('\n')}
          </div>
          <p class="cta-microcopy adhd-reading-footer">${footer}</p>
        </div>
      </section>
      <!-- /SIYA:${marker} -->`;
}

function replaceBetween(html, startMarker, endMarker, replacement) {
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`Markers not found: ${startMarker} … ${endMarker}`);
  }
  return html.slice(0, start) + replacement + html.slice(end);
}

function setBodyClass(html, classes) {
  return html.replace(/<body([^>]*)>/, (m, attrs) => {
    if (/class="/.test(attrs)) {
      return `<body${attrs.replace(/class="([^"]*)"/, (_, c) => `class="${c} ${classes}"`)}>`;
    }
    return `<body class="${classes}"${attrs}>`;
  });
}

function chatBtn(location, pageType, intent) {
  return `<a class="button ds-button ds-button--secondary secondary" href="/redirect/chat" data-siya-track="secure_chat_click" data-siya-location="${location}" data-page-type="${pageType}" data-intent="${intent}" data-conversion-goal="secureChat" data-cta-slot="secureChat" data-component="button">Start Secure Medical Chat</a>`;
}

function meetBtn(location, pageType, intent, variant = 'primary') {
  const v = variant === 'primary' ? 'ds-button--primary' : 'ds-button--secondary secondary';
  return `<a class="button ds-button ${v}" href="/redirect/meet-greet" data-siya-track="meet_greet_click" data-siya-location="${location}" data-page-type="${pageType}" data-intent="${intent}" data-conversion-goal="meetGreet" data-cta-slot="meetGreet" data-component="button">Book Free Meet &amp; Greet</a>`;
}

/* ---------- WEIGHT LOSS ---------- */
function polishWeight(html) {
  html = setBodyClass(html, 'page-weight-loss page-service');

  html = html.replace(
    /<div class="hero-ctas[^"]*">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/div>\s*<\/section>)/,
    `<div class="hero-ctas hero-ctas-row">
            ${meetBtn('hero', 'weight', 'weight')}
            ${chatBtn('hero', 'weight', 'weight')}
          </div>
`,
  );

  // Replace from after hero through old trust (before why-weight-complicated)
  const afterHero = html.indexOf('</section>', html.indexOf('weight-loss-hero')) + '</section>'.length;
  const whyStart = html.indexOf('<!-- WHY WEIGHT IS COMPLICATED -->');
  if (afterHero < 0 || whyStart < 0) throw new Error('weight: hero/why markers');

  const recognition = `      <section class="section section-tinted weight-recognition-section" id="weight-recognition" aria-labelledby="weight-recognition-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="weight-recognition-heading">Does This Sound Like You?</h2>
            <p class="lead">Recognition and reassurance—not judgment.</p>
          </div>
          <div class="symptoms-card-grid">
${editorialCard('/assets/images/editorial-weight-effort.jpg', 'Constant food noise', 'Cravings and mental chatter around food make it hard to feel in control.')}
${editorialCard('/assets/images/editorial-weight-regain.jpg', 'Weight keeps returning', 'You&rsquo;ve lost weight before—but regain keeps happening.')}
${editorialCard('/assets/images/editorial-exhausted-morning.jpg', 'Always tired', 'Afternoon crashes make healthy choices harder than they should be.')}
${editorialCard('/assets/images/editorial-diet-fatigue.jpg', 'Tried every diet', 'You start strong, then lose momentum after a few weeks.')}
${editorialCard('/assets/images/editorial-emotional-eating.jpg', 'Emotional eating', 'Stress-driven eating feels automatic after hard days.')}
${editorialCard('/assets/images/editorial-energy-afternoon.jpg', 'Slow progress despite effort', 'You work hard without seeing the same results as others.')}
          </div>
        </div>
      </section>

`;

  const trust = trustBlock({
    photo: '/assets/images/editorial-exhausted-morning.jpg',
    photoAlt: 'Adult pausing at home, considering energy, appetite, and metabolic health.',
    serviceLine: 'Same-week consultations · Transparent pricing · HIPAA-compliant telehealth',
    quote: 'For the first time, someone helped me understand why I was struggling in the first place.',
    cite: 'Verified weight management patient',
    bullets: [
      'Whole-person evaluation—not just a prescription conversation',
      'Support for food noise, emotional eating, and regain cycles',
      'Ongoing follow-up with a licensed clinician',
    ],
  });

  const process = howItWorks({
    id: 'how-it-works',
    title: 'How to Get Started',
    lead: 'Three calm steps from first conversation to a plan you can understand.',
    steps: [
      { title: 'Tell us what&rsquo;s been going on', desc: 'Share weight history, cravings, energy, and what you&rsquo;ve already tried—no form dump required.' },
      { title: 'Metabolic evaluation', desc: 'A clinician reviews patterns, history, and labs when appropriate to understand what may be driving weight.' },
      { title: 'A plan that makes sense', desc: 'Nutrition, lifestyle, behavioral support, and medication when clinically appropriate—never a one-size menu.' },
    ],
  });

  html =
    html.slice(0, afterHero) +
    `\n\n${trust}\n\n${recognition}\n${process}\n\n` +
    html.slice(whyStart);

  // Replace 4-step how-care-works if it still exists after why section
  html = html.replace(
    /<!-- HOW CARE WORKS:[\s\S]*?<!-- PROGRAM OVERVIEW -->/,
    '<!-- PROGRAM OVERVIEW -->',
  );

  // Remove cornerstone
  html = html.replace(/\s*<section class="section section-tinted cornerstone-hub" id="cornerstone-metabolic"[\s\S]*?<\/section>\s*/, '\n');

  const weightReading = suggestedReading({
    marker: 'LEARN-MORE-WEIGHT',
    id: 'learn-more-weight-loss',
    headingId: 'learn-more-weight-heading',
    footer: 'Also useful: <a href="/pricing">pricing</a> · <a href="/blog/weight-loss">Browse weight loss articles →</a>',
    cards: [
      readingCard('/blog/food-noise-and-glp-1-what-it-means-and-what-helps', '/assets/images/editorial-weight-effort.jpg', 'Food Noise &amp; GLP-1', 'What food noise means and what may help.'),
      readingCard('/blog/insulin-resistance-and-weight-loss-clinician-overview', '/assets/images/editorial-insulin-metabolic.jpg', 'Insulin Resistance', 'Clinician overview of IR and weight physiology.'),
      readingCard('/blog/semaglutide-for-weight-loss-how-it-works', '/assets/images/editorial-glp1-consult.jpg', 'Semaglutide Overview', 'How it works when clinically appropriate.'),
      readingCard('/blog/medical-weight-loss-vs-dieting-what-actually-works', '/assets/images/editorial-medical-vs-diet.jpg', 'Medical Weight Loss vs Dieting', 'Why regain happens—and what evaluation adds.'),
      readingCard('/blog/how-mental-health-affects-weight-loss-outcomes', '/assets/images/editorial-weight-mood.jpg', 'Mental Health &amp; Weight', 'Stress, mood, and habits that affect outcomes.'),
      readingCard('/blog/why-am-i-always-tired-causes-when-to-see-doctor', '/assets/images/editorial-exhausted-morning.jpg', 'Why Am I Always Tired?', 'Energy, sleep, and metabolic overlap.'),
    ],
  });

  html = html.replace(/<!-- SIYA:LEARN-MORE-WEIGHT -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-WEIGHT -->/, weightReading);

  const md = mdMessage({
    heading: 'A Message From Dr. Sneh Pandey',
    lead: 'Metabolic care without shame—structured, evidence-based, and human.',
    quote: 'Weight is not a character flaw. It deserves the same careful evaluation as any other medical concern.',
    paragraphs: [
      '<a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey, MD</a> · Medical Director · Internal Medicine · Obesity Medicine.',
      'Many adults arrive after years of being told to try harder. We look at appetite, sleep, stress, medications, and metabolic patterns together—then build a plan you can follow.',
      'Medication may be part of care when clinically appropriate. It is one tool, not the entire program.',
    ],
  });

  // Insert MD before meet physicians
  if (!html.includes('id="medical-director-message"')) {
    html = html.replace('<!-- SIYA:MEET-PHYSICIANS -->', `${md}\n\n<!-- SIYA:MEET-PHYSICIANS -->`);
  }

  html = html.replace(
    /(<!-- FINAL CTA -->[\s\S]*?<div class="cta-band-buttons">)[\s\S]*?(<\/div>)/,
    `$1\n              ${meetBtn('final-cta', 'weight', 'weight')}\n              ${chatBtn('final-cta', 'weight', 'weight')}\n            $2`,
  );

  if (!html.includes('trust-metrics.js')) {
    html = html.replace('</body>', '    <script src="/trust-metrics.js"></script>\n</body>');
  }

  return html;
}

/* ---------- MEN'S HEALTH ---------- */
function polishMens(html) {
  html = setBodyClass(html, 'page-mens-health page-service');
  html = html.replace(
    /<header class="site-header"/,
    '<header class="site-header site-header-transparent" id="site-header"',
  );

  html = html.replace(
    /<div class="hero-ctas[^"]*">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/div>\s*<\/section>)/,
    `<div class="hero-ctas hero-ctas-row">
            ${meetBtn('hero', 'hormones', 'hormones')}
            ${chatBtn('hero', 'hormones', 'hormones')}
          </div>
`,
  );

  const afterHero = html.indexOf('</section>', html.indexOf('mens-health-hero')) + '</section>'.length;
  const recogStart = html.indexOf('<!-- PATIENT RECOGNITION -->');
  const servicesStart = html.indexOf('<section class="section section-tinted" id="services">');
  if (afterHero < 0 || recogStart < 0 || servicesStart < 0) throw new Error('mens: markers');

  const trust = trustBlock({
    photo: '/assets/images/editorial-mens-tele-consult.jpg',
    photoAlt: 'Adult man pausing mid-day, reflecting on energy and focus.',
    serviceLine: 'Same-week consultations · Transparent pricing · HIPAA-compliant telehealth',
    quote: 'Someone finally took the full picture seriously—not just one lab number.',
    cite: 'Verified men&rsquo;s health patient',
    bullets: [
      'Evaluation first—therapy only when clinically appropriate',
      'Labs and history reviewed together',
      'Ongoing monitoring when treatment continues',
    ],
  });

  const recognition = `      <!-- PATIENT RECOGNITION -->
      <section class="section section-tinted mens-recognition-section" id="mens-recognition" aria-labelledby="mens-recognition-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="mens-recognition-heading">Does This Sound Like You?</h2>
            <p class="lead">Recognition and reassurance—not judgment.</p>
          </div>
          <div class="symptoms-card-grid">
${editorialCard('/assets/images/editorial-mens-low-energy.jpg', 'Low energy', 'You&rsquo;re tired even after rest—and coffee only gets you so far.')}
${editorialCard('/assets/images/editorial-mens-brain-fog.jpg', 'Brain fog', 'Focus and mental clarity feel harder than they should.')}
${editorialCard('/assets/images/editorial-mens-motivation.jpg', 'Reduced motivation', 'Drive and follow-through feel flatter than they used to.')}
${editorialCard('/assets/images/editorial-mens-libido.jpg', 'Low libido', 'Interest or intimacy feels lower—and you&rsquo;re not sure why.')}
${editorialCard('/assets/images/editorial-mens-recovery.jpg', 'Poor recovery', 'Gym progress, strength, or recovery has stalled despite effort.')}
${editorialCard('/assets/images/editorial-mens-unlike-self.jpg', 'Feeling unlike yourself', 'Something feels off, and you want clearer answers—not hype.')}
          </div>
        </div>
      </section>

`;

  const process = howItWorks({
    id: 'how-it-works',
    title: 'How to Get Started',
    lead: 'Three calm steps from first conversation to a plan you can understand.',
    steps: [
      { title: 'Tell us what&rsquo;s been going on', desc: 'Energy, mood, libido, sleep, training—whatever has felt off.' },
      { title: 'Structured evaluation', desc: 'History and labs when appropriate. Rule out other contributors before any therapy discussion.' },
      { title: 'A personalized plan', desc: 'Lifestyle, monitoring, and treatment only when clinically indicated—never guaranteed.' },
    ],
  });

  // Remove old recognition through services start, insert new blocks
  html = html.slice(0, afterHero) + `\n\n${trust}\n\n${recognition}${process}\n\n` + html.slice(servicesStart);

  // Remove second "How we approach care" grid + telehealth emoji section + cornerstone
  html = html.replace(
    /\s*<div class="section-header" style="margin-top: 48px;">[\s\S]*?<h2>How we approach care<\/h2>[\s\S]*?<\/div>\s*<div class="why-choose-grid">[\s\S]*?<\/div>\s*(?=<p class="cta-microcopy"|<\/div>\s*<\/section>)/,
    '\n',
  );
  html = html.replace(/\s*<section class="section[^"]*" id="telehealth"[\s\S]*?<\/section>\s*/, '\n');
  html = html.replace(/\s*<section class="section section-tinted cornerstone-hub" id="cornerstone-mens"[\s\S]*?<\/section>\s*/, '\n');
  // Remove leftover testosterone pathway if still present
  html = html.replace(/\s*<section class="section" id="testosterone-pathway"[\s\S]*?<\/section>\s*/, '\n');

  // Trim mid-page View Pricing CTAs in services
  html = html.replace(
    /<p class="cta-microcopy">[\s\S]*?View Pricing[\s\S]*?<\/p>/gi,
    '',
  );

  const mensReading = suggestedReading({
    marker: 'LEARN-MORE-MENS',
    id: 'learn-more-mens-health',
    headingId: 'learn-more-mens-heading',
    footer: 'Also useful: <a href="/pricing">pricing</a> · <a href="/blog">Browse health articles →</a>',
    cards: [
      readingCard('/blog/when-is-testosterone-therapy-appropriate', '/assets/images/editorial-trt-consult.jpg', 'When Is TRT Appropriate?', 'Evidence-based criteria—not anti-aging hype.'),
      readingCard('/blog/free-testosterone-vs-total-testosterone-what-patients-should-know', '/assets/images/editorial-mens-hero.jpg', 'Free vs Total Testosterone', 'What lab numbers actually mean.'),
      readingCard('/answers/what-does-low-testosterone-feel-like', '/assets/images/editorial-mens-low-energy.jpg', 'What Low T Can Feel Like', 'Symptoms that prompt evaluation.'),
      readingCard('/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign', '/assets/images/editorial-mens-recovery.jpg', 'Sleep Apnea &amp; Fatigue', 'When snoring signals more than noise.'),
      readingCard('/blog/why-am-i-always-tired-causes-when-to-see-doctor', '/assets/images/editorial-mens-low-energy.jpg', 'Why Am I Always Tired?', 'Energy workups that go beyond caffeine.'),
      readingCard('/answers/testosterone-and-adhd-overlap', '/assets/images/editorial-mens-brain-fog.jpg', 'Testosterone &amp; ADHD Overlap', 'When focus and hormones intersect.'),
    ],
  });
  html = html.replace(/<!-- SIYA:LEARN-MORE-MENS -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-MENS -->/, mensReading);

  const md = mdMessage({
    heading: 'A Message From Dr. Sneh Pandey',
    lead: 'Men&rsquo;s health without hype—evaluation first, treatment when appropriate.',
    quote: 'Low energy is not a personality flaw. It deserves a real workup.',
    paragraphs: [
      '<a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey, MD</a> · Medical Director · Internal Medicine · Obesity Medicine.',
      'We look at sleep, metabolic health, medications, and hormone labs together. Testosterone therapy is considered only when clinically appropriate—and never guaranteed.',
      'Good care continues after the visit with monitoring and clear next steps.',
    ],
  });
  if (!html.includes('id="medical-director-message"')) {
    html = html.replace('<!-- SIYA:MEET-PHYSICIANS -->', `${md}\n\n<!-- SIYA:MEET-PHYSICIANS -->`);
  }

  html = html.replace(
    /(<!-- FINAL CTA -->[\s\S]*?<div class="cta-band-buttons">)[\s\S]*?(<\/div>)/,
    `$1\n              ${meetBtn('final-cta', 'hormones', 'hormones')}\n              ${chatBtn('final-cta', 'hormones', 'hormones')}\n            $2`,
  );

  if (!html.includes('trust-metrics.js')) {
    html = html.replace('</body>', '    <script src="/trust-metrics.js"></script>\n</body>');
  }
  return html;
}

/* ---------- TELEHEALTH ---------- */
function polishTele(html) {
  html = setBodyClass(html, 'page-telehealth page-service');

  html = html.replace(
    /url\('\/assets\/images\/editorial-adhd-consult\.jpg'\)/g,
    "url('/assets/images/editorial-finally-heard.jpg')",
  );
  html = html.replace(
    /href="\/assets\/images\/editorial-adhd-consult\.jpg"/g,
    'href="/assets/images/editorial-finally-heard.jpg"',
  );

  // Slim hero: remove bullets and trust chips; fix CTAs
  html = html.replace(/<ul class="hero-bullet-list"[\s\S]*?<\/ul>\s*/, '');
  html = html.replace(/<div class="hero-trust-bar hero-trust-bar--chips"[\s\S]*?<\/div>\s*/, '');
  html = html.replace(
    /<div class="hero-ctas[^"]*">[\s\S]*?<\/div>/,
    `<div class="hero-ctas hero-ctas-row">
            ${meetBtn('hero', 'telehealth', 'telehealth')}
            ${chatBtn('hero', 'telehealth', 'telehealth')}
          </div>`,
  );

  const afterHero = html.indexOf('</section>', html.indexOf('<!-- HERO -->')) + '</section>'.length;
  const whyStart = html.indexOf('<!-- WHY CHOOSE SIYA TELEHEALTH -->');
  if (afterHero < 0 || whyStart < 0) throw new Error('tele: markers');

  const trust = trustBlock({
    photo: '/assets/images/editorial-adhd-consult.jpg',
    photoAlt: 'Adult on a calm virtual visit with a clinician from home.',
    serviceLine: 'Same-week appointments · Evening &amp; weekend hours · HIPAA-compliant',
    quote: 'I finally got care that fit my schedule—without the waiting room.',
    cite: 'Verified telehealth patient',
    bullets: [
      'Physician-led visits—not chatbot-only care',
      'Transparent pricing before you book',
      'Follow-up when you need ongoing support',
    ],
  });

  const recognition = `      <section class="section section-tinted tele-recognition-section" id="tele-recognition" aria-labelledby="tele-recognition-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="tele-recognition-heading">Does This Sound Like You?</h2>
            <p class="lead">Recognition and reassurance—not judgment.</p>
          </div>
          <div class="symptoms-card-grid">
${editorialCard('/assets/images/editorial-busy-schedule.jpg', 'Busy schedule', 'Work, family, or shifts leave no room for clinic wait times.')}
${editorialCard('/assets/images/editorial-clinic-wait.jpg', 'Long clinic waits', 'You need care now—not weeks on a waitlist.')}
${editorialCard('/assets/images/editorial-refill-wait.jpg', 'Need follow-up or a refill', 'Chronic meds, forms, or a quick clinical question.')}
${editorialCard('/assets/images/editorial-finally-heard.jpg', 'Prefer virtual care', 'You want a real clinician visit from home.')}
${editorialCard('/assets/images/editorial-tele-consult-us.jpg', 'Ongoing physician relationship', 'Blood pressure, diabetes, preventive care—someone who follows you.')}
${editorialCard('/assets/images/editorial-booking-start.jpg', 'Don&rsquo;t know where to start', 'Fatigue, fog, stress, or sleep—and you need a clear next step.')}
          </div>
        </div>
      </section>

`;

  const process = howItWorks({
    id: 'how-it-works',
    title: 'How to Get Started',
    lead: 'Three calm steps from first conversation to care that fits your life.',
    steps: [
      { title: 'Book a conversation', desc: 'Start with a free Meet &amp; Greet or secure chat—no waiting room required.' },
      { title: 'Meet a licensed clinician', desc: 'A virtual visit covering what brought you in, history, and next steps.' },
      { title: 'Clear follow-up', desc: 'Prescriptions when appropriate, forms, labs, or ongoing care—explained plainly.' },
    ],
  });

  html = html.slice(0, afterHero) + `\n\n${trust}\n\n${recognition}${process}\n\n` + html.slice(whyStart);

  // Remove media accent if still present before why-choose (already sliced away if it was between)
  html = html.replace(/\s*<!-- Recognition visual:[\s\S]*?<\/section>\s*/, '\n');
  html = html.replace(/\s*<section class="section media-accent-section"[\s\S]*?<\/section>\s*/, '\n');

  // Trim why-choose to 6 cards if 7+
  html = html.replace(
    /(<div class="why-choose-grid">)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/section>\s*<!-- SERVICES)/,
    (m, open, inner, close) => {
      const cards = [...inner.matchAll(/<article class="why-choose-card">[\s\S]*?<\/article>/g)].map((x) => x[0]);
      const kept = cards.slice(0, 6).join('\n');
      return `${open}\n${kept}\n          ${close}`;
    },
  );

  html = html.replace(/\s*<section class="section section-tinted cornerstone-hub" id="cornerstone-telehealth"[\s\S]*?<\/section>\s*/, '\n');

  const teleReading = suggestedReading({
    marker: 'LEARN-MORE-TELE',
    id: 'learn-more-telehealth',
    headingId: 'learn-more-tele-heading',
    footer: 'Also useful: <a href="/pricing">pricing</a> · <a href="/blog/telehealth">Browse telehealth articles →</a>',
    cards: [
      readingCard('/answers/is-telehealth-legitimate', '/assets/images/editorial-finally-heard.jpg', 'Is Telehealth Legitimate?', 'What to expect from licensed virtual care.'),
      readingCard('/answers/meet-and-greet-telehealth-expectations', '/assets/images/editorial-adhd-consult.jpg', 'Meet &amp; Greet Expectations', 'What the free call is—and is not.'),
      readingCard('/answers/how-online-prescriptions-work', '/assets/images/editorial-adhd-keys.jpg', 'How Online Prescriptions Work', 'Safety, oversight, and refill basics.'),
      readingCard('/blog/telehealth-prescriptions-how-online-treatment-works', '/assets/images/editorial-energy-afternoon.jpg', 'Online Treatment Overview', 'How virtual treatment pathways work.'),
      readingCard('/blog/why-am-i-always-tired-causes-when-to-see-doctor', '/assets/images/editorial-exhausted-morning.jpg', 'Why Am I Always Tired?', 'Common reasons adults book a visit.'),
      readingCard('/blog/telehealth', '/assets/images/editorial-burnout-afterwork.jpg', 'Telehealth Article Hub', 'More guides on virtual care.'),
    ],
  });
  html = html.replace(/<!-- SIYA:LEARN-MORE-TELE -->[\s\S]*?<!-- \/SIYA:LEARN-MORE-TELE -->/, teleReading);

  const md = mdMessage({
    heading: 'A Message From Dr. Sneh Pandey',
    lead: 'Care that respects your time—without cutting clinical corners.',
    quote: 'Telehealth should feel like real medicine—not a shortcut around judgment.',
    paragraphs: [
      '<a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey, MD</a> · Medical Director · Internal Medicine.',
      'We built Siya so adults could reach a licensed clinician without rearranging their entire week—while still getting thoughtful evaluation and clear follow-up.',
    ],
  });
  if (!html.includes('id="medical-director-message"')) {
    html = html.replace('<!-- SIYA:MEET-PHYSICIANS -->', `${md}\n\n<!-- SIYA:MEET-PHYSICIANS -->`);
  }

  html = html.replace(
    /(<!-- FINAL CTA -->[\s\S]*?<div class="cta-band-buttons">)[\s\S]*?(<\/div>)/,
    `$1\n              ${meetBtn('final-cta', 'telehealth', 'telehealth')}\n              ${chatBtn('final-cta', 'telehealth', 'telehealth')}\n            $2`,
  );

  // Meta description CA consistency (factual)
  html = html.replace(
    /Primary care, urgent care, prescriptions, labs\. TX, PA, FL\./g,
    'Primary care, urgent care, prescriptions, labs. CA, TX, PA, FL.',
  );

  if (!html.includes('trust-metrics.js')) {
    html = html.replace('</body>', '    <script src="/trust-metrics.js"></script>\n</body>');
  }
  return html;
}

function main() {
  const jobs = [
    ['weight-loss-metabolic-health.html', polishWeight],
    ['mens-health-longevity.html', polishMens],
    ['telehealth.html', polishTele],
  ];
  for (const [rel, fn] of jobs) {
    const fp = path.join(ROOT, rel);
    let html = fs.readFileSync(fp, 'utf8');
    html = fn(html);
    fs.writeFileSync(fp, html);
    console.log(`Updated ${rel}`);
  }
}

main();
