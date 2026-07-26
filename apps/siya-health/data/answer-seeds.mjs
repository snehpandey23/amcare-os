/**
 * Health Guide answer seeds — one question per page.
 * Run: node scripts/generate-answer-pages.mjs
 */
import { PHASE3_ANSWER_SEEDS } from './phase3-answer-seeds.mjs';
import { PHASE5_ANSWER_SEEDS } from './phase5-thin-expansions.mjs';
import { PHASE5_EXTRA_SECTIONS } from './phase5-section-boost.mjs';
import { visitPrepParagraph, normalResultsParagraph } from '../scripts/content-assembly.mjs';

/**
 * Coordination section — every paragraph earns its place.
 * No shared ADHD childhood-onset / normal-results paste across topics.
 * Prep + normal-results are slug-unique via visitPrepParagraph / normalResultsParagraph.
 */
function phase5CoordinationSection(slug, topic) {
  const lead = {
    'adhd-vs-burnout': 'Burnout recovery and ADHD evaluation can run in parallel when timeline supports both.',
    'adhd-vs-anxiety': 'Anxiety treatment and ADHD evaluation should be coordinated rather than guessed from one symptom.',
    'starting-adhd-medication-adults': 'Medication start visits should link to clear refill and crisis instructions.',
    'can-adhd-be-diagnosed-online': 'Online diagnosis still requires the same documentation standards as in-person care.',
    'signs-of-adult-adhd': 'Symptom lists on this page support—but do not replace—structured evaluation.',
    'can-adhd-cause-anxiety': 'When both disorders are present, document which symptoms respond to which treatment.',
    'is-online-adhd-diagnosis-legitimate': 'Legitimacy is demonstrated through follow-up, not through marketing copy.',
    'glp-1-side-effects': 'Side-effect counseling should be revisited at every titration step.',
    'semaglutide-weight-loss-how-it-works': 'Weight-loss pharmacotherapy works best inside a documented medical program.',
    'what-is-insulin-resistance': 'Metabolic care should connect labs, sleep, and nutrition—not single biomarkers.',
    'normal-a1c-insulin-resistance': 'Repeat labs and symptom diaries help clinicians interpret normal A1C in context.',
    'insulin-resistance-without-diabetes': 'Prevention visits are appropriate before diabetes thresholds are crossed.',
    'what-is-food-noise': 'Food noise discussions should screen for eating disorders and metabolic comorbidity.',
    'what-is-free-testosterone': 'Hormone labs should be ordered with assay methodology and timing in mind.',
    'when-is-testosterone-therapy-appropriate': 'TRT decisions should document informed consent and monitoring plans.',
    'trt-monitoring-requirements': 'Monitoring schedules should be calendarized—not remembered only at refills.',
    'is-telehealth-legitimate': 'Telehealth legitimacy is proven through licensure, privacy, and continuity.',
    'meet-and-greet-telehealth-expectations': 'First telehealth visits clarify logistics before clinical commitments.',
    'how-online-prescriptions-work': 'Prescribing laws apply equally to telehealth and in-person encounters.',
  };
  const intro = lead[slug] || `This guide on ${slug.replace(/-/g, ' ')} supports—not replaces—clinician-led care.`;
  const topicCloser = {
    adhd: 'Call 911 for emergencies. Telehealth improves access but does not replace in-person examination, sleep testing, or labs when clinically indicated.',
    'weight-loss': 'Educational content cannot promise a specific weight outcome; plans follow FDA indications, monitoring, and individual tolerability.',
    'mens-health': 'Hormone therapy claims on social media often omit fertility, hematocrit, and cardiovascular trade-offs that guideline-based care addresses.',
    telehealth: 'Emergency symptoms require local urgent or emergency care—not messaging queues.',
  };
  return {
    id: 'coordination-of-care',
    heading: 'Coordinating medical care (educational)',
    paragraphs: [
      intro,
      visitPrepParagraph(topic, slug, intro),
      normalResultsParagraph(topic, slug, intro),
      topicCloser[topic] || topicCloser.telehealth,
    ],
  };
}

function mergePhase5Seeds(coreSeeds) {
  const patches = new Map(PHASE5_ANSWER_SEEDS.map((s) => [s.slug, s]));
  return coreSeeds.map((seed) => {
    const patch = patches.get(seed.slug);
    if (!patch) return seed;
    const merged = { ...seed, ...patch };
    delete merged.paragraphs;
    const extra = PHASE5_EXTRA_SECTIONS[seed.slug];
    const sections = [...(merged.sections || [])];
    const kt = sections.findIndex((s) => s.id === 'key-takeaways');
    const insertAt = kt >= 0 ? kt : sections.length;
    if (extra?.length) sections.splice(insertAt, 0, ...extra);
    sections.splice(insertAt + (extra?.length || 0), 0, phase5CoordinationSection(seed.slug, merged.topic));
    merged.sections = sections;
    return merged;
  });
}

const CORE_ANSWER_SEEDS = [
  {
    slug: 'signs-of-adult-adhd',
    question: 'What are the signs of adult ADHD?',
    shortAnswer:
      'Adult ADHD often shows up as chronic difficulty sustaining focus, disorganization, forgetfulness, time blindness, trouble finishing tasks, inner restlessness, and emotional sensitivity—not just hyperactivity. Symptoms must cause real impairment and usually trace back to childhood patterns, though many adults were never diagnosed.',
    paragraphs: [
      'Clinicians look for persistent inattention, impulsivity, and/or hyperactivity that interferes with work, relationships, or daily life. In adults, inattentive presentation is common: mental fog, losing track of conversations, missed deadlines, and piles of unfinished projects.',
      'Many high-functioning adults compensate with anxiety, long hours, or rigid routines until burnout hits. That is why ADHD is frequently missed in people who appear successful on paper.',
      'In men, ADHD may show more external restlessness, impulsivity, or risk-taking—but many men have primarily inattentive ADHD that looks like laziness or underperformance. Relationship strain, job hopping, and substance use histories are common reasons men seek evaluation.',
      'Other conditions—anxiety, depression, sleep apnea, thyroid disease, iron deficiency—can mimic ADHD. A structured evaluation with a licensed clinician rules out look-alikes and clarifies next steps.',
    ],
    evidence: ['DSM-5-TR criteria for ADHD in adults', 'NIMH: ADHD in adults overview', 'CHADD adult ADHD resources'],
    related: ['can-adhd-be-diagnosed-online', 'how-long-adhd-evaluation', 'adhd-vs-anxiety', 'high-functioning-adhd'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'can-adhd-cause-anxiety',
    question: 'Can ADHD cause anxiety?',
    shortAnswer:
      'ADHD does not directly “cause” anxiety in every patient, but living with untreated ADHD—missed deadlines, shame, chronic overwhelm—commonly leads to secondary anxiety. ADHD and anxiety also frequently co-occur and share overlapping symptoms, which is why clinicians screen for both during evaluation.',
    paragraphs: [
      'Many adults with ADHD describe a lifetime of feeling behind, which fuels worry, perfectionism, or avoidance. Treating ADHD can sometimes ease anxiety; in other cases both need targeted care.',
      'Stimulant medications can unmask or worsen anxiety in some people—another reason prescribing requires a full history and follow-up, not a quick online form.',
    ],
    evidence: ['NIMH comorbidity research themes', 'ADHD-CCSP clinical evaluation standards'],
    related: ['adhd-vs-anxiety', 'signs-of-adult-adhd', 'is-adhd-medication-safe-long-term'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'adhd-vs-anxiety',
    question: 'How do you tell ADHD apart from anxiety?',
    shortAnswer:
      'Anxiety is often situational worry with physical tension; ADHD is a chronic pattern of attention regulation, organization, and impulse-control problems that started in childhood. Only a licensed clinician can distinguish them—many adults have both.',
    paragraphs: [
      'Anxiety may spike before presentations; ADHD shows up daily across contexts—email, chores, conversations, hobbies.',
      'Validated screening tools and a developmental history help clinicians separate primary ADHD from anxiety-driven distraction.',
    ],
    evidence: ['DSM-5-TR differential diagnosis principles', 'ASRS adult ADHD screener (screening only)'],
    related: ['can-adhd-cause-anxiety', 'signs-of-adult-adhd', 'asrs-adhd-screening-explained'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'adhd-vs-burnout',
    question: 'Is it ADHD or burnout?',
    shortAnswer:
      'Burnout is usually tied to prolonged stress and improves with rest, boundaries, or job changes. ADHD is lifelong neurodevelopmental difficulty with attention and executive function that persists across settings. They can overlap—many undiagnosed adults burn out from compensating for ADHD.',
    paragraphs: [
      'If focus problems started only after a stressful quarter, burnout or depression may be primary. If you have decades of similar struggles, ADHD deserves evaluation.',
    ],
    evidence: ['WHO burnout occupational context', 'Adult ADHD longitudinal presentation literature'],
    related: ['late-adhd-diagnosis-adults', 'high-functioning-adhd', 'signs-of-adult-adhd'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'late-adhd-diagnosis-adults',
    question: 'Why are so many adults diagnosed with ADHD late in life?',
    shortAnswer:
      'Childhood ADHD was often missed—especially in girls, high achievers, and inattentive types without hyperactivity. Adults seek answers after burnout, job changes, or parenting when old coping strategies stop working.',
    paragraphs: [
      'Telehealth has made evaluation more accessible, but diagnosis still requires clinician judgment—not social media checklists alone.',
    ],
    evidence: ['CHADD: late diagnosis in adults', 'Peer-reviewed literature on missed childhood ADHD'],
    related: ['signs-of-adult-adhd', 'adhd-in-women', 'can-adhd-be-diagnosed-online'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'high-functioning-adhd',
    question: 'Can you have ADHD and still be high-functioning?',
    shortAnswer:
      'Yes. Many adults with ADHD perform well outwardly while struggling privately with exhaustion, procrastination, and emotional overload. “High functioning” is not a clinical term—it describes compensation, not absence of ADHD.',
    paragraphs: [
      'Intelligence, structure, or anxiety-driven overwork can mask ADHD until a life transition exposes the gap between effort and output.',
    ],
    evidence: ['Clinical descriptions of compensatory strategies in adult ADHD'],
    related: ['signs-of-adult-adhd', 'adhd-vs-burnout', 'executive-dysfunction-adhd'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'adhd-in-women',
    question: 'How does ADHD present differently in women?',
    shortAnswer:
      'Women more often present with inattentive symptoms—daydreaming, disorganization, emotional dysregulation—rather than obvious hyperactivity. Hormonal shifts, social expectations, and misattribution to anxiety or mood disorders delay diagnosis.',
    paragraphs: [
      'Rejection sensitivity and internalized shame are common. Evaluation should explore childhood history even when records are sparse.',
    ],
    evidence: ['Research on sex differences in ADHD presentation', 'DSM-5-TR inattentive subtype criteria'],
    related: ['signs-of-adult-adhd', 'rejection-sensitivity-adhd', 'late-adhd-diagnosis-adults'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'time-blindness-adhd',
    question: 'What is time blindness in ADHD?',
    shortAnswer:
      'Time blindness describes difficulty sensing how long tasks take, losing track of time, or chronically underestimating deadlines. It is a common executive-function struggle in ADHD—not a character flaw—and responds to structure, reminders, and sometimes medication.',
    paragraphs: [
      'Tools like timers, calendar blocking, and body-doubling help; treatment plans may combine behavioral strategies with clinical care when ADHD is confirmed.',
    ],
    evidence: ['Executive function literature in ADHD', 'CHADD time management resources'],
    related: ['executive-dysfunction-adhd', 'signs-of-adult-adhd'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'rejection-sensitivity-adhd',
    question: 'What is rejection sensitive dysphoria (RSD) and ADHD?',
    shortAnswer:
      'RSD describes intense emotional pain after perceived criticism or rejection. It is not an official DSM diagnosis but is frequently reported in ADHD. Clinicians address it alongside ADHD, anxiety, or mood symptoms with therapy, skills training, and medication when appropriate.',
    paragraphs: [
      'Do not self-diagnose RSD; a clinician can map symptoms to ADHD, mood disorders, or trauma history.',
    ],
    evidence: ['Clinical ADHD emotion regulation literature', 'Patient-reported RSD descriptions in ADHD populations'],
    related: ['can-adhd-cause-anxiety', 'adhd-in-women'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'executive-dysfunction-adhd',
    question: 'What is executive dysfunction in adult ADHD?',
    shortAnswer:
      'Executive dysfunction refers to difficulty with planning, prioritizing, initiating tasks, working memory, and flexible thinking. In ADHD these skills are inconsistent—not absent—which is why you might hyperfocus on interesting work yet cannot start boring paperwork.',
    paragraphs: [
      'Occupational therapy strategies, ADHD coaching, and medication (when prescribed) are common pillars of care.',
    ],
    evidence: ['Neuropsychology of executive function in ADHD'],
    related: ['time-blindness-adhd', 'signs-of-adult-adhd'],
    topic: 'adhd',
    reviewerSlug: 'dr-natasha-desai',
  },
  {
    slug: 'can-adhd-be-diagnosed-online',
    question: 'Can ADHD be diagnosed online?',
    shortAnswer:
      'Yes—when a licensed clinician in your state conducts a full telehealth evaluation using clinical interview, validated tools, and safety screening. A free online quiz alone is screening, not diagnosis. Legitimate care uses HIPAA-compliant video and documented visits.',
    paragraphs: [
      'At Siya Health, adult ADHD evaluation is a 60–90 minute visit with board-certified, ADHD-CCSP–trained providers in eligible states.',
      'Instant stimulant promises without evaluation are a red flag in any state.',
    ],
    evidence: ['State telehealth practice rules', 'HIPAA-compliant telehealth standards', 'ASRS + clinical interview best practices'],
    related: ['is-online-adhd-diagnosis-legitimate', 'how-long-adhd-evaluation', 'what-included-199-adhd-evaluation'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'is-online-adhd-diagnosis-legitimate',
    question: 'Is online ADHD diagnosis legitimate?',
    shortAnswer:
      'Legitimate online ADHD diagnosis requires a licensed provider, sufficient visit length, standardized assessments as indicated, medical history review, and appropriate follow-up—not an automated quiz with automatic prescriptions.',
    paragraphs: [
      'Look for transparent pricing, state licensure disclosure, and refusal to guarantee stimulants before evaluation.',
    ],
    evidence: ['DEA telemedicine prescribing rules (evolving)', 'Clinical ADHD evaluation guidelines'],
    related: ['can-adhd-be-diagnosed-online', 'telehealth-adhd-texas', 'telehealth-adhd-california'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'how-much-does-adhd-testing-cost',
    question: 'How much does ADHD testing cost?',
    shortAnswer:
      'Costs vary widely: some clinics charge $500–$2,000+; Siya Health offers a transparent $149 comprehensive adult ADHD evaluation (60–90 minutes) including clinical interview and standardized tools when clinically indicated. Always confirm what is included before booking.',
    paragraphs: [
      'Insurance may cover some in-network evaluations but often involves prior authorization delays. Many patients use FSA/HSA for direct-pay telehealth.',
    ],
    evidence: ['Market pricing surveys for adult ADHD evaluation', 'Siya Health published pricing at /adhd-care'],
    related: ['what-included-199-adhd-evaluation', 'fsa-hsa-adhd-evaluation', 'screening-vs-adhd-evaluation'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'how-long-adhd-evaluation',
    question: 'How long does an ADHD evaluation take?',
    shortAnswer:
      'A thorough adult ADHD evaluation typically takes 60–90 minutes of face-to-face clinician time, plus intake forms and any cognitive screening completed before or during the visit. Quick five-minute surveys are not equivalent to diagnosis.',
    paragraphs: [
      'Follow-up visits for medication management are shorter but still structured.',
    ],
    evidence: ['ADHD-CCSP training visit-length norms', 'Clinical interview standards'],
    related: ['what-included-199-adhd-evaluation', 'screening-vs-adhd-evaluation'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'adderall-vs-vyvanse-adults',
    question: 'Adderall vs Vyvanse for adults: what is the difference?',
    shortAnswer:
      'Both are stimulant medications used for ADHD when clinically appropriate. Adderall (mixed amphetamine salts) has multiple formulations with varied onset/duration; Vyvanse (lisdexamfetamine) is a prodrug with smoother onset for many patients. Only a licensed prescriber should choose based on history, comorbidities, and response.',
    paragraphs: [
      'Side effects, cardiovascular risk, substance-use history, and sleep impact all influence selection.',
    ],
    evidence: ['FDA medication guides — Adderall (mixed salts) and Vyvanse (lisdexamfetamine) prescribing information', 'Adult ADHD treatment guidelines'],
    related: ['adhd-medication-side-effects', 'starting-adhd-medication-adults', 'is-adhd-medication-safe-long-term'],
    topic: 'adhd',
    reviewerSlug: 'dr-swati-pandey',
  },
  {
    slug: 'adhd-medication-side-effects',
    question: 'What are common ADHD medication side effects?',
    shortAnswer:
      'Stimulants may cause decreased appetite, insomnia, increased heart rate or blood pressure, anxiety, or mood changes. Non-stimulants have their own profiles (e.g., fatigue, dry mouth). Most side effects are manageable with dose timing, formulation changes, or switching agents—report concerns promptly.',
    paragraphs: [
      'Serious but rare risks require monitoring; never adjust controlled medications without your prescriber.',
    ],
    evidence: ['FDA medication guides for stimulants', 'Clinical monitoring recommendations'],
    related: ['starting-adhd-medication-adults', 'is-adhd-medication-safe-long-term'],
    topic: 'adhd',
    reviewerSlug: 'dr-swati-pandey',
  },
  {
    slug: 'is-adhd-medication-safe-long-term',
    question: 'Is ADHD medication safe long term?',
    shortAnswer:
      'For many appropriately monitored adults, stimulant and non-stimulant ADHD medications have favorable benefit–risk profiles. Long-term care includes periodic blood pressure/pulse checks, sleep and mood review, and substance-use screening when indicated. Individual risk varies—there is no universal yes/no.',
    paragraphs: [
      'Untreated ADHD carries its own risks: accidents, job loss, mood problems, and self-medication.',
    ],
    evidence: ['Long-term stimulant safety literature — population studies and cohort follow-up data', 'ADHD treatment guideline monitoring schedules'],
    related: ['adhd-medication-side-effects', 'starting-adhd-medication-adults'],
    topic: 'adhd',
    reviewerSlug: 'dr-swati-pandey',
  },
  {
    slug: 'starting-adhd-medication-adults',
    question: 'What should adults expect when starting ADHD medication?',
    shortAnswer:
      'Expect a gradual titration plan, clear follow-up dates, baseline vitals when indicated, and honest discussion of goals (work hours, driving, sleep). After diagnosis, turn clarity into a plan: understand your symptom pattern, choose evidence-based options, and schedule structured follow-up. Improvement should be tracked with structured check-ins—not guessed from social media timelines.',
    paragraphs: [
      'Controlled substances require ID verification, prescription monitoring, and pharmacy coordination per state law.',
      'Post-diagnosis care often combines medication (when appropriate), behavioral strategies, and lifestyle supports—sleep, planning systems, and treatment of co-occurring conditions like sleep apnea or depression.',
      'Your treatment plan may include medication trials with clear targets, follow-up visits for benefits and side effects, and adjustments over time as life stress or health changes.',
    ],
    faqs: [
      {
        question: 'What is the first thing to do after an ADHD diagnosis?',
        answer:
          'Understand what the diagnosis means for your daily life—symptom pattern, functional impact, and what conditions were ruled out. Ask your clinician for a written summary or follow-up plan when possible.',
      },
      {
        question: 'Do I have to take medication after an ADHD diagnosis?',
        answer:
          'No. Medication is one option. Some adults combine medication with behavioral strategies; others focus on non-stimulant options or therapy-forward plans depending on clinical appropriateness.',
      },
      {
        question: 'How often will I need follow-up after starting ADHD medication?',
        answer:
          'Follow-up frequency depends on whether you start medication, how stable symptoms are, and monitoring needs. Many practices schedule visits more often early in treatment, then space out as you stabilize.',
      },
      {
        question: 'Can an ADHD diagnosis be revisited if something changes?',
        answer:
          'Yes. New sleep problems, mood episodes, or life stressors can change the clinical picture. Good care includes reassessment when response to treatment is unexpected.',
      },
    ],
    evidence: ['Prescriber monitoring norms for stimulants', 'State PDMP requirements'],
    related: ['adhd-medication-side-effects', 'can-you-get-adhd-medication-online', 'late-adhd-diagnosis-adults'],
    topic: 'adhd',
    reviewerSlug: 'dr-swati-pandey',
  },
  {
    slug: 'adhd-medication-every-day',
    question: 'Do you have to take ADHD medication every day?',
    shortAnswer:
      'Some adults take medication daily; others use weekday-only or situational dosing when clinically appropriate. Skipping doses unpredictably on controlled stimulants can cause rebound symptoms or inconsistency—follow your prescriber’s plan.',
    paragraphs: [
      'Drug holidays are a shared decision, not a DIY experiment.',
    ],
    evidence: ['Clinical titration and adherence literature'],
    related: ['starting-adhd-medication-adults', 'adhd-medication-side-effects'],
    topic: 'adhd',
    reviewerSlug: 'dr-swati-pandey',
  },
  {
    slug: 'can-you-get-adhd-medication-online',
    question: 'Can you get ADHD medication online?',
    shortAnswer:
      'In eligible states, yes—after a legitimate telehealth evaluation and ongoing relationship with a licensed prescriber. Online does not mean automatic; controlled substances require identity verification, monitoring, and follow-up per federal and state rules.',
    paragraphs: [
      'Avoid services that promise instant stimulants without a documented evaluation.',
    ],
    evidence: ['DEA telemedicine prescribing policies', 'State medical board telehealth standards'],
    related: ['can-adhd-be-diagnosed-online', 'telehealth-adhd-texas', 'telehealth-adhd-california'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'asrs-adhd-screening-explained',
    question: 'What is the ASRS ADHD screening test?',
    shortAnswer:
      'The Adult ADHD Self-Report Scale (ASRS) is a validated screening questionnaire—not a diagnosis. It helps clinicians decide whether a full evaluation is warranted. Siya Health offers a free screening; positive screens should lead to clinician review, not self-treatment.',
    paragraphs: [
      'Screeners cannot rule out anxiety, sleep disorders, or medical mimics. ASRS supports clinical evaluation but does not independently establish a diagnosis.',
    ],
    evidence: ['WHO ASRS v1.1 instrument documentation'],
    related: ['screening-vs-adhd-evaluation', 'signs-of-adult-adhd'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'screening-vs-adhd-evaluation',
    question: 'What is the difference between ADHD screening and a full evaluation?',
    shortAnswer:
      'Screening (e.g., ASRS, short online quizzes) estimates likelihood and takes minutes. A full evaluation is a 60–90 minute clinician visit with history, standardized tools, safety screening, and a written plan—required for formal diagnosis. Prescribing when clinically appropriate is never guaranteed—including stimulants.',
    paragraphs: [
      'Never treat a screener result as a lifetime label.',
    ],
    evidence: ['US Preventive Services Task Force context on ADHD tools', 'Clinical evaluation standards'],
    related: ['asrs-adhd-screening-explained', 'how-long-adhd-evaluation'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'glp-1-side-effects',
    question: 'What are GLP-1 side effects?',
    shortAnswer:
      'Common GLP-1 receptor agonist side effects include nausea, vomiting, diarrhea, constipation, reflux, and reduced appetite. Most GI symptoms improve over weeks with dose titration, hydration, and meal timing. Rare but serious risks (pancreatitis, gallbladder disease) require prompt medical attention.',
    paragraphs: [
      'GLP-1 medications are prescription-only and require clinician monitoring—not DIY compounded products from unverified sources.',
    ],
    evidence: ['FDA GLP-1 medication guides (semaglutide, tirzepatide)', 'Clinical trial GI adverse event profiles'],
    related: ['what-is-food-noise', 'glp-1-nausea-management', 'semaglutide-weight-loss-how-it-works', 'who-qualifies-glp-1-weight-loss'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'semaglutide-weight-loss-how-it-works',
    question: 'How does semaglutide work for weight loss?',
    shortAnswer:
      'Semaglutide mimics GLP-1, slowing gastric emptying, reducing appetite signals, and improving glycemic control in eligible patients. Weight loss results from sustained calorie deficit plus behavioral support—not the injection alone.',
    paragraphs: [
      'Brand and compounding standards differ; discuss FDA-approved options and risks with a licensed obesity medicine clinician.',
    ],
    evidence: ['STEP trial program publications — semaglutide 2.4 mg weight-loss outcomes in adults', 'FDA Wegovy/Ozempic labeling'],
    related: ['what-is-food-noise', 'glp-1-side-effects', 'compounded-vs-branded-glp-1'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'compounded-vs-branded-glp-1',
    question: 'Compounded vs branded GLP-1: what is the difference?',
    shortAnswer:
      'Branded FDA-approved GLP-1 medicines undergo standardized manufacturing, labeling, and post-market safety tracking. Compounded versions may be used in specific pharmacy scenarios but carry different quality, dosing, and legal considerations. Discuss risks and sourcing only with a licensed prescriber.',
    paragraphs: [
      'Avoid unregulated “weight loss shots” sold without medical oversight.',
    ],
    evidence: ['FDA compounding policy statements', 'State board of pharmacy regulations'],
    related: ['glp-1-side-effects', 'who-qualifies-glp-1-weight-loss'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'medical-weight-loss-vs-dieting',
    question: 'Medical weight loss vs dieting: what works better?',
    shortAnswer:
      'Sustainable weight change usually combines nutrition, movement, sleep, behavioral support, and—when indicated—FDA-approved medications. Diets alone often fail because obesity is multifactorial: hormones, ADHD, depression, and environment all matter. Medical programs add monitoring and evidence-based pharmacotherapy.',
    paragraphs: [
      'No approach guarantees a specific number of pounds; goals should be health-centered.',
    ],
    evidence: ['Obesity medicine multispecialty guidelines', 'Long-term diet relapse statistics'],
    related: ['adhd-and-weight-loss-connection', 'who-qualifies-glp-1-weight-loss'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'glp-1-nausea-management',
    question: 'How do you manage GLP-1 nausea?',
    shortAnswer:
      'Clinicians start low and titrate slowly, advise smaller meals, avoid greasy foods, stay hydrated, and adjust timing. Persistent vomiting, dehydration, or severe abdominal pain needs urgent evaluation—not just “pushing through.”',
    paragraphs: [
      'Do not combine GLP-1 agents with other weight-loss drugs without medical supervision.',
    ],
    evidence: ['Manufacturer titration schedules', 'Clinical GI management protocols for GLP-1'],
    related: ['what-is-food-noise', 'glp-1-side-effects', 'semaglutide-weight-loss-how-it-works'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'who-qualifies-glp-1-weight-loss',
    question: 'Who qualifies for GLP-1 weight loss medications?',
    shortAnswer:
      'Eligibility generally follows FDA indications: typically BMI thresholds with comorbidities, or higher BMI cutoffs—plus no contraindications (certain thyroid cancers, pancreatitis history, pregnancy, etc.). A licensed clinician reviews labs, medications, and goals before prescribing.',
    paragraphs: [
      'Insurance coverage criteria may be stricter than FDA labeling.',
    ],
    evidence: ['FDA indication summaries for semaglutide 2.4 mg and tirzepatide weight indications'],
    related: ['what-is-food-noise', 'glp-1-side-effects', 'compounded-vs-branded-glp-1'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'adhd-and-weight-loss-connection',
    question: 'Is there a connection between ADHD and weight loss struggles?',
    shortAnswer:
      'Yes. Impulsivity, emotional eating, irregular meals, sleep debt, and stimulant effects on appetite all link ADHD and weight. Treating ADHD can help routines; GLP-1 or other obesity therapies may be considered in coordinated plans when clinically appropriate.',
    paragraphs: [
      'Avoid unsupervised stacking of stimulants and weight-loss agents.',
    ],
    evidence: ['Population studies on ADHD and obesity comorbidity', 'Integrated metabolic psychiatry literature'],
    related: ['what-is-food-noise', 'medical-weight-loss-vs-dieting', 'signs-of-adult-adhd'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'what-is-insulin-resistance',
    question: 'What is insulin resistance?',
    shortAnswer:
      'Insulin resistance means your cells respond less efficiently to insulin, so the pancreas often releases more insulin to keep blood sugar in range. It can exist for years before A1C rises into prediabetes or diabetes. It is closely tied to excess visceral fat, weight gain, cravings, and cardiometabolic risk—and it usually improves with sustained weight loss, activity, sleep, and clinician-guided care when needed.',
    paragraphs: [
      'Insulin resistance is not the same as type 2 diabetes, though it is a major pathway toward it. Standard screening uses fasting glucose, A1C, or an oral glucose tolerance test; fasting insulin or HOMA-IR can add context but are not routine on every panel and vary by lab.',
      'Weight loss of roughly 5–7% of body weight—combined with regular movement—has strong trial evidence for improving insulin sensitivity and lowering diabetes risk in high-risk adults (Diabetes Prevention Program).',
      'If you have waist gain, post-meal fatigue, strong carb cravings, or “food noise,” discuss metabolic labs and a structured plan with a clinician rather than relying on normal A1C alone.',
    ],
    evidence: [
      'ADA Standards of Care in Diabetes—2025 (prediabetes, lifestyle)',
      'Diabetes Prevention Program (NEJM 2002)',
      'Visceral adipose tissue and insulin resistance meta-analysis (Sci Rep)',
      'Dietary weight loss in insulin-resistant non-obese adults (PubMed 30497926)',
    ],
    related: [
      'insulin-resistance-without-diabetes',
      'normal-a1c-insulin-resistance',
      'medical-weight-loss-vs-dieting',
      'adhd-and-weight-loss-connection',
      'semaglutide-weight-loss-how-it-works',
    ],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  },
  {
    slug: 'insulin-resistance-without-diabetes',
    question: 'Can you have insulin resistance without diabetes?',
    shortAnswer:
      'Yes. Insulin resistance often exists for years while blood sugar still looks normal, because the pancreas compensates with higher insulin output. You do not need a diabetes diagnosis to have impaired insulin sensitivity or rising metabolic risk.',
    paragraphs: [
      'Prediabetes (elevated A1C or glucose) is one checkpoint, but compensatory hyperinsulinemia can precede those changes. Clinicians may use fasting glucose, A1C, lipids, waist circumference, and sometimes fasting insulin in context—not as a DIY diagnosis.',
    ],
    evidence: ['ADA Standards of Care 2025 (prediabetes definition)', 'DPP outcomes on insulin sensitivity with lifestyle'],
    related: ['what-is-insulin-resistance', 'normal-a1c-insulin-resistance', 'medical-weight-loss-vs-dieting'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'normal-a1c-insulin-resistance',
    question: 'Can you have insulin resistance with a normal A1C?',
    shortAnswer:
      'Yes. A1C reflects average blood glucose over roughly three months, not how hard your body works to keep glucose normal. Early insulin resistance is often hidden behind compensatory high insulin until A1C drifts into the prediabetes range.',
    paragraphs: [
      'Normal A1C does not rule out metabolic strain. Discuss symptoms (waist gain, post-meal fatigue, cravings), blood pressure, triglycerides, and whether additional labs are appropriate with your clinician.',
    ],
    evidence: ['ADA classification of prediabetes vs normoglycemia', 'Compensatory hyperinsulinemia literature'],
    related: ['what-is-insulin-resistance', 'insulin-resistance-without-diabetes'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'what-is-food-noise',
    question: 'What is food noise?',
    shortAnswer:
      'Food noise is persistent, intrusive thinking about food—planning meals, craving, or mental “background chatter” about eating—that can occur even when you are not physically hungry. It overlaps with hedonic eating and reward-circuit biology and is not the same as normal appetite.',
    paragraphs: [
      'Patients often describe food noise as exhausting mental loops about what to eat next, distinct from homeostatic hunger after true energy need.',
      'GLP-1 receptor agonists may reduce food preoccupation for some people, but response varies; behavioral support, sleep, ADHD-related impulsivity, and metabolic factors also matter.',
      'See our in-depth guide on food noise and GLP-1 for evidence, myths, and when to seek medical care.',
    ],
    evidence: [
      'STEP trial program (semaglutide 2.4 mg) appetite outcomes',
      'Narrative reviews on hedonic eating and GLP-1 (2024–2025)',
      'Patient-reported food noise surveys (EASD 2025, hypothesis-generating)',
    ],
    related: [
      'what-is-insulin-resistance',
      'glp-1-side-effects',
      'semaglutide-weight-loss-how-it-works',
      'adhd-and-weight-loss-connection',
    ],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  },
  {
    slug: 'why-am-i-tired-even-after-sleeping',
    question: 'Why am I tired even after sleeping?',
    shortAnswer:
      'Time in bed is not the same as restorative sleep. Common causes include obstructive sleep apnea, insomnia, poor sleep quality (fragmentation), ADHD-related circadian delay, depression, iron or B12 deficiency, thyroid disease, and medication effects—even when basic labs look normal. Fatigue (low energy) also differs from sleepiness (pressure to nap); describing both helps clinicians.',
    paragraphs: [
      'If you sleep enough hours but wake unrefreshed, ask about snoring, witnessed breathing pauses, morning headaches, and whether caffeine no longer helps. A sleep evaluation may be appropriate despite a “normal” routine.',
      'Daytime fatigue with normal hemoglobin does not rule out low ferritin or vitamin B12 deficiency, especially with heavy periods, GI issues, or plant-based diets. Thyroid testing is guided by symptoms and exam, not fatigue alone.',
      'See a clinician promptly for sudden severe fatigue, unintentional weight loss, fever, chest pain, shortness of breath, or thoughts of self-harm.',
    ],
    evidence: [
      'AASM obstructive sleep apnea indicator report (undiagnosed prevalence)',
      'Iron supplementation meta-analysis in non-anemic iron-deficient adults (PMID 29626044)',
      'NICE NG239 vitamin B12 deficiency in adults',
      'WHO ICD-11 burnout (QD85) occupational phenomenon',
    ],
    related: [
      'can-sleep-apnea-cause-fatigue',
      'signs-of-sleep-apnea-in-adults',
      'adhd-vs-burnout',
      'signs-of-adult-adhd',
      'what-is-insulin-resistance',
      'what-does-low-testosterone-feel-like',
    ],
    topic: 'telehealth',
    reviewerSlug: 'dr-natasha-desai',
    cornerstoneBlog: '/fatigue',
  },
  {
    slug: 'can-sleep-apnea-cause-fatigue',
    question: 'Can sleep apnea cause fatigue?',
    shortAnswer:
      'Yes. Obstructive sleep apnea fragments sleep with repeated breathing reductions and intermittent hypoxia, so you may feel exhausted or unrefreshed even after adequate time in bed. Fatigue (low energy) and sleepiness (pressure to nap) can both occur. Diagnosis requires clinical evaluation and sleep testing when indicated—not guessing from snoring alone.',
    paragraphs: [
      'OSA prevents normal deep and REM sleep architecture. Your body spends the night in micro-arousal and sympathetic activation, which drains next-day energy and cognition.',
      'Many patients report “brain fog,” exercise intolerance, or flat exhaustion without classic sleepiness. That is why sleep history matters when basic labs are normal.',
      'Treating OSA with CPAP, weight loss, or other clinician-directed therapies can improve fatigue in adherent users, but results depend on severity, comorbidities, and consistent treatment.',
    ],
    evidence: [
      'AASM obstructive sleep apnea screening and diagnostic testing guidelines',
      'Mark et al., OSA in adults, Am Fam Physician 2024',
      'Frontiers in Medicine 2024 meta-analysis: CPAP and metabolic syndrome in OSA',
    ],
    related: [
      'signs-of-sleep-apnea-in-adults',
      'why-am-i-tired-even-after-sleeping',
      'what-is-insulin-resistance',
      'testosterone-and-adhd-overlap',
    ],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
  },
  {
    slug: 'signs-of-sleep-apnea-in-adults',
    question: 'What are the signs of sleep apnea in adults?',
    shortAnswer:
      'Clues include habitual snoring, witnessed breathing pauses or gasping, unrefreshing sleep, daytime sleepiness or fatigue, morning headaches, nocturia, resistant hypertension, mood changes, reduced libido, erectile dysfunction, and concentration problems. Not everyone snores loudly—especially women. Diagnosis requires sleep testing when clinically appropriate.',
    paragraphs: [
      'Bed-partner observations are often more informative than self-report. Ask whether you stop breathing, choke, or snort awake.',
      'Cardiovascular red flags—hard-to-control blood pressure, atrial fibrillation, stroke history—raise pre-test probability per AASM high-risk screening frameworks.',
      'Screening tools such as STOP-BANG are useful to prompt evaluation but do not replace polysomnography or an appropriate home sleep apnea test ordered by a clinician.',
    ],
    evidence: [
      'AASM OSA Screening Health Advisory — HEARTS mnemonic for high-risk adult screening',
      'AASM Clinical Practice Guideline: Diagnostic Testing for Adult OSA',
      'Aurora RN, Quan SF, J Clin Sleep Med 2024 screening quality measure',
    ],
    related: [
      'can-sleep-apnea-cause-fatigue',
      'why-am-i-tired-even-after-sleeping',
      'what-does-low-testosterone-feel-like',
      'testosterone-and-adhd-overlap',
    ],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
  },
  {
    slug: 'poor-sleep-feels-like-adhd',
    question: 'Can poor sleep feel like ADHD?',
    metaDescription:
      'Poor sleep, sleep apnea, and sleep deprivation can mimic ADHD—brain fog, poor focus, and impulsivity. Learn how to tell sleep problems from ADHD and when to get evaluated.',
    shortAnswer:
      'Yes. Chronic poor sleep—especially fragmented sleep from insomnia or obstructive sleep apnea—commonly mimics ADHD: brain fog, irritability, forgetfulness, restless inner tension, and “why can’t I focus anymore” even when you are trying. Sleep deprivation alone impairs attention and executive function in research settings. That does not mean you have ADHD—but it does mean sleep should be evaluated before assuming a stimulant is the answer.',
    sections: [
      {
        id: 'detailed-explanation',
        heading: 'Detailed explanation',
        paragraphs: [
          'ADHD is a neurodevelopmental pattern of attention, impulse, and organization problems that usually trace back to childhood and show up across work, home, and relationships. Poor sleep is different: it is a reversible (treatable) driver of similar daytime symptoms when sleep quantity, quality, or timing is off.',
          'Experimental sleep-restriction studies show that even short periods of insufficient sleep produce measurable lapses in attention, slower processing, and more errors—effects that overlap with what patients describe as “ADHD-like” days. Obstructive sleep apnea adds fragmentation and intermittent hypoxia, so time in bed may look adequate while restorative sleep is not.',
          'Circadian delay (common in ADHD) and social jet lag can worsen both sleep and focus. Many adults have both ADHD and a sleep disorder; treating sleep alone rarely fixes lifelong executive dysfunction, but ignoring sleep can make ADHD care look like it “failed.”',
          'Online forums and patient communities often describe the same arc: “I thought I had ADHD, fixed my sleep apnea, and focus improved,” or “sleep study was normal but CBT-I helped brain fog.” Those stories are not diagnoses—but they highlight why clinicians screen sleep before labeling symptoms as purely ADHD.',
          'Quora and Reddit threads repeatedly ask whether “ADHD or sleep deprivation” explains lost focus after age 30, during perimenopause, or after night-shift work. In practice, both often need consideration until history, sleep testing, and structured ADHD evaluation rule one direction in or out.',
          'Google “People also ask” clusters mirror this: brain fog and poor sleep, whether sleep apnea causes concentration problems, and whether adults can develop ADHD suddenly. Sudden-onset attention problems still warrant sleep and medical review; true ADHD typically has earlier roots, though late recognition is common.',
        ],
      },
      {
        id: 'common-signs',
        heading: 'Common signs sleep—not ADHD—is driving symptoms',
        listItems: [
          'Focus crashed after a life phase of poor sleep (new baby, night shifts, insomnia) rather than a lifelong pattern since childhood.',
          'You sleep enough hours but wake unrefreshed; a partner reports snoring, gasping, or breathing pauses.',
          'Weekend catch-up sleep or vacation noticeably improves focus within days.',
          'Caffeine used to help and now barely works; you feel wired-tired or foggy.',
          'Irritability and impatience spike when sleep debt builds; organization falls apart mainly when exhausted.',
          'Restless legs, frequent awakenings, or long sleep latency dominate the story more than classic childhood hyperactivity.',
        ],
        paragraphs: [
          'Brain fog and poor sleep often travel together: concentration feels effortful, reading comprehension drops, and you re-read the same paragraph. That overlap is why “ADHD or sleep deprivation” is a common search—and why both deserve structured evaluation.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Book medical care promptly for chest pain, shortness of breath, suicidal thoughts, sudden severe fatigue, or witnessed apnea with choking. For non-urgent but persistent symptoms, a licensed clinician can map sleep history, ADHD screening, mood, and basic labs rather than guessing from quizzes.',
          'A practical sequence many clinicians use: (1) quantify sleep duration, timing, and quality; (2) screen for sleep apnea and insomnia; (3) use validated ADHD tools with a developmental history; (4) treat the primary driver—or both if comorbid. Telehealth can start this work; sleep testing and some labs may still need local coordination.',
          'If stimulants are considered while sleep apnea is untreated, sleep and cardiovascular risk should be addressed first. If sleep treatment improves focus substantially, you may still need ADHD care for lifelong executive patterns—but the priority order matters.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I know if I have ADHD or just bad sleep?',
        answer:
          'Clinicians compare timeline (lifelong vs sleep-related onset), sleep history (snoring, unrefreshing sleep, insomnia), and validated ADHD screening with childhood examples. A sleep evaluation may be appropriate even when you “sleep enough hours.” Many people have both.',
      },
      {
        question: "Why can't I focus anymore?",
        answer:
          'New or worsening focus can come from sleep debt, sleep apnea, depression, anxiety, thyroid disease, iron deficiency, medication effects, menopause, or ADHD. Sudden severe changes warrant prompt medical review; gradual changes still deserve structured evaluation—not only a stimulant trial.',
      },
      {
        question: 'Does sleep deprivation cause brain fog?',
        answer:
          'Yes. Sleep restriction and apnea-related fragmentation are well linked to slowed cognition, memory lapses, and subjective brain fog in clinical and experimental data.',
      },
      {
        question: 'Can treating sleep fix ADHD symptoms?',
        answer:
          'Treating sleep apnea, insomnia, or chronic restriction can improve attention for some people—sometimes dramatically. It does not rule out ADHD if childhood history and cross-setting impairment remain; both may need care.',
      },
      {
        question: 'Is poor sleep making my ADHD medication less effective?',
        answer:
          'Untreated sleep disorders can blunt perceived stimulant benefit and worsen anxiety or blood pressure effects. Optimizing sleep is part of responsible ADHD pharmacotherapy, not an optional extra. Tell your prescriber about snoring, unrefreshing sleep, or insomnia before dose increases.',
      },
      {
        question: 'Can lack of sleep mimic ADHD in adults?',
        answer:
          'Yes. Experimental and clinical literature show attention and executive-function impairment with sleep restriction and apnea-related fragmentation. Mimicry does not exclude true ADHD—many adults have both sleep and neurodevelopmental contributors.',
      },
    ],
    evidence: [
      'Van Dongen HPA et al. The cumulative cost of additional wakefulness. Sleep. 2003 (PMID 12683469)',
      'Killgore WDS. Effects of sleep deprivation on cognition. Prog Brain Res. 2010 (PMID 21075236)',
      'Cortese S et al. Sleep in children and adolescents with ADHD. Sleep Med Rev. 2013 (PMID 23932233)',
      'AASM Clinical Practice Guideline: Diagnostic Testing for Adult OSA (2017; updated screening advisories)',
      'Wajman JR et al. Association between OSA and ADHD symptoms in adults. J Clin Sleep Med. 2021 (PMID 33443341)',
      'CHADD: ADHD and sleep disorders (patient education crosswalk)',
    ],
    learnMore: [
      { href: '/adhd-care', label: 'ADHD evaluation & telehealth care' },
      {
        href: '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
        label: 'Sleep apnea, fatigue & metabolic risk (clinical guide)',
      },
      {
        href: '/fatigue',
        label: 'Fatigue: when tired stops being normal',
      },
      { href: '/telehealth', label: 'Telehealth & virtual care' },
    ],
    related: [
      'signs-of-adult-adhd',
      'adhd-vs-burnout',
      'why-am-i-tired-even-after-sleeping',
      'can-sleep-apnea-cause-fatigue',
      'signs-of-sleep-apnea-in-adults',
    ],
    topic: 'telehealth',
    aboutCondition: 'Sleep Disorders and Attention Deficit Hyperactivity Disorder',
    reviewerSlug: 'dr-natasha-desai',
    cornerstoneBlog: '/fatigue',
  },
  {
    slug: 'brain-fog-after-eating',
    question: 'Why do I get brain fog after eating?',
    metaDescription:
      'Brain fog after eating often links to blood sugar swings, insulin resistance, large or high-carb meals, poor sleep, and stress—not “just lunch.” Learn causes and when to seek evaluation.',
    shortAnswer:
      'Post-meal brain fog is common and usually multifactorial. Large or high-glycemic meals, reactive glucose swings, underlying insulin resistance, poor sleep, dehydration, and stress can all make you feel mentally slow, sleepy, or foggy within an hour of eating. It is not always diabetes—but persistent afternoon crashes, strong carb cravings, or “food noise” deserve a metabolic and sleep history with a licensed clinician, not guesswork from trending diets.',
    sections: [
      {
        id: 'why-it-happens',
        heading: 'Why it happens',
        paragraphs: [
          'After you eat, blood flow shifts toward digestion, hormones such as insulin rise, and parasympathetic tone increases—patterns that can feel like calm or drowsiness in some people, especially after a heavy lunch. That normal physiology is different from pathologic post-meal fog that happens daily and interferes with work.',
          'Glycemic variability—how far glucose rises and how quickly it falls—may affect energy and cognition more than a single fasting glucose number. Adults with insulin resistance often mount higher insulin responses to carbohydrates, which can precede overt prediabetes on A1C.',
          '“Food noise”—intrusive thoughts about eating—can drive grazing and larger meals, worsening the crash cycle. Treating metabolic health, sleep, and meal structure together usually beats blaming one food group without data.',
        ],
      },
      {
        id: 'common-causes',
        heading: 'Common causes',
        listItems: [
          'Large portion or high-glycemic load (refined carbs, sugary drinks, low protein/fiber).',
          'Skipped breakfast → oversized lunch → classic afternoon energy crash.',
          'Hidden insulin resistance or prediabetes (normal fasting glucose, symptoms still present).',
          'Reactive hypoglycemia symptoms in the hours after eating (clinician-guided testing clarifies).',
          'Poor sleep or untreated sleep apnea amplifying daytime slump after meals.',
          'Dehydration, alcohol at lunch, or sedating antihistamines/decongestants.',
          'Post-infectious fatigue, anemia, thyroid disease, depression, or high stress cortisol patterns.',
          'Rarely: postprandial hypotension, celiac disease, pancreatic insufficiency—needs directed workup.',
        ],
        paragraphs: [
          'Misconception: “tired after lunch means I need more coffee.” Caffeine masks sleep debt and glucose swings temporarily but can worsen afternoon anxiety or sleep that night.',
          'Misconception: “brain fog after eating is always gluten.” Only consider celiac or wheat allergy with appropriate testing and symptom patterns—not elimination alone.',
        ],
      },
      {
        id: 'insulin-resistance-blood-sugar',
        heading: 'Insulin resistance and blood sugar swings',
        paragraphs: [
          'Insulin resistance means cells need more insulin to manage the same glucose load. Compensatory hyperinsulinemia can occur while A1C still looks “normal,” especially in adults with central adiposity or strong family history.',
          'ADA Standards of Care emphasize screening for prediabetes in high-risk adults and lifestyle intervention (weight loss, activity, sleep) as first-line prevention—roughly 5–7% weight loss improves insulin sensitivity in many high-risk individuals (Diabetes Prevention Program).',
          'AACE and obesity-medicine frameworks treat glycemic variability, cravings, and post-meal symptoms as part of metabolic syndrome risk—not isolated annoyances. Continuous glucose monitors are tools for education in select patients; they do not replace medical diagnosis.',
          'GLP-1 therapies used for weight and diabetes can blunt post-meal glucose peaks and reduce food preoccupation for some patients, but they require clinician oversight, not cosmetic use.',
        ],
      },
      {
        id: 'sleep-stress',
        heading: 'Sleep and stress contribution',
        paragraphs: [
          'Sleep restriction alone impairs attention and reaction time in controlled studies—so a tired brain after lunch may be “sleep debt + meal,” not food alone. Obstructive sleep apnea adds fragmentation even when total hours seem adequate.',
          'Cortisol and autonomic stress from back-to-back meetings, caregiving, or anxiety can worsen perceived fog after eating because your nervous system is already taxed. Stress also pushes convenience carbs and larger portions.',
          'If you are mentally slow only on workdays after desk lunch, timing, light exposure, movement breaks, and meal composition experiments (protein/fiber first) are reasonable—but persistent symptoms still warrant labs and sleep screening.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Seek urgent care for chest pain, stroke symptoms, confusion with fever, or inability to stay awake while driving. Schedule non-urgent medical review if crashes are daily, you are losing weight unintentionally, thirst/urination increased, or fog worsens over weeks.',
          'Useful clinician discussion points: meal timing and composition; fasting glucose and A1C; lipids and blood pressure; sleep history (snoring, unrefreshing sleep); mood; medications; waist trend. Continuous monitoring or mixed-meal tests may be appropriate case-by-case.',
          'Telehealth can start metabolic and fatigue mapping; local labs and sleep testing may still be needed. Coordinate ADHD, sleep, and metabolic care when multiple guides in this cluster apply to you.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Brain fog after eating is often metabolic + behavioral + sleep—not one villain food.',
          'Protein, fiber, and smaller lunches reduce many post-meal crashes without extreme restriction.',
          'Insulin resistance can hide behind a normal A1C—symptoms still matter.',
          'Poor sleep and apnea magnify afternoon fatigue after meals.',
          'Persistent symptoms deserve labs and history, not only supplements or social media diets.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why do I get brain fog after eating?',
        answer:
          'Common drivers include large or high-glycemic meals, blood sugar peaks and drops, insulin resistance, dehydration, poor sleep, stress, and certain medications. Daily disabling fog warrants clinician review—not self-diagnosis.',
      },
      {
        question: 'Why am I tired after lunch?',
        answer:
          'Post-lunch sleepiness can be normal after a big meal, but daily crashes may reflect glucose variability, insulin resistance, sleep apnea, anemia, thyroid issues, or depression. Meal size, protein, fiber, and walk breaks often help; persistent symptoms need evaluation.',
      },
      {
        question: 'What is a post meal crash?',
        answer:
          'A post-meal crash is fatigue, fog, or sleepiness 30–120 minutes after eating, often after high-carb or large lunches. It overlaps with reactive glucose changes and insulin surges in susceptible people.',
      },
      {
        question: 'Can insulin resistance cause brain fog?',
        answer:
          'It can contribute. Compensatory high insulin and glycemic swings may pair with fatigue, cravings, and cognitive sluggishness, especially with central weight gain. Diagnosis and treatment are clinician-guided.',
      },
      {
        question: 'Is brain fog after eating a sign of diabetes?',
        answer:
          'Not always. It can occur with prediabetes, insulin resistance, or non-diabetic meal patterns. Increased thirst, urination, weight loss, or recurrent infections raise urgency for glucose testing.',
      },
      {
        question: 'Why am I sleepy after eating carbs?',
        answer:
          'Rapid carbohydrate absorption can spike insulin and shift autonomic balance toward rest-and-digest physiology. Pairing carbs with protein, fiber, and smaller portions often smooths the curve.',
      },
      {
        question: 'Can poor sleep make post-meal fatigue worse?',
        answer:
          'Yes. Sleep debt and sleep apnea lower daytime alertness, so lunch can feel like the tipping point even when the meal is only part of the story.',
      },
      {
        question: 'Does food noise relate to afternoon energy crashes?',
        answer:
          'Often. Intrusive food thoughts can lead to grazing and larger meals, worsening glucose swings. Metabolic care may address both cravings and post-meal symptoms when clinically appropriate.',
      },
      {
        question: 'When should I see a doctor for fatigue after eating?',
        answer:
          'See a clinician if symptoms are daily, worsening, paired with weight change or polyuria/polydipsia, or if you snore and wake unrefreshed. Urgent symptoms (chest pain, stroke signs, severe confusion) need emergency care.',
      },
    ],
    evidence: [
      'ADA Standards of Care in Diabetes—2025 (prediabetes screening, lifestyle therapy)',
      'Diabetes Prevention Program outcomes (NEJM 2002; PMID 12023865)',
      'O’Keefe JH et al. Meals and circadian clocks. J Am Coll Cardiol. 2014 (PMID 25225201)',
      'Sonnleitner A et al. Glycemic variability and cognitive function—systematic review themes',
      'Stanley S, Russell JT. Postprandial “crash” and orexin/hypocretin literature (PMID 17071468)',
      'AASM OSA and daytime sleepiness guidance',
      'AACE obesity and cardiometabolic clinical guidance (algorithm summaries)',
    ],
    learnMore: [
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
      { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Why am I tired after sleeping?' },
      { href: '/answers/poor-sleep-feels-like-adhd', label: 'Can poor sleep feel like ADHD?' },
      { href: '/answers/what-is-food-noise', label: 'What is food noise?' },
      {
        href: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
        label: 'Food noise & GLP-1 (cornerstone guide)',
      },
      {
        href: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
        label: 'Insulin resistance & weight loss (cornerstone guide)',
      },
      {
        href: '/fatigue',
        label: 'Fatigue: when tired stops being normal',
      },
      { href: '/weight-loss-metabolic-health', label: 'Medical weight loss & metabolic health' },
      { href: '/telehealth', label: 'Telehealth & virtual care' },
    ],
    related: [
      'what-is-insulin-resistance',
      'what-is-food-noise',
      'why-am-i-tired-even-after-sleeping',
      'poor-sleep-feels-like-adhd',
      'normal-a1c-insulin-resistance',
      'medical-weight-loss-vs-dieting',
    ],
    topic: 'weight-loss',
    hubCategories: ['metabolic', 'energy'],
    aboutCondition: 'Postprandial symptoms and insulin resistance',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  },
  {
    slug: 'what-is-free-testosterone',
    question: 'What is free testosterone?',
    shortAnswer:
      'Free testosterone is the small fraction of testosterone in your blood that is not bound to proteins—mainly sex hormone-binding globulin (SHBG) or albumin. It is biologically active and available to tissues. Total testosterone includes bound plus free; you can have normal total testosterone but low free testosterone when SHBG is high.',
    paragraphs: [
      'Most circulating testosterone is protein-bound. SHBG binds tightly; albumin binds loosely. Only free testosterone and the albumin-bound fraction are considered bioavailable.',
      'Guidelines recommend measuring or calculating free testosterone when total testosterone is borderline or when SHBG may be altered—obesity, aging, thyroid disease, liver disease, or certain medications. Avoid relying on inaccurate direct free-testosterone immunoassays; equilibrium dialysis or validated calculations are preferred.',
      'Symptoms such as low libido or fatigue require clinical context—sleep apnea, depression, and ADHD can mimic low testosterone even when labs look acceptable.',
    ],
    evidence: [
      'Endocrine Society hypogonadism guideline (2018)',
      'AUA testosterone deficiency guideline (reaffirmed 2024)',
      'Rosner et al., measuring testosterone position statement',
    ],
    related: [
      'what-does-low-testosterone-feel-like',
      'when-is-testosterone-therapy-appropriate',
      'testosterone-and-adhd-overlap',
      'trt-monitoring-requirements',
    ],
    topic: 'mens-health',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'what-does-low-testosterone-feel-like',
    question: 'What does low testosterone feel like?',
    shortAnswer:
      'Possible symptoms include low energy, reduced libido, depressed mood, decreased muscle mass, increased body fat, poor sleep, and difficulty concentrating—though these are nonspecific and overlap with sleep apnea, depression, thyroid disease, and ADHD. Diagnosis requires symptoms plus confirmatory morning labs.',
    paragraphs: [
      'Do not start testosterone based on online symptom quizzes alone.',
    ],
    evidence: ['Endocrine Society testosterone deficiency guidelines', 'FDA testosterone labeling'],
    related: ['what-is-free-testosterone', 'when-is-testosterone-therapy-appropriate', 'trt-monitoring-requirements', 'testosterone-and-adhd-overlap'],
    topic: 'mens-health',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'when-is-testosterone-therapy-appropriate',
    question: 'When is testosterone therapy appropriate?',
    shortAnswer:
      'TRT may be appropriate for men with consistent symptoms and repeatedly low morning testosterone on proper assays, after ruling out reversible causes—and when benefits outweigh risks (fertility, polycythemia, cardiovascular monitoring). It is not a universal anti-aging tool.',
    paragraphs: [
      'Treatment requires ongoing lab monitoring and shared decision-making.',
    ],
    evidence: ['Endocrine Society clinical practice guideline', 'FDA TRT risk communications'],
    related: ['what-is-free-testosterone', 'what-does-low-testosterone-feel-like', 'trt-monitoring-requirements'],
    topic: 'mens-health',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'trt-monitoring-requirements',
    question: 'What monitoring is required on testosterone therapy?',
    shortAnswer:
      'Typical monitoring includes baseline and follow-up testosterone levels, hematocrit/hemoglobin, PSA (age-appropriate), lipids, and symptom review. Frequency follows guideline-based schedules and individual risk.',
    paragraphs: [
      'Report chest pain, leg swelling, sleep apnea worsening, or mood changes promptly.',
    ],
    evidence: ['Endocrine Society monitoring tables', 'FDA class labeling for testosterone products'],
    related: ['when-is-testosterone-therapy-appropriate', 'what-does-low-testosterone-feel-like'],
    topic: 'mens-health',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'oral-vs-topical-minoxidil',
    question: 'Oral vs topical minoxidil: which is right?',
    shortAnswer:
      'Topical minoxidil is first-line for many patients due to localized action and established OTC/Rx formulations. Low-dose oral minoxidil may be considered off-label when topical fails or is impractical, with systemic blood pressure and heart rate monitoring.',
    paragraphs: [
      'Pregnancy and cardiovascular contraindications must be reviewed.',
    ],
    evidence: ['Peer-reviewed oral minoxidil dermatology literature', 'FDA topical formulations'],
    related: ['ed-telehealth-legitimate'],
    topic: 'mens-health',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'ed-telehealth-legitimate',
    question: 'Is telehealth for erectile dysfunction legitimate?',
    shortAnswer:
      'Yes when a licensed clinician takes history, reviews medications (especially nitrates), discusses cardiovascular risk, and prescribes appropriately via HIPAA-compliant platforms. Avoid anonymous pill mills with no follow-up.',
    paragraphs: [
      'ED can be an early marker for vascular disease—comprehensive care matters.',
    ],
    evidence: ['AUA telemedicine statements', 'FDA online pharmacy safety communications'],
    related: ['is-telehealth-legitimate'],
    topic: 'mens-health',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'testosterone-and-adhd-overlap',
    question: 'Can low testosterone mimic ADHD?',
    shortAnswer:
      'Low testosterone and ADHD can both cause fatigue, low motivation, and concentration problems. Labs and developmental history help separate them; some men have both. Treat the correct diagnosis—or both under coordinated care.',
    paragraphs: [
      'Stimulants and TRT each carry monitoring requirements; do not combine without medical oversight.',
    ],
    evidence: ['Endocrine Society differential diagnosis guidance', 'ADHD adult evaluation standards'],
    related: [
      'can-sleep-apnea-cause-fatigue',
      'signs-of-sleep-apnea-in-adults',
      'what-is-free-testosterone',
      'what-does-low-testosterone-feel-like',
      'signs-of-adult-adhd',
    ],
    topic: 'mens-health',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'how-online-prescriptions-work',
    question: 'How do online prescriptions work legally?',
    shortAnswer:
      'A licensed clinician in your state evaluates you via telehealth, documents the visit, and sends prescriptions electronically to a pharmacy when clinically appropriate. Controlled substances have additional ID verification, PDMP checks, and follow-up rules.',
    paragraphs: [
      'Prescriptions without a patient relationship violate medical practice standards.',
    ],
    evidence: ['State medical practice acts', 'DEA telemedicine prescribing rules'],
    related: ['is-telehealth-legitimate', 'can-you-get-adhd-medication-online'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'is-telehealth-legitimate',
    question: 'Is telehealth legitimate for medical care?',
    shortAnswer:
      'Legitimate telehealth uses licensed clinicians, HIPAA-compliant video or async tools where permitted, informed consent, and continuity of care—not anonymous chatbots selling controlled drugs.',
    paragraphs: [
      'Some conditions still require in-person exam or emergency department care.',
    ],
    evidence: ['HHS telehealth best practices', 'State telehealth parity laws — coverage and practice rules vary by state'],
    related: ['how-online-prescriptions-work', 'meet-and-greet-telehealth-expectations'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'telehealth-adhd-california',
    question: 'How does ADHD telehealth work in California?',
    shortAnswer:
      'California residents may receive adult ADHD evaluation and follow-up via telehealth when treated by a clinician licensed in California, using secure video, validated tools, and documented visits. Siya Health Medical Director Dr. Sneh Pandey is licensed in CA among other states.',
    paragraphs: [
      'Instant stimulant promises remain a red flag regardless of state.',
    ],
    evidence: ['California Medical Board telehealth guidance', 'Siya Health state licensure disclosures'],
    related: ['can-adhd-be-diagnosed-online', 'telehealth-adhd-texas', 'how-much-does-adhd-testing-cost'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'telehealth-adhd-texas',
    question: 'How does ADHD telehealth work in Texas?',
    shortAnswer:
      'Texas adults can complete structured ADHD telehealth evaluations with Texas-licensed clinicians, including history, standardized assessments, and follow-up when indicated. Controlled medication rules apply with monitoring and PDMP review.',
    paragraphs: [
      'Transparent $149 evaluation pricing is published at Siya Health for eligible patients.',
    ],
    evidence: ['Texas Medical Board telemedicine rules', 'Texas PDMP requirements'],
    related: ['telehealth-adhd-california', 'can-you-get-adhd-medication-online'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'fsa-hsa-adhd-evaluation',
    question: 'Can you use FSA or HSA for ADHD evaluation?',
    shortAnswer:
      'Many patients use FSA/HSA debit cards for qualified medical expenses including physician telehealth visits when documented as medical care. Confirm with your plan administrator; Siya Health provides receipts for eligible services.',
    paragraphs: [
      'Not all membership or coaching fees qualify—clinical evaluation charges typically do.',
    ],
    evidence: ['IRS Publication 502 (medical expense overview)', 'Plan administrator policies'],
    related: ['how-much-does-adhd-testing-cost', 'what-included-199-adhd-evaluation'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'what-included-199-adhd-evaluation',
    question: 'What is included in a Siya Health ADHD evaluation?',
    shortAnswer:
      'Siya Health’s {{pricing.initialEvaluation}} adult ADHD evaluation is a 60–90 minute telehealth visit with a licensed medical provider—including clinical interview, validated assessment tools as clinically appropriate (such as ASRS, DIVA, Wender Utah, SWAN, or Creyos when indicated), comorbidity screening, and a documented plan. No insurance required. Diagnosis does not guarantee medication.',
    paragraphs: [
      'Your clinician selects assessment tools based on clinical judgment—not every patient receives every instrument. Optional follow-up plans start at {{pricing.nonControlledFollowUp}}/month for non-controlled medications, or {{pricing.controlledFollowUp}}/month for controlled-medication follow-up when clinically appropriate. See /pricing for the current fee schedule.',
    ],
    evidence: ['Siya Health /adhd-care service description', 'Published pricing at /pricing'],
    related: ['how-much-does-adhd-testing-cost', 'how-long-adhd-evaluation', 'screening-vs-adhd-evaluation'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'meet-and-greet-telehealth-expectations',
    question: 'What should I expect from a first telehealth visit?',
    shortAnswer:
      'A first telehealth visit is a low-pressure introduction to confirm service fit, review services and follow-up plan pricing, and answer logistics—not a full diagnosis visit. You can ask about evaluation length, state licensure, and next steps before committing to a comprehensive ADHD assessment.',
    paragraphs: [
      'Emergency symptoms require 911 or local urgent care, not a scheduling slot for introductory logistics.',
    ],
    evidence: ['Siya Health intake workflow', 'Telehealth informed consent standards'],
    related: ['is-telehealth-legitimate', 'can-adhd-be-diagnosed-online'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
];

export const ANSWER_SEEDS = [...mergePhase5Seeds(CORE_ANSWER_SEEDS), ...PHASE3_ANSWER_SEEDS];

/**
 * Hand-maintained Health Guides that exist as HTML but are not in ANSWER_SEEDS.
 * Do not delete these files. Prefer promoting them into seeds before regenerating answers.
 * - afternoon-energy-crash-after-lunch
 * - food-noise-returned-on-glp-1
 * - high-shbg-low-free-testosterone
 * - weight-gain-after-stopping-ozempic
 * - why-normal-labs-dont-mean-healthy
 */
export const HAND_MAINTAINED_ANSWER_SLUGS = [
  'afternoon-energy-crash-after-lunch',
  'food-noise-returned-on-glp-1',
  'high-shbg-low-free-testosterone',
  'weight-gain-after-stopping-ozempic',
  'why-normal-labs-dont-mean-healthy',
];

export const TOPIC_HUBS = {
  adhd: { label: 'ADHD', url: '/blog/adhd', care: '/adhd-care' },
  'weight-loss': { label: 'Weight loss', url: '/blog/weight-loss', care: '/weight-loss-metabolic-health' },
  'mens-health': { label: "Men's health", url: '/mens-health-longevity', care: '/mens-health-longevity' },
  telehealth: { label: 'Telehealth', url: '/blog/telehealth', care: '/telehealth' },
};
