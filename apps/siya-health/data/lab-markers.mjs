/**
 * Individual lab marker pages under Preventive Care.
 * Education only — no result interpretation, universal ranges, or order instructions.
 */

/** @typedef {{
 *   slug: string,
 *   navLabel: string,
 *   h1: string,
 *   title: string,
 *   description: string,
 *   lead: string,
 *   measures: string[],
 *   whyConsider: string[],
 *   questionsHelps: string[],
 *   cannotAlone: string[],
 *   whenFollowUp: string[],
 *   relatedSymptoms: { href: string, label: string }[],
 *   relatedServices: { href: string, label: string }[],
 *   relatedLabs: { href: string, label: string }[],
 *   faqs: { q: string, a: string }[],
 * }} LabMarkerPage */

/** @type {LabMarkerPage[]} */
export const LAB_MARKER_PAGES = [
  {
    slug: 'cbc',
    navLabel: 'CBC',
    h1: 'Complete Blood Count (CBC)',
    title: 'CBC Blood Test Explained | Preventive Labs | Siya Health',
    description:
      'What a CBC broadly measures, why clinicians may order it, and what it cannot diagnose alone. Educational lab guidance under preventive primary care.',
    lead:
      'A complete blood count looks at cells that circulate in your blood. It is a common baseline test in preventive care—and a starting clue, not a finished diagnosis.',
    measures: [
      'Red blood cell patterns that can relate to anemia or oxygen-carrying capacity',
      'White blood cell patterns that can relate to infection, inflammation, or marrow stress',
      'Platelet patterns that matter for clotting context',
      'Related indices (such as hemoglobin and hematocrit) that help describe those patterns',
    ],
    whyConsider: [
      'Routine preventive or annual wellness baselines when clinically appropriate',
      'Persistent fatigue, weakness, or unexplained pallor',
      'Follow-up after a previously abnormal count',
      'Before certain treatments when a clinician wants blood-count context',
    ],
    questionsHelps: [
      'Could anemia or another blood-count pattern be contributing to fatigue?',
      'Is there a blood-count change worth watching over time?',
      'Do symptoms plus history justify looking at related iron, B12, or other markers next?',
    ],
    cannotAlone: [
      'A CBC does not diagnose the cause of fatigue by itself.',
      'It cannot confirm or exclude ADHD, depression, sleep apnea, or most hormone conditions.',
      'One abnormal line is not a treatment plan—context and follow-up matter.',
    ],
    whenFollowUp: [
      'Results are unexpected for your history, or trend in the wrong direction',
      'Symptoms continue despite a “normal” CBC',
      'Your clinician wants related tests (iron studies, B12, or others) based on the pattern',
    ],
    relatedSymptoms: [
      { href: '/fatigue', label: 'Fatigue' },
      { href: '/labs/fatigue-brain-fog', label: 'Fatigue & brain fog labs overview' },
    ],
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
      { href: '/book-appointment', label: 'Book a primary care visit' },
    ],
    relatedLabs: [
      { href: '/labs/iron-ferritin', label: 'Iron & ferritin' },
      { href: '/labs/vitamin-b12', label: 'Vitamin B12' },
      { href: '/labs/cmp', label: 'CMP' },
      { href: '/labs/preventive', label: 'Preventive labs overview' },
    ],
    faqs: [
      {
        q: 'Is a CBC part of preventive care?',
        a: 'Often yes when a clinician wants a blood-count baseline. It is not mandatory for every visit—indication depends on age, history, and what would change a plan.',
      },
      {
        q: 'Can a CBC tell me why I am tired?',
        a: 'It can help evaluate some contributors, such as anemia patterns. Many causes of fatigue leave the CBC unchanged, so normal results do not close the case.',
      },
      {
        q: 'Should I interpret my CBC from a portal alone?',
        a: 'No. Reference ranges and single values need clinical context. Bring results to a clinician if you have questions or symptoms.',
      },
    ],
  },
  {
    slug: 'cmp',
    navLabel: 'CMP',
    h1: 'Comprehensive Metabolic Panel (CMP)',
    title: 'CMP Blood Test Explained | Preventive Labs | Siya Health',
    description:
      'What a CMP broadly measures—kidney, liver, electrolytes, and glucose context—and why clinicians use it in preventive care. Not a standalone diagnosis.',
    lead:
      'A comprehensive metabolic panel groups common chemistry markers that help clinicians look at kidney and liver context, electrolytes, and glucose—useful baselines inside a preventive relationship.',
    measures: [
      'Kidney-related chemistry (such as creatinine and related markers)',
      'Liver enzyme and protein context commonly included in the panel',
      'Electrolytes that help describe fluid and acid-base balance context',
      'Glucose as one snapshot of blood sugar at the time of the draw',
    ],
    whyConsider: [
      'Preventive or annual wellness baselines when indicated',
      'Monitoring medications or conditions that affect kidney or liver context',
      'Follow-up of previously abnormal chemistry',
      'Part of a broader cardiometabolic or fatigue workup when history supports it',
    ],
    questionsHelps: [
      'Is kidney or liver chemistry a concern worth watching?',
      'Do electrolytes or glucose snapshots raise questions that need trend or A1c context?',
      'Should preventive follow-up include lipids, A1c, or other markers next?',
    ],
    cannotAlone: [
      'A CMP does not diagnose fatty liver, chronic kidney disease stage, or diabetes by itself.',
      'A single glucose value is not the same as long-term glucose control (A1c).',
      'Normal chemistry does not prove “nothing is wrong.”',
    ],
    whenFollowUp: [
      'Values are outside expected context for you, or changing over time',
      'You have symptoms that still need explanation after the panel',
      'Your clinician recommends related tests such as A1c, lipids, or imaging based on history',
    ],
    relatedSymptoms: [
      { href: '/fatigue', label: 'Fatigue' },
      { href: '/answers/brain-fog-after-eating', label: 'Brain fog after eating' },
    ],
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
      { href: '/weight-loss-metabolic-health', label: 'Weight loss & metabolic health' },
    ],
    relatedLabs: [
      { href: '/labs/a1c-blood-sugar', label: 'HbA1c & blood sugar' },
      { href: '/labs/lipid-panel', label: 'Lipid panel' },
      { href: '/labs/cbc', label: 'CBC' },
      { href: '/labs/preventive', label: 'Preventive labs overview' },
    ],
    faqs: [
      {
        q: 'What does a CMP add to preventive care?',
        a: 'It gives chemistry context—kidney, liver, electrolytes, and a glucose snapshot—that can inform risk discussion and monitoring. Clinicians decide whether it belongs in your plan.',
      },
      {
        q: 'Is CMP the same as diabetes testing?',
        a: 'No. CMP includes a glucose value at one moment. Longer-term glucose questions often use A1c or other strategies when indicated.',
      },
      {
        q: 'Can I use CMP results to change medications myself?',
        a: 'No. Medication changes belong with a clinician who knows your full history and other labs.',
      },
    ],
  },
  {
    slug: 'lipid-panel',
    navLabel: 'Lipid panel',
    h1: 'Lipid Panel',
    title: 'Lipid Panel Explained | Cholesterol Labs | Siya Health',
    description:
      'What a lipid panel broadly measures for cardiometabolic risk, why clinicians order it, and what it cannot decide alone. Preventive care education—not result interpretation.',
    lead:
      'A lipid panel looks at cholesterol and related markers used in cardiovascular risk conversations. It informs prevention planning; it does not replace blood pressure checks, history, or shared decisions about next steps.',
    measures: [
      'Total cholesterol and major lipid fractions commonly used in risk discussion',
      'HDL and LDL context as typically reported on the panel',
      'Triglycerides as part of the same cardiometabolic picture',
      'Sometimes calculated ratios—still interpreted with overall risk, not in isolation',
    ],
    whyConsider: [
      'Adult preventive screening when age and guidelines-aligned risk support it',
      'Family history of early heart disease or known lipid disorders',
      'Metabolic risk, diabetes risk, or weight-related care planning',
      'Monitoring after lifestyle or treatment changes when a clinician is following lipids',
    ],
    questionsHelps: [
      'Where do my lipids sit in a broader cardiovascular risk picture?',
      'Is a repeat or related metabolic testing (such as A1c) reasonable next?',
      'Does this support a preventive follow-up conversation—not a one-off PDF read?',
    ],
    cannotAlone: [
      'Lipids alone do not diagnose heart disease or dictate a single “must treat” path for everyone.',
      'They do not replace blood pressure, smoking history, diabetes risk, or family history.',
      'Online “optimal” claims are not personalized medical advice.',
    ],
    whenFollowUp: [
      'Results raise risk questions for your age and history',
      'You want a plan that connects lipids with blood pressure, lifestyle, and metabolic markers',
      'Prior lipids were abnormal and need trend review',
    ],
    relatedSymptoms: [
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
      { href: '/fatigue', label: 'Fatigue' },
    ],
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
      { href: '/weight-loss-metabolic-health', label: 'Weight loss & metabolic health' },
    ],
    relatedLabs: [
      { href: '/labs/a1c-blood-sugar', label: 'HbA1c & blood sugar' },
      { href: '/labs/cmp', label: 'CMP' },
      { href: '/labs/preventive', label: 'Preventive labs overview' },
    ],
    faqs: [
      {
        q: 'How often should lipids be checked?',
        a: 'Intervals depend on prior results, age, and risk—not a universal calendar. Your clinician individualizes timing.',
      },
      {
        q: 'Do I need to fast?',
        a: 'Some lipid assessments are done fasting; others may not require it depending on the question and lab method. Follow the instructions your clinician or lab provides for your order.',
      },
      {
        q: 'Can a lipid panel tell me if I will have a heart attack?',
        a: 'No. It contributes to risk estimation. Absolute risk still depends on many factors reviewed with a clinician.',
      },
    ],
  },
  {
    slug: 'a1c-blood-sugar',
    navLabel: 'HbA1c',
    h1: 'Hemoglobin A1c (HbA1c)',
    title: 'HbA1c Blood Test Explained | Blood Sugar Labs | Siya Health',
    description:
      'What HbA1c broadly measures about average blood sugar, why clinicians may order it, and what it cannot diagnose alone. Preventive and metabolic education.',
    lead:
      'Hemoglobin A1c reflects average blood sugar over roughly the prior two to three months. It is a preventive and metabolic tool—not a complete metabolic diagnosis by itself.',
    measures: [
      'An estimate of average glucose exposure over ~2–3 months',
      'A marker used in screening and monitoring conversations about diabetes risk',
      'Context that complements—not replaces—fasting glucose, symptoms, and history',
    ],
    whyConsider: [
      'Preventive screening when age or risk factors support glucose assessment',
      'Known prediabetes, diabetes, or metabolic syndrome follow-up',
      'Fatigue, polyuria, unexplained weight change, or other clues that raise glucose questions',
      'Cardiometabolic risk planning alongside lipids and blood pressure',
    ],
    questionsHelps: [
      'Is longer-term glucose control a concern worth discussing?',
      'Should preventive care include lifestyle and follow-up for metabolic risk?',
      'Do symptoms plus A1c justify related labs or a closer primary care plan?',
    ],
    cannotAlone: [
      'A1c does not explain every case of fatigue or brain fog.',
      'Conditions that affect red blood cells can influence A1c accuracy—clinicians watch for that.',
      'One value does not replace a full diabetes evaluation when indicated.',
    ],
    whenFollowUp: [
      'A1c is elevated for your context, or trending upward',
      'Symptoms suggest glucose issues despite a borderline result',
      'You need a plan that ties A1c to weight, lipids, blood pressure, and lifestyle',
    ],
    relatedSymptoms: [
      { href: '/fatigue', label: 'Fatigue' },
      { href: '/answers/brain-fog-after-eating', label: 'Brain fog after eating' },
      { href: '/answers/afternoon-energy-crash-after-lunch', label: 'Afternoon energy crash' },
    ],
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care' },
      { href: '/weight-loss-metabolic-health', label: 'Weight loss & metabolic health' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
    ],
    relatedLabs: [
      { href: '/labs/lipid-panel', label: 'Lipid panel' },
      { href: '/labs/cmp', label: 'CMP' },
      { href: '/labs/preventive', label: 'Preventive labs overview' },
    ],
    faqs: [
      {
        q: 'Is A1c better than a single glucose?',
        a: 'They answer different questions. A1c averages over months; a glucose value is a moment in time. Clinicians choose based on the clinical question.',
      },
      {
        q: 'Can I diagnose myself from an A1c chart online?',
        a: 'No. Thresholds and next steps belong in a clinical conversation that includes your history and other findings.',
      },
      {
        q: 'Does a normal A1c mean my metabolism is fine?',
        a: 'Not always. Insulin resistance and other risks can exist before A1c rises. Symptoms and overall risk still matter.',
      },
    ],
  },
  {
    slug: 'thyroid',
    navLabel: 'TSH',
    h1: 'TSH (Thyroid Stimulating Hormone)',
    title: 'TSH Thyroid Test Explained | Preventive Labs | Siya Health',
    description:
      'What TSH broadly measures, why clinicians may check thyroid function, and what TSH cannot diagnose alone. Educational guidance—not result interpretation.',
    lead:
      'TSH is a common first thyroid marker. It helps clinicians decide whether thyroid function deserves a closer look—it does not by itself explain every fatigue or brain-fog story.',
    measures: [
      'A pituitary signal that helps reflect thyroid hormone feedback in many people',
      'A screening and monitoring marker when thyroid questions are clinically relevant',
      'A starting point that may lead to free T4 or other tests when indicated—not automatically',
    ],
    whyConsider: [
      'Unexplained fatigue, cold intolerance, hair changes, or other classic thyroid clues',
      'Known thyroid disease follow-up',
      'Preventive or differential evaluation when history raises endocrine questions',
      'Before attributing overlapping symptoms solely to stress, ADHD, or sleep',
    ],
    questionsHelps: [
      'Is thyroid function a reasonable piece of this fatigue or fog picture?',
      'Do we need additional thyroid markers after TSH?',
      'Should primary care follow thyroid trends over time?',
    ],
    cannotAlone: [
      'TSH does not diagnose ADHD, depression, or menopause.',
      'A single TSH does not capture every thyroid condition or timing issue.',
      'Normal TSH does not prove symptoms are “all in your head.”',
    ],
    whenFollowUp: [
      'TSH is outside expected context, or symptoms remain strong with borderline results',
      'You are on thyroid medication and need monitoring',
      'Related labs (CBC, ferritin, B12) are part of the same differential',
    ],
    relatedSymptoms: [
      { href: '/fatigue', label: 'Fatigue' },
      { href: '/labs/fatigue-brain-fog', label: 'Fatigue & brain fog labs' },
      { href: '/womens-midlife-health', label: "Women's midlife health" },
    ],
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
    ],
    relatedLabs: [
      { href: '/labs/cbc', label: 'CBC' },
      { href: '/labs/iron-ferritin', label: 'Iron & ferritin' },
      { href: '/labs/vitamin-b12', label: 'Vitamin B12' },
      { href: '/labs/preventive', label: 'Preventive labs overview' },
    ],
    faqs: [
      {
        q: 'Should everyone with fatigue get a TSH?',
        a: 'Not automatically. Clinicians weigh symptoms, exam, and risk. Scattershot panels are not always better than a focused plan.',
      },
      {
        q: 'Does normal TSH close the thyroid question forever?',
        a: 'Not always. Timing, medications, and clinical suspicion can still matter. Follow-up is individualized.',
      },
      {
        q: 'Can TSH diagnose hyperthyroidism or hypothyroidism alone?',
        a: 'TSH is a key clue, but clinicians interpret it with history and, when needed, additional thyroid tests—not from a portal number alone.',
      },
    ],
  },
  {
    slug: 'iron-ferritin',
    navLabel: 'Ferritin',
    h1: 'Ferritin & Iron Studies',
    title: 'Ferritin Blood Test Explained | Iron Labs | Siya Health',
    description:
      'What ferritin and iron studies broadly measure, why clinicians consider them for fatigue, and what they cannot diagnose alone.',
    lead:
      'Ferritin reflects iron stores. With related iron studies, it helps clinicians evaluate one common contributor to fatigue—especially when history raises iron questions.',
    measures: [
      'Ferritin as a marker related to iron storage',
      'Often paired iron studies (such as iron and transferrin saturation) when indicated',
      'Context that is frequently read alongside a CBC',
    ],
    whyConsider: [
      'Persistent fatigue with heavy periods, restrictive diet, GI blood loss risk, or prior anemia',
      'Follow-up of known iron deficiency',
      'Differential evaluation when fatigue or brain fog has nutritional clues',
      'Monitoring after replacement when a clinician is managing iron deficiency',
    ],
    questionsHelps: [
      'Could low iron stores be part of this fatigue picture?',
      'Do we need CBC plus iron studies together?',
      'Is preventive follow-up needed after treatment or ongoing blood loss risk?',
    ],
    cannotAlone: [
      'Ferritin does not diagnose ADHD or depression.',
      'Inflammation and illness can raise ferritin and complicate interpretation.',
      'A single ferritin value is not a supplement prescription.',
    ],
    whenFollowUp: [
      'Ferritin or iron studies are low for your context, or symptoms persist',
      'There is a suspected source of blood loss that needs clinical attention',
      'You need a plan that connects iron status with CBC and primary care follow-up',
    ],
    relatedSymptoms: [
      { href: '/fatigue', label: 'Fatigue' },
      { href: '/labs/fatigue-brain-fog', label: 'Fatigue & brain fog labs' },
      { href: '/blog/iron-deficiency-brain-fog-adhd', label: 'Iron deficiency, brain fog & ADHD' },
    ],
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
      { href: '/womens-midlife-health', label: "Women's midlife health" },
    ],
    relatedLabs: [
      { href: '/labs/cbc', label: 'CBC' },
      { href: '/labs/vitamin-b12', label: 'Vitamin B12' },
      { href: '/labs/vitamin-d', label: 'Vitamin D' },
      { href: '/labs/preventive', label: 'Preventive labs overview' },
    ],
    faqs: [
      {
        q: 'Can low ferritin cause fatigue without anemia?',
        a: 'Sometimes iron stores can be low while hemoglobin is still in range. Clinicians interpret ferritin with CBC, symptoms, and history—not ferritin alone.',
      },
      {
        q: 'Should I start high-dose iron from a storefront result?',
        a: 'Not without clinical guidance. Excess iron has risks, and the cause of low stores still matters.',
      },
      {
        q: 'Is ferritin a routine preventive test for everyone?',
        a: 'Not universally. It is more useful when history suggests iron risk or when evaluating fatigue with those clues.',
      },
    ],
  },
  {
    slug: 'vitamin-b12',
    navLabel: 'Vitamin B12',
    h1: 'Vitamin B12',
    title: 'Vitamin B12 Blood Test Explained | Nutritional Labs | Siya Health',
    description:
      'What vitamin B12 testing broadly measures, why clinicians may order it, and what it cannot diagnose alone. Preventive and fatigue-related education.',
    lead:
      'Vitamin B12 testing looks at a nutrient that supports blood counts and neurologic function. It is most useful when history suggests risk—not as a universal explanation for every symptom.',
    measures: [
      'Circulating B12 level as commonly reported on laboratory panels',
      'Context often paired with CBC when deficiency is in the differential',
      'Sometimes related markers when results are borderline—clinician directed',
    ],
    whyConsider: [
      'Fatigue or neurologic symptoms with dietary or absorption risk',
      'Restrictive diets, certain medications, or GI conditions that affect B12',
      'Abnormal blood counts that raise deficiency questions',
      'Monitoring after documented deficiency',
    ],
    questionsHelps: [
      'Could B12 deficiency be contributing to fatigue or neurologic symptoms?',
      'Do diet, medications, or GI history justify checking a level?',
      'Should follow-up include CBC and a preventive care plan?',
    ],
    cannotAlone: [
      'B12 testing does not diagnose ADHD or depression.',
      'A “normal” range does not always end the conversation if risk and symptoms are high.',
      'Self-supplementing high-dose B12 is not always the right first step.',
    ],
    whenFollowUp: [
      'Levels are low or borderline with matching symptoms',
      'The cause of deficiency still needs evaluation',
      'Symptoms continue and other contributors (iron, thyroid, sleep) remain open',
    ],
    relatedSymptoms: [
      { href: '/fatigue', label: 'Fatigue' },
      { href: '/labs/fatigue-brain-fog', label: 'Fatigue & brain fog labs' },
    ],
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
    ],
    relatedLabs: [
      { href: '/labs/cbc', label: 'CBC' },
      { href: '/labs/iron-ferritin', label: 'Iron & ferritin' },
      { href: '/labs/vitamin-d', label: 'Vitamin D' },
      { href: '/labs/preventive', label: 'Preventive labs overview' },
    ],
    faqs: [
      {
        q: 'Who is at higher risk for B12 deficiency?',
        a: 'Risk can rise with restrictive diets, certain medications, malabsorption, and some GI conditions. A clinician assesses whether testing fits your history.',
      },
      {
        q: 'If B12 is low, is that the whole answer?',
        a: 'Often it is one piece. Clinicians still consider other contributors to fatigue and neurologic symptoms.',
      },
      {
        q: 'Can I interpret B12 from an online “optimal” chart?',
        a: 'No. Lab methods and clinical context differ. Bring results to a clinician rather than self-dosing from a chart.',
      },
    ],
  },
  {
    slug: 'vitamin-d',
    navLabel: 'Vitamin D',
    h1: 'Vitamin D (25-OH)',
    title: 'Vitamin D Blood Test Explained | Preventive Labs | Siya Health',
    description:
      'What 25-OH vitamin D testing broadly measures, why clinicians may consider it, and what it cannot diagnose alone. Education under preventive care.',
    lead:
      '25-hydroxy vitamin D is the usual blood marker for vitamin D status. It can matter for bone and general health conversations—but it is not a cure-all lab for fatigue or mood.',
    measures: [
      '25-OH vitamin D as a circulating status marker',
      'Context used when deficiency risk or related clinical questions are present',
      'A value that still needs history—sun exposure, diet, absorption, and other labs',
    ],
    whyConsider: [
      'Limited sun exposure, malabsorption risk, or other deficiency risk factors',
      'Bone health discussions or related preventive planning',
      'Fatigue workups when a clinician includes nutritional markers thoughtfully',
      'Monitoring after documented deficiency when follow-up is planned',
    ],
    questionsHelps: [
      'Is vitamin D status a reasonable piece of this preventive or fatigue picture?',
      'Do risk factors justify checking—or would other markers come first?',
      'Should results return to primary care rather than self-supplementation alone?',
    ],
    cannotAlone: [
      'Vitamin D does not diagnose depression, ADHD, or chronic fatigue syndrome.',
      'It does not replace sleep, thyroid, iron, or metabolic evaluation when those fit better.',
      'Online “optimal” targets are not personalized prescriptions.',
    ],
    whenFollowUp: [
      'Levels are low for your context and history',
      'You need a plan that addresses cause and safe repletion—not guesswork dosing',
      'Symptoms persist and the differential still includes other labs',
    ],
    relatedSymptoms: [
      { href: '/fatigue', label: 'Fatigue' },
      { href: '/labs/fatigue-brain-fog', label: 'Fatigue & brain fog labs' },
    ],
    relatedServices: [
      { href: '/preventive-care', label: 'Preventive care' },
      { href: '/primary-urgent-care', label: 'Primary & urgent care' },
    ],
    relatedLabs: [
      { href: '/labs/cbc', label: 'CBC' },
      { href: '/labs/iron-ferritin', label: 'Iron & ferritin' },
      { href: '/labs/vitamin-b12', label: 'Vitamin B12' },
      { href: '/labs/preventive', label: 'Preventive labs overview' },
    ],
    faqs: [
      {
        q: 'Should every adult get routine vitamin D testing?',
        a: 'Not necessarily. Many clinicians test when risk or clinical questions justify it rather than as an automatic add-on to every panel.',
      },
      {
        q: 'Can I fix fatigue with vitamin D alone if my level is low?',
        a: 'Repletion may help when deficiency is real, but fatigue often has overlapping causes. Follow-up with a clinician is the safer path.',
      },
      {
        q: 'Is more vitamin D always better?',
        a: 'No. Excess supplementation has risks. Dosing and monitoring belong with clinical guidance.',
      },
    ],
  },
];

export function labMarkerPath(slug) {
  return `/labs/${slug}`;
}

export function labMarkerFile(slug) {
  return `labs/${slug}.html`;
}
