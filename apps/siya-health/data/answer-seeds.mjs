/**
 * 50 AI citation answer seeds — one question per page.
 * Run: node scripts/generate-answer-pages.mjs
 */
export const ANSWER_SEEDS = [
  {
    slug: 'signs-of-adult-adhd',
    question: 'What are the signs of adult ADHD?',
    shortAnswer:
      'Adult ADHD often shows up as chronic difficulty sustaining focus, disorganization, forgetfulness, time blindness, trouble finishing tasks, inner restlessness, and emotional sensitivity—not just hyperactivity. Symptoms must cause real impairment and usually trace back to childhood patterns, though many adults were never diagnosed.',
    paragraphs: [
      'Clinicians look for persistent inattention, impulsivity, and/or hyperactivity that interferes with work, relationships, or daily life. In adults, inattentive presentation is common: mental fog, losing track of conversations, missed deadlines, and piles of unfinished projects.',
      'Many high-functioning adults compensate with anxiety, long hours, or rigid routines until burnout hits. That is why ADHD is frequently missed in people who appear successful on paper.',
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
    slug: 'adhd-in-men',
    question: 'How does adult ADHD present in men?',
    shortAnswer:
      'Men may show more external restlessness, impulsivity, or risk-taking—but many men have primarily inattentive ADHD that looks like laziness or underperformance. Relationship strain, job hopping, and substance use histories are common reasons men seek evaluation.',
    paragraphs: [
      'Clinicians still rule out sleep, mood, and medical mimics regardless of gender presentation.',
    ],
    evidence: ['Epidemiologic ADHD sex ratio literature', 'NIMH adult ADHD overview'],
    related: ['signs-of-adult-adhd', 'high-functioning-adhd'],
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
      'Costs vary widely: some clinics charge $500–$2,000+; Siya Health offers a transparent $199 comprehensive adult ADHD evaluation (60–90 minutes) including clinical interview and standardized tools when clinically indicated. Always confirm what is included before booking.',
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
    evidence: ['FDA prescribing information (medication guides)', 'Adult ADHD treatment guidelines'],
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
    evidence: ['Long-term stimulant safety literature (population studies)', 'ADHD treatment guideline monitoring schedules'],
    related: ['adhd-medication-side-effects', 'starting-adhd-medication-adults'],
    topic: 'adhd',
    reviewerSlug: 'dr-swati-pandey',
  },
  {
    slug: 'non-stimulant-adhd-medications',
    question: 'What non-stimulant ADHD medications exist for adults?',
    shortAnswer:
      'Options may include atomoxetine, viloxazine, guanfacine XR, clonidine XR, and bupropion (off-label in some cases)—depending on comorbidities and prescriber judgment. Non-stimulants can help when stimulants are contraindicated or poorly tolerated.',
    paragraphs: [
      'Onset is often slower than stimulants; patience and follow-up matter.',
    ],
    evidence: ['FDA-approved non-stimulant ADHD agents', 'Clinical practice parameters'],
    related: ['adderall-vs-vyvanse-adults', 'starting-adhd-medication-adults'],
    topic: 'adhd',
    reviewerSlug: 'dr-swati-pandey',
  },
  {
    slug: 'starting-adhd-medication-adults',
    question: 'What should adults expect when starting ADHD medication?',
    shortAnswer:
      'Expect a gradual titration plan, clear follow-up dates, baseline vitals when indicated, and honest discussion of goals (work hours, driving, sleep). Improvement should be tracked with structured check-ins—not guessed from social media timelines.',
    paragraphs: [
      'Controlled substances require ID verification, prescription monitoring, and pharmacy coordination per state law.',
    ],
    evidence: ['Prescriber monitoring norms for stimulants', 'State PDMP requirements'],
    related: ['adhd-medication-side-effects', 'can-you-get-adhd-medication-online'],
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
      'Screeners cannot rule out anxiety, sleep disorders, or medical mimics.',
    ],
    evidence: ['WHO ASRS v1.1 instrument documentation'],
    related: ['screening-vs-adhd-evaluation', 'signs-of-adult-adhd'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'creyos-adhd-testing-explained',
    question: 'What is Creyos cognitive testing for ADHD?',
    shortAnswer:
      'Creyos is a digital cognitive assessment battery sometimes used alongside clinical interview and rating scales. It provides objective performance data but does not alone diagnose ADHD—diagnosis requires DSM criteria and clinician judgment.',
    paragraphs: [
      'At Siya Health, Creyos may be incorporated into the evaluation package when clinically appropriate.',
    ],
    evidence: ['Creyos validated cognitive task library', 'ADHD diagnostic standard: multi-method assessment'],
    related: ['screening-vs-adhd-evaluation', 'what-included-199-adhd-evaluation'],
    topic: 'adhd',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'screening-vs-adhd-evaluation',
    question: 'What is the difference between ADHD screening and a full evaluation?',
    shortAnswer:
      'Screening (e.g., ASRS, short online quizzes) estimates likelihood and takes minutes. A full evaluation is a 60–90 minute clinician visit with history, standardized tools, safety screening, and a written plan—required for formal diagnosis and prescribing when appropriate.',
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
    related: ['glp-1-nausea-management', 'semaglutide-weight-loss-how-it-works', 'who-qualifies-glp-1-weight-loss'],
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
    evidence: ['STEP trial program publications (semaglutide 2.4 mg)', 'FDA Wegovy/Ozempic labeling'],
    related: ['glp-1-side-effects', 'tirzepatide-vs-semaglutide'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'tirzepatide-vs-semaglutide',
    question: 'Tirzepatide vs semaglutide: which is better for weight loss?',
    shortAnswer:
      'Both are prescription GLP-1–based therapies with strong trial data in eligible adults. Tirzepatide (dual GIP/GLP-1 agonist) showed greater average weight loss in some head-to-head trials, but individual response, side effects, cost, and insurance coverage vary. A clinician personalizes choice—there is no universal winner.',
    paragraphs: [
      'Monitoring includes GI tolerance, gallbladder symptoms, and metabolic labs as indicated.',
    ],
    evidence: ['SURMOUNT and STEP trial publications', 'FDA Mounjaro/Zepbound and Wegovy labels'],
    related: ['glp-1-side-effects', 'compounded-vs-branded-glp-1'],
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
    slug: 'phentermine-weight-loss-safety',
    question: 'Is phentermine safe for weight loss?',
    shortAnswer:
      'Phentermine is an FDA-approved short-term appetite suppressant for select patients when benefits outweigh risks. It is contraindicated in many cardiovascular, hyperthyroid, and medication-interaction scenarios. Monitoring blood pressure, heart rate, mood, and sleep is essential.',
    paragraphs: [
      'It is not a first-line substitute for comprehensive obesity care in all patients.',
    ],
    evidence: ['FDA phentermine labeling', 'Obesity medicine society practice guidance'],
    related: ['medical-weight-loss-vs-dieting', 'who-qualifies-glp-1-weight-loss'],
    topic: 'weight-loss',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'oral-vs-injectable-weight-loss-meds',
    question: 'Oral vs injectable weight loss medications: pros and cons?',
    shortAnswer:
      'Injectables (weekly GLP-1 agents) dominate recent trial outcomes but require needles and titration. Oral options (where available) may suit needle-averse patients but have different absorption, dosing schedules, and side-effect profiles. Adherence and insurance often drive the practical choice.',
    paragraphs: [
      'Lifestyle, coaching, and mental-health support remain foundations regardless of format.',
    ],
    evidence: ['Oral semaglutide (Rybelsus) vs injectable PK literature', 'Adherence studies in obesity pharmacotherapy'],
    related: ['semaglutide-weight-loss-how-it-works', 'glp-1-side-effects'],
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
    related: ['glp-1-side-effects', 'semaglutide-weight-loss-how-it-works'],
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
    related: ['glp-1-side-effects', 'compounded-vs-branded-glp-1'],
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
    related: ['medical-weight-loss-vs-dieting', 'signs-of-adult-adhd'],
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
      'glp-1-side-effects',
      'semaglutide-weight-loss-how-it-works',
      'what-is-insulin-resistance',
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
      'adhd-vs-burnout',
      'signs-of-adult-adhd',
      'what-is-insulin-resistance',
      'what-does-low-testosterone-feel-like',
    ],
    topic: 'telehealth',
    reviewerSlug: 'dr-natasha-desai',
    cornerstoneBlog: '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
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
    slug: 'sildenafil-erectile-dysfunction-expectations',
    question: 'What should you expect from sildenafil for erectile dysfunction?',
    shortAnswer:
      'Sildenafil improves erectile response when sexual stimulation is present; it is not an automatic aphrodisiac. Onset is typically 30–60 minutes. Contraindicated with nitrates and requires cardiovascular review. Common side effects: headache, flushing, nasal congestion.',
    paragraphs: [
      'Telehealth can initiate ED care when clinically appropriate after history and medication review.',
    ],
    evidence: ['FDA sildenafil prescribing information', 'AUA ED guideline excerpts'],
    related: ['ed-telehealth-legitimate', 'what-does-low-testosterone-feel-like'],
    topic: 'mens-health',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'minoxidil-hair-loss-does-it-work',
    question: 'Does minoxidil work for hair loss?',
    shortAnswer:
      'Topical minoxidil is FDA-approved for androgenetic alopecia in men and women and slows loss or regrows hair in many users after 3–6+ months of consistent use. Stopping usually reverses gains. Oral minoxidil is off-label in some cases and carries different side-effect risks.',
    paragraphs: [
      'Evaluate thyroid, iron, and medication causes of shedding before blaming genetics alone.',
    ],
    evidence: ['FDA minoxidil labeling', 'Dermatology society alopecia guidance'],
    related: ['oral-vs-topical-minoxidil', 'ed-telehealth-legitimate'],
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
    related: ['minoxidil-hair-loss-does-it-work'],
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
    related: ['sildenafil-erectile-dysfunction-expectations', 'is-telehealth-legitimate'],
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
    related: ['what-is-free-testosterone', 'what-does-low-testosterone-feel-like', 'signs-of-adult-adhd'],
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
    evidence: ['HHS telehealth best practices', 'State telehealth parity laws (varies)'],
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
      'Transparent $199 evaluation pricing is published at Siya Health for eligible patients.',
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
    question: 'What is included in Siya Health’s $199 ADHD evaluation?',
    shortAnswer:
      'Siya Health’s $199 adult ADHD evaluation is a 60–90 minute telehealth visit with a board-certified, ADHD-CCSP–trained clinician—including clinical interview, standardized tools (such as ASRS and Creyos when indicated), comorbidity screening, and a personalized treatment plan. No insurance required.',
    paragraphs: [
      'Ongoing medication management is separate membership pricing if you continue care.',
    ],
    evidence: ['Siya Health /adhd-care service description', 'Published pricing at /membership-pricing'],
    related: ['how-much-does-adhd-testing-cost', 'how-long-adhd-evaluation', 'screening-vs-adhd-evaluation'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
  {
    slug: 'meet-and-greet-telehealth-expectations',
    question: 'What happens in a telehealth Meet & Greet?',
    shortAnswer:
      'A Meet & Greet is a low-pressure introduction to confirm telehealth fit, review services and pricing, and answer logistics—not a full diagnosis visit. You can ask about evaluation length, state licensure, and next steps before committing to a comprehensive ADHD assessment.',
    paragraphs: [
      'Emergency symptoms require 911 or local urgent care, not a meet-and-greet slot.',
    ],
    evidence: ['Siya Health intake workflow', 'Telehealth informed consent standards'],
    related: ['is-telehealth-legitimate', 'can-adhd-be-diagnosed-online'],
    topic: 'telehealth',
    reviewerSlug: 'dr-sneh-pandey',
  },
];

export const TOPIC_HUBS = {
  adhd: { label: 'ADHD', url: '/blog/adhd', care: '/adhd-care' },
  'weight-loss': { label: 'Weight loss', url: '/blog/weight-loss', care: '/weight-loss-metabolic-health' },
  'mens-health': { label: "Men's health", url: '/mens-health-longevity', care: '/mens-health-longevity' },
  telehealth: { label: 'Telehealth', url: '/blog/telehealth', care: '/telehealth' },
};
