/**
 * City ADHD landing test set (July 2026 GSC — Miami/Orlando/San Diego impressions).
 *
 * Provider licensing ground truth (founder-supplied Aug 2026 — do not re-derive):
 *   FL (Miami, Orlando): Dr. Sneh Pandey, Dr. Vanessa Urbina, Dr. Natasha Desai, Wendy Delgado
 *   CA (San Diego): Dr. Sneh Pandey, Wendy Delgado
 * Display name for Delgado follows live provider page credentials (PA-C), not "Dr."
 *
 * Meta robots: `index, follow` (clinical review signed off Aug 2026).
 */
export const ADHD_CITY_LANDINGS = [
  {
    slug: 'miami',
    city: 'Miami',
    regionLabel: 'Miami–Dade and South Florida',
    state: 'Florida',
    stateAbbr: 'FL',
    stateHubPath: '/adhd-care',
    stateHubLabel: 'ADHD Care (national hub)',
    title: 'ADHD Care in Miami, FL — Online Adult Evaluation | Siya Health',
    description:
      'Adult ADHD evaluation for Miami and South Florida via Florida-licensed telehealth. Free screening, structured virtual visits, and transparent cash-pay pricing—no travel to a clinic required.',
    h1: 'Adult ADHD evaluation in Miami, FL',
    lead:
      'Searching for adult ADHD testing near Miami? Siya Health connects Miami-area adults with Florida-licensed clinicians over telehealth—so you can complete evaluation from home, not from a waiting room.',
    introHeading: 'Adult ADHD care for Miami and South Florida',
    introHtml: `
<p>Miami adults often look for ADHD evaluation after focus, follow-through, or time management starts colliding with work, school, or family life—especially when getting a timely specialty appointment in South Florida feels harder than the problem itself. Siya Health is built for that gap: a physician-led adult ADHD pathway delivered entirely by telehealth to patients physically located in Florida at the time of the visit.</p>
<p>You do not need to drive across Miami–Dade, sit in a clinic lobby, or wait for an in-person slot to begin. Start with a free online screening, then book a structured virtual evaluation with a Florida-licensed clinician when you are ready. Eligibility and clinician assignment are confirmed at scheduling—not guessed from a city page.</p>
<p>People search “ADHD testing near Miami” for practical reasons: bilingual households navigating care in English, professionals who cannot lose half a day to traffic and check-in, and adults who were never evaluated as kids and now need a clear adult pathway. This page answers that local search intent without inventing a Miami storefront.</p>
<p>For the full national care pathway, see our <a href="/adhd-care">ADHD Care</a> hub. For transparent fees, see <a href="/pricing">Pricing</a>. Medication is never guaranteed after evaluation.</p>
`.trim(),
    telehealthHeading: 'Telehealth for Miami—no travel required',
    telehealthHtml: `
<p>All adult ADHD evaluations for Miami patients are virtual. You join a secure video visit from somewhere in Florida; there is no Siya Health clinic address in Miami and no claim of in-person availability in South Florida.</p>
<p>Florida-licensed clinicians on this pathway include <a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey</a>, <a href="/providers/dr-vanessa-urbina">Dr. Vanessa Urbina</a>, <a href="/providers/dr-natasha-desai">Dr. Natasha Desai</a>, and <a href="/providers/wendy-delgado">Wendy Delgado, PA-C</a>. Which clinician you see depends on scheduling and clinical fit—confirm at booking.</p>
<p>Cash-pay and no insurance required. Meet &amp; Greet is free; the structured clinical evaluation is priced on our <a href="/pricing">pricing page</a> (currently <span class="siya-price siya-price--initial-evaluation" data-siya-price="initialEvaluation">$149</span> one-time). Medication is never guaranteed after evaluation.</p>
`.trim(),
    providers: [
      { slug: 'dr-sneh-pandey', name: 'Dr. Sneh Pandey', href: '/providers/dr-sneh-pandey' },
      { slug: 'dr-vanessa-urbina', name: 'Dr. Vanessa Urbina', href: '/providers/dr-vanessa-urbina' },
      { slug: 'dr-natasha-desai', name: 'Dr. Natasha Desai', href: '/providers/dr-natasha-desai' },
      { slug: 'wendy-delgado', name: 'Wendy Delgado, PA-C', href: '/providers/wendy-delgado' },
    ],
    clinicalReviewFlags: [
      'Any statement that Miami waitlists are systematically longer than other metros (local epidemiology)—keep operational framing only unless clinician-approved.',
      'Which Florida-licensed clinician routinely leads adult ADHD evaluations vs. other pathways (roster assignment rules)—ops/clinical confirmation.',
      'Any medication, stimulant, dosing, or treatment-efficacy language beyond “medication is never guaranteed.”',
    ],
    faqs: [
      {
        question: 'Can I get an adult ADHD evaluation in Miami without going to a clinic?',
        answer:
          'Yes. Siya Health evaluates Miami-area adults over telehealth with Florida-licensed clinicians. You stay where you are in Florida for the video visit—there is no local Siya office visit required.',
      },
      {
        question: 'Are Siya Health clinicians licensed in Florida?',
        answer:
          'Yes. For Florida patients, care is delivered by Florida-licensed clinicians, including Dr. Sneh Pandey, Dr. Vanessa Urbina, Dr. Natasha Desai, and Wendy Delgado, PA-C. Confirm your assigned clinician when you schedule.',
      },
      {
        question: 'How much does an adult ADHD evaluation cost for Miami patients?',
        answer:
          'Meet & Greet is free. The structured clinical evaluation is a one-time cash-pay fee listed on our pricing page (currently $149). Labs and medication, if ordered later, are separate. No insurance required.',
      },
      {
        question: 'How long does the evaluation take, and how soon can I book?',
        answer:
          'The clinical evaluation is typically a 60–90 minute virtual visit. Same-week appointments are often available after you complete the free screening. Screening itself is not a diagnosis.',
      },
      {
        question: 'Does evaluation guarantee ADHD medication?',
        answer:
          'No. A diagnosis—if criteria are met—does not guarantee medication. Any prescribing decision is individualized and follows clinical and legal requirements. See our ADHD Care hub for the full pathway.',
      },
    ],
    relatedLinks: [
      { href: '/adhd-care', label: 'ADHD Care (national hub)' },
      { href: '/adhd-screening?adhd=1', label: 'Free ADHD screening' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/telehealth', label: 'How telehealth works' },
      { href: '/providers/dr-sneh-pandey', label: 'Dr. Sneh Pandey' },
      { href: '/providers/dr-vanessa-urbina', label: 'Dr. Vanessa Urbina' },
      { href: '/providers/dr-natasha-desai', label: 'Dr. Natasha Desai' },
      { href: '/providers/wendy-delgado', label: 'Wendy Delgado, PA-C' },
      { href: '/answers/is-online-adhd-diagnosis-legitimate', label: 'Is online ADHD diagnosis legitimate?' },
      { href: '/answers/screening-vs-adhd-evaluation', label: 'Screening vs evaluation' },
    ],
  },
  {
    slug: 'orlando',
    city: 'Orlando',
    regionLabel: 'Orlando and Central Florida',
    state: 'Florida',
    stateAbbr: 'FL',
    stateHubPath: '/adhd-care',
    stateHubLabel: 'ADHD Care (national hub)',
    title: 'ADHD Care in Orlando, FL — Online Adult Evaluation | Siya Health',
    description:
      'Adult ADHD evaluation for Orlando and Central Florida via Florida-licensed telehealth. Free screening, structured virtual visits, clear pricing—complete care without commuting to a clinic.',
    h1: 'Adult ADHD evaluation in Orlando, FL',
    lead:
      'Looking for adult ADHD testing in Orlando? Siya Health offers Florida-licensed, physician-led evaluation by video—so Central Florida adults can start screening and book a visit without rearranging the week around a clinic commute.',
    introHeading: 'Adult ADHD care for Orlando and Central Florida',
    introHtml: `
<p>Orlando-area adults often search for ADHD evaluation when focus problems show up on hospitality and healthcare shift schedules, during long theme-park corridor workweeks, or while juggling school and family across sprawling Central Florida commutes. In-person behavioral-health calendars can be hard to reach when every appointment means traffic, parking, and time off.</p>
<p>Siya Health’s adult ADHD pathway is telehealth-first for patients located in Florida: free screening online, then a structured virtual evaluation with a Florida-licensed clinician. You do not travel to an Orlando office—we do not operate a walk-in ADHD clinic in the metro, and this page does not invent one.</p>
<p>Central Florida searchers usually want three things answered quickly: Is this real licensed care? Do I have to come in person? What does it cost before I commit? Those logistics are below. Clinical decisions—diagnosis if criteria are met, and any discussion of medication—happen with your clinician, not in marketing copy.</p>
<p>Use this page for Orlando / Central Florida context. The shared pathway lives on <a href="/adhd-care">ADHD Care</a>; fees are on <a href="/pricing">Pricing</a>.</p>
`.trim(),
    telehealthHeading: 'Virtual evaluation from anywhere in Florida',
    telehealthHtml: `
<p>Evaluations are video visits. As long as you are physically in Florida for the appointment, you can complete care from home, a private office, or another quiet space—no Orlando parking, no clinic check-in.</p>
<p>Florida-licensed clinicians available on this pathway include <a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey</a>, <a href="/providers/dr-vanessa-urbina">Dr. Vanessa Urbina</a>, <a href="/providers/dr-natasha-desai">Dr. Natasha Desai</a>, and <a href="/providers/wendy-delgado">Wendy Delgado, PA-C</a>. Scheduling confirms who is available for your visit.</p>
<p>Start with the <a href="/adhd-screening?adhd=1">free ADHD screening</a> or a free <a href="/redirect/meet-greet">Meet &amp; Greet</a>. The clinical evaluation fee is listed on <a href="/pricing">Pricing</a> (currently <span class="siya-price siya-price--initial-evaluation" data-siya-price="initialEvaluation">$149</span>). Medication is never guaranteed.</p>
`.trim(),
    providers: [
      { slug: 'dr-sneh-pandey', name: 'Dr. Sneh Pandey', href: '/providers/dr-sneh-pandey' },
      { slug: 'dr-vanessa-urbina', name: 'Dr. Vanessa Urbina', href: '/providers/dr-vanessa-urbina' },
      { slug: 'dr-natasha-desai', name: 'Dr. Natasha Desai', href: '/providers/dr-natasha-desai' },
      { slug: 'wendy-delgado', name: 'Wendy Delgado, PA-C', href: '/providers/wendy-delgado' },
    ],
    clinicalReviewFlags: [
      'Local Orlando labor/shift-work framing is marketing context only—do not treat as clinical epidemiology without review.',
      'Clinician assignment rules among Florida-licensed roster for ADHD vs other pathways.',
      'Any medication or treatment-efficacy claims beyond existing sitewide “never guaranteed” language.',
    ],
    faqs: [
      {
        question: 'Do I need to visit a clinic in Orlando for an ADHD evaluation?',
        answer:
          'No. Siya Health provides adult ADHD evaluation by telehealth for Florida patients. There is no Siya Health in-person ADHD office in Orlando that you must visit.',
      },
      {
        question: 'Who can see Central Florida patients?',
        answer:
          'Florida-licensed clinicians on this pathway include Dr. Sneh Pandey, Dr. Vanessa Urbina, Dr. Natasha Desai, and Wendy Delgado, PA-C. Your assigned clinician is confirmed when you book.',
      },
      {
        question: 'What does it cost?',
        answer:
          'Meet & Greet is free. The structured evaluation is a one-time cash-pay fee on our pricing page (currently $149). No insurance required. Labs or medication, if appropriate later, are separate.',
      },
      {
        question: 'How fast can Orlando patients get evaluated?',
        answer:
          'After the free screening, same-week virtual appointments are often available. The evaluation visit itself is typically 60–90 minutes. Screening is not a diagnosis.',
      },
      {
        question: 'Is telehealth ADHD evaluation legitimate in Florida?',
        answer:
          'Siya Health uses licensed medical clinicians and a structured evaluation process. For a plain-language overview of online diagnosis legitimacy, see our health guide on online ADHD diagnosis—and always confirm eligibility at scheduling.',
      },
    ],
    relatedLinks: [
      { href: '/adhd-care', label: 'ADHD Care (national hub)' },
      { href: '/adhd-screening?adhd=1', label: 'Free ADHD screening' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/telehealth', label: 'How telehealth works' },
      { href: '/providers/dr-sneh-pandey', label: 'Dr. Sneh Pandey' },
      { href: '/providers/dr-vanessa-urbina', label: 'Dr. Vanessa Urbina' },
      { href: '/providers/dr-natasha-desai', label: 'Dr. Natasha Desai' },
      { href: '/providers/wendy-delgado', label: 'Wendy Delgado, PA-C' },
      { href: '/answers/is-online-adhd-diagnosis-legitimate', label: 'Is online ADHD diagnosis legitimate?' },
      { href: '/answers/how-long-adhd-evaluation', label: 'How long does evaluation take?' },
    ],
  },
  {
    slug: 'san-diego',
    city: 'San Diego',
    regionLabel: 'San Diego and Southern California',
    state: 'California',
    stateAbbr: 'CA',
    stateHubPath: '/adult-adhd-california',
    stateHubLabel: 'Adult ADHD care in California',
    title: 'ADHD Care in San Diego, CA — Online Adult Evaluation | Siya Health',
    description:
      'Adult ADHD evaluation for San Diego via California-licensed telehealth. Free screening, structured virtual visits, and cash-pay pricing—no San Diego clinic visit required.',
    h1: 'Adult ADHD evaluation in San Diego, CA',
    lead:
      'Searching for adult ADHD testing in San Diego? Siya Health offers California-licensed telehealth evaluation—so you can complete screening and a structured visit from home instead of hunting for an in-person specialty slot across the county.',
    introHeading: 'Adult ADHD care for San Diego',
    introHtml: `
<p>San Diego adults often look for ADHD evaluation when focus and organization start failing under biotech or military schedules, long I-5 / I-15 commutes, or the stretch between “functioning at work” and “falling behind at home.” Specialty calendars in San Diego County can be slow to open—especially if you need an adult-focused evaluation rather than a pediatric referral chain.</p>
<p>Siya Health serves California patients by telehealth. You do not need a San Diego brick-and-mortar visit with us; care happens over secure video while you are physically in California. We do not claim a local ADHD clinic address in San Diego, and we do not ask you to invent travel time you do not need.</p>
<p>If you landed here from a “ADHD testing San Diego” search, start with screening or a Meet &amp; Greet, then schedule the structured evaluation when ready. Pair this city page with our statewide guide, <a href="/adult-adhd-california">Adult ADHD care in California</a>, and the national pathway on <a href="/adhd-care">ADHD Care</a>.</p>
<p>California Ads evaluation landing: <a href="/adhd-evaluation-california">Adult ADHD evaluation — California</a>. Medication is never guaranteed after evaluation.</p>
`.trim(),
    telehealthHeading: 'California telehealth—San Diego patients stay put',
    telehealthHtml: `
<p>Evaluations are virtual. Siya Health does not claim an in-person ADHD clinic in San Diego. You join from California; licensing and eligibility are confirmed at scheduling.</p>
<p>California-licensed clinicians referenced for this market include <a href="/providers/dr-sneh-pandey">Dr. Sneh Pandey</a> and <a href="/providers/wendy-delgado">Wendy Delgado, PA-C</a>. Clinician assignment depends on scheduling and clinical fit—confirm when you book. Florida-only clinicians are not listed here.</p>
<p>Cash-pay pathway: free Meet &amp; Greet, then a structured evaluation priced on <a href="/pricing">Pricing</a> (currently <span class="siya-price siya-price--initial-evaluation" data-siya-price="initialEvaluation">$149</span>). Medication is never guaranteed after evaluation.</p>
`.trim(),
    providers: [
      { slug: 'dr-sneh-pandey', name: 'Dr. Sneh Pandey', href: '/providers/dr-sneh-pandey' },
      { slug: 'wendy-delgado', name: 'Wendy Delgado, PA-C', href: '/providers/wendy-delgado' },
    ],
    clinicalReviewFlags: [
      'San Diego labor/commute framing is marketing context only—not local prevalence data.',
      'Confirm which California-licensed clinicians currently schedule adult ADHD evaluations (vs weight-loss pathways) before index flip.',
      'Any medication, stimulant class, or efficacy language beyond sitewide “never guaranteed” wording.',
      'Wendy Delgado, PA-C focus on live provider page is weight loss—do not imply ADHD evaluation leadership without clinical confirmation.',
    ],
    faqs: [
      {
        question: 'Can San Diego adults complete ADHD evaluation without an in-person visit?',
        answer:
          'Yes. Siya Health provides adult ADHD evaluation by telehealth for California patients. There is no requirement to visit a Siya Health clinic in San Diego.',
      },
      {
        question: 'Which Siya clinicians are licensed in California?',
        answer:
          'For this San Diego page we reference California-licensed clinicians Dr. Sneh Pandey and Wendy Delgado, PA-C. Confirm your assigned clinician at scheduling.',
      },
      {
        question: 'How does this relate to your California ADHD guide?',
        answer:
          'This city page is for San Diego search intent. The statewide overview, pricing context, and California pathway live on Adult ADHD care in California. The national hub remains ADHD Care.',
      },
      {
        question: 'What does evaluation cost in California?',
        answer:
          'Meet & Greet is free. The structured clinical evaluation is a one-time cash-pay fee on our pricing page (currently $149). No insurance required. Labs and medication, if ordered later, are separate.',
      },
      {
        question: 'How do I start from San Diego?',
        answer:
          'Take the free ADHD screening, book a Meet & Greet if you want a low-pressure first conversation, then schedule the structured evaluation when ready. Screening is not a diagnosis.',
      },
    ],
    relatedLinks: [
      { href: '/adhd-care', label: 'ADHD Care (national hub)' },
      { href: '/adult-adhd-california', label: 'Adult ADHD care in California' },
      { href: '/adhd-evaluation-california', label: 'California ADHD evaluation (Ads landing)' },
      { href: '/adhd-screening?adhd=1', label: 'Free ADHD screening' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/telehealth', label: 'How telehealth works' },
      { href: '/providers/dr-sneh-pandey', label: 'Dr. Sneh Pandey' },
      { href: '/providers/wendy-delgado', label: 'Wendy Delgado, PA-C' },
      { href: '/answers/telehealth-adhd-california', label: 'Telehealth ADHD in California' },
      { href: '/answers/is-online-adhd-diagnosis-legitimate', label: 'Is online ADHD diagnosis legitimate?' },
    ],
  },
];
