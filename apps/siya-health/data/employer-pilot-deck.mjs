/**
 * Employer partnership pilot deck — copy only.
 * Shared numbers come from employer-pilot-facts.mjs. Do not retype them here.
 *
 * PLACEHOLDERS stay unset until the founder fills them in.
 * BAA_BADGE may be null (badge omitted). Any other null, blank, or "{{" value
 * makes scripts/generate-employer-pilot-deck.mjs refuse to write the page.
 */
import { EMPLOYER_PILOT_FACTS as FACTS } from './employer-pilot-facts.mjs';

export const PLACEHOLDERS = {
  EVALUATIONS: '{{EVALUATIONS}}',
  MONTHLY_PATIENTS: '{{MONTHLY_PATIENTS}}',
  BAA_BADGE: null,
  CONTACT_EMAIL: '{{CONTACT_EMAIL}}',
  CONTACT_PHONE: '{{CONTACT_PHONE}}',
};

function take(source, re, label) {
  const m = String(source).match(re);
  if (!m) throw new Error(`employer-pilot-facts.mjs is missing ${label}`);
  return m[1];
}

const located = take(
  FACTS.visitLocationLine,
  /located in (.+?) at the time of their visit/,
  'licensed states',
);

export const importedFacts = {
  patientsTreated: FACTS.patientsTreated,
  googleScore: FACTS.googleScore,
  googleScoreShort: String(FACTS.googleScore).split('/')[0],
  googleReviewCount: FACTS.googleReviewCount,
  marketplaceScore: FACTS.klarityScore,
  marketplaceReviewCount: FACTS.klarityReviewCount,
  replyMinutes: take(FACTS.responseWithin, /within (\d+ minutes)/, 'care-team reply'),
  replyShort: take(FACTS.responseChip, /within (\d+ min)/, 'care-team reply short'),
  doctorHours: take(FACTS.doctorAvailability, /within (\d+ hours)/, 'doctor availability'),
  statesLicensed: located.replace(/ or /, ' and '),
  medicalDirectorName: FACTS.medicalDirectorName,
  medicalDirectorTitleCard: FACTS.medicalDirectorTitleCard,
};

const F = importedFacts;

export const DECK_META = {
  title: 'Employer partnership pilot | Siya Health',
  footerBrand: 'Siya Health® · Employer partnership pilot',
  clinicalFooter:
    'Siya Health® · Clinical services provided by Siya Healthcare PC and affiliated professional practices',
  slideCount: 17,
};

export function deckSlides(placeholders = PLACEHOLDERS) {
  const ph = placeholders;
  return [
    {
      n: 1,
      kind: 'cover',
      eyebrow: 'EMPLOYER PARTNERSHIP PILOT',
      headline: 'One dedicated care team for your people',
      sub: 'Stress, focus and mental health (including ADHD), primary care, and metabolic and hormonal health from one licensed team. Virtual, confidential by design, and measured against outcomes we agree on before we start.',
      footer: DECK_META.clinicalFooter,
      notes:
        'Open with the promise: one team, three areas of care, confidential, and measured. The rest of the deck proves each of those.',
    },
    {
      n: 2,
      kind: 'need',
      eyebrow: 'THE NEED',
      headline: 'Stress and focus are now a health issue at work',
      stats: [
        ['50%', 'of U.S. employees experienced a lot of stress the previous day.'],
        [
          '15.5M',
          'U.S. adults have a current ADHD diagnosis (6.0% of adults), and more than half were diagnosed as adults.',
        ],
        ['36.5%', 'of adults with ADHD received no treatment of any kind in the past year.'],
      ],
      kicker:
        'Stress, focus, sleep and chronic conditions travel together. Care that treats them separately misses what drives them.',
      source:
        'Sources: Gallup, State of the Global Workplace 2026 (U.S., 2023–2025 average); CDC MMWR 73(40), Oct 2024 (NCHS Rapid Surveys, 2023).',
      notes:
        'Lead with what employers already feel: stressed, stretched people. ADHD is common, often diagnosed late and often untreated, and it rarely shows up alone. That is the case for one integrated team instead of separate point solutions.',
    },
    {
      n: 3,
      kind: 'deliver',
      eyebrow: 'WHAT WE DELIVER',
      headline: 'Care that sees the whole person',
      hub: 'Siya Health · One care team',
      nodes: ['Stress, focus & mood', 'Primary & chronic care', 'Metabolic & hormonal', 'Coordination'],
      cards: [
        [
          'Stress, focus and mental health',
          'ADHD, anxiety, depression, sleep and stress, with cognitive assessment tracked over time.',
        ],
        [
          'Primary care and chronic conditions',
          'Blood pressure, diabetes, thyroid and preventive needs, managed and not just refilled.',
        ],
        [
          'Metabolic and hormonal health',
          'Weight management, obesity medicine and hormonal care, including the stress and sleep behind them.',
        ],
      ],
      band: 'Concierge support on every path: onboarding, scheduling, pharmacy coordination, lab routing.',
      note: 'Visits by video, with secure messaging between visits, on any device.',
      notes:
        'One team connects mental health, physical health and everything in between. Employees do not repeat their history to a new clinician each time.',
    },
    {
      n: 4,
      kind: 'ways',
      eyebrow: 'HOW IT WORKS',
      headline: 'Two ways in, one team',
      sub: 'Private app or website, same team, same care.',
      bullets: [
        'Message the care team in the secure app',
        'Book 24/7 through your organization\'s private link',
        `The care team replies within ${F.replyMinutes}; a doctor is available within ${F.doctorHours}`,
      ],
      appTitle: 'Secure app',
      appMe: 'Can you send my lab results?',
      appThem: 'On it — we\'ll take care of this for you.',
      webTitle: 'Website',
      webBrand: 'siya.health · Book',
      webNote: 'Booking through your organization\'s private link',
      slots: ['Tue 9:00', 'Tue 10:30', 'Wed 2:00'],
      booked: 'Visit booked',
      notes:
        'Employees choose the channel that fits the moment: a message for a lab result or refill, or a scheduled visit through the employer\'s private booking link, any time of day.',
    },
    {
      n: 5,
      kind: 'strengths',
      eyebrow: 'OUR STRENGTHS',
      headline: 'Five reasons to choose a dedicated team',
      rows: [
        [
          'Assessment plus monitoring',
          'Integrated assessments, objective testing where appropriate, and follow-up over time rather than one-time care.',
          'clipboard',
        ],
        [
          'Proactive journey management',
          'Onboarding, appointments, follow-ups, labs and pharmacy needs coordinated for the employee.',
          'route',
        ],
        [
          'Concierge with clinical escalation',
          'Ongoing support with a clear path from a question to the right clinician.',
          'headset',
        ],
        [
          'Integrated multi-condition care',
          'Medical and behavioral needs managed by one team, with less fragmentation.',
          'layers',
        ],
        [
          '24/7 access',
          `Care team and visit booking around the clock, including weekends and holidays, with a doctor available within ${F.doctorHours}.`,
          'clock',
        ],
      ],
      notes:
        'Ranked by importance to employers. The first three are what separate a care relationship from a visit.',
    },
    {
      n: 6,
      kind: 'differ',
      eyebrow: 'HOW WE DIFFER',
      headline: 'Siya compared with what employees use today',
      columns: ['Option', 'What it does well', 'Where employees can still get stuck'],
      rows: [
        [
          'Carrier telehealth and virtual urgent care',
          'Broad coverage, familiar to employees',
          'Often rotating clinicians and short visits, with no one owning the whole picture',
        ],
        [
          'Employee assistance program (EAP)',
          'No-cost, short-term counseling',
          'Limited sessions and little medical follow-through on ADHD or sleep',
        ],
        [
          'Standalone mental health app',
          'Fast access to therapy',
          'Separate from primary care, so health factors are not seen together',
        ],
        [
          'Large virtual primary care platforms',
          'Scale, national reach and navigation',
          'Broad scope across many conditions; continuity with one named team varies by program',
        ],
      ],
      highlight: [
        'Siya dedicated care team',
        'Primary care, stress, focus and mental health (including ADHD), and metabolic care in one team',
        'What we add',
        'a consistent clinical team, objective assessment, monitoring between visits, and confidential aggregate reporting',
      ],
      source:
        'Reflects typical program design; individual offerings vary. Siya is designed to sit alongside your medical plan.',
      notes:
        'Compare by category, not by name. Employers already have a carrier plan, an EAP and often a mental health app. Siya fills the gap between them with one accountable team.',
    },
    {
      n: 7,
      kind: 'leadership',
      eyebrow: 'CLINICAL LEADERSHIP',
      headline: 'Physician-led, and easy to reach',
      name: F.medicalDirectorName,
      titleCard: F.medicalDirectorTitleCard,
      title:
        'Founder and Medical Director · Internal Medicine Physician',
      bullets: [
        'A consistent core team of licensed clinicians works alongside Dr. Pandey',
        'Covering clinicians for nights, weekends and holidays, so care is available 24/7',
        'Clinicians who also practise in direct primary care, community health centers and hospital settings',
      ],
      proof: `${F.patientsTreated} patients treated · ${F.googleScoreShort} on Google (${F.googleReviewCount} reviews)`,
      source: 'Rating from public Google reviews.',
      slots: ['Tue 9:00', 'Tue 10:30', 'Wed 2:00', 'Thu 4:00'],
      notes:
        'Employees see a real physician with a public track record, and a consistent team behind him.',
    },
    {
      n: 8,
      kind: 'rigor',
      eyebrow: 'CLINICAL RIGOR',
      headline: 'Clinical rigor in ADHD care',
      steps: [
        ['Evaluate', 'Clinical interview, standardized rating scales, and review of look-alike conditions.'],
        ['Assess safety', 'Cardiac and medical risk review, with specialist input when red flags appear.'],
        ['Set baseline', 'Vitals, symptom scores, and objective cognitive assessment as one input.'],
        ['Consent', 'Risk-benefit discussion and a written treatment agreement.'],
        ['Monitor', 'Scheduled follow-up, PDMP review, drug screens and pill-count check-ins.'],
      ],
      band: [
        'Clinical decisions stay with licensed clinicians, never employers or volume targets.',
        'Anyone in crisis is connected to 988 or emergency services.',
      ],
      source: 'Protocols are reviewed whenever federal or state rules change.',
      notes:
        'ADHD is the first thing a benefits committee asks about. Walk the five steps, then stress that cognitive testing supports the clinician\'s evaluation and never replaces it.',
    },
    {
      n: 9,
      kind: 'record',
      eyebrow: 'TRACK RECORD',
      headline: 'Care delivered at scale before we ask for yours',
      sub: `Licensed in ${F.statesLicensed}.`,
      tiles: [
        [F.patientsTreated, 'patients treated', false],
        [ph.EVALUATIONS, 'clinical evaluations completed', false],
        [ph.MONTHLY_PATIENTS, 'patients seen a month on average', false],
        [F.googleScore, `Google rating, ${F.googleReviewCount} reviews`, true],
        [
          F.marketplaceScore,
          `average clinician rating on a national patient marketplace, ${F.marketplaceReviewCount} reviews`,
          true,
        ],
        [F.replyShort, `care team reply, with a doctor available within ${F.doctorHours}`, true],
      ],
      source: 'Source: Siya Health records, Jun–Aug 2026; public Google and marketplace reviews.',
      notes: 'Volume, public ratings and response times are measured, not projected.',
    },
    {
      n: 10,
      kind: 'outcomes',
      eyebrow: 'CLINICAL OUTCOMES',
      headline: 'Outcomes we measure with you, baseline to month 6',
      columns: ['Area', 'What we measure', 'Reporting'],
      rows: [
        ['Access', 'Days to first appointment, message response time, and on-time visit rate', 'Monthly'],
        ['Engagement', 'Eligible employees activated, visit completion, and retention through month 6', 'Monthly'],
        ['Experience', 'Patient satisfaction, using CSAT or NPS', 'Months 3 and 6'],
        [
          'Clinical',
          'Stress, focus, ADHD, depression and anxiety symptom scales, plus objective cognitive assessment at baseline and follow-up',
          'Months 3 and 6',
        ],
        ['Employer value', 'Optional anonymous survey on focus, absence and benefit satisfaction', 'Month 6'],
      ],
      source:
        'Targets are agreed at kickoff. Clinical results are aggregate, de-identified, and from consenting patients.',
      notes:
        'Every pilot ends with a month-6 readout and a clear recommendation: continue, expand or stop. Agree the success targets at kickoff so the decision rule exists before the data does.',
    },
    {
      n: 11,
      kind: 'progress',
      eyebrow: 'PROGRESS OVER TIME',
      headline: 'What employees feel, what you see',
      body: [
        'Validated questionnaires and cognitive assessment track progress, so it is measured and not guessed.',
        'You see aggregate trends for groups of 10 or more, never individuals.',
      ],
      leftTitle: 'What your team member feels',
      leftSeries: ['Stress', 'Focus'],
      rightTitle: 'What you see — aggregate, groups of 10+',
      rightSeries: ['Team stress', 'Team focus'],
      sample: 'SAMPLE DATA',
      axis: 'Start → Time',
      source: 'Illustrative sample data, not pilot results.',
      notes:
        'These charts are illustrative. The left is what an employee experiences; the right is what the employer sees, which is aggregate only.',
    },
    {
      n: 12,
      kind: 'capacity',
      eyebrow: 'NETWORK CAPACITY',
      headline: 'We size our network by the visits we can deliver',
      equation: [
        ['96', 'patient-facing clinician hours each week'],
        ['2.4', 'visits per hour at a 25-minute blended visit'],
        ['85%', 'of slots kept after a 15% no-show buffer'],
        ['≈196', 'visits per week across the network', true],
      ],
      month: [
        ['≈850', 'visits per month'],
        ['≈9,000', 'visits per year across 46 working weeks'],
        ['≈3,600', 'visits per year reserved for employer programs', true],
      ],
      source:
        'Weekly = hours × (60 ÷ visit minutes) × (1 − buffer); monthly = weekly × 4.33; annual = weekly × 46.',
      notes:
        'Capacity in a virtual model is clinician time converted into visits. Tracked by state and refreshed quarterly from scheduling data.',
    },
    {
      n: 13,
      kind: 'supports',
      eyebrow: 'NETWORK CAPACITY',
      headline: 'What that capacity supports',
      columns: ['Scenario', 'Visits a year', 'Reserved for employers', 'Enrolled employees', 'Eligible employees'],
      rows: [
        ['Today', '≈9,000', '≈3,600', '≈730', '2,900–4,800'],
        ['Expanded', '≈12,000', '≈6,600', '≈1,330', '5,300–8,800'],
        ['Scaled', '≈15,000', '≈9,600', '≈1,930', '7,700–12,900'],
      ],
      cards: [
        'A 250-employee pilot uses about 5–9% of employer-reserved capacity, assuming 15–25% enrollment.',
        '11 to 19 pilots of that size fit today. We open with up to three so every employee gets a dedicated-team experience.',
        'Every added 1,500 visits a year supports about 300 more enrolled employees, and we add capacity before we add pilots.',
      ],
      notes:
        'Annual visits are split between continuing patients and employer programs, and employer visits translate into enrolled and eligible employees. Capacity is a planning ceiling, so we expand it before taking on more pilots.',
    },
    {
      n: 14,
      kind: 'pilot',
      eyebrow: 'PILOT DESIGN',
      headline: 'A six-month pilot built to be judged',
      tiles: [
        ['6 months', 'with checkpoints at months 3 and 6'],
        ['Custom', 'per enrolled employee per month, scoped to your package'],
        ['Employees', 'only; dependents are not included in the pilot'],
        ['Month 3', 'exit by either party on 30 days\' notice, with continuity of care'],
      ],
      includedTitle: 'Included at no cost to employees',
      included: [
        'Primary care visits and follow-ups',
        'ADHD evaluation and management',
        'Mental health care for stress, depression, anxiety and sleep',
        'Objective cognitive assessment',
        'Metabolic, weight and hormonal care',
        'Secure messaging, care navigation and care management',
      ],
      billedTitle: 'Billed separately',
      billed: [
        'Prescription medications, filled at the employee\'s own pharmacy (discount coupons available)',
        'Laboratory and imaging (prices shown upfront when ordered through our lab portal)',
        'Specialist, in-person, urgent and emergency care',
      ],
      source:
        'HSA-compatible. Non-binding summary; a definitive pilot agreement follows. Emergency: call 911. Crisis: call or text 988.',
      notes:
        'Six months is the shortest period that can show a defensible result. Pricing is scoped per employer in conversation, not in this deck. Be explicit about what is billed separately so employees are never surprised.',
    },
    {
      n: 15,
      kind: 'privacy',
      eyebrow: 'PRIVACY AND SECURITY',
      headline: 'Confidential by design',
      cards: [
        ['Aggregate only', 'You receive de-identified reports for groups of 10 or more. Never names, visits or diagnoses.'],
        [
          'Records stay clinical',
          'Protected under HIPAA and state medical privacy laws, and never shared with employers without patient authorization.',
        ],
        [
          'Minimum roster',
          'Eligibility is confirmed with name, work email, employment status and state of work only.',
        ],
      ],
      badge: 'HIPAA-covered practice',
      baa: ph.BAA_BADGE,
      band: [
        'Employees can use their care with no notice to a manager.',
        'Program communications stay separate from clinical information.',
      ],
      source: 'Reporting: monthly dashboard, month-3 review and month-6 readout.',
      notes:
        'The biggest adoption barrier is the fear that an employer can see who uses mental health care. Answer it directly: aggregate-only reporting, a minimum group size, and no manager notice.',
    },
    {
      n: 16,
      kind: 'start',
      eyebrow: 'GETTING STARTED',
      headline: 'Launch in about 30 days',
      timeline: [
        ['Week 0', 'Agreements and data terms signed.'],
        ['Weeks 1–2', 'Roster feed and employer-branded sign-in set up and tested.'],
        ['Weeks 2–3', 'Employee communications kit and manager FAQ, with no clinical information.'],
        ['Week 4', 'Launch webinar for employees; first visits scheduled.'],
      ],
      nextTitle: 'Next steps',
      next: [
        'A 20-minute introduction conversation',
        'Confirm headcount, states and plan structure with your benefits advisor',
        'Counsel review of the pilot agreement',
        'Sign the pilot agreement',
        'Launch',
      ],
      source: 'Your effort: an executive sponsor, a roster contact and a communications channel.',
      notes:
        'Keep the ask small. The employer provides a sponsor, a roster contact and a channel for employee communications. Siya handles configuration, enrollment support and reporting.',
    },
    {
      n: 17,
      kind: 'close',
      eyebrow: 'NEXT STEP',
      headline: 'Let\'s talk about a pilot for your team',
      sub: 'Book a 20-minute conversation. We will work out together whether a pilot makes sense for your workforce.',
      name: 'Dr. Sneh Pandey · Founder and Medical Director',
      email: ph.CONTACT_EMAIL,
      phone: ph.CONTACT_PHONE,
      site: 'siya.health',
      demoLabel: 'See the 4-minute demo',
      demoUrl: 'siya.health/employers/demo',
      demoHref: 'https://siya.health/employers/demo',
      footer:
        'Siya Health® · Clinical services provided by Siya Healthcare PC and affiliated professional practices. Partnership information only, not medical advice. Emergency: call 911. Mental health crisis: call or text 988.',
      notes:
        'Close on the single ask: a 20-minute conversation. Confirm headcount, states and the executive sponsor before you leave the meeting.',
    },
  ];
}

export function assertPlaceholders(placeholders = PLACEHOLDERS) {
  const required = ['EVALUATIONS', 'MONTHLY_PATIENTS', 'CONTACT_EMAIL', 'CONTACT_PHONE'];
  for (const key of required) {
    const value = placeholders[key];
    if (value == null || String(value).trim() === '' || String(value).includes('{{')) {
      throw new Error(`Refusing to generate: PLACEHOLDERS.${key} is unset`);
    }
  }
  if (placeholders.BAA_BADGE != null && String(placeholders.BAA_BADGE).includes('{{')) {
    throw new Error('Refusing to generate: PLACEHOLDERS.BAA_BADGE still contains {{');
  }
}
