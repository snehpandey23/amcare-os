# Disclaimer placement audit (report only — hold removals for compliance)

_No disclaimer text deleted in this pass. Flags are placement/relevance recommendations only. Hold for compliance sign-off before removing anything from a specific page._

## Scope

Searched sitewide HTML (excluding `brand/`, `docs/`, `previews/`) for:

1. Screening ≠ diagnosis phrasing (`screening is not a diagnosis`, `screening tool only—not a diagnosis`, etc.)
2. Related “starting point, not a diagnosis” lines
3. Sitewide footer/nav **“Free ADHD screening”** links on non-ADHD pages (co-located clutter, not the disclaimer itself)

## Executive finding

**True out-of-path “screening ≠ diagnosis” body copy is rare.** Nearly all instances sit on ADHD screening, ADHD care/city, ADHD evaluation LPs, homepage FAQ, or ADHD blogs with a screening CTA — i.e. **relevant**.

What *does* sprawl sitewide is the **footer Care & Services link to Free ADHD screening** on weight-loss, women’s health, labs, employers, provider bios, etc. That is a **nav/footer architecture** issue (not a deleted disclaimer), but it is what makes screening language feel “everywhere.”

| Class | Count | Action |
|---|---|---|
| KEEP — ADHD screening/eval/home FAQ | 32 | Keep |
| REVIEW — ADHD blog/answer with screening CTA | 26 | Keep unless compliance wants CTA-only pages without repeated microcopy |
| Misclassified FLAG (Vyvanse vs Adderall blog) | 1 | **Reclassify KEEP** — ADHD medication article + screening CTA (path lacks `adhd-` prefix) |
| Footer `/adhd-screening` on non-ADHD pages | 24+ | **Flag for compliance** — consider removing from unrelated footers; keep on ADHD/home |

## Recommended compliance decisions (no code removed yet)

1. **Keep** all screening≠diagnosis copy on `/adhd-screening*`, `/adhd-care*`, evaluation/diagnosis LPs, and homepage FAQ that discusses screening vs evaluation.
2. **Keep** on ADHD blogs when adjacent to a Take Free ADHD Screening CTA.
3. **Decide:** strip **Free ADHD screening** from the SEO footer **Care & Services** column on non-ADHD service/provider pages (or gate the link by page type in `site-chrome.mjs`).
4. **Review** `/womens-midlife-health` line that frames ADHD screening as “starting point… not a diagnosis” if the page’s primary topic is midlife (not ADHD hub).

## FLAG / REVIEW queue (for sign-off)

### A. ADHD medication blog (KEEP after review — not out of context)

- `https://siya.health/blog/vyvanse-vs-adderall-differences` — body CTA: “Take … free 2-minute ADHD screening. Screening is not a diagnosis…”

### B. Midlife page (REVIEW relevance)

- `https://siya.health/womens-midlife-health` — links Free ADHD screening as “a starting point for pattern recognition, not a diagnosis” (file confirmed in inventory pass). Confirm whether midlife narrative should carry ADHD screening disclaimer or only a plain link.

### C. Footer “Free ADHD screening” on non-ADHD pages (FLAG — placement)

See list at end of this file. Recommend pruning from footers where the page topic is not ADHD/cognitive screening.

### D. Health Guides “orientation—not a diagnosis” template (KEEP — different disclaimer)

Answers pages close with *“use it as orientation—not a diagnosis.”* That is educational-guide language, not the free-screening disclaimer. It appears on ADHD and non-ADHD guides (weight, TRT, GLP-1, sleep, etc.). Recommend keep unless compliance wants topic-specific closing copy.

---

## Full instance dump

_See generated detail below (KEEP + REVIEW lists from automated scan)._

- **URL:** `https://siya.health/adhd-care`
  - File: `adhd-care.html`
  - Context: …ne check-in</li> <li>Helps you decide if evaluation is worth exploring</li> <li>Screening is not a diagnosis</li> </ul> </div> <div class="flow-card"> <span class="flow-step-num">Step 2</s…

- **URL:** `https://siya.health/adhd-care/miami`
  - File: `adhd-care/miami.html`
  - Context: …list"> <li><strong>Free screening</strong> <span>2-minute check-in. Screening is not a diagnosis.</span></li> <li><strong>Physician-led evaluation</strong> <span>St…

- **URL:** `https://siya.health/adhd-care/orlando`
  - File: `adhd-care/orlando.html`
  - Context: …list"> <li><strong>Free screening</strong> <span>2-minute check-in. Screening is not a diagnosis.</span></li> <li><strong>Physician-led evaluation</strong> <span>St…

- **URL:** `https://siya.health/adhd-care/orlando`
  - File: `adhd-care/orlando.html`
  - Context: …ts are often available. The evaluation visit itself is typically 60–90 minutes. Screening is not a diagnosis."}},{"@type":"Question","name":"Is telehealth ADHD evaluation legitimate in Flo…

- **URL:** `https://siya.health/adhd-care/san-diego`
  - File: `adhd-care/san-diego.html`
  - Context: …list"> <li><strong>Free screening</strong> <span>2-minute check-in. Screening is not a diagnosis.</span></li> <li><strong>Physician-led evaluation</strong> <span>St…

- **URL:** `https://siya.health/adhd-care/san-diego`
  - File: `adhd-care/san-diego.html`
  - Context: …ressure first conversation, then schedule the structured evaluation when ready. Screening is not a diagnosis."}}]}</script> </head> <body class="page-service page-adhd-city" data-siya-…

- **URL:** `https://siya.health/adhd-diagnosis-texas`
  - File: `adhd-diagnosis-texas.html`
  - Context: …n">$149</span>).</li> </ol> <p class="adhd-next-steps-note">Screening is not a diagnosis. A licensed clinician determines next steps after evaluation.</p> <di…

- **URL:** `https://siya.health/adhd-evaluation-california`
  - File: `adhd-evaluation-california.html`
  - Context: …<li>Helps you decide if evaluation is worth exploring</li> <li>Screening is not a diagnosis</li> </ul> </div> <div class="flow-card">…

- **URL:** `https://siya.health/adhd-evaluation-california`
  - File: `adhd-evaluation-california.html`
  - Context: …adults. $149 transparent pricing, same-week appointments, DSM-based assessment. Screening is not a diagnosis." /> <link rel="canonical" href="https://siya.health/adhd-evaluation-califo…

- **URL:** `https://siya.health/adhd-evaluation-california`
  - File: `adhd-evaluation-california.html`
  - Context: …d adult ADHD evaluation online for California adults. $149 transparent pricing. Screening is not a diagnosis; medication never guaranteed." /> <meta property="og:url" content="https://…

- **URL:** `https://siya.health/adhd-evaluation-california`
  - File: `adhd-evaluation-california.html`
  - Context: …page is for paid advertising traffic and is not a substitute for clinical care. Screening is not a diagnosis. Medication is never guaranteed. For emergencies, call 911.</p> <small>…

- **URL:** `https://siya.health/adhd-evaluation-cost`
  - File: `adhd-evaluation-cost.html`
  - Context: …ce="initialEvaluation">$149</span>).</li> </ol> <p class="adhd-next-steps-note">Screening is not a diagnosis. A licensed clinician determines next steps after evaluation.</p> <div class="a…

- **URL:** `https://siya.health/adhd-evaluation-texas`
  - File: `adhd-evaluation-texas.html`
  - Context: …<li>Helps you decide if evaluation is worth exploring</li> <li>Screening is not a diagnosis</li> </ul> </div> <div class="flow-card">…

- **URL:** `https://siya.health/adhd-evaluation-texas`
  - File: `adhd-evaluation-texas.html`
  - Context: …adults. $149 transparent pricing, same-week appointments, DSM-based assessment. Screening is not a diagnosis." /> <link rel="canonical" href="https://siya.health/adhd-evaluation-texas"…

- **URL:** `https://siya.health/adhd-evaluation-texas`
  - File: `adhd-evaluation-texas.html`
  - Context: …an-led adult ADHD evaluation online for Texas adults. $149 transparent pricing. Screening is not a diagnosis; medication never guaranteed." /> <meta property="og:url" content="https://…

- **URL:** `https://siya.health/adhd-evaluation-texas`
  - File: `adhd-evaluation-texas.html`
  - Context: …page is for paid advertising traffic and is not a substitute for clinical care. Screening is not a diagnosis. Medication is never guaranteed. For emergencies, call 911.</p> <small>…

- **URL:** `https://siya.health/adhd-screening-results`
  - File: `adhd-screening-results.html`
  - Context: …<div class="container container--footer-wide"> <p class="footer-notice">This screening is not a diagnosis. The free intro call is not a medical visit, diagnosis, or treatment recommenda…

- **URL:** `https://siya.health/adhd-screening-results`
  - File: `adhd-screening-results.html`
  - Context: …il" hidden></p> <p class="cta-microcopy screening-results-disclaimer">This screening is not a diagnosis. Only a licensed provider can diagnose ADHD after a clinical evaluation.</p>…

- **URL:** `https://siya.health/adhd-screening-results`
  - File: `adhd-screening-results.html`
  - Context: …ning is complete</h1> <p class="lead" id="screening-outcome-lead">This screening is not a diagnosis. Learn what an ADHD evaluation involves, or book a free Meet &amp; Greet if you…

- **URL:** `https://siya.health/adhd-screening-results`
  - File: `adhd-screening-results.html`
  - Context: …ning result. Learn about ADHD evaluation and care, or book a free Meet & Greet. This screening is not a diagnosis.","url":"https://siya.health/adhd-screening-results"}</script> <script t…

- **URL:** `https://siya.health/adhd-screening-results`
  - File: `adhd-screening-results.html`
  - Context: …result. Learn about ADHD evaluation and care, or book a free Meet &amp; Greet. This screening is not a diagnosis." /> <link rel="canonical" href="https://siya.health/adhd-screening-results…

- **URL:** `https://siya.health/adhd-screening`
  - File: `adhd-screening.html`
  - Context: …next steps</a>.</p> </noscript> <p class="cta-microcopy asrs-results-microcopy">This screening is not a diagnosis.</p> </div> </div> </div> <p class="asrs-citation">ASRS v1.1 6-Question Screene…

- **URL:** `https://siya.health/adhd-screening`
  - File: `adhd-screening.html`
  - Context: …over the past 6 months when answering.</p> <p class="asrs-intro-note">This is a screening tool only—not a diagnosis. A licensed provider can provide a full evaluation.</p> <div class="asrs-nav as…

- **URL:** `https://siya.health/adult-adhd-california`
  - File: `adult-adhd-california.html`
  - Context: …appropriate can support a diagnosis without an in-person visit. Screening is a starting point, not a diagnosis on its own."}},{"@type":"Question","name":"What does adult ADHD actually look l…

- **URL:** `https://siya.health/blog/adhd-evaluation-california-online-vs-in-person`
  - File: `blog/adhd-evaluation-california-online-vs-in-person.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-evaluation-cost-texas`
  - File: `blog/adhd-evaluation-cost-texas.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adult-adhd-symptoms-california`
  - File: `blog/adult-adhd-symptoms-california.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/online-adhd-diagnosis-california`
  - File: `blog/online-adhd-diagnosis-california.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/online-adhd-diagnosis-texas`
  - File: `blog/online-adhd-diagnosis-texas.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/youre-not-lazy-signs-undiagnosed-adult-adhd`
  - File: `blog/youre-not-lazy-signs-undiagnosed-adult-adhd.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/creyos-adhd-testing`
  - File: `creyos-adhd-testing.html`
  - Context: …n">$149</span>).</li> </ol> <p class="adhd-next-steps-note">Screening is not a diagnosis. A licensed clinician determines next steps after evaluation.</p> <di…

- **URL:** `https://siya.health/online-adhd-test`
  - File: `online-adhd-test.html`
  - Context: …n">$149</span>).</li> </ol> <p class="adhd-next-steps-note">Screening is not a diagnosis. A licensed clinician determines next steps after evaluation.</p> <di…


### REVIEW — ADHD blog with screening CTA (usually OK if CTA present)

- **URL:** `https://siya.health/blog/adderall-for-adhd-how-it-works`
  - File: `blog/adderall-for-adhd-how-it-works.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-and-binge-eating`
  - File: `blog/adhd-and-binge-eating.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-and-binge-eating`
  - File: `blog/adhd-and-binge-eating.html`
  - Context: …or “fine because you did well in school”</li> </ul> <p>Screening is not a diagnosis—but it can clarify whether a full evaluation is the next step.</p>…

- **URL:** `https://siya.health/blog/adhd-brain-imaging-subtypes`
  - File: `blog/adhd-brain-imaging-subtypes.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-hormones-women`
  - File: `blog/adhd-hormones-women.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-in-women`
  - File: `blog/adhd-in-women.html`
  - Context: …for some people; this is clinical observation, not settled causation.</li> <li>Screening is not a diagnosis; a structured adult evaluation clarifies ADHD and overlapping factors before tr…

- **URL:** `https://siya.health/blog/adhd-medication-daily-or-as-needed-adults`
  - File: `blog/adhd-medication-daily-or-as-needed-adults.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-medication-online-california`
  - File: `blog/adhd-medication-online-california.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-medication-options-california`
  - File: `blog/adhd-medication-options-california.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-medication-options-for-adults`
  - File: `blog/adhd-medication-options-for-adults.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-medication-side-effects-what-to-expect`
  - File: `blog/adhd-medication-side-effects-what-to-expect.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-symptoms-overlooked`
  - File: `blog/adhd-symptoms-overlooked.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-telehealth-california`
  - File: `blog/adhd-telehealth-california.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-testing-online-california-screening-vs-evaluation`
  - File: `blog/adhd-testing-online-california-screening-vs-evaluation.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/adhd-treatment-texas`
  - File: `blog/adhd-treatment-texas.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/brain-fog-vs-adhd`
  - File: `blog/brain-fog-vs-adhd.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/executive-dysfunction-adhd`
  - File: `blog/executive-dysfunction-adhd.html`
  - Context: …;t).</p> <p>A free online screening is a reasonable first step, but it&#x27;s a screening tool, not a diagnosis—see <a href="/answers/screening-vs-adhd-evaluation">screening vs. a full ADHD e…

- **URL:** `https://siya.health/blog/how-adhd-medication-is-prescribed-online`
  - File: `blog/how-adhd-medication-is-prescribed-online.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/how-to-choose-adhd-provider-california`
  - File: `blog/how-to-choose-adhd-provider-california.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/how-to-know-if-you-have-adhd-adult`
  - File: `blog/how-to-know-if-you-have-adhd-adult.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/iron-deficiency-brain-fog-adhd`
  - File: `blog/iron-deficiency-brain-fog-adhd.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/is-adhd-medication-safe-long-term`
  - File: `blog/is-adhd-medication-safe-long-term.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/is-online-adhd-diagnosis-legit`
  - File: `blog/is-online-adhd-diagnosis-legit.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/non-stimulant-adhd-medications-explained`
  - File: `blog/non-stimulant-adhd-medications-explained.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…

- **URL:** `https://siya.health/blog/pots-and-adhd`
  - File: `blog/pots-and-adhd.html`
  - Context: …D screening</a> is a reasonable first step on the ADHD side, understanding that screening is not a diagnosis, and <a href="/telehealth">telehealth evaluation</a> can be a practical way to…

- **URL:** `https://siya.health/blog/pots-and-adhd`
  - File: `blog/pots-and-adhd.html`
  - Context: …ms?</p> <p>Take Siya Health&rsquo;s free 2-minute ADHD screening. Screening is not a diagnosis, but it can help you decide whether a full evaluation may be worth exploring.</…


## Related: “Free ADHD screening” footer link on non-ADHD pages

_Not the screening≠diagnosis disclaimer, but often co-located. Flagging for awareness — keep or prune is a separate nav decision._

- `about.html` — footer/nav links to `/adhd-screening`
- `book-appointment.html` — footer/nav links to `/adhd-screening`
- `brain-fog.html` — footer/nav links to `/adhd-screening`
- `employers.html` — footer/nav links to `/adhd-screening`
- `fatigue.html` — footer/nav links to `/adhd-screening`
- `join-our-team.html` — footer/nav links to `/adhd-screening`
- `labs.html` — footer/nav links to `/adhd-screening`
- `mens-health-longevity.html` — footer/nav links to `/adhd-screening`
- `prescriptions.html` — footer/nav links to `/adhd-screening`
- `preventive-care.html` — footer/nav links to `/adhd-screening`
- `pricing.html` — footer/nav links to `/adhd-screening`
- `primary-care.html` — footer/nav links to `/adhd-screening`
- `primary-urgent-care.html` — footer/nav links to `/adhd-screening`
- `providers/dr-natasha-desai.html` — footer/nav links to `/adhd-screening`
- `providers/dr-sneh-pandey.html` — footer/nav links to `/adhd-screening`
- `providers/dr-swati-pandey.html` — footer/nav links to `/adhd-screening`
- `providers/dr-vanessa-urbina.html` — footer/nav links to `/adhd-screening`
- `providers/megan-wunderlich.html` — footer/nav links to `/adhd-screening`
- `providers/wendy-delgado.html` — footer/nav links to `/adhd-screening`
- `siya-circle.html` — footer/nav links to `/adhd-screening`
- `telehealth.html` — footer/nav links to `/adhd-screening`
- `weight-loss-metabolic-health.html` — footer/nav links to `/adhd-screening`
- `womens-health.html` — footer/nav links to `/adhd-screening`
- `womens-midlife-health.html` — footer/nav links to `/adhd-screening`