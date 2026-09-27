# Siya Health repositioning — review packet

Status: the identity change (schema, hubs, service-menu order) is shipping on its own. Article paragraphs in section 3 are corrected and are **not** on any page. They are held for Sneha. Nothing in section 3 was committed or deployed.

This packet covers three requests:

1. Inventory of blog and Health Guide titles that name a drug or a diagnosis, plus the site description, the menus, and the hub headings.
2. The request to rewrite the organization description, the blog hub, the Health Guides hub, and the service menus so ADHD is one service among several.
3. One short framing paragraph per inventoried article, shown as a diff that inserts it after the H1.

## What was changed in the site

The identity changes in section 1 (schema description, blog hub title and hero, Health Guides title and search box, service-menu order) are the ones approved to ship. The article paragraphs in section 3 are corrected and are not inserted into any page. They stay here for Sneha’s review before any batch is deployed.

The quotes in section 1 are the wording that was in the files before that identity change. The proposed lines under them are what shipped.

---

## 1. Site identity, menus, and hubs

### Organization schema

Exact `MedicalOrganization` description in `apps/siya-health/index.html`:

> Primary care–led telehealth for ADHD evaluation, metabolic health, and licensed medical provider care across California, Texas, Pennsylvania, and Florida.

The homepage meta description in that same file does not lead with ADHD:

> Physician-led integrated care for busy professionals — primary care, ADHD, weight, and hormonal health in one place. Licensed in CA, TX, PA, and FL.

Visible H1:

> Welcome to an integrated care experience for busy professionals

**Proposed schema description, not applied.** ADHD is named and is not first:

> Physician-led integrated care for busy professionals across California, Texas, Pennsylvania, and Florida — weight, energy, sleep, hormones, primary care, and ADHD.

The specialty list already starts with Internal Medicine, then Family Medicine, Obesity Medicine, Adult ADHD, and Behavioral Medicine. It was left as written.

### Menus

Homepage header: About, Care Team, Labs, Pricing, and Book Free Meet & Greet. No service list.

Compact footer on newer pages: About, Pricing, For Employers, Social, Legal, phone. ADHD is not in that line. For Employers was added in `scripts/h2-footer.js`. That is the compact footer only. The older Company-column footer was not changed.

Service menu on other pages, from `STANDARD_SERVICE_NAV_LINKS` in `scripts/site-chrome.mjs`, copied into page headers:

1. ADHD Care
2. Weight Loss
3. Telehealth
4. For Employers (desktop label “Employers”)
5. Blog

Homepage problem list, for comparison: exhaustion, weight, brain fog, sleep, hair or muscle, pain. In the hero rotation ADHD sits after sexual health and mental health, not as the page title.

**Proposed service order, not applied**, using only links that already exist:

1. Weight Loss
2. Telehealth
3. ADHD Care
4. For Employers
5. Blog

Exhaustion, brain fog, sleep, and hormones do not have their own items in this menu, so they were not added.

### Blog hub (`blog/index.html`)

Title:

> Health Insights & Blog Hub (2026) | ADHD, Weight Loss & Telehealth | Siya Health

Hero heading:

> Health Insights — Evidence-Based, Clinical

Hero subheading:

> ADHD care, weight loss, and telehealth—from licensed clinicians serving California · Texas · Pennsylvania · Florida.

**Proposed, not applied:**

- Title: `Health insights for busy professionals | Siya Health`
- Heading: `Health insights for a full workweek`
- Subheading: `Weight, energy, sleep, hormones, and focus — from licensed clinicians in California, Texas, Pennsylvania, and Florida. ADHD is one of those topics, not the only one.`

### Health Guides hub (`answers/index.html`)

Title:

> Health Guides | Metabolic, ADHD, Hormones & Telehealth | Siya Health

H1 is “Health Guides.” The lead and the jump links already list metabolic health, energy, hormones, and labs before ADHD. Category cards follow that order: Metabolic, Energy and Fatigue, Hormone Health, ADHD and Focus, then Telehealth. The search box still opens with ADHD: “Try ADHD, GLP-1, thyroid, fatigue, perimenopause…”

**Proposed, not applied:**

- Title: `Health Guides | Weight, energy, hormones, sleep, and ADHD | Siya Health`
- Search placeholder: `Try fatigue, weight, sleep, hormones, labs…`
- Section order stays. ADHD is already not the first category.

An ADHD next-step block remains at the bottom of the hub, after the categories. It was not the lead and was not removed.

---

## 2. Inventory

Included when the `<title>` or `<h1>` names a medication or a diagnosis. Hubs are excluded from the paragraph batches. City ADHD pages under `/adhd-care` are service landings, not articles, and are not in this table. City pages that live in `blog/` are included.

Count: **99** articles.

| File | Title | Meta description | H1 | First two sentences of the current intro |
|---|---|---|---|---|
| `blog/adderall-for-adhd-how-it-works.html` | Adderall for ADHD: How It Works in 2026 (Mechanism, Benefits & Safety) \| Siya Health | How Adderall works for ADHD in adults (2026): brain mechanisms, who may benefit, risks, monitoring, and why only a licensed prescriber should decide. | Adderall for ADHD: How It Works (2026 Clinical Overview) | Adderall is one of the most discussed stimulant medications for ADHD in adults. Understanding how it works—and what it cannot do—helps you have an informed conversation with a licensed clinician. |
| `blog/adhd-accommodations-hr-primer.html` | ADHD Accommodations at Work: An HR Primer (Clinical vs Legal) \| Siya Health | HR teams: separate the clinical documentation employees may need from the legal accommodation process. Educational framing—not legal or medical advice. | ADHD Accommodations at Work: An HR Primer | When an employee mentions ADHD or focus problems, HR is often the first desk—not the clinician. Knowing where clinical documentation ends and accommodation law begins saves confusion on all sides. |
| `blog/adhd-and-binge-eating.html` | ADHD and Binge Eating: The Link, Food Noise & What Helps \| Siya Health | Adults with ADHD face higher rates of binge eating. Learn how common it is, ADHD vs emotional eating, food noise, Vyvanse for BED, and when an ADHD evaluation helps. | ADHD and Binge Eating: Why the Link Matters (and What Actually Helps) | If you have spent years cycling between restriction, “just one bite,” and feeling out of control around food, the problem may not be willpower alone. For many adults, ADHD and binge eating travel together—through impulsivity, executive dysfunction, and persistent food noise. |
| `blog/adhd-brain-imaging-subtypes.html` | ADHD Brain Imaging Subtypes: What New Research May Mean \| Siya Health | Emerging JAMA Psychiatry research describes three ADHD-related brain patterns. Learn what biotypes may mean—and what they do not change about diagnosis today. | Not All ADHD Is the Same: What New Brain Imaging Research May Mean for the Future of ADHD Care | A 2026 study in JAMA Psychiatry used brain imaging to sort people with ADHD into three distinct patterns, or "biotypes," based on how different brain regions relate to one another structurally. It's genuinely interesting research. |
| `blog/adhd-evaluation-california-online-vs-in-person.html` | ADHD Evaluation in California: Online vs In-Person Options (2026) \| Siya Health | ADHD evaluation California: compare secure telehealth and in-office visits—timelines, costs, legitimacy, medication discussions, safety. | ADHD Evaluation in California: Online vs In-Person Options | Choosing between ADHD evaluation online California workflows and an in-person clinician does not decide quality by itself—it is about whether whoever evaluates you invests enough time and documentation to differentiate ADHD from ADHD mimickers. |
| `blog/adhd-evaluation-cost-texas.html` | ADHD Evaluation Cost in Texas: Full Breakdown (2026 Guide) \| Siya Health | What does an ADHD evaluation cost in Texas in 2026? Compare options—insurance, cash pay, online—and see the real breakdown. | ADHD Evaluation Cost in Texas: Full Breakdown (2026 Guide) | You’ve finally decided to look into an ADHD evaluation. But when you started searching, the numbers were all over the place—$200, $800, $1,500. |
| `blog/adhd-hormones-women.html` | ADHD and Hormones in Women: Cycle, Perimenopause & Shifts \| Siya Health | Why ADHD symptoms can shift with the menstrual cycle and perimenopause. Estrogen–attention biology in plain language, evidence limits, myths, and women-informed evaluation. | ADHD and Hormones in Women: Cycle, Perimenopause, and Why Symptoms Shift | My ADHD used to be manageable. Then my hormones shifted. |
| `blog/adhd-in-women.html` | ADHD in Women: Symptoms, Masking & Late Diagnosis \| Siya Health | Learn how ADHD can appear in adult women, including masking, late diagnosis, hormones, burnout, executive dysfunction, and treatment options. | ADHD in Women: Symptoms, Masking, Hormones, and Late Diagnosis | Maybe it was a school report card that said &quot;so bright, but doesn&#x27;t apply herself.&quot; Maybe it&#x27;s a closet full of half-finished planners, a phone with forty open tabs, or the exhaustion of holding a job, a household, and a face that looks fine together at once. Maybe a therapist mentioned anxiety years ago, and treating it helped a little, but something underneath never quite resolved. |
| `blog/adhd-medication-daily-or-as-needed-adults.html` | Do You Need ADHD Medication Every Day? (Daily vs PRN for Adults) \| Siya Health | Daily ADHD dosing vs weekends off—what's safe for adults? Learn PRN vs daily trade-offs before changing your medication schedule. | Do Adults Need ADHD Medication Every Day? | Weekend breaks sound appealing—but inconsistent stimulant use can blur whether a dose works and complicate safety monitoring. Understand daily vs as-needed trade-offs with your prescriber. |
| `blog/adhd-medication-online-california.html` | Can You Get ADHD Medication Online in California? (2026 Guide) \| Siya Health | ADHD medication online California: telehealth rules, evaluation standards, red flags, and why no practice should promise instant stimulants—patient guide. | Can You Get ADHD Medication Online in California? What Patients Should Know | Searching ADHD medication online California mixes hope and hazard—telehealth can streamline refills when clinically appropriate—but nothing ethical guarantees stimulants purely because you typed credit card digits excitedly. |
| `blog/adhd-medication-options-california.html` | ADHD Medication Options in California: Stimulants, Non‑Stimulants & FAQs \| Siya Health | Compare ADHD meds in CA: ADHD medication options California—Vyvanse, Adderall, non‑stimulants, generics. Education only; no prescribing promises. | ADHD Medication Options in California: What Exists (and What Is Decided Clinically) | Searching ADHD medication options California mixes brand names (Vyvanse, Adderall, Concerta-style delivery systems) with patient stories—here is calm, clinician-framed orientation without implying you will automatically receive any specific drug. |
| `blog/adhd-medication-options-for-adults.html` | ADHD Medication Options for Adults: Stimulant vs Non-Stimulant Guide \| Siya Health | First ADHD med visit? See how clinicians compare stimulant and non-stimulant options, combination strategies, and what trials usually look like. | ADHD Medication Options for Adults: Where to Start | Stimulant vs non-stimulant isn't a personality quiz—it's a medical decision based on history, comorbidities, and how you respond over weeks. Start with the decision tree clinicians use. |
| `blog/adhd-medication-side-effects-what-to-expect.html` | ADHD Medication Side Effects in 2026: What to Expect & When to Call a Doctor \| Siya Health | ADHD medication side effects (2026): common stimulant and non-stimulant reactions, monitoring, mental health warnings, and when to seek urgent care. | ADHD Medication Side Effects: What to Expect (2026) | Knowing what ADHD medication side effects are common—and which symptoms require urgent attention—helps adults partner safely with prescribers. This guide is educational only; any new or severe symptom should be reported promptly to a clinician or emergency services as appropriate. |
| `blog/adhd-symptoms-overlooked.html` | 7 Adult ADHD Signs Doctors Miss (Not Just "Can't Focus") \| Siya Health | Forgetfulness isn't the only sign. Hyperfocus, emotional swings, and procrastination despite caring—overlooked adult ADHD symptoms clinicians evaluate. | 7 Adult ADHD Signs Doctors Often Miss | You can excel at work and still have ADHD—hyperfocus, emotional flooding, and chronic procrastination are signs clinicians see every week. If position #8 on Google brought you here, this checklist goes beyond "can't focus." |
| `blog/adhd-telehealth-california.html` | ADHD Telehealth in California: How Virtual Care Works (2026) \| Siya Health | ADHD telehealth California explained: HIPAA visits, clinician roles, prescribing limits context, ADHD medication management Calif. cadence—all without gimmicks. | ADHD Telehealth in California: How Virtual Care Works | ADHD telehealth California is not shorthand for careless apps—it is modality describing where secure visits occur while standards remain clinician-accountable ethically. |
| `blog/adhd-testing-online-california-screening-vs-evaluation.html` | ADHD Testing Online in California: Screening vs Full Evaluation \| Siya Health | ADHD test online California: know the difference between quick screens and clinician-led evaluation—tools, timing, limits, and choosing California providers wisely. | ADHD Testing Online in California: Screening vs Full Evaluation | If you googled ADHD test online California, you saw everything from two-minute quizzes to promises of clinical-grade conclusions—this separates signal from noise responsibly. |
| `blog/adhd-treatment-texas.html` | ADHD Treatment Texas \| Physician-Led Virtual Care \| Siya Health | Physician-led ADHD treatment for adults across Texas—Dallas, Houston, Austin, San Antonio, Fort Worth. Evaluation, medication management, and virtual care from $149. | ADHD Treatment in Texas: Physician-Led Virtual Care for Adults | You've probably already Googled your own symptoms more than once. Maybe it started with a coworker mentioning their own diagnosis, or a scroll through social media that felt uncomfortably specific, or one more night spent staring at an inbox you cannot make yourself open. |
| `blog/adhd.html` | ADHD Articles Hub (2026) — Diagnosis, Medication Education & Care \| Siya Health | Explore Siya Health ADHD articles: evaluation, medication education for adults, symptoms, and online care—indexed for search with clear internal links. | ADHD articles |  |
| `blog/adult-adhd-symptoms-california.html` | Adult ADHD Symptoms in California: Patterns Worth Taking Seriously \| Siya Health | Adult ADHD symptoms California: chronic patterns versus burnout mimics—attention drift, procrastination pits, rejection sensitivity arcs—and clinician evaluation norms. | Adult ADHD Symptoms in California: Patterns Worth Taking Seriously | If you are searching adult ADHD symptoms California after years of burnout, shame, missed deadlines—you deserve clarity that separates longstanding neurodevelopmental patterns from anxiety, PTSD, anemia, apnea, thyroid disease. |
| `blog/brain-fog-and-anxiety.html` | Brain Fog and Anxiety: When Worry Crowds Out Clarity \| Siya Health | Anxiety can feel like brain fog—racing thoughts, blanking under stress, and mental exhaustion. Learn how primary care sorts fog, mood, and attention. | Brain Fog and Anxiety: When Worry Crowds Out Clarity | Anxiety does not only feel emotional. It can occupy working memory so thoroughly that thinking itself feels foggy. |
| `blog/brain-fog-vs-adhd.html` | Brain Fog vs ADHD: How to Tell the Difference \| Siya Health | Brain fog and ADHD can feel similar. Learn how clinicians sort short-term fog from lifelong attention patterns—and when primary care evaluation helps. | Brain Fog vs ADHD: How to Tell the Difference | Feeling foggy is not the same as living with ADHD—but the two often get mixed up. Here is how to think about the difference without self-diagnosing. |
| `blog/compounded-vs-branded-glp1-medications.html` | Compounded vs Branded GLP-1 Medications (2026): Safety & Standards \| Siya Health | Compounded vs branded GLP-1 in 2026: manufacturing standards, regulatory context, risks of unapproved copies, and why clinician oversight matters. | Compounded vs Branded GLP-1 Medications: What Patients Should Know (2026) | Search trends comparing compounded vs branded GLP-1 medications reflect real frustration with cost and shortages. Still, compounded products are not automatically equivalent to FDA-approved brands studied in trials. |
| `blog/executive-dysfunction-adhd.html` | Executive Dysfunction in ADHD: Signs, Domains & What Helps \| Siya Health | Learn how executive dysfunction shows up in adult ADHD—task initiation, working memory, planning, organization, decision fatigue, and when evaluation helps. | Executive Dysfunction in ADHD: What It Is and How It Shows Up in Adults | You can sit down and lose three hours to a spreadsheet you actually enjoy, rebuilding a formula nobody asked you to fix. Then you close the laptop, look at a single, two-line email you&#x27;ve been meaning to send for eleven days, and feel something close to physical resistance. |
| `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | Food Noise and GLP-1: What It Means and What Actually Helps (2026) \| Siya Health | Food noise—intrusive thoughts about eating—is not hunger or weak willpower. Learn how GLP-1 medications may quiet it, what evidence shows, myths, and when to seek medical care. | Food Noise and GLP-1: What It Means and What Actually Helps (2026) | You finish lunch, but your brain is already negotiating dinner. You open the pantry “just to look.” You rehearse what you will order before you are hungry. |
| `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Free Testosterone vs Total Testosterone: What Patients Should Know \| Siya Health | Normal total testosterone but still feel terrible? Learn how free testosterone, SHBG, and lab methods explain the mismatch—and when evaluation is appropriate. | Free Testosterone vs Total Testosterone: What Patients Should Know | Your lab report says total testosterone is “normal.” You still have low libido, flat energy, weaker morning erections, or brain fog that will not lift. One of the most common—and least explained—reasons is that total testosterone is not the same as the testosterone your body can actually use. |
| `blog/glp1-side-effects-and-how-to-manage-them.html` | GLP-1 Side Effects & How to Manage Them (2026) \| Siya Health | GLP-1 side effects in 2026: nausea, GI symptoms, dehydration risks, rare warnings, and clinician-guided strategies—educational, not a substitute for care. | GLP-1 Side Effects and How to Manage Them (2026) | GLP-1 receptor agonists can be effective tools for some adults, yet gastrointestinal and metabolic side effects drive many early stops. Understanding GLP-1 side effects and how to manage them helps you partner with your care team—never to self-titrate or treat serious symptoms alone. |
| `blog/how-adhd-medication-is-prescribed-online.html` | How ADHD Medication Is Prescribed Online in 2026 (Laws, Safety & Standards) \| Siya Health | How online ADHD prescribing works in 2026: Ryan Haight context, telehealth rules, controlled substances, evaluation standards, and how to spot legitimate care. | How ADHD Medication Is Prescribed Online (2026) | Telehealth made ADHD care more accessible, but prescribing controlled stimulants online remains one of the most regulated areas in US medicine. Adults should understand how legitimate online ADHD prescribing differs from risky shortcuts—and why thorough evaluation protects patients and clinicians alike. |
| `blog/how-to-choose-adhd-provider-california.html` | How to Choose an ADHD Provider in California (Red Flags Included) \| Siya Health | Choose an ADHD provider in California: telehealth legitimacy, clinician transparency, visit length norms, prescribing ethics—and instant prescription funnel red flags. | How to Choose an ADHD Provider in California | If you wondered how to choose an ADHD provider California without landing in a gimmick funnel, use this checklist grounded in clinician ethics—not checkout psychology. |
| `blog/how-to-know-if-you-have-adhd-adult.html` | How to Know If You Have ADHD as an Adult (Real Signs Explained) \| Siya Health | Not sure if you have ADHD? Learn the real signs adults experience—beyond the stereotypes—and when it's worth getting evaluated. | How to Know If You Have ADHD as an Adult (Real Signs Explained) | You've been called scatterbrained, lazy, or forgetful your whole life. You've tried planners, to-do lists, and productivity hacks—and somehow things still slip. |
| `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | Insulin Resistance and Weight Loss: A Clinician-Guided Overview \| Siya Health | Insulin resistance can exist with a normal A1C and make weight loss harder. Learn early signs, visceral fat, cravings, sleep, ADHD overlap, evidence-based steps, and myths—without wellness clichés. | Insulin Resistance and Weight Loss: A Clinician-Guided Overview | Your last labs were “fine.” You have tried counting calories, walking more, maybe even keto—and the scale still barely moves. By 3 p.m. |
| `blog/iron-deficiency-brain-fog-adhd.html` | Iron Deficiency, Brain Fog & ADHD: What Research Shows \| Siya Health | Low iron and low ferritin can worsen brain fog and ADHD-like symptoms. Learn association vs causation, dopamine biology, and what to discuss with a clinician. | Iron Deficiency, Brain Fog, and ADHD: Could Low Iron Make ADHD Symptoms Worse? | A patient comes in describing months of fatigue, forgetfulness, and trouble concentrating, and asks a fair question: could this be ADHD, or could it be low iron? The honest answer is that it can be either, both, or neither&#x2014;and the only way to know is bloodwork and a real history, not a symptom checklist read off a screen. |
| `blog/is-adhd-medication-safe-long-term.html` | Is ADHD Medication Safe Long Term in 2026? Benefits, Monitoring & Myths \| Siya Health | Long-term ADHD medication safety (2026): what studies suggest, cardiovascular monitoring, growth/weight, mental health, and why follow-up with a prescriber matters. | Is ADHD Medication Safe Long Term? Benefits & Monitoring (2026) | Questions about long-term ADHD medication safety are understandable. Research continues to evolve, and individual risk varies by age, genetics, dose, substance use, and cardiovascular health. |
| `blog/is-online-adhd-diagnosis-legit.html` | Is Online ADHD Diagnosis Legit? What Patients Should Know \| Siya Health | Skeptical about online ADHD diagnosis? Here's what makes it legitimate—and what to look for when choosing a provider. | Is Online ADHD Diagnosis Legit? What Patients Should Know | You’ve heard the horror stories: pill mills, five-minute “diagnoses,” prescriptions after a quick quiz. No wonder you’re skeptical. |
| `blog/medical-weight-loss-glp1-semaglutide-texas.html` | Medical Weight Loss in Texas: GLP-1, Semaglutide, Tirzepatide & What Actually Works \| Siya Health | Evidence-based medical weight loss in Texas. GLP-1 medications, semaglutide, tirzepatide, phentermine—when they're appropriate and what to expect from provider-guided care. | Medical Weight Loss in Texas: GLP-1, Semaglutide, Tirzepatide & What Actually Works | You've tried diets. You've lost weight—and gained it back. |
| `blog/minoxidil-for-hair-loss-does-it-work.html` | Minoxidil for Hair Loss: Does It Work? (2026 Evidence) \| Siya Health | Minoxidil for hair loss in 2026: mechanism, expected timelines, limits, side effects—informational only; consult a licensed clinician for diagnosis. | Minoxidil for Hair Loss: Does It Work? (2026) | Minoxidil is one of the most studied topical therapies for certain types of hair thinning, particularly androgenetic patterns in some individuals. Asking whether minoxidil for hair loss works is reasonable—but answers depend on cause of shedding, follicle viability, consistency of use, and realistic timelines. |
| `blog/non-stimulant-adhd-medications-explained.html` | Non-Stimulant ADHD Meds: When Are They Used Instead of Stimulants? \| Siya Health | Can't tolerate stimulants? Compare atomoxetine, guanfacine, and viloxazine—onset timelines, side effects, and when prescribers choose non-stimulant ADHD meds. | When Do Adults Use Non-Stimulant ADHD Medications? | Non-stimulants aren't "Plan B"—they're a different tool when stimulants aren't safe, aren't tolerated, or don't fit your history. See when clinicians reach for them first. |
| `blog/online-adhd-diagnosis-california.html` | Online ADHD Diagnosis in California (2026): Cost, Process & What to Expect \| Siya Health | Online ADHD diagnosis California: costs, secure telehealth steps, and what a legitimate evaluation looks like—with licensed clinician oversight. | Online ADHD Diagnosis in California: Cost, Process & What to Expect | If you are exploring online ADHD diagnosis California pathways, learn what credible telehealth includes, how pricing typically works in 2026, and why evaluation quality matters more than speed alone. |
| `blog/online-adhd-diagnosis-texas.html` | Online ADHD Diagnosis in Texas (2026): Cost, Process & What to Expect \| Siya Health | Online ADHD diagnosis in Texas (2026): real costs, telehealth steps, and what a legitimate evaluation includes—with licensed clinicians. | Online ADHD Diagnosis in Texas: Cost, Process & What to Expect | You’ve been putting off getting evaluated for years. Maybe you’ve told yourself it’s not that bad, or you’ll figure it out. |
| `blog/oral-vs-injectable-weight-loss-medications.html` | Oral vs Injectable Weight Loss Medications (2026): GLP-1 & Beyond \| Siya Health | Oral vs injectable weight loss meds in 2026: adherence, absorption, side effects, and how clinicians choose formats—education only, no dosing advice. | Oral vs Injectable Weight Loss Medications: What to Know (2026) | Patients comparing oral vs injectable weight loss medications are often deciding between convenience, tolerability, and how their body absorbs therapy. Some GLP-1 options are injectable weekly; oral formulations exist for certain agents and indications. |
| `blog/oral-vs-topical-minoxidil-which-is-right.html` | Oral vs Topical Minoxidil for Hair Loss (2026) \| Siya Health | Oral vs topical minoxidil in 2026: absorption, side effect profiles, monitoring, and why prescribing stays with licensed clinicians—education only. | Oral vs Topical Minoxidil: Which Is Right? (2026) | The comparison oral vs topical minoxidil has grown as low-dose oral prescriptions appear in some specialty practices. Topical remains first-line for many consumers, but adherence and skin reactions sway decisions. |
| `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | Phentermine for Weight Loss: Safety & Effectiveness in 2026 \| Siya Health | Phentermine for weight loss in 2026: FDA history, cardiovascular cautions, short-term use norms, monitoring, and alternatives—educational only. | Phentermine for Weight Loss: Safety and Effectiveness (2026) | Phentermine is among the oldest prescription appetite suppressants in U.S. obesity pharmacotherapy. |
| `blog/pots-and-adhd.html` | POTS and ADHD: Shared Symptoms, Overlap & What Research Shows \| Siya Health | POTS and ADHD can share brain fog, fatigue, and attention problems. Learn orthostatic intolerance, current evidence, and why overlap creates diagnostic confusion. | POTS and ADHD: Why Researchers Are Exploring the Connection | A patient stands up from her desk, and within a minute her heart rate has jumped from 72 to 128. She also can&#x27;t hold a thought long enough to finish an email, has missed two deadlines this month, and has carried an ADHD diagnosis for years. |
| `blog/semaglutide-for-weight-loss-how-it-works.html` | Semaglutide for Weight Loss: How It Works in 2026 (GLP-1 Science) \| Siya Health | Semaglutide for weight loss (2026): GLP-1 mechanism, appetite regulation, who may qualify, risks, and why provider supervision matters—education only. | Semaglutide for Weight Loss: How It Works (2026 Clinical Overview) | If you have been reading about semaglutide for weight loss, you are seeing one part of a much larger medical conversation. Semaglutide is a GLP-1 receptor agonist that clinicians may prescribe for some adults with obesity or weight-related conditions when criteria are met. |
| `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | Sildenafil for Erectile Dysfunction: What to Expect (2026) \| Siya Health | Sildenafil for erectile dysfunction in 2026: mechanism, cardiovascular precautions, interactions, and telehealth norms—informational, not prescribing advice. | Sildenafil for Erectile Dysfunction: What to Expect (2026) | Sildenafil is a PDE5 inhibitor used for erectile dysfunction when medically appropriate. Understanding sildenafil for erectile dysfunction means reviewing heart health, nitrates, vision risks, and honest discussion of psychological contributors. |
| `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Sleep Apnea, Fatigue & Metabolic Risk: When Snoring Is Not Benign \| Siya Health | Snoring plus fatigue, weight gain, or resistant hypertension? Evidence-based guide to obstructive sleep apnea, insulin resistance, testosterone, ADHD overlap, and next steps. | Sleep Apnea, Fatigue, and Metabolic Risk: When Snoring Is Not Benign | Your partner says you stop breathing at night. You sleep seven or eight hours yet wake heavy-headed. |
| `blog/thyroid-and-fatigue.html` | Thyroid Problems and Fatigue: What to Know Before You Self-Diagnose \| Siya Health | Thyroid disease is a classic fatigue look-alike. Learn common patterns, what TSH measures, and why primary care—not internet protocols—should guide testing. | Thyroid Problems and Fatigue | When metabolism slows or swings, energy often goes first. Thyroid disease is one of several medical explanations for persistent tiredness. |
| `blog/tirzepatide-vs-semaglutide-which-is-better.html` | Tirzepatide vs Semaglutide for Weight Loss (2026): Compare GLP-1 Options \| Siya Health | Tirzepatide vs semaglutide in 2026: dual GIP/GLP-1 vs GLP-1 agonist, trial context, side effects, and how clinicians choose—no outcome promises. | Tirzepatide vs Semaglutide: Which Is Better for Weight Loss? (2026) | You do not have a spare week to sort a medication contest from a feed. Tirzepatide and semaglutide are both prescription options a clinician may consider for weight and metabolic health. |
| `blog/vyvanse-vs-adderall-differences.html` | Vyvanse vs Adderall: Which Lasts Longer for Adult ADHD? \| Siya Health | Vyvanse vs Adderall for adults: compare duration, onset, crash patterns, and side effects—what to ask your prescriber before switching stimulants. | Vyvanse vs Adderall: Which Lasts Longer for Adults? | The real question isn't "which is stronger"—it's how long coverage lasts, how smooth wear-off feels, and which formulation fits your day. Compare both before your next visit. |
| `blog/weight-loss.html` | Weight Loss Articles (2026) — GLP-1 & Medical Metabolic Care \| Siya Health Blog | Siya Health weight loss articles: GLP-1 medications, semaglutide, tirzepatide, and evidence-based medical weight loss in Texas—with telehealth context. | Weight loss articles |  |
| `blog/when-is-testosterone-therapy-appropriate.html` | When Is Testosterone Therapy Appropriate? (2026 Guide) \| Siya Health | When testosterone therapy is appropriate in 2026: hypogonadism diagnosis, monitoring, fertility, cardiovascular themes—no anti-aging hype, education only. | When Is Testosterone Therapy Appropriate? (2026) | Testosterone therapy is appropriate only when biochemical and clinical criteria for testosterone deficiency are met—not for vague fatigue or aesthetic goals. This article explains evaluation principles, risks like erythrocytosis and infertility, and why telehealth still requires labs and follow-up. |
| `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | You’re Not Lazy: Undiagnosed Adult ADHD Signs \| TX, PA, FL \| Siya Health | Adult ADHD symptoms are often mistaken for laziness. Learn signs of undiagnosed ADHD in adults, why late diagnosis is common, and how care works in Texas—with supportive, non-judgmental next steps. | You’re Not Lazy: Signs You May Have Undiagnosed Adult ADHD | If you’ve ever lain awake replaying every unfinished task—telling yourself you just need more discipline—you’re not alone. Many bright, capable adults carry years of shame for struggles that have nothing to do with character. |
| `answers/adderall-vs-vyvanse-adults.html` | When might Vyvanse be preferred over Adderall for adults? \| Siya Health | Quick FAQ on Vyvanse vs Adderall timing, smoothness, and prescriber trade-offs—not a full comparison. Read the complete guide. | When might Vyvanse be preferred over Adderall for adults? | Both are stimulant medications used for ADHD when clinically appropriate. Adderall (mixed amphetamine salts) has multiple formulations with varied onset/duration; Vyvanse (lisdexamfetamine) is a prodrug with smoother onset for many patients. |
| `answers/adhd-and-weight-loss-connection.html` | Is there a connection between ADHD and weight loss struggles? \| Siya Health | Yes. Impulsivity, emotional eating, irregular meals, sleep debt, and stimulant effects on appetite all link ADHD and weight. Treating ADHD can help routine… | Is there a connection between ADHD and weight loss struggles? | Yes. ADHD and weight often travel together, and it is not only “no willpower.” |
| `answers/adhd-in-women.html` | How does ADHD present differently in women? \| Siya Health | Quick FAQ: how ADHD often presents in women—inattentive symptoms, masking, and delayed diagnosis. Read the full clinical hub for depth. | How does ADHD present differently in women? | Women more often present with inattentive symptoms—daydreaming, disorganization, emotional dysregulation—rather than obvious hyperactivity. Hormonal shifts, social expectations, and misattribution to anxiety or mood disorders delay diagnosis. |
| `answers/adhd-medication-every-day.html` | Do you have to take ADHD medication every day? \| Siya Health | Quick FAQ: daily vs as-needed ADHD dosing for adults. Full dosing guide linked for prescriber-aligned plans. | Do you have to take ADHD medication every day? | Some adults take medication daily; others use weekday-only or situational dosing when clinically appropriate. Skipping doses unpredictably on controlled stimulants can cause rebound symptoms or inconsistency—follow your prescriber’s plan. |
| `answers/adhd-medication-side-effects.html` | What ADHD medication side effects are most common in the first weeks? \| Siya Health | Quick FAQ on early stimulant and non-stimulant side effects. Full expectations guide linked for depth and monitoring. | What ADHD medication side effects are most common in the first weeks? | Stimulants may cause decreased appetite, insomnia, increased heart rate or blood pressure, anxiety, or mood changes. Non-stimulants have their own profiles (e.g., fatigue, dry mouth). |
| `answers/adhd-vs-anxiety.html` | How do you tell ADHD apart from anxiety? \| Siya Health | ADHD vs anxiety: how clinicians tell chronic attention problems from worry-driven distraction. Screening, overlap, and when to seek evaluation. | How do you tell ADHD apart from anxiety? | Anxiety often shows as situational worry, physical tension, and avoidance tied to feared outcomes. ADHD is a chronic pattern of attention regulation, organization, time blindness, and impulse-control problems that usually began in childhood and appear across work, home, and relationships. |
| `answers/adhd-vs-burnout.html` | Is it ADHD or burnout? \| Siya Health | ADHD vs burnout: timeline, rest response, and when focus problems need evaluation. Learn how clinicians tell lifelong ADHD from job-linked exhaustion. | Is it ADHD or burnout? | Burnout is usually tied to prolonged occupational or caregiving stress and often improves with rest, boundaries, therapy, or role changes. ADHD is a lifelong neurodevelopmental pattern of attention, organization, and impulse regulation that shows up across settings—not only at work. |
| `answers/adhd-workplace-accommodations.html` | Can ADHD support workplace accommodations? \| Siya Health | A licensed clinician can document ADHD-related findings and functional limitations when clinically supported. Whether an employer grants accommodations dep… | Can ADHD support workplace accommodations? | A licensed clinician can document ADHD-related findings and functional limitations when clinically supported. Whether an employer grants accommodations depends on employment law, employer policy, and your specific situation—not on the clinic alone. |
| `answers/asrs-adhd-screening-explained.html` | What is the ASRS ADHD screening test? \| Siya Health | The Adult ADHD Self-Report Scale (ASRS) is a validated screening questionnaire—not a diagnosis. It helps clinicians decide whether a full evaluation is war… | What is the ASRS ADHD screening test? | The Adult ADHD Self-Report Scale (ASRS) is a validated screening questionnaire—not a diagnosis. It helps clinicians decide whether a full evaluation is warranted. |
| `answers/can-adhd-be-diagnosed-online.html` | Can ADHD be diagnosed online? \| Siya Health | Can ADHD be diagnosed online? When telehealth evaluation is legitimate, what is included, and red flags to avoid. | Can ADHD be diagnosed online? | Yes—when a licensed clinician in your state conducts a full telehealth evaluation with clinical interview, validated screening and assessment tools as indicated, medical and psychiatric history, and safety review. A free online quiz alone is screening, not diagnosis. |
| `answers/can-adhd-cause-anxiety.html` | Can ADHD cause anxiety? \| Siya Health | Can ADHD cause anxiety? Secondary anxiety from untreated ADHD, overlap, and how clinicians evaluate both. | Can ADHD cause anxiety? | ADHD does not universally “cause” anxiety in a simple one-direction way, but living with untreated ADHD—missed deadlines, shame, chronic overwhelm—commonly leads to secondary anxiety. ADHD and generalized anxiety disorder also frequently co-occur and share overlapping symptoms such as restlessness and poor concentration, which is why clinicians screen for both during evaluation rather than treating a screener result alone. |
| `answers/can-sleep-apnea-cause-fatigue.html` | Can sleep apnea cause fatigue? \| Siya Health | Quick FAQ: can sleep apnea cause fatigue? Full sleep apnea and metabolic risk guide linked. | Can sleep apnea cause fatigue? | Yes. Obstructive sleep apnea fragments sleep with repeated breathing reductions and intermittent hypoxia, so you may feel exhausted or unrefreshed even after adequate time in bed. |
| `answers/can-you-get-adhd-medication-online.html` | Can you get ADHD medication online? \| Siya Health | In eligible states, yes—after a legitimate telehealth evaluation and ongoing relationship with a licensed prescriber. Online does not mean automatic; contr… | Can you get ADHD medication online? | In eligible states, yes—after a legitimate telehealth evaluation and ongoing relationship with a licensed prescriber. Online does not mean automatic; controlled substances require identity verification, monitoring, and follow-up per federal and state rules. |
| `answers/compounded-vs-branded-glp-1.html` | What should you ask about compounded vs branded GLP-1? \| Siya Health | Quick FAQ: questions to ask your clinician about compounded vs branded GLP-1. Full regulatory guide linked. | What should you ask about compounded vs branded GLP-1? | You are looking at two products with the same kind of name and very different rules behind them. Ask a licensed prescriber which one is actually in front of you. |
| `answers/ed-telehealth-legitimate.html` | Is telehealth for erectile dysfunction legitimate? \| Siya Health | Yes when a licensed clinician takes history, reviews medications (especially nitrates), discusses cardiovascular risk, and prescribes appropriately via HIP… | Is telehealth for erectile dysfunction legitimate? | Yes when a licensed clinician takes history, reviews medications (especially nitrates), discusses cardiovascular risk, and prescribes appropriately via HIPAA-compliant platforms. Avoid anonymous pill mills with no follow-up. |
| `answers/executive-dysfunction-adhd.html` | What is executive dysfunction in adult ADHD? \| Siya Health | Quick FAQ: what executive dysfunction means in adult ADHD. Read the full pillar on task initiation, working memory, planning, and supports. | What is executive dysfunction in adult ADHD? | Executive dysfunction refers to difficulty with planning, prioritizing, initiating tasks, working memory, and flexible thinking. In ADHD these skills are inconsistent—not absent—which is why you might hyperfocus on interesting work yet cannot start boring paperwork. |
| `answers/food-noise-returned-on-glp-1.html` | Why did food noise come back on GLP-1? \| Siya Health | Quick FAQ: food noise returning on GLP-1 therapy. Full food noise cornerstone linked. | Why did food noise come back on GLP-1? | The quiet lasted, and then the food thoughts came back. That is a visit, not a character flaw. |
| `answers/fsa-hsa-adhd-evaluation.html` | Can you use FSA or HSA for ADHD evaluation? \| Siya Health | Many patients use FSA/HSA debit cards for qualified medical expenses including physician telehealth visits when documented as medical care. Confirm with yo… | Can you use FSA or HSA for ADHD evaluation? | Many patients use FSA/HSA debit cards for qualified medical expenses including physician telehealth visits when documented as medical care. Confirm with your plan administrator; Siya Health provides receipts for eligible services. |
| `answers/glp-1-nausea-management.html` | How do you manage GLP-1 nausea? \| Siya Health | Quick FAQ: practical GLP-1 nausea tips during titration. Full side-effect management guide linked. | How do you manage GLP-1 nausea? | Nausea in the first weeks is common. Pushing through vomiting is not the plan. |
| `answers/glp-1-side-effects.html` | Which GLP-1 side effects usually improve with titration? \| Siya Health | Quick FAQ on GLP-1 side effects that often ease with titration. Full management guide linked. | Which GLP-1 side effects usually improve with titration? | The first weeks on a GLP-1 are often a stomach problem, not a verdict on the medicine. Most gut effects ease over weeks with slow titration, smaller meals, and hydration. |
| `answers/high-functioning-adhd.html` | Can you have ADHD and still be high-functioning? \| Siya Health | Yes. Many adults with ADHD perform well outwardly while struggling privately with exhaustion, procrastination, and emotional overload. “High functioning” i… | Can you have ADHD and still be high-functioning? | Yes. Many adults with ADHD perform well outwardly while struggling privately with exhaustion, procrastination, and emotional overload. |
| `answers/high-shbg-low-free-testosterone.html` | What does high SHBG with low free testosterone mean? \| Siya Health | Quick FAQ on high SHBG and low free testosterone—not a full hormone lab guide. Cornerstone article linked. | What does high SHBG with low free testosterone mean? | Sex hormone-binding globulin (SHBG) binds testosterone tightly; when SHBG is high, the **free testosterone** fraction available to tissues may be low even if **total testosterone** appears normal or borderline. Causes include aging, hyperthyroidism, liver disease, low insulin states, certain medications, and calorie restriction. |
| `answers/how-long-adhd-evaluation.html` | How long does an ADHD evaluation take? \| Siya Health | A thorough adult ADHD evaluation typically takes 60–90 minutes of face-to-face clinician time, plus intake forms and any cognitive screening completed befo… | How long does an ADHD evaluation take? | A thorough adult ADHD evaluation typically takes 60–90 minutes of face-to-face clinician time, plus intake forms and any cognitive screening completed before or during the visit. Quick five-minute surveys are not equivalent to diagnosis. |
| `answers/how-much-does-adhd-testing-cost.html` | How much does ADHD testing cost? \| Siya Health | Costs vary widely: some clinics charge $500–$2,000+; Siya Health offers a transparent $149 comprehensive adult ADHD evaluation (60–90 minutes) including cl… | How much does ADHD testing cost? | Costs vary widely: some clinics charge $500–$2,000+; Siya Health offers a transparent $149 comprehensive adult ADHD evaluation (60–90 minutes) including clinical interview and standardized tools when clinically indicated. Always confirm what is included before booking. |
| `answers/insulin-resistance-without-diabetes.html` | Can you have insulin resistance without diabetes? \| Siya Health | Quick FAQ: insulin resistance before diabetes thresholds. Metabolic clinician guide linked. | Can you have insulin resistance without diabetes? | Yes. Blood sugar can look normal for years while insulin resistance is already there. |
| `answers/is-adhd-medication-safe-long-term.html` | What does long-term ADHD medication safety monitoring include? \| Siya Health | Quick FAQ on long-term ADHD medication monitoring—not a substitute for the full safety guide. Link to clinical article. | What does long-term ADHD medication safety monitoring include? | For many appropriately monitored adults, stimulant and non-stimulant ADHD medications have favorable benefit–risk profiles. Long-term care includes periodic blood pressure/pulse checks, sleep and mood review, and substance-use screening when indicated. |
| `answers/is-online-adhd-diagnosis-legitimate.html` | What should you look for in a legitimate online ADHD diagnosis? \| Siya Health | Quick FAQ: green flags, red flags, and what legitimate online ADHD telehealth includes. Read the full clinical guide for depth. | What should you look for in a legitimate online ADHD diagnosis? | Online ADHD diagnosis is legitimate when a licensed provider in your state conducts an adequate visit length, uses standardized assessments as indicated, reviews medical and psychiatric history, documents the encounter, and offers appropriate follow-up—not when an automated quiz instantly labels you and ships stimulants. Transparency about pricing, licensure, and limitations (emergencies, in-person needs) is part of ethical telehealth. |
| `answers/late-adhd-diagnosis-adults.html` | Why are so many adults diagnosed with ADHD late in life? \| Siya Health | Childhood ADHD was often missed—especially in girls, high achievers, and inattentive types without hyperactivity. Adults seek answers after burnout, job ch… | Why are so many adults diagnosed with ADHD late in life? | Childhood ADHD was often missed—especially in girls, high achievers, and inattentive types without hyperactivity. Adults seek answers after burnout, job changes, or parenting when old coping strategies stop working. |
| `answers/normal-a1c-insulin-resistance.html` | Can you have insulin resistance with a normal A1C? \| Siya Health | Quick FAQ: normal A1C with insulin resistance symptoms. Full metabolic guide linked. | Can you have insulin resistance with a normal A1C? | Yes. A normal A1C does not mean your metabolism is fine. |
| `answers/oral-vs-topical-minoxidil.html` | When is topical minoxidil enough vs oral minoxidil? \| Siya Health | Quick FAQ on topical vs oral minoxidil selection—not a full route comparison. Clinical guide linked. | When is topical minoxidil enough vs oral minoxidil? | Topical minoxidil is first-line for many patients due to localized action and established OTC/Rx formulations. Low-dose oral minoxidil may be considered off-label when topical fails or is impractical, with systemic blood pressure and heart rate monitoring. |
| `answers/poor-sleep-feels-like-adhd.html` | Can poor sleep feel like ADHD? \| Siya Health | Poor sleep, sleep apnea, and sleep deprivation can mimic ADHD—brain fog, poor focus, and impulsivity. Learn how to tell sleep problems from ADHD and when t… | Can poor sleep feel like ADHD? | Yes. Chronic poor sleep—especially fragmented sleep from insomnia or obstructive sleep apnea—commonly mimics ADHD: brain fog, irritability, forgetfulness, restless inner tension, and “why can’t I focus anymore” even when you are trying. |
| `answers/rejection-sensitivity-adhd.html` | What is rejection sensitive dysphoria (RSD) and ADHD? \| Siya Health | RSD describes intense emotional pain after perceived criticism or rejection. It is not an official DSM diagnosis but is frequently reported in ADHD. Clinic… | What is rejection sensitive dysphoria (RSD) and ADHD? | RSD describes intense emotional pain after perceived criticism or rejection. It is not an official DSM diagnosis but is frequently reported in ADHD. |
| `answers/screening-vs-adhd-evaluation.html` | What is the difference between ADHD screening and a full evaluation? \| Siya Health | Screening (e.g., ASRS, short online quizzes) estimates likelihood and takes minutes. A full evaluation is a 60–90 minute clinician visit with history, stan… | What is the difference between ADHD screening and a full evaluation? | Screening (e.g., ASRS, short online quizzes) estimates likelihood and takes minutes. A full evaluation is a 60–90 minute clinician visit with history, standardized tools, safety screening, and a written plan—required for formal diagnosis. |
| `answers/semaglutide-weight-loss-how-it-works.html` | How quickly does semaglutide start working for weight loss? \| Siya Health | Quick FAQ on semaglutide onset and early appetite changes—not a full mechanism guide. Read the clinical article. | How quickly does semaglutide start working for weight loss? | The dose went in and the scale has not agreed to a timeline. Semaglutide is a GLP-1 medicine. |
| `answers/signs-of-adult-adhd.html` | What are the signs of adult ADHD? \| Siya Health | Signs of adult ADHD: inattention, time blindness, emotional sensitivity, and when to seek a structured evaluation—not just an online quiz. | What are the signs of adult ADHD? | Adult ADHD often shows up as chronic difficulty sustaining focus, disorganization, forgetfulness, time blindness, trouble finishing tasks, inner restlessness, and emotional sensitivity—not only childhood-style hyperactivity. Symptoms must cause real impairment in work, relationships, or daily life and usually reflect lifelong patterns, though many adults were never diagnosed. |
| `answers/signs-of-sleep-apnea-in-adults.html` | What are the signs of sleep apnea in adults? \| Siya Health | Quick adult sleep apnea symptom checklist—not a full risk overview. Clinical guide linked. | What are the signs of sleep apnea in adults? | Clues include habitual snoring, witnessed breathing pauses or gasping, unrefreshing sleep, daytime sleepiness or fatigue, morning headaches, nocturia, resistant hypertension, mood changes, reduced libido, erectile dysfunction, and concentration problems. Not everyone snores loudly—especially women. |
| `answers/starting-adhd-medication-adults.html` | What should adults expect when starting ADHD medication? \| Siya Health | Starting ADHD medication as an adult: titration, follow-up, vitals, and realistic expectations. Educational guide—not personal prescribing advice. | What should adults expect when starting ADHD medication? | Adults starting ADHD medication should expect a structured titration plan, baseline vitals when indicated, clear follow-up dates, and honest goal-setting (work performance, driving safety, sleep, relationships). Improvement is tracked with rating scales and visit notes—not social media timelines. |
| `answers/telehealth-adhd-california.html` | How does ADHD telehealth work in California? \| Siya Health | Quick FAQ on ADHD telehealth logistics in California. State-specific service article linked. | How does ADHD telehealth work in California? | California residents may receive adult ADHD evaluation and follow-up via telehealth when treated by a clinician licensed in California, using secure video, validated tools, and documented visits. Siya Health Medical Director Dr. |
| `answers/telehealth-adhd-texas.html` | How does ADHD telehealth work in Texas? \| Siya Health | Texas adults can complete structured ADHD telehealth evaluations with Texas-licensed clinicians, including history, standardized assessments, and follow-up… | How does ADHD telehealth work in Texas? | Texas adults can complete structured ADHD telehealth evaluations with Texas-licensed clinicians, including history, standardized assessments, and follow-up when indicated. Controlled medication rules apply with monitoring and PDMP review. |
| `answers/testosterone-and-adhd-overlap.html` | Can low testosterone mimic ADHD? \| Siya Health | Low testosterone and ADHD can both cause fatigue, low motivation, and concentration problems. Labs and developmental history help separate them; some men h… | Can low testosterone mimic ADHD? | Low testosterone and ADHD can both cause fatigue, low motivation, and concentration problems. Labs and developmental history help separate them; some men have both. |
| `answers/time-blindness-adhd.html` | What is time blindness in ADHD? \| Siya Health | Time blindness describes difficulty sensing how long tasks take, losing track of time, or chronically underestimating deadlines. It is a common executive-f… | What is time blindness in ADHD? | Time blindness describes difficulty sensing how long tasks take, losing track of time, or chronically underestimating deadlines. It is a common executive-function struggle in ADHD—not a character flaw—and responds to structure, reminders, and sometimes medication. |
| `answers/what-does-low-testosterone-feel-like.html` | What does low testosterone feel like? \| Siya Health | Quick FAQ on low testosterone symptoms—not a lab guide. Full free vs total testosterone article linked. | What does low testosterone feel like? | Possible symptoms include low energy, reduced libido, depressed mood, decreased muscle mass, increased body fat, poor sleep, and difficulty concentrating—though these are nonspecific and overlap with sleep apnea, depression, thyroid disease, and ADHD. Diagnosis requires symptoms plus confirmatory morning labs. |
| `answers/what-happens-after-adhd-evaluation.html` | What happens after an ADHD evaluation? \| Siya Health | After a structured ADHD evaluation, your clinician explains findings in plain language and outlines a care plan. That may include education only, lifestyle… | What happens after an ADHD evaluation? | After a structured ADHD evaluation, your clinician explains findings in plain language and outlines a care plan. That may include education only, lifestyle supports, therapy referral, labs when indicated, non-stimulant or stimulant options when appropriate—or a recommendation that ADHD is not the best fit for your symptoms. |
| `answers/what-included-199-adhd-evaluation.html` | What is included in a Siya Health ADHD evaluation? \| Siya Health | Siya Health’s $149 adult ADHD evaluation is a 60–90 minute telehealth visit with a licensed medical provider—including clinical in… | What is included in a Siya Health ADHD evaluation? | Siya Health’s $149 adult ADHD evaluation is a 60–90 minute telehealth visit with a licensed medical provider—including clinical interview, validated assessment tools as clinically appropriate (such as ASRS, DIVA, Wender Utah, SWAN, or Creyos when indicated), comorbidity screening, and a documented plan. No insurance required. |
| `answers/what-is-free-testosterone.html` | What is free testosterone? \| Siya Health | Quick definition of free testosterone—not lab interpretation depth. Full free vs total guide linked. | What is free testosterone? | Free testosterone is the small fraction of testosterone in blood that is not tightly bound—chiefly to sex hormone-binding globulin (SHBG)—and is biologically active at tissues. Total testosterone includes bound plus free fractions; you can have “normal” total testosterone with low free testosterone when SHBG is elevated (thyroid disease, liver conditions, aging, some medications). |
| `answers/what-is-insulin-resistance.html` | What is insulin resistance? \| Siya Health | Quick definition of insulin resistance for patients—not a clinician weight-loss overview. Full guide linked. | What is insulin resistance? | You are tired after meals and the lab still says you do not have diabetes. Insulin resistance can look exactly like that. |
| `answers/when-is-testosterone-therapy-appropriate.html` | What symptoms warrant testosterone therapy evaluation? \| Siya Health | Quick FAQ on symptoms that prompt TRT evaluation—not a full candidacy guide. Clinical article linked. | What symptoms warrant testosterone therapy evaluation? | Testosterone replacement therapy (TRT) may be appropriate for men with consistent symptoms of androgen deficiency and repeatedly low morning testosterone on proper assays—after evaluating reversible causes (sleep apnea, obesity, medications, thyroid disease, depression) and when benefits outweigh risks such as erythrocytosis, fertility suppression, and need for monitoring. TRT is not a universal anti-aging or performance strategy; guideline-based care requires ongoing labs and symptom review. |
| `answers/who-qualifies-glp-1-weight-loss.html` | Who qualifies for GLP-1 weight loss medications? \| Siya Health | Quick FAQ on GLP-1 weight-loss eligibility criteria. Texas medical weight-loss overview linked. | Who qualifies for GLP-1 weight loss medications? | A BMI chart on the internet is not an approval. A licensed clinician is the one who decides whether a GLP-1 fits. |

---

## 3. Proposed framing paragraphs

Corrected before any review handoff.

- `answers/ed-telehealth-legitimate.html` no longer uses the ADHD paragraph. The new paragraph is about whether erectile-dysfunction telehealth fits a workday.
- `answers/food-noise-returned-on-glp-1.html` no longer has a period after the question mark inside or after the quote. Same rule applied to every title that already ends with `?`.
- A paragraph names ADHD only when the article title or filename is about ADHD, Adderall, Vyvanse, a stimulant, or ASRS. `blog/brain-fog-and-anxiety.html` and `blog/weight-loss.html` were in the ADHD template and are no longer.

Each diff is the only change: one paragraph immediately after `</h1>`. Clinical copy is untouched. These batches are not live. Batches 1–4 hold most of the medication, dosing, and prescribing pages and should go to Sneha first.

### Batch 1 — 12 articles

`blog/adderall-for-adhd-how-it-works.html` through `blog/adhd-medication-options-for-adults.html`

#### `blog/adderall-for-adhd-how-it-works.html`

```diff
--- a/apps/siya-health/blog/adderall-for-adhd-how-it-works.html
+++ b/apps/siya-health/blog/adderall-for-adhd-how-it-works.html
@@ after <h1>, before the existing intro @@
  <h1>Adderall for ADHD: How It Works (2026 Clinical Overview)</h1>
+ <p class="article-frame">“Adderall for ADHD: How It Works (2026 Clinical Overview)” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `blog/adhd-accommodations-hr-primer.html`

```diff
--- a/apps/siya-health/blog/adhd-accommodations-hr-primer.html
+++ b/apps/siya-health/blog/adhd-accommodations-hr-primer.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Accommodations at Work: An HR Primer</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “ADHD Accommodations at Work: An HR Primer” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/adhd-and-binge-eating.html`

```diff
--- a/apps/siya-health/blog/adhd-and-binge-eating.html
+++ b/apps/siya-health/blog/adhd-and-binge-eating.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD and Binge Eating: Why the Link Matters (and What Actually Helps)</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “ADHD and Binge Eating: Why the Link Matters (and What Actually Helps)” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/adhd-brain-imaging-subtypes.html`

```diff
--- a/apps/siya-health/blog/adhd-brain-imaging-subtypes.html
+++ b/apps/siya-health/blog/adhd-brain-imaging-subtypes.html
@@ after <h1>, before the existing intro @@
  <h1>Not All ADHD Is the Same: What New Brain Imaging Research May Mean for the Future of ADHD Care</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Not All ADHD Is the Same: What New Brain Imaging Research May Mean for the Future of ADHD Care” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/adhd-evaluation-california-online-vs-in-person.html`

```diff
--- a/apps/siya-health/blog/adhd-evaluation-california-online-vs-in-person.html
+++ b/apps/siya-health/blog/adhd-evaluation-california-online-vs-in-person.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Evaluation in California: Online vs In-Person Options</h1>
+ <p class="article-frame">People look up “ADHD Evaluation in California: Online vs In-Person Options” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `blog/adhd-evaluation-cost-texas.html`

```diff
--- a/apps/siya-health/blog/adhd-evaluation-cost-texas.html
+++ b/apps/siya-health/blog/adhd-evaluation-cost-texas.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Evaluation Cost in Texas: Full Breakdown (2026 Guide)</h1>
+ <p class="article-frame">A search like “ADHD Evaluation Cost in Texas: Full Breakdown (2026 Guide)” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/adhd-hormones-women.html`

```diff
--- a/apps/siya-health/blog/adhd-hormones-women.html
+++ b/apps/siya-health/blog/adhd-hormones-women.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD and Hormones in Women: Cycle, Perimenopause, and Why Symptoms Shift</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “ADHD and Hormones in Women: Cycle, Perimenopause, and Why Symptoms Shift” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/adhd-in-women.html`

```diff
--- a/apps/siya-health/blog/adhd-in-women.html
+++ b/apps/siya-health/blog/adhd-in-women.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD in Women: Symptoms, Masking, Hormones, and Late Diagnosis</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “ADHD in Women: Symptoms, Masking, Hormones, and Late Diagnosis” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/adhd-medication-daily-or-as-needed-adults.html`

```diff
--- a/apps/siya-health/blog/adhd-medication-daily-or-as-needed-adults.html
+++ b/apps/siya-health/blog/adhd-medication-daily-or-as-needed-adults.html
@@ after <h1>, before the existing intro @@
  <h1>Do Adults Need ADHD Medication Every Day?</h1>
+ <p class="article-frame">“Do Adults Need ADHD Medication Every Day?” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `blog/adhd-medication-online-california.html`

```diff
--- a/apps/siya-health/blog/adhd-medication-online-california.html
+++ b/apps/siya-health/blog/adhd-medication-online-california.html
@@ after <h1>, before the existing intro @@
  <h1>Can You Get ADHD Medication Online in California? What Patients Should Know</h1>
+ <p class="article-frame">A search like “Can You Get ADHD Medication Online in California? What Patients Should Know” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/adhd-medication-options-california.html`

```diff
--- a/apps/siya-health/blog/adhd-medication-options-california.html
+++ b/apps/siya-health/blog/adhd-medication-options-california.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Medication Options in California: What Exists (and What Is Decided Clinically)</h1>
+ <p class="article-frame">A search like “ADHD Medication Options in California: What Exists (and What Is Decided Clinically)” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/adhd-medication-options-for-adults.html`

```diff
--- a/apps/siya-health/blog/adhd-medication-options-for-adults.html
+++ b/apps/siya-health/blog/adhd-medication-options-for-adults.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Medication Options for Adults: Where to Start</h1>
+ <p class="article-frame">“ADHD Medication Options for Adults: Where to Start” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

### Batch 2 — 12 articles

`blog/adhd-medication-side-effects-what-to-expect.html` through `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html`

#### `blog/adhd-medication-side-effects-what-to-expect.html`

```diff
--- a/apps/siya-health/blog/adhd-medication-side-effects-what-to-expect.html
+++ b/apps/siya-health/blog/adhd-medication-side-effects-what-to-expect.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Medication Side Effects: What to Expect (2026)</h1>
+ <p class="article-frame">“ADHD Medication Side Effects: What to Expect (2026)” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `blog/adhd-symptoms-overlooked.html`

```diff
--- a/apps/siya-health/blog/adhd-symptoms-overlooked.html
+++ b/apps/siya-health/blog/adhd-symptoms-overlooked.html
@@ after <h1>, before the existing intro @@
  <h1>7 Adult ADHD Signs Doctors Often Miss</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “7 Adult ADHD Signs Doctors Often Miss” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/adhd-telehealth-california.html`

```diff
--- a/apps/siya-health/blog/adhd-telehealth-california.html
+++ b/apps/siya-health/blog/adhd-telehealth-california.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Telehealth in California: How Virtual Care Works</h1>
+ <p class="article-frame">A search like “ADHD Telehealth in California: How Virtual Care Works” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/adhd-testing-online-california-screening-vs-evaluation.html`

```diff
--- a/apps/siya-health/blog/adhd-testing-online-california-screening-vs-evaluation.html
+++ b/apps/siya-health/blog/adhd-testing-online-california-screening-vs-evaluation.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Testing Online in California: Screening vs Full Evaluation</h1>
+ <p class="article-frame">People look up “ADHD Testing Online in California: Screening vs Full Evaluation” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `blog/adhd-treatment-texas.html`

```diff
--- a/apps/siya-health/blog/adhd-treatment-texas.html
+++ b/apps/siya-health/blog/adhd-treatment-texas.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD Treatment in Texas: Physician-Led Virtual Care for Adults</h1>
+ <p class="article-frame">A search like “ADHD Treatment in Texas: Physician-Led Virtual Care for Adults” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/adhd.html`

```diff
--- a/apps/siya-health/blog/adhd.html
+++ b/apps/siya-health/blog/adhd.html
@@ after <h1>, before the existing intro @@
  <h1>ADHD articles</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “ADHD articles” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/adult-adhd-symptoms-california.html`

```diff
--- a/apps/siya-health/blog/adult-adhd-symptoms-california.html
+++ b/apps/siya-health/blog/adult-adhd-symptoms-california.html
@@ after <h1>, before the existing intro @@
  <h1>Adult ADHD Symptoms in California: Patterns Worth Taking Seriously</h1>
+ <p class="article-frame">A search like “Adult ADHD Symptoms in California: Patterns Worth Taking Seriously” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/brain-fog-and-anxiety.html`

```diff
--- a/apps/siya-health/blog/brain-fog-and-anxiety.html
+++ b/apps/siya-health/blog/brain-fog-and-anxiety.html
@@ after <h1>, before the existing intro @@
  <h1>Brain Fog and Anxiety: When Worry Crowds Out Clarity</h1>
+ <p class="article-frame">Worry that crowds out a workday is a common reason someone looks up “Brain Fog and Anxiety: When Worry Crowds Out Clarity”. The explanation below is unchanged. It does not assume you have an anxiety disorder or any other diagnosis.</p>
```

#### `blog/brain-fog-vs-adhd.html`

```diff
--- a/apps/siya-health/blog/brain-fog-vs-adhd.html
+++ b/apps/siya-health/blog/brain-fog-vs-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>Brain Fog vs ADHD: How to Tell the Difference</h1>
+ <p class="article-frame">People look up “Brain Fog vs ADHD: How to Tell the Difference” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `blog/compounded-vs-branded-glp1-medications.html`

```diff
--- a/apps/siya-health/blog/compounded-vs-branded-glp1-medications.html
+++ b/apps/siya-health/blog/compounded-vs-branded-glp1-medications.html
@@ after <h1>, before the existing intro @@
  <h1>Compounded vs Branded GLP-1 Medications: What Patients Should Know (2026)</h1>
+ <p class="article-frame">People look up “Compounded vs Branded GLP-1 Medications: What Patients Should Know (2026)” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `blog/executive-dysfunction-adhd.html`

```diff
--- a/apps/siya-health/blog/executive-dysfunction-adhd.html
+++ b/apps/siya-health/blog/executive-dysfunction-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>Executive Dysfunction in ADHD: What It Is and How It Shows Up in Adults</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Executive Dysfunction in ADHD: What It Is and How It Shows Up in Adults” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html`

```diff
--- a/apps/siya-health/blog/food-noise-and-glp-1-what-it-means-and-what-helps.html
+++ b/apps/siya-health/blog/food-noise-and-glp-1-what-it-means-and-what-helps.html
@@ after <h1>, before the existing intro @@
  <h1>Food Noise and GLP-1: What It Means and What Actually Helps (2026)</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “Food Noise and GLP-1: What It Means and What Actually Helps (2026)”. The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

### Batch 3 — 12 articles

`blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` through `blog/non-stimulant-adhd-medications-explained.html`

#### `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html`

```diff
--- a/apps/siya-health/blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html
+++ b/apps/siya-health/blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html
@@ after <h1>, before the existing intro @@
  <h1>Free Testosterone vs Total Testosterone: What Patients Should Know</h1>
+ <p class="article-frame">People look up “Free Testosterone vs Total Testosterone: What Patients Should Know” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `blog/glp1-side-effects-and-how-to-manage-them.html`

```diff
--- a/apps/siya-health/blog/glp1-side-effects-and-how-to-manage-them.html
+++ b/apps/siya-health/blog/glp1-side-effects-and-how-to-manage-them.html
@@ after <h1>, before the existing intro @@
  <h1>GLP-1 Side Effects and How to Manage Them (2026)</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “GLP-1 Side Effects and How to Manage Them (2026)”. The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `blog/how-adhd-medication-is-prescribed-online.html`

```diff
--- a/apps/siya-health/blog/how-adhd-medication-is-prescribed-online.html
+++ b/apps/siya-health/blog/how-adhd-medication-is-prescribed-online.html
@@ after <h1>, before the existing intro @@
  <h1>How ADHD Medication Is Prescribed Online (2026)</h1>
+ <p class="article-frame">“How ADHD Medication Is Prescribed Online (2026)” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `blog/how-to-choose-adhd-provider-california.html`

```diff
--- a/apps/siya-health/blog/how-to-choose-adhd-provider-california.html
+++ b/apps/siya-health/blog/how-to-choose-adhd-provider-california.html
@@ after <h1>, before the existing intro @@
  <h1>How to Choose an ADHD Provider in California</h1>
+ <p class="article-frame">A search like “How to Choose an ADHD Provider in California” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/how-to-know-if-you-have-adhd-adult.html`

```diff
--- a/apps/siya-health/blog/how-to-know-if-you-have-adhd-adult.html
+++ b/apps/siya-health/blog/how-to-know-if-you-have-adhd-adult.html
@@ after <h1>, before the existing intro @@
  <h1>How to Know If You Have ADHD as an Adult (Real Signs Explained)</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “How to Know If You Have ADHD as an Adult (Real Signs Explained)” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/insulin-resistance-and-weight-loss-clinician-overview.html`

```diff
--- a/apps/siya-health/blog/insulin-resistance-and-weight-loss-clinician-overview.html
+++ b/apps/siya-health/blog/insulin-resistance-and-weight-loss-clinician-overview.html
@@ after <h1>, before the existing intro @@
  <h1>Insulin Resistance and Weight Loss: A Clinician-Guided Overview</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “Insulin Resistance and Weight Loss: A Clinician-Guided Overview” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `blog/iron-deficiency-brain-fog-adhd.html`

```diff
--- a/apps/siya-health/blog/iron-deficiency-brain-fog-adhd.html
+++ b/apps/siya-health/blog/iron-deficiency-brain-fog-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>Iron Deficiency, Brain Fog, and ADHD: Could Low Iron Make ADHD Symptoms Worse?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Iron Deficiency, Brain Fog, and ADHD: Could Low Iron Make ADHD Symptoms Worse?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/is-adhd-medication-safe-long-term.html`

```diff
--- a/apps/siya-health/blog/is-adhd-medication-safe-long-term.html
+++ b/apps/siya-health/blog/is-adhd-medication-safe-long-term.html
@@ after <h1>, before the existing intro @@
  <h1>Is ADHD Medication Safe Long Term? Benefits & Monitoring (2026)</h1>
+ <p class="article-frame">“Is ADHD Medication Safe Long Term? Benefits & Monitoring (2026)” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `blog/is-online-adhd-diagnosis-legit.html`

```diff
--- a/apps/siya-health/blog/is-online-adhd-diagnosis-legit.html
+++ b/apps/siya-health/blog/is-online-adhd-diagnosis-legit.html
@@ after <h1>, before the existing intro @@
  <h1>Is Online ADHD Diagnosis Legit? What Patients Should Know</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Is Online ADHD Diagnosis Legit? What Patients Should Know” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/medical-weight-loss-glp1-semaglutide-texas.html`

```diff
--- a/apps/siya-health/blog/medical-weight-loss-glp1-semaglutide-texas.html
+++ b/apps/siya-health/blog/medical-weight-loss-glp1-semaglutide-texas.html
@@ after <h1>, before the existing intro @@
  <h1>Medical Weight Loss in Texas: GLP-1, Semaglutide, Tirzepatide & What Actually Works</h1>
+ <p class="article-frame">A search like “Medical Weight Loss in Texas: GLP-1, Semaglutide, Tirzepatide & What Actually Works” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/minoxidil-for-hair-loss-does-it-work.html`

```diff
--- a/apps/siya-health/blog/minoxidil-for-hair-loss-does-it-work.html
+++ b/apps/siya-health/blog/minoxidil-for-hair-loss-does-it-work.html
@@ after <h1>, before the existing intro @@
  <h1>Minoxidil for Hair Loss: Does It Work? (2026)</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “Minoxidil for Hair Loss: Does It Work? (2026)”. The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `blog/non-stimulant-adhd-medications-explained.html`

```diff
--- a/apps/siya-health/blog/non-stimulant-adhd-medications-explained.html
+++ b/apps/siya-health/blog/non-stimulant-adhd-medications-explained.html
@@ after <h1>, before the existing intro @@
  <h1>When Do Adults Use Non-Stimulant ADHD Medications?</h1>
+ <p class="article-frame">“When Do Adults Use Non-Stimulant ADHD Medications?” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

### Batch 4 — 12 articles

`blog/online-adhd-diagnosis-california.html` through `blog/vyvanse-vs-adderall-differences.html`

#### `blog/online-adhd-diagnosis-california.html`

```diff
--- a/apps/siya-health/blog/online-adhd-diagnosis-california.html
+++ b/apps/siya-health/blog/online-adhd-diagnosis-california.html
@@ after <h1>, before the existing intro @@
  <h1>Online ADHD Diagnosis in California: Cost, Process & What to Expect</h1>
+ <p class="article-frame">A search like “Online ADHD Diagnosis in California: Cost, Process & What to Expect” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/online-adhd-diagnosis-texas.html`

```diff
--- a/apps/siya-health/blog/online-adhd-diagnosis-texas.html
+++ b/apps/siya-health/blog/online-adhd-diagnosis-texas.html
@@ after <h1>, before the existing intro @@
  <h1>Online ADHD Diagnosis in Texas: Cost, Process & What to Expect</h1>
+ <p class="article-frame">A search like “Online ADHD Diagnosis in Texas: Cost, Process & What to Expect” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `blog/oral-vs-injectable-weight-loss-medications.html`

```diff
--- a/apps/siya-health/blog/oral-vs-injectable-weight-loss-medications.html
+++ b/apps/siya-health/blog/oral-vs-injectable-weight-loss-medications.html
@@ after <h1>, before the existing intro @@
  <h1>Oral vs Injectable Weight Loss Medications: What to Know (2026)</h1>
+ <p class="article-frame">People look up “Oral vs Injectable Weight Loss Medications: What to Know (2026)” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `blog/oral-vs-topical-minoxidil-which-is-right.html`

```diff
--- a/apps/siya-health/blog/oral-vs-topical-minoxidil-which-is-right.html
+++ b/apps/siya-health/blog/oral-vs-topical-minoxidil-which-is-right.html
@@ after <h1>, before the existing intro @@
  <h1>Oral vs Topical Minoxidil: Which Is Right? (2026)</h1>
+ <p class="article-frame">People look up “Oral vs Topical Minoxidil: Which Is Right? (2026)” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `blog/phentermine-for-weight-loss-safety-and-effectiveness.html`

```diff
--- a/apps/siya-health/blog/phentermine-for-weight-loss-safety-and-effectiveness.html
+++ b/apps/siya-health/blog/phentermine-for-weight-loss-safety-and-effectiveness.html
@@ after <h1>, before the existing intro @@
  <h1>Phentermine for Weight Loss: Safety and Effectiveness (2026)</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “Phentermine for Weight Loss: Safety and Effectiveness (2026)”. The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `blog/pots-and-adhd.html`

```diff
--- a/apps/siya-health/blog/pots-and-adhd.html
+++ b/apps/siya-health/blog/pots-and-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>POTS and ADHD: Why Researchers Are Exploring the Connection</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “POTS and ADHD: Why Researchers Are Exploring the Connection” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `blog/semaglutide-for-weight-loss-how-it-works.html`

```diff
--- a/apps/siya-health/blog/semaglutide-for-weight-loss-how-it-works.html
+++ b/apps/siya-health/blog/semaglutide-for-weight-loss-how-it-works.html
@@ after <h1>, before the existing intro @@
  <h1>Semaglutide for Weight Loss: How It Works (2026 Clinical Overview)</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “Semaglutide for Weight Loss: How It Works (2026 Clinical Overview)”. The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html`

```diff
--- a/apps/siya-health/blog/sildenafil-for-erectile-dysfunction-what-to-expect.html
+++ b/apps/siya-health/blog/sildenafil-for-erectile-dysfunction-what-to-expect.html
@@ after <h1>, before the existing intro @@
  <h1>Sildenafil for Erectile Dysfunction: What to Expect (2026)</h1>
+ <p class="article-frame">A question like “Sildenafil for Erectile Dysfunction: What to Expect (2026)” usually comes up when someone wants care without clearing a whole workday for a clinic visit. This page is about whether erectile-dysfunction care can be done properly by telehealth, and the clinical explanation below is unchanged. It does not assume you have that condition, or that a prescription is the right next step.</p>
```

#### `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html`

```diff
--- a/apps/siya-health/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html
+++ b/apps/siya-health/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html
@@ after <h1>, before the existing intro @@
  <h1>Sleep Apnea, Fatigue, and Metabolic Risk: When Snoring Is Not Benign</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “Sleep Apnea, Fatigue, and Metabolic Risk: When Snoring Is Not Benign” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `blog/thyroid-and-fatigue.html`

```diff
--- a/apps/siya-health/blog/thyroid-and-fatigue.html
+++ b/apps/siya-health/blog/thyroid-and-fatigue.html
@@ after <h1>, before the existing intro @@
  <h1>Thyroid Problems and Fatigue</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “Thyroid Problems and Fatigue” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `blog/tirzepatide-vs-semaglutide-which-is-better.html`

```diff
--- a/apps/siya-health/blog/tirzepatide-vs-semaglutide-which-is-better.html
+++ b/apps/siya-health/blog/tirzepatide-vs-semaglutide-which-is-better.html
@@ after <h1>, before the existing intro @@
  <h1>Tirzepatide vs Semaglutide: Which Is Better for Weight Loss? (2026)</h1>
+ <p class="article-frame">People look up “Tirzepatide vs Semaglutide: Which Is Better for Weight Loss? (2026)” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `blog/vyvanse-vs-adderall-differences.html`

```diff
--- a/apps/siya-health/blog/vyvanse-vs-adderall-differences.html
+++ b/apps/siya-health/blog/vyvanse-vs-adderall-differences.html
@@ after <h1>, before the existing intro @@
  <h1>Vyvanse vs Adderall: Which Lasts Longer for Adults?</h1>
+ <p class="article-frame">People look up “Vyvanse vs Adderall: Which Lasts Longer for Adults?” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

### Batch 5 — 12 articles

`blog/weight-loss.html` through `answers/asrs-adhd-screening-explained.html`

#### `blog/weight-loss.html`

```diff
--- a/apps/siya-health/blog/weight-loss.html
+++ b/apps/siya-health/blog/weight-loss.html
@@ after <h1>, before the existing intro @@
  <h1>Weight loss articles</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “Weight loss articles” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `blog/when-is-testosterone-therapy-appropriate.html`

```diff
--- a/apps/siya-health/blog/when-is-testosterone-therapy-appropriate.html
+++ b/apps/siya-health/blog/when-is-testosterone-therapy-appropriate.html
@@ after <h1>, before the existing intro @@
  <h1>When Is Testosterone Therapy Appropriate? (2026)</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “When Is Testosterone Therapy Appropriate? (2026)”. The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html`

```diff
--- a/apps/siya-health/blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html
+++ b/apps/siya-health/blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>You’re Not Lazy: Signs You May Have Undiagnosed Adult ADHD</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “You’re Not Lazy: Signs You May Have Undiagnosed Adult ADHD” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/adderall-vs-vyvanse-adults.html`

```diff
--- a/apps/siya-health/answers/adderall-vs-vyvanse-adults.html
+++ b/apps/siya-health/answers/adderall-vs-vyvanse-adults.html
@@ after <h1>, before the existing intro @@
  <h1>When might Vyvanse be preferred over Adderall for adults?</h1>
+ <p class="article-frame">“When might Vyvanse be preferred over Adderall for adults?” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `answers/adhd-and-weight-loss-connection.html`

```diff
--- a/apps/siya-health/answers/adhd-and-weight-loss-connection.html
+++ b/apps/siya-health/answers/adhd-and-weight-loss-connection.html
@@ after <h1>, before the existing intro @@
  <h1>Is there a connection between ADHD and weight loss struggles?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Is there a connection between ADHD and weight loss struggles?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/adhd-in-women.html`

```diff
--- a/apps/siya-health/answers/adhd-in-women.html
+++ b/apps/siya-health/answers/adhd-in-women.html
@@ after <h1>, before the existing intro @@
  <h1>How does ADHD present differently in women?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “How does ADHD present differently in women?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/adhd-medication-every-day.html`

```diff
--- a/apps/siya-health/answers/adhd-medication-every-day.html
+++ b/apps/siya-health/answers/adhd-medication-every-day.html
@@ after <h1>, before the existing intro @@
  <h1>Do you have to take ADHD medication every day?</h1>
+ <p class="article-frame">“Do you have to take ADHD medication every day?” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `answers/adhd-medication-side-effects.html`

```diff
--- a/apps/siya-health/answers/adhd-medication-side-effects.html
+++ b/apps/siya-health/answers/adhd-medication-side-effects.html
@@ after <h1>, before the existing intro @@
  <h1>What ADHD medication side effects are most common in the first weeks?</h1>
+ <p class="article-frame">“What ADHD medication side effects are most common in the first weeks?” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `answers/adhd-vs-anxiety.html`

```diff
--- a/apps/siya-health/answers/adhd-vs-anxiety.html
+++ b/apps/siya-health/answers/adhd-vs-anxiety.html
@@ after <h1>, before the existing intro @@
  <h1>How do you tell ADHD apart from anxiety?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “How do you tell ADHD apart from anxiety?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/adhd-vs-burnout.html`

```diff
--- a/apps/siya-health/answers/adhd-vs-burnout.html
+++ b/apps/siya-health/answers/adhd-vs-burnout.html
@@ after <h1>, before the existing intro @@
  <h1>Is it ADHD or burnout?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Is it ADHD or burnout?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/adhd-workplace-accommodations.html`

```diff
--- a/apps/siya-health/answers/adhd-workplace-accommodations.html
+++ b/apps/siya-health/answers/adhd-workplace-accommodations.html
@@ after <h1>, before the existing intro @@
  <h1>Can ADHD support workplace accommodations?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Can ADHD support workplace accommodations?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/asrs-adhd-screening-explained.html`

```diff
--- a/apps/siya-health/answers/asrs-adhd-screening-explained.html
+++ b/apps/siya-health/answers/asrs-adhd-screening-explained.html
@@ after <h1>, before the existing intro @@
  <h1>What is the ASRS ADHD screening test?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What is the ASRS ADHD screening test?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

### Batch 6 — 12 articles

`answers/can-adhd-be-diagnosed-online.html` through `answers/high-functioning-adhd.html`

#### `answers/can-adhd-be-diagnosed-online.html`

```diff
--- a/apps/siya-health/answers/can-adhd-be-diagnosed-online.html
+++ b/apps/siya-health/answers/can-adhd-be-diagnosed-online.html
@@ after <h1>, before the existing intro @@
  <h1>Can ADHD be diagnosed online?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Can ADHD be diagnosed online?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/can-adhd-cause-anxiety.html`

```diff
--- a/apps/siya-health/answers/can-adhd-cause-anxiety.html
+++ b/apps/siya-health/answers/can-adhd-cause-anxiety.html
@@ after <h1>, before the existing intro @@
  <h1>Can ADHD cause anxiety?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Can ADHD cause anxiety?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/can-sleep-apnea-cause-fatigue.html`

```diff
--- a/apps/siya-health/answers/can-sleep-apnea-cause-fatigue.html
+++ b/apps/siya-health/answers/can-sleep-apnea-cause-fatigue.html
@@ after <h1>, before the existing intro @@
  <h1>Can sleep apnea cause fatigue?</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “Can sleep apnea cause fatigue?” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `answers/can-you-get-adhd-medication-online.html`

```diff
--- a/apps/siya-health/answers/can-you-get-adhd-medication-online.html
+++ b/apps/siya-health/answers/can-you-get-adhd-medication-online.html
@@ after <h1>, before the existing intro @@
  <h1>Can you get ADHD medication online?</h1>
+ <p class="article-frame">“Can you get ADHD medication online?” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `answers/compounded-vs-branded-glp-1.html`

```diff
--- a/apps/siya-health/answers/compounded-vs-branded-glp-1.html
+++ b/apps/siya-health/answers/compounded-vs-branded-glp-1.html
@@ after <h1>, before the existing intro @@
  <h1>What should you ask about compounded vs branded GLP-1?</h1>
+ <p class="article-frame">People look up “What should you ask about compounded vs branded GLP-1?” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `answers/ed-telehealth-legitimate.html`

```diff
--- a/apps/siya-health/answers/ed-telehealth-legitimate.html
+++ b/apps/siya-health/answers/ed-telehealth-legitimate.html
@@ after <h1>, before the existing intro @@
  <h1>Is telehealth for erectile dysfunction legitimate?</h1>
+ <p class="article-frame">A question like “Is telehealth for erectile dysfunction legitimate?” usually comes up when someone wants care without clearing a whole workday for a clinic visit. This page is about whether erectile-dysfunction care can be done properly by telehealth, and the clinical explanation below is unchanged. It does not assume you have that condition, or that a prescription is the right next step.</p>
```

#### `answers/executive-dysfunction-adhd.html`

```diff
--- a/apps/siya-health/answers/executive-dysfunction-adhd.html
+++ b/apps/siya-health/answers/executive-dysfunction-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>What is executive dysfunction in adult ADHD?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What is executive dysfunction in adult ADHD?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/food-noise-returned-on-glp-1.html`

```diff
--- a/apps/siya-health/answers/food-noise-returned-on-glp-1.html
+++ b/apps/siya-health/answers/food-noise-returned-on-glp-1.html
@@ after <h1>, before the existing intro @@
  <h1>Why did food noise come back on GLP-1?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “Why did food noise come back on GLP-1?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `answers/fsa-hsa-adhd-evaluation.html`

```diff
--- a/apps/siya-health/answers/fsa-hsa-adhd-evaluation.html
+++ b/apps/siya-health/answers/fsa-hsa-adhd-evaluation.html
@@ after <h1>, before the existing intro @@
  <h1>Can you use FSA or HSA for ADHD evaluation?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Can you use FSA or HSA for ADHD evaluation?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/glp-1-nausea-management.html`

```diff
--- a/apps/siya-health/answers/glp-1-nausea-management.html
+++ b/apps/siya-health/answers/glp-1-nausea-management.html
@@ after <h1>, before the existing intro @@
  <h1>How do you manage GLP-1 nausea?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “How do you manage GLP-1 nausea?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `answers/glp-1-side-effects.html`

```diff
--- a/apps/siya-health/answers/glp-1-side-effects.html
+++ b/apps/siya-health/answers/glp-1-side-effects.html
@@ after <h1>, before the existing intro @@
  <h1>Which GLP-1 side effects usually improve with titration?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “Which GLP-1 side effects usually improve with titration?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `answers/high-functioning-adhd.html`

```diff
--- a/apps/siya-health/answers/high-functioning-adhd.html
+++ b/apps/siya-health/answers/high-functioning-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>Can you have ADHD and still be high-functioning?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Can you have ADHD and still be high-functioning?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

### Batch 7 — 12 articles

`answers/high-shbg-low-free-testosterone.html` through `answers/screening-vs-adhd-evaluation.html`

#### `answers/high-shbg-low-free-testosterone.html`

```diff
--- a/apps/siya-health/answers/high-shbg-low-free-testosterone.html
+++ b/apps/siya-health/answers/high-shbg-low-free-testosterone.html
@@ after <h1>, before the existing intro @@
  <h1>What does high SHBG with low free testosterone mean?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “What does high SHBG with low free testosterone mean?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `answers/how-long-adhd-evaluation.html`

```diff
--- a/apps/siya-health/answers/how-long-adhd-evaluation.html
+++ b/apps/siya-health/answers/how-long-adhd-evaluation.html
@@ after <h1>, before the existing intro @@
  <h1>How long does an ADHD evaluation take?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “How long does an ADHD evaluation take?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/how-much-does-adhd-testing-cost.html`

```diff
--- a/apps/siya-health/answers/how-much-does-adhd-testing-cost.html
+++ b/apps/siya-health/answers/how-much-does-adhd-testing-cost.html
@@ after <h1>, before the existing intro @@
  <h1>How much does ADHD testing cost?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “How much does ADHD testing cost?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/insulin-resistance-without-diabetes.html`

```diff
--- a/apps/siya-health/answers/insulin-resistance-without-diabetes.html
+++ b/apps/siya-health/answers/insulin-resistance-without-diabetes.html
@@ after <h1>, before the existing intro @@
  <h1>Can you have insulin resistance without diabetes?</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “Can you have insulin resistance without diabetes?” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `answers/is-adhd-medication-safe-long-term.html`

```diff
--- a/apps/siya-health/answers/is-adhd-medication-safe-long-term.html
+++ b/apps/siya-health/answers/is-adhd-medication-safe-long-term.html
@@ after <h1>, before the existing intro @@
  <h1>What does long-term ADHD medication safety monitoring include?</h1>
+ <p class="article-frame">“What does long-term ADHD medication safety monitoring include?” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `answers/is-online-adhd-diagnosis-legitimate.html`

```diff
--- a/apps/siya-health/answers/is-online-adhd-diagnosis-legitimate.html
+++ b/apps/siya-health/answers/is-online-adhd-diagnosis-legitimate.html
@@ after <h1>, before the existing intro @@
  <h1>What should you look for in a legitimate online ADHD diagnosis?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What should you look for in a legitimate online ADHD diagnosis?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/late-adhd-diagnosis-adults.html`

```diff
--- a/apps/siya-health/answers/late-adhd-diagnosis-adults.html
+++ b/apps/siya-health/answers/late-adhd-diagnosis-adults.html
@@ after <h1>, before the existing intro @@
  <h1>Why are so many adults diagnosed with ADHD late in life?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Why are so many adults diagnosed with ADHD late in life?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/normal-a1c-insulin-resistance.html`

```diff
--- a/apps/siya-health/answers/normal-a1c-insulin-resistance.html
+++ b/apps/siya-health/answers/normal-a1c-insulin-resistance.html
@@ after <h1>, before the existing intro @@
  <h1>Can you have insulin resistance with a normal A1C?</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “Can you have insulin resistance with a normal A1C?” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `answers/oral-vs-topical-minoxidil.html`

```diff
--- a/apps/siya-health/answers/oral-vs-topical-minoxidil.html
+++ b/apps/siya-health/answers/oral-vs-topical-minoxidil.html
@@ after <h1>, before the existing intro @@
  <h1>When is topical minoxidil enough vs oral minoxidil?</h1>
+ <p class="article-frame">People look up “When is topical minoxidil enough vs oral minoxidil?” when they are trying to picture a workday, not when they are writing a prescription. The comparison already on this page is unchanged, and it does not assume you take either option or have the condition it is used for. Use it to walk into a visit with a clearer question.</p>
```

#### `answers/poor-sleep-feels-like-adhd.html`

```diff
--- a/apps/siya-health/answers/poor-sleep-feels-like-adhd.html
+++ b/apps/siya-health/answers/poor-sleep-feels-like-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>Can poor sleep feel like ADHD?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Can poor sleep feel like ADHD?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/rejection-sensitivity-adhd.html`

```diff
--- a/apps/siya-health/answers/rejection-sensitivity-adhd.html
+++ b/apps/siya-health/answers/rejection-sensitivity-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>What is rejection sensitive dysphoria (RSD) and ADHD?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What is rejection sensitive dysphoria (RSD) and ADHD?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/screening-vs-adhd-evaluation.html`

```diff
--- a/apps/siya-health/answers/screening-vs-adhd-evaluation.html
+++ b/apps/siya-health/answers/screening-vs-adhd-evaluation.html
@@ after <h1>, before the existing intro @@
  <h1>What is the difference between ADHD screening and a full evaluation?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What is the difference between ADHD screening and a full evaluation?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

### Batch 8 — 12 articles

`answers/semaglutide-weight-loss-how-it-works.html` through `answers/what-is-free-testosterone.html`

#### `answers/semaglutide-weight-loss-how-it-works.html`

```diff
--- a/apps/siya-health/answers/semaglutide-weight-loss-how-it-works.html
+++ b/apps/siya-health/answers/semaglutide-weight-loss-how-it-works.html
@@ after <h1>, before the existing intro @@
  <h1>How quickly does semaglutide start working for weight loss?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “How quickly does semaglutide start working for weight loss?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `answers/signs-of-adult-adhd.html`

```diff
--- a/apps/siya-health/answers/signs-of-adult-adhd.html
+++ b/apps/siya-health/answers/signs-of-adult-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>What are the signs of adult ADHD?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What are the signs of adult ADHD?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/signs-of-sleep-apnea-in-adults.html`

```diff
--- a/apps/siya-health/answers/signs-of-sleep-apnea-in-adults.html
+++ b/apps/siya-health/answers/signs-of-sleep-apnea-in-adults.html
@@ after <h1>, before the existing intro @@
  <h1>What are the signs of sleep apnea in adults?</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “What are the signs of sleep apnea in adults?” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `answers/starting-adhd-medication-adults.html`

```diff
--- a/apps/siya-health/answers/starting-adhd-medication-adults.html
+++ b/apps/siya-health/answers/starting-adhd-medication-adults.html
@@ after <h1>, before the existing intro @@
  <h1>What should adults expect when starting ADHD medication?</h1>
+ <p class="article-frame">“What should adults expect when starting ADHD medication?” is a question about how a medicine behaves across a day of meetings, deadlines, and the hours after work. The clinical explanation below is unchanged. Reading it does not mean you have ADHD, and it does not mean this medicine is part of your plan.</p>
```

#### `answers/telehealth-adhd-california.html`

```diff
--- a/apps/siya-health/answers/telehealth-adhd-california.html
+++ b/apps/siya-health/answers/telehealth-adhd-california.html
@@ after <h1>, before the existing intro @@
  <h1>How does ADHD telehealth work in California?</h1>
+ <p class="article-frame">A search like “How does ADHD telehealth work in California?” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `answers/telehealth-adhd-texas.html`

```diff
--- a/apps/siya-health/answers/telehealth-adhd-texas.html
+++ b/apps/siya-health/answers/telehealth-adhd-texas.html
@@ after <h1>, before the existing intro @@
  <h1>How does ADHD telehealth work in Texas?</h1>
+ <p class="article-frame">A search like “How does ADHD telehealth work in Texas?” is usually about whether care can happen without taking the day off. This page covers the logistics of that question, and the clinical detail underneath is unchanged. It does not assume you have a diagnosis.</p>
```

#### `answers/testosterone-and-adhd-overlap.html`

```diff
--- a/apps/siya-health/answers/testosterone-and-adhd-overlap.html
+++ b/apps/siya-health/answers/testosterone-and-adhd-overlap.html
@@ after <h1>, before the existing intro @@
  <h1>Can low testosterone mimic ADHD?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “Can low testosterone mimic ADHD?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/time-blindness-adhd.html`

```diff
--- a/apps/siya-health/answers/time-blindness-adhd.html
+++ b/apps/siya-health/answers/time-blindness-adhd.html
@@ after <h1>, before the existing intro @@
  <h1>What is time blindness in ADHD?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What is time blindness in ADHD?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/what-does-low-testosterone-feel-like.html`

```diff
--- a/apps/siya-health/answers/what-does-low-testosterone-feel-like.html
+++ b/apps/siya-health/answers/what-does-low-testosterone-feel-like.html
@@ after <h1>, before the existing intro @@
  <h1>What does low testosterone feel like?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “What does low testosterone feel like?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `answers/what-happens-after-adhd-evaluation.html`

```diff
--- a/apps/siya-health/answers/what-happens-after-adhd-evaluation.html
+++ b/apps/siya-health/answers/what-happens-after-adhd-evaluation.html
@@ after <h1>, before the existing intro @@
  <h1>What happens after an ADHD evaluation?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What happens after an ADHD evaluation?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/what-included-199-adhd-evaluation.html`

```diff
--- a/apps/siya-health/answers/what-included-199-adhd-evaluation.html
+++ b/apps/siya-health/answers/what-included-199-adhd-evaluation.html
@@ after <h1>, before the existing intro @@
  <h1>What is included in a Siya Health ADHD evaluation?</h1>
+ <p class="article-frame">Trouble with focus or follow-through can show up in a full schedule without anyone knowing yet whether a diagnosis is involved, which is why “What is included in a Siya Health ADHD evaluation?” gets read at all. The explanation below is unchanged. It does not assume you have ADHD or any other condition.</p>
```

#### `answers/what-is-free-testosterone.html`

```diff
--- a/apps/siya-health/answers/what-is-free-testosterone.html
+++ b/apps/siya-health/answers/what-is-free-testosterone.html
@@ after <h1>, before the existing intro @@
  <h1>What is free testosterone?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “What is free testosterone?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

### Batch 9 — 3 articles

`answers/what-is-insulin-resistance.html` through `answers/who-qualifies-glp-1-weight-loss.html`

#### `answers/what-is-insulin-resistance.html`

```diff
--- a/apps/siya-health/answers/what-is-insulin-resistance.html
+++ b/apps/siya-health/answers/what-is-insulin-resistance.html
@@ after <h1>, before the existing intro @@
  <h1>What is insulin resistance?</h1>
+ <p class="article-frame">Fatigue and fog are easy to notice at 2 p.m. and easy to postpone, which is why “What is insulin resistance?” gets searched from a desk. The explanation below is unchanged, and it does not decide that you have that condition. It gives you language for a workday when you talk with a clinician.</p>
```

#### `answers/when-is-testosterone-therapy-appropriate.html`

```diff
--- a/apps/siya-health/answers/when-is-testosterone-therapy-appropriate.html
+++ b/apps/siya-health/answers/when-is-testosterone-therapy-appropriate.html
@@ after <h1>, before the existing intro @@
  <h1>What symptoms warrant testosterone therapy evaluation?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “What symptoms warrant testosterone therapy evaluation?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

#### `answers/who-qualifies-glp-1-weight-loss.html`

```diff
--- a/apps/siya-health/answers/who-qualifies-glp-1-weight-loss.html
+++ b/apps/siya-health/answers/who-qualifies-glp-1-weight-loss.html
@@ after <h1>, before the existing intro @@
  <h1>Who qualifies for GLP-1 weight loss medications?</h1>
+ <p class="article-frame">Weight, energy, hair, hormones, and sleep show up on a workweek long before a chart does, which is why someone looks up “Who qualifies for GLP-1 weight loss medications?” The medical explanation already on this page is unchanged. It does not assume you have a diagnosis, or that this option belongs in your plan.</p>
```

---

## 4. Not done

- No framing paragraph was inserted into an article.
- Dosing text was not changed.
- `/adhd-care` and the free screening page content were not edited.
- Article batches were not deployed.

## 5. Before any article batch goes live

Sneha reviews the batch. After a batch is cleared, ship that batch alone, then the next one.
