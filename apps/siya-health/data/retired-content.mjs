/**
 * Retired content — pages superseded by a Canonical Entity Page.
 *
 * Distinct from geo-consolidation.mjs (city clones with no unique value).
 * These are pages that DID have value; the value moved to a canonical entity, so
 * the old URL hands its equity over with a permanent redirect rather than being
 * "upgraded" in place. Never merge two architectures — redirect one into the other.
 *
 * Governance: every entry must state which entity superseded it and why.
 * Consumed by: scripts/retire-pages.mjs (stub + vercel + redirect-map registration)
 */

/** @type {Record<string, { destination: string, entity: string, reason: string }>} */
export const RETIRED_CONTENT_REDIRECTS = {
  '/blog/why-am-i-always-tired-causes-when-to-see-doctor': {
    destination: '/fatigue',
    entity: 'fatigue',
    reason:
      'Fatigue cluster cornerstone (3,386 words, established ranking history) superseded by the /fatigue Canonical Entity Page on 2026-07-26. Redirected rather than rewritten: the blog architecture and the entity architecture should not be merged.',
  },
  '/adult-adhd-screening-california': {
    destination: '/adhd-evaluation-california',
    entity: 'adhd-evaluation-california',
    reason:
      'Google Ads CA screening LP retired 2026-08-16. Final Ads destination is the lean evaluation LP /adhd-evaluation-california (not the SEO hub /adult-adhd-california).',
  },
  '/adult-adhd-screening-texas': {
    destination: '/adhd-evaluation-texas',
    entity: 'adhd-evaluation-texas',
    reason:
      'Google Ads TX screening LP retired 2026-08-16. Final Ads destination is the lean evaluation LP /adhd-evaluation-texas.',
  },
  '/providers/derek-timbs': {
    destination: '/providers',
    entity: 'providers',
    reason:
      'Provider removed from public roster due to licensing issue (2026-09-01). Profile retired with permanent redirect to care team hub.',
  },
  '/adhd-diagnosis-florida': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'Thin Florida geo landing with no unique value (SITE-PRUNING-AUDIT). National ADHD care hub owns commercial intent; FL city content consolidated.',
  },
  '/adult-adhd-diagnosis': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'Legacy ADHD funnel duplicate splitting commercial intent with /adhd-care (SITE-PRUNING-AUDIT). Permanent redirect preserves equity on canonical service page.',
  },
  '/adhd-treatment-online': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason:
      'Legacy post-diagnosis treatment URL duplicating /adhd-care sections (SITE-PRUNING-AUDIT). Redirect rather than maintain parallel funnel.',
  },
  '/answers/weight-gain-after-stopping-ozempic': {
    destination: '/blog/food-noise-and-glp-1-what-it-means-and-what-helps',
    entity: 'food-noise-and-glp-1',
    reason:
      'Ozempic cessation / GLP-1 rebound narrative owned by food-noise cornerstone blog (SITE-PRUNING-AUDIT). Guide retired; blog retains long-form depth.',
  },
  '/employers/california-pilot': {
    destination: '/employers',
    entity: 'employers',
    reason:
      'Removed 2026-09-30. The per-employee figures on this page were illustrative and are no longer accurate. Employer pricing is scoped per employer and is not a published rate.',
  },
  '/blog/insomnia-treatment-options-beyond-medication': {
    destination: '/guides/sleep#sl-insomnia',
    entity: 'sleep',
    reason: 'Insomnia is a section of the sleep guide. Retired 2026-10-01.',
  },
  '/blog/adhd-medication-online-california': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason: 'Acquisition-style get-ADHD-medication-online article. Retired 2026-10-01.',
  },
  '/blog/adhd-medication-options-california': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason: 'California medication-options sibling of the online-acquisition cluster. Retired 2026-10-01.',
  },
  '/blog/online-adhd-diagnosis-california': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason: 'California online-ADHD-diagnosis acquisition URL. Retired 2026-10-01.',
  },
  '/blog/online-adhd-diagnosis-texas': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason: 'Texas online-ADHD-diagnosis acquisition URL. Retired 2026-10-01.',
  },
  '/blog/adhd-telehealth-california': {
    destination: '/adhd-care',
    entity: 'adhd-care',
    reason: 'California ADHD-telehealth acquisition sibling. Retired 2026-10-01.',
  },
  '/blog/adhd-treatment-texas': {
    destination: '/adhd-diagnosis-texas',
    entity: 'adhd-care',
    reason: 'Retired 2026-10-04. Page incorrectly listed Dr. Natasha Desai as medical reviewer with pending sign-off. Traffic goes to the live Texas ADHD landing.',
  },
  '/answers/adderall-vs-vyvanse-adults': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/answers/adhd-and-weight-loss-connection': {
    destination: '/guides/weight#wt-opener',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-opener.',
  },
  '/answers/adhd-in-women': {
    destination: '/guides/perimenopause#pe-opener',
    entity: 'guides/perimenopause',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/perimenopause#pe-opener.',
  },
  '/answers/adhd-medication-every-day': {
    destination: '/guides/mental-health-and-adhd#mh-work',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-work.',
  },
  '/answers/adhd-medication-side-effects': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/answers/adhd-vs-anxiety': {
    destination: '/guides/mental-health-and-adhd#mh-diff',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-diff.',
  },
  '/answers/adhd-vs-burnout': {
    destination: '/guides/mental-health-and-adhd#mh-diff',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-diff.',
  },
  '/answers/adhd-workplace-accommodations': {
    destination: '/guides/mental-health-and-adhd#mh-work',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-work.',
  },
  '/answers/afternoon-energy-crash-after-lunch': {
    destination: '/guides/exhausted#ex-opener',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-opener.',
  },
  '/answers/asrs-adhd-screening-explained': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/answers/brain-fog-after-eating': {
    destination: '/guides/weight#wt-insulin',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-insulin.',
  },
  '/answers/can-adhd-cause-anxiety': {
    destination: '/guides/mental-health-and-adhd#mh-diff',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-diff.',
  },
  '/answers/can-sleep-apnea-cause-fatigue': {
    destination: '/guides/sleep#sl-apnea',
    entity: 'guides/sleep',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/sleep#sl-apnea.',
  },
  '/answers/compounded-vs-branded-glp-1': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/answers/executive-dysfunction-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-work',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-work.',
  },
  '/answers/food-noise-returned-on-glp-1': {
    destination: '/guides/weight#wt-food-noise',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-food-noise.',
  },
  '/answers/glp-1-nausea-management': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/answers/glp-1-side-effects': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/answers/high-functioning-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-signs',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-signs.',
  },
  '/answers/high-shbg-low-free-testosterone': {
    destination: '/guides/testosterone#te-free',
    entity: 'guides/testosterone',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/testosterone#te-free.',
  },
  '/answers/insulin-resistance-without-diabetes': {
    destination: '/guides/weight#wt-insulin',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-insulin.',
  },
  '/answers/is-adhd-medication-safe-long-term': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/answers/late-adhd-diagnosis-adults': {
    destination: '/guides/mental-health-and-adhd#mh-signs',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-signs.',
  },
  '/answers/medical-weight-loss-vs-dieting': {
    destination: '/guides/weight#wt-opener',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-opener.',
  },
  '/answers/normal-a1c-insulin-resistance': {
    destination: '/guides/weight#wt-insulin',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-insulin.',
  },
  '/answers/oral-vs-topical-minoxidil': {
    destination: '/guides/testosterone#te-opener',
    entity: 'guides/testosterone',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/testosterone#te-opener.',
  },
  '/answers/poor-sleep-feels-like-adhd': {
    destination: '/guides/sleep#sl-focus',
    entity: 'guides/sleep',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/sleep#sl-focus.',
  },
  '/answers/rejection-sensitivity-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-signs',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-signs.',
  },
  '/answers/screening-vs-adhd-evaluation': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/answers/semaglutide-weight-loss-how-it-works': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/answers/signs-of-adult-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-signs',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-signs.',
  },
  '/answers/signs-of-sleep-apnea-in-adults': {
    destination: '/guides/sleep#sl-apnea',
    entity: 'guides/sleep',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/sleep#sl-apnea.',
  },
  '/answers/starting-adhd-medication-adults': {
    destination: '/guides/mental-health-and-adhd#mh-work',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-work.',
  },
  '/answers/testosterone-and-adhd-overlap': {
    destination: '/guides/testosterone#te-opener',
    entity: 'guides/testosterone',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/testosterone#te-opener.',
  },
  '/answers/time-blindness-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-work',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-work.',
  },
  '/answers/trt-monitoring-requirements': {
    destination: '/guides/testosterone#te-therapy',
    entity: 'guides/testosterone',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/testosterone#te-therapy.',
  },
  '/answers/what-does-low-testosterone-feel-like': {
    destination: '/guides/testosterone#te-symptoms',
    entity: 'guides/testosterone',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/testosterone#te-symptoms.',
  },
  '/answers/what-is-food-noise': {
    destination: '/guides/weight#wt-food-noise',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-food-noise.',
  },
  '/answers/what-is-free-testosterone': {
    destination: '/guides/testosterone#te-free',
    entity: 'guides/testosterone',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/testosterone#te-free.',
  },
  '/answers/what-is-insulin-resistance': {
    destination: '/guides/weight#wt-insulin',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-insulin.',
  },
  '/answers/when-is-testosterone-therapy-appropriate': {
    destination: '/guides/testosterone#te-therapy',
    entity: 'guides/testosterone',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/testosterone#te-therapy.',
  },
  '/answers/who-qualifies-glp-1-weight-loss': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-glp1.',
  },
  '/answers/why-am-i-tired-even-after-sleeping': {
    destination: '/guides/exhausted#ex-sleep-link',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-sleep-link.',
  },
  '/answers/why-normal-labs-dont-mean-healthy': {
    destination: '/guides/exhausted#ex-opener',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-opener.',
  },
  '/blog/adderall-for-adhd-how-it-works': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/blog/adhd-and-binge-eating': {
    destination: '/guides/weight#wt-food-noise',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-food-noise.',
  },
  '/blog/adhd-brain-imaging-subtypes': {
    destination: '/guides/mental-health-and-adhd#mh-signs',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-signs.',
  },
  '/blog/adhd-hormones-women': {
    destination: '/guides/perimenopause#pe-opener',
    entity: 'guides/perimenopause',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/perimenopause#pe-opener.',
  },
  '/blog/adhd-in-women': {
    destination: '/guides/perimenopause#pe-opener',
    entity: 'guides/perimenopause',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/perimenopause#pe-opener.',
  },
  '/blog/adhd-medication-daily-or-as-needed-adults': {
    destination: '/guides/mental-health-and-adhd#mh-work',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-work.',
  },
  '/blog/adhd-medication-options-for-adults': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/blog/adhd-medication-side-effects-what-to-expect': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/blog/adhd-symptoms-overlooked': {
    destination: '/guides/mental-health-and-adhd#mh-signs',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-signs.',
  },
  '/blog/brain-fog-after-covid': {
    destination: '/guides/exhausted#ex-opener',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-opener.',
  },
  '/blog/brain-fog-and-anxiety': {
    destination: '/guides/mental-health-and-adhd#mh-diff',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-diff.',
  },
  '/blog/brain-fog-and-sleep': {
    destination: '/guides/sleep#sl-focus',
    entity: 'guides/sleep',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/sleep#sl-focus.',
  },
  '/blog/brain-fog-at-work': {
    destination: '/guides/exhausted#ex-opener',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-opener.',
  },
  '/blog/brain-fog-vs-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-diff',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-diff.',
  },
  '/blog/chronic-fatigue-and-work-performance': {
    destination: '/guides/exhausted#ex-opener',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-opener.',
  },
  '/blog/chronic-fatigue-vs-everyday-tiredness': {
    destination: '/guides/exhausted#ex-opener',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-opener.',
  },
  '/blog/compounded-vs-branded-glp1-medications': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/blog/executive-dysfunction-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-work',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-work.',
  },
  '/blog/fatigue-after-illness': {
    destination: '/guides/exhausted#ex-opener',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-opener.',
  },
  '/blog/fatigue-despite-normal-labs': {
    destination: '/guides/exhausted#ex-iron',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-iron.',
  },
  '/blog/food-noise-and-glp-1-what-it-means-and-what-helps': {
    destination: '/guides/weight#wt-food-noise',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-food-noise.',
  },
  '/blog/free-testosterone-vs-total-testosterone-what-patients-should-know': {
    destination: '/guides/testosterone#te-free',
    entity: 'guides/testosterone',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/testosterone#te-free.',
  },
  '/blog/glp1-side-effects-and-how-to-manage-them': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/blog/how-mental-health-affects-weight-loss-outcomes': {
    destination: '/guides/weight#wt-opener',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-opener.',
  },
  '/blog/how-to-know-if-you-have-adhd-adult': {
    destination: '/guides/mental-health-and-adhd#mh-signs',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-signs.',
  },
  '/blog/insulin-resistance-and-weight-loss-clinician-overview': {
    destination: '/guides/weight#wt-insulin',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-insulin.',
  },
  '/blog/iron-deficiency-and-fatigue': {
    destination: '/guides/exhausted#ex-iron',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-iron.',
  },
  '/blog/iron-deficiency-brain-fog-adhd': {
    destination: '/guides/exhausted#ex-iron',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-iron.',
  },
  '/blog/is-adhd-medication-safe-long-term': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/blog/medical-weight-loss-vs-dieting-what-actually-works': {
    destination: '/guides/weight#wt-opener',
    entity: 'guides/weight',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/weight#wt-opener.',
  },
  '/blog/minoxidil-for-hair-loss-does-it-work': {
    destination: '/guides/testosterone#te-opener',
    entity: 'guides/testosterone',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/testosterone#te-opener.',
  },
  '/blog/morning-fatigue': {
    destination: '/guides/exhausted#ex-sleep-link',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-sleep-link.',
  },
  '/blog/non-stimulant-adhd-medications-explained': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/blog/oral-vs-injectable-weight-loss-medications': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/blog/oral-vs-topical-minoxidil-which-is-right': {
    destination: '/guides/testosterone#te-opener',
    entity: 'guides/testosterone',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/testosterone#te-opener.',
  },
  '/blog/perimenopause-brain-fog': {
    destination: '/guides/perimenopause#pe-mood',
    entity: 'guides/perimenopause',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/perimenopause#pe-mood.',
  },
  '/blog/phentermine-for-weight-loss-safety-and-effectiveness': {
    destination: '/guides/weight#wt-opener',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-opener.',
  },
  '/blog/pots-and-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-diff',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-diff.',
  },
  '/blog/semaglutide-for-weight-loss-how-it-works': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/blog/sleep-and-focus-at-work': {
    destination: '/guides/sleep#sl-focus',
    entity: 'guides/sleep',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/sleep#sl-focus.',
  },
  '/blog/sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign': {
    destination: '/guides/sleep#sl-apnea',
    entity: 'guides/sleep',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/sleep#sl-apnea.',
  },
  '/blog/thyroid-and-fatigue': {
    destination: '/guides/exhausted#ex-thyroid',
    entity: 'guides/exhausted',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/exhausted#ex-thyroid.',
  },
  '/blog/tirzepatide-vs-semaglutide-which-is-better': {
    destination: '/guides/weight#wt-glp1',
    entity: 'guides/weight',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/weight#wt-glp1.',
  },
  '/blog/vyvanse-vs-adderall-differences': {
    destination: '/guides/mental-health-and-adhd#mh-screen',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage RETIRE 2026-10-04; redirect to pillar /guides/mental-health-and-adhd#mh-screen.',
  },
  '/blog/when-is-testosterone-therapy-appropriate': {
    destination: '/guides/testosterone#te-therapy',
    entity: 'guides/testosterone',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/testosterone#te-therapy.',
  },
  '/blog/youre-not-lazy-signs-undiagnosed-adult-adhd': {
    destination: '/guides/mental-health-and-adhd#mh-signs',
    entity: 'guides/mental-health-and-adhd',
    reason: 'Persona triage MERGE 2026-10-04 into pillar /guides/mental-health-and-adhd#mh-signs.',
  },
};

export const RETIRED_CONTENT_STATS = {
  retiredPages: Object.keys(RETIRED_CONTENT_REDIRECTS).length,
};
