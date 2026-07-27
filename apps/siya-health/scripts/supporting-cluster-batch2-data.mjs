/**
 * Supporting cluster Batch 2 — Brain Fog + Fatigue (remaining topics).
 * Menopause already covered by /blog/perimenopause-brain-fog — not duplicated.
 * Pattern: Supporting → Canonical Entity → Related Entity → Primary Care
 * CTA: primary care / Meet & Greet — never ADHD screening as default.
 */
export const SUPPORTING_CLUSTER_BATCH2 = [
  {
    slug: 'brain-fog-at-work',
    title: 'Brain Fog at Work: When Poor Concentration Affects Your Job | Siya Health',
    h1: 'Brain Fog at Work',
    headlineJson: 'Brain Fog at Work',
    metaDescription:
      'Brain fog at work—missed deadlines, slow thinking, word-finding trouble—can have medical causes. Learn how to frame it and when primary care helps.',
    breadcrumbShort: 'Brain Fog at Work',
    cluster: 'brain-fog',
    canonicalEntity: '/brain-fog',
    relatedEntity: '/fatigue',
    relatedLabel: 'Fatigue',
    datePublished: '2026-07-27',
    lead: 'When your brain refuses to cooperate at 2 pm, or you reread the same email four times, that is worth taking seriously—not just managing with more coffee.',
    bodyHtml: `            <p>Work is often when <a href="/brain-fog">brain fog</a> becomes impossible to ignore. The setting demands sustained attention, quick retrieval, and clear expression—exactly what fog disrupts.</p>
            <h2>What fog at work usually looks like</h2>
            <ul>
              <li>Slow processing that was not there before</li>
              <li>Forgetting what you were about to say mid-sentence</li>
              <li>Tasks that used to take an hour now taking three</li>
              <li>Afternoon energy collapse paired with <a href="/fatigue">fatigue</a></li>
              <li>Increased anxiety about performance, which worsens the fog</li>
            </ul>
            <h2>Medical versus situational</h2>
            <p>Situational fog (big project, poor sleep last week, a bout of illness) usually lifts. Medical fog—driven by iron deficiency, thyroid imbalance, mood, medication, or attention patterns—often does not resolve on its own without addressing the underlying cause.</p>
            <h2>What does not fix medical fog</h2>
            <p>Productivity systems, standing desks, and time-blocking are useful tools but they do not treat physiological causes. If your output has genuinely declined and rest does not fix it, evaluation is more efficient than another app.</p>
            <h2>A useful frame</h2>
            <p>Use the <a href="/brain-fog">brain fog</a> guide to structure your symptoms before a visit. If fatigue travels with the fog, note both. If lifelong attention and organization patterns are also present, that is a separate branch worth raising. <a href="/primary-care">Primary care</a> sorts the differential rather than assuming a single cause.</p>
            <p><em>Educational only—not occupational medicine or disability advice.</em></p>`,
    ctaBlurb: 'These articles describe patterns—they cannot assess your history. A licensed clinician can sort cognitive look-alikes and decide what evaluation, if any, fits your situation.',
    faqs: [
      [
        'Should I tell my employer about brain fog?',
        'That is an occupational and legal question outside clinical scope. Clinically: seek evaluation first, then make disclosure decisions with full information about your diagnosis and options.',
      ],
      [
        'Can brain fog be a reasonable accommodation request?',
        'Accommodation frameworks depend on diagnosis, jurisdiction, and employer size. A clinician can document findings; legal guidance belongs with an employment attorney or HR.',
      ],
      [
        'Does remote work make brain fog worse?',
        'It can remove helpful external structure. It can also remove commute stress. The effect depends on your particular situation—not the setting itself.',
      ],
    ],
  },
  {
    slug: 'morning-fatigue',
    title: 'Morning Fatigue: Why You Wake Up Exhausted | Siya Health',
    h1: 'Morning Fatigue',
    headlineJson: 'Morning Fatigue: Why You Wake Up Exhausted',
    metaDescription:
      'Waking exhausted despite enough hours in bed can signal sleep apnea, iron deficiency, thyroid issues, or mood disorders. Learn what to investigate.',
    breadcrumbShort: 'Morning Fatigue',
    cluster: 'fatigue',
    canonicalEntity: '/fatigue',
    relatedEntity: '/labs/iron-ferritin',
    relatedLabel: 'Ferritin / iron labs',
    datePublished: '2026-07-27',
    lead: 'Eight hours of sleep should not feel like nothing happened. Morning exhaustion that does not clear within an hour or two is worth naming as a symptom.',
    bodyHtml: `            <p>Morning <a href="/fatigue">fatigue</a> is different from ordinary grogginess. When you wake already depleted—before the day has started—that is a signal worth investigating rather than powering through with caffeine.</p>
            <h2>Common contributors</h2>
            <ul>
              <li><strong>Sleep apnea.</strong> Interrupted breathing fragments sleep without waking you fully. You can get eight hours and still feel unrestored. Partners often notice snoring or gasping.</li>
              <li><strong>Iron deficiency.</strong> Low ferritin stores can reduce energy and worsen sleep quality. See the <a href="/labs/iron-ferritin">ferritin guide</a> for what the marker measures.</li>
              <li><strong>Thyroid imbalance.</strong> Underactive thyroid is a classic morning-heaviness pattern. See the <a href="/labs/thyroid">thyroid lab guide</a>.</li>
              <li><strong>Depression.</strong> Early-morning waking and heaviness are recognized features, separate from sadness.</li>
              <li><strong>Medications.</strong> Antihistamines, beta-blockers, and some mood medications can cause residual morning sedation.</li>
              <li><strong>Alcohol.</strong> Even moderate intake disrupts sleep architecture in the second half of the night.</li>
            </ul>
            <h2>What to note before your appointment</h2>
            <p>Duration (weeks vs years), whether it is getting worse, what time you wake, what your sleep environment is like, and whether anything reliably helps. That context shapes which evaluation path makes sense.</p>
            <p>Start with the <a href="/fatigue">fatigue</a> entity for the symptom framework, then book through <a href="/primary-care">primary care</a>.</p>
            <p><em>Educational only—not a sleep study prescription.</em></p>`,
    ctaBlurb: 'Morning exhaustion has multiple causes and they often overlap. A clinician can review your sleep history, medications, and relevant labs to find what is driving yours.',
    faqs: [
      [
        'Is morning fatigue different from insomnia?',
        'Yes. Insomnia is difficulty initiating or maintaining sleep. Morning fatigue often means the sleep you got was not restorative—a different mechanism.',
      ],
      [
        'Should I order my own sleep study?',
        'Home sleep tests exist, but interpretation belongs with a clinician who can factor in your full history. Start with primary care.',
      ],
      [
        'Can B12 or vitamin D cause morning fatigue?',
        'Deficiencies in either can contribute to fatigue and low energy. They are checked when clinically indicated, not as a routine first step for everyone.',
      ],
    ],
  },
  {
    slug: 'fatigue-after-illness',
    title: 'Fatigue After Illness: How Long Should Recovery Take? | Siya Health',
    h1: 'Fatigue After Illness',
    headlineJson: 'Fatigue After Illness: How Long Should Recovery Take?',
    metaDescription:
      'Post-illness fatigue can outlast the original infection by weeks. Learn when prolonged tiredness is normal recovery and when to seek primary care evaluation.',
    breadcrumbShort: 'Fatigue After Illness',
    cluster: 'fatigue',
    canonicalEntity: '/fatigue',
    relatedEntity: '/brain-fog',
    relatedLabel: 'Brain fog',
    datePublished: '2026-07-27',
    lead: 'Feeling wiped out after a significant illness is normal. Feeling wiped out three months later is worth a conversation with a clinician.',
    bodyHtml: `            <p>The body allocates significant energy to fighting infection. <a href="/fatigue">Fatigue</a> during and immediately after illness is expected. The question is how long "normal recovery" lasts—and when it becomes something to evaluate.</p>
            <h2>Typical recovery timelines (rough guides, not rules)</h2>
            <ul>
              <li><strong>Common cold / flu:</strong> energy often returns within one to two weeks</li>
              <li><strong>More significant infections (mono, COVID, pneumonia):</strong> fatigue can persist four to twelve weeks</li>
              <li><strong>Hospitalization or severe illness:</strong> months of reduced capacity can be expected</li>
            </ul>
            <h2>When to seek evaluation</h2>
            <ul>
              <li>Fatigue persists well beyond the typical recovery window for your illness</li>
              <li>You experience post-exertional crashes—worse after activity rather than better</li>
              <li><a href="/brain-fog">Brain fog</a>, sleep disruption, or mood changes accompany the tiredness</li>
              <li>You had COVID and cognitive or energy symptoms are ongoing</li>
              <li>You have not fully returned to your pre-illness baseline after two to three months</li>
            </ul>
            <h2>Why labs may or may not help</h2>
            <p>Some post-illness fatigue is tracked by specific markers (ferritin, thyroid, CRP). Much of it is not clearly measurable. Clinicians combine history, exam, and selective labs based on your specific situation—not a fixed panel.</p>
            <p>Start with the <a href="/fatigue">fatigue</a> entity page and book through <a href="/primary-care">primary care</a> when the timeline no longer makes sense.</p>
            <p><em>Educational only. Post-COVID Long COVID management is an evolving field; seek specialist care when needed.</em></p>`,
    ctaBlurb: 'Recovery timelines are individual. If your energy has not returned to baseline and the timeline no longer makes sense, that is worth discussing with a clinician who can review your full history.',
    faqs: [
      [
        'Is there a test for post-viral fatigue?',
        'No single definitive test. Clinicians evaluate by ruling out other causes and assessing your clinical picture over time.',
      ],
      [
        'Should I push through fatigue to rebuild stamina?',
        'For some post-illness patterns, graded activity helps. For others—particularly if there is post-exertional malaise—pushing too hard worsens recovery. Discuss with your clinician rather than self-directing.',
      ],
      [
        'Can post-illness fatigue become chronic?',
        'For some people, yes. Early evaluation and appropriate pacing can reduce that risk. This is not inevitable.',
      ],
    ],
  },
];
