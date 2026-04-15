#!/usr/bin/env python3
"""
Generate shadow SEO landing pages (static HTML). Not linked from main nav.

Run from repo root or apps/siya-health:
  python3 scripts/generate_seo_shadow_pages.py

Also writes sitemap-seo-urls.txt (merge into sitemap.xml manually or use included generator).
"""
from __future__ import annotations

import json
import os
import textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HEADER = """    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header site-header-transparent" id="site-header">
      <div class="container">
        <a class="header-logo" href="/"><img src="assets/images/siya-health-logo.png" alt="Siya Health" /></a>
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
    </header>"""

FOOTER = """    <footer class="footer">
      <div class="container footer-grid">
        <div class="footer-logo-col">
          <a href="/" class="footer-logo-link"><img src="assets/images/siya-health-logo.png" alt="Siya Health" class="footer-logo-img" /></a>
        </div>
        <div class="footer-brand">
          <p>Board-certified providers providing telehealth care across Texas, Pennsylvania, and Florida.</p>
          <div class="footer-trust-logos">
            <img src="assets/images/hipaa-compliant.png" alt="HIPAA Compliant" class="footer-trust-logo" width="50" height="50" />
            <a href="https://www.legitscript.com/websites/?checker_keywords=siya.health" target="_blank" rel="noopener" title="Verify LegitScript Approval for www.siya.health"><img src="https://static.legitscript.com/seals/46197681.png" alt="Verify Approval for www.siya.health" class="footer-trust-logo" width="73" height="79" /></a>
            <img src="assets/images/creyos-logo.png" alt="Creyos Cognitive Testing" class="footer-trust-logo" width="90" height="50" />
          </div>
        </div>
        <div>
          <h4>Services</h4>
          <p><a href="/adhd-care">ADHD Care</a></p>
          <p><a href="/blog">Blog</a></p>
          <p><a href="/adhd-screening">Start Free Screening</a></p>
          <p><a href="/weight-loss-metabolic-health">Weight Loss</a></p>
          <p><a href="/telehealth">Telehealth</a></p>
        </div>
        <div class="footer-resources-seo">
          <h4>Resources</h4>
          <p><a href="/adult-adhd-diagnosis">Adult ADHD Diagnosis</a></p>
          <p><a href="/adhd-evaluation-cost">ADHD Evaluation Cost</a></p>
          <p><a href="/online-adhd-test">Online ADHD Screening</a></p>
          <p><a href="/adhd-diagnosis-texas">ADHD Diagnosis Texas</a></p>
          <p><a href="/adhd-diagnosis-florida">ADHD Diagnosis Florida</a></p>
          <p><a href="/creyos-adhd-testing">Creyos ADHD Testing</a></p>
        </div>
        <div>
          <h4>Contact</h4>
          <p><a href="mailto:care@siya.health">care@siya.health</a></p>
          <p><a href="tel:+12154451244">(215) 445-1244</a></p>
        </div>
        <div>
          <h4>Legal</h4>
          <p><a href="https://adhd.siya.health/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a></p>
          <p><a href="https://adhd.siya.health/terms-of-service" target="_blank" rel="noopener">Terms &amp; Conditions</a></p>
          <p><a href="https://adhd.siya.health/notice-of-privacy-practices" target="_blank" rel="noopener">Notice of Privacy Practices</a></p>
        </div>
      </div>
      <div class="container">
        <p class="footer-notice">For emergencies, call 911. All telehealth services are provided by licensed medical professionals in accordance with state regulations.</p>
        <small>© 2026 Siya Health Inc. All rights reserved.</small>
      </div>
    </footer>
    <script>
      (function() {{
        var header = document.getElementById('site-header');
        if (header && header.classList.contains('site-header-transparent')) {{
          function onScroll() {{ header.classList.toggle('site-header-scrolled', window.scrollY > 200); }}
          onScroll();
          window.addEventListener('scroll', onScroll, {{ passive: true }});
        }}
      }})();
    </script>
    <script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js" data-widget-id="69be9ab3db1480f6799cdd18"></script>
  </body>
</html>"""

HOW_IT_WORKS = """
      <section class="section section-tinted" id="how-it-works">
        <div class="container">
          <div class="section-header">
            <h2>How ADHD diagnosis works online</h2>
            <p class="lead">Same process whether you are at home in {geo} or traveling—secure telehealth, no waiting room.</p>
          </div>
          <div class="flow-cards">
            <div class="flow-card">
              <span class="flow-step-num">Step 1</span>
              <h3>Quick screening</h3>
              <p>Start with a free 2-minute screening so we can see if a full evaluation is the right next step.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">Step 2</span>
              <h3>60–90 minute visit</h3>
              <p>Board-certified, ADHD-CCSP trained providers review your history, use validated tools (ASRS, Creyos), and screen for common co-occurring conditions.</p>
            </div>
            <div class="flow-card">
              <span class="flow-step-num">Step 3</span>
              <h3>Clear plan</h3>
              <p>If criteria are met, you receive a formal diagnosis and a treatment plan you understand—including follow-up options.</p>
            </div>
          </div>
        </div>
      </section>"""

WHY_SIYA = """
      <section class="section" id="why-siya">
        <div class="container">
          <div class="section-header">
            <h2>Why patients choose Siya Health</h2>
          </div>
          <ul class="credentials-list" style="max-width: 640px; margin: 0 auto;">
            <li>Same-week appointments—not multi-month waitlists</li>
            <li>Transparent $199 evaluation; FSA/HSA eligible</li>
            <li>Licensed in Texas, Pennsylvania, and Florida</li>
            <li>HIPAA-compliant video visits; LegitScript certified</li>
          </ul>
        </div>
      </section>"""

PRICING = """
      <section class="section section-tinted" id="pricing">
        <div class="container">
          <div class="section-header">
            <h2>Transparent pricing</h2>
            <p class="lead">The comprehensive ADHD evaluation is <strong>$199</strong> one-time. Ongoing medication management is available on a monthly plan if clinically appropriate.</p>
          </div>
          <p style="text-align:center; max-width: 560px; margin: 0 auto;"><a class="button" href="https://link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY" target="_blank" rel="noopener">Book ADHD evaluation online</a></p>
        </div>
      </section>"""

CTA_FINAL = """
      <section class="section">
        <div class="container">
          <div class="cta-band">
            <h3>Ready for answers?</h3>
            <p>Book a virtual evaluation or take the free 2-minute screening first.</p>
            <div class="cta-band-buttons">
              <a class="button" href="https://link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY" target="_blank" rel="noopener">Book evaluation ($199)</a>
              <a class="button secondary" href="/adhd-screening">Free screening</a>
            </div>
          </div>
        </div>
      </section>"""

FAQ_SCRIPT = """
          <script>
            (function() {{
              var container = document.getElementById('faq');
              if (!container) return;
              var triggers = container.querySelectorAll('[data-faq-trigger]');
              var cards = container.querySelectorAll('[data-faq-item]');
              function openCard(card) {{
                var btn = card.querySelector('[data-faq-trigger]');
                var content = card.querySelector('[data-faq-content]');
                if (!btn || !content) return;
                card.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + 'px';
              }}
              function closeCard(card) {{
                var btn = card.querySelector('[data-faq-trigger]');
                var content = card.querySelector('[data-faq-content]');
                if (!btn || !content) return;
                card.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = '';
              }}
              function closeAll() {{ cards.forEach(closeCard); }}
              triggers.forEach(function(btn) {{
                btn.addEventListener('click', function() {{
                  var card = this.closest('[data-faq-item]');
                  if (card.classList.contains('is-open')) {{ closeCard(card); return; }}
                  closeAll();
                  openCard(card);
                }});
              }});
            }})();
          </script>"""


def faq_html(faqs: list[tuple[str, str]], uid: str) -> str:
    blocks = []
    for i, (q, a) in enumerate(faqs):
        blocks.append(f"""
              <div class="faq-accordion-card" data-faq-item>
                <h3 style="margin:0;">
                  <button type="button" class="faq-accordion-trigger" aria-expanded="false" aria-controls="faq-{uid}-{i}" id="faq-{uid}-q-{i}" data-faq-trigger>
                    <span>{q}</span>
                    <span class="faq-accordion-icon" aria-hidden="true">+</span>
                  </button>
                </h3>
                <div id="faq-{uid}-{i}" class="faq-accordion-content" role="region" aria-labelledby="faq-{uid}-q-{i}" data-faq-content>
                  <div class="faq-accordion-inner"><p>{a}</p></div>
                </div>
              </div>""")
    return f"""
      <section class="section faq-accordion-section" id="faq">
        <div class="container">
          <div class="faq-accordion" role="region" aria-label="Frequently asked questions">
            <div class="faq-accordion-header section-header">
              <h2>Frequently asked questions</h2>
            </div>
            <div class="faq-accordion-list">{"".join(blocks)}
            </div>
          </div>
{FAQ_SCRIPT}
        </div>
      </section>"""


def schema_org(faqs: list[tuple[str, str]]) -> str:
    faq_entities = [
        {
            "@type": "Question",
            "name": q,
            "acceptedAnswer": {"@type": "Answer", "text": a},
        }
        for q, a in faqs
    ]
    payload = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "MedicalOrganization",
                "name": "Siya Health",
                "url": "https://siya.health",
                "description": "Telehealth ADHD evaluation and treatment in TX, PA, and FL.",
            },
            {"@type": "FAQPage", "mainEntity": faq_entities},
        ],
    }
    return json.dumps(payload, ensure_ascii=False)


PAGES: list[dict] = [
    {
        "slug": "adhd-diagnosis-florida",
        "title": "Online ADHD Diagnosis Florida | $199 Evaluation | Siya Health",
        "meta": "Adult ADHD diagnosis online in Florida. $199, 60–90 min evaluation, board-certified providers. Same-week telehealth. ASRS & Creyos. Book today.",
        "h1": "Online ADHD Diagnosis in Florida ($199 Evaluation)",
        "geo": "Florida",
        "intro": """<p>If you live in Florida and have wondered whether ADHD explains years of overwhelm, procrastination, or &ldquo;almost keeping up,&rdquo; you are not alone. Many adults never received a childhood diagnosis—and primary care visits rarely leave time for a proper evaluation.</p>
          <p>Siya Health offers licensed telehealth ADHD care for Florida residents: a comprehensive virtual evaluation, validated clinical tools, and a clear treatment plan. No insurance required for the visit; FSA/HSA often accepted.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">We serve patients statewide—from Miami and Orlando to Jacksonville and the Gulf Coast—through secure video visits.</p>""",
        "faqs": [
            ("Can I get an ADHD diagnosis online in Florida?", "Yes. Florida residents can complete a full clinical evaluation via secure telehealth with a board-certified provider licensed in the state. If diagnostic criteria are met, you receive a formal diagnosis and plan."),
            ("How much does an ADHD evaluation cost?", "The initial comprehensive evaluation is $199. Pricing is transparent before you book."),
            ("Is this legitimate or just an online quiz?", "No. This is a 60–90 minute clinical visit using ASRS, Creyos cognitive testing, and screening for anxiety, depression, and PTSD—not a self-diagnosis quiz."),
        ],
    },
    {
        "slug": "adhd-diagnosis-texas",
        "title": "Online ADHD Diagnosis Texas | $199 Evaluation | Siya Health",
        "meta": "Adult ADHD diagnosis online in Texas. $199 evaluation, ADHD-CCSP providers, same-week telehealth. Austin, Houston, Dallas-area & statewide. Book now.",
        "h1": "Online ADHD Diagnosis in Texas ($199 Evaluation)",
        "geo": "Texas",
        "intro": """<p>Texas has long waitlists for psychiatry and ADHD specialists. If you are an adult in Texas seeking clarity—whether in a major metro or a smaller community—telehealth can remove distance and delay as barriers.</p>
          <p>Our providers are licensed in Texas and trained in adult ADHD (ADHD-CCSP). Your evaluation includes structured interviews, ASRS and Creyos testing, and discussion of medication and non-medication options when appropriate.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">Serving Texans statewide, including <a href="/adhd-diagnosis-austin">Austin</a>, <a href="/adhd-diagnosis-houston">Houston</a>, and Dallas–Fort Worth.</p>""",
        "faqs": [
            ("Do you diagnose ADHD for adults in Texas?", "Yes. We provide adult ADHD evaluations via telehealth for Texas residents with licensed, board-certified clinicians."),
            ("How fast can I get an appointment?", "Many patients are seen the same week after completing intake and screening."),
            ("Do you prescribe stimulants?", "When clinically appropriate, providers discuss all options and follow safety protocols including monitoring for controlled medications."),
        ],
    },
    {
        "slug": "adhd-diagnosis-pennsylvania",
        "title": "Online ADHD Diagnosis Pennsylvania | $199 | Siya Health",
        "meta": "Pennsylvania adult ADHD diagnosis online. $199 virtual evaluation. Board-certified, ADHD-CCSP. Philadelphia, Pittsburgh & statewide telehealth.",
        "h1": "Online ADHD Diagnosis in Pennsylvania ($199 Evaluation)",
        "geo": "Pennsylvania",
        "intro": """<p>Pennsylvania adults juggling careers, education, or family responsibilities often suspect ADHD—but finding a specialist who understands adult presentation can take months.</p>
          <p>Siya Health offers HIPAA-compliant video evaluations for Pennsylvania residents, with the same clinical rigor you would expect in person: full history, validated rating scales, cognitive testing, and personalized recommendations.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">Including <a href="/adhd-diagnosis-philadelphia">Philadelphia</a>, Pittsburgh, Harrisburg, and rural areas—wherever you have reliable internet.</p>""",
        "faqs": [
            ("Is telehealth ADHD diagnosis legal in Pennsylvania?", "Yes, when provided by a clinician licensed in Pennsylvania using HIPAA-compliant technology."),
            ("What is included in the $199 visit?", "A 60–90 minute evaluation, ASRS and Creyos, comorbidity screening, and a written treatment plan."),
            ("Can I use my HSA?", "Many patients pay with FSA or HSA cards; check with your plan administrator."),
        ],
    },
    {
        "slug": "adhd-diagnosis-austin",
        "title": "ADHD Diagnosis Austin TX | Online $199 Evaluation | Siya Health",
        "meta": "Adult ADHD diagnosis in Austin, Texas—online. $199 evaluation, same-week telehealth, ADHD-CCSP providers. Book your virtual visit.",
        "h1": "ADHD Diagnosis in Austin, Texas (Online, $199)",
        "geo": "the Austin area",
        "intro": """<p>Austin&rsquo;s fast pace and competitive job market can make untreated ADHD feel unbearable—yet local psychiatry waitlists often stretch for months.</p>
          <p>If you are in Travis County or the greater Austin metro, you can complete your evaluation from home. We are licensed throughout Texas and focus on adult ADHD, including high-masking professionals who &ldquo;seem fine&rdquo; on the outside.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">Looking for statewide info? See <a href="/adhd-diagnosis-texas">ADHD diagnosis in Texas</a>.</p>""",
        "faqs": [
            ("Do I need to visit an office in Austin?", "No. The evaluation is fully virtual for eligible Texas residents."),
            ("How is adult ADHD different from childhood ADHD?", "Adults often show more internal restlessness, chronic disorganization, and emotional dysregulation than classic hyperactivity in children."),
            ("What if I am not sure I have ADHD?", 'Start with our <a href="/online-adhd-test">free screening</a>—we will tell you honestly if a full evaluation makes sense.'),
        ],
    },
    {
        "slug": "adhd-diagnosis-houston",
        "title": "ADHD Diagnosis Houston TX | Online $199 Evaluation | Siya Health",
        "meta": "Houston adult ADHD diagnosis online. $199 comprehensive evaluation, board-certified telehealth. Same-week appointments. ASRS & Creyos.",
        "h1": "ADHD Diagnosis in Houston, Texas (Online, $199)",
        "geo": "Greater Houston",
        "intro": """<p>From the Medical Center to the suburbs, Houstonians often work long hours—and undiagnosed ADHD can show up as burnout, missed deadlines, or relationship strain.</p>
          <p>Siya Health connects you with Texas-licensed providers for a thorough virtual ADHD evaluation. You will have time to explain your story—not a rushed fifteen-minute visit.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">Also read: <a href="/adhd-diagnosis-texas">Texas ADHD diagnosis</a> and <a href="/adhd-evaluation-cost">evaluation cost</a>.</p>""",
        "faqs": [
            ("Can Houston residents use insurance?", "We are a direct-pay practice for transparency; many patients use FSA/HSA."),
            ("What states do you serve from Houston?", "This page is for Texas residents; we also serve Florida and Pennsylvania."),
            ("How long is the evaluation?", "Plan for 60–90 minutes with your provider."),
        ],
    },
    {
        "slug": "adhd-diagnosis-philadelphia",
        "title": "ADHD Diagnosis Philadelphia PA | Online $199 | Siya Health",
        "meta": "Philadelphia adult ADHD diagnosis online. $199 evaluation, ADHD-CCSP providers, telehealth statewide in PA. Book today.",
        "h1": "ADHD Diagnosis in Philadelphia, Pennsylvania (Online, $199)",
        "geo": "Philadelphia and southeastern PA",
        "intro": """<p>Philadelphia&rsquo;s density of students, healthcare workers, and shift-based jobs means many adults run on adrenaline for years before asking whether ADHD is part of the picture.</p>
          <p>We offer Pennsylvania-licensed telehealth evaluations with structured diagnostic criteria, cognitive testing, and compassionate providers who understand inattentive and combined-type presentations.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">Statewide coverage: <a href="/adhd-diagnosis-pennsylvania">Pennsylvania ADHD diagnosis</a>.</p>""",
        "faqs": [
            ("Do you serve patients outside Philadelphia city limits?", "Yes—anywhere in Pennsylvania where telehealth is appropriate and you have a stable connection."),
            ("Is the diagnosis valid for work or school accommodations?", "If criteria are met, you receive documentation consistent with clinical standards; specific accommodation processes vary by employer or institution."),
            ("What is Creyos?", 'Creyos is a validated cognitive assessment we use alongside clinical interview and rating scales—learn more on our <a href="/creyos-adhd-testing">Creyos ADHD testing</a> page.'),
        ],
    },
    {
        "slug": "online-adhd-test",
        "title": "Online ADHD Test &amp; Screening (Free) | Siya Health",
        "meta": "Take a free online ADHD screening in 2 minutes. Not a diagnosis—see if a $199 clinical evaluation with a board-certified provider is right for you.",
        "h1": "Online ADHD Test &amp; Screening (Free 2-Minute Check)",
        "geo": "your state (TX, PA, or FL)",
        "intro": """<p>An online ADHD test can help you organize your symptoms and decide whether to seek a full evaluation—but only a licensed clinician can diagnose ADHD.</p>
          <p>Our free screening takes about two minutes. Based on your responses, we will point you toward next steps, including the option to book a comprehensive $199 virtual evaluation if appropriate.</p>""",
        "extra": """<p style="text-align:center;margin:24px 0;"><a class="button" href="/adhd-screening">Start free ADHD screening</a></p>""",
        "faqs": [
            ("Is an online ADHD test a diagnosis?", "No. Screening tools estimate whether further evaluation is warranted. Diagnosis requires a clinical assessment."),
            ("What happens after the screening?", "You may be invited to book an evaluation or directed to resources if another concern fits better."),
            ("How accurate is online screening?", "Screeners like ASRS are validated, but they are one piece of a full evaluation."),
        ],
    },
    {
        "slug": "creyos-adhd-testing",
        "title": "Creyos ADHD Testing Online | Part of $199 Evaluation | Siya Health",
        "meta": "Creyos cognitive testing for ADHD as part of your $199 online evaluation. ASRS + Creyos + clinical interview. Licensed providers in TX, PA, FL.",
        "h1": "Creyos ADHD Testing (Included in Your Evaluation)",
        "geo": "telehealth",
        "intro": """<p>Creyos (formerly Cambridge Brain Sciences) provides brief, scientifically validated cognitive tasks that measure attention, processing speed, and related domains—useful context alongside ADHD rating scales and your history.</p>
          <p>At Siya Health, Creyos is integrated into our adult ADHD evaluation—not sold as a standalone gimmick—so your provider can interpret results in light of sleep, anxiety, mood, and other factors.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">Ready to book? The full evaluation—including Creyos—is <strong>$199</strong>.</p>""",
        "faqs": [
            ("Do I need to buy Creyos separately?", "No. When you book the evaluation, cognitive testing is part of the clinical package."),
            ("Can Creyos alone diagnose ADHD?", "No. Diagnosis is based on DSM criteria, interview, rating scales, and clinical judgment."),
            ("How long does Creyos take?", "Tasks are short and completed on your device before or during the visit, as directed by your provider."),
        ],
    },
    {
        "slug": "adult-adhd-diagnosis",
        "title": "Adult ADHD Diagnosis Online | $199 Evaluation | Siya Health",
        "meta": "Get an adult ADHD diagnosis online from board-certified providers. $199, 60–90 min, ASRS & Creyos. TX, PA, FL. Same-week telehealth appointments.",
        "h1": "Adult ADHD Diagnosis Online ($199 Comprehensive Evaluation)",
        "geo": "Texas, Pennsylvania, or Florida",
        "intro": """<p>Adult ADHD is often missed—especially in women and high achievers who compensate until burnout hits. If you have read every article and still need a clear answer, a structured evaluation is the next step.</p>
          <p>Siya Health specializes in adult ADHD telehealth: extended visit length, ADHD-CCSP trained clinicians, and transparent pricing so you are not surprised by bills after the fact.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">Compare: <a href="/adhd-treatment-online">ADHD treatment online</a> and our main <a href="/adhd-care">ADHD care</a> hub.</p>""",
        "faqs": [
            ("At what age can adults be diagnosed?", "ADHD can be diagnosed in adults when criteria are met and symptoms are traced appropriately—your provider will review onset and impairment."),
            ("Will I automatically get stimulants?", "Not automatically. Treatment is individualized; some patients start with non-stimulant options or behavioral strategies."),
            ("How is this different from TikTok self-diagnosis?", "You receive a face-to-face video evaluation with a licensed clinician using standardized tools—not social media checklists."),
        ],
    },
    {
        "slug": "adhd-treatment-online",
        "title": "ADHD Treatment Online | Telehealth TX, PA, FL | Siya Health",
        "meta": "Online ADHD treatment after diagnosis: medication management, follow-ups, telehealth in Texas, Pennsylvania & Florida. Start with $199 evaluation.",
        "h1": "ADHD Treatment Online (After Your Diagnosis)",
        "geo": "telehealth",
        "intro": """<p>Effective ADHD treatment usually combines the right clinical support with follow-up—not a one-off prescription. After a proper evaluation, many patients continue with medication management and periodic visits.</p>
          <p>Siya Health offers ongoing care plans for non-stimulant and stimulant pathways where clinically appropriate, with monitoring that follows safety guidelines.</p>""",
        "extra": """<p class="lead" style="max-width:720px;margin:0 auto;">New patient? Begin with <a href="/adult-adhd-diagnosis">adult ADHD diagnosis</a> or <a href="/adhd-care">ADHD care overview</a>.</p>""",
        "faqs": [
            ("Can I get treatment without an evaluation?", "If you are new to Siya Health, we begin with a full assessment to ensure safe, appropriate care."),
            ("What are monthly plans for?", "Ongoing medication management and follow-up visits after your initial evaluation."),
            ("Is therapy included?", "We focus on medical evaluation and medication management; your provider may recommend therapy as an adjunct."),
        ],
    },
    {
        "slug": "adhd-evaluation-cost",
        "title": "ADHD Evaluation Cost Online | $199 Flat Rate | Siya Health",
        "meta": "ADHD evaluation cost: $199 transparent flat fee for 60–90 min online visit. No insurance surprise bills. FSA/HSA. Texas, Pennsylvania, Florida.",
        "h1": "ADHD Evaluation Cost: $199 (What You Get)",
        "geo": "online",
        "intro": """<p>One of the biggest frustrations in healthcare is not knowing what you will owe. Our adult ADHD evaluation is <strong>$199</strong> upfront—a 60–90 minute visit with a board-certified provider, ASRS and Creyos testing, comorbidity screening, and a written plan.</p>
          <p>Ongoing medication management, if you continue care with us, is billed as a separate monthly plan. There are no hidden facility fees for the initial evaluation.</p>""",
        "extra": """<ul class="credentials-list" style="max-width:560px;margin:0 auto;"><li>60–90 minute video evaluation</li><li>ASRS + Creyos cognitive tasks</li><li>Anxiety, depression, PTSD screening</li><li>Formal diagnosis if criteria met</li><li>Personalized treatment recommendations</li></ul>""",
        "faqs": [
            ("Why is the evaluation $199?", "We are direct-pay to avoid insurance-driven visit compression and prior authorization delays."),
            ("Do you take insurance?", "We do not bill insurance for evaluations; many patients use FSA/HSA."),
            ("Are there cheaper online ADHD options?", "Be cautious of instant-diagnosis mills. Quality evaluations take clinician time and validated tools."),
        ],
    },
]


def render_page(spec: dict) -> str:
    slug = spec["slug"]
    uid = slug.replace("-", "")[:24]
    faqs = spec["faqs"]
    geo = spec["geo"]
    canonical = f"https://siya.health/{slug}"
    schema = schema_org(faqs)

    hero_lead = 'Licensed telehealth in Texas, Pennsylvania & Florida. Same-week appointments. <a href="/adhd-care" style="color:inherit;text-decoration:underline;">Main ADHD care page</a>.'

    body = f"""
    <main id="main">
      <section class="hero-merged" style="background-image: url('assets/images/adhd-focus.png');">
        <div class="container hero-inner">
          <div class="hero-merged-content">
            <h1>{spec["h1"]}</h1>
            <p class="hero-merged-lead">{hero_lead}</p>
            <div class="hero-ctas hero-ctas-adhd-primary">
              <a class="button" href="https://link.yourmarketingai.com/widget/form/mnWpgh0IEgFvJymdZqHY" target="_blank" rel="noopener">Book ADHD evaluation</a>
              <p class="hero-secondary-cta"><a href="/adhd-screening">Free 2-minute screening</a></p>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-content" style="max-width: 720px; margin: 0 auto;">
            {spec["intro"]}
            {spec.get("extra", "")}
          </div>
        </div>
      </section>
{HOW_IT_WORKS.format(geo=geo)}
{WHY_SIYA}
{PRICING}
{faq_html(faqs, uid)}
{CTA_FINAL}
    </main>"""

    head = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17553537456"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){{dataLayer.push(arguments);}}
      gtag('js', new Date());
      gtag('config', 'AW-17553537456');
    </script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="index, follow" />
    <title>{spec["title"]}</title>
    <meta name="description" content="{spec["meta"]}" />
    <link rel="canonical" href="{canonical}" />
    <meta property="og:title" content="{spec["title"]}" />
    <meta property="og:description" content="{spec["meta"]}" />
    <meta property="og:url" content="{canonical}" />
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
    <link rel="icon" type="image/x-icon" href="assets/favicon.ico" />
    <link rel="preload" href="styles.css" as="style" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css" />
    <script type="application/ld+json">
{schema}
    </script>
  </head>
  <body>
{HEADER}
{body}
{FOOTER}"""

    return textwrap.dedent(head).strip() + "\n"


def main():
    urls = []
    for spec in PAGES:
        path = os.path.join(ROOT, spec["slug"] + ".html")
        with open(path, "w", encoding="utf-8") as f:
            f.write(render_page(spec))
        urls.append(f"https://siya.health/{spec['slug']}")
        print("Wrote", path)
    list_path = os.path.join(ROOT, "seo-generated-urls.txt")
    with open(list_path, "w", encoding="utf-8") as f:
        f.write("\n".join(urls) + "\n")
    print("Wrote", list_path)


if __name__ == "__main__":
    main()
