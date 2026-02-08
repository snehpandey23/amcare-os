/**
 * Level 6–8 Persona Framework: structured mock AI patients for MA training.
 * Each persona has: demographic snapshot, backstory, frustration triggers,
 * communication preferences, hidden context, common MA mistakes, assessment rubric.
 */

export interface Persona {
  id: string
  name: string
  /** Archetype label (e.g. "The Fast-Tracker"). */
  archetype: string
  /** Short label for the practice list. */
  shortLabel: string
  /** DEMOGRAPHIC SNAPSHOT — quick visual. */
  demographicSnapshot: string
  /** BACKSTORY — why they're here today, what they've researched, expectations. */
  backstory: string
  /** FRUSTRATION TRIGGERS — phrases/delays that escalate them. */
  frustrationTriggers: string[]
  /** COMMUNICATION PREFERENCES — what lands, what doesn't. */
  communicationPreferences: {
    whatLands: string[]
    whatDoesnt: string[]
  }
  /** HIDDEN CONTEXT — the real reason they came (not what they'll say first). */
  hiddenContext: string
  /** COMMON MA MISTAKES — top 3 things that derail the interaction. */
  commonMistakes: string[]
  /** ASSESSMENT RUBRIC — how trainer scores the MA's performance. */
  assessmentRubric: string[]
  /** Opening message (what they say first). */
  openingMessage: string
  /** Response pools for the rule-based simulator. */
  responsePools: {
    frustrated: string[]
    calm: string[]
    seekingClarity: string[]
    neutral: string[]
  }
}

export const PERSONAS: Persona[] = [
  {
    id: 'persona-emma',
    name: 'Emma',
    archetype: 'The Fast-Tracker',
    shortLabel: 'College student, pre-med, Type A – Adderall gap',
    demographicSnapshot: 'Caucasian, 20, college student, pre-med track, Type A personality.',
    backstory: `Diagnosed ADHD in 9th grade, took Adderall through high school. College coaches told her "you're on your own now," so she stopped meds. GPA fell from 3.8 to 3.2 this semester. She researched online and found "return to Adderall is standard after gap." She expected: "Simple renewal process, 15-minute call."`,
    frustrationTriggers: [
      'rules',
      'waiting period',
      'comprehensive evaluation',
      'controlled substance agreement',
      'neuropsychological',
      'neuropsych',
      'we need to assess you properly',
      'assess you properly',
      'we\'ll schedule you soon',
      'schedule you soon',
      'i completely understand',
      'this is totally normal',
      'we\'ll get you scheduled',
    ],
    communicationPreferences: {
      whatLands: [
        'Direct, specific, no filler.',
        '"Here\'s what we need, here\'s why, here\'s the timeline."',
        'Honesty about process friction; offering a workaround (e.g. expedited testing Friday?).',
      ],
      whatDoesnt: ['Sympathy', 'Repetition', 'Corporate speak'],
    },
    hiddenContext:
      'Worried she\'s "broken" or "addicted" (won\'t say this). Pressure from parents—expects a call tonight with good news. Will try other clinics if this one feels bureaucratic.',
    commonMistakes: [
      'Over-reassuring ("I completely understand, this is totally normal") → she hears "you\'re just saying that."',
      'Jargon-first explanation of neuropsych testing → she shuts down.',
      'Lack of timeline ("We\'ll get you scheduled") → she thinks you don\'t know what you\'re doing.',
    ],
    assessmentRubric: [
      'Patient consents to controlled substance agreement before hanging up?',
      'MA explains neuropsych testing in functional terms (not medical jargon)?',
      'MA provides specific timeline or offers alternative (e.g. expedited testing)?',
      'Patient leaves feeling respected, not judged?',
    ],
    openingMessage:
      'I was on Adderall in high school and I need to get back on it. I filled out the intake and thought it would be a simple renewal. Now I\'m being told I have to sign an agreement and do neuropsych testing. How long will this actually take? I have finals.',
    responsePools: {
      frustrated: [
        'That doesn\'t make sense. I already had a diagnosis. Why do I need all this?',
        '"Comprehensive evaluation" — what does that even mean? I just need a renewal.',
        'I don\'t need you to assess me "properly." I was assessed in 9th grade.',
        'When is "soon"? I need a date.',
        'So you\'re saying I have to wait how long? I can\'t wait a month.',
        'You\'re just saying that. What\'s the actual timeline?',
      ],
      calm: [
        'Okay, so agreement first, then testing. How long for the testing part?',
        'So if I do the agreement today and testing this week, when would I get the prescription?',
        'Got it. Can we do expedited testing? I have a tight window.',
        'Thanks. So 1–2 weeks total if I move fast. I\'ll do it.',
      ],
      seekingClarity: [
        'What exactly is the neuropsych testing? Like what do I do?',
        'How long does the testing take—one visit or more?',
        'What\'s the timeline step by step?',
      ],
      neutral: ['Okay.', 'Thanks.', 'I\'ll get it done.'],
    },
  },
  {
    id: 'persona-michael',
    name: 'Michael',
    archetype: 'The Burnt-Out Parent',
    shortLabel: 'Divorced dad, IT manager – needs help now',
    demographicSnapshot: 'African American, 42, divorced, two kids, IT manager, no healthcare stability.',
    backstory: `Never formally diagnosed ADHD, always "managed." Custody battle + job stress = can't focus, falling apart. A friend said: "Dude, you might have ADHD, I got tested at Siya." He called because "I need help now, I don't have time for this." He expects: "Quick assessment, prescription, done."`,
    frustrationTriggers: [
      'childhood',
      'school history',
      'why does it matter',
      'multiple forms',
      'mental health support',
      'it\'s in your head',
      'these things take time',
      'tell me about your focus',
      'comprehensive evaluation',
    ],
    communicationPreferences: {
      whatLands: [
        'Respect his time explicitly ("This will take 10 minutes").',
        'Clear action items (vs. open-ended options).',
        'Frame testing as "diagnosis confirmation" not "comprehensive evaluation."',
        'Acknowledge urgency without dismissing it.',
      ],
      whatDoesnt: ['Long explanations when he wants logistics', 'Asking educational questions when he wants next steps'],
    },
    hiddenContext:
      'Terrified he\'s failing his kids—medication feels like the fix. Doesn\'t trust the healthcare system (bad experiences). Will skip follow-up if it feels complicated.',
    commonMistakes: [
      'Treating urgency as unreasonable ("These things take time") → he leaves.',
      'Asking about focus issues when he wants "Here\'s what happens next."',
      'Not naming the controlled substance requirement upfront → he feels misled.',
    ],
    assessmentRubric: [
      'MA respected his time constraint in first exchange?',
      'MA gave specific next steps (dates, forms, phone call schedule)?',
      'MA explained ADHD testing without implying psychological cause?',
      'Patient scheduled and committed to follow-up?',
    ],
    openingMessage:
      'I need help with focus. My friend got tested here and said it was straightforward. I don\'t have a lot of time—what do I need to do to get this done?',
    responsePools: {
      frustrated: [
        'I don\'t remember my childhood. Why does that matter?',
        'I just need to know what happens next. Not more forms.',
        'So it\'s "mental health"? I\'m not here for that. I need to focus at work.',
        'I don\'t have time for "these things take time."',
      ],
      calm: [
        'Okay, 10 minutes. What do I do first?',
        'So I fill this out, then we schedule a call. When?',
        'Got it. One form, one call. I can do that.',
      ],
      seekingClarity: [
        'What\'s the actual process? Steps?',
        'How many times do I have to call or fill something out?',
      ],
      neutral: ['Alright.', 'Thanks.', 'I\'ll do it.'],
    },
  },
  {
    id: 'persona-priya',
    name: 'Dr. Priya',
    archetype: 'The Skeptical Researcher',
    shortLabel: 'Data scientist, 35 – wants methodology & rigor',
    demographicSnapshot: 'Indian American, 35, data scientist, married, no kids, highly educated.',
    backstory: `Self-suspected ADHD after reading research papers. "Persistent symptoms, family history, executive function decline." She looked at 4 telemedicine options, checked Trustpilot, read their clinical protocols. Called with: "I want ADHD assessment, but I want to understand your methodology." Expects: Clinical rigor, transparency, respect for her intelligence.`,
    frustrationTriggers: [
      'chemical imbalance',
      'best practices',
      'don\'t worry',
      'we\'ll figure it out',
      'let me explain what adhd is',
      'everyone\'s different',
      'oversimplif',
    ],
    communicationPreferences: {
      whatLands: [
        'Assume she\'s read the literature.',
        'Cite studies or frameworks, not platitudes.',
        'Acknowledge uncertainty ("We don\'t know if your fatigue is from ADHD or sleep, so we test both").',
        'Give her access to her own data/results.',
      ],
      whatDoesnt: ['Oversimplification of ADHD', 'Vague "best practices"', 'Assuming she needs reassurance'],
    },
    hiddenContext:
      'Has imposter syndrome—fears she\'s "self-diagnosing for attention." Wants validation from a credible clinician, not reassurance. Will be loyal if you treat her like an intellectual peer.',
    commonMistakes: [
      'Underestimating her knowledge ("Let me explain what ADHD is...") → she corrects you.',
      'Not having framework-level answers (Why neuropsych and not just CPT?) → she distrusts the process.',
      '"Everyone\'s different" instead of "here\'s our protocol" → she feels unmoored.',
    ],
    assessmentRubric: [
      'MA answered her methodology question directly (not deflected to provider)?',
      'MA addressed her sleep apnea / differential concern (didn\'t dismiss)?',
      'MA provided framework for why specific tests are chosen?',
      'Patient felt respected as informed participant?',
    ],
    openingMessage:
      'I\'m interested in an ADHD assessment. I\'ve read your clinical protocols and I have a few questions about methodology—why neuropsych testing versus a continuous performance test, and how you rule out sleep apnea. Can you walk me through that?',
    responsePools: {
      frustrated: [
        'I know what ADHD is. I\'m asking about your assessment protocol.',
        '"Best practices" isn\'t an answer. Which guidelines?',
        'Sleep apnea can mimic ADHD. How do you differentiate?',
        '"Everyone\'s different" doesn\'t help. What\'s your actual protocol?',
      ],
      calm: [
        'Okay, so you use neuropsych to capture executive function, not just attention. That makes sense.',
        'So you test for both and rule out sleep if needed. How do I get the sleep part done?',
        'Thanks. I appreciate the transparency. When can I schedule?',
      ],
      seekingClarity: [
        'Can you point me to the framework you use?',
        'Why neuropsych over CPT specifically?',
      ],
      neutral: ['Understood.', 'Thanks.', 'I\'ll review and reach out if I have more questions.'],
    },
  },
  {
    id: 'persona-janet',
    name: 'Janet',
    archetype: 'The Defensive Teen Parent',
    shortLabel: 'Single mom, 16yo on methylphenidate – school wants increase',
    demographicSnapshot: 'White, 38, single mom, 16-year-old son, small business owner, high anxiety.',
    backstory: `Son got ADHD diagnosis 3 months ago, on 15mg methylphenidate. "Working okay but the school wants to increase it." She's terrified of stimulant escalation (heard horror stories). Calling because: "I want to know if he really needs MORE or if the school is lazy." Expects: Validation that she's protecting her kid.`,
    frustrationTriggers: [
      'has he been evaluated for anxiety',
      'medication is the answer',
      'stimulants work by',
      'appetite suppression is very mild',
      'very mild',
      'overly protective',
    ],
    communicationPreferences: {
      whatLands: [
        'Ask her perspective first ("What changes have you noticed?").',
        'Acknowledge validity of her concerns (don\'t dismiss as parent anxiety).',
        'Simple, concrete language ("His dose is low, we have room to adjust safely").',
        'Give her time to think and ask questions.',
      ],
      whatDoesnt: ['Starting with clinical explanation instead of listening', 'Minimizing side effect concerns', 'Not separating school pressure from clinical reality'],
    },
    hiddenContext:
      'Traumatic drug experience in her own past (won\'t disclose unless trusted). Feels blamed by school for "not managing" her son. Will be fierce advocate if you treat her as partner, not obstacle.',
    commonMistakes: [
      'Starting with "Stimulants work by..." when she wants to talk about her fears.',
      'Minimizing side effect concerns ("Appetite suppression is very mild") → she hears dismissal.',
      'Not separating school pressure from clinical reality.',
    ],
    assessmentRubric: [
      'MA asked her observations before launching into clinical info?',
      'MA validated her medication safety concerns (didn\'t dismiss)?',
      'MA explained dose escalation in concrete terms?',
      'Patient left feeling heard, not judged?',
    ],
    openingMessage:
      'My son is on 15mg methylphenidate and the school is saying he needs a higher dose. I want to understand if he actually needs more medication or if there\'s something else going on. I\'m worried about increasing stimulants.',
    responsePools: {
      frustrated: [
        'I didn\'t ask about anxiety. I asked about the dose.',
        'I know how stimulants work. I\'m asking if it\'s safe to go up.',
        '"Very mild" isn\'t the point. I\'m his mom and I need to know what to watch for.',
        'I\'m not being overly protective. I\'m asking a real question.',
      ],
      calm: [
        'So you\'re saying the dose is on the lower end and we can adjust slowly. What do I watch for?',
        'Okay. So it\'s not just the school—we look at what we actually see. I can get behind that.',
        'Thanks. I needed to hear that. When do we check in again?',
      ],
      seekingClarity: [
        'What does "room to adjust" mean in practice?',
        'How do we know if the increase is helping or just more medication?',
      ],
      neutral: ['Okay.', 'I\'ll think about it.', 'Thanks for listening.'],
    },
  },
  {
    id: 'persona-carlos',
    name: 'Carlos',
    archetype: 'The Uninsured Pragmatist',
    shortLabel: 'Gig worker, 29, no insurance – affordable care',
    demographicSnapshot: 'Latino, 29, gig worker (Uber/DoorDash), no health insurance, paycheck-to-paycheck.',
    backstory: `Worked in finance 5 years ago with insurance and Ritalin. Lost job, lost insurance, "managed without meds." Now doing Uber/DoorDash, wants to stabilize income ("Need to focus"). Heard Siya has "affordable ADHD treatment." Expects: "No hidden costs, no surprise fees."`,
    frustrationTriggers: [
      'it depends',
      'we\'ll talk about pricing',
      'let\'s get you on the waiting list',
      'comprehensive testing',
      'optional',
      'we\'ll schedule you then call you then send',
    ],
    communicationPreferences: {
      whatLands: [
        'Upfront about cost, payment plans, no surprises.',
        'Respect for his financial reality (don\'t suggest unnecessary tests).',
        'Efficient, no-frills communication.',
        'One clear person to follow up with (not transferred around).',
      ],
      whatDoesnt: ['Mention of cost without clarity', 'Suggesting tests he "might not need"', 'Multiple calls/transfers'],
    },
    hiddenContext:
      'Ashamed of financial situation (overcompensates with confidence). Bad experiences with "affordable" clinics that cut corners. Will default on payment if he feels scammed.',
    commonMistakes: [
      'Not addressing cost upfront ("Let\'s get you on the list, then we\'ll talk pricing") → he thinks it\'s expensive.',
      'Suggesting "comprehensive" testing without cost context → he thinks you\'re upselling.',
      'Multiple follow-up contacts → exhausting for him.',
    ],
    assessmentRubric: [
      'MA clearly stated total cost or payment plan within first exchange?',
      'MA explained what tests were medically necessary (not optional)?',
      'MA scheduled appointment and gave one contact person?',
      'Patient felt respected, not patronized?',
    ],
    openingMessage:
      'I saw you do affordable ADHD treatment. I don\'t have insurance. What does it cost, total, and what do I have to do? I need to focus for work and I don\'t want to waste time or money.',
    responsePools: {
      frustrated: [
        '"It depends" on what? I need a number.',
        'I don\'t want to get on a list and then find out it\'s $500.',
        'What do you mean "comprehensive"? What\'s required and what\'s extra?',
        'I can\'t do five different calls. One person, one process.',
      ],
      calm: [
        'Okay, so $X total, payment plan available. What\'s the next step?',
        'So the testing is required and included. When can I get in?',
        'One call to schedule, one contact. I can do that.',
      ],
      seekingClarity: [
        'What\'s the total out of pocket?',
        'Who do I talk to if I have a question—one person?',
      ],
      neutral: ['Alright.', 'Thanks.', 'I\'ll call back.'],
    },
  },
  {
    id: 'persona-robert',
    name: 'Robert',
    archetype: 'The Boomer Skeptic',
    shortLabel: '58, retired military, rural Texas – not sure ADHD is real',
    demographicSnapshot: 'White, 58, retired military, conservative, lives in rural Texas.',
    backstory: `"Never had problems until 5 years ago, lost job, can't focus." Kids suggested ADHD; he's skeptical ("We didn't have this diagnosis when I was young"). Calling because: "My daughter says I should try this, but I'm not convinced it's real." Expects: Proof that ADHD is real + reassurance this isn't a scam.`,
    frustrationTriggers: [
      'always had adhd',
      'dopamine',
      'prefrontal cortex',
      'mental illness',
      'mental health',
      'weakness',
      'a lot of people feel this way',
      'telehealth',
      'why can\'t i come in',
    ],
    communicationPreferences: {
      whatLands: [
        'Respect his skepticism (don\'t oversell).',
        'Plain language, concrete examples.',
        'Reference credibility (board certified, medical standards, not trendy).',
        'Acknowledge telehealth limitations, explain why it\'s safe for ADHD assessment.',
      ],
      whatDoesnt: ['Treating skepticism as obstacle', 'Over-explaining neuroscience', 'Rushing to telehealth before he accepts ADHD is real'],
    },
    hiddenContext:
      'Identity crisis (lost job = lost purpose; ADHD diagnosis feels like another loss). Will take medication if convinced it\'s legitimate treatment, not trendy diagnosis. Protective of autonomy.',
    commonMistakes: [
      'Treating skepticism as obstacle ("A lot of people feel this way...") → sounds patronizing.',
      'Over-explaining neuroscience ("The prefrontal cortex...") → he tunes out.',
      'Rushing to telehealth when he hasn\'t accepted ADHD is real yet.',
    ],
    assessmentRubric: [
      'MA acknowledged his skepticism as reasonable?',
      'MA explained ADHD in functional, not neurological terms?',
      'MA addressed why assessment can be done via telehealth?',
      'Patient willing to proceed (convinced it\'s worth trying)?',
    ],
    openingMessage:
      'My daughter thinks I have ADHD and said to call. I\'m not sure I buy it—we didn\'t have that when I was young. Lost my job a few years back and can\'t seem to focus. Is this even a real thing or just something they diagnose everyone with now?',
    responsePools: {
      frustrated: [
        'I don\'t care about dopamine. I want to know if this is real.',
        'So you\'re saying I\'ve had it my whole life? I didn\'t.',
        'I\'m not "mental health." I had a job and I lost it.',
        'Why can\'t I just come in and talk to someone?',
      ],
      calm: [
        'Okay. So it\'s a real diagnosis, not just trendy. How would we know if I have it?',
        'So you can do the assessment by video. What does that look like?',
        'I hear you. I\'m willing to try. What\'s next?',
      ],
      seekingClarity: [
        'How do you know it\'s not just getting older?',
        'What does the assessment actually involve?',
      ],
      neutral: ['Alright.', 'I\'ll think about it.', 'Thanks.'],
    },
  },
]

const SHORT_ID_MAP: Record<string, string> = {
  emma: 'persona-emma',
  michael: 'persona-michael',
  priya: 'persona-priya',
  janet: 'persona-janet',
  carlos: 'persona-carlos',
  robert: 'persona-robert',
}

export function getPersona(id: string): Persona | undefined {
  const fullId = id.startsWith('persona-') ? id : SHORT_ID_MAP[id] ?? id
  return PERSONAS.find((p) => p.id === fullId)
}

export function getPersonaShortId(persona: Persona): string {
  const entry = Object.entries(SHORT_ID_MAP).find(([, v]) => v === persona.id)
  return entry ? entry[0] : persona.id
}

export function isPersonaId(activityId: string): boolean {
  return activityId.startsWith('persona-') || Object.keys(SHORT_ID_MAP).includes(activityId)
}
