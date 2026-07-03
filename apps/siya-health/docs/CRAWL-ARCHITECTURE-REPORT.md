# Crawl architecture report

Generated: 2026-07-03T11:31:30.779Z

Internal link graph analysis only — not a general SEO audit.

## Summary

| Metric | Value |
|--------|------:|
| Total indexable HTML pages | 152 |
| Pages reachable from `/` | 145 |
| Unreachable from `/` (by internal links) | 7 |
| **Average crawl depth** (reachable pages) | **1.77** |
| Orphan pages (0 inbound internal links) | 7 |
| Pages with &lt; 2 inbound links | 10 |
| Pages with &gt; 100 outbound internal links | 0 |
| Pages with &gt; 100 inbound internal links | 8 |

## Crawl depth distribution

| Depth from homepage | Pages |
|--------------------:|------:|
| 0 | 1 |
| 1 | 33 |
| 2 | 110 |
| 3 | 1 |

## Top 20 most internally linked pages (inbound)

| Rank | Inbound links | Path | Title |
|------|-------------:|------|-------|
| 1 | 151 | `/` | Siya Health \| When Focus, Energy, or Weight Won't Budge |
| 2 | 147 | `/about` | About Siya Health \| Mission, Team &amp; How Care Works |
| 3 | 142 | `/telehealth` | Virtual Medical Care \| Siya Health Telehealth |
| 4 | 141 | `/adhd-care` | Adult ADHD Diagnosis Online — Same-Week Evaluation ($199) |
| 5 | 141 | `/answers` | Health Guides \| Metabolic, ADHD, Hormones &amp; Telehealth |
| 6 | 141 | `/blog` | Health Insights &amp; Blog Hub (2026) \| ADHD, Weight Loss &amp; Telehe |
| 7 | 141 | `/weight-loss-metabolic-health` | Provider-Guided Medical Weight Loss |
| 8 | 140 | `/labs` | Diagnostic Lab Services |
| 9 | 98 | `/blog/adhd` | ADHD Articles Hub (2026) — Diagnosis, Medication Education &amp; Care |
| 10 | 91 | `/blog/weight-loss` | Weight Loss Articles (2026) — GLP-1 &amp; Medical Metabolic Care \| Siy |
| 11 | 90 | `/legal/notice-of-privacy-practices` | Notice of Privacy Practices |
| 12 | 90 | `/legal/privacy-policy` | Privacy Policy |
| 13 | 90 | `/legal/terms-of-use` | Terms of Use |
| 14 | 89 | `/legal/cookie-policy` | Cookie Policy |
| 15 | 89 | `/legal` | Legal &amp; Compliance |
| 16 | 88 | `/answers/signs-of-adult-adhd` | What are the signs of adult ADHD? |
| 17 | 87 | `/blog/how-to-know-if-you-have-adhd-adult` | How to Know If You Have ADHD as an Adult (Real Signs Explained) |
| 18 | 86 | `/blog/telehealth` | Telehealth Articles (2026) — Online ADHD Diagnosis &amp; Safe Prescrib |
| 19 | 86 | `/mens-health-longevity` | Men's Health &amp; Longevity |
| 20 | 83 | `/answers/what-is-insulin-resistance` | What is insulin resistance? |

## Orphan pages (0 inbound internal links)

- `/intake` — Secure Intake
- `/privacy-policy` — Privacy Policy Redirect
- `/redirect/adhd-evaluation` — Starting Your ADHD Evaluation
- `/redirect/adhd-walkthrough` — Booking Your ADHD Walkthrough
- `/redirect/chat` — Connecting to Secure Medical Chat
- `/siya-circle` — Siya Circle | Free Health Education Newsletter
- `/terms` — Terms Redirect

## Pages with fewer than 2 inbound links

- `/answers/afternoon-energy-crash-after-lunch` (1 inbound) — Why do I crash every afternoon after lunch?
- `/answers/weight-gain-after-stopping-ozempic` (1 inbound) — Why am I gaining weight after stopping Ozempic?
- `/book-appointment` (1 inbound) — Book an Appointment
- `/intake` (0 inbound) — Secure Intake
- `/privacy-policy` (0 inbound) — Privacy Policy Redirect
- `/redirect/adhd-evaluation` (0 inbound) — Starting Your ADHD Evaluation
- `/redirect/adhd-walkthrough` (0 inbound) — Booking Your ADHD Walkthrough
- `/redirect/chat` (0 inbound) — Connecting to Secure Medical Chat
- `/siya-circle` (0 inbound) — Siya Circle | Free Health Education Newsletter
- `/terms` (0 inbound) — Terms Redirect


## Pages with more than 100 outbound internal links

_None_

## Pages with more than 100 inbound internal links

- `/about` (147 inbound) — About Siya Health | Mission, Team &amp; How Care Works
- `/adhd-care` (141 inbound) — Adult ADHD Diagnosis Online — Same-Week Evaluation ($199)
- `/answers` (141 inbound) — Health Guides | Metabolic, ADHD, Hormones &amp; Telehealth
- `/blog` (141 inbound) — Health Insights &amp; Blog Hub (2026) | ADHD, Weight Loss &amp; Telehe
- `/` (151 inbound) — Siya Health | When Focus, Energy, or Weight Won't Budge
- `/labs` (140 inbound) — Diagnostic Lab Services
- `/telehealth` (142 inbound) — Virtual Medical Care | Siya Health Telehealth
- `/weight-loss-metabolic-health` (141 inbound) — Provider-Guided Medical Weight Loss

## Unreachable from homepage (internal link graph)

- `/intake`
- `/privacy-policy`
- `/redirect/adhd-evaluation`
- `/redirect/adhd-walkthrough`
- `/redirect/chat`
- `/siya-circle`
- `/terms`


## Remaining weak points

1. **Orphans** — add at least one inbound link from a hub (`/answers`, `/blog`, or service page).
2. **Depth &gt; 4** — consider linking high-value pages from shallower hubs.
3. **Low inbound (&lt; 2)** — informational pages need cluster/hub links (see content hierarchy).
4. **High outbound (&gt; 100)** — usually hub pages; expected if listing many children.

---

_Run `node scripts/internal-link-audit.mjs && node scripts/generate-crawl-architecture-report.mjs` after HTML changes._
