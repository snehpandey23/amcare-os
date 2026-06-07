#!/usr/bin/env python3
"""Inject disclaimer, internal links, related articles, and JSON-LD into legacy blog posts."""
from __future__ import annotations

import json
import os
import re

BLOG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "blog")

DISCLAIMER_BLOCK = """            <p class="blog-disclaimer"><strong>Educational only:</strong> This content is for educational purposes only and does not replace medical advice. Diagnosis and prescribing require licensed providers.</p>
            <div class="blog-internal-links"><p>Explore <a href="/adhd-care">ADHD diagnosis and care</a>, review typical <a href="/pricing">ADHD evaluation cost</a> factors, and try our <a href="/adhd-screening">online ADHD screening</a> before your visit.</p></div>

"""

PATCHES: dict[str, dict] = {
    "adhd-evaluation-cost-texas.html": {
        "head_insert_after": r'(    <link href="https://fonts\.googleapis\.com/css2[^>]+>\s*\n)',
        "head_extra": """    <script type="application/ld+json">{article}</script>
    <script type="application/ld+json">{faq}</script>
""",
        "article": {
            "headline": "ADHD Evaluation Cost in Texas: Full Breakdown (2026 Guide)",
            "desc": "What does an ADHD evaluation cost in Texas in 2026? Compare options—insurance, cash pay, online—and see the real breakdown.",
            "url": "https://siya.health/blog/adhd-evaluation-cost-texas",
        },
        "faqs": [
            ("Is $199 for an ADHD evaluation a good price?", "Yes. It's on the lower end for a comprehensive 60–90 minute evaluation with a licensed provider. Many traditional clinics charge $400–$800 or more."),
            ("Does the $199 include the prescription?", "The evaluation fee covers the diagnostic visit. If medication is prescribed, you'll pay for the medication (often through your pharmacy or a prescription plan). Ongoing medication management is $149/month if you enroll."),
            ("Can I use my FSA or HSA?", "Many patients use FSA/HSA funds for ADHD evaluation and treatment. Check with your plan administrator."),
            ("What if I don't get diagnosed with ADHD?", "You still get answers. Your provider will discuss what might be going on and recommend next steps—whether that's ruling out other conditions or exploring different supports."),
        ],
        "related": [
            ("online-adhd-diagnosis-texas", "Online ADHD diagnosis in Texas"),
            ("is-online-adhd-diagnosis-legit", "Is online ADHD diagnosis legit?"),
            ("adhd-medication-options-for-adults", "ADHD medication options for adults"),
            ("how-adhd-medication-is-prescribed-online", "How ADHD medication is prescribed online"),
        ],
        "before_faq_marker": '<p class="cta-microcopy">See the cost upfront. No surprises.</p>',
    },
    "online-adhd-diagnosis-texas.html": {
        "head_insert_after": r'(    <link href="https://fonts\.googleapis\.com/css2[^>]+>\s*\n)',
        "head_extra": """    <script type="application/ld+json">{article}</script>
    <script type="application/ld+json">{faq}</script>
""",
        "article": {
            "headline": "Online ADHD Diagnosis in Texas: Cost, Process & What to Expect",
            "desc": "Considering an ADHD evaluation in Texas? Learn the real cost, how online diagnosis works, and what to expect—from a board-certified telehealth practice.",
            "url": "https://siya.health/blog/online-adhd-diagnosis-texas",
        },
        "faqs": [
            ("How long does an online ADHD evaluation take?", "A thorough evaluation takes 60–90 minutes. Quick online assessments that give you a result in 5 minutes are not the same as a proper clinical evaluation."),
            ("Can I use insurance for online ADHD diagnosis in Texas?", "We operate with transparent, cash-based pricing. Many patients prefer this because there are no surprise bills or prior-authorization delays."),
            ("Is the diagnosis valid for prescriptions?", "Yes. Our providers are licensed in Texas and can prescribe ADHD medication when clinically appropriate."),
            ("What if I'm not sure I have ADHD?", "That's exactly what the free ADHD screening and Talk to a Clinician visit are for. You can ask questions and decide whether a full evaluation makes sense for you."),
        ],
        "related": [
            ("adhd-evaluation-cost-texas", "ADHD evaluation cost in Texas"),
            ("is-online-adhd-diagnosis-legit", "Is online ADHD diagnosis legit?"),
            ("how-adhd-medication-is-prescribed-online", "How ADHD medication is prescribed online"),
            ("adderall-for-adhd-how-it-works", "Adderall for ADHD: how it works"),
        ],
        "before_faq_marker": '<p class="cta-microcopy">Privacy, convenience, and clarity—without the wait.</p>',
    },
    "how-to-know-if-you-have-adhd-adult.html": {
        "head_insert_after": r'(    <link href="https://fonts\.googleapis\.com/css2[^>]+>\s*\n)',
        "head_extra": """    <script type="application/ld+json">{article}</script>
    <script type="application/ld+json">{faq}</script>
""",
        "article": {
            "headline": "How to Know If You Have ADHD as an Adult (Real Signs Explained)",
            "desc": "Not sure if you have ADHD? Learn the real signs adults experience—beyond the stereotypes—and when it's worth getting evaluated.",
            "url": "https://siya.health/blog/how-to-know-if-you-have-adhd-adult",
        },
        "faqs": [
            ("Can you develop ADHD as an adult?", "ADHD is a neurodevelopmental condition—it starts in childhood. But many adults weren't diagnosed because their symptoms were overlooked or attributed to something else. So it's not that you developed it; you may have had it all along."),
            ("What if I'm high-performing at work?", "You can have ADHD and still succeed. Many adults compensate with intelligence, anxiety, or rigid routines. Burnout often catches up later. A diagnosis can help you work with your brain instead of against it."),
            ("How long does an ADHD evaluation take?", "A thorough evaluation takes 60–90 minutes. Quick online tests are screenings, not full evaluations."),
            ("Will I have to take medication?", "No. Medication is one option. Your provider will discuss what fits your goals—whether that's medication, therapy, lifestyle changes, or a combination."),
        ],
        "related": [
            ("adhd-symptoms-overlooked", "Adult ADHD symptoms often overlooked"),
            ("online-adhd-diagnosis-texas", "Online ADHD diagnosis in Texas"),
            ("adhd-evaluation-cost-texas", "ADHD evaluation cost in Texas"),
            ("adhd-medication-options-for-adults", "ADHD medication options for adults"),
        ],
        "before_faq_marker": '<p class="cta-microcopy">Find out if ADHD evaluation is right for you—no pressure.</p>',
    },
    "adhd-symptoms-overlooked.html": {
        "head_insert_after": r'(    <link href="https://fonts\.googleapis\.com/css2[^>]+>\s*\n)',
        "head_extra": """    <script type="application/ld+json">{article}</script>
    <script type="application/ld+json">{faq}</script>
""",
        "article": {
            "headline": "Adult ADHD Symptoms That Are Often Overlooked",
            "desc": "These ADHD symptoms in adults are easy to miss—or dismiss. Learn what clinicians look for beyond the obvious signs.",
            "url": "https://siya.health/blog/adhd-symptoms-overlooked",
        },
        "faqs": [
            ("Can you have ADHD and still be successful?", "Absolutely. Many adults with ADHD succeed by compensating—working harder, building rigid systems, or finding roles that fit their strengths. Success doesn't rule out ADHD; it often masks it."),
            ("What if I've been told it's just anxiety?", "ADHD and anxiety often co-occur. A good evaluation will screen for both and help clarify which symptoms belong where. Treatment can look different depending on the answer."),
            ("Are online ADHD evaluations legitimate?", "Yes. When conducted by licensed providers using evidence-based protocols, online ADHD evaluations are valid and accepted for prescriptions and accommodations."),
            ("How do I know if I should get evaluated?", "If these symptoms affect your work, relationships, or daily life—and they've been present since childhood—an evaluation can give you clarity. A free ADHD screening or Talk to a Clinician visit is a low-commitment way to explore whether it's worth pursuing."),
        ],
        "related": [
            ("how-to-know-if-you-have-adhd-adult", "How to know if you have ADHD as an adult"),
            ("online-adhd-diagnosis-texas", "Online ADHD diagnosis in Texas"),
            ("is-online-adhd-diagnosis-legit", "Is online ADHD diagnosis legit?"),
            ("non-stimulant-adhd-medications-explained", "Non-stimulant ADHD medications explained"),
        ],
        "before_faq_marker": '<p class="cta-microcopy">Answers without the wait.</p>',
    },
    "is-online-adhd-diagnosis-legit.html": {
        "head_insert_after": r'(    <link href="https://fonts\.googleapis\.com/css2[^>]+>\s*\n)',
        "head_extra": """    <script type="application/ld+json">{article}</script>
    <script type="application/ld+json">{faq}</script>
""",
        "article": {
            "headline": "Is Online ADHD Diagnosis Legit? What Patients Should Know",
            "desc": "Skeptical about online ADHD diagnosis? Here's what makes it legitimate—and what to look for when choosing a provider.",
            "url": "https://siya.health/blog/is-online-adhd-diagnosis-legit",
        },
        "faqs": [
            ("Will my online ADHD diagnosis be accepted for prescriptions?", "Yes. A diagnosis from a licensed provider—whether in person or via telehealth—is valid for prescribing. Pharmacies and insurers recognize telehealth evaluations when they're properly documented."),
            ("Can I use an online diagnosis for work or school accommodations?", "Yes. Proper documentation from a licensed clinician is typically accepted for ADA accommodations, extended time, and similar needs. Check with your employer or school for their specific requirements."),
            ("How do I know if a provider is legitimate?", "Verify their license in your state. Check that they're board-certified. Look for clear information about the evaluation process—length, tools used, and what's included. Legitimate practices are transparent."),
            ("What if I've had a bad experience with online mental health before?", "There's a difference between a quick-app prescription and a thorough clinical evaluation. Ask about the process before you book. A 60–90 minute visit with a board-certified provider is not the same as a 10-minute consultation."),
            ("Is it safer to go in person?", "For ADHD evaluation, the clinical process is the same. The main advantage of telehealth is convenience and often faster access. The quality of the diagnosis depends on the clinician and the process—not whether you're in the same room."),
        ],
        "related": [
            ("online-adhd-diagnosis-texas", "Online ADHD diagnosis in Texas"),
            ("how-adhd-medication-is-prescribed-online", "How ADHD medication is prescribed online"),
            ("adhd-evaluation-cost-texas", "ADHD evaluation cost in Texas"),
            ("is-adhd-medication-safe-long-term", "Is ADHD medication safe long term?"),
        ],
        "before_faq_marker": '<p class="cta-microcopy">Talk to a licensed provider. No pressure. Real answers.</p>',
    },
    "medical-weight-loss-glp1-semaglutide-texas.html": {
        "head_insert_after": r'(    <link href="https://fonts\.googleapis\.com/css2[^>]+>\s*\n)',
        "head_extra": """    <script type="application/ld+json">{article}</script>
    <script type="application/ld+json">{faq}</script>
""",
        "article": {
            "headline": "Medical Weight Loss in Texas: GLP-1, Semaglutide, Tirzepatide & What Actually Works",
            "desc": "Evidence-based medical weight loss in Texas. GLP-1 medications, semaglutide, tirzepatide, phentermine—when they're appropriate and what to expect.",
            "url": "https://siya.health/blog/medical-weight-loss-glp1-semaglutide-texas",
        },
        "faqs": [
            ("Is semaglutide or tirzepatide right for me?", "Only a provider can answer that. Eligibility depends on your BMI, medical history, other medications, and health goals. A consultation is the right place to start."),
            ("What about side effects?", "All weight loss medications can have side effects. GLP-1 medications may cause gastrointestinal symptoms; phentermine can affect heart rate and blood pressure. Your provider will discuss risks, monitor you, and adjust your plan as needed."),
            ("Can I use telehealth for medical weight loss?", "Yes. Board-certified providers can evaluate, prescribe, and monitor weight loss medication via secure telehealth in states where they're licensed—including Texas, Pennsylvania, and Florida."),
        ],
        "related": [
            ("blog/telehealth", "Telehealth articles"),
            ("blog/weight-loss", "Weight loss article hub"),
            ("how-to-know-if-you-have-adhd-adult", "Adult ADHD signs (metabolic & behavior)"),
            ("online-adhd-diagnosis-texas", "Example: structured telehealth visits"),
        ],
        "before_faq_marker": '<p class="cta-microcopy">Find out if a provider-guided program with GLP-1 medications, semaglutide, tirzepatide, or phentermine is right for you.</p>',
    },
}


def article_json(article: dict) -> str:
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article["headline"],
            "description": article["desc"],
            "datePublished": "2026-01-10",
            "dateModified": "2026-03-15",
            "author": {"@type": "Organization", "name": "Siya Health"},
            "publisher": {"@type": "Organization", "name": "Siya Health", "url": "https://siya.health"},
            "mainEntityOfPage": {"@type": "WebPage", "@id": article["url"]},
        },
        ensure_ascii=False,
    )


def faq_json(faqs: list[tuple[str, str]]) -> str:
    return json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": q,
                    "acceptedAnswer": {"@type": "Answer", "text": a},
                }
                for q, a in faqs
            ],
        },
        ensure_ascii=False,
    )


def related_block(related: list[tuple[str, str]]) -> str:
    lines = ['            <section class="blog-related" aria-label="Related articles">', '              <h2>Related articles</h2>', "              <ul>"]
    for slug, title in related:
        href = f"/{slug}" if slug.startswith("blog/") else f"/blog/{slug}"
        lines.append(f'                <li><a href="{href}">{title}</a></li>')
    lines.extend(["              </ul>", "            </section>", ""])
    return "\n".join(lines)


def patch_file(name: str, cfg: dict) -> None:
    path = os.path.join(BLOG, name)
    text = open(path, encoding="utf-8").read()
    if "blog-internal-links" in text:
        print("Skip (already patched):", name)
        return

    art = article_json(cfg["article"])
    faq = faq_json(cfg["faqs"])
    head_bit = cfg["head_extra"].format(article=art, faq=faq)
    text, n = re.subn(cfg["head_insert_after"], r"\1" + head_bit, text, count=1)
    if n != 1:
        raise RuntimeError(f"head insert failed {name}")

    text, n = re.subn(
        r'(<div class="blog-content">\s*\n)',
        r"\1" + DISCLAIMER_BLOCK,
        text,
        count=1,
    )
    if n != 1:
        raise RuntimeError(f"disclaimer insert failed {name}")

    rel = related_block(cfg["related"])
    if cfg.get("before_faq_marker"):
        if cfg["before_faq_marker"] not in text:
            raise RuntimeError(f"marker not found {name}")
        text = text.replace(cfg["before_faq_marker"], cfg["before_faq_marker"] + "\n\n" + rel, 1)
    else:
        raise RuntimeError(f"before_faq_marker required: {name}")

    open(path, "w", encoding="utf-8").write(text)
    print("Patched", name)


def main() -> None:
    for name, cfg in PATCHES.items():
        patch_file(name, cfg)


if __name__ == "__main__":
    main()
