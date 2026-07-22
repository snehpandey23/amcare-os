# Website Funnel QA Checklist

## Purpose

This checklist is used before major website changes, campaign launches, CTA updates, and paid traffic increases.

The goal is to confirm that users can move through the website without broken links, confusing CTAs, missing disclaimers, or tracking gaps.

---

## Main Conversion Paths

| Page / Area                  | Item to Check                                 | Expected Result                                              | Status | Issue | Owner |
| ---------------------------- | --------------------------------------------- | ------------------------------------------------------------ | ------ | ----- | ----- |
| Homepage                     | Book Free Meet & Greet works                  | Opens `/redirect/meet-greet` → CarePatron Meet & Greet booking (NOT Spruce) | TBD    |       |       |
| Homepage                     | Meet & Greet disclaimer visible where used    | States not a medical visit / no meds on this call                         | TBD    |       |       |
| Homepage                     | Start Secure Medical Chat is not primary       | Chat is support/footer only — not hero primary                             | TBD    |       |       |
| Homepage                     | Explore Care Options works                    | Opens care options / relevant section                        | TBD    |       |       |
| Homepage                     | Zocdoc remains secondary                      | Present as secondary booking only, not primary                             | TBD    |       |       |
| Homepage                     | Pricing link works                            | Opens pricing page                                           | TBD    |       |       |
| Homepage                     | Mobile layout checked                         | Hero, CTAs, navigation, and footer display correctly         | TBD    |       |       |
| Homepage                     | Desktop layout checked                        | Main sections and CTAs display correctly                     | TBD    |       |       |
| ADHD page                    | Take Free ADHD Screening works                | Opens ADHD screening flow                                    | TBD    |       |       |
| ADHD page                    | Screening hierarchy preserved                 | Primary screening → secondary Meet & Greet → high-intent evaluation | TBD    |       |       |
| ADHD page                    | Book Free Meet & Greet opens correct booking link | Opens CarePatron Meet & Greet via `/redirect/meet-greet` (legacy walkthrough path OK on CA ads LP) | TBD    |       |       |
| ADHD page                    | Meet & Greet disclaimer visible near CTA        | Disclaimer states not a medical visit or diagnosis | TBD    |       |       |
| ADHD page                    | Pricing link works                            | Opens pricing page                                           | TBD    |       |       |
| ADHD page                    | Screening disclaimer visible                  | Disclaimer clearly states screening is not a diagnosis       | TBD    |       |       |
| ADHD page                    | Medication disclaimer visible where relevant  | Page does not imply medication is guaranteed                 | TBD    |       |       |
| ADHD page                    | Mobile layout checked                         | CTA path is easy to use on mobile                            | TBD    |       |       |
| ADHD screening/results flow  | Screening starts                              | User can begin screening                                     | TBD    |       |       |
| ADHD screening/results flow  | Screening completion event fires              | `adhd_screening_complete` (and legacy `screening_complete`) fire before navigation | TBD    |       |       |
| ADHD screening/results flow  | Redirect after screening                      | User is redirected to `/adhd-screening-results`              | TBD    |       |       |
| ADHD screening/results flow  | Results page view event                       | `/adhd-screening-results` fires `adhd_screening_results_view` | TBD    |       |       |
| ADHD screening/results flow  | Results next-step CTAs work                   | Book Free Meet & Greet → `/redirect/meet-greet`; Start ADHD Evaluation → `/redirect/adhd-evaluation`; Start Secure Medical Chat → `/redirect/chat` | TBD    |       |       |
| ADHD screening/results flow  | Same-page booking panel removed               | Screening page no longer presents intro-call/eval booking as the post-complete state | TBD    |       |       |
| ADHD screening/results flow  | Disclaimers visible on results page           | Non-diagnostic + Meet & Greet process disclaimer; no meds on Meet & Greet; medication not guaranteed near eval CTA | TBD    |       |       |
| ADHD screening/results flow  | Zocdoc not primary in this flow               | No Zocdoc CTA on `/adhd-screening-results`                   | TBD    |       |       |
| ADHD screening/results flow  | Existing redirect pages still work            | `/redirect/meet-greet`, `/redirect/adhd-walkthrough`, `/redirect/adhd-evaluation`, `/redirect/chat` load | TBD    |       |       |
| ADHD screening/results flow  | CA ads landing hierarchy unchanged            | Screening → Meet & Greet → evaluation order preserved on CA LP | TBD    |       |       |
| Weight loss / metabolic page | Book Free Meet & Greet works                  | Opens Meet & Greet booking                                   | TBD    |       |       |
| Weight loss / metabolic page | View Pricing works                            | Opens pricing page                                           | TBD    |       |       |
| Weight loss / metabolic page | Secure chat is not primary                    | Chat not dominating hero                                     | TBD    |       |       |
| Weight loss / metabolic page | State availability language checked           | Availability is accurate and not overclaimed                 | TBD    |       |       |
| Weight loss / metabolic page | Medication language checked                   | Page does not imply GLP-1s or controlled meds are guaranteed | TBD    |       |       |
| Weight loss / metabolic page | Mobile layout checked                         | CTA path is easy to use on mobile                            | TBD    |       |       |
| Blog                         | ADHD blog CTA links work                      | Opens ADHD screening / ADHD care page                        | TBD    |       |       |
| Blog                         | Weight/metabolic blog CTA links work          | Opens Meet & Greet / relevant service page                   | TBD    |       |       |
| Blog                         | Internal service links work                   | Links open correct service pages                             | TBD    |       |       |
| Blog                         | Article title and URL match                   | Article content matches title, slug, and meta intent         | TBD    |       |       |
| Blog                         | CTA does not feel spammy                      | CTA placement feels natural                                  | TBD    |       |       |
| Pricing page                 | Book Free Meet & Greet works                  | Opens Meet & Greet booking                                   | TBD    |       |       |
| Pricing page                 | Explore Care Options works                    | Opens care options / service navigation                      | TBD    |       |       |
| Pricing page                 | Pricing numbers checked                       | $199 / $79 / $149 pricing is accurate                        | TBD    |       |       |
| Footer / Navigation          | Pricing link works                            | Opens pricing page                                           | TBD    |       |       |
| Footer / Navigation          | Contact / chat link works                     | Opens correct destination                                    | TBD    |       |       |
| Footer / Navigation          | No duplicate Secure Chat labels               | Single secure chat CTA in footer brand bar                   | TBD    |       |       |
| Footer / Navigation          | Service links work                            | Opens correct service pages                                  | TBD    |       |       |
| Footer / Navigation          | State/service language is consistent          | CA, TX, PA, FL language is accurate                          | TBD    |       |       |
| Tracking                     | GA4 page view visible                         | Page visit appears in GA4 debug/realtime                     | TBD    |       |       |
| Tracking                     | meet_greet_click visible                      | CTA event appears in GA4/GTM if configured                   | TBD    |       |       |
| Tracking                     | Conversion event visible                      | Conversion event appears where applicable                    | TBD    |       |       |
| Tracking                     | Google Ads conversion path checked            | Paid traffic path can be measured                            | TBD    |       |       |

---

## Final QA Summary

| Item                       | Result |
| -------------------------- | ------ |
| Date reviewed              | TBD    |
| Reviewed by                | TBD    |
| Pages checked              | TBD    |
| Critical issues found      | TBD    |
| Issues fixed before launch | TBD    |
| Issues deferred            | TBD    |
| Approved for deployment?   | TBD    |

---

## Notes

* Do not approve deployment if the main CTA path is broken.
* Do not approve paid traffic scaling if conversion tracking is unclear.
* Do not approve ADHD pages if the screening disclaimer is missing.
* Do not approve medication-related pages if copy implies guaranteed medication or guaranteed outcomes.
* Document all unresolved issues before deployment.
