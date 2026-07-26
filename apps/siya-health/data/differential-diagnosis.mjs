/**
 * Differential Recognition — reusable symptom-hub pattern (Governance v1.0).
 *
 * NOT diagnosis. NOT ranked. NOT percentages. NOT self-assessment.
 * The job of this block is to teach one idea: "this symptom has many possible
 * causes, and sorting them out is a clinical process."
 *
 * Reused across symptom Canonical Entity Pages (fatigue, brain fog, low
 * motivation, poor concentration). Each row links to ONE existing resource.
 *
 * Clinical rules:
 *   - No likelihood language ("most common", "usually", "70% of cases").
 *   - No instruction to test or treat.
 *   - Ordering is neutral (grouped, not ranked).
 *   - Row count ≤8 so the block never breaches the section link cap.
 *
 * Owner: Clinical (Dr. Swati Pandey) · Editorial (Content OS) · Engineering (this module)
 * Block: SIYA:DIFFERENTIAL-RECOGNITION
 */

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @type {Record<string, {
 *   entity: string,
 *   heading: string,
 *   lead: string,
 *   note: string,
 *   rows: Array<{ cause: string, recognition: string, href: string, linkLabel: string }>
 * }>}
 */
export const DIFFERENTIALS = {
  fatigue: {
    entity: 'fatigue',
    heading: 'What it could be',
    lead: 'Fatigue is a symptom, not a diagnosis. These are causes clinicians commonly consider — listed to show the range, not to rank likelihood or point you at an answer.',
    note: 'This is a recognition aid, not a self-assessment. Only a clinician who knows your history can sort these apart, and more than one can be true at the same time.',
    rows: [
      {
        cause: 'Iron deficiency',
        recognition: 'Low iron stores can drain energy well before anemia shows up on a routine count.',
        href: '/labs/iron-ferritin',
        linkLabel: 'Iron &amp; ferritin',
      },
      {
        cause: 'Thyroid conditions',
        recognition: 'An under- or overactive thyroid changes how your body regulates energy, temperature, and weight.',
        href: '/labs/thyroid',
        linkLabel: 'Thyroid testing',
      },
      {
        cause: 'Vitamin B12 deficiency',
        recognition: 'B12 affects nerves and blood cell production, so shortfalls can read as fatigue plus fogginess.',
        href: '/labs/vitamin-b12',
        linkLabel: 'Vitamin B12',
      },
      {
        cause: 'Sleep apnea',
        recognition: 'Breathing interruptions fragment sleep, so you can spend eight hours in bed and wake unrestored.',
        href: '/answers/signs-of-sleep-apnea-in-adults',
        linkLabel: 'Signs of sleep apnea',
      },
      {
        cause: 'Depression or anxiety',
        recognition: 'Mood conditions frequently present physically first — flat energy, poor sleep, and lost motivation.',
        href: '/primary-urgent-care',
        linkLabel: 'Primary care',
      },
      {
        cause: 'ADHD',
        recognition: 'The effort of compensating for attention and executive-function difficulty is genuinely tiring.',
        href: '/adhd-care',
        linkLabel: 'ADHD care',
      },
      {
        cause: 'Perimenopause',
        recognition: 'Shifting hormones disrupt sleep and energy, often alongside brain fog, in the years before menopause.',
        href: '/blog/perimenopause-brain-fog',
        linkLabel: 'Perimenopause &amp; brain fog',
      },
      {
        cause: 'Low testosterone',
        recognition: 'Low energy, reduced drive, and poor recovery can accompany low testosterone in men.',
        href: '/answers/what-does-low-testosterone-feel-like',
        linkLabel: 'Low testosterone',
      },
    ],
  },
};

/**
 * Render the Differential Recognition section for a symptom entity.
 * Emits exactly one link per row and no CTAs (keeps the section link cap safe).
 *
 * @param {keyof typeof DIFFERENTIALS} key
 * @param {{ id?: string }} [opts]
 */
export function renderDifferentialSection(key, opts = {}) {
  const spec = DIFFERENTIALS[key];
  if (!spec) throw new Error(`No differential registered for "${key}"`);
  const id = opts.id ?? 'what-it-could-be';
  const rows = spec.rows
    .slice(0, 8)
    .map(
      (r) => `              <tr>
                <th scope="row">${esc(r.cause)}</th>
                <td>${r.recognition}</td>
                <td><a href="${r.href}">${r.linkLabel} &rarr;</a></td>
              </tr>`,
    )
    .join('\n');

  return `<!-- SIYA:DIFFERENTIAL-RECOGNITION -->
      <section class="section section-tinted differential-recognition" id="${id}" aria-labelledby="${id}-heading" data-assembly="differential-recognition" data-entity="${esc(spec.entity)}">
        <div class="container">
          <div class="section-header">
            <h2 id="${id}-heading">${spec.heading}</h2>
            <p class="lead">${spec.lead}</p>
          </div>
          <table class="differential-table">
            <caption class="visually-hidden">Possible contributors to ${esc(spec.entity)}, with a resource for each</caption>
            <thead>
              <tr><th scope="col">It could be&hellip;</th><th scope="col">Why it can show up this way</th><th scope="col">Learn more</th></tr>
            </thead>
            <tbody>
${rows}
            </tbody>
          </table>
          <p class="cta-microcopy">${spec.note}</p>
        </div>
      </section>
      <!-- /SIYA:DIFFERENTIAL-RECOGNITION -->`;
}
