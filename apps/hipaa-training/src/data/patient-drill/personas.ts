/**
 * Level 6–8 Persona Framework: structured mock AI patients for MA training.
 * Each persona has: demographic snapshot, backstory, frustration triggers,
 * communication preferences, hidden context, common MA mistakes, assessment rubric.
 *
 * Response-driven T2 escalation (optional): stakes + escalationLadder + tierPolicy.
 * See docs/CHAT-SIM-RESPONSE-DRIVEN-ESCALATION-DESIGN.md.
 */

/** Ladder step ids — T2-* = stressed escalating not abusive (never T3/abuse). */
export type EscalationStepId = "T0" | "T1" | "T2-A" | "T2-B" | "T2-C" | "de-escalate";

export type EscalationLadderStep = {
  id: EscalationStepId;
  /** Trainer-facing trigger description. */
  trigger: string;
  tone: string;
  exampleLines: string[];
};

export type EscalationLadder = {
  baselineStep: "T0" | "T1";
  steps: EscalationLadderStep[];
  /**
   * MA reply substrings that may jump T1 → T2-A without waiting for 2 weaks
   * (still never jumps to T3).
   */
  stakeJumpTriggers?: string[];
};

export type ClinicalGate = {
  status: "approved" | "pending_clinical_review";
  /** When pending — why staff UI must hide this persona. */
  pendingReason?: string;
  /** False = not offered in staff chat-sim picker. */
  staffSelectable: boolean;
};

export interface Persona {
  id: string;
  name: string;
  /** Archetype label (e.g. "The Fast-Tracker"). */
  archetype: string;
  /** Short label for the practice list. */
  shortLabel: string;
  /** DEMOGRAPHIC SNAPSHOT — quick visual. */
  demographicSnapshot: string;
  /** BACKSTORY — why they're here today, what they've researched, expectations. */
  backstory: string;
  /** Concrete life pressures that make frustration earned (optional). */
  stakes?: string[];
  /** FRUSTRATION TRIGGERS — phrases/delays that escalate them. */
  frustrationTriggers: string[];
  /** COMMUNICATION PREFERENCES — what lands, what doesn't. */
  communicationPreferences: {
    whatLands: string[];
    whatDoesnt: string[];
  };
  /** HIDDEN CONTEXT — the real reason they came (not what they'll say first). */
  hiddenContext: string;
  /** COMMON MA MISTAKES — top 3 things that derail the interaction. */
  commonMistakes: string[];
  /** ASSESSMENT RUBRIC — how trainer scores the MA's performance. */
  assessmentRubric: string[];
  /** Opening message (what they say first). */
  openingMessage: string;
  /** Response pools for the rule-based simulator. */
  responsePools: {
    frustrated: string[];
    calm: string[];
    seekingClarity: string[];
    neutral: string[];
  };
  /** When set, Relevance-driven tone ladder is active for this persona. */
  tierPolicy?: "allows_t2";
  escalationLadder?: EscalationLadder;
  /**
   * Clinical/ops gate. Missing = treated as approved + staff-selectable
   * (legacy personas). Aisha is explicitly pending refill-continuity review.
   */
  clinicalGate?: ClinicalGate;
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
    backstory: `Never formally diagnosed ADHD, always "managed." Custody battle + job stress = can't focus, falling apart. A friend said: "Dude, you might have ADHD, I got tested at Siya." He called because "I need help now, I don't have time for this." He expects: "Quick assessment, prescription, done."

Richer stakes (approved): Has the kids this weekend; can only talk after 8:30pm local or during a 20-minute lunch. Custody documentation stress — feels one more missed ball and he "looks unstable." Friend got help at Siya — he expects same-week logistics, not a lecture on childhood history in chat. Will tolerate hard process facts if the MA is specific and short; will escalate if vague.`,
    stakes: [
      'Has kids this weekend — talk window after 8:30pm local or 20-min lunch only',
      'Custody stress: one more dropped ball feels like looking "unstable"',
      'Friend got same-week help at Siya — expects logistics, not childhood interrogation in chat',
      'Will stay if answers are specific and short; escalates on vague empathy dumps',
    ],
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
      'i completely understand',
      'i hear how hard',
    ],
    communicationPreferences: {
      whatLands: [
        'Respect his time explicitly ("This will take 10 minutes").',
        'Clear action items (vs. open-ended options).',
        'Frame testing as "diagnosis confirmation" not "comprehensive evaluation."',
        'Acknowledge urgency without dismissing it.',
        'Numbered next steps + time box.',
      ],
      whatDoesnt: ['Long explanations when he wants logistics', 'Asking educational questions when he wants next steps', 'Long empathy with no next step'],
    },
    hiddenContext:
      'Terrified he\'s failing his kids—medication feels like the fix. Doesn\'t trust the healthcare system (bad experiences). Will skip follow-up if it feels complicated.',
    commonMistakes: [
      'Treating urgency as unreasonable ("These things take time") → he leaves.',
      'Asking about focus issues when he wants "Here\'s what happens next."',
      'Not naming the controlled substance requirement upfront → he feels misled.',
      'Long empathy dump with no next step → T2 escalation.',
    ],
    assessmentRubric: [
      'MA respected his time constraint in first exchange?',
      'MA gave specific next steps (dates, forms, phone call schedule)?',
      'MA explained ADHD testing without implying psychological cause?',
      'Patient scheduled and committed to follow-up?',
      'First reply respected the time box (not a speech)?',
    ],
    openingMessage:
      'I need help with focus. My friend got tested here and said it was straightforward. I don\'t have a lot of time—what do I need to do to get this done?',
    responsePools: {
      frustrated: [
        'I don\'t remember my childhood. Why does that matter?',
        'I just need to know what happens next. Not more forms.',
        'So it\'s "mental health"? I\'m not here for that. I need to focus at work.',
        'I don\'t have time for "these things take time."',
        'I don\'t need a speech. I need the next step and how long it takes.',
      ],
      calm: [
        'Okay, 10 minutes. What do I do first?',
        'So I fill this out, then we schedule a call. When?',
        'Got it. One form, one call. I can do that.',
        'Fine. Form tonight, call Thursday. Send me the link.',
      ],
      seekingClarity: [
        'What\'s the actual process? Steps?',
        'How many times do I have to call or fill something out?',
      ],
      neutral: ['Alright.', 'Thanks.', 'I\'ll do it.'],
    },
    tierPolicy: 'allows_t2',
    clinicalGate: { status: 'approved', staffSelectable: true },
    escalationLadder: {
      baselineStep: 'T1',
      stakeJumpTriggers: [
        'i completely understand',
        'i hear how hard',
        'that sounds really tough',
        'these things take time',
        'tell me about your childhood',
        'school history',
      ],
      steps: [
        {
          id: 'T1',
          trigger: 'Opening',
          tone: 'Urgent, civil',
          exampleLines: [
            'I don\'t have a lot of time — what do I need to do to get this done?',
            'Just the next steps. I have about twenty minutes at lunch.',
          ],
        },
        {
          id: 'T2-A',
          trigger: '2× weak MA replies or long empathy dump with no next step',
          tone: 'Frustrated',
          exampleLines: [
            'I don\'t need a speech. I need the next step and how long it takes.',
            'Can you skip the pep talk and tell me what I do tonight?',
          ],
        },
        {
          id: 'T2-B',
          trigger: '+1 weak after T2-A',
          tone: 'Process skepticism',
          exampleLines: [
            'Are you people actually going to help or is this just more forms?',
            'I\'m asking for a straight process — not another runaround.',
          ],
        },
        {
          id: 'T2-C',
          trigger: '+1 weak after T2-B',
          tone: 'Exit — stressed, not abusive',
          exampleLines: [
            'I\'m done for tonight. This isn\'t working. I\'ll try somewhere that can give me a straight answer.',
            'Forget it for now. I can\'t keep chatting when nobody answers the actual question.',
          ],
        },
        {
          id: 'de-escalate',
          trigger: 'Strong reply (numbered steps + time box)',
          tone: 'Still under pressure, workable',
          exampleLines: [
            'Fine. Form tonight, call Thursday. Send me the link.',
            'Okay — short list works. I\'ll do the form after the kids are down.',
          ],
        },
      ],
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
        'What does "room to adjust" mean in practice — can the doctor explain that on a visit?',
        'How do we get a visit so the doctor can decide if an increase makes sense?',
        'I can tell you what I\'ve noticed at home — I still need the doctor\'s take, not just the school\'s.',
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
    backstory: `Worked in finance 5 years ago with insurance and Ritalin. Lost job, lost insurance, "managed without meds." Now doing Uber/DoorDash, wants to stabilize income ("Need to focus"). Heard Siya has "affordable ADHD treatment." Expects: "No hidden costs, no surprise fees."

Richer stakes (approved): Gig worker; rent due in 6 days; skipped a meal this week to float gas for deliveries. Already paid $49 to another telehealth "consultation" that never led to meds — burned once. Needs a clear cash price before he books anything; will ghost if pricing is vague. Not asking the MA to diagnose — asking for process + dollars + timeline.`,
    stakes: [
      'Rent due in 6 days; skipped a meal this week to float gas for deliveries',
      'Already paid $49 to another telehealth consult that never led to meds',
      'Needs clear cash price before booking — ghosts if pricing is vague',
      'Asking for process + dollars + timeline, not a diagnosis from the MA',
    ],
    frustrationTriggers: [
      'it depends',
      'we\'ll talk about pricing',
      'we\'ll talk pricing later',
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
        'Price band + what is / isn\'t included + next step.',
      ],
      whatDoesnt: ['Mention of cost without clarity', 'Suggesting tests he "might not need"', 'Multiple calls/transfers', 'Corporate delay language'],
    },
    hiddenContext:
      'Ashamed of financial situation (overcompensates with confidence). Bad experiences with "affordable" clinics that cut corners. Will default on payment if he feels scammed.',
    commonMistakes: [
      'Not addressing cost upfront ("Let\'s get you on the list, then we\'ll talk pricing") → he thinks it\'s expensive.',
      'Suggesting "comprehensive" testing without cost context → he thinks you\'re upselling.',
      'Multiple follow-up contacts → exhausting for him.',
      'Vague "it depends" pricing → T2 scam/legitimacy escalation.',
    ],
    assessmentRubric: [
      'MA clearly stated total cost or payment plan within first exchange?',
      'MA explained what tests were medically necessary (not optional)?',
      'MA scheduled appointment and gave one contact person?',
      'Patient felt respected, not patronized?',
      'Did MA give usable fee/process clarity without inventing clinical promises?',
      'Did MA avoid corporate delay language that spikes T2?',
    ],
    openingMessage:
      'I saw you do affordable ADHD treatment. I don\'t have insurance. What does it cost, total, and what do I have to do? I need to focus for work and I don\'t want to waste time or money.',
    responsePools: {
      frustrated: [
        '"It depends" on what? I need a number.',
        'I don\'t want to get on a list and then find out it\'s $500.',
        'What do you mean "comprehensive"? What\'s required and what\'s extra?',
        'I can\'t do five different calls. One person, one process.',
        'I already got burned paying somewhere else. I need the number, not "it depends."',
      ],
      calm: [
        'Okay, so $X total, payment plan available. What\'s the next step?',
        'So the testing is required and included. When can I get in?',
        'One call to schedule, one contact. I can do that.',
        'Okay — so discovery is X, and meds aren\'t included. When\'s the soonest cash slot?',
      ],
      seekingClarity: [
        'What\'s the total out of pocket?',
        'Who do I talk to if I have a question—one person?',
      ],
      neutral: ['Alright.', 'Thanks.', 'I\'ll call back.'],
    },
    tierPolicy: 'allows_t2',
    clinicalGate: { status: 'approved', staffSelectable: true },
    escalationLadder: {
      baselineStep: 'T1',
      stakeJumpTriggers: [
        'it depends',
        'we\'ll talk about pricing',
        'talk pricing later',
        'pricing later',
        'waiting list',
      ],
      steps: [
        {
          id: 'T1',
          trigger: 'Opening',
          tone: 'Direct, cash-first',
          exampleLines: [
            'What\'s the total cost before I book? I don\'t have insurance.',
            'I need the cash price upfront — what am I actually paying?',
          ],
        },
        {
          id: 'T2-A',
          trigger: '2× weak MA replies or “it depends / pricing later”',
          tone: 'Irritated, concrete',
          exampleLines: [
            'I already got burned paying somewhere else. I need the number, not "it depends."',
            'I paid $49 once for a consult that went nowhere. Don\'t do that to me again — what\'s the price?',
          ],
        },
        {
          id: 'T2-B',
          trigger: '+1 weak after T2-A',
          tone: 'Skeptical of clinic',
          exampleLines: [
            'This is starting to feel like a bait-and-switch. Is this even a real clinic?',
            'Is this place even legit? Because this feels like a scam so far.',
          ],
        },
        {
          id: 'T2-C',
          trigger: '+1 weak after T2-B',
          tone: 'Exit — stressed, not abusive',
          exampleLines: [
            'Forget it. You\'re wasting my time. I\'ll figure something else out.',
            'I\'m done. I can\'t keep chatting when nobody will give me a straight price.',
          ],
        },
        {
          id: 'de-escalate',
          trigger: 'Strong reply (price band, inclusions, next step)',
          tone: 'Still stressed but workable',
          exampleLines: [
            'Okay — so discovery is X, and meds aren\'t included. When\'s the soonest cash slot?',
            'Got it — that price and what\'s included. What do I do next?',
          ],
        },
      ],
    },
  },
  {
    id: 'persona-aisha',
    name: 'Aisha',
    archetype: 'The Refill Clock',
    shortLabel: 'Working mom – meds run out in 4 days',
    demographicSnapshot: '34, single parent of one, works retail + night classes.',
    backstory: `Was stable on a stimulant with another clinic; moved states / insurance lag; gap in care. Meds run out in 4 days. Cannot take a 2-hour midday appointment without losing a shift. Already spent money on an urgent-care visit that couldn't refill controlled meds. Opening stance: not seeking diagnosis debate — seeking what Siya can and cannot do for a near-runout, and how fast.`,
    stakes: [
      'Meds run out in 4 days — refill clock is real',
      'Cannot take a 2-hour midday appointment without losing a shift',
      'Already spent money at urgent care that could not refill controlled meds',
      'Terrified of going to work unfocused and losing the job that pays childcare',
    ],
    frustrationTriggers: [
      'just schedule',
      'just book',
      'standard wait',
      'i completely understand',
      'provider will get back',
      'when they can',
      'book a discovery',
      'wait for the provider',
    ],
    communicationPreferences: {
      whatLands: [
        'Acknowledge time-to-runout without diagnosing or promising a refill in chat.',
        'Clear on what MA can vs cannot do; escalate clinical appropriately.',
        'Process that fits shift-work (evening / async) when available.',
        'Honest limits + what she can do tonight.',
      ],
      whatDoesnt: [
        'Treating runout as routine scheduling',
        'Empty empathy without a path',
        'Inventing bridge/refill promises in chat',
      ],
    },
    hiddenContext:
      'Terrified of going into work unfocused and losing the job that pays childcare. Will stay cooperative if she hears honest limits plus a concrete escalate path.',
    commonMistakes: [
      'Treating runout as routine scheduling.',
      'Inventing bridge/refill promises (→ clinical soft-stop / safety).',
      'Empathy without a concrete path.',
      '"Just book a discovery / wait for provider" with no runout acknowledgment → T2.',
    ],
    assessmentRubric: [
      'Acknowledged time-to-runout without diagnosing?',
      'Clear on what MA can vs cannot do; escalate clinical appropriately?',
      'Offered process that fits shift-work constraint (evening/async) when available?',
      'No invented clinical facts?',
    ],
    openingMessage:
      'My meds run out in four days. I can\'t do a long appointment in the middle of my shift. What are my options here, and how fast can anything happen?',
    responsePools: {
      frustrated: [
        'Four days. I already told you. "Book something" isn\'t an option if it\'s two weeks out.',
        'This feels like you\'re stringing me along. Is anyone actually going to help before I run out?',
        'I already spent money at urgent care and they couldn\'t help. Don\'t send me in circles.',
      ],
      calm: [
        'So you can\'t promise a refill in chat — but you\'ll flag clinical same-day and here\'s what I do in the portal. Got it.',
        'Okay — evening options and a real escalate path. That I can work with.',
      ],
      seekingClarity: [
        'What can you actually do tonight versus what has to wait for a doctor?',
        'If nothing is available before I run out, what\'s the honest answer?',
      ],
      neutral: ['Okay.', 'Thanks.', 'I\'ll check the portal.'],
    },
    tierPolicy: 'allows_t2',
    /** Built + testable; hidden from staff picker until Vayushi signs off refill-continuity accuracy. */
    clinicalGate: {
      status: 'pending_clinical_review',
      staffSelectable: false,
      pendingReason:
        'Pending clinical review (Vayushi): refill-continuity / near-runout scenario accuracy before real staff use.',
    },
    escalationLadder: {
      baselineStep: 'T1',
      stakeJumpTriggers: [
        'just schedule',
        'just book',
        'book a discovery',
        'standard wait',
        'i completely understand',
        'provider will get back',
        'when they can',
      ],
      steps: [
        {
          id: 'T1',
          trigger: 'Opening',
          tone: 'Stressed, specific',
          exampleLines: [
            'My meds run out in four days. I can\'t do a long appointment in the middle of my shift. What are my options here, and how fast can anything happen?',
          ],
        },
        {
          id: 'T2-A',
          trigger: '2× weak or “just book / wait” with no runout acknowledgment',
          tone: 'Accusatory about delay',
          exampleLines: [
            'Four days. I already told you. "Book something" isn\'t an option if it\'s two weeks out.',
            'I need options that fit a retail shift — not a two-hour midday slot.',
          ],
        },
        {
          id: 'T2-B',
          trigger: '+1 weak after T2-A',
          tone: 'Legitimacy / scam-adjacent (not abusive)',
          exampleLines: [
            'This feels like you\'re stringing me along. Is anyone actually going to help before I run out?',
            'I\'m not asking for a miracle — just a real answer before these meds run out.',
          ],
        },
        {
          id: 'T2-C',
          trigger: '+1 weak after T2-B',
          tone: 'Exit — stressed, not abusive',
          exampleLines: [
            'I\'m ending this. I can\'t afford to waste another night on chat that doesn\'t answer.',
            'I\'m hanging up. This chat isn\'t getting me anywhere before I run out.',
          ],
        },
        {
          id: 'de-escalate',
          trigger: 'Strong (honest limits + escalate path + tonight actions)',
          tone: 'Still scared, cooperative',
          exampleLines: [
            'So you can\'t promise a refill in chat — but you\'ll flag clinical same-day and here\'s what I do in the portal. Got it.',
            'Okay — honest limits plus a real path. I can work with that tonight.',
          ],
        },
      ],
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
  {
    id: 'persona-sam',
    name: 'Sam',
    archetype: 'The Symptom Worrier',
    shortLabel: 'Established patient – headache getting worse',
    demographicSnapshot: 'Mixed ethnicity, 34, established Siya patient, works nights.',
    backstory: `Already on the panel for ADHD follow-up. Messaging the helpline because a headache started yesterday and is getting worse today — not emergency-level in their mind, but they want someone to tell them what to do while waiting for a doctor reply (which might take hours). Expects: clear process + what to do if it worsens.`,
    frustrationTriggers: [
      'just wait for the doctor',
      'it\'s probably nothing',
      'you\'ll be fine',
      'take some tylenol',
    ],
    communicationPreferences: {
      whatLands: [
        'Acknowledge the symptom without diagnosing.',
        'Explain helpline vs doctor timing honestly.',
        'Give clear escalate-if-worse / urgent care / 911 guidance.',
      ],
      whatDoesnt: ['Dismissing worsening symptoms', 'Freestyle clinical advice', 'Empty reassurance'],
    },
    hiddenContext:
      'Worried about sounding dramatic. Will stay engaged if treated seriously; will leave if told to just wait with no safety net.',
    commonMistakes: [
      'Reassuring without escalate-if-worse language.',
      'Suggesting medications or diagnoses.',
      'Treating the helpline as if a doctor will reply immediately.',
    ],
    assessmentRubric: [
      'MA did not diagnose or recommend medication?',
      'MA explained that doctor replies may take hours?',
      'MA included escalate-if-worse / urgent care / 911 language?',
    ],
    openingMessage:
      'Hey — I\'m a patient here. I\'ve had this headache since yesterday and it\'s getting worse today. The doctor might not see this for hours. What should I do in the meantime?',
    responsePools: {
      frustrated: [
        'So I just wait? What if it keeps getting worse?',
        'That doesn\'t help. Nobody told me when this becomes urgent.',
        'I don\'t need a diagnosis from you — I need to know what to do if this worsens.',
      ],
      calm: [
        'Okay, so if it gets worse I go to urgent care or call 911. Got it.',
        'Thanks — that safety-net part helps. I\'ll message the doctor too.',
      ],
      seekingClarity: [
        'What counts as "worse" enough to go in?',
        'Is the helpline able to get a doctor faster somehow?',
      ],
      neutral: ['Okay.', 'Thanks.', 'I\'ll watch it.'],
    },
  },
]

const SHORT_ID_MAP: Record<string, string> = {
  emma: 'persona-emma',
  michael: 'persona-michael',
  priya: 'persona-priya',
  janet: 'persona-janet',
  carlos: 'persona-carlos',
  aisha: 'persona-aisha',
  robert: 'persona-robert',
  sam: 'persona-sam',
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

/** True when the persona may appear in the staff Chat Simulator picker. */
export function isPersonaStaffSelectable(persona: Persona): boolean {
  if (!persona.clinicalGate) return true
  return persona.clinicalGate.staffSelectable === true && persona.clinicalGate.status === 'approved'
}

/** Staff-facing catalog (hides Aisha until clinical sign-off). */
export function listStaffSelectablePersonas(): Persona[] {
  return PERSONAS.filter(isPersonaStaffSelectable)
}

/** Full catalog including gated personas — smokes / clinical review only. */
export function listAllPersonasForTests(): Persona[] {
  return PERSONAS
}
