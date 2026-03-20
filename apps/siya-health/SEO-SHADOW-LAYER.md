# Shadow SEO layer (Siya Health)

**What this is:** Extra HTML landing pages for search intent and geography. They are **indexed** and listed in **`sitemap.xml`**. They are **not** added to the main header navigation.

**Where:** Root-level `*.html` files (e.g. `adhd-diagnosis-florida.html` → `/adhd-diagnosis-florida` on Vercel with `cleanUrls`).

**Internal links:** SEO pages include a small **Resources** footer column linking to other SEO URLs only. **Main site pages** (`index.html`, `adhd-care.html`, etc.) are unchanged—no extra Resources column unless you add it deliberately.

**Regenerate pages:**  
`python3 scripts/generate_seo_shadow_pages.py`

**URLs list:** `seo-generated-urls.txt` (also reflected in `sitemap.xml`).

**Quality:** Add unique FAQs and local copy when scaling; avoid thin/duplicate doorway pages.
