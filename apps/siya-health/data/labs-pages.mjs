/**
 * Follow-up Labs & Blood Tests topic pages (under /labs/*).
 * Physician-guided positioning — not a lab marketplace catalogue.
 */
import { RUPA_LAB_STOREFRONT_URL } from './providers-core.mjs';

export const LABS_STOREFRONT_URL = RUPA_LAB_STOREFRONT_URL;

/** @typedef {{
 *   slug: string,
 *   navLabel: string,
 *   h1: string,
 *   title: string,
 *   description: string,
 *   lead: string,
 *   whenAppropriate: string[],
 *   commonTests: { name: string, note: string }[],
 *   starterSet?: {
 *     heading: string,
 *     lead: string,
 *     items: string[],
 *     note: string,
 *   },
 *   cannotTell: string[],
 *   whyInterpretation: string,
 *   relatedServices: { href: string, label: string }[],
 *   relatedGuides: { href: string, label: string }[],
 *   faqs: { q: string, a: string }[],
 *   medicalFlags?: string[],
 *   heroNote?: string,
 *   careFunnel?: {
 *     heading: string,
 *     lead: string,
 *     steps: { title: string, body: string, href: string|null, linkLabel: string|null }[],
 *   },
 * }} LabsTopicPage */

/** @type {LabsTopicPage[]} */
export const LABS_TOPIC_PAGES = [
  {
    slug: 'fatigue-brain-fog',
    navLabel: 'Fatigue & brain fog labs',
    h1: 'Fatigue & Brain Fog Labs',
    title: 'Fatigue & Brain Fog Labs | Blood Tests | Siya Health',
    description:
      'Learn which laboratory tests clinicians may consider for fatigue and brain fog—and why results need clinical context. Transparent direct-pay options available.',
    lead:
      'Fatigue and brain fog have many overlapping causes. Laboratory testing can help evaluate some contributors—when history suggests it may be useful—but labs alone do not explain every symptom.',
    whenAppropriate: [
      'Persistent tiredness that rest does not fully fix',
      'Brain fog, slowed thinking, or concentration changes with other physical symptoms',
      'Heavy periods, restrictive diets, GI symptoms, or other clues that raise nutritional or endocrine questions',
      'A clinician wants baseline markers before further evaluation or treatment',
    ],
    commonTests: [
      { name: 'Complete blood count (CBC)', note: 'Helps evaluate anemia and other blood-count patterns.' },
      { name: 'Ferritin / iron studies', note: 'Reflects iron stores; low ferritin can relate to fatigue even without frank anemia.' },
      { name: 'TSH (thyroid)', note: 'Screens thyroid function when clinically indicated—not a default for every foggy day.' },
      { name: 'Vitamin B12', note: 'Deficiency can contribute to fatigue and neurologic symptoms in some people.' },
      { name: 'Vitamin D', note: 'Often checked when deficiency risk or related symptoms are present.' },
      { name: 'Comprehensive metabolic panel (CMP)', note: 'Kidney, liver, and electrolyte context.' },
      { name: 'Hemoglobin A1c', note: 'Average blood sugar over ~2–3 months when metabolic risk is relevant.' },
    ],
    starterSet: {
      heading: 'A thoughtful starter set (education, not a product list)',
      lead: 'When history supports a focused first look, clinicians often discuss a small cluster of markers rather than a scattershot panel.',
      items: [
        'Complete blood count (CBC)',
        'Ferritin (with iron studies when indicated)',
        'TSH',
        'Vitamin B12',
        'Comprehensive metabolic panel (CMP)',
        'Hemoglobin A1c when metabolic risk is relevant',
      ],
      note: 'Availability varies; a clinician individualizes which tests—if any—fit your history. This is education, not a catalogue of SKUs.',
    },
    cannotTell: [
      'Labs cannot diagnose burnout, depression, sleep apnea, or ADHD by themselves.',
      'A normal panel does not prove nothing is wrong.',
      'An abnormal value does not automatically confirm a single diagnosis.',
    ],
    whyInterpretation:
      'The same fatigue story can point toward iron deficiency, thyroid shifts, sleep issues, medications, mood, metabolic strain, or more than one factor. A clinician helps prioritize tests and interpret numbers against your history.',
    relatedServices: [
      { href: '/telehealth', label: 'Telehealth care' },
      { href: '/primary-urgent-care', label: 'Primary care' },
      { href: '/womens-midlife-health', label: "Women's midlife health" },
      { href: '/adhd-care', label: 'Adult ADHD care' },
    ],
    relatedGuides: [
      { href: '/labs/how-to-read-results', label: 'How to read your lab results' },
      { href: '/fatigue', label: 'Fatigue: when tired stops being normal' },
      { href: '/brain-fog', label: 'Brain fog: when thinking feels slower' },
      { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Tired even after sleeping' },
      { href: '/answers/why-normal-labs-dont-mean-healthy', label: "Why normal labs don't mean healthy" },
    ],
    faqs: [
      {
        q: 'Can labs diagnose the cause of fatigue?',
        a: 'Not by themselves. Labs can help evaluate contributors such as anemia, iron stores, thyroid function, vitamin levels, and metabolic markers. Fatigue often has overlapping causes, so results need clinical context.',
      },
      {
        q: 'Should everyone with brain fog get a large lab panel?',
        a: 'Not necessarily. Ordering many unrelated tests is not always useful. A focused set based on history is usually more helpful than a scattershot panel.',
      },
      {
        q: 'What if my labs are normal but I still feel exhausted?',
        a: 'Normal results do not rule out every condition. Sleep apnea, depression, medication effects, ADHD, perimenopause, and lifestyle factors can still matter. Discuss next steps with a clinician.',
      },
    ],
    medicalFlags: ['Fatigue differential; normal labs do not exclude disease'],
  },
  {
    slug: 'womens-midlife',
    navLabel: "Women's midlife labs",
    h1: "Women's Midlife Lab Evaluation",
    title: "Women's Midlife Labs | Perimenopause Context | Siya Health",
    description:
      'Learn how laboratory testing may support women’s midlife concerns—fatigue, brain fog, iron, thyroid, and metabolic markers—without claiming a hormone panel diagnoses perimenopause.',
    lead:
      'Midlife symptoms often overlap: sleep changes, fatigue, brain fog, mood shifts, and cycle changes. Labs can help evaluate some contributors. A single hormone panel generally does not diagnose perimenopause.',
    whenAppropriate: [
      'Fatigue or brain fog with possible iron, thyroid, or metabolic contributors',
      'Heavy bleeding raising iron-deficiency concerns',
      'Metabolic or cardiovascular risk assessment in midlife',
      'Clinician-guided evaluation when history suggests selected testing',
    ],
    commonTests: [
      { name: 'CBC & ferritin', note: 'Anemia and iron stores—especially with heavy periods.' },
      { name: 'TSH', note: 'Thyroid screening when clinically indicated.' },
      { name: 'A1c & lipids', note: 'Metabolic and cardiovascular risk context.' },
      { name: 'Vitamin D / B12', note: 'When deficiency risk or related symptoms are present.' },
      { name: 'Hormone tests', note: 'Only when a clinician judges them useful—not as a standalone perimenopause “proof.”' },
    ],
    starterSet: {
      heading: 'A thoughtful starter set (education, not a product list)',
      lead: 'Midlife evaluation often prioritizes overlapping, treatable contributors—iron, thyroid, and metabolic markers—before large hormone panels.',
      items: [
        'CBC and ferritin',
        'TSH',
        'Hemoglobin A1c and lipid panel',
        'Vitamin B12 or vitamin D when deficiency risk is present',
      ],
      note: 'Availability varies; a clinician individualizes which tests—if any—fit your history. This is education, not a catalogue of SKUs.',
    },
    cannotTell: [
      'Hormone panels alone usually should not confirm or rule out perimenopause.',
      'Labs do not replace a clinical conversation about cycle changes and symptoms.',
      'Normal labs do not mean symptoms are “all in your head.”',
    ],
    whyInterpretation:
      'Perimenopause is typically a clinical diagnosis based on age, menstrual pattern changes, and symptoms. Labs help look for overlapping, treatable contributors—and guide follow-up when results are abnormal.',
    relatedServices: [
      { href: '/womens-midlife-health', label: "Women's midlife health" },
      { href: '/womens-health', label: "Women's health" },
      { href: '/blog/adhd-hormones-women', label: 'ADHD & hormones in women' },
    ],
    relatedGuides: [
      { href: '/labs/how-to-read-results', label: 'How to read your lab results' },
      { href: '/blog/perimenopause-brain-fog', label: 'Perimenopause & brain fog' },
      { href: '/labs/iron-ferritin', label: 'Iron & ferritin testing' },
      { href: '/labs/thyroid', label: 'Thyroid testing' },
      { href: '/labs/fatigue-brain-fog', label: 'Fatigue & brain fog labs' },
    ],
    faqs: [
      {
        q: 'Can laboratory testing diagnose perimenopause?',
        a: 'Generally no. Perimenopause is typically clinical. Hormone panels alone usually should not be presented as confirming or ruling it out.',
      },
      {
        q: 'Why check iron or thyroid in midlife?',
        a: 'Because heavy bleeding, thyroid shifts, and metabolic changes can overlap with midlife symptoms. Selected testing may clarify contributors—when history supports it.',
      },
      {
        q: 'Should I order a large hormone panel online first?',
        a: 'Not always. More numbers are not automatically more clarity. A clinician can help prioritize tests that may change management.',
      },
    ],
    medicalFlags: ['Perimenopause is clinical; hormone panel limits'],
    heroNote: 'Hormone panels alone usually do not diagnose perimenopause.',
  },
  {
    slug: 'mens-health',
    navLabel: "Men's health labs",
    h1: "Men's Health Lab Evaluation",
    title: "Men's Health Labs | Testosterone Context | Siya Health",
    description:
      'Learn when testosterone and related laboratory testing may be appropriate for energy, drive, or metabolic concerns—and why results need clinical context. Direct-pay options available.',
    lead:
      'Men’s health evaluation starts with history—not a single hormone number. When clinically appropriate, testosterone and related labs can support decision-making alongside metabolic and cardiovascular markers.',
    whenAppropriate: [
      'Persistent low energy, reduced drive, or related symptoms after clinical discussion',
      'Metabolic risk, weight change, or cardiovascular risk assessment',
      'Monitoring when a clinician has already recommended treatment follow-up',
      'Sleep apnea or other overlapping conditions under evaluation',
    ],
    commonTests: [
      { name: 'Total / free testosterone', note: 'When clinically appropriate; timing and context matter.' },
      { name: 'CBC & CMP', note: 'Baseline blood count and metabolic context.' },
      { name: 'Lipids & A1c', note: 'Cardiometabolic risk markers.' },
      { name: 'PSA', note: 'Only when age, history, and clinical judgment support it—not automatic for every man.' },
      { name: 'Other endocrine tests', note: 'Added when history suggests they may change management.' },
    ],
    starterSet: {
      heading: 'A thoughtful starter set (education, not a product list)',
      lead: 'When energy, drive, or metabolic concerns raise lab questions, clinicians often pair selected hormone testing with cardiometabolic baselines—not an “optimization” catalogue.',
      items: [
        'Total testosterone (with free testosterone when indicated)',
        'CBC and comprehensive metabolic panel (CMP)',
        'Lipid panel and hemoglobin A1c',
        'PSA only when age and clinical judgment support it',
      ],
      note: 'Availability varies; a clinician individualizes which tests—if any—fit your history. This is education, not a catalogue of SKUs.',
    },
    cannotTell: [
      'A single testosterone value does not automatically explain symptoms or confirm a treatment plan.',
      'Labs do not diagnose depression, sleep apnea, or relationship stress.',
      'Online “optimization” panels are not a substitute for clinical judgment.',
    ],
    whyInterpretation:
      'Testosterone results require clinical context, appropriate timing, repeat confirmation when indicated, and attention to other contributors to fatigue and low drive. Siya Health emphasizes evaluation first—not testosterone-first marketing.',
    relatedServices: [
      { href: '/mens-health-longevity', label: "Men's health & longevity" },
      { href: '/weight-loss-metabolic-health', label: 'Weight & metabolic health' },
      { href: '/primary-urgent-care', label: 'Primary care' },
    ],
    relatedGuides: [
      { href: '/labs/how-to-read-results', label: 'How to read your lab results' },
      { href: '/answers/what-does-low-testosterone-feel-like', label: 'What does low testosterone feel like?' },
      { href: '/answers/when-is-testosterone-therapy-appropriate', label: 'When is testosterone therapy appropriate?' },
      { href: '/answers/trt-monitoring-requirements', label: 'TRT monitoring requirements' },
      { href: '/labs/a1c-blood-sugar', label: 'A1c & blood sugar testing' },
    ],
    faqs: [
      {
        q: 'Should testosterone be checked for fatigue?',
        a: 'Sometimes—when symptoms and history suggest it may be relevant. A single number does not automatically explain fatigue or confirm therapy.',
      },
      {
        q: 'Do I need PSA with testosterone testing?',
        a: 'Not automatically. PSA decisions depend on age, history, and clinical judgment. Ask your clinician what is appropriate for you.',
      },
      {
        q: 'Can I start TRT based on a storefront lab alone?',
        a: 'Treatment decisions should not be based on an isolated lab value without clinical evaluation. Siya Health reviews history, symptoms, and labs together.',
      },
    ],
    medicalFlags: ['Testosterone context; PSA not automatic; no TRT-from-lab-alone'],
    heroNote: 'Evaluation first—not testosterone-first marketing.',
  },
  {
    slug: 'preventive',
    navLabel: 'Preventive & wellness labs',
    h1: 'Preventive Primary Care Labs',
    title: 'Preventive Blood Tests & Wellness Labs | Siya Health',
    description:
      'Explore commonly ordered preventive laboratory tests—CBC, metabolic panel, lipids, A1c—and how physician-guided testing supports primary care. Transparent direct-pay options available.',
    lead:
      'Preventive labs help establish baselines and monitor cardiometabolic risk over time. The goal is thoughtful screening—not ordering every available test.',
    whenAppropriate: [
      'Routine health maintenance and risk assessment',
      'Follow-up of previously abnormal values',
      'Baseline labs before starting certain treatments when indicated',
      'Adult primary care monitoring across California, Texas, Pennsylvania, and Florida telehealth visits',
    ],
    commonTests: [
      { name: 'Complete blood count (CBC)', note: 'Blood-count baseline.', href: '/labs/cbc' },
      { name: 'Comprehensive metabolic panel (CMP)', note: 'Kidney, liver, electrolytes, glucose context.', href: '/labs/cmp' },
      { name: 'Lipid panel', note: 'Cholesterol and related cardiovascular risk markers.', href: '/labs/lipid-panel' },
      { name: 'Hemoglobin A1c', note: 'Average blood sugar when screening or monitoring is appropriate.', href: '/labs/a1c-blood-sugar' },
      { name: 'TSH', note: 'Thyroid screening when clinically indicated.', href: '/labs/thyroid' },
      { name: 'Ferritin / iron studies', note: 'Iron stores when history supports it.', href: '/labs/iron-ferritin' },
      { name: 'Vitamin B12', note: 'When dietary or neurologic risk fits.', href: '/labs/vitamin-b12' },
      { name: 'Vitamin D', note: 'When deficiency risk or clinical questions justify it.', href: '/labs/vitamin-d' },
    ],
    starterSet: {
      heading: 'A thoughtful starter set (education, not a product list)',
      lead: 'Thoughtful preventive screening usually means a small baseline set—not ordering every available wellness marker.',
      items: [
        'Complete blood count (CBC)',
        'Comprehensive metabolic panel (CMP)',
        'Lipid panel',
        'Hemoglobin A1c when age and risk support it',
      ],
      note: 'Availability varies; a clinician individualizes which tests—if any—fit your history. This is education, not a catalogue of SKUs.',
    },
    cannotTell: [
      'Preventive labs do not replace history, blood pressure checks, or age-appropriate cancer screening guidance.',
      'A normal panel is not a guarantee of lifelong health.',
      'More tests are not automatically better preventive care.',
    ],
    whyInterpretation:
      'Preventive testing works best inside a primary care relationship: decide what is indicated, review results, and plan follow-up. Siya Health pairs transparent direct-pay access with clinician guidance when you need it.',
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care hub' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
      { href: '/telehealth', label: 'Telehealth' },
      { href: '/pricing', label: 'Follow-up plans & pricing' },
    ],
    relatedGuides: [
      { href: '/preventive-care', label: 'Preventive care hub' },
      { href: '/labs/cbc', label: 'CBC' },
      { href: '/labs/cmp', label: 'CMP' },
      { href: '/labs/lipid-panel', label: 'Lipid panel' },
      { href: '/labs/a1c-blood-sugar', label: 'HbA1c' },
      { href: '/labs/how-to-read-results', label: 'How to read your lab results' },
    ],
    faqs: [
      {
        q: 'Which labs are “routine”?',
        a: 'Common preventive sets often include CBC, metabolic panel, lipids, and A1c when age and risk support them. Your clinician individualizes based on history.',
      },
      {
        q: 'Do I need insurance?',
        a: 'The laboratory storefront is designed for transparent direct-pay access. Insurance coverage is not guaranteed. Review current pricing on the storefront.',
      },
      {
        q: 'How often should I repeat labs?',
        a: 'Intervals depend on prior results, risk factors, and clinical judgment—not a one-size-fits-all calendar.',
      },
      {
        q: 'What happens after I get my results?',
        a: 'Bring them back to Siya. We help interpret findings in context and, when ongoing care fits, connect you to a follow-up plan—not a one-off PDF dump.',
      },
    ],
    careFunnel: {
      heading: 'Annual wellness → preventive labs → ongoing care',
      lead: 'A clean primary-care loop: decide what is worth checking, review results with a clinician, then stay connected when follow-up matters.',
      steps: [
        {
          title: 'Annual wellness conversation',
          body: 'Start with history, goals, and risk—not a shopping list of every available test.',
          href: '/primary-urgent-care',
          linkLabel: 'Primary care pathway',
        },
        {
          title: 'Preventive labs when appropriate',
          body: 'Browse transparent direct-pay options for commonly ordered baselines (CBC, CMP, lipids, A1c, and more when indicated).',
          href: null,
          linkLabel: null,
        },
        {
          title: 'Interpretation & follow-up plans',
          body: 'Results need context. Siya helps interpret findings and can continue care on a clear follow-up plan when clinically appropriate.',
          href: '/pricing',
          linkLabel: 'View follow-up pricing',
        },
      ],
    },
  },
  {
    slug: 'adhd-support',
    navLabel: 'Labs & ADHD evaluation support',
    h1: 'Labs When Focus, Fatigue & Brain Fog Overlap',
    title: 'Labs & ADHD Evaluation Support | Not a Blood Test Diagnosis | Siya Health',
    description:
      'Blood tests do not diagnose ADHD. Learn when selected labs may help evaluate other contributors to fatigue, concentration problems, or brain fog—and how Siya Health approaches testing.',
    lead:
      'Blood tests do not diagnose ADHD. Adult ADHD evaluation is clinical. Selected laboratory testing may sometimes help assess other medical contributors to similar symptoms—when a clinician judges testing appropriate.',
    whenAppropriate: [
      'Fatigue, brain fog, or concentration issues with clues suggesting iron, thyroid, B12, or metabolic contributors',
      'A clinician wants to evaluate overlapping medical factors alongside ADHD assessment',
      'Monitoring needs related to treatment that your clinician has already discussed',
    ],
    commonTests: [
      { name: 'CBC & ferritin', note: 'Anemia and iron stores when history suggests.' },
      { name: 'TSH', note: 'Thyroid screening when clinically indicated.' },
      { name: 'Vitamin B12', note: 'When deficiency risk is present.' },
      { name: 'Metabolic markers (e.g., A1c)', note: 'When metabolic contributors are relevant.' },
    ],
    cannotTell: [
      'No blood test diagnoses ADHD.',
      'Normal labs do not rule out ADHD.',
      'Abnormal labs do not prove symptoms are “not ADHD.”',
    ],
    whyInterpretation:
      'ADHD and medical contributors can coexist. Labs are a supporting tool for differential thinking—not a shortcut around structured clinical evaluation.',
    relatedServices: [
      { href: '/adhd-care', label: 'Adult ADHD care' },
      { href: '/adhd-screening', label: 'Free ADHD screening' },
      { href: '/labs/fatigue-brain-fog', label: 'Fatigue & brain fog labs' },
      { href: '/labs/iron-ferritin', label: 'Iron & ferritin testing' },
    ],
    relatedGuides: [
      { href: '/blog/iron-deficiency-brain-fog-adhd', label: 'Iron deficiency, brain fog & ADHD' },
      { href: '/blog/adhd-hormones-women', label: 'ADHD & hormones in women' },
      { href: '/answers/signs-of-adult-adhd', label: 'Signs of adult ADHD' },
    ],
    faqs: [
      {
        q: 'Can a blood test diagnose ADHD?',
        a: 'No. Blood tests do not diagnose ADHD. Evaluation is clinical, using history and validated tools when appropriate.',
      },
      {
        q: 'Why would a clinician order labs at all?',
        a: 'To evaluate other contributors to fatigue, concentration problems, sleep disruption, or cognitive symptoms—such as thyroid abnormalities, anemia, iron or B12 deficiency, or metabolic issues—when indicated.',
      },
      {
        q: 'Should I get labs instead of an ADHD evaluation?',
        a: 'Labs are not a substitute for ADHD evaluation when ADHD is the primary question. They may be complementary when medical overlap is suspected.',
      },
    ],
    medicalFlags: ['Blood tests do not diagnose ADHD'],
    heroNote: 'Blood tests do not diagnose ADHD.',
  },
];

export { LAB_MARKER_PAGES, labMarkerPath, labMarkerFile } from './lab-markers.mjs';

export function labsTopicPath(slug) {
  return `/labs/${slug}`;
}

export function labsTopicFile(slug) {
  return `labs/${slug}.html`;
}
