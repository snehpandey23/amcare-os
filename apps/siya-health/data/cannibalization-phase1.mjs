/**
 * Cannibalization Phase 1 — guide/blog intent differentiation.
 * Consumed by generate-answer-pages.mjs and apply-cannibalization-phase1.mjs
 */

/** @typedef {'Duplicate'|'Supporting'|'Distinct'} OverlapClass */
/** @typedef {'Blog'|'Guide'|'Both'} Owner */

export const HIGH_OVERLAP_PAIRS = [
  { guide: '/answers/is-online-adhd-diagnosis-legitimate', blog: '/blog/is-online-adhd-diagnosis-legit', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to legitimacy checklist FAQ; canonical link to blog' },
  { guide: '/answers/adderall-vs-vyvanse-adults', blog: '/blog/vyvanse-vs-adderall-differences', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to preference FAQ; link to full comparison blog' },
  { guide: '/answers/adhd-medication-side-effects', blog: '/blog/adhd-medication-side-effects-what-to-expect', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to first-week side effects FAQ' },
  { guide: '/answers/is-adhd-medication-safe-long-term', blog: '/blog/is-adhd-medication-safe-long-term', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to monitoring FAQ; blog owns long-term safety narrative' },
  { guide: '/answers/adhd-medication-every-day', blog: '/blog/adhd-medication-daily-or-as-needed-adults', classification: 'Supporting', owner: 'Both', action: 'Keep both; guide = daily vs PRN FAQ; reciprocal links' },
  { guide: '/answers/glp-1-side-effects', blog: '/blog/glp1-side-effects-and-how-to-manage-them', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to titration-improving side effects FAQ' },
  { guide: '/answers/semaglutide-weight-loss-how-it-works', blog: '/blog/semaglutide-for-weight-loss-how-it-works', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to onset/timeline FAQ; blog owns MOA depth' },
  { guide: '/answers/compounded-vs-branded-glp-1', blog: '/blog/compounded-vs-branded-glp1-medications', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to patient questions FAQ' },
  { guide: '/answers/medical-weight-loss-vs-dieting', blog: '/blog/medical-weight-loss-vs-dieting-what-actually-works', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to when medical program wins FAQ' },
  { guide: '/answers/glp-1-nausea-management', blog: '/blog/glp1-side-effects-and-how-to-manage-them', classification: 'Supporting', owner: 'Blog', action: 'Guide = nausea tips FAQ; blog = full side-effect management' },
  { guide: '/answers/who-qualifies-glp-1-weight-loss', blog: '/blog/medical-weight-loss-glp1-semaglutide-texas', classification: 'Supporting', owner: 'Both', action: 'Guide = eligibility FAQ; blog = Texas service page' },
  { guide: '/answers/what-is-insulin-resistance', blog: '/blog/insulin-resistance-and-weight-loss-clinician-overview', classification: 'Supporting', owner: 'Both', action: 'Guide = definition PAA; blog = clinician hub (cornerstone)' },
  { guide: '/answers/insulin-resistance-without-diabetes', blog: '/blog/insulin-resistance-and-weight-loss-clinician-overview', classification: 'Supporting', owner: 'Both', action: 'Guide = prediabetes FAQ; blog = metabolic hub' },
  { guide: '/answers/normal-a1c-insulin-resistance', blog: '/blog/insulin-resistance-and-weight-loss-clinician-overview', classification: 'Supporting', owner: 'Both', action: 'Guide = normal A1C paradox FAQ; blog = metabolic hub' },
  { guide: '/answers/what-is-food-noise', blog: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps', classification: 'Supporting', owner: 'Both', action: 'Guide = definition PAA; blog = GLP-1 cornerstone' },
  { guide: '/answers/can-sleep-apnea-cause-fatigue', blog: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign', classification: 'Supporting', owner: 'Both', action: 'Guide = yes/no FAQ; blog = sleep apnea cornerstone' },
  { guide: '/answers/signs-of-sleep-apnea-in-adults', blog: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign', classification: 'Supporting', owner: 'Both', action: 'Guide = symptom checklist; blog = risk overview' },
  { guide: '/answers/what-is-free-testosterone', blog: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know', classification: 'Supporting', owner: 'Both', action: 'Guide = definition; blog = free vs total cornerstone' },
  { guide: '/answers/what-does-low-testosterone-feel-like', blog: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know', classification: 'Supporting', owner: 'Both', action: 'Guide = symptom PAA; blog = lab interpretation hub' },
  { guide: '/answers/high-shbg-low-free-testosterone', blog: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know', classification: 'Supporting', owner: 'Both', action: 'Guide = SHBG edge case; blog = cornerstone' },
  { guide: '/answers/when-is-testosterone-therapy-appropriate', blog: '/blog/when-is-testosterone-therapy-appropriate', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to symptom triggers FAQ' },
  { guide: '/answers/trt-monitoring-requirements', blog: '/blog/when-is-testosterone-therapy-appropriate', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to monitoring interval FAQ' },
  { guide: '/answers/oral-vs-topical-minoxidil', blog: '/blog/oral-vs-topical-minoxidil-which-is-right', classification: 'Duplicate', owner: 'Blog', action: 'Narrow guide to route selection FAQ' },
  { guide: '/answers/telehealth-adhd-california', blog: '/blog/adhd-telehealth-california', classification: 'Supporting', owner: 'Both', action: 'Guide = CA telehealth FAQ; blog = state service page' },
  { guide: '/answers/food-noise-returned-on-glp-1', blog: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps', classification: 'Supporting', owner: 'Both', action: 'Guide = return-on-therapy FAQ; blog = food noise cornerstone' },
];

/** Guide slug → narrowed PAA intent + canonical blog pointer */
export const GUIDE_CANNIBALIZATION_OVERRIDES = {
  'adhd-in-women': {
    metaDescription:
      'Quick FAQ: how ADHD often presents in women—inattentive symptoms, masking, and delayed diagnosis. Read the full clinical hub for depth.',
    canonicalBlog: {
      path: '/blog/adhd-in-women',
      label: 'our full guide to ADHD in women',
    },
  },
  'executive-dysfunction-adhd': {
    metaDescription:
      'Quick FAQ: what executive dysfunction means in adult ADHD. Read the full pillar on task initiation, working memory, planning, and supports.',
    canonicalBlog: {
      path: '/blog/executive-dysfunction-adhd',
      label: 'our full guide to executive dysfunction in ADHD',
    },
  },
  'time-blindness-adhd': {
    canonicalBlog: {
      path: '/blog/executive-dysfunction-adhd',
      label: 'executive dysfunction and time blindness in ADHD',
    },
  },
  'is-online-adhd-diagnosis-legitimate': {
    question: 'What should you look for in a legitimate online ADHD diagnosis?',
    metaDescription:
      'Quick FAQ: green flags, red flags, and what legitimate online ADHD telehealth includes. Read the full clinical guide for depth.',
    canonicalBlog: {
      path: '/blog/is-online-adhd-diagnosis-legit',
      label: 'Is online ADHD diagnosis legit? (full clinical guide)',
    },
  },
  'adderall-vs-vyvanse-adults': {
    question: 'When might Vyvanse be preferred over Adderall for adults?',
    metaDescription:
      'Quick FAQ on Vyvanse vs Adderall timing, smoothness, and prescriber trade-offs—not a full comparison. Read the complete guide.',
    canonicalBlog: {
      path: '/blog/vyvanse-vs-adderall-differences',
      label: 'Vyvanse vs Adderall: full comparison guide',
    },
  },
  'adhd-medication-side-effects': {
    question: 'What ADHD medication side effects are most common in the first weeks?',
    metaDescription:
      'Quick FAQ on early stimulant and non-stimulant side effects. Full expectations guide linked for depth and monitoring.',
    canonicalBlog: {
      path: '/blog/adhd-medication-side-effects-what-to-expect',
      label: 'ADHD medication side effects: what to expect (full guide)',
    },
  },
  'is-adhd-medication-safe-long-term': {
    question: 'What does long-term ADHD medication safety monitoring include?',
    metaDescription:
      'Quick FAQ on long-term ADHD medication monitoring—not a substitute for the full safety guide. Link to clinical article.',
    canonicalBlog: {
      path: '/blog/is-adhd-medication-safe-long-term',
      label: 'Is ADHD medication safe long-term? (full guide)',
    },
  },
  'adhd-medication-every-day': {
    metaDescription:
      'Quick FAQ: daily vs as-needed ADHD dosing for adults. Full dosing guide linked for prescriber-aligned plans.',
    canonicalBlog: {
      path: '/blog/adhd-medication-daily-or-as-needed-adults',
      label: 'ADHD medication daily or as-needed (full guide)',
    },
  },
  'glp-1-side-effects': {
    question: 'Which GLP-1 side effects usually improve with titration?',
    metaDescription:
      'Quick FAQ on GLP-1 side effects that often ease with titration. Full management guide linked.',
    canonicalBlog: {
      path: '/blog/glp1-side-effects-and-how-to-manage-them',
      label: 'GLP-1 side effects and how to manage them (full guide)',
    },
  },
  'semaglutide-weight-loss-how-it-works': {
    question: 'How quickly does semaglutide start working for weight loss?',
    metaDescription:
      'Quick FAQ on semaglutide onset and early appetite changes—not a full mechanism guide. Read the clinical article.',
    canonicalBlog: {
      path: '/blog/semaglutide-for-weight-loss-how-it-works',
      label: 'Semaglutide for weight loss: how it works (full guide)',
    },
  },
  'compounded-vs-branded-glp-1': {
    question: 'What should you ask about compounded vs branded GLP-1?',
    metaDescription:
      'Quick FAQ: questions to ask your clinician about compounded vs branded GLP-1. Full regulatory guide linked.',
    canonicalBlog: {
      path: '/blog/compounded-vs-branded-glp1-medications',
      label: 'Compounded vs branded GLP-1 medications (full guide)',
    },
  },
  'medical-weight-loss-vs-dieting': {
    question: 'When does medical weight loss outperform dieting alone?',
    metaDescription:
      'Quick FAQ on when supervised medical weight loss beats dieting alone. Full evidence guide linked.',
    canonicalBlog: {
      path: '/blog/medical-weight-loss-vs-dieting-what-actually-works',
      label: 'Medical weight loss vs dieting: what actually works (full guide)',
    },
  },
  'glp-1-nausea-management': {
    metaDescription:
      'Quick FAQ: practical GLP-1 nausea tips during titration. Full side-effect management guide linked.',
    canonicalBlog: {
      path: '/blog/glp1-side-effects-and-how-to-manage-them',
      label: 'GLP-1 side effects and how to manage them (full guide)',
    },
  },
  'who-qualifies-glp-1-weight-loss': {
    metaDescription:
      'Quick FAQ on GLP-1 weight-loss eligibility criteria. Texas medical weight-loss overview linked.',
    canonicalBlog: {
      path: '/blog/medical-weight-loss-glp1-semaglutide-texas',
      label: 'Medical weight loss with GLP-1 in Texas (full overview)',
    },
  },
  'what-is-insulin-resistance': {
    metaDescription:
      'Quick definition of insulin resistance for patients—not a clinician weight-loss overview. Full guide linked.',
    canonicalBlog: {
      path: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
      label: 'Insulin resistance and weight loss (clinician overview)',
    },
  },
  'insulin-resistance-without-diabetes': {
    metaDescription:
      'Quick FAQ: insulin resistance before diabetes thresholds. Metabolic clinician guide linked.',
    canonicalBlog: {
      path: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
      label: 'Insulin resistance and weight loss (clinician overview)',
    },
  },
  'normal-a1c-insulin-resistance': {
    metaDescription:
      'Quick FAQ: normal A1C with insulin resistance symptoms. Full metabolic guide linked.',
    canonicalBlog: {
      path: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
      label: 'Insulin resistance and weight loss (clinician overview)',
    },
  },
  'what-is-food-noise': {
    metaDescription:
      'Quick definition of food noise—not a GLP-1 treatment guide. Full food noise & GLP-1 article linked.',
    canonicalBlog: {
      path: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
      label: 'Food noise and GLP-1: what it means and what helps (full guide)',
    },
  },
  'can-sleep-apnea-cause-fatigue': {
    metaDescription:
      'Quick FAQ: can sleep apnea cause fatigue? Full sleep apnea and metabolic risk guide linked.',
    canonicalBlog: {
      path: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
      label: 'Sleep apnea, fatigue, and metabolic risk (full guide)',
    },
  },
  'signs-of-sleep-apnea-in-adults': {
    metaDescription:
      'Quick adult sleep apnea symptom checklist—not a full risk overview. Clinical guide linked.',
    canonicalBlog: {
      path: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
      label: 'Sleep apnea, fatigue, and metabolic risk (full guide)',
    },
  },
  'what-is-free-testosterone': {
    metaDescription:
      'Quick definition of free testosterone—not lab interpretation depth. Full free vs total guide linked.',
    canonicalBlog: {
      path: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
      label: 'Free vs total testosterone: what patients should know (full guide)',
    },
  },
  'what-does-low-testosterone-feel-like': {
    metaDescription:
      'Quick FAQ on low testosterone symptoms—not a lab guide. Full free vs total testosterone article linked.',
    canonicalBlog: {
      path: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
      label: 'Free vs total testosterone: what patients should know (full guide)',
    },
  },
  'high-shbg-low-free-testosterone': {
    metaDescription:
      'Quick FAQ on high SHBG and low free testosterone—not a full hormone lab guide. Cornerstone article linked.',
    canonicalBlog: {
      path: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
      label: 'Free vs total testosterone: what patients should know (full guide)',
    },
  },
  'when-is-testosterone-therapy-appropriate': {
    question: 'What symptoms warrant testosterone therapy evaluation?',
    metaDescription:
      'Quick FAQ on symptoms that prompt TRT evaluation—not a full candidacy guide. Clinical article linked.',
    canonicalBlog: {
      path: '/blog/when-is-testosterone-therapy-appropriate',
      label: 'When is testosterone therapy appropriate? (full guide)',
    },
  },
  'trt-monitoring-requirements': {
    question: 'How often is TRT monitoring required?',
    metaDescription:
      'Quick FAQ on TRT lab and symptom monitoring intervals. Full appropriateness guide linked.',
    canonicalBlog: {
      path: '/blog/when-is-testosterone-therapy-appropriate',
      label: 'When is testosterone therapy appropriate? (full guide)',
    },
  },
  'oral-vs-topical-minoxidil': {
    question: 'When is topical minoxidil enough vs oral minoxidil?',
    metaDescription:
      'Quick FAQ on topical vs oral minoxidil selection—not a full route comparison. Clinical guide linked.',
    canonicalBlog: {
      path: '/blog/oral-vs-topical-minoxidil-which-is-right',
      label: 'Oral vs topical minoxidil: which is right? (full guide)',
    },
  },
  'telehealth-adhd-california': {
    metaDescription:
      'Quick FAQ on ADHD telehealth logistics in California. State-specific service article linked.',
    canonicalBlog: {
      path: '/blog/adhd-telehealth-california',
      label: 'ADHD telehealth in California (full overview)',
    },
  },
  'food-noise-returned-on-glp-1': {
    metaDescription:
      'Quick FAQ: food noise returning on GLP-1 therapy. Full food noise cornerstone linked.',
    canonicalBlog: {
      path: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
      label: 'Food noise and GLP-1: what it means and what helps (full guide)',
    },
  },
};

/** Blog slug → reciprocal Health Guide link (supporting + duplicate winners) */
export const BLOG_RECIPROCAL_GUIDE_LINKS = {
  'is-online-adhd-diagnosis-legit': { guide: '/answers/is-online-adhd-diagnosis-legitimate', anchor: 'Quick FAQ: legitimate online ADHD diagnosis checklist' },
  'vyvanse-vs-adderall-differences': { guide: '/answers/adderall-vs-vyvanse-adults', anchor: 'Quick FAQ: when Vyvanse may be preferred over Adderall' },
  'adhd-medication-side-effects-what-to-expect': { guide: '/answers/adhd-medication-side-effects', anchor: 'Quick FAQ: common ADHD medication side effects in the first weeks' },
  'is-adhd-medication-safe-long-term': { guide: '/answers/is-adhd-medication-safe-long-term', anchor: 'Quick FAQ: long-term ADHD medication monitoring' },
  'adhd-medication-daily-or-as-needed-adults': { guide: '/answers/adhd-medication-every-day', anchor: 'Quick FAQ: daily vs as-needed ADHD dosing' },
  'glp1-side-effects-and-how-to-manage-them': { guide: '/answers/glp-1-side-effects', anchor: 'Quick FAQ: GLP-1 side effects that improve with titration' },
  'semaglutide-for-weight-loss-how-it-works': { guide: '/answers/semaglutide-weight-loss-how-it-works', anchor: 'Quick FAQ: how quickly semaglutide starts working' },
  'compounded-vs-branded-glp1-medications': { guide: '/answers/compounded-vs-branded-glp-1', anchor: 'Quick FAQ: questions about compounded vs branded GLP-1' },
  'medical-weight-loss-vs-dieting-what-actually-works': { guide: '/answers/medical-weight-loss-vs-dieting', anchor: 'Quick FAQ: when medical weight loss beats dieting alone' },
  'medical-weight-loss-glp1-semaglutide-texas': { guide: '/answers/who-qualifies-glp-1-weight-loss', anchor: 'Quick FAQ: who qualifies for GLP-1 weight loss' },
  'food-noise-and-glp-1-what-it-means-and-what-helps': { guide: '/answers/what-is-food-noise', anchor: 'Quick FAQ: what is food noise?' },
  'insulin-resistance-and-weight-loss-clinician-overview': { guide: '/answers/what-is-insulin-resistance', anchor: 'Quick FAQ: what is insulin resistance?' },
  'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': { guide: '/answers/can-sleep-apnea-cause-fatigue', anchor: 'Quick FAQ: can sleep apnea cause fatigue?' },
  'free-testosterone-vs-total-testosterone-what-patients-should-know': { guide: '/answers/what-is-free-testosterone', anchor: 'Quick FAQ: what is free testosterone?' },
  'when-is-testosterone-therapy-appropriate': { guide: '/answers/when-is-testosterone-therapy-appropriate', anchor: 'Quick FAQ: symptoms that warrant TRT evaluation' },
  'oral-vs-topical-minoxidil-which-is-right': { guide: '/answers/oral-vs-topical-minoxidil', anchor: 'Quick FAQ: topical vs oral minoxidil' },
  'adhd-telehealth-california': { guide: '/answers/telehealth-adhd-california', anchor: 'Quick FAQ: ADHD telehealth in California' },
};

/** Canonical winning blogs for link-equity tracking */
export const CANONICAL_WINNING_BLOGS = [
  '/blog/is-online-adhd-diagnosis-legit',
  '/blog/vyvanse-vs-adderall-differences',
  '/blog/adhd-medication-side-effects-what-to-expect',
  '/blog/is-adhd-medication-safe-long-term',
  '/blog/non-stimulant-adhd-medications-explained',
  '/blog/glp1-side-effects-and-how-to-manage-them',
  '/blog/semaglutide-for-weight-loss-how-it-works',
  '/blog/tirzepatide-vs-semaglutide-which-is-better',
  '/blog/compounded-vs-branded-glp1-medications',
  '/blog/phentermine-for-weight-loss-safety-and-effectiveness',
  '/blog/oral-vs-injectable-weight-loss-medications',
  '/blog/medical-weight-loss-vs-dieting-what-actually-works',
  '/blog/when-is-testosterone-therapy-appropriate',
  '/blog/minoxidil-for-hair-loss-does-it-work',
  '/blog/oral-vs-topical-minoxidil-which-is-right',
  '/blog/sildenafil-for-erectile-dysfunction-what-to-expect',
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  '/fatigue',
  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
  '/blog/medical-weight-loss-glp1-semaglutide-texas',
  '/blog/adhd-telehealth-california',
  '/blog/adhd-medication-daily-or-as-needed-adults',
];

export const CORNERSTONE_SYSTEMS = [
  {
    name: 'Food Noise',
    blog: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
    guides: ['/answers/what-is-food-noise', '/answers/food-noise-returned-on-glp-1'],
    headTermOwner: 'blog',
  },
  {
    name: 'Insulin Resistance',
    blog: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
    guides: ['/answers/what-is-insulin-resistance', '/answers/insulin-resistance-without-diabetes', '/answers/normal-a1c-insulin-resistance'],
    headTermOwner: 'blog',
  },
  {
    name: 'Fatigue',
    blog: '/fatigue',
    guides: ['/answers/why-am-i-tired-even-after-sleeping', '/answers/why-normal-labs-dont-mean-healthy'],
    headTermOwner: 'blog',
  },
  {
    name: 'Sleep Apnea',
    blog: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
    guides: ['/answers/can-sleep-apnea-cause-fatigue', '/answers/signs-of-sleep-apnea-in-adults'],
    headTermOwner: 'blog',
  },
  {
    name: 'Free Testosterone',
    blog: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
    guides: ['/answers/what-is-free-testosterone', '/answers/what-does-low-testosterone-feel-like', '/answers/high-shbg-low-free-testosterone'],
    headTermOwner: 'blog',
  },
];
