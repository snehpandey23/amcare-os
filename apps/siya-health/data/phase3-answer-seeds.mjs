/**
 * Phase 3 Discovery Engine — Tier-1 Health Guide seeds.
 * Merged into ANSWER_SEEDS in answer-seeds.mjs
 */
export const PHASE3_ANSWER_SEEDS = [
  {
    slug: 'why-normal-labs-dont-mean-healthy',
    question: "Why don't normal labs mean you're healthy?",
    metaDescription:
      'Normal A1C, cholesterol, and “fine” bloodwork can still hide insulin resistance, sleep apnea, fatty liver risk, and burnout. Learn what labs miss and when to seek metabolic evaluation.',
    shortAnswer:
      '“Normal labs” usually means values fall inside population reference ranges—not that you feel well, sleep well, or are free of early metabolic strain. Insulin resistance, obstructive sleep apnea, subclinical thyroid shifts, iron deficiency, depression, and medication effects can all cause fatigue, brain fog, cravings, and weight gain while routine panels look acceptable. Clinicians interpret labs in context: symptoms, waist trend, blood pressure, lipids, family history, and repeat testing—not a single green checkmark on a portal.',
    sections: [
      {
        id: 'why-labs-look-normal',
        heading: 'Why labs can look normal while you feel unwell',
        paragraphs: [
          'Reference ranges are statistical cutoffs, not personalized wellness targets. A1C reflects average glucose over roughly three months—it can stay in the “normal” band while post-meal spikes, insulin surges, and waist gain tell a different story. Fasting glucose alone misses many people with compensatory hyperinsulinemia.',
          'Lipid panels may look “okay” while triglycerides creep up, HDL falls, or blood pressure rises—components of metabolic syndrome that predict cardiometabolic risk before diabetes is labeled.',
          'Complete blood counts and basic metabolic panels rarely screen for sleep apnea, ADHD, burnout, or lifestyle-driven exhaustion. That gap is why patients say, “My doctor said everything is fine,” while focus, mood, and energy remain impaired.',
          'Reddit threads in r/loseit, r/diabetes, and r/ChronicFatigue often describe “normal labs” with disabling symptoms—seeking second opinions for insulin, thyroid antibodies, ferritin, or sleep studies. Quora repeats: “Can you be unhealthy with normal blood test results?” The clinical answer is yes, when history and exam findings warrant deeper workup.',
        ],
      },
      {
        id: 'common-example',
        heading: 'A common example',
        paragraphs: [
          'A 38-year-old project manager reports afternoon crashes, strong carb cravings, and 15 pounds gained over two years. A1C 5.4%, fasting glucose 98 mg/dL, TSH “normal,” CBC unremarkable. She leaves the visit labeled “stress.”',
          'On structured history: snoring, unrefreshing sleep, waist circumference up, triglycerides 180 mg/dL, blood pressure 132/86 on home readings. Further testing may show insulin resistance pattern, sleep apnea, or both—not a clean bill of health despite “normal” headline labs.',
          'This vignette is illustrative, not diagnostic. Your clinician maps your timeline, medications, menopause status, training load, and mental health—not a template case.',
        ],
      },
      {
        id: 'what-labs-may-miss',
        heading: 'What routine labs may miss',
        listItems: [
          'Early insulin resistance and glycemic variability (normal A1C, symptoms still present).',
          'Obstructive sleep apnea (no blood test replaces sleep history or testing).',
          'Fatty liver and metabolic liver strain (may need imaging or specialized labs).',
          'Iron deficiency without anemia, B12/folate issues, or thyroid autoimmunity.',
          'Depression, anxiety, ADHD, and burnout—clinical diagnoses, not CBC findings.',
          'Medication effects (antihistamines, SSRIs, glucocorticoids, some BP meds).',
          'Low free testosterone when SHBG is high (total testosterone can look “normal”).',
        ],
      },
      {
        id: 'decision-support',
        heading: 'Decision support: what to do with “normal” labs',
        paragraphs: [
          'If symptoms are new, severe, or worsening rapidly—chest pain, shortness of breath, suicidal thoughts, unintended major weight loss—seek urgent care. For persistent but non-emergency problems, bring a symptom diary: sleep hours, snoring, meal timing, energy by time of day, and mood.',
          'Ask whether additional labs are appropriate: fasting insulin (interpretation varies by lab), lipid panel with triglycerides, liver enzymes, ferritin, thyroid panel, or sleep evaluation. Continuous glucose monitors are education tools for some patients—not a substitute for medical diagnosis.',
          'Telehealth can start metabolic and fatigue mapping; local imaging, sleep studies, or phlebotomy may still be needed. A Meet & Greet can clarify which Siya services fit before you commit to a full evaluation pathway.',
        ],
      },
      {
        id: 'research-themes',
        heading: 'PubMed, forums, and PAA themes',
        paragraphs: [
          'PubMed reviews on insulin resistance emphasize hyperinsulinemia preceding dysglycemia—the metabolic syndrome literature supports treating trajectory, not waiting for diabetes labels. Sleep medicine literature separately shows apnea driving daytime impairment with “normal” routine chemistries.',
          'Reddit patient themes (paraphrased): frustration after “perfect labs,” requests for fasting insulin, pushback on “just lose weight” without sleep evaluation, and success stories after apnea treatment or structured meal timing—not proof of causation, but aligned with clinical screening priorities.',
          'Quora themes: “Can blood tests miss illness?” and “Why am I always tired with normal results?” map to sleep, thyroid edge cases, iron studies, and mental health—exactly the differentials responsible clinicians consider.',
          'Google PAA: “What diseases do not show up in blood tests?” “Can you have diabetes with normal A1C?” “What labs check metabolic health?”—this page targets those intents without replacing comprehensive cornerstones on insulin or fatigue.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Schedule non-urgent review if daily fatigue, post-meal crashes, intrusive food thoughts, rising waist size, or poor sleep persist more than a few months despite “normal” screening labs.',
          'Pair lab trends over time—one snapshot rarely tells the whole story. Prevention-focused care treats trajectory, not only crossed thresholds.',
          'Women’s health contexts matter: perimenopause can shift lipids, sleep, and insulin sensitivity while routine labs still look unremarkable. Athletes with low energy availability may show subtle hormonal and metabolic strain without classic disease labels.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Normal reference ranges ≠ optimal health for your body.',
          'Symptoms deserve a differential diagnosis even when the lab portal is green.',
          'Metabolic health, sleep, hormones, and mood overlap—often together.',
          'Repeat labs and context beat one-off reassurance.',
        ],
        paragraphs: [
          'This Health Guide pairs with—but does not duplicate—the insulin resistance cornerstone blog or the “normal A1C” quick answer; use all three when building a metabolic care plan with your clinician.',
          'Book a Meet & Greet when you want help prioritizing labs, sleep evaluation, and metabolic telehealth pathways without committing to a full program on day one.',
        ],
      },
    ],
    faqs: [
      {
        question: "Why don't normal labs mean you're healthy?",
        answer:
          'Labs screen specific markers at one point in time. Insulin resistance, sleep disorders, mental health conditions, and lifestyle factors can impair quality of life before standard thresholds are crossed.',
      },
      {
        question: 'Can you have insulin resistance with normal A1C?',
        answer:
          'Yes. Many adults have compensatory hyperinsulinemia and post-meal glucose swings while A1C remains in the normal range—especially with central weight gain or strong family history.',
      },
      {
        question: 'What blood tests show metabolic health?',
        answer:
          'Clinicians often combine A1C, fasting glucose, lipids (including triglycerides), blood pressure, waist trend, and sometimes insulin or liver markers—interpreted with symptoms, not in isolation.',
      },
      {
        question: 'Why does my doctor say labs are fine but I feel terrible?',
        answer:
          'Common reasons include sleep apnea, depression, thyroid edge cases, iron deficiency, medication effects, burnout, ADHD, or early metabolic strain. Structured history and targeted testing clarify next steps.',
      },
      {
        question: 'Should I get a second opinion if labs are normal?',
        answer:
          'Reasonable when symptoms persist, worsen, or impair work and relationships. Bring records, a symptom timeline, and specific goals for the visit.',
      },
      {
        question: 'Do normal labs rule out sleep apnea?',
        answer:
          'Yes—sleep apnea is diagnosed with sleep history and testing, not routine bloodwork. Snoring, unrefreshing sleep, and daytime sleepiness warrant sleep evaluation regardless of “normal” labs.',
      },
    ],
    evidence: [
      'ADA Standards of Care in Diabetes—prediabetes and screening in high-risk adults (2025)',
      'Diabetes Prevention Program—lifestyle impact on insulin sensitivity (NEJM 2002; PMID 12023865)',
      'IDF metabolic syndrome criteria overview',
      'AASM obstructive sleep apnea clinical resources',
      'NIDDK insulin resistance and prediabetes patient education',
    ],
    learnMore: [
      { href: '/answers/normal-a1c-insulin-resistance', label: 'Normal A1C with insulin resistance?' },
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
      { href: '/answers/brain-fog-after-eating', label: 'Brain fog after eating' },
      { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Tired even after sleeping' },
      {
        href: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
        label: 'Insulin resistance cornerstone (blog)',
      },
      {
        href: '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
        label: 'Fatigue cornerstone (blog)',
      },
      { href: '/weight-loss-metabolic-health', label: 'Medical weight loss & metabolic health' },
      { href: '/telehealth', label: 'Telehealth & virtual care' },
    ],
    related: [
      'normal-a1c-insulin-resistance',
      'what-is-insulin-resistance',
      'why-am-i-tired-even-after-sleeping',
      'brain-fog-after-eating',
      'can-sleep-apnea-cause-fatigue',
      'what-is-food-noise',
    ],
    topic: 'weight-loss',
    hubCategories: ['metabolic', 'energy'],
    aboutCondition: 'Metabolic syndrome and preventive health screening',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/insulin-resistance-and-weight-loss-clinician-overview',
  },
  {
    slug: 'food-noise-returned-on-glp-1',
    question: 'Why did food noise come back on GLP-1?',
    metaDescription:
      'Food noise can return on GLP-1 therapy after dose gaps, tolerance, stress, sleep loss, or inadequate lifestyle support. Learn why cravings resurface and what to discuss with your clinician.',
    shortAnswer:
      '“Food noise”—intrusive thoughts about eating—often quiets when GLP-1 therapy is working, but it can return if the dose is reduced or stopped, if adherence lapses, if stress and poor sleep spike, or if underlying habits and environment were never addressed. GLP-1 medicines blunt appetite signaling; they do not erase emotional eating, binge patterns, or metabolic drivers alone. Return of food noise is a clinical conversation about dose, side effects, sleep, mood, and structured follow-up—not a personal failure. Patients searching “food noise came back on Ozempic” or “Wegovy stopped working for cravings” need timeline-based medical review, not another restrictive diet cycle started alone at home.',
    sections: [
      {
        id: 'what-food-noise-return-means',
        heading: 'What it means when food noise returns',
        paragraphs: [
          'Food noise describes persistent mental chatter about food—what to eat next, whether you “deserve” a meal, or looping guilt after eating. GLP-1 receptor agonists (semaglutide, tirzepatide) reduce appetite and reward-driven eating for many patients in trials and practice, but effects vary by person and dose.',
          'When noise returns, patients often fear the medication “stopped working.” More often, the biology shifted: lower drug exposure, competing stress hormones, sleep debt, or psychological triggers re-emerged once the pharmacologic buffer thinned.',
          'This guide complements—not replaces—the cornerstone article on food noise and GLP-1 mechanisms. It focuses on **return** after improvement, a distinct search intent from “what is food noise?”',
        ],
      },
      {
        id: 'common-example',
        heading: 'A common example',
        paragraphs: [
          'A 44-year-old on semaglutide for eight months lost 28 pounds and reports “quiet” food thoughts for the first time in years. After a two-week gap during travel (missed injections), cravings and evening grazing return within days.',
          'Sleep dropped to five hours nightly; work stress peaked. She wonders if she needs a higher dose or if she “ruined” progress. Clinician review addresses adherence, injection timing, GI tolerance, sleep, and whether dose adjustment or behavioral support is appropriate—without shame language.',
        ],
      },
      {
        id: 'why-it-happens',
        heading: 'Why food noise comes back on GLP-1',
        listItems: [
          'Missed doses, delayed refills, or insurance gaps lowering drug levels.',
          'Dose reduction for GI side effects without alternative structure.',
          'Weight plateau phase—normal biology; expectations need recalibration.',
          'Poor sleep and high cortisol increasing hunger and impulsivity.',
          'Stress, depression, ADHD, or binge-eating patterns untreated in parallel.',
          'Ultra-processed food environment overpowering medication-only strategies.',
          'Alcohol or cannabis increasing appetite in some users.',
        ],
        paragraphs: [
          'PubMed themes from STEP and SURMOUNT trials: GLP-1 therapies reduce energy intake and improve cardiometabolic markers; appetite suppression is not uniform and may attenuate over time in some individuals. Real-world forums describe “noise creeping back” at maintenance doses—useful signal for follow-up, not proof of addiction or weak willpower.',
        ],
      },
      {
        id: 'decision-support',
        heading: 'Decision support for patients and clinicians',
        paragraphs: [
          'Document when noise returned relative to dose changes, travel, illness, or stress. Note sleep hours, evening eating, and GI side effects.',
          'Do not self-escalate dose without prescriber input. Compounded products carry distinct risks; branded therapies require medical oversight.',
          'Combine pharmacotherapy with protein-forward meals, environment design (fewer trigger foods at home), and mental health referral when emotional eating dominates.',
          'If noise never improved on adequate dose, revisit diagnosis—insulin resistance, thyroid, sleep apnea, and medication lists still matter.',
          'Bring a two-week food and injection log to visits: dose date/time, nausea episodes, sleep hours, stress events, and craving intensity (0–10). Patterns speed decisions more than single-day memory.',
        ],
      },
      {
        id: 'research-themes',
        heading: 'PubMed, forums, and PAA themes',
        paragraphs: [
          'STEP and SURMOUNT publications report appetite and calorie-intake reductions with GLP-1 and dual agonists; open-label extensions note variability and adherence challenges—consistent with real-world “noise returning” narratives.',
          'Reddit themes (paraphrased): panic after missed injections, debates on maintenance dosing, GI side effects forcing down-titration, and emotional eating resurging during divorce or night-shift schedules.',
          'Quora: “Why am I hungry again on Ozempic?” “Does Wegovy stop working?” Answers clinically center on adherence, dose, sleep, and concurrent mental health—not moral failure.',
          'PAA: “Can GLP-1 stop working?” “Food noise meaning,” “How to stop food noise on semaglutide”—distinct from cornerstone “what is food noise” intent; internal links connect both without duplicating mechanism chapters.',
          'Keyword intent note: “returned” and “again” signal relapse after prior success—copy and internal links should route satisfied readers to food-noise cornerstone only for mechanism refresh, not duplicate STEP trial statistics here.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Contact your prescriber promptly for severe abdominal pain, persistent vomiting, dehydration, or allergic reactions. For return of cravings, schedule a routine visit to review adherence, dose, labs, and behavioral supports.',
          'Telehealth metabolic programs can coordinate GLP-1 management with sleep and ADHD screening when multiple guides in this cluster apply.',
          'Document whether food noise returned before or after dose changes—clinicians use timelines to separate tolerance, adherence, and psychosocial relapse. If binge episodes include loss of control with distress, ask about formal eating-disorder screening.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Returning food noise is common and treatable—start with adherence and sleep.',
          'GLP-1 is a tool, not a standalone cure for emotional eating.',
          'Dose and follow-up matter; do not adjust injections alone.',
          'Link symptoms to timeline for your clinician.',
        ],
        paragraphs: [
          'Avoid duplicating the food noise cornerstone blog content here; that article explains mechanisms. This guide is for patients who already improved, then heard the “noise” return.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why did food noise come back on GLP-1?',
        answer:
          'Common drivers include missed doses, lower drug levels, stress, poor sleep, plateaus, and untreated emotional eating. Review timing and dose with your prescriber.',
      },
      {
        question: 'Does semaglutide stop working for food noise?',
        answer:
          'Effectiveness can change with adherence, dose, side-effect limits, and biology. “Stopped working” often means the plan needs adjustment—not that the medicine is useless.',
      },
      {
        question: 'Can stress bring back food noise on Ozempic or Wegovy?',
        answer:
          'Yes. Cortisol and sleep loss increase hunger and reward seeking; GLP-1 may not fully override high stress periods.',
      },
      {
        question: 'Should I increase my GLP-1 dose if cravings return?',
        answer:
          'Only with prescriber guidance. Higher doses raise GI side-effect risk and may not be appropriate for your history.',
      },
      {
        question: 'Is food noise the same as binge eating disorder?',
        answer:
          'Related but not identical. Persistent binge episodes deserve specific screening and may need therapy plus medication—not only dose changes.',
      },
      {
        question: 'What is food noise?',
        answer:
          'Intrusive, repetitive thoughts about food and eating. See our dedicated Health Guide on food noise for baseline definitions.',
      },
    ],
    evidence: [
      'STEP trial program—semaglutide 2.4 mg and appetite outcomes (NEJM/Lancet family publications)',
      'SURMOUNT tirzepatide obesity trials—energy intake and weight outcomes',
      'FDA Wegovy/Ozempic/Mounjaro prescribing information (GI effects, adherence)',
      'ADA obesity pharmacotherapy guidance themes (2025)',
      'AACE obesity medicine algorithm summaries',
    ],
    learnMore: [
      { href: '/answers/what-is-food-noise', label: 'What is food noise?' },
      { href: '/answers/glp-1-side-effects', label: 'GLP-1 side effects' },
      { href: '/answers/semaglutide-weight-loss-how-it-works', label: 'How semaglutide works' },
      {
        href: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
        label: 'Food noise & GLP-1 cornerstone',
      },
      { href: '/weight-loss-metabolic-health', label: 'Medical weight loss care' },
      { href: '/telehealth', label: 'Telehealth' },
    ],
    related: [
      'what-is-food-noise',
      'glp-1-side-effects',
      'semaglutide-weight-loss-how-it-works',
      'who-qualifies-glp-1-weight-loss',
      'brain-fog-after-eating',
      'why-normal-labs-dont-mean-healthy',
    ],
    topic: 'weight-loss',
    hubCategories: ['metabolic'],
    aboutCondition: 'Obesity pharmacotherapy and appetite regulation',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  },
  {
    slug: 'weight-gain-after-stopping-ozempic',
    question: 'Why am I gaining weight after stopping Ozempic?',
    metaDescription:
      'Weight regain after stopping Ozempic (semaglutide) is common when appetite signaling returns. Learn rebound drivers, metabolic factors, and clinician-guided options—not shame-based dieting.',
    shortAnswer:
      'After stopping semaglutide (Ozempic or Wegovy), appetite hormones and gastric emptying patterns often shift back toward pretreatment baseline—many people experience stronger hunger and regain weight if lifestyle structure is not maintained. Trials show substantial regain after withdrawal in some cohorts. Regain is not moral failure; it reflects biology, adherence gaps, stress, sleep, and whether ongoing pharmacotherapy or intensive behavioral support remains appropriate for you. Planning maintenance or structured off-ramping before the last injection is standard obesity-medicine practice—not optional “willpower homework” after the fact.',
    sections: [
      {
        id: 'why-regain-happens',
        heading: 'Why weight regain happens after stopping',
        paragraphs: [
          'GLP-1 agonists reduce calorie intake by slowing gastric emptying, blunting appetite centers, and lowering “food noise” for many patients. When the drug is discontinued, those pharmacologic effects fade over weeks.',
          'STEP 1 extension data and related analyses report meaningful weight regain after semaglutide withdrawal in a large fraction of participants—highlighting that obesity is a chronic physiologic condition for many, not a short course like antibiotics.',
          'Muscle loss during rapid loss phases, if protein and resistance training were inadequate, can lower resting energy needs—another regain amplifier.',
          'Patients on Reddit r/Ozempic and r/semaglutide describe “hunger roaring back” after stop—useful for empathy, not dosing instructions.',
          'Quora themes ask whether Ozempic “ruined metabolism.” Evidence does not support permanent metabolic damage from approved use; regain reflects restored appetite biology and behavior in an obesogenic environment, though individual variability is wide.',
          'Insurance discontinuation is a practical driver—plan maintenance options before the last covered dose, not only after regain begins.',
        ],
      },
      {
        id: 'maintenance-vs-stop',
        heading: 'Maintenance therapy and structured off-ramping',
        paragraphs: [
          'Guidelines frame obesity as a chronic condition; many patients benefit from ongoing pharmacotherapy when tolerated and indicated. Others transition to intensive lifestyle medicine with dietitian support, resistance training, and sleep care.',
          'If you must stop for cost or side effects, taper expectations: hunger may rise faster than habits adjust. Pre-build meal templates, protein targets, and follow-up visits at 4 and 12 weeks post-stop.',
          'Switching to another GLP-1 or dual agonist is a prescriber decision—not a DIY swap. Compounded products lack the same safety monitoring; discuss FDA-approved pathways.',
        ],
      },
      {
        id: 'common-example',
        heading: 'A common example',
        paragraphs: [
          'A 52-year-old stopped Wegovy after reaching goal weight and insurance denial for maintenance. Within four months, 18 pounds return; evening snacking resumes; A1C drifts from 5.5% to 6.0%.',
          'She blames “lack of discipline.” Clinician visit reframes: discuss maintenance pharmacotherapy eligibility, resistance training, protein targets, sleep apnea screen, and whether tirzepatide or continued semaglutide fits risk/benefit—not restart crash dieting.',
        ],
      },
      {
        id: 'contributors',
        heading: 'Contributors beyond “willpower”',
        listItems: [
          'Return of GLP-1–suppressed appetite pathways.',
          'Untreated insulin resistance or sleep apnea.',
          'Stress, depression, ADHD impulsivity around food.',
          'Menopause-related body composition shifts.',
          'Thyroid or corticosteroid changes.',
          'Ultra-processed food environment without meal structure.',
          'Loss of lean mass lowering metabolic rate.',
        ],
      },
      {
        id: 'decision-support',
        heading: 'Decision support after stopping Ozempic',
        paragraphs: [
          'Bring weight trend, waist measurement, blood pressure, and recent labs to your clinician. Ask explicitly about maintenance therapy, alternative agents, and behavioral program intensity.',
          'If regain is rapid with polyuria/polydipsia, recheck glucose—diabetes may have been masked by treatment.',
          'Avoid unsupervised compounded “bootleg” semaglutide; discuss FDA-approved options and monitoring.',
          'Telehealth metabolic visits can map whether restart, switch, or structured lifestyle medicine is appropriate—without guaranteeing insurance coverage.',
          'Track weight weekly for eight weeks after stop, plus waist measure and fasting glucose if you had prediabetes. Share trends—not a single scale reading—to your prescriber.',
          'Resistance training twice weekly and protein at each meal helps preserve lean mass during loss and after stop; muscle loss lowers daily energy needs and can look like “metabolic damage” when it is partly compositional.',
        ],
      },
      {
        id: 'research-themes',
        heading: 'PubMed, forums, and PAA themes',
        paragraphs: [
          'Wilding et al. and STEP extension analyses document regain after semaglutide withdrawal in many participants—supporting chronic-disease framing in ADA/AACE obesity guidance.',
          'Reddit: “Ozempic rebound,” “regain after Wegovy stop,” muscle loss fears, insurance loss—patients need maintenance planning language, not shame.',
          'Quora: “How to keep weight off after Ozempic?” emphasizes lifestyle structure plus clinician follow-up; aligns with guideline-based maintenance pharmacotherapy discussions.',
          'PAA: “Ozempic rebound weight gain,” “What happens when you stop semaglutide,” “How to maintain weight after GLP-1”—this guide captures stop/regain intent without replacing semaglutide mechanism pages.',
          'Differentiation: semaglutide “how it works” and “who qualifies” guides explain initiation; this page is for patients already off drug facing regain—avoid cannibalizing cornerstone food-noise narrative except where cravings return.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Seek urgent care for severe abdominal pain, persistent vomiting, or dehydration. Schedule routine care for regain >5% body weight, rising A1C, new snoring, or mood decline.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Regain after stopping GLP-1 is common and biological.',
          'Maintenance plans should be discussed before stop—not only after regain.',
          'Preserve muscle with protein and resistance training during loss phases.',
          'Clinician-guided restart or switch beats unsupervised cycling.',
        ],
        paragraphs: [
          'A Meet & Greet can clarify whether Siya metabolic telehealth fits your state, goals, and prior GLP-1 history before you restart, switch, or pursue lifestyle-only maintenance.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why am I gaining weight after stopping Ozempic?',
        answer:
          'Appetite and satiety signaling often return after discontinuation; many patients eat more without the pharmacologic brake. Ongoing structure or maintenance therapy may be appropriate—discuss with your prescriber.',
      },
      {
        question: 'How fast do you regain weight after stopping semaglutide?',
        answer:
          'Timelines vary. Some notice hunger within days; measurable regain over weeks to months is common in trial follow-up after withdrawal.',
      },
      {
        question: 'Can I restart Ozempic after gaining weight back?',
        answer:
          'Many patients do restart under medical supervision, subject to indications, side effects, insurance, and cardiovascular history. Not appropriate for everyone.',
      },
      {
        question: 'Is weight regain after Wegovy permanent?',
        answer:
          'Not necessarily. New treatment plans, sleep optimization, strength training, and metabolic monitoring can improve trajectory—outcomes are individual.',
      },
      {
        question: 'Does stopping GLP-1 reverse diabetes benefits?',
        answer:
          'Glycemic improvements may lessen if weight and insulin resistance rebound. Repeat A1C and clinician review are prudent.',
      },
      {
        question: 'Ozempic vs lifestyle only after stop?',
        answer:
          'Lifestyle remains foundational; some patients need ongoing pharmacotherapy for chronic obesity management per guideline frameworks.',
      },
    ],
    evidence: [
      'STEP 1 trial extension—weight regain after semaglutide withdrawal (Wilding et al., Diabetes Obes Metab 2022 themes)',
      'FDA Ozempic/Wegovy labeling—indications and discontinuation considerations',
      'ADA Standards of Care—long-term obesity management (2025)',
      'AACE obesity disease state clinical recommendations',
    ],
    learnMore: [
      { href: '/answers/semaglutide-weight-loss-how-it-works', label: 'How semaglutide works' },
      { href: '/answers/food-noise-returned-on-glp-1', label: 'Food noise returned on GLP-1' },
      { href: '/answers/who-qualifies-glp-1-weight-loss', label: 'Who qualifies for GLP-1?' },
      { href: '/answers/medical-weight-loss-vs-dieting', label: 'Medical weight loss vs dieting' },
      {
        href: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
        label: 'Food noise cornerstone',
      },
      { href: '/weight-loss-metabolic-health', label: 'Weight loss & metabolic health' },
    ],
    related: [
      'semaglutide-weight-loss-how-it-works',
      'food-noise-returned-on-glp-1',
      'glp-1-side-effects',
      'who-qualifies-glp-1-weight-loss',
      'medical-weight-loss-vs-dieting',
      'what-is-food-noise',
    ],
    topic: 'weight-loss',
    hubCategories: ['metabolic'],
    aboutCondition: 'Obesity and GLP-1 receptor agonist therapy',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
  },
  {
    slug: 'afternoon-energy-crash-after-lunch',
    question: 'Why do I crash every afternoon after lunch?',
    metaDescription:
      'Afternoon energy crashes after lunch often tie to meal size, blood sugar swings, insulin resistance, poor sleep, and stress—not just “food coma.” Learn causes and when to seek care.',
    shortAnswer:
      'A predictable afternoon slump 60–120 minutes after lunch is common. When it is daily, severe, or paired with brain fog, irritability, or carb cravings, clinicians think about post-meal glycemic swings, insulin resistance, oversized or high-glycemic lunches, sleep debt, sleep apnea, anemia, thyroid issues, depression, and stimulant wear-off—not only “eating too much.” This guide focuses on the **afternoon crash** pattern; see our related guide on brain fog after eating for broader post-meal cognition. Desk workers, parents, and shift workers often describe the same 2 p.m. wall—meal timing and sleep screening frequently matter more than another espresso shot alone.',
    sections: [
      {
        id: 'afternoon-crash-explained',
        heading: 'What an afternoon crash looks like',
        paragraphs: [
          'Patients describe “hitting a wall” between 1–4 p.m.: heavy eyelids, slow thinking, irritability with coworkers, and reaching for sugar or caffeine. A short walk or smaller dinner the night before may help some days; other days nothing budges.',
          'Physiology after lunch includes insulin release, parasympathetic tone, and diverted blood flow to digestion—mild sleepiness can be normal. Pathologic crashes interfere with work, driving safety, or mood most weekdays.',
          'Google People Also Ask clusters: “why am I so tired after lunch,” “afternoon fatigue diabetes,” “is post lunch sleepiness normal.” Reddit r/productivity and r/diabetes repeat meal-timing experiments and CGM anecdotes—helpful context, not prescribing data.',
          'Circadian rhythm contributes: core body temperature dips in the afternoon for many adults, stacking with meal effects. Bright light exposure and movement can partially counteract the dip—another reason one-size “eat less” advice fails without timing context.',
        ],
      },
      {
        id: 'metabolic-sleep-links',
        heading: 'Metabolic and sleep links to afternoon crashes',
        paragraphs: [
          'Insulin resistance can magnify post-lunch glucose peaks even when fasting labs look fine. Pair this guide with insulin resistance and brain-fog Health Guides for meal composition detail.',
          'Sleep apnea and chronic restriction lower morning reserves; lunch becomes the tipping point into fog. Screen snoring and unrefreshing sleep regardless of lunch size.',
          'ADHD afternoon executive fade is real but distinct: if crashes trace to childhood focus patterns and not meals, see ADHD guides; many adults have both ADHD and metabolic afternoon slumps.',
        ],
      },
      {
        id: 'common-example',
        heading: 'A common example',
        paragraphs: [
          'A 35-year-old developer skips breakfast, eats a large bowl of pasta at noon, and by 2 p.m. cannot focus on code reviews. Coffee causes jitters without clarity.',
          'Adjusted pattern: 25–30 g protein at breakfast, half-plate vegetables at lunch, 10-minute walk after eating—crashes lessen but do not vanish. Sleep study later shows mild apnea; treatment further improves afternoon alertness. Illustrative only.',
        ],
      },
      {
        id: 'common-causes',
        heading: 'Common causes of afternoon crashes',
        listItems: [
          'High-glycemic lunch with low protein and fiber.',
          'Skipped or late breakfast → reactive overeating at lunch.',
          'Insulin resistance or prediabetes (normal A1C still possible).',
          'Chronic sleep restriction or untreated sleep apnea.',
          'Sedentary job without post-meal movement.',
          'Dehydration or alcohol at lunch.',
          'Depression, burnout, ADHD afternoon executive fade.',
          'Thyroid, anemia, or medication sedative effects.',
        ],
      },
      {
        id: 'decision-support',
        heading: 'Decision support',
        paragraphs: [
          'Track three workdays: lunch composition, sleep hours, crash severity (0–10), and caffeine use. Bring trends to your clinician—not single-day guesses.',
          'Experiments safe for many adults: protein-first lunch, walk after eating, earlier bedtime, limit liquid calories at lunch. Persistent crashes warrant labs and sleep history.',
          'If you already have a brain fog guide match, read `/answers/brain-fog-after-eating` for deeper glycemic and insulin resistance framing—this page emphasizes **timing and afternoon work impairment**.',
          'Try a two-week experiment: consistent breakfast protein, lunch half-plate vegetables, five-minute walk after eating, lights-out time fixed—note crash scores. Bring results to your clinician instead of guessing.',
        ],
      },
      {
        id: 'research-themes',
        heading: 'PubMed, forums, and PAA themes',
        paragraphs: [
          'Postprandial somnolence literature links meal size, macronutrients, and autonomic shifts; glycemic variability reviews associate swings with subjective cognition and fatigue in susceptible adults.',
          'Reddit: “2 p.m. slump,” CGM experiments with lunch walks, keto vs balanced lunch debates—patients empirically discover protein and movement benefits matching clinician advice.',
          'Quora: “Why do I need a nap after lunch?” separates normal post-meal calm from pathologic crashes—mirrors our decision-support section.',
          'PAA: “Afternoon fatigue after eating,” “Post lunch coma,” “Blood sugar crash afternoon”—differentiated from brain-fog guide by emphasizing **clock time and work impairment**, not only cognitive fog wording.',
          'Cluster links: pair with poor-sleep-feels-like-adhd when focus collapses after lunch but lifelong attention history exists—many patients need sleep and ADHD pathways, not only meal tweaks.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Urgent: chest pain, stroke symptoms, syncope while driving, confusion with fever. Routine: daily crashes >6 weeks, unintentional weight change, polyuria/polydipsia, loud snoring, or depression symptoms.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'Afternoon crashes are often metabolic + sleep + meal structure.',
          'Breakfast and lunch composition matter more than another espresso.',
          'Normal A1C does not clear insulin resistance concerns.',
          'Treat sleep apnea and insomnia as energy multipliers.',
        ],
        paragraphs: [
          'Book a Meet & Greet to map fatigue, metabolic, and sleep pathways with a licensed clinician before you overhaul your diet based on social media lunch hacks alone.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why do I crash every afternoon after lunch?',
        answer:
          'Frequent drivers include large high-carb lunches, blood sugar peaks and drops, insulin resistance, poor sleep, and stress. Daily severe crashes deserve medical review.',
      },
      {
        question: 'Why am I so tired after lunch?',
        answer:
          'Mild post-lunch sleepiness can be normal. Disabling fatigue suggests meal composition, metabolic, or sleep disorders worth evaluating.',
      },
      {
        question: 'What is an afternoon energy crash?',
        answer:
          'A predictable slump in alertness and mood 1–3 hours after midday eating, often with brain fog and carb cravings.',
      },
      {
        question: 'Is afternoon fatigue a sign of diabetes?',
        answer:
          'It can occur with prediabetes or diabetes but is not specific. Polyuria, thirst, weight loss, or elevated A1C increase concern.',
      },
      {
        question: 'How do I stop post-lunch sleepiness at work?',
        answer:
          'Smaller protein-forward lunches, post-meal walks, hydration, sleep optimization, and clinician-guided metabolic testing when persistent.',
      },
      {
        question: 'Afternoon crash vs brain fog after eating?',
        answer:
          'Overlapping topics. This guide centers afternoon timing; see brain fog after eating for wider differential and insulin resistance detail.',
      },
    ],
    evidence: [
      'O’Keefe JH et al. Meals and circadian clocks. J Am Coll Cardiol. 2014 (PMID 25225201)',
      'ADA Standards of Care—prediabetes lifestyle therapy (2025)',
      'AASM guidance on OSA and daytime sleepiness',
      'Postprandial glycemia and cognitive performance—systematic review themes',
      'Diabetes Prevention Program lifestyle outcomes (PMID 12023865)',
    ],
    learnMore: [
      { href: '/answers/brain-fog-after-eating', label: 'Brain fog after eating' },
      { href: '/answers/what-is-insulin-resistance', label: 'What is insulin resistance?' },
      { href: '/answers/poor-sleep-feels-like-adhd', label: 'Poor sleep feels like ADHD' },
      { href: '/answers/why-am-i-tired-even-after-sleeping', label: 'Tired after sleeping' },
      {
        href: '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
        label: 'Fatigue cornerstone',
      },
      { href: '/weight-loss-metabolic-health', label: 'Metabolic health care' },
    ],
    related: [
      'brain-fog-after-eating',
      'what-is-insulin-resistance',
      'normal-a1c-insulin-resistance',
      'why-am-i-tired-even-after-sleeping',
      'poor-sleep-feels-like-adhd',
      'what-is-food-noise',
    ],
    topic: 'weight-loss',
    hubCategories: ['metabolic', 'energy'],
    aboutCondition: 'Postprandial fatigue and circadian energy patterns',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/why-am-i-always-tired-causes-when-to-see-doctor',
  },
  {
    slug: 'high-shbg-low-free-testosterone',
    question: 'What does high SHBG with low free testosterone mean?',
    metaDescription:
      'High SHBG binds more testosterone, lowering free T even when total testosterone looks normal. Learn causes, symptoms overlap, and guideline-based evaluation—not supplement hype.',
    shortAnswer:
      'Sex hormone-binding globulin (SHBG) binds testosterone tightly; when SHBG is high, the **free testosterone** fraction available to tissues may be low even if **total testosterone** appears normal or borderline. Causes include aging, hyperthyroidism, liver disease, low insulin states, certain medications, and calorie restriction. Symptoms—low libido, fatigue, reduced muscle—overlap sleep apnea, depression, and ADHD, so labs must be paired with history and proper assay methods. Men told “your testosterone is fine” on a portal while symptomatic often need SHBG-aware interpretation and repeat morning testing—not supplement stacks from social media.',
    sections: [
      {
        id: 'shbg-free-t-explained',
        heading: 'SHBG and free testosterone explained',
        paragraphs: [
          'Total testosterone measures bound plus free fractions. SHBG-bound testosterone is not readily bioactive; albumin-bound and free fractions contribute to tissue exposure.',
          'Endocrine Society and AUA guidelines emphasize symptoms plus repeated morning total testosterone on accurate assays; calculate or measure free testosterone when SHBG is high or clinical suspicion remains despite “normal” totals.',
          'Direct immunoassay free testosterone is often inaccurate; equilibrium dialysis or validated calculators (inputs: total T, SHBG, albumin) are preferred in specialty care.',
          'PubMed literature notes SHBG rises with age and thyroid hormone excess; low insulin states can also elevate SHBG—lab interpretation requires the whole clinical picture, not a single arrow on the report.',
          'Patient forums confuse “high SHBG” with estrogen exposure in men; some estrogenic medications and obesity patterns affect SHBG differently—do not self-diagnose hormone imbalance from one lab line.',
        ],
      },
      {
        id: 'symptom-overlap',
        heading: 'Symptom overlap with sleep, mood, and ADHD',
        paragraphs: [
          'Low libido and fatigue appear in depression, sleep apnea, and hypogonadism. Testosterone therapy does not replace CPAP or antidepressant care when those are primary drivers.',
          'ADHD and low testosterone can coexist; stimulants and TRT each carry monitoring requirements—coordinate through one medical home when possible.',
          'This guide extends the free-vs-total testosterone cornerstone blog with a **high SHBG** search intent; read both before requesting supplements.',
        ],
      },
      {
        id: 'common-example',
        heading: 'A common example',
        paragraphs: [
          'A 46-year-old man with fatigue and low libido has total testosterone 420 ng/dL (lab “normal”), SHBG elevated at 68 nmol/L, calculated free testosterone low-normal. He was told “labs are fine.”',
          'History reveals active hyperthyroidism treatment adjustment, 12-pound unintentional loss, and snoring. Repeat morning sample, thyroid review, sleep apnea screen, and guideline-concordant free testosterone assessment change the plan—TRT may or may not be appropriate.',
        ],
      },
      {
        id: 'causes-high-shbg',
        heading: 'Causes of high SHBG',
        listItems: [
          'Aging and some chronic illness states.',
          'Hyperthyroidism or excessive thyroid hormone replacement.',
          'Liver cirrhosis or advanced liver disease (context-dependent).',
          'Low insulin states (type 1 diabetes, prolonged fasting, anorexia).',
          'Certain medications (e.g., some anticonvulsants, estrogenic exposures).',
          'Genetic SHBG variants (less common).',
        ],
        paragraphs: [
          'Obesity often lowers SHBG—high SHBG is not the typical obesity pattern, so concurrent conditions should be explored rather than assuming one narrative.',
        ],
      },
      {
        id: 'decision-support',
        heading: 'Decision support',
        paragraphs: [
          'Repeat morning total testosterone twice when symptoms fit hypogonadism; confirm fasting state and sleep the night prior.',
          'Treat reversible drivers (thyroid excess, sleep apnea, depression) before labeling irreversible hypogonadism.',
          'TRT requires documented low levels on appropriate testing, fertility discussion, hematocrit monitoring, and cardiovascular risk counseling—not “low-normal free T” alone on a single direct assay.',
          'Men’s health telehealth can coordinate labs; local phlebotomy and endocrinology referral may follow.',
          'Ask specifically for calculated free testosterone (or equilibrium dialysis when indicated), morning draw, and thyroid review if SHBG is high—portal “normal” totals are insufficient for symptomatic men.',
          'Avoid starting OTC testosterone boosters while sleep apnea is untreated; apnea therapy alone sometimes improves energy and libido without TRT.',
        ],
      },
      {
        id: 'research-themes',
        heading: 'PubMed, forums, and PAA themes',
        paragraphs: [
          'Endocrine Society guidance: diagnose hypogonadism with symptoms plus repeatedly low morning testosterone; free testosterone assessment when SHBG confounds interpretation. Rosner position statements caution on assay inaccuracy.',
          'Reddit r/Testosterone themes: “high SHBG low free T,” thyroid links, distrust of single “normal” total T—patients want calculated free T and symptom validation.',
          'Quora: “What causes high SHBG in men?” “Low free testosterone normal total?”—map to thyroid, liver, meds, and calorie deficiency.',
          'PAA: “High SHBG symptoms,” “How to lower SHBG,” “Free vs total testosterone”—this guide targets high-SHBG intent; cornerstone blog covers broader free-vs-total education.',
          'Do not duplicate free-testosterone cornerstone lab-tutorial prose; link out for assay method detail and use this page for high-SHBG differential framing.',
        ],
      },
      {
        id: 'when-to-seek-evaluation',
        heading: 'When to seek evaluation',
        paragraphs: [
          'Urgent: chest pain, stroke symptoms, severe testicular pain, acute psychiatric crisis. Routine: progressive fatigue, erectile dysfunction, infertility plans, or breast tenderness on prior hormone use.',
        ],
      },
      {
        id: 'key-takeaways',
        heading: 'Key takeaways',
        listItems: [
          'High SHBG can lower free testosterone despite “normal” totals.',
          'Symptoms are nonspecific—screen sleep and mood too.',
          'Assay quality and repeat testing matter.',
          'TRT is not automatic for every low free testosterone reading.',
        ],
        paragraphs: [
          'Men’s health telehealth and a Meet & Greet help interpret SHBG-aware labs with symptom context—not supplement stores selling “boosters” without monitoring.',
        ],
      },
    ],
    faqs: [
      {
        question: 'What does high SHBG with low free testosterone mean?',
        answer:
          'More testosterone is protein-bound and less is bioavailable. Clinicians evaluate thyroid, liver, medications, symptoms, and repeat morning labs with proper free testosterone assessment.',
      },
      {
        question: 'Can you have low free testosterone with normal total?',
        answer:
          'Yes—elevated SHBG is a common mechanism, especially with thyroid excess or certain medicines.',
      },
      {
        question: 'What causes high SHBG in men?',
        answer:
          'Aging, hyperthyroidism, liver disease, low insulin states, some drugs, and caloric restriction patterns—context determines which to test.',
      },
      {
        question: 'Do I need TRT if free testosterone is low?',
        answer:
          'Only when guideline criteria are met after reversible causes are addressed and risks/benefits are reviewed—not based on one screening line.',
      },
      {
        question: 'High SHBG and fatigue—connected?',
        answer:
          'Possibly via low free testosterone, but fatigue also commonly reflects sleep apnea, depression, anemia, and metabolic issues—do not treat labs alone.',
      },
      {
        question: 'How is free testosterone measured accurately?',
        answer:
          'Equilibrium dialysis or validated calculations from total testosterone, SHBG, and albumin—avoid unreliable direct free testosterone immunoassays when possible.',
      },
    ],
    evidence: [
      'Endocrine Society clinical practice guideline on testosterone deficiency in men (2018)',
      'AUA guideline on testosterone deficiency (reaffirmed 2024)',
      'Bhasin S et al. Testosterone therapy in men with hypogonadism (Endocrine Society)',
      'Rosner W et al. Position statement on testosterone and SHBG measurement challenges',
      'Free testosterone calculation vs equilibrium dialysis literature themes',
    ],
    learnMore: [
      { href: '/answers/what-is-free-testosterone', label: 'What is free testosterone?' },
      { href: '/answers/what-does-low-testosterone-feel-like', label: 'What does low testosterone feel like?' },
      { href: '/answers/when-is-testosterone-therapy-appropriate', label: 'When is TRT appropriate?' },
      {
        href: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
        label: 'Free vs total testosterone cornerstone',
      },
      { href: '/mens-health-longevity', label: "Men's health & longevity" },
      { href: '/telehealth', label: 'Telehealth' },
    ],
    related: [
      'what-is-free-testosterone',
      'what-does-low-testosterone-feel-like',
      'when-is-testosterone-therapy-appropriate',
      'trt-monitoring-requirements',
      'testosterone-and-adhd-overlap',
      'why-am-i-tired-even-after-sleeping',
    ],
    topic: 'mens-health',
    hubCategories: ['hormone'],
    aboutCondition: 'Male hypogonadism and sex hormone-binding globulin',
    reviewerSlug: 'dr-sneh-pandey',
    cornerstoneBlog: '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know',
  },
];
