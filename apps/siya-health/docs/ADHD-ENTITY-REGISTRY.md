# ADHD Entity Registry

Living ownership map for Siya Health’s ADHD knowledge graph.  
**Rule:** One broad-intent entity → one canonical owner. Supporting Answers and spokes must defer upward, not compete.

**Page classes**

| Class | Role | Example |
| --- | --- | --- |
| Pillar | Broad entity owner; long-form education | `/blog/adhd-in-women`, `/blog/executive-dysfunction-adhd` |
| Cluster hub | Index / routing node for a topic family | `/blog/adhd` |
| Supporting Answer | Concise FAQ; links to pillar | `/answers/adhd-in-women` |
| Local SEO | State hub first, then cities | `/blog/adhd-treatment-texas` |
| Commercial | Care / conversion destination | `/adhd-care`, `/adhd-screening` |

Every new ADHD page must declare: entity owned, parent, children, inbound, outbound, commercial target.

---

## Registry

| Entity | Canonical Owner | Status | Cluster | Page Class | Parent | Children / Spokes | Commercial Target |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Adult ADHD (broad) | `/blog/how-to-know-if-you-have-adhd-adult` | Complete | Adult ADHD | Pillar | `/blog/adhd` | Signs FAQs, overlooked symptoms | `/adhd-care` |
| ADHD article hub | `/blog/adhd` | Complete | Adult ADHD | Cluster hub | — | Pillars + medication + local | `/adhd-care` |
| ADHD in Women | `/blog/adhd-in-women` | Complete | Women | Pillar | `/blog/adhd` | Masking*, hormones*, perimenopause*, binge overlap | `/adhd-care` |
| ADHD in Women (FAQ) | `/answers/adhd-in-women` | Complete | Women | Supporting Answer | `/blog/adhd-in-women` | — | `/adhd-care` |
| Late ADHD diagnosis | `/answers/late-adhd-diagnosis-adults` | Complete | Adult ADHD / Women | Supporting Answer | `/blog/how-to-know-if-you-have-adhd-adult` | — | `/adhd-care` |
| ADHD vs Anxiety | `/answers/adhd-vs-anxiety` | Complete | Diagnosis | Supporting Answer | `/blog/how-to-know-if-you-have-adhd-adult` | — | `/adhd-care` |
| ADHD vs Burnout | `/answers/adhd-vs-burnout` | Complete | Diagnosis | Supporting Answer | `/blog/how-to-know-if-you-have-adhd-adult` | — | `/adhd-care` |
| Executive Dysfunction ADHD | `/blog/executive-dysfunction-adhd` | **Complete** | Executive Dysfunction | Pillar | `/blog/adhd` | Time blindness, working memory*, decision fatigue*, task initiation* | `/adhd-care` |
| Executive Dysfunction (FAQ) | `/answers/executive-dysfunction-adhd` | Complete (supporting) | Executive Dysfunction | Supporting Answer | `/blog/executive-dysfunction-adhd` | — | `/adhd-care` |
| Time Blindness | `/answers/time-blindness-adhd` | Complete (thin) | Executive Dysfunction | Supporting Answer | `/blog/executive-dysfunction-adhd` | Future spoke blog optional | `/adhd-care` |
| Working Memory ADHD | — | Missing | Executive Dysfunction | Supporting Answer | `/blog/executive-dysfunction-adhd` | — | ED pillar |
| Decision Fatigue ADHD | — | Missing | Executive Dysfunction | Supporting Answer | `/blog/executive-dysfunction-adhd` | — | ED pillar |
| Task Initiation ADHD | — | Missing | Executive Dysfunction | Supporting Answer | `/blog/executive-dysfunction-adhd` | — | ED pillar |
| Organization / systems ADHD | — | Missing | Executive Dysfunction | Supporting Answer | `/blog/executive-dysfunction-adhd` | — | ED pillar |
| ADHD Masking (women) | — | Missing spoke | Women | Supporting / Spoke | `/blog/adhd-in-women` | — | Women’s hub |
| ADHD + Perimenopause | — | Missing | Women | Pillar (planned) | `/blog/adhd-in-women` | Hormones FAQ | Women’s hub → `/adhd-care` |
| ADHD + Hormones | — | Missing spoke | Women | Supporting Answer | `/blog/adhd-in-women` | — | Women’s hub |
| ADHD and Binge Eating | `/blog/adhd-and-binge-eating` | Complete | Metabolic ∩ ADHD | Pillar (intersection) | `/blog/adhd` | Food noise FAQ | `/adhd-care` + metabolic |
| Food Noise | `/answers/what-is-food-noise` | Complete | Metabolic | Supporting Answer | Food-noise blog / binge pillar | — | Metabolic / ADHD care |
| ADHD Medication Options | `/blog/adhd-medication-options-for-adults` | Complete | Medication | Pillar | `/blog/adhd` | Side effects, daily vs PRN, Vyvanse vs Adderall | `/adhd-care` |
| Online ADHD diagnosis legitimacy | `/blog/is-online-adhd-diagnosis-legit` | Complete | Diagnosis | Pillar | `/blog/adhd` | Can diagnose online FAQ | `/adhd-care` |
| Screening vs Evaluation | `/answers/screening-vs-adhd-evaluation` | Complete | Diagnosis | Supporting Answer | Diagnosis pillar | — | `/adhd-screening` → `/adhd-care` |
| ADHD Treatment (national) | — / partial TX hub | Partial | Treatment | Pillar (planned) | `/blog/adhd` | TX ✅ · FL · PA · CA | `/adhd-care` |
| ADHD Diagnosis (national) | Fragmented blogs/answers | Partial | Diagnosis | Pillar (planned) | `/blog/adhd` | Online legit, screening FAQs | `/adhd-care` |
| Texas ADHD Treatment | `/blog/adhd-treatment-texas` | Complete | Local SEO | Local hub | National Treatment (planned) | Dallas, Houston, Austin, SA, Fort Worth | `/adhd-care` |
| Florida ADHD Treatment | — | Missing hub | Local SEO | Local hub | National Treatment (planned) | Miami, Orlando (cities exist; hub missing) | `/adhd-care` |
| Pennsylvania ADHD Treatment | — | Missing hub | Local SEO | Local hub | Treatment cluster | Philadelphia | `/adhd-care` |
| California ADHD Treatment | — | **Blocked** (C3 cleanup) | Local SEO | Local hub | — | Do not expand until cleanup | `/adhd-care` |
| ADHD Care (commercial) | `/adhd-care` | Complete | Commercial | Commercial | — | Screening, Meet & Greet | Conversion |
| ADHD Screening | `/adhd-screening` | Complete | Commercial | Commercial | `/adhd-care` | — | Evaluation |
| Iron deficiency ∩ ADHD | `/blog/iron-deficiency-brain-fog-adhd` | Complete | Medical overlap | Supporting cornerstone | `/blog/adhd` | Ferritin, brain fog, women’s bleeding | `/adhd-care` · `/labs` |
| ADHD neuroimaging biotypes | `/blog/adhd-brain-imaging-subtypes` | Complete | Science / heterogeneity | Supporting cornerstone | `/blog/adhd` | Emotional dysregulation research | `/adhd-care` |
| POTS ∩ ADHD | `/blog/pots-and-adhd` | Complete | Medical overlap | Supporting cornerstone | `/blog/adhd` | Brain fog, dysautonomia overlap | `/adhd-care` · `/telehealth` |

\* = owned only as sections inside a pillar today; do not launch competing broad pages until a dedicated spoke is approved.

---

## Build order (architecture)

1. Perimenopause + ADHD  
2. National ADHD Treatment pillar  
3. Florida treatment hub  
4. Pennsylvania treatment hub  
5. California C3 cleanup  
6. Brand Experience v2 (homepage first) — parallel when resourced  
7. Then selectively expand supporting entities based on demand + GSC

---

## Cannibalization rules

- Do **not** retitle or expand a Supporting Answer to target a Pillar’s primary keyword.
- When a Pillar launches, set `canonicalBlog` on the matching Answer to the Pillar.
- Local city pages never own national educational entities (e.g. “ADHD in women”).
- California expansion is blocked until C3 cleanup.

---

## Machine-readable twin

CSV: [`ADHD-ENTITY-REGISTRY.csv`](./ADHD-ENTITY-REGISTRY.csv)
