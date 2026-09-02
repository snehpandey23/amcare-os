/**
 * Targeted internal link equity — metro ADHD pages, workplace guides, thin hubs.
 * Run after apply-workplace-seo-cluster.mjs, before enforce-assembly-caps.mjs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WORKPLACE_PATHS, WORKPLACE_CLUSTER_MARKER } from '../data/workplace-seo-cluster.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const MARKER_RE = /<!-- SIYA:LINK-EQUITY-PASS -->[\s\S]*?<!-- \/SIYA:LINK-EQUITY-PASS -->\n?/g;

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function write(rel, html) {
  fs.writeFileSync(path.join(ROOT, rel), html, 'utf8');
}

function upsertMarker(rel, inner, anchors = []) {
  if (!fs.existsSync(path.join(ROOT, rel))) return false;
  let html = read(rel);
  const block = `<!-- SIYA:LINK-EQUITY-PASS -->\n${inner}\n<!-- /SIYA:LINK-EQUITY-PASS -->`;
  if (html.includes('SIYA:LINK-EQUITY-PASS')) {
    html = html.replace(MARKER_RE, `${block}\n`);
  } else {
    let placed = false;
    for (const anchor of anchors) {
      if (html.includes(anchor)) {
        html = html.replace(anchor, `${block}\n${anchor}`);
        placed = true;
        break;
      }
    }
    if (!placed) return false;
  }
  write(rel, html);
  return true;
}

function upsertListLinks(rel, listId, items, anchors) {
  if (!fs.existsSync(path.join(ROOT, rel))) return false;
  let html = read(rel);
  const lis = items.map((i) => `            <li><a href="${i.href}">${i.label}</a></li>`).join('\n');
  const block = `          <ul class="footer-links" id="${listId}" data-link-equity="${listId}">
${lis}
          </ul>`;
  const re = new RegExp(`<ul class="footer-links" id="${listId}"[\\s\\S]*?</ul>`, 'g');
  if (re.test(html)) {
    html = html.replace(re, block);
  } else {
    let placed = false;
    for (const anchor of anchors) {
      if (html.includes(anchor)) {
        html = html.replace(anchor, `${block}\n${anchor}`);
        placed = true;
        break;
      }
    }
    if (!placed) return false;
  }
  write(rel, html);
  return true;
}

const metroHubBlock = `      <section class="section" id="metro-adhd-care" aria-labelledby="metro-adhd-care-heading">
        <div class="container">
          <div class="section-header">
            <h2 id="metro-adhd-care-heading">Metro adult ADHD care</h2>
            <p class="lead">Licensed telehealth for adults in select metro areas—the same physician-led model as our statewide ADHD hub.</p>
          </div>
          <ul class="footer-links">
            <li><a href="/adhd-care/miami">Miami, FL</a></li>
            <li><a href="/adhd-care/orlando">Orlando, FL</a></li>
            <li><a href="/adhd-care/san-diego">San Diego, CA</a></li>
          </ul>
        </div>
      </section>`;

const workplaceGuideStrip = (intro, extraLinks = []) => {
  const links = [
    { href: WORKPLACE_PATHS.workplaceAccommodations, label: 'Workplace accommodations guide' },
    { href: WORKPLACE_PATHS.brainFogAtWork, label: 'Brain fog at work' },
    { href: WORKPLACE_PATHS.employers, label: 'Employer programs' },
    ...extraLinks,
  ];
  const linkHtml = links.map((l) => `<a href="${l.href}">${l.label}</a>`).join(' · ');
  return `            <aside class="workplace-seo-cluster link-equity-workplace" data-link-pass="${WORKPLACE_CLUSTER_MARKER}" aria-label="Work and cognitive health resources">
              <p class="workplace-seo-cluster__intro">${intro}</p>
              <p class="workplace-seo-cluster__links">${linkHtml}</p>
            </aside>`;
};

function main() {
  let n = 0;

  if (
    upsertMarker(
      'adhd-care.html',
      `${metroHubBlock}
      <p class="symptoms-transition link-equity-cost"><a href="/pricing">ADHD evaluation pricing</a> · <a href="/adhd-evaluation-california">California evaluation LP</a> · <a href="/adhd-evaluation-texas">Texas evaluation LP</a></p>`,
      [
        '<section class="section section-tinted" id="graph-adhd-california"',
        '<section class="section faq-accordion-section" id="faq"',
        'id="meet-physicians"',
      ],
    )
  ) {
    console.log('  adhd-care.html — metro hub + pricing links');
    n++;
  }

  if (
    upsertListLinks(
      'adult-adhd-california.html',
      'metro-adhd-california',
      [{ href: '/adhd-care/san-diego', label: 'San Diego metro ADHD care' }],
      ['id="graph-adhd-california"', '<section class="section faq-accordion-section"'],
    )
  ) {
    console.log('  adult-adhd-california.html — San Diego metro link');
    n++;
  }

  const costLinkStrip = (extra = '') =>
    `            <p class="symptoms-transition link-equity-cost"><a href="/pricing">ADHD evaluation pricing</a> · <a href="/adhd-care">ADHD care hub</a>${extra ? ` · ${extra}` : ''}</p>`;

  const costAnswerTargets = [
    {
      file: 'answers/what-included-199-adhd-evaluation.html',
      anchors: ['<section class="answer-short"', '<section class="answer-detailed"'],
    },
    {
      file: 'answers/how-much-does-adhd-testing-cost.html',
      anchors: ['<section class="answer-short"', '<section class="answer-detailed"'],
    },
    {
      file: 'answers/fsa-hsa-adhd-evaluation.html',
      anchors: ['<section class="answer-short"', '<section class="answer-detailed"'],
    },
    {
      file: 'answers/what-happens-after-adhd-evaluation.html',
      anchors: ['<section class="answer-closing"', '<section class="answer-internal-links"'],
    },
  ];

  for (const { file, anchors } of costAnswerTargets) {
    if (upsertMarker(file, costLinkStrip(), anchors)) {
      console.log(`  ${file} — pricing link equity`);
      n++;
    }
  }

  if (
    upsertMarker(
      'adhd-diagnosis-texas.html',
      `      <p class="symptoms-transition"><a href="/adhd-evaluation-texas">Same-week Texas ADHD evaluation</a> · <a href="/blog/adhd-treatment-texas">Texas treatment hub</a></p>`,
      ['<section class="section faq-accordion-section"', 'id="meet-physicians"'],
    )
  ) {
    console.log('  adhd-diagnosis-texas.html — evaluation LP link');
    n++;
  }

  for (const metro of ['adhd-care/miami.html', 'adhd-care/orlando.html', 'adhd-care/san-diego.html']) {
    const label = metro.includes('miami') ? 'Miami' : metro.includes('orlando') ? 'Orlando' : 'San Diego';
    if (
      upsertMarker(
        metro,
        `      <p class="symptoms-transition"><a href="/adhd-care">National ADHD care hub</a> · <a href="/pricing">Evaluation pricing</a></p>`,
        ['<section class="section faq-accordion-section"', 'id="related-resources"'],
      )
    ) {
      console.log(`  ${metro} — hub + pricing links`);
      n++;
    }
  }

  if (
    upsertMarker(
      'pricing.html',
      `      <p class="symptoms-transition"><a href="#pricing-plans">ADHD evaluation pricing on this page</a> · <a href="/adhd-care">ADHD care hub</a></p>`,
      ['<section class="section faq-accordion-section"', '</main>'],
    )
  ) {
    console.log('  pricing.html — in-page pricing anchor link');
    n++;
  }

  const workplaceTargets = [
    {
      file: 'answers/adhd-vs-burnout.html',
      intro: 'Burnout and ADHD overlap at work—accommodations and evaluation paths differ.',
      anchors: ['<aside class="answer-ask-siya"', '<section class="related-articles"'],
    },
    {
      file: 'answers/signs-of-adult-adhd.html',
      intro: 'Adult ADHD signs often show up first as work friction—not laziness.',
      anchors: ['<aside class="answer-ask-siya"', '<section class="related-articles"'],
    },
    {
      file: 'answers/poor-sleep-feels-like-adhd.html',
      intro: 'Sleep disruption can mimic ADHD at work—sort causes before labeling.',
      anchors: ['<aside class="answer-ask-siya"', '<section class="related-articles"'],
    },
    {
      file: 'answers/high-functioning-adhd.html',
      intro: 'High-functioning adults still need documentation when work demands exceed capacity.',
      anchors: ['<aside class="answer-ask-siya"', '<section class="related-articles"'],
    },
  ];

  for (const { file, intro, anchors, extra = [] } of workplaceTargets) {
    const block = workplaceGuideStrip(intro, extra);
    if (upsertMarker(file, block, anchors)) {
      console.log(`  ${file} — workplace link equity`);
      n++;
    }
  }

  console.log(`apply-link-equity-pass: ${n} updates`);
}

main();
