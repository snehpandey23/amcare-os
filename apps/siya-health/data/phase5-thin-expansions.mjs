/**
 * Phase 5 — Thin Health Guide expansions (500–900 words).
 * Merged into CORE_ANSWER_SEEDS by slug; no new URLs.
 */
export const PHASE5_EXPANSION_SLUGS = [
  'adhd-vs-burnout',
  'adhd-vs-anxiety',
  'starting-adhd-medication-adults',
  'glp-1-side-effects',
  'semaglutide-weight-loss-how-it-works',
  'what-is-insulin-resistance',
  'normal-a1c-insulin-resistance',
  'what-is-food-noise',
  'what-is-free-testosterone',
  'when-is-testosterone-therapy-appropriate',
  'trt-monitoring-requirements',
  'is-telehealth-legitimate',
  'meet-and-greet-telehealth-expectations',
  'how-online-prescriptions-work',
  'can-adhd-be-diagnosed-online',
  'insulin-resistance-without-diabetes',
  'signs-of-adult-adhd',
  'can-adhd-cause-anxiety',
  'is-online-adhd-diagnosis-legitimate',
];

/** Word counts before Phase 5 (seed text only) */
export const PHASE5_BEFORE_WORD_COUNTS = {
  'adhd-vs-burnout': 65,
  'adhd-vs-anxiety': 63,
  'starting-adhd-medication-adults': 46,
  'glp-1-side-effects': 53,
  'semaglutide-weight-loss-how-it-works': 45,
  'what-is-insulin-resistance': 169,
  'normal-a1c-insulin-resistance': 64,
  'what-is-food-noise': 104,
  'what-is-free-testosterone': 135,
  'when-is-testosterone-therapy-appropriate': 45,
  'trt-monitoring-requirements': 34,
  'is-telehealth-legitimate': 33,
  'meet-and-greet-telehealth-expectations': 53,
  'how-online-prescriptions-work': 43,
  'can-adhd-be-diagnosed-online': 67,
  'insulin-resistance-without-diabetes': 71,
  'signs-of-adult-adhd': 130,
  'can-adhd-cause-anxiety': 93,
  'is-online-adhd-diagnosis-legitimate': 41,
};

export const PHASE5_ANSWER_SEEDS = [
  {
    slug: 'adhd-vs-burnout',
    metaDescription:
      'ADHD vs burnout: timeline, rest response, and when focus problems need evaluation. Learn how clinicians tell lifelong ADHD from job-linked exhaustion.',
    shortAnswer:
      'Burnout is usually tied to prolonged occupational or caregiving stress and often improves with rest, boundaries, therapy, or role changes. ADHD is a lifelong neurodevelopmental pattern of attention, organization, and impulse regulation that shows up across settings—not only at work. They overlap frequently: many undiagnosed adults burn out from years of compensating for ADHD. A licensed clinician uses developmental history, symptom timeline, sleep screening, and validated tools—not a single stressful quarter alone.',
    sections: [
      {
        id: 'how-they-differ',
        heading: 'How ADHD and burnout differ clinically',
        paragraphs: [
          'Burnout (WHO ICD-11 occupational phenomenon) centers on exhaustion, cynicism, and reduced professional efficacy after sustained stress. Rest, vacation, or reduced workload often brings partial relief—even if recovery takes months.',
          'Adult ADHD symptoms typically trace to childhood or adolescence, persist in hobbies and relationships, and are not fully explained by one bad project. Inattentive presentation—disorganization, time blindness, unfinished tasks—is common in adults who look “fine” on paper until capacity collapses.',
          'Depression and anxiety can mimic both. Sleep apnea, thyroid disease, iron deficiency, and perimenopause also belong on the differential. Structured evaluation separates primary drivers rather than labeling everything “stress.”',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “If I just take a vacation, ADHD will go away.” Reality: ADHD patterns usually return when structure returns; burnout may improve more clearly with rest.',
          'Myth: “Burnout means I cannot have ADHD.” Reality: Compensation collapse after burnout is a common path to late ADHD diagnosis.',
          'Myth: “High achievers cannot have ADHD.” Reality: High-functioning compensation often hides ADHD until burnout exposes the gap.',
          'Myth: “Stimulants fix burnout.” Reality: Stimulants treat ADHD when diagnosed; they are not a substitute for sleep, boundaries, or treating depression.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Seek urgent care for suicidal thoughts, chest pain, or inability to function safely. Schedule non-urgent ADHD evaluation if focus, organization, or impulsivity problems span years—not only one job—and impair work, relationships, or self-care.',
          'Bring a childhood symptom timeline (school reports, parent recall), sleep history (snoring, unrefreshing sleep), and mood screening answers. Telehealth can start evaluation in eligible states; sleep testing may still need local coordination.',
          'If rest clearly fixes symptoms within days repeatedly, prioritize sleep and burnout recovery first—but return for ADHD assessment if lifelong patterns remain.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Timeline and cross-setting symptoms separate many ADHD cases from pure burnout.',
          'Sleep apnea and mood disorders are common mimics—screen before assuming stimulants.',
          'Many adults need both burnout recovery and ADHD treatment when both are present.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is it ADHD or burnout?',
        answer:
          'Clinicians compare whether attention problems are lifelong and cross-context (ADHD) versus tied to prolonged stress with partial recovery after rest (burnout). Many adults have both; evaluation clarifies priorities.',
      },
      {
        question: 'Can burnout cause ADHD-like symptoms?',
        answer:
          'Severe chronic stress can impair focus, memory, and motivation. Unlike ADHD, those symptoms often improve with meaningful rest and boundary changes—though undiagnosed ADHD may surface when compensation fails.',
      },
      {
        question: 'Do I need ADHD testing after burnout?',
        answer:
          'Reasonable when childhood history, daily executive dysfunction, or family ADHD patterns are present—even if burnout triggered the crisis. Screening alone is not diagnosis.',
      },
      {
        question: 'Can telehealth evaluate ADHD vs burnout?',
        answer:
          'Yes in eligible states with a full clinician interview, not a five-minute quiz. Sleep and mood screening are part of responsible care.',
      },
      {
        question: 'Will ADHD medication help burnout?',
        answer:
          'Medication may help confirmed ADHD symptoms but does not replace therapy, sleep treatment, or workplace changes for burnout. Prescribing requires diagnosis and monitoring.',
      },
    ],
    evidence: [
      'WHO ICD-11 burnout (QD85) occupational context',
      'DSM-5-TR ADHD criteria in adults',
      'CHADD: late diagnosis and occupational impairment themes',
      'NIMH adult ADHD overview',
    ],
    learnMore: [
      { href: '/adhd-care', label: 'ADHD evaluation & telehealth care' },
      { href: '/adhd-care', label: 'Adult ADHD evaluation' },
      { href: '/fatigue', label: 'Fatigue: when tired stops being normal' },
      { href: '/answers/poor-sleep-feels-like-adhd', label: 'Can poor sleep feel like ADHD?' },
      { href: '/telehealth', label: 'Telehealth & virtual care' },
    ],
    related: ['late-adhd-diagnosis-adults', 'high-functioning-adhd', 'signs-of-adult-adhd', 'adhd-vs-anxiety', 'why-am-i-tired-even-after-sleeping'],
  },
  {
    slug: 'adhd-vs-anxiety',
    metaDescription:
      'ADHD vs anxiety: how clinicians tell chronic attention problems from worry-driven distraction. Screening, overlap, and when to seek evaluation.',
    shortAnswer:
      'Anxiety often shows as situational worry, physical tension, and avoidance tied to feared outcomes. ADHD is a chronic pattern of attention regulation, organization, time blindness, and impulse-control problems that usually began in childhood and appear across work, home, and relationships. Many adults have both—only a licensed clinician can map primary vs secondary drivers using developmental history, validated screeners, and mood assessment.',
    sections: [
      {
        id: 'clinical-differences',
        heading: 'Clinical differences clinicians look for',
        paragraphs: [
          'Anxiety-driven distraction often spikes before deadlines, social events, or health worries and may improve when the stressor resolves. ADHD inattention is more persistent: losing track in casual conversation, chronic lateness, piles of unfinished projects, and “knowing what to do but cannot start.”',
          'Physical anxiety symptoms—racing heart, GI upset, panic—point toward anxiety disorders. Inner restlessness in ADHD may be present without discrete panic attacks.',
          'Stimulant medications can help ADHD when appropriate but may worsen anxiety in some patients—another reason prescribing follows full evaluation, not online quizzes alone.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Anxiety always comes first.” Reality: Untreated ADHD commonly fuels secondary anxiety from chronic overwhelm.',
          'Myth: “A high ASRS score proves ADHD.” Reality: ASRS is screening only; anxiety and sleep disorders can elevate scores.',
          'Myth: “If I am calm, I cannot have ADHD.” Reality: Inattentive ADHD often lacks obvious hyperactivity.',
          'Myth: “Therapy alone fixes ADHD.” Reality: Therapy helps skills; medication may be appropriate when ADHD is confirmed.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Seek emergency care for panic with chest pain, suicidal thoughts, or severe functional collapse. Schedule structured ADHD and anxiety screening when symptoms impair work or relationships for months.',
          'Bring examples from childhood (report cards, parental recall), current sleep history, and substance use. Coordinate care if both ADHD and generalized anxiety disorder are present—treatment order matters.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Context and timeline beat single-symptom guessing.',
          'ADHD and anxiety frequently co-occur—plan for both when needed.',
          'Sleep apnea and thyroid disease still belong on the differential.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do you tell ADHD apart from anxiety?',
        answer:
          'Clinicians compare lifelong cross-setting executive dysfunction (ADHD) with worry-linked spikes and physical anxiety symptoms. Developmental history and validated tools support diagnosis—not self-assessment alone.',
      },
      {
        question: 'Can anxiety look like ADHD?',
        answer:
          'Yes. Rumination, avoidance, and sleep loss impair focus. Differentiating requires structured interview and sometimes treating anxiety first to see what remains.',
      },
      {
        question: 'Can ADHD cause anxiety?',
        answer:
          'Untreated ADHD often leads to secondary anxiety from chronic overwhelm, shame, and missed deadlines. Some patients have independent anxiety disorders as well.',
      },
      {
        question: 'Do I need medication for ADHD if I have anxiety?',
        answer:
          'Only after clinician assessment. Non-stimulants, therapy, and sleep optimization may be first steps; stimulants require monitoring when used.',
      },
      {
        question: 'Is online ADHD screening enough?',
        answer:
          'No. Screening estimates likelihood; diagnosis requires clinician judgment, safety review, and rule-out of mimics.',
      },
    ],
    evidence: ['DSM-5-TR differential diagnosis principles', 'ASRS v1.1 (screening instrument)', 'NIMH comorbidity research themes', 'ADHD-CCSP evaluation standards'],
    learnMore: [
      { href: '/adhd-care', label: 'ADHD care & evaluation' },
      { href: '/adhd-screening', label: 'Free ADHD screening (ASRS)' },
      { href: '/blog/how-to-know-if-you-have-adhd-adult', label: 'Adult ADHD signs (cornerstone blog)' },
      { href: '/answers/can-adhd-cause-anxiety', label: 'Can ADHD cause anxiety?' },
      { href: '/telehealth', label: 'Telehealth services' },
    ],
    related: ['can-adhd-cause-anxiety', 'signs-of-adult-adhd', 'asrs-adhd-screening-explained', 'poor-sleep-feels-like-adhd'],
  },
  {
    slug: 'starting-adhd-medication-adults',
    metaDescription:
      'Starting ADHD medication as an adult: titration, follow-up, vitals, and realistic expectations. Educational guide—not personal prescribing advice.',
    shortAnswer:
      'Adults starting ADHD medication should expect a structured titration plan, baseline vitals when indicated, clear follow-up dates, and honest goal-setting (work performance, driving safety, sleep, relationships). Improvement is tracked with rating scales and visit notes—not social media timelines. Controlled stimulants require identity verification, prescription drug monitoring program (PDMP) checks where mandated, and pharmacy coordination per state and federal rules.',
    sections: [
      {
        id: 'what-to-expect',
        heading: 'What to expect in the first weeks',
        paragraphs: [
          'Many clinicians start low and adjust based on benefit and side effects—appetite suppression, insomnia, irritability, or blood pressure changes are common discussion points. Take medication exactly as prescribed; do not share doses or combine with unapproved supplements marketed as “focus stacks.”',
          'Sleep hygiene matters: treating sleep apnea or chronic insomnia often improves perceived medication response. Document focus, task completion, and side effects in a simple weekly log for follow-up.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “The highest dose works best.” Reality: Lowest effective dose reduces risk.',
          'Myth: “Weekend skipping is always fine.” Reality: Unpredictable stimulant holidays can cause rebound; follow your prescriber’s plan.',
          'Myth: “Medication replaces skills.” Reality: Coaching, calendars, and therapy still matter.',
          'Myth: “Online pharmacies without visits are normal.” Reality: Legitimate care requires documented clinician relationships.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek urgent vs routine care',
        paragraphs: [
          'Seek emergency care for chest pain, fainting, severe shortness of breath, or suicidal thoughts. Contact your prescriber promptly for new palpitations, sustained insomnia, mood destabilization, or allergic reactions.',
          'Routine follow-up typically occurs every few weeks early in treatment, then periodically for refills and monitoring per guideline-based schedules.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Diagnosis precedes pharmacotherapy—not the reverse.',
          'Monitoring is ongoing, not one-and-done.',
          'Telehealth follow-up is legitimate when licensure and documentation standards are met.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What should adults expect when starting ADHD medication?',
        answer:
          'Expect gradual titration, side-effect counseling, vitals when indicated, and structured follow-up. Response varies; there is no guaranteed timeline for “feeling normal.”',
      },
      {
        question: 'How soon do ADHD meds work?',
        answer:
          'Stimulants may show same-day effects for some patients; non-stimulants often need weeks. Individual response and formulation matter.',
      },
      {
        question: 'What labs or vitals are checked?',
        answer:
          'Blood pressure, heart rate, weight, and mood review are common; labs depend on comorbidities and medication choice.',
      },
      {
        question: 'Can I start ADHD medication without an evaluation?',
        answer:
          'Responsible prescribing requires clinical diagnosis and safety screening. Avoid services promising instant stimulants.',
      },
      {
        question: 'Does telehealth provide follow-up for stimulants?',
        answer:
          'Legitimate telehealth includes refill visits, PDMP review where required, and crisis instructions—not only the first prescription.',
      },
    ],
    evidence: ['FDA stimulant medication guides', 'ADHD treatment monitoring literature', 'State PDMP and telehealth prescribing rules'],
    learnMore: [
      { href: '/adhd-care', label: 'ADHD care pathway' },
      { href: '/membership-pricing', label: 'Membership & follow-up pricing' },
      { href: '/answers/adhd-medication-side-effects', label: 'ADHD medication side effects' },
      { href: '/blog/how-to-safely-get-prescriptions-online', label: 'Safe online prescriptions (blog)' },
    ],
    related: ['adhd-medication-side-effects', 'can-you-get-adhd-medication-online', 'is-adhd-medication-safe-long-term', 'late-adhd-diagnosis-adults'],
  },
  {
    slug: 'signs-of-adult-adhd',
    metaDescription:
      'Signs of adult ADHD: inattention, time blindness, emotional sensitivity, and when to seek a structured evaluation—not just an online quiz.',
    shortAnswer:
      'Adult ADHD often shows up as chronic difficulty sustaining focus, disorganization, forgetfulness, time blindness, trouble finishing tasks, inner restlessness, and emotional sensitivity—not only childhood-style hyperactivity. Symptoms must cause real impairment in work, relationships, or daily life and usually reflect lifelong patterns, though many adults were never diagnosed. Clinicians rule out sleep apnea, anxiety, depression, thyroid disease, and iron deficiency before confirming ADHD.',
    sections: [
      {
        id: 'core-signs',
        heading: 'Core signs clinicians assess',
        paragraphs: [
          'Inattentive presentation is common in adults: mental fog, losing track of conversations, missed deadlines, and piles of unfinished projects. Hyperactivity may appear as inner restlessness or difficulty relaxing rather than running in classrooms.',
          'Executive dysfunction—planning, prioritizing, initiating boring tasks—often hurts careers despite high intelligence. Emotional dysregulation and rejection sensitivity are frequently reported even though RSD is not a standalone DSM diagnosis.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “ADHD is a childhood-only disorder.” Reality: Many adults are diagnosed late after compensation fails.',
          'Myth: “An online quiz is enough.” Reality: Screeners prompt evaluation; they do not diagnose.',
          'Myth: “Successful people cannot have ADHD.” Reality: High-functioning compensation is common.',
          'Myth: “Stimulants are the only treatment.” Reality: Skills, sleep, therapy, and non-stimulants matter.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Book structured ADHD evaluation when symptoms impair functioning most weeks—not only during one stressful project. Seek urgent care for suicidal thoughts or safety crises.',
          'Siya Health offers a 60–90 minute adult ADHD telehealth evaluation in eligible states; bring childhood examples and sleep history to the visit.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Impairment across settings matters—not occasional bad weeks.',
          'Sleep and mood mimics must be screened.',
          'Legitimate telehealth evaluation beats social media checklists.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What are the signs of adult ADHD?',
        answer:
          'Common signs include chronic inattention, disorganization, time blindness, impulsivity, emotional sensitivity, and executive dysfunction causing real-world impairment—often since childhood.',
      },
      {
        question: 'Can adult ADHD start suddenly?',
        answer:
          'True new-onset ADHD in adulthood is uncommon; sudden focus loss suggests sleep, medical, or mood causes. Late recognition of lifelong ADHD is common.',
      },
      {
        question: 'How is adult ADHD diagnosed?',
        answer:
          'Licensed clinicians use interview, developmental history, validated tools, and safety screening—not quizzes alone.',
      },
      {
        question: 'Do I need in-person testing?',
        answer:
          'Many evaluations occur via HIPAA-compliant telehealth with standardized tools; some cases need local labs or sleep testing.',
      },
      {
        question: 'What conditions mimic ADHD?',
        answer:
          'Sleep apnea, insomnia, anxiety, depression, thyroid disease, iron deficiency, and substance effects can mimic ADHD symptoms.',
      },
    ],
    evidence: ['DSM-5-TR ADHD criteria', 'NIMH adult ADHD overview', 'CHADD adult resources', 'ASRS screening instrument documentation'],
    learnMore: [
      { href: '/adhd-care', label: 'ADHD evaluation & care' },
      { href: '/adhd-screening', label: 'Free ASRS screening' },
      { href: '/adhd-care', label: 'Comprehensive ADHD evaluation' },
      { href: '/blog/how-to-know-if-you-have-adhd-adult', label: 'How to know if you have ADHD (blog)' },
      { href: '/blog/adhd-symptoms-overlooked', label: 'Overlooked ADHD symptoms (blog)' },
    ],
    related: ['can-adhd-be-diagnosed-online', 'how-long-adhd-evaluation', 'adhd-vs-anxiety', 'high-functioning-adhd', 'poor-sleep-feels-like-adhd'],
  },
  {
    slug: 'can-adhd-be-diagnosed-online',
    metaDescription:
      'Can ADHD be diagnosed online? When telehealth evaluation is legitimate, what is included, and red flags to avoid.',
    shortAnswer:
      'Yes—when a licensed clinician in your state conducts a full telehealth evaluation with clinical interview, validated screening and assessment tools as indicated, medical and psychiatric history, and safety review. A free online quiz alone is screening, not diagnosis. Legitimate care uses HIPAA-compliant video, documented visits, transparent pricing, and appropriate follow-up—not instant stimulant guarantees.',
    sections: [
      {
        id: 'legitimate-telehealth',
        heading: 'What legitimate online ADHD diagnosis includes',
        paragraphs: [
          'Expect 60–90 minutes of clinician time for a comprehensive adult evaluation, plus intake forms. Tools may include ASRS, structured interview modules, and cognitive testing (e.g., Creyos) when clinically appropriate.',
          'Diagnosis requires DSM-5-TR criteria with childhood onset patterns and cross-setting impairment. Clinicians document differential diagnosis for anxiety, sleep disorders, and medical mimics.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Telehealth ADHD is always a scam.” Reality: Board-certified telehealth is standard in many states when properly licensed.',
          'Myth: “Diagnosis guarantees stimulants.” Reality: Treatment follows clinical judgment and safety rules.',
          'Myth: “Out-of-state clinicians can always prescribe.” Reality: Prescribing requires licensure in your state.',
          'Myth: “TikTok symptoms equal diagnosis.” Reality: Social media raises awareness but cannot replace evaluation.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Schedule evaluation when screening is positive or lifelong executive dysfunction impairs work and relationships. Avoid services with no clinician name, no state license disclosure, or pressure to buy stimulants upfront.',
          'Emergency symptoms require 911—not telehealth intake.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Online can be legitimate with full clinician evaluation.',
          'Screening ≠ diagnosis.',
          'Ongoing relationship required for controlled prescriptions.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can ADHD be diagnosed online?',
        answer:
          'Yes with a licensed clinician conducting a structured telehealth evaluation meeting state practice standards—not with automated quizzes alone.',
      },
      {
        question: 'How long does online ADHD diagnosis take?',
        answer:
          'Comprehensive evaluations typically require 60–90 minutes of clinician time plus forms; quick surveys are insufficient.',
      },
      {
        question: 'Is online ADHD diagnosis legitimate?',
        answer:
          'Legitimate when visits are documented, HIPAA-compliant, and follow clinical guidelines. Instant stimulant promises are red flags.',
      },
      {
        question: 'What does Siya Health include?',
        answer:
          'An adult evaluation with board-certified ADHD-CCSP–trained clinicians in eligible states, including interview and standardized tools when indicated. Current pricing is on /pricing.',
      },
      {
        question: 'Can online doctors prescribe stimulants?',
        answer:
          'When clinically appropriate after diagnosis, with PDMP checks, ID verification, and follow-up per federal and state rules.',
      },
    ],
    evidence: ['State telehealth practice standards', 'HIPAA security rule overview', 'ASRS + clinical interview best practices', 'DEA telemedicine prescribing policies (evolving)'],
    learnMore: [
      { href: '/adhd-care', label: 'Book adult ADHD evaluation' },
      { href: '/adhd-care', label: 'ADHD care overview' },
      { href: '/blog/is-online-adhd-diagnosis-legit', label: 'Is online ADHD diagnosis legit? (blog)' },
      { href: '/answers/is-online-adhd-diagnosis-legitimate', label: 'Legitimacy checklist' },
    ],
    related: ['is-online-adhd-diagnosis-legitimate', 'how-long-adhd-evaluation', 'what-included-199-adhd-evaluation', 'telehealth-adhd-texas'],
  },
  {
    slug: 'can-adhd-cause-anxiety',
    metaDescription:
      'Can ADHD cause anxiety? Secondary anxiety from untreated ADHD, overlap, and how clinicians evaluate both.',
    shortAnswer:
      'ADHD does not universally “cause” anxiety in a simple one-direction way, but living with untreated ADHD—missed deadlines, shame, chronic overwhelm—commonly leads to secondary anxiety. ADHD and generalized anxiety disorder also frequently co-occur and share overlapping symptoms such as restlessness and poor concentration, which is why clinicians screen for both during evaluation rather than treating a screener result alone.',
    sections: [
      {
        id: 'how-they-link',
        heading: 'How ADHD and anxiety interact',
        paragraphs: [
          'Many adults describe a lifetime of feeling behind, fueling worry, perfectionism, or avoidance. Treating ADHD can sometimes ease anxiety; in other cases both need targeted care—therapy, medication, or combined approaches.',
          'Stimulant medications may improve focus but can unmask or worsen anxiety in some patients. Non-stimulants or adjusted timing may be considered when anxiety is prominent.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Fix anxiety first, ignore ADHD.” Reality: Untreated ADHD may perpetuate anxiety cycles.',
          'Myth: “ADHD medication always worsens anxiety.” Reality: Individual response varies with dose and comorbidity treatment.',
          'Myth: “Anxiety explains all focus problems.” Reality: Developmental ADHD history still matters.',
          'Myth: “Breathing exercises cure ADHD.” Reality: Skills help; they do not replace diagnosis when ADHD is present.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Seek urgent care for panic with chest pain, suicidal ideation, or inability to care for yourself. Schedule evaluation when both worry and executive dysfunction impair life for months.',
          'Bring timeline examples: childhood inattention vs adult-onset worry after a specific stressor.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Secondary anxiety from ADHD is common and treatable.',
          'Co-occurring disorders need explicit treatment plans.',
          'Sleep apnea and caffeine overuse worsen both symptoms.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can ADHD cause anxiety?',
        answer:
          'Untreated ADHD often produces secondary anxiety from chronic overwhelm; independent anxiety disorders also co-occur frequently. Clinicians assess both.',
      },
      {
        question: 'Which to treat first—ADHD or anxiety?',
        answer:
          'Depends on severity, safety, and which disorder drives impairment. Some patients need simultaneous care; sequencing is a shared decision.',
      },
      {
        question: 'Can stimulants help anxiety?',
        answer:
          'Sometimes indirectly by improving task completion; sometimes they worsen anxiety. Monitoring is required.',
      },
      {
        question: 'Does therapy help ADHD-related anxiety?',
        answer:
          'CBT and skills training help coping; ADHD may still need medication or coaching when confirmed.',
      },
    ],
    evidence: ['NIMH comorbidity themes', 'DSM-5-TR ADHD and anxiety disorder criteria', 'ADHD-CCSP evaluation standards'],
    learnMore: [
      { href: '/adhd-care', label: 'ADHD evaluation' },
      { href: '/answers/adhd-vs-anxiety', label: 'ADHD vs anxiety' },
      { href: '/blog/adhd-symptoms-overlooked', label: 'Overlooked ADHD symptoms (blog)' },
    ],
    related: ['adhd-vs-anxiety', 'signs-of-adult-adhd', 'is-adhd-medication-safe-long-term', 'poor-sleep-feels-like-adhd'],
  },
  {
    slug: 'is-online-adhd-diagnosis-legitimate',
    metaDescription:
      'Is online ADHD diagnosis legitimate? Red flags, green flags, and what responsible telehealth includes.',
    shortAnswer:
      'Online ADHD diagnosis is legitimate when a licensed provider in your state conducts an adequate visit length, uses standardized assessments as indicated, reviews medical and psychiatric history, documents the encounter, and offers appropriate follow-up—not when an automated quiz instantly labels you and ships stimulants. Transparency about pricing, licensure, and limitations (emergencies, in-person needs) is part of ethical telehealth. Compare vendors on follow-up policy, not marketing speed alone.',
    sections: [
      {
        id: 'green-flags',
        heading: 'Green flags for legitimate online ADHD care',
        paragraphs: [
          'Named clinicians with state licenses disclosed, 60–90 minute evaluation options, HIPAA-compliant video, refusal to guarantee stimulants before assessment, and clear follow-up policies for controlled substances.',
          'Integration of ASRS or similar screeners with full interview and safety questions about cardiovascular history, sleep, and substance use.',
        ],
      },
      {
        id: 'red-flags',
        heading: 'Red flags to avoid',
        listItems: [
          'Instant diagnosis from a short quiz with automatic prescriptions.',
          'No video visit or no documented patient relationship.',
          'Marketing “Adderall shipped tomorrow” without evaluation.',
          'No discussion of sleep apnea, anxiety, or cardiovascular risk.',
          'Unclear state licensure or offshore prescribers outside your state.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Choose structured evaluation when impairment is persistent. Use emergency services for crisis symptoms—not telehealth marketing funnels.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Legitimacy is about process, not online vs in-person format.',
          'DEA and state rules for controlled substances still apply.',
          'Second opinions are reasonable when care feels rushed.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is online ADHD diagnosis legitimate?',
        answer:
          'Yes when conducted by licensed clinicians with proper visit documentation and clinical standards. Automated prescription mills are not legitimate.',
      },
      {
        question: 'What is the difference between screening and diagnosis online?',
        answer:
          'Screening takes minutes and estimates risk; diagnosis requires full clinician evaluation and differential diagnosis.',
      },
      {
        question: 'Are TikTok ADHD tests valid?',
        answer:
          'They raise awareness but are not diagnostic instruments. Use validated screeners with clinician interpretation.',
      },
      {
        question: 'Can telehealth prescribe Adderall?',
        answer:
          'When clinically appropriate after diagnosis, following federal and state telemedicine and controlled-substance rules with monitoring.',
      },
    ],
    evidence: ['DEA telemedicine prescribing rules (evolving)', 'Clinical ADHD evaluation guidelines', 'State medical board telehealth advisories'],
    learnMore: [
      { href: '/adhd-care', label: 'Adult ADHD evaluation' },
      { href: '/blog/is-online-adhd-diagnosis-legit', label: 'Online ADHD legitimacy (blog)' },
      { href: '/answers/can-adhd-be-diagnosed-online', label: 'Can ADHD be diagnosed online?' },
    ],
    related: ['can-adhd-be-diagnosed-online', 'telehealth-adhd-texas', 'telehealth-adhd-california', 'how-much-does-adhd-testing-cost'],
  },
  {
    slug: 'glp-1-side-effects',
    metaDescription:
      'GLP-1 side effects: nausea, GI symptoms, rare serious risks, and when to call your clinician. Educational guide for semaglutide and tirzepatide.',
    shortAnswer:
      'Common GLP-1 receptor agonist side effects include nausea, vomiting, diarrhea, constipation, reflux, and reduced appetite—most gastrointestinal symptoms improve over weeks with slow titration, hydration, smaller meals, and clinician-guided dose adjustments. Rare but serious risks such as pancreatitis, gallbladder disease, and severe dehydration require prompt medical attention. GLP-1 medicines are prescription-only and need ongoing monitoring—not unregulated compounded products sold without oversight.',
    sections: [
      {
        id: 'common-gi-effects',
        heading: 'Common gastrointestinal effects',
        paragraphs: [
          'Trial populations report high rates of mild-to-moderate nausea early in therapy, often peaking after dose increases. Eating smaller, lower-fat meals and avoiding lying down immediately after eating may help; persistent vomiting needs clinician contact.',
          'Constipation and reflux are frequent patient-reported issues. Fiber, hydration, and timing adjustments are discussed at follow-up visits.',
        ],
      },
      {
        id: 'serious-risks',
        heading: 'Serious risks to report promptly',
        listItems: [
          'Severe or persistent abdominal pain—possible pancreatitis or gallbladder disease.',
          'Repeated vomiting with dehydration or dizziness.',
          'Signs of allergic reaction (rash, swelling, breathing difficulty).',
          'Vision changes in patients with diabetes when glucose shifts rapidly—requires clinician coordination.',
          'Personal or family history of medullary thyroid carcinoma or MEN2 (contraindication per labeling).',
        ],
        paragraphs: [
          'FDA medication guides for semaglutide and tirzepatide list contraindications and warnings; prescribers review these before starting therapy.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Side effects mean I should quit immediately.” Reality: Many improve with titration; clinician guides continue vs stop.',
          'Myth: “Compounded shots are identical to branded drugs.” Reality: Manufacturing and safety tracking differ—discuss only with your prescriber.',
          'Myth: “GLP-1 replaces lifestyle.” Reality: Nutrition, sleep, and movement remain foundations.',
          'Myth: “No follow-up needed once nausea passes.” Reality: Metabolic monitoring continues.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Emergency care for severe abdominal pain, inability to keep fluids down, or allergic reactions. Routine follow-up for tolerability, weight trends, and labs per your prescriber’s obesity-medicine plan.',
          'Discuss food noise return, inadequate weight response, or mood changes at scheduled visits—not only at refill time.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'GI side effects are common early; titration matters.',
          'Serious symptoms need urgent review—not social media advice.',
          'Branded FDA-approved agents have standardized safety labeling.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What are GLP-1 side effects?',
        answer:
          'Frequent effects include nausea, vomiting, diarrhea, constipation, and reflux. Rare serious risks include pancreatitis and gallbladder disease—seek care for severe abdominal pain.',
      },
      {
        question: 'How long does GLP-1 nausea last?',
        answer:
          'Many patients improve over weeks as dose titration completes; individual timelines vary. Persistent vomiting needs medical review.',
      },
      {
        question: 'Are GLP-1 side effects dangerous?',
        answer:
          'Most are manageable; some warnings are serious. Prescribers review contraindications and monitoring before and during therapy.',
      },
      {
        question: 'Can I manage GLP-1 nausea at home?',
        answer:
          'Small meals, hydration, and timing help for mild symptoms. Severe or worsening symptoms require clinician guidance.',
      },
      {
        question: 'Do compounded GLP-1 have the same side effects?',
        answer:
          'Similar drug class risks may apply, but product quality and dosing consistency differ. Discuss sourcing only with a licensed prescriber.',
      },
    ],
    evidence: ['FDA GLP-1 medication guides (semaglutide, tirzepatide)', 'STEP and SURMOUNT trial GI adverse event profiles', 'ADA obesity pharmacotherapy safety summaries'],
    learnMore: [
      { href: '/weight-loss-metabolic-health', label: 'Medical weight loss care' },
      { href: '/answers/glp-1-nausea-management', label: 'GLP-1 nausea management' },
      { href: '/answers/what-is-food-noise', label: 'What is food noise?' },
      { href: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps', label: 'Food noise & GLP-1 (blog)' },
    ],
    related: ['what-is-food-noise', 'glp-1-nausea-management', 'semaglutide-weight-loss-how-it-works', 'who-qualifies-glp-1-weight-loss', 'compounded-vs-branded-glp-1'],
  },
  {
    slug: 'semaglutide-weight-loss-how-it-works',
    metaDescription:
      'How semaglutide works for weight loss: GLP-1 mechanism, trial evidence, expectations, and clinician oversight.',
    shortAnswer:
      'Semaglutide mimics glucagon-like peptide-1 (GLP-1), slowing gastric emptying, reducing appetite signaling, and improving glycemic control in eligible patients. Weight loss in trials reflects sustained calorie deficit plus behavioral support—not the injection alone. FDA-approved weight-loss dosing (e.g., Wegovy) differs from diabetes formulations (Ozempic); compounding and off-label use carry distinct quality and legal considerations that should be discussed only with a licensed prescriber.',
    sections: [
      {
        id: 'mechanism',
        heading: 'Mechanism and what patients notice',
        paragraphs: [
          'GLP-1 receptors in the brain and gut influence satiety, nausea thresholds, and glucose-dependent insulin secretion. Many patients report reduced “food noise” and smaller comfortable portion sizes—response varies.',
          'Weight change is gradual over months in trials; rapid expectations from social media often mismatch clinical data. Muscle preservation still benefits from adequate protein and resistance training.',
        ],
      },
      {
        id: 'evidence-context',
        heading: 'Evidence context (not a promise of results)',
        paragraphs: [
          'STEP trial program data supported semaglutide 2.4 mg for chronic weight management in eligible adults with lifestyle intervention. Individual results depend on adherence, starting weight, comorbidities, and tolerability.',
          'Stopping medication without lifestyle support often leads to weight regain in follow-up studies—plan maintenance with your clinician.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Semaglutide melts fat without diet changes.” Reality: Trials include lifestyle support; biology still needs energy deficit.',
          'Myth: “Ozempic and Wegovy are interchangeable at home.” Reality: Dosing and indications differ—use prescribed product only.',
          'Myth: “More dose always means better.” Reality: Titration balances efficacy and GI tolerance.',
          'Myth: “No medical follow-up needed.” Reality: Monitoring for GI, gallbladder, and metabolic effects continues.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Discuss eligibility, contraindications (personal/family medullary thyroid cancer history, MEN2, pregnancy), and medication interactions before starting. Seek urgent care for severe abdominal pain or dehydration from vomiting.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Semaglutide supports appetite and glycemic pathways—not magic weight loss.',
          'FDA-approved branded options have labeled indications and titration schedules.',
          'Combine pharmacotherapy with sleep, nutrition, and mental-health support when needed.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How does semaglutide work for weight loss?',
        answer:
          'It activates GLP-1 pathways that reduce appetite signaling, slow gastric emptying, and improve glucose handling in eligible patients—alongside lifestyle intervention.',
      },
      {
        question: 'How much weight can you lose on semaglutide?',
        answer:
          'Trial averages are not individual guarantees. Response depends on adherence, starting BMI, and tolerability. Discuss realistic goals with your clinician.',
      },
      {
        question: 'Is semaglutide the same as Ozempic and Wegovy?',
        answer:
          'Same molecule class but different FDA indications and dosing schedules. Use only the product prescribed for your indication.',
      },
      {
        question: 'Does semaglutide quiet food noise?',
        answer:
          'Many patients report reduced food preoccupation, but effect varies. See our food noise Health Guide for context.',
      },
      {
        question: 'What happens if I stop semaglutide?',
        answer:
          'Appetite signals often return; weight regain is common without maintenance planning—discuss with your prescriber.',
      },
    ],
    evidence: ['STEP trial program publications — semaglutide 2.4 mg weight-loss outcomes in adults', 'FDA Wegovy and Ozempic labeling', 'ADA Standards of Care — obesity pharmacotherapy guidance'],
    learnMore: [
      { href: '/weight-loss-metabolic-health', label: 'Weight loss & metabolic health' },
      { href: '/blog/tirzepatide-vs-semaglutide-which-is-better', label: 'Tirzepatide vs semaglutide (blog)' },
      { href: '/blog/medical-weight-loss-glp1-semaglutide-texas', label: 'GLP-1 weight loss overview (blog)' },
      { href: '/answers/glp-1-side-effects', label: 'GLP-1 side effects' },
    ],
    related: ['what-is-food-noise', 'glp-1-side-effects', 'compounded-vs-branded-glp-1', 'what-is-insulin-resistance'],
    cornerstoneBlog: '/blog/medical-weight-loss-glp1-semaglutide-texas',
  },
  {
    slug: 'what-is-insulin-resistance',
    metaDescription:
      'What is insulin resistance? Mechanism, symptoms, labs, lifestyle evidence, and when to seek metabolic evaluation.',
    shortAnswer:
      'Insulin resistance means your cells respond less efficiently to insulin, so the pancreas often releases more insulin to keep blood sugar in range. It can exist for years before A1C rises into prediabetes or diabetes and is closely tied to excess visceral fat, weight gain, cravings, post-meal fatigue, and cardiometabolic risk. It is not the same as type 2 diabetes—though it is a major pathway toward it. Improvement usually combines sustained weight loss, activity, sleep, and clinician-guided care when indicated—not extreme restriction alone.',
    sections: [
      {
        id: 'mechanism',
        heading: 'Mechanism in plain language',
        paragraphs: [
          'Think of insulin as a key that helps glucose enter cells. In insulin resistance, keys still exist but locks are stickier—so the pancreas makes more insulin (hyperinsulinemia) to compensate. Eventually glucose may rise into prediabetes or diabetes if compensation fails.',
          'Visceral (abdominal) fat and sedentary patterns strongly associate with resistance in population studies. Genetics and family history also matter.',
        ],
      },
      {
        id: 'signs-and-labs',
        heading: 'Signs and labs clinicians use',
        paragraphs: [
          'Symptoms are nonspecific: afternoon crashes, strong carb cravings, waist gain, and “normal labs” frustration. Standard screening uses fasting glucose, A1C, or oral glucose tolerance testing; fasting insulin may add context but is not routine everywhere and varies by lab.',
          'Lipids, blood pressure, and waist trend help assess metabolic syndrome risk even when glucose looks acceptable.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Skinny people cannot be insulin resistant.” Reality: Lean individuals can have metabolic strain, especially with family history.',
          'Myth: “Normal A1C rules it out.” Reality: Compensatory hyperinsulinemia may precede A1C rise.',
          'Myth: “Keto fixes insulin resistance instantly.” Reality: Sustainable weight loss and activity have stronger trial evidence for prevention.',
          'Myth: “GLP-1 replaces lifestyle.” Reality: Medications help selected patients but require monitoring.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Schedule care when waist size rises, post-meal fatigue is daily, or family history of diabetes is strong—even with normal screening labs. Urgent symptoms (polyuria, polydipsia, unexplained weight loss) need prompt glucose testing.',
          'Telehealth can map metabolic history; local phlebotomy may be needed for labs.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Insulin resistance is a trajectory—not a single lab value.',
          'Roughly 5–7% weight loss improves sensitivity in many high-risk adults (DPP).',
          'Sleep apnea and ADHD-related eating patterns often overlap—treat holistically.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is insulin resistance?',
        answer:
          'Reduced cellular response to insulin with compensatory higher insulin output, often before overt diabetes. It links to visceral fat, cravings, and cardiometabolic risk.',
      },
      {
        question: 'What are symptoms of insulin resistance?',
        answer:
          'Common themes include waist gain, post-meal fatigue, carb cravings, and normal routine labs despite symptoms—always clinician-interpreted.',
      },
      {
        question: 'How is insulin resistance diagnosed?',
        answer:
          'Clinicians combine glucose tests (fasting glucose, A1C, OGTT), lipids, blood pressure, waist trend, and history—not one DIY number.',
      },
      {
        question: 'Can insulin resistance be reversed?',
        answer:
          'Lifestyle weight loss and activity improve sensitivity in many people; medications may help selected patients under medical supervision.',
      },
      {
        question: 'Does insulin resistance cause weight gain?',
        answer:
          'Bidirectional relationship: excess visceral fat worsens resistance, and high insulin may promote storage in some individuals—context matters.',
      },
    ],
    evidence: [
      'ADA Standards of Care in Diabetes—2025 (prediabetes, lifestyle)',
      'Diabetes Prevention Program (NEJM 2002; PMID 12023865)',
      'IDF metabolic syndrome criteria',
      'Visceral adipose tissue and insulin resistance literature (Sci Rep themes)',
    ],
    learnMore: [
      { href: '/answers/normal-a1c-insulin-resistance', label: 'Normal A1C with insulin resistance?' },
      { href: '/answers/brain-fog-after-eating', label: 'Brain fog after eating' },
      { href: '/blog/insulin-resistance-and-weight-loss-clinician-overview', label: 'Insulin resistance cornerstone (blog)' },
      { href: '/weight-loss-metabolic-health', label: 'Medical weight loss services' },
    ],
    related: ['insulin-resistance-without-diabetes', 'normal-a1c-insulin-resistance', 'medical-weight-loss-vs-dieting', 'what-is-food-noise', 'semaglutide-weight-loss-how-it-works'],
    cornerstoneBlog: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  },
  {
    slug: 'normal-a1c-insulin-resistance',
    metaDescription:
      'Can you have insulin resistance with a normal A1C? Yes—compensatory insulin, symptoms, and next labs to discuss with your clinician.',
    shortAnswer:
      'Yes. A1C reflects average blood glucose over roughly three months, not how hard your pancreas works to keep glucose normal. Early insulin resistance often hides behind compensatory high insulin until A1C drifts into prediabetes. Normal A1C does not rule out metabolic strain, post-meal crashes, waist gain, or elevated triglycerides—symptoms and trend data still matter.',
    sections: [
      {
        id: 'why-a1c-misses-early',
        heading: 'Why A1C can look normal early',
        paragraphs: [
          'Hyperinsulinemia can maintain normoglycemia for years while driving cravings, fatigue after meals, and central adiposity. Post-meal glucose spikes may not fully shift A1C until patterns are sustained.',
          'Lab reference ranges describe population cutoffs, not personal optimal metabolic health.',
        ],
      },
      {
        id: 'what-to-discuss',
        heading: 'What to discuss with your clinician',
        listItems: [
          'Fasting glucose and A1C trend over time—not one snapshot.',
          'Triglycerides, HDL, blood pressure, and waist circumference.',
          'Sleep history (snoring, unrefreshing sleep) and mood.',
          'Whether additional labs (fasting insulin, liver enzymes) fit your case.',
          'Structured weight-loss and activity goals (DPP-style ~5–7% loss when appropriate).',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Green portal labs mean healthy metabolism.” Reality: Symptoms can precede abnormal A1C.',
          'Myth: “Only people with diabetes need metabolic care.” Reality: Prevention targets trajectory.',
          'Myth: “Fasting insulin alone diagnoses resistance.” Reality: Interpretation varies by lab and context.',
          'Myth: “Supplements replace medical follow-up.” Reality: Evidence-based lifestyle and prescribed therapy when indicated.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Book review when daily post-meal fatigue, food noise, or waist gain persists despite “normal” A1C. Urgent care for classic hyperglycemia symptoms or unexplained weight loss.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Normal A1C ≠ absence of insulin resistance.',
          'Trends and symptoms guide next tests.',
          'GLP-1 and lifestyle programs may help selected patients under supervision.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can you have insulin resistance with a normal A1C?',
        answer:
          'Yes. Compensatory hyperinsulinemia can keep A1C normal while metabolic symptoms and other markers progress.',
      },
      {
        question: 'What A1C is prediabetes?',
        answer:
          'ADA defines prediabetes as A1C 5.7–6.4% (among other criteria). Values below that do not guarantee optimal insulin sensitivity.',
      },
      {
        question: 'Should I test fasting insulin?',
        answer:
          'Sometimes, when interpreted with glucose, lipids, and history by a clinician—not as a standalone DIY diagnosis.',
      },
      {
        question: 'Can GLP-1 help if A1C is normal?',
        answer:
          'May be considered for weight and metabolic risk in eligible patients per FDA indications and clinician judgment—not cosmetic use.',
      },
    ],
    evidence: ['ADA prediabetes classification', 'Compensatory hyperinsulinemia literature', 'Diabetes Prevention Program lifestyle outcomes'],
    learnMore: [
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
      { href: '/answers/why-normal-labs-dont-mean-healthy', label: 'Why normal labs ≠ healthy' },
      { href: '/blog/insulin-resistance-and-weight-loss-clinician-overview', label: 'Insulin resistance blog' },
      { href: '/weight-loss-metabolic-health', label: 'Metabolic health care' },
    ],
    related: ['what-is-insulin-resistance', 'insulin-resistance-without-diabetes', 'brain-fog-after-eating', 'why-normal-labs-dont-mean-healthy'],
  },
  {
    slug: 'insulin-resistance-without-diabetes',
    metaDescription:
      'Insulin resistance without diabetes: compensatory insulin, prediabetes pathway, and prevention-focused evaluation.',
    shortAnswer:
      'Yes—you can have insulin resistance for years while blood sugar still looks normal because the pancreas compensates with higher insulin output. Prediabetes (elevated A1C or glucose) is one checkpoint along the pathway, not the starting point. Clinicians use fasting glucose, A1C, lipids, waist circumference, blood pressure, and sometimes fasting insulin in context—not as a DIY label. Prevention-focused visits are appropriate even when you do not yet carry a diabetes diagnosis.',
    sections: [
      {
        id: 'pathway',
        heading: 'The progression clinicians watch',
        paragraphs: [
          'Metabolic syndrome features—central adiposity, elevated triglycerides, low HDL, hypertension—often appear before diabetes diagnosis. Lifestyle trials (Diabetes Prevention Program) show meaningful risk reduction with sustained weight loss and activity in high-risk adults.',
          'Ignoring early signals because diabetes is not labeled yet misses prevention opportunities.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “No diabetes diagnosis means no action needed.” Reality: Trajectory treatment starts earlier.',
          'Myth: “Only overweight people have insulin resistance.” Reality: Lean metabolic dysfunction exists.',
          'Myth: “Cut all carbs to cure it.” Reality: Sustainable patterns and medical guidance outperform extreme restriction for most.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Seek care with strong family history, rising waist, daily post-meal crashes, or gestational diabetes history. Coordinate ADHD and sleep care when impulsivity or apnea amplify eating and fatigue patterns.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Resistance precedes diabetes in many people.',
          'Prevention-focused labs and lifestyle matter.',
          'Pair with food noise and GLP-1 guides when clinically relevant.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can you have insulin resistance without diabetes?',
        answer:
          'Yes. Compensatory hyperinsulinemia and metabolic syndrome features commonly precede overt diabetes.',
      },
      {
        question: 'How do you prevent diabetes if you are insulin resistant?',
        answer:
          'Evidence supports weight loss (~5–7% in high-risk adults), activity, sleep, and clinician-guided therapy when indicated—not unmonitored supplements.',
      },
      {
        question: 'Is prediabetes the same as insulin resistance?',
        answer:
          'Related but not identical labels. You can have resistance before meeting prediabetes thresholds on glucose tests.',
      },
    ],
    evidence: ['ADA Standards of Care 2025 (prediabetes)', 'DPP outcomes on insulin sensitivity', 'IDF metabolic syndrome criteria'],
    learnMore: [
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
      { href: '/blog/insulin-resistance-and-weight-loss-clinician-overview', label: 'Insulin resistance cornerstone' },
      { href: '/weight-loss-metabolic-health', label: 'Weight loss services' },
    ],
    related: ['what-is-insulin-resistance', 'normal-a1c-insulin-resistance', 'medical-weight-loss-vs-dieting'],
  },
  {
    slug: 'what-is-food-noise',
    metaDescription:
      'What is food noise? Intrusive food thoughts vs hunger, GLP-1 context, ADHD overlap, and when to seek metabolic care.',
    shortAnswer:
      'Food noise is persistent, intrusive thinking about food—planning meals, craving, or mental “background chatter” about eating—that can occur even when you are not physically hungry. It overlaps with hedonic eating and reward-circuit biology and is not the same as normal appetite after true energy need. GLP-1 receptor agonists may reduce food preoccupation for some people in trials, but response varies; sleep, ADHD impulsivity, insulin resistance, and emotional eating also belong in the clinical picture.',
    sections: [
      {
        id: 'definition',
        heading: 'How patients and clinicians describe food noise',
        paragraphs: [
          'People contrast food noise with homeostatic hunger: “My stomach is not empty, but my brain will not stop negotiating food.” That exhaustion drives searches about GLP-1, ADHD, and metabolic health together.',
          'Food noise is a patient-language concept—helpful for communication—not a standalone DSM diagnosis. Clinicians still assess binge patterns, eating disorders, depression, and medical causes.',
        ],
      },
      {
        id: 'biology-and-context',
        heading: 'Biology and overlapping conditions',
        paragraphs: [
          'GLP-1 medicines influence gut–brain satiety pathways; STEP trials report appetite-related outcomes alongside weight change. Effects are individual—not guaranteed.',
          'ADHD-related impulsivity, poor sleep, and insulin resistance can amplify grazing and evening eating—coordinate care when multiple guides apply.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Food noise means weak willpower.” Reality: Neurobiology and environment matter.',
          'Myth: “GLP-1 silences food noise for everyone.” Reality: Partial or temporary response is common.',
          'Myth: “Quiet food thoughts prove health.” Reality: Over-restriction can also be unhealthy.',
          'Myth: “Only people with obesity have food noise.” Reality: Reported across BMI ranges.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Discuss with a clinician when intrusive food thoughts impair quality of life, pair with binge eating, or coincide with metabolic symptoms. Eating disorder red flags deserve specialized care.',
          'See our cornerstone blog for deeper GLP-1 and behavioral context; this Health Guide stays educational.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Food noise ≠ normal hunger.',
          'Metabolic, sleep, and ADHD factors often overlap.',
          'GLP-1 is one tool—not a moral fix for eating.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is food noise?',
        answer:
          'Persistent intrusive thoughts about food distinct from physical hunger, often discussed alongside GLP-1 therapy and metabolic health.',
      },
      {
        question: 'Is food noise the same as binge eating?',
        answer:
          'Not always. Binge eating disorder requires specific clinical criteria. Food noise describes a symptom theme that still needs professional assessment.',
      },
      {
        question: 'Do GLP-1 medications stop food noise?',
        answer:
          'Some patients report improvement in trials and practice; others have partial or returning symptoms. Clinician follow-up addresses dose, adherence, sleep, and stress.',
      },
      {
        question: 'Can ADHD cause constant thoughts about food?',
        answer:
          'Impulsivity and reward sensitivity can worsen grazing patterns; ADHD evaluation may be appropriate when executive dysfunction is lifelong.',
      },
      {
        question: 'When should I see a doctor for food noise?',
        answer:
          'When thoughts impair daily life, metabolic symptoms coexist, or disordered eating patterns are present.',
      },
    ],
    evidence: ['STEP trial appetite-related outcomes', 'Hedonic eating and GLP-1 narrative reviews (2024–2025)', 'Patient-reported food noise surveys (hypothesis-generating)'],
    learnMore: [
      { href: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps', label: 'Food noise & GLP-1 cornerstone (blog)' },
      { href: '/answers/glp-1-side-effects', label: 'GLP-1 side effects' },
      { href: '/answers/food-noise-returned-on-glp-1', label: 'Food noise returned on GLP-1' },
      { href: '/weight-loss-metabolic-health', label: 'Metabolic health care' },
    ],
    related: ['what-is-insulin-resistance', 'glp-1-side-effects', 'semaglutide-weight-loss-how-it-works', 'adhd-and-weight-loss-connection', 'food-noise-returned-on-glp-1'],
    cornerstoneBlog: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  },
  {
    slug: 'what-is-free-testosterone',
    metaDescription:
      'What is free testosterone? Bound vs free fractions, SHBG, symptoms, and guideline-based testing.',
    shortAnswer:
      'Free testosterone is the small fraction of testosterone in blood that is not tightly bound—chiefly to sex hormone-binding globulin (SHBG)—and is biologically active at tissues. Total testosterone includes bound plus free fractions; you can have “normal” total testosterone with low free testosterone when SHBG is elevated (thyroid disease, liver conditions, aging, some medications). Guidelines recommend measuring or calculating free testosterone when total results are borderline or SHBG may be altered—using validated assays, not inaccurate direct immunoassays alone.',
    sections: [
      {
        id: 'fractions',
        heading: 'Total, free, and bioavailable testosterone',
        paragraphs: [
          'Most circulating testosterone is protein-bound. SHBG binds tightly; albumin binds loosely. Free testosterone plus albumin-bound testosterone is considered bioavailable in many teaching models.',
          'Symptoms such as low libido, fatigue, or concentration problems are nonspecific—sleep apnea, depression, thyroid disease, and ADHD overlap. Labs must pair with morning timing, repeat testing, and clinical context.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Low total T always needs TRT.” Reality: Reversible causes and SHBG effects must be considered.',
          'Myth: “Saliva tests replace blood tests.” Reality: Blood assays with proper methodology are standard.',
          'Myth: “More testosterone is always better.” Reality: Supraphysiologic levels increase risk.',
          'Myth: “Fatigue alone proves low T.” Reality: Sleep and mood screening come first.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Discuss morning total testosterone (often two draws) and free testosterone calculation when symptoms persist after sleep apnea and mood screening. Avoid starting therapy from online symptom quizzes alone.',
          'Men planning fertility should discuss TRT impact on sperm production before starting exogenous testosterone.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Free testosterone explains some “normal total T” cases with symptoms.',
          'SHBG context is essential.',
          'Treat the person, not a single lab number.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What is free testosterone?',
        answer:
          'The unbound fraction of testosterone available to tissues; often estimated via validated calculations when SHBG is known.',
      },
      {
        question: 'What is a normal free testosterone level?',
        answer:
          'Ranges vary by lab and assay. Clinicians interpret against symptoms, morning draws, and repeat testing—not universal internet numbers.',
      },
      {
        question: 'Can SHBG be too high?',
        answer:
          'Yes. High SHBG lowers free testosterone even when total testosterone appears normal—thyroid, liver, and medication effects matter.',
      },
      {
        question: 'Does low free testosterone always need TRT?',
        answer:
          'No. Reversible causes are treated first; TRT is a shared decision when criteria and risks are met.',
      },
    ],
    evidence: ['Endocrine Society hypogonadism guideline (2018)', 'AUA testosterone deficiency guideline (2024)', 'Rosner et al. testosterone measurement position statement'],
    learnMore: [
      { href: '/mens-health-longevity', label: "Men's health & longevity care" },
      { href: '/answers/high-shbg-low-free-testosterone', label: 'High SHBG, low free testosterone' },
      { href: '/answers/what-does-low-testosterone-feel-like', label: 'Low testosterone symptoms' },
      { href: '/answers/signs-of-sleep-apnea-in-adults', label: 'Sleep apnea signs' },
    ],
    related: ['what-does-low-testosterone-feel-like', 'when-is-testosterone-therapy-appropriate', 'trt-monitoring-requirements', 'high-shbg-low-free-testosterone'],
  },
  {
    slug: 'when-is-testosterone-therapy-appropriate',
    metaDescription:
      'When is testosterone therapy appropriate? Guidelines, reversible causes, fertility, and shared decision-making.',
    shortAnswer:
      'Testosterone replacement therapy (TRT) may be appropriate for men with consistent symptoms of androgen deficiency and repeatedly low morning testosterone on proper assays—after evaluating reversible causes (sleep apnea, obesity, medications, thyroid disease, depression) and when benefits outweigh risks such as erythrocytosis, fertility suppression, and need for monitoring. TRT is not a universal anti-aging or performance strategy; guideline-based care requires ongoing labs and symptom review.',
    sections: [
      {
        id: 'criteria',
        heading: 'When clinicians consider TRT',
        paragraphs: [
          'Endocrine Society and AUA frameworks emphasize symptomatic hypogonadism with biochemically confirmed low testosterone on at least two morning samples when clinically indicated. Borderline totals warrant free testosterone assessment when SHBG may be abnormal.',
          'Age alone is not an indication. Marketing clinics promising “optimization” without diagnosis are a caution sign.',
        ],
      },
      {
        id: 'reversible-causes-first',
        heading: 'Reversible causes to address first',
        listItems: [
          'Obstructive sleep apnea (treat before reflex TRT in many cases).',
          'Obesity and insulin resistance (weight loss may raise testosterone).',
          'Opioids, glucocorticoids, and some psychiatric medications.',
          'Depression and alcohol use disorder.',
          'Primary testicular or pituitary disease—requires directed workup.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “TRT is safe because it is bioidentical.” Reality: Monitoring for hematocrit, symptoms, and fertility impact remains mandatory.',
          'Myth: “Every tired man needs testosterone.” Reality: Sleep and mood disorders are more common explanations.',
          'Myth: “TRT has no effect on fertility.” Reality: Exogenous testosterone suppresses sperm production.',
          'Myth: “Online symptom quizzes qualify you.” Reality: Diagnosis requires clinician judgment and labs.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Schedule evaluation for persistent low libido, erectile dysfunction, fatigue, or loss of morning erections—especially with sleep apnea symptoms or metabolic syndrome. Seek urgent care for chest pain, stroke symptoms, or severe mood changes.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Symptoms plus confirmed low morning testosterone—not marketing panels.',
          'Treat sleep apnea and reversible causes when present.',
          'TRT requires long-term monitoring and shared decisions.',
        ],
      },
    ],
    faqs: [
      {
        question: 'When is testosterone therapy appropriate?',
        answer:
          'When guideline criteria for symptomatic hypogonadism are met after proper testing and reversible causes are addressed, and risks are acceptable with monitoring.',
      },
      {
        question: 'What testosterone level is too low?',
        answer:
          'Thresholds vary by lab and guideline; clinicians use repeated morning total testosterone and symptoms, often with free testosterone when SHBG is high.',
      },
      {
        question: 'Can you get TRT with normal total testosterone?',
        answer:
          'Sometimes when free testosterone is low and symptoms fit—still requires specialist-level interpretation, not self-directed therapy.',
      },
      {
        question: 'Does TRT help ADHD symptoms?',
        answer:
          'Low testosterone and ADHD can both affect concentration; treating the correct diagnosis—or both under coordination—requires evaluation, not assumptions.',
      },
    ],
    evidence: ['Endocrine Society clinical practice guideline on hypogonadism', 'AUA testosterone deficiency guideline', 'FDA TRT risk communications'],
    learnMore: [
      { href: '/mens-health-longevity', label: "Men's health services" },
      { href: '/answers/trt-monitoring-requirements', label: 'TRT monitoring requirements' },
      { href: '/answers/testosterone-and-adhd-overlap', label: 'Testosterone and ADHD overlap' },
      { href: '/telehealth', label: 'Telehealth intake' },
    ],
    related: ['what-is-free-testosterone', 'what-does-low-testosterone-feel-like', 'trt-monitoring-requirements', 'signs-of-sleep-apnea-in-adults'],
  },
  {
    slug: 'trt-monitoring-requirements',
    metaDescription:
      'TRT monitoring: hematocrit, PSA, lipids, follow-up intervals, and symptoms to report on testosterone therapy.',
    shortAnswer:
      'Testosterone therapy requires baseline and follow-up monitoring tailored to formulation and patient risk—commonly including testosterone levels, hematocrit/hemoglobin, PSA in age-appropriate men, lipids, blood pressure, and structured symptom review for sleep apnea, mood, edema, and fertility goals. Frequency follows Endocrine Society–style schedules and individual response, not a one-size “set and forget” prescription.',
    sections: [
      {
        id: 'baseline-and-follow-up',
        heading: 'Baseline and follow-up labs',
        paragraphs: [
          'Before starting TRT, clinicians often obtain morning testosterone (sometimes repeated), hematocrit, PSA when indicated, and metabolic labs as clinically appropriate. Sleep apnea screening is recommended in many guideline pathways because untreated OSA worsens cardiovascular risk and mimics low-T symptoms.',
          'Early follow-up (e.g., 6–12 weeks after dose changes) checks hematocrit rise and symptom response; maintenance intervals may extend when stable.',
        ],
      },
      {
        id: 'symptoms-to-report',
        heading: 'Symptoms to report between visits',
        listItems: [
          'Leg swelling, shortness of breath, or chest pain.',
          'Sleep apnea worsening (snoring, unrefreshing sleep).',
          'Mood changes, irritability, or depressive symptoms.',
          'Reduced urine stream or urinary symptoms (PSA context).',
          'Acne, breast tenderness, or fertility concerns when relevant.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Once levels are good, stop monitoring.” Reality: Erythrocytosis can develop later.',
          'Myth: “TRT monitoring is optional online.” Reality: Legitimate prescribers document follow-up.',
          'Myth: “Higher hematocrit is always harmless.” Reality: Polycythemia increases thrombotic risk—dose adjustment or phlebotomy may be needed.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Emergency care for chest pain, stroke symptoms, or severe shortness of breath. Contact your prescriber for rising hematocrit on labs, new urinary symptoms, or mood destabilization.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Monitoring is part of safe TRT—not optional.',
          'Sleep apnea treatment may precede or accompany TRT.',
          'Fertility plans require explicit discussion before starting TRT.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What monitoring is required on testosterone therapy?',
        answer:
          'Typically testosterone levels, hematocrit, PSA when appropriate, lipids, blood pressure, and symptom review at guideline-based intervals—individualized to formulation and risk.',
      },
      {
        question: 'How often are TRT labs drawn?',
        answer:
          'Often after initial dose stabilization (weeks to months), then periodically when stable—your prescriber sets timing.',
      },
      {
        question: 'Can TRT raise hematocrit?',
        answer:
          'Yes. Elevated hematocrit is a known effect; monitoring and dose adjustment or phlebotomy may be required.',
      },
      {
        question: 'Do I need sleep apnea testing on TRT?',
        answer:
          'Many guidelines emphasize screening because untreated OSA increases risk and worsens symptoms attributed to low testosterone.',
      },
    ],
    evidence: ['Endocrine Society monitoring tables for testosterone therapy', 'FDA class labeling for testosterone products', 'AASM OSA guidance crosswalk'],
    learnMore: [
      { href: '/mens-health-longevity', label: "Men's health care" },
      { href: '/answers/when-is-testosterone-therapy-appropriate', label: 'When is TRT appropriate?' },
      { href: '/answers/signs-of-sleep-apnea-in-adults', label: 'Sleep apnea signs' },
    ],
    related: ['when-is-testosterone-therapy-appropriate', 'what-does-low-testosterone-feel-like', 'what-is-free-testosterone'],
  },
  {
    slug: 'is-telehealth-legitimate',
    metaDescription:
      'Is telehealth legitimate? HIPAA care, licensure, limits, and how to spot pill mills vs real medical practice.',
    shortAnswer:
      'Legitimate telehealth uses licensed clinicians, HIPAA-compliant communication, informed consent, documented visits, and continuity of care for follow-up—not anonymous chatbots or prescription storefronts selling controlled substances without assessment. Many conditions—including adult ADHD evaluation, metabolic care, and men’s health—can start via telehealth when state licensure and clinical standards are met; emergencies and some physical exams still require in-person or emergency services.',
    sections: [
      {
        id: 'what-legitimate-looks-like',
        heading: 'What legitimate telehealth includes',
        paragraphs: [
          'Verified clinician identity, state license disclosure, secure video or approved async platforms where permitted, visit documentation in the medical record, and clear policies for prescriptions, refills, and crises.',
          'Transparent pricing, privacy practices, and instructions to call 911 for emergencies are baseline expectations—not premium extras.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Telehealth is always lower quality.” Reality: Outcomes depend on clinical standards, not format alone.',
          'Myth: “Any app can prescribe controlled substances.” Reality: Federal and state rules require patient relationships and monitoring.',
          'Myth: “An introductory visit replaces diagnosis.” Reality: Intake visits differ from comprehensive evaluation.',
          'Myth: “Out-of-state care is always fine.” Reality: You generally need a clinician licensed where you are located.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to use telehealth vs in-person care',
        paragraphs: [
          'Telehealth fits structured intake, follow-up, and many chronic care pathways. Seek emergency or urgent in-person care for chest pain, stroke symptoms, severe abdominal pain, suicidal thoughts, or inability to stay awake while driving.',
          'Local labs, imaging, and sleep studies may complement telehealth plans.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Legitimacy = licensure + documentation + follow-up.',
          'HIPAA-compliant tools protect PHI.',
          'Red flags include instant controlled-substance promises.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is telehealth legitimate for medical care?',
        answer:
          'Yes when provided by licensed clinicians using compliant platforms and clinical standards. Prescription mills without visits are not legitimate.',
      },
      {
        question: 'Is telehealth HIPAA compliant?',
        answer:
          'Legitimate platforms implement HIPAA safeguards; consumer chat apps without BAAs are inappropriate for PHI.',
      },
      {
        question: 'Can telehealth prescribe controlled substances?',
        answer:
          'Sometimes, following federal and state telemedicine rules, identity verification, PDMP checks, and follow-up—not automatic online checkout.',
      },
      {
        question: 'What should I expect from a first telehealth visit?',
        answer:
          'A logistics and fit conversation—not a full diagnosis. See our first telehealth visit Health Guide.',
      },
    ],
    evidence: ['HHS telehealth best practices', 'State telehealth parity laws — coverage and practice rules vary by state', 'DEA telemedicine prescribing policies'],
    learnMore: [
      { href: '/telehealth', label: 'Siya Health telehealth services' },
      { href: '/answers/meet-and-greet-telehealth-expectations', label: 'First telehealth visit expectations' },
      { href: '/answers/how-online-prescriptions-work', label: 'How online prescriptions work' },
      { href: '/blog/how-to-safely-get-prescriptions-online', label: 'Safe online prescriptions (blog)' },
    ],
    related: ['how-online-prescriptions-work', 'meet-and-greet-telehealth-expectations', 'can-adhd-be-diagnosed-online'],
  },
  {
    slug: 'meet-and-greet-telehealth-expectations',
    metaDescription:
      'First telehealth visit: what happens, what it is not, follow-up plan pricing, and next steps before a full ADHD or metabolic evaluation.',
    shortAnswer:
      'A first telehealth visit is a brief, low-pressure introduction to confirm service fit, review offerings and follow-up plan pricing, answer logistics (state licensure, visit length, follow-up), and plan next steps—it is not a full diagnosis or medication visit. Use it when you want clarity before committing to a comprehensive ADHD evaluation or ongoing metabolic care. Emergency symptoms require 911 or local urgent care, not a scheduling slot for introductory logistics.',
    sections: [
      {
        id: 'what-happens',
        heading: 'What typically happens in a first telehealth visit',
        paragraphs: [
          'You meet a team member or clinician to discuss which programs apply (ADHD evaluation, weight management, men’s health), expected timelines, out-of-pocket pricing, and whether your state is in network for licensure.',
          'You can ask how 60–90 minute ADHD evaluations differ from free screeners, and what documents to prepare (ID, medication list, prior records).',
        ],
      },
      {
        id: 'what-it-is-not',
        heading: 'What a first telehealth visit is not',
        listItems: [
          'Not a substitute for emergency care.',
          'Not a guarantee of stimulant or GLP-1 prescriptions.',
          'Not a full psychiatric intake for complex trauma without follow-up planning.',
          'Not a sleep study or lab draw—those may be ordered later when indicated.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to start secure chat vs book full evaluation',
        paragraphs: [
          'Start Secure Medical Chat when you are comparing telehealth options or unsure which pathway fits. Book comprehensive evaluation when you are ready for diagnosis-level assessment with prepared history.',
          'If you already completed a thorough elsewhere evaluation, bring records to avoid duplicate testing.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'An introductory visit reduces uncertainty before larger commitments.',
          'Full clinical evaluation is a separate, longer visit.',
          'Legitimate telehealth explains limits and licensure up front.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What should I expect from a first telehealth visit?',
        answer:
          'Service overview, pricing and logistics, state eligibility, and next-step planning—not comprehensive diagnosis in one short call.',
      },
      {
        question: 'Does an introductory visit include ADHD diagnosis?',
        answer:
          'No. Diagnosis requires the full structured evaluation pathway.',
      },
      {
        question: 'Is the first visit free?',
        answer:
          'Pricing depends on current Siya Health offerings—confirm during booking or see /pricing.',
      },
      {
        question: 'Can I get prescriptions at an introductory visit?',
        answer:
          'Controlled or new prescriptions generally require full medical evaluation and follow-up standards.',
      },
    ],
    evidence: ['Siya Health intake workflow documentation', 'Telehealth informed consent standards', 'State medical practice telehealth advisories'],
    learnMore: [
      { href: '/telehealth', label: 'Telehealth hub' },
      { href: '/adhd-care', label: 'Adult ADHD evaluation' },
      { href: '/pricing', label: 'Pricing & follow-up plans' },
      { href: '/answers/is-telehealth-legitimate', label: 'Is telehealth legitimate?' },
    ],
    related: ['is-telehealth-legitimate', 'can-adhd-be-diagnosed-online', 'how-online-prescriptions-work', 'what-included-199-adhd-evaluation'],
  },
  {
    slug: 'how-online-prescriptions-work',
    metaDescription:
      'How online prescriptions work legally: telehealth visits, e-prescribing, controlled substances, and red flags.',
    shortAnswer:
      'A licensed clinician in your state evaluates you via telehealth (or approved in-person care), documents the encounter, and sends prescriptions electronically to a pharmacy when clinically appropriate. Controlled substances require an established patient relationship, identity verification, prescription drug monitoring program (PDMP) checks where mandated, and follow-up—not checkout-style ordering from anonymous websites.',
    sections: [
      {
        id: 'legal-pathway',
        heading: 'The legal prescribing pathway',
        paragraphs: [
          'State medical practice acts require a clinician–patient relationship, appropriate standard of care, and accurate medical records. E-prescribing routes orders to pharmacies with audit trails.',
          'Telehealth flexibilities for controlled substances have evolved under federal rules—legitimate practices stay current with DEA and state board guidance.',
        ],
      },
      {
        id: 'controlled-substances',
        heading: 'Controlled substances online',
        paragraphs: [
          'ADHD stimulants and some other medicines are Schedule II or III in the U.S. Prescribing without adequate evaluation, or across state lines without licensure, violates practice standards.',
          'Patients should expect ID verification, PDMP review, periodic follow-up visits, and clear crisis instructions.',
        ],
      },
      {
        id: 'common-misconceptions',
        heading: 'Common misconceptions',
        listItems: [
          'Myth: “Telehealth prescriptions are illegal.” Reality: They are legal when standards are met.',
          'Myth: “Any online form gets Adderall.” Reality: That model is unsafe and often non-compliant.',
          'Myth: “Pharmacy apps replace doctors.” Reality: Pharmacists verify; prescribers diagnose.',
          'Myth: “Out-of-country pharmacies are equivalent.” Reality: Safety and legal risks differ.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek care',
        paragraphs: [
          'Use licensed telehealth for new prescriptions when you need diagnosis and monitoring. Refill-only mills without follow-up are a caution sign. Emergencies need 911—not prescription chat support.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Prescriptions follow documented medical evaluation.',
          'Controlled substances have extra safeguards.',
          'HIPAA-compliant telehealth is the norm for legitimate care.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do online prescriptions work legally?',
        answer:
          'Licensed clinicians evaluate patients, document visits, and e-prescribe when appropriate—meeting state and federal rules, especially for controlled substances.',
      },
      {
        question: 'Can online doctors prescribe Adderall?',
        answer:
          'When ADHD is diagnosed and monitoring requirements are met in your state—not via instant quiz-only sites.',
      },
      {
        question: 'Is it legal to get prescriptions online?',
        answer:
          'Yes with legitimate telehealth; illegal or unsafe when no clinician relationship exists.',
      },
      {
        question: 'What is a PDMP?',
        answer:
          'Prescription drug monitoring programs help clinicians review controlled-substance prescribing history per state rules.',
      },
    ],
    evidence: ['State medical practice acts overview', 'DEA telemedicine prescribing rules', 'FDA online pharmacy safety communications'],
    learnMore: [
      { href: '/prescriptions', label: 'Prescriptions service page' },
      { href: '/blog/how-to-safely-get-prescriptions-online', label: 'Safe online prescriptions (blog)' },
      { href: '/answers/is-telehealth-legitimate', label: 'Is telehealth legitimate?' },
      { href: '/adhd-care', label: 'ADHD care' },
    ],
    related: ['is-telehealth-legitimate', 'can-you-get-adhd-medication-online', 'meet-and-greet-telehealth-expectations'],
  },
];
