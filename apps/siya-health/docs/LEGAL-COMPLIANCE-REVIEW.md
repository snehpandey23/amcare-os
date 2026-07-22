# Legal & Compliance Language Review — Siya Health

**Scope:** `apps/siya-health` (169 HTML pages; audit sampled all 12 core pages, all 6 `legal/` pages, footer/chrome generators, legal-gate scripts, 5 medication-focused blog articles, 5 medication-focused answers pages, and all 4 `redirect/` pages).
**Date:** July 19, 2026
**Status:** AUDIT ONLY. No files were modified. All recommendations in this document — including removal/consolidation suggestions — are **recommendations only** and require human review. Nothing here is a legal conclusion.

All file paths are relative to `apps/siya-health/`.

## Sitewide repetition counts

Counted with exact-string search across all `*.html` files:

| Disclaimer string | Files | Occurrences |
|---|---|---|
| "For emergencies, call 911. All telehealth services are provided by licensed medical professionals in accordance with state regulations." | 31 | 31 |
| "For emergencies, call 911. All telehealth services are provided by licensed medical professionals." (short variant) | 66 | 66 |
| "For emergencies, call 911. Educational content only—not medical advice for your specific situation." | 63 | 63 |
| "Educational only:" disclaimer block | 88 | 97 |
| "Educational content informed by clinical practice patterns—not personal medical advice." | 115 | 115 |
| "educational purposes only" | 36 | 36 |
| "not medical advice" | 72 | 82 |
| "Screening is not a diagnosis" | 28 | 29 |
| "This screening is not a diagnosis." (exact) | 14 | 15 |
| "Screening is not diagnosis" (no article variant) | 11 | 13 |
| "never guaranteed" | 9 | 18 |
| "Medication is not guaranteed" | 3 | 10 |
| "This is not a medical visit, diagnosis, or treatment recommendation. No medication will be prescribed during this call." | 4 | 4 |
| "Controlled substances are not prescribed during the initial evaluation visit" | 2 | 3 |
| "Controlled Substance Agreement" footer link | 84 | 84 |
| LegitScript seal image (`static.legitscript.com/seals`) | 155 | 155 |
| "LegitScript certified" (text claim) | 11 | 11 |
| "Siya Health Inc. provides administrative and non-clinical support services…" entity statement | 7 | 10 |

Approximately 160 of 169 HTML pages carry one of the three footer emergency-notice variants (the `footer-notice` class appears on 162 pages; the remainder use custom variants).

---

## 1. Clearly necessary language (preserve)

### 1.1 Emergency / crisis lines

- **Sitewide footer notice (default variant, 31 pages)** — generated from `scripts/site-chrome.mjs` line 1000–1001 (`FOOTER_NOTICE_DEFAULT`); rendered on e.g. `index.html:663`, `adhd-care.html:793`, `legal/index.html:192`:
  > "For emergencies, call 911. All telehealth services are provided by licensed medical professionals in accordance with state regulations."
- **Short variant (66 pages)** — e.g. `adhd-screening.html:365`, `blog/adderall-for-adhd-how-it-works.html:302`:
  > "For emergencies, call 911. All telehealth services are provided by licensed medical professionals."
- **Educational variant (63 blog/answers pages)** — `scripts/site-chrome.mjs:1002–1003` (`FOOTER_NOTICE_EDUCATIONAL`); e.g. `answers/adderall-vs-vyvanse-adults.html:290`:
  > "For emergencies, call 911. Educational content only—not medical advice for your specific situation."
- **988 crisis line** — `data/providers.mjs:321–322` and rendered on `providers/dr-swati-pandey.html:247`:
  > "…Emergency mental health crises require calling 988 or 911."
- **Legal documents** — `legal/terms-of-use/index.html:66` and `legal/privacy-policy/index.html:66`:
  > "We do not provide emergency care services. If you are experiencing a mental health crisis or a medical emergency, please call 911."
- **Controlled Substance Agreement** — `legal/controlled-substance-treatment-agreement/index.html:105`:
  > "In emergencies, call 911—electronic communications are not for urgent issues."

### 1.2 Controlled-substance statements

- **No prescribing at first visit** — `index.html:514` (FAQ) and `legal/controlled-substance-treatment-agreement/index.html:72`:
  > "Medication is not guaranteed. Controlled substances are not prescribed during the initial evaluation visit. See our Controlled Substance Treatment Agreement."
- **The Controlled Substance Treatment Agreement itself** (`legal/controlled-substance-treatment-agreement/index.html:67–114`), including:
  > "Signing this agreement does not guarantee diagnosis, medication, or stimulant prescribing." (line 67)
  > "Completion of an evaluation, testing process, or follow-up visit does not guarantee a diagnosis, controlled-substance prescription, stimulant prescription, or any specific treatment recommendation." (line 76)
- **Footer link to the agreement** on ADHD-funnel pages (84 pages) — driven by `isControlledSubstanceLinkPage()` in `scripts/site-chrome.mjs:114–117`.

### 1.3 No-guarantee-of-prescription language

- **Canonical copy source** — `data/site-standards.mjs:283–290` (`ADHD_POSITIONING`):
  > "Diagnosis does not guarantee medication. Evaluation does not guarantee medication. Medication does not guarantee stimulants. Stimulant prescribing is never guaranteed."
  > "Medication, including stimulant medication, is not guaranteed and depends on clinical judgment, state law, safety considerations, and medical appropriateness."
- Rendered examples: `adhd-care.html:533, 559`; `adhd-care.html:267` ("Medication is discussed only when clinically appropriate and is never guaranteed."); `mens-health-longevity.html:332` (TRT: "…considered only when clinically appropriate—and never guaranteed."); `adult-adhd-screening-california.html:322, 393, 488`.
- **Booking legal gate (ADHD context)** — `scripts/ghl-legal-acceptance.js:31` and `intake/index.html:183`:
  > "I understand that ADHD screening tools are not diagnostic. Any diagnosis, treatment recommendation, or medication decision requires a clinical evaluation by a licensed clinician. Medication, including stimulant medication, is never guaranteed and is prescribed only when clinically appropriate and permitted by applicable law."

### 1.4 No-relationship / not-emergency clickwrap on intake

- `intake/index.html:79`, `scripts/ghl-legal-acceptance.js:29`, `data/ghl-intake-config.mjs:49`:
  > "By submitting this form, I confirm that I have read and agree to the Terms of Use, Privacy Policy, and Notice of Privacy Practices. I understand that submitting this form does not establish a physician-patient relationship, does not guarantee treatment or medication, and does not constitute emergency medical care."

### 1.5 State availability

- `data/site-standards.mjs:18–30`: `AVAILABLE_SERVICE_STATES = ['California', 'Texas', 'Pennsylvania', 'Florida']` and footer tagline. Rendered sitewide, e.g. `legal/index.html:69`:
  > "Siya Healthcare, PLLC currently provides clinical telehealth services in: California, Texas, Pennsylvania, and Florida."
- `index.html:45` FAQ schema: "California, Texas, Pennsylvania, and Florida only. All care is delivered via secure telehealth by licensed clinicians in your state."
- Provider-license caveat — `data/site-standards.mjs:228–229`, rendered on `legal/index.html:70, 102`:
  > "Provider licenses are displayed for transparency. Service availability is determined by Siya Healthcare, PLLC operational coverage."

### 1.6 Screening-is-not-diagnosis

- ASRS screener — `adhd-screening.html:116`:
  > "This is a screening tool only—not a diagnosis. A licensed provider can provide a full evaluation."
- ASRS attribution/disclaimer — `adhd-screening.html:247`:
  > "ASRS v1.1 6-Question Screener. Kessler et al. (2005). Psychological Medicine. © Harvard/NYU. This screening tool is not a diagnosis. A licensed provider can provide a full evaluation."
- Reusable block — `scripts/conversion-cleanup-content.mjs:50` (`SIYA:ADHD-SCREENING-DISCLAIMER`, injected on ADHD pages such as `adhd-care.html:96`):
  > "This screening is not a diagnosis. It is designed to help you decide whether a full ADHD evaluation may be appropriate."

### 1.7 Educational disclaimers on content pages

- Blog medication articles — e.g. `blog/adderall-for-adhd-how-it-works.html:89`:
  > "**Important:** This content is for educational purposes only and does not replace medical advice, diagnosis, or treatment. ADHD medication decisions require an in-person or telehealth evaluation with a licensed prescriber in your state. Never start, stop, or change a prescription without medical guidance."
- Answers pages — e.g. `answers/can-you-get-adhd-medication-online.html:86`:
  > "**Educational only:** This page is for general education—not personal medical advice, diagnosis, or treatment. See a licensed clinician for your situation."
- Newsletter — `siya-circle.html:99`:
  > "Siya Circle is for general education only. It does not provide diagnosis, treatment, medication advice, emergency care, or a provider-patient relationship. For personal medical concerns, schedule a visit with a licensed clinician. For emergencies, call 911."

### 1.8 HIPAA / privacy

- `legal/notice-of-privacy-practices/index.html` (full NPP, including HIPAA-covered uses of PHI for treatment, payment, operations — lines 66–103 in the content block).
- `legal/privacy-policy/index.html` (children-under-13 statement at line 72; security caveat at line 88: "…the Internet environment is not 100% secure, and we cannot guarantee that information we collect will never be accessed in an unauthorized way.").
- Clickwrap acknowledgments of Privacy Policy and NPP in the booking gate (`scripts/ghl-legal-acceptance.js:26–27`).

### 1.9 Meet & Greet is-not-a-medical-visit disclaimer

- Canonical source — `data/site-standards.mjs:87–96` (`MEET_GREET_CTA`); rendered on `book-appointment.html:116`, `adhd-screening-results.html:85, 102`, `redirect/meet-greet/index.html:55`, `redirect/adhd-walkthrough/index.html:55`:
  > "This is not a medical visit, diagnosis, or treatment recommendation. No medication will be prescribed during this call."

### 1.10 Outcome/testimonial qualifier

- `index.html:356`:
  > "Verified feedback from telehealth visits. Individual experiences vary and outcomes are not guaranteed."

---

## 2. Useful but poorly placed

1. **Screening disclaimer inside the hero** — `adhd-care.html:95–97`. The `SIYA:ADHD-SCREENING-DISCLAIMER` block sits directly under the hero CTAs, before the user has seen what the screening is. **Recommendation:** keep a one-line qualifier near the CTA and move the fuller sentence to the screening flow itself (where it already exists on `adhd-screening.html:116`).

2. **Five stacked disclaimers on the screening-results page** — `adhd-screening-results.html:84, 85, 100, 102, 109` plus a custom footer notice at line 214 ("This screening is not a diagnosis. The free intro call is not a medical visit, diagnosis, or treatment recommendation. Medication is not guaranteed. For emergencies, call 911."). The lead (line 84) and the microcopy directly beneath it (line 85) say the same thing twice within two lines. **Recommendation:** one consolidated disclaimer under the results headline, per-card microcopy trimmed to the unique point (e.g. "Medication is not guaranteed" only on the evaluation card), standard footer notice restored.

3. **Back-to-back duplicate sentence on the booking page** — `book-appointment.html:114–116`. The Meet & Greet microcopy ends "…This is not a medical visit, diagnosis, or treatment recommendation." and is immediately followed by the disclaimer beginning with the identical sentence. This comes from `site-chrome.mjs:1683–1685` rendering both `meetGreetMicrocopy` and `meetGreetDisclaimer`. **Recommendation:** render one of the two, or strip the duplicated sentence from the microcopy.

4. **Double educational disclaimer on every answers page (~115 pages)** — e.g. `answers/adderall-vs-vyvanse-adults.html:86` ("**Educational only:** This page is for general education—not personal medical advice…") followed three lines later at line 89 by "Educational content informed by clinical practice patterns—not personal medical advice." **Recommendation:** merge into a single line in the page header; keep the educational footer variant as the second touchpoint.

5. **Mid-article billing terms injected into educational content** — `scripts/site-chrome.mjs:991–994` rewrites blog copy to: "Follow-up plans start at $79/month for non-controlled medications, or $149/month for controlled-medication follow-up when clinically appropriate. See pricing." This pricing/billing sentence appears inside educational articles (confirmed across dozens of pages in `data/pricing-system-audit.json`). **Recommendation:** replace in-article pricing sentences with a short link to `/pricing`; keep the full terms on the pricing page and in the pricing strip (`scripts/conversion-cleanup-content.mjs:25–44`, whose note "Medication costs are separate. Availability may vary by state." is well placed).

6. **Landing-page disclaimer density** — `adult-adhd-screening-california.html` carries at least nine legal-adjacent statements (lines 92, 286–291, 316, 322, 393, 477, 488, 511, 525). "Medication is not guaranteed" appears four times on this single page. Each instance is individually reasonable; together they interrupt the page repeatedly. **Recommendation:** keep the hero note (line 92), the "what this screening is not" list (lines 286–291), the FAQ answers, and the footer disclaimer; retire the free-standing `lp-disclaimer` repeats at lines 393 and 511 (recommendation only — see Section 4.1 before touching ad-landing compliance copy).

7. **Legal-list bullet inside a marketing benefits list** — `index.html:196`: "**Screening is not diagnosis.** Evaluation does not guarantee medication." appears as the fourth bullet of a "why patients come" empathy list. **Recommendation:** move to the adjacent FAQ (which already covers it at `index.html:514`) or to the screening CTA microcopy, so the benefits list stays coherent.

---

## 3. Unnecessary or redundant legal-sounding language

> All items below are **recommendations only** and should be confirmed with counsel before any removal, since some repetitions may be intentional (e.g., ad-network requirements).

1. **Exact duplicated sentence, same viewport** — `book-appointment.html:114–116` and `adhd-screening-results.html:100–102` (see 2.3): "This is not a medical visit, diagnosis, or treatment recommendation." printed twice within 1–2 lines. **Recommendation:** deduplicate; zero legal meaning is lost by saying it once.

2. **Triple "not a diagnosis" on the screener page** — `adhd-screening.html:116, 242, 247`. Line 242 ("This screening is not a diagnosis.") adds nothing beyond lines 116 and 247, which both also name the path to a full evaluation. **Recommendation:** remove the line-242 microcopy; keep intro note and ASRS citation.

3. **The 115-page redundant secondary line** — "Educational content informed by clinical practice patterns—not personal medical advice." duplicates the "Educational only:" block that appears immediately above it on the same pages (88 pages) and the educational footer notice on the same pages (63 pages). That is three near-identical statements per answers page. **Recommendation:** consolidate to one header disclaimer + the footer notice.

4. **Landing-page mega-footer restating the whole page** — `adult-adhd-screening-california.html:525`:
   > "This screening is not a diagnosis and does not replace care from a licensed medical provider. For emergencies, call 911. Only a licensed medical provider can diagnose ADHD after clinical evaluation. Medication is not guaranteed. The free consultation is a non-clinical informational call and does not include diagnosis, treatment, prescriptions, or medical advice. Completing the screening does not establish a patient-provider relationship."

   Every sentence except the last already appears verbatim or near-verbatim earlier on the same page (lines 92, 291, 322, 511). **Recommendation:** keep this footer block as the page's single consolidated disclaimer and trim the mid-page repeats instead (i.e., consolidate downward, don't delete the substance).

5. **Same fact stated in three registers on the homepage** — `index.html` states medication-not-guaranteed at line 45 (FAQ schema), line 196 (benefits bullet), and line 514 (visible FAQ). The schema and visible FAQ should match (they do); the bullet is the redundant third instance. **Recommendation:** drop the bullet (see 2.7).

6. **Two competing "not diagnosis" phrasings** — "Screening is not a diagnosis" (28 files) vs. the article-less, template-sounding "Screening is not diagnosis" (11 files, e.g. `index.html:196`, `data/site-standards.mjs:289`). **Recommendation:** standardize on the grammatical version sitewide; identical meaning, less boilerplate flavor.

7. **Staccato quadruple negation in canonical copy** — `data/site-standards.mjs:283–284`:
   > "Diagnosis does not guarantee medication. Evaluation does not guarantee medication. Medication does not guarantee stimulants. Stimulant prescribing is never guaranteed."

   Four sentences that reduce to two propositions. Where rendered on marketing surfaces it reads as defensive boilerplate. **Recommendation:** consolidate the rendered copy (see rewrite 5.6); the ad-landing versions should go through Section 4 review first.

---

## 4. Requires Human Compliance Review

> **Do not delete or reword any item in this section without attorney/compliance sign-off.** These are flagged because necessity or accuracy is legally uncertain, not because they are wrong.

1. **Controlled-substance advertising language on SEO/geo pages.** FAQ schema on `adhd-diagnosis-texas.html:39` answers "Do you prescribe stimulants?" with "Stimulant prescribing is never guaranteed. When clinically appropriate after evaluation, providers discuss all options…". Similar Q&A exists across geo pages and blog articles about Adderall/Vyvanse/stimulants (e.g., `blog/adderall-for-adhd-how-it-works.html`, `answers/adderall-vs-vyvanse-adults.html`). Whether naming controlled substances in indexed marketing/FAQ schema is acceptable under LegitScript certification standards and state advertising rules needs professional review.

2. **Ryan Haight / telehealth-prescribing statements and their currency.** `blog/how-adhd-medication-is-prescribed-online.html` (meta line 16 references "Ryan Haight context"; body lines 112–116) states federal telehealth flexibilities "sometimes expiring or changing" and describes PDMP checks. These regulatory descriptions are time-sensitive; counsel should confirm they reflect the rules in force in 2026 for CA, TX, PA, FL.

3. **"Board-certified providers" claims with a mixed roster.** The sitewide footer tagline (`data/site-standards.mjs:30`, rendered on ~all pages, e.g. `legal/index.html:168`) says "Board-certified providers providing telehealth care across California, Texas, Pennsylvania, and Florida," while the codebase itself acknowledges the roster includes NPs/PAs (`data/site-standards.mjs:32–33`: "avoid implying all clinicians are board-certified physicians"). Whether the footer phrasing overstates credentials is a compliance/advertising question. Related: automated state-claim rewrites in `scripts/site-chrome.mjs:876–878` ("Licensed in…" replacements).

4. **LegitScript seal and text claims.** Seal image on 155 pages (seal ID 46197681, e.g. `scripts/site-chrome.mjs:1054`) and "LegitScript certified" text on 11 pages (`about.html:278`, `adult-adhd-screening-california.html:87`). Verify certification status is current and that seal usage/placement complies with LegitScript's display terms.

5. **HIPAA-compliant badge/claims.** `hipaa-compliant.png` badge sitewide plus text claims ("HIPAA-compliant telehealth" on `adhd-care.html:117` etc., and `BRAND_PILLARS` in `data/site-standards.mjs:169`). "HIPAA-compliant" as a marketing badge is a representation counsel should confirm, particularly given item 12 below.

6. **Refund/cancellation terms.** `legal/terms-of-use/index.html:94`:
   > "No Refunds. YOU ACKNOWLEDGE AND AGREE THAT DUE TO THE NATURE OF THE SERVICES, ANY APPLICABLE FEES AND OTHER CHARGES ARE NOT REFUNDABLE IN WHOLE OR IN PART. YOU ARE FULLY LIABLE FOR ALL CHARGES TO YOUR ACCOUNT, INCLUDING ANY UNAUTHORIZED CHARGES."

   The "including any unauthorized charges" clause, the no-refund rule for healthcare fees, and the absence of a consumer-facing cancellation policy page are attorney matters (CA consumer law in particular).

7. **Age restrictions.** `legal/terms-of-use/index.html:76` permits use by anyone "at least 13 years of age," with parental acceptance for minors, while all clinical marketing is adult-focused ("adult ADHD evaluation") and no marketing page states an 18+ requirement (zero occurrences of "18+"/"age 18" in HTML). Whether an adult-only telehealth practice needs an explicit age gate, and whether the 13+ terms language fits, requires legal review.

8. **Arbitration clause.** `legal/terms-of-use/index.html:68` (all-caps mandatory arbitration notice) with Delaware venue (line ~135) and AAA consumer rules. Enforceability in a healthcare context across CA/TX/PA/FL is an attorney question; preserve as-is.

9. **Referenced-but-unpublished informed-consent documents.** `legal/terms-of-use/index.html:79` tells patients about "the informed consent to treatment provisions you will be separately required to acknowledge," yet the registry `data/legal-documents.mjs` marks both `telehealth-consent` (lines 81–86) and `prescription-policy` (lines 103–108) as `PLANNED`, and no HTML page links to `/legal/telehealth-consent` or `/legal/prescription-policy` (zero matches). Compliance should confirm where telehealth informed consent is actually captured (presumably inside the EHR/intake flow) and whether the site needs the published document.

10. **Corporate-practice-of-medicine entity split.** `data/site-standards.mjs:14–15` / `legal/index.html:65, 100`: "Siya Health Inc. provides administrative and non-clinical support services. Medical services are provided by Siya Healthcare, PLLC through licensed clinicians." Placement and sufficiency of this friendly-PC disclosure (7 pages) is a legal-structure question — preserve verbatim.

11. **California introductory price claim.** `adult-adhd-screening-california.html:36` (FAQ schema): "The initial adult ADHD evaluation is $149 for new California patients (regularly $199) as a limited-time introductory offer." This conflicts with the $199 price stated sitewide (`data/site-standards.mjs:41–48`) and "limited-time" offers carry advertising-law obligations. Needs review for accuracy and expiry.

12. **Cookie/consent posture.** `legal/cookie-policy/index.html:43, 4`: "If you click Accept, we store your acknowledgment in localStorage… This does not block access to the site." and "We do not operate a fully functional consent-management platform (CMP)… You may control cookies through your browser settings." Meanwhile GTM loads in `<head>` on every page including legal pages (`legal/index.html:5–11`). CCPA/CPRA (California traffic) review recommended; the candid CMP admission itself is language counsel should own.

13. **"Non-clinical" Meet & Greet characterization.** The free call is repeatedly described as "not a medical visit" and "non-clinical" (`data/site-standards.mjs:85–96`, `adult-adhd-screening-california.html:477`). Whether a call operated by a medical practice's care team can be characterized this way (and its interaction with the physician-patient-relationship disclaimers) is a compliance judgment — preserve pending review.

---

## 5. Tone rewrites (meaning-preserving) — *all pending attorney sign-off*

Each rewrite is intended to preserve the legal substance exactly; none may ship without counsel approval.

1. **`index.html:196`**
   - Current: "**Screening is not diagnosis.** Evaluation does not guarantee medication."
   - Rewrite: "A screening isn't a diagnosis — and completing an evaluation doesn't mean medication will be prescribed."

2. **`data/site-standards.mjs:94–95` (Meet & Greet disclaimer, rendered on 4+ pages)**
   - Current: "This is not a medical visit, diagnosis, or treatment recommendation. No medication will be prescribed during this call."
   - Rewrite: "This free call is for questions and planning only. It isn't a medical visit — no diagnosis, treatment advice, or prescriptions happen here."

3. **`scripts/site-chrome.mjs:1000–1001` (default footer notice, ~97 pages across both variants)**
   - Current: "For emergencies, call 911. All telehealth services are provided by licensed medical professionals in accordance with state regulations."
   - Rewrite: "In an emergency, call 911. Care at Siya Health comes from licensed clinicians and follows the laws of your state."

4. **`scripts/ghl-legal-acceptance.js:29` (booking gate confirmation)**
   - Current: "By submitting this form, I confirm that I have read and agree to the Terms of Use, Privacy Policy, and Notice of Privacy Practices. I understand that submitting this form does not establish a physician-patient relationship, does not guarantee treatment or medication, and does not constitute emergency medical care."
   - Rewrite: "By submitting, I confirm I've read and agree to the Terms of Use, Privacy Policy, and Notice of Privacy Practices. I understand that sending this form doesn't make me a patient yet, doesn't guarantee treatment or medication, and isn't a way to get emergency care."

5. **`scripts/ghl-legal-acceptance.js:31` (ADHD gate disclaimer)**
   - Current: "I understand that ADHD screening tools are not diagnostic. Any diagnosis, treatment recommendation, or medication decision requires a clinical evaluation by a licensed clinician. Medication, including stimulant medication, is never guaranteed and is prescribed only when clinically appropriate and permitted by applicable law."
   - Rewrite: "I understand a screening can't diagnose ADHD — only a licensed clinician can, after a full evaluation. Medication (including stimulants) is never guaranteed; it's prescribed only when it's clinically appropriate and allowed by law."

6. **`data/site-standards.mjs:283–284` (medication non-guarantee, rendered on ADHD pages)**
   - Current: "Diagnosis does not guarantee medication. Evaluation does not guarantee medication. Medication does not guarantee stimulants. Stimulant prescribing is never guaranteed."
   - Rewrite: "Neither an evaluation nor a diagnosis guarantees medication — and if medication is prescribed, it won't necessarily be a stimulant. Stimulant prescribing is never guaranteed."

7. **`blog/adderall-for-adhd-how-it-works.html:89` (blog medication disclaimer, similar block on ~36 pages)**
   - Current: "**Important:** This content is for educational purposes only and does not replace medical advice, diagnosis, or treatment. ADHD medication decisions require an in-person or telehealth evaluation with a licensed prescriber in your state. Never start, stop, or change a prescription without medical guidance."
   - Rewrite: "**A note before you read:** This article is education, not medical advice. Decisions about ADHD medication belong in an evaluation with a licensed prescriber in your state — please don't start, stop, or change a prescription on your own."

8. **`adult-adhd-screening-california.html:525` (landing-page footer disclaimer)**
   - Current: "This screening is not a diagnosis and does not replace care from a licensed medical provider. For emergencies, call 911. Only a licensed medical provider can diagnose ADHD after clinical evaluation. Medication is not guaranteed. The free consultation is a non-clinical informational call and does not include diagnosis, treatment, prescriptions, or medical advice. Completing the screening does not establish a patient-provider relationship."
   - Rewrite: "This screening is educational — it isn't a diagnosis, and taking it doesn't make you a patient. Only a licensed provider can diagnose ADHD, after a clinical evaluation, and medication is never guaranteed. The free consultation is an informational call, not a medical visit. In an emergency, call 911."

9. **`legal/terms-of-use/index.html:78` (informational-content clause — final sentence only; the ALL-CAPS reliance sentence is counsel's to restyle)**
   - Current: "The content of the Site is not a substitute for professional medical advice, diagnosis or treatment. Never disregard professional medical advice or delay in seeking it because of something you have read on the Site."
   - Rewrite: "What you read on this site is no substitute for advice, diagnosis, or treatment from your own clinician — please don't ignore or delay professional medical advice because of something you read here."

10. **`adhd-screening-results.html:214` (custom footer notice)**
    - Current: "This screening is not a diagnosis. The free intro call is not a medical visit, diagnosis, or treatment recommendation. Medication is not guaranteed. For emergencies, call 911."
    - Rewrite: "Your screening result isn't a diagnosis, and the free intro call isn't a medical visit — no diagnosis or prescriptions happen there. Medication is never guaranteed. In an emergency, call 911."

---

## Method notes

- Grep patterns covered: "not a substitute", "911", "988", "emergency", "crisis", "controlled substance", "no guarantee", "not guaranteed", "informed consent", "HIPAA", "disclaimer", "educational purposes", "does not establish", "physician-patient relationship", "results may vary" (0 hits), "individual results" (3 files, all clinically framed, e.g. `blog/semaglutide-for-weight-loss-how-it-works.html:112`).
- Blog sample: `adderall-for-adhd-how-it-works`, `glp1-side-effects-and-how-to-manage-them`, `how-adhd-medication-is-prescribed-online`, `medical-weight-loss-glp1-semaglutide-texas`, `is-adhd-medication-safe-long-term`.
- Answers sample: `adderall-vs-vyvanse-adults`, `can-you-get-adhd-medication-online`, `semaglutide-weight-loss-how-it-works`, `when-is-testosterone-therapy-appropriate`, `trt-monitoring-requirements`.
- Redirect pages: only `redirect/meet-greet` and `redirect/adhd-walkthrough` carry disclaimer text (identical Meet & Greet language); `redirect/chat` and `redirect/adhd-evaluation` carry none.
- Because most disclaimers are generated from `scripts/site-chrome.mjs`, `scripts/conversion-cleanup-content.mjs`, `data/site-standards.mjs`, and `data/ghl-intake-config.mjs`, any approved wording change should be made in those source files, not in individual HTML pages.

---

Two findings worth highlighting beyond the sections: the Terms reference a telehealth informed-consent document that is registered as `PLANNED` and unpublished (Section 4.9), and the heaviest redundancy is structural — every answers page carries three overlapping educational disclaimers generated by the chrome scripts, so one source-file change would clean up ~115 pages at once.
