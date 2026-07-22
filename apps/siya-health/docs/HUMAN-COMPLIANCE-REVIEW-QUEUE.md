# Human Compliance Review Queue

**Source:** Extracted from [LEGAL-COMPLIANCE-REVIEW.md](./LEGAL-COMPLIANCE-REVIEW.md) §4.  
**Status:** Do not rewrite or delete these items without attorney/compliance sign-off.  
**Related:** Pricing standardization ($149) and CA “limited-time” language also need Ads/compliance review.

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

## Additional (from pricing / medical audits)

14. **Sitewide initial evaluation price** — Public site still shows $199 in most places while approved price is $149; CA landing already shows $149 “introductory.” Align pricing before Ads spend; verify ad copy matches landing pages.

15. **Medical review sign-offs** — See [MEDICAL-CONTENT-REVIEW-QUEUE.md](./MEDICAL-CONTENT-REVIEW-QUEUE.md). Do not fabricate `reviewedBy` / “Medically reviewed” without consent docs (prior rollback 2026-06-05).
