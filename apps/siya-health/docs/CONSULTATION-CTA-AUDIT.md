# Consultation CTA Routing Audit

Generated: 2026-06-28T15:15:50.570Z

## Intent mapping (source of truth)

| Intent | Example labels | Expected URL |
|--------|----------------|--------------|
| Spruce chat | Start Secure Medical Chat, Questions? | `https://spruce.care/siyahealth` |
| Walkthrough | Schedule Consultation, Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=ftxOxenx` |
| $199 evaluation | Start $199 Evaluation | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22FpD8jVPKsOA&i=bxrKBOuk` |
| Screening | Take Free ADHD Screening | `/adhd-screening` |

## Summary

| Metric | Count |
|--------|------:|
| HTML files scanned | 149 |
| CTAs matched | 1076 |
| Incorrect routing | 0 |
| Needs manual review (ambiguous) | 271 |

## Fixes applied in this release

- `BOOKING_LINK` restored to ADHD walkthrough (`ftxOxenx`), not Spruce
- `normalizeConsultationCtaRouting()` rewrites Spruce/sysv73e4/`/book-appointment` on consultation labels → walkthrough
- Footer **Book appointment** now points to walkthrough booking
- California ADHD blog generator CTAs corrected
- Weight-loss page broken `#book-telehealth` anchors → Spruce

## Full inventory

| Status | File | CTA text | Destination | Intent | Expected |
|--------|------|----------|-------------|--------|----------|
| OK | `about.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `about.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `about.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `about.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `about.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `about.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `about.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `about.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `about.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `about.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-care.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-care.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-care.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `adhd-care.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adhd-care.html` | Creyos cognitive testing for ADHD evaluations | `/creyos-adhd-testing` | evaluation_context | — |
| OK | `adhd-care.html` | Take Free ADHD Screening | `/adhd-screening?start=asrs` | screening | `/adhd-screening` |
| REVIEW | `adhd-care.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-care.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-care.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-care.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-austin.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-austin.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-austin.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `adhd-diagnosis-austin.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adhd-diagnosis-austin.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-diagnosis-austin.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-diagnosis-austin.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-austin.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-florida.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-florida.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-florida.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `adhd-diagnosis-florida.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adhd-diagnosis-florida.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-diagnosis-florida.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-diagnosis-florida.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-florida.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-houston.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-houston.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-houston.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `adhd-diagnosis-houston.html` | evaluation cost | `/pricing` | evaluation_context | — |
| OK | `adhd-diagnosis-houston.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adhd-diagnosis-houston.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-diagnosis-houston.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-diagnosis-houston.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-houston.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-pennsylvania.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-pennsylvania.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-pennsylvania.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `adhd-diagnosis-pennsylvania.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adhd-diagnosis-pennsylvania.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-diagnosis-pennsylvania.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-diagnosis-pennsylvania.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-pennsylvania.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-philadelphia.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-philadelphia.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-philadelphia.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `adhd-diagnosis-philadelphia.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adhd-diagnosis-philadelphia.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-diagnosis-philadelphia.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-diagnosis-philadelphia.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-philadelphia.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-texas.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adhd-diagnosis-texas.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-diagnosis-texas.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-evaluation-cost.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-evaluation-cost.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-evaluation-cost.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `adhd-evaluation-cost.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adhd-evaluation-cost.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-evaluation-cost.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-evaluation-cost.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-evaluation-cost.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-screening.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-screening.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-screening.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-screening.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `adhd-screening.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-screening.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-screening.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-screening.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-treatment-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-treatment-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-treatment-online.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `adhd-treatment-online.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adhd-treatment-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adhd-treatment-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adhd-treatment-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-diagnosis.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-diagnosis.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-diagnosis.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `adult-adhd-diagnosis.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `adult-adhd-diagnosis.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `adult-adhd-diagnosis.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adult-adhd-diagnosis.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-diagnosis.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-screening-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adult-adhd-screening-california.html` | Already ready? Start the $199 evaluation | `https://book.carepatron.com/Siya-Health?p=X9P…` | evaluation_199 | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-screening-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-screening-california.html` | Start $199 Evaluation | `https://book.carepatron.com/Siya-Health?p=X9P…` | evaluation_199 | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-screening-california.html` | Start $199 Evaluation | `https://book.carepatron.com/Siya-Health?p=X9P…` | evaluation_199 | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-screening-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `adult-adhd-screening-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `adult-adhd-screening-california.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `answers/adderall-vs-vyvanse-adults.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/adderall-vs-vyvanse-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/adderall-vs-vyvanse-adults.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/adderall-vs-vyvanse-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/adderall-vs-vyvanse-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/adderall-vs-vyvanse-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/adhd-and-weight-loss-connection.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/adhd-and-weight-loss-connection.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-and-weight-loss-connection.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/adhd-and-weight-loss-connection.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/adhd-and-weight-loss-connection.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/adhd-in-women.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-in-women.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/adhd-in-women.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-in-women.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/adhd-in-women.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/adhd-in-women.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/adhd-medication-every-day.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-medication-every-day.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/adhd-medication-every-day.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-medication-every-day.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/adhd-medication-every-day.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/adhd-medication-every-day.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/adhd-medication-side-effects.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-medication-side-effects.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/adhd-medication-side-effects.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-medication-side-effects.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/adhd-medication-side-effects.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/adhd-medication-side-effects.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/adhd-vs-anxiety.html` | ADHD care &amp; evaluation | `/adhd-care` | evaluation_context | — |
| REVIEW | `answers/adhd-vs-anxiety.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-vs-anxiety.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/adhd-vs-anxiety.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-vs-anxiety.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/adhd-vs-anxiety.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/adhd-vs-anxiety.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/adhd-vs-burnout.html` | ADHD evaluation &amp; telehealth care | `/adhd-care` | evaluation_context | — |
| REVIEW | `answers/adhd-vs-burnout.html` | $199 adult ADHD evaluation | `/adhd-care` | evaluation_context | — |
| REVIEW | `answers/adhd-vs-burnout.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-vs-burnout.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/adhd-vs-burnout.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/adhd-vs-burnout.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/adhd-vs-burnout.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/adhd-vs-burnout.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/afternoon-energy-crash-after-lunch.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/afternoon-energy-crash-after-lunch.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/afternoon-energy-crash-after-lunch.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/afternoon-energy-crash-after-lunch.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/afternoon-energy-crash-after-lunch.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/asrs-adhd-screening-explained.html` | What is the difference between ADHD screening and  | `/answers/screening-vs-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/asrs-adhd-screening-explained.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/asrs-adhd-screening-explained.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/asrs-adhd-screening-explained.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/asrs-adhd-screening-explained.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/asrs-adhd-screening-explained.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/asrs-adhd-screening-explained.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/brain-fog-after-eating.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/brain-fog-after-eating.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/brain-fog-after-eating.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/brain-fog-after-eating.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/brain-fog-after-eating.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/can-adhd-be-diagnosed-online.html` | How long does an ADHD evaluation take? | `/answers/how-long-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/can-adhd-be-diagnosed-online.html` | What is included in Siya Health’s $199 ADHD evalua | `/answers/what-included-199-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/can-adhd-be-diagnosed-online.html` | Book adult ADHD evaluation | `/adhd-care` | evaluation_context | — |
| REVIEW | `answers/can-adhd-be-diagnosed-online.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/can-adhd-be-diagnosed-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/can-adhd-be-diagnosed-online.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/can-adhd-be-diagnosed-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/can-adhd-be-diagnosed-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/can-adhd-be-diagnosed-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/can-adhd-cause-anxiety.html` | ADHD evaluation | `/adhd-care` | evaluation_context | — |
| REVIEW | `answers/can-adhd-cause-anxiety.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/can-adhd-cause-anxiety.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/can-adhd-cause-anxiety.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/can-adhd-cause-anxiety.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/can-adhd-cause-anxiety.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/can-adhd-cause-anxiety.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/can-sleep-apnea-cause-fatigue.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/can-sleep-apnea-cause-fatigue.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/can-sleep-apnea-cause-fatigue.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/can-sleep-apnea-cause-fatigue.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/can-sleep-apnea-cause-fatigue.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/can-you-get-adhd-medication-online.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/can-you-get-adhd-medication-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/can-you-get-adhd-medication-online.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/can-you-get-adhd-medication-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/can-you-get-adhd-medication-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/can-you-get-adhd-medication-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/compounded-vs-branded-glp-1.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/compounded-vs-branded-glp-1.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/compounded-vs-branded-glp-1.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/compounded-vs-branded-glp-1.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/compounded-vs-branded-glp-1.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/ed-telehealth-legitimate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/ed-telehealth-legitimate.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/ed-telehealth-legitimate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/ed-telehealth-legitimate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/ed-telehealth-legitimate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/executive-dysfunction-adhd.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/executive-dysfunction-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/executive-dysfunction-adhd.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/executive-dysfunction-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/executive-dysfunction-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/executive-dysfunction-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/food-noise-returned-on-glp-1.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/food-noise-returned-on-glp-1.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/food-noise-returned-on-glp-1.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/food-noise-returned-on-glp-1.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/food-noise-returned-on-glp-1.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/fsa-hsa-adhd-evaluation.html` | What is included in Siya Health’s $199 ADHD evalua | `/answers/what-included-199-adhd-evaluation` | evaluation_context | — |
| OK | `answers/fsa-hsa-adhd-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/fsa-hsa-adhd-evaluation.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/fsa-hsa-adhd-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/fsa-hsa-adhd-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/fsa-hsa-adhd-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/glp-1-nausea-management.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/glp-1-nausea-management.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/glp-1-nausea-management.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/glp-1-nausea-management.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/glp-1-nausea-management.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/glp-1-side-effects.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/glp-1-side-effects.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/glp-1-side-effects.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/glp-1-side-effects.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/glp-1-side-effects.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/high-functioning-adhd.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/high-functioning-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/high-functioning-adhd.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/high-functioning-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/high-functioning-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/high-functioning-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/high-shbg-low-free-testosterone.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/high-shbg-low-free-testosterone.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/high-shbg-low-free-testosterone.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/high-shbg-low-free-testosterone.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/high-shbg-low-free-testosterone.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/how-long-adhd-evaluation.html` | What is included in Siya Health’s $199 ADHD evalua | `/answers/what-included-199-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/how-long-adhd-evaluation.html` | What is the difference between ADHD screening and  | `/answers/screening-vs-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/how-long-adhd-evaluation.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/how-long-adhd-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/how-long-adhd-evaluation.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/how-long-adhd-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/how-long-adhd-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/how-long-adhd-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/how-much-does-adhd-testing-cost.html` | What is included in Siya Health’s $199 ADHD evalua | `/answers/what-included-199-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/how-much-does-adhd-testing-cost.html` | Can you use FSA or HSA for ADHD evaluation? | `/answers/fsa-hsa-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/how-much-does-adhd-testing-cost.html` | What is the difference between ADHD screening and  | `/answers/screening-vs-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/how-much-does-adhd-testing-cost.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/how-much-does-adhd-testing-cost.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/how-much-does-adhd-testing-cost.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/how-much-does-adhd-testing-cost.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/how-much-does-adhd-testing-cost.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/how-much-does-adhd-testing-cost.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/how-online-prescriptions-work.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/how-online-prescriptions-work.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/how-online-prescriptions-work.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/how-online-prescriptions-work.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/how-online-prescriptions-work.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/index.html` | Schedule Consultation → | `/weight-loss-metabolic-health` | service_explore | — |
| REVIEW | `answers/index.html` | Schedule Consultation → | `/telehealth` | service_explore | — |
| REVIEW | `answers/index.html` | Schedule Consultation → | `/mens-health-longevity` | service_explore | — |
| REVIEW | `answers/index.html` | How long does an ADHD evaluation take? | `/answers/how-long-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/index.html` | Schedule Consultation → | `/adhd-care` | service_explore | — |
| REVIEW | `answers/index.html` | What is the difference between ADHD screening and  | `/answers/screening-vs-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/index.html` | Schedule Consultation → | `/telehealth` | service_explore | — |
| REVIEW | `answers/index.html` | Can you use FSA or HSA for ADHD evaluation? | `/answers/fsa-hsa-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/index.html` | What is included in Siya Health’s $199 ADHD evalua | `/answers/what-included-199-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/insulin-resistance-without-diabetes.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/insulin-resistance-without-diabetes.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/insulin-resistance-without-diabetes.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/insulin-resistance-without-diabetes.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/insulin-resistance-without-diabetes.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/is-adhd-medication-safe-long-term.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/is-adhd-medication-safe-long-term.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/is-adhd-medication-safe-long-term.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/is-adhd-medication-safe-long-term.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/is-adhd-medication-safe-long-term.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/is-adhd-medication-safe-long-term.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/is-online-adhd-diagnosis-legitimate.html` | Adult ADHD evaluation | `/adhd-care` | evaluation_context | — |
| REVIEW | `answers/is-online-adhd-diagnosis-legitimate.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/is-online-adhd-diagnosis-legitimate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/is-online-adhd-diagnosis-legitimate.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/is-online-adhd-diagnosis-legitimate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/is-online-adhd-diagnosis-legitimate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/is-online-adhd-diagnosis-legitimate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/is-telehealth-legitimate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/is-telehealth-legitimate.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/is-telehealth-legitimate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/is-telehealth-legitimate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/is-telehealth-legitimate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/late-adhd-diagnosis-adults.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/late-adhd-diagnosis-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/late-adhd-diagnosis-adults.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/late-adhd-diagnosis-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/late-adhd-diagnosis-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/late-adhd-diagnosis-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/medical-weight-loss-vs-dieting.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/medical-weight-loss-vs-dieting.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/medical-weight-loss-vs-dieting.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/medical-weight-loss-vs-dieting.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/medical-weight-loss-vs-dieting.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/meet-and-greet-telehealth-expectations.html` | What is included in Siya Health’s $199 ADHD evalua | `/answers/what-included-199-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/meet-and-greet-telehealth-expectations.html` | Adult ADHD evaluation | `/adhd-care` | evaluation_context | — |
| OK | `answers/meet-and-greet-telehealth-expectations.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/meet-and-greet-telehealth-expectations.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/meet-and-greet-telehealth-expectations.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/meet-and-greet-telehealth-expectations.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/meet-and-greet-telehealth-expectations.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/normal-a1c-insulin-resistance.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/normal-a1c-insulin-resistance.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/normal-a1c-insulin-resistance.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/normal-a1c-insulin-resistance.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/normal-a1c-insulin-resistance.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/oral-vs-topical-minoxidil.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/oral-vs-topical-minoxidil.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/oral-vs-topical-minoxidil.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/oral-vs-topical-minoxidil.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/oral-vs-topical-minoxidil.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/poor-sleep-feels-like-adhd.html` | ADHD evaluation &amp; telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `answers/poor-sleep-feels-like-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/poor-sleep-feels-like-adhd.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/poor-sleep-feels-like-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/poor-sleep-feels-like-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/poor-sleep-feels-like-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/rejection-sensitivity-adhd.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/rejection-sensitivity-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/rejection-sensitivity-adhd.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/rejection-sensitivity-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/rejection-sensitivity-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/rejection-sensitivity-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/screening-vs-adhd-evaluation.html` | How long does an ADHD evaluation take? | `/answers/how-long-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/screening-vs-adhd-evaluation.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/screening-vs-adhd-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/screening-vs-adhd-evaluation.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/screening-vs-adhd-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/screening-vs-adhd-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/screening-vs-adhd-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/semaglutide-weight-loss-how-it-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/semaglutide-weight-loss-how-it-works.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/semaglutide-weight-loss-how-it-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/semaglutide-weight-loss-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/semaglutide-weight-loss-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/signs-of-adult-adhd.html` | How long does an ADHD evaluation take? | `/answers/how-long-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/signs-of-adult-adhd.html` | ADHD evaluation &amp; care | `/adhd-care` | evaluation_context | — |
| REVIEW | `answers/signs-of-adult-adhd.html` | $199 comprehensive evaluation | `/adhd-care` | evaluation_context | — |
| REVIEW | `answers/signs-of-adult-adhd.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/signs-of-adult-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/signs-of-adult-adhd.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/signs-of-adult-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/signs-of-adult-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/signs-of-adult-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/signs-of-sleep-apnea-in-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/signs-of-sleep-apnea-in-adults.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/signs-of-sleep-apnea-in-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/signs-of-sleep-apnea-in-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/signs-of-sleep-apnea-in-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/starting-adhd-medication-adults.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/starting-adhd-medication-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/starting-adhd-medication-adults.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/starting-adhd-medication-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/starting-adhd-medication-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/starting-adhd-medication-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/telehealth-adhd-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/telehealth-adhd-california.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/telehealth-adhd-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/telehealth-adhd-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/telehealth-adhd-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/telehealth-adhd-texas.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/telehealth-adhd-texas.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/telehealth-adhd-texas.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/telehealth-adhd-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/telehealth-adhd-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/testosterone-and-adhd-overlap.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/testosterone-and-adhd-overlap.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/testosterone-and-adhd-overlap.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/testosterone-and-adhd-overlap.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/testosterone-and-adhd-overlap.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/time-blindness-adhd.html` | Explore ADHD evaluation pathways | `/adhd-care` | evaluation_context | — |
| OK | `answers/time-blindness-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/time-blindness-adhd.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/time-blindness-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/time-blindness-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/time-blindness-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/trt-monitoring-requirements.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/trt-monitoring-requirements.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/trt-monitoring-requirements.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/trt-monitoring-requirements.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/trt-monitoring-requirements.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/weight-gain-after-stopping-ozempic.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/weight-gain-after-stopping-ozempic.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/weight-gain-after-stopping-ozempic.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/weight-gain-after-stopping-ozempic.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/weight-gain-after-stopping-ozempic.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-does-low-testosterone-feel-like.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/what-does-low-testosterone-feel-like.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/what-does-low-testosterone-feel-like.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/what-does-low-testosterone-feel-like.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-does-low-testosterone-feel-like.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `answers/what-included-199-adhd-evaluation.html` | How long does an ADHD evaluation take? | `/answers/how-long-adhd-evaluation` | evaluation_context | — |
| REVIEW | `answers/what-included-199-adhd-evaluation.html` | What is the difference between ADHD screening and  | `/answers/screening-vs-adhd-evaluation` | evaluation_context | — |
| OK | `answers/what-included-199-adhd-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/what-included-199-adhd-evaluation.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/what-included-199-adhd-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/what-included-199-adhd-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-included-199-adhd-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-is-food-noise.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/what-is-food-noise.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/what-is-food-noise.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/what-is-food-noise.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-is-food-noise.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-is-free-testosterone.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/what-is-free-testosterone.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/what-is-free-testosterone.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/what-is-free-testosterone.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-is-free-testosterone.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-is-insulin-resistance.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/what-is-insulin-resistance.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/what-is-insulin-resistance.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/what-is-insulin-resistance.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/what-is-insulin-resistance.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/when-is-testosterone-therapy-appropriate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/when-is-testosterone-therapy-appropriate.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/when-is-testosterone-therapy-appropriate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/when-is-testosterone-therapy-appropriate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/when-is-testosterone-therapy-appropriate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/who-qualifies-glp-1-weight-loss.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/who-qualifies-glp-1-weight-loss.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/who-qualifies-glp-1-weight-loss.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/who-qualifies-glp-1-weight-loss.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/who-qualifies-glp-1-weight-loss.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/why-am-i-tired-even-after-sleeping.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/why-am-i-tired-even-after-sleeping.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/why-am-i-tired-even-after-sleeping.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/why-am-i-tired-even-after-sleeping.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/why-am-i-tired-even-after-sleeping.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/why-normal-labs-dont-mean-healthy.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `answers/why-normal-labs-dont-mean-healthy.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `answers/why-normal-labs-dont-mean-healthy.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `answers/why-normal-labs-dont-mean-healthy.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `answers/why-normal-labs-dont-mean-healthy.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adderall-for-adhd-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adderall-for-adhd-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adderall-for-adhd-how-it-works.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/adderall-for-adhd-how-it-works.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adderall-for-adhd-how-it-works.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/adderall-for-adhd-how-it-works.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adderall-for-adhd-how-it-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adderall-for-adhd-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adderall-for-adhd-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-evaluation-california-online-vs-in-person.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-evaluation-california-online-vs-in-person.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-evaluation-california-online-vs-in-person.html` | screening versus full ADHD evaluation distinctions | `/blog/adhd-testing-online-california-screenin…` | evaluation_context | — |
| OK | `blog/adhd-evaluation-california-online-vs-in-person.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-evaluation-california-online-vs-in-person.html` | ADHD Testing Online in California: Screening vs Fu | `/blog/adhd-testing-online-california-screenin…` | evaluation_context | — |
| REVIEW | `blog/adhd-evaluation-california-online-vs-in-person.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-evaluation-california-online-vs-in-person.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-evaluation-california-online-vs-in-person.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-evaluation-california-online-vs-in-person.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-evaluation-california-online-vs-in-person.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-evaluation-california-online-vs-in-person.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-evaluation-cost-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-evaluation-cost-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-evaluation-cost-texas.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/adhd-evaluation-cost-texas.html` | Can you use FSA or HSA for ADHD evaluation? | `/answers/fsa-hsa-adhd-evaluation` | evaluation_context | — |
| REVIEW | `blog/adhd-evaluation-cost-texas.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-evaluation-cost-texas.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/adhd-evaluation-cost-texas.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-evaluation-cost-texas.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-evaluation-cost-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-evaluation-cost-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-daily-or-as-needed-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-daily-or-as-needed-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-medication-daily-or-as-needed-adults.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-daily-or-as-needed-adults.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/adhd-medication-daily-or-as-needed-adults.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-daily-or-as-needed-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-medication-daily-or-as-needed-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-daily-or-as-needed-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-online-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-online-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-online-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-medication-online-california.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-online-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-online-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-medication-online-california.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-online-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-medication-online-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-online-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-options-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-options-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-options-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-medication-options-california.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-options-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-options-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-medication-options-california.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-options-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-medication-options-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-options-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-options-for-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-options-for-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-medication-options-for-adults.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/adhd-medication-options-for-adults.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-options-for-adults.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/adhd-medication-options-for-adults.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-options-for-adults.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-medication-options-for-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-options-for-adults.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-side-effects-what-to-expect.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-side-effects-what-to-expect.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-medication-side-effects-what-to-expect.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/adhd-medication-side-effects-what-to-expect.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-side-effects-what-to-expect.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/adhd-medication-side-effects-what-to-expect.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-medication-side-effects-what-to-expect.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-medication-side-effects-what-to-expect.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-medication-side-effects-what-to-expect.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-symptoms-overlooked.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-symptoms-overlooked.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-symptoms-overlooked.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/adhd-symptoms-overlooked.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-symptoms-overlooked.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/adhd-symptoms-overlooked.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-symptoms-overlooked.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-symptoms-overlooked.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-symptoms-overlooked.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-telehealth-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-telehealth-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-telehealth-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-telehealth-california.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-telehealth-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-telehealth-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-telehealth-california.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-telehealth-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-telehealth-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-telehealth-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | online vs in-person evaluation | `/blog/adhd-evaluation-california-online-vs-in…` | evaluation_context | — |
| OK | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | What is the difference between ADHD screening and  | `/answers/screening-vs-adhd-evaluation` | evaluation_context | — |
| REVIEW | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd-testing-online-california-screening-vs-evaluation.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adhd.html` | evaluation pricing context | `/pricing` | evaluation_context | — |
| REVIEW | `blog/adhd.html` | ADHD Evaluation: Online vs In-Person (CA) | `/blog/adhd-evaluation-california-online-vs-in…` | evaluation_context | — |
| REVIEW | `blog/adhd.html` | Screening vs Full Evaluation | `/blog/adhd-testing-online-california-screenin…` | evaluation_context | — |
| REVIEW | `blog/adhd.html` | ADHD Evaluation Cost in Texas | `/blog/adhd-evaluation-cost-texas` | evaluation_context | — |
| REVIEW | `blog/adhd.html` | ADHD evaluation &amp; care at Siya Health | `/adhd-care` | evaluation_context | — |
| REVIEW | `blog/adhd.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-symptoms-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-symptoms-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adult-adhd-symptoms-california.html` | online screening versus full evaluation in Califor | `/blog/adhd-testing-online-california-screenin…` | evaluation_context | — |
| OK | `blog/adult-adhd-symptoms-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adult-adhd-symptoms-california.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adult-adhd-symptoms-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-symptoms-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adult-adhd-symptoms-california.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adult-adhd-symptoms-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adult-adhd-symptoms-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-symptoms-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-treatment-california-2026.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-treatment-california-2026.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-treatment-california-2026.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adult-adhd-treatment-california-2026.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adult-adhd-treatment-california-2026.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-treatment-california-2026.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/adult-adhd-treatment-california-2026.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/adult-adhd-treatment-california-2026.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/adult-adhd-treatment-california-2026.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/adult-adhd-treatment-california-2026.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/compounded-vs-branded-glp1-medications.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/compounded-vs-branded-glp1-medications.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/compounded-vs-branded-glp1-medications.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/compounded-vs-branded-glp1-medications.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/compounded-vs-branded-glp1-medications.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/compounded-vs-branded-glp1-medications.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/compounded-vs-branded-glp1-medications.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/food-noise-and-glp-1-what-it-means-and-what-helps.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Explore men's health &amp; hormone evaluation → | `/mens-health-longevity` | evaluation_context | — |
| OK | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/free-testosterone-vs-total-testosterone-what-patients-should-know.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/glp1-side-effects-and-how-to-manage-them.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/glp1-side-effects-and-how-to-manage-them.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/glp1-side-effects-and-how-to-manage-them.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/glp1-side-effects-and-how-to-manage-them.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/glp1-side-effects-and-how-to-manage-them.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/glp1-side-effects-and-how-to-manage-them.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/glp1-side-effects-and-how-to-manage-them.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-adhd-medication-is-prescribed-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-adhd-medication-is-prescribed-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/how-adhd-medication-is-prescribed-online.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/how-adhd-medication-is-prescribed-online.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/how-adhd-medication-is-prescribed-online.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/how-adhd-medication-is-prescribed-online.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/how-adhd-medication-is-prescribed-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/how-adhd-medication-is-prescribed-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-adhd-medication-is-prescribed-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-mental-health-affects-weight-loss-outcomes.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-mental-health-affects-weight-loss-outcomes.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-mental-health-affects-weight-loss-outcomes.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/how-mental-health-affects-weight-loss-outcomes.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/how-mental-health-affects-weight-loss-outcomes.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/how-mental-health-affects-weight-loss-outcomes.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-mental-health-affects-weight-loss-outcomes.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-choose-adhd-provider-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-choose-adhd-provider-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-choose-adhd-provider-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/how-to-choose-adhd-provider-california.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/how-to-choose-adhd-provider-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-choose-adhd-provider-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/how-to-choose-adhd-provider-california.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/how-to-choose-adhd-provider-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/how-to-choose-adhd-provider-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-choose-adhd-provider-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-know-if-you-have-adhd-adult.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-know-if-you-have-adhd-adult.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/how-to-know-if-you-have-adhd-adult.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/how-to-know-if-you-have-adhd-adult.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/how-to-know-if-you-have-adhd-adult.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/how-to-know-if-you-have-adhd-adult.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/how-to-know-if-you-have-adhd-adult.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/how-to-know-if-you-have-adhd-adult.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-know-if-you-have-adhd-adult.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-safely-get-prescriptions-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/how-to-safely-get-prescriptions-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/how-to-safely-get-prescriptions-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/how-to-safely-get-prescriptions-online.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/how-to-safely-get-prescriptions-online.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/how-to-safely-get-prescriptions-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/how-to-safely-get-prescriptions-online.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/index.html` | ADHD Evaluation Cost in Texas: Full Breakdown (202 | `/blog/adhd-evaluation-cost-texas` | evaluation_context | — |
| REVIEW | `blog/index.html` | ADHD Evaluation Cost in Texas: Full Breakdown (202 | `/blog/adhd-evaluation-cost-texas` | evaluation_context | — |
| OK | `blog/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/insomnia-treatment-options-beyond-medication.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/insomnia-treatment-options-beyond-medication.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/insomnia-treatment-options-beyond-medication.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/insomnia-treatment-options-beyond-medication.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/insomnia-treatment-options-beyond-medication.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/insomnia-treatment-options-beyond-medication.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/insomnia-treatment-options-beyond-medication.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | fatigue evaluation guide | `/blog/why-am-i-always-tired-causes-when-to-se…` | evaluation_context | — |
| OK | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/insulin-resistance-and-weight-loss-clinician-overview.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/is-adhd-medication-safe-long-term.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/is-adhd-medication-safe-long-term.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/is-adhd-medication-safe-long-term.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/is-adhd-medication-safe-long-term.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/is-adhd-medication-safe-long-term.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/is-adhd-medication-safe-long-term.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/is-adhd-medication-safe-long-term.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/is-adhd-medication-safe-long-term.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/is-adhd-medication-safe-long-term.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/is-online-adhd-diagnosis-legit.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/is-online-adhd-diagnosis-legit.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/is-online-adhd-diagnosis-legit.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/is-online-adhd-diagnosis-legit.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/is-online-adhd-diagnosis-legit.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/is-online-adhd-diagnosis-legit.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/is-online-adhd-diagnosis-legit.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/is-online-adhd-diagnosis-legit.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/is-online-adhd-diagnosis-legit.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/medical-weight-loss-glp1-semaglutide-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/medical-weight-loss-glp1-semaglutide-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/medical-weight-loss-glp1-semaglutide-texas.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/medical-weight-loss-glp1-semaglutide-texas.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/medical-weight-loss-glp1-semaglutide-texas.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/medical-weight-loss-glp1-semaglutide-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/medical-weight-loss-glp1-semaglutide-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/medical-weight-loss-vs-dieting-what-actually-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/medical-weight-loss-vs-dieting-what-actually-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/medical-weight-loss-vs-dieting-what-actually-works.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/medical-weight-loss-vs-dieting-what-actually-works.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/medical-weight-loss-vs-dieting-what-actually-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/medical-weight-loss-vs-dieting-what-actually-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/medical-weight-loss-vs-dieting-what-actually-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/minoxidil-for-hair-loss-does-it-work.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/minoxidil-for-hair-loss-does-it-work.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/minoxidil-for-hair-loss-does-it-work.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/minoxidil-for-hair-loss-does-it-work.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/minoxidil-for-hair-loss-does-it-work.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/minoxidil-for-hair-loss-does-it-work.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/minoxidil-for-hair-loss-does-it-work.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/non-stimulant-adhd-medications-explained.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/non-stimulant-adhd-medications-explained.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/non-stimulant-adhd-medications-explained.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/non-stimulant-adhd-medications-explained.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/non-stimulant-adhd-medications-explained.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/non-stimulant-adhd-medications-explained.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/non-stimulant-adhd-medications-explained.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/non-stimulant-adhd-medications-explained.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/non-stimulant-adhd-medications-explained.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/online-adhd-diagnosis-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/online-adhd-diagnosis-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/online-adhd-diagnosis-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/online-adhd-diagnosis-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/online-adhd-diagnosis-california.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/online-adhd-diagnosis-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/online-adhd-diagnosis-california.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/online-adhd-diagnosis-california.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/online-adhd-diagnosis-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/online-adhd-diagnosis-california.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/online-adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/online-adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/online-adhd-diagnosis-texas.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/online-adhd-diagnosis-texas.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/online-adhd-diagnosis-texas.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `blog/online-adhd-diagnosis-texas.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/online-adhd-diagnosis-texas.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/online-adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/online-adhd-diagnosis-texas.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/oral-vs-injectable-weight-loss-medications.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/oral-vs-injectable-weight-loss-medications.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/oral-vs-injectable-weight-loss-medications.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/oral-vs-injectable-weight-loss-medications.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/oral-vs-injectable-weight-loss-medications.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/oral-vs-injectable-weight-loss-medications.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/oral-vs-injectable-weight-loss-medications.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/oral-vs-topical-minoxidil-which-is-right.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/oral-vs-topical-minoxidil-which-is-right.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/oral-vs-topical-minoxidil-which-is-right.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/oral-vs-topical-minoxidil-which-is-right.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/oral-vs-topical-minoxidil-which-is-right.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/oral-vs-topical-minoxidil-which-is-right.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/oral-vs-topical-minoxidil-which-is-right.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/phentermine-for-weight-loss-safety-and-effectiveness.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/semaglutide-for-weight-loss-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/semaglutide-for-weight-loss-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/semaglutide-for-weight-loss-how-it-works.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/semaglutide-for-weight-loss-how-it-works.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/semaglutide-for-weight-loss-how-it-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/semaglutide-for-weight-loss-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/semaglutide-for-weight-loss-how-it-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/sildenafil-for-erectile-dysfunction-what-to-expect.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/telehealth-prescriptions-how-online-treatment-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/telehealth-prescriptions-how-online-treatment-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/telehealth-prescriptions-how-online-treatment-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/telehealth-prescriptions-how-online-treatment-works.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/telehealth-prescriptions-how-online-treatment-works.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/telehealth-prescriptions-how-online-treatment-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/telehealth-prescriptions-how-online-treatment-works.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/telehealth.html` | evaluation cost context | `/pricing` | evaluation_context | — |
| REVIEW | `blog/telehealth.html` | ADHD Evaluation Cost in Texas (2026 Guide) | `/blog/adhd-evaluation-cost-texas` | evaluation_context | — |
| REVIEW | `blog/telehealth.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/telehealth.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/telehealth.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/tirzepatide-vs-semaglutide-which-is-better.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/tirzepatide-vs-semaglutide-which-is-better.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/tirzepatide-vs-semaglutide-which-is-better.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/tirzepatide-vs-semaglutide-which-is-better.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/tirzepatide-vs-semaglutide-which-is-better.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/tirzepatide-vs-semaglutide-which-is-better.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/tirzepatide-vs-semaglutide-which-is-better.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/vyvanse-vs-adderall-differences.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/vyvanse-vs-adderall-differences.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/vyvanse-vs-adderall-differences.html` | ADHD evaluation cost | `/pricing` | evaluation_context | — |
| REVIEW | `blog/vyvanse-vs-adderall-differences.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/vyvanse-vs-adderall-differences.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/vyvanse-vs-adderall-differences.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/vyvanse-vs-adderall-differences.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/vyvanse-vs-adderall-differences.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/vyvanse-vs-adderall-differences.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/weight-loss.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/weight-loss.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/weight-loss.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/weight-loss.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/weight-loss.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/weight-loss.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/when-is-testosterone-therapy-appropriate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/when-is-testosterone-therapy-appropriate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/when-is-testosterone-therapy-appropriate.html` | fatigue evaluation | `/blog/why-am-i-always-tired-causes-when-to-se…` | evaluation_context | — |
| REVIEW | `blog/when-is-testosterone-therapy-appropriate.html` | What symptoms warrant testosterone therapy evaluat | `/answers/when-is-testosterone-therapy-appropr…` | evaluation_context | — |
| REVIEW | `blog/when-is-testosterone-therapy-appropriate.html` | Symptoms that warrant TRT evaluation (FAQ) | `/answers/when-is-testosterone-therapy-appropr…` | evaluation_context | — |
| OK | `blog/when-is-testosterone-therapy-appropriate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/when-is-testosterone-therapy-appropriate.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/when-is-testosterone-therapy-appropriate.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/when-is-testosterone-therapy-appropriate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/when-is-testosterone-therapy-appropriate.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | ADHD evaluation | `/adhd-care` | evaluation_context | — |
| OK | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/why-am-i-always-tired-causes-when-to-see-doctor.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | ADHD evaluation and care | `/adhd-care` | evaluation_context | — |
| REVIEW | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | ADHD evaluation cost in Texas | `/blog/adhd-evaluation-cost-texas` | evaluation_context | — |
| REVIEW | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | ADHD evaluation and telehealth care | `/adhd-care` | evaluation_context | — |
| OK | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `book-appointment.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `book-appointment.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `book-appointment.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `book-appointment.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `book-appointment.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `book-appointment.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `book-appointment.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `book-appointment.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `creyos-adhd-testing.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `creyos-adhd-testing.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `creyos-adhd-testing.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| OK | `creyos-adhd-testing.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `creyos-adhd-testing.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `creyos-adhd-testing.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `creyos-adhd-testing.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `creyos-adhd-testing.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `index.html` | Evaluation &amp; care | `/adhd-care` | evaluation_context | — |
| REVIEW | `index.html` | ADHD evaluation &amp; care | `/adhd-care` | evaluation_context | — |
| REVIEW | `index.html` | evaluation pricing | `/pricing` | evaluation_context | — |
| OK | `index.html` | Take Free ADHD Screening | `/adhd-screening?start=asrs` | screening | `/adhd-screening` |
| REVIEW | `index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `intake/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `intake/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `intake/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `intake/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `labs.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `labs.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `labs.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `labs.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `labs.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `labs.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `labs.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `labs.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `legal/controlled-substance-treatment-agreement/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `legal/controlled-substance-treatment-agreement/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `legal/controlled-substance-treatment-agreement/index.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `legal/controlled-substance-treatment-agreement/index.html` | Book appointment | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `legal/cookie-policy/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `legal/cookie-policy/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `legal/cookie-policy/index.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `legal/cookie-policy/index.html` | Book appointment | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `legal/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `legal/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `legal/index.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `legal/index.html` | Book appointment | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `legal/notice-of-privacy-practices/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `legal/notice-of-privacy-practices/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `legal/notice-of-privacy-practices/index.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `legal/notice-of-privacy-practices/index.html` | Book appointment | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `legal/privacy-policy/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `legal/privacy-policy/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `legal/privacy-policy/index.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `legal/privacy-policy/index.html` | Book appointment | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `legal/terms-of-use/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `legal/terms-of-use/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `legal/terms-of-use/index.html` | Schedule Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `legal/terms-of-use/index.html` | Book appointment | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `mens-health-longevity.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `mens-health-longevity.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `mens-health-longevity.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `mens-health-longevity.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `mens-health-longevity.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `mens-health-longevity.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `mens-health-longevity.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `mens-health-longevity.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `mens-health-longevity.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `online-adhd-test.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `online-adhd-test.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `online-adhd-test.html` | Take Free ADHD Screening | `/adhd-screening?adhd=1` | screening | `/adhd-screening` |
| REVIEW | `online-adhd-test.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `online-adhd-test.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `online-adhd-test.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `online-adhd-test.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `prescriptions.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `prescriptions.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `prescriptions.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `prescriptions.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `prescriptions.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `prescriptions.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `prescriptions.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `prescriptions.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `pricing.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `pricing.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `primary-urgent-care.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `primary-urgent-care.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `primary-urgent-care.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `primary-urgent-care.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `primary-urgent-care.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `primary-urgent-care.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `primary-urgent-care.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `primary-urgent-care.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `primary-urgent-care.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `privacy-policy.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `privacy-policy.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `privacy-policy.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `privacy-policy.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `privacy-policy.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `privacy-policy.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `privacy-policy.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/derek-timbs.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/derek-timbs.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/derek-timbs.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/derek-timbs.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `providers/derek-timbs.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `providers/derek-timbs.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `providers/derek-timbs.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/derek-timbs.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-natasha-desai.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-natasha-desai.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-natasha-desai.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-natasha-desai.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `providers/dr-natasha-desai.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `providers/dr-natasha-desai.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `providers/dr-natasha-desai.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-natasha-desai.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-sneh-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-sneh-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-sneh-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `providers/dr-sneh-pandey.html` | See ADHD evaluation &amp; care → | `/adhd-care` | evaluation_context | — |
| REVIEW | `providers/dr-sneh-pandey.html` | ADHD evaluation &amp; care | `/adhd-care` | evaluation_context | — |
| OK | `providers/dr-sneh-pandey.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `providers/dr-sneh-pandey.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `providers/dr-sneh-pandey.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `providers/dr-sneh-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-sneh-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-swati-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-swati-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-swati-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `providers/dr-swati-pandey.html` | ADHD evaluation info → | `/adhd-care` | evaluation_context | — |
| REVIEW | `providers/dr-swati-pandey.html` | ADHD evaluation info | `/adhd-care` | evaluation_context | — |
| OK | `providers/dr-swati-pandey.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `providers/dr-swati-pandey.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `providers/dr-swati-pandey.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `providers/dr-swati-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-swati-pandey.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-vanessa-urbina.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-vanessa-urbina.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-vanessa-urbina.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-vanessa-urbina.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `providers/dr-vanessa-urbina.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `providers/dr-vanessa-urbina.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `providers/dr-vanessa-urbina.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/dr-vanessa-urbina.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `providers/index.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `providers/index.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `providers/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/index.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/megan-wunderlich.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/megan-wunderlich.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/megan-wunderlich.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `providers/megan-wunderlich.html` | screening vs evaluation | `/answers/screening-vs-adhd-evaluation` | evaluation_context | — |
| OK | `providers/megan-wunderlich.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `providers/megan-wunderlich.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `providers/megan-wunderlich.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `providers/megan-wunderlich.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/megan-wunderlich.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/wendy-delgado.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/wendy-delgado.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/wendy-delgado.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/wendy-delgado.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `providers/wendy-delgado.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `providers/wendy-delgado.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `providers/wendy-delgado.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `providers/wendy-delgado.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| REVIEW | `siya-circle.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `siya-circle.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `siya-circle.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `siya-circle.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `telehealth.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `telehealth.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `telehealth.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `telehealth.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `terms.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `terms.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `terms.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `terms.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `terms.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `terms.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `terms.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `weight-loss-metabolic-health.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `weight-loss-metabolic-health.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `weight-loss-metabolic-health.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `weight-loss-metabolic-health.html` | Start Secure Medical Chat when ready → | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `weight-loss-metabolic-health.html` | Start Secure Medical Chat when ready → | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `weight-loss-metabolic-health.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `weight-loss-metabolic-health.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `weight-loss-metabolic-health.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `weight-loss-metabolic-health.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `womens-health.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `womens-health.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `womens-health.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `womens-health.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `womens-health.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| REVIEW | `womens-health.html` | ADHD evaluation &amp; care | `/adhd-care` | evaluation_context | — |
| REVIEW | `womens-health.html` | ADHD evaluation & care | `/adhd-care` | evaluation_context | — |
| OK | `womens-health.html` | Start Secure Medical Chat | `https://spruce.care/siyahealth` | spruce_chat | `https://spruce.care/siyahealth` |
| OK | `womens-health.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
| OK | `womens-health.html` | Book Free Consultation | `https://book.carepatron.com/Siya-Health?p=X9P…` | walkthrough | `https://book.carepatron.com/Siya-Health?p=X9PN3zKZR22Fp…` |
