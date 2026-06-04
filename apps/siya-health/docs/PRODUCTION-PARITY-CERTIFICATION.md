# Production parity certification

**Site:** https://www.siya.health  
**Branch target:** `main` (latest audited parity sprint)  
**Certified at:** 2026-06-04T12:15:25.583Z  
**Overall:** **PASS**

Target state display: `California • Texas • Pennsylvania • Florida` or prose `California, Texas, Pennsylvania, and Florida`

## Success criteria

| Criterion | Result |
|-----------|--------|
| Tier-1 guides HTTP 200 | PASS |
| 1 review per blog (sample) | PASS |
| 1 review per Health Guide (sample) | PASS |
| 0 review on hubs (sample) | PASS |
| ≤1 cta-band per blog (sample) | PASS |
| 0 Schedule Meet & Greet | PASS |
| Book a Meet & Greet present | PASS |
| California in state lists | PASS |
| Health Guides in navigation | PASS |

## Check log

| Check | Pass | URL | Detail |
|-------|:----:|-----|--------|
| 404-/answers/poor-sleep-feels-like-adhd | ✓ | https://www.siya.health/answers/poor-sleep-feels-like-adhd | HTTP 200 |
| 404-/answers/brain-fog-after-eating | ✓ | https://www.siya.health/answers/brain-fog-after-eating | HTTP 200 |
| review-blog-/blog/adhd-symptoms-overlooked | ✓ | https://www.siya.health/blog/adhd-symptoms-overlooked | 1 clinical-review blocks |
| cta-blog-/blog/adhd-symptoms-overlooked | ✓ | https://www.siya.health/blog/adhd-symptoms-overlooked | 1 cta-band blocks |
| schedule-blog-/blog/adhd-symptoms-overlooked | ✓ | https://www.siya.health/blog/adhd-symptoms-overlooked | 0 Schedule Meet CTAs |
| book-blog-/blog/adhd-symptoms-overlooked | ✓ | https://www.siya.health/blog/adhd-symptoms-overlooked | 4 Book a Meet CTAs |
| review-blog-/blog/food-noise-and-glp-1-what-it-means-and-what-helps | ✓ | https://www.siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps | 1 clinical-review blocks |
| cta-blog-/blog/food-noise-and-glp-1-what-it-means-and-what-helps | ✓ | https://www.siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps | 1 cta-band blocks |
| schedule-blog-/blog/food-noise-and-glp-1-what-it-means-and-what-helps | ✓ | https://www.siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps | 0 Schedule Meet CTAs |
| book-blog-/blog/food-noise-and-glp-1-what-it-means-and-what-helps | ✓ | https://www.siya.health/blog/food-noise-and-glp-1-what-it-means-and-what-helps | 5 Book a Meet CTAs |
| review-blog-/blog/glp1-side-effects-and-how-to-manage-them | ✓ | https://www.siya.health/blog/glp1-side-effects-and-how-to-manage-them | 1 clinical-review blocks |
| cta-blog-/blog/glp1-side-effects-and-how-to-manage-them | ✓ | https://www.siya.health/blog/glp1-side-effects-and-how-to-manage-them | 1 cta-band blocks |
| schedule-blog-/blog/glp1-side-effects-and-how-to-manage-them | ✓ | https://www.siya.health/blog/glp1-side-effects-and-how-to-manage-them | 0 Schedule Meet CTAs |
| book-blog-/blog/glp1-side-effects-and-how-to-manage-them | ✓ | https://www.siya.health/blog/glp1-side-effects-and-how-to-manage-them | 4 Book a Meet CTAs |
| review-guide-/answers/signs-of-adult-adhd | ✓ | https://www.siya.health/answers/signs-of-adult-adhd | 1 clinical-review blocks |
| review-guide-/answers/what-is-insulin-resistance | ✓ | https://www.siya.health/answers/what-is-insulin-resistance | 1 clinical-review blocks |
| review-hub-/ | ✓ | https://www.siya.health/ | 0 clinical-review on hub |
| states-/ | ✓ | https://www.siya.health/ | CA=true inline=true bullet=false |
| book-/ | ✓ | https://www.siya.health/ | 7 Book a Meet CTAs |
| schedule-/ | ✓ | https://www.siya.health/ | 0 Schedule Meet CTAs |
| nav-guides-/ | ✓ | https://www.siya.health/ | Health Guides in nav |
| review-hub-/answers | ✓ | https://www.siya.health/answers | 0 clinical-review on hub |
| nav-guides-/answers | ✓ | https://www.siya.health/answers | Health Guides in nav |
| review-hub-/blog | ✓ | https://www.siya.health/blog | 0 clinical-review on hub |
| nav-guides-/blog | ✓ | https://www.siya.health/blog | Health Guides in nav |
| review-hub-/adhd-care | ✓ | https://www.siya.health/adhd-care | 0 clinical-review on hub |
| states-/adhd-care | ✓ | https://www.siya.health/adhd-care | CA=true inline=true bullet=true |
| book-/adhd-care | ✓ | https://www.siya.health/adhd-care | 2 Book a Meet CTAs |
| schedule-/adhd-care | ✓ | https://www.siya.health/adhd-care | 0 Schedule Meet CTAs |
| review-hub-/telehealth | ✓ | https://www.siya.health/telehealth | 0 clinical-review on hub |

## Notes

Production matches audited branch for all sampled gates. Full-site visual audit: `node scripts/production-visual-audit.mjs`.

