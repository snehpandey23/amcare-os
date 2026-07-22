/**
 * Durable inbound links + Women's ADHD hub integrity (CTAs / references).
 * Run after final generate-answer-pages.mjs AND after seo-build.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const HUB = '/blog/adhd-in-women';
const MARKER = 'women-hub-2026-07';
const HUB_FILE = 'blog/adhd-in-women.html';

const ANSWER_INBOUNDS = [
  {
    file: 'answers/late-adhd-diagnosis-adults.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">late ADHD diagnosis in women</a>.</p>`,
  },
  {
    file: 'answers/rejection-sensitivity-adhd.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">how ADHD can present differently in women</a>.</p>`,
  },
  {
    file: 'answers/adhd-vs-anxiety.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">ADHD in women</a> (masking, burnout, and anxiety overlap).</p>`,
  },
  {
    file: 'answers/executive-dysfunction-adhd.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">women’s ADHD symptoms and evaluation</a>.</p>`,
  },
];

const BLOG_INBOUNDS = [
  {
    file: 'blog/how-to-know-if-you-have-adhd-adult.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">signs of ADHD in adult women</a>.</p>`,
  },
  {
    file: 'blog/adhd-symptoms-overlooked.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">why ADHD is often missed in women</a>.</p>`,
  },
  {
    file: 'blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">undiagnosed ADHD patterns in women</a>.</p>`,
  },
];

const INLINE_CTA = `<!-- SIYA:BLOG-CTA-ADHD -->
            <aside class="blog-inline-cta blog-inline-cta--adhd" aria-labelledby="blog-cta-adhd-heading">
              <p id="blog-cta-adhd-heading" class="blog-inline-cta-title">Wondering if ADHD is part of your story?</p>
              <p>Book a free Meet &amp; Greet to talk it through, or start a physician-led ADHD evaluation when you are ready. Screening alone is not a diagnosis.</p>
              <div class="blog-inline-cta-actions">
                <a class="button ds-button ds-button--primary" href="/redirect/meet-greet" data-siya-track="meet_greet_click" data-siya-location="blog-cta-adhd" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="meetGreet" data-component="button">Book Free Meet &amp; Greet</a>
                <a class="button ds-button ds-button--secondary secondary" href="/adhd-care" data-siya-track="adhd_care_click" data-siya-location="blog-cta-adhd" data-page-type="adhd" data-intent="adhd" data-conversion-goal="evaluation" data-component="button">Start an ADHD Evaluation</a>
              </div>
              <p class="blog-inline-cta-links">Or begin with a <a href="/adhd-screening">free ADHD screening</a>.</p>
            </aside>
            <!-- /SIYA:BLOG-CTA-ADHD -->`;

const FINAL_CTA = `<section class="section blog-final-cta">
        <div class="container">
          <div class="ds-cta-block cta-band">
            <h3 class="ds-cta-block__title">Ready for clarity—not another self-blame cycle?</h3>
            <p class="ds-cta-block__text">Book a free Meet &amp; Greet, or start a structured ADHD evaluation with a licensed clinician.</p>
            <div class="ds-cta-block__actions cta-band-buttons">
              <a class="button ds-button ds-button--primary" href="/redirect/meet-greet" data-siya-track="meet_greet_click" data-siya-location="blog-final-cta" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="meetGreet" data-component="button">Book Free Meet &amp; Greet</a>
              <a class="button ds-button ds-button--secondary secondary" href="/adhd-care" data-siya-track="adhd_care_click" data-siya-location="blog-final-cta" data-page-type="adhd" data-intent="adhd" data-conversion-goal="evaluation" data-component="button">Start an ADHD Evaluation</a>
            </div>
          </div>
        </div>
      </section>`;

const REFERENCES_OL = `<h2>References</h2>
<ol>
<li>American Psychiatric Association. <em>Diagnostic and Statistical Manual of Mental Disorders</em> (DSM-5-TR). Attention-Deficit/Hyperactivity Disorder diagnostic criteria.</li>
<li>Centers for Disease Control and Prevention (CDC). Attention-Deficit/Hyperactivity Disorder (ADHD) — data and statistics, signs and symptoms in adults. cdc.gov/adhd.</li>
<li>National Institute of Mental Health (NIMH). Attention-Deficit/Hyperactivity Disorder in Adults. nimh.nih.gov.</li>
<li>Young, S., Adamo, N., Ásgeirsdóttir, B.B., et al. (2020). Females with ADHD: An expert consensus statement taking a lifespan approach providing guidance for the identification and treatment of attention-deficit/hyperactivity disorder in girls and women. <em>BMC Psychiatry</em>.</li>
<li>Quinn, P.O., &amp; Madhoo, M. (2014). A review of attention-deficit/hyperactivity disorder in women and girls: uncovering this hidden diagnosis. <em>The Primary Care Companion for CNS Disorders</em>.</li>
<li>Attoe, D.E., &amp; Climie, E.A. (2023). Miss. Diagnosis: A Systematic Review of ADHD in Adult Women. <em>Journal of Attention Disorders</em>.</li>
<li>North American Menopause Society (NAMS). Perimenopause and menopause symptom overview, including cognitive changes (&quot;brain fog&quot;). menopause.org.</li>
<li>American College of Obstetricians and Gynecologists (ACOG). Perimenopause — patient education materials. acog.org.</li>
<li>U.S. Food and Drug Administration (FDA). Lisdexamfetamine (Vyvanse) prescribing information, including binge eating disorder indication and ADHD indication.</li>
<li>Nazar, B.P., et al.; Cortese, S., et al. — clinical literature on ADHD, impulsivity, reward processing, and disordered eating patterns referenced in the discussion of ADHD, eating patterns, and food noise.</li>
</ol>`;

function upsertLinkPass(rel, block) {
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) {
    console.warn(`  skip missing ${rel}`);
    return false;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  const re = new RegExp(
    `<p class="siya-link-pass" data-link-pass="${MARKER}">[\\s\\S]*?</p>\\n?`,
  );
  if (re.test(html)) {
    html = html.replace(re, `${block}\n`);
    fs.writeFileSync(filePath, html, 'utf8');
    return true;
  }
  const anchors = [
    '<p class="cta-microcopy">',
    '<aside class="answer-ask-siya"',
    '<section class="related-articles"',
    '<p class="siya-link-pass" data-link-pass="adhd-arch-2026-07">',
    '</div>\n        </div>\n      </article>',
  ];
  for (const a of anchors) {
    if (html.includes(a)) {
      html = html.replace(a, `${block}\n${a}`);
      fs.writeFileSync(filePath, html, 'utf8');
      return true;
    }
  }
  console.warn(`  could not place link in ${rel}`);
  return false;
}

function ensureWomenFaqHubPointers() {
  const rel = 'answers/adhd-in-women.html';
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  const callout = `<p class="answer-hub-callout" data-link-pass="${MARKER}">For depth on masking, hormones, perimenopause, and late diagnosis, read <a href="${HUB}">our full guide to ADHD in women</a>.</p>`;
  if (!html.includes('answer-hub-callout')) {
    html = html.replace(
      '</section>\n\n            <figure class="blog-engage blog-engage--flowchart"',
      `${callout}\n            </section>\n\n            <figure class="blog-engage blog-engage--flowchart"`,
    );
    if (!html.includes('answer-hub-callout')) {
      html = html.replace(
        /(<p class="answer-lead">[\s\S]*?<\/p>)\n(\s*<\/section>)/,
        `$1\n              ${callout}\n$2`,
      );
    }
    changed = html.includes('answer-hub-callout');
  }

  if (changed) fs.writeFileSync(filePath, html, 'utf8');
  return html.includes(`href="${HUB}"`);
}

function ensureHubIntegrity() {
  const filePath = path.join(ROOT, HUB_FILE);
  if (!fs.existsSync(filePath)) {
    console.warn(`  skip missing ${HUB_FILE}`);
    return false;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // References: must be 10 discrete list items (not one collapsed <li>)
  const refMatch = html.match(/<h2>References<\/h2>\s*<ol>([\s\S]*?)<\/ol>/);
  const liCount = refMatch ? (refMatch[1].match(/<li>/g) || []).length : 0;
  if (liCount !== 10) {
    if (/<h2>References<\/h2>\s*<ol>[\s\S]*?<\/ol>/.test(html)) {
      html = html.replace(/<h2>References<\/h2>\s*<ol>[\s\S]*?<\/ol>/, REFERENCES_OL);
      changed = true;
    }
  }

  // Inline CTA: Meet & Greet + Start Evaluation
  if (html.includes('<!-- SIYA:BLOG-CTA-ADHD -->')) {
    const next = html.replace(
      /<!-- SIYA:BLOG-CTA-ADHD -->[\s\S]*?<!-- \/SIYA:BLOG-CTA-ADHD -->/,
      INLINE_CTA,
    );
    if (next !== html) {
      html = next;
      changed = true;
    }
  }

  // Final CTA band
  if (html.includes('blog-final-cta')) {
    const next = html.replace(
      /<section class="section blog-final-cta">[\s\S]*?<\/section>/,
      FINAL_CTA,
    );
    if (next !== html) {
      html = next;
      changed = true;
    }
  }

  // Getting Help awkward "booking a Book Free..."
  if (html.includes('booking a <strong><a href="/redirect/meet-greet">Book Free Meet')) {
    html = html.replace(
      'booking a <strong><a href="/redirect/meet-greet">Book Free Meet &amp; Greet</a></strong>',
      'booking a <strong><a href="/redirect/meet-greet">Free Meet &amp; Greet</a></strong>',
    );
    changed = true;
  }

  if (changed) fs.writeFileSync(filePath, html, 'utf8');

  const verify = fs.readFileSync(filePath, 'utf8');
  const refsOk =
    ((verify.match(/<h2>References<\/h2>\s*<ol>([\s\S]*?)<\/ol>/) || [])[1] || '').match(/<li>/g)
      ?.length === 10;
  const finalHasEval = /blog-final-cta[\s\S]*?Start an ADHD Evaluation/.test(verify);
  const finalHasMeet = /blog-final-cta[\s\S]*?Book Free Meet/.test(verify);
  const finalNoScreenPrimary = !/blog-final-cta[\s\S]*?>Take Free ADHD Screening</.test(verify);
  const inlineHasEval = /blog-cta-adhd[\s\S]*?Start an ADHD Evaluation/.test(verify);

  console.log(
    `Women ADHD hub integrity: refs=${refsOk ? 'ok' : 'FAIL'} finalCTA=${finalHasMeet && finalHasEval && finalNoScreenPrimary ? 'ok' : 'FAIL'} inlineEval=${inlineHasEval ? 'ok' : 'FAIL'}`,
  );
  return refsOk && finalHasMeet && finalHasEval && finalNoScreenPrimary && inlineHasEval;
}

function main() {
  let ok = 0;
  const all = [...ANSWER_INBOUNDS, ...BLOG_INBOUNDS];
  for (const item of all) {
    if (upsertLinkPass(item.file, item.html)) ok += 1;
  }
  if (ensureWomenFaqHubPointers()) ok += 1;
  const hubOk = ensureHubIntegrity();
  console.log(`Women ADHD hub inbound: patched ${ok}/${all.length + 1} targets; hubIntegrity=${hubOk}`);
  if (!hubOk) process.exitCode = 1;
}

main();
