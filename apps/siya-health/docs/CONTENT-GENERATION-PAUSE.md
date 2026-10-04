# Educational content generation — PAUSED

**Status:** `paused: true` as of **2026-10-04**  
**Flag:** `data/CONTENT-GENERATION-PAUSE.json`

## What this stops

Scripts that auto-write educational HTML under `answers/`, `blog/`, related entity pages, and supporting cluster publishers. While paused they exit immediately and write nothing. They are also **removed from** `npm run build` / Vercel `buildCommand`.

| Script | Former trigger | Now |
|--------|----------------|-----|
| `generate-answer-pages.mjs` | Every Vercel build + manual | Paused (gate + out of build) |
| `generate-workplace-blog-posts.mjs` | Every Vercel build + manual | Paused |
| `generate_medication_blog_posts.py` | Manual only | Paused (gate) |
| `generate_weight_telehealth_blogs.py` | Manual only | Paused (gate) |
| `publish-california-adhd-blog.mjs` (+ data modules) | Manual only | Paused (publisher gated; data kept) |
| `generate-brain-fog-entity-page.mjs` | Every Vercel build + `entity:brain-fog` | Paused |
| `generate-fatigue-entity-page.mjs` | Every Vercel build + npm alias | Paused |
| `generate-preventive-care-entity-page.mjs` | Every Vercel build + npm alias | Paused |
| `generate-primary-care-entity-page.mjs` | Every Vercel build + npm alias | Paused |
| `generate-california-adhd-cornerstone.mjs` | Every Vercel build + npm alias | Paused |
| `generate-adhd-evaluation-california.mjs` | Every Vercel build | Paused |
| `generate-labs-pages.mjs` | Every Vercel build | Paused |
| `generate-adhd-city-pages.mjs` | Manual only | Paused |
| `publish-supporting-cluster-batch{1,2}.mjs` | Manual / npm `cluster:batch*` | Paused |
| `generate_seo_shadow_pages.py` | Manual only | Paused |
| `patch_existing_blog_seo.py` | Manual only | Paused |

No GitHub Actions cron, Vercel cron, or crontab was publishing these. The only recurring Siya LaunchAgent found (`com.siya.eod-fuse`) is brand WorkDrive fuse — not site HTML generation — left running.

## What this does not stop

Product/chrome generators (redirects, legal, providers, pricing, careers, employers, intake, SEO chrome, validators). Deploy still runs `npm run build` for those.

## Resume

1. Set `"paused": false` in `data/CONTENT-GENERATION-PAUSE.json`, restore the generator steps in `package.json` `build` / npm aliases, **or**
2. One intentional run: `SIYA_ALLOW_CONTENT_GENERATION=1 node scripts/<generator>.mjs`

Do not delete generators or seed data to “pause” them.
