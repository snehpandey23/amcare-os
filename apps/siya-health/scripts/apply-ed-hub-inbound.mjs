/**
 * Durable inbound links + Executive Dysfunction pillar integrity (CTAs).
 * Run after final generate-answer-pages.mjs AND after seo-build.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const HUB = '/blog/executive-dysfunction-adhd';
const MARKER = 'ed-hub-2026-07';
const HUB_FILE = 'blog/executive-dysfunction-adhd.html';

const INBOUNDS = [
  {
    file: 'answers/time-blindness-adhd.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">executive dysfunction and time blindness</a>.</p>`,
  },
  {
    file: 'answers/adhd-vs-anxiety.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">executive dysfunction in ADHD</a>.</p>`,
  },
  {
    file: 'answers/adhd-vs-burnout.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">ADHD executive dysfunction vs burnout</a>.</p>`,
  },
  {
    file: 'answers/late-adhd-diagnosis-adults.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">executive dysfunction patterns in late-diagnosed adults</a>.</p>`,
  },
  {
    file: 'blog/how-to-know-if-you-have-adhd-adult.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">executive dysfunction in adult ADHD</a>.</p>`,
  },
  {
    file: 'blog/adhd-in-women.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">executive dysfunction in ADHD</a>.</p>`,
  },
  {
    file: 'blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">why starting feels impossible (executive dysfunction)</a>.</p>`,
  },
  {
    file: 'blog/adhd-symptoms-overlooked.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">executive dysfunction domains in adult ADHD</a>.</p>`,
  },
  {
    file: 'blog/adhd-and-binge-eating.html',
    html: `<p class="siya-link-pass" data-link-pass="${MARKER}">Related: <a href="${HUB}">executive dysfunction around planning and food</a>.</p>`,
  },
];

const INLINE_CTA = `<!-- SIYA:BLOG-CTA-ADHD -->
            <aside class="blog-inline-cta blog-inline-cta--adhd" aria-labelledby="blog-cta-adhd-heading">
              <p id="blog-cta-adhd-heading" class="blog-inline-cta-title">Does executive dysfunction sound familiar?</p>
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
            <h3 class="ds-cta-block__title">Ready for clarity—not another productivity lecture?</h3>
            <p class="ds-cta-block__text">Book a free Meet &amp; Greet, or start a structured ADHD evaluation with a licensed clinician.</p>
            <div class="ds-cta-block__actions cta-band-buttons">
              <a class="button ds-button ds-button--primary" href="/redirect/meet-greet" data-siya-track="meet_greet_click" data-siya-location="blog-final-cta" data-page-type="adhd" data-intent="adhd" data-conversion-goal="screening" data-cta-slot="meetGreet" data-component="button">Book Free Meet &amp; Greet</a>
              <a class="button ds-button ds-button--secondary secondary" href="/adhd-care" data-siya-track="adhd_care_click" data-siya-location="blog-final-cta" data-page-type="adhd" data-intent="adhd" data-conversion-goal="evaluation" data-component="button">Start an ADHD Evaluation</a>
            </div>
          </div>
        </div>
      </section>`;

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
    '<p class="siya-link-pass" data-link-pass="women-hub-2026-07">',
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

function ensureFaqPointers() {
  const rel = 'answers/executive-dysfunction-adhd.html';
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  const callout = `<p class="answer-hub-callout" data-link-pass="${MARKER}">For depth on task initiation, working memory, planning, and supports, read <a href="${HUB}">our full guide to executive dysfunction in ADHD</a>.</p>`;
  if (!html.includes('answer-hub-callout') || !html.includes(HUB)) {
    if (!html.includes('answer-hub-callout')) {
      html = html.replace(
        /(<p class="answer-lead">[\s\S]*?<\/p>)\n(\s*<\/section>)/,
        `$1\n              ${callout}\n$2`,
      );
    }
  }
  fs.writeFileSync(filePath, html, 'utf8');
  return html.includes(`href="${HUB}"`) || fs.readFileSync(filePath, 'utf8').includes(`href="${HUB}"`);
}

function ensureHubIntegrity() {
  const filePath = path.join(ROOT, HUB_FILE);
  if (!fs.existsSync(filePath)) {
    console.warn(`  skip missing ${HUB_FILE}`);
    return false;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Strip duplicate Medical Review H2 if present
  if (html.includes('<h2>Medical Review')) {
    html = html.replace(/<h2>Medical Review[\s\S]*?(?=<h2>References<\/h2>)/, '');
    changed = true;
  }

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

  if (changed) fs.writeFileSync(filePath, html, 'utf8');
  const verify = fs.readFileSync(filePath, 'utf8');
  const h1Ok = (verify.match(/<h1[^>]*>/g) || []).length === 1;
  const finalOk =
    /blog-final-cta[\s\S]*?Book Free Meet/.test(verify) &&
    /blog-final-cta[\s\S]*?Start an ADHD Evaluation/.test(verify) &&
    !/blog-final-cta[\s\S]*?>Take Free ADHD Screening</.test(verify);
  const inlineOk = /blog-cta-adhd[\s\S]*?Start an ADHD Evaluation/.test(verify);
  console.log(
    `ED hub integrity: h1=${h1Ok ? 'ok' : 'FAIL'} finalCTA=${finalOk ? 'ok' : 'FAIL'} inline=${inlineOk ? 'ok' : 'FAIL'}`,
  );
  return h1Ok && finalOk && inlineOk;
}

function main() {
  let ok = 0;
  for (const item of INBOUNDS) {
    if (upsertLinkPass(item.file, item.html)) ok += 1;
  }
  if (ensureFaqPointers()) ok += 1;
  const hubOk = ensureHubIntegrity();
  console.log(`ED hub inbound: patched ${ok}/${INBOUNDS.length + 1}; hubIntegrity=${hubOk}`);
  if (!hubOk) process.exitCode = 1;
}

main();
