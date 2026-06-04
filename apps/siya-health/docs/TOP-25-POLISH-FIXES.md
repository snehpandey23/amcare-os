# Top 25 polish fixes — Impact × Effort

**Source:** Production visual audit of https://siya.health (live browser, 2026-06-04)  
**Lens:** Would a patient trust this as physician-led care? (Not SEO / Lighthouse)

**Formula:** Priority score = Impact ÷ Effort (higher = do first)

---

| Rank | Fix | Impact | Effort | Priority | Evidence |
|------|-----|-------:|-------:|---------:|----------|
| 1 | **Deploy** Tier-1 guides (`poor-sleep-feels-like-adhd`, `brain-fog-after-eating`) | 10 | 2 | **5.00** | HTTP 404 on production |
| 2 | **Dedupe clinical review** on legacy blogs (14× → 1×) | 10 | 3 | **3.33** | `aside.clinical-review` on ADHD/GLP-1 posts |
| 3 | **Deploy** sitewide consistency branch (`consistency:apply` already in repo) | 9 | 2 | **4.50** | Fixes not visible on production yet |
| 4 | Replace **“Schedule Meet & Greet”** with **“Book a Meet & Greet”** everywhere | 8 | 2 | **4.00** | Live on `/adhd-care`, `/telehealth`, blogs |
| 5 | Standardize **4-state licensing** copy on all service pages (include **California**) | 8 | 2 | **4.00** | ADHD care body: “Texas, Florida, and Pennsylvania” |
| 6 | Dedupe **2× clinical review** on cornerstone blogs + all Health Guides | 8 | 3 | **2.67** | Food noise, insulin resistance, 18 answer pages |
| 7 | Run **`blog:consistency:apply`** and deploy (single `cta-band`, related guides) | 8 | 3 | **2.67** | Production still pre-blog-consistency |
| 8 | Add **physician sign-off** in review registry for top 20 traffic URLs | 7 | 2 | **3.50** | “Pending physician review” on repeat blocks |
| 9 | **Footer single template** via `seo-build.mjs` | 6 | 3 | **2.00** | 3 footer variants detected |
| 10 | Service hero **min-height tokens** (ADHD / weight / telehealth alignment) | 6 | 3 | **2.00** | ~630–650px variance on services |
| 11 | Blog/article hero **height tokens** separate from hub index | 5 | 3 | **1.67** | Blog heroes ~126–493px |
| 12 | **Health Guides hub** exit CTA matches service pages (Book + Explore) | 6 | 4 | **1.50** | Conversion parity |
| 13 | Link new sleep/brain-fog guides from **ADHD + fatigue cornerstones** after deploy | 7 | 5 | **1.40** | 404 breaks content cluster trust |
| 14 | **Related Health Guides** block on remaining blogs without it | 6 | 4 | **1.50** | Post-`blog:consistency` deploy |
| 15 | **Alt text** on homepage + service hero images (3 each) | 4 | 2 | **2.00** | Missing `alt` on production |
| 16 | Diversify **repeated telehealth stock** imagery by service line | 5 | 5 | **1.00** | Same hero feel across lines |
| 17 | **H1 spacing** design tokens (blog vs answers vs service) | 4 | 3 | **1.33** | Minor rhythm |
| 18 | **Button radius/padding** audit on `.button` variants | 5 | 4 | **1.25** | Secondary vs primary CTAs |
| 19 | Defer **chat widget** until scroll on mobile | 6 | 5 | **1.20** | Manual verify LeadConnector |
| 20 | Raise chat **bottom offset** above sticky mobile CTAs | 6 | 4 | **1.50** | Prevent tap overlap |
| 21 | **Blog hub** category nav sticky offset (tablet) | 4 | 3 | **1.33** | Tablet screenshots |
| 22 | Remove any remaining **“Clinical Answers”** / **“Answers”** nav labels | 5 | 2 | **2.50** | Repo fixed; confirm post-deploy |
| 23 | **Meet & Greet** pricing clarity on service CTAs (one line, same wording) | 7 | 6 | **1.17** | Reduces booking anxiety |
| 24 | **Provider photos** consistent aspect ratio on cards | 5 | 5 | **1.00** | Perceived quality |
| 25 | Post-deploy **production re-audit** (this script) in CI optional step | 6 | 3 | **2.00** | Prevent regression |

---

## Sprint recommendation (1 deploy)

1. Merge + deploy `seo-repositioning-metabolic-foundation` (or main) with:
   - `npm run consistency:apply`
   - `npm run blog:consistency:apply`
   - `npm run build`
2. Verify production:
   - `curl -I https://siya.health/answers/poor-sleep-feels-like-adhd` → **200**
   - `aside.clinical-review` count = **1** on `blog/adhd-symptoms-overlooked`
   - ADHD care shows **“Book a Meet & Greet”** and **California** in licensing line

---

## Detected production issues (verbatim priority)

| Severity | URL | Issue |
|----------|-----|-------|
| Critical | `/answers/poor-sleep-feels-like-adhd` | 404 |
| Critical | `/answers/brain-fog-after-eating` | 404 |
| High | `/blog/adhd-symptoms-overlooked` | 14× clinical review |
| High | 15 legacy medication/state blogs | 14× clinical review each |
| High | 5 cornerstone blogs | 2× clinical review |
| High | 18 Health Guides | 2× clinical review |
| Medium | `/adhd-care`, `/weight-loss-metabolic-health`, `/telehealth` | Schedule Meet & Greet |
| Medium | `/adhd-care` | State list missing California in body |

---

## Out of scope

- Lighthouse / Core Web Vitals
- Meta title length
- JSON-LD richness
- Times New Roman on unstyled DOM nodes (not user-visible body copy)
