/**
 * Health Guide visual engagement — reuses blog-engagement-components.
 * Consumed by generate-answer-pages.mjs (not hand-edited HTML).
 */
import {
  clinicalPearl,
  comparisonTable,
  decisionTree,
  evidenceSnapshot,
  keyTakeaway,
  miniInfographic,
  mythVsReality,
  symptomFlowchart,
} from './blog-engagement-components.mjs';

/** Component registry for audits */
export const ENGAGE_COMPONENTS = {
  flowchart: 'symptomFlowchart',
  decision: 'decisionTree',
  comparison: 'comparisonTable',
  myth: 'mythVsReality',
  evidence: 'evidenceSnapshot',
  pearl: 'clinicalPearl',
  infographic: 'miniInfographic',
  takeaway: 'keyTakeaway',
};

function wordCount(seed) {
  const parts = [
    seed.shortAnswer,
    ...(seed.paragraphs || []),
    ...(seed.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.listItems || [])]),
  ];
  return parts.join(' ').split(/\s+/).filter(Boolean).length;
}

function deriveTakeawayBullets(seed) {
  const lead = (seed.shortAnswer || '').replace(/\s+/g, ' ').trim();
  const fromLead = lead
    ? lead.length > 155
      ? [`${lead.slice(0, 152)}…`]
      : [lead]
    : [];
  const fromParas = (seed.paragraphs || [])
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 40)
    .slice(0, 2)
    .map((p) => (p.length > 120 ? `${p.slice(0, 117)}…` : p));
  const bullets = [...fromLead, ...fromParas].slice(0, 3);
  if (bullets.length < 2 && lead) bullets.push('See Evidence & references for guideline anchors.');
  bullets.push('Bring questions to a licensed clinician—not online quizzes alone.');
  return bullets.slice(0, 4);
}

function normEvidenceText(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function evidenceRowsFromSeed(seed) {
  const ev = seed.evidence || [];
  const rows = [];
  for (const line of ev.slice(0, 3)) {
    const trimmed = line.replace(/\s+/g, ' ').trim();
    if (!trimmed) continue;

    const pmid = trimmed.match(/PMID\s*(\d+)/i);
    const cite = pmid
      ? `PMID ${pmid[1]}`
      : trimmed.includes('FDA')
        ? 'FDA labeling'
        : trimmed.includes('ADA')
          ? 'ADA'
          : trimmed.includes('AASM')
            ? 'AASM'
            : trimmed.includes('NICE')
              ? 'NICE'
              : trimmed.includes('DSM')
                ? 'DSM-5-TR'
                : '';

    let label;
    let value;
    const dashParts = trimmed.split(/\s*[—–]\s*/);
    const paren = trimmed.match(/^([^(]+)\(([^)]+)\)\s*$/);

    if (pmid) {
      const beforePmid = trimmed.replace(/\s*PMID\s*\d+.*/i, '').trim();
      label = (beforePmid || 'Published study').slice(0, 48);
      value = beforePmid ? `${beforePmid} (${cite})` : cite;
    } else if (dashParts.length >= 2 && dashParts[1].length > 8) {
      label = dashParts[0].trim().slice(0, 48);
      value = dashParts.slice(1).join(' — ').trim();
    } else if (paren && paren[2].length > 8) {
      label = paren[1].trim().slice(0, 48);
      value = paren[2].trim();
    } else if (cite) {
      const base = trimmed.split(/[:(]/)[0].trim();
      label = base.slice(0, 48);
      value = `${base} (${cite})`;
    } else {
      continue;
    }

    if (normEvidenceText(label) === normEvidenceText(value)) continue;
    if (value.length < 12) continue;

    rows.push({
      label,
      value: value.length > 120 ? `${value.slice(0, 117)}…` : value,
      cite,
    });
  }
  return rows;
}

function defaultDecisionNodes(seed, topic) {
  const q = seed.question.replace(/\?+$/, '');
  if (topic === 'adhd') {
    return [
      {
        question: 'Do symptoms impair work, relationships, or daily tasks most weeks?',
        yes: 'Consider structured ADHD evaluation—not online quizzes alone.',
        no: 'Screen sleep, mood, and thyroid; revisit if worsening.',
      },
      {
        question: 'Urgent safety concerns (suicidal thoughts, chest pain, severe confusion)?',
        yes: 'Seek emergency care now—not telehealth intake.',
        branch: true,
      },
    ];
  }
  if (topic === 'weight-loss') {
    return [
      {
        question: 'Persistent fatigue, cravings, or weight change despite “normal” screening labs?',
        yes: 'Discuss metabolic labs, sleep history, and GLP-1 eligibility with a clinician.',
        no: 'Continue lifestyle structure; recheck if symptoms escalate.',
      },
      {
        question: 'Severe abdominal pain, vomiting, or dehydration on GLP-1?',
        yes: 'Contact prescriber promptly; emergency care if unable to hydrate.',
        branch: true,
      },
    ];
  }
  if (topic === 'mens-health') {
    return [
      {
        question: 'Symptoms plus repeatedly low morning testosterone on proper testing?',
        yes: 'Discuss TRT risks/benefits, fertility, and monitoring—not supplement stacks.',
        no: 'Evaluate sleep apnea, depression, and medications before hormone labels.',
      },
      {
        question: 'Chest pain, stroke symptoms, or acute testicular pain?',
        yes: 'Emergency evaluation.',
        branch: true,
      },
    ];
  }
  return [
    {
      question: `Does "${q}" affect your safety or daily function for weeks?`,
      yes: 'Talk to a Clinician for structured next steps when clinically appropriate.',
      no: 'Monitor symptoms; use related Health Guides for background education.',
    },
    {
      question: 'Emergency symptoms (chest pain, stroke signs, severe confusion)?',
      yes: 'Call 911 or go to emergency care.',
      branch: true,
    },
  ];
}

function aboveFoldForSeed(seed) {
  const { slug, topic } = seed;
  if (slug.includes('-vs-') || slug.startsWith('tirzepatide') || slug.startsWith('adderall-vs')) {
    return {
      type: 'comparison',
      placement: 'After short answer (above the fold)',
      component: 'comparisonTable',
      build: () =>
        comparisonTable({
          title: 'At-a-glance comparison',
          headers: ['Topic', 'Takeaway'],
          rows: [
            ['This guide', seed.shortAnswer.slice(0, 120) + (seed.shortAnswer.length > 120 ? '…' : '')],
            ['Next step', 'Use decision support below with your clinician'],
            ['Related', `See ${(seed.related || []).slice(0, 2).map((s) => s.replace(/-/g, ' ')).join(', ') || 'linked guides'}`],
          ],
        }),
    };
  }
  if (
    slug.includes('how-long') ||
    slug.includes('how-much') ||
    slug.includes('what-included') ||
    slug.includes('who-qualifies')
  ) {
    return {
      type: 'infographic',
      placement: 'After short answer (above the fold)',
      component: 'miniInfographic',
      build: () =>
        miniInfographic({
          title: 'Quick reference',
          segments: [
            { value: '1', label: 'Read short answer', note: 'Featured snippet summary' },
            { value: '2', label: 'Use decision tree', note: 'Below main sections' },
            { value: '3', label: 'Talk to a Clinician', note: 'Telehealth next step' },
          ],
        }),
    };
  }
  if (
    topic === 'weight-loss' ||
    slug.includes('glp') ||
    slug.includes('semaglutide') ||
    slug.includes('food-noise') ||
    slug.includes('insulin') ||
    slug.includes('weight-gain')
  ) {
    return {
      type: 'infographic',
      placement: 'After short answer (above the fold)',
      component: 'miniInfographic',
      build: () =>
        miniInfographic({
          title: 'Metabolic lens — three checkpoints',
          segments: [
            { value: 'Labs', label: 'Context over one green line', note: 'A1C, lipids, BP trend' },
            { value: 'Sleep', label: 'Apnea & insomnia amplify cravings', note: 'Partner snoring history' },
            { value: 'Plan', label: 'Clinician-led pharmacotherapy + habits', note: 'Not DIY dose changes' },
          ],
        }),
    };
  }
  if (topic === 'mens-health' || slug.includes('testosterone') || slug.includes('shbg') || slug.includes('minoxidil')) {
    return {
      type: 'flowchart',
      placement: 'After short answer (above the fold)',
      component: 'symptomFlowchart',
      build: () =>
        symptomFlowchart({
          title: 'Hormone & symptom workup (overview)',
          steps: [
            { heading: 'Symptoms', body: 'Libido, energy, mood, strength—nonspecific alone.' },
            { heading: 'Morning labs', body: 'Total T, SHBG context, thyroid when indicated.' },
            { heading: 'Sleep & mood', body: 'Rule out apnea and depression before TRT rush.' },
            { heading: 'Shared decision', body: 'Benefits, fertility, polycythemia monitoring.' },
          ],
        }),
    };
  }
  return {
    type: 'flowchart',
    placement: 'After short answer (above the fold)',
    component: 'symptomFlowchart',
    build: () =>
      symptomFlowchart({
        title: 'How to use this Health Guide',
        steps: [
          { heading: 'Short answer', body: 'Start with the summary—educational, not personal advice.' },
          { heading: 'Sections', body: 'Read vignette & decision support for your situation.' },
          { heading: 'Evidence card', body: 'Guideline anchors before the reference list.' },
          { heading: 'Next step', body: 'Related guides — Talk to a Clinician when ready.' },
        ],
      }),
  };
}

function midBreakForSeed(seed) {
  const { topic, slug } = seed;
  if (topic === 'adhd' || slug.includes('adhd')) {
    return {
      type: 'myth',
      placement: 'Mid-article (after section 2)',
      component: 'mythVsReality',
      build: () =>
        mythVsReality({
          pairs: [
            {
              myth: 'An online quiz alone can diagnose ADHD.',
              reality: 'Validated screeners help, but diagnosis requires clinician history and rule-outs.',
            },
            {
              myth: 'Medication is the only treatment.',
              reality: 'Skills, sleep, and therapy matter; meds are one tool when appropriate.',
            },
          ],
        }),
    };
  }
  if (topic === 'weight-loss') {
    return {
      type: 'myth',
      placement: 'Mid-article (after section 2)',
      component: 'mythVsReality',
      build: () =>
        mythVsReality({
          pairs: [
            {
              myth: 'Normal labs mean metabolic health is fine.',
              reality: 'Insulin resistance and sleep apnea often hide behind “normal” panels.',
            },
            {
              myth: 'GLP-1 replaces lifestyle change.',
              reality: 'Protein, strength training, and sleep still anchor long-term outcomes.',
            },
          ],
        }),
    };
  }
  return {
    type: 'pearl',
    placement: 'Mid-article (after section 2)',
    component: 'clinicalPearl',
    build: () =>
      clinicalPearl({
        body: `Bring a one-week timeline to visits: sleep hours, worst symptoms, and what you already tried. It speeds decisions about "${seed.question.replace(/\?+$/, '')}" faster than a single lab PDF.`,
      }),
  };
}

const SLUG_ENGAGE_OVERRIDES = {
  'poor-sleep-feels-like-adhd': {
    aboveFold: () =>
      symptomFlowchart({
        title: 'Sleep vs ADHD — quick triage',
        steps: [
          { heading: 'Timeline', body: 'Lifelong vs after sleep disruption?' },
          { heading: 'Sleep quality', body: 'Snoring, unrefreshing sleep, insomnia?' },
          { heading: 'Context', body: 'Weekend catch-up helps focus?' },
          { heading: 'Next', body: 'Sleep eval ± ADHD assessment' },
        ],
      }),
    mid: () =>
      mythVsReality({
        pairs: [
          { myth: 'Bad sleep is just ADHD.', reality: 'Sleep apnea and insomnia mimic ADHD and may improve with sleep care.' },
          { myth: 'Stimulants before sleep workup are always safe.', reality: 'Treat high-risk sleep disorders first when suspected.' },
        ],
      }),
  },
  'brain-fog-after-eating': {
    aboveFold: () =>
      symptomFlowchart({
        title: 'Post-meal fog — common pathways',
        steps: [
          { heading: 'Meal size & carbs', body: 'Portion and glycemic load' },
          { heading: 'Glucose swing', body: 'Peak then drop 1–3 hours later' },
          { heading: 'Sleep debt', body: 'Apnea or restriction amplifies slump' },
          { heading: 'Labs', body: 'A1C, lipids, insulin pattern when indicated' },
        ],
      }),
  },
  'why-normal-labs-dont-mean-healthy': {
    aboveFold: () =>
      miniInfographic({
        title: '“Normal labs” vs how you feel',
        segments: [
          { value: '✓', label: 'Reference range', note: 'Population cutoffs' },
          { value: '?', label: 'Symptoms', note: 'Fatigue, cravings, fog' },
          { value: '→', label: 'Trajectory', note: 'Trend over years' },
        ],
      }),
  },
  'food-noise-returned-on-glp-1': {
    aboveFold: () =>
      symptomFlowchart({
        title: 'Food noise returned — checklist',
        steps: [
          { heading: 'Adherence', body: 'Missed doses or gaps?' },
          { heading: 'Dose change', body: 'Down-titration for GI effects?' },
          { heading: 'Sleep & stress', body: 'Cortisol and cravings' },
          { heading: 'Clinician review', body: 'Adjust plan—not shame' },
        ],
      }),
  },
  'weight-gain-after-stopping-ozempic': {
    aboveFold: () =>
      miniInfographic({
        title: 'After stopping GLP-1',
        segments: [
          { value: '↑', label: 'Appetite signaling', note: 'Often rebounds' },
          { value: '↓', label: 'Muscle', note: 'Protect with protein + weights' },
          { value: '?', label: 'Maintenance', note: 'Discuss before last dose' },
        ],
      }),
  },
  'afternoon-energy-crash-after-lunch': {
    aboveFold: () =>
      symptomFlowchart({
        title: 'Afternoon crash timeline',
        steps: [
          { heading: 'Breakfast', body: 'Skipped → oversized lunch?' },
          { heading: 'Lunch macros', body: 'Protein + fiber first' },
          { heading: '1–3 p.m.', body: 'Crash peak window' },
          { heading: 'Walk + sleep', body: 'Ten-minute walk; screen apnea' },
        ],
      }),
  },
  'high-shbg-low-free-testosterone': {
    aboveFold: () =>
      comparisonTable({
        title: 'Total vs free testosterone',
        headers: ['Measure', 'What it reflects'],
        rows: [
          ['Total testosterone', 'Bound + free fractions'],
          ['SHBG', 'Binds tightly—raises when high'],
          ['Free testosterone', 'Bioavailable fraction symptoms may track'],
        ],
      }),
  },
  'adderall-vs-vyvanse-adults': {
    aboveFold: () =>
      comparisonTable({
        title: 'Adderall vs Vyvanse (overview)',
        headers: ['', 'Adderall (mixed salts)', 'Vyvanse (lisdexamfetamine)'],
        rows: [
          ['Form', 'IR & XR', 'Prodrug — activated in body'],
          ['Duration', 'Shorter IR; XR ~hours', 'Often longer daytime coverage'],
          ['Prescribing', 'Clinician choice—history & comorbidities', 'Not interchangeable DIY'],
        ],
      }),
  },
  'tirzepatide-vs-semaglutide': {
    aboveFold: () =>
      comparisonTable({
        title: 'Tirzepatide vs semaglutide (weight)',
        headers: ['', 'Semaglutide 2.4 mg', 'Tirzepatide'],
        rows: [
          ['Class', 'GLP-1 agonist', 'GIP/GLP-1 dual agonist'],
          ['Trials', 'STEP program', 'SURMOUNT program'],
          ['Choice', 'Individual response, tolerance, access', 'Clinician-led only'],
        ],
      }),
  },
};

/**
 * Build HTML blocks for a Health Guide page.
 */
export function buildHealthGuideEngagement(seed) {
  const override = SLUG_ENGAGE_OVERRIDES[seed.slug];
  const above = override?.aboveFold
    ? { type: 'custom', placement: 'After short answer', component: 'override', build: override.aboveFold }
    : aboveFoldForSeed(seed);
  const mid = override?.mid
    ? { type: 'custom', placement: 'Mid-article', component: 'override', build: override.mid }
    : midBreakForSeed(seed);

  const evidenceCard = {
    type: 'evidence',
    placement: 'Before reference list (replaces bullet-only evidence)',
    component: 'evidenceSnapshot',
    build: () => {
      const rows = evidenceRowsFromSeed(seed);
      if (!rows.length) return '';
      return evidenceSnapshot({ title: 'Evidence snapshot', rows });
    },
  };

  const decisionSupport = {
    type: 'decision',
    placement: 'After main sections, before evidence snapshot',
    component: 'decisionTree',
    build: () =>
      decisionTree({
        title: 'Decision support',
        nodes: defaultDecisionNodes(seed, seed.topic),
      }),
  };

  const takeaway = {
    type: 'takeaway',
    placement: 'Optional — injected when sections &lt; 2',
    component: 'keyTakeaway',
    build: () => {
      const sectionItems =
        seed.sections?.find((s) => s.id === 'key-takeaways')?.listItems?.filter(Boolean) || [];
      const items = sectionItems.length
        ? sectionItems.slice(0, 4)
        : deriveTakeawayBullets(seed);
      return keyTakeaway({ items });
    },
  };

  return {
    aboveFold: above.build(),
    midBreak: mid.build(),
    evidenceCard: evidenceCard.build(),
    decisionSupport: decisionSupport.build(),
    takeaway: takeaway.build(),
    audit: getVisualAuditPlan(seed, above, mid, evidenceCard, decisionSupport),
  };
}

/**
 * Audit metadata for HEALTH-GUIDE-VISUAL-AUDIT.md
 */
export function getVisualAuditPlan(seed, above, mid, evidenceCard, decisionSupport) {
  const wc = wordCount(seed);
  const sections = seed.sections?.length || (seed.paragraphs?.length ? 1 : 0);
  const density = wc > 900 ? 'high' : wc > 500 ? 'medium' : 'low';
  const hadDecisionSection = (seed.sections || []).some(
    (s) => /decision support/i.test(s.heading) || s.id === 'decision-support',
  );
  const engagementPotential = seed.topic === 'telehealth' && wc < 400 ? 'low' : density === 'high' ? 'high' : 'medium';
  const visualBreaksBefore = 0;
  const noVisualBefore = true;

  return {
    slug: seed.slug,
    question: seed.question,
    topic: seed.topic,
    wordCount: wc,
    sectionCount: sections,
    density,
    engagementPotential,
    hadDecisionSection,
    visualBreaksBefore,
    noVisualBefore,
    aboveFoldType: above.type,
    aboveFoldPlacement: above.placement,
    aboveFoldComponent: above.component,
    midType: mid.type,
    midPlacement: mid.placement,
    midComponent: mid.component,
    evidenceComponent: evidenceCard.component,
    decisionComponent: decisionSupport.component,
    supportingCopy: seed.shortAnswer.slice(0, 100) + '…',
  };
}
