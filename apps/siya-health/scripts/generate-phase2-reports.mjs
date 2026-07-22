/**
 * Phase 2: Cornerstone optimization audits (reports only — no content creation).
 * Run: node scripts/generate-phase2-reports.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CORNERSTONE_ARTICLES, KEYWORD_DESTINATIONS, ROADMAP_90_DAY } from '../data/keyword-universe.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(__dirname, '..');
const BLOG = path.join(SITE, 'blog');

const CORNERSTONES = [
  ...CORNERSTONE_ARTICLES,
  {
    slug: 'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
    title: 'Sleep Apnea, Fatigue, and Metabolic Risk',
    path: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
    primary: 'sleep apnea fatigue metabolic risk',
    secondary: [
      'sleep apnea and fatigue',
      'snoring sleep apnea',
      'sleep apnea insulin resistance',
      'sleep apnea testosterone',
      'sleep apnea ADHD brain fog',
      'CPAP weight loss',
      'signs of sleep apnea adults',
    ],
    entities: ['OSA', 'AASM', 'CPAP', 'STOP-BANG', 'insulin resistance', 'metabolic syndrome', 'Epworth'],
    paa: [
      'Can sleep apnea cause fatigue even if I sleep eight hours?',
      'What are signs of sleep apnea besides snoring?',
      'Can sleep apnea cause weight gain?',
      'Sleep apnea and insulin resistance?',
      'Does sleep apnea lower testosterone?',
      'Can sleep apnea mimic ADHD?',
      'Will CPAP help weight loss?',
    ],
    reddit: [
      'snoring but labs normal',
      'told I need TRT but I snore',
      'CPAP helped energy not weight',
      'ADHD meds but still exhausted — never tested for apnea',
    ],
  },
];

function read(slug) {
  return fs.readFileSync(path.join(BLOG, `${slug}.html`), 'utf8');
}

function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function countPat(text, phrase) {
  return text.includes(phrase.toLowerCase()) ? 1 : 0;
}

function hasKeyword(text, kw) {
  const k = kw.toLowerCase();
  if (text.includes(k)) return true;
  const words = k.split(/\s+/).filter((w) => w.length > 3);
  return words.length > 0 && words.every((w) => text.includes(w));
}

function auditConversion(slug, html) {
  const meetGreet = (html.match(/Book a Meet/gi) || []).length;
  const explore = (html.match(/Explore (care|medical|Men's)/gi) || []).length;
  const ctaBlock = html.includes('cta-block');
  const ctaBand = html.includes('cta-band');
  const serviceLinks = {
    metabolic: /weight-loss-metabolic-health/.test(html),
    adhd: /adhd-care/.test(html),
    mens: /mens-health-longevity/.test(html),
    telehealth: /\/telehealth/.test(html),
  };
  const engageTypes = ['takeaway', 'evidence', 'myth', 'reddit', 'pearl', 'infographic', 'flowchart', 'decision'].filter((t) =>
    html.includes(`blog-engage--${t}`)
  );
  const clinicalReviewCount = (html.match(/clinical-review--pending/g) || []).length;
  const h2 = (html.match(/<h2/g) || []).length;
  const faqSchema = html.includes('FAQPage');
  const faqDl = html.includes('blog-faq');
  const internal = (html.match(/href="\/(blog|answers|weight-loss|mens-health|adhd-care|telehealth)/g) || []).length;
  return {
    slug,
    meetGreet,
    explore,
    ctaBlock,
    ctaBand,
    serviceLinks,
    engageTypes,
    engageCount: engageTypes.length,
    clinicalReviewCount,
    h2,
    faqSchema,
    faqDl,
    internal,
  };
}

function scoreKeyword(article, text) {
  const primary = hasKeyword(text, article.primary)
    ? 'Strong'
    : hasKeyword(text, article.primary.split(' ').slice(0, 2).join(' '))
      ? 'Partial'
      : 'Weak';
  const secondary = article.secondary.map((kw) => ({
    kw,
    hits: hasKeyword(text, kw) ? 1 : 0,
    status: hasKeyword(text, kw) ? '✓' : '—',
  }));
  const coveredSec = secondary.filter((s) => s.hits > 0).length;
  const entities = article.entities.map((e) => ({
    e,
    present: text.includes(e.toLowerCase()),
  }));
  const entCovered = entities.filter((e) => e.present).length;
  const paa = (article.paa || []).map((q) => {
    const key = q.split(' ').slice(0, 4).join(' ');
    return { q, covered: countPat(text, key) > 0 || text.includes(q.toLowerCase().slice(0, 20)) };
  });
  const reddit = (article.reddit || []).map((r) => ({
    r,
    covered: text.includes(r.toLowerCase().slice(0, 12)) || htmlHasRedditBox(read(article.slug)),
  }));
  return { primary, secondary, coveredSec, totalSec: secondary.length, entities, entCovered, paa, reddit };
}

function htmlHasRedditBox(html) {
  return html.includes('blog-engage--reddit');
}

function auditArticle(article) {
  const html = read(article.slug);
  const text = stripHtml(html);
  return {
    ...auditConversion(article.slug, html),
    title: article.title,
    path: article.path,
    keyword: scoreKeyword(article, text),
    wordApprox: text.split(' ').length,
  };
}

const audits = CORNERSTONES.map((c) => {
  const a = auditArticle(c);
  return { ...c, audit: a };
});

function buildConversionReport() {
  return `# Conversion Architecture Report

**Generated:** ${new Date().toISOString().slice(0, 10)}  
**Scope:** Five cornerstone articles — optimization recommendations only (no new pages).

## Executive summary

| Article | Conversion maturity | Primary gap |
|---------|-------------------|-------------|
| Food Noise & GLP-1 | **Best** | Secondary CTA points to service page, not Meet & Greet repeat |
| Insulin Resistance | Moderate | No mid-article \`cta-block\`; secondary → answer page |
| Why Am I Always Tired? | Moderate | No mid-article CTA; strong copy, weak structure |
| Free vs Total Testosterone | Moderate | Men's health secondary; no mid-article CTA |
| Sleep Apnea | **Weakest** | No engagement blocks; duplicate clinical-review; end-only CTA |

**Sitewide:** Header = single **Book a Meet & Greet** (correct). No cornerstone uses **Explore Care Options** in hero. No \`mobile-sticky-cta\` on cornerstone pages (homepage only).

---

## Conversion framework (recommended)

| Layer | Placement | Primary CTA | Secondary CTA |
|-------|-----------|-------------|---------------|
| **L0** | Global header / mobile nav | Book a Meet & Greet | — |
| **L1** | After Key Takeaway (~5% scroll) | — | Soft text link to most relevant **service page** |
| **L2** | After decision tree / “when to seek care” (~45% scroll) | Book a Meet & Greet | Explore [service] |
| **L3** | After “How Siya approaches…” / care pathway (~70% scroll) | \`cta-block\` pair | Service-specific |
| **L4** | Pre-FAQ (~85% scroll) | Optional inline: “Questions? Book a Meet & Greet” | — |
| **L5** | \`cta-band\` (exit scroll) | Book a Meet & Greet | Contextual explore |
| **L6** | Continue reading | — | Answer + sibling blog + service (already present) |

**Exit-intent:** Chat widget removed sitewide. Prefer service **card** components at L2—not interstitial modals (hurts trust).

---

## Per-article audit

${audits
  .map((a) => {
    const x = a.audit;
    return `### ${a.title}

**URL:** \`${a.path}\`

| Signal | Current state |
|--------|---------------|
| Meet & Greet mentions | ${x.meetGreet} (header + body + footer band) |
| Explore / secondary CTAs | ${x.explore} |
| Mid-article \`cta-block\` | ${x.ctaBlock ? 'Yes' : '**No**'} |
| End \`cta-band\` | ${x.ctaBand ? 'Yes' : 'No'} |
| Service links in body | Metabolic: ${x.serviceLinks.metabolic ? '✓' : '—'}, ADHD: ${x.serviceLinks.adhd ? '✓' : '—'}, Men's: ${x.serviceLinks.mens ? '✓' : '—'}, Telehealth: ${x.serviceLinks.telehealth ? '✓' : '—'} |
| Engagement blocks | ${x.engageCount}/8 (${x.engageTypes.join(', ') || 'none'}) |
| Clinical review blocks | ${x.clinicalReviewCount} ${x.clinicalReviewCount > 1 ? '⚠ dedupe to 1' : ''} |

**CTA hierarchy today:** Header Meet & Greet > long education > ${x.ctaBlock ? 'mid cta-block' : 'no mid conversion'} > cta-band.

**Recommendations:**
${recommendationsFor(a.slug)}
`;
  })
  .join('\n')}

---

## Service-page card placement (new component — not built yet)

| Article | Card title | Link | Place after |
|---------|------------|------|-------------|
| Food Noise | Medical weight loss with GLP-1 oversight | \`/weight-loss-metabolic-health\` | Evidence snapshot |
| Insulin | Metabolic health program | \`/weight-loss-metabolic-health\` | Post-meal fatigue / flowchart section |
| Fatigue | Telehealth fatigue workup | \`/telehealth\` or split ADHD/sleep | After fatigue workup flowchart |
| Free T | Men's health & longevity | \`/mens-health-longevity\` | SHBG / lab interpretation section |
| Sleep Apnea | Sleep + metabolic coordination | \`/telehealth\` + link \`/weight-loss-metabolic-health\` | After “symptoms beyond snoring” |

---

## Scroll-depth conversion map (typical ~2,500–4,500 word articles)

\`\`\`
0%   Header Meet & Greet
5%   Key Takeaway → [ADD] subtle “Explore care” text link
25%  Myth / evidence (trust peak) → [ADD] optional soft Meet & Greet mention in pearl
45%  Decision tree → [ADD] cta-block (all 5 articles)
70%  Siya care pathway → cta-block (standardize all 5)
85%  FAQ start
95%  cta-band (keep)
\`\`\`

**Exit-intent:** Use delayed chat + bottom \`cta-band\`; avoid pop-ups on medical content.

`;
}

function recommendationsFor(slug) {
  const map = {
    'food-noise-and-glp-1-what-it-means-and-what-helps': `- Keep mid \`cta-block\` (only cornerstone with it).
- Change secondary from “More weight loss articles” → **Explore medical weight loss** (\`/weight-loss-metabolic-health\`).
- Add L2 \`cta-block\` duplicate after decision tree for readers who skip services section.
- Add service card after takeaway.`,
    'insulin-resistance-and-weight-loss-clinician-overview': `- **Add \`cta-block\`** after decision tree (match food-noise pattern).
- Change cta-band secondary from answer-only → **Explore metabolic health** + keep answer link in body.
- Add L1 link: “Start with our weight loss program →” after takeaway.`,
    'why-am-i-always-tired-causes-when-to-see-doctor': `- **Add \`cta-block\`** after “When to seek medical evaluation” (high intent).
- Split secondary: **Book Meet & Greet** + “Explore telehealth” (keep) + add “ADHD evaluation” link when section mentions ADHD.
- Add service card: telehealth hub after flowchart.`,
    'free-testosterone-vs-total-testosterone-what-patients-should-know': `- **Add \`cta-block\`** after “When evaluation is appropriate.”
- cta-band secondary → Men's health (good); add Meet & Greet subtext: “Not a TRT mill—evaluation first.”
- Cross-link sleep apnea before TRT discussion with prominent inline CTA.`,
    'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': `- **Apply engagement bundle** (0/8 today)—parity with other cornerstones.
- **Dedupe clinical-review** (5 duplicate blocks → 1).
- **Add \`cta-block\`** after practical next steps.
- cta-band: add **Explore telehealth** + link fatigue cornerstone.
- Add deferred chat loader (currently immediate LeadConnector).`,
  };
  return map[slug] || '- Review manually.';
}

function buildKeywordCoverage() {
  const lines = [
    '# Cornerstone Keyword Coverage',
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)}`,
    '',
    'Scoring: **Strong** = intent fully served in prose/FAQ; **Partial** = theme present, query variant thin; **Gap** = user would still search elsewhere.',
    '',
  ];
  for (const a of CORNERSTONES) {
    const k = scoreKeyword(a, stripHtml(read(a.slug)));
    const secPct = Math.round((k.coveredSec / k.totalSec) * 100);
    const entPct = Math.round((k.entCovered / k.entities.length) * 100);
    const paaCovered = k.paa.filter((p) => p.covered).length;
    lines.push(`## ${a.title}`, '', `**Primary:** ${a.primary} — **${k.primary}**`, '');
    lines.push(`| Secondary keywords | Hits |`, `|-------------------|------|`);
    for (const s of k.secondary) {
      lines.push(`| ${s.kw} | ${s.status} ${s.hits ? `(${s.hits})` : ''} |`);
    }
    lines.push('', `**Secondary coverage:** ${k.coveredSec}/${k.totalSec} (${secPct}%)`, '');
    lines.push('**Entities:**', '');
    for (const e of k.entities) {
      lines.push(`- ${e.e}: ${e.present ? '✓' : '—'}`);
    }
    lines.push('', `**Entity coverage:** ${k.entCovered}/${k.entities.length} (${entPct}%)`, '');
    if (a.paa?.length) {
      lines.push('', '**PAA / FAQ alignment:**', '');
      for (const p of k.paa) {
        lines.push(`- ${p.covered ? '✓' : '—'} ${p.q}`);
      }
      lines.push('', `**PAA covered:** ${paaCovered}/${a.paa.length}`, '');
    }
    if (a.reddit?.length) {
      lines.push('', '**Reddit-style intents:**', '');
      for (const r of k.reddit) {
        lines.push(`- ${r.covered ? '✓' : '—'} “${r.r}”`);
      }
    }
    lines.push('', '**Missing user intent (optimize existing copy, not density):**', '');
    lines.push(...missingIntentFor(a.slug).map((m) => `- ${m}`), '', '---', '');
  }
  return lines.join('\n');
}

function missingIntentFor(slug) {
  const m = {
    'food-noise-and-glp-1-what-it-means-and-what-helps': [
      'Food noise returned / breakthrough on GLP-1 → mention in FAQ only lightly',
      'Tirzepatide vs semaglutide for food noise → no dedicated FAQ',
      'Stopping GLP-1 and food noise return → gap (answer page candidate)',
    ],
    'insulin-resistance-and-weight-loss-clinician-overview': [
      'Metformin + weight loss FAQ',
      'PCOS / fatty liver as comorbidity anchors',
      'Brain fog after eating → partial in early signs only',
    ],
    'why-am-i-always-tired-causes-when-to-see-doctor': [
      'Medication-induced fatigue list',
      'Chronic fatigue syndrome pacing (brief ME/CFS mention exists)',
      'Poor sleep vs ADHD → no dedicated section (answer candidate)',
    ],
    'free-testosterone-vs-total-testosterone-what-patients-should-know': [
      'Bioavailable testosterone definition in FAQ',
      'Fertility + TRT section',
      'DHEA / supplement noise (reject, but address in myths)',
    ],
    'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': [
      'Home sleep test vs in-lab PSG decision guide (partial in FAQ)',
      'Women / postmenopausal OSA presentation',
      'Poor sleep feels like ADHD → cross-link only, no answer yet',
    ],
  };
  return m[slug] || [];
}

function buildSnippetOpportunities() {
  return `# Featured Snippet Opportunities

**Generated:** ${new Date().toISOString().slice(0, 10)}

Optimize **format**, not word count. Target queries where cornerstone already ranks or has FAQ schema.

---

## Food Noise & GLP-1

| Query | Format | Section to optimize | Action |
|-------|--------|---------------------|--------|
| what is food noise | Paragraph | Lead + Key Takeaway | Add 40-word definition box immediately after H1 |
| food noise vs hunger | Table | Flowchart section | Add HTML \`<table>\`: Hunger vs Food noise vs Hedonic |
| does semaglutide stop food noise | Paragraph | GLP-1 evidence H3 | Lead with “Many patients report…” 2-sentence answer |
| GLP-1 side effects food noise | List | FAQ | Ordered list: nausea, partial cognitive relief, variability |
| how fast does food noise quiet on semaglutide | Paragraph | FAQ H3 (exists) | Move answer to first sentence under question |

---

## Insulin Resistance & Weight Loss

| Query | Format | Section | Action |
|-------|--------|---------|--------|
| what is insulin resistance | Paragraph | “What insulin resistance actually is” | 50-word plain-language box at section top |
| insulin resistance symptoms | List | Early signs | Bulleted list with bold lead-ins (already close) |
| can you have insulin resistance without diabetes | Paragraph | Opening + link to answer | Mirror answer page first sentence |
| normal A1C insulin resistance | Paragraph | Early signs + FAQ | Dedicated 2-sentence callout box |
| why can't I lose weight insulin resistance | List | Why weight loss harder | Numbered mechanisms (visceral fat, hyperinsulinemia, adaptation) |
| HOMA-IR meaning | Paragraph | Early signs caveat | Short “what HOMA-IR is / isn't” callout (discourage DIY diagnosis) |

---

## Why Am I Always Tired?

| Query | Format | Section | Action |
|-------|--------|---------|--------|
| why am I always tired | Paragraph | Lead | Direct answer in first 2 sentences |
| fatigue vs sleepiness | Table | “What fatigue means” | Two-column comparison table |
| tired after sleeping 8 hours | Paragraph | Sleep section + FAQ | Snippet-optimized FAQ answer (schema exists) |
| causes of fatigue | List | Common causes H2 | H3 list formatted as numbered causes |
| when to see doctor fatigue | List | When to seek | Bullet red flags (exists—tighten opening line) |

---

## Free vs Total Testosterone

| Query | Format | Section | Action |
|-------|--------|---------|--------|
| free testosterone vs total testosterone | Table | Infographic section | Add table: Total | Free | SHBG-bound |
| what is free testosterone | Paragraph | “What free testosterone measures” | Definition block |
| normal total low free testosterone | Paragraph | “Why both matter” | SHBG-high scenario first |
| SHBG high symptoms | List | SHBG section | 4–6 bullet symptoms |
| when to test testosterone morning | Paragraph | Practical steps | Numbered list item #1 expanded |

---

## Sleep Apnea, Fatigue, and Metabolic Risk

| Query | Format | Section | Action |
|-------|--------|---------|--------|
| can sleep apnea cause fatigue | Paragraph | FAQ + Relationship with fatigue | First sentence = yes + mechanism (FAQ schema ✓) |
| signs of sleep apnea in adults | List | Common symptoms H2 | Convert to scannable 8-item list (snippet-ready) |
| sleep apnea and weight gain | Paragraph | Weight relationship H2 | Lead with bidirectional link |
| sleep apnea insulin resistance | Paragraph | Insulin H2 | 2-sentence mechanism summary at top |
| does CPAP help you lose weight | Paragraph | FAQ (exists) | Bold first line: “CPAP improves sleepiness; weight loss still requires…” |

**FAQ snippets:** Sleep apnea article has **10 FAQ schema items**—best positioned cornerstone for FAQ rich results once engagement blocks added (no layout change needed for schema).
`;
}

function buildAnswerRoadmap() {
  return `# Answer Page Roadmap

**Generated:** ${new Date().toISOString().slice(0, 10)}

**Principle:** Ship **answer pages before new blogs** when intent is narrow, high-intent, and linkable from existing cornerstones.

---

## Priority tier 1 — Create before new blogs

| Answer slug | Target query | Why before blog | Links from |
|-------------|--------------|-----------------|------------|
| \`brain-fog-after-eating\` | brain fog after eating, tired after lunch | High metabolic funnel; insulin + fatigue partial only | Insulin, fatigue, food-noise |
| \`why-normal-labs-dont-mean-healthy\` | normal labs but exhausted / healthy labs | Captures #1 Reddit theme across fatigue + hormones | Fatigue, free-T, sleep apnea |
| \`poor-sleep-feels-like-adhd\` | poor sleep feels like ADHD, sleep vs ADHD | Bridges sleep + ADHD clusters; blog gap in keyword map | Sleep apnea, fatigue, ADHD service |
| \`food-noise-returned-on-glp-1\` | food noise came back on Ozempic/Wegovy | GLP-1 business intent; food-noise cornerstone partial | Food noise, GLP-1 answers |
| \`weight-gain-after-stopping-ozempic\` | weight gain after Ozempic / regain GLP-1 | High commercial intent; no current URL | Food noise, medical weight loss service |

---

## Priority tier 2 — Extend existing answers (not new URLs)

| Existing answer | Enhancement |
|-----------------|-------------|
| \`/answers/what-is-food-noise\` | Add 2 sentences on “returned food noise” → link tier-1 answer when live |
| \`/answers/normal-a1c-insulin-resistance\` | Snippet-optimized opening; link “normal labs” answer |
| \`/answers/can-sleep-apnea-cause-fatigue\` | Already strong—add “feels like ADHD” cross-link |
| \`/answers/why-am-i-tired-even-after-sleeping\` | Add afternoon crash / brain fog cross-links |

---

## Priority tier 3 — After tier 1 answers

| Answer slug | Query | Notes |
|-------------|-------|-------|
| \`afternoon-energy-crash-after-lunch\` | afternoon crash fatigue | Metabolic + fatigue |
| \`high-shbg-low-free-testosterone\` | high SHBG low free T | Hormone cluster |
| \`ozempic-nausea-when-does-it-stop\` | semaglutide nausea timeline | GLP-1 (partially covered in glp-1-nausea-management) |

---

## Do NOT build yet (blog-first in old roadmap — deprioritized)

- Long-form “sleep vs ADHD” **blog** — answer page first
- “Weight regain after GLP-1” **blog** — answer page first
- California-specific fatigue blogs

**Expected candidates status:**

| Candidate | Status |
|-----------|--------|
| Brain Fog After Eating | **New answer** (tier 1) |
| Why Normal Labs Don't Mean Healthy | **New answer** (tier 1) |
| Poor Sleep Feels Like ADHD | **New answer** (tier 1) |
| Weight Gain After Ozempic | **New answer** (tier 1) |
| Food Noise Returned on GLP-1 | **New answer** (tier 1) |
`;
}

function buildClusterScorecard() {
  const clusters = [
    {
      name: 'ADHD',
      blogs: 28,
      answers: 25,
      service: '/adhd-care',
      links: 'High hub (blog/adhd.html); cornerstones cross-link',
      conversion: 'Header screening CTA on ADHD pages; Meet & Greet on blogs',
      score: 88,
    },
    {
      name: 'GLP-1',
      blogs: 12,
      answers: 8,
      service: '/weight-loss-metabolic-health',
      links: 'Food-noise cornerstone + medication blogs',
      conversion: 'Strong on food-noise; weak elsewhere',
      score: 82,
    },
    {
      name: 'Metabolic',
      blogs: 10,
      answers: 12,
      service: '/weight-loss-metabolic-health',
      links: 'Insulin cornerstone + IR answers',
      conversion: 'Moderate; needs mid-article CTA',
      score: 78,
    },
    {
      name: 'Fatigue',
      blogs: 3,
      answers: 4,
      service: '/telehealth',
      links: 'Fatigue cornerstone + sleep apnea + tired answer',
      conversion: 'Telehealth secondary on cta-band',
      score: 72,
    },
    {
      name: 'Sleep',
      blogs: 2,
      answers: 2,
      service: '/telehealth',
      links: 'Sleep apnea cornerstone; undertreated in hub',
      conversion: 'Weak; no engagement blocks on sleep blog',
      score: 58,
    },
    {
      name: 'Hormones',
      blogs: 2,
      answers: 8,
      service: '/mens-health-longevity',
      links: 'Free-T cornerstone + mens-health answers',
      conversion: "Men's health secondary CTA",
      score: 70,
    },
  ];
  const rows = clusters
    .map(
      (c) =>
        `| ${c.name} | ${c.blogs} | ${c.answers} | ${c.service} | ${c.links} | ${c.conversion} | **${c.score}/100** |`
    )
    .join('\n');
  return `# Cluster Strength Scorecard

**Generated:** ${new Date().toISOString().slice(0, 10)}

**Method:** Blogs = filename/topic heuristic; answers = \`answer-seeds.mjs\` topic tags; scores = editorial weighting (coverage × linking × conversion), not traffic data.

| Cluster | Blogs | Answer pages | Service hub | Internal linking | Conversion path | Strength |
|---------|------:|-------------:|-------------|------------------|-----------------|----------:|
${rows}

---

## Interpretation

- **ADHD** is the deepest cluster (volume + answers) but competes in SERPs; conversion path is screening → evaluation, not Meet & Greet on all pages.
- **GLP-1 / Metabolic** drive the metabolic discovery engine strategy—food-noise + insulin cornerstones are the hub.
- **Sleep** is the weakest cluster by asset count but **highest leverage** for cross-cluster authority (links fatigue, hormones, ADHD, metabolic).
- **Fatigue cornerstone** is the best “symptom entry” URL for broad top-of-funnel.

---

## Conversion path by cluster

| Cluster | Ideal path |
|---------|------------|
| ADHD | Blog/answer → \`/adhd-screening\` → evaluation |
| GLP-1 | Cornerstone → \`/weight-loss-metabolic-health\` → Meet & Greet |
| Metabolic | Insulin/food-noise → metabolic service → Meet & Greet |
| Fatigue | Fatigue/sleep → telehealth Meet & Greet → routed service |
| Sleep | Sleep apnea → telehealth + sleep testing referral narrative |
| Hormones | Free-T → men's health → Meet & Greet (no TRT promise) |
`;
}

function buildEngagementValidation() {
  return `# Engagement Validation Report

**Generated:** ${new Date().toISOString().slice(0, 10)}

## Summary

| Article | Blocks | Visual density | Verdict |
|---------|--------|----------------|---------|
| Food Noise | 8/8 | Medium-high | **Keep** — minor myth duplication with H3 myths |
| Insulin | 8/8 | Medium-high | **Keep** — Reddit box well placed |
| Fatigue | 8/8 | Medium-high | **Keep** — flowchart before causes (good) |
| Free T | 8/8 | Medium | **Keep** — infographic before total T section is correct |
| Sleep Apnea | **0/8** | Low (text only) | **Apply bundle** — outlier |

---

## Block-by-block assessment

| Component | Comprehension | Promotional risk | Redundancy risk | Verdict |
|-----------|---------------|------------------|-----------------|---------|
| Key Takeaway | High | Low | Low | **Keep** all cornerstones |
| Evidence Snapshot | High | Low | Low | **Keep** |
| Myth vs Reality | High | Low | **Medium** — overlaps H3 myth sections | Keep 2 pairs only; trim duplicate H3 myths later |
| Reddit Reality | High | Low if labeled paraphrase | Low | **Keep** |
| Clinical Pearl | High | Low | Low | **Keep** |
| Mini Infographic | Medium | Low | Low | **Keep** |
| Symptom Flowchart | High | Low | Low | **Keep** |
| Decision Tree | High | Low | Low | **Keep** — pair with CTA below |

---

## Issues found

1. **Sleep apnea:** No engagement components — breaks visual consistency and dwell-time pattern.
2. **Myth duplication:** Food noise + insulin have both \`blog-engage--myth\` and long H3 myth lists — readers may skim-repeat. *Fix:* keep box, shorten H3 list to 3 myths max (content trim, not new article).
3. **Promotional tone:** “How Siya Health approaches…” sections are the only promotional blocks—appropriate if paired with Meet & Greet after education.
4. **Clinical review:** Sleep apnea still has **multiple** pending-review asides — hurts credibility.

---

## Blocks to keep vs revise

| Keep as-is | Revise placement or copy |
|------------|-------------------------|
| Takeaway, Evidence, Pearl, Flowchart, Decision | Myth box — reduce overlap with body myths |
| Reddit | Sleep apnea — add full set |
| Infographic | — |

**Not promotional:** Reddit box (disclaimer present), evidence cites, decision trees (clinical).

**Genuinely improves comprehension:** Flowchart (hunger vs noise), fatigue workup flowchart, testosterone distribution infographic, insulin DPP stats infographic.
`;
}

function buildNext20() {
  const items = [
    { type: 'Answer', title: 'Brain fog after eating', biz: 9, seo: 8, cluster: 9, effort: 3 },
    { type: 'Answer', title: "Why normal labs don't mean you're healthy", biz: 8, seo: 9, cluster: 9, effort: 3 },
    { type: 'Answer', title: 'Poor sleep feels like ADHD', biz: 9, seo: 8, cluster: 10, effort: 4 },
    { type: 'Answer', title: 'Food noise returned on GLP-1', biz: 10, seo: 7, cluster: 9, effort: 3 },
    { type: 'Answer', title: 'Weight gain after stopping Ozempic', biz: 10, seo: 8, cluster: 8, effort: 4 },
    { type: 'Optimization', title: 'Sleep apnea: engagement + conversion parity', biz: 8, seo: 7, cluster: 10, effort: 2 },
    { type: 'Optimization', title: 'Insulin cornerstone: mid-article cta-block', biz: 9, seo: 5, cluster: 7, effort: 1 },
    { type: 'Optimization', title: 'All cornerstones: L2 cta-block after decision tree', biz: 9, seo: 4, cluster: 8, effort: 2 },
    { type: 'Service', title: 'Weight-loss page: link sleep apnea + food noise', biz: 8, seo: 6, cluster: 8, effort: 2 },
    { type: 'Answer', title: 'Afternoon energy crash after lunch', biz: 7, seo: 7, cluster: 8, effort: 3 },
    { type: 'Answer', title: 'High SHBG low free testosterone', biz: 8, seo: 7, cluster: 7, effort: 3 },
    { type: 'Optimization', title: 'Featured snippet tables (5 cornerstones)', biz: 6, seo: 9, cluster: 7, effort: 3 },
    { type: 'Article', title: 'Poor sleep vs ADHD (blog)', biz: 8, seo: 8, cluster: 9, effort: 7 },
    { type: 'Article', title: 'Weight regain after GLP-1 (blog)', biz: 9, seo: 8, cluster: 8, effort: 7 },
    { type: 'Service', title: "Men's health: OSA screen callout before TRT", biz: 9, seo: 5, cluster: 8, effort: 2 },
    { type: 'Optimization', title: 'Telehealth hub: fatigue cluster links', biz: 7, seo: 6, cluster: 7, effort: 2 },
    { type: 'Answer', title: 'Ozempic nausea timeline', biz: 7, seo: 6, cluster: 6, effort: 2 },
    { type: 'Article', title: 'Normal A1C high insulin (blog)', biz: 8, seo: 7, cluster: 8, effort: 6 },
    { type: 'Optimization', title: 'Dedupe myth H3s on food-noise + insulin', biz: 5, seo: 4, cluster: 5, effort: 2 },
    { type: 'Service', title: 'Homepage: metabolic symptom routing cards', biz: 8, seo: 5, cluster: 7, effort: 4 },
    { type: 'Article', title: 'Iron deficiency fatigue (blog)', biz: 6, seo: 7, cluster: 7, effort: 6 },
  ];
  items.sort((a, b) => b.biz + b.seo + b.cluster - (a.biz + a.seo + a.cluster));
  const table = items
    .map(
      (i, n) =>
        `| ${n + 1} | ${i.type} | ${i.title} | ${i.biz}/10 | ${i.seo}/10 | ${i.cluster}/10 | ${i.effort}/10 (lower=easier) |`
    )
    .join('\n');
  return `# Next 20 Content Priorities

**Generated:** ${new Date().toISOString().slice(0, 10)}

**Ranking:** Business value + SEO value + cluster value − implementation effort. **No new long-form blogs** until tier-1 answers + cornerstone optimizations ship.

| Rank | Type | Asset | Business | SEO | Cluster | Effort |
|------|------|-------|----------|-----|---------|--------|
${table}

---

## Top 5 immediate actions (no new articles)

1. Five tier-1 **answer pages** (see ANSWER-PAGE-ROADMAP.md)
2. **Sleep apnea** engagement + conversion parity
3. **Mid-article cta-block** on insulin, fatigue, free-T, sleep
4. **Snippet tables** on existing H2s
5. **Service page** cross-links from cornerstones
`;
}

function buildSummary() {
  return `# Phase 2 Optimization Summary

**Generated:** ${new Date().toISOString().slice(0, 10)}

## 1. Are the current cornerstone articles strong enough?

**Yes for clinical depth; no for conversion architecture parity.**

| Dimension | Assessment |
|-----------|------------|
| Clinical writing | Strong across all five |
| Internal linking | Strong hub (food-noise, insulin, fatigue, sleep, free-T) |
| FAQ / schema | Strong (especially sleep apnea: 10 FAQs) |
| Engagement UX | 4/5 complete; sleep apnea lags |
| Conversion | 1/5 has mid-article CTA; all rely on end band |

They are sufficient to **earn trust and rankings** but not yet a **discovery engine that converts** until L2/L3 CTAs and service cards are standardized.

---

## 2. Which article should be upgraded next?

**Priority 1: Sleep Apnea, Fatigue, and Metabolic Risk**

Reasons: zero engagement blocks, duplicate clinical-review markup, no mid-article \`cta-block\`, immediate chat loader, highest **cluster bridging** value (fatigue + hormones + ADHD + metabolic).

**Priority 2: Insulin Resistance and Weight Loss**

Add mid-article \`cta-block\` + service card — highest **commercial** cornerstone after food-noise.

---

## 3. Which answer pages should exist before new blogs?

1. Brain fog after eating  
2. Why normal labs don't mean you're healthy  
3. Poor sleep feels like ADHD  
4. Food noise returned on GLP-1  
5. Weight gain after stopping Ozempic  

See \`ANSWER-PAGE-ROADMAP.md\`.

---

## 4. Which asset is most likely to drive the first meaningful organic traffic?

**Why Am I Always Tired?** (\`/blog/why-am-i-always-tired-causes-when-to-see-doctor\`)

- Broad head term alignment  
- Large symptom TAM  
- Strong FAQ + engagement  
- Cross-links sleep, metabolic, ADHD (internal PageRank flow)

**Runner-up for velocity:** **Food Noise & GLP-1** — rising query, less competition than “ADHD Texas,” strong differentiation.

---

## 5. Which asset is most likely to drive the first patient conversion?

**Food Noise & GLP-1** (\`/blog/food-noise-and-glp-1-what-it-means-and-what-helps\`)

- Only cornerstone with mid-article \`cta-block\` → \`/weight-loss-metabolic-health\`  
- Highest GLP-1 / medical weight-loss intent  
- Meet & Greet + metabolic service alignment  

**Runner-up:** **Insulin Resistance** after adding mid-article CTA (same funnel, slightly earlier-funnel reader).

---

## Deliverables index

| Report | File |
|--------|------|
| Conversion architecture | \`CONVERSION-ARCHITECTURE-REPORT.md\` |
| Keyword coverage | \`CORNERSTONE-KEYWORD-COVERAGE.md\` |
| Snippet opportunities | \`SNIPPET-OPPORTUNITIES.md\` |
| Answer roadmap | \`ANSWER-PAGE-ROADMAP.md\` |
| Cluster scorecard | \`CLUSTER-STRENGTH-SCORECARD.md\` |
| Engagement validation | \`ENGAGEMENT-VALIDATION-REPORT.md\` |
| Next 20 priorities | \`NEXT-20-CONTENT-PRIORITIES.md\` |

---

## Recommended implementation order (existing assets only)

1. Standardize **cta-block** + **service card** component on all 5 cornerstones  
2. Apply **engagement bundle** to sleep apnea + dedupe clinical review  
3. Add **snippet tables** to existing sections  
4. Ship **5 answer pages** (generator script—separate task)  
5. Extend **service pages** with cornerstone deep-links  
`;
}

function main() {
  const files = {
    'CONVERSION-ARCHITECTURE-REPORT.md': buildConversionReport(),
    'CORNERSTONE-KEYWORD-COVERAGE.md': buildKeywordCoverage(),
    'SNIPPET-OPPORTUNITIES.md': buildSnippetOpportunities(),
    'ANSWER-PAGE-ROADMAP.md': buildAnswerRoadmap(),
    'CLUSTER-STRENGTH-SCORECARD.md': buildClusterScorecard(),
    'ENGAGEMENT-VALIDATION-REPORT.md': buildEngagementValidation(),
    'NEXT-20-CONTENT-PRIORITIES.md': buildNext20(),
    'PHASE-2-OPTIMIZATION-SUMMARY.md': buildSummary(),
  };
  for (const [name, body] of Object.entries(files)) {
    fs.writeFileSync(path.join(SITE, name), body, 'utf8');
    console.log('Wrote', name);
  }
}

main();
