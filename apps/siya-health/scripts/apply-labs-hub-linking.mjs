/**
 * Durable Labs internal links + pathway "common labs" chips.
 * Runs after generate-answer-pages / generate-labs-pages in the build.
 * Uses SIYA:LABS-* markers so re-runs are idempotent.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, html) {
  fs.writeFileSync(path.join(ROOT, rel), html);
}

function upsertMarkerBlock(html, marker, block) {
  const start = `<!-- SIYA:${marker} -->`;
  const end = `<!-- /SIYA:${marker} -->`;
  const wrapped = `${start}\n${block}\n${end}`;
  if (html.includes(start)) {
    return html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), wrapped);
  }
  if (html.includes('<!-- FINAL CTA -->')) {
    return html.replace('<!-- FINAL CTA -->', `${wrapped}\n      <!-- FINAL CTA -->`);
  }
  if (html.includes('</main>')) {
    return html.replace('</main>', `      ${wrapped}\n    </main>`);
  }
  return html + wrapped;
}

function softStrip(html, marker) {
  const start = `<!-- SIYA:${marker} -->`;
  const end = `<!-- /SIYA:${marker} -->`;
  if (!html.includes(start)) return html;
  return html.replace(new RegExp(`${start}[\\s\\S]*?${end}\\s*`), '');
}

function chipsBlock({ title, items, href, cta, ctaExtra = '' }) {
  const lis = items.map((i) => `<li>${i}</li>`).join('\n            ');
  return `      <aside class="labs-pathway-chips" aria-label="Common labs">
        <h3>${title}</h3>
        <ul>
            ${lis}
        </ul>
        <p class="cta-microcopy" style="margin:0;"><a href="${href}">${cta}</a>${ctaExtra}</p>
      </aside>`;
}

/** Content pages → topic labs (never Rupa). */
const CONTENT_LINKS = [
  {
    file: 'blog/why-am-i-always-tired-causes-when-to-see-doctor.html',
    marker: 'LABS-LINK-FATIGUE',
    html: `      <section class="section section-tinted" aria-label="Fatigue labs">
        <div class="container">
          <p class="lead" style="margin:0;">Fatigue often has overlapping causes. When appropriate, explore <a href="/labs/fatigue-brain-fog">fatigue &amp; brain fog labs</a>—or <a href="/labs/how-to-read-results">how to read your lab results</a> with Siya.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/why-normal-labs-dont-mean-healthy.html',
    marker: 'LABS-LINK-NORMAL',
    html: `      <section class="section section-tinted" aria-label="Labs next step">
        <div class="container">
          <p class="lead" style="margin:0;">When testing is part of your next step, start with <a href="/labs">physician-guided labs &amp; blood tests</a>. Then read <a href="/labs/how-to-read-results">how to read your results</a> without panicking over a single number.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/which-preventive-blood-tests-adults.html',
    marker: 'LABS-LINK-PREVENTIVE-TESTS',
    html: `      <section class="section section-tinted" aria-label="Preventive labs next steps">
        <div class="container">
          <p class="lead" style="margin:0;">Explore <a href="/labs/preventive">preventive &amp; wellness labs</a>, pair with <a href="/primary-urgent-care">primary &amp; urgent care</a>, review <a href="/pricing">follow-up pricing</a>, and read <a href="/labs/how-to-read-results">how to read your results</a>—Siya interprets; ordering logistics alone are not a diagnosis.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/what-to-do-after-lab-results.html',
    marker: 'LABS-LINK-AFTER-RESULTS',
    html: `      <section class="section section-tinted" aria-label="After lab results next steps">
        <div class="container">
          <p class="lead" style="margin:0;">Start with <a href="/labs/how-to-read-results">how to read your lab results</a>, then <a href="/redirect/meet-greet">book a free meet &amp; greet</a> when you want interpretation—and see <a href="/pricing">follow-up plans &amp; pricing</a> when ongoing care fits.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/normal-a1c-insulin-resistance.html',
    marker: 'LABS-LINK-A1C',
    html: `      <section class="section section-tinted" aria-label="A1c labs">
        <div class="container">
          <p class="lead" style="margin:0;">Exploring blood sugar markers? <a href="/labs/a1c-blood-sugar">View A1c &amp; blood sugar testing</a> on Siya&rsquo;s labs hub.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/perimenopause-brain-fog.html',
    marker: 'LABS-LINK-MIDLIFE-BLOG',
    html: `      <section class="section section-tinted" aria-label="Midlife labs">
        <div class="container">
          <p class="lead" style="margin:0;">Hormone panels alone usually do not diagnose perimenopause. For overlapping iron, thyroid, or metabolic questions, see <a href="/labs/womens-midlife">women&rsquo;s midlife lab evaluation</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html',
    marker: 'LABS-LINK-T',
    html: `      <section class="section section-tinted" aria-label="Testosterone labs">
        <div class="container">
          <p class="lead" style="margin:0;">Testosterone results need clinical context. Review <a href="/labs/mens-health">men&rsquo;s health lab options</a> when you and your clinician decide testing is appropriate.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/what-is-insulin-resistance.html',
    marker: 'LABS-LINK-IR',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Metabolic markers are one piece of the picture. Explore <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a> when clinically appropriate.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/insulin-resistance-without-diabetes.html',
    marker: 'LABS-LINK-IR2',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;"><a href="/labs/a1c-blood-sugar">A1c &amp; metabolic lab options</a> can support evaluation when history suggests it—results still need clinical context.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/insulin-resistance-and-weight-loss-clinician-overview.html',
    marker: 'LABS-LINK-IR3',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Baseline metabolic labs may be part of weight-management care. See <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/what-does-low-testosterone-feel-like.html',
    marker: 'LABS-LINK-LOW-T',
    html: `      <section class="section section-tinted" aria-label="Hormone labs">
        <div class="container">
          <p class="lead" style="margin:0;">If testing is appropriate, start with education on <a href="/labs/mens-health">men&rsquo;s health labs</a>—not a single number as a diagnosis.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/when-is-testosterone-therapy-appropriate.html',
    marker: 'LABS-LINK-TRT',
    html: `      <section class="section section-tinted" aria-label="Hormone labs">
        <div class="container">
          <p class="lead" style="margin:0;">Lab criteria are only one part of TRT decisions. Review <a href="/labs/mens-health">men&rsquo;s health lab evaluation</a> in context with a clinician.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/iron-deficiency-brain-fog-adhd.html',
    marker: 'LABS-LINK-IRON',
    html: `      <section class="section section-tinted" aria-label="Iron labs">
        <div class="container">
          <p class="lead" style="margin:0;"><strong>Blood tests do not diagnose ADHD.</strong> Iron studies may help evaluate fatigue or brain fog contributors when indicated—see <a href="/labs/adhd-support">labs &amp; ADHD evaluation support</a>, <a href="/labs/iron-ferritin">iron &amp; ferritin testing</a>, or <a href="/labs/fatigue-brain-fog">fatigue &amp; brain fog labs</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html',
    marker: 'LABS-LINK-SLEEP',
    html: `      <section class="section section-tinted" aria-label="Fatigue labs">
        <div class="container">
          <p class="lead" style="margin:0;">Fatigue and metabolic risk often overlap. See <a href="/labs/fatigue-brain-fog">fatigue-related lab options</a> when a clinician recommends testing.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/what-is-free-testosterone.html',
    marker: 'LABS-LINK-FREE-T',
    html: `      <section class="section section-tinted" aria-label="Hormone labs">
        <div class="container">
          <p class="lead" style="margin:0;">Learn more about <a href="/labs/mens-health">men&rsquo;s health lab options</a> when free vs total testosterone testing is being considered.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/glp-1-side-effects.html',
    marker: 'LABS-LINK-GLP1',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Monitoring labs may be part of GLP-1 care. Browse <a href="/labs/a1c-blood-sugar">metabolic lab options</a> or the full <a href="/labs">labs hub</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/semaglutide-weight-loss-how-it-works.html',
    marker: 'LABS-LINK-SEMA',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Baseline and follow-up labs are often discussed in medical weight loss. See <a href="/labs/a1c-blood-sugar">A1c &amp; metabolic testing</a>.</p>
        </div>
      </section>`,
  },
  // --- Additional durable content → topic labs (~15–25 beyond the originals) ---
  {
    file: 'answers/why-am-i-tired-even-after-sleeping.html',
    marker: 'LABS-LINK-TIRED-SLEEP',
    html: `      <section class="section section-tinted" aria-label="Fatigue labs">
        <div class="container">
          <p class="lead" style="margin:0;">Unrefreshing sleep has many causes. When labs are appropriate, explore <a href="/labs/fatigue-brain-fog">fatigue &amp; brain fog labs</a>, <a href="/labs/iron-ferritin">iron &amp; ferritin</a>, <a href="/labs/thyroid">thyroid testing</a>, or <a href="/labs/vitamin-b12">vitamin B12</a>—then <a href="/labs/how-to-read-results">how to read results</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/can-sleep-apnea-cause-fatigue.html',
    marker: 'LABS-LINK-OSA-FATIGUE',
    html: `      <section class="section section-tinted" aria-label="Fatigue labs">
        <div class="container">
          <p class="lead" style="margin:0;">Sleep apnea is often the priority; labs may still help when fatigue has overlapping causes. See <a href="/labs/fatigue-brain-fog">fatigue &amp; brain fog lab options</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/afternoon-energy-crash-after-lunch.html',
    marker: 'LABS-LINK-AFTERNOON-CRASH',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Post-lunch crashes can overlap with blood sugar patterns. When clinically appropriate, review <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a> or <a href="/labs/fatigue-brain-fog">fatigue-related labs</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/brain-fog-after-eating.html',
    marker: 'LABS-LINK-POST-MEAL-FOG',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Post-meal brain fog is often metabolic—not a diagnosis by itself. Explore <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a> and <a href="/labs/fatigue-brain-fog">fatigue &amp; brain fog labs</a> when a clinician recommends it.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/signs-of-sleep-apnea-in-adults.html',
    marker: 'LABS-LINK-OSA-SIGNS',
    html: `      <section class="section section-tinted" aria-label="Fatigue labs">
        <div class="container">
          <p class="lead" style="margin:0;">Apnea evaluation comes first for snoring and unrefreshing sleep. For overlapping metabolic or fatigue questions, see <a href="/labs/fatigue-brain-fog">fatigue lab options</a> or <a href="/labs/a1c-blood-sugar">A1c &amp; metabolic testing</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/insomnia-treatment-options-beyond-medication.html',
    marker: 'LABS-LINK-INSOMNIA',
    html: `      <section class="section section-tinted" aria-label="Fatigue labs">
        <div class="container">
          <p class="lead" style="margin:0;">Insomnia care is not only a prescription question. When daytime fatigue persists, clinicians may discuss <a href="/labs/fatigue-brain-fog">fatigue &amp; brain fog labs</a> or <a href="/labs/thyroid">thyroid testing</a> in context.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/high-shbg-low-free-testosterone.html',
    marker: 'LABS-LINK-SHBG',
    html: `      <section class="section section-tinted" aria-label="Hormone labs">
        <div class="container">
          <p class="lead" style="margin:0;">SHBG and free testosterone need clinical interpretation—not a portal screenshot. Review <a href="/labs/mens-health">men&rsquo;s health lab options</a> and <a href="/labs/how-to-read-results">how to read lab results</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/trt-monitoring-requirements.html',
    marker: 'LABS-LINK-TRT-MONITOR',
    html: `      <section class="section section-tinted" aria-label="Hormone labs">
        <div class="container">
          <p class="lead" style="margin:0;">TRT monitoring is a care plan, not a one-time shop. See <a href="/labs/mens-health">men&rsquo;s health lab evaluation</a> for the kinds of markers clinicians may follow over time.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/when-is-testosterone-therapy-appropriate.html',
    marker: 'LABS-LINK-TRT-BLOG',
    html: `      <section class="section section-tinted" aria-label="Hormone labs">
        <div class="container">
          <p class="lead" style="margin:0;">Lab criteria are only one part of TRT decisions. Browse <a href="/labs/mens-health">men&rsquo;s health labs</a> when you and your clinician decide testing is appropriate.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/testosterone-and-adhd-overlap.html',
    marker: 'LABS-LINK-T-ADHD',
    html: `      <section class="section section-tinted" aria-label="ADHD and labs">
        <div class="container">
          <p class="lead" style="margin:0;"><strong>Blood tests do not diagnose ADHD.</strong> Low testosterone and ADHD can overlap in symptoms; labs may help evaluate other contributors—not replace a clinical ADHD evaluation. Start with <a href="/labs/adhd-support">labs &amp; ADHD evaluation support</a>, or <a href="/labs/mens-health">men&rsquo;s health labs</a> when hormone testing is indicated.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/adhd-hormones-women.html',
    marker: 'LABS-LINK-ADHD-HORMONES',
    html: `      <section class="section section-tinted" aria-label="ADHD and midlife labs">
        <div class="container">
          <p class="lead" style="margin:0;"><strong>Blood tests do not diagnose ADHD.</strong> Hormone shifts can change how ADHD feels, but labs are not an ADHD diagnosis. See <a href="/labs/adhd-support">labs &amp; ADHD evaluation support</a> and, for overlapping midlife questions, <a href="/labs/womens-midlife">women&rsquo;s midlife lab evaluation</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/adhd-in-women.html',
    marker: 'LABS-LINK-ADHD-WOMEN-BLOG',
    html: `      <section class="section section-tinted" aria-label="ADHD and labs">
        <div class="container">
          <p class="lead" style="margin:0;"><strong>Blood tests do not diagnose ADHD.</strong> When fatigue, iron, thyroid, or midlife overlap is part of the story, read <a href="/labs/adhd-support">labs &amp; ADHD evaluation support</a> or <a href="/labs/womens-midlife">women&rsquo;s midlife labs</a>—not a storefront shortcut.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/adhd-in-women.html',
    marker: 'LABS-LINK-ADHD-WOMEN-ANS',
    html: `      <section class="section section-tinted" aria-label="ADHD and labs">
        <div class="container">
          <p class="lead" style="margin:0;"><strong>Blood tests do not diagnose ADHD.</strong> Selected labs may help look for other contributors to fatigue or brain fog. Explore <a href="/labs/adhd-support">labs &amp; ADHD evaluation support</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/poor-sleep-feels-like-adhd.html',
    marker: 'LABS-LINK-SLEEP-ADHD',
    html: `      <section class="section section-tinted" aria-label="ADHD and labs">
        <div class="container">
          <p class="lead" style="margin:0;"><strong>Blood tests do not diagnose ADHD.</strong> Poor sleep can mimic attention problems; labs may sometimes evaluate other medical contributors. See <a href="/labs/adhd-support">labs &amp; ADHD evaluation support</a> and <a href="/labs/fatigue-brain-fog">fatigue &amp; brain fog labs</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/adhd-vs-burnout.html',
    marker: 'LABS-LINK-ADHD-BURNOUT',
    html: `      <section class="section section-tinted" aria-label="ADHD and labs">
        <div class="container">
          <p class="lead" style="margin:0;"><strong>Blood tests do not diagnose ADHD.</strong> Burnout, iron deficiency, thyroid issues, and ADHD can feel similar. Start with clinical evaluation—and when testing is discussed, use <a href="/labs/adhd-support">labs &amp; ADHD evaluation support</a> or <a href="/labs/iron-ferritin">iron &amp; ferritin</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/signs-of-adult-adhd.html',
    marker: 'LABS-LINK-ADHD-SIGNS',
    html: `      <section class="section section-tinted" aria-label="ADHD and labs">
        <div class="container">
          <p class="lead" style="margin:0;"><strong>Blood tests do not diagnose ADHD.</strong> Screening and history come first. If a clinician discusses labs for overlapping fatigue or medical contributors, see <a href="/labs/adhd-support">labs &amp; ADHD evaluation support</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/semaglutide-for-weight-loss-how-it-works.html',
    marker: 'LABS-LINK-SEMA-BLOG',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Baseline and follow-up metabolic labs are often part of GLP-1 care. Browse <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/glp1-side-effects-and-how-to-manage-them.html',
    marker: 'LABS-LINK-GLP1-BLOG',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Monitoring may include metabolic markers and, in selective cases, nutrients such as B12. See <a href="/labs/a1c-blood-sugar">A1c &amp; metabolic labs</a> and <a href="/labs/vitamin-b12">vitamin B12 testing</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/medical-weight-loss-vs-dieting-what-actually-works.html',
    marker: 'LABS-LINK-MWL-BLOG',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Medical weight loss often includes metabolic baselines. Explore <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a> or the full <a href="/labs">labs hub</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/medical-weight-loss-vs-dieting.html',
    marker: 'LABS-LINK-MWL-ANS',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">When clinicians discuss metabolic baselines before or during weight care, start with <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/tirzepatide-vs-semaglutide-which-is-better.html',
    marker: 'LABS-LINK-TIRZ',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">A1c, lipids, and kidney function often inform GLP-1 choices. Review <a href="/labs/a1c-blood-sugar">A1c &amp; metabolic lab options</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/who-qualifies-glp-1-weight-loss.html',
    marker: 'LABS-LINK-GLP1-QUAL',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Eligibility decisions use history and labs together. See <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a> when metabolic markers are part of the conversation.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/medical-weight-loss-glp1-semaglutide-texas.html',
    marker: 'LABS-LINK-GLP1-TX',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Texas medical weight-loss care often includes metabolic labs. Browse <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'answers/weight-gain-after-stopping-ozempic.html',
    marker: 'LABS-LINK-OZEMPIC-STOP',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">After stopping a GLP-1, clinicians may reassess metabolic markers over time. See <a href="/labs/a1c-blood-sugar">A1c &amp; metabolic testing</a> and <a href="/labs/how-to-read-results">how to read results</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/telehealth-prescriptions-how-online-treatment-works.html',
    marker: 'LABS-LINK-PREVENTIVE-TELE',
    html: `      <section class="section section-tinted" aria-label="Preventive labs">
        <div class="container">
          <p class="lead" style="margin:0;">Online prescribing does not replace preventive milestones. When routine labs are discussed, start with <a href="/labs/preventive">preventive lab options</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/how-to-safely-get-prescriptions-online.html',
    marker: 'LABS-LINK-PREVENTIVE-RX',
    html: `      <section class="section section-tinted" aria-label="Preventive labs">
        <div class="container">
          <p class="lead" style="margin:0;">Safe telehealth includes knowing when screenings and labs still matter. Explore <a href="/labs/preventive">preventive labs</a> or <a href="/labs/how-to-read-results">how to read lab results</a>.</p>
        </div>
      </section>`,
  },
  {
    file: 'blog/phentermine-for-weight-loss-safety-and-effectiveness.html',
    marker: 'LABS-LINK-PHENTERMINE',
    html: `      <section class="section section-tinted" aria-label="Metabolic labs">
        <div class="container">
          <p class="lead" style="margin:0;">Weight medications are one tool; metabolic context still matters. See <a href="/labs/a1c-blood-sugar">A1c &amp; blood sugar testing</a> when clinically appropriate.</p>
        </div>
      </section>`,
  },
];

const PATHWAY_CHIPS = [
  {
    file: 'womens-midlife-health.html',
    marker: 'LABS-CHIPS-MIDLIFE',
    block: chipsBlock({
      title: 'Common labs your clinician may consider',
      items: [
        'Iron / ferritin',
        'Thyroid (e.g., TSH)',
        'Vitamin B12',
        'Vitamin D',
        'Metabolic markers (e.g., A1c, lipids) when appropriate',
      ],
      href: '/labs/womens-midlife',
      cta: 'Browse women’s midlife lab options',
    }),
  },
  {
    file: 'mens-health-longevity.html',
    marker: 'LABS-CHIPS-MENS',
    block: chipsBlock({
      title: 'Common labs your clinician may consider',
      items: [
        'Testosterone (when clinically appropriate)',
        'CBC &amp; metabolic panel',
        'Lipids &amp; A1c',
        'Other endocrine markers based on history',
      ],
      href: '/labs/mens-health',
      cta: 'Browse men’s health lab options',
      ctaExtra: ' · <a href="/labs/how-to-read-results">How to read results</a>',
    }),
  },
  {
    file: 'weight-loss-metabolic-health.html',
    marker: 'LABS-CHIPS-WEIGHT',
    block: chipsBlock({
      title: 'Common labs your clinician may consider',
      items: ['Hemoglobin A1c', 'Lipid panel', 'Comprehensive metabolic panel', 'TSH when indicated'],
      href: '/labs/a1c-blood-sugar',
      cta: 'Browse weight &amp; metabolic lab options',
      ctaExtra: ' · <a href="/pricing">Follow-up plans</a>',
    }),
  },
  {
    file: 'primary-urgent-care.html',
    marker: 'LABS-CHIPS-PRIMARY',
    block: chipsBlock({
      title: 'Common labs your clinician may consider',
      items: ['CBC', 'Comprehensive metabolic panel', 'Lipid panel', 'Hemoglobin A1c'],
      href: '/labs/preventive',
      cta: 'Browse preventive lab options',
    }),
  },
  {
    file: 'blog/why-am-i-always-tired-causes-when-to-see-doctor.html',
    marker: 'LABS-CHIPS-FATIGUE',
    block: chipsBlock({
      title: 'Common labs your clinician may consider',
      items: ['CBC', 'Ferritin / iron studies', 'TSH', 'Vitamin B12', 'Vitamin D', 'A1c when metabolic risk is present'],
      href: '/labs/fatigue-brain-fog',
      cta: 'Browse fatigue &amp; brain fog labs',
    }),
  },
  {
    file: 'blog/perimenopause-brain-fog.html',
    marker: 'LABS-CHIPS-BRAIN-FOG',
    block: chipsBlock({
      title: 'Common labs your clinician may consider',
      items: ['Iron / ferritin', 'Thyroid', 'Vitamin B12', 'Vitamin D', 'Metabolic markers when appropriate'],
      href: '/labs/womens-midlife',
      cta: 'Browse midlife lab options',
    }),
  },
];

let n = 0;
for (const row of CONTENT_LINKS) {
  const full = path.join(ROOT, row.file);
  if (!fs.existsSync(full)) {
    console.warn('SKIP missing', row.file);
    continue;
  }
  let html = read(row.file);
  html = softStrip(html, row.marker);
  // Also remove old unmarked soft inserts that duplicated
  html = upsertMarkerBlock(html, row.marker, row.html);
  write(row.file, html);
  console.log('OK link', row.file);
  n += 1;
}

for (const row of PATHWAY_CHIPS) {
  const full = path.join(ROOT, row.file);
  if (!fs.existsSync(full)) {
    console.warn('SKIP missing', row.file);
    continue;
  }
  let html = read(row.file);
  html = softStrip(html, row.marker);
  html = upsertMarkerBlock(html, row.marker, row.block);
  write(row.file, html);
  console.log('OK chips', row.file);
  n += 1;
}

console.log(`Labs linking/chips applied: ${n} files`);

// Health Guides hub: optional Labs jump (careFunnel-style — only when answers/index exists).
// Idempotent SIYA:LABS-HUB-JUMP; re-runs replace in place. Topic pages only (never Rupa).
{
  const hub = 'answers/index.html';
  if (fs.existsSync(path.join(ROOT, hub))) {
    let html = read(hub);
    const marker = 'LABS-HUB-JUMP';
    const inner =
      `Also explore <a href="/labs">Labs &amp; Blood Tests</a> · <a href="/labs/how-to-read-results">How to read lab results</a> · markers: <a href="/labs/thyroid">thyroid</a>, <a href="/labs/iron-ferritin">ferritin</a>, <a href="/labs/a1c-blood-sugar">A1c</a>, <a href="/labs/vitamin-b12">B12</a>, <a href="/labs/mens-health">testosterone</a>, <a href="/labs/fatigue-brain-fog">fatigue</a>, <a href="/labs/womens-midlife">midlife</a>, <a href="/labs/preventive">preventive</a>`;
    const block = `            <p class="health-guides-hub-jump-links"><!-- SIYA:${marker} -->${inner}<!-- /SIYA:${marker} --></p>`;
    html = html.replace(
      /\s*<p class="health-guides-hub-jump-links"><!-- SIYA:LABS-HUB-JUMP -->[\s\S]*?<!-- \/SIYA:LABS-HUB-JUMP --><\/p>/g,
      '',
    );
    if (html.includes('health-guides-hub-jump-links')) {
      html = html.replace(
        /(<p class="health-guides-hub-jump-links">[\s\S]*?<\/p>)/,
        `$1\n${block}`,
      );
    } else {
      html = html.replace('</main>', `      ${block}\n    </main>`);
    }
    write(hub, html);
    console.log('OK answers hub labs jump');
  }
}
