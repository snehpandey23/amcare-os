/**
 * Workplace / working-professionals SEO cluster — internal links + employer strips.
 * Run after generate-employers-page.mjs and before seo-build.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  WORKPLACE_CLUSTER_MARKER,
  WORKPLACE_PATHS,
  renderEmployerHrStrip,
  renderEmployeeWorkplaceStrip,
  renderEmployerRelatedGuidesSection,
} from '../data/workplace-seo-cluster.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const CLUSTER_RE = new RegExp(
  `<aside class="workplace-seo-cluster" data-link-pass="${WORKPLACE_CLUSTER_MARKER}"[\\s\\S]*?</aside>\\n?`,
  'g',
);

const RELATED_SECTION_RE = new RegExp(
  `<section class="section section-tinted" id="related-workplace-guides"[\\s\\S]*?</section>\\n?`,
);

function upsertBlock(rel, block, anchors = []) {
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) {
    console.warn(`  skip missing ${rel}`);
    return false;
  }
  let html = fs.readFileSync(filePath, 'utf8');
  if (CLUSTER_RE.test(html)) {
    html = html.replace(CLUSTER_RE, `${block}\n`);
  } else {
    let placed = false;
    for (const anchor of anchors) {
      if (html.includes(anchor)) {
        html = html.replace(anchor, `${block}\n${anchor}`);
        placed = true;
        break;
      }
    }
    if (!placed) {
      console.warn(`  could not place block in ${rel}`);
      return false;
    }
  }
  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

function upsertEmployerRelatedSection() {
  const rel = 'employers.html';
  const filePath = path.join(ROOT, rel);
  if (!fs.existsSync(filePath)) return false;
  let html = fs.readFileSync(filePath, 'utf8');
  const block = renderEmployerRelatedGuidesSection();
  if (RELATED_SECTION_RE.test(html)) {
    html = html.replace(RELATED_SECTION_RE, `${block}\n`);
  } else if (html.includes('<section class="section faq-accordion-section" id="faq"')) {
    html = html.replace(
      '<section class="section faq-accordion-section" id="faq"',
      `${block}\n\n      <section class="section faq-accordion-section" id="faq"`,
    );
  } else {
    console.warn('  could not place employer related guides');
    return false;
  }
  fs.writeFileSync(filePath, html, 'utf8');
  return true;
}

function main() {
  let n = 0;

  if (upsertEmployerRelatedSection()) {
    console.log('  employers.html — related guides section');
    n++;
  }

  const employeeStrip = renderEmployeeWorkplaceStrip();
  const hrStrip = renderEmployerHrStrip();

  const employeePages = [
    {
      file: 'answers/adhd-workplace-accommodations.html',
      block: `<aside class="workplace-seo-cluster" data-link-pass="${WORKPLACE_CLUSTER_MARKER}" aria-label="Work and cognitive health resources">
              <p class="workplace-seo-cluster__intro">Related reading for employees and HR teams:</p>
              <p class="workplace-seo-cluster__links"><a href="${WORKPLACE_PATHS.employers}">Employer cognitive health programs</a> · <a href="${WORKPLACE_PATHS.brainFogAtWork}">Brain fog at work</a> · <a href="${WORKPLACE_PATHS.executiveDysfunctionBlog}">Executive dysfunction guide</a></p>
            </aside>`,
      anchors: ['<aside class="answer-ask-siya"', '<section class="related-articles"'],
    },
    {
      file: 'blog/brain-fog-at-work.html',
      block: hrStrip + '\n' + employeeStrip,
      anchors: ['<section class="related-articles"', '<section class="continue-reading"'],
    },
    {
      file: 'blog/executive-dysfunction-adhd.html',
      block: hrStrip,
      anchors: ['<!-- SIYA:BLOG-CTA-ADHD -->', '<section class="related-articles"'],
    },
    {
      file: 'blog/sleep-and-focus-at-work.html',
      block: hrStrip + '\n' + employeeStrip,
      anchors: ['<section class="related-articles"', '</article>'],
    },
    {
      file: 'blog/chronic-fatigue-and-work-performance.html',
      block: hrStrip,
      anchors: ['<section class="related-articles"', '</article>'],
    },
    {
      file: 'answers/executive-dysfunction-adhd.html',
      block: `<aside class="workplace-seo-cluster" data-link-pass="${WORKPLACE_CLUSTER_MARKER}" aria-label="Work and cognitive health resources">
              <p class="workplace-seo-cluster__intro">At work, executive dysfunction often shows up as missed deadlines, inbox paralysis, or starting friction—not laziness.</p>
              <p class="workplace-seo-cluster__links"><a href="${WORKPLACE_PATHS.executiveDysfunctionBlog}">Full executive dysfunction guide</a> · <a href="${WORKPLACE_PATHS.brainFogAtWork}">Brain fog at work</a> · <a href="${WORKPLACE_PATHS.employers}">Employer programs</a></p>
            </aside>`,
      anchors: ['<aside class="answer-ask-siya"', '<section class="related-articles"'],
    },
  ];

  for (const { file, block, anchors } of employeePages) {
    if (upsertBlock(file, block, anchors)) {
      console.log(`  ${file}`);
      n++;
    }
  }

  const serviceStrips = [
    {
      file: 'adhd-care.html',
      anchors: ['<section class="section adhd-care-team-compact" id="meet-physicians"'],
    },
    {
      file: 'brain-fog.html',
      anchors: ['<section class="section faq-accordion-section section-tinted" id="faq"'],
    },
    {
      file: 'fatigue.html',
      anchors: ['<section class="section faq-accordion-section" id="faq"'],
    },
  ];

  const serviceStrip = `<section class="section section-tinted workplace-employer-bridge" data-link-pass="${WORKPLACE_CLUSTER_MARKER}" aria-label="Workplace programs">
        <div class="container">
          <p class="lead"><strong>Programs for teams:</strong> HR and benefits leaders exploring structured cognitive health screening for working professionals — <a href="${WORKPLACE_PATHS.employers}">request employer information</a>. Individual care: <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a>.</p>
        </div>
      </section>`;

  const brokenBridgeRe =
    /<section class="section faq-accordion-section[^"]*" <section class="section section-tinted workplace-employer-bridge"[\s\S]*?<\/section>\s*/g;

  for (const { file, anchors } of serviceStrips) {
    const filePath = path.join(ROOT, file);
    if (!fs.existsSync(filePath)) continue;
    let html = fs.readFileSync(filePath, 'utf8');
    html = html.replace(brokenBridgeRe, '');
    if (html.includes('workplace-employer-bridge')) continue;
    let placed = false;
    for (const anchor of anchors) {
      if (html.includes(anchor)) {
        html = html.replace(anchor, `${serviceStrip}\n\n      ${anchor}`);
        placed = true;
        break;
      }
    }
    if (placed) {
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`  ${file} — employer bridge`);
      n++;
    }
  }

  console.log(`apply-workplace-seo-cluster: ${n} updates`);
}

main();
