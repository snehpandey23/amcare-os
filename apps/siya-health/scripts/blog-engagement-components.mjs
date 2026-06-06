/**
 * Reusable blog engagement components — Siya Health branding.
 * Import in apply scripts or paste HTML from buildEngagementBlock().
 */
import { BOOKING_LINK } from '../data/providers-core.mjs';

export function keyTakeaway({ title = 'Key takeaways', items }) {
  return `
            <aside class="blog-engage blog-engage--takeaway" role="note" aria-label="${title}">
              <p class="blog-engage-label">${title}</p>
              <ul class="blog-engage-list">
                ${items.map((t) => `<li>${t}</li>`).join('\n                ')}
              </ul>
            </aside>`;
}

export function evidenceSnapshot({ title = 'Evidence snapshot', rows }) {
  return `
            <aside class="blog-engage blog-engage--evidence" role="note" aria-label="${title}">
              <p class="blog-engage-label">${title}</p>
              <dl class="blog-engage-evidence">
                ${rows.map(({ label, value, cite }) => `<div class="blog-engage-evidence-row"><dt>${label}</dt><dd>${value}${cite ? ` <span class="blog-engage-cite">${cite}</span>` : ''}</dd></div>`).join('\n                ')}
              </dl>
            </aside>`;
}

export function mythVsReality({ title = 'Myth vs reality', pairs }) {
  return `
            <aside class="blog-engage blog-engage--myth" role="note" aria-label="${title}">
              <p class="blog-engage-label">${title}</p>
              <div class="blog-engage-myth-grid">
                ${pairs
                  .map(
                    ({ myth, reality }) => `
                <div class="blog-engage-myth-row">
                  <p class="blog-engage-myth"><span class="blog-engage-tag">Myth</span> ${myth}</p>
                  <p class="blog-engage-reality"><span class="blog-engage-tag blog-engage-tag--ok">Reality</span> ${reality}</p>
                </div>`
                  )
                  .join('')}
              </div>
            </aside>`;
}

export function redditReality({ title = 'What patients often ask online', quotes }) {
  return `
            <aside class="blog-engage blog-engage--reddit" role="note" aria-label="${title}">
              <p class="blog-engage-label">${title}</p>
              <p class="blog-engage-sub">Paraphrased themes from forums and patient communities—not medical advice.</p>
              <ul class="blog-engage-quotes">
                ${quotes.map((q) => `<li>${q}</li>`).join('\n                ')}
              </ul>
            </aside>`;
}

export function clinicalPearl({ title = 'Clinical pearl', body }) {
  return `
            <aside class="blog-engage blog-engage--pearl" role="note" aria-label="${title}">
              <p class="blog-engage-label">${title}</p>
              <p class="blog-engage-body">${body}</p>
            </aside>`;
}

export function miniInfographic({ title, segments }) {
  return `
            <figure class="blog-engage blog-engage--infographic" aria-label="${title}">
              <figcaption class="blog-engage-label">${title}</figcaption>
              <div class="blog-engage-infographic">
                ${segments
                  .map(
                    (s) => `
                <div class="blog-engage-stat">
                  <span class="blog-engage-stat-value">${s.value}</span>
                  <span class="blog-engage-stat-label">${s.label}</span>
                  ${s.note ? `<span class="blog-engage-stat-note">${s.note}</span>` : ''}
                </div>`
                  )
                  .join('')}
              </div>
            </figure>`;
}

export function symptomFlowchart({ title, steps }) {
  return `
            <figure class="blog-engage blog-engage--flowchart" aria-label="${title}">
              <figcaption class="blog-engage-label">${title}</figcaption>
              <ol class="blog-flowchart">
                ${steps
                  .map(
                    (s, i) => `
                <li class="blog-flowchart-step">
                  <span class="blog-flowchart-num">${i + 1}</span>
                  <div class="blog-flowchart-content">
                    <strong>${s.heading}</strong>
                    <p>${s.body}</p>
                  </div>
                </li>`
                  )
                  .join('')}
              </ol>
            </figure>`;
}

export function decisionTree({ title, nodes }) {
  return `
            <figure class="blog-engage blog-engage--decision" aria-label="${title}">
              <figcaption class="blog-engage-label">${title}</figcaption>
              <div class="blog-decision-tree">
                ${nodes
                  .map(
                    (n) => `
                <div class="blog-decision-node${n.branch ? ' blog-decision-node--branch' : ''}">
                  <p class="blog-decision-q">${n.question}</p>
                  ${n.yes ? `<p class="blog-decision-yes"><span>Yes →</span> ${n.yes}</p>` : ''}
                  ${n.no ? `<p class="blog-decision-no"><span>No →</span> ${n.no}</p>` : ''}
                  ${n.action ? `<p class="blog-decision-action">${n.action}</p>` : ''}
                </div>`
                  )
                  .join('')}
              </div>
            </figure>`;
}

/** Comparison table for “vs” guides and option choosers */
export function comparisonTable({ title, headers, rows }) {
  const head = headers.map((h) => `<th scope="col">${h}</th>`).join('');
  const body = rows
    .map(
      (cells) =>
        `<tr>${cells.map((c, i) => `<${i === 0 ? 'th scope="row"' : 'td'}>${c}</${i === 0 ? 'th' : 'td'}>`).join('')}</tr>`,
    )
    .join('\n                ');
  return `
            <figure class="blog-engage blog-engage--comparison" aria-label="${title}">
              <figcaption class="blog-engage-label">${title}</figcaption>
              <div class="blog-engage-table-wrap">
                <table class="blog-engage-table">
                  <thead><tr>${head}</tr></thead>
                  <tbody>
                ${body}
                  </tbody>
                </table>
              </div>
            </figure>`;
}

/** Cornerstone-specific engagement bundles */
export const CORNERSTONE_ENGAGEMENT = {
  'food-noise-and-glp-1-what-it-means-and-what-helps': {
    afterInternalLinks: keyTakeaway({
      items: [
        '<strong>Food noise</strong> is intrusive thinking about food—not the same as physiological hunger.',
        'GLP-1 medications often reduce cravings and preoccupation in trials, but response varies person to person.',
        'Behavioral skills, sleep, and ADHD care still matter when medication quiets the “soundtrack.”',
      ],
    }),
    afterRealWorldProblem: redditReality({
      quotes: [
        '“I want my brain to stop negotiating food all day—not just lose pounds.”',
        '“Week 2 on semaglutide: nausea is rough, but the pantry voice is quieter.”',
        '“Food thoughts came back around pizza even though I’m still on the shot—is that normal?”',
        '“Is this willpower failure or something medical?”',
      ],
    }),
    afterWhyThisHappens: symptomFlowchart({
      title: 'Hunger vs food noise vs hedonic eating',
      steps: [
        {
          heading: 'Homeostatic hunger',
          body: 'Energy need rises—you feel empty, eat, and satisfaction follows when needs are met.',
        },
        {
          heading: 'Food noise',
          body: 'Persistent food thoughts while full; planning, craving, or debating eating without true fuel need.',
        },
        {
          heading: 'Hedonic eating',
          body: 'Eating for reward or palatability after energy needs are met—often with highly processed foods.',
        },
      ],
    }),
    beforeEvidence: evidenceSnapshot({
      rows: [
        { label: 'STEP 1 (semaglutide 2.4 mg)', value: '~14.9% mean weight loss vs ~2.4% placebo at 68 weeks', cite: 'NEJM 2021' },
        { label: 'Eating control instruments', value: 'Less craving / preoccupation vs placebo in large trials', cite: 'Control of Eating Questionnaire' },
        { label: 'Food noise construct', value: 'Emerging patient-reported measure—not an FDA endpoint', cite: 'Research in progress' },
      ],
    }),
    afterStepTrial: miniInfographic({
      title: 'What large GLP-1 trials established (weight outcomes)',
      segments: [
        { value: '−14.9%', label: 'Mean weight change (semaglutide 2.4 mg)', note: 'STEP 1, 68 weeks + lifestyle' },
        { value: '≥5%', label: 'Most participants lost at least this much', note: 'Clinically meaningful threshold' },
        { value: 'Varies', label: 'Food-noise relief', note: 'Not identical for everyone' },
      ],
    }),
    beforeMyths: mythVsReality({
      pairs: [
        {
          myth: 'Food noise is just hunger—drink water and push through.',
          reality: 'You can be full and still have loud food noise; shame often worsens eating cycles.',
        },
        {
          myth: 'Quieter food thoughts mean you should eat as little as possible.',
          reality: 'Adequate protein and resistance training matter more when appetite drops.',
        },
      ],
    }),
    beforePracticalTakeaways: clinicalPearl({
      body: 'Track three columns for one week: physical hunger (0–10), food-noise intensity (0–10), and emotional trigger. Patterns tell your clinician whether GLP-1, ADHD evaluation, sleep treatment, or therapy should lead—not a social media protocol.',
    }),
    beforeWhenToSeek: decisionTree({
      title: 'When to book a medical visit (not urgent care)',
      nodes: [
        {
          question: 'Does food preoccupation impair work, parenting, or sleep most days?',
          yes: 'Schedule evaluation for binge patterns, ADHD, metabolic labs, and GLP-1 eligibility.',
          no: 'Continue structured self-monitoring; revisit if worsening.',
        },
        {
          question: 'On GLP-1: persistent vomiting, severe abdominal pain, or dehydration?',
          yes: 'Contact your prescriber promptly; emergency care if unable to keep fluids down.',
          branch: true,
        },
      ],
    }),
  },

  'insulin-resistance-and-weight-loss-clinician-overview': {
    afterInternalLinks: keyTakeaway({
      items: [
        'Insulin resistance is reduced tissue response to insulin—often with compensatory high insulin before A1C rises.',
        'Visceral fat and weight loss magnitude usually matter more than a branded diet name.',
        'GLP-1 therapy can help weight and metabolic markers but does not replace sleep, strength training, or ADHD-related eating patterns.',
      ],
    }),
    afterWhatIs: miniInfographic({
      title: 'Prevention trial benchmarks (lifestyle)',
      segments: [
        { value: '58%', label: 'Diabetes risk reduction', note: 'DPP lifestyle arm vs placebo' },
        { value: '~7%', label: 'Target weight loss', note: 'DPP & Finnish DPS programs' },
        { value: '150 min', label: 'Weekly activity goal', note: 'Moderate intensity' },
      ],
    }),
    afterEarlySigns: symptomFlowchart({
      title: 'Clues that insulin resistance may be in play',
      steps: [
        { heading: 'Waist / visceral pattern', body: 'Central adiposity even when scale change seems modest.' },
        { heading: 'Post-meal slump', body: 'Fatigue or brain fog 1–3 hours after high-glycemic meals.' },
        { heading: 'Labs trending', body: 'Triglycerides up, HDL down, blood pressure rising over years.' },
        { heading: 'Normal A1C still possible', body: 'Compensation can mask glucose exposure early (<a href="/answers/normal-a1c-insulin-resistance">learn more</a>).' },
      ],
    }),
    beforeEvidence: evidenceSnapshot({
      rows: [
        { label: 'DIETFITS (JAMA 2018)', value: 'No significant 12-month weight-loss difference low-fat vs low-carb in 609 adults', cite: 'Genotype/insulin secretion interactions not found' },
        { label: 'Visceral fat & HOMA-IR', value: 'Strongest adiposity correlate in meta-analyses', cite: 'Sci Rep 2016' },
        { label: 'Sleep restriction', value: 'Can worsen insulin sensitivity within weeks', cite: 'Diabetes Care 2023' },
      ],
    }),
    afterFoodNoise: redditReality({
      quotes: [
        '“My A1C is 5.4—why can’t I lose weight?”',
        '“I crash every afternoon after lunch—is that blood sugar?”',
        '“Do I have to go keto if I’m insulin resistant?”',
        '“HOMA-IR 3.2 on Reddit—does that diagnose me?”',
      ],
    }),
    beforeMyths: mythVsReality({
      pairs: [
        {
          myth: 'Normal A1C means no insulin resistance.',
          reality: 'A1C reflects average glucose, not insulin workload; early resistance is often hidden.',
        },
        {
          myth: 'You must eat very low carb because you are insulin resistant.',
          reality: 'Weight loss magnitude and visceral fat reduction drive sensitivity more than diet brand in trials.',
        },
      ],
    }),
    beforePractical: clinicalPearl({
      body: 'Ask for waist trend, fasting glucose, A1C, lipids, and blood pressure—not fasting insulin alone. If ADHD, sleep apnea, or shift work affects meals, name that early; impulsivity and sleep debt independently worsen metabolic outcomes.',
    }),
    beforeFaq: decisionTree({
      title: 'Labs & next-step thinking (with your clinician)',
      nodes: [
        {
          question: 'A1C in prediabetes range (5.7–6.4%)?',
          yes: 'Discuss structured lifestyle, metformin when appropriate, and complication-focused follow-up per ADA guidance.',
          no: 'Still evaluate waist, lipids, symptoms, and family history—IR can precede prediabetes labels.',
        },
        {
          question: 'Stalled loss despite real effort + snoring or unrefreshing sleep?',
          yes: 'Screen for obstructive sleep apnea before blaming “willpower” (<a href="/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign">sleep apnea guide</a>).',
          branch: true,
        },
      ],
    }),
  },

  'why-am-i-always-tired-causes-when-to-see-doctor': {
    afterInternalLinks: keyTakeaway({
      items: [
        '<strong>Fatigue</strong> is low energy despite rest; <strong>sleepiness</strong> is the drive to fall asleep—they need different workups.',
        'Normal CBC/CMP does not rule out iron without anemia, B12, thyroid, sleep apnea, or early insulin resistance.',
        'ADHD, burnout, depression, and sleep disorders overlap—timeline and context separate many mimics.',
      ],
    }),
    afterWhatFatigueMeans: symptomFlowchart({
      title: 'Fatigue workup — how clinicians organize causes',
      steps: [
        { heading: 'Sleep quantity & quality', body: 'Apnea, insomnia, fragmented sleep, circadian delay (<a href="/answers/why-am-i-tired-even-after-sleeping">tired after sleeping</a>).' },
        { heading: 'Medical & labs', body: 'Thyroid, iron, B12, glucose/insulin patterns, medications.' },
        { heading: 'Mental health', body: 'Depression, anxiety, PTSD—anergia is common.' },
        { heading: 'Endocrine & hormones', body: 'Low testosterone (men), thyroid; treat sleep apnea before TRT rush.' },
        { heading: 'ADHD & burnout', body: 'Lifelong vs job-linked exhaustion (<a href="/answers/adhd-vs-burnout">ADHD vs burnout</a>).' },
      ],
    }),
    afterMissedDiagnoses: evidenceSnapshot({
      rows: [
        { label: 'Obstructive sleep apnea', value: 'Highly prevalent; many cases undiagnosed', cite: 'AASM indicators' },
        { label: 'Iron deficiency without anemia', value: 'Fatigue may improve when ferritin low in trials', cite: 'CMAJ 2012; meta-analyses' },
        { label: 'ADHD & sleep 2025', value: 'Distinct sleep domains linked to inattention and sleepiness', cite: 'Sleep Medicine 2025' },
      ],
    }),
    beforeMyths: mythVsReality({
      pairs: [
        {
          myth: 'Seven hours in bed equals seven hours of restorative sleep.',
          reality: 'Apnea, insomnia, and ADHD-related delayed sleep phase fragment rest.',
        },
        {
          myth: 'More coffee is the fix for chronic tiredness.',
          reality: 'Caffeine masks sleep debt and can worsen anxiety-insomnia cycles.',
        },
      ],
    }),
    afterMyths: redditReality({
      quotes: [
        '“Labs normal but I’m exhausted—doctor says I’m fine.”',
        '“Is it ADHD, burnout, or depression?”',
        '“Coffee stopped working.”',
        '“Tired 2 hours after lunch every day.”',
      ],
    }),
    beforePractical: clinicalPearl({
      body: 'Bring a two-week log: bedtime, wake time, snoring witnessed, caffeine after 2 p.m., and post-meal crashes. Mention stimulant use, shift work, and whether fatigue is lifelong or started with one job.',
    }),
    beforeWhenToSeek: decisionTree({
      title: 'When to seek care soon',
      nodes: [
        {
          question: 'Epworth sleepiness score high or witnessed apneas / gasping?',
          yes: 'Discuss sleep study; untreated apnea worsens fatigue, BP, and insulin resistance.',
          no: 'Continue structured sleep hygiene; add labs per clinician.',
        },
        {
          question: 'Post-exertional crash &gt;24 hours, unrefreshing sleep, cognitive PEM?',
          yes: 'Discuss ME/CFS criteria with a clinician—pacing, not “push through.”',
          branch: true,
        },
      ],
    }),
    beforeFaq: miniInfographic({
      title: 'Quick differential anchors',
      segments: [
        { value: 'OSA', label: 'Snoring + unrefreshing sleep', note: 'Even without classic loud snoring' },
        { value: 'IR', label: 'Afternoon slump + waist gain', note: '<a href="/blog/insulin-resistance-and-weight-loss-clinician-overview">Insulin guide</a>' },
        { value: 'ADHD', label: 'Lifelong chaos + sleep debt', note: '<a href="/adhd-care">ADHD care</a>' },
      ],
    }),
  },

  'free-testosterone-vs-total-testosterone-what-patients-should-know': {
    afterInternalLinks: keyTakeaway({
      items: [
        '<strong>Total testosterone</strong> includes SHBG-bound, albumin-bound, and free fractions.',
        '<strong>Free testosterone</strong> (~2–3% unbound) drives many androgen effects—SHBG determines how much is “locked up.”',
        'Symptoms with “normal” total T often reflect high SHBG, non-hormonal causes, or assay/timing issues—not automatic need for TRT.',
      ],
    }),
    afterHook: miniInfographic({
      title: 'How testosterone is distributed in blood (typical teaching model)',
      segments: [
        { value: '~44–65%', label: 'Bound to SHBG', note: 'Less bioavailable' },
        { value: '~30–50%', label: 'Albumin-bound', note: 'Bioavailable' },
        { value: '~2–3%', label: 'Free testosterone', note: 'Unbound' },
      ],
    }),
    afterWhyBothMatter: symptomFlowchart({
      title: 'Why total and free can disagree',
      steps: [
        { heading: 'High SHBG', body: 'Normal or mid total T with low free T and symptoms.' },
        { heading: 'Low SHBG (obesity, insulin resistance)', body: 'Low total T with adequate calculated free T.' },
        { heading: 'Non-hormonal mimics', body: 'OSA, depression, thyroid, iron, sleep debt, ADHD.' },
        { heading: 'Lab timing', body: 'Morning fasting samples; repeat before major decisions.' },
      ],
    }),
    beforeEvidence: evidenceSnapshot({
      rows: [
        { label: 'Endocrine Society 2018', value: 'Diagnose hypogonadism with symptoms + confirmed low T; repeat morning samples', cite: 'Guideline' },
        { label: 'Obesity paradox', value: 'Low total T common; calculated free T may be normal', cite: 'PMID 25777143' },
        { label: 'OSA & CPAP', value: 'Treat apnea for sleep/CV reasons—do not expect reliable T rise from CPAP alone', cite: 'Meta-analyses' },
      ],
    }),
    beforeMyths: mythVsReality({
      pairs: [
        {
          myth: 'Normal total testosterone rules out a problem.',
          reality: 'Elevated SHBG can produce symptomatic low free T at mid-range totals.',
        },
        {
          myth: 'Every man over 40 needs testosterone replacement.',
          reality: 'Guidelines advise against routine TRT by age alone; treat reversible causes first.',
        },
      ],
    }),
    afterMyths: redditReality({
      quotes: [
        '“Total T 450 but I feel awful—clinic says fine.”',
        '“High SHBG destroyed my free T.”',
        '“TRT mill only checked total once in the afternoon.”',
        '“Low total but doctor says I’m fine” (low SHBG context).',
      ],
    }),
    beforePractical: clinicalPearl({
      body: 'Request morning (before 10 a.m.) fasting total testosterone on two separate days when symptoms fit. If SHBG is high or total is borderline, discuss calculated free T by validated equation—not every “free T” line on a lab slip uses reliable methodology.',
    }),
    beforeWhenEval: decisionTree({
      title: 'Thinking like an endocrinologist (simplified)',
      nodes: [
        {
          question: 'Symptoms + repeatedly low morning total T on standardized assay?',
          yes: 'Evaluate LH/FSL, prolactin when indicated; screen untreated severe OSA before TRT.',
          no: 'Pursue sleep, thyroid, iron, mood, and ADHD differentials before hormone therapy.',
        },
        {
          question: 'Obesity + low total T + low SHBG?',
          yes: 'Calculated free T may be normal—weight loss and sleep apnea care may help more than reflex TRT.',
          branch: true,
        },
      ],
    }),
  },
};

const CLINICAL_REVIEW_SINGLE = `            <aside class="clinical-review clinical-review--pending" aria-label="Clinical review status">
              <p class="clinical-review-label">Clinician-informed</p>
              <p>Educational content informed by clinical practice patterns—not personal medical advice.</p>
            </aside>

`;

export const CLINICAL_REVIEW_BLOCK = CLINICAL_REVIEW_SINGLE;

export function dedupeClinicalReview(html) {
  return html.replace(/(\s*<aside class="clinical-review[\s\S]*?<\/aside>)+/g, CLINICAL_REVIEW_SINGLE);
}

export const MEET_GREET_URL = BOOKING_LINK;

export function l1ServiceLink({ href, text }) {
  return `
            <p class="blog-service-link"><a href="${href}">${text}</a></p>`;
}

export function midCtaBlock() {
  return '';
}

export function serviceCard({ title, body, href, ctaLabel = 'Explore Care Options' }) {
  const id = title.replace(/\W+/g, '-').toLowerCase().slice(0, 40);
  return `
            <aside class="blog-service-card" aria-labelledby="service-card-${id}">
              <h3 id="service-card-${id}">${title}</h3>
              <p>${body}</p>
              <a class="button secondary" href="${href}">${ctaLabel}</a>
            </aside>`;
}

export function relatedHealthGuides({ items }) {
  const picks = items.slice(0, 3);
  return `
            <section class="related-health-guides" aria-labelledby="related-health-guides-heading">
              <h2 id="related-health-guides-heading">Related Health Guides</h2>
              <ul>
                ${picks.map((i) => `<li><a href="${i.href}">${i.label}</a></li>`).join('\n                ')}
              </ul>
            </section>`;
}

/** Final exit CTA band — one per blog article, after article body */
export function finalCtaBandSection({ adhd = false }) {
  const primaryLabel = adhd ? 'Book ADHD Evaluation' : 'Talk to a Clinician';
  const primaryHref = MEET_GREET_URL;
  return `
      <section class="section blog-final-cta">
        <div class="container">
          <div class="cta-band">
            <h3>Not sure where to start?</h3>
            <p>A brief clinician conversation can help you understand your options—no obligation.</p>
            <div class="cta-band-buttons">
              <a class="button" href="${primaryHref}" target="_blank" rel="noopener">${primaryLabel}</a>
            </div>
          </div>
        </div>
      </section>`;
}

export function snippetDefinition({ term, text }) {
  return `
            <p class="blog-snippet-def"><strong>${term}:</strong> ${text}</p>`;
}

export function snippetTable({ caption, headers, rows }) {
  return `
            <figure class="blog-snippet-table-wrap">
              <figcaption class="blog-snippet-table-caption">${caption}</figcaption>
              <table class="blog-snippet-table">
                <thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead>
                <tbody>
                  ${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('\n                  ')}
                </tbody>
              </table>
            </figure>`;
}

/** Sleep apnea cornerstone — engagement only (no Reddit/infographic per Phase 2) */
CORNERSTONE_ENGAGEMENT['sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign'] = {
  afterInternalLinks: keyTakeaway({
    items: [
      '<strong>Obstructive sleep apnea (OSA)</strong> fragments sleep with breathing pauses—even when time in bed looks adequate.',
      'OSA links to fatigue, insulin resistance, weight stalls, low testosterone symptoms, and attention problems that mimic ADHD.',
      'Screening tools prompt evaluation; <strong>sleep testing</strong> confirms diagnosis when clinically appropriate.',
    ],
  }),
  beforeWhyMissed: evidenceSnapshot({
    rows: [
      { label: 'Undiagnosed burden', value: 'Large share of moderate–severe OSA in adults remains untreated', cite: 'AASM indicators' },
      { label: 'CPAP + metabolic syndrome', value: 'Meta-analysis RR ~0.82 for MetS prevalence with CPAP in trials', cite: 'Frontiers Med 2024' },
      { label: 'Lifestyle in OSA', value: 'Weight-loss programs often needed beyond CPAP for durable metabolic benefit', cite: 'ERHM 2024 narrative' },
    ],
  }),
  beforeSymptoms: symptomFlowchart({
    title: 'Sleep apnea workup — symptom clusters',
    steps: [
      { heading: 'Night', body: 'Snoring, witnessed pauses, gasping, choking, restless sleep.' },
      { heading: 'Morning', body: 'Dry mouth, headache, unrefreshing sleep despite hours in bed.' },
      { heading: 'Day', body: 'Sleepiness or fatigue, brain fog, irritability, reduced libido.' },
      { heading: 'Metabolic / CV', body: 'Resistant hypertension, weight gain, prediabetes—often with central adiposity.' },
    ],
  }),
  afterSymptoms: mythVsReality({
    pairs: [
      {
        myth: 'Snoring is harmless if I am not sleepy.',
        reality: 'Partner-witnessed pauses and unrefreshing sleep warrant evaluation even without classic sleepiness.',
      },
      {
        myth: 'CPAP will fix my weight and testosterone.',
        reality: 'CPAP improves sleep and some markers; weight and hormones still need directed care.',
      },
    ],
  }),
  beforePractical: clinicalPearl({
    body: 'Bed-partner observations beat self-report alone. Ask whether you stop breathing, choke, or snort awake—and bring blood pressure and waist trend. Treat sleep before reflex TRT or stimulant dose increases when OSA clues exist.',
  }),
  afterPractical: decisionTree({
    title: 'When to pursue sleep testing (with your clinician)',
    nodes: [
      {
        question: 'Snoring plus witnessed pauses, gasping, or unrefreshing sleep?',
        yes: 'Discuss AASM-appropriate sleep testing—not online quizzes alone.',
        no: 'Still evaluate if resistant hypertension, diabetes, AFib, or stroke history present.',
      },
      {
        question: 'Fatigue or brain fog with normal basic labs?',
        yes: 'OSA is a high-yield branch—especially before attributing symptoms to “low T” or ADHD alone.',
        branch: true,
      },
    ],
  }),
};

export const CORNERSTONE_CONVERSION = {
  'food-noise-and-glp-1-what-it-means-and-what-helps': {
    l1: { href: '/weight-loss-metabolic-health', text: 'Explore medical weight loss &amp; metabolic care →' },
    l2Secondary: '/weight-loss-metabolic-health',
    serviceCard: {
      title: 'Medical weight loss with GLP-1 oversight',
      body: 'Physician-led telehealth for food noise, cravings, and metabolic labs—when GLP-1 therapy is clinically appropriate.',
      href: '/weight-loss-metabolic-health',
    },
    guides: [
      { href: '/answers/what-is-food-noise', label: 'What is food noise?' },
      { href: '/answers/glp-1-side-effects', label: 'GLP-1 side effects' },
      { href: '/answers/glp-1-nausea-management', label: 'Managing GLP-1 nausea' },
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
    ],
    ctaBandSecondary: { href: '/weight-loss-metabolic-health', label: 'Explore Care Options' },
  },
  'insulin-resistance-and-weight-loss-clinician-overview': {
    l1: { href: '/weight-loss-metabolic-health', text: 'Explore metabolic health &amp; medical weight loss →' },
    l2Secondary: '/weight-loss-metabolic-health',
    serviceCard: {
      title: 'Metabolic health &amp; medical weight loss',
      body: 'Structured evaluation for insulin resistance, waist trend, GLP-1 eligibility, and coordinated ADHD or sleep care.',
      href: '/weight-loss-metabolic-health',
    },
    guides: [
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
      { href: '/answers/normal-a1c-insulin-resistance', label: 'Normal A1C, insulin resistance?' },
      { href: '/answers/insulin-resistance-without-diabetes', label: 'IR without diabetes' },
      { href: '/answers/medical-weight-loss-vs-dieting', label: 'Medical weight loss vs dieting' },
    ],
    ctaBandSecondary: { href: '/weight-loss-metabolic-health', label: 'Explore Care Options' },
  },
  'why-am-i-always-tired-causes-when-to-see-doctor': {
    l1: { href: '/telehealth', text: 'Explore telehealth fatigue &amp; sleep workup →' },
    l2Secondary: '/telehealth',
    serviceCard: {
      title: 'Telehealth fatigue evaluation',
      body: 'Map sleep apnea, labs, ADHD overlap, and metabolic contributors—with referrals when in-person testing is needed.',
      href: '/telehealth',
    },
    guides: [
      { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Tired after sleeping' },
      { href: '/answers/can-sleep-apnea-cause-fatigue', label: 'Can sleep apnea cause fatigue?' },
      { href: '/answers/adhd-vs-burnout', label: 'ADHD vs burnout' },
      { href: '/answers/signs-of-sleep-apnea-in-adults', label: 'Signs of sleep apnea' },
    ],
    ctaBandSecondary: { href: '/telehealth', label: 'Explore Care Options' },
  },
  'free-testosterone-vs-total-testosterone-what-patients-should-know': {
    l1: { href: '/mens-health-longevity', text: "Explore men's health &amp; hormone evaluation →" },
    l2Secondary: '/mens-health-longevity',
    serviceCard: {
      title: "Men's health &amp; longevity evaluation",
      body: 'Morning labs, SHBG context, sleep apnea screening, and evidence-based plans—not TRT-first marketing.',
      href: '/mens-health-longevity',
    },
    guides: [
      { href: '/answers/what-is-free-testosterone', label: 'What is free testosterone?' },
      { href: '/answers/what-does-low-testosterone-feel-like', label: 'Low testosterone symptoms' },
      { href: '/answers/testosterone-and-adhd-overlap', label: 'Testosterone and ADHD overlap' },
      { href: '/answers/can-sleep-apnea-cause-fatigue', label: 'Sleep apnea and fatigue' },
    ],
    ctaBandSecondary: { href: '/mens-health-longevity', label: 'Explore Care Options' },
  },
  'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': {
    l1: { href: '/telehealth', text: 'Explore telehealth sleep &amp; fatigue care →' },
    l2Secondary: '/telehealth',
    serviceCard: {
      title: 'Sleep, fatigue &amp; metabolic coordination',
      body: 'Telehealth mapping for OSA clues, metabolic labs, and weight paths—with sleep testing referrals when indicated.',
      href: '/weight-loss-metabolic-health',
      ctaLabel: 'Explore metabolic health',
    },
    extraServiceLink: { href: '/telehealth', text: 'Explore telehealth care options →' },
    guides: [
      { href: '/answers/can-sleep-apnea-cause-fatigue', label: 'Can sleep apnea cause fatigue?' },
      { href: '/answers/signs-of-sleep-apnea-in-adults', label: 'Signs of sleep apnea in adults' },
      { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Tired after sleeping' },
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
    ],
    ctaBandSecondary: { href: '/telehealth', label: 'Explore Care Options' },
  },
};
