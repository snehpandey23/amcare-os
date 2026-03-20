# Shadow SEO layer (Siya Health)

**What this is:** Extra HTML landing pages for search intent and geography. They are **indexed** and listed in **`sitemap.xml`**. They are **not** added to the main header navigation.

**Where:** Root-level `*.html` files (e.g. `adhd-diagnosis-florida.html` → `/adhd-diagnosis-florida` on Vercel with `cleanUrls`).

**Internal links:** SEO pages include a small **Resources** footer column linking to other SEO URLs only. **Main site pages** (`index.html`, `adhd-care.html`, etc.) are unchanged—no extra Resources column unless you add it deliberately.

**Regenerate pages:**  
`python3 scripts/generate_seo_shadow_pages.py`

**URLs list:** `seo-generated-urls.txt` (also reflected in `sitemap.xml`).

**Quality:** Add unique FAQs and local copy when scaling; avoid thin/duplicate doorway pages.

---

## Blog content hub (separate from shadow pages)

**Hub:** `/blog` — featured posts, category blocks, `?category=adhd|weight-loss|telehealth` scrolls to sections on the same page.

**Indexable category listings (unique titles/meta):** `/blog/adhd`, `/blog/weight-loss`, `/blog/telehealth`, `/blog/all`.

**New medication education posts:** Regenerate or extend with `python3 scripts/generate_medication_blog_posts.py` (outputs HTML under `blog/`).

**Weight loss + general telehealth medication series:** `python3 scripts/generate_weight_telehealth_blogs.py` (content in `scripts/weight_telehealth_posts_data.py`).
