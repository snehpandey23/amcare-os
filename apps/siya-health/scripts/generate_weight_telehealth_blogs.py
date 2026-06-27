#!/usr/bin/env python3
"""
Generate weight loss + general telehealth medication education blog HTML.
Run from anywhere: python3 scripts/generate_weight_telehealth_blogs.py
"""
from __future__ import annotations

import json
import os
from typing import Literal

BLOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "blog")

Kind = Literal["weight", "telehealth"]


def faq_schema(questions: list[tuple[str, str]]) -> str:
    entities = [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
        for q, a in questions
    ]
    return json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": entities}, ensure_ascii=False)


def article_schema(*, headline: str, description: str, slug: str) -> str:
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": headline,
            "description": description,
            "datePublished": "2026-03-16",
            "dateModified": "2026-03-16",
            "author": {"@type": "Organization", "name": "Siya Health"},
            "publisher": {"@type": "Organization", "name": "Siya Health", "url": "https://siya.health"},
            "mainEntityOfPage": {"@type": "WebPage", "@id": f"https://siya.health/blog/{slug}"},
        },
        ensure_ascii=False,
    )


SHARED_WEIGHT_APPEND = """
            <h2>Eligibility, BMI, and medical screening</h2>
            <p>Medical weight loss programs typically consider BMI, weight-related conditions (such as hypertension, dyslipidemia, prediabetes, or obstructive sleep apnea), prior attempts at lifestyle change, and medication history. Eligibility is not a moral judgment—it is a safety and evidence framework. Some adults with lower BMI still have metabolic risk factors; others with higher BMI need evaluation for contraindications before any pharmacotherapy. Only a licensed clinician can interpret these variables for you.</p>
            <p>Pregnancy, planning pregnancy, breastfeeding, active eating disorders in acute crisis, certain endocrine disorders, and some gastrointestinal conditions may change whether GLP-1–based therapies or other agents are appropriate. Never borrow medication from friends or purchase unverified products online; counterfeit injectables and inconsistent compounding have caused serious harm.</p>

            <h2>Why adherence and follow-up matter for GLP-1 therapies</h2>
            <p>GLP-1 receptor agonists used for weight management require structured follow-up: monitoring gastrointestinal tolerance, hydration, nutrition (especially protein intake), gallbladder symptoms, and mood. Some people pause or stop because of side effects; others need dose adjustments or rotation of therapy under supervision. Long-term success is not measured only by early scale changes but by sustainable habits, preserved muscle mass, and metabolic markers—your care team helps you define realistic process goals without promising a specific outcome.</p>
            <p>If you have a history of pancreatitis, medullary thyroid carcinoma or MEN2 (for certain agents per labeling), or severe gastroparesis, your prescriber may recommend alternatives. Always report severe abdominal pain, persistent vomiting, or neurologic symptoms urgently.</p>

            <h2>Compounded products, branding, and pharmacy quality</h2>
            <p>Branded and generic FDA-approved products follow manufacturing standards audited by regulators. Compounded formulations exist in a different regulatory context; quality varies by pharmacy, and not all compounded versions are appropriate substitutes for approved drugs. This article does not tell you which route to choose—it emphasizes asking your clinician and pharmacist where a product is made, whether it aligns with evidence and law, and what monitoring plan accompanies it.</p>

            <h2>Mental health, ADHD, and metabolic health overlap</h2>
            <p>Impulsivity, emotional eating, sleep deprivation, and untreated ADHD or depression can undermine nutrition plans independent of medication choice. Integrated programs that acknowledge behavioral health—without stigmatizing patients—often align better with durable change. If you also manage ADHD, coordinate care so stimulant appetite effects, sleep, and mood are reviewed holistically.</p>

            <h2>Questions to ask at your medical weight loss visit</h2>
            <p>Ask how often you will be seen, what labs or vitals are tracked, how side effects are triaged after hours, and what the plan is if you plateau or cannot tolerate a medication. Ask how the program supports nutrition and resistance training to protect lean mass. If something you read online contradicts your clinician, trust the individualized plan you build together.</p>

            <h2>Behavior change skills that support any medication plan</h2>
            <p>Self-monitoring (food, sleep, steps) works best when kept simple enough to sustain—excessive tracking can backfire into burnout. Environmental design, such as keeping high-protein snacks visible and reducing ultra-processed trigger foods at home, often outperforms willpower alone.</p>
            <p>Social support from groups or friends can help, but beware of groups that promote extreme restriction or unverified supplement stacks. Professional guidance keeps nutrition adequate for your activity level and medical conditions.</p>

            <h2>Cardiovascular and metabolic monitoring during pharmacologic weight management</h2>
            <p>Blood pressure and resting heart rate can shift with fluid balance, medication effects, and weight change itself. Your clinician may recommend home readings with a validated cuff, especially if you have hypertension history or take stimulants for ADHD. Lipids and A1c may improve with weight loss but occasionally shift in complex ways when diet composition changes rapidly—repeat labs on the schedule your team sets, not ad hoc.</p>
            <p>If you develop chest pressure with exertion, syncope, or new palpitations, pause strenuous exercise until evaluated. Orthostatic symptoms when standing quickly can signal dehydration or medication effects—report them rather than pushing through workouts.</p>

            <h2>Protecting muscle, bone, and micronutrient status</h2>
            <p>Rapid weight change increases risk of lean mass loss if protein intake and resistance training are inadequate. Many programs target protein spread across meals, vitamin D repletion when deficient, and calcium-rich foods unless contraindicated. Women approaching menopause and older adults carry higher osteoporotic risk—bone-stimulating exercise and adequate nutrition deserve explicit planning, not assumptions.</p>
            <p>If nausea limits food volume, discuss temporary strategies like protein shakes, small frequent meals, or antiemetics rather than skipping nutrition entirely. Labs for B12, iron, or thiamine may be relevant in selective cases, especially with prior bariatric surgery or heavy alcohol use—your clinician individualizes this.</p>

            <h2>Weight stigma, bias, and respectful care expectations</h2>
            <p>Evidence-based weight care should never equate body size with moral worth. You deserve respectful language, shared decision-making, and privacy. If a clinician dismisses symptoms as “just lose weight” without evaluating sleep apnea, thyroid dysfunction, or medication side effects, seeking a second opinion is reasonable.</p>
            <p>Conversely, friends or influencers who equate medication use with “cheating” ignore physiology. Your medical choices are between you and licensed professionals—not social media juries.</p>

            <h2>Special considerations for athletes and active adults</h2>
            <p>Training load, sweat losses, and menstrual status change fueling needs when appetite is pharmacologically reduced. Sports dietitians can help prevent relative energy deficiency, stress fractures, and performance collapse. If you compete under anti-doping codes, verify permitted therapies before starting any new prescription—even if widely used in general medicine.</p>
            <p>Heat illness risk rises when dehydration from GI side effects stacks with outdoor workouts. Adjust intensity, timing, and electrolyte replacement under professional guidance rather than guessing from fitness influencers.</p>

            <h2>Children, adolescents, and family context</h2>
            <p>Pediatric obesity management follows different specialists and trial data; this article targets adults. If you parent adolescents, model neutral food language and involve pediatricians before any shared household medication discussions. Family meals and sleep routines influence youth weight trajectories independently of parental pharmacotherapy.</p>
            <p>Secure storage of injectables matters in homes with children or pets; used sharps belong in approved containers, not household trash.</p>

            <h2>Work schedules, travel, and social eating</h2>
            <p>Night shifts and rotating schedules disrupt hunger cues and can worsen GI side effects when medication timing conflicts with sleep. Discuss dose timing strategies with your clinician rather than improvising. Business travel across time zones requires plans for injection days, cooler packs, and pharmacy transfers when allowed.</p>
            <p>Social events need not derail medical plans; flexible eating patterns, alcohol moderation, and advance communication with hosts can reduce anxiety. If work culture centers on constant food rewards, coaching scripts help you participate without shame.</p>
            <p>Finally, keep primary care in the loop: screening for cancers, immunizations, depression, and chronic conditions should continue even when weight is your top concern this season. Holistic prevention complements—not competes with—metabolic treatment.</p>
"""


SHARED_TELE_APPEND = """
            <h2>Telehealth prescribing: what regulations emphasize</h2>
            <p>Legitimate telehealth pairs secure video or phone visits with identity verification, state-appropriate licensure, and documentation that supports medical necessity. Controlled substances, in particular, are subject to federal and state rules that change over time; responsible clinics do not promise shortcuts. Prescription monitoring programs help identify risky combinations and “doctor shopping”—expect transparency about why your clinician reviews these records.</p>

            <h2>Red flags when seeking online prescriptions</h2>
            <p>Be cautious if a service guarantees a specific drug after minimal intake, refuses to coordinate with your primary care clinician, pressures you to pay for large bundles upfront, or markets controlled substances as productivity or lifestyle boosters. Good care discusses risks, alternatives, and non-medication strategies—not only prescriptions.</p>

            <h2>Drug interactions, substances, and honesty with your clinician</h2>
            <p>Alcohol, cannabis, supplements, bodybuilding compounds, and PDE5 inhibitors can interact with sedatives, testosterone, or other prescriptions. Herbal products are not automatically “safe” because they are natural. A complete medication list helps prevent dangerous combinations and supports accurate dosing decisions made by your prescriber.</p>

            <h2>When to seek urgent or emergency care</h2>
            <p>Chest pain, sudden vision or hearing loss, painful erection lasting hours, severe allergic reaction, thoughts of self-harm, inability to stay awake on a new sedative, or complex sleep behaviors after sleep medications require urgent evaluation. This educational article is not a triage tool—when in doubt, call emergency services or go to the nearest ER.</p>

            <h2>Coordinating ADHD, sleep, and metabolic care</h2>
            <p>Many adults have overlapping concerns: sleep disruption affecting focus, weight change on psychiatric medications, or fatigue mimicking other conditions. Tell each prescriber what others prescribe; fragmented care increases risk. Siya Health emphasizes evidence-based telehealth with appropriate supervision when services align with your needs.</p>

            <h2>Documentation, privacy, and continuity of care</h2>
            <p>After telehealth visits, you should receive a clear summary of the assessment, prescribed therapies, follow-up intervals, and warning signs that should prompt earlier contact. Store records from prior specialists so new clinicians understand prior trials and intolerances. Privacy policies should explain how health information is stored and shared; if anything feels opaque, ask before you proceed.</p>
            <p>Switching platforms frequently to chase a specific prescription fragments care and can create dangerous duplication. A stable clinician–patient relationship supports titration, side-effect management, and deprescribing when goals change.</p>

            <h2>Cost, coverage, and pharmacy choice</h2>
            <p>Insurance formularies, cash-pay coupons, and mail-order pharmacies change access—not clinical appropriateness. Prior authorizations can delay therapy but also reflect insurer criteria for evidence-based use. Your clinician’s office and pharmacist are partners in navigating these steps without cutting corners on safety.</p>

            <h2>Informed consent and shared decision-making</h2>
            <p>Good telehealth mirrors in-person ethics: you should understand uncertain benefits, known risks, reasonable alternatives (including no medication), and what follow-up will look like before starting therapy. Ask for plain-language explanations of black-box warnings when they apply, and request written instructions for titration or stopping rules.</p>
            <p>If marketing language on a website feels coercive—countdown timers, “limited slots,” or claims that everyone qualifies—step back. Ethical care allows you to decline or delay treatment while you seek a second opinion.</p>

            <h2>Older adults, organ function, and polypharmacy</h2>
            <p>Age-related changes in liver and kidney function alter drug levels for sedatives, ED medications, and many other agents. Older adults are also more prone to falls and cognitive fog from hypnotics. Bring an up-to-date medication list that includes over-the-counter drugs and supplements every visit.</p>
            <p>If you care for a vulnerable adult, ensure guardianship or surrogate decision-making documents are available when prescriptions change. Pharmacies may call to verify identity—this protects against fraud, not to inconvenience you.</p>

            <h2>Travel, supply continuity, and refills</h2>
            <p>Crossing state lines can affect whether your usual telehealth clinician may prescribe; plan early if you relocate or spend months elsewhere. Controlled substances often cannot be transferred between pharmacies freely—know your refill dates and avoid running out on holidays.</p>
            <p>For temperature-sensitive medications, confirm shipment policies with mail-order pharmacies and have backup plans for heat waves or travel delays.</p>

            <h2>Understanding off-label use without hype</h2>
            <p>Many medications are prescribed off-label when evidence and professional judgment support a reasonable pathway. Off-label does not mean illegal or experimental by default—but it also does not mean Instagram trends are equivalent to guidelines. Ask your clinician what data exist for your specific scenario, what monitoring is recommended, and what would trigger stopping therapy.</p>
            <p>Wellness influencers sometimes conflate cosmetic goals with medical indications. Separating those conversations protects you from unnecessary drug exposure and helps clinicians focus on outcomes that matter for longevity and function.</p>

            <h2>Building a long-term relationship with one medical home</h2>
            <p>Chronic conditions such as hypertension, diabetes, sleep disorders, or mood conditions benefit from continuity. Jumping between apps for each symptom fragments risk assessment. When possible, choose platforms that summarize care for your primary doctor and encourage preventive screenings aligned with age and family history.</p>
            <p>If Siya Health services match your needs, you can explore coordinated telehealth with licensed professionals; if not, the principles above still apply wherever you seek care.</p>

            <h2>Antimicrobial stewardship and antibiotic requests</h2>
            <p>Telehealth can appropriately treat some infections with antibiotics when diagnosis is clear and local resistance patterns are considered. However, pressure for “just in case” antibiotics drives resistance and allergic reactions. Legitimate clinicians explain why a viral illness does not need antibiotics and offer symptom relief strategies instead.</p>
            <p>Finish prescribed courses when directed, but never hoard leftovers for future self-treatment—dose and drug may be wrong for the next illness.</p>

            <h2>Mental health crises and scope of virtual care</h2>
            <p>Teletherapy and medication management help many people, but active suicidal intent, psychosis with command hallucinations, or domestic violence in progress require emergency resources—not a scheduled video chat next week. Safety plans should list local crisis lines, nearest ER, and trusted contacts.</p>
            <p>If a platform offers only asynchronous messaging for severe mental illness, ask whether live escalation pathways exist.</p>

            <h2>Preventive care still matters</h2>
            <p>Online prescribing for acute issues does not replace cancer screenings, immunizations, or blood pressure checks in appropriate settings. Ask how your telehealth team coordinates preventive milestones with your primary clinician.</p>
            <p>Tracking home blood pressure, glucose, or peak flows can make virtual visits more informative when devices are validated and technique is taught.</p>

            <h2>Allergies, prior reactions, and documentation</h2>
            <p>Document rashes, swelling, or anaphylaxis timelines with as much detail as possible—many “penicillin allergies” in charts are not true IgE-mediated allergies, but only a clinician should reassess. Carry a wallet card or phone note listing severe reactions and keep EpiPen availability updated if prescribed.</p>
            <p>Photos of rashes taken in good lighting help telehealth dermatology triage, though some lesions still need biopsy.</p>

            <h2>Reproductive health and medication safety</h2>
            <p>Many drugs discussed in general telehealth education—retinoids, ACE inhibitors, teratogenic anticonvulsants, some biologics—have pregnancy planning implications beyond this article’s scope. If you could become pregnant, discuss contraception and preconception planning whenever starting new long-term therapy.</p>
            <p>Partners taking teratogenic medications should follow safe handling instructions supplied by pharmacies.</p>

            <h2>Language access and health literacy</h2>
            <p>If English is not your first language, request interpreters or translated visit summaries when available. Medication guides should be understandable; ask pharmacists to explain devices in the language you prefer. Low health literacy affects adherence across all channels—telehealth or in-person—so speak up when instructions feel unclear.</p>
"""


def header_for(kind: Kind) -> str:
    if kind == "weight":
        return """<!DOCTYPE html>
<html lang="en">
  <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17553537456"></script>
    <script>window.dataLayer = window.dataLayer || []; function gtag(){{dataLayer.push(arguments);}} gtag('js', new Date()); gtag('config', 'AW-17553537456');</script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <link rel="canonical" href="https://siya.health/blog/{slug}" />
    <meta property="og:title" content="{og_title}" />
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">{article_json}</script>
    <script type="application/ld+json">{faq_json}</script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo" href="/"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" /></a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          <a class="button" href="/adhd-screening">Start Free Screening</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/blog">Blog</a>
          <a class="button" href="/adhd-screening">Start Free Screening</a>
        </div>
      </div>
    </header>

    <main id="main">
      <article class="blog-article">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="/blog/weight-loss">Weight loss · Medical education</a></p>
            <h1>{h1}</h1>
            <p class="blog-lead">{lead}</p>
          </header>

          <div class="blog-content">
            <p class="blog-disclaimer"><strong>For educational purposes only, not medical advice.</strong> This content does not replace evaluation by a licensed clinician. Weight and metabolic treatments require individualized risk–benefit discussion, monitoring, and follow-up. Never start, stop, or change a prescription without medical guidance.</p>

            <div class="blog-internal-links"><p>Explore medically guided options on our <a href="/weight-loss-metabolic-health">weight loss &amp; metabolic health</a> page, learn how <a href="/telehealth">telehealth</a> visits work with licensed providers, and see <a href="/blog/adhd">ADHD articles</a> when behavioral health overlaps with eating and energy patterns.</p></div>

{body}

            <p>If you are considering <strong>medically supervised weight loss</strong>, Siya Health offers provider-guided options for eligible adults—always anchored in clinical evaluation rather than trends.</p>
            <div class="cta-block blog-cta">
              <a class="button" href="https://spruce.care/siyahealth" target="_blank" rel="noopener">Book a free consultation</a>
            </div>

            <h2>FAQ</h2>
{faq_html}

            <section class="blog-related" aria-label="Related articles">
              <h2>Related articles</h2>
              <ul>
{related}
              </ul>
            </section>
          </div>
        </div>
      </article>

      <section class="section">
        <div class="container">
          <div class="cta-band">
            <h3>Provider-guided metabolic care</h3>
            <p>Structured evaluation helps determine whether medication-supported weight management is appropriate—and safe—for you.</p>
            <div class="cta-band-buttons">
              <a class="button" href="/weight-loss-metabolic-health">Weight loss &amp; metabolic health</a>
              <a class="button secondary" href="/blog/weight-loss">More weight loss articles</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-logo-col">
          <a href="/" class="footer-logo-link"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" class="footer-logo-img" /></a>
        </div>
        <div class="footer-brand">
          <p>Board-certified providers providing telehealth care across Texas, Pennsylvania, and Florida.</p>
        </div>
        <div><h4>Services</h4><p><a href="/adhd-care">ADHD Care</a></p><p><a href="/adhd-screening">Start Free Screening</a></p><p><a href="/weight-loss-metabolic-health">Weight Loss</a></p><p><a href="/telehealth">Telehealth</a></p></div>
        <div><h4>Contact</h4><p><a href="mailto:care@siya.health">care@siya.health</a></p><p><a href="tel:+12154451244">(215) 445-1244</a></p></div>
        <div><h4>Legal</h4><p><a href="https://adhd.siya.health/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a></p><p><a href="https://adhd.siya.health/terms-of-service" target="_blank" rel="noopener">Terms</a></p></div>
      </div>
      <div class="container"><p class="footer-notice">For emergencies, call 911. All telehealth services are provided by licensed medical professionals.</p><small>© 2026 Siya Health Inc.</small></div>
    </footer>
    <script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="69be9ab3db1480f6799cdd18"></script>
  </body>
</html>
"""
    return """<!DOCTYPE html>
<html lang="en">
  <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17553537456"></script>
    <script>window.dataLayer = window.dataLayer || []; function gtag(){{dataLayer.push(arguments);}} gtag('js', new Date()); gtag('config', 'AW-17553537456');</script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>{title}</title>
    <meta name="description" content="{description}" />
    <link rel="canonical" href="https://siya.health/blog/{slug}" />
    <meta property="og:title" content="{og_title}" />
    <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <script type="application/ld+json">{article_json}</script>
    <script type="application/ld+json">{faq_json}</script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <div class="container">
        <a class="header-logo" href="/"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" /></a>
        <nav class="nav-center" aria-label="Primary">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/blog">Blog</a>
        </nav>
        <div class="nav-cta">
          <a class="button" href="/adhd-screening">Start Free Screening</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/adhd-care">ADHD Care</a>
          <a href="/weight-loss-metabolic-health">Weight Loss</a>
          <a href="/telehealth">Telehealth</a>
          <a href="/blog">Blog</a>
          <a class="button" href="/adhd-screening">Start Free Screening</a>
        </div>
      </div>
    </header>

    <main id="main">
      <article class="blog-article">
        <div class="container blog-container">
          <header class="blog-header">
            <p class="blog-meta"><a href="/blog/telehealth">Telehealth · Medical education</a></p>
            <h1>{h1}</h1>
            <p class="blog-lead">{lead}</p>
          </header>

          <div class="blog-content">
            <p class="blog-disclaimer"><strong>Informational only:</strong> This content is for informational purposes only and does not replace consultation with a licensed provider. It is not a diagnosis or treatment plan. Medication decisions require individualized medical evaluation.</p>

            <div class="blog-internal-links"><p>Review <a href="/telehealth">telehealth at Siya Health</a>, <a href="/weight-loss-metabolic-health">metabolic and weight care</a>, and <a href="/adhd-care">ADHD care</a> to see how services may fit your goals. For prescribing standards, start with <a href="/blog/how-to-safely-get-prescriptions-online">how to safely get prescriptions online</a> (general guide).</p></div>

{body}

            <p><strong>Consult a licensed provider</strong> to determine if treatment is appropriate for you. Bring questions, medical history, and an open discussion of risks and alternatives.</p>
            <div class="cta-block blog-cta">
              <a class="button" href="https://spruce.care/siyahealth" target="_blank" rel="noopener">Book a free consultation</a>
            </div>

            <h2>FAQ</h2>
{faq_html}

            <section class="blog-related" aria-label="Related articles">
              <h2>Related articles</h2>
              <ul>
{related}
              </ul>
            </section>
          </div>
        </div>
      </article>

      <section class="section">
        <div class="container">
          <div class="cta-band">
            <h3>Evidence-based telehealth</h3>
            <p>Licensed clinicians can help you understand whether a medication or therapy fits your history—without hype or guarantees.</p>
            <div class="cta-band-buttons">
              <a class="button" href="/telehealth">Telehealth services</a>
              <a class="button secondary" href="/blog/telehealth">More telehealth articles</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-logo-col">
          <a href="/" class="footer-logo-link"><img src="../assets/images/siya-health-logo.png" alt="Siya Health" class="footer-logo-img" /></a>
        </div>
        <div class="footer-brand">
          <p>Board-certified providers providing telehealth care across Texas, Pennsylvania, and Florida.</p>
        </div>
        <div><h4>Services</h4><p><a href="/adhd-care">ADHD Care</a></p><p><a href="/adhd-screening">Start Free Screening</a></p><p><a href="/weight-loss-metabolic-health">Weight Loss</a></p><p><a href="/telehealth">Telehealth</a></p></div>
        <div><h4>Contact</h4><p><a href="mailto:care@siya.health">care@siya.health</a></p><p><a href="tel:+12154451244">(215) 445-1244</a></p></div>
        <div><h4>Legal</h4><p><a href="https://adhd.siya.health/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a></p><p><a href="https://adhd.siya.health/terms-of-service" target="_blank" rel="noopener">Terms</a></p></div>
      </div>
      <div class="container"><p class="footer-notice">For emergencies, call 911. All telehealth services are provided by licensed medical professionals.</p><small>© 2026 Siya Health Inc.</small></div>
    </footer>
    <script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="69be9ab3db1480f6799cdd18"></script>
  </body>
</html>
"""


def write_post(
    *,
    kind: Kind,
    slug: str,
    title: str,
    description: str,
    og_title: str,
    h1: str,
    lead: str,
    body: str,
    faqs: list[tuple[str, str]],
    related: list[tuple[str, str]],
) -> None:
    body = body + (SHARED_WEIGHT_APPEND if kind == "weight" else SHARED_TELE_APPEND)
    faq_html = "\n".join(f"            <h3>{q}</h3>\n            <p>{a}</p>" for q, a in faqs)
    related_html = "\n".join(f'                <li><a href="/blog/{s}">{t}</a></li>' for s, t in related)
    hdr = header_for(kind)
    html = hdr.format(
        title=title,
        description=description,
        slug=slug,
        og_title=og_title,
        h1=h1,
        lead=lead,
        body=body,
        faq_html=faq_html,
        related=related_html,
        article_json=article_schema(headline=h1, description=description, slug=slug),
        faq_json=faq_schema(faqs),
    )
    path = os.path.join(BLOG_DIR, f"{slug}.html")
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print("Wrote", path)


def _load_posts():
    import importlib.util

    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "weight_telehealth_posts_data.py")
    spec = importlib.util.spec_from_file_location("weight_telehealth_posts_data", data_path)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(mod)
    return mod.ALL_POSTS


def main() -> None:
    os.makedirs(BLOG_DIR, exist_ok=True)
    for p in _load_posts():
        write_post(**p)


if __name__ == "__main__":
    main()
