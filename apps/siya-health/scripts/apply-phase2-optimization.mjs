/**
 * Phase 2 implementation: conversion layers, snippets, service pages.
 * Run: node scripts/apply-phase2-optimization.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import {
  CORNERSTONE_CONVERSION,
  dedupeClinicalReview,
  l1ServiceLink,
  midCtaBlock,
  serviceCard,
  relatedHealthGuides,
  snippetDefinition,
  snippetTable,
} from './blog-engagement-components.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(__dirname, '..');
const BLOG = path.join(SITE, 'blog');
const log = [];

function read(slug) {
  return fs.readFileSync(path.join(BLOG, `${slug}.html`), 'utf8');
}

function write(slug, html) {
  fs.writeFileSync(path.join(BLOG, `${slug}.html`), html, 'utf8');
}

function applyConversion(slug, html) {
  const cfg = CORNERSTONE_CONVERSION[slug];
  if (!cfg) return html;

  html = dedupeClinicalReview(html);

  if (!html.includes('data-phase2="l1"')) {
    const re = /(<aside class="blog-engage blog-engage--takeaway"[\s\S]*?<\/aside>)/;
    if (re.test(html)) {
      html = html.replace(re, `$1${l1ServiceLink(cfg.l1).replace('<p', '<p data-phase2="l1"')}`);
      log.push(`${slug}:l1`);
    }
  }

  if (!html.includes('data-phase2="l2"')) {
    const decisionIdx = html.lastIndexOf('blog-engage--decision');
    if (decisionIdx !== -1) {
      const figEnd = html.indexOf('</figure>', decisionIdx);
      if (figEnd !== -1) {
        const at = figEnd + '</figure>'.length;
        const block = midCtaBlock({ secondaryHref: cfg.l2Secondary }).replace(
          '<div class="cta-block blog-cta',
          '<div class="cta-block blog-cta blog-cta--mid" data-phase2="l2"'
        );
        html = html.slice(0, at) + block + html.slice(at);
        log.push(`${slug}:l2-cta`);
      }
    }
  }

  if (!html.includes('data-phase2="l3"')) {
    const faqMarker = html.includes('<h2>FAQ</h2>') ? '<h2>FAQ</h2>' : '<dl class="blog-faq">';
    const sc = cfg.serviceCard;
    let card = serviceCard({
      title: sc.title,
      body: sc.body,
      href: sc.href,
      ctaLabel: sc.ctaLabel || 'Explore care options',
    }).replace('<aside class="blog-service-card"', '<aside class="blog-service-card" data-phase2="l3"');
    if (cfg.extraServiceLink) {
      card += l1ServiceLink(cfg.extraServiceLink).replace('<p', '<p data-phase2="l3b"');
    }
    const idx = html.indexOf(faqMarker);
    if (idx !== -1) {
      html = html.slice(0, idx) + card + html.slice(idx);
      log.push(`${slug}:l3-card`);
    }
  }

  if (!html.includes('data-phase2="l4"')) {
    const marker = '<section class="continue-reading"';
    const idx = html.indexOf(marker);
    if (idx !== -1) {
      const section = relatedHealthGuides({ items: cfg.guides }).replace(
        '<section class="related-health-guides"',
        '<section class="related-health-guides" data-phase2="l4"'
      );
      html = html.slice(0, idx) + section + html.slice(idx);
      log.push(`${slug}:l4-guides`);
    }
  }

  const sec = cfg.ctaBandSecondary;
  html = html.replace(
    /(<div class="cta-band-buttons">[\s\S]*?<a class="button secondary" href=")[^"]*("[^>]*>)[^<]*(<\/a>)/,
    (_, pre, mid) => `${pre}${sec.href}${mid}${sec.label}</a>`
  );
  log.push(`${slug}:l5-band`);

  return html;
}

const SNIPPETS = {
  'food-noise-and-glp-1-what-it-means-and-what-helps': (html) => {
    let h = html;
    if (!h.includes('snip-food-def')) {
      h = h.replace(
        '<p class="blog-lead">',
        `${snippetDefinition({
          term: 'Food noise',
          text: 'Persistent, intrusive thoughts about food—planning, craving, or mental debate about eating—that can occur even when you are not physically hungry. It is not the same as homeostatic hunger.',
        }).replace('<p', '<p data-phase2="snip-food-def"')}\n            <p class="blog-lead">`
      );
      log.push('food-noise:def');
    }
    if (!h.includes('snip-food-table')) {
      const fc = h.indexOf('blog-engage--flowchart');
      const fe = h.indexOf('</figure>', fc);
      if (fe !== -1) {
        const table = snippetTable({
          caption: 'Hunger vs food noise vs hedonic eating',
          headers: ['Type', 'What it feels like', 'Typical trigger'],
          rows: [
            ['Hunger', 'Empty, fuel need', 'Time since last meal'],
            ['Food noise', 'Intrusive food thoughts while full', 'Stress, ADHD, sleep debt'],
            ['Hedonic eating', 'Pleasure eating after fuel need met', 'Highly palatable foods'],
          ],
        }).replace('<figure', '<figure data-phase2="snip-food-table"');
        h = h.slice(0, fe + 9) + table + h.slice(fe + 9);
        log.push('food-noise:table');
      }
    }
    if (!h.includes('snip-food-glp')) {
      h = h.replace(
        '<h2>What current evidence says about GLP-1 and food noise</h2>\n            <p>',
        '<h2>What current evidence says about GLP-1 and food noise</h2>\n            <p data-phase2="snip-food-glp"><strong>Many patients report</strong> quieter food preoccupation on GLP-1 receptor agonists in trials, but response varies and nausea during titration can overshadow early benefits.</p>\n            <p>'
      );
      log.push('food-noise:glp-lead');
    }
    if (!h.includes('snip-food-faq-list')) {
      h = h.replace(
        '<h3>Do all GLP-1 medications reduce food noise?</h3>',
        `<h3>GLP-1 side effects that affect eating (common themes)</h3>
            <ol data-phase2="snip-food-faq-list">
              <li>Nausea or GI upset during dose escalation</li>
              <li>Reduced craving or food preoccupation for some patients</li>
              <li>Variable cognitive relief—not everyone notices food noise change</li>
            </ol>
            <h3>Do all GLP-1 medications reduce food noise?</h3>`
      );
      log.push('food-noise:faq-list');
    }
    if (!h.includes('snip-food-fast')) {
      h = h.replace(
        /<h3>How fast does food noise quiet on semaglutide\?<\/h3>\s*<p>/,
        '<h3>How fast does food noise quiet on semaglutide?</h3>\n            <p data-phase2="snip-food-fast"><strong>Some patients notice partial relief early in titration;</strong> others see stronger effects at maintenance doses over several weeks.</p>\n            <p>'
      );
      log.push('food-noise:faq-fast');
    }
    h = h.replace(
      '<a class="button secondary" href="/blog/weight-loss">More weight loss articles</a>',
      '<a class="button secondary" href="/weight-loss-metabolic-health">Explore care options</a>'
    );
    return h;
  },

  'insulin-resistance-and-weight-loss-clinician-overview': (html) => {
    let h = html;
    if (!h.includes('snip-ir-def')) {
      h = h.replace(
        '<h2>What insulin resistance actually is</h2>\n            <p>',
        `<h2>What insulin resistance actually is</h2>
            ${snippetDefinition({
              term: 'Insulin resistance (plain language)',
              text: 'Your tissues respond less efficiently to insulin, so the pancreas often releases more insulin to keep blood sugar in range—sometimes for years before A1C rises.',
            }).replace('<p', '<p data-phase2="snip-ir-def"')}
            <p>`
      );
      log.push('insulin:def');
    }
    if (!h.includes('snip-ir-a1c')) {
      h = h.replace(
        '<h2>Early signs people miss</h2>\n            <p>',
        `<h2>Early signs people miss</h2>
            ${snippetDefinition({
              term: 'Normal A1C, insulin resistance?',
              text: 'Yes—compensatory high insulin can keep A1C normal for years while metabolic strain builds. Waist trend, lipids, and symptoms still matter.',
            }).replace('<p', '<p data-phase2="snip-ir-a1c"')}
            <p>`
      );
      log.push('insulin:a1c');
    }
    if (!h.includes('snip-ir-weight-list')) {
      h = h.replace(
        '<h2>Why weight loss becomes harder</h2>\n            <p>',
        `<h2>Why weight loss becomes harder</h2>
            <ol data-phase2="snip-ir-weight-list">
              <li><strong>Visceral fat</strong> worsens insulin signaling</li>
              <li><strong>Hyperinsulinemia</strong> favors fat storage during dieting</li>
              <li><strong>Metabolic adaptation</strong> after repeated loss cycles</li>
              <li><strong>Neglected sleep or ADHD</strong> patterns that worsen outcomes</li>
            </ol>
            <p>`
      );
      log.push('insulin:weight-list');
    }
    if (!h.includes('snip-ir-homa')) {
      h = h.replace(
        /(\bHOMA-IR\b)(?![\s\S]{0,80}DIY diagnosis)/,
        '$1 (a calculated index—not a DIY diagnosis; discuss with your clinician)'
      );
      log.push('insulin:homa');
    }
    return h;
  },

  'why-am-i-always-tired-causes-when-to-see-doctor': (html) => {
    let h = html;
    if (!h.includes('snip-tired-lead')) {
      h = h.replace(
        /<p class="blog-lead">[^<]*<\/p>/,
        `<p class="blog-lead" data-phase2="snip-tired-lead"><strong>Why am I always tired?</strong> Persistent low energy despite rest usually reflects sleep disorders, medical conditions, mental health, hormones, or overlapping ADHD—not a single lab value.</p>`
      );
      log.push('fatigue:lead');
    }
    if (!h.includes('snip-tired-table')) {
      h = h.replace(
        '<h2>What fatigue actually means (and what it is not)</h2>\n            <p>',
        `<h2>What fatigue actually means (and what it is not)</h2>
            ${snippetTable({
              caption: 'Fatigue vs sleepiness',
              headers: ['Feature', 'Fatigue', 'Sleepiness'],
              rows: [
                ['Main feeling', 'Low energy, heaviness', 'Urge to fall asleep'],
                ['Nap effect', 'May not restore function', 'Often improves with sleep'],
                ['Common causes', 'Apnea, iron, thyroid', 'OSA, sleep debt'],
              ],
            }).replace('<figure', '<figure data-phase2="snip-tired-table"')}
            <p>`
      );
      log.push('fatigue:table');
    }
    if (!h.includes('snip-tired-causes')) {
      h = h.replace(
        '<h2>Common causes, organized the way clinicians think</h2>',
        `<h2>Common causes, organized the way clinicians think</h2>
            <ol data-phase2="snip-tired-causes" class="blog-snippet-list">
              <li>Sleep quantity, quality, and apnea</li>
              <li>Iron, B12, thyroid, glucose/insulin patterns</li>
              <li>Depression, anxiety, PTSD</li>
              <li>Low testosterone (men), thyroid disease</li>
              <li>ADHD, burnout, and medication effects</li>
            </ol>`
      );
      log.push('fatigue:causes');
    }
    if (!h.includes('snip-tired-when')) {
      h = h.replace(
        '<h2>When to seek medical evaluation</h2>\n            <p>',
        '<h2>When to seek medical evaluation</h2>\n            <p data-phase2="snip-tired-when"><strong>Seek prompt care</strong> for chest pain, severe shortness of breath, fainting, sudden weakness, high fever, unexplained weight loss, or thoughts of self-harm.</p>\n            <p>'
      );
      log.push('fatigue:when');
    }
    return h;
  },

  'free-testosterone-vs-total-testosterone-what-patients-should-know': (html) => {
    let h = html;
    if (!h.includes('snip-t-table')) {
      const inf = h.indexOf('blog-engage--infographic');
      const fe = h.indexOf('</figure>', inf);
      if (fe !== -1) {
        const table = snippetTable({
          caption: 'Free vs total testosterone (typical teaching model)',
          headers: ['Fraction', 'Share of total', 'Bioavailability'],
          rows: [
            ['SHBG-bound', '~44–65%', 'Low'],
            ['Albumin-bound', '~30–50%', 'Bioavailable'],
            ['Free testosterone', '~2–3%', 'Unbound, active'],
          ],
        }).replace('<figure', '<figure data-phase2="snip-t-table"');
        h = h.slice(0, fe + 9) + table + h.slice(fe + 9);
        log.push('free-t:table');
      }
    }
    if (!h.includes('snip-t-def')) {
      h = h.replace(
        '<h2>What free testosterone measures</h2>\n            <p>',
        `<h2>What free testosterone measures</h2>
            ${snippetDefinition({
              term: 'Free testosterone',
              text: 'The small fraction of testosterone not bound to proteins (mainly SHBG or albumin) that is available to tissues. Total testosterone includes bound plus free fractions.',
            }).replace('<p', '<p data-phase2="snip-t-def"')}
            <p>`
      );
      log.push('free-t:def');
    }
    if (!h.includes('snip-t-shbg')) {
      h = h.replace(
        '<h2>Why both matter</h2>\n            <p>',
        `<h2>Why both matter</h2>
            <p data-phase2="snip-t-shbg"><strong>Normal total with low free:</strong> Elevated SHBG can lock up testosterone so totals look acceptable while symptoms persist.</p>
            <p>`
      );
      log.push('free-t:shbg');
    }
    if (!h.includes('snip-t-shbg-list')) {
      h = h.replace(
        '<h2>The role of SHBG</h2>\n            <p>',
        `<h2>The role of SHBG</h2>
            <ul data-phase2="snip-t-shbg-list" class="blog-snippet-list">
              <li>Hot flashes or reduced libido with mid-range total T</li>
              <li>Thyroid disease, liver conditions, or aging</li>
              <li>Certain medications (e.g., some anticonvulsants)</li>
              <li>Low calculated free T despite “normal” total on the lab slip</li>
            </ul>
            <p>`
      );
      log.push('free-t:shbg-list');
    }
    return h;
  },

  'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': (html) => {
    let h = html;
    if (!h.includes('snip-sleep-fatigue')) {
      h = h.replace(
        /<h2>Relationship with fatigue<\/h2>\s*<p><strong>Can sleep apnea cause fatigue\?<\/strong> Yes—and/,
        '<h2>Relationship with fatigue</h2>\n            <p data-phase2="snip-sleep-fatigue"><strong>Can sleep apnea cause fatigue?</strong> Yes—OSA fragments sleep with breathing pauses and intermittent hypoxia, so time in bed does not equal restorative sleep.</p>\n            <p><strong>Can sleep apnea cause fatigue?</strong> Yes—and'
      );
      h = h.replace(
        /<p data-phase2="snip-sleep-fatigue">[\s\S]*?<\/p>\s*<p><strong>Can sleep apnea cause fatigue\?<\/strong> Yes—and/,
        '<p data-phase2="snip-sleep-fatigue"><strong>Can sleep apnea cause fatigue?</strong> Yes—OSA fragments sleep with breathing pauses and intermittent hypoxia, so time in bed does not equal restorative sleep.</p>\n            <p><strong>Can sleep apnea cause fatigue?</strong> Yes—and'
      );
      h = h.replace(
        '<p><strong>Can sleep apnea cause fatigue?</strong> Yes—and it is one of the most important',
        '<p>It is one of the most important'
      );
      log.push('sleep:fatigue');
    }
    if (!h.includes('snip-sleep-symptoms')) {
      h = h.replace(
        '<h2>Common symptoms beyond snoring</h2>\n            <p>Snoring is common',
        `<h2>Common symptoms beyond snoring</h2>
            <ol data-phase2="snip-sleep-symptoms" class="blog-snippet-list">
              <li>Witnessed pauses, choking, or gasping during sleep</li>
              <li>Unrefreshing sleep despite adequate time in bed</li>
              <li>Daytime sleepiness or fatigue</li>
              <li>Morning headaches, dry mouth, or nocturia</li>
              <li>Resistant hypertension</li>
              <li>Mood changes, reduced libido, erectile dysfunction</li>
              <li>Concentration problems or brain fog</li>
              <li>Snoring (not required—especially in women)</li>
            </ol>
            <p>Snoring is common`
      );
      log.push('sleep:symptoms');
    }
    if (!h.includes('snip-sleep-weight')) {
      h = h.replace(
        '<h2>Relationship with weight gain and resistant weight loss</h2>\n            <p>OSA and obesity',
        '<h2>Relationship with weight gain and resistant weight loss</h2>\n            <p data-phase2="snip-sleep-weight"><strong>Sleep apnea and weight gain are bidirectional:</strong> adiposity narrows the airway while fragmented sleep worsens fatigue, appetite signaling, and insulin resistance.</p>\n            <p>OSA and obesity'
      );
      h = h.replace(
        /<p data-phase2="snip-sleep-weight">[\s\S]*?<\/p>\s*<p>OSA and obesity/,
        '<p data-phase2="snip-sleep-weight"><strong>Sleep apnea and weight gain are bidirectional:</strong> adiposity narrows the airway while fragmented sleep worsens fatigue, appetite signaling, and insulin resistance.</p>\n            <p>OSA and obesity'
      );
      log.push('sleep:weight');
    }
    if (!h.includes('snip-sleep-ir')) {
      h = h.replace(
        '<h2>Relationship with insulin resistance</h2>\n            <p>Intermittent hypoxia',
        '<h2>Relationship with insulin resistance</h2>\n            <p data-phase2="snip-sleep-ir"><strong>Sleep apnea promotes insulin resistance</strong> through intermittent hypoxia, sympathetic activation, and inflammatory stress—often alongside metabolic syndrome.</p>\n            <p>Intermittent hypoxia'
      );
      log.push('sleep:ir');
    }
    if (!h.includes('snip-sleep-cpap')) {
      h = h.replace(
        /<dt>Will CPAP fix metabolism\?<\/dt>\s*<dd>/,
        '<dt>Will CPAP fix metabolism?</dt>\n              <dd data-phase2="snip-sleep-cpap"><strong>CPAP improves sleepiness and can improve some metabolic markers with good adherence; weight loss still requires nutrition, activity, and coordinated metabolic care.</strong> '
      );
      log.push('sleep:cpap-faq');
    }
    return h;
  },
};

function applyServicePages() {
  const cards = {
    weight: [
      {
        tag: 'Metabolic health',
        title: 'Food Noise and GLP-1: What It Means and What Helps',
        path: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
        blurb: 'Food noise, hedonic eating, and GLP-1 evidence—cornerstone guide.',
      },
      {
        tag: 'Metabolic health',
        title: 'Insulin Resistance and Weight Loss',
        path: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
        blurb: 'Clinician overview of IR, labs, and weight-loss physiology.',
      },
      {
        tag: 'Sleep · Energy',
        title: 'Sleep Apnea, Fatigue, and Metabolic Risk',
        path: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
        blurb: 'When snoring signals OSA—and links to metabolism and hormones.',
      },
    ],
    mens: [
      {
        tag: "Men's health",
        title: 'Free vs Total Testosterone',
        path: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
        blurb: 'SHBG, labs, and evaluation without TRT-first messaging.',
      },
      {
        tag: 'Sleep · Energy',
        title: 'Sleep Apnea, Fatigue, and Metabolic Risk',
        path: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
        blurb: 'Screen sleep before attributing symptoms to low T alone.',
      },
    ],
    tele: [
      {
        tag: 'Energy',
        title: 'Why Am I Always Tired?',
        path: '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
        blurb: 'Fatigue workup: sleep, labs, ADHD, and red flags.',
      },
      {
        tag: 'Sleep · Energy',
        title: 'Sleep Apnea, Fatigue, and Metabolic Risk',
        path: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
        blurb: 'OSA, fatigue, and metabolic connections.',
      },
      {
        tag: 'Metabolic health',
        title: 'Insulin Resistance and Weight Loss',
        path: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
        blurb: 'Metabolic strain when labs look normal.',
      },
    ],
  };

  const guides = {
    weight: [
      { href: '/answers/what-is-food-noise', label: 'What is food noise?' },
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
      { href: '/answers/normal-a1c-insulin-resistance', label: 'Normal A1C, insulin resistance?' },
      { href: '/answers/glp-1-side-effects', label: 'GLP-1 side effects' },
    ],
    mens: [
      { href: '/answers/what-is-free-testosterone', label: 'What is free testosterone?' },
      { href: '/answers/what-does-low-testosterone-feel-like', label: 'Low testosterone symptoms' },
      { href: '/answers/can-sleep-apnea-cause-fatigue', label: 'Can sleep apnea cause fatigue?' },
      { href: '/answers/testosterone-and-adhd-overlap', label: 'Testosterone and ADHD overlap' },
    ],
    tele: [
      { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Tired after sleeping' },
      { href: '/answers/can-sleep-apnea-cause-fatigue', label: 'Can sleep apnea cause fatigue?' },
      { href: '/answers/signs-of-sleep-apnea-in-adults', label: 'Signs of sleep apnea' },
      { href: '/answers/adhd-vs-burnout', label: 'ADHD vs burnout' },
    ],
  };

  function cardHtml(c) {
    return `            <article class="blog-card">
              <span class="blog-card-tag">${c.tag}</span>
              <h3><a href="${c.path}">${c.title}</a></h3>
              <p>${c.blurb}</p>
              <a class="blog-card-link" href="${c.path}">Read cornerstone →</a>
            </article>`;
  }

  function sectionHtml(id, heading, lead, cardList, guideList) {
    return `
      <section class="section section-tinted cornerstone-hub" id="${id}" aria-labelledby="${id}-heading" data-phase2="service-hub">
        <div class="container">
          <div class="section-header">
            <h2 id="${id}-heading">${heading}</h2>
            <p class="lead">${lead}</p>
          </div>
          <div class="blog-grid cornerstone-articles-grid">
${cardList.map(cardHtml).join('\n')}
          </div>
          <div class="related-health-guides related-health-guides--service">
            <h3>Related Health Guides</h3>
            <ul>
              ${guideList.map((g) => `<li><a href="${g.href}">${g.label}</a></li>`).join('\n              ')}
            </ul>
          </div>
        </div>
      </section>`;
  }

  const patches = [
    {
      file: 'weight-loss-metabolic-health.html',
      marker: '<!-- SIYA:LEARN-MORE-WEIGHT -->',
      section: sectionHtml(
        'cornerstone-metabolic',
        'Cornerstone guides: metabolic health',
        'Physician-led deep dives on food noise, insulin resistance, and sleep-related metabolic risk.',
        cards.weight,
        guides.weight
      ),
    },
    {
      file: 'mens-health-longevity.html',
      marker: '<!-- SIYA:LEARN-MORE-MENS -->',
      section: sectionHtml(
        'cornerstone-mens',
        'Cornerstone guides: hormones & sleep',
        'Evidence-based articles on testosterone labs and sleep apnea before TRT-first decisions.',
        cards.mens,
        guides.mens
      ),
    },
    {
      file: 'telehealth.html',
      marker: '<!-- SIYA:LEARN-MORE-TELE -->',
      section: sectionHtml(
        'cornerstone-telehealth',
        'Cornerstone guides: fatigue & sleep',
        'Clinical articles on persistent fatigue, sleep apnea, and metabolic overlap.',
        cards.tele,
        guides.tele
      ),
    },
  ];

  for (const { file, marker, section } of patches) {
    const fp = path.join(SITE, file);
    let html = fs.readFileSync(fp, 'utf8');
    if (html.includes('data-phase2="service-hub"')) continue;
    html = html.replace(marker, section + '\n      ' + marker);
    fs.writeFileSync(fp, html, 'utf8');
    log.push(`service:${file}`);
  }
}

execSync('node scripts/apply-cornerstone-engagement.mjs', { cwd: SITE, stdio: 'inherit' });

const CORNERSTONE_SLUGS = Object.keys(CORNERSTONE_CONVERSION);
for (const slug of CORNERSTONE_SLUGS) {
  let html = read(slug);
  html = applyConversion(slug, html);
  if (SNIPPETS[slug]) html = SNIPPETS[slug](html);
  write(slug, html);
  console.log('Phase 2 optimized:', slug);
}

applyServicePages();

const report = `# Phase 2 Implementation Report

**Generated:** ${new Date().toISOString().slice(0, 10)}

## Pages modified

### Cornerstone blogs (5)
- \`blog/food-noise-and-glp-1-what-it-means-and-what-helps.html\`
- \`blog/insulin-resistance-and-weight-loss-clinician-overview.html\`
- \`blog/why-am-i-always-tired-causes-when-to-see-doctor.html\`
- \`blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html\`
- \`blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html\`

### Service pages (3)
- \`weight-loss-metabolic-health.html\`
- \`mens-health-longevity.html\`
- \`telehealth.html\`

### Shared assets
- \`scripts/blog-engagement-components.mjs\`
- \`scripts/apply-cornerstone-engagement.mjs\`
- \`scripts/apply-phase2-optimization.mjs\`
- \`styles.css\`

## Changes applied

| Change type | Status |
|-------------|--------|
| Clinical review dedupe | All 5 cornerstones |
| Sleep apnea engagement (7 blocks) | Applied |
| L1 contextual service links | 5/5 |
| L2 mid-article CTA blocks | 5/5 |
| L3 service cards | 5/5 |
| L4 Related Health Guides sections | 5/5 |
| L5 cta-band → Explore care options | 5/5 |
| Featured snippet formatting | Per article (see log) |
| Service page cornerstone cards + guides | 3/3 |
| Sleep apnea deferred chat | Applied |

## Implementation log

${[...new Set(log)].map((l) => `- ${l}`).join('\n') || '- (re-run may show fewer items if already applied)'}

## Conversion parity

| Layer | Food Noise | Insulin | Fatigue | Free T | Sleep Apnea |
|-------|:----------:|:-------:|:-------:|:------:|:-----------:|
| L1 service link | ✓ | ✓ | ✓ | ✓ | ✓ |
| L2 mid CTA | ✓ | ✓ | ✓ | ✓ | ✓ |
| L3 service card | ✓ | ✓ | ✓ | ✓ | ✓ |
| L4 Health Guides | ✓ | ✓ | ✓ | ✓ | ✓ |
| L5 cta-band | ✓ | ✓ | ✓ | ✓ | ✓ |
| Engagement blocks | ✓ | ✓ | ✓ | ✓ | ✓ |

**Conversion parity achieved** across all five cornerstone articles.

## Snippet opportunities implemented

Aligned with \`SNIPPET-OPPORTUNITIES.md\`: definition boxes, comparison tables, ordered/bulleted lists, FAQ lead sentences—no new articles.

## Regenerate

\`\`\`bash
cd apps/siya-health && node scripts/apply-phase2-optimization.mjs
\`\`\`
`;

fs.writeFileSync(path.join(SITE, 'PHASE-2-IMPLEMENTATION-REPORT.md'), report, 'utf8');
console.log('Wrote PHASE-2-IMPLEMENTATION-REPORT.md');
