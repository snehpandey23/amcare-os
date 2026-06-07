/**
 * Reusable clinical diagram registry — root-relative paths for all deploy surfaces.
 */
export const DIAGRAM_BASE = '/assets/diagrams';

export const DIAGRAMS = {
  'symptom-loop': {
    file: 'symptom-loop.svg',
    width: 640,
    height: 400,
    alt: 'Symptom overlap loop showing fatigue, focus, weight, sleep, hormones, and motivation connecting through structured clinical evaluation.',
  },
  'food-noise': {
    file: 'food-noise.svg',
    width: 640,
    height: 360,
    alt: 'Comparison of physical hunger versus food noise: intrusive food thoughts, specific cravings, and persistence after eating.',
  },
  'adhd-executive-function': {
    file: 'adhd-executive-function.svg',
    width: 640,
    height: 420,
    alt: 'Executive function domains in adult ADHD evaluation: working memory, focus, impulse control, time management, planning, and task initiation.',
  },
  'testosterone-evaluation': {
    file: 'testosterone-evaluation.svg',
    width: 640,
    height: 400,
    alt: 'Testosterone evaluation pathway: symptoms and history, laboratory testing, rule out other causes, then monitoring or lifestyle-first planning.',
  },
  'fatigue-root-cause': {
    file: 'fatigue-root-cause.svg',
    width: 640,
    height: 380,
    alt: 'Fatigue root cause map linking chronic fatigue to sleep, metabolic, hormonal, and focus-related factors.',
  },
  'insulin-resistance': {
    file: 'insulin-resistance.svg',
    width: 640,
    height: 340,
    alt: 'Simplified insulin resistance diagram comparing normal glucose uptake with impaired cell response and elevated insulin.',
  },
  'glp1-journey': {
    file: 'glp1-journey.svg',
    width: 720,
    height: 200,
    alt: 'GLP-1 patient journey timeline: first telehealth visit, clinical evaluation, dose titration, monitoring, and follow-up planning.',
  },
  'weight-plateau': {
    file: 'weight-plateau.svg',
    width: 640,
    height: 360,
    alt: 'Weight loss plateau chart showing common stall zone and clinical review triggers including dose, nutrition, sleep, and adherence.',
  },
};

/** Health Guide slug → diagram key + figcaption */
export const ANSWER_DIAGRAM_EMBEDS = {
  'what-is-food-noise': {
    key: 'food-noise',
    figcaption: 'Food noise vs. physical hunger—a clinician can help distinguish patterns. Not a self-diagnosis tool.',
  },
  'signs-of-adult-adhd': {
    key: 'adhd-executive-function',
    figcaption: 'Signs often map to executive function domains—clinical evaluation is required for diagnosis.',
  },
  'why-am-i-tired-even-after-sleeping': {
    key: 'fatigue-root-cause',
    figcaption: 'When rest does not fix fatigue—clinicians look at overlapping causes. Not a substitute for emergency care.',
  },
  'what-is-insulin-resistance': {
    key: 'insulin-resistance',
    figcaption: 'Normal A1c does not rule out insulin resistance—clinical context and labs matter.',
  },
};

export function diagramSrc(key) {
  const d = DIAGRAMS[key];
  if (!d) throw new Error(`Unknown diagram key: ${key}`);
  return `${DIAGRAM_BASE}/${d.file}`;
}

export function renderDiagramFigure(key, { figcaption = '', modifier = 'siya-diagram--inline', extraStyle = '' } = {}) {
  const d = DIAGRAMS[key];
  if (!d) return '';
  const styleAttr = extraStyle ? ` style="${extraStyle}"` : '';
  const cap = figcaption
    ? `\n              <figcaption>${figcaption}</figcaption>`
    : '';
  return `            <figure class="siya-diagram ${modifier}"${styleAttr}>
              <img src="${diagramSrc(key)}" width="${d.width}" height="${d.height}" alt="${d.alt}" loading="lazy" />${cap}
            </figure>`;
}
